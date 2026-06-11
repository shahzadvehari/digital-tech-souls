"use client";

import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, XCircle, Clock, Search, ExternalLink, MoreVertical, Edit, Trash, Download, Mail } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface Invoice {
  id: number;
  invoiceNumber: string;
  user: { username: string; email: string };
  orderId: number | null;
  totalAmount: number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  paymentProof: string | null;
  dueDate: string;
  createdAt: string;
}

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState<Invoice | null>(null);
  const [editData, setEditData] = useState<Partial<Invoice>>({});
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const fetchInvoices = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/invoices/admin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setInvoices(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/invoices/admin/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchInvoices();
      setOpenDropdown(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleResend = async (id: number) => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/invoices/admin/${id}/resend`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Invoice email resent successfully!');
      setOpenDropdown(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownload = (invoice: Invoice) => {
    if (!invoice.orderId) return alert('This custom invoice does not have a downloadable PDF yet.');
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || localStorage.getItem('token');
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/orders/${invoice.orderId}/invoice?token=${token}`, '_blank');
    setOpenDropdown(null);
  };

  const handleSaveEdit = async () => {
    if (!isEditing) return;
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/invoices/admin/${isEditing.id}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      });
      fetchInvoices();
      setIsEditing(null);
    } catch (error) {
      console.error(error);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/invoices/admin/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      fetchInvoices();
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/50 rounded-full text-xs font-bold flex items-center gap-1 w-max"><CheckCircle className="w-3 h-3"/> Paid</span>;
      case 'PENDING_APPROVAL': return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded-full text-xs font-bold flex items-center gap-1 w-max"><Clock className="w-3 h-3"/> Pending Proof</span>;
      case 'UNPAID': return <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/50 rounded-full text-xs font-bold flex items-center gap-1 w-max"><Clock className="w-3 h-3"/> Unpaid</span>;
      case 'CANCELLED': return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 border border-gray-500/50 rounded-full text-xs font-bold flex items-center gap-1 w-max"><XCircle className="w-3 h-3"/> Cancelled</span>;
      default: return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-bold w-max">{status}</span>;
    }
  };

  const filtered = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || 
    inv.user?.email.toLowerCase().includes(search.toLowerCase()) ||
    inv.user?.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Invoices</h1>
          <p className="text-gray-400">Manage all client invoices and payments</p>
        </div>
      </div>

      <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by Invoice #, Email, or Name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading invoices...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="pb-4 font-medium">Invoice</th>
                  <th className="pb-4 font-medium">Client</th>
                  <th className="pb-4 font-medium">Amount</th>
                  <th className="pb-4 font-medium">Status</th>
                  <th className="pb-4 font-medium">Date / Due</th>
                  <th className="pb-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filtered.map(invoice => (
                  <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="font-bold text-white">{invoice.invoiceNumber}</div>
                      <div className="text-xs text-gray-500">Order ID: {invoice.orderId || 'N/A'}</div>
                    </td>
                    <td className="py-4">
                      <div className="text-white">{invoice.user?.username || 'User'}</div>
                      <div className="text-xs text-gray-500">{invoice.user?.email}</div>
                    </td>
                    <td className="py-4 font-mono text-white">
                      {invoice.totalAmount.toLocaleString()} {invoice.currency}
                      {invoice.paymentMethod && <div className="text-xs text-blue-400">{invoice.paymentMethod}</div>}
                    </td>
                    <td className="py-4">{getStatusBadge(invoice.status)}</td>
                    <td className="py-4">
                      <div className="text-gray-300">{format(new Date(invoice.createdAt), 'MMM d, yyyy')}</div>
                      <div className="text-xs text-gray-500">Due: {format(new Date(invoice.dueDate), 'MMM d, yyyy')}</div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2 items-center relative">
                        {invoice.paymentProof && (
                          <a href={invoice.paymentProof} target="_blank" rel="noreferrer" className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/50 rounded hover:bg-blue-600 hover:text-white transition-colors text-xs font-bold flex items-center gap-1">
                            <ExternalLink className="w-3 h-3"/> Proof
                          </a>
                        )}
                        {invoice.status !== 'PAID' && (
                          <button onClick={() => updateStatus(invoice.id, 'PAID')} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500 transition-colors text-xs font-bold whitespace-nowrap">
                            Mark Paid
                          </button>
                        )}
                        <div className="relative">
                          <button 
                            onClick={() => setOpenDropdown(openDropdown === invoice.id ? null : invoice.id)}
                            className="p-1 hover:bg-gray-800 rounded text-gray-400 transition-colors"
                          >
                            <MoreVertical className="w-5 h-5"/>
                          </button>
                          
                          {openDropdown === invoice.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-50 py-1 flex flex-col text-left">
                              <button onClick={() => { setIsEditing(invoice); setEditData(invoice); setOpenDropdown(null); }} className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2">
                                <Edit className="w-4 h-4"/> Edit
                              </button>
                              <button onClick={() => handleResend(invoice.id)} className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2">
                                <Mail className="w-4 h-4"/> Resend Email
                              </button>
                              <button onClick={() => handleDownload(invoice)} className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2">
                                <Download className="w-4 h-4"/> Download
                              </button>
                              <div className="border-t border-gray-800 my-1"></div>
                              <button onClick={() => handleDelete(invoice.id)} className="px-4 py-2 text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2">
                                <Trash className="w-4 h-4"/> Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">No invoices found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Edit Invoice</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Total Amount</label>
                <input 
                  type="number" 
                  value={editData.totalAmount || ''}
                  onChange={e => setEditData({...editData, totalAmount: parseFloat(e.target.value)})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Currency</label>
                <input 
                  type="text" 
                  value={editData.currency || ''}
                  onChange={e => setEditData({...editData, currency: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <select 
                  value={editData.status || ''}
                  onChange={e => setEditData({...editData, status: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                >
                  <option value="UNPAID">Unpaid</option>
                  <option value="PAID">Paid</option>
                  <option value="PENDING_APPROVAL">Pending Approval</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button 
                onClick={() => setIsEditing(null)}
                className="flex-1 bg-gray-800 text-white rounded-xl py-3 hover:bg-gray-700 font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className="flex-1 bg-blue-600 text-white rounded-xl py-3 hover:bg-blue-500 font-bold transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
</div>
    </div>
  );
}
