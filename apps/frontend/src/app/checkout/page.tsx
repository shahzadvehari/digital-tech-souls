'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, UploadCloud, CheckCircle2, FileText, ChevronRight, Building2, Bitcoin, Smartphone, Wallet } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const itemId = searchParams.get('item');
  const itemType = searchParams.get('type');
  
  const [product, setProduct] = useState<any>(null);
  const [settings, setSettings] = useState<any>({});
  const { selectedCurrency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'BANK_TRANSFER' | 'CRYPTO' | 'EASYPAISA' | 'JAZZCASH' | 'NAYAPAY' | 'SADAPAY'>('STRIPE');

  const PAYMENT_METHODS = [
    { id: 'STRIPE', name: 'Credit / Debit Card', icon: CreditCard },
    { id: 'BANK_TRANSFER', name: 'Bank Transfer', icon: Building2 },
    { id: 'CRYPTO', name: 'Crypto (USDT)', icon: Bitcoin },
    { id: 'EASYPAISA', name: 'EasyPaisa', icon: Smartphone },
    { id: 'JAZZCASH', name: 'JazzCash', icon: Smartphone },
    { id: 'NAYAPAY', name: 'NayaPay', icon: Wallet },
    { id: 'SADAPAY', name: 'SadaPay', icon: Wallet },
  ] as const;
  
  useEffect(() => {
    if (!itemId || !itemType) {
      setError('Invalid checkout link.');
      setLoading(false);
      return;
    }
    
    // Fetch product and settings
    const fetchData = async () => {
      try {
        let endpoint = '';
        if (itemType === 'THEME' || itemType === 'TOOL') {
          endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/themes-tools/${itemId}`;
        } else if (itemType === 'LICENSE') {
          endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/products/${itemId}`;
        } else if (itemType === 'SERVICE') {
          endpoint = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/services/${itemId}`;
        }
        
        if (!endpoint) throw new Error('Unknown product type');
        
        const [productRes, settingsRes] = await Promise.all([
          fetch(endpoint),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/settings`)
        ]);
        
        if (!productRes.ok) throw new Error('Failed to fetch product details.');
        
        const data = await productRes.json();
        setProduct(data);

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          const settingsObj = settingsData.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
          setSettings(settingsObj);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [itemId, itemType]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod !== 'STRIPE' && !paymentProof) {
      alert('Please upload a payment receipt.');
      return;
    }
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = `/login?redirect=/checkout?item=${itemId}&type=${itemType}`;
        return;
      }

      let receiptUrl = null;

      // 1. Upload receipt if MANUAL
      if (paymentMethod !== 'STRIPE' && paymentProof) {
        const formData = new FormData();
        formData.append('file', paymentProof);
        
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/upload`, {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadRes.ok) throw new Error('Failed to upload receipt');
        const uploadData = await uploadRes.json();
        receiptUrl = uploadData.url;
      }
      
      // 2. Submit Order
      const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: [{ id: parseInt(itemId!), type: itemType }],
          paymentMethod: paymentMethod,
          paymentProof: receiptUrl
        })
      });
      
      if (!orderRes.ok) throw new Error('Failed to create order');
      const orderData = await orderRes.json();
      
      // 3. Handle Stripe Redirect
      if (paymentMethod === 'STRIPE') {
        const stripeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/payments/create-checkout-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ orderId: orderData.id })
        });

        if (!stripeRes.ok) {
          const errData = await stripeRes.json();
          throw new Error(errData.message || 'Failed to initialize Stripe checkout');
        }

        const stripeData = await stripeRes.json();
        window.location.href = stripeData.url;
        return;
      }
      
      alert('Order placed successfully! Waiting for admin approval.');
      window.location.href = '/dashboard';
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading checkout...</div>;
  
  if (error) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl max-w-md text-center">
        <h2 className="text-xl font-bold mb-2">Checkout Error</h2>
        <p>{error}</p>
        <button onClick={() => router.back()} className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
          Go Back
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <span>Store</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">Checkout</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Order Summary (Left) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-blue-500" /> Order Summary
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium">{product.name}</p>
                    <p className="text-sm text-gray-400">{itemType}</p>
                  </div>
                  <p className="text-white font-bold">{selectedCurrency?.symbol} {Math.round(product.price * (selectedCurrency?.rate || 1)).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{selectedCurrency?.symbol} {Math.round(product.price * (selectedCurrency?.rate || 1)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-blue-400">{selectedCurrency?.symbol} {Math.round(product.price * (selectedCurrency?.rate || 1)).toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-right">
                  Amount converted securely to {selectedCurrency?.code} for processing.
                </p>
              </div>
            </div>
          </div>
          
          {/* Payment Details (Right) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 lg:p-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-8">
                <CreditCard className="w-6 h-6 text-green-500" /> Payment Details
              </h2>
              
              <form onSubmit={handleCheckout}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button 
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all text-center ${
                          paymentMethod === method.id 
                            ? 'bg-blue-600/20 border-blue-500 text-white' 
                            : 'bg-black/50 border-white/10 text-gray-400 hover:border-white/30'
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${paymentMethod === method.id ? 'text-blue-500' : 'text-gray-500'}`} />
                        <span className="font-bold text-xs">{method.name}</span>
                      </button>
                    );
                  })}
                </div>

              {paymentMethod !== 'STRIPE' && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-bold text-white mb-2">
                    {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name} Instructions
                  </h3>
                  <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                    Please transfer the total amount to the account below. Once transferred, upload a screenshot or PDF of the receipt. Your order will be manually approved by an admin.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                    {paymentMethod === 'BANK_TRANSFER' && (
                      <>
                        <div className="bg-black/50 p-4 rounded-lg border border-white/5">
                          <span className="block text-gray-500 mb-1">Bank Name</span>
                          <span className="text-white font-medium">Any Supported Bank</span>
                        </div>
                        <div className="bg-black/50 p-4 rounded-lg border border-white/5">
                          <span className="block text-gray-500 mb-1">Account Title</span>
                          <span className="text-white font-medium">{settings?.bankTransferTitle || 'Digital Tech Souls'}</span>
                        </div>
                        <div className="bg-black/50 p-4 rounded-lg border border-white/5 md:col-span-2">
                          <span className="block text-gray-500 mb-1">IBAN / Account Number</span>
                          <span className="text-white font-mono tracking-wider">{settings?.bankTransferIban || 'PK00MEZN000000000000'}</span>
                        </div>
                      </>
                    )}

                    {paymentMethod === 'CRYPTO' && (
                      <>
                        <div className="bg-black/50 p-4 rounded-lg border border-white/5">
                          <span className="block text-gray-500 mb-1">Network</span>
                          <span className="text-white font-medium">Tron (TRC20)</span>
                        </div>
                        <div className="bg-black/50 p-4 rounded-lg border border-white/5">
                          <span className="block text-gray-500 mb-1">Coin</span>
                          <span className="text-white font-medium">USDT (Tether)</span>
                        </div>
                        <div className="bg-black/50 p-4 rounded-lg border border-white/5 md:col-span-2 overflow-x-auto">
                          <span className="block text-gray-500 mb-1">Wallet Address</span>
                          <span className="text-white font-mono tracking-wider text-xs sm:text-sm">{settings?.cryptoWallet || 'Txxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}</span>
                        </div>
                      </>
                    )}

                    {(paymentMethod === 'EASYPAISA' || paymentMethod === 'JAZZCASH' || paymentMethod === 'NAYAPAY' || paymentMethod === 'SADAPAY') && (
                      <>
                        <div className="bg-black/50 p-4 rounded-lg border border-white/5">
                          <span className="block text-gray-500 mb-1">Provider</span>
                          <span className="text-white font-medium">{PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name}</span>
                        </div>
                        <div className="bg-black/50 p-4 rounded-lg border border-white/5">
                          <span className="block text-gray-500 mb-1">Account Title</span>
                          <span className="text-white font-medium">{settings?.bankTransferTitle || 'Digital Tech Souls'}</span>
                        </div>
                        <div className="bg-black/50 p-4 rounded-lg border border-white/5 md:col-span-2">
                          <span className="block text-gray-500 mb-1">Account Number / ID</span>
                          <span className="text-white font-mono tracking-wider">
                            {paymentMethod === 'EASYPAISA' ? (settings?.easyPaisaNumber || '0300-XXXXXXX') : ''}
                            {paymentMethod === 'JAZZCASH' ? (settings?.jazzCashNumber || '0300-XXXXXXX') : ''}
                            {paymentMethod === 'NAYAPAY' ? (settings?.nayaPayNumber || '0300-XXXXXXX') : ''}
                            {paymentMethod === 'SADAPAY' ? (settings?.sadaPayNumber || '0300-XXXXXXX') : ''}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Upload Payment Receipt
                    </label>
                    <label className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-black/50 border-2 border-dashed border-white/10 rounded-xl hover:bg-black/80 hover:border-white/30 cursor-pointer">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-400">
                          {paymentProof ? <span className="text-green-400 font-medium flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> {paymentProof.name}</span> : <span className="font-semibold text-white">Click to upload</span>}
                        </p>
                        {!paymentProof && <p className="text-xs text-gray-500 mt-1">PNG, JPG or PDF</p>}
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*,.pdf"
                        onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                        required={true}
                      />
                    </label>
                  </div>
                </div>
              )}
              
              {paymentMethod === 'STRIPE' && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-8 flex flex-col items-center justify-center text-center">
                  <CreditCard className="w-12 h-12 text-blue-500 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Secure Online Payment</h3>
                  <p className="text-gray-300 text-sm max-w-md mx-auto">
                    You will be redirected to our secure Stripe checkout portal to safely process your credit or debit card payment.
                  </p>
                </div>
              )}
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {submitting ? 'Processing...' : 'Submit Order'}
                </button>
              </form>
              
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
