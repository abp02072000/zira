# Application Porteur de Projet (`apps/porteur`)

Cette application constitue le portail web dédié aux fondateurs de startups et porteurs de projets sur la plateforme **ZIRA INVEST**. Elle leur permet de préparer, publier et administrer leurs campagnes de levée de fonds, de suivre leurs investisseurs et de gérer leur portefeuille.

## Fonctionnalités Clés

- **Tableau de Bord** : Vue synthétique des métriques financières, projets actifs et indicateurs de performance.
- **Gestion des Projets** : Consultation, filtrage par statut (Actif, En révision, Brouillon) et modification rapide.
- **Assistant de Création (5 étapes)** : Saisie guidée de l'identité du projet, de l'équipe, de la Cap Table, des conditions de financement et vérification finale.
- **Détails & Suivi d'une Levée** : Analyse en temps réel des souscriptions, progression de la jauge et répartition du capital.
- **Portefeuille Multi-Canaux** : Suivi des fonds collectés, intégration Mobile Money (Airtel, Orange, M-Pesa), Stablecoins (USDT/USDC) et virements bancaires.
- **Profil & Conformité KYC** : Gestion des informations personnelles, validation OCR des pièces d'identité et préférences.

## Architecture Technique

- **Framework UI** : React 18 + TypeScript + Vite.
- **Styling** : Tailwind CSS avec design system unifié (`@zira/ui`).
- **Gestion d'état & Requêtage** : TanStack Query v5 + Context API partagée (`@zira/shared`).
- **Routage** : Wouter avec guards d'authentification.
- **Visualisations graphiques** : Recharts.

## Structure du Répertoire

```
apps/porteur/
├── src/
│   ├── components/     # Composants d'interface modulaires
│   ├── layouts/        # Gabarits de structure et barres de navigation
│   ├── pages/          # Vues principales de l'application
│   ├── routes/         # Routage déclaratif et sécurisation
│   ├── App.tsx         # Point d'entrée avec fournisseurs de contexte
│   └── main.tsx        # Montage DOM React
├── package.json        # Dépendances et scripts de build
├── vite.config.ts      # Configuration du bundler Vite
└── tsconfig.json       # Configuration TypeScript
```
