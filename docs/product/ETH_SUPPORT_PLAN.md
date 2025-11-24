# ETH Support Implementation Plan

## Executive Summary
Add native ETH support alongside existing USDC functionality, allowing vault creators to choose their preferred token. Each vault will support ONE token type (either ETH or USDC), chosen at creation.

---

## Architecture Decision: One Token Per Vault

**Chosen Approach:** Each vault supports exactly ONE token (ETH or USDC)
- Vault creator selects token at creation time
- Token cannot be changed after vault creation
- Contributors must use the vault's designated token
- Simpler accounting, clearer goals, better UX

**Why not multi-token vaults?**
- Complex accounting (mixing 6 and 18 decimals)
- Confusing goals (goal in ETH or USDC?)
- Difficult yield calculations
- Poor UX (which token should I contribute?)

---

## 1. SMART CONTRACT CHANGES

### 1.1 Key Technical Decisions

**WETH Integration:**
- Native ETH → WETH (wrapped) → Aave V3
- Aave V3 doesn't accept native ETH, only WETH
- WETH address on Base: `0x4200000000000000000000000000000000000006`
- Need IWETH interface for deposit()/withdraw()

**Decimal Handling:**
- USDC: 6 decimals
- ETH/WETH: 18 decimals
- Store decimals in contract for validation

---

### 1.2 Vault.sol Changes

#### New State Variables
```solidity
address public token;           // address(0) for ETH, or ERC20 address
uint8 public tokenDecimals;     // 6 for USDC, 18 for ETH
address public constant WETH = 0x4200000000000000000000000000000000000006;
address public aToken;          // Renamed from aUsdc (now generic)
```

#### Updated Initialize Function
```solidity
function initialize(
    address _creator,
    uint256 _goalAmount,
    string calldata _metadataURI,
    string calldata _description,
    address _aavePool,
    address _token,        // NEW: address(0) for ETH, or token address
    uint8 _tokenDecimals   // NEW: 6 or 18
) external initializer
```

#### Enhanced Contribute Function
```solidity
function contribute(uint256 amount) external payable notWithdrawn {
    if (amount == 0) revert InvalidAmount();

    address depositToken;

    // Handle ETH vs ERC20
    if (token == address(0)) {
        // ETH vault
        if (msg.value != amount) revert InvalidAmount();

        // Wrap ETH to WETH
        IWETH(WETH).deposit{value: amount}();
        depositToken = WETH;
    } else {
        // ERC20 vault
        if (msg.value != 0) revert InvalidAmount(); // No ETH should be sent

        // Transfer ERC20 from contributor
        if (!IERC20(token).transferFrom(msg.sender, address(this), amount)) {
            revert TransferFailed();
        }
        depositToken = token;
    }

    // Track contribution (same for both)
    if (!_isContributor[msg.sender]) {
        contributors.push(msg.sender);
        _isContributor[msg.sender] = true;
    }
    contributions[msg.sender] += amount;
    totalContributed += amount;

    // Deposit to Aave
    IERC20(depositToken).approve(aavePool, amount);
    IPool(aavePool).supply(depositToken, amount, address(this), 0);

    // Get aToken address if first deposit
    if (aToken == address(0)) {
        aToken = IPool(aavePool).getReserveData(depositToken).aTokenAddress;
    }

    // Calculate and emit yield
    uint256 currentYield = aToken != address(0)
        ? (IERC20(aToken).balanceOf(address(this)) > totalContributed
            ? IERC20(aToken).balanceOf(address(this)) - totalContributed
            : 0)
        : 0;

    emit Contributed(msg.sender, amount, totalContributed, currentYield, block.timestamp);
}
```

#### Enhanced Withdraw Function
```solidity
function withdraw() external onlyCreator notWithdrawn {
    if (totalContributed < goalAmount) revert GoalNotReached();

    isWithdrawn = true;

    // Withdraw from Aave
    uint256 aTokenBalance = IERC20(aToken).balanceOf(address(this));
    address withdrawToken = token == address(0) ? WETH : token;

    if (token == address(0)) {
        // ETH vault: withdraw WETH to contract, unwrap, send ETH
        IPool(aavePool).withdraw(WETH, aTokenBalance, address(this));
        IWETH(WETH).withdraw(aTokenBalance);

        (bool success, ) = creator.call{value: aTokenBalance}("");
        if (!success) revert TransferFailed();
    } else {
        // ERC20 vault: withdraw directly to creator
        IPool(aavePool).withdraw(token, aTokenBalance, creator);
    }

    uint256 principal = totalContributed;
    uint256 yield = aTokenBalance > principal ? aTokenBalance - principal : 0;

    emit Withdrawn(creator, principal, yield, aTokenBalance, block.timestamp);
}
```

