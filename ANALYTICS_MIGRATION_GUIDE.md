# 📘 Guide de Migration Analytics vers analyticsCommandCenterStore

**Date**: 2025-01-XX  
**Statut**: Composants créés, migration en attente

---

## ✅ Ce qui a été fait

### 1. **Store créé** ✅
- **Fichier**: `src/lib/stores/analyticsCommandCenterStore.ts`
- **Fonctionnalités**:
  - Navigation state structuré (category + subCategory + filter)
  - Modal state centralisé avec stack
  - Filtres centralisés + sauvegarde
  - KPI config persistée
  - Sélection multi-items
  - Global search
  - Detail panel support
  - Persistance (localStorage)

### 2. **Bug corrigé** ✅
- **Fichier**: `src/components/features/bmo/analytics/command-center/AnalyticsKPIBar.tsx`
- **Problème**: `lastUpdate` jamais mis à jour
- **Solution**: Utilisation de `setLastUpdate` dans `handleRefresh`

### 3. **BatchActionsBar créé** ✅
- **Fichier**: `src/components/features/bmo/analytics/command-center/AnalyticsBatchActionsBar.tsx`
- **Fonctionnalités**:
  - Affichage du nombre d'items sélectionnés
  - Actions batch (Voir, Exporter, Partager, Étiqueter, Archiver, Supprimer)
  - Intégration avec le store
  - Animation slide-in

### 4. **Export mis à jour** ✅
- **Fichier**: `src/components/features/bmo/analytics/command-center/index.ts`
- Ajout de `AnalyticsBatchActionsBar` aux exports

---

## 🔄 Migration de la page Analytics

### Étape 1 : Importer le store

```typescript
// app/(portals)/maitre-ouvrage/analytics/page.tsx
import { useAnalyticsCommandCenterStore } from '@/lib/stores/analyticsCommandCenterStore';
import { 
  AnalyticsBatchActionsBar,
  // ... autres imports
} from '@/components/features/bmo/analytics/command-center';
```

### Étape 2 : Remplacer useState par le store

**AVANT** :
```typescript
const [activeCategory, setActiveCategory] = useState('overview');
const [activeSubCategory, setActiveSubCategory] = useState('all');
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
const [kpiBarCollapsed, setKpiBarCollapsed] = useState(false);
const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
const [filtersPanelOpen, setFiltersPanelOpen] = useState(false);
const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
```

**APRÈS** :
```typescript
const {
  navigation,
  navigate,
  goBack,
  sidebarCollapsed,
  toggleSidebar,
  kpiConfig,
  setKPIConfig,
  notificationsPanelOpen,
  toggleNotificationsPanel,
  modal,
  openModal,
  closeModal,
  filters,
  setFilter,
  resetFilters,
  selectedItems,
  clearSelection,
} = useAnalyticsCommandCenterStore();
```

### Étape 3 : Remplacer les handlers

**AVANT** :
```typescript
const handleCategoryChange = useCallback((category: string) => {
  setNavigationHistory((prev) => [...prev, activeCategory]);
  setActiveCategory(category);
  setActiveSubCategory('all');
}, [activeCategory]);
```

**APRÈS** :
```typescript
const handleCategoryChange = useCallback((category: string) => {
  navigate(category as AnalyticsMainCategory, null, null);
}, [navigate]);
```

### Étape 4 : Remplacer les modals

**AVANT** :
```typescript
const [statsModalOpen, setStatsModalOpen] = useState(false);
const [exportModalOpen, setExportModalOpen] = useState(false);
// ... 6 autres modals
```

**APRÈS** :
```typescript
// Dans le render
{modal.type === 'stats' && modal.isOpen && (
  <AnalyticsStatsModal 
    open={modal.isOpen} 
    onClose={closeModal} 
  />
)}
{modal.type === 'export' && modal.isOpen && (
  <AnalyticsExportModal 
    open={modal.isOpen} 
    onClose={closeModal} 
  />
)}
// etc.
```

**Ouverture** :
```typescript
// AVANT
setStatsModalOpen(true);

// APRÈS
openModal('stats', { /* data */ });
```

### Étape 5 : Ajouter BatchActionsBar

```typescript
// Dans le render, avant la fermeture de la div principale
<AnalyticsBatchActionsBar
  onAction={(actionId, ids) => {
    switch (actionId) {
      case 'export':
        // Exporter les items sélectionnés
        break;
      case 'delete':
        // Supprimer les items sélectionnés
        break;
      // etc.
    }
  }}
/>
```

### Étape 6 : Utiliser la navigation depuis le store

```typescript
// AVANT
<AnalyticsCommandSidebar
  activeCategory={activeCategory}
  collapsed={sidebarCollapsed}
  onCategoryChange={handleCategoryChange}
  onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
  onOpenCommandPalette={openCommandPalette}
/>

// APRÈS
<AnalyticsCommandSidebar
  activeCategory={navigation.mainCategory}
  collapsed={sidebarCollapsed}
  onCategoryChange={(category) => navigate(category as AnalyticsMainCategory)}
  onToggleCollapse={toggleSidebar}
  onOpenCommandPalette={openCommandPalette}
/>
```

### Étape 7 : Utiliser KPI config depuis le store

```typescript
// AVANT
<AnalyticsKPIBar
  visible={true}
  collapsed={kpiBarCollapsed}
  onToggleCollapse={() => setKpiBarCollapsed((prev) => !prev)}
  onRefresh={handleRefresh}
/>

// APRÈS
<AnalyticsKPIBar
  visible={kpiConfig.visible}
  collapsed={kpiConfig.collapsed}
  onToggleCollapse={() => setKPIConfig({ collapsed: !kpiConfig.collapsed })}
  onRefresh={handleRefresh}
/>
```

