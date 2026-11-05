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
  'tunis-bay': {
    name: 'Tunis et sa baie',
    tagline: 'Le premier séjour de presque tous les visiteurs',
    description:
      'De la médina de Tunis au Bardo, puis de La Goulette à Carthage, Sidi Bou Saïd et Gammarth : deux jours autour de la capitale et de sa baie.',
  },
  'around-tunis': {
    name: 'Les environs de Tunis',
    tagline: 'Ruines romaines et montagne, à moins d’une heure',
    description:
      'Oudna, le Bou Kornine, Zaghouan, le djebel Zaghouan et Thuburbo Majus : une escapade en deux jours depuis la capitale.',
  },
  'bizerte-lagoon': {
    name: 'Lagune et caps de Bizerte',
    tagline: 'Plages et villages de la côte nord-est',
    description:
      'D’Utique à Bizerte, par Ghar El Melh, Rafraf et Sidi Ali El Mekki : une côte très prisée des Tunisiens.',
  },
  'north-west-marble': {
    name: 'Marbre et forêts du Nord-Ouest',
    tagline: 'Villas souterraines, carrières et forêts',
    description:
      'Les villas romaines enterrées de Bulla Regia, les carrières de marbre de Chemtou, puis les forêts d’El Feidja et d’Aïn Draham jusqu’à Tabarka.',
  },
  'wild-cap-bon': {
    name: 'Le Cap Bon sauvage',
    tagline: 'La pointe du cap, moins connue que Hammamet',
    description:
      'Korbous, El Haouaria, Kerkouane et Kélibia : l’extrémité du cap, qui complète le road trip du Cap Bon.',
  },
  'quiet-sahel': {
    name: 'Le Sahel tranquille',
    tagline: 'Villages et petits ports, loin des hôtels',
    description:
      'D’Hergla à Mahdia, par Takrouna, Sebkhet Kelbia, Monastir, Lamta et Salakta : le Sahel loin des zones hôtelières.',
  },
  'sfax-kerkennah': {
    name: 'Sfax et Kerkennah',
    tagline: 'Une région presque absente des circuits',
    description:
      'La médina de Sfax, le musée Dar Jellouli, Thyna et les îles Kerkennah, en deux jours.',
  },
  'gabes-sea-mountains': {
    name: 'Gabès, de la mer aux montagnes',
    tagline: 'La seule oasis au bord de la mer',
    description:
      'Le marché de Jara et l’oasis de Chenini, puis les sources chaudes d’El Hamma, la ligne Mareth et Toujane, dans le Dahar.',
  },
  'gafsa-savanna': {
    name: 'Gafsa et la savane',
    tagline: 'Une région sans circuit aujourd’hui',
    description:
      'Les piscines romaines de Gafsa, le train du bey au Lézard Rouge et les oryx du parc de Bou Hedma.',
  },
  'grand-tour': {
    name: 'Le grand tour de Tunisie',
    tagline: 'Le circuit nord-sud classique, en une boucle',
    description:
      'De Carthage à Djerba, par Sidi Bou Saïd, Dougga, Kairouan, El Jem, Tozeur, Douz et Matmata : le circuit des agences, en dix jours.',
  },
};
