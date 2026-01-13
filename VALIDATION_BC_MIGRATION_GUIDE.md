# 🎯 Guide de Migration - Validation-BC v2.0

## 📦 Fichiers Créés

### Nouveaux Composants Command Center

```
src/components/features/validation-bc/command-center/
├── ValidationBCCommandSidebar.tsx    ← Sidebar de navigation (10 catégories)
├── ValidationBCSubNavigation.tsx     ← Breadcrumb + sous-onglets
├── ValidationBCKPIBar.tsx            ← 8 indicateurs temps réel
└── index.ts                          ← Exports centralisés
```

### Page Refactorisée

```
app/(portals)/maitre-ouvrage/validation-bc/
└── page.tsx                          ← Architecture complète v2.0
```

### Documentation

```
VALIDATION_BC_COMMAND_CENTER_V2.md    ← Documentation technique
VALIDATION_BC_AVANT_APRES_V2.md       ← Comparaison visuelle
VALIDATION_BC_MIGRATION_GUIDE.md      ← Ce fichier
```

---

## 🚀 Comment Utiliser les Nouveaux Composants

### 1. Imports Requis

```tsx
import {
  ValidationBCCommandSidebar,
  ValidationBCSubNavigation,
  ValidationBCKPIBar,
  validationBCCategories,
} from '@/components/features/validation-bc/command-center';
```

### 2. État de Navigation

```tsx
// Catégorie active (sidebar)
const [activeCategory, setActiveCategory] = useState('overview');

// Sous-catégorie active (sub-nav)
const [activeSubCategory, setActiveSubCategory] = useState('all');

// État de collapse
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
const [kpiBarCollapsed, setKpiBarCollapsed] = useState(false);

// Historique de navigation (pour le back button)
const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
```

### 3. Structure HTML

```tsx
<div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
  {/* Sidebar */}
  <ValidationBCCommandSidebar
    activeCategory={activeCategory}
    collapsed={sidebarCollapsed}
    onCategoryChange={handleCategoryChange}
    onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
    onOpenCommandPalette={() => setCommandPaletteOpen(true)}
  />

  {/* Main Content */}
  <div className="flex-1 flex flex-col overflow-hidden">
    {/* Header */}
    <header>...</header>

    {/* Sub Navigation */}
    <ValidationBCSubNavigation
      mainCategory={activeCategory}
      mainCategoryLabel={currentCategoryLabel}
      subCategory={activeSubCategory}
      subCategories={currentSubCategories}
      onSubCategoryChange={setActiveSubCategory}
    />

    {/* KPI Bar */}
    <ValidationBCKPIBar
      visible={true}
      collapsed={kpiBarCollapsed}
      onToggleCollapse={() => setKpiBarCollapsed(!kpiBarCollapsed)}
      onRefresh={handleRefresh}
    />

    {/* Content */}
    <main className="flex-1 overflow-hidden">
      {/* Votre contenu ici */}
    </main>

    {/* Status Bar */}
    <footer>...</footer>
  </div>
</div>
```

---

## 🔧 Configuration des Sous-Catégories

### Définir les Sous-Catégories

```tsx
const subCategoriesMap: Record<string, SubCategory[]> = {
  bc: [
    { id: 'all', label: 'Tous', badge: 23 },
    { id: 'pending', label: 'En attente', badge: 15, badgeType: 'warning' },
    { id: 'validated', label: 'Validés', badge: 8 },
  ],
  factures: [
    { id: 'all', label: 'Toutes', badge: 15 },
    { id: 'pending', label: 'En attente', badge: 9, badgeType: 'warning' },
    { id: 'validated', label: 'Validées', badge: 6 },
  ],
  urgents: [
    { id: 'all', label: 'Tous', badge: 12, badgeType: 'critical' },
    { id: 'sla', label: 'Dépassement SLA', badge: 5, badgeType: 'critical' },
    { id: 'montant', label: 'Montant élevé', badge: 7, badgeType: 'warning' },
  ],
  // ... autres catégories
};
```

### Récupérer les Sous-Catégories

```tsx
const currentSubCategories = useMemo(() => {
  return subCategoriesMap[activeCategory] || [];
}, [activeCategory]);
```

---

## 🎨 Personnaliser les KPIs

### KPIs par Défaut

Les KPIs par défaut sont définis dans `ValidationBCKPIBar.tsx`. Pour les personnaliser :

```tsx
const customKPIs: KPIItem[] = [
  {
    id: 'total-documents',
    label: 'Documents Total',
    value: 156,
    trend: 'up',
    trendValue: '+8',
    status: 'neutral',
  },
  {
    id: 'en-attente',
    label: 'En Attente',
    value: 46,
    trend: 'down',
    trendValue: '-3',
    status: 'warning',
    sparkline: [52, 50, 48, 47, 46], // Données pour le mini graphique
  },
  // ... autres KPIs
];

<ValidationBCKPIBar
  kpisData={customKPIs}  // ← Passer vos KPIs personnalisés
  onRefresh={handleRefresh}
/>
```

### Types de Statut KPI

