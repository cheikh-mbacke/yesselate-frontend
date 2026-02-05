# 🔍 Analyse Approfondie - Page Governance

## 📊 Vue d'Ensemble

**Fichier analysé** : `app/(portals)/maitre-ouvrage/governance/page.tsx`  
**Lignes de code** : 562  
**Complexité cyclomatique estimée** : ~25 (élevée)  
**Hooks personnalisés** : 4 (`useGovernanceFilters`, `useGovernanceRACI`, `useGovernanceAlerts`, `useAutoSyncCounts`)

---

## 🚨 Problèmes Critiques Identifiés

### 1. **Dépendances Manquantes dans useEffect** ⚠️ CRITIQUE

**Ligne 267** : Le `useEffect` pour les raccourcis clavier a des dépendances incomplètes.

```typescript
// ❌ PROBLÈME ACTUEL
useEffect(() => {
  // ... utilise handleBulkAction, raciHook, alertsHook
}, [activeTab, alertsHook.selectedAlertIds, raciHook, updateTab, addToast, focusMode]);
```

**Problèmes** :
- `handleBulkAction` est utilisé mais pas dans les dépendances
- `raciHook` est un objet complet, devrait être décomposé
- `alertsHook` est un objet complet, devrait être décomposé
- Risque de closures obsolètes

**Impact** : Bugs potentiels, comportements inattendus lors des interactions clavier

**Solution** :
```typescript
// ✅ SOLUTION RECOMMANDÉE
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // ... logique
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [
  activeTab,
  alertsHook.selectedAlertIds.size, // Utiliser .size au lieu de l'objet Set
  raciHook.showComparator,
  raciHook.showHeatmap,
  raciHook.showAISuggestions,
  raciHook.setSelectedActivity,
  alertsHook.setSelectedAlert,
  alertsHook.setEscalateModalOpen,
  alertsHook.setResolveModalOpen,
  updateTab,
  addToast,
  focusMode,
  handleBulkAction, // Ajouter explicitement
]);
```

---

### 2. **Re-renders Excessifs** ⚠️ PERFORMANCE

**Problème** : Les hooks retournent des objets complets qui changent à chaque render.

**Lignes 167-168** :
```typescript
const raciHook = useGovernanceRACI();
const alertsHook = useGovernanceAlerts(search, filters, activeView, focusMode);
```

**Analyse** :
- `useGovernanceRACI` retourne un nouvel objet à chaque render
- `useGovernanceAlerts` recalcule `alerts` même si les données sources n'ont pas changé
- Les composants enfants reçoivent des props qui changent constamment

**Impact** : Re-renders inutiles, performance dégradée avec beaucoup d'alertes

**Solution** :
```typescript
// ✅ Dans useGovernanceRACI.ts
export function useGovernanceRACI() {
  // ... état existant
  
  // Memoizer le retour
  return useMemo(() => ({
    selectedActivity,
    editMode,
    showComparator,
    showAISuggestions,
    showHeatmap,
    stats,
    selectedR,
    raciData: raciEnriched,
    bureaux: BUREAUX,
    setSelectedActivity,
    setEditMode,
    setShowComparator,
    setShowAISuggestions,
    setShowHeatmap,
    handleExport,
  }), [
    selectedActivity,
    editMode,
    showComparator,
    showAISuggestions,
    showHeatmap,
    stats,
    selectedR,
  ]);
}
```

---

### 3. **Calculs Coûteux Non Optimisés** ⚠️ PERFORMANCE

**Ligne 99-185 dans `useGovernanceAlerts.ts`** : Le calcul de `alerts` se fait à chaque render.

```typescript
// ❌ PROBLÈME : Recalculé même si les données sources n'ont pas changé
const alerts: Alert[] = useMemo(() => {
  // Transformation complexe de systemAlerts, blockedDossiers, etc.
}, []); // Dépendances vides = ne se recalcule jamais, mais les données sources peuvent changer
```

**Problème** : Les données sources (`systemAlerts`, `blockedDossiers`, etc.) sont importées statiquement, mais si elles changent (via props ou contexte), le `useMemo` ne se met pas à jour.

**Solution** :
```typescript
// ✅ SOLUTION : Utiliser les données depuis un store ou contexte réactif
import { useBMOStore } from '@/lib/stores';

export function useGovernanceAlerts(...) {
  // Récupérer les données depuis le store (réactif)
  const { systemAlerts, blockedDossiers, paymentsN1, contractsToSign } = useBMOStore();
  
  const alerts: Alert[] = useMemo(() => {
    // ... transformation
  }, [systemAlerts, blockedDossiers, paymentsN1, contractsToSign]);
}
```

