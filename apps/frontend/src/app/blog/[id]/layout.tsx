import { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/blog/${params.id}`);
    if (res.ok) {
      const post = await res.json();
      return {
        title: `${post.title} | Digital Tech Souls Blog`,
        description: post.content.substring(0, 150) + '...',
        openGraph: {
          title: post.title,
          description: post.content.substring(0, 150) + '...',
          images: post.image ? [post.image] : [],
          type: 'article',
        }
      };
    }
  } catch (e) {
    console.error(e);
  }
  
  return {
    title: 'Blog Post | Digital Tech Souls',
  };
}

export default async function BlogPostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  let articleSchema = null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}`}/blog/${resolvedParams.id}`);
    if (res.ok) {
      const post = await res.json();
      articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "image": post.image ? [post.image] : [],
        "datePublished": new Date(post.createdAt).toISOString(),
        "author": [{
            "@type": "Person",
            "name": post.author || "Digital Tech Souls Admin"
        }]
      };
    }
  } catch(e) {}

  return (
    <>
      {articleSchema && <JsonLd data={articleSchema} />}
      {children}
    </>
  );
}
