import { MONTHS, SEASONS, bestMonthsLabel, type SeasonRating } from '@/data/seasons';

const CELL: Record<SeasonRating, string> = {
  best: 'bg-charcoal',
  fine: 'bg-sand-300',
  avoid: 'border border-dashed border-sand-300 bg-transparent',
};

const LABEL: Record<SeasonRating, string> = { best: 'best', fine: 'fine', avoid: 'better avoided' };

/** Twelve small bars, one per month: dark = best, light = fine, dashed = better avoided. */
export default function SeasonStrip({ placeId, highlightMonth }: { placeId: string; highlightMonth?: number | null }) {
  const months = SEASONS[placeId];
  if (!months) return null;
  return (
    <section aria-label="When to go">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">When to go</h3>
        <p className="text-sm text-charcoal-700">{bestMonthsLabel(placeId)}</p>
      </div>
      <ol className="mt-3 grid grid-cols-12 gap-1">
        {months.map((rating, i) => (
          <li key={MONTHS[i]} title={`${MONTHS[i]}: ${LABEL[rating]}`} className="text-center">
            <span className={`block h-6 rounded-[4px] ${CELL[rating]}`} />
            <span
              className={`mt-1 block text-[10px] ${
                highlightMonth === i ? 'font-medium text-charcoal' : 'text-charcoal-300'
              }`}
            >
              {MONTHS[i][0]}
            </span>
            <span className="sr-only">{LABEL[rating]}</span>
          </li>
        ))}
      </ol>
      <p className="mt-2 flex gap-4 text-[11px] text-charcoal-300">
        <Legend className={CELL.best}>Best</Legend>
        <Legend className={CELL.fine}>Fine</Legend>
        <Legend className={CELL.avoid}>Better avoided</Legend>
      </p>
    </section>
  );
}

function Legend({ className, children }: { className: string; children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className={`inline-block h-2.5 w-2.5 rounded-[2px] ${className}`} />
      {children}
    </span>
  );
}
