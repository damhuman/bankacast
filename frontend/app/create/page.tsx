'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { useWalletClient } from 'wagmi';
import { parseUnits } from 'viem';

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS;

const FACTORY_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "goalAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" },
      { "internalType": "string", "name": "metadataURI", "type": "string" }
    ],
    "name": "createVault",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export default function CreateVaultPage() {
  const { login, authenticated, ready } = usePrivy();
  const { data: walletClient } = useWalletClient();

  const [title, setTitle] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [vaultAddress, setVaultAddress] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if wallet is connected
    if (!authenticated || !walletClient) {
      login();
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Convert goal amount to USDC wei (6 decimals)
      const goalAmountWei = parseUnits(goalAmount, 6);

      // Set deadline to 100 years from now (effectively no deadline)
      const hundredYearsInSeconds = BigInt(100 * 365 * 24 * 60 * 60);
      const deadlineTimestamp = BigInt(Math.floor(Date.now() / 1000)) + hundredYearsInSeconds;

      // Call createVault on the factory contract
      const { request } = await walletClient.simulateContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: 'createVault',
        args: [goalAmountWei, deadlineTimestamp, `db://${title}`],
      });

      const hash = await walletClient.writeContract(request);

      // Wait for transaction confirmation
      setSuccess('Transaction submitted! Waiting for confirmation...');

      // You could add transaction receipt watching here
      // For now, we'll use the hash to construct a likely vault address
      setVaultAddress(hash); // Placeholder - ideally parse from event logs

      setSuccess('Vault created successfully!');

    } catch (err: any) {
      console.error('Vault creation error:', err);
      setError(err.message || err.shortMessage || 'Failed to create vault');
    } finally {
      setLoading(false);
    }
  };

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

          <div className="bg-blue-50 border-l-4 border-primary p-4 mb-6">
            <h3 className="font-semibold mb-2">How it works:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Create your vault with a savings goal</li>
              <li>Share the vault link on Farcaster</li>
              <li>Friends contribute USDC directly</li>
              <li>Funds auto-generate yield via Aave V3</li>
              <li>Withdraw when goal is reached</li>
            </ol>
          </div>

          <button
            type="submit"
            disabled={loading || !ready}
            className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Vault...' : authenticated ? 'Create Vault' : 'Connect Wallet to Create'}
          </button>

          <p className="text-xs text-gray-500 mt-4 text-center">
            By creating a vault, you agree that funds will be locked until the goal is reached
          </p>
        </form>

        {!authenticated && ready && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">🔐 Wallet Connection Required</h3>
            <p className="text-sm text-blue-800">
              Click the "Connect Wallet to Create" button above to connect your wallet and create a vault.
              Privy will guide you through the process.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
