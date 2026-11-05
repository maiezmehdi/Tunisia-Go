import { AGENCIES_SOURCE, agenciesFor, type Agency } from '@/data/agencies';
import type { Locale } from '@/lib/i18n/config';

const COPY = {
  fr: {
    title: 'Agences agréées ONTT',
    lead: 'Agences de voyages de la région agréées par l’ONTT. Le répertoire ne dit pas quels services elles proposent : demandez-leur directement.',
    open: (n: number) => `Voir les ${n} agences de la région`,
    category: (c: string) => `Catégorie ${c}`,
    call: 'Appeler',
    write: 'Écrire',
    site: 'Site',
    more: (n: number) => `Voir ${n} autre${n > 1 ? 's' : ''}`,
    source: 'Source',
  },
  en: {
    title: 'ONTT-approved agencies',
    lead: 'Travel agencies of the region approved by the ONTT. The directory does not say which services they offer: ask them directly.',
    open: (n: number) => `Show the ${n} agencies of the region`,
    category: (c: string) => `Category ${c}`,
    call: 'Call',
    write: 'E-mail',
    site: 'Website',
    more: (n: number) => `Show ${n} more`,
    source: 'Source',
  },
} as const;

const SHOWN = 10;

const action =
  'rounded-pill border border-sand-300 px-3.5 py-1.5 text-sm text-charcoal transition hover:border-charcoal';

function AgencyCard({ agency, locale }: { agency: Agency; locale: Locale }) {
  const c = COPY[locale];
  return (
    <li className="py-4">
      <p className="text-[15px] font-medium text-charcoal">{agency.name}</p>
      <p className="mt-0.5 text-sm text-charcoal-500">
        {[agency.category ? c.category(agency.category) : null, agency.address].filter(Boolean).join(' · ')}
      </p>
      {(agency.phone || agency.email || agency.site) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {agency.phone && (
            <a href={`tel:+216${agency.phone}`} className={action}>
              {c.call} {agency.phone.replace(/(\d{2})(\d{3})(\d{3})/, '$1 $2 $3')}
            </a>
          )}
          {agency.email && (
            <a href={`mailto:${agency.email}`} className={action}>
              {c.write}
            </a>
          )}
          {agency.site && (
            <a href={agency.site} target="_blank" rel="noopener noreferrer nofollow" className={action}>
              {c.site}
            </a>
          )}
        </div>
      )}
    </li>
  );
}

/** ONTT-approved agencies of the place's region. Folded by default; makes no promise about what they offer. */
export default function NearbyAgencies({
  governorate,
  locale,
  className = '',
}: {
  governorate: string;
  locale: Locale;
  className?: string;
}) {
  const found = agenciesFor(governorate);
  if (!found || found.agencies.length === 0) return null;
  const c = COPY[locale];
  const first = found.agencies.slice(0, SHOWN);
  const rest = found.agencies.slice(SHOWN);
  return (
    <section aria-label={c.title} className={className}>
      <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">{c.title}</h3>
      <p className="mt-2 text-sm text-charcoal-500">{c.lead}</p>
      <details className="group mt-2 border-y border-sand-200">
        <summary className="cursor-pointer py-3 text-sm text-charcoal underline decoration-sand-300 underline-offset-4 group-open:hidden">
          {c.open(found.agencies.length)}
        </summary>
        <ul className="divide-y divide-sand-200">
          {first.map((a) => (
            <AgencyCard key={a.name + (a.phone ?? '')} agency={a} locale={locale} />
          ))}
        </ul>
        {rest.length > 0 && (
          <details className="group/more border-t border-sand-200">
            <summary className="cursor-pointer py-3 text-sm text-charcoal underline decoration-sand-300 underline-offset-4 group-open/more:hidden">
              {c.more(rest.length)}
            </summary>
            <ul className="divide-y divide-sand-200">
              {rest.map((a) => (
                <AgencyCard key={a.name + (a.phone ?? '')} agency={a} locale={locale} />
              ))}
            </ul>
          </details>
        )}
      </details>
      <p className="mt-3 text-xs text-charcoal-300">
        {c.source} :{' '}
        <a
          href={AGENCIES_SOURCE.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-sand-300 underline-offset-4 hover:text-charcoal"
        >
          {locale === 'en' ? AGENCIES_SOURCE.labelEn : AGENCIES_SOURCE.label}
        </a>
        .
      </p>
    </section>
  );
}
