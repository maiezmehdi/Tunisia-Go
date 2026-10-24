import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ADMIN_COOKIE, isAdminToken } from '@/lib/adminAuth';
import { refreshSite } from '@/lib/refresh';
import { sameOrigin } from '@/lib/requestGuard';
import { PRIVATE_BUCKET, PUBLIC_BUCKET } from '@/lib/community';
import { copyObject, deleteObjects, deleteRow, selectRows, supabaseConfig, updateRow } from '@/lib/supabase';
import { MAX_DAYS, TRIP_PHOTO_DIR, type TripRow } from '@/lib/tripSuggest';

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

  let row: TripRow | undefined;
  try {
    [row] = await selectRows<TripRow>(cfg, 'trip_submissions', `select=*&id=eq.${id}`);
  } catch (error) {
    console.error('admin: trip read', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  // Photos are private until approval; the kept ones are copied to the public bucket.
  const photos = row.photos ?? [];
  const oldPublic = row.public_photos ?? [];
  const publicPaths: string[] = [];
  if (action === 'approve') {
    const keep = Array.isArray(body?.photos)
      ? body.photos.filter((p): p is string => photos.includes(p as string))
      : photos;
    try {
      for (const [i, path] of keep.entries()) {
        const ext = path.split('.').pop() ?? 'jpg';
        const dest = `${TRIP_PHOTO_DIR}/${row.id}/${i}.${ext}`;
        await copyObject(cfg, { bucket: PRIVATE_BUCKET, path }, { bucket: PUBLIC_BUCKET, path: dest });
        publicPaths.push(dest);
      }
    } catch (error) {
      console.error('admin: trip copy photos', error);
      return NextResponse.json({ error: 'photos_failed' }, { status: 502 });
    }
  }
  patch.public_photos = publicPaths;
  const stale = oldPublic.filter((p) => !publicPaths.includes(p));

  try {
    await updateRow(cfg, 'trip_submissions', id, patch);
    await deleteObjects(cfg, PUBLIC_BUCKET, stale).catch((error) => console.error('admin: trip stale photos', error));
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
    const cfg = supabaseConfig()!;
    const [row] = await selectRows<TripRow>(cfg, 'trip_submissions', `select=*&id=eq.${id}`);
    await deleteRow(cfg, 'trip_submissions', id);
    if (row) {
      await deleteObjects(cfg, PRIVATE_BUCKET, row.photos ?? []).catch((e) => console.error('admin: trip photos', e));
      await deleteObjects(cfg, PUBLIC_BUCKET, row.public_photos ?? []).catch((e) =>
        console.error('admin: trip photos', e),
      );
    }
  } catch (error) {
    console.error('admin: trip delete', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  await refreshSite(['community-trips'], ['/[lang]/explore']);
  return NextResponse.json({ ok: true });
}
