# Pages de l'application (`/apps/porteur/src/pages`)

Ce dossier contient les pages principales de l'application Porteur de Projet.

## Liste des pages

- **`auth/`** : Authentification, connexion et inscription (`porteur-login.tsx`).
- **`dashboard.tsx`** : Tableau de bord résumant les indicateurs clés et projets récents.
- **`notifications.tsx`** : Centre de notifications système et activités de la plateforme.
- **`onboarding.tsx`** : Carrousel de découverte et présentation des fonctionnalités fondateurs.
- **`portefeuille.tsx`** : Gestion de la trésorerie et répartition des fonds collectés.
- **`profil.tsx`** : Fiche profil, compétences, parcours et vérification d'identité KYC.
- **`projets.tsx`** : Listing complet et filtrage des projets porteurs par statut.
- **`projet-detail.tsx`** : Page de suivi détaillée d'une campagne et souscriptions.
- **`projet-nouveau.tsx`** : Tunnel de saisie guidée pour créer et soumettre un nouveau projet.

## Normes

Chaque page est un conteneur léger orchestrant des sous-composants dédiés et ne dépasse pas 100 lignes de code.
