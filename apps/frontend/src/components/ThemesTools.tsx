"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LayoutTemplate, Box, Download, Eye, Tag } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import Link from "next/link";

export default function ThemesTools() {
  const [items, setItems] = useState<any[]>([]);
  const { selectedCurrency } = useCurrency();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/themes-tools`)
      .then(res => res.json())
      .then(itemsData => {
        if (Array.isArray(itemsData)) setItems(itemsData);
      })
      .catch(console.error);
  }, []);

  const themes = items.filter((item: any) => item.type === 'THEME');
  const tools = items.filter((item: any) => item.type === 'TOOL');

  const renderGrid = (data: any[], type: string) => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {data.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          className="glass rounded-2xl p-8 relative flex flex-col h-full border-white/10 group hover:border-blue-500 hover:shadow-[0_0_30px_rgba(0,102,255,0.15)] transition-all"
        >
          <div className="flex items-center gap-4 mb-6">
            {item.logoUrl ? (
              <img src={item.logoUrl} alt={item.name} className="w-12 h-12 object-contain bg-white rounded-xl p-1 shadow-sm" />
            ) : (
              <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                {type === 'THEME' ? <LayoutTemplate className="w-8 h-8 text-blue-400" /> : <Box className="w-8 h-8 text-blue-400" />}
              </div>
            )}
            <div>
              <Link href={`/themes-tools/${item.id}`}>
                <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{item.name}</h3>
              </Link>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-extrabold text-white">{item.price ? `${selectedCurrency?.symbol} ${Math.round(item.price * (selectedCurrency?.rate || 1)).toLocaleString()}` : 'Free'}</span>
              </div>
            </div>
          </div>

          {item.imageUrl && (
            <Link href={`/themes-tools/${item.id}`} className="w-full h-40 bg-gray-900 rounded-xl mb-6 overflow-hidden border border-white/10 block cursor-pointer">
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </Link>
          )}

          {item.description && (
            <p className="text-gray-400 text-sm mb-6 flex-1 line-clamp-3">{item.description}</p>
          )}

            <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1 mb-4 w-fit">
              <Tag className="w-3 h-3 text-gray-400" />
              <span className="text-gray-300 text-xs font-medium">{type === 'THEME' ? 'WordPress Theme' : 'WordPress Tool'}</span>
            </div>
            
            {item.features && (
              <ul className="space-y-3 mb-6 flex-1">
                {item.features.split(/[\n,]+/).filter(Boolean).map((f: string, idx: number) => (
                  <li key={idx} className="flex items-start text-sm text-gray-300">
                    <div className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_#0066FF]"></div>
                    {f.trim()}
                  </li>
                ))}
              </ul>
            )}

          <div className="flex gap-3 mt-auto pt-4 border-t border-white/10">
            {item.livePreviewUrl && (
              <a 
                href={item.livePreviewUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-colors"
              >
                <Eye className="w-4 h-4" /> Preview
              </a>
            )}
            <button 
              onClick={(e) => {
                if (item.price && item.price > 0) {
                  alert("This item requires payment and admin approval. Please proceed to checkout.");
                  // TODO: Redirect to cart / checkout
                  window.location.href = `/checkout?item=${item.id}&type=${item.type}`;
                } else if (!item.downloadUrl) {
                  alert('Download not available yet.');
                } else {
                  window.open(item.downloadUrl, '_blank');
                }
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold shadow-lg transition-colors"
            >
              {item.price && item.price > 0 ? 'Purchase' : 'Download Free'} <Download className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <section id="themes-tools" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Premium <span className="text-gradient">Themes & Tools</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Elevate your website with our curated selection of premium WordPress themes, plugins, and web development tools.
            </p>
          </motion.div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 border border-white/5 rounded-2xl glass">
            <LayoutTemplate className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Check back later!</h3>
            <p className="text-gray-400">We are currently updating our themes and tools catalog.</p>
          </div>
        ) : (
          <div className="space-y-20">
            {themes.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4 inline-flex items-center gap-3 w-full">
                  <div className="bg-purple-500/10 p-2 rounded-lg border border-purple-500/20"><LayoutTemplate className="w-5 h-5 text-purple-400" /></div> 
                  WordPress Themes
                </h3>
                {renderGrid(themes, 'THEME')}
              </div>
            )}
            
            {tools.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4 inline-flex items-center gap-3 w-full">
                  <div className="bg-green-500/10 p-2 rounded-lg border border-green-500/20"><Box className="w-5 h-5 text-green-400" /></div> 
                  WordPress Tools & Plugins
                </h3>
                {renderGrid(tools, 'TOOL')}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
