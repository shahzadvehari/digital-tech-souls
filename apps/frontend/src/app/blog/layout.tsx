import { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Blog | Digital Tech Souls',
  description: 'Stay updated with the latest news, tutorials, and insights from the Digital Tech Souls team on Web Hosting, Digital Marketing, and WordPress.',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Digital Tech Souls Blog",
    "description": metadata.description,
  };

  return (
    <>
      <JsonLd data={collectionSchema} />
      {children}
    </>
  );
}
