import type { Category, CategoryId, Itinerary, Place, PlaceContact, PlaceImage } from './types';

/**
 * Mock dataset for Tunisia Go.
 *
 * Coordinates are real. Phone and WhatsApp numbers are placeholders
 * (+216 00 …) until real partners are signed: replace them in one place
 * via `contact` below or the NEXT_PUBLIC_GUIDE_WHATSAPP env variable.
 */

export const CATEGORIES: Category[] = [
  { id: 'heritage', label: 'UNESCO & History', short: 'History' },
  { id: 'sahara', label: 'Sahara & Nature', short: 'Sahara' },
  { id: 'beach', label: 'Beaches', short: 'Beaches' },
  { id: 'culture', label: 'Culture & Craft', short: 'Culture' },
  { id: 'culinary', label: 'Culinary Spots', short: 'Food' },
  { id: 'souk', label: 'Souks & Markets', short: 'Souks' },
  // No place of their own yet: they fill up with the spots visitors suggest (see /spot-secret).
  { id: 'camping', label: 'Camping', short: 'Camping' },
  { id: 'cycling', label: 'Cycling routes', short: 'Cycling' },
];

export const CATEGORY_BY_ID: Record<CategoryId, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;

function postcards(_category: CategoryId, captions: string[]): PlaceImage[] {
  return captions.map((caption) => ({ caption }));
}

// No real guide or venue numbers yet: the contact buttons show « Disponible bientôt »
// until NEXT_PUBLIC_GUIDE_WHATSAPP / NEXT_PUBLIC_TRANSFER_WHATSAPP are set (lib/links.ts).
const contact = (): PlaceContact => ({});

