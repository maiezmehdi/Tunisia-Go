import { readFileSync } from 'node:fs';
import { EVENTS } from '@/data/events';
import { GENERAL_GUIDE, GUIDE_BY_PLACE, regionGuides } from '@/data/regionGuides';
import { SEASONS } from '@/data/seasons';
import { GOVERNORATES } from '@/data/kg/governorates';
import { ITINERARIES, PLACES } from '@/data/tunisiaData';
import { festivalOf } from './events';
import { DESIGNATIONS, ENTITIES, FESTIVALS, HERITAGE, RELATIONS, SOURCES, get, isPublished, isWorldHeritage, placeGovernorate, source } from './index';

/**
 * Rules of `npm run kg:check` (LOT4-FINAL-ARCHITECTURE § 7). Each rule returns the list of its errors.
 * Pure function: no network, so it runs the same way locally, in the tests and in CI.
 */
export interface RuleResult {
  rule: string;
  errors: string[];
  /** Warnings do not fail the check. */
  warning?: true;
}

/** Slugs frozen at the start of Lot 4 (risk T1): a renamed place or road trip fails the check. */
const FROZEN = JSON.parse(readFileSync(new URL('../../tests/kg/fixtures/slugs.json', import.meta.url), 'utf8')) as {
  places: string[];
  trips: string[];
};
const SIX_MONTHS = 183 * 24 * 3600 * 1000;

