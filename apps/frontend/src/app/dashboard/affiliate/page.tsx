"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Users, DollarSign, ArrowRight, Loader2, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

export default function AffiliateDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/affiliates/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setStats(await res.json());
      } else if (res.status === 401 || res.status === 400 || res.status === 404) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/affiliates/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          paymentMethod,
          paymentDetails
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Withdrawal failed');
      }

      alert('Withdrawal request submitted successfully! An admin will review it shortly.');
      setWithdrawAmount('');
      fetchStats();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (stats?.affiliateCode) {
      navigator.clipboard.writeText(`${window.location.origin}/?ref=${stats.affiliateCode}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-16">
      <div className="max-w-5xl mx-auto space-y-8 px-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
          {stats?.role === 'RESELLER_USER' ? 'Reseller Program' : 'Affiliate Program'}
        </h1>
        <p className="text-gray-400">
          Refer clients to Digital Tech Souls and earn <span className="text-blue-400 font-bold">{stats?.currentRate || 10}% commission</span> on every order they place.
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/20 rounded-2xl p-8">
        <h3 className="text-lg font-medium text-blue-300 mb-4 flex items-center gap-2"><LinkIcon className="w-5 h-5"/> Your Unique Referral Link</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            readOnly 
            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${stats?.affiliateCode}`}
            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-gray-300 focus:outline-none"
          />
          <button 
            onClick={copyToClipboard}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {copied ? <><CheckCircle2 className="w-5 h-5" /> Copied!</> : <><Copy className="w-5 h-5" /> Copy Link</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Total Referrals</h3>
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
              <Users className="w-5 h-5"/>
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{stats?.totalReferrals || 0}</div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Total Earned</h3>
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
              <DollarSign className="w-5 h-5"/>
            </div>
          </div>
          <div className="text-3xl font-bold text-white">Rs. {stats?.totalEarned?.toLocaleString() || 0}</div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Available Balance</h3>
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
              <DollarSign className="w-5 h-5"/>
            </div>
          </div>
          <div className="text-3xl font-bold text-white">Rs. {stats?.commissionBalance?.toLocaleString() || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Recent Referrals</h3>
          {stats?.recentReferrals?.length > 0 ? (
            <div className="space-y-4">
              {stats.recentReferrals.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-white/5">
                  <div className="text-sm font-medium text-white">{user.email}</div>
                  <div className="text-xs text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No referrals yet. Share your link to get started!</p>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Commission Records</h3>
          {stats?.recentEarnings?.length > 0 ? (
            <div className="space-y-4">
              {stats.recentEarnings.map((earning: any) => (
                <div key={earning.id} className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-green-500/10">
                  <div>
                    <div className="text-sm font-bold text-green-400">+ Rs. {earning.commissionAmount.toLocaleString()}</div>
                    <div className="text-xs text-gray-400 mt-1">Order #{earning.id}</div>
                  </div>
                  <div className="text-xs text-gray-500">{new Date(earning.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No commissions earned yet.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Request Withdrawal</h3>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Amount to Withdraw (Rs.)</label>
              <input 
                type="number" 
                max={stats?.commissionBalance || 0}
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none"
                placeholder="0.00"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Available: Rs. {stats?.commissionBalance || 0}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Payment Method</label>
              <select 
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="JazzCash">JazzCash</option>
                <option value="NayaPay">NayaPay</option>
                <option value="SadaPay">SadaPay</option>
                <option value="PayPal">PayPal</option>
                <option value="Crypto">Crypto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Payment Details</label>
              <textarea 
                value={paymentDetails}
                onChange={e => setPaymentDetails(e.target.value)}
                className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none h-24"
                placeholder="IBAN, Wallet Address, or PayPal Email"
                required
              ></textarea>
            </div>
            <button 
              type="submit" 
              disabled={submitting || !stats?.commissionBalance || stats?.commissionBalance <= 0}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
}
