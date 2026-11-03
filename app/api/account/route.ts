import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { PRO_PHOTO_BUCKET, PROS_TAG, authUser } from '@/lib/pros';
import { allow, clientIp, sameOrigin } from '@/lib/requestGuard';
import { deleteObjects, deleteWhere, selectRows, supabaseConfig } from '@/lib/supabase';

/**
 * 'me': e-mail and type of the signed-in account.
 * 'update': changes the e-mail and/or the password (after checking the current password).
 * 'set-type': switches between traveller, guide/agency and partner (refused while a listing exists).
 * 'delete': removes the account, its saved favourites and trip, and the listing with its photo if there is one.
 */
export const runtime = 'nodejs';

const HOUR = 60 * 60 * 1000;
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

function adminHeaders(key: string): Record<string, string> {
  return key.startsWith('sb_') ? { apikey: key } : { apikey: key, Authorization: `Bearer ${key}` };
}

export async function POST(request: Request) {
  const cfg = supabaseConfig();
  if (!cfg) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (!allow(`account:${clientIp(request)}`, 60, HOUR))
    return NextResponse.json({ error: 'too_many' }, { status: 429 });
  const body = (await request.json().catch(() => null)) as {
    accessToken?: unknown;
    action?: unknown;
    currentPassword?: unknown;
    newEmail?: unknown;
    newPassword?: unknown;
    kind?: unknown;
  } | null;
  const user = await authUser(cfg, body?.accessToken);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  if (body?.action === 'me') return NextResponse.json({ email: user.email, kind: user.kind });
  if (body?.action === 'update') {
    const current = typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newEmail = typeof body.newEmail === 'string' ? body.newEmail.trim().toLowerCase() : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
    if (!newEmail && !newPassword) return NextResponse.json({ error: 'invalid' }, { status: 400 });
    if (newEmail && (!EMAIL.test(newEmail) || newEmail.length > 254))
      return NextResponse.json({ error: 'invalid' }, { status: 400 });
    if (newPassword && (newPassword.length < 8 || newPassword.length > 72))
      return NextResponse.json({ error: 'weak' }, { status: 400 });
    if (!allow(`account:update:${user.id}`, 10, HOUR)) return NextResponse.json({ error: 'too_many' }, { status: 429 });
    try {
      // The current password is asked again, so a borrowed open session cannot take the account over.
      const check = await fetch(`${cfg.url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { apikey: cfg.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password: current }),
        signal: AbortSignal.timeout(10000),
      });
      if (!check.ok) return NextResponse.json({ error: 'wrong' }, { status: 401 });
      const res = await fetch(`${cfg.url}/auth/v1/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { ...adminHeaders(cfg.key), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(newEmail ? { email: newEmail, email_confirm: true } : {}),
          ...(newPassword ? { password: newPassword } : {}),
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (res.status === 422 || res.status === 409) return NextResponse.json({ error: 'exists' }, { status: 409 });
      if (!res.ok) throw new Error(`update user ${res.status}`);
      return NextResponse.json({ ok: true });
    } catch (error) {
      console.error('account: update', error);
      return NextResponse.json({ error: 'failed' }, { status: 502 });
    }
  }
  if (body?.action === 'set-type') {
    const kind = body.kind;
    if (kind !== 'traveler' && kind !== 'pro' && kind !== 'partner')
      return NextResponse.json({ error: 'invalid' }, { status: 400 });
    if (kind === user.kind) return NextResponse.json({ ok: true, kind });
    try {
      // A published listing belongs to its type: it has to be gone before the account changes type.
      const pros = await selectRows<{ id: string }>(cfg, 'pro_listings', `select=id&owner_id=eq.${user.id}&limit=1`);
      const partners = await selectRows<{ id: string }>(
        cfg,
        'partner_listings',
        `select=id&owner_id=eq.${user.id}&limit=1`,
      ).catch(() => []);
      if (pros.length || partners.length) return NextResponse.json({ error: 'has_listing' }, { status: 409 });
      const res = await fetch(`${cfg.url}/auth/v1/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { ...adminHeaders(cfg.key), 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_metadata: { account_type: kind } }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`set type ${res.status}`);
      return NextResponse.json({ ok: true, kind });
    } catch (error) {
      console.error('account: set-type', error);
      return NextResponse.json({ error: 'failed' }, { status: 502 });
    }
  }
  if (body?.action !== 'delete') return NextResponse.json({ error: 'invalid' }, { status: 400 });

  try {
    const rows = await selectRows<{ id: string; photo_path: string | null }>(
      cfg,
      'pro_listings',
      `select=id,photo_path&owner_id=eq.${user.id}`,
    );
    for (const row of rows) {
      await deleteWhere(cfg, 'pro_listings', `id=eq.${row.id}`);
      if (row.photo_path) await deleteObjects(cfg, PRO_PHOTO_BUCKET, [row.photo_path]).catch(() => undefined);
    }
    const partners = await selectRows<{ photo_path: string | null }>(
      cfg,
      'partner_listings',
      `select=photo_path&owner_id=eq.${user.id}`,
    ).catch(() => []);
    await deleteWhere(cfg, 'partner_listings', `owner_id=eq.${user.id}`).catch(() => undefined);
    for (const row of partners) {
      if (row.photo_path) await deleteObjects(cfg, PRO_PHOTO_BUCKET, [row.photo_path]).catch(() => undefined);
    }
    await deleteWhere(cfg, 'traveler_data', `owner_id=eq.${user.id}`);
    const res = await fetch(`${cfg.url}/auth/v1/admin/users/${user.id}`, {
      method: 'DELETE',
      headers: adminHeaders(cfg.key),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`delete user ${res.status}`);
    if (rows.length) revalidateTag(PROS_TAG);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('account: delete', error);
    return NextResponse.json({ error: 'failed' }, { status: 502 });
  }
}
