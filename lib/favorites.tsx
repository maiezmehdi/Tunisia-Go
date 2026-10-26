'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

/** Favourite places: kept in the browser, and copied to the account when the person is signed in (see TravelerSync). */
const STORAGE_KEY = 'tg-favorites';
const MAX = 200;

interface FavoritesValue {
  ids: string[];
  ready: boolean;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  replace: (ids: string[]) => void;
}

const FavoritesContext = createContext<FavoritesValue | null>(null);

function read(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string').slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIds(read());
    setReady(true);
    const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && setIds(read());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const update = useCallback((fn: (prev: string[]) => string[]) => {
    setIds((prev) => {
      const next = [...new Set(fn(prev))].slice(0, MAX);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* private mode: the hearts still work for this visit */
      }
      return next;
    });
  }, []);

  const value = useMemo<FavoritesValue>(
    () => ({
      ids,
      ready,
      has: (id) => ids.includes(id),
      toggle: (id) => update((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
      replace: (next) => update(() => next),
    }),
    [ids, ready, update],
  );
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesValue {
  const value = useContext(FavoritesContext);
  if (!value) throw new Error('useFavorites must be used inside <FavoritesProvider>');
  return value;
}
