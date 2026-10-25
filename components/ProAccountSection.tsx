'use client';

import { useLocale } from '@/lib/i18n/LocaleProvider';
import { useProAuth } from '@/lib/proAuth';

const COPY = {
  fr: {
    intro: 'Créez votre compte avec votre e-mail et un mot de passe, puis gérez votre fiche quand vous voulez.',
    signup: 'Créer mon compte',
    login: 'J’ai déjà un compte',
    mine: 'Ouvrir ma fiche',
  },
  en: {
    intro: 'Create your account with your e-mail and a password, then manage your listing whenever you like.',
    signup: 'Create my account',
    login: 'I already have an account',
    mine: 'Open my listing',
  },
} as const;

/** Text and two buttons: each opens the sign-in window (see ProAuthModal). */
export default function ProAccountSection() {
  const { locale } = useLocale();
  const { tokens, open } = useProAuth();
  const c = COPY[locale];
  return (
    <div className="space-y-5">
      <p className="max-w-md text-[15px] leading-relaxed text-charcoal-500">{c.intro}</p>
      <div className="flex flex-wrap gap-3">
        {tokens ? (
          <button
            type="button"
            onClick={() => open()}
            className="rounded-pill bg-charcoal px-5 py-2.5 text-sm text-cream transition hover:bg-charcoal-700"
          >
            {c.mine}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => open('signup')}
              className="rounded-pill bg-charcoal px-5 py-2.5 text-sm text-cream transition hover:bg-charcoal-700"
            >
              {c.signup}
            </button>
            <button
              type="button"
              onClick={() => open('login')}
              className="rounded-pill border border-sand-200 bg-white px-5 py-2.5 text-sm text-charcoal-700 transition hover:border-charcoal-300"
            >
              {c.login}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
