"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save, Image as ImageIcon, Star } from 'lucide-react';

export default function AdminTestimonials() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    photo: '',
    rating: 5,
    review: ''
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/testimonials`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const uploadData = new FormData();
    uploadData.append('file', file);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/upload`, {
        method: 'POST',
        body: uploadData,
      });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, [fieldName]: data.url }));
      } else {
        alert("Upload failed: " + data.message);
      }
    } catch (err) {
      alert("Upload failed. File might be too large.");
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const url = editingItem 
      ? `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/testimonials/${editingItem.id}` 
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/testimonials`;
      
    const method = editingItem ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          rating: Number(formData.rating)
        }),
      });

      if (res.ok) {
        fetchItems();
        closeModal();
      } else {
        alert("Failed to save item. Make sure you have the correct permissions.");
      }
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/testimonials/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchItems();
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const openModal = (item: any = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        company: item.company || '',
        photo: item.photo || '',
        rating: item.rating || 5,
        review: item.review || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '', company: '', photo: '', rating: 5, review: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Testimonials / Loved by Businesses</h2>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-950/50 border-b border-gray-800 text-sm font-medium text-gray-400">
                <th className="p-4">Customer</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Review</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {item.photo ? (
                        <img src={item.photo} alt={item.name} className="w-10 h-10 object-cover rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-400 font-bold">
                          {item.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-white">{item.name}</div>
                        <div className="text-xs text-gray-400">{item.company}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex text-yellow-400">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-400 truncate max-w-sm">"{item.review}"</p>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openModal(item)} className="p-2 text-gray-400 hover:text-white transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">No testimonials found. Click "Add Customer" to create one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
               <h3 className="text-xl font-bold text-white">{editingItem ? 'Edit Customer' : 'Add New Customer'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Customer Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" placeholder="e.g. Sarah Jenkins" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Company / Subtitle</label>
                  <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" placeholder="e.g. TechFlow Agency" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Rating (1-5)</label>
                <input required type="number" min="1" max="5" value={formData.rating} onChange={e => setFormData({...formData, rating: Number(e.target.value)})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Review</label>
                <textarea required value={formData.review} onChange={e => setFormData({...formData, review: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none h-24" placeholder="Their review text..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Customer Photo (Optional)</label>
                <div className="flex gap-2">
                  <input type="text" value={formData.photo} onChange={e => setFormData({...formData, photo: e.target.value})} className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white" placeholder="URL or Upload Image" />
                  <label className="bg-gray-800 hover:bg-gray-700 cursor-pointer border border-gray-700 rounded-lg px-4 py-2 flex items-center justify-center text-sm transition-colors whitespace-nowrap">
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'photo')} />
                    Upload Image
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-800 gap-3">
                <button type="button" onClick={closeModal} className="px-6 py-2 rounded-lg text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <Save className="w-4 h-4" /> Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
