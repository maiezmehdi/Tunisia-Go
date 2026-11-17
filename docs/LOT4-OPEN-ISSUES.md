# Lot 4 · Points ouverts : décisions prises

Version 2, 17 novembre 2026. Les 8 points de la version 1 ont été tranchés par Mehdi le 17/11/2026 (« Lot 4 : exécution complète et autonome »). Ce tableau garde la question, la décision et ce qui a été fait dans la PR 136.

| # | Question | Décision de Mehdi | Mise en œuvre |
|---|---|---|---|
| 1 | Source officielle des 24 gouvernorats et de leur nom arabe | Source institutionnelle ; arabe vide s'il n'est pas vérifiable. | Liste des 24 gouvernorats lue sur l'Institut national de la statistique : page anglaise (`S20`) et page arabe (`S21`), le 17/11/2026. Les 24 noms arabes viennent de `S21`, chacun avec sa source. La page française de l'INS n'a pas pu être lue (erreur du site) : les noms FR et EN gardent l'orthographe des fiches (« Kébili », « Le Kef »). |
| 2 | Les événements : la table `events` fait-elle foi ? | Oui : Supabase fait foi, `data/events.ts` est le secours, les écarts sont contrôlés automatiquement. | `lib/kg/events.ts` relie chaque édition à son festival (lieu + titre français normalisé). `kg:check` compare la table et le fichier (lecture seule). Lecture du 17/11/2026 : 7 lignes, 0 écart (`tests/kg/fixtures/events-supabase-2026-11-17.json`). Aucune migration. |
| 3 | Sous-lieux : quelles paires deviennent `partOf` ? | Aucune sans preuve. | Aucune relation `partOf` publiée ; `kg:check` l'interdit (règle 7). Les fiches restent indépendantes. |
| 4 | Données UNESCO non accessibles | Seulement l'information officiellement vérifiée ; aucune année ni composante inventée. | Ichkeul (bien n° 8) et Djerba (n° 1640) sont publiés sans année ; aucune composante de Djerba ; biosphère de l'Ichkeul non publiée (rel-21 reste partielle). |
| 5 | Mention UNESCO sur `souk-el-attarine` et `kairouan-souks` | Ne pas présenter leur inclusion comme un fait ; corriger les mentions publiques si besoin. | Booléen `unesco` retiré des deux fiches : la mention « Patrimoine mondial de l'UNESCO » disparaît de leur page, de la carte et du carnet. Leurs textes ne disaient rien de l'UNESCO et ne changent pas. `kg:check` l'empêche de revenir. |
| 6 | Saisons de `ksar-ghilane` et `djerba-velo` | Garder les avertissements, ne rien inventer. | Avertissement B de `kg:check`, testé. Aucun mois ajouté. |
| 7 | Afficher les sources aux visiteurs ? | Non : pas de nouvel élément d'interface. | Les sources alimentent le graphe, les données structurées (`subjectOf`) et `llms.txt`. |
| 8 | LinkedIn dans `sameAs` | Vérifier ; sinon retirer. | La page n'a pas pu être lue (accès refusé aux robots), donc ni son existence ni son appartenance ne sont vérifiées : retirée de `Organization.sameAs`. À remettre si Mehdi confirme qu'elle est à Tunisia Go. |

## Limites connues, acceptées et non bloquantes

Elles ne seront pas transformées en chantiers.
- L'inscription de Sidi Bou Saïd (n° 1769, 2026) repose sur la vérification faite par Mehdi au Lot 3 : la page UNESCO reste illisible depuis le bac à sable. La relation est publiée (rel-77, partie établie de rel-11).
- La page française de l'INS n'a pas pu être lue ; les noms français des gouvernorats suivent les fiches.
- 20 relations candidates n'ont aucune source, et 6 n'ont qu'une source secondaire (LOT4-RELATIONS § 5). Elles restent au registre, non publiées.
- Les noms français officiels des 3 éléments du patrimoine immatériel n'ont pas été relevés : seules les pages anglaises ont été lues. Le `name.fr` est une traduction éditoriale tant que la page française n'est pas lue.
- Les années 1988 de Kairouan et de Sousse viennent de l'AMVPPC, pas des pages UNESCO, qui ne les affichent pas. C'est une source institutionnelle suffisante.
- Le support du ministère de l'Environnement qui cite les décrets des parcs (`S18`) n'affiche ni date ni auteur. Les dates de Bouhedma et de Jbil sont recoupées par d'autres sources (`S07`, `S19`). Les décrets eux-mêmes (JORT) n'ont pas été lus.
