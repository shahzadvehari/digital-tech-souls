"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function LocalTracker() {
  const pathname = usePathname();
  const hasTracked = useRef<string | null>(null);

  useEffect(() => {
    // Only track once per path change
    if (hasTracked.current === pathname) return;
    hasTracked.current = pathname;

    const trackVisit = async () => {
      // Check for affiliate ref
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const ref = urlParams.get('ref');
        if (ref) {
          localStorage.setItem('affiliate_ref', ref);
        }
      }

      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/analytics/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: pathname || '/' })
        });
      } catch (err) {
        // Silently fail if tracking server is unreachable
        console.error("Local tracker failed:", err);
      }
    };

    trackVisit();
  }, [pathname]);

  return null; // Invisible component
}
