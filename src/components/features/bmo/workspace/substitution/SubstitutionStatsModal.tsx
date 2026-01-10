'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { substitutionApiService, type SubstitutionStats } from '@/lib/services/substitutionApiService';
import { BarChart3, X, RefreshCw, Zap, Clock, CheckCircle, Calendar, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props { open: boolean; onClose: () => void; }

export function SubstitutionStatsModal({ open, onClose }: Props) {
  const [stats, setStats] = useState<SubstitutionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      try { const data = await substitutionApiService.getStats(); setStats(data); }
      catch (error) { console.error('Failed:', error); }
      finally { setLoading(false); }
    };
    load();
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-4xl mx-4 rounded-2xl border border-slate-200/70 bg-white dark:border-slate-800 dark:bg-[#1f1f1f] shadow-2xl max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10"><BarChart3 className="w-5 h-5 text-indigo-500" /></div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Statistiques Substitutions</h2>
              <p className="text-sm text-slate-500">Vue d'ensemble des substitutions et délégations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
          {loading || !stats ? (
            <div className="grid grid-cols-4 gap-4 animate-pulse">{[...Array(8)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>
          ) : (
            <div className="space-y-6">
              {/* KPIs principaux */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                  <RefreshCw className="w-6 h-6 mx-auto mb-2 text-indigo-500" />
                  <p className="text-3xl font-bold text-indigo-600">{stats.total}</p>
                  <p className="text-sm text-slate-500">Total</p>
                </div>
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                  <Zap className="w-6 h-6 mx-auto mb-2 text-red-500" />
                  <p className="text-3xl font-bold text-red-600">{stats.criticalCount}</p>
                  <p className="text-sm text-slate-500">Critiques</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-3xl font-bold text-blue-600">{stats.active}</p>
                  <p className="text-sm text-slate-500">Actives</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                  <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
                  <p className="text-sm text-slate-500">En attente</p>
                </div>
              </div>

              {/* Métriques secondaires */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <CheckCircle className="w-5 h-5 mx-auto mb-2 text-emerald-500" />
                  <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
                  <p className="text-sm text-slate-500">Terminées</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                  <Calendar className="w-5 h-5 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold text-purple-600">{stats.absencesCount}</p>
                  <p className="text-sm text-slate-500">Absences</p>
                </div>
                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                  <Users className="w-5 h-5 mx-auto mb-2 text-cyan-500" />
                  <p className="text-2xl font-bold text-cyan-600">{stats.delegationsCount}</p>
                  <p className="text-sm text-slate-500">Délégations</p>
                </div>
              </div>

              {/* Par raison */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Par motif</h4>
                <div className="space-y-3">
                  {Object.entries(stats.byReason).map(([reason, count]) => (
                    <div key={reason} className="flex items-center gap-3">
                      <span className="text-sm text-slate-600 dark:text-slate-400 w-24">{substitutionApiService.getReasonLabel(reason)}</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(count / stats.total) * 100}%` }} />
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100 w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Par bureau */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Par bureau</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(stats.byBureau).map(([bureau, count]) => (
                    <div key={bureau} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center">
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{count}</p>
                      <p className="text-xs text-slate-500">{bureau}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

