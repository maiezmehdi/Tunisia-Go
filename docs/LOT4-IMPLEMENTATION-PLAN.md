# Lot 4 · Plan d'implémentation séquencé

Version 2, 17 novembre 2026. Ce plan met en œuvre [`LOT4-FINAL-ARCHITECTURE.md`](LOT4-FINAL-ARCHITECTURE.md) en **7 étapes**, plus **une étape facultative**. Chaque étape fait l'objet d'une PR séparée, relue avant fusion, comme pour les Lots 1 à 3. Aucune étape ne demande de migration Supabase ni de nouvelle infrastructure.

## État d'exécution (17 novembre 2026)

Les étapes 1 à 7 sont réalisées dans **une seule PR, la 136**, à la demande de Mehdi (un commit par étape). L'étape 8 (Wikidata) n'est pas faite, comme demandé. Les décisions prises sur les points ouverts sont dans [`LOT4-OPEN-ISSUES.md`](LOT4-OPEN-ISSUES.md) ; les écarts de fichiers avec ce plan sont dans l'architecture, § 11.

| Étape | Réalisé | Tests |
|---|---|---|
| 1 | `data/kg/*`, `lib/kg/*`, `npm run kg:check`, `npm run test:kg` | `tests/kg/graph.test.ts` |
| 2 | pages région, fil d'Ariane, agences et titres FR par gouvernorat | sitemap identique ; fil d'Ariane : seules les 4 fiches FR de Kébili changent |
| 3 | 75 relations du registre + rel-76 à rel-86 ; 35 publiées | aucune relation non établie dans une sortie publique |
| 4 | `@id` unique, `containedInPlace`, `containsPlace`, `subjectOf`, `@id` des road trips, événements reliés ; LinkedIn retiré | `tests/kg/site.test.ts` ; `/explore` : +1,4 % (FR) et +0,8 % (EN) de JSON-LD, hors photos |
| 5 | mention UNESCO lue depuis les statuts ; retirée des 2 souks | 10 fiches avec la mention ; règle 8 de `kg:check` |
| 6 | festivals, rattachement des éditions, `superEvent`, écarts Supabase/fichier | 0 écart sur la lecture du 17/11/2026 |
| 7 | zones de l'assistant sur 95 lieux, faits publiés dans le contexte de Gemini, `/llms.txt` généré | `tests/kg/assistant.test.ts` (10 questions de référence, sans appel réseau) |

## Règles pour toutes les étapes

