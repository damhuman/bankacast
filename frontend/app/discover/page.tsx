'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import ContributeModal from '@/components/ContributeModal';

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
    "inputs": [],
    "name": "getContributorCount",
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
  contributorCount: number;
  status: number;
  tokenAddress: string;
  decimals: number;
  tokenSymbol: string;
}

interface ContributeModalData {
  vaultAddress: string;
  vaultTitle: string;
  goalAmount: number;
  totalContributed: number;
  token: string;
  decimals: number;
  tokenSymbol: string;
}

export default function DiscoverPage() {
  const publicClient = usePublicClient({ chainId: CHAIN_ID });
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVault, setSelectedVault] = useState<ContributeModalData | null>(null);

  useEffect(() => {
    if (publicClient) {
      fetchVaults();
    }
  }, [publicClient]);

  const fetchVaults = async () => {
    if (!publicClient) return;

    try {
      setLoading(true);
      setError('');

      // Get all vault addresses from factory
      const vaultAddresses = await publicClient.readContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: 'getAllVaults',
      }) as `0x${string}`[];

      console.log('Found vaults:', vaultAddresses.length);

      // Fetch data for each vault
      const vaultData = await Promise.all(
        vaultAddresses.map(async (vaultAddress) => {
          try {
            // Batch read all vault data
            const [
              creator,
              goalAmount,
              metadataURI,
              description,
              totalContributed,
              tokenInfo,
              yieldStats,
              status,
              contributorCount
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
              publicClient.readContract({
                address: vaultAddress,
                abi: VAULT_ABI,
                functionName: 'getContributorCount',
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
              contributorCount: Number(contributorCount),
              status: status as number,
              tokenAddress,
              decimals,
              tokenSymbol,
            };
          } catch (err) {
            console.error(`Error fetching vault ${vaultAddress}:`, err);
            return null;
          }
        })
      );

      // Filter out failed fetches and sort by creation (newest first)
      const validVaults = vaultData.filter((v) => v !== null) as Vault[];
      setVaults(validVaults.reverse());

    } catch (err: any) {
      console.error('Error fetching vaults:', err);
      setError(err.message || 'Failed to load vaults');
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
            <span>Back to home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Discover Vaults
          </h1>
          <p className="text-lg text-gray-600">
            Browse active savings vaults and contribute to help reach goals
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary"></div>
            <p className="mt-6 text-lg text-gray-600 font-medium">Loading vaults from blockchain...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-800 px-5 py-4 rounded-xl shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold text-base">Error Loading Vaults</p>
                <p className="text-sm mt-1 leading-relaxed">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && vaults.length === 0 && (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100">
            <div className="text-6xl mb-6">🏦</div>
            <p className="text-2xl font-bold text-gray-900 mb-3">No vaults found yet</p>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Be the first to create a savings vault and start earning yield!</p>
            <Link
              href="/create"
              className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Create First Vault
            </Link>
          </div>
        )}

        {/* Vault cards grid */}
        {!loading && !error && vaults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {vaults.map((vault) => {
              const goalReached = vault.totalContributed >= vault.goalAmount;
              const isCompleted = vault.status === 2;

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
                    <p className="text-xs text-gray-400 font-mono truncate bg-gray-50 px-2 py-1 rounded">
                      {vault.address.slice(0, 6)}...{vault.address.slice(-4)}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-5">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 font-medium">Progress</span>
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
                        Raised
                      </span>
                      <span className="font-bold text-gray-900">
                        {formatAmount(vault.totalContributed, vault.decimals)} / {formatAmount(vault.goalAmount, vault.decimals)} {vault.tokenSymbol}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-600 flex items-center gap-1">
                        <span>📈</span>
                        Yield Earned
                      </span>
                      <span className="font-bold text-green-600">
                        +{formatAmount(vault.yieldEarned, vault.decimals)} {vault.tokenSymbol}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-600 flex items-center gap-1">
                        <span>💹</span>
                        Aave APY
                      </span>
                      <span className="font-bold text-blue-600">
                        {vault.apy > 0n ? `${formatAPY(vault.apy)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-600 flex items-center gap-1">
                        <span>👥</span>
                        Contributors
                      </span>
                      <span className="font-bold text-gray-900">{vault.contributorCount}</span>
                    </div>
                  </div>

                  {/* Status badges */}
                  {goalReached && !isCompleted && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 text-sm px-4 py-2 rounded-xl mb-4 font-semibold text-center">
                      ✅ Goal Reached!
                    </div>
                  )}

                  {isCompleted && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 text-purple-800 text-sm px-4 py-2 rounded-xl mb-4 font-semibold text-center">
                      🎉 Completed
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3 mt-auto">
                    <Link
                      href={`/vault/${vault.address}`}
                      className="flex-1 bg-primary text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-all duration-200 text-center shadow-md hover:shadow-lg hover:scale-105"
                    >
                      View Details
                    </Link>
                    {!isCompleted && (
                      <button
                        className="flex-1 bg-white text-gray-900 px-4 py-3 rounded-xl text-sm font-semibold border-2 border-gray-200 hover:border-primary hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg"
                        onClick={() => setSelectedVault({
                          vaultAddress: vault.address,
                          vaultTitle: vault.title,
                          goalAmount: Number(vault.goalAmount),
                          totalContributed: Number(vault.totalContributed),
                          token: vault.tokenAddress,
                          decimals: vault.decimals,
                          tokenSymbol: vault.tokenSymbol,
                        })}
                      >
                        Contribute
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedVault && (
          <ContributeModal
            vaultAddress={selectedVault.vaultAddress}
            vaultTitle={selectedVault.vaultTitle}
            goalAmount={selectedVault.goalAmount}
            totalContributed={selectedVault.totalContributed}
            token={selectedVault.token}
            decimals={selectedVault.decimals}
            tokenSymbol={selectedVault.tokenSymbol}
            onClose={() => setSelectedVault(null)}
          />
        )}
      </div>
    </main>
  );
}
