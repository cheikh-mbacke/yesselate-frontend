'use client';

import { useMemo, useState } from 'react';
import { FluentCard, FluentCardContent, FluentCardHeader, FluentCardTitle } from '@/components/ui/fluent-card';
import { FluentButton as Button } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Activity } from 'lucide-react';

import { demands, bureaux, decisions } from '@/lib/data';
import type { Demand } from '@/lib/types/bmo.types';

const calcDelay = (dateStr: string) => {
  const [d, m, y] = (dateStr ?? '').split('/').map(Number);
  if (!d || !m || !y) return 0;
  const t = new Date(y, m - 1, d).getTime();
  if (!Number.isFinite(t)) return 0;
  return Math.max(0, Math.ceil((Date.now() - t) / 86400000));
};

export function AnalyticsTab() {
  const [view, setView] = useState<'overview' | 'bureaux' | 'trends'>('overview');

  const analytics = useMemo(() => {
    const allDemands = (demands as Demand[]).map((d) => ({
      ...d,
      delay: calcDelay(d.date),
      isOverdue: calcDelay(d.date) > 7 && d.status !== 'validated',
    }));

    // Stats globales
    const total = allDemands.length;
    const pending = allDemands.filter((d) => (d.status ?? 'pending') === 'pending').length;
    const validated = allDemands.filter((d) => d.status === 'validated').length;
    const rejected = allDemands.filter((d) => d.status === 'rejected').length;
    const overdue = allDemands.filter((d) => d.isOverdue).length;
    const urgent = allDemands.filter((d) => d.priority === 'urgent').length;

    const avgDelay = total > 0
      ? Math.round(allDemands.reduce((sum, d) => sum + d.delay, 0) / total)
      : 0;

    const slaCompliance = total > 0
      ? Math.round(((total - overdue) / total) * 100)
      : 0;

    // Par bureau
    const byBureau = bureaux.map((b) => {
      const bureauDemands = allDemands.filter((d) => d.bureau === b.code);
      return {
        bureau: b,
        count: bureauDemands.length,
        pending: bureauDemands.filter((d) => (d.status ?? 'pending') === 'pending').length,
        validated: bureauDemands.filter((d) => d.status === 'validated').length,
        overdue: bureauDemands.filter((d) => d.isOverdue).length,
        avgDelay: bureauDemands.length > 0
          ? Math.round(bureauDemands.reduce((sum, d) => sum + d.delay, 0) / bureauDemands.length)
          : 0,
      };
    }).sort((a, b) => b.count - a.count);

    // Par type
    const byType: Record<string, number> = {};
    allDemands.forEach((d) => {
      byType[d.type] = (byType[d.type] || 0) + 1;
    });
    const topTypes = Object.entries(byType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    // Par priorité
    const byPriority = {
      urgent: allDemands.filter((d) => d.priority === 'urgent').length,
      high: allDemands.filter((d) => d.priority === 'high').length,
      normal: allDemands.filter((d) => d.priority === 'normal').length,
      low: allDemands.filter((d) => d.priority === 'low').length,
    };

    // Décisions
    const totalDecisions = decisions.length;
    const validatedDecisions = decisions.filter((d) => d.type === 'validated').length;
    const rejectedDecisions = decisions.filter((d) => d.type === 'rejected').length;

    return {
      global: { total, pending, validated, rejected, overdue, urgent, avgDelay, slaCompliance },
      byBureau,
      byType: topTypes,
      byPriority,
      decisions: { total: totalDecisions, validated: validatedDecisions, rejected: rejectedDecisions },
    };
  }, []);

  return (
    <FluentCard className="min-h-[600px]">
      <FluentCardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
              <FluentCardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-5 h-5" />
            <span>Analytics &amp; Insights</span>
          </FluentCardTitle>

          <div className="flex items-center gap-2">
            <Button size="xs" variant={view === 'overview' ? 'primary' : 'secondary'} onClick={() => setView('overview')}>
              Vue d&apos;ensemble
            </Button>
            <Button size="xs" variant={view === 'bureaux' ? 'primary' : 'secondary'} onClick={() => setView('bureaux')}>
              Par bureau
            </Button>
            <Button size="xs" variant={view === 'trends' ? 'primary' : 'secondary'} onClick={() => setView('trends')}>
              Tendances
            </Button>
          </div>
        </div>
      </FluentCardHeader>

      <FluentCardContent className="space-y-4">
        {view === 'overview' && (
          <>
            {/* KPIs principaux */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-lg border border-[rgb(var(--border)/0.5)] bg-[rgb(var(--surface-2)/0.5)]">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="w-4 h-4 text-[rgb(var(--muted))]" />
                  {analytics.global.pending > analytics.global.validated ? (
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <div className="text-2xl font-bold">{analytics.global.total}</div>
                <div className="text-xs text-[rgb(var(--muted))]">Demandes totales</div>
              </div>

              <div className="p-4 rounded-lg border border-[rgb(var(--border)/0.5)] bg-[rgb(var(--surface-2)/0.5)]">
                <div className="flex items-center justify-between mb-2">
                  <PieChart className="w-4 h-4 text-[rgb(var(--muted))]" />
                  <Badge variant={analytics.global.slaCompliance >= 90 ? 'success' : analytics.global.slaCompliance >= 70 ? 'warning' : 'urgent'} className="text-[10px]">
                    {analytics.global.slaCompliance >= 90 ? '↑' : analytics.global.slaCompliance >= 70 ? '→' : '↓'}
                  </Badge>
                </div>
                <div className={`text-2xl font-bold ${
                  analytics.global.slaCompliance >= 90 ? 'text-emerald-400' :
                  analytics.global.slaCompliance >= 70 ? 'text-amber-400' :
                  'text-red-400'
                }`}>
                  {analytics.global.slaCompliance}%
                </div>
                <div className="text-xs text-[rgb(var(--muted))]">Conformité SLA</div>
              </div>

              <div className="p-4 rounded-lg border border-[rgb(var(--border)/0.5)] bg-[rgb(var(--surface-2)/0.5)]">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-4 h-4 text-[rgb(var(--muted))]" />
                </div>
                <div className="text-2xl font-bold text-amber-400">{analytics.global.pending}</div>
                <div className="text-xs text-[rgb(var(--muted))]">À traiter</div>
              </div>

              <div className="p-4 rounded-lg border border-[rgb(var(--border)/0.5)] bg-[rgb(var(--surface-2)/0.5)]">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-4 h-4 text-[rgb(var(--muted))]" />
                </div>
                <div className="text-2xl font-bold">{analytics.global.avgDelay}j</div>
                <div className="text-xs text-[rgb(var(--muted))]">Délai moyen</div>
              </div>
            </div>

            {/* Distribution par statut */}
            <div className="p-4 rounded-lg border border-[rgb(var(--border)/0.5)]">
              <div className="text-sm font-semibold mb-3">Distribution par statut</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-[rgb(var(--muted))] mb-1">En attente</div>
                  <div className="text-xl font-bold text-amber-400">{analytics.global.pending}</div>
                  <div className="text-xs text-[rgb(var(--muted))]">
                    {analytics.global.total > 0 ? Math.round((analytics.global.pending / analytics.global.total) * 100) : 0}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[rgb(var(--muted))] mb-1">Validées</div>
                  <div className="text-xl font-bold text-emerald-400">{analytics.global.validated}</div>
                  <div className="text-xs text-[rgb(var(--muted))]">
                    {analytics.global.total > 0 ? Math.round((analytics.global.validated / analytics.global.total) * 100) : 0}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[rgb(var(--muted))] mb-1">Rejetées</div>
                  <div className="text-xl font-bold text-red-400">{analytics.global.rejected}</div>
                  <div className="text-xs text-[rgb(var(--muted))]">
                    {analytics.global.total > 0 ? Math.round((analytics.global.rejected / analytics.global.total) * 100) : 0}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[rgb(var(--muted))] mb-1">En retard</div>
                  <div className="text-xl font-bold text-orange-400">{analytics.global.overdue}</div>
                  <div className="text-xs text-[rgb(var(--muted))]">
                    {analytics.global.total > 0 ? Math.round((analytics.global.overdue / analytics.global.total) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>

            {/* Top types */}
            <div className="p-4 rounded-lg border border-[rgb(var(--border)/0.5)]">
              <div className="text-sm font-semibold mb-3">Top 5 types de demandes</div>
              <div className="space-y-2">
                {analytics.byType.map(([type, count]) => (
                  <div key={type} className="flex items-center gap-3">
                    <div className="flex-1 text-sm">{type}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-[rgb(var(--surface-2))] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
                          style={{ width: `${(count / analytics.global.total) * 100}%` }}
                        />
                      </div>
                      <div className="w-12 text-right font-mono text-sm">{count}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {view === 'bureaux' && (
          <div className="space-y-3">
            <div className="text-sm font-semibold">Performance par bureau</div>
            {analytics.byBureau.map((item) => (
              <div
                key={item.bureau.code}
                className="p-4 rounded-lg border border-[rgb(var(--border)/0.5)] hover:bg-[rgb(var(--surface-2)/0.5)] transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.bureau.icon}</span>
                    <div>
                      <div className="font-semibold">{item.bureau.code}</div>
                      <div className="text-xs text-[rgb(var(--muted))]">{item.bureau.name}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{item.count}</div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <div className="text-xs text-[rgb(var(--muted))]">En attente</div>
                    <div className="text-lg font-bold text-amber-400">{item.pending}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[rgb(var(--muted))]">Validées</div>
                    <div className="text-lg font-bold text-emerald-400">{item.validated}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[rgb(var(--muted))]">Retard</div>
                    <div className="text-lg font-bold text-orange-400">{item.overdue}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[rgb(var(--muted))]">Délai moy.</div>
                    <div className="text-lg font-bold">{item.avgDelay}j</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'trends' && (
          <div className="space-y-4">
            <div className="text-sm font-semibold">Tendances & Insights</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Priorités */}
              <div className="p-4 rounded-lg border border-[rgb(var(--border)/0.5)]">
                <div className="text-sm font-semibold mb-3">Distribution par priorité</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Urgente</span>
                    <Badge variant="urgent" className="text-xs">{analytics.byPriority.urgent}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Haute</span>
                    <Badge variant="warning" className="text-xs">{analytics.byPriority.high}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Normale</span>
                    <Badge variant="default" className="text-xs">{analytics.byPriority.normal}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Basse</span>
                    <Badge variant="default" className="text-xs">{analytics.byPriority.low}</Badge>
                  </div>
                </div>
              </div>

              {/* Décisions */}
              <div className="p-4 rounded-lg border border-[rgb(var(--border)/0.5)]">
                <div className="text-sm font-semibold mb-3">Décisions</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total</span>
                    <span className="font-bold">{analytics.decisions.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Validées</span>
                    <Badge variant="success" className="text-xs">{analytics.decisions.validated}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rejetées</span>
                    <Badge variant="urgent" className="text-xs">{analytics.decisions.rejected}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taux d&apos;approbation</span>
                    <span className="font-bold text-emerald-400">
                      {analytics.decisions.total > 0
                        ? Math.round((analytics.decisions.validated / analytics.decisions.total) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="p-4 rounded-lg border border-[rgb(var(--border)/0.5)] bg-blue-500/5 border-blue-500/20">
              <div className="text-sm font-semibold mb-2 text-blue-400">💡 Insights</div>
              <ul className="text-sm text-[rgb(var(--muted))] space-y-1 list-disc list-inside">
                <li>Le délai moyen de traitement est de {analytics.global.avgDelay} jours</li>
                <li>
                  {analytics.global.urgent > 0 
                    ? `${analytics.global.urgent} demandes urgentes nécessitent une attention immédiate`
                    : `Aucune demande urgente en cours`}
                </li>
                <li>
                  Le taux de conformité SLA est de {analytics.global.slaCompliance}% 
                  {analytics.global.slaCompliance >= 90 ? ` (excellent)` : analytics.global.slaCompliance >= 70 ? ` (acceptable)` : ` (à améliorer)`}
                </li>
                <li>
                  {analytics.byBureau[0] && `Bureau le plus actif : ${analytics.byBureau[0].bureau.code} avec ${analytics.byBureau[0].count} demandes`}
                </li>
              </ul>
            </div>
          </div>
        )}
      </FluentCardContent>
    </FluentCard>
  );
}
