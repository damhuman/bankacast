# Banka MVP - Development Specifications

**Version:** 1.0 - Minimal Viable Product
**Timeline:** 8 weeks to testnet, 4 weeks to mainnet
**Goal:** Validate core hypothesis with minimum features

---

## MVP Scope: What We're Building

### Core Features ONLY
1. ✅ Create vault (USDC only, 4 fields)
2. ✅ Contribute to vault (one-click)
3. ✅ Auto-deposit to Aave V3 for yield
4. ✅ Withdraw when 100% goal reached
5. ✅ Share vault as Farcaster Frame
6. ✅ Real-time progress bar

### Explicitly CUT from MVP
- ❌ Multiple currencies (USDC only)
- ❌ Failed vault refunds (extend deadline instead)
- ❌ Trust scores/reputation
- ❌ Discovery feed
- ❌ Advanced notifications
- ❌ Timelock mechanisms
- ❌ ERC-4626 wrapper (direct Aave integration)
- ❌ Multiple yield sources
- ❌ Contribution limits
- ❌ Vault templates

---

## 1. Smart Contracts Architecture

### Tech Stack
- **Language**: Solidity 0.8.24
- **Framework**: Foundry
- **Network**: Base Sepolia → Base Mainnet
- **Yield**: Aave V3 on Base (USDC pool)

### Contracts

#### 1.1 VaultFactory.sol

**Purpose**: Deploy new vaults with minimal gas cost

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/proxy/Clones.sol";

contract VaultFactory {
    address public immutable vaultImplementation;
    address public immutable aavePool; // Aave V3 Pool address
    address public immutable usdc;

    address[] public allVaults;
    mapping(address => address[]) public userVaults; // creator => vaults

    event VaultCreated(
        address indexed vault,
        address indexed creator,
        uint256 goalAmount,
        uint256 deadline,
        string metadata
    );

    constructor(address _vaultImplementation, address _aavePool, address _usdc) {
        vaultImplementation = _vaultImplementation;
        aavePool = _aavePool;
        usdc = _usdc;
    }

    function createVault(
        uint256 _goalAmount,
        uint256 _deadline,
        string calldata _metadataURI // IPFS hash for title/description/image
    ) external returns (address) {
        require(_deadline > block.timestamp, "Invalid deadline");
        require(_goalAmount > 0, "Goal must be > 0");

        address clone = Clones.clone(vaultImplementation);

        Vault(clone).initialize(
            msg.sender,
            _goalAmount,
            _deadline,
            _metadataURI,
            aavePool,
            usdc
        );

        allVaults.push(clone);
        userVaults[msg.sender].push(clone);

        emit VaultCreated(clone, msg.sender, _goalAmount, _deadline, _metadataURI);

        return clone;
    }

    function getVaultCount() external view returns (uint256) {
        return allVaults.length;
    }

    function getUserVaults(address user) external view returns (address[] memory) {
        return userVaults[user];
    }
}
```

---

#### 1.2 Vault.sol

**Purpose**: Individual savings vault with Aave integration

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@aave/core-v3/contracts/interfaces/IPool.sol";

contract Vault is Initializable {
    // State
    address public creator;
    uint256 public goalAmount;
    uint256 public deadline;
    string public metadataURI;

    address public aavePool;
    address public usdc;
    address public aUsdc; // Will be set after first deposit

    uint256 public totalContributed;
    mapping(address => uint256) public contributions;
    address[] public contributors;

    bool public isWithdrawn;

    // Events
    event Contributed(address indexed contributor, uint256 amount, uint256 totalContributed);
    event Withdrawn(address indexed creator, uint256 amount, uint256 yield);
    event DeadlineExtended(uint256 newDeadline);

    // Modifiers
    modifier onlyCreator() {
        require(msg.sender == creator, "Not creator");
        _;
    }

    modifier notWithdrawn() {
        require(!isWithdrawn, "Already withdrawn");
        _;
    }

    // Initialize (called by factory)
    function initialize(
        address _creator,
        uint256 _goalAmount,
        uint256 _deadline,
        string calldata _metadataURI,
        address _aavePool,
        address _usdc
    ) external initializer {
        creator = _creator;
        goalAmount = _goalAmount;
        deadline = _deadline;
        metadataURI = _metadataURI;
        aavePool = _aavePool;
        usdc = _usdc;
    }

    // Contribute to vault
    function contribute(uint256 amount) external notWithdrawn {
        require(block.timestamp < deadline, "Vault expired");
        require(amount > 0, "Amount must be > 0");
        require(totalContributed + amount <= goalAmount, "Exceeds goal");

        // Transfer USDC from contributor
        require(IERC20(usdc).transferFrom(msg.sender, address(this), amount), "Transfer failed");

        // Track contribution
        if (contributions[msg.sender] == 0) {
            contributors.push(msg.sender);
        }
        contributions[msg.sender] += amount;
        totalContributed += amount;

        // Deposit to Aave
        IERC20(usdc).approve(aavePool, amount);
        IPool(aavePool).supply(usdc, amount, address(this), 0);

        // Get aToken address if first deposit
        if (aUsdc == address(0)) {
            aUsdc = IPool(aavePool).getReserveData(usdc).aTokenAddress;
        }

        emit Contributed(msg.sender, amount, totalContributed);
    }

    // Withdraw when goal reached
    function withdraw() external onlyCreator notWithdrawn {
        require(totalContributed >= goalAmount, "Goal not reached");

        isWithdrawn = true;

        // Withdraw from Aave (principal + yield)
        uint256 aTokenBalance = IERC20(aUsdc).balanceOf(address(this));
        IPool(aavePool).withdraw(usdc, aTokenBalance, creator);

        uint256 yield = aTokenBalance - totalContributed;

        emit Withdrawn(creator, aTokenBalance, yield);
    }

    // Extend deadline if goal not reached (MVP: simple extension, no refunds)
    function extendDeadline(uint256 newDeadline) external onlyCreator notWithdrawn {
        require(newDeadline > deadline, "Must extend forward");
        require(block.timestamp >= deadline, "Current deadline not passed");
        require(totalContributed < goalAmount, "Goal already reached");

        deadline = newDeadline;
        emit DeadlineExtended(newDeadline);
    }

    // View functions
    function getProgress() external view returns (uint256 current, uint256 goal, uint256 percentage) {
        return (totalContributed, goalAmount, (totalContributed * 100) / goalAmount);
    }

    function getCurrentBalance() external view returns (uint256 principal, uint256 yield, uint256 total) {
        principal = totalContributed;
        total = aUsdc != address(0) ? IERC20(aUsdc).balanceOf(address(this)) : 0;
        yield = total > principal ? total - principal : 0;
        return (principal, yield, total);
    }

    function getContributors() external view returns (address[] memory) {
        return contributors;
    }

    function getContributorCount() external view returns (uint256) {
        return contributors.length;
    }
}
```

