# Product Requirements Document: Banka - Social Savings Vaults

**Version:** 1.0
**Date:** November 16, 2025
**Author:** CTO
**Status:** Draft for Review

---

## 1. Product Overview

### 1.1 Executive Summary
Banka is a social savings platform that enables groups to pool funds for shared or individual goals through Farcaster Frames on Base L2. The platform combines the social proof mechanisms of crowdfunding with automated DeFi yield generation, making group savings transparent, engaging, and profitable.

### 1.2 Core Value Proposition
- **For Savers**: Create goal-based savings vaults and invite friends to contribute, with automatic yield generation increasing the total saved amount
- **For Contributors**: Support friends' goals with one-click contributions directly from Farcaster feed, with social proof and trust mechanisms
- **For Everyone**: Transparent, trustless smart contracts ensure funds are safe and can only be withdrawn when goals are met or returned if unsuccessful

### 1.3 Product Positioning
Positioned at the intersection of:
- Social finance (like GoFundMe/Kickstarter but for private goals)
- DeFi yield optimization (like Yearn/Aave but social)
- Web3 social platforms (native Farcaster integration)

---

## 2. Objectives & Goals

### 2.1 Business Objectives
1. **Adoption**: Onboard 10,000 users in first 6 months post-launch
2. **TVL**: Reach $1M Total Value Locked within Q1 2026
3. **Engagement**: Achieve 40% monthly active user rate among registered users
4. **Viral Coefficient**: Target k-factor of 1.5+ through social sharing mechanics

### 2.2 Product Goals
1. Enable vault creation and contribution in ≤3 clicks from Farcaster feed
2. Achieve >95% smart contract uptime and zero security incidents
3. Generate average APY of 3-8% on deposited funds through yield strategies
4. Process transactions with <$0.10 average gas cost on Base L2

### 2.3 User Experience Goals
1. Sub-30 second onboarding for new users (wallet creation to first action)
2. Real-time progress updates visible within Farcaster frames
3. Mobile-first experience optimized for Base app

---

## 3. Target Users

### 3.1 Primary Persona: "The Goal Setter"
- **Demographics**: 25-40 years old, crypto-curious but not necessarily crypto-native
- **Characteristics**:
  - Active on Farcaster (at least weekly engagement)
  - Has savings goals (wedding, vacation, emergency fund, group gift)
  - Values transparency and social accountability
  - Comfortable with mobile-first apps
- **Pain Points**:
  - Traditional savings accounts have minimal interest
  - Coordinating group contributions is manual and opaque
  - Lack of accountability for personal savings goals

### 3.2 Secondary Persona: "The Supporter"
- **Demographics**: 20-45 years old, Farcaster-active social connector
- **Characteristics**:
  - Wants to support friends' goals
  - Appreciates low friction (no app switching)
  - Values social proof and community
  - Trusts smart contract guarantees over centralized platforms
- **Pain Points**:
  - Venmo/PayPal feels transactional, not goal-oriented
  - No visibility into whether contributions are actually used for stated purpose
  - Wants to contribute small amounts without high fees

### 3.3 Tertiary Persona: "The Yield Optimizer"
- **Demographics**: 30-50 years old, DeFi-savvy investor
- **Characteristics**:
  - Understands yield strategies and APYs
  - Wants to maximize returns on idle capital
  - Values composability and permissionless systems
- **Pain Points**:
  - Managing multiple DeFi positions is time-consuming
  - Wants social accountability for savings discipline

---

## 4. User Stories & Use Cases

### 4.1 Core User Flows

#### Use Case 1: Creating a Vault
**As a Goal Setter**, I want to create a savings vault so that I can pool funds for a specific goal.

**Acceptance Criteria:**
- User opens Banka Frame in Farcaster feed
- Clicks "Create Vault" button
- Fills form: Goal name, target amount (ETH/USDC), deadline, description, visibility (public/private)
- Optionally sets contribution limits (min/max per person)
- Signs transaction to deploy vault contract
- Receives shareable Frame link
- Vault appears in user's dashboard

