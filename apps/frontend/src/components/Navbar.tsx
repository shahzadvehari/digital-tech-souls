"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Menu, X, ChevronDown, Search } from 'lucide-react';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useCurrency } from '@/context/CurrencyContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);
  const [logoUrl, setLogoUrl] = useState("/logo.png");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { currencies, selectedCurrency, setCurrency } = useCurrency();
  const router = useRouter();

  React.useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/settings`)
      .then(res => res.json())
      .then(settings => {
        const siteLogo = settings.find((s: any) => s.key === 'siteLogo')?.value;
        if (siteLogo) setLogoUrl(siteLogo);
      })
      .catch(() => {
        // Silently ignore if backend is unavailable
      });
      
    if (localStorage.getItem('token')) {
      setIsLoggedIn(true);
      const u = localStorage.getItem('user');
      if (u) {
        try {
          setCurrentUser(JSON.parse(u));
        } catch(e) {}
      }
    }
  }, []);

  return (
    <nav className="fixed w-full z-50 bg-[#0A0F1E] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <Image 
              src={logoUrl} 
              alt="Digital Tech Souls Logo" 
              width={140} 
              height={45} 
              className="h-auto w-auto max-h-[50px] object-contain"
              priority
            />
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-300">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/#hosting" className="hover:text-white transition-colors">Hosting</Link>
          <Link href="/licenses" className="hover:text-white transition-colors">Licenses</Link>
          <Link href="/themes-tools" className="hover:text-white transition-colors">Themes & Tools</Link>
          <Link href="/services" className="hover:text-white transition-colors">Other Services</Link>
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        </div>

        <div className="hidden md:flex items-center gap-4">


          {/* Currency Toggle */}
          <div className="relative">
            <button 
              onClick={() => setShowCurrency(!showCurrency)}
              className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-full border border-white/10"
            >
              {selectedCurrency?.code || 'USD'}
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showCurrency && (
              <div className="absolute top-full mt-2 right-0 bg-[#111] border border-white/10 rounded-xl shadow-xl overflow-hidden py-1 min-w-[120px]">
                {currencies.map(c => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCurrency(c.code);
                      setShowCurrency(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm transition-colors ${selectedCurrency?.code === c.code ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                  >
                    {c.code} ({c.symbol})
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Accounts Dropdown */}
          <div className="relative group pb-2">
            <button className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/10 mt-2">
              <User className="w-4 h-4" /> 
              {isLoggedIn && currentUser ? (
                <span className="max-w-[100px] truncate">{currentUser.username || currentUser.email?.split('@')[0] || 'Account'}</span>
              ) : 'Account'}
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute top-[100%] right-0 pt-1 hidden group-hover:block transition-all z-50">
              <div className="w-56 bg-[#111] border border-white/10 rounded-xl shadow-xl overflow-hidden py-2">
                 <div className="px-4 py-1.5 text-xs font-bold text-blue-500 uppercase tracking-wider">Hosting Panel (WHMCS)</div>
                 <a href="https://billings.digitaltechsouls.com/clientarea.php" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">Hosting Login</a>
                 <a href="https://billings.digitaltechsouls.com/register.php" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white mb-1">Hosting Sign Up</a>
                 
                 <div className="px-4 py-1.5 text-xs font-bold text-blue-500 uppercase tracking-wider border-t border-white/10 pt-3 mt-1">Digital Store</div>
                 {isLoggedIn ? (
                   <>
                     {currentUser && (
                       <div className="px-4 pb-2 mb-2 border-b border-white/5">
                         <div className="text-sm font-medium text-white truncate">{currentUser.email}</div>
                         <div className="text-xs text-green-400 flex items-center gap-1 mt-0.5">
                           <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div> Online Status
                         </div>
                       </div>
                     )}
                     <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">My Dashboard</Link>
                     <button 
                       onClick={() => {
                         localStorage.removeItem('token');
                         localStorage.removeItem('user');
                         document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                         setIsLoggedIn(false);
                         router.push('/');
                       }} 
                       className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5"
                     >
                       Logout
                     </button>
                   </>
                 ) : (
                   <>
                     <Link href="/login" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">Store Login</Link>
                     <Link href="/register" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">Store Sign Up</Link>
                   </>
                 )}
              </div>
            </div>
          </div>
          <WhatsAppButton 
            label="Chat on WhatsApp" 
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm py-2 px-4"
          />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white p-2">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-[#0A0F1E] border-b border-white/10 px-6 py-4 flex flex-col space-y-4">
          <Link href="/" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white font-medium">Home</Link>
          <Link href="/#hosting" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white font-medium">Hosting</Link>
          <Link href="/licenses" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white font-medium">Licenses</Link>
          <Link href="/themes-tools" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white font-medium">Themes & Tools</Link>
          <Link href="/services" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white font-medium">Other Services</Link>
          <Link href="/blog" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white font-medium">Blog</Link>
          

          
          <div className="h-px bg-white/10 my-2"></div>
          
          <div className="flex gap-2 mb-2">
             {currencies.map(c => (
                <button
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border ${selectedCurrency?.code === c.code ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                >
                  {c.code}
                </button>
             ))}
          </div>

          <div className="h-px bg-white/10 my-2"></div>
          
          <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mt-2 mb-1">Hosting Panel (WHMCS)</div>
          <a href="https://billings.digitaltechsouls.com/clientarea.php" className="text-gray-300 hover:text-white font-medium py-1">Hosting Login</a>
          <a href="https://billings.digitaltechsouls.com/register.php" className="text-gray-300 hover:text-white font-medium py-1">Hosting Sign Up</a>

          <div className="h-px bg-white/10 my-2"></div>
          
          <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mt-2 mb-1">Digital Store</div>
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-gray-300 hover:text-white font-medium py-1">
                <User className="w-4 h-4" /> My Dashboard
              </Link>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                  setIsLoggedIn(false);
                  router.push('/');
                }} 
                className="text-left text-red-400 hover:text-red-300 font-medium py-1"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-gray-300 hover:text-white font-medium py-1">
                <User className="w-4 h-4" /> Store Login
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white font-medium py-1">Store Sign Up</Link>
            </>
          )}
          <div className="pt-2">
            <WhatsAppButton 
              label="Chat on WhatsApp" 
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm py-2 px-4 w-full justify-center flex items-center gap-2"
            />
          </div>
        </div>
      )}
    </nav>
  );
}
