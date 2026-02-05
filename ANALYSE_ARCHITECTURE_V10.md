# 🚀 Analyse Architecture & Recommandations - Version 10.0
## Analytics Module - Roadmap d'Excellence

---

## 📋 Table des Matières

1. [Architecture & Organisation](#architecture--organisation)
2. [Patterns & Bonnes Pratiques](#patterns--bonnes-pratiques)
3. [Performance & Optimisations](#performance--optimisations)
4. [UX/UI - Expérience Utilisateur](#uxui---expérience-utilisateur)
5. [Robustesse & Gestion d'Erreurs](#robustesse--gestion-derreurs)
6. [Évolutivité & Scalabilité](#évolutivité--scalabilité)
7. [Tests & Qualité](#tests--qualité)
8. [Accessibilité](#accessibilité)
9. [Documentation & Maintenance](#documentation--maintenance)
10. [Sécurité & Conformité](#sécurité--conformité)

---

## 🏗️ Architecture & Organisation

### 🔴 Problèmes Identifiés

1. **Duplication de logique métier**
   - Calculs de tendances répétés dans plusieurs composants
   - Logique de filtrage dupliquée
   - Génération de données mock dispersée

2. **Couplage fort entre composants**
   - Composants de vue directement liés au store Zustand
   - Logique métier mélangée avec la présentation
   - Difficile de tester isolément

3. **Manque de séparation des responsabilités**
   - Composants trop volumineux (AnalyticsComparisonView > 1300 lignes)
   - Mélange de logique UI, métier et données

### ✅ Recommandations

#### 1. Architecture en Couches

```
src/
├── domain/                    # 🆕 Logique métier pure
│   ├── analytics/
│   │   ├── entities/          # Entités métier (KPI, Alert, Trend)
│   │   ├── services/          # Services métier (TrendAnalysis, AlertDetection)
│   │   ├── repositories/      # Interfaces de données
│   │   └── use-cases/         # Cas d'usage (GetKPIs, CreateAlert, AnalyzeTrends)
│   └── shared/
│       ├── types/
│       └── utils/
│
├── infrastructure/            # 🆕 Implémentations techniques
│   ├── api/                   # Clients API, adaptateurs
│   ├── storage/               # LocalStorage, IndexedDB
│   └── realtime/              # SSE, WebSockets
│
├── application/               # 🆕 Orchestration
│   ├── hooks/                 # Hooks métier (useTrendAnalysis, useAlertActions)
│   ├── stores/                # État global (Zustand)
│   └── providers/             # Context providers
│
└── presentation/             # 🆕 UI
    ├── components/
    ├── views/
    └── layouts/
```

#### 2. Service Layer Pattern

**Créer des services métier réutilisables :**

```typescript
// domain/analytics/services/TrendAnalysisService.ts
export class TrendAnalysisService {
  static analyzePeriods(
    data: PeriodData[],
    config: AnalysisConfig
  ): TrendAnalysis {
    // Logique pure, testable
  }
  
  static identifyProblematicPeriods(
    data: PeriodData[],
    thresholds: Thresholds
  ): ProblematicPeriod[] {
    // Détection intelligente
  }
  
  static generateRecommendations(
    analysis: TrendAnalysis,
    context: AlertContext
  ): Recommendation[] {
    // Génération de recommandations
  }
}
```

#### 3. Repository Pattern

```typescript
// domain/analytics/repositories/AnalyticsRepository.ts
export interface AnalyticsRepository {
  getKPIs(filters: KPIFilters): Promise<KPI[]>;
  getAlerts(filters: AlertFilters): Promise<Alert[]>;
  getTrends(period: Period): Promise<Trend[]>;
  createAlert(alert: CreateAlertDTO): Promise<Alert>;
  resolveAlert(id: string, resolution: Resolution): Promise<void>;
}

// infrastructure/api/AnalyticsApiRepository.ts
export class AnalyticsApiRepository implements AnalyticsRepository {
  // Implémentation avec cache, retry, etc.
}
```

#### 4. Feature-Based Organization

```
src/features/analytics/
├── alerts/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   └── presentation/
│       ├── AlertDetailModal.tsx
│       ├── AlertList.tsx
│       └── AlertActions.tsx
│
├── kpis/
│   └── ...
│
├── trends/
│   └── ...
│
└── comparison/
    └── ...
```

---

## 🎯 Patterns & Bonnes Pratiques

### 🔴 Problèmes Identifiés

1. **Hooks personnalisés manquants**
   - Logique répétée dans les composants
   - Pas de réutilisabilité

2. **Gestion d'état complexe**
   - Store Zustand trop volumineux
   - Pas de séparation par domaine

3. **Manque de composition**
   - Composants monolithiques
   - Difficile à maintenir

### ✅ Recommandations

#### 1. Custom Hooks Pattern

```typescript
// application/hooks/useTrendAnalysis.ts
export function useTrendAnalysis(
  periodData: PeriodData[],
  subCategory: string
) {
  const analysis = useMemo(() => 
    TrendAnalysisService.analyzePeriods(periodData, {
      subCategory,
      thresholds: getThresholds(subCategory)
    }),
    [periodData, subCategory]
  );
  
  const recommendations = useMemo(() =>
    TrendAnalysisService.generateRecommendations(analysis, {
      category: 'alerts',
      subCategory
    }),
    [analysis, subCategory]
  );
  
  return { analysis, recommendations };
}

// application/hooks/usePeriodActions.ts
export function usePeriodActions() {
  const { openModal } = useAnalyticsCommandCenterStore();
  const { toast } = useAnalyticsToast();
  
  const createAlert = useCallback((period: Period) => {
    openModal('alert-config', {
      context: 'period-comparison',
      period: period.label,
      // ...
    });
    toast.success(`Configuration d'alerte pour ${period.label}`);
  }, [openModal, toast]);
  
  // ... autres actions
  
  return {
    createAlert,
    createTask,
    scheduleMeeting,
    generateReport,
    exportData
  };
}
```

#### 2. Compound Components Pattern

```typescript
// presentation/components/PeriodComparison/
export const PeriodComparison = {
  Root: PeriodComparisonRoot,
  Header: PeriodComparisonHeader,
  Stats: PeriodComparisonStats,
  Chart: PeriodComparisonChart,
  Actions: PeriodComparisonActions,
  Table: PeriodComparisonTable,
  Recommendations: PeriodComparisonRecommendations,
};

// Usage
<PeriodComparison.Root>
  <PeriodComparison.Header />
  <PeriodComparison.Stats />
  <PeriodComparison.Chart />
  <PeriodComparison.Actions />
  <PeriodComparison.Recommendations />
  <PeriodComparison.Table />
</PeriodComparison.Root>
```

#### 3. Render Props / Children as Function

```typescript
// Pour flexibilité maximale
<PeriodAnalysis data={periodData}>
  {({ analysis, recommendations, actions }) => (
    <>
      <Stats analysis={analysis} />
      <Chart data={analysis.trends} />
      <Actions actions={actions} />
    </>
  )}
</PeriodAnalysis>
```

#### 4. State Machine Pattern (XState)

```typescript
// Pour gérer les états complexes (modals, workflows)
import { createMachine } from 'xstate';

const alertWorkflowMachine = createMachine({
  id: 'alertWorkflow',
  initial: 'idle',
  states: {
    idle: {
      on: { CREATE: 'creating' }
    },
    creating: {
      on: {
        SUCCESS: 'created',
        ERROR: 'error'
      }
    },
    // ...
  }
});
```

---

## ⚡ Performance & Optimisations

### 🔴 Problèmes Identifiés

1. **Re-renders inutiles**
   - Pas de memoization appropriée
   - Callbacks recréés à chaque render

2. **Chargement de données**
   - Pas de pagination
   - Pas de virtualisation pour grandes listes
   - Pas de lazy loading

3. **Calculs coûteux**
   - Calculs dans le render
   - Pas de debounce/throttle

### ✅ Recommandations

#### 1. Optimisation des Renders

```typescript
// ✅ Utiliser React.memo avec comparaison personnalisée
const PeriodComparisonTable = React.memo(({ data, onAction }) => {
  // ...
}, (prevProps, nextProps) => {
  return prevProps.data === nextProps.data &&
         prevProps.onAction === nextProps.onAction;
});

// ✅ useMemo pour calculs coûteux
const expensiveAnalysis = useMemo(() => {
  return TrendAnalysisService.analyzePeriods(periodData, config);
}, [periodData, config]);

// ✅ useCallback pour callbacks stables
const handleAction = useCallback((action: string, period: Period) => {
  // ...
}, [/* dépendances minimales */]);
```

#### 2. Virtualisation

```typescript
// Pour grandes listes
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedAlertList({ alerts }: { alerts: Alert[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: alerts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });
  
  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <AlertRow
            key={virtualRow.key}
            alert={alerts[virtualRow.index]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

#### 3. Code Splitting & Lazy Loading

```typescript
// Lazy load des vues lourdes
const AnalyticsComparisonView = lazy(() => 
  import('./views/AnalyticsComparisonView')
);

const AnalyticsDashboardView = lazy(() => 
  import('./views/AnalyticsDashboardView')
);

// Dans le composant
<Suspense fallback={<LoadingSkeleton />}>
  {viewMode === 'comparative' && <AnalyticsComparisonView />}
  {viewMode === 'dashboard' && <AnalyticsDashboardView />}
</Suspense>
```

#### 4. Debounce/Throttle

```typescript
// Pour les recherches et filtres
import { useDebouncedCallback } from 'use-debounce';

function SearchBar() {
  const [query, setQuery] = useState('');
  const debouncedSearch = useDebouncedCallback(
    (value: string) => {
      // Recherche API
    },
    300
  );
  
  return (
    <input
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);
        debouncedSearch(e.target.value);
      }}
    />
  );
}
```

#### 5. React Query Optimizations

```typescript
// Configuration optimale
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Prefetching
queryClient.prefetchQuery({
  queryKey: ['alerts', filters],
  queryFn: () => fetchAlerts(filters),
});
```

---

## 🎨 UX/UI - Expérience Utilisateur

### 🔴 Problèmes Identifiés

1. **Feedback utilisateur insuffisant**
   - Pas de loading states granulaires
   - Messages d'erreur génériques
   - Pas de confirmations pour actions critiques

2. **Navigation complexe**
   - Trop de niveaux de navigation
   - Pas de breadcrumbs clairs
   - Pas de recherche globale efficace

3. **Accessibilité limitée**
   - Pas de support clavier complet
   - ARIA labels manquants
   - Contraste insuffisant

### ✅ Recommandations

#### 1. Loading States Granulaires

```typescript
// Skeleton loaders spécifiques
function PeriodComparisonSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-700 rounded w-1/3" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-slate-800 rounded" />
        ))}
      </div>
      <div className="h-80 bg-slate-800 rounded" />
    </div>
  );
}

// Progressive loading
function useProgressiveData<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    fetcher()
      .then(result => {
        setData(result);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err);
        setIsLoading(false);
      });
  }, []);
  
  return { data, isLoading, error };
}
```

#### 2. Toast System Amélioré

```typescript
// Toast avec actions
toast.success('Alerte créée', {
  action: {
    label: 'Voir',
    onClick: () => navigate(`/alerts/${alertId}`)
  },
  duration: 5000,
});

// Toast avec progression
toast.loading('Export en cours...', {
  id: 'export',
});

// Plus tard
toast.success('Export terminé', {
  id: 'export',
});
```

#### 3. Command Palette Amélioré

```typescript
// Recherche intelligente avec scoring
const searchResults = useMemo(() => {
  const query = searchQuery.toLowerCase();
  
  return [
    ...categories.map(cat => ({
      ...cat,
      score: calculateRelevance(cat, query),
      type: 'category' as const
    })),
    ...recentKPIs.map(kpi => ({
      ...kpi,
      score: calculateRelevance(kpi, query),
      type: 'kpi' as const
    })),
    // ...
  ]
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}, [searchQuery]);
```

#### 4. Drag & Drop pour Actions

```typescript
import { DndContext, DragEndEvent } from '@dnd-kit/core';

function AlertKanban() {
  const [alerts, setAlerts] = useState(/* ... */);
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Mettre à jour le statut de l'alerte
      updateAlertStatus(active.id, over.id);
    }
  };
  
  return (
    <DndContext onDragEnd={handleDragEnd}>
      {/* Colonnes Kanban */}
    </DndContext>
  );
}
```

#### 5. Animations & Transitions

```typescript
// Framer Motion pour transitions fluides
import { motion, AnimatePresence } from 'framer-motion';

function Modal({ isOpen, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## 🛡️ Robustesse & Gestion d'Erreurs

### 🔴 Problèmes Identifiés

1. **Gestion d'erreurs basique**
   - Try/catch génériques
   - Pas de retry logic
   - Pas de fallback UI

2. **Validation manquante**
   - Pas de validation côté client
   - Pas de schémas TypeScript stricts

3. **Pas de monitoring**
   - Pas de tracking d'erreurs
   - Pas de métriques de performance

### ✅ Recommandations

#### 1. Error Boundary Avancé

```typescript
// ErrorBoundary avec retry et reporting
class AnalyticsErrorBoundary extends React.Component {
  state = { hasError: false, error: null, errorInfo: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking service
    logErrorToService(error, errorInfo);
    
    this.setState({ errorInfo });
  }
  
  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };
  
  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          onReport={() => reportError(this.state.error)}
        />
      );
    }
    
    return this.props.children;
  }
}
```

#### 2. Retry Logic avec Exponential Backoff

```typescript
// infrastructure/api/retry.ts
export async function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
  } = options;
  
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetcher();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        const delay = Math.min(
          initialDelay * Math.pow(backoffFactor, attempt),
          maxDelay
        );
        await sleep(delay);
      }
    }
  }
  
  throw lastError!;
}
```

#### 3. Validation avec Zod

```typescript
import { z } from 'zod';

