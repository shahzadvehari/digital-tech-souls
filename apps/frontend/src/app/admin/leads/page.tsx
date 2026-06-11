"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw, Plus, X, Save, Download, FileText, Edit, Trash, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function LeadsAdmin() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('ADMIN_USER');
  const [isCreating, setIsCreating] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [viewingLead, setViewingLead] = useState<any>(null);
  const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', city: '', country: '', message: '' });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/leads`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (error) {
      console.error('Failed to fetch leads', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/leads`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newLead)
      });
      if (res.ok) {
        const created = await res.json();
        setLeads([...leads, created]);
        setIsCreating(false);
        setNewLead({ name: '', email: '', phone: '', city: '', country: '', message: '' });
      } else {
        alert("Failed to create lead.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/leads/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setLeads(leads.map(lead => lead.id === id ? { ...lead, status } : lead));
      } else {
        alert("Permission denied. Only ADMIN or SUPER_USER can update leads.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/leads/${editingLead.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(editingLead)
      });
      if (res.ok) {
        const updated = await res.json();
        setLeads(leads.map(l => l.id === updated.id ? updated : l));
        setEditingLead(null);
      } else {
        alert("Failed to update lead.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/leads/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setLeads(leads.filter(l => l.id !== id));
      } else {
        alert("Permission denied or error occurred.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const exportToExcel = () => {
    if (leads.length === 0) {
      alert("No leads to export.");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(leads.map(lead => ({
      ID: lead.id,
      Name: lead.name,
      Email: lead.email,
      Phone: lead.phone || '',
      City: lead.city || '',
      Country: lead.country || '',
      Status: lead.status,
      Message: lead.message,
      CreatedAt: new Date(lead.createdAt).toLocaleString()
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    XLSX.writeFile(workbook, "Leads_Export.xlsx");
  };

  const exportToPDF = () => {
    if (leads.length === 0) {
      alert("No leads to export.");
      return;
    }
    const doc = new jsPDF();
    
    doc.text("Digital Tech Souls - Leads Export", 14, 15);
    
    const tableColumn = ["Name", "Email", "Phone", "Location", "Status", "Date"];
    const tableRows: any[] = [];

    leads.forEach(lead => {
      const leadData = [
        lead.name,
        lead.email,
        lead.phone || '-',
        [lead.city, lead.country].filter(Boolean).join(', ') || '-',
        lead.status,
        new Date(lead.createdAt).toLocaleDateString()
      ];
      tableRows.push(leadData);
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

    doc.save("Leads_Export.pdf");
  };

  return (
    <div className="max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Lead Management</h2>
          <p className="text-gray-400 text-sm">View and manage contact requests and inquiries.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-900 p-2 rounded-lg border border-gray-800">
            <label className="text-sm text-gray-400">Role:</label>
            <select 
              value={role} 
              onChange={e => setRole(e.target.value)}
              className="bg-gray-800 text-white text-sm rounded border-gray-700 outline-none"
            >
              <option value="SUPER_USER">Super User</option>
              <option value="ADMIN_USER">Admin User</option>
              <option value="NORMAL_USER">Normal User</option>
            </select>
          </div>

          {!isCreating && (
            <button 
              onClick={() => setIsCreating(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Lead
            </button>
          )}

          <button onClick={exportToPDF} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2" title="Export PDF">
            <FileText className="w-4 h-4" /> PDF
          </button>
          
          <button onClick={exportToExcel} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2" title="Export Excel">
            <Download className="w-4 h-4" /> Excel
          </button>

          <button onClick={fetchLeads} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {isCreating ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Create New Lead</h3>
            <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-white p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form className="space-y-4" onSubmit={handleCreate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                <input 
                  type="text" 
                  value={newLead.name}
                  onChange={e => setNewLead({...newLead, name: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" 
                  placeholder="e.g. John Doe" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input 
                  type="email" 
                  value={newLead.email}
                  onChange={e => setNewLead({...newLead, email: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" 
                  placeholder="john@example.com" 
                  required 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone (Optional)</label>
                <input 
                  type="text" 
                  value={newLead.phone}
                  onChange={e => setNewLead({...newLead, phone: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" 
                  placeholder="+1 234 567 890" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">City (Optional)</label>
                <input 
                  type="text" 
                  value={newLead.city}
                  onChange={e => setNewLead({...newLead, city: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" 
                  placeholder="e.g. New York" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Country (Optional)</label>
                <input 
                  type="text" 
                  value={newLead.country}
                  onChange={e => setNewLead({...newLead, country: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" 
                  placeholder="e.g. USA" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Message</label>
              <textarea 
                value={newLead.message}
                onChange={e => setNewLead({...newLead, message: e.target.value})}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 h-24" 
                placeholder="Inquiry details..." 
                required 
              />
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Lead
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-950 border-b border-gray-800 text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Contact Info</th>
                <th className="px-6 py-4 font-medium">Message</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No active leads found in the database.
                  </td>
                </tr>
              ) : (
                leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{lead.name}</td>
                    <td className="px-6 py-4 text-gray-300">
                      <div>{lead.email}</div>
                      <div className="text-xs text-gray-500">{lead.phone}</div>
                      {(lead.city || lead.country) && (
                        <div className="text-xs text-gray-400 mt-1">
                          {[lead.city, lead.country].filter(Boolean).join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 max-w-xs truncate">{lead.message}</td>
                    <td className="px-6 py-4">
                      <select 
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className={`text-xs font-bold px-2 py-1 rounded outline-none border border-transparent hover:border-gray-600 ${
                          lead.status === 'NEW' ? 'bg-green-500/20 text-green-400' :
                          lead.status === 'CONTACTED' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-800 text-gray-400'
                        }`}
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="CONVERTED">CONVERTED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setViewingLead(lead)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingLead(lead)} className="p-2 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition-colors" title="Edit Lead">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(lead.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" title="Delete Lead">
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Editing Modal */}
      {editingLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0a0a0a]">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit className="w-5 h-5" /> Edit Lead #{editingLead.id}
              </h2>
              <button onClick={() => setEditingLead(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form className="space-y-4" onSubmit={handleEditSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                    <input 
                      type="text" 
                      value={editingLead.name}
                      onChange={e => setEditingLead({...editingLead, name: e.target.value})}
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={editingLead.email}
                      onChange={e => setEditingLead({...editingLead, email: e.target.value})}
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" 
                      required 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                    <input 
                      type="text" 
                      value={editingLead.phone || ''}
                      onChange={e => setEditingLead({...editingLead, phone: e.target.value})}
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">City</label>
                    <input 
                      type="text" 
                      value={editingLead.city || ''}
                      onChange={e => setEditingLead({...editingLead, city: e.target.value})}
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Country</label>
                    <input 
                      type="text" 
                      value={editingLead.country || ''}
                      onChange={e => setEditingLead({...editingLead, country: e.target.value})}
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Service Needed / Subject</label>
                  <input 
                    type="text" 
                    value={editingLead.serviceNeeded || ''}
                    onChange={e => setEditingLead({...editingLead, serviceNeeded: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Message</label>
                  <textarea 
                    value={editingLead.message}
                    onChange={e => setEditingLead({...editingLead, message: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 h-24" 
                    required 
                  />
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

      {/* Viewing Modal */}
      {viewingLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0a0a0a]">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" /> Lead Details
              </h2>
              <button onClick={() => setViewingLead(null)} className="text-gray-400 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Name</div>
                  <div className="font-medium text-white">{viewingLead.name}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</div>
                  <div className="font-medium text-white">{viewingLead.email}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Phone</div>
                  <div className="font-medium text-white">{viewingLead.phone || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Location</div>
                  <div className="font-medium text-white">{[viewingLead.city, viewingLead.country].filter(Boolean).join(', ') || '-'}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Service Needed</div>
                  <div className="font-medium text-white">{viewingLead.serviceNeeded || 'General Inquiry'}</div>
                </div>
              </div>
              
              <div className="bg-black border border-gray-800 rounded-lg p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Message</div>
                <div className="text-gray-300 whitespace-pre-line text-sm leading-relaxed">
                  {viewingLead.message}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
