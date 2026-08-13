# Preview Web Sandbox

Racine exclusive du viewer `nLab Webmaster Preview`.

## Convention

```text
Preview-Web-Sandbox/
└── <projet-ou-concept>/
    └── YYYYMMDD_HHMMSS_<iteration>/
        └── index.html
```

- niveau 1 : nom stable du projet, framework, POC ou concept ;
- niveau 2 : itération horodatée ;
- `index.html` : point d'entrée de la preview ;
- les assets et sous-dossiers nécessaires au site sont conservés dans la même itération ;
- le viewer lit uniquement cette racine et ses descendants ;
- aucun manifeste d'inventaire n'est nécessaire : le navigateur interroge GitHub à partir de cette racine ;
- les reviews sont enregistrées localement dans le navigateur pour la V1 ;
- le bouton d'enregistrement GitHub est réservé dans l'interface mais reste désactivé tant que l'authentification n'est pas développée.

## Cycle de vie

Une preview est un artefact temporaire de validation. Son état peut être : à examiner, à retravailler, validé ou rejeté. Sa politique de conservation peut être temporaire, liée à une validation/phase nLab, à archiver ou à supprimer.

Les exports Review utilisent provisoirement la structure nLab `metadonnees / contenu / dictionnaire_donnees` afin de rester proches du futur Project Master / JSON Studio.