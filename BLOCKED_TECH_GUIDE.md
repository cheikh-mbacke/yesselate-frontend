# 🛠️ GUIDE TECHNIQUE - HARMONISATION BLOCKED/ANALYTICS

## Architecture Partagée

Les pages **Dossiers Bloqués** et **Analytics** partagent maintenant la même architecture Command Center.

---

## 📦 Structure des Composants

### **Pattern Command Sidebar**

```typescript
// Signature commune
interface CommandSidebarProps {
  activeCategory: string;
  collapsed: boolean;
  onCategoryChange: (category: string) => void;
  onToggleCollapse: () => void;
  onOpenCommandPalette: () => void;
}

// Export unifié
export const BlockedCommandSidebar: React.FC<CommandSidebarProps>;
export const AnalyticsCommandSidebar: React.FC<CommandSidebarProps>;
```

**Features communes** :
- Collapse/expand avec animation `duration-300`
- Badges dynamiques synchronisés avec le store
- Indicateur latéral sur l'item actif
- Mode collapsed avec badges compacts
- Barre de recherche avec kbd `⌘K`

### **Pattern SubNavigation**

```typescript
interface SubNavigationProps {
  mainCategory: string;
  mainCategoryLabel: string;
  subCategory: string | null;
  subCategories: SubCategory[];
  onSubCategoryChange: (subCategory: string) => void;
}

interface SubCategory {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
}
```

**Features communes** :
- Breadcrumb à 3 niveaux avec `ChevronRight`
- Sous-onglets avec badges dynamiques
- Couleurs sémantiques (red/amber/slate)
- Scale effects sur hover et actif

### **Pattern KPI Bar**

```typescript
interface KPIBarProps {
  visible?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

interface KPIItem {
  id: string;
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend: 'up' | 'down' | 'stable';
  trendValue?: string;
  status: 'success' | 'warning' | 'critical' | 'neutral';
  sparkline?: number[];
  onClick?: () => void;
}
```

**Features communes** :
- Grid responsive (4x2 sur desktop, adaptatif sur mobile)
- Sparklines avec barres animées
- Couleurs selon le statut
- Click handlers pour navigation
- Refresh button avec animation spin

---

## 🎨 Système de Design

### **Classes CSS Communes**

```typescript
// Layout
const layoutClasses = cn(
  'flex h-screen',
  'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950',
  'overflow-hidden',
  fullscreen && 'fixed inset-0 z-50'
);

// Sidebar
const sidebarClasses = cn(
  'flex flex-col',
  'border-r border-slate-700/50',
  'bg-slate-900/80 backdrop-blur-xl',
  'transition-all duration-300',
  collapsed ? 'w-16' : 'w-64'
);

// Sidebar Item
const sidebarItemClasses = cn(
  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
  'transition-all duration-200',
  'group relative',
  isActive
    ? 'bg-{color}-500/10 border border-{color}-500/30 scale-[1.02]'
    : 'hover:bg-slate-700/40 border border-transparent hover:scale-[1.01]'
);

// SubNav Tab
const subNavTabClasses = cn(
  'flex items-center gap-2 px-3 py-1.5 rounded-md',
  'text-sm font-medium transition-all duration-200 whitespace-nowrap',
  isActive
    ? 'bg-{color}-500/15 text-slate-200 border border-{color}-500/30 scale-105'
    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/60 border border-transparent hover:scale-[1.02]'
);

// KPI Card
const kpiCardClasses = cn(
  'bg-slate-900/60 px-3 py-2',
  'transition-colors text-left group',
  onClick && 'hover:bg-slate-800/40 cursor-pointer'
);

// Badge
const badgeClasses = cn(
  'h-5 min-w-5 px-1.5',
  'text-xs font-medium',
  'transition-all duration-200',
  badgeType === 'critical'
    ? 'bg-red-500/20 text-red-400 border-red-500/30 group-hover:bg-red-500/30'
    : badgeType === 'warning'
    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 group-hover:bg-amber-500/30'
    : 'bg-slate-500/20 text-slate-400 border-slate-500/30 group-hover:bg-slate-500/30'
);
```

### **Couleurs par Module**

