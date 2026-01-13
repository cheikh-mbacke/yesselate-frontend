'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  X,
  BarChart2,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  Building2,
  Download,
  RefreshCw,
  Filter,
  ChevronDown,
} from 'lucide-react';

// ================================
// Types
// ================================
type Period = '7d' | '30d' | '90d' | '1y';
type Metric = 'count' | 'amount' | 'time' | 'rate';

interface StatsData {
  period: Period;
  total: number;
  pending: number;
  validated: number;
  blocked: number;
  critical: number;
  late: number;
  totalAmount: number;
  avgProcessingTime: number;
  validationRate: number;
  trends: {
    total: number;
    pending: number;
    validated: number;
    amount: number;
    time: number;
  };
  byBureau: {
    code: string;
    name: string;
    count: number;
    amount: number;
    rate: number;
  }[];
  byType: {
    type: string;
    count: number;
    amount: number;
  }[];
  byRisk: {
    level: string;
    count: number;
    percentage: number;
  }[];
  timeline: {
    date: string;
    validated: number;
    blocked: number;
    amount: number;
  }[];
}

// ================================
// Helper Components
// ================================
function StatCard({
  label,
  value,
  subValue,
  trend,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: number;
  icon: React.ReactNode;
  color: 'emerald' | 'amber' | 'red' | 'blue' | 'purple' | 'slate';
}) {
  const colors = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
    slate: 'bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-400',
  };

  return (
    <div className={cn('p-4 rounded-xl', colors[color])}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium opacity-80">{label}</span>
        {icon}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold">{value}</p>
          {subValue && <p className="text-xs opacity-70 mt-0.5">{subValue}</p>}
        </div>
        {trend !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
            trend > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
            trend < 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          )}>
            {trend > 0 && <TrendingUp className="w-3 h-3" />}
            {trend < 0 && <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
}

function ProgressBar({ 
  label, 
  value, 
  max, 
  color 
}: { 
  label: string; 
  value: number; 
  max: number; 
  color: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-slate-500">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div 
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ================================
// Main Component
// ================================
export function PaymentStatsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [period, setPeriod] = useState<Period>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data - would come from API
  const data: StatsData = useMemo(() => ({
    period,
    total: 234,
    pending: 23,
    validated: 198,
    blocked: 13,
    critical: 8,
    late: 5,
    totalAmount: 47500000,
    avgProcessingTime: 2.4,
    validationRate: 94.2,
    trends: {
      total: 12,
      pending: -8,
      validated: 15,
      amount: 8,
      time: -18,
    },
    byBureau: [
      { code: 'BF', name: 'Bureau Finance', count: 78, amount: 18500000, rate: 96 },
      { code: 'BM', name: 'Bureau Marchés', count: 56, amount: 12000000, rate: 94 },
      { code: 'BA', name: 'Bureau Achats', count: 45, amount: 9800000, rate: 98 },
      { code: 'BCT', name: 'Bureau Contrôle', count: 32, amount: 5200000, rate: 100 },
      { code: 'BQC', name: 'Bureau Qualité', count: 23, amount: 2000000, rate: 91 },
    ],
    byType: [
      { type: 'Situation', count: 89, amount: 28000000 },
      { type: 'Facture', count: 67, amount: 12500000 },
      { type: 'Avance', count: 45, amount: 5000000 },
      { type: 'Acompte', count: 33, amount: 2000000 },
    ],
    byRisk: [
      { level: 'Faible', count: 145, percentage: 62 },
      { level: 'Moyen', count: 56, percentage: 24 },
      { level: 'Élevé', count: 25, percentage: 11 },
      { level: 'Critique', count: 8, percentage: 3 },
    ],
    timeline: [],
  }), [period]);

  const formatFCFA = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M FCFA`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K FCFA`;
    return `${n} FCFA`;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsRefreshing(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <BarChart2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-xl">Statistiques & Analytics</h2>
              <p className="text-sm text-slate-500">
                Analyse des paiements • Dernière mise à jour : {new Date().toLocaleString('fr-FR')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
            </button>
            <button
              type="button"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium">Période :</span>
            {(['7d', '30d', '90d', '1y'] as Period[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  period === p
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                {p === '7d' ? '7 jours' : p === '30d' ? '30 jours' : p === '90d' ? '90 jours' : '1 an'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total paiements"
              value={data.total}
              trend={data.trends.total}
              icon={<BarChart2 className="w-4 h-4" />}
              color="blue"
            />
            <StatCard
              label="Montant total"
              value={formatFCFA(data.totalAmount)}
              trend={data.trends.amount}
              icon={<DollarSign className="w-4 h-4" />}
              color="emerald"
            />
            <StatCard
              label="Temps moyen"
              value={`${data.avgProcessingTime}j`}
              subValue="de traitement"
              trend={data.trends.time}
              icon={<Clock className="w-4 h-4" />}
              color="amber"
            />
            <StatCard
              label="Taux validation"
              value={`${data.validationRate}%`}
              icon={<CheckCircle2 className="w-4 h-4" />}
              color="purple"
            />
          </div>

          {/* Status Distribution */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* By Status */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h3 className="font-semibold mb-4">Répartition par statut</h3>
              <div className="space-y-4">
                <ProgressBar label="Validés" value={data.validated} max={data.total} color="bg-emerald-500" />
                <ProgressBar label="En attente" value={data.pending} max={data.total} color="bg-amber-500" />
                <ProgressBar label="Bloqués" value={data.blocked} max={data.total} color="bg-red-500" />
                <ProgressBar label="Critiques" value={data.critical} max={data.total} color="bg-purple-500" />
              </div>
            </div>

            {/* By Risk */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h3 className="font-semibold mb-4">Répartition par niveau de risque</h3>
              <div className="space-y-3">
                {data.byRisk.map((r) => (
                  <div key={r.level} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-3 h-3 rounded-full',
                        r.level === 'Faible' ? 'bg-emerald-500' :
                        r.level === 'Moyen' ? 'bg-amber-500' :
                        r.level === 'Élevé' ? 'bg-orange-500' :
                        'bg-red-500'
                      )} />
                      <span className="text-sm font-medium">{r.level}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">{r.count}</span>
                      <span className="text-sm font-medium w-12 text-right">{r.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* By Bureau */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h3 className="font-semibold mb-4">Performance par bureau</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-2 font-medium text-slate-500">Bureau</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-500">Paiements</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-500">Montant</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-500">Taux validation</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byBureau.map((b) => (
                    <tr key={b.code} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold">
                            {b.code}
                          </div>
                          <span className="font-medium">{b.name}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-2 font-mono">{b.count}</td>
                      <td className="text-right py-3 px-2 font-mono text-emerald-600 dark:text-emerald-400">
                        {formatFCFA(b.amount)}
                      </td>
                      <td className="text-right py-3 px-2">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full" 
                              style={{ width: `${b.rate}%` }} 
                            />
                          </div>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400 w-12 text-right">
                            {b.rate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* By Type */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h3 className="font-semibold mb-4">Répartition par type de paiement</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.byType.map((t) => (
                <div 
                  key={t.type} 
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center"
                >
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t.count}</p>
                  <p className="text-sm text-slate-500 mt-1">{t.type}</p>
                  <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    {formatFCFA(t.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <p className="text-xs text-slate-500">
            Données calculées en temps réel à partir de {data.total} paiements
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

