"use client";

import React, { useState, useEffect } from 'react';
import { CreditCard, Search, Loader2, X } from 'lucide-react';

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<any>({
    id: null,
    userId: '',
    planId: '',
    status: 'ACTIVE',
    stripeSubId: '',
    currentPeriodEnd: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const [subsRes, usersRes, plansRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/subscriptions/admin`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/plans`)
      ]);
      
      if (subsRes.ok) setSubscriptions(await subsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (plansRes.ok) setPlans(await plansRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode: 'create' | 'edit', sub?: any) => {
    setModalMode(mode);
    if (mode === 'edit' && sub) {
      setFormData({
        id: sub.id,
        userId: sub.userId,
        planId: sub.planId || '',
        status: sub.status,
        stripeSubId: sub.stripeSubId || '',
        currentPeriodEnd: sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toISOString().split('T')[0] : ''
      });
    } else {
      setFormData({ id: null, userId: '', planId: '', status: 'ACTIVE', stripeSubId: '', currentPeriodEnd: '' });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const url = modalMode === 'create' 
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/subscriptions/admin`
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/subscriptions/admin/${formData.id}`;
      
    const method = modalMode === 'create' ? 'POST' : 'PATCH';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: Number(formData.userId),
          planId: formData.planId ? Number(formData.planId) : null,
          status: formData.status,
          stripeSubId: formData.stripeSubId || null,
          currentPeriodEnd: formData.currentPeriodEnd ? new Date(formData.currentPeriodEnd).toISOString() : null
        })
      });
      
      if (res.ok) {
        setShowModal(false);
        fetchData();
      } else {
        alert('Failed to save subscription');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelSub = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/subscriptions/admin/${id}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'CANCELED' })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSub = async (id: number) => {
    if (!confirm('Are you sure you want to DELETE this subscription? This cannot be undone.')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/subscriptions/admin/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSubs = subscriptions.filter(sub => 
    sub.user?.email.toLowerCase().includes(search.toLowerCase()) ||
    sub.stripeSubId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Subscriptions</h1>
          <p className="text-gray-400 text-sm">Manage recurring billing and hosting plans.</p>
        </div>
        <button onClick={() => handleOpenModal('create')} className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Create Subscription
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search by email or ID..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-black border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-800/50 text-gray-300">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Plan</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Stripe ID</th>
                <th className="px-6 py-4 font-medium">Next Billing</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-blue-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td>
                </tr>
              ) : filteredSubs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <CreditCard className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-1">No subscriptions yet</h3>
                    <p className="text-gray-500 text-sm mb-4">Get started by creating your first subscription manually or wait for user purchases.</p>
                    <button onClick={() => handleOpenModal('create')} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      Create Subscription
                    </button>
                  </td>
                </tr>
              ) : (
                filteredSubs.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{sub.user?.username || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{sub.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{sub.plan?.name || 'N/A'}</div>
                      <div className="text-xs text-blue-400">${sub.plan?.price}/{sub.plan?.billing === 'yearly' ? 'yr' : 'mo'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        sub.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                        sub.status === 'PAST_DUE' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {sub.stripeSubId || 'Manual/Incomplete'}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal('edit', sub)} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors text-xs font-medium">Edit</button>
                        <button onClick={() => handleCancelSub(sub.id)} className="px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors text-xs font-medium">Cancel</button>
                        <button onClick={() => handleDeleteSub(sub.id)} className="px-3 py-1.5 bg-red-900/40 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors text-xs font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {modalMode === 'create' ? 'Create Subscription' : 'Edit Subscription'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">User</label>
                <select 
                  required
                  value={formData.userId}
                  onChange={e => setFormData({...formData, userId: e.target.value})}
                  className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                  disabled={modalMode === 'edit'}
                >
                  <option value="">Select a user...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.email} ({u.username || 'No name'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Plan</label>
                <select 
                  required
                  value={formData.planId}
                  onChange={e => setFormData({...formData, planId: e.target.value})}
                  className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                >
                  <option value="">Select a plan...</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - ${p.price}/{p.billing}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INCOMPLETE">INCOMPLETE</option>
                  <option value="PAST_DUE">PAST_DUE</option>
                  <option value="CANCELED">CANCELED</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Stripe Subscription ID (Optional)</label>
                <input 
                  type="text" 
                  value={formData.stripeSubId}
                  onChange={e => setFormData({...formData, stripeSubId: e.target.value})}
                  className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                  placeholder="sub_..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Next Billing Date</label>
                <input 
                  type="date" 
                  value={formData.currentPeriodEnd}
                  onChange={e => setFormData({...formData, currentPeriodEnd: e.target.value})}
                  className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                >
                  {modalMode === 'create' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
