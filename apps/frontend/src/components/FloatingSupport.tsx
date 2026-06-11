"use client";

import { useState, useEffect } from "react";
import { X, LifeBuoy } from "lucide-react";

export default function FloatingSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    country: "",
    subject: "",
    priority: "MEDIUM",
    message: ""
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(!!localStorage.getItem('token'));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const headers: any = {
        'Content-Type': 'application/json'
      };
      
      let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tickets/guest`;
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/tickets`;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
          setFormData({ name: "", email: "", phone: "", city: "", country: "", subject: "", priority: "MEDIUM", message: "" });
        }, 3000);
      } else {
        alert("Failed to submit ticket.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-24 right-6 z-[9999]">
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center gap-2 h-14 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-600/30 transition-transform hover:scale-105"
        >
          <LifeBuoy className="w-6 h-6" />
          <span className="font-bold whitespace-nowrap">Support</span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0a0a0a]">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <LifeBuoy className="w-6 h-6 text-blue-500" /> Support Ticket
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LifeBuoy className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Ticket Submitted!</h3>
                  <p className="text-gray-400">We have received your ticket and will respond to your email shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Your Name</label>
                      <input required={!isLoggedIn} type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                      <input required={!isLoggedIn} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="john@example.com" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                    <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="+1 234 567 8900" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">City</label>
                      <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="New York" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Country</label>
                      <input required type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="United States" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Subject</label>
                    <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500" placeholder="How can we help?" />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Priority</label>
                    <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500">
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Message</label>
                    <textarea required rows={4} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 resize-none" placeholder="Describe your issue..." />
                  </div>

                  <button disabled={isSubmitting} type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50 mt-2">
                    {isSubmitting ? "Submitting..." : "Submit Ticket"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
