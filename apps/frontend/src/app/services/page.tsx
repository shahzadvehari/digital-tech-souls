import { config } from '@/lib/config';
import ServicesSection from '@/components/ServicesSection';
import JsonLd from '@/components/JsonLd';

export const revalidate = 60;

export default async function ServicesPage() {
  let initialServices = [];

  try {
    const res = await fetch(`${config.apiUrl}/services`, { next: { revalidate: 60 } });
    if (res.ok) {
      initialServices = await res.json();
    }
  } catch (error) {
    console.error('Failed to fetch initial services for services page:', error);
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Digital Tech Souls - Other Services",
    "url": "https://digitaltechsouls.com/services",
    "description": "Comprehensive solutions to build, grow, and scale your digital presence."
  };

  return (
    <main className="flex-1 flex flex-col w-full min-h-screen bg-[#0A0F1E] pt-20">
      <JsonLd data={websiteSchema} />
      <ServicesSection initialServices={initialServices} />
    </main>
  );
}
