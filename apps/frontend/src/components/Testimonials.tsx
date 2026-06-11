"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";



interface TestimonialsProps {
  initialTestimonials?: any[];
}

export default function Testimonials({ initialTestimonials }: TestimonialsProps) {
  const [dbTestimonials, setDbTestimonials] = useState<any[]>(initialTestimonials || []);
  const [loading, setLoading] = useState(!initialTestimonials);

  useEffect(() => {
    if (initialTestimonials && initialTestimonials.length > 0) return;
    
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/testimonials`)
      .then(res => res.json())
      .then(data => {
        setDbTestimonials(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [initialTestimonials]);

  const testimonials = [...dbTestimonials];

  if (testimonials.length === 0) return null;

  // Duplicate items for seamless infinite scroll
  const scrollItems = [...testimonials, ...testimonials, ...testimonials];

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333333%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-6 relative z-10 mb-12 md:mb-16">
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Loved by <span className="text-gradient">Businesses</span></h2>
          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto">Don't just take our word for it. See what our clients have to say.</p>
        </div>
      </div>

      <div className="relative w-full overflow-hidden flex items-center group">
        {/* Left/Right Fade Gradients */}
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-gray-950 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-gray-950 to-transparent z-10 pointer-events-none"></div>

        <div className="animate-marquee gap-6 px-6">
          {scrollItems.map((t, i) => (
            <div
              key={`${t.id}-${i}`}
              className="glass p-8 rounded-2xl flex flex-col justify-between w-[350px] shrink-0"
            >
              <div>
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating || 5)].map((_, index) => (
                    <Star key={index} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 italic mb-6">"{t.review}"</p>
              </div>
              <div className="flex items-center gap-4 border-t border-white/10 pt-4">
                {t.photo ? (
                  <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-400 font-bold shrink-0">
                    {t.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-white font-semibold text-sm truncate">{t.name}</div>
                  <div className="text-gray-400 text-xs truncate">{t.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
