'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ConnectAccount } from '@coinbase/onchainkit/wallet';
import { useAccount, useWriteContract, useSwitchChain, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, decodeEventLog, isAddress } from 'viem';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;
const WETH_ADDRESS = process.env.NEXT_PUBLIC_WETH_ADDRESS as `0x${string}`;
const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '84532');

const TOKEN_CONFIG = {
  USDC: {
    address: USDC_ADDRESS,
    decimals: 6,
    symbol: 'USDC',
    icon: '💵',
    name: 'USD Coin'
  },
  ETH: {
    address: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    decimals: 18,
    symbol: 'ETH',
    icon: '⟠',
    name: 'Ethereum'
  }
} as const;

const FACTORY_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "goalAmount", "type": "uint256" },
      { "internalType": "string", "name": "metadataURI", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "uint8", "name": "tokenDecimals", "type": "uint8" },
      { "internalType": "address", "name": "beneficiary", "type": "address" }
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
      { "indexed": false, "internalType": "string", "name": "metadataURI", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "description", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "token", "type": "address" },
      { "indexed": false, "internalType": "uint8", "name": "tokenDecimals", "type": "uint8" },
      { "indexed": false, "internalType": "address", "name": "beneficiary", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "vaultIndex", "type": "uint256" }
    ],
    "name": "VaultCreated",
    "type": "event"
  }
] as const;

