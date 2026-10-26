'use client';

import { useLocale } from '@/lib/i18n/LocaleProvider';
import { accountHref, useProAuth } from '@/lib/proAuth';

const COPY = {
  fr: { signIn: 'Se connecter', account: 'Mon compte' },
  en: { signIn: 'Sign in', account: 'My account' },
} as const;

/** Menu entries: "Sign in" when signed out, "My account" once signed in. */
export default function ProAuthButton({ className = '' }: { className?: string }) {
  const { locale } = useLocale();
  const { tokens } = useProAuth();
  const c = COPY[locale];
  const cls = `whitespace-nowrap ${className}`;
  if (!tokens) {
    return (
      <a href={`${accountHref(locale)}?mode=login`} className={cls}>
        {c.signIn}
      </a>
    );
  }
  return (
    <a href={accountHref(locale)} className={cls}>
      {c.account}
    </a>
  );
}
