/**
 * Rewrites a short text with Google Gemini (server side only: the key never reaches the browser).
 * GEMINI_API_KEY comes from the environment; GEMINI_MODEL can override the default model.
 */
export const REWRITE_MAX_CHARS = 2000;

/** The alias follows the current Flash-Lite model (fast, no long thinking), so it does not break when a version is retired. */
const DEFAULT_MODEL = 'gemini-flash-lite-latest';
const API = 'https://generativelanguage.googleapis.com/v1beta';

/** Asks the API which Flash model this key can use; used only when the chosen model answers 404. */
async function findFlashModel(key: string): Promise<string | null> {
  const res = await fetch(`${API}/models?pageSize=200`, {
    headers: { 'x-goog-api-key': key },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { models?: { name?: string; supportedGenerationMethods?: string[] }[] };
  const names = (data.models ?? [])
    .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
    .map((m) => (m.name ?? '').replace(/^models\//, ''))
    .filter((n) => /^gemini-[\d.]+-flash(-lite)?$/.test(n))
    // Lite first (fast), then the newest version.
    .sort(
      (a, b) =>
        Number(b.endsWith('-lite')) - Number(a.endsWith('-lite')) || b.localeCompare(a, 'en', { numeric: true }),
    );
  return names[0] ?? null;
}

let foundModel: string | null = null;

export type RewriteKind = 'place' | 'trip' | 'bio';

export function geminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

function instructions(kind: RewriteKind, name: string): string {
  const subject =
    kind === 'trip'
      ? 'a road trip in Tunisia'
      : kind === 'bio'
        ? 'a tour guide or a travel agency in Tunisia, written by that person'
        : 'a place in Tunisia';
  return [
    `You edit the text of a Tunisia travel site. The text describes ${subject}${name ? ` called "${name}"` : ''}.`,
    'Rewrite it in clear, natural, correct language, in a sober and warm tone. Keep the language of the original text (French stays French, English stays English): never translate.',
    'Keep every fact of the original and add none: no invented date, number, name, price, opening hour or claim.',
    'If the original is vague, stay vague. Fix spelling, grammar and awkward phrasing; split long sentences.',
    'For search engines, use the real place or trip name and its region naturally where the original already allows it, and prefer concrete words over filler. Never stuff keywords.',
    'Plain text only: no markdown, no emoji, no quotation marks around the answer, no title.',
    'Keep roughly the same length (at most 30% longer). Answer with the rewritten text only.',
  ].join('\n');
}

/** Returns the rewritten text, or throws. */
export async function rewriteText(input: { text: string; kind: RewriteKind; name?: string }): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('not_configured');
  const call = (model: string) =>
    fetch(`${API}/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instructions(input.kind, input.name?.trim() ?? '') }] },
        contents: [{ role: 'user', parts: [{ text: input.text }] }],
        generationConfig: {
          temperature: 0.3,
          // Thinking models count their thinking against this limit.
          maxOutputTokens: 4000,
          ...(model.startsWith('gemini-2.5-flash') ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
        },
      }),
      signal: AbortSignal.timeout(30000),
    });

  let model = process.env.GEMINI_MODEL || foundModel || DEFAULT_MODEL;
  let res = await call(model);
  if (res.status === 404) {
    const found = await findFlashModel(key);
    if (found && found !== model) {
      console.warn(`gemini: model ${model} not found, using ${found}`);
      foundModel = model = found;
      res = await call(model);
    }
  }
  if (!res.ok) throw new Error(`gemini ${res.status}: ${(await res.text().catch(() => '')).slice(0, 300)}`);
  const data = (await res.json()) as {
    candidates?: { finishReason?: string; content?: { parts?: { text?: string }[] } }[];
  };
  const out = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? '')
    .join('')
    .trim();
  if (!out) throw new Error(`empty answer (${data.candidates?.[0]?.finishReason ?? 'no candidate'})`);
  return out.slice(0, REWRITE_MAX_CHARS);
}
