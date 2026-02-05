# 🔍 AUDIT - Page Alerts (maitre-ouvrage/alerts)
## Rapport d'analyse - 10 janvier 2026

---

## ✅ Points positifs

1. **Architecture cohérente** : Sidebar + SubNav + KPIBar + StatusBar comme Gouvernance/Analytics
2. **Composants créés** : AlertsCommandSidebar, AlertsSubNavigation, AlertsKPIBar fonctionnels
3. **Pas d'erreurs de linter** : Code propre et bien formaté
4. **Raccourcis clavier** : Implémentés et cohérents
5. **Design visuel** : Cohérent avec le reste de l'application

---

## ❌ Problèmes critiques identifiés

### 1. **API Alertes incomplète** 🔴

**Problème** : L'API `alertsClient.ts` est très limitée comparée aux autres modules.

**Actuellement disponible** :
```typescript
- acknowledge(id, payload)
- resolve(id, payload)
- escalate(id, payload)
- getTimeline(params)
```

**Manque** :
```typescript
- getAlerts(filters) // Liste filtrée des alertes
- getAlertById(id) // Détails d'une alerte
- getStats() // Statistiques globales
- updateAlert(id, data) // Mettre à jour une alerte
- deleteAlert(id) // Supprimer une alerte
- assignAlert(id, userId) // Assigner une alerte
- bulkAction(ids, action) // Actions en masse
- searchAlerts(query) // Recherche textuelle
- getAlertsByQueue(queue) // Alertes par file
```

### 2. **Absence de hooks React Query** 🔴

**Problème** : Pas de hooks `useAlerts`, `useAcknowledgeAlert`, etc. comme dans Analytics.

**Besoin** :
```typescript
- useAlerts(filters)
- useAlertById(id)
- useAcknowledgeAlert()
- useResolveAlert()
- useEscalateAlert()
- useAlertStats()
- useAlertTimeline(params)
```

### 3. **Store incomplet** 🟡

**Problème** : Le store `alertWorkspaceStore` ne gère que les onglets, pas l'état global.

**Manque** :
- `selectedIds` pour sélection multiple
- `currentFilter` pour filtres actifs
- `watchlist` pour alertes suivies
- `viewMode` pour dashboard/workspace
- Méthodes de filtrage et recherche
- Méthodes de sélection en masse

### 4. **Données mockées dans les composants** 🟡

**Problème** : Les stats et KPIs utilisent des données statiques/mockées.

**Ligne 665-680** dans `page.tsx` :
```typescript
const formatLastUpdate = useCallback(() => {
  // ...données en dur...
}, [lastUpdate]);
```

**Solution** : Intégrer vraies données via API + hooks React Query.

### 5. **Filtres non fonctionnels** 🟡

**Problème** : Les filtres de niveau 3 sont affichés mais ne font rien.

**Code actuel** (ligne 142) :
```typescript
const [activeFilter, setActiveFilter] = useState<string | null>(null);
```

**Mais** : Aucune logique pour filtrer les alertes basé sur `activeFilter`.

### 6. **Absence de gestion d'erreurs** 🟡

**Problème** : Pas de gestion des erreurs réseau/API.

**Besoin** :
- Error boundaries
- States de chargement
- Messages d'erreur utilisateur
- Retry logic

### 7. **Absence de pagination** 🟠

**Problème** : Si 1000+ alertes, performance impactée.

**Besoin** :
- Pagination server-side
- Infinite scroll ou pagination classique
- Limits configurable (25/50/100)

### 8. **Notifications Panel statique** 🟠

**Problème** : Données en dur dans `NotificationsPanel` (ligne 1059-1063).

**Solution** : Connecter aux vraies notifications via WebSocket ou polling.

---

## 🔧 Améliorations recommandées

### A. **Implémentation prioritaire (P0)**

1. **Étendre l'API alertsClient.ts**
   ```typescript
   export const alertsAPI = {
     // Lecture
     getAlerts: (filters) => fetchJson('/api/alerts', { params: filters }),
     getAlertById: (id) => fetchJson(`/api/alerts/${id}`),
     getStats: () => fetchJson('/api/alerts/stats'),
     
     // Filtrage
     getAlertsByQueue: (queue, filters) => 
       fetchJson(`/api/alerts/queue/${queue}`, { params: filters }),
     searchAlerts: (query) => 
       fetchJson('/api/alerts/search', { params: { q: query } }),
     
     // Actions
     assignAlert: (id, userId) => 
       fetchJson(`/api/alerts/${id}/assign`, { 
         method: 'POST', 
         body: JSON.stringify({ userId }) 
       }),
     
     bulkAction: (ids, action) => 
       fetchJson('/api/alerts/bulk', {
         method: 'POST',
         body: JSON.stringify({ ids, action })
       }),
     
     // Exports
     exportAlerts: (filters, format) => 
       fetchJson('/api/alerts/export', {
         method: 'POST',
         body: JSON.stringify({ filters, format })
       }),
   }
   ```

