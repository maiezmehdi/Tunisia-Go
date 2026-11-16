import type { MetadataRoute } from 'next';

import {
  allPlacesUpdated,
  allTripsUpdated,
  placeUpdated,
  placesUpdated,
  tripUpdated,
} from '@/data/contentDates';
import { ITINERARIES, PLACES } from '@/data/tunisiaData';
import { placePath } from '@/lib/placePages';
import { PAGE_REGIONS, regionPath } from '@/lib/regionPages';
import { SITE_URL, localePath } from '@/lib/seo';

type Entry = {
  path: string;
  priority: number;
  changeFrequency: 'weekly' | 'monthly' | 'yearly';
  /** YYYY-MM-DD, or null for pages filled from the database (events, guides). */
  updated: string | null;
};

const latest = (...dates: string[]) => dates.reduce((a, b) => (b > a ? b : a));

// Public pages, each in French (/path) and English (/en/path). The dates are the last change of
// the page's text (its file in the repository, or the newest place or road trip it lists).
const PAGES: Entry[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly', updated: '2026-11-06' },
  { path: '/explore', priority: 0.9, changeFrequency: 'weekly', updated: latest('2026-10-24', allPlacesUpdated()) },
  { path: '/lieux', priority: 0.8, changeFrequency: 'monthly', updated: latest('2026-11-04', allPlacesUpdated()) },
  { path: '/road-trips', priority: 0.8, changeFrequency: 'monthly', updated: latest('2026-11-04', allTripsUpdated()) },
  { path: '/evenements', priority: 0.7, changeFrequency: 'weekly', updated: null },
  { path: '/guides', priority: 0.5, changeFrequency: 'weekly', updated: null },
  { path: '/pratique', priority: 0.7, changeFrequency: 'monthly', updated: '2026-11-05' },
  { path: '/spot-secret', priority: 0.4, changeFrequency: 'yearly', updated: '2026-10-25' },
  // Legal pages: indexable, but low priority.
  { path: '/confidentialite', priority: 0.1, changeFrequency: 'yearly', updated: '2026-11-06' },
  { path: '/mentions-legales', priority: 0.1, changeFrequency: 'yearly', updated: '2026-11-06' },
];

/** Never in the sitemap: admin, edit pages and addresses with parameters. */
const EXCLUDED = /(^|\/)(admin|modifier|edit|compte|mon-voyage)(\/|$)|[?#]/;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: Entry[] = [
    ...PAGES,
    ...PLACES.map((place) => ({
      path: placePath(place.id),
      priority: 0.6,
      changeFrequency: 'monthly' as const,
      updated: placeUpdated(place.id),
    })),
    ...PAGE_REGIONS.map((r) => ({
      path: regionPath(r.region),
      priority: 0.7,
      changeFrequency: 'monthly' as const,
      updated: placesUpdated(r.placeIds),
    })),
    ...ITINERARIES.map((trip) => ({
      path: `/road-trips/${trip.id}`,
      priority: 0.7,
      changeFrequency: 'monthly' as const,
      updated: tripUpdated(trip.id),
    })),
  ];
  const seen = new Set<string>();
  return entries
    .filter(({ path }) => !EXCLUDED.test(path) && !seen.has(path) && !!seen.add(path))
    .flatMap(({ path, priority, changeFrequency, updated }) => {
      const fr = `${SITE_URL}${localePath(path, 'fr')}`;
      const en = `${SITE_URL}${localePath(path, 'en')}`;
      return (['fr', 'en'] as const).map((lang) => ({
        url: lang === 'fr' ? fr : en,
        lastModified: updated ? new Date(`${updated}T12:00:00Z`) : now,
        changeFrequency,
        priority: lang === 'fr' ? priority : Math.round(priority * 90) / 100,
        // Same alternates as the <link rel="alternate" hreflang> tags in each page's <head>.
        alternates: { languages: { fr, en, 'x-default': fr } },
      }));
    });
}
