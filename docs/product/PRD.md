# EthBanka - Product Requirements Document (PRD)

**Version:** 1.0
**Last Updated:** 2025-11-24
**Status:** Active Development
**Team:** Lviv.ETH

---

## Executive Summary

**EthBanka** is a transparent, yield-generating donation platform built on Base blockchain, specifically designed for Ukrainian humanitarian and military fundraising needs. The platform enables creators to launch donation vaults in multiple cryptocurrencies (USDC, ETH, USDT, DAI) that automatically earn 3-8% APY through Aave V3 integration while funds are being collected.

**Key Differentiator:** Unlike МоноБанка (UAH only) or direct wallet donations (no transparency), EthBanka combines:
- Multi-currency support (global accessibility)
- Automatic yield generation (funds work while fundraising)
- Full transparency (on-chain tracking)
- Social proof mechanisms (Farcaster Frames integration)
- Zero platform fees (only gas costs ~$0.01)

**Target Launch:** 3 weeks (MVP with multi-token support)

---

## Problem Statement

### The Context

**Fundraising is essential in 2025 in Ukraine.** Volunteers, NGOs, hospitals, and military units constantly need to raise funds for:
- 🚁 Military equipment (drones, tactical gear, vehicles)
- 🏥 Medical supplies (generators, ultrasound machines, ambulances)
- 🏠 Humanitarian aid (housing, heating, food for displaced families)
- 🔧 Infrastructure repair (schools, hospitals, power grids)

### Current Solutions & Their Limitations

**1. МоноБанка (Ukrainian Bank Jars)**
- ❌ UAH only - limits global donations
- ❌ Bank dependency - censorship risk, downtime
- ❌ No yield generation - money sits idle
- ❌ Limited transparency - trust-based
- ❌ Geographic restrictions

**2. Straight to Wallet (e.g., sternenko.eth)**
- ❌ No progress tracking - donors don't see impact
- ❌ No social proof - hard to build momentum
- ❌ No goal structure - unclear targets
- ❌ No yield - missed opportunity cost
- ❌ Manual tracking - creator burden

**3. Traditional Crowdfunding (GoFundMe, Patreon)**
- ❌ 5-10% platform fees - significant cost
- ❌ Limited crypto support - friction for crypto donors
- ❌ Slow payouts - 5-7 days typical
- ❌ KYC requirements - privacy concerns
- ❌ Geographic restrictions - blocks some countries

**4. Other DeFi/Crypto Solutions**
- ❌ Too complex for non-crypto natives
- ❌ No social integration
- ❌ No yield optimization during fundraising

### User Pain Points

**For Fundraisers (Creators):**
- "I lose 5-10% to platform fees on GoFundMe"
- "МоноБанка only works in Ukraine, I need global support"
- "Money sits idle while I'm fundraising - could be earning interest"
- "Hard to build trust and show transparency"
- "Manual tracking of who donated what is tedious"

**For Donors (Contributors):**
- "I don't know if my donation actually reached the goal"
- "No way to track progress or see impact"
- "Can't donate in my preferred currency (ETH/USDC/etc)"
- "Don't trust centralized platforms with my money"
- "Want to support Ukraine but payment methods are limited"

---

## Solution: EthBanka

### Vision Statement

**EthBanka makes transparent, yield-generating fundraising accessible to everyone.** Create a donation vault in seconds, share it socially, and watch contributions grow automatically through DeFi yields - all with full on-chain transparency.

### Core Value Propositions

1. **Multi-Currency Flexibility**
   - Donate in ETH, USDC, USDT, or DAI
   - Donors choose their preferred currency
   - No forced conversion or friction

2. **Automatic Yield Generation**
   - All contributions automatically deposited to Aave V3
   - Earn 3-8% APY while fundraising
   - Creator gets principal + yield when goal reached

3. **Full Transparency**
   - Every contribution tracked on-chain
   - Real-time progress visible to all
   - Verify yield earned, contributors, timeline

4. **Social Proof & Virality**
   - Share vaults as Farcaster Frames
   - One-click contributions from social feed
   - Progress bars and contributor counts build momentum

5. **Zero Platform Fees**
   - No 5-10% GoFundMe-style fees
   - Only blockchain gas costs (~$0.01 on Base)
   - 100% of donations go to creator (+ yield!)

6. **Global & Permissionless**
   - Anyone with a wallet can create or contribute
   - No KYC, no geographic restrictions
   - Borderless Ukrainian support from diaspora

### How It Works

**Step 1: Create Vault (30 seconds)**
- Connect wallet (Privy integration)
- Choose token (USDC, ETH, USDT, or DAI)
- Set goal amount and deadline
- Add title and description
- Smart contract deployed (~$0.01 gas)

