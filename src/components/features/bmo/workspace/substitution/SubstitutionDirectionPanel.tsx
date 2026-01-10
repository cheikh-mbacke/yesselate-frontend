'use client';

import { useState, useEffect } from 'react';
import { substitutionApiService, type SubstitutionStats } from '@/lib/services/substitutionApiService';
import { X, Zap, Clock, TrendingUp, Users, AlertTriangle, ArrowRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props { open: boolean; onClose: () => void; }

export function SubstitutionDirectionPanel({ open, onClose }: Props) {
  const [stats, setStats] = useState<SubstitutionStats | null>(null);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      try { const data = await substitutionApiService.getStats(); setStats(data); }
      catch (error) { console.error('Failed:', error); }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-[#1f1f1f] border-l border-slate-200 dark:border-slate-800 shadow-xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex-none p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Centre de Pilotage</h3>
            <p className="text-xs text-slate-500">Substitutions en temps réel</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!stats ? (
          <div className="space-y-3 animate-pulse">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>
        ) : (
          <>
            {/* Alertes critiques */}
            {stats.criticalCount > 0 && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-red-500" />
                  <span className="font-semibold text-red-600 dark:text-red-400">Critiques</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{stats.criticalCount}</p>
                <p className="text-xs text-red-500/80">Substitutions urgentes à traiter</p>
              </div>
            )}

            {/* Métriques rapides */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <TrendingUp className="w-4 h-4 text-blue-500 mb-1" />
                <p className="text-xl font-bold text-blue-600">{stats.active}</p>
                <p className="text-xs text-slate-500">Actives</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Clock className="w-4 h-4 text-amber-500 mb-1" />
                <p className="text-xl font-bold text-amber-600">{stats.pending}</p>
                <p className="text-xs text-slate-500">En attente</p>
              </div>
            </div>

            {/* Ressources */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Ressources</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">Absences planifiées</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-purple-600">{stats.absencesCount}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-500" />
                    <span className="text-sm">Délégations actives</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-cyan-600">{stats.delegationsCount}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Retard moyen */}
            <div className={cn("p-3 rounded-xl border", stats.avgDelay > 5 ? "bg-red-500/10 border-red-500/30" : stats.avgDelay > 2 ? "bg-amber-500/10 border-amber-500/30" : "bg-emerald-500/10 border-emerald-500/30")}>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className={cn("w-4 h-4", stats.avgDelay > 5 ? "text-red-500" : stats.avgDelay > 2 ? "text-amber-500" : "text-emerald-500")} />
                <span className="text-sm font-medium">Retard moyen</span>
              </div>
              <p className={cn("text-2xl font-bold", stats.avgDelay > 5 ? "text-red-600" : stats.avgDelay > 2 ? "text-amber-600" : "text-emerald-600")}>{stats.avgDelay} jours</p>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex-none p-4 border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-500 text-center">Mise à jour auto toutes les 30s</p>
      </div>
    </div>
  );
}