---

### 4. **Gestion d'État Complexe et Fragile** ⚠️ MAINTAINABILITY

**Problème** : Trop de `useState` et de logique dispersée.

**État actuel dans le composant principal** :
- `focusMode` (ligne 164)
- `showShortcuts` (ligne 171)
- Plus les états des hooks

**Problèmes** :
- Difficile de suivre l'état global
- Risque d'incohérences
- Tests difficiles

**Solution** : Utiliser `useReducer` pour l'état complexe

```typescript
// ✅ SOLUTION : Reducer pour l'état UI
type GovernanceUIAction =
  | { type: 'TOGGLE_FOCUS_MODE' }
  | { type: 'TOGGLE_SHORTCUTS' }
  | { type: 'CLOSE_MODALS' };

interface GovernanceUIState {
  focusMode: boolean;
  showShortcuts: boolean;
}

function governanceUIReducer(
  state: GovernanceUIState,
  action: GovernanceUIAction
): GovernanceUIState {
  switch (action.type) {
    case 'TOGGLE_FOCUS_MODE':
      return { ...state, focusMode: !state.focusMode };
    case 'TOGGLE_SHORTCUTS':
      return { ...state, showShortcuts: !state.showShortcuts };
    case 'CLOSE_MODALS':
      return { ...state, showShortcuts: false };
    default:
      return state;
  }
}

// Dans le composant
const [uiState, dispatchUI] = useReducer(governanceUIReducer, {
  focusMode: false,
  showShortcuts: false,
});
```

---

### 5. **Type Safety Insuffisante** ⚠️ TYPE SAFETY

**Lignes problématiques** :
- Ligne 273 : `addToast as any`
- Ligne 281 : `addToast as any`
- Ligne 439 : `as any` pour `filtersHook`

**Problème** : Utilisation de `any` qui contourne TypeScript

**Solution** :
```typescript
// ✅ Définir les types correctement
type ToastFunction = (msg: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
type ActionLogFunction = (log: ActionLog) => void;

// Utiliser les types
const handleRACIExport = useCallback(() => {
  raciHook.handleExport(addToast, addActionLog);
}, [raciHook, addToast, addActionLog]);
```

---

### 6. **Synchronisation URL Fragile** ⚠️ UX

**Dans `useGovernanceFilters.ts`, lignes 138-181** : Double synchronisation (URL + localStorage) peut créer des conflits.

**Problème** :
- Si l'URL change (navigation), le localStorage peut être désynchronisé
- Si le localStorage change (autre onglet), l'URL n'est pas mise à jour

**Solution** : Prioriser l'URL, utiliser localStorage comme fallback uniquement

```typescript
// ✅ SOLUTION AMÉLIORÉE
useEffect(() => {
  // 1. Toujours lire l'URL en premier (source de vérité)
  const urlTab = searchParams.get('activeTab') as TabValue | null;
  const urlSearch = searchParams.get('search') || '';
  // ...
  
  // 2. localStorage uniquement si URL vide
  if (!urlTab && !urlSearch) {
    const saved = getFilters?.();
    // ... restaurer depuis localStorage
  }
}, [searchParams]); // Dépendre uniquement de searchParams

// 3. Synchroniser localStorage APRÈS mise à jour URL
useEffect(() => {
  // Mettre à jour URL
  router.replace(newUrl);
  
  // Puis synchroniser localStorage (décalé pour éviter conflits)
  const timeoutId = setTimeout(() => {
    updateFilters?.({ ... });
  }, 100);
  
  return () => clearTimeout(timeoutId);
}, [activeTab, search, filters, activeViewId]);
```

---

## 🎯 Problèmes de Performance

### 7. **Pas de Virtualisation pour les Listes** ⚠️ PERFORMANCE

**Problème** : Si `filteredAlerts` contient 1000+ éléments, tous sont rendus en même temps.

**Impact** : Lag lors du scroll, consommation mémoire élevée

**Solution** : Implémenter la virtualisation

