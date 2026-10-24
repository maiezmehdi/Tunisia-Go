import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { LEXICON } from '@/data/lexicon';
import { ADMIN_COOKIE, isAdminToken } from '@/lib/adminAuth';
import { refreshSite } from '@/lib/refresh';
import { sameOrigin } from '@/lib/requestGuard';
import { insertRow, supabaseConfig } from '@/lib/supabase';

export const runtime = 'nodejs';

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Adds a word to « Les mots du cru ». */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const jar = await cookies();
  if (!isAdminToken(jar.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const cfg = supabaseConfig();
  if (!cfg) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  const b = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const row = {
    group_id: text(b?.groupId, 40),
    latin: text(b?.latin, 60),
    ar: text(b?.ar, 60),
    meaning_fr: text(b?.meaningFr, 200),
    meaning_en: text(b?.meaningEn, 200),
    tip_fr: text(b?.tipFr, 400) || null,
    tip_en: text(b?.tipEn, 400) || null,
  };
  const bad = (['group_id', 'latin', 'ar', 'meaning_fr', 'meaning_en'] as const).find((k) => !row[k]);
  if (bad || !LEXICON.some((g) => g.id === row.group_id))
    return NextResponse.json({ error: 'invalid', field: bad ?? 'group_id' }, { status: 400 });
  try {
    await insertRow(cfg, 'lexicon_words', row);
  } catch (error) {
    console.error('admin: lexicon insert', error);
    return NextResponse.json({ error: 'save_failed' }, { status: 502 });
  }
  await refreshSite(['lexicon'], ['/[lang]/pratique']);
  return NextResponse.json({ ok: true });
}
