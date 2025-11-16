import { NextRequest, NextResponse } from 'next/server';
import { encodeFunctionData, parseUnits } from 'viem';

const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || '84532'; // Base Sepolia

// Vault ABI - contribute function
const VAULT_ABI = [
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'contribute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// USDC ABI - approve function
const USDC_ABI = [
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { searchParams } = new URL(req.url);

    const vaultAddress = searchParams.get('vault');
    const amount = searchParams.get('amount');
    const step = searchParams.get('step'); // 'approve' or 'contribute'

    if (!vaultAddress || !amount) {
      return NextResponse.json(
        { message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Convert amount to USDC wei (6 decimals)
    const amountWei = parseUnits(amount, 6);

    let calldata: `0x${string}`;
    let to: string;

    // Step 1: Approve USDC spending
    if (step === 'approve') {
      calldata = encodeFunctionData({
        abi: USDC_ABI,
        functionName: 'approve',
        args: [vaultAddress as `0x${string}`, amountWei],
      });
      to = USDC_ADDRESS;
    }
    // Step 2: Contribute to vault
    else {
      calldata = encodeFunctionData({
        abi: VAULT_ABI,
        functionName: 'contribute',
        args: [amountWei],
      });
      to = vaultAddress;
    }

    // Return transaction data in Farcaster Frame transaction format
    const response = {
      chainId: `eip155:${CHAIN_ID}`,
      method: 'eth_sendTransaction',
      params: {
        abi: step === 'approve' ? USDC_ABI : VAULT_ABI,
        to,
        data: calldata,
        value: '0',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating transaction:', error);
    return NextResponse.json(
      { message: 'Failed to generate transaction' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return new NextResponse('Method not allowed', { status: 405 });
}