export default function CreateVaultPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { address, isConnected, chain } = useAccount();
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { switchChain } = useSwitchChain();
  const { data: receipt, isSuccess } = useWaitForTransactionReceipt({ hash });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState<'USDC' | 'ETH'>('USDC');
  const [useBeneficiary, setUseBeneficiary] = useState(false);
  const [beneficiaryAddress, setBeneficiaryAddress] = useState('');

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
    if (!isConnected || !address) {
      return;
    }

    // Check if on correct chain - if not, switch automatically
    if (chain?.id !== CHAIN_ID) {
      console.log('Switching to Base Sepolia...');
      switchChain({ chainId: CHAIN_ID });
      return;
    }

    // Validate beneficiary address if specified
    let finalBeneficiary: `0x${string}` = '0x0000000000000000000000000000000000000000';
    if (useBeneficiary) {
      if (!beneficiaryAddress || !isAddress(beneficiaryAddress)) {
        alert(t('invalidAddress'));
        return;
      }
      finalBeneficiary = beneficiaryAddress as `0x${string}`;
    }

    // Get token configuration
    const tokenConfig = TOKEN_CONFIG[selectedToken];

    // Convert goal amount to token wei (6 or 18 decimals)
    const goalAmountWei = parseUnits(goalAmount, tokenConfig.decimals);

    console.log('Creating vault with params:', {
      address: FACTORY_ADDRESS,
      goalAmountWei: goalAmountWei.toString(),
      metadataURI: `db://${title}`,
      description,
      token: tokenConfig.address,
      decimals: tokenConfig.decimals,
      beneficiary: finalBeneficiary,
      chainId: CHAIN_ID,
    });

    // Call createVault on the factory contract
    writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'createVault',
      args: [goalAmountWei, `db://${title}`, description, tokenConfig.address, tokenConfig.decimals, finalBeneficiary],
    });
  };

  return (
    <main className="min-h-screen p-6 md:p-12 relative overflow-hidden">
      {/* Background gradient treatment - matching homepage */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 -z-10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,82,255,0.05),transparent_50%)] -z-10"></div>

      <div className="max-w-2xl mx-auto">
        {/* Enhanced back link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-blue-600 transition-colors font-medium group"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            <span>{t('backToHome')}</span>
          </Link>
        </div>

        {/* Header with better hierarchy */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {t('createNewBanka')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('createBankaDesc')}
          </p>
        </div>

        {/* Enhanced error message */}
        {writeError && (
          <div className="bg-red-50 border-2 border-red-200 text-red-800 px-5 py-4 rounded-xl mb-6 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold text-base">{t('transactionError')}</p>
                <p className="text-sm mt-1 leading-relaxed">{writeError.message || t('transactionFailed')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced success message */}
        {hash && (
          <div className="bg-green-50 border-2 border-green-200 text-green-800 px-5 py-4 rounded-xl mb-6 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div className="flex-1">
                <p className="font-bold text-base">{t('transactionSubmitted')}</p>
                <p className="text-sm mt-2 font-mono break-all bg-white/50 px-2 py-1 rounded">
                  {hash}
                </p>
                <a
                  href={`https://sepolia.basescan.org/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-900 mt-3 transition-colors"
                >
                  {t('viewOnBaseScan')}
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced form card */}
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
          {/* Banka Title */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              {t('bankaTitle')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-gray-300"
              placeholder={t('bankaTitlePlaceholder')}
            />
          </div>

          {/* Description */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              {t('description')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-gray-300 resize-none"
              placeholder={t('descriptionPlaceholder')}
            />
            <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
              <span>💡</span>
              {t('descriptionHint')}
            </p>
          </div>

          {/* Token Selector */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              {t('selectToken')}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedToken('USDC')}
                className={`p-5 rounded-xl border-2 transition-all duration-200 ${
                  selectedToken === 'USDC'
                    ? 'border-primary bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-4xl mb-2">{TOKEN_CONFIG.USDC.icon}</div>
                <div className="font-bold text-lg">{TOKEN_CONFIG.USDC.symbol}</div>
                <div className="text-xs text-gray-500 mt-1">{TOKEN_CONFIG.USDC.name}</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedToken('ETH')}
                className={`p-5 rounded-xl border-2 transition-all duration-200 ${
                  selectedToken === 'ETH'
                    ? 'border-primary bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-4xl mb-2">{TOKEN_CONFIG.ETH.icon}</div>
                <div className="font-bold text-lg">{TOKEN_CONFIG.ETH.symbol}</div>
                <div className="text-xs text-gray-500 mt-1">{TOKEN_CONFIG.ETH.name}</div>
              </button>
            </div>
          </div>

          {/* Goal Amount */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              {t('goalAmount')} ({selectedToken})
            </label>
            <div className="relative">
              {selectedToken === 'USDC' && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg">
                  $
                </span>
              )}
              <input
                type="number"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                required
                min="0.0001"
                step={selectedToken === 'ETH' ? '0.001' : '0.01'}
                className={`w-full ${selectedToken === 'USDC' ? 'pl-8' : 'pl-4'} pr-20 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-gray-300 text-lg font-semibold`}
                placeholder={selectedToken === 'ETH' ? '1.0' : '1000'}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                {selectedToken}
              </span>
            </div>

            {/* Quick preset buttons */}
            <div className="flex gap-2 mt-3">
              {selectedToken === 'USDC' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setGoalAmount('100')}
                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    $100
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoalAmount('500')}
                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    $500
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoalAmount('1000')}
                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    $1,000
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoalAmount('5000')}
                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    $5,000
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setGoalAmount('0.01')}
                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    0.01 ETH
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoalAmount('0.1')}
                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    0.1 ETH
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoalAmount('1')}
                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    1 ETH
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoalAmount('5')}
                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    5 ETH
                  </button>
                </>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-2">
              💡 {t('goalAmountHint')}
            </p>
          </div>

          {/* Beneficiary Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="useBeneficiary"
                checked={useBeneficiary}
                onChange={(e) => setUseBeneficiary(e.target.checked)}
                className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="useBeneficiary" className="text-sm font-semibold text-gray-900">
                {t('sendToDifferentAddress')}
              </label>
            </div>

            {useBeneficiary && (
              <div className="mt-3">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  {t('beneficiaryAddress')}
                </label>
                <input
                  type="text"
                  value={beneficiaryAddress}
                  onChange={(e) => setBeneficiaryAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-gray-300 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <span>💡</span>
                  {t('beneficiaryHint')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {t('beneficiaryUseCases')}
                </p>
              </div>
            )}
          </div>

          {/* Enhanced "How it works" section */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-xl">✨</span>
              {t('howItWorks')}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <p className="text-sm text-gray-700 leading-relaxed">{t('step1')}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <p className="text-sm text-gray-700 leading-relaxed">{t('step2')}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <p className="text-sm text-gray-700 leading-relaxed">{t('step3')}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <p className="text-sm text-gray-700 leading-relaxed">{t('step4')}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
                <p className="text-sm text-gray-700 leading-relaxed">{t('step5')}</p>
              </div>
            </div>
          </div>

          {/* Enhanced button section */}
          {!isConnected ? (
            <div className="w-full flex justify-center">
              <ConnectAccount />
            </div>
          ) : (
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  {t('creating')}
                </span>
              ) : (
                t('createBanka')
              )}
            </button>
          )}

          <p className="text-sm text-gray-500 mt-5 text-center leading-relaxed">
            💡 You can withdraw funds once your goal is reached, or smash the vault early at any time
          </p>
        </form>
      </div>
    </main>
  );
}