#### New Functions
```solidity
// Accept ETH for unwrapping WETH
receive() external payable {
    // Only accept ETH from WETH contract
    require(msg.sender == WETH, "Only WETH");
}

// Get token info
function getTokenInfo() external view returns (
    address tokenAddress,
    uint8 decimals,
    string memory symbol
) {
    tokenAddress = token;
    decimals = tokenDecimals;
    symbol = token == address(0) ? "ETH" : "USDC"; // Could fetch from ERC20
}
```

#### Updated View Functions
- `getCurrentAPY()`: Use generic `token` instead of hardcoded `usdc`
- All balance functions: Work with generic `aToken` instead of `aUsdc`

---

### 1.3 VaultFactory.sol Changes

#### New State Variables
```solidity
address public constant WETH = 0x4200000000000000000000000000000000000006;
mapping(address => bool) public supportedTokens; // Whitelist
```

#### Constructor Update
```solidity
constructor(address _vaultImplementation, address _aavePool, address _usdc) {
    vaultImplementation = _vaultImplementation;
    aavePool = _aavePool;
    usdc = _usdc;

    // Whitelist supported tokens
    supportedTokens[address(0)] = true;  // ETH
    supportedTokens[_usdc] = true;        // USDC
    supportedTokens[WETH] = true;         // WETH (for future)
}
```

#### Updated createVault Function
```solidity
function createVault(
    uint256 _goalAmount,
    string calldata _metadataURI,
    string calldata _description,
    address _token,        // NEW: address(0) for ETH, or token address
    uint8 _tokenDecimals   // NEW: 6 or 18
) external returns (address vault) {
    // Validation
    if (_goalAmount == 0) revert InvalidGoalAmount();
    if (bytes(_metadataURI).length == 0) revert InvalidMetadata();
    if (!supportedTokens[_token]) revert UnsupportedToken();
    if (_tokenDecimals != 6 && _tokenDecimals != 18) revert InvalidDecimals();

    // Validate token-decimal pairing
    if (_token == address(0) && _tokenDecimals != 18) revert InvalidDecimals();
    if (_token == usdc && _tokenDecimals != 6) revert InvalidDecimals();

    // Deploy minimal proxy clone
    vault = Clones.clone(vaultImplementation);

    // Initialize the vault
    Vault(vault).initialize(
        msg.sender,
        _goalAmount,
        _metadataURI,
        _description,
        aavePool,
        _token,
        _tokenDecimals
    );

    // Track vault
    uint256 vaultIndex = allVaults.length;
    allVaults.push(vault);
    userVaults[msg.sender].push(vault);
    isVault[vault] = true;

    emit VaultCreated(
        vault,
        msg.sender,
        _goalAmount,
        _metadataURI,
        _description,
        _token,          // NEW in event
        _tokenDecimals,  // NEW in event
        block.timestamp,
        vaultIndex
    );

    return vault;
}
```

#### Updated Event
```solidity
event VaultCreated(
    address indexed vault,
    address indexed creator,
    uint256 goalAmount,
    string metadataURI,
    string description,
    address token,         // NEW
    uint8 tokenDecimals,   // NEW
    uint256 timestamp,
    uint256 vaultIndex
);
```

#### New Errors
```solidity
error UnsupportedToken();
error InvalidDecimals();
```

---

### 1.4 New Interface: IWETH.sol
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IWETH {
    function deposit() external payable;
    function withdraw(uint256) external;
    function approve(address, uint256) external returns (bool);
    function transfer(address, uint256) external returns (bool);
    function transferFrom(address, address, uint256) external returns (bool);
    function balanceOf(address) external view returns (uint256);
}
```

---

## 2. BACKEND CHANGES

### 2.1 Database Schema Migration

```sql
-- Add token fields to vaults table
ALTER TABLE vaults ADD COLUMN token VARCHAR(42);
ALTER TABLE vaults ADD COLUMN decimals INTEGER DEFAULT 6;
ALTER TABLE vaults ADD COLUMN token_symbol VARCHAR(10) DEFAULT 'USDC';

