import type { Locale } from '@/lib/i18n/config';

/** "Cahiers pratiques": short regional notes on customs, bargaining, heat and good manners. */
export interface GuideNote {
  title: string;
  text: string;
}

export interface RegionGuide {
  id: string;
  title: string;
  /** Towns the guide covers, shown under the title. */
  covers?: string;
  notes: GuideNote[];
}

type Localized = Record<Locale, RegionGuide>;

const GUIDES: Localized[] = [
  {
    fr: {
      id: 'tunis',
      title: 'Tunis, Carthage et Sidi Bou Saïd',
      notes: [
        {
          title: 'Négocier dans les souks',
          text: 'Dans la médina, le premier prix est une ouverture, pas une insulte. Commencez bas, restez souriant et partez poliment si l’accord ne vient pas : le prix descend souvent sur le pas de la porte. Ne proposez jamais un prix que vous n’êtes pas prêt à payer.',
        },
        {
          title: 'Les « guides » spontanés',
          text: 'Un inconnu vous propose de voir « la terrasse avec vue » ou « la fête berbère d’aujourd’hui » ? La visite finit souvent dans une boutique. Un « la, aychek » (non merci) souriant suffit.',
        },
        {
          title: 'La Zitouna',
          text: 'Les non-musulmans peuvent la voir depuis l’entrée ou la galerie, le matin et hors des heures de prière. Il faut avoir les épaules et les genoux couverts.',
        },
        {
          title: 'Le vendredi midi',
          text: 'C’est l’heure de la grande prière : une partie des boutiques ferme, et la médina devient plus calme. Le dimanche, beaucoup d’échoppes ferment plus tôt.',
        },
        {
          title: 'Sidi Bou Saïd',
          text: 'Venez tôt le matin ou en semaine. Le week-end, les Tunisois montent en nombre au Café des Délices, et il faut faire la queue pour la vue.',
        },
      ],
    },
    en: {
      id: 'tunis',
      title: 'Tunis, Carthage and Sidi Bou Saïd',
      notes: [
        {
          title: 'Bargaining in the souks',
          text: 'In the medina the first price is an opening, not an insult. Start low, keep smiling and walk away politely if there is no deal: the price often drops on the doorstep. Never offer a price you are not ready to pay.',
        },
        {
          title: 'Self-appointed “guides”',
          text: 'A stranger offers to show you “the terrace with a view” or “today’s Berber festival”? The tour usually ends in a shop. A smiling “la, aychek” (no thank you) is enough.',
        },
        {
          title: 'The Zitouna mosque',
          text: 'Non-Muslims can look in from the entrance or the gallery, in the morning and outside prayer times. Shoulders and knees must be covered.',
        },
        {
          title: 'Friday at noon',
          text: 'It is the time of the main weekly prayer: some shops close and the medina goes quiet. On Sundays many stalls close earlier.',
        },
        {
          title: 'Sidi Bou Saïd',
          text: 'Come early in the morning or on a weekday. At weekends half of Tunis heads up to the Café des Délices, and the view comes with a queue.',
        },
      ],
    },
  },
  {
    fr: {
      id: 'cap-bon',
      title: 'Cap Bon',
      covers: 'Nabeul, Hammamet, Kélibia, El Haouaria',
      notes: [
        {
          title: 'Le marché du vendredi à Nabeul',
          text: 'C’est le grand marché de la semaine : poteries, épices, vannerie et bétail en bordure. Arrivez avant 10 h.',
        },
        {
          title: 'Poterie et céramique',
          text: 'Comparez deux ou trois ateliers avant d’acheter. Les pièces émaillées peintes à la main coûtent plus cher que les séries moulées, et c’est normal.',
        },
        {
          title: 'L’été sur la côte',
          text: 'En juillet et en août, les plages se remplissent de familles tunisiennes. C’est joyeux, mais les hébergements doivent se réserver tôt. Le maillot se porte sur la plage ; en ville, on se couvre.',
        },
        {
          title: 'La harissa',
          text: 'Le Cap Bon est la terre du piment. Une harissa artisanale (« harissa arbi ») s’achète au marché et se garde au frais sous une couche d’huile.',
        },
      ],
    },
    en: {
      id: 'cap-bon',
      title: 'Cap Bon',
      covers: 'Nabeul, Hammamet, Kélibia, El Haouaria',
      notes: [
        {
          title: 'Nabeul’s Friday market',
          text: 'The big market of the week: pottery, spices, basketry and livestock on the edges. Arrive before 10 am.',
        },
        {
          title: 'Pottery and ceramics',
          text: 'Compare two or three workshops before buying. Hand-painted glazed pieces cost more than moulded ones, and rightly so.',
        },
        {
          title: 'Summer on the coast',
          text: 'In July and August the beaches fill with Tunisian families. It is joyful, but book your stay early. Swimwear is for the beach; in town, cover up.',
        },
        {
          title: 'Harissa',
          text: 'Cap Bon is chilli country. Home-made harissa (“harissa arbi”) is sold at the market and keeps in the fridge under a layer of oil.',
        },
      ],
    },
  },
  {
    fr: {
      id: 'sahel',
      title: 'Sahel et Kairouan',
      covers: 'Sousse, Monastir, Mahdia, El Jem, Kairouan, Sfax',
      notes: [
        {
          title: 'La Grande Mosquée de Kairouan',
          text: 'Les non-musulmans peuvent visiter la cour le matin. La salle de prière se regarde depuis les portes. Elle est fermée aux visiteurs le vendredi après-midi. Prévoir des épaules et des genoux couverts.',
        },
        {
          title: 'Les tapis de Kairouan',
          text: 'Un vrai tapis noué main porte un sceau de l’ONAT (Office national de l’artisanat) au dos. Méfiez-vous des « coopératives » où l’on vous emmène : demandez le sceau et prenez le temps de comparer.',
        },
        {
          title: 'Le makroudh',
          text: 'On l’achète chez un pâtissier de la médina, encore tiède, plutôt qu’en boîte à la sortie de la ville.',
        },
        {
          title: 'El Jem en fin de journée',
          text: 'L’amphithéâtre est plus beau dans la lumière du soir, et moins chaud. L’été, il accueille un festival de musique symphonique sous les étoiles.',
        },
        {
          title: 'Les médinas du Sahel',
          text: 'Sousse et Mahdia se visitent à pied. Gardez la voiture hors des remparts, car les ruelles sont étroites et souvent à sens unique.',
        },
      ],
    },
    en: {
      id: 'sahel',
      title: 'The Sahel and Kairouan',
      covers: 'Sousse, Monastir, Mahdia, El Jem, Kairouan, Sfax',
      notes: [
        {
          title: 'The Great Mosque of Kairouan',
          text: 'Non-Muslims can visit the courtyard in the morning and look into the prayer hall from its doors. It is closed to visitors on Friday afternoons. Shoulders and knees covered.',
        },
        {
          title: 'Kairouan carpets',
          text: 'A genuine hand-knotted carpet carries a seal from ONAT (the national crafts office) on the back. Be wary of the “cooperatives” you get taken to: ask for the seal and take time to compare.',
        },
        {
          title: 'Makroudh',
          text: 'Buy it still warm from a pastry maker in the medina, rather than boxed on the way out of town.',
        },
        {
          title: 'El Jem at the end of the day',
          text: 'The amphitheatre is at its best, and coolest, in the evening light. In summer it hosts a symphonic music festival under the stars.',
        },
        {
          title: 'The Sahel medinas',
          text: 'Sousse and Mahdia are best on foot. Leave the car outside the walls: the lanes are narrow and often one-way.',
        },
      ],
    },
  },
  {
    fr: {
      id: 'djerid',
      title: 'Le Djérid',
      covers: 'Tozeur, Nefta, Chebika, Chott el Jérid',
      notes: [
        {
          title: 'La chaleur',
          text: 'De juin à septembre, le thermomètre dépasse souvent 40 °C. Visitez les oasis à l’aube, faites la sieste en début d’après-midi comme tout le monde, et ressortez vers 17 h. Comptez au moins deux litres d’eau par personne et par jour.',
        },
        {
          title: 'Les palmeraies sont des jardins privés',
          text: 'Restez sur les chemins, ne cueillez pas les dattes et demandez avant d’entrer dans une parcelle. Beaucoup de propriétaires acceptent volontiers de faire visiter.',
        },
        {
          title: 'Les dattes deglet nour',
          text: 'La récolte a lieu d’octobre à décembre : c’est le meilleur moment pour les goûter sur une branche fraîchement coupée.',
        },
        {
          title: 'Le Chott el Jérid',
          text: 'Restez sur la route goudronnée qui le traverse. Hors piste, la croûte de sel peut céder sous une voiture, surtout après la pluie.',
        },
        {
          title: 'Calèches et dromadaires',
          text: 'Fixez le prix et la durée avant de monter, pas à l’arrivée.',
        },
      ],
    },
    en: {
      id: 'djerid',
      title: 'The Djerid',
      covers: 'Tozeur, Nefta, Chebika, Chott el Jérid',
      notes: [
        {
          title: 'The heat',
          text: 'From June to September it often tops 40 °C. See the oases at dawn, nap in the early afternoon like everyone else and head out again around 5 pm. Plan on at least two litres of water per person per day.',
        },
        {
          title: 'Palm groves are private gardens',
          text: 'Stay on the paths, do not pick the dates and ask before stepping into a plot. Many owners are happy to show you around.',
        },
        {
          title: 'Deglet nour dates',
          text: 'The harvest runs from October to December: the best time to taste them from a freshly cut branch.',
        },
        {
          title: 'Chott el Jérid',
          text: 'Stay on the paved road across it. Off the road the salt crust can give way under a car, especially after rain.',
        },
        {
          title: 'Carriages and camels',
          text: 'Agree on the price and the length of the ride before you get on, not at the end.',
        },
      ],
    },
  },
  {
    fr: {
      id: 'sud',
      title: 'Le Sud des ksour et des troglodytes',
      covers: 'Matmata, Tataouine, Douz, Ksar Ghilane, Gabès',
      notes: [
        {
          title: 'Les maisons troglodytes de Matmata',
          text: 'Beaucoup sont encore habitées. On n’y entre que sur invitation, et il est d’usage de laisser une petite contribution à la famille. Demandez avant de photographier les habitants.',
        },
        {
          title: 'Les ksour de Tataouine',
          text: 'Ce sont d’anciens greniers fortifiés. Certains sont restaurés, d’autres fragiles : ne montez pas sur les escaliers effondrés.',
        },
        {
          title: 'Le désert, jamais seul',
          text: 'Au-delà de Douz, partez avec un guide ou un chauffeur qui connaît les pistes. Prévenez quelqu’un de votre itinéraire et gardez une réserve d’eau dans la voiture.',
        },
        {
          title: 'Les nuits d’hiver',
          text: 'De décembre à février, les nuits au bivouac descendent près de 0 °C. Prenez une vraie couche chaude, même si la journée était douce.',
        },
        {
          title: 'Le Festival du Sahara à Douz',
          text: 'Il a lieu chaque hiver, vers la fin décembre : courses de dromadaires, poésie et musique. Les hébergements sont pris d’assaut.',
        },
        {
          title: 'Les meilleures périodes',
          text: 'D’octobre à novembre et de mars à avril. Évitez juillet et août.',
        },
      ],
    },
    en: {
      id: 'sud',
      title: 'The South of ksour and cave homes',
      covers: 'Matmata, Tataouine, Douz, Ksar Ghilane, Gabès',
      notes: [
        {
          title: 'Matmata’s cave homes',
          text: 'Many are still lived in. Go in only when invited, and it is customary to leave a small contribution for the family. Ask before photographing the people who live there.',
        },
        {
          title: 'The ksour of Tataouine',
          text: 'Old fortified granaries. Some are restored, others fragile: do not climb on crumbling stairs.',
        },
        {
          title: 'Never alone in the desert',
          text: 'Beyond Douz, go with a guide or a driver who knows the tracks. Tell someone your route and keep spare water in the car.',
        },
        {
          title: 'Winter nights',
          text: 'From December to February, nights in a desert camp drop close to 0 °C. Bring a proper warm layer, even after a mild day.',
        },
        {
          title: 'The Sahara Festival in Douz',
          text: 'Held every winter, around late December: camel races, poetry and music. Rooms get booked out.',
        },
        {
          title: 'Best times to go',
          text: 'October to November and March to April. Avoid July and August.',
        },
      ],
    },
  },
  {
    fr: {
      id: 'djerba',
      title: 'Djerba et Zarzis',
      notes: [
        {
          title: 'La synagogue de la Ghriba',
          text: 'Couvrez-vous les épaules et les jambes, et retirez vos chaussures à l’entrée. Au printemps, le pèlerinage attire des milliers de fidèles et la sécurité est renforcée ce jour-là.',
        },
        {
          title: 'La criée de Houmt Souk',
          text: 'Le matin, le poisson se vend aux enchères au marché couvert. Le spectacle vaut le détour, même sans acheter.',
        },
        {
          title: 'Djerbahood à Erriadh',
          text: 'Ce village est devenu un musée de street art à ciel ouvert. Promenez-vous tôt, avant la chaleur, et restez discret : on y vit toujours.',
        },
        {
          title: 'Se déplacer',
          text: 'L’île est plate : le vélo et le scooter se louent facilement à Houmt Souk et dans la zone touristique.',
        },
      ],
    },
    en: {
      id: 'djerba',
      title: 'Djerba and Zarzis',
      notes: [
        {
          title: 'El Ghriba synagogue',
          text: 'Cover shoulders and legs, and take your shoes off at the entrance. In spring the pilgrimage draws thousands and security is tighter that day.',
        },
        {
          title: 'The Houmt Souk fish auction',
          text: 'In the morning, fish is auctioned in the covered market. Worth watching even if you buy nothing.',
        },
        {
          title: 'Djerbahood in Erriadh',
          text: 'The village has become an open-air street art museum. Walk it early, before the heat, and keep it low-key: people still live there.',
        },
        {
          title: 'Getting around',
          text: 'The island is flat: bikes and scooters are easy to rent in Houmt Souk and the hotel zone.',
        },
      ],
    },
  },
  {
    fr: {
      id: 'partout',
      title: 'Partout, toute l’année',
      notes: [
        {
          title: 'Le ramadan',
          text: 'Les horaires changent : beaucoup de cafés et de restaurants ferment en journée hors des zones touristiques, puis la vie reprend après la rupture du jeûne. Évitez de manger ou de fumer ostensiblement dans la rue. Les soirées de ramadan sont un très bon moment pour découvrir les médinas.',
        },
        {
          title: 'Les photos',
          text: 'Demandez toujours avant de photographier quelqu’un, surtout les femmes et les enfants. Ne photographiez pas les bâtiments officiels, les militaires ni les policiers.',
        },
        {
          title: 'La tenue',
          text: 'En dehors des plages, des épaules et des genoux couverts ouvrent toutes les portes, et surtout celles des lieux religieux.',
        },
      ],
    },
    en: {
      id: 'partout',
      title: 'Everywhere, all year',
      notes: [
        {
          title: 'Ramadan',
          text: 'Opening hours change: outside tourist areas many cafés and restaurants close during the day, then life picks up after the fast is broken. Avoid eating or smoking openly in the street. Ramadan evenings are a great time to discover the medinas.',
        },
        {
          title: 'Photos',
          text: 'Always ask before photographing someone, especially women and children. Do not photograph official buildings, soldiers or police.',
        },
        {
          title: 'What to wear',
          text: 'Away from the beach, covered shoulders and knees open every door, religious sites above all.',
        },
      ],
    },
  },
];

