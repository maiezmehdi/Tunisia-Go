import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ADMIN_COOKIE, isAdminToken } from '@/lib/adminAuth';
import { selectRows, supabaseConfig } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Everything editable from /admin. Admin accounts are left out on purpose (they hold password hashes).
const TABLES = ['spot_submissions', 'events', 'place_overrides', 'lexicon_words', 'place_reports'];

/** A JSON copy of the site's data, downloaded from /admin. */
export async function GET() {
  const jar = await cookies();
  if (!isAdminToken(jar.get(ADMIN_COOKIE)?.value)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const cfg = supabaseConfig();
  if (!cfg) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  const data: Record<string, unknown[] | null> = {};
  for (const t of TABLES) data[t] = await selectRows(cfg, t, 'select=*&limit=5000').catch(() => null);
  const day = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), tables: data }, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="tunisia-go-sauvegarde-${day}.json"`,
      'Cache-Control': 'no-store',
    },
  });
}
