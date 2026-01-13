'use client';
import { useState, useEffect } from 'react';
import { Users, CheckCircle, Calendar, Plane, AlertTriangle, Shield, DollarSign, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { employesApiService, type EmployesStats } from '@/lib/services/employesApiService';
interface Props { onOpenQueue: (queue: string, title: string, icon: string) => void; }
export function EmployesLiveCounters({ onOpenQueue }: Props) {
  const [stats, setStats] = useState<EmployesStats | null>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { const load = async () => { try { setStats(await employesApiService.getStats()); } catch (e) { console.error(e); } finally { setLoading(false); } }; load(); const i = setInterval(load, 30000); return () => clearInterval(i); }, []);
  if (loading || !stats) return <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 animate-pulse">{[...Array(8)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>;
  const counters = [
    { key: 'total', label: 'Total', value: stats.total, icon: Users, color: 'teal', action: () => onOpenQueue('all', 'Tous', '👥') },
    { key: 'actifs', label: 'Actifs', value: stats.actifs, icon: CheckCircle, color: 'emerald', action: () => onOpenQueue('actif', 'Actifs', '✅') },
    { key: 'conges', label: 'En congés', value: stats.enConges, icon: Calendar, color: 'blue', action: () => onOpenQueue('conges', 'Congés', '📅') },
    { key: 'mission', label: 'En mission', value: stats.enMission, icon: Plane, color: 'indigo', action: () => onOpenQueue('mission', 'Mission', '✈️') },
    { key: 'spof', label: 'SPOF', value: stats.spofCount, icon: Shield, color: stats.spofCount > 2 ? 'red' : 'amber', action: () => onOpenQueue('spof', 'SPOF', '🛡️') },
    { key: 'risk', label: 'À risque', value: stats.riskCount, icon: AlertTriangle, color: stats.riskCount > 0 ? 'red' : 'slate', action: () => onOpenQueue('risk', 'À risque', '⚠️') },
    { key: 'salaire', label: 'Masse salariale', value: employesApiService.formatMontant(stats.salaireTotal), icon: DollarSign, color: 'emerald', action: () => {} },
    { key: 'eval', label: 'Note moyenne', value: stats.avgEvaluation.toFixed(1), icon: Star, color: 'amber', action: () => {} },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {counters.map((c) => { const Icon = c.icon; return (
        <button key={c.key} onClick={c.action} className={cn("p-4 rounded-xl border text-left transition-all hover:shadow-md", `bg-${c.color}-500/10 border-${c.color}-500/30`)}>
          <div className="flex items-center gap-2 mb-2"><Icon className={cn("w-4 h-4", c.color === 'teal' ? 'text-teal-500' : c.color === 'red' ? 'text-red-500' : c.color === 'blue' ? 'text-blue-500' : c.color === 'amber' ? 'text-amber-500' : c.color === 'emerald' ? 'text-emerald-500' : c.color === 'indigo' ? 'text-indigo-500' : 'text-slate-400')} /><span className="text-xs text-slate-500 font-medium truncate">{c.label}</span></div>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{c.value}</p>
        </button>
      ); })}
    </div>
  );
}

