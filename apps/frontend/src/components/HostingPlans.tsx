"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import WhatsAppButton from "./WhatsAppButton";
import DomainSearch from "./DomainSearch";
import { Check, Loader2 } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

import { config } from "@/lib/config";

interface HostingPlansProps {
  initialPlans?: any[];
}

export default function HostingPlans({ initialPlans }: HostingPlansProps) {
  const [dbPlans, setDbPlans] = useState<any[]>(initialPlans || []);
  const [loading, setLoading] = useState(!initialPlans);
  const [subscribing, setSubscribing] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState('yearly');
  const { selectedCurrency } = useCurrency();
  const router = useRouter();

  useEffect(() => {
    if (initialPlans && initialPlans.length > 0) return;
    
    fetch(`${config.apiUrl}/plans`)
      .then(res => res.json())
      .then(plansData => {
        setDbPlans(plansData);
        setLoading(false);
      })
      .catch(() => {
        // Silently ignore if backend is unavailable
        setLoading(false);
      });
  }, [initialPlans]);



  return (
    <section id="hosting" className="py-16 md:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Domain Search Bar placed at the top of the section */}
        <DomainSearch />

        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Choose Your <span className="text-gradient">Perfect Plan</span></h2>
          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mb-8">Scalable, secure, and blazing fast web hosting for any sized project.</p>
          
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
            <button 
              onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-16 h-8 rounded-full bg-blue-600/20 border border-blue-500/50 p-1 transition-colors"
            >
              <div className={`w-6 h-6 rounded-full bg-blue-500 transition-transform ${billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-0'}`}></div>
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
              Yearly <span className="text-green-400 text-xs ml-1 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">Save up to 20%</span>
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : dbPlans.length === 0 ? (
          <div className="text-center p-12 bg-gray-900/50 rounded-xl border border-white/10">
            <p className="text-gray-400">No hosting plans available right now.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-center justify-center">
            {dbPlans.map((plan, index) => {
              // Calculate dynamic price based on toggle
              let displayPrice = plan.price;
              if (billingCycle === 'monthly' && plan.billing === 'yearly') {
                displayPrice = plan.price / 12;
              } else if (billingCycle === 'yearly' && plan.billing === 'monthly') {
                displayPrice = plan.price * 10; // e.g. 2 months free
              }

              const finalPrice = Math.round(displayPrice * (selectedCurrency?.rate || 1)).toLocaleString();

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className={`glass-card rounded-2xl p-8 relative transition-transform hover:-translate-y-2 ${plan.isFeatured ? 'border-blue-500/50 shadow-[0_0_30px_rgba(0,102,255,0.2)] md:-translate-y-4' : 'border-white/10'}`}
                >
                  {/* Green Shining Dot (Online Indicator) */}
                  <div className="absolute top-6 right-6 flex items-center justify-center" title="Servers Online">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
                    </span>
                  </div>

                  {plan.isFeatured && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-semibold text-white mb-2 pr-6">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-4xl font-bold text-white">{selectedCurrency?.symbol} {finalPrice}</span>
                    <span className="text-gray-400">/{billingCycle === 'yearly' ? 'yr' : 'mo'}</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8 flex-1">
                    <li className="flex items-start text-sm text-gray-300"><div className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_#0066FF]"></div> Host Single Website</li>
                    <li className="flex items-start text-sm text-gray-300"><div className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_#0066FF]"></div> {plan.storage} Storage</li>
                    <li className="flex items-start text-sm text-gray-300"><div className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_#0066FF]"></div> {plan.bandwidth} Bandwidth</li>
                    <li className="flex items-start text-sm text-gray-300"><div className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_#0066FF]"></div> {plan.emails} Email Accounts</li>
                    <li className="flex items-start text-sm text-gray-300"><div className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_#0066FF]"></div> Wordpress Manager</li>
                    {plan.freeSsl && <li className="flex items-start text-sm text-gray-300"><div className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_#0066FF]"></div> Free SSL Certificate</li>}
                    <li className="flex items-start text-sm text-gray-300"><div className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_#0066FF]"></div> {plan.databases} MySQL Databases</li>
                    <li className="flex items-start text-sm text-gray-300"><div className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_#0066FF]"></div> Subdomain</li>
                    <li className="flex items-start text-sm text-gray-300"><div className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_#0066FF]"></div> Imunify360 + Litespeed</li>
                    <li className="flex items-start text-sm text-gray-300"><div className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_#0066FF]"></div> {plan.backup} Backups</li>
                    <li className="flex items-start text-sm text-gray-300"><div className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_#0066FF]"></div> 99.9% Uptime guarantee</li>
                    <li className="flex items-start text-sm text-gray-300"><div className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_#0066FF]"></div> 24/7 support</li>
                  </ul>

                  {plan.orderUrl ? (
                    <a 
                      href={plan.orderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${plan.isFeatured ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                    >
                      Order Now
                    </a>
                  ) : (
                    <WhatsAppButton 
                      label="Order Now"
                      message={`Hello, I want to order the ${plan.name} hosting plan for ${selectedCurrency?.symbol} ${finalPrice}/${billingCycle === 'yearly' ? 'yr' : 'mo'}.`}
                      className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${plan.isFeatured ? '!bg-blue-600 hover:!bg-blue-500 !text-white' : '!bg-white/10 hover:!bg-white/20 !text-white'}`}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
