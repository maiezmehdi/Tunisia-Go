import type { ReactNode } from 'react';

import BrandIcon from '@/components/BrandIcon';
import type { Locale } from '@/lib/i18n/config';
import { rental4x4WhatsAppUrl } from '@/lib/links';

export interface Topic {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  items: { term: string; text: ReactNode }[];
  action?: ReactNode;
}

export interface PratiqueCopy {
  metaTitle: string;
  metaDescription: string;
  brandTag: string;
  backToMap: string;
  eyebrow: string;
  title: string;
  lead: string;
  navLabel: string;
  /** Topic nav link to the « mots du cru » lexicon. */
  wordsNav: string;
  /** Topic nav link to the regional notes. */
  guidesNav: string;
  topics: Topic[];
  checklistTitle: string;
  checklist: string[];
  seasonNote: string;
  openMap: string;
}

// The prefilled WhatsApp message stays in French: it goes to the local team.
function RentalCta({ label }: { label: string }) {
  return (
    <a
      href={rental4x4WhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-pill bg-charcoal px-5 py-2.5 text-sm text-cream transition hover:bg-charcoal-700"
    >
      <BrandIcon brand="whatsapp" className="h-4 w-4" />
      {label}
    </a>
  );
}

const EMERGENCY_FR = <span className="tabular-nums">Police 197 · SAMU 190 · Pompiers 198 · Garde nationale 193</span>;
const EMERGENCY_EN = (
  <span className="tabular-nums">Police 197 · Ambulance (SAMU) 190 · Fire brigade 198 · National Guard 193</span>
);

export const PRATIQUE_COPY: Record<Locale, PratiqueCopy> = {
  fr: {
    metaTitle: 'Logistique & Pratique · Tunisia Go',
    metaDescription:
      'Location de 4x4, change, cartes SIM, conduite, santé et usages : tout ce qu’il faut régler avant un voyage en Tunisie.',
    brandTag: 'Pratique',
    backToMap: 'Retour à la carte',
    eyebrow: 'Logistique & Pratique',
    title: 'Tout ce qu’il faut régler avant la route',
    lead: 'Location, argent, téléphone et les petites règles qui facilitent le voyage, réunis au même endroit.',
    navLabel: 'Rubriques',
    wordsNav: 'Les mots du cru',
    guidesNav: 'Cahiers par région',
    topics: [
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
        action: <RentalCta label="Demander un 4x4 avec chauffeur" />,
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
          { term: 'Numéros d’urgence', text: EMERGENCY_FR },
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
    ],
    checklistTitle: 'Avant le désert',
    checklist: [
      'Road trip enregistré hors-ligne',
      'Plein fait et roue de secours',
      'Des dinars en espèces',
      'Cinq litres d’eau par personne',
      'Une SIM locale, même si le réseau est faible',
      'Quelqu’un qui connaît votre itinéraire',
    ],
    seasonNote:
      'Vous hésitez sur la période ? Choisissez un mois sur la carte : les spots trop chauds ou fermés sont masqués.',
    openMap: 'Ouvrir la carte',
  },
  en: {
    metaTitle: 'Practical Guide · Tunisia Go',
    metaDescription:
      '4x4 hire, currency, SIM cards, driving, health and local customs: everything to settle before a trip to Tunisia.',
    brandTag: 'Practical',
    backToMap: 'Back to the map',
    eyebrow: 'Logistics & Practicalities',
    title: 'Everything to settle before you hit the road',
    lead: 'Car hire, money, phones and the small rules that make travel easier, gathered in one place.',
    navLabel: 'Sections',
    wordsNav: 'Local words',
    guidesNav: 'Regional notes',
    topics: [
      {
        id: '4x4',
        eyebrow: 'Getting around',
        title: 'The 4x4 and the desert',
        intro:
          'The roads to Tozeur, Douz, Matmata and Tataouine are all paved, so an ordinary car will do. Beyond them, on the tracks, a 4x4 becomes essential: Ksar Ghilane, the dunes of the Grand Erg, the Star Wars sets around Ong Jemel.',
        items: [
          {
            term: 'Where to hire',
            text: 'Tozeur, Douz and Djerba have the most 4x4s. Hiring one with a driver is common, and often simpler than arranging insurance to drive yourself on sand.',
          },
          {
            term: 'Before setting off',
            text: 'A full tank, a spare wheel and 5 litres of water per person. Petrol stations grow scarce south of Douz.',
          },
          { term: 'In the dunes', text: 'Never alone, never after dark. Tell your hotel where you are heading.' },
        ],
        action: <RentalCta label="Request a 4x4 with a driver" />,
      },
      {
        id: 'route',
        eyebrow: 'Getting around',
        title: 'Driving and transport',
        intro:
          'Traffic drives on the right. Most travellers pair a hire car with a domestic flight or a train journey or two.',
        items: [
          {
            term: 'Speed limits',
            text: '50 km/h in towns, 90 on open roads, 110 on motorways. The A1 to Sfax is a toll road.',
          },
          {
            term: 'Checkpoints',
            text: 'Police and National Guard checkpoints are frequent. Slow down and keep your passport and the vehicle papers within reach.',
          },
          {
            term: 'At night',
            text: 'Best avoided in the South: unlit lorries, camels and sand drifting across the road.',
          },
          {
            term: 'Without a car',
            text: 'Louages (shared minibuses) link every town and leave as soon as they are full. Trains run from Tunis to Sousse, Sfax and Gabès. Flights connect Tunis with Djerba and Tozeur.',
          },
        ],
      },
      {
        id: 'change',
        eyebrow: 'Money',
        title: 'Dinars and exchange',
        intro:
          'The Tunisian dinar (TND) is a closed currency: it can only be obtained inside Tunisia, and taking it out of the country is prohibited.',
        items: [
          {
            term: 'Where to exchange',
            text: 'At the airport, banks, post offices and hotels. Rates are set by the Central Bank and vary little.',
          },
          {
            term: 'Keep the receipts',
            text: 'Exchange slips are required to convert any leftover dinars back at the airport before you fly home.',
          },
          {
            term: 'Cash or card',
            text: 'Cash machines in every town. Hotels and larger restaurants take cards; the souks, louages and the South run on cash.',
          },
          {
            term: 'Tipping',
            text: 'Around 10% in restaurants. Bargaining is expected in the souks, not in shops with marked prices.',
          },
        ],
      },
      {
        id: 'sim',
        eyebrow: 'Phone & internet',
        title: 'Local SIM cards',
        intro:
          'A local SIM costs little and makes WhatsApp, navigation and calls to drivers far easier. There are three networks: Ooredoo, Orange Tunisie and Tunisie Telecom.',
        items: [
          {
            term: 'Where to buy one',
            text: 'In the airport arrivals hall or at a network shop. A passport is required.',
          },
          {
            term: 'Data',
            text: 'Prepaid bundles of several gigabytes cost a few dinars and can be topped up at any kiosk.',
          },
          {
            term: 'Coverage',
            text: 'Good in towns and along the main roads, patchy in the Sahara and across the Chott el Jérid. Save your road trip offline before leaving Tozeur or Douz.',
          },
        ],
      },
      {
        id: 'sante',
        eyebrow: 'Health & safety',
        title: 'Water, sun and emergencies',
        intro: 'Pharmacies are everywhere, and every town keeps one open through the night.',
        items: [
          {
            term: 'Water',
            text: 'Tap water is treated in towns, but bottled water remains the norm, especially in the South.',
          },
          {
            term: 'Sun and cold',
            text: 'A hat and sunscreen all year round. Desert nights drop close to freezing from December to February.',
          },
          { term: 'Emergency numbers', text: EMERGENCY_EN },
        ],
      },
      {
        id: 'usages',
        eyebrow: 'Customs',
        title: 'Calendar, dress and languages',
        intro: 'A few habits that make visits run more smoothly.',
        items: [
          {
            term: 'Ramadan',
            text: 'Its dates move forward by about 11 days each year. Many cafés close during the day outside tourist areas; the evenings come alive.',
          },
          {
            term: 'Dress',
            text: 'Shoulders and knees covered in mosques and medinas. Most prayer halls are closed to non-Muslims.',
          },
          {
            term: 'Languages',
            text: 'Tunisian Arabic; French is understood almost everywhere, English in tourist areas.',
          },
          { term: 'Plugs and time', text: '230 V, European sockets (types C and E). UTC+1 all year round.' },
        ],
      },
    ],
    checklistTitle: 'Before the desert',
    checklist: [
      'Road trip saved offline',
      'A full tank and a spare wheel',
      'Dinars in cash',
      'Five litres of water per person',
      'A local SIM, even where the signal is weak',
      'Someone who knows your route',
    ],
    seasonNote: 'Not sure when to go? Pick a month on the map: spots that are too hot or closed are hidden.',
    openMap: 'Open the map',
  },
};