**Success Metrics:** <30 seconds from click to deployed vault

---

#### Use Case 2: Contributing to a Vault
**As a Supporter**, I want to contribute to a friend's vault with one click.

**Acceptance Criteria:**
- User sees vault Frame in Farcaster feed (shared by creator or mutual friend)
- Frame displays: progress bar, goal amount, deadline, contributors list, social proof
- User enters contribution amount or selects preset amounts ($10, $25, $50, $100)
- Clicks "Contribute" button
- Signs transaction via smart wallet (passkey)
- Contribution confirmed with animation
- User's name/avatar appears in contributors list
- Creator receives notification

**Success Metrics:** <10 seconds from view to confirmed contribution

---

#### Use Case 3: Reaching Goal & Withdrawal
**As a Goal Setter**, I want to withdraw funds when my goal is reached.

**Acceptance Criteria:**
- Vault reaches 100% of target amount
- Creator receives notification
- Creator navigates to vault detail page
- Clicks "Withdraw Funds" button
- Funds (principal + accumulated yield) transfer to creator's wallet
- Vault status updates to "Completed"
- All contributors receive completion notification with final yield stats

**Success Metrics:** Instant withdrawal when threshold met, no manual approval needed

---

#### Use Case 4: Failed Vault (Deadline Missed)
**As a Contributor**, I want my funds returned if the goal isn't reached.

**Acceptance Criteria:**
- Vault deadline passes without reaching 100% goal
- All contributors receive notification
- Each contributor can claim refund (principal + their share of yield)
- Refund process is permissionless (no creator approval needed)
- Vault status updates to "Failed - Refundable"

**Success Metrics:** Zero disputes on refunds, 100% automated

---

### 4.2 Advanced User Flows

#### Use Case 5: Social Discovery
**As a Supporter**, I want to discover trending vaults in my network.

**Acceptance Criteria:**
- "Discover" tab shows vaults from connections
- Filtering by: category, amount needed, time remaining, yield generated
- Sorting by: most contributed, highest yield, ending soon
- Social proof indicators: "5 mutual friends contributed"

---

#### Use Case 6: Trust & Reputation
**As a Supporter**, I want to verify the creator's trustworthiness before contributing.

**Acceptance Criteria:**
- Creator profile shows: Farcaster attestations, past vaults created, completion rate
- Trust score based on: account age, social graph, previous vault outcomes
- "Verified" badge for creators with >3 successful vaults

---

## 5. Functional Requirements

### 5.1 Vault Management
| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FM-1 | Deploy new vault contract via factory pattern | P0 | EIP-1167 minimal proxies for gas efficiency |
| FM-2 | Support ETH, USDC, DAI as deposit currencies | P0 | Multi-asset vaults in V2 |
| FM-3 | Set goal amount (target), deadline, min/max contribution | P0 | Enforced at smart contract level |
| FM-4 | Auto-deposit to yield protocol on contribution | P0 | Aave V3 or Moonwell integration |
| FM-5 | Timelock mechanism (e.g., 7-day withdrawal delay after goal reached) | P1 | Security feature for dispute window |
| FM-6 | Emergency pause functionality for creator (with cooldown) | P2 | Edge case protection |
| FM-7 | Vault templates (Wedding, Emergency Fund, Group Gift, etc.) | P1 | Onboarding aid |

### 5.2 Contribution System
| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FC-1 | One-click contribution from Farcaster Frame | P0 | Core UX requirement |
| FC-2 | Preset contribution amounts + custom input | P0 | $10, $25, $50, $100, Custom |
| FC-3 | Real-time progress bar update post-contribution | P0 | WebSocket or polling |
| FC-4 | Contributor list with avatars/usernames | P0 | Privacy: show only to vault participants |
| FC-5 | Contribution limits (min/max per wallet) | P1 | Prevents spam/manipulation |
| FC-6 | Recurring contributions (optional) | P2 | V2 feature |

