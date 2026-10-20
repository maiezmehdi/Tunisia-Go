import type { MetadataRoute } from 'next';

import { SITE_URL, localePath } from '@/lib/seo';

// Public pages, each in French (/path) and English (/en/path).
const PAGES: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' | 'yearly' }[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/explore', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/pratique', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/spot-secret', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/confidentialite', priority: 0.1, changeFrequency: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PAGES.flatMap(({ path, priority, changeFrequency }) =>
    (['fr', 'en'] as const).map((lang) => ({
      url: `${SITE_URL}${localePath(path, lang)}`,
      lastModified: now,
      changeFrequency,
      priority: lang === 'fr' ? priority : Math.round(priority * 90) / 100,
      alternates: {
        languages: { fr: `${SITE_URL}${localePath(path, 'fr')}`, en: `${SITE_URL}${localePath(path, 'en')}` },
      },
    })),
  );
}
