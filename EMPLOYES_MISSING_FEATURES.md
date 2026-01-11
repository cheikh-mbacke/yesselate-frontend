# 📋 EMPLOYÉS - Analyse des Fonctionnalités Manquantes

## ✅ Ce qui existe déjà

### Composants de base
- ✅ `EmployesCommandSidebar` - Sidebar avec 9 catégories
- ✅ `EmployesSubNavigation` - Navigation secondaire avec breadcrumb
- ✅ `EmployesKPIBar` - Barre de KPIs avec 8 indicateurs
- ✅ `EmployesContentRouter` - Router de contenu
- ✅ `ActionsMenu` - Menu d'actions consolidé
- ✅ `employesApiService` - Service API (mais avec mock data basique)

### Modals existants
- ✅ `EmployeeDetailModal` - Modal overlay moderne (dans `modals/`)
- ✅ `EmployesModals` - Gestionnaire de modals (export, settings, shortcuts, etc.)
- ✅ `EmployesStatsModal` - Modal de statistiques
- ✅ `EmployeesHelpModal` - Modal d'aide

### Stores
- ✅ `useEmployesWorkspaceStore` - Store pour l'ancien workspace pattern
- ❌ **PAS DE** `useEmployesCommandCenterStore` - Store pour command-center (état local actuellement)

---

## ❌ Fonctionnalités manquantes (comparé à Analytics)

### 1. **Store Command Center** ❌ CRITIQUE

**Problème**: Actuellement, l'état est géré localement dans la page, pas de store centralisé comme Analytics.

**Solution**: Créer `src/lib/stores/employesCommandCenterStore.ts`

**Fonctionnalités à inclure**:
```typescript
interface EmployesCommandCenterState {
  // Navigation
  navigation: { mainCategory, subCategory, filter }
  navigationHistory: []
  
  // UI State
  sidebarCollapsed, fullscreen, commandPaletteOpen, notificationsPanelOpen
  
  // Modal & Detail Panel
  modal: { type, isOpen, data }
  detailPanel: { isOpen, type, entityId, data }  // NOUVEAU
  
  // Filtres
  filters: EmployesActiveFilters
  savedFilters: []
  
  // KPIs
  kpiConfig: { visible, collapsed, refreshInterval, autoRefresh }
  
  // Sélections (pour batch actions)
  selectedItems: string[]  // NOUVEAU
  
  // Actions
  navigate, goBack, openModal, closeModal
  openDetailPanel, closeDetailPanel  // NOUVEAU
  selectItem, clearSelection, toggleSelection  // NOUVEAU
  setFilter, resetFilters
}
```

---

### 2. **EmployesDetailPanel** ❌ IMPORTANT

**Problème**: Pas de panel latéral pour vue rapide (comme `AnalyticsDetailPanel`).

**Pattern à suivre**: Panel slide-in depuis la droite pour voir les détails sans quitter la liste.

**Usage**:
```tsx
// Depuis une liste d'employés
openDetailPanel('employee', employeeId, { name, position, status, ... })

// Le panel affiche un aperçu rapide
// Bouton "Ouvrir en modal complète" pour voir tous les détails
```

**Fichier à créer**: `src/components/features/bmo/workspace/employes/command-center/EmployesDetailPanel.tsx`

---

### 3. **EmployesFiltersPanel** ❌ IMPORTANT

**Problème**: Pas de panneau de filtres avancés (comme `AnalyticsFiltersPanel`).

**Filtres à inclure**:
- **Statut**: Actif, En congés, En mission, Inactif
- **Départements**: BTP, Finance, RH, IT, etc.
- **Types de contrat**: CDI, CDD, Stage, Intérim
- **Bureaux**: BTP, BJ, BS, BME
- **Performances**: Excellent, Bon, À améliorer
- **Période**: Date d'embauche, Date de fin de contrat
- **Recherche**: Nom, Matricule, Poste
- **SPOF**: Oui/Non
- **Score de risque**: Min/Max

**Fichier à créer**: `src/components/features/bmo/workspace/employes/command-center/EmployesFiltersPanel.tsx`

---

### 4. **EmployesBatchActionsBar** ❌ IMPORTANT

**Problème**: Pas de barre d'actions groupées pour les sélections multiples.

**Actions à inclure**:
- Exporter (Export)
- Assigner à un projet (Assign)
- Évaluer (Evaluate)
- Archiver (Archive)
- Marquer SPOF (Mark SPOF)
- Supprimer (Delete)

**Fichier à créer**: `src/components/features/bmo/workspace/employes/command-center/EmployesBatchActionsBar.tsx`

---

### 5. **Hooks API React Query** ❌ IMPORTANT

**Problème**: Pas de hooks React Query pour la gestion des données (comme `useAnalytics`).

**Hooks à créer**: `src/lib/api/hooks/useEmployes.ts`

```typescript
// Hooks à implémenter
export function useEmployes(filters?: EmployesFilters)
export function useEmployeById(id: string)
export function useEmployesStats()
export function useEmployesByDepartment(department: string)
export function useEmployesSPOF()
export function useEmployesEvaluations()
```

---

