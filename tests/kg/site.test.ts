import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { EVENTS } from '@/data/events';
import { agenciesFor } from '@/data/agencies';
import { ITINERARIES, PLACES } from '@/data/tunisiaData';
import { getCatalog } from '@/lib/i18n/catalog';
import { RELATIONS, isPublished } from '@/lib/kg';
import { llmsTxt, officialStatusesSection } from '@/lib/kg/llms';
import { LLMS_BASE } from '@/lib/kg/llmsBase';
import { PAGE_REGIONS, hasRegionPage, regionPath } from '@/lib/regionPages';
import { eventsData, exploreData, placePageData, siteData, tripPageData } from '@/lib/structuredData';
import { breadcrumbs, sitemapUrls } from './snapshot';

const fixture = (name: string) => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'));
const unpublished = RELATIONS.filter((r) => !isPublished(r)).flatMap((r) => [r.statement.fr, r.statement.en]);

test('sitemap : même liste d’URL qu’avant le Lot 4 (même nombre, mêmes chemins, FR et EN)', () => {
  const before: string[] = fixture('sitemap-urls.json');
  assert.deepEqual(sitemapUrls(), before);
  assert.equal(before.filter((u) => u.includes('/en')).length * 2, before.length);
});

test('pages région : slugs inchangés, Kébili trouvée en français comme en anglais', () => {
  assert.deepEqual(
    PAGE_REGIONS.map((r) => r.slug),
    PAGE_REGIONS.map((r) => regionPath(r.region).replace('/que-voir/', '')),
  );
  assert.ok(hasRegionPage('Kébili') && hasRegionPage('Kebili'));
  assert.equal(regionPath('Kébili'), '/que-voir/kebili');
  assert.equal(PAGE_REGIONS.find((r) => r.slug === 'kebili')?.name.fr, 'Kébili');
  for (const r of PAGE_REGIONS) assert.ok(r.gov, r.region);
});

test('agences ONTT : le nom français du gouvernorat trouve les mêmes agences que le nom anglais', () => {
  assert.equal(agenciesFor('Kébili')?.agencies.length, agenciesFor('Kebili')?.agencies.length);
  assert.ok((agenciesFor('Kébili')?.agencies.length ?? 0) > 0);
  assert.equal(agenciesFor('Médenine')?.region, 'djerba-zarzis');
});

test('fil d’Ariane JSON-LD : seules les 4 fiches de Kébili changent, en français', () => {
  const before: Record<string, string[]> = fixture('breadcrumbs.before.json');
  const after = breadcrumbs();
  const changed = Object.keys(before).filter((k) => JSON.stringify(before[k]) !== JSON.stringify(after[k])).sort();
  assert.deepEqual(changed, ['fr:camping-douz', 'fr:chott-el-jerid', 'fr:douz', 'fr:jebil']);
  assert.ok(after['fr:douz'].includes('Kébili <https://www.tunisiagoo.com/que-voir/kebili>'));
});

