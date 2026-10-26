import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import { PRO_PHOTO_BUCKET, authUser } from '@/lib/pros';
import { allow, clientIp, sameOrigin } from '@/lib/requestGuard';
import { supabaseConfig, uploadObject } from '@/lib/supabase';

/**
 * Uploads the main photo of a guide, agency or partner (already shrunk to a JPEG in the browser).
 * It goes in the person's own folder of the public "pro-photos" bucket; the entry keeps the returned path.
 */
export const runtime = 'nodejs';

const HOUR = 60 * 60 * 1000;
const MAX_BYTES = 1_500_000;

export async function POST(request: Request) {
  const cfg = supabaseConfig();
  if (!cfg) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (!allow(`prophoto:${clientIp(request)}`, 10, HOUR)) {
    return NextResponse.json({ error: 'too_many' }, { status: 429, headers: { 'Retry-After': '3600' } });
  }
  const form = await request.formData().catch(() => null);
  const user = await authUser(cfg, form?.get('accessToken'));
  // Guides, agencies and partners may upload; travellers have no listing.
  if (!user || user.kind === 'traveler') return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const photo = form?.get('photo');
  if (!(photo instanceof File) || photo.type !== 'image/jpeg' || photo.size === 0 || photo.size > MAX_BYTES) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  const path = `${user.id}/${randomUUID()}.jpg`;
  try {
    await uploadObject(cfg, PRO_PHOTO_BUCKET, path, await photo.arrayBuffer(), 'image/jpeg');
  } catch (error) {
    console.error('pro-photo', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true, path });
}
