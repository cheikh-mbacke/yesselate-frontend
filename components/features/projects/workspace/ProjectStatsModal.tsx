'use client';

import React, { useState, useEffect } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { 
  PieChart, 
  BarChart2, 
  TrendingUp, 
  Activity, 
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProjectStats {
  total: number;
  active: number;
  blocked: number;
  late: number;
  completed: number;
  cancelled: number;
  highRisk: number;
  avgComplexity: number;
  avgRisk: number;
  informal: number;
  missingDecision: number;
  
  byPhase: Array<{ phase: string; count: number }>;
  byBureau: Array<{ bureau: string; count: number; totalBudget: number }>;
  byKind: Array<{ kind: string; count: number }>;
  byStatus: Array<{ status: string; count: number }>;
  
  budget: {
    totalPlanned: number;
    totalCommitted: number;
    totalSpent: number;
  };
  
  recentActivity: Array<{
    id: string;
    projectId: string;
    projectName: string;
    action: string;
    actor: string;
    createdAt: string;
  }>;
}

interface ProjectStatsModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProjectStatsModal({ open, onClose }: ProjectStatsModalProps) {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && !stats) {
      loadStats();
    }
  }, [open]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects/stats', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <FluentModal open={open} title="Statistiques du portefeuille" onClose={onClose}>
        <div className="space-y-4">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-slate-700 rounded" />
            ))}
          </div>
        </div>
      </FluentModal>
    );
  }

  const healthScore = Math.round(
    ((stats.active / stats.total) * 40) +
    ((1 - stats.highRisk / stats.total) * 30) +
    ((1 - stats.blocked / stats.total) * 20) +
    ((1 - stats.late / stats.total) * 10)
  );

  return (
    <FluentModal open={open} title="Statistiques du portefeuille projets" onClose={onClose}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Score de santé global */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Score de santé du portefeuille</h3>
            <PieChart className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex items-end gap-4">
            <div className="text-5xl font-bold text-purple-300">{healthScore}</div>
            <div className="text-sm text-slate-400 pb-2">/100</div>
          </div>
          <div className="mt-3 flex gap-2">
            <Badge 
              variant={healthScore >= 70 ? 'success' : healthScore >= 50 ? 'warning' : 'urgent'}
              className="text-xs"
            >
              {healthScore >= 70 ? '✓ Sain' : healthScore >= 50 ? '⚠ Attention' : '🔴 Critique'}
            </Badge>
          </div>
        </div>

        {/* Vue d'ensemble */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-slate-400">Actifs</span>
            </div>
            <div className="text-2xl font-bold text-emerald-300">{stats.active}</div>
          </div>

          <div className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span className="text-sm text-slate-400">Bloqués</span>
            </div>
            <div className="text-2xl font-bold text-rose-300">{stats.blocked}</div>
          </div>

          <div className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-slate-400">En retard</span>
            </div>
            <div className="text-2xl font-bold text-amber-300">{stats.late}</div>
          </div>

          <div className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-slate-400">Risque élevé</span>
            </div>
            <div className="text-2xl font-bold text-purple-300">{stats.highRisk}</div>
          </div>
        </div>

        {/* Budgets */}
        <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold">Vue budgétaire</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Planifié</span>
              <span className="font-mono font-semibold">
                {formatMoney(stats.budget.totalPlanned)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Engagé</span>
              <span className="font-mono font-semibold text-amber-300">
                {formatMoney(stats.budget.totalCommitted)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Dépensé</span>
              <span className="font-mono font-semibold text-emerald-300">
                {formatMoney(stats.budget.totalSpent)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-700/50">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Taux d'engagement</span>
                <span className="font-semibold">
                  {stats.budget.totalPlanned > 0 
                    ? Math.round((stats.budget.totalCommitted / stats.budget.totalPlanned) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Par phase */}
        <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold">Répartition par phase</h3>
          </div>
          <div className="space-y-2">
            {stats.byPhase.slice(0, 8).map((item) => (
              <div key={item.phase} className="flex items-center justify-between">
                <span className="text-sm truncate">{item.phase}</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="h-2 bg-blue-500/30 rounded-full" 
                    style={{ width: `${Math.min(100, (item.count / stats.total) * 200)}px` }} 
                  />
                  <span className="text-sm font-mono text-slate-500 w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Par bureau */}
        <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold">Top bureaux</h3>
          </div>
          <div className="space-y-2">
            {stats.byBureau.slice(0, 6).map((item) => (
              <div key={item.bureau} className="flex items-center justify-between">
                <span className="text-sm truncate">{item.bureau}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    {formatMoney(item.totalBudget)}
                  </span>
                  <Badge variant="info" className="text-[9px]">{item.count}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activité récente */}
        <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-[#141414]/40">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold">Activité récente</h3>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {stats.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{activity.projectName}</div>
                    <div className="text-xs text-slate-400">
                      {activity.action} • {activity.actor}
                    </div>
                  </div>
                  <Badge variant="default" className="text-[9px]">
                    {new Date(activity.createdAt).toLocaleDateString('fr-FR')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
          <FluentButton size="sm" variant="secondary" onClick={loadStats}>
            <Activity className="w-4 h-4 mr-2" />
            Rafraîchir
          </FluentButton>
          <FluentButton size="sm" variant="primary" onClick={onClose}>
            Fermer
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0
  }).format(amount);
}

