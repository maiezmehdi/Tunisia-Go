'use client';

import { useLocale } from '@/lib/i18n/LocaleProvider';
import { useProAuth } from '@/lib/proAuth';

const COPY = {
  fr: { signIn: 'Se connecter', mine: 'Mon compte' },
  en: { signIn: 'Sign in', mine: 'My account' },
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