---

#### 1.3 Deployment Script

```solidity
// script/Deploy.s.sol
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Vault.sol";
import "../src/VaultFactory.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Base Sepolia addresses
        address aavePool = 0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b; // Aave V3 Pool
        address usdc = 0x036CbD53842c5426634e7929541eC2318f3dCF7e; // USDC on Base Sepolia

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy implementation
        Vault vaultImplementation = new Vault();
        console.log("Vault Implementation:", address(vaultImplementation));

        // 2. Deploy factory
        VaultFactory factory = new VaultFactory(
            address(vaultImplementation),
            aavePool,
            usdc
        );
        console.log("VaultFactory:", address(factory));

        vm.stopBroadcast();
    }
}
```

---

#### 1.4 Tests

```solidity
// test/Vault.t.sol
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/Vault.sol";
import "../src/VaultFactory.sol";

contract VaultTest is Test {
    VaultFactory factory;
    Vault vaultImpl;

    address alice = address(0x1);
    address bob = address(0x2);

    function setUp() public {
        // Deploy contracts
        vaultImpl = new Vault();
        factory = new VaultFactory(
            address(vaultImpl),
            address(0xAAVE), // mock
            address(0xUSDC)  // mock
        );
    }

    function testCreateVault() public {
        vm.prank(alice);
        address vault = factory.createVault(
            1000e6, // 1000 USDC goal
            block.timestamp + 30 days,
            "ipfs://QmTest"
        );

        assertTrue(vault != address(0));
        assertEq(Vault(vault).creator(), alice);
        assertEq(Vault(vault).goalAmount(), 1000e6);
    }

    function testContribute() public {
        // TODO: Mock USDC and Aave
    }

    function testWithdraw() public {
        // TODO: Test withdrawal when goal reached
    }
}
```

---

## 2. Backend API

