import type { Metadata } from 'next';

import BrandLogo from '@/components/BrandLogo';
import LanguageSwitch from '@/components/LanguageSwitch';
import SoundToggle from '@/components/SoundToggle';
import Lexicon from '@/components/Lexicon';
import RegionGuides from '@/components/RegionGuides';
import MadeBy from '@/components/MadeBy';
import { isLocale, type Locale } from '@/lib/i18n/config';

import { PRATIQUE_COPY } from './copy';

type Params = { params: Promise<{ lang: string }> };

async function localeOf(params: Params['params']): Promise<Locale> {
  const { lang } = await params;
  return isLocale(lang) ? lang : 'fr';
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const c = PRATIQUE_COPY[await localeOf(params)];
  return { title: c.metaTitle, description: c.metaDescription };
}

export default async function PratiquePage({ params }: Params) {
  const locale = await localeOf(params);
  const c = PRATIQUE_COPY[locale];
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
              {c.backToMap}
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 pb-24 pt-12 sm:px-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">{c.eyebrow}</p>
        <h1 className="mt-2 max-w-2xl font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl">{c.title}</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-charcoal-500">{c.lead}</p>

        <nav
          aria-label={c.navLabel}
          className="no-scrollbar -mx-4 mt-8 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0"
        >
          {c.topics.map((t) => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className="shrink-0 rounded-pill border border-sand-200 px-4 py-1.5 text-sm text-charcoal-700 transition hover:border-charcoal-300 hover:text-charcoal"
            >
              {t.title}
            </a>
          ))}
          <a
            href="#cahiers"
            className="shrink-0 rounded-pill border border-sand-200 px-4 py-1.5 text-sm text-charcoal-700 transition hover:border-charcoal-300 hover:text-charcoal"
          >
            {c.guidesNav}
          </a>
          <a
            href="#mots"
            className="shrink-0 rounded-pill border border-sand-200 px-4 py-1.5 text-sm text-charcoal-700 transition hover:border-charcoal-300 hover:text-charcoal"
          >
            {c.wordsNav}
          </a>
        </nav>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_300px] lg:gap-16">
          <div className="divide-y divide-sand-200 border-t border-sand-200">
            {c.topics.map((t) => (
              <section key={t.id} id={t.id} className="scroll-mt-6 py-10">
                <p className="text-[11px] uppercase tracking-[0.18em] text-charcoal-300">{t.eyebrow}</p>
                <h2 className="mt-1.5 font-serif text-3xl leading-tight">{t.title}</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-charcoal-700">{t.intro}</p>
                <dl className="mt-6 divide-y divide-sand-200 border-y border-sand-200">
                  {t.items.map((item) => (
                    <div key={item.term} className="grid gap-1 py-3.5 sm:grid-cols-[180px_1fr] sm:gap-6">
                      <dt className="text-sm font-medium text-charcoal">{item.term}</dt>
                      <dd className="text-sm leading-relaxed text-charcoal-500">{item.text}</dd>
                    </div>
                  ))}
                </dl>
                {t.action && <div className="mt-6">{t.action}</div>}
              </section>
            ))}
          </div>

          <aside className="lg:pt-10">
            <div className="rounded-3xl border border-sand-200 p-6 lg:sticky lg:top-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">
                {c.checklistTitle}
              </p>
              <ul className="mt-4 space-y-3">
                {c.checklist.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-charcoal-700">
                    <span aria-hidden className="mt-[9px] h-px w-3 shrink-0 bg-charcoal-300" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-sand-200 pt-4 text-sm leading-relaxed text-charcoal-500">
                {c.seasonNote}
              </p>
              <a
                href="/explore"
                className="mt-3 inline-block text-sm text-charcoal underline decoration-sand-300 underline-offset-4 transition hover:decoration-charcoal"
              >
                {c.openMap}
              </a>
            </div>
          </aside>
        </div>

        <div className="mt-16">
          <RegionGuides locale={locale} />
        </div>

        <div className="mt-16">
          <Lexicon />
        </div>
      </div>
      <footer className="border-t border-sand-200">
        <MadeBy className="mx-auto max-w-5xl px-4 py-6 sm:px-6" />
      </footer>
    </main>
  );
}
