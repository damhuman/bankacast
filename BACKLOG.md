# Banka - Product Backlog

**Останнє оновлення:** 2025-01-26
**Поточний статус:** Planning phase для нових features

---

## 🚀 MVP (Completed ✅)

### Backend & Infrastructure
- ✅ **Backend removal** - повний перехід на blockchain reads
- ✅ **Multi-token support** - ETH + USDC vaults
- ✅ **Base Sepolia deployment** - contracts deployed and verified
- ✅ **Frontend optimization** - direct RPC calls, no API dependency

### Core Features
- ✅ **Vault creation** - ETH/USDC вклади з автоматичним Aave yield
- ✅ **Contributions** - multiple contributors до одного vault
- ✅ **Withdraw/Smash** - забрати кошти коли goal досягнута або передумав
- ✅ **Real-time updates** - live progress tracking
- ✅ **Farcaster Frames** - створення та контриб'юшн через Frame

### UI/UX
- ✅ **Discover page** - browse всі vaults
- ✅ **Vault detail page** - progress, contributors, yield stats
- ✅ **Create page** - intuitive vault creation flow
- ✅ **Contribute modal** - one-click donations

---

## 🎯 High Priority (Next 4-6 weeks)

### 1. Beneficiary Feature ⭐
**Статус:** 🟡 Planning → Ready for implementation
**Пріоритет:** HIGH
**Складність:** MEDIUM
**Timeline:** 2-4 weeks

**User Story:**
> Як creator, я хочу вказати інший wallet address (beneficiary), який отримає гроші коли vault буде smashed/withdrawn, щоб я міг створити donation campaign для іншої людини.

**Use Cases:**
- 🏥 Donation campaigns - збір для хворого друга
- 🎁 Gift vaults - батьки створюють savings для дитини
- 🏢 Organizational fundraising - гроші йдуть на treasury wallet
- 💙 Charitable causes - прямі перекази на charity

**Deliverables:**
- [ ] Smart contracts update (Vault.sol, VaultFactory.sol, IVault)
- [ ] Unit tests (beneficiary receives funds, defaults to creator)
- [ ] Integration tests (ETH + USDC vaults)
- [ ] Frontend create page (beneficiary checkbox + input)
- [ ] Frontend vault detail page (beneficiary badge)
- [ ] Deploy to Base Sepolia
- [ ] Documentation

**Acceptance Criteria:**
- ✅ Can specify beneficiary address during vault creation
- ✅ Beneficiary defaults to creator if not specified
- ✅ Funds go to beneficiary on withdraw()
- ✅ Funds go to beneficiary on smash()
- ✅ Works with both ETH and USDC vaults
- ✅ UI clearly shows beneficiary address
- ✅ Gas costs similar to current implementation

**Документація:** `plan/BENEFICIARY_FEATURE_PLAN.md`

---

### 2. Noir on Base Testing 🔬
**Статус:** 🟡 Partially completed (blocked on Barretenberg)
**Пріоритет:** HIGH (research)
**Складність:** LOW (testing) / HIGH (full implementation)
**Timeline:** 1-3 days (quick test) або 6-8 weeks (full ZK)

**Goal:**
Перевірити чи Base підтримує Noir-generated zkSNARK verifiers.

**What's Done:**
- ✅ Noir v1.0.0-beta.15 installed
- ✅ Test circuit created and compiled
- ⚠️ Barretenberg installation blocked (version issues)

**Next Steps (choose one):**
- **Option A:** Quick test з готовим verifier (1h)
- **Option B:** Downgrade до stable Noir 0.34.0 (3-4h)
- **Option C:** JavaScript/WASM approach (3-5h)
- **Option D:** Postpone до Noir 1.0 stable release

**Decision Point:**
Результати цього тесту визначають чи йдемо в Phase 2b (ZK proofs) чи Phase 2 Alternative (relayer pattern).

**Документація:** `plan/PHASE_2A_NOIR_TEST_RESULTS.md`

---

## 🎨 Medium Priority (4-8 weeks)

### 3. Anonymous Vault Creation (ZK Approach)
**Статус:** ⏸️ Blocked on Phase 2a results
**Пріоритет:** MEDIUM
**Складність:** HIGH
**Timeline:** 6-8 weeks
**Prerequisite:** Noir on Base works ✅

**User Story:**
> Як creator, я хочу створити vault анонімно, щоб ніхто не знав хто я, але всі бачили куди підуть гроші (beneficiary).

**Privacy Model:**
- ❌ Creator address **HIDDEN**
- ✅ Beneficiary address **PUBLIC**
- ❌ Contributors **HIDDEN** (optional later)
- Cryptographic proof of control

**Technical Approach:**
- Noir circuit: prove control without revealing identity
- Solidity verifier on Base
- Frontend proof generation (WASM)
- ZK withdrawal mechanism

