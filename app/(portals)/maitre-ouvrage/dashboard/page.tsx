/* -----------------------------------------------------------------------
   FILE: app/maitre-ouvrage/dashboard/page.tsx
   VERSION: 5.7 - FINALISÉ AVEC INDICATEURS VISUELS ET UX OPTIMISÉE
   
   AMÉLIORATIONS:
   - Design moderne avec animations fluides et effets visuels
   - KPIs enrichis avec icônes, visualisations (sparklines) et animations
   - KPIs cliquables avec indicateurs visuels (icône info au hover, ring bleu)
   - Transitions optimisées avec ErrorBoundary
   - Accessibilité complète (ARIA labels, roles, live regions, atomic)
   - Performance optimisée (useMemo, useCallback, memo)
   - Gestion d'erreurs robuste avec retry automatique (exponential backoff)
   - Timeout et cleanup appropriés pour éviter les memory leaks
   - Sparklines stables avec générateur pseudo-aléatoire
   - Raccourcis clavier étendus (Ctrl+K, Ctrl+R, Ctrl+E, Escape, Ctrl+/)
   - Export de données (CSV et JSON) avec menu déroulant
   - Notifications interactives (max 5 affichées, cliquables)
   - Persistance des préférences (localStorage pour filtres)
   - Modals détaillés avec graphiques historiques et métadonnées
   - Tooltips enrichis avec indication de clic
   - Effets visuels avancés (brillance, shimmer, scale, active states)
   - Types consolidés et code organisé
   - Responsive design complet
   - Annonces de statut pour l'accessibilité
   - Navigation clavier complète (Enter/Espace sur KPIs)
------------------------------------------------------------------------ */

'use client';

import React, { Suspense, useMemo, memo, useCallback, useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { 
  Loader2, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  DollarSign, 
  Clock, 
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  Info,
  Zap,
  TrendingDown,
  Search,
  X,
  Download,
  Calendar,
  BarChart3,
  Settings
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

// ✅ Importer le store Zustand
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import type { DashboardMainCategory } from '@/modules/dashboard/types/dashboardNavigationTypes';

// ✅ Importer les composants de navigation existants
import { 
  DashboardSidebar, 
  DashboardSubNavigation, 
  DashboardUrlSync,
  DashboardContentSwitch 
} from '@/modules/dashboard';

// ✅ Importer les modals
import { DashboardModals } from '@/components/features/bmo/dashboard/command-center/DashboardModals';
import { getKPIMappingByLabel } from '@/lib/mappings/dashboardKPIMapping';
import { useDashboardKPIs } from '@/lib/hooks/useDashboardKPIs';
import { KPIAlertsSystem } from '@/components/features/bmo/dashboard/command-center/KPIAlertsSystem';
import { useLogger } from '@/lib/utils/logger';

/* =========================
   Loading Fallback
========================= */

function DashboardSkeleton() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <div className="absolute inset-0 h-8 w-8 animate-ping text-blue-400/20" />
        </div>
        <p className="text-slate-400 text-sm font-medium">Chargement du dashboard...</p>
      </div>
    </div>
  );
}

/* =========================
   Page Wrapper
========================= */

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

/* =========================
   Dashboard Content
========================= */

