import HomeClient from './HomeClient';
import { config } from '@/lib/config';

// Revalidate this page every 60 seconds
export const revalidate = 60;

export default async function Page() {
  let initialSettings = {};
  let initialPlans = [];
  let initialServices = [];
  let initialTestimonials = [];

  try {
    const [settingsRes, plansRes, servicesRes, testimonialsRes] = await Promise.all([
      fetch(`${config.apiUrl}/settings`, { next: { revalidate: 60 } }),
      fetch(`${config.apiUrl}/plans`, { next: { revalidate: 60 } }),
      fetch(`${config.apiUrl}/services`, { next: { revalidate: 60 } }),
      fetch(`${config.apiUrl}/testimonials`, { next: { revalidate: 60 } }),
    ]);

    if (settingsRes.ok) {
      const settingsData = await settingsRes.json();
      initialSettings = settingsData.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
    }
    
    if (plansRes.ok) {
      initialPlans = await plansRes.json();
    }
    
    if (servicesRes.ok) {
      initialServices = await servicesRes.json();
    }
    
    if (testimonialsRes.ok) {
      initialTestimonials = await testimonialsRes.json();
    }
  } catch (error) {
    console.error('Failed to fetch initial data for home page:', error);
  }

  return (
    <HomeClient 
      initialSettings={initialSettings}
      initialPlans={initialPlans}
      initialServices={initialServices}
      initialTestimonials={initialTestimonials}
    />
  );
}
