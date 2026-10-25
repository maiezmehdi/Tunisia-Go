'use client';

import { useLocale } from '@/lib/i18n/LocaleProvider';
import { useProAuth } from '@/lib/proAuth';

const COPY = {
  fr: { signIn: 'Se connecter', mine: 'Ma fiche' },
  en: { signIn: 'Sign in', mine: 'My listing' },
} as const;

/** Menu entry that opens the sign-in / sign-up window for guides and agencies. */
export default function ProAuthButton({ className = '' }: { className?: string }) {
  const { locale } = useLocale();
  const { tokens, open } = useProAuth();
  const c = COPY[locale];
  return (
    <button type="button" onClick={() => open('login')} className={className}>
      {tokens ? c.mine : c.signIn}
    </button>
  );
}
