'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { SITE_URL } from '@/lib/seo';

/**
 * "Mon voyage": the visitor's own road trip, an ordered list of place ids.
 * It stays in the browser (no account) and travels in a link to be shared.
 */
const STORAGE_KEY = 'tg-my-trip';
/** A shared link carries the stops as ?p=id1,id2,… */
export const SHARE_PARAM = 'p';
const MAX_STOPS = 40;

interface MyTripValue {
  ids: string[];
  /** False until the saved trip has been read, so the first render matches the server. */
  ready: boolean;
  has: (id: string) => boolean;
  add: (ids: string | string[]) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  move: (id: string, by: -1 | 1) => void;
  replace: (ids: string[]) => void;
  clear: () => void;
}

const MyTripContext = createContext<MyTripValue | null>(null);

function read(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string').slice(0, MAX_STOPS) : [];
  } catch {
    return [];
  }
}

function unique(ids: string[]): string[] {
  return [...new Set(ids)].slice(0, MAX_STOPS);
}

export function MyTripProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIds(read());
    setReady(true);
    // Keep several open tabs in step.
    const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && setIds(read());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const update = useCallback((fn: (prev: string[]) => string[]) => {
    setIds((prev) => {
      const next = unique(fn(prev));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Private mode or full storage: the trip still works for this visit.
      }
      return next;
    });
  }, []);

  const value = useMemo<MyTripValue>(
    () => ({
      ids,
      ready,
      has: (id) => ids.includes(id),
      add: (more) => update((prev) => [...prev, ...(Array.isArray(more) ? more : [more])]),
      remove: (id) => update((prev) => prev.filter((x) => x !== id)),
      toggle: (id) => update((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
      move: (id, by) =>
        update((prev) => {
          const i = prev.indexOf(id);
          const j = i + by;
          if (i < 0 || j < 0 || j >= prev.length) return prev;
          const next = [...prev];
          [next[i], next[j]] = [next[j], next[i]];
          return next;
        }),
      replace: (next) => update(() => next),
      clear: () => update(() => []),
    }),
    [ids, ready, update],
  );

  return <MyTripContext.Provider value={value}>{children}</MyTripContext.Provider>;
}

export function useMyTrip(): MyTripValue {
  const value = useContext(MyTripContext);
  if (!value) throw new Error('useMyTrip must be used inside <MyTripProvider>');
  return value;
}

/** Reads the stops of a shared link, keeping only ids that exist. */
export function parseShared(raw: string | null, known: (id: string) => boolean): string[] {
  if (!raw) return [];
  return unique(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(known),
  );
}

export function shareUrl(ids: string[]): string {
  const url = new URL('/mon-voyage', SITE_URL);
  url.searchParams.set(SHARE_PARAM, ids.join(','));
  // Commas read better than %2C in a link people paste.
  return url.toString().replace(/%2C/g, ',');
}
