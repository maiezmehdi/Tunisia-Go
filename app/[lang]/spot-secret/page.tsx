import type { Metadata } from 'next';

import LanguageSwitch from '@/components/LanguageSwitch';
import SoundToggle from '@/components/SoundToggle';
import MadeBy from '@/components/MadeBy';
import SecretSpotForm from '@/components/SecretSpotForm';
import { isLocale, type Locale } from '@/lib/i18n/config';

const COPY: Record<
  Locale,
  { metaTitle: string; metaDescription: string; brandTag: string; backToMap: string; eyebrow: string; title: string; lead: string }
> = {
  fr: {
    metaTitle: 'Ajouter un lieu · Tunisia Go',
    metaDescription: 'Un café, une crique isolée, un point de vue : partagez un lieu que seuls les habitués connaissent.',
    brandTag: 'Nouveau lieu',
    backToMap: 'Retour à la carte',
    eyebrow: 'Ajouter un lieu',
    title: 'Un lieu que seuls les habitués connaissent ?',
    lead: 'Un café de village, une crique isolée du Cap Bon, un point de vue au bout d’une piste. Racontez-le : chaque proposition est relue avant d’apparaître sur la carte.',
  },
  en: {
    metaTitle: 'Add a place · Tunisia Go',
    metaDescription: 'A café, a hidden cove, a viewpoint: share a place only the regulars know.',
    brandTag: 'New place',
    backToMap: 'Back to the map',
    eyebrow: 'Add a place',
    title: 'Know a place only the regulars do?',
    lead: 'A village café, a secluded cove on Cap Bon, a viewpoint at the end of a dirt track. Tell us about it: every suggestion is read before it appears on the map.',
  },
};

type Params = { params: Promise<{ lang: string }> };

async function localeOf(params: Params['params']): Promise<Locale> {
  const { lang } = await params;
  return isLocale(lang) ? lang : 'fr';
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const c = COPY[await localeOf(params)];
  return { title: c.metaTitle, description: c.metaDescription };
}

export default async function SpotSecretPage({ params }: Params) {
  const c = COPY[await localeOf(params)];
  return (
    <main className="min-h-dvh bg-cream text-charcoal">
      <header className="border-b border-sand-200">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="/" className="leading-none">
            <span className="block font-serif text-2xl tracking-tight">Tunisia Go</span>
            <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.24em] text-charcoal-300">
              {c.brandTag}
            </span>
          </a>
          <div className="flex items-center gap-5">
            <SoundToggle />
            <LanguageSwitch />
            <a
              href="/explore"
              className="text-sm text-charcoal-500 underline-offset-4 transition hover:text-charcoal hover:underline"
            >
              {c.backToMap}
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 pb-24 pt-12 sm:px-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">{c.eyebrow}</p>
        <h1 className="mt-2 font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl">
          {c.title}
        </h1>
        <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-charcoal-500">
          {c.lead}
        </p>
        <SecretSpotForm />
      </div>
      <footer className="border-t border-sand-200">
        <MadeBy className="mx-auto max-w-3xl px-4 py-6 sm:px-6" />
      </footer>
    </main>
  );
}
