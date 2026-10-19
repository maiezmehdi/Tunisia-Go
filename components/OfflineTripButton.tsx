'use client';

import { useEffect, useState } from 'react';

import type { Itinerary, Photo } from '@/data/types';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import {
  estimateTripMb,
  offlineSupported,
  readSavedTrips,
  removeTripOffline,
  saveTripOffline,
  type SavedTrip,
} from '@/lib/offline';

type State = { kind: 'idle' } | { kind: 'saving'; done: number; total: number } | { kind: 'error' };

/** Saves a road trip (map tiles along the route, photos, the app) for use without network. */
export default function OfflineTripButton({
  itinerary,
  photos,
}: {
  itinerary: Itinerary;
  photos: Record<string, Photo[]>;
}) {
  const { t, locale } = useLocale();
  const [supported, setSupported] = useState(false);
  const [saved, setSaved] = useState<SavedTrip | null>(null);
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [sizeMb, setSizeMb] = useState<number | null>(null);

  useEffect(() => {
    setSupported(offlineSupported());
    setSizeMb(estimateTripMb(itinerary));
    const sync = () => setSaved(readSavedTrips()[itinerary.id] ?? null);
    sync();
    window.addEventListener('tg-offline-trips', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('tg-offline-trips', sync);
      window.removeEventListener('storage', sync);
    };
  }, [itinerary]);

  if (!supported) return null;

  const save = async () => {
    setState({ kind: 'saving', done: 0, total: 1 });
    try {
      await saveTripOffline(itinerary, photos, (done, total) => setState({ kind: 'saving', done, total }));
      setState({ kind: 'idle' });
    } catch {
      setState({ kind: 'error' });
    }
  };

  if (state.kind === 'saving') {
    const pct = Math.round((state.done / Math.max(state.total, 1)) * 100);
    return (
      <div className="mt-2" role="status" aria-live="polite">
        <div className="h-px w-full bg-sand-200">
          <div className="h-px bg-charcoal transition-[width]" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-center text-xs text-charcoal-500">{t.savingOffline(pct)}</p>
      </div>
    );
  }

  if (saved) {
    const date = new Date(saved.savedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short' });
    return (
      <div className="mt-2 flex items-center justify-between gap-3 rounded-pill border border-sand-200 px-4 py-2 text-xs">
        <span className="text-charcoal-700">
          <span aria-hidden className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-charcoal align-middle" />
          {t.availableOffline(date)}
        </span>
        <span className="flex gap-3">
          <button type="button" onClick={save} className="text-charcoal-500 underline-offset-4 hover:text-charcoal hover:underline">
            {t.update}
          </button>
          <button
            type="button"
            onClick={() => removeTripOffline(itinerary.id)}
            className="text-charcoal-500 underline-offset-4 hover:text-charcoal hover:underline"
          >
            {t.remove}
          </button>
        </span>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={save}
        className="flex w-full items-center justify-center rounded-pill border border-charcoal px-4 py-2.5 text-sm text-charcoal transition hover:bg-charcoal hover:text-cream"
      >
        {t.saveOffline}
      </button>
      <p className="mt-1.5 text-center text-[11px] text-charcoal-300">
        {state.kind === 'error'
          ? t.saveOfflineError
          : t.saveOfflineHint(sizeMb)}
      </p>
    </div>
  );
}
