import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import BrandIcon from '@/components/BrandIcon';
import { rental4x4WhatsAppUrl } from '@/lib/links';

export const metadata: Metadata = {
  title: 'Logistique & Pratique · Tunisia Go',
  description:
    'Location de 4x4, change, cartes SIM, conduite, santé et usages : tout ce qu’il faut régler avant un voyage en Tunisie.',
};

interface Topic {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  items: { term: string; text: ReactNode }[];
  action?: ReactNode;
}

const TOPICS: Topic[] = [
  {
    id: '4x4',
    eyebrow: 'Se déplacer',
    title: 'Le 4x4 et le désert',
    intro:
      'Les routes vers Tozeur, Douz, Matmata et Tataouine sont goudronnées : une voiture classique suffit. Le 4x4 devient indispensable sur les pistes au-delà : Ksar Ghilane, les dunes du Grand Erg, les décors de Star Wars autour d’Ong Jemel.',
    items: [
      {
        term: 'Où louer',
        text: 'Tozeur, Douz et Djerba ont le plus de 4x4. La location avec chauffeur est courante, et souvent plus simple que l’assurance en conduite libre sur le sable.',
      },
      {
        term: 'Avant de partir',
        text: 'Plein d’essence, roue de secours, 5 litres d’eau par personne. Les stations se font rares au sud de Douz.',
      },
      { term: 'Dans les dunes', text: 'Jamais seul, jamais de nuit. Dites à votre hôtel où vous allez.' },
    ],
    action: (
      <a
        href={rental4x4WhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-pill bg-charcoal px-5 py-2.5 text-sm text-cream transition hover:bg-charcoal-700"
      >
        <BrandIcon brand="whatsapp" className="h-4 w-4" />
        Demander un 4x4 avec chauffeur
      </a>
    ),
  },
  {
    id: 'route',
    eyebrow: 'Se déplacer',
    title: 'Conduite et transports',
    intro:
      'On roule à droite. La plupart des voyageurs combinent une voiture de location avec quelques vols intérieurs ou trains.',
    items: [
      {
        term: 'Limitations',
        text: '50 km/h en ville, 90 sur route, 110 sur autoroute. L’A1 vers Sfax est à péage.',
      },
      {
        term: 'Contrôles',
        text: 'Les barrages de police et de Garde nationale sont fréquents. Ralentissez, gardez passeport et papiers du véhicule à portée de main.',
      },
      {
        term: 'De nuit',
        text: 'À éviter dans le Sud : camions sans feux, dromadaires, sable sur la chaussée.',
      },
      {
        term: 'Sans voiture',
        text: 'Les louages (minibus collectifs) relient toutes les villes et partent quand ils sont pleins. Le train va de Tunis à Sousse, Sfax et Gabès. Des vols rejoignent Djerba et Tozeur depuis Tunis.',
      },
    ],
  },
  {
    id: 'change',
    eyebrow: 'Argent',
    title: 'Dinars et change',
    intro:
      'Le dinar tunisien (TND) est une monnaie non convertible : on ne l’obtient qu’en Tunisie, et il est interdit de le sortir du pays.',
    items: [
      {
        term: 'Où changer',
        text: 'Aéroport, banques, bureaux de poste et hôtels. Les taux sont fixés par la Banque centrale et varient peu.',
      },
      {
        term: 'Gardez les reçus',
        text: 'Les bordereaux de change sont demandés pour reconvertir vos dinars restants à l’aéroport avant le départ.',
      },
      {
        term: 'Espèces ou carte',
        text: 'Distributeurs dans toutes les villes. Hôtels et grands restaurants acceptent la carte ; souks, louages et le Sud fonctionnent en espèces.',
      },
      {
        term: 'Pourboire',
        text: 'Environ 10 % au restaurant. On marchande dans les souks, pas dans les boutiques à prix affichés.',
      },
    ],
  },
  {
    id: 'sim',
    eyebrow: 'Téléphone & internet',
    title: 'Cartes SIM locales',
    intro:
      'Une SIM locale coûte peu et simplifie WhatsApp, la navigation et les appels aux chauffeurs. Trois opérateurs : Ooredoo, Orange Tunisie et Tunisie Telecom.',
    items: [
      {
        term: 'Où l’acheter',
        text: 'Dans le hall d’arrivée de l’aéroport ou en boutique opérateur. Passeport obligatoire.',
      },
      {
        term: 'Data',
        text: 'Les forfaits prépayés de plusieurs Go coûtent quelques dinars et se rechargent dans les kiosques.',
      },
      {
        term: 'Couverture',
        text: 'Bonne en ville et le long des grands axes, aléatoire dans le Sahara et sur le Chott el Jérid. Enregistrez votre road trip hors-ligne avant de quitter Tozeur ou Douz.',
      },
    ],
  },
  {
    id: 'sante',
    eyebrow: 'Santé & sécurité',
    title: 'Eau, soleil et urgences',
    intro: 'Les pharmacies sont partout, et chaque ville garde une pharmacie de nuit.',
    items: [
      {
        term: 'Eau',
        text: 'L’eau du robinet est traitée en ville, mais l’eau en bouteille reste la norme, surtout dans le Sud.',
      },
      {
        term: 'Soleil et froid',
        text: 'Chapeau et crème solaire toute l’année. Les nuits du désert frôlent zéro de décembre à février.',
      },
      {
        term: 'Numéros d’urgence',
        text: (
          <span className="tabular-nums">Police 197 · SAMU 190 · Pompiers 198 · Garde nationale 193</span>
        ),
      },
    ],
  },
  {
    id: 'usages',
    eyebrow: 'Usages',
    title: 'Calendrier, tenue et langues',
    intro: 'Quelques habitudes qui rendent les visites plus simples.',
    items: [
      {
        term: 'Ramadan',
        text: 'Ses dates avancent d’environ 11 jours chaque année. Beaucoup de cafés ferment en journée hors des zones touristiques ; les soirées sont animées.',
      },
      {
        term: 'Tenue',
        text: 'Épaules et genoux couverts dans les mosquées et les médinas. La plupart des salles de prière sont fermées aux non-musulmans.',
      },
      {
        term: 'Langues',
        text: 'Arabe tunisien, français compris presque partout, anglais dans les zones touristiques.',
      },
      { term: 'Prises et heure', text: '230 V, prises européennes (types C et E). UTC+1 toute l’année.' },
    ],
  },
];

const DESERT_CHECKLIST = [
  'Road trip enregistré hors-ligne',
  'Plein fait et roue de secours',
  'Des dinars en espèces',
  'Cinq litres d’eau par personne',
  'Une SIM locale, même si le réseau est faible',
  'Quelqu’un qui connaît votre itinéraire',
];

export default function PratiquePage() {
  return (
    <main className="min-h-dvh bg-cream text-charcoal">
      <header className="border-b border-sand-200">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="/" className="leading-none">
            <span className="block font-serif text-2xl tracking-tight">Tunisia Go</span>
            <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.24em] text-charcoal-300">
              Pratique
            </span>
          </a>
          <a
            href="/explore"
            className="text-sm text-charcoal-500 underline-offset-4 transition hover:text-charcoal hover:underline"
          >
            Retour à la carte
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 pb-24 pt-12 sm:px-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">Logistique & Pratique</p>
        <h1 className="mt-2 max-w-2xl font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl">
          Tout ce qu’il faut régler avant la route
        </h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-charcoal-500">
          Location, argent, téléphone et les petites règles qui facilitent le voyage, réunis au même endroit.
        </p>

        <nav aria-label="Rubriques" className="no-scrollbar -mx-4 mt-8 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {TOPICS.map((t) => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className="shrink-0 rounded-pill border border-sand-200 px-4 py-1.5 text-sm text-charcoal-700 transition hover:border-charcoal-300 hover:text-charcoal"
            >
              {t.title}
            </a>
          ))}
        </nav>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_300px] lg:gap-16">
          <div className="divide-y divide-sand-200 border-t border-sand-200">
            {TOPICS.map((t) => (
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
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">Avant le désert</p>
              <ul className="mt-4 space-y-3">
                {DESERT_CHECKLIST.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-charcoal-700">
                    <span aria-hidden className="mt-[9px] h-px w-3 shrink-0 bg-charcoal-300" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-sand-200 pt-4 text-sm leading-relaxed text-charcoal-500">
                Vous hésitez sur la période ? Choisissez un mois sur la carte : les spots trop chauds ou fermés sont masqués.
              </p>
              <a
                href="/explore"
                className="mt-3 inline-block text-sm text-charcoal underline decoration-sand-300 underline-offset-4 transition hover:decoration-charcoal"
              >
                Ouvrir la carte
              </a>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
