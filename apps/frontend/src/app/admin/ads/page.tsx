"use client";

import React, { useState, useEffect } from 'react';
import { Save, Loader2, Megaphone } from 'lucide-react';

export default function AdsAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [role, setRole] = useState('SUPER_USER');

  const [formData, setFormData] = useState({
    ad_header_code: '',
    ad_footer_code: '',
    ad_homepage_code: '',
    ad_blog_code: '',
    ad_blog_top_code: '',
    ad_blog_middle_code: '',
    ad_blog_list_code: ''
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
        
        const header = data.find((s: any) => s.key === 'ad_header_code');
        const footer = data.find((s: any) => s.key === 'ad_footer_code');
        const homepage = data.find((s: any) => s.key === 'ad_homepage_code');
        const blog = data.find((s: any) => s.key === 'ad_blog_code');
        const blogTop = data.find((s: any) => s.key === 'ad_blog_top_code');
        const blogMiddle = data.find((s: any) => s.key === 'ad_blog_middle_code');
        const blogList = data.find((s: any) => s.key === 'ad_blog_list_code');
        
        setFormData({
          ad_header_code: header ? header.value : '',
          ad_footer_code: footer ? footer.value : '',
          ad_homepage_code: homepage ? homepage.value : '',
          ad_blog_code: blog ? blog.value : '',
          ad_blog_top_code: blogTop ? blogTop.value : '',
          ad_blog_middle_code: blogMiddle ? blogMiddle.value : '',
          ad_blog_list_code: blogList ? blogList.value : ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch ad settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const keysToSave = [
        { key: 'ad_header_code', value: formData.ad_header_code, description: 'Global Header Ad Code (Adsterra)' },
        { key: 'ad_footer_code', value: formData.ad_footer_code, description: 'Global Footer Ad Code (Adsterra)' },
        { key: 'ad_homepage_code', value: formData.ad_homepage_code, description: 'Homepage Interstitial Ad Code' },
        { key: 'ad_blog_code', value: formData.ad_blog_code, description: 'Blog Post Bottom Ad Code' },
        { key: 'ad_blog_top_code', value: formData.ad_blog_top_code, description: 'Blog Post Top Ad Code' },
        { key: 'ad_blog_middle_code', value: formData.ad_blog_middle_code, description: 'Blog Post Middle Ad Code' },
        { key: 'ad_blog_list_code', value: formData.ad_blog_list_code, description: 'Blog Feed Ad Code' }
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
        setMessage('Ad Placements updated successfully! Changes will reflect immediately.');
      } else {
        setMessage("Failed to save some ads. Ensure you have SUPER_USER role.");
      }
    } catch (error) {
      setMessage("Failed to save ad codes.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-blue-500" />
            Adsterra Ad Management Console
          </h2>
          <p className="text-gray-400 text-sm">Paste your raw HTML/JS ad scripts below to display them across your website.</p>
          <p className="text-blue-400 text-xs mt-1">Note: If you paste a raw Direct Link URL (like https://...), it will automatically be converted into a banner iframe.</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-lg font-medium ${message.includes('Failed') ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-green-500/20 text-green-400 border border-green-500/50'}`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
          <form className="space-y-8" onSubmit={handleSave}>
            
            <div className="space-y-4 border border-blue-500/20 bg-blue-500/5 rounded-xl p-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">1. Global Header Ad</h3>
                <p className="text-xs text-gray-400 mb-4">Displayed right below the navigation menu on ALL pages. Best for wide banner ads.</p>
                <textarea 
                  value={formData.ad_header_code} 
                  onChange={e => setFormData({...formData, ad_header_code: e.target.value})} 
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 font-mono text-xs" 
                  rows={4}
                  placeholder="<!-- Paste Adsterra Code Here -->"
                ></textarea>
              </div>
            </div>

            <div className="space-y-4 border border-blue-500/20 bg-blue-500/5 rounded-xl p-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">2. Global Footer Ad</h3>
                <p className="text-xs text-gray-400 mb-4">Displayed right above the footer on ALL pages.</p>
                <textarea 
                  value={formData.ad_footer_code} 
                  onChange={e => setFormData({...formData, ad_footer_code: e.target.value})} 
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 font-mono text-xs" 
                  rows={4}
                  placeholder="<!-- Paste Adsterra Code Here -->"
                ></textarea>
              </div>
            </div>

            <div className="space-y-4 border border-blue-500/20 bg-blue-500/5 rounded-xl p-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">3. Homepage Interstitial Ad</h3>
                <p className="text-xs text-gray-400 mb-4">Displayed in the middle of the homepage (between Services and Testimonials).</p>
                <textarea 
                  value={formData.ad_homepage_code} 
                  onChange={e => setFormData({...formData, ad_homepage_code: e.target.value})} 
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 font-mono text-xs" 
                  rows={4}
                  placeholder="<!-- Paste Adsterra Code Here -->"
                ></textarea>
              </div>
            </div>

            <div className="space-y-4 border border-blue-500/20 bg-blue-500/5 rounded-xl p-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">4. Blog Feed (List) Ad</h3>
                <p className="text-xs text-gray-400 mb-4">Displayed at the top of the main Blog feed page.</p>
                <textarea 
                  value={formData.ad_blog_list_code} 
                  onChange={e => setFormData({...formData, ad_blog_list_code: e.target.value})} 
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 font-mono text-xs" 
                  rows={4}
                  placeholder="<!-- Paste Adsterra Code Here -->"
                ></textarea>
              </div>
            </div>

            <div className="space-y-4 border border-blue-500/20 bg-blue-500/5 rounded-xl p-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">5. Blog Content Top Ad</h3>
                <p className="text-xs text-gray-400 mb-4">Displayed right below the blog title and metadata, before the article content.</p>
                <textarea 
                  value={formData.ad_blog_top_code} 
                  onChange={e => setFormData({...formData, ad_blog_top_code: e.target.value})} 
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 font-mono text-xs" 
                  rows={4}
                  placeholder="<!-- Paste Adsterra Code Here -->"
                ></textarea>
              </div>
            </div>

            <div className="space-y-4 border border-blue-500/20 bg-blue-500/5 rounded-xl p-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">6. Blog Content Middle Ad</h3>
                <p className="text-xs text-gray-400 mb-4">Injected dynamically right into the middle of the blog post text.</p>
                <textarea 
                  value={formData.ad_blog_middle_code} 
                  onChange={e => setFormData({...formData, ad_blog_middle_code: e.target.value})} 
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 font-mono text-xs" 
                  rows={4}
                  placeholder="<!-- Paste Adsterra Code Here -->"
                ></textarea>
              </div>
            </div>

            <div className="space-y-4 border border-blue-500/20 bg-blue-500/5 rounded-xl p-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">7. Blog Content Bottom Ad</h3>
                <p className="text-xs text-gray-400 mb-4">Displayed at the bottom of the article inside single blog post pages.</p>
                <textarea 
                  value={formData.ad_blog_code} 
                  onChange={e => setFormData({...formData, ad_blog_code: e.target.value})} 
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 font-mono text-xs" 
                  rows={4}
                  placeholder="<!-- Paste Adsterra Code Here -->"
                ></textarea>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={saving || (role !== 'SUPER_USER')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 text-lg shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {role === 'SUPER_USER' ? 'Save All Ad Scripts' : 'Save Disabled (Super User Only)'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
