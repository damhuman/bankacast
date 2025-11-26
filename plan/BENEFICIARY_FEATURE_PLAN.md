# Beneficiary Feature Implementation Plan

## Overview
Add ability to specify a different wallet address (beneficiary) that receives funds when vault is smashed or withdrawn. This enables donation campaigns, organizational fundraising, and gift vaults.

## Use Cases
1. **Donation campaigns** - Create vault for sick friend, funds go directly to their wallet
2. **Organizational fundraising** - Team lead manages vault, funds go to organization treasury
3. **Gift vaults** - Parents create savings vault for child's birthday
4. **Charitable causes** - Create vault where all funds go to charity wallet

---

## Phase 1: Smart Contract Updates

### 1.1 Modify Vault.sol

**Add state variable:**
```solidity
address public beneficiary; // Who receives funds when vault is broken
```

**Update initialize function:**
```solidity
function initialize(
    address _creator,
    uint256 _goalAmount,
    string calldata _metadataURI,
    string calldata _description,
    address _aavePool,
    address _token,
    uint8 _tokenDecimals,
    address _beneficiary  // NEW: beneficiary parameter
) external initializer {
    creator = _creator;
    goalAmount = _goalAmount;
    metadataURI = _metadataURI;
    description = _description;
    aavePool = _aavePool;
    token = _token;
    tokenDecimals = _tokenDecimals;

    // If beneficiary not specified, creator receives funds
    beneficiary = _beneficiary == address(0) ? _creator : _beneficiary;
}
```

**Update withdraw() function:**
```solidity
function withdraw() external onlyCreator notWithdrawn {
    if (totalContributed < goalAmount) revert GoalNotReached();

    isWithdrawn = true;
    uint256 aTokenBalance = IERC20(aToken).balanceOf(address(this));

    if (token == address(0)) {
        // ETH vault: withdraw to beneficiary
        IPool(aavePool).withdraw(WETH, aTokenBalance, address(this));
        IWETH(WETH).withdraw(aTokenBalance);

        (bool success, ) = beneficiary.call{value: aTokenBalance}("");
        if (!success) revert TransferFailed();
    } else {
        // ERC20 vault: withdraw to beneficiary
        IPool(aavePool).withdraw(token, aTokenBalance, beneficiary);
    }

    uint256 principal = totalContributed;
    uint256 yield = aTokenBalance > principal ? aTokenBalance - principal : 0;

    emit Withdrawn(beneficiary, principal, yield, aTokenBalance, block.timestamp);
}
```

**Update smash() function:**
```solidity
function smash() external onlyCreator notWithdrawn {
    isWithdrawn = true;
    uint256 aTokenBalance = aToken != address(0) ? IERC20(aToken).balanceOf(address(this)) : 0;

    if (aTokenBalance > 0) {
        if (token == address(0)) {
            // ETH vault: send to beneficiary
            IPool(aavePool).withdraw(WETH, aTokenBalance, address(this));
            IWETH(WETH).withdraw(aTokenBalance);

            (bool success, ) = beneficiary.call{value: aTokenBalance}("");
            if (!success) revert TransferFailed();
        } else {
            // ERC20 vault: send to beneficiary
            IPool(aavePool).withdraw(token, aTokenBalance, beneficiary);
        }
    }

    uint256 principal = totalContributed;
    uint256 yield = aTokenBalance > principal ? aTokenBalance - principal : 0;

    emit Smashed(beneficiary, principal, yield, aTokenBalance, block.timestamp);
}
```

**Add view function:**
```solidity
function getBeneficiary() external view returns (address) {
    return beneficiary;
}
```

### 1.2 Update VaultFactory.sol

**Update VaultCreated event:**
```solidity
event VaultCreated(
    address indexed vault,
    address indexed creator,
    uint256 goalAmount,
    string metadataURI,
    string description,
    address indexed token,
    uint8 tokenDecimals,
    address beneficiary,  // NEW field
    uint256 timestamp,
    uint256 vaultIndex
);
```

