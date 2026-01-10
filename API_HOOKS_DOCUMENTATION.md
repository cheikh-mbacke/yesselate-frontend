# 📚 Documentation - Hooks API Délégations

## Vue d'Ensemble

Les hooks API Délégations fournissent une interface React moderne et typée pour interagir avec l'API backend des délégations. Ils gèrent automatiquement :

- ✅ **Gestion d'état** (loading, error, success)
- ✅ **Annulation des requêtes** (AbortController)
- ✅ **Auto-refresh** configurable
- ✅ **TypeScript** strict
- ✅ **Gestion d'erreurs** intégrée
- ✅ **Optimisation** des re-renders

---

## Installation

Les hooks sont déjà installés ! Importez-les depuis `@/hooks` :

```typescript
import {
  useDelegations,
  useDelegationStats,
  useDelegationAlerts,
  useDelegationInsights,
  useCreateDelegation,
  useUpdateDelegation,
  useRevokeDelegation,
  useSuspendDelegation,
  useExtendDelegation,
  useBulkDelegationAction,
} from '@/hooks';
```

---

## Hooks de Lecture (Queries)

### 1. `useDelegations`

Charge une liste de délégations avec filtres, tri et pagination.

**Signature:**
```typescript
function useDelegations(options?: UseDelegationsOptions): UseDelegationsResult
```

**Options:**
```typescript
interface UseDelegationsOptions {
  queue?: string;             // 'all' | 'active' | 'expiring_soon' | 'expired' | 'revoked' | 'suspended'
  bureau?: string;            // 'BMO' | 'BF' | 'BM' ...
  type?: string;              // 'Validation' | 'Engagement' ...
  search?: string;            // Recherche textuelle
  dateFrom?: string;          // Date début (ISO format)
  dateTo?: string;            // Date fin (ISO format)
  sortField?: string;         // 'id' | 'type' | 'endDate' ...
  sortDir?: 'asc' | 'desc';
  page?: number;              // Numéro de page (défaut: 1)
  limit?: number;             // Items par page (défaut: 50)
  autoRefresh?: boolean;      // Auto-refresh activé
  refreshInterval?: number;   // Intervalle en ms (défaut: 60000)
}
```

**Retour:**
```typescript
interface UseDelegationsResult {
  data: Delegation[];         // Liste des délégations
  total: number;              // Nombre total
  loading: boolean;           // En cours de chargement
  error: string | null;       // Message d'erreur
  refresh: () => Promise<void>; // Fonction de refresh manuelle
}
```

**Exemple 1 - Basique:**
```typescript
function MyComponent() {
  const { data, loading, error } = useDelegations({
    queue: 'active',
  });

  if (loading) return <Skeleton />;
  if (error) return <Error message={error} />;

  return (
    <div>
      {data.map(delegation => (
        <DelegationCard key={delegation.id} {...delegation} />
      ))}
    </div>
  );
}
```

**Exemple 2 - Avec filtres:**
```typescript
function FilteredList() {
  const [bureau, setBureau] = useState('BMO');
  const [search, setSearch] = useState('');

  const { data, loading, refresh } = useDelegations({
    queue: 'active',
    bureau,
    search,
    sortField: 'endDate',
    sortDir: 'asc',
    autoRefresh: true,
    refreshInterval: 30000, // 30 secondes
  });

  return (
    <div>
      <input 
        value={search} 
        onChange={(e) => setSearch(e.target.value)} 
      />
      <select value={bureau} onChange={(e) => setBureau(e.target.value)}>
        <option value="BMO">BMO</option>
        <option value="BF">BF</option>
      </select>
      <button onClick={refresh}>Actualiser</button>
      
      {loading ? <Skeleton /> : (
        <ul>
          {data.map(d => <li key={d.id}>{d.type} - {d.agentName}</li>)}
        </ul>
      )}
    </div>
  );
}
```

---

### 2. `useDelegationStats`

Charge les statistiques globales des délégations.

**Signature:**
```typescript
function useDelegationStats(options?: {
  autoRefresh?: boolean;
  refreshInterval?: number;
}): UseStatsResult
```

**Retour:**
```typescript
interface UseStatsResult {
  data: DelegationStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface DelegationStats {
  total: number;
  active: number;
  expired: number;
  revoked: number;
  suspended: number;
  expiringSoon: number;
  totalUsage: number;
  byBureau: { bureau: string; count: number }[];
  byType: { type: string; count: number }[];
  recentActivity: DelegationEvent[];
  ts: string;
}
```

