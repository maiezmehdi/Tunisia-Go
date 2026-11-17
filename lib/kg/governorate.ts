import { COUNTRY, GOVERNORATES, type Governorate } from '@/data/kg/governorates';
import { PLACE_BY_ID } from '@/data/tunisiaData';

/**
 * Governorate lookups, kept apart from lib/kg/index.ts so that client components can use them
 * without loading the relation register.
 */

const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

const BY_KEY = new Map(GOVERNORATES.map((g) => [g.id, g]));
const BY_NAME = new Map<string, Governorate>();
for (const g of GOVERNORATES) {
  for (const n of [g.name.fr, g.name.en, ...g.regionNames]) BY_NAME.set(norm(n), g);
}

export { COUNTRY, GOVERNORATES };
export type { Governorate };

export const governorate = (id: string): Governorate | undefined => BY_KEY.get(id as Governorate['id']);

/** Governorate from a region name in either language (« Kébili », « Kebili », « Le Kef », « El Kef »…). */
export const governorateByName = (name: string | undefined): Governorate | undefined =>
  name ? BY_NAME.get(norm(name)) : undefined;

/**
 * Governorate of a place, computed from the English base data: it does not depend on the translated
 * `region` of the catalogue, which is what broke the Kébili and Le Kef pages.
 */
export const placeGovernorate = (placeId: string): Governorate | undefined =>
  governorateByName(PLACE_BY_ID[placeId]?.region);

/** English name used by the region pages and the ONTT agency table (stable URL slugs). */
export const governorateBaseName = (g: Governorate): string => g.regionNames[0];
