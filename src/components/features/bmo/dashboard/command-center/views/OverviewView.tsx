/**
 * Vue d'ensemble du Dashboard
 * Dashboard principal avec KPIs, actions et risques
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  ArrowRight,
  BarChart3,
  Users,
  Wallet,
  FileCheck,
} from 'lucide-react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useApiQuery } from '@/lib/api/hooks/useApiQuery';
import { dashboardAPI } from '@/lib/api/pilotage/dashboardClient';

// Données de démo
const mockKPIs = [
  { id: 'demandes', label: 'Demandes', value: 247, trend: 12, icon: FileCheck, color: 'blue' },
  { id: 'validations', label: 'Validations', value: '89%', trend: 3, icon: CheckCircle, color: 'emerald' },
  { id: 'budget', label: 'Budget traité', value: '4.2Mds', trend: -2, icon: Wallet, color: 'amber' },
  { id: 'bureaux', label: 'Bureaux actifs', value: 12, trend: 0, icon: Users, color: 'purple' },
];

const mockActions = [
  { id: '1', title: 'BC-2024-0847', type: 'Validation BC', urgency: 'critical', delay: '2j', bureau: 'BF' },
  { id: '2', title: 'PAY-2024-1234', type: 'Paiement urgent', urgency: 'warning', delay: 'J-3', bureau: 'BCG' },
  { id: '3', title: 'CTR-2024-0567', type: 'Signature contrat', urgency: 'warning', delay: 'J-5', bureau: 'BJA' },
  { id: '4', title: 'ARB-2024-0089', type: 'Arbitrage requis', urgency: 'critical', delay: '5j', bureau: 'BOP' },
];

const mockRisks = [
  { id: '1', title: 'Blocage validation', severity: 'critical', source: 'BF', score: 92 },
  { id: '2', title: 'Retard paiement fournisseur', severity: 'critical', source: 'BCG', score: 88 },
  { id: '3', title: 'Contrat expirant', severity: 'warning', source: 'BJA', score: 72 },
];

const mockDecisions = [
  { id: 'DEC-001', type: 'Substitution', subject: 'Validation BC urgente', status: 'pending', date: '10/01/2026' },
  { id: 'DEC-002', type: 'Délégation', subject: 'Pouvoir signature', status: 'executed', date: '09/01/2026' },
  { id: 'DEC-003', type: 'Arbitrage', subject: 'Conflit ressources', status: 'pending', date: '08/01/2026' },
];

export function OverviewView() {
  const { navigate, openModal } = useDashboardCommandCenterStore();

  const { data: statsData } = useApiQuery(async (_signal: AbortSignal) => dashboardAPI.getStats({ period: 'month' }), []);
  const { data: actionsData } = useApiQuery(async (_signal: AbortSignal) => dashboardAPI.getActions({ limit: 6 }), []);
  const { data: risksData } = useApiQuery(async (_signal: AbortSignal) => dashboardAPI.getRisks({ limit: 6 }), []);
  const { data: decisionsData } = useApiQuery(async (_signal: AbortSignal) => dashboardAPI.getDecisions({ limit: 3 }), []);

  const kpis = useMemo(() => {
    if (!statsData?.kpis) return mockKPIs;
    return [
      {
        id: 'demandes',
        label: 'Demandes',
        value: Number(statsData.kpis.demandes?.value ?? 0),
        trend: Number(statsData.kpis.demandes?.trend ?? 0),
        icon: FileCheck,
        color: 'blue',
      },
      {
        id: 'validations',
        label: 'Validations',
        value: `${statsData.kpis.validations?.value ?? 0}${statsData.kpis.validations?.unit ?? '%'}`,
        trend: Number(statsData.kpis.validations?.trend ?? 0),
        icon: CheckCircle,
        color: 'emerald',
      },
      {
        id: 'budget',
        label: 'Budget traité',
        value: `${statsData.kpis.budget?.value ?? 0}${statsData.kpis.budget?.unit ? ` ${statsData.kpis.budget.unit}` : ''}`,
        trend: Number(statsData.kpis.budget?.trend ?? 0),
        icon: Wallet,
        color: 'amber',
      },
      {
        id: 'bureaux',
        label: 'Bureaux actifs',
        value: statsData.bureaux?.length ?? 0,
        trend: 0,
        icon: Users,
        color: 'purple',
      },
    ];
  }, [statsData]);

  const actions = (actionsData as any)?.actions?.length ? (actionsData as any).actions : mockActions;
  const risks = (risksData as any)?.risks?.length ? (risksData as any).risks : mockRisks;
  const decisions = (decisionsData as any)?.decisions?.length ? (decisionsData as any).decisions : mockDecisions;

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Section KPIs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Performance Globale
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('performance')}
            className="text-slate-400 hover:text-slate-200"
          >
            Voir tout
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            const iconColorClasses = {
              blue: 'text-blue-400',
              emerald: 'text-emerald-400',
              amber: 'text-amber-400',
              purple: 'text-purple-400',
            }[kpi.color];

            return (
              <button
                key={kpi.id}
                onClick={() => openModal('kpi-drilldown', { kpiId: kpi.id })}
                className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left group"
              >
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <Icon className={cn('w-5 h-5', iconColorClasses)} />
                  </div>
                  {kpi.trend !== 0 && (
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
                      {kpi.trend > 0 ? (
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-rose-400" />
                      )}
                      {Math.abs(kpi.trend)}%
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-slate-200">{kpi.value}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{kpi.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Section Actions + Risques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions prioritaires */}
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-400" />
              Actions Prioritaires
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="warning">{(actions as any[])?.length ?? 0}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('actions')}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                Voir tout
              </Button>
            </div>
          </div>

          <div className="divide-y divide-slate-800/50">
            {actions.map((action: any) => (
              <button
                key={action.id}
                onClick={() => openModal('action-detail', { action })}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/40 transition-colors text-left"
              >
                <div
                  className={cn(
                    'w-2 h-2 rounded-full flex-shrink-0',
                    action.urgency === 'critical' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{action.title}</p>
                  <p className="text-xs text-slate-500 truncate">{action.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                    {action.bureau}
                  </Badge>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      action.urgency === 'critical' ? 'text-rose-400' : 'text-amber-400'
                    )}
                  >
                    {action.delay}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Risques */}
        <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Risk Radar
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">{(risks as any[])?.length ?? 0}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('risks')}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                Voir tout
              </Button>
            </div>
          </div>

          <div className="divide-y divide-slate-800/50">
              {risks.map((risk: any) => (
              <button
                key={risk.id}
                onClick={() => openModal('risk-detail', { risk })}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/40 transition-colors text-left"
              >
                <div
                  className={cn(
                    'p-1.5 rounded-lg',
                        'bg-slate-800/50 border border-slate-700/50'
                  )}
                >
                  <AlertTriangle
                    className={cn(
                      'w-4 h-4',
                      risk.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{risk.title}</p>
                  <p className="text-xs text-slate-500">Source: {risk.source}</p>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      'text-sm font-bold',
                      risk.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'
                    )}
                  >
                    {risk.score}
                  </p>
                  <p className="text-xs text-slate-600">score</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Section Décisions */}
      <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            Décisions récentes
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('decisions')}
            className="text-slate-400 hover:text-slate-200 text-xs"
          >
            Voir tout
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800/50">
              {decisions.map((decision: any) => (
            <button
              key={decision.id}
              onClick={() => openModal('decision-detail', { decision })}
              className="px-4 py-3 hover:bg-slate-800/40 transition-colors text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-500">{decision.id}</span>
                <Badge
                  variant={decision.status === 'executed' ? 'success' : 'warning'}
                  className="text-xs"
                >
                  {decision.status === 'executed' ? 'Exécutée' : 'En attente'}
                </Badge>
              </div>
              <p className="text-sm font-medium text-slate-200">{decision.type}</p>
              <p className="text-xs text-slate-500 truncate mt-0.5">{decision.subject}</p>
              <p className="text-xs text-slate-600 mt-2">{decision.date}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

