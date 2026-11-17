import type { Festival } from './types';

const f = (key: string, place: string, fr: string, en: string): Festival => ({
  id: `festival:${key}`,
  kind: 'festival',
  name: { fr, en },
  place: `place:${place}`,
  fileEventId: key,
  titlesFr: [fr],
  status: 'active',
  sources: [],
});

/**
 * Recurring festivals (LOT4-ENTITIES § 4.6). The keys are the ids of data/events.ts.
 * Editions live in the Supabase `events` table (source of truth, OPEN-ISSUES § 2), with data/events.ts as fallback;
 * an edition is matched to its festival by place and normalised French title (lib/kg/events.ts).
 */
export const FESTIVALS: Festival[] = [
  f('sahara-douz', 'douz', 'Festival international du Sahara', 'International Sahara Festival'),
  f('jtc', 'medina-tunis', 'Journées théâtrales de Carthage', 'Carthage Theatre Days'),
  f('jcc', 'medina-tunis', 'Journées cinématographiques de Carthage', 'Carthage Film Festival'),
  f('carthage', 'carthage', 'Festival international de Carthage', 'Carthage International Festival'),
  f('hammamet', 'hammamet', 'Festival international de Hammamet', 'Hammamet International Festival'),
  f('el-jem', 'el-jem', 'Festival de musique symphonique d’El Jem', 'El Jem Symphonic Music Festival'),
  f('tabarka-jazz', 'tabarka', 'Tabarka Jazz Festival', 'Tabarka Jazz Festival'),
];
