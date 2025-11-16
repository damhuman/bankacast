import { NextRequest, NextResponse } from 'next/server';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || '0x0000000000000000000000000000000000000000';
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { searchParams } = new URL(req.url);

  const vaultAddress = searchParams.get('vault');
  const amount = searchParams.get('amount');

  if (!vaultAddress || !amount) {
    return new NextResponse('Missing parameters', { status: 400 });
  }

  // Convert USDC amount to wei (6 decimals)
  const amountWei = BigInt(Number(amount) * 1e6).toString();

  // Get user's Farcaster ID from frame message
  const fid = body?.untrustedData?.fid;
  const address = body?.untrustedData?.address;

  // Generate transaction for contributing
  // User needs to:
  // 1. Approve USDC
  // 2. Call vault.contribute()

  const transaction = {
    chainId: `eip155:${process.env.NEXT_PUBLIC_CHAIN_ID || '84532'}`, // Base Sepolia
    method: 'eth_sendTransaction',
    params: {
      abi: [
        {
          inputs: [{ name: 'amount', type: 'uint256' }],
          name: 'contribute',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      to: vaultAddress,
      data: `0x3f5a49be${amountWei.padStart(64, '0')}`, // contribute(uint256)
      value: '0',
    },
  };

  // Return success frame with transaction
  const frameHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${APP_URL}/api/frame/success?vault=${vaultAddress}&amount=${amount}" />
        <meta property="fc:frame:button:1" content="✅ Contribute $${amount}" />
        <meta property="fc:frame:button:1:action" content="tx" />
        <meta property="fc:frame:button:1:target" content="${APP_URL}/api/frame/tx?vault=${vaultAddress}&amount=${amount}" />
        <meta property="fc:frame:button:2" content="🔙 Back" />
        <meta property="fc:frame:button:2:action" content="post" />
        <meta property="fc:frame:button:2:target" content="${APP_URL}/api/frame?vault=${vaultAddress}" />
        <title>Contribute $${amount}</title>
      </head>
      <body>
        <h1>Contribute $${amount} USDC</h1>
        <p>Click to send transaction</p>
      </body>
    </html>
  `;

  return new NextResponse(frameHtml, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

export async function GET(req: NextRequest) {
  return new NextResponse('Method not allowed', { status: 405 });
}
