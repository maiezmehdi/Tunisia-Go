/** Visitor's choice about audience statistics, kept for 6 months in the `tg-consent` cookie. */
export type Consent = 'granted' | 'denied';

export const CONSENT_COOKIE = 'tg-consent';
const MAX_AGE = 60 * 60 * 24 * 182;
export const CONSENT_CHANGE = 'tg-consent-change';
export const CONSENT_OPEN = 'tg-consent-open';

export function readConsent(): Consent | null {
  const match = document.cookie.match(/(?:^|;\s*)tg-consent=(granted|denied)/);
  return match ? (match[1] as Consent) : null;
}

export function writeConsent(value: Consent) {
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent<Consent>(CONSENT_CHANGE, { detail: value }));
}

/** Shows the cookie banner again, from the "Cookies" link in the footers. */
export function openConsent() {
  window.dispatchEvent(new Event(CONSENT_OPEN));
}