### 5.3 Yield Generation
| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FY-1 | ERC-4626 wrapper for yield strategies | P0 | Standard interface for composability |
| FY-2 | Auto-compound yield daily | P0 | Maximize returns |
| FY-3 | Display real-time APY and yield earned | P0 | Transparency for users |
| FY-4 | Support multiple yield sources (Aave, Moonwell, Compound) | P1 | Risk diversification |
| FY-5 | Yield distribution: proportional to contribution amount | P0 | Fair allocation |
| FY-6 | Yield strategy switching (governance-controlled) | P2 | Future optimization |

### 5.4 Social & Discovery
| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FS-1 | Share vault as Farcaster Frame with preview | P0 | Primary distribution channel |
| FS-2 | Notification on contribution, goal reached, deadline | P0 | Push notifications via Farcaster |
| FS-3 | Discover feed: trending vaults in social graph | P1 | Drives virality |
| FS-4 | Trust score based on Farcaster attestations | P1 | Social proof mechanism |
| FS-5 | Comments/reactions on vault Frame | P2 | Engagement feature |
| FS-6 | Leaderboard: top savers, top contributors | P2 | Gamification |

### 5.5 Wallet & Onboarding
| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FW-1 | Smart wallet creation via Privy/Dynamic | P0 | Passkey-based, no seed phrases |
| FW-2 | One-click Farcaster sign-in | P0 | Leverage existing identity |
| FW-3 | Onboarding flow: <30 seconds to first action | P0 | Measured and optimized |
| FW-4 | Multi-device wallet access via passkeys | P1 | User convenience |
| FW-5 | Wallet recovery via social recovery (future) | P2 | Security improvement |

---

## 6. Technical Requirements

### 6.1 Smart Contract Architecture

#### 6.1.1 Core Contracts
```
VaultFactory.sol
├── Creates minimal proxy clones of VaultImplementation
├── Tracks all deployed vaults
├── Emits VaultCreated events for indexing
└── Access: Permissionless, anyone can deploy

VaultImplementation.sol (ERC-4626 compliant)
├── State: goal, deadline, creator, contributors, status
├── Functions: contribute(), withdraw(), refund(), getYield()
├── Integrates with Aave/Moonwell via ERC-4626 adapter
├── Enforces: timelocks, thresholds, contribution limits
└── Access: Contributors can deposit, creator can withdraw post-goal

YieldAdapter.sol (ERC-4626 wrapper)
├── Deposits to Aave V3 or Moonwell
├── Auto-compounds yield
├── Withdraws on vault completion/failure
└── Abstracts yield source from vault logic

TrustRegistry.sol
├── Stores attestations from Farcaster
├── Calculates trust scores
├── Verifies creator reputation
└── Access: Read-only for vaults, write via oracle
```

#### 6.1.2 Contract Security Requirements
| ID | Requirement | Priority | Implementation |
|----|-------------|----------|----------------|
| TS-1 | Multi-sig ownership for factory upgrades | P0 | Gnosis Safe with 3/5 threshold |
| TS-2 | Audited by top-tier firm (Trail of Bits, OpenZeppelin) | P0 | Pre-mainnet launch |
| TS-3 | Formal verification of critical functions | P1 | Certora for withdraw/refund logic |
| TS-4 | Bug bounty program ($100k+ rewards) | P0 | ImmuneFi platform |
| TS-5 | Circuit breakers for exploit scenarios | P0 | Pause deposits if drain detected |
| TS-6 | Reentrancy guards on all external calls | P0 | OpenZeppelin ReentrancyGuard |
| TS-7 | Slippage protection on yield deposits | P1 | Max 0.5% slippage tolerance |

### 6.2 Backend Infrastructure

