import { STAYS_SOURCE, staysNear, type Stay, type StayKind } from '@/data/stays';
import type { Locale } from '@/lib/i18n/config';

const COPY = {
  fr: {
    title: 'Où dormir près d’ici',
    lead: 'Hébergements classés ONTT, à une trentaine de minutes au plus.',
    badge: 'Hébergement classé ONTT',
    call: 'Appeler',
    write: 'Écrire',
    site: 'Site',
    more: (n: number) => `Voir ${n} autre${n > 1 ? 's' : ''}`,
    source: 'Source',
    kinds: {
      charm: 'Hôtel de charme',
      aparthotel: 'Appart-hôtel',
      guesthouse: 'Chambre d’hôte',
      rural: 'Gîte rural',
      family: 'Pension de famille',
      camp: 'Campement',
    } satisfies Record<StayKind, string>,
  },
  en: {
    title: 'Where to sleep nearby',
    lead: 'ONTT-classified stays, about thirty minutes away at most.',
    badge: 'ONTT-classified stay',
    call: 'Call',
    write: 'E-mail',
    site: 'Website',
    more: (n: number) => `Show ${n} more`,
    source: 'Source',
    kinds: {
      charm: 'Charm hotel',
      aparthotel: 'Apart-hotel',
      guesthouse: 'Guesthouse',
      rural: 'Rural lodge',
      family: 'Family guesthouse',
      camp: 'Desert camp',
    } satisfies Record<StayKind, string>,
  },
} as const;

const SHOWN = 4;

const action =
  'rounded-pill border border-sand-300 px-3.5 py-1.5 text-sm text-charcoal transition hover:border-charcoal';

function StayCard({ stay, locale }: { stay: Stay; locale: Locale }) {
  const c = COPY[locale];
  const phone = stay.phones[0];
  return (
    <li className="py-4">
      <p className="text-[15px] font-medium text-charcoal">{stay.name}</p>
      <p className="mt-0.5 text-sm text-charcoal-500">
        {c.kinds[stay.kind]}
        {stay.address ? ` · ${stay.address}` : ''}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-charcoal-300">{c.badge}</p>
      {(phone || stay.email || stay.site) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {phone && (
            <a href={`tel:+216${phone}`} className={action}>
              {c.call} {phone.replace(/(\d{2})(\d{3})(\d{3})/, '$1 $2 $3')}
            </a>
          )}
          {stay.email && (
            <a href={`mailto:${stay.email}`} className={action}>
              {c.write}
            </a>
          )}
          {stay.site && (
            <a href={stay.site} target="_blank" rel="noopener noreferrer nofollow" className={action}>
              {c.site}
            </a>
          )}
        </div>
      )}
    </li>
  );
}

/** Classified stays from the ONTT directory near a place. Kept apart from the Tunisie Booking / Airbnb links. */
export default function NearbyStays({
  placeId,
  locale,
  className = '',
}: {
  placeId: string;
  locale: Locale;
  className?: string;
}) {
  const stays = staysNear(placeId);
  if (stays.length === 0) return null;
  const c = COPY[locale];
  const first = stays.slice(0, SHOWN);
  const rest = stays.slice(SHOWN);
  return (
    <section aria-label={c.title} className={className}>
      <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">{c.title}</h3>
      <p className="mt-2 text-sm text-charcoal-500">{c.lead}</p>
      <ul className="mt-2 divide-y divide-sand-200 border-y border-sand-200">
        {first.map((s) => (
          <StayCard key={s.id} stay={s} locale={locale} />
        ))}
      </ul>
      {rest.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer py-3 text-sm text-charcoal underline decoration-sand-300 underline-offset-4 group-open:hidden">
            {c.more(rest.length)}
          </summary>
          <ul className="divide-y divide-sand-200 border-b border-sand-200">
            {rest.map((s) => (
              <StayCard key={s.id} stay={s} locale={locale} />
            ))}
          </ul>
        </details>
      )}
      <p className="mt-3 text-xs text-charcoal-300">
        {c.source} :{' '}
        <a
          href={STAYS_SOURCE.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-sand-300 underline-offset-4 hover:text-charcoal"
        >
          {locale === 'en' ? STAYS_SOURCE.labelEn : STAYS_SOURCE.label}
        </a>
        .
      </p>
    </section>
  );
}
