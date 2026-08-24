# Pages d'authentification (`/apps/porteur/src/pages/auth`)

Ce dossier héberge les pages d'entrée et de gestion d'accès pour les porteurs de projets.

## Fichiers

- **`porteur-login.tsx`** : Page principale d'authentification proposant l'onglet de connexion et d'inscription avec intégration Clerk/OAuth et formulaire classique.

## Architecture

La page utilise les composants modulaires situés dans `src/components/auth/` pour respecter strictement les principes Clean Code et la limite de taille par fichier.
