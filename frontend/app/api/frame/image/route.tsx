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
            backgroundColor: '#0052FF',
            color: 'white',
            fontSize: 60,
            fontWeight: 'bold',
          }}
        >
          <div>Vault Not Found</div>
        </div>
      ),
      {
        width: 1200,
        height: 1200,
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
          backgroundColor: '#ffffff',
          padding: '80px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            fontSize: 48,
            fontWeight: 'bold',
            color: '#0A0B0D',
            marginBottom: '40px',
          }}
        >
          💰 {vault.title || 'Savings Vault'}
        </div>

        {/* Progress */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              fontSize: 36,
              color: '#666',
              marginBottom: '20px',
            }}
          >
            Progress: {progress}%
          </div>

          {/* Progress bar */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '40px',
              backgroundColor: '#E5E5E5',
              borderRadius: '20px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#0052FF',
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ fontSize: 28, color: '#666' }}>Raised</div>
            <div style={{ fontSize: 48, fontWeight: 'bold', color: '#0052FF' }}>
              ${current}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ fontSize: 28, color: '#666' }}>Goal</div>
            <div style={{ fontSize: 48, fontWeight: 'bold', color: '#0A0B0D' }}>
              ${goal}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ fontSize: 28, color: '#666' }}>Contributors</div>
            <div style={{ fontSize: 48, fontWeight: 'bold', color: '#0A0B0D' }}>
              {contributors}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            marginTop: 'auto',
            fontSize: 32,
            color: '#999',
          }}
        >
          👥 Social Savings on Base
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 1200,
    }
  );
}
