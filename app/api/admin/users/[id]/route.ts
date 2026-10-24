import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ADMIN_COOKIE, MIN_PASSWORD, adminSession, hashPassword } from '@/lib/adminAuth';
import { sameOrigin } from '@/lib/requestGuard';
import { deleteRow, selectRows, supabaseConfig, updateRow } from '@/lib/supabase';

export const runtime = 'nodejs';

const UUID = /^[0-9a-f-]{36}$/i;

async function owner(request: Request, params: Promise<{ id: string }>) {
  const fail = (error: string, status: number) => ({ res: NextResponse.json({ error }, { status }) }) as const;
  if (!sameOrigin(request)) return fail('forbidden', 403);
  const jar = await cookies();
  const session = adminSession(jar.get(ADMIN_COOKIE)?.value);
  if (session?.role !== 'owner') return fail('unauthorized', 401);
  const cfg = supabaseConfig();
  if (!cfg) return fail('not_configured', 503);
  const { id } = await params;
  if (!UUID.test(id)) return fail('invalid', 400);
  const [user] = await selectRows<{ id: string; email: string }>(
    cfg,
    'admin_users',
    `select=id,email&id=eq.${id}`,
  ).catch(() => []);
  if (!user) return fail('not_found', 404);
  return { cfg, id, user, session } as const;
}

/** New password and/or role for an account. Owners only. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const o = await owner(request, params);
  if ('res' in o) return o.res;
  const b = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const patch: Record<string, unknown> = {};
  if (typeof b?.password === 'string') {
    if (b.password.length < MIN_PASSWORD || b.password.length > 200)
      return NextResponse.json({ error: 'invalid', field: 'password' }, { status: 400 });
    patch.password_hash = hashPassword(b.password);
  }
  if (b?.role === 'owner' || b?.role === 'editor') {
    if (o.user.email === o.session.email && b.role !== 'owner')
      return NextResponse.json({ error: 'self' }, { status: 400 });
    patch.role = b.role;
  }
  if (Object.keys(patch).length === 0) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  try {
    await updateRow(o.cfg, 'admin_users', o.id, patch);
  } catch (error) {
    console.error('admin: update user', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const o = await owner(request, params);
  if ('res' in o) return o.res;
  if (o.user.email === o.session.email) return NextResponse.json({ error: 'self' }, { status: 400 });
  try {
    await deleteRow(o.cfg, 'admin_users', o.id);
  } catch (error) {
    console.error('admin: delete user', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
