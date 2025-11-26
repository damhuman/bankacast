# ZK Privacy Architecture - Conceptual Design

## Core Vision

**Public transparency where it matters (beneficiary), privacy where it protects (creator & contributors)**

### Use Case Example
- Volunteer creates fundraising vault for sick friend
- Everyone sees: "Funds go to 0xABC... (sick friend's wallet)"
- Nobody sees: Who created the vault, who contributed, how much each person gave
- Result: Pure focus on helping, no social pressure or judgment

---

## Privacy Levels Comparison

### Level 1: Current (No Privacy)
```
✅ Creator: PUBLIC (anyone can see who created vault)
✅ Beneficiary: PUBLIC (same as creator)
✅ Contributors: PUBLIC (all addresses visible on-chain)
✅ Contribution amounts: PUBLIC (exact amounts visible)
```

### Level 2: Beneficiary-Only Transparency (PROPOSED)
```
❌ Creator: HIDDEN (anonymous vault creation)
✅ Beneficiary: PUBLIC (everyone sees where money goes)
❌ Contributors: HIDDEN (anonymous donations)
❌ Contribution amounts: HIDDEN (only total visible)
```

### Level 3: Full Privacy (Future)
```
❌ Creator: HIDDEN
❌ Beneficiary: HIDDEN (only revealed to authorized parties)
❌ Contributors: HIDDEN
❌ All amounts: HIDDEN
```

**Let's focus on Level 2 - this is the sweet spot for donation campaigns.**

---

## Technical Architecture - Level 2

### Component 1: Anonymous Vault Creation (Hide Creator)

#### Option A: Relayer Pattern with Meta-Transactions
```
User (creator) → Signs message → Relayer → Factory.createVault()
                                              ↓
                                    Vault created with:
                                    - beneficiary: PUBLIC
                                    - creator: relayer address (hides real creator)
                                    - controlSecret: hash of creator's secret
```

**How withdrawal works:**
```solidity
function withdraw(bytes32 secret) external {
    require(keccak256(abi.encodePacked(secret)) == controlSecret, "Invalid secret");
    require(totalContributed >= goalAmount, "Goal not reached");

    // Send funds to beneficiary (PUBLIC address)
    transfer(beneficiary, amount);
}
```

**Pros:**
- Simple to implement (no ZK complexity)
- Works on any chain (no Aztec dependency)
- Gas efficient (~same cost as current)

**Cons:**
- Secret management (user must store secret phrase)
- If secret leaked, anyone can withdraw
- Relayer needs ETH for gas (centralization point)

#### Option B: ZK Proof of Control (Advanced)
```
User generates ZK proof: "I know the private key that created this vault"
                         WITHOUT revealing the public key/address

Contract verifies proof and allows withdrawal to beneficiary
```

**Implementation with Noir (Aztec):**
```rust
// Noir circuit
fn prove_vault_control(
    secret_key: Field,       // PRIVATE
    vault_id: Field,         // PUBLIC
    beneficiary: Field,      // PUBLIC
) {
    let public_key = derive_pubkey(secret_key);
    let vault_hash = hash(public_key, vault_id);

    // Prove: "I created this vault" without revealing public_key
    constrain(vault_hash == commitment);
}
```

**Pros:**
- True cryptographic privacy (provably secure)
- No relayer needed (decentralized)
- No secret to leak (uses private key)

**Cons:**
- Complex implementation (~4-6 weeks)
- Higher gas costs (proof verification)
- Requires ZK knowledge

---

### Component 2: Anonymous Contributions (Hide Contributors)

#### Option A: Aztec L2 Integration (Recommended)
```
Contributor → Aztec L2 (private transaction) → Bridge → Base L1 Vault
   ❌                    ❌                        ✅
 (hidden)             (hidden)                 (only total visible)
```

**Architecture:**
```
┌─────────────────┐
│   Aztec L2      │  Private balance tracking
│                 │  User: 100 USDC → Vault X
│  Noir Contracts │  (fully encrypted)
└────────┬────────┘
         │ Bridge (ZK proof)
         ↓
┌─────────────────┐
│   Base L1       │  Public vault state
│                 │  Vault X: totalContributed = 1000 USDC
│  Solidity       │  (no individual contributors visible)
└─────────────────┘
```

