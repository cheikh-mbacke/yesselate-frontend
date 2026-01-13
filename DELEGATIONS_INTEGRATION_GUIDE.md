# 🎯 Guide d'Intégration Rapide - Délégations v2.0

## 📦 Composants Disponibles

### 1. Toast Notifications

```typescript
import { useDelegationToast } from '@/components/features/delegations/workspace/DelegationToast';

const toast = useDelegationToast();

// Utilisation
toast.success('Délégation créée !');
toast.error('Erreur', 'Description');
toast.warning('Attention !');
toast.info('Information');
```

### 2. Skeletons

```typescript
import { 
  DelegationDashboardSkeleton,
  DelegationListSkeleton,
  DelegationDetailSkeleton 
} from '@/components/features/delegations/workspace/DelegationSkeletons';

// Utilisation
{loading && <DelegationListSkeleton />}
```

### 3. Export Modal

```typescript
import { DelegationExportModal } from '@/components/features/delegations/workspace/DelegationExportModal';

<DelegationExportModal
  open={exportOpen}
  onClose={() => setExportOpen(false)}
  onExport={async (format) => {
    // 'csv', 'json', or 'pdf'
    await handleExport(format);
  }}
/>
```

### 4. Search Panel

```typescript
import { DelegationSearchPanel } from '@/components/features/delegations/workspace/DelegationSearchPanel';

<DelegationSearchPanel
  isOpen={searchOpen}
  onClose={() => setSearchOpen(false)}
  onSearch={(filters) => {
    // filters: { query, dateFrom, dateTo, bureaux[], status[], types[], priorite[] }
    applyFilters(filters);
  }}
/>
```

### 5. Active Filters

```typescript
import { DelegationActiveFilters } from '@/components/features/delegations/workspace/DelegationActiveFilters';

<DelegationActiveFilters
  filters={[
    { id: '1', label: 'Bureau', value: 'BMO', onRemove: () => {...} },
  ]}
  onClearAll={() => clearAll()}
/>
```

---

## 🚀 Quick Start

### Installation (déjà fait ✅)

Tous les composants sont déjà créés et intégrés dans la page Délégations.

### Utilisation dans d'autres pages

1. **Importer les composants**:
```typescript
import {
  DelegationToastProvider,
  useDelegationToast,
  DelegationExportModal,
  DelegationSearchPanel,
  DelegationActiveFilters,
  DelegationListSkeleton,
} from '@/components/features/delegations/workspace';
```

2. **Wrapper avec Provider** (obligatoire pour toast):
```typescript
export default function MyPage() {
  return (
    <DelegationToastProvider>
      <MyPageContent />
    </DelegationToastProvider>
  );
}
```

3. **Utiliser les hooks/composants**:
```typescript
function MyPageContent() {
  const toast = useDelegationToast();
  const [loading, setLoading] = useState(true);
  
  if (loading) return <DelegationListSkeleton />;
  
  return (
    <div>
      <button onClick={() => toast.success('Action réussie !')}>
        Test
      </button>
    </div>
  );
}
```

---

## 📝 Exemples Pratiques

### Exemple 1: Export avec Toast

```typescript
const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
  try {
    const data = await fetchDelegations();
    await exportToFile(data, format);
    toast.success('Export réussi !', `Fichier téléchargé en ${format.toUpperCase()}`);
  } catch (error) {
    toast.error('Échec de l\'export', error.message);
  }
};
```

### Exemple 2: Recherche avec Filtres Actifs

```typescript
const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

const handleSearch = (filters: SearchFilters) => {
  const newFilters: ActiveFilter[] = [];
  
  if (filters.bureaux.length > 0) {
    filters.bureaux.forEach(bureau => {
      newFilters.push({
        id: `bureau-${bureau}`,
        label: 'Bureau',
        value: bureau,
        onRemove: () => removeBureauFilter(bureau),
      });
    });
  }
  
  setActiveFilters(newFilters);
  applyFilters(filters);
};

return (
  <>
    <DelegationActiveFilters
      filters={activeFilters}
      onClearAll={() => {
        setActiveFilters([]);
        clearAllFilters();
      }}
    />
    <DelegationSearchPanel
      isOpen={searchOpen}
      onClose={() => setSearchOpen(false)}
      onSearch={handleSearch}
    />
  </>
);
```

