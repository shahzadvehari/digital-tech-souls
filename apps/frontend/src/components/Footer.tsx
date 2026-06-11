'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Globe, MessageCircle, Share2, Rss, Mail, Phone, MapPin } from "lucide-react";
import WhatsAppButton from "./WhatsAppButton";

export default function Footer() {
  const [logoUrl, setLogoUrl] = useState("/logo.png");
  const [settings, setSettings] = useState<any>({});
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/settings`)
      .then(res => res.json())
      .then(settingsData => {
        const siteLogo = settingsData.find((s: any) => s.key === 'siteLogo')?.value;
        if (siteLogo) setLogoUrl(siteLogo);
        
        const settingsObj = settingsData.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
        setSettings(settingsObj);
      })
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/services`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setServices(data.slice(0, 5));
      })
      .catch(console.error);
  }, []);

  return (
    <footer className="bg-black/40 border-t border-white/5 pt-20 pb-10 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Info */}
          <div className="space-y-6">
            <div className="flex items-center">
              <Image 
                src={logoUrl} 
                alt="Digital Tech Souls Logo" 
                width={160} 
                height={55} 
                className="h-auto w-auto max-h-[60px] object-contain"
              />
            </div>
            <p className="text-gray-400 leading-relaxed text-sm">
              Premium web hosting, web development, and digital marketing solutions tailored for businesses that demand reliability and performance.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><Globe className="w-5 h-5"/></a>
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><MessageCircle className="w-5 h-5"/></a>
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><Share2 className="w-5 h-5"/></a>
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><Rss className="w-5 h-5"/></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
              <li><Link href="/themes-tools" className="hover:text-blue-400 transition-colors">Themes & Tools</Link></li>
              <li><Link href="/licenses" className="hover:text-blue-400 transition-colors">Digital Licenses</Link></li>
              <li><a href={settings.whmcsUrl || "https://billings.digitaltechsouls.com/clientarea.php"} className="hover:text-blue-400 transition-colors">Admin / Reseller Portal</a></li>
              <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6">Services</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              {services.map(service => (
                <li key={service.id}>
                  <Link href={`/checkout?item=${service.id}&type=SERVICE`} className="hover:text-blue-400 transition-colors">
                    {service.name}
                  </Link>
                </li>
              ))}
              {services.length === 0 && (
                <>
                  <li><Link href="/services" className="hover:text-blue-400 transition-colors">Web Development</Link></li>
                  <li><Link href="/services" className="hover:text-blue-400 transition-colors">WordPress Hosting</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm text-gray-400 mb-8">
              <li className="flex gap-3"><MapPin className="w-5 h-5 text-blue-500 shrink-0"/> {settings.invoiceCompanyAddress || 'Vehari, Punjab, Pakistan'}</li>
              <li className="flex gap-3"><Phone className="w-5 h-5 text-blue-500 shrink-0"/> {settings.invoiceCompanyPhone || '+92 300 4742747'}</li>
              <li className="flex gap-3"><Mail className="w-5 h-5 text-blue-500 shrink-0"/> {settings.invoiceCompanyEmail || 'support@digitaltechsouls.com'}</li>
            </ul>
            <WhatsAppButton 
              label="Support on WhatsApp" 
              message="Hi, I need support regarding my hosting account."
              className="bg-green-600 hover:bg-green-500 text-white w-full py-2 text-sm"
            />
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Digital Tech Souls. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy-policy" className="hover:text-gray-300">Privacy Policy</Link>
            <Link href="/return-policy" className="hover:text-gray-300">Return Policy</Link>
            <Link href="/disclaimer" className="hover:text-gray-300">Disclaimer</Link>
            <Link href="/terms-of-service" className="hover:text-gray-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
