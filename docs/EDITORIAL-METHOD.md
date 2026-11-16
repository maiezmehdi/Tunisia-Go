# Méthode éditoriale de Tunisia Go

Version 1, 16 novembre 2026, ajoutée au dépôt avec le lot 1a du Lot 3. Elle s'applique à toute modification d'une fiche lieu, d'un guide long, d'un road trip ou d'une page région, en français comme en anglais.

---

## 1. Ce qu'on peut écrire

1. **Un fait = une source lue.** Une date, un chiffre, un nom, un record, une attribution ou un statut (UNESCO, Ramsar, parc national) n'entre ou ne reste sur le site que si une source a été ouverte et lue, et si elle dit exactement cela. Une source qui « en parle » sans le dire ne compte pas.
2. **Si rien ne le confirme**, on choisit dans cet ordre :
   - nuancer avec la formule qui correspond à la réalité (« selon la tradition », « selon les estimations », « on le présente souvent comme », « selon les passionnés qui ont étudié le tournage ») ;
   - retirer ;
   - le noter dans le registre comme « à vérifier », sans le publier.
3. **Jamais de mémoire.** Ce qui vient d'un souvenir, d'un autre guide de voyage ou d'un texte généré n'est pas une source.
4. **Superlatifs** (« le plus », « le seul », « le premier », « parmi les plus ») : seulement si une source institutionnelle ou académique les emploie. On reprend alors sa formule exacte (« considérée comme… », « parmi les trois ou quatre plus grands… »).
5. **Tournages et légendes** : présentés comme tels, avec une source secondaire nommée (sites de passionnés, presse). Jamais comme un fait établi sans source primaire.
6. **Pas de remplissage.** On n'allonge pas un texte pour atteindre un nombre de mots. La profondeur dépend de l'importance du lieu.

## 2. Types de sources

| Type | Exemples | Usage |
|---|---|---|
| **Institutionnelle** | UNESCO (listes, décisions, évaluations), AMVPPC (patrimoinedetunisie.com.tn), INP, ONTT et ministère du Tourisme, Ramsar, SNCFT, Direction générale des forêts, APAL, Institut national de la météorologie | Statuts, dates officielles, horaires, tarifs, protections, chiffres de gestion |
| **Académique** | Revues à comité de lecture, publications de fouilles (par exemple INP-UNISS 2024 pour Kerkouane), thèses, projets de recherche (Hydria) | Histoire, chronologie, interprétations, débats |
| **Secondaire** | Presse, guides, sites de passionnés (Star Wars), Wikipédia | Pistes vers une source meilleure. Seuls appuis possibles pour les tournages et l'actualité, et toujours cités comme secondaires. Wikipédia n'est jamais citée. |

Ordre de préférence : institutionnelle, puis académique, puis secondaire. Si deux sources institutionnelles divergent, la fiche le dit, ou on garde la formule la plus prudente, et le registre note l'écart.

## 3. Informations pratiques

- **Horaires, jours de fermeture, tarifs, billets groupés** : toujours avec leur source et leur date de relevé (« Relevé le 20 novembre 2026 · Source : AMVPPC »). Sans source datée, on n'affiche rien, et le texte dit « vérifiez sur place ».
- **Transports** : pas d'horaires de louage ni de bus. Les distances calculées sont arrondies et présentées comme approximatives.
- **Durée de validité** : un relevé de plus de 6 mois produit un avertissement au contrôle automatique. On revérifie au moins à chaque saison (été, ramadan, hiver).

## 4. Français et anglais

- Mêmes faits, mêmes nombres, mêmes précautions, même niveau de détail. L'adaptation naturelle est préférée à la traduction littérale.
- Une information importante n'existe jamais dans une seule langue.
- Les deux langues sont modifiées dans le même commit.

## 5. Titres et meta descriptions

- Écrits pour la recherche réelle du voyageur (« visiter Dougga », « horaires du Bardo ») et pour être compris hors contexte.
- Pas de limite de caractères appliquée mécaniquement. On vise des titres et descriptions qui ne seront pas coupés en général, mais la clarté passe avant la longueur.
- Aucun superlatif non sourcé dans un titre.
- Tout changement de titre ou de meta est noté avant/après dans le relevé du lot.

## 6. Traçabilité

- **Relevé avant/après** pour chaque modification éditoriale ou SEO : fiche, champ, langue, texte avant, texte après, source (type, titre, URL, date de lecture), raison. Un fichier par lot, `docs/editorial-log/lot3-<lot>.md`, livré aussi dans le rapport.
- **`data/contentDates.ts`** est mis à jour pour chaque fiche modifiée. Le sitemap et le JSON-LD reprennent cette date.
- **`docs/GEO-FACTUAL-VERIFICATION.md`** (registre) : chaque affirmation vérifiée, corrigée, nuancée ou retirée y garde son statut.
- **Sources affichées** (après la phase 2) : `data/placeSources.ts`. On n'y met que des sources lues.

## 7. Contrôles avant chaque PR

1. `npm run typecheck`.
2. Comparaison automatique avec `main` : identifiants, régions, catégories, coordonnées, étapes des road trips, pages région et structure JSON-LD identiques, sauf changement annoncé.
3. Parité FR/EN des nombres et des noms propres sur les fiches touchées.
4. Recherche des formules retirées : aucune ne doit rester, sur aucune page.
5. Chaque lien de source ouvert.
6. Aperçu Vercel : fiche FR et EN, carte, admin.
7. Rapport du lot avec le relevé avant/après.
8. **Validation de Mehdi avant fusion.**

## 8. Taille des PR

Une PR par lot, sans empilement. Une PR est découpée dès qu'elle devient difficile à relire, à titre indicatif au-delà d'environ 10 fiches ou d'un diff d'environ 300 lignes de texte.

## 9. Ce qu'on ne change pas dans un lot éditorial

Identifiants, URLs, régions, catégories, coordonnées, étapes des road trips, design, navigation, fonctionnalités, assistant, administration, Supabase. Aucune fiche n'est créée, fusionnée ou supprimée sans validation explicite.
