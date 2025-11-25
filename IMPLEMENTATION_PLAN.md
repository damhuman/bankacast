# ETH + USDC Support Implementation Plan

**Goal:** Add ETH support alongside existing USDC. Each vault supports ONE token (chosen at creation).

**Timeline:** 3-4 days
**Status:** Ready to implement

---

## 🎯 OVERVIEW

### What We're Building
- Users select token type (ETH or USDC) when creating vault
- Each vault handles ONE token only (no mixing)
- ETH contributions wrap to WETH for Aave compatibility
- Smart contracts validate token support and handle wrapping/unwrapping
- Backend stores and displays token info correctly
- Frontend shows token-specific UI and handles different decimal formats

### Architecture Decisions
1. **One Token Per Vault** - Simplifies accounting, clearer UX, easier yield tracking
2. **WETH Wrapping** - Aave V3 requires WETH, not native ETH (wrap on deposit, unwrap on withdraw)
3. **Token Whitelist** - Factory validates supported tokens (prevents unknown/malicious tokens)
4. **ETH + USDC Only** - Focus on two tokens for Sepolia testnet
5. **No Legacy Support** - Clean implementation, old USDC-only vaults are separate

### Token Configuration (Base Sepolia)
- **ETH**: `0x0000000000000000000000000000000000000000` (18 decimals) → wraps to WETH
- **WETH**: `0x4200000000000000000000000000000000000006` (18 decimals)
- **USDC**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (6 decimals)

---

## 📁 FILES TO CREATE

### 1. contracts/src/interfaces/IWETH.sol (NEW)
```solidity
interface IWETH {
    function deposit() external payable;
    function withdraw(uint256) external;
    function balanceOf(address) external view returns (uint256);
}
```

**Purpose:** Interface for interacting with Wrapped ETH contract for deposit/withdraw operations.

---

## 📝 FILES TO MODIFY

### 2. contracts/src/Vault.sol

#### State Changes
**REMOVE:**
```solidity
address public usdc;
address public aUsdc;
```

**ADD:**
```solidity
address public token;           // address(0) for ETH, ERC20 address for USDC
uint8 public tokenDecimals;     // 6 for USDC, 18 for ETH
address public aToken;          // Generic Aave aToken (was aUsdc)
address public constant WETH = 0x4200000000000000000000000000000000000006;
```

#### Modified Functions

**initialize(address _creator, uint256 _goalAmount, string _metadataURI, string _description, address _aavePool, address _token, uint8 _tokenDecimals)**
- Replaces hardcoded `usdc` parameter with `_token` and `_tokenDecimals`
- Stores token configuration in vault state
- Validates decimals are 6 or 18

**contribute(uint256 amount) external payable**
- Made `payable` to accept ETH
- If `token == address(0)`: validates `msg.value == amount`, wraps ETH→WETH via `IWETH(WETH).deposit{value: amount}()`
- If `token != address(0)`: validates `msg.value == 0`, transfers ERC20 from contributor
- Deposits wrapped token (WETH or ERC20) to Aave
- Sets `aToken` address on first deposit
- Emits Contributed event with yield info

**withdraw() external onlyCreator**
- If ETH vault: withdraws WETH from Aave → unwraps to ETH → sends ETH to creator
- If ERC20 vault: withdraws token from Aave directly to creator
- Emits Withdrawn event with principal/yield breakdown

**smash() external onlyCreator**
- Same ETH unwrapping logic as withdraw()
- Allows early withdrawal before goal reached
- Emits Smashed event

**receive() external payable**
- NEW function to accept ETH when unwrapping WETH
- Only accepts ETH from WETH contract (security check)

**getTokenInfo() external view returns (address, uint8, string)**
- NEW function returning token address, decimals, symbol
- Returns "ETH" symbol if token == address(0), otherwise returns "USDC" or queries ERC20

#### View Functions (no major changes, use generic `aToken`)
- getCurrentAPY(): Uses `token` instead of `usdc` for Aave reserve data
- getCurrentBalance(): Uses `aToken` balance
- getYieldStats(): Uses `aToken` balance

---

### 3. contracts/src/VaultFactory.sol

#### State Changes
**REMOVE:**
```solidity
address public immutable usdc;
```

**ADD:**
```solidity
address public constant WETH = 0x4200000000000000000000000000000000000006;
address public immutable usdc;  // Keep for whitelist
mapping(address => TokenInfo) public supportedTokens;  // NEW

struct TokenInfo {
    bool supported;
    uint8 decimals;
    string symbol;
}
```

#### Modified Functions

**constructor(address _vaultImplementation, address _aavePool, address _usdc)**
- Initialize supportedTokens mapping:
  - `supportedTokens[address(0)] = TokenInfo(true, 18, "ETH")`
  - `supportedTokens[_usdc] = TokenInfo(true, 6, "USDC")`

