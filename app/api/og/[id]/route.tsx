import { ImageResponse } from 'next/og';

import { isLocale, type Locale } from '@/lib/i18n/config';
import { getCatalog } from '@/lib/i18n/catalog';
import { loadPhotos } from '@/lib/photos';
import { applyOverrides, loadPlaceOverrides, withOverridePhotos } from '@/lib/placeOverrides';

/** Share card of a place (1200x630): its photo darkened, with its name and region. */
export const revalidate = 86400;

/** Satori reads JPEG and PNG only; anything else, or a failed download, gives the plain card. */
async function photoData(src: string | undefined): Promise<string | null> {
  if (!src) return null;
  try {
    const res = await fetch(src, {
      headers: { 'User-Agent': 'TunisiaGo/0.1 (https://github.com/maiezmehdi/Tunisia-Go)' },
      signal: AbortSignal.timeout(8000),
    });
    const type = res.headers.get('content-type') ?? '';
    if (!res.ok || !/image\/(jpeg|png)/.test(type)) return null;
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`;
  } catch {
    return null;
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lang = new URL(req.url).searchParams.get('lang') ?? 'fr';
  const locale: Locale = isLocale(lang) ? lang : 'fr';
  const catalog = getCatalog(locale);
  const overrides = await loadPlaceOverrides();
  const base = catalog.placeById[id];
  if (!base) return new Response('Not found', { status: 404 });
  const place = applyOverrides([base], overrides, locale)[0];
  const photos = withOverridePhotos(await loadPhotos([place]), overrides, { [place.id]: place.name })[place.id] ?? [];
  const photo = await photoData(photos[0]?.src);

  return new ImageResponse(
    <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative', background: '#2b2622' }}>
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" width={1200} height={630} style={{ position: 'absolute', objectFit: 'cover' }} />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          background:
            'linear-gradient(to top, rgba(30,25,22,0.88) 0%, rgba(30,25,22,0.25) 60%, rgba(30,25,22,0.1) 100%)',
        }}
      />
      <div style={{ position: 'absolute', left: 64, right: 64, bottom: 56, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 26, letterSpacing: 6, textTransform: 'uppercase', color: '#e9dcc6' }}>
          {place.region}
        </div>
        <div style={{ marginTop: 12, fontSize: 84, lineHeight: 1.05, color: '#fbf7ef', fontFamily: 'serif' }}>
          {place.name}
        </div>
        <div style={{ marginTop: 22, fontSize: 28, color: '#e9dcc6' }}>Tunisia Go · tunisiagoo.com</div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400' },
    },
  );
}
