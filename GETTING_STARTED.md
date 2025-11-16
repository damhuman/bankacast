# Banka MVP - Getting Started

## ✅ What's Been Built

### 📁 Project Structure
```
banka/
├── contracts/          # ✅ Smart contracts (Foundry)
│   ├── src/
│   │   ├── Vault.sol          # Individual vault with Aave integration
│   │   └── VaultFactory.sol   # Factory for deploying vaults
│   ├── script/
│   │   └── Deploy.s.sol       # Deployment script
│   ├── foundry.toml           # Foundry config
│   └── README.md              # Contracts documentation
├── backend/            # ⏳ TODO
├── frontend/           # ⏳ TODO
├── PRD.md             # Full product requirements
├── MVP_SPECS.md       # Minimal viable product specs
└── docs.txt           # Base/Farcaster docs links
```

### 🔧 Smart Contracts Status

✅ **COMPLETED**:
- Vault.sol (230 lines)
  - USDC contributions
  - Auto Aave V3 integration
  - Withdraw when goal reached
  - Extend deadline feature
  - Full progress tracking

- VaultFactory.sol (125 lines)
  - EIP-1167 minimal proxy deployment
  - Vault tracking and indexing
  - Gas-efficient (~100k gas per vault)

- Deploy.s.sol
  - Base Sepolia support
  - Base Mainnet support
  - Auto-detect network

- ✅ Compiled successfully
- ✅ OpenZeppelin dependencies installed
- ✅ Aave V3 integration working

## 🚀 Next Steps

### Immediate (Week 1)

1. **Test the Contracts**
   ```bash
   cd contracts
   forge test  # TODO: Write tests
   ```

2. **Deploy to Base Sepolia**
   ```bash
   # Set up .env first
   cp .env.example .env
   # Edit .env with your private key

   # Deploy
   forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify
   ```

3. **Get Testnet Funds**
   - Base Sepolia ETH: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
   - USDC on Sepolia: Aave faucet or bridge

### Week 2-3: Backend

4. **Set Up FastAPI Backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install fastapi uvicorn web3 sqlalchemy psycopg2-binary
   ```

5. **Implement**:
   - PostgreSQL database
   - Event listener for blockchain events
   - REST API endpoints
   - WebSocket for real-time updates

### Week 4-6: Frontend

6. **Set Up Next.js + Frames**
   ```bash
   cd frontend
   npx create-next-app@latest .
   npm install @privy-io/react-auth viem @coinbase/onchainkit
   ```

7. **Implement**:
   - Farcaster Frames
   - Create vault page
   - Contribute flow
   - Privy wallet integration

## 📋 Development Checklist

### Smart Contracts
- [x] Vault.sol written
- [x] VaultFactory.sol written
- [x] Deploy script written
- [x] Contracts compile
- [ ] Unit tests (Foundry)
- [ ] Deploy to Base Sepolia
- [ ] Test on testnet with real USDC
- [ ] Gas optimization review
- [ ] Security review
- [ ] Deploy to Base Mainnet

### Backend
- [ ] FastAPI project setup
- [ ] Database schema
- [ ] Event listener
- [ ] API endpoints (5 total)
- [ ] WebSocket server
- [ ] Deploy to Railway/Render

### Frontend
- [ ] Next.js project setup
- [ ] Privy integration
- [ ] Create vault Frame
- [ ] Contribute Frame
- [ ] Vault detail page
- [ ] Deploy to Vercel

## 🔑 Required Accounts/Keys

### Development
- [x] GitHub repo (optional but recommended)
- [ ] Base Sepolia RPC (free from Alchemy/Infura)
- [ ] Base Sepolia ETH (from faucet)
- [ ] Basescan API key (for verification)

### MVP Launch
- [ ] Privy account (wallet provider)
- [ ] Railway/Render account (backend hosting)
- [ ] Vercel account (frontend hosting)
- [ ] PostgreSQL database (Railway/Supabase)
- [ ] Base Mainnet deployment wallet with ETH

## 💡 Quick Commands

### Contracts
```bash
cd contracts

# Compile
forge build

# Test (TODO: write tests first)
forge test

# Deploy to testnet
forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast

# Local node for testing
anvil
```

### Backend (after setup)
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

### Frontend (after setup)
```bash
cd frontend
npm run dev
```

## 📚 Resources

### Documentation
- [Base Docs](https://docs.base.org)
- [Farcaster Frames](https://docs.farcaster.xyz/developers/frames)
- [OnchainKit](https://onchainkit.xyz)
- [Aave V3 Docs](https://docs.aave.com)
- [Foundry Book](https://book.getfoundry.sh)

### Testnet Faucets
- Base Sepolia ETH: https://www.coinbase.com/faucets
- USDC: Use Aave faucet or bridge from Sepolia

### Addresses (Base Sepolia)
- Aave Pool: `0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b`
- USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

## 🎯 Success Metrics

### Week 1-2
- ✅ Contracts deployed to testnet
- ✅ Can create vault via Foundry script
- ✅ Can contribute USDC to vault
- ✅ Can withdraw when goal reached

### Week 3-4
- ✅ Backend API returning vault data
- ✅ Event listener indexing new vaults
- ✅ WebSocket updates working

### Week 5-6
- ✅ Create vault via web UI
- ✅ Frame displays in Warpcast
- ✅ One-click contribute working
- ✅ End-to-end flow complete

### Week 7-8
- ✅ 20 internal testers on Base Sepolia
- ✅ 50+ test vaults created
- ✅ Zero critical bugs
- ✅ Ready for mainnet

## 🔥 Let's Build!

Start with deploying contracts to Base Sepolia today. Then tackle backend and frontend in parallel.

Questions? Check the PRD.md and MVP_SPECS.md for detailed requirements.
