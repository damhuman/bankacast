# 📱 Banka Mini App для Farcaster

## ⚠️ Важлива Різниця: Frame vs Mini App

### 🎨 Frame (ЩО МИ МАЄМО ЗАРАЗ):
- ✅ Працює ПРЯМО В ПОСТАХ
- ✅ Не треба публікувати
- ✅ Просто вставити URL
- ✅ **READY TO USE!**

### 📱 Mini App (ЩО ТИ ХОЧЕШ):
- Повноцінний додаток
- Треба submit в Farcaster
- Має окрему сторінку
- Більш складний setup
- **Потребує додаткової роботи**

---

## 🚀 Якщо хочеш Mini App - треба:

### 1. Створити App на Farcaster Developer Portal

1. Іди на: https://developers.farcaster.xyz
2. Sign in з Farcaster
3. Create New App
4. Fill in details:
   - Name: **Banka**
   - Domain: **rene-underbred-nonsynodically.ngrok-free.dev**
   - Icon: Upload 512x512 PNG
   - Description: Social savings vaults with automated yield

### 2. Отримати App Signature

Треба підписати domain з твоїм Farcaster account:
```bash
# Використай Farcaster signature tool
# Це потребує твій Farcaster private key
```

### 3. Update Manifest

Після отримання signature, update `public/farcaster-manifest.json`

### 4. Deploy Manifest

Manifest має бути доступний на:
```
https://rene-underbred-nonsynodically.ngrok-free.dev/.well-known/farcaster.json
```

### 5. Submit for Review

Submit app через Developer Portal для review

---

## ⏱️ Timeline:

- **Frame** (Ready NOW): 0 хвилин - just paste URL!
- **Mini App**: 2-3 дні review + додаткова робота

---

## 💡 Рекомендація:

**Почни з Frame!** Він:
- ✅ Працює ЗАРАЗ
- ✅ Показує vault info
- ✅ Має кнопки
- ✅ Інтерактивний
- ✅ Не треба approval

**Mini App можна додати ПОТІМ** коли:
- Маєш production domain (не ngrok)
- Готовий чекати review
- Хочеш бути в каталозі

---

## 🎯 Що робити ЗАРАЗ:

### Варіант A: Use Frame (Recommended)
```
1. Go to Warpcast
2. New Cast
3. Paste: https://rene-underbred-nonsynodically.ngrok-free.dev/api/frame?vault=0x7f794b840fca57e1ff23c4958e7ef5b128f07f50
4. Post!
```

### Варіант B: Setup Mini App (Advanced)
```
1. Get production domain (Vercel)
2. Create Farcaster Developer account
3. Generate app signature
4. Submit for review
5. Wait 2-3 days
```

---

## 📚 Resources:

- Farcaster Frames Spec: https://docs.farcaster.xyz/developers/frames
- Mini Apps Spec: https://docs.farcaster.xyz/developers/mini-apps
- Developer Portal: https://developers.farcaster.xyz

---

## ✅ Current Status:

- ✅ Frame: **READY**
- ⏳ Mini App: **Needs Setup**

**Your Frame URL:**
```
https://rene-underbred-nonsynodically.ngrok-free.dev/api/frame?vault=0x7f794b840fca57e1ff23c4958e7ef5b128f07f50
```

**Готово до share! 🚀**
