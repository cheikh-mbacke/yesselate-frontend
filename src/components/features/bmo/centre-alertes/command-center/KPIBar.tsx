/**
 * Barre de KPIs pour le Centre d'Alertes
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  ChevronUp, 
  ChevronDown,
  AlertTriangle,
  AlertCircle,
  Clock,
  Lock,
  CheckCircle2,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { useCentreAlertesCommandCenterStore } from '@/lib/stores/centreAlertesCommandCenterStore';

export function KPIBar() {
  const { 
    kpis, 
    kpisLoading,
    kpiBarCollapsed,
    toggleKpiBar,
  } = useCentreAlertesCommandCenterStore();

  if (kpiBarCollapsed) {
    return (
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <span className="text-sm text-slate-400">KPIs</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleKpiBar}
          className="h-6 w-6 p-0 text-slate-400 hover:text-slate-200"
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  if (kpisLoading || !kpis) {
    return (
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
        <div className="flex items-center gap-4 flex-1">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-12 w-24 bg-slate-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleKpiBar}
          className="h-6 w-6 p-0 text-slate-400 hover:text-slate-200"
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  const kpiItems = [
    {
      label: 'Critiques',
      value: kpis.critical,
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
    {
      label: 'Avertissements',
      value: kpis.warnings,
      icon: AlertCircle,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
    },
    {
      label: 'SLA dépassés',
      value: kpis.slaExceeded,
      icon: Clock,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
    {
      label: 'Bloqués',
      value: kpis.blocked,
      icon: Lock,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
    },
    {
      label: 'Acquittées',
      value: kpis.acknowledged,
      icon: CheckCircle2,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
    {
      label: 'Résolues',
      value: kpis.resolved,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
    },
    {
      label: 'Temps réponse',
      value: `${(kpis.avgResponseTime ?? 0).toFixed(1)}h`,
      icon: Timer,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    {
      label: 'Temps résolution',
      value: `${(kpis.avgResolutionTime ?? 0).toFixed(1)}h`,
      icon: TrendingUp,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
    },
  ];

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 flex-1 overflow-x-auto scrollbar-thin">
        {kpiItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border min-w-[120px]',
                item.bgColor,
                item.borderColor
              )}
            >
              <Icon className={cn('h-4 w-4 flex-shrink-0', item.color)} />
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-slate-400 truncate">{item.label}</span>
                <span className={cn('text-sm font-semibold', item.color)}>
                  {item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleKpiBar}
        className="h-6 w-6 p-0 text-slate-400 hover:text-slate-200 flex-shrink-0"
      >
        <ChevronUp className="h-3 w-3" />
      </Button>
    </div>
  );
}

