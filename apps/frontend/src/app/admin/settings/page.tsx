"use client";

import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';

export default function SettingsAdmin() {
  const [settings, setSettings] = useState({
    heroTitle: 'Reliable Web Hosting & Digital Solutions for Growing Businesses',
    heroSubtitle: 'Fast, Secure and Affordable Hosting with Professional Web Development, Digital Marketing and Graphic Design Services.',
    heroImage: '/images/hero-hosting.png',
    whatsappNumber: '+1234567890',
    whmcsUrl: 'https://billings.digitaltechsouls.com/',
    hostingButtonTitle: 'Go to Hosting Portal',
    adminHostingMenuTitle: 'Hosting Portal',
    cpanelUrl: 'https://cpanel.digitaltechsouls.com/',
    resellerUrl: 'https://reseller.digitaltechsouls.com/',
    siteLogo: '/images/logo.png',
    siteFavicon: '/favicon.ico',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
    smtpFromName: 'Digital Tech Souls',
    smtpFromEmail: 'noreply@digitaltechsouls.com',
    stripePublicKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    cryptoWallet: '',
    easyPaisaNumber: '',
    jazzCashNumber: '',
    nayaPayNumber: '',
    sadaPayNumber: '',
    bankTransferIban: '',
    bankTransferTitle: '',
    affiliate_commission_rate: '10',
    reseller_commission_rate: '20',
    fontGlobal: 'var(--font-geist-sans), Arial, sans-serif',
    fontHeading: 'var(--font-geist-sans), Arial, sans-serif',
    colorHeading: '#ffffff',
    colorParagraph: '#d1d5db',
    heroTitleSize: '3rem',
    heroTitleColor: '#ffffff',
    invoiceCompanyName: 'DIGITAL TECH SOULS',
    invoiceCompanyAddress: 'Vehari, Punjab, Pakistan',
    invoiceCompanyPhone: '+92 300 0000000',
    invoiceCompanyEmail: 'info@digitaltechsouls.com',
    maintenanceMode: 'false',
    invoiceTaxId: '',
    invoiceFooterText: 'Thank you for your business! Please contact us if you have any questions.',
    invoicePrimaryColor: '#2563eb',
    invoiceLogoUrl: '',
    invoiceTaxRate: '0',
    invoiceDiscountRate: '0',
    seo_title: 'Digital Tech Souls | Premium Hosting & Digital Solutions',
    seo_description: 'Fast, Secure and Affordable Hosting with Professional Web Development, Digital Marketing and Graphic Design Services.',
    seo_keywords: 'web hosting, cpanel, wordpress, digital marketing, web development',
    seo_author: 'Digital Tech Souls',
    seo_robots: 'index, follow',
    seo_canonical_url: 'https://digitaltechsouls.com',
    seo_og_image: '/images/hero-hosting.png'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/settings`);
      if (res.ok) {
        const data = await res.json();
        const settingsObj = data.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
        
        setSettings(prev => ({
          ...prev,
          heroTitle: settingsObj.heroTitle || prev.heroTitle,
          heroSubtitle: settingsObj.heroSubtitle || prev.heroSubtitle,
          heroImage: settingsObj.heroImage || prev.heroImage,
          whatsappNumber: settingsObj.whatsappNumber || prev.whatsappNumber,
          whmcsUrl: settingsObj.whmcsUrl || prev.whmcsUrl,
          hostingButtonTitle: settingsObj.hostingButtonTitle || prev.hostingButtonTitle,
          adminHostingMenuTitle: settingsObj.adminHostingMenuTitle || prev.adminHostingMenuTitle,
          cpanelUrl: settingsObj.cpanelUrl || prev.cpanelUrl,
          resellerUrl: settingsObj.resellerUrl || prev.resellerUrl,
          siteLogo: settingsObj.siteLogo || prev.siteLogo,
          siteFavicon: settingsObj.siteFavicon || prev.siteFavicon,
          smtpHost: settingsObj.smtpHost || prev.smtpHost,
          smtpPort: settingsObj.smtpPort || prev.smtpPort,
          smtpUser: settingsObj.smtpUser || prev.smtpUser,
          smtpPass: settingsObj.smtpPass || prev.smtpPass,
          smtpFromName: settingsObj.smtpFromName || prev.smtpFromName,
          smtpFromEmail: settingsObj.smtpFromEmail || prev.smtpFromEmail,
          stripePublicKey: settingsObj.stripePublicKey || prev.stripePublicKey,
          stripeSecretKey: settingsObj.stripeSecretKey || prev.stripeSecretKey,
          stripeWebhookSecret: settingsObj.stripeWebhookSecret || prev.stripeWebhookSecret,
          cryptoWallet: settingsObj.cryptoWallet || prev.cryptoWallet,
          easyPaisaNumber: settingsObj.easyPaisaNumber || prev.easyPaisaNumber,
          jazzCashNumber: settingsObj.jazzCashNumber || prev.jazzCashNumber,
          nayaPayNumber: settingsObj.nayaPayNumber || prev.nayaPayNumber,
          sadaPayNumber: settingsObj.sadaPayNumber || prev.sadaPayNumber,
          bankTransferIban: settingsObj.bankTransferIban || prev.bankTransferIban,
          bankTransferTitle: settingsObj.bankTransferTitle || prev.bankTransferTitle,
          affiliate_commission_rate: settingsObj.affiliate_commission_rate || prev.affiliate_commission_rate,
          reseller_commission_rate: settingsObj.reseller_commission_rate || prev.reseller_commission_rate,
          fontGlobal: settingsObj.fontGlobal || prev.fontGlobal,
          fontHeading: settingsObj.fontHeading || prev.fontHeading,
          colorHeading: settingsObj.colorHeading || prev.colorHeading,
          colorParagraph: settingsObj.colorParagraph || prev.colorParagraph,
          heroTitleSize: settingsObj.heroTitleSize || prev.heroTitleSize,
          heroTitleColor: settingsObj.heroTitleColor || prev.heroTitleColor,
          invoiceCompanyName: settingsObj.invoiceCompanyName || prev.invoiceCompanyName,
          invoiceCompanyAddress: settingsObj.invoiceCompanyAddress || prev.invoiceCompanyAddress,
          invoiceCompanyPhone: settingsObj.invoiceCompanyPhone || prev.invoiceCompanyPhone,
          invoiceCompanyEmail: settingsObj.invoiceCompanyEmail || prev.invoiceCompanyEmail,
          maintenanceMode: settingsObj.maintenanceMode || prev.maintenanceMode,
          invoiceTaxId: settingsObj.invoiceTaxId || prev.invoiceTaxId,
          invoiceFooterText: settingsObj.invoiceFooterText || prev.invoiceFooterText,
          invoicePrimaryColor: settingsObj.invoicePrimaryColor || prev.invoicePrimaryColor,
          invoiceLogoUrl: settingsObj.invoiceLogoUrl || prev.invoiceLogoUrl,
          invoiceTaxRate: settingsObj.invoiceTaxRate || prev.invoiceTaxRate,
          invoiceDiscountRate: settingsObj.invoiceDiscountRate || prev.invoiceDiscountRate,
        }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const promises = Object.entries(settings).map(([key, value]) => 
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/settings`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ key, value })
        })
      );
      
      const results = await Promise.all(promises);
      const allOk = results.every(r => r.ok);
      
      if (allOk) {
        setMessage('Settings saved successfully!');
      } else {
        setMessage('Error saving settings. Note: Only SUPER_USER can edit settings.');
      }
    } catch (error) {
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleTestSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) {
      alert("Please enter an email address to test.");
      return;
    }
    setTestingSmtp(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/settings/test-smtp`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ to: testEmail })
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Success: " + data.message);
      } else {
        alert("❌ Failed: " + data.message);
      }
    } catch (error) {
      alert("Network error while trying to test SMTP.");
    } finally {
      setTestingSmtp(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Global Settings</h2>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save All Changes
        </button>
      </div>
      
      {message && (
        <div className={`p-4 mb-6 rounded-lg ${message.includes('Error') || message.includes('Failed') ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-green-500/20 text-green-400 border border-green-500/50'}`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Site Status (Maintenance)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Maintenance Mode</label>
                <select
                  value={settings.maintenanceMode}
                  onChange={e => setSettings({...settings, maintenanceMode: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                >
                  <option value="false">Off (Site is live)</option>
                  <option value="true">On (Maintenance Page active)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">When active, visitors will see a maintenance page. Admins can still access the console.</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-medium text-white mb-4">Website Content</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Hero Title</label>
                <input 
                  type="text" 
                  value={settings.heroTitle}
                  onChange={e => setSettings({...settings, heroTitle: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., Premium Web Hosting"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Hero Subtitle</label>
                <textarea 
                  value={settings.heroSubtitle}
                  onChange={e => setSettings({...settings, heroSubtitle: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none h-24"
                  placeholder="e.g., Fast, secure, and reliable hosting for your business."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Hero Image</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={settings.heroImage}
                    onChange={e => setSettings({...settings, heroImage: e.target.value})}
                    className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none min-w-0"
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
                            setSettings(prev => ({...prev, heroImage: data.url}));
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

              {/* Site Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Site Logo</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={settings.siteLogo}
                    onChange={e => setSettings({...settings, siteLogo: e.target.value})}
                    className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none min-w-0"
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
                            setSettings(prev => ({...prev, siteLogo: data.url}));
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

              {/* Site Favicon */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Site Favicon (.ico or .png)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={settings.siteFavicon}
                    onChange={e => setSettings({...settings, siteFavicon: e.target.value})}
                    className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none min-w-0"
                    placeholder="URL or Upload Image"
                  />
                  <label className="bg-gray-800 hover:bg-gray-700 cursor-pointer border border-gray-700 rounded-lg px-4 py-2 flex items-center justify-center text-sm transition-colors whitespace-nowrap">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/png, image/x-icon"
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
                            setSettings(prev => ({...prev, siteFavicon: data.url}));
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
          </div>

          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-medium text-white mb-4">Integrations & Links</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">WhatsApp Number</label>
                <input 
                  type="text" 
                  value={settings.whatsappNumber}
                  onChange={e => setSettings({...settings, whatsappNumber: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., +1234567890"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">WHMCS Base URL</label>
                <input 
                  type="url" 
                  value={settings.whmcsUrl}
                  onChange={e => setSettings({...settings, whmcsUrl: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., https://billings.digitaltechsouls.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Hosting Portal Button Title</label>
                <input 
                  type="text" 
                  value={settings.hostingButtonTitle}
                  onChange={e => setSettings({...settings, hostingButtonTitle: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., Go to Hosting Portal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Admin Menu: Hosting Plans Label</label>
                <input 
                  type="text" 
                  value={settings.adminHostingMenuTitle}
                  onChange={e => setSettings({...settings, adminHostingMenuTitle: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., Hosting Plans"
                />
              </div>
            </div>
          </div>

          {/* Email / SMTP Settings */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-medium text-white mb-4">Email Notifications Engine (SMTP)</h3>
            <p className="text-sm text-gray-400 mb-6">Configure your mail server to automatically send emails for new registrations, support ticket replies, and paid orders.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">SMTP Host</label>
                <input 
                  type="text" 
                  value={settings.smtpHost}
                  onChange={e => setSettings({...settings, smtpHost: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., smtp.gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">SMTP Port</label>
                <input 
                  type="text" 
                  value={settings.smtpPort}
                  onChange={e => setSettings({...settings, smtpPort: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., 587 or 465"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">SMTP Username</label>
                <input 
                  type="text" 
                  value={settings.smtpUser}
                  onChange={e => setSettings({...settings, smtpUser: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., info@digitaltechsouls.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">SMTP Password</label>
                <input 
                  type="password" 
                  value={settings.smtpPass}
                  onChange={e => setSettings({...settings, smtpPass: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">From Name</label>
                <input 
                  type="text" 
                  value={settings.smtpFromName}
                  onChange={e => setSettings({...settings, smtpFromName: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., Digital Tech Souls"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">From Email</label>
                <input 
                  type="text" 
                  value={settings.smtpFromEmail}
                  onChange={e => setSettings({...settings, smtpFromEmail: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., noreply@digitaltechsouls.com"
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <h4 className="text-md font-medium text-white mb-2">Test SMTP Connection</h4>
              <div className="flex gap-2 items-center">
                <input 
                  type="email" 
                  value={testEmail}
                  onChange={e => setTestEmail(e.target.value)}
                  className="bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none max-w-sm"
                  placeholder="Enter your email to test..."
                />
                <button
                  type="button"
                  onClick={handleTestSmtp}
                  disabled={testingSmtp}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {testingSmtp ? 'Sending...' : 'Send Test Email'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Make sure to Save Settings before testing if you have made changes.</p>
            </div>
          </div>

          {/* Payment Gateways */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-medium text-white mb-4">Payment Gateways (Stripe)</h3>
            <p className="text-sm text-gray-400 mb-6">Configure your Stripe API keys to accept credit card payments. Get these from your Stripe Dashboard.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Stripe Public Key</label>
                <input 
                  type="text" 
                  value={settings.stripePublicKey}
                  onChange={e => setSettings({...settings, stripePublicKey: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="pk_test_..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Stripe Secret Key</label>
                <input 
                  type="password" 
                  value={settings.stripeSecretKey}
                  onChange={e => setSettings({...settings, stripeSecretKey: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="sk_test_..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Stripe Webhook Secret</label>
                <input 
                  type="password" 
                  value={settings.stripeWebhookSecret}
                  onChange={e => setSettings({...settings, stripeWebhookSecret: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="whsec_..."
                />
              </div>
            </div>
          </div>

          {/* Manual Payment Gateways */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-medium text-white mb-4">Manual Payment Methods</h3>
            <p className="text-sm text-gray-400 mb-6">Configure account numbers and wallet addresses for manual transfers. Customers will upload screenshots of payments to these accounts.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Bank Transfer IBAN / Account No</label>
                <input 
                  type="text" 
                  value={settings.bankTransferIban}
                  onChange={e => setSettings({...settings, bankTransferIban: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., PK00MEZN000000000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Bank Account Title</label>
                <input 
                  type="text" 
                  value={settings.bankTransferTitle}
                  onChange={e => setSettings({...settings, bankTransferTitle: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., Digital Tech Souls"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Crypto Wallet (USDT TRC20)</label>
                <input 
                  type="text" 
                  value={settings.cryptoWallet}
                  onChange={e => setSettings({...settings, cryptoWallet: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., Txxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">EasyPaisa Number</label>
                <input 
                  type="text" 
                  value={settings.easyPaisaNumber}
                  onChange={e => setSettings({...settings, easyPaisaNumber: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., 0300-XXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">JazzCash Number</label>
                <input 
                  type="text" 
                  value={settings.jazzCashNumber}
                  onChange={e => setSettings({...settings, jazzCashNumber: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., 0300-XXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">NayaPay Number / ID</label>
                <input 
                  type="text" 
                  value={settings.nayaPayNumber}
                  onChange={e => setSettings({...settings, nayaPayNumber: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., 0300-XXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">SadaPay Number / ID</label>
                <input 
                  type="text" 
                  value={settings.sadaPayNumber}
                  onChange={e => setSettings({...settings, sadaPayNumber: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., 0300-XXXXXXX"
                />
              </div>
            </div>
          </div>

          {/* Affiliate & Reseller Rates */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-medium text-white mb-4">Affiliate & Reseller Rates</h3>
            <p className="text-sm text-gray-400 mb-6">Configure the default commission percentages awarded for successful referrals. Standard affiliates and premium resellers can have different rates.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Standard Affiliate Rate (%)</label>
                <input 
                  type="number" 
                  value={settings.affiliate_commission_rate}
                  onChange={e => setSettings({...settings, affiliate_commission_rate: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., 10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Premium Reseller Rate (%)</label>
                <input 
                  type="number" 
                  value={settings.reseller_commission_rate}
                  onChange={e => setSettings({...settings, reseller_commission_rate: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., 20"
                />
              </div>
            </div>
          </div>

          {/* Typography & Styling */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-medium text-white mb-4">Typography & Styling</h3>
            <p className="text-sm text-gray-400 mb-6">Customize the fonts, sizes, and colors globally across the platform.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Global/Paragraph Font Family</label>
                <input 
                  type="text" 
                  value={settings.fontGlobal}
                  onChange={e => setSettings({...settings, fontGlobal: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., 'Inter', sans-serif"
                />
                <p className="text-xs text-gray-500 mt-1">Accepts any standard CSS font-family string.</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Heading Font Family (h1-h6)</label>
                <input 
                  type="text" 
                  value={settings.fontHeading}
                  onChange={e => setSettings({...settings, fontHeading: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., 'Poppins', sans-serif"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Heading Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={settings.colorHeading}
                    onChange={e => setSettings({...settings, colorHeading: e.target.value})}
                    className="w-12 h-10 bg-gray-950 border border-gray-800 rounded cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={settings.colorHeading}
                    onChange={e => setSettings({...settings, colorHeading: e.target.value})}
                    className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none uppercase"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Paragraph Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={settings.colorParagraph}
                    onChange={e => setSettings({...settings, colorParagraph: e.target.value})}
                    className="w-12 h-10 bg-gray-950 border border-gray-800 rounded cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={settings.colorParagraph}
                    onChange={e => setSettings({...settings, colorParagraph: e.target.value})}
                    className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none uppercase"
                  />
                </div>
              </div>

              <div className="md:col-span-2 mt-4">
                <h4 className="text-md font-medium text-white mb-3 border-b border-gray-800 pb-2">Hero Section Adjustments</h4>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Hero Title Font Size</label>
                <input 
                  type="text" 
                  value={settings.heroTitleSize}
                  onChange={e => setSettings({...settings, heroTitleSize: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., 4rem or 64px"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Hero Title Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={settings.heroTitleColor}
                    onChange={e => setSettings({...settings, heroTitleColor: e.target.value})}
                    className="w-12 h-10 bg-gray-950 border border-gray-800 rounded cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={settings.heroTitleColor}
                    onChange={e => setSettings({...settings, heroTitleColor: e.target.value})}
                    className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none uppercase"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Invoice Management */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-medium text-white mb-4">Invoice Management</h3>
            <p className="text-sm text-gray-400 mb-6">Customize the details and branding that appear on the customer's PDF Invoices.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Company Logo (Image URL)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={settings.invoiceLogoUrl}
                    onChange={e => setSettings({...settings, invoiceLogoUrl: e.target.value})}
                    className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none min-w-0"
                    placeholder="https://example.com/logo.png"
                  />
                  <label className="bg-gray-800 hover:bg-gray-700 cursor-pointer border border-gray-700 rounded-lg px-4 py-2 flex items-center justify-center text-sm transition-colors whitespace-nowrap">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/png, image/jpeg"
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
                            setSettings(prev => ({...prev, invoiceLogoUrl: data.url}));
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
                <label className="block text-sm font-medium text-gray-400 mb-1">Company Name</label>
                <input 
                  type="text" 
                  value={settings.invoiceCompanyName}
                  onChange={e => setSettings({...settings, invoiceCompanyName: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., Digital Tech Souls"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Company Email</label>
                <input 
                  type="text" 
                  value={settings.invoiceCompanyEmail}
                  onChange={e => setSettings({...settings, invoiceCompanyEmail: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., billing@digitaltechsouls.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Contact Phone</label>
                <input 
                  type="text" 
                  value={settings.invoiceCompanyPhone}
                  onChange={e => setSettings({...settings, invoiceCompanyPhone: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., +92 300 0000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Tax ID / VAT Number</label>
                <input 
                  type="text" 
                  value={settings.invoiceTaxId}
                  onChange={e => setSettings({...settings, invoiceTaxId: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., NTN-1234567-8"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Company Full Address</label>
                <textarea 
                  value={settings.invoiceCompanyAddress}
                  onChange={e => setSettings({...settings, invoiceCompanyAddress: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none h-20"
                  placeholder="Street, City, Zip, Country"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Global Tax Rate (%)</label>
                <input 
                  type="number" 
                  value={settings.invoiceTaxRate}
                  onChange={e => setSettings({...settings, invoiceTaxRate: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., 5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Global Discount Rate (%)</label>
                <input 
                  type="number" 
                  value={settings.invoiceDiscountRate}
                  onChange={e => setSettings({...settings, invoiceDiscountRate: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., 10"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Footer / Thank You Note</label>
                <input 
                  type="text" 
                  value={settings.invoiceFooterText}
                  onChange={e => setSettings({...settings, invoiceFooterText: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                  placeholder="Thank you for your business!"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Invoice Brand Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={settings.invoicePrimaryColor}
                    onChange={e => setSettings({...settings, invoicePrimaryColor: e.target.value})}
                    className="w-12 h-10 bg-gray-950 border border-gray-800 rounded cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={settings.invoicePrimaryColor}
                    onChange={e => setSettings({...settings, invoicePrimaryColor: e.target.value})}
                    className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Global SEO Settings */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 mt-6">
            <h3 className="text-xl font-bold text-white mb-6">Global SEO Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">SEO Title</label>
                <input
                  type="text"
                  value={settings.seo_title}
                  onChange={(e) => setSettings({...settings, seo_title: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">SEO Keywords</label>
                <input
                  type="text"
                  value={settings.seo_keywords}
                  onChange={(e) => setSettings({...settings, seo_keywords: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">SEO Description</label>
                <textarea
                  value={settings.seo_description}
                  onChange={(e) => setSettings({...settings, seo_description: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none h-24 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Author</label>
                <input
                  type="text"
                  value={settings.seo_author}
                  onChange={(e) => setSettings({...settings, seo_author: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Robots</label>
                <input
                  type="text"
                  value={settings.seo_robots}
                  onChange={(e) => setSettings({...settings, seo_robots: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Canonical URL</label>
                <input
                  type="text"
                  value={settings.seo_canonical_url}
                  onChange={(e) => setSettings({...settings, seo_canonical_url: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Open Graph Image</label>
                <input
                  type="text"
                  value={settings.seo_og_image}
                  onChange={(e) => setSettings({...settings, seo_og_image: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button 
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
