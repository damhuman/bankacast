import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 relative overflow-hidden">
      {/* Background gradient treatment */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 -z-10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,82,255,0.05),transparent_50%)] -z-10"></div>

      <div className="max-w-3xl text-center w-full">
        {/* Logo with refined sizing */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <Image
              src="/icon.png"
              alt="Banka Logo"
              width={160}
              height={160}
              priority
              className="drop-shadow-2xl rounded-3xl transition-transform hover:scale-105 duration-300"
            />
          </div>
        </div>

        {/* Tagline with better spacing */}
        <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-xl mx-auto leading-relaxed">
          Social savings vaults with automated yield on Base
        </p>

        {/* CTA Buttons with improved styling */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
          <Link
            href="/create"
            className="bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 min-w-[160px]"
          >
            Create Vault
          </Link>

          <Link
            href="/discover"
            className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold border-2 border-gray-200 hover:border-primary hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg min-w-[160px]"
          >
            Discover Vaults
          </Link>

          <Link
            href="/contributions"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 min-w-[160px]"
          >
            My Contributions
          </Link>
        </div>

        {/* Features grid with improved spacing and shorter copy */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          <div className="group text-center md:text-left">
            <div className="text-4xl mb-3 transition-transform group-hover:scale-110 duration-200 inline-block">💰</div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Auto Yield</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Earn yield automatically via Aave V3
            </p>
          </div>

          <div className="group text-center md:text-left">
            <div className="text-4xl mb-3 transition-transform group-hover:scale-110 duration-200 inline-block">👥</div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Social Proof</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Track contributors and progress together
            </p>
          </div>

          <div className="group text-center md:text-left">
            <div className="text-4xl mb-3 transition-transform group-hover:scale-110 duration-200 inline-block">🔒</div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">Trustless</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Your funds secured by smart contracts
            </p>
          </div>
        </div>

        {/* Network indicator badge */}
        <div className="mt-16 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-sm font-medium text-blue-700">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Built on Base Network
          </div>
        </div>
      </div>
    </main>
  )
}
