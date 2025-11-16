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

  // Get the app URL from request headers (works in both dev and prod)
  const protocol = req.headers.get('x-forwarded-proto') || 'http';
  const host = req.headers.get('host') || 'localhost:3001';
  const appUrl = `${protocol}://${host}`;

  // Return frame with two-step transaction flow
  // Step 1: Approve USDC
  // Step 2: Contribute to vault
  const frameHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${appUrl}/api/frame/image?vault=${vaultAddress}" />
        <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />

        <!-- Step 1: Approve USDC -->
        <meta property="fc:frame:button:1" content="1️⃣ Approve $${amount} USDC" />
        <meta property="fc:frame:button:1:action" content="tx" />
        <meta property="fc:frame:button:1:target" content="${appUrl}/api/frame/tx?vault=${vaultAddress}&amount=${amount}&step=approve" />

        <!-- Step 2: Contribute -->
        <meta property="fc:frame:button:2" content="2️⃣ Contribute $${amount}" />
        <meta property="fc:frame:button:2:action" content="tx" />
        <meta property="fc:frame:button:2:target" content="${appUrl}/api/frame/tx?vault=${vaultAddress}&amount=${amount}&step=contribute" />

        <!-- Back button -->
        <meta property="fc:frame:button:3" content="🔙 Back" />
        <meta property="fc:frame:button:3:action" content="post" />
        <meta property="fc:frame:button:3:target" content="${appUrl}/api/frame?vault=${vaultAddress}" />

        <meta property="fc:frame:post_url" content="${appUrl}/api/frame?vault=${vaultAddress}" />

        <title>Contribute $${amount}</title>
      </head>
      <body>
        <h1>Contribute $${amount} USDC</h1>
        <p>Step 1: Approve USDC spending</p>
        <p>Step 2: Contribute to vault</p>
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
