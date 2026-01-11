/**
 * ContentRouter pour Analytics
 * Router le contenu en fonction de la catégorie et sous-catégorie active
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Activity,
  PieChart,
  Target,
  LineChart,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  useAnalyticsDashboard,
  useKpis,
  useAlerts,
  useTrends,
  useBureauxPerformance,
} from '@/lib/api/hooks/useAnalytics';
import { InteractiveChart, ChartGrid, ChartGridItem } from '../charts';
import { useAnalyticsCommandCenterStore } from '@/lib/stores/analyticsCommandCenterStore';

interface ContentRouterProps {
  category: string;
  subCategory: string;
}

export const AnalyticsContentRouter = React.memo(function AnalyticsContentRouter({
  category,
  subCategory,
}: ContentRouterProps) {
  // Dashboard par défaut pour la vue overview
  if (category === 'overview') {
    return <OverviewDashboard />;
  }

  // Performance view
  if (category === 'performance') {
    return <PerformanceView subCategory={subCategory} />;
  }

  // Alerts view
  if (category === 'alerts') {
    return <AlertsView subCategory={subCategory} />;
  }

  // Financial view
  if (category === 'financial') {
    return <FinancialView subCategory={subCategory} />;
  }

  // Trends view
  if (category === 'trends') {
    return <TrendsView subCategory={subCategory} />;
  }

  // Reports view
  if (category === 'reports') {
    return <ReportsView subCategory={subCategory} />;
  }

  // KPIs view
  if (category === 'kpis') {
    return <KPIsView subCategory={subCategory} />;
  }

  // Comparison view
  if (category === 'comparison') {
    return <ComparisonView subCategory={subCategory} />;
  }

  // Bureaux view
  if (category === 'bureaux') {
    return <BureauxView subCategory={subCategory} />;
  }

  // Autres vues (placeholder)
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          {category} - {subCategory}
        </h3>
        <p className="text-slate-500">Contenu en cours de développement</p>
      </div>
    </div>
  );
});

// ================================
// Overview Dashboard
// ================================
const OverviewDashboard = React.memo(function OverviewDashboard() {
  const { openDetailPanel, openModal } = useAnalyticsCommandCenterStore();
  const { data: dashboardData, isLoading, error } = useAnalyticsDashboard();
  const { data: kpisData } = useKpis();
  const { data: alertsData } = useAlerts({ status: ['critical', 'warning'] });
  const { data: trendsData } = useTrends();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-slate-300 mb-2">Erreur de chargement</p>
          <p className="text-sm text-slate-500">{String(error)}</p>
        </div>
      </div>
    );
  }

  const kpis = kpisData?.kpis || [];
  const alerts = alertsData?.alerts || [];
  const trends = trendsData?.trends || [];

  const metrics = [
    {
      id: 'kpis-total',
      label: 'KPIs Actifs',
      value: kpis.length.toString(),
      change: '+2',
      trend: 'up' as const,
      icon: Target,
      color: 'blue',
    },
    {
      id: 'performance',
      label: 'Performance Globale',
      value: dashboardData?.stats?.avgPerformance ? `${dashboardData.stats.avgPerformance}%` : '87%',
      change: '+3%',
      trend: 'up' as const,
      icon: Activity,
      color: 'emerald',
    },
    {
      id: 'alerts',
      label: 'Alertes Actives',
      value: alerts.length.toString(),
      change: alerts.length > 5 ? '+' + (alerts.length - 5) : '-2',
      trend: alerts.length > 5 ? 'up' as const : 'down' as const,
      icon: AlertTriangle,
      color: 'amber',
    },
    {
      id: 'trends',
      label: 'Tendances Suivies',
      value: trends.length.toString(),
      change: '+3',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'purple',
    },
  ];

  const recentReports = [
    {
      id: '1',
      title: 'Rapport Hebdomadaire Performance',
      date: 'Il y a 2 heures',
      status: 'success' as const,
    },
    {
      id: '2',
      title: 'Analyse Budgétaire Q4',
      date: 'Il y a 1 jour',
      status: 'warning' as const,
    },
    {
      id: '3',
      title: 'Comparaison Bureaux - Décembre',
      date: 'Il y a 2 jours',
      status: 'success' as const,
    },
  ];

  // Use real trends data when available
  const displayTrends = trends.slice(0, 3).map((t) => ({
    id: t.id,
    metric: t.metric,
    current: t.current,
    previous: t.previous,
    trend: t.trend,
    unit: t.unit,
  }));

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const isPositive = metric.trend === 'up';
          const colorClasses = {
            blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
            emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
            purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          };

          const handleMetricClick = () => {
            if (metric.id === 'kpis-total') {
              // Naviguer vers la vue KPIs
              // ou ouvrir stats modal
              openModal('stats');
            } else if (metric.id === 'alerts') {
              // Naviguer vers la vue Alertes ou ouvrir directement
              openModal('stats');
            } else if (metric.id === 'performance') {
              openModal('stats');
            } else if (metric.id === 'trends') {
              openModal('stats');
            }
          };

          return (
            <div
              key={metric.id}
              onClick={handleMetricClick}
              className="p-4 rounded-xl border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={cn(
                    'p-2 rounded-lg border',
                    colorClasses[metric.color as keyof typeof colorClasses]
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 text-sm font-medium">
                  {isPositive ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-400" />
                  )}
                  <span
                    className={cn(
                      'text-xs',
                      isPositive ? 'text-emerald-400' : 'text-red-400'
                    )}
                  >
                    {metric.change}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-slate-200">{metric.value}</p>
            </div>
          );
        })}
      </div>

      {/* Two columns layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reports */}
        <div className="p-6 rounded-xl border border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Rapports Récents</h3>
            <PieChart className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div
                key={report.id}
                onClick={() => openModal('report', { reportId: report.id })}
                className="p-3 rounded-lg border border-slate-700/30 bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {report.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{report.date}</p>
                  </div>
                  <Badge
                    variant={report.status === 'success' ? 'default' : 'warning'}
                    className="text-xs"
                  >
                    {report.status === 'success' ? 'Complet' : 'En cours'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trends */}
        <div className="p-6 rounded-xl border border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Tendances</h3>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            {displayTrends.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Aucune tendance disponible</p>
            ) : (
              displayTrends.map((trend) => {
                const isPositive = trend.trend === 'up';
                const diff = Math.abs(trend.current - trend.previous);
                const percentChange = trend.previous > 0
                  ? ((diff / trend.previous) * 100).toFixed(1)
                  : '0';

                const handleTrendClick = () => {
                  // Ouvrir le panneau latéral ou modal pour voir les détails de la tendance
                  openDetailPanel('kpi', trend.id, {
                    name: trend.metric,
                    value: trend.current,
                    unit: trend.unit,
                    trend: trend.trend,
                    previous: trend.previous,
                  });
                };

                return (
                  <div 
                    key={trend.id} 
                    onClick={handleTrendClick}
                    className="space-y-2 cursor-pointer hover:bg-slate-800/30 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-400">{trend.metric}</p>
                      <div className="flex items-center gap-2">
                        {isPositive ? (
                          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                        )}
                        <span className="text-sm font-medium text-emerald-400">
                          {percentChange}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-slate-200">
                        {trend.current}
                        {trend.unit && (
                          <span className="text-sm text-slate-500 ml-1">{trend.unit}</span>
                        )}
                      </span>
                      <span className="text-sm text-slate-500">
                        vs {trend.previous}
                        {trend.unit}
                      </span>
                    </div>
                    <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                        style={{
                          width: `${(trend.current / (trend.current + trend.previous)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Nouveau Rapport', icon: PieChart, color: 'purple' },
          { label: 'Exporter Données', icon: LineChart, color: 'blue' },
          { label: 'Comparer Bureaux', icon: Users, color: 'emerald' },
          { label: 'Voir Alertes', icon: AlertTriangle, color: 'amber' },
        ].map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              className="p-4 rounded-lg border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/50 transition-all text-left group"
            >
              <Icon className={cn('w-5 h-5 mb-2', `text-${action.color}-400`)} />
              <p className="text-sm font-medium text-slate-300 group-hover:text-slate-200">
                {action.label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
});

// ================================
// Performance View
// ================================
const PerformanceView = React.memo(function PerformanceView({ subCategory }: { subCategory: string }) {
  const { openDetailPanel, openModal } = useAnalyticsCommandCenterStore();
  const { data: kpisData, isLoading, error } = useKpis();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-slate-300">Erreur de chargement des KPIs</p>
        </div>
      </div>
    );
  }

  const allKpis = kpisData?.kpis || [];

  // Filter KPIs based on subcategory
  const filteredKPIs =
    subCategory === 'all'
      ? allKpis
      : subCategory === 'critical'
      ? allKpis.filter((k) => k.status === 'critical')
      : subCategory === 'warning'
      ? allKpis.filter((k) => k.status === 'warning')
      : allKpis.filter((k) => k.status === 'success');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-200">KPIs Performance</h2>
          <p className="text-sm text-slate-400 mt-1">
            {filteredKPIs.length} indicateur{filteredKPIs.length > 1 ? 's' : ''}
          </p>
        </div>
        <Badge variant="default" className="text-xs">
          {subCategory === 'all' ? 'Tous' : subCategory}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredKPIs.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500">
            Aucun KPI trouvé pour ce filtre
          </div>
        ) : (
          filteredKPIs.map((kpi) => {
            const value = typeof kpi.value === 'number' ? kpi.value : parseFloat(String(kpi.value));
            const target = typeof kpi.target === 'number' ? kpi.target : parseFloat(String(kpi.target || value));
            const percentage = target > 0 ? (value / target) * 100 : 100;
            const isAboveTarget = value >= target;

            const handleKPIClick = () => {
              // Ouvrir le panneau latéral pour vue rapide
              openDetailPanel('kpi', kpi.id, {
                name: kpi.name,
                value: kpi.value,
                unit: kpi.unit,
                target: kpi.target,
                status: kpi.status,
                category: kpi.category,
              });
              
              // Ou ouvrir directement la modal complète:
              // openModal('kpi-detail', { kpiId: kpi.id });
            };

            return (
              <div
                key={kpi.id}
                onClick={handleKPIClick}
                className="p-5 rounded-xl border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/50 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-medium text-slate-300">{kpi.name}</p>
                  <Badge
                    variant={kpi.status === 'success' ? 'default' : 'warning'}
                    className="text-xs"
                  >
                    {kpi.status === 'success'
                      ? 'OK'
                      : kpi.status === 'warning'
                      ? 'Attention'
                      : 'Critique'}
                  </Badge>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-bold text-slate-200">{kpi.value}</span>
                  {kpi.unit && <span className="text-sm text-slate-500">{kpi.unit}</span>}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Objectif: {target}
                      {kpi.unit}
                    </span>
                    <span>{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'absolute inset-y-0 left-0 rounded-full transition-all',
                        isAboveTarget
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500'
                      )}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Charts Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-200">Visualisations</h3>
        <ChartGrid
          columns={2}
          charts={[
            {
              id: 'perf-trend',
              title: 'Évolution des performances',
              span: 2,
              chartProps: {
                data: filteredKPIs.slice(0, 7).map((kpi, idx) => ({
                  name: `J-${6 - idx}`,
                  value: kpi.current - Math.random() * 10,
                  target: kpi.target,
                })),
                type: 'area',
                dataKeys: ['value', 'target'],
                colors: ['#3b82f6', '#f59e0b'],
                showTrend: true,
                enableExport: true,
              },
            },
            {
              id: 'status-distribution',
              title: 'Distribution par statut',
              chartProps: {
                data: [
                  {
                    name: 'Critique',
                    value: allKpis.filter((k) => k.status === 'critical').length,
                  },
                  {
                    name: 'Attention',
                    value: allKpis.filter((k) => k.status === 'warning').length,
                  },
                  {
                    name: 'OK',
                    value: allKpis.filter((k) => k.status === 'success').length,
                  },
                ],
                type: 'pie',
                colors: ['#ef4444', '#f59e0b', '#10b981'],
                showLegend: true,
              },
            },
            {
              id: 'category-performance',
              title: 'Performance par catégorie',
              chartProps: {
                data: [
                  { name: 'Opérationnel', value: 85 },
                  { name: 'Financier', value: 92 },
                  { name: 'Qualité', value: 78 },
                  { name: 'Conformité', value: 88 },
                ],
                type: 'bar',
                colors: ['#3b82f6'],
                showGrid: true,
              },
            },
          ]}
        />
      </div>
    </div>
  );
});

// ================================
// Alerts View
// ================================
const AlertsView = React.memo(function AlertsView({ subCategory }: { subCategory: string }) {
  const { openDetailPanel, openModal } = useAnalyticsCommandCenterStore();
  const { data: alertsData, isLoading, error } = useAlerts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-slate-300">Erreur de chargement des alertes</p>
        </div>
      </div>
    );
  }

  const alerts = alertsData?.alerts || [];
  const filteredAlerts =
    subCategory === 'all'
      ? alerts
      : subCategory === 'critical'
      ? alerts.filter((a) => a.severity === 'critical')
      : subCategory === 'warning'
      ? alerts.filter((a) => a.severity === 'warning')
      : alerts.filter((a) => a.severity === 'info');

  const handleAlertClick = (alert: any) => {
    openDetailPanel('alert', alert.id, {
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      category: alert.category,
      status: alert.status,
      createdAt: alert.createdAt,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Aucune alerte disponible</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => handleAlertClick(alert)}
              className="p-5 rounded-xl border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/50 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={cn(
                      'p-2 rounded-lg',
                      alert.severity === 'critical'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : alert.severity === 'warning'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    )}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold text-slate-200 mb-1">{alert.title}</h4>
                    {alert.message && (
                      <p className="text-sm text-slate-400 line-clamp-2">{alert.message}</p>
                    )}
                  </div>
                </div>
                <Badge
                  variant={
                    alert.severity === 'critical'
                      ? 'destructive'
                      : alert.severity === 'warning'
                      ? 'warning'
                      : 'default'
                  }
                >
                  {alert.severity}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                {alert.category && <span>Catégorie: {alert.category}</span>}
                {alert.createdAt && <span>{alert.createdAt}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

// ================================
// Financial View
// ================================
const FinancialView = React.memo(function FinancialView({ subCategory }: { subCategory: string }) {
  const { openDetailPanel, openModal } = useAnalyticsCommandCenterStore();
  const { data: dashboardData, isLoading } = useAnalyticsDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  const financialMetrics = [
    {
      id: 'budget',
      label: 'Budget Total',
      value: '€2.4M',
      change: '+5.2%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'emerald',
    },
    {
      id: 'spent',
      label: 'Dépensé',
      value: '€1.8M',
      change: '+2.1%',
      trend: 'up' as const,
      icon: Activity,
      color: 'amber',
    },
    {
      id: 'remaining',
      label: 'Restant',
      value: '€600K',
      change: '-3.4%',
      trend: 'down' as const,
      icon: TrendingUp,
      color: 'blue',
    },
    {
      id: 'forecast',
      label: 'Prévision',
      value: '€2.1M',
      change: '+1.8%',
      trend: 'up' as const,
      icon: BarChart3,
      color: 'purple',
    },
  ];

  const handleMetricClick = (metric: any) => {
    openDetailPanel('kpi', metric.id, {
      name: metric.label,
      value: metric.value,
      trend: metric.trend,
      change: metric.change,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {financialMetrics.map((metric) => {
          const Icon = metric.icon;
          const isPositive = metric.trend === 'up';
          const colorClasses = {
            blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
            emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
            purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          };

          return (
            <div
              key={metric.id}
              onClick={() => handleMetricClick(metric)}
              className="p-4 rounded-xl border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={cn(
                    'p-2 rounded-lg border',
                    colorClasses[metric.color as keyof typeof colorClasses]
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 text-sm font-medium">
                  {isPositive ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-400" />
                  )}
                  <span
                    className={cn(
                      'text-xs',
                      isPositive ? 'text-emerald-400' : 'text-red-400'
                    )}
                  >
                    {metric.change}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-slate-200">{metric.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ================================
// Trends View
// ================================
const TrendsView = React.memo(function TrendsView({ subCategory }: { subCategory: string }) {
  const { openDetailPanel } = useAnalyticsCommandCenterStore();
  const { data: trendsData, isLoading } = useTrends();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  const trends = trendsData?.trends || [];

  const handleTrendClick = (trend: any) => {
    openDetailPanel('kpi', trend.id, {
      name: trend.metric,
      value: trend.current,
      unit: trend.unit,
      trend: trend.trend,
      previous: trend.previous,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {trends.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Aucune tendance disponible</p>
          </div>
        ) : (
          trends.map((trend) => {
            const isPositive = trend.trend === 'up';
            const diff = Math.abs(trend.current - trend.previous);
            const percentChange = trend.previous > 0
              ? ((diff / trend.previous) * 100).toFixed(1)
              : '0';

            return (
              <div
                key={trend.id}
                onClick={() => handleTrendClick(trend)}
                className="p-5 rounded-xl border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-base font-semibold text-slate-200">{trend.metric}</p>
                  <div className="flex items-center gap-2">
                    {isPositive ? (
                      <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-400" />
                    )}
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isPositive ? 'text-emerald-400' : 'text-red-400'
                      )}
                    >
                      {percentChange}%
                    </span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-200">
                    {trend.current}
                    {trend.unit && <span className="text-sm text-slate-500 ml-1">{trend.unit}</span>}
                  </span>
                  <span className="text-sm text-slate-500">
                    vs {trend.previous}
                    {trend.unit}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});

// ================================
// Reports View
// ================================
const ReportsView = React.memo(function ReportsView({ subCategory }: { subCategory: string }) {
  const { openModal } = useAnalyticsCommandCenterStore();

  const reports = [
    {
      id: '1',
      title: 'Rapport Hebdomadaire Performance',
      date: 'Il y a 2 heures',
      status: 'success' as const,
      category: 'performance',
    },
    {
      id: '2',
      title: 'Analyse Budgétaire Q4',
      date: 'Il y a 1 jour',
      status: 'warning' as const,
      category: 'financial',
    },
    {
      id: '3',
      title: 'Comparaison Bureaux - Décembre',
      date: 'Il y a 2 jours',
      status: 'success' as const,
      category: 'comparison',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {reports.map((report) => (
          <div
            key={report.id}
            onClick={() => openModal('report', { reportId: report.id })}
            className="p-5 rounded-xl border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/50 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-slate-200 mb-1">{report.title}</h4>
                <p className="text-sm text-slate-500">{report.date}</p>
                {report.category && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    {report.category}
                  </Badge>
                )}
              </div>
              <Badge
                variant={report.status === 'success' ? 'default' : 'warning'}
                className="text-xs"
              >
                {report.status === 'success' ? 'Complet' : 'En cours'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// ================================
// KPIs View
// ================================
const KPIsView = React.memo(function KPIsView({ subCategory }: { subCategory: string }) {
  const { openDetailPanel } = useAnalyticsCommandCenterStore();
  const { data: kpisData, isLoading } = useKpis();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  const kpis = kpisData?.kpis || [];

  const handleKPIClick = (kpi: any) => {
    openDetailPanel('kpi', kpi.id, {
      name: kpi.name || kpi.label,
      value: kpi.value,
      unit: kpi.unit,
      target: kpi.target,
      status: kpi.status,
      category: kpi.category,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const value = typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value;

          return (
            <div
              key={kpi.id}
              onClick={() => handleKPIClick(kpi)}
              className="p-5 rounded-xl border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/50 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-medium text-slate-300">{kpi.name || kpi.label}</p>
                <Badge
                  variant={kpi.status === 'success' ? 'default' : 'warning'}
                  className="text-xs"
                >
                  {kpi.status === 'success'
                    ? 'OK'
                    : kpi.status === 'warning'
                    ? 'Attention'
                    : 'Critique'}
                </Badge>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-3xl font-bold text-slate-200">{value}</span>
                {kpi.unit && <span className="text-sm text-slate-500">{kpi.unit}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ================================
// Comparison View
// ================================
const ComparisonView = React.memo(function ComparisonView({ subCategory }: { subCategory: string }) {
  const { openModal } = useAnalyticsCommandCenterStore();

  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">Comparaisons</h3>
        <p className="text-slate-500 mb-4">Fonctionnalité de comparaison en développement</p>
        <button
          onClick={() => openModal('comparison')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Ouvrir la comparaison
        </button>
      </div>
    </div>
  );
});

// ================================
// Bureaux View
// ================================
const BureauxView = React.memo(function BureauxView({ subCategory }: { subCategory: string }) {
  const { openDetailPanel } = useAnalyticsCommandCenterStore();
  const { data: bureauxData, isLoading } = useBureauxPerformance();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  const bureaux = bureauxData?.bureaux || [];

  const handleBureauClick = (bureau: any) => {
    openDetailPanel('kpi', bureau.id, {
      name: bureau.name,
      performance: bureau.performance,
      kpis: bureau.kpis,
      alerts: bureau.alerts,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bureaux.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Aucun bureau disponible</p>
          </div>
        ) : (
          bureaux.map((bureau) => (
            <div
              key={bureau.id}
              onClick={() => handleBureauClick(bureau)}
              className="p-5 rounded-xl border border-slate-700/50 bg-slate-900/50 hover:bg-slate-800/50 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-base font-semibold text-slate-200">{bureau.name}</h4>
                <Badge variant="default" className="text-xs">
                  {bureau.performance}%
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">KPIs</span>
                  <span className="text-slate-300 font-medium">{bureau.kpis || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Alertes</span>
                  <span className="text-slate-300 font-medium">{bureau.alerts || 0}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

