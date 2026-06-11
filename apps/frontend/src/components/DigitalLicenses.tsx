"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, ShieldCheck, ShoppingCart } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import Link from "next/link";

export default function DigitalLicenses() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const { selectedCurrency } = useCurrency();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/products`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLicenses(data);
        }
      })
      .catch(console.error);
  }, []);


  return (
    <section id="licenses" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Premium <span className="text-gradient">Digital Licenses</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Get genuine licenses for WHMCS, cPanel, and other essential tools to power your digital infrastructure at unbeatable prices.
            </p>
          </motion.div>
        </div>

        {licenses.length === 0 ? (
          <div className="text-center py-12 border border-white/5 rounded-2xl glass">
            <ShieldCheck className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Check back later!</h3>
            <p className="text-gray-400">We are currently updating our digital products catalog.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {licenses.map((license, i) => (
              <motion.div
                key={license.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`glass rounded-2xl p-8 relative flex flex-col h-full ${
                  license.isFeatured ? 'border-blue-500 shadow-[0_0_30px_rgba(0,102,255,0.15)] transform md:-translate-y-4' : 'border-white/10'
                }`}
              >
                {license.isFeatured && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="flex items-center gap-4 mb-6">
                  {license.imageUrl ? (
                    <img src={license.imageUrl} alt={license.name} className="w-12 h-12 object-contain" />
                  ) : (
                    <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                      <ShieldCheck className="w-8 h-8 text-blue-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-white">{license.name}</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-extrabold text-white">{selectedCurrency?.symbol}{Math.round(license.price * (selectedCurrency?.rate || 1)).toLocaleString()}</span>
                      <span className="text-gray-400 text-sm font-medium">/{license.billing}</span>
                    </div>
                  </div>
                </div>

                {license.description && (
                  <p className="text-gray-400 text-sm mb-6">{license.description}</p>
                )}

                {license.features && (
                  <ul className="space-y-3 mb-8 flex-1">
                    {license.features.split(',').filter(Boolean).map((f: string, idx: number) => (
                      <li key={idx} className="flex items-start text-sm text-gray-300">
                        <div className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_#0066FF]"></div>
                        {f.trim()}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-8">
                  <Link 
                    href={`/checkout?item=${license.id}&type=LICENSE`}
                    className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold transition-all ${
                      license.isFeatured 
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg' 
                        : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Purchase License
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
