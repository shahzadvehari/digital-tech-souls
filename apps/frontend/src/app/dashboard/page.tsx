'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Package, Clock, CheckCircle2, XCircle } from 'lucide-react';
import Footer from '@/components/Footer';

export default function DashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {}
    }

    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/orders/my-orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        
        if (!res.ok) throw new Error('Failed to fetch orders');
        
        const data = await res.json();
        setOrders(data);

        // Fetch tickets
        const ticketsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tickets/my-tickets`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (ticketsRes.ok) {
          const ticketsData = await ticketsRes.json();
          setTickets(ticketsData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

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

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
            
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-12 h-12 rounded-full object-cover border-2 border-gray-800" />
            ) : (
              <Package className="w-8 h-8 text-blue-500" />
            )}
            <div>
              <h1 className="text-3xl font-bold">My Dashboard</h1>
              {user && (
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm text-gray-400">Identity Code:</span>
                  <span className="font-mono text-xs text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    DTS-UID-{String(user.id).padStart(4, '0')}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => router.push('/dashboard/vault')}
              className="px-4 py-2 bg-purple-600/10 text-purple-400 hover:bg-purple-600/20 rounded-lg font-bold transition-colors"
            >
              My Vault
            </button>
            <button 
              onClick={() => router.push('/dashboard/subscriptions')}
              className="px-4 py-2 bg-pink-600/10 text-pink-400 hover:bg-pink-600/20 rounded-lg font-bold transition-colors"
            >
              Subscriptions
            </button>
            <button 
              onClick={() => router.push('/dashboard/affiliate')}
              className="px-4 py-2 bg-green-600/10 text-green-400 hover:bg-green-600/20 rounded-lg font-bold transition-colors"
            >
              Affiliates
            </button>
            <button 
              onClick={() => router.push('/dashboard/tickets')}
              className="px-4 py-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 rounded-lg font-bold transition-colors"
            >
              Support
            </button>
            <button 
              onClick={() => router.push('/dashboard/invoices')}
              className="px-4 py-2 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 rounded-lg font-bold transition-colors"
            >
              Invoices
            </button>
            <button 
              onClick={() => router.push('/dashboard/settings')}
              className="px-4 py-2 bg-gray-600/10 text-gray-400 hover:bg-gray-600/20 rounded-lg font-bold transition-colors"
            >
              Settings
            </button>
          </div>
        </div>
        
        {orders.length === 0 ? (
          <div className="bg-[#111] border border-white/10 rounded-2xl p-12 text-center">
            <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Orders Yet</h2>
            <p className="text-gray-400 mb-6">You haven't purchased any themes or tools yet.</p>
            <button 
              onClick={() => router.push('/themes-tools')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-colors"
            >
              Browse Store
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
                {/* Order Header */}
                <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Order #{order.id}</p>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-sm text-gray-400">Total</p>
                        <p className="font-bold text-white">{order.currency === 'PKR' ? 'Rs. ' : '$'}{order.totalAmount}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(order.status)}
                        <button
                          onClick={() => {
                            const token = localStorage.getItem('token');
                            window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/orders/${order.id}/invoice?token=${token}`, '_blank');
                          }}
                          className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-full text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Download className="w-3 h-3"/> Invoice
                        </button>
                      </div>
                    </div>
                </div>
                
                {/* Order Items */}
                <div className="p-6 divide-y divide-white/10">
                  {order.trackingNote && (
                    <div className="pb-4 mb-4 border-b border-white/5">
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <h4 className="text-sm font-bold text-blue-400 mb-1">Tracking / Delivery Update</h4>
                        <p className="text-sm text-gray-300">{order.trackingNote}</p>
                      </div>
                    </div>
                  )}
                  {order.items.map((item: any) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-lg text-white">{item.productName}</p>
                        <p className="text-sm text-blue-400">{item.productType}</p>
                      </div>
                      
                      <div>
                        {['PAID', 'COMPLETED'].includes(order.status) ? (
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-green-500 font-bold">License Generated</span>
                            <button 
                              onClick={() => router.push('/dashboard/vault')}
                              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                            >
                              Go to Vault
                            </button>
                          </div>
                        ) : order.status === 'PROCESSING' ? (
                          <span className="text-xs text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                            Being Processed
                          </span>
                        ) : (
                          <span className="text-xs text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                            Waiting for Approval
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tickets Section */}
        <div className="flex items-center justify-between mb-8 mt-16">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-500" />
            <h2 className="text-2xl font-bold">Support Tickets</h2>
          </div>
          <button 
            onClick={() => router.push('/dashboard/tickets')}
            className="text-sm text-blue-400 hover:text-blue-300 font-bold transition-colors"
          >
            View All Tickets
          </button>
        </div>

        {tickets.length === 0 ? (
          <div className="bg-[#111] border border-white/10 rounded-2xl p-12 text-center">
            <h2 className="text-xl font-bold mb-2">No Support Tickets</h2>
            <p className="text-gray-400 mb-6">You don't have any open support tickets right now.</p>
            <button 
              onClick={() => router.push('/dashboard/tickets')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-colors"
            >
              Open a Ticket
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {tickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className="bg-[#111] border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-colors cursor-pointer flex flex-col h-full"
                onClick={() => router.push(`/dashboard/tickets/${ticket.id}`)}
              >
                 <div className="flex justify-between items-start mb-4">
                    <span className="text-sm text-gray-400 font-mono">#{String(ticket.id).padStart(4, '0')}</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${ticket.status === 'OPEN' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : ticket.status === 'ANSWERED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
                      {ticket.status}
                    </span>
                 </div>
                 <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{ticket.subject}</h3>
                 <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                   <div className="flex items-center gap-2">
                     <span className="text-xs text-gray-500">Priority:</span>
                     <span className={`text-xs font-bold ${ticket.priority === 'HIGH' ? 'text-red-400' : ticket.priority === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'}`}>{ticket.priority}</span>
                   </div>
                   <span className="text-xs text-gray-500">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                 </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