**Deliverables:**
- [ ] Noir circuits (vault control proof)
- [ ] Verifier contracts deployed
- [ ] Frontend proof generation
- [ ] Anonymous create flow
- [ ] ZK-based withdraw
- [ ] Security audit
- [ ] Documentation

**Документація:** `plan/ZK_PRIVACY_CONCEPT.md`

---

### 4. Anonymous Vault Creation (Relayer Approach)
**Статус:** ⏸️ Alternative if Phase 2a fails
**Пріоритет:** MEDIUM
**Складність:** MEDIUM
**Timeline:** 3-4 weeks

**Technical Approach:**
- Relayer service (meta-transactions)
- Secret-based vault control
- No ZK complexity
- Reasonable privacy

**Privacy Model:**
- 🟡 Creator hidden through relayer
- ✅ Beneficiary PUBLIC
- Lower cryptographic guarantees
- Easier to implement

**Trade-offs:**
- ✅ Faster to implement
- ✅ Lower gas costs
- ⚠️ Requires relayer infrastructure
- ⚠️ Centralization point
- ⚠️ Secret phrase management

---

## 🌟 Low Priority (8+ weeks)

### 5. Aztec L2 Integration (Private Contributions)
**Статус:** 🔵 Conceptual
**Пріоритет:** LOW (nice-to-have)
**Складність:** VERY HIGH
**Timeline:** 8-10 weeks
**Prerequisite:** Phase 1 + Phase 2 completed

**User Story:**
> Як contributor, я хочу задонатити анонімно, щоб ніхто не бачив мою адресу та суму донейту.

**Privacy Model:**
- ❌ Contributors **HIDDEN**
- ❌ Contribution amounts **HIDDEN**
- ✅ Total amount **PUBLIC**
- ✅ Beneficiary **PUBLIC**

**Technical Approach:**
- Aztec L2 private transactions
- L2 → L1 bridge
- Private balance tracking on Aztec
- Public vault state on Base

**Deliverables:**
- [ ] Noir contracts на Aztec
- [ ] Cross-chain bridge (Aztec ↔ Base)
- [ ] Private contribution flow
- [ ] Aztec wallet integration
- [ ] Sync mechanisms
- [ ] Security audit

**Документація:** `plan/ZK_PRIVACY_CONCEPT.md` (Phase 3)

---

### 6. Multi-Beneficiary Support
**Статус:** 🔵 Idea
**Пріоритет:** LOW
**Складність:** MEDIUM
**Timeline:** 2-3 weeks

**User Story:**
> Як creator, я хочу розділити кошти між кількома beneficiaries, щоб donations пішли на кілька wallets (наприклад 60/40 split).

**Features:**
- Split percentage configuration
- Multiple beneficiary addresses
- Automatic distribution on withdraw
- UI for managing splits

**Questions:**
- Fixed splits чи adjustable?
- Max number of beneficiaries?
- How to handle remainder (odd splits)?

---

### 7. Time-Locked Beneficiary
**Статус:** 🔵 Idea
**Пріоритет:** LOW
**Складність:** LOW
**Timeline:** 1 week

**User Story:**
> Як creator, я хочу щоб beneficiary міг забрати гроші тільки після певної дати.

**Use Cases:**
- Savings for child (unlock at 18 years)
- Vesting schedules
- Delayed gifts

---

### 8. Beneficiary Must Approve
**Статус:** 🔵 Idea
**Пріоритет:** LOW
**Складність:** MEDIUM
**Timeline:** 2 weeks

**User Story:**
> Як beneficiary, я хочу мати можливість прийняти або відмовитись від vault, щоб я міг контролювати що приходить на мій wallet.

**Features:**
- Beneficiary approval mechanism
- Reject and refund contributors
- Notification system

---

### 9. ENS / Farcaster Identity Verification
**Статус:** 🔵 Idea
**Пріоритет:** LOW
**Складність:** MEDIUM
**Timeline:** 2 weeks

**User Story:**
> Як donor, я хочу бачити verified identity beneficiary (ENS name або Farcaster profile), щоб я знав точно кому йдуть гроші.

**Features:**
- ENS name resolution
- Farcaster profile linking
- Verification badges
- Social proof

---

### 10. Vault Templates
**Статус:** 🔵 Idea
**Пріоритет:** LOW
**Складність:** LOW
**Timeline:** 1 week

**User Story:**
> Як creator, я хочу використати готові шаблони (medical fundraising, birthday gift, charity), щоб швидше створити vault.

**Features:**
- Pre-filled descriptions
- Suggested goal amounts
- Category icons
- Quick create flow

---

## 🐛 Technical Debt & Improvements

