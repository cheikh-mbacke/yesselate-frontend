/**
 * Demandes Command Center - KPI Bar
 * Barre de KPIs horizontale identique au pattern Governance
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useDemandesCommandCenterStore } from '@/lib/stores/demandesCommandCenterStore';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KPIItem {
  id: string;
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
  trendValue?: string;
  status: 'success' | 'warning' | 'critical' | 'neutral';
  sparkline?: number[];
}

interface DemandesKPIBarProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DemandesKPIBar({ onRefresh, isRefreshing }: DemandesKPIBarProps) {
  const { liveStats, openModal } = useDemandesCommandCenterStore();
  const [expanded, setExpanded] = useState(true);

  const kpis: KPIItem[] = [
    {
      id: 'total',
      label: 'Total',
      value: liveStats.total || 453,
      trend: 'up',
      trendValue: '+12',
      status: 'neutral',
      sparkline: [4, 6, 5, 8, 7, 9, 8, 10, 9, 12],
    },
    {
      id: 'pending',
      label: 'En attente',
      value: liveStats.pending || 45,
      trend: 'down',
      trendValue: '-5',
      status: liveStats.pending > 50 ? 'warning' : 'neutral',
      sparkline: [50, 48, 52, 47, 45, 48, 46, 44, 43, 45],
    },
    {
      id: 'urgent',
      label: 'Urgentes',
      value: liveStats.urgent || 12,
      trend: 'up',
      trendValue: '+3',
      status: liveStats.urgent > 5 ? 'critical' : 'warning',
      sparkline: [8, 9, 7, 10, 11, 9, 10, 12, 11, 12],
    },
    {
      id: 'validated',
      label: 'Validées (24h)',
      value: liveStats.validated || 378,
      trend: 'up',
      trendValue: '+24',
      status: 'success',
      sparkline: [15, 18, 22, 20, 25, 23, 28, 26, 30, 24],
    },
    {
      id: 'avgDelay',
      label: 'Délai moyen',
      value: `${liveStats.avgDelay || 2.3}j`,
      trend: 'down',
      trendValue: '-0.5j',
      status: liveStats.avgDelay > 3 ? 'warning' : 'success',
      sparkline: [3.5, 3.2, 3.0, 2.8, 2.9, 2.7, 2.5, 2.4, 2.3, 2.3],
    },
    {
      id: 'montant',
      label: 'Montant traité',
      value: `${((liveStats.totalMontant || 0) / 1000000000).toFixed(1)}Mds`,
      trend: 'up',
      trendValue: '+2.1Mds',
      status: 'neutral',
      sparkline: [5, 6, 5.5, 7, 6.8, 8, 7.5, 9, 8.5, 9.2],
    },
  ];

  return (
    <div className="bg-slate-900/40 border-b border-slate-700/40">
      {/* Toggle Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs text-slate-500 hover:text-slate-400 transition-colors"
      >
        <span className="uppercase tracking-wider font-medium">KPIs temps réel</span>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRefresh();
              }}
              disabled={isRefreshing}
              className="h-6 w-6 p-0 text-slate-500 hover:text-slate-300"
            >
              <RefreshCw className={cn('h-3 w-3', isRefreshing && 'animate-spin')} />
            </Button>
          )}
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </div>
      </button>

      {/* KPIs Grid */}
      {expanded && (
        <div className="grid grid-cols-6 divide-x divide-slate-800/50">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} onClick={() => openModal('kpi-drilldown', { kpiId: kpi.id })} />
          ))}
        </div>
      )}
    </div>
  );
}

function KPICard({ kpi, onClick }: { kpi: KPIItem; onClick?: () => void }) {
  const TrendIcon =
    kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus;

  const statusColors = {
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    critical: 'text-red-400',
    neutral: 'text-slate-300',
  };

  const trendColors = {
    up: kpi.status === 'critical' ? 'text-red-400' : 'text-emerald-400',
    down: kpi.status === 'critical' ? 'text-emerald-400' : 'text-amber-400',
    stable: 'text-slate-500',
  };

  return (
    <button
      onClick={onClick}
      className="bg-slate-900/60 px-3 py-2 hover:bg-slate-800/40 transition-colors cursor-pointer group text-left"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500 truncate mb-0.5 group-hover:text-slate-400 transition-colors">
            {kpi.label}
          </p>
          <div className="flex items-baseline gap-2">
            <span className={cn('text-lg font-bold', statusColors[kpi.status])}>
              {kpi.value}
            </span>
            {kpi.trendValue && (
              <span className={cn('text-xs font-medium', trendColors[kpi.trend])}>
                {kpi.trendValue}
              </span>
            )}
          </div>
        </div>

        {/* Trend Icon */}
        <div className={cn('mt-0.5', trendColors[kpi.trend])}>
          <TrendIcon className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Mini Sparkline */}
      {kpi.sparkline && (
        <div className="flex items-end gap-0.5 h-4 mt-1.5">
          {kpi.sparkline.map((value, idx) => (
            <div
              key={idx}
              className={cn(
                'w-1 rounded-full',
                kpi.status === 'critical'
                  ? 'bg-red-400'
                  : kpi.status === 'warning'
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              )}
              style={{ height: `${Math.max(value, 2)}px` }}
            />
          ))}
        </div>
      )}
    </button>
  );
}

