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
import { Button } from '@/components/ui/button';

import {
  AlertTriangle,
  AlertCircle,
  Activity,
  HelpCircle,
  RefreshCw,
  BarChart3,
  Download,
  Clock,
  Search,
  Maximize,
  Minimize,
  Keyboard,
  Shield,
  CheckCircle,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  PanelRight,
  PanelRightClose,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { alertsAPI } from '@/lib/api/pilotage/alertsClient';
import { useApiQuery } from '@/lib/api/hooks/useApiQuery';
import {
  AlertDetailModal,
  AcknowledgeModal,
  ResolveModal,
  EscalateModal,
} from '@/components/features/alerts/workspace/AlertWorkflowModals';

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
  const [showSidebar, setShowSidebar] = useState(true);
  const [kpiCollapsed, setKpiCollapsed] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  // Dismissed banners (persist)
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Stats
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState<number | null>(null);

  // Auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const intervalRef = useRef<number | null>(null);

  // Workflow modals (API-backed)
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [ackOpen, setAckOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);

  const {
    data: timelineData,
    isLoading: timelineLoading,
    error: timelineError,
    refetch: refetchTimeline,
  } = useApiQuery(async (_signal: AbortSignal) => alertsAPI.getTimeline({ days: 7 }), []);

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

  // Auto-refresh intelligent
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

  // Helpers open tabs
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

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();

      if (target?.isContentEditable) return;
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openCommandPalette();
        return;
      }

      if (mod && ['1', '2', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        const map = ['critical', 'warning', 'blocked', 'sla', 'resolved'];
        openQueue(map[parseInt(e.key, 10) - 1]);
        return;
      }

      if (mod && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        openAnalytics();
        return;
      }

      if (mod && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setShowExport(true);
        return;
      }

      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setShowStats(true);
        return;
      }

      if (mod && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setShowDirectionPanel((p) => !p);
        return;
      }

      if (e.key === 'F11' || (mod && e.shiftKey && e.key.toLowerCase() === 'f')) {
        e.preventDefault();
        setFullscreen((p) => !p);
        return;
      }

      if (e.key === '?' && !mod) {
        e.preventDefault();
        setShowHelp(true);
        return;
      }

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
    if (s < 60) return `il y a ${s}s`;
    const m = Math.floor(s / 60);
    return `il y a ${m} min`;
  }, [lastRefreshAt]);

  // ================================
  // RENDER
  // ================================
  return (
    <div
      className={cn(
        'flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden',
        fullscreen && 'fixed inset-0 z-50'
      )}
    >
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r border-slate-700/50 bg-slate-900/80 backdrop-blur-xl transition-all duration-300',
          showSidebar ? 'w-64' : 'w-16'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-3 border-b border-slate-700/50">
          {showSidebar && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <span className="font-semibold text-slate-200 text-sm">Alertes & Risques</span>
            </div>
          )}
          {!showSidebar && (
            <AlertTriangle className="h-5 w-5 text-amber-400 mx-auto" />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
          >
            {showSidebar ? <PanelRightClose className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Search */}
        {showSidebar && (
          <div className="p-3">
            <button
              onClick={openCommandPalette}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="flex-1 text-left">Rechercher...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-[10px] font-mono text-slate-400">⌘K</kbd>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          <div className="space-y-1 px-2">
            {[
              { id: 'critical', icon: AlertCircle, label: 'Critiques', color: 'text-rose-400', count: stats?.critical },
              { id: 'warning', icon: AlertTriangle, label: 'Avertissements', color: 'text-amber-400', count: stats?.warning },
              { id: 'blocked', icon: Shield, label: 'Bloqués', color: 'text-orange-400' },
              { id: 'sla', icon: Clock, label: 'SLA dépassés', color: 'text-purple-400', count: stats?.escalated },
              { id: 'resolved', icon: CheckCircle, label: 'Résolues', color: 'text-emerald-400', count: stats?.resolved },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => openQueue(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                )}
              >
                <item.icon className={cn('h-5 w-5', item.color)} />
                {showSidebar && (
                  <>
                    <span className="text-sm flex-1 text-left">{item.label}</span>
                    {item.count !== undefined && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-400">
                        {item.count}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-700/50 p-3">
          {showSidebar && (
            <div className="text-xs text-slate-500 text-center">
              Alertes v2.0
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold text-slate-200">Alertes & Risques</h1>
            <span className="px-2 py-0.5 text-xs rounded bg-slate-800/50 text-slate-300 border border-slate-700/50">
              Temps réel
            </span>
            <span className="text-xs text-slate-500">{refreshLabel}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFullscreen((p) => !p)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
              title="Plein écran"
            >
              {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setActionsOpen((p) => !p)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
                title="Actions"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {actionsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setActionsOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-lg bg-slate-900 border border-slate-700/50 shadow-xl z-50 py-1">
                    <button
                      onClick={() => {
                        openCommandPalette();
                        setActionsOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
                    >
                      <Search className="w-4 h-4" />
                      Rechercher
                      <kbd className="ml-auto text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">⌘K</kbd>
                    </button>

                    <div className="border-t border-slate-700/50 my-1" />

                    <button
                      onClick={() => {
                        loadStats();
                        refetchTimeline();
                        setActionsOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
                    >
                      <RefreshCw className={cn('w-4 h-4', statsLoading && 'animate-spin')} />
                      Rafraîchir
                    </button>
                    <button
                      onClick={() => {
                        setShowExport(true);
                        setActionsOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
                    >
                      <Download className="w-4 h-4" />
                      Exporter
                    </button>
                    <button
                      onClick={() => {
                        setShowStats(true);
                        setActionsOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Statistiques
                    </button>
                    <button
                      onClick={() => {
                        setShowDirectionPanel(true);
                        setActionsOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
                    >
                      <Activity className="w-4 h-4" />
                      Pilotage & Direction
                      <kbd className="ml-auto text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">⌘B</kbd>
                    </button>

                    <div className="border-t border-slate-700/50 my-1" />

                    <button
                      onClick={() => {
                        setShowHelp(true);
                        setActionsOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50"
                    >
                      <Keyboard className="w-4 h-4" />
                      Raccourcis & aide
                      <kbd className="ml-auto text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">?</kbd>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* KPI Bar */}
        <div className="bg-slate-900/40 border-b border-slate-700/40">
          <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Indicateurs temps réel
              </span>
            </div>
            <div className="flex items-center gap-1">
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="text-xs rounded-md bg-slate-800/50 border border-slate-700/50 px-2 py-1 text-slate-300"
              >
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
                <option value={60000}>60s</option>
                <option value={120000}>2 min</option>
              </select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setKpiCollapsed(!kpiCollapsed)}
                className="h-6 w-6 p-0 text-slate-500 hover:text-slate-300"
              >
                {kpiCollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          {!kpiCollapsed && stats && (
            <div className="grid grid-cols-4 lg:grid-cols-5 gap-px bg-slate-800/30 p-px">
              <button onClick={() => openQueue('critical')} className="bg-slate-900/60 px-3 py-2 hover:bg-slate-800/40 transition-colors text-left">
                <p className="text-xs text-slate-500 mb-0.5">Critiques</p>
                <span className="text-lg font-bold text-rose-400">{stats.critical}</span>
              </button>
              <button onClick={() => openQueue('warning')} className="bg-slate-900/60 px-3 py-2 hover:bg-slate-800/40 transition-colors text-left">
                <p className="text-xs text-slate-500 mb-0.5">Warnings</p>
                <span className="text-lg font-bold text-amber-400">{stats.warning}</span>
              </button>
              <button onClick={() => openQueue('sla')} className="bg-slate-900/60 px-3 py-2 hover:bg-slate-800/40 transition-colors text-left">
                <p className="text-xs text-slate-500 mb-0.5">SLA</p>
                <span className="text-lg font-bold text-purple-400">{stats.escalated}</span>
              </button>
              <button onClick={() => openQueue('resolved')} className="bg-slate-900/60 px-3 py-2 hover:bg-slate-800/40 transition-colors text-left">
                <p className="text-xs text-slate-500 mb-0.5">Résolues</p>
                <span className="text-lg font-bold text-emerald-400">{stats.resolved}</span>
              </button>
              <div className="bg-slate-900/60 px-3 py-2 text-left">
                <p className="text-xs text-slate-500 mb-0.5">Total</p>
                <span className="text-lg font-bold text-slate-300">{stats.total}</span>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1920px] p-4 sm:p-6 lg:p-8">
            {showDashboard ? (
              <div className="space-y-6">
                {/* Poste de contrôle */}
                <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-200 mb-2">
                        Poste de contrôle Alertes & Risques
                      </h2>
                      <p className="text-slate-400 max-w-2xl">
                        Objectif : détecter tôt, prioriser juste, tracer tout. Les files critiques, les blocages et les
                        dépassements SLA sont gérés ici — avec une discipline &quot;audit-ready&quot;.
                      </p>
                    </div>
                    <FluentButton variant="primary" onClick={() => setMode('workspace')}>
                      Ouvrir le workspace
                    </FluentButton>
                  </div>
                </div>

                {/* Bannière alertes critiques */}
                <div className="space-y-3">
                  <AlertAlertsBanner
                    dismissedIds={dismissedAlerts}
                    onDismiss={(id) => setDismissedAlerts((prev) => new Set(prev).add(id))}
                  />
                </div>

                {/* Compteurs */}
                {stats && (
                  <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <h3 className="text-lg font-semibold text-slate-200">
                        Files & volumes (temps réel)
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="px-2 py-1 rounded-full border bg-slate-800/50 border-slate-700/50 text-slate-300 inline-flex items-center gap-2">
                          <span className={cn('w-1.5 h-1.5 rounded-full', autoRefresh ? 'bg-emerald-400' : 'bg-slate-500')} />
                          {autoRefresh ? 'Auto' : 'Manuel'}
                        </span>
                        <span className="px-2 py-1 rounded-full bg-slate-800 border border-slate-700">
                          {refreshLabel}
                        </span>
                      </div>
                    </div>
                    <AlertLiveCounters onQueueClick={openQueue} compact={false} />
                  </div>
                )}

                {/* Actions rapides */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => openQueue('critical')}
                    className="p-6 rounded-2xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left group"
                  >
                    <AlertCircle className="w-8 h-8 text-rose-400 mb-3" />
                    <h3 className="text-lg font-semibold text-slate-200 mb-1 group-hover:text-rose-400 transition-colors">
                      Alertes critiques
                    </h3>
                    <p className="text-sm text-slate-500">Action immédiate, risque fort (opérationnel / financier / image).</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => openQueue('blocked')}
                    className="p-6 rounded-2xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left group"
                  >
                    <Shield className="w-8 h-8 text-orange-400 mb-3" />
                    <h3 className="text-lg font-semibold text-slate-200 mb-1 group-hover:text-orange-400 transition-colors">
                      Dossiers bloqués
                    </h3>
                    <p className="text-sm text-slate-500">Blocage à lever (validation, documents, arbitrage, paiement…).</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => openQueue('sla')}
                    className="p-6 rounded-2xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left group"
                  >
                    <Clock className="w-8 h-8 text-purple-400 mb-3" />
                    <h3 className="text-lg font-semibold text-slate-200 mb-1 group-hover:text-purple-400 transition-colors">
                      SLA dépassés
                    </h3>
                    <p className="text-sm text-slate-500">Rattrapage + justification (traçabilité obligatoire).</p>
                  </button>

                  <button
                    type="button"
                    onClick={openAnalytics}
                    className="p-6 rounded-2xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left group"
                  >
                    <BarChart3 className="w-8 h-8 text-blue-400 mb-3" />
                    <h3 className="text-lg font-semibold text-slate-200 mb-1 group-hover:text-blue-400 transition-colors">
                      Analytics & KPIs
                    </h3>
                    <p className="text-sm text-slate-500">Tendances, volumes, temps de réponse, résolution, escalades.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => openQueue('resolved')}
                    className="p-6 rounded-2xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left group"
                  >
                    <CheckCircle className="w-8 h-8 text-emerald-400 mb-3" />
                    <h3 className="text-lg font-semibold text-slate-200 mb-1 group-hover:text-emerald-400 transition-colors">
                      Alertes résolues
                    </h3>
                    <p className="text-sm text-slate-500">Historique + preuves (audit / contrôle / post-mortem).</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDirectionPanel(true)}
                    className="p-6 rounded-2xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left group"
                  >
                    <Activity className="w-8 h-8 text-indigo-400 mb-3" />
                    <h3 className="text-lg font-semibold text-slate-200 mb-1 group-hover:text-indigo-400 transition-colors">
                      Pilotage & Direction
                    </h3>
                    <p className="text-sm text-slate-500">Vue stratégique + décisions (⌘B).</p>
                  </button>
                </div>

                {/* Timeline & Traçabilité (API) */}
                <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h3 className="text-lg font-semibold text-slate-200">Timeline & traçabilité (7 jours)</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => refetchTimeline()}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Actualiser
                    </Button>
                  </div>

                  {timelineLoading ? (
                    <div className="text-sm text-slate-500">Chargement…</div>
                  ) : timelineError ? (
                    <div className="text-sm text-slate-400">
                      Timeline indisponible: <span className="text-slate-300">{timelineError.message}</span>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-900/50">
                          <div className="text-xs text-slate-500 mb-1">Total (période)</div>
                          <div className="text-2xl font-bold text-slate-200">{timelineData?.stats?.totalAlerts ?? '—'}</div>
                          <div className="text-xs text-slate-600 mt-1">Moyenne/jour: {timelineData?.stats?.avgPerDay ?? '—'}</div>
                        </div>
                        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-900/50">
                          <div className="text-xs text-slate-500 mb-1">Taux critiques</div>
                          <div className="text-2xl font-bold text-slate-200">{timelineData?.stats?.criticalRate ?? '—'}%</div>
                          <div className="text-xs text-slate-600 mt-1">Indicateur risque (probabilité × impact)</div>
                        </div>
                        <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-900/50">
                          <div className="text-xs text-slate-500 mb-1">Taux résolution</div>
                          <div className="text-2xl font-bold text-slate-200">{timelineData?.stats?.resolutionRate ?? '—'}%</div>
                          <div className="text-xs text-slate-600 mt-1">Qualité de traitement & preuves</div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-slate-700/50 bg-slate-900/40 overflow-hidden">
                        <div className="px-4 py-2 border-b border-slate-800/50 flex items-center justify-between">
                          <div className="text-sm font-medium text-slate-200">Dernières alertes (extrait)</div>
                          <div className="text-xs text-slate-500">Actionable: détail → acquitter/résoudre/escalader</div>
                        </div>
                        <div className="divide-y divide-slate-800/50">
                          {(timelineData?.timeline?.[timelineData.timeline.length - 1]?.alerts ?? [])
                            .slice(0, 6)
                            .map((a: any) => {
                              const dot =
                                a.type === 'critical'
                                  ? 'bg-rose-400'
                                  : a.type === 'warning'
                                  ? 'bg-amber-400'
                                  : 'bg-slate-500';
                              return (
                                <div key={a.id} className="px-4 py-3 flex items-center gap-3">
                                  <span className={cn('w-2 h-2 rounded-full', dot)} />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-mono text-slate-500">{a.id}</span>
                                      <span className="text-xs text-slate-500">•</span>
                                      <span className="text-xs text-slate-400">{a.source ?? '—'}</span>
                                    </div>
                                    <div className="text-sm text-slate-200 truncate">{a.title}</div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-slate-400 hover:text-slate-200"
                                      onClick={() => {
                                        setSelectedAlert({
                                          id: a.id,
                                          type: a.type,
                                          title: a.title,
                                          description: a.description ?? '',
                                          source: a.source ?? '',
                                          createdAt: a.createdAt,
                                        });
                                        setDetailOpen(true);
                                      }}
                                    >
                                      Détail
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-slate-400 hover:text-slate-200"
                                      onClick={() => {
                                        setSelectedAlert({
                                          id: a.id,
                                          type: a.type,
                                          title: a.title,
                                          description: a.description ?? '',
                                          source: a.source ?? '',
                                          createdAt: a.createdAt,
                                        });
                                        setAckOpen(true);
                                      }}
                                    >
                                      Acquitter
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Gouvernance */}
                <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-6">
                  <h3 className="text-lg font-semibold text-slate-200 mb-3">
                    Gouvernance d&apos;exploitation
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-900/50">
                      <div className="font-medium text-slate-200 mb-2">Rafraîchissement</div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-500">Auto-refresh</div>
                        <button
                          type="button"
                          onClick={() => setAutoRefresh((p) => !p)}
                          className={cn(
                            'px-3 py-1.5 rounded-lg border text-sm transition-colors',
                            autoRefresh
                              ? 'border-slate-700/50 bg-slate-800/50 text-slate-200'
                              : 'border-slate-700 hover:bg-slate-800 text-slate-400'
                          )}
                        >
                          {autoRefresh ? 'ON' : 'OFF'}
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-900/50">
                      <div className="font-medium text-slate-200 mb-2">Exports & preuves</div>
                      <div className="grid gap-2">
                        <button
                          type="button"
                          onClick={() => setShowExport(true)}
                          className="px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors text-sm text-slate-300 inline-flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Exporter
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowStats(true)}
                          className="px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors text-sm text-slate-300 inline-flex items-center gap-2"
                        >
                          <BarChart3 className="w-4 h-4" />
                          Statistiques
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-900/50">
                      <div className="font-medium text-slate-200 mb-2">Accès rapide</div>
                      <div className="grid gap-2 text-sm text-slate-400">
                        <div className="flex items-center justify-between">
                          <span>Palette</span>
                          <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-xs border border-slate-700">⌘K</kbd>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Files 1..5</span>
                          <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-xs border border-slate-700">⌘1..5</kbd>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Pilotage</span>
                          <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-xs border border-slate-700">⌘B</kbd>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Astuce raccourcis */}
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
                  <div className="flex items-center gap-3">
                    <Keyboard className="w-5 h-5 text-slate-400" />
                    <p className="text-sm text-slate-400">
                      <strong className="text-slate-300">Astuce :</strong> utilise{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-xs font-mono">⌘1-5</kbd>{' '}
                      pour les files,{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-xs font-mono">⌘K</kbd>{' '}
                      pour la palette, et{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-xs font-mono">?</kbd>{' '}
                      pour l&apos;aide.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {tabs.length > 0 && <AlertWorkspaceTabs />}
                <AlertWorkspaceContent />
              </div>
            )}
          </div>
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">Màj: {refreshLabel}</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-600">{stats?.total ?? 0} alertes • {stats?.critical ?? 0} critiques • {stats?.resolved ?? 0} résolues</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className={cn('w-2 h-2 rounded-full', statsLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500')} />
              <span className="text-slate-500">{statsLoading ? 'Synchronisation...' : 'Connecté'}</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Workflow modals (API-backed) */}
      <AlertDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        alert={selectedAlert}
        onAcknowledge={() => setAckOpen(true)}
        onResolve={() => setResolveOpen(true)}
        onEscalate={() => setEscalateOpen(true)}
      />
      <AcknowledgeModal
        open={ackOpen}
        onClose={() => setAckOpen(false)}
        alert={selectedAlert}
        onConfirm={async (note) => {
          if (!selectedAlert?.id) return;
          try {
            await alertsAPI.acknowledge(String(selectedAlert.id), { note, userId: 'user-001' });
            toast.success('Alerte acquittée', 'Traçabilité enregistrée');
            refetchTimeline();
          } catch (e) {
            toast.error('Erreur', e instanceof Error ? e.message : 'Impossible d’acquitter');
          }
        }}
      />
      <ResolveModal
        open={resolveOpen}
        onClose={() => setResolveOpen(false)}
        alert={selectedAlert}
        onConfirm={async (resolution) => {
          if (!selectedAlert?.id) return;
          try {
            await alertsAPI.resolve(String(selectedAlert.id), {
              resolutionType: resolution.type,
              note: resolution.note,
              proof: resolution.proof,
              userId: 'user-001',
            });
            toast.success('Alerte résolue', 'Résolution tracée (audit-ready)');
            refetchTimeline();
          } catch (e) {
            toast.error('Erreur', e instanceof Error ? e.message : 'Impossible de résoudre');
          }
        }}
      />
      <EscalateModal
        open={escalateOpen}
        onClose={() => setEscalateOpen(false)}
        alert={selectedAlert}
        onConfirm={async (escalation) => {
          if (!selectedAlert?.id) return;
          try {
            await alertsAPI.escalate(String(selectedAlert.id), {
              escalateTo: escalation.to,
              reason: escalation.reason,
              priority: escalation.priority,
              userId: 'user-001',
            });
            toast.success('Escalade envoyée', 'Notification envoyée au destinataire');
            refetchTimeline();
          } catch (e) {
            toast.error('Erreur', e instanceof Error ? e.message : 'Impossible d’escalader');
          }
        }}
      />

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
            <h3 className="text-sm font-semibold text-slate-200 mb-2">Navigation</h3>
            <div className="space-y-2">
              <ShortcutRow shortcut="⌘1" description="Alertes critiques" />
              <ShortcutRow shortcut="⌘2" description="Avertissements" />
              <ShortcutRow shortcut="⌘3" description="Dossiers bloqués" />
              <ShortcutRow shortcut="⌘4" description="SLA dépassés" />
              <ShortcutRow shortcut="⌘5" description="Alertes résolues" />
              <ShortcutRow shortcut="⌘K" description="Palette de commandes" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-2">Actions</h3>
            <div className="space-y-2">
              <ShortcutRow shortcut="⌘A" description="Ouvrir Analytics" />
              <ShortcutRow shortcut="⌘E" description="Exporter" />
              <ShortcutRow shortcut="⌘S" description="Statistiques" />
              <ShortcutRow shortcut="⌘B" description="Toggle panneau pilotage" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-2">Affichage</h3>
            <div className="space-y-2">
              <ShortcutRow shortcut="F11" description="Mode plein écran" />
              <ShortcutRow shortcut="?" description="Aide" />
              <ShortcutRow shortcut="Esc" description="Fermer modales" />
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
      <span className="text-slate-400">{description}</span>
      <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-xs border border-slate-700 text-slate-300">
        {shortcut}
      </kbd>
    </div>
  );
}
