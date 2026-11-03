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

function system(locale: Locale, context: Source[]): string {
  const lang = locale === 'fr' ? 'French' : 'English';
  const docs = context.length
    ? context.map((s) => `[${s.ref}] ${s.title}\n${s.text.slice(0, PER_SOURCE)}`).join('\n\n')
    : '(no page matches this question)';
  return [
    'You are the travel assistant of Tunisia Go, an independent travel guide to Tunisia. You talk with visitors preparing a trip.',
    `Answer in ${lang}, in a warm, natural, conversational voice, like a friend who knows the country well. Be concise: 2 to 5 short sentences, no lists unless asked, no markdown, no emoji, no title.`,
    'Use ONLY the pages below. Never add a fact, price, date, hour, distance or name that is not in them. If the pages do not answer, say so simply and suggest what the site does cover; do not guess.',
    'Never claim to have booked or checked anything. Do not give medical, legal or safety guarantees.',
    'If the visitor writes in another language, answer in their language.',
    'On the very last line, write SOURCES: followed by the refs of the pages you actually used, separated by commas (for example SOURCES: p:douz,i:grand-sud). Write SOURCES: none if you used none.',
    '',
    'PAGES:',
    docs,
  ].join('\n');
}

export async function answer(input: {
  question: string;
  history: GeminiTurn[];
  locale: Locale;
}): Promise<AssistantAnswer> {
  const recent = input.history.filter((t) => t.role === 'user').slice(-2);
  const context = retrieve([...recent.map((t) => t.text), input.question].join(' '), input.locale);
  const out = await generate({
    system: system(input.locale, context),
    turns: [...input.history, { role: 'user', text: input.question }],
    temperature: 0.5,
    maxOutputTokens: 600,
    timeoutMs: 20000,
  });
  const match = out.match(/\n?\s*SOURCES:\s*(.*)\s*$/i);
  const text = (match ? out.slice(0, match.index) : out).trim();
  const refs = new Set((match?.[1] ?? '').split(/[,\s]+/).filter(Boolean));
  const allowed = new Set(context.map((s) => s.ref));
  const used = [...refs].filter((r) => allowed.has(r));
  return {
    text: text.slice(0, 1200),
    places: used
      .filter((r) => r.startsWith('p:'))
      .map((r) => r.slice(2))
      .slice(0, 3),
    itinerary: used.find((r) => r.startsWith('i:'))?.slice(2),
  };
}
