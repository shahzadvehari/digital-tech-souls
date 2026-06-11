import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-transparent z-50">
      <div className="relative">
        {/* Outer spinning ring */}
        <div className="w-16 h-16 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin"></div>
        {/* Inner pulsing core */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-blue-500 rounded-full animate-pulse shadow-[0_0_15px_#3b82f6]"></div>
      </div>
      <p className="mt-6 text-gray-400 font-medium animate-pulse tracking-wide uppercase text-sm">Loading Content</p>
    </div>
  );
}
