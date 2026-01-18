# Module Demandes - Architecture Modulaire

## 📁 Structure Créée

```
src/modules/demandes/
├── types/
│   └── demandesTypes.ts           ✅ Types TypeScript complets
├── navigation/
│   ├── demandesNavigationConfig.ts ✅ Configuration navigation hiérarchique
│   └── DemandesSidebar.tsx         ✅ Sidebar navigation collapsible
├── pages/
│   └── overview/
│       └── DashboardPage.tsx       ✅ Page dashboard avec KPIs
├── components/
│   └── DemandesContentRouter.tsx   ✅ Router de contenu
├── hooks/
│   ├── useDemandesStats.ts         ✅ Hook stats (React Query)
│   ├── useDemandesFilters.ts       ✅ Hook filtres (Zustand)
│   └── useDemandesData.ts          ✅ Hook données (React Query)
├── api/
│   └── demandesApi.ts              ✅ API layer (Axios)
└── index.ts                        ✅ Exports principaux
```

## ✅ Composants Créés

### Types & Configuration
- ✅ Types TypeScript complets (`DemandeStatus`, `DemandeService`, `Demande`, `DemandeStats`, etc.)
- ✅ Configuration navigation hiérarchique avec icônes Lucide
- ✅ Support badges dynamiques

### Navigation
- ✅ `DemandesSidebar` - Sidebar collapsible avec navigation hiérarchique
- ✅ Badges dynamiques basés sur les stats
- ✅ Navigation à 2 niveaux (catégories principales + sous-catégories)

### Pages
- ✅ `DashboardPage` - Vue d'ensemble avec:
  - Performance Globale (KPIs)
  - Actions Prioritaires
  - Répartition par Service

### Hooks
- ✅ `useDemandesStats` - Stats globales (React Query)
- ✅ `useDemandesFilters` - Gestion filtres (Zustand)
- ✅ `useDemandesData` - Données demandes (React Query)
- ✅ `useDemandesByStatus` - Demandes par statut
- ✅ `useDemandesByService` - Demandes par service
- ✅ `useDemandesTrends` - Tendances temporelles
- ✅ `useServiceStats` - Stats par service

### API
- ✅ API layer complet avec Axios
- ✅ CRUD demandes
- ✅ Export données
- ✅ Statistiques & tendances

## 📝 À Implémenter

### Pages Manquantes

#### Overview
- [ ] `StatsPage.tsx` - Page statistiques détaillées
- [ ] `TrendsPage.tsx` - Page tendances avec graphiques

#### Par Statut
- [ ] `EnAttentePage.tsx` - Demandes en attente
- [ ] `UrgentesPage.tsx` - Demandes urgentes
- [ ] `ValideesPage.tsx` - Demandes validées
- [ ] `RejeteesPage.tsx` - Demandes rejetées
- [ ] `EnRetardPage.tsx` - Demandes en retard

#### Actions Prioritaires
- [ ] `AchatsPage.tsx` - Actions achats
- [ ] `FinancePage.tsx` - Actions finance
- [ ] `JuridiquePage.tsx` - Actions juridique

#### Par Service
- [ ] `AchatsServicePage.tsx` - Service Achats
- [ ] `FinanceServicePage.tsx` - Service Finance
- [ ] `JuridiqueServicePage.tsx` - Service Juridique
- [ ] `AutresServicesPage.tsx` - Autres services

### Composants UI

- [ ] `DemandesHeader.tsx` - En-tête avec breadcrumbs
- [ ] `KpiPanel.tsx` - Panneau KPIs réutilisable
- [ ] `TrendsChart.tsx` - Graphiques tendances (Chart.js/Recharts)
- [ ] `PriorityActionsPanel.tsx` - Panneau actions prioritaires
- [ ] `ServiceBreakdownPanel.tsx` - Répartition par service

### Intégration

- [ ] Mettre à jour `app/(portals)/maitre-ouvrage/demandes/page.tsx` pour utiliser le nouveau module
- [ ] Créer un store Zustand pour la navigation (ou utiliser l'existant)
- [ ] Ajouter routes API Next.js si nécessaire
- [ ] Ajouter composants sub-navigation si nécessaire

## 🔧 Utilisation

### Import du module

```typescript
import {
  DemandesSidebar,
  DemandesContentRouter,
  useDemandesStats,
  useDemandesData,
  demandesNavigationConfig,
} from '@/modules/demandes';
```

### Utilisation dans une page

```typescript
'use client';

import { DemandesSidebar, DemandesContentRouter } from '@/modules/demandes';
import { useState } from 'react';

export default function DemandesPage() {
  const [activeCategory, setActiveCategory] = useState('overview');
  const [activeSubCategory, setActiveSubCategory] = useState<string>();

  return (
    <div className="flex h-screen">
      <DemandesSidebar
        activeCategory={activeCategory}
        activeSubCategory={activeSubCategory}
        onCategoryChange={setActiveCategory}
        stats={{ pending: 45, urgent: 12, overdue: 8 }}
      />
      <main className="flex-1">
        <DemandesContentRouter
          mainCategory={activeCategory}
          subCategory={activeSubCategory}
        />
      </main>
    </div>
  );
}
```

### Utilisation des hooks

```typescript
import { useDemandesStats, useDemandesData, useDemandesFilters } from '@/modules/demandes';

function MyComponent() {
  const { data: stats, isLoading } = useDemandesStats();
  const { data: demandes } = useDemandesData();
  const { filters, setStatus } = useDemandesFilters();

  // ...
}
```

## 📊 Architecture

### Navigation
- **Catégories principales**: `overview`, `statut`, `actions`, `services`
- **Sous-catégories**: Définies dans `demandesNavigationConfig.ts`
- **Badges dynamiques**: Basés sur les stats en temps réel

### State Management
- **Zustand**: Filtres et période
- **React Query**: Données serveur (stats, demandes, tendances)

### API
- **Axios**: Appels API REST
- **Endpoints**: `/api/demandes/*`
- **Types**: Types TypeScript partagés

## 🎨 Design

- **Thème**: Dark mode (slate colors)
- **Icônes**: Lucide React
- **Animations**: Transitions TailwindCSS
- **Responsive**: Mobile-first design

## 🔄 Prochaines Étapes

1. Implémenter les pages manquantes (Stats, Trends, Statut, Actions, Services)
2. Créer les composants UI manquants (Charts, Panels)
3. Intégrer dans la page principale `/maitre-ouvrage/demandes`
4. Ajouter routes API si nécessaire
5. Tests unitaires et intégration

