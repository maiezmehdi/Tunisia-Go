import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { EVENTS } from '@/data/events';
import { ITINERARIES, PLACES } from '@/data/tunisiaData';
import { getCatalog } from '@/lib/i18n/catalog';
import { runChecks } from '@/lib/kg/check';
import { compareEventSources, festivalOf, type EventSourceRow } from '@/lib/kg/events';
import {
  GOVERNORATES,
  RELATIONS,
  designationsOf,
  facts,
  get,
  governorateByName,
  isPublished,
  isWorldHeritage,
  placeGovernorate,
  publishedRelations,
  relationsOf,
} from '@/lib/kg';

const fixture = (name: string) => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'));

test('kg:check : toutes les règles passent', () => {
  for (const r of runChecks()) assert.deepEqual(r.errors, [], r.rule);
});

test('24 gouvernorats, clés ASCII, arabe toujours sourcé', () => {
  assert.equal(GOVERNORATES.length, 24);
  for (const g of GOVERNORATES) {
    assert.match(g.id, /^gov:[a-z-]+$/);
    if (g.nameAr) assert.ok(g.nameAr.source, g.id);
  }
});

test('chaque Place.region trouve son gouvernorat (22 sur 22), en anglais comme en français', () => {
  const regions = new Set(PLACES.map((p) => p.region));
  assert.equal(regions.size, 22);
  for (const r of regions) assert.ok(governorateByName(r), r);
  for (const p of getCatalog('fr').places) assert.equal(governorateByName(p.region)?.id, placeGovernorate(p.id)?.id, p.id);
  assert.equal(placeGovernorate('douz')?.id, 'gov:kebili');
  assert.equal(governorateByName('Kébili')?.id, 'gov:kebili');
  assert.equal(governorateByName('Le Kef')?.id, 'gov:kef');
});

test('les 95 slugs de lieux et les 20 road trips sont figés', () => {
  const slugs = fixture('slugs.json');
  assert.deepEqual(PLACES.map((p) => p.id), slugs.places);
  assert.deepEqual(ITINERARIES.map((t) => t.id), slugs.trips);
  assert.equal(slugs.places.length, 95);
  assert.equal(slugs.trips.length, 20);
});

test('les 75 relations du registre sont présentes, avec leur statut', () => {
  for (let i = 1; i <= 75; i++) assert.ok(RELATIONS.some((r) => r.id === `rel-${String(i).padStart(2, '0')}`), `rel-${i}`);
  const status = (id: string) => RELATIONS.find((r) => r.id === id)?.status;
  assert.equal(status('rel-44'), 'contradicted');
  assert.equal(status('rel-67'), 'refuted');
  assert.equal(status('rel-12'), 'unverified');
  assert.equal(status('rel-17'), 'partial');
});

test('relationsOf(…, { published: true }) ne renvoie que des relations établies', () => {
  for (const e of ['place:carthage', 'place:el-jem', 'place:tozeur', 'place:monastir', 'place:nabeul', 'place:guellala', 'place:ichkeul']) {
    for (const r of relationsOf(e, { published: true })) assert.equal(r.status, 'established', r.id);
  }
  for (const r of publishedRelations()) {
    assert.equal(r.status, 'established');
    assert.ok(!r.from.startsWith('candidate:') && !r.to.startsWith('candidate:'));
    assert.ok(get(r.from) && get(r.to), r.id);
  }
});

test('relations jamais publiques : tournages, légendes, Guellala, harissa → Nabeul, souks', () => {
  const pub = publishedRelations();
  assert.ok(!pub.some((r) => r.type === 'filmingLocationOf'));
  assert.ok(!pub.some((r) => r.status !== 'established'));
  assert.ok(!pub.some((r) => r.to === 'place:nabeul' && r.from === 'ich:01710'));
  assert.ok(!pub.some((r) => r.id === 'rel-42'), 'rel-42 est un texte, pas une relation');
  for (const id of ['rel-24', 'rel-28', 'rel-32', 'rel-35', 'rel-39', 'rel-44', 'rel-55', 'rel-57', 'rel-67'])
    assert.ok(!isPublished(RELATIONS.find((r) => r.id === id)!), id);
  assert.equal(isWorldHeritage('souk-el-attarine'), false);
  assert.equal(isWorldHeritage('kairouan-souks'), false);
});

test('statuts officiels : 10 biens du patrimoine mondial, liste indicative distincte', () => {
  const whc = PLACES.filter((p) => isWorldHeritage(p.id)).map((p) => p.id).sort();
  assert.deepEqual(whc, ['carthage', 'djerba', 'dougga', 'el-jem', 'ichkeul', 'kairouan', 'kerkouane', 'medina-tunis', 'sidi-bou-said', 'sousse-medina']);
  assert.equal(isWorldHeritage('table-de-jugurtha'), false);
  assert.deepEqual(designationsOf('table-de-jugurtha').map((d) => d.kind), ['whc-tentative']);
  // Biosphere status of Ichkeul (rel-21) stays partial: not published.
  assert.deepEqual(designationsOf('ichkeul').map((d) => d.id).sort(), ['designation:ramsar-213', 'designation:whc-8']);
  for (const p of PLACES) assert.equal(!!p.unesco, isWorldHeritage(p.id), p.id);
});

test('faits : au plus 5 par lieu, seulement des énoncés publiés, en FR et en EN', () => {
  const published = new Set(publishedRelations().flatMap((r) => [r.statement.fr, r.statement.en]));
  for (const p of PLACES) {
    const fr = facts(p.id, 'fr');
    const en = facts(p.id, 'en');
    assert.ok(fr.length <= 5 && en.length === fr.length, p.id);
    for (const s of [...fr, ...en]) assert.ok(published.has(s), s);
  }
  assert.ok(facts('monastir', 'fr').some((s) => s.includes('Harthama')));
  assert.ok(!facts('tozeur', 'fr').some((s) => /Chabbat/.test(s)));
  assert.ok(!facts('el-jem', 'en').some((s) => /Gladiator/.test(s)));
  assert.ok(facts('nabeul', 'fr').length === 0);
});

test('événements : chaque fiche a son festival, écarts Supabase/fichier détectés', () => {
  for (const e of EVENTS) assert.ok(festivalOf({ id: e.id, placeId: e.placeId, titleFr: e.title.fr }), e.id);
  const rows: EventSourceRow[] = fixture('events-supabase-2026-11-17.json');
  assert.deepEqual(compareEventSources(rows, EVENTS), []);
  const changed = rows.map((r) => (r.place_id === 'douz' ? { ...r, start_date: '2026-12-20' } : r));
  assert.equal(compareEventSources(changed, EVENTS).length, 1);
  assert.equal(compareEventSources([...rows, { ...rows[0], id: 'x', title_fr: 'Autre festival' }], EVENTS).length, 1);
});