**Exemple:**
```typescript
function StatsWidget() {
  const { data, loading, refresh } = useDelegationStats({
    autoRefresh: true,
    refreshInterval: 30000,
  });

  if (!data) return null;

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Total" value={data.total} />
      <StatCard label="Actives" value={data.active} color="green" />
      <StatCard label="Expirées" value={data.expired} color="gray" />
      <StatCard label="Expirant bientôt" value={data.expiringSoon} color="amber" />
    </div>
  );
}
```

---

### 3. `useDelegationAlerts`

Charge les alertes critiques.

**Signature:**
```typescript
function useDelegationAlerts(options?: {
  autoRefresh?: boolean;
  refreshInterval?: number;
}): UseAlertsResult
```

**Retour:**
```typescript
interface UseAlertsResult {
  data: AlertsResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  dismissAlert: (id: string) => void; // Dismiss une alerte
}
```

**Exemple:**
```typescript
function AlertsBanner() {
  const { data, loading, dismissAlert } = useDelegationAlerts({
    autoRefresh: true,
    refreshInterval: 60000,
  });

  if (!data || data.alerts.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
      <h3 className="font-bold">{data.summary.critical} alertes critiques</h3>
      {data.alerts.map(alert => (
        <div key={alert.id} className="flex justify-between">
          <span>{alert.message}</span>
          <button onClick={() => dismissAlert(alert.id)}>X</button>
        </div>
      ))}
    </div>
  );
}
```

---

### 4. `useDelegationInsights`

Charge les insights et recommandations.

**Signature:**
```typescript
function useDelegationInsights(options?: {
  autoRefresh?: boolean;
  refreshInterval?: number;
}): UseInsightsResult
```

**Exemple:**
```typescript
function InsightsPanel() {
  const { data, loading } = useDelegationInsights({
    autoRefresh: true,
    refreshInterval: 300000, // 5 minutes
  });

  if (loading || !data) return <Skeleton />;

  return (
    <div>
      <h3>Recommandations</h3>
      {data.recommendations.map(rec => (
        <div key={rec.id} className={`alert-${rec.priority.toLowerCase()}`}>
          <h4>{rec.title}</h4>
          <p>{rec.description}</p>
        </div>
      ))}
      
      <h3>Score de Risque: {data.riskScore.overall}/100</h3>
    </div>
  );
}
```

---

## Hooks de Mutation (Actions)

### 5. `useCreateDelegation`

Crée une nouvelle délégation.

**Signature:**
```typescript
function useCreateDelegation(options?: {
  onSuccess?: (delegation: any) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<CreateDelegationData>
```

**Exemple:**
```typescript
function CreateDelegationForm() {
  const toast = useDelegationToast();
  const navigate = useNavigate();
  
  const { execute, loading, error } = useCreateDelegation({
    onSuccess: (delegation) => {
      toast.success('Délégation créée !', `ID: ${delegation.id}`);
      navigate(`/delegations/${delegation.id}`);
    },
    onError: (err) => {
      toast.error('Échec de création', err.message);
    },
  });

  const handleSubmit = async (formData) => {
    await execute({
      type: formData.type,
      bureau: formData.bureau,
      agentName: formData.agentName,
      actorName: formData.actorName,
      startDate: formData.startDate,
      endDate: formData.endDate,
      maxAmount: formData.maxAmount,
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(formData); }}>
      {/* Formulaire */}
      <button type="submit" disabled={loading}>
        {loading ? 'Création...' : 'Créer'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
```

---

### 6. `useUpdateDelegation`

Met à jour une délégation existante.

**Exemple:**
```typescript
function EditDelegation({ id }) {
  const toast = useDelegationToast();
  
  const { execute, loading } = useUpdateDelegation({
    onSuccess: () => {
      toast.success('Mise à jour réussie !');
    },
  });

  const handleUpdate = async (changes) => {
    await execute({
      id,
      data: changes,
    });
  };

  return (
    <button 
      onClick={() => handleUpdate({ maxAmount: 100000 })}
      disabled={loading}
    >
      Augmenter le montant
    </button>
  );
}
```

---

### 7. `useRevokeDelegation`

Révoque une délégation.

**Exemple:**
```typescript
function RevokeButton({ delegationId }) {
  const toast = useDelegationToast();
  
  const { execute, loading } = useRevokeDelegation({
    onSuccess: () => {
      toast.success('Délégation révoquée');
    },
  });

  const handleRevoke = async () => {
    if (confirm('Êtes-vous sûr ?')) {
      await execute({
        id: delegationId,
        reason: 'Fin de mission',
      });
    }
  };

  return (
    <button onClick={handleRevoke} disabled={loading}>
      Révoquer
    </button>
  );
}
```

---

### 8. `useBulkDelegationAction`

Effectue une action en masse.

