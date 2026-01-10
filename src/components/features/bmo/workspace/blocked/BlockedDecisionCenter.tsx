'use client';

import { useState, useMemo, useCallback } from 'react';
import { 
  X, Zap, AlertCircle, AlertTriangle, Clock, ArrowUpRight, Shield, 
  CheckCircle2, FileText, Building2, TrendingUp, ChevronRight, Filter,
  Users, MessageSquare, Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { blockedDossiers } from '@/lib/data';
import { useBlockedWorkspaceStore } from '@/lib/stores/blockedWorkspaceStore';
import { useBlockedToast } from './BlockedToast';
import type { BlockedDossier } from '@/lib/types/bmo.types';

type Props = {
  open: boolean;
  onClose: () => void;
};

type DecisionTab = 'overview' | 'critical' | 'escalate' | 'substitute' | 'bulk';

const IMPACT_WEIGHT: Record<string, number> = { critical: 100, high: 50, medium: 20, low: 5 };

function parseAmountFCFA(amount: unknown): number {
  const s = String(amount ?? '').replace(/[^\d]/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function computePriority(d: BlockedDossier): number {
  const w = IMPACT_WEIGHT[d.impact] ?? 1;
  const delay = Math.max(0, d.delay ?? 0) + 1;
  const amount = parseAmountFCFA(d.amount);
  const factor = 1 + amount / 1_000_000;
  return Math.round(w * delay * factor);
}

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function BlockedDecisionCenter({ open, onClose }: Props) {
  const toast = useBlockedToast();
  const { openTab, addDecision, selectedIds, toggleSelected, selectAll, clearSelection } = useBlockedWorkspaceStore();
  
  const [activeTab, setActiveTab] = useState<DecisionTab>('overview');
  const [escalationNote, setEscalationNote] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const data = blockedDossiers as unknown as BlockedDossier[];

  const stats = useMemo(() => {
    const critical = data.filter(d => d.impact === 'critical');
    const high = data.filter(d => d.impact === 'high');
    const overdue = data.filter(d => (d.delay ?? 0) > 14);
    
    return {
      critical,
      high,
      overdue,
      totalCritical: critical.length,
      totalHigh: high.length,
      totalOverdue: overdue.length,
      totalSelected: selectedIds.size,
    };
  }, [data, selectedIds]);

  const selectedDossiers = useMemo(() => {
    const map = new Map(data.map(d => [d.id, d]));
    return Array.from(selectedIds).map(id => map.get(id)).filter(Boolean) as BlockedDossier[];
  }, [data, selectedIds]);

  const currentUser = useMemo(() => ({
    id: 'USR-001',
    name: 'A. DIALLO',
    role: 'Directeur Général',
    bureau: 'BMO',
  }), []);

  // Actions
  const handleEscalate = useCallback(async (dossiers: BlockedDossier[], note: string) => {
    setProcessing(true);
    const batchId = `BATCH-ESC-${Date.now()}`;
    
    try {
      for (const dossier of dossiers) {
        const payload = {
          batchId,
          dossierId: dossier.id,
          action: 'escalation',
          note,
          at: new Date().toISOString(),
        };
        const hash = await sha256Hex(JSON.stringify(payload));
        
        addDecision({
          at: new Date().toISOString(),
          batchId,
          action: 'escalation',
          dossierId: dossier.id,
          dossierSubject: dossier.subject,
          bureau: dossier.bureau,
          impact: dossier.impact,
          delay: dossier.delay ?? 0,
          amount: parseAmountFCFA(dossier.amount),
          priority: computePriority(dossier),
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          details: `Escalade CODIR: ${note}`,
          hash: `SHA-256:${hash}`,
        });
      }
      
      toast.escalation(
        `${dossiers.length} dossier(s) escaladé(s)`,
        'Notification envoyée au CODIR',
        batchId
      );
      
      clearSelection();
      setEscalationNote('');
    } catch (error) {
      toast.error('Erreur', 'Impossible d\'escalader les dossiers');
    } finally {
      setProcessing(false);
    }
  }, [addDecision, currentUser, toast, clearSelection]);

  const handleSubstitute = useCallback(async (dossiers: BlockedDossier[], note: string) => {
    setProcessing(true);
    const batchId = `BATCH-SUB-${Date.now()}`;
    
    try {
      for (const dossier of dossiers) {
        const payload = {
          batchId,
          dossierId: dossier.id,
          action: 'substitution',
          note,
          at: new Date().toISOString(),
        };
        const hash = await sha256Hex(JSON.stringify(payload));
        
        addDecision({
          at: new Date().toISOString(),
          batchId,
          action: 'substitution',
          dossierId: dossier.id,
          dossierSubject: dossier.subject,
          bureau: dossier.bureau,
          impact: dossier.impact,
          delay: dossier.delay ?? 0,
          amount: parseAmountFCFA(dossier.amount),
          priority: computePriority(dossier),
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          details: `Substitution BMO: ${note}`,
          hash: `SHA-256:${hash}`,
        });
      }
      
      toast.resolution(
        `${dossiers.length} dossier(s) traité(s) par substitution`,
        'Pouvoir BMO exercé',
        batchId
      );
      
      clearSelection();
      setResolutionNote('');
    } catch (error) {
      toast.error('Erreur', 'Impossible d\'exercer la substitution');
    } finally {
      setProcessing(false);
    }
  }, [addDecision, currentUser, toast, clearSelection]);

  const tabs: { id: DecisionTab; label: string; icon: typeof Zap; count?: number }[] = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
    { id: 'critical', label: 'Critiques', icon: AlertCircle, count: stats.totalCritical },
    { id: 'escalate', label: 'Escalade', icon: ArrowUpRight },
    { id: 'substitute', label: 'Substitution', icon: Shield },
    { id: 'bulk', label: 'Actions masse', icon: Users, count: stats.totalSelected },
  ];

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-orange-500/30 bg-white/95 backdrop-blur-xl shadow-2xl dark:border-orange-500/20 dark:bg-[#1f1f1f]/95 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Design épuré */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
              <Zap className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Centre de décision BMO</h2>
              <p className="text-sm text-slate-500">Arbitrage, escalade et substitution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-slate-200/70 dark:border-slate-800 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-bold",
                    isActive ? "bg-orange-500/20" : "bg-slate-200 dark:bg-slate-700"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview - Design épuré */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Alertes */}
              {stats.totalCritical > 0 && (
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-500/10">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {stats.totalCritical} blocage(s) critique(s)
                        </p>
                        <p className="text-sm text-slate-500">
                          Action immédiate requise - Impact business élevé
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('critical')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      Traiter
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* KPIs rapides - texte neutre, icônes colorées */}
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('critical')}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-left hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-slate-500">Critiques</span>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.totalCritical}</p>
                </button>

                <button
                  onClick={() => {
                    selectAll(stats.high.map(d => d.id));
                    setActiveTab('escalate');
                  }}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-left hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <span className="text-sm text-slate-500">Impact élevé</span>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.totalHigh}</p>
                </button>

                <button
                  onClick={() => {
                    selectAll(stats.overdue.map(d => d.id));
                    setActiveTab('bulk');
                  }}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-left hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-slate-500">Hors délai (&gt;14j)</span>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.totalOverdue}</p>
                </button>
              </div>

              {/* Actions rapides */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-4">Actions rapides</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => {
                      selectAll(stats.critical.map(d => d.id));
                      setActiveTab('escalate');
                    }}
                    className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <ArrowUpRight className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Escalader critiques</span>
                  </button>

                  <button
                    onClick={() => {
                      selectAll(stats.overdue.map(d => d.id));
                      setActiveTab('substitute');
                    }}
                    className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Substituer hors délai</span>
                  </button>

                  <button
                    onClick={() => openTab({ type: 'audit', id: 'audit:main', title: 'Audit', icon: '🔐', data: {} })}
                    className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Voir l'audit</span>
                  </button>

                  <button
                    onClick={() => openTab({ type: 'matrix', id: 'matrix:main', title: 'Matrice', icon: '📐', data: {} })}
                    className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Matrice urgence</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Critical */}
          {activeTab === 'critical' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Dossiers critiques à traiter</h3>
                <button
                  onClick={() => selectAll(stats.critical.map(d => d.id))}
                  className="text-sm text-orange-600 hover:underline"
                >
                  Tout sélectionner
                </button>
              </div>

              <div className="space-y-2">
                {stats.critical.map(dossier => (
                  <div
                    key={dossier.id}
                    className={cn(
                      "p-4 rounded-xl border-l-4 border-red-500 bg-slate-50 dark:bg-slate-900/50 cursor-pointer transition-all",
                      selectedIds.has(dossier.id) ? "ring-2 ring-orange-500" : "hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    )}
                    onClick={() => toggleSelected(dossier.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-600">
                            {dossier.id}
                          </span>
                          <span className="text-xs text-slate-500">{dossier.type}</span>
                        </div>
                        <p className="font-medium">{dossier.subject}</p>
                        <p className="text-sm text-slate-500 mt-1">{dossier.reason}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {dossier.bureau}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            J+{dossier.delay}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-amber-600">{dossier.amount}</p>
                        <p className="text-xs text-slate-500 mt-1">Priorité: {computePriority(dossier)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedIds.size > 0 && (
                <div className="flex gap-2 pt-4 border-t border-slate-200/70 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setActiveTab('escalate');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Escalader ({selectedIds.size})
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('substitute');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-500 text-white font-medium hover:bg-purple-600 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    Substituer ({selectedIds.size})
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Escalade */}
          {activeTab === 'escalate' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpRight className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    Escalade au CODIR
                  </h3>
                </div>
                <p className="text-sm text-slate-500">
                  Les dossiers sélectionnés seront escaladés au comité de direction avec une notification immédiate.
                </p>
              </div>

              {selectedDossiers.length > 0 ? (
                <>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50">
                    <h4 className="text-sm font-medium mb-3">{selectedDossiers.length} dossier(s) sélectionné(s)</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedDossiers.map(d => (
                        <div key={d.id} className="flex items-center justify-between text-sm">
                          <span className="font-mono text-xs text-slate-500">{d.id}</span>
                          <span className="truncate flex-1 mx-2">{d.subject}</span>
                          <span className="text-xs text-amber-600">J+{d.delay}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Note d'escalade *</label>
                    <textarea
                      value={escalationNote}
                      onChange={(e) => setEscalationNote(e.target.value)}
                      placeholder="Justification de l'escalade CODIR..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200/70 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                  </div>

                  <button
                    onClick={() => handleEscalate(selectedDossiers, escalationNote)}
                    disabled={processing || !escalationNote.trim()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowUpRight className="w-5 h-5" />
                    {processing ? 'Escalade en cours...' : `Escalader ${selectedDossiers.length} dossier(s)`}
                  </button>
                </>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Aucun dossier sélectionné</p>
                  <button
                    onClick={() => setActiveTab('critical')}
                    className="mt-2 text-sm text-orange-600 hover:underline"
                  >
                    Sélectionner des dossiers
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Substitution */}
          {activeTab === 'substitute' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    Pouvoir de substitution BMO
                  </h3>
                </div>
                <p className="text-sm text-slate-500">
                  Le Directeur Général exerce son autorité de substitution pour débloquer les situations critiques.
                  Cette action est tracée et auditable.
                </p>
              </div>

              {selectedDossiers.length > 0 ? (
                <>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50">
                    <h4 className="text-sm font-medium mb-3">{selectedDossiers.length} dossier(s) sélectionné(s)</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedDossiers.map(d => (
                        <div key={d.id} className="flex items-center justify-between text-sm">
                          <span className="font-mono text-xs text-slate-500">{d.id}</span>
                          <span className="truncate flex-1 mx-2">{d.subject}</span>
                          <span className="text-xs text-purple-600">{d.bureau}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Décision de substitution *</label>
                    <textarea
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      placeholder="Décision du DG en exercice du pouvoir de substitution..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200/70 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  <button
                    onClick={() => handleSubstitute(selectedDossiers, resolutionNote)}
                    disabled={processing || !resolutionNote.trim()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Shield className="w-5 h-5" />
                    {processing ? 'Traitement...' : `Substituer ${selectedDossiers.length} dossier(s)`}
                  </button>
                </>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Aucun dossier sélectionné</p>
                  <button
                    onClick={() => setActiveTab('critical')}
                    className="mt-2 text-sm text-purple-600 hover:underline"
                  >
                    Sélectionner des dossiers
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Bulk actions */}
          {activeTab === 'bulk' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{stats.totalSelected} dossier(s) sélectionné(s)</h3>
                <button
                  onClick={() => clearSelection()}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Vider la sélection
                </button>
              </div>

              {selectedDossiers.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab('escalate')}
                    className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-center bg-white dark:bg-slate-900/50"
                  >
                    <ArrowUpRight className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <p className="font-medium text-slate-900 dark:text-slate-100">Escalader</p>
                    <p className="text-xs text-slate-500 mt-1">Remonter au CODIR</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('substitute')}
                    className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-center bg-white dark:bg-slate-900/50"
                  >
                    <Shield className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="font-medium text-slate-900 dark:text-slate-100">Substituer</p>
                    <p className="text-xs text-slate-500 mt-1">Pouvoir BMO</p>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span>Utilisateur: {currentUser.name}</span>
              <span>•</span>
              <span>Rôle: {currentUser.role}</span>
            </div>
            <span>Toutes les actions sont tracées et auditables</span>
          </div>
        </div>
      </div>
    </div>
  );
}

