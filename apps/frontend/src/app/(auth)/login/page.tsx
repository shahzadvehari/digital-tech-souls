"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [globalSettings, setGlobalSettings] = useState<any>({});
  
  // 2FA states
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const router = useRouter();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/settings`)
      .then(res => res.json())
      .then(data => {
        const settingsObj = data.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
        setGlobalSettings(settingsObj);
      })
      .catch(console.error);
  }, []);

  // Removed auto-login bypass for production

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.requires2FA) {
          setRequires2FA(true);
          setTempToken(data.tempToken);
          setLoading(false);
          return;
        }

        // Save token to localStorage for authenticated requests
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Also set a cookie so Next.js Middleware can read it
        document.cookie = `token=${data.access_token}; path=/; max-age=86400;`;
        
        // Redirect based on role
        if (['SUPER_USER', 'ADMIN_USER'].includes(data.user.role)) {
          router.push('/admin');
        } else if (data.user.role === 'RESELLER_USER') {
          router.push('/dashboard/affiliate');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      if (!requires2FA) setLoading(false);
    }
  };

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/2fa/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, code: twoFactorCode }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        document.cookie = `token=${data.access_token}; path=/; max-age=86400;`;
        
        if (['SUPER_USER', 'ADMIN_USER'].includes(data.user.role)) {
          router.push('/admin');
        } else if (data.user.role === 'RESELLER_USER') {
          router.push('/dashboard/affiliate');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.message || 'Invalid 2FA code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to your Digital Store account</p>
        </div>

        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
          <p className="text-sm text-gray-300 mb-3">Looking for your hosting or domain management?</p>
          <a href={globalSettings.whmcsUrl || "https://billings.digitaltechsouls.com/clientarea.php"} className="inline-block bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 px-6 rounded-lg transition-colors shadow-lg shadow-blue-500/20">
            {globalSettings.hostingButtonTitle || "Go to Hosting Portal"}
          </a>
        </div>

        <div className="flex items-center gap-4 my-6">
          <div className="h-px bg-gray-800 flex-1"></div>
          <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Store Login</span>
          <div className="h-px bg-gray-800 flex-1"></div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center mb-6">
            {error}
          </div>
        )}

        {requires2FA ? (
          <form onSubmit={handle2FA} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-gray-400 text-sm">Enter the 6-digit code from your authenticator app.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Authentication Code</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-blue-500 transition-colors text-center tracking-[0.5em] text-lg font-mono"
                  placeholder="000000"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || twoFactorCode.length < 6}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              Verify Code
            </button>
            <button
              type="button"
              onClick={() => { setRequires2FA(false); setTempToken(''); setTwoFactorCode(''); }}
              className="w-full bg-transparent hover:text-white text-gray-400 font-medium py-3 rounded-lg transition-colors text-sm"
            >
              Back to Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email ID or Mobile No</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter Email or Mobile No"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-400">Password</label>
                <Link href="/forgot-password" className="text-sm text-blue-500 hover:text-blue-400">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              Sign In
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-gray-400 text-sm">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-500 hover:text-blue-400">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
