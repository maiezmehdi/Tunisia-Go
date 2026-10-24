import type { Word, WordGroup } from '@/data/lexicon';
import { LEXICON } from '@/data/lexicon';
import { selectRows, supabaseConfig } from '@/lib/supabase';

export const LEXICON_TAG = 'lexicon';

export interface LexiconRow {
  id: string;
  created_at: string;
  group_id: string;
  latin: string;
  ar: string;
  meaning_fr: string;
  meaning_en: string;
  tip_fr: string | null;
  tip_en: string | null;
}

function wordOf(r: LexiconRow): Word {
  return {
    id: `x-${r.id}`,
    latin: r.latin,
    ar: r.ar,
    meaning: { fr: r.meaning_fr, en: r.meaning_en },
    ...(r.tip_fr || r.tip_en ? { tip: { fr: r.tip_fr ?? r.tip_en ?? '', en: r.tip_en ?? r.tip_fr ?? '' } } : {}),
  };
}

/** The built-in groups plus the words added from /admin; the built-in lexicon alone when Supabase is missing. */
export async function loadLexicon(): Promise<WordGroup[]> {
  const cfg = supabaseConfig();
  if (!cfg) return LEXICON;
  const rows = await selectRows<LexiconRow>(cfg, 'lexicon_words', 'select=*&order=created_at.asc&limit=300', {
    revalidate: 3600,
    tags: [LEXICON_TAG],
  }).catch(() => [] as LexiconRow[]);
  if (rows.length === 0) return LEXICON;
  return LEXICON.map((g) => {
    const extra = rows.filter((r) => r.group_id === g.id).map(wordOf);
    return extra.length ? { ...g, words: [...g.words, ...extra] } : g;
  });
}
