'use client';

/**
 * ====================================================================
 * PAGE: Dossiers Bloqués (Blocked Dossiers)
 * ====================================================================
 * 
 * Interface de gestion des blocages pour le Bureau Maître d'Ouvrage (BMO).
 * Instance suprême avec pouvoir de substitution et d'arbitrage.
 * 
 * ====================================================================
 * APIs REQUISES (À implémenter côté backend)
 * ====================================================================
 * 
 * 1. GET /api/bmo/blocked
 *    - Récupérer tous les dossiers bloqués avec filtres
 *    - Query: ?impact=critical|high|medium|low&bureau=X&type=Y&page=N&limit=N
 *    - Response: { data: BlockedDossier[], total: number, pages: number }
 * 
 * 2. GET /api/bmo/blocked/:id
 *    - Détail complet d'un dossier bloqué
 *    - Inclut historique, documents, commentaires
 * 
 * 3. POST /api/bmo/blocked/:id/resolve
 *    - Marquer un dossier comme résolu
 *    - Body: { resolution: string, notes: string }
 * 
 * 4. POST /api/bmo/blocked/:id/escalate
 *    - Escalader vers hiérarchie supérieure
 *    - Body: { reason: string, urgency: 'high' | 'critical', targetRole: string }
 * 
 * 5. POST /api/bmo/blocked/:id/substitute
 *    - Action de substitution BMO (pouvoir suprême)
 *    - Body: { action: string, justification: string, sha256Hash: string }
 *    - Audit trail obligatoire
 * 
 * 6. POST /api/bmo/blocked/:id/reassign
 *    - Réassigner à un autre bureau/responsable
 *    - Body: { targetBureau: string, targetUser?: string, notes: string }
 * 
 * 7. POST /api/bmo/blocked/:id/comment
 *    - Ajouter un commentaire/note
 *    - Body: { content: string, visibility: 'internal' | 'shared' }
 * 
 * 8. POST /api/bmo/blocked/:id/documents
 *    - Uploader des documents justificatifs
 *    - FormData avec fichiers
 * 
 * 9. GET /api/bmo/blocked/stats
 *    - Statistiques agrégées temps réel
 *    - Response: { total, byImpact, byBureau, byType, avgDelay, slaBreaches }
 * 
 * 10. POST /api/bmo/blocked/bulk
 *     - Actions en lot (résoudre, escalader, réassigner)
 *     - Body: { ids: string[], action: string, params: object }
 * 
 * 11. GET /api/bmo/blocked/export
 *     - Exporter les données (JSON, Excel, PDF)
 *     - Query: ?format=json|xlsx|pdf&filters=...
 * 
 * 12. WebSocket /ws/bmo/blocked
 *     - Notifications temps réel (nouveau blocage, SLA breach, résolution)
 *     - Events: 'new_blocking', 'sla_alert', 'resolved', 'escalated'
 * 
 * ====================================================================
 * FONCTIONNALITÉS UX RECOMMANDÉES
 * ====================================================================
 * 
 * - [ ] Notifications push navigateur pour SLA critiques
 * - [ ] Intégration calendrier pour deadlines
 * - [ ] Rapport automatique quotidien/hebdomadaire par email
 * - [ ] Templates de résolution prédéfinis
 * - [ ] Workflow de validation multi-niveaux
 * - [ ] Historique complet avec diff des modifications
 * - [ ] Favoris/Watch list pour dossiers suivis
 * - [ ] Filtres sauvegardés personnalisés
 * - [ ] Mode hors-ligne avec sync
 * 
 * ====================================================================
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useBlockedWorkspaceStore } from '@/lib/stores/blockedWorkspaceStore';

import { BlockedWorkspaceTabs } from '@/components/features/bmo/workspace/blocked/BlockedWorkspaceTabs';
import { BlockedWorkspaceContent } from '@/components/features/bmo/workspace/blocked/BlockedWorkspaceContent';
import { BlockedLiveCounters } from '@/components/features/bmo/workspace/blocked/BlockedLiveCounters';
import { BlockedCommandPalette } from '@/components/features/bmo/workspace/blocked/BlockedCommandPalette';
import { BlockedStatsModal } from '@/components/features/bmo/workspace/blocked/BlockedStatsModal';
import { BlockedDecisionCenter } from '@/components/features/bmo/workspace/blocked/BlockedDecisionCenter';
import { BlockedToastProvider, useBlockedToast } from '@/components/features/bmo/workspace/blocked/BlockedToast';

import { cn } from '@/lib/utils';
import { blockedDossiers } from '@/lib/data';
import type { BlockedDossier } from '@/lib/types/bmo.types';
import {
  AlertCircle,
  Search,
  LayoutDashboard,
  Clock,
  Zap,
  TrendingUp,
  BarChart3,
  Download,
  RefreshCw,
  HelpCircle,
  Building2,
  Shield,
  ArrowUpRight,
  LayoutGrid,
  History,
  Eye,
  FileText,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  MoreVertical,
  X,
} from 'lucide-react';

// ================================
// Types
// ================================
type DashboardTab = 'overview' | 'matrix' | 'bureaux' | 'timeline';
type LoadReason = 'init' | 'manual' | 'auto';

interface BlockedStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  avgDelay: number;
  avgPriority: number;
  totalAmount: number;
  overdueSLA: number;
  resolvedToday: number;
  escalatedToday: number;
  byBureau: Array<{ bureau: string; count: number }>;
  byType: Array<{ type: string; count: number }>;
  ts: string;
}

// ================================
// Helpers
// ================================
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

function formatAmount(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} Md`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)} K`;
  return amount.toLocaleString('fr-FR');
}

function useInterval(fn: () => void, delay: number | null): void {
  const ref = useRef(fn);
  useEffect(() => { ref.current = fn; }, [fn]);
  useEffect(() => {
    if (delay === null) return;
    const id = window.setInterval(() => ref.current(), delay);
    return () => window.clearInterval(id);
  }, [delay]);
}

// ================================
// Main Component (Inner)
// ================================
function BlockedPageContent() {
  const { tabs, openTab, stats, setStats, setStatsLoading, statsLoading, autoRefresh, setAutoRefresh } = useBlockedWorkspaceStore();
  const toast = useBlockedToast();

  const showDashboard = tabs.length === 0;

  // UI State
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('overview');
  const [commandOpen, setCommandOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [decisionCenterOpen, setDecisionCenterOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const data = blockedDossiers as unknown as BlockedDossier[];

  // Load stats
  const loadStats = useCallback(async (reason: LoadReason = 'manual') => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setStatsLoading(true);

    try {
      await new Promise(r => setTimeout(r, reason === 'init' ? 200 : 100));
      if (ac.signal.aborted) return;

      const total = data.length;
      const critical = data.filter(d => d.impact === 'critical').length;
      const high = data.filter(d => d.impact === 'high').length;
      const medium = data.filter(d => d.impact === 'medium').length;
      const low = data.filter(d => d.impact === 'low').length;
      const avgDelay = total === 0 ? 0 : Math.round(data.reduce((acc, d) => acc + (d.delay ?? 0), 0) / total);
      const avgPriority = total === 0 ? 0 : Math.round(data.reduce((acc, d) => acc + computePriority(d), 0) / total);
      const totalAmount = data.reduce((acc, d) => acc + parseAmountFCFA(d.amount), 0);

      setStats({
        total,
        critical,
        high,
        medium,
        low,
        avgDelay,
        avgPriority,
        totalAmount,
        overdueSLA: data.filter(d => (d.delay ?? 0) > 14).length,
        resolvedToday: 0,
        escalatedToday: 0,
        byBureau: [],
        byType: [],
        ts: new Date().toISOString(),
      });

      if (reason === 'manual') {
        toast.success('Données actualisées', `${total} dossiers bloqués`);
      }
    } catch {
      if (reason === 'manual') {
        toast.error('Erreur', 'Impossible de charger les statistiques');
      }
    } finally {
      setStatsLoading(false);
    }
  }, [data, setStats, setStatsLoading, toast]);

  // Initial load
  useEffect(() => {
    loadStats('init');
    return () => { abortRef.current?.abort(); };
  }, [loadStats]);

  // Auto-refresh
  useInterval(
    () => { if (autoRefresh && showDashboard) loadStats('auto'); },
    autoRefresh ? 60_000 : null
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.isContentEditable) return;
      if (['input', 'textarea', 'select'].includes(target?.tagName?.toLowerCase() || '')) return;

      const isMod = e.metaKey || e.ctrlKey;

      // ⌘K - Command palette
      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen(true);
        return;
      }

      // ⌘D - Decision center
      if (isMod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setDecisionCenterOpen(true);
        return;
      }

      // ⌘I - Stats
      if (isMod && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setStatsModalOpen(true);
        return;
      }

      // Escape
      if (e.key === 'Escape') {
        setCommandOpen(false);
        setStatsModalOpen(false);
        setDecisionCenterOpen(false);
        setHelpOpen(false);
        return;
      }

      // ? - Help
      if (e.key === '?' && !isMod) {
        setHelpOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for custom events
  useEffect(() => {
    const handleOpenDecision = () => setDecisionCenterOpen(true);
    window.addEventListener('blocked:open-decision-center', handleOpenDecision);
    return () => window.removeEventListener('blocked:open-decision-center', handleOpenDecision);
  }, []);

  // Open queue
  const openQueue = useCallback((queue: string, title: string, icon: string) => {
    openTab({
      id: `inbox:${queue}`,
      type: 'inbox',
      title,
      icon,
      data: { queue },
    });
  }, [openTab]);

  // Dashboard tabs
  const dashboardTabs = useMemo(() => [
    { id: 'overview' as DashboardTab, label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: 'matrix' as DashboardTab, label: 'Matrice urgence', icon: LayoutGrid },
    { id: 'bureaux' as DashboardTab, label: 'Par bureau', icon: Building2 },
    { id: 'timeline' as DashboardTab, label: 'Timeline', icon: History },
  ], []);

  // Computed stats
  const displayStats = useMemo(() => {
    if (stats) return stats;
    return {
      total: data.length,
      critical: data.filter(d => d.impact === 'critical').length,
      high: data.filter(d => d.impact === 'high').length,
      medium: data.filter(d => d.impact === 'medium').length,
      low: data.filter(d => d.impact === 'low').length,
      avgDelay: 0,
      avgPriority: 0,
      totalAmount: 0,
    };
  }, [stats, data]);

  // ================================
  // Render
  // ================================
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-red-500/10">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900 dark:text-slate-100">Dossiers bloqués</h1>
              {displayStats.critical > 0 && (
                <span className="text-xs text-red-500 font-medium">
                  {displayStats.critical} critique(s)
                </span>
              )}
            </div>
          </div>

          {/* Actions header */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Rechercher...</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">⌘K</kbd>
            </button>

            {/* Decision center - Bouton principal */}
            <button
              onClick={() => setDecisionCenterOpen(true)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                displayStats.critical > 0
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90"
                  : "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
              title="Centre de décision (⌘D)"
            >
              <Zap className={cn("w-4 h-4", displayStats.critical > 0 ? "text-orange-400" : "text-orange-500")} />
              <span className="hidden sm:inline">Décider</span>
              {displayStats.critical > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-xs">
                  {displayStats.critical}
                </span>
              )}
            </button>

            {/* Menu déroulant pour les autres actions */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="Plus d'options"
              >
                <MoreVertical className="w-4 h-4 text-slate-500" />
              </button>

              {menuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setMenuOpen(false)} 
                  />
                  <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg z-50 overflow-hidden">
                    <div className="py-1">
                      {/* Rafraîchir */}
                      <button
                        onClick={() => { loadStats('manual'); setMenuOpen(false); }}
                        disabled={statsLoading}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                      >
                        <RefreshCw className={cn("w-4 h-4 text-slate-400", statsLoading && "animate-spin")} />
                        Rafraîchir les données
                      </button>

                      {/* Auto-refresh */}
                      <button
                        onClick={() => { setAutoRefresh(!autoRefresh); setMenuOpen(false); }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <span className="flex items-center gap-3">
                          {autoRefresh ? (
                            <ToggleRight className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-slate-400" />
                          )}
                          Auto-refresh
                        </span>
                        <span className={cn(
                          "text-xs px-1.5 py-0.5 rounded",
                          autoRefresh ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        )}>
                          {autoRefresh ? 'ON' : 'OFF'}
                        </span>
                      </button>

                      <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />

                      {/* Statistiques */}
                      <button
                        onClick={() => { setStatsModalOpen(true); setMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                        Statistiques
                        <kbd className="ml-auto px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">⌘I</kbd>
                      </button>

                      {/* Export */}
                      <button
                        onClick={() => { setExportModalOpen(true); setMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <Download className="w-4 h-4 text-purple-500" />
                        Exporter
                      </button>

                      <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />

                      {/* Aide */}
                      <button
                        onClick={() => { setHelpOpen(true); setMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <HelpCircle className="w-4 h-4 text-slate-400" />
                        Raccourcis clavier
                        <kbd className="ml-auto px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">?</kbd>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-screen-2xl mx-auto px-6 py-6">
        {/* Workspace tabs */}
        {(tabs.length > 0) && (
          <div className="mb-6">
            <BlockedWorkspaceTabs />
          </div>
        )}

        {showDashboard ? (
          <div className="space-y-8">
            {/* Alert banner for critical - Design épuré */}
            {displayStats.critical > 0 && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {displayStats.critical} blocage(s) critique(s)
                      </p>
                      <p className="text-sm text-slate-500">
                        Action immédiate requise — Impact critique sur les opérations
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => openQueue('critical', 'Critiques', '🚨')}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Traiter maintenant
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Dashboard navigation */}
            <nav className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
              {dashboardTabs.map(t => {
                const Icon = t.icon;
                const isActive = dashboardTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setDashboardTab(t.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                      isActive
                        ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
            </nav>

            {/* Dashboard content */}
            {dashboardTab === 'overview' && (
              <div className="space-y-8">
                {/* KPIs - Couleurs neutres, seules les icônes sont colorées */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {/* Total */}
                  <button
                    onClick={() => openQueue('all', 'Tous les blocages', '🚧')}
                    className="p-4 rounded-xl border bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-left hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-500">Total</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{displayStats.total}</p>
                  </button>

                  {/* Critical */}
                  <button
                    onClick={() => openQueue('critical', 'Critiques', '🚨')}
                    className="p-4 rounded-xl border bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-left hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className={cn(
                        "w-4 h-4",
                        displayStats.critical > 0 ? "text-red-500" : "text-slate-400"
                      )} />
                      <span className="text-xs text-slate-500">Critiques</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {displayStats.critical}
                    </p>
                    {displayStats.critical > 0 && (
                      <p className="text-xs text-slate-500 mt-1">Action requise</p>
                    )}
                  </button>

                  {/* High */}
                  <button
                    onClick={() => openQueue('high', 'Impact élevé', '⚠️')}
                    className="p-4 rounded-xl border bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-left hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className={cn(
                        "w-4 h-4",
                        displayStats.high > 0 ? "text-amber-500" : "text-slate-400"
                      )} />
                      <span className="text-xs text-slate-500">Élevé</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {displayStats.high}
                    </p>
                  </button>

                  {/* Medium */}
                  <button
                    onClick={() => openQueue('medium', 'Impact moyen', '📊')}
                    className="p-4 rounded-xl border bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-left hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-xs text-slate-500">Moyen</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{displayStats.medium}</p>
                  </button>

                  {/* Delay avg */}
                  <div className="p-4 rounded-xl border bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="text-xs text-slate-500">Délai moy.</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {stats?.avgDelay ?? '—'}<span className="text-base font-normal text-slate-500">j</span>
                    </p>
                  </div>

                  {/* Amount blocked */}
                  <div className="p-4 rounded-xl border bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">💰</span>
                      <span className="text-xs text-slate-500">Montant bloqué</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {stats?.totalAmount ? formatAmount(stats.totalAmount) : '—'}
                    </p>
                    <p className="text-xs text-slate-500">FCFA</p>
                  </div>
                </div>

                {/* Live counters */}
                <section>
                  <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                    Répartition détaillée
                  </h2>
                  <BlockedLiveCounters onOpenQueue={openQueue} />
                </section>

                {/* Quick actions - icônes colorées, texte neutre */}
                <section>
                  <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                    Actions rapides
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setDecisionCenterOpen(true)}
                      className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all text-left group bg-white dark:bg-slate-900/50"
                    >
                      <Zap className="w-8 h-8 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Centre de décision</p>
                      <p className="text-sm text-slate-500 mt-1">Escalader, substituer, résoudre</p>
                    </button>

                    <button
                      onClick={() => openQueue('critical', 'Critiques', '🚨')}
                      className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all text-left group bg-white dark:bg-slate-900/50"
                    >
                      <ArrowUpRight className="w-8 h-8 text-red-500 mb-3 group-hover:scale-110 transition-transform" />
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Traiter les critiques</p>
                      <p className="text-sm text-slate-500 mt-1">{displayStats.critical} dossiers en attente</p>
                    </button>

                    <button
                      onClick={() => {
                        openTab({
                          type: 'matrix',
                          id: 'matrix:main',
                          title: 'Matrice d\'urgence',
                          icon: '📐',
                          data: {},
                        });
                      }}
                      className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all text-left group bg-white dark:bg-slate-900/50"
                    >
                      <LayoutGrid className="w-8 h-8 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
                      <p className="font-semibold text-slate-900 dark:text-slate-100">Matrice d'urgence</p>
                      <p className="text-sm text-slate-500 mt-1">Vue Impact × Délai</p>
                    </button>
                  </div>
                </section>

                {/* Governance message - Design épuré */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        Gouvernance BMO — Pouvoir de substitution
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        En tant qu'instance suprême, le BMO dispose du pouvoir de substitution pour débloquer
                        les situations critiques. Chaque décision est tracée et auditable.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {dashboardTab === 'matrix' && (
              <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6">
                <p className="text-center text-slate-500 py-8">
                  <LayoutGrid className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  Cliquez sur &quot;Matrice urgence&quot; dans les actions rapides ou utilisez ⌘K
                </p>
              </div>
            )}

            {dashboardTab === 'bureaux' && (
              <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6">
                <p className="text-center text-slate-500 py-8">
                  <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  Vue par bureau en cours de développement
                </p>
              </div>
            )}

            {dashboardTab === 'timeline' && (
              <div className="rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6">
                <p className="text-center text-slate-500 py-8">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  Timeline des blocages en cours de développement
                </p>
              </div>
            )}
          </div>
        ) : (
          <BlockedWorkspaceContent />
        )}
      </main>

      {/* ================================ */}
      {/* Modals & Overlays */}
      {/* ================================ */}

      {/* Command Palette */}
      <BlockedCommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onOpenStats={() => setStatsModalOpen(true)}
        onOpenDecisionCenter={() => setDecisionCenterOpen(true)}
        onOpenMatrix={() => {
          openTab({
            type: 'matrix',
            id: 'matrix:main',
            title: 'Matrice d\'urgence',
            icon: '📐',
            data: {},
          });
        }}
        onRefresh={() => loadStats('manual')}
      />

      {/* Stats Modal */}
      <BlockedStatsModal
        open={statsModalOpen}
        onClose={() => setStatsModalOpen(false)}
      />

      {/* Decision Center */}
      <BlockedDecisionCenter
        open={decisionCenterOpen}
        onClose={() => setDecisionCenterOpen(false)}
      />

      {/* Help Modal */}
      {helpOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setHelpOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <HelpCircle className="w-5 h-5 text-slate-500" />
                Raccourcis clavier
              </h2>
              <button onClick={() => setHelpOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { key: '⌘K', label: 'Palette de commandes' },
                { key: '⌘D', label: 'Centre de décision' },
                { key: '⌘I', label: 'Statistiques' },
                { key: '⌘1', label: 'Tous les blocages' },
                { key: '⌘2', label: 'Blocages critiques' },
                { key: '⌘M', label: 'Matrice d\'urgence' },
                { key: 'Ctrl+Tab', label: 'Onglet suivant' },
                { key: 'Ctrl+W', label: 'Fermer l\'onglet' },
                { key: 'Esc', label: 'Fermer les modales' },
                { key: '?', label: 'Cette aide' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">{label}</span>
                  <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs text-slate-500">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
            <button
              onClick={() => setHelpOpen(false)}
              className="w-full mt-6 px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:opacity-90 transition-opacity"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {exportModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setExportModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Download className="w-5 h-5 text-purple-500" />
                Exporter les données
              </h2>
              <button onClick={() => setExportModalOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="space-y-3">
              {[
                { format: 'JSON', desc: 'Données brutes structurées', icon: '📄' },
                { format: 'Excel', desc: 'Fichier tableur (.xlsx)', icon: '📊' },
                { format: 'PDF', desc: 'Rapport avec graphiques', icon: '📑' },
                { format: 'CSV', desc: 'Données tabulées', icon: '📋' },
              ].map(({ format, desc, icon }) => (
                <button
                  key={format}
                  onClick={() => {
                    toast.success('Export lancé', `Format ${format}`);
                    setExportModalOpen(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left"
                >
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{format}</p>
                    <p className="text-sm text-slate-500">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-6 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs text-slate-500">
                💡 Les exports incluent tous les dossiers filtrés selon la vue active.
                Pour un export spécifique, utilisez les filtres avant d'exporter.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================================
// Main Component (with Provider)
// ================================
export default function BlockedPage() {
  return (
    <BlockedToastProvider>
      <BlockedPageContent />
    </BlockedToastProvider>
  );
}
