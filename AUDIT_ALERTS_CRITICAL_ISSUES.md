# AUDIT CRITIQUE - PAGE ALERTES
## Date: 2026-01-10

## ❌ PROBLÈMES CRITIQUES IDENTIFIÉS

### 1. **Hooks React Query NON UTILISÉS**
**Gravité:** 🔴 CRITIQUE

**Problème:**
- Les hooks `useAlerts`, `useAlertStats`, etc. créés dans `src/lib/api/hooks/useAlerts.ts` ne sont PAS importés ni utilisés dans la page principale
- La page utilise actuellement `useApiQuery` qui est un hook générique moins performant
- Le fichier `AlertInboxView.tsx` utilise des données mock locales au lieu de l'API

**Fichiers concernés:**
- `app/(portals)/maitre-ouvrage/alerts/page.tsx` (ligne 66-67, 153-158)
- `src/components/features/alerts/workspace/views/AlertInboxView.tsx` (lignes 88-109)

**Impact:**
- Pas de cache intelligent React Query
- Pas de refetch automatique
- Pas d'optimistic updates
- Perte de performance
- Les 13 query hooks créés sont inutilisés

**Code actuel (INCORRECT):**
```typescript
// page.tsx ligne 153-158
const {
  data: timelineData,
  isLoading: timelineLoading,
  error: timelineError,
  refetch: refetchTimeline,
} = useApiQuery(async (_signal: AbortSignal) => alertsAPI.getTimeline({ days: 7 }), []);
```

**Code à implémenter (CORRECT):**
```typescript
const {
  data: timelineData,
  isLoading: timelineLoading,
  error: timelineError,
  refetch: refetchTimeline,
} = useAlertTimeline({ days: 7 });

const {
  data: statsData,
  isLoading: statsLoading,
  refetch: refetchStats,
} = useAlertStats();
```

---

### 2. **Export des hooks manquant**
**Gravité:** 🟠 MAJEUR

**Problème:**
- Le fichier `src/lib/api/hooks/index.ts` n'exporte PAS les hooks alerts
- Les hooks ne sont pas accessibles via l'import centralisé

**Fichier concerné:**
- `src/lib/api/hooks/index.ts`

**Code actuel:**
```typescript
export * from './useProjects';
export * from './useDevis';
export * from './useAuth';
export * from './useChantiers';
export * from './usePayments';
export * from './useApiQuery';
// ❌ MANQUANT: export * from './useAlerts';
```

**Correction nécessaire:**
```typescript
export * from './useAlerts';
```

---

### 3. **BatchActionsBar NON intégré**
**Gravité:** 🟠 MAJEUR

**Problème:**
- Le composant `BatchActionsBar` créé n'est PAS importé ni utilisé dans la page principale
- Le composant existe mais n'est jamais rendu
- La fonctionnalité de sélection multiple du store n'est pas connectée

**Fichier concerné:**
- `app/(portals)/maitre-ouvrage/alerts/page.tsx`

**Impact:**
- Pas d'actions en masse depuis la page principale
- Interface incohérente
- Le store `selectedAlertIds` n'est jamais utilisé

**Code à ajouter:**
```typescript
import { BatchActionsBar } from '@/components/features/bmo/alerts/BatchActionsBar';

// Dans le composant
const { selectedAlertIds, clearSelection } = useAlertWorkspaceStore();

// Dans le JSX, avant </div> de fin
<BatchActionsBar
  selectedCount={selectedAlertIds.length}
  onAcknowledge={() => {/* ... */}}
  onResolve={() => {/* ... */}}
  onEscalate={() => {/* ... */}}
  onAssign={() => {/* ... */}}
  onDelete={() => {/* ... */}}
  onClear={clearSelection}
/>
```

---

### 4. **AlertInboxView utilise des données MOCK au lieu de l'API**
**Gravité:** 🟠 MAJEUR

**Problème:**
- `AlertInboxView.tsx` ligne 88-109 charge des données mock au lieu d'utiliser les hooks React Query
- Commentaire "En production, ce serait un appel API" mais ce n'est jamais implémenté

**Fichier concerné:**
- `src/components/features/alerts/workspace/views/AlertInboxView.tsx`

**Code actuel (ligne 88-97):**
```typescript
const load = useCallback(async () => {
  setLoading(true);
  try {
    // En production, ce serait un appel API
    // const res = await fetch(`/api/alerts?queue=${queue}&...`);
    // const data = await res.json();
    
    // Pour le dev, on utilise les données mock
    await new Promise(resolve => setTimeout(resolve, 300)); // Simuler latence
    const loadedItems = filterAlertsByQueue(queue);
```

**Code à implémenter:**
```typescript
const { data, isLoading, refetch } = useAlertQueue(queue);
const items = data?.alerts || [];
```

---

### 5. **Calcul des stats en local au lieu d'utiliser l'API**
**Gravité:** 🟡 MINEUR

**Problème:**
- La page calcule les stats localement avec `calculateAlertStats()` au lieu d'utiliser `useAlertStats()`
- Ligne 270-273 dans `page.tsx`

**Impact:**
- Calculs côté client inutiles
- Pas de cohérence avec le backend
- Performance dégradée

---

### 6. **Mutations React Query NON utilisées**
**Gravité:** 🟠 MAJEUR

**Problème:**
- Les 11 mutation hooks créés ne sont PAS utilisés
- Les actions (acknowledge, resolve, escalate) appellent directement `alertsAPI` au lieu d'utiliser les mutations

**Fichier concerné:**
- `app/(portals)/maitre-ouvrage/alerts/page.tsx` (lignes 832-881)

**Code actuel (INCORRECT):**
```typescript
onConfirm={async (note) => {
  if (!selectedAlert?.id) return;
  try {
    await alertsAPI.acknowledge(String(selectedAlert.id), { note, userId: 'user-001' });
    toast.success('Alerte acquittée', 'Traçabilité enregistrée');
    refetchTimeline();
  } catch (e) {
    toast.error('Erreur', e instanceof Error ? e.message : 'Impossible d\'acquitter');
  }
}}
```

**Code à implémenter (CORRECT):**
```typescript
const acknowledgeAlert = useAcknowledgeAlert();

onConfirm={async (note) => {
  if (!selectedAlert?.id) return;
  await acknowledgeAlert.mutateAsync({
    id: String(selectedAlert.id),
    note,
    userId: 'user-001'
  });
}}
```

---

## 📊 RÉSUMÉ

| Catégorie | Critique | Majeur | Mineur | Total |
|-----------|----------|--------|--------|-------|
| Hooks non utilisés | 1 | 3 | 1 | 5 |
| Exports manquants | 0 | 1 | 0 | 1 |
| Composants non intégrés | 0 | 1 | 0 | 1 |
| **TOTAL** | **1** | **5** | **1** | **7** |

---

## 🎯 PRIORITÉS DE CORRECTION

### Priority 1 (URGENT):
1. ✅ Exporter les hooks dans `index.ts`
2. ✅ Remplacer `useApiQuery` par les hooks React Query spécifiques
3. ✅ Intégrer `BatchActionsBar` dans la page principale

### Priority 2 (IMPORTANT):
4. ✅ Utiliser les mutation hooks pour les actions
5. ✅ Connecter `AlertInboxView` aux hooks API

### Priority 3 (AMÉLIORATION):
6. ✅ Utiliser `useAlertStats()` au lieu du calcul local

---

## 📝 NOTES

- Tous les composants sont créés correctement
- Toutes les routes API sont fonctionnelles
- Le problème est uniquement dans la **connexion** entre les hooks et les composants
- Les corrections sont **non-destructives** et **rapides** à implémenter

