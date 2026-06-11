"use client";

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

interface AdPlacementProps {
  placementKey: 'ad_header_code' | 'ad_footer_code' | 'ad_homepage_code' | 'ad_blog_code';
  className?: string;
}

export default function AdPlacement({ placementKey, className = '' }: AdPlacementProps) {
  const [adCode, setAdCode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Fetch ad code from settings
    const fetchAd = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/settings/${placementKey}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.value && data.value.trim().length > 0) {
            setAdCode(data.value);
          }
        }
      } catch (error) {
        // Silently ignore if backend is unavailable or ad doesn't exist
      }
    };
    
    fetchAd();
  }, [placementKey]);

  useEffect(() => {
    if (adCode && containerRef.current) {
      // Clear previous content
      containerRef.current.innerHTML = '';
      
      // Parse the adCode to extract scripts and normal HTML
      // We use a temporary div to parse it
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = adCode;
      
      // Move all non-script elements
      Array.from(tempDiv.childNodes).forEach(node => {
        if (node.nodeName !== 'SCRIPT') {
          containerRef.current?.appendChild(node.cloneNode(true));
        }
      });
      
      // For script tags, we MUST create a new script element to force the browser to execute it
      const scripts = tempDiv.getElementsByTagName('script');
      Array.from(scripts).forEach(oldScript => {
        const newScript = document.createElement('script');
        
        // Copy all attributes (like src, type, etc)
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        
        // Copy inline code if any
        if (oldScript.innerHTML) {
          newScript.innerHTML = oldScript.innerHTML;
        }
        
        containerRef.current?.appendChild(newScript);
      });
    }
  }, [adCode]);

  // Don't render anything if there's no ad code, or if we are inside the admin panel
  if (!adCode || pathname?.startsWith('/admin')) return null; 

  // Check if the user pasted a raw URL instead of an HTML snippet
  const isRawUrl = /^https?:\/\/[^\s<]+$/.test(adCode.trim());

  if (isRawUrl) {
    return (
      <div className={`w-full flex justify-center items-center overflow-hidden py-4 ${className}`}>
        <iframe src={adCode.trim()} width="100%" height="90" style={{ border: 'none' }} scrolling="no" sandbox="allow-scripts allow-popups allow-forms allow-same-origin"></iframe>
      </div>
    );
  }

  return (
    <div className={`w-full flex justify-center items-center overflow-hidden py-4 ${className}`}>
      <div ref={containerRef} className="max-w-full"></div>
    </div>
  );
}