**Step 2: Share & Promote**
- Get unique vault URL
- Share as Farcaster Frame (one-click contribute)
- Post on Twitter, Telegram, Discord
- Embed on website

**Step 3: Receive Contributions**
- Donors contribute in same token as vault
- Funds automatically deposit to Aave V3
- Real-time progress updates via WebSocket
- Contributors visible on vault page

**Step 4: Track Yield**
- Watch donations earn 3-8% APY
- Yield calculation displayed in real-time
- Transparency builds trust

**Step 5: Withdraw or Smash Early**
- **Goal reached:** Withdraw principal + yield
- **Urgent need:** "Smash Vault Early" to withdraw before deadline
- **Deadline passed:** Extend or return to contributors

---

## Target Audience

### Primary: Ukrainian Fundraisers

**Profile:**
- Volunteers collecting for military needs
- NGOs and humanitarian organizations
- Hospital administrators
- Community leaders rebuilding infrastructure
- Crypto-savvy Ukrainians with wallet access

**Characteristics:**
- Age: 25-55
- Location: Ukraine + diaspora
- Tech proficiency: Medium to High
- Already using crypto or willing to learn
- Active on Telegram, Twitter, sometimes Farcaster
- Need $500 - $50,000 per campaign typically

**Motivations:**
- Raise funds quickly for urgent needs
- Build trust through transparency
- Maximize every dollar with yield
- Reach global audience (diaspora, international supporters)

**Use Cases:**
- 🚁 FPV drone purchase ($500-$5,000)
- 🏥 Medical equipment ($2,000-$20,000)
- 🛡️ Tactical gear for unit ($1,000-$10,000)
- 🏠 Housing repairs ($5,000-$50,000)
- 🚑 Ambulance purchase ($15,000-$30,000)

### Secondary: Crypto Early Adopters

**Profile:**
- Farcaster community members
- Base ecosystem participants
- DeFi users familiar with Aave
- Crypto Twitter influencers

**Characteristics:**
- Age: 25-40
- Location: Global
- Tech proficiency: High
- Already have wallet, understand DeFi yields
- Active on Farcaster, Crypto Twitter

**Motivations:**
- Support Ukraine from abroad
- Use crypto for social good
- Try new DeFi applications
- Earn while helping (yield alignment)

**Use Cases:**
- 🎉 Group gifts with friends (birthday, wedding)
- 🏫 Community projects with DAO
- 🎓 Scholarship fundraising
- 🤝 Charity drives for causes

### User Personas

**Persona 1: Maksym, Volunteer Drone Coordinator**
- Age: 32, Kyiv
- Needs: Raise $3,000 for 6 FPV drones for frontline unit
- Pain: МоноБанка only works in Ukraine, diaspora can't donate easily
- Goal: Get global donations in USDC, transparent tracking
- Quote: *"I need everyone to see exactly how much we've raised and where it's going. Trust is everything."*

**Persona 2: Olena, Hospital Administrator**
- Age: 45, Lviv
- Needs: Raise $15,000 for backup generator
- Pain: GoFundMe takes 10% fee + slow payout
- Goal: Keep 100% of donations, get money fast
- Quote: *"Every dollar counts. We can't afford to lose 10% to fees when lives are at stake."*

**Persona 3: Mark, Crypto Donor (US Diaspora)**
- Age: 29, San Francisco
- Needs: Support Ukrainian causes with his ETH holdings
- Pain: Hard to verify if donations reach intended recipients
- Goal: Donate ETH transparently, see impact
- Quote: *"I have ETH sitting in my wallet. If I can donate AND see it earn yield while helping Ukraine, that's perfect."*

---

## User Stories

### Epic 1: Vault Creation

**US1.1: As a fundraiser, I want to create a vault in under 1 minute so I can start collecting donations immediately.**
- Acceptance Criteria:
  - Connect wallet with 1 click (Privy)
  - Choose from 4 tokens (USDC, ETH, USDT, DAI)
  - Set goal amount and deadline (calendar picker)
  - Add title (max 100 chars) and description (max 500 chars)
  - Deploy contract with 1 transaction (~$0.01)
  - Receive shareable URL immediately

**US1.2: As a fundraiser, I want to see the current APY for each token so I can choose the best yield option.**
- Acceptance Criteria:
  - Display real-time APY from Aave V3 for each token
  - Show APY percentage next to token selector
  - Update APY every 5 minutes

**US1.3: As a fundraiser, I want to preview my vault before deploying so I can verify all details are correct.**
- Acceptance Criteria:
  - Preview modal shows: token, goal, deadline, title, description
  - Edit button to go back and change
  - Confirm button to deploy

