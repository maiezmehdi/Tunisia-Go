import { NextResponse } from 'next/server';

import { allow, clientIp, sameOrigin } from '@/lib/requestGuard';
import { SITE_URL } from '@/lib/seo';
import { supabaseConfig } from '@/lib/supabase';

/**
 * "Mot de passe oublié": asks Supabase to e-mail a recovery link that opens /compte with a short-lived session.
 * The answer is always the same, whether or not the address has an account, so nobody can use it to look people up.
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
  if (!allow(`recover:ip:${clientIp(request)}`, 8, HOUR) || !allow(`recover:to:${email}`, 3, HOUR)) {
    return NextResponse.json({ error: 'too_many' }, { status: 429 });
  }
  const redirectTo = `${SITE_URL}${body?.lang === 'en' ? '/en' : ''}/compte`;
  try {
    const res = await fetch(`${cfg.url}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
      method: 'POST',
      headers: { apikey: cfg.key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) console.error('pro-auth: recover', res.status, (await res.text().catch(() => '')).slice(0, 200));
  } catch (error) {
    console.error('pro-auth: recover', error);
  }
  return NextResponse.json({ ok: true });
}
