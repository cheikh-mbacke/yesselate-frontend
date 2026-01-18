# Module Validation-Contrats - Maître d'Ouvrage

Module complet de validation des contrats pour le portail Maître d'Ouvrage, avec navigation hiérarchique, indicateurs en temps réel, statistiques et tendances.

## 📁 Structure

```
src/modules/validation-contrats/
├── navigation/
│   ├── contratsNavigationConfig.ts    # Configuration navigation hiérarchique
│   ├── ContratsSidebar.tsx            # Sidebar navigation collapsible
│   └── index.ts
├── pages/
│   ├── overview/
│   │   ├── IndicateursPage.tsx        # Indicateurs en temps réel
│   │   ├── StatsPage.tsx              # Statistiques détaillées
│   │   ├── TrendsPage.tsx             # Tendances
│   │   └── index.ts
│   ├── statut/
│   │   ├── EnAttentePage.tsx          # Contrats en attente
│   │   ├── UrgentsPage.tsx            # Contrats urgents
│   │   ├── ValidesPage.tsx            # Contrats validés
│   │   ├── RejetesPage.tsx            # Contrats rejetés
│   │   ├── NegociationPage.tsx        # Contrats en négociation
│   │   └── index.ts
│   ├── priorite/
│   │   ├── CritiquesPage.tsx          # Contrats critiques
│   │   ├── MoyensPage.tsx             # Contrats moyens
│   │   ├── FaiblePrioritePage.tsx     # Contrats faible priorité
│   │   └── index.ts
│   └── analyse/
│       ├── AnalyticsPage.tsx           # Analytics
│       ├── VueFinancierePage.tsx      # Vue financière
│       ├── DocumentsPage.tsx           # Documents liés
│       ├── ReglesMetierPage.tsx        # Règles métier
│       └── index.ts
├── components/
│   ├── ContratsHeader.tsx             # En-tête avec recherche
│   ├── KpiPanel.tsx                   # Panel KPI
│   ├── TrendsChart.tsx                 # Graphique de tendances
│   ├── ContratCard.tsx                # Carte de contrat
│   ├── FilterBar.tsx                   # Barre de filtres
│   └── index.ts
├── hooks/
│   ├── useContratsStats.ts            # Hook statistiques
│   ├── useContratsFilters.ts          # Hook filtres (Zustand)
│   ├── useContratsData.ts             # Hook données
│   └── index.ts
├── api/
│   └── contratsApi.ts                 # API layer (Axios)
├── stores/
│   └── contratsFiltersStore.ts        # Store Zustand pour filtres
├── types/
│   └── contratsTypes.ts               # Types TypeScript
├── data/
│   └── contratsMock.ts                # Données mock
└── index.ts                            # Exports principaux
```

## 🎯 Fonctionnalités

### Navigation hiérarchique

1. **Niveau 1 (Catégories principales)** :
   - Vue d'ensemble
   - Par statut
   - Contrats à valider (par priorité)
   - Analyse & gouvernance

2. **Niveau 2 (Sous-catégories)** :
   - Vue d'ensemble : Indicateurs, Statistiques, Tendances
   - Par statut : En attente, Urgents, Validés, Rejetés, Négociation
   - Contrats à valider : Critiques, Moyens, Faible priorité
   - Analyse : Analytics, Vue financière, Documents, Règles métier

### Indicateurs en temps réel

- Total contrats
- En attente
- Validés ce mois
- Taux de validation

### Statistiques

- Répartition par statut
- Répartition par type
- Métriques financières
- Délai moyen de validation

### Tendances

- Évolution temporelle des contrats
- Graphiques de tendances (Chart.js/Recharts)

## 🔧 Utilisation

### Import du module

```typescript
import {
  ContratsSidebar,
  IndicateursPage,
  useContratsStats,
  useContratsData,
} from '@/modules/validation-contrats';
```

### Utilisation des hooks

```typescript
// Statistiques
const { data: stats, isLoading } = useContratsStats();

// Données des contrats
const { data: response } = useContratsData();

// Contrats par statut
const { data: contrats } = useContratsByStatut('EN_ATTENTE');

// Contrats par priorité
const { data: contrats } = useContratsByPriorite('CRITICAL');

// Tendances
const { data: trends } = useContratsTrends('month');
```

### Utilisation des filtres

```typescript
import { useContratsFilters } from '@/modules/validation-contrats';

const filters = useContratsFilters();

// Définir des filtres
filters.setStatuts(['EN_ATTENTE', 'URGENT']);
filters.setTypes(['FOURNITURE', 'TRAVAUX']);
filters.setRecherche('Dakar Arena');

// Réinitialiser
filters.resetFilters();
```

## 📊 Types

Les types principaux sont définis dans `types/contratsTypes.ts` :

- `Contrat` : Structure d'un contrat
- `ContratsStats` : Statistiques globales
- `ContratsFilters` : Filtres de recherche
- `TendancesContrats` : Données de tendances
- `StatutContrat`, `TypeContrat`, `PrioriteContrat` : Enums

## 🔌 API

L'API layer utilise Axios avec fallback sur mock data en développement :

- `getContrats(filters?)` : Récupère tous les contrats
- `getContratById(id)` : Récupère un contrat par ID
- `getContratsStats(filters?)` : Récupère les statistiques
- `getContratsTrends(periode)` : Récupère les tendances
- `getContratsByStatut(statut, filters?)` : Contrats par statut
- `getContratsByPriorite(priorite, filters?)` : Contrats par priorité
- `validerContrat(action)` : Valide un contrat
- `rejeterContrat(action)` : Rejette un contrat
- `bulkActionContrats(action)` : Actions en masse

## 🎨 Composants

### ContratsHeader
En-tête avec recherche et actions (filtres, export).

### KpiPanel
Panel d'indicateur clé avec icône, valeur, changement et couleur.

### TrendsChart
Graphique de tendances (à intégrer avec Chart.js ou Recharts).

### ContratCard
Carte d'affichage d'un contrat avec toutes les informations.

### FilterBar
Barre de filtres actifs avec badges supprimables.

## 🚀 Technologies

- **React** + **TypeScript**
- **Zustand** pour les filtres et la période
- **Chart.js** ou **Recharts** pour les graphiques
- **TailwindCSS** / **ShadCN UI** pour le style
- **Axios** pour les appels API
- **Lucide Icons** pour les icônes
- **React Query** pour la gestion des données

## 📝 Notes

- Les données mock sont utilisées en développement ou si l'API n'est pas disponible
- Le store Zustand persiste les filtres dans localStorage
- Les hooks utilisent React Query pour le cache et la synchronisation
- La navigation est hiérarchique avec support des badges dynamiques

