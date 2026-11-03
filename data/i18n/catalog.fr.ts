import type { CategoryId, Itinerary } from '@/data/types';

export const CATEGORIES_FR: Record<CategoryId, { label: string; short: string }> = {
  heritage: { label: 'UNESCO & Histoire', short: 'Histoire' },
  sahara: { label: 'Sahara & Nature', short: 'Sahara' },
  beach: { label: 'Plages', short: 'Plages' },
  culture: { label: 'Culture & Artisanat', short: 'Culture' },
  culinary: { label: 'Gastronomie', short: 'Saveurs' },
  souk: { label: 'Souks & Marchés', short: 'Souks' },
  camping: { label: 'Camping', short: 'Camping' },
  cycling: { label: 'Circuits vélo', short: 'Vélo' },
};

export const ITINERARIES_FR: Record<string, Pick<Itinerary, 'name' | 'tagline' | 'description'>> = {
  'roman-heritage': {
    name: 'La route de l’Afrique romaine',
    tagline: 'Cinq cités de l’Afrique proconsulaire',
    description:
      'Des ports de Carthage à l’arène colossale d’El Jem, en passant par les forums perchés du Tell. Un road trip à travers le grenier à blé de Rome.',
  },
  'star-wars': {
    name: 'La route Star Wars',
    tagline: 'Tatooine était là depuis toujours',
    description:
      'Sur les pas des équipes de tournage, à travers le Jérid et le Dahar : le décor de Mos Espa, la ferme de Luke sur le lac salé, la maison des Lars à Matmata et les quartiers d’esclaves de Ksar Ouled Soltane.',
  },
  'cap-bon': {
    name: 'Échappées au Cap Bon',
    tagline: 'Jasmin, harissa et criques turquoise',
    description:
      'Une boucle lente autour de la presqu’île du Cap Bon : les plages de Hammamet, les potiers de Nabeul, le fort de Kélibia et les falaises aux faucons d’El Haouaria.',
  },
  'sacred-medinas': {
    name: 'Médinas & villes saintes',
    tagline: 'Treize siècles d’architecture islamique',
    description:
      'Des souks de Tunis à la ville sainte de Kairouan et aux ports fortifiés du Sahel, jusqu’à la presqu’île blanche de Mahdia.',
  },
  'ksour-route': {
    name: 'La route des ksour',
    tagline: 'Villages berbères et greniers du Dahar',
    description:
      'À travers les montagnes du Sud-Est : les maisons troglodytes de Matmata, les villages de pierre de Tamezret et Toujane, puis les greniers de Ksar Hadada et Ksar Ouled Soltane et les villages perchés de Chenini et Douiret.',
  },
  'mountain-oases': {
    name: 'Les oasis de montagne',
    tagline: 'Canyons, sources et palmeraies du Jérid',
    description:
      'Depuis Tozeur, le train du bey dans les gorges de Selja, puis les oasis de montagne de Chebika, Tamerza et Midès à la frontière algérienne, avant de finir dans les palmiers de Nefta.',
  },
  'deep-south-4x4': {
    name: 'Le grand Sud en 4x4',
    tagline: 'Lac salé, dunes et source dans le désert',
    description:
      'La traversée du chott el Jérid jusqu’à Douz, porte du Sahara, puis en 4x4 jusqu’à la source chaude de Ksar Ghilane et aux dunes protégées du parc national de Jebil.',
  },
  'wild-north': {
    name: 'Le Nord sauvage',
    tagline: 'Caps, lacs et forêts de chênes-lièges',
    description:
      'De Bizerte à la pointe nord de l’Afrique, les oiseaux du lac Ichkeul et les potières de Sejnane, puis la baie sauvage du cap Serrat, la côte de corail de Tabarka et les forêts d’Aïn Draham.',
  },
  'high-tell': {
    name: 'Le Haut Tell',
    tagline: 'Montagnes et cités romaines, sans la foule',
    description:
      'Dans les terres et en altitude : Testour l’andalouse, la cité romaine de Dougga, la vieille ville du Kef, la Table de Jugurtha, les ruines frontalières de Haïdra, puis Makthar et le village perché de Kesra.',
  },
  'djerba-slow': {
    name: 'Djerba autrement',
    tagline: 'L’île au-delà des plages',
    description:
      'Le marché de Houmt Souk, les fresques de Djerbahood, la synagogue de la Ghriba et les potiers de Guellala, une journée à vélo sur les petites routes de l’île, puis les palmiers et les plages de Zarzis.',
  },
};