// Schémas de validation
const AlertSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['active', 'snoozed', 'resolved']),
  createdAt: z.string().datetime(),
  // ...
});

// Validation runtime
function createAlert(data: unknown): Alert {
  return AlertSchema.parse(data);
}

// Type inference
type Alert = z.infer<typeof AlertSchema>;
```

#### 4. Fallback UI Stratégique

```typescript
function useDataWithFallback<T>(
  fetcher: () => Promise<T>,
  fallback: T
) {
  const [data, setData] = useState<T>(fallback);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    fetcher()
      .then(setData)
      .catch(err => {
        setError(err);
        setData(fallback); // Fallback automatique
      })
      .finally(() => setIsLoading(false));
  }, []);
  
  return { data, isLoading, error };
}
```

---

## 📈 Évolutivité & Scalabilité

### 🔴 Problèmes Identifiés

1. **Store Zustand monolithique**
   - Tout dans un seul store
   - Difficile à scinder

2. **Pas de plugin system**
   - Difficile d'ajouter des fonctionnalités
   - Pas d'extensibilité

3. **Configuration hardcodée**
   - Pas de configuration dynamique
   - Pas de feature flags

### ✅ Recommandations

#### 1. Modular Store Architecture

```typescript
// stores/analytics/
├── alerts/
│   ├── alertsStore.ts
│   └── alertsSlice.ts
├── kpis/
│   ├── kpisStore.ts
│   └── kpisSlice.ts
└── index.ts

