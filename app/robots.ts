import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  // Preview deployments (tunisiago-git-….vercel.app) stay out of search results.
  const production = !process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production';
  return {
    rules: production
      ? [{ userAgent: '*', allow: '/', disallow: ['/admin', '/en/admin', '/api/'] }]
      : [{ userAgent: '*', disallow: '/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