#### 6.2.1 Architecture
```
FastAPI Backend
├── /api/vaults - CRUD for vault metadata
├── /api/users - User profiles, trust scores
├── /api/notifications - WebSocket server for real-time updates
├── /api/frames - Generate Farcaster Frame metadata
└── /api/analytics - Indexing blockchain events

Database: PostgreSQL
├── Vault metadata (off-chain descriptions, images)
├── User profiles (Farcaster ID, wallet address)
├── Notification queue
└── Analytics (contribution history, APY snapshots)

Indexer: Ponder or The Graph
├── Listens to VaultCreated, Contributed, Withdrawn events
├── Builds queryable database of on-chain state
└── Powers Discover feed and analytics
```

#### 6.2.2 Backend Requirements
| ID | Requirement | Priority | SLA |
|----|-------------|----------|-----|
| TB-1 | API response time <200ms (p95) | P0 | 99.9% uptime |
| TB-2 | WebSocket latency <500ms for updates | P0 | Real-time experience |
| TB-3 | Support 10k concurrent WebSocket connections | P1 | Scalability target |
| TB-4 | Event indexing lag <5 seconds | P0 | Near real-time updates |
| TB-5 | Database backups every 6 hours | P0 | Data integrity |
| TB-6 | Rate limiting: 100 req/min per IP | P1 | DDoS protection |

### 6.3 Frontend (Farcaster Frames)

#### 6.3.1 Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Frames SDK**: frames.js or OnchainKit Frames components
- **Styling**: Tailwind CSS (consistent with Base design system)
- **State Management**: React Context + TanStack Query
- **Wallet**: Privy SDK or Dynamic SDK

#### 6.3.2 Frame Types
1. **Vault Creation Frame**: Form inputs rendered as Frame buttons
2. **Vault Display Frame**: Progress bar, contributor list, CTA
3. **Contribution Frame**: Amount selector + confirm button
4. **Completion Frame**: Success state with stats

#### 6.3.3 Frontend Requirements
| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| TF-1 | Mobile-optimized (80% of traffic) | P0 | Base app is mobile-first |
| TF-2 | Frame loads in <2 seconds | P0 | Farcaster timeout constraints |
| TF-3 | Accessible (WCAG 2.1 AA) | P1 | Keyboard navigation, screen readers |
| TF-4 | Offline mode for read-only views | P2 | PWA capabilities |
| TF-5 | Localization support (EN, ES, PT) | P2 | Future expansion |

### 6.4 Performance & Scalability

| ID | Requirement | Target | Monitoring |
|----|-------------|--------|------------|
| TP-1 | Support 1000 vaults created/day | 10k/day capacity | CloudWatch metrics |
| TP-2 | Handle 10k contributions/day | 100k/day capacity | Transaction throughput |
| TP-3 | Database queries <50ms | p95 latency | Datadog APM |
| TP-4 | CDN for Frame images/metadata | 99.9% cache hit rate | Cloudflare Analytics |
| TP-5 | Horizontal scaling for API servers | Auto-scale to 10 instances | Kubernetes HPA |

### 6.5 Infrastructure & DevOps

```
Blockchain: Base Mainnet + Base Sepolia (testnet)
Hosting: Vercel (frontend) + AWS (backend)
CDN: Cloudflare
Monitoring: Datadog + Sentry
CI/CD: GitHub Actions
Secrets: AWS Secrets Manager
```

---

## 7. Success Metrics

### 7.1 Product Metrics (Weekly)
| Metric | Target (Month 1) | Target (Month 6) | Measurement |
|--------|------------------|------------------|-------------|
| Active Vaults | 100 | 5,000 | Count of vaults with status=active |
| New Users | 500 | 10,000 | Unique wallet addresses |
| Contributions | 1,000 | 50,000 | Count of contribute() transactions |
| TVL | $50k | $1M | Sum of all vault balances |
| Avg Vault Size | $500 | $1,000 | TVL / Active Vaults |
| Completion Rate | 60% | 75% | Vaults reaching goal / Total vaults |

