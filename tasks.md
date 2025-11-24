# Banka Product Backlog

> **📚 New to Web3?** Перш ніж почати, прочитай [TEAM_GUIDE.md](./TEAM_GUIDE.md) - повний гайд по технологіях для команди.

---

## Product Requirements Document (PRD)

### Vision
Banka - найпростіший спосіб зібрати гроші разом з друзями через соцмережі з privacy гарантіями. Створи ціль, поділись в Farcaster, отримуй contributions + автоматичний yield з DeFi. **Zero-knowledge докази забезпечують конфіденційність contributions.**

### Problem
- Існуючі crowdfunding платформи (GoFundMe) беруть 5-10% комісії
- Групові збори грошей через Venmo/PayPal - нема прозорості, хто скільки вніс
- DeFi savings складні для звичайних людей
- Соціальні мережі (Farcaster) не мають native фінансових інструментів
- **Публічні contributions на blockchain - всі бачать хто і скільки вніс (privacy проблема)**

### Solution
Платформа на Base blockchain + Aztec privacy layer де можна:
1. Створити savings vault за 30 секунд
2. Поділитись в Farcaster Frame (one-click contribute)
3. Автоматично заробляти відсотки через Aave V3
4. Повна прозорість contributions on-chain
5. **Private contributions через Aztec/Noir ZK proofs (опціонально)**

### Target Audience (MVP)

**Primary:** Farcaster early adopters (crypto-native users)
- Вік: 25-40
- Вже мають crypto wallet
- Активні в crypto communities
- Готові тестувати нові продукти

**Use Cases:**
- Group gift для друга (birthday, wedding)
- Team event funding (conference trip)
- Charity fundraising
- Personal savings goal з accountability

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

**Must Have:**
1. Create Vault (title, goal amount, deadline)
2. Contribute to Vault (USDC only)
3. Withdraw when goal reached (creator only)
4. Aave V3 yield generation automatic
5. Farcaster Frame integration
6. Progress tracking (bar + amount)
7. Vault list page (home)
8. Vault detail page
9. **Private contributions через Aztec/Noir (toggle option)**

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

**V2 Features:**
- ETH, USDT, DAI support
- User profiles з history
- Vault categories
- Advanced analytics
- Mobile app
- Mainnet deployment

**Future Ideas:**
- DAO governance
- Cross-chain (Optimism, Arbitrum)
- NFT rewards
- Integration з Lens Protocol
- Vault templates

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

## Week 1: Foundation

### Антон
**Smart Contracts**
- Vault.sol базовий (deposit, withdraw, goal tracking)
- VaultFactory.sol мінімальний (create vault)
- Тести для core функцій
- Deploy на Base Sepolia

**Backend**
- FastAPI setup з PostgreSQL
- API endpoints: GET /vaults, POST /vault, GET /vault/{id}
- Event listener базовий (слухати VaultCreated)

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

## Week 2: MVP Build

### Антон
**Smart Contracts**
- Aave V3 integration (deposit в Aave при contribution)
- Withdrawal з yield calculation
- Deadline та goal check логіка

**Backend**
- Event listener для Contributed events
- WebSocket базовий для live updates
- Contributed events зберігати в DB

**Frontend**
- Next.js setup з Privy wallet
- Home page: список vaults з VaultCard компонентом
- Create vault page з формою
- Vault detail page з progress bar

### Андрій
- Manual testing всіх endpoints API
- Testing smart contracts на Sepolia (create vault, contribute, withdraw)
- Bug tracking в Linear
- Testnet USDC роздати тестерам

### Каріна
- Landing page в Framer (1 сторінка: hero, how it works, CTA)
- Explainer text: що таке Banka за 3 параграфи
- Social media plan (3 пости на тиждень)
- Підготувати Welcome message для Discord

---

## Week 3: Launch Prep + ZK Integration

### Антон
**Aztec/Noir Integration (PRIORITY)**
- Setup Aztec Sandbox locally
- Написати Noir circuit для private contribution proof
  - Verify contribution amount без reveal identity
  - Prove sum of contributions matches vault total
- Private contribution contract на Solidity (verify ZK proofs)
- Frontend toggle "Make contribution private"
- Generate та submit ZK proof при private contribution
- Testing: 2 private contributions proof of concept

**Frontend (if time permits)**
- Contribution form на vault detail page
- Basic error handling (no balance, wrong network)
- Deploy backend на Railway
- Deploy frontend на Vercel
- Responsive mobile view

**Farcaster Frame (if time permits)**
- Frame metadata для vault share
- Frame image з progress bar
- Contribute button в Frame

