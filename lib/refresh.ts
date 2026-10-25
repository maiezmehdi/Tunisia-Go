import { revalidatePath, revalidateTag } from 'next/cache';

/** What the admin may ask the public site to rebuild. Shared with /api/revalidate, which checks against it. */
export const REFRESH_TAGS = [
  'events',
  'community-places',
  'community-trips',
  'place-overrides',
  'lexicon',
  'place-ratings',
  'pros',
] as const;
export const REFRESH_PATHS = [
  '/[lang]/evenements',
  '/[lang]/explore',
  '/[lang]/guides',
  '/[lang]/lieux',
  '/[lang]/lieux/[id]',
  '/[lang]/mon-voyage',
  '/[lang]/pratique',
] as const;

type Tag = (typeof REFRESH_TAGS)[number];
type Path = (typeof REFRESH_PATHS)[number];

/**
 * Rebuilds cached pages after an admin change: here, and on the public site when the admin runs as
 * a separate deployment (PUBLIC_SITE_URL and REVALIDATE_SECRET set on the admin project).
 */
export async function refreshSite(tags: Tag[], paths: Path[]): Promise<void> {
  for (const t of tags) revalidateTag(t);
  for (const p of paths) revalidatePath(p, 'page');

  const base = process.env.PUBLIC_SITE_URL?.trim().replace(/\/+$/, '');
  const secret = process.env.REVALIDATE_SECRET?.trim();
  if (!base || !secret) return;
  await fetch(`${base}/api/revalidate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
    body: JSON.stringify({ tags, paths }),
    signal: AbortSignal.timeout(8000),
  }).catch((error) => console.error('refresh: public site', error));
}