-- Update existing vaults to USDC
UPDATE vaults
SET token = '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    decimals = 6,
    token_symbol = 'USDC'
WHERE token IS NULL;

-- Make token NOT NULL after migration
ALTER TABLE vaults ALTER COLUMN token SET NOT NULL;
ALTER TABLE vaults ALTER COLUMN decimals SET NOT NULL;
```

### 2.2 models.py Updates

```python
class Vault(Base):
    __tablename__ = "vaults"

    address = Column(String(42), primary_key=True, index=True)
    creator = Column(String(42), nullable=False, index=True)
    goal_amount = Column(BigInteger, nullable=False)
    title = Column(String(255))
    description = Column(Text)

    # NEW FIELDS
    token = Column(String(42), nullable=False, index=True)  # address(0)... or token address
    decimals = Column(Integer, nullable=False, default=6)
    token_symbol = Column(String(10), nullable=False, default='USDC')

    total_contributed = Column(BigInteger, default=0)
    current_balance = Column(BigInteger, default=0)
    yield_earned = Column(BigInteger, default=0)
    apy = Column(Integer, default=0)
    status = Column(String(20), default="active")
    created_at = Column(DateTime)

    # Relationships
    contributions = relationship("Contribution", back_populates="vault")
```

### 2.3 event_listener.py Updates

```python
# Token address mapping
USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
WETH_ADDRESS = "0x4200000000000000000000000000000000000006"
ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

def get_token_info(token_address):
    """Get token symbol and decimals"""
    if token_address == ZERO_ADDRESS:
        return "ETH", 18
    elif token_address.lower() == USDC_ADDRESS.lower():
        return "USDC", 6
    elif token_address.lower() == WETH_ADDRESS.lower():
        return "WETH", 18
    else:
        # Unknown token, try to fetch from contract
        return "UNKNOWN", 18

# Update VaultCreated event handler
def handle_vault_created(event):
    vault_address = event['args']['vault']
    creator = event['args']['creator']
    goal_amount = event['args']['goalAmount']
    metadata_uri = event['args']['metadataURI']
    description = event['args']['description']
    token = event['args']['token']              # NEW
    token_decimals = event['args']['tokenDecimals']  # NEW
    timestamp = event['args']['timestamp']

    # Get token info
    token_symbol, decimals = get_token_info(token)

    # Parse title from metadata
    title = metadata_uri.replace('db://', '')

    # Create vault in database
    vault = Vault(
        address=vault_address,
        creator=creator,
        goal_amount=goal_amount,
        title=title,
        description=description,
        token=token,                    # NEW
        decimals=token_decimals,        # NEW
        token_symbol=token_symbol,      # NEW
        created_at=datetime.fromtimestamp(timestamp)
    )

    db.add(vault)
    db.commit()
```

### 2.4 main.py (API) Updates

```python
# Response schema update
class VaultResponse(BaseModel):
    address: str
    creator: str
    goal_amount: int
    title: str
    description: Optional[str]
    token: str              # NEW
    decimals: int           # NEW
    token_symbol: str       # NEW
    total_contributed: int
    current_balance: int
    yield_earned: int
    apy: int
    progress: float
    status: str
    contributors: List[ContributorResponse]
    created_at: Optional[datetime]

    # Helper methods
    def format_amount(self, amount_wei: int) -> str:
        """Format amount based on token decimals"""
        return str(amount_wei / (10 ** self.decimals))

# No major API endpoint changes needed - schema handles it
```

---

## 3. FRONTEND CHANGES

### 3.1 Environment Variables (.env.local)

```bash
NEXT_PUBLIC_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
NEXT_PUBLIC_WETH_ADDRESS=0x4200000000000000000000000000000000000006
NEXT_PUBLIC_FACTORY_ADDRESS=0x...
```

### 3.2 Create Vault Page Changes

```typescript
// app/create/page.tsx

