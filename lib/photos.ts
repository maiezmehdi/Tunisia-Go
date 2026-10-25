import type { Photo, Place } from '@/data/types';

/**
 * Loads real photos for each place from Wikimedia Commons, through the
 * English Wikipedia article named in `place.wiki`. Runs on the server at
 * build time and is refreshed daily (see `revalidate` in app/page.tsx).
 * Any failure falls back to no photos, so the page never breaks.
 */

const API = 'https://en.wikipedia.org/w/api.php';
const API_FR = 'https://fr.wikipedia.org/w/api.php';
const COMMONS = 'https://commons.wikimedia.org/w/api.php';
const HEADERS = { 'User-Agent': 'TunisiaGo/0.1 (https://github.com/maiezmehdi/Tunisia-Go)' };
const MAX_PHOTOS = 4;
const THUMB_WIDTH = 1280;

/** File names that are almost never photos of the place itself */
const SKIP =
  /(map|carte|logo|flag|coat[_ ]of[_ ]arms|icon|locator|location|blason|seal|diagram|plan\b|commons-logo|wiki)/i;

interface ImageInfo {
  thumburl?: string;
  thumbwidth?: number;
  thumbheight?: number;
  width?: number;
  mime?: string;
  descriptionurl?: string;
  extmetadata?: Record<string, { value?: string }>;
}

interface ApiPage {
  title: string;
  pageimage?: string;
  imageinfo?: ImageInfo[];
  /** Search rank, on Commons search results */
  index?: number;
}

function stripHtml(html = ''): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function query(params: Record<string, string>, api = API): Promise<{ pages?: Record<string, ApiPage> } | null> {
  const url = new URL(api);
  for (const [k, v] of Object.entries({ action: 'query', format: 'json', redirects: '1', ...params })) {
    url.searchParams.set(k, v);
  }
  try {
    const res = await fetch(url, {
      headers: HEADERS,
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { query?: { pages?: Record<string, ApiPage> } };
    return json.query ?? null;
  } catch {
    return null;
  }
}

function toPhoto(page: ApiPage): Photo | null {
  const info = page.imageinfo?.[0];
  if (!info?.thumburl || info.mime !== 'image/jpeg') return null;
  if ((info.width ?? 0) < 800) return null;
  if (SKIP.test(page.title)) return null;
  const meta = info.extmetadata ?? {};
  return {
    src: info.thumburl,
    width: info.thumbwidth,
    height: info.thumbheight,
    title: stripHtml(meta.ObjectName?.value) || page.title.replace(/^File:/, '').replace(/\.[a-z]+$/i, ''),
    author: stripHtml(meta.Artist?.value) || 'Unknown author',
    license: stripHtml(meta.LicenseShortName?.value) || 'See source',
    sourceUrl: info.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
  };
}

const IMAGE_INFO = {
  prop: 'imageinfo',
  iiprop: 'url|mime|size|extmetadata',
  iiurlwidth: String(THUMB_WIDTH),
  iiextmetadatafilter: 'Artist|LicenseShortName|ObjectName',
};

/** Photos used in a Wikipedia article (English by default), its lead image first. */
async function photosFor(article: string, api = API): Promise<Photo[]> {
  const [lead, all] = await Promise.all([
    query({ titles: article, prop: 'pageimages', piprop: 'name' }, api),
    query(
      {
        titles: article,
        generator: 'images',
        gimlimit: '50',
        prop: 'imageinfo',
        iiprop: 'url|mime|size|extmetadata',
        iiurlwidth: String(THUMB_WIDTH),
        iiextmetadatafilter: 'Artist|LicenseShortName|ObjectName',
      },
      api,
    ),
  ]);

  const leadName = Object.values(lead?.pages ?? {})[0]?.pageimage;
  const photos = Object.values(all?.pages ?? {})
    .map((p) => ({ page: p, photo: toPhoto(p) }))
    .filter((x): x is { page: ApiPage; photo: Photo } => !!x.photo)
    // The article's lead image first, then the rest in a stable order
    .sort((a, b) => {
      const aLead = leadName && a.page.title.replace(/^File:/, '').replace(/ /g, '_') === leadName ? 0 : 1;
      const bLead = leadName && b.page.title.replace(/^File:/, '').replace(/ /g, '_') === leadName ? 0 : 1;
      return aLead - bLead || a.page.title.localeCompare(b.page.title);
    })
    .map((x) => x.photo);

  return photos.slice(0, MAX_PHOTOS);
}

/** Free photos found by a search on Wikimedia Commons, most relevant first. */
async function searchCommons(search: string): Promise<Photo[]> {
  const res = await query(
    { generator: 'search', gsrnamespace: '6', gsrsearch: `${search} filetype:bitmap`, gsrlimit: '12', ...IMAGE_INFO },
    COMMONS,
  );
  return Object.values(res?.pages ?? {})
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map(toPhoto)
    .filter((p): p is Photo => !!p)
    .slice(0, MAX_PHOTOS);
}

function unique(photos: Photo[]): Photo[] {
  const seen = new Set<string>();
  return photos.filter((p) => !seen.has(p.src) && seen.add(p.src));
}

/**
 * English article first, then the French one, then a Commons search on the place's own
 * words, until there are at least two photos (some articles have none, or only maps).
 */
async function photosForPlace(place: Place): Promise<Photo[]> {
  let photos = place.wiki ? await photosFor(place.wiki) : [];
  if (photos.length < 2 && place.wikiFr) photos = unique([...photos, ...(await photosFor(place.wikiFr, API_FR))]);
  if (photos.length < 2) {
    photos = unique([...photos, ...(await searchCommons(place.photoSearch ?? `${place.name} ${place.stayQuery}`))]);
  }
  // Still short (small places have few free photos): try the plain name, with Tunisia and the region.
  const plain = place.name.replace(/\s*\(.*?\)/g, '').trim();
  for (const search of [`${plain} Tunisia`, `${plain} ${place.region} Tunisia`]) {
    if (photos.length >= 2) break;
    photos = unique([...photos, ...(await searchCommons(search))]);
  }
  return photos.slice(0, MAX_PHOTOS);
}

export async function loadPhotos(places: Place[]): Promise<Record<string, Photo[]>> {
  const entries = await Promise.all(places.map(async (p) => [p.id, await photosForPlace(p)] as const));
  return Object.fromEntries(entries);
}
