import { regionGuides } from '@/data/regionGuides';
import { LEXICON } from '@/data/lexicon';
import { generate, type GeminiTurn } from '@/lib/gemini';
import { getCatalog } from '@/lib/i18n/catalog';
import type { Locale } from '@/lib/i18n/config';

import { tokenize } from './text';

/** One page of the site the assistant is allowed to talk about. */
interface Source {
  /** `p:id` place, `i:id` road trip, `g:id` regional guide, `w:id` words. */
  ref: string;
  title: string;
  text: string;
  /** Lower-cased tokens used for ranking. */
  tokens: Set<string>;
  titleTokens: Set<string>;
}

const cache: Partial<Record<Locale, Source[]>> = {};

function source(ref: string, title: string, text: string): Source {
  return { ref, title, text, tokens: new Set(tokenize(`${title} ${text}`)), titleTokens: new Set(tokenize(title)) };
}

function sources(locale: Locale): Source[] {
  if (cache[locale]) return cache[locale]!;
  const { places, itineraries } = getCatalog(locale);
  const list: Source[] = [];
  for (const p of places) {
    list.push(
      source(
        `p:${p.id}`,
        `${p.name} (${p.region})`,
        [p.tagline, p.description, p.didYouKnow, p.visitDuration].filter(Boolean).join(' '),
      ),
    );
  }
  for (const it of itineraries) {
    const stops = it.stops
      .map((id) => getCatalog(locale).placeById[id]?.name)
      .filter(Boolean)
      .join(', ');
    list.push(source(`i:${it.id}`, it.name, `${it.tagline} ${it.description} ${it.days} jours/days. Stops: ${stops}.`));
  }
  for (const g of regionGuides(locale)) {
    list.push(
      source(`g:${g.id}`, g.title, `${g.covers ?? ''} ${g.notes.map((n) => `${n.title}: ${n.text}`).join(' ')}`),
    );
  }
  for (const group of LEXICON) {
    list.push(
      source(
        `w:${group.id}`,
        group.title[locale],
        group.words
          .map((w) => `${w.latin} (${w.ar}) = ${w.meaning[locale]}${w.tip ? `. ${w.tip[locale]}` : ''}`)
          .join('; '),
      ),
    );
  }
  return (cache[locale] = list);
}

/** The few pages that best match the question (and the last turns, so follow-ups still work). */
function retrieve(query: string, locale: Locale, limit = 6): Source[] {
  const words = tokenize(query).filter((w) => w.length > 2);
  if (!words.length) return [];
  const scored = sources(locale).map((s) => {
    let score = 0;
    for (const w of words) {
      if (s.titleTokens.has(w)) score += 4;
      else if (s.tokens.has(w)) score += 1;
    }
    return { s, score };
  });
  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.s);
}

export interface AssistantAnswer {
  text: string;
  places: string[];
  itinerary?: string;
}

const PER_SOURCE = 900;

/** One line per place and road trip: lets the assistant recommend from the whole catalogue, not only from the pages that matched. */
function overview(locale: Locale): { text: string; refs: Set<string> } {
  const { places, itineraries, placeById } = getCatalog(locale);
  const refs = new Set<string>();
  const lines: string[] = [];
  for (const p of places) {
    refs.add(`p:${p.id}`);
    lines.push(`p:${p.id} | ${p.name} | ${p.region} | ${p.tagline}`);
  }
  for (const it of itineraries) {
    refs.add(`i:${it.id}`);
    const stops = it.stops
      .map((id) => placeById[id]?.name)
      .filter(Boolean)
      .join(', ');
    lines.push(`i:${it.id} | ${it.name} | ${it.days} ${locale === 'fr' ? 'jours' : 'days'} | ${stops}`);
  }
  return { text: lines.join('\n'), refs };
}

function system(locale: Locale, context: Source[], plan: string[] | undefined): string {
  const lang = locale === 'fr' ? 'French' : 'English';
  const docs = context.length
    ? context.map((s) => `[${s.ref}] ${s.title}\n${s.text.slice(0, PER_SOURCE)}`).join('\n\n')
    : '(no detailed page matches this message)';
  const { placeById } = getCatalog(locale);
  const planNames = (plan ?? []).map((id) => placeById[id]?.name).filter(Boolean);
  return [
    'You are the travel partner of Tunisia Go, an independent travel guide to Tunisia. You are the visitor\'s only point of contact: you talk with them, understand what they really want, and decide what to suggest. You are not a menu and not a search box.',
    `Answer in ${lang} (or in the visitor\'s language if they write in another one), in a warm, natural voice, like a friend who knows the country well.`,
    'Understand every message the way a person would: typos, slang, Arabic or franglais words, half sentences, and follow-ups like "and in winter?" or "the second one" (use the conversation). Take the initiative: if you can propose something good, propose it. When the request is too open to answer well, give a first useful suggestion AND ask one short question to refine it (days, season, region, who travels). Never answer with a list of menu options.',
    'Be concise: 2 to 6 short sentences, no markdown, no emoji, no title. Recommend by name. Compare options and say which one you would pick and why.',
    'Facts: every specific fact (distance, price, date, opening hour, name, number) must come from the CATALOGUE and PAGES below. Never invent one. For general sense (what to pack, how to pace a trip, how to combine places) you may reason freely. If a detail is not on the site, say so simply and offer what the site does cover.',
    'Never claim to have booked or checked anything. No medical, legal or safety guarantees.',
    planNames.length
      ? `The site has just built this ordered plan for the visitor, shown under your message as cards: ${planNames.join(' > ')}. Introduce it in your own words (why this route, how to pace it). Do not repeat the whole list.`
      : '',
    'On the very last line, write SOURCES: followed by the refs (p:..., i:...) of the places and road trips you recommend or rely on, separated by commas (for example SOURCES: p:douz,i:ksour-route). At most 3 places and 1 road trip. Write SOURCES: none if you used none.',
    '',
    'CATALOGUE (ref | name | region or duration | tagline or stops):',
    overview(locale).text,
    '',
    'PAGES (details for this question):',
    docs,
  ]
    .filter((l, i, all) => l !== '' || all[i - 1] !== '')
    .join('\n');
}

export async function answer(input: {
  question: string;
  history: GeminiTurn[];
  locale: Locale;
  plan?: string[];
}): Promise<AssistantAnswer> {
  const recent = input.history.filter((t) => t.role === 'user').slice(-3);
  const context = retrieve([...recent.map((t) => t.text), input.question].join(' '), input.locale, 8);
  const out = await generate({
    system: system(input.locale, context, input.plan),
    turns: [...input.history, { role: 'user', text: input.question }],
    temperature: 0.6,
    maxOutputTokens: 800,
    timeoutMs: 20000,
  });
  const match = out.match(/\n?\s*SOURCES:\s*(.*)\s*$/i);
  const text = (match ? out.slice(0, match.index) : out).trim();
  const refs = new Set((match?.[1] ?? '').split(/[,\s]+/).filter(Boolean));
  const allowed = overview(input.locale).refs;
  const used = [...refs].filter((r) => allowed.has(r));
  return {
    text: text.slice(0, 1400),
    places: used
      .filter((r) => r.startsWith('p:'))
      .map((r) => r.slice(2))
      .slice(0, 3),
    itinerary: used.find((r) => r.startsWith('i:'))?.slice(2),
  };
}
