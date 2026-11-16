import { NextResponse, type NextRequest } from 'next/server';

import { LOCALE_COOKIE, isLocale, localeFromAcceptLanguage } from '@/lib/i18n/config';
import { isAdminPath, siteMode } from '@/lib/siteMode';

/**
 * Pages live under app/[lang]/. French is served without a prefix (/explore), English also has
 * its own address (/en/explore) so search engines can index both.
 * - /en/...: English, and the choice is remembered for the unprefixed links inside the site.
 * - /fr/...: redirects to the unprefixed address and remembers French.
 * - anything else: rewritten from the saved choice, or the browser language on a first visit.
 */
/** Search engine and link preview robots (Googlebot, Bingbot, social networks…). */
const CRAWLER = /bot|crawler|spider|slurp|facebookexternalhit/i;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const [, first] = pathname.split('/');

  // Separate admin site (ADMIN_MODE=only) and public site without /admin (ADMIN_MODE=off).
  const mode = siteMode();
  if (mode === 'off' && isAdminPath(pathname)) return new NextResponse('Not found', { status: 404 });
  if (mode === 'only' && !isAdminPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // The API is only matched here for the mode check above: no locale handling.
  if (pathname.startsWith('/api/')) return NextResponse.next();

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

  // Search engines always get French here: an address without /en must always show the same
  // language, or Google sees two versions of one page. English has its own /en/... addresses.
  if (CRAWLER.test(request.headers.get('user-agent') ?? '')) {
    const url = request.nextUrl.clone();
    url.pathname = `/fr${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(url);
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
  matcher: ['/api/admin/:path*', '/((?!api|_next|icons|sw\\.js|manifest\\.webmanifest|favicon\\.ico|.*\\..*).*)'],
};