### Code Quality
- [ ] Add comprehensive error handling
- [ ] Improve TypeScript types
- [ ] Add more inline comments
- [ ] Refactor large components

### Testing
- [ ] Smart contract unit tests coverage (currently minimal)
- [ ] Frontend integration tests
- [ ] E2E testing suite
- [ ] Gas optimization tests

### Performance
- [ ] Optimize RPC calls (batch reads)
- [ ] Add caching layer
- [ ] Lazy load components
- [ ] Image optimization

### Security
- [ ] Smart contract audit (before mainnet)
- [ ] Frontend security review
- [ ] Input validation improvements
- [ ] Rate limiting

### DevOps
- [ ] CI/CD pipeline
- [ ] Automated testing
- [ ] Staging environment
- [ ] Monitoring & alerting

---

## 🔮 Future Ideas (Not Prioritized)

- **Recurring vaults** - monthly donations
- **Milestone-based releases** - unlock funds at checkpoints
- **NFT rewards** - badges for contributors
- **Quadratic funding** - matching donations
- **DAO governance** - community-controlled features
- **Mobile app** - native iOS/Android
- **Notifications** - email/push when goal reached
- **Analytics dashboard** - creator insights
- **White-label solution** - organizations can deploy own instance
- **Cross-chain support** - Optimism, Arbitrum, etc.

---

## 📊 Backlog Summary

| Priority | Feature | Status | Complexity | Timeline |
|----------|---------|--------|------------|----------|
| HIGH | Beneficiary Feature | 🟡 Ready | MEDIUM | 2-4 weeks |
| HIGH | Noir Test (Phase 2a) | 🟡 Blocked | LOW | 1-3 days |
| MEDIUM | ZK Anonymous Creation | ⏸️ Waiting | HIGH | 6-8 weeks |
| MEDIUM | Relayer Anonymous Creation | ⏸️ Alternative | MEDIUM | 3-4 weeks |
| LOW | Aztec Private Contributions | 🔵 Concept | VERY HIGH | 8-10 weeks |
| LOW | Multi-Beneficiary | 🔵 Idea | MEDIUM | 2-3 weeks |
| LOW | Time-Locked | 🔵 Idea | LOW | 1 week |
| LOW | Approve Mechanism | 🔵 Idea | MEDIUM | 2 weeks |
| LOW | Identity Verification | 🔵 Idea | MEDIUM | 2 weeks |
| LOW | Templates | 🔵 Idea | LOW | 1 week |

**Legend:**
- 🟡 Ready/In Progress
- ⏸️ Blocked/Waiting
- 🔵 Idea/Concept
- ✅ Completed

---

## 🎯 Recommended Next Sprint

**Sprint Goal:** Deliver immediate value з beneficiary feature + validate ZK feasibility

### Week 1-2: Beneficiary Feature
- [ ] Day 1-2: Smart contracts (Vault.sol, VaultFactory.sol)
- [ ] Day 3: Write tests
- [ ] Day 4-5: Frontend UI (create + detail pages)
- [ ] Day 6-7: Integration testing
- [ ] Day 8-9: Deploy to testnet
- [ ] Day 10: User testing & bug fixes

### Week 3: ZK Research
- [ ] Day 1: Quick Noir test (Option C - existing verifier)
- [ ] Day 2-3: If successful, full Noir workflow (Option A)
- [ ] Day 4-5: Document findings, update plans
- [ ] **Decision:** Go with Phase 2b (ZK) or Phase 2 Alt (Relayer)?

### Week 4: Buffer / Start Phase 2
- [ ] Polish beneficiary feature
- [ ] Begin Phase 2 implementation (ZK or Relayer)
- [ ] Or: Start next feature from backlog

---

## 💬 Open Questions for Prioritization

1. **Should beneficiary be changeable after creation?**
   - Pros: Fix mistakes, flexibility
   - Cons: Potential fraud, trust issues

2. **What if beneficiary rejects funds?**
   - Refund to contributors?
   - Send to creator instead?
   - Donate to default charity?

3. **Privacy toggle - let user choose?**
   - Some want transparency (show their name proudly)
   - Others need anonymity (sensitive causes)
   - UI complexity vs flexibility

4. **When to do security audit?**
   - After beneficiary feature?
   - After all features before mainnet?
   - Budget allocation?

5. **Mainnet launch timeline?**
   - Q1 2025 with basic features?
   - Q2 2025 with privacy features?
   - Soft launch vs big announcement?

---

## 📞 Contact & Contribution

**Project Lead:** @damhuman
**Repository:** (add link)
**Issues:** (add link)
**Discord:** (add link)

**Want to contribute?**
Check out issues labeled `good-first-issue` or `help-wanted`

---

**Last Updated:** January 26, 2025
**Next Review:** After Phase 2a completion
