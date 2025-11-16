# Banka Frontend

Next.js frontend for Banka social savings vaults with Farcaster Frames integration.

## Features

- ✅ Create vault UI
- ✅ Farcaster Frames for viral sharing
- ✅ Privy wallet integration
- ✅ Real-time progress updates
- ✅ Base Sepolia support

## Setup

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Set Up Environment

```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

### 3. Get Privy App ID

1. Go to https://privy.io
2. Create an account
3. Create a new app
4. Copy App ID to `.env.local`

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Project Structure

```
frontend/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── create/             # Create vault page
│   ├── vault/[id]/         # Vault detail page
│   └── api/
│       └── frame/          # Frame API routes
├── components/             # React components
│   ├── VaultCard.tsx
│   ├── CreateForm.tsx
│   └── ContributeButton.tsx
├── lib/                    # Utilities
│   ├── contracts.ts        # Contract ABIs and addresses
│   └── privy.ts            # Privy config
├── public/                 # Static files
└── package.json
```

## Key Pages

### Home (`/`)
- Landing page
- Call to action to create vault or discover

### Create (`/create`)
- Form to create new vault
- Connect wallet via Privy
- Deploy vault contract

### Vault Detail (`/vault/[address]`)
- View vault progress
- Contribute to vault
- Real-time updates
- Share as Frame

### Discover (`/discover`)
- Browse all vaults
- Filter by status, creator
- Search functionality

## Farcaster Frames

Frames are special interactive posts that work in Farcaster clients like Warpcast.

### Frame API Routes

Located in `app/api/frame/`:

- `route.ts` - Main frame endpoint
- `contribute/route.ts` - Contribution transaction

### Frame Format

Frames use special meta tags:

```tsx
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="https://..." />
<meta property="fc:frame:button:1" content="Contribute $10" />
<meta property="fc:frame:post_url" content="https://..." />
```

## Development

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Type Check

```bash
npx tsc --noEmit
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

```bash
# Or use Vercel CLI
vercel
```

### Environment Variables for Production

```bash
NEXT_PUBLIC_PRIVY_APP_ID=...
NEXT_PUBLIC_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_API_URL=https://api.banka.xyz
NEXT_PUBLIC_APP_URL=https://banka.xyz
```

## TODO

- [ ] Write Farcaster Frame routes
- [ ] Integrate Privy for wallet
- [ ] Add Web3 contract calls
- [ ] Create vault form validation
- [ ] Real-time WebSocket integration
- [ ] Mobile responsive design
- [ ] Add loading states
- [ ] Error handling

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Privy Docs](https://docs.privy.io)
- [Farcaster Frames](https://docs.farcaster.xyz/developers/frames)
- [OnchainKit](https://onchainkit.xyz)

## License

MIT
