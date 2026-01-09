'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import { useAutoSyncCounts } from '@/hooks/useAutoSync';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  AnalyticsDashboard,
  ComparisonChart,
  PredictionInsights,
  AdvancedFilters,
  AnomalyDetection,
  PerformanceHeatmap,
  PerformanceScore,
  AdvancedExport,
  IntelligentInsights,
  PredictiveTimeline,
  MultiBureauComparator,
  NarrativeReport,
  DetailsSidePanel,
  FinanceDashboard,
  ClientsDashboard,
  SavedViews,
} from '@/components/features/bmo/analytics';

import { bureaux, clientsGlobalStats, financials, performanceData, projects } from '@/lib/data';
import { downloadBlob, toCsv } from '@/lib/utils/export';
import { aggregateByMonth, expandMonthlyDataByBureau, filterRowsByPeriod } from '@/lib/utils/analytics-helpers';

type ReportType = 'mensuel-dg' | 'bureau' | 'projet';
type ViewType =
  | 'overview'
  | 'tendances'
  | 'rapports'
  | 'sources'
  | 'comparaisons'
  | 'predictions'
  | 'anomalies'
  | 'insights'
  | 'finance'
  | 'clients';

type BaseMonthlyRow = {
  month: string;
  validations: number;
  demandes: number;
  budget: number;
  rejets: number;
};

