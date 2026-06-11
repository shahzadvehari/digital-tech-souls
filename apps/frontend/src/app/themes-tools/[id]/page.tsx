import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { LayoutTemplate, Box, Download, Eye, Tag, ArrowLeft, CheckCircle2 } from 'lucide-react';
import AdPlacement from '@/components/AdPlacement';

export const revalidate = 3600;

async function getProduct(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/themes-tools/${id}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProduct(params.id);
  
  if (!product) {
    return { title: 'Product Not Found | Digital Tech Souls' };
  }

  return {
    title: `${product.name} | Premium ${product.type === 'THEME' ? 'Theme' : 'Tool'}`,
    description: product.description || `Get ${product.name} at Digital Tech Souls. High quality digital product.`,
    openGraph: {
      title: product.name,
      description: product.description || '',
      images: product.imageUrl ? [product.imageUrl] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description || '',
      images: product.imageUrl ? [product.imageUrl] : [],
    }
  };
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) {
    return (
      <div className="min-h-[70vh] bg-[#050B14] pt-40 flex justify-center text-white">
        <p className="text-xl text-gray-400">Product not found.</p>
      </div>
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.imageUrl ? [product.imageUrl] : [],
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: 'Digital Tech Souls'
    },
    offers: {
      '@type': 'Offer',
      url: `https://www.digitaltechsouls.com/themes-tools/${product.id}`,
      priceCurrency: 'USD', // Base currency
      price: product.price || 0,
      availability: 'https://schema.org/InStock'
    }
  };

  const isTheme = product.type === 'THEME';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-[#050B14] pt-32 pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <Link href="/themes-tools" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Themes & Tools
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Column: Image & Preview */}
            <div className="space-y-6">
              {product.imageUrl ? (
                <div className="w-full h-[400px] bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 relative">
                  <Image src={product.imageUrl} alt={product.name} fill className="object-cover" priority />
                </div>
              ) : (
                <div className="w-full h-[400px] bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 flex items-center justify-center">
                  {isTheme ? <LayoutTemplate className="w-24 h-24 text-gray-700" /> : <Box className="w-24 h-24 text-gray-700" />}
                </div>
              )}
              
              <div className="flex gap-4">
                {product.livePreviewUrl && (
                  <a 
                    href={product.livePreviewUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-colors"
                  >
                    <Eye className="w-5 h-5" /> Live Preview
                  </a>
                )}
              </div>
            </div>

            {/* Right Column: Details & Actions */}
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full mb-4">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm font-bold">{isTheme ? 'WordPress Theme' : 'WordPress Tool/Plugin'}</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{product.name}</h1>
                <p className="text-gray-400 text-lg leading-relaxed">{product.description}</p>
              </div>

              <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl">
                <div className="mb-6 flex items-baseline gap-2">
                  <span className="text-gray-400">Price:</span>
                  <span className="text-4xl font-extrabold text-white">
                    {product.price > 0 ? `$ ${product.price.toLocaleString()}` : 'Free'}
                  </span>
                </div>

                {product.price > 0 ? (
                  <Link 
                    href={`/checkout?item=${product.id}&type=${product.type}`}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 py-4 rounded-xl text-lg font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-colors"
                  >
                    Purchase Now
                  </Link>
                ) : (
                  <a 
                    href={product.downloadUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 py-4 rounded-xl text-lg font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-colors"
                  >
                    <Download className="w-5 h-5" /> Download Free
                  </a>
                )}
              </div>

              {product.features && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Key Features</h3>
                  <ul className="space-y-4">
                    {product.features.split(/[\n,]+/).filter(Boolean).map((f: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-300">
                        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <span>{f.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-gray-800">
            <AdPlacement placementKey="ad_footer_code" />
          </div>
        </div>
      </div>
    </>
  );
}
