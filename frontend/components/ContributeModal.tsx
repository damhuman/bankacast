'use client';

import { useState } from 'react';
import { ConnectAccount } from '@coinbase/onchainkit/wallet';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';

const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;

const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const VAULT_ABI = [
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'contribute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

interface ContributeModalProps {
  vaultAddress: string;
  vaultTitle: string;
  goalAmount: number;
  totalContributed: number;
  onClose: () => void;
}

export default function ContributeModal({
  vaultAddress,
  vaultTitle,
  goalAmount,
  totalContributed,
  onClose,
}: ContributeModalProps) {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'input' | 'approve' | 'contribute'>('input');

  const maxContribution = (goalAmount - totalContributed) / 1e6;

  const handleApprove = () => {
    if (!amount || parseFloat(amount) <= 0) return;

    const amountWei = parseUnits(amount, 6);
    setStep('approve');

    writeContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [vaultAddress as `0x${string}`, amountWei],
    });
  };

  const handleContribute = () => {
    if (!amount || parseFloat(amount) <= 0) return;

    const amountWei = parseUnits(amount, 6);
    setStep('contribute');

    writeContract({
      address: vaultAddress as `0x${string}`,
      abi: VAULT_ABI,
      functionName: 'contribute',
      args: [amountWei],
    });
  };

  // Auto-proceed to contribute after approval
  if (step === 'approve' && isSuccess) {
    setStep('contribute');
    handleContribute();
  }

  // Close modal on successful contribution
  if (step === 'contribute' && isSuccess) {
    setTimeout(() => {
      onClose();
      window.location.reload(); // Refresh to show updated data
    }, 2000);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Contribute to Vault</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Vault:</p>
          <p className="font-semibold">{vaultTitle}</p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Raised: ${(totalContributed / 1e6).toFixed(2)} / ${(goalAmount / 1e6).toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">
            Max contribution: ${maxContribution.toFixed(2)} USDC
          </p>
        </div>

        {writeError && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            <p className="text-sm">{writeError.message || 'Transaction failed'}</p>
          </div>
        )}

        {isSuccess && step === 'contribute' && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-4">
            <p className="font-semibold">Success!</p>
            <p className="text-sm">Your contribution has been recorded.</p>
          </div>
        )}

        {!isConnected ? (
          <div className="flex justify-center">
            <ConnectAccount />
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (USDC)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={maxContribution}
                min="0.01"
                step="0.01"
                placeholder="10.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={step === 'input' ? handleApprove : handleContribute}
                disabled={isPending || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxContribution}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending
                  ? step === 'approve'
                    ? 'Approving...'
                    : 'Contributing...'
                  : step === 'approve'
                  ? 'Approve & Contribute'
                  : 'Contribute'}
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              You will need to approve USDC spend and then confirm the contribution transaction
            </p>
          </>
        )}
      </div>
    </div>
  );
}
