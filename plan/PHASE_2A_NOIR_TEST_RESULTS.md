# Phase 2a: Noir on Base - Test Results

**Date:** 2025-01-26
**Status:** 🟡 Partially Completed / Blocked
**Next Actions:** See recommendations below

---

## 🎯 Objective

Test whether Noir-generated Solidity verifier contracts can be deployed and used on Base Sepolia testnet.

**Goal:** Determine if Base supports the required EVM precompiles (`ecMul`, `ecAdd`, `ecPairing`, `modexp`) for zkSNARK verification.

---

## ✅ Completed Steps

### 1. Noir Toolchain Installation
**Status:** ✅ SUCCESS

```bash
# Installed noirup
curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash

# Installed nargo
~/.nargo/bin/noirup

# Version installed
nargo version = 1.0.0-beta.15
noirc version = 1.0.0-beta.15
```

**Location:** `~/.nargo/bin/nargo`

### 2. Created Test Circuit
**Status:** ✅ SUCCESS

**Location:** `/Users/damhuman/Documents/programming/claudecode/lviveth/banka/noir-test/test_circuit/`

**Circuit Code:**
```rust
fn main(x: u64, y: pub u64) {
    assert(x != y);
}
```

**Purpose:** Simple circuit that proves `x != y` without revealing private input `x`.

### 3. Compiled Circuit
**Status:** ✅ SUCCESS

```bash
cd noir-test/test_circuit
nargo compile
# Success - generated ACIR artifact
```

**Output:** `target/test_circuit.json`

---

## ❌ Blocked Steps

### 4. Barretenberg (bb) Installation
**Status:** 🔴 FAILED

**Problem:** Cannot install Barretenberg backend due to version compatibility issues.

**What we tried:**

1. **Attempt 1:** bbup default
   ```bash
   bbup
   # Error: Could not resolve noir version from nargo
   ```

2. **Attempt 2:** bbup with nargo in PATH
   ```bash
   export PATH="$HOME/.nargo/bin:$PATH"
   bbup
   # Error: Resolved to barretenberg version null
   # curl: (56) The requested URL returned error: 404
   ```

3. **Attempt 3:** bbup with specific Noir version
   ```bash
   bbup -nv 0.34.0
   # Error: Resolved to barretenberg version null
   # curl: (56) 404
   ```

4. **Attempt 4:** bbup with nightly
   ```bash
   bbup -nv nightly
   # Error: Resolved to barretenberg version null
   # curl: (56) 404
   ```

**Root Cause:**
- Noir v1.0.0-beta.15 may not have compatible Barretenberg binaries published
- bbup cannot resolve the mapping between Noir version and BB version
- 404 errors suggest binaries don't exist in expected locations

---

## 📊 Current Status Summary

| Task | Status | Notes |
|------|--------|-------|
| Install Noir | ✅ | nargo v1.0.0-beta.15 |
| Create circuit | ✅ | Simple test circuit |
| Compile circuit | ✅ | ACIR generated |
| Install Barretenberg | ❌ | Version resolution failure |
| Generate Solidity verifier | 🔴 Blocked | Need BB |
| Deploy to Base Sepolia | 🔴 Blocked | Need verifier contract |
| Verify proof on-chain | 🔴 Blocked | Need deployment |

---

## 🔍 What We Learned

### 1. Noir Ecosystem Maturity
- ✅ Noir installation is straightforward
- ✅ Circuit creation and compilation work well
- ⚠️ Barretenberg tooling has gaps (beta versions, missing binaries)
- ⚠️ Documentation doesn't cover all version compatibility issues

### 2. Tool Versioning Issues
- Beta versions (1.0.0-beta.15) may lack stable backend binaries
- bbup tooling seems incomplete for latest Noir versions
- May need to use stable releases (0.x) instead of beta releases (1.x)

### 3. Alternative Approaches Discovered
- **JavaScript/WASM approach:** Use `@noir-lang/noir_js` and `@noir-lang/backend_barretenberg` (npm packages)
- **Pre-compiled verifiers:** Find existing Noir verifier contracts for testing
- **Stable version:** Downgrade to Noir 0.34.0 or similar stable release

---

## 🚀 Recommended Next Steps

### Option A: Use Stable Noir Version (RECOMMENDED)
**Timeline:** 2-4 hours

```bash
# Uninstall current nargo
rm -rf ~/.nargo

# Install stable version
noirup -nv 0.34.0  # or latest stable 0.x

# Recreate project with stable version
nargo new stable_test
nargo compile
bb write_vk ...
bb write_solidity_verifier ...
```

**Pros:**
- Likely has compatible Barretenberg binaries
- More documentation and examples
- Community has tested these versions

