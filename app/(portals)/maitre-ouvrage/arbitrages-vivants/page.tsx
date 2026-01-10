'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useArbitragesWorkspaceStore } from '@/lib/stores/arbitragesWorkspaceStore';

import { ArbitragesWorkspaceTabs } from '@/components/features/arbitrages/workspace/ArbitragesWorkspaceTabs';
import { ArbitragesWorkspaceContent } from '@/components/features/arbitrages/workspace/ArbitragesWorkspaceContent';
import { ArbitragesCommandPalette } from '@/components/features/arbitrages/workspace/ArbitragesCommandPalette';
import { ArbitragesDirectionPanel } from '@/components/features/arbitrages/workspace/ArbitragesDirectionPanel';
import { ArbitragesAlertsBanner } from '@/components/features/arbitrages/workspace/ArbitragesAlertsBanner';
import { ArbitragesLiveCounters } from '@/components/features/arbitrages/workspace/ArbitragesLiveCounters';
import { ArbitragesStatsModal } from '@/components/features/arbitrages/workspace/ArbitragesStatsModal';
import { ArbitragesTimeline } from '@/components/features/arbitrages/workspace/ArbitragesTimeline';
import { ArbitragesNotifications } from '@/components/features/arbitrages/workspace/ArbitragesNotifications';
import { ArbitragestoastProvider, useArbitragestoast } from '@/components/features/arbitrages/workspace/ArbitragesToast';

import { WorkspaceShell, type ShellAction, type ShellBadge } from '@/components/features/workspace/WorkspaceShell';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';

import {
  Scale,
  HelpCircle,
  RefreshCw,
  Download,
  Plus,
  BarChart3,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Shield,
  Activity,
  Maximize,
  Minimize,
  Keyboard,
  LayoutGrid,
  Zap,
  TrendingUp,
  ChevronRight,
  Star,
  StarOff,
  History,
  Bell,
  Command,
  Filter,
  Settings,
  Eye,
  FileText,
  Workflow,
  Brain,
  Users,
  Calendar,
  PanelRightOpen,
  PanelRightClose,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ================================
// Types
// ================================

type ArbitrageStats = {
  total: number;
  ouverts: number;
  tranches: number;
  critiques: number;
  enRetard: number;
  expositionTotale: number;
  simplesPending: number;
  simplesResolved: number;
  simplesUrgent: number;
  bureauxSurcharge: number;
  totalGoulots: number;
  byBureau?: { bureau: string; count: number; critiques: number }[];
  byType?: { type: string; count: number }[];
  trends?: { daily: number; weekly: number; monthly: number };
  avgResolutionTime?: number;
  ts: string;
};

type EscaladeItem = {
  id: string;
  subject: string;
  riskLevel: 'critique' | 'eleve' | 'modere' | 'faible';
  daysOverdue: number;
  exposure: number;
  score: number;
};

type ExportFormat = 'csv' | 'json' | 'pdf';
type ExportQueue = 'all' | 'ouverts' | 'critiques' | 'urgents' | 'tranches';

type Mode = 'dashboard' | 'workspace';
type DashboardTab = 'overview' | 'bureaux' | 'timeline' | 'favorites';

type UIPrefs = {
  mode: Mode;
  dashboardTab: DashboardTab;
  fullscreen: boolean;
  autoRefresh: boolean;
  refreshMs: number;
  showSidebar: boolean;
};

type PinnedArbitrage = {
  id: string;
  subject: string;
  riskLevel: string;
  pinnedAt: string;
};

const UI_PREF_KEY = 'bmo.arbitrages.ui.v2';
const PINNED_KEY = 'bmo.arbitrages.pinned.v1';
const DEFAULT_REFRESH_MS = 60_000;

// ================================
// Helpers
// ================================

function ignoreIfTyping(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null;
  const tag = t?.tagName?.toLowerCase();
  if (t?.isContentEditable) return true;
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
  return false;
}

function readUIPrefs(): UIPrefs | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(UI_PREF_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<UIPrefs>;
    return {
      mode: p.mode === 'workspace' ? 'workspace' : 'dashboard',
      dashboardTab: ['overview', 'bureaux', 'timeline', 'favorites'].includes(p.dashboardTab || '') 
        ? p.dashboardTab as DashboardTab 
        : 'overview',
      fullscreen: typeof p.fullscreen === 'boolean' ? p.fullscreen : false,
      autoRefresh: typeof p.autoRefresh === 'boolean' ? p.autoRefresh : true,
      refreshMs: typeof p.refreshMs === 'number' && p.refreshMs >= 15_000 ? p.refreshMs : DEFAULT_REFRESH_MS,
      showSidebar: typeof p.showSidebar === 'boolean' ? p.showSidebar : true,
    };
  } catch {
    return null;
  }
}

function writeUIPrefs(p: UIPrefs) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(UI_PREF_KEY, JSON.stringify(p));
  } catch {
    // no-op
  }
}

function readPinnedArbitrages(): PinnedArbitrage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PINNED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(x => x && typeof x === 'object' && x.id).slice(0, 20);
  } catch {
    return [];
  }
}

function writePinnedArbitrages(items: PinnedArbitrage[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PINNED_KEY, JSON.stringify(items.slice(0, 20)));
  } catch {
    // no-op
  }
}

function formatMoney(v: number) {
  try {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(v);
  } catch {
    return `${Math.round(v)} FCFA`;
  }
}

function safeFRTime(isoOrDate?: string): string {
  if (!isoOrDate) return '—';
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('fr-FR');
}

function useInterval(fn: () => void, delay: number | null): void {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  }, [fn]);
  useEffect(() => {
    if (delay === null) return;
    const id = window.setInterval(() => ref.current(), delay);
    return () => window.clearInterval(id);
  }, [delay]);
}

