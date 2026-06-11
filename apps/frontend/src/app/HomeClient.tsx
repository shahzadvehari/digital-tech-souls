"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import WhatsAppButton from "@/components/WhatsAppButton";
import { CheckCircle, Server, Cloud, Shield, Zap, User } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import { useEffect, useState } from "react";

const HostingPlans = dynamic(() => import("@/components/HostingPlans"), { ssr: true });
const WhyChooseUs = dynamic(() => import("@/components/WhyChooseUs"), { ssr: true });
const Testimonials = dynamic(() => import("@/components/Testimonials"), { ssr: true });
const ClientLogos = dynamic(() => import("@/components/ClientLogos"), { ssr: true });
const AdPlacement = dynamic(() => import("@/components/AdPlacement"), { ssr: true });

export default function HomeClient({ 
  initialSettings, 
  initialPlans, 
  initialServices, 
  initialTestimonials 
}: { 
  initialSettings: any, 
  initialPlans: any[], 
  initialServices: any[], 
  initialTestimonials: any[] 
}) {
  const [heroSettings, setHeroSettings] = useState({
    title: initialSettings.heroTitle || 'Reliable Web Hosting & Digital Solutions for Growing Businesses',
    subtitle: initialSettings.heroSubtitle || 'Fast, Secure and Affordable Hosting with Professional Web Development, Digital Marketing and Graphic Design Services.',
    image: initialSettings.heroImage || '/images/hero-hosting.png'
  });

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/settings`)
      .then(res => res.json())
      .then(data => {
        const settingsObj = data.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
        setHeroSettings(prev => ({
          title: settingsObj.heroTitle || prev.title,
          subtitle: settingsObj.heroSubtitle || prev.subtitle,
          image: settingsObj.heroImage || prev.image
        }));
      })
      .catch(console.error);
  }, []);

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Digital Tech Souls",
    "url": "https://digitaltechsouls.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://digitaltechsouls.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Digital Tech Souls",
    "url": "https://digitaltechsouls.com",
    "logo": "https://digitaltechsouls.com/images/hero-hosting.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+923000000000",
      "contactType": "customer service"
    }
  };

  return (
    <main className="flex-1 flex flex-col w-full">
      <JsonLd data={websiteSchema} />
      <JsonLd data={orgSchema} />
      {/* Navigation Menu */}
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            
            {/* Left Side: Copy & CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 
                className="font-bold tracking-tight mb-4 md:mb-6 leading-tight whitespace-pre-line"
                style={{ 
                  fontSize: 'var(--hero-title-size, clamp(2.5rem, 5vw, 4.5rem))', 
                  color: 'var(--hero-title-color, #ffffff)' 
                }}
              >
                {heroSettings.title}
              </h1>
              
              <p className="text-base md:text-lg text-gray-400 mb-6 md:mb-8 max-w-xl leading-relaxed whitespace-pre-line">
                {heroSettings.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-8 md:mb-10">
                <a href="https://billings.digitaltechsouls.com/" className="bg-white text-blue-900 px-8 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all text-center">
                  Get Started
                </a>
                <WhatsAppButton 
                  message="Hi, I'm interested in your hosting plans."
                  className="bg-transparent border border-white/20 text-white hover:bg-white/5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 mt-10">
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-400"/> 99.9% Uptime</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-400"/> Free SSL</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-400"/> Daily Backup</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-400"/> 24/7 Support</div>
              </div>
            </motion.div>

            {/* Right Side: Animated Visual */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:flex items-center justify-center"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 blur-[100px] rounded-full -z-10"></div>
              
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="relative w-full aspect-square max-w-[500px]"
              >
                <Image 
                  src={heroSettings.image} 
                  alt="Digital Tech Souls - Premium Web Hosting and Digital Services"
                  fill
                  priority
                  className="object-contain drop-shadow-[0_0_40px_rgba(0,102,255,0.4)]"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <ClientLogos />
      <HostingPlans initialPlans={initialPlans} />
      <WhyChooseUs />
      <AdPlacement placementKey="ad_homepage_code" className="my-12" />
      <Testimonials initialTestimonials={initialTestimonials} />
    </main>
  );
}
