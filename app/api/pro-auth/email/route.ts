import { NextResponse } from 'next/server';

import { allow, clientIp, sameOrigin } from '@/lib/requestGuard';
import { supabaseConfig } from '@/lib/supabase';

/**
 * Sends a guide or agency a sign-in link by e-mail (Supabase Auth, no password). The link brings them back to
 * the page where they manage their entry, with an access token after the # of the address.
 * The return addresses must be listed in Supabase (Authentication, URL Configuration).
 */
export const runtime = 'nodejs';

const HOUR = 60 * 60 * 1000;
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  const cfg = supabaseConfig();
  if (!cfg) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const body = (await request.json().catch(() => null)) as { email?: unknown; lang?: unknown } | null;
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!EMAIL.test(email) || email.length > 254) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  if (!allow(`proauth:ip:${clientIp(request)}`, 10, HOUR) || !allow(`proauth:to:${email}`, 6, HOUR)) {
    return NextResponse.json({ error: 'too_many' }, { status: 429, headers: { 'Retry-After': '3600' } });
  }

  const origin = new URL(request.url).origin;
  const back = `${origin}${body?.lang === 'en' ? '/en' : ''}/guides/modifier`;
  try {
    const res = await fetch(`${cfg.url}/auth/v1/otp?redirect_to=${encodeURIComponent(back)}`, {
      method: 'POST',
      headers: { apikey: cfg.key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, create_user: true }),
      signal: AbortSignal.timeout(10000),
    });
    if (res.status === 429) return NextResponse.json({ error: 'too_many' }, { status: 429 });
    if (!res.ok) throw new Error(`otp ${res.status}: ${await res.text().catch(() => '')}`);
  } catch (error) {
    console.error('pro-auth: email', error);
    return NextResponse.json({ error: 'send_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