**createVault(uint256 _goalAmount, string _metadataURI, string _description, address _token, uint8 _tokenDecimals) returns (address)**
- Add `_token` and `_tokenDecimals` parameters
- Validate `supportedTokens[_token].supported == true`
- Validate `_tokenDecimals` matches `supportedTokens[_token].decimals`
- Pass token info to vault.initialize()
- Emit updated VaultCreated event with token fields

**VaultCreated event**
- ADD fields: `address indexed token`, `uint8 tokenDecimals`

#### New Errors
```solidity
error UnsupportedToken();
error InvalidDecimals();
```

---

### 4. contracts/script/Deploy.s.sol

**Deploy() function modifications:**
- Add WETH/USDC address constants for Base Sepolia
- Pass token addresses to VaultFactory constructor
- Log deployed addresses for backend configuration
- Verify contracts on BaseScan

---

### 5. backend/models.py

#### Vault Model Changes
**ADD columns:**
```python
token = Column(String(42), nullable=False, index=True)
decimals = Column(Integer, nullable=False)
token_symbol = Column(String(10), nullable=False)
```

**Update comments:**
- Change `# USDC with 6 decimals` to `# Amount in token's native decimals`

---

### 6. backend/event_listener.py

#### New Constants
```python
ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
WETH_ADDRESS = "0x4200000000000000000000000000000000000006"
USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
```

#### Update VAULT_FACTORY_ABI
- Add `token` and `tokenDecimals` fields to VaultCreated event

#### New Functions

**get_token_symbol(token_address: str) -> tuple[str, int]**
- Maps token address to (symbol, decimals)
- Returns ("ETH", 18) for address(0)
- Returns ("USDC", 6) for USDC address
- Returns ("WETH", 18) for WETH address

**handle_vault_created(event)**
- Parse `token` and `tokenDecimals` from event args
- Call `get_token_symbol()` to get symbol
- Store token, decimals, token_symbol in Vault model

**handle_contribution(event, vault_address, db)**
- Update formatting to use vault's decimal count (not hardcoded 1e6)
- `amount / (10 ** vault.decimals)` for logging

---

### 7. backend/main.py

#### Update Pydantic Models

**VaultResponse schema:**
```python
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
```

#### Helper Functions

**format_amount(amount_wei: int, decimals: int) -> str**
- NEW function to format amounts based on token decimals
- `return str(amount_wei / (10 ** decimals))`

---

### 8. frontend/app/create/page.tsx

#### New State
```typescript
const [selectedToken, setSelectedToken] = useState<'USDC' | 'ETH'>('USDC');
```

#### New Constants
```typescript
const TOKEN_CONFIG = {
  USDC: {
    address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    decimals: 6,
    symbol: 'USDC',
    icon: '💵',
    name: 'USD Coin'
  },
  ETH: {
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    symbol: 'ETH',
    icon: '⟠',
    name: 'Ethereum'
  }
} as const;
```

#### Update FACTORY_ABI
- Add token and tokenDecimals parameters to createVault function signature

#### New UI Section (before goal amount)
- Token selector with 2 buttons (ETH/USDC)
- Shows icon, symbol, and name for each token
- Highlights selected token with border/background color

#### Modified Functions