- `success` : Vert (emerald-400) - Valeur positive
- `warning` : Jaune (amber-400) - Attention requise
- `critical` : Rouge (red-400) - Action urgente
- `neutral` : Gris (slate-300) - Information neutre

### Tendances

- `up` : Tendance à la hausse (↗️)
- `down` : Tendance à la baisse (↘️)
- `stable` : Stable (→)

---

## ⌨️ Raccourcis Clavier

### Implémentation

```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const isMod = e.metaKey || e.ctrlKey;

    // ⌘K - Command Palette
    if (isMod && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      setCommandPaletteOpen(true);
    }

    // ⌘B - Toggle Sidebar
    if (isMod && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      setSidebarCollapsed(prev => !prev);
    }

    // F11 - Fullscreen
    if (e.key === 'F11') {
      e.preventDefault();
      setIsFullScreen(prev => !prev);
    }

    // Alt+← - Go Back
    if (e.altKey && e.key === 'ArrowLeft') {
      e.preventDefault();
      handleGoBack();
    }

    // ⌘N - Quick Create
    if (isMod && e.key === 'n') {
      e.preventDefault();
      setQuickCreateOpen(true);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [handleGoBack]);
```

---

## 🔄 Gestion de l'Historique de Navigation

### Ajouter à l'Historique

```tsx
const handleCategoryChange = useCallback((category: string) => {
  // Sauvegarder la catégorie actuelle dans l'historique
  setNavigationHistory(prev => [...prev, activeCategory]);
  
  // Changer de catégorie
  setActiveCategory(category);
  setActiveSubCategory('all'); // Reset sub-category
}, [activeCategory]);
```

### Retour Arrière

```tsx
const handleGoBack = useCallback(() => {
  if (navigationHistory.length > 0) {
    // Récupérer la dernière catégorie
    const previous = navigationHistory[navigationHistory.length - 1];
    
    // Retirer de l'historique
    setNavigationHistory(prev => prev.slice(0, -1));
    
    // Revenir à la catégorie précédente
    setActiveCategory(previous);
    setActiveSubCategory('all');
  }
}, [navigationHistory]);
```

### Back Button (Optionnel)

```tsx
{navigationHistory.length > 0 && (
  <Button
    variant="ghost"
    size="sm"
    onClick={handleGoBack}
    className="h-8 w-8 p-0"
    title="Retour (Alt+←)"
  >
    <ChevronLeft className="h-4 w-4" />
  </Button>
)}
```

---

## 📊 Intégration API

### Charger les Stats

```tsx
const loadStats = useCallback(
  async (reason: 'init' | 'manual' | 'auto' = 'manual') => {
    abortStatsRef.current?.abort();
    const ac = new AbortController();
    abortStatsRef.current = ac;

    setStatsLoading(true);

    try {
      // Appel API réel
      const stats = await getValidationStats(reason, ac.signal);
      
      if (ac.signal.aborted) return;

      setStatsData(stats);
      
      if (reason === 'manual') {
        toast.success('Données actualisées', `${stats.total} documents`);
      }
    } catch (error) {
      if (ac.signal.aborted) return;
      
      console.error('Erreur chargement stats:', error);
      
      // Fallback sur données mockées si nécessaire
      setStatsData(mockStats);
      
      if (reason === 'manual') {
        toast.error('Erreur réseau', 'Données en mode hors ligne');
      }
    } finally {
      setStatsLoading(false);
    }
  },
  [toast]
);
```

### Auto-Refresh

```tsx
// Refresh toutes les 60 secondes
useInterval(
  () => { loadStats('auto'); },
  60_000
);

// Helper useInterval
function useInterval(fn: () => void, delay: number | null): void {
  const ref = useRef(fn);
  useEffect(() => { ref.current = fn; }, [fn]);
  useEffect(() => {
    if (delay === null) return;
    const id = window.setInterval(() => ref.current(), delay);
    return () => window.clearInterval(id);
  }, [delay]);
}
```

---

## 🎨 Personnalisation du Design

### Modifier les Couleurs

```tsx
// Dans ValidationBCCommandSidebar.tsx
const Icon = category.icon;
const isActive = activeCategory === category.id;

<div className={cn(
  'transition-all',
  isActive 
    ? 'bg-blue-500/10 border-blue-500/30'  // ← Changer ici
    : 'hover:bg-slate-700/40'
)} />
```

### Modifier les Icônes

```tsx
// Dans ValidationBCCommandSidebar.tsx
export const validationBCCategories: SidebarCategory[] = [
  { id: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: 'bc', label: 'Bons de Commande', icon: ShoppingCart }, // ← Changer l'icône
  // ...
];
```

### Ajouter une Nouvelle Catégorie

```tsx
// 1. Ajouter dans validationBCCategories
{ id: 'ma-categorie', label: 'Ma Catégorie', icon: Star, badge: 5 },

// 2. Ajouter les sous-catégories
const subCategoriesMap = {
  // ...
  'ma-categorie': [
    { id: 'all', label: 'Tous' },
    { id: 'actifs', label: 'Actifs', badge: 3 },
  ],
};

// 3. Gérer le contenu
{activeCategory === 'ma-categorie' && (
  <MaCategorieComponent />
)}
```

