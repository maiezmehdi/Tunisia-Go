'use client';

import { useEffect, useState } from 'react';

import SecretSpotForm from '@/components/SecretSpotForm';
import TripSuggestForm, { type PlaceChoice } from '@/components/TripSuggestForm';
import { useLocale } from '@/lib/i18n/LocaleProvider';

type Kind = 'place' | 'trip';

const LABELS = {
  fr: { place: 'Un lieu', trip: 'Un road trip', aria: 'Que voulez-vous proposer ?' },
  en: { place: 'A place', trip: 'A road trip', aria: 'What would you like to suggest?' },
};

/** One page to suggest either a place or a road trip. `?type=trip` opens the trip form. */
export default function SuggestTabs({ places }: { places: PlaceChoice[] }) {
  const { locale } = useLocale();
  const c = LABELS[locale];
  const [kind, setKind] = useState<Kind>('place');

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('type') === 'trip') setKind('trip');
  }, []);

  const pick = (next: Kind) => {
    setKind(next);
    const url = new URL(window.location.href);
    if (next === 'trip') url.searchParams.set('type', 'trip');
    else url.searchParams.delete('type');
    window.history.replaceState(null, '', url);
  };

  return (
    <>
      <div role="tablist" aria-label={c.aria} className="mt-10 flex flex-wrap gap-1.5">
        {(['place', 'trip'] as const).map((k) => {
          const active = kind === k;
          return (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => pick(k)}
              className={`rounded-pill border px-5 py-2 text-sm transition ${
                active
                  ? 'border-charcoal bg-charcoal text-cream'
                  : 'border-sand-200 text-charcoal-700 hover:border-charcoal-300'
              }`}
            >
              {c[k]}
            </button>
          );
        })}
      </div>
      {kind === 'place' ? <SecretSpotForm /> : <TripSuggestForm places={places} />}
    </>
  );
}