```typescript
// Blocked (Rouge)
const blockedColors = {
  primary: 'red-400',
  activeBg: 'red-500/10',
  activeBorder: 'red-500/30',
  hoverBg: 'red-500/20',
  indicator: 'red-400',
};

// Analytics (Bleu)
const analyticsColors = {
  primary: 'blue-400',
  activeBg: 'blue-500/10',
  activeBorder: 'blue-500/30',
  hoverBg: 'blue-500/20',
  indicator: 'blue-400',
};

// Sémantique (Partagé)
const statusColors = {
  success: 'emerald-400',
  warning: 'amber-400',
  critical: 'red-400',
  neutral: 'slate-300',
};
```

---

## 🔧 Hooks & Utilities

### **useKeyboardShortcuts**

```typescript
// Pattern commun pour les raccourcis
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    if (target?.isContentEditable) return;
    if (['input', 'textarea', 'select'].includes(target?.tagName?.toLowerCase() || '')) return;

    const isMod = e.metaKey || e.ctrlKey;

    // ⌘K - Command palette
    if (isMod && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      toggleCommandPalette();
      return;
    }

    // ⌘B - Toggle sidebar
    if (isMod && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      toggleSidebar();
      return;
    }

    // ⌘I - Stats
    if (isMod && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      openModal('stats');
      return;
    }

    // ⌘E - Export
    if (isMod && e.key.toLowerCase() === 'e') {
      e.preventDefault();
      openModal('export');
      return;
    }

    // F11 - Fullscreen
    if (e.key === 'F11') {
      e.preventDefault();
      toggleFullscreen();
      return;
    }

    // Alt + Left - Back
    if (e.altKey && e.key === 'ArrowLeft') {
      e.preventDefault();
      goBack();
      return;
    }

    // ? - Help
    if (e.key === '?' && !isMod) {
      e.preventDefault();
      openModal('shortcuts');
    }

    // Escape
    if (e.key === 'Escape') {
      if (commandPaletteOpen) toggleCommandPalette();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [deps]);
```

### **formatTimeAgo**

```typescript
function formatTimeAgo(isoString: string): string {
  const now = new Date();
  const date = new Date(isoString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diff < 60) return 'à l\'instant';
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  return `il y a ${Math.floor(diff / 86400)}j`;
}
```

### **formatAmount**

```typescript
function formatAmount(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}Md`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return amount.toLocaleString('fr-FR');
}
```

---

## 🗄️ Store Pattern

### **Structure Commune**

```typescript
interface CommandCenterStore {
  // Navigation
  navigation: {
    mainCategory: string;
    subCategory: string | null;
  };
  navigationHistory: NavigationState[];
  
  // UI State
  sidebarCollapsed: boolean;
  fullscreen: boolean;
  commandPaletteOpen: boolean;
  notificationsPanelOpen: boolean;
  
  // Modal
  modal: {
    type: string | null;
    isOpen: boolean;
    data: Record<string, unknown>;
  };
  
  // KPIs
  kpiConfig: {
    visible: boolean;
    collapsed: boolean;
    refreshInterval: number;
    autoRefresh: boolean;
  };
  
  // Stats
  stats: Stats | null;
  statsLoading: boolean;
  
  // Live
  liveStats: {
    lastUpdate: string | null;
    isRefreshing: boolean;
    connectionStatus: 'connected' | 'disconnected' | 'syncing';
  };
  
  // Actions
  navigate: (main: string, sub?: string | null) => void;
  goBack: () => void;
  toggleSidebar: () => void;
  toggleFullscreen: () => void;
  toggleCommandPalette: () => void;
  toggleNotificationsPanel: () => void;
  openModal: (type: string, data?: any) => void;
  closeModal: () => void;
  setKPIConfig: (config: Partial<KPIConfig>) => void;
  setStats: (stats: Stats | null) => void;
  startRefresh: () => void;
  endRefresh: () => void;
}
```

### **Persistence**

```typescript
// Seulement ces champs sont persistés
export const useCommandCenterStore = create(
  persist(
    (set, get) => ({
      // ... state et actions
    }),
    {
      name: 'bmo-{module}-command-center',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        filters: state.filters,
        kpiConfig: state.kpiConfig,
      }),
    }
  )
);
```

---

## 🎯 Sparklines Implementation

```typescript
interface Sparkline {
  data: number[];
  statusColor: string;
}

