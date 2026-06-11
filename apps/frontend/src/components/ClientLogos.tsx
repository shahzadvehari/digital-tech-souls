"use client";

import React, { useEffect, useState } from 'react';
import { Hexagon, Box, Triangle, Circle, Star, Layers, Activity, Aperture, Briefcase } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Box, Hexagon, Triangle, Circle, Star, Layers, Activity, Aperture, Briefcase
};

export default function ClientLogos() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/client-logos`)
      .then(res => res.json())
      .then(data => {
        setClients(data);
      })
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || clients.length === 0) return null;

  // Duplicate array multiple times to ensure smooth infinite scrolling even on ultra-wide screens
  // Must have enough elements to fill 200% of viewport
  const duplicatedClients = [...clients, ...clients, ...clients, ...clients, ...clients, ...clients, ...clients, ...clients];

  return (
    <section className="py-12 border-y border-white/5 bg-[#050B14] overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 mb-8">
         <h3 className="text-center text-sm font-bold text-gray-500 uppercase tracking-widest">Trusted By Innovative Companies Worldwide</h3>
      </div>
      
      {/* Gradient masks for smooth fade effect at edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[#050B14] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[#050B14] to-transparent z-10 pointer-events-none"></div>

      <div className="flex w-max group overflow-hidden">
        <div className="flex gap-16 md:gap-24 items-center px-8 md:px-12 animate-marquee group-hover:[animation-play-state:paused]">
          {duplicatedClients.map((client, i) => {
            const IconComp = ICON_MAP[client.iconName] || Briefcase;
            return (
              <div key={i} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0">
                {client.imageUrl ? (
                  <img src={client.imageUrl} alt={client.name} className="h-10 object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" />
                ) : (
                  <IconComp className="w-8 h-8" />
                )}
                <span className="text-xl md:text-2xl font-bold font-sans tracking-tight">{client.name}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  );
}
