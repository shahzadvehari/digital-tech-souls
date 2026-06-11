const services = [
  { name: 'Web Development', description: 'Custom coded responsive websites tailored to your exact business needs.', icon: '', features: 'React & Next.js Experts, E-commerce Solutions, API Integrations' },
  { name: 'WordPress Hosting', description: 'Optimized WordPress environments with automatic updates and malware protection.', icon: '', features: '1-Click Install, Auto-Updates, WAF Protection' },
  { name: 'Digital Marketing', description: 'SEO, PPC, and social media strategies to drive traffic and increase conversions.', icon: '', features: 'SEO Optimization, Google Ads Management, Social Media Strategy' },
  { name: 'Graphic Design', description: 'Professional logo design, branding materials, and digital assets for your business.', icon: '', features: 'Brand Identity, Social Media Kits, UI/UX Design' }
];

async function seed() {
  for (const srv of services) {
    const res = await fetch('http://localhost:3001/services', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-role': 'ADMIN_USER'
      },
      body: JSON.stringify(srv)
    });
    if (res.ok) {
      console.log('Seeded:', srv.name);
    } else {
      console.log('Failed:', srv.name);
    }
  }
}

seed();
