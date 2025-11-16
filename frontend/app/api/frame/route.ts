import { NextRequest, NextResponse } from 'next/server';

const FRAME_VERSION = 'vNext';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const vaultAddress = searchParams.get('vault');

  if (!vaultAddress) {
    return new NextResponse('Missing vault address', { status: 400 });
  }

  // Get the app URL from request headers (works in both dev and prod)
  const protocol = req.headers.get('x-forwarded-proto') || 'http';
  const host = req.headers.get('host') || 'localhost:3001';
  const APP_URL = `${protocol}://${host}`;

  // Fetch vault data from backend
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

  let vault;
  try {
    const response = await fetch(`${apiUrl}/api/vaults/${vaultAddress}`);
    if (!response.ok) {
      throw new Error('Vault not found');
    }
    vault = await response.json();
  } catch (error) {
    return new NextResponse('Vault not found', { status: 404 });
  }

  // Generate Frame HTML
  const frameHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <!-- Frame metadata -->
        <meta property="fc:frame" content="${FRAME_VERSION}" />
        <meta property="fc:frame:image" content="${APP_URL}/api/frame/image?vault=${vaultAddress}" />
        <meta property="fc:frame:image:aspect_ratio" content="1:1" />

        <!-- Buttons -->
        <meta property="fc:frame:button:1" content="💰 $10" />
        <meta property="fc:frame:button:1:action" content="post" />
        <meta property="fc:frame:button:1:target" content="${APP_URL}/api/frame/contribute?vault=${vaultAddress}&amount=10" />

        <meta property="fc:frame:button:2" content="💵 $25" />
        <meta property="fc:frame:button:2:action" content="post" />
        <meta property="fc:frame:button:2:target" content="${APP_URL}/api/frame/contribute?vault=${vaultAddress}&amount=25" />

        <meta property="fc:frame:button:3" content="💸 $50" />
        <meta property="fc:frame:button:3:action" content="post" />
        <meta property="fc:frame:button:3:target" content="${APP_URL}/api/frame/contribute?vault=${vaultAddress}&amount=50" />

        <meta property="fc:frame:button:4" content="🔗 Details" />
        <meta property="fc:frame:button:4:action" content="link" />
        <meta property="fc:frame:button:4:target" content="${APP_URL}/vault/${vaultAddress}" />

        <meta property="fc:frame:post_url" content="${APP_URL}/api/frame?vault=${vaultAddress}" />

        <title>${vault.title || 'Savings Vault'}</title>
        <meta name="description" content="${vault.description || 'Contribute to this savings vault'}" />
      </head>
      <body>
        <h1>${vault.title}</h1>
        <p>${vault.description}</p>
        <p>Progress: ${vault.progress}% (${vault.total_contributed / 1e6} / ${vault.goal_amount / 1e6} USDC)</p>
      </body>
    </html>
  `;

  return new NextResponse(frameHtml, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Handle Frame button clicks
  // For now, just return the same frame
  return GET(req);
}
