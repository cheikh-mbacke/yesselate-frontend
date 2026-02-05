# Module Centre d'Alerte - Maître d'Ouvrage

Module complet de gestion des alertes pour le portail Maître d'Ouvrage.

## Structure

```
src/modules/centre-alertes/
├── api/
│   └── alertesApi.ts              # Service API avec données mock
├── hooks/
│   ├── useAlertesStats.ts         # Hook pour les statistiques
│   ├── useAlertesFilters.ts       # Hook pour les filtres (Zustand)
│   ├── useAlertesData.ts          # Hook pour récupérer les alertes
│   └── index.ts                   # Exports
├── navigation/
│   ├── alertesNavigationConfig.ts # Configuration de navigation
│   ├── AlertesSidebar.tsx         # Sidebar de navigation
│   └── index.ts                   # Exports
├── pages/
│   ├── overview/
│   │   ├── IndicateursPage.tsx    # Indicateurs en temps réel
│   │   ├── TypologiePage.tsx      # Synthèse par typologie
│   │   ├── BureauPage.tsx         # Synthèse par bureau
│   │   └── index.ts
│   └── critiques/
│       ├── PaiementsBloquesPage.tsx
│       ├── ValidationsBloqueesPage.tsx
│       ├── JustificatifsManquantsPage.tsx
│       └── index.ts
└── types/
    └── alertesTypes.ts            # Types TypeScript
```

## Utilisation

### Types

```typescript
import type { Alerte, AlerteStats, AlerteFiltres, TypologieAlerte, StatutAlerte } from '@/modules/centre-alertes/types/alertesTypes';
```

### Hooks

```typescript
import { useAlertesStats, useAlertesData, useAlertesFilters } from '@/modules/centre-alertes/hooks';

// Récupérer les statistiques
const { data: stats, isLoading } = useAlertesStats();

// Récupérer les alertes
const { data: alertes } = useAlertesData({ typologies: ['CRITIQUE'] });

// Gérer les filtres
const { filtres, setFiltres, resetFiltres } = useAlertesFilters();
```

### Navigation

```typescript
import { AlertesSidebar, alertesNavigation } from '@/modules/centre-alertes/navigation';
```

### Pages

Les pages sont disponibles dans `src/modules/centre-alertes/pages/` et peuvent être utilisées dans les routes Next.js.

## Navigation

Le module utilise une navigation hiérarchique avec les sections suivantes :

- **Vue d'ensemble**
  - Indicateurs en temps réel
  - Synthèse par typologie
  - Synthèse par bureau

- **Alertes critiques**
  - Paiements bloqués
  - Validations bloquées
  - Justificatifs manquants
  - Risques financiers

- **Alertes SLA**
  - SLA dépassés
  - SLA à risque
  - SLA en attente

- **Alertes RH**
  - Absences bloquantes
  - Sur-allocation ressources
  - Retards RH

- **Alertes projets**
  - Retards détectés
  - Jalons non tenus
  - Blocages MOA/MOE

- **Historique & gouvernance**
  - Historique des alertes
  - Règles d'alerte
  - Escalades & suivis

## Routes

Les routes suivent le pattern `/maitre-ouvrage/alerts/...` comme défini dans la configuration de navigation.

## Types d'alertes

- `CRITIQUE` : Alertes critiques nécessitant une action immédiate
- `SLA` : Alertes liées aux SLA
- `RH` : Alertes ressources humaines
- `PROJET` : Alertes projets

## Statuts d'alertes

- `EN_COURS` : Alerte en cours de traitement
- `ACQUITTEE` : Alerte acquittée
- `RESOLUE` : Alerte résolue

