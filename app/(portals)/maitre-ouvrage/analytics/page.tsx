'use client';

import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Legend,
  CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { usePageNavigation, useCrossPageLinks } from '@/hooks/usePageNavigation';
import { useAutoSyncCounts } from '@/hooks/useAutoSync';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
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
} from '@/components/features/bmo/analytics';
import {
  performanceData,
  bureauPieData,
  bureaux,
  projects,
} from '@/lib/data';

type ReportType = 'mensuel-dg' | 'bureau' | 'projet';
type ViewType = 'overview' | 'tendances' | 'rapports' | 'sources' | 'comparaisons' | 'predictions' | 'anomalies' | 'insights';

export default function AnalyticsPage() {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [selectedBureau, setSelectedBureau] = useState<string>('ALL');
  const [selectedProject, setSelectedProject] = useState<string>('ALL');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [selectedBureaux, setSelectedBureaux] = useState<string[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState<any>({});
  const [sidePanelData, setSidePanelData] = useState<any>(null);
  const [showSidePanel, setShowSidePanel] = useState(false);

  // Données enrichies pour les graphiques
  const enrichedData = useMemo(() => {
    let data = performanceData.map((d) => ({
      ...d,
      tauxValidation: Math.round((d.validations / d.demandes) * 100),
      tauxRejet: Math.round((d.rejets / d.demandes) * 100),
    }));

    // Appliquer les filtres avancés
    if (advancedFilters.bureaux && advancedFilters.bureaux.length > 0) {
      data = data.filter((d: any) => advancedFilters.bureaux.includes(d.bureau));
    }

    return data;
  }, [performanceData, advancedFilters]);

  // Totaux annuels
  const yearlyTotals = useMemo(() => {
    return enrichedData.reduce(
      (acc, month) => ({
        demandes: acc.demandes + month.demandes,
        validations: acc.validations + month.validations,
        rejets: acc.rejets + month.rejets,
        budget: acc.budget + month.budget,
      }),
      { demandes: 0, validations: 0, rejets: 0, budget: 0 }
    );
  }, [enrichedData]);

  // Moyenne mensuelle
  const monthlyAverages = useMemo(() => {
    const count = enrichedData.length || 1;
    return {
      demandes: Math.round(yearlyTotals.demandes / count),
      validations: Math.round(yearlyTotals.validations / count),
      rejets: Math.round(yearlyTotals.rejets / count),
      budget: (yearlyTotals.budget / count).toFixed(1),
    };
  }, [yearlyTotals, enrichedData]);

  // Sources des données (traçabilité)
  const dataSources = [
    {
      indicateur: 'Demandes',
      source: 'Module Demandes (demands)',
      table: 'demands',
      champs: 'id, status, date, bureau',
      frequence: 'Temps réel',
      lastSync: new Date().toLocaleString('fr-FR'),
    },
    {
      indicateur: 'Validations',
      source: 'Module Validation BC/Factures',
      table: 'bcToValidate, facturesToValidate',
      champs: 'status === "validated"',
      frequence: 'Temps réel',
      lastSync: new Date().toLocaleString('fr-FR'),
    },
    {
      indicateur: 'Rejets',
      source: 'Module Validation BC/Factures',
      table: 'bcToValidate, facturesToValidate',
      champs: 'status === "rejected"',
      frequence: 'Temps réel',
      lastSync: new Date().toLocaleString('fr-FR'),
    },
    {
      indicateur: 'Budget traité',
      source: 'Module Paiements N+1',
      table: 'paymentsN1',
      champs: 'SUM(amount) WHERE status = "validated"',
      frequence: 'Quotidien',
      lastSync: new Date().toLocaleString('fr-FR'),
    },
    {
      indicateur: 'Dossiers bloqués',
      source: 'Module Blocages',
      table: 'blockedDossiers',
      champs: 'delay >= 5',
      frequence: 'Temps réel',
      lastSync: new Date().toLocaleString('fr-FR'),
    },
    {
      indicateur: 'Charge bureaux',
      source: 'Calcul agrégé',
      table: 'demands, tasks, projects',
      champs: 'COUNT(*) GROUP BY bureau',
      frequence: 'Horaire',
      lastSync: new Date().toLocaleString('fr-FR'),
    },
  ];

  // Générer un rapport
  const generateReport = async (type: ReportType) => {
    setGeneratingReport(true);
    addToast(`Génération du rapport ${type} en cours...`, 'info');

    await new Promise((resolve) => setTimeout(resolve, 2000));

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
        'Source': kpiData.source || 'Calcul automatique',
      },
    });
    setShowSidePanel(true);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header amélioré */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <span className="text-3xl">📈</span>
            Analytics & Pilotage Avancé
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Tableaux de bord intelligents, prédictions, comparaisons et rapports automatisés
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AdvancedFilters
            filters={advancedFilters}
            onFiltersChange={setAdvancedFilters}
          />
          <AdvancedExport
            data={enrichedData}
            type="analytics"
            fileName="rapport-analytics"
          />
        </div>
      </div>

      {/* Navigation améliorée avec onglet Overview */}
      <div className="flex gap-2 border-b border-slate-700/50 pb-2 overflow-x-auto">
        <Button
          size="sm"
          variant={activeView === 'overview' ? 'default' : 'ghost'}
          onClick={() => setActiveView('overview')}
          className="whitespace-nowrap"
        >
          🏠 Vue d'ensemble
        </Button>
        <Button
          size="sm"
          variant={activeView === 'tendances' ? 'default' : 'ghost'}
          onClick={() => setActiveView('tendances')}
        >
          📊 Tendances
        </Button>
        <Button
          size="sm"
          variant={activeView === 'insights' ? 'default' : 'ghost'}
          onClick={() => setActiveView('insights')}
        >
          💡 Insights
        </Button>
        <Button
          size="sm"
          variant={activeView === 'comparaisons' ? 'default' : 'ghost'}
          onClick={() => setActiveView('comparaisons')}
        >
          📊 Comparaisons
        </Button>
        <Button
          size="sm"
          variant={activeView === 'predictions' ? 'default' : 'ghost'}
          onClick={() => setActiveView('predictions')}
        >
          🔮 Prédictions
        </Button>
        <Button
          size="sm"
          variant={activeView === 'anomalies' ? 'default' : 'ghost'}
          onClick={() => setActiveView('anomalies')}
        >
          🚨 Anomalies
        </Button>
        <Button
          size="sm"
          variant={activeView === 'rapports' ? 'default' : 'ghost'}
          onClick={() => setActiveView('rapports')}
        >
          📄 Rapports
        </Button>
        <Button
          size="sm"
          variant={activeView === 'sources' ? 'default' : 'ghost'}
          onClick={() => setActiveView('sources')}
        >
          🔍 Sources
        </Button>
      </div>

      {/* Vue d'ensemble (nouvelle vue principale) */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* KPIs Dashboard */}
          <AnalyticsDashboard
            yearlyTotals={yearlyTotals}
            monthlyAverages={monthlyAverages}
            previousPeriod={performanceData.slice(0, 6).reduce(
              (acc, month) => ({
                demandes: acc.demandes + month.demandes,
                validations: acc.validations + month.validations,
                rejets: acc.rejets + month.rejets,
                budget: acc.budget + month.budget,
              }),
              { demandes: 0, validations: 0, rejets: 0, budget: 0 }
            )}
          />

          {/* Graphique principal: Demandes vs Validations vs Rejets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                📊 Évolution mensuelle : Demandes, Validations, Rejets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={enrichedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 100]}
                    />
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
                      onClick={(data: any) => handleKpiClick({
                        title: `Demandes - ${data.month}`,
                        details: { demandes: data.demandes },
                        trend: 'up',
                      })}
                      style={{ cursor: 'pointer' }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="validations"
                      fill="#10B981"
                      name="Validations"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="rejets"
                      fill="#EF4444"
                      name="Rejets"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="tauxValidation"
                      stroke="#F97316"
                      strokeWidth={2}
                      name="Taux validation %"
                      dot={{ fill: '#F97316' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Graphique Budget */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                💰 Évolution du budget traité (Milliards FCFA)
              </CardTitle>
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
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="budget"
                      stroke="#D4AF37"
                      strokeWidth={2}
                      fill="url(#colorBudget)"
                      name="Budget (Mds)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Insights intelligents */}
          <IntelligentInsights
            yearlyTotals={yearlyTotals}
            enrichedData={enrichedData}
            monthlyAverages={monthlyAverages}
          />

          {/* Score de performance */}
          <PerformanceScore
            yearlyTotals={yearlyTotals}
            enrichedData={enrichedData}
          />

          {/* Timeline prédictive */}
          <PredictiveTimeline
            enrichedData={enrichedData}
            monthsAhead={3}
          />

          {/* Rapport narratif */}
          <NarrativeReport
            yearlyTotals={yearlyTotals}
            enrichedData={enrichedData}
            monthlyAverages={monthlyAverages}
          />
        </div>
      )}

      {/* Vue: Insights intelligents */}
      {activeView === 'insights' && (
        <div className="space-y-6">
          <IntelligentInsights
            yearlyTotals={yearlyTotals}
            enrichedData={enrichedData}
            monthlyAverages={monthlyAverages}
          />
          <AnomalyDetection
            performanceData={performanceData}
            enrichedData={enrichedData}
          />
        </div>
      )}

      {/* Vue: Tendances */}
      {activeView === 'tendances' && (
        <div className="space-y-6">
          {/* Graphique principal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                📊 Évolution mensuelle : Demandes, Validations, Rejets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={enrichedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 100]}
                    />
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
                      onClick={(data) => handleKpiClick({
                        title: `Demandes - ${data.month}`,
                        details: { demandes: data.demandes },
                        trend: 'up',
                      })}
                      style={{ cursor: 'pointer' }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="validations"
                      fill="#10B981"
                      name="Validations"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="rejets"
                      fill="#EF4444"
                      name="Rejets"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="tauxValidation"
                      stroke="#F97316"
                      strokeWidth={2}
                      name="Taux validation %"
                      dot={{ fill: '#F97316' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Graphique Budget */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                💰 Évolution du budget traité (Milliards FCFA)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={enrichedData}>
                    <defs>
                      <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="budget"
                      stroke="#D4AF37"
                      strokeWidth={2}
                      fill="url(#colorBudget)"
                      name="Budget (Mds)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tableau récapitulatif */}
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
                    {enrichedData.map((row, i) => (
                      <tr
                        key={i}
                        className={cn(
                          'border-t transition-colors hover:bg-slate-700/30 cursor-pointer',
                          darkMode ? 'border-slate-700/50' : 'border-gray-100'
                        )}
                        onClick={() => handleKpiClick({
                          title: `Données du mois - ${row.month}`,
                          details: row,
                        })}
                      >
                        <td className="px-4 py-2 font-medium">{row.month}</td>
                        <td className="px-4 py-2 text-right text-blue-400">{row.demandes}</td>
                        <td className="px-4 py-2 text-right text-emerald-400">{row.validations}</td>
                        <td className="px-4 py-2 text-right text-red-400">{row.rejets}</td>
                        <td className="px-4 py-2 text-right text-orange-400">{row.tauxValidation}%</td>
                        <td className="px-4 py-2 text-right text-amber-400">{row.budget}</td>
                      </tr>
                    ))}
                    {/* Ligne totaux */}
                    <tr className={cn('border-t-2 font-bold', darkMode ? 'border-amber-500/50 bg-amber-500/10' : 'border-amber-300 bg-amber-50')}>
                      <td className="px-4 py-2">TOTAL</td>
                      <td className="px-4 py-2 text-right text-blue-400">{yearlyTotals.demandes}</td>
                      <td className="px-4 py-2 text-right text-emerald-400">{yearlyTotals.validations}</td>
                      <td className="px-4 py-2 text-right text-red-400">{yearlyTotals.rejets}</td>
                      <td className="px-4 py-2 text-right text-orange-400">
                        {((yearlyTotals.validations / yearlyTotals.demandes) * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-2 text-right text-amber-400">{yearlyTotals.budget.toFixed(1)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Vue: Comparaisons */}
      {activeView === 'comparaisons' && (
        <div className="space-y-6">
          <MultiBureauComparator
            bureaux={bureaux}
            performanceData={performanceData}
            enrichedData={enrichedData}
          />
          <ComparisonChart
            bureaux={bureaux}
            performanceData={enrichedData}
            selectedBureaux={selectedBureaux}
          />
        </div>
      )}

      {/* Vue: Prédictions */}
      {activeView === 'predictions' && (
        <div className="space-y-6">
          <PredictionInsights performanceData={enrichedData} />
          <PredictiveTimeline enrichedData={enrichedData} monthsAhead={3} />
          <div className="grid md:grid-cols-2 gap-4">
            <PerformanceHeatmap
              performanceData={performanceData}
              bureaux={bureaux}
              metric="demandes"
            />
            <PerformanceHeatmap
              performanceData={performanceData}
              bureaux={bureaux}
              metric="taux"
            />
          </div>
        </div>
      )}

      {/* Vue: Anomalies */}
      {activeView === 'anomalies' && (
        <div className="space-y-6">
          <AnomalyDetection
            performanceData={performanceData}
            enrichedData={enrichedData}
          />
          <div className="grid md:grid-cols-2 gap-4">
            <PerformanceHeatmap
              performanceData={performanceData}
              bureaux={bureaux}
              metric="rejets"
            />
            <PerformanceHeatmap
              performanceData={performanceData}
              bureaux={bureaux}
              metric="validations"
            />
          </div>
        </div>
      )}

      {/* Vue: Génération rapports */}
      {activeView === 'rapports' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Rapport mensuel DG */}
            <Card className="border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  👔 Rapport mensuel DG
                </CardTitle>
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
                <Button
                  className="w-full"
                  onClick={() => generateReport('mensuel-dg')}
                  disabled={generatingReport}
                >
                  {generatingReport ? '⏳ Génération...' : '📄 Générer'}
                </Button>
              </CardContent>
            </Card>

            {/* Rapport par bureau */}
            <Card className="border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  🏢 Rapport par bureau
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-400">
                  Performance détaillée d'un bureau avec comparatifs.
                </p>
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
                <Button
                  className="w-full"
                  variant="info"
                  onClick={() => generateReport('bureau')}
                  disabled={generatingReport}
                >
                  {generatingReport ? '⏳ Génération...' : '📄 Générer'}
                </Button>
              </CardContent>
            </Card>

            {/* Rapport par projet */}
            <Card className="border-emerald-500/30">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  🏗️ Rapport par projet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-400">
                  Suivi budgétaire et avancement d'un projet spécifique.
                </p>
                <select
                  className={cn(
                    'w-full p-2 rounded text-xs',
                    darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-300'
                  )}
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                >
                  <option value="ALL">Tous les projets</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} - {p.name}
                    </option>
                  ))}
                </select>
                <Button
                  className="w-full"
                  variant="success"
                  onClick={() => generateReport('projet')}
                  disabled={generatingReport}
                >
                  {generatingReport ? '⏳ Génération...' : '📄 Générer'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Rapport narratif */}
          <NarrativeReport
            yearlyTotals={yearlyTotals}
            enrichedData={enrichedData}
            monthlyAverages={monthlyAverages}
          />
        </div>
      )}

      {/* Vue: Sources des chiffres */}
      {activeView === 'sources' && (
        <div className="space-y-6">
          <Card className="border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                🔍 Traçabilité des données (Anti-contestation)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-400 mb-4">
                Chaque indicateur affiché dans le tableau de bord est lié à une source de données
                vérifiable. Cette transparence permet de répondre à toute contestation.
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
                    {dataSources.map((source, i) => (
                      <tr
                        key={i}
                        className={cn('border-t', darkMode ? 'border-slate-700/50' : 'border-gray-100')}
                      >
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
                          <Badge variant={source.frequence === 'Temps réel' ? 'success' : 'info'}>
                            {source.frequence}
                          </Badge>
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

      {/* Panneau latéral de détails */}
      <DetailsSidePanel
        isOpen={showSidePanel}
        onClose={() => {
          setShowSidePanel(false);
          setSidePanelData(null);
        }}
        data={sidePanelData}
      />
    </div>
  );
}