### Epic 2: Contributing

**US2.1: As a donor, I want to contribute to a vault in my preferred currency so I don't have to convert tokens.**
- Acceptance Criteria:
  - Connect wallet
  - See vault token (can only contribute in same token)
  - Enter contribution amount
  - Approve token spending (if first time)
  - Confirm transaction
  - See contribution reflected in progress bar immediately

**US2.2: As a donor, I want to contribute directly from Farcaster Frame so I don't have to leave the app.**
- Acceptance Criteria:
  - Frame shows vault details (title, progress, goal, yield)
  - Contribute button opens wallet
  - Transaction signing in Farcaster app
  - Confirmation displayed in Frame

**US2.3: As a donor, I want to see all contributors so I can verify the fundraiser is legitimate.**
- Acceptance Criteria:
  - Contributor list shows wallet addresses
  - Amounts contributed per address
  - Timestamp of contributions
  - ENS names displayed if available

### Epic 3: Tracking & Transparency

**US3.1: As a user, I want to see real-time progress so I know how close the vault is to its goal.**
- Acceptance Criteria:
  - Progress bar (% to goal)
  - Current amount / Goal amount in token
  - USD equivalent (optional)
  - Number of contributors
  - Yield earned so far

**US3.2: As a user, I want to see yield being earned in real-time so I can verify Aave integration works.**
- Acceptance Criteria:
  - "Yield Earned" field updates every minute
  - Shows token amount and USD equivalent
  - Links to Aave pool for verification

**US3.3: As a user, I want to verify transactions on-chain so I can trust the platform.**
- Acceptance Criteria:
  - Every vault has Basescan link
  - Every contribution has transaction hash
  - Link to Aave pool showing deposits

### Epic 4: Withdrawal

**US4.1: As a fundraiser, I want to withdraw funds when goal is reached so I can use them.**
- Acceptance Criteria:
  - "Withdraw" button appears when goal reached
  - Shows total balance (principal + yield)
  - Single transaction withdraws everything
  - Funds arrive in creator wallet

**US4.2: As a fundraiser, I want to withdraw early if there's an urgent need.**
- Acceptance Criteria:
  - "Smash Vault Early" button visible before deadline
  - Warning modal: "Are you sure? You can't undo this"
  - Withdraw current balance even if goal not reached
  - Vault status changes to "Closed Early"

**US4.3: As a fundraiser, I want to extend the deadline if I'm close to the goal.**
- Acceptance Criteria:
  - "Extend Deadline" button if past deadline
  - Choose new deadline (max +30 days)
  - Vault remains active

---

## Features & Requirements

### Phase 1: USDC Foundation (Week 1)

**Must Have:**
- Vault.sol smart contract (USDC only)
  - Initialize: creator, goal, deadline
  - Contribute: accept USDC, deposit to Aave
  - Withdraw: return principal + yield to creator
  - Goal tracking, deadline enforcement
- VaultFactory.sol (EIP-1167 minimal proxy pattern)
  - createVault function
  - VaultCreated event emission
- Backend API (FastAPI + PostgreSQL)
  - GET /vaults (list with filters)
  - GET /vaults/{address} (details)
  - GET /vaults/{address}/contributions
  - POST /vaults (create - triggers blockchain tx)
- Event Listener
  - Index VaultCreated events
  - Index Contributed events
  - Update database in real-time
- Frontend (Next.js 14)
  - Home page (vault list)
  - Create vault page (USDC only)
  - Vault detail page (progress, contributions)
  - Wallet connection (Privy)

**Won't Have (Week 1):**
- Multi-token support (ETH, USDT, DAI)
- Farcaster Frames
- WebSocket real-time updates
- Private contributions (ZK)

### Phase 2: Multi-Token Integration (Week 2) - PRIORITY #1

**Must Have:**
- Smart Contract Updates
  - Refactor Vault.sol to accept tokenAddress parameter
  - Support USDC, WETH (Wrapped ETH), USDT, DAI
  - Dynamic Aave V3 pool integration per token
  - VaultFactory updates for token selection
  - Events include token information
- Backend Updates
  - Database: Add token_address, token_symbol columns
  - API: Token parameter in vault creation
  - Event listener: Track multiple token types
  - Token metadata constants (symbols, decimals, APY)
- Frontend Updates
  - Token selector dropdown in create vault
  - Display token icon + symbol throughout UI
  - Show token-specific APY from Aave
  - Multi-token balance checks
  - Approve spending for each token type
