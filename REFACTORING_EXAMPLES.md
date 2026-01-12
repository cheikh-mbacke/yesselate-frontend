# 🔧 Exemples de Refactorisation - Version 10.0

Ce document présente des exemples concrets de refactorisation basés sur les recommandations de l'analyse architecture.

---

## 1. Extraction de Service Métier

### ❌ Avant (Logique dans le composant)

```typescript
// AnalyticsComparisonView.tsx (lignes 1109-1200)
function PeriodsComparisonView() {
  // ... 200 lignes de logique métier mélangée avec UI
  
  const trendAnalysis = useMemo(() => {
    if (periodData.length < 2) return null;
    
    const firstHalf = periodData.slice(0, Math.floor(periodData.length / 2));
    const secondHalf = periodData.slice(Math.floor(periodData.length / 2));
    const firstHalfAvg = firstHalf.reduce((sum, p) => sum + p.value, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, p) => sum + p.value, 0) / secondHalf.length;
    const globalTrend = secondHalfAvg - firstHalfAvg;
    // ... 50 lignes de plus
  }, [periodData, subCategory]);
  
  // ... reste du composant
}
```

### ✅ Après (Service métier séparé)

```typescript
// domain/analytics/services/TrendAnalysisService.ts
export class TrendAnalysisService {
  /**
   * Analyse les tendances sur une série de périodes
   */
  static analyzePeriods(
    periodData: PeriodData[],
    config: TrendAnalysisConfig
  ): TrendAnalysis {
    if (periodData.length < 2) {
      return this.createEmptyAnalysis();
    }
    
    const trend = this.calculateGlobalTrend(periodData);
    const problematicPeriods = this.identifyProblematicPeriods(
      periodData,
      config.thresholds
    );
    const worstPeriod = this.findWorstPeriod(
      periodData,
      config.subCategory
    );
    
    return {
      globalTrend: trend.value,
      globalTrendPercent: trend.percent,
      isImproving: this.isImproving(trend, config.subCategory),
      isDegrading: this.isDegrading(trend, config.subCategory),
      problematicPeriods,
      worstPeriod,
      needsAction: this.shouldTriggerAction(problematicPeriods, trend),
    };
  }
  
  private static calculateGlobalTrend(
    periodData: PeriodData[]
  ): { value: number; percent: string } {
    const midpoint = Math.floor(periodData.length / 2);
    const firstHalf = periodData.slice(0, midpoint);
    const secondHalf = periodData.slice(midpoint);
    
    const firstHalfAvg = this.calculateAverage(firstHalf);
    const secondHalfAvg = this.calculateAverage(secondHalf);
    
    const trend = secondHalfAvg - firstHalfAvg;
    const percent = firstHalfAvg > 0
      ? ((trend / firstHalfAvg) * 100).toFixed(1)
      : '0';
    
    return { value: trend, percent };
  }
  
  private static identifyProblematicPeriods(
    periodData: PeriodData[],
    thresholds: Thresholds
  ): PeriodData[] {
    return periodData.filter((period, idx) => {
      if (idx === 0) return false;
      
      const prevValue = periodData[idx - 1].value;
      const change = period.value - prevValue;
      const changePercent = prevValue > 0 ? (change / prevValue) * 100 : 0;
      
      return Math.abs(changePercent) > thresholds.degradation;
    });
  }
  
  // ... autres méthodes privées
}

// application/hooks/useTrendAnalysis.ts
export function useTrendAnalysis(
  periodData: PeriodData[],
  subCategory: string
) {
  return useMemo(() => {
    return TrendAnalysisService.analyzePeriods(periodData, {
      subCategory,
      thresholds: getThresholdsForSubCategory(subCategory),
    });
  }, [periodData, subCategory]);
}

// Composant simplifié
function PeriodsComparisonView() {
  const periodData = usePeriodData(/* ... */);
  const trendAnalysis = useTrendAnalysis(periodData, subCategory);
  
  // Composant focalisé sur la présentation
  return (
    <div>
      <TrendAnalysisDisplay analysis={trendAnalysis} />
      {/* ... */}
    </div>
  );
}
```

