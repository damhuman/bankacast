# 🚀 Як запустити Banka - Покрокова інструкція

## Передумови

Перевір що у тебе встановлено:

```bash
# Node.js (v18+)
node --version

# Python (v3.10+)
python3 --version

# PostgreSQL (v15+)
psql --version

# Foundry (для smart contracts)
forge --version
```

Якщо чогось немає - встанови:
- **Node.js**: https://nodejs.org/
- **Python**: https://www.python.org/downloads/
- **PostgreSQL**: `brew install postgresql` (macOS)
- **Foundry**: `curl -L https://foundry.paradigm.xyz | bash && foundryup`

---

## Крок 1: База даних (PostgreSQL)

### Варіант А: Локальний PostgreSQL

```bash
# Запусти PostgreSQL
brew services start postgresql  # macOS
# або sudo systemctl start postgresql  # Linux

# Створи базу даних
createdb banka

# Перевір що працює
psql -d banka -c "SELECT 1"
```

### Варіант Б: Docker (простіше)

```bash
docker run --name banka-postgres \
  -e POSTGRES_PASSWORD=banka \
  -e POSTGRES_USER=banka \
  -e POSTGRES_DB=banka \
  -p 5432:5432 \
  -d postgres:15

# Перевір що працює
docker ps | grep banka-postgres
```

---

## Крок 2: Backend (FastAPI)

```bash
cd backend

# 1. Створи віртуальне середовище
python3 -m venv venv

# 2. Активуй його
source venv/bin/activate  # macOS/Linux
# або venv\Scripts\activate  # Windows

# 3. Встанови залежності
pip install -r requirements.txt

# 4. Налаштуй environment
cp .env.example .env

# 5. Відредагуй .env
# Відкрий .env і встав:
# DATABASE_URL=postgresql://banka:banka@localhost:5432/banka
# BASE_RPC_URL=https://sepolia.base.org
# FACTORY_ADDRESS=0x...  # Поки залиш порожнім, заповниш після deploy

# 6. Запусти API сервер
python main.py
```

✅ Backend має бути доступний на **http://localhost:8000**

Перевір: відкрий http://localhost:8000/docs (Swagger UI)

---

## Крок 3: Smart Contracts (деплой на testnet)

**Відкрий НОВИЙ термінал** (backend має працювати в попередньому)

```bash
cd contracts

# 1. Перевір що все компілюється
forge build

# 2. Налаштуй .env
cp .env.example .env

# 3. Відредагуй .env
# Відкрий .env і додай:
# PRIVATE_KEY=твій_приватний_ключ  # БЕЗ 0x префіксу!
# BASE_SEPOLIA_RPC=https://sepolia.base.org
# BASESCAN_API_KEY=твій_ключ  # Не обов'язково для деплою

# 4. Отримай testnet ETH
# Іди на https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
# Отримай Base Sepolia ETH на свій wallet

# 5. Deploy contracts на Base Sepolia
forge script script/Deploy.s.sol \
  --rpc-url https://sepolia.base.org \
  --broadcast \
  --verify

# 6. Скопіюй адресу VaultFactory з виводу
# Буде щось типу:
# VaultFactory: 0x1234567890abcdef...

# 7. Додай цю адресу в backend/.env
# FACTORY_ADDRESS=0x1234567890abcdef...
```

✅ Контракти задеплоєні на Base Sepolia testnet!

---

## Крок 4: Event Listener (індексація blockchain)

**Відкрий ще ОДИН новий термінал**

```bash
cd backend

# Активуй venv якщо ще не активовано
source venv/bin/activate

# Запусти event listener
python event_listener.py
```

✅ Event listener слухає blockchain і оновлює базу даних

---

## Крок 5: Frontend (Next.js)

**Відкрий ще ОДИН новий термінал**

```bash
cd frontend

# 1. Встанови залежності
npm install

# 2. Налаштуй environment
cp .env.local.example .env.local

# 3. Відредагуй .env.local
# NEXT_PUBLIC_PRIVY_APP_ID=твій_privy_app_id  # Отримай на privy.io
# NEXT_PUBLIC_FACTORY_ADDRESS=0x...  # З Крок 3
# NEXT_PUBLIC_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
# NEXT_PUBLIC_CHAIN_ID=84532
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_APP_URL=http://localhost:3000

# 4. Запусти dev server
npm run dev
```

