"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import AdPlacement from '@/components/AdPlacement';

export default function PublicBlogPage() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/blog`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPosts(data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <>
            <div className="min-h-screen bg-[#050B14] pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Our <span className="text-gradient">Blog</span></h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Stay updated with the latest news, tutorials, and insights from the Digital Tech Souls team.
          </p>
        </div>

        <div className="mb-12">
          <AdPlacement placementKey="ad_blog_code" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden hover:border-blue-500/50 transition-colors group"
            >
              <div className="h-48 relative overflow-hidden bg-gray-950">
                <Image 
                  src={post.image} 
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-60 group-hover:opacity-100"
                />
                <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {post.category}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
                </div>
                
                <h2 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h2>
                
                <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                  {post.content}
                </p>
                
                <Link href={`/blog/${post.id}`} className="text-blue-400 hover:text-blue-300 font-medium text-sm flex items-center gap-2">
                  Read More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
    </>
  );
}
