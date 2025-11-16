import { http, createConfig } from 'wagmi';
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors';
import { currentChain } from './chain';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

export const config = createConfig({
  chains: [currentChain],
  connectors: [
    coinbaseWallet({
      appName: 'Banka',
      preference: 'smartWalletOnly',
    }),
    metaMask(),
    walletConnect({ projectId }),
  ],
  transports: {
    [currentChain.id]: http(),
  },
});