**Update createVault function:**
```solidity
function createVault(
    uint256 goalAmount,
    string calldata metadataURI,
    string calldata description,
    address token,
    uint8 tokenDecimals,
    address beneficiary  // NEW parameter
) external returns (address vault) {
    // Validate token
    TokenInfo memory tokenInfo = supportedTokens[token];
    if (!tokenInfo.supported) revert UnsupportedToken();
    if (tokenInfo.decimals != tokenDecimals) revert InvalidDecimals();

    // Deploy minimal proxy
    vault = Clones.clone(vaultImplementation);

    // Initialize with beneficiary
    IVault(vault).initialize(
        msg.sender,      // creator
        goalAmount,
        metadataURI,
        description,
        AAVE_POOL,
        token,
        tokenDecimals,
        beneficiary      // beneficiary
    );

    // Track vault
    allVaults.push(vault);
    userVaults[msg.sender].push(vault);

    emit VaultCreated(
        vault,
        msg.sender,
        goalAmount,
        metadataURI,
        description,
        token,
        tokenDecimals,
        beneficiary,
        block.timestamp,
        allVaults.length - 1
    );
}
```

### 1.3 Update IVault interface

```solidity
// contracts/src/interfaces/IVault.sol
interface IVault {
    function initialize(
        address _creator,
        uint256 _goalAmount,
        string calldata _metadataURI,
        string calldata _description,
        address _aavePool,
        address _token,
        uint8 _tokenDecimals,
        address _beneficiary  // NEW
    ) external;

    function getBeneficiary() external view returns (address);
    // ... other functions
}
```

---

## Phase 2: Testing

### 2.1 Unit Tests

```solidity
// contracts/test/Vault.t.sol
function testBeneficiaryReceivesFunds() public {
    address beneficiary = address(0x123);

    // Create vault with beneficiary
    vault.initialize(
        creator,
        1000e6,
        "Test Vault",
        "Description",
        aavePool,
        usdc,
        6,
        beneficiary
    );

    // Contribute
    vm.prank(contributor);
    vault.contribute(1000e6);

    // Withdraw
    vm.prank(creator);
    vault.withdraw();

    // Assert beneficiary received funds (not creator)
    assertGt(usdc.balanceOf(beneficiary), 0);
    assertEq(usdc.balanceOf(creator), 0);
}

function testBeneficiaryDefaultsToCreator() public {
    // Create vault without beneficiary (address(0))
    vault.initialize(
        creator,
        1000e6,
        "Test",
        "Desc",
        aavePool,
        usdc,
        6,
        address(0)  // No beneficiary
    );

    // Assert beneficiary = creator
    assertEq(vault.getBeneficiary(), creator);
}
```

### 2.2 Integration Tests

- Test with ETH vaults
- Test with USDC vaults
- Test smash() sends to beneficiary
- Test withdraw() sends to beneficiary
- Test events emit correct beneficiary address

---

## Phase 3: Frontend Implementation

### 3.1 Create Page UI (`frontend/app/create/page.tsx`)

**Add state:**
```typescript
const [beneficiaryAddress, setBeneficiaryAddress] = useState('');
const [useBeneficiary, setUseBeneficiary] = useState(false);
```

**Add form section:**
```tsx
<div className="mb-8">
    <div className="flex items-center gap-2 mb-3">
        <input
            type="checkbox"
            id="useBeneficiary"
            checked={useBeneficiary}
            onChange={(e) => setUseBeneficiary(e.target.checked)}
            className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="useBeneficiary" className="text-sm font-semibold text-gray-900">
            Send funds to a different address
        </label>
    </div>

    {useBeneficiary && (
        <div className="mt-3">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
                Beneficiary Address
            </label>
            <input
                type="text"
                value={beneficiaryAddress}
                onChange={(e) => setBeneficiaryAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span>💡</span>
                When you smash or withdraw this vault, funds will go to this address instead of yours
            </p>
            <p className="text-xs text-gray-500 mt-1">
                <strong>Use cases:</strong> Donation campaigns, gifts, organizational fundraising
            </p>
        </div>
    )}
</div>
```

