"use client";

import React, { useEffect, useState } from 'react';
import { FileText, Download, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface Invoice {
  id: number;
  invoiceNumber: string;
  totalAmount: number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  dueDate: string;
  createdAt: string;
  orderId: number | null;
}

export default function ClientInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/invoices/my-invoices`, {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/50 rounded-full text-xs font-bold flex items-center gap-1 w-max"><CheckCircle className="w-3 h-3"/> Paid</span>;
      case 'PENDING_APPROVAL': return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded-full text-xs font-bold flex items-center gap-1 w-max"><Clock className="w-3 h-3"/> Reviewing Payment</span>;
      case 'UNPAID': return <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/50 rounded-full text-xs font-bold flex items-center gap-1 w-max"><Clock className="w-3 h-3"/> Unpaid</span>;
      case 'CANCELLED': return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 border border-gray-500/50 rounded-full text-xs font-bold flex items-center gap-1 w-max"><XCircle className="w-3 h-3"/> Cancelled</span>;
      default: return <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-bold w-max">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <FileText className="w-8 h-8 text-blue-500" />
        <div>
          <h1 className="text-3xl font-bold">My Invoices</h1>
          <p className="text-gray-400 mt-1">View and manage your billing history</p>
        </div>
      </div>

      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>You have no invoices yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="pb-4 font-medium px-4">Invoice #</th>
                  <th className="pb-4 font-medium px-4">Amount</th>
                  <th className="pb-4 font-medium px-4">Status</th>
                  <th className="pb-4 font-medium px-4">Date / Due Date</th>
                  <th className="pb-4 font-medium px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {invoices.map(invoice => (
                  <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-white">{invoice.invoiceNumber}</div>
                      {invoice.orderId && <div className="text-xs text-gray-500">Order ID: {invoice.orderId}</div>}
                    </td>
                    <td className="py-4 px-4 font-mono text-white">
                      {invoice.totalAmount.toLocaleString()} {invoice.currency}
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(invoice.status)}</td>
                    <td className="py-4 px-4">
                      <div className="text-gray-300">{format(new Date(invoice.createdAt), 'MMM d, yyyy')}</div>
                      <div className="text-xs text-gray-500">Due: {format(new Date(invoice.dueDate), 'MMM d, yyyy')}</div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        {invoice.status === 'UNPAID' && invoice.orderId && (
                          <button 
                            onClick={() => router.push(`/checkout/${invoice.orderId}`)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-xs font-bold"
                          >
                            Pay Now
                          </button>
                        )}
                        {invoice.orderId && (
                           <button
                             onClick={() => {
                               const token = localStorage.getItem('token');
                               window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/orders/${invoice.orderId}/invoice?token=${token}`, '_blank');
                             }}
                             className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                           >
                             <Download className="w-4 h-4"/>
                           </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
