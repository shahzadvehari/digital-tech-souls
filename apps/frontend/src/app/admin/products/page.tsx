"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, Check, X } from 'lucide-react';

export default function ProductsAdmin() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '', price: 0, billing: 'Monthly', description: '', features: '',
    imageUrl: '', isFeatured: false
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/products/${editingId}` : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/products`;
      const method = editingId ? 'PATCH' : 'POST';
      
      const payload = {
        ...formData,
        price: Number(formData.price)
      };

      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const savedProduct = await res.json();
        if (editingId) {
          setProducts(products.map(p => p.id === editingId ? savedProduct : p));
        } else {
          setProducts([...products, savedProduct]);
        }
        closeForm();
        setMessage(editingId ? 'Product updated successfully.' : 'Product created successfully.');
      } else {
        setMessage("Failed to save product. Make sure you have ADMIN_USER role.");
      }
    } catch (error) {
      setMessage("Failed to save product.");
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setProducts(products.filter(p => p.id !== id));
        setMessage('Product deleted successfully.');
      } else {
        setMessage('Permission denied. You need ADMIN_USER or SUPER_USER role to delete.');
      }
    } catch (error) {
      setMessage('Failed to delete product.');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const openCreateForm = () => {
    setFormData({
      name: '', price: 0, billing: 'Monthly', description: '', features: '',
      imageUrl: '', isFeatured: false
    });
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openEditForm = (product: any) => {
    setFormData({
      name: product.name, price: product.price, billing: product.billing, description: product.description || '',
      features: product.features || '', imageUrl: product.imageUrl || '', isFeatured: product.isFeatured
    });
    setEditingId(product.id);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  return (
    <div className="max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Digital Licenses & Products</h2>
          <p className="text-gray-400 text-sm">Manage your WHMCS, cPanel, and other digital licenses.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {!isFormOpen && (
            <button onClick={openCreateForm} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add License
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-lg ${message.includes('denied') || message.includes('Failed') ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-green-500/20 text-green-400 border border-green-500/50'}`}>
          {message}
        </div>
      )}

      {isFormOpen && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">
              {editingId ? 'Edit Product' : 'Create New Product'}
            </h3>
            <button onClick={closeForm} className="text-gray-400 hover:text-white p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form className="space-y-4" onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Product Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="e.g. WHMCS Plus" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Price</label>
                <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Billing Cycle</label>
                <select value={formData.billing} onChange={e => setFormData({...formData, billing: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500">
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="Lifetime">Lifetime</option>
                  <option value="One-time">One-time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Logo URL (Optional)</label>
                <div className="flex gap-2">
                  <input type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 min-w-0" placeholder="/images/logo.png" />
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
                            setFormData(prev => ({...prev, imageUrl: data.url}));
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" rows={2}></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Tags (comma separated)</label>
                <textarea value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="Fast, Secure, Reliable" rows={2}></textarea>
              </div>
              <div className="flex flex-col justify-center gap-2">
                <label className="flex items-center gap-2 text-gray-400">
                  <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="rounded bg-gray-900 border-gray-700" /> Featured (Highlight this product)
                </label>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2">
                <Check className="w-4 h-4" /> {editingId ? 'Update Product' : 'Save Product'}
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
                <th className="px-6 py-4 font-medium">Product Name</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No digital licenses found. Click "Add License" to create one.
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      {product.imageUrl ? (
                        <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center p-1 border border-gray-700">
                          <img src={product.imageUrl} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center border border-gray-700 text-xs text-gray-500">
                          None
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-white font-medium">
                      <div className="flex items-center gap-3">
                        {product.isFeatured && <span className="bg-blue-500 w-2 h-2 rounded-full"></span>}
                        {product.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-blue-400">${product.price} / {product.billing}</td>
                    <td className="px-6 py-4 text-gray-400 truncate max-w-xs">{product.description || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEditForm(product)} className="text-gray-400 hover:text-white p-2">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="text-gray-400 hover:text-red-400 p-2">
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