- Testing
  - End-to-end tests for all 4 tokens
  - Create → Contribute → Withdraw flow per token
  - Verify Aave yields for each token
  - Gas cost comparison

**Should Have:**
- Currency conversion display (show USD equivalent)
- Token recommendation based on goal size
- Gas cost estimates per token

**Won't Have (Week 2):**
- Privacy features (Aztec/Noir)
- Fiat on-ramp

### Phase 3: Frames, Polish, Launch (Week 3)

**Must Have:**
- Farcaster Frames Integration
  - Frame metadata endpoint (OG images)
  - Frame image generation (vault details, progress bar)
  - Contribute action endpoint (transaction signing)
  - Support all 4 tokens in Frames
  - QR code generation with vault address
- WebSocket Real-time Updates
  - ConnectionManager for vault-specific channels
  - Broadcast contribution events
  - Live progress bar updates
- Production Deployment
  - Smart contracts deployed to Base Sepolia
  - Backend hosted on Railway
  - Frontend deployed to Vercel
  - Database backups configured
  - Monitoring setup (Sentry)
- Polish
  - Error handling (no balance, wrong network, wrong token)
  - Loading states throughout app
  - Mobile responsive design
  - Accessibility (WCAG 2.1 AA basics)

**Should Have:**
- Share buttons (Twitter, Telegram, copy link)
- Embed code for websites
- Vault categories (Military, Medical, Humanitarian)

**Won't Have (Week 3):**
- User profiles
- Email notifications
- Private contributions (ZK)
- Analytics dashboard

### Phase 4: Post-Launch (Future)

**High Priority:**
- Privacy features (Aztec/Noir integration)
- Recurring contributions (monthly donations)
- User profiles with vault history
- Email/Push notifications
- Vault templates for common use cases

**Medium Priority:**
- Advanced analytics dashboard
- Vault categories and filtering
- Mobile app (React Native)
- Mainnet deployment after audit

**Low Priority:**
- DAO governance
- Cross-chain (Optimism, Arbitrum)
- NFT rewards for top contributors
- Fiat on-ramp (credit card donations)

---

## Technical Requirements

### Smart Contracts (Solidity)

**Technology Stack:**
- Solidity 0.8.24
- Foundry (development framework)
- OpenZeppelin Contracts (Clones, Initializable, ReentrancyGuard)
- Aave V3 Protocol integration

**Key Contracts:**

**Vault.sol**
```solidity
contract Vault is Initializable, ReentrancyGuard {
    address public creator;
    address public tokenAddress;        // USDC/WETH/USDT/DAI
    uint256 public goalAmount;
    uint256 public deadline;
    uint256 public totalContributed;
    bool public goalReached;
    bool public withdrawn;

    IPool public aavePool;             // Aave V3 Pool

    event Contributed(address contributor, uint256 amount);
    event Withdrawn(address creator, uint256 principal, uint256 yield);

    function initialize(...) external initializer;
    function contribute(uint256 amount) external nonReentrant;
    function withdraw() external nonReentrant;
    function smashVaultEarly() external nonReentrant;
}
```

**VaultFactory.sol**
```solidity
contract VaultFactory {
    address public vaultImplementation;

    event VaultCreated(
        address indexed vault,
        address indexed creator,
        address indexed tokenAddress,
        uint256 goalAmount,
        uint256 deadline
    );

    function createVault(
        address tokenAddress,
        uint256 goalAmount,
        uint256 deadline,
        string calldata title,
        string calldata description
    ) external returns (address);
}
```

**Requirements:**
- Gas optimization (target: <100k gas for vault creation via clone)
- Security: ReentrancyGuard, access control, input validation
- Events for all state changes (indexing)
- Upgradeable via minimal proxy pattern
- Pausable in emergency (future)

### Backend (Python)

**Technology Stack:**
- FastAPI 0.104+
- PostgreSQL 15
- SQLAlchemy ORM
- Web3.py for blockchain interaction
- WebSockets (Starlette)

**Database Schema:**
```sql
CREATE TABLE vaults (
    address VARCHAR PRIMARY KEY,
    creator VARCHAR NOT NULL,
    token_address VARCHAR NOT NULL,
    token_symbol VARCHAR NOT NULL,
    goal_amount DECIMAL NOT NULL,
    deadline BIGINT NOT NULL,
    total_contributed DECIMAL DEFAULT 0,
    yield_earned DECIMAL DEFAULT 0,
    status VARCHAR DEFAULT 'active',
    title VARCHAR(100),
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contributions (
    id SERIAL PRIMARY KEY,
    vault_address VARCHAR REFERENCES vaults(address),
    contributor VARCHAR NOT NULL,
    amount DECIMAL NOT NULL,
    tx_hash VARCHAR UNIQUE NOT NULL,
    block_number BIGINT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE supported_tokens (
    address VARCHAR PRIMARY KEY,
    symbol VARCHAR NOT NULL,
    decimals INT NOT NULL,
    aave_pool VARCHAR NOT NULL,
    current_apy DECIMAL
);
```

