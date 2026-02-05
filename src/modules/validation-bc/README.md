# Module Validation-BC - Maître d'Ouvrage

Module complet de validation de bons de commande, factures et avenants pour le portail Maître d'Ouvrage.

## Structure

```
src/modules/validation-bc/
├── api/
│   └── validationApi.ts              # Service API avec données mock
├── hooks/
│   ├── useValidationStats.ts         # Hook pour les statistiques
│   ├── useValidationFilters.ts       # Hook pour les filtres (Zustand)
│   ├── useValidationData.ts          # Hook pour récupérer les documents
│   └── index.ts                      # Exports
├── navigation/
│   ├── validationNavigationConfig.ts # Configuration de navigation
│   ├── ValidationSidebar.tsx         # Sidebar de navigation
│   └── index.ts                      # Exports
├── pages/
│   ├── overview/
│   │   ├── IndicateursPage.tsx       # Indicateurs en temps réel
│   │   ├── StatsPage.tsx             # Statistiques détaillées
│   │   ├── TrendsPage.tsx            # Tendances
│   │   └── index.ts
│   ├── types/
│   │   ├── BonsCommandePage.tsx      # Bons de commande
│   │   ├── FacturesPage.tsx          # Factures
│   │   ├── AvenantsPage.tsx          # Avenants
│   │   └── index.ts
│   ├── statut/
│   │   ├── EnAttentePage.tsx         # Documents en attente
│   │   ├── ValidesPage.tsx           # Documents validés
│   │   ├── RejetesPage.tsx           # Documents rejetés
│   │   ├── UrgentsPage.tsx           # Documents urgents
│   │   └── index.ts
│   ├── historique/
│   │   ├── HistoriqueValidationsPage.tsx
│   │   ├── HistoriqueRejetsPage.tsx
│   │   └── index.ts
│   └── analyse/
│       ├── TendancesPage.tsx
│       ├── ValidateursPage.tsx
│       ├── ServicesPage.tsx
│       ├── ReglesMetierPage.tsx
│       └── index.ts
├── components/
│   ├── ValidationContentRouter.tsx   # Router de contenu
│   ├── DocumentCard.tsx              # Carte de document
│   └── index.ts
└── types/
    └── validationTypes.ts            # Types TypeScript
```

## Utilisation

### Types

```typescript
import type { 
  DocumentValidation, 
  ValidationStats, 
  ValidationFiltres,
  TypeDocument,
  StatutDocument 
} from '@/modules/validation-bc/types/validationTypes';
```

### Hooks

```typescript
import { useValidationStats, useValidationData, useValidationFilters } from '@/modules/validation-bc/hooks';

// Récupérer les statistiques
const { data: stats, isLoading } = useValidationStats();

// Récupérer les documents
const { data: documents } = useValidationData({ types: ['BC'] });

// Gérer les filtres
const { filtres, setFiltres, resetFiltres } = useValidationFilters();
```

### Navigation

```typescript
import { ValidationSidebar, validationNavigation } from '@/modules/validation-bc/navigation';
```

### Pages

Les pages sont disponibles dans `src/modules/validation-bc/pages/` et peuvent être utilisées dans les routes Next.js.

### Content Router

```typescript
import { ValidationContentRouter } from '@/modules/validation-bc/components';

<ValidationContentRouter 
  mainCategory="overview"
  subCategory="indicateurs"
/>
```

## Navigation

Le module utilise une navigation hiérarchique avec les sections suivantes :

- **Vue d'ensemble**
  - Indicateurs en temps réel
  - Statistiques
  - Tendances

- **Par type de document**
  - Bons de Commande (BC)
  - Factures
  - Avenants

- **Par statut**
  - En attente
  - Validés
  - Rejetés
  - Urgents

- **Historique**
  - Historique des validations
  - Historique des rejets

- **Analyse & gouvernance**
  - Tendances
  - Validateurs
  - Services
  - Règles métier

## Routes

Les routes suivent le pattern `/maitre-ouvrage/validation-bc/...` comme défini dans la configuration de navigation.

## Types de documents

- `BC` : Bons de Commande
- `FACTURE` : Factures
- `AVENANT` : Avenants

## Statuts de documents

- `EN_ATTENTE` : Document en attente de validation
- `VALIDE` : Document validé
- `REJETE` : Document rejeté
- `URGENT` : Document urgent nécessitant une attention immédiate

## Services

- `ACHATS` : Service Achats
- `FINANCE` : Service Finance
- `JURIDIQUE` : Service Juridique
- `AUTRES` : Autres services