// stores/analytics/alerts/alertsStore.ts
export const useAlertsStore = create<AlertsState>()(
  persist(
    (set, get) => ({
      alerts: [],
      filters: {},
      // ...
      addAlert: (alert) => set(state => ({
        alerts: [...state.alerts, alert]
      })),
    }),
    { name: 'analytics-alerts' }
  )
);

// stores/analytics/index.ts
export const useAnalyticsStore = () => ({
  alerts: useAlertsStore(),
  kpis: useKPIsStore(),
  trends: useTrendsStore(),
});
```

#### 2. Plugin System

```typescript
// application/plugins/PluginRegistry.ts
interface AnalyticsPlugin {
  name: string;
  version: string;
  initialize: (context: PluginContext) => void;
  hooks?: {
    beforeRender?: (props: any) => any;
    afterAction?: (action: string, data: any) => void;
  };
  components?: Record<string, React.ComponentType>;
}

class PluginRegistry {
  private plugins: Map<string, AnalyticsPlugin> = new Map();
  
  register(plugin: AnalyticsPlugin) {
    this.plugins.set(plugin.name, plugin);
    plugin.initialize(this.getContext());
  }
  
  getComponent(name: string, componentName: string) {
    const plugin = this.plugins.get(name);
    return plugin?.components?.[componentName];
  }
}

