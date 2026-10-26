'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useLocale } from '@/lib/i18n/LocaleProvider';

const KEY = 'tg-pro-session';

export interface ProTokens {
  accessToken: string;
  refreshToken: string;
}

export type ProAuthMode = 'signup' | 'login';
export type AccountKind = 'traveler' | 'pro' | 'partner';

export interface Account {
  email: string;
  kind: AccountKind;
}

interface ProAuthValue {
  /** Null when signed out; undefined while the saved session is being renewed. */
  tokens: ProTokens | null | undefined;
  /** E-mail and type of the signed-in account; undefined until known, null when signed out. */
  account: Account | null | undefined;
  /** Goes to the account page (sign in or sign up). */
  open: (mode?: ProAuthMode, kind?: 'traveler' | 'pro' | 'partner') => void;
  setTokens: (tokens: ProTokens) => void;
  signOut: () => void;
}

const ProAuthContext = createContext<ProAuthValue | null>(null);

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

/** Session of a signed-in account (e-mail and password), shared by the menu and the account pages. */
export function ProAuthProvider({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  const [tokens, setTokensState] = useState<ProTokens | null | undefined>(undefined);
  const [account, setAccount] = useState<Account | null | undefined>(undefined);

  const setTokens = useCallback((t: ProTokens) => {
    saveTokens(t);
    setTokensState(t);
  }, []);

  const signOut = useCallback(() => {
    saveTokens(null);
    setTokensState(null);
    setAccount(null);
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

  const accessToken = tokens?.accessToken;
  useEffect(() => {
    if (accessToken === undefined) return;
    if (!accessToken) return setAccount(null);
    let cancelled = false;
    fetch('/api/account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, action: 'me' }),
    })
      .then(async (res) => (res.ok ? ((await res.json()) as Account) : null))
      .then((a) => !cancelled && setAccount(a))
      .catch(() => !cancelled && setAccount(null));
    return () => {
      cancelled = true;
    };
    // Only look the account up again when the person changes, not each time the token is renewed.
  }, [accessToken ? accessToken.slice(-12) : accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo<ProAuthValue>(
    () => ({
      tokens,
      account,
      setTokens,
      signOut,
      open: (mode = 'login', kind) => {
        const q = new URLSearchParams({ mode, ...(kind ? { kind } : {}) });
        window.location.assign(`${accountHref(locale)}?${q}`);
      },
    }),
    [tokens, account, setTokens, signOut, locale],
  );

  return <ProAuthContext.Provider value={value}>{children}</ProAuthContext.Provider>;
}

/** Address of the account page, and of the listing page of a guide or agency. */
export function accountHref(locale: string, sub = ''): string {
  return `${locale === 'en' ? '/en' : ''}/compte${sub}`;
}

export function useProAuth(): ProAuthValue {
  const value = useContext(ProAuthContext);
  if (!value) throw new Error('useProAuth must be used inside <ProAuthProvider>');
  return value;
}
