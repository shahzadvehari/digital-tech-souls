"use client";

import React, { useState } from 'react';
import { Search, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DomainSearch() {
  return (
    <div className="w-full max-w-5xl mx-auto mb-20 relative z-20">
      <form 
        action="https://billings.digitaltechsouls.com/cart.php?a=add&domain=register" 
        method="post" 
        target="_blank" 
        className="relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
        <div className="relative flex items-center bg-[#0A0F1E] border border-white/20 rounded-full p-2 glass">
          <div className="pl-4 pr-2 text-gray-400">
            <Globe className="w-6 h-6 text-blue-400" />
          </div>
          <input
            type="text"
            name="query"
            placeholder="Find your perfect domain name..."
            className="flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder-gray-500 text-lg px-2"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(0,102,255,0.4)]"
          >
            Search <Search className="w-4 h-4" />
          </button>
        </div>
      </form>
      
      <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm font-medium text-gray-400">
        <span className="flex items-center gap-1"><span className="text-white">.com</span> $10.99</span>
        <span className="flex items-center gap-1"><span className="text-white">.net</span> $12.99</span>
        <span className="flex items-center gap-1"><span className="text-white">.org</span> $11.99</span>
        <span className="flex items-center gap-1"><span className="text-white">.co</span> $25.99</span>
      </div>
    </div>
  );
}
