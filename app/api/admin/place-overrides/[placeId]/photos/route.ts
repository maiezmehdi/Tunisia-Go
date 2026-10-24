import { NextResponse } from 'next/server';

import { PUBLIC_BUCKET } from '@/lib/community';
import { placeContext } from '@/lib/placeAdmin';
import { refreshSite } from '@/lib/refresh';
import { deleteObjects, selectRows, uploadObject, upsertRow } from '@/lib/supabase';

export const runtime = 'nodejs';

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_PHOTOS = 8;
const PATHS = ['/[lang]/explore', '/[lang]/lieux/[id]', '/[lang]/mon-voyage'] as const;

async function load(cfg: Parameters<typeof selectRows>[0], placeId: string) {
  const [row] = await selectRows<{ fr: object; en: object; photos: string[] }>(
    cfg,
    'place_overrides',
    `select=fr,en,photos&place_id=eq.${encodeURIComponent(placeId)}`,
  );
  return { fr: row?.fr ?? {}, en: row?.en ?? {}, photos: row?.photos ?? [] };
}

async function save(cfg: Parameters<typeof selectRows>[0], placeId: string, row: Awaited<ReturnType<typeof load>>) {
  await upsertRow(cfg, 'place_overrides', { place_id: placeId, updated_at: new Date().toISOString(), ...row });
}

/** Adds a photo (already resized in the browser, JPEG) to a built-in place. */
export async function POST(request: Request, { params }: { params: Promise<{ placeId: string }> }) {
  const c = await placeContext(request, params);
  if ('res' in c) return c.res;
  if (request.headers.get('content-type')?.split(';')[0] !== 'image/jpeg')
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const body = await request.arrayBuffer();
  if (body.byteLength === 0 || body.byteLength > MAX_BYTES)
    return NextResponse.json({ error: 'too_large' }, { status: 413 });
  try {
    const row = await load(c.cfg, c.placeId);
    if (row.photos.length >= MAX_PHOTOS) return NextResponse.json({ error: 'too_many' }, { status: 400 });
    const path = `places/${c.placeId}/a-${Date.now()}.jpg`;
    await uploadObject(c.cfg, PUBLIC_BUCKET, path, body, 'image/jpeg');
    await save(c.cfg, c.placeId, { ...row, photos: [...row.photos, path] });
    await refreshSite(['place-overrides'], [...PATHS]);
    return NextResponse.json({ ok: true, path });
  } catch (error) {
    console.error('admin: add place photo', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
}

/** Removes one of those photos. */
export async function DELETE(request: Request, { params }: { params: Promise<{ placeId: string }> }) {
  const c = await placeContext(request, params);
  if ('res' in c) return c.res;
  const path = new URL(request.url).searchParams.get('path') ?? '';
  try {
    const row = await load(c.cfg, c.placeId);
    if (!row.photos.includes(path)) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    await save(c.cfg, c.placeId, { ...row, photos: row.photos.filter((p) => p !== path) });
    await deleteObjects(c.cfg, PUBLIC_BUCKET, [path]);
    await refreshSite(['place-overrides'], [...PATHS]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('admin: remove place photo', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
}
