"use client";

import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Loader2, KeyRound } from 'lucide-react';
import Image from 'next/image';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      // Better approach: fetch from /auth/profile directly
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const profileData = await res.json();
          setUser(profileData);
          setFormData({
            username: profileData.username || '',
            phone: profileData.phone || '',
            profilePicture: profileData.profilePicture || '',
            currentPassword: '',
            newPassword: ''
          });
        }
      } catch (err) {
        console.error("Failed to load user profile", err);
      }
    };
    fetchProfile();
  }, []);

  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    profilePicture: '',
    currentPassword: '',
    newPassword: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      setProfileLoading(true);
      const token = localStorage.getItem('token');
      const payload: any = {
        username: formData.username,
        phone: formData.phone,
        profilePicture: formData.profilePicture,
      };
      
      if (formData.newPassword) {
        payload.newPassword = formData.newPassword;
        payload.currentPassword = formData.currentPassword;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/profile`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setProfileSuccess('Profile updated successfully!');
        setUser({ ...user, ...data });
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
        // Update local storage user partial
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...stored, username: data.username, profilePicture: data.profilePicture }));
        
        // Dispatch custom event to notify Navbar
        window.dispatchEvent(new Event('user-updated'));
      } else {
        setProfileError(data.message || 'Update failed');
      }
    } catch (err) {
      setProfileError('Network error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUploadPicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      setProfileLoading(true);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, profilePicture: data.url }));
        setProfileSuccess('Picture uploaded! Click Save to apply.');
      } else {
        setProfileError("Upload failed: " + data.message);
      }
    } catch (err) {
      setProfileError("Upload failed.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleGenerate2FA = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/2fa/generate`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setQrCodeUrl(data.qrCodeUrl);
      } else {
        setError(data.message || 'Failed to generate QR code');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleTurnOn2FA = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/2fa/turn-on`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: twoFactorCode })
      });
      if (res.ok) {
        setSuccess('Two-Factor Authentication is now enabled!');
        setQrCodeUrl('');
        setUser({ ...user, isTwoFactorEnabled: true });
        setTwoFactorCode('');
      } else {
        const data = await res.json();
        setError(data.message || 'Invalid code');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleTurnOff2FA = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/2fa/turn-off`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: twoFactorCode })
      });
      if (res.ok) {
        setSuccess('Two-Factor Authentication has been disabled.');
        setUser({ ...user, isTwoFactorEnabled: false });
        setTwoFactorCode('');
      } else {
        const data = await res.json();
        setError(data.message || 'Invalid code');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  // We need to know if 2FA is currently enabled. 
  // In our get users we didn't expose isTwoFactorEnabled. Let's assume false if not present, but wait, we should check it.
  // Assuming the user object returned from /auth/users has it if we add it. I'll add it in backend soon.
  const is2FAEnabled = user.isTwoFactorEnabled || false;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Account Settings</h1>
        <p className="text-gray-400 mt-2">Manage your account security and preferences.</p>
      </div>

      {/* Profile Settings */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Profile Details</h2>
        
        {profileError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">{profileError}</div>}
        {profileSuccess && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm">{profileSuccess}</div>}
        
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-800 border-2 border-gray-700 overflow-hidden relative flex-shrink-0">
              {formData.profilePicture ? (
                <Image src={formData.profilePicture} alt="Profile" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-3xl font-bold uppercase">
                  {user.username ? user.username.charAt(0) : user.email.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <div className="flex gap-2">
                <label className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer inline-block border border-gray-700">
                  <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleUploadPicture} disabled={profileLoading} />
                  {profileLoading ? 'Uploading...' : 'Change Picture'}
                </label>
                {formData.profilePicture && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setFormData(prev => ({ ...prev, profilePicture: '' }));
                      setProfileSuccess('Picture removed! Click Save Profile to apply.');
                    }}
                    className="bg-red-900/20 hover:bg-red-800/40 text-red-400 border border-red-800/50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Remove Picture
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">Recommended: 256x256px JPG or PNG.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email (Read Only)</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-gray-500 outline-none opacity-70 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
                placeholder="Choose a username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
                placeholder="+1234567890"
              />
            </div>
            
            <div className="md:col-span-2 pt-4 border-t border-gray-800 mt-2">
              <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Current Password</label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
                placeholder="Required to set a new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
                placeholder="Leave blank to keep current"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {profileLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Profile
          </button>
        </form>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className={`p-3 rounded-xl ${is2FAEnabled ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
            {is2FAEnabled ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Two-Factor Authentication (2FA)</h2>
            <p className="text-gray-400 text-sm">Add an extra layer of security to your account.</p>
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm">{success}</div>}

        {!is2FAEnabled && !qrCodeUrl && (
          <div>
            <p className="text-gray-300 mb-4">
              Two-Factor Authentication is currently disabled. Enabling it will require you to enter a code from an authenticator app (like Google Authenticator or Authy) every time you log in.
            </p>
            <button
              onClick={handleGenerate2FA}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Enable 2FA
            </button>
          </div>
        )}

        {!is2FAEnabled && qrCodeUrl && (
          <div className="space-y-6">
            <div className="p-6 bg-gray-950 rounded-lg inline-block border border-gray-800">
              <p className="text-white font-medium mb-4 text-center">1. Scan this QR Code with your Authenticator App</p>
              <div className="bg-white p-4 rounded-lg">
                <Image src={qrCodeUrl} alt="2FA QR Code" width={200} height={200} />
              </div>
            </div>

            <div className="max-w-xs">
              <p className="text-white font-medium mb-2">2. Enter the 6-digit code</p>
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-blue-500 transition-colors tracking-widest font-mono"
                  placeholder="000000"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleTurnOn2FA}
                  disabled={loading || twoFactorCode.length < 6}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex-1"
                >
                  Verify & Enable
                </button>
                <button
                  onClick={() => setQrCodeUrl('')}
                  className="bg-transparent hover:bg-gray-800 text-gray-400 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {is2FAEnabled && (
          <div>
            <p className="text-green-400 font-medium mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> 2FA is active and protecting your account.
            </p>
            <div className="max-w-xs p-6 bg-gray-950 border border-gray-800 rounded-lg">
              <p className="text-white font-medium mb-2 text-sm">Disable 2FA</p>
              <p className="text-gray-400 text-xs mb-4">Enter a code from your app to disable.</p>
              <input
                type="text"
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white outline-none focus:border-red-500 transition-colors tracking-widest font-mono mb-4 text-center"
                placeholder="000000"
              />
              <button
                onClick={handleTurnOff2FA}
                disabled={loading || twoFactorCode.length < 6}
                className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Disable 2FA
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
