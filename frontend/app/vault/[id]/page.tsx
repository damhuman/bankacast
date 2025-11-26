'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { ConnectAccount } from '@coinbase/onchainkit/wallet';
import ContributeModal from '@/components/ContributeModal';
import { formatUnits } from 'viem';

const VAULT_ABI = [
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "smash",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "creator",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "goalAmount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "metadataURI",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "description",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalContributed",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTokenInfo",
    "outputs": [
      { "internalType": "address", "name": "tokenAddress", "type": "address" },
      { "internalType": "uint8", "name": "decimals", "type": "uint8" },
      { "internalType": "string", "name": "symbol", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getYieldStats",
    "outputs": [
      { "internalType": "uint256", "name": "principal", "type": "uint256" },
      { "internalType": "uint256", "name": "currentBalance", "type": "uint256" },
      { "internalType": "uint256", "name": "yieldEarned", "type": "uint256" },
      { "internalType": "uint256", "name": "yieldPercentage", "type": "uint256" },
      { "internalType": "uint256", "name": "currentAPY", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getStatus",
    "outputs": [{ "internalType": "uint8", "name": "status", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContributors",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "contributor", "type": "address" }],
    "name": "getContribution",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContributorCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBeneficiary",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

interface Contributor {
  address: string;
  amount: bigint;
}

interface VaultData {
  address: string;
  creator: string;
  beneficiary: string;
  goalAmount: bigint;
  title: string;
  description: string;
  totalContributed: bigint;
  currentBalance: bigint;
  yieldEarned: bigint;
  apy: bigint;
  progress: number;
  contributors: Contributor[];
  status: number;
  tokenAddress: string;
  tokenDecimals: number;
  tokenSymbol: string;
}

export default function VaultPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });
  const publicClient = usePublicClient();

  const [vault, setVault] = useState<VaultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
  const frameUrl = `${APP_URL}/api/frame?vault=${id}`;

  useEffect(() => {
    fetchVault();
  }, [id]);

  useEffect(() => {
    if (isSuccess) {
      // Refresh vault data after successful transaction
      setTimeout(() => fetchVault(), 2000);
    }
  }, [isSuccess]);

  const fetchVault = async () => {
    if (!publicClient) {
      setError('Blockchain client not available');
      setLoading(false);
      return;
    }

    try {
      const vaultAddress = id as `0x${string}`;

      // Fetch all vault data in parallel
      const [
        creator,
        beneficiary,
        goalAmount,
        metadataURI,
        description,
        totalContributed,
        tokenInfo,
        yieldStats,
        status,
        contributorAddresses
      ] = await Promise.all([
        publicClient.readContract({
          address: vaultAddress,
          abi: VAULT_ABI,
          functionName: 'creator',
        }),
        publicClient.readContract({
          address: vaultAddress,
          abi: VAULT_ABI,
          functionName: 'getBeneficiary',
        }),
        publicClient.readContract({
          address: vaultAddress,
          abi: VAULT_ABI,
          functionName: 'goalAmount',
        }),
        publicClient.readContract({
          address: vaultAddress,
          abi: VAULT_ABI,
          functionName: 'metadataURI',
        }),
        publicClient.readContract({
          address: vaultAddress,
          abi: VAULT_ABI,
          functionName: 'description',
        }),
        publicClient.readContract({
          address: vaultAddress,
          abi: VAULT_ABI,
          functionName: 'totalContributed',
        }),
        publicClient.readContract({
          address: vaultAddress,
          abi: VAULT_ABI,
          functionName: 'getTokenInfo',
        }),
        publicClient.readContract({
          address: vaultAddress,
          abi: VAULT_ABI,
          functionName: 'getYieldStats',
        }),
        publicClient.readContract({
          address: vaultAddress,
          abi: VAULT_ABI,
          functionName: 'getStatus',
        }),
        publicClient.readContract({
          address: vaultAddress,
          abi: VAULT_ABI,
          functionName: 'getContributors',
        })
      ]);

      // Fetch contribution amounts for each contributor
      const contributorsWithAmounts = await Promise.all(
        contributorAddresses.map(async (contributorAddr) => {
          const amount = await publicClient.readContract({
            address: vaultAddress,
            abi: VAULT_ABI,
            functionName: 'getContribution',
            args: [contributorAddr],
          });
          return {
            address: contributorAddr,
            amount: amount as bigint,
          };
        })
      );

      // Extract title from metadataURI (db://Title format)
      const title = metadataURI.replace('db://', '');

      // Calculate progress
      const progress = goalAmount > 0n
        ? (Number(totalContributed) * 100) / Number(goalAmount)
        : 0;

      setVault({
        address: vaultAddress,
        creator: creator as string,
        beneficiary: beneficiary as string,
        goalAmount: goalAmount as bigint,
        title,
        description: description as string,
        totalContributed: totalContributed as bigint,
        currentBalance: yieldStats[1] as bigint,
        yieldEarned: yieldStats[2] as bigint,
        apy: yieldStats[4] as bigint,
        progress,
        contributors: contributorsWithAmounts,
        status: status as number,
        tokenAddress: tokenInfo[0] as string,
        tokenDecimals: tokenInfo[1] as number,
        tokenSymbol: tokenInfo[2] as string,
      });
    } catch (err: any) {
      console.error('Error fetching vault:', err);
      setError(err.message || 'Failed to fetch vault data');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(frameUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdraw = () => {
    if (!vault) return;

    writeContract({
      address: vault.address as `0x${string}`,
      abi: VAULT_ABI,
      functionName: 'withdraw',
    });
  };

  const handleSmash = () => {
    if (!vault) return;

    if (confirm('Are you sure you want to smash this vault early? This action cannot be undone.')) {
      writeContract({
        address: vault.address as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'smash',
      });
    }
  };

  const formatAmount = (amount: bigint, decimals: number) => {
    return parseFloat(formatUnits(amount, decimals)).toFixed(decimals === 18 ? 4 : 2);
  };

  const formatAPY = (apy: bigint) => {
    // APY is in basis points (10000 = 100%)
    return (Number(apy) / 100).toFixed(2);
  };

  const getTokenIcon = (symbol: string) => {
    if (symbol === 'ETH') return '⟠';
    if (symbol === 'USDC') return '💵';
    return '🪙';
  };

  const isCreator = vault && address && vault.creator.toLowerCase() === address.toLowerCase();
  const goalReached = vault && vault.totalContributed >= vault.goalAmount;
  const isCompleted = vault?.status === 2;

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading vault...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !vault) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            Error: {error || 'Vault not found'}
          </div>
          <Link href="/discover" className="text-primary hover:underline mt-4 inline-block">
            ← Back to discover
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/discover" className="text-primary hover:underline">
            ← Back to discover
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6">
          {/* Title & Description */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <h1 className="text-3xl font-bold">{vault.title}</h1>
              <span className="text-2xl">{getTokenIcon(vault.tokenSymbol)}</span>
            </div>
            {vault.description && (
              <p className="text-gray-600 mb-4">{vault.description}</p>
            )}
            <p className="text-xs text-gray-500 font-mono break-all">{vault.address}</p>

            {/* Beneficiary Badge - Show if beneficiary is different from creator */}
            {vault.beneficiary.toLowerCase() !== vault.creator.toLowerCase() && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mt-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎁</span>
                  <div className="flex-1">
                    <p className="font-bold text-purple-900 mb-1">Beneficiary Vault</p>
                    <p className="text-sm text-purple-700">
                      Funds will be sent to:
                    </p>
                    <p className="font-mono text-xs mt-2 bg-purple-100 px-3 py-2 rounded break-all text-purple-900">
                      {vault.beneficiary}
                    </p>
                    <p className="text-xs text-purple-600 mt-2">
                      The vault creator can manage it, but all funds go to the beneficiary address above.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isCompleted && (
              <div className="bg-gray-50 text-gray-800 px-4 py-3 rounded mt-4">
                🎉 This vault has been completed
              </div>
            )}
            {goalReached && !isCompleted && (
              <div className="bg-green-50 text-green-800 px-4 py-3 rounded mt-4">
                ✅ Goal reached! Creator can withdraw funds now.
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 font-medium">Progress</span>
              <span className="font-bold text-lg">{vault.progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-primary h-4 rounded-full transition-all"
                style={{ width: `${Math.min(vault.progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Goal Amount</p>
              <p className="text-xl font-bold">
                {vault.tokenSymbol === 'USDC' && '$'}
                {formatAmount(vault.goalAmount, vault.tokenDecimals)} {vault.tokenSymbol}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Total Raised</p>
              <p className="text-xl font-bold">
                {vault.tokenSymbol === 'USDC' && '$'}
                {formatAmount(vault.totalContributed, vault.tokenDecimals)} {vault.tokenSymbol}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Yield Earned</p>
              <p className="text-xl font-bold text-green-600">
                +{vault.tokenSymbol === 'USDC' && '$'}
                {formatAmount(vault.yieldEarned, vault.tokenDecimals)} {vault.tokenSymbol}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Current APY</p>
              <p className="text-xl font-bold text-blue-600">{formatAPY(vault.apy)}%</p>
            </div>
          </div>

          {/* Balance Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Balance (Principal + Yield)</p>
                <p className="text-2xl font-bold">
                  {vault.tokenSymbol === 'USDC' && '$'}
                  {formatAmount(vault.currentBalance, vault.tokenDecimals)} {vault.tokenSymbol}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Earning yield via Aave V3 on Base
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {!isConnected && (
              <div className="flex-1 flex justify-center">
                <ConnectAccount />
              </div>
            )}

            {isConnected && isCreator && !isCompleted && (
              <>
                {goalReached && (
                  <button
                    onClick={handleWithdraw}
                    disabled={isPending}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {isPending ? 'Processing...' : 'Withdraw Funds'}
                  </button>
                )}
                <button
                  onClick={handleSmash}
                  disabled={isPending}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                >
                  {isPending ? 'Processing...' : 'Smash Vault Early'}
                </button>
              </>
            )}

            {isConnected && !isCreator && !isCompleted && (
              <button
                onClick={() => setShowContributeModal(true)}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                Contribute to Vault
              </button>
            )}
          </div>

          {/* Share Section */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold mb-3">Share on Farcaster</h3>
            <div className="space-y-2">
              <button
                onClick={handleCopy}
                className="w-full bg-gray-100 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
              >
                {copied ? 'Copied!' : 'Copy Frame URL'}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const shareText = `Check out this savings vault on Banka!\n\n${frameUrl}`;
                    const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}`;
                    window.open(url, '_blank');
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition"
                >
                  Share on Warpcast
                </button>
                <button
                  onClick={() => {
                    // Open in Coinbase Wallet / Base app
                    const baseAppUrl = `https://wallet.coinbase.com/dapp?url=${encodeURIComponent(frameUrl)}`;
                    window.open(baseAppUrl, '_blank');
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Open in Base App
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contributors Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h2 className="text-xl font-bold mb-4">
            Contributors ({vault.contributors.length})
          </h2>

          {vault.contributors.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No contributions yet. Be the first!</p>
          ) : (
            <div className="space-y-3">
              {vault.contributors.map((contributor, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-mono text-sm text-gray-900">
                      {contributor.address.slice(0, 6)}...{contributor.address.slice(-4)}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {vault.tokenSymbol === 'USDC' && '$'}
                    {formatAmount(contributor.amount, vault.tokenDecimals)} {vault.tokenSymbol}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showContributeModal && (
        <ContributeModal
          vaultAddress={vault.address}
          vaultTitle={vault.title}
          goalAmount={vault.goalAmount}
          totalContributed={vault.totalContributed}
          tokenAddress={vault.tokenAddress}
          tokenDecimals={vault.tokenDecimals}
          tokenSymbol={vault.tokenSymbol}
          onClose={() => setShowContributeModal(false)}
        />
      )}
    </main>
  );
}
