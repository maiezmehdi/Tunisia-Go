'use client';

import { useEffect, useState } from 'react';

import AddSpotLink from '@/components/AddSpotLink';
import LanguageSwitch from '@/components/LanguageSwitch';
import MyTripLink from '@/components/MyTripLink';
import ProAuthButton from '@/components/ProAuthButton';
import { useLocale } from '@/lib/i18n/LocaleProvider';

/** Below desktop width: a quiet "Menu" button that opens the secondary links and the language switch. */
export default function MobileMenu({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  const link = 'block py-2.5 text-sm text-charcoal-700 transition hover:text-charcoal';
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="explorer-menu"
        aria-label={t.menu}
        data-tip={t.menu}
        data-tip-align="end"
        className={`grid h-8 w-8 place-items-center rounded-full border transition ${
          tone === 'light'
            ? 'border-cream/40 text-cream hover:border-cream'
            : 'border-sand-200 text-charcoal-700 hover:border-charcoal-300'
        }`}
      >
        <svg aria-hidden viewBox="0 0 14 8" className="h-2 w-3.5">
          {open ? (
            <path d="M3 0.5l8 7M11 0.5l-8 7" fill="none" stroke="currentColor" strokeWidth="1.3" />
          ) : (
            <path d="M0 1h14M0 7h14" fill="none" stroke="currentColor" strokeWidth="1.3" />
          )}
        </svg>
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label={t.close}
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            id="explorer-menu"
            className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-sand-200 bg-cream px-5 py-2 shadow-soft"
          >
            <AddSpotLink from="mobile-menu" variant="primary" className="mb-2 mt-2 w-full justify-center" />
            <MyTripLink className={`${link} border-t border-sand-200`} />
            <a href="/evenements" className={`${link} border-t border-sand-200`}>
              {t.events}
            </a>
            <a href="/guides" className={`${link} border-t border-sand-200`}>
              {t.guides}
            </a>
            <a href="/pratique" className={`${link} border-t border-sand-200`}>
              {t.practical}
            </a>
            <ProAuthButton className={`${link} w-full border-t border-sand-200 text-left`} />

            <div className="flex items-center justify-between border-t border-sand-200 py-3">
              <span className="text-[11px] uppercase tracking-[0.18em] text-charcoal-300">{t.language}</span>
              <LanguageSwitch />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