### 7.2 Engagement Metrics (Monthly)
| Metric | Target | Definition |
|--------|--------|------------|
| DAU/MAU Ratio | 30% | Daily active / Monthly active users |
| Avg Contributions per User | 3 | Total contributions / Total users |
| Frame Share Rate | 50% | Vault creators who share Frame |
| Viral Coefficient (k-factor) | 1.5 | New users per existing user |
| Retention (D7) | 40% | Users active 7 days after first action |

### 7.3 Financial Metrics
| Metric | Target | Notes |
|--------|--------|-------|
| Avg APY Delivered | 5% | Benchmark against Aave/Moonwell base rates |
| Yield Generated (Total) | $10k (Month 6) | Cumulative yield across all vaults |
| Gas Cost per Transaction | <$0.10 | Base L2 efficiency |
| Revenue (if fees introduced) | N/A (V1 is fee-free) | Future: 5% of yield as protocol fee |

### 7.4 Technical Metrics
| Metric | SLA | Tracking |
|--------|-----|----------|
| Smart Contract Uptime | 99.99% | Base network uptime |
| API Uptime | 99.9% | UptimeRobot |
| P95 API Latency | <200ms | Datadog |
| Zero Security Incidents | 100% | Audit trail + bug bounty |

---

## 8. Timeline & Milestones

### Phase 1: Foundation (Weeks 1-4)
**Goal**: Smart contract MVP + basic Frame prototype

**Deliverables**:
- [ ] VaultFactory and VaultImplementation contracts (Solidity)
- [ ] Unit tests for core vault logic (Foundry)
- [ ] Aave V3 integration on Base Sepolia
- [ ] Simple Frame: Create vault + Contribute
- [ ] FastAPI backend scaffold with PostgreSQL
- [ ] Smart contract testnet deployment

**Team**: 2 Solidity devs, 1 Backend dev, 1 Frontend dev

---

### Phase 2: Integration & Testing (Weeks 5-8)
**Goal**: End-to-end flow working on testnet

**Deliverables**:
- [ ] Privy/Dynamic wallet integration
- [ ] Farcaster Frame complete (all states)
- [ ] WebSocket notifications for real-time updates
- [ ] Event indexer (The Graph subgraph)
- [ ] Trust score system (basic version)
- [ ] 100 internal users testing on Base Sepolia

**Team**: +1 DevOps, +1 QA

---

### Phase 3: Security & Audit (Weeks 9-12)
**Goal**: Production-ready, audited contracts

**Deliverables**:
- [ ] Smart contract audit by Trail of Bits or OpenZeppelin
- [ ] Remediate all High/Critical findings
- [ ] Bug bounty program live (ImmuneFi)
- [ ] Penetration testing of backend API
- [ ] Formal verification of withdrawal logic (Certora)
- [ ] Security documentation and runbooks

**Team**: +1 Security engineer, External auditors

---

### Phase 4: Mainnet Beta (Weeks 13-16)
**Goal**: Limited mainnet launch with 1,000 early users

**Deliverables**:
- [ ] Mainnet deployment of contracts
- [ ] Waitlist + invite-only access
- [ ] Marketing campaign on Farcaster (partner with influencers)
- [ ] Monitoring dashboards (Datadog, Dune Analytics)
- [ ] Customer support system (Discord + Intercom)
- [ ] First 100 vaults created on mainnet

**Success Criteria**:
- Zero critical bugs in first 2 weeks
- $100k TVL
- 60% vault completion rate

---

### Phase 5: Public Launch (Weeks 17-20)
**Goal**: Open to all Farcaster users

**Deliverables**:
- [ ] Remove waitlist, public access
- [ ] Discover feed with trending vaults
- [ ] Advanced trust score (Farcaster attestations)
- [ ] Mobile app optimization
- [ ] Partnership with Base/Farcaster for promotion
- [ ] Analytics dashboard for users

**Success Criteria**:
- 10,000 users
- $1M TVL
- Featured in Base ecosystem showcase

---

