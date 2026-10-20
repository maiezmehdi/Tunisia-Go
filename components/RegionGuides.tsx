import { guideAnchor, regionGuides } from '@/data/regionGuides';
import type { Locale } from '@/lib/i18n/config';

const COPY = {
  fr: {
    eyebrow: 'Cahiers pratiques',
    title: 'Région par région, les usages qui comptent',
    intro:
      'Négocier, s’habiller, éviter la chaleur, entrer chez l’habitant : quelques repères courts pour chaque coin du pays.',
    nav: 'Régions',
  },
  en: {
    eyebrow: 'Regional notes',
    title: 'Region by region, the customs that matter',
    intro:
      'Bargaining, dress, beating the heat, visiting people at home: a few short pointers for each part of the country.',
    nav: 'Regions',
  },
};

export default function RegionGuides({ locale }: { locale: Locale }) {
  const c = COPY[locale];
  const guides = regionGuides(locale);
  return (
    <section id="cahiers" className="scroll-mt-6 border-t border-sand-200 pt-12">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">{c.eyebrow}</p>
      <h2 className="mt-1.5 max-w-2xl font-serif text-3xl leading-tight sm:text-4xl">{c.title}</h2>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-charcoal-700">{c.intro}</p>

      <nav
        aria-label={c.nav}
        className="no-scrollbar -mx-4 mt-6 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {guides.map((g) => (
          <a
            key={g.id}
            href={`#${guideAnchor(g.id)}`}
            className="shrink-0 rounded-pill border border-sand-200 px-4 py-1.5 text-sm text-charcoal-700 transition hover:border-charcoal-300 hover:text-charcoal"
          >
            {g.title}
          </a>
        ))}
      </nav>

      <div className="mt-10 space-y-14">
        {guides.map((g) => (
          <article key={g.id} id={guideAnchor(g.id)} className="scroll-mt-6">
            <h3 className="font-serif text-2xl leading-tight">{g.title}</h3>
            {g.covers && <p className="mt-1 text-sm text-charcoal-500">{g.covers}</p>}
            <dl className="mt-5 grid gap-x-10 sm:grid-cols-2">
              {g.notes.map((n) => (
                <div key={n.title} className="border-t border-sand-200 py-4">
                  <dt className="text-sm font-medium text-charcoal">{n.title}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-charcoal-500">{n.text}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
