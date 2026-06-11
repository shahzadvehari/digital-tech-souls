"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminAffiliates() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    userId: '', amount: 0, paymentMethod: 'MANUAL', paymentDetails: '', status: 'APPROVED', adminNote: ''
  });
  const router = useRouter();

  useEffect(() => {
    fetchWithdrawals();
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.filter((u: any) => u.role === 'RESELLER_USER' || u.role === 'NORMAL_USER'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWithdrawals = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/affiliates/admin/withdrawals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setWithdrawals(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    let note = '';
    if (status === 'REJECTED') {
      const input = prompt('Reason for rejection (Optional):');
      if (input === null) return; // Cancelled
      note = input;
    } else if (status === 'APPROVED') {
      const input = prompt('Add an admin note (e.g. Transaction ID):');
      if (input === null) return;
      note = input;
    }

    setProcessingId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/affiliates/admin/withdrawals/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, adminNote: note })
      });

      if (!res.ok) throw new Error('Failed to update status');
      fetchWithdrawals();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSavePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId) return alert('Please select a user');
    try {
      const token = localStorage.getItem('token');
      const url = editingId ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/affiliates/admin/withdrawals/${editingId}` : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/affiliates/admin/withdrawals`;
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: Number(formData.userId),
          amount: Number(formData.amount),
          paymentMethod: formData.paymentMethod,
          paymentDetails: formData.paymentDetails,
          status: formData.status,
          adminNote: formData.adminNote
        })
      });

      if (!res.ok) throw new Error('Failed to save payout');
      setIsFormOpen(false);
      fetchWithdrawals();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this payout record?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/affiliates/admin/withdrawals/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      fetchWithdrawals();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Affiliate Payouts</h2>
          <p className="text-gray-400">Manage withdrawal requests from your affiliates and resellers.</p>
        </div>
        {!isFormOpen && (
          <button onClick={() => { setFormData({ userId: '', amount: 0, paymentMethod: 'MANUAL', paymentDetails: '', status: 'APPROVED', adminNote: '' }); setEditingId(null); setIsFormOpen(true); }} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            Record Manual Payout
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">{editingId ? 'Edit Payout' : 'Record Manual Payout'}</h3>
            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-white p-2"><XCircle className="w-5 h-5" /></button>
          </div>
          <form className="space-y-4" onSubmit={handleSavePayout}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Select Reseller / Affiliate User</label>
                <select value={formData.userId} onChange={e => setFormData({...formData, userId: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" required>
                  <option value="">-- Select User --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.username || u.email} (Bal: Rs. {u.commissionBalance || 0})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Amount (Rs.)</label>
                <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Payment Method</label>
                <input type="text" value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="e.g. Bank Transfer" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Payment Details (Txn ID)</label>
                <input type="text" value={formData.paymentDetails} onChange={e => setFormData({...formData, paymentDetails: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" required>
                  <option value="APPROVED">APPROVED (Paid)</option>
                  <option value="PENDING">PENDING</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Admin Note (Internal)</label>
              <input type="text" value={formData.adminNote} onChange={e => setFormData({...formData, adminNote: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" />
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-medium">Save Payout Record</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-black/50 border-b border-gray-800">
            <tr>
              <th className="p-4 text-sm font-medium text-gray-400">User</th>
              <th className="p-4 text-sm font-medium text-gray-400">Amount</th>
              <th className="p-4 text-sm font-medium text-gray-400">Method & Details</th>
              <th className="p-4 text-sm font-medium text-gray-400">Status</th>
              <th className="p-4 text-sm font-medium text-gray-400">Date</th>
              <th className="p-4 text-sm font-medium text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {withdrawals.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">No withdrawal requests found.</td>
              </tr>
            ) : withdrawals.map(w => (
              <tr key={w.id} className="hover:bg-black/30 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-white">{w.user?.email}</div>
                  <div className="text-xs text-gray-500">{w.user?.username}</div>
                </td>
                <td className="p-4 font-bold text-green-400">Rs. {w.amount}</td>
                <td className="p-4">
                  <div className="text-sm text-gray-300 font-medium">{w.paymentMethod}</div>
                  <div className="text-xs text-gray-500 max-w-[200px] truncate" title={w.paymentDetails}>{w.paymentDetails}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold border ${
                    w.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                    w.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {w.status}
                  </span>
                  {w.adminNote && <div className="text-xs text-gray-500 mt-1 max-w-[150px] truncate" title={w.adminNote}>Note: {w.adminNote}</div>}
                </td>
                <td className="p-4 text-sm text-gray-400">{new Date(w.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  {w.status === 'PENDING' && (
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleUpdateStatus(w.id, 'APPROVED')}
                        disabled={processingId === w.id}
                        className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                        title="Approve & Mark Paid"
                      >
                        {processingId === w.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(w.id, 'REJECTED')}
                        disabled={processingId === w.id}
                        className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Reject & Refund Balance"
                      >
                        {processingId === w.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
