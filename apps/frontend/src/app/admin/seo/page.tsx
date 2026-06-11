"use client";

import React, { useState, useEffect } from 'react';
import { Save, Loader2, Check } from 'lucide-react';

export default function SeoAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [role, setRole] = useState('SUPER_USER');

  const [formData, setFormData] = useState({
    seo_title: 'Digital Tech Souls | Premium Hosting & Digital Solutions',
    seo_description: 'Fast, Secure and Affordable Hosting with Professional Web Development, Digital Marketing and Graphic Design Services.',
    seo_keywords: 'web hosting, cpanel, wordpress, digital marketing, web development',
    seo_author: 'Digital Tech Souls',
    seo_robots: 'index, follow',
    seo_canonical_url: 'https://digitaltechsouls.com',
    seo_og_image: '/images/hero-hosting.png'
  });

  useEffect(() => {
    fetchSettings();
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setRole(user.role || 'NORMAL_USER');
    }
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/settings`);
      if (res.ok) {
        const data = await res.json();
        
        // Extract SEO keys if they exist in DB
        const titleSetting = data.find((s: any) => s.key === 'seo_title');
        const descSetting = data.find((s: any) => s.key === 'seo_description');
        const keywordSetting = data.find((s: any) => s.key === 'seo_keywords');
        const authorSetting = data.find((s: any) => s.key === 'seo_author');
        const robotsSetting = data.find((s: any) => s.key === 'seo_robots');
        const canonicalSetting = data.find((s: any) => s.key === 'seo_canonical_url');
        const ogImageSetting = data.find((s: any) => s.key === 'seo_og_image');
        
        setFormData({
          seo_title: titleSetting ? titleSetting.value : formData.seo_title,
          seo_description: descSetting ? descSetting.value : formData.seo_description,
          seo_keywords: keywordSetting ? keywordSetting.value : formData.seo_keywords,
          seo_author: authorSetting ? authorSetting.value : formData.seo_author,
          seo_robots: robotsSetting ? robotsSetting.value : formData.seo_robots,
          seo_canonical_url: canonicalSetting ? canonicalSetting.value : formData.seo_canonical_url,
          seo_og_image: ogImageSetting ? ogImageSetting.value : formData.seo_og_image
        });
      }
    } catch (error) {
      console.error('Failed to fetch SEO settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const keysToSave = [
        { key: 'seo_title', value: formData.seo_title, description: 'Global SEO Title' },
        { key: 'seo_description', value: formData.seo_description, description: 'Global SEO Meta Description' },
        { key: 'seo_keywords', value: formData.seo_keywords, description: 'Global SEO Meta Keywords' },
        { key: 'seo_author', value: formData.seo_author, description: 'Global SEO Author' },
        { key: 'seo_robots', value: formData.seo_robots, description: 'Global SEO Robots Directive' },
        { key: 'seo_canonical_url', value: formData.seo_canonical_url, description: 'Global SEO Canonical URL' },
        { key: 'seo_og_image', value: formData.seo_og_image, description: 'Global SEO Open Graph Image' }
      ];
      
      const token = localStorage.getItem('token');
      let allSuccess = true;
      for (const item of keysToSave) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/settings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(item)
        });
        
        if (!res.ok) {
          allSuccess = false;
        }
      }
      
      if (allSuccess) {
        setMessage('SEO Settings updated successfully!');
      } else {
        setMessage("Failed to save some settings. Ensure you have SUPER_USER or ADMIN_USER role.");
      }
    } catch (error) {
      setMessage("Failed to save settings.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const [uploadingImage, setUploadingImage] = useState(false);
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/upload`, {
        method: 'POST',
        body: fd
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({ ...formData, seo_og_image: data.url });
      } else {
        alert("Failed to upload image.");
      }
    } catch (error) {
      console.error(error);
      alert("Error uploading image");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Global SEO Optimization</h2>
          <p className="text-gray-400 text-sm">Manage meta tags for search engine optimization across your website.</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-lg ${message.includes('denied') || message.includes('Failed') ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-green-500/20 text-green-400 border border-green-500/50'}`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
          <form className="space-y-6" onSubmit={handleSave}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Global SEO Title</label>
              <p className="text-xs text-gray-500 mb-2">This is the default title that appears in browser tabs and search engine results.</p>
              <input 
                type="text" 
                value={formData.seo_title} 
                onChange={e => setFormData({...formData, seo_title: e.target.value})} 
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Global Meta Description</label>
              <p className="text-xs text-gray-500 mb-2">A short summary of your website. Keep it between 150-160 characters for best SEO results.</p>
              <textarea 
                value={formData.seo_description} 
                onChange={e => setFormData({...formData, seo_description: e.target.value})} 
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500" 
                rows={3}
                required
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Global Meta Keywords</label>
              <p className="text-xs text-gray-500 mb-2">Comma separated keywords relevant to your business.</p>
              <textarea 
                value={formData.seo_keywords} 
                onChange={e => setFormData({...formData, seo_keywords: e.target.value})} 
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500" 
                rows={2}
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Author</label>
                <p className="text-xs text-gray-500 mb-2">Defines the name of the author of the document.</p>
                <input 
                  type="text" 
                  value={formData.seo_author} 
                  onChange={e => setFormData({...formData, seo_author: e.target.value})} 
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Robots Directive</label>
                <p className="text-xs text-gray-500 mb-2">Controls crawling and indexing behavior.</p>
                <select 
                  value={formData.seo_robots} 
                  onChange={e => setFormData({...formData, seo_robots: e.target.value})} 
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500"
                >
                  <option value="index, follow">Index, Follow (Recommended)</option>
                  <option value="noindex, follow">Noindex, Follow</option>
                  <option value="index, nofollow">Index, Nofollow</option>
                  <option value="noindex, nofollow">Noindex, Nofollow (Hide from search)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Canonical URL</label>
              <p className="text-xs text-gray-500 mb-2">The preferred version of a web page to prevent duplicate content issues.</p>
              <input 
                type="text" 
                value={formData.seo_canonical_url} 
                onChange={e => setFormData({...formData, seo_canonical_url: e.target.value})} 
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500" 
                placeholder="https://digitaltechsouls.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Open Graph (OG) Image URL</label>
              <p className="text-xs text-gray-500 mb-2">The default thumbnail displayed when sharing links on social media.</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={formData.seo_og_image} 
                  onChange={e => setFormData({...formData, seo_og_image: e.target.value})} 
                  className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500" 
                  placeholder="https://... or /uploads/..."
                />
                <label className={`bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg cursor-pointer flex items-center justify-center transition-colors border border-gray-700 ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-800 flex justify-end">
              <button 
                type="submit" 
                disabled={saving || !['SUPER_USER', 'ADMIN_USER'].includes(role)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {['SUPER_USER', 'ADMIN_USER'].includes(role) ? (saving ? 'Saving...' : 'Save SEO Options') : 'Save Disabled (Admin Only)'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
