import { NextResponse } from 'next/server';

import { PARTNER_DESCRIPTION_MAX, cleanPartnerType, normalizeWebsite } from '@/lib/partners';
import { PRO_PHOTO_BUCKET, authUser, cleanPhotoPath, cleanPlaceId, normalizeWhatsApp } from '@/lib/pros';
import { allow, clientIp, sameOrigin } from '@/lib/requestGuard';
import { deleteObjects, deleteWhere, publicUrl, selectRows, supabaseConfig, upsertRow } from '@/lib/supabase';

/**
 * The listing of a partner account: 'get', 'save' (create or change: it goes back to the admin for a check)
 * and 'remove'. Only accounts of the partner type may use it.
 */
export const runtime = 'nodejs';

const HOUR = 60 * 60 * 1000;

interface Row {
  status: 'published' | 'pending' | 'hidden';
  partner_type: string;
  name: string;
  place_id: string | null;
  photo_path: string | null;
  description: string | null;
  whatsapp: string | null;
  website: string | null;
}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, max) : '';
}

export async function POST(request: Request) {
  const cfg = supabaseConfig();
  if (!cfg) return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  if (!sameOrigin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  if (!allow(`partner:${clientIp(request)}`, 40, HOUR))
    return NextResponse.json({ error: 'too_many' }, { status: 429 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const user = await authUser(cfg, body?.accessToken);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (user.kind !== 'partner') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  try {
    const [row] = await selectRows<Row>(
      cfg,
      'partner_listings',
      `select=status,partner_type,name,place_id,photo_path,description,whatsapp,website&owner_id=eq.${user.id}&limit=1`,
    );

    if (body?.action === 'remove') {
      await deleteWhere(cfg, 'partner_listings', `owner_id=eq.${user.id}`);
      if (row?.photo_path) await deleteObjects(cfg, PRO_PHOTO_BUCKET, [row.photo_path]).catch(() => undefined);
      return NextResponse.json({ ok: true });
    }

    if (body?.action === 'save') {
      const type = cleanPartnerType(body.type);
      const name = text(body.name, 80);
      const whatsappRaw = text(body.whatsapp, 30);
      const whatsapp = whatsappRaw ? normalizeWhatsApp(whatsappRaw) : null;
      const websiteRaw = text(body.website, 200);
      const website = websiteRaw ? normalizeWebsite(websiteRaw) : null;
      if (!type || name.length < 2) return NextResponse.json({ error: 'invalid' }, { status: 400 });
      if ((whatsappRaw && !whatsapp) || (websiteRaw && !website))
        return NextResponse.json({ error: 'invalid_contact' }, { status: 400 });
      if (!whatsapp && !website) return NextResponse.json({ error: 'need_contact' }, { status: 400 });
      if (body.consent !== true) return NextResponse.json({ error: 'consent' }, { status: 400 });
      const photoPath = cleanPhotoPath(body.photoPath, user.id) ?? row?.photo_path ?? null;
      await upsertRow(
        cfg,
        'partner_listings',
        {
          owner_id: user.id,
          status: 'pending',
          partner_type: type,
          name,
          place_id: cleanPlaceId(body.placeId),
          photo_path: photoPath,
          description: text(body.description, PARTNER_DESCRIPTION_MAX) || null,
          whatsapp,
          website,
          consent: true,
          updated_at: new Date().toISOString(),
        },
        'owner_id',
      );
      if (row?.photo_path && row.photo_path !== photoPath) {
        await deleteObjects(cfg, PRO_PHOTO_BUCKET, [row.photo_path]).catch(() => undefined);
      }
      return NextResponse.json({ ok: true, status: 'pending' });
    }

    if (!row) return NextResponse.json({ error: 'none' }, { status: 404 });
    return NextResponse.json({
      status: row.status,
      type: row.partner_type,
      name: row.name,
      placeId: row.place_id ?? '',
      photoPath: row.photo_path ?? '',
      photoUrl: row.photo_path ? publicUrl(cfg, PRO_PHOTO_BUCKET, row.photo_path) : '',
      description: row.description ?? '',
      whatsapp: row.whatsapp ?? '',
      website: row.website ?? '',
    });
  } catch (error) {
    console.error('partner', error);
    return NextResponse.json({ error: 'failed' }, { status: 502 });
  }
}
