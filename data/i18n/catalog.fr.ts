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
};
