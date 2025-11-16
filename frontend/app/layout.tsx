import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { FarcasterProvider } from '@/components/FarcasterProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Banka - Social Savings Vaults',
  description: 'Group savings with automated yield on Base',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FarcasterProvider>
          {children}
        </FarcasterProvider>
      </body>
    </html>
  )
}