**Bénéfices**:
- ✅ Logique testable isolément
- ✅ Réutilisable dans d'autres contextes
- ✅ Composant plus simple et lisible
- ✅ Séparation claire des responsabilités

---

## 2. Custom Hook pour Actions

### ❌ Avant (Logique dupliquée)

```typescript
// AnalyticsComparisonView.tsx
function PeriodsComparisonView() {
  const { openModal } = useAnalyticsCommandCenterStore();
  const { toast } = useAnalyticsToast();
  
  const handleQuickAction = (actionType: string, period?: Period) => {
    const periodLabel = period?.label || currentPeriod?.label || 'période actuelle';
    
    switch (actionType) {
      case 'create-alert':
        openModal('alert-config', { /* ... */ });
        toast.success(`Configuration d'alerte pour ${periodLabel}`);
        break;
      case 'create-task':
        openModal('create-task', { /* ... */ });
        toast.success(`Tâche créée pour ${periodLabel}`);
        break;
      // ... 100 lignes de plus
    }
  };
  
  // ... utilisé dans plusieurs endroits
}
```

### ✅ Après (Hook réutilisable)

```typescript
// application/hooks/usePeriodActions.ts
export function usePeriodActions(period?: Period) {
  const { openModal } = useAnalyticsCommandCenterStore();
  const { toast } = useAnalyticsToast();
  const periodLabel = period?.label || 'période actuelle';
  
  const createAlert = useCallback((context?: ActionContext) => {
    openModal('alert-config', {
      context: 'period-comparison',
      period: periodLabel,
      ...context,
    });
    toast.success(`Configuration d'alerte pour ${periodLabel}`);
  }, [openModal, toast, periodLabel]);
  
  const createTask = useCallback((context?: ActionContext) => {
    openModal('create-task', {
      context: 'period-comparison',
      period: periodLabel,
      initialTitle: `Action correctrice - ${periodLabel}`,
      initialDescription: `Plan d'action pour corriger les écarts observés`,
      ...context,
    });
    toast.success(`Tâche créée pour ${periodLabel}`);
  }, [openModal, toast, periodLabel]);
  
  const scheduleMeeting = useCallback((context?: ActionContext) => {
    openModal('schedule-meeting', {
      context: 'period-comparison',
      period: periodLabel,
      meetingType: context?.priority === 'high' ? 'urgent' : 'regular',
      ...context,
    });
    toast.success(`Réunion planifiée pour ${periodLabel}`);
  }, [openModal, toast, periodLabel]);
  
  const generateReport = useCallback((data?: any) => {
    openModal('report', {
      context: 'period-comparison',
      period: periodLabel,
      data,
    });
    toast.info(`Génération du rapport pour ${periodLabel}`);
  }, [openModal, toast, periodLabel]);
  
  const exportData = useCallback((data: PeriodData[]) => {
    const csvContent = generateCSV(data);
    downloadFile(csvContent, `comparaison-periodes-${periodLabel}.csv`);
    toast.success('Données exportées avec succès');
  }, [toast, periodLabel]);
  
  return {
    createAlert,
    createTask,
    scheduleMeeting,
    generateReport,
    exportData,
  };
}

// Composant simplifié
function PeriodsComparisonView() {
  const periodActions = usePeriodActions(currentPeriod);
  
  return (
    <div>
      <button onClick={() => periodActions.createAlert()}>
        Créer Alerte
      </button>
      <button onClick={() => periodActions.createTask()}>
        Nouvelle Tâche
      </button>
      {/* ... */}
    </div>
  );
}
```

**Bénéfices**:
- ✅ Logique centralisée et réutilisable
- ✅ Testable isolément
- ✅ Type-safe avec TypeScript
- ✅ Facile à étendre

---

## 3. Compound Components Pattern

### ❌ Avant (Composant monolithique)

```typescript
// AnalyticsComparisonView.tsx - 1300+ lignes
function PeriodsComparisonView() {
  // Tout dans un seul composant
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>...</div>
      
      {/* Stats */}
      <div>...</div>
      
      {/* Chart */}
      <div>...</div>
      
      {/* Actions */}
      <div>...</div>
      
      {/* Recommendations */}
      <div>...</div>
      
      {/* Table */}
      <div>...</div>
    </div>
  );
}
```

### ✅ Après (Composants composés)

```typescript
// presentation/components/PeriodComparison/index.tsx
interface PeriodComparisonContextValue {
  periodData: PeriodData[];
  periodType: PeriodType;
  setPeriodType: (type: PeriodType) => void;
  trendAnalysis: TrendAnalysis | null;
  recommendations: Recommendation[];
  actions: PeriodActions;
  config: ComparisonConfig;
}

