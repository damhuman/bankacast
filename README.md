# Banka 💰

Social savings vaults with automated yield generation on Base blockchain.

**Status:** MVP Development Complete ✅

---

## 🎯 What is Banka?

Banka enables groups to pool funds for shared or individual goals through Farcaster Frames on Base L2. The platform combines social proof mechanisms of crowdfunding with automated DeFi yield generation.

### Core Features

- 🎯 **Goal-Based Vaults** - Create savings vaults with target amounts and deadlines
- 💰 **Auto Yield** - Deposits automatically generate yield through Aave V3
- 👥 **Social Sharing** - Share vaults as Farcaster Frames for one-click contributions
- 🔒 **Trustless** - Smart contracts ensure funds are safe and transparent
- ⚡ **Base L2** - Cheap transactions (<$0.10 avg gas cost)

---

## 📁 Project Structure

```
banka/
├── contracts/          # ✅ Solidity smart contracts (Foundry)
│   ├── src/
│   │   ├── Vault.sol           # Individual vault with Aave integration
│   │   └── VaultFactory.sol    # Factory for deploying vaults
│   ├── script/Deploy.s.sol     # Deployment script
│   └── README.md
│
├── backend/            # ✅ FastAPI backend
│   ├── main.py                 # API server
│   ├── models.py               # Database models
│   ├── event_listener.py       # Blockchain event indexer
│   └── README.md
│
├── frontend/           # ✅ Next.js frontend + Farcaster Frames
│   ├── app/                    # Next.js 14 App Router
│   ├── package.json
│   └── README.md
│
├── PRD.md              # Full Product Requirements Document
├── MVP_SPECS.md        # Minimal MVP specifications
└── GETTING_STARTED.md  # Development guide
```

---

## ⚡ Швидкий старт (Automated)

```bash
# Автоматичний запуск усього stack
./QUICKSTART.sh
```

Це запустить:
- ✅ PostgreSQL (Docker)
- ✅ Backend API (http://localhost:8000)
- ✅ Frontend (http://localhost:3000)

Далі:
1. Отримай Privy App ID на https://privy.io
2. Додай в `frontend/.env.local`
3. Deploy contracts на Base Sepolia

**Детальна інструкція:** [START.md](START.md)

---

## 🚀 Ручний запуск (Quick Start)

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 15+
- Foundry (for smart contracts)

### 1. Smart Contracts

```bash
cd contracts

# Install dependencies
forge install

# Compile contracts
forge build

# Deploy to Base Sepolia
cp .env.example .env
# Edit .env with your private key

forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast
```

**Deployed Contracts:**
- VaultFactory: `TBD` (deploy first)
- Vault Implementation: `TBD`

### 2. Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup database
cp .env.example .env
# Edit .env with your database URL and factory address

# Run API server
python main.py  # http://localhost:8000

# Run event listener (separate terminal)
python event_listener.py
```

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.local.example .env.local
# Edit .env.local with Privy app ID and contract addresses

# Run development server
npm run dev  # http://localhost:3000
```

---

## 🏗️ Tech Stack

### Smart Contracts
- **Solidity 0.8.24** - Smart contract language
- **Foundry** - Development framework
- **OpenZeppelin** - Secure contract libraries
- **Aave V3** - Yield generation protocol
- **EIP-1167** - Minimal proxy pattern for gas efficiency

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM
- **Web3.py** - Blockchain interaction
- **WebSockets** - Real-time updates

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Privy** - Wallet authentication
- **Viem** - Ethereum library
- **Farcaster Frames** - Social sharing

---

## 📖 Documentation

- **[PRD.md](PRD.md)** - Full product requirements document with business goals, user stories, success metrics
- **[MVP_SPECS.md](MVP_SPECS.md)** - Detailed technical specifications with code examples
- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Step-by-step development guide
- **[contracts/README.md](contracts/README.md)** - Smart contracts documentation
- **[backend/README.md](backend/README.md)** - Backend API documentation
- **[frontend/README.md](frontend/README.md)** - Frontend setup guide

---

## 🎯 Development Roadmap

### ✅ Phase 1: Foundation (COMPLETED)
- [x] Smart contracts (Vault.sol, VaultFactory.sol)
- [x] Deployment scripts
- [x] Backend API (FastAPI + PostgreSQL)
- [x] Event listener for blockchain indexing
- [x] Frontend scaffolding (Next.js + Tailwind)
- [x] Project documentation

### ⏳ Phase 2: Integration (Current - Week 1-2)
- [ ] Deploy contracts to Base Sepolia
- [ ] Test vault creation and contributions on testnet
- [ ] Complete Privy wallet integration
- [ ] Build Farcaster Frames
- [ ] WebSocket real-time updates
- [ ] End-to-end testing

### 🔮 Phase 3: Testing (Week 3-4)
- [ ] Write smart contract tests (Foundry)
- [ ] Backend API tests (pytest)
- [ ] Frontend component tests
- [ ] 20 internal testers on Base Sepolia
- [ ] Bug fixes and optimization

### 🔮 Phase 4: Security & Launch (Week 5-8)
- [ ] Smart contract audit
- [ ] Security review
- [ ] Deploy to Base Mainnet
- [ ] Beta launch with 100 early users
- [ ] Marketing campaign on Farcaster

### 🔮 Phase 5: Growth (Week 9+)
- [ ] Public launch
- [ ] Scale to 10k users
- [ ] Add features based on feedback
- [ ] Mobile app (beyond Frames)

---

## 🎨 User Flow

1. **Create Vault**
   - User visits app → Creates vault (title, goal, deadline)
   - Smart contract deployed via VaultFactory
   - Receives shareable Farcaster Frame link

2. **Share & Contribute**
   - Creator shares Frame in Farcaster feed
   - Friends see progress bar, contributors, social proof
   - One-click contribute (USDC automatically deposited to Aave)

3. **Earn Yield**
   - Funds generate passive yield (3-8% APY)
   - Real-time progress updates via WebSocket

4. **Withdraw**
   - When 100% goal reached → Creator withdraws (principal + yield)
   - If deadline passes → Creator can extend or return funds

---

## 🔑 Key Addresses (Base Sepolia)

### Official Addresses
- **Aave V3 Pool:** `0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b`
- **USDC:** `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

### Banka Contracts (Deploy first!)
- **VaultFactory:** `TBD`
- **Vault Implementation:** `TBD`

---

## 🤝 Contributing

This is an MVP project. Contributions welcome after initial deployment!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📊 Success Metrics (6 Months)

- 🎯 **10,000+ users**
- 💰 **$1M+ TVL** (Total Value Locked)
- ✅ **75%+ vault completion rate**
- 🔒 **Zero security incidents**
- 📈 **40%+ monthly active user rate**
- 🚀 **k-factor >1.5** (viral growth)

---

## 🛠️ Development Commands

```bash
# Smart Contracts
cd contracts
forge build                    # Compile
forge test                     # Run tests
forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast

# Backend
cd backend
python main.py                 # Run API
python event_listener.py       # Run indexer

# Frontend
cd frontend
npm run dev                    # Development server
npm run build                  # Production build
```

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🔗 Resources

- [Base Documentation](https://docs.base.org)
- [Farcaster Frames Spec](https://docs.farcaster.xyz/developers/frames)
- [Aave V3 Docs](https://docs.aave.com)
- [OnchainKit](https://onchainkit.xyz)
- [Privy](https://docs.privy.io)

---

## 👥 Team

Built with ❤️ for the Base and Farcaster ecosystems

---

**🚀 Ready to launch! Let's build the future of social savings.**
