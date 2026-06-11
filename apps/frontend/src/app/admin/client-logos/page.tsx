"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save, Loader2, Hexagon, Box, Triangle, Circle, Star, Layers, Activity, Aperture, Briefcase } from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Box, Hexagon, Triangle, Circle, Star, Layers, Activity, Aperture, Briefcase
};

export default function AdminClientLogos() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    iconName: 'Box',
    imageUrl: ''
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/client-logos`);
      if (res.ok) {
        setClients(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formDataObj = new FormData();
    formDataObj.append('file', file);

    setUploading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/upload`, {
        method: 'POST',
        body: formDataObj
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({ ...formData, imageUrl: data.url });
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return alert('Not authenticated');

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/client-logos${editingClient ? `/${editingClient.id}` : ''}`;
      const method = editingClient ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchClients();
      } else {
        alert("Failed to save client logo.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this client logo?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/client-logos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setClients(clients.filter(c => c.id !== id));
      } else {
        alert("Permission denied.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openNew = () => {
    setEditingClient(null);
    setFormData({ name: '', iconName: 'Box', imageUrl: '' });
    setIsModalOpen(true);
  };

  const openEdit = (client: any) => {
    setEditingClient(client);
    setFormData({ name: client.name, iconName: client.iconName || 'Box', imageUrl: client.imageUrl || '' });
    setIsModalOpen(true);
  };

  if (loading) return <div className="p-8 text-white"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Trusted By Clients</h1>
          <p className="text-gray-400 text-sm">Manage the logos shown in the homepage marquee</p>
        </div>
        <button onClick={openNew} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">ID</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Icon & Name</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Added</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {clients.map(client => {
              const IconComp = ICON_MAP[client.iconName] || Briefcase;
              return (
                <tr key={client.id} className="hover:bg-gray-800/50">
                  <td className="px-6 py-4 text-gray-500 font-medium">#{client.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-white font-bold">
                      {client.imageUrl ? (
                        <img src={client.imageUrl} alt={client.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <IconComp className="w-5 h-5 text-gray-400" />
                      )}
                      {client.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{new Date(client.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(client)} className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-600 hover:text-white flex items-center justify-center transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(client.id)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {clients.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No client logos added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0a0a0a]">
              <h2 className="text-xl font-bold text-white">{editingClient ? 'Edit' : 'Add'} Client Logo</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Company Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Custom Logo Image (Optional)</label>
                  <div className="flex items-center gap-4">
                    {formData.imageUrl && <img src={formData.imageUrl} className="w-12 h-12 object-contain bg-white/5 rounded p-1" />}
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="text-sm text-gray-400" disabled={uploading} />
                  </div>
                  {uploading && <p className="text-xs text-blue-400 mt-1">Uploading...</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Or Icon Style (Fallback)</label>
                  <select value={formData.iconName} onChange={e => setFormData({...formData, iconName: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500">
                    {Object.keys(ICON_MAP).map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex justify-center items-center gap-2">
                    <Save className="w-4 h-4" /> Save Client
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
