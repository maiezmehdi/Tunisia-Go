'use client';

import type { ReactNode } from 'react';

import { track } from '@/lib/analytics';
import { useLocale } from '@/lib/i18n/LocaleProvider';

type Variant = 'pill' | 'pill-light' | 'floating' | 'primary' | 'text' | 'text-light';

const STYLES: Record<Variant, string> = {
  pill: 'inline-flex items-center gap-2 rounded-pill border border-charcoal px-4 py-1.5 text-sm text-charcoal transition hover:bg-charcoal hover:text-cream',
  'pill-light':
    'inline-flex items-center gap-2 rounded-pill border border-cream/40 px-4 py-1.5 text-sm text-cream transition hover:border-cream hover:bg-cream hover:text-charcoal',
  floating:
    'pointer-events-auto inline-flex items-center gap-2 rounded-pill bg-charcoal px-4 py-2.5 text-sm text-cream shadow-soft transition hover:bg-charcoal-700',
  primary:
    'inline-flex items-center gap-2 rounded-pill bg-charcoal px-5 py-2.5 text-sm text-cream transition hover:bg-charcoal-700',
  text: 'inline-flex items-center gap-1.5 text-sm text-charcoal underline decoration-sand-300 underline-offset-4 transition hover:decoration-charcoal',
  'text-light':
    'inline-flex items-center gap-1.5 text-sm text-cream/70 underline-offset-4 transition hover:text-cream hover:underline',
};

/** Link to the "secret spot" form, tracked by where it was clicked (when statistics are on). */
export default function AddSpotLink({
  from,
  variant = 'pill',
  className = '',
  children,
}: {
  /** Where the link sits, for the statistics: header, map, journal, place, landing… */
  from: string;
  variant?: Variant;
  className?: string;
  children?: ReactNode;
}) {
  const { t } = useLocale();
  const withPlus = variant !== 'text' && variant !== 'text-light';
  return (
    <a
      href="/spot-secret"
      onClick={() => track('spot_cta_clicked', { from })}
      className={`${STYLES[variant]} ${className}`}
    >
      {withPlus && (
        <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3 shrink-0">
          <path d="M6 1v10M1 6h10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )}
      {children ?? t.addSpot}
    </a>
  );
}
