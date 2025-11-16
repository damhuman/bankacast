'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function VaultPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [copied, setCopied] = useState(false);

  // Use window.location.origin to get the current domain (works in prod and dev)
  const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';

  const frameUrl = `${APP_URL}/api/frame?vault=${id}`;
  const shareText = `Check out this savings vault on Banka!\n\n${frameUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(frameUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 transition flex items-center gap-2 text-sm font-medium"
          >
            ← Back
          </Link>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Share Your Vault</h1>
            <p className="text-gray-600 text-sm">Copy the link or share directly to Farcaster</p>
          </div>

          {/* Vault Address */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Vault Address
            </label>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <code className="text-xs text-gray-700 break-all font-mono">
                {id}
              </code>
            </div>
          </div>

          {/* Frame URL */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Frame URL
            </label>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <code className="text-xs text-gray-700 break-all font-mono">
                {frameUrl}
              </code>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition text-sm"
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>

            <button
              onClick={() => {
                const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}`;
                window.open(url, '_blank');
              }}
              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition text-sm"
            >
              Share on Farcaster
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              Share this link on Farcaster to let others contribute to your vault.
              They'll see an interactive frame with progress and can contribute directly.
            </p>
          </div>

          {/* Frame Preview */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Preview
            </label>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <iframe
                src={frameUrl}
                className="w-full h-96 border-0"
                title="Frame Preview"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
