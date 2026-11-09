import type { Locale } from '@/lib/i18n/config';

/** Address of a place's own page (French /lieux/id, English /en/lieux/id through localePath). */
export const placePath = (id: string) => `/lieux/${id}`;

/**
 * When the place pages were last edited. Bump it when the texts are reviewed again: it is shown on
 * every page and used as `lastmod` in the sitemap.
 */
export const CONTENT_UPDATED = '2026-10-21';

export function formatUpdated(locale: Locale, date: string = CONTENT_UPDATED): string {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', { month: 'long', year: 'numeric' }).format(
    new Date(`${date}T12:00:00Z`),
  );
}
