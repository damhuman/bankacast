# Banka Product Backlog

> **📚 New to Web3?** Перш ніж почати, прочитай [TEAM_GUIDE.md](./TEAM_GUIDE.md) - повний гайд по технологіях для команди.

---

## Product Requirements Document (PRD)

### Vision
**EthBanka** - найпростіший спосіб створювати donation vaults в USDC на Base з автоматичною генерацією yield через AAVE під час fundraising.

**Fundraising is essential in 2025 in Ukraine.** EthBanka надає прозорий, ефективний спосіб збирати кошти для військових, гуманітарних та громадських потреб з повною прозорістю та автоматичним примноженням коштів через DeFi.

### Problem

**Current fundraising methods in Ukraine:**
- 🏦 **МоноБанка** - UAH only, залежність від банків, немає yield generation, обмежена глобальна доступність
- 💳 **Straight to wallet** (e.g. sternenko.eth) - Немає transparency, progress tracking, social proof механізмів
- 🌍 **Traditional platforms** (GoFundMe, Patreon) - 5-10% комісії, обмежена crypto підтримка, slow payouts, KYC requirements

**Additional problems:**
- Групові збори через Venmo/PayPal - нема прозорості
- DeFi yields складні для використання
- **Privacy проблема** - публічні contributions на blockchain (всі бачать хто і скільки вніс)

### Solution

**EthBanka** - платформа на Base blockchain з Aztec privacy layer:

1. ✅ **Easy Vault Creation** - Створи donation vault за 30 секунд
2. 🇺🇦 **USDC on Base** - Глобально доступні донати з мінімальними fees (~$0.01)
3. 💰 **Automatic AAVE Yield** - Кошти автоматично генерують 3-8% APY під час збору
4. 📊 **Full Transparency** - Real-time progress, contributors, yield earned
5. 👥 **Farcaster Frames** - One-click contributions прямо в social feed
6. ⚡ **Smash Vault Early** - Withdraw коштів до deadline якщо urgent need
7. 🔒 **Optional Privacy** - Private contributions через Aztec/Noir ZK proofs

### Target Audience (MVP)

**Primary: Ukrainian Fundraisers & Volunteers**
- Волонтери які збирають на військові потреби (дрони, екіпіровка)
- NGOs та благодійні організації
- Медичні заклади (обладнання, ліки)
- Громадські ініціативи (відновлення інфраструктури)
- Crypto-savvy українці з доступом до USDC

**Secondary: Crypto Early Adopters**
- Farcaster community (crypto-native users)
- Вік: 25-45
- Вже мають crypto wallet та розуміють Base/USDC
- Активні в Base та Aave ecosystems

**Geographic Focus:**
- 🇺🇦 Ukraine (primary - fundraising needs)
- 🌍 Global (diaspora supporting Ukraine, general crypto users)

### Use Cases

**Ukrainian Fundraising (Priority):**
- 🚁 **Drone Fundraising** - Volunteers collect for FPV drones, reconnaissance UAVs ($500-5000 per goal)
- 🏥 **Medical Equipment** - Hospitals raise for generators, ultrasound machines, ambulances
- 🛡️ **Military Gear** - Tactical equipment, body armor, night vision for units
- 🏠 **Humanitarian Aid** - Housing for displaced families, heating, food supplies
- 🔧 **Infrastructure Repair** - Schools, hospitals, power grids restoration
- 🚑 **Evacuation Transport** - Vans and vehicles for frontline evacuations

**General Crowdfunding:**
- 🎉 **Group Gifts** - Birthday, wedding, celebration gifts з друзями
- 🏫 **Community Projects** - Local initiatives, playgrounds, community centers
- 🎓 **Education** - Scholarships, student support, course funding
- 🌳 **Environmental** - Tree planting, park cleanup, conservation
- 🤝 **Charity Drives** - Animal shelters, orphanages, elderly care

**Why EthBanka?**
- МоноБанка only works in Ukraine (UAH), EthBanka = global USDC
- No bank dependency or censorship risk
- Funds earn yield automatically (3-8% APY)
- Full transparency on-chain
- Lower fees (~$0.01 vs bank percentages)

### User Stories

**As a Creator:**
- Хочу створити vault за <1 хвилину без складних налаштувань
- Хочу легко поділитись посиланням в соцмережах
- Хочу бачити real-time хто скільки вніс
- Хочу отримати гроші + yield коли ціль досягнута