const PeriodComparisonContext = createContext<PeriodComparisonContextValue | null>(null);

function usePeriodComparisonContext() {
  const context = useContext(PeriodComparisonContext);
  if (!context) {
    throw new Error('PeriodComparison components must be used within PeriodComparison.Root');
  }
  return context;
}

// Root Component
function PeriodComparisonRoot({
  category,
  subCategory,
  children,
}: PeriodComparisonRootProps) {
  const [periodType, setPeriodType] = useState<PeriodType>('months');
  const periodData = usePeriodData(periodType, category, subCategory);
  const trendAnalysis = useTrendAnalysis(periodData, subCategory);
  const recommendations = useRecommendations(trendAnalysis, subCategory);
  const actions = usePeriodActions();
  const config = useComparisonConfig(category, subCategory);
  
  const value: PeriodComparisonContextValue = {
    periodData,
    periodType,
    setPeriodType,
    trendAnalysis,
    recommendations,
    actions,
    config,
  };
  
  return (
    <PeriodComparisonContext.Provider value={value}>
      <div className="space-y-6">
        {children}
      </div>
    </PeriodComparisonContext.Provider>
  );
}

// Header Component
function PeriodComparisonHeader() {
  const { config, periodType, setPeriodType } = usePeriodComparisonContext();
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-xl font-bold text-slate-200 mb-2">
          {config.title}
        </h3>
        <p className="text-slate-400 text-sm">{config.description}</p>
      </div>
      <PeriodTypeSelector
        value={periodType}
        onChange={setPeriodType}
      />
    </div>
  );
}

// Stats Component
function PeriodComparisonStats() {
  const { periodData } = usePeriodComparisonContext();
  const currentPeriod = periodData[periodData.length - 1];
  const previousPeriod = periodData[periodData.length - 2];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        label="Période Actuelle"
        value={currentPeriod?.value || 0}
        subtitle={currentPeriod?.label}
        icon={Activity}
      />
      <StatCard
        label="Période Précédente"
        value={previousPeriod?.value || 0}
        subtitle={previousPeriod?.label}
        icon={Clock}
      />
      <EvolutionCard
        current={currentPeriod?.value || 0}
        previous={previousPeriod?.value || 0}
      />
    </div>
  );
}

// Chart Component
function PeriodComparisonChart() {
  const { periodData, config, periodType } = usePeriodComparisonContext();
  
  return (
    <FluentCard>
      <FluentCardHeader>
        <FluentCardTitle>
          📈 Évolution sur les {getPeriodLabel(periodType)}
        </FluentCardTitle>
      </FluentCardHeader>
      <FluentCardContent>
        <PeriodChart data={periodData} color={config.color} />
      </FluentCardContent>
    </FluentCard>
  );
}

// Actions Component
function PeriodComparisonActions() {
  const { actions, config } = usePeriodComparisonContext();
  
  return (
    <FluentCard className={cn('border-l-4', getBorderColor(config.color))}>
      <FluentCardHeader>
        <FluentCardTitle>
          <Zap className="w-4 h-4 text-amber-400" />
          Actions Rapides
        </FluentCardTitle>
      </FluentCardHeader>
      <FluentCardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ActionButton
            icon={Bell}
            label="Créer Alerte"
            onClick={actions.createAlert}
            variant="amber"
          />
          <ActionButton
            icon={Plus}
            label="Nouvelle Tâche"
            onClick={actions.createTask}
            variant="blue"
          />
          <ActionButton
            icon={Calendar}
            label="Planifier Réunion"
            onClick={actions.scheduleMeeting}
            variant="purple"
          />
          <ActionButton
            icon={FileText}
            label="Générer Rapport"
            onClick={actions.generateReport}
            variant="emerald"
          />
        </div>
      </FluentCardContent>
    </FluentCard>
  );
}