### Tech Stack
- **Framework**: FastAPI 0.104+
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy 2.0
- **WebSocket**: FastAPI WebSockets
- **Deployment**: Railway or Render

### Architecture

```
backend/
├── main.py              # FastAPI app
├── models.py            # SQLAlchemy models
├── schemas.py           # Pydantic schemas
├── database.py          # DB connection
├── event_listener.py    # Listen to blockchain events
└── requirements.txt
```

---

### 2.1 Database Schema

```sql
-- Vaults table
CREATE TABLE vaults (
    id SERIAL PRIMARY KEY,
    address VARCHAR(42) UNIQUE NOT NULL,
    creator VARCHAR(42) NOT NULL,
    goal_amount BIGINT NOT NULL,
    deadline BIGINT NOT NULL,
    metadata_uri TEXT NOT NULL,
    title TEXT,
    description TEXT,
    image_url TEXT,
    total_contributed BIGINT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, expired
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Contributions table
CREATE TABLE contributions (
    id SERIAL PRIMARY KEY,
    vault_address VARCHAR(42) NOT NULL,
    contributor VARCHAR(42) NOT NULL,
    amount BIGINT NOT NULL,
    tx_hash VARCHAR(66) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (vault_address) REFERENCES vaults(address)
);

-- Index for fast queries
CREATE INDEX idx_vaults_creator ON vaults(creator);
CREATE INDEX idx_vaults_status ON vaults(status);
CREATE INDEX idx_contributions_vault ON contributions(vault_address);
CREATE INDEX idx_contributions_contributor ON contributions(contributor);
```

---

### 2.2 API Endpoints

#### GET /api/health
```json
Response: { "status": "ok" }
```

#### POST /api/metadata
**Purpose**: Upload vault metadata to IPFS (or store in DB)

```json
Request:
{
  "title": "Emergency Fund",
  "description": "Saving for 6 months expenses",
  "image": "data:image/png;base64,..."
}

Response:
{
  "uri": "ipfs://QmXxx" // or just a DB ID for MVP
}
```

#### GET /api/vaults/:address
**Purpose**: Get vault details

```json
Response:
{
  "address": "0x123...",
  "creator": "0xabc...",
  "goalAmount": "1000000000", // 1000 USDC (6 decimals)
  "deadline": 1735689600,
  "title": "Emergency Fund",
  "description": "Saving for 6 months expenses",
  "imageUrl": "https://...",
  "totalContributed": "500000000",
  "currentBalance": "505000000", // with yield
  "yield": "5000000",
  "progress": 50,
  "contributors": [
    {
      "address": "0xdef...",
      "amount": "250000000",
      "farcasterUsername": "alice.eth"
    }
  ],
  "status": "active",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

#### GET /api/vaults?creator=0x...
**Purpose**: Get vaults by creator

```json
Response:
{
  "vaults": [
    { /* vault object */ }
  ]
}
```

#### WebSocket /ws/vault/:address
**Purpose**: Real-time updates for vault

```json
Message format:
{
  "type": "contribution",
  "data": {
    "contributor": "0x...",
    "amount": "100000000",
    "totalContributed": "600000000",
    "progress": 60
  }
}
```

---

### 2.3 Event Listener

```python
# event_listener.py
from web3 import Web3
from sqlalchemy.orm import Session
from models import Vault, Contribution
import asyncio

class EventListener:
    def __init__(self, rpc_url: str, factory_address: str, db: Session):
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.factory_address = factory_address
        self.db = db

    async def listen_vault_created(self):
        """Listen to VaultCreated events"""
        event_filter = self.w3.eth.filter({
            "address": self.factory_address,
            "topics": [self.w3.keccak(text="VaultCreated(address,address,uint256,uint256,string)")]
        })

        while True:
            for event in event_filter.get_new_entries():
                # Decode event
                vault_address = "0x" + event['topics'][1].hex()[-40:]
                creator = "0x" + event['topics'][2].hex()[-40:]

                # Fetch metadata from IPFS or DB
                # Create vault record in DB
                vault = Vault(
                    address=vault_address,
                    creator=creator,
                    # ... other fields
                )
                self.db.add(vault)
                self.db.commit()

            await asyncio.sleep(5)

    async def listen_contributed(self):
        """Listen to Contributed events from all vaults"""
        # Similar implementation
        pass