const ID = /^[a-z]+:[a-z0-9][a-z0-9-]*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function runChecks(today = new Date()): RuleResult[] {
  const out: RuleResult[] = [];
  const rule = (name: string, errors: string[]) => out.push({ rule: name, errors });
  const warn = (name: string, errors: string[]) => out.push({ rule: name, errors, warning: true });

  // 1. Ids: unique, ASCII, prefixed.
  {
    const errors: string[] = [];
    const seen = new Set<string>();
    for (const e of ENTITIES) {
      if (!ID.test(e.id)) errors.push(`id invalide : ${e.id}`);
      if (seen.has(e.id)) errors.push(`id en double : ${e.id}`);
      seen.add(e.id);
    }
    const rel = new Set<string>();
    for (const r of RELATIONS) {
      if (!/^rel-\d{2,}$/.test(r.id)) errors.push(`id de relation invalide : ${r.id}`);
      if (rel.has(r.id)) errors.push(`relation en double : ${r.id}`);
      rel.add(r.id);
    }
    rule('1. Identifiants uniques et valides', errors);
  }

  // 2. Every place has a governorate (structural reference).
  rule(
    '2. Chaque lieu a son gouvernorat',
    PLACES.filter((p) => !placeGovernorate(p.id)).map((p) => `${p.id} : région « ${p.region} » sans gouvernorat`),
  );

  // 3. Structural references: trip stops, heritage containers, festival places.
  {
    const errors: string[] = [];
    for (const t of ITINERARIES) for (const s of t.stops) if (!get(`place:${s}`)) errors.push(`trip:${t.id} → place:${s} inconnu`);
    for (const h of HERITAGE) for (const p of h.in) if (!get(p)) errors.push(`${h.id} dans ${p} inconnu`);
    for (const f of FESTIVALS) if (!get(f.place)) errors.push(`${f.id} → ${f.place} inconnu`);
    for (const e of EVENTS) if (!get(`place:${e.placeId}`)) errors.push(`événement ${e.id} → place:${e.placeId} inconnu`);
    const guides = new Set([GENERAL_GUIDE, ...regionGuides('fr').map((g) => g.id)]);
    for (const [p, g] of Object.entries(GUIDE_BY_PLACE)) {
      if (!get(`place:${p}`)) errors.push(`GUIDE_BY_PLACE : place:${p} inconnu`);
      if (!guides.has(g)) errors.push(`GUIDE_BY_PLACE : cahier ${g} inconnu`);
    }
    if (GOVERNORATES.length !== 24) errors.push(`${GOVERNORATES.length} gouvernorats au lieu de 24`);
    rule('3. Références structurelles', errors);
  }

  // 4. Sources: every source code exists; each entity (except places, trips, festivals) has one.
  {
    const errors: string[] = [];
    for (const s of SOURCES) if (!DATE.test(s.consulted)) errors.push(`${s.id} : date de lecture invalide`);
    for (const e of ENTITIES) {
      for (const s of e.sources) if (!source(s)) errors.push(`${e.id} : source ${s} inconnue`);
      if (e.nameAr && !source(e.nameAr.source)) errors.push(`${e.id} : source du nom arabe inconnue`);
      if (!['place', 'trip', 'festival'].includes(e.kind ?? '') && e.sources.length === 0) errors.push(`${e.id} : aucune source`);
    }
    for (const d of DESIGNATIONS) if (d.date && (!d.dateSource || !source(d.dateSource))) errors.push(`${d.id} : date sans source`);
    for (const r of RELATIONS) {
      if (['established', 'partial'].includes(r.status) && r.sources.length === 0) errors.push(`${r.id} (${r.status}) sans source`);
      if (r.status === 'established' && r.sources.some((s) => source(s)?.level === 'secondary'))
        errors.push(`${r.id} établie sur une source secondaire`);
    }
    rule('4. Sources connues, présentes et de niveau suffisant', errors);
  }

  // 5. Relations: both ends exist (or are candidates), sources exist, dates valid.
  {
    const errors: string[] = [];
    for (const r of RELATIONS) {
      for (const end of [r.from, r.to]) if (!end.startsWith('candidate:') && !get(end)) errors.push(`${r.id} : ${end} inconnu`);
      for (const s of r.sources) if (!source(s)) errors.push(`${r.id} : source ${s} inconnue`);
      if (!DATE.test(r.checkedAt)) errors.push(`${r.id} : checkedAt invalide`);
      if (r.partOfRegister && !RELATIONS.some((x) => x.id === r.partOfRegister)) errors.push(`${r.id} : ${r.partOfRegister} inconnue`);
    }
    rule('5. Références des relations', errors);
  }

  // 6. Publication: a published relation is established, sourced, and never touches a candidate.
  {
    const errors: string[] = [];
    for (const r of RELATIONS.filter(isPublished)) {
      if (r.status !== 'established') errors.push(`${r.id} publiée avec le statut ${r.status}`);
      if (r.sources.length === 0) errors.push(`${r.id} publiée sans source`);
    }
    for (const r of RELATIONS) {
      if (r.status === 'established' && r.sources.length === 0) errors.push(`${r.id} établie sans source`);
      if (r.type === 'filmingLocationOf' && isPublished(r)) errors.push(`${r.id} : tournage publié`);
    }
    rule('6. Seules les relations établies sont publiées', errors);
  }

  // 7. Known register decisions that must never become public (2C and Mehdi's decisions of 17/11/2026).
  {
    const errors: string[] = [];
    const pub = RELATIONS.filter(isPublished);
    if (pub.some((r) => r.from === 'ich:01710' && r.to !== 'country:tn')) errors.push('harissa rattachée à autre chose que la Tunisie');
    if (pub.some((r) => r.type === 'partOf')) errors.push('relation partOf publiée sans preuve');
    if (pub.some((r) => r.type === 'componentOf')) errors.push('composante de bien publiée sans liste officielle lue');
    if (pub.some((r) => r.from === 'place:guellala' || r.to === 'place:guellala')) errors.push('musée de Guellala relié au musée AMVPPC');
    for (const id of ['souk-el-attarine', 'kairouan-souks'])
      if (isWorldHeritage(id)) errors.push(`${id} présenté comme bien du patrimoine mondial`);
    rule('7. Décisions du registre respectées', errors);
  }

  // 8. The `unesco` flag of the pages equals the published World Heritage designations.
  rule(
    '8. Mention UNESCO = statuts officiels',
    PLACES.filter((p) => !!p.unesco !== isWorldHeritage(p.id)).map(
      (p) => `${p.id} : unesco=${!!p.unesco} mais patrimoine mondial publié=${isWorldHeritage(p.id)}`,
    ),
  );

  // 9. Every fallback event has its festival.
  rule(
    '9. Chaque événement du fichier a son festival',
    EVENTS.filter((e) => !festivalOf({ id: e.id, placeId: e.placeId, titleFr: e.title.fr })).map((e) => `${e.id} sans festival`),
  );

  // 10. Frozen slugs (risk T1).
  {
    const errors: string[] = [];
    const places = new Set(PLACES.map((p) => p.id));
    const trips = new Set(ITINERARIES.map((t) => t.id));
    for (const p of FROZEN.places) if (!places.has(p)) errors.push(`lieu disparu ou renommé : ${p}`);
    for (const t of FROZEN.trips) if (!trips.has(t)) errors.push(`road trip disparu ou renommé : ${t}`);
    rule('10. Slugs des 95 lieux et des 20 road trips conservés', errors);
  }

  // Warnings.
  warn(
    'A. Sources lues il y a plus de 6 mois',
    SOURCES.filter((s) => today.getTime() - new Date(s.consulted).getTime() > SIX_MONTHS).map((s) => `${s.id} (${s.consulted})`),
  );
  warn(
    'B. Lieux sans saison (aucun mois inventé)',
    PLACES.filter((p) => !SEASONS[p.id]).map((p) => p.id),
  );

  return out;
}