**As a Contributor:**
- Хочу побачити vault в моєму Farcaster feed
- Хочу зробити contribution в 2 кліки (без виходу з Farcaster)
- Хочу бачити progress bar та скільки залишилось
- Хочу довіряти що гроші підуть на заявлену ціль

### Core Features (MVP)

**Must Have - Phase 1 (USDC):**
1. Create Vault (title, goal amount, deadline)
2. Contribute to Vault (USDC only)
3. Withdraw when goal reached (creator only)
4. Aave V3 yield generation automatic
5. Farcaster Frame integration
6. Progress tracking (bar + amount)
7. Vault list page (home)
8. Vault detail page

**Must Have - Phase 2 (Multi-Token) - TECHNICAL PRIORITY #1:**
9. **Multi-Token Support: ETH, USDT, DAI + USDC**
   - Token selector in vault creation
   - Support multiple Aave V3 pools (ETH, USDT, DAI, USDC)
   - Dynamic APY display per token
   - Currency conversion/display logic
   - Update smart contracts to accept multiple ERC20s

**Should Have - Phase 3 (Privacy):**
10. **Private contributions через Aztec/Noir (toggle option)**

**Should Have:**
- Real-time updates (WebSocket)
- Mobile responsive
- Basic error handling
- Share link generation
- ZK proof verification UI

**Won't Have (V1):**
- Multi-token support
- User profiles
- Comments/social features
- Email notifications
- Analytics dashboard
- Recurring contributions
- Full Aztec network deployment (testnet proof of concept OK)

### Technical Requirements

**Smart Contracts:**
- ERC20 support (USDC)
- Aave V3 integration
- Factory pattern (gas efficient)
- Upgradeable proxies
- Events для indexing
- **Aztec integration для private contributions**

**Zero-Knowledge Layer:**
- **Noir circuits для proof generation**
- **Private contribution verification contract**
- **ZK proof для amount без reveal contributor identity**
- Aztec Sandbox для local testing

**Backend:**
- REST API
- Event listener (real-time indexing)
- PostgreSQL для історії
- WebSocket для live updates
- ZK proof verification endpoint

**Frontend:**
- Wallet connection (Privy)
- Farcaster Frame spec compliant
- Responsive design
- Fast load time (<3s)
- Toggle для private/public contribution
- Aztec wallet integration (experimental)

### Success Metrics (3 weeks)

**Adoption:**
- 10-15 beta users залучені ✓
- 5+ vaults створено
- 20+ contributions зроблено
- 50+ unique visitors landing page

**Engagement:**
- Avg 3 contributions per vault
- 60%+ vaults досягають 50% goal
- 5+ shares в Farcaster
- **2+ private contributions через Aztec (proof of concept)**

**Tech:**
- <2s load time
- 0 critical bugs
- 99% uptime
- **ZK proof generation <10s**
- **Successful ZK verification rate >95%**

**Learning:**
- User interview з 5 beta users
- Top 3 feature requests зібрано
- Conversion funnel mapped
- **Privacy feature usage feedback**

### Out of Scope (Defer to Later)

**V2 Features (High Priority):**
- 💰 **Multi-Token Support** - ETH, USDT, DAI, USDC (highest priority!)
  - Allows users to donate in their preferred currency
  - Different Aave V3 pools for different tokens
  - Token selector in UI
- User profiles з vault history
- Vault categories (Military, Medical, Humanitarian)
- Recurring contributions (monthly donations)

**V2 Features (Medium Priority):**
- Advanced analytics dashboard
- Email/Push notifications
- Vault templates для popular use cases
- Mobile app (React Native)
- Mainnet deployment

**Future Ideas (Low Priority):**
- DAO governance
- Cross-chain support (Optimism, Arbitrum)
- NFT rewards для top contributors
- Integration з Lens Protocol
- Fiat on-ramp (credit card donations)

### Risks & Mitigations

**Risk 1:** Low adoption на Farcaster
- Mitigation: Outreach до Base та Aave communities також

**Risk 2:** Security vulnerability
- Mitigation: Internal code review, поки testnet з малими amounts

**Risk 3:** Aave integration складна
- Mitigation: Використати готові Aave docs та examples, почати з простої версії

**Risk 4:** Gas costs високі
- Mitigation: Base має low fees (~$0.01 per tx)

### Go-to-Market (3 weeks)

