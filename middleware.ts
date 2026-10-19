import { NextResponse, type NextRequest } from 'next/server';

import { LOCALE_COOKIE, isLocale, localeFromAcceptLanguage } from '@/lib/i18n/config';

/**
 * Pages live under app/[lang]/ but URLs stay the same (/explore, /pratique…):
 * each request is rewritten to /fr/... or /en/... from the saved choice, or from
 * the browser language on a first visit.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const [, first] = pathname.split('/');

  // An explicit /en/... or /fr/... link switches the language and drops the prefix.
  if (isLocale(first)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(first.length + 1) || '/';
    const res = NextResponse.redirect(url);
    res.cookies.set(LOCALE_COOKIE, first, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
    return res;
  }

  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(saved) ? saved : localeFromAcceptLanguage(request.headers.get('accept-language'));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  const res = NextResponse.rewrite(url);
  if (saved !== locale) {
    res.cookies.set(LOCALE_COOKIE, locale, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
  }
  return res;
}

export const config = {
  // Pages only: skip the API, Next internals, the service worker, the manifest and static files.
  matcher: ['/((?!api|_next|icons|sw\\.js|manifest\\.webmanifest|favicon\\.ico|.*\\..*).*)'],
};
