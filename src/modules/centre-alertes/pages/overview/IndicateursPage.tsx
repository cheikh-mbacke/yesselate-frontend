/**
 * Page : Vue d'ensemble > Indicateurs en temps réel
 */

'use client';

import React from 'react';
import { useAlertesStats } from '../../hooks';
import { AlertTriangle, Clock, CheckCircle2, TrendingUp, AlertCircle, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export function IndicateursPage() {
  const { data: stats, isLoading } = useAlertesStats();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement des indicateurs...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Aucune donnée disponible</div>
      </div>
    );
  }

  const kpiCards = [
    {
      icon: Activity,
      title: 'Total alertes',
      value: stats.total,
      color: 'muted',
    },
    {
      icon: AlertTriangle,
      title: 'Critiques',
      value: stats.critiques,
      color: 'critical',
    },
    {
      icon: AlertCircle,
      title: 'SLA',
      value: stats.sla,
      color: 'warning',
    },
    {
      icon: AlertCircle,
      title: 'RH',
      value: stats.rh,
      color: 'warning',
    },
    {
      icon: AlertCircle,
      title: 'Projets',
      value: stats.projets,
      color: 'warning',
    },
    {
      icon: CheckCircle2,
      title: 'Résolues',
      value: stats.parStatut.RESOLUE,
      color: 'success',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-1">Indicateurs en temps réel</h2>
        <p className="text-sm text-slate-400">
          Vue d'ensemble des alertes actives et des métriques clés
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={cn(
                'p-4 rounded-lg border transition-all hover:scale-105',
                card.color === 'critical'
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : card.color === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : card.color === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-300'
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{card.title}</span>
              </div>
              <div className="text-2xl font-bold">{card.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