- **Rien ne change dans les URL, les slugs, le design ou les textes des fiches**, sauf les corrections de défaut nommées explicitement (étape 2).
- **Tests de chaque PR :**
  - `npm run typecheck` ;
  - `npm run kg:check` (à partir de l'étape 1) ;
  - les tests unitaires de `lib/kg`.
  - Le build complet échoue dans le bac à sable cloud, parce que Wikimedia y est bloqué (audit § 8, point 7). On le valide donc sur le déploiement de prévisualisation Vercel de la PR.
- **Contrôle de non-régression des URL** : la liste des URL de `sitemap.xml`, avant et après, doit être identique (même nombre, mêmes chemins, FR et EN). Ce contrôle est un test.
- **Retour arrière** : chaque étape est réversible par un simple revert, car aucune donnée n'est migrée.

## Étape 1 · Fondations du graphe (aucun changement visible)

**Données existantes réutilisées :**
- les valeurs de `Place.region` ;
- `REGION_OF_GOVERNORATE`, `GUIDE_BY_PLACE`, `ZONE_PLACES` et les régions de `stays.ts`.

**Nouveautés :**
- `data/kg/types.ts`, `sources.ts` (les codes de LOT4-RELATIONS § 4), `governorates.ts` (24 entrées : clé, FR, EN, et l'arabe vide en attendant OPEN-ISSUES § 1) et `areas.ts` ;
- `lib/kg/index.ts` et `lib/kg/structural.ts` ;
- `scripts/kg-check.ts` et le script npm `kg:check` ;
- `tsx` en dépendance de développement, pour lancer le script et les tests avec `node:test`.

**Tests :**
- chaque `Place.region` actuelle trouve son gouvernorat (22 sur 22) ;
- les références structurelles sont toutes valides, ce qui reproduit la vérification manuelle de l'audit (§ 4.1) ;
- les 95 slugs et les 20 road trips sont figés.

**Risques :** aucun pour le site, car aucun fichier lu par les pages n'est modifié.

## Étape 2 · Clés de gouvernorat dans les pages (corrige le défaut Kébili et Le Kef)

**Changements :**
- `hasRegionPage`, `regionPath` et `agenciesFor` reçoivent une clé `gov:` calculée par `placeGovernorate(id)`, et non plus le nom traduit. Fichiers concernés : `lib/regionPages.ts`, `app/[lang]/lieux/[id]/page.tsx` (l. 178, 195, 288), `lib/structuredData.ts` (l. 159), `components/NearbyAgencies.tsx`, `components/ActionDrawer.tsx` (l. 209), `app/[lang]/lieux/page.tsx` (l. 110) et `components/landing/Landing.tsx` (l. 595).
- Le titre français des pages région utilise `name.fr` du gouvernorat.

**Effet visible attendu, et seulement celui-ci :**
- sur `/lieux/douz`, `/lieux/chott-el-jerid`, `/lieux/jebil` et `/lieux/camping-douz`, réapparition du fil d'Ariane, du lien « Que voir à Kébili » et du bloc des 51 agences ;
- titre « Que voir à Kébili ? » ;
- section « Kébili » de `/lieux` avec son lien.

**Tests :**
- sitemap identique ;
- snapshot du JSON-LD du fil d'Ariane des 95 lieux, en FR et en EN : seules les 4 fiches de Kébili changent en FR ;
- contrôle manuel des 4 pages sur la prévisualisation.

**Risque :** régression sur les pages région (`/que-voir/*`). Le slug y reste calculé depuis le nom anglais, ce qui est vérifié par le test du sitemap.

## Étape 3 · Données documentaires de la phase 1 (aucun changement visible)

**Nouveautés :**
- `designations.ts` (20 statuts), `ich.ts` (3), `heritage.ts` (13), `history.ts` (12), `festivals.ts` (7) et `placeKinds.ts` ;
- `relations.ts`, avec **les 75 relations** et leur statut exact de LOT4-RELATIONS § 3.2, y compris les relations non publiables. Le registre interne et le code ne font ainsi plus qu'un.

**Relations à intégrer en priorité (publiables) :**
- statuts officiels : rel-01 à rel-09, rel-13 à rel-16, rel-18 à rel-20 ;
- fondateurs et dates sourcés : rel-23, rel-25, rel-26, rel-29, rel-31 ;
- histoire et ouvrages : rel-33, rel-36, rel-38, rel-40 ;
- harissa → Tunisie : partie établie de rel-17.

**Tests :**
- `kg:check` (règles 4 à 8) ;
- un test qui vérifie que `relationsOf(…, { published: true })` ne renvoie aucune relation de statut autre que `established`.

## Étape 4 · Données structurées issues du graphe

**Changements dans `lib/structuredData.ts`, selon l'architecture § 6 :**
- `@id` unique par lieu ;
- `containedInPlace` (gouvernorat, puis pays) ;
- `containsPlace` pour les éléments patrimoniaux établis ;
- `subjectOf` pour les statuts officiels ;
- `@id` des road trips ;
- `location` des éditions par `@id`.

**Tests :**
- snapshot JSON-LD de 6 pages types (Carthage, Kairouan, Douz, un road trip, `/explore`, `/evenements`) ;
- validation dans le Rich Results Test et le validateur schema.org sur la prévisualisation ;
- taille de `/explore` avant et après, à noter dans la PR (risque T7).

**Risques :**
- **Changement d'`@id` des pages anglaises.** Les moteurs le voient comme une fusion de deux nœuds en un, ce qui est l'effet recherché. On surveille la Search Console (données structurées) pendant 2 semaines.

## Étape 5 · Mention UNESCO dérivée des statuts

**Changements :**
- la mention « Patrimoine mondial de l'UNESCO » (page lieu, carte, carnet imprimable) et le bonus de score de l'assistant (`engine.ts` l. 621) lisent `hasDesignation` ;
- le booléen `unesco` est gardé et contrôlé par `kg:check`.

**Prérequis :** la décision de OPEN-ISSUES § 5 sur les deux souks. Sans décision, le comportement actuel est conservé, et les deux souks sont déclarés comme exception dans `kg:check`.

**Tests :** les 10 fiches de biens affichent la mention à l'identique (snapshot du texte).

## Étape 6 · Festivals et éditions

**Changements :**
- `festival:<id>` pour les 7 identifiants actuels ;
- `editionOf` pour chaque ligne de `events` ;
- `superEvent` dans le JSON-LD.

**Source de vérité :** la table `events`, avec le fichier en secours, comme aujourd'hui. La confirmation est demandée dans OPEN-ISSUES § 2. `kg:check` signale tout écart entre le fichier et la table.

**Tests :** page `/evenements` identique à l'œil ; JSON-LD `Event` avec `location` par `@id`.

**Risque :** aucun changement de schéma. Si Mehdi veut une colonne `festival_id` plus tard, ce sera une migration à part, hors Lot 4.

## Étape 7 · Assistant et `llms.txt`

**Changements :**
- `lib/kg/facts.ts` ;
- contexte de Gemini enrichi des seuls faits publiés ;
- zones du moteur par mots-clés calculées depuis `areas.ts`, ce qui couvre 95 lieux au lieu de 38 ;
- section « Statuts officiels » générée dans `llms.txt`, au build.

**Tests :**
- 10 questions de référence, rejouées avant et après (« Quels sites UNESCO dans le Sud ? », « Qui a construit le ribat de Monastir ? », « La harissa est-elle à l'UNESCO ? »…) ;
- vérifier qu'aucune réponse ne cite une relation non publiée (par exemple Ibn Chabbat comme fait, ou Gladiator à El Jem).

**Risque :** des réponses de l'assistant plus longues. On limite à 5 faits par lieu.

## Étape 8 (facultative) · `sameAs` Wikidata vérifiés

Il s'agit de relier les fiches à Wikidata, une par une. Les 85 titres Wikipédia déjà présents servent de point de départ, et le contrôle est manuel (risque T6). Cette étape est à lancer seulement si Mehdi le souhaite, après les étapes 1 à 4.

## Récapitulatif

| Étape | Visible pour le visiteur | Dépend de | Taille estimée |
|---|---|---|---|
| 1 Fondations | non | — | moyenne |
| 2 Clés de gouvernorat | oui (correction de défaut) | 1 | petite |
| 3 Données documentaires | non | 1 | moyenne (données) |
| 4 Schema.org | non (moteurs seulement) | 2, 3 | moyenne |
| 5 Mention UNESCO | non, sauf décision sur les souks | 3 | petite |
| 6 Festivals | non | 1 | petite |
| 7 Assistant et `llms.txt` | oui (qualité des réponses) | 3 | moyenne |
| 8 Wikidata (facultative) | non | 4 | variable |

**Ne pas reconstruire :**
- la carte, les fiches, les road trips, « Mon voyage », les comptes, les événements dans /admin et les annuaires ONTT restent tels quels ;
- le graphe se branche à côté de ces fonctions, sans les réécrire.