// Usage
const registry = new PluginRegistry();
registry.register({
  name: 'custom-charts',
  version: '1.0.0',
  components: {
    CustomChart: CustomChartComponent,
  },
  // ...
});
```

#### 3. Feature Flags

```typescript
// infrastructure/feature-flags/FeatureFlags.ts
export class FeatureFlags {
  private flags: Map<string, boolean> = new Map();
  
  async load() {
    const response = await fetch('/api/feature-flags');
    const flags = await response.json();
    flags.forEach((flag: FeatureFlag) => {
      this.flags.set(flag.name, flag.enabled);
    });
  }
  
  isEnabled(name: string): boolean {
    return this.flags.get(name) ?? false;
  }
}

// Usage
const flags = new FeatureFlags();
if (flags.isEnabled('advanced-analytics')) {
  // Afficher fonctionnalités avancées
}
```

#### 4. Configuration Dynamique

```typescript
// infrastructure/config/ConfigService.ts
export class ConfigService {
  private config: AnalyticsConfig;
  
  async load() {
    const response = await fetch('/api/analytics/config');
    this.config = await response.json();
  }
  
  get<K extends keyof AnalyticsConfig>(key: K): AnalyticsConfig[K] {
    return this.config[key];
  }
  
  update<K extends keyof AnalyticsConfig>(
    key: K,
    value: AnalyticsConfig[K]
  ) {
    this.config[key] = value;
    // Persist to backend
    this.save();
  }
}
```

---

## 🧪 Tests & Qualité

### 🔴 Problèmes Identifiés

1. **Pas de tests**
   - Aucun test unitaire
   - Pas de tests d'intégration
   - Pas de tests E2E

2. **Pas de type safety strict**
   - `any` utilisé fréquemment
   - Pas de strict mode TypeScript

### ✅ Recommandations

#### 1. Testing Strategy

```typescript
// __tests__/domain/analytics/TrendAnalysisService.test.ts
import { TrendAnalysisService } from '@/domain/analytics/services/TrendAnalysisService';