---

## 🧪 Tests

### Tester la Navigation

```tsx
// 1. Cliquer sur une catégorie dans la sidebar
// 2. Vérifier que la breadcrumb se met à jour
// 3. Vérifier que les sous-catégories s'affichent
// 4. Cliquer sur "Retour" et vérifier le retour

// 5. Test des raccourcis
// - Appuyer sur ⌘K → Command palette s'ouvre
// - Appuyer sur ⌘B → Sidebar se collapse
// - Appuyer sur F11 → Plein écran
// - Appuyer sur Alt+← → Retour arrière
```

### Tester les KPIs

```tsx
// 1. Vérifier que les 8 KPIs s'affichent
// 2. Vérifier les sparklines sur 3 KPIs
// 3. Cliquer sur le bouton collapse → KPIs se cachent
// 4. Cliquer sur refresh → Animation de rotation
// 5. Attendre 60s → Auto-refresh se déclenche
```

---

## 🐛 Dépannage

### Problème : Sidebar ne se collapse pas

**Solution** :
```tsx
// Vérifier que l'état est bien géré
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

// Vérifier le callback
onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
```

### Problème : KPIs ne se mettent pas à jour

**Solution** :
```tsx
// Vérifier que loadStats() est appelé
useEffect(() => {
  loadStats('init');
}, [loadStats]);

// Vérifier l'auto-refresh
useInterval(() => { loadStats('auto'); }, 60_000);
```

### Problème : Sous-catégories ne s'affichent pas

**Solution** :
```tsx
// Vérifier que la catégorie existe dans subCategoriesMap
const currentSubCategories = useMemo(() => {
  return subCategoriesMap[activeCategory] || [];
}, [activeCategory]);

// Si vide, ajouter dans subCategoriesMap
```

### Problème : Breadcrumb incorrect

**Solution** :
```tsx
// Vérifier currentCategoryLabel
const currentCategoryLabel = useMemo(() => {
  return validationBCCategories.find(c => c.id === activeCategory)?.label || '';
}, [activeCategory]);

// Passer à SubNavigation
<ValidationBCSubNavigation
  mainCategoryLabel={currentCategoryLabel}
  // ...
/>
```

---

## 📚 Ressources

### Composants UI Utilisés

- `Button` : `@/components/ui/button`
- `Badge` : `@/components/ui/badge`
- `DropdownMenu` : `@/components/ui/dropdown-menu`
- `cn` : `@/lib/utils` (classnames utility)

### Icônes Lucide

```tsx
import {
  FileCheck,
  Search,
  Bell,
  ChevronLeft,
  RefreshCw,
  Plus,
  Download,
  Settings,
  MoreHorizontal,
  // ... et plus
} from 'lucide-react';
```

### Documentation Similaire

- `ANALYTICS_WORKSPACE_COMPLETE.md` - Architecture Analytics
- `GOVERNANCE_SUMMARY.md` - Architecture Gouvernance
- `VALIDATION_BC_COMMAND_CENTER_V2.md` - Doc technique Validation-BC

---

## ✅ Checklist de Migration

Pour migrer une page existante vers cette architecture :

- [ ] Créer le dossier `command-center/` pour la page
- [ ] Créer `CommandSidebar.tsx` avec les catégories
- [ ] Créer `SubNavigation.tsx` avec breadcrumb
- [ ] Créer `KPIBar.tsx` avec les indicateurs
- [ ] Créer `index.ts` pour les exports
- [ ] Refactorer `page.tsx` avec le nouveau layout
- [ ] Ajouter les raccourcis clavier
- [ ] Gérer l'historique de navigation
- [ ] Intégrer l'API pour les stats
- [ ] Ajouter l'auto-refresh
- [ ] Tester tous les raccourcis
- [ ] Vérifier le responsive
- [ ] Documenter dans un fichier MD

---

## 🎉 Résultat Final

Après cette migration, votre page dispose de :

✅ **Sidebar** collapsible avec catégories et badges  
✅ **SubNavigation** avec breadcrumb et sous-onglets  
✅ **KPIBar** avec indicateurs temps réel et sparklines  
✅ **Header** moderne avec actions et recherche  
✅ **Status Bar** avec stats et connexion  
✅ **Raccourcis clavier** puissants  
✅ **Design cohérent** avec Analytics et Gouvernance  

**Architecture de niveau professionnel** 🚀

---

## 💡 Conseils Pro

1. **Toujours memoize** les valeurs calculées
2. **Utilisez useCallback** pour les fonctions passées en props
3. **AbortController** pour annuler les requêtes API
4. **localStorage** pour persister l'état de navigation
5. **Skeleton loaders** pendant le chargement
6. **Toast notifications** pour le feedback utilisateur
7. **Keyboard shortcuts** pour la productivité

---

## 📞 Support

En cas de problème, consultez :
- Documentation technique : `VALIDATION_BC_COMMAND_CENTER_V2.md`
- Comparaison avant/après : `VALIDATION_BC_AVANT_APRES_V2.md`
- Code source : `src/components/features/validation-bc/command-center/`

**Bon développement !** 🎨

