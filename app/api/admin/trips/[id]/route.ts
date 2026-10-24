import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ADMIN_COOKIE, isAdminToken } from '@/lib/adminAuth';
import { refreshSite } from '@/lib/refresh';
import { sameOrigin } from '@/lib/requestGuard';
import { deleteRow, supabaseConfig, updateRow } from '@/lib/supabase';
import { MAX_DAYS } from '@/lib/tripSuggest';

export const runtime = 'nodejs';

const UUID = /^[0-9a-f-]{36}$/i;

function text(value: unknown, max: number): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : undefined;
}

async function guard(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const jar = await cookies();
  if (!isAdminToken(jar.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!supabaseConfig()) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  return null;
}

/** Approve, reject or put back a suggested trip, after optional edits of its texts. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard(request);
  if (denied) return denied;
  const cfg = supabaseConfig()!;
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const action = body?.action;
  if (action !== 'approve' && action !== 'reject' && action !== 'pending') {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  const patch: Record<string, unknown> = {
    status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending',
    reviewed_at: action === 'pending' ? null : new Date().toISOString(),
  };
  const name = text(body?.name, 100);
  const description = text(body?.description, 1500);
  if (name) patch.name = name;
  if (description) patch.description = description;
  if (typeof body?.nameEn === 'string') patch.name_en = text(body.nameEn, 100) ?? null;
  if (typeof body?.descriptionEn === 'string') patch.description_en = text(body.descriptionEn, 1500) ?? null;
  const days = Math.round(Number(body?.days));
  if (Number.isFinite(days) && days >= 1 && days <= MAX_DAYS) patch.days = days;

  try {
    await updateRow(cfg, 'trip_submissions', id, patch);
  } catch (error) {
    console.error('admin: trip update', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  await refreshSite(['community-trips'], ['/[lang]/explore']);
  return NextResponse.json({ ok: true });
}

/** Deletes a suggested trip. */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard(request);
  if (denied) return denied;
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  try {
    await deleteRow(supabaseConfig()!, 'trip_submissions', id);
  } catch (error) {
    console.error('admin: trip delete', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  await refreshSite(['community-trips'], ['/[lang]/explore']);
  return NextResponse.json({ ok: true });
}