describe('TrendAnalysisService', () => {
  describe('analyzePeriods', () => {
    it('should identify degrading trends', () => {
      const data = [
        { period: '2024-01', value: 10 },
        { period: '2024-02', value: 15 },
        { period: '2024-03', value: 20 },
      ];
      
      const analysis = TrendAnalysisService.analyzePeriods(data, {
        subCategory: 'critical',
      });
      
      expect(analysis.isDegrading).toBe(true);
      expect(analysis.problematicPeriods).toHaveLength(2);
    });
  });
});
```

#### 2. Component Testing

```typescript
// __tests__/components/PeriodComparisonView.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PeriodComparisonView } from './PeriodComparisonView';

describe('PeriodComparisonView', () => {
  it('should display period data', () => {
    const data = [/* ... */];
    render(<PeriodComparisonView data={data} />);
    
    expect(screen.getByText('Jan 24')).toBeInTheDocument();
  });
  
  it('should handle action clicks', () => {
    const onAction = jest.fn();
    render(<PeriodComparisonView data={data} onAction={onAction} />);
    
    fireEvent.click(screen.getByText('Créer Alerte'));
    expect(onAction).toHaveBeenCalledWith('create-alert');
  });
});
```

#### 3. E2E Testing

```typescript
// e2e/analytics.spec.ts
import { test, expect } from '@playwright/test';

test('should navigate to analytics and view alerts', async ({ page }) => {
  await page.goto('/maitre-ouvrage/analytics');
  
  await page.click('text=Alertes');
  await expect(page.locator('text=Alertes Critiques')).toBeVisible();
  
  await page.click('text=Critiques');
  await expect(page.locator('[data-testid="alert-list"]')).toBeVisible();
});
```

#### 4. Type Safety Strict

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## ♿ Accessibilité

### ✅ Recommandations

#### 1. ARIA Labels Complets

```typescript
<button
  aria-label="Créer une alerte pour la période Janvier 2024"
  aria-describedby="alert-help-text"
  onClick={handleCreateAlert}
>
  <Bell aria-hidden="true" />
  Créer Alerte
</button>
<span id="alert-help-text" className="sr-only">
  Ouvre un formulaire pour configurer une nouvelle alerte
