'use client';

import { use } from 'react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

export default function VaultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const frameUrl = `${APP_URL}/api/frame?vault=${id}`;
  const shareText = `Check out this savings vault on Banka!\n\n${frameUrl}`;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Vault Details</h1>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vault Address
            </label>
            <code className="block p-3 bg-gray-100 rounded text-sm break-all">
              {id}
            </code>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Farcaster Frame URL
            </label>
            <code className="block p-3 bg-gray-100 rounded text-sm break-all">
              {frameUrl}
            </code>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(frameUrl);
                alert('Frame URL copied!');
              }}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              📋 Copy Frame URL
            </button>

            <button
              onClick={() => {
                const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}`;
                window.open(url, '_blank');
              }}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              🚀 Share on Farcaster
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-primary p-6 rounded">
          <h3 className="font-semibold text-lg mb-2">📝 How to share:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Click "Share on Farcaster" button above</li>
            <li>Or copy the Frame URL and paste it in a Warpcast cast</li>
            <li>Your followers will see an interactive Frame with vault progress</li>
            <li>They can contribute directly from the Frame!</li>
          </ol>
        </div>

        <div className="mt-8">
          <h3 className="font-semibold text-lg mb-4">🎨 Frame Preview:</h3>
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <iframe
              src={frameUrl}
              className="w-full h-96 border-0 rounded"
              title="Frame Preview"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
