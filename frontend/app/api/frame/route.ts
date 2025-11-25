import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, formatUnits } from 'viem';
import { baseSepolia } from 'viem/chains';

const FRAME_VERSION = 'vNext';
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.base.org';

const VAULT_ABI = [
  {
    "inputs": [],
    "name": "goalAmount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "metadataURI",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "description",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalContributed",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTokenInfo",
    "outputs": [
      { "internalType": "address", "name": "tokenAddress", "type": "address" },
      { "internalType": "uint8", "name": "decimals", "type": "uint8" },
      { "internalType": "string", "name": "symbol", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContributorCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

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

  // Create viem public client
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(RPC_URL),
  });

  try {
    // Fetch vault data from blockchain
    const [goalAmount, metadataURI, description, totalContributed, tokenInfo, contributorCount] = await Promise.all([
      publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'goalAmount',
      }),
      publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'metadataURI',
      }),
      publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'description',
      }),
      publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'totalContributed',
      }),
      publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'getTokenInfo',
      }),
      publicClient.readContract({
        address: vaultAddress as `0x${string}`,
        abi: VAULT_ABI,
        functionName: 'getContributorCount',
      }),
    ]);

    // Extract data
    const title = (metadataURI as string).replace('db://', '');
    const decimals = tokenInfo[1] as number;
    const symbol = tokenInfo[2] as string;
    const progress = goalAmount > 0n
      ? Math.floor((Number(totalContributed) * 100) / Number(goalAmount))
      : 0;
    const raised = parseFloat(formatUnits(totalContributed as bigint, decimals)).toFixed(decimals === 18 ? 4 : 2);
    const goal = parseFloat(formatUnits(goalAmount as bigint, decimals)).toFixed(decimals === 18 ? 4 : 2);
    const contributors = Number(contributorCount);

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
        <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />

        <!-- Buttons -->
        <meta property="fc:frame:button:1" content="💰 10 ${symbol}" />
        <meta property="fc:frame:button:1:action" content="post" />
        <meta property="fc:frame:button:1:target" content="${APP_URL}/api/frame/contribute?vault=${vaultAddress}&amount=10" />

        <meta property="fc:frame:button:2" content="💵 25 ${symbol}" />
        <meta property="fc:frame:button:2:action" content="post" />
        <meta property="fc:frame:button:2:target" content="${APP_URL}/api/frame/contribute?vault=${vaultAddress}&amount=25" />

        <meta property="fc:frame:button:3" content="💸 50 ${symbol}" />
        <meta property="fc:frame:button:3:action" content="post" />
        <meta property="fc:frame:button:3:target" content="${APP_URL}/api/frame/contribute?vault=${vaultAddress}&amount=50" />

        <meta property="fc:frame:button:4" content="🔗 Details" />
        <meta property="fc:frame:button:4:action" content="link" />
        <meta property="fc:frame:button:4:target" content="${APP_URL}/vault/${vaultAddress}" />

        <meta property="fc:frame:post_url" content="${APP_URL}/api/frame?vault=${vaultAddress}" />

        <title>${title} - Banka</title>
        <meta name="description" content="${description || 'Join this social savings vault on Base'}" />

        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            line-height: 1.6;
          }
          .card {
            background: rgba(255, 255, 255, 0.95);
            color: #1a1a2e;
            border-radius: 16px;
            padding: 30px;
            margin-top: 20px;
          }
          h1 {
            margin: 0 0 20px 0;
            font-size: 32px;
            font-weight: bold;
          }
          .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-top: 20px;
          }
          .stat {
            text-align: center;
          }
          .stat-label {
            font-size: 14px;
            color: #888;
            margin-bottom: 5px;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
          }
          .progress-bar {
            width: 100%;
            height: 12px;
            background: #e0e0e0;
            border-radius: 6px;
            overflow: hidden;
            margin: 10px 0 20px 0;
          }
          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            width: ${progress}%;
          }
        </style>
      </head>
      <body>
        <h1>💰 Banka</h1>
        <p>Social Savings Vaults on Base</p>

        <div class="card">
          <h2>${title}</h2>
          ${description ? `<p>${description}</p>` : ''}

          <div style="margin-top: 20px;">
            <strong style="font-size: 36px; color: #667eea;">${progress}%</strong>
            <span style="color: #666;"> Progress to Goal</span>
          </div>

          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>

          <div class="stats">
            <div class="stat">
              <div class="stat-label">💵 Raised</div>
              <div class="stat-value">${symbol === 'USDC' ? '$' : ''}${raised} ${symbol}</div>
            </div>
            <div class="stat">
              <div class="stat-label">🎯 Goal</div>
              <div class="stat-value">${symbol === 'USDC' ? '$' : ''}${goal} ${symbol}</div>
            </div>
            <div class="stat">
              <div class="stat-label">👥 Contributors</div>
              <div class="stat-value">${contributors}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

    return new NextResponse(frameHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error fetching vault:', error);
    return new NextResponse('Vault not found', { status: 404 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Handle Frame button clicks
  // For now, just return the same frame
  return GET(req);
}
