import { NextResponse } from 'next/server';

import { PLACES } from '@/data/tunisiaData';
import { PRIVATE_BUCKET } from '@/lib/community';
import { allow, clientIp, looksLikeImage, sameOrigin } from '@/lib/requestGuard';
import { insertRow, selectRows, supabaseConfig, uploadObject } from '@/lib/supabase';
import { MAX_TRIP_PHOTOS, TRIP_PHOTO_DIR, cleanTrip } from '@/lib/tripSuggest';

export const runtime = 'nodejs';

const HOUR = 60 * 60 * 1000;
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const PHOTO_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/png': 'png' };
/** Photos plus text, with room for the multipart envelope. */
const MAX_BODY_BYTES = MAX_TRIP_PHOTOS * MAX_PHOTO_BYTES + 256 * 1024;
const BUILT_IN = new Set(PLACES.map((p) => p.id));

/** A road trip suggested by a visitor. Saved as pending: it shows on the map once approved from /admin. */
export async function POST(request: Request) {
  const cfg = supabaseConfig();
  if (!cfg) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const ip = clientIp(request);
  if (!allow(`trip:h:${ip}`, 5, HOUR) || !allow(`trip:d:${ip}`, 15, 24 * HOUR)) {
    return NextResponse.json({ error: 'too_many' }, { status: 429, headers: { 'Retry-After': '3600' } });
  }
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'too_large' }, { status: 413 });
  }

  let body: Record<string, unknown>;
  let photos: File[] = [];
  try {
    const form = await request.formData();
    body = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === 'string'));
    body.stops = typeof body.stops === 'string' ? body.stops.split(',') : [];
    photos = form.getAll('photos').filter((v): v is File => typeof v !== 'string' && v.size > 0);
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  // Sent faster than a person can fill the form: a bot.
  if (Number(body.elapsed) < 3000) {
    console.warn('trip-suggest: sent too fast, suggestion ignored');
    return NextResponse.json({ ok: true });
  }
  const trip = cleanTrip(body, BUILT_IN);
  if (!trip) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  if (photos.length > MAX_TRIP_PHOTOS || photos.some((p) => p.size > MAX_PHOTO_BYTES || !PHOTO_TYPES[p.type])) {
    return NextResponse.json({ error: 'invalid_photos' }, { status: 400 });
  }
  if (!(await Promise.all(photos.map(looksLikeImage))).every(Boolean)) {
    return NextResponse.json({ error: 'invalid_photos' }, { status: 400 });
  }

  try {
    // Places suggested by visitors count only once approved.
    const community = trip.stops.filter((id) => !BUILT_IN.has(id));
    if (community.length) {
      const ids = community.map((id) => id.slice(2)).join(',');
      const found = await selectRows<{ id: string }>(
        cfg,
        'spot_submissions',
        `select=id&status=eq.approved&id=in.(${ids})`,
      );
      if (found.length !== community.length) return NextResponse.json({ error: 'invalid' }, { status: 400 });
    }
    const folder = `${TRIP_PHOTO_DIR}/${new Date().toISOString().slice(0, 7)}`;
    const id = crypto.randomUUID();
    const paths = await Promise.all(
      photos.map(async (photo, i) => {
        const path = `${folder}/${id}-${i + 1}.${PHOTO_TYPES[photo.type]}`;
        await uploadObject(cfg, PRIVATE_BUCKET, path, await photo.arrayBuffer(), photo.type);
        return path;
      }),
    );
    await insertRow(cfg, 'trip_submissions', {
      locale: body.locale === 'en' ? 'en' : 'fr',
      name: trip.name,
      description: trip.description,
      days: trip.days,
      stops: trip.stops,
      author: trip.author || null,
      contact: trip.contact || null,
      photos: paths,
    });
    console.info(`trip-suggest: saved (${trip.stops.length} stops, ${paths.length} photos)`);
  } catch (error) {
    console.error('trip-suggest: supabase', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
