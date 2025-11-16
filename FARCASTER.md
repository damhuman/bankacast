# 🎭 Banka Farcaster Frames - Ready!

## ✅ Що готово:

### Frame Endpoints:
1. ✅ **Display Frame** - `/api/frame?vault=ADDRESS`
2. ✅ **Image Generator** - `/api/frame/image?vault=ADDRESS`
3. ✅ **Contribute Flow** - `/api/frame/contribute?vault=ADDRESS&amount=10`
4. ✅ **Vault Detail Page** - `/vault/[id]`

---

## 🎨 Як працює Frame:

### 1. Структура Frame

```
Frame показує:
- 💰 Назву vault
- 📊 Progress bar (візуальний)
- 💵 Скільки зібрано / ціль
- 👥 Кількість contributors

Buttons:
- 💰 $10 - contribute $10
- 💵 $25 - contribute $25
- 💸 $50 - contribute $50
- 🔗 Details - відкрити деталі
```

### 2. User Flow

```
User бачить Frame в Farcaster
     ↓
Натискає "$10" button
     ↓
Frame показує транзакцію
     ↓
User підтверджує в wallet
     ↓
USDC відправляється на vault
     ↓
Frame оновлюється з новим progress
```

---

## 🚀 Як тестувати:

### Локально (без blockchain):

```bash
# 1. Переконайся що backend і frontend запущені
curl http://localhost:8001/api/health
curl http://localhost:3001

# 2. Відкрий тестовий Frame
open "http://localhost:3001/vault/0x1234567890123456789012345678901234567890"
```

### На Farcaster (потрібен deploy):

1. **Deploy contracts на Base Sepolia**
   ```bash
   cd contracts
   forge script script/Deploy.s.sol --rpc-url https://sepolia.base.org --broadcast
   ```

2. **Створи vault через Foundry або frontend**

3. **Deploy frontend на Vercel**
   ```bash
   cd frontend
   vercel
   ```

4. **Share на Farcaster**
   ```
   Paste URL у Warpcast:
   https://your-app.vercel.app/api/frame?vault=YOUR_VAULT_ADDRESS
   ```

---

## 📋 Frame Metadata Tags

Наші Frames використовують:

```html
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="..." />
<meta property="fc:frame:button:1" content="💰 $10" />
<meta property="fc:frame:button:1:action" content="post" />
<meta property="fc:frame:post_url" content="..." />
```

---

## 🎯 Features

### ✅ Implemented:
- Dynamic Frame generation based on vault data
- Progress bar visualization
- Multiple contribution amounts ($10, $25, $50)
- Share functionality
- Frame preview page

### ⏳ TODO:
- Transaction signing через Farcaster
- Approve USDC flow
- Success/error states
- Real-time updates після contribution
- Farcaster user integration

---

## 🧪 Testing Checklist

### Local Testing:
- [ ] Frame renders at `/api/frame?vault=ADDRESS`
- [ ] Image generates at `/api/frame/image?vault=ADDRESS`
- [ ] Vault detail page works
- [ ] Copy URL button works
- [ ] Share button opens Warpcast

### Farcaster Testing:
- [ ] Frame displays in Warpcast
- [ ] Buttons are clickable
- [ ] Image loads correctly
- [ ] Transaction flow works
- [ ] Progress updates after contribution

---

## 🔧 Configuration

### Environment Variables:

```bash
# frontend/.env.local
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_API_URL=https://your-api.railway.app
NEXT_PUBLIC_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
NEXT_PUBLIC_CHAIN_ID=84532
```

---

## 📚 Resources

- [Farcaster Frames Spec](https://docs.farcaster.xyz/developers/frames)
- [Frame Validator](https://warpcast.com/~/developers/frames)
- [OnchainKit Frames](https://onchainkit.xyz/guides/frames)

---

## ✨ Example Frame URL

```
http://localhost:3001/api/frame?vault=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

Try it:
1. Copy URL
2. Paste in Warpcast cast
3. See interactive Frame!

---

## 🎉 Ready for Farcaster!

Frames готові для:
- ✅ Local testing
- ✅ Deploy на Vercel
- ✅ Share на Farcaster
- ⏳ Need contracts deployed first

**Next:** Deploy contracts → Deploy frontend → Test на Farcaster! 🚀
