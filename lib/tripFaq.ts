import { tripBestMonthsLabel } from '@/data/seasons';
import type { Itinerary } from '@/data/types';
import type { Locale } from '@/lib/i18n/config';

export interface FaqItem {
  q: string;
  /** Plain text, used on the page and in the structured data. */
  a: string;
}

/** Road trips that fit each kind of trip, by itinerary id. */
const THEMES: { id: string; fr: string; en: string; trips: string[] }[] = [
  {
    id: 'roman',
    fr: 'les ruines romaines',
    en: 'Roman ruins',
    trips: ['roman-heritage', 'high-tell'],
  },
  {
    id: 'desert',
    fr: 'le désert et les ksour',
    en: 'the desert and the ksour',
    trips: ['star-wars', 'ksour-route', 'deep-south-4x4'],
  },
  {
    id: 'coast',
    fr: 'la mer et les îles',
    en: 'the sea and the islands',
    trips: ['cap-bon', 'djerba-slow'],
  },
  {
    id: 'mountain',
    fr: 'la montagne et les oasis',
    en: 'the mountains and oases',
    trips: ['mountain-oases', 'wild-north'],
  },
  {
    id: 'cities',
    fr: 'les villes saintes et les médinas',
    en: 'holy cities and medinas',
    trips: ['sacred-medinas'],
  },
];

/** Questions about road trips in Tunisia, answered only from the itineraries on the site. */
export function tripFaq(trips: Itinerary[], locale: Locale): FaqItem[] {
  const fr = locale === 'fr';
  const byId = new Map(trips.map((t) => [t.id, t]));
  const days = trips.map((t) => t.days);
  const min = Math.min(...days);
  const max = Math.max(...days);
  const label = (t: Itinerary) => `${t.name} (${t.days} ${fr ? 'jours' : 'days'})`;

  const items: FaqItem[] = [
    {
      q: fr
        ? 'Combien de jours faut-il pour un road trip en Tunisie ?'
        : 'How many days do you need for a road trip in Tunisia?',
      a: fr
        ? `Les ${trips.length} road trips de Tunisia Go durent de ${min} à ${max} jours : ${trips.map(label).join(', ')}. Chaque itinéraire détaille ses étapes et peut s’allonger si vous voulez prendre votre temps.`
        : `The ${trips.length} Tunisia Go road trips last from ${min} to ${max} days: ${trips.map(label).join(', ')}. Each route lists its stops and can be stretched if you want to take your time.`,
    },
  ];

  for (const theme of THEMES) {
    const picks = theme.trips.map((id) => byId.get(id)).filter((t): t is Itinerary => !!t);
    if (picks.length === 0) continue;
    items.push({
      q: fr
        ? `Quel road trip choisir pour ${theme[locale]} ?`
        : `Which road trip should you choose for ${theme[locale]}?`,
      a: fr
        ? `Pour ${theme.fr}, voyez : ${picks.map(label).join(', ')}.`
        : `For ${theme.en}, look at: ${picks.map(label).join(', ')}.`,
    });
  }

  const seasons = trips
    .map((t) => ({ t, months: tripBestMonthsLabel(t.stops, locale) }))
    .filter((x): x is { t: Itinerary; months: string } => !!x.months);
  if (seasons.length > 0) {
    items.push({
      q: fr
        ? 'Quelle est la meilleure période pour un road trip en Tunisie ?'
        : 'When is the best time for a road trip in Tunisia?',
      a: fr
        ? `Cela dépend de l’itinéraire. Mois conseillés pour chaque road trip : ${seasons.map((s) => `${s.t.name} (${s.months})`).join(' ; ')}.`
        : `It depends on the route. Recommended months for each road trip: ${seasons.map((s) => `${s.t.name} (${s.months})`).join('; ')}.`,
    });
  }
  return items;
}
