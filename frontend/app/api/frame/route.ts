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

  // Prepare display values
  const title = vault.title || 'Savings Vault';
  const description = vault.description || 'Join this social savings vault on Base';
  const progress = vault.progress || 0;
  const raised = (vault.total_contributed / 1e6).toFixed(2);
  const goal = (vault.goal_amount / 1e6).toFixed(2);
  const contributors = vault.contributors?.length || 0;

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

        <title>${title} - Banka</title>
        <meta name="description" content="${description}" />

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
              <div class="stat-value">$${raised}</div>
            </div>
            <div class="stat">
              <div class="stat-label">🎯 Goal</div>
              <div class="stat-value">$${goal}</div>
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
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Handle Frame button clicks
  // For now, just return the same frame
  return GET(req);
}
