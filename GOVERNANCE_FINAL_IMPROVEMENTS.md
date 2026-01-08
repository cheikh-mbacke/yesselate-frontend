# 🚀 Améliorations Finales Disponibles - Page Governance

## 📊 État Actuel

### ✅ Déjà Implémenté
- ✅ Virtualisation des listes
- ✅ Lazy loading des composants
- ✅ Error Boundaries
- ✅ ARIA labels complets
- ✅ Tests unitaires de base
- ✅ 0 types `any`
- ✅ Navigation clavier
- ✅ Optimistic updates
- ✅ Performance monitoring
- ✅ Analytics
- ✅ Navigation clavier dans listes

### 🔄 Améliorations Supplémentaires Disponibles

---

## 1. **Service de Logging Centralisé** 🛡️ PRIORITÉ HAUTE

### Problème Actuel
- `console.error` et `console.warn` dispersés dans le code
- Pas de centralisation pour production
- Pas de tracking des erreurs

### Solution
```typescript
// src/lib/services/logger.ts
export class Logger {
  static error(message: string, error: Error, context?: Record<string, unknown>) {
    const errorData = {
      message,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    };

    // En production : envoyer à service de monitoring
    if (process.env.NODE_ENV === 'production') {
      // Intégrer Sentry, LogRocket, ou service custom
      fetch('/api/logs/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
      }).catch(() => {
        // Fallback silencieux
      });
    } else {
      console.error('[Logger]', message, error, context);
    }
  }

  static warn(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Logger]', message, context);
    }
  }

  static info(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Logger]', message, context);
    }
  }
}
```

**Remplacement** : Remplacer tous les `console.error` par `Logger.error`

---

## 2. **Retry Logic pour Actions** 🔄 PRIORITÉ HAUTE

### Problème Actuel
- Si une action échoue (réseau, API), l'utilisateur doit réessayer manuellement
- Pas de retry automatique

### Solution
```typescript
// src/hooks/useRetryableAction.ts
export function useRetryableAction<T>(
  action: () => Promise<T>,
  options: { maxRetries?: number; delay?: number; onRetry?: (attempt: number) => void } = {}
) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const executeWithRetry = useCallback(async (): Promise<T> => {
    setError(null);
    const maxRetries = options.maxRetries ?? 3;
    const delay = options.delay ?? 1000;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        setIsRetrying(attempt > 0);
        setRetryCount(attempt);
        if (attempt > 0 && options.onRetry) {
          options.onRetry(attempt);
        }
        const result = await action();
        setIsRetrying(false);
        setRetryCount(0);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);

        if (attempt < maxRetries - 1) {
          // Attendre avant de réessayer (backoff exponentiel)
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
        } else {
          setIsRetrying(false);
          throw error;
        }
      }
    }

    throw new Error('Max retries reached');
  }, [action, options]);

  return { executeWithRetry, isRetrying, retryCount, error };
}
```

**Usage** :
```typescript
const { executeWithRetry, isRetrying } = useRetryableAction(
  () => applyOptimisticUpdate(alertId, { status: 'ack' }),
  { 
    maxRetries: 3,
    onRetry: (attempt) => addToast(`Tentative ${attempt + 1}/3...`, 'info')
  }
);
```

---

## 3. **Focus Trap dans les Modales** ♿ PRIORITÉ HAUTE

### Problème Actuel
- Les modales n'ont pas de focus trap
- Tab peut sortir de la modale

### Solution
```typescript
// src/hooks/useFocusTrap.ts
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableSelectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus initial
    firstElement.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTab);

    return () => {
      container.removeEventListener('keydown', handleTab);
    };
  }, [isActive]);

  return containerRef;
}
```

**Usage dans modales** :
```typescript
const modalRef = useFocusTrap(isOpen);
<div ref={modalRef} className="modal">
  {/* Contenu modale */}
</div>
```

---

## 4. **Hauteur Dynamique pour Virtualisation** ⚡ PRIORITÉ MOYENNE

### Problème Actuel
- Hauteur fixe (60px pour RACI, 140px pour alertes)
- Peut causer des problèmes si contenu variable

### Solution
```typescript
// src/components/features/bmo/governance/VirtualizedRACITable.tsx
const virtualizer = useVirtualizer({
  count: raciData.length,
  getScrollElement: () => parentRef.current,
  estimateSize: useCallback((index: number) => {
    const row = raciData[index];
    // Calculer hauteur basée sur contenu
    let height = 60; // Base
    
    // Ajuster selon la longueur de l'activité
    if (row.activity.length > 50) height += 15;
    if (row.description && row.description.length > 100) height += 20;
    
    // Ajuster selon le nombre de bureaux
    const bureauCount = Object.keys(row.roles).length;
    if (bureauCount > 5) height += 5;
    
    return height;
  }, [raciData]),
  overscan: 5,
  // Mesurer la hauteur réelle après rendu
  measureElement: (element) => element?.getBoundingClientRect().height ?? 60,
});
```