type EnrichedRow = BaseMonthlyRow & {
  tauxValidation: number;
  tauxRejet: number;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function CmdItem({
  label,
  hint,
  onClick,
}: {
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left p-3 rounded-lg border border-slate-700/30 hover:bg-orange-500/5 transition-colors"
    >
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-[10px] text-slate-400">{hint}</p>
    </button>
  );
}

export default function AnalyticsPage() {
  const sp = useSearchParams();
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();

  // Navigation/persistance simple (si votre hook gère un store)
  const { updateFilters, getFilters } = usePageNavigation('analytics');

  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [selectedBureau, setSelectedBureau] = useState<string>('ALL');
  const [selectedProject, setSelectedProject] = useState<string>('ALL');
  const [generatingReport, setGeneratingReport] = useState(false);

  const [selectedBureaux, setSelectedBureaux] = useState<string[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({});

  const [sidePanelData, setSidePanelData] = useState<any>(null);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const lastAnomaliesNotifiedRef = useRef<{ count: number; ts: number } | null>(null);

  const handleAdvancedFiltersChange = (next: Record<string, any>) => {
    setAdvancedFilters(next);
    const nextBureaux = Array.isArray(next?.bureaux) ? next.bureaux : [];
    setSelectedBureaux(nextBureaux);
  };

  // UX : recherche + palette de commandes
  const [q, setQ] = useState('');
  const search = q.trim().toLowerCase();
  const [cmdOpen, setCmdOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const exportRef = useRef<HTMLDivElement | null>(null);

  // Init depuis URL + store navigation (sans casser vos composants existants)
  useEffect(() => {
    const view = sp.get('view') as ViewType | null;
    const bureau = sp.get('bureau');
    const project = sp.get('project');
    const bureauxParam = sp.get('bureaux');
    const period = sp.get('period') as 'month' | 'quarter' | 'year' | 'custom' | null;
    const startDate = sp.get('startDate');
    const endDate = sp.get('endDate');
    const filterType = sp.get('type');
    const minDemandesParam = sp.get('minDemandes');
    const maxTauxRejetParam = sp.get('maxTauxRejet');
    const minTauxValidationParam = sp.get('minTauxValidation');

    if (view && ['overview', 'tendances', 'insights', 'comparaisons', 'predictions', 'anomalies', 'rapports', 'sources', 'finance', 'clients'].includes(view)) {
      setActiveView(view);
    }
    if (bureau) setSelectedBureau(bureau);
    if (project) setSelectedProject(project);

    const urlAdvanced: Record<string, any> = {};
    if (period && ['month', 'quarter', 'year', 'custom'].includes(period)) urlAdvanced.period = period;
    if (startDate) urlAdvanced.startDate = startDate;
    if (endDate) urlAdvanced.endDate = endDate;
    if (filterType) urlAdvanced.type = filterType;

    const minDemandes = minDemandesParam ? Number(minDemandesParam) : undefined;
    const maxTauxRejet = maxTauxRejetParam ? Number(maxTauxRejetParam) : undefined;
    const minTauxValidation = minTauxValidationParam ? Number(minTauxValidationParam) : undefined;
    if (Number.isFinite(minDemandes)) urlAdvanced.minDemandes = minDemandes;
    if (Number.isFinite(maxTauxRejet)) urlAdvanced.maxTauxRejet = maxTauxRejet;
    if (Number.isFinite(minTauxValidation)) urlAdvanced.minTauxValidation = minTauxValidation;
    if (bureauxParam) {
      const parsed = bureauxParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (parsed.length) urlAdvanced.bureaux = parsed;
    }
    if (Object.keys(urlAdvanced).length) {
      setAdvancedFilters((prev) => ({ ...prev, ...urlAdvanced }));
      setSelectedBureaux(Array.isArray(urlAdvanced.bureaux) ? urlAdvanced.bureaux : []);
    }

    const stored = (getFilters?.() ?? {}) as any;
    if (stored && typeof stored === 'object') {
      setActiveView((prev) => (view ? prev : stored.activeView ?? prev));
      setSelectedBureau((prev) => (bureau ? prev : stored.selectedBureau ?? prev));
      setSelectedProject((prev) => (project ? prev : stored.selectedProject ?? prev));
      setAdvancedFilters((prev) => (Object.keys(urlAdvanced).length ? prev : stored.advancedFilters ?? prev));
      setSelectedBureaux((prev) => (bureauxParam ? prev : stored.selectedBureaux ?? prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync vers URL + store navigation (IMPORTANT: replace pour ne pas casser le scroll / l'historique)
  useEffect(() => {
    try {
      const urlFilters: Record<string, string | number | boolean> = {
        view: activeView,
      };

      if (selectedBureau && selectedBureau !== 'ALL') urlFilters.bureau = selectedBureau;
      if (selectedProject && selectedProject !== 'ALL') urlFilters.project = selectedProject;

      if (advancedFilters?.period) urlFilters.period = String(advancedFilters.period);
      if (advancedFilters?.startDate) urlFilters.startDate = String(advancedFilters.startDate);
      if (advancedFilters?.endDate) urlFilters.endDate = String(advancedFilters.endDate);
      if (advancedFilters?.type) urlFilters.type = String(advancedFilters.type);
      if (Number.isFinite(advancedFilters?.minDemandes)) urlFilters.minDemandes = Number(advancedFilters.minDemandes);
      if (Number.isFinite(advancedFilters?.maxTauxRejet)) urlFilters.maxTauxRejet = Number(advancedFilters.maxTauxRejet);
      if (Number.isFinite(advancedFilters?.minTauxValidation)) urlFilters.minTauxValidation = Number(advancedFilters.minTauxValidation);
      if (selectedBureaux?.length) urlFilters.bureaux = selectedBureaux.join(',');

      updateFilters?.(urlFilters, true);
    } catch {
      // ignore
    }
  }, [
    activeView,
    selectedBureau,
    selectedProject,
    advancedFilters?.period,
    advancedFilters?.startDate,
    advancedFilters?.endDate,
    advancedFilters?.type,
    advancedFilters?.minDemandes,
    advancedFilters?.maxTauxRejet,
    advancedFilters?.minTauxValidation,
    selectedBureaux,
    updateFilters,
  ]);

  // Raccourcis clavier : "/" recherche, Ctrl/⌘+K palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && key === 'k') {
        e.preventDefault();
        setCmdOpen(true);
      }
      if (!e.metaKey && !e.ctrlKey && key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (key === 'escape') {
        setCmdOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // =========================
  // Dataset cohérent par bureau (déverrouille Comparaisons / Heatmaps)
  // =========================
  const bureauExpandedAll = useMemo(() => {
    return expandMonthlyDataByBureau(performanceData as any, bureaux, { jitter: 0.08 });
  }, []);

  const bureauExpandedPeriod = useMemo(() => {
    return filterRowsByPeriod(bureauExpandedAll as any, {
      period: advancedFilters?.period,
      startDate: advancedFilters?.startDate,
      endDate: advancedFilters?.endDate,
    });
  }, [bureauExpandedAll, advancedFilters?.period, advancedFilters?.startDate, advancedFilters?.endDate]);

  const bureauExpandedSelected = useMemo(() => {
    if (!selectedBureaux?.length || selectedBureaux.includes('ALL')) return bureauExpandedPeriod as any[];
    const set = new Set(selectedBureaux);
    return (bureauExpandedPeriod as any[]).filter((r: any) => set.has(String(r.bureau)));
  }, [bureauExpandedPeriod, selectedBureaux]);

  const monthlyAgg = useMemo(() => {
    return aggregateByMonth(bureauExpandedSelected as any);
  }, [bureauExpandedSelected]);

  const enrichedBureauData = useMemo(() => {
    return (bureauExpandedSelected as any[]).map((d: any) => {
      const demandes = Number(d.demandes ?? 0);
      const validations = Number(d.validations ?? 0);
      const rejets = Number(d.rejets ?? 0);
      const denom = demandes <= 0 ? 1 : demandes;
      return {
        ...d,
        tauxValidation: clamp(Math.round((validations / denom) * 100), 0, 100),
        tauxRejet: clamp(Math.round((rejets / denom) * 100), 0, 100),
      };
    });
  }, [bureauExpandedSelected]);

  // Données enrichies (agrégées sur les bureaux filtrés) + seuils + recherche
  const enrichedData = useMemo<EnrichedRow[]>(() => {
    let data: EnrichedRow[] = (monthlyAgg as any[]).map((d: any) => {
      const demandes = Number(d.demandes ?? 0);
      const validations = Number(d.validations ?? 0);
      const rejets = Number(d.rejets ?? 0);
      const denom = demandes <= 0 ? 1 : demandes;
      return {
        ...d,
        tauxValidation: clamp(Math.round((validations / denom) * 100), 0, 100),
        tauxRejet: clamp(Math.round((rejets / denom) * 100), 0, 100),
      };
    });

    if (Number.isFinite(advancedFilters?.minDemandes)) {
      const min = Number(advancedFilters.minDemandes);
      data = data.filter((d: any) => Number(d.demandes ?? 0) >= min);
    }
    if (Number.isFinite(advancedFilters?.maxTauxRejet)) {
      const max = Number(advancedFilters.maxTauxRejet);
      data = data.filter((d: any) => Number(d.tauxRejet ?? 0) <= max);
    }
    if (Number.isFinite(advancedFilters?.minTauxValidation)) {
      const min = Number(advancedFilters.minTauxValidation);
      data = data.filter((d: any) => Number(d.tauxValidation ?? 0) >= min);
    }

    if (search) {
      data = data.filter((d: any) => {
        const hay = `${d.month ?? ''} ${d.demandes ?? ''} ${d.validations ?? ''} ${d.rejets ?? ''} ${d.budget ?? ''} ${d.tauxValidation ?? ''} ${d.tauxRejet ?? ''}`.toLowerCase();
        return hay.includes(search);
      });
    }

    return data;
  }, [monthlyAgg, advancedFilters?.minDemandes, advancedFilters?.maxTauxRejet, advancedFilters?.minTauxValidation, search]);

  // Totaux annuels (sur données filtrées)
  const yearlyTotals = useMemo(() => {
    return enrichedData.reduce(
      (acc, m: any) => ({
        demandes: acc.demandes + Number(m.demandes ?? 0),
        validations: acc.validations + Number(m.validations ?? 0),
        rejets: acc.rejets + Number(m.rejets ?? 0),
        budget: acc.budget + Number(m.budget ?? 0),
      }),
      { demandes: 0, validations: 0, rejets: 0, budget: 0 }
    );
  }, [enrichedData]);

  const monthlyAverages = useMemo(() => {
    const count = enrichedData.length || 1;
    return {
      demandes: Math.round(yearlyTotals.demandes / count),
      validations: Math.round(yearlyTotals.validations / count),
      rejets: Math.round(yearlyTotals.rejets / count),
      budget: Number(yearlyTotals.budget / count).toFixed(1),
    };
  }, [yearlyTotals, enrichedData.length]);

  // Previous period (6 premiers mois) stabilisé
  const previousPeriodTotals = useMemo(() => {
    const allAgg = aggregateByMonth(bureauExpandedAll as any);
    return allAgg.slice(0, 6).reduce(
      (acc: any, m: any) => ({
        demandes: acc.demandes + Number(m.demandes ?? 0),
        validations: acc.validations + Number(m.validations ?? 0),
        rejets: acc.rejets + Number(m.rejets ?? 0),
        budget: acc.budget + Number(m.budget ?? 0),
      }),
      { demandes: 0, validations: 0, rejets: 0, budget: 0 }
    );
  }, [bureauExpandedAll]);

  // Anomalies "simples" (utile pour sidebar counts / badges)
  const anomaliesCount = useMemo(() => {
    // heuristique: tauxRejet > 20% ou baisse brutale de validations
    let count = 0;
    for (let i = 0; i < enrichedData.length; i++) {
      const r = enrichedData[i] as any;
      const prev = enrichedData[i - 1] as any;
      if (Number(r.tauxRejet ?? 0) > 20) count++;
      if (prev && Number(r.validations ?? 0) < Number(prev.validations ?? 0) * 0.6) count++;
    }
    return count;
  }, [enrichedData]);

  // Alerting (anti-spam) : notifier seulement sur changement + seuil
  useEffect(() => {
    if (!Number.isFinite(anomaliesCount) || anomaliesCount <= 0) return;
    const now = Date.now();
    const last = lastAnomaliesNotifiedRef.current;
    const changed = !last || last.count !== anomaliesCount;
    const cooledDown = !last || now - last.ts > 60_000;
    if (!changed || !cooledDown) return;

    lastAnomaliesNotifiedRef.current = { count: anomaliesCount, ts: now };
    addToast(
      anomaliesCount >= 5
        ? `🚨 Pilotage: ${anomaliesCount} anomalies détectées (priorité haute)`
        : `⚠️ Pilotage: ${anomaliesCount} anomalies détectées`,
      anomaliesCount >= 5 ? 'error' : 'warning'
    );
  }, [anomaliesCount, addToast]);

  // Sync counts sidebar (ex: anomalies)
  useAutoSyncCounts('analytics', () => anomaliesCount, { interval: 15000, immediate: true });

  // Sources (traçabilité) : useMemo pour éviter recalcul/hydratation "bruyante"
  const dataSources = useMemo(() => {
    const now = new Date().toLocaleString('fr-FR');
    return [
      {
        indicateur: 'Demandes',
        source: 'Module Demandes (demands)',
        table: 'demands',
        champs: 'id, status, date, bureau',
        frequence: 'Temps réel',
        lastSync: now,
      },
      {
        indicateur: 'Validations',
        source: 'Module Validation BC/Factures',
        table: 'bcToValidate, facturesToValidate',
        champs: 'status === "validated"',
        frequence: 'Temps réel',
        lastSync: now,
      },
      {
        indicateur: 'Rejets',
        source: 'Module Validation BC/Factures',
        table: 'bcToValidate, facturesToValidate',
        champs: 'status === "rejected"',
        frequence: 'Temps réel',
        lastSync: now,
      },
      {
        indicateur: 'Budget traité',
        source: 'Module Paiements N+1',
        table: 'paymentsN1',
        champs: 'SUM(amount) WHERE status = "validated"',
        frequence: 'Quotidien',
        lastSync: now,
      },
      {
        indicateur: 'Dossiers bloqués',
        source: 'Module Blocages',
        table: 'blockedDossiers',
        champs: 'delay >= 5',
        frequence: 'Temps réel',
        lastSync: now,
      },
      {
        indicateur: 'Charge bureaux',
        source: 'Calcul agrégé',
        table: 'demands, tasks, projects',
        champs: 'COUNT(*) GROUP BY bureau',
        frequence: 'Horaire',
        lastSync: now,
      },
    ];
  }, []);

  const financeEvolution = useMemo(() => {
    return filterRowsByPeriod((financials as any)?.evolution ?? [], {
      period: advancedFilters?.period,
      startDate: advancedFilters?.startDate,
      endDate: advancedFilters?.endDate,
    });
  }, [advancedFilters?.period, advancedFilters?.startDate, advancedFilters?.endDate]);

  const clientsEvolution = useMemo(() => {
    return filterRowsByPeriod((clientsGlobalStats as any)?.evolutionMensuelle ?? [], {
      period: advancedFilters?.period,
      startDate: advancedFilters?.startDate,
      endDate: advancedFilters?.endDate,
    });
  }, [advancedFilters?.period, advancedFilters?.startDate, advancedFilters?.endDate]);

  const generateReport = async (type: ReportType) => {
    setGeneratingReport(true);
    addToast(`Génération du rapport ${type} en cours...`, 'info');

    // simulate
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setGeneratingReport(false);
    addToast(`Rapport ${type} généré avec succès !`, 'success');
  };

  const handleKpiClick = (kpiData: any) => {
    setSidePanelData({
      title: kpiData.title,
      type: 'kpi',
      details: kpiData.details,
      trend: kpiData.trend,
      metadata: {
        'Dernière mise à jour': new Date().toLocaleString('fr-FR'),
        Source: kpiData.source || 'Calcul automatique',
      },
    });
    setShowSidePanel(true);
  };

  const exportFilteredCsv = () => {
    const rows = enrichedData.map((r: any) => ({
      month: r.month,
      demandes: r.demandes,
      validations: r.validations,
      rejets: r.rejets,
      tauxValidation: `${r.tauxValidation}%`,
      tauxRejet: `${r.tauxRejet}%`,
      budget: r.budget,
    }));

    const csv = toCsv(rows, { delimiter: ';', withBom: true });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    downloadBlob(blob, `analytics-${new Date().toISOString().slice(0, 10)}.csv`);

    addToast('📤 Export CSV généré', 'success');
  };

  const resetAll = () => {
    setQ('');
    setAdvancedFilters({});
    setSelectedBureaux([]);
    setSelectedBureau('ALL');
    setSelectedProject('ALL');
    addToast('Filtres réinitialisés.', 'info');
  };

  const applySavedView = (state: {
    activeView: string;
    selectedBureau: string;
    selectedProject: string;
    advancedFilters: Record<string, any>;
    selectedBureaux: string[];
  }) => {
    setActiveView(state.activeView as ViewType);
    setSelectedBureau(state.selectedBureau ?? 'ALL');
    setSelectedProject(state.selectedProject ?? 'ALL');
    setAdvancedFilters(state.advancedFilters ?? {});
    setSelectedBureaux(Array.isArray(state.selectedBureaux) ? state.selectedBureaux : []);
  };

  return (
    <div ref={exportRef} className="space-y-6 p-4">
      {/* Header "pilotage" + outils */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <span className="text-3xl">📈</span>
            Analytics & Pilotage Avancé
            {anomaliesCount > 0 && (
              <div className="flex items-center gap-2 ml-2">
                <Badge variant="warning">{anomaliesCount} anomalies</Badge>
                <Button size="sm" variant="ghost" onClick={() => setActiveView('anomalies')} className="h-7 px-2 text-xs">
                  Voir
                </Button>
              </div>
            )}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Tableaux de bord intelligents • "/" recherche • "Ctrl/⌘+K" commandes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SavedViews
            current={{
              activeView,
              selectedBureau,
              selectedProject,
              advancedFilters,
              selectedBureaux,
            }}
            onApply={applySavedView}
          />
          <AdvancedFilters filters={advancedFilters} onFiltersChange={handleAdvancedFiltersChange} />
          <AdvancedExport data={enrichedData} type="analytics" fileName="rapport-analytics" targetRef={exportRef} />
          <Button size="sm" variant="ghost" onClick={exportFilteredCsv}>
            📤 CSV
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setCmdOpen(true)}>
            ⌘K
          </Button>
        </div>
      </div>

      {/* Empty state: aide au pilotage quand les filtres éliminent tout */}
      {['overview', 'tendances', 'insights', 'comparaisons', 'predictions', 'anomalies', 'rapports', 'sources'].includes(activeView) &&
        enrichedData.length === 0 && (
          <Card className="border-orange-500/30">
            <CardHeader>
              <CardTitle className="text-sm">Aucune donnée pour ces filtres</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-2">
              <p className="text-xs text-slate-400 flex-1 min-w-[220px]">
                Ajustez la période / les bureaux, ou réinitialisez pour revenir à une vue exploitable.
              </p>
              <Button size="sm" variant="secondary" onClick={resetAll}>
                Réinitialiser
              </Button>
              <Button size="sm" variant="outline" onClick={() => setActiveView('sources')}>
                Voir sources
              </Button>
            </CardContent>
          </Card>
        )}

      {/* Recherche */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={searchRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher (mois, bureau, chiffres)…"
          aria-label="Rechercher dans les analytics"
          className={cn(
            'flex-1 min-w-[240px] px-3 py-2 rounded text-sm',
            darkMode ? 'bg-slate-800 border border-slate-600' : 'bg-white border border-gray-300'
          )}
        />
        <Button size="sm" variant="ghost" onClick={() => setQ('')}>
          Effacer
        </Button>
      </div>

      {/* Navigation onglets */}
      <div className="flex gap-2 border-b border-slate-700/50 pb-2 overflow-x-auto">
        <Button size="sm" variant={activeView === 'overview' ? 'default' : 'ghost'} onClick={() => setActiveView('overview')} className="whitespace-nowrap">
          🏠 Vue d'ensemble
        </Button>
        <Button size="sm" variant={activeView === 'tendances' ? 'default' : 'ghost'} onClick={() => setActiveView('tendances')}>
          📊 Tendances
        </Button>
        <Button size="sm" variant={activeView === 'insights' ? 'default' : 'ghost'} onClick={() => setActiveView('insights')}>
          💡 Insights
        </Button>
        <Button size="sm" variant={activeView === 'comparaisons' ? 'default' : 'ghost'} onClick={() => setActiveView('comparaisons')}>
          📊 Comparaisons
        </Button>
        <Button size="sm" variant={activeView === 'predictions' ? 'default' : 'ghost'} onClick={() => setActiveView('predictions')}>
          🔮 Prédictions
        </Button>
        <Button size="sm" variant={activeView === 'anomalies' ? 'default' : 'ghost'} onClick={() => setActiveView('anomalies')}>
          🚨 Anomalies
        </Button>
        <Button size="sm" variant={activeView === 'finance' ? 'default' : 'ghost'} onClick={() => setActiveView('finance')}>
          💰 Finance
        </Button>
        <Button size="sm" variant={activeView === 'clients' ? 'default' : 'ghost'} onClick={() => setActiveView('clients')}>
          👥 Clients
        </Button>
        <Button size="sm" variant={activeView === 'rapports' ? 'default' : 'ghost'} onClick={() => setActiveView('rapports')}>
          📄 Rapports
        </Button>
        <Button size="sm" variant={activeView === 'sources' ? 'default' : 'ghost'} onClick={() => setActiveView('sources')}>
          🔍 Sources
        </Button>
      </div>

      {/* VUE: Overview */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          <AnalyticsDashboard
            yearlyTotals={yearlyTotals}
            monthlyAverages={monthlyAverages}
            previousPeriod={previousPeriodTotals}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">📊 Évolution mensuelle : Demandes, Validations, Rejets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={enrichedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="demandes"
                      fill="#3B82F6"
                      name="Demandes"
                      radius={[4, 4, 0, 0]}
                      onClick={(barData: any) =>
                        handleKpiClick({
                          title: `Demandes - ${barData?.month ?? ''}`,
                          details: { demandes: barData?.demandes },
                          trend: 'up',
                        })
                      }
                      style={{ cursor: 'pointer' }}
                    />
                    <Bar yAxisId="left" dataKey="validations" fill="#10B981" name="Validations" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="left" dataKey="rejets" fill="#EF4444" name="Rejets" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="tauxValidation" stroke="#F97316" strokeWidth={2} name="Taux validation %" dot={{ fill: '#F97316' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">💰 Évolution du budget traité (Milliards FCFA)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={enrichedData}>
                    <defs>
                      <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="budget" stroke="#D4AF37" strokeWidth={2} fill="url(#colorBudget)" name="Budget (Mds)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <IntelligentInsights yearlyTotals={yearlyTotals} enrichedData={enrichedData} monthlyAverages={monthlyAverages} />
          <PerformanceScore yearlyTotals={yearlyTotals} enrichedData={enrichedData} />
          <PredictiveTimeline enrichedData={enrichedData} monthsAhead={3} />
          <NarrativeReport yearlyTotals={yearlyTotals} enrichedData={enrichedData} monthlyAverages={monthlyAverages} />
        </div>
      )}

      {/* VUE: Insights */}
      {activeView === 'insights' && (
        <div className="space-y-6">
          <IntelligentInsights yearlyTotals={yearlyTotals} enrichedData={enrichedData} monthlyAverages={monthlyAverages} />
          <AnomalyDetection performanceData={performanceData} enrichedData={enrichedData} />
        </div>
      )}

      {/* VUE: Tendances */}
      {activeView === 'tendances' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">📊 Évolution mensuelle : Demandes, Validations, Rejets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={enrichedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="demandes"
                      fill="#3B82F6"
                      name="Demandes"
                      radius={[4, 4, 0, 0]}
                      onClick={(barData: any) =>
                        handleKpiClick({
                          title: `Demandes - ${barData?.month ?? ''}`,
                          details: { demandes: barData?.demandes },
                          trend: 'up',
                        })
                      }
                      style={{ cursor: 'pointer' }}
                    />
                    <Bar yAxisId="left" dataKey="validations" fill="#10B981" name="Validations" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="left" dataKey="rejets" fill="#EF4444" name="Rejets" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="tauxValidation" stroke="#F97316" strokeWidth={2} name="Taux validation %" dot={{ fill: '#F97316' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">💰 Évolution du budget traité (Milliards FCFA)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={enrichedData}>
                    <defs>
                      <linearGradient id="colorBudget2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="budget" stroke="#D4AF37" strokeWidth={2} fill="url(#colorBudget2)" name="Budget (Mds)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">📋 Données mensuelles détaillées</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                      <th className="px-4 py-2.5 text-left font-bold text-amber-500">Mois</th>
                      <th className="px-4 py-2.5 text-right font-bold text-blue-400">Demandes</th>
                      <th className="px-4 py-2.5 text-right font-bold text-emerald-400">Validations</th>
                      <th className="px-4 py-2.5 text-right font-bold text-red-400">Rejets</th>
                      <th className="px-4 py-2.5 text-right font-bold text-orange-400">Taux %</th>
                      <th className="px-4 py-2.5 text-right font-bold text-amber-400">Budget (Mds)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrichedData.map((row: any, i: number) => (
                      <tr
                        key={i}
                        className={cn(
                          'border-t transition-colors hover:bg-slate-700/30 cursor-pointer',
                          darkMode ? 'border-slate-700/50' : 'border-gray-100'
                        )}
                        onClick={() =>
                          handleKpiClick({
                            title: `Données du mois - ${row.month}`,
                            details: row,
                          })
                        }
                      >
                        <td className="px-4 py-2 font-medium">{row.month}</td>
                        <td className="px-4 py-2 text-right text-blue-400">{row.demandes}</td>
                        <td className="px-4 py-2 text-right text-emerald-400">{row.validations}</td>
                        <td className="px-4 py-2 text-right text-red-400">{row.rejets}</td>
                        <td className="px-4 py-2 text-right text-orange-400">{row.tauxValidation}%</td>
                        <td className="px-4 py-2 text-right text-amber-400">{row.budget}</td>
                      </tr>
                    ))}
                    <tr
                      className={cn(
                        'border-t-2 font-bold',
                        darkMode ? 'border-amber-500/50 bg-amber-500/10' : 'border-amber-300 bg-amber-50'
                      )}
                    >
                      <td className="px-4 py-2">TOTAL</td>
                      <td className="px-4 py-2 text-right text-blue-400">{yearlyTotals.demandes}</td>
                      <td className="px-4 py-2 text-right text-emerald-400">{yearlyTotals.validations}</td>
                      <td className="px-4 py-2 text-right text-red-400">{yearlyTotals.rejets}</td>
                      <td className="px-4 py-2 text-right text-orange-400">
                        {yearlyTotals.demandes > 0 ? ((yearlyTotals.validations / yearlyTotals.demandes) * 100).toFixed(1) : '0.0'}%
                      </td>
                      <td className="px-4 py-2 text-right text-amber-400">{Number(yearlyTotals.budget).toFixed(1)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* VUE: Comparaisons */}
      {activeView === 'comparaisons' && (
        <div className="space-y-6">
          <MultiBureauComparator bureaux={bureaux} performanceData={enrichedBureauData} enrichedData={enrichedBureauData} />
          <ComparisonChart bureaux={bureaux} performanceData={enrichedBureauData} selectedBureaux={selectedBureaux} />
        </div>
      )}

      {/* VUE: Prédictions */}
      {activeView === 'predictions' && (
        <div className="space-y-6">
          <PredictionInsights performanceData={enrichedData} />
          <PredictiveTimeline enrichedData={enrichedData} monthsAhead={3} />
          <div className="grid md:grid-cols-2 gap-4">
            <PerformanceHeatmap performanceData={enrichedBureauData} bureaux={bureaux} metric="demandes" />
            <PerformanceHeatmap performanceData={enrichedBureauData} bureaux={bureaux} metric="taux" />
          </div>
        </div>
      )}

      {/* VUE: Anomalies */}
      {activeView === 'anomalies' && (
        <div className="space-y-6">
          <AnomalyDetection performanceData={enrichedData} enrichedData={enrichedData} />
          <div className="grid md:grid-cols-2 gap-4">
            <PerformanceHeatmap performanceData={enrichedBureauData} bureaux={bureaux} metric="rejets" />
            <PerformanceHeatmap performanceData={enrichedBureauData} bureaux={bureaux} metric="validations" />
          </div>
        </div>
      )}

      {/* VUE: Finance */}
      {activeView === 'finance' && (
        <FinanceDashboard financials={financials} evolution={financeEvolution as any} />
      )}

      {/* VUE: Clients */}
      {activeView === 'clients' && (
        <ClientsDashboard clientsGlobalStats={clientsGlobalStats} evolution={clientsEvolution as any} />
      )}

      {/* VUE: Rapports */}
      {activeView === 'rapports' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">👔 Rapport mensuel DG</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-400">
                  Synthèse exécutive avec KPIs clés, alertes critiques et recommandations.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Format:</span>
                    <Badge>PDF</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Période:</span>
                    <span className="text-slate-400">Mois en cours</span>
                  </div>
                </div>
                <Button className="w-full" onClick={() => generateReport('mensuel-dg')} disabled={generatingReport}>
                  {generatingReport ? '⏳ Génération...' : '📄 Générer'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">🏢 Rapport par bureau</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-400">Performance détaillée d'un bureau avec comparatifs.</p>
                <select
                  className={cn(
                    'w-full p-2 rounded text-xs',
                    darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-300'
                  )}
                  value={selectedBureau}
                  onChange={(e) => setSelectedBureau(e.target.value)}
                >
                  <option value="ALL">Tous les bureaux</option>
                  {bureaux.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
                <Button className="w-full" variant="info" onClick={() => generateReport('bureau')} disabled={generatingReport}>
                  {generatingReport ? '⏳ Génération...' : '📄 Générer'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/30">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">🏗️ Rapport par projet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-400">Suivi budgétaire et avancement d'un projet spécifique.</p>
                <select
                  className={cn(
                    'w-full p-2 rounded text-xs',
                    darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-300'
                  )}
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                >
                  <option value="ALL">Tous les projets</option>
                  {projects.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.id} - {p.name}
                    </option>
                  ))}
                </select>
                <Button className="w-full" variant="success" onClick={() => generateReport('projet')} disabled={generatingReport}>
                  {generatingReport ? '⏳ Génération...' : '📄 Générer'}
                </Button>
              </CardContent>
            </Card>
          </div>

          <NarrativeReport yearlyTotals={yearlyTotals} enrichedData={enrichedData} monthlyAverages={monthlyAverages} />
        </div>
      )}

      {/* VUE: Sources */}
      {activeView === 'sources' && (
        <div className="space-y-6">
          <Card className="border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">🔍 Traçabilité des données (Anti-contestation)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-400 mb-4">
                Chaque indicateur affiché est lié à une source de données vérifiable (table/module + règle de calcul).
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                      <th className="px-4 py-2.5 text-left font-bold">Indicateur</th>
                      <th className="px-4 py-2.5 text-left font-bold">Source</th>
                      <th className="px-4 py-2.5 text-left font-bold">Table/Module</th>
                      <th className="px-4 py-2.5 text-left font-bold">Calcul</th>
                      <th className="px-4 py-2.5 text-left font-bold">Fréquence</th>
                      <th className="px-4 py-2.5 text-left font-bold">Dernière sync</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataSources.map((source: any, i: number) => (
                      <tr key={i} className={cn('border-t', darkMode ? 'border-slate-700/50' : 'border-gray-100')}>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-orange-400">{source.indicateur}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{source.source}</td>
                        <td className="px-4 py-3">
                          <code className={cn('px-1.5 py-0.5 rounded text-[10px]', darkMode ? 'bg-slate-700' : 'bg-gray-200')}>
                            {source.table}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          <code className={cn('px-1.5 py-0.5 rounded text-[10px]', darkMode ? 'bg-slate-700' : 'bg-gray-200')}>
                            {source.champs}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={source.frequence === 'Temps réel' ? 'success' : 'info'}>{source.frequence}</Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-[10px]">{source.lastSync}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Side panel KPI/details */}
      <DetailsSidePanel
        isOpen={showSidePanel}
        onClose={() => {
          setShowSidePanel(false);
          setSidePanelData(null);
        }}
        data={sidePanelData}
      />

      {/* Command palette */}
      {cmdOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Commandes rapides"
          onClick={() => setCmdOpen(false)}
        >
          <Card className="w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">⌘K — Commandes rapides</p>
                  <p className="text-xs text-slate-400">Astuce : "/" pour focus la recherche</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => setCmdOpen(false)}>
                  Fermer
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-2">
                <CmdItem label="🏠 Vue d'ensemble" hint="KPIs + graphiques clés" onClick={() => { setActiveView('overview'); setCmdOpen(false); }} />
                <CmdItem label="📊 Tendances" hint="Séries + tableau détaillé" onClick={() => { setActiveView('tendances'); setCmdOpen(false); }} />
                <CmdItem label="💡 Insights" hint="Recommandations + anomalies" onClick={() => { setActiveView('insights'); setCmdOpen(false); }} />
                <CmdItem label="📊 Comparaisons" hint="Multi-bureaux" onClick={() => { setActiveView('comparaisons'); setCmdOpen(false); }} />
                <CmdItem label="🔮 Prédictions" hint="Projections & timeline" onClick={() => { setActiveView('predictions'); setCmdOpen(false); }} />
                <CmdItem label="🚨 Anomalies" hint="Détections + heatmaps" onClick={() => { setActiveView('anomalies'); setCmdOpen(false); }} />
                <CmdItem label="💰 Finance" hint="Résultat net + trésorerie" onClick={() => { setActiveView('finance'); setCmdOpen(false); }} />
                <CmdItem label="👥 Clients" hint="Nouveaux + CA + top clients" onClick={() => { setActiveView('clients'); setCmdOpen(false); }} />
                <CmdItem label="📄 Rapports" hint="Génération PDF" onClick={() => { setActiveView('rapports'); setCmdOpen(false); }} />
                <CmdItem label="🔍 Sources" hint="Traçabilité des indicateurs" onClick={() => { setActiveView('sources'); setCmdOpen(false); }} />
                <CmdItem label="📤 Export CSV" hint="Données filtrées" onClick={() => { exportFilteredCsv(); setCmdOpen(false); }} />
              </div>

              <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400">
                <span>ESC : fermer</span>
                <span>Ctrl/⌘+K : ouvrir</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
