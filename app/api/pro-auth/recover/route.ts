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
// Resend template "Tunisia Go réinitialisation" (variable RESET_URL); the ID is not a secret.
const TEMPLATE_ID = process.env.RESEND_RESET_TEMPLATE_ID || '509e82fa-c3a4-4133-b0fc-b5d3fcb5b7ab';
const FROM = process.env.RESEND_FROM || 'Tunisia Go <contact@tunisiagoo.com>';

function adminHeaders(key: string): Record<string, string> {
  return key.startsWith('sb_') ? { apikey: key } : { apikey: key, Authorization: `Bearer ${key}` };
}

/** Sends the recovery link through Resend with our template. Returns false when it could not be sent. */
async function sendWithResend(cfg: { url: string; key: string }, email: string, redirectTo: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  try {
    const link = await fetch(`${cfg.url}/auth/v1/admin/generate_link`, {
      method: 'POST',
      headers: { ...adminHeaders(cfg.key), 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'recovery', email, redirect_to: redirectTo }),
      signal: AbortSignal.timeout(10000),
    });
    // Unknown address: nothing to send, and the answer stays the same for the visitor.
    if (link.status === 404 || link.status === 422) return true;
    if (!link.ok) throw new Error(`generate_link ${link.status}`);
    const actionLink = ((await link.json()) as { action_link?: string }).action_link;
    if (!actionLink) throw new Error('generate_link: no action_link');
    const sent = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        subject: 'Réinitialiser votre mot de passe · Tunisia Go',
        template: { id: TEMPLATE_ID, variables: { RESET_URL: actionLink } },
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!sent.ok) throw new Error(`resend ${sent.status} ${(await sent.text().catch(() => '')).slice(0, 200)}`);
    return true;
  } catch (error) {
    console.error('pro-auth: recover via resend', error);
    return false;
  }
}

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
  if (await sendWithResend(cfg, email, redirectTo)) return NextResponse.json({ ok: true });
  // Resend not set up or down: Supabase sends its own template instead.
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
