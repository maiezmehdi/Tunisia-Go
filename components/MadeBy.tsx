'use client';

import { LinkedInIcon, TikTokIcon } from '@/components/ProIcons';
import { openConsent } from '@/lib/consent';
import { useLocale, useLocalePath } from '@/lib/i18n/LocaleProvider';

/** "Created with love by Mehdi Maiez", then the site's small links in a wrapping row. */
export default function MadeBy({ tone = 'dark', className = '' }: { tone?: 'dark' | 'light'; className?: string }) {
  const lp = useLocalePath();
  const { t } = useLocale();
  const text = tone === 'light' ? 'text-cream/50' : 'text-charcoal-300';
  const link =
    tone === 'light'
      ? 'text-cream/80 decoration-cream/30 hover:text-cream hover:decoration-cream'
      : 'text-charcoal-500 decoration-sand-300 hover:text-charcoal hover:decoration-charcoal';
  const anchor = `whitespace-nowrap underline underline-offset-4 transition ${link}`;
  return (
    // The bottom space on phones keeps the floating "Une question ?" button off the last links.
    <div className={`text-xs ${text} ${className}`}>
      <p>
        {t.madeBy}{' '}
        <a href="https://mehdimaiez.com" target="_blank" rel="noopener" className={anchor}>
          Mehdi Maiez
        </a>
      </p>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2.5 pb-16 sm:pb-0">
        <li>
          <a href={lp('/lieux')} className={anchor}>
            {t.allPlaces}
          </a>
        </li>
        <li>
          <a href={lp('/road-trips')} className={anchor}>
            {t.allRoadTrips}
          </a>
        </li>
        <li>
          <a href={lp('/evenements')} className={anchor}>
            {t.events}
          </a>
        </li>
        <li>
          <a href={lp('/guides')} className={anchor}>
            {t.guides}
          </a>
        </li>
        <li>
          <a href={lp('/confidentialite')} className={anchor}>
            {t.privacy}
          </a>
        </li>
        <li>
          <a href={lp('/mentions-legales')} className={anchor}>
            {t.legal}
          </a>
        </li>
        <li>
          <a href="mailto:contact@tunisiagoo.com" className={anchor}>
            {t.contact}
          </a>
        </li>
        <li>
          <a
            href="https://www.tiktok.com/@tunisiagoo"
            target="_blank"
            rel="noopener noreferrer me"
            aria-label="TikTok"
            className={`${anchor} inline-flex items-center gap-1.5`}
          >
            <TikTokIcon className="h-3.5 w-3.5" />
            TikTok
          </a>
        </li>
        <li>
          <a
            href="https://www.linkedin.com/company/tunisiagoo"
            target="_blank"
            rel="noopener noreferrer me"
            aria-label="LinkedIn"
            className={`${anchor} inline-flex items-center gap-1.5`}
          >
            <LinkedInIcon className="h-3.5 w-3.5" />
            LinkedIn
          </a>
        </li>
        <li>
          <button type="button" onClick={openConsent} className={anchor}>
            {t.cookies}
          </button>
        </li>
      </ul>
    </div>
  );
}
