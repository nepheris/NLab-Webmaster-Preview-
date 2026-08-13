# nLab Webmaster Preview — Roadmap

Statut : actif / environnement de développement et de validation HUMAN.

## WP-100 — Stabilisation du portail Preview

- conserver le fonctionnement actuel de la galerie et des workspaces ;
- maintenir les smoke tests de démarrage ;
- corriger les défauts cosmétiques sans casser les IDs/runtime existants.

## WP-200 — Thèmes de projets et filtres multi-sélection

Objectif : permettre une navigation transversale par thèmes sans remplacer le filtre projet existant.

### Données

Chaque projet/version de preview pourra exposer une liste de thèmes/tags, par exemple :

- `nlab`
- `dashboard`
- `web`
- `site-web`
- `outil`
- `branding`

Un projet peut appartenir à plusieurs thèmes.

### Interface

Ajouter un niveau de filtre au-dessus du filtre projet actuel :

1. barre de thèmes avec sélection multiple ;
2. actions `Tout` / `Aucun` pour les thèmes ;
3. le filtre projet existant reste disponible sous ce niveau ;
4. lorsque certains thèmes sont actifs, la liste des projets proposée est réduite aux projets compatibles ;
5. lorsque tous les thèmes sont actifs, tous les projets restent visibles ;
6. possibilité de cumuler plusieurs thèmes et plusieurs projets.

### Critères d’acceptation

- réutiliser les mécanismes de boutons/filtres déjà présents autant que possible ;
- ne pas dupliquer inutilement la logique de filtrage ;
- conserver la compatibilité avec les previews existantes sans metadata de thème ;
- prévoir un fallback `sans-theme` ou équivalent pour les anciens projets.

## WP-300 — Authentification GitHub et protection des données

Objectif : sortir du mode de dérogation temporaire où certaines previews de développement sont publiquement accessibles.

### Règle cible

- la galerie peut rester publiquement accessible si elle ne contient que des informations explicitement publiables ;
- les données opérationnelles, tableaux de bord et informations de pilotage non destinées au public doivent être accessibles uniquement après authentification GitHub ;
- aucune donnée privée ne doit être embarquée dans un artefact public simplement masqué côté interface.

### Situation temporaire validée HUMAN

Tant que le module d’authentification GitHub n’est pas opérationnel, les dashboards de développement peuvent être utilisés dans Webmaster Preview uniquement si les données exposées ont été explicitement considérées publiables et non sensibles.

Cette dérogation est temporaire et ne vaut pas comme architecture cible.

### Critères de sortie

- authentification GitHub fonctionnelle ;
- contrôle d’accès avant récupération des données protégées ;
- absence de secrets/tokens dans le navigateur et les artefacts statiques ;
- test utilisateur authentifié / non authentifié ;
- migration des dashboards concernés.

## WP-400 — Mutualisation des dashboards nLab

Dépendance : décision HUMAN sur le candidat de regroupement `nLab Dashboard`.

Préparer le Preview à afficher les composants dashboard comme des briques/sous-projets d’un même programme, sans casser leurs historiques propres.

## Priorité proposée

1. WP-100 stabilisation/cosmétique ;
2. WP-200 thèmes + filtres ;
3. WP-300 authentification GitHub ;
4. WP-400 intégration du futur projet nLab Dashboard.
