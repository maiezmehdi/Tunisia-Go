'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';

/**
 * Small helpers so every admin action behaves the same way: one click is enough.
 * - useRefresh: reloads the server data and says while it is doing so (buttons stay disabled).
 * - useGone: lets a board hide a card the moment it is deleted or refused, before the reload ends.
 * - notify / ToastHost: a short message ("Supprimé", "Refusé"…) at the bottom of the screen.
 */
const EVENT = 'admin-toast';

export function notify(message: string, tone: 'ok' | 'error' = 'ok') {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { message, tone } }));
}

export function useRefresh(): [boolean, () => void] {
  const router = useRouter();
  const [pending, start] = useTransition();
  const refresh = useCallback(() => start(() => router.refresh()), [router]);
  return [pending, refresh];
}

/** `data` is the list the server sent; a fresh list (after the reload) clears the hidden cards. */
export function useGone(data: unknown): [Set<string>, (id: string) => void] {
  const [gone, setGone] = useState<Set<string>>(() => new Set());
  useEffect(() => setGone(new Set()), [data]);
  const hide = useCallback((id: string) => setGone((g) => new Set(g).add(id)), []);
  return [gone, hide];
}

export function ToastHost() {
  const [toast, setToast] = useState<{ message: string; tone: 'ok' | 'error'; key: number } | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const on = (e: Event) => {
      const { message, tone } = (e as CustomEvent<{ message: string; tone: 'ok' | 'error' }>).detail;
      setToast({ message, tone, key: Date.now() });
      clearTimeout(timer);
      timer = setTimeout(() => setToast(null), 3500);
    };
    window.addEventListener(EVENT, on);
    return () => {
      window.removeEventListener(EVENT, on);
      clearTimeout(timer);
    };
  }, []);
  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <p
        key={toast.key}
        role="status"
        className={`rounded-pill px-5 py-2.5 text-sm shadow-lg ${
          toast.tone === 'error' ? 'bg-terracotta-600 text-cream' : 'bg-charcoal text-cream'
        }`}
      >
        {toast.message}
      </p>
    </div>
  );
}
