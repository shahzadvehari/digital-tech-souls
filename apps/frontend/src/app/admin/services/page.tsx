"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, X, Save } from 'lucide-react';

export default function ServicesAdmin() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('ADMIN_USER'); 
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', icon: '', features: '' });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/services`);
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Failed to fetch services', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/services/${editingId}` : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/services`;
      const method = editingId ? 'PATCH' : 'POST';
      
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        const savedService = await res.json();
        if (editingId) {
          setServices(services.map(s => s.id === editingId ? savedService : s));
        } else {
          setServices([...services, savedService]);
        }
        closeForm();
      } else {
        alert("Failed to save service. Make sure you have ADMIN_USER role.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/services/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setServices(services.filter(s => s.id !== id));
      } else {
        alert("Failed to delete service. Make sure you have ADMIN_USER role.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openEditForm = (service: any) => {
    setFormData({ name: service.name, description: service.description, icon: service.icon || '', features: service.features || '' });
    setEditingId(service.id);
    setIsFormOpen(true);
  };

  const openCreateForm = () => {
    setFormData({ name: '', description: '', icon: '', features: '' });
    setEditingId(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ name: '', description: '', icon: '', features: '' });
  };

  return (
    <div className="max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Digital Services</h2>
          <p className="text-gray-400 text-sm">Manage the services you offer to clients.</p>
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

          {!isFormOpen && (
            <button 
              onClick={openCreateForm}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Service
            </button>
          )}
        </div>
      </div>

      {isFormOpen && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">
              {editingId ? 'Edit Service' : 'Create New Service'}
            </h3>
            <button onClick={closeForm} className="text-gray-400 hover:text-white p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form className="space-y-4" onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Service Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" 
                  placeholder="e.g. SEO Optimization" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Logo / Icon</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={formData.icon}
                    onChange={e => setFormData({...formData, icon: e.target.value})}
                    className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 min-w-0" 
                    placeholder="URL or Upload Image" 
                  />
                  <label className="bg-gray-800 hover:bg-gray-700 cursor-pointer border border-gray-700 rounded-lg px-4 py-2 flex items-center justify-center text-sm transition-colors whitespace-nowrap">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        const uploadData = new FormData();
                        uploadData.append('file', file);
                        
                        try {
                          const res = await fetch('/api/upload', {
                            method: 'POST',
                            body: uploadData,
                          });
                          const data = await res.json();
                          if (data.success) {
                            setFormData(prev => ({...prev, icon: data.url}));
                          } else {
                            alert("Upload failed: " + data.message);
                          }
                        } catch (err) {
                          alert("Upload failed.");
                        }
                      }} 
                    />
                    Upload File
                  </label>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Features (Bullet points, comma separated)</label>
              <input 
                type="text" 
                value={formData.features}
                onChange={e => setFormData({...formData, features: e.target.value})}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" 
                placeholder="Feature 1, Feature 2, Feature 3" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 h-24" 
                placeholder="Describe the service..." 
                required 
              />
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2">
                <Save className="w-4 h-4" /> {editingId ? 'Update Service' : 'Save Service'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-950 border-b border-gray-800 text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium w-16">Logo</th>
                <th className="px-6 py-4 font-medium">Service Name</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {services.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No services found. Click "Add Service" to create one.
                  </td>
                </tr>
              ) : (
                services.map(service => (
                  <tr key={service.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      {service.icon ? (
                        <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center p-1 border border-gray-700">
                          <img src={service.icon} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center border border-gray-700 text-xs text-gray-500">
                          None
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-white font-medium">{service.name}</td>
                    <td className="px-6 py-4 text-gray-400 truncate max-w-xs">{service.description}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEditForm(service)} className="text-gray-400 hover:text-white p-2">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(service.id)} className="text-gray-400 hover:text-red-400 p-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
