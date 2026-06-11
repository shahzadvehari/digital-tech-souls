"use client";

import React, { useState, useEffect } from 'react';
import { Download, Key, Loader2, Package, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UserVault() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchVaultItems();
  }, [router]);

  const fetchVaultItems = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/vault/my-items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setItems(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLicense = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto space-y-8 px-6">
        <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/20 rounded-2xl p-8 mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center gap-6">
        <div className="p-4 bg-blue-500/20 rounded-full">
          <ShieldCheck className="w-12 h-12 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Digital Vault</h1>
          <p className="text-gray-400">Access your purchased themes, tools, and their respective license keys. Download files directly and securely.</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center p-12 bg-gray-900/50 border border-gray-800 rounded-2xl">
          <Package className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-300 mb-2">Your vault is empty</h3>
          <p className="text-gray-500 mb-6">You haven't purchased any themes or tools yet.</p>
          <button onClick={() => router.push('/themes-tools')} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all">
            Browse Store
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
              {item.imageUrl ? (
                <div className="h-40 w-full overflow-hidden">
                  <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-40 w-full bg-gray-800 flex items-center justify-center">
                  <Package className="w-12 h-12 text-gray-600" />
                </div>
              )}
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-white leading-tight">{item.productName}</h3>
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs font-bold whitespace-nowrap">
                    {item.productType}
                  </span>
                </div>
                
                <p className="text-sm text-gray-400 mb-6 flex-1 line-clamp-3">
                  {item.description || 'No description available.'}
                </p>

                <div className="space-y-3">
                  <div className="bg-black/50 border border-white/5 p-3 rounded-lg flex items-center justify-between group">
                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                      <Key className="w-4 h-4 text-gray-500 shrink-0" />
                      <span className="font-mono text-xs text-gray-400 truncate">{item.licenseKey}</span>
                    </div>
                    <button 
                      onClick={() => handleCopyLicense(item.licenseKey)}
                      className="text-blue-400 hover:text-blue-300 font-medium text-xs transition-colors shrink-0"
                    >
                      {copiedKey === item.licenseKey ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : 'Copy'}
                    </button>
                  </div>

                  {item.downloadUrl ? (
                    <a 
                      href={item.downloadUrl?.startsWith('http') ? item.downloadUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${item.downloadUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="w-full py-3 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Download File
                    </a>
                  ) : (
                    <button disabled className="w-full py-3 bg-gray-800 text-gray-500 font-bold rounded-lg cursor-not-allowed flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" /> Not Available
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
