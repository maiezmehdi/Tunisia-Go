import { revalidatePath, revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ADMIN_COOKIE, isAdminToken } from '@/lib/adminAuth';
import {
  COMMUNITY_TAG,
  PRIVATE_BUCKET,
  PUBLIC_BUCKET,
  inTunisia,
  isCategory,
  type SubmissionRow,
} from '@/lib/community';
import { copyObject, deleteObjects, selectRows, supabaseConfig, updateRow } from '@/lib/supabase';

export const runtime = 'nodejs';

const UUID = /^[0-9a-f-]{36}$/i;

function text(value: unknown, max: number): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : undefined;
}

/** Approve, reject or put back a suggestion, after optional edits from the moderation page. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const jar = await cookies();
  if (!isAdminToken(jar.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const cfg = supabaseConfig();
  if (!cfg) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const action = body?.action;
  if (action !== 'approve' && action !== 'reject' && action !== 'pending') {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  let row: SubmissionRow | undefined;
  try {
    [row] = await selectRows<SubmissionRow>(cfg, 'spot_submissions', `select=*&id=eq.${id}`);
  } catch (error) {
    console.error('admin: read', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const patch: Record<string, unknown> = {
    status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending',
    reviewed_at: action === 'pending' ? null : new Date().toISOString(),
  };
  const name = text(body?.name, 120);
  const area = text(body?.area, 120);
  const why = text(body?.why, 2000);
  if (name) patch.name = name;
  if (area) patch.area = area;
  if (why) patch.why = why;
  if (isCategory(body?.category)) patch.category = body.category;

  const lat = Number(body?.lat);
  const lng = Number(body?.lng);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng) && inTunisia(lat, lng);
  if (hasCoords) {
    patch.lat = lat;
    patch.lng = lng;
  }

  if (action === 'approve') {
    if (!hasCoords && (row.lat === null || row.lng === null)) {
      return NextResponse.json({ error: 'coords_required' }, { status: 400 });
    }
    // Photos are private until approval; the approved ones are copied to the public bucket.
    const keep = Array.isArray(body?.photos)
      ? body.photos.filter((p): p is string => row.photos.includes(p as string))
      : row.photos;
    const publicPaths: string[] = [];
    try {
      for (const [i, path] of keep.entries()) {
        const ext = path.split('.').pop() ?? 'jpg';
        const dest = `${row.id}/${i}.${ext}`;
        await copyObject(cfg, { bucket: PRIVATE_BUCKET, path }, { bucket: PUBLIC_BUCKET, path: dest });
        publicPaths.push(dest);
      }
    } catch (error) {
      console.error('admin: copy photos', error);
      return NextResponse.json({ error: 'photos_failed' }, { status: 502 });
    }
    patch.public_photos = publicPaths;
    const stale = (row.public_photos ?? []).filter((p) => !publicPaths.includes(p));
    await deleteObjects(cfg, PUBLIC_BUCKET, stale).catch((error) => console.error('admin: delete stale', error));
  } else {
    // Off the map: its photos stop being public.
    try {
      await deleteObjects(cfg, PUBLIC_BUCKET, row.public_photos ?? []);
    } catch (error) {
      console.error('admin: delete public photos', error);
    }
    patch.public_photos = [];
  }

  try {
    await updateRow(cfg, 'spot_submissions', id, patch);
  } catch (error) {
    console.error('admin: update', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }

  // The map is a cached page: rebuild it so the change shows right away.
  revalidateTag(COMMUNITY_TAG);
  revalidatePath('/[lang]/explore', 'page');
  return NextResponse.json({ ok: true });
}