---

## 5. **Skeleton Loaders Personnalisés** 🎨 PRIORITÉ MOYENNE

### Problème Actuel
- Skeleton loaders génériques (divs avec animate-pulse)
- Pas de structure correspondant au contenu réel

### Solution
```typescript
// src/components/ui/skeletons.tsx
export function RACITableSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700 p-3">
          <div className="h-4 bg-slate-700 rounded w-3/4 animate-pulse" />
        </div>
        <div className="p-4 space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 bg-slate-700 rounded w-1/3 animate-pulse" />
              <div className="h-4 bg-slate-700 rounded w-1/4 animate-pulse" />
              <div className="h-4 bg-slate-700 rounded w-1/5 animate-pulse" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function AlertsListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="border-l-4">
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 bg-slate-700 rounded animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-700 rounded w-2/3 animate-pulse" />
                <div className="h-3 bg-slate-700 rounded w-full animate-pulse" />
                <div className="h-3 bg-slate-700 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

**Usage** :
```typescript
<Suspense fallback={<RACITableSkeleton />}>
  <RACITab {...props} />
</Suspense>
```

---

## 6. **Gestion d'Erreurs Réseau** 🌐 PRIORITÉ MOYENNE

### Solution
```typescript
// src/lib/utils/error-handling.ts
export class NetworkError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