**API Endpoints:**
- GET /vaults (filters: status, token, creator)
- GET /vaults/{address}
- GET /vaults/{address}/contributions
- POST /vaults (triggers contract deployment)
- GET /tokens (supported tokens with current APY)
- GET /health

**Event Listener Requirements:**
- Poll Base RPC every 5-10 seconds
- Listen to VaultCreated and Contributed events
- Update database immediately
- Broadcast to WebSocket subscribers
- Handle RPC failures gracefully (retry logic)
- Track last processed block (avoid duplicates)

### Frontend (TypeScript/React)

**Technology Stack:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Privy (wallet authentication)
- Viem + Wagmi (blockchain interactions)
- SWR (data fetching)

**Pages:**
- / (Home - vault list)
- /create (Create vault form)
- /vaults/[address] (Vault detail)
- /about (How it works)

**Components:**
- TokenSelector (dropdown with APY display)
- VaultCard (list item with progress bar)
- ProgressBar (visual goal tracking)
- ContributionForm (amount input + contribute button)
- ContributorList (table of contributors)
- WithdrawButton (conditional display)

**Requirements:**
- Responsive design (mobile-first)
- Dark mode support
- Loading skeletons
- Error boundaries
- Optimistic UI updates
- Accessibility (keyboard navigation, screen readers)

### Infrastructure

**Blockchain:**
- Base Sepolia (testnet) - Development & Testing
- Base Mainnet - Production (post-audit)
- Aave V3 pools on Base

**Hosting:**
- Frontend: Vercel (auto-deploy from GitHub)
- Backend: Railway or Fly.io ($5-10/month)
- Database: Railway PostgreSQL or Supabase

**Monitoring:**
- Sentry (error tracking)
- Vercel Analytics (frontend)
- Custom dashboards (vault creation rate, TVL)

**CI/CD:**
- GitHub Actions
- Auto-test on PR
- Auto-deploy to staging
- Manual deploy to production

---

## Success Metrics

### 🎯 North Star Metric (Week 2-3 Goal)

**PRIMARY SUCCESS CRITERION:**
- **✅ Create 1 real military fundraiser vault via Farcaster by end of Week 2-3**
  - Real Ukrainian volunteer/unit
  - Actual military need (drone, gear, equipment)
  - Shared as Farcaster Frame
  - Receives at least 3 real contributions
  - Goal: $500-$5,000 (realistic military need)

**Why this matters:**
- Validates product-market fit with actual users
- Proves Farcaster integration works in real scenario
- Demonstrates multi-token flexibility for real donations
- Creates first case study for marketing
- Tests full end-to-end flow with real stakes

**Success looks like:**
- Week 2 end: Platform ready, volunteer identified, vault created
- Week 3: Vault shared on Farcaster, first contributions received
- Post-Week 3: Vault reaches goal, funds withdrawn for military purpose

---

### Phase 1 (Week 1-3): MVP Launch

**Adoption Metrics:**
- ✅ 10-15 beta users onboarded
- ✅ 6 test vaults created (2 per token type minimum)
- ✅ **1 REAL military vault created** (PRIMARY GOAL)
- ✅ 20+ contributions across all vaults (including real vault)
- ✅ 50+ unique visitors to landing page

**Engagement Metrics:**
- Average 3 contributions per vault
- **Real military vault: Minimum 3 contributions from different wallets**
- 60%+ vaults reach at least 50% of goal
- 5+ Farcaster Frame shares (real military vault shared multiple times)

**Technical Metrics:**
- <2s page load time
- 0 critical bugs in production
- 99% uptime
- All 4 tokens (ETH, USDT, DAI, USDC) working end-to-end
- **Farcaster Frame working perfectly for real vault**

**Learning Metrics:**
- User interviews with 5 beta testers
- **Feedback from real military fundraiser**
- Top 3 feature requests collected
- Conversion funnel mapped (landing → create vault → contribution)
- **Real vault performance analysis (traffic sources, conversion rate)**

### Phase 2 (Month 1-3): Beta Growth

**Adoption:**
- 100+ registered users
- 50+ vaults created
- $10,000+ TVL (Total Value Locked)
- 200+ contributions

**Engagement:**
- 70%+ vaults reach at least 75% of goal
- Average 5 contributions per vault
- 10+ Frame shares per vault

