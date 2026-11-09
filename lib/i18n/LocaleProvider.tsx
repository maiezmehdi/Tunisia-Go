'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { getCatalog, type Catalog } from '@/lib/i18n/catalog';
import { LOCALE_COOKIE, type Locale } from '@/lib/i18n/config';
import { UI, type UiStrings } from '@/lib/i18n/ui';
import { localePath } from '@/lib/seo';

interface LocaleValue {
  locale: Locale;
  t: UiStrings;
  catalog: Catalog;
}

const LocaleContext = createContext<LocaleValue | null>(null);

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo(() => ({ locale, t: UI[locale], catalog: getCatalog(locale) }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleValue {
  const value = useContext(LocaleContext);
  if (!value) throw new Error('useLocale must be used inside <LocaleProvider>');
  return value;
}

/**
 * Turns a site path into the address in the page's language (/lieux → /en/lieux in English), so
 * the English pages link to each other and search engines can find them.
 */
export function useLocalePath(): (path: string) => string {
  const { locale } = useLocale();
  return (path: string) => localePath(path, locale);
}

/** Saves the choice and opens the same page in that language (/en/... for English). */
export function switchLocale(next: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  const { pathname, search, hash } = window.location;
  const bare = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  const target = next === 'en' ? `/en${bare === '/' ? '' : bare}` : bare;
  if (target === pathname) window.location.reload();
  else window.location.assign(target + search + hash);
}
