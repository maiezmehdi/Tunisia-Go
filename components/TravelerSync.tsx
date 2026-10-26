'use client';

import { useEffect, useRef } from 'react';

import { useFavorites } from '@/lib/favorites';
import { useMyTrip } from '@/lib/myTrip';
import { useProAuth } from '@/lib/proAuth';

const TRIP_MAX = 40;

const union = (a: string[], b: string[], max: number) => [...new Set([...a, ...b])].slice(0, max);

/**
 * Invisible: once someone is signed in, merges the favourites and "Mon voyage" kept in this browser with
 * the ones saved in the account (the first time on this browser, so nothing is lost), then keeps the account up to date.
 */
export default function TravelerSync() {
  const { tokens, account } = useProAuth();
  const favorites = useFavorites();
  const trip = useMyTrip();
  const accessToken = tokens?.accessToken;
  const person = accessToken ? accessToken.slice(-12) : null;
  const merged = useRef<string | null>(null);
  const lastSaved = useRef('');

  const call = (body: Record<string, unknown>) =>
    fetch('/api/traveler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, ...body }),
    });

  // On sign-in: read the account, merge with this browser, write the result back.
  useEffect(() => {
    if (!accessToken || !account || !favorites.ready || !trip.ready || merged.current === person) return;
    merged.current = person;
    let cancelled = false;
    call({ action: 'get' })
      .then(async (res) => (res.ok ? ((await res.json()) as { favorites: string[]; trip: string[] }) : null))
      .then((saved) => {
        if (cancelled || !saved) return (merged.current = null);
        // First time on this browser: keep both sides. Afterwards the account is the reference, so a place
        // removed on another device does not come back.
        const flag = `tg-synced:${account.email}`;
        let known = false;
        try {
          known = localStorage.getItem(flag) === '1';
          localStorage.setItem(flag, '1');
        } catch {
          /* merge again next time */
        }
        const nextFavs = known ? saved.favorites : union(saved.favorites, favorites.ids, 200);
        const nextTrip = known ? saved.trip : union(saved.trip, trip.ids, TRIP_MAX);
        lastSaved.current = JSON.stringify([nextFavs, nextTrip]);
        favorites.replace(nextFavs);
        trip.replace(nextTrip);
        return call({ action: 'save', favorites: nextFavs, trip: nextTrip });
      })
      .catch(() => {
        merged.current = null;
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person, account, favorites.ready, trip.ready]);

  // Afterwards: save changes a moment after the last one.
  useEffect(() => {
    if (!accessToken || merged.current !== person) return;
    const snapshot = JSON.stringify([favorites.ids, trip.ids]);
    if (snapshot === lastSaved.current) return;
    const timer = window.setTimeout(() => {
      lastSaved.current = snapshot;
      void call({ action: 'save', favorites: favorites.ids, trip: trip.ids }).catch(() => undefined);
    }, 1500);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favorites.ids, trip.ids, person]);

  return null;
}
