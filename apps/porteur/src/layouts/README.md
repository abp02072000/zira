# Layouts de l'application (`/apps/porteur/src/layouts`)

Ce dossier héberge les composants de structure globale et de navigation commune.

## Fichiers

- **`porteur-layout.tsx`** : Gabarit principal enveloppant l'application avec le composant `AppShell` du package `@zira/ui`. Il configure les liens de navigation (Dashboard, Projets, Portefeuille, Profil).

## Spécifications

- Navigation dynamique et synchronisée avec les clés de traduction i18n (`useLang`).
- Responsive : barre latérale sur grand écran et barre inférieure de navigation sur mobile.
