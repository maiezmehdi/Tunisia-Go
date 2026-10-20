import { NextResponse, type NextRequest } from 'next/server';

import { ADMIN_COOKIE, ADMIN_MAX_AGE, adminConfigured, adminToken, checkPassword } from '@/lib/adminAuth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!adminConfigured()) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  if (!checkPassword(body?.password)) {
    // Slow down guessing.
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({ error: 'wrong_password' }, { status: 401 });
  }
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
