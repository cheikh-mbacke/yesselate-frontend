# 🔧 Correction de l'erreur "Rendered fewer hooks than expected"

## ❌ Problème identifié

L'erreur "Rendered fewer hooks than expected" se produit quand le nombre de hooks appelés change entre les rendus. Cela peut arriver si :
1. Un hook est appelé conditionnellement
2. Un early return est fait avant tous les hooks
3. L'ordre des hooks change entre les renders

## ✅ Corrections effectuées

### 1. **Ordre des hooks corrigé**

**Avant (INCORRECT)** :
```typescript
// Computed values
const stats = useMemo(() => { ... }, [statsData]);

// Stats depuis le nouveau hook - appelé APRÈS useMemo
const { data: statsData } = useAlertesStats();
```

**Après (CORRECT)** :
```typescript
// React Query hooks - TOUS les hooks doivent être appelés dans le même ordre
const { data: timelineData } = useAlertTimeline({ days: 7 });
const { data: statsQueryData } = useAlertStats();

// Stats depuis le nouveau hook - DOIT être appelé ici, pas plus tard
const { data: statsData } = useAlertesStats();

// Computed values - APRÈS tous les hooks
const stats = useMemo(() => { ... }, [statsData]);
```

### 2. **Accès sécurisé aux propriétés**

**Avant** :
```typescript
critical: statsData.parSeverite.critical || 0,
```

**Après** :
```typescript
const parSeverite = statsData.parSeverite || {};
const parStatut = statsData.parStatut || {};
critical: parSeverite.critical || 0,
```

### 3. **Suppression de code obsolète**

- ❌ Supprimé `const [stats, setStats] = useState<AlertStats | null>(null);`
- ❌ Supprimé `const [statsLoading, setStatsLoading] = useState(false);`
- ❌ Supprimé `loadStats()` function
- ❌ Supprimé `abortStatsRef`
- ❌ Supprimé `type LoadReason`

## 📋 Règles importantes pour les hooks React

1. **Tous les hooks doivent être appelés** :
   - Dans le même ordre à chaque render
   - Avant toute logique conditionnelle
   - Avant les computed values (`useMemo`, `useCallback`, etc.)

2. **Structure recommandée** :
```typescript
function MyComponent() {
  // 1. Hooks de store (Zustand, etc.)
  const store = useMyStore();
  
  // 2. Hooks React Query
  const { data } = useMyQuery();
  
  // 3. Hooks d'état local
  const [state, setState] = useState();
  
  // 4. Hooks d'effet
  useEffect(() => { ... }, []);
  
  // 5. Computed values (useMemo, useCallback)
  const computed = useMemo(() => { ... }, [deps]);
  
  // 6. Handlers
  const handleClick = useCallback(() => { ... }, [deps]);
  
  // 7. Render
  return <div>...</div>;
}
```

## ✅ Vérifications

- [x] Tous les hooks sont appelés dans le même ordre
- [x] Aucun hook conditionnel
- [x] Aucun early return avant les hooks
- [x] Accès sécurisé aux propriétés
- [x] Code obsolète supprimé

## 🎯 Résultat

L'erreur "Rendered fewer hooks than expected" devrait maintenant être résolue. Le composant suit les règles des hooks React et tous les hooks sont appelés de manière constante à chaque render.