### Phase 6: Growth & Iteration (Weeks 21+)
**Goal**: Scale to 100k users, add features based on feedback

**Future Features** (Prioritized by user feedback):
- Multi-asset vaults (ETH + USDC in same vault)
- Recurring contributions (auto-deposit weekly)
- Vault templates marketplace
- Social recovery for wallets
- DAO governance for yield strategy selection
- Mobile native app (beyond Frames)

---

## 9. Risks & Mitigation

### 9.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Smart contract exploit** | Low | Critical | Multi-tier audits, bug bounty, formal verification, gradual TVL ramp |
| **Yield protocol failure (Aave/Moonwell)** | Medium | High | Diversify across multiple protocols, circuit breakers, insurance (Nexus Mutual) |
| **Base network downtime** | Low | High | Monitor Base status, communicate proactively, fallback to L1 for critical operations |
| **Farcaster Frame spec changes** | Medium | Medium | Stay close to Farcaster team, abstract Frame logic, automated testing |
| **Gas price spike on Base** | Low | Low | Base is designed for low fees, but monitor and alert users if >$0.50/tx |
| **Indexer lag causes stale data** | Medium | Medium | Redundant indexers (The Graph + Ponder), fallback to direct RPC calls |

### 9.2 Product Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Low adoption (users don't create vaults)** | Medium | Critical | User research, simplified onboarding, incentivize first vault (yield boost) |
| **High vault failure rate (<50% completion)** | Medium | High | UX research on goal-setting, recommended timelines, social accountability features |
| **Spam vaults (low-quality goals)** | High | Medium | Reputation system, community moderation, minimum contribution thresholds |
| **Users don't trust smart contracts** | Medium | High | Transparent audits, educational content, start with small amounts, social proof |
| **Competitors launch similar product** | High | Medium | Speed to market, superior UX, Farcaster-native advantage, network effects |

### 9.3 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Regulatory scrutiny (securities)** | Medium | Critical | Legal review, ensure no protocol fees in V1, decentralize governance, ToS clarity |
| **No sustainable business model** | High | High | V1 focuses on growth; V2 introduces optional 5% yield fee, premium features |
| **Key team member departure** | Low | High | Knowledge sharing, documentation, cross-training, equity vesting schedules |
| **Insufficient funding for audit** | Low | Critical | Allocate $100k budget for audits upfront, seek grants from Base ecosystem fund |

### 9.4 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Customer support overwhelmed** | High | Medium | Self-service docs, Discord community, hire support team at 5k users |
| **Database outage** | Low | Medium | RDS Multi-AZ, automated backups, 4-hour recovery SLA |
| **API rate limits hit** | Medium | Low | Increase limits, caching layer, CDN for static content |

---

## 10. Assumptions & Dependencies

### 10.1 Key Assumptions
1. **Farcaster will remain a growing platform** (100k+ MAU by launch)
2. **Base gas fees stay <$0.10** per transaction
3. **Aave V3 / Moonwell maintain 3-8% APY** on stablecoins
4. **Users trust smart contracts** more than centralized platforms after education
5. **Group savings is a compelling use case** (validated via user research)
6. **Passkey wallets are intuitive** for non-crypto users (Privy/Dynamic UX is proven)
7. **Frames are effective distribution** (higher engagement than external links)

### 10.2 External Dependencies
| Dependency | Owner | Risk if Unavailable | Contingency |
|------------|-------|---------------------|-------------|
| Base L2 network | Coinbase/Base | Product cannot function | No alternative; monitor Base roadmap closely |
| Farcaster protocol | Warpcast team | Cannot embed Frames | Build standalone web app as backup |
| Privy/Dynamic SDK | Privy/Dynamic | Wallet onboarding breaks | Build custom wallet using Wagmi + RainbowKit |
| Aave V3 on Base | Aave DAO | No yield generation | Switch to Moonwell, Compound, or simple staking |
| The Graph indexer | The Graph Foundation | Slow data indexing | Build custom indexer with Ponder |
| Vercel hosting | Vercel | Frontend downtime | Multi-cloud: AWS Amplify as backup |

