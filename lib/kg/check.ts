import { EVENTS } from '@/data/events';
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
}

const ID = /^[a-z]+:[a-z0-9][a-z0-9-]*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function runChecks(): RuleResult[] {
  const out: RuleResult[] = [];
  const rule = (name: string, errors: string[]) => out.push({ rule: name, errors });

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
    rule('4. Sources connues et présentes', errors);
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

  return out;
}
