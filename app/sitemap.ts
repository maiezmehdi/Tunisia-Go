import type { MetadataRoute } from 'next';

import { ITINERARIES, PLACES } from '@/data/tunisiaData';
import { CONTENT_UPDATED, placePath } from '@/lib/placePages';
import { PAGE_REGIONS, regionPath } from '@/lib/regionPages';
import { SITE_URL, localePath } from '@/lib/seo';

// Public pages, each in French (/path) and English (/en/path).
const PAGES: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' | 'yearly' }[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/explore', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/lieux', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/road-trips', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/evenements', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/guides', priority: 0.5, changeFrequency: 'weekly' },
  { path: '/pratique', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/spot-secret', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/confidentialite', priority: 0.1, changeFrequency: 'yearly' },
  { path: '/mentions-legales', priority: 0.1, changeFrequency: 'yearly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = [
    ...PAGES.map((p) => ({
      ...p,
      // Events and guides change often; the other pages change when the texts are reviewed.
      lastModified: ['/evenements', '/guides', '/explore'].includes(p.path) ? now : new Date(CONTENT_UPDATED),
    })),
    ...PLACES.map((place) => ({
      path: placePath(place.id),
      priority: 0.6,
      changeFrequency: 'monthly' as const,
      lastModified: new Date(CONTENT_UPDATED),
    })),
    ...PAGE_REGIONS.map((r) => ({
      path: regionPath(r.region),
      priority: 0.7,
      changeFrequency: 'monthly' as const,
      lastModified: new Date(CONTENT_UPDATED),
    })),
    ...ITINERARIES.map((trip) => ({
      path: `/road-trips/${trip.id}`,
      priority: 0.7,
      changeFrequency: 'monthly' as const,
      lastModified: new Date(CONTENT_UPDATED),
    })),
  ];
  return pages.flatMap(({ path, priority, changeFrequency, lastModified }) =>
    (['fr', 'en'] as const).map((lang) => ({
      url: `${SITE_URL}${localePath(path, lang)}`,
      lastModified,
      changeFrequency,
      priority: lang === 'fr' ? priority : Math.round(priority * 90) / 100,
      alternates: {
        languages: { fr: `${SITE_URL}${localePath(path, 'fr')}`, en: `${SITE_URL}${localePath(path, 'en')}` },
      },
    })),
  );
}
