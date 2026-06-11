'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, RefreshCw, Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export default function CurrenciesAdmin() {
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [token, setToken] = useState('');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ code: '', symbol: '', rate: 1, mode: 'AUTO' });

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) setToken(t);
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/currency`);
      const data = await res.json();
      if (Array.isArray(data)) setCurrencies(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/currency/sync`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Auto rates synced successfully!');
        fetchCurrencies();
      }
    } catch (e) {
      alert('Failed to sync rates');
    } finally {
      setSyncing(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/currency`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowForm(false);
        setFormData({ code: '', symbol: '', rate: 1, mode: 'AUTO' });
        fetchCurrencies();
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to add');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/currency/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      fetchCurrencies();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleMode = async (id: number, currentMode: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/currency/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ mode: currentMode === 'AUTO' ? 'MANUAL' : 'AUTO' })
      });
      fetchCurrencies();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this currency?')) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/currency/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCurrencies();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Currency Engine</h1>
          <p className="text-gray-400 text-sm">Manage global exchange rates and public currencies.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleSync}
            disabled={syncing}
            className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Force Auto-Sync'}
          </button>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Currency
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-[#111] border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Add New Currency</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Code (e.g. GBP)</label>
              <input 
                type="text" 
                required
                maxLength={3}
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white" 
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Symbol (e.g. £)</label>
              <input 
                type="text" 
                required
                value={formData.symbol}
                onChange={e => setFormData({...formData, symbol: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white" 
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Default Rate (to USD)</label>
              <input 
                type="number" 
                step="0.01"
                required
                value={formData.rate}
                onChange={e => setFormData({...formData, rate: parseFloat(e.target.value)})}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white" 
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Mode</label>
              <select 
                value={formData.mode}
                onChange={e => setFormData({...formData, mode: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
              >
                <option value="AUTO">AUTO (Live)</option>
                <option value="MANUAL">MANUAL (Fixed)</option>
              </select>
            </div>
            <button type="submit" className="bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-medium h-[42px]">
              Save
            </button>
          </form>
        </div>
      )}

      <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-sm font-medium text-gray-400">
              <th className="p-4">Currency</th>
              <th className="p-4">Symbol</th>
              <th className="p-4">Exchange Rate</th>
              <th className="p-4">Mode</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {currencies.map((curr) => (
              <tr key={curr.id} className="border-b border-white/5 text-gray-300">
                <td className="p-4 font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-500" />
                  {curr.code} {curr.isBase && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full ml-2">BASE</span>}
                </td>
                <td className="p-4 font-medium">{curr.symbol}</td>
                <td className="p-4 font-mono">{curr.rate.toFixed(4)}</td>
                <td className="p-4">
                  <button 
                    onClick={() => toggleMode(curr.id, curr.mode)}
                    disabled={curr.isBase}
                    className={`px-2 py-1 rounded text-xs font-bold ${curr.mode === 'AUTO' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'} ${curr.isBase ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
                  >
                    {curr.mode}
                  </button>
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => toggleStatus(curr.id, curr.isActive)}
                    disabled={curr.isBase}
                    className={`flex items-center gap-1 ${curr.isActive ? 'text-green-400' : 'text-red-400'} ${curr.isBase ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
                  >
                    {curr.isActive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {curr.isActive ? 'Active' : 'Disabled'}
                  </button>
                </td>
                <td className="p-4 text-right space-x-2">
                  {!curr.isBase && (
                    <button onClick={() => handleDelete(curr.id)} className="text-red-400 hover:text-red-300 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {currencies.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">No currencies found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