**Update submit handler:**
```typescript
const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || chain?.id !== CHAIN_ID) {
        switchChain({ chainId: CHAIN_ID });
        return;
    }

    const tokenConfig = TOKEN_CONFIG[selectedToken];
    const goalAmountWei = parseUnits(goalAmount, tokenConfig.decimals);

    // Validate beneficiary if specified
    let finalBeneficiary: `0x${string}` = address!;
    if (useBeneficiary) {
        if (!beneficiaryAddress || !isAddress(beneficiaryAddress)) {
            alert('Please enter a valid beneficiary address');
            return;
        }
        finalBeneficiary = beneficiaryAddress as `0x${string}`;
    }

    writeContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: 'createVault',
        args: [
            goalAmountWei,
            `db://${title}`,
            description,
            tokenConfig.address,
            tokenConfig.decimals,
            finalBeneficiary
        ],
    });
};
```

**Update FACTORY_ABI:**
```typescript
const FACTORY_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "goalAmount", "type": "uint256" },
      { "internalType": "string", "name": "metadataURI", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "uint8", "name": "tokenDecimals", "type": "uint8" },
      { "internalType": "address", "name": "beneficiary", "type": "address" }  // NEW
    ],
    "name": "createVault",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // ... VaultCreated event with beneficiary field
] as const;
```

### 3.2 Vault Detail Page (`frontend/app/vault/[id]/page.tsx`)

**Add VAULT_ABI function:**
```typescript
{
  "inputs": [],
  "name": "getBeneficiary",
  "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
  "stateMutability": "view",
  "type": "function"
}
```

**Fetch beneficiary:**
```typescript
const fetchVault = async () => {
    // ... existing code

    const beneficiary = await publicClient.readContract({
        address: vaultAddress,
        abi: VAULT_ABI,
        functionName: 'getBeneficiary',
    });

    setVault({
        // ... existing fields
        beneficiary: beneficiary as string,
    });
};
```

**Display beneficiary badge:**
```tsx
{vault.beneficiary &&
 vault.beneficiary.toLowerCase() !== vault.creator.toLowerCase() && (
    <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
            <span className="text-2xl">🎁</span>
            <div className="flex-1">
                <p className="font-bold text-purple-900 mb-1">Beneficiary Vault</p>
                <p className="text-sm text-purple-700">
                    Funds will be sent to:
                </p>
                <p className="font-mono text-xs mt-2 bg-purple-100 px-3 py-2 rounded break-all text-purple-900">
                    {vault.beneficiary}
                </p>
                <p className="text-xs text-purple-600 mt-2">
                    The vault creator can manage it, but all funds go to the beneficiary address above.
                </p>
            </div>
        </div>
    </div>
)}
```

### 3.3 Discover Page (`frontend/app/discover/page.tsx`)

**Add beneficiary badge on cards:**
```tsx
{vault.beneficiary !== vault.creator && (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
        🎁 Beneficiary Vault
    </div>
)}
```

---

## Phase 4: Deployment

### 4.1 Deploy New Contracts
```bash
cd contracts

# Deploy new VaultFactory with beneficiary support
forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify

# Note new addresses:
# - VaultFactory: 0x...
# - Vault Implementation: 0x...
```

### 4.2 Update Frontend Environment
```bash
# frontend/.env.local
NEXT_PUBLIC_FACTORY_ADDRESS=0x... # New factory address
```

### 4.3 Update Netlify
- Update `NEXT_PUBLIC_FACTORY_ADDRESS` in Netlify dashboard
- Trigger new deployment

---

## Phase 5: Documentation

### 5.1 Update README
Add section about beneficiary feature:
```markdown
### Beneficiary Vaults

Create vaults where funds go to a different address:
- **Donation campaigns** - Raise funds for someone else
- **Gift vaults** - Create savings for family/friends
- **Organization fundraising** - Funds go to treasury wallet
```

### 5.2 User Guide
- How to specify beneficiary when creating vault
- What happens when vault is smashed/withdrawn
- Use cases and examples

---

## Timeline

**Week 1:**
- [ ] Modify Vault.sol and VaultFactory.sol
- [ ] Write comprehensive tests
- [ ] Test locally with Anvil

**Week 2:**
- [ ] Update frontend (create page, vault page, discover page)
- [ ] Test UI flow end-to-end
- [ ] Fix any bugs

**Week 3:**
- [ ] Deploy to Base Sepolia testnet
- [ ] Test on testnet with real transactions
- [ ] Get feedback from users

**Week 4:**
- [ ] Deploy to Base mainnet
- [ ] Update all documentation
- [ ] Announce new feature

---

## Success Metrics

- ✅ Can create vault with beneficiary address
- ✅ Beneficiary receives funds on withdraw/smash (not creator)
- ✅ UI clearly shows when vault has beneficiary
- ✅ Works with both ETH and USDC vaults
- ✅ Gas costs remain similar
- ✅ No security vulnerabilities

---

## Future Enhancements

1. **Multi-beneficiary** - Split funds between multiple addresses
2. **Time-locked beneficiary** - Beneficiary can only claim after certain time
3. **Conditional beneficiary** - Different beneficiary if goal not reached
4. **Beneficiary approval** - Beneficiary must approve to receive funds