```

---

## 3. Frontend (Farcaster Frames)

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Frames**: frames.js or OnchainKit
- **Styling**: Tailwind CSS
- **Wallet**: Privy
- **Deployment**: Vercel

### Architecture

```
frontend/
├── app/
│   ├── page.tsx           # Landing page
│   ├── create/page.tsx    # Create vault page
│   ├── vault/[id]/page.tsx # Vault detail page
│   └── api/
│       └── frame/route.ts  # Frame endpoint
├── components/
│   ├── VaultFrame.tsx
│   ├── CreateForm.tsx
│   └── ContributeButton.tsx
├── lib/
│   ├── contracts.ts       # Contract ABIs and addresses
│   └── privy.ts           # Privy config
└── public/
```

---

### 3.1 Frame Structure

#### Frame 1: Vault Display

```tsx
// app/api/frame/route.ts
import { FrameRequest, getFrameMessage } from '@coinbase/onchainkit/frame';

export async function POST(req: Request) {
  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body);

  // Get vault data from backend
  const vaultAddress = message.state.vaultAddress;
  const vault = await fetch(`${API_URL}/vaults/${vaultAddress}`).then(r => r.json());

  // Generate Frame HTML
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${generateProgressImage(vault)}" />
        <meta property="fc:frame:button:1" content="Contribute $10" />
        <meta property="fc:frame:button:2" content="Contribute $25" />
        <meta property="fc:frame:button:3" content="Contribute $50" />
        <meta property="fc:frame:button:4" content="View Details" />
        <meta property="fc:frame:post_url" content="${FRAME_URL}/api/frame/contribute" />
      </head>
    </html>
  `);
}
```

#### Frame 2: Contribute

```tsx
// app/api/frame/contribute/route.ts
export async function POST(req: Request) {
  const body: FrameRequest = await req.json();
  const { buttonIndex, address } = body.untrustedData;

  // Map button to amount
  const amounts = { 1: 10, 2: 25, 3: 50 };
  const amount = amounts[buttonIndex] * 1e6; // USDC has 6 decimals

  // Generate transaction
  const tx = {
    to: vaultAddress,
    data: encodeFunctionData({
      abi: VaultABI,
      functionName: 'contribute',
      args: [amount]
    })
  };

  return new Response(JSON.stringify({
    chainId: 'eip155:8453', // Base
    method: 'eth_sendTransaction',
    params: [tx]
  }));
}
```

---

### 3.2 Create Vault Page

```tsx
// app/create/page.tsx
'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';

export default function CreateVault() {
  const { user, login } = usePrivy();
  const [form, setForm] = useState({
    title: '',
    goal: '',
    deadline: '',
    description: ''
  });

  const handleCreate = async () => {
    // 1. Upload metadata
    const metadataRes = await fetch('/api/metadata', {
      method: 'POST',
      body: JSON.stringify({
        title: form.title,
        description: form.description
      })
    });
    const { uri } = await metadataRes.json();

    // 2. Call VaultFactory.createVault()
    const tx = await walletClient.writeContract({
      address: FACTORY_ADDRESS,
      abi: FactoryABI,
      functionName: 'createVault',
      args: [
        parseUnits(form.goal, 6), // USDC decimals
        Math.floor(new Date(form.deadline).getTime() / 1000),
        uri
      ]
    });

    // 3. Wait for confirmation and get vault address
    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
    const vaultAddress = receipt.logs[0].address; // VaultCreated event

    // 4. Redirect to vault Frame
    window.location.href = `/vault/${vaultAddress}`;
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create Savings Vault</h1>

      <input
        type="text"
        placeholder="Goal title (e.g., Emergency Fund)"
        value={form.title}
        onChange={e => setForm({ ...form, title: e.target.value })}
        className="w-full mb-3 p-2 border rounded"
      />

      <input
        type="number"
        placeholder="Goal amount (USDC)"
        value={form.goal}
        onChange={e => setForm({ ...form, goal: e.target.value })}
        className="w-full mb-3 p-2 border rounded"
      />

      <input
        type="date"
        placeholder="Deadline"
        value={form.deadline}
        onChange={e => setForm({ ...form, deadline: e.target.value })}
        className="w-full mb-3 p-2 border rounded"
      />

      <textarea
        placeholder="Description (optional)"
        value={form.description}
        onChange={e => setForm({ ...form, description: e.target.value })}
        className="w-full mb-3 p-2 border rounded h-24"
      />

      <button
        onClick={handleCreate}
        className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold"
      >
        Create Vault
      </button>
    </div>
  );
}
```

