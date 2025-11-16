'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ContributeModal from '@/components/ContributeModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

interface Contributor {
  address: string;
  amount: number;
  farcaster_username: string | null;
}

interface Vault {
  address: string;
  creator: string;
  goal_amount: number;
  title: string;
  description: string | null;
  image_url: string | null;
  total_contributed: number;
  current_balance: number;
  yield_earned: number;
  apy: number;
  progress: number;
  contributors: Contributor[];
  status: string;
  created_at: string | null;
}

export default function DiscoverPage() {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);

  useEffect(() => {
    fetchVaults();
  }, []);

  const fetchVaults = async () => {
    try {
      const response = await fetch(`${API_URL}/api/vaults`);
      if (!response.ok) throw new Error('Failed to fetch vaults');
      const data = await response.json();
      setVaults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (wei: number) => {
    return (wei / 1e6).toFixed(2);
  };

  const formatAPY = (apy: number) => {
    return (apy / 100).toFixed(2);
  };

  return (
    <main className="min-h-screen p-6 md:p-12 relative overflow-hidden">
      {/* Background gradient treatment - matching homepage */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 -z-10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,82,255,0.05),transparent_50%)] -z-10"></div>

      <div className="max-w-6xl mx-auto">
        {/* Enhanced back link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-blue-600 transition-colors font-medium group"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            <span>Back to home</span>
          </Link>
        </div>

        {/* Header with better hierarchy */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Discover Vaults
          </h1>
          <p className="text-lg text-gray-600">
            Browse active savings vaults and contribute to help reach goals
          </p>
        </div>

        {/* Enhanced loading state */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary"></div>
            <p className="mt-6 text-lg text-gray-600 font-medium">Loading vaults...</p>
          </div>
        )}

        {/* Enhanced error state */}
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

        {/* Enhanced empty state */}
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

        {/* Enhanced vault cards grid */}
        {!loading && !error && vaults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {vaults.map((vault) => {
              const goalReached = vault.total_contributed >= vault.goal_amount;
              const isCompleted = vault.status === 'completed';

              return (
                <div
                  key={vault.address}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-200"
                >
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

                  {/* Enhanced progress bar */}
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

                  {/* Enhanced stats with icons */}
                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-600 flex items-center gap-1">
                        <span>💰</span>
                        Raised
                      </span>
                      <span className="font-bold text-gray-900">
                        ${formatAmount(vault.total_contributed)} / ${formatAmount(vault.goal_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-600 flex items-center gap-1">
                        <span>📈</span>
                        Yield Earned
                      </span>
                      <span className="font-bold text-green-600">
                        +${formatAmount(vault.yield_earned)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-600 flex items-center gap-1">
                        <span>💹</span>
                        Aave APY
                      </span>
                      <span className="font-bold text-blue-600">
                        {vault.apy > 0 ? `${formatAPY(vault.apy)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-600 flex items-center gap-1">
                        <span>👥</span>
                        Contributors
                      </span>
                      <span className="font-bold text-gray-900">{vault.contributors.length}</span>
                    </div>
                  </div>

                  {/* Enhanced status badges */}
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

                  {/* Enhanced action buttons */}
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
                        onClick={() => setSelectedVault(vault)}
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
            vaultAddress={selectedVault.address}
            vaultTitle={selectedVault.title}
            goalAmount={selectedVault.goal_amount}
            totalContributed={selectedVault.total_contributed}
            onClose={() => setSelectedVault(null)}
          />
        )}
      </div>
    </main>
  );
}