// Recommendations Component
function PeriodComparisonRecommendations() {
  const { recommendations, actions } = usePeriodComparisonContext();
  
  if (recommendations.length === 0) return null;
  
  return (
    <FluentCard>
      <FluentCardHeader>
        <FluentCardTitle>
          <Target className="w-4 h-4 text-blue-400" />
          Recommandations Automatiques
        </FluentCardTitle>
      </FluentCardHeader>
      <FluentCardContent>
        <RecommendationList
          recommendations={recommendations}
          onAction={actions}
        />
      </FluentCardContent>
    </FluentCard>
  );
}

// Table Component
function PeriodComparisonTable() {
  const { periodData, trendAnalysis, actions } = usePeriodComparisonContext();
  
  return (
    <FluentCard>
      <FluentCardHeader>
        <div className="flex items-center justify-between w-full">
          <FluentCardTitle>Détail par Période</FluentCardTitle>
          <FluentButton
            size="sm"
            variant="secondary"
            onClick={() => actions.exportData(periodData)}
          >
            <Download className="w-4 h-4 mr-1" />
            Exporter
          </FluentButton>
        </div>
      </FluentCardHeader>
      <FluentCardContent>
        <PeriodTable
          data={periodData}
          problematicPeriods={trendAnalysis?.problematicPeriods || []}
          onAction={actions}
        />
      </FluentCardContent>
    </FluentCard>
  );
}

// Export composé
export const PeriodComparison = {
  Root: PeriodComparisonRoot,
  Header: PeriodComparisonHeader,
  Stats: PeriodComparisonStats,
  Chart: PeriodComparisonChart,
  Actions: PeriodComparisonActions,
  Recommendations: PeriodComparisonRecommendations,
  Table: PeriodComparisonTable,
};

// Usage
function PeriodsComparisonView({ category, subCategory }: Props) {
  return (
    <PeriodComparison.Root category={category} subCategory={subCategory}>
      <PeriodComparison.Header />
      <PeriodComparison.Stats />
      <PeriodComparison.Chart />
      <PeriodComparison.Actions />
      <PeriodComparison.Recommendations />
      <PeriodComparison.Table />
    </PeriodComparison.Root>
  );
}
```

**Bénéfices**:
- ✅ Composants petits et focalisés
- ✅ Réutilisables individuellement
- ✅ Facile à tester
- ✅ Flexibilité de composition

---

## 4. Repository Pattern avec Cache

### ❌ Avant (Appels API directs)

```typescript
// Dans plusieurs composants
const { data: alerts } = useAlerts();
const { data: kpis } = useKPIs();
// Pas de cache, pas de retry, pas de gestion d'erreur centralisée
```

### ✅ Après (Repository avec cache)

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
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
  async getKPIs(filters: KPIFilters): Promise<KPI[]> {
    const cacheKey = `kpis-${JSON.stringify(filters)}`;
    
    // Vérifier le cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    
    // Fetch avec retry
    const data = await fetchWithRetry(
      () => fetch(`/api/analytics/kpis?${new URLSearchParams(filters)}`)
        .then(res => res.json())
        .then(res => res.kpis),
      { maxRetries: 3 }
    );
    
    // Mettre en cache
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  }
  
  async getAlerts(filters: AlertFilters): Promise<Alert[]> {
    // Même pattern
  }
  
  // ... autres méthodes
}

// application/hooks/useKPIs.ts
export function useKPIs(filters: KPIFilters = {}) {
  const repository = useAnalyticsRepository();
  
  return useQuery({
    queryKey: ['kpis', filters],
    queryFn: () => repository.getKPIs(filters),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
}
```

**Bénéfices**:
- ✅ Cache centralisé
- ✅ Retry automatique
- ✅ Gestion d'erreur unifiée
- ✅ Facile à mock pour les tests

