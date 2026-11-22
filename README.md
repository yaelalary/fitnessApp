# Carnet muscu

Application Vue 3 pour noter ses séances de musculation, à plusieurs profils.

- **Exercices** : nom, catégorie (échauffement, musculation, cardio, étirement), marque (Technogym, Hammer Strength, poids libres), machine, muscle, séries / répétitions / récupération par défaut, photo de la machine (prise avec le téléphone ou lien vers une image).
- **Parcours** : enchaînements d'exercices dans l'ordre, avec un objectif par exercice.
- **Séances** : démarrées depuis un parcours (charges pré-remplies avec celles de la dernière fois) ou en séance libre, minuteur de récupération, séries cochées au fur et à mesure. Une séance en cours est gardée dans le navigateur jusqu'à son enregistrement.
- **Statistiques** : séances par semaine, et pour chaque exercice charge max, 1RM estimé, volume, répétitions, durée, distance, vitesse.
- **Profils** : chaque personne a ses propres données.

## Développement

```sh
npm install
npm run dev      # serveur local
npm test         # tests de la logique métier
npm run build    # build de production dans dist/
```

## Déploiement sur GitHub Pages

1. Pousse le projet sur un dépôt GitHub, branche `master`.
2. Dans **Settings → Pages**, choisis **Source : GitHub Actions**.
3. Chaque push sur `master` lance `.github/workflows/deploy.yml` (tests, build, déploiement).

L'application utilise un routage par `#` et des chemins relatifs : elle marche quel que soit le nom du dépôt.

## Sauvegarde sur un gist

Sans configuration, les données restent dans le navigateur de l'appareil.

1. Crée un jeton GitHub avec le droit `gist` (le lien est dans **Réglages**).
2. Dans **Réglages → Sauvegarde GitHub Gist**, colle le jeton et clique sur **Créer un gist** : un gist secret est créé avec les données actuelles.
3. Sur le second téléphone, saisis le même identifiant de gist et un jeton, puis **Connecter**.

### Gist par défaut

Pour ne saisir que le jeton sur chaque téléphone, l'identifiant du gist peut être fourni au build :

- en local : copie `.env.example` en `.env` et renseigne `VITE_GIST_ID` (`.env` est ignoré par git) ;
- pour le déploiement : ajoute un secret `GIST_ID` dans **Settings → Secrets and variables → Actions** du dépôt.

L'identifiant n'apparaît pas dans le dépôt, mais il figure dans le JavaScript publié sur GitHub Pages : toute personne qui ouvre l'app peut le retrouver et lire le gist. Sans jeton, elle ne peut pas le modifier.

Le gist contient un fichier `profile-<id>.json` par profil et un fichier `image-<id>.txt` par photo. Chaque profil n'écrit que son propre fichier : deux personnes peuvent enregistrer en même temps sans écraser les données de l'autre.

> Le jeton est stocké dans le `localStorage` du navigateur. Sur GitHub Pages, toutes les pages de `<utilisateur>.github.io` partagent ce stockage : utilise un jeton limité au droit `gist`.
