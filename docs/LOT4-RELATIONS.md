# Lot 4 · Registre des relations et de leurs preuves

Version 1, 17 novembre 2026. Base : `main` au commit `de63e15`. Les types d'entités sont dans [`LOT4-ENTITIES.md`](LOT4-ENTITIES.md).

Ce registre a trois parties :
1. le **vocabulaire** des relations (types, sens, entités concernées) ;
2. les **règles de preuve et de publication** ;
3. le **statut des 75 relations candidates** issues des Prompts 2B et 2C, avec leurs sources.

Les identifiants `rel-01` à `rel-75` sont ceux du registre 2B. Ils ne changent jamais.

## 1. Deux familles de relations

- **Relations structurelles.** Ce sont des données que Tunisia Go possède et maintient : étapes d'un road trip, catégorie, gouvernorat d'un lieu, hébergement proche, cahier pratique. Elles décrivent le site, pas l'histoire. Elles n'ont pas besoin d'une source externe, mais elles passent par le validateur automatique (architecture § 7).
- **Relations documentaires.** Ce sont des affirmations sur le monde : un statut, une date, un fondateur, une dynastie, un tournage. Elles exigent une source lue, et elles ne sont publiées que si leur statut est « établie ».

Ne sont **jamais** des relations : une proximité géographique, la présence d'un mot dans un texte, une déduction logique ou une hypothèse.

## 2. Vocabulaire

### 2.1 Relations structurelles (existantes, rendues explicites)

| Type | Sens | De → vers | Cardinalité | Donnée actuelle | Publication |
|---|---|---|---|---|---|
| `inGovernorate` | le lieu est dans le gouvernorat | `place` → `gov` | n → 1 | `Place.region` (texte), remplacé par une clé | public (`containedInPlace`) |
| `inCountry` | le gouvernorat est dans le pays | `gov` → `country` | n → 1 | implicite (`addressCountry: TN`) | public |
| `inArea` | le gouvernorat appartient à une zone éditoriale | `gov` → `area` | n → n (une zone par découpage) | `REGION_OF_GOVERNORATE`, `GUIDE_BY_PLACE`, `ZONE_PLACES`, `stays.region` | assistant |
| `hasStop` | le road trip passe par le lieu (ordonné) | `trip` → `place` | 1 → n | `Itinerary.stops` (109 étapes) | public (`TouristTrip.itinerary`) |
| `inCategory` | catégorie d'affichage | `place` → `CategoryId` | n → 1 | `Place.category` | public (filtre) |
| `hasGuide` | guide long ou cahier pratique | `place` → `Article` | 1 → 0..1 | `placeGuides`, `GUIDE_BY_PLACE` | public (lien existant) |
| `heldAt` | l'édition a lieu au lieu | `event` → `place` | n → 1 | `events.place_id`, `TunisiaEvent.placeId` | public (`Event.location` par `@id`) |
| `editionOf` | l'édition appartient au festival | `event` → `festival` | n → 1 | nouveau, déduit de l'id actuel (même festival) | public |
| `nearStay` | hébergement à environ 30 minutes | `actor` (stay) → `place` | n → n | `Stay.near` | assistant (estimation, jamais en JSON-LD) |
| `servesArea` | agence agréée pour une région ONTT | `actor` (agency) → `area` | n → 1 | `agencies.region` | assistant |
| `operatesAt` | un professionnel publié propose ses services au lieu | `actor` → `place` | n → n | `pro_listings.place_id` (0 ligne) | public seulement avec consentement |
| `containsHeritage` | l'élément patrimonial est dans la fiche | `place` → `heritage` | 1 → n | nouveau | public (`containsPlace`) |

### 2.2 Relations documentaires

| Type | Sens | De → vers | Qualificatifs | Preuve exigée | Publication si « établie » |
|---|---|---|---|---|---|
| `hasDesignation` | a tel statut officiel | `place` / `heritage` → `designation` | année, n° officiel | page officielle de l'organisme (UNESCO, Ramsar, texte de création) | `subjectOf` ou `sameAs` (architecture § 6) |
| `componentOf` | est une composante officielle d'un bien | `place` / `heritage` → `designation` | n° de composante | liste officielle des composantes. **Jamais** la proximité. | oui |
| `partOf` | sous-lieu d'un lieu | `place` → `place` | — | description institutionnelle ou plan, et validation de Mehdi (OPEN-ISSUES § 3) | `containedInPlace` |
| `ichPracticedIn` | l'élément immatériel est pratiqué à… | `ich` → `place` / `country` | — | la fiche UNESCO nomme le lieu | texte et assistant |
| `builtBy` | construit ou commandé par | `place` / `heritage` → `person` / `polity` | date, rôle (fondation, ajout) | institutionnelle ou académique | `founder` (si `person`), texte |
| `foundedBy` | fondé par | `place` → `person` / `polity` | date | institutionnelle ou académique | texte, assistant |
| `associatedPolity` | témoigne de telle entité politique ou culturelle | `place` / `heritage` → `polity` | rôle (ville numide, capitale…), dates | institutionnelle ou académique, avec le rôle précis (principe 4 : pas de « romain » vague) | texte, assistant |
| `affectedBy` | a été touché par l'événement | `place` → `hevent` | date | institutionnelle ou académique | texte, assistant |
| `occurredAt` | l'événement s'est déroulé à | `hevent` → `place` | date | institutionnelle ou académique | texte, assistant |
| `associatedPerson` | personne liée au lieu | `place` → `person` | rôle | institutionnelle ou académique. Les traditions restent du texte. | texte |
| `namedAfter` | porte le nom de | `place` → `person` | — | source historique | texte |
| `birthplaceOf` | lieu de naissance ou de sépulture de | `place` → `person` | rôle | source biographique de référence | texte |
| `suppliesWater` | l'ouvrage alimente | `heritage` → `place` / `heritage` | — | académique ou liste indicative | texte, assistant |
| `protectedBy` | protégé par un acte juridique | `place` → texte de l'acte | date | texte de l'acte (JORT, décret) | texte |
| `sameAs` | identité entre deux entités ou avec une ressource externe | toute entité → URL | — | vérification manuelle, une par une | `sameAs` |
| `filmingLocationOf` | lieu de tournage | `place` → `work` | scène, année | source de production. Les passionnés ne suffisent pas à publier. | jamais en JSON-LD ; texte avec « selon… » |

Les qualificatifs (date, rôle, n° officiel) sont portés **par la relation**, avec leur propre source. Une date confirmée ne valide pas le rôle, et inversement.

## 3. Statuts, publication et état des 75 relations

### 3.1 Statuts et règles de publication

