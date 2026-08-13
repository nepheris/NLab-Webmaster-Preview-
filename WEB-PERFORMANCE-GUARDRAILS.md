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
- L'arbre de navigation public doit être construit une fois au déploiement, chargé depuis un snapshot statique au démarrage, puis rester local pendant toute la session.
- Aucun rescan GitHub automatique après le chargement initial ; seules les actions humaines explicites `Actualiser l’arborescence` ou `F5` peuvent relire le snapshot ou reconstruire l’inventaire.
- Les modifications sont accumulées localement. `Enregistrer` constitue un lot unique et, si une session authentifiée existe, émet au maximum une demande de synchronisation depuis le navigateur.
- Distinguer les requêtes d’assets statiques cacheables (HTML, JS, SVG, JSON de configuration) des appels API : le budget strict porte en priorité sur les appels API et les synchronisations.
- Cache des métadonnées et réponses stables.
- Dédupliquer les requêtes concurrentes identiques.
- Pas de polling fréquent par défaut; préférer événements/webhooks lorsque l'architecture le permet.
- Pour GitHub REST: privilégier les requêtes authentifiées et conditionnelles (`ETag` / `If-None-Match`, `Last-Modified` / `If-Modified-Since`).
- Respecter `Retry-After`, `x-ratelimit-remaining` et `x-ratelimit-reset`; pas de retry agressif.
- Éviter les rafales de requêtes concurrentes; sérialiser/mettre en file les appels lorsque nécessaire.
- Regrouper les lectures de données quand une seule requête peut satisfaire plusieurs composants.
- Demander uniquement les données nécessaires et conserver des réponses stables/cachables.
- Instrumenter le nombre de requêtes lors des scénarios de navigation.

### 5. Mémoire

- Les vues quittées ne doivent pas conserver de grands sous-arbres DOM inutiles.
- Vérifier les detached DOM trees et listeners orphelins.
- Les caches doivent être bornés et invalidables.
- Tester une boucle de navigation prolongée, pas seulement le premier rendu.


### 6. Lighthouse, PageSpeed Insights et benchmarks

- Les audits manuels ciblent toujours l'URL publique réellement déployée, jamais la page GitHub du dépôt.
- La barre d'outils de la preview expose deux liens explicites : Mobile et Bureau.
- L'ouverture du rapport reste une action HUMAN explicite ; aucun appel PageSpeed Insights n'est déclenché au chargement.
- Comparer au minimum trois exécutions et retenir la médiane pour limiter la variabilité.
- Conserver avec le rapport : URL, version visible, commit, date/heure, profil Mobile/Bureau et environnement de test.
- Analyser les métriques et diagnostics, pas seulement le score global : LCP, CLS, TBT, FCP, Speed Index, poids transféré, nombre de requêtes, JavaScript inutilisé et ressources bloquant le rendu.
- Distinguer données de laboratoire Lighthouse et données terrain Core Web Vitals/CrUX.
- Une régression significative doit créer une action traçable avant promotion ; les seuils deviennent bloquants seulement après établissement d'une baseline fiable.
- L'automatisation Lighthouse CI appartient au pipeline de benchmark/CI, jamais au runtime de la page.

## Budgets de validation par défaut

- DOM normal: cible < 800 éléments; >1400 exige justification ou correction.
- Interaction locale: cible < 50 ms; aucune tâche longue > 50 ms récurrente.
- Changement d'onglet: pas de recalcul des autres vues.
- Requêtes sur changement d'onglet: 0 sauf dépendance externe explicitement nécessaire.
- Croissance mémoire après cycles de navigation: pas de tendance monotone inexpliquée.
- API GitHub: aucune boucle de polling implicite; cache/ETag obligatoire lorsqu'une ressource est relue régulièrement.

Ces budgets sont des garde-fous internes et doivent être adaptés pour les écrans volontairement complexes.

## Checklist PR / Preview

Avant de déclarer une preview « à valider »:

- [ ] smoke test runtime;
- [ ] console sans erreur;
- [ ] mesure DOM;
- [ ] mesure CPU/rendu des interactions principales;
- [ ] contrôle mémoire sur cycles répétés;
- [ ] contrôle requêtes réseau;
- [ ] contrôle cache/ETag/rate-limit pour les intégrations GitHub;
- [ ] test gros dataset;
- [ ] test navigation rapide;
- [ ] test mobile ou viewport réduit;
- [ ] audit Lighthouse/PageSpeed de l'URL publique en Mobile et Bureau;
- [ ] comparaison de plusieurs exécutions et conservation de la médiane;
- [ ] rapport associé à la version visible et au commit testés;
- [ ] résultat documenté dans le dossier de preview.

## REX JSON Studio

Le JSON Studio a montré qu'un rendu fonctionnel pouvait masquer une dette de performance importante: vues cachées conservées, Diff recalculé sur chaque frappe et arbre construit intégralement. Le correctif le plus efficace a été de changer le modèle de rendu, pas de micro-optimiser chaque composant isolément.

La règle à retenir est donc: **mesurer l'architecture de rendu avant d'optimiser les détails**.