### Андрій
- Setup Aztec Sandbox testing environment
- Testing ZK proof generation (manual test з Антоном)
- Verify private contributions працюють (proof of concept)
- Performance testing: ZK proof generation time
- Internal testing: 5 людей протестувати повний flow
- Збирати bugs та feedback в документ
- Deployment checklist (ENV vars, DB, contracts, Aztec sandbox)

### Каріна
- Дослідити Aztec community (Discord, Twitter)
- Написати explainer "Чому privacy важлива для crowdfunding" (1 параграф)
- User guide: як створити vault, як зробити contribution (public + private)
- Beta tester onboarding з акцентом на ZK feature
- Пости для launch: Twitter thread з emphasis на privacy (5-7 твітів)
- Farcaster launch post: "Перший privacy-preserving crowdfunding"
- Outreach до Aztec community для partnership/support

---

## Deliverables (End of Week 3)

**Tech**
- Smart contracts на Base Sepolia
- **Noir circuits для private contributions**
- **ZK proof verification contract**
- **Aztec Sandbox working locally**
- Working app на Vercel
- Backend на Railway
- 5 test vaults створено (1-2 з private contributions)

**Product**
- Landing page live з privacy messaging
- User guide document (public + private flow)
- FAQ готове з ZK privacy section

**Community**
- 10-15 beta testers залучені
- Twitter + Farcaster active
- Launch announcement готовий з privacy angle
- **Aztec community outreach initiated**

**Proof of Concept**
- **Мінімум 2 успішні private contributions через ZK proofs**
- **ZK proof generation <10 seconds**
- **Demo video: private contribution flow**

---

## Success Criteria

**Must Have**
- User can create vault
- User can contribute to vault (public)
- **User can contribute to vault (private через Aztec/Noir)**
- Progress bar shows correctly
- Can share vault via Farcaster Frame
- Aave yield генерується
- **ZK proof generates successfully**
- **Private contribution verifies on-chain**

**Nice to Have**
- Real-time updates через WebSocket
- Mobile responsive
- Error messages зрозумілі
- Farcaster Frame integration

**Defer to V2**
- Multi-token support
- User profiles
- Notifications
- Analytics dashboard
- Full Aztec mainnet deployment
- Private vault creation (not just contributions)

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

**Marketing Messaging (оновлено для ZK):**
- "Save together, earn together, privately"
- "Перший privacy-preserving crowdfunding on blockchain"
- "Zero-knowledge contributions - ваші donations залишаються конфіденційними"
- "DeFi savings meets privacy"

---

## Technical Deep Dive: Aztec/Noir Integration

### Week 3 ZK Implementation Plan (для Антона)

**Day 1-2: Setup & Learning**
- Встановити Aztec Sandbox: `bash -i <(curl -s install.aztec.network)`
- Ознайомитись з Noir syntax: https://noir-lang.org/docs
- Пройти Aztec tutorial: https://docs.aztec.network/tutorials
- Вивчити приклади ZK circuits

**Day 3-4: Noir Circuit Development**
```
Мета: Довести що contribution валідна без reveal contributor address

Inputs (private):
- contributor_address: Field
- contribution_amount: Field
- vault_address: Field

Inputs (public):
- vault_total: Field
- merkle_root: Field

Circuit логіка:
1. Verify contribution_amount > 0
2. Verify contributor має sufficient balance (off-chain check)
3. Generate nullifier hash(contributor_address, vault_address)
4. Compute new vault_total
5. Verify merkle proof для anonymity set
```

**Day 5: Smart Contract Integration**
```solidity
contract PrivateContribution {
    function verifyAndContribute(
        bytes calldata proof,
        uint256 vaultTotal,
        bytes32 nullifier
    ) external {
        // Verify ZK proof
        require(verifier.verify(proof), "Invalid proof");

        // Check nullifier not used (no double contributions)
        require(!usedNullifiers[nullifier], "Already contributed");

        // Update vault
        vault.contribute(msg.sender, hiddenAmount);
        usedNullifiers[nullifier] = true;
    }
}
```

**Day 6-7: Frontend Integration & Testing**
- Generate proof client-side (noir.js або wasm)
- Submit proof + public inputs до contract
- UI toggle: "Make contribution private"
- Manual testing з 2-3 test cases

**Resources:**
- Aztec Docs: https://docs.aztec.network
- Noir Lang: https://noir-lang.org
- Aztec Discord для питань
- Example circuits: https://github.com/AztecProtocol/aztec-packages/tree/master/noir-projects

**Fallback Plan:**
Якщо Aztec integration занадто складна за тиждень:
- Використати простий commitment scheme (hash-based)
- Contributor commits hash(address, amount, secret)
- Reveals secret при withdrawal
- Не повний ZK, але proof of concept для privacy

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
