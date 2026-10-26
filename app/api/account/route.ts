import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { PRO_PHOTO_BUCKET, PROS_TAG, authUser } from '@/lib/pros';
import { allow, clientIp, sameOrigin } from '@/lib/requestGuard';
import { deleteObjects, deleteWhere, selectRows, supabaseConfig } from '@/lib/supabase';

/**
 * 'me': e-mail and type of the signed-in account.
 * 'delete': removes the account, and the listing with its photo if there is one.
 */
export const runtime = 'nodejs';

const HOUR = 60 * 60 * 1000;

export async function POST(request: Request) {
  const cfg = supabaseConfig();
  if (!cfg) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (!allow(`account:${clientIp(request)}`, 60, HOUR))
    return NextResponse.json({ error: 'too_many' }, { status: 429 });
  const body = (await request.json().catch(() => null)) as { accessToken?: unknown; action?: unknown } | null;
  const user = await authUser(cfg, body?.accessToken);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  if (body?.action === 'me') return NextResponse.json({ email: user.email, kind: user.kind });
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
    const res = await fetch(`${cfg.url}/auth/v1/admin/users/${user.id}`, {
      method: 'DELETE',
      headers: cfg.key.startsWith('sb_')
        ? { apikey: cfg.key }
        : { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` },
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