**Cons:**
- Older features, may miss latest improvements
- Will need to track when 1.0 stable releases

---

### Option B: Use JavaScript/WASM Approach
**Timeline:** 3-5 hours

**Setup:**
```bash
cd frontend
npm install @noir-lang/noir_js @noir-lang/backend_barretenberg
```

**Workflow:**
1. Compile circuit with `nargo compile`
2. Generate proof in JavaScript (browser or Node.js)
3. Export verifier contract programmatically
4. Deploy to Base Sepolia

**Pros:**
- Works with current Noir v1.0.0-beta.15
- Proof generation in frontend (no backend needed)
- Good for web apps

**Cons:**
- More complex setup
- Need to learn JS API
- Larger bundle size

---

### Option C: Find Existing Verifier Contract
**Timeline:** 1-2 hours

**Approach:**
1. Search for published Noir verifier contracts
2. Find one on GitHub/Etherscan
3. Deploy it to Base Sepolia
4. Test precompile support directly

**Pros:**
- Fastest way to answer "Does Base support Noir?"
- No need to fix tooling issues
- Immediate yes/no answer

**Cons:**
- May not match our exact use case
- Won't learn full Noir workflow

---

### Option D: Wait for Noir 1.0 Stable
**Timeline:** Unknown (weeks-months)

**Approach:**
- Monitor Noir releases
- Wait for 1.0.0 stable (not beta)
- Retry Phase 2a with stable tooling

**Pros:**
- Best long-term approach
- Stable, production-ready tools

**Cons:**
- Blocks progress on Banka
- Unknown timeline

---

## 💡 Immediate Recommendation

**I recommend Option A + C combined approach:**

### Step 1: Quick Precompile Test (Option C) - 1 hour
Find and deploy existing Noir verifier to Base Sepolia to answer:
- ✅ Does Base support ecMul/ecAdd/ecPairing?
- ✅ What are gas costs?
- ✅ Does verification work?

### Step 2: Full Noir Workflow (Option A) - 3 hours
Downgrade to stable Noir 0.34.0 and complete full workflow:
- Generate our own verifier
- Deploy to Base Sepolia
- Create and verify proofs
- Document everything

**Total time:** ~4 hours
**Risk:** LOW
**Learning:** MAXIMUM

---

## 🎓 Technical Insights for Banka

### If Base Works (Expected):
1. **Anonymous vault creation is feasible** ✅
2. **Gas costs:** ~$2-4 per verification (estimate)
3. **UX:** Proof generation in browser (~2-5 seconds)
4. **Security:** Cryptographic privacy, provably secure

### If Base Doesn't Work (Unlikely):
1. **Fallback to Optimism** (known to work)
2. **Use relayer pattern** instead (simpler, no ZK)
3. **Wait for Base updates** (unlikely scenario)

---

## 📝 Open Questions

1. **Version Strategy:**
   - Should we use beta (1.x) or stable (0.x) for production?
   - When will Noir 1.0 stable release?

2. **Base Specific:**
   - Has anyone deployed Noir on Base before?
   - Are there Base-specific precompile limitations?

3. **Gas Optimization:**
   - What's the cheapest proof system for Base?
   - Can we batch verifications?

4. **Frontend Integration:**
   - Browser proof generation performance?
   - Mobile device support?

---

## 🔗 Useful Resources

### Noir Documentation
- Official docs: https://noir-lang.org/docs/
- Barretenberg docs: https://barretenberg.aztec.network/
- Noir GitHub: https://github.com/noir-lang/noir

### Base Documentation
- Base docs: https://docs.base.org/
- EVM precompiles reference: https://www.evm.codes/precompiled
- Base Sepolia explorer: https://sepolia.basescan.org/

### Community
- Noir Discord: https://discord.gg/aztec
- Base Discord: https://discord.gg/buildonbase
- Noir Forum: https://forum.aztec.network/

---

## 📌 Conclusion

**Phase 2a Status:** 🟡 Partially completed

**What we accomplished:**
- ✅ Installed Noir toolchain
- ✅ Created and compiled test circuit
- ✅ Identified tooling gaps

**What we learned:**
- Noir v1.0.0-beta has compatibility issues with Barretenberg
- Need alternative approach (stable version or JS/WASM)
- Full workflow requires more investigation

**Next decision point:**
Choose between:
1. Quick test with existing verifier (1h)
2. Full workflow with stable Noir (4h)
3. Skip to Phase 1 (beneficiary feature) and revisit ZK later

**Recommendation:** Do quick test (#1) to answer "Does Base work?" then decide based on results.

---

**Test conducted by:** Claude
**Date:** January 26, 2025
**Project:** Banka - ZK Privacy Integration
