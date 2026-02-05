# 📊 Analyse Complète des Emplacements et Interactions - Dashboard BMO

**Date:** $(date)
**Scope:** Dashboard BMO - Tous les composants, interactions et flux de données

---

## 📋 Table des Matières

1. [Architecture Globale](#architecture-globale)
2. [Composants Principaux](#composants-principaux)
3. [Flux de Données](#flux-de-données)
4. [Interactions Utilisateur](#interactions-utilisateur)
5. [Store Zustand](#store-zustand)
6. [Modals System](#modals-system)
7. [Navigation System](#navigation-system)
8. [API Integration](#api-integration)
9. [Points d'Attention](#points-dattention)
10. [Recommandations](#recommandations)

---

## 🏗️ Architecture Globale

### Structure des Fichiers

```
app/(portals)/maitre-ouvrage/dashboard/
├── page.tsx                          # Point d'entrée principal
│   ├── DashboardPage()               # Wrapper avec Suspense
│   └── DashboardContent()            # Composant principal
│
src/components/features/bmo/dashboard/command-center/
├── DashboardModals.tsx               # Routeur de modals centralisé
├── KPIAdvancedModal.tsx              # Modal KPI avancé
├── KPIComparisonModal.tsx            # Modal comparaison KPIs
├── KPIAlertsSystem.tsx               # Système d'alertes KPI
├── DashboardKPIBar.tsx               # Barre de KPIs
├── DashboardCommandPalette.tsx       # Palette de commandes
├── DashboardContentRouter.tsx        # Routeur de contenu (ancien)
├── DashboardSidebar.tsx              # Sidebar navigation
├── DashboardSubNavigation.tsx       # Sub-navigation
├── views/
│   ├── OverviewView.tsx
│   ├── PerformanceView.tsx
│   ├── ActionsView.tsx
│   ├── RisksView.tsx
│   ├── DecisionsView.tsx
│   └── RealtimeView.tsx
└── charts/
    ├── KPIHistoryChart.tsx
    └── DistributionChart.tsx

src/lib/
├── stores/
│   └── dashboardCommandCenterStore.ts # Store Zustand principal
├── hooks/
│   └── useDashboardKPIs.ts           # Hook pour récupérer KPIs
├── mappings/
│   └── dashboardKPIMapping.ts        # Mapping KPI labels <-> API
└── api/
    └── pilotage/
        └── dashboardClient.ts         # Client API

src/modules/dashboard/
├── components/
│   ├── DashboardContentSwitch.tsx    # Switch de contenu (nouveau)
│   └── DashboardUrlSync.tsx          # Synchronisation URL
├── navigation/
│   ├── DashboardSidebar.tsx
│   └── DashboardSubNavigation.tsx
└── registry/
    └── dashboardRegistry.tsx          # Registry des vues
```

---

## 🧩 Composants Principaux

### 1. **DashboardPage** (`app/(portals)/maitre-ouvrage/dashboard/page.tsx`)

**Rôle:** Point d'entrée principal du dashboard

**Emplacements d'utilisation:**
- Route: `/maitre-ouvrage/dashboard`
- Layout: `app/(portals)/maitre-ouvrage/layout.tsx`

**Imports clés:**
```typescript
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { DashboardModals } from '@/components/features/bmo/dashboard/command-center/DashboardModals';
import { useDashboardKPIs } from '@/lib/hooks/useDashboardKPIs';
import { KPIAlertsSystem } from '@/components/features/bmo/dashboard/command-center/KPIAlertsSystem';
```

**Interactions:**
- ✅ Lit le store Zustand pour la navigation
- ✅ Utilise `useDashboardKPIs` pour récupérer les données KPI
- ✅ Gère les états locaux (filtres, refresh, notifications)
- ✅ Rend `DashboardModals` pour les modals
- ✅ Rend `KPIAlertsSystem` pour les alertes
- ✅ Rend `DashboardContentSwitch` pour le contenu

**États locaux:**
- `kpiFilter`: Filtre de recherche KPI (persisté dans localStorage)
- `lastUpdate`: Dernière mise à jour
- `isRefreshing`: État de rafraîchissement
- `kpiChangeNotifications`: Notifications de changements KPI
- `performanceMetrics`: Métriques de performance
- `showExportMenu`: État du menu d'export

---

### 2. **DashboardModals** (`src/components/features/bmo/dashboard/command-center/DashboardModals.tsx`)

**Rôle:** Routeur centralisé pour tous les modals

**Emplacements d'utilisation:**
- ✅ `app/(portals)/maitre-ouvrage/dashboard/page.tsx` (ligne 991)

**Interactions:**
- ✅ Lit `modal` depuis le store Zustand
- ✅ Route vers différents modals selon `modal.type`:
  - `kpi-drilldown` → `KPIAdvancedModal` ou `KPIDrillDownModal`
  - `kpi-comparison` → `KPIComparisonModal`
  - `stats` → `StatsModal`
  - `help` → `HelpModal`
  - `risk-detail` → `RiskDetailModal`
  - `action-detail` → `ActionDetailModal`
  - `decision-detail` → `DecisionDetailModal`
  - `export` → `ExportModal`
  - `settings` → `SettingsModal`
  - `shortcuts` → `ShortcutsModal`

**Logique de routage:**
```typescript
if (modal.type === 'kpi-drilldown') {
  const kpiData = modal.data?.kpi;
  if (kpiData?.label) {
    const mapping = getKPIMappingByLabel(kpiData.label);
    if (mapping) {
      return <KPIAdvancedModal kpiId={mapping.metadata.id} onClose={closeModal} />;
    }
  }
  if (modal.data?.kpiId) {
    return <KPIAdvancedModal kpiId={modal.data.kpiId} onClose={closeModal} />;
  }
  return <KPIDrillDownModal />;
}
```

---

### 3. **KPIAdvancedModal** (`src/components/features/bmo/dashboard/command-center/KPIAdvancedModal.tsx`)

**Rôle:** Modal avancé pour les KPIs avec drill-down

**Emplacements d'utilisation:**
- ✅ `DashboardModals.tsx` (lignes 60, 65)

**Interactions:**
- ✅ Utilise `useKPIDetail` hook pour récupérer les détails KPI
- ✅ Utilise `useApiQuery` pour récupérer bureaux et trends
- ✅ Route vers modals spécialisés selon la catégorie:
  - `operational` → `OperationalKPIModal`
  - `financial` → `FinancialKPIModal`
  - `performance` → `PerformanceKPIModal`

**Props:**
```typescript
interface KPIAdvancedModalProps {
  kpiId: string;
  onClose: () => void;
}
```

---

### 4. **KPIAlertsSystem** (`src/components/features/bmo/dashboard/command-center/KPIAlertsSystem.tsx`)

**Rôle:** Système d'alertes configurable pour les KPIs

**Emplacements d'utilisation:**
- ✅ `app/(portals)/maitre-ouvrage/dashboard/page.tsx` (ligne 693)

**Interactions:**
- ✅ Reçoit les KPIs en props
- ✅ Vérifie les seuils configurés (persistés dans localStorage)
- ✅ Déclenche `onAlert` callback quand un seuil est dépassé
- ✅ Affiche les alertes actives

**Props:**
```typescript
interface KPIAlertsSystemProps {
  kpis: Array<{
    label: string;
    value: string | number;
    delta?: string;
    tone?: 'ok' | 'warn' | 'crit' | 'info';
    trend?: 'up' | 'down' | 'neutral';
    icon?: React.ComponentType;
  }>;
  onAlert: (alert: KPIAlert) => void;
}
```

**Interaction avec DashboardPage:**
```typescript
<KPIAlertsSystem 
  kpis={allKpis.map(kpi => ({...}))}
  onAlert={(alert) => {
    setKpiChangeNotifications(prev => [...prev, {
      id: alert.id,
      label: alert.kpiLabel,
      oldValue: 'Alerte',
      newValue: alert.message,
      timestamp: alert.timestamp,
    }]);
  }}
/>
```

---

### 5. **DashboardContentSwitch** (`src/modules/dashboard/components/DashboardContentSwitch.tsx`)

**Rôle:** Switch de contenu basé sur le registry

**Emplacements d'utilisation:**
- ✅ `app/(portals)/maitre-ouvrage/dashboard/page.tsx` (ligne 863)
- ✅ `src/modules/dashboard/components/DashboardCommandCenterPage.tsx` (ligne 34)

**Interactions:**
- ✅ Lit `navigation` depuis le store Zustand
- ✅ Résout la clé de vue: `${main}::${sub}::${subSub}`
- ✅ Cherche la vue dans `dashboardRegistry`
- ✅ Charge les données via `view.loader` si disponible
- ✅ Utilise le cache du store pour éviter les requêtes inutiles
- ✅ Gère les erreurs avec retry automatique

**Flux:**
```
Navigation change → viewKey change → useEffect → 
  Check cache → Load data → Update cache → Render view
```

---

### 6. **DashboardSidebar** (`src/modules/dashboard/navigation/DashboardSidebar.tsx`)

**Rôle:** Sidebar de navigation principale

**Emplacements d'utilisation:**
- ✅ `app/(portals)/maitre-ouvrage/dashboard/page.tsx` (ligne 560)
- ✅ `src/modules/dashboard/components/DashboardCommandCenterPage.tsx` (ligne 20)

**Interactions:**
- ✅ Lit `navigation` et `sidebarCollapsed` depuis le store
- ✅ Appelle `navigate` du store lors des clics
- ✅ Appelle `toggleSidebar` pour collapser/expand

---

### 7. **DashboardSubNavigation** (`src/modules/dashboard/navigation/DashboardSubNavigation.tsx`)

**Rôle:** Navigation de niveau 2 et 3

**Emplacements d'utilisation:**
- ✅ `app/(portals)/maitre-ouvrage/dashboard/page.tsx` (ligne 575)
- ✅ `src/modules/dashboard/components/DashboardCommandCenterPage.tsx` (ligne 27)

**Interactions:**
- ✅ Reçoit `mainCategory`, `subCategory`, `subSubCategory` en props
- ✅ Appelle `onSubCategoryChange` et `onSubSubCategoryChange`
- ✅ Ces callbacks appellent `navigate` du store

---

## 🔄 Flux de Données

### 1. **Flux KPI Data**

```
API (dashboardAPI.getStats)
  ↓
useDashboardKPIs hook
  ↓
Transform via dashboardKPIMapping
  ↓
DashboardPage.allKpis
  ↓
KPICard components
  ↓
Click → openModal('kpi-drilldown', { kpi, kpiId })
  ↓
DashboardModals
  ↓
KPIAdvancedModal
  ↓
useKPIDetail hook
  ↓
API (dashboardAPI.getKPIDetail)
```

### 2. **Flux Navigation**

```
User Click (Sidebar/SubNav)
  ↓
handleCategoryChange / handleSubCategoryChange
  ↓
navigate(mainCategory, subCategory, subSubCategory)
  ↓
Store Zustand (dashboardCommandCenterStore)
  ↓
Navigation state updated
  ↓
DashboardContentSwitch reads navigation
  ↓
Resolve viewKey from registry
  ↓
Load view data
  ↓
Render view component
```

### 3. **Flux Modal**

```
User Action (Click KPI, Button, etc.)
  ↓
openModal(type, data)
  ↓
Store Zustand (modal state updated)
  ↓
DashboardModals reads modal
  ↓
Route to appropriate modal component
  ↓
Modal component uses data from modal.data
  ↓
User closes → closeModal()
  ↓
Store Zustand (modal.isOpen = false)
```

### 4. **Flux Alerts**

```
KPIAlertsSystem receives KPIs
  ↓
Check thresholds (from localStorage)
  ↓
Compare current values with thresholds
  ↓
If threshold exceeded → onAlert callback
  ↓
DashboardPage receives alert
  ↓
Add to kpiChangeNotifications state
  ↓
Display notification UI
```

---

## 👆 Interactions Utilisateur

### 1. **Navigation**

| Action | Composant | Handler | Store Action |
|--------|-----------|---------|--------------|
| Click sidebar item | `DashboardSidebar` | `onCategoryChange` | `navigate(main, sub, null)` |
| Click sub-nav item | `DashboardSubNavigation` | `onSubCategoryChange` | `navigate(main, sub, null)` |
| Click sub-sub-nav | `DashboardSubNavigation` | `onSubSubCategoryChange` | `navigate(main, sub, subSub)` |
| Toggle sidebar | `DashboardSidebar` | `toggleSidebar()` | `toggleSidebar()` |

### 2. **KPIs**

| Action | Composant | Handler | Store Action |
|--------|-----------|---------|--------------|
| Click KPI card | `KPICard` | `onClick` | `openModal('kpi-drilldown', { kpi, kpiId })` |
| Refresh KPIs | Button in KPI strip | `refreshKPIs` | `refetchKPIsFromAPI()` |
| Filter KPIs | Input in KPI strip | `setKpiFilter` | Local state |
| Export KPIs | Export menu | `exportKPIs(format)` | Local function |

### 3. **Modals**

| Action | Composant | Handler | Store Action |
|--------|-----------|---------|--------------|
| Open KPI modal | `KPICard`, `DashboardKPIBar` | `openModal('kpi-drilldown')` | `openModal(type, data)` |
| Open comparison | Button | `openModal('kpi-comparison')` | `openModal(type, data)` |
| Open stats | Button | `openModal('stats')` | `openModal(type, data)` |
| Close modal | Any modal | `onClose()` | `closeModal()` |
| Click overlay | Modal overlay | `onClick={closeModal}` | `closeModal()` |

### 4. **Command Palette**

| Action | Composant | Handler | Store Action |
|--------|-----------|---------|--------------|
| Open palette | Keyboard shortcut (Ctrl+K) | `toggleCommandPalette()` | `toggleCommandPalette()` |
| Execute command | `DashboardCommandPalette` | `action()` | Various (navigate, openModal, etc.) |

---

## 🗄️ Store Zustand

### Structure (`dashboardCommandCenterStore.ts`)

```typescript
interface DashboardCommandCenterStore {
  // Navigation
  navigation: DashboardNavigation;
  navigate: (main, sub?, subSub?) => void;
  
  // UI State
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  toggleSidebar: () => void;
  toggleCommandPalette: () => void;
  
  // Live Stats
  liveStats: {...};
  startRefresh: () => void;
  endRefresh: () => void;
  
  // KPI Config
  kpiConfig: {...};
  setKPIConfig: (config) => void;
  
  // Display Config
  displayConfig: {...};
  setDisplayConfig: (config) => void;
  
  // Modal management
  modal: ModalState;
  openModal: (type, data?) => void;
  closeModal: () => void;
  
  // Cache
  cache: Record<string, CacheEntry>;
  setCache: (key, entry) => void;
}
```

### Utilisation par Composant

| Composant | Utilise | Actions |
|-----------|---------|---------|
| `DashboardPage` | `navigation`, `navigate`, `openModal`, `toggleSidebar`, `toggleCommandPalette` | Read/Write |
| `DashboardModals` | `modal`, `closeModal` | Read/Write |
| `DashboardContentSwitch` | `navigation`, `cache`, `setCache` | Read/Write |
| `DashboardSidebar` | `navigation`, `sidebarCollapsed`, `navigate`, `toggleSidebar` | Read/Write |
| `DashboardSubNavigation` | `navigation`, `navigate` | Read/Write |
| `KPIAdvancedModal` | (via props `onClose`) | Read |
| `KPIAlertsSystem` | (via props) | None |
| `DashboardKPIBar` | `kpiConfig`, `setKPIConfig`, `openModal` | Read/Write |
| `DashboardCommandPalette` | `commandPaletteOpen`, `toggleCommandPalette`, `navigate`, `openModal` | Read/Write |
| `OverviewView` | `navigation`, `openModal`, `navigate` | Read/Write |
| `PerformanceView` | `navigation`, `openModal`, `navigate` | Read/Write |
| `ActionsView` | `navigation`, `openModal`, `selectedItems`, `toggleItemSelection` | Read/Write |
| `RisksView` | `navigation`, `openModal` | Read/Write |
| `DecisionsView` | `navigation`, `openModal` | Read/Write |
| `RealtimeView` | `liveStats`, `startRefresh`, `endRefresh`, `setLiveStats` | Read/Write |

---

## 🎭 Modals System

### Types de Modals

| Type | Composant | Déclencheur | Données |
|------|-----------|-------------|---------|
| `kpi-drilldown` | `KPIAdvancedModal` / `KPIDrillDownModal` | Click KPI | `{ kpi, kpiId }` |
| `kpi-comparison` | `KPIComparisonModal` | Button | `{ kpiIds: string[] }` |
| `stats` | `StatsModal` | Button | `undefined` |
| `help` | `HelpModal` | Button | `undefined` |
| `risk-detail` | `RiskDetailModal` | Click risk | `{ risk }` |
| `action-detail` | `ActionDetailModal` | Click action | `{ action }` |
| `decision-detail` | `DecisionDetailModal` | Click decision | `{ decision }` |
| `export` | `ExportModal` | Button | `undefined` |
| `settings` | `SettingsModal` | Button | `{ kpiConfig, displayConfig }` |
| `shortcuts` | `ShortcutsModal` | Button | `undefined` |

### Flux Modal

```
1. User action → openModal(type, data)
2. Store updated → modal = { isOpen: true, type, data }
3. DashboardModals re-renders
4. Route to appropriate modal component
5. Modal component receives data from modal.data
6. User closes → closeModal()
7. Store updated → modal = { isOpen: false, type: null, data: undefined }
```

---

## 🧭 Navigation System

### Structure Hiérarchique

```
Level 1: mainCategory
  ├── overview
  ├── performance
  ├── actions
  ├── risks
  ├── decisions
  └── realtime

Level 2: subCategory
  ├── overview
  │   ├── summary
  │   ├── highlights
  │   └── trends
  ├── performance
  │   ├── kpis
  │   ├── metrics
  │   └── benchmarks
  └── ...

Level 3: subSubCategory
  ├── summary
  │   ├── dashboard
  │   ├── widgets
  │   └── insights
  └── ...
```

### Synchronisation URL

**Composant:** `DashboardUrlSync` (`src/modules/dashboard/components/DashboardUrlSync.tsx`)

**Emplacements d'utilisation:**
- ✅ `app/(portals)/maitre-ouvrage/dashboard/page.tsx` (ligne 555)
- ✅ `src/modules/dashboard/components/DashboardCommandCenterPage.tsx` (ligne 17)

**Flux:**
1. **URL → Store** (au montage):
   - Lit `?main=...&sub=...&subSub=...` depuis URL
   - Appelle `navigate(main, sub, subSub)`

2. **Store → URL** (à chaque changement):
   - Écoute `navigation` du store
   - Met à jour l'URL avec `router.replace()`

**Note:** `DashboardUrlSync` est bien utilisé dans `DashboardPage` pour synchroniser l'URL avec le store.

---

## 🔌 API Integration

### Hooks API

| Hook | Fichier | Utilisation |
|------|---------|-------------|
| `useDashboardKPIs` | `src/lib/hooks/useDashboardKPIs.ts` | `DashboardPage` (ligne 203) |
| `useKPIDetail` | `src/lib/hooks/useDashboardKPIs.ts` | `KPIAdvancedModal`, `KPIComparisonModal` |
| `useApiQuery` | `src/lib/api/hooks/useApiQuery.ts` | `KPIAdvancedModal` (bureaux, trends) |

### Endpoints API

| Endpoint | Client | Utilisation |
|----------|--------|-------------|
| `getStats({ period })` | `dashboardAPI.getStats` | `useDashboardKPIs` |
| `getKPIDetail({ kpiId, period })` | `dashboardAPI.getKPIDetail` | `useKPIDetail` |
| `getBureaux()` | `dashboardAPI.getBureaux` | `KPIAdvancedModal` |
| `getTrends({ kpi, months })` | `dashboardAPI.getTrends` | `KPIAdvancedModal` |

### Mapping KPI

**Fichier:** `src/lib/mappings/dashboardKPIMapping.ts`

**Fonctions:**
- `getKPIMappingByLabel(label)`: Trouve le mapping par label
- `getKPIMetadata(kpiId)`: Récupère les métadonnées KPI
- `transformKPIData(kpiId, statsData)`: Transforme les données API

---

## ⚠️ Points d'Attention

### 1. **Duplication de Composants**

- ❌ `DashboardContentRouter` existe dans 2 emplacements:
  - `src/components/features/bmo/dashboard/command-center/DashboardContentRouter.tsx`
  - `src/modules/dashboard/components/DashboardContentRouter.tsx` (n'existe pas, mais référencé)
- ✅ `DashboardContentSwitch` est le nouveau composant recommandé

### 2. **Synchronisation URL**

- ✅ `DashboardUrlSync` est utilisé dans `DashboardPage` (ligne 555)
- ✅ Utilisé dans `DashboardCommandCenterPage`
- ✅ Synchronisation URL/Store fonctionnelle

### 3. **Cache Management**

- ✅ `DashboardContentSwitch` utilise le cache du store
- ⚠️ Pas de mécanisme d'invalidation automatique
- ⚠️ TTL fixe (30s par défaut)

### 4. **Modal State Management**

- ✅ Centralisé dans le store
- ✅ `DashboardModals` route correctement
- ⚠️ Certains modals (comme `KPIDrillDownModal`) n'utilisent pas le store directement

### 5. **KPI Data Flow**

- ✅ `useDashboardKPIs` hook centralisé
- ✅ Mapping système pour transformer les données
- ⚠️ Fallback vers données mock si API échoue (silencieux)

### 6. **Performance**

- ✅ `useMemo` pour `allKpis`
- ✅ `useCallback` pour handlers
- ⚠️ `DashboardContentSwitch` peut charger plusieurs fois si cache expiré
- ⚠️ Pas de debounce sur les filtres KPI

---

## 💡 Recommandations

### 1. **Unifier les Composants de Routage**

- ✅ Utiliser uniquement `DashboardContentSwitch`
- ❌ Supprimer `DashboardContentRouter` si dupliqué

### 2. **Ajouter DashboardUrlSync dans DashboardPage**

```typescript
// Dans DashboardPage
<DashboardUrlSync />
```

### 3. **Améliorer le Cache**

- Ajouter invalidation manuelle
- Ajouter TTL configurable par vue
- Ajouter mécanisme de refresh automatique

### 4. **Améliorer la Gestion d'Erreurs**

- Afficher des erreurs API visibles
- Ajouter retry automatique avec backoff
- Logger les erreurs pour debugging

### 5. **Optimiser les Performances**

- Ajouter debounce sur filtres KPI
- Lazy load des modals
- Memoization des composants lourds

### 6. **Documentation**

- Ajouter JSDoc sur tous les composants
- Documenter les flux de données
- Créer diagrammes d'interaction

---

## 📝 Checklist de Vérification

### Composants
- [x] `DashboardPage` - Point d'entrée principal
- [x] `DashboardModals` - Routeur de modals
- [x] `KPIAdvancedModal` - Modal KPI avancé
- [x] `KPIComparisonModal` - Modal comparaison
- [x] `KPIAlertsSystem` - Système d'alertes
- [x] `DashboardContentSwitch` - Switch de contenu
- [x] `DashboardSidebar` - Sidebar navigation
- [x] `DashboardSubNavigation` - Sub-navigation

### Store
- [x] `dashboardCommandCenterStore` - Store Zustand
- [x] Navigation state
- [x] Modal state
- [x] UI state
- [x] Cache management

### Hooks
- [x] `useDashboardKPIs` - Hook KPI principal
- [x] `useKPIDetail` - Hook détail KPI
- [x] `useApiQuery` - Hook API générique

### API
- [x] `dashboardAPI.getStats`
- [x] `dashboardAPI.getKPIDetail`
- [x] `dashboardAPI.getBureaux`
- [x] `dashboardAPI.getTrends`

### Mapping
- [x] `dashboardKPIMapping` - Mapping KPI labels/IDs
- [x] `getKPIMappingByLabel` - Fonction de recherche
- [x] `transformKPIData` - Transformation données

---

**Status:** ✅ Analyse complète terminée
**Prochaines étapes:** Implémenter les recommandations

