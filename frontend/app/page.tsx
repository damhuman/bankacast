import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl text-center">
        <div className="mb-8 flex justify-center">
          <Image
            src="/icon.png"
            alt="Banka Logo"
            width={200}
            height={200}
            priority
            className="drop-shadow-lg"
          />
        </div>
        <p className="text-xl text-gray-600 mb-8">
          Social savings vaults with automated yield on Base
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/create"
            className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Create Vault
          </Link>

          <Link
            href="/discover"
            className="bg-gray-100 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Discover Vaults
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 text-left">
          <div>
            <div className="text-3xl font-bold mb-2">💰</div>
            <h3 className="font-semibold mb-1">Auto Yield</h3>
            <p className="text-sm text-gray-600">
              Deposits auto-generate yield through Aave V3
            </p>
          </div>

          <div>
            <div className="text-3xl font-bold mb-2">👥</div>
            <h3 className="font-semibold mb-1">Social Proof</h3>
            <p className="text-sm text-gray-600">
              See who contributed and track progress together
            </p>
          </div>

          <div>
            <div className="text-3xl font-bold mb-2">🔒</div>
            <h3 className="font-semibold mb-1">Trustless</h3>
            <p className="text-sm text-gray-600">
              Smart contracts ensure funds are safe
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
