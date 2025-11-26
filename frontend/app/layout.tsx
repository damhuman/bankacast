import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { FarcasterProvider } from '@/components/FarcasterProvider'
import { Web3Provider } from '@/components/Web3Provider'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Banka - Social Savings Vaults on Base',
  description: 'Create savings vaults, share on Farcaster, and earn yield automatically via Aave V3. Support friends, fundraise for causes, or save for goals together.',
  keywords: ['savings', 'vault', 'DeFi', 'Aave', 'Base', 'Farcaster', 'yield', 'crowdfunding', 'fundraising', 'crypto'],
  authors: [{ name: 'Banka Team' }],
  creator: 'Banka',
  publisher: 'Banka',

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bankacast.netlify.app',
    title: 'Banka - Social Savings Vaults on Base',
    description: 'Create savings vaults, share on Farcaster, and earn yield automatically via Aave V3',
    siteName: 'Banka',
    images: [
      {
        url: '/splash.png',
        width: 512,
        height: 512,
        alt: 'Banka - Social Savings Vaults',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Banka - Social Savings Vaults on Base',
    description: 'Create savings vaults, share on Farcaster, and earn yield automatically via Aave V3',
    images: ['/splash.png'],
    creator: '@banka_fun',
  },

  // Mobile
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: '#3b82f6',

  // PWA
  manifest: '/manifest.json',

  // Icons
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },

  // Additional
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <Web3Provider>
            <FarcasterProvider>
              <LanguageSwitcher />
              {children}
            </FarcasterProvider>
          </Web3Provider>
        </LanguageProvider>
      </body>
    </html>
  )
}
