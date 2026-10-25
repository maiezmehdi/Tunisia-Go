/**
 * Rewrites a short text with Google Gemini (server side only: the key never reaches the browser).
 * GEMINI_API_KEY comes from the environment; GEMINI_MODEL can override the default model.
 */
export const REWRITE_MAX_CHARS = 2000;

const DEFAULT_MODEL = 'gemini-2.5-flash';

export type RewriteKind = 'place' | 'trip';

export function geminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

function instructions(lang: 'fr' | 'en', kind: RewriteKind, name: string): string {
  const language = lang === 'fr' ? 'French' : 'English';
  const subject = kind === 'trip' ? 'a road trip in Tunisia' : 'a place in Tunisia';
  return [
    `You edit the text of a Tunisia travel site. The text describes ${subject}${name ? ` called "${name}"` : ''}.`,
    `Rewrite it in clear, natural, correct ${language}, in a sober and warm tone.`,
    'Keep every fact of the original and add none: no invented date, number, name, price, opening hour or claim.',
    'If the original is vague, stay vague. Fix spelling, grammar and awkward phrasing; split long sentences.',
    'For search engines, use the real place or trip name and its region naturally where the original already allows it, and prefer concrete words over filler. Never stuff keywords.',
    'Plain text only: no markdown, no emoji, no quotation marks around the answer, no title.',
    'Keep roughly the same length (at most 30% longer). Answer with the rewritten text only.',
  ].join('\n');
}

/** Returns the rewritten text, or throws. */
export async function rewriteText(input: {
  text: string;
  lang: 'fr' | 'en';
  kind: RewriteKind;
  name?: string;
}): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('not_configured');
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: instructions(input.lang, input.kind, input.name?.trim() ?? '') }] },
      contents: [{ role: 'user', parts: [{ text: input.text }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 1200 },
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`gemini ${res.status}`);
  const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const out = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? '')
    .join('')
    .trim();
  if (!out) throw new Error('empty');
  return out.slice(0, REWRITE_MAX_CHARS);
}