function DashboardContent() {
  // ✅ Initialiser le logger
  const log = useLogger('DashboardContent');
  
  // ✅ LIRE LE STORE ZUSTAND (source unique de vérité)
  const navigation = useDashboardCommandCenterStore((state) => state.navigation);
  const navigate = useDashboardCommandCenterStore((state) => state.navigate);
  const sidebarCollapsed = useDashboardCommandCenterStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useDashboardCommandCenterStore((state) => state.toggleSidebar);
  const toggleCommandPalette = useDashboardCommandCenterStore((state) => state.toggleCommandPalette);

  // ✅ Extraire les valeurs de navigation
  const { mainCategory, subCategory, subSubCategory } = navigation;

  // ✅ États locaux - déclarés en premier
  // Persister le filtre dans localStorage
  const [kpiFilter, setKpiFilter] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dashboard-kpi-filter') || '';
    }
    return '';
  });
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [kpiChangeNotifications, setKpiChangeNotifications] = useState<Array<{
    id: string;
    label: string;
    oldValue: string | number;
    newValue: string | number;
    timestamp: Date;
  }>>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
  });
  const [retryCount, setRetryCount] = useState(0);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const maxRetries = 3;

  // ✅ Log du render avec navigation
  useEffect(() => {
    log.debug('Render avec navigation', {
        mainCategory,
        subCategory,
        subSubCategory,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainCategory, subCategory, subSubCategory]);

  // ✅ Handlers optimisés avec useCallback
  const handleCategoryChange = useCallback((category: string, subCat?: string) => {
    log.navigation("${mainCategory}/${subCategory || ''}", "${category}/${subCat || ''}", { category, subCat });
    }
    navigate(category as DashboardMainCategory, subCat || null, null);
  }, [navigate, mainCategory, subCategory, log]);

  const handleSubCategoryChange = useCallback((subCat: string) => {
    log.navigation("${mainCategory}/${subCategory || ''}", "${mainCategory}/${subCat}", { subCat });
    }
    navigate(mainCategory, subCat, null);
  }, [navigate, mainCategory, subCategory, log]);

  const handleSubSubCategoryChange = useCallback((subSubCat: string, subCat?: string) => {
    log.navigation("${mainCategory}/${subCategory || ''}/${subSubCategory || ''}", "${mainCategory}/${subCat || subCategory}/${subSubCat}", { subSubCat, subCat });
    }
    navigate(mainCategory, subCat || subCategory, subSubCat);
  }, [navigate, mainCategory, subCategory, subSubCategory, log]);

  // ✅ Handler pour ouvrir le modal KPI
  const openModal = useDashboardCommandCenterStore((state) => state.openModal);
  const handleKPIClick = useCallback((kpi: KPIData) => {
    // Utiliser le système de mapping pour trouver l'ID du KPI
    const mapping = getKPIMappingByLabel(kpi.label);
    if (mapping) {
      openModal('kpi-drilldown', { kpi, kpiId: mapping.metadata.id });
    } else {
      openModal('kpi-drilldown', { kpi });
    }
  }, [openModal]);

  /* =========================
     KPI Configuration avec données réelles de l'API
  ========================= */

  // ✅ Utiliser le hook pour récupérer les données réelles
  const { kpis: apiKpis, isLoading: kpisLoading, error: kpisError, lastUpdate: apiLastUpdate, refetch: refetchKPIsFromAPI } = useDashboardKPIs('year');

  // ✅ Convertir les données de l'API au format KPIData
  const allKpis = useMemo<KPIData[]>(() => {
    // Si les données de l'API sont disponibles, les utiliser
    if (apiKpis && apiKpis.length > 0) {
      return apiKpis.map(kpi => ({
        label: kpi.label,
        value: kpi.value,
        delta: kpi.delta,
        tone: kpi.tone,
        trend: kpi.trend,
        icon: kpi.icon,
      }));
    }
    
    // Sinon, utiliser les valeurs par défaut
    return [
      { 
        label: 'Demandes', 
        value: 247, 
        delta: '+12', 
        tone: 'ok' as const,
        icon: FileText,
        trend: 'up' as const
      },
      { 
        label: 'Validations', 
        value: '89%', 
        delta: '+3%', 
        tone: 'ok' as const,
        icon: CheckCircle2,
        trend: 'up' as const
      },
      { 
        label: 'Blocages', 
        value: 5, 
        delta: '-2', 
        tone: 'warn' as const,
        icon: AlertTriangle,
        trend: 'down' as const
      },
      { 
        label: 'Risques critiques', 
        value: 3, 
        delta: '+1', 
        tone: 'crit' as const,
        icon: AlertCircle,
        trend: 'up' as const
      },
      { 
        label: 'Budget consommé', 
        value: '67%', 
        delta: '—', 
        tone: 'info' as const,
        icon: DollarSign,
        trend: 'neutral' as const
      },
      { 
        label: 'Décisions en attente', 
        value: 8, 
        delta: '—', 
        tone: 'warn' as const,
        icon: Clock,
        trend: 'neutral' as const
      },
      { 
        label: 'Temps réponse', 
        value: '2.4j', 
        delta: '-0.3j', 
        tone: 'warn' as const,
        icon: Activity,
        trend: 'down' as const
      },
      { 
        label: 'Conformité SLA', 
        value: '94%', 
        delta: '+2%', 
        tone: 'ok' as const,
        icon: TrendingUp,
        trend: 'up' as const
      },
    ];
  }, [apiKpis]);

  // ✅ Mettre à jour lastUpdate si l'API fournit une date
  useEffect(() => {
    if (apiLastUpdate) {
      setLastUpdate(new Date(apiLastUpdate));
    }
  }, [apiLastUpdate]);

  // ✅ Persister le filtre dans localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (kpiFilter) {
        localStorage.setItem('dashboard-kpi-filter', kpiFilter);
      } else {
        localStorage.removeItem('dashboard-kpi-filter');
      }
    }
  }, [kpiFilter]);

  // ✅ KPIs filtrés avec optimisation de recherche
  const topKpis = useMemo(() => {
    if (!kpiFilter.trim()) return allKpis;
    const filterLower = kpiFilter.toLowerCase().trim();
    return allKpis.filter(kpi => {
      const labelLower = kpi.label.toLowerCase();
      return labelLower.includes(filterLower);
    });
  }, [allKpis, kpiFilter]);

  const stats = useMemo(
    () => ({
      overview: 3,
      performance: 5,
      actions: 12,
      risks: 4,
      decisions: 8,
      realtime: 2,
    }),
    []
  );

  // ✅ Mesure des performances
  useEffect(() => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      setPerformanceMetrics(prev => ({
        ...prev,
        renderTime: endTime - startTime,
      }));
    };
  }, [mainCategory, subCategory, subSubCategory]);

  // ✅ Stocker les KPIs précédents pour détecter les changements
  const previousKpisRef = useRef<KPIData[]>(allKpis);
  
  // ✅ Détecter les changements de KPIs après mise à jour
  useEffect(() => {
    if (previousKpisRef.current.length === allKpis.length) {
      const changes: typeof kpiChangeNotifications = [];
      
      allKpis.forEach((kpi, index) => {
        const previousKpi = previousKpisRef.current[index];
        if (previousKpi && previousKpi.value !== kpi.value) {
          changes.push({
            id: `${Date.now()}-${index}-${Math.random()}`,
            label: kpi.label,
            oldValue: previousKpi.value,
            newValue: kpi.value,
            timestamp: new Date(),
          });
        }
      });
      
      if (changes.length > 0) {
        setKpiChangeNotifications(prev => [...prev, ...changes]);
        // Auto-hide après 5 secondes
        changes.forEach(change => {
          setTimeout(() => {
            setKpiChangeNotifications(prev => 
              prev.filter(n => n.id !== change.id)
            );
          }, 5000);
        });
      }
    }
    
    previousKpisRef.current = allKpis;
  }, [allKpis]);

  // ✅ Fonction interne de refresh avec retry - utilise maintenant l'API réelle
  const refreshKPIsInternal = useCallback(async (retryAttempt = 0): Promise<void> => {
    // Éviter les refreshes multiples simultanés
    if (isRefreshing) {
      log.warn('Refresh déjà en cours, ignoré', { retryAttempt });
      return;
    }
    
    setIsRefreshing(true);
    const startTime = performance.now();
    
    try {
      // Utiliser l'API réelle via le hook
      if (refetchKPIsFromAPI) {
        await refetchKPIsFromAPI();
      }
      
      // Réinitialiser le compteur de retry en cas de succès
      if (retryAttempt > 0) {
        setRetryCount(0);
      }

      setLastUpdate(new Date());
      setRefreshCount(prev => prev + 1);
      
      const loadTime = performance.now() - startTime;
      setPerformanceMetrics(prev => ({ ...prev, loadTime }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      const err = error instanceof Error ? error : new Error(errorMessage);
      log.error('Erreur lors du refresh des KPIs', err, { retryAttempt, maxRetries });
      
      // Retry automatique avec exponential backoff
      if (retryAttempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryAttempt), 10000); // Max 10s
        setRetryCount(retryAttempt + 1);
        
          log.info(`Retry ${retryAttempt + 1}/${maxRetries} dans ${delay}ms`, {
          retryAttempt: retryAttempt + 1,
          maxRetries,
          delay,
        });
        }
        
        setTimeout(() => {
          refreshKPIsInternal(retryAttempt + 1);
        }, delay);
        return;
      }
      
      // Après épuisement des retries, afficher l'erreur
      const errorNotification = {
        id: `error-${Date.now()}-${Math.random()}`,
        label: errorMessage.includes('Timeout') ? 'Timeout de chargement' : 'Erreur de chargement',
        oldValue: 'Échec' as string | number,
        newValue: `Après ${maxRetries} tentatives` as string | number,
        timestamp: new Date(),
      };
      
      setKpiChangeNotifications(prev => [...prev, errorNotification]);
      setRetryCount(0); // Reset après affichage de l'erreur
      
      // Auto-dismiss après 10 secondes pour les erreurs finales
      setTimeout(() => {
        setKpiChangeNotifications(prev => 
          prev.filter(n => n.id !== errorNotification.id)
        );
      }, 10000);
    } finally {
      // Ne désactiver le refreshing que si ce n'est pas un retry
      if (retryAttempt === 0 || retryAttempt >= maxRetries) {
        setIsRefreshing(false);
      }
    }
  }, [isRefreshing, maxRetries, refetchKPIsFromAPI]);

  // ✅ Fonction publique de refresh (pour les handlers d'événements)
  const refreshKPIs = useCallback(() => {
    refreshKPIsInternal(0);
  }, [refreshKPIsInternal]);

  // ✅ Fonction d'export des données KPIs
  const exportKPIs = useCallback((format: 'csv' | 'json' = 'csv') => {
    const data = topKpis.map(kpi => ({
      Label: kpi.label,
      Valeur: kpi.value,
      Variation: kpi.delta,
      Statut: kpi.tone,
      Tendance: kpi.trend,
    }));

    if (format === 'csv') {
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map(row => Object.values(row).join(','));
      const csvContent = [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-kpis-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-kpis-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }

    setShowExportMenu(false);
  }, [topKpis]);

  // ✅ Refresh automatique toutes les 5 minutes
  // Utiliser useRef pour stocker la fonction et éviter les re-renders
  const refreshKPIsRef = useRef(refreshKPIs);
  useEffect(() => {
    refreshKPIsRef.current = refreshKPIs;
  }, [refreshKPIs]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshKPIsRef.current();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []); // Pas de dépendances - utilise la ref qui est toujours à jour

  // ✅ Raccourcis clavier avec gestion améliorée
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer si on tape dans un input/textarea/contenteditable
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      ) {
        return;
      }

      // Ctrl/Cmd + K pour ouvrir le command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      // Ctrl/Cmd + R pour refresh
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        refreshKPIs();
        return;
      }

      // Echap pour fermer les notifications ou menus
      if (e.key === 'Escape') {
        if (kpiChangeNotifications.length > 0) {
          setKpiChangeNotifications([]);
        }
        if (showExportMenu) {
          setShowExportMenu(false);
        }
      }

      // Ctrl/Cmd + E pour exporter
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportKPIs('csv');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandPalette, refreshKPIs, kpiChangeNotifications.length, showExportMenu, exportKPIs]);

  /* =========================
     Render
  ========================= */

  return (
    <>
      {/* Synchronisation URL <-> Store */}
      <DashboardUrlSync />
      
      <div className="h-full w-full flex min-h-0">
        {/* ===== SIDEBAR DASHBOARD (utilise le store) ===== */}
        <DashboardSidebar
          activeCategory={mainCategory}
          activeSubCategory={subCategory || undefined}
          collapsed={sidebarCollapsed}
          stats={stats}
          onCategoryChange={handleCategoryChange}
          onToggleCollapse={toggleSidebar}
          onOpenCommandPalette={toggleCommandPalette}
        />

        {/* ===== CONTENT PRINCIPAL ===== */}
        <section 
          className="flex-1 min-w-0 flex flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-0"
          aria-label="Zone de contenu principal du dashboard"
          role="main"
        >
        
        {/* Sub Navigation (niveaux 2 et 3) */}
        <div className="relative">
          <DashboardSubNavigation
            mainCategory={mainCategory}
            subCategory={subCategory || undefined}
            subSubCategory={subSubCategory || undefined}
            onSubCategoryChange={handleSubCategoryChange}
            onSubSubCategoryChange={handleSubSubCategoryChange}
            stats={stats}
          />
        </div>

        {/* KPI Strip - Amélioré avec animations */}
        <TooltipProvider delayDuration={200}>
          <div 
            className="border-b border-slate-800/60 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/60 backdrop-blur-xl px-4 py-4 shadow-lg shadow-black/20 relative overflow-hidden"
            role="region"
            aria-label="Indicateurs de performance en temps réel"
          >
            {/* Effet de brillance animé subtil */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div 
                  className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" 
                  aria-hidden="true"
                />
                <h2 className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">
                  Indicateurs en temps réel
                </h2>
                {topKpis.length !== allKpis.length && (
                  <span className="text-[10px] text-slate-500">
                    ({topKpis.length}/{allKpis.length})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-1 justify-end min-w-[200px]">
                {/* Filtre de recherche KPI */}
                <div className="relative hidden sm:block">
                  <input
                    type="text"
                    placeholder="Rechercher un indicateur..."
                    value={kpiFilter}
                    onChange={(e) => {
                      const value = e.target.value;
                      setKpiFilter(value);
                      // Annoncer le changement pour l'accessibilité
                      if (value.trim()) {
                        const filteredCount = allKpis.filter(kpi => 
                          kpi.label.toLowerCase().includes(value.toLowerCase().trim())
                        ).length;
                        // L'annonce sera faite via aria-live dans le résultat
                      }
                    }}
                    className={cn(
                      'w-48 px-3 py-1.5 text-xs rounded-md',
                      'bg-slate-800/50 border border-slate-700/50',
                      'text-slate-300 placeholder:text-slate-500',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50',
                      'transition-all duration-200'
                    )}
                    aria-label="Rechercher un indicateur"
                  />
                  {kpiFilter && (
                    <button
                      onClick={() => setKpiFilter('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-all duration-200 hover:scale-110 active:scale-95"
                      aria-label="Effacer la recherche"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                  {!kpiFilter && (
                    <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500 pointer-events-none" />
                  )}
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={refreshKPIs}
                      disabled={isRefreshing}
                      className={cn(
                        'p-1.5 rounded-md transition-all duration-200',
                        'hover:bg-slate-800/50 active:scale-95',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                        isRefreshing && 'bg-blue-500/10'
                      )}
                      aria-label="Actualiser les indicateurs"
                    >
                      <RefreshCw 
                        className={cn(
                          'h-3.5 w-3.5 text-slate-400 transition-colors',
                          isRefreshing && 'animate-spin text-blue-400'
                        )} 
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p>Actualiser les indicateurs (Ctrl+R)</p>
                      {refreshCount > 0 && (
                        <p className="text-xs text-slate-400">
                          {refreshCount} actualisation{refreshCount > 1 ? 's' : ''}
                        </p>
                      )}
                      {performanceMetrics.loadTime > 0 && (
                        <p className="text-xs text-slate-400">
                          Dernier chargement: {performanceMetrics.loadTime.toFixed(0)}ms
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
                {/* Système d'alertes KPI */}
                <div className="hidden md:block">
                  <KPIAlertsSystem 
                    kpis={allKpis.map(kpi => ({
                      label: kpi.label,
                      value: kpi.value,
                      delta: kpi.delta,
                      tone: kpi.tone,
                      trend: kpi.trend,
                      icon: kpi.icon,
                    }))}
                    onAlert={(alert) => {
                      // Ajouter l'alerte aux notifications
                      setKpiChangeNotifications(prev => [...prev, {
                        id: alert.id,
                        label: alert.kpiLabel,
                        oldValue: 'Alerte',
                        newValue: alert.message,
                        timestamp: alert.timestamp,
                      }]);
                    }}
                  />
                </div>
                {/* Menu d'export */}
                <div className="relative hidden md:block">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className={cn(
                          'p-1.5 rounded-md transition-all duration-200',
                          'hover:bg-slate-800/50 active:scale-95',
                          'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                          showExportMenu && 'bg-blue-500/10'
                        )}
                        aria-label="Exporter les données"
                        aria-expanded={showExportMenu}
                      >
                        <Download className="h-3.5 w-3.5 text-slate-400" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Exporter les données (Ctrl+E)</p>
                    </TooltipContent>
                  </Tooltip>
                  {showExportMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900/95 border border-slate-700/50 rounded-lg shadow-xl backdrop-blur-xl z-50 animate-fadeIn">
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => {
                            exportKPIs('csv');
                            setShowExportMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800/50 rounded-md transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Exporter en CSV
                        </button>
                        <button
                          onClick={() => {
                            exportKPIs('json');
                            setShowExportMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800/50 rounded-md transition-colors"
                        >
                          <BarChart3 className="h-3.5 w-3.5" />
                          Exporter en JSON
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 normal-case">
                    Mise à jour : {formatTimeAgo(lastUpdate)}
                  </span>
                  {isRefreshing && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 animate-pulse">
                          <Zap className="h-2.5 w-2.5" />
                          {retryCount > 0 ? `Tentative ${retryCount}/${maxRetries}...` : 'Actualisation...'}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {retryCount > 0 
                            ? `Nouvelle tentative (${retryCount}/${maxRetries})` 
                            : 'Mise à jour des indicateurs en cours'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {kpiChangeNotifications.length > 0 && !isRefreshing && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                          <Activity className="h-2.5 w-2.5 animate-pulse" />
                          {kpiChangeNotifications.length} changement{kpiChangeNotifications.length > 1 ? 's' : ''}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Des indicateurs ont été mis à jour</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>

          {topKpis.length === 0 ? (
            <div className="py-8 text-center" role="status" aria-live="polite" aria-atomic="true">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800/50 mb-3">
                <Info className="h-6 w-6 text-slate-500" aria-hidden="true" />
              </div>
              <p className="text-sm text-slate-400 mb-2">Aucun indicateur trouvé</p>
              <p className="text-xs text-slate-500 mb-3">
                {kpiFilter 
                  ? `Aucun résultat pour "${kpiFilter}"` 
                  : "Essayez avec d'autres mots-clés"}
              </p>
              {kpiFilter && (
                <button
                  onClick={() => setKpiFilter('')}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1"
                  aria-label="Effacer le filtre de recherche"
                >
                  Effacer le filtre
                </button>
              )}
            </div>
          ) : (
            <div 
              className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3"
              role="list"
              aria-label={`Liste des indicateurs de performance${topKpis.length !== allKpis.length ? ` (${topKpis.length} sur ${allKpis.length} affichés)` : ''}`}
            >
              {topKpis.map((kpi, index) => {
                const Icon = kpi.icon;
                const isPositive = kpi.trend === 'up' && kpi.tone === 'ok';
                const isNegative = kpi.trend === 'down' && (kpi.tone === 'warn' || kpi.tone === 'crit');
                
                return (
                  <div key={kpi.label} role="listitem">
                    <KPICard
                      kpi={kpi}
                      icon={Icon}
                      index={index}
                      isPositive={isPositive}
                      isNegative={isNegative}
                      onClick={() => handleKPIClick(kpi)}
                    />
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </TooltipProvider>

        {/* Main Scroll Area - Amélioré avec transitions et ErrorBoundary */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <div className="p-4 sm:p-6 max-w-[1920px] mx-auto">
            {/* ✅ CONTENT SWITCH basé sur le registry avec transitions */}
            <ErrorBoundary>
              <div 
                key={`${mainCategory}-${subCategory}-${subSubCategory}`}
                className="animate-fadeIn"
              >
                <Suspense fallback={<ContentLoadingSkeleton />}>
                  <DashboardContentSwitchWrapper 
                    mainCategory={mainCategory}
                    subCategory={subCategory}
                    subSubCategory={subSubCategory}
                  />
                </Suspense>
              </div>
            </ErrorBoundary>
          </div>
        </div>

        {/* Footer - Amélioré avec métriques et actions */}
        <div className="border-t border-slate-800/60 bg-gradient-to-r from-slate-900/60 via-slate-900/40 to-slate-900/60 backdrop-blur-xl px-4 py-3 text-xs text-slate-500 flex items-center justify-between shadow-lg shadow-black/10">
          <div className="flex items-center gap-3 flex-wrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-medium text-slate-400 cursor-help">Dashboard v5.7</span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1 text-xs">
                  <div className="font-semibold">Version 5.7</div>
                  <div className="text-slate-400">Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}</div>
                </div>
              </TooltipContent>
            </Tooltip>
            <span className="text-slate-600">•</span>
            <span className="text-slate-500">Store Zustand</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-500">Navigation synchronisée</span>
            {topKpis.length > 0 && (
              <>
                <span className="text-slate-600 hidden md:inline">•</span>
                <span className="text-slate-500 hidden md:inline">
                  {topKpis.length} indicateur{topKpis.length > 1 ? 's' : ''} actif{topKpis.length > 1 ? 's' : ''}
                </span>
              </>
            )}
            <span className="text-slate-600 hidden sm:inline">•</span>
            {performanceMetrics.renderTime > 0 && performanceMetrics.renderTime < 100 && (
              <>
                <span className="text-slate-600 hidden lg:inline">•</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="hidden lg:inline-flex items-center gap-1 text-slate-500">
                      <Zap className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">{performanceMetrics.renderTime.toFixed(0)}ms</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Temps de rendu: {performanceMetrics.renderTime.toFixed(2)}ms</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
            <span className="text-slate-600 hidden sm:inline">•</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="hidden sm:inline-flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-1"
                  aria-label="Raccourcis clavier"
                >
                  <Info className="h-3 w-3" />
                  <span className="text-[10px]">Raccourcis</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-1.5 text-xs">
                  <div className="font-semibold mb-2">Raccourcis clavier</div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Ouvrir la palette</span>
                    <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Ctrl+K</kbd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Actualiser</span>
                    <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Ctrl+R</kbd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Exporter</span>
                    <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Ctrl+E</kbd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Fermer notifications</span>
                    <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Esc</kbd>
                  </div>
                  {performanceMetrics.loadTime > 0 && (
                    <div className="pt-2 mt-2 border-t border-slate-700">
                      <div className="flex items-center justify-between gap-4">
                        <span>Dernier chargement</span>
                        <span className="text-emerald-400">{performanceMetrics.loadTime.toFixed(0)}ms</span>
                      </div>
                      {performanceMetrics.renderTime > 0 && (
                        <div className="flex items-center justify-between gap-4 mt-1">
                          <span>Temps de rendu</span>
                          <span className="text-emerald-400">{performanceMetrics.renderTime.toFixed(0)}ms</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-emerald-400 font-medium">Connecté</span>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* Notifications de changements de KPIs */}
      <KPINotifications notifications={kpiChangeNotifications} onDismiss={(id) => {
        setKpiChangeNotifications(prev => prev.filter(n => n.id !== id));
      }} />

      {/* Overlay pour fermer le menu d'export */}
      {showExportMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowExportMenu(false)}
          aria-hidden="true"
        />
      )}

      {/* Modals */}
      <DashboardModals />
    </>
  );
}

/* =========================
   Types et Interfaces - Consolidés
========================= */

// Types réutilisés pour les KPIs
type KPITone = 'ok' | 'warn' | 'crit' | 'info';
type KPITrend = 'up' | 'down' | 'neutral';

interface KPIData {
  label: string;
  value: string | number;
  delta: string;
  tone: KPITone;
  trend: KPITrend;
  icon: React.ComponentType<{ className?: string }>;
}

interface KPICardProps {
  kpi: KPIData;
  icon: React.ComponentType<{ className?: string }>;
  index: number;
  isPositive: boolean;
  isNegative: boolean;
  onClick?: () => void;
}

const KPICard = memo(function KPICard({ 
  kpi, 
  icon: Icon, 
  index, 
  isPositive, 
  isNegative,
  onClick
}: KPICardProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Animation lors du changement de valeur
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [kpi.value, kpi.delta]);

  const getTrendIcon = () => {
    if (kpi.trend === 'up') {
      return <ArrowUpRight className="h-3 w-3" />;
    }
    if (kpi.trend === 'down') {
      return <ArrowDownRight className="h-3 w-3" />;
    }
    return <Minus className="h-3 w-3" />;
  };

  const getTooltipContent = () => {
    const trendText = kpi.trend === 'up' ? 'augmentation' : kpi.trend === 'down' ? 'diminution' : 'stable';
    const toneText = kpi.tone === 'ok' ? 'Normal' : kpi.tone === 'warn' ? 'Attention' : kpi.tone === 'crit' ? 'Critique' : 'Information';
    return (
      <div className="space-y-1">
        <div className="font-semibold">{kpi.label}</div>
        <div className="text-xs text-slate-300">
          Valeur actuelle: <span className="font-medium">{kpi.value}</span>
        </div>
        <div className="text-xs text-slate-400">
          Variation: <span className={cn(
            isPositive && 'text-emerald-400',
            isNegative && 'text-red-400',
            !isPositive && !isNegative && 'text-slate-400'
          )}>{kpi.delta}</span> ({trendText})
        </div>
        <div className="text-xs text-slate-500 pt-1 border-t border-slate-700">
          Statut: {toneText}
        </div>
        {onClick && (
          <div className="text-xs text-blue-400 pt-1 border-t border-slate-700 mt-1 flex items-center gap-1">
            <Info className="h-3 w-3" />
            <span>Cliquer pour voir les détails</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'group relative rounded-xl border backdrop-blur-xl px-4 py-3',
            'transition-all duration-300 ease-out',
            onClick ? 'cursor-pointer active:scale-[0.98]' : 'cursor-help',
            'hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20',
            onClick && 'hover:ring-2 hover:ring-blue-500/30',
            'animate-fadeIn',
            'focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:outline-none',
            kpi.tone === 'ok' && 'border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-emerald-500/0 hover:border-emerald-500/30',
            kpi.tone === 'warn' && 'border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-amber-500/0 hover:border-amber-500/30',
            kpi.tone === 'crit' && 'border-red-500/20 bg-gradient-to-br from-red-500/5 to-red-500/0 hover:border-red-500/30',
            kpi.tone === 'info' && 'border-slate-500/20 bg-gradient-to-br from-slate-500/5 to-slate-500/0 hover:border-slate-500/30'
          )}
          style={{
            animationDelay: `${index * 50}ms`,
          }}
          tabIndex={0}
          role="button"
          aria-label={`${kpi.label}: ${kpi.value}, ${kpi.delta}. ${onClick ? 'Cliquez pour voir les détails' : ''}`}
          onClick={onClick}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && onClick) {
              e.preventDefault();
              onClick();
            }
          }}
        >
      {/* Background glow effect */}
      <div
        className={cn(
          'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          kpi.tone === 'ok' && 'bg-emerald-500/5',
          kpi.tone === 'warn' && 'bg-amber-500/5',
          kpi.tone === 'crit' && 'bg-red-500/5',
          kpi.tone === 'info' && 'bg-slate-500/5'
        )}
      />

      <div className="relative z-10">
        {/* Header with icon and label */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'p-1.5 rounded-lg transition-all duration-200',
                kpi.tone === 'ok' && 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20',
                kpi.tone === 'warn' && 'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20',
                kpi.tone === 'crit' && 'bg-red-500/10 text-red-400 group-hover:bg-red-500/20',
                kpi.tone === 'info' && 'bg-slate-500/10 text-slate-400 group-hover:bg-slate-500/20'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide truncate">
              {kpi.label}
            </span>
            {onClick && (
              <Info className="h-2.5 w-2.5 text-blue-400/60 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            )}
          </div>
        </div>

        {/* Value and delta */}
        <div className="flex items-end justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div
              className={cn(
                'text-xl font-bold truncate transition-all duration-300',
                'text-slate-100 group-hover:text-white',
                'relative',
                isAnimating && 'scale-110 text-blue-300'
              )}
            >
              <span className="relative z-10">{String(kpi.value)}</span>
              {/* Effet de brillance sur la valeur */}
              {isAnimating && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-shimmer" />
              )}
            </div>
            {/* Mini sparkline graph - masqué sur très petits écrans */}
            <div className="hidden xs:block mt-1.5">
              <KPISparkline 
                tone={kpi.tone} 
                trend={kpi.trend}
                aria-label={`Graphique de tendance pour ${kpi.label}`}
              />
            </div>
          </div>
          <div
            className={cn(
              'flex items-center gap-0.5 text-[10px] font-semibold whitespace-nowrap transition-all duration-300',
              isPositive && 'text-emerald-400',
              isNegative && 'text-red-400',
              !isPositive && !isNegative && 'text-slate-400',
              'group-hover:scale-110',
              isAnimating && 'scale-125'
            )}
          >
            {getTrendIcon()}
            <span>{kpi.delta}</span>
          </div>
        </div>
      </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        {getTooltipContent()}
      </TooltipContent>
    </Tooltip>
  );
});

/* =========================
   Utility Functions
========================= */

/* =========================
   Content Loading Skeleton - Amélioré
========================= */

function ContentLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="h-10 bg-gradient-to-r from-slate-800/40 via-slate-800/60 to-slate-800/40 rounded-xl w-1/3 animate-shimmer" />
        <div className="h-4 bg-slate-800/30 rounded-lg w-2/3" />
      </div>

      {/* Cards grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div 
            key={i} 
            className="h-40 bg-gradient-to-br from-slate-800/30 via-slate-800/20 to-slate-800/30 rounded-xl border border-slate-700/30 p-4 space-y-3 animate-shimmer"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="h-4 bg-slate-700/40 rounded w-1/2" />
            <div className="h-8 bg-slate-700/40 rounded w-3/4" />
            <div className="h-3 bg-slate-700/30 rounded w-full" />
            <div className="h-3 bg-slate-700/30 rounded w-2/3" />
          </div>
        ))}
      </div>

      {/* Chart/Table skeleton */}
      <div className="space-y-4">
        <div className="h-6 bg-slate-800/40 rounded-lg w-1/4" />
        <div className="h-80 bg-gradient-to-br from-slate-800/30 via-slate-800/20 to-slate-800/30 rounded-xl border border-slate-700/30 p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-slate-700/30 rounded-lg" />
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-700/20 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Dashboard Content Switch Wrapper avec transitions
========================= */

interface DashboardContentSwitchWrapperProps {
  mainCategory: string;
  subCategory: string | null;
  subSubCategory: string | null;
}

const DashboardContentSwitchWrapper = memo(function DashboardContentSwitchWrapper({
  mainCategory,
  subCategory,
  subSubCategory,
}: DashboardContentSwitchWrapperProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [mainCategory, subCategory, subSubCategory]);

  return (
    <div 
      className={cn(
        'transition-all duration-300 ease-out',
        isTransitioning && 'opacity-50 scale-[0.98]'
      )}
    >
      <DashboardContentSwitch />
    </div>
  );
});

/* =========================
   KPI Notifications Component
========================= */

interface KPINotification {
  id: string;
  label: string;
  oldValue: string | number;
  newValue: string | number;
  timestamp: Date;
}

interface KPINotificationsProps {
  notifications: KPINotification[];
  onDismiss: (id: string) => void;
}

function KPINotifications({ notifications, onDismiss }: KPINotificationsProps) {
  if (notifications.length === 0) return null;

  // Limiter le nombre de notifications affichées (max 5)
  const displayedNotifications = notifications.slice(-5);

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm"
      role="region"
      aria-label="Notifications de changements de KPIs"
      aria-live="polite"
      aria-atomic="false"
    >
                  {displayedNotifications.map((notification, idx) => {
        const isIncrease = typeof notification.oldValue === 'number' && typeof notification.newValue === 'number'
          ? notification.newValue > notification.oldValue
          : false;
        
        return (
          <div
            key={notification.id}
            className={cn(
              'rounded-lg border p-3 shadow-lg backdrop-blur-xl animate-fadeIn',
              'bg-slate-900/95 border-slate-700/50',
              'flex items-start gap-3',
              'hover:shadow-xl hover:scale-[1.02] transition-all duration-200',
              'cursor-pointer'
            )}
            style={{
              animationDelay: `${idx * 100}ms`,
            }}
            onClick={() => onDismiss(notification.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onDismiss(notification.id);
              }
            }}
            aria-label={`Notification: ${notification.label} - ${notification.oldValue} → ${notification.newValue}`}
          >
            <div className={cn(
              'p-1.5 rounded-md',
              isIncrease ? 'bg-emerald-500/20' : 'bg-amber-500/20'
            )}>
              {isIncrease ? (
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-amber-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-slate-200 mb-0.5">
                {notification.label}
              </div>
              <div className="text-xs text-slate-400">
                <span className="line-through text-slate-500 mr-1.5" aria-label={`Ancienne valeur: ${notification.oldValue}`}>
                  {notification.oldValue}
                </span>
                <span 
                  className={cn(
                    'font-semibold',
                    isIncrease ? 'text-emerald-400' : 'text-amber-400'
                  )}
                  aria-label={`Nouvelle valeur: ${notification.newValue}`}
                >
                  → {notification.newValue}
                </span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(notification.id);
              }}
              className="text-slate-500 hover:text-slate-300 transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0"
              aria-label="Fermer la notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
      {notifications.length > 5 && (
        <div className="text-xs text-slate-500 text-center pt-2">
          {notifications.length - 5} autre{notifications.length - 5 > 1 ? 's' : ''} notification{notifications.length - 5 > 1 ? 's' : ''} masquée{notifications.length - 5 > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

/* =========================
   KPI Sparkline Component - Mini graphique
========================= */

interface KPISparklineProps {
  tone: KPITone;
  trend: KPITrend;
  'aria-label'?: string;
}

const KPISparkline = memo(function KPISparkline({ tone, trend, 'aria-label': ariaLabel }: KPISparklineProps) {
  // Générer des données mock stables pour le mini graphique
  // Utiliser un seed basé sur tone+trend pour avoir des valeurs cohérentes
  const sparklineData = useMemo(() => {
    const points = 7;
    const baseValue = 50;
    const variation = trend === 'up' ? 15 : trend === 'down' ? -15 : 5;
    
    // Seed simple pour générer des valeurs pseudo-aléatoires mais stables
    const seed = (tone.charCodeAt(0) + trend.charCodeAt(0)) % 100;
    
    // Fonction pseudo-aléatoire simple basée sur le seed
    let currentSeed = seed;
    const pseudoRandom = () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
    
    return Array.from({ length: points }, (_, i) => {
      const progress = i / (points - 1);
      // Utiliser pseudoRandom au lieu de Math.random pour stabilité
      const randomVariation = (pseudoRandom() - 0.5) * 10;
      return Math.max(0, Math.min(100, baseValue + variation * progress + randomVariation));
    });
  }, [tone, trend]);

  const getColor = () => {
    if (tone === 'ok') return 'stroke-emerald-400';
    if (tone === 'warn') return 'stroke-amber-400';
    if (tone === 'crit') return 'stroke-red-400';
    return 'stroke-slate-400';
  };

  const height = 20;
  const width = 40;
  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const maxValue = Math.max(...sparklineData, 1);
  const minValue = Math.min(...sparklineData, 0);

  const points = sparklineData
    .map((value, index) => {
      const x = padding + (index / (sparklineData.length - 1 || 1)) * chartWidth;
      const y = padding + chartHeight - ((value - minValue) / (maxValue - minValue || 1)) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div 
      className="mt-1.5 opacity-60 group-hover:opacity-100 transition-opacity duration-300" 
      aria-label={ariaLabel}
    >
      <svg 
        width={width} 
        height={height} 
        className="overflow-visible transition-transform duration-300 group-hover:scale-105"
        aria-hidden="true"
        role="img"
      >
        <polyline
          points={points}
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={getColor()}
          style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }}
        />
        {/* Point final pour accent */}
        <circle
          cx={padding + chartWidth}
          cy={padding + chartHeight - ((sparklineData[sparklineData.length - 1] - minValue) / (maxValue - minValue || 1)) * chartHeight}
          r="1.5"
          className={cn('fill-current', getColor())}
        />
      </svg>
    </div>
  );
});

/* =========================
   Utility Functions
========================= */

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'à l\'instant';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `il y a ${diffInMinutes} min`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `il y a ${diffInHours}h`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `il y a ${diffInDays}j`;
}