| Statut | Définition | Publication |
|---|---|---|
| **établie** | Une source institutionnelle ou académique lue dit exactement cela. | Pages, JSON-LD, assistant, `llms.txt`. |
| **partielle** | Une partie seulement est établie (le statut sans l'année, le bien sans la composante). | Seulement la partie établie. Le reste attend. |
| **secondaire** | Seule une source secondaire nommée l'affirme (presse, passionnés). | Texte avec la formule « selon… », jamais en données structurées. |
| **attribuée** | Tradition ou légende, présentée comme telle par le texte ou par une décision de Mehdi. | Texte avec « selon la tradition », jamais comme relation. |
| **non vérifiée** | Aucune source lue. | Rien. La relation reste candidate. |
| **contredite** | Une source lue dit autre chose. | Rien. Seule la version sourcée peut devenir une relation. |
| **contestée / réfutée** | Une source secondaire conteste, ou le Lot 2 l'a retirée. | Jamais. Elle reste au registre interne pour ne pas être recréée (principe 5). |

Un statut ne monte que par une **nouvelle source lue**, ajoutée au registre avec sa date. Il ne monte jamais parce qu'une fiche corrigée dit la même chose.

### 3.2 Statut des 75 relations candidates

En résumé :
- établies : 25 ;
- partielles : 9 ;
- non vérifiées : 20 ;
- secondaires : 6 ;
- attribuées : 7 ;
- contredites : 6 ;
- contestée : 1 ;
- réfutée : 1.

**24 relations sont publiables telles quelles**, et les relations partielles le sont pour leur partie établie. Les autres restent au registre, sans bloquer l'architecture : une relation incertaine n'est simplement pas publiée.


| Id | Sujet | Type | Objet | Statut | Sources | Réserve | Publication |
|---|---|---|---|---|---|---|---|
| `rel-01` | Carthage (fiche) | `hasDesignation` | Site archéologique de Carthage (n° 37, 1979) | **établie** | L-U37, L-AWH | — | oui |
| `rel-02` | Médina de Tunis (fiche) | `hasDesignation` | Médina de Tunis (n° 36, 1979) | **établie** | L-U36, L-AWH | — | oui |
| `rel-03` | Amphithéâtre d’El Jem (fiche) | `hasDesignation` | Amphithéâtre d’El Jem (n° 38, 1979) | **établie** | L-U38, L-AWH | — | oui |
| `rel-04` | Ichkeul (fiche) | `hasDesignation` | Parc national de l’Ichkeul (n° 8) | **partielle** | S17, S16, L-U8 | Le bien n° 8 est bien Ichkeul ; inscrit sur la Liste en péril en 1996, retiré en 2006 [S17]. Ramsar 213 le désigne aussi comme bien du patrimoine mondial [S16]. L’année d’inscription n’est affichée ni par S17 ni par S16. | partie confirmée seulement |
| `rel-05` | Kerkouane (fiche) | `hasDesignation` | Cité punique de Kerkouane et sa nécropole (n° 332, 1985, extension 1986) | **établie** | L-U332 | — | oui |
| `rel-06` | Kairouan (fiche) | `hasDesignation` | Kairouan (n° 499, 1988) | **établie** | S01, L-AWH | Bien « Kairouan », critères (i), (ii), (iii), (v), (vi) ; « most ancient Arabo-Muslim base of the Maghreb (670 AD) » [S01]. L’année 1988 n’est pas affichée sur la page UNESCO ; elle vient de la page AMVPPC patrimoine mondial lue au Lot 3. | oui |
| `rel-07` | Médina de Sousse (fiche) | `hasDesignation` | Médina de Sousse (n° 498, 1988) | **établie** | S02, L-AWH | Bien « Medina of Sousse », critères (iii), (iv), (v) [S02]. L’année 1988 n’est pas affichée sur la page UNESCO ; elle vient de la page AMVPPC lue au Lot 3. | oui |
| `rel-08` | Dougga (fiche) | `hasDesignation` | Dougga / Thugga (n° 794, 1997) | **établie** | L-U794, L-AWH | — | oui |
| `rel-09` | Djerba (fiche) | `hasDesignation` | Djerba : témoignage d’un mode d’occupation d’un territoire insulaire (n° 1640) | **établie** | S03, L-U1640 | Nom officiel, critère (v), « seven sites » et « twenty-four monuments » [S03]. L’année 2023 n’est pas affichée sur la page lue. | oui |
| `rel-10` | El Ghriba, Guellala, Djerbahood… | `componentOf` | bien UNESCO n° 1640 | **partielle** | S03 | S03 décrit deux sites urbains comprenant « parts of the historic centre of Houmt-Souk » et « the remains of a residential neighbourhood in Hara Sghira », et cite « the La Ghriba synagogue » parmi les « major architectural elements of the property » (formulation indirecte). Guellala, Djerbahood et Borj El Kebir ne sont pas cités. La liste officielle des 7 composantes (page « multiple locations ») est inaccessible (robots). L’équivalence Hara Sghira = Erriadh vient de nos fiches, pas de S03. | non pour la relation de composante ; Houmt Souk et Hara Sghira seulement dans le texte |
| `rel-11` | Sidi Bou Saïd (fiche) | `hasDesignation` | Village de Sidi Bou Saïd (n° 1769, 2026) | **partielle** | L-U1769 | — | partie confirmée seulement |
| `rel-12` | Souk El Attarine ; souks de Kairouan | `partOf` | Médina de Tunis ; Kairouan (biens UNESCO) | **non vérifiée** | S01 | S01 cite un décret de 1921 protégeant les souks de Kairouan : c’est une mesure de protection, pas une preuve que la fiche « kairouan-souks » est dans le périmètre. Rien sur le souk El Attarine. | non |
| `rel-13` | Table de Jugurtha | `hasDesignation` | UNESCO liste indicative n° 6278 | **établie** | L-T6278 | non, mais ne jamais l’écrire « inscrit » | oui |
| `rel-14` | Chott el Jérid | `hasDesignation` | UNESCO liste indicative n° 5385 | **établie** | L-T5385 | non, mais ne jamais l’écrire « inscrit » | oui |
| `rel-15` | Bou Hedma | `hasDesignation` | UNESCO liste indicative (depuis 2008 selon la fiche) | **établie** | S07 | Liste indicative n° 5384, « Parc National de Bouhedma », catégorie naturelle, soumis le 28/05/2008 par le ministère de l’Environnement ; gouvernorats de Sidi Bouzid et de Gafsa [S07]. | oui |
| `rel-16` | Temple des Eaux et aqueduc Zaghouan-Carthage | `hasDesignation` | complexe hydraulique romain de Zaghouan-Carthage | **établie** | S08 | Liste indicative n° 5685, catégorie culturelle, soumis le 17/02/2012 ; nymphée « temple des eaux », aqueduc de 132 km, construit au début du IIe s., citernes de la Maalga, thermes d’Antonin [S08]. | oui |
| `rel-17` | Harissa | `ichPracticedIn` | Liste représentative du PCI | **partielle** | S04 | Élément confirmé : inscrit en 2022 (17.COM 7.b.30) sur la Liste représentative, État : Tunisie [S04]. Le lien avec Nabeul n’est pas confirmé : la fiche UNESCO ne cite ni Nabeul ni le Cap Bon et présente la harissa comme une pratique de la société tunisienne. | oui pour harissa → Tunisie ; non pour Nabeul |
| `rel-18` | Savoir-faire des potières de Sejnane | `ichPracticedIn` | Liste représentative du PCI | **établie** | S05 | Inscrit en 2018 (13.COM 10.b.38), État : Tunisie ; le nom de l’élément contient Sejnane [S05]. | oui |
| `rel-19` | Charfia | `ichPracticedIn` | Liste représentative du PCI | **établie** | S06 | Inscrit en 2020 (15.COM 8.b.9), État : Tunisie ; « Charfia fishing in the Kerkennah Islands » [S06]. La fiche du site ne donne pas l’année. | oui |
| `rel-20` | Sebkhet Kelbia | `hasDesignation` | Convention de Ramsar | **établie** | L-RAM | — | oui |
| `rel-21` | Ichkeul | `hasDesignation` | Programme MAB de l’UNESCO | **partielle** | S16, S18 | Ramsar 213 classe Ichkeul « UNESCO Biosphere Reserve » [S16]. L’année et la fiche MAB ne sont pas lues : le répertoire MAB archivé a renvoyé une limite de requêtes (inaccessible). Le support S18 ne cite que Bouhedma comme réserve de biosphère (1977), ce qui ne contredit pas Ichkeul mais ne le confirme pas non plus. | partie confirmée seulement |
| `rel-22` | Bou Hedma, Jebil, Bou Kornine, El Feidja, Ichkeul | `hasDesignation` | statut de parc national | **partielle** | S07, S18, S19, S16 | Bouhedma : parc national, créé en 1980 [S07] ; décret n° 80-1606 du 18/12/1980 cité par S18. Jbil : créé en 1994, 150 000 ha, Kébili [S19] ; décret n° 94-2210 du 24/10/1994 cité par S18 ; la protection « dès 1984 » de la fiche n’est confirmée par aucune source. Ichkeul : statut de parc national [S16], sans date. Bou Kornine (1987) et El Feidja (1990) : aucune date dans les sources lues. | partie confirmée seulement |
| `rel-23` | Ribat de Monastir | `builtBy` | Harthama ibn A’yan (gouverneur abbasside), 795-796 | **établie** | L-ARMON | — | oui |
| `rel-24` | Ribat de Monastir | `(attribut : superlatif)` | superlatif | **contredite** | L-ARMON | oui : superlatif non soutenu | non (registre interne) |
| `rel-25` | Ribat de Sousse | `builtBy` | Ziyadat Allah Ier (Aghlabides) | **établie** | S02, L-ARSOUSSE, L-VST | Renforcée : S02 confirme l’« adjonction de 821, à la fois minaret et vigie » ; Ziyadat Allah n’y est pas nommé (il l’est dans les sources du Lot 3·1a). | oui |
| `rel-26` | Grande Mosquée de Kairouan | `(attribut : date)` | 50 H / 670 ; forme définitive 836-841 (Aghlabides) | **établie** | S01, L-AGMK | Renforcée : S01 donne 670 pour la fondation de Kairouan et décrit la Grande Mosquée comme « a model for several other Maghreban mosques ». | oui |
| `rel-27` | Kairouan / Grande Mosquée | `foundedBy` | Oqba ibn Nafi | **partielle** | S01, L-AGMK | S01 ne nomme pas le fondateur de Kairouan ni de la Grande Mosquée. Statut inchangé. | partie confirmée seulement |
| `rel-28` | Mosquée Zitouna | `(attribut : date)` | VIIIe s. (ancien texte, avant PR 135) | **contredite** | L-AZIT | oui : l’ancienne date « VIIIe s. » ne doit pas devenir une relation ; relation à retenir : vers 699, reconstruite en 728-729 | non (registre interne) |
| `rel-29` | Médina de Tunis | `associatedPolity` | Almohades et Hafsides (XIIe-XVIe s.) | **établie** | L-U36 | — | oui |
| `rel-30` | Souk El Attarine | `(attribut : date)` | date | **non vérifiée** | — | oui, jusqu’à source | non |
| `rel-31` | Amphithéâtre d’El Jem | `(attribut : date)` | 238 (époque romaine) | **établie** | L-U38, L-AELJEM | — | oui |
| `rel-32` | Amphithéâtre d’El Jem | `(attribut : superlatif)` | superlatif | **contredite** | — | oui : superlatif | non (registre interne) |
| `rel-33` | Dougga | `associatedPolity` | Numides | **établie** | L-ADOUGGA | — | oui |
| `rel-34` | Inscription bilingue de Dougga | `(texte : objet de collection)` | British Museum | **non vérifiée** | — | non, après source muséale | non |
| `rel-35` | Bulla Regia | `associatedPolity` | Numides | **contredite** | L-ABULLA | oui | non (registre interne) |
| `rel-36` | Kerkouane | `affectedBy` | la première guerre punique (vers 256-250 av. J.-C.) | **établie** | L-U332, L-AKERK, L-FG | — | oui |
| `rel-37` | Kerkouane | `(attribut : date)` | mission INP-UNISS | **partielle** | L-FG | non, après source pour 1952 | partie confirmée seulement |
| `rel-38` | Carthage | `affectedBy` | Rome | **établie** | L-U37 | — | oui |
| `rel-39` | Carthage | `foundedBy` | Elyssa | **attribuée (tradition ou légende)** | L-U37 | oui : légende | non en relation ; texte avec « selon la tradition » seulement |
| `rel-40` | Aqueduc Zaghouan-Carthage | `suppliesWater` | Carthage (thermes d’Antonin) | **établie** | S08, L-ABATHS, L-HYD | Renforcée : S08 décrit l’aqueduc de 132 km, du début du IIe s., reliant le nymphée de Zaghouan aux citernes de la Maalga et aux thermes d’Antonin. | oui |
| `rel-41` | Thermes d’Antonin | `componentOf` | Site archéologique de Carthage | **partielle** | S08, S14, S15, L-U37, L-ABATHS | Aucune page lue ne dit que les thermes d’Antonin sont une composante du bien n° 37. S08 les rattache au complexe hydraulique de la liste indicative, ce qui est une autre relation. Les pages AMVPPC du quartier Magon [S14] et du parc des villas romaines [S15] ne mentionnent pas l’UNESCO. | partie confirmée seulement |
| `rel-42` | Musée du Bardo | `(texte : objet de collection)` | Mosaïque de Virgile | **établie** | L-ABARDO, L-MCR | non, mais la relation est Bardo → mosaïque, pas Bardo → Virgile | texte seulement (les objets ne sont pas des entités) |
| `rel-43` | Musée du Bardo | `(texte : objet de collection)` | Lion de Salakta | **non vérifiée** | — | non, après source muséale | non |
| `rel-44` | Musée de Guellala | `sameAs (identité)` | Musée du patrimoine traditionnel de Djerba (AMVPPC) | **contredite** | S13 | S13 situe le musée du patrimoine traditionnel de Djerba à Houmt Souk (zaouïa de Sidi Zitouni, nouveau bâtiment inauguré en décembre 2008) et ne cite pas Guellala. Ce n’est donc pas le musée de la fiche « guellala ». Le musée de Guellala reste sans source institutionnelle. | non (registre interne) |
| `rel-45` | Mahdia | `foundedBy` | Al-Mahdi (Fatimides) | **non vérifiée** | — | non, après source | non |
| `rel-46` | Fort de La Goulette | `builtBy` | Charles Quint / Ottomans | **non vérifiée** | — | non, après source | non |
| `rel-47` | Fort de Bizerte | `builtBy` | Espagnols ou pacha ottoman | **non vérifiée** | — | oui : contradiction interne | non |
| `rel-48` | Borj El Kebir (Houmt Souk) | `sameAs (identité)` | Borj Ghazi Mustapha (AMVPPC) | **non vérifiée** | — | oui, alias non confirmé [H] | non |
| `rel-49` | Tabarka | `associatedPolity` | les Génois (Lomellini) | **non vérifiée** | — | non, après source | non |
| `rel-50` | Testour | `foundedBy` | les Andalous / Morisques | **non vérifiée** | — | non, après source | non |
| `rel-51` | Sidi Bou Saïd | `protectedBy (acte juridique)` | le décret beylical de 1915 | **secondaire** | L-AFRIK | non, après texte du décret ou dossier 1769 | non en données structurées ; texte avec « selon… » seulement |
| `rel-52` | Sidi Bou Saïd | `namedAfter` | Abou Saïd el-Béji (saint, XIIIe s.) | **non vérifiée** | — | non, après source ; attention à l’homonymie saint / village | non |
| `rel-53` | Monastir | `birthplaceOf` | Habib Bourguiba | **non vérifiée** | — | non, après source ; la mention de Sfax est une adresse | non |
| `rel-54` | Tozeur | `birthplaceOf` | Abou el Kacem Chebbi | **non vérifiée** | — | non, après source biographique | non |
| `rel-55` | Tozeur | `associatedPerson` | Ibn Chabbat | **attribuée (tradition ou légende)** | L-WBC | oui : tradition | non en relation ; texte avec « selon la tradition » seulement |
| `rel-56` | Table de Jugurtha | `associatedPerson` | Jugurtha (roi numide) | **attribuée (tradition ou légende)** | L-T6278 | oui : tradition ; homonymie personne / lieu | non en relation ; texte avec « selon la tradition » seulement |
| `rel-57` | Table de Jugurtha | `namedAfter` | Senan, qui donne son nom à la ville | **contredite** | L-T6278 | oui | non (registre interne) |
| `rel-58` | El Jem | `associatedPerson` | la Kahena | **attribuée (tradition ou légende)** | — | oui : tradition ; le camping « El Kahena » est un nom commercial | non en relation ; texte avec « selon la tradition » seulement |
| `rel-59` | Kerkennah | `associatedPerson` | Hannibal (195 av. J.-C.) | **attribuée (tradition ou légende)** | — | oui : formulation au conditionnel | non en relation ; texte avec « selon la tradition » seulement |
| `rel-60` | Lamta (Leptiminus) | `associatedPerson` | Hannibal revenant d’Italie | **non vérifiée** | — | non, après source antique ou académique | non |
| `rel-61` | El Ghriba | `(texte : légende)` | tradition | **attribuée (tradition ou légende)** | — | oui : légende | non en relation ; texte avec « selon la tradition » seulement |
| `rel-62` | Chenini | `(texte : légende)` | légende des Sept Dormants | **attribuée (tradition ou légende)** | — | oui pour la légende ; la mosquée peut devenir un monument après source | non en relation ; texte avec « selon la tradition » seulement |
| `rel-63` | El Jem | `occurredAt` | Révolte de Thysdrus | **non vérifiée** | — | non, après source historique | non |
| `rel-64` | Sbeitla | `occurredAt` | Conquête arabe | **non vérifiée** | — | non pour la bataille ; oui pour le superlatif | non |
| `rel-65` | Mareth | `occurredAt` | Campagne de Tunisie | **non vérifiée** | — | non, après source historique | non |
| `rel-66` | Chebika, Tamerza, Midès | `affectedBy` | les crues de 1969 | **non vérifiée** | — | oui, jusqu’à source | non |
| `rel-67` | El Jem | `filmingLocationOf` | Gladiator | **réfutée** | L-MLG | oui : relation réfutée, à garder pour ne pas la recréer | non (registre interne, principe 5) |
| `rel-68` | Mos Espa (décor) | `filmingLocationOf` | La Menace fantôme (1997) | **secondaire** | — | non, après source officielle | non en données structurées ; texte avec « selon… » seulement |
| `rel-69` | Ksar Ouled Soltane | `filmingLocationOf` | La Menace fantôme | **contestée** | L-GAL | oui : repérage, pas tournage | non |
| `rel-70` | Ksar Hadada | `filmingLocationOf` | La Menace fantôme (quartier des esclaves) | **secondaire** | L-SWL | non, après source officielle | non en données structurées ; texte avec « selon… » seulement |
| `rel-71` | Chott el Jérid ; Matmata (hôtel Sidi Driss) | `filmingLocationOf` | Star Wars (1977) | **secondaire** | — | non, après source ; préciser extérieur et intérieur | non en données structurées ; texte avec « selon… » seulement |
| `rel-72` | Ribat de Monastir | `filmingLocationOf` | La Vie de Brian | **secondaire** | L-MLB | non pour le tournage ; « many films » n’est plus dans le texte de main | non en données structurées ; texte avec « selon… » seulement |
| `rel-73` | Tamerza, Midès | `filmingLocationOf` | Le Patient anglais, Fort Saganne | **non vérifiée** | — | oui : tournage approximatif | non |
| `rel-74` | Toujane | `filmingLocationOf` | La Folle de Toujane (1974) | **non vérifiée** | — | non, après source filmographique | non |
| `rel-75` | Tataouine ; Chenini | `(texte : nom de fiction)` | Tatooine ; lune Chenini (fiction) | **secondaire** | L-WOOK | oui : inspiration de nom, pas tournage | non en données structurées ; texte avec « selon… » seulement |

## 4. Registre des sources

Chaque relation cite un ou plusieurs codes de ce registre. La date de consultation est celle du lot qui a lu la source. Les registres d'origine sont `docs/GEO-FACTUAL-VERIFICATION.md` et `docs/editorial-log/` pour les Lots 2 et 3, et `seo/lot4/lot4-2c-verification-institutionnelle.md` (dossier projet) pour le Prompt 2C. Aucune source n'a été ajoutée pendant la finalisation.

### 4.1 Sources lues aux Lots 2 et 3 (novembre 2026)

| Code | Source (lot de lecture) |
|---|---|
| `L-U37` | UNESCO n° 37, https://whc.unesco.org/en/list/37/ (lu, Lot 3) |
| `L-U36` | UNESCO n° 36, https://whc.unesco.org/en/list/36/ (lu, Lot 3) |
| `L-U38` | UNESCO n° 38, https://whc.unesco.org/en/list/38/ (lu, Lots 2A et 3·1b) |
| `L-U8` | UNESCO n° 8, https://whc.unesco.org/en/list/8/ (lu, Lot 3) |
| `L-U332` | UNESCO n° 332, https://whc.unesco.org/en/list/332/ (lu, Lot 3·1a) |
| `L-U794` | UNESCO n° 794, https://whc.unesco.org/en/list/794/ (lu, Lot 3·1a) |
| `L-U1640` | UNESCO n° 1640, https://whc.unesco.org/en/list/1640/ (lu, Lot 3) |
| `L-U1769` | UNESCO n° 1769, https://whc.unesco.org/en/list/1769/ et décision 48 COM 8B.15 (pages non lisibles depuis le bac à sable ; inscription vérifiée par Mehdi, Lot 3) |
| `L-AWH` | AMVPPC, Tunisia world heritage, https://www.patrimoinedetunisie.com.tn/en/tc/tunisia-world-heritage/ (lu, Lot 3) |
| `L-T6278` | UNESCO liste indicative n° 6278, https://whc.unesco.org/fr/listesindicatives/6278/ (lu, Lots 2A et 3·1b) |
| `L-T5385` | UNESCO liste indicative n° 5385, https://whc.unesco.org/en/tentativelists/5385/ (lu, Lot 3·1b) |
| `L-RAM` | Ramsar, fiche 1710, https://rsis.ramsar.org/ris/1710 (lu, Lot 2A) |
| `L-ABATHS` | AMVPPC, thermes d’Antonin, https://www.patrimoinedetunisie.com.tn/en/monuments/the-antoninian-baths/overview/ (lu, Lot 3·1a) |
| `L-ADOUGGA` | AMVPPC, Dougga, https://www.patrimoinedetunisie.com.tn/en/sites/the-archaeological-site-of-dougga/ (lu, Lot 3) |
| `L-ABARDO` | AMVPPC, musée du Bardo, https://www.patrimoinedetunisie.com.tn/en/museums/the-national-bardo-museum/overview/ (lu, Lot 3·1a) |
| `L-AKERK` | AMVPPC, Kerkouane, https://www.patrimoinedetunisie.com.tn/en/sites/kerkouane/ (lu, Lot 3) |
| `L-ARSOUSSE` | AMVPPC, ribat de Sousse, https://www.patrimoinedetunisie.com.tn/en/monuments/ribat-of-sousse/overview/ (lu, Lot 3·1a) |
| `L-ATHUB` | AMVPPC, Thuburbo Maius, https://www.patrimoinedetunisie.com.tn/en/sites/thuburbo-maius/ (lu, Lot 3·1a) |
| `L-ARMON` | AMVPPC, ribat de Monastir, https://www.patrimoinedetunisie.com.tn/en/monuments/ribat-of-monastir/ (lu, Lot 2A) |
| `L-AZIT` | AMVPPC, mosquée Zitouna, https://www.patrimoinedetunisie.com.tn/en/monuments/az-zaytuna-mosque/overview/ (lu, Lot 3·1b) |
| `L-AELJEM` | AMVPPC, amphithéâtre de Thysdrus, https://www.patrimoinedetunisie.com.tn/en/monuments/the-amphitheatre-of-thysdrus-el-jem/ (lu, Lot 2A) |
| `L-AGMK` | AMVPPC, Grande Mosquée de Kairouan, https://www.patrimoinedetunisie.com.tn/en/monuments/the-great-mosque-of-kairouan/overview/ (lu, Lot 3) |
| `L-ABULLA` | AMVPPC, Bulla Regia, https://www.patrimoinedetunisie.com.tn/en/sites/the-archaeological-site-of-bulla-regia/ (lu, Lots 3 et 3·1b) |
| `L-HYD` | Projet Hydria, Water supply in Roman Carthage, https://www.hydriaproject.info/en/case-studies/water-supply-in-roman-carthage/waterworks (académique, lu, Lots 2A et 3·1a) |
| `L-VST` | J.-P. Van Staëvel, Religions 14(8), 1051, 2023, https://www.mdpi.com/2077-1444/14/8/1051 (académique, lu, Lot 3·1a) |
| `L-FG` | Fantar et Guirguis, Kerkouane 2022-2023, CaSteR, 2024 (académique, lu, Lot 3·1a) |
| `L-MCR` | Museo della Civiltà Romana, mosaïque de Virgile, https://museociviltaromana.it/en/opera/mosaico-con-ritratto-del-poeta-virgilio-iii-secolo-dc?tema=1 (lu, Lot 2A) |
| `L-GAL` | galaxytours.com, Ksar Ouled Soltane: Debunking the Myth (site de passionnés, lu, Lot 2A) |
| `L-SWL` | starwarslocations.com, Ksar Hadada (site de passionnés, lu, Lots 2A et 3·1a) |
| `L-MLB` | movie-locations.com, Life of Brian (secondaire, lu, Lot 3·1b) |
| `L-MLG` | movie-locations.com, Gladiator (secondaire, lu, Lot 2A) |
| `L-WBC` | H. Bourial, « Ibn Chabbat, maître des eaux du Djérid », webdo.tn, 18/02/2016 (presse, lu, Lot 3·1b) |
| `L-WOOK` | Wookieepedia, Chenini (encyclopédie de fans, lu, Lot 2A) |
| `L-AFRIK` | afrik.com, Sidi Bou Saïd à l’UNESCO (média, lu, Lot 2A) |
| `L-ECO` | L’Economiste Maghrébin, 46e session du Festival du Sahara, 20/12/2013 (presse, lu, Lot 3·1b) |

### 4.2 Sources lues au Prompt 2C (17/11/2026)

| Code | Source |
|---|---|
| `S01` | UNESCO, Centre du patrimoine mondial, « Kairouan », https://whc.unesco.org/en/list/499/ (lu le 17/11/2026) |
| `S02` | UNESCO, Centre du patrimoine mondial, « Medina of Sousse », https://whc.unesco.org/en/list/498/ et /fr/list/498/ (lus le 17/11/2026) |
| `S03` | UNESCO, Centre du patrimoine mondial, « Djerba: Testimony to a settlement pattern in an island territory », https://whc.unesco.org/en/list/1640/ (lu le 17/11/2026) |
| `S04` | UNESCO PCI, « Harissa, knowledge, skills and culinary and social practices », décision 17.COM 7.b.30, https://ich.unesco.org/en/RL/harissa-knowledge-skills-and-culinary-and-social-practices-01710 (lu le 17/11/2026) |
| `S05` | UNESCO PCI, « Pottery skills of the women of Sejnane », décision 13.COM 10.b.38, https://ich.unesco.org/en/RL/pottery-skills-of-the-women-of-sejnane-01406 (lu le 17/11/2026) |
| `S06` | UNESCO PCI, « Charfia fishing in the Kerkennah Islands », décision 15.COM 8.b.9, https://ich.unesco.org/en/RL/01566 (lu le 17/11/2026) |
| `S07` | UNESCO, liste indicative n° 5384, « Parc National de Bouhedma », soumis le 28/05/2008, https://whc.unesco.org/en/tentativelists/5384/ (lu le 17/11/2026) |
| `S08` | UNESCO, liste indicative n° 5685, « Le complexe hydraulique romain de Zaghouan-Carthage », soumis le 17/02/2012, https://whc.unesco.org/fr/listesindicatives/5685/ (lu le 17/11/2026) |
| `S09` | AMVPPC, « Basins of the Aghlabids (Kairouan) », https://www.patrimoinedetunisie.com.tn/en/monuments/basins-of-the-aghlabids-kairouan/ (lu le 17/11/2026) |
| `S10` | AMVPPC, « The Carthage Museum », https://www.patrimoinedetunisie.com.tn/en/museums/the-carthage-museum/ (lu le 17/11/2026) |
| `S11` | AMVPPC, « The El Jem Museum », https://patrimoinedetunisie.com.tn/en/museums/the-el-jem-museum (lu le 17/11/2026) |
| `S12` | AMVPPC, « Sousse Archaeology Museum », https://www.patrimoinedetunisie.com.tn/en/museums/sousse-archaeology-museum/ (lu le 17/11/2026) |
| `S13` | AMVPPC, « The Museum of the Traditional Heritage of Djerba », https://www.patrimoinedetunisie.com.tn/en/museums/the-museum-of-the-traditional-heritage-of-djerba/ (lu le 17/11/2026) |
| `S14` | AMVPPC, « The Magon Quarter », https://www.patrimoinedetunisie.com.tn/en/monuments/the-magon-quarter/ (lu le 17/11/2026) |
| `S15` | AMVPPC, « The Park of the Roman Villas », https://patrimoinedetunisie.com.tn/en/monuments/the-park-of-the-roman-villas (lu le 17/11/2026) |
| `S16` | Convention de Ramsar, fiche n° 213 « Ichkeul », désignation 24/11/1980, https://rsis.ramsar.org/ris/213 (lu le 17/11/2026) |
| `S17` | UNESCO, Centre du patrimoine mondial, « Ichkeul National Park », https://whc.unesco.org/en/list/8/ (relu le 17/11/2026) |
| `S18` | Ministère de l’Environnement (site environnement.gov.tn), support de formation « Les aires protégées » (Thème V), sans date ni auteur affichés, https://www.environnement.gov.tn/fileadmin/Bibliotheque/Projets_en_cours/Ecotourisme_en_Tunisie/Documentation_projet_ecotourisme/les_aires_proteges.pdf (lu le 17/11/2026) |
| `S19` | Ministère de l’Environnement et du Développement durable, DGEQV, « Évaluation des impacts environnementaux et sociaux… Parc National de Jbil », décembre 2015, https://www.environnement.gov.tn/fileadmin/Bibliotheque/Projets_en_cours/Ecotourisme_en_Tunisie/FES_jbil.pdf (lu le 17/11/2026) |

## 5. Limites connues (non bloquantes)

- **Années absentes des pages UNESCO lues** : Kairouan, Sousse, Djerba et Ichkeul. Les années 1988 viennent de l'AMVPPC. Celle de l'Ichkeul n'est pas sourcée, et la relation est publiée sans année.
- **Composantes du bien 1640 (Djerba)** : la page est refusée aux robots. Aucune relation `componentOf` n'est créée.
- **Relations sans source institutionnelle ou académique** : 20 relations, dont les dates de Mahdia, Sufetula, Thysdrus, La Goulette, Makthar et Le Kef, les biographies et les objets de musée. Elles restent non publiées. Ce n'est pas un chantier ouvert : on les rouvrira seulement si une page ou l'assistant en a besoin.
- **Tournages** : aucune source de production. Ils restent du texte prudent.
