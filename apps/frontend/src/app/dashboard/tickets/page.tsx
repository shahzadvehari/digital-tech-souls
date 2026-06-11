'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Plus, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [router]);

  const fetchTickets = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // Pre-fill email and phone from token payload if possible
      const payloadBase64 = token.split('.')[1];
      if (payloadBase64) {
        let base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
          base64 += '=';
        }
        const payload = JSON.parse(atob(base64));
        if (payload.email) setEmail(payload.email);
        if (payload.phone) setPhone(payload.phone);
      }
    } catch (e) {}

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tickets/my-tickets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch tickets');
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subject, priority, message, email, phone })
      });
      if (res.ok) {
        setIsFormOpen(false);
        setSubject('');
        setMessage('');
        fetchTickets();
      } else {
        alert('Failed to create ticket');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full text-xs font-bold flex items-center gap-1 w-max"><Clock className="w-3 h-3"/> OPEN</span>;
      case 'ANSWERED':
        return <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold flex items-center gap-1 w-max"><CheckCircle2 className="w-3 h-3"/> ANSWERED</span>;
      case 'CLOSED':
        return <span className="px-3 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-full text-xs font-bold flex items-center gap-1 w-max"><XCircle className="w-3 h-3"/> CLOSED</span>;
      default:
        return <span className="px-3 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-full text-xs font-bold w-max">{status}</span>;
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
            
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold">Support Tickets</h1>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard" className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors">
              Back to Dashboard
            </Link>
            <button 
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" /> Open New Ticket
            </button>
          </div>
        </div>

        {isFormOpen && (
          <form onSubmit={handleCreateTicket} className="bg-[#111] border border-white/10 p-6 rounded-2xl mb-8">
            <h2 className="text-xl font-bold mb-4">Create New Ticket</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Subject</label>
                <input 
                  type="text" required value={subject} onChange={e => setSubject(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                  placeholder="E.g. Issue with my license key"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Priority</label>
                <select 
                  value={priority} onChange={e => setPriority(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                <input 
                  type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                  placeholder="+1234567890"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">Message</label>
              <textarea 
                required value={message} onChange={e => setMessage(e.target.value)} rows={4}
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 resize-none"
                placeholder="Describe your issue in detail..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
              <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold">
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        )}

        {tickets.length === 0 ? (
          <div className="bg-[#111] border border-white/10 rounded-2xl p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Support Tickets</h2>
            <p className="text-gray-400">If you need help, feel free to open a new ticket.</p>
          </div>
        ) : (
          <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 font-medium text-gray-400">ID</th>
                    <th className="px-6 py-4 font-medium text-gray-400">Subject</th>
                    <th className="px-6 py-4 font-medium text-gray-400">Status</th>
                    <th className="px-6 py-4 font-medium text-gray-400">Updated</th>
                    <th className="px-6 py-4 font-medium text-gray-400"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium">#{ticket.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white">{ticket.subject}</div>
                        <div className="text-xs text-gray-500">{ticket._count?.messages || 0} messages</div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {new Date(ticket.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/dashboard/tickets/${ticket.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
