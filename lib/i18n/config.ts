export const LOCALES = ['fr', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/** French first: the site's main audience. */
export const DEFAULT_LOCALE: Locale = 'fr';

/** Cookie that remembers the visitor's choice (read by middleware.ts). */
export const LOCALE_COOKIE = 'tg-lang';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Picks a locale from an Accept-Language header: English only if the browser prefers it. */
export function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;
  const first = header.split(',')[0]?.trim().toLowerCase() ?? '';
  return first.startsWith('en') ? 'en' : DEFAULT_LOCALE;
}
