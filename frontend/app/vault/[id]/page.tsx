'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectAccount } from '@coinbase/onchainkit/wallet';
import ContributeModal from '@/components/ContributeModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

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
  }
] as const;

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

export default function VaultPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  const [vault, setVault] = useState<Vault | null>(null);
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
    try {
      const response = await fetch(`${API_URL}/api/vaults/${id}`);
      if (!response.ok) throw new Error('Failed to fetch vault');
      const data = await response.json();
      setVault(data);
    } catch (err: any) {
      setError(err.message);
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

  const formatAmount = (wei: number) => {
    return (wei / 1e6).toFixed(2);
  };

  const formatAPY = (apy: number) => {
    return (apy / 100).toFixed(2);
  };

  const isCreator = vault && address && vault.creator.toLowerCase() === address.toLowerCase();
  const goalReached = vault && vault.total_contributed >= vault.goal_amount;
  const isCompleted = vault?.status === 'completed';

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
            <h1 className="text-3xl font-bold mb-3">{vault.title}</h1>
            {vault.description && (
              <p className="text-gray-600 mb-4">{vault.description}</p>
            )}
            <p className="text-xs text-gray-500 font-mono break-all">{vault.address}</p>

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
              <p className="text-xl font-bold">${formatAmount(vault.goal_amount)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Total Raised</p>
              <p className="text-xl font-bold">${formatAmount(vault.total_contributed)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Yield Earned</p>
              <p className="text-xl font-bold text-green-600">+${formatAmount(vault.yield_earned)}</p>
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
                <p className="text-2xl font-bold">${formatAmount(vault.current_balance)}</p>
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
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 bg-gray-100 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
              >
                {copied ? 'Copied!' : 'Copy Frame URL'}
              </button>
              <button
                onClick={() => {
                  const shareText = `Check out this savings vault on Banka!\n\n${frameUrl}`;
                  const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}`;
                  window.open(url, '_blank');
                }}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition"
              >
                Share on Warpcast
              </button>
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
                    {contributor.farcaster_username && (
                      <p className="text-xs text-purple-600">@{contributor.farcaster_username}</p>
                    )}
                  </div>
                  <p className="font-semibold">${formatAmount(contributor.amount)}</p>
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
          goalAmount={vault.goal_amount}
          totalContributed={vault.total_contributed}
          onClose={() => setShowContributeModal(false)}
        />
      )}
    </main>
  );
}
