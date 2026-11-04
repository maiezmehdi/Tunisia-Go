import { PLACES } from '@/data/tunisiaData';

/** Regions with at least this many places get a « Que voir à… » page (fewer would be thin content). */
const MIN_PLACES = 3;

/** URL part of a region: lower case, no accents, dashes for spaces. */
export function regionSlug(region: string): string {
  return region
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const regionPath = (region: string) => `/que-voir/${regionSlug(region)}`;

/** Regions that have a page, with the id of each of their places. */
export const PAGE_REGIONS: { region: string; slug: string; placeIds: string[] }[] = (() => {
  const byRegion = new Map<string, string[]>();
  for (const p of PLACES) byRegion.set(p.region, [...(byRegion.get(p.region) ?? []), p.id]);
  return [...byRegion.entries()]
    .filter(([, ids]) => ids.length >= MIN_PLACES)
    .map(([region, placeIds]) => ({ region, slug: regionSlug(region), placeIds }));
})();

export const hasRegionPage = (region: string) => PAGE_REGIONS.some((r) => r.region === region);
