/**
 * Counts of clicks on outside links, kept per day without any identifier (db/link-clicks.sql).
 * Shared by the browser (what counts as a click worth counting) and the server (what it accepts).
 */
export const CLICK_KINDS = ['booking', 'airbnb', 'whatsapp', 'phone', 'email', 'website', 'maps', 'social'] as const;
export type ClickKind = (typeof CLICK_KINDS)[number];

export const CLICK_PAGES = [
  'home',
  'explore',
  'lieux',
  'guides',
  'mon-voyage',
  'road-trips',
  'pratique',
  'evenements',
  'compte',
  'other',
] as const;
export type ClickPage = (typeof CLICK_PAGES)[number];

export const CLICK_LABELS: Record<ClickKind, string> = {
  booking: 'Tunisie Booking',
  airbnb: 'Airbnb',
  whatsapp: 'WhatsApp',
  phone: 'Téléphone',
  email: 'E-mail',
  website: 'Site d’un hébergement ou d’une agence',
  maps: 'Itinéraire (Google Maps, Waze)',
  social: 'Réseaux sociaux',
};

/** Which kind of outside link an address is, or null when it is not worth counting. */
export function clickKind(href: string, rel = ''): ClickKind | null {
  const h = href.trim().toLowerCase();
  if (h.startsWith('tel:')) return 'phone';
  if (h.startsWith('mailto:')) return h.includes('contact@tunisiagoo.com') ? null : 'email';
  if (!/^https?:\/\//.test(h)) return null;
  let host = '';
  try {
    host = new URL(h).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
  if (host.endsWith('tunisiagoo.com')) return null;
  if (host.endsWith('tunisiebooking.com')) return 'booking';
  if (host.endsWith('airbnb.com')) return 'airbnb';
  if (host === 'wa.me' || host.endsWith('whatsapp.com')) return 'whatsapp';
  if (host.endsWith('waze.com') || (host.endsWith('google.com') && h.includes('/maps'))) return 'maps';
  if (/(^|\.)(instagram|facebook|tiktok|linkedin|youtube)\.com$/.test(host)) {
    // The site's own footer links are not a visitor's interest in a professional.
    const tokens = rel.split(/\s+/);
    return tokens.includes('me') && !tokens.includes('nofollow') ? null : 'social';
  }
  // Websites of lodgings and agencies are listed with rel="nofollow".
  return rel.split(/\s+/).includes('nofollow') ? 'website' : null;
}

export function clickPage(pathname: string): ClickPage {
  const first = pathname.replace(/^\/en(?=\/|$)/, '').split('/')[1] ?? '';
  if (first === '') return 'home';
  return (CLICK_PAGES as readonly string[]).includes(first) ? (first as ClickPage) : 'other';
}