```typescript
// ✅ SOLUTION : Virtualisation avec @tanstack/react-virtual
import { useVirtualizer } from '@tanstack/react-virtual';

function AlertsList({ alerts }: { alerts: Alert[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: alerts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Hauteur estimée par alerte
    overscan: 5, // Rendre 5 items supplémentaires pour le scroll fluide
  });
  
  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <AlertCard alert={alerts[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 8. **Recherche Non Debounced** ⚠️ PERFORMANCE

**Ligne 88 dans `useGovernanceAlerts.ts`** : `useDeferredValue` est utilisé, mais ce n'est pas suffisant pour les recherches rapides.

**Problème** : Chaque frappe déclenche un recalcul de `filteredAlerts`

**Solution** : Ajouter un debounce explicite

```typescript
// ✅ SOLUTION : Debounce personnalisé
import { useDebouncedValue } from '@/hooks/useDebouncedValue'; // À créer

export function useGovernanceAlerts(search: string, ...) {
  // Debounce de 300ms pour la recherche
  const debouncedSearch = useDebouncedValue(search, 300);
  const deferredSearch = useDeferredValue(debouncedSearch);
  
  const filteredAlerts = useMemo(() => {
    // Utiliser deferredSearch au lieu de search directement
  }, [alerts, activeView, deferredSearch, focusMode]);
}
```

---

## 🏗️ Problèmes d'Architecture

### 9. **Séparation des Responsabilités** ⚠️ MAINTAINABILITY

**Problème** : Le composant principal fait trop de choses :
- Gestion des raccourcis clavier
- Gestion des modals
- Coordination des hooks
- Rendu UI

**Solution** : Extraire la logique des raccourcis clavier

```typescript
// ✅ SOLUTION : Hook dédié pour les raccourcis
// hooks/useGovernanceKeyboardShortcuts.ts
export function useGovernanceKeyboardShortcuts({
  activeTab,
  raciHook,
  alertsHook,
  updateTab,
  onBulkAction,
  onToggleFocus,
  onToggleShortcuts,
}: UseKeyboardShortcutsProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ... toute la logique des raccourcis
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [/* dépendances correctes */]);
  
  return { searchInputRef };
}

// Dans le composant principal
const { searchInputRef } = useGovernanceKeyboardShortcuts({
  activeTab,
  raciHook,
  alertsHook,
  updateTab,
  onBulkAction: handleBulkAction,
  onToggleFocus: () => setFocusMode(!focusMode),
  onToggleShortcuts: () => setShowShortcuts(!showShortcuts),
});
```

---

### 10. **Composants Trop Gros** ⚠️ MAINTAINABILITY

**Problème** : Le composant principal fait 562 lignes. Les composants `RACITab` et `AlertsTab` sont probablement aussi gros.

**Solution** : Diviser en composants plus petits

```
governance/
├── page.tsx (composant principal, < 200 lignes)
├── components/
│   ├── GovernanceHeader.tsx
│   ├── RACITab/
│   │   ├── index.tsx
│   │   ├── RACITable.tsx
│   │   ├── RACIComparator.tsx
│   │   ├── RACIHeatmap.tsx
│   │   └── RAICISuggestions.tsx
│   ├── AlertsTab/
│   │   ├── index.tsx
│   │   ├── AlertsList.tsx
│   │   ├── AlertsFilters.tsx
│   │   └── AlertsStats.tsx
│   └── KeyboardShortcutsModal.tsx
└── hooks/
    ├── useGovernanceFilters.ts
    ├── useGovernanceRACI.ts
    ├── useGovernanceAlerts.ts
    └── useGovernanceKeyboardShortcuts.ts
```

---

## 🔒 Problèmes de Sécurité Potentiels

### 11. **Parsing JSON Non Sécurisé** ⚠️ SÉCURITÉ

**Ligne 130-137** : `safeJsonParse` existe mais n'est pas utilisé partout.

**Problème** : Dans `useGovernanceFilters.ts`, ligne 61, `JSON.parse` est utilisé directement sans validation.

**Solution** : Toujours utiliser `safeJsonParse` ou une fonction similaire

```typescript
// ✅ SOLUTION : Validation stricte
function deserializeFilters(serialized: string | null): GovernanceFilters {
  if (!serialized) return { status: 'all' };
  
  try {
    const parsed = JSON.parse(serialized);
    
    // Validation stricte du schéma
    if (typeof parsed !== 'object' || parsed === null) {
      return { status: 'all' };
    }
    
    // Valider les champs attendus
    const validFilters: GovernanceFilters = { status: 'all' };
    if (parsed.severity && ['critical', 'warning', 'info', 'success'].includes(parsed.severity)) {
      validFilters.severity = parsed.severity;
    }
    if (parsed.type && ['system', 'blocked', 'payment', 'contract'].includes(parsed.type)) {
      validFilters.type = parsed.type;
    }
    // ... autres validations
    
    return validFilters;
  } catch {
    return { status: 'all' };
  }
}
```

---

## 🎨 Problèmes UX

### 12. **Feedback Utilisateur Insuffisant** ⚠️ UX

**Problème** : Pas d'indicateur de chargement lors des actions longues (export CSV, etc.)

**Solution** : Ajouter des états de chargement

```typescript
// ✅ SOLUTION : États de chargement
const [isExporting, setIsExporting] = useState(false);

