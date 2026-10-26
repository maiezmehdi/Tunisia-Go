'use client';

import { PLACE_BY_ID } from '@/data/tunisiaData';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import { useFavorites } from '@/lib/favorites';
import { useMyTrip } from '@/lib/myTrip';

const COPY = {
  fr: {
    favorites: 'Mes lieux favoris',
    emptyFavorites: 'Touchez le cœur sur la fiche d’un lieu pour le retrouver ici.',
    trip: 'Mon voyage',
    emptyTrip: 'Votre carnet est vide.',
    stops: (n: number) => `${n} étape${n > 1 ? 's' : ''}`,
    open: 'Ouvrir mon voyage',
    saved: 'Enregistré dans votre compte : vous le retrouvez sur tous vos appareils.',
  },
  en: {
    favorites: 'My favourite places',
    emptyFavorites: 'Tap the heart on a place to find it here.',
    trip: 'My trip',
    emptyTrip: 'Your trip is empty.',
    stops: (n: number) => `${n} stop${n > 1 ? 's' : ''}`,
    open: 'Open my trip',
    saved: 'Saved in your account: you will find it on all your devices.',
  },
} as const;

/** Favourite places and the "Mon voyage" trip of a signed-in account. */
export default function AccountSaved() {
  const { locale } = useLocale();
  const c = COPY[locale];
  const favorites = useFavorites();
  const trip = useMyTrip();
  const prefix = locale === 'en' ? '/en' : '';
  const places = favorites.ids.flatMap((id) => (PLACE_BY_ID[id] ? [PLACE_BY_ID[id]] : []));
  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-serif text-2xl">{c.favorites}</h2>
        {places.length === 0 ? (
          <p className="mt-2 text-sm text-charcoal-500">{c.emptyFavorites}</p>
        ) : (
          <ul className="mt-3 divide-y divide-sand-200 rounded-3xl border border-sand-200 bg-white">
            {places.map((p) => (
              <li key={p.id}>
                <a
                  href={`${prefix}/lieux/${p.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3 text-[15px] text-charcoal transition hover:bg-sand-100"
                >
                  <span>{p.name}</span>
                  <span className="text-xs text-charcoal-500">{p.region}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="font-serif text-2xl">{c.trip}</h2>
        <p className="mt-2 text-sm text-charcoal-500">{trip.ids.length ? c.stops(trip.ids.length) : c.emptyTrip}</p>
        <a
          href={`${prefix}/mon-voyage`}
          className="mt-3 inline-block rounded-pill border border-sand-200 bg-white px-5 py-2.5 text-sm text-charcoal-700 transition hover:border-charcoal-300"
        >
          {c.open}
        </a>
        <p className="mt-3 text-xs text-charcoal-500">{c.saved}</p>
      </section>
    </div>
  );
}
