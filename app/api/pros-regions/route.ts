import { NextResponse } from 'next/server';

import { PLACE_BY_ID } from '@/data/tunisiaData';
import { loadPublishedPros } from '@/lib/pros';

export const runtime = 'nodejs';
export const revalidate = 3600;

/** Regions (as written on the place fiches) where at least one guide or agency is published. */
export async function GET() {
  const pros = await loadPublishedPros();
  const regions = [...new Set(pros.map((p) => (p.placeId ? PLACE_BY_ID[p.placeId]?.region : null)).filter(Boolean))];
  return NextResponse.json({ regions });
}
