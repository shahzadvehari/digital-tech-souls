import { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Premium Themes & Tools | Digital Tech Souls',
  description: 'Download premium WordPress themes, web development tools, and plugins to elevate your online business. High quality, tested, and ready to use.',
};

export default function ThemesToolsLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": metadata.title,
    "description": metadata.description,
  };

  return (
    <>
      <JsonLd data={schema} />
      {children}
    </>
  );
}
