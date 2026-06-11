"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, Code } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { config } from "@/lib/config";

interface ServicesProps {
  initialServices?: any[];
}

export default function ServicesSection({ initialServices }: ServicesProps) {
  const [dbServices, setDbServices] = useState<any[]>(initialServices || []);
  const [loading, setLoading] = useState(!initialServices);

  useEffect(() => {
    if (initialServices && initialServices.length > 0) return;

    fetch(`${config.apiUrl}/services`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbServices(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [initialServices]);

  const mappedServices = dbServices.map(db => ({
    id: "db-" + db.id,
    name: db.name,
    icon: db.icon ? <img src={db.icon} alt={db.name} className="w-10 h-10 object-contain" /> : <Globe className="w-8 h-8 text-blue-400"/>,
    desc: db.description,
    features: db.features ? db.features.split(',').map((f: string) => f.trim()) : []
  }));

  return (
    <section id="services" className="py-16 md:py-24 relative overflow-hidden bg-[#0A0F1E]">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Our Digital <span className="text-gradient">Expertise</span></h2>
          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto">Comprehensive solutions to build, grow, and scale your digital presence.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mappedServices.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass p-8 rounded-2xl hover:bg-white/[0.05] transition-colors group cursor-pointer border border-white/5 hover:border-white/20 flex flex-col h-full relative overflow-hidden"
            >
              {/* Highlight gradient on hover */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500"></div>
              
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="bg-white/5 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{service.name}</h3>
                <p className="text-gray-400 mb-6 text-sm leading-relaxed">{service.desc}</p>
                
                {/* Detailed Features List */}
                {service.features && service.features.length > 0 && (
                  <ul className="space-y-3 mb-8 flex-1">
                    {service.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start text-sm text-gray-300">
                        <div className="mr-3 mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_#0066FF]"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
                
                <Link 
                  href={`/checkout?item=${dbServices[i]?.id}&type=SERVICE`}
                  className="flex items-center justify-center bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-300 hover:text-white w-full py-3 rounded-lg text-sm mt-auto shadow-[0_0_15px_rgba(0,102,255,0.1)] hover:shadow-[0_0_20px_rgba(0,102,255,0.3)] transition-all font-bold"
                >
                  Order Service
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