**Privacy guarantees:**
- Nobody sees WHO contributed
- Nobody sees HOW MUCH each person gave
- Everyone sees TOTAL amount in vault
- Everyone sees BENEFICIARY address

**Implementation complexity:** High (~6-8 weeks)

#### Option B: Stealth Address Contributions (Medium Complexity)
```
Contributor generates one-time stealth address
Funds sent from stealth address → Vault
After deposit, stealth address is abandoned
```

**Pros:**
- No Aztec dependency
- Works on Base L1 directly
- Moderate complexity (~2-3 weeks)

**Cons:**
- Still visible on-chain (just not linked to main wallet)
- Blockchain analysts can potentially cluster addresses
- Requires ETH in stealth address for gas

---

### Component 3: Public Beneficiary (Transparency)

**This stays PUBLIC and simple:**
```solidity
contract Vault {
    address public beneficiary;  // Always visible

    function withdraw() external {
        // Only authorized controller can trigger
        // But funds ALWAYS go to public beneficiary
        transfer(beneficiary, amount);
    }
}
```

**Why public?**
- Donors trust the campaign because they see where money goes
- Beneficiary can prove they received funds
- Auditability for legitimate use cases

---

## Recommended Implementation Path

### Phase 1: Relayer + Beneficiary (4 weeks)
**Goal:** Hide creator, show beneficiary

1. **Week 1-2:** Implement relayer service
   - Meta-transaction signing
   - Vault creation with secret hash
   - Gas payment system

2. **Week 3:** Update smart contracts
   - Add `controlSecret` field
   - Modify withdraw to check secret
   - Keep beneficiary public

3. **Week 4:** Frontend integration
   - Generate random secret on vault creation
   - Show secret to user (copy/backup)
   - Withdraw UI with secret input

**Result:** Anonymous vault creation, public beneficiary ✅

### Phase 2: Aztec Contributions (6-8 weeks)
**Goal:** Hide contributors and amounts

1. **Week 5-7:** Aztec setup
   - Deploy Noir contracts on Aztec
   - Implement private balance tracking
   - Build L2→L1 bridge

2. **Week 8-10:** Integration
   - Frontend Aztec wallet integration
   - Private contribution flow
   - Sync with Base L1 vault

3. **Week 11-12:** Testing & audit
   - Security review
   - Privacy verification
   - User testing

**Result:** Full Level 2 privacy ✅

---

## Privacy vs Transparency Trade-offs

### What We Gain (Privacy)
- **No social pressure:** Rich friends don't feel obligated to give more
- **Protection:** No one targets frequent donors
- **Equality:** All donations equal regardless of amount
- **Anonymity:** Whistleblowers, activists can donate safely

### What We Maintain (Transparency)
- **Trust:** Everyone sees funds go to beneficiary
- **Accountability:** Beneficiary receives exact amount shown
- **Verification:** Blockchain proof of transfer
- **No fraud:** Can't divert funds to different address

---

## Security Considerations

### Attack Vector 1: Secret Theft (Relayer Pattern)
**Risk:** If creator's secret is stolen, attacker can withdraw to beneficiary early

**Mitigation:**
- Time-lock: Can't withdraw before goal reached or deadline
- Multi-sig option: Require 2 secrets (creator + trusted party)
- Social recovery: Beneficiary can claim after long timeout

### Attack Vector 2: Front-running
**Risk:** Attacker sees withdrawal transaction, tries to submit their own

**Mitigation:**
- Commit-reveal scheme: Submit hash first, reveal secret later
- Time-delay between commitment and execution

### Attack Vector 3: Relayer Censorship
**Risk:** Relayer refuses to create certain vaults

**Mitigation:**
- Multiple relayers (decentralized network)
- Fallback: Direct vault creation (sacrifices privacy)
- Relayer reputation system

---

## User Experience Flows

### Flow 1: Create Anonymous Donation Vault