### Étape 8 : Utiliser les filtres depuis le store

```typescript
// AVANT
<AnalyticsFiltersPanel
  isOpen={filtersPanelOpen}
  onClose={() => setFiltersPanelOpen(false)}
  onApplyFilters={handleApplyFilters}
/>

// APRÈS
<AnalyticsFiltersPanel
  isOpen={modal.type === 'filters' && modal.isOpen}
  onClose={closeModal}
  onApplyFilters={(newFilters) => {
    Object.entries(newFilters).forEach(([key, value]) => {
      setFilter(key as keyof AnalyticsActiveFilters, value);
    });
  }}
/>
```

### Étape 9 : Utiliser navigation history depuis le store

```typescript
// AVANT
const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
const handleGoBack = useCallback(() => {
  if (navigationHistory.length > 0) {
    const previousCategory = navigationHistory[navigationHistory.length - 1];
    setNavigationHistory((prev) => prev.slice(0, -1));
    setActiveCategory(previousCategory);
    setActiveSubCategory('all');
  }
}, [navigationHistory]);

// APRÈS
const { navigationHistory, goBack } = useAnalyticsCommandCenterStore();
// goBack() restaure automatiquement l'état complet (category + subCategory + filter)
```

---

## 📋 Checklist de Migration

- [ ] Importer le store et les hooks
- [ ] Remplacer tous les `useState` par le store
- [ ] Remplacer `handleCategoryChange` par `navigate`
- [ ] Remplacer `handleGoBack` par `goBack` du store
- [ ] Remplacer les 6 états modals par le système modal centralisé
- [ ] Remplacer `kpiBarCollapsed` par `kpiConfig.collapsed`
- [ ] Remplacer `activeFilters` par `filters` du store
- [ ] Ajouter `AnalyticsBatchActionsBar` dans le render
- [ ] Implémenter les handlers d'actions batch
- [ ] Tester la navigation (category, subCategory, filter)
- [ ] Tester les modals (ouverture, fermeture, stack)
- [ ] Tester les filtres (appliquer, sauvegarder, charger)
- [ ] Tester la sélection multi-items
- [ ] Tester la persistance (recharger la page)
- [ ] Tester le bouton "back" (history)

---

## 🔍 Différences importantes

### Navigation State

**AVANT** :
- `activeCategory`: string
- `activeSubCategory`: string
- `navigationHistory`: string[] (juste les IDs de catégories)

**APRÈS** :
- `navigation`: { mainCategory, subCategory, filter }
- `navigationHistory`: NavigationState[] (états complets)
- `goBack()` restaure l'état complet (category + subCategory + filter)

### Modals

**AVANT** :
- 6 `useState` séparés
- Pas de support pour modals imbriqués
- Gestion manuelle

**APRÈS** :
- 1 état modal centralisé
- Support modals imbriqués (`pushModal` / `popModal`)
- Gestion automatique

### Filtres

**AVANT** :
- `activeFilters`: Record<string, string[]>
- Pas de sauvegarde
- Pas de persistance

**APRÈS** :
- `filters`: AnalyticsActiveFilters (typé)
- `savedFilters`: SavedFilter[] (sauvegarde)
- Persistance automatique

---

## ⚠️ Points d'attention

1. **Types** : Utiliser les types du store (`AnalyticsMainCategory`, etc.)
2. **Navigation** : `navigate()` prend 3 paramètres (main, sub, filter)
3. **Modals** : Toujours utiliser `openModal` / `closeModal` du store
4. **Sélection** : Toujours utiliser `selectItem` / `deselectItem` / `clearSelection`
5. **Persistance** : Certains états sont persistés (navigation, filters, kpiConfig), d'autres non (modals, selections)

---

## 🧪 Tests recommandés

1. **Navigation** :
   - Changer de catégorie → vérifier history
   - Cliquer "back" → vérifier restauration complète
   - Recharger la page → vérifier persistance

2. **Modals** :
   - Ouvrir/fermer différents modals
   - Tester modals imbriqués (pushModal/popModal)

3. **Filtres** :
   - Appliquer des filtres
   - Sauvegarder un filtre
   - Charger un filtre sauvegardé
   - Recharger → vérifier persistance

4. **Sélection** :
   - Sélectionner plusieurs items
   - Vérifier apparition BatchActionsBar
   - Actions batch (export, delete, etc.)
   - Clear selection

5. **KPI Config** :
   - Toggle collapsed
   - Changer refreshInterval
   - Recharger → vérifier persistance

---

## 📚 Références

- **Store** : `src/lib/stores/analyticsCommandCenterStore.ts`
- **BatchActionsBar** : `src/components/features/bmo/analytics/command-center/AnalyticsBatchActionsBar.tsx`
- **Governance (référence)** : `src/lib/stores/governanceCommandCenterStore.ts`
- **Page actuelle** : `app/(portals)/maitre-ouvrage/analytics/page.tsx`

---

**Note** : Cette migration est optionnelle mais recommandée pour :
- ✅ Cohérence avec l'architecture Governance
- ✅ Meilleure maintenabilité
- ✅ Persistance des préférences utilisateur
- ✅ Gestion centralisée de l'état
- ✅ Fonctionnalités avancées (modals imbriqués, filtres sauvegardés, etc.)

