'use client';

import { useLocale } from '@/lib/i18n/LocaleProvider';

/** A discreet "Une question ?" line with the contact address. */
export default function ContactLine({ className = '' }: { className?: string }) {
  const { t } = useLocale();
  return (
    <p className={`text-xs text-charcoal-300 ${className}`}>
      {t.contactLine}{' '}
      <a
        href="mailto:contact@tunisiagoo.com"
        className="whitespace-nowrap text-charcoal-500 underline decoration-sand-300 underline-offset-4 hover:text-charcoal hover:decoration-charcoal"
      >
        contact@tunisiagoo.com
      </a>
    </p>
  );
}
