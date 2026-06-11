"use client";

import React, { useState, useEffect } from 'react';
import { Save, Loader2, Users, Activity, Globe, Monitor, Smartphone, Tablet } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export default function AnalyticsDashboard() {
  const [gaId, setGaId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Real Local DB Stats
  const [stats, setStats] = useState({
    activeUsers: 0,
    monthlyVisitors: 0,
    monthlyData: [],
    regionData: [],
    mrr: 0,
    totalSales: 0,
    ticketsResolved: 0,
    activeTickets: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      // 1. Fetch GA ID from Settings
      const resSettings = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/settings`);
      if (resSettings.ok) {
        const data = await resSettings.json();
        const gaSetting = data.find((s: any) => s.key === 'ga_measurement_id');
        if (gaSetting) setGaId(gaSetting.value);
      }

      // 2. Fetch Real Stats
      const resStats = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/analytics/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resStats.ok) {
        setStats(await resStats.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGaId = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('token');
    const role = JSON.parse(localStorage.getItem('user') || '{}').role || 'SUPER_USER';

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ key: 'ga_measurement_id', value: gaId, description: 'Google Analytics Measurement ID' })
      });
      if (res.ok) {
        setMessage('Google Analytics ID saved! Tracking script is now live.');
      } else {
        setMessage('Failed to save. Check your permissions.');
      }
    } catch (err) {
      setMessage('Error saving GA ID.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  if (loading) return <div className="p-8 text-white flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Traffic & Analytics</h1>
          <p className="text-gray-400 text-sm">Monitor your website traffic and set up Google Analytics tracking.</p>
        </div>
      </div>

      {/* GA Setup Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" /> Google Analytics Integration
        </h2>
        {message && (
          <div className={`p-4 mb-4 rounded-lg text-sm ${message.includes('saved') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSaveGaId} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-400 mb-1">Measurement ID (G-XXXXXXXXXX)</label>
            <input 
              type="text" 
              value={gaId} 
              onChange={e => setGaId(e.target.value)} 
              placeholder="G-..."
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" 
            />
          </div>
          <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 h-[42px] disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save ID
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">Entering your Measurement ID will automatically inject the gtag.js tracking code into your website header.</p>
      </div>

      {/* Simulated Analytics Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Users (Last 5m)</p>
              <h3 className="text-3xl font-bold text-white">{stats.activeUsers}</h3>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400">MRR (Monthly)</p>
              <h3 className="text-3xl font-bold text-white">${stats.mrr.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-500">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Sales</p>
              <h3 className="text-3xl font-bold text-white">${stats.totalSales.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Tickets</p>
              <h3 className="text-3xl font-bold text-white">{stats.activeTickets}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Visitor Trends (Last 7 Months)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066FF" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#4B5563" />
                <YAxis stroke="#4B5563" />
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="visitors" stroke="#0066FF" fillOpacity={1} fill="url(#colorVisitors)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6">Region Wise Details</h3>
          <div className="h-[250px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.regionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.regionData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {stats.regionData.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4] }}></span>
                <span className="text-gray-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
