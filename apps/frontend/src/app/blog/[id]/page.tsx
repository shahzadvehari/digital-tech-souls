import { Metadata } from 'next';
import Image from 'next/image';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AdPlacement from '@/components/AdPlacement';

// Configure dynamic revalidation
export const revalidate = 3600; // Revalidate every hour

async function getPost(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/blog/${id}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const post = await getPost(params.id);
  
  if (!post) {
    return { title: 'Post Not Found | Digital Tech Souls' };
  }

  const plainTextContent = post.content ? post.content.substring(0, 160).replace(/<[^>]*>?/gm, '') : 'Read this amazing post on Digital Tech Souls.';

  return {
    title: `${post.title} | Digital Tech Souls Blog`,
    description: plainTextContent,
    openGraph: {
      title: post.title,
      description: plainTextContent,
      images: post.image ? [post.image] : [],
      type: 'article',
      publishedTime: post.createdAt,
      authors: [post.author || 'Digital Tech Souls']
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: plainTextContent,
      images: post.image ? [post.image] : [],
    }
  };
}

export default async function BlogPostPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);

  if (!post) {
    return (
      <div className="min-h-[70vh] bg-[#050B14] pt-40 flex justify-center text-white">
        <p className="text-xl text-gray-400">Post not found or has been removed.</p>
      </div>
    );
  }

  // Generate JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: post.image ? [post.image] : [],
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    author: [{
      '@type': 'Person',
      name: post.author || 'Digital Tech Souls',
    }]
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const embedUrl = getYouTubeEmbedUrl(post.youtubeUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-[#050B14] pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <Link href="/blog" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>

          <div className="mb-8">
            <div className="inline-block bg-blue-600/20 text-blue-400 text-sm font-bold px-3 py-1 rounded-full mb-4">
              {post.category || 'Uncategorized'}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-6 text-sm text-gray-400 border-b border-gray-800 pb-8">
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(post.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center gap-2"><User className="w-4 h-4" /> {post.author || 'Admin'}</span>
            </div>
          </div>

          {post.image && !post.youtubeUrl && (
            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-8 border border-gray-800">
              <Image 
                src={post.image} 
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {embedUrl && (
            <div className="relative w-full h-0 pb-[56.25%] mb-8 rounded-2xl overflow-hidden border border-gray-800 bg-black">
              <iframe 
                src={embedUrl} 
                className="absolute top-0 left-0 w-full h-full" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            </div>
          )}

          <div className="mb-8">
            <AdPlacement placementKey="ad_blog_code" />
          </div>

          <article className="prose prose-invert prose-lg max-w-none text-gray-300 mb-16 blog-content">
            {(() => {
              // Split the content in half to inject a middle ad dynamically
              const contentStr = post.content || '';
              const midpoint = Math.floor(contentStr.length / 2);
              
              // Find the nearest closing paragraph tag around the midpoint to safely split
              const splitIndex = contentStr.indexOf('</p>', midpoint);
              
              if (splitIndex !== -1 && contentStr.length > 800) {
                const part1 = contentStr.slice(0, splitIndex + 4);
                const part2 = contentStr.slice(splitIndex + 4);
                return (
                  <>
                    <div dangerouslySetInnerHTML={{ __html: part1 }} />
                    <div className="my-10 p-4 bg-gray-900/50 rounded-xl border border-gray-800 flex justify-center">
                      <div className="w-full text-center">
                        <span className="text-[10px] text-gray-600 uppercase tracking-widest block mb-2">Advertisement</span>
                        <AdPlacement placementKey="ad_blog_code" />
                      </div>
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: part2 }} />
                  </>
                );
              }
              
              return <div dangerouslySetInnerHTML={{ __html: contentStr }} />;
            })()}
          </article>
          
          <div className="border-t border-gray-800 pt-12">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6 text-center">Advertisement</h3>
            <AdPlacement placementKey="ad_blog_code" />
          </div>
        </div>
      </div>
    </>
  );
}
