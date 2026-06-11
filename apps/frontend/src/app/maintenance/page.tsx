"use client";

import React from 'react';
import { Wrench } from 'lucide-react';
import Image from 'next/image';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#050B14] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full -z-10"></div>
      
      <div className="mb-8">
        <Image 
          src="/logo.png" 
          alt="Digital Tech Souls Logo" 
          width={200} 
          height={70} 
          className="h-12 w-auto object-contain mx-auto"
        />
      </div>

      <div className="bg-[#0a0f1a] border border-white/10 p-10 rounded-3xl shadow-2xl max-w-lg w-full z-10 relative">
        <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wrench className="w-10 h-10 text-blue-500 animate-pulse" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">Under Maintenance</h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          We are currently performing scheduled maintenance to improve our services. 
          Please check back shortly. We apologize for any inconvenience.
        </p>

        <div className="flex justify-center gap-4">
          <a href="mailto:support@digitaltechsouls.com" className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">
            Contact Support
          </a>
        </div>
      </div>
      
      <div className="mt-12 text-xs text-gray-600">
        &copy; {new Date().getFullYear()} Digital Tech Souls. All rights reserved.
      </div>
    </div>
  );
}
