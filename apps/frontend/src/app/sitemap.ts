import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.digitaltechsouls.com'; // Change this to your production domain

  // 1. Static Routes
  const staticRoutes = [
    '',
    '/login',
    '/register',
    '/themes-tools',
    '/licenses',
    '/blog',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    // 2. Fetch Blog Posts
    const blogRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/blog`, { next: { revalidate: 3600 } });
    const blogs = await blogRes.json();
    const blogRoutes = Array.isArray(blogs) ? blogs.map((post: any) => ({
      url: `${baseUrl}/blog/${post.id}`,
      lastModified: new Date(post.updatedAt || post.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })) : [];

    // 3. Fetch Themes & Tools
    const themesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/themes-tools`, { next: { revalidate: 3600 } });
    const themes = await themesRes.json();
    const themeRoutes = Array.isArray(themes) ? themes.map((theme: any) => ({
      url: `${baseUrl}/checkout?item=${theme.id}&type=${theme.productType}`,
      lastModified: new Date(theme.updatedAt || theme.createdAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })) : [];

    return [...staticRoutes, ...blogRoutes, ...themeRoutes];
  } catch (error) {
    console.error('Sitemap generation failed to fetch dynamic routes', error);
    return staticRoutes;
  }
}