### 6. **ContentRouter - Vues détaillées** ❌ MOYEN

**Problème**: `EmployesContentRouter` affiche seulement des placeholders pour les catégories non-overview.

**Vues à implémenter**:
- `AllEmployeesView` - Liste complète avec filtres
- `DepartmentsView` - Vue par département
- `SkillsView` - Vue par compétences
- `PerformanceView` - Vue par performance
- `EvaluationsView` - Vue des évaluations
- `ContractsView` - Vue des contrats
- `AbsencesView` - Vue des absences
- `SPOFView` - Vue des SPOFs

**Pattern**: Chaque vue devrait:
- Afficher une liste/grid d'employés
- Permettre la sélection (checkbox)
- Ouvrir le detail panel au clic
- Support batch actions

---

### 7. **Integration EmployeeDetailModal** ❌ IMPORTANT

**Problème**: `EmployeeDetailModal` existe mais n'est pas intégré dans le pattern command-center.

**Solution**: 
- Intégrer dans `EmployesModals` avec type `'employee-detail'`
- Connecter avec `EmployesDetailPanel` (panel → modal)
- Ajouter navigation prev/next depuis les listes

---

### 8. **Mock Data Complet** ❌ MOYEN

**Problème**: Les mock data dans `employesApiService` sont basiques.

**Données à créer**:
- 50-100 employés réalistes
- Données de départements
- Données d'évaluations
- Données de contrats
- Données d'absences
- Données de compétences
- Historique de performances

**Fichier à créer**: `src/lib/data/employes-mock-data.ts`

---

### 9. **Notifications Panel** ✅ EXISTE mais ❌ À améliorer

**Problème**: `EmployesNotificationPanel` existe mais pourrait être plus complet.

**Améliorations**:
- Notifications temps réel pour les changements d'état
- Notifications pour évaluations en attente
- Notifications pour contrats expirant
- Notifications pour absences non planifiées

---

## 🎯 Priorités d'implémentation

### Priorité 1 (CRITIQUE) - Fondations
1. ✅ Store Command Center (`employesCommandCenterStore`)
2. ✅ EmployesDetailPanel
3. ✅ EmployesFiltersPanel
4. ✅ EmployesBatchActionsBar

### Priorité 2 (IMPORTANT) - Expérience utilisateur
5. ✅ Hooks API React Query
6. ✅ Integration EmployeeDetailModal
7. ✅ ContentRouter - Vues détaillées (au moins 2-3 vues principales)

### Priorité 3 (MOYEN) - Données et détails
8. ✅ Mock Data complet
9. ✅ Amélioration Notifications Panel

---

## 📝 Structure finale souhaitée

```
src/components/features/bmo/workspace/employes/command-center/
├── EmployesCommandSidebar.tsx        ✅
├── EmployesSubNavigation.tsx          ✅
├── EmployesKPIBar.tsx                 ✅
├── EmployesContentRouter.tsx          ✅ (mais incomplet)
├── EmployesDetailPanel.tsx            ❌ À créer
├── EmployesFiltersPanel.tsx           ❌ À créer
├── EmployesBatchActionsBar.tsx        ❌ À créer
├── ActionsMenu.tsx                    ✅
└── index.ts                           ✅

src/lib/stores/
├── employesWorkspaceStore.ts          ✅ (ancien pattern)
└── employesCommandCenterStore.ts      ❌ À créer

src/lib/api/hooks/
└── useEmployes.ts                     ❌ À créer

src/lib/data/
└── employes-mock-data.ts              ❌ À créer
```

---

## 🔍 Points à vérifier

### Onglets et sous-onglets
- ✅ **Sidebar**: 9 catégories bien définies
- ✅ **SubNavigation**: Sous-catégories par catégorie principale
- ⚠️ **Filtres niveau 3**: Définis mais pas encore implémentés dans le UI

### Modals et Pop-ups
- ✅ **EmployeeDetailModal**: Existe et bien structuré
- ✅ **EmployesModals**: Gestionnaire de modals
- ❌ **Integration**: Pas encore connecté au pattern command-center
- ❌ **DetailPanel**: Manquant (nécessaire pour le pattern modal overlay)

### API et Données
- ✅ **employesApiService**: Existe
- ❌ **React Query Hooks**: Manquants
- ❌ **Mock Data**: Basique, besoin de données plus complètes

---

## ✨ Pattern Modal Overlay (comme mentionné)

Pour implémenter correctement le pattern modal overlay:

1. **Detail Panel** (vue rapide) → Ouvre depuis une liste
2. **Modal Complète** (vue détaillée) → Ouvre depuis le panel ou directement

**Flux utilisateur**:
```
Liste d'employés
  ↓ (clic)
Detail Panel (panneau latéral)
  ↓ (bouton "Voir plus")
Modal Overlay Complète (EmployeeDetailModal)
```

Ce pattern est **beaucoup plus efficace** que de naviguer vers une nouvelle page car:
- ✅ Contexte préservé (liste visible en arrière-plan)
- ✅ Navigation rapide (fermer et ouvrir un autre item)
- ✅ UX moderne et fluide
- ✅ Multitâche possible

