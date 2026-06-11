"use client";

import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Trash2, Edit, LogIn, Search, Filter, Download, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  username: string | null;
  phone: string | null;
  profilePicture?: string | null;
  city?: string | null;
  country?: string | null;
  role: string;
  permissions: string[];
  customCommissionRate?: number | null;
  createdAt: string;
}

const AVAILABLE_PERMISSIONS = [
  'CAN_VIEW_ANALYTICS',
  'CAN_MANAGE_CLIENTS',
  'CAN_MANAGE_TESTIMONIALS',
  'CAN_VIEW_ORDERS',
  'CAN_MANAGE_TICKETS',
  'CAN_VIEW_SUBSCRIPTIONS',
  'CAN_MANAGE_BLOG',
  'CAN_MANAGE_LEADS'
];

export default function UsersManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  
  const [editRole, setEditRole] = useState('');
  const [editPermissions, setEditPermissions] = useState<string[]>([]);

  const getDefaultPermissionsForRole = (role: string) => {
    switch(role) {
      case 'SUPER_USER':
        return [...AVAILABLE_PERMISSIONS];
      case 'ADMIN_USER':
        return [...AVAILABLE_PERMISSIONS];
      case 'RESELLER_USER':
        return [
          'CAN_VIEW_ANALYTICS',
          'CAN_MANAGE_CLIENTS',
          'CAN_VIEW_ORDERS',
          'CAN_MANAGE_TICKETS',
          'CAN_VIEW_SUBSCRIPTIONS'
        ];
      case 'NORMAL_USER':
      default:
        return [];
    }
  };

  const handleRoleChange = (newRole: string) => {
    setEditRole(newRole);
    setEditPermissions(getDefaultPermissionsForRole(newRole));
  };
  const [editPhone, setEditPhone] = useState<string | null>(null);
  const [editProfilePicture, setEditProfilePicture] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editCity, setEditCity] = useState<string | null>(null);
  const [editCountry, setEditCountry] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editCommissionRate, setEditCommissionRate] = useState<string>('');
  const [editPassword, setEditPassword] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    username: '',
    phone: '',
    role: 'NORMAL_USER',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  const filteredUsers = (Array.isArray(users) ? users : []).filter(user => {
    const matchesSearch = 
      (user.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const exportToExcel = () => {
    if (filteredUsers.length === 0) {
      alert("No users to export.");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(filteredUsers.map(user => ({
      'Identity Code': `DTS-UID-${String(user.id).padStart(4, '0')}`,
      'Email': user.email,
      'Username': user.username || '',
      'Phone': user.phone || '',
      'City': user.city || '',
      'Country': user.country || '',
      'Role': user.role,
      'Permissions': (user.permissions || []).join(', '),
      'Joined Date': new Date(user.createdAt).toLocaleString()
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "Users_Export.xlsx");
  };

  const exportToPDF = () => {
    if (filteredUsers.length === 0) {
      alert("No users to export.");
      return;
    }
    const doc = new jsPDF();
    
    doc.text("Digital Tech Souls - Users Export", 14, 15);
    
    const tableColumn = ["Identity Code", "Email", "Role", "Phone", "Location", "Joined Date"];
    const tableRows: any[] = [];

    filteredUsers.forEach(user => {
      const userData = [
        `DTS-UID-${String(user.id).padStart(4, '0')}`,
        user.email,
        user.role.replace('_USER', ''),
        user.phone || '-',
        [user.city, user.country].filter(Boolean).join(', ') || '-',
        new Date(user.createdAt).toLocaleDateString()
      ];
      tableRows.push(userData);
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

    doc.save("Users_Export.pdf");
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/users`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewUser({ email: '', password: '', username: '', phone: '', role: 'NORMAL_USER' });
        fetchUsers();
      } else {
        const err = await res.json();
        alert("Failed to create user: " + (err.message || 'Unknown error'));
      }
    } catch (error) {
      alert("Failed to create user");
    }
  };

  const startEdit = (user: User) => {
    setEditingUserId(user.id);
    setEditRole(user.role);
    setEditPermissions(user.permissions || []);
    setEditPhone(user.phone || '');
    setEditProfilePicture(user.profilePicture || null);
    setEditCity(user.city || '');
    setEditCountry(user.country || '');
    setEditEmail(user.email || '');
    setEditCommissionRate(user.customCommissionRate !== null && user.customCommissionRate !== undefined ? String(user.customCommissionRate) : '');
    setEditPassword('');
  };

  const handleUploadPicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      setUploadingImage(true);
      const res = await fetch('/api/upload', { method: 'POST', body: uploadData });
      const data = await res.json();
      if (data.success) {
        setEditProfilePicture(data.url);
      } else {
        alert("Upload failed: " + data.message);
      }
    } catch (err) {
      alert("Upload failed.");
    } finally {
      setUploadingImage(false);
    }
  };

  const togglePermission = (perm: string) => {
    setEditPermissions(prev => 
      prev.includes(perm) 
        ? prev.filter(p => p !== perm) 
        : [...prev, perm]
    );
  };

  const saveUser = async (user: User & { _newPassword?: string }) => {
    try {
      const payload: any = { 
        role: editRole, 
        permissions: editPermissions, 
        phone: editPhone, 
        city: editCity, 
        country: editCountry, 
        email: editEmail, 
        profilePicture: editProfilePicture,
        customCommissionRate: editCommissionRate === '' ? null : editCommissionRate
      };
      if (editPassword) {
        payload.password = editPassword;
      }
      
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/auth/users/${user.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setEditingUserId(null);
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to save user", error);
    }
  };

  const handleImpersonate = async (userId: number) => {
    if (!confirm("Are you sure you want to login as this user? You will be redirected to their dashboard.")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/auth/impersonate/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        document.cookie = `token=${data.access_token}; path=/; max-age=86400;`;
        
        // Redirect based on role
        if (data.user.role === 'SUPER_USER' || data.user.role === 'ADMIN_USER') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        alert("Failed to impersonate user. Only Super Admins can do this.");
      }
    } catch (e) {
      console.error(e);
      alert("Error switching user login.");
    }
  };

  const handleRemoveUser = async (userId: number, role: string) => {
    if (role === 'SUPER_USER') {
      alert("Cannot remove a SUPER_USER account.");
      return;
    }
    if (!confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        const data = await res.json();
        alert(data.message || "Failed to remove user. Only Super Admins can perform this action.");
      }
    } catch (e) {
      console.error(e);
      alert("Error removing user.");
    }
  };

  if (loading) return <div className="text-white p-8">Loading users...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">User Rights Management</h1>
          <p className="text-gray-400 text-sm">Assign roles and granular permissions to resellers and staff</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportToPDF} className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2" title="Export PDF">
            <FileText className="w-4 h-4" /> <span className="hidden sm:inline">PDF</span>
          </button>
          <button onClick={exportToExcel} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2" title="Export Excel">
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Excel</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add New User
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search by email or username..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 bg-[#111] border border-white/10 p-2 rounded-lg text-gray-400">
          <Filter className="w-4 h-4" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-transparent outline-none text-sm text-white"
          >
            <option value="ALL">All Roles</option>
            <option value="NORMAL_USER">Normal Users</option>
            <option value="RESELLER_USER">Resellers</option>
            <option value="ADMIN_USER">Admins</option>
            <option value="SUPER_USER">Super Admins</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-800 text-sm">
              <th className="p-4 text-gray-400 font-medium">User</th>
              <th className="p-4 text-gray-400 font-medium">Contact & Location</th>
              <th className="p-4 text-gray-400 font-medium">Role</th>
              <th className="p-4 text-gray-400 font-medium">Permissions</th>
              <th className="p-4 text-gray-400 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No users found matching your filters.
                </td>
              </tr>
            ) : filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 overflow-hidden flex-shrink-0 relative">
                      {(editingUserId === user.id ? editProfilePicture : user.profilePicture) ? (
                        <img src={(editingUserId === user.id ? editProfilePicture : user.profilePicture) as string} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold uppercase text-lg">
                          {(user.username || user.email).charAt(0)}
                        </div>
                      )}
                    </div>
                    {editingUserId === user.id ? (
                      <div className="flex flex-col gap-1 w-full">
                        <input 
                          type="email" 
                          value={editEmail} 
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="bg-gray-950 border border-gray-700 text-white rounded px-2 py-1 text-sm outline-none w-full max-w-[200px]"
                        />
                        <div className="flex gap-2 items-center">
                          <label className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-1 rounded cursor-pointer hover:bg-blue-600/40">
                            <input type="file" className="hidden" accept="image/*" onChange={handleUploadPicture} disabled={uploadingImage} />
                            {uploadingImage ? 'Uploading...' : 'Change Pic'}
                          </label>
                          {editProfilePicture && (
                            <button onClick={() => setEditProfilePicture(null)} className="text-[10px] bg-red-600/20 text-red-400 px-2 py-1 rounded hover:bg-red-600/40">
                              Remove Pic
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <div className="text-white font-medium">{user.email}</div>
                        <div className="text-xs text-gray-500 mt-1 flex flex-col gap-0.5">
                          <span>ID: <strong className="text-blue-400 font-mono">DTS-UID-{String(user.id).padStart(4, '0')}</strong></span>
                          {user.username && <span>User: {user.username}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4 text-gray-300 text-sm">
                  {editingUserId === user.id ? (
                    <div className="flex flex-col gap-1">
                      <input 
                        type="text" 
                        value={editPhone || ''} 
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="Phone"
                        className="bg-gray-950 border border-gray-700 text-white rounded px-2 py-1 text-sm outline-none w-32"
                      />
                      <input 
                        type="text" 
                        value={editCity || ''} 
                        onChange={(e) => setEditCity(e.target.value)}
                        placeholder="City"
                        className="bg-gray-950 border border-gray-700 text-white rounded px-2 py-1 text-sm outline-none w-32"
                      />
                      <input 
                        type="text" 
                        value={editCountry || ''} 
                        onChange={(e) => setEditCountry(e.target.value)}
                        placeholder="Country"
                        className="bg-gray-950 border border-gray-700 text-white rounded px-2 py-1 text-sm outline-none w-32"
                      />
                      <input 
                        type="text" 
                        value={editPassword} 
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="New Password (optional)"
                        className="bg-gray-950 border border-blue-900/50 text-white rounded px-2 py-1 text-sm outline-none w-32 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 text-xs">
                      <div>{user.phone ? <span className="text-gray-300">{user.phone}</span> : <span className="text-gray-600 italic">No Phone</span>}</div>
                      <div>{user.city || user.country ? <span className="text-gray-400">{[user.city, user.country].filter(Boolean).join(', ')}</span> : <span className="text-gray-600 italic">No Location</span>}</div>
                    </div>
                  )}
                </td>
                <td className="p-4">
                  {editingUserId === user.id ? (
                    <div className="flex flex-col gap-2 bg-gray-900 border border-gray-700 p-3 rounded text-sm">
                      <label className="text-gray-400 text-xs">Role</label>
                      <select 
                        value={editRole} 
                        onChange={(e) => handleRoleChange(e.target.value)} 
                        className="bg-[#111] border border-gray-700 text-white rounded px-2 py-1 outline-none focus:border-blue-500"
                      >
                        <option value="NORMAL_USER">Normal User</option>
                        <option value="RESELLER_USER">Reseller</option>
                        <option value="ADMIN_USER">Admin</option>
                        <option value="SUPER_USER">Super Admin</option>
                      </select>
                      
                      <div className="flex justify-between items-center mt-2">
                        <label className="text-gray-400 text-xs">Permissions</label>
                        <button 
                          onClick={() => setEditPermissions(getDefaultPermissionsForRole(editRole))}
                          className="text-[10px] text-blue-400 hover:text-blue-300"
                        >
                          Reset to Default
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium 
                        ${user.role === 'SUPER_USER' ? 'bg-red-500/10 text-red-400' : 
                          user.role === 'ADMIN_USER' ? 'bg-purple-500/10 text-purple-400' :
                          user.role === 'RESELLER_USER' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-gray-700 text-gray-300'}`}
                      >
                        {user.role.replace('_USER', '')}
                      </span>
                      {(user.role === 'RESELLER_USER' || user.role === 'NORMAL_USER') && user.customCommissionRate !== null && user.customCommissionRate !== undefined && (
                        <div className="mt-1 text-xs text-blue-400">
                          Commission: {user.customCommissionRate}%
                        </div>
                      )}
                    </>
                  )}
                </td>
                <td className="p-4 max-w-xs">
                  {editingUserId === user.id ? (
                    <div className="grid grid-cols-2 gap-2">
                      {AVAILABLE_PERMISSIONS.map(perm => (
                        <label key={perm} className="flex items-center gap-2 text-xs text-gray-300">
                          <input 
                            type="checkbox" 
                            checked={editPermissions.includes(perm) || editRole === 'SUPER_USER'}
                            disabled={editRole === 'SUPER_USER'}
                            onChange={() => togglePermission(perm)}
                            className="rounded bg-gray-800 border-gray-700 text-blue-500 focus:ring-0"
                          />
                          {perm.replace(/CAN_/g, '').replace(/_/g, ' ')}
                        </label>
                      ))}
                      {(editRole === 'RESELLER_USER' || editRole === 'NORMAL_USER') && (
                        <div className="col-span-2 mt-2">
                          <label className="block text-xs text-gray-400 mb-1">Custom Commission Rate (%)</label>
                          <input 
                            type="number"
                            step="0.01"
                            value={editCommissionRate}
                            onChange={(e) => setEditCommissionRate(e.target.value)}
                            placeholder="Leave blank for default"
                            className="w-full bg-gray-950 border border-gray-700 text-white rounded px-2 py-1 text-sm outline-none"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {user.role === 'SUPER_USER' ? (
                        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">ALL ACCESS</span>
                      ) : (
                        user.permissions?.length > 0 ? user.permissions.map((p, i) => (
                          <span key={i} className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded uppercase">
                            {p.replace(/CAN_/g, '').replace(/_/g, ' ')}
                          </span>
                        )) : (
                          <span className="text-xs text-gray-600">No special rights</span>
                        )
                      )}
                    </div>
                  )}
                </td>
                <td className="p-4 text-right">
                  {editingUserId === user.id ? (
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <input 
                          type="password" 
                          placeholder="New password (optional)" 
                          className="bg-gray-950 border border-gray-700 text-white text-sm rounded px-2 py-1 outline-none w-48"
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) {
                              (user as any)._newPassword = val;
                            } else {
                              delete (user as any)._newPassword;
                            }
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditingUserId(null)} className="text-gray-400 hover:text-white text-sm">Cancel</button>
                        <button onClick={() => saveUser(user)} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm transition-colors">Save</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleImpersonate(user.id)} className="p-2 text-gray-400 hover:text-green-400 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors inline-flex items-center gap-1" title="Login as this user">
                        <LogIn className="w-4 h-4" /> <span className="text-xs font-bold uppercase hidden xl:inline">Impersonate</span>
                      </button>
                      <button onClick={() => startEdit(user)} className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors inline-flex" title="Edit User Rights & Password">
                        <Edit className="w-4 h-4" />
                      </button>
                      {user.role !== 'SUPER_USER' && (
                        <button onClick={() => handleRemoveUser(user.id, user.role)} className="p-2 text-gray-400 hover:text-red-400 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors inline-flex" title="Remove User">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h3 className="text-xl font-bold text-white">Add New User</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">X</button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email *</label>
                <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password *</label>
                <input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Username (Optional)</label>
                  <input type="text" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Phone (Optional)</label>
                  <input type="text" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white outline-none">
                  <option value="NORMAL_USER">Normal User</option>
                  <option value="RESELLER_USER">Reseller</option>
                  <option value="ADMIN_USER">Admin</option>
                  <option value="SUPER_USER">Super Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