**Week 1:** Build foundation
**Week 2:** Internal testing з друзями
**Week 3:** Soft launch в Farcaster (organic)

**Channels:**
- Farcaster (primary)
- Twitter crypto
- Base Discord
- Aave community
- **Aztec Discord та Twitter (ZK community)**
- **Privacy-focused crypto communities**

**Messaging:**
- "Save together, earn together, privately"
- "Перший privacy-preserving crowdfunding"
- "Zero-knowledge contributions - your privacy protected"
- "DeFi savings meets privacy tech"

### Competitors

**Direct:**
- PoolTogether (lottery-based savings, НЕ має privacy)
- Mirror (crowdfunding для creators, НЕ має privacy)
- Tornado Cash (privacy, але НЕ має savings/crowdfunding use case)

**Indirect:**
- GoFundMe (web2, high fees, НЕ має privacy)
- Venmo group payments (no transparency)
- Traditional DeFi savings (not social, НЕ має privacy)

**Our Advantage:**
- **Zero-knowledge privacy через Aztec/Noir (УНІКАЛЬНО для crowdfunding)**
- Farcaster native (frames)
- Auto yield generation
- Zero fees (MVP)
- Social proof механізм + опціональна анонімність

---

## 3 Week Sprint Plan
**Team:** Антон (Dev), Андрій (QA/Ops), Каріна (Marketing/Community)

---

## Week 1: Foundation (USDC Only)

### Антон
**Smart Contracts - USDC Foundation**
- Vault.sol базовий (deposit, withdraw, goal tracking) для USDC
- VaultFactory.sol мінімальний (create vault)
- Aave V3 USDC pool integration
- Тести для core функцій
- Deploy на Base Sepolia

**Backend**
- FastAPI setup з PostgreSQL
- API endpoints: GET /vaults, POST /vault, GET /vault/{id}
- Event listener базовий (слухати VaultCreated)
- Database schema для single token (USDC)

### Андрій
- Setup Linear/Notion для task tracking
- Налаштувати testnet wallets (5 штук для testing)
- Написати test scenarios документ
- Daily sync в 10:00 координувати

### Каріна
- Competitive research: 3 схожі проекти (features, audience)
- Створити список 20 потенційних early users з Farcaster
- Draft FAQ (5-7 основних питань)
- Setup Twitter account

---

## Week 2: Multi-Token Integration (ETH, USDT, DAI) - PRIORITY #1

### Антон
**Smart Contracts - Multi-Token Support**
- Refactor Vault.sol для підтримки multiple ERC20 tokens
- Add token address parameter до vault creation
- Integrate Aave V3 pools для ETH, USDT, DAI (not just USDC)
- Dynamic yield calculation per token type
- Update VaultFactory.sol для token selection
- Testing з різними токенами
- Deploy updated contracts на Base Sepolia

**Backend - Multi-Token Database**
- Update database schema: add `token_address` та `token_symbol` fields
- API endpoints update: token parameter в vault creation
- Event listener: track different token types
- Add token metadata (symbol, decimals, Aave pool addresses)
- Currency conversion logic (optional: display in USD equivalent)

**Frontend - Token Selector**
- Next.js setup з Privy wallet
- Create vault page: Token selector dropdown (USDC, ETH, USDT, DAI)
- Display token-specific APY від Aave
- Home page: список vaults з token indicator
- Vault detail page: show token type + progress

### Андрій
- Manual testing всіх endpoints API з різними токенами
- Testing smart contracts на Sepolia (ETH, USDT, DAI, USDC vaults)
- Bug tracking в Linear
- Testnet tokens distribution (ETH, USDT, DAI, USDC) для testers
- Verify Aave yield працює для всіх токенів

### Каріна
- Landing page в Framer з multi-token messaging
- Token comparison table (USDC vs ETH vs USDT vs DAI features)
- Social media plan з emphasis на token flexibility
- Explainer: "Donate in your preferred currency"

---

## Week 3: Farcaster Frames + Polish + Deployment

### Антон
**Farcaster Frames Integration (PRIORITY)**
- Frame metadata endpoint для vault sharing
- Frame image generation з progress bar та token display
- Contribute action endpoint з multi-token support
- Transaction signing flow для different tokens
- QR code generation з vault address
- Testing Frames в Warpcast

