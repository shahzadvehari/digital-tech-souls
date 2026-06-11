"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tickets/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          subject,
          priority: 'MEDIUM',
          message
        })
      });

      if (res.ok) {
        setSuccess(true);
        setName('');
        setEmail('');
        setPhone('');
        setSubject('');
        setMessage('');
      } else {
        const data = await res.json();
        setErrorMsg(data.message || 'Failed to submit your message.');
      }
    } catch (err) {
      setErrorMsg('A network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050B14] flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Contact <span className="text-gradient">Us</span></h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Have a question, need support, or want to inquire about our services? Our team is here to help. 
              Open a support ticket below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="glass p-8 rounded-2xl flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Our Location</h3>
                  <p className="text-gray-400">Vehari, Punjab, Pakistan</p>
                </div>
              </div>

              <div className="glass p-8 rounded-2xl flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Phone Number</h3>
                  <p className="text-gray-400">+92 300 4742747</p>
                </div>
              </div>

              <div className="glass p-8 rounded-2xl flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Email Address</h3>
                  <p className="text-gray-400">support@digitaltechsouls.com</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="glass p-8 md:p-12 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-6">Open a Support Ticket</h2>
                
                {success ? (
                  <div className="bg-green-500/20 border border-green-500/50 text-green-400 p-6 rounded-xl text-center">
                    <h3 className="text-xl font-bold mb-2">Message Sent Successfully!</h3>
                    <p>We have received your ticket and will get back to you as soon as possible via email.</p>
                    <button 
                      onClick={() => setSuccess(false)}
                      className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-500 transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {errorMsg && (
                      <div className="p-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg">
                        {errorMsg}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Full Name *</label>
                        <input 
                          type="text" required value={name} onChange={e => setName(e.target.value)}
                          className="w-full bg-[#050B14] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Email Address *</label>
                        <input 
                          type="email" required value={email} onChange={e => setEmail(e.target.value)}
                          className="w-full bg-[#050B14] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number *</label>
                        <input 
                          type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                          className="w-full bg-[#050B14] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                          placeholder="+1234567890"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Subject *</label>
                        <input 
                          type="text" required value={subject} onChange={e => setSubject(e.target.value)}
                          className="w-full bg-[#050B14] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                          placeholder="How can we help?"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Message *</label>
                      <textarea 
                        required rows={5} value={message} onChange={e => setMessage(e.target.value)}
                        className="w-full bg-[#050B14] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none transition-colors resize-none"
                        placeholder="Please describe your request in detail..."
                      />
                    </div>

                    <button 
                      type="submit" disabled={submitting}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-5 h-5" /> Submit Ticket
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
