import type { Metadata } from 'next';

import BrandLogo from '@/components/BrandLogo';
import LanguageSwitch from '@/components/LanguageSwitch';
import ProAuthButton from '@/components/ProAuthButton';
import MadeBy from '@/components/MadeBy';
import ProsDirectory, { type DirectoryPro } from '@/components/ProsDirectory';
import SoundToggle from '@/components/SoundToggle';
import { PLACE_BY_ID } from '@/data/tunisiaData';
import { getCatalog } from '@/lib/i18n/catalog';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { proWhatsAppUrl } from '@/lib/links';
import { loadPublishedPros, PRO_ACTIVITIES, PRO_LANGUAGES, socialsHref } from '@/lib/pros';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 3600;

type Params = { params: Promise<{ lang: string }> };

const COPY = {
  fr: {
    brandTag: 'Guides et agences',
    metaTitle: 'Guides et agences en Tunisie · Tunisia Go',
    metaDescription:
      'Des guides et des agences qui se sont inscrits eux-mêmes sur Tunisia Go, joignables directement sur WhatsApp.',
    eyebrow: 'Guides et agences',
    title: 'Les guides et agences du site',
    lead: 'Ces professionnels se sont inscrits eux-mêmes. Tunisia Go ne garantit pas leurs prestations : demandez toujours leur carte professionnelle avant de réserver.',
    guide: 'Guide indépendant',
    agency: 'Agence',
    declared: 'Carte professionnelle déclarée',
    experience: 'Expérience',
    edit: 'Modifier ma fiche',
    languages: 'Langues parlées',
    activities: 'Types de sorties',
    price: 'Prix indicatif',
    declaredHint: 'Le numéro a été indiqué par la personne, nous ne l’avons pas vérifié officiellement.',
    contact: 'Écrire sur WhatsApp',
    empty: 'Aucune fiche publiée pour le moment.',
    list: 'Liste',
    map: 'Carte',
    mapEmpty: 'Les fiches sans lieu d’exercice ne sont pas sur la carte.',
    loadingMap: 'Chargement de la carte…',
    joinTitle: 'Vous êtes guide ou agence ?',
    joinLead:
      'Inscrivez-vous en quelques lignes avec votre e-mail, sans mot de passe. Vous pourrez modifier votre fiche quand vous voulez.',
    join: 'Inscrire ou modifier ma fiche',
    openMap: 'Ouvrir la carte',
  },
  en: {
    brandTag: 'Guides and agencies',
    metaTitle: 'Guides and agencies in Tunisia · Tunisia Go',
    metaDescription: 'Guides and agencies that registered themselves on Tunisia Go, reachable directly on WhatsApp.',
    eyebrow: 'Guides and agencies',
    title: 'The site’s guides and agencies',
    lead: 'These professionals registered themselves. Tunisia Go does not guarantee their services: always ask to see their professional card before booking.',
    guide: 'Independent guide',
    agency: 'Agency',
    declared: 'Professional card declared',
    experience: 'Experience',
    edit: 'Edit my listing',
    languages: 'Languages spoken',
    activities: 'Kinds of trips',
    price: 'Indicative price',
    declaredHint: 'The number was given by the person; we have not checked it officially.',
    contact: 'Write on WhatsApp',
    empty: 'No listing published yet.',
    list: 'List',
    map: 'Map',
    mapEmpty: 'Listings without a place of work are not on the map.',
    loadingMap: 'Loading the map…',
    joinTitle: 'Are you a guide or an agency?',
    joinLead: 'Register in a few lines with your e-mail, no password. You can change your listing whenever you like.',
    join: 'Register or edit my listing',
    openMap: 'Open the map',
  },
} as const;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'fr';
  const c = COPY[locale];
  return pageMetadata({ lang: locale, path: '/guides', title: c.metaTitle, description: c.metaDescription });
}

export default async function GuidesPage({ params }: Params) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : 'fr';
  const c = COPY[locale];
  const pros = await loadPublishedPros();
  const catalog = getCatalog(locale);
  const directory: DirectoryPro[] = pros.map((p) => {
    const base = p.placeId ? PLACE_BY_ID[p.placeId] : undefined;
    // A small, steady offset (from the id) keeps pins at the same place from sitting on top of each other.
    const h = [...p.id].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) >>> 0, 7);
    const coords: [number, number] | null = base
      ? [base.coords[0] + ((h % 1000) / 1000 - 0.5) * 0.04, base.coords[1] + (((h >> 10) % 1000) / 1000 - 0.5) * 0.04]
      : null;
    return {
      id: p.id,
      kind: p.kind,
      name: p.name,
      whatsappUrl: proWhatsAppUrl(p.whatsapp, p.name, locale),
      socials: p.socials,
      socialsHref: p.socials ? socialsHref(p.socials) : null,
      cardDeclared: p.cardDeclared,
      bio: p.bio,
      experience: p.experience,
      languageNames: PRO_LANGUAGES.filter((l) => p.languages.includes(l.id)).map((l) => l[locale]),
      activityNames: PRO_ACTIVITIES.filter((a) => p.activities.includes(a.id)).map((a) => a[locale]),
      priceNote: p.priceNote,
      placeName: p.placeId ? (catalog.placeById[p.placeId]?.name ?? null) : null,
      coords,
      photoUrl: p.photoUrl,
    };
  });
  const labels = {
    guide: c.guide,
    agency: c.agency,
    declared: c.declared,
    experience: c.experience,
    edit: c.edit,
    languages: c.languages,
    activities: c.activities,
    price: c.price,
    declaredHint: c.declaredHint,
    contact: c.contact,
    empty: c.empty,
    list: c.list,
    map: c.map,
    mapEmpty: c.mapEmpty,
    loadingMap: c.loadingMap,
  };

  return (
    <main className="min-h-dvh bg-cream text-charcoal">
      <header className="border-b border-sand-200">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandLogo tag={c.brandTag} size={40} compact />
          <div className="flex items-center gap-5">
            <SoundToggle />
            <LanguageSwitch />
            <ProAuthButton className="text-sm text-charcoal-500 underline-offset-4 transition hover:text-charcoal hover:underline" />
            <a
              href="/explore"
              className="text-sm text-charcoal-500 underline-offset-4 transition hover:text-charcoal hover:underline"
            >
              {c.openMap}
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 pb-24 pt-12 sm:px-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">{c.eyebrow}</p>
        <h1 className="mt-2 max-w-2xl font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl">{c.title}</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-charcoal-500">{c.lead}</p>

        <ProsDirectory pros={directory} labels={labels} />

        <section className="mt-20 max-w-xl border-t border-sand-200 pt-10" aria-label={c.joinTitle}>
          <h2 className="font-serif text-3xl leading-tight">{c.joinTitle}</h2>
          <p className="mt-2 mb-6 text-charcoal-500">{c.joinLead}</p>
          <a
            href={locale === 'fr' ? '/guides/modifier' : '/en/guides/modifier'}
            className="inline-block rounded-pill bg-charcoal px-5 py-2.5 text-sm text-cream transition hover:bg-charcoal-700"
          >
            {c.join}
          </a>
        </section>
      </div>
      <div className="border-t border-sand-200">
        <MadeBy className="mx-auto max-w-5xl px-4 py-6 sm:px-6" />
      </div>
    </main>
  );
}
