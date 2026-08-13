# REX — Garde-fous performance pour les projets web nLab

## Principe

Une fonctionnalité qui marche mais rend l'interface instable, bloque le navigateur ou multiplie les requêtes inutiles n'est pas considérée comme terminée.

## Règles de développement

### 1. Rendre uniquement ce qui est utile

- Ne pas recalculer une vue invisible.
- Démonter ou virtualiser les contenus lourds non visibles.
- Construire les arbres récursifs à la demande, branche par branche.
- Éviter les DOM massifs préconstruits et simplement cachés avec `display:none`.

### 2. Garder le thread principal disponible

- Regrouper les mutations DOM.
- Coalescer les rafales de mises à jour avec `requestAnimationFrame`.
- Debouncer recherche, Diff, validation et coloration syntaxique.
- Éviter les calculs synchrones lourds dans `input`, `mousemove`, `scroll` et `resize`.
- Déporter plus tard en Worker les calculs réellement lourds si nécessaire.

### 3. Gérer les gros jeux de données explicitement

- Table > quelques centaines de lignes: pagination ou fenêtre de rendu.
- Long arbre: rendu lazy et limite de profondeur.
- Gros fichier RAW: mode plain performant; coloration avancée seulement lorsque raisonnable.
- Diff volumineux: limite d'entrée/sortie et déclenchement différé.

### 4. Réseau et APIs

- Un changement d'onglet local ne doit produire aucune requête.
- Cache des métadonnées et réponses stables.
- Dédupliquer les requêtes concurrentes identiques.
- Respecter les rate limits et les en-têtes de cache/ETag lorsque disponibles.
- Pas de polling fréquent par défaut.
- Regrouper les lectures de données quand une seule requête peut satisfaire plusieurs composants.
- Instrumenter le nombre de requêtes lors des scénarios de navigation.

### 5. Mémoire

- Les vues quittées ne doivent pas conserver de grands sous-arbres DOM inutiles.
- Vérifier les detached DOM trees et listeners orphelins.
- Les caches doivent être bornés et invalidables.
- Tester une boucle de navigation prolongée, pas seulement le premier rendu.

## Budgets de validation par défaut

- DOM normal: cible < 800 éléments; >1400 exige justification ou correction.
- Interaction locale: cible < 50 ms; aucune tâche longue > 50 ms récurrente.
- Changement d'onglet: pas de recalcul des autres vues.
- Requêtes sur changement d'onglet: 0 sauf dépendance externe explicitement nécessaire.
- Croissance mémoire après cycles de navigation: pas de tendance monotone inexpliquée.

Ces budgets sont des garde-fous internes et doivent être adaptés pour les écrans volontairement complexes.

## Checklist PR / Preview

Avant de déclarer une preview « à valider »:

- [ ] smoke test runtime;
- [ ] console sans erreur;
- [ ] mesure DOM;
- [ ] mesure CPU/rendu des interactions principales;
- [ ] contrôle mémoire sur cycles répétés;
- [ ] contrôle requêtes réseau;
- [ ] test gros dataset;
- [ ] test navigation rapide;
- [ ] test mobile ou viewport réduit;
- [ ] résultat documenté dans le dossier de preview.

## REX JSON Studio

Le JSON Studio a montré qu'un rendu fonctionnel pouvait masquer une dette de performance importante: vues cachées conservées, Diff recalculé sur chaque frappe et arbre construit intégralement. Le correctif le plus efficace a été de changer le modèle de rendu, pas de micro-optimiser chaque composant isolément.

La règle à retenir est donc: **mesurer l'architecture de rendu avant d'optimiser les détails**.
