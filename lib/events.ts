import { EVENTS, type EventAction, type EventKind, type TunisiaEvent } from '@/data/events';
import { selectRows, supabaseConfig } from '@/lib/supabase';

export const EVENTS_TAG = 'events';

export interface EventRow {
  id: string;
  published: boolean;
  kind: EventKind;
  place_id: string;
  title_fr: string;
  title_en: string;
  desc_fr: string;
  desc_en: string;
  when_fr: string;
  when_en: string;
  confirmed: boolean;
  start_date: string | null;
  end_date: string | null;
  ticket_url: string | null;
  info_url: string | null;
  sort: number;
}

function actionsFor(row: Pick<EventRow, 'ticket_url' | 'info_url'>): EventAction[] {
  const actions: EventAction[] = [
    row.ticket_url
      ? { kind: 'tickets', label: { fr: 'Billetterie', en: 'Tickets' }, url: row.ticket_url }
      : { kind: 'tickets', label: { fr: 'Billetterie à confirmer', en: 'Tickets to be confirmed' } },
    { kind: 'stay', label: { fr: 'Se loger sur place', en: 'Find a stay nearby' } },
  ];
  if (row.info_url) actions.push({ kind: 'info', label: { fr: 'Plus d’infos', en: 'More info' } });
  return actions;
}

export function eventFromRow(row: EventRow): TunisiaEvent {
  return {
    id: row.id,
    kind: row.kind,
    placeId: row.place_id,
    title: { fr: row.title_fr, en: row.title_en },
    description: { fr: row.desc_fr, en: row.desc_en },
    when: { fr: row.when_fr, en: row.when_en },
    confirmed: row.confirmed,
    start: row.start_date ?? undefined,
    end: row.end_date ?? undefined,
    source: row.info_url ?? undefined,
    actions: actionsFor(row),
  };
}

/** Published events from Supabase, or the ones in data/events.ts when the table is missing or empty. */
export async function loadEvents(): Promise<TunisiaEvent[]> {
  const cfg = supabaseConfig();
  if (!cfg) return EVENTS;
  try {
    const rows = await selectRows<EventRow>(cfg, 'events', 'select=*&published=eq.true&order=sort.asc,created_at.asc', {
      revalidate: 3600,
      tags: [EVENTS_TAG],
    });
    return rows.length ? rows.map(eventFromRow) : EVENTS;
  } catch {
    return EVENTS;
  }
}
