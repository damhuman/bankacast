import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';
import QRCode from 'qrcode-svg';
import { createPublicClient, http, formatUnits } from 'viem';
import { baseSepolia } from 'viem/chains';

export const runtime = 'edge';

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

// Generate inline SVG QR code as data URL for vault address
function generateQRCodeDataURL(vaultAddress: string): string {
  const qr = new QRCode({
    content: vaultAddress,
    padding: 1,
    width: 120,
    height: 120,
    color: '#000000',
    background: '#ffffff',
    ecl: 'M',
    join: true, // Use single path for compactness
  });
  const svgString = qr.svg();
  // Convert SVG to data URL
  const base64 = Buffer.from(svgString).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const vaultAddress = searchParams.get('vault');

  if (!vaultAddress) {
    return new Response('Missing vault address', { status: 400 });
  }

  const qrCodeDataURL = generateQRCodeDataURL(vaultAddress);

  // Create viem public client
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(RPC_URL),
  });

  try {
    // Fetch vault data from blockchain
    const [goalAmount, metadataURI, totalContributed, tokenInfo, contributorCount] = await Promise.all([
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

    const title = (metadataURI as string).replace('db://', '');
    const decimals = tokenInfo[1] as number;
    const symbol = tokenInfo[2] as string;
    const progress = goalAmount > 0n
      ? Math.floor((Number(totalContributed) * 100) / Number(goalAmount))
      : 0;
    const current = parseFloat(formatUnits(totalContributed as bigint, decimals)).toFixed(decimals === 18 ? 4 : 2);
    const goal = parseFloat(formatUnits(goalAmount as bigint, decimals)).toFixed(decimals === 18 ? 4 : 2);
    const contributors = Number(contributorCount);

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
              {title || 'Savings Vault'}
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
                  {symbol === 'USDC' ? '$' : ''}{current} {symbol}
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
                  {symbol === 'USDC' ? '$' : ''}{goal} {symbol}
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

          {/* Footer with QR Code */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
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

            {/* QR Code */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '16px',
              }}
            >
              <img
                src={qrCodeDataURL}
                width="120"
                height="120"
                alt="Vault QR"
                style={{ borderRadius: '8px' }}
              />
              <div
                style={{
                  fontSize: 16,
                  color: '#666',
                  marginTop: '8px',
                  fontWeight: 600,
                }}
              >
                Scan for Vault
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error fetching vault:', error);
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
}