**handleSubmit(e)**
- Get selected token config: `const config = TOKEN_CONFIG[selectedToken]`
- Use dynamic decimals: `parseUnits(goalAmount, config.decimals)`
- Pass token params to createVault:
  ```typescript
  args: [goalAmountWei, `db://${title}`, description, config.address, config.decimals]
  ```

---

### 9. frontend/app/vault/[id]/page.tsx

#### Update Vault Interface
```typescript
interface Vault {
  // ... existing fields
  token: string;           // NEW
  decimals: number;        // NEW
  token_symbol: string;    // NEW
}
```

#### Modified Functions

**formatAmount(wei: number)**
- Change from hardcoded `wei / 1e6` to `wei / (10 ** vault.decimals)`
- Add parameter: `formatAmount(wei: number, decimals: number)`

#### UI Updates
- Display token symbol/icon next to vault title
- Update all amount displays to use dynamic decimals
- Show token symbol in stat cards (e.g., "Goal Amount: 1 ETH" vs "100 USDC")

---

### 10. frontend/components/ContributeModal.tsx

#### Update Props Interface
```typescript
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
```

#### Update VAULT_ABI
- Add `payable` modifier to contribute function

#### Modified Logic

**handleContribute()**
- If `tokenSymbol === 'ETH'`:
  - Skip approval step
  - Call contribute with `value: amountWei`
- Else (ERC20):
  - Step 1: Approve token spending
  - Step 2: Call contribute (no value)

**Amount parsing:**
- Use `parseUnits(amount, decimals)` instead of hardcoded 6

**UI Labels:**
- Change "Amount to contribute (USDC)" to `Amount to contribute (${tokenSymbol})`
- Update button text to show token symbol

---

### 11. frontend/app/discover/page.tsx

#### Update Vault Card Display
- Show token icon (⟠ for ETH, 💵 for USDC)
- Format amounts using vault.decimals
- Display token symbol next to amounts

---

## 🔄 IMPLEMENTATION ORDER

### Phase 1: Smart Contracts (Day 1)
1. Create `contracts/src/interfaces/IWETH.sol`
2. Modify `contracts/src/Vault.sol` (state + functions)
3. Modify `contracts/src/VaultFactory.sol` (add token support)
4. Update `contracts/script/Deploy.s.sol`
5. Write Foundry tests for ETH and USDC vaults
6. Deploy to Base Sepolia testnet
7. Verify contracts on BaseScan

### Phase 2: Backend (Day 2)
1. Add columns to `backend/models.py`
2. Create database migration script
3. Run migration on dev database
4. Update `backend/event_listener.py` (event parsing, token resolution)
5. Update `backend/main.py` (response schemas)
6. Start event listener, verify it indexes new vaults correctly

### Phase 3: Frontend (Day 2-3)
1. Update `frontend/app/create/page.tsx` (token selector UI)
2. Update `frontend/app/vault/[id]/page.tsx` (display token info)
3. Update `frontend/components/ContributeModal.tsx` (conditional approval)
4. Update `frontend/app/discover/page.tsx` (token icons)
5. Update `.env.local` with new factory address
6. Test on Base Sepolia with real transactions

### Phase 4: Integration Testing (Day 3-4)
1. Create ETH vault → contribute ETH → verify WETH wrapping → withdraw → verify unwrapping
2. Create USDC vault → contribute USDC → verify Aave deposit → withdraw
3. Test edge cases:
   - Send ETH to USDC vault (should revert)
   - Send USDC to ETH vault (should revert)
   - Try unsupported token (should revert)
   - Test decimal formatting (6 vs 18)
4. Verify event listener indexes both vault types correctly
5. Check database stores token info correctly
6. Test Farcaster Frames integration

---

## ✅ SUCCESS CRITERIA

- [ ] Users can create vaults in ETH or USDC
- [ ] Token selector UI is intuitive and clear
- [ ] ETH contributions automatically wrap to WETH
- [ ] ETH withdrawals automatically unwrap to native ETH
- [ ] All amounts display with correct decimal precision (6 vs 18)
- [ ] Contribute flow handles ETH (no approval) vs USDC (approval required)
- [ ] Database stores token, decimals, symbol correctly
- [ ] Event listener parses new multi-token events
- [ ] Vault cards show token icon/symbol prominently
- [ ] Aave integration works for both ETH and USDC
- [ ] Gas costs are reasonable (~50k extra for ETH wrapping)

---

## 🚨 CRITICAL IMPLEMENTATION NOTES

1. **WETH Wrapping Security**
   - Always verify `msg.sender == WETH` in receive() function
   - Never accept arbitrary ETH to prevent stuck funds

2. **Decimal Precision**
   - USDC: 6 decimals ($1 = 1000000)
   - ETH/WETH: 18 decimals (1 ETH = 1000000000000000000)
   - Frontend must use correct decimals in parseUnits/formatUnits
   - Backend must format amounts correctly for display

3. **Token Validation**
   - Factory MUST validate token is in whitelist
   - Factory MUST validate decimals match token
   - Prevents malicious/unknown tokens from being used

4. **Aave V3 Support**
   - Verify WETH and USDC are supported on Base Sepolia Aave V3
   - Check liquidity before deploying to mainnet
   - Test APY fetching works for both tokens

5. **Testing Checklist**
   - [ ] ETH vault: create → contribute (wraps) → withdraw (unwraps)
   - [ ] USDC vault: create → contribute → withdraw
   - [ ] Try send ETH to USDC vault (must revert)
   - [ ] Try send USDC to ETH vault (must revert)
   - [ ] Verify decimal formatting in UI (6 vs 18)
   - [ ] Test Aave yields for both token types
   - [ ] Check event listener indexes both token types
   - [ ] Verify database stores token info correctly

---

## 📊 TOKEN ADDRESSES (Base Sepolia)

- ✅ USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- ✅ WETH: `0x4200000000000000000000000000000000000006`
- ✅ Aave Pool: `0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b`

---

## 🎯 NEXT STEPS

1. ✅ Plan reviewed and approved
2. Start Phase 1: Smart contract modifications
3. Set up test environment with Base Sepolia faucet
4. Proceed sequentially through phases

**Estimated Total Time:** 3-4 days for full implementation and testing
