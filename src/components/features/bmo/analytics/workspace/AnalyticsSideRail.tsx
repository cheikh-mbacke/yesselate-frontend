/**
 * AnalyticsSideRail.tsx
 * ======================
 * 
 * Rail latéral prédictif pour Analytics
 * Affiche les anomalies, KPIs en dérive, et alertes prioritaires
 * Permet d'ouvrir les vues correspondantes en 1 clic
 */

'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingDown, TrendingUp, AlertTriangle, Target, 
  Clock, DollarSign, Users, Activity, ChevronRight,
  RefreshCw, Zap, ExternalLink, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalyticsTab } from '@/lib/stores/analyticsWorkspaceStore';
import { calculateKPIs, calculateBureauPerformance, detectAlerts } from '@/lib/data/analytics';

interface Props {
  onOpenView: (tab: AnalyticsTab) => void;
}

interface Anomaly {
  id: string;
  type: 'kpi_drift' | 'bureau_underperform' | 'budget_alert' | 'sla_risk';
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  value: number | string;
  change?: number;
  metric: string;
  action: AnalyticsTab;
}

interface PredictiveInsight {
  id: string;
  type: 'prediction' | 'recommendation' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
}

export function AnalyticsSideRail({ onOpenView }: Props) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [expandedSection, setExpandedSection] = useState<'anomalies' | 'predictions' | 'quick'>('anomalies');

  // Calculer les anomalies en temps réel
  const anomalies = useMemo<Anomaly[]>(() => {
    const kpis = calculateKPIs();
    const bureaux = calculateBureauPerformance();
    const alerts = detectAlerts();
    const result: Anomaly[] = [];

    // KPIs en dérive (tendance négative ou critique)
    kpis.filter(k => k.status === 'critical' || (k.trend === 'down' && k.trendValue < -5)).forEach(kpi => {
      result.push({
        id: `kpi-${kpi.id}`,
        type: 'kpi_drift',
        title: kpi.name,
        description: `${kpi.trend === 'down' ? 'En baisse' : 'Critique'}: ${kpi.value}${kpi.unit}`,
        severity: kpi.status === 'critical' ? 'critical' : 'warning',
        value: kpi.value,
        change: kpi.trendValue,
        metric: kpi.category,
        action: {
          id: 'inbox:performance',
          type: 'inbox',
          title: 'Performance',
          icon: '⚡',
          data: { queue: 'performance', focusKPI: kpi.id },
        },
      });
    });

    // Bureaux sous-performants
    bureaux.filter(b => b.score < 65).forEach(bureau => {
      result.push({
        id: `bureau-${bureau.bureauCode}`,
        type: 'bureau_underperform',
        title: bureau.bureauName,
        description: `Score: ${bureau.score}/100 • ${bureau.overdue} en retard`,
        severity: bureau.score < 50 ? 'critical' : 'warning',
        value: bureau.score,
        metric: 'Performance bureau',
        action: {
          id: 'inbox:trends',
          type: 'inbox',
          title: 'Tendances',
          icon: '📈',
          data: { queue: 'trends', focusBureau: bureau.bureauCode },
        },
      });
    });

    // Alertes critiques
    alerts.filter(a => a.type === 'critical').slice(0, 3).forEach(alert => {
      result.push({
        id: `alert-${alert.id}`,
        type: 'sla_risk',
        title: alert.title,
        description: alert.description,
        severity: 'critical',
        value: alert.value,
        metric: alert.metric,
        action: {
          id: 'inbox:alerts',
          type: 'inbox',
          title: 'Alertes',
          icon: '🚨',
          data: { queue: 'alerts' },
        },
      });
    });

    return result.slice(0, 8); // Limiter à 8 anomalies
  }, []);

  // Insights prédictifs (simulés)
  const predictions = useMemo<PredictiveInsight[]>(() => [
    {
      id: 'pred-1',
      type: 'prediction',
      title: 'Risque de dépassement SLA',
      description: '12 demandes risquent de dépasser le SLA dans les 48h',
      confidence: 87,
      impact: 'high',
      timeframe: '48h',
    },
    {
      id: 'pred-2',
      type: 'recommendation',
      title: 'Optimisation suggérée',
      description: 'Redistribuer 5 demandes du BTP vers le BJ pour équilibrer la charge',
      confidence: 72,
      impact: 'medium',
      timeframe: 'Cette semaine',
    },
    {
      id: 'pred-3',
      type: 'opportunity',
      title: 'Tendance positive',
      description: 'Le taux de validation devrait atteindre 85% ce mois si la tendance continue',
      confidence: 68,
      impact: 'medium',
      timeframe: 'Fin du mois',
    },
  ], []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simuler un refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  const criticalCount = anomalies.filter(a => a.severity === 'critical').length;
  const warningCount = anomalies.filter(a => a.severity === 'warning').length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10">
              <Zap className="w-4 h-4 text-purple-500" />
            </div>
            <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200">
              Intelligence BMO
            </h3>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={cn(
              'w-4 h-4 text-slate-500',
              isRefreshing && 'animate-spin'
            )} />
          </button>
        </div>

        {/* Stats rapides */}
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <Badge variant="urgent" className="text-[10px]">
              {criticalCount} critique{criticalCount > 1 ? 's' : ''}
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge variant="warning" className="text-[10px]">
              {warningCount} warning{warningCount > 1 ? 's' : ''}
            </Badge>
          )}
          <span className="text-[10px] text-slate-500 ml-auto">
            MàJ: {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Section Anomalies */}
        <div className="border-b border-slate-200/70 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'anomalies' ? 'quick' : 'anomalies')}
            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">Anomalies détectées</span>
              <Badge variant="default" className="text-[10px]">{anomalies.length}</Badge>
            </div>
            <ChevronRight className={cn(
              'w-4 h-4 text-slate-400 transition-transform',
              expandedSection === 'anomalies' && 'rotate-90'
            )} />
          </button>

          {expandedSection === 'anomalies' && (
            <div className="px-3 pb-3 space-y-2">
              {anomalies.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  Aucune anomalie détectée 🎉
                </p>
              ) : (
                anomalies.map((anomaly) => (
                  <button
                    key={anomaly.id}
                    type="button"
                    onClick={() => onOpenView(anomaly.action)}
                    className={cn(
                      'w-full p-3 rounded-xl border text-left transition-all hover:scale-[1.02]',
                      anomaly.severity === 'critical'
                        ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20'
                        : anomaly.severity === 'warning'
                        ? 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20'
                        : 'border-slate-200 dark:border-slate-700'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs font-medium truncate flex-1">
                        {anomaly.title}
                      </span>
                      {anomaly.change !== undefined && (
                        <span className={cn(
                          'text-[10px] font-semibold flex items-center gap-0.5',
                          anomaly.change > 0 ? 'text-emerald-600' : 'text-red-600'
                        )}>
                          {anomaly.change > 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {Math.abs(anomaly.change)}%
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-2">
                      {anomaly.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge 
                        variant={anomaly.severity === 'critical' ? 'urgent' : 'warning'}
                        className="text-[8px]"
                      >
                        {anomaly.metric}
                      </Badge>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Section Prédictions */}
        <div className="border-b border-slate-200/70 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'predictions' ? 'quick' : 'predictions')}
            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Insights prédictifs</span>
            </div>
            <ChevronRight className={cn(
              'w-4 h-4 text-slate-400 transition-transform',
              expandedSection === 'predictions' && 'rotate-90'
            )} />
          </button>

          {expandedSection === 'predictions' && (
            <div className="px-3 pb-3 space-y-2">
              {predictions.map((pred) => (
                <div
                  key={pred.id}
                  className={cn(
                    'p-3 rounded-xl border transition-all',
                    pred.type === 'prediction'
                      ? 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20'
                      : pred.type === 'recommendation'
                      ? 'border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20'
                      : 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-medium">{pred.title}</span>
                    <Badge variant="default" className="text-[8px]">
                      {pred.confidence}% conf.
                    </Badge>
                  </div>
                  <p className="text-[10px] text-slate-500 mb-2">{pred.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={pred.impact === 'high' ? 'urgent' : pred.impact === 'medium' ? 'warning' : 'default'}
                      className="text-[8px]"
                    >
                      Impact {pred.impact}
                    </Badge>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {pred.timeframe}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div>
          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'quick' ? 'anomalies' : 'quick')}
            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium">Actions rapides</span>
            </div>
            <ChevronRight className={cn(
              'w-4 h-4 text-slate-400 transition-transform',
              expandedSection === 'quick' && 'rotate-90'
            )} />
          </button>

          {expandedSection === 'quick' && (
            <div className="px-3 pb-3 space-y-2">
              <button
                type="button"
                onClick={() => onOpenView({
                  id: 'dashboard:overview',
                  type: 'dashboard',
                  title: "Vue d'ensemble",
                  icon: '📊',
                  data: { view: 'overview' },
                })}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Target className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-medium">Dashboard KPIs</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenView({
                  id: 'inbox:alerts',
                  type: 'inbox',
                  title: 'Alertes',
                  icon: '🚨',
                  data: { queue: 'alerts' },
                })}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-xs font-medium">Voir toutes les alertes</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenView({
                  id: 'comparison:bureaux',
                  type: 'comparison',
                  title: 'Comparaison bureaux',
                  icon: '🏢',
                  data: { compareBy: 'bureau' },
                })}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium">Comparer les bureaux</span>
              </button>

              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('analytics:open-export'))}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <DollarSign className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium">Exporter les données</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200/70 dark:border-slate-800">
        <p className="text-[10px] text-slate-500 text-center">
          Données actualisées automatiquement
        </p>
      </div>
    </div>
  );
}
