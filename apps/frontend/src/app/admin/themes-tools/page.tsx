"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save, Image as ImageIcon, UploadCloud, Link as LinkIcon, MonitorPlay, FileArchive, FileSpreadsheet, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminThemesTools() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkJson, setBulkJson] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'THEME',
    price: '',
    description: '',
    features: '',
    imageUrl: '',
    logoUrl: '',
    downloadUrl: '',
    livePreviewUrl: '',
    metaTitle: '',
    metaDesc: '',
    seoKeywords: ''
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/themes-tools`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
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
      ? `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/themes-tools/${editingItem.id}` 
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/themes-tools`;
      
    const method = editingItem ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
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

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) throw new Error("Must be an array of objects");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/themes-tools/bulk`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(parsed),
      });

      if (res.ok) {
        fetchItems();
        setIsBulkModalOpen(false);
        setBulkJson('');
        alert("Bulk import successful!");
      } else {
        alert("Failed to import items. Check permissions or data format.");
      }
    } catch (error) {
      console.error("Error saving bulk:", error);
      alert("Invalid JSON format. Please provide a valid JSON array.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        setBulkJson(JSON.stringify(data, null, 2));
      } catch (err) {
        console.error("Error parsing file:", err);
        alert("Error parsing file. Please ensure it is a valid CSV or Excel file.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadSample = () => {
    const sampleData = [
      {
        name: "Premium Admin Template",
        type: "THEME",
        price: 49.99,
        description: "A comprehensive admin dashboard template.",
        features: "Responsive design, Next.js, TailwindCSS",
        imageUrl: "https://example.com/image.png",
        logoUrl: "https://example.com/logo.png",
        downloadUrl: "https://example.com/download.zip",
        livePreviewUrl: "https://example.com/preview",
        metaTitle: "Premium Admin Template - Best Dashboard",
        metaDesc: "Get the best admin dashboard template for your next project.",
        seoKeywords: "admin, dashboard, template, nextjs, react"
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sample");
    XLSX.writeFile(wb, "themes_tools_sample.xlsx");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/themes-tools/${id}`, {
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
        type: item.type,
        price: item.price ? item.price.toString() : '',
        description: item.description,
        features: item.features || '',
        imageUrl: item.imageUrl || '',
        logoUrl: item.logoUrl || '',
        downloadUrl: item.downloadUrl || '',
        livePreviewUrl: item.livePreviewUrl || '',
        metaTitle: item.metaTitle || '',
        metaDesc: item.metaDesc || '',
        seoKeywords: item.seoKeywords || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '', type: 'THEME', price: '', description: '', features: '',
        imageUrl: '', logoUrl: '', downloadUrl: '', livePreviewUrl: '',
        metaTitle: '', metaDesc: '', seoKeywords: ''
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
        <h2 className="text-2xl font-bold text-white">Themes & Tools</h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsBulkModalOpen(true)}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-gray-700"
          >
            <UploadCloud className="w-4 h-4" /> Bulk Add
          </button>
          <button 
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex justify-between items-center z-10">
              <h3 className="text-xl font-bold text-white">Bulk Add Products (JSON)</h3>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleBulkSubmit} className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Paste JSON or upload a CSV/Excel file:</p>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={handleDownloadSample}
                      className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors border border-gray-700"
                    >
                      <Download className="w-4 h-4" />
                      Sample
                    </button>
                    <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors">
                      <FileSpreadsheet className="w-4 h-4" />
                      Upload File
                      <input 
                        type="file" 
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                        className="hidden" 
                        onChange={handleFileUpload} 
                      />
                    </label>
                  </div>
                </div>
                <pre className="bg-gray-950 p-4 rounded-lg text-xs text-gray-400 overflow-x-auto mb-4 border border-gray-800">
{`[
  {
    "name": "Super Theme",
    "type": "THEME",
    "price": 49.99,
    "description": "A great theme",
    "features": "Responsive, Fast",
    "imageUrl": "https://..."
  }
]`}
                </pre>
                <textarea 
                  value={bulkJson}
                  onChange={e => setBulkJson(e.target.value)}
                  className="w-full h-64 bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-500 font-mono"
                  placeholder="Paste JSON array here..."
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button type="button" onClick={() => setIsBulkModalOpen(false)} className="px-6 py-2 text-gray-400 hover:text-white">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold">
                  Import Products
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-950/50 border-b border-gray-800 text-sm font-medium text-gray-400">
                <th className="p-4">Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Price</th>
                <th className="p-4">Assets</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {item.logoUrl ? (
                        <img src={item.logoUrl} alt={item.name} className="w-8 h-8 object-contain bg-white rounded p-1" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-gray-400"/></div>
                      )}
                      <div>
                        <div className="font-medium text-white">{item.name}</div>
                        <div className="text-xs text-gray-400 truncate max-w-xs">{item.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${item.type === 'THEME' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">
                    {item.price ? `$${item.price}` : 'Free'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {item.imageUrl && <span title="Has Cover Image" className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center"><ImageIcon className="w-3 h-3"/></span>}
                      {item.downloadUrl && <span title="Has Download File" className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center"><FileArchive className="w-3 h-3"/></span>}
                      {item.livePreviewUrl && <span title="Has Live Preview" className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center"><MonitorPlay className="w-3 h-3"/></span>}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openModal(item)} className="p-2 text-gray-400 hover:text-white transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No themes or tools found. Click "Add Item" to create one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h3 className="text-xl font-bold text-white">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" placeholder="e.g. Astra Pro" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none">
                    <option value="THEME">WordPress Theme</option>
                    <option value="TOOL">WordPress Tool / Plugin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Price (Optional, leave blank for Free)</label>
                  <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" placeholder="e.g. 49.99" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Live Preview URL</label>
                  <input type="url" value={formData.livePreviewUrl} onChange={e => setFormData({...formData, livePreviewUrl: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" placeholder="https://..." />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none h-20" placeholder="Brief description of the product..."></textarea>
              </div>

              {/* Product Features */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Product Details / Bullet Points (one per line)</label>
                <textarea value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none h-32" placeholder="Optimized for speed&#10;WooCommerce ready&#10;GPL Licensed"></textarea>
              </div>

              {/* SEO Tags */}
              <div className="space-y-4 pt-4 border-t border-gray-800">
                <h4 className="text-white font-medium mb-2">SEO Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Meta Title</label>
                    <input type="text" value={formData.metaTitle} onChange={e => setFormData({...formData, metaTitle: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" placeholder="SEO Title..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">SEO Keywords</label>
                    <input type="text" value={formData.seoKeywords} onChange={e => setFormData({...formData, seoKeywords: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none" placeholder="wordpress, theme, premium..." />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Meta Description</label>
                  <textarea value={formData.metaDesc} onChange={e => setFormData({...formData, metaDesc: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none h-16" placeholder="SEO Meta Description..."></textarea>
                </div>
              </div>

              {/* Uploads */}
              <div className="space-y-4 pt-4 border-t border-gray-800">
                <h4 className="text-white font-medium mb-2">Media & Files</h4>
                
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Brand Logo (Square recommended)</label>
                  <div className="flex gap-2">
                    <input type="text" value={formData.logoUrl} onChange={e => setFormData({...formData, logoUrl: e.target.value})} className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white" placeholder="URL or Upload Image" />
                    <label className="bg-gray-800 hover:bg-gray-700 cursor-pointer border border-gray-700 rounded-lg px-4 py-2 flex items-center justify-center text-sm transition-colors whitespace-nowrap">
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'logoUrl')} />
                      Upload Logo
                    </label>
                  </div>
                </div>

                {/* Cover Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Cover Image (e.g. 800x600 screenshot)</label>
                  <div className="flex gap-2">
                    <input type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white" placeholder="URL or Upload Image" />
                    <label className="bg-gray-800 hover:bg-gray-700 cursor-pointer border border-gray-700 rounded-lg px-4 py-2 flex items-center justify-center text-sm transition-colors whitespace-nowrap">
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'imageUrl')} />
                      Upload Image
                    </label>
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Downloadable ZIP File</label>
                  <div className="flex gap-2">
                    <input type="text" value={formData.downloadUrl} onChange={e => setFormData({...formData, downloadUrl: e.target.value})} className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white" placeholder="URL or Upload ZIP" />
                    <label className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 cursor-pointer border border-blue-500/50 rounded-lg px-4 py-2 flex items-center justify-center text-sm transition-colors whitespace-nowrap">
                      <input type="file" className="hidden" accept=".zip,.rar,.tar.gz" onChange={(e) => handleUpload(e, 'downloadUrl')} />
                      Upload ZIP
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-800 gap-3">
                <button type="button" onClick={closeModal} className="px-6 py-2 rounded-lg text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <Save className="w-4 h-4" /> Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
