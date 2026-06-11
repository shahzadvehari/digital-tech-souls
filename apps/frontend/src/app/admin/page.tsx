"use client";

import React, { useState, useEffect } from 'react';
import { Users, Server, Globe, DollarSign, Loader2, Package, Inbox, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRouter } from 'next/navigation';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>('NORMAL_USER');
  const [dateFilter, setDateFilter] = useState<string>('all_time');
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (!token || !userStr) {
        window.location.href = '/login';
        return;
      }
      try {
        const user = JSON.parse(userStr);
        setRole(user.role || 'NORMAL_USER');

        let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/stats/dashboard`;
        
        // Calculate date ranges
        const today = new Date();
        let startDate: Date | null = null;
        let endDate: Date | null = null;

        if (dateFilter === 'today') {
          startDate = new Date();
          startDate.setHours(0,0,0,0);
        } else if (dateFilter === 'this_week') {
          startDate = new Date();
          const day = startDate.getDay() || 7; // Get current day number, converting Sun. to 7
          if (day !== 1) startDate.setHours(-24 * (day - 1)); // Set to Monday
          startDate.setHours(0,0,0,0);
        } else if (dateFilter === 'this_month') {
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        } else if (dateFilter === 'last_month') {
          startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        } else if (dateFilter === 'this_year') {
          startDate = new Date(today.getFullYear(), 0, 1);
        }

        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate.toISOString());
        if (endDate) params.append('endDate', endDate.toISOString());
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [router, dateFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return <div className="text-red-400">Error loading dashboard data.</div>;
  }

  const exportPDF = async () => {
    // The browser's native print dialog is much more reliable than html2canvas 
    // and correctly parses modern CSS (like lab colors), while preserving text selection.
    window.print();
  };

  return (
    <div id="admin-dashboard-report" className="p-4 bg-[#0a0a0a] min-h-screen">
      <style>{`
        @media print {
          /* Hide everything outside the report */
          body * {
            visibility: hidden;
          }
          #admin-dashboard-report, #admin-dashboard-report * {
            visibility: visible;
          }
          #admin-dashboard-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #0a0a0a !important; /* Keep dark theme for print if desired, or change */
            padding: 0;
          }
          /* Hide the export button */
          #export-btn {
            display: none !important;
          }
        }
      `}</style>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
        <div className="flex items-center gap-4">
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg outline-none cursor-pointer"
          >
            <option value="all_time">All Time</option>
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_year">This Year</option>
          </select>
          <button 
            id="export-btn"
            onClick={exportPDF}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg"
          >
            <Download className="w-4 h-4" /> Save as PDF
          </button>
        </div>
      </div>
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        {role === 'SUPER_USER' && (
          <div onClick={() => router.push('/admin/users')} className="bg-gray-900 border border-gray-800 rounded-xl p-6 cursor-pointer hover:bg-gray-800 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">Total Users</h3>
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Users className="w-5 h-5"/>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
          </div>
        )}

        {['SUPER_USER', 'ADMIN_USER'].includes(role) && (
          <div onClick={() => router.push('/admin/leads')} className="bg-gray-900 border border-gray-800 rounded-xl p-6 cursor-pointer hover:bg-gray-800 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">New Leads</h3>
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                <Globe className="w-5 h-5"/>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.newLeads}</div>
          </div>
        )}

        {['SUPER_USER', 'ADMIN_USER'].includes(role) && (
          <div onClick={() => router.push('/admin/tickets')} className="bg-gray-900 border border-gray-800 rounded-xl p-6 cursor-pointer hover:bg-gray-800 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">Pending Tickets</h3>
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Inbox className="w-5 h-5"/>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.pendingTickets}</div>
          </div>
        )}

        {role === 'SUPER_USER' && (
          <div onClick={() => router.push('/admin/analytics')} className="bg-gray-900 border border-gray-800 rounded-xl p-6 cursor-pointer hover:bg-gray-800 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">Total Revenue</h3>
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                <DollarSign className="w-5 h-5"/>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">Rs. {stats.totalRevenue?.toLocaleString()}</div>
          </div>
        )}

        {role === 'SUPER_USER' && (
          <div onClick={() => router.push('/admin/orders')} className="bg-gray-900 border border-gray-800 rounded-xl p-6 cursor-pointer hover:bg-gray-800 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">Total Sales</h3>
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                <Package className="w-5 h-5"/>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalSalesCount || 0}</div>
          </div>
        )}

        {role === 'SUPER_USER' && (
          <div onClick={() => router.push('/admin/commissions')} className="bg-gray-900 border border-gray-800 rounded-xl p-6 cursor-pointer hover:bg-gray-800 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">Reseller Sales</h3>
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <DollarSign className="w-5 h-5"/>
              </div>
            </div>
            <div className="text-3xl font-bold text-white">Rs. {stats.resellerSalesAmount?.toLocaleString() || 0}</div>
          </div>
        )}
      </div>

      {/* Order Statistics Row */}
      {['SUPER_USER', 'ADMIN_USER'].includes(role) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div onClick={() => router.push('/admin/orders')} className="bg-gray-900 border border-gray-800 rounded-xl p-6 cursor-pointer hover:bg-gray-800 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 font-medium">Total Orders</h3>
              <Package className="w-5 h-5 text-blue-400"/>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalOrdersCount || 0}</div>
          </div>
          <div onClick={() => router.push('/admin/orders?status=PENDING')} className="bg-gray-900 border border-gray-800 rounded-xl p-6 cursor-pointer hover:bg-gray-800 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 font-medium">Pending Orders</h3>
              <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
            </div>
            <div className="text-3xl font-bold text-yellow-400">{stats.pendingOrdersCount || 0}</div>
          </div>
          <div onClick={() => router.push('/admin/orders?status=PAID')} className="bg-gray-900 border border-gray-800 rounded-xl p-6 cursor-pointer hover:bg-gray-800 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 font-medium">Completed / Paid</h3>
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            </div>
            <div className="text-3xl font-bold text-green-400">{stats.completedOrdersCount || 0}</div>
          </div>
          <div onClick={() => router.push('/admin/orders?status=CANCELLED')} className="bg-gray-900 border border-gray-800 rounded-xl p-6 cursor-pointer hover:bg-gray-800 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 font-medium">Cancelled</h3>
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
            </div>
            <div className="text-3xl font-bold text-red-400">{stats.cancelledOrdersCount || 0}</div>
          </div>
        </div>
      )}

      {/* Revenue Chart */}
      {role === 'SUPER_USER' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-bold mb-6 text-white">Revenue (Last 30 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#666" 
                  tick={{fill: '#888'}} 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis 
                  stroke="#666" 
                  tick={{fill: '#888'}}
                  tickFormatter={(value) => `Rs.${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#60a5fa' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Two-Column Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Orders */}
        {['SUPER_USER', 'ADMIN_USER'].includes(role) && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><Package className="w-5 h-5"/> Recent Orders</h3>
              <button onClick={() => router.push('/admin/orders')} className="text-sm text-blue-400 hover:text-blue-300">View All</button>
            </div>
            
            <div className="space-y-4">
              {stats.recentOrders.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent orders found.</p>
              ) : (
                stats.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-white/5">
                    <div>
                      <p className="font-medium text-white">Order #{order.id}</p>
                      <p className="text-xs text-gray-500">{order.user?.email || 'Unknown User'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-400">{order.currency === 'PKR' ? 'Rs.' : '$'}{order.totalAmount}</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Recent Tickets */}
        {['SUPER_USER', 'ADMIN_USER'].includes(role) && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><Inbox className="w-5 h-5"/> Active Tickets</h3>
              <button onClick={() => router.push('/admin/tickets')} className="text-sm text-blue-400 hover:text-blue-300">View All</button>
            </div>
            
            <div className="space-y-4">
              {stats.recentTickets.length === 0 ? (
                <p className="text-gray-500 text-sm">No active tickets.</p>
              ) : (
                stats.recentTickets.map((ticket: any) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-white/5 cursor-pointer hover:bg-black/50 transition-colors" onClick={() => router.push(`/admin/tickets/${ticket.id}`)}>
                    <div>
                      <p className="font-medium text-white truncate max-w-[200px]">{ticket.subject}</p>
                      <p className="text-xs text-gray-500">{ticket.user?.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${
                      ticket.priority === 'HIGH' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                      ticket.priority === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                      'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {ticket.priority}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
