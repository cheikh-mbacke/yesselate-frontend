# Module Alertes & Risques

Module complet de gestion des alertes et risques avec navigation hiérarchique à 3 niveaux.

## 📁 Structure

```
src/modules/alertes/
├── types/
│   └── alertesTypes.ts          # Types TypeScript complets
├── navigation/
│   ├── alertesNavigationConfig.ts  # Configuration navigation hiérarchique
│   ├── AlertesSidebar.tsx          # Sidebar principale
│   └── AlertesSubNavigation.tsx    # Sous-navigation
├── api/
│   └── alertesApi.ts               # API mock avec données réalistes
├── hooks/
│   ├── useAlertes.ts               # Hook principal
│   ├── useAlertesStats.ts          # Hook statistiques
│   ├── useAlertesByType.ts         # Hooks par type
│   └── index.ts                    # Exports centralisés
├── pages/
│   ├── OverviewIndicateurs.tsx      # Exemple page niveau 3
│   ├── CritiquesPaiementsBloques.tsx # Exemple page niveau 3
│   └── index.ts                     # Exports centralisés
└── README.md                        # Documentation
```

## 🎯 Fonctionnalités

### Navigation hiérarchique à 3 niveaux

1. **Niveau 1 (Onglets)** : Vue d'ensemble, Alertes en cours, Traitements, Gouvernance
2. **Niveau 2 (Sous-onglets)** : Critiques, Avertissements, SLA dépassés, etc.
3. **Niveau 3 (Sous-sous-onglets)** : Paiements bloqués, Validations bloquées, etc.

### Store Zustand

- Gestion centralisée de l'état
- Persistance dans localStorage
- Navigation avec historique
- Filtres et sélections
- Modals et panels

### Hooks React Query

- `useAlertes(filtres?)` : Récupère toutes les alertes
- `useAlerte(id)` : Récupère une alerte par ID
- `useAlertesStats(filtres?)` : Récupère les statistiques
- `useAlertesByTypologie(typologie, filtres?)` : Alertes par typologie
- `useAlertesBySeverite(severite, filtres?)` : Alertes par sévérité
- `useAlertesByStatut(statut, filtres?)` : Alertes par statut

### API Mock

- Données réalistes pour le développement
- Simulation de délais réseau
- Filtres fonctionnels
- Actions (acquitter, résoudre, escalader)

## 🚀 Utilisation

### Page principale

```tsx
import { AlertesPage } from '@/app/(portals)/maitre-ouvrage/alertes/page';
```

### Utiliser les hooks

```tsx
import { useAlertes, useAlertesStats } from '@/modules/alertes/hooks';

function MyComponent() {
  const { data: alertes, isLoading } = useAlertes();
  const { data: stats } = useAlertesStats();
  
  // ...
}
```

### Utiliser le store

```tsx
import { useAlertesCommandCenterStore } from '@/lib/stores/alertesCommandCenterStore';

function MyComponent() {
  const { navigation, navigate } = useAlertesCommandCenterStore();
  
  // Naviguer vers une catégorie
  navigate('en-cours', 'critiques', 'paiements-bloques');
}
```

## 📊 Types

Tous les types sont définis dans `types/alertesTypes.ts` :

- `Alerte` : Structure complète d'une alerte
- `AlerteSeverite` : 'critical' | 'warning' | 'info' | 'success'
- `AlerteStatut` : 'pending' | 'acknowledged' | 'in_progress' | 'resolved' | 'escalated' | 'ignored' | 'recurring'
- `AlerteTypologie` : Toutes les typologies d'alertes
- `AlerteStats` : Statistiques complètes
- `AlerteFiltres` : Filtres disponibles

## 🎨 Navigation

La navigation est configurée dans `navigation/alertesNavigationConfig.ts` avec :

- Structure hiérarchique complète
- Icônes Lucide React
- Badges dynamiques
- Routes Next.js

## 🔧 Configuration

### Ajouter une nouvelle page

1. Créer le fichier dans `pages/`
2. Exporter depuis `pages/index.ts`
3. Ajouter la route dans `alertesNavigationConfig.ts`
4. Créer le routing dans la page principale

### Ajouter une nouvelle typologie

1. Ajouter dans `AlerteTypologie` dans `types/alertesTypes.ts`
2. Ajouter les données mock dans `api/alertesApi.ts`
3. Mettre à jour la navigation si nécessaire

## 📝 Notes

- Le module utilise React Query pour la gestion des données
- Zustand pour l'état global
- TailwindCSS pour le styling
- Lucide React pour les icônes
- Architecture identique au module Analytics BTP

