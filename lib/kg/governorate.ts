import { COUNTRY, GOVERNORATES, type Governorate } from '@/data/kg/governorates';

/**
 * Governorate lookups by name, kept apart from lib/kg/index.ts so that client components can use them
 * without loading the places or the relation register.
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

/** English name used by the region pages and the ONTT agency table (stable URL slugs). */
export const governorateBaseName = (g: Governorate): string => g.regionNames[0];