**Ukrainian Impact:**
- 20+ Ukrainian volunteer vaults
- 5+ successful military equipment purchases
- 3+ medical equipment funds completed

### Phase 3 (Month 4-6): Scale

**Adoption:**
- 1,000+ users
- 500+ vaults created
- $100,000+ TVL
- 10+ vaults over $10,000

**Business:**
- Partnership with 3+ Ukrainian NGOs
- Featured in 2+ crypto media outlets
- Grant from Base, Aave, or similar ecosystem

**Community:**
- 500+ Discord members
- 1,000+ Twitter followers
- Active Telegram group (200+ members)

---

## Go-to-Market Strategy

### Week 1-3: Soft Launch + Real Military Vault (PRIORITY)

**Target:** 10-15 testers + 1 REAL military fundraiser

**Week 1-2 Activities:**
- Personal outreach to friends in crypto/Ukraine space
- Test vaults created for small goals
- **PRIORITY: Identify real Ukrainian volunteer for military vault**
  - Reach out to personal network of volunteers
  - Find someone with actual military need ($500-5000 range)
  - Verify legitimacy (social media presence, vouching)
  - Brief them on how EthBanka works
- Collect feedback daily from test users
- Bug fixes and iterations

**Week 3 Activities:**
- **Create real military vault with volunteer**
  - Help choose token (probably USDC or ETH)
  - Set realistic goal and deadline
  - Create compelling title and description
  - Generate Farcaster Frame
- **Share vault strategically:**
  - Volunteer shares in their Telegram groups
  - Post in Farcaster /ukraine and /base channels
  - Team amplifies on personal Twitter/Farcaster
  - Direct outreach to known Ukrainian supporters
- Monitor first contributions closely
- Support volunteer with any issues
- Document entire process for case study

**Channels:**
- Direct messages (volunteer recruitment)
- Personal Twitter posts
- Farcaster posts in /base and /ukraine channels
- Ukrainian Telegram groups (via volunteer)
- Personal networks of volunteer (biggest source)

### Week 4-6: Public Beta (Ukrainian Focus)

**Target:** 50-100 Ukrainian fundraisers

**Activities:**
- Outreach to Ukrainian volunteer Telegram groups
- Guest posts in Ukrainian crypto communities
- Tutorial videos (Ukrainian + English)
- Press release to Ukrainian tech media

**Channels:**
- Ukrainian Telegram channels (volunteer coordinators)
- Twitter outreach to Ukrainian crypto accounts
- Farcaster /ukraine channel
- Direct partnerships with 2-3 known fundraisers

**Key Message:**
*"Raise funds for Ukraine with zero fees, automatic yield, and full transparency. Accept donations in USDC, ETH, USDT, or DAI from supporters worldwide."*

### Month 2-3: Ecosystem Expansion

**Target:** 200-500 users, expand beyond Ukraine

**Activities:**
- Apply for Base ecosystem grants
- Apply for Aave grants program
- Sponsor small crypto events
- Influencer partnerships (micro-influencers in Ukraine/crypto)
- Content marketing (blog posts, case studies)

**Channels:**
- Crypto Twitter (promoted tweets)
- Farcaster paid promotions
- Base Discord community
- Aave community forums
- Reddit (r/CryptoCurrency, r/ukraine)

**Key Message:**
*"Transparent crowdfunding powered by DeFi yields. Create a vault in 30 seconds, share it anywhere, earn while you raise."*

### Month 4+: Scale & Partnerships

**Target:** 1,000+ users, diversify use cases

**Activities:**
- Strategic partnerships with DAOs and communities
- Integration with other platforms (embed EthBanka in partner sites)
- Hackathon sponsorships
- Conference speaking (presenting EthBanka)
- Ambassador program

**Channels:**
- All previous channels (scaled up)
- Podcast tour (crypto podcasts)
- Newsletter sponsorships
- YouTube creator partnerships

---

## Competitive Analysis

### Direct Competitors

**1. PoolTogether (DeFi Savings)**
- Model: Prize-linked savings (lottery)
- Strengths: Established, audited, large community
- Weaknesses: Not fundraising focused, no social features, no privacy
- Differentiation: EthBanka = explicit goals, not lottery-based

**2. Mirror (Creator Crowdfunding)**
- Model: NFT-based crowdfunding for creators
- Strengths: Large creator community, editorial platform
- Weaknesses: NFT focused, no yield generation, complex for non-crypto
- Differentiation: EthBanka = simpler, yield-focused, multi-currency

