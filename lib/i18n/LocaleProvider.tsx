'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { getCatalog, type Catalog } from '@/lib/i18n/catalog';
import { LOCALE_COOKIE, type Locale } from '@/lib/i18n/config';
import { UI, type UiStrings } from '@/lib/i18n/ui';

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

/** Saves the choice and reloads, so every page (and the service worker cache) follows. */
export function switchLocale(next: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  window.location.reload();
}
