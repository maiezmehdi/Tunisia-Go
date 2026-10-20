import { NextResponse, type NextRequest } from 'next/server';

import { LOCALE_COOKIE, isLocale, localeFromAcceptLanguage } from '@/lib/i18n/config';

/**
 * Pages live under app/[lang]/. French is served without a prefix (/explore), English also has
 * its own address (/en/explore) so search engines can index both.
 * - /en/...: English, and the choice is remembered for the unprefixed links inside the site.
 * - /fr/...: redirects to the unprefixed address and remembers French.
 * - anything else: rewritten from the saved choice, or the browser language on a first visit.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const [, first] = pathname.split('/');

  if (first === 'en') {
    const res = NextResponse.next();
    if (request.cookies.get(LOCALE_COOKIE)?.value !== 'en') {
      res.cookies.set(LOCALE_COOKIE, 'en', { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
    }
    return res;
  }

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
