import { DESIGNATIONS } from '@/data/kg/designations';
import { ICH } from '@/data/kg/ich';
import type { DesignationScheme, KgRelation } from '@/data/kg/types';
import { getCatalog } from '@/lib/i18n/catalog';
import { placePath } from '@/lib/placePages';
import { SITE_URL, localePath } from '@/lib/seo';
import { publishedRelations, source } from './index';
import { LLMS_BASE } from './llmsBase';

type Lang = 'fr' | 'en';

const ORDER: (DesignationScheme | 'ich')[] = ['whc', 'whc-tentative', 'ich', 'ramsar', 'biosphere', 'national-park'];
const HEADINGS: Record<Lang, Record<(typeof ORDER)[number], string>> = {
  fr: {
    whc: 'Patrimoine mondial de l’UNESCO',
    'whc-tentative': 'Liste indicative du patrimoine mondial (non inscrits)',
    ich: 'Patrimoine culturel immatériel (UNESCO)',
    ramsar: 'Zones humides Ramsar',
    biosphere: 'Réserves de biosphère (UNESCO)',
    'national-park': 'Parcs nationaux',
  },
  en: {
    whc: 'UNESCO World Heritage',
    'whc-tentative': 'World Heritage Tentative List (not inscribed)',
    ich: 'Intangible Cultural Heritage (UNESCO)',
    ramsar: 'Ramsar wetlands',
    biosphere: 'Biosphere reserves (UNESCO)',
    'national-park': 'National parks',
  },
};

const scheme = (r: KgRelation): (typeof ORDER)[number] | undefined =>
  r.type === 'ichPracticedIn' ? 'ich' : DESIGNATIONS.find((d) => d.id === r.to)?.kind;

/** Official page of the status, else the source of its date, else the first source of the relation with an address. */
const officialUrl = (r: KgRelation) => {
  const d = DESIGNATIONS.find((x) => x.id === r.to);
  return (
    d?.officialUrl ??
    (d?.dateSource && source(d.dateSource)?.url) ??
    ICH.find((i) => i.id === r.from)?.officialUrl ??
    r.sources.map((s) => source(s)?.url).find(Boolean)
  );
};

/**
 * « Statuts officiels » section of llms.txt, generated from the published relations of the graph
 * (status `established` only): one line per status, with the place page and the official page read.
 */
export function officialStatusesSection(lang: Lang): string {
  const catalog = getCatalog(lang);
  const rels = publishedRelations().filter((r) => r.type === 'hasDesignation' || r.type === 'ichPracticedIn');
  const lines: string[] = [lang === 'fr' ? '## Statuts officiels' : '## Official statuses', ''];
  lines.push(
    lang === 'fr'
      ? 'Générée depuis le graphe de connaissances du site : seuls les statuts vérifiés sur une source officielle sont listés.'
      : 'Generated from the site’s knowledge graph: only statuses checked against an official source are listed.',
  );
  for (const k of ORDER) {
    const group = rels.filter((r) => scheme(r) === k);
    if (!group.length) continue;
    lines.push('', `### ${HEADINGS[lang][k]}`);
    for (const r of group) {
      const placeKey = [r.from, r.to].find((e) => e.startsWith('place:'))?.slice(6);
      const place = placeKey ? catalog.placeById[placeKey] : undefined;
      const url = officialUrl(r);
      const src = url ? ` (source: ${url})` : '';
      lines.push(
        place
          ? `- [${place.name}](${SITE_URL}${localePath(placePath(place.id), lang)}): ${r.statement[lang]}${src}`
          : `- ${r.statement[lang]}${src}`,
      );
    }
  }
  return lines.join('\n');
}

/** Full llms.txt: the hand-written presentation, then the generated sections in French and English. */
export function llmsTxt(): string {
  return `${LLMS_BASE.trimEnd()}\n\n${officialStatusesSection('fr')}\n\n${officialStatusesSection('en')}\n`;
}
