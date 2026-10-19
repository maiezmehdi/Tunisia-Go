'use client';

import { LOCALES } from '@/lib/i18n/config';
import { switchLocale, useLocale } from '@/lib/i18n/LocaleProvider';

/** "FR · EN" in small caps: the current language is dark, the other one is a link. */
export default function LanguageSwitch({ className = '', tone = 'dark' }: { className?: string; tone?: 'dark' | 'light' }) {
  const { locale, t } = useLocale();
  const idle = tone === 'light' ? 'text-cream/55 hover:text-cream' : 'text-charcoal-300 hover:text-charcoal';
  const current = tone === 'light' ? 'text-cream' : 'text-charcoal';
  return (
    <div role="group" aria-label={t.language} className={`flex items-center gap-1.5 text-xs font-medium tracking-[0.14em] ${className}`}>
      {LOCALES.map((l, i) => (
        <span key={l} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden className={tone === 'light' ? 'text-cream/30' : 'text-sand-300'}>·</span>}
          <button
            type="button"
            lang={l}
            aria-pressed={l === locale}
            onClick={() => l !== locale && switchLocale(l)}
            className={`uppercase transition ${l === locale ? current : idle}`}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}
