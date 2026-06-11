'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, ArrowLeft, Send, ShieldCheck, User } from 'lucide-react';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { use, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const ticketId = unwrappedParams.id;
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyMsg, setReplyMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchTicket();

    let socket: Socket;
    if (ticketId) {
      socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
      
      socket.emit('joinTicket', { ticketId: parseInt(ticketId as string, 10) });
      
      socket.on('newMessage', (msg: any) => {
        setTicket((prev: any) => {
          if (!prev) return prev;
          if (prev.messages.some((m: any) => m.id === msg.id)) return prev;
          return { ...prev, messages: [...prev.messages, msg] };
        });
      });
    }

    return () => {
      if (socket) {
        socket.emit('leaveTicket', { ticketId: parseInt(ticketId as string, 10) });
        socket.disconnect();
      }
    };
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  const fetchTicket = async () => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/login');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/tickets/${ticketId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        return router.push('/login');
      }
      if (!res.ok) throw new Error('Failed to fetch ticket');
      const data = await res.json();
      setTicket(data);
    } catch (err) {
      console.error(err);
      alert('Ticket not found or unauthorized');
      router.push('/dashboard/tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMsg.trim()) return;
    setSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: replyMsg })
      });
      if (res.ok) {
        setReplyMsg('');
        fetchTicket(); // Refresh thread
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>;
  if (!ticket) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
            
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="mb-6">
          <Link href="/dashboard/tickets" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Tickets
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                #{ticket.id} - {ticket.subject}
              </h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                <span className="bg-white/10 px-2 py-0.5 rounded text-white">{ticket.status}</span>
                <span>Priority: {ticket.priority}</span>
                <span>Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {ticket.messages.map((msg: any) => (
            <div key={msg.id} className={`p-6 rounded-2xl border ${msg.isStaff ? 'bg-blue-900/10 border-blue-500/20' : 'bg-[#111] border-white/10'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${msg.isStaff ? 'bg-blue-600' : 'bg-gray-700'}`}>
                  {msg.isStaff ? <ShieldCheck className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-gray-300" />}
                </div>
                <div>
                  <p className="font-bold text-white flex items-center gap-2">
                    {msg.isStaff ? 'Support Team' : 'You'}
                    {msg.isStaff && <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Staff</span>}
                  </p>
                  <p className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {msg.message}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {ticket.status !== 'CLOSED' ? (
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Post a Reply</h3>
            <form onSubmit={handleReply}>
              <textarea 
                value={replyMsg}
                onChange={e => setReplyMsg(e.target.value)}
                required
                rows={4}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 resize-none mb-4"
                placeholder="Type your reply here..."
              />
              <div className="flex justify-end">
                <button 
                  type="submit" disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> {submitting ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-gray-900/50 border border-gray-800 text-center p-6 rounded-2xl text-gray-400">
            This ticket has been closed. You cannot reply to it.
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
