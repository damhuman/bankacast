'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ConnectAccount } from '@coinbase/onchainkit/wallet';
import { useAccount, useWriteContract, useSwitchChain, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, decodeEventLog } from 'viem';

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS;
const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '84532');

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
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "vault", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "goalAmount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "deadline", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "metadataURI", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "vaultIndex", "type": "uint256" }
    ],
    "name": "VaultCreated",
    "type": "event"
  }
] as const;

export default function CreateVaultPage() {
  const router = useRouter();
  const { address, isConnected, chain } = useAccount();
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { switchChain } = useSwitchChain();
  const { data: receipt, isSuccess } = useWaitForTransactionReceipt({ hash });

  const [title, setTitle] = useState('');
  const [goalAmount, setGoalAmount] = useState('');

  // Redirect to vault page after transaction is confirmed
  useEffect(() => {
    console.log('Redirect effect triggered:', { isSuccess, hasReceipt: !!receipt });

    if (isSuccess && receipt) {
      console.log('Transaction receipt:', receipt);
      console.log('Receipt logs:', receipt.logs);

      // Get VaultCreated event from logs
      const vaultCreatedEvent = receipt.logs.find((log) => {
        try {
          const decoded = decodeEventLog({
            abi: FACTORY_ABI,
            data: log.data,
            topics: log.topics,
          });
          console.log('Decoded event:', decoded);
          return decoded.eventName === 'VaultCreated';
        } catch (e) {
          console.log('Failed to decode log:', e);
          return false;
        }
      });

      console.log('VaultCreated event found:', vaultCreatedEvent);

      if (vaultCreatedEvent) {
        const decoded = decodeEventLog({
          abi: FACTORY_ABI,
          data: vaultCreatedEvent.data,
          topics: vaultCreatedEvent.topics,
        });
        console.log('Final decoded event:', decoded);
        // @ts-ignore
        const vaultAddress = decoded.args.vault;
        console.log('Redirecting to vault:', vaultAddress);
        router.push(`/vault/${vaultAddress}`);
      } else {
        console.error('VaultCreated event not found in receipt logs');
      }
    }
  }, [isSuccess, receipt, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if wallet is connected
    if (!isConnected) {
      return;
    }

    // Check if on correct chain - if not, switch automatically
    if (chain?.id !== CHAIN_ID) {
      console.log('Switching to Base Sepolia...');
      switchChain({ chainId: CHAIN_ID });
      return;
    }

    // Convert goal amount to USDC wei (6 decimals)
    const goalAmountWei = parseUnits(goalAmount, 6);

    // Set deadline to 100 years from now (effectively no deadline)
    const hundredYearsInSeconds = BigInt(100 * 365 * 24 * 60 * 60);
    const deadlineTimestamp = BigInt(Math.floor(Date.now() / 1000)) + hundredYearsInSeconds;

    console.log('Creating vault with params:', {
      address: FACTORY_ADDRESS,
      goalAmountWei: goalAmountWei.toString(),
      deadlineTimestamp: deadlineTimestamp.toString(),
      metadataURI: `db://${title}`,
      chainId: CHAIN_ID,
    });

    // Call createVault on the factory contract
    writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'createVault',
      args: [goalAmountWei, deadlineTimestamp, `db://${title}`],
    });
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

        {writeError && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            <p className="font-semibold">Error</p>
            <p className="text-sm mt-1">{writeError.message || 'Transaction failed'}</p>
          </div>
        )}

        {hash && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-6">
            <p className="font-semibold">Transaction submitted!</p>
            <p className="text-sm mt-1 font-mono break-all">Hash: {hash}</p>
            <a
              href={`https://sepolia.basescan.org/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-700 hover:underline mt-2 inline-block"
            >
              View on BaseScan →
            </a>
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

          {!isConnected ? (
            <div className="w-full flex justify-center">
              <ConnectAccount />
            </div>
          ) : (
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Waiting for signature...' : 'Create Vault'}
            </button>
          )}

          <p className="text-xs text-gray-500 mt-4 text-center">
            By creating a vault, you agree that funds will be locked until the goal is reached
          </p>
        </form>
      </div>
    </main>
  );
}
