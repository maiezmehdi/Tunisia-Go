import type { Locale } from '@/lib/i18n/config';

/**
 * Long visit guides for the most searched places (400 to 600 words in each language), shown on
 * the place page under the short description. Written for Tunisia Go, not copied from other sites.
 *
 * Opening hours, ticket prices and transport timetables are left out on purpose: they change and
 * none of them has been checked on site. The text tells visitors to check them locally; the
 * TODO comments mark where a checked figure could be added later.
 */
export interface PlaceGuide {
  /** <title>, 50 to 60 characters. */
  title: string;
  /** Meta description, 140 to 160 characters. */
  description: string;
  sections: { heading: string; paragraphs: string[] }[];
}

const HEADINGS = {
  fr: {
    intro: 'Présentation et histoire',
    see: 'Que voir sur place',
    when: 'Quand y aller',
    how: 'Comment s’y rendre',
    tip: 'Le conseil local',
  },
  en: {
    intro: 'Overview and history',
    see: 'What to see',
    when: 'When to go',
    how: 'Getting there',
    tip: 'Local tip',
  },
} as const;

type Texts = Record<keyof (typeof HEADINGS)['fr'], string[]>;

function guide(lang: Locale, title: string, description: string, texts: Texts): PlaceGuide {
  const h = HEADINGS[lang];
  return {
    title,
    description,
    sections: (Object.keys(h) as (keyof Texts)[]).map((key) => ({ heading: h[key], paragraphs: texts[key] })),
  };
}

