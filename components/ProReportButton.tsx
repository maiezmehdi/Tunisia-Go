'use client';

import { useState } from 'react';

import { useLocale } from '@/lib/i18n/LocaleProvider';

const COPY = {
  fr: { report: 'Signaler cette fiche', sent: 'Merci, c’est signalé.', failed: 'Échec, réessayez.' },
  en: { report: 'Report this listing', sent: 'Thank you, it is reported.', failed: 'Failed, please try again.' },
} as const;

/** One click: tells the admin that a guide or agency entry looks wrong. */
export default function ProReportButton({ listingId }: { listingId: string }) {
  const { locale } = useLocale();
  const c = COPY[locale];
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const send = async () => {
    setState('sending');
    try {
      const res = await fetch('/api/report-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      });
      setState(res.ok ? 'sent' : 'error');
    } catch {
      setState('error');
    }
  };

  if (state === 'sent') return <span className="text-xs text-charcoal-500">{c.sent}</span>;
  return (
    <button
      type="button"
      onClick={send}
      disabled={state === 'sending'}
      className="text-xs text-charcoal-300 underline decoration-sand-300 underline-offset-4 transition hover:text-charcoal-700"
    >
      {state === 'error' ? c.failed : c.report}
    </button>
  );
}
