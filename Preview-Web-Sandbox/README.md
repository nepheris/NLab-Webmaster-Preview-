# Preview Web Sandbox

Racine exclusive du viewer `nLab Webmaster Preview`.

## Convention

```text
Preview-Web-Sandbox/
└── <projet-ou-concept>/
    ├── project.json
    ├── production-current/
    │   └── index.html
    └── YYYYMMDD_HHMMSS_<iteration>/
        ├── index.html
        └── <assets éventuels>
```

- niveau 1 : nom stable du projet, framework, POC ou concept ;
- `project.json` : métadonnées du projet qui ne peuvent pas être déduites automatiquement, notamment nom d'affichage, dépôt et URL de production ;
- `production-current/` : entrée optionnelle vers la production actuelle ;
- niveau itération : dossier horodaté `YYYYMMDD_HHMMSS_<iteration>` ;
- `index.html` : point d'entrée de la preview ;
- les assets et sous-dossiers nécessaires au site sont conservés dans la même itération ;
- le viewer lit uniquement cette racine et ses descendants ;
- aucun manifeste global d'inventaire n'est nécessaire : le navigateur interroge GitHub à partir de cette racine ;
- la production actuelle est affichée séparément et ne compte pas comme une preview ;
- les reviews sont enregistrées localement dans le navigateur pour la V1 ;
- le bouton d'enregistrement GitHub est réservé dans l'interface mais reste désactivé tant que l'authentification n'est pas développée.

## project.json

Exemple :

```json
{
  "project_id": "recettes-du-coeur",
  "display_name": "Les Recettes du Cœur",
  "repository": "recettesducoeur/recettesducoeur.github.io",
  "production": {
    "status": "production",
    "label": "Site public en production",
    "url": "https://recettesducoeur.github.io/"
  }
}
```

Ce fichier n'est pas un manifeste de previews. Les itérations restent découvertes automatiquement depuis l'arborescence.

## Cycle de vie

Une preview est un artefact temporaire de validation. Son état peut être : à examiner, à retravailler, validé ou rejeté. Sa politique de conservation peut être temporaire, liée à une validation/phase nLab, à archiver ou à supprimer.

Les exports Review utilisent provisoirement la structure nLab `metadonnees / contenu / dictionnaire_donnees` afin de rester proches du futur Project Master / JSON Studio.

## Dashboards nLab comparatifs

Le laboratoire visuel regroupe désormais quatre surfaces de dashboard dans des projets de preview séparés :

- `cockpit-nlab` : portefeuille, projets et agents ;
- `post-it-dashboard` : Post-it, TODO et matrice d'Eisenhower ;
- `nlab-roadmap-dashboard` : phases, gates et prochaines actions ;
- `nlab-gantt-dashboard` : chronologie, jalons et dépendances.

Le projet `dashboard-design-lab` sert de galerie comparative et de point de capitalisation. Les previews utilisent un snapshot local au chargement et le socle partagé `assets/dashboard-system.css` / `assets/dashboard-system.js`.
