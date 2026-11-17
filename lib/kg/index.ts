import { DESIGNATIONS } from '@/data/kg/designations';
import { FESTIVALS } from '@/data/kg/festivals';
import { HERITAGE } from '@/data/kg/heritage';
import { HISTORICAL_EVENTS, PERSONS, POLITIES } from '@/data/kg/history';
import { ICH } from '@/data/kg/ich';
import { RELATIONS } from '@/data/kg/relations';
import { SOURCES } from '@/data/kg/sources';
import type { Designation, EntityId, Heritage, KgEntity, KgRelation, KgSource, Labels } from '@/data/kg/types';
import { ITINERARIES, PLACES } from '@/data/tunisiaData';
import { COUNTRY, GOVERNORATES, governorateByName, placeGovernorate } from './governorate';

export { COUNTRY, GOVERNORATES, governorateByName, placeGovernorate };
export { governorate, governorateBaseName } from './governorate';

type Lang = 'fr' | 'en';

/**
 * Places and road trips stay in data/tunisiaData.ts: the graph only references them by id.
 * Their name here is the English base name (labels in French come from the catalogue).
 */
const PLACE_ENTITIES: KgEntity[] = PLACES.map((p) => ({
  id: `place:${p.id}` as EntityId,
  kind: 'place',
  name: { fr: p.name, en: p.name },
  status: 'active',
  sources: [],
}));
const TRIP_ENTITIES: KgEntity[] = ITINERARIES.map((t) => ({
  id: `trip:${t.id}` as EntityId,
  kind: 'trip',
  name: { fr: t.name, en: t.name },
  status: 'active',
  sources: [],
}));
const COUNTRY_ENTITY: KgEntity = { ...COUNTRY, kind: 'country', status: 'active', sources: ['S20'] };

export const ENTITIES: KgEntity[] = [
  COUNTRY_ENTITY,
  ...GOVERNORATES,
  ...PLACE_ENTITIES,
  ...TRIP_ENTITIES,
  ...DESIGNATIONS,
  ...ICH,
  ...HERITAGE,
  ...POLITIES,
  ...PERSONS,
  ...HISTORICAL_EVENTS,
  ...FESTIVALS,
];

const BY_ID = new Map<string, KgEntity>(ENTITIES.map((e) => [e.id, e]));
const SOURCE_BY_ID = new Map<string, KgSource>(SOURCES.map((s) => [s.id, s]));

export { RELATIONS, SOURCES, DESIGNATIONS, HERITAGE, FESTIVALS, ICH };

export const get = (id: string): KgEntity | undefined => BY_ID.get(id);
export const source = (id: string): KgSource | undefined => SOURCE_BY_ID.get(id);
export const label = (id: string, lang: Lang): string | undefined => BY_ID.get(id)?.name[lang];

/**
 * The single publication rule (LOT4-RELATIONS § 3.1): a relation is public only when it is `established`,
 * is not a text-only fact, and links two real entities (never a `candidate:`).
 */
export const isPublished = (r: KgRelation): boolean =>
  r.status === 'established' && !r.textOnly && !r.from.startsWith('candidate:') && !r.to.startsWith('candidate:');

export function relationsOf(
  id: string,
  opts: { published?: boolean; direction?: 'from' | 'to' | 'both'; type?: KgRelation['type'] } = {},
): KgRelation[] {
  const dir = opts.direction ?? 'both';
  return RELATIONS.filter(
    (r) =>
      ((dir !== 'to' && r.from === id) || (dir !== 'from' && r.to === id)) &&
      (!opts.type || r.type === opts.type) &&
      (!opts.published || isPublished(r)),
  );
}

export const publishedRelations = (): KgRelation[] => RELATIONS.filter(isPublished);

const DESIGNATION_BY_ID = new Map<string, Designation>(DESIGNATIONS.map((d) => [d.id, d]));

/** Official statuses of a place, published relations only, in the order of the register. */
export const designationsOf = (placeId: string): Designation[] =>
  relationsOf(`place:${placeId}`, { published: true, direction: 'from', type: 'hasDesignation' })
    .map((r) => DESIGNATION_BY_ID.get(r.to))
    .filter((d): d is Designation => !!d)
    .filter((d, i, all) => all.findIndex((x) => x.id === d.id) === i);

/** True when a published relation links the place to a World Heritage property (not the tentative list). */
export const isWorldHeritage = (placeId: string): boolean => designationsOf(placeId).some((d) => d.kind === 'whc');

/** Heritage items (monuments, museums) contained in a place page. */
export const heritageIn = (placeId: string): Heritage[] => HERITAGE.filter((h) => h.in.includes(`place:${placeId}` as EntityId));

/** Places of a road trip, as graph ids. */
export const tripPlaces = (tripId: string): EntityId[] =>
  (ITINERARIES.find((t) => t.id === tripId)?.stops ?? []).map((s) => `place:${s}` as EntityId);

export const MAX_FACTS_PER_PLACE = 5;

/**
 * Published facts about a place, as short sentences: the place's own relations, then those of the
 * heritage items it contains. Used by the assistant and llms.txt. At most 5 (implementation plan, step 7).
 */
export function facts(placeId: string, lang: Lang, max = MAX_FACTS_PER_PLACE): string[] {
  const ids = [`place:${placeId}`, ...heritageIn(placeId).map((h) => h.id)];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    for (const r of relationsOf(id, { published: true })) {
      const s = r.statement[lang];
      if (seen.has(s)) continue;
      seen.add(s);
      out.push(s);
    }
  }
  return out.slice(0, max);
}

/** Labels of a governorate for a place, in both languages. */
export const placeGovernorateLabels = (placeId: string): Labels | undefined => placeGovernorate(placeId)?.name;
