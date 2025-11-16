# Banka Smart Contracts

Minimal proxy-based savings vaults with automated Aave yield generation on Base.

## Architecture

- **Vault.sol**: Individual savings vault implementation
- **VaultFactory.sol**: Factory for deploying minimal proxy clones
- **Deploy.s.sol**: Deployment script for Base Sepolia/Mainnet

## Quick Start

### 1. Install Dependencies

```bash
forge install
```

### 2. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your private key and API keys
```

### 3. Compile

```bash
forge build
```

### 4. Deploy to Base Sepolia

```bash
forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify
```

## Contract Addresses

### Base Sepolia (Testnet)
- **Aave V3 Pool**: `0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b`
- **USDC**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

### Base Mainnet
- **Aave V3 Pool**: `0xA238Dd80C259a72e81d7e4664a9801593F98d1c5`
- **USDC**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

## Features

### Vault
- ✅ USDC-only contributions
- ✅ Auto-deposit to Aave V3 for yield
- ✅ Withdraw when 100% goal reached
- ✅ Extend deadline if goal not reached
- ✅ Track contributors and contributions
- ✅ Real-time progress and yield calculation

### Factory
- ✅ Gas-efficient vault deployment (EIP-1167 minimal proxies)
- ✅ Track all vaults and user vaults
- ✅ Validation on creation

## Usage

### Create Vault

```solidity
VaultFactory factory = VaultFactory(FACTORY_ADDRESS);

address vault = factory.createVault(
    1000 * 1e6,                  // 1000 USDC goal
    block.timestamp + 30 days,   // 30-day deadline
    "ipfs://QmXxx..."             // metadata URI
);
```

### Contribute

```solidity
IERC20(USDC).approve(vaultAddress, amount);
Vault(vaultAddress).contribute(amount);
```

### Withdraw

```solidity
Vault(vaultAddress).withdraw(); // Only creator when goal reached
```

## Security

- ✅ OpenZeppelin contracts for standard implementations
- ✅ Initializable pattern for proxies
- ✅ Custom errors for gas efficiency
- ✅ Reentrancy protection (checks-effects-interactions)
- ⏳ Audit pending

## Gas Optimization

- **Vault deployment**: ~100k gas (vs 2M+ for full deploy)
- **Contribution**: ~150k gas
- **Withdrawal**: ~100k gas

## License

MIT
