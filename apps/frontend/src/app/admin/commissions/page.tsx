"use client";

import React, { useState, useEffect } from 'react';
import { Plus, X, Save, Edit2, Trash2, Loader2, Check, Calculator } from 'lucide-react';

export default function CommissionsAdmin() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('SUPER_USER');
  const [message, setMessage] = useState('');
  
  const [users, setUsers] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    resellerName: '', productName: '', productType: 'DIGITAL_SHOP_PRODUCT', saleAmount: 0, commissionPercentage: 15, status: 'PENDING'
  });

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCommissions, setTotalCommissions] = useState(0);

  useEffect(() => {
    fetchSales();
    fetchUsers();
  }, []);

  useEffect(() => {
    const rev = sales.reduce((sum, s) => sum + s.saleAmount, 0);
    const comm = sales.reduce((sum, s) => sum + s.commissionEarned, 0);
    setTotalRevenue(rev);
    setTotalCommissions(comm);
  }, [sales]);

  const fetchSales = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/sales`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSales(data);
      }
    } catch (error) {
      console.error('Failed to fetch sales', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Filter out those who could be affiliates (NORMAL_USER or RESELLER_USER)
        setUsers(data.filter((u: any) => u.role === 'RESELLER_USER' || u.role === 'NORMAL_USER'));
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/sales/${editingId}` : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/sales`;
      const method = editingId ? 'PATCH' : 'POST';
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          saleAmount: Number(formData.saleAmount),
          commissionPercentage: Number(formData.commissionPercentage),
        })
      });
      
      if (res.ok) {
        const savedSale = await res.json();
        if (editingId) {
          setSales(sales.map(s => s.id === editingId ? savedSale : s));
        } else {
          setSales([savedSale, ...sales]);
        }
        closeForm();
        setMessage(editingId ? 'Sale updated successfully.' : 'Sale recorded successfully.');
      } else {
        setMessage("Failed to save sale. Make sure you have SUPER_USER or ADMIN_USER role.");
      }
    } catch (error) {
      setMessage("Failed to save sale.");
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/sales/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setSales(sales.filter(s => s.id !== id));
        setMessage('Sale deleted successfully.');
      } else {
        setMessage('Permission denied.');
      }
    } catch (error) {
      setMessage('Failed to delete sale.');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const markAsPaid = async (sale: any) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/sales/${sale.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'PAID' })
      });
      
      if (res.ok) {
        const updatedSale = await res.json();
        setSales(sales.map(s => s.id === sale.id ? updatedSale : s));
      }
    } catch (error) {
      setMessage("Failed to mark as paid.");
    }
  };

  const openCreateForm = () => {
    setFormData({
      resellerName: '', productName: '', productType: 'DIGITAL_SHOP_PRODUCT', saleAmount: 0, commissionPercentage: 15, status: 'PENDING'
    });
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openEditForm = (sale: any) => {
    setFormData({
      resellerName: sale.resellerName, 
      productName: sale.productName, 
      productType: sale.productType || 'DIGITAL_SHOP_PRODUCT',
      saleAmount: sale.saleAmount, 
      commissionPercentage: sale.commissionPercentage,
      status: sale.status
    });
    setEditingId(sale.id);
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
          <h2 className="text-2xl font-bold text-white mb-2">Reseller Commissions</h2>
          <p className="text-gray-400 text-sm">Track sales and automatically calculate owed commissions.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-900 p-2 rounded-lg border border-gray-800">
            <label className="text-sm text-gray-400">Role:</label>
            <select 
              value={role} 
              onChange={e => setRole(e.target.value)}
              className="bg-gray-800 text-white text-sm rounded border-gray-700 outline-none"
            >
              <option value="SUPER_USER">Super User</option>
              <option value="ADMIN_USER">Admin User</option>
            </select>
          </div>

          {!isFormOpen && (
            <button onClick={openCreateForm} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" /> Log New Sale
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center gap-4">
           <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 text-blue-400">
              <Calculator className="w-6 h-6" />
           </div>
           <div>
              <p className="text-gray-400 text-sm font-medium">Total Reseller Revenue</p>
              <h3 className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</h3>
           </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center gap-4">
           <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20 text-green-400">
              <Calculator className="w-6 h-6" />
           </div>
           <div>
              <p className="text-gray-400 text-sm font-medium">Total Commissions Earned</p>
              <h3 className="text-2xl font-bold text-white">${totalCommissions.toFixed(2)}</h3>
           </div>
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
              {editingId ? 'Edit Sale Record' : 'Record New Sale'}
            </h3>
            <button onClick={closeForm} className="text-gray-400 hover:text-white p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form className="space-y-4" onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Select Reseller / Affiliate</label>
                <select 
                  onChange={(e) => {
                    const selectedUser = users.find(u => u.id === parseInt(e.target.value));
                    if (selectedUser) {
                      setFormData({
                        ...formData,
                        resellerName: selectedUser.username || selectedUser.email,
                        commissionPercentage: selectedUser.customCommissionRate ?? (selectedUser.role === 'RESELLER_USER' ? 20 : 10)
                      });
                    } else {
                      setFormData({ ...formData, resellerName: '' });
                    }
                  }}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 mb-2"
                >
                  <option value="">-- Select an existing user (optional) --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.username || u.email} ({u.role.replace('_USER', '')})
                    </option>
                  ))}
                </select>
                <input type="text" value={formData.resellerName} onChange={e => setFormData({...formData, resellerName: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="Or type manually (e.g. John Doe)" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Product Type</label>
                <select value={formData.productType} onChange={e => setFormData({...formData, productType: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500">
                  <option value="DIGITAL_SHOP_PRODUCT">Digital Shop Product</option>
                  <option value="WHMCS_ELEMENT">WHMCS Element</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Product/Service Name</label>
                <input type="text" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="e.g. WHMCS Plus License" required />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Sale Amount ($)</label>
                <input type="number" step="0.01" value={formData.saleAmount} onChange={e => setFormData({...formData, saleAmount: Number(e.target.value)})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Commission Rate (%)</label>
                <input type="number" step="0.1" value={formData.commissionPercentage} onChange={e => setFormData({...formData, commissionPercentage: Number(e.target.value)})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500">
                  <option value="PENDING">Pending (Unpaid)</option>
                  <option value="PAID">Paid</option>
                </select>
              </div>
            </div>
            
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-between mt-4">
               <span className="text-blue-400 font-medium">Calculated Commission to Pay:</span>
               <span className="text-blue-400 font-bold text-xl">${((formData.saleAmount * formData.commissionPercentage) / 100).toFixed(2)}</span>
            </div>
            
            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2">
                <Check className="w-4 h-4" /> {editingId ? 'Update Record' : 'Save Record'}
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
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-gray-950 border-b border-gray-800 text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Reseller</th>
                <th className="px-6 py-4 font-medium">Product Sold</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Rate</th>
                <th className="px-6 py-4 font-medium">Commission Earned</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No sales recorded yet. Click "Log New Sale" to calculate a commission.
                  </td>
                </tr>
              ) : (
                sales.map(sale => (
                  <tr key={sale.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{sale.resellerName}</td>
                    <td className="px-6 py-4 text-gray-300">{sale.productName}</td>
                    <td className="px-6 py-4 text-white">${sale.saleAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-400">{sale.commissionPercentage}%</td>
                    <td className="px-6 py-4 text-green-400 font-bold">${sale.commissionEarned.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${sale.status === 'PAID' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                         {sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{new Date(sale.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      {sale.status === 'PENDING' && (
                        <button onClick={() => markAsPaid(sale)} className="text-green-400 hover:text-green-300 px-2 py-1 text-xs border border-green-500/30 rounded mr-2" title="Mark as Paid">
                          Pay
                        </button>
                      )}
                      <button onClick={() => openEditForm(sale)} className="text-gray-400 hover:text-white p-2">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(sale.id)} className="text-gray-400 hover:text-red-400 p-2">
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
