'use client';

import { useState } from 'react';
import Link from 'next/link';

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS;
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS;

export default function CreateVaultPage() {
  const [title, setTitle] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [vaultAddress, setVaultAddress] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Convert goal amount to USDC wei (6 decimals)
      const goalAmountWei = BigInt(Number(goalAmount) * 1e6).toString();

      // Convert deadline to Unix timestamp
      const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);

      // For now, we'll just show the transaction parameters
      // In production, this would use wagmi/viem to call the contract
      const txParams = {
        to: FACTORY_ADDRESS,
        method: 'createVault',
        params: {
          goalAmount: goalAmountWei,
          deadline: deadlineTimestamp,
          metadataURI: `db://${title}`,
        },
      };

      console.log('Transaction params:', txParams);

      // Simulate success for now
      setSuccess('Vault creation initiated! (Mock transaction for now)');
      setVaultAddress('0x' + Math.random().toString(16).substr(2, 40));

      // TODO: Implement actual wallet connection and transaction
      // const tx = await writeContract({
      //   address: FACTORY_ADDRESS,
      //   abi: factoryABI,
      //   functionName: 'createVault',
      //   args: [goalAmountWei, deadlineTimestamp, `db://${title}`]
      // });

    } catch (err: any) {
      setError(err.message || 'Failed to create vault');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline">
            ← Back to home
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-2">Create Savings Vault</h1>
        <p className="text-gray-600 mb-8">
          Set your goal, deadline, and start saving together
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-6">
            <p className="font-semibold">{success}</p>
            {vaultAddress && (
              <div className="mt-2">
                <p className="text-sm">Vault address: {vaultAddress}</p>
                <Link
                  href={`/vault/${vaultAddress}`}
                  className="text-sm text-green-700 hover:underline"
                >
                  View vault →
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vault Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., MacBook Fund, Vacation Savings, New Car"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal Amount (USDC)
            </label>
            <input
              type="number"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
              required
              min="1"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="1000"
            />
            <p className="text-sm text-gray-500 mt-1">
              Target amount in USDC (e.g., 1000 for $1,000)
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
              min={today}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-sm text-gray-500 mt-1">
              When do you want to reach your goal?
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-primary p-4 mb-6">
            <h3 className="font-semibold mb-2">How it works:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Create your vault with a goal and deadline</li>
              <li>Share the vault link on Farcaster</li>
              <li>Friends contribute USDC directly</li>
              <li>Funds auto-generate yield via Aave V3</li>
              <li>Withdraw when goal is reached or deadline passes</li>
            </ol>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Vault...' : 'Create Vault'}
          </button>

          <p className="text-xs text-gray-500 mt-4 text-center">
            By creating a vault, you agree that funds will be locked until the deadline or goal is reached
          </p>
        </form>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Note: Wallet Integration Required</h3>
          <p className="text-sm text-yellow-800">
            This page currently shows a mock form. To create real vaults, you need to:
          </p>
          <ul className="list-disc list-inside text-sm text-yellow-800 mt-2 space-y-1">
            <li>Connect your wallet (Privy/Wagmi integration needed)</li>
            <li>Approve USDC spending (if contributing immediately)</li>
            <li>Sign the transaction to deploy the vault</li>
          </ul>
          <p className="text-sm text-yellow-800 mt-2">
            For now, use the command line to create vaults (see DEPLOYMENT_SUCCESS.md)
          </p>
        </div>
      </div>
    </main>
  );
}
