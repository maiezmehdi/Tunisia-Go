import { PLACES } from '@/data/tunisiaData';

const KINDS = ['music', 'gathering', 'culture'] as const;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function text(value: unknown, max: number): string | null {
  return typeof value === 'string' && value.trim() && value.trim().length <= max ? value.trim() : null;
}

function link(value: unknown): string | null | undefined {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || value.length > 500) return undefined;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function date(value: unknown): string | null | undefined {
  if (value === undefined || value === null || value === '') return null;
  return typeof value === 'string' && DATE.test(value) && !Number.isNaN(Date.parse(value)) ? value : undefined;
}

/** Validates the admin form; returns the row to save, or the name of the first invalid field. */
export function parseEventInput(raw: unknown): { row: Record<string, unknown> } | { error: string } {
  const b = (raw ?? {}) as Record<string, unknown>;
  const kind = KINDS.find((k) => k === b.kind);
  if (!kind) return { error: 'kind' };
  const placeId = typeof b.placeId === 'string' && PLACES.some((p) => p.id === b.placeId) ? b.placeId : null;
  if (!placeId) return { error: 'placeId' };
  const fields = {
    title_fr: text(b.titleFr, 120),
    title_en: text(b.titleEn, 120),
    desc_fr: text(b.descFr, 600),
    desc_en: text(b.descEn, 600),
    when_fr: text(b.whenFr, 120),
    when_en: text(b.whenEn, 120),
  };
  for (const [key, value] of Object.entries(fields)) if (!value) return { error: key };
  const ticket = link(b.ticketUrl);
  if (ticket === undefined) return { error: 'ticketUrl' };
  const info = link(b.infoUrl);
  if (info === undefined) return { error: 'infoUrl' };
  const start = date(b.startDate);
  if (start === undefined) return { error: 'startDate' };
  const end = date(b.endDate);
  if (end === undefined) return { error: 'endDate' };
  const sort = typeof b.sort === 'number' && Number.isInteger(b.sort) ? b.sort : 0;
  return {
    row: {
      ...fields,
      kind,
      place_id: placeId,
      confirmed: b.confirmed === true,
      published: b.published !== false,
      start_date: start,
      end_date: end,
      ticket_url: ticket,
      info_url: info,
      sort,
    },
  };
}

/** Validates a public proposal: the visitor writes one language, which is copied into both until /admin translates. */
export function parseEventProposal(raw: unknown): { row: Record<string, unknown> } | { error: string } {
  const b = (raw ?? {}) as Record<string, unknown>;
  const contact = text(b.contact, 120);
  if (!contact) return { error: 'contact' };
  const parsed = parseEventInput({
    kind: b.kind,
    placeId: b.placeId,
    titleFr: b.title,
    titleEn: b.title,
    descFr: b.description,
    descEn: b.description,
    whenFr: b.when,
    whenEn: b.when,
    startDate: b.startDate,
    endDate: b.endDate,
    ticketUrl: b.ticketUrl,
    infoUrl: b.infoUrl,
    confirmed: false,
    published: false,
  });
  if ('error' in parsed) {
    const map: Record<string, string> = { title_fr: 'title', desc_fr: 'description', when_fr: 'when' };
    return { error: map[parsed.error] ?? parsed.error };
  }
  return { row: { ...parsed.row, published: false, proposed: true, contact } };
}