2. **Créer useAlerts.ts hooks**
   ```typescript
   // src/lib/api/hooks/useAlerts.ts
   export function useAlerts(filters) { /* ... */ }
   export function useAlertStats() { /* ... */ }
   export function useAcknowledgeAlert() { /* ... */ }
   // etc.
   ```

3. **Enrichir le store**
   ```typescript
   interface AlertWorkspaceState {
     // ... existant ...
     selectedIds: Set<string>;
     currentFilter: AlertFilter;
     watchlist: string[];
     viewMode: 'dashboard' | 'workspace';
     
     // Nouvelles actions
     toggleSelected: (id: string) => void;
     selectAll: (ids: string[]) => void;
     clearSelection: () => void;
     setFilter: (filter: Partial<AlertFilter>) => void;
     addToWatchlist: (id: string) => void;
   }
   ```

### B. **Améliorations UX (P1)**

4. **Actions en masse**
   - Checkbox pour sélection multiple
   - Barre d'actions en bas (Acquitter, Résoudre, Escalader)
   - Badge de sélection dans header

5. **Recherche avancée**
   - Recherche full-text
   - Filtres combinés (ET/OU)
   - Sauvegarde des recherches

6. **Notifications en temps réel**
   - WebSocket pour nouvelles alertes
   - Toast notifications
   - Badge animé sur sidebar

7. **Tri et ordonnancement**
   - Tri par date/priorité/statut
   - Drag & drop pour réordonnancer
   - Groupement par catégorie

### C. **Performance (P2)**

8. **Pagination et virtualisation**
   ```typescript
   - React Virtual pour listes longues
   - Pagination server-side
   - Lazy loading
   ```

9. **Cache et optimisation**
   ```typescript
   - React Query cache
   - Optimistic updates
   - Prefetching
   ```

10. **Debounce recherche**
    ```typescript
    - Debounce 300ms sur recherche
    - Cancel requêtes précédentes
    ```

---

## 📋 Checklist d'implémentation

### Phase 1 : APIs & Data (1-2 jours)
- [ ] Étendre `alertsClient.ts` avec endpoints manquants
- [ ] Créer `useAlerts.ts` hooks React Query
- [ ] Implémenter endpoints API backend (/api/alerts/*)
- [ ] Tester tous les endpoints

### Phase 2 : Store & State (1 jour)
- [ ] Enrichir `alertWorkspaceStore` 
- [ ] Ajouter sélection multiple
- [ ] Ajouter filtres persistants
- [ ] Ajouter watchlist

### Phase 3 : UI & UX (2 jours)
- [ ] Actions en masse (barre d'actions)
- [ ] Recherche avancée
- [ ] Gestion d'erreurs
- [ ] Loading states

### Phase 4 : Real-time (1 jour)
- [ ] WebSocket notifications
- [ ] Toast notifications
- [ ] Auto-refresh intelligent

### Phase 5 : Performance (1 jour)
- [ ] Pagination
- [ ] Virtualisation
- [ ] Optimistic updates

---

## 🎯 Recommandations finales

### Priorité immédiate
1. **Implémenter API complète** (sans ça, la page ne peut pas fonctionner)
2. **Créer hooks React Query** (pour gérer état et cache)
3. **Connecter les vrais data** (remplacer mocks par vraies données)

### Court terme
4. Actions en masse
5. Recherche avancée
6. Gestion d'erreurs

### Moyen terme
7. Notifications temps réel
8. Performance optimizations

---

## 📊 Impact estimé

| Aspect | État actuel | Après corrections |
|--------|-------------|-------------------|
| Fonctionnalité | 40% | 95% |
| UX | 60% | 90% |
| Performance | N/A | 85% |
| Maintenabilité | 70% | 90% |

**Temps estimé** : 5-7 jours de dev + tests

---

## 💡 Code samples pour démarrer rapidement

Voir fichiers suivants à créer :
1. `src/lib/api/pilotage/alertsClient.ts` (à étendre)
2. `src/lib/api/hooks/useAlerts.ts` (nouveau)
3. `src/lib/stores/alertWorkspaceStore.ts` (à enrichir)


