# 📅 Module Calendrier & Planification v3.0

Module complet de gestion du calendrier et de la planification pour l'ERP BTP/BMO.

## 🏗️ Structure

```
src/modules/calendrier/
├── navigation/
│   ├── calendrierNavigationConfig.ts    # Configuration de navigation
│   └── CalendrierSidebar.tsx            # Sidebar de navigation
├── types/
│   └── calendrierTypes.ts                # Types TypeScript
├── stores/
│   └── calendrierFiltersStore.ts         # Store Zustand pour filtres et stats
├── hooks/
│   ├── useCalendrierFilters.ts           # Hook pour les filtres
│   ├── useCalendrierData.ts              # Hook pour les données
│   └── useCalendrierSyncStatus.ts        # Hook pour le statut de sync
├── api/
│   └── calendrierApi.ts                  # Service API (Axios)
├── components/
│   ├── CalendarHeader.tsx                 # Header avec breadcrumb
│   ├── CalendarViewSwitcher.tsx          # Switcher de vues
│   ├── PeriodSelector.tsx                # Sélecteur de période
│   ├── AlertsSummaryPanel.tsx            # Panneau d'alertes
│   ├── QuickActionsPanel.tsx            # Panneau d'actions rapides
│   ├── ControlStationPanel.tsx           # Poste de contrôle
│   ├── GanttChart.tsx                    # Vue Gantt
│   ├── CalendarGrid.tsx                  # Vue Calendrier
│   └── TimelineView.tsx                  # Vue Timeline
└── pages/
    ├── overview/                         # Pages vue d'ensemble
    ├── gantt/                            # Pages Gantt
    ├── timeline/                         # Pages Timeline
    ├── jalons/                           # Pages Jalons
    ├── absences/                         # Pages Absences
    └── evenements/                       # Pages Événements
```

## 🚀 Utilisation

### Import des composants

```typescript
import { CalendrierSidebar, CalendarHeader, useCalendrierFilters } from '@/modules/calendrier';
```

### Utilisation du store

```typescript
import { useCalendrierFiltersStore } from '@/modules/calendrier';

function MyComponent() {
  const { periode, vue, setPeriode, setVue } = useCalendrierFiltersStore();
  // ...
}
```

### Utilisation des hooks

```typescript
import { useCalendrierData, useCalendrierFilters } from '@/modules/calendrier';

function MyComponent() {
  const { getFilters } = useCalendrierFilters();
  const { data, loading, error } = useCalendrierData(getFilters());
  // ...
}
```

## 📋 Routes disponibles

- `/maitre-ouvrage/calendrier/vue-ensemble` - Vue d'ensemble
- `/maitre-ouvrage/calendrier/vue-ensemble/global` - Calendrier global
- `/maitre-ouvrage/calendrier/vue-ensemble/chantier` - Vue par chantier
- `/maitre-ouvrage/calendrier/gantt/global` - Gantt global
- `/maitre-ouvrage/calendrier/gantt/chantier` - Gantt par chantier
- `/maitre-ouvrage/calendrier/timeline/global` - Timeline global
- `/maitre-ouvrage/calendrier/timeline/chantier` - Timeline par chantier
- `/maitre-ouvrage/calendrier/jalons/sla-risque` - Jalons SLA à risque
- `/maitre-ouvrage/calendrier/jalons/retards` - Jalons en retard
- `/maitre-ouvrage/calendrier/jalons/a-venir` - Jalons à venir
- `/maitre-ouvrage/calendrier/absences/global` - Absences vue globale
- `/maitre-ouvrage/calendrier/absences/equipe` - Absences par équipe
- `/maitre-ouvrage/calendrier/absences/chantier` - Absences par chantier
- `/maitre-ouvrage/calendrier/evenements/internes` - Événements internes
- `/maitre-ouvrage/calendrier/evenements/reunions-projets` - Réunions projets
- `/maitre-ouvrage/calendrier/evenements/reunions-decisionnelles` - Réunions décisionnelles

## 🔧 Configuration

### Navigation

La configuration de navigation est définie dans `calendrierNavigationConfig.ts` :

```typescript
export const calendrierNavigation: CalendrierNavItem[] = [
  {
    label: "Calendrier",
    icon: "CalendarDays",
    children: [
      // ...
    ]
  },
  // ...
];
```

### API

Les endpoints API sont configurés dans `calendrierApi.ts`. Par défaut, ils pointent vers `/api/calendrier/*`.

## 📊 Fonctionnalités

### Vues multiples
- **Gantt** : Vue Gantt (placeholder, à intégrer avec une librairie)
- **Calendrier** : Vue calendrier classique (mois/semaine/trimestre)
- **Timeline** : Vue timeline horizontale

### Filtres
- Période : Semaine / Mois / Trimestre
- Vue : Gantt / Calendrier / Timeline
- Chantier sélectionné
- Équipe sélectionnée
- Plage de dates

### Alertes
- Jalons SLA à risque
- Retards détectés
- Sur-allocation ressources

### Synchronisation
- Poste de contrôle avec statut de synchronisation des modules :
  - Demandes
  - Validations
  - Projets
  - RH

## 🎨 Composants

### CalendarHeader
Header avec titre, breadcrumb automatique, et contrôles (switcher de vue, sélecteur de période).

### AlertsSummaryPanel
Affiche 3 cartes d'alertes avec compteurs et boutons d'action.

### QuickActionsPanel
Panneau d'actions rapides (créer événement, ajouter absence, etc.).

### ControlStationPanel
Poste de contrôle affichant l'état de synchronisation avec les autres modules.

## 🔌 Intégration

Le module est prêt à être intégré avec :
- Backend API (endpoints `/api/calendrier/*`)
- Librairie Gantt (à intégrer dans `GanttChart.tsx`)
- Autres modules de l'ERP (Demandes, Validations, Projets, RH)

## 📝 Notes

- Le composant `GanttChart` est un placeholder et nécessite l'intégration d'une vraie librairie Gantt
- Les données sont récupérées via Axios depuis l'API
- Le store Zustand persiste les filtres dans le localStorage
- Tous les composants sont typés avec TypeScript

