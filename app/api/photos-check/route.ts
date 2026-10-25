import { NextResponse } from 'next/server';

import { PLACES as places } from '@/data/tunisiaData';
import { loadPhotos } from '@/lib/photos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Lists the places that still have fewer than two photos, to spot gaps without opening every page. */
export async function GET() {
  const photos = await loadPhotos(places);
  const missing = places
    .filter((p) => (photos[p.id]?.length ?? 0) < 2)
    .map((p) => ({
      id: p.id,
      name: p.name,
      region: p.region,
      photos: photos[p.id]?.length ?? 0,
      wiki: p.wiki ?? null,
    }));
  return NextResponse.json({ total: places.length, missingCount: missing.length, missing });
}