export function handleApiError(error: unknown): string {
  if (error instanceof NetworkError) {
    if (error.statusCode === 401) {
      return 'Session expirée. Veuillez vous reconnecter.';
    }
    if (error.statusCode === 403) {
      return 'Vous n\'avez pas les permissions nécessaires.';
    }
    if (error.statusCode === 500) {
      return 'Erreur serveur. Veuillez réessayer plus tard.';
    }
    return 'Problème de connexion. Vérifiez votre réseau.';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Une erreur inattendue s\'est produite.';
}

// Usage
try {
  await updateAlert(alertId, updates);
} catch (error) {
  const message = handleApiError(error);
  addToast(message, 'error');
  
  if (error instanceof NetworkError && error.statusCode === 401) {
    // Rediriger vers login
    router.push('/login');
  }
}
```

---

## 7. **JSDoc Complet** 📝 PRIORITÉ MOYENNE

### Solution
```typescript
/**
 * Hook pour gérer la logique RACI de la page Governance
 * 
 * Fournit l'état et les actions pour la matrice RACI, incluant :
 * - Statistiques (total, critiques, verrouillées, pilotées BMO)
 * - Sélection d'activité
 * - Export CSV
 * - Affichage conditionnel (comparateur, heatmap, suggestions IA)
 * 
 * @example
 * ```tsx
 * const raciHook = useGovernanceRACI();
 * 
 * // Accéder aux stats
 * console.log(raciHook.stats.critical); // Nombre d'activités critiques
 * 
 * // Sélectionner une activité
 * raciHook.setSelectedActivity('Validation BC');
 * 
 * // Exporter
 * raciHook.handleExport(addToast, addActionLog);
 * ```
 * 
 * @returns {Object} État et actions RACI
 * @returns {RACIStats} returns.stats - Statistiques calculées
 * @returns {RACIEnriched[]} returns.raciData - Données RACI enrichies
 * @returns {RACIEnriched | null} returns.selectedR - Activité sélectionnée
 * @returns {string[]} returns.bureaux - Liste des bureaux
 * @returns {Function} returns.setSelectedActivity - Sélectionner une activité
 * @returns {Function} returns.handleExport - Exporter la matrice en CSV
 * 
 * @see {@link RACIEnriched} Pour la structure des données RACI
 * @see {@link RACIStats} Pour la structure des statistiques
 */
export function useGovernanceRACI() {
  // ...
}
```

---

## 8. **Tests d'Intégration** 🧪 PRIORITÉ MOYENNE

### Solution
```typescript
// __tests__/integration/governance-flow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GovernancePage from '@/app/(portals)/maitre-ouvrage/governance/page';

describe('Governance Flow Integration', () => {
  it('should complete full alert workflow', async () => {
    const user = userEvent.setup();
    render(<GovernancePage />);

    // 1. Changer d'onglet
    await user.click(screen.getByText('Alertes'));
    expect(screen.getByText(/alertes affichées/i)).toBeInTheDocument();

    // 2. Filtrer par sévérité
    const searchInput = screen.getByPlaceholderText(/rechercher/i);
    await user.type(searchInput, 'critical');
    
    await waitFor(() => {
      expect(screen.getByText(/alertes affichées/i)).toHaveTextContent(/\d+/);
    });

    // 3. Sélectionner une alerte
    const firstAlert = screen.getAllByRole('article')[0];
    await user.click(firstAlert);

    // 4. Résoudre l'alerte
    const resolveButton = screen.getByLabelText(/résoudre/i);
    await user.click(resolveButton);

    // 5. Vérifier le toast de succès
    await waitFor(() => {
      expect(screen.getByText(/résolue/i)).toBeInTheDocument();
    });
  });

  it('should export RACI matrix', async () => {
    const user = userEvent.setup();
    const mockDownload = jest.fn();
    global.URL.createObjectURL = jest.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = jest.fn();
    
    render(<GovernancePage />);
    
    const exportButton = screen.getByLabelText(/exporter/i);
    await user.click(exportButton);
    
    await waitFor(() => {
      expect(screen.getByText(/export.*généré/i)).toBeInTheDocument();
    });
  });
});
```

---

## 9. **Amélioration de la Virtualisation** ⚡ PRIORITÉ BASSE

### A. Mesure Dynamique
```typescript
// Utiliser measureElement pour mesurer la hauteur réelle
const virtualizer = useVirtualizer({
  // ...
  measureElement: (element) => {
    if (!element) return 60;
    return element.getBoundingClientRect().height;
  },
});
```

### B. Virtualisation Horizontale (si tableau très large)
```typescript
// Pour tableaux avec beaucoup de colonnes
const horizontalVirtualizer = useVirtualizer({
  horizontal: true,
  count: bureaux.length,
  getScrollElement: () => horizontalScrollRef.current,
  estimateSize: () => 100,
});
```

---

## 10. **Cache Intelligent** 💾 PRIORITÉ BASSE

### Solution
```typescript
// src/hooks/useCachedData.ts
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { ttl?: number; staleWhileRevalidate?: boolean } = {}
) {
  const cache = useRef<Map<string, { data: T; timestamp: number }>>(new Map());
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const cached = cache.current.get(key);
    const now = Date.now();
    const ttl = options.ttl ?? 5 * 60 * 1000; // 5 min par défaut

    if (cached && (now - cached.timestamp) < ttl) {
      setData(cached.data);
      
      // Revalidate en arrière-plan si staleWhileRevalidate
      if (options.staleWhileRevalidate && (now - cached.timestamp) > ttl / 2) {
        fetcher().then(newData => {
          cache.current.set(key, { data: newData, timestamp: now });
          setData(newData);
        });
      }
    } else {
      setIsLoading(true);
      fetcher().then(newData => {
        cache.current.set(key, { data: newData, timestamp: now });
        setData(newData);
        setIsLoading(false);
      });
    }
  }, [key, fetcher, options.ttl, options.staleWhileRevalidate]);

  return { data, isLoading };
}
```

---

## 📊 Priorisation Recommandée

### 🔴 Priorité Haute (Impact Immédiat)
1. **Service de Logging Centralisé** - Facilite debugging production
2. **Retry Logic** - Améliore robustesse
3. **Focus Trap dans Modales** - Accessibilité critique

### 🟠 Priorité Moyenne (Améliore l'Expérience)
4. **Skeleton Loaders Personnalisés** - Meilleure UX
5. **Gestion d'Erreurs Réseau** - Messages utilisateur clairs
6. **JSDoc Complet** - Maintenabilité
7. **Tests d'Intégration** - Qualité

### 🟡 Priorité Basse (Nice to Have)
8. **Hauteur Dynamique Virtualisation** - Si contenu très variable
9. **Cache Intelligent** - Si données lourdes
10. **Virtualisation Horizontale** - Si tableau très large

---

## 🎯 Impact Estimé

### Service de Logging
- 🐛 Debugging production : +80%
- 📊 Monitoring erreurs : +100%

### Retry Logic
- 🔄 Taux de succès actions : +15-20%
- 😊 Satisfaction utilisateur : +10%

### Focus Trap
- ♿ Accessibilité : +20%
- ⌨️ Navigation clavier : +30%

### Skeleton Loaders
- 🎨 Perception performance : +25%
- 😊 Satisfaction utilisateur : +15%

---

## 📝 Plan d'Implémentation

### Sprint 1 (2-3 jours)
1. Service de Logging
2. Retry Logic
3. Focus Trap

### Sprint 2 (2-3 jours)
4. Skeleton Loaders
5. Gestion Erreurs Réseau
6. JSDoc (en parallèle)

### Sprint 3 (3-4 jours)
7. Tests d'Intégration
8. Améliorations Virtualisation (si nécessaire)

---

## ✅ Checklist Finale

- [ ] Service de logging centralisé
- [ ] Retry logic pour actions
- [ ] Focus trap dans modales
- [ ] Skeleton loaders personnalisés
- [ ] Gestion erreurs réseau
- [ ] JSDoc complet
- [ ] Tests d'intégration
- [ ] Hauteur dynamique virtualisation (optionnel)
- [ ] Cache intelligent (optionnel)