✅ Frontend доступний на **http://localhost:3000**

---

## Крок 6: Отримай Privy App ID (для wallet)

1. Іди на https://privy.io
2. Зареєструйся / увійди
3. Create New App
4. Назви його "Banka"
5. Скопіюй App ID
6. Додай в `frontend/.env.local`:
   ```
   NEXT_PUBLIC_PRIVY_APP_ID=clxxxxxxxxxxxxx
   ```
7. Перезапусти frontend (`Ctrl+C` → `npm run dev`)

---

## 🎯 Фінальна перевірка

Тепер у тебе має працювати:

### ✅ 4 запущених процеси:

1. **PostgreSQL** - База даних (порт 5432)
2. **Backend API** - http://localhost:8000
3. **Event Listener** - Індексує blockchain
4. **Frontend** - http://localhost:3000

### ✅ Перевір що все працює:

```bash
# Terminal 1 - Backend працює
curl http://localhost:8000/api/health

# Terminal 2 - Contracts задеплоєні
# Відкрий https://sepolia.basescan.org/address/[FACTORY_ADDRESS]

# Terminal 3 - Event listener працює
# Має бути вивід: "Listening for VaultCreated events..."

# Terminal 4 - Frontend працює
# Відкрий http://localhost:3000
```

---

## 🧪 Тестування: Створи перший vault

### 1. Отримай testnet USDC

```bash
# Base Sepolia USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
# Іди на https://staging.aave.com/ (Base Sepolia)
# Або використай Aave faucet
```

### 2. Створи vault через Foundry (швидко)

```bash
cd contracts

# Створи vault через factory
cast send $FACTORY_ADDRESS \
  "createVault(uint256,uint256,string)" \
  1000000000 \  # 1000 USDC (6 decimals)
  $(($(date +%s) + 2592000)) \  # +30 days
  "db://emergency_fund" \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY
```

### 3. Або через Frontend

1. Відкрий http://localhost:3000
2. Натисни "Create Vault"
3. Підключи wallet через Privy
4. Заповни форму (title, goal, deadline)
5. Підпиши транзакцію

### 4. Перевір що vault з'явився

```bash
# В API
curl http://localhost:8000/api/vaults

# В event listener терміналі має з'явитись:
# ✅ Indexed new vault: 0x... by 0x...
```

---

## 📋 Швидкий старт (команди одним блоком)

```bash
# Terminal 1: Database
docker run --name banka-postgres -e POSTGRES_PASSWORD=banka -e POSTGRES_USER=banka -e POSTGRES_DB=banka -p 5432:5432 -d postgres:15

# Terminal 2: Backend
cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python main.py

# Terminal 3: Event Listener
cd backend && source venv/bin/activate && python event_listener.py

# Terminal 4: Frontend
cd frontend && npm install && npm run dev

# Terminal 5: Deploy Contracts (після налаштування .env)
cd contracts && forge script script/Deploy.s.sol --rpc-url https://sepolia.base.org --broadcast
```

---

## ❌ Типові проблеми

### Database connection failed
```bash
# Перевір що PostgreSQL працює
brew services list | grep postgresql
# або
docker ps | grep banka-postgres
```

### Module not found (Python)
```bash
# Переконайся що venv активовано
which python  # Має бути в папці venv/
source venv/bin/activate
pip install -r requirements.txt
```

### Compilation failed (Foundry)
```bash
cd contracts
forge clean
forge build --force
```

### Frontend не запускається
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 🎉 Готово!

Тепер у тебе запущений повний Banka stack:
- ✅ Smart contracts на Base Sepolia
- ✅ Backend API працює
- ✅ Event listener індексує дані
- ✅ Frontend доступний

**Наступні кроки:**
1. Створи перший vault
2. Поділись посиланням з друзями (testnet)
3. Протестуй contribution flow
4. Перевір що yield генерується в Aave

**Потрібна допомога?** Пиши питання!
