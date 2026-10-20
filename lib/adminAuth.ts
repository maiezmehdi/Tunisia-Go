import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Password protection for the moderation page. The password lives in the ADMIN_PASSWORD
 * environment variable (set in Vercel, never in the code). The cookie holds an HMAC derived
 * from it, so changing the password signs everyone out.
 */
export const ADMIN_COOKIE = 'tg-admin';
export const ADMIN_MAX_AGE = 60 * 60 * 12;

function password(): string | null {
  const p = process.env.ADMIN_PASSWORD?.trim();
  return p && p.length >= 8 ? p : null;
}

export function adminConfigured(): boolean {
  return password() !== null;
}

export function adminToken(): string | null {
  const p = password();
  return p ? createHmac('sha256', p).update('tunisia-go-admin-v1').digest('base64url') : null;
}

function same(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkPassword(attempt: unknown): boolean {
  const p = password();
  return !!p && typeof attempt === 'string' && same(attempt, p);
}

export function isAdminToken(value: string | undefined): boolean {
  const token = adminToken();
  return !!token && !!value && same(value, token);
}
