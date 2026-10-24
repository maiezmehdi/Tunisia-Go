import type { Metadata } from 'next';

import BrandLogo from '@/components/BrandLogo';
import LanguageSwitch from '@/components/LanguageSwitch';
import SoundToggle from '@/components/SoundToggle';
import MadeBy from '@/components/MadeBy';
import SuggestTabs from '@/components/SuggestTabs';
import { loadCommunityPlaces } from '@/lib/community';
import { getCatalog } from '@/lib/i18n/catalog';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { pageMetadata } from '@/lib/seo';

const COPY: Record<
  Locale,
  {
    metaTitle: string;
    metaDescription: string;
    brandTag: string;
    backToMap: string;
    eyebrow: string;
    title: string;
    lead: string;
  }
> = {
  fr: {
    metaTitle: 'Proposer un lieu ou un road trip · Tunisia Go',
    metaDescription:
      'Un café, une crique isolée, un point de vue, ou un road trip entier : partagez ce que seuls les habitués connaissent.',
    brandTag: 'Proposer',
    backToMap: 'Retour à la carte',
    eyebrow: 'Proposer',
    title: 'Ce que seuls les habitués connaissent ?',
    lead: 'Un café de village, une crique isolée du Cap Bon, un point de vue au bout d’une piste, ou un parcours à faire dans l’ordre. Racontez-le : chaque proposition est relue avant d’apparaître sur la carte.',
  },
  en: {
    metaTitle: 'Suggest a place or a road trip · Tunisia Go',
    metaDescription: 'A café, a hidden cove, a viewpoint, or a whole road trip: share what only the regulars know.',
    brandTag: 'Suggest',
    backToMap: 'Back to the map',
    eyebrow: 'Suggest',
    title: 'Know what only the regulars do?',
    lead: 'A village café, a secluded cove on Cap Bon, a viewpoint at the end of a dirt track, or a route to drive in order. Tell us about it: every suggestion is read before it appears on the map.',
  },
};

type Params = { params: Promise<{ lang: string }> };

async function localeOf(params: Params['params']): Promise<Locale> {
  const { lang } = await params;
  return isLocale(lang) ? lang : 'fr';
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const lang = await localeOf(params);
  const c = COPY[lang];
  return pageMetadata({ lang, path: '/spot-secret', title: c.metaTitle, description: c.metaDescription });
}

// Places for the trip picker: refreshed when a suggestion is approved (cache tag), at the latest hourly.
export const revalidate = 3600;

export default async function SpotSecretPage({ params }: Params) {
  const locale = await localeOf(params);
  const c = COPY[locale];
  const community = await loadCommunityPlaces(locale);
  const places = [...getCatalog(locale).places, ...community.places].map((p) => ({
    id: p.id,
    name: p.name,
    region: p.region,
  }));
  return (
    <main className="min-h-dvh bg-cream text-charcoal">
      <header className="border-b border-sand-200">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandLogo tag={c.brandTag} size={40} compact />
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
        <h1 className="mt-2 font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl">{c.title}</h1>
        <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-charcoal-500">{c.lead}</p>
        <SuggestTabs places={places} />
      </div>
      <footer className="border-t border-sand-200">
        <MadeBy className="mx-auto max-w-3xl px-4 py-6 sm:px-6" />
      </footer>
    </main>
  );
}
