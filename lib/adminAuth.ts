import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

/**
 * Protection of /admin. Two ways in:
 * - the master password in the ADMIN_PASSWORD environment variable (set in Vercel, never in the code),
 *   always an owner, so nobody can lock themselves out;
 * - accounts (email + password) created by an owner from the admin page, stored in Supabase (admin_users)
 *   with the password hashed.
 * The cookie is a signed session (email, role, expiry). The signing key comes from ADMIN_PASSWORD,
 * so changing it signs everyone out.
 */
export const ADMIN_COOKIE = 'tg-admin';
export const ADMIN_MAX_AGE = 60 * 60 * 12;

export type AdminRole = 'owner' | 'editor';
export interface AdminSession {
  email: string;
  role: AdminRole;
}

export const MIN_PASSWORD = 10;

function secret(): string | null {
  const p = process.env.ADMIN_PASSWORD?.trim();
  return p && p.length >= 8 ? p : null;
}

export function adminConfigured(): boolean {
  return secret() !== null;
}

function same(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function sign(payload: string): string | null {
  const key = secret();
  return key ? createHmac('sha256', key).update(`tunisia-go-admin-v2:${payload}`).digest('base64url') : null;
}

/** The master password. */
export function checkPassword(attempt: unknown): boolean {
  const p = secret();
  return !!p && typeof attempt === 'string' && same(attempt, p);
}

export function makeToken(session: AdminSession): string | null {
  const payload = Buffer.from(JSON.stringify({ ...session, exp: Date.now() + ADMIN_MAX_AGE * 1000 })).toString(
    'base64url',
  );
  const mac = sign(payload);
  return mac ? `${payload}.${mac}` : null;
}

export function adminSession(value: string | undefined): AdminSession | null {
  if (!value) return null;
  const [payload, mac] = value.split('.');
  const expected = payload ? sign(payload) : null;
  if (!payload || !mac || !expected || !same(mac, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as Partial<AdminSession> & { exp?: number };
    if (typeof data.exp !== 'number' || data.exp < Date.now()) return null;
    if (typeof data.email !== 'string' || (data.role !== 'owner' && data.role !== 'editor')) return null;
    return { email: data.email, role: data.role };
  } catch {
    return null;
  }
}

export function isAdminToken(value: string | undefined): boolean {
  return adminSession(value) !== null;
}

export function isOwnerToken(value: string | undefined): boolean {
  return adminSession(value)?.role === 'owner';
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('base64url');
  return `scrypt$${salt}$${scryptSync(password, salt, 32).toString('base64url')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  return same(scryptSync(password, salt, 32).toString('base64url'), hash);
}

export function validEmail(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
