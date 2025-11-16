# 🚀 Швидкий тест Banka Frame на Farcaster

## ✅ Vault вже створено!

**Vault Address:** `0x7f794b840fca57e1ff23c4958e7ef5b128f07f50`

**View on Basescan:**
https://sepolia.basescan.org/address/0x7f794b840fca57e1ff23c4958e7ef5b128f07f50

**Details:**
- Goal: 1000 USDC
- Deadline: 30 days from now
- Title: "My First Banka Vault"
- Creator: 0x46C0Ffa9C5E60cf0aBc865Fd293898b776604C19

---

## 🎯 Як протестувати Frame (3 варіанти)

### Варіант 1: ngrok (потребує реєстрації) - 5 хвилин

1. **Зареєструйся на ngrok:**
   - Іди на https://dashboard.ngrok.com/signup
   - Sign up (безкоштовно)
   - Copy authtoken з https://dashboard.ngrok.com/get-started/your-authtoken

2. **Встанови authtoken:**
   ```bash
   ngrok config add-authtoken YOUR_TOKEN_HERE
   ```

3. **Запусти ngrok:**
   ```bash
   ngrok http 3001
   ```

4. **Copy HTTPS URL** (типу `https://abc123.ngrok-free.app`)

5. **Оновi frontend/.env.local:**
   ```bash
   cd frontend
   nano .env.local

   # Зміни NEXT_PUBLIC_APP_URL на ngrok URL
   NEXT_PUBLIC_APP_URL=https://abc123.ngrok-free.app
   ```

6. **Restart frontend:**
   ```bash
   # Ctrl+C на npm run dev
   npm run dev
   ```

7. **Test Frame URL:**
   ```
   https://abc123.ngrok-free.app/api/frame?vault=0x7f794b840fca57e1ff23c4958e7ef5b128f07f50
   ```

8. **Share на Warpcast!**

---

### Варіант 2: Vercel (production) - 10 хвилин

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd frontend
   vercel
   ```

4. **Add env variables:**
   ```bash
   vercel env add NEXT_PUBLIC_APP_URL
   # Enter: your-vercel-url.vercel.app

   vercel env add NEXT_PUBLIC_FACTORY_ADDRESS
   # Enter: 0x7bfCef0D22c358F16A70fb1C93E01978De503a56

   vercel env add NEXT_PUBLIC_USDC_ADDRESS
   # Enter: 0x036CbD53842c5426634e7929541eC2318f3dCF7e

   vercel env add NEXT_PUBLIC_CHAIN_ID
   # Enter: 84532

   vercel env add NEXT_PUBLIC_RPC_URL
   # Enter: https://sepolia.base.org

   vercel env add NEXT_PUBLIC_API_URL
   # Enter: http://localhost:8001
   ```

5. **Redeploy:**
   ```bash
   vercel --prod
   ```

6. **Frame URL:**
   ```
   https://your-app.vercel.app/api/frame?vault=0x7f794b840fca57e1ff23c4958e7ef5b128f07f50
   ```

---

### Варіант 3: Локальне тестування Frame metadata

Можна перевірити що Frame правильно генерується локально:

1. **Відкрий в браузері:**
   ```
   http://localhost:3001/api/frame?vault=0x7f794b840fca57e1ff23c4958e7ef5b128f07f50
   ```

2. **View Page Source** (правий клік → View Page Source)

3. **Шукай такі теги:**
   ```html
   <meta property="fc:frame" content="vNext" />
   <meta property="fc:frame:image" content="..." />
   <meta property="fc:frame:button:1" content="💰 $10" />
   <meta property="fc:frame:button:2" content="💵 $25" />
   <meta property="fc:frame:button:3" content="💸 $50" />
   <meta property="fc:frame:button:4" content="🔗 Details" />
   ```

4. **Test image generation:**
   ```
   http://localhost:3001/api/frame/image?vault=0x7f794b840fca57e1ff23c4958e7ef5b128f07f50
   ```
   Має показати PNG картинку з vault info

---

## 🎨 Що ти побачиш на Farcaster

Коли поділишся Frame на Warpcast, люди побачать:

```
┌─────────────────────────────────┐
│  My First Banka Vault           │
│                                  │
│  Progress: 0% of 1000 USDC      │
│  ▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱           │
│                                  │
│  👥 0 contributors               │
│  💰 0 USDC raised                │
│  ⏰ 30 days left                 │
│                                  │
│  [💰 $10] [💵 $25] [💸 $50]     │
│           [🔗 Details]           │
└─────────────────────────────────┘
```

---

## 🧪 Frame Validator

Перед публікацією на Warpcast, протестуй Frame через офіційний validator:

1. Іди на https://warpcast.com/~/developers/frames
2. Вставити Frame URL
3. Побачиш preview + будь-які помилки

---

## ✅ Checklist

- [x] Contracts deployed
- [x] Vault created (0x7f794b840fca57e1ff23c4958e7ef5b128f07f50)
- [ ] ngrok/Vercel setup (вибери варіант)
- [ ] Frame URL працює
- [ ] Test на Frame Validator
- [ ] Share на Warpcast
- [ ] Profit! 🎉

---

## 💡 Recommendations

**Для швидкого тесту:** Використай ngrok (5 хв з реєстрацією)

**Для production:** Deploy на Vercel (10 хв, але постійний URL)

**Для розробки:** Локальний тест metadata (1 хв, без share)

---

## 🆘 Need Help?

**ngrok authtoken:**
1. https://dashboard.ngrok.com/signup
2. Copy token from https://dashboard.ngrok.com/get-started/your-authtoken
3. Run: `ngrok config add-authtoken YOUR_TOKEN`

**Vercel login issues:**
- Make sure you have account on https://vercel.com
- Use `vercel login` and follow browser auth

**Frame not showing on Warpcast:**
- Make sure URL is HTTPS (not http://)
- Check Frame Validator for errors
- Ensure vault exists on-chain

---

## 🎉 Ready to test!

Vault чекає на тебе на Base Sepolia! Вибери варіант і поділись на Farcaster! 🚀
