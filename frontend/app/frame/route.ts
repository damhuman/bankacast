import { NextRequest, NextResponse } from 'next/server';

const FRAME_VERSION = 'vNext';

export async function GET(req: NextRequest) {
  // Get the app URL from request headers (works in both dev and prod)
  const protocol = req.headers.get('x-forwarded-proto') || 'http';
  const host = req.headers.get('host') || 'localhost:3000';
  const APP_URL = `${protocol}://${host}`;

  // Generate Frame HTML for home page
  const frameHtml = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">

      <!-- Frame metadata -->
      <meta property="fc:frame" content="${FRAME_VERSION}" />
      <meta property="fc:frame:image" content="${APP_URL}/splash.png" />
      <meta property="fc:frame:image:aspect_ratio" content="1:1" />

      <!-- Buttons -->
      <meta property="fc:frame:button:1" content="🚀 Open Banka" />
      <meta property="fc:frame:button:1:action" content="link" />
      <meta property="fc:frame:button:1:target" content="${APP_URL}" />

      <meta property="fc:frame:button:2" content="💰 Create Vault" />
      <meta property="fc:frame:button:2:action" content="link" />
      <meta property="fc:frame:button:2:target" content="${APP_URL}/create" />

      <meta property="fc:frame:button:3" content="🔍 Discover" />
      <meta property="fc:frame:button:3:action" content="link" />
      <meta property="fc:frame:button:3:target" content="${APP_URL}/discover" />

      <meta property="fc:frame:post_url" content="${APP_URL}/frame" />

      <title>Banka - Social Savings on Base</title>
      <meta name="description" content="Create donation vaults that automatically earn yield through Aave. Share on Farcaster with full onchain transparency." />

      <!-- Open Graph -->
      <meta property="og:title" content="Banka - Social Savings on Base" />
      <meta property="og:description" content="Create donation vaults that automatically earn yield through Aave" />
      <meta property="og:image" content="${APP_URL}/splash.png" />

      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
          background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
          color: white;
          line-height: 1.6;
        }
        .card {
          background: rgba(255, 255, 255, 0.95);
          color: #1a1a2e;
          border-radius: 20px;
          padding: 40px;
          margin-top: 20px;
          text-align: center;
        }
        h1 {
          margin: 0 0 20px 0;
          font-size: 42px;
          font-weight: bold;
        }
        .tagline {
          font-size: 20px;
          color: #6366F1;
          margin: 20px 0;
        }
        .features {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-top: 30px;
          text-align: left;
        }
        .feature {
          background: #F9FAFB;
          padding: 20px;
          border-radius: 12px;
        }
        .feature-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 8px;
          color: #1F2937;
        }
        .feature-desc {
          font-size: 14px;
          color: #6B7280;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>💰 Banka</h1>
        <div class="tagline">Fundraising with Auto Yield</div>
        <p>Create donation vaults in ETH or USDC that automatically earn yield through Aave. Share on Farcaster and watch contributions grow with full onchain transparency.</p>

        <div class="features">
          <div class="feature">
            <div class="feature-title">💰 Auto Yield</div>
            <div class="feature-desc">Your deposits automatically earn yield via Aave V3 on Base</div>
          </div>
          <div class="feature">
            <div class="feature-title">👥 Social Proof</div>
            <div class="feature-desc">See all contributors and build trust through transparency</div>
          </div>
          <div class="feature">
            <div class="feature-title">🔒 Trustless</div>
            <div class="feature-desc">Smart contracts ensure funds are safe and verifiable onchain</div>
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
  // Handle Frame button clicks
  return GET(req);
}
