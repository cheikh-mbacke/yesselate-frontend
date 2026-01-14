# Module Calendrier & Planification

Module de pilotage temporel transversal pour YESSELATE BMO.

## 📁 Structure des fichiers

```
src/components/features/bmo/calendrier/
├── README.md                 # Documentation
├── api/
│   └── client.ts            # Client API (mocks => points d'extension API)
├── utils/
│   ├── sla.ts               # Calculs SLA (risque/retard)
│   └── conflicts.ts         # Détection de conflits
├── components/              # Composants réutilisables
│   ├── CalendrierInteractif.tsx
│   ├── FiltresAvances.tsx
│   ├── KPICard.tsx          # (À créer)
│   ├── AlertsPanel.tsx      # (À créer)
│   ├── QuickActions.tsx     # (À créer)
│   ├── FiltersBar.tsx       # (À créer)
│   ├── EventsTable.tsx      # (À créer)
│   └── CalendarView.tsx     # (À créer) FullCalendar (mois/semaine/jour, drag&drop)
├── mocks/
│   └── events.mock.ts       # Jeux d'essai (projets, validations, RH, ops)
├── modals/                  # Modales du module
│   ├── CreerEvenementModal.tsx
│   ├── ReplanifierModal.tsx
│   ├── ResoudreConflitModal.tsx
│   └── TraiterSLAModal.tsx
└── views/                   # Vues par onglet
    ├── VueEnsembleView.tsx
    ├── SLARetardsView.tsx
    ├── ConflitsView.tsx
    ├── EcheancesOperationnellesView.tsx
    ├── JalonsProjetsView.tsx
    ├── RHAbsencesView.tsx
    ├── InstancesReunionsView.tsx
    └── PlanificationIAView.tsx
```

## 🔧 Utilitaires

### `utils/sla.ts`
Calculs de Service Level Agreement (SLA) :
- Calcul du statut SLA (ok, warning, at-risk, overdue, blocked)
- Calcul des statistiques SLA
- Filtrage par statut SLA

### `utils/conflicts.ts`
Détection de conflits temporels :
- Détection de chevauchements
- Détection de conflits de ressources (assignees)
- Suggestions de résolutions

### `api/client.ts`
Client API avec points d'extension :
- `listEvents()` - Liste des événements
- `createEvent()` - Création d'événement
- `detectConflicts()` - Détection de conflits
- `getStats()` - Statistiques

### `mocks/events.mock.ts`
Jeux d'essai pour développement :
- Événements projets
- Événements validations
- Événements RH & absences
- Événements opérationnels
- Événements en retard
- Helpers : `getTodayEvents()`, `getWeekEvents()`, `getOverdueEvents()`, `getConflictedEvents()`

## 🎯 Composants (À créer)

Les composants suivants sont prévus mais pas encore implémentés :

- **KPICard.tsx** - Carte d'indicateur KPI
- **AlertsPanel.tsx** - Panneau d'alertes
- **QuickActions.tsx** - Actions rapides
- **FiltersBar.tsx** - Barre de filtres
- **EventsTable.tsx** - Tableau d'événements
- **CalendarView.tsx** - Vue calendrier (FullCalendar avec mois/semaine/jour, drag&drop)

## 📝 Usage

```typescript
import { calendrierAPI } from '@/components/features/bmo/calendrier/api/client';
import { calculateSLA } from '@/components/features/bmo/calendrier/utils/sla';
import { detectConflicts } from '@/components/features/bmo/calendrier/utils/conflicts';
import { mockEvents } from '@/components/features/bmo/calendrier/mocks/events.mock';

// Utiliser l'API
const events = await calendrierAPI.listEvents();

// Calculer SLA
const sla = calculateSLA(dueDate, new Date());

// Détecter conflits
const conflicts = detectConflicts(events);
```