export function regionGuides(locale: Locale): RegionGuide[] {
  return GUIDES.map((g) => g[locale]);
}

export const GENERAL_GUIDE = 'partout';

/** Which guide a place belongs to. Places outside these regions point to the general one. */
const GUIDE_BY_PLACE: Record<string, string> = {
  carthage: 'tunis',
  'sidi-bou-said': 'tunis',
  'medina-tunis': 'tunis',
  bardo: 'tunis',
  'marche-central': 'tunis',
  'souk-el-attarine': 'tunis',
  hammamet: 'cap-bon',
  nabeul: 'cap-bon',
  'nabeul-market': 'cap-bon',
  kelibia: 'cap-bon',
  'el-haouaria': 'cap-bon',
  korbous: 'cap-bon',
  kairouan: 'sahel',
  'kairouan-souks': 'sahel',
  'el-jem': 'sahel',
  'sousse-medina': 'sahel',
  monastir: 'sahel',
  mahdia: 'sahel',
  'sfax-medina': 'sahel',
  tozeur: 'djerid',
  'mos-espa': 'djerid',
  chebika: 'djerid',
  'chott-el-jerid': 'djerid',
  douz: 'sud',
  matmata: 'sud',
  'ksar-ouled-soltane': 'sud',
  'gabes-jara': 'sud',
  'ksar-ghilane': 'sud',
  djerba: 'djerba',
  'el-ghriba': 'djerba',
  guellala: 'djerba',
  'houmt-souk': 'djerba',
  'djerba-velo': 'djerba',
  zarzis: 'djerba',
};

export function guideFor(placeId: string): string {
  return GUIDE_BY_PLACE[placeId] ?? GENERAL_GUIDE;
}

export function guideAnchor(id: string): string {
  return `cahier-${id}`;
}