---

## 4. Development Timeline

### Week 1-2: Smart Contracts
- [ ] Write Vault.sol and VaultFactory.sol
- [ ] Unit tests (Foundry)
- [ ] Deploy to Base Sepolia
- [ ] Test Aave integration on testnet

### Week 3-4: Backend
- [ ] FastAPI skeleton
- [ ] PostgreSQL setup
- [ ] Event listener
- [ ] API endpoints
- [ ] WebSocket server

### Week 5-6: Frontend
- [ ] Next.js app with Privy
- [ ] Create vault page
- [ ] Farcaster Frames
- [ ] Contribute flow
- [ ] Vault detail page

### Week 7-8: Integration & Testing
- [ ] End-to-end testing
- [ ] 20 internal users on Base Sepolia
- [ ] Fix bugs
- [ ] Performance optimization

### Week 9-10: Security & Launch Prep
- [ ] Basic security review
- [ ] Deploy to Base Mainnet
- [ ] Monitoring setup
- [ ] 100 USDC max per vault (safety limit)

### Week 11-12: Beta Launch
- [ ] 100 early users
- [ ] Iterate based on feedback

---

## 5. Environment Setup

### Smart Contracts

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Create project
forge init banka-contracts
cd banka-contracts

# Install dependencies
forge install OpenZeppelin/openzeppelin-contracts
forge install aave/aave-v3-core

# .env
PRIVATE_KEY=0x...
BASE_SEPOLIA_RPC=https://sepolia.base.org
BASESCAN_API_KEY=...

# Deploy
forge script script/Deploy.s.sol --rpc-url $BASE_SEPOLIA_RPC --broadcast --verify
```

### Backend

```bash
# Create project
mkdir banka-backend
cd banka-backend
python -m venv venv
source venv/bin/activate

# requirements.txt
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
web3==6.11.3
python-dotenv==1.0.0

pip install -r requirements.txt

# .env
DATABASE_URL=postgresql://user:pass@localhost/banka
BASE_RPC_URL=https://sepolia.base.org
FACTORY_ADDRESS=0x...
```

### Frontend

```bash
# Create Next.js app
npx create-next-app@latest banka-frontend
cd banka-frontend

# Install dependencies
npm install @privy-io/react-auth viem wagmi @coinbase/onchainkit frames.js

# .env.local
NEXT_PUBLIC_PRIVY_APP_ID=...
NEXT_PUBLIC_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 6. Key Metrics to Track

### Week 1-4 (Development)
- Smart contracts deployed ✅
- Unit test coverage >80% ✅
- API endpoints functional ✅

### Week 5-8 (Internal Testing)
- 20 test vaults created
- 50+ test contributions
- Zero critical bugs

### Week 9-12 (Beta)
- 100 real users
- 50 vaults created
- $10k TVL
- 70% vault completion rate
- <$0.10 avg gas cost

---

## 7. Critical Decisions

### ✅ Decided
1. **Currency**: USDC only (most stable, widely held)
2. **Yield**: Aave V3 only (most battle-tested)
3. **Wallet**: Privy (better UX than Dynamic for our use case)
4. **Network**: Base (cheap, Farcaster-aligned)
5. **Metadata**: Store in DB (IPFS can be added later)

### ❓ Need to Decide
1. **Max vault amount for beta?** Proposal: 100 USDC per vault (safety)
2. **What happens if goal not reached?** Proposal: Creator can extend deadline indefinitely
3. **Show contributors publicly?** Proposal: Yes, public by default (social proof)

---

## 8. Success Criteria for MVP

**Ship to mainnet if:**
- ✅ 20+ successful test vaults on Sepolia
- ✅ Zero critical bugs in 2 weeks of testing
- ✅ Gas costs <$0.10 per transaction
- ✅ Basic security review passed
- ✅ Frames work in Warpcast app

**Metrics to validate hypothesis:**
- 50% of creators share their vault Frame
- 30% of vaults reach their goal
- 3+ contributions per vault on average
- 40% of users return to create 2nd vault

---

## Next Steps

1. **Today**: Review and approve this spec
2. **Tomorrow**: Set up repos (GitHub)
3. **Day 3**: Deploy first smart contract to Sepolia
4. **Week 1 goal**: Create vault + contribute working on testnet

---

**Questions? Ping me.**
