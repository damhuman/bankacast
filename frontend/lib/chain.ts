import { baseSepolia, base } from 'wagmi/chains';
import { Chain } from 'viem';

// Get chain from environment variable
const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '84532');

// Map chain IDs to chain objects
const CHAIN_MAP: Record<number, Chain> = {
  84532: baseSepolia, // Base Sepolia testnet
  8453: base,         // Base mainnet
};

export const currentChain = CHAIN_MAP[CHAIN_ID] || baseSepolia;