const handleRACIExport = useCallback(async () => {
  setIsExporting(true);
  try {
    await raciHook.handleExport(addToast, addActionLog);
  } finally {
    setIsExporting(false);
  }
}, [raciHook, addToast, addActionLog]);

// Dans le JSX
<Button onClick={handleRACIExport} disabled={isExporting}>
  {isExporting ? '⏳ Export en cours...' : '📤 Exporter'}
</Button>
```

---

### 13. **Pas de Gestion d'Erreurs** ⚠️ UX

**Problème** : Les erreurs sont silencieuses (try/catch avec console.warn uniquement)

**Solution** : Afficher des toasts d'erreur

```typescript
// ✅ SOLUTION : Gestion d'erreurs visible
useEffect(() => {
  try {
    // ... logique
  } catch (error) {
    console.error('Erreur lors de la lecture des filtres:', error);
    addToast('Erreur lors du chargement des filtres. Utilisation des valeurs par défaut.', 'error');
  }
}, []);
```

---

## 📈 Recommandations Prioritaires

### 🔴 Priorité CRITIQUE (À faire immédiatement)

1. **Corriger les dépendances useEffect** (Problème #1)
2. **Améliorer la type safety** (Problème #5)
3. **Sécuriser le parsing JSON** (Problème #11)

### 🟠 Priorité HAUTE (Cette semaine)

4. **Optimiser les re-renders** (Problème #2)
5. **Virtualiser les listes** (Problème #7)
6. **Extraire la logique des raccourcis** (Problème #9)

### 🟡 Priorité MOYENNE (Ce mois)

7. **Utiliser useReducer pour l'état UI** (Problème #4)
8. **Améliorer la synchronisation URL** (Problème #6)
9. **Ajouter des états de chargement** (Problème #12)
10. **Diviser les composants** (Problème #10)

### 🟢 Priorité BASSE (Amélioration continue)

11. **Debounce de la recherche** (Problème #8)
12. **Gestion d'erreurs visible** (Problème #13)

---

## 📊 Métriques Cibles

### Performance
- ⚡ Temps de rendu initial : < 200ms (actuellement ~300-500ms estimé)
- ⚡ Re-renders : Réduction de 60%+
- ⚡ Mémoire : < 100MB pour 1000 alertes

### Qualité
- ✅ 0 utilisation de `any`
- ✅ Complexité cyclomatique : < 10 par fonction
- ✅ Composants : < 200 lignes chacun

### Maintenabilité
- ✅ Tests : Couverture > 70%
- ✅ Documentation : Tous les hooks documentés
- ✅ Type safety : Mode strict TypeScript

---

## 🛠️ Plan d'Action Immédiat

### Sprint 1 (3-5 jours)
1. Corriger les dépendances useEffect
2. Améliorer la type safety (supprimer les `any`)
3. Sécuriser le parsing JSON
4. Optimiser les re-renders (memoization des hooks)

### Sprint 2 (5-7 jours)
5. Extraire la logique des raccourcis clavier
6. Virtualiser les listes d'alertes
7. Ajouter les états de chargement
8. Améliorer la gestion d'erreurs

### Sprint 3 (7-10 jours)
9. Utiliser useReducer pour l'état UI
10. Diviser les composants
11. Améliorer la synchronisation URL
12. Ajouter des tests unitaires

---

## 📝 Notes Finales

Cette analyse identifie **13 problèmes majeurs** avec des solutions concrètes. La priorité est de corriger les problèmes critiques (#1, #5, #11) qui peuvent causer des bugs en production, puis d'optimiser la performance (#2, #7) et enfin d'améliorer la maintenabilité (#4, #9, #10).

Les améliorations proposées suivent les meilleures pratiques React et TypeScript, et sont alignées avec les patterns utilisés dans d'autres pages du projet (analytics, calendrier).

