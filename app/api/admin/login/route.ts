import { NextResponse, type NextRequest } from 'next/server';

import { ADMIN_COOKIE, ADMIN_MAX_AGE, adminConfigured, adminToken, checkPassword } from '@/lib/adminAuth';
import { allow, clientIp, reset, sameOrigin } from '@/lib/requestGuard';

// Five wrong passwords per visitor every 15 minutes, then a pause.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!adminConfigured()) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const key = `login:${clientIp(request)}`;
  if (!allow(key, MAX_ATTEMPTS, WINDOW_MS)) {
    return NextResponse.json({ error: 'too_many_attempts' }, { status: 429, headers: { 'Retry-After': '900' } });
  }
  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  if (!checkPassword(body?.password)) {
    // Slow down guessing.
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({ error: 'wrong_password' }, { status: 401 });
  }
  reset(key);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, adminToken()!, {
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
