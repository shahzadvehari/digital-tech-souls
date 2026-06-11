'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Package, Search, Filter, CheckCircle2, XCircle, Clock, Eye, Trash2, Edit, Save, X, Download, FileText, Mail } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function AdminOrdersContent() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [editTotal, setEditTotal] = useState<string>('');
  const [editStatus, setEditStatus] = useState<string>('');
  const [editPayment, setEditPayment] = useState<string>('');
  const [editTrackingNote, setEditTrackingNote] = useState<string>('');
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'ALL');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toString().includes(searchQuery) ||
      (order.user?.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const exportToExcel = () => {
    if (filteredOrders.length === 0) {
      alert("No orders to export.");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(filteredOrders.map(order => ({
      'Order ID': order.id,
      'Customer Name': order.user?.username || 'Unknown',
      'Customer Email': order.user?.email || '',
      'Amount': `${order.currency === 'PKR' ? 'Rs.' : '$'}${order.totalAmount}`,
      'Status': order.status,
      'Payment Method': order.paymentMethod,
      'Date': new Date(order.createdAt).toLocaleString()
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, "Orders_Export.xlsx");
  };

  const exportToPDF = () => {
    if (filteredOrders.length === 0) {
      alert("No orders to export.");
      return;
    }
    const doc = new jsPDF();
    
    doc.text("Digital Tech Souls - Orders Export", 14, 15);
    
    const tableColumn = ["ID", "Customer", "Amount", "Status", "Method", "Date"];
    const tableRows: any[] = [];

    filteredOrders.forEach(order => {
      const orderData = [
        `#${order.id}`,
        order.user?.username || 'Unknown',
        `${order.currency === 'PKR' ? 'Rs.' : '$'}${order.totalAmount}`,
        order.status,
        order.paymentMethod || 'MANUAL',
        new Date(order.createdAt).toLocaleDateString()
      ];
      tableRows.push(orderData);
    });

    const applyAutoTable = (autoTable as any).default || autoTable;
    applyAutoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save("Orders_Export.pdf");
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: number, status: string) => {
    if (!confirm(`Are you sure you want to mark this order as ${status}?`)) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchOrders();
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      alert('Error updating order');
    }
  };

  const startEdit = (order: any) => {
    setEditingOrderId(order.id);
    setEditTotal(order.totalAmount.toString());
    setEditStatus(order.status);
    setEditPayment(order.paymentMethod || 'MANUAL');
    setEditTrackingNote(order.trackingNote || '');
  };

  const saveEdit = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          totalAmount: parseFloat(editTotal),
          status: editStatus,
          paymentMethod: editPayment,
          trackingNote: editTrackingNote
        })
      });
      if (res.ok) {
        setEditingOrderId(null);
        fetchOrders();
      } else {
        alert('Failed to save order updates');
      }
    } catch (err) {
      alert('Error saving order updates');
    }
  };

  const deleteOrder = async (id: number) => {
    if (!confirm('Are you sure you want to completely remove this order? This action cannot be undone.')) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/orders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchOrders();
      } else {
        alert('Failed to delete order');
      }
    } catch (err) {
      alert('Error deleting order');
    }
  };

  const resendInvoiceEmail = async (id: number) => {
    if (!confirm('Send a copy of the invoice to the customer\'s email?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/orders/${id}/resend-invoice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        alert('Invoice successfully sent to customer email!');
      } else {
        alert('Failed to send invoice email.');
      }
    } catch (err) {
      alert('Network error while sending email.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-bold flex items-center gap-1 w-max"><CheckCircle2 className="w-3 h-3"/> PAID</span>;
      case 'PENDING':
        return <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full text-xs font-bold flex items-center gap-1 w-max"><Clock className="w-3 h-3"/> PENDING</span>;
      case 'PROCESSING':
        return <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold flex items-center gap-1 w-max"><Clock className="w-3 h-3"/> PROCESSING</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-full text-xs font-bold flex items-center gap-1 w-max"><CheckCircle2 className="w-3 h-3"/> COMPLETED</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-bold flex items-center gap-1 w-max"><XCircle className="w-3 h-3"/> CANCELLED</span>;
      case 'REFUNDED':
        return <span className="px-3 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-full text-xs font-bold flex items-center gap-1 w-max"><XCircle className="w-3 h-3"/> REFUNDED</span>;
      default:
        return <span className="px-3 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-full text-xs font-bold w-max">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Order Management</h1>
          <p className="text-gray-400 text-sm mt-1">Review and approve customer orders</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search orders (ID, Name, Email)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 bg-[#111] border border-white/10 p-2 rounded-lg text-gray-400">
            <Filter className="w-4 h-4" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent outline-none text-sm text-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="PAID">Paid</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
          <button onClick={exportToPDF} className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2" title="Export PDF">
            <FileText className="w-4 h-4" /> <span className="hidden sm:inline">PDF</span>
          </button>
          <button onClick={exportToExcel} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2" title="Export Excel">
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Excel</span>
          </button>
        </div>
      </div>

      <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-black/20 border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center">Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No orders found.</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono text-white">#{order.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                          {order.user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="text-white font-medium">{order.user?.username || 'Unknown User'}</div>
                          <div className="text-xs text-gray-500">{order.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      {editingOrderId === order.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">{order.currency === 'PKR' ? 'Rs.' : '$'}</span>
                          <input 
                            type="number" 
                            value={editTotal} 
                            onChange={(e) => setEditTotal(e.target.value)}
                            className="w-20 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm outline-none"
                          />
                        </div>
                      ) : (
                        <>{order.currency === 'PKR' ? 'Rs. ' : '$'}{order.totalAmount}</>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingOrderId === order.id ? (
                        <select 
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm outline-none text-white"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="PAID">PAID</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                          <option value="REFUNDED">REFUNDED</option>
                        </select>
                      ) : (
                        getStatusBadge(order.status)
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingOrderId === order.id ? (
                        <div className="flex flex-col gap-2">
                          <select 
                            value={editPayment}
                            onChange={(e) => setEditPayment(e.target.value)}
                            className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm outline-none text-white w-full"
                          >
                            <option value="MANUAL">MANUAL</option>
                            <option value="STRIPE">STRIPE</option>
                            <option value="PAYPAL">PAYPAL</option>
                            <option value="EASYPAISA">EASYPAISA</option>
                          </select>
                          <input 
                            type="text" 
                            placeholder="Tracking note..." 
                            value={editTrackingNote}
                            onChange={(e) => setEditTrackingNote(e.target.value)}
                            className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm outline-none text-white w-full"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {order.paymentProof ? (
                            <a 
                              href={order.paymentProof} 
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <Eye className="w-4 h-4" /> View Receipt
                            </a>
                          ) : (
                            <span className="text-gray-500">{order.paymentMethod || 'None'}</span>
                          )}
                          {order.trackingNote && (
                            <span className="text-xs text-purple-400 font-medium">Note: {order.trackingNote}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      {editingOrderId === order.id ? (
                        <>
                          <button onClick={() => saveEdit(order.id)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold flex items-center gap-1 transition-colors" title="Save Changes">
                            <Save className="w-4 h-4" /> Save
                          </button>
                          <button onClick={() => setEditingOrderId(null)} className="px-3 py-1.5 mt-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs font-bold flex items-center gap-1 transition-colors" title="Cancel">
                            <X className="w-4 h-4" /> Cancel
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col gap-2 items-end">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => startEdit(order)}
                              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <Edit className="w-3 h-3" /> Edit
                            </button>
                            {order.status !== 'PAID' && (
                              <button 
                                onClick={() => updateOrderStatus(order.id, 'PAID')}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-bold flex items-center gap-1 transition-colors"
                              >
                                <CheckCircle2 className="w-3 h-3"/> Approve
                              </button>
                            )}
                            <button 
                              onClick={() => deleteOrder(order.id)}
                              className="px-3 py-1.5 bg-red-600/10 text-red-500 hover:bg-red-600/30 rounded text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const token = localStorage.getItem('token');
                                window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/orders/${order.id}/invoice?token=${token}`, '_blank');
                              }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <FileText className="w-3 h-3"/> PDF Invoice
                            </button>
                            <button 
                              onClick={() => resendInvoiceEmail(order.id)}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <Mail className="w-3 h-3" /> Email User
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white">Loading...</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