### Exemple 3: Loading avec Skeleton

```typescript
const [data, setData] = useState<Delegation[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchDelegations();
      setData(result);
    } catch (error) {
      toast.error('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };
  
  loadData();
}, []);

if (loading) {
  return <DelegationListSkeleton />;
}

return (
  <div>
    {data.map(item => (
      <DelegationCard key={item.id} {...item} />
    ))}
  </div>
);
```

---

## 🎨 Personnalisation

### Toast

```typescript
// Durée personnalisée
toast.success('Message', 'Description', { duration: 10000 }); // 10s

// Toast sans description
toast.error('Erreur simple');
```

### Search Panel

Modifier les options dans le composant:

```typescript
// Dans DelegationSearchPanel.tsx
const bureaux = ['BMO', 'BF', 'BM', 'BA', 'BCT', 'BQC', 'BJ'];
const statuses = ['active', 'expiring_soon', 'expired', 'revoked', 'suspended'];
const types = ['Validation', 'Engagement', 'Paiement', 'Reporting'];
const priorities = ['urgent', 'high', 'normal', 'low'];
```

---

## 🔧 Troubleshooting

### Problème: Toast ne s'affiche pas

**Solution**: Vérifier que la page est wrappée avec `DelegationToastProvider`:
```typescript
export default function Page() {
  return (
    <DelegationToastProvider>
      <Content />
    </DelegationToastProvider>
  );
}
```

### Problème: Import non trouvé

**Solution**: Vérifier le chemin d'import:
```typescript
// ✅ Correct
import { DelegationExportModal } from '@/components/features/delegations/workspace';

// ❌ Incorrect
import { DelegationExportModal } from '@/components/features/delegations';
```

### Problème: TypeScript erreur sur `format`

**Solution**: Typer correctement:
```typescript
type ExportFormat = 'csv' | 'json' | 'pdf';

const handleExport = async (format: ExportFormat) => {
  // ...
};
```

---

## 📚 Références

- **Composants**: `/src/components/features/delegations/workspace/`
- **Types**: Voir les interfaces dans chaque composant
- **Page exemple**: `/app/(portals)/maitre-ouvrage/delegations/page.tsx`
- **Store**: `/src/lib/stores/delegationWorkspaceStore.ts`

---

## ✅ Checklist de Validation

Avant de déployer une page utilisant ces composants:

- [ ] Provider Toast ajouté si nécessaire
- [ ] Imports corrects depuis `/workspace`
- [ ] États de loading avec skeletons
- [ ] Messages toast pour feedback utilisateur
- [ ] Filtres actifs affichés si applicable
- [ ] Export modal avec callback `onExport`
- [ ] Tests dans dark mode
- [ ] Tests responsive (mobile/tablet/desktop)
- [ ] Pas d'erreur linter
- [ ] TypeScript compile sans erreur

---

## 🎯 Bonnes Pratiques

### Do ✅

- Utiliser les toasts pour TOUS les feedbacks utilisateur
- Afficher des skeletons pendant les chargements
- Typer correctement les callbacks d'export
- Gérer les erreurs avec try/catch + toast.error
- Utiliser les filtres actifs pour visibilité

### Don't ❌

- Ne PAS utiliser `alert()` ou `console.log()` pour feedback
- Ne PAS afficher "Loading..." en texte simple
- Ne PAS ignorer les erreurs silencieusement
- Ne PAS oublier le Provider Toast
- Ne PAS hardcoder les options de filtres

---

## 📞 Support

Si vous avez des questions:

1. Consulter ce guide
2. Lire `DELEGATIONS_FINAL_SUMMARY.md`
3. Vérifier `DELEGATIONS_CHANGELOG.md`
4. Examiner la page exemple (`page.tsx`)

---

**Version**: 2.0  
**Dernière mise à jour**: 9 janvier 2026  
**Status**: ✅ Production Ready