function Sparkline({ data, statusColor }: Sparkline) {
  const maxVal = Math.max(...data);
  
  return (
    <div className="flex items-end gap-0.5 h-4">
      {data.map((val, i) => {
        const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
        const isLast = i === data.length - 1;
        
        // Couleur uniquement sur la dernière barre (valeur actuelle)
        const barColor = isLast
          ? statusColor.replace('text-', 'bg-')
          : 'bg-slate-700/60';
        
        return (
          <div
            key={i}
            className={cn('flex-1 rounded-sm min-h-[2px]', barColor)}
            style={{ height: `${Math.max(height, 10)}%` }}
          />
        );
      })}
    </div>
  );
}
```

---

## 📱 Responsive Design

### **Breakpoints**

```typescript
// Tailwind breakpoints utilisés
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
};

// KPI Bar Grid
<div className="grid grid-cols-4 lg:grid-cols-8 gap-px">
  {/* 4 colonnes sur mobile/tablet, 8 sur desktop */}
</div>

// Texte caché sur petit écran
<span className="hidden sm:inline">Décider</span>
```

---

## 🧪 Testing Pattern

```typescript
// Mock du store
const mockStore = {
  navigation: { mainCategory: 'overview', subCategory: 'summary' },
  stats: { total: 42, critical: 5, ... },
  toggleCommandPalette: jest.fn(),
  navigate: jest.fn(),
};

// Test composant
test('renders sidebar with categories', () => {
  render(
    <CommandSidebar
      activeCategory="overview"
      collapsed={false}
      onCategoryChange={mockStore.navigate}
      onToggleCollapse={jest.fn()}
      onOpenCommandPalette={mockStore.toggleCommandPalette}
    />
  );
  
  expect(screen.getByText('Vue d\'ensemble')).toBeInTheDocument();
  expect(screen.getByText('⌘K')).toBeInTheDocument();
});
```

---

## 📋 Checklist d'Intégration

Pour ajouter un nouveau module avec cette architecture :

### **1. Créer le Store**
- [ ] Définir les types (MainCategory, SubCategory, Stats)
- [ ] Implémenter le store Zustand
- [ ] Configurer la persistence
- [ ] Ajouter les actions de navigation

### **2. Créer les Composants**
- [ ] CommandSidebar avec categories[]
- [ ] SubNavigation avec breadcrumb
- [ ] KPIBar avec sparklines
- [ ] ContentRouter pour les vues
- [ ] Modals container

### **3. Page Principale**
- [ ] Importer tous les composants
- [ ] Setup keyboard shortcuts
- [ ] Implémenter loadStats()
- [ ] Gérer navigation history
- [ ] Ajouter status bar

### **4. Styling**
- [ ] Choisir la couleur principale (red, blue, green...)
- [ ] Appliquer les classes communes
- [ ] Configurer les animations
- [ ] Tester le mode collapsed

### **5. Tests**
- [ ] Unit tests des composants
- [ ] Integration tests navigation
- [ ] Keyboard shortcuts tests
- [ ] Linting validation

---

## 🚀 Performance Tips

### **Memoization**

```typescript
// Composants
export const CommandSidebar = React.memo(function CommandSidebar(props) {
  // ...
});

// Callbacks
const handleCategoryChange = useCallback((category: string) => {
  navigate(category);
}, [navigate]);

// Valeurs calculées
const currentSubCategories = useMemo(() => {
  return subCategoriesMap[activeCategory] || [];
}, [activeCategory]);
```

### **Zustand Best Practices**

```typescript
// ✅ Bon: Sélection spécifique
const stats = useStore(state => state.stats);

// ❌ Mauvais: Tout le store
const store = useStore();
```

---

## 📚 Ressources

- **Shadcn UI**: Components de base
- **Lucide Icons**: Bibliothèque d'icônes
- **Zustand**: State management
- **Tailwind CSS**: Styling utilities

---

*Guide technique - v2.0*
*Dernière mise à jour: 10 janvier 2026*

