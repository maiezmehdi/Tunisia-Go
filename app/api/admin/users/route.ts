import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ADMIN_COOKIE, MIN_PASSWORD, hashPassword, isOwnerToken, validEmail } from '@/lib/adminAuth';
import { sameOrigin } from '@/lib/requestGuard';
import { insertRow, supabaseConfig } from '@/lib/supabase';

export const runtime = 'nodejs';

/** Creates an admin account. Owners only. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const jar = await cookies();
  if (!isOwnerToken(jar.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const cfg = supabaseConfig();
  if (!cfg) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  const b = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!validEmail(b?.email)) return NextResponse.json({ error: 'invalid', field: 'email' }, { status: 400 });
  const password = typeof b?.password === 'string' ? b.password : '';
  if (password.length < MIN_PASSWORD || password.length > 200)
    return NextResponse.json({ error: 'invalid', field: 'password' }, { status: 400 });
  const role = b?.role === 'owner' ? 'owner' : 'editor';
  try {
    await insertRow(cfg, 'admin_users', {
      email: b.email.trim().toLowerCase(),
      password_hash: hashPassword(password),
      role,
    });
  } catch (error) {
    const duplicate = String(error).includes('23505');
    if (!duplicate) console.error('admin: create user', error);
    return NextResponse.json({ error: duplicate ? 'exists' : 'save_failed' }, { status: duplicate ? 409 : 502 });
  }
  return NextResponse.json({ ok: true });
}