```
1. User clicks "Create Vault"
2. Enters:
   - Beneficiary address: 0xABC... (sick friend)
   - Goal: 10,000 USDC
   - Title: "Help Maria with medical bills"

3. System generates random secret:
   ┌─────────────────────────────────────┐
   │ 🔐 Your Vault Control Secret:      │
   │                                     │
   │ moon-river-dancing-seven-cloud      │
   │                                     │
   │ ⚠️  SAVE THIS! You'll need it to   │
   │    withdraw funds to beneficiary    │
   │                                     │
   │ [📋 Copy]  [💾 Download]           │
   └─────────────────────────────────────┘

4. Vault created via relayer
   - Your identity: HIDDEN ✅
   - Beneficiary: PUBLIC ✅

5. Share vault link on Farcaster
   "Help Maria! → bankacast.app/vault/0x123"
```

### Flow 2: Anonymous Contribution

```
1. User opens vault link
2. Sees:
   ┌─────────────────────────────────────┐
   │ 🏥 Help Maria with medical bills    │
   │                                     │
   │ Funds go to: 0xABC...DEF ✅         │
   │ Goal: 10,000 USDC                   │
   │ Raised: 7,500 USDC (75%)            │
   │                                     │
   │ 🎁 12 anonymous donors              │
   └─────────────────────────────────────┘

3. Clicks "Contribute Privately"
4. Chooses amount: 100 USDC
5. Signs Aztec transaction (private)
6. Done! Nobody knows you contributed ✅
```

### Flow 3: Withdraw to Beneficiary

```
1. Creator opens vault (goal reached)
2. Clicks "Send to Beneficiary"
3. Enters secret phrase:
   ┌─────────────────────────────────────┐
   │ Enter your vault control secret:    │
   │ [moon-river-dancing-seven-cloud]    │
   │                                     │
   │ Funds will be sent to:              │
   │ 0xABC...DEF (Maria) ✅               │
   └─────────────────────────────────────┘

4. Transaction sent
5. Maria receives 10,200 USDC (with yield)
   - Everyone can verify on blockchain ✅
   - Nobody knows who created vault ✅
```

---

## Alternative: Simpler Hybrid Approach

**If full ZK is too complex, start with this:**

### Lite Privacy Mode
```solidity
contract Vault {
    address public beneficiary;     // PUBLIC (where money goes)
    address private creator;        // PRIVATE (stored but not exposed)
    bytes32 public creatorHash;     // PUBLIC (commitment)

    // No public getter for creator!
    // Only way to prove ownership: provide secret
}
```

**Frontend hides creator everywhere:**
- Vault list: Don't fetch/display creator
- Vault detail: Show only beneficiary
- Discover feed: "Anonymous campaign for 0xABC..."

**Privacy level:**
- Medium: Creator is on-chain but UI doesn't expose it
- Blockchain explorers can still see, but casual users won't
- Good enough for MVP, can upgrade to full ZK later

---

## Next Steps

**Questions to decide:**

1. **Privacy level:** Start with Lite Mode or go straight to ZK?
2. **Timeline:** 4 weeks (simple) vs 12 weeks (full ZK)?
3. **Contributions:** Keep simple (public) or integrate Aztec immediately?
4. **Security:** Comfortable with secret phrase approach?

**My recommendation:**
- **Phase 1 (NOW):** Implement beneficiary feature WITHOUT privacy (2 weeks)
- **Phase 2 (NEXT):** Add Lite Privacy Mode (2 weeks)
- **Phase 3 (LATER):** Full ZK with Aztec (8-10 weeks)

This gives users immediate value while building toward full privacy.

---

## Open Questions

1. **Should beneficiary be changeable?**
   - Pro: Fix mistakes
   - Con: Could enable fraud

2. **What if beneficiary rejects funds?**
   - Fallback to creator?
   - Refund contributors?

3. **Multi-beneficiary support?**
   - Split 60/40 to two addresses?
   - Equal split among N addresses?

4. **Privacy toggle?**
   - Some users want transparency (show their name proudly)
   - Others want anonymity (sensitive causes)
   - Let creator choose?

5. **Verification for beneficiary identity?**
   - How do donors know 0xABC is really Maria?
   - ENS name? Farcaster profile? Social proof?