---

## 5. Validation avec Zod

### ❌ Avant (Pas de validation)

```typescript
// Données non validées
const alert = {
  id: alertId,
  title: 'Taux de validation sous objectif',
  // ... pas de garantie de structure
};

// Utilisation risquée
alert.currentValue.toFixed(2); // Peut crasher si currentValue n'existe pas
```

### ✅ Après (Validation stricte)

```typescript
// domain/analytics/schemas/AlertSchema.ts
import { z } from 'zod';

export const AlertSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  message: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  type: z.string(),
  category: z.string(),
  status: z.enum(['active', 'snoozed', 'resolved']),
  priority: z.enum(['low', 'medium', 'high']),
  createdAt: z.string().datetime(),
  resolvedAt: z.string().datetime().optional(),
  assignedTo: z.string().optional(),
  kpiId: z.string().optional(),
  bureauId: z.string().optional(),
  affectedBureaux: z.array(z.string()),
  metric: z.string(),
  currentValue: z.number(),
  targetValue: z.number(),
  unit: z.string(),
  recommendation: z.string().optional(),
  impact: z.string().optional(),
});

export type Alert = z.infer<typeof AlertSchema>;

// Utilisation
function validateAlert(data: unknown): Alert {
  try {
    return AlertSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid alert data', error.errors);
    }
    throw error;
  }
}

// Dans le hook
export function useAlertDetail(alertId: string | null) {
  return useQuery({
    queryKey: ['alert', alertId],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/alerts/${alertId}`);
      const data = await response.json();
      return validateAlert(data.alert); // Validation automatique
    },
    enabled: !!alertId,
  });
}
```

**Bénéfices**:
- ✅ Type safety à l'exécution
- ✅ Validation automatique
- ✅ Messages d'erreur clairs
- ✅ Documentation implicite

---

## 6. Error Boundary avec Retry

### ❌ Avant (Pas de gestion d'erreur)

```typescript
// Erreurs non gérées
function Component() {
  const { data, error } = useQuery(/* ... */);
  
  if (error) {
    return <div>Erreur</div>; // Pas de retry, pas de détails
  }
  
  return <div>{/* ... */}</div>;
}
```

### ✅ Après (Error Boundary avancé)

```typescript
// presentation/components/ErrorBoundary/ErrorBoundary.tsx
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

class AnalyticsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0,
  };
  
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking
    logErrorToService(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'AnalyticsErrorBoundary',
    });
    
    this.setState({ errorInfo });
  }
  
  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };
  
  handleReport = () => {
    if (this.state.error) {
      reportError(this.state.error, {
        context: 'analytics',
        retryCount: this.state.retryCount,
      });
    }
  };
  
  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          retryCount={this.state.retryCount}
          onRetry={this.handleRetry}
          onReport={this.handleReport}
        />
      );
    }
    
    return this.props.children;
  }
}

// ErrorFallback Component
function ErrorFallback({
  error,
  errorInfo,
  retryCount,
  onRetry,
  onReport,
}: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-200 mb-2">
          Une erreur est survenue
        </h2>
        <p className="text-slate-400 mb-4">
          {error?.message || 'Une erreur inattendue s\'est produite'}
        </p>
        
        {process.env.NODE_ENV === 'development' && errorInfo && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-slate-400 text-sm">
              Détails techniques
            </summary>
            <pre className="mt-2 p-4 bg-slate-900 rounded text-xs overflow-auto">
              {errorInfo.componentStack}
            </pre>
          </details>
        )}
        
        <div className="flex gap-2 justify-center">
          <FluentButton onClick={onRetry} variant="primary">
            Réessayer
          </FluentButton>
          <FluentButton onClick={onReport} variant="secondary">
            Signaler le problème
          </FluentButton>
        </div>
      </div>
    </div>
  );
}
```

**Bénéfices**:
- ✅ Gestion d'erreur centralisée
- ✅ Retry automatique
- ✅ Reporting d'erreurs
- ✅ UX améliorée

---

Ces exemples montrent comment transformer le code actuel en une architecture plus robuste, maintenable et évolutive.

