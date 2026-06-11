'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle2, XCircle, ArrowRight, Download, FileText, Search, Filter, Edit, Trash2, X, Save } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Link from 'next/link';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTicket, setEditingTicket] = useState<any>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tickets/admin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch tickets');
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tickets/admin/${editingTicket.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          subject: editingTicket.subject,
          priority: editingTicket.priority,
          status: editingTicket.status
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setTickets(tickets.map(t => t.id === updated.id ? { ...t, ...updated } : t));
        setEditingTicket(null);
      } else {
        alert("Failed to update ticket.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this ticket and all its messages?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tickets/admin/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setTickets(tickets.filter(t => t.id !== id));
      } else {
        alert("Permission denied or error occurred.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full text-xs font-bold flex items-center gap-1 w-max"><Clock className="w-3 h-3"/> OPEN</span>;
      case 'ANSWERED': return <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold flex items-center gap-1 w-max"><CheckCircle2 className="w-3 h-3"/> ANSWERED</span>;
      case 'CLOSED': return <span className="px-3 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-full text-xs font-bold flex items-center gap-1 w-max"><XCircle className="w-3 h-3"/> CLOSED</span>;
      default: return <span className="px-3 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-full text-xs font-bold w-max">{status}</span>;
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchStatus = filter === 'ALL' || t.status === filter;
    const matchPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    const matchSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        t.id.toString() === searchQuery ||
                        (t.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  const exportToExcel = () => {
    if (filteredTickets.length === 0) return alert("No data to export.");
    const worksheet = XLSX.utils.json_to_sheet(filteredTickets.map(t => ({
      ID: t.id,
      Subject: t.subject,
      User: t.user?.email || 'Unknown',
      Priority: t.priority,
      Status: t.status,
      Messages: t._count?.messages || 0,
      Created: new Date(t.createdAt).toLocaleString(),
      Updated: new Date(t.updatedAt).toLocaleString()
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");
    XLSX.writeFile(workbook, "Tickets_Export.xlsx");
  };

  const exportToPDF = () => {
    if (filteredTickets.length === 0) return alert("No data to export.");
    const doc = new jsPDF();
    doc.text("Digital Tech Souls - Support Tickets Export", 14, 15);
    const tableColumn = ["ID", "Subject", "User", "Priority", "Status", "Updated"];
    const tableRows = filteredTickets.map(t => [
      `#${t.id}`, 
      t.subject, 
      t.user?.email || 'Unknown', 
      t.priority, 
      t.status, 
      new Date(t.updatedAt).toLocaleDateString()
    ]);
    const applyAutoTable = (autoTable as any).default || autoTable;
    applyAutoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    doc.save("Tickets_Export.pdf");
  };

  if (loading) return <div className="p-8 text-white">Loading tickets...</div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Support Tickets</h1>
          <p className="text-gray-400 text-sm">Manage and analyze customer support requests</p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={exportToPDF} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2" title="Export PDF">
            <FileText className="w-4 h-4" /> PDF
          </button>
          
          <button onClick={exportToExcel} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2" title="Export Excel">
            <Download className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-4 flex-wrap flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by subject, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-blue-500 outline-none"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              value={filter} 
              onChange={e => setFilter(e.target.value)}
              className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="ANSWERED">Answered</option>
              <option value="CLOSED">Closed</option>
            </select>
            <select 
              value={priorityFilter} 
              onChange={e => setPriorityFilter(e.target.value)}
              className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
        <div className="text-sm text-gray-400">
          Showing <span className="text-white font-bold">{filteredTickets.length}</span> tickets
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-sm font-medium text-gray-400">ID / Subject</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-400">User</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-400">Updated</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="text-gray-500 font-normal">#{ticket.id}</span>
                      {ticket.subject}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-3 mt-1">
                      <span>Priority: {ticket.priority}</span>
                      <span>{ticket._count?.messages || 0} msgs</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300">{ticket.user?.email}</div>
                    <div className="text-xs text-gray-500">{ticket.user?.username || 'No Username'}</div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(ticket.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{new Date(ticket.updatedAt).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link 
                        href={`/admin/tickets/${ticket.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                        title="View & Reply"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => setEditingTicket({...ticket})} 
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-600 hover:text-white transition-colors"
                        title="Edit Ticket"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(ticket.id)} 
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                        title="Delete Ticket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No tickets found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0a0a0a]">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit className="w-5 h-5" /> Edit Ticket #{editingTicket.id}
              </h2>
              <button onClick={() => setEditingTicket(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <form className="space-y-4" onSubmit={handleEditSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
                  <input 
                    type="text" 
                    value={editingTicket.subject}
                    onChange={e => setEditingTicket({...editingTicket, subject: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Priority</label>
                  <select 
                    value={editingTicket.priority}
                    onChange={e => setEditingTicket({...editingTicket, priority: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                  <select 
                    value={editingTicket.status}
                    onChange={e => setEditingTicket({...editingTicket, status: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="ANSWERED">ANSWERED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
                <div className="flex justify-end pt-4">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
