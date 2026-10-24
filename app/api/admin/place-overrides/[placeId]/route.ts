import { NextResponse } from 'next/server';

import { placeContext } from '@/lib/placeAdmin';
import { getCatalog } from '@/lib/i18n/catalog';
import { OVERRIDE_FIELDS, fieldsOf, type OverrideFields, type PlaceOverride } from '@/lib/placeOverrides';
import { refreshSite } from '@/lib/refresh';
import { publicUrl, selectRows, supabaseConfig, upsertRow } from '@/lib/supabase';
import { PUBLIC_BUCKET } from '@/lib/community';

export const runtime = 'nodejs';

const MAX_LENGTH = 2000;

async function currentRow(cfg: NonNullable<ReturnType<typeof supabaseConfig>>, placeId: string) {
  const [row] = await selectRows<{ fr: OverrideFields; en: OverrideFields; photos: string[] }>(
    cfg,
    'place_overrides',
    `select=fr,en,photos&place_id=eq.${encodeURIComponent(placeId)}`,
  );
  return row;
}

/** The original texts, the saved changes and the photos of one built-in place. */
export async function GET(request: Request, { params }: { params: Promise<{ placeId: string }> }) {
  const c = await placeContext(request, params);
  if ('res' in c) return c.res;
  const row = await currentRow(c.cfg, c.placeId).catch(() => 'error' as const);
  if (row === 'error') return NextResponse.json({ error: 'table_missing' }, { status: 503 });
  const original = {
    fr: fieldsOf(getCatalog('fr').placeById[c.placeId]),
    en: fieldsOf(getCatalog('en').placeById[c.placeId]),
  };
  const photos = (row?.photos ?? []).map((path) => ({ path, url: publicUrl(c.cfg, PUBLIC_BUCKET, path) }));
  return NextResponse.json({ original, fr: row?.fr ?? {}, en: row?.en ?? {}, photos });
}

function clean(input: unknown, original: Record<string, string>): OverrideFields {
  const out: OverrideFields = {};
  if (!input || typeof input !== 'object') return out;
  for (const key of OVERRIDE_FIELDS) {
    const raw = (input as Record<string, unknown>)[key];
    if (typeof raw !== 'string') continue;
    const value = raw.trim().slice(0, MAX_LENGTH);
    // An empty or unchanged field means "keep the original text".
    if (value && value !== original[key]) out[key] = value;
  }
  return out;
}

/** Saves the changed texts of a built-in place. */
export async function PUT(request: Request, { params }: { params: Promise<{ placeId: string }> }) {
  const c = await placeContext(request, params);
  if ('res' in c) return c.res;
  const body = (await request.json().catch(() => null)) as Partial<PlaceOverride> | null;
  if (!body) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const fr = clean(body.fr, fieldsOf(getCatalog('fr').placeById[c.placeId]));
  const en = clean(body.en, fieldsOf(getCatalog('en').placeById[c.placeId]));
  try {
    const existing = await currentRow(c.cfg, c.placeId).catch(() => undefined);
    await upsertRow(c.cfg, 'place_overrides', {
      place_id: c.placeId,
      updated_at: new Date().toISOString(),
      fr,
      en,
      photos: existing?.photos ?? [],
    });
  } catch (error) {
    console.error('admin: save place', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  await refreshSite(
    ['place-overrides'],
    ['/[lang]/explore', '/[lang]/lieux', '/[lang]/lieux/[id]', '/[lang]/mon-voyage'],
  );
  return NextResponse.json({ ok: true });
}
