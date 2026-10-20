/**
 * Picks the most natural voice the browser offers for a language. Without this the browser
 * falls back to its default voice, often robotic and sometimes in the wrong language.
 */

// Voices worth having, best first. Names differ between Chrome, Safari, Edge and Android.
const GOOD = [/natural/i, /neural/i, /premium/i, /enhanced|amélioré/i, /google/i, /siri/i];
const NAMED: Record<string, RegExp> = {
  fr: /amélie|audrey|aurélie|thomas|marie|denise|henri|vivienne|eloise|julie|paul/i,
  en: /serena|daniel|kate|oliver|samantha|ava|allison|libby|sonia|ryan|jenny|aria|guy/i,
};
// Novelty voices that ship with macOS.
const NOVELTY =
  /albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|grandma|grandpa|eddy|flo|reed|rocko|sandy|shelley/i;

function score(voice: SpeechSynthesisVoice, lang: string): number {
  const want = lang.toLowerCase();
  const has = voice.lang.toLowerCase().replace('_', '-');
  if (!has.startsWith(want.slice(0, 2))) return -1;
  if (NOVELTY.test(voice.name)) return -1;
  let s = has === want ? 20 : 10;
  const good = GOOD.findIndex((r) => r.test(voice.name));
  if (good >= 0) s += 60 - good * 6;
  if (NAMED[want.slice(0, 2)]?.test(voice.name)) s += 15;
  if (!voice.localService) s += 4; // cloud voices (Chrome's Google ones) usually sound better
  return s;
}

export function bestVoice(lang: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  let best: SpeechSynthesisVoice | null = null;
  let top = -1;
  for (const v of window.speechSynthesis.getVoices()) {
    const s = score(v, lang);
    if (s > top) {
      top = s;
      best = v;
    }
  }
  return best;
}

/** Splits text into sentences: Chrome cuts long utterances off after about 15 seconds. */
export function sentences(text: string): string[] {
  return (text.match(/[^.!?…]+[.!?…]+["»”’)]*\s*|[^.!?…]+$/g) ?? [text]).map((s) => s.trim()).filter(Boolean);
}
