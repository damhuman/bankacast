import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Log the Frame interaction for debugging
    console.log('Frame action received:', body);

    // Get the app URL
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const APP_URL = `${protocol}://${host}`;

    // Return the same frame (or could redirect to different actions)
    const frameHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${APP_URL}/splash.png" />
        <meta property="fc:frame:image:aspect_ratio" content="1:1" />

        <meta property="fc:frame:button:1" content="🚀 Open Banka" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content="${APP_URL}" />

        <meta property="fc:frame:button:2" content="💰 Create Vault" />
        <meta property="fc:frame:button:2:action" content="link" />
        <meta property="fc:frame:button:2:target" content="${APP_URL}/create" />

        <meta property="fc:frame:button:3" content="🔍 Discover" />
        <meta property="fc:frame:button:3:action" content="link" />
        <meta property="fc:frame:button:3:target" content="${APP_URL}/discover" />

        <meta property="fc:frame:post_url" content="${APP_URL}/api/frame-action" />

        <title>Banka</title>
      </head>
      <body>
        <h1>Banka - Social Savings on Base</h1>
      </body>
    </html>
    `;

    return new NextResponse(frameHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error handling frame action:', error);
    return new NextResponse('Error processing frame action', { status: 500 });
  }
}
