import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const vaultAddress = searchParams.get('vault');

  if (!vaultAddress) {
    return new Response('Missing vault address', { status: 400 });
  }

  // Fetch vault data
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

  let vault;
  try {
    const response = await fetch(`${apiUrl}/api/vaults/${vaultAddress}`);
    if (!response.ok) {
      throw new Error('Vault not found');
    }
    vault = await response.json();
  } catch (error) {
    // Return placeholder image if vault not found
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: 60,
            fontWeight: 'bold',
          }}
        >
          <div style={{ marginBottom: '20px' }}>💰</div>
          <div>Vault Not Found</div>
          <div style={{ fontSize: 32, marginTop: '20px', opacity: 0.8 }}>
            Please check the vault address
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }

  const progress = vault.progress || 0;
  const current = (vault.total_contributed / 1e6).toFixed(2);
  const goal = (vault.goal_amount / 1e6).toFixed(2);
  const contributors = vault.contributors?.length || 0;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '80px',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '60px',
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 'bold',
              color: 'white',
              marginRight: '20px',
            }}
          >
            Banka
          </div>
          <div
            style={{
              fontSize: 28,
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            💰 Social Savings
          </div>
        </div>

        {/* Title Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '32px',
            padding: '60px',
            marginBottom: '50px',
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: 52,
              fontWeight: 'bold',
              color: '#1a1a2e',
              marginBottom: '40px',
              lineHeight: 1.2,
            }}
          >
            {vault.title || 'Savings Vault'}
          </div>

          {/* Progress Section */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 'bold',
                color: '#667eea',
                marginRight: '30px',
              }}
            >
              {progress}%
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  color: '#666',
                  marginBottom: '12px',
                }}
              >
                Progress to Goal
              </div>
              {/* Progress bar */}
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  height: '24px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    width: `${progress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ fontSize: 26, color: '#888', marginBottom: '8px' }}>
                💵 Raised
              </div>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 'bold',
                  color: '#667eea',
                }}
              >
                ${current}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ fontSize: 26, color: '#888', marginBottom: '8px' }}>
                🎯 Goal
              </div>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 'bold',
                  color: '#1a1a2e',
                }}
              >
                ${goal}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ fontSize: 26, color: '#888', marginBottom: '8px' }}>
                👥 Contributors
              </div>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 'bold',
                  color: '#1a1a2e',
                }}
              >
                {contributors}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: 32,
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 500,
              marginRight: '20px',
            }}
          >
            Powered by Aave V3 on Base
          </div>
          <div
            style={{
              fontSize: 28,
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            🔒 Trustless & Secure
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
