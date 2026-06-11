"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Package, Globe, FileText, Server, Loader2, ArrowRight, Search } from 'lucide-react';
import Footer from '@/components/Footer';

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/search?q=${encodeURIComponent(q)}`)
      .then(res => res.json())
      .then(data => setResults(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
            
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Search Results</h1>
          <p className="text-gray-400 text-lg">
            {q ? `Showing results for "${q}"` : 'Please enter a search query.'}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
        ) : !results ? (
          <div className="text-center text-gray-500 p-12">No search query provided.</div>
        ) : (
          <div className="space-y-16">
            
            {/* Themes & Tools Results */}
            {results.themes?.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                  <Package className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-bold">Themes & Tools ({results.themes.length})</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.themes.map((theme: any) => (
                    <Link href={`/themes-tools`} key={theme.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 transition-all group block">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors">{theme.name}</h3>
                        <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">{theme.category}</span>
                      </div>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{theme.description}</p>
                      <div className="font-bold text-white">${theme.price}</div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Services Results */}
            {results.services?.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                  <Globe className="w-6 h-6 text-purple-500" />
                  <h2 className="text-2xl font-bold">Services ({results.services.length})</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.services.map((service: any) => (
                    <Link href={`/#services`} key={service.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition-all group block">
                      <h3 className="text-lg font-bold group-hover:text-purple-400 transition-colors mb-2">{service.name}</h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{service.description}</p>
                      <div className="font-bold text-white">From ${service.startingPrice}</div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Hosting Plans Results */}
            {results.plans?.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                  <Server className="w-6 h-6 text-green-500" />
                  <h2 className="text-2xl font-bold">Hosting Plans ({results.plans.length})</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.plans.map((plan: any) => (
                    <a href={`/#hosting`} key={plan.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-green-500/50 transition-all group block">
                      <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors mb-2">{plan.name}</h3>
                      <div className="font-bold text-white mb-2">${plan.price}/{plan.billing === 'yearly' ? 'yr' : 'mo'}</div>
                      <p className="text-gray-400 text-sm">Perfect for your hosting needs.</p>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Blog Results */}
            {results.blogs?.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                  <FileText className="w-6 h-6 text-yellow-500" />
                  <h2 className="text-2xl font-bold">Blog Articles ({results.blogs.length})</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.blogs.map((blog: any) => (
                    <Link href={`/blog/${blog.id}`} key={blog.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-yellow-500/50 transition-all group block">
                      <span className="text-xs font-bold text-yellow-500 mb-2 block">{blog.category}</span>
                      <h3 className="text-xl font-bold group-hover:text-yellow-400 transition-colors mb-2">{blog.title}</h3>
                      <div className="text-gray-400 text-sm flex items-center gap-2">
                        <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{blog.author}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {results.themes?.length === 0 && results.services?.length === 0 && results.plans?.length === 0 && results.blogs?.length === 0 && (
              <div className="text-center p-12 bg-gray-900/50 border border-gray-800 rounded-2xl">
                <Search className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-300 mb-2">No results found</h3>
                <p className="text-gray-500 mb-6">We couldn't find anything matching "{q}". Try different keywords.</p>
                <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                  Return Home <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
            
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
      <SearchContent />
    </React.Suspense>
  );
}
