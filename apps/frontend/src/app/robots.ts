import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/dashboard', '/checkout', '/api'],
    },
    sitemap: 'https://digitaltechsouls.com/sitemap.xml',
  };
}
