import type { Metadata } from 'next';

import BrandLogo from '@/components/BrandLogo';
import LanguageSwitch from '@/components/LanguageSwitch';
import MadeBy from '@/components/MadeBy';
import ProReportButton from '@/components/ProReportButton';
import ProSignup from '@/components/ProSignup';
import SoundToggle from '@/components/SoundToggle';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { proWhatsAppUrl } from '@/lib/links';
import { loadPublishedPros, socialsHref } from '@/lib/pros';
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
    declaredHint: 'Le numéro a été indiqué par la personne, nous ne l’avons pas vérifié officiellement.',
    contact: 'Écrire sur WhatsApp',
    empty: 'Aucune fiche publiée pour le moment.',
    joinTitle: 'Vous êtes guide ou agence ?',
    joinLead: 'Inscrivez-vous en quelques lignes, sans créer de compte.',
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
    declaredHint: 'The number was given by the person; we have not checked it officially.',
    contact: 'Write on WhatsApp',
    empty: 'No listing published yet.',
    joinTitle: 'Are you a guide or an agency?',
    joinLead: 'Register in a few lines, without creating an account.',
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

  return (
    <main className="min-h-dvh bg-cream text-charcoal">
      <header className="border-b border-sand-200">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandLogo tag={c.brandTag} size={40} compact />
          <div className="flex items-center gap-5">
            <SoundToggle />
            <LanguageSwitch />
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

        {pros.length === 0 ? (
          <p className="mt-12 border-t border-sand-200 pt-6 text-sm text-charcoal-500">{c.empty}</p>
        ) : (
          <ul className="mt-12 grid gap-5 sm:grid-cols-2">
            {pros.map((p) => {
              const href = proWhatsAppUrl(p.whatsapp, p.name, locale);
              const social = p.socials ? socialsHref(p.socials) : null;
              return (
                <li key={p.id} className="flex flex-col rounded-3xl border border-sand-200 bg-white p-6">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-charcoal-300">{c[p.kind]}</p>
                  <h2 className="mt-1 font-serif text-2xl leading-tight">{p.name}</h2>
                  {p.cardDeclared && (
                    <p className="mt-2 text-sm text-charcoal-700" title={c.declaredHint}>
                      {c.declared}
                    </p>
                  )}
                  {p.socials &&
                    (social ? (
                      <a
                        href={social}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="mt-1 break-all text-sm text-charcoal-500 underline decoration-sand-300 underline-offset-4 hover:text-charcoal"
                      >
                        {p.socials}
                      </a>
                    ) : (
                      <p className="mt-1 break-all text-sm text-charcoal-500">{p.socials}</p>
                    ))}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    {href && (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-pill bg-charcoal px-4 py-2 text-sm text-cream transition hover:bg-charcoal-700"
                      >
                        {c.contact}
                      </a>
                    )}
                    <ProReportButton listingId={p.id} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <section className="mt-20 max-w-xl border-t border-sand-200 pt-10" aria-label={c.joinTitle}>
          <h2 className="font-serif text-3xl leading-tight">{c.joinTitle}</h2>
          <p className="mt-2 mb-6 text-charcoal-500">{c.joinLead}</p>
          <ProSignup />
        </section>
      </div>
      <div className="border-t border-sand-200">
        <MadeBy className="mx-auto max-w-5xl px-4 py-6 sm:px-6" />
      </div>
    </main>
  );
}
