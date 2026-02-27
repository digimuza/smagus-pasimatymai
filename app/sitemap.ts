import type { MetadataRoute } from 'next';

const BASE_URL = 'https://santykiuklausimai.lt';

const routes = ['', '/audience', '/game', '/categories', '/settings', '/awesome'];

export default function sitemap(): MetadataRoute.Sitemap {
  const ltRoutes = routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' as const : 'monthly' as const,
    priority: route === '' ? 1.0 : 0.7,
  }));

  const enRoutes = routes.map((route) => ({
    url: `${BASE_URL}/en${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' as const : 'monthly' as const,
    priority: route === '' ? 0.9 : 0.6,
  }));

  return [...ltRoutes, ...enRoutes];
}
