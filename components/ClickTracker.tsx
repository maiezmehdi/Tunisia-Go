'use client';

import { useEffect } from 'react';

import { clickKind, clickPage } from '@/lib/clicks';

/**
 * Counts clicks on outside links (booking, WhatsApp, phone…) so the admin can see what visitors use.
 * Nothing about the visitor is sent: only the kind of link, the section of the site and the place, and the server
 * keeps a daily total (db/link-clicks.sql). No cookie, no identifier, so it needs no consent.
 */
export default function ClickTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!link) return;
      const { pathname } = window.location;
      if (/^(\/en)?\/admin/.test(pathname)) return;
      const kind = clickKind(link.getAttribute('href') ?? '', link.getAttribute('rel') ?? '');
      if (!kind) return;
      const fromPath = pathname.match(/^(?:\/en)?\/lieux\/([\w-]+)/)?.[1];
      const place = link.closest<HTMLElement>('[data-place]')?.dataset.place ?? fromPath ?? '';
      const body = JSON.stringify({ kind, page: clickPage(pathname), place });
      try {
        if (navigator.sendBeacon?.('/api/click', new Blob([body], { type: 'application/json' }))) return;
        void fetch('/api/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        });
      } catch {
        /* counting must never get in the way of the link */
      }
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);
  return null;
}
