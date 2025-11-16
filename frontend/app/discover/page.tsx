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
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline">
            ← Back to home
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Discover Vaults</h1>
          <p className="text-gray-600">
            Browse active savings vaults and contribute to help reach goals
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading vaults...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            Error: {error}
          </div>
        )}

        {!loading && !error && vaults.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-xl text-gray-600 mb-4">No vaults found yet</p>
            <p className="text-gray-500 mb-6">Be the first to create a savings vault!</p>
            <Link
              href="/create"
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Create First Vault
            </Link>
          </div>
        )}

        {!loading && !error && vaults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaults.map((vault) => {
              const goalReached = vault.total_contributed >= vault.goal_amount;
              const isCompleted = vault.status === 'completed';

              return (
                <div
                  key={vault.address}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition"
                >
                  <div className="mb-3">
                    <h3 className="text-xl font-bold mb-1">{vault.title}</h3>
                    {vault.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {vault.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 truncate">
                      {vault.address}
                    </p>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold">{vault.progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(vault.progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Raised</span>
                      <span className="font-semibold">
                        ${formatAmount(vault.total_contributed)} / ${formatAmount(vault.goal_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Yield Earned</span>
                      <span className="font-semibold text-green-600">
                        +${formatAmount(vault.yield_earned)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Aave APY</span>
                      <span className="font-semibold text-blue-600">
                        {formatAPY(vault.apy)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Contributors</span>
                      <span className="font-semibold">{vault.contributors.length}</span>
                    </div>
                  </div>

                  {goalReached && !isCompleted && (
                    <div className="bg-green-50 text-green-800 text-sm px-3 py-2 rounded mb-3">
                      ✅ Goal Reached!
                    </div>
                  )}

                  {isCompleted && (
                    <div className="bg-gray-50 text-gray-800 text-sm px-3 py-2 rounded mb-3">
                      🎉 Completed
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link
                      href={`/vault/${vault.address}`}
                      className="flex-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition text-center"
                    >
                      View Details
                    </Link>
                    {!isCompleted && (
                      <button
                        className="flex-1 bg-gray-100 text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
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
