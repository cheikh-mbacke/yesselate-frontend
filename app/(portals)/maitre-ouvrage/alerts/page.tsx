'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAlertWorkspaceStore } from '@/lib/stores/alertWorkspaceStore';

import { AlertWorkspaceTabs } from '@/components/features/alerts/workspace/AlertWorkspaceTabs';
import { AlertWorkspaceContent } from '@/components/features/alerts/workspace/AlertWorkspaceContent';
import { AlertLiveCounters } from '@/components/features/alerts/workspace/AlertLiveCounters';
import { AlertCommandPalette } from '@/components/features/alerts/workspace/AlertCommandPalette';
import { AlertDirectionPanel } from '@/components/features/alerts/workspace/AlertDirectionPanel';
import { AlertAlertsBanner } from '@/components/features/alerts/workspace/AlertAlertsBanner';
import { AlertExportModal } from '@/components/features/alerts/workspace/AlertExportModal';
import { AlertStatsModal } from '@/components/features/alerts/workspace/AlertStatsModal';
import { ToastProvider, useAlertToast } from '@/components/ui/toast';

import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';

import {
  AlertTriangle,
  AlertCircle,
  Activity,
  HelpCircle,
  RefreshCw,
  BarChart3,
  Download,
  ToggleLeft,
  ToggleRight,
  Clock,
  Search,
  Maximize,
  Minimize,
  Keyboard,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ================================
// TYPES
// ================================
interface AlertStats {
  total: number;
  critical: number;
  warning: number;
  info: number;
  success: number;
  acknowledged: number;
  resolved: number;
  escalated: number;
  avgResponseTime: number;
  avgResolutionTime: number;
}

type Mode = 'dashboard' | 'workspace';

type UIState = {
  mode: Mode;
  showDirectionPanel: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
};

const UI_PREF_KEY = 'bmo.alerts.ui.v1';
const DISMISSED_KEY = 'bmo.alerts.dismissed.v1';

function readUIState(): UIState | null {
  try {
    const raw = localStorage.getItem(UI_PREF_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<UIState>;
    const mode: Mode = p.mode === 'workspace' ? 'workspace' : 'dashboard';
    const showDirectionPanel = typeof p.showDirectionPanel === 'boolean' ? p.showDirectionPanel : false;
    const autoRefresh = typeof p.autoRefresh === 'boolean' ? p.autoRefresh : true;
    const refreshInterval =
      typeof p.refreshInterval === 'number' && p.refreshInterval >= 5000 ? p.refreshInterval : 30000;

    return { mode, showDirectionPanel, autoRefresh, refreshInterval };
  } catch {
    return null;
  }
}

function writeUIState(s: UIState) {
  try {
    localStorage.setItem(UI_PREF_KEY, JSON.stringify(s));
  } catch {
    // no-op
  }
}

function readDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.map(String));
  } catch {
    return new Set();
  }
}

function writeDismissed(set: Set<string>) {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // no-op
  }
}

// ================================
// UI helpers
// ================================
function Chip({
  children,
  tone = 'slate',
}: {
  children: React.ReactNode;
  tone?: 'slate' | 'amber' | 'rose' | 'emerald' | 'purple';
}) {
  const tones: Record<string, string> = {
    slate: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-200/40 dark:border-slate-700/50',
    amber: 'bg-amber-500/10 text-amber-800 dark:text-amber-200 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border', tones[tone])}>
      {children}
    </span>
  );
}

function IconButton({
  title,
  onClick,
  children,
  active,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'p-2 rounded-lg transition-colors border',
        'border-slate-200/70 dark:border-slate-800',
        active ? 'bg-purple-500/10 text-purple-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-500'
      )}
    >
      {children}
    </button>
  );
}

