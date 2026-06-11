"use client";

import React, { useState, useEffect } from 'react';
import { Plus, X, Save, Edit2, Trash2, Loader2, Check } from 'lucide-react';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

export default function BlogAdmin() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('ADMIN_USER');
  const [message, setMessage] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '', category: '', content: '', image: '', youtubeUrl: '', seoKeywords: '', tags: '', author: 'Admin'
  });

  useEffect(() => {
    fetchPosts();
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setRole(user.role || 'NORMAL_USER');
    }
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/blog`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Failed to fetch posts', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/blog/${editingId}` : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/blog`;
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
        const savedPost = await res.json();
        if (editingId) {
          setPosts(posts.map(p => p.id === editingId ? savedPost : p));
        } else {
          setPosts([savedPost, ...posts]);
        }
        closeForm();
        setMessage(editingId ? 'Post updated successfully.' : 'Post created successfully.');
      } else {
        setMessage("Failed to save post. Make sure you have ADMIN_USER role.");
      }
    } catch (error) {
      setMessage("Failed to save post.");
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/blog/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setPosts(posts.filter(p => p.id !== id));
        setMessage('Post deleted successfully.');
      } else {
        setMessage('Permission denied. You need ADMIN_USER or SUPER_USER role to delete.');
      }
    } catch (error) {
      setMessage('Failed to delete post.');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const openCreateForm = () => {
    setFormData({
      title: '', category: '', content: '', image: '', youtubeUrl: '', seoKeywords: '', tags: '', author: 'Admin'
    });
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openEditForm = (post: any) => {
    setFormData({
      title: post.title, category: post.category || '', content: post.content || '', 
      image: post.image || '', youtubeUrl: post.youtubeUrl || '', seoKeywords: post.seoKeywords || '', tags: post.tags || '', author: post.author || 'Admin'
    });
    setEditingId(post.id);
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
          <h2 className="text-2xl font-bold text-white mb-2">Blog Posts</h2>
          <p className="text-gray-400 text-sm">Manage your news and content articles.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {!isFormOpen && (role === 'SUPER_USER' || role === 'ADMIN_USER') && (
            <button onClick={openCreateForm} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Post
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
              {editingId ? 'Edit Post' : 'Create New Post'}
            </h3>
            <button onClick={closeForm} className="text-gray-400 hover:text-white p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form className="space-y-4" onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Post Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="Enter title..." required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="e.g. Web Hosting" required />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Author Name</label>
                <input type="text" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="Admin" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Tags (comma separated)</label>
                <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="e.g. Tutorial, News, Update" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Cover Image</label>
                <div className="flex gap-2">
                  <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 min-w-0" placeholder="URL or Upload Image" />
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
                            setFormData(prev => ({...prev, image: data.url}));
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
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">SEO Keywords</label>
                <input type="text" value={formData.seoKeywords} onChange={e => setFormData({...formData, seoKeywords: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="Comma separated keywords" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">YouTube Video URL (Optional)</label>
                <input type="url" value={formData.youtubeUrl} onChange={e => setFormData({...formData, youtubeUrl: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="e.g. https://www.youtube.com/watch?v=..." />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-400 mb-2">Content</label>
              <div className="bg-gray-950 text-white rounded-lg overflow-hidden border border-gray-800">
                <ReactQuill 
                  theme="snow" 
                  value={formData.content} 
                  onChange={(val) => setFormData({...formData, content: val})}
                  className="h-64 mb-12"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2">
                <Check className="w-4 h-4" /> {editingId ? 'Update Post' : 'Publish Post'}
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
                <th className="px-6 py-4 font-medium w-16">Image</th>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Author</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No blog posts found. Click "New Post" to create one.
                  </td>
                </tr>
              ) : (
                posts.map(post => (
                  <tr key={post.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      {post.image ? (
                        <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center p-1 border border-gray-700">
                          <img src={post.image} alt="Cover" className="w-full h-full object-cover rounded-sm" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center border border-gray-700 text-xs text-gray-500">
                          None
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-white font-medium">{post.title}</td>
                    <td className="px-6 py-4 text-blue-400">
                      <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs">{post.category || 'Uncategorized'}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{post.author}</td>
                    <td className="px-6 py-4 text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      {(role === 'SUPER_USER' || role === 'ADMIN_USER') && (
                        <>
                          <button onClick={() => openEditForm(post)} className="text-gray-400 hover:text-white p-2">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(post.id)} className="text-gray-400 hover:text-red-400 p-2">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
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
