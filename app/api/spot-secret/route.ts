import { NextResponse } from 'next/server';

import { defaultCategory, parseCoords } from '@/lib/community';
import { cleanSpot, spotAsText, type SecretSpot } from '@/lib/secretSpot';
import { insertRow, supabaseConfig, uploadObject } from '@/lib/supabase';

/**
 * Receives "secret spot" suggestions (multipart form with up to MAX_PHOTOS photos, or JSON).
 * - With SUPABASE_URL + SUPABASE_SECRET_KEY: photos go to the private "spot-photos" bucket and the
 *   suggestion to the "spot_submissions" table with status "pending" (see db/spot-submissions.sql).
 * - With SECRET_SPOT_WEBHOOK_URL: the text is also sent there (Slack, Discord, Make, Zapier…), as a notification.
 * - With neither, it answers 503 and the form hands the suggestion over to WhatsApp.
 */
export const runtime = 'nodejs';

const MAX_PHOTOS = 4;
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const PHOTO_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/png': 'png' };

export async function POST(request: Request) {
  const supabase = supabaseConfig();
  const webhook = process.env.SECRET_SPOT_WEBHOOK_URL;
  if (!supabase && !webhook) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  let fields: Record<string, unknown>;
  let photos: File[] = [];
  try {
    if ((request.headers.get('content-type') ?? '').includes('multipart/form-data')) {
      const form = await request.formData();
      fields = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === 'string'));
      photos = form.getAll('photos').filter((v): v is File => typeof v !== 'string' && v.size > 0);
    } else {
      fields = (await request.json()) as Record<string, unknown>;
    }
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  // Honeypot: real people never fill the hidden "website" field.
  if (typeof fields.website === 'string' && fields.website) return NextResponse.json({ ok: true });

  const spot = cleanSpot(fields);
  if (!spot) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  if (photos.length > MAX_PHOTOS || photos.some((p) => p.size > MAX_PHOTO_BYTES || !PHOTO_TYPES[p.type])) {
    return NextResponse.json({ error: 'invalid_photos' }, { status: 400 });
  }
  const locale = fields.locale === 'en' ? 'en' : 'fr';

  if (supabase) {
    try {
      const folder = new Date().toISOString().slice(0, 7);
      const id = crypto.randomUUID();
      const paths = await Promise.all(
        photos.map(async (photo, i) => {
          const path = `${folder}/${id}-${i + 1}.${PHOTO_TYPES[photo.type]}`;
          await uploadObject(supabase, 'spot-photos', path, await photo.arrayBuffer(), photo.type);
          return path;
        }),
      );
      await insertRow(supabase, 'spot_submissions', toRow(spot, locale, paths));
    } catch (error) {
      console.error('spot-secret: supabase', error);
      return NextResponse.json({ error: 'save_failed' }, { status: 502 });
    }
  }

  if (webhook) {
    const text = spotAsText(spot) + (photos.length ? `\nPhotos : ${photos.length}` : '');
    try {
      const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // `text` for Slack, `content` for Discord, the fields for anything else.
        body: JSON.stringify({ text, content: text, spot, photos: photos.length, receivedAt: new Date().toISOString() }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`webhook ${res.status}`);
    } catch (error) {
      // Already saved in Supabase: the notification failing is not the visitor's problem.
      if (!supabase) return NextResponse.json({ error: 'forward_failed' }, { status: 502 });
      console.error('spot-secret: webhook', error);
    }
  }
  return NextResponse.json({ ok: true });
}

function toRow(spot: SecretSpot, locale: string, photos: string[]) {
  const coords = parseCoords(spot.location);
  return {
    locale,
    name: spot.name,
    type: spot.type,
    area: spot.area,
    location: spot.location || null,
    why: spot.why,
    best_time: spot.bestTime || null,
    author: spot.author || null,
    contact: spot.contact || null,
    photos,
    // Pre-filled for the moderation page when the visitor gave coordinates or a map link.
    lat: coords?.[0] ?? null,
    lng: coords?.[1] ?? null,
    category: defaultCategory(spot.type),
  };
}