**Frontend Polish**
- Contribution form на vault detail page (all tokens)
- Token-specific balance checks та error handling
- Multi-token wallet approval flow
- Deploy backend на Railway
- Deploy frontend на Vercel
- Responsive mobile view
- Loading states та error messages

**Backend Finalization**
- WebSocket для live updates (all tokens)
- Event listener stability improvements
- API documentation (Swagger) з multi-token examples

### Андрій
- Internal testing: 5-7 людей протестувати повний flow з різними токенами
- Create test scenarios для кожного токену (ETH, USDT, DAI, USDC)
- Verify Farcaster Frames працюють correctly
- Збирати bugs та feedback в structured format
- Deployment checklist (ENV vars, DB, contracts addresses для всіх токенів)
- Performance testing: transaction times, gas costs per token
- Verify Aave yields для всіх токенів

### Каріна
- **PRIORITY: Identify real Ukrainian volunteer for first military vault**
  - Outreach до особистих контактів (волонтери, військові)
  - Знайти когось з реальною потребою ($500-5000)
  - Verify legitimacy (соцмережі, vouching)
  - Підготувати briefing: як працює EthBanka
- User guide: як створити vault в різних токенах
- Multi-token benefits explainer (ETH vs USDC vs USDT vs DAI)
- Beta tester onboarding materials
- **Prepare для Week 3 real vault launch:**
  - Draft compelling vault title/description з volunteer
  - Plan Farcaster Frame sharing strategy
  - Identify key Telegram groups для sharing
- Token selection guide: який токен обрати для різних use cases

---

## Deliverables (End of Week 3)

### 🎯 PRIMARY DELIVERABLE (North Star)

**1 REAL Military Fundraiser Vault via Farcaster**
- ✅ Real Ukrainian volunteer/unit identified and onboarded
- ✅ Vault created for actual military need ($500-5000)
- ✅ Shared as Farcaster Frame in /ukraine and volunteer's networks
- ✅ Minimum 3 real contributions from different wallets
- ✅ Vault actively fundraising toward goal
- ✅ Case study documented (screenshots, metrics, feedback)

**Success looks like:**
- Volunteer successfully created vault (with our help if needed)
- Frame shared in multiple Telegram groups and Farcaster
- First contributions received within 24 hours
- No critical bugs blocking real usage
- Volunteer satisfied with experience

---

### Tech - Multi-Token Support

- Smart contracts на Base Sepolia (ETH, USDT, DAI, USDC support)
- **4 Aave V3 pool integrations working** (ETH, USDT, DAI, USDC)
- **Multi-token VaultFactory deployed**
- Working app на Vercel з token selector
- Backend на Railway з multi-token tracking
- Test vaults створено для кожного токену:
  - 2 USDC vaults
  - 2 ETH vaults
  - 1 USDT vault
  - 1 DAI vault

### Product

- Landing page live з multi-token messaging
- User guide document (how to choose token + real vault example)
- Token comparison guide (features, APY, use cases)
- FAQ з multi-token section
- **Real military vault as featured example**

### Community

- 10-15 beta testers залучені
- **1 real Ukrainian volunteer successfully using platform**
- Twitter + Farcaster active
- Launch announcement: "Donate in YOUR currency"
- **Real vault shared in Ukrainian communities**

### Feature Validation

- ✅ All 4 tokens working end-to-end
- ✅ Aave yield generation verified for each token
- ✅ **Farcaster Frames working in production (real vault proof)**
- ✅ Gas costs compared across tokens
- ✅ **Real user flow validated (volunteer feedback)**
- ✅ Demo video: multi-token flow + real vault showcase

---

## Success Criteria

**Must Have (Week 1-3)**
- User can create vault в будь-якому токені (ETH, USDT, DAI, USDC)
- User can contribute to vault в тому ж токені
- **All 4 tokens work end-to-end** (create, contribute, withdraw)
- **Aave yield генерується для всіх 4 токенів**
- Progress bar shows correctly з token indicator
- Can share vault via Farcaster Frame
- Token selector UI працює інтуїтивно
- **Different APY displayed per token type**

**Nice to Have (Week 3)**
- Real-time updates через WebSocket
- Mobile responsive
- Error messages зрозумілі
- Gas cost comparison between tokens
- USD value display (optional)

**Defer to Phase 3 (Post-Launch)**
- **Private contributions через Aztec/Noir** (moved from Week 3)
- User profiles з vault history
- Email/Push notifications
- Advanced analytics dashboard
- Vault categories (Military, Medical, Humanitarian)
- Recurring contributions
- Full Aztec mainnet deployment