**Exemple:**
```typescript
function BulkActions({ selectedIds }) {
  const toast = useDelegationToast();
  
  const { execute, loading } = useBulkDelegationAction({
    onSuccess: (result) => {
      toast.success(
        'Action terminée',
        `${result.success} réussies, ${result.failed} échecs`
      );
    },
  });

  const handleExtendAll = async () => {
    await execute({
      action: 'extend',
      ids: selectedIds,
      params: { newEndDate: '2027-12-31' },
    });
  };

  return (
    <button onClick={handleExtendAll} disabled={loading}>
      Prolonger toutes ({selectedIds.length})
    </button>
  );
}
```

---

## Patterns d'Utilisation Avancés

### Pattern 1: Combinaison de hooks

```typescript
function DelegationDashboard() {
  const { data: delegations } = useDelegations({ queue: 'active' });
  const { data: stats } = useDelegationStats({ autoRefresh: true });
  const { data: alerts } = useDelegationAlerts({ autoRefresh: true });

  return (
    <div>
      <StatsOverview stats={stats} />
      <AlertsBanner alerts={alerts} />
      <DelegationList items={delegations} />
    </div>
  );
}
```

### Pattern 2: Optimistic Updates

```typescript
function QuickRevoke({ delegation }) {
  const queryClient = useQueryClient();
  const toast = useDelegationToast();
  
  const { execute } = useRevokeDelegation({
    onSuccess: () => {
      // Optimistic update: mettre à jour le cache immédiatement
      queryClient.setQueryData(['delegations'], (old) => 
        old.map(d => d.id === delegation.id ? { ...d, status: 'revoked' } : d)
      );
      toast.success('Délégation révoquée !');
    },
  });

  return <button onClick={() => execute({ id: delegation.id })}>Révoquer</button>;
}
```

### Pattern 3: Dépendances entre hooks

```typescript
function DelegationDetailPage({ id }) {
  // Charger la délégation
  const { data: delegation, loading } = useDelegations({
    search: id,
    limit: 1,
  });

  // Charger les insights SEULEMENT si délégation chargée
  const { data: insights } = useDelegationInsights({
    autoRefresh: delegation ? true : false,
  });

  if (loading) return <Skeleton />;
  if (!delegation) return <NotFound />;

  return (
    <div>
      <DelegationHeader delegation={delegation} />
      <InsightsPanel insights={insights} />
    </div>
  );
}
```

---

## Best Practices

### ✅ À FAIRE

1. **Toujours gérer les états loading et error**
```typescript
const { data, loading, error } = useDelegations();

if (loading) return <Skeleton />;
if (error) return <Error message={error} />;
```

2. **Utiliser auto-refresh pour données temps réel**
```typescript
useDelegationStats({ autoRefresh: true, refreshInterval: 30000 });
```

3. **Cleanup automatique** (déjà géré par les hooks)

4. **TypeScript strict**
```typescript
const { data }: UseDelegationsResult = useDelegations();
```

### ❌ À ÉVITER

1. **Ne PAS fetch manuellement dans useEffect**
```typescript
// ❌ Mauvais
useEffect(() => {
  fetch('/api/delegations').then(...);
}, []);

// ✅ Bon
const { data } = useDelegations();
```

2. **Ne PAS ignorer les erreurs**
```typescript
// ❌ Mauvais
const { data } = useDelegations(); // error ignoré

// ✅ Bon
const { data, error } = useDelegations();
if (error) toast.error('Erreur', error);
```

3. **Ne PAS abuser de l'auto-refresh**
```typescript
// ❌ Mauvais (trop fréquent)
useDelegations({ autoRefresh: true, refreshInterval: 1000 }); // Chaque seconde !

// ✅ Bon
useDelegations({ autoRefresh: true, refreshInterval: 60000 }); // Chaque minute
```

---

## Troubleshooting

### Problème: Requêtes infinies

**Cause**: Dépendances instables dans les options

**Solution**: Mémoizer les options
```typescript
const options = useMemo(() => ({
  queue: 'active',
  bureau: selectedBureau,
}), [selectedBureau]);

const { data } = useDelegations(options);
```

### Problème: Data not updating

**Cause**: Auto-refresh désactivé ou cache stale

**Solution**: Forcer refresh manuel
```typescript
const { data, refresh } = useDelegations();

useEffect(() => {
  refresh(); // Force reload
}, [someDependency]);
```

### Problème: Memory leak warning

**Cause**: Hook non nettoyé (rare, déjà géré)

**Solution**: Les hooks gèrent automatiquement le cleanup avec AbortController

---

## API Reference Complète

Voir les types détaillés dans:
- `src/hooks/useDelegationAPI.ts`
- `src/hooks/useDelegationMutations.ts`

---

**Version**: 2.0  
**Dernière mise à jour**: 9 janvier 2026  
**Status**: ✅ Production Ready