const GUIDES: Record<string, Record<Locale, PlaceGuide>> = {
  carthage: {
    fr: guide(
      'fr',
      'Visiter Carthage : sites, histoire et conseils pratiques',
      'Visiter Carthage près de Tunis : colline de Byrsa, ports puniques, Tophet et thermes d’Antonin. Histoire, meilleure saison, accès en TGM et conseils locaux.',
      {
        intro: [
          'Selon la tradition, Carthage est fondée vers 814 av. J.-C. par des colons phéniciens venus de Tyr, menés par la reine Elyssa, que les Romains appelleront Didon. La cité devient la capitale d’un empire marchand qui contrôle une grande partie de la Méditerranée occidentale, jusqu’à affronter Rome lors des trois guerres puniques.',
          'En 146 av. J.-C., Rome rase la ville. Elle la refonde un siècle plus tard et en fait la capitale de la province d’Afrique, l’une des plus grandes villes de l’Empire. Le site est inscrit au patrimoine mondial de l’UNESCO depuis 1979. Aujourd’hui, ses vestiges sont dispersés dans une banlieue résidentielle au bord de la mer, entre villas, jardins et rues calmes.',
        ],
        see: [
          'Commencez par la colline de Byrsa, cœur de la ville punique puis romaine : le musée national de Carthage y est installé et la vue embrasse tout le golfe de Tunis. Descendez ensuite vers les ports puniques, dont le bassin circulaire abritait la flotte de guerre, puis vers le Tophet de Salammbô, sanctuaire aux stèles alignées sous les arbres.',
          'Les thermes d’Antonin, au bord de l’eau, sont le site le plus spectaculaire : on circule surtout dans le niveau inférieur, où l’on mesure la taille de l’édifice. Gardez du temps pour le quartier des villas romaines, le théâtre et l’amphithéâtre. Un billet combiné couvre la plupart des sites, mais ils sont éloignés les uns des autres : prévoyez une demi-journée au minimum.',
        ],
        when: [
          'Le printemps, de mars à mai, et l’automne, de fin septembre à novembre, offrent la lumière la plus douce et des températures agréables pour marcher. L’été, la chaleur est forte et l’ombre rare sur les sites : venez dès l’ouverture ou en fin d’après-midi. En juillet et août, le festival international de Carthage anime le théâtre antique le soir.',
          // TODO: à vérifier — horaires d’ouverture des sites et du musée, et prix du billet combiné.
          'Les horaires d’ouverture changent selon la saison : vérifiez-les sur place ou auprès de l’office du tourisme avant de partir.',
        ],
        how: [
          'Carthage se trouve à une quinzaine de kilomètres du centre de Tunis et tout près de l’aéroport Tunis-Carthage. Le plus simple est le TGM, le train de banlieue qui part de Tunis Marine et dessert plusieurs stations de Carthage. Un taxi depuis Tunis ou La Marsa est aussi une bonne solution, surtout pour enchaîner des sites éloignés.',
          // TODO: à vérifier — fréquence du TGM et noms exacts des stations les plus proches de chaque site.
          'En voiture, on se gare facilement près de la plupart des sites, sauf les jours de grande affluence.',
        ],
        tip: [
          'Faites l’inverse des groupes : commencez par les thermes d’Antonin tôt le matin, quand la lumière rase la mer, et gardez Byrsa pour la fin de journée. Finissez à Sidi Bou Saïd, à quelques stations de TGM, pour un thé aux pignons face au golfe.',
        ],
      },
    ),
    en: guide(
      'en',
      'Visiting Carthage: ruins, history and practical tips',
      'Visit Carthage near Tunis: Byrsa Hill, the Punic ports, the Tophet and the Antonine Baths. History, best season, getting there by TGM train and local tips.',
      {
        intro: [
          'Tradition dates the founding of Carthage to around 814 BC, when Phoenician settlers from Tyre arrived under Queen Elyssa, the Dido of Roman legend. The city grew into the capital of a trading empire that ruled much of the western Mediterranean, until it clashed with Rome in the three Punic Wars.',
          'Rome razed the city in 146 BC, then refounded it a century later as the capital of the province of Africa, one of the largest cities in the empire. Carthage has been a UNESCO World Heritage Site since 1979. Its ruins are now scattered across a leafy seaside suburb, among villas, gardens and quiet streets.',
        ],
        see: [
          'Start on Byrsa Hill, the heart of both Punic and Roman Carthage: the Carthage National Museum stands at the top, and the view takes in the whole Gulf of Tunis. Then head down to the Punic ports, whose circular basin once sheltered the war fleet, and to the Tophet of Salammbô, a sanctuary of stelae lined up under the trees.',
          'The Antonine Baths by the sea are the highlight: you mostly walk through the lower level, which gives a real sense of the building’s scale. Leave time for the Roman villas, the theatre and the amphitheatre. One combined ticket covers most sites, but they are spread out, so allow at least half a day.',
        ],
        when: [
          'Spring, from March to May, and autumn, from late September to November, bring soft light and comfortable walking weather. Summer is hot and there is little shade on the sites, so go at opening time or late in the afternoon. In July and August, the Carthage International Festival fills the ancient theatre in the evenings.',
          // TODO: à vérifier — opening hours of the sites and museum, and the price of the combined ticket.
          'Opening hours vary with the season: check them on site or with the tourist office before you go.',
        ],
        how: [
          'Carthage lies about fifteen kilometres from central Tunis and very close to Tunis-Carthage airport. The easiest way in is the TGM, the suburban train from Tunis Marine, which stops at several Carthage stations. A taxi from Tunis or La Marsa also works well, especially to link sites that are far apart.',
          // TODO: à vérifier — TGM frequency and the exact stations closest to each site.
          'By car, parking near most sites is easy, except on the busiest days.',
        ],
        tip: [
          'Do the opposite of the tour groups: start with the Antonine Baths early in the morning, when the light skims the sea, and keep Byrsa for the end of the day. Then carry on to Sidi Bou Saïd, a few TGM stops away, for a pine-nut tea above the gulf.',
        ],
      },
    ),
  },

  dougga: {
    fr: guide(
      'fr',
      'Visiter Dougga : la cité romaine la mieux conservée',
      'Dougga, cité romaine classée UNESCO près de Teboursouk : Capitole, théâtre, temples et mausolée libyco-punique. Histoire, saison idéale, accès et conseil local.',
      {
        intro: [
          'Avant d’être romaine, Thugga est une ville numide, installée sur un plateau qui domine la vallée de l’oued Khalled. Sous Rome, Numides et Romains y vivent côte à côte pendant des siècles, ce qui explique son plan irrégulier, loin des villes tracées au cordeau.',
          'Dougga est inscrite au patrimoine mondial de l’UNESCO depuis 1997. C’est souvent considérée comme la ville romaine la mieux conservée d’Afrique du Nord : on y lit encore les rues, les places, les maisons et les monuments publics d’une ville entière, au milieu des oliviers et presque sans aménagement moderne.',
          'La ville connaît son apogée aux IIe et IIIe siècles, quand ses notables financent temples, thermes et théâtre : leurs dédicaces gravées se lisent encore sur de nombreux monuments. Plus tard, un village s’installe au milieu des ruines ; ses habitants sont relogés au XXe siècle dans un nouveau village, au pied du site.',
        ],
        see: [
          'Le Capitole, avec ses colonnes et son fronton encore debout, domine le forum et la place de la Rose des vents, où une rose des vents est gravée dans le dallage. Juste à côté, le théâtre peut accueillir environ 3 500 spectateurs et s’ouvre sur la vallée : c’est le meilleur point de vue du site.',
          'Plus bas, le mausolée libyco-punique, haute tour funéraire du IIe siècle av. J.-C., est l’un des rares monuments royaux numides conservés. Son inscription bilingue, en punique et en libyque, a aidé à déchiffrer l’écriture libyque ; l’original est aujourd’hui au British Museum. Ne manquez pas non plus le temple de Junon Caelestis, les thermes liciniens et leurs couloirs de service, et les maisons à mosaïques. Le site est vaste et vallonné : comptez une demi-journée.',
        ],
        when: [
          'Le printemps est la plus belle saison : en mars et avril, le site se couvre de fleurs sauvages et les collines sont vertes. L’automne est agréable aussi. En été, il fait très chaud sur ce plateau sans ombre : arrivez à l’ouverture et prévoyez de l’eau et un chapeau.',
          // TODO: à vérifier — horaires d’ouverture et prix du billet d’entrée.
          'Les horaires et le prix d’entrée peuvent changer : renseignez-vous sur place avant de vous déplacer.',
        ],
        how: [
          'Dougga se trouve près de Teboursouk, dans le gouvernorat de Béja, à environ deux heures de route de Tunis. La voiture reste le moyen le plus pratique, car les transports en commun ne montent pas jusqu’au site. Le trajet peut se combiner avec Testour et ses maisons andalouses sur la route du retour.',
          // TODO: à vérifier — louage Tunis–Teboursouk et taxi jusqu’au site : disponibilité et durée.
          'Sans voiture, il faut rejoindre Teboursouk puis prendre un taxi pour les derniers kilomètres.',
        ],
        tip: [
          'Achetez du pain tabouna à Teboursouk avant de monter et pique-niquez à l’ombre des oliviers derrière le théâtre. Mettez de bonnes chaussures : les dalles romaines sont d’origine, glissantes et inégales.',
        ],
      },
    ),
    en: guide(
      'en',
      'Visiting Dougga: the best-preserved Roman town in Tunisia',
      'Dougga, a UNESCO-listed Roman town near Teboursouk: the Capitol, theatre, temples and a Libyco-Punic mausoleum. History, best season, getting there, local tips.',
      {
        intro: [
          'Before it was Roman, Thugga was a Numidian town on a plateau above the valley of the Oued Khalled. Under Rome, Numidians and Romans lived side by side here for centuries, which is why the street plan is irregular rather than laid out on a grid.',
          'Dougga has been a UNESCO World Heritage Site since 1997 and is often described as the best-preserved Roman town in North Africa. Streets, squares, houses and public buildings of a whole town can still be read on the ground, among olive groves and with almost no modern development.',
          'The town peaked in the 2nd and 3rd centuries AD, when its leading citizens paid for temples, baths and the theatre: their carved dedications can still be read on many buildings. Later a village grew up among the ruins; its families were rehoused in a new village below the site in the 20th century.',
        ],
        see: [
          'The Capitol, with its columns and pediment still standing, towers over the forum and the Square of the Winds, where a wind rose is carved into the paving. Next door, the theatre seats about 3,500 people and opens onto the valley: it is the best viewpoint on the site.',
          'Further down, the Libyco-Punic mausoleum, a tall funerary tower from the 2nd century BC, is one of the few surviving royal Numidian monuments. Its bilingual inscription, in Punic and Libyan, helped scholars decipher the Libyan script; the original stone is now in the British Museum. Do not miss the Temple of Juno Caelestis, the Licinian Baths with their service corridors, and the houses with mosaics. The site is large and hilly, so allow half a day.',
        ],
        when: [
          'Spring is the best season: in March and April the site is covered in wild flowers and the hills are green. Autumn is pleasant too. In summer this shadeless plateau gets very hot, so arrive at opening time with water and a hat.',
          // TODO: à vérifier — opening hours and ticket price.
          'Opening hours and ticket prices can change: check locally before you set off.',
        ],
        how: [
          'Dougga is near Teboursouk, in the governorate of Béja, about two hours’ drive from Tunis. A car is by far the most practical option, as public transport does not go up to the site. On the way back you can stop in Testour and its Andalusian houses.',
          // TODO: à vérifier — louage from Tunis to Teboursouk and taxi to the site: availability and journey time.
          'Without a car, travel to Teboursouk first, then take a taxi for the last few kilometres.',
        ],
        tip: [
          'Buy tabouna bread in Teboursouk on the way up and have a picnic under the olive trees behind the theatre. Wear proper shoes: the Roman paving is original, slippery and uneven.',
        ],
      },
    ),
  },

  'el-jem': {
    fr: guide(
      'fr',
      'Amphithéâtre d’El Jem : visite, histoire et conseils',
      'L’amphithéâtre d’El Jem, classé UNESCO : gradins, souterrains et musée des mosaïques. Histoire de Thysdrus, meilleure heure, accès en train et conseils.',
      {
        intro: [
          'Au IIIe siècle, Thysdrus est une ville prospère, enrichie par le commerce de l’huile d’olive. Vers 238, elle se dote d’un amphithéâtre de près de 35 000 places, l’un des plus grands jamais construits par Rome. La même année, une révolte partie d’ici proclame empereur le proconsul Gordien, épisode bref mais célèbre de l’histoire romaine.',
          'L’amphithéâtre, inscrit au patrimoine mondial de l’UNESCO depuis 1979, est l’un des mieux conservés au monde. Il surgit au milieu de la petite ville d’El Jem, entre les maisons basses et les oliveraies du Sahel, ce qui rend son apparition d’autant plus saisissante.',
          'Après la fin de l’Empire, l’édifice sert de forteresse. Selon la tradition, la reine berbère Kahena s’y serait retranchée face aux armées arabes à la fin du VIIe siècle. La brèche visible dans la façade date de la fin du XVIIe siècle, quand le bey fit tirer au canon sur des rebelles réfugiés à l’intérieur.',
        ],
        see: [
          'Montez dans les gradins jusqu’aux galeries supérieures : la vue sur l’arène et sur la ville est la meilleure récompense de la visite. Descendez ensuite dans les souterrains, où l’on gardait les fauves et les décors avant les spectacles, et où l’on comprend la mécanique des jeux. L’arène a servi de décor à plusieurs films, dont « Gladiator ».',
          'Le billet donne aussi accès au musée archéologique, à quelques minutes à pied, qui présente de très belles mosaïques retrouvées dans les villas de Thysdrus et une maison romaine reconstituée. Prévoyez deux à trois heures pour l’ensemble.',
        ],
        when: [
          'Venez tôt le matin ou en fin d’après-midi : la pierre prend une couleur dorée et la chaleur est plus supportable. Le printemps et l’automne sont les saisons idéales. En juillet et août, le festival international de musique symphonique d’El Jem donne des concerts dans l’arène, une expérience rare.',
          // TODO: à vérifier — horaires d’ouverture, prix du billet et programme du festival.
          'Les horaires et le prix du billet évoluent : vérifiez-les sur place avant votre visite.',
        ],
        how: [
          'El Jem se trouve dans le gouvernorat de Mahdia, sur la route entre Sousse et Sfax, à environ une heure de route de chacune. La ville a une gare sur la ligne de train Tunis–Sfax, à quelques minutes à pied de l’amphithéâtre, ce qui permet une excursion à la journée sans voiture. Les louages relient aussi El Jem aux villes voisines.',
          // TODO: à vérifier — horaires et durée des trains depuis Tunis, Sousse et Sfax.
        ],
        tip: [
          'Après la visite, installez-vous à la terrasse d’un café face à l’arène pour une chakchouka. C’est le meilleur moment pour regarder la lumière changer sur la façade, une fois les groupes repartis.',
        ],
      },
    ),
    en: guide(
      'en',
      'El Jem Amphitheatre: visit, history and practical tips',
      'El Jem Amphitheatre, a UNESCO site: the tiers, the tunnels and the mosaic museum. History of Thysdrus, best time to visit, getting there by train, tips.',
      {
        intro: [
          'In the 3rd century, Thysdrus was a wealthy town that had grown rich on the olive oil trade. Around 238 AD it built an amphitheatre for nearly 35,000 spectators, one of the largest Rome ever raised. That same year, a revolt that began here proclaimed the proconsul Gordian emperor, a brief but famous episode of Roman history.',
          'The amphitheatre, a UNESCO World Heritage Site since 1979, is one of the best-preserved in the world. It rises in the middle of the small town of El Jem, among low houses and the olive groves of the Sahel, which makes the first sight of it all the more striking.',
          'After the fall of the empire the building served as a fortress. Tradition says the Berber queen Kahena held out here against the Arab armies at the end of the 7th century. The gap in the façade dates from the late 17th century, when the bey had cannon fired at rebels sheltering inside.',
        ],
        see: [
          'Climb the tiers up to the upper galleries: the view over the arena and the town is the best reward of the visit. Then go down into the tunnels, where wild animals and stage sets were kept before the games, and where the workings of the shows become clear. The arena has been used as a film set, including for "Gladiator".',
          'Your ticket also covers the archaeological museum, a few minutes’ walk away, with superb mosaics from the villas of Thysdrus and a reconstructed Roman house. Allow two to three hours for both.',
        ],
        when: [
          'Come early in the morning or late in the afternoon, when the stone turns golden and the heat is easier to bear. Spring and autumn are the ideal seasons. In July and August, the El Jem International Symphony Festival holds concerts in the arena, a rare experience.',
          // TODO: à vérifier — opening hours, ticket price and festival programme.
          'Opening hours and ticket prices change: check them on site before your visit.',
        ],
        how: [
          'El Jem is in the governorate of Mahdia, on the road between Sousse and Sfax, about an hour’s drive from each. The town has a station on the Tunis–Sfax railway line, a few minutes’ walk from the amphitheatre, so a day trip without a car is easy. Louages, the shared taxis, also link El Jem with nearby towns.',
          // TODO: à vérifier — train times and journey length from Tunis, Sousse and Sfax.
        ],
        tip: [
          'After your visit, take a table at a café facing the arena and order a chakchouka. It is the best moment to watch the light change on the façade, once the tour groups have left.',
        ],
      },
    ),
  },

  hammamet: {
    fr: guide(
      'fr',
      'Que faire à Hammamet : médina, plages et conseils utiles',
      'Hammamet : médina face à la mer, plages de sable, villa Sebastian et festival d’été. Histoire, meilleure saison, accès depuis Tunis et conseils d’un local.',
      {
        intro: [
          'Hammamet doit son nom aux bains, hammam, et s’est longtemps contentée d’être un village de pêcheurs et de cultivateurs d’agrumes autour de sa médina fortifiée, posée au bord de l’eau. Au début du XXe siècle, des artistes et des voyageurs européens la découvrent : Paul Klee y peint en 1914, et le Roumain Georges Sebastian y fait construire une villa qui attirera écrivains et artistes.',
          'Depuis les années 1960, Hammamet est devenue la station balnéaire la plus connue de Tunisie, avec ses longues plages de sable et la station de Yasmine Hammamet au sud. La vieille ville, elle, garde son échelle de village et son atmosphère tranquille le matin, quand les pêcheurs rentrent et que les cafés ouvrent face à la mer.',
        ],
        see: [
          'Entrez dans la médina par la porte principale et montez sur les remparts de la kasbah : la vue file sur la plage et sur la mer. Perdez-vous ensuite dans les ruelles blanches, entre portes bleues, petites mosquées et ateliers. Le cimetière marin, au pied des remparts, est l’un des endroits les plus photographiés de la ville.',
          'Hors de la médina, la villa Sebastian, devenue centre culturel international, a gardé ses jardins et son théâtre en plein air. Au sud, le site archéologique de Pupput rappelle qu’une ville romaine existait déjà ici. Et bien sûr, les plages : celles proches du centre sont animées, celles plus au nord sont souvent plus calmes. Au sud, Yasmine Hammamet ajoute une marina et une médina récente, construite pour les visiteurs.',
        ],
        when: [
          'De mai à octobre pour la baignade, avec une mer chaude dès juin. Le printemps et le début de l’automne sont les meilleurs moments pour marcher dans la médina sans la foule de l’été. En juillet et août, le festival international de Hammamet programme concerts et théâtre dans l’amphithéâtre de la villa Sebastian.',
          // TODO: à vérifier — dates et programme du festival international de Hammamet.
        ],
        how: [
          'Hammamet se trouve à environ une heure de route au sud de Tunis par l’autoroute, et à moins d’une heure de l’aéroport d’Enfidha-Hammamet. La ville est aussi desservie par le train de la ligne Tunis–Nabeul et par des louages. Sur place, la médina et la plage se parcourent à pied, et les taxis relient facilement Yasmine Hammamet ou Nabeul, toute proche. L’été, il est difficile de se garer près de la médina : laissez la voiture un peu plus loin.',
          // TODO: à vérifier — fréquence des trains Tunis–Hammamet et durée du trajet.
        ],
        tip: [
          'Le soir, achetez un machmoum de jasmin aux vendeurs ambulants et portez-le derrière l’oreille, comme les Hammamétois. Pour dîner, choisissez un poisson grillé avec une salade méchouia dans une adresse fréquentée par les familles tunisiennes plutôt que sur le front de mer. Et pour les photos de la médina, venez avant dix heures, quand les ruelles sont encore calmes.',
        ],
      },
    ),
    en: guide(
      'en',
      'Things to do in Hammamet: medina, beaches and tips',
      'Hammamet: a medina facing the sea, sandy beaches, the Sebastian villa and a summer festival. History, best season, getting there from Tunis and a local’s tips.',
      {
        intro: [
          'Hammamet takes its name from its baths, the hammam, and was long a village of fishermen and citrus growers around a walled medina right on the water. In the early 20th century European artists and travellers discovered it: Paul Klee painted here in 1914, and the Romanian Georges Sebastian built a villa that went on to draw writers and artists.',
          'Since the 1960s Hammamet has been Tunisia’s best-known beach resort, with long sandy beaches and the Yasmine Hammamet development to the south. The old town has kept the scale of a village, and its mornings are quiet, as the fishermen come in and the cafés open onto the sea.',
        ],
        see: [
          'Enter the medina through the main gate and climb onto the ramparts of the kasbah, where the view runs along the beach and out to sea. Then wander the white lanes, past blue doors, small mosques and workshops. The seaside cemetery at the foot of the walls is one of the most photographed spots in town.',
          'Outside the medina, the Sebastian villa, now an international cultural centre, has kept its gardens and open-air theatre. To the south, the archaeological site of Pupput shows that a Roman town stood here long before the resort. And then there are the beaches: those near the centre are lively, while those further north are often calmer. To the south, Yasmine Hammamet adds a marina and a recently built medina designed for visitors.',
        ],
        when: [
          'May to October for swimming, with warm water from June. Spring and early autumn are the best times to walk the medina without the summer crowds. In July and August, the Hammamet International Festival stages concerts and plays in the Sebastian villa’s amphitheatre.',
          // TODO: à vérifier — dates and programme of the Hammamet International Festival.
        ],
        how: [
          'Hammamet is about an hour’s drive south of Tunis on the motorway, and under an hour from Enfidha-Hammamet airport. Trains on the Tunis–Nabeul line and louages, the shared taxis, also serve the town. Once there, the medina and the beach are easy on foot, and taxis run to Yasmine Hammamet or nearby Nabeul. In summer, parking near the medina is tight, so leave the car a little way off.',
          // TODO: à vérifier — Tunis–Hammamet train frequency and journey time.
        ],
        tip: [
          'In the evening, buy a jasmine machmoum from the street sellers and tuck it behind your ear, as locals do. For dinner, pick grilled fish with a salade méchouia at a place full of Tunisian families rather than on the seafront strip. For photos of the medina, come before ten in the morning, while the lanes are still quiet.',
        ],
      },
    ),
  },

  kairouan: {
    fr: guide(
      'fr',
      'Visiter Kairouan : Grande Mosquée, médina et tapis',
      'Kairouan, ville sainte classée UNESCO : Grande Mosquée de Oqba, bassins des Aghlabides, médina et tapis. Histoire, saison idéale, accès et conseils.',
      {
        intro: [
          'Kairouan est fondée en 670 par Oqba ibn Nafi, à l’intérieur des terres, loin des côtes que la flotte byzantine contrôlait encore. Première capitale arabe du Maghreb, elle devient au IXe siècle, sous les émirs aghlabides, un grand centre religieux et intellectuel dont le rayonnement s’étend à toute l’Afrique du Nord.',
          'Considérée comme l’une des villes saintes de l’islam, Kairouan est inscrite au patrimoine mondial de l’UNESCO depuis 1988. Sa médina ceinte de remparts de brique reste habitée et vivante : on y vient autant pour les monuments que pour les tapis, les pâtisseries et la vie des souks. Le tapis de Kairouan, à médaillon central et bordures géométriques, est souvent tissé en laine aux couleurs naturelles, l’alloucha.',
        ],
        see: [
          'La Grande Mosquée de Oqba est le monument majeur : sa vaste cour dallée, son minaret massif, l’un des plus anciens du monde musulman, et sa salle de prière aux colonnes antiques ont servi de modèle aux mosquées de tout le Maghreb. Les visiteurs non musulmans peuvent entrer dans la cour, mais pas dans la salle de prière.',
          'Ne manquez pas les bassins des Aghlabides, immenses réservoirs circulaires du IXe siècle, la mosquée des Trois Portes et sa façade sculptée, et la zaouïa de Sidi Sahbi, couverte de céramiques et de stucs. Dans la médina, le puits de Bir Barouta, où un dromadaire fait tourner la noria, et les ateliers de tapis complètent la journée.',
        ],
        when: [
          'D’octobre à avril, quand les températures restent douces : Kairouan est dans les terres et l’été y est très chaud. Évitez le vendredi à midi pour la Grande Mosquée, fermée aux visiteurs pendant la prière. Pendant le Mouled, la ville accueille de nombreux pèlerins et prend un air de fête.',
          // TODO: à vérifier — horaires de visite de la Grande Mosquée, billet unique des monuments (prix et point de vente).
          'Les horaires de visite des monuments varient : renseignez-vous sur place, car un billet unique couvre souvent plusieurs sites.',
        ],
        how: [
          'Kairouan se trouve à environ deux heures de route de Tunis et à une heure de Sousse. Les louages la relient aux grandes villes, et la voiture permet de la combiner avec El Jem ou Sbeïtla dans un même voyage. Dans la ville, tout se fait à pied entre la médina et les bassins. Comptez une journée entière pour voir les principaux monuments sans courir.',
          // TODO: à vérifier — lignes de louage et de bus depuis Tunis et Sousse, durée des trajets.
        ],
        tip: [
          'Goûtez le makroudh chez un pâtissier de la médina, encore tiède, fourré aux dattes et trempé dans le miel. Dans les boutiques de tapis, prenez le temps du thé et de la discussion : on peut regarder sans acheter, et demander à voir le label qui garantit un tapis noué main. Pour les mosquées, prévoyez une tenue couvrant épaules et genoux.',
        ],
      },
    ),
    en: guide(
      'en',
      'Visiting Kairouan: Great Mosque, medina and carpets',
      'Kairouan, a UNESCO-listed holy city: the Great Mosque of Uqba, the Aghlabid basins, the medina and its carpets. History, best season, how to get there.',
      {
        intro: [
          'Kairouan was founded in 670 by Uqba ibn Nafi, inland and away from the coast, which the Byzantine fleet still controlled. The first Arab capital of the Maghreb, it became in the 9th century, under the Aghlabid emirs, a great religious and intellectual centre whose influence reached across North Africa.',
          'Regarded as one of the holy cities of Islam, Kairouan has been a UNESCO World Heritage Site since 1988. Its medina, ringed by brick walls, is still lived in and busy: people come as much for the monuments as for the carpets, the pastries and the life of the souks. The Kairouan carpet, with its central medallion and geometric borders, is often woven in undyed natural wool, known as alloucha.',
        ],
        see: [
          'The Great Mosque of Uqba is the main sight: its vast paved courtyard, its massive minaret, one of the oldest in the Muslim world, and its prayer hall of ancient columns served as a model for mosques across the Maghreb. Non-Muslim visitors may enter the courtyard but not the prayer hall.',
          'Do not miss the Aghlabid basins, huge circular reservoirs from the 9th century, the Mosque of the Three Doors with its carved façade, and the Zawiya of Sidi Sahbi, covered in tiles and stucco. In the medina, the Bir Barouta well, where a camel turns the waterwheel, and the carpet workshops round off the day.',
        ],
        when: [
          'October to April, while temperatures stay mild: Kairouan lies inland and summers are very hot. Avoid Friday midday for the Great Mosque, which is closed to visitors during prayers. During the Mouled festival the city welcomes many pilgrims and takes on a festive air.',
          // TODO: à vérifier — Great Mosque visiting hours, single ticket for the monuments (price and where to buy it).
          'Visiting hours vary: check locally, as a single ticket often covers several monuments.',
        ],
        how: [
          'Kairouan is about two hours’ drive from Tunis and an hour from Sousse. Louages link it with the main cities, and a car lets you combine it with El Jem or Sbeitla on the same trip. In town, everything between the medina and the basins is within walking distance. Allow a full day to see the main monuments without rushing.',
          // TODO: à vérifier — louage and bus routes from Tunis and Sousse, journey times.
        ],
        tip: [
          'Try makroudh at a medina pastry shop while it is still warm, filled with dates and soaked in honey. In the carpet shops, take time for the tea and the conversation: you can look without buying, and ask to see the label that guarantees a hand-knotted carpet. For the mosques, dress modestly, with shoulders and knees covered.',
        ],
      },
    ),
  },

  nabeul: {
    fr: guide(
      'fr',
      'Visiter Nabeul : harissa, poterie et marché du vendredi',
      'Nabeul, capitale de la harissa et de la poterie au Cap Bon : marché du vendredi, ateliers, site de Neapolis. Histoire, saison idéale, accès et conseil local.',
      {
        intro: [
          'Nabeul occupe l’emplacement de l’antique Neapolis, ville grecque puis romaine réputée pour son garum, la sauce de poisson fermentée que l’on exportait dans toute la Méditerranée. Aujourd’hui, c’est la capitale du Cap Bon, une région de vergers, de champs de piments et d’ateliers d’artisans, où l’on vit encore beaucoup au rythme des récoltes.',
          'La ville est connue dans tout le pays pour deux choses : sa poterie peinte à la main et sa harissa. Les piments du Cap Bon y sont séchés au soleil, moulus et mélangés à l’ail et aux épices. La harissa tunisienne est inscrite depuis 2022 au patrimoine culturel immatériel de l’UNESCO.',
        ],
        see: [
          'Commencez par les ateliers de potiers et de céramistes, où l’on voit tourner, peindre et cuire les pièces que l’on retrouve ensuite dans tout le pays. Les boutiques de l’avenue principale vendent assiettes, plats à couscous et carreaux décorés, mais les ateliers en retrait sont souvent plus intéressants. À quelques kilomètres, Dar Chaabane est le village des tailleurs de pierre, qui sculptent les encadrements de portes et les colonnes des maisons du Cap Bon.',
          'Le site archéologique de Neapolis, au bord de la mer, conserve les bassins de salaison où l’on fabriquait le garum, et le musée archéologique de Nabeul présente des mosaïques de la région. Le vendredi, le grand marché attire des familles de tout le Cap Bon : épices, piments, poteries, vannerie et produits des fermes.',
        ],
        when: [
          'L’automne est la meilleure saison : c’est le temps de la récolte des piments, que l’on voit sécher en guirlandes rouges sur les toits et les façades, et du festival de la harissa. Le vendredi est le jour idéal pour le marché. Au printemps, les vergers du Cap Bon sont en fleurs et les journées sont douces. L’été, les familles de Tunis viennent pour la plage et la ville s’anime surtout le soir.',
          // TODO: à vérifier — dates du festival de la harissa, horaires du musée et du site de Neapolis.
        ],
        how: [
          'Nabeul se trouve à environ une heure de route au sud-est de Tunis, et à une quinzaine de minutes de Hammamet. La ville est le terminus de la ligne de train Tunis–Nabeul et elle est bien reliée par les louages. Elle se combine facilement avec Hammamet, Kélibia ou une boucle autour du Cap Bon. En ville, le marché, les ateliers et la plage se rejoignent à pied ou en quelques minutes de taxi.',
          // TODO: à vérifier — fréquence des trains Tunis–Nabeul et durée du trajet.
        ],
        tip: [
          'Achetez votre harissa au marché, à un producteur qui vous la fait goûter, plutôt qu’en boutique de souvenirs : demandez-la « arbi », faite maison. Et arrivez tôt le vendredi, avant la chaleur et la foule de midi. Si un potier vous invite dans son atelier, vous pouvez regarder et poser des questions sans rien acheter.',
        ],
      },
    ),
    en: guide(
      'en',
      'Visiting Nabeul: harissa, pottery and the Friday market',
      'Nabeul, home of harissa and painted pottery on Cap Bon: the Friday market, workshops and the Neapolis site. History, best season, getting there and a local tip.',
      {
        intro: [
          'Nabeul stands on the site of ancient Neapolis, a Greek and then Roman town known for its garum, the fermented fish sauce shipped all over the Mediterranean. Today it is the main town of Cap Bon, a region of orchards, chilli fields and craft workshops, where life still follows the harvests.',
          'Across Tunisia the town is famous for two things: hand-painted pottery and harissa. Cap Bon chillies are dried in the sun here, ground and mixed with garlic and spices. Tunisian harissa was added to UNESCO’s list of Intangible Cultural Heritage in 2022.',
        ],
        see: [
          'Start with the potters’ and ceramic painters’ workshops, where you can watch pieces being thrown, painted and fired before they end up in homes all over the country. The shops on the main avenue sell plates, couscous dishes and decorated tiles, but the workshops on the side streets are often more rewarding. A few kilometres away, Dar Chaabane is the stone carvers’ village, where the door frames and columns of Cap Bon houses are made.',
          'The Neapolis archaeological site by the sea has kept the salting tanks where garum was made, and the Nabeul archaeological museum shows mosaics from the area. On Fridays the big market draws families from all over Cap Bon: spices, chillies, pottery, basketwork and farm produce.',
        ],
        when: [
          'Autumn is the best season: it is chilli harvest time, when red strings of peppers dry on roofs and walls, and the time of the harissa festival. Friday is the day for the market. In spring, the Cap Bon orchards are in blossom and the days are mild. Summer brings beach crowds from Tunis, and the town is at its liveliest in the evening.',
          // TODO: à vérifier — harissa festival dates, museum and Neapolis opening hours.
        ],
        how: [
          'Nabeul is about an hour’s drive south-east of Tunis and some fifteen minutes from Hammamet. The town is the end of the Tunis–Nabeul railway line and well served by louages, the shared taxis. It combines easily with Hammamet, Kelibia or a loop around Cap Bon. In town, the market, the workshops and the beach are all within walking distance or a short taxi ride.',
          // TODO: à vérifier — Tunis–Nabeul train frequency and journey time.
        ],
        tip: [
          'Buy your harissa at the market from a producer who lets you taste it, rather than in a souvenir shop: ask for it "arbi", homemade. And get there early on Friday, before the midday heat and crowds. If a potter invites you into the workshop, it is fine to watch and ask questions before buying anything.',
        ],
      },
    ),
  },
};

export function placeGuide(id: string, lang: Locale): PlaceGuide | undefined {
  return GUIDES[id]?.[lang];
}

/** Places with a long guide, to bump their date in data/contentDates.ts. */
export const GUIDE_IDS = Object.keys(GUIDES);