// ================================
// Helper UI components
// ================================

const ActionLabel = ({
  icon,
  text,
  right,
}: {
  icon?: React.ReactNode;
  text: React.ReactNode;
  right?: React.ReactNode;
}) => (
  <span className="inline-flex items-center gap-2 whitespace-nowrap leading-none">
    {icon}
    <span className="leading-none">{text}</span>
    {right}
  </span>
);

const CountChip = ({ v }: { v: number }) => (
  <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white/10 dark:bg-black/20 border border-slate-200/20 dark:border-slate-700/40">
    {v}
  </span>
);

const Chip = ({ children, tone = 'slate' }: { children: React.ReactNode; tone?: 'slate' | 'orange' | 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' }) => {
  const tones: Record<string, string> = {
    slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-200/40 dark:border-slate-700/50',
    orange: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20',
    blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-800 dark:text-amber-200 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
    purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
  };
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border', tones[tone])}>
      {children}
    </span>
  );
};

function StatCard({
  icon,
  label,
  value,
  tone,
  hint,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: 'neutral' | 'amber' | 'rose' | 'emerald' | 'blue' | 'orange' | 'purple';
  onClick?: () => void;
}) {
  const toneCls =
    tone === 'rose'
      ? 'bg-rose-50 dark:bg-rose-900/20'
      : tone === 'amber'
        ? 'bg-amber-50 dark:bg-amber-900/20'
        : tone === 'emerald'
          ? 'bg-emerald-50 dark:bg-emerald-900/20'
          : tone === 'blue'
            ? 'bg-blue-50 dark:bg-blue-900/20'
            : tone === 'orange'
              ? 'bg-orange-50 dark:bg-orange-900/20'
              : tone === 'purple'
                ? 'bg-purple-50 dark:bg-purple-900/20'
                : 'bg-slate-50 dark:bg-slate-900/30';

  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      className={cn(
        'p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-left transition-all',
        toneCls,
        onClick && 'hover:scale-[1.02] hover:shadow-md cursor-pointer'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
        <span className="shrink-0">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</div>}
    </Wrapper>
  );
}

function ShortcutRow({ shortcut, label }: { shortcut: string; label: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-slate-600 dark:text-slate-400">{label}</span>
      <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs border border-slate-300 dark:border-slate-700">
        {shortcut}
      </kbd>
    </div>
  );
}

