# Banka Development Plans

Цей folder містить детальні плани розвитку функціоналу Banka.

## 📋 Документи

### 1. [BENEFICIARY_FEATURE_PLAN.md](./BENEFICIARY_FEATURE_PLAN.md)
**Статус:** Ready for implementation
**Timeline:** 4 weeks

План додавання beneficiary функції - можливість вказати інший гаманець, який отримає гроші при withdraw/smash.

**Ключові фічі:**
- Окремий beneficiary address при створенні vault
- Гроші йдуть на beneficiary замість creator
- UI для вибору beneficiary
- Підтримка ETH та ERC20 токенів

**Use cases:**
- Donation campaigns (збір для іншої людини)
- Gift vaults (подарунки)
- Organizational fundraising (гроші на організаційний wallet)

---

### 2. [ZK_PRIVACY_CONCEPT.md](./ZK_PRIVACY_CONCEPT.md)
**Статус:** Conceptual / Research phase
**Timeline:** 8-12 weeks (full implementation)

Концептуальний документ про інтеграцію Zero-Knowledge технологій для privacy.

**Privacy levels:**
- **Level 1:** Current (все публічно) ✅ implemented
- **Level 2:** Beneficiary-only transparency (creator та contributors приховані) 🎯 target
- **Level 3:** Full privacy (все приховано)

**Технічні підходи:**
1. **Relayer Pattern** - простіше, 4 тижні
2. **Noir ZK Proofs** - cryptographic privacy, 6-8 тижнів
3. **Aztec L2 Integration** - full privacy для contributions, 6-8 тижнів

**Статус перевірки:**
- ⚠️ Noir на Base потребує тестування (ймовірність 99% що працює)
- ✅ Optimism підтверджено працює
- 🔄 Потрібен proof of concept

---

## 🎯 Рекомендована послідовність імплементації

### Phase 1: Beneficiary Feature (2-4 weeks)
**Priority:** HIGH
**Complexity:** LOW-MEDIUM

Імплементувати базову beneficiary функцію без privacy.

**Deliverables:**
- ✅ Updated smart contracts (Vault.sol, VaultFactory.sol)
- ✅ Tests
- ✅ Frontend UI (create page, vault detail page)
- ✅ Deploy на Base Sepolia

**Value:** Immediate value для donation use cases

---

### Phase 2a: Test Noir на Base (1-3 days)
**Priority:** HIGH
**Complexity:** LOW

Швидкий proof of concept для перевірки Noir на Base.

**Deliverables:**
- Simple Noir circuit
- Deploy verifier на Base Sepolia
- Verify proof on-chain
- Document results

**Decision point:** Якщо працює → Phase 2b, якщо ні → Phase 2 Alternative

---

### Phase 2b: Anonymous Vault Creation (4-6 weeks)
**Priority:** MEDIUM
**Complexity:** HIGH
**Prerequisite:** Phase 2a success ✅

Імплементація anonymous vault creation через Noir ZK proofs.

**Deliverables:**
- Noir circuits для proof of control
- Verifier contracts
- Frontend proof generation (WASM)
- Updated vault creation flow
- Anonymous withdrawal with ZK proof

**Privacy gained:**
- ❌ Creator address HIDDEN
- ✅ Beneficiary address PUBLIC
- Cryptographic security

---

### Phase 2 Alternative: Relayer Pattern (3-4 weeks)
**Priority:** MEDIUM
**Complexity:** MEDIUM
**Trigger:** If Phase 2a fails OR if faster delivery needed

Простіший підхід без ZK але з reasonable privacy.

**Deliverables:**
- Relayer service
- Secret-based vault control
- Meta-transaction signing
- Frontend integration

**Privacy gained:**
- 🟡 Creator address HIDDEN (through relayer)
- ✅ Beneficiary address PUBLIC
- Lower cryptographic guarantees

---

### Phase 3: Aztec Integration (8-10 weeks)
**Priority:** LOW (nice-to-have)
**Complexity:** VERY HIGH
**Prerequisite:** Phase 1 ✅ + Phase 2 ✅

Full privacy для contributions через Aztec L2.

**Deliverables:**
- Noir contracts на Aztec
- L2→L1 bridge
- Private balance tracking
- Frontend Aztec wallet integration

**Privacy gained:**
- ❌ Contributors HIDDEN
- ❌ Contribution amounts HIDDEN
- ✅ Total amount PUBLIC
- ✅ Beneficiary PUBLIC

---

## 📊 Current Status

**Completed:**
- ✅ Backend removal (full blockchain reads)
- ✅ Multi-token support (ETH + USDC)
- ✅ Farcaster Frames integration
- ✅ Base Sepolia deployment

**In Progress:**
- 🔄 ZK privacy research
- 🔄 Beneficiary feature planning

**Blocked:**
- ⏸️ Noir on Base verification (needs testing)

**Next Actions:**
1. Decide: Start with Phase 1 (beneficiary) or Phase 2a (Noir test)?
2. If Phase 1: Begin smart contract modifications
3. If Phase 2a: Setup Noir toolchain and deploy test

---

## 🔗 Related Documentation

- [Main README](../README.md)
- [CLAUDE.md](../CLAUDE.md) - Project instructions for AI assistant
- [NETLIFY_ENV_SETUP.md](../NETLIFY_ENV_SETUP.md)
- [contracts/](../contracts/) - Smart contracts
- [frontend/](../frontend/) - Next.js frontend

---

## 💬 Questions & Discussion

**Open questions:**
1. Should beneficiary be changeable after creation?
2. What if beneficiary rejects funds?
3. Multi-beneficiary support (split payments)?
4. Privacy toggle (let creator choose public/private)?
5. Verification for beneficiary identity (ENS, Farcaster profile)?

**For discussion:**
- Timeline preferences
- Privacy vs transparency trade-offs
- Gas cost concerns (~$2-4 більше для ZK)
- Security audit requirements

---

**Last Updated:** 2025-01-26
**Status:** Active planning phase
