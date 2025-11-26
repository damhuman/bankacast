'use client';

import { useState } from 'react';
import { ConnectAccount } from '@coinbase/onchainkit/wallet';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';

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
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

interface ContributeModalProps {
  vaultAddress: string;
  vaultTitle: string;
  goalAmount: bigint;
  totalContributed: bigint;
  tokenAddress: string;
  tokenDecimals: number;
  tokenSymbol: string;
  onClose: () => void;
}

export default function ContributeModal({
  vaultAddress,
  vaultTitle,
  goalAmount,
  totalContributed,
  tokenAddress,
  tokenDecimals,
  tokenSymbol,
  onClose,
}: ContributeModalProps) {
  const { address, isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'input' | 'approve' | 'contribute'>('input');

  const isETH = tokenAddress === '0x0000000000000000000000000000000000000000';
  const remaining = parseFloat(formatUnits(goalAmount - totalContributed, tokenDecimals));

  const handleApprove = () => {
    if (!amount || parseFloat(amount) <= 0) return;

    const amountWei = parseUnits(amount, tokenDecimals);
    setStep('approve');

    writeContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [vaultAddress as `0x${string}`, amountWei],
    });
  };

  const handleContribute = () => {
    if (!amount || parseFloat(amount) <= 0) return;

    const amountWei = parseUnits(amount, tokenDecimals);
    setStep('contribute');

    if (isETH) {
      // For ETH vaults, send ETH as msg.value
      writeContract({
        address: vaultAddress as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'contribute',
        args: [amountWei],
        value: amountWei,
      });
    } else {
      // For ERC20 vaults, just call contribute (no msg.value)
      writeContract({
        address: vaultAddress as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'contribute',
        args: [amountWei],
      });
    }
  };

  // Auto-proceed to contribute after approval (ERC20 only)
  if (step === 'approve' && isSuccess && !isETH) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Contribute to Vault</h2>
            <p className="text-sm text-gray-600 mt-1">{vaultTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-blue-100">
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-semibold text-gray-900">
              {((Number(formatUnits(totalContributed, tokenDecimals)) / Number(formatUnits(goalAmount, tokenDecimals))) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{
                width: `${Math.min((Number(formatUnits(totalContributed, tokenDecimals)) / Number(formatUnits(goalAmount, tokenDecimals))) * 100, 100)}%`
              }}
            />
          </div>
          <p className="text-xs text-gray-600">
            {formatUnits(totalContributed, tokenDecimals)} / {formatUnits(goalAmount, tokenDecimals)} {tokenSymbol} raised
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
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Contribution Amount
              </label>
              <div className="relative">
                {tokenSymbol === 'USDC' && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg">
                    $
                  </span>
                )}
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={tokenDecimals === 18 ? '0.0001' : '0.01'}
                  step={tokenDecimals === 18 ? '0.001' : '0.01'}
                  placeholder={tokenDecimals === 18 ? '0.1' : '10.00'}
                  className={`w-full ${tokenSymbol === 'USDC' ? 'pl-7' : 'pl-4'} pr-20 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-lg font-semibold`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                  {tokenSymbol}
                </span>
              </div>

              {/* Quick preset buttons */}
              <div className="flex gap-2 mt-3">
                {tokenSymbol === 'USDC' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setAmount('10')}
                      className="flex-1 px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      $10
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmount('50')}
                      className="flex-1 px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      $50
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmount('100')}
                      className="flex-1 px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      $100
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmount('500')}
                      className="flex-1 px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      $500
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setAmount('0.00001')}
                      className="flex-1 px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      0.00001
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmount('0.001')}
                      className="flex-1 px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      0.001
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmount('0.01')}
                      className="flex-1 px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      0.01
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmount('0.1')}
                      className="flex-1 px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      0.1
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmount('1')}
                      className="flex-1 px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      1.0
                    </button>
                  </>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-2">
                💡 {remaining > 0
                  ? `${remaining.toFixed(tokenDecimals === 18 ? 4 : 2)} ${tokenSymbol} remaining to reach goal`
                  : `Goal reached! You can still contribute to support more`}
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={isETH || step !== 'input' ? handleContribute : handleApprove}
                disabled={isPending || !amount || parseFloat(amount) <= 0}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
              >
                {isPending
                  ? step === 'approve'
                    ? 'Approving...'
                    : 'Contributing...'
                  : isETH
                  ? 'Contribute'
                  : step === 'approve'
                  ? 'Approve & Contribute'
                  : 'Contribute'}
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center leading-relaxed">
              {isETH
                ? '🔐 You will need to confirm the ETH transaction in your wallet'
                : `🔐 You will approve ${tokenSymbol} spend and confirm the contribution (2 transactions)`
              }
            </p>
          </>
        )}
      </div>
    </div>
  );
}
