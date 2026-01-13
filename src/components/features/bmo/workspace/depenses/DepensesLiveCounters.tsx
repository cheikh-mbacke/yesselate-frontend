'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Clock, CheckCircle, XCircle, DollarSign, FolderTree, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { depensesApiService, type DepensesStats } from '@/lib/services/depensesApiService';

interface Props { onOpenQueue: (queue: string, title: string, icon: string) => void; }

export function DepensesLiveCounters({ onOpenQueue }: Props) {
  const [stats, setStats] = useState<DepensesStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try { const data = await depensesApiService.getStats(); setStats(data); }
      catch (error) { console.error('Failed:', error); }
      finally { setLoading(false); }
    };
    loadStats();
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 animate-pulse">{[...Array(7)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>;
  }

  const counters = [
    { key: 'total', label: 'Total', value: depensesApiService.formatMontant(stats.montantTotal), suffix: 'FCFA', icon: CreditCard, color: 'purple', action: () => onOpenQueue('all', 'Toutes', '💸') },
    { key: 'pending', label: 'En attente', value: stats.pending, icon: Clock, color: stats.pending > 0 ? 'amber' : 'slate', action: () => onOpenQueue('pending', 'En attente', '⏳') },
    { key: 'pending-amount', label: 'Montant en attente', value: depensesApiService.formatMontant(stats.montantPending), suffix: 'FCFA', icon: DollarSign, color: 'amber', action: () => {} },
    { key: 'approved', label: 'Approuvées', value: stats.approved, icon: CheckCircle, color: 'blue', action: () => onOpenQueue('approved', 'Approuvées', '✅') },
    { key: 'paid', label: 'Payées', value: stats.paid, icon: TrendingUp, color: 'emerald', action: () => onOpenQueue('paid', 'Payées', '💰') },
    { key: 'rejected', label: 'Rejetées', value: stats.rejected, icon: XCircle, color: stats.rejected > 0 ? 'red' : 'slate', action: () => onOpenQueue('rejected', 'Rejetées', '❌') },
    { key: 'categories', label: 'Catégories', value: Object.keys(stats.byCategory).length, icon: FolderTree, color: 'slate', action: () => {} },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {counters.map((counter) => {
        const Icon = counter.icon;
        return (
          <button key={counter.key} onClick={counter.action} className={cn("p-4 rounded-xl border text-left transition-all hover:shadow-md", `bg-${counter.color}-500/10 border-${counter.color}-500/30`)}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn("w-4 h-4", counter.color === 'purple' ? 'text-purple-500' : counter.color === 'emerald' ? 'text-emerald-500' : counter.color === 'blue' ? 'text-blue-500' : counter.color === 'amber' ? 'text-amber-500' : counter.color === 'red' ? 'text-red-500' : 'text-slate-400')} />
              <span className="text-xs text-slate-500 font-medium truncate">{counter.label}</span>
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{counter.value}{counter.suffix && <span className="text-xs font-normal text-slate-500 ml-1">{counter.suffix}</span>}</p>
          </button>
        );
      })}
    </div>
  );
}