---

## Daily Standup (10:00)

**Format**
- Що зробили вчора
- Що робимо сьогодні
- Чи є blockers

**Friday Demo (17:00)**
- Демо того що побудували за тиждень
- Що працює, що ні
- Plan на наступний тиждень

---

## Post-Launch Plan (Week 4+)

**Антон**
- Bug fixes based on user feedback
- Performance optimization
- V2 features prioritization

**Андрій**
- User metrics tracking setup
- Weekly metrics report
- Координувати user interviews

**Каріна**
- Daily community management
- Weekly content (success stories, privacy use cases)
- Partnership outreach (Base ecosystem + **Aztec community**)
- Grow beta users → 50-100
- **Privacy-focused marketing campaigns**

---

## Reality Check

**Що точно НЕ встигнемо:**
- Professional UI/UX design
- External security audit для ZK circuits
- Full Aztec mainnet deployment (sandbox/testnet OK)
- Mainnet deployment на Base
- Advanced features (categories, templates, etc)
- Mobile app
- Video tutorials
- Повна інтеграція з Aztec network (тільки proof of concept)

**ZK Integration Reality:**
- Week 3 = proof of concept, не production-ready
- Aztec Sandbox локально, не deployed
- Базовий Noir circuit (simple proof)
- Manual testing, не automated
- 2-3 successful private contributions = success

**Що робимо після 3 тижнів:**
- 1-2 тижні beta testing з users
- Збирати feedback
- Bug fixes
- Потім decision: mainnet чи pivot

**Budget на 3 тижні:**
- Hosting: $20 (Railway + Vercel free tier)
- Domain: $15
- Tools: Free tier (Linear, Discord)
- Aztec Sandbox: Free (local development)
- Total: ~$35

**Marketing Messaging (оновлено для Multi-Token):**
- "Donate in YOUR preferred currency - ETH, USDC, USDT, or DAI"
- "Transparent fundraising with automatic yield generation"
- "Global donations made easy - choose your token"
- "Ukrainian fundraising powered by DeFi"

---

## Technical Deep Dive: Multi-Token Integration

### Week 2 Implementation Plan (для Антона)

**Day 1-2: Research & Architecture**
- Дослідити Aave V3 token addresses на Base Sepolia:
  - USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
  - WETH (Wrapped ETH): Check Aave docs
  - USDT: Check Aave docs
  - DAI: Check Aave docs
- Research Aave V3 Pool contract methods для different tokens
- Design multi-token Vault.sol architecture
- Plan database schema changes

**Day 3-4: Smart Contract Development**
```solidity
// Updated Vault.sol structure
contract Vault is Initializable {
    address public tokenAddress;      // ERC20 token address (USDC/WETH/USDT/DAI)
    IPool public aavePool;            // Aave V3 Pool
    uint256 public goalAmount;
    uint256 public deadline;

    function initialize(
        address _creator,
        address _tokenAddress,    // NEW: token parameter
        uint256 _goalAmount,
        uint256 _deadline
    ) external initializer {
        tokenAddress = _tokenAddress;
        // ... rest of initialization
    }

    function contribute(uint256 amount) external {
        // Transfer token від contributor
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);

        // Approve Aave
        IERC20(tokenAddress).approve(address(aavePool), amount);

        // Supply до Aave (automatically detects token type)
        aavePool.supply(tokenAddress, amount, address(this), 0);

        // Update tracking
        totalContributed += amount;
    }
}

// Updated VaultFactory.sol
contract VaultFactory {
    function createVault(
        address tokenAddress,     // NEW: token selector
        uint256 goalAmount,
        uint256 deadline
    ) external returns (address) {
        // Clone vault implementation
        address vault = Clones.clone(vaultImplementation);

        // Initialize with token address
        Vault(vault).initialize(msg.sender, tokenAddress, goalAmount, deadline);

        emit VaultCreated(vault, msg.sender, tokenAddress, goalAmount);
        return vault;
    }
}
```