**3. Gitcoin Grants (Open Source Funding)**
- Model: Quadratic funding for public goods
- Strengths: Matching pools, large ecosystem
- Weaknesses: Complex mechanism, quarterly rounds only, no individual use
- Differentiation: EthBanka = instant, continuous, personal use cases

### Indirect Competitors

**4. GoFundMe**
- Model: Traditional web2 crowdfunding
- Strengths: Massive user base, trusted brand, fiat on-ramp
- Weaknesses: 5-10% fees, slow payouts, KYC required, limited crypto
- Differentiation: EthBanka = 0% fees, instant, crypto-native, yield generation

**5. МоноБанка (Ukrainian Bank Jars)**
- Model: Bank-integrated donation jars
- Strengths: Easy for Ukrainians, UAH native, trusted locally
- Weaknesses: UAH only, no international, no yield, bank dependency
- Differentiation: EthBanka = global currencies, yield, permissionless

**6. Direct Wallet Donations (e.g., sternenko.eth)**
- Model: Just send crypto to an address
- Strengths: Simple, direct, no intermediary
- Weaknesses: No tracking, no goals, no social proof, no yield
- Differentiation: EthBanka = progress tracking, goals, social features, yield

### Competitive Advantages

**Unique Position: Only platform combining:**
1. Multi-token fundraising (ETH, USDC, USDT, DAI)
2. Automatic DeFi yield generation (Aave V3)
3. Social integration (Farcaster Frames)
4. Ukrainian fundraising focus
5. Zero platform fees
6. Full transparency on-chain

**Moats:**
- First-mover in multi-token crowdfunding with yields
- Ukrainian community relationships
- Farcaster/Base ecosystem integration
- Open source (community trust)

---

## Risk Analysis & Mitigation

### Technical Risks

**Risk 1: Smart Contract Vulnerabilities**
- Impact: High (funds loss, reputation damage)
- Likelihood: Medium
- Mitigation:
  - Use OpenZeppelin audited libraries
  - Comprehensive test coverage (>90%)
  - Internal code review
  - External audit before mainnet (post-beta)
  - Start with small amounts on testnet
  - Bug bounty program (post-launch)

**Risk 2: Aave V3 Integration Complexity**
- Impact: Medium (feature delay)
- Likelihood: Medium
- Mitigation:
  - Use Aave official documentation
  - Test on multiple tokens separately
  - Fallback: Start USDC-only, add others incrementally
  - Join Aave Discord for support

**Risk 3: Gas Cost Volatility**
- Impact: Low (user experience)
- Likelihood: High
- Mitigation:
  - Base L2 has stable low fees (~$0.01)
  - Display gas estimates upfront
  - Batch operations where possible

### Market Risks

**Risk 4: Low Adoption in Target Market**
- Impact: High (product failure)
- Likelihood: Medium
- Mitigation:
  - Start with personal network (10-15 guaranteed testers)
  - Direct outreach to Ukrainian volunteers before launch
  - Partnership with established fundraisers (social proof)
  - Iterate quickly based on feedback

**Risk 5: Crypto Market Downturn**
- Impact: Medium (reduced activity)
- Likelihood: Medium
- Mitigation:
  - Stablecoins (USDC, USDT) less affected
  - Ukrainian fundraising need is constant (not market-dependent)
  - Low operational costs (<$50/month)