test('JSON-LD lieu : @id unique FR/EN, gouvernorat puis pays, statuts publiés seulement', () => {
  const fr = getCatalog('fr').placeById;
  const en = getCatalog('en').placeById;
  for (const p of PLACES) {
    const a = placePageData(fr[p.id], [], 'fr')[0] as Record<string, any>;
    const b = placePageData(en[p.id], [], 'en')[0] as Record<string, any>;
    assert.equal(a['@id'], `https://www.tunisiagoo.com/lieux/${p.id}#place`);
    assert.equal(a['@id'], b['@id']);
    assert.notEqual(a.url, b.url);
    assert.equal(a.containedInPlace['@type'], 'AdministrativeArea');
    assert.equal(a.containedInPlace['@id'], b.containedInPlace['@id']);
    assert.equal(a.containedInPlace.containedInPlace['@id'], 'https://www.tunisiagoo.com/#country-tn');
    assert.equal(a.containedInPlace.containedInPlace.name, 'Tunisie');
    assert.equal(b.containedInPlace.containedInPlace.name, 'Tunisia');
    assert.equal(!!a.subjectOf, !!b.subjectOf, p.id);
    assert.equal(a.founder, undefined);
  }
  const kairouan = placePageData(fr.kairouan, [], 'fr')[0] as Record<string, any>;
  assert.deepEqual(kairouan.subjectOf, [{ '@type': 'WebPage', name: 'Kairouan', url: 'https://whc.unesco.org/en/list/499/' }]);
  assert.deepEqual(
    kairouan.containsPlace.map((h: { '@type': string }) => h['@type']),
    ['Mosque', 'LandmarksOrHistoricalBuildings'],
  );
  const douz = placePageData(fr.douz, [], 'fr')[0] as Record<string, any>;
  assert.equal(douz.containedInPlace.name, 'Kébili');
  assert.equal(douz.containedInPlace.url, 'https://www.tunisiagoo.com/que-voir/kebili');
  const souk = placePageData(fr['souk-el-attarine'], [], 'fr')[0] as Record<string, any>;
  assert.equal(souk.subjectOf, undefined);
});

test('JSON-LD : aucune relation non établie, pas de LinkedIn, road trips avec @id', () => {
  const fr = getCatalog('fr');
  const all = JSON.stringify([
    ...PLACES.flatMap((p) => placePageData(fr.placeById[p.id], [], 'fr')),
    exploreData(fr.places, fr.itineraries, {}, 'fr'),
    siteData('fr'),
  ]);
  for (const s of unpublished) assert.ok(!all.includes(s), s);
  for (const w of ['Gladiator', 'Chabbat', 'Elyssa', 'Guellala\\u']) assert.ok(!all.includes(w), w);
  assert.ok(!all.includes('linkedin.com'));
  const trip = tripPageData(ITINERARIES[0], [], 'en')[0] as Record<string, any>;
  assert.equal(trip['@id'], `https://www.tunisiagoo.com/road-trips/${ITINERARIES[0].id}#trip`);
  const explore = exploreData(fr.places, fr.itineraries, {}, 'en') as Record<string, any>[];
  assert.ok(explore.slice(1).every((t) => t['@id'].endsWith('#trip')));
  assert.ok(!JSON.stringify(explore[0]).includes('containedInPlace'), '/explore ne reçoit pas les nœuds du graphe');
});

test('JSON-LD événements : location par @id du lieu, superEvent vers le festival', () => {
  const places = new Map(getCatalog('fr').places.map((p) => [p.id, p]));
  const data = eventsData(EVENTS, places, 'fr') as Record<string, any>[];
  assert.ok(data.length > 0);
  for (const e of data) {
    assert.match(e.location['@id'], /^https:\/\/www\.tunisiagoo\.com\/lieux\/[a-z0-9-]+#place$/);
    assert.match(e.superEvent['@id'], /#festival-/);
    assert.equal(e.superEvent['@type'], 'EventSeries');
  }
});

test('llms.txt : texte d’origine conservé, section générée FR et EN, rien de non publié', () => {
  const txt = llmsTxt();
  assert.ok(txt.startsWith(LLMS_BASE.trimEnd()));
  const fr = officialStatusesSection('fr');
  const en = officialStatusesSection('en');
  assert.ok(fr.startsWith('## Statuts officiels') && en.startsWith('## Official statuses'));
  assert.equal(fr.split('\n- ').length, en.split('\n- ').length);
  for (const s of unpublished) assert.ok(!txt.includes(s), s);
  assert.ok(!/Nabeul\]/.test(fr), 'harissa jamais rattachée à Nabeul');
  assert.ok(!/attarine|kairouan-souks/i.test(txt));
  assert.equal((fr.match(/patrimoine mondial de l’UNESCO.*\(bien n° \d+/g) ?? []).length, 10);
});
