import { FESTIVALS } from '@/data/kg/festivals';
import type { Festival } from '@/data/kg/types';

/**
 * Editions and festivals (implementation plan, step 6). Supabase `events` is the source of truth and
 * data/events.ts the fallback (OPEN-ISSUES § 2, decided on 17/11/2026). Nothing here writes to Supabase.
 */

export const normTitle = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** Festival of an edition: same place and same normalised French title (or the fallback file id). */
export function festivalOf(e: { id?: string; placeId: string; titleFr: string }): Festival | undefined {
  const t = normTitle(e.titleFr);
  return FESTIVALS.find(
    (f) =>
      f.place === `place:${e.placeId}` &&
      (f.fileEventId === e.id || f.titlesFr.some((x) => normTitle(x) === t)),
  );
}

export interface EventSourceRow {
  id: string;
  place_id: string;
  title_fr: string;
  published: boolean;
  confirmed: boolean;
  start_date: string | null;
  end_date: string | null;
}

export interface FileEvent {
  id: string;
  placeId: string;
  title: { fr: string };
  confirmed: boolean;
  start?: string;
  end?: string;
}

/**
 * Differences between the Supabase rows and the fallback file. Returns readable lines; an empty list means
 * that the fallback still says the same thing as the table for every festival.
 */
export function compareEventSources(rows: EventSourceRow[], file: FileEvent[]): string[] {
  const issues: string[] = [];
  const published = rows.filter((r) => r.published);
  const seen = new Set<string>();
  for (const r of published) {
    const f = festivalOf({ placeId: r.place_id, titleFr: r.title_fr });
    if (!f) {
      issues.push(`Supabase « ${r.title_fr} » (${r.place_id}) : aucun festival connu du graphe.`);
      continue;
    }
    seen.add(f.fileEventId);
    const e = file.find((x) => x.id === f.fileEventId);
    if (!e) {
      issues.push(`Supabase « ${r.title_fr} » : absent du fichier de secours.`);
      continue;
    }
    if (e.placeId !== r.place_id) issues.push(`« ${r.title_fr} » : lieu ${r.place_id} (Supabase) ≠ ${e.placeId} (fichier).`);
    if (e.confirmed !== r.confirmed) issues.push(`« ${r.title_fr} » : confirmé ${r.confirmed} (Supabase) ≠ ${e.confirmed} (fichier).`);
    if ((e.start ?? null) !== r.start_date || (e.end ?? null) !== r.end_date)
      issues.push(`« ${r.title_fr} » : dates ${r.start_date}…${r.end_date} (Supabase) ≠ ${e.start ?? null}…${e.end ?? null} (fichier).`);
  }
  for (const e of file) if (!seen.has(e.id)) issues.push(`Fichier « ${e.title.fr} » : aucune édition publiée dans Supabase.`);
  return issues;
}
