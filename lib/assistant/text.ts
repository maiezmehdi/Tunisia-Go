/** Text helpers for the travel assistant: accent-free tokens and typo-tolerant matching. */

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function tokenize(text: string): string[] {
  const n = normalize(text);
  return n ? n.split(' ') : [];
}

/** Optimal string alignment distance (Levenshtein plus swapped letters), stopping early above `max`. */
export function editDistance(a: string, b: string, max = 2): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
      rowMin = Math.min(rowMin, d[i][j]);
    }
    if (rowMin > max) return max + 1;
  }
  return d[a.length][b.length];
}

/** How many typos a word of this length may carry and still count. */
function tolerance(length: number): number {
  if (length >= 8) return 2;
  if (length >= 5) return 1;
  return 0;
}

/** True when the visitor's word is the keyword, a plural of it, or the keyword with a typo or two. */
export function similar(word: string, key: string): boolean {
  if (word === key) return true;
  if (key.length >= 4 && word.length >= 4 && (word.startsWith(key) || key.startsWith(word))) {
    return Math.abs(word.length - key.length) <= 2;
  }
  const tol = Math.min(tolerance(word.length), tolerance(key.length));
  return tol > 0 && editDistance(word, key, tol) <= tol;
}

/** A short root used to compare words loosely ("negocier", "negociation" → "negoc"). */
export function stem(word: string): string {
  return word.length > 5 ? word.slice(0, 5) : word;
}

export const STOPWORDS = new Set(
  (
    'le la les un une des du de d l au aux et ou en a dans sur pour par avec sans ce cet cette ces mon ma mes ton ta tes ' +
    'son sa ses notre nos votre vos leur leurs je tu il elle on nous vous ils elles me te se y est sont suis etre avoir ai ' +
    'as avez ont fait faire veux voudrais aimerais peux pouvez quel quelle quels quelles que qui quoi comment ou quand ' +
    'est ce pas ne plus tres bien bon bonne aussi alors donc mais si svp stp please the an of to in on for with ' +
    'without and or is are am be i you we they my your our can could would like want what which how where when do does ' +
    'some any me it this that there here go going about tell know'
  ).split(' '),
);
