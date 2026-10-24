import { NextResponse, type NextRequest } from 'next/server';

import {
  ADMIN_COOKIE,
  ADMIN_MAX_AGE,
  adminConfigured,
  checkPassword,
  makeToken,
  validEmail,
  verifyPassword,
  type AdminSession,
} from '@/lib/adminAuth';
import { allow, clientIp, reset, sameOrigin } from '@/lib/requestGuard';
import { selectRows, supabaseConfig, updateRow } from '@/lib/supabase';

// Five wrong passwords per visitor every 15 minutes, then a pause.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export const runtime = 'nodejs';

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: 'owner' | 'editor';
}

/** The account matching this email and password, if any. */
async function accountLogin(email: string, password: string): Promise<AdminSession | null> {
  const cfg = supabaseConfig();
  if (!cfg || !validEmail(email)) return null;
  const rows = await selectRows<UserRow>(
    cfg,
    'admin_users',
    `select=id,email,password_hash,role&email=eq.${encodeURIComponent(email.trim().toLowerCase())}`,
  ).catch(() => [] as UserRow[]);
  const user = rows[0];
  // Same work whether or not the account exists, to keep the timing even.
  const ok = verifyPassword(password, user?.password_hash ?? 'scrypt$x$x');
  if (!user || !ok) return null;
  await updateRow(cfg, 'admin_users', user.id, { last_login_at: new Date().toISOString() }).catch(() => null);
  return { email: user.email, role: user.role };
}

export async function POST(request: NextRequest) {
  if (!adminConfigured()) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const key = `login:${clientIp(request)}`;
  if (!allow(key, MAX_ATTEMPTS, WINDOW_MS)) {
    return NextResponse.json({ error: 'too_many_attempts' }, { status: 429, headers: { 'Retry-After': '900' } });
  }
  const body = (await request.json().catch(() => null)) as { email?: unknown; password?: unknown } | null;
  const password = typeof body?.password === 'string' ? body.password : '';
  const email = typeof body?.email === 'string' ? body.email : '';

  let session: AdminSession | null = null;
  if (password.length > 0 && password.length <= 200) {
    if (email.trim() && !checkPassword(password)) session = await accountLogin(email, password);
    else if (checkPassword(password)) session = { email: email.trim().toLowerCase() || 'owner', role: 'owner' };
  }
  if (!session) {
    // Slow down guessing.
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({ error: 'wrong_password' }, { status: 401 });
  }
  reset(key);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, makeToken(session)!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: ADMIN_MAX_AGE,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
