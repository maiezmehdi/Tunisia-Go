'use client';

import { track } from '@/lib/analytics';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import { useFavorites } from '@/lib/favorites';
import { useMyTrip } from '@/lib/myTrip';

/** "Add to my road trip": the place joins the visitor's own trip (see /mon-voyage). */
export default function TripButton({ placeId }: { placeId: string }) {
  const { t } = useLocale();
  const trip = useMyTrip();
  const favorites = useFavorites();
  const liked = favorites.has(placeId);
  const inTrip = trip.has(placeId);
  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
      <button
        type="button"
        onClick={() => {
          trip.toggle(placeId);
          track(inTrip ? 'trip_place_removed' : 'trip_place_added', { place: placeId });
        }}
        aria-pressed={inTrip}
        data-tip={inTrip ? t.removeFromTrip : undefined}
        className={`inline-flex items-center gap-2 rounded-pill border px-4 py-2 text-sm transition ${
          inTrip
            ? 'border-charcoal bg-charcoal text-cream hover:bg-charcoal-700'
            : 'border-charcoal-300 text-charcoal hover:border-charcoal'
        }`}
      >
        <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3">
          {inTrip ? (
            <path d="M1.5 6.2l3 3 6-6.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
          ) : (
            <path d="M6 1v10M1 6h10" fill="none" stroke="currentColor" strokeWidth="1.4" />
          )}
        </svg>
        {inTrip ? t.inTrip : t.addToTrip}
      </button>
      <button
        type="button"
        onClick={() => {
          favorites.toggle(placeId);
          track(liked ? 'favorite_removed' : 'favorite_added', { place: placeId });
        }}
        aria-pressed={liked}
        aria-label={liked ? t.removeFavorite : t.addFavorite}
        title={liked ? t.removeFavorite : t.addFavorite}
        className={`grid h-10 w-10 place-items-center rounded-full border transition ${
          liked
            ? 'border-terracotta-700 text-terracotta-700'
            : 'border-charcoal-300 text-charcoal hover:border-charcoal'
        }`}
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill={liked ? 'currentColor' : 'none'}>
          <path
            d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {inTrip && (
        <a
          href="/mon-voyage"
          className="text-sm text-charcoal-500 underline underline-offset-4 transition hover:text-charcoal"
        >
          {t.viewMyTrip} · {trip.ids.length}
        </a>
      )}
    </div>
  );
}
