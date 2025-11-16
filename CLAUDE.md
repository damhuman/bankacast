# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Banka is a social savings platform on Base blockchain that enables groups to pool funds for shared or individual goals through Farcaster Frames. The platform combines crowdfunding social proof mechanisms with automated DeFi yield generation via Aave V3.

## Architecture

The project consists of three main components:

### Smart Contracts (Foundry)
- **Vault.sol**: Individual savings vault with Aave V3 integration for yield generation. Uses upgradeable pattern (Initializable) to work with minimal proxies.
- **VaultFactory.sol**: Factory contract deploying gas-efficient vault clones using EIP-1167 minimal proxy pattern.
- Pattern: Factory creates minimal proxy clones (~100k gas) vs full deployment (2M+ gas).

### Backend (FastAPI + PostgreSQL)
- **main.py**: REST API server with WebSocket support for real-time updates
- **event_listener.py**: Blockchain event indexer that listens to VaultCreated and Contributed events, populating the database
- **models.py**: SQLAlchemy ORM models (Vault, Contribution, User)
- Architecture: Event listener runs as separate process, broadcasts updates via WebSocket ConnectionManager

### Frontend (Next.js 14)
- **App Router**: Uses Next.js 14 app directory structure
- **Farcaster Frames**: API routes in `app/api/frame/` for Frame integration
- **Wallet**: Privy for authentication, Viem + Wagmi for blockchain interactions
- **Real-time**: WebSocket connection to backend for live vault updates

## Common Development Commands

### Smart Contracts
```bash
cd contracts

# Compile contracts
forge build

# Run tests
forge test

# Deploy to Base Sepolia
forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify

# Deploy to Base Mainnet
forge script script/Deploy.s.sol --rpc-url base --broadcast --verify
```

### Backend
```bash
cd backend

# Setup (first time)
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run API server (http://localhost:8000)
python main.py

# Run event listener (separate terminal)
source venv/bin/activate
python event_listener.py

# API documentation
# Visit http://localhost:8000/docs for Swagger UI
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build
npm start

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

### Full Stack
```bash
# Automated setup (from root)
./QUICKSTART.sh

# Stop all services
./STOP.sh
```

## Key Technical Details

### Smart Contract Integration
- **Network**: Base Sepolia (testnet) or Base Mainnet
- **Aave V3 Pool** (Sepolia): `0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b`
- **USDC** (Sepolia): `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- Contributions automatically deposit to Aave V3 for yield generation
- When goal reached, creator withdraws principal + yield

### Event Listener Pattern
The event listener in `backend/event_listener.py`:
- Polls blockchain every 5-10 seconds for new events
- Listens to two event types: `VaultCreated` (from factory) and `Contributed` (from individual vaults)
- Uses `get_logs()` with block ranges to avoid missing events
- Updates database and broadcasts WebSocket messages to connected clients

### Database Schema
- **Vault**: address, creator, goal_amount, deadline, total_contributed, status, metadata
- **Contribution**: vault_address, contributor, amount, tx_hash, block_number
- **User**: wallet_address, farcaster_username (for social features)

### Farcaster Frames
Frames are interactive posts in Farcaster clients (Warpcast):
- Frame endpoints: `app/api/frame/route.ts` (metadata), `app/api/frame/contribute/route.ts` (transactions)
- Use special meta tags (`fc:frame`, `fc:frame:image`, `fc:frame:button:1`)
- Allow one-click contributions directly from social feed

### WebSocket Real-time Updates
- ConnectionManager in `main.py` manages vault-specific connections
- Clients connect to `/ws/vault/{address}`
- Event listener broadcasts updates when new contributions arrive

## Environment Variables

### Contracts (.env)
```bash
PRIVATE_KEY=0x...           # Deployer wallet private key
ETHERSCAN_API_KEY=...       # For contract verification
```

### Backend (.env)
```bash
DATABASE_URL=postgresql://banka:banka@localhost:5432/banka
BASE_RPC_URL=https://sepolia.base.org
FACTORY_ADDRESS=0x...       # From deployment
API_HOST=0.0.0.0
API_PORT=8000
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_PRIVY_APP_ID=...
NEXT_PUBLIC_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
NEXT_PUBLIC_CHAIN_ID=84532  # Base Sepolia
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Testing

### Running Tests
```bash
# Smart contracts (when implemented)
cd contracts
forge test
forge test -vvv  # Verbose output

# Backend (when implemented)
cd backend
pytest

# Frontend (when implemented)
cd frontend
npm test
```

## Deployment Flow

1. **Deploy Contracts**: `cd contracts && forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast`
2. **Update Environment**: Copy VaultFactory address to backend/.env and frontend/.env.local
3. **Start Backend**: Database → API server → Event listener
4. **Start Frontend**: Configure Privy App ID → `npm run dev`
5. **Verify Contracts**: `forge verify-contract <address> <ContractName> --watch`

## Important Patterns

### Minimal Proxy Pattern
VaultFactory uses Clones.clone() to deploy cheap vault copies. Each vault is initialized (not constructed) after deployment.

### Event-Driven Architecture
Backend doesn't directly query blockchain state. Instead, event_listener.py indexes all events into PostgreSQL, which the API serves. This provides fast queries and historical data.

### Status Management
Vault status flows: `active` → `completed` (when goal reached) or `expired` (deadline passed). Event listener automatically updates status based on contributions.

## Common Issues

### Event Listener Not Picking Up Events
- Check FACTORY_ADDRESS in backend/.env matches deployed contract
- Verify RPC URL is correct and accessible
- Check last_block tracking (listener starts from deployment block)

### Frontend Can't Connect to Wallet
- Verify NEXT_PUBLIC_PRIVY_APP_ID is set
- Check Privy app is configured for correct network (Base Sepolia)
- Ensure user has Base Sepolia network added to wallet

### Transactions Failing
- Check user has approved USDC spending for vault contract
- Verify contribution amount doesn't exceed goal
- Ensure vault deadline hasn't passed
- Confirm user has sufficient USDC balance

## Project Status

MVP development is complete with all core features implemented:
- ✅ Smart contracts (Vault, VaultFactory) deployed on Base Sepolia
- ✅ Backend API with event indexing
- ✅ Frontend with Farcaster Frames integration
- ✅ Automated quickstart script
- ⏳ Testing phase with internal users
- 🔮 Security audit pending before mainnet launch
