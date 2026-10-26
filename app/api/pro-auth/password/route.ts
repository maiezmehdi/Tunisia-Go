import { NextResponse } from 'next/server';

import { allow, clientIp, sameOrigin } from '@/lib/requestGuard';
import { supabaseConfig } from '@/lib/supabase';

/**
 * Account of a guide or agency: e-mail and password, handled by Supabase Auth.
 * 'signup' creates the user already confirmed (no e-mail is sent, so no e-mail quota), then signs in.
 * 'login' and 'refresh' return the tokens the browser keeps to call the other pro routes.
 */
export const runtime = 'nodejs';

const HOUR = 60 * 60 * 1000;
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

interface Session {
  access_token?: string;
  refresh_token?: string;
}

export async function POST(request: Request) {
  const cfg = supabaseConfig();
  if (!cfg) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const body = (await request.json().catch(() => null)) as {
    mode?: unknown;
    email?: unknown;
    password?: unknown;
    refreshToken?: unknown;
    kind?: unknown;
  } | null;
  if (!allow(`proauth:ip:${clientIp(request)}`, 40, HOUR)) {
    return NextResponse.json({ error: 'too_many' }, { status: 429 });
  }
  const headers = { apikey: cfg.key, 'Content-Type': 'application/json' };
  const asSession = async (res: Response) => {
    const data = (await res.json().catch(() => ({}))) as Session;
    if (!res.ok || !data.access_token || !data.refresh_token) return null;
    return NextResponse.json({ accessToken: data.access_token, refreshToken: data.refresh_token });
  };

  try {
    if (body?.mode === 'refresh') {
      if (typeof body.refreshToken !== 'string' || body.refreshToken.length > 200)
        return NextResponse.json({ error: 'invalid' }, { status: 400 });
      const res = await fetch(`${cfg.url}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ refresh_token: body.refreshToken }),
        signal: AbortSignal.timeout(10000),
      });
      return (await asSession(res)) ?? NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    if (!EMAIL.test(email) || email.length > 254) return NextResponse.json({ error: 'invalid' }, { status: 400 });
    if (password.length < 8 || password.length > 72) return NextResponse.json({ error: 'weak' }, { status: 400 });
    if (!allow(`proauth:to:${email}`, 15, HOUR)) return NextResponse.json({ error: 'too_many' }, { status: 429 });

    if (body?.mode === 'signup') {
      const created = await fetch(`${cfg.url}/auth/v1/admin/users`, {
        method: 'POST',
        headers: cfg.key.startsWith('sb_') ? headers : { ...headers, Authorization: `Bearer ${cfg.key}` },
        body: JSON.stringify({
          email,
          password,
          email_confirm: true,
          user_metadata: { account_type: body.kind === 'traveler' ? 'traveler' : 'pro' },
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (created.status === 422 || created.status === 409)
        return NextResponse.json({ error: 'exists' }, { status: 409 });
      if (!created.ok) throw new Error(`signup ${created.status}: ${await created.text().catch(() => '')}`);
    } else if (body?.mode !== 'login') {
      return NextResponse.json({ error: 'invalid' }, { status: 400 });
    }

    const res = await fetch(`${cfg.url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(10000),
    });
    return (await asSession(res)) ?? NextResponse.json({ error: 'wrong' }, { status: 401 });
  } catch (error) {
    console.error('pro-auth: password', error);
    return NextResponse.json({ error: 'failed' }, { status: 502 });
  }
}
