'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount, usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import { ConnectAccount } from '@coinbase/onchainkit/wallet';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;
const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '84532');

const FACTORY_ABI = [
  {
    "inputs": [],
    "name": "getAllVaults",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

const VAULT_ABI = [
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
    "inputs": [{ "internalType": "address", "name": "contributor", "type": "address" }],
    "name": "getContribution",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

interface Vault {
  address: string;
  creator: string;
  goalAmount: bigint;
  title: string;
  description: string;
  totalContributed: bigint;
  currentBalance: bigint;
  yieldEarned: bigint;
  apy: bigint;
  progress: number;
  status: number;
  tokenAddress: string;
  decimals: number;
  tokenSymbol: string;
  myContribution: bigint;
}

export default function ContributionsPage() {
  const { t } = useLanguage();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: CHAIN_ID });
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (publicClient && address) {
      fetchMyContributions();
    } else if (!isConnected) {
      setLoading(false);
    }
  }, [publicClient, address, isConnected]);

  const fetchMyContributions = async () => {
    if (!publicClient || !address) return;

    try {
      setLoading(true);
      setError('');

      // Get all vault addresses from factory
      const vaultAddresses = await publicClient.readContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: 'getAllVaults',
      }) as `0x${string}`[];

      console.log('Checking contributions in', vaultAddresses.length, 'vaults');

      // Fetch data for each vault and filter by my contributions
      const vaultData = await Promise.all(
        vaultAddresses.map(async (vaultAddress) => {
          try {
            // First check if I contributed to this vault
            const myContribution = await publicClient.readContract({
              address: vaultAddress,
              abi: VAULT_ABI,
              functionName: 'getContribution',
              args: [address],
            }) as bigint;

            // Skip if no contribution
            if (myContribution === 0n) {
              return null;
            }

            // Batch read all vault data
            const [
              creator,
              goalAmount,
              metadataURI,
              description,
              totalContributed,
              tokenInfo,
              yieldStats,
              status
            ] = await Promise.all([
              publicClient.readContract({
                address: vaultAddress,
                abi: VAULT_ABI,
                functionName: 'creator',
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
            ]);

            const [tokenAddress, decimals, tokenSymbol] = tokenInfo as [string, number, string];
            const [principal, currentBalance, yieldEarned, yieldPercentage, currentAPY] = yieldStats as [bigint, bigint, bigint, bigint, bigint];

            // Parse title from metadataURI (db://title)
            const title = (metadataURI as string).replace('db://', '').replace(/_/g, ' ');

            // Calculate progress
            const progress = goalAmount > 0n
              ? Number((totalContributed * 10000n) / goalAmount) / 100
              : 0;

            return {
              address: vaultAddress,
              creator: creator as string,
              goalAmount: goalAmount as bigint,
              title,
              description: description as string,
              totalContributed: totalContributed as bigint,
              currentBalance,
              yieldEarned,
              apy: currentAPY,
              progress,
              status: status as number,
              tokenAddress,
              decimals,
              tokenSymbol,
              myContribution,
            };
          } catch (err) {
            console.error(`Error fetching vault ${vaultAddress}:`, err);
            return null;
          }
        })
      );

      // Filter out failed fetches and sort by contribution amount (highest first)
      const validVaults = vaultData.filter((v) => v !== null) as Vault[];
      validVaults.sort((a, b) => Number(b.myContribution - a.myContribution));
      setVaults(validVaults);

    } catch (err: any) {
      console.error('Error fetching contributions:', err);
      setError(err.message || 'Failed to load your contributions');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: bigint, decimals: number) => {
    return parseFloat(formatUnits(amount, decimals)).toFixed(decimals === 18 ? 4 : 2);
  };

  const formatAPY = (apy: bigint) => {
    return (Number(apy) / 100).toFixed(2);
  };

  const getTokenIcon = (symbol: string) => {
    return symbol === 'ETH' ? '⟠' : '💵';
  };

  const calculateMyShare = (myContribution: bigint, totalContributed: bigint) => {
    if (totalContributed === 0n) return 0;
    return Number((myContribution * 10000n) / totalContributed) / 100;
  };

  return (
    <main className="min-h-screen p-6 md:p-12 relative overflow-hidden">
      {/* Background gradient treatment */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 -z-10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,82,255,0.05),transparent_50%)] -z-10"></div>

      <div className="max-w-6xl mx-auto">
        {/* Back link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-blue-600 transition-colors font-medium group"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            <span>{t('backToHome')}</span>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {t('myContributions')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('contributionsDesc')}
          </p>
        </div>

        {/* Not connected state */}
        {!isConnected && (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100">
            <div className="text-6xl mb-6">🔐</div>
            <p className="text-2xl font-bold text-gray-900 mb-3">{t('connectWalletPrompt')}</p>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">{t('connectWalletDesc')}</p>
            <div className="flex justify-center">
              <ConnectAccount />
            </div>
          </div>
        )}

        {/* Loading state */}
        {isConnected && loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary"></div>
            <p className="mt-6 text-lg text-gray-600 font-medium">{t('loadingBankas')}</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-800 px-5 py-4 rounded-xl shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold text-base">{t('errorLoadingContributions')}</p>
                <p className="text-sm mt-1 leading-relaxed">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {isConnected && !loading && !error && vaults.length === 0 && (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100">
            <div className="text-6xl mb-6">💸</div>
            <p className="text-2xl font-bold text-gray-900 mb-3">{t('noContributionsYet')}</p>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">{t('noContributionsDesc')}</p>
            <Link
              href="/discover"
              className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              {t('discoverBankas')}
            </Link>
          </div>
        )}

        {/* Vault cards grid */}
        {isConnected && !loading && !error && vaults.length > 0 && (
          <>
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{t('totalContributions')}</p>
                  <p className="text-2xl font-bold text-gray-900">{vaults.length} {t('bankas')}</p>
                </div>
                <div className="text-4xl">🎯</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {vaults.map((vault) => {
                const goalReached = vault.totalContributed >= vault.goalAmount;
                const isCompleted = vault.status === 2;
                const myShare = calculateMyShare(vault.myContribution, vault.totalContributed);

                return (
                  <div
                    key={vault.address}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200"
                  >
                    {/* Token badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{getTokenIcon(vault.tokenSymbol)}</span>
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {vault.tokenSymbol} Vault
                      </span>
                    </div>

                    {/* Vault header */}
                    <div className="mb-5">
                      <h3 className="text-xl font-bold mb-2 text-gray-900">{vault.title}</h3>
                      {vault.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                          {vault.description}
                        </p>
                      )}
                    </div>

                    {/* My Contribution highlight */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 mb-4">
                      <p className="text-xs text-purple-700 font-semibold mb-1">{t('yourContribution')}</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {vault.tokenSymbol === 'USDC' && '$'}
                        {formatAmount(vault.myContribution, vault.decimals)} {vault.tokenSymbol}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        {myShare.toFixed(1)}% {t('ofTotal')}
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-5">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 font-medium">{t('totalProgress')}</span>
                        <span className="font-bold text-primary">{vault.progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary to-blue-400 h-3 rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${Math.min(vault.progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-3 mb-5">
                      <div className="flex justify-between text-sm items-center">
                        <span className="text-gray-600 flex items-center gap-1">
                          <span>💰</span>
                          {t('totalRaised')}
                        </span>
                        <span className="font-bold text-gray-900">
                          {formatAmount(vault.totalContributed, vault.decimals)} / {formatAmount(vault.goalAmount, vault.decimals)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm items-center">
                        <span className="text-gray-600 flex items-center gap-1">
                          <span>📈</span>
                          {t('yieldEarned')}
                        </span>
                        <span className="font-bold text-green-600">
                          +{formatAmount(vault.yieldEarned, vault.decimals)} {vault.tokenSymbol}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm items-center">
                        <span className="text-gray-600 flex items-center gap-1">
                          <span>💹</span>
                          {t('aaveAPY')}
                        </span>
                        <span className="font-bold text-blue-600">
                          {vault.apy > 0n ? `${formatAPY(vault.apy)}%` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Status badges */}
                    {goalReached && !isCompleted && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 text-sm px-4 py-2 rounded-xl mb-4 font-semibold text-center">
                        ✅ {t('goalReached')}
                      </div>
                    )}

                    {isCompleted && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 text-purple-800 text-sm px-4 py-2 rounded-xl mb-4 font-semibold text-center">
                        🎉 {t('completed')}
                      </div>
                    )}

                    {/* Action button */}
                    <Link
                      href={`/vault/${vault.address}`}
                      className="block w-full bg-primary text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-all duration-200 text-center shadow-md hover:shadow-lg hover:scale-105"
                    >
                      {t('viewDetails')}
                    </Link>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