// ================================
// COMPONENT
// ================================
function AlertsPageContent() {
  const { tabs, openTab } = useAlertWorkspaceStore();
  const toast = useAlertToast();

  // UI State
  const [mode, setMode] = useState<Mode>('dashboard');
  const [showHelp, setShowHelp] = useState(false);
  const [showDirectionPanel, setShowDirectionPanel] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // Dismissed banners (persist)
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Stats
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState<number | null>(null);

  // Auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30s
  const intervalRef = useRef<number | null>(null);

  const showDashboard = mode === 'dashboard' && tabs.length === 0;

  // init prefs + dismissed
  useEffect(() => {
    const st = readUIState();
    if (st) {
      setMode(st.mode);
      setShowDirectionPanel(st.showDirectionPanel);
      setAutoRefresh(st.autoRefresh);
      setRefreshInterval(st.refreshInterval);
    }
    setDismissedAlerts(readDismissed());
  }, []);

  // persist prefs
  useEffect(() => {
    writeUIState({ mode, showDirectionPanel, autoRefresh, refreshInterval });
  }, [mode, showDirectionPanel, autoRefresh, refreshInterval]);

  // persist dismissed
  useEffect(() => {
    writeDismissed(dismissedAlerts);
  }, [dismissedAlerts]);

  // fullscreen: lock scroll
  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [fullscreen]);

  // Load stats
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      // En prod: await fetch('/api/alerts/stats');
      await new Promise((r) => setTimeout(r, 250));
      const { calculateAlertStats } = await import('@/lib/data/alerts');
      const calculatedStats = calculateAlertStats();
      setStats(calculatedStats);
      setLastRefreshAt(Date.now());
    } catch (e) {
      console.error('Erreur chargement stats:', e);
      toast.error('Erreur de chargement', 'Impossible de charger les statistiques');
    } finally {
      setStatsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Auto-refresh intelligent (pause onglet caché)
  useEffect(() => {
    if (!autoRefresh) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }

    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      if (document.hidden) return;
      loadStats();
    }, refreshInterval);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [autoRefresh, refreshInterval, loadStats]);

  // Helpers open tabs (assure bascule workspace)
  const openQueue = useCallback(
    (queue: string) => {
      const queueConfig: Record<string, { title: string; icon: string }> = {
        critical: { title: 'Critiques', icon: '🔴' },
        warning: { title: 'Avertissements', icon: '⚠️' },
        blocked: { title: 'Bloqués', icon: '🚫' },
        sla: { title: 'SLA', icon: '⏱️' },
        resolved: { title: 'Résolues', icon: '✅' },

        info: { title: 'Info', icon: 'ℹ️' },
        success: { title: 'Succès', icon: '✅' },
        acknowledged: { title: 'Acquittées', icon: '💜' },
        payment: { title: 'Paiements', icon: '💰' },
        contract: { title: 'Contrats', icon: '📄' },
        budget: { title: 'Budgets', icon: '📊' },
        system: { title: 'Système', icon: '⚙️' },
      };

      const config = queueConfig[queue] ?? { title: queue, icon: '📋' };

      openTab({
        id: `inbox:${queue}`,
        type: 'inbox',
        title: config.title,
        icon: config.icon,
        data: { queue },
      });

      if (mode === 'dashboard') setMode('workspace');
    },
    [openTab, mode]
  );

  const openAnalytics = useCallback(() => {
    openTab({ id: 'analytics:overview', type: 'analytics', title: 'Analytics', icon: '📊' });
    if (mode === 'dashboard') setMode('workspace');
  }, [openTab, mode]);

  const openCommandPalette = useCallback(() => {
    window.dispatchEvent(new CustomEvent('alert:open-command-palette'));
  }, []);

  // Close everything (Esc)
  const closeAllOverlays = useCallback(() => {
    setShowHelp(false);
    setShowExport(false);
    setShowStats(false);
    setShowDirectionPanel(false);
  }, []);

  // Keyboard shortcuts (Ctrl + ⌘)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();

      if (target?.isContentEditable) return;
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      const mod = e.ctrlKey || e.metaKey;

      // mod+k
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openCommandPalette();
        return;
      }

      // mod+1..5
      if (mod && ['1', '2', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        const map = ['critical', 'warning', 'blocked', 'sla', 'resolved'];
        openQueue(map[parseInt(e.key, 10) - 1]);
        return;
      }

      // mod+a (analytics)
      if (mod && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        openAnalytics();
        return;
      }

      // mod+e (export)
      if (mod && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setShowExport(true);
        return;
      }

      // mod+s (stats)
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setShowStats(true);
        return;
      }

      // mod+b (direction panel)
      if (mod && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setShowDirectionPanel((p) => !p);
        return;
      }

      // F11 or mod+shift+f (fullscreen)
      if (e.key === 'F11' || (mod && e.shiftKey && e.key.toLowerCase() === 'f')) {
        e.preventDefault();
        setFullscreen((p) => !p);
        return;
      }

      // ? (help) -> Shift+/ donne "?"
      if (e.key === '?' && !mod) {
        e.preventDefault();
        setShowHelp(true);
        return;
      }

      // Esc: close overlays then fullscreen
      if (e.key === 'Escape') {
        e.preventDefault();
        closeAllOverlays();
        if (fullscreen) setFullscreen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openQueue, openAnalytics, openCommandPalette, closeAllOverlays, fullscreen]);

  const refreshLabel = useMemo(() => {
    if (!lastRefreshAt) return 'Jamais rafraîchi';
    const s = Math.floor((Date.now() - lastRefreshAt) / 1000);
    if (s < 60) return `Rafraîchi il y a ${s}s`;
    const m = Math.floor(s / 60);
    return `Rafraîchi il y a ${m} min`;
  }, [lastRefreshAt]);

  // ================================
  // RENDER
  // ================================
  return (
    <div
      className={cn(
        'min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#0a0a0a] dark:via-[#141414] dark:to-[#0a0a0a] transition-all',
        fullscreen && 'fixed inset-0 z-50'
      )}
    >
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-[#141414]/80">
        <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Left */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-700 dark:text-slate-200">Alertes & Risques</h1>
                <p className="text-xs text-slate-500">Surveillance et gestion temps réel</p>
              </div>

              <div className="hidden lg:flex items-center gap-2 ml-3">
                <Chip tone="amber">
                  <Clock className="w-3.5 h-3.5" />
                  SLA
                </Chip>
                <Chip tone="purple">
                  <Shield className="w-3.5 h-3.5" />
                  Traçabilité
                </Chip>
                <Chip tone={autoRefresh ? 'emerald' : 'slate'}>
                  {autoRefresh ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
                </Chip>
              </div>
            </div>

            {/* Center counters */}
            <div className="hidden xl:block flex-1 max-w-3xl">
              {stats && <AlertLiveCounters onQueueClick={openQueue} compact />}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                type="button"
                onClick={openCommandPalette}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-sm text-slate-600 dark:text-slate-400 transition-colors"
                title="Recherche (Ctrl/⌘+K)"
              >
                <Search className="w-4 h-4" />
                <span className="hidden md:inline">Rechercher</span>
                <kbd className="hidden lg:inline px-1.5 py-0.5 text-xs font-mono bg-slate-200 dark:bg-slate-700 rounded">
                  ⌘K
                </kbd>
              </button>

              {/* Mode */}
              <button
                type="button"
                onClick={() => setMode((p) => (p === 'dashboard' ? 'workspace' : 'dashboard'))}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all',
                  mode === 'workspace'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-600'
                    : 'border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                )}
                title="Basculer Dashboard/Workspace"
              >
                {mode === 'workspace' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                <span className="hidden sm:inline text-sm font-medium">{mode === 'workspace' ? 'Workspace' : 'Dashboard'}</span>
              </button>

              {/* Refresh now */}
              <button
                type="button"
                onClick={loadStats}
                className={cn(
                  'p-2 rounded-lg border border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-slate-500',
                  statsLoading && 'opacity-70'
                )}
                title={statsLoading ? 'Rafraîchissement...' : 'Rafraîchir maintenant'}
              >
                <RefreshCw className={cn('w-5 h-5', statsLoading && 'animate-spin')} />
              </button>

              {/* Auto refresh toggle */}
              <button
                type="button"
                onClick={() => setAutoRefresh((p) => !p)}
                className={cn(
                  'p-2 rounded-lg border border-slate-200/70 dark:border-slate-800 transition-colors',
                  autoRefresh ? 'bg-emerald-500/10 text-emerald-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-500'
                )}
                title="Auto-refresh ON/OFF"
              >
                {autoRefresh ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
              </button>

              {/* Export / Stats */}
              <IconButton title="Exporter (Ctrl/⌘+E)" onClick={() => setShowExport(true)}>
                <Download className="w-5 h-5" />
              </IconButton>

              <IconButton title="Statistiques (Ctrl/⌘+S)" onClick={() => setShowStats(true)}>
                <BarChart3 className="w-5 h-5" />
              </IconButton>

              {/* Direction panel */}
              <IconButton
                title="Pilotage & Direction (Ctrl/⌘+B)"
                onClick={() => setShowDirectionPanel((p) => !p)}
                active={showDirectionPanel}
              >
                <Activity className="w-5 h-5" />
              </IconButton>

              {/* Fullscreen */}
              <IconButton title="Plein écran (F11)" onClick={() => setFullscreen((p) => !p)}>
                {fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </IconButton>

              {/* Help */}
              <IconButton title="Aide (?)" onClick={() => setShowHelp(true)}>
                <HelpCircle className="w-5 h-5" />
              </IconButton>
            </div>
          </div>

          {/* mini status row (desktop) */}
          <div className="hidden md:flex items-center justify-between pb-3 -mt-1 text-xs text-slate-500">
            <span>{refreshLabel}</span>

            <div className="flex items-center gap-3">
              <span className="hidden lg:inline">Intervalle</span>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="text-xs rounded-md border border-slate-200/70 bg-white/70 dark:bg-[#141414]/60 dark:border-slate-800 px-2 py-1"
                title="Intervalle d'auto-refresh"
              >
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
                <option value={60000}>60s</option>
                <option value={120000}>2 min</option>
                <option value={300000}>5 min</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-[1920px] p-4 sm:p-6 lg:p-8">
        {showDashboard ? (
          // ============================
          // DASHBOARD — 6 grands blocs
          // ============================
          <div className="space-y-6">
            {/* Bloc 1 — Poste de contrôle */}
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2">
                    Poste de contrôle Alertes & Risques
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
                    Objectif : détecter tôt, prioriser juste, tracer tout. Les files critiques, les blocages et les
                    dépassements SLA sont gérés ici — avec une discipline "audit-ready".
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <Chip tone="rose">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Critiques
                    </Chip>
                    <Chip tone="amber">
                      <Clock className="w-3.5 h-3.5" />
                      SLA
                    </Chip>
                    <Chip tone="purple">
                      <Shield className="w-3.5 h-3.5" />
                      Traçabilité
                    </Chip>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <FluentButton variant="primary" onClick={() => setMode('workspace')}>
                    Ouvrir le workspace
                  </FluentButton>

                  <button
                    type="button"
                    onClick={openCommandPalette}
                    className="text-sm px-3 py-2 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-slate-600 dark:text-slate-400 inline-flex items-center gap-2"
                    title="Recherche (Ctrl/⌘+K)"
                  >
                    <Search className="w-4 h-4" />
                    Recherche rapide
                  </button>
                </div>
              </div>
            </div>

            {/* Bloc 2 — Bannière alertes critiques */}
            <div className="space-y-3">
              <AlertAlertsBanner
                dismissedIds={dismissedAlerts}
                onDismiss={(id) => setDismissedAlerts((prev) => new Set(prev).add(id))}
              />
            </div>

            {/* Bloc 3 — Compteurs / Files */}
            {stats && (
              <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                    Files & volumes (temps réel)
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Chip tone={autoRefresh ? 'emerald' : 'slate'}>{autoRefresh ? 'Auto' : 'Manuel'}</Chip>
                    <Chip tone="slate">{refreshLabel}</Chip>
                  </div>
                </div>

                <AlertLiveCounters onQueueClick={openQueue} compact={false} />
              </div>
            )}

            {/* Bloc 4 — Actions rapides (priorisation) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => openQueue('critical')}
                className="p-6 rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 hover:scale-[1.02] transition-transform text-left group"
              >
                <AlertCircle className="w-8 h-8 text-rose-500 mb-3" />
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1 group-hover:text-rose-500 transition-colors">
                  Alertes critiques
                </h3>
                <p className="text-sm text-slate-500">Action immédiate, risque fort (opérationnel / financier / image).</p>
              </button>

              <button
                type="button"
                onClick={() => openQueue('blocked')}
                className="p-6 rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 hover:scale-[1.02] transition-transform text-left group"
              >
                <Shield className="w-8 h-8 text-orange-500 mb-3" />
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1 group-hover:text-orange-500 transition-colors">
                  Dossiers bloqués
                </h3>
                <p className="text-sm text-slate-500">Blocage à lever (validation, documents, arbitrage, paiement…).</p>
              </button>

              <button
                type="button"
                onClick={() => openQueue('sla')}
                className="p-6 rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 hover:scale-[1.02] transition-transform text-left group"
              >
                <Clock className="w-8 h-8 text-rose-500 mb-3" />
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1 group-hover:text-rose-500 transition-colors">
                  SLA dépassés
                </h3>
                <p className="text-sm text-slate-500">Rattrapage + justification (traçabilité obligatoire).</p>
              </button>

              <button
                type="button"
                onClick={openAnalytics}
                className="p-6 rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 hover:scale-[1.02] transition-transform text-left group"
              >
                <BarChart3 className="w-8 h-8 text-purple-500 mb-3" />
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1 group-hover:text-purple-500 transition-colors">
                  Analytics & KPIs
                </h3>
                <p className="text-sm text-slate-500">Tendances, volumes, temps de réponse, résolution, escalades.</p>
              </button>

              <button
                type="button"
                onClick={() => openQueue('resolved')}
                className="p-6 rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 hover:scale-[1.02] transition-transform text-left group"
              >
                <CheckCircle className="w-8 h-8 text-emerald-500 mb-3" />
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1 group-hover:text-emerald-500 transition-colors">
                  Alertes résolues
                </h3>
                <p className="text-sm text-slate-500">Historique + preuves (audit / contrôle / post-mortem).</p>
              </button>

              <button
                type="button"
                onClick={() => setShowDirectionPanel(true)}
                className="p-6 rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 hover:scale-[1.02] transition-transform text-left group"
              >
                <Activity className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1 group-hover:text-blue-500 transition-colors">
                  Pilotage & Direction
                </h3>
                <p className="text-sm text-slate-500">Vue stratégique + décisions (Ctrl/⌘+B).</p>
              </button>
            </div>

            {/* Bloc 5 — Gouvernance d'exploitation (auto-refresh / export / stats) */}
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 p-6">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">
                Gouvernance d'exploitation
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <div className="font-medium text-slate-700 dark:text-slate-200 mb-2">Rafraîchissement</div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-500">Auto-refresh</div>
                    <button
                      type="button"
                      onClick={() => setAutoRefresh((p) => !p)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg border text-sm transition-colors',
                        autoRefresh
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                      )}
                    >
                      {autoRefresh ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="text-sm text-slate-500">Intervalle</div>
                    <select
                      value={refreshInterval}
                      onChange={(e) => setRefreshInterval(Number(e.target.value))}
                      className="text-sm rounded-lg border border-slate-200/70 bg-white/70 dark:bg-[#141414]/60 dark:border-slate-800 px-2 py-1"
                    >
                      <option value={10000}>10s</option>
                      <option value={30000}>30s</option>
                      <option value={60000}>60s</option>
                      <option value={120000}>2 min</option>
                      <option value={300000}>5 min</option>
                    </select>
                  </div>

                  <div className="mt-3 text-xs text-slate-500">{refreshLabel}</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <div className="font-medium text-slate-700 dark:text-slate-200 mb-2">Exports & preuves</div>
                  <div className="grid gap-2">
                    <button
                      type="button"
                      onClick={() => setShowExport(true)}
                      className="px-3 py-2 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-sm inline-flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Exporter
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowStats(true)}
                      className="px-3 py-2 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-sm inline-flex items-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Statistiques
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <div className="font-medium text-slate-700 dark:text-slate-200 mb-2">Accès rapide</div>
                  <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Palette</span>
                      <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs border border-slate-300 dark:border-slate-700">
                        Ctrl/⌘+K
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Files 1..5</span>
                      <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs border border-slate-300 dark:border-slate-700">
                        Ctrl/⌘+1..5
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pilotage</span>
                      <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs border border-slate-300 dark:border-slate-700">
                        Ctrl/⌘+B
                      </kbd>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloc 6 — Hint raccourcis */}
            <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30 p-4">
              <div className="flex items-center gap-3">
                <Keyboard className="w-5 h-5 text-slate-400" />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <strong>Astuce :</strong> utilise{' '}
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-mono">Ctrl/⌘+1-5</kbd>{' '}
                  pour les files,{' '}
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-mono">Ctrl/⌘+K</kbd>{' '}
                  pour la palette, et{' '}
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-mono">?</kbd>{' '}
                  pour l'aide.
                </p>
              </div>
            </div>
          </div>
        ) : (
          // ============================
          // WORKSPACE
          // ============================
          <div className="space-y-4">
            {tabs.length > 0 && <AlertWorkspaceTabs />}
            <AlertWorkspaceContent />
          </div>
        )}
      </main>

      {/* Command Palette */}
      <AlertCommandPalette />

      {/* Direction Panel */}
      <AlertDirectionPanel isOpen={showDirectionPanel} onClose={() => setShowDirectionPanel(false)} />

      {/* Export Modal */}
      <AlertExportModal open={showExport} onClose={() => setShowExport(false)} />

      {/* Stats Modal */}
      <AlertStatsModal open={showStats} onClose={() => setShowStats(false)} />

      {/* Help Modal */}
      <FluentModal open={showHelp} onClose={() => setShowHelp(false)} title="Raccourcis clavier" maxWidth="2xl">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Navigation</h3>
            <div className="space-y-2">
              <ShortcutRow shortcut="Ctrl/⌘+1" description="Alertes critiques" />
              <ShortcutRow shortcut="Ctrl/⌘+2" description="Avertissements" />
              <ShortcutRow shortcut="Ctrl/⌘+3" description="Dossiers bloqués" />
              <ShortcutRow shortcut="Ctrl/⌘+4" description="SLA dépassés" />
              <ShortcutRow shortcut="Ctrl/⌘+5" description="Alertes résolues" />
              <ShortcutRow shortcut="Ctrl/⌘+K" description="Palette de commandes" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Actions</h3>
            <div className="space-y-2">
              <ShortcutRow shortcut="Ctrl/⌘+A" description="Ouvrir Analytics" />
              <ShortcutRow shortcut="Ctrl/⌘+E" description="Exporter" />
              <ShortcutRow shortcut="Ctrl/⌘+S" description="Statistiques" />
              <ShortcutRow shortcut="Ctrl/⌘+B" description="Toggle panneau pilotage" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Affichage</h3>
            <div className="space-y-2">
              <ShortcutRow shortcut="F11" description="Mode plein écran" />
              <ShortcutRow shortcut="?" description="Aide" />
              <ShortcutRow shortcut="Esc" description="Fermer (modales + panneau + plein écran)" />
            </div>
          </div>

          <div className="pt-2">
            <FluentButton variant="primary" onClick={() => setShowHelp(false)}>
              Fermer
            </FluentButton>
          </div>
        </div>
      </FluentModal>
    </div>
  );
}

// Wrapper with ToastProvider
export default function AlertsPage() {
  return (
    <ToastProvider>
      <AlertsPageContent />
    </ToastProvider>
  );
}

// ================================
// HELPERS
// ================================
function ShortcutRow({ shortcut, description }: { shortcut: string; description: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-slate-600 dark:text-slate-400">{description}</span>
      <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs border border-slate-300 dark:border-slate-700">
        {shortcut}
      </kbd>
    </div>
  );
}
