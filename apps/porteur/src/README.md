# Code Source Porteur (`/apps/porteur/src`)

Ce dossier regroupe l'ensemble du code source frontend de l'application Porteur de Projet.

## Organisation des sous-dossiers

- **`components/`** : Composants React découpés par domaine fonctionnel (auth, dashboard, portefeuille, profil, projets, projet-detail, projet-nouveau).
- **`layouts/`** : Enveloppes structurelles fournissant la barre latérale, la navigation et le responsive shell.
- **`pages/`** : Vues de haut niveau associées aux différentes routes de l'application.
- **`routes/`** : Système de routage Wouter avec protection d'authentification (`AuthGuard`).

## Fichiers racine

- **`App.tsx`** : Assemblage des providers globaux (thème, internationalisation, authentification, données) et initialisation du routeur.
- **`main.tsx`** : Point d'ancrage React dans le DOM HTML.

## Règles de conception

- **Clean Code & DRY** : Aucun composant redondant ni fichier monolithique.
- **Taille de fichier** : Tous les fichiers sont strictement limités à moins de 100 lignes de code.
- **Commentaires & Typage** : Code documenté en français avec typage strict TypeScript.
