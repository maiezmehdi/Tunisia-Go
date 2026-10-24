/**
 * The same code can run as the public site or as a separate admin site (own Vercel project).
 * ADMIN_MODE:
 * - "only": this deployment serves /admin and nothing else (the admin site).
 * - "off":  this deployment hides /admin and /api/admin (the public site, once the admin site is up).
 * - unset:  both on the same site (default, how it works today).
 */
export type SiteMode = 'only' | 'off' | 'both';

export function siteMode(): SiteMode {
  const v = process.env.ADMIN_MODE?.trim().toLowerCase();
  return v === 'only' || v === 'off' ? v : 'both';
}

export function isAdminPath(pathname: string): boolean {
  return /^(\/(en|fr))?\/admin(\/|$)/.test(pathname) || pathname === '/api/admin' || pathname.startsWith('/api/admin/');
}
