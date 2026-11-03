import type { Metadata } from 'next';

import type { Locale } from '@/lib/i18n/config';

/**
 * Public address of the site, for canonical links, the sitemap and social cards.
 * The live address is www.tunisiagoo.com (the bare domain should redirect to it); NEXT_PUBLIC_SITE_URL can override it (for a test site, for example).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tunisiagoo.com').replace(/\/$/, '');

export const SITE_NAME = 'Tunisia Go';

/**
 * French lives at /path and English at /en/path (middleware.ts serves both), so each language
 * has its own URL that search engines can index.
 */
export function localePath(path: string, lang: Locale): string {
  const p = path === '/' ? '' : path;
  if (lang === 'en') return `/en${p}`;
  return p || '/';
}

export function alternates(path: string, lang: Locale): Metadata['alternates'] {
  return {
    canonical: localePath(path, lang),
    languages: { fr: localePath(path, 'fr'), en: localePath(path, 'en'), 'x-default': localePath(path, 'fr') },
  };
}

/** Title, description, canonical, language alternates and social cards for a page. */
export function pageMetadata({
  lang,
  path,
  title,
  description,
  index = true,
}: {
  lang: Locale;
  path: string;
  title: string;
  description: string;
  index?: boolean;
}): Metadata {
  const image = { url: '/og.png', width: 1200, height: 630, alt: SITE_NAME };
  return {
    title,
    description,
    alternates: alternates(path, lang),
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      url: localePath(path, lang),
      locale: lang === 'en' ? 'en_GB' : 'fr_FR',
      alternateLocale: lang === 'en' ? ['fr_FR'] : ['en_GB'],
      images: [image],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image.url] },
    robots: index ? { index: true, follow: true } : { index: false, follow: false },
  };
}
