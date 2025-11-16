'use client';

import { useEffect } from 'react';
import sdk from '@farcaster/miniapp-sdk';

export function FarcasterProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const load = async () => {
      try {
        // Initialize Farcaster SDK context
        await sdk.context;

        // Call ready to dismiss splash screen
        sdk.actions.ready();
      } catch (error) {
        console.error('Failed to initialize Farcaster SDK:', error);
        // Call ready anyway to prevent splash screen from persisting
        sdk.actions.ready();
      }
    };

    load();
  }, []);

  return <>{children}</>;
}
