# Module Centre de Commande – Gouvernance

Module complet de gouvernance pour le Centre de Commande, avec tableau de bord exécutif, indicateurs en temps réel, synthèses, points d'attention, arbitrages, instances et conformité.

## 📁 Structure

```
src/modules/gouvernance/
├── api/
│   └── gouvernanceApi.ts          # Appels API avec Axios
├── components/
│   ├── GouvernanceHeader.tsx      # Header avec breadcrumb
│   ├── KpiPanel.tsx               # Panel KPI en temps réel
│   ├── TendancesChart.tsx         # Graphiques de tendances (Chart.js)
│   ├── PointsAttentionPanel.tsx   # Panel points d'attention
│   ├── QuickActionsPanel.tsx      # Actions rapides
│   └── index.ts
├── hooks/
│   ├── useGouvernanceStats.ts     # Hook pour les statistiques
│   ├── useGouvernanceFilters.ts   # Hook pour les filtres
│   ├── useGouvernanceData.ts      # Hook pour les données par section
│   └── index.ts
├── navigation/
│   ├── gouvernanceNavigationConfig.ts  # Configuration navigation
│   ├── GouvernanceSidebar.tsx     # Sidebar hiérarchique
│   └── index.ts
├── pages/
│   ├── dashboard/                 # Pages vue stratégique
│   │   ├── TableauBordPage.tsx
│   │   ├── TendancesPage.tsx
│   │   ├── SyntheseProjetsPage.tsx
│   │   ├── SyntheseBudgetPage.tsx
│   │   ├── SyntheseJalonsPage.tsx
│   │   ├── SyntheseRisquesPage.tsx
│   │   └── SyntheseValidationsPage.tsx
│   ├── attention/                 # Pages points d'attention
│   │   ├── DepassementsBudgetPage.tsx
│   │   ├── RetardsCritiquesPage.tsx
│   │   ├── RessourcesIndispoPage.tsx
│   │   └── EscaladesPage.tsx
│   ├── arbitrages/                # Pages arbitrages
│   │   ├── DecisionsValideesPage.tsx
│   │   ├── ArbitragesEnAttentePage.tsx
│   │   └── HistoriqueDecisionsPage.tsx
│   ├── instances/                 # Pages instances
│   │   ├── ReunionsDGPage.tsx
│   │   ├── ReunionsMOAMOEPage.tsx
│   │   └── ReunionsTransversesPage.tsx
│   └── conformite/                # Pages conformité
│       ├── IndicateursConformitePage.tsx
│       ├── AuditGouvernancePage.tsx
│       └── SuiviEngagementsPage.tsx
├── stores/
│   └── governanceFiltersStore.ts  # Store Zustand pour filtres
├── types/
│   └── governanceTypes.ts        # Types TypeScript
├── index.ts                       # Export principal
└── README.md
```

## 🚀 Utilisation

### Import des composants

```typescript
import { GouvernanceSidebar, KpiPanel, TendancesChart } from '@/modules/gouvernance';
```

### Utilisation du store

```typescript
import { useGouvernanceFiltersStore } from '@/modules/gouvernance';

function MyComponent() {
  const { periode, setPeriode, stats } = useGouvernanceFiltersStore();
  // ...
}
```

### Utilisation des hooks

```typescript
import { useGouvernanceStats, useGouvernanceData } from '@/modules/gouvernance';

function MyComponent() {
  const { stats, isLoading } = useGouvernanceStats();
  const { data } = useGouvernanceData('executive-dashboard');
  // ...
}
```

## 📊 Fonctionnalités

### Vue stratégique
- **Tableau de bord exécutif** : Vue synthétique avec KPI, tendances et points d'attention
- **Tendances mensuelles** : Graphiques d'évolution (Chart.js)
- **Synthèses** : Projets, Budget, Jalons, Risques, Validations

### Points d'attention
- Dépassements budgétaires
- Retards critiques
- Ressources indisponibles
- Escalades en cours

### Arbitrages & décisions
- Décisions validées
- Arbitrages en attente
- Historique des décisions

### Instances de coordination
- Réunions DG
- Réunions MOA/MOE
- Réunions transverses

### Conformité & performance
- Indicateurs conformité
- Audit gouvernance
- Suivi des engagements

## 🎨 Technologies

- **React + TypeScript** : Framework et typage
- **Zustand** : Gestion d'état (filtres et période)
- **Chart.js** : Graphiques de tendances
- **TailwindCSS** : Styles
- **Axios** : Appels API
- **Lucide Icons** : Icônes

## 🔧 Configuration

### Variables d'environnement

```env
NEXT_PUBLIC_API_URL=/api
```

### Routes API attendues

Le module s'attend à des routes API sous `/api/gouvernance/` :

- `GET /api/gouvernance/overview` - Vue d'ensemble
- `GET /api/gouvernance/stats` - Statistiques
- `GET /api/gouvernance/tendances` - Tendances mensuelles
- `GET /api/gouvernance/synthese/*` - Synthèses
- `GET /api/gouvernance/attention/*` - Points d'attention
- `GET /api/gouvernance/arbitrages/*` - Arbitrages
- `GET /api/gouvernance/instances/*` - Instances
- `GET /api/gouvernance/conformite/*` - Conformité

## 📝 Notes

- Les filtres sont persistés dans le localStorage via Zustand
- Les badges dans la navigation sont calculés depuis les statistiques
- Les graphiques utilisent Chart.js avec react-chartjs-2
- Le design suit le système de design de l'application (slate-950, white/5, etc.)

