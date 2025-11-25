# Netlify Environment Variables Setup

## Required Environment Variables

Go to: **Netlify Dashboard → Site Settings → Environment Variables**

Add/Update these variables:

### Production (Required)
```
NEXT_PUBLIC_FACTORY_ADDRESS = 0x5cF11A860d220284f0Ab4d98d61cAB737FF5518D
NEXT_PUBLIC_USDC_ADDRESS = 0x036CbD53842c5426634e7929541eC2318f3dCF7e
NEXT_PUBLIC_WETH_ADDRESS = 0x4200000000000000000000000000000000000006
NEXT_PUBLIC_CHAIN_ID = 84532
NEXT_PUBLIC_RPC_URL = https://sepolia.base.org
NEXT_PUBLIC_API_URL = http://localhost:8001
NEXT_PUBLIC_APP_URL = https://[your-site].netlify.app
```

## After Adding Variables

1. Go to **Deploys** tab
2. Click **Trigger deploy**
3. Select **Clear cache and deploy site**

This ensures the new environment variables are used in the build.

## Contract Addresses (Base Sepolia)

- **VaultFactory:** `0x5cF11A860d220284f0Ab4d98d61cAB737FF5518D`
- **Vault Implementation:** `0x052bBD8b29BbC7fbB2e90Fbf4eF3232Fa62BBE58`
- **WETH:** `0x4200000000000000000000000000000000000006`
- **USDC:** `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- **Aave Pool:** `0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b`
