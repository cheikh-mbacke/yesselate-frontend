'use client';

import React, { useMemo } from 'react';
import { contractsToSign } from '@/lib/data';
import { cn } from '@/lib/utils';
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  Calendar,
} from 'lucide-react';

// Utils
const parseMoney = (v: unknown): number => {
  if (typeof v === 'number') return v;
  const raw = String(v ?? '').replace(/\s/g, '').replace(/FCFA|XOF/gi, '').replace(/[^\d,.-]/g, '');
  return Number(raw.replace(/,/g, '')) || 0;
};

const formatFCFA = (v: number): string => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
};

export function ContratAnalyticsView({ tabId }: { tabId: string }) {
  const stats = useMemo(() => {
    const contracts = contractsToSign;
    
    const total = contracts.length;
    const pending = contracts.filter((c) => c.status === 'pending').length;
    const validated = contracts.filter((c) => c.status === 'validated').length;
    
    const totalAmount = contracts.reduce((sum, c) => sum + parseMoney((c as any).amount), 0);
    const avgAmount = total > 0 ? totalAmount / total : 0;
    
    const byType = {
      marche: contracts.filter((c) => (c as any).type === 'Marché').length,
      avenant: contracts.filter((c) => (c as any).type === 'Avenant').length,
      st: contracts.filter((c) => (c as any).type === 'Sous-traitance').length,
    };
    
    const byBureau: Record<string, number> = {};
    contracts.forEach((c) => {
      const bureau = (c as any).bureau || 'Autre';
      byBureau[bureau] = (byBureau[bureau] || 0) + 1;
    });
    
    return {
      total,
      pending,
      validated,
      totalAmount,
      avgAmount,
      byType,
      byBureau,
      completionRate: total > 0 ? Math.round((validated / total) * 100) : 0,
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-purple-500" />
          Analytics contrats
        </h2>
        <p className="text-sm text-slate-500">
          Vue d'ensemble et indicateurs de performance
        </p>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-700 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>
          <div className="text-sm text-slate-500">Total contrats</div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-700 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-3xl font-bold">{stats.pending}</div>
          </div>
          <div className="text-sm text-slate-500">En attente</div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-700 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-3xl font-bold">{stats.completionRate}%</div>
          </div>
          <div className="text-sm text-slate-500">Taux de complétion</div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-700 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {formatFCFA(stats.totalAmount)}
            </div>
          </div>
          <div className="text-sm text-slate-500">Montant total</div>
        </div>
      </div>

      {/* Répartition par type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-700 dark:bg-slate-900/50">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-slate-400" />
            Par type de contrat
          </h3>
          
          <div className="space-y-4">
            {[
              { label: 'Marchés', value: stats.byType.marche, color: 'bg-blue-500', icon: '📋' },
              { label: 'Avenants', value: stats.byType.avenant, color: 'bg-indigo-500', icon: '📝' },
              { label: 'Sous-traitance', value: stats.byType.st, color: 'bg-cyan-500', icon: '🤝' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="text-sm text-slate-500">
                    {item.value} ({stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', item.color)}
                    style={{ width: `${stats.total > 0 ? (item.value / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-700 dark:bg-slate-900/50">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-slate-400" />
            Par bureau
          </h3>
          
          <div className="space-y-4">
            {Object.entries(stats.byBureau)
              .sort(([, a], [, b]) => b - a)
              .map(([bureau, count], index) => {
                const colors = ['bg-purple-500', 'bg-pink-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500'];
                return (
                  <div key={bureau}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{bureau}</span>
                      <span className="text-sm text-slate-500">
                        {count} ({stats.total > 0 ? Math.round((count / stats.total) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', colors[index % colors.length])}
                        style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Tendances */}
      <div className="p-6 rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-700 dark:bg-slate-900/50">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-slate-400" />
          Tendances
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-700/50">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">+12%</span>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Contrats signés ce mois
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-700/50">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">4.2 jours</span>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Délai moyen de traitement
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-700/50">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <DollarSign className="w-5 h-5" />
              <span className="font-semibold">{formatFCFA(stats.avgAmount)}</span>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Montant moyen par contrat
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

