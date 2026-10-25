import type { Metadata } from 'next';

import BrandLogo from '@/components/BrandLogo';
import LanguageSwitch from '@/components/LanguageSwitch';
import ProAccount from '@/components/ProAccount';
import { isLocale, type Locale } from '@/lib/i18n/config';

type Params = { params: Promise<{ lang: string }> };

const COPY = {
  fr: {
    tag: 'Ma fiche',
    title: 'Modifier ma fiche',
    lead: 'Créez votre compte ou connectez-vous pour gérer votre fiche.',
    back: 'Guides et agences',
    href: '/guides',
  },
  en: {
    tag: 'My listing',
    title: 'Edit my listing',
    lead: 'Create your account or sign in to manage your listing.',
    back: 'Guides and agencies',
    href: '/en/guides',
  },
} as const;

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function EditProPage({ params }: Params) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'fr';
  const c = COPY[locale];
  return (
    <main className="min-h-dvh bg-cream text-charcoal">
      <header className="border-b border-sand-200">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandLogo tag={c.tag} size={40} compact />
          <div className="flex items-center gap-5">
            <LanguageSwitch />
            <a
              href={c.href}
              className="text-sm text-charcoal-500 underline-offset-4 transition hover:text-charcoal hover:underline"
            >
              {c.back}
            </a>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-xl px-4 pb-24 pt-12 sm:px-6">
        <h1 className="font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl">{c.title}</h1>
        <p className="mb-8 mt-3 text-charcoal-500">{c.lead}</p>
        <ProAccount />
      </div>
    </main>
  );
}