const IconButton = ({
  title,
  onClick,
  children,
  className,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={cn(
      'p-2 rounded-xl border transition-colors',
      'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800',
      className
    )}
    title={title}
    type="button"
  >
    {children}
  </button>
);

// ================================
// Rail d'escalade (Top 5 décisions critiques)
// ================================

function EscaladeRail({
  items,
  onOpenArbitrage,
  onPinArbitrage,
  pinnedIds,
}: {
  items: EscaladeItem[];
  onOpenArbitrage: (id: string, subject: string) => void;
  onPinArbitrage?: (item: EscaladeItem) => void;
  pinnedIds?: string[];
}) {
  if (items.length === 0) return null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critique':
        return 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30';
      case 'eleve':
        return 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30';
      case 'modere':
        return 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-50/50 to-orange-50/50 dark:from-rose-900/10 dark:to-orange-900/10 dark:border-rose-800/50 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-rose-500/20">
          <Zap className="w-5 h-5 text-rose-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-rose-800 dark:text-rose-200">Rail d'escalade</h3>
          <p className="text-xs text-rose-600/80 dark:text-rose-400/80">
            Top 5 décisions à trancher (criticité × retard × exposition)
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => {
          const isPinned = pinnedIds?.includes(item.id);
          return (
            <div
              key={item.id}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 transition-all group"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 font-bold text-sm">
                #{idx + 1}
              </div>
              <button
                onClick={() => onOpenArbitrage(item.id, item.subject)}
                className="flex-1 text-left min-w-0"
              >
                <div className="font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  {item.subject}
                </div>
                <div className="flex items-center gap-2 text-xs mt-1">
                  <span className={cn('px-2 py-0.5 rounded-full border', getRiskColor(item.riskLevel))}>
                    {item.riskLevel}
                  </span>
                  {item.daysOverdue > 0 && (
                    <span className="text-rose-600 dark:text-rose-400">+{item.daysOverdue}j retard</span>
                  )}
                  <span className="text-amber-600 dark:text-amber-400">{formatMoney(item.exposure)}</span>
                </div>
              </button>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs text-slate-500">Score</div>
                  <div className="font-bold text-rose-600">{item.score}</div>
                </div>
                {onPinArbitrage && (
                  <button
                    onClick={() => onPinArbitrage(item)}
                    className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                    title={isPinned ? 'Déjà épinglé' : 'Épingler'}
                  >
                    {isPinned ? (
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ) : (
                      <Star className="w-4 h-4 text-slate-400 group-hover:text-amber-500" />
                    )}
                  </button>
                )}
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ================================
// Main Component Content
// ================================

function ArbitragesVivantsPageContent() {
  const { tabs, openTab } = useArbitragesWorkspaceStore();
  const toast = useArbitragestoast();

  // UI State
  const [mode, setMode] = useState<Mode>('dashboard');
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('overview');
  const [fullscreen, setFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // Stats
  const [statsOpen, setStatsOpen] = useState(false);
  const [statsData, setStatsData] = useState<ArbitrageStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Escalade rail
  const [escaladeItems, setEscaladeItems] = useState<EscaladeItem[]>([]);

  // Auto refresh
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshMs, setRefreshMs] = useState<number>(DEFAULT_REFRESH_MS);

  // Help
  const [helpOpen, setHelpOpen] = useState(false);

  // Export
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [exportQueue, setExportQueue] = useState<ExportQueue>('all');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Timeline
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [timelineArbitrageId, setTimelineArbitrageId] = useState<string | undefined>(undefined);

  // Pinned (Watchlist)
  const [pinned, setPinned] = useState<PinnedArbitrage[]>([]);

  // Abort controllers
  const abortStatsRef = useRef<AbortController | null>(null);
  const abortExportRef = useRef<AbortController | null>(null);

  const hasTabs = tabs.length > 0;
  const showDashboard = mode === 'dashboard' && !hasTabs;

  // ----------------
  // Init prefs
  // ----------------
  useEffect(() => {
    const p = readUIPrefs();
    if (p) {
      setMode(p.mode);
      setDashboardTab(p.dashboardTab);
      setFullscreen(p.fullscreen);
      setAutoRefresh(p.autoRefresh);
      setRefreshMs(p.refreshMs);
      setShowSidebar(p.showSidebar);
    }
    setPinned(readPinnedArbitrages());
  }, []);

  useEffect(() => {
    writeUIPrefs({ mode, dashboardTab, fullscreen, autoRefresh, refreshMs, showSidebar });
  }, [mode, dashboardTab, fullscreen, autoRefresh, refreshMs, showSidebar]);

  useEffect(() => {
    writePinnedArbitrages(pinned);
  }, [pinned]);

  // Fullscreen: lock scroll
  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [fullscreen]);

  // ----------------
  // Helpers open tabs
  // ----------------
  const openInbox = useCallback(
    (queue: string, title: string, icon: string, type: 'arbitrages' | 'bureaux') => {
      openTab({
        id: `inbox:${queue}`,
        type: 'inbox',
        title,
        icon,
        data: { queue, type },
      });
      if (mode === 'dashboard') setMode('workspace');
    },
    [openTab, mode]
  );

  const openArbitrage = useCallback(
    (id: string, subject: string) => {
      openTab({
        id: `arbitrage:${id}`,
        type: 'arbitrage',
        title: subject,
        icon: '⚖️',
        data: { arbitrageId: id },
      });
      if (mode === 'dashboard') setMode('workspace');
    },
    [openTab, mode]
  );

  const openCreateWizard = useCallback(() => {
    openTab({
      id: `wizard:create:${Date.now()}`,
      type: 'wizard',
      title: 'Nouvel arbitrage',
      icon: '➕',
      data: { action: 'create' },
    });
    if (mode === 'dashboard') setMode('workspace');
  }, [openTab, mode]);

  // ----------------
  // Pin/unpin arbitrages
  // ----------------
  const pinArbitrage = useCallback((item: { id: string; subject: string; riskLevel: string }) => {
    setPinned((prev) => {
      const exists = prev.some((p) => p.id === item.id);
      if (exists) return prev;
      const next = [{ ...item, pinnedAt: new Date().toISOString() }, ...prev];
      return next.slice(0, 20);
    });
    toast.success('Épinglé', `${item.subject} ajouté à la watchlist`);
  }, [toast]);

  const unpinArbitrage = useCallback((id: string) => {
    setPinned((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ----------------
  // Load stats (robuste + abort)
  // ----------------
  const loadStats = useCallback(async (reason: 'init' | 'manual' | 'auto' = 'manual') => {
    abortStatsRef.current?.abort();
    const ac = new AbortController();
    abortStatsRef.current = ac;

    setStatsLoading(true);
    setStatsError(null);

    try {
      const res = await fetch('/api/arbitrages/stats', { cache: 'no-store', signal: ac.signal });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = (await res.json()) as ArbitrageStats;
      setStatsData(data);
      setLastUpdated(new Date().toISOString());

      if (reason === 'manual') {
        toast.success('Données actualisées', `${data.total} arbitrages au total`);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      setStatsError('Impossible de charger les statistiques');
      if (reason === 'manual') {
        toast.error('Erreur', 'Impossible de charger les statistiques');
      }
    } finally {
      setStatsLoading(false);
    }
  }, [toast]);

  // Load escalade items
  const loadEscalade = useCallback(async () => {
    try {
      const res = await fetch('/api/arbitrages/escalade', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setEscaladeItems(data.items || []);
      }
    } catch {
      // Silent fail
    }
  }, []);

  // Load at mount
  useEffect(() => {
    loadStats('init');
    loadEscalade();
    return () => {
      abortStatsRef.current?.abort();
      abortExportRef.current?.abort();
    };
  }, [loadStats, loadEscalade]);

  // Auto refresh with visibility check
  useInterval(
    () => {
      if (!autoRefresh) return;
      if (document.visibilityState === 'hidden') return;
      if (!showDashboard && !statsOpen) return;
      loadStats('auto');
      loadEscalade();
    },
    autoRefresh ? refreshMs : null
  );

  // Custom events (external triggers)
  useEffect(() => {
    const handleOpenStats = () => setStatsOpen(true);
    const handleOpenExport = () => setExportOpen(true);
    const handleOpenHelp = () => setHelpOpen(true);
    const handleOpenTimeline = (e: CustomEvent) => {
      setTimelineArbitrageId(e.detail?.arbitrageId);
      setTimelineOpen(true);
    };

    window.addEventListener('arbitrages:open-stats', handleOpenStats);
    window.addEventListener('arbitrages:open-export', handleOpenExport);
    window.addEventListener('arbitrages:open-help', handleOpenHelp);
    window.addEventListener('arbitrages:open-timeline', handleOpenTimeline as EventListener);

    return () => {
      window.removeEventListener('arbitrages:open-stats', handleOpenStats);
      window.removeEventListener('arbitrages:open-export', handleOpenExport);
      window.removeEventListener('arbitrages:open-help', handleOpenHelp);
      window.removeEventListener('arbitrages:open-timeline', handleOpenTimeline as EventListener);
    };
  }, []);

  // ----------------
  // Keyboard shortcuts (Ctrl/⌘)
  // ----------------
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (ignoreIfTyping(e)) return;

      const mod = e.ctrlKey || e.metaKey;

      // Ctrl/⌘ + K : palette de commandes
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('arbitrages:open-command-palette'));
        return;
      }

      // Ctrl/⌘ + N : create wizard
      if (mod && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        openCreateWizard();
        return;
      }

      // Ctrl/⌘ + S : stats
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setStatsOpen(true);
        return;
      }

      // Ctrl/⌘ + E : export
      if (mod && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setExportOpen(true);
        return;
      }

      // Ctrl/⌘ + T : timeline
      if (mod && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setTimelineArbitrageId(undefined);
        setTimelineOpen(true);
        return;
      }

      // Ctrl/⌘ + B : toggle sidebar
      if (mod && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setShowSidebar((p) => !p);
        return;
      }

      // Ctrl/⌘ + 1..4 : queues
      if (mod && !e.shiftKey && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        if (e.key === '1') openInbox('ouverts', 'Ouverts', '⏳', 'arbitrages');
        if (e.key === '2') openInbox('critiques', 'Critiques', '🚨', 'arbitrages');
        if (e.key === '3') openInbox('urgents', 'Urgents', '⏰', 'arbitrages');
        if (e.key === '4') openInbox('tranches', 'Tranchés', '✅', 'arbitrages');
        return;
      }

      // F11 or Ctrl/⌘+Shift+F : fullscreen
      if (e.key === 'F11' || (mod && e.shiftKey && e.key.toLowerCase() === 'f')) {
        e.preventDefault();
        setFullscreen((p) => !p);
        return;
      }

      // ? : help
      if (e.key === '?' && !mod) {
        e.preventDefault();
        setHelpOpen(true);
        return;
      }

      // Esc : close all
      if (e.key === 'Escape') {
        e.preventDefault();
        setStatsOpen(false);
        setExportOpen(false);
        setHelpOpen(false);
        setTimelineOpen(false);
        if (fullscreen) setFullscreen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openInbox, openCreateWizard, fullscreen]);

  // ----------------
  // Export handler
  // ----------------
  const handleExport = useCallback(async () => {
    abortExportRef.current?.abort();
    const ac = new AbortController();
    abortExportRef.current = ac;

    setExporting(true);
    setExportError(null);
    try {
      const url = `/api/arbitrages/export?format=${exportFormat}&queue=${exportQueue}`;
      const w = window.open(url, '_blank', 'noopener,noreferrer');
      w?.focus();
      setExportOpen(false);
      toast.success('Export lancé', `Format: ${exportFormat.toUpperCase()}`);
    } catch {
      setExportError("Erreur lors de l'export");
      toast.error('Export échoué', "Impossible d'exporter les données");
    } finally {
      setExporting(false);
    }
  }, [exportFormat, exportQueue, toast]);

  // ----------------
  // Badges & Actions
  // ----------------
  const riskBadge = useMemo(() => {
    if (!statsData) return null;
    const riskScore = (statsData.critiques || 0) * 3 + (statsData.simplesUrgent || 0) * 2 + (statsData.enRetard || 0);
    
    if (riskScore >= 15) return { label: 'Risque élevé', color: 'rose' as const };
    if (riskScore >= 5) return { label: 'Risque modéré', color: 'amber' as const };
    return { label: 'Risque maîtrisé', color: 'emerald' as const };
  }, [statsData]);

  const badges = useMemo<ShellBadge[]>(() => {
    const b: ShellBadge[] = [{ label: 'v2.2', color: 'blue' }];

    if (autoRefresh) b.push({ label: `Auto ${Math.round(refreshMs / 1000)}s`, color: 'slate' });

    if (statsData) {
      if (statsData.critiques > 0)
        b.push({ label: `${statsData.critiques} critique${statsData.critiques > 1 ? 's' : ''}`, color: 'rose' });
      if (statsData.simplesUrgent > 0)
        b.push({ label: `${statsData.simplesUrgent} urgent${statsData.simplesUrgent > 1 ? 's' : ''}`, color: 'amber' });
      if (statsData.bureauxSurcharge > 0)
        b.push({
          label: `${statsData.bureauxSurcharge} bureau${statsData.bureauxSurcharge > 1 ? 'x' : ''} surcharge`,
          color: 'rose',
        });
    }

    if (riskBadge) b.push(riskBadge);
    if (lastUpdated) b.push({ label: `MAJ ${safeFRTime(lastUpdated)}`, color: 'slate' });

    return b;
  }, [statsData, autoRefresh, refreshMs, riskBadge, lastUpdated]);

  const actions = useMemo<ShellAction[]>(() => {
    const n = statsData ?? {
      ouverts: 0,
      critiques: 0,
      simplesUrgent: 0,
      tranches: 0,
      bureauxSurcharge: 0,
    };

    return [
      {
        id: 'new',
        label: <ActionLabel icon={<Plus className="w-4 h-4" />} text="Nouveau" />,
        variant: 'primary',
        title: 'Créer un nouvel arbitrage (Ctrl/⌘+N)',
        onClick: openCreateWizard,
      },
      {
        id: 'mode',
        label: <ActionLabel icon={<LayoutGrid className="w-4 h-4" />} text={showDashboard ? 'Workspace' : 'Dashboard'} />,
        variant: 'secondary',
        title: 'Basculer Dashboard / Workspace',
        onClick: () => setMode((p) => (p === 'dashboard' ? 'workspace' : 'dashboard')),
      },
      {
        id: 'fullscreen',
        label: fullscreen ? (
          <ActionLabel icon={<Minimize className="w-4 h-4" />} text="Écran" />
        ) : (
          <ActionLabel icon={<Maximize className="w-4 h-4" />} text="Écran" />
        ),
        variant: 'secondary',
        title: 'Plein écran (F11)',
        onClick: () => setFullscreen((p) => !p),
      },

      {
        id: 'ouverts',
        label: <ActionLabel icon={<Clock className="w-4 h-4 text-amber-500" />} text="Ouverts" right={<CountChip v={n.ouverts} />} />,
        title: 'Arbitrages en cours (Ctrl/⌘+1)',
        onClick: () => openInbox('ouverts', 'Ouverts', '⏳', 'arbitrages'),
      },
      {
        id: 'critiques',
        label: <ActionLabel icon={<AlertTriangle className="w-4 h-4 text-red-500" />} text="Critiques" right={<CountChip v={n.critiques} />} />,
        variant: n.critiques > 0 ? 'destructive' : undefined,
        title: 'Arbitrages critiques (Ctrl/⌘+2)',
        onClick: () => openInbox('critiques', 'Critiques', '🚨', 'arbitrages'),
      },
      {
        id: 'urgents',
        label: <ActionLabel icon={<Clock className="w-4 h-4 text-orange-500" />} text="Urgents" right={<CountChip v={n.simplesUrgent} />} />,
        variant: n.simplesUrgent > 0 ? 'warning' : undefined,
        title: 'Arbitrages urgents (Ctrl/⌘+3)',
        onClick: () => openInbox('urgents', 'Urgents', '⏰', 'arbitrages'),
      },
      {
        id: 'tranches',
        label: <ActionLabel icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} text="Tranchés" right={<CountChip v={n.tranches} />} />,
        title: 'Arbitrages tranchés (Ctrl/⌘+4)',
        onClick: () => openInbox('tranches', 'Tranchés', '✅', 'arbitrages'),
      },
      {
        id: 'bureaux',
        label: <ActionLabel icon={<Building2 className="w-4 h-4 text-blue-500" />} text="Bureaux" right={<CountChip v={n.bureauxSurcharge} />} />,
        variant: n.bureauxSurcharge > 0 ? 'warning' : undefined,
        title: 'Bureaux de gouvernance',
        onClick: () => openInbox('all', 'Tous les bureaux', '🏢', 'bureaux'),
      },

      {
        id: 'timeline',
        label: <ActionLabel icon={<History className="w-4 h-4" />} text="Timeline" />,
        title: 'Historique global (Ctrl/⌘+T)',
        onClick: () => {
          setTimelineArbitrageId(undefined);
          setTimelineOpen(true);
        },
      },
      {
        id: 'stats',
        label: <ActionLabel icon={<BarChart3 className="w-4 h-4" />} text="Stats" />,
        title: 'Voir les statistiques (Ctrl/⌘+S)',
        onClick: () => setStatsOpen(true),
      },
      {
        id: 'export',
        label: <ActionLabel icon={<Download className="w-4 h-4" />} text="Export" />,
        title: 'Exporter les données (Ctrl/⌘+E)',
        onClick: () => setExportOpen(true),
      },
      {
        id: 'refresh',
        label: <ActionLabel icon={<RefreshCw className={cn('w-4 h-4', statsLoading && 'animate-spin')} />} text="" />,
        title: 'Rafraîchir les données',
        onClick: () => {
          loadStats('manual');
          loadEscalade();
        },
        disabled: statsLoading,
      },
      {
        id: 'help',
        label: <ActionLabel icon={<HelpCircle className="w-4 h-4" />} text="" />,
        title: 'Aide et raccourcis clavier (?)',
        onClick: () => setHelpOpen(true),
      },
    ];
  }, [statsData, openInbox, openCreateWizard, statsLoading, loadStats, loadEscalade, showDashboard, fullscreen]);

  // ----------------
  // Banner
  // ----------------
  const banner = useMemo(() => {
    if (!statsData) return null;
    if (statsData.critiques === 0 && statsData.simplesUrgent === 0 && statsData.bureauxSurcharge === 0) return null;
    return <ArbitragesAlertsBanner />;
  }, [statsData]);

  // ----------------
  // Dashboard tabs
  // ----------------
  const dashboardTabs = useMemo(
    () => [
      { id: 'overview' as DashboardTab, label: "Vue d'ensemble", icon: LayoutGrid },
      { id: 'bureaux' as DashboardTab, label: 'Bureaux', icon: Building2 },
      { id: 'timeline' as DashboardTab, label: 'Historique', icon: History },
      { id: 'favorites' as DashboardTab, label: 'Watchlist', icon: Star },
    ],
    []
  );

  // ----------------
  // Dashboard (6 blocs + Rail escalade + Sidebar)
  // ----------------
  const dashboard = useMemo(() => {
    const s = statsData;

    return (
      <div className="flex gap-4">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Dashboard tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-4">
            {dashboardTabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setDashboardTab(t.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    dashboardTab === t.id
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                  type="button"
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
            
            <div className="flex-1" />

            {/* Quick search */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('arbitrages:open-command-palette'))}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Ctrl/⌘+K"
            >
              <Command className="w-4 h-4" />
              <span className="text-slate-500">Rechercher…</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-xs font-mono">⌘K</kbd>
            </button>
          </div>

          {/* ===== OVERVIEW TAB ===== */}
          {dashboardTab === 'overview' && (
            <div className="space-y-6">
              {/* Bloc 1 — Intro / posture */}
              <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-red-500/5 to-orange-500/5 dark:border-slate-800 dark:bg-[#1f1f1f]/70 p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-3">
                      <Scale className="w-7 h-7 text-red-500" />
                      Console métier — Arbitrages & Gouvernance
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-3xl">
                      Vue synthèse (risques + goulots + charge) et accès instantané aux files "Ouverts / Critiques / Urgents /
                      Tranchés". Chaque arbitrage est pensé comme une décision :{' '}
                      <strong>priorité → responsable → délai → preuve</strong>.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Chip tone="rose">
                        <Zap className="w-3.5 h-3.5" />
                        Cellule de crise
                      </Chip>
                      <Chip tone="amber">
                        <Clock className="w-3.5 h-3.5" />
                        SLA décisionnel
                      </Chip>
                      <Chip tone="emerald">
                        <Shield className="w-3.5 h-3.5" />
                        Audit & traçabilité
                      </Chip>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <FluentButton variant="primary" onClick={openCreateWizard}>
                      <Plus className="w-4 h-4 mr-1" />
                      Nouvel arbitrage
                    </FluentButton>
                    <FluentButton variant="secondary" onClick={() => setMode('workspace')}>
                      Aller au workspace
                    </FluentButton>
                  </div>
                </div>
              </div>

              {/* Bloc 2 — Compteurs live */}
              <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Compteurs live
                  </h3>
                  <div className="text-xs text-slate-500">
                    Raccourcis :{' '}
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono">⌘1..4</kbd> files,{' '}
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono">⌘N</kbd> nouveau,{' '}
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono">⌘K</kbd> palette.
                  </div>
                </div>
                <ArbitragesLiveCounters />
              </div>

              {/* Bloc 3 — Synthèse risques (cards) */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                  icon={<Clock className="w-4 h-4 text-amber-600" />}
                  label="Ouverts"
                  value={s ? s.ouverts : '—'}
                  tone="amber"
                  hint="Décisions en cours (à piloter)"
                  onClick={() => openInbox('ouverts', 'Ouverts', '⏳', 'arbitrages')}
                />
                <StatCard
                  icon={<AlertTriangle className="w-4 h-4 text-rose-600" />}
                  label="Critiques"
                  value={s ? s.critiques : '—'}
                  tone="rose"
                  hint="Risque élevé / blocage majeur"
                  onClick={() => openInbox('critiques', 'Critiques', '🚨', 'arbitrages')}
                />
                <StatCard
                  icon={<Shield className="w-4 h-4 text-orange-600" />}
                  label="Urgents"
                  value={s ? s.simplesUrgent : '—'}
                  tone="orange"
                  hint="À traiter dans la fenêtre SLA"
                  onClick={() => openInbox('urgents', 'Urgents', '⏰', 'arbitrages')}
                />
                <StatCard
                  icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  label="Tranchés"
                  value={s ? s.tranches : '—'}
                  tone="emerald"
                  hint="Décisions clôturées (traçables)"
                  onClick={() => openInbox('tranches', 'Tranchés', '✅', 'arbitrages')}
                />
              </div>

              {/* Bloc 4 — Rail d'escalade */}
              <EscaladeRail 
                items={escaladeItems} 
                onOpenArbitrage={openArbitrage} 
                onPinArbitrage={pinArbitrage}
                pinnedIds={pinned.map(p => p.id)}
              />

              {/* Bloc 5 — Direction / pilotage */}
              <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-indigo-500" />
                    Pilotage & Direction
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Activity className="w-4 h-4" />
                    {lastUpdated ? `MAJ ${safeFRTime(lastUpdated)}` : 'MAJ —'}
                  </div>
                </div>
                <ArbitragesDirectionPanel />
              </div>

              {/* Bloc 6 — Charge, goulots, exposition */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <StatCard
                  icon={<Clock className="w-4 h-4 text-rose-600" />}
                  label="En retard"
                  value={s ? s.enRetard : '—'}
                  tone="rose"
                  hint="Dépassements de délais / risques d'escalade"
                />
                <StatCard
                  icon={<Building2 className="w-4 h-4 text-blue-600" />}
                  label="Bureaux en surcharge"
                  value={s ? s.bureauxSurcharge : '—'}
                  tone="blue"
                  hint="Charge anormale / décisions concentrées"
                  onClick={() => openInbox('surcharge', 'Bureaux surcharge', '🔥', 'bureaux')}
                />
                <StatCard
                  icon={<TrendingUp className="w-4 h-4 text-purple-600" />}
                  label="Exposition totale"
                  value={s ? formatMoney(s.expositionTotale) : '—'}
                  tone="purple"
                  hint="Montant / impact cumulé"
                />
              </div>

              {/* Bloc 7 — Discipline (gouvernance) */}
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 dark:bg-purple-500/10">
                <div className="font-semibold text-purple-700 dark:text-purple-300">
                  Discipline de gouvernance (anti-&quot;décision fantôme&quot;)
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  Chaque arbitrage doit déboucher sur une décision traçable : responsable identifié, délai respecté,
                  et preuve documentée. Objectif : zéro blocage silencieux.
                </div>
              </div>

              {/* Bloc 8 — Aide & gouvernance (auto-refresh) */}
              <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30 p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <Keyboard className="w-5 h-5 text-slate-400" />
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      <strong>Astuce :</strong>{' '}
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-mono">?</kbd> ouvre
                      l'aide.
                      <span className="text-slate-500 dark:text-slate-400"> Esc ferme modales et plein écran.</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                      />
                      Auto-refresh
                    </label>

                    <select
                      className="rounded-xl border border-slate-200/70 bg-white/90 px-3 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      value={refreshMs}
                      onChange={(e) => setRefreshMs(Number(e.target.value))}
                      disabled={!autoRefresh}
                      aria-label="Intervalle d'auto-refresh"
                    >
                      <option value={30_000}>30s</option>
                      <option value={60_000}>60s</option>
                      <option value={120_000}>120s</option>
                    </select>

                    <FluentButton
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        loadStats('manual');
                        loadEscalade();
                      }}
                      disabled={statsLoading}
                    >
                      <RefreshCw className={cn('w-3.5 h-3.5 mr-1', statsLoading && 'animate-spin')} />
                      Rafraîchir
                    </FluentButton>

                    <FluentButton size="sm" variant="secondary" onClick={() => setHelpOpen(true)}>
                      Aide
                    </FluentButton>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== BUREAUX TAB ===== */}
          {dashboardTab === 'bureaux' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  Bureaux de gouvernance
                </h3>
                
                {s?.byBureau && s.byBureau.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {s.byBureau.map((bureau) => (
                      <button
                        key={bureau.bureau}
                        onClick={() => openInbox(`bureau:${bureau.bureau}`, bureau.bureau, '🏢', 'bureaux')}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{bureau.bureau}</span>
                          <span className="text-2xl font-bold">{bureau.count}</span>
                        </div>
                        {bureau.critiques > 0 && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-rose-600">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {bureau.critiques} critique{bureau.critiques > 1 ? 's' : ''}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-8">Aucun bureau trouvé</p>
                )}
              </div>

              {s?.byType && (
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-500" />
                    Répartition par type
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {s.byType.map((item) => (
                      <div
                        key={item.type}
                        className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20"
                      >
                        <span className="font-medium">{item.type}</span>
                        <span className="ml-2 text-purple-700 dark:text-purple-300">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== TIMELINE TAB ===== */}
          {dashboardTab === 'timeline' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-500" />
                    Historique global des arbitrages
                  </h3>
                  <FluentButton 
                    size="sm" 
                    variant="secondary"
                    onClick={() => {
                      setTimelineArbitrageId(undefined);
                      setTimelineOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Vue détaillée
                  </FluentButton>
                </div>
                <p className="text-slate-500 text-sm mb-4">
                  Suivez l'évolution de tous les arbitrages : créations, escalades, décisions, compléments...
                </p>
                <FluentButton 
                  variant="primary"
                  onClick={() => {
                    setTimelineArbitrageId(undefined);
                    setTimelineOpen(true);
                  }}
                >
                  Ouvrir la timeline complète
                </FluentButton>
              </div>

              {/* Tendances */}
              {s?.trends && (
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    Tendances
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {s.trends.daily >= 0 ? '+' : ''}{s.trends.daily}
                      </div>
                      <div className="text-xs text-slate-500">Aujourd&apos;hui</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {s.trends.weekly >= 0 ? '+' : ''}{s.trends.weekly}
                      </div>
                      <div className="text-xs text-slate-500">Cette semaine</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {s.trends.monthly >= 0 ? '+' : ''}{s.trends.monthly}
                      </div>
                      <div className="text-xs text-slate-500">Ce mois</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== FAVORITES/WATCHLIST TAB ===== */}
          {dashboardTab === 'favorites' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    Watchlist — Arbitrages épinglés ({pinned.length})
                  </h3>
                </div>
                
                {pinned.length === 0 ? (
                  <div className="text-center py-12">
                    <StarOff className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">Aucun arbitrage épinglé</p>
                    <p className="text-sm text-slate-400 mt-2">
                      Épinglez des arbitrages depuis le rail d'escalade pour les suivre ici.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pinned.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50"
                      >
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                        <button
                          onClick={() => openArbitrage(item.id, item.subject)}
                          className="flex-1 text-left min-w-0"
                        >
                          <div className="font-medium truncate hover:text-red-600 dark:hover:text-red-400 transition-colors">
                            {item.subject}
                          </div>
                          <div className="text-xs text-slate-500">
                            {item.riskLevel} • Épinglé {safeFRTime(item.pinnedAt)}
                          </div>
                        </button>
                        <button
                          onClick={() => unpinArbitrage(item.id)}
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="Retirer de la watchlist"
                        >
                          <StarOff className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Guide watchlist */}
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10 p-6">
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-3">
                  Guide de la Watchlist
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2 font-medium mb-1">
                      <Star className="w-4 h-4 text-amber-500" />
                      Épingler
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Marquez les arbitrages sensibles pour les retrouver rapidement.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2 font-medium mb-1">
                      <Eye className="w-4 h-4 text-blue-500" />
                      Surveiller
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Gardez un œil sur les décisions critiques ou bloquantes.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2 font-medium mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Clôturer
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Retirez de la watchlist une fois l'arbitrage tranché.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <aside className="hidden xl:flex flex-col w-[360px] shrink-0 gap-4">
            {/* Notifications */}
            <ArbitragesNotifications onOpenArbitrage={(id) => openArbitrage(id, `Arbitrage ${id}`)} />

            {/* Quick actions */}
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Actions rapides
              </h3>
              <div className="grid gap-2">
                <button
                  onClick={() => openInbox('ouverts', 'Ouverts', '⏳', 'arbitrages')}
                  className="w-full p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left hover:bg-amber-500/20 transition-colors"
                  type="button"
                >
                  <span className="font-medium">⏳ Arbitrages ouverts</span>
                  <div className="text-xs text-slate-500 mt-0.5">Décisions en attente</div>
                </button>
                <button
                  onClick={() => openInbox('critiques', 'Critiques', '🚨', 'arbitrages')}
                  className="w-full p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-left hover:bg-rose-500/20 transition-colors"
                  type="button"
                >
                  <span className="font-medium">🚨 Critiques</span>
                  <div className="text-xs text-slate-500 mt-0.5">Risque élevé / urgent</div>
                </button>
                <button
                  onClick={() => {
                    setTimelineArbitrageId(undefined);
                    setTimelineOpen(true);
                  }}
                  className="w-full p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-left hover:bg-blue-500/20 transition-colors"
                  type="button"
                >
                  <span className="font-medium">📜 Timeline</span>
                  <div className="text-xs text-slate-500 mt-0.5">Historique complet</div>
                </button>
              </div>
            </div>

            {/* Mini watchlist */}
            {pinned.length > 0 && (
              <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Watchlist ({pinned.length})
                </h3>
                <div className="space-y-2">
                  {pinned.slice(0, 3).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => openArbitrage(item.id, item.subject)}
                      className="w-full p-2 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm truncate"
                    >
                      <Star className="w-3 h-3 inline mr-2 text-amber-500 fill-amber-500" />
                      {item.subject}
                    </button>
                  ))}
                  {pinned.length > 3 && (
                    <button
                      onClick={() => setDashboardTab('favorites')}
                      className="w-full text-center text-xs text-blue-600 hover:underline py-1"
                    >
                      Voir tout ({pinned.length})
                    </button>
                  )}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
    );
  }, [
    statsData,
    escaladeItems,
    lastUpdated,
    autoRefresh,
    refreshMs,
    statsLoading,
    loadStats,
    loadEscalade,
    openCreateWizard,
    openInbox,
    openArbitrage,
    dashboardTab,
    dashboardTabs,
    pinned,
    pinArbitrage,
    unpinArbitrage,
    showSidebar,
  ]);

  // ----------------
  // Render
  // ----------------
  return (
    <>
      <div
        className={cn(
          'min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#0a0a0a] dark:via-[#141414] dark:to-[#0a0a0a]',
          fullscreen && 'fixed inset-0 z-50'
        )}
      >
        <WorkspaceShell
          icon={<Scale className="w-6 h-6 text-red-500" />}
          title="Console métier — Arbitrages & Gouvernance"
          subtitle="Cellules de crise immersives • Options IA • Chronomètre décisionnel • Registre + hash"
          badges={badges}
          actions={actions}
          actionSeparators={[2, 8, 11]}
          Banner={banner}
          Tabs={<ArbitragesWorkspaceTabs />}
          showDashboard={showDashboard}
          Dashboard={dashboard}
          Content={<ArbitragesWorkspaceContent />}
          FooterOverlays={<ArbitragesCommandPalette />}
        />
      </div>

      {/* ============================= */}
      {/* MODALES */}
      {/* ============================= */}

      {/* Stats Modal */}
      <ArbitragesStatsModal 
        open={statsOpen} 
        onClose={() => setStatsOpen(false)} 
      />

      {/* Timeline Modal */}
      <ArbitragesTimeline
        open={timelineOpen}
        onClose={() => setTimelineOpen(false)}
        arbitrageId={timelineArbitrageId}
      />

      {/* Export */}
      <FluentModal open={exportOpen} title="Exporter les arbitrages" onClose={() => setExportOpen(false)} maxWidth="xl">
        {exportError && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-300 text-sm mb-4">
            {exportError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-500 font-medium">File</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              value={exportQueue}
              onChange={(e) => setExportQueue(e.target.value as ExportQueue)}
            >
              <option value="all">Tous les arbitrages</option>
              <option value="ouverts">Ouverts</option>
              <option value="critiques">Critiques</option>
              <option value="urgents">Urgents</option>
              <option value="tranches">Tranchés</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-500 font-medium">Format</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
            >
              <option value="csv">CSV (Excel)</option>
              <option value="json">JSON (données structurées)</option>
              <option value="pdf">PDF (imprimable)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <FluentButton size="sm" variant="secondary" onClick={() => setExportOpen(false)} disabled={exporting}>
            Annuler
          </FluentButton>
          <FluentButton size="sm" variant="primary" onClick={handleExport} disabled={exporting}>
            <Download className="w-3.5 h-3.5 mr-1" />
            {exporting ? 'Export…' : 'Télécharger'}
          </FluentButton>
        </div>
      </FluentModal>

      {/* Aide */}
      <FluentModal open={helpOpen} title="Raccourcis clavier — Arbitrages" onClose={() => setHelpOpen(false)} maxWidth="2xl">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Navigation</h3>
            <div className="space-y-2">
              <ShortcutRow shortcut="Ctrl/⌘+1" label="Ouverts" />
              <ShortcutRow shortcut="Ctrl/⌘+2" label="Critiques" />
              <ShortcutRow shortcut="Ctrl/⌘+3" label="Urgents" />
              <ShortcutRow shortcut="Ctrl/⌘+4" label="Tranchés" />
              <ShortcutRow shortcut="Ctrl/⌘+K" label="Palette de commandes" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Actions</h3>
            <div className="space-y-2">
              <ShortcutRow shortcut="Ctrl/⌘+N" label="Nouvel arbitrage" />
              <ShortcutRow shortcut="Ctrl/⌘+S" label="Statistiques" />
              <ShortcutRow shortcut="Ctrl/⌘+E" label="Export" />
              <ShortcutRow shortcut="Ctrl/⌘+T" label="Timeline" />
              <ShortcutRow shortcut="Ctrl/⌘+B" label="Sidebar" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Affichage</h3>
            <div className="space-y-2">
              <ShortcutRow shortcut="F11" label="Plein écran" />
              <ShortcutRow shortcut="?" label="Aide" />
              <ShortcutRow shortcut="Esc" label="Fermer modales / plein écran" />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <FluentButton size="sm" variant="primary" onClick={() => setHelpOpen(false)}>
              Fermer
            </FluentButton>
          </div>
        </div>
      </FluentModal>
    </>
  );
}

// ================================
// Main Component with Provider
// ================================
export default function ArbitragesVivantsPage() {
  return (
    <ArbitragestoastProvider>
      <ArbitragesVivantsPageContent />
    </ArbitragestoastProvider>
  );
}