export const PLACES: Place[] = [
  // ── Tunis & Carthage ───────────────────────────────────────────────
  {
    id: 'carthage',
    wiki: 'Carthage',
    name: 'Carthage',
    nameAr: 'قرطاج',
    region: 'Tunis',
    stayQuery: 'Carthage, Tunisia',
    category: 'heritage',
    coords: [36.8528, 10.3233],
    unesco: true,
    tagline: 'The city that rivalled Rome',
    description:
      'Founded by Phoenician settlers from Tyre, Carthage became the capital of a Mediterranean trading empire before Rome razed it in 146 BC and rebuilt it as the capital of Africa Proconsularis. Today its ruins are scattered across a leafy seaside suburb: the Antonine Baths, the Punic ports, the Tophet and Byrsa Hill.',
    didYouKnow:
      'The Antonine Baths were among the largest Roman baths ever built outside Rome itself. What you walk through today is mostly the basement level, where slaves stoked the furnaces.',
    insights: {
      history:
        'Legend says Queen Elyssa (Dido) founded the city around 814 BC. After three Punic Wars, Rome destroyed it and later rebuilt it as one of the largest cities of the empire.',
      customs: 'One combined ticket covers most Carthage sites. Keep it with you as it is checked at each entrance.',
      food: 'Stop at La Marsa nearby for a "bambalouni", a sugared doughnut fried on the street.',
      bestTime: 'March to May and late September to November. Go early, there is little shade.',
    },
    visitDuration: 'Half day',
    images: postcards('heritage', ['Antonine Baths by the sea', 'Byrsa Hill at golden hour', 'The Punic ports']),
    contact: contact(),
  },
  {
    id: 'sidi-bou-said',
    wiki: 'Sidi Bou Said',
    name: 'Sidi Bou Saïd',
    nameAr: 'سيدي بو سعيد',
    region: 'Tunis',
    stayQuery: 'Sidi Bou Said, Tunisia',
    category: 'culture',
    coords: [36.8708, 10.3417],
    tagline: 'Blue doors above the Gulf of Tunis',
    description:
      'A clifftop village of whitewashed houses, studded blue doors and bougainvillea, long loved by painters such as Paul Klee and August Macke. Wander the cobbled lanes, then watch the sun set over the bay.',
    didYouKnow:
      "The blue and white look is protected. Baron Rodolphe d'Erlanger pushed for the rule in 1915, and the village became one of the first protected sites in the world.",
    insights: {
      history:
        'The village is named after Abu Said al-Baji, a 13th-century Sufi saint whose shrine still stands at the top of the hill.',
      customs:
        'Locals greet with "Aslema". Ask before photographing people, and dress modestly if you visit the shrine.',
      food: 'Order a mint tea with pine nuts at Café des Délices, perched over the sea.',
      bestTime: 'All year. Weekday mornings are calmest, sunsets are busiest.',
    },
    visitDuration: '2–3 hours',
    images: postcards('culture', ['Studded blue doors', 'Café terraces over the bay', 'Bougainvillea lanes']),
    contact: contact(),
  },
  {
    id: 'medina-tunis',
    wiki: 'Medina of Tunis',
    name: 'Medina of Tunis',
    nameAr: 'مدينة تونس',
    region: 'Tunis',
    stayQuery: 'Tunis Medina, Tunisia',
    category: 'heritage',
    coords: [36.7992, 10.1706],
    unesco: true,
    tagline: 'A living maze of souks and palaces',
    description:
      'Around 700 monuments packed inside the old walls: the Zitouna Mosque, covered souks organised by trade, Ottoman palaces and hidden rooftop cafés. Listed by UNESCO in 1979.',
    didYouKnow:
      'Each souk was traditionally reserved for one guild. The perfume sellers sat closest to the Zitouna Mosque, while noisy and smelly trades such as tanners were pushed to the edges.',
    insights: {
      history:
        'The medina grew around the Zitouna Mosque, founded in the 8th century, and peaked under the Hafsid dynasty when Tunis was a capital of the Islamic world.',
      customs: 'Bargaining is expected in the souks. Start at around half the asking price and keep it friendly.',
      food: 'Try "lablabi", a chickpea and cumin soup served with bread, olive oil and harissa.',
      bestTime: 'Weekday mornings. Many shops close on Sunday.',
    },
    visitDuration: 'Half day',
    images: postcards('heritage', ['Zitouna Mosque minaret', 'Souk el Attarine', 'Rooftop view at dusk']),
    contact: contact(),
  },
  {
    id: 'bardo',
    wiki: 'Bardo National Museum (Tunis)',
    name: 'Bardo National Museum',
    nameAr: 'متحف باردو',
    region: 'Tunis',
    stayQuery: 'Tunis, Tunisia',
    category: 'culture',
    coords: [36.8094, 10.1342],
    tagline: "The world's great mosaic collection",
    description:
      'Housed in a 15th-century Hafsid palace, the Bardo holds one of the largest collections of Roman mosaics anywhere, including the famous portrait of Virgil flanked by two Muses.',
    didYouKnow:
      'The Virgil mosaic, found in Sousse, is one of the only known portraits of the poet made close to his lifetime.',
    insights: {
      history:
        'The museum opened in 1888 inside the former beylical palace, and its galleries still show the original painted ceilings.',
      customs: 'Allow time for security checks at the entrance. Photography without flash is allowed.',
      food: 'Head back toward the centre for a "fricassé", a small fried sandwich with tuna, egg and olives.',
      bestTime: 'Any time. A good plan for a hot afternoon. Check opening days before you go.',
    },
    visitDuration: '2–3 hours',
    images: postcards('culture', ['Virgil and the Muses', 'Neptune mosaic hall', 'Painted palace ceilings']),
    contact: contact(),
  },
  {
    id: 'marche-central',
    wiki: 'Central Market of Tunis',
    wikiFr: 'Marché central de Tunis',
    photoSearch: 'Marché central Tunis',
    name: 'Marché Central',
    nameAr: 'السوق المركزي',
    region: 'Tunis',
    stayQuery: 'Tunis, Tunisia',
    category: 'culinary',
    coords: [36.7986, 10.1817],
    tagline: 'The beating stomach of the capital',
    description:
      'Under its colonial-era iron roof, the central market sells fish fresh off the boats, pyramids of spices, olives by the dozen varieties and dates from the south.',
    didYouKnow:
      "Tunisia is one of the largest olive oil exporters in the world, and many families still buy their year's oil in bulk straight after the winter harvest.",
    insights: {
      history:
        'The market was built during the French protectorate, at the edge of the new European quarter beside the medina.',
      customs: 'Come in the morning when the fish hall is full. Vendors will happily let you taste olives.',
      food: 'Buy deglet nour dates, harissa and a jar of "bsissa", a roasted barley and spice flour.',
      bestTime: 'Before noon, when the stalls are fullest.',
    },
    visitDuration: '1–2 hours',
    images: postcards('culinary', ['Olives by the barrel', 'The fish hall', 'Spice pyramids']),
    contact: contact(),
  },

  // ── North-west ─────────────────────────────────────────────────────
  {
    id: 'dougga',
    wiki: 'Dougga',
    name: 'Dougga',
    nameAr: 'دقة',
    region: 'Béja',
    stayQuery: 'Teboursouk, Tunisia',
    category: 'heritage',
    coords: [36.4231, 9.2199],
    unesco: true,
    tagline: 'The best-preserved Roman town in North Africa',
    description:
      'A complete Roman town on a hillside among olive groves: a 3,500-seat theatre, the Capitol, baths, temples and a Libyco-Punic mausoleum, all with almost nobody around.',
    didYouKnow:
      "The bilingual inscription from Dougga's mausoleum, in Punic and Libyan, helped scholars decipher the ancient Libyan script. The original stone is now in the British Museum.",
    insights: {
      history:
        'Thugga was a Numidian town before Rome. Romans and Numidians lived side by side here for centuries, which is why the town plan is so irregular.',
      customs: 'Wear proper shoes: the paving stones are original and uneven.',
      food: 'Picnic among the olive trees with bread "tabouna" bought in Teboursouk.',
      bestTime: 'Spring, when the site is covered in wild flowers.',
    },
    visitDuration: 'Half day',
    images: postcards('heritage', ['The Capitol', 'Theatre over the valley', 'Libyco-Punic mausoleum']),
    contact: contact(),
  },
  {
    id: 'bulla-regia',
    wiki: 'Bulla Regia',
    name: 'Bulla Regia',
    nameAr: 'بولا ريجيا',
    region: 'Jendouba',
    stayQuery: 'Jendouba, Tunisia',
    category: 'heritage',
    coords: [36.5586, 8.7564],
    tagline: 'Roman villas built underground',
    description:
      'To escape the summer heat, wealthy Romans here built their villas with a full underground floor. Their mosaics are still in place, where they were laid.',
    didYouKnow:
      'Bulla Regia is one of the only places in the Roman world where you can see mosaics in their original underground rooms, under their original vaults.',
    insights: {
      history: 'A royal Numidian city, it became a Roman town and was prosperous from the 2nd century AD.',
      customs: 'Ask the guardian to show you the House of the Hunt and the House of Amphitrite.',
      food: 'Jendouba is known for its honey and goat cheese, sold along the road.',
      bestTime: 'Spring or autumn. In summer the underground rooms are a cool refuge.',
    },
    visitDuration: '2 hours',
    images: postcards('heritage', ['Underground villa', 'Amphitrite mosaic', 'Columns among the fields']),
    contact: contact(),
  },
  {
    id: 'tabarka',
    wiki: 'Tabarka',
    name: 'Tabarka',
    nameAr: 'طبرقة',
    region: 'Jendouba',
    stayQuery: 'Tabarka, Tunisia',
    category: 'beach',
    coords: [36.9544, 8.758],
    tagline: 'Coral coast under a Genoese fort',
    description:
      'A green, mountainous corner of the coast with pine forests running down to the sea, a Genoese fort on its island and some of the best diving in the Mediterranean.',
    didYouKnow:
      'From the 16th to the 18th century, the island of Tabarka was leased to the Genoese Lomellini family, who ran a coral fishing trade from it.',
    insights: {
      history: 'Phoenician Thabraca later became a Roman port shipping marble and timber.',
      customs: 'The Tabarka Jazz Festival takes place in summer and the town fills up fast.',
      food: 'Grilled fish at the port, and cork-oak honey from the Kroumirie hills.',
      bestTime: 'June to September for the sea, autumn for hiking in the forest.',
    },
    visitDuration: '1–2 days',
    images: postcards('beach', ['Genoese fort', 'Les Aiguilles rocks', 'Pine forest above the sea']),
    contact: contact(),
  },

  // ── Sahel & centre ─────────────────────────────────────────────────
  {
    id: 'kairouan',
    wiki: 'Great Mosque of Kairouan',
    name: 'Kairouan',
    nameAr: 'القيروان',
    region: 'Kairouan',
    stayQuery: 'Kairouan, Tunisia',
    category: 'heritage',
    coords: [35.6814, 10.1039],
    unesco: true,
    tagline: 'The holy city of the Maghreb',
    description:
      'Founded in 670, Kairouan is home to the Great Mosque of Uqba, a model for mosques across North Africa. Its medina is known for carpets and for the Aghlabid basins.',
    didYouKnow:
      'An old tradition says that seven pilgrimages to Kairouan were once considered equal to one pilgrimage to Mecca.',
    insights: {
      history:
        'The first Arab capital of the region, founded by Uqba ibn Nafi. The Aghlabid emirs made it a centre of learning in the 9th century.',
      customs:
        'Non-Muslims may visit the mosque courtyard but not the prayer hall. Dress modestly and cover shoulders and knees.',
      food: '"Makroudh", semolina cakes filled with dates and soaked in honey, is the city\'s pride.',
      bestTime: 'October to April. Avoid Friday midday prayers for mosque visits.',
    },
    visitDuration: '1 day',
    images: postcards('heritage', ['Great Mosque courtyard', 'Aghlabid basins', 'Carpet weavers']),
    contact: contact(),
  },
  {
    id: 'sbeitla',
    wiki: 'Sbeitla',
    name: 'Sbeitla',
    nameAr: 'سبيطلة',
    region: 'Kasserine',
    stayQuery: 'Sbeitla, Tunisia',
    category: 'heritage',
    coords: [35.2326, 9.1218],
    tagline: 'Three temples on one forum',
    description:
      'Ancient Sufetula has a unique forum with three side-by-side temples to Jupiter, Juno and Minerva, entered through the Antonine gate.',
    didYouKnow:
      'In 647, Sufetula saw the first major battle between the Byzantines and the Arab armies, which opened North Africa to the Arab conquest.',
    insights: {
      history: 'A late Roman city that served as a Byzantine stronghold in the 7th century.',
      customs: 'Quieter than El Jem: take your time and walk to the Byzantine churches.',
      food: 'Try "mloukhia", a dark green stew of jute leaves, in a local restaurant.',
      bestTime: 'Spring and autumn. Late afternoon light on the temples is beautiful.',
    },
    visitDuration: '2–3 hours',
    images: postcards('heritage', ['Capitoline temples', 'Antonine gate', 'Byzantine basilica']),
    contact: contact(),
  },
  {
    id: 'el-jem',
    wiki: 'Amphitheatre of El Jem',
    name: 'El Jem Amphitheatre',
    nameAr: 'قصر الجم',
    region: 'Mahdia',
    stayQuery: 'El Jem, Tunisia',
    category: 'heritage',
    coords: [35.2964, 10.7069],
    unesco: true,
    tagline: 'A colosseum rising from the olive groves',
    description:
      "Built around 238 AD for 35,000 spectators, Thysdrus's amphitheatre is one of the best-preserved in the world. You can climb the tiers and walk the tunnels where animals waited.",
    didYouKnow:
      'El Jem is the third-largest Roman amphitheatre ever built. Its arena appeared in the film "Gladiator", and it now hosts a summer symphony festival.',
    insights: {
      history:
        'Thysdrus grew rich on olive oil. In 238 AD a revolt that started here briefly made the local proconsul Gordian emperor of Rome.',
      customs: 'Your ticket also covers the archaeological museum and its villa mosaics a short walk away.',
      food: 'Have a "chakchouka", eggs poached in pepper and tomato sauce, in a café facing the arena.',
      bestTime: 'Early morning or late afternoon. The International Symphony Festival runs in July and August.',
    },
    visitDuration: '2–3 hours',
    images: postcards('heritage', ['The arena from above', 'Underground tunnels', 'Summer concert night']),
    contact: contact(),
  },
  {
    id: 'sousse-medina',
    wiki: 'Medina of Sousse',
    name: 'Medina of Sousse',
    nameAr: 'مدينة سوسة',
    region: 'Sousse',
    stayQuery: 'Sousse, Tunisia',
    category: 'heritage',
    coords: [35.8256, 10.6369],
    unesco: true,
    tagline: 'A fortified port city of the Aghlabids',
    description:
      'Massive walls enclose the Ribat, the Great Mosque and a lively souk. The Kasbah museum holds outstanding mosaics.',
    didYouKnow:
      'The Ribat of Sousse was a fortress-monastery where warriors also lived as scholars. Its watchtower once signalled by fire to the next ribat along the coast.',
    insights: {
      history: 'Ancient Hadrumetum, rebuilt by the Aghlabids in the 9th century as their main naval base.',
      customs: "Climb the Ribat's watchtower for the best view over the medina.",
      food: '"Brik à l\'oeuf", a crisp pastry with a runny egg inside. Eat it with your fingers.',
      bestTime: 'April to June and September to October.',
    },
    visitDuration: 'Half day',
    images: postcards('heritage', ['Ribat watchtower', 'Great Mosque', 'Souk lanes']),
    contact: contact(),
  },
  {
    id: 'monastir',
    wiki: 'Ribat of Monastir',
    name: 'Ribat of Monastir',
    nameAr: 'رباط المنستير',
    region: 'Monastir',
    stayQuery: 'Monastir, Tunisia',
    category: 'heritage',
    coords: [35.7772, 10.8317],
    tagline: 'A fortress on the edge of the sea',
    description:
      'The oldest ribat in North Africa, founded in 796, stands right by the water. Its walls and towers have been used as a set by many films.',
    didYouKnow: 'Scenes from Monty Python\'s "Life of Brian" were filmed at the Ribat of Monastir in 1978.',
    insights: {
      history: "Built by the Abbasid governor Harthama ibn A'yan to guard the coast against Byzantine raids.",
      customs: "Monastir is the hometown of Habib Bourguiba, Tunisia's first president, whose mausoleum is nearby.",
      food: 'Try "kosksi bil hout", fish couscous, a coastal Sahel speciality.',
      bestTime: 'All year. Summer evenings by the marina are lively.',
    },
    visitDuration: '2 hours',
    images: postcards('heritage', ['Ribat by the sea', 'Watchtower stairs', 'Bourguiba mausoleum']),
    contact: contact(),
  },
  {
    id: 'mahdia',
    wiki: 'Mahdia',
    name: 'Mahdia',
    nameAr: 'المهدية',
    region: 'Mahdia',
    stayQuery: 'Mahdia, Tunisia',
    category: 'beach',
    coords: [35.5047, 11.0622],
    tagline: 'White sand on a Fatimid peninsula',
    description:
      'A quiet peninsula town with fine white beaches, a fishing port, a seaside cemetery and the Skifa el Kahla gate. Famous for silk weaving and wedding dresses.',
    didYouKnow:
      'In 1907, sponge divers off Mahdia found a Roman shipwreck full of bronze and marble statues. Its treasures are now displayed in the Bardo.',
    insights: {
      history:
        'Founded in 916 by the first Fatimid caliph, al-Mahdi, as his capital before the dynasty moved to Cairo.',
      customs: 'Friday is market day. Visit a silk workshop to see handlooms at work.',
      food: 'Mahdia is the best place for fresh fish and "tajine malsouka", a baked egg and cheese dish.',
      bestTime: 'June to October for swimming.',
    },
    visitDuration: '1–2 days',
    images: postcards('beach', ['White sand beach', 'Skifa el Kahla gate', 'Fishing boats at the port']),
    contact: contact(),
  },
  {
    id: 'sfax-medina',
    wiki: 'Medina of Sfax',
    name: 'Sfax Medina',
    nameAr: 'مدينة صفاقس',
    region: 'Sfax',
    stayQuery: 'Sfax, Tunisia',
    category: 'culinary',
    coords: [34.7383, 10.7603],
    tagline: 'Fish market and sweets without the crowds',
    description:
      "Tunisia's second city keeps one of the most authentic medinas in the country, with a vast fish market and pastry shops famous nationwide.",
    didYouKnow:
      'Sfax is surrounded by millions of olive trees planted in a neat grid, one of the largest olive groves in the world.',
    insights: {
      history: 'The walls date back to the 9th century and are among the best-preserved in Tunisia.',
      customs: 'Few tourists come here, so expect curious and warm welcomes.',
      food: '"Charmoula" with salted fish is a local Eid dish. Taste "ghraiba" shortbread too.',
      bestTime: 'Autumn to spring.',
    },
    visitDuration: 'Half day',
    images: postcards('culinary', ['The fish market', 'Pastry shop window', 'Bab Diwan gate']),
    contact: contact(),
  },

  // ── Cap Bon ────────────────────────────────────────────────────────
  {
    id: 'hammamet',
    wiki: 'Hammamet',
    name: 'Hammamet',
    nameAr: 'الحمامات',
    region: 'Nabeul',
    stayQuery: 'Hammamet, Tunisia',
    category: 'beach',
    coords: [36.4, 10.6167],
    tagline: 'Jasmine, beaches and a walled medina',
    description:
      "Tunisia's classic seaside town: a small medina by the water, long sandy beaches and the villa of Georges Sebastian, now a cultural centre with an open-air theatre.",
    didYouKnow:
      'Men in Hammamet traditionally tuck a small bouquet of jasmine behind the ear: on the left if they are single, on the right if they are taken.',
    insights: {
      history: 'The Kasbah dates to the 15th century. Artists like Klee and later many writers made the town famous.',
      customs: 'Buy a jasmine "machmoum" from the street sellers in the evening.',
      food: 'Grilled fish and "salade méchouia", a smoky salad of grilled peppers and tomatoes.',
      bestTime: 'May to October. The International Festival runs in July and August.',
    },
    visitDuration: '1–3 days',
    images: postcards('beach', ['Medina walls on the beach', 'Jasmine sellers', 'Sebastian villa theatre']),
    contact: contact(),
  },
  {
    id: 'nabeul',
    wiki: 'Nabeul',
    name: 'Nabeul',
    nameAr: 'نابل',
    region: 'Nabeul',
    stayQuery: 'Nabeul, Tunisia',
    category: 'culinary',
    coords: [36.4561, 10.7376],
    tagline: 'Capital of harissa and hand-painted pottery',
    description:
      "Nabeul is where Tunisia's chillies are dried, ground and turned into harissa. Its potters and ceramic painters supply the whole country.",
    didYouKnow: "Tunisian harissa was added to UNESCO's list of Intangible Cultural Heritage in 2022.",
    insights: {
      history: 'Ancient Neapolis was a Greek and Roman town famous for its fish sauce, garum.',
      customs: 'Every Friday the big market draws people from all of Cap Bon.',
      food: 'Visit during the Harissa Festival in autumn and taste harissa made a dozen ways.',
      bestTime: 'Autumn for the chilli harvest, Friday for the market.',
    },
    visitDuration: 'Half day',
    images: postcards('culinary', ['Chillies drying in the sun', 'Painted pottery', 'Friday market']),
    contact: contact(),
  },
  {
    id: 'kelibia',
    wiki: 'Kelibia',
    name: 'Kélibia',
    nameAr: 'قليبية',
    region: 'Nabeul',
    stayQuery: 'Kelibia, Tunisia',
    category: 'beach',
    coords: [36.8476, 11.0939],
    tagline: 'Turquoise water below a Byzantine fort',
    description:
      'The beach of El Mansourah is often called the most beautiful in Tunisia: shallow turquoise water at the foot of a fortress that has watched the coast since the 6th century.',
    didYouKnow: 'Kélibia hosts one of the oldest amateur film festivals in the world, running since 1964.',
    insights: {
      history: 'The fort sits on Punic foundations and was reused by Byzantines, Spaniards and Ottomans.',
      customs: 'Kélibia is known for its dry muscat wine, a Cap Bon tradition.',
      food: 'Fresh grilled sardines and squid at the port.',
      bestTime: 'June to September.',
    },
    visitDuration: '1 day',
    images: postcards('beach', ['El Mansourah beach', 'The fortress', 'Fishing port']),
    contact: contact(),
  },
  {
    id: 'el-haouaria',
    wiki: 'El Haouaria',
    name: 'El Haouaria',
    nameAr: 'الهوارية',
    region: 'Nabeul',
    stayQuery: 'El Haouaria, Tunisia',
    category: 'sahara',
    coords: [37.05, 11.01],
    tagline: 'Falcons, cliffs and Punic quarries',
    description:
      'At the tip of Cap Bon, cliffs drop into a sea that faces Sicily. Huge Punic quarries carved into the rock are lit by shafts of light from above.',
    didYouKnow:
      'El Haouaria has a centuries-old falconry tradition. Every spring, migrating raptors cross here and a falconry festival takes place in June.',
    insights: {
      history: "Stone for Carthage's monuments was quarried here and shipped across the gulf.",
      customs: 'Falconers often bring their birds out for visitors around the quarries.',
      food: 'Try "kafteji", a fried mix of vegetables, egg and spices.',
      bestTime: 'Spring for bird migration, June for the falconry festival.',
    },
    visitDuration: 'Half day',
    images: postcards('sahara', ['Roman quarry caves', 'Falconer on the cliff', 'View toward Sicily']),
    contact: contact(),
  },

  // ── South-west: Jerid & Sahara ─────────────────────────────────────
  {
    id: 'tozeur',
    wiki: 'Tozeur',
    name: 'Tozeur',
    nameAr: 'توزر',
    region: 'Tozeur',
    stayQuery: 'Tozeur, Tunisia',
    category: 'sahara',
    coords: [33.9197, 8.1335],
    tagline: 'Palm oasis and geometric brick',
    description:
      'Gateway to the Sahara, Tozeur sits in a palm grove of hundreds of thousands of date palms. The old Ouled el Hadef quarter is built of yellow bricks laid in geometric patterns.',
    didYouKnow:
      'The palm grove is irrigated by more than 200 springs, shared out with a water-clock system devised in the 13th century by the mathematician Ibn Chabbat.',
    insights: {
      history: 'Ancient Thusuros was a caravan stop on the trans-Saharan routes.',
      customs: "The poet Abou el Kacem Chebbi, author of the national anthem's verses, was born here.",
      food: 'Deglet nour dates, and "legmi", fresh palm sap, if you find it in the morning.',
      bestTime: 'October to April. The Sahara Festival in Douz is in late December.',
    },
    visitDuration: '1–2 days',
    images: postcards('sahara', ['Palm grove at dawn', 'Patterned brick walls', 'Date harvest']),
    contact: contact(),
  },
  {
    id: 'mos-espa',
    wiki: 'Mos Espa',
    name: 'Mos Espa (Ong Jemel)',
    region: 'Tozeur',
    stayQuery: 'Tozeur, Tunisia',
    category: 'sahara',
    coords: [33.9945, 7.8826],
    tagline: 'A Star Wars city in the dunes',
    description:
      'The set of Mos Espa, Anakin Skywalker\'s hometown in "The Phantom Menace", still stands among the dunes near Ong Jemel rock, also known as the Camel\'s Neck.',
    didYouKnow:
      "Tatooine, Luke Skywalker's home planet, is named after the real town of Tataouine in southern Tunisia.",
    insights: {
      history: 'Built in 1997 for "Episode I", the set was reused for "Attack of the Clones".',
      customs: 'Go with a 4x4 driver, the track crosses soft sand.',
      food: 'Bring water. Sellers at the set offer mint tea and roasted almonds.',
      bestTime: 'Sunrise or sunset, when the dunes turn orange.',
    },
    visitDuration: 'Half day',
    images: postcards('sahara', ['Domed set buildings', 'Ong Jemel rock', 'Dunes at sunset']),
    contact: contact(),
  },
  {
    id: 'chebika',
    wiki: 'Chebika',
    name: 'Chebika Mountain Oasis',
    nameAr: 'الشبيكة',
    region: 'Tozeur',
    stayQuery: 'Tozeur, Tunisia',
    category: 'sahara',
    coords: [34.3189, 7.9378],
    tagline: 'A waterfall in the desert mountains',
    description:
      'An abandoned stone village above a palm-filled canyon where a spring falls into clear pools. Nearby Tamerza and Midès complete the mountain oases circuit.',
    didYouKnow:
      'The old village was abandoned after unusually heavy floods in 1969 and its people rebuilt their homes lower down.',
    insights: {
      history: 'A Roman outpost called Ad Speculum, a lookout over the Chott el Gharsa.',
      customs: 'The canyon is a short hike: wear shoes you do not mind getting wet.',
      food: 'Fresh dates and pomegranates from the oasis gardens.',
      bestTime: 'October to April.',
    },
    visitDuration: 'Half day',
    images: postcards('sahara', ['Canyon spring', 'Abandoned stone village', 'Palms in the gorge']),
    contact: contact(),
  },
  {
    id: 'chott-el-jerid',
    wiki: 'Chott el Djerid',
    name: 'Chott el Jerid',
    nameAr: 'شط الجريد',
    region: 'Kebili',
    stayQuery: 'Tozeur, Tunisia',
    category: 'sahara',
    coords: [33.7, 8.43],
    tagline: 'A salt lake of mirages',
    description:
      'The largest salt pan in the Sahara, crossed by a straight causeway. In the heat, mirages float over the white crust, and pools turn pink with algae.',
    didYouKnow:
      'Luke Skywalker\'s homestead scenes in the 1977 "Star Wars" were filmed at the edge of the Chott el Jerid, and the igloo-shaped set can still be visited.',
    insights: {
      history: 'Caravans crossed the salt flat by following markers, and losing the path could be fatal.',
      customs: 'Do not drive off the causeway: the crust can hide mud.',
      food: 'Roadside stands sell desert roses, crystals of gypsum and sand.',
      bestTime: 'Sunrise, when the salt shines pink and gold.',
    },
    visitDuration: '1–2 hours',
    images: postcards('sahara', ['Salt crust to the horizon', 'Pink salt pools', 'The causeway']),
    contact: contact(),
  },
  {
    id: 'douz',
    wiki: 'Douz',
    name: 'Douz',
    nameAr: 'دوز',
    region: 'Kebili',
    stayQuery: 'Douz, Tunisia',
    category: 'sahara',
    coords: [33.4572, 9.0236],
    tagline: 'Where the Great Erg begins',
    description:
      'The "gateway to the Sahara", where the sand sea of the Grand Erg Oriental begins. Camel treks and desert camps leave from here.',
    didYouKnow:
      'The International Festival of the Sahara in Douz, held each winter since 1910, features camel races, poetry and traditional Mrazig weddings.',
    insights: {
      history: 'The Mrazig, a semi-nomadic people, settled around the oasis and still keep camels in the desert.',
      customs: 'Accept the tea offered in a desert camp. Saying no can seem rude.',
      food: 'Taste "mella", a bread baked in the hot sand under the campfire embers.',
      bestTime: 'November to March. The festival is in late December.',
    },
    visitDuration: '1–2 days',
    images: postcards('sahara', ['Camel caravan', 'Desert camp under stars', 'Festival horsemen']),
    contact: contact(),
  },

  // ── South-east: Matmata, Tataouine, Djerba ─────────────────────────
  {
    id: 'matmata',
    wiki: 'Matmata, Tunisia',
    name: 'Matmata',
    nameAr: 'مطماطة',
    region: 'Gabès',
    stayQuery: 'Matmata, Tunisia',
    category: 'culture',
    coords: [33.5428, 9.9667],
    tagline: 'Berber homes dug into the earth',
    description:
      'Amazigh families have lived for centuries in troglodyte homes: rooms carved around a deep circular courtyard, cool in summer and warm in winter.',
    didYouKnow:
      'The Hotel Sidi Driss, a troglodyte house, played Luke Skywalker\'s childhood home in "Star Wars". You can still sleep there.',
    insights: {
      history: 'The pit homes protected the Amazigh people from raids and from the extreme climate.',
      customs: 'Some families open their homes to visitors. A small tip is expected.',
      food: 'Try "kesra", a flat semolina bread baked on the clay "tajine".',
      bestTime: 'October to April.',
    },
    visitDuration: 'Half day',
    images: postcards('culture', ['Troglodyte courtyard', 'Hotel Sidi Driss', 'Lunar hills']),
    contact: contact(),
  },
  {
    id: 'ksar-ouled-soltane',
    wiki: 'Ksar Ouled Soltane',
    name: 'Ksar Ouled Soltane',
    nameAr: 'قصر أولاد سلطان',
    region: 'Tataouine',
    stayQuery: 'Tataouine, Tunisia',
    category: 'culture',
    coords: [32.7889, 10.5139],
    tagline: 'Granaries stacked like honeycomb',
    description:
      'A fortified granary of vaulted "ghorfas" stacked up to four storeys high around two courtyards, still used for celebrations today.',
    didYouKnow:
      'The ksar\'s courtyards were used as the slave quarters of Mos Espa in "Star Wars: The Phantom Menace".',
    insights: {
      history: 'Built from the 15th century by Berber tribes to store grain and olive oil safe from raids.',
      customs: 'The Ksour Festival in Tataouine each spring brings music and Berber poetry.',
      food: 'Try "kaak warka", ring-shaped almond pastries, and Tataouine\'s famous "corne de gazelle".',
      bestTime: 'Spring, during the Ksour Festival.',
    },
    visitDuration: '1–2 hours',
    images: postcards('culture', ['Stacked ghorfas', 'Courtyard stairs', 'Desert hills']),
    contact: contact(),
  },
  {
    id: 'djerba',
    wiki: 'Djerba',
    name: 'Djerba',
    nameAr: 'جربة',
    region: 'Médenine',
    stayQuery: 'Djerba, Tunisia',
    category: 'beach',
    coords: [33.8758, 10.8575],
    unesco: true,
    tagline: 'The island of dreams',
    description:
      'Flat, sunny and ringed by beaches, Djerba mixes whitewashed fortified mosques, the street art of Djerbahood and the lively souks of Houmt Souk.',
    didYouKnow:
      "In Homer's Odyssey, Djerba is often identified as the land of the Lotus-eaters, whose fruit made sailors forget their way home.",
    insights: {
      history:
        'Djerba was added to the UNESCO World Heritage List in 2023 as a model of settlement on an island, shaped by its Ibadi, Jewish and Maliki communities.',
      customs: 'Djerbian women traditionally wear a wide straw hat over a striped wrap called a "fouta".',
      food: '"Rice djerbien", rice steamed with fish, liver and herbs.',
      bestTime: 'April to October.',
    },
    visitDuration: '2–4 days',
    images: postcards('beach', ['Sidi Mahrez beach', 'Djerbahood murals', 'Houmt Souk']),
    contact: contact(),
  },
  {
    id: 'el-ghriba',
    wiki: 'El Ghriba synagogue',
    name: 'El Ghriba Synagogue',
    nameAr: 'كنيس الغريبة',
    region: 'Médenine',
    stayQuery: 'Djerba, Tunisia',
    category: 'culture',
    coords: [33.8136, 10.8597],
    tagline: "One of Africa's oldest synagogues",
    description:
      'A synagogue of blue tiles and painted wood in the village of Erriadh, at the heart of one of the oldest Jewish communities in the Arab world.',
    didYouKnow:
      'Every year, 33 days after Passover, thousands of pilgrims come for the Ghriba pilgrimage, a tradition said to be more than 2,000 years old.',
    insights: {
      history: 'Tradition says it was founded with a stone from the Temple of Jerusalem after its destruction.',
      customs: 'Remove your shoes and cover your head inside. Women may be asked to cover their shoulders.',
      food: 'Try "bouza", a hazelnut and sorghum cream sold in Erriadh.',
      bestTime: 'Any time except during the pilgrimage, unless you want to join it.',
    },
    visitDuration: '1 hour',
    images: postcards('culture', ['Blue tiled prayer hall', 'Erriadh lanes', 'Pilgrimage candles']),
    contact: contact(),
  },
  {
    id: 'guellala',
    wiki: 'Guellala',
    name: 'Guellala Potters',
    nameAr: 'قلالة',
    region: 'Médenine',
    stayQuery: 'Djerba, Tunisia',
    category: 'culture',
    coords: [33.7286, 10.8603],
    tagline: 'A village of clay and kilns',
    description:
      "Djerba's pottery village, where potters still work in vaulted underground workshops. The Guellala Heritage Museum tells the story of island life.",
    didYouKnow:
      "Guellala's potters traditionally work in half-buried workshops, which keep the clay cool and moist while it dries slowly.",
    insights: {
      history: 'Pottery has been made here since antiquity, and the craft has passed down through Amazigh families.',
      customs: 'Ask a potter to show you the wheel. Many workshops welcome visitors.',
      food: 'Octopus is cooked in clay jars here, called "kanouns".',
      bestTime: 'All year, mornings when the kilns are lit.',
    },
    visitDuration: '2 hours',
    images: postcards('culture', ['Potter at the wheel', 'Underground kiln', 'Stacked amphorae']),
    contact: contact(),
  },
  // ── Beaches ────────────────────────────────────────────────────────
  {
    id: 'kerkennah',
    wiki: 'Kerkennah Islands',
    name: 'Kerkennah Islands',
    nameAr: 'قرقنة',
    region: 'Sfax',
    stayQuery: 'Kerkennah, Tunisia',
    category: 'beach',
    coords: [34.7, 11.15],
    tagline: 'Flat islands of palms and fishermen',
    description:
      'An archipelago an hour by ferry from Sfax, with shallow turquoise water, quiet beaches and villages that still live from the sea. No big hotels, no hurry.',
    didYouKnow:
      'Kerkennah fishermen use the "charfia", fixed traps of palm fronds planted in the shallows. The technique is on the UNESCO list of intangible heritage.',
    insights: {
      history: 'Hannibal is said to have sailed from Kerkennah when he fled Carthage into exile in 195 BC.',
      customs: 'Rent a bike: the islands are almost perfectly flat and traffic is light.',
      food: 'Grilled octopus, dried in the sun on lines in front of the houses.',
      bestTime: 'May to October. The ferry from Sfax gets busy on summer weekends.',
    },
    visitDuration: '1–2 days',
    images: postcards('beach', ['Charfia traps in the shallows', 'Palm-lined shore', 'Fishing boats at Kraten']),
    contact: contact(),
  },
  {
    id: 'ghar-el-melh',
    wiki: 'Ghar el-Melh',
    name: 'Ghar El Melh',
    nameAr: 'غار الملح',
    region: 'Bizerte',
    stayQuery: 'Ghar El Melh, Tunisia',
    category: 'beach',
    coords: [37.17, 10.19],
    tagline: 'Ottoman forts on a quiet lagoon',
    description:
      'A fishing town on a lagoon at the foot of Jebel Nadhour, with three Ottoman forts and, a few minutes away, the white sand of Sidi Ali El Mekki under a cliff.',
    didYouKnow:
      'Under the name Porto Farina, the town was a base for the Ottoman fleet and corsairs in the 17th century.',
    insights: {
      history: 'Its port silted up over the centuries, which turned a naval base into a quiet fishing village.',
      customs: 'Locals farm vegetables on "ramli", plots on the sand that are watered from below by the lagoon.',
      food: 'Fresh fish grilled at the small port restaurants.',
      bestTime: 'June to September for swimming, spring for walks on the lagoon.',
    },
    visitDuration: 'Day trip',
    images: postcards('beach', ['Sidi Ali El Mekki beach', 'The old port', 'Ottoman fort walls']),
    contact: contact(),
  },
  {
    id: 'korbous',
    wiki: 'Korbous',
    name: 'Korbous',
    nameAr: 'قربص',
    region: 'Nabeul',
    stayQuery: 'Korbous, Tunisia',
    category: 'beach',
    coords: [36.8167, 10.5667],
    tagline: 'Hot springs that pour into the sea',
    description:
      'A spa village wedged between cliffs and the Gulf of Tunis on the wild western side of Cap Bon. At Ain Atrous, hot spring water runs straight into the sea.',
    didYouKnow: 'The Romans already came here for the springs, which they called Aquae Calidae Carpitanae.',
    insights: {
      history: 'Korbous became a fashionable thermal resort in the 19th century under the beys of Tunis.',
      customs: 'Swim where the warm water meets the sea at Ain Atrous, best on a cool day.',
      food: 'Grilled fish at the snack stands near the spring.',
      bestTime: 'Spring and autumn, when the contrast of warm and cool water is best.',
    },
    visitDuration: 'Half day',
    images: postcards('beach', ['Ain Atrous spring', 'Coastal road', 'Cliffs over the gulf']),
    contact: contact(),
  },
  {
    id: 'zarzis',
    wiki: 'Zarzis',
    name: 'Zarzis',
    nameAr: 'جرجيس',
    region: 'Médenine',
    stayQuery: 'Zarzis, Tunisia',
    category: 'beach',
    coords: [33.5039, 11.1122],
    tagline: 'Olive groves down to the sand',
    description:
      'South of Djerba, a long coast of fine sand and calm water backed by olive groves and palms, with fewer visitors than the island.',
    didYouKnow: 'Zarzis has one of the largest olive groves in southern Tunisia, some trees planted generations ago.',
    insights: {
      history: 'The Roman port of Gergis stood here, on the coastal road to Tripolitania.',
      customs: 'The Friday and Monday markets in town draw farmers from the whole peninsula.',
      food: 'Olive oil pressed nearby and fish couscous.',
      bestTime: 'May to October.',
    },
    visitDuration: '1–2 days',
    images: postcards('beach', ['Calm shallow water', 'Olive groves', 'Fishing harbour']),
    contact: contact(),
  },

  // ── Souks & markets ────────────────────────────────────────────────
  {
    id: 'souk-el-attarine',
    wiki: 'Souk El Attarine',
    name: 'Souk El Attarine',
    nameAr: 'سوق العطارين',
    region: 'Tunis',
    stayQuery: 'Medina of Tunis, Tunisia',
    category: 'souk',
    coords: [36.7985, 10.1716],
    unesco: true,
    tagline: 'The perfumers’ souk beside the Zitouna',
    description:
      'A covered lane of tiny shops next to the Zitouna Mosque, selling essential oils, incense, henna and painted wedding chests. It is one of the oldest souks of the medina.',
    didYouKnow:
      'Perfume sellers were placed closest to the Great Mosque on purpose: the noblest trades sat near the mosque, the noisiest and smelliest further away.',
    insights: {
      history: 'Founded in the 13th century under the Hafsid dynasty.',
      customs: 'Shopkeepers will offer a drop of jasmine or amber oil to try. Bargaining is expected, politely.',
      food: 'Have a mint tea with pine nuts at a café on the edge of the souk.',
      bestTime: 'Weekday mornings. Many shops close on Sunday.',
    },
    visitDuration: '1–2 hours',
    images: postcards('souk', ['Perfume bottles', 'Covered lane', 'Painted wedding chests']),
    contact: contact(),
  },
  {
    id: 'houmt-souk',
    wiki: 'Houmt Souk',
    name: 'Houmt Souk',
    nameAr: 'حومة السوق',
    region: 'Médenine',
    stayQuery: 'Houmt Souk, Djerba, Tunisia',
    category: 'souk',
    coords: [33.8775, 10.8605],
    tagline: 'Djerba’s market town and fish auction',
    description:
      'The island’s main town, with whitewashed covered souks, old caravanserais turned into guesthouses, and a morning fish auction where the crier sits on a raised chair.',
    didYouKnow: 'The name simply means "the market quarter" in Tunisian Arabic.',
    insights: {
      history: 'Caravans and ships traded here for centuries; the Borj El Kebir fort guards the harbour.',
      customs: 'At the fish auction, prices are called out fast and bids go by hand signs.',
      food: 'Brik and fresh fish at the restaurants around the market square.',
      bestTime: 'Mornings, Monday and Thursday are market days.',
    },
    visitDuration: 'Half day',
    images: postcards('souk', ['Covered souk', 'Fish auction', 'Caravanserai courtyard']),
    contact: contact(),
  },
  {
    id: 'nabeul-market',
    wiki: 'Nabeul',
    name: 'Nabeul Friday Market',
    nameAr: 'سوق الجمعة نابل',
    region: 'Nabeul',
    stayQuery: 'Nabeul, Tunisia',
    category: 'souk',
    coords: [36.451, 10.733],
    tagline: 'Pottery, spices and straw every Friday',
    description:
      'Each Friday the streets of Nabeul fill with stalls of pottery, baskets, spices and harissa, alongside the everyday trade of local farmers.',
    didYouKnow:
      'Nabeul’s potters work with clay from the area and have done so since Roman times, when the town was Neapolis.',
    insights: {
      history: 'Nabeul has been a crafts town for two thousand years, known for pottery and orange-blossom water.',
      customs: 'Go early, before the tour buses from Hammamet arrive late morning.',
      food: 'Buy a jar of harissa or "bsissa", a roasted grain flour mixed with oil and sugar.',
      bestTime: 'Friday mornings, all year. Orange blossom season is March to April.',
    },
    visitDuration: 'Half day',
    images: postcards('souk', ['Pottery stalls', 'Chilli strings', 'Woven baskets']),
    contact: contact(),
  },
  {
    id: 'kairouan-souks',
    wiki: 'Medina of Kairouan',
    name: 'Souks of Kairouan',
    nameAr: 'أسواق القيروان',
    region: 'Kairouan',
    stayQuery: 'Kairouan, Tunisia',
    category: 'souk',
    coords: [35.6775, 10.0985],
    unesco: true,
    tagline: 'Carpets and makroudh in the holy city',
    description:
      'The covered souks of the walled medina, known for knotted and woven carpets and for the bakeries of makroudh, the date-filled semolina cakes of Kairouan.',
    didYouKnow: 'Kairouan carpets carry an official quality stamp from the national crafts office on the back.',
    insights: {
      history:
        'The souks grew around the Great Mosque, founded in 670, making Kairouan the first great city of Islamic North Africa.',
      customs: 'Ask to see the stamp on a carpet before buying, and take your time over tea.',
      food: 'Warm makroudh straight from the fryer, dipped in honey syrup.',
      bestTime: 'October to April, mornings.',
    },
    visitDuration: 'Half day',
    images: postcards('souk', ['Carpet stacks', 'Makroudh trays', 'Medina gate']),
    contact: contact(),
  },
  {
    id: 'gabes-jara',
    wiki: 'Gabès',
    name: 'Jara Market, Gabès',
    nameAr: 'سوق جارة قابس',
    region: 'Gabès',
    stayQuery: 'Gabès, Tunisia',
    category: 'souk',
    coords: [33.8833, 10.095],
    tagline: 'The henna souk of a seaside oasis',
    description:
      'In the old Jara quarter, stalls sell henna grown in the Gabès oasis, spices, baskets of palm leaves and dates, a short walk from one of the world’s rare seaside oases.',
    didYouKnow:
      'Gabès henna is said to give the deepest colour in Tunisia, and is sold as powder or still as dried leaves.',
    insights: {
      history: 'The Gabès oasis, where palms meet the Mediterranean, has fed the town since antiquity.',
      customs: 'Vendors can grind henna to order and explain how to mix it.',
      food: 'Pomegranates and dates from the oasis in autumn.',
      bestTime: 'October to April.',
    },
    visitDuration: '2 hours',
    images: postcards('souk', ['Henna powder', 'Spice stalls', 'Palm baskets']),
    contact: contact(),
  },
];

