import type { Labels } from '@/data/kg/types';
import { PLACES } from '@/data/tunisiaData';
import { governorateBaseName, governorateByName } from '@/lib/kg/governorate';

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

/**
 * A region name in either language (« Kébili » or « Kebili », « Le Kef » or « El Kef ») goes through its
 * governorate (data/kg/governorates.ts) to the English base name: the slugs of /que-voir/* never change.
 */
const baseName = (region: string): string => {
  const g = governorateByName(region);
  return g ? governorateBaseName(g) : region;
};

export const regionPath = (region: string) => `/que-voir/${regionSlug(baseName(region))}`;

/** Regions that have a page: English base name, slug, governorate key and names, ids of their places. */
export const PAGE_REGIONS: { region: string; slug: string; gov?: string; name: Labels; placeIds: string[] }[] = (() => {
  const byRegion = new Map<string, string[]>();
  for (const p of PLACES) byRegion.set(p.region, [...(byRegion.get(p.region) ?? []), p.id]);
  return [...byRegion.entries()]
    .filter(([, ids]) => ids.length >= MIN_PLACES)
    .map(([region, placeIds]) => {
      const g = governorateByName(region);
      return { region, slug: regionSlug(region), gov: g?.id, name: g?.name ?? { fr: region, en: region }, placeIds };
    });
})();

/** True when the region (named in either language) has a « Que voir à… » page. */
export const hasRegionPage = (region: string) => {
  const base = baseName(region);
  return PAGE_REGIONS.some((r) => r.region === base);
};
