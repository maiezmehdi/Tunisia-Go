'use client';

import dynamic from 'next/dynamic';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const KEY = 'tg-pro-session';

export interface ProTokens {
  accessToken: string;
  refreshToken: string;
}

export type ProAuthMode = 'signup' | 'login';

interface ProAuthValue {
  /** Null when signed out; undefined while the saved session is being renewed. */
  tokens: ProTokens | null | undefined;
  /** Opens the sign-in / sign-up window. */
  open: (mode?: ProAuthMode) => void;
  close: () => void;
  isOpen: boolean;
  mode: ProAuthMode;
  setMode: (mode: ProAuthMode) => void;
  setTokens: (tokens: ProTokens) => void;
  signOut: () => void;
}

const ProAuthContext = createContext<ProAuthValue | null>(null);

const ProAuthModal = dynamic(() => import('@/components/ProAuthModal'), { ssr: false });

function readTokens(): ProTokens | null {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? (JSON.parse(raw) as Partial<ProTokens>) : null;
    return v?.accessToken && v.refreshToken ? { accessToken: v.accessToken, refreshToken: v.refreshToken } : null;
  } catch {
    return null;
  }
}

function saveTokens(tokens: ProTokens | null) {
  try {
    if (tokens) localStorage.setItem(KEY, JSON.stringify(tokens));
    else localStorage.removeItem(KEY);
  } catch {
    /* the sign-in still works for this visit */
  }
}

async function renew(refreshToken: string): Promise<ProTokens | null> {
  try {
    const res = await fetch('/api/pro-auth/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'refresh', refreshToken }),
    });
    return res.ok ? ((await res.json()) as ProTokens) : null;
  } catch {
    return null;
  }
}

/** Session of a guide or agency (e-mail and password), shared by the menu button and the sign-in window. */
export function ProAuthProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokensState] = useState<ProTokens | null | undefined>(undefined);
  const [isOpen, setOpen] = useState(false);
  const [mode, setMode] = useState<ProAuthMode>('signup');

  const setTokens = useCallback((t: ProTokens) => {
    saveTokens(t);
    setTokensState(t);
  }, []);

  const signOut = useCallback(() => {
    saveTokens(null);
    setTokensState(null);
  }, []);

  useEffect(() => {
    const saved = readTokens();
    if (!saved) return setTokensState(null);
    // The access token only lives about an hour: renew it on arrival, then while the page stays open.
    void renew(saved.refreshToken).then((t) => (t ? setTokens(t) : signOut()));
    const timer = window.setInterval(
      () => {
        const current = readTokens();
        if (current) void renew(current.refreshToken).then((t) => t && setTokens(t));
      },
      40 * 60 * 1000,
    );
    return () => window.clearInterval(timer);
  }, [setTokens, signOut]);

  const value = useMemo<ProAuthValue>(
    () => ({
      tokens,
      isOpen,
      mode,
      setMode,
      setTokens,
      signOut,
      open: (m) => {
        if (m) setMode(m);
        setOpen(true);
      },
      close: () => setOpen(false),
    }),
    [tokens, isOpen, mode, setTokens, signOut],
  );

  return (
    <ProAuthContext.Provider value={value}>
      {children}
      {isOpen && <ProAuthModal />}
    </ProAuthContext.Provider>
  );
}

export function useProAuth(): ProAuthValue {
  const value = useContext(ProAuthContext);
  if (!value) throw new Error('useProAuth must be used inside <ProAuthProvider>');
  return value;
}
