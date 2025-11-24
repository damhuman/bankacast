# EthBanka 🇺🇦

**An easy way to create donation vaults in USDC on Base network with automatic AAVE yield generation during fundraising.**

Built at **Lviv.ETH** | Demo: [bankacast.netlify.app](https://bankacast.netlify.app/) | Contact: kozak.eth

**Status:** MVP Development Complete ✅

---

## 🎯 The Problem

**Fundraising is essential in 2025 in Ukraine.**

Current fundraising methods have limitations:
- 🏦 **МоноБанка** - UAH only, bank dependencies, no yield generation
- 💳 **Straight to wallet** (e.g. sternenko.eth) - No transparency, progress tracking, or social proof
- 🌍 **Traditional platforms** (GoFundMe) - 5-10% fees, limited crypto support, slow payouts

---

## ✨ Our Solution: EthBanka

Create transparent, yield-generating donation vaults on Base blockchain for Ukrainian humanitarian, military, and community needs.

### Core Features

- 🎯 **Donation Vaults** - Create fundraising vaults with goals, deadlines, and full transparency
- 💰 **Auto Yield via AAVE** - Donations automatically earn 3-8% APY while fundraising
- 💵 **Multi-Token Support** - Donate in your preferred currency
  - ✅ **USDC** (stable, 5% APY)
  - 🔄 **ETH, USDT, DAI** - In active development (Week 2 priority!)
- 📊 **Real-time Progress** - Contributors, yield earned, and goal tracking
- 👥 **Social Sharing** - Share vaults as Farcaster Frames for viral reach
- 🔒 **Trustless** - Smart contracts ensure funds are safe and transparent
- ⚡ **Smash Vault Early** - Creator can withdraw before deadline if urgent

---

## 🎯 Use Cases

### Ukrainian Fundraising
- 🚁 **Drone Fundraising** - Volunteers raise funds for military drones with full transparency
- 🏥 **Medical Aid** - Hospitals collect donations for equipment and supplies
- 🛡️ **Military Equipment** - Units fundraise for tactical gear and vehicles
- 🏠 **Humanitarian Aid** - NGOs raise funds for displaced families
- 🔧 **Infrastructure Repair** - Communities pool funds for rebuilding

### General Crowdfunding
- 🎉 **Group Gifts** - Friends collect for birthdays, weddings, celebrations
- 🏫 **Community Projects** - Local initiatives with transparent funding
- 🎓 **Scholarships** - Educational funding with milestone-based goals
- 🌳 **Environmental** - Tree planting, cleanup projects
- 🤝 **Charity Drives** - Transparent fundraising for causes

**Why EthBanka vs МоноБанка?**
- ✅ Global accessibility (not just UAH)
- ✅ Automatic yield generation (funds work for you)
- ✅ Full transparency on-chain
- ✅ No bank intermediaries
- ✅ Lower fees (~$0.01 vs %)

---

## 📁 Project Structure

```
banka/
├── docs/               # 📚 All documentation
│   ├── team/          # Team guides and sprint plans
│   ├── product/       # Product requirements and roadmaps
│   └── README.md      # Documentation index
│
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
├── scripts/            # 🔧 Automation scripts
│   ├── quickstart.sh           # Automated setup
│   └── stop.sh                 # Stop all services
│
├── assets/             # 🎨 Media files
│   └── logo.png
│
├── CLAUDE.md           # AI assistant instructions
└── README.md           # This file
```

---

## ⚡ Швидкий старт (Automated)

```bash
# Автоматичний запуск усього stack
./scripts/quickstart.sh
```

Це запустить:
- ✅ PostgreSQL (Docker)
- ✅ Backend API (http://localhost:8000)
- ✅ Frontend (http://localhost:3000)

Далі:
1. Отримай Privy App ID на https://privy.io
2. Додай в `frontend/.env.local`
3. Deploy contracts на Base Sepolia

**Детальна інструкція:** [docs/team/SPRINT_PLAN.md](docs/team/SPRINT_PLAN.md)

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

### Pitch & Overview
- **[📊 Lviv.ETH Pitch Deck](docs/LVIV_ETH_PITCH.pdf)** - Full presentation from Lviv.ETH hackathon

### Main Documentation
- **[docs/README.md](docs/README.md)** - Documentation index and navigation
- **[docs/team/TEAM_GUIDE.md](docs/team/TEAM_GUIDE.md)** - Comprehensive Web3 onboarding guide for team
- **[docs/team/SPRINT_PLAN.md](docs/team/SPRINT_PLAN.md)** - 3-week sprint plan with PRD, tasks, and ZK integration
- **[docs/product/ETH_SUPPORT_PLAN.md](docs/product/ETH_SUPPORT_PLAN.md)** - Future ETH support roadmap
- **[CLAUDE.md](CLAUDE.md)** - AI assistant instructions

### Technical Documentation
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

### ⏳ Phase 2: Multi-Token Support (Current - Week 1-2)
- [ ] **PRIORITY #1: Multi-Token Integration (ETH, USDT, DAI, USDC)**
  - [ ] Refactor smart contracts for multiple ERC20 tokens
  - [ ] Integrate 4 Aave V3 pools (ETH, USDT, DAI, USDC)
  - [ ] Token selector UI in frontend
  - [ ] Database schema updates for token tracking
  - [ ] Test all 4 tokens end-to-end
- [ ] Deploy contracts to Base Sepolia
- [ ] Complete Privy wallet integration
- [ ] Build Farcaster Frames with multi-token support

### ⏳ Phase 3: Launch Preparation (Week 3)
- [ ] Farcaster Frames integration finalization
- [ ] WebSocket real-time updates
- [ ] Smart contract tests (Foundry)
- [ ] 10-15 internal testers on Base Sepolia
- [ ] Bug fixes and optimization
- [ ] Deploy to production (Vercel + Railway)

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
   - Creator connects wallet → Creates donation vault (title, goal, deadline)
   - Smart contract deployed via VaultFactory (~$0.01 gas)
   - Receives shareable link + Farcaster Frame

2. **Share & Contribute**
   - Share Frame in Farcaster, Twitter, Telegram
   - Donors see: Progress, Goal, Yield Earned, Contributors
   - One-click contribute (USDC automatically deposited to Aave V3)

3. **Track & Earn**
   - Real-time progress updates via WebSocket
   - Funds generate passive yield (3-8% APY) during fundraising
   - Full transparency: All contributions visible on-chain

4. **Withdraw or Smash Early**
   - **Goal reached:** Creator withdraws principal + yield
   - **Urgent need:** "Smash Vault Early" to withdraw before deadline
   - **Expired:** Extend deadline or return funds to contributors

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
