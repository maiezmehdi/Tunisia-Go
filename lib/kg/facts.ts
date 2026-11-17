import type { KgSource } from '@/data/kg/types';
import { MAX_FACTS_PER_PLACE, heritageIn, relationsOf, source } from './index';

type Lang = 'fr' | 'en';

export interface Fact {
  text: string;
  /** The sources of the relation, in the order of the register. */
  sources: KgSource[];
}

/**
 * Published facts about a place with their sources (LOT4-FINAL-ARCHITECTURE § 7): official statuses,
 * heritage items, builders or dynasties. Only relations with status `established` (lib/kg `isPublished`);
 * secondary, attributed or unverified relations never reach the assistant or llms.txt. At most 5.
 */
export function placeFacts(placeId: string, lang: Lang, max = MAX_FACTS_PER_PLACE): Fact[] {
  const ids = [`place:${placeId}`, ...heritageIn(placeId).map((h) => h.id)];
  const seen = new Set<string>();
  const out: Fact[] = [];
  for (const id of ids) {
    for (const r of relationsOf(id, { published: true })) {
      const text = r.statement[lang];
      if (seen.has(text)) continue;
      seen.add(text);
      const sources = r.sources
        .map((s) => source(s))
        .filter((s): s is KgSource => !!s);
      out.push({ text, sources });
    }
  }
  return out.slice(0, max);
}

/** One line per fact, with the name of its first source: what the assistant receives. */
export function factsText(placeId: string, lang: Lang): string {
  const facts = placeFacts(placeId, lang);
  if (!facts.length) return '';
  const [head, via] = lang === 'fr' ? ['Faits vérifiés :', 'source :'] : ['Verified facts:', 'source:'];
  return `${head} ${facts.map((f) => (f.sources[0] ? `${f.text} (${via} ${f.sources[0].label})` : f.text)).join(' ')}`;
}
