import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ADMIN_COOKIE, isAdminToken } from '@/lib/adminAuth';
import { PUBLIC_BUCKET, isAdminPhoto, type SubmissionRow } from '@/lib/community';
import { refreshSite } from '@/lib/refresh';
import { sameOrigin } from '@/lib/requestGuard';
import { deleteObjects, selectRows, supabaseConfig, updateRow, uploadObject } from '@/lib/supabase';

export const runtime = 'nodejs';

const UUID = /^[0-9a-f-]{36}$/i;
const MAX_BYTES = 2 * 1024 * 1024;
const MAX_PHOTOS = 8;

async function context(request: Request, params: Promise<{ id: string }>) {
  const fail = (error: string, status: number) => ({ res: NextResponse.json({ error }, { status }) }) as const;
  if (!sameOrigin(request)) return fail('forbidden', 403);
  const jar = await cookies();
  if (!isAdminToken(jar.get(ADMIN_COOKIE)?.value)) return fail('unauthorized', 401);
  const cfg = supabaseConfig();
  if (!cfg) return fail('not_configured', 503);
  const { id } = await params;
  if (!UUID.test(id)) return fail('invalid', 400);
  const [row] = await selectRows<SubmissionRow>(cfg, 'spot_submissions', `select=*&id=eq.${id}`).catch(() => []);
  if (!row) return fail('not_found', 404);
  return { cfg, row } as const;
}

/** Adds a photo (already resized in the browser, JPEG) to a place on the map. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const c = await context(request, params);
  if ('res' in c) return c.res;
  if (request.headers.get('content-type')?.split(';')[0] !== 'image/jpeg')
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const body = await request.arrayBuffer();
  if (body.byteLength === 0 || body.byteLength > MAX_BYTES)
    return NextResponse.json({ error: 'too_large' }, { status: 413 });
  const photos = c.row.public_photos ?? [];
  if (photos.length >= MAX_PHOTOS) return NextResponse.json({ error: 'too_many' }, { status: 400 });

  const path = `${c.row.id}/a-${Date.now()}.jpg`;
  try {
    await uploadObject(c.cfg, PUBLIC_BUCKET, path, body, 'image/jpeg');
    await updateRow(c.cfg, 'spot_submissions', c.row.id, { public_photos: [...photos, path] });
  } catch (error) {
    console.error('admin: add photo', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  await refreshSite(['community-places'], ['/[lang]/explore']);
  return NextResponse.json({ ok: true, path });
}

/** Removes a photo from a place on the map. */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const c = await context(request, params);
  if ('res' in c) return c.res;
  const path = new URL(request.url).searchParams.get('path') ?? '';
  const photos = c.row.public_photos ?? [];
  if (!photos.includes(path)) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  try {
    await updateRow(c.cfg, 'spot_submissions', c.row.id, { public_photos: photos.filter((p) => p !== path) });
    await deleteObjects(c.cfg, PUBLIC_BUCKET, [path]);
  } catch (error) {
    console.error('admin: remove photo', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  await refreshSite(['community-places'], ['/[lang]/explore']);
  return NextResponse.json({ ok: true, own: isAdminPhoto(c.row.id, path) });
}