export const PLACE_BY_ID: Record<string, Place> = Object.fromEntries(PLACES.map((p) => [p.id, p]));

export const ITINERARIES: Itinerary[] = [
  {
    id: 'roman-heritage',
    name: 'The Roman Heritage Trail',
    tagline: 'Five cities of Africa Proconsularis',
    description:
      'From the ports of Carthage to the colossal arena of El Jem, through the hilltop forums of the Tell. A road trip through the breadbasket of Rome.',
    days: 4,
    stops: ['carthage', 'dougga', 'bulla-regia', 'sbeitla', 'el-jem'],
  },
  {
    id: 'star-wars',
    name: 'Star Wars Desert Route',
    tagline: 'Tatooine was here all along',
    description:
      "Follow the film crews across the Jerid and the Dahar: the Mos Espa set, Luke's homestead on the salt lake, the Lars family home in Matmata and the slave quarters at Ksar Ouled Soltane.",
    days: 3,
    stops: ['tozeur', 'mos-espa', 'chott-el-jerid', 'matmata', 'ksar-ouled-soltane'],
  },
  {
    id: 'cap-bon',
    name: 'Cap Bon Coastal Escapes',
    tagline: 'Jasmine, harissa and turquoise coves',
    description:
      'A slow coastal loop around the Cap Bon peninsula: the beaches of Hammamet, the potters of Nabeul, the fort of Kélibia and the falcon cliffs of El Haouaria.',
    days: 2,
    stops: ['hammamet', 'nabeul', 'kelibia', 'el-haouaria'],
  },
  {
    id: 'sacred-medinas',
    name: 'Medinas & Sacred Cities',
    tagline: 'Thirteen centuries of Islamic architecture',
    description:
      'From the souks of Tunis to the holy city of Kairouan and the fortified ports of the Sahel, ending on the white peninsula of Mahdia.',
    days: 4,
    stops: ['medina-tunis', 'kairouan', 'sousse-medina', 'monastir', 'mahdia'],
  },
];

/** Map centre roughly in the middle of the country */
export const TUNISIA_CENTER: [number, number] = [34.6, 9.6];
