'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, CheckCircle, ShieldCheck, User } from 'lucide-react';
import Link from 'next/link';
import { use, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export default function AdminTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/tickets/${ticketId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch ticket');
      const data = await res.json();
      setTicket(data);
    } catch (err) {
      console.error(err);
      alert('Ticket not found');
      router.push('/admin/tickets');
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
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: replyMsg })
      });
      if (res.ok) {
        setReplyMsg('');
        fetchTicket(); // Refresh
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!confirm('Are you sure you want to close this ticket?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/tickets/${ticketId}/close`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchTicket();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!ticket) return null;

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/tickets" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Tickets
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-gray-500">#{ticket.id}</span> {ticket.subject}
          </h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
            <span className="bg-gray-800 px-2 py-0.5 rounded text-white border border-gray-700">{ticket.status}</span>
            <span>Priority: <span className="font-medium text-white">{ticket.priority}</span></span>
            <span>User: {ticket.user?.email}</span>
            <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {ticket.status !== 'CLOSED' && (
            <button 
              onClick={handleCloseTicket}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm font-medium transition-colors text-white"
            >
              <CheckCircle className="w-4 h-4 text-green-400" /> Mark as Closed
            </button>
          )}
          
          <button 
            onClick={() => {
              const newSubject = prompt("Enter new subject:", ticket.subject);
              if (newSubject !== null) {
                const token = localStorage.getItem('token');
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tickets/admin/${ticketId}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                  body: JSON.stringify({ subject: newSubject })
                }).then(res => { if (res.ok) fetchTicket(); });
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 hover:bg-yellow-600 border border-yellow-500/20 rounded-lg text-sm font-medium transition-colors text-yellow-400 hover:text-white"
          >
            Edit Ticket
          </button>

          <button 
            onClick={async () => {
              if (confirm("Are you sure you want to permanently delete this ticket?")) {
                const token = localStorage.getItem('token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tickets/admin/${ticketId}`, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) router.push('/admin/tickets');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-600 border border-red-500/20 rounded-lg text-sm font-medium transition-colors text-red-400 hover:text-white"
          >
            Delete Ticket
          </button>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {ticket.messages.map((msg: any) => (
          <div key={msg.id} className={`p-6 rounded-2xl border ${msg.isStaff ? 'bg-gray-800/50 border-gray-700' : 'bg-blue-900/10 border-blue-500/20'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${msg.isStaff ? 'bg-gray-700' : 'bg-blue-600'}`}>
                {msg.isStaff ? <ShieldCheck className="w-5 h-5 text-gray-300" /> : <User className="w-5 h-5 text-white" />}
              </div>
              <div>
                <p className="font-bold text-white flex items-center gap-2">
                  {msg.isStaff ? msg.user?.username || 'Staff' : ticket.user?.username || 'Customer'}
                  {msg.isStaff && <span className="bg-gray-700 text-gray-300 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider border border-gray-600">Staff</span>}
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
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 text-white">Post a Reply</h3>
          <form onSubmit={handleReply}>
            <textarea 
              value={replyMsg}
              onChange={e => setReplyMsg(e.target.value)}
              required
              rows={4}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 resize-none mb-4"
              placeholder="Type your reply to the customer..."
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
        <div className="bg-gray-900/50 border border-gray-800 text-center p-6 rounded-2xl text-gray-500">
          This ticket has been closed. No further replies can be added.
        </div>
      )}
    </div>
  );
}
