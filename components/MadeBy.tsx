'use client';

import { openConsent } from '@/lib/consent';
import { useLocale } from '@/lib/i18n/LocaleProvider';

/** "Created with love by Mehdi Maiez", with a link to his site. */
export default function MadeBy({ tone = 'dark', className = '' }: { tone?: 'dark' | 'light'; className?: string }) {
  const { t } = useLocale();
  const text = tone === 'light' ? 'text-cream/50' : 'text-charcoal-300';
  const link =
    tone === 'light'
      ? 'text-cream/80 decoration-cream/30 hover:text-cream hover:decoration-cream'
      : 'text-charcoal-500 decoration-sand-300 hover:text-charcoal hover:decoration-charcoal';
  return (
    <p className={`text-xs ${text} ${className}`}>
      {t.madeBy}{' '}
      <a
        href="https://mehdimaiez.com"
        target="_blank"
        rel="noopener"
        className={`underline underline-offset-4 transition ${link}`}
      >
        Mehdi Maiez
      </a>
      <span aria-hidden className="mx-2">
        ·
      </span>
      <a href="/lieux" className={`underline underline-offset-4 transition ${link}`}>
        {t.allPlaces}
      </a>
      <span aria-hidden className="mx-2">
        ·
      </span>
      <a href="/evenements" className={`underline underline-offset-4 transition ${link}`}>
        {t.events}
      </a>
      <span aria-hidden className="mx-2">
        ·
      </span>
      <a href="/confidentialite" className={`underline underline-offset-4 transition ${link}`}>
        {t.privacy}
      </a>
      <span aria-hidden className="mx-2">
        ·
      </span>
      <button type="button" onClick={openConsent} className={`underline underline-offset-4 transition ${link}`}>
        {t.cookies}
      </button>
    </p>
  );
}
