"use client";

import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import { Users, Layout, Globe2, Award, Zap, ShieldCheck } from "lucide-react";
import { useEffect, useRef } from "react";

const counters = [
  { id: 1, label: "Active Clients", value: 5000, suffix: "+", icon: <Users className="w-6 h-6 text-blue-400" /> },
  { id: 2, label: "Websites Hosted", value: 12000, suffix: "+", icon: <Layout className="w-6 h-6 text-purple-400" /> },
  { id: 3, label: "Domains Managed", value: 20000, suffix: "+", icon: <Globe2 className="w-6 h-6 text-green-400" /> },
  { id: 4, label: "Years Experience", value: 10, suffix: "+", icon: <Award className="w-6 h-6 text-yellow-400" /> },
];

function AnimatedCounter({ value, suffix }: { value: number, suffix: string }) {
  const ref = useRef(null);
  const count = useMotionValue(0);
  const formatted = useTransform(count, (latest) => Math.round(latest).toLocaleString() + suffix);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      const controls = animate(count, value, { duration: 2, ease: "easeOut" });
      return controls.stop;
    }
  }, [inView, count, value]);

  return <motion.span ref={ref}>{formatted}</motion.span>;
}

const features = [
  { title: "Fast SSD Servers", desc: "Latest generation NVMe drives for ultimate I/O performance.", icon: <Zap className="w-6 h-6 text-blue-400"/> },
  { title: "Enterprise Security", desc: "DDoS protection, WAF, and malware scanning included.", icon: <ShieldCheck className="w-6 h-6 text-red-400"/> },
  // ... more features can be added here
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 relative overflow-hidden bg-black/20 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Animated Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {counters.map((counter, i) => (
            <motion.div 
              key={counter.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass p-6 rounded-2xl flex flex-col items-center justify-center text-center"
            >
              <div className="mb-3 p-3 bg-white/5 rounded-full">{counter.icon}</div>
              <div className="text-3xl font-bold text-white mb-1">
                <AnimatedCounter value={counter.value} suffix={counter.suffix} />
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-widest">{counter.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
             initial={{ opacity: 0, x: -30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Built for <span className="text-gradient">Performance</span> and Security</h2>
            <p className="text-gray-400 mb-8 text-lg leading-relaxed">
              We don't just host websites; we provide a robust digital infrastructure designed to scale with your business while keeping your data safe.
            </p>
            <ul className="space-y-6">
              {features.map((feature, i) => (
                <li key={i} className="flex gap-4">
                  <div className="mt-1">{feature.icon}</div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">{feature.title}</h4>
                    <p className="text-gray-400 text-sm">{feature.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
             initial={{ opacity: 0, x: 30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="relative h-[400px] glass-card rounded-2xl overflow-hidden border border-white/10"
          >
            {/* Placeholder for futuristic server illustration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex flex-col items-center justify-center">
                <ShieldCheck className="w-24 h-24 text-white/50 mb-4" />
                <p className="text-white/60 font-mono">Secure Infrastructure</p>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