</span>
```

#### 2. Navigation Clavier

```typescript
// Hook pour navigation clavier
function useKeyboardNavigation(items: any[]) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, items.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        items[focusedIndex]?.onSelect?.();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, focusedIndex]);
  
  return { focusedIndex };
}
```

#### 3. Focus Management

```typescript
// Gérer le focus dans les modals
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const firstFocusable = modalRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
    }
  }, [isOpen]);
  
  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {children}
    </div>
  );
}
```

---

## 📚 Documentation & Maintenance

### ✅ Recommandations

#### 1. Storybook

```typescript
// stories/PeriodComparisonView.stories.tsx
export default {
  title: 'Analytics/PeriodComparisonView',
  component: PeriodComparisonView,
};

export const Default = {
  args: {
    data: mockPeriodData,
    category: 'alerts',
    subCategory: 'critical',
  },
};

export const WithRecommendations = {
  args: {
    ...Default.args,
    showRecommendations: true,
  },
};
```

#### 2. JSDoc Complet

```typescript
/**
 * Analyse les tendances sur une série de périodes
 * 
 * @param periodData - Données de périodes à analyser
 * @param config - Configuration de l'analyse
 * @returns Analyse complète avec tendances et recommandations
 * 
 * @example
 * ```ts
 * const analysis = TrendAnalysisService.analyzePeriods(
 *   monthlyData,
 *   { subCategory: 'critical', thresholds: { degradation: 20 } }
 * );
 * ```
 */
export function analyzePeriods(
  periodData: PeriodData[],
  config: AnalysisConfig
): TrendAnalysis {
  // ...
}
```

#### 3. Architecture Decision Records (ADR)

```markdown
# ADR-001: Architecture en Couches

## Status
Accepted

## Context
Le module analytics devient complexe avec de nombreuses responsabilités mélangées.

## Decision
Adopter une architecture en couches (Domain, Infrastructure, Application, Presentation).

## Consequences
- ✅ Séparation claire des responsabilités
- ✅ Testabilité améliorée
- ⚠️ Plus de fichiers à gérer
```

---

## 🔒 Sécurité & Conformité

### ✅ Recommandations

#### 1. Input Sanitization

```typescript
import DOMPurify from 'dompurify';

function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}
```

#### 2. Rate Limiting

```typescript
// infrastructure/api/rateLimiter.ts
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  canMakeRequest(key: string, limit: number, window: number): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Nettoyer les requêtes anciennes
    const recentRequests = requests.filter(
      time => now - time < window
    );
    
    if (recentRequests.length >= limit) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }
}
```

#### 3. Audit Logging

```typescript
// infrastructure/audit/AuditLogger.ts
export class AuditLogger {
  async log(action: AuditAction, metadata: AuditMetadata) {
    await fetch('/api/audit', {
      method: 'POST',
      body: JSON.stringify({
        action,
        metadata,
        timestamp: new Date().toISOString(),
        userId: getCurrentUserId(),
      }),
    });
  }
}
```

---

## 🎯 Plan d'Implémentation

### Phase 1: Fondations (Sprint 1-2)
- [ ] Mise en place architecture en couches
- [ ] Création des services métier
- [ ] Migration vers Repository Pattern
- [ ] Configuration TypeScript strict

### Phase 2: Optimisations (Sprint 3-4)
- [ ] Optimisation des renders
- [ ] Implémentation de la virtualisation
- [ ] Code splitting et lazy loading
- [ ] Debounce/throttle

### Phase 3: UX/UI (Sprint 5-6)
- [ ] Amélioration des loading states
- [ ] Command palette avancée
- [ ] Animations et transitions
- [ ] Accessibilité complète

### Phase 4: Robustesse (Sprint 7-8)
- [ ] Error boundaries avancés
- [ ] Retry logic
- [ ] Validation avec Zod
- [ ] Monitoring et logging

### Phase 5: Tests & Documentation (Sprint 9-10)
- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Tests E2E
- [ ] Documentation complète
- [ ] Storybook

---

## 📊 Métriques de Succès

- **Performance**: Time to Interactive < 3s
- **Accessibilité**: Score Lighthouse > 90
- **Couverture de tests**: > 80%
- **Type safety**: 0 `any` dans le code
- **Bundle size**: < 500KB gzipped
- **Error rate**: < 0.1%

---

**Version**: 1.0  
**Date**: 2024  
**Auteur**: Architecture Review Team

