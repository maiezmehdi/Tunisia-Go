'use client';

import { useEffect, useState } from 'react';

import { startAnalytics, stopAnalytics } from '@/lib/analytics';
import { CONSENT_OPEN, readConsent, writeConsent, type Consent } from '@/lib/consent';
import type { Locale } from '@/lib/i18n/config';
import { useLocale } from '@/lib/i18n/LocaleProvider';

const COPY: Record<Locale, { title: string; body: string; more: string; refuse: string; accept: string }> = {
  fr: {
    title: 'Cookies',
    body: 'Avec votre accord, on mesure l’audience pour savoir quels lieux et road trips vous intéressent. Rien n’est vendu ni utilisé pour de la publicité.',
    more: 'En savoir plus',
    refuse: 'Refuser',
    accept: 'Accepter',
  },
  en: {
    title: 'Cookies',
    body: 'With your consent, we measure visits to learn which places and road trips interest you. Nothing is sold or used for advertising.',
    more: 'Learn more',
    refuse: 'Decline',
    accept: 'Accept',
  },
};

/** Cookie banner: statistics start only after "Accept", and "Decline" is just as easy. */
export default function CookieConsent() {
  const { locale } = useLocale();
  const c = COPY[locale];
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const choice = readConsent();
    if (choice === 'granted') startAnalytics();
    if (!choice) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(CONSENT_OPEN, reopen);
    return () => window.removeEventListener(CONSENT_OPEN, reopen);
  }, []);

  const choose = (value: Consent) => {
    writeConsent(value);
    if (value === 'granted') startAnalytics();
    else stopAnalytics();
    setOpen(false);
  };

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-label={c.title}
      className="fixed inset-x-3 bottom-3 z-[1500] mx-auto max-w-md print:hidden rounded-3xl border border-sand-200 bg-cream p-5 text-charcoal shadow-lift sm:left-auto sm:right-5 sm:bottom-5 sm:mx-0"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">{c.title}</p>
      <p className="mt-2 text-sm leading-relaxed text-charcoal-700">
        {c.body}{' '}
        <a href="/confidentialite" className="underline decoration-sand-300 underline-offset-4 transition hover:decoration-charcoal">
          {c.more}
        </a>
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => choose('denied')}
          className="rounded-pill border border-charcoal px-4 py-2.5 text-sm text-charcoal transition hover:bg-sand"
        >
          {c.refuse}
        </button>
        <button
          type="button"
          onClick={() => choose('granted')}
          className="rounded-pill border border-charcoal bg-charcoal px-4 py-2.5 text-sm text-cream transition hover:bg-charcoal-700"
        >
          {c.accept}
        </button>
      </div>
    </div>
  );
}