### 10.3 Internal Dependencies
1. **Smart contract developers** with Solidity + ERC-4626 expertise
2. **Frontend developer** familiar with Next.js + Farcaster Frames
3. **Backend developer** with FastAPI + WebSocket experience
4. **Security auditor budget** ($50-100k)
5. **Farcaster community growth** team for marketing

---

## 11. Open Questions & Decisions Needed

### 11.1 Product Decisions
- [ ] **Should we allow partial withdrawals** before goal is reached? (Leaning: No, breaks social contract)
- [ ] **What happens to yield if vault fails?** (Proposal: Return proportionally to contributors)
- [ ] **Should creators pay a deployment fee?** (Proposal: No, keep it permissionless)
- [ ] **Anonymous vaults or real-name only?** (Proposal: Real-name via Farcaster, optional privacy mode)
- [ ] **Max vault duration?** (Proposal: 1 year cap to prevent indefinite vaults)

### 11.2 Technical Decisions
- [ ] **Privy vs Dynamic for wallet?** (Benchmark UX, pricing, Base compatibility)
- [ ] **The Graph vs Ponder for indexing?** (Test latency, reliability, cost)
- [ ] **Aave vs Moonwell for yield?** (Compare APYs, TVL, audit history)
- [ ] **Multi-sig setup for contract ownership?** (Decide signers, threshold, backup plan)

### 11.3 Business Decisions
- [ ] **Launch with fees or fee-free?** (Recommendation: Fee-free V1, introduce 5% yield fee in V2 after PMF)
- [ ] **Apply for Base ecosystem grants?** (Yes, target $50k for audits/marketing)
- [ ] **Target launch date?** (Aggressive: 16 weeks, Conservative: 20 weeks)

---

## 12. Success Criteria Summary

**The product is considered successful if, within 6 months of mainnet launch:**

✅ **Adoption**: 10,000+ unique users
✅ **TVL**: $1M+ Total Value Locked
✅ **Completion Rate**: 75%+ vaults reach their goal
✅ **Security**: Zero critical exploits or loss of user funds
✅ **Engagement**: 40%+ monthly active user rate
✅ **Virality**: k-factor >1.5 (organic growth)
✅ **Performance**: <$0.10 avg gas cost, <200ms API latency
✅ **Yield**: 5%+ APY delivered to users

---

## 13. Appendix

### 13.1 Glossary
- **ERC-4626**: Token vault standard for yield-bearing vaults
- **Base L2**: Ethereum Layer 2 built by Coinbase for low-cost transactions
- **Farcaster Frame**: Interactive UI embedded in Farcaster social feed
- **TVL**: Total Value Locked (sum of all assets in protocol)
- **APY**: Annual Percentage Yield
- **Passkey**: WebAuthn-based authentication (replaces seed phrases)
- **Smart Wallet**: Contract-based wallet with advanced features (vs EOA)

### 13.2 Reference Links
- [Base Documentation](https://docs.base.org)
- [Farcaster Frames Spec](https://docs.farcaster.xyz/developers/frames)
- [OnchainKit](https://onchainkit.xyz)
- [ERC-4626 Standard](https://eips.ethereum.org/EIPS/eip-4626)
- [Aave V3 Docs](https://docs.aave.com)
- [Privy Documentation](https://docs.privy.io)

### 13.3 Contact
- **Product Owner**: CEO
- **Technical Lead**: CTO (this document)
- **Engineering Team**: TBD
- **Security Auditor**: TBD (Trail of Bits or OpenZeppelin)

---

**Document Status**: Ready for stakeholder review
**Next Steps**:
1. CEO approval of vision alignment
2. Engineering team review of technical feasibility
3. Legal review of regulatory considerations
4. Budget approval for audit + infrastructure
5. Finalize timeline and team allocation

**Last Updated**: November 16, 2025
