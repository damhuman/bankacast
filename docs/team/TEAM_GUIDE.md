# Banka Team Guide - Web3 Technologies Explained

**Мета:** Допомогти команді розібратися в технологіях, які використовуються в Banka, навіть якщо ви не маєте досвіду з Web3.

---

## Table of Contents
1. [Blockchain Basics](#blockchain-basics)
2. [Base Network](#base-network)
3. [Smart Contracts](#smart-contracts)
4. [DeFi & Aave](#defi--aave)
5. [Farcaster & Frames](#farcaster--frames)
6. [Zero-Knowledge Proofs](#zero-knowledge-proofs)
7. [Tools We Use](#tools-we-use)
8. [Glossary](#glossary)
9. [Learning Resources](#learning-resources)

---

## Blockchain Basics

### Що таке blockchain?
**Проста аналогія:** Уяви Google Sheets, де всі можуть бачити історію змін, але ніхто не може видалити чи змінити минулі записи. Це публічна база даних, яка постійно додає нові записи (блоки), і всі записи пов'язані в ланцюг (chain).

**Ключові особливості:**
- **Decentralized:** Немає центрального сервера, дані зберігаються на тисячах комп'ютерів
- **Transparent:** Всі транзакції публічні та можна перевірити
- **Immutable:** Неможливо змінити минулі записи
- **Trustless:** Не потрібно довіряти третій стороні (банку, PayPal)

### Що таке cryptocurrency?
Цифрові гроші, які працюють на blockchain. Приклади:
- **Bitcoin (BTC):** Перша криптовалюта
- **Ethereum (ETH):** Платформа для smart contracts
- **USDC:** Stablecoin (1 USDC = 1 USD завжди)

### Що таке wallet (гаманець)?
**Аналогія:** Як email address + пароль для криптовалют.
- **Address:** Публічний адрес (як 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb)
- **Private key:** Секретний ключ (як пароль, НІКОЛИ не ділись!)
- **Metamask:** Популярний браузерний wallet (як розширення Chrome)

**Важливо:** Якщо втратиш private key, гроші втрачені назавжди. Немає кнопки "забув пароль".

---

## Base Network

### Що таке Base?
**Проста відповідь:** Швидша і дешевша версія Ethereum, створена компанією Coinbase.

**Чому Base, а не Ethereum?**
- Ethereum: транзакція коштує $5-50 (дорого!)
- Base: транзакція коштує $0.01-0.10 (дешево!)
- Base повністю сумісний з Ethereum (той самий код працює)

**Для команди:**
- **Антон:** Код пишеш той самий, що для Ethereum
- **Андрій:** Testnet називається "Base Sepolia"
- **Каріна:** Base - це бренд Coinbase, great для partnerships

**Ресурси:**
- Website: https://base.org
- Explorer: https://sepolia.basescan.org (дивитись транзакції)
- Docs: https://docs.base.org

---

## Smart Contracts

### Що таке smart contract?
**Аналогія:** Як vending machine (автомат з снеками).
- Вставляєш $1 → автоматично отримуєш снек
- Вносиш 10 USDC → автоматично contributions додаються до vault

**Замість людини/компанії, код виконує правила автоматично.**

### Мова програмування: Solidity
```solidity
// Приклад простого контракту
contract Vault {
    uint256 public goal;           // Ціль збору
    uint256 public totalRaised;    // Скільки зібрано

    function contribute(uint256 amount) public {
        totalRaised += amount;      // Додати contribution
        if (totalRaised >= goal) {
            // Ціль досягнута!
        }
    }
}
```

**Для команди:**
- **Антон:** Використовуємо Foundry framework для розробки
- **Андрій:** Після deploy, контракт не можна змінити (immutable), треба ретельно тестувати
- **Каріна:** Smart contracts = trust, код публічний, всі можуть перевірити

### Наші контракти
1. **Vault.sol** - Індивідуальне сховище для грошей
2. **VaultFactory.sol** - Фабрика для створення нових vaults (як копіювання templates)
3. **PrivateContribution.sol** - Контракт для приватних contributions з ZK

---

## DeFi & Aave

### Що таке DeFi?
**Decentralized Finance** = Фінансові послуги без банків.

**Traditional Finance:**
- Покладеш $1000 в банк → банк дає 0.5% річних
- Банк використовує твої гроші для кредитів, заробляє 10%, тобі дає 0.5%

**DeFi (Aave):**
- Покладеш $1000 в Aave → отримуєш 3-5% річних
- Прямо взаємодієш зі smart contract, без посередників

### Що таке Aave?
Найбільший DeFi протокол для lending/borrowing.

**Як працює:**
1. Люди депозитують USDC в Aave
2. Інші люди беруть кредити, платять відсотки
3. Відсотки розподіляються між депозиторами

**Для Banka:**
- Коли хтось робить contribution → гроші автоматично йдуть в Aave
- Гроші генерують yield (відсотки) поки vault активний
- При withdraw creator отримує основну суму + згенеровані відсотки

**Приклад:**
```
Vault goal: $1000
Contributions: $800 (за 2 тижні)
Aave APY: 5%

Після 2 тижнів:
$800 + ($800 × 5% × 2/52) = $801.54
Creator отримує $801.54 замість $800 🎉
```

**Ресурси:**
- Aave Website: https://aave.com
- Aave Docs: https://docs.aave.com
- APY tracker: https://app.aave.com

---

## Farcaster & Frames

### Що таке Farcaster?
**Проста відповідь:** Децентралізований Twitter, створений ex-Coinbase інженером.

**Відмінності від Twitter:**
- Твої пости зберігаються на blockchain, не на серверах Twitter
- Ніхто не може тебе забанити чи видалити пости
- Ти володієш своїми даними

**Клієнт:** Warpcast (мобільний app для Farcaster, як Twitter app)

### Що таке Farcaster Frames?
**Революційна штука:** Інтерактивні пости з кнопками та діями.

**Звичайний пост в Twitter:**
- Текст + картинка
- Можеш like, retweet, comment

**Frame в Farcaster:**
- Текст + картинка + **інтерактивні кнопки**
- Можеш зробити contribution, mint NFT, купити щось - прямо в feed!

**Приклад Frame для Banka:**
```
[Картинка з progress bar: 70% досягнуто]
"Допоможи Олегу зібрати на день народження! 🎂"
$350 / $500

[Кнопка: Contribute $10] [Кнопка: Contribute $25]
```

**Натискаєш кнопку → wallet відкривається → contribution зроблено → frame оновлюється**

Все БЕЗ виходу з Farcaster app!

**Для команди:**
- **Антон:** Frame = спеціальні HTML meta tags + API endpoint для кнопок
- **Андрій:** Тестувати через Warpcast app чи frame validator
- **Каріна:** Frame = viral potential, легко шарити в feed

**Ресурси:**
- Farcaster: https://www.farcaster.xyz
- Frame docs: https://docs.farcaster.xyz/reference/frames/spec
- Frame validator: https://warpcast.com/~/developers/frames

---

## Zero-Knowledge Proofs

### Що таке Zero-Knowledge (ZK)?
**Найпростіша аналогія:** Як довести що знаєш пароль, не говорячи пароль.

**Real-world приклад:**
Ти хочеш довести що маєш більше $1000 на рахунку, але не хочеш показувати точну суму.

**Традиційний спосіб:**
- Показуєш bank statement → всі бачать $5,234.56

**Zero-Knowledge спосіб:**
- Генеруєш математичний proof "balance > $1000" = TRUE
- Інші можуть verify proof, але НЕ бачать точну суму

### Навіщо ZK для Banka?

**Проблема blockchain:**
Всі транзакції публічні. Якщо вносиш $100 в vault, всі бачать:
- Твій wallet address
- Точну суму $100
- В який vault вніс

**Privacy проблеми:**
- Не хочеш щоб всі знали скільки ти вносиш
- Employer може discriminate якщо бачить що вносиш в charity
- Конкуренти можуть track твої фінансові рухи

**Рішення: ZK Proofs**
- Генеруєш proof "Я вніс валідну суму в vault" = TRUE
- Vault отримує contribution, але НІХТО не знає:
  - Хто саме вніс
  - Скільки саме вніс
- Прозорість (vault total видно) + Privacy (деталі приховані)

### Aztec & Noir

**Aztec** = Blockchain для privacy (як Ethereum, але все приватне)

**Noir** = Мова програмування для ZK circuits (як Solidity, але для доказів)

**Як працює для Banka:**
1. User хоче зробити private contribution $50
2. Frontend генерує ZK proof (через Noir circuit):
   - "Я маю $50 USDC" ✓
   - "Я вношу в vault X" ✓
   - "Мій nullifier унікальний" ✓
3. Proof відправляється on-chain (НЕ сума, НЕ address!)
4. Smart contract verify proof → contribution прийнято
5. Vault total оновлюється, але contributor залишається анонімний

**Noir Code приклад:**
```rust
// Простий circuit для private contribution
fn main(
    contributor_address: Field,    // Private input
    amount: Field,                 // Private input
    vault_total: pub Field        // Public input
) {
    // Verify amount > 0
    assert(amount > 0);

    // Generate nullifier
    let nullifier = std::hash::pedersen([contributor_address, vault_id]);

    // Prove new total
    let new_total = vault_total + amount;
}
```

**Для команди:**
- **Антон:** Week 3 = setup Aztec Sandbox, написати базовий Noir circuit
- **Андрій:** Testing proof generation time (мета: <10 секунд)
- **Каріна:** ZK = major differentiator, ніхто інший не має privacy для crowdfunding

**Важливо:** Week 3 = proof of concept, НЕ production ready. Просто показати що працює.

**Ресурси:**
- Aztec: https://aztec.network
- Noir: https://noir-lang.org
- Aztec Docs: https://docs.aztec.network
- Noir Examples: https://github.com/noir-lang/noir-examples

---

## Tools We Use

### Development Tools

**1. Foundry (Smart Contracts)**
- Швидкий framework для Solidity
- Compile, test, deploy contracts
- Commands: `forge build`, `forge test`, `forge script`
- Website: https://book.getfoundry.sh

**2. Next.js (Frontend)**
- React framework для веб-додатків
- Server-side rendering
- API routes для Farcaster Frames
- Website: https://nextjs.org

**3. FastAPI (Backend)**
- Python framework для API
- Швидкий та простий
- Автоматична OpenAPI docs
- Website: https://fastapi.tiangolo.com

**4. PostgreSQL (Database)**
- Реляційна база даних
- Зберігаємо історію vaults та contributions
- Website: https://www.postgresql.org

**5. Privy (Wallet Auth)**
- Простий wallet connection для users
- Підтримує Metamask, WalletConnect, etc
- Website: https://www.privy.io

### Deployment Tools

**6. Vercel (Frontend Hosting)**
- Автоматичний deploy з GitHub
- Free tier для MVP
- Website: https://vercel.com

**7. Railway (Backend Hosting)**
- Easy PostgreSQL + API hosting
- $5/month для MVP
- Website: https://railway.app

**8. Aztec Sandbox (ZK Development)**
- Local environment для Aztec/Noir
- Install: `bash -i <(curl -s install.aztec.network)`

### Project Management

**9. Linear / Notion**
- Task tracking
- Sprint planning
- Bug tracking

**10. GitHub**
- Code repository
- CI/CD automation
- Version control

### Testing & Monitoring

**11. Sentry**
- Error tracking
- Performance monitoring
- Free tier для MVP

**12. Metamask**
- Browser wallet для testing
- Download: https://metamask.io

**13. Faucets (Testnet Tokens)**
- Base Sepolia faucet: https://www.alchemy.com/faucets/base-sepolia
- USDC testnet tokens: https://faucet.circle.com

---

## Glossary

### Базові терміни

**Address** - Публічна адреса wallet (0x742d35...)

**Gas** - Комісія за транзакцію на blockchain ($0.01 на Base)

**Wei / Gwei** - Маленькі одиниці ETH (як копійки для гривні)

**Testnet** - Тестова мережа для розробки (безкоштовні тестові токени)

**Mainnet** - Головна мережа з реальними грошима

**Block** - Група транзакцій на blockchain

**Transaction (tx)** - Будь-яка дія на blockchain

**Hash** - Унікальний ID для транзакції (0xabc123...)

### Smart Contract терміни

**Deploy** - Опублікувати контракт на blockchain

**ABI** - Application Binary Interface, як "інструкція" для взаємодії з контрактом

**Event** - Лог з контракту (VaultCreated, Contributed)

**Function** - Метод в контракті (contribute(), withdraw())

**State** - Дані збережені в контракті (goal, totalRaised)

**Modifier** - Умова для функції (onlyOwner, nonReentrant)

### DeFi терміни

**APY** - Annual Percentage Yield, річний відсоток

**Liquidity** - Скільки грошей доступно в протоколі

**Pool** - Колекція токенів для lending/borrowing

**Collateral** - Застава для кредиту

**Yield** - Прибуток від інвестицій

**TVL** - Total Value Locked, скільки грошей в протоколі

### ZK терміни

**Proof** - Математичний доказ правдивості statement

**Prover** - Хто генерує proof (user)

**Verifier** - Хто перевіряє proof (smart contract)

**Circuit** - Програма для генерації proof (написана в Noir)

**Witness** - Private inputs для proof

**Public Input** - Публічні дані в proof

**Nullifier** - Унікальний ID для запобігання повторного використання

**Commitment** - Hash приватних даних

---

## Learning Resources

### Для всіх (Beginner)

**Blockchain Basics:**
- [Blockchain Demo](https://andersbrownworth.com/blockchain/) - Інтерактивна візуалізація
- [Whiteboard Crypto](https://www.youtube.com/@WhiteboardCrypto) - YouTube канал з простими поясненнями
- [Crypto.com University](https://crypto.com/university) - Базові концепти

**DeFi:**
- [Finematics](https://www.youtube.com/@Finematics) - DeFi пояснення
- [DeFi Explained](https://www.coindesk.com/learn/what-is-defi/) - Coindesk guide

### Для Антона (Developer)

**Smart Contracts:**
- [Solidity by Example](https://solidity-by-example.org) - Код примери
- [Foundry Book](https://book.getfoundry.sh) - Повний гайд
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts) - Безпечні контракти

**Aztec/Noir:**
- [Noir Docs](https://noir-lang.org/docs) - Офіційна документація
- [Aztec Tutorials](https://docs.aztec.network/tutorials) - Покрокові гайди
- [Noir Examples](https://github.com/noir-lang/noir-examples) - Приклади circuits

**Base:**
- [Base Docs](https://docs.base.org) - Deployment гайди
- [Base Builder Resources](https://base.org/builder) - Tools та ресурси

### Для Андрія (QA/Ops)

**Testing:**
- [Foundry Testing](https://book.getfoundry.sh/forge/tests) - Smart contract tests
- [Web3 Testing Guide](https://ethereum.org/en/developers/docs/development-networks/) - Testnet usage

**Deployment:**
- [Vercel Docs](https://vercel.com/docs) - Frontend deployment
- [Railway Docs](https://docs.railway.app) - Backend deployment

**Monitoring:**
- [Basescan](https://sepolia.basescan.org) - Block explorer
- [Tenderly](https://tenderly.co) - Smart contract monitoring

### Для Каріни (Marketing)

**Farcaster:**
- [Farcaster Docs](https://docs.farcaster.xyz) - Що таке Farcaster
- [Warpcast](https://warpcast.com) - Download app
- [Frame Examples](https://www.warpcast.com/~/developers/frames) - Приклади Frames

**Web3 Marketing:**
- [Web3 Marketing Guide](https://a16zcrypto.com/posts/article/web3-marketing-guide/) - a16z гайд
- [Crypto Twitter Best Practices](https://www.coindesk.com/learn/crypto-twitter-101/) - Як будувати audience

**Privacy & ZK:**
- [Why Privacy Matters](https://aztec.network/blog) - Aztec blog про privacy
- [ZK Explained Simply](https://www.youtube.com/watch?v=fOGdb1CTu5c) - 5-min відео

---

## Frequently Asked Questions

### Для всіх

**Q: Чи потрібно знати криптографію для роботи над проектом?**
A: Ні! Бібліотеки вже зробили складну математику. Потрібно розуміти концепти, не деталі.

**Q: Скільки коштує транзакція на Base?**
A: ~$0.01-0.05 (1-5 центів). Testnet - безкоштовно.

**Q: Як отримати testnet токени?**
A: Використовуй faucets (посилання вище). Якщо не працює, питай в команді.

**Q: Що якщо зламають wallet?**
A: Для testnet - не проблема, це тестові токени. Для mainnet - НЕ ділись private key!

### Для Антона

**Q: Чи можна змінити deployed контракт?**
A: Ні, immutable. Можна deploy новий або використати upgradeable pattern (складніше).

**Q: Скільки часу генерація ZK proof?**
A: Залежить від circuit складності. Мета: <10 секунд для нашого proof.

**Q: Як тестувати ZK circuits локально?**
A: Aztec Sandbox + `nargo test` для Noir circuits.

### Для Андрія

**Q: Як перевірити чи транзакція успішна?**
A: Basescan → вставити tx hash → Status: Success / Failed

**Q: Скільки часу чекати transaction confirmation?**
A: Base: ~2 секунди (дуже швидко!)

**Q: Як тестувати Frames?**
A: Frame validator tool або безпосередньо в Warpcast app.

### Для Каріни

**Q: Як пояснити ZK звичайним людям?**
A: "Довести що щось правда, не розкриваючи деталів. Як показати ID що тобі 18+, не показуючи дату народження."

**Q: Який angle для marketing?**
A: Privacy + Social + DeFi yields = унікальна комбінація. Фокус на use cases (gifts, charity).

**Q: Де шукати early users?**
A: Farcaster channels про Base, Aave, privacy. Aztec Discord.

---

## Quick Start Checklist

### Перший день в команді

**Для всіх:**
- [ ] Встановити Metamask wallet
- [ ] Отримати testnet ETH та USDC
- [ ] Додати Base Sepolia network в Metamask
- [ ] Join Discord: Base, Farcaster, Aztec
- [ ] Setup task management tool (Linear/Notion)

**Для Антона:**
- [ ] Install Foundry: `curl -L https://foundry.paradigm.xyz | bash`
- [ ] Install Node.js v18+
- [ ] Install Aztec Sandbox
- [ ] Clone repo та setup local environment
- [ ] Deploy тестовий контракт на Sepolia

**Для Андрія:**
- [ ] Отримати 5 testnet wallets
- [ ] Setup testnet USDC distribution
- [ ] Знайомство з Basescan explorer
- [ ] Знайомство з Frame validator

**Для Каріни:**
- [ ] Download Warpcast app
- [ ] Створити Farcaster account
- [ ] Follow Base та Aztec accounts
- [ ] Join relevant channels
- [ ] Створити draft competitive analysis

---

## Support & Questions

**Якщо застряг:**
1. Google → часто є відповіді
2. Питай в команді
3. Discord communities (Base, Aztec, Farcaster)
4. ChatGPT для швидких пояснень
5. Stack Exchange (Ethereum, Cryptography)

**Корисні Discord servers:**
- Base: https://discord.gg/buildonbase
- Aztec: https://discord.gg/aztec
- Farcaster: https://discord.gg/farcaster

**Час відповіді:**
- Команда: <1 година (work hours)
- Discord communities: <24 години
- GitHub issues: залежить від пріоритету

---

## Next Steps

**Після прочитання гайду:**

1. **Всі:** Пройти 1-2 відео з YouTube про blockchain basics
2. **Антон:** Deployнути hello world контракт на Base Sepolia
3. **Андрій:** Зробити першу тестову транзакцію на testnet
4. **Каріна:** Створити перший post в Farcaster

**Вопроси для обговорення на зустрічі:**
- Які частини unclear?
- Які додаткові ресурси потрібні?
- На що потрібен більше часу для learning?

---

**Last Updated:** Week 0 - Pre-Sprint
**Maintainer:** Product Owner (додавай updates по мірі learning команди)