**Risk 6: Regulatory Uncertainty**
- Impact: High (potential shutdown)
- Likelihood: Low (short-term)
- Mitigation:
  - Non-custodial (we don't hold funds)
  - Decentralized smart contracts (hard to shut down)
  - Target global audience (not US-only)
  - Consult legal if scaling significantly

### Operational Risks

**Risk 7: Team Capacity (3-person team)**
- Impact: Medium (feature delays)
- Likelihood: High
- Mitigation:
  - Ruthless prioritization (multi-token over ZK)
  - MVP scope clearly defined
  - Defer nice-to-haves aggressively
  - Community contributions (open source)

**Risk 8: Dependency on Third Parties**
- Impact: Medium (service interruption)
- Likelihood: Low
- Mitigation:
  - Aave V3: Battle-tested protocol, low risk
  - Base RPC: Use multiple providers (Alchemy + public)
  - Vercel/Railway: Have backup deployment plan
  - Privy: Offer WalletConnect as alternative

---

## Product Roadmap

### ✅ Phase 0: Foundation (Pre-Launch)
- Research and competitive analysis
- Technical architecture design
- Team formation
- Initial wireframes and designs

### 🔄 Phase 1: USDC MVP (Week 1)
- Smart contracts (Vault.sol, VaultFactory.sol) - USDC only
- Backend API + Event Listener
- Frontend (home, create, detail pages)
- Deploy to Base Sepolia testnet

### 🚀 Phase 2: Multi-Token (Week 2) - CURRENT PRIORITY
- Refactor contracts for ETH, USDT, DAI support
- 4 Aave V3 pool integrations
- Token selector UI
- Database schema updates
- End-to-end testing all tokens

### 🎉 Phase 3: Launch (Week 3)
- Farcaster Frames integration
- WebSocket real-time updates
- Production deployment (Vercel + Railway)
- Beta testing (10-15 users)
- Bug fixes and polish

### 📈 Phase 4: Growth (Month 2-3)
- User onboarding improvements
- Vault categories (Military, Medical, Humanitarian)
- Share features optimization
- Marketing push (Ukrainian communities)
- Analytics dashboard

### 🔮 Phase 5: Advanced Features (Month 4-6)
- Privacy features (Aztec/Noir integration)
- User profiles and history
- Recurring contributions
- Email/Push notifications
- Mobile app (React Native)

### 🏛️ Phase 6: Scale (Month 7-12)
- Mainnet deployment (post-audit)
- DAO governance
- Cross-chain expansion (Optimism, Arbitrum)
- Fiat on-ramp partnerships
- Enterprise features

---

## Open Questions & Decisions Needed

### Product Questions

1. **Should we support vault extensions (extending deadline)?**
   - **Decision:** Yes - Allow 1 extension of up to 30 days
   - **Rationale:** Flexibility for fundraisers near their goal

2. **Should contributors be able to withdraw if goal not met?**
   - **Decision:** Phase 2 feature - Not MVP
   - **Rationale:** Adds complexity, focus on successful vaults first

3. **Should we display contributor names or just addresses?**
   - **Decision:** Addresses + ENS resolution
   - **Rationale:** Privacy-preserving by default, but readable if ENS set

4. **Maximum vault duration?**
   - **Decision:** 90 days max
   - **Rationale:** Keeps momentum, prevents indefinite open vaults

### Technical Questions

1. **Use Aave V2 or V3?**
   - **Decision:** Aave V3
   - **Rationale:** Better capital efficiency, newer version, Base support

2. **Wrapped ETH (WETH) or native ETH?**
   - **Decision:** WETH (ERC20 standard)
   - **Rationale:** Simpler contract logic, consistent interface

3. **Upgradeable contracts or immutable?**
   - **Decision:** Immutable with proxy pattern for factory
   - **Rationale:** Security > flexibility for MVP

4. **Centralized or decentralized event indexing?**
   - **Decision:** Centralized (our backend)
   - **Rationale:** Simpler, faster, good enough for MVP

### Business Questions

1. **Introduce fees in future?**
   - **Decision:** TBD - Monitor operational costs first
   - **Option:** 1-2% optional "tip" to support platform

2. **Apply for grants?**
   - **Decision:** Yes - Base and Aave grants after MVP
   - **Timeline:** Week 4-6

3. **Open source from day 1?**
   - **Decision:** Yes
   - **Rationale:** Trust, community, ecosystem alignment

---

## Appendix

### Token Addresses (Base Sepolia)

**Supported Tokens:**
- USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- WETH: [TBD - Check Aave docs]
- USDT: [TBD - Check Aave docs]
- DAI: [TBD - Check Aave docs]

**Aave V3:**
- Pool: `0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b`

### Resources

**Technical:**
- Aave V3 Docs: https://docs.aave.com/developers
- Base Docs: https://docs.base.org
- Farcaster Frames Spec: https://docs.farcaster.xyz/reference/frames/spec
- OpenZeppelin Contracts: https://docs.openzeppelin.com/contracts

**Community:**
- Base Discord: https://discord.gg/buildonbase
- Aave Discord: https://discord.gg/aave
- Farcaster: https://warpcast.com

**Ukrainian Context:**
- Ukrainian Volunteer Telegram: [Multiple groups]
- Come Back Alive Foundation: https://savelife.in.ua
- United24: https://u24.gov.ua

### Team

**Anton (Developer):**
- Smart contracts, Backend, Frontend
- Focus: Multi-token integration Week 2

**Andriy (QA/Ops):**
- Testing, Deployment, Infrastructure
- Focus: Multi-token testing across all 4 tokens

**Karina (Marketing/Community):**
- Content, Community, Partnerships
- Focus: Ukrainian volunteer outreach

**Contact:**
- Demo: https://bankacast.netlify.app
- ENS: kozak.eth
- Built at: Lviv.ETH

---

**Document Control:**
- Version: 1.0
- Last Updated: 2025-11-24
- Next Review: Weekly during MVP development
- Owner: Product Team (Lviv.ETH)