// Add token selection state
const [selectedToken, setSelectedToken] = useState<'USDC' | 'ETH'>('USDC');

// Token options
const TOKEN_OPTIONS = {
  USDC: {
    address: process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`,
    decimals: 6,
    symbol: 'USDC',
    icon: '💵'
  },
  ETH: {
    address: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    decimals: 18,
    symbol: 'ETH',
    icon: '⟠'
  }
};

// Add token selection UI before goal amount
<div className="mb-8">
  <label className="block text-sm font-semibold text-gray-900 mb-3">
    Savings Token
  </label>
  <div className="grid grid-cols-2 gap-4">
    <button
      type="button"
      onClick={() => setSelectedToken('USDC')}
      className={`p-4 rounded-xl border-2 transition-all ${
        selectedToken === 'USDC'
          ? 'border-primary bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="text-3xl mb-2">💵</div>
      <div className="font-bold">USDC</div>
      <div className="text-xs text-gray-500">Stablecoin</div>
    </button>

    <button
      type="button"
      onClick={() => setSelectedToken('ETH')}
      className={`p-4 rounded-xl border-2 transition-all ${
        selectedToken === 'ETH'
          ? 'border-primary bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="text-3xl mb-2">⟠</div>
      <div className="font-bold">ETH</div>
      <div className="text-xs text-gray-500">Native token</div>
    </button>
  </div>
</div>

// Update goal amount label
<label className="block text-sm font-semibold text-gray-900 mb-3">
  Goal Amount ({selectedToken})
</label>

// Update createVault call
const tokenConfig = TOKEN_OPTIONS[selectedToken];
const goalAmountWei = parseUnits(
  goalAmount,
  tokenConfig.decimals
);

writeContract({
  address: FACTORY_ADDRESS,
  abi: FACTORY_ABI,
  functionName: 'createVault',
  args: [
    goalAmountWei,
    `db://${title}`,
    description,
    tokenConfig.address,    // NEW
    tokenConfig.decimals    // NEW
  ],
});
```

### 3.3 Discover/Vault Card Changes

```typescript
// Show token symbol
<div className="flex items-center gap-2 mb-2">
  <span className="text-2xl">{vault.token_symbol === 'ETH' ? '⟠' : '💵'}</span>
  <span className="text-xs font-semibold text-gray-500">{vault.token_symbol} Vault</span>
</div>

// Format amounts correctly
const formatAmount = (wei: number, decimals: number) => {
  return (wei / (10 ** decimals)).toFixed(decimals === 18 ? 4 : 2);
};

<span className="font-bold text-gray-900">
  ${formatAmount(vault.total_contributed, vault.decimals)} /
  ${formatAmount(vault.goal_amount, vault.decimals)}
</span>
```

### 3.4 ContributeModal Changes

```typescript
// app/components/ContributeModal.tsx

interface ContributeModalProps {
  vaultAddress: string;
  vaultTitle: string;
  goalAmount: number;
  totalContributed: number;
  token: string;          // NEW
  decimals: number;       // NEW
  tokenSymbol: string;    // NEW
  onClose: () => void;
}

// Conditional approval flow
const handleContribute = async () => {
  const amountWei = parseUnits(amount, decimals);

  if (tokenSymbol === 'ETH') {
    // ETH: No approval needed, send with transaction
    writeContract({
      address: vaultAddress as `0x${string}`,
      abi: VAULT_ABI,
      functionName: 'contribute',
      args: [amountWei],
      value: amountWei,  // Send ETH with tx
    });
  } else {
    // USDC: Existing approval flow
    // 1. Approve
    writeContract({
      address: token as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [vaultAddress, amountWei],
    });

    // 2. Wait for approval
    // 3. Contribute
    writeContract({
      address: vaultAddress as `0x${string}`,
      abi: VAULT_ABI,
      functionName: 'contribute',
      args: [amountWei],
    });
  }
};

// Update UI labels
<label>Amount to contribute ({tokenSymbol})</label>
```

---

## 4. TESTING STRATEGY

### 4.1 Smart Contract Tests
```bash
# Test ETH vaults
- Create ETH vault
- Contribute ETH (check WETH wrapping)
- Check Aave deposit
- Withdraw (check WETH unwrapping)
- Smash early

# Test USDC vaults (regression)
- Ensure USDC vaults still work
- No breaking changes

# Test edge cases
- Try to send ETH to USDC vault (should revert)
- Try to send USDC to ETH vault (should revert)
- Try unsupported token (should revert)
```

### 4.2 Integration Tests
- Create both vault types via frontend
- Contribute to both types
- Check database stores token correctly
- Verify event listener parses new fields
- Test amount formatting (6 vs 18 decimals)

### 4.3 E2E Tests
- Full user flow: Create ETH vault → Share → Contribute → Withdraw
- Full user flow: Create USDC vault (existing)
- Test on Base Sepolia before mainnet

---

## 5. DEPLOYMENT PLAN

### Phase 1: Smart Contracts
1. Create IWETH.sol interface
2. Update Vault.sol
3. Update VaultFactory.sol
4. Deploy new VaultImplementation to Base Sepolia
5. Deploy new VaultFactory to Base Sepolia
6. Verify contracts on BaseScan
7. Test with Hardhat/Foundry

### Phase 2: Backend
1. Create database migration script
2. Run migration on dev database
3. Update models.py
4. Update event_listener.py
5. Test event parsing with new contracts
6. Deploy to staging

### Phase 3: Frontend
1. Add token selection UI
2. Update contribute flow
3. Update display formatting
4. Test on Base Sepolia
5. Deploy to production

### Phase 4: Verification
1. Create test ETH vault
2. Contribute ETH
3. Verify Aave integration
4. Withdraw and verify unwrapping
5. Create test USDC vault (ensure backward compatibility)

---

## 6. BACKWARD COMPATIBILITY

**Existing Vaults:**
- Old vaults are USDC-only (no token field in contract)
- Backend migration sets token='USDC', decimals=6
- Frontend displays USDC symbol
- No breaking changes

**New Factory Required:**
- Old factory can't deploy token-aware vaults
- Need to deploy new factory
- Old vaults continue to work independently

---

## 7. RISKS & MITIGATIONS

| Risk | Impact | Mitigation |
|------|--------|------------|
| WETH wrapping fails | High | Thorough testing, use battle-tested WETH contract |
| Decimal confusion (6 vs 18) | High | Strong typing, validation in contracts and frontend |
| User sends wrong token | Medium | Clear UI, contract validation, revert on mismatch |
| Aave doesn't support WETH | Critical | Verify WETH support on Aave V3 Base before deployment |
| Gas costs increase | Low | WETH wrap/unwrap adds ~50k gas, acceptable |
| Old vaults break | Critical | Maintain backward compatibility, thorough testing |

---

## 8. OPEN QUESTIONS

1. **Should we support other tokens later?** (DAI, USDT, etc.)
   - Yes → Design token whitelist system
   - No → Hardcode ETH and USDC only

2. **Display goal amounts in USD equivalent?**
   - Could confuse users with ETH price volatility
   - Recommend keeping native token amounts

3. **Allow contributors to see token type before contributing?**
   - Yes → Display prominently on vault card

4. **What happens if someone force-sends wrong token?**
   - Funds stuck, can't be contributed to Aave
   - Document this risk, clear UI to prevent

---

## 9. IMPLEMENTATION TIME ESTIMATE

- **Smart Contracts:** 2-3 days (development + testing)
- **Backend:** 1-2 days (migration + event listener)
- **Frontend:** 2-3 days (UI + contribute flow)
- **Testing:** 2-3 days (integration + E2E)
- **Deployment:** 1 day (staged rollout)

**Total:** ~8-12 days for full implementation and testing

---

## 10. SUCCESS CRITERIA

✅ Users can create ETH vaults
✅ Users can create USDC vaults (backward compatible)
✅ ETH contributions wrap to WETH and deposit to Aave
✅ Withdrawals unwrap WETH to ETH correctly
✅ Database stores token info correctly
✅ Frontend displays correct token symbols and decimals
✅ All existing USDC vaults continue to work
✅ Event listener parses new token fields
✅ Comprehensive test coverage

---

## NEXT STEPS

Ready to implement? Proceed in this order:
1. Review and approve this plan
2. Start with smart contracts (foundational)
3. Backend migration and updates
4. Frontend integration
5. Comprehensive testing
6. Staged deployment

