"use client";

import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

export default function UserSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/subscriptions/my-subscriptions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center text-blue-500"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">My Subscriptions</h1>
        <p className="text-gray-400">Manage your active hosting plans and billing cycles.</p>
      </div>

      {subscriptions.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Active Subscriptions</h2>
          <p className="text-gray-400">You don't have any active hosting plans at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map(sub => (
            <div key={sub.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 relative">
              {sub.status === 'ACTIVE' && (
                <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">
                  <CheckCircle className="w-3 h-3" /> ACTIVE
                </div>
              )}
              {sub.status === 'CANCELED' && (
                <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded">
                  <XCircle className="w-3 h-3" /> CANCELED
                </div>
              )}
              {sub.status === 'PAST_DUE' && (
                <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-1 rounded">
                  <AlertTriangle className="w-3 h-3" /> PAST DUE
                </div>
              )}

              <h3 className="text-xl font-bold text-white mb-1">{sub.plan?.name || 'Unknown Plan'}</h3>
              <p className="text-sm text-gray-400 mb-4">{sub.plan?.storage} Storage • {sub.plan?.bandwidth} Bandwidth</p>
              
              <div className="flex items-end gap-1 mb-6">
                <span className="text-3xl font-bold text-white">${sub.plan?.price || 0}</span>
                <span className="text-gray-500 mb-1">/{sub.plan?.billing === 'yearly' ? 'yr' : 'mo'}</span>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-800">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Stripe ID</span>
                  <span className="text-gray-300 font-mono text-xs">{sub.stripeSubId ? `${sub.stripeSubId.slice(0, 12)}...` : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Renews On</span>
                  <span className="text-gray-300 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> 
                    {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
