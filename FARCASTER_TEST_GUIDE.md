# 🎭 Як протестити Banka Frame на Farcaster

## Проблема

Farcaster Frames **не працюють з localhost** - потрібен публічний URL (https).

---

## Варіанти тестування

### Варіант 1: Швидкий тест з ngrok (5 хвилин) ⚡

**Найпростіший спосіб для тестування:**

1. **Встанови ngrok:**
```bash
brew install ngrok
# або
npm install -g ngrok
```

2. **Запусти ngrok для frontend:**
```bash
ngrok http 3001
```

Побачиш щось таке:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3001
```

3. **Оновi .env.local з ngrok URL:**
```bash
cd frontend
nano .env.local

# Зміни:
NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io  # твій ngrok URL
NEXT_PUBLIC_API_URL=http://localhost:8001    # backend залишається localhost (backend не потрібен для Frame)
```

4. **Перезапусти frontend** (Ctrl+C і знову `npm run dev`)

5. **Створи vault через command line:**
```bash
cd ../contracts
source .env

cast send 0x7bfCef0D22c358F16A70fb1C93E01978De503a56 \
  "createVault(uint256,uint256,string)" \
  1000000000 \
  $(($(date +%s) + 2592000)) \
  "My First Test Vault" \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY
```

6. **Дістань vault address з transaction:**
```bash
# Або подивись на Basescan:
open "https://sepolia.basescan.org/address/0x7bfCef0D22c358F16A70fb1C93E01978De503a56"
# Шукай Events -> VaultCreated
```

7. **Протестуй Frame:**
```
Frame URL: https://abc123.ngrok.io/api/frame?vault=YOUR_VAULT_ADDRESS
```

8. **Share на Warpcast:**
   - Іди на https://warpcast.com
   - Створи новий cast
   - Вставити Frame URL
   - Warpcast автоматично покаже Frame preview!

**⚠️ ngrok обмеження:**
- Безкоштовна версія: URL змінюється кожен раз
- Сесія закривається через 2 години
- Для постійного тестування потрібен платний ngrok або справжній deployment

---

### Варіант 2: Deploy на Vercel (10 хвилин) 🚀

**Для production-ready тестування:**

1. **Встанови Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login до Vercel:**
```bash
vercel login
```

3. **Deploy frontend:**
```bash
cd frontend
vercel

# Перший раз вибери:
# - Set up and deploy? Y
# - Which scope? (твій account)
# - Link to existing project? N
# - Project name: banka
# - Directory: ./
# - Override settings? N
```

Vercel дасть URL типу: `https://banka-xyz.vercel.app`

4. **Онови env variables на Vercel:**
```bash
vercel env add NEXT_PUBLIC_APP_URL
# Введи: https://banka-xyz.vercel.app

vercel env add NEXT_PUBLIC_FACTORY_ADDRESS
# Введи: 0x7bfCef0D22c358F16A70fb1C93E01978De503a56

vercel env add NEXT_PUBLIC_USDC_ADDRESS
# Введи: 0x036CbD53842c5426634e7929541eC2318f3dCF7e

vercel env add NEXT_PUBLIC_CHAIN_ID
# Введи: 84532

vercel env add NEXT_PUBLIC_RPC_URL
# Введi: https://sepolia.base.org

vercel env add NEXT_PUBLIC_API_URL
# Введи: http://localhost:8001 (або deploy backend теж)
```

5. **Redeploy з новими env:**
```bash
vercel --prod
```

6. **Створи vault** (той самий команд як у Варіант 1)

7. **Test Frame:**
```
https://banka-xyz.vercel.app/api/frame?vault=YOUR_VAULT_ADDRESS
```

---

### Варіант 3: Тільки Frontend Frame (БЕЗ backend) ⚡⚡

**Найшвидший спосіб - Frame може працювати без backend!**

Frame показує статичну картинку і кнопки. Для повного тесту:

1. **Використай ngrok** (Варіант 1)

2. **Створи mock vault address:**
```
https://your-ngrok.ngrok.io/api/frame?vault=0x1234567890123456789012345678901234567890
```

3. **Frame покаже "Vault not found"** але ти побачиш як виглядає Frame в Warpcast!

4. **Після створення реального vault** - замість адресу і Frame оновиться

---

## Швидкий тест Frame metadata (БЕЗ Farcaster)

Перевір чи Frame правильно налаштований:

```bash
# Test Frame HTML
curl https://your-url.ngrok.io/api/frame?vault=0x123... | grep "fc:frame"

# Має показати:
# <meta property="fc:frame" content="vNext" />
# <meta property="fc:frame:image" content="..." />
# <meta property="fc:frame:button:1" content="💰 $10" />
```

Або відкрий в браузері та подивись source code (View Page Source).

---

## Фінальний тест на Warpcast

1. Відкрий https://warpcast.com
2. Натисни "Cast"
3. Вставити твій Frame URL:
```
https://your-url/api/frame?vault=0xYOUR_VAULT_ADDRESS
```
4. **Warpcast має показати Frame preview** ПЕРЕД публікацією!
5. Якщо бачиш Frame - натисни Cast
6. Інші юзери зможуть взаємодіяти з Frame!

---

## Troubleshooting

### Frame не показується на Warpcast
- ✅ Перевір що URL публічний (https)
- ✅ Перевір metadata: `curl URL | grep fc:frame`
- ✅ Використай Farcaster Frame Validator: https://warpcast.com/~/developers/frames
- ✅ Переконайся що vault address існує

### Image не генерується
- ✅ Перевір `/api/frame/image?vault=ADDRESS` в браузері
- ✅ Має показати PNG картинку
- ✅ Якщо 404 - backend не працює або vault не існує

### Transaction не працює
- ✅ Користувач має Base Sepolia ETH?
- ✅ Користувач має USDC?
- ✅ USDC approved для vault контракту?

---

## Рекомендація

**Для швидкого тесту прямо зараз:**

1. Використай **ngrok** (Варіант 1)
2. Займе 5 хвилин
3. Зможеш протестити на Warpcast
4. Якщо сподобається - зроби full deployment на Vercel

**Команди в одному місці:**
```bash
# Terminal 1 - Backend (вже запущений)
cd backend
source venv/bin/activate
python main.py

# Terminal 2 - Frontend (вже запущений)
cd frontend
npm run dev

# Terminal 3 - ngrok
ngrok http 3001
# Copy https URL

# Terminal 4 - Update env і restart frontend
cd frontend
# Оновi NEXT_PUBLIC_APP_URL в .env.local
# Ctrl+C і npm run dev знову

# Terminal 5 - Create vault
cd contracts
source .env
cast send 0x7bfCef0D22c358F16A70fb1C93E01978De503a56 \
  "createVault(uint256,uint256,string)" \
  1000000000 \
  $(($(date +%s) + 2592000)) \
  "Test Vault" \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY

# Get vault address from transaction
# Then share on Warpcast!
```

---

## 🎉 Готово!

Після цього твій Frame буде працювати на Farcaster і люди зможуть:
- Бачити progress bar
- Бачити скільки зібрано
- Натискати кнопки $10/$25/$50
- (Після wallet інтеграції) Реально contribute!

**Let's test! 🚀**