**Day 5-6: Backend Integration**
```python
# Updated database schema
class Vault(Base):
    __tablename__ = "vaults"

    address = Column(String, primary_key=True)
    creator = Column(String)
    token_address = Column(String)      # NEW
    token_symbol = Column(String)       # NEW: ETH, USDC, USDT, DAI
    goal_amount = Column(Numeric)
    total_contributed = Column(Numeric)

# Token metadata constants
SUPPORTED_TOKENS = {
    "0x036CbD53842c5426634e7929541eC2318f3dCF7e": {
        "symbol": "USDC",
        "decimals": 6,
        "aave_pool": "0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b"
    },
    # Add WETH, USDT, DAI mappings
}

# API endpoints
@app.post("/vaults")
async def create_vault(
    token_address: str,     # NEW: require token selection
    goal_amount: float,
    deadline: int
):
    # Validate token is supported
    if token_address not in SUPPORTED_TOKENS:
        raise HTTPException(400, "Token not supported")
    # ...
```

**Day 7: Frontend Token Selector**
```typescript
// Token selector component
const TOKENS = [
  { address: "0x036Cbd...", symbol: "USDC", icon: "/usdc.png", apy: "5.2%" },
  { address: "0xWETH...", symbol: "ETH", icon: "/eth.png", apy: "3.8%" },
  { address: "0xUSDT...", symbol: "USDT", icon: "/usdt.png", apy: "4.5%" },
  { address: "0xDAI...", symbol: "DAI", icon: "/dai.png", apy: "4.1%" },
];

function CreateVaultForm() {
  const [selectedToken, setSelectedToken] = useState(TOKENS[0]);

  return (
    <select onChange={(e) => setSelectedToken(TOKENS[e.target.value])}>
      {TOKENS.map(token => (
        <option value={token.address}>
          {token.symbol} - {token.apy} APY
        </option>
      ))}
    </select>
  );
}
```

**Resources:**
- Aave V3 Docs: https://docs.aave.com/developers/core-contracts/pool
- Base Token Addresses: https://docs.base.org/tokens
- ERC20 Interface: OpenZeppelin docs
- Multi-token examples: Check Aave GitHub

**Testing Checklist:**
- ✅ Create vault in USDC
- ✅ Create vault in ETH (WETH)
- ✅ Create vault in USDT
- ✅ Create vault in DAI
- ✅ Contribute to each token type
- ✅ Verify Aave yield for each
- ✅ Withdraw with yield for each
- ✅ Gas cost comparison

---

## Pre-Sprint 0 Checklist

### Всі члени команди MUST DO перед Week 1:

**Загальне (для всіх):**
- Прочитати [TEAM_GUIDE.md](./TEAM_GUIDE.md) повністю
- Встановити Metamask wallet
- Додати Base Sepolia network в Metamask
- Отримати testnet ETH з Base Sepolia faucet
- Отримати testnet USDC
- Зберегти seed phrase в безпечному місці
- Зробити першу тестову транзакцію (send 0.001 ETH собі)

**Антон (Developer):**
- Install Foundry: `curl -L https://foundry.paradigm.xyz | bash`
- Install Node.js v18+ та npm
- Install Git та GitHub setup
- Clone repos структура (contracts, backend, frontend)
- Deploy hello world contract на Base Sepolia
- Setup VSCode з Solidity extension
- Join Base та Aztec Discord

**Андрій (QA/Ops):**
- Setup 5 testnet wallets (для різних test scenarios)
- Знайомство з Basescan explorer
- Розуміння як read contract на Basescan
- Setup Linear/Notion project management
- Прочитати Frame validator docs
- Join testing communities (Base Discord)

**Каріна (Marketing/Community):**
- Download Warpcast app
- Створити Farcaster account
- Follow: Base, Aztec, Aave, Farcaster accounts
- Join Farcaster channels про Base ecosystem
- Competitive analysis (3 проекти): PoolTogether, Mirror, + 1
- Draft FAQ (5 питань які users можуть мати)
- Join Aztec Discord для розуміння community

**Зустріч Week 0 (перед стартом):**
- Go through TEAM_GUIDE.md разом
- Q&A сесія про незрозумілі концепти
- Demo: як робити transactions, як читати Basescan
- Agreement на daily standup час (10:00)
- Setup communication channels (Telegram/Discord)

**Success Criteria для Week 0:**
- Всі мають working testnet wallet
- Всі зробили мінімум 1 testnet транзакцію
- Антон задеплоїв hello world contract
- Андрій має 5 testnet wallets з балансом
- Каріна має Farcaster account та competitive analysis
- Task management tool setup з Week 1 tasks
