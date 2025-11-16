# 🚀 Deploy Banka Contracts to Base Sepolia

## Передумови

### 1. Отримай Base Sepolia ETH
- Іди на https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- Або https://www.alchemy.com/faucets/base-sepolia
- Введи свій wallet address
- Отримай ~0.1 ETH (безкоштовно)

### 2. Отримай свій Private Key

**⚠️ ВАЖЛИВО: Використовуй тестовий wallet, НЕ основний!**

```bash
# Від Metamask:
# Settings → Security & Privacy → Show Private Key
# Скопіюй (починається з 0x)

# Або створи новий wallet через cast:
cast wallet new
# Збережи mnemonic і private key
```

### 3. (Опціонально) Basescan API Key
- Іди на https://basescan.org/myapikey
- Зареєструйся
- Create New API Key
- Скопіюй ключ

---

## Крок 1: Налаштуй .env

```bash
cd contracts

# Створи .env файл
cat > .env << 'EOF'
PRIVATE_KEY=ТУТ_ТВІЙ_PRIVATE_KEY_БЕЗ_0x
BASE_SEPOLIA_RPC=https://sepolia.base.org
BASESCAN_API_KEY=твій_api_key_якщо_є
EOF

# Перевір що файл створено
cat .env
```

**⚠️ НЕ комітити .env в git!** (вже в .gitignore)

---

## Крок 2: Перевір баланс

```bash
# Перевір що є ETH на wallet
cast balance YOUR_WALLET_ADDRESS --rpc-url https://sepolia.base.org

# Має бути > 0.001 ETH
```

---

## Крок 3: Тестовий deploy (dry run)

```bash
# Спершу спробуємо без --broadcast
forge script script/Deploy.s.sol \
  --rpc-url https://sepolia.base.org \
  -vvv
```

Якщо все ОК → побачиш:
```
[⠢] Compiling...
[⠆] Compiling 2 files with Solc 0.8.24
[⠰] Solc 0.8.24 finished in 1.23s
Compiler run successful!

== Logs ==
Deploying Banka to Base Sepolia
Chain ID: 84532
Deployer: 0xYOUR_ADDRESS
```

---

## Крок 4: Реальний deploy

```bash
# Deploy З broadcast (реальна транзакція)
forge script script/Deploy.s.sol \
  --rpc-url https://sepolia.base.org \
  --broadcast \
  --verify \
  -vvv
```

### Що станеться:
1. ✅ Deploy VaultImplementation
2. ✅ Deploy VaultFactory
3. ✅ Verify contracts на Basescan
4. ✅ Показує адреси

### Output:
```
== Logs ==
===========================================
Deploying Banka to Base Sepolia
Chain ID: 84532
Deployer: 0xYourAddress
===========================================
Vault Implementation: 0x1234...
VaultFactory: 0x5678...
===========================================
Deployment Complete!
===========================================

Contract Addresses:
  VaultFactory: 0x5678...
  Vault Implementation: 0x1234...

Configuration:
  Aave Pool: 0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b
  USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
```

**📝 ЗБЕРЕЖИ ЦІ АДРЕСИ!**

---

## Крок 5: Верифікуй на Basescan

Якщо `--verify` не спрацював:

```bash
# Manual verify VaultFactory
forge verify-contract \
  FACTORY_ADDRESS \
  src/VaultFactory.sol:VaultFactory \
  --rpc-url https://sepolia.base.org \
  --etherscan-api-key $BASESCAN_API_KEY \
  --constructor-args $(cast abi-encode "constructor(address,address,address)" IMPL_ADDRESS AAVE_POOL USDC_ADDRESS)

# Manual verify Vault
forge verify-contract \
  VAULT_IMPL_ADDRESS \
  src/Vault.sol:Vault \
  --rpc-url https://sepolia.base.org \
  --etherscan-api-key $BASESCAN_API_KEY
```

---

## Крок 6: Перевір на Basescan

Відкрий:
```
https://sepolia.basescan.org/address/YOUR_FACTORY_ADDRESS
```

Має бути:
- ✅ Contract verified ✓
- ✅ Source code readable
- ✅ Read/Write contract buttons

---

## Крок 7: Тест - створи vault

```bash
# Через cast
cast send YOUR_FACTORY_ADDRESS \
  "createVault(uint256,uint256,string)" \
  1000000000 \
  $(($(date +%s) + 2592000)) \
  "db://test_vault" \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY

# Дістань адресу vault з events
cast logs \
  --address YOUR_FACTORY_ADDRESS \
  --rpc-url https://sepolia.base.org \
  | grep VaultCreated
```

---

## Крок 8: Оновити конфігурацію

### Backend
```bash
cd ../backend
nano .env

# Додай:
FACTORY_ADDRESS=0xYOUR_FACTORY_ADDRESS
```

### Frontend
```bash
cd ../frontend
nano .env.local

# Додай:
NEXT_PUBLIC_FACTORY_ADDRESS=0xYOUR_FACTORY_ADDRESS
```

Перезапусти сервери!

---

## 🎯 Success Checklist

- [ ] Base Sepolia ETH отримано
- [ ] Private key налаштовано в .env
- [ ] Contracts задеплоєні
- [ ] Verified на Basescan
- [ ] Factory address збережено
- [ ] Backend .env оновлено
- [ ] Frontend .env.local оновлено
- [ ] Тестовий vault створено

---

## ⚠️ Troubleshooting

### "insufficient funds for gas"
→ Отримай більше ETH з faucet

### "nonce too low"
→ Почекай 1 хвилину, спробуй ще раз

### "verifier service is down"
→ Verify вручну пізніше через Basescan UI

### "invalid signature"
→ Перевір що PRIVATE_KEY правильний (БЕЗ 0x префіксу в .env)

---

## 📊 Gas Costs (приблизно)

- Deploy Vault Implementation: ~0.0015 ETH
- Deploy Factory: ~0.001 ETH
- Create Vault: ~0.0003 ETH
- **Total: ~0.003 ETH**

---

## 🔗 Корисні посилання

- Base Sepolia Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- Basescan Sepolia: https://sepolia.basescan.org
- Base Docs: https://docs.base.org
- Foundry Book: https://book.getfoundry.sh

---

## ✅ Ready!

Після deploy:
1. Оновлюй env файли
2. Перезапускай backend/frontend
3. Створюй перший vault
4. Share Frame на Farcaster!

**Let's deploy! 🚀**
