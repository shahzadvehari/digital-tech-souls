"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Check, X } from 'lucide-react';

export default function PlansAdmin() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '', price: 0, billing: 'monthly', storage: '', bandwidth: '',
    emails: 0, databases: 0, freeSsl: true, backup: 'daily', isFeatured: false, orderUrl: ''
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/plans`);
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Failed to fetch plans', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/plans/${editingId}` : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/plans`;
      const method = editingId ? 'PATCH' : 'POST';
      
      const payload = {
        ...formData,
        price: Number(formData.price),
        emails: Number(formData.emails),
        databases: Number(formData.databases)
      };

      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const savedPlan = await res.json();
        if (editingId) {
          setPlans(plans.map(p => p.id === editingId ? savedPlan : p));
        } else {
          setPlans([...plans, savedPlan]);
        }
        closeForm();
        setMessage(editingId ? 'Plan updated successfully.' : 'Plan created successfully.');
      } else {
        setMessage("Failed to save plan. Make sure you have ADMIN_USER role.");
      }
    } catch (error) {
      setMessage("Failed to save plan.");
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/plans/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setPlans(plans.filter(p => p.id !== id));
        setMessage('Plan deleted successfully.');
      } else {
        setMessage('Permission denied. You need ADMIN_USER or SUPER_USER role to delete.');
      }
    } catch (error) {
      setMessage('Failed to delete plan.');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const openCreateForm = () => {
    setFormData({
      name: '', price: 0, billing: 'monthly', storage: '', bandwidth: '',
      emails: 0, databases: 0, freeSsl: true, backup: 'daily', isFeatured: false, orderUrl: ''
    });
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openEditForm = (plan: any) => {
    setFormData({
      name: plan.name, price: plan.price, billing: plan.billing, storage: plan.storage,
      bandwidth: plan.bandwidth, emails: plan.emails, databases: plan.databases,
      freeSsl: plan.freeSsl, backup: plan.backup, isFeatured: plan.isFeatured, orderUrl: plan.orderUrl || ''
    });
    setEditingId(plan.id);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  return (
    <div className="max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Hosting Plans</h2>
          <p className="text-gray-400 text-sm">Manage your web hosting packages and pricing.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {!isFormOpen && (
            <button onClick={openCreateForm} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Plan
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-lg ${message.includes('denied') || message.includes('Failed') ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-green-500/20 text-green-400 border border-green-500/50'}`}>
          {message}
        </div>
      )}

      {isFormOpen && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">
              {editingId ? 'Edit Plan' : 'Create New Plan'}
            </h3>
            <button onClick={closeForm} className="text-gray-400 hover:text-white p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form className="space-y-4" onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Plan Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Price</label>
                <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Billing</label>
                <select value={formData.billing} onChange={e => setFormData({...formData, billing: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500">
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Storage</label>
                <input type="text" value={formData.storage} onChange={e => setFormData({...formData, storage: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="e.g. 50GB NVMe" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Bandwidth</label>
                <input type="text" value={formData.bandwidth} onChange={e => setFormData({...formData, bandwidth: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="e.g. Unmetered" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Emails</label>
                <input type="number" value={formData.emails} onChange={e => setFormData({...formData, emails: Number(e.target.value)})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Databases</label>
                <input type="number" value={formData.databases} onChange={e => setFormData({...formData, databases: Number(e.target.value)})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Backup</label>
                <input type="text" value={formData.backup} onChange={e => setFormData({...formData, backup: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="e.g. Daily" required />
              </div>
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-400 mb-1">Custom Order Link (Optional)</label>
                <input type="url" value={formData.orderUrl} onChange={e => setFormData({...formData, orderUrl: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="https://..." />
              </div>
              <div className="flex flex-col justify-center gap-2">
                <label className="flex items-center gap-2 text-gray-400">
                  <input type="checkbox" checked={formData.freeSsl} onChange={e => setFormData({...formData, freeSsl: e.target.checked})} className="rounded bg-gray-900 border-gray-700" /> Free SSL
                </label>
                <label className="flex items-center gap-2 text-gray-400">
                  <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="rounded bg-gray-900 border-gray-700" /> Featured (Popular)
                </label>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2">
                <Check className="w-4 h-4" /> {editingId ? 'Update Plan' : 'Save Plan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-950 border-b border-gray-800 text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Plan Name</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Resources</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {plans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No hosting plans found. Click "Add Plan" to create one.
                  </td>
                </tr>
              ) : (
                plans.map(plan => (
                  <tr key={plan.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{plan.name}</td>
                    <td className="px-6 py-4 text-blue-400">${plan.price}/{plan.billing === 'yearly' ? 'yr' : 'mo'}</td>
                    <td className="px-6 py-4 text-gray-300">
                      <div>{plan.storage}</div>
                      <div className="text-xs text-gray-500">{plan.bandwidth}</div>
                    </td>
                    <td className="px-6 py-4">
                      {plan.isFeatured ? (
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-bold uppercase">Popular</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEditForm(plan)} className="text-gray-400 hover:text-white p-2">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(plan.id)} className="text-gray-400 hover:text-red-400 p-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
