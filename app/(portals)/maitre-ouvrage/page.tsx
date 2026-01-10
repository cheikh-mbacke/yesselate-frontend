'use client';

import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Logger } from '@/lib/services/logger';
import type { BlockedDossier } from '@/lib/types/bmo.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { KPICard } from '@/components/features/bmo/KPICard';
import { DashboardCard } from '@/components/features/bmo/DashboardCard';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { TrendChart } from '@/components/features/bmo/TrendChart';
import { ComparisonWidget } from '@/components/features/bmo/ComparisonWidget';
import { PredictionWidget } from '@/components/features/bmo/PredictionWidget';
import { PerformanceHeatmap } from '@/components/features/bmo/PerformanceHeatmap';
import { AdvancedFilters } from '@/components/features/bmo/AdvancedFilters';
import { IntelligentInsightsWidget } from '@/components/features/bmo/IntelligentInsightsWidget';
import { PerformanceScoreWidget } from '@/components/features/bmo/PerformanceScoreWidget';
import { KPIDrillDown } from '@/components/features/bmo/KPIDrillDown';
import { NotificationCenter } from '@/components/features/bmo/NotificationCenter';
import { MultiBureauComparatorWidget } from '@/components/features/bmo/MultiBureauComparatorWidget';
import { AdvancedMetricsWidget } from '@/components/features/bmo/AdvancedMetricsWidget';
import { AnomalyDetectionWidget } from '@/components/features/bmo/AnomalyDetectionWidget';
import { AdvancedExportModal } from '@/components/features/bmo/AdvancedExportModal';
import { NarrativeReportWidget } from '@/components/features/bmo/NarrativeReportWidget';
import { CalendarWidget } from '@/components/features/bmo/CalendarWidget';
import { DashboardLayoutEditor } from '@/components/features/bmo/DashboardLayoutEditor';
import { FocusMode } from '@/components/features/bmo/FocusMode';
import { CollaborationWidget } from '@/components/features/bmo/CollaborationWidget';
import { PredictiveTimelineWidget } from '@/components/features/bmo/PredictiveTimelineWidget';
import { KeyboardShortcutsModal } from '@/components/features/bmo/KeyboardShortcutsModal';
import { EnhancedSearch } from '@/components/features/bmo/EnhancedSearch';
import { ThemeSelector } from '@/components/features/bmo/ThemeSelector';
import { ProactiveAlerts } from '@/components/features/bmo/ProactiveAlerts';
import { PresentationMode } from '@/components/features/bmo/PresentationMode';
import { LazySection } from '@/components/features/bmo/LazySection';
import { MobileOptimizations } from '@/components/features/bmo/MobileOptimizations';
import { TemporalComparison } from '@/components/features/bmo/TemporalComparison';
import { Download, LayoutGrid, LayoutList, Settings, GripVertical, Keyboard, Palette } from 'lucide-react';
import {
  performanceData,
  bureauPieData,
  systemAlerts,
  blockedDossiers,
  paymentsN1,
  contractsToSign,
  decisions,
  bureaux,
  bcToValidate,
  facturesRecues,
  avenants,
  financials,
} from '@/lib/data';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import { useAutoSyncCounts } from '@/hooks/useAutoSync';
import { WorkInbox } from '@/components/features/bmo/WorkInbox';
import { buildWorkInboxItems } from '@/lib/utils/work-inbox';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

type Period = 'month' | 'quarter' | 'year';

/* ---------------------------------------------
 * Utils "production grade"
 * ------------------------------------------- */

const STORAGE_KEYS = {
  pinnedBureaux: 'bmo.dashboard.pinnedBureaux.v1',
  snoozeSession: 'bmo.dashboard.snooze.v1',
  savedViews: 'bmo.dashboard.savedViews.v1',
  viewMode: 'bmo.dashboard.viewMode.v1',
  selectedBureaux: 'bmo.dashboard.selectedBureaux.v1',
  dashboardLayout: 'bmo.dashboard.layout.v1',
  focusMode: 'bmo.dashboard.focusMode.v1',
} as const;

// Constantes de configuration
const CONFIG = {
  RISK_THRESHOLDS: {
    BLOCKED_DAYS_WARNING: 3,
    BLOCKED_DAYS_CRITICAL: 5,
    PAYMENT_DAYS_URGENT: 5,
    CONTRACT_DAYS_WARNING: 7,
  },
  DISPLAY_LIMITS: {
    RISKS_MAX: 8,
    DECISIONS_PREVIEW: 5,
    DECISIONS_BASE: 12,
  },
  SNOOZE_TTL_MS: 2 * 60 * 60 * 1000, // 2 heures
  ANIMATION_DURATION_MS: 650,
  SEARCH_DEBOUNCE_MS: 300, // Debounce pour la recherche
  AUTO_REFRESH_INTERVAL_MS: 30000, // 30 secondes
} as const;

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const safeJsonParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();

const tokenize = (q: string) => normalize(q).split(/\s+/).filter(Boolean);

const includesAllTokens = (haystack: string, tokens: string[]) => {
  const h = normalize(haystack);
  return tokens.every((t) => h.includes(t));
};

// Date FR dd/mm/yyyy -> Date (midi UTC pour éviter DST edge-cases)
const parseFRDate = (str?: string | null): Date | null => {
  if (!str || str === '—') return null;

  // dd/mm/yyyy
  const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;

  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  if (!dd || !mm || !yyyy) return null;

  const utc = Date.UTC(yyyy, mm - 1, dd, 12, 0, 0);
  const d = new Date(utc);
  return Number.isNaN(d.getTime()) ? null : d;
};

const daysUntil = (date: Date | null): number | null => {
  if (!date) return null;

  const now = new Date();
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12, 0, 0);
  const targetUTC = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0);

  const diff = targetUTC - todayUTC;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const useReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mql) return;
    const onChange = () => setReduced(!!mql.matches);
    onChange();
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
};

function usePersistentArray(key: string, initial: string[]) {
  const [value, setValue] = useState<string[]>(initial);

  useEffect(() => {
    const raw = localStorage.getItem(key);
    const parsed = safeJsonParse<string[]>(raw, initial);
    setValue(Array.isArray(parsed) ? parsed : initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value]);

  return [value, setValue] as const;
}

// Snooze session avec TTL (ex: 2h)
type SnoozeState = {
  risks: Record<string, number>; // expiry timestamp
  actions: Record<string, number>;
};

const SNOOZE_TTL_MS = 2 * 60 * 60 * 1000;

function useSessionSnooze(key: string) {
  const [state, setState] = useState<SnoozeState>({ risks: {}, actions: {} });

  useEffect(() => {
    const raw = sessionStorage.getItem(key);
    const parsed = safeJsonParse<SnoozeState>(raw, { risks: {}, actions: {} });

    const now = Date.now();
    const clean = (map: Record<string, number>) => {
      const out: Record<string, number> = {};
      for (const [id, exp] of Object.entries(map || {})) {
        if (typeof exp === 'number' && exp > now) out[id] = exp;
      }
      return out;
    };

    setState({ risks: clean(parsed.risks), actions: clean(parsed.actions) });
  }, [key]);

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [key, state]);

  const snoozeRisk = useCallback((id: string) => {
    setState((prev) => ({ ...prev, risks: { ...prev.risks, [id]: Date.now() + CONFIG.SNOOZE_TTL_MS } }));
  }, []);

  const snoozeAction = useCallback((id: string) => {
    setState((prev) => ({ ...prev, actions: { ...prev.actions, [id]: Date.now() + SNOOZE_TTL_MS } }));
  }, []);

  const isRiskSnoozed = useCallback((id: string) => !!state.risks[id], [state.risks]);
  const isActionSnoozed = useCallback((id: string) => !!state.actions[id], [state.actions]);

  return { snoozeRisk, snoozeAction, isRiskSnoozed, isActionSnoozed };
}

function useHotkeys(map: (e: KeyboardEvent) => void) {
  useEffect(() => {
    window.addEventListener('keydown', map);
    return () => window.removeEventListener('keydown', map);
  }, [map]);
}

/* ---------------------------------------------
 * Risk Engine (le coeur de la "révolution")
 * ------------------------------------------- */

type RiskSeverity = 'critical' | 'warning' | 'watch';
type RiskKind = 'system_alert' | 'blocked_dossier' | 'payment_due' | 'contract_expiry';

type RiskItem = {
  id: string;
  kind: RiskKind;
  severity: RiskSeverity;
  score: number; // 0..100+
  title: string;
  detail: string;
  source: string; // bureau ou "Système"
  ctaLabel: string;
  ctaRoute: string;
  ctaParams?: Record<string, string>;
  explain: string; // pourquoi on te le montre
  payload?: unknown;
};

const severityScore = (s: RiskSeverity) => (s === 'critical' ? 3 : s === 'warning' ? 2 : 1);

const computeRiskScore = (r: Omit<RiskItem, 'score'>): number => {
  // scoring hybride : gravité + urgence + nature
  let base = severityScore(r.severity) * 25;

  if (r.kind === 'blocked_dossier') base += 20;
  if (r.kind === 'payment_due') base += 18;
  if (r.kind === 'contract_expiry') base += 12;
  if (r.kind === 'system_alert') base += 10;

  // petit boost si mention "5 jours", "urgent", "retard"
  const txt = `${r.title} ${r.detail} ${r.explain}`.toLowerCase();
  if (txt.includes('5')) base += 6;
  if (txt.includes('urgent')) base += 8;
  if (txt.includes('retard')) base += 10;

  return base;
};

// Note: L'ancien système "Next Best Actions" a été remplacé par WorkInbox (Command Center)
// Le code de planActions a été supprimé car il n'est plus utilisé

/* ---------------------------------------------
 * Page
 * ------------------------------------------- */

export default function DashboardPage() {
  const router = useRouter();
  const { darkMode } = useAppStore();
  const { liveStats, addToast, openSubstitutionModal, openBlocageModal } = useBMOStore();

  const reducedMotion = useReducedMotion();

  const [period, setPeriod] = useState<Period>('year');
  const [query, setQuery] = useState('');
  const [selectedBureaux, setSelectedBureaux] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'compact' | 'extended'>('extended');
  const [savedViews, setSavedViews] = useState<Array<{ id: string; name: string; filters: any }>>([]);
  const [selectedKPI, setSelectedKPI] = useState<{
    id: string;
    label: string;
    value: number | string;
    icon: string;
    color: string;
    trend?: string;
  } | null>(null);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'critical' | 'warning' | 'info' | 'success';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    action?: { label: string; route: string };
  }>>([]);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [layoutEditorOpen, setLayoutEditorOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [themeSelectorOpen, setThemeSelectorOpen] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [presentationSection, setPresentationSection] = useState(0);
  const [dashboardSections, setDashboardSections] = useState([
    { id: 'performance', label: 'Performance Globale', visible: true, order: 0 },
    { id: 'actions', label: 'Actions Prioritaires', visible: true, order: 1 },
    { id: 'risks', label: 'Risques & Santé', visible: true, order: 2 },
    { id: 'decisions', label: 'Décisions', visible: true, order: 3 },
    { id: 'realtime', label: 'Indicateurs Temps Réel', visible: true, order: 4 },
    { id: 'analytics', label: 'Analyses Avancées', visible: true, order: 5 },
  ]);
  // useDeferredValue pour différer les recalculs coûteux pendant la saisie
  const deferredQuery = useDeferredValue(query);
  const tokens = useMemo(() => tokenize(deferredQuery), [deferredQuery]);

  // WorkInbox items (Command Center) - memoized avec dépendances explicites pour réactivité
  const inboxItems = useMemo(() => {
    return buildWorkInboxItems({
      bcToValidate,
      facturesRecues,
      avenants,
      contractsToSign,
      financials,
    });
  }, [bcToValidate, facturesRecues, avenants, contractsToSign, financials]);

  const [cmdOpen, setCmdOpen] = useState(false);
  const [dismissBanner, setDismissBanner] = useState(false);
  const cmdModalRef = useRef<HTMLDivElement | null>(null);

  // Focus trap et gestion ESC pour la palette de commandes
  useEffect(() => {
    if (!cmdOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCmdOpen(false);
        searchRef.current?.focus();
      }
    };

    // Focus sur le premier élément focusable
    const firstFocusable = cmdModalRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [cmdOpen]);

  // pins persistés versionnés
  const [pinnedBureaux, setPinnedBureaux] = usePersistentArray(STORAGE_KEYS.pinnedBureaux, []);

  // snooze TTL (session)
  const { snoozeRisk, isRiskSnoozed } = useSessionSnooze(
    STORAGE_KEYS.snoozeSession
  );

  // refs
  const searchRef = useRef<HTMLInputElement | null>(null);
  const enhancedSearchRef = useRef<{ inputRef: React.RefObject<HTMLInputElement> } | null>(null);

  // Persistance navigation
  const { updateFilters, getFilters } = usePageNavigation('dashboard');

  // Charger les filtres sauvegardés
  useEffect(() => {
    try {
      const saved = getFilters?.();
      if (!saved) return;
      if (saved.period) setPeriod(saved.period);
      if (typeof saved.query === 'string') setQuery(saved.query);
    } catch {
      // silent
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sauvegarder les filtres
  useEffect(() => {
    try {
      updateFilters?.({
        period,
        query,
      });
    } catch {
      // silent
    }
  }, [period, query, updateFilters]);

  // Handler pour export
  const handleExport = useCallback(() => {
    setExportModalOpen(true);
  }, []);

  // hotkeys avancés
  useHotkeys(
    useCallback((e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const isModifier = e.metaKey || e.ctrlKey;

      // Ignorer si dans input/textarea (sauf Escape et /)
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName?.toLowerCase();
      if ((tag === 'input' || tag === 'textarea') && key !== 'escape' && key !== '/') {
        return;
      }

      // Cmd/Ctrl + K - Palette de commandes
      if (isModifier && key === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
        return;
      }

      // Cmd/Ctrl + ? - Aide raccourcis
      if (isModifier && key === '?') {
        e.preventDefault();
        setShortcutsModalOpen(true);
        return;
      }

      // Cmd/Ctrl + E - Export
      if (isModifier && key === 'e') {
        e.preventDefault();
        handleExport();
        return;
      }

      // Cmd/Ctrl + F - Focus mode
      if (isModifier && key === 'f') {
        e.preventDefault();
        setFocusMode((v) => {
          const newValue = !v;
          localStorage.setItem(STORAGE_KEYS.focusMode, String(newValue));
          return newValue;
        });
        return;
      }

      // Cmd/Ctrl + S - Sauvegarder vue
      if (isModifier && key === 's') {
        e.preventDefault();
        addToast('Vue sauvegardée', 'success');
        return;
      }

      // Cmd/Ctrl + P - Personnaliser layout
      if (isModifier && key === 'p') {
        e.preventDefault();
        setLayoutEditorOpen(true);
        return;
      }

      // Cmd/Ctrl + N - Notifications
      if (isModifier && key === 'n') {
        e.preventDefault();
        // Ouvrir notifications (à implémenter)
        return;
      }

      // Cmd/Ctrl + D - Toggle dark mode
      if (isModifier && key === 'd') {
        e.preventDefault();
        setThemeSelectorOpen(true);
        return;
      }

      // Cmd/Ctrl + V - Toggle view mode
      if (isModifier && key === 'v') {
        e.preventDefault();
        setViewMode((v) => (v === 'compact' ? 'extended' : 'compact'));
        return;
      }

      // F11 - Mode présentation
      if (key === 'f11') {
        e.preventDefault();
        setPresentationMode((v) => !v);
        return;
      }

      // Navigation sections (Ctrl + 1-6)
      if (isModifier && ['1', '2', '3', '4', '5', '6'].includes(key)) {
        e.preventDefault();
        const sectionIndex = parseInt(key) - 1;
        const sections = ['performance', 'actions', 'risks', 'decisions', 'realtime', 'analytics'];
        const sectionId = sections[sectionIndex];
        if (sectionId) {
          const element = document.querySelector(`[aria-label*="${sectionId}"]`) || 
                         document.querySelector(`section:nth-of-type(${sectionIndex + 1})`);
          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }

      // Navigation temporelle
      if (isModifier && key === 'arrowleft') {
        e.preventDefault();
        const periods: Period[] = ['month', 'quarter', 'year'];
        const currentIndex = periods.indexOf(period);
        if (currentIndex > 0) {
          setPeriod(periods[currentIndex - 1]);
        }
        return;
      }

      if (isModifier && key === 'arrowright') {
        e.preventDefault();
        const periods: Period[] = ['month', 'quarter', 'year'];
        const currentIndex = periods.indexOf(period);
        if (currentIndex < periods.length - 1) {
          setPeriod(periods[currentIndex + 1]);
        }
        return;
      }

      if (isModifier && key === 'home') {
        e.preventDefault();
        setPeriod('year');
        return;
      }

      // / focus search
      if (!isModifier && key === '/') {
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          enhancedSearchRef.current?.inputRef?.current?.focus();
        }
        return;
      }

      // Escape - Fermer modales
      if (key === 'escape') {
        setCmdOpen(false);
        setShortcutsModalOpen(false);
        setThemeSelectorOpen(false);
        setLayoutEditorOpen(false);
        setExportModalOpen(false);
        if (selectedKPI) setSelectedKPI(null);
      }
    }, [period, viewMode, selectedKPI, handleExport, addToast])
  );

  const buildUrl = useCallback((base: string, params?: Record<string, string>) => {
    if (!params) return base;
    const sp = new URLSearchParams(params);
    return `${base}?${sp.toString()}`;
  }, []);

  // période -> slice
  const periodMonths = useMemo(() => {
    if (period === 'month') return performanceData.slice(-1);
    if (period === 'quarter') return performanceData.slice(-3);
    return performanceData;
  }, [period]);

  const totals = useMemo(() => {
    return periodMonths.reduce(
      (acc, month) => ({
        demandes: acc.demandes + month.demandes,
        validations: acc.validations + month.validations,
        rejets: acc.rejets + month.rejets,
        budget: acc.budget + month.budget,
      }),
      { demandes: 0, validations: 0, rejets: 0, budget: 0 }
    );
  }, [periodMonths]);

  // KPI animation (désactivée si reduced motion)
  const [animatedKPIs, setAnimatedKPIs] = useState({
    demandes: 0,
    validations: 0,
    rejets: 0,
    budget: 0,
  });

  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reducedMotion) {
      setAnimatedKPIs(totals);
      return;
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const start = performance.now();
    const duration = CONFIG.ANIMATION_DURATION_MS;
    const from = animatedKPIs;
    const to = totals;

    const tick = (t: number) => {
      const p = clamp((t - start) / duration, 0, 1);
      const ease = 1 - Math.pow(1 - p, 3);

      setAnimatedKPIs({
        demandes: Math.round(from.demandes + (to.demandes - from.demandes) * ease),
        validations: Math.round(from.validations + (to.validations - from.validations) * ease),
        rejets: Math.round(from.rejets + (to.rejets - from.rejets) * ease),
        budget: Number((from.budget + (to.budget - from.budget) * ease).toFixed(1)),
      });

      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totals.demandes, totals.validations, totals.rejets, totals.budget, reducedMotion]);

  // enrich payments (memoized avec dépendances explicites)
  const enrichedPayments = useMemo(() => {
    return paymentsN1.map((p) => {
      const due = parseFRDate(p.dueDate);
      const d = daysUntil(due);
      return { ...p, _daysToDue: d as number | null };
    });
  }, [paymentsN1]);

  // enrich contracts (memoized avec dépendances explicites)
  const enrichedContracts = useMemo(() => {
    return contractsToSign.map((c) => {
      const exp = parseFRDate(c.expiry);
      const d = daysUntil(exp);
      return { ...c, _daysToExpiry: d as number | null };
    });
  }, [contractsToSign]);

  // quickStats (optimisé avec dépendances précises)
  const quickStats = useMemo(() => {
    const blockedCritical = blockedDossiers.filter((d) => d.delay >= CONFIG.RISK_THRESHOLDS.BLOCKED_DAYS_CRITICAL);

    const latePayments = enrichedPayments.filter((p) => p._daysToDue !== null && p._daysToDue < 0);
    const urgentPayments = enrichedPayments.filter((p) => p._daysToDue !== null && p._daysToDue >= 0 && p._daysToDue <= CONFIG.RISK_THRESHOLDS.PAYMENT_DAYS_URGENT);

    const pendingContracts = enrichedContracts.filter((c) => c.status === 'pending');

    return {
      blockedCritical: blockedCritical.length,
      blockedMostUrgent: blockedCritical.length > 0 ? blockedCritical.sort((a, b) => b.delay - a.delay)[0] : null,
      latePayments: latePayments.length,
      urgentPayments: urgentPayments.length,
      pendingContracts: pendingContracts.length,
    };
  }, [enrichedPayments, enrichedContracts, blockedDossiers]);

  // bureau health (pinned first) + search tokens (optimisé)
  const bureauHealth = useMemo(() => {
    const base = bureaux.map((b) => {
      const blockedCount = blockedDossiers.filter((d) => d.bureau === b.code).length;
      const health = blockedCount === 0 ? 'good' : blockedCount <= 1 ? 'warning' : 'critical';
      return { ...b, blockedCount, health };
    });

    const score = (h: (typeof base)[number]) =>
      (h.health === 'critical' ? 2 : h.health === 'warning' ? 1 : 0) * 100 + h.blockedCount;

    const filtered = base.filter((b) => {
      if (tokens.length === 0) return true;
      return includesAllTokens(`${b.code} ${b.name ?? ''}`, tokens);
    });

    return filtered.sort((a, b) => {
      const ap = pinnedBureaux.includes(a.code) ? -1000 : 0;
      const bp = pinnedBureaux.includes(b.code) ? -1000 : 0;
      return ap - bp || score(b) - score(a) || a.code.localeCompare(b.code);
    });
  }, [pinnedBureaux, tokens, blockedDossiers, bureaux]);

  // Risk engine : fusion alerts + blocked + payments + contracts
  // Optimisé avec dépendances précises pour éviter recalculs inutiles
  const risks = useMemo(() => {
    const list: Omit<RiskItem, 'score'>[] = [];

    // 1) system alerts
    for (const a of systemAlerts) {
      if (a.type !== 'critical' && a.type !== 'warning') continue;

      list.push({
        id: `RISK:ALERT:${a.id}`, // pas de collision
        kind: 'system_alert',
        severity: a.type === 'critical' ? 'critical' : 'warning',
        title: a.title,
        detail: a.action,
        source: 'Système',
        ctaLabel: 'Voir alertes',
        ctaRoute: '/maitre-ouvrage/governance?tab=alerts',
        explain: a.type === 'critical' ? 'Alerte critique détectée par le système.' : 'Alerte préventive (warning).',
        payload: a,
      });
    }

    // 2) blocked dossiers (préventif dès 3 jours)
    for (const d of blockedDossiers) {
      if (d.delay < CONFIG.RISK_THRESHOLDS.BLOCKED_DAYS_WARNING) continue;

      const sev: RiskSeverity =
        d.delay >= CONFIG.RISK_THRESHOLDS.BLOCKED_DAYS_CRITICAL || d.impact === 'critical' ? 'critical' : 'warning';

      list.push({
        id: `RISK:BLOCK:${d.id}`,
        kind: 'blocked_dossier',
        severity: sev,
        title: `${d.type} bloqué • ${d.delay}j`,
        detail: d.subject,
        source: d.bureau,
        ctaLabel: 'Ouvrir blocage',
        ctaRoute: '/maitre-ouvrage/arbitrages-vivants',
        ctaParams: { id: d.id },
        explain:
          sev === 'critical'
            ? 'SLA dépassé: substitution recommandée pour rétablir la chaîne de validation.'
            : 'Risque de dérive: intervention préventive recommandée.',
        payload: d,
      });
    }

    // 3) payments due
    for (const p of enrichedPayments) {
      if (p._daysToDue === null) continue;

      // retard => critical, échéance ≤5j => warning
      if (p._daysToDue < 0 || p._daysToDue <= CONFIG.RISK_THRESHOLDS.PAYMENT_DAYS_URGENT) {
        const sev: RiskSeverity = p._daysToDue < 0 ? 'critical' : 'warning';
        list.push({
          id: `RISK:PAY:${p.id}`,
          kind: 'payment_due',
          severity: sev,
          title:
            p._daysToDue < 0
              ? `Paiement en retard • ${Math.abs(p._daysToDue)}j`
              : `Paiement à échéance • J-${p._daysToDue}`,
          detail: `${p.beneficiary} • ${p.amount ?? '—'} FCFA`,
          source: 'Finance',
          ctaLabel: 'Valider paiements',
          ctaRoute: '/maitre-ouvrage/validation-paiements',
          ctaParams: p._daysToDue < 0 ? { late: 'true' } : { urgent: 'true' },
          explain:
            p._daysToDue < 0
              ? 'Retard: risque réputationnel / pénalités / blocage fournisseur.'
              : 'Fenêtre courte: sécuriser la trésorerie et éviter le retard.',
          payload: p,
        });
      }
    }

    // 4) contract expiry
    for (const c of enrichedContracts) {
      if (c._daysToExpiry === null) continue;
      if (c.status !== 'pending') continue;

      // expiration proche => warning (≤7j), dépassée => critical
      if (c._daysToExpiry <= CONFIG.RISK_THRESHOLDS.CONTRACT_DAYS_WARNING) {
        const sev: RiskSeverity = c._daysToExpiry < 0 ? 'critical' : 'warning';
        list.push({
          id: `RISK:CTR:${c.id}`,
          kind: 'contract_expiry',
          severity: sev,
          title:
            c._daysToExpiry < 0
              ? `Contrat expiré • ${Math.abs(c._daysToExpiry)}j`
              : `Contrat à sécuriser • J-${c._daysToExpiry}`,
          detail: `${c.subject} • ${c.amount ?? '—'} FCFA`,
          source: 'Juridique',
          ctaLabel: 'Signer contrats',
          ctaRoute: '/maitre-ouvrage/validation-contrats',
          ctaParams: { status: 'pending' },
          explain:
            c._daysToExpiry < 0
              ? "Contrat dépassé: risque d'exécution non couverte / non-conformité."
              : 'Expiration proche: sécuriser la signature et la traçabilité.',
          payload: c,
        });
      }
    }

    // score final + filters (optimisé: filtre avant de scorer)
    const filtered = list
      .filter((r) => !isRiskSnoozed(r.id))
      .filter((r) => {
        if (tokens.length === 0) return true;
        return includesAllTokens(`${r.title} ${r.detail} ${r.source} ${r.kind}`, tokens);
      });

    // score seulement les items filtrés
    const scored: RiskItem[] = filtered.map((r) => ({
      ...r,
      score: computeRiskScore(r),
    }));

    // tri: score desc + severity desc
    return scored.sort((a, b) => b.score - a.score || severityScore(b.severity) - severityScore(a.severity)).slice(0, CONFIG.DISPLAY_LIMITS.RISKS_MAX);
  }, [enrichedPayments, enrichedContracts, tokens, isRiskSnoozed, systemAlerts, blockedDossiers]);

  // Note: Les actions prioritaires sont maintenant gérées par WorkInbox (Command Center)

  const decisionsPreview = useMemo(() => {
    const base = decisions.slice(0, CONFIG.DISPLAY_LIMITS.DECISIONS_BASE);

    const filtered = tokens.length
      ? base.filter((d) => includesAllTokens(`${d.id} ${d.type} ${d.subject} ${d.author} ${d.date} ${d.status}`, tokens))
      : base;

    const score = (s: string) => (s === 'pending' ? 2 : s === 'executed' ? 1 : 0);
    return filtered.sort((a, b) => score(b.status) - score(a.status)).slice(0, CONFIG.DISPLAY_LIMITS.DECISIONS_PREVIEW);
  }, [tokens, decisions]);

  // Auto-sync sidebar (rafraîchissement automatique)
  useAutoSyncCounts('dashboard', () => risks.filter((r) => r.severity === 'critical').length, { 
    interval: CONFIG.AUTO_REFRESH_INTERVAL_MS, 
    immediate: true 
  });

  const refresh = useCallback(() => {
    addToast('🔄 Données rafraîchies (simulation)', 'success');
  }, [addToast]);

  const togglePin = useCallback(
    (code: string) => {
      setPinnedBureaux((prev) => {
        const isPinned = prev.includes(code);
        const next = isPinned ? prev.filter((x) => x !== code) : [code, ...prev];
        addToast(isPinned ? `📌 ${code} retiré des épingles` : `📌 ${code} épinglé`, 'info');
        return next;
      });
    },
    [addToast, setPinnedBureaux]
  );

  const handleRiskClick = useCallback(
    (r: RiskItem) => {
      if (r.kind === 'blocked_dossier') {
        if (r.payload && typeof r.payload === 'object') {
          openBlocageModal(r.payload as BlockedDossier);
        }
        return;
      }
      router.push(buildUrl(r.ctaRoute, r.ctaParams));
    },
    [buildUrl, openBlocageModal, router]
  );

  // Note: handleActionClick supprimé car les actions sont maintenant gérées par WorkInbox

  // Calcul des taux (memoized pour éviter recalculs)
  const rates = useMemo(() => {
    const total = animatedKPIs.demandes || 1;
    return {
      validation: ((animatedKPIs.validations / total) * 100).toFixed(1),
      reject: ((animatedKPIs.rejets / total) * 100).toFixed(1),
    };
  }, [animatedKPIs.demandes, animatedKPIs.validations, animatedKPIs.rejets]);

  // Données pour graphiques de tendances
  const trendData = useMemo(() => {
    const slice = period === 'month' ? 1 : period === 'quarter' ? 3 : periodMonths.length;
    return periodMonths.slice(-slice).map((month, idx) => ({
      period: month.month || `M${idx + 1}`,
      demandes: month.demandes,
      validations: month.validations,
      rejets: month.rejets,
      budget: month.budget,
    }));
  }, [period, periodMonths]);

  // Données période précédente pour comparaison
  const previousPeriodData = useMemo(() => {
    const slice = period === 'month' ? 1 : period === 'quarter' ? 3 : periodMonths.length;
    const start = periodMonths.length - slice * 2;
    if (start < 0) return null;
    return periodMonths.slice(start, start + slice).reduce(
      (acc, month) => ({
        demandes: acc.demandes + month.demandes,
        validations: acc.validations + month.validations,
        rejets: acc.rejets + month.rejets,
        budget: acc.budget + month.budget,
      }),
      { demandes: 0, validations: 0, rejets: 0, budget: 0 }
    );
  }, [period, periodMonths]);

  // Handler pour export (ouvre modal)
  // Données pour export
  const exportData = useMemo(
    () => ({
      period,
      totals: animatedKPIs,
      rates,
      risks: risks.length,
      decisions: decisionsPreview.length,
      timestamp: new Date().toISOString(),
    }),
    [period, animatedKPIs, rates, risks.length, decisionsPreview.length]
  );

  // Générer les notifications basées sur les risques et stats
  useEffect(() => {
    const newNotifications: typeof notifications = [];

    // Notification pour blocages critiques
    if (quickStats.blockedCritical > 0) {
      newNotifications.push({
        id: 'notif-blocked-critical',
        type: 'critical',
        title: `${quickStats.blockedCritical} dossier(s) bloqué(s)`,
        message: `SLA dépassé: intervention recommandée`,
        timestamp: new Date(),
        read: false,
        action: {
          label: 'Voir blocages',
          route: '/maitre-ouvrage/substitution',
        },
      });
    }

    // Notification pour retards paiements
    if (quickStats.latePayments > 0) {
      newNotifications.push({
        id: 'notif-late-payments',
        type: 'warning',
        title: `${quickStats.latePayments} paiement(s) en retard`,
        message: `Risque réputationnel et pénalités`,
        timestamp: new Date(),
        read: false,
        action: {
          label: 'Valider paiements',
          route: '/maitre-ouvrage/validation-paiements?late=true',
        },
      });
    }

    // Notification pour contrats à signer
    if (quickStats.pendingContracts > 0) {
      newNotifications.push({
        id: 'notif-pending-contracts',
        type: 'info',
        title: `${quickStats.pendingContracts} contrat(s) à signer`,
        message: `Sécurisation juridique nécessaire`,
        timestamp: new Date(),
        read: false,
        action: {
          label: 'Signer contrats',
          route: '/maitre-ouvrage/validation-contrats',
        },
      });
    }

    setNotifications((prev) => {
      // Garder les notifications existantes non lues
      const existingIds = new Set(prev.filter((n) => !n.read).map((n) => n.id));
      const toAdd = newNotifications.filter((n) => !existingIds.has(n.id));
      return [...prev.filter((n) => !n.read || existingIds.has(n.id)), ...toAdd];
    });
  }, [quickStats]);

  // Handlers pour notifications
  const handleMarkAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleDismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Handlers pour KPIs drill-down
  const handleKPIClick = useCallback(
    (kpi: {
      id: string;
      label: string;
      value: number | string;
      icon: string;
      color: string;
      trend?: string;
    }) => {
      setSelectedKPI(kpi);
    },
    []
  );

  // Données pour drill-down
  const getKPIDrillDownData = useCallback(
    (kpiId: string) => {
      switch (kpiId) {
        case 'demandes':
          return {
            data: trendData.map((d) => ({ period: d.period, value: d.demandes })),
            breakdown: bureaux.map((b) => ({
              label: b.code,
              value: Math.floor(Math.random() * 50), // Simulation
              percentage: Math.floor(Math.random() * 20),
            })),
            route: '/maitre-ouvrage/demandes',
          };
        case 'validations':
          return {
            data: trendData.map((d) => ({ period: d.period, value: d.validations })),
            breakdown: bureaux.map((b) => ({
              label: b.code,
              value: Math.floor(Math.random() * 40),
              percentage: Math.floor(Math.random() * 25),
            })),
            route: '/maitre-ouvrage/demandes?filter=validated',
          };
        case 'rejets':
          return {
            data: trendData.map((d) => ({ period: d.period, value: d.rejets })),
            breakdown: bureaux.map((b) => ({
              label: b.code,
              value: Math.floor(Math.random() * 10),
              percentage: Math.floor(Math.random() * 15),
            })),
            route: '/maitre-ouvrage/demandes?filter=rejected',
          };
        case 'budget':
          return {
            data: trendData.map((d) => ({ period: d.period, value: d.budget })),
            breakdown: bureaux.map((b) => ({
              label: b.code,
              value: Math.floor(Math.random() * 100),
              percentage: Math.floor(Math.random() * 30),
            })),
            route: '/maitre-ouvrage/finances',
          };
        default:
          return undefined;
      }
    },
    [trendData, bureaux]
  );

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log l'erreur (à remplacer par un service de logging en production)
        Logger.error('Dashboard error', error instanceof Error ? error : new Error(String(error)), { errorInfo });
        addToast('Une erreur s\'est produite. Vérifiez la console pour plus de détails.', 'error');
      }}
    >
      <MobileOptimizations>
      <div className="space-y-4 sm:space-y-6">
      {/* Header exécutif responsive */}
      <header className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold flex flex-wrap items-center gap-2">
              🧠 Dashboard Maître d&apos;Ouvrage
              <Badge variant="info" className="text-[10px]">
                {period === 'month' ? 'Mois' : period === 'quarter' ? 'Trimestre' : 'Année'}
              </Badge>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Recherche &quot;/&quot; • Palette &quot;Ctrl/⌘+K&quot; • Moteur risques → actions → décisions
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <NotificationCenter
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onDismiss={handleDismissNotification}
            />
            <Button size="sm" variant="secondary" onClick={refresh} aria-label="Rafraîchir" className="flex-1 sm:flex-none text-xs sm:text-sm">
              🔄 Rafraîchir
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setCmdOpen(true)} aria-label="Ouvrir palette" className="flex-1 sm:flex-none text-xs sm:text-sm">
              ⌘K
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setViewMode(viewMode === 'compact' ? 'extended' : 'compact')}
              aria-label="Changer vue"
              className="flex-1 sm:flex-none text-xs sm:text-sm"
            >
              {viewMode === 'compact' ? <LayoutGrid className="w-3 h-3" /> : <LayoutList className="w-3 h-3" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setLayoutEditorOpen(true)}
              aria-label="Personnaliser"
              className="flex-1 sm:flex-none text-xs sm:text-sm"
              title="Personnaliser (Ctrl+P)"
            >
              <Settings className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShortcutsModalOpen(true)}
              aria-label="Raccourcis clavier"
              className="flex-1 sm:flex-none text-xs sm:text-sm"
              title="Raccourcis (Ctrl+?)"
            >
              <Keyboard className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setThemeSelectorOpen(true)}
              aria-label="Thème"
              className="flex-1 sm:flex-none text-xs sm:text-sm"
              title="Thème (Ctrl+D)"
            >
              <Palette className="w-3 h-3" />
            </Button>
            <FocusMode
              isActive={focusMode}
              onToggle={() => {
                setFocusMode(!focusMode);
                localStorage.setItem(STORAGE_KEYS.focusMode, String(!focusMode));
              }}
            />
            <PresentationMode
              isActive={presentationMode}
              onToggle={() => setPresentationMode(!presentationMode)}
              onNext={() => setPresentationSection((s) => Math.min(s + 1, dashboardSections.filter((sec) => sec.visible).length - 1))}
              onPrevious={() => setPresentationSection((s) => Math.max(s - 1, 0))}
              currentSection={presentationSection}
              totalSections={dashboardSections.filter((s) => s.visible).length}
            />
            <Button size="sm" variant="ghost" onClick={handleExport} aria-label="Exporter" className="flex-1 sm:flex-none text-xs sm:text-sm" title="Exporter (Ctrl+E)">
              <Download className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-3">
          <div className="flex-1 min-w-0 w-full sm:min-w-[240px]">
            <EnhancedSearch
              ref={enhancedSearchRef}
              value={query}
              onChange={setQuery}
              onSelect={(result) => {
                if (result.route) {
                  router.push(result.route);
                }
              }}
            />
          </div>

          <div className="flex items-center gap-1 w-full sm:w-auto">
            <Button size="sm" variant={period === 'month' ? 'warning' : 'ghost'} onClick={() => setPeriod('month')} className="flex-1 sm:flex-none text-xs">
              Mois
            </Button>
            <Button size="sm" variant={period === 'quarter' ? 'warning' : 'ghost'} onClick={() => setPeriod('quarter')} className="flex-1 sm:flex-none text-xs">
              Trimestre
            </Button>
            <Button size="sm" variant={period === 'year' ? 'warning' : 'ghost'} onClick={() => setPeriod('year')} className="flex-1 sm:flex-none text-xs">
              Année
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-slate-400 w-full sm:w-auto">
            <span className="px-2 py-1 rounded bg-blue-400/8 text-blue-300/80">
              Blocages {CONFIG.RISK_THRESHOLDS.BLOCKED_DAYS_CRITICAL}j+ : {quickStats.blockedCritical}
            </span>
            <span className="px-2 py-1 rounded bg-red-400/8 text-red-300/80">
              Retards paiements : {quickStats.latePayments}
            </span>
            <span className="px-2 py-1 rounded bg-amber-400/8 text-amber-300/80">
              Paiements urgents : {quickStats.urgentPayments}
            </span>
            <span className="px-2 py-1 rounded bg-purple-400/8 text-purple-300/80">
              Contrats à signer : {quickStats.pendingContracts}
            </span>
          </div>
        </div>
      </header>

      {/* Bannière critique responsive */}
      {!dismissBanner && quickStats.blockedCritical > 0 && (
        <div
          className={cn(
            'rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 border',
            darkMode ? 'bg-red-400/8 border-red-400/20' : 'bg-red-50 border-red-200'
          )}
          role="alert"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="text-xl sm:text-2xl">🚨</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xs sm:text-sm text-red-300/80">
              {quickStats.blockedCritical} dossier(s) bloqué(s) depuis plus de {CONFIG.RISK_THRESHOLDS.BLOCKED_DAYS_CRITICAL} jours
            </p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
              {quickStats.blockedMostUrgent && (
                <>Plus urgent : <strong>{quickStats.blockedMostUrgent.type}</strong> bloqué depuis {quickStats.blockedMostUrgent.delay}j. </>
              )}
              SLA dépassé : substitution recommandée pour relancer la chaîne de validation.
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link href="/maitre-ouvrage/substitution" className="flex-1 sm:flex-none">
              <Button size="sm" variant="destructive" className="w-full sm:w-auto text-xs">
                ⚡ Intervenir
              </Button>
            </Link>
            <Button size="sm" variant="secondary" onClick={() => setDismissBanner(true)} className="flex-1 sm:flex-none text-xs">
              Masquer
            </Button>
          </div>
        </div>
      )}

      {/* 1) Performance globale responsive */}
      {(!focusMode || dashboardSections.find((s) => s.id === 'performance')?.visible) && (
      <LazySection>
      <section aria-label="Performance globale">
        <h2 id="performance-heading" className="text-base sm:text-lg font-bold mb-2 sm:mb-3 flex items-center gap-2">
          <span aria-hidden="true">📊</span>
          <span>Performance Globale</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          <KPICard
            icon="📋"
            label="Demandes"
            value={animatedKPIs.demandes}
            trend={period === 'month' ? 'Mois en cours' : period === 'quarter' ? 'Trimestre' : 'Cumul annuel'}
            color="#3B82F6"
            onClick={() =>
              handleKPIClick({
                id: 'demandes',
                label: 'Demandes',
                value: animatedKPIs.demandes,
                icon: '📋',
                color: '#3B82F6',
                trend: period === 'month' ? 'Mois en cours' : period === 'quarter' ? 'Trimestre' : 'Cumul annuel',
              })
            }
          />
          <KPICard
            icon="✅"
            label="Validations"
            value={animatedKPIs.validations}
            trend={`${rates.validation}% taux`}
            up
            color="#10B981"
            onClick={() =>
              handleKPIClick({
                id: 'validations',
                label: 'Validations',
                value: animatedKPIs.validations,
                icon: '✅',
                color: '#10B981',
                trend: `${rates.validation}% taux`,
              })
            }
          />
          <KPICard
            icon="❌"
            label="Rejets"
            value={animatedKPIs.rejets}
            trend={`${rates.reject}% taux`}
            up={false}
            color="#EF4444"
            onClick={() =>
              handleKPIClick({
                id: 'rejets',
                label: 'Rejets',
                value: animatedKPIs.rejets,
                icon: '❌',
                color: '#EF4444',
                trend: `${rates.reject}% taux`,
              })
            }
          />
          <KPICard
            icon="💰"
            label="Budget traité"
            value={`${animatedKPIs.budget}Mds`}
            sub="FCFA"
            trend="Cumul"
            color="#D4AF37"
            onClick={() =>
              handleKPIClick({
                id: 'budget',
                label: 'Budget traité',
                value: `${animatedKPIs.budget}Mds`,
                icon: '💰',
                color: '#D4AF37',
                trend: 'Cumul',
              })
            }
          />
        </div>

        {/* Score de Performance et Insights */}
        {viewMode === 'extended' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mt-4">
            <PerformanceScoreWidget
              totals={animatedKPIs}
              periodData={trendData}
              previousPeriod={previousPeriodData || undefined}
            />
            <IntelligentInsightsWidget
              totals={animatedKPIs}
              periodData={trendData}
              previousPeriod={previousPeriodData || undefined}
            />
          </div>
        )}
      </section>
      </LazySection>
      )}

      {/* 2) Actions prioritaires (planner) responsive */}
      {(!focusMode || dashboardSections.find((s) => s.id === 'actions')?.visible) && (
      <LazySection>
      <section aria-label="Actions prioritaires" role="region" aria-labelledby="actions-heading">
        <h2 id="actions-heading" className="text-base sm:text-lg font-bold mb-2 sm:mb-3 flex items-center gap-2">
          <span aria-hidden="true">⚡</span>
          <span>Actions Prioritaires</span>
        </h2>

        <DashboardCard
          title="Command Center — Work Inbox"
          subtitle="Inbox universelle actionnable — Tous les éléments nécessitant une décision"
          icon="⚡"
          borderColor="#F97316"
        >
          <WorkInbox items={inboxItems} defaultChip="all" />
        </DashboardCard>
      </section>
      </LazySection>
      )}

      {/* 3) Risques & Santé orga responsive */}
      {(!focusMode || dashboardSections.find((s) => s.id === 'risks')?.visible) && (
      <section aria-label="Risques et santé organisationnelle">
        <h2 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 flex items-center gap-2">
          <span>⚠️</span>
          <span>Risques & Santé Organisationnelle</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Santé bureaux */}
          <DashboardCard
            title="Santé organisationnelle"
            subtitle="État des bureaux (⭐ épingler) — tri intelligent"
            icon="🏢"
            badge={bureaux.length}
            badgeVariant="info"
            borderColor="#3B82F6"
            footer={
              <Link href="/maitre-ouvrage/arbitrages-vivants?tab=bureaux">
                <Button size="sm" variant="ghost" className="w-full text-xs">
                  Voir tous les bureaux →
                </Button>
              </Link>
            }
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="w-full sm:w-32 h-32 mx-auto sm:mx-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={bureauPieData} cx="50%" cy="50%" innerRadius={25} outerRadius={45} dataKey="value">
                      {bureauPieData.map((entry, idx) => {
                        const color = 'color' in entry && typeof entry.color === 'string' ? entry.color : '#3B82F6';
                        return <Cell key={idx} fill={color} />;
                      })}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-1">
                {bureauHealth.map((b) => (
                  <div
                    key={b.code}
                    className={cn(
                      'flex items-center gap-1.5 sm:gap-2 p-1.5 rounded text-[10px] sm:text-xs transition-colors',
                      darkMode ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-gray-50 hover:bg-gray-100'
                    )}
                  >
                    <button
                      onClick={() => togglePin(b.code)}
                      className={cn(
                        'text-[11px] sm:text-[12px] leading-none',
                        pinnedBureaux.includes(b.code) ? 'text-amber-300/80' : 'text-slate-400 hover:text-slate-200'
                      )}
                      aria-label={pinnedBureaux.includes(b.code) ? 'Désépingler' : 'Épingler'}
                      title={pinnedBureaux.includes(b.code) ? 'Désépingler' : 'Épingler'}
                    >
                      {pinnedBureaux.includes(b.code) ? '★' : '☆'}
                    </button>

                    <button
                      onClick={() => router.push(`/maitre-ouvrage/arbitrages-vivants?bureau=${b.code}`)}
                      className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0"
                    >
                      <div
                        className={cn(
                          'w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0',
                          b.health === 'good'
                            ? 'bg-emerald-400/80'
                            : b.health === 'warning'
                            ? 'bg-amber-400/80'
                            : 'bg-red-400/80 animate-pulse'
                        )}
                      />
                      <span className="font-medium truncate">{b.code}</span>
                      <span className="text-slate-400 text-[9px] sm:text-[10px] hidden sm:inline">{b.completion}%</span>
                      {b.blockedCount > 0 && (
                        <Badge variant="urgent" className="ml-auto text-[9px]">
                          {b.blockedCount}
                        </Badge>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </DashboardCard>

          {/* Top risques */}
          <DashboardCard
            title="Risk Radar"
            subtitle="Fusion intelligente: alertes + blocages + paiements + contrats"
            icon="⚠️"
            badge={risks.length}
            badgeVariant="warning"
            borderColor="#F59E0B"
            footer={
              <Link href="/maitre-ouvrage/governance?tab=alerts">
                <Button size="sm" variant="ghost" className="w-full text-xs">
                  Voir tous les risques →
                </Button>
              </Link>
            }
          >
            <div className="space-y-2">
              {risks.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-4" role="status" aria-live="polite">
                  <span aria-hidden="true">✅</span> Aucun risque détecté
                </div>
              ) : (
                risks.map((r) => (
                  <div
                    key={r.id}
                    className={cn(
                      'w-full flex items-center gap-1.5 sm:gap-2 p-2 rounded-lg border-l-4 transition-colors',
                      r.severity === 'critical'
                        ? 'border-l-red-400/60 bg-red-400/5 hover:bg-red-400/10'
                        : r.severity === 'warning'
                        ? 'border-l-amber-400/60 bg-amber-400/5 hover:bg-amber-400/10'
                        : 'border-l-blue-400/60 bg-blue-400/5 hover:bg-blue-400/10'
                    )}
                  >
                    <button 
                      className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0" 
                      onClick={() => handleRiskClick(r)}
                      aria-label={`${r.title}: ${r.detail}. ${r.explain}`}
                    >
                      <span className="text-base sm:text-lg" aria-hidden="true">
                        {r.severity === 'critical' ? '🚨' : r.severity === 'warning' ? '⚠️' : '👁️'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-xs font-semibold truncate">
                          {r.title} <span className="text-[9px] text-slate-400">• score {r.score}</span>
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">{r.detail}</p>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 truncate italic">{r.explain}</p>
                      </div>
                      <BureauTag bureau={r.source} />
                    </button>

                    <button
                      onClick={() => {
                        snoozeRisk(r.id);
                        addToast('🕒 Risque masqué 2h (session)', 'info');
                      }}
                      className="text-[9px] sm:text-[10px] text-slate-400 hover:text-slate-200 flex-shrink-0"
                      aria-label="Masquer ce risque 2h"
                      title="Masquer 2h"
                    >
                      Snooze
                    </button>
                  </div>
                ))
              )}
            </div>
          </DashboardCard>
        </div>
      </section>
      )}

      {/* 4) Décisions responsive */}
      {(!focusMode || dashboardSections.find((s) => s.id === 'decisions')?.visible) && (
      <section aria-label="Décisions et timeline">
        <h2 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 flex items-center gap-2">
          <span>⚖️</span>
          <span>Décisions & Timeline</span>
        </h2>

        <DashboardCard
          title="Timeline des décisions"
          subtitle="Priorité aux décisions en attente"
          icon="⚖️"
          badge={decisions.length}
          badgeVariant="info"
          borderColor="#3B82F6"
          footer={
            <Link href="/maitre-ouvrage/decisions">
              <Button size="sm" variant="ghost" className="w-full text-xs">
                Voir toutes les décisions →
              </Button>
            </Link>
          }
        >
          <div className="space-y-2">
            {decisionsPreview.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-4" role="status" aria-live="polite">
                <span aria-hidden="true">📋</span> Aucune décision à afficher
              </div>
            ) : (
              decisionsPreview.map((d) => (
              <Link
                key={d.id}
                href={`/maitre-ouvrage/decisions?id=${d.id}`}
                className={cn(
                  'flex items-center gap-2 sm:gap-3 p-2 rounded-lg border-l-4 transition-colors',
                  d.status === 'executed'
                    ? 'border-l-emerald-400/60 bg-emerald-400/5 hover:bg-emerald-400/10'
                    : d.status === 'pending'
                    ? 'border-l-amber-400/60 bg-amber-400/5 hover:bg-amber-400/10'
                    : 'border-l-slate-400/60 bg-slate-400/5 hover:bg-slate-400/10',
                  darkMode ? 'bg-slate-700/20' : 'bg-gray-50'
                )}
              >
                <div
                  className={cn(
                    'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm flex-shrink-0',
                    d.type === 'Validation N+1'
                      ? 'bg-emerald-400/15 text-emerald-300/80'
                      : d.type === 'Substitution'
                      ? 'bg-orange-400/15 text-orange-300/80'
                      : d.type === 'Délégation'
                      ? 'bg-blue-400/15 text-blue-300/80'
                      : 'bg-blue-400/15 text-blue-300/80'
                  )}
                >
                  {d.type === 'Validation N+1' ? '✓' : d.type === 'Substitution' ? '🔄' : d.type === 'Délégation' ? '🔑' : '⚖️'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className={cn('font-mono text-[9px] sm:text-[10px]', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                      {d.id}
                    </span>
                    <Badge
                      variant={d.status === 'executed' ? 'success' : d.status === 'pending' ? 'warning' : 'default'}
                      className="text-[9px]"
                    >
                      {d.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] sm:text-xs font-semibold truncate">
                    {d.type}: {d.subject}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-slate-400">
                    Par {d.author} • {d.date}
                  </p>
                </div>
              </Link>
            ))
            )}
          </div>
        </DashboardCard>
      </section>
      )}

      {/* 5) Temps réel responsive */}
      {(!focusMode || dashboardSections.find((s) => s.id === 'realtime')?.visible) && (
      <section aria-label="Indicateurs temps réel">
        <h2 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 flex items-center gap-2">
          <span>📈</span>
          <span>Indicateurs Temps Réel</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          <DashboardCard title="Taux validation" icon="✅" href="/maitre-ouvrage/analytics" borderColor="#10B981">
            <p className="text-xl sm:text-2xl font-bold text-emerald-300/80 text-center">{liveStats.tauxValidation}%</p>
          </DashboardCard>

          <DashboardCard title="Temps moyen réponse" icon="⏱️" href="/maitre-ouvrage/analytics" borderColor="#3B82F6">
            <p className="text-xl sm:text-2xl font-bold text-blue-300/80 text-center">{liveStats.tempsReponse}</p>
          </DashboardCard>

          <DashboardCard title="Validations aujourd'hui" icon="📊" href="/maitre-ouvrage/analytics?period=today" borderColor="#3B82F6">
            <p className="text-xl sm:text-2xl font-bold text-blue-300/80 text-center">{liveStats.validationsJour}</p>
          </DashboardCard>

          <DashboardCard title="Montant traité" icon="💰" href="/maitre-ouvrage/finances" borderColor="#3B82F6">
            <p className={cn('text-base sm:text-lg font-bold text-center', darkMode ? 'text-slate-200' : 'text-gray-800')}>
              {liveStats.montantTraite}
            </p>
            <p className="text-[9px] sm:text-[10px] text-slate-400 text-center mt-1">FCFA</p>
          </DashboardCard>
        </div>

        {/* Métriques Avancées */}
        {viewMode === 'extended' && (
          <div className="mt-4">
            <AdvancedMetricsWidget
              totals={animatedKPIs}
              periodData={trendData}
              blockedDossiers={blockedDossiers}
            />
          </div>
        )}
      </section>
      )}

      {/* 6) Comparaisons et Analyses Avancées */}
      {viewMode === 'extended' && (!focusMode || dashboardSections.find((s) => s.id === 'analytics')?.visible) && (
        <section aria-label="Comparaisons et analyses avancées">
          <h2 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 flex items-center gap-2">
            <span>🔬</span>
            <span>Analyses Avancées</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <MultiBureauComparatorWidget
              bureaux={bureaux}
              periodData={trendData}
            />
            <AnomalyDetectionWidget
              periodData={trendData}
            />
          </div>
        </section>
      )}

      {/* 7) Phase 3 - Fonctionnalités Avancées */}
      {viewMode === 'extended' && !focusMode && (
        <>
          {/* Rapport Narratif */}
          <section aria-label="Rapport narratif">
            <NarrativeReportWidget
              totals={animatedKPIs}
              periodData={trendData}
              previousPeriod={previousPeriodData || undefined}
              risks={risks.length}
            />
          </section>

          {/* Calendrier & Timeline Prédictive */}
          <section aria-label="Calendrier et prédictions">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <CalendarWidget
                todayDeadlines={quickStats.blockedCritical + quickStats.latePayments}
              />
              <PredictiveTimelineWidget
                historical={trendData.map((d) => ({ period: d.period, value: d.demandes }))}
                predictedMonths={6}
              />
            </div>
          </section>

          {/* Collaboration */}
          <section aria-label="Collaboration">
            <CollaborationWidget itemId="dashboard" itemType="dashboard" />
          </section>

          {/* Comparaison Temporelle */}
          <section aria-label="Comparaison temporelle">
            <TemporalComparison
              currentData={{
                period: period,
                demandes: animatedKPIs.demandes,
                validations: animatedKPIs.validations,
                rejets: animatedKPIs.rejets,
                budget: animatedKPIs.budget,
              }}
              historicalData={trendData}
            />
          </section>
        </>
      )}

      {/* Palette de commandes responsive */}
      {cmdOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4" 
          role="dialog" 
          aria-modal="true"
          aria-labelledby="cmd-palette-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCmdOpen(false);
          }}
        >
          <Card 
            ref={cmdModalRef}
            className="w-full max-w-xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-3 sm:p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div>
                  <p id="cmd-palette-title" className="font-bold text-xs sm:text-sm">⌘K — Commandes rapides</p>
                  <p className="text-[10px] sm:text-xs text-slate-400">Astuce : &quot;/&quot; focus recherche • ESC fermer</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => setCmdOpen(false)} className="text-xs sm:text-sm w-full sm:w-auto">
                  Fermer
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <CmdItem label="⚡ Substitutions" hint="Blocages & délégations" onClick={() => router.push('/maitre-ouvrage/substitution')} />
                <CmdItem label="💳 Validation paiements" hint="Urgences & retards" onClick={() => router.push('/maitre-ouvrage/validation-paiements')} />
                <CmdItem label="📜 Signature contrats" hint="Sécurisation juridique" onClick={() => router.push('/maitre-ouvrage/validation-contrats')} />
                <CmdItem label="🏛️ Gouvernance" hint="RACI + Alertes" onClick={() => router.push('/maitre-ouvrage/governance')} />
                <CmdItem label="⚖️ Décisions" hint="Historique & statut" onClick={() => router.push('/maitre-ouvrage/decisions')} />
                <CmdItem label="📈 Analytics" hint="SLA & tendances" onClick={() => router.push('/maitre-ouvrage/analytics')} />
              </div>

              <div className="pt-2 border-t border-slate-700/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-[9px] sm:text-[10px] text-slate-400">
                <span>Le dashboard priorise selon score & urgence</span>
                <span>Snooze = {CONFIG.SNOOZE_TTL_MS / (60 * 60 * 1000)}h (session)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Drill-down KPI */}
      {selectedKPI && (
        <KPIDrillDown
          isOpen={!!selectedKPI}
          onClose={() => setSelectedKPI(null)}
          kpi={selectedKPI}
          {...getKPIDrillDownData(selectedKPI.id)}
        />
      )}

      {/* Modal Export Avancé */}
      <AdvancedExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        data={exportData}
      />

      {/* Éditeur de Layout */}
      <DashboardLayoutEditor
        sections={dashboardSections}
        onSectionsChange={(sections) => {
          setDashboardSections(sections);
          localStorage.setItem(STORAGE_KEYS.dashboardLayout, JSON.stringify(sections));
        }}
        onSave={(sections) => {
          localStorage.setItem(STORAGE_KEYS.dashboardLayout, JSON.stringify(sections));
        }}
        onReset={() => {
          const defaultSections = [
            { id: 'performance', label: 'Performance Globale', visible: true, order: 0 },
            { id: 'actions', label: 'Actions Prioritaires', visible: true, order: 1 },
            { id: 'risks', label: 'Risques & Santé', visible: true, order: 2 },
            { id: 'decisions', label: 'Décisions', visible: true, order: 3 },
            { id: 'realtime', label: 'Indicateurs Temps Réel', visible: true, order: 4 },
            { id: 'analytics', label: 'Analyses Avancées', visible: true, order: 5 },
          ];
          setDashboardSections(defaultSections);
          localStorage.setItem(STORAGE_KEYS.dashboardLayout, JSON.stringify(defaultSections));
        }}
        isOpen={layoutEditorOpen}
        onClose={() => setLayoutEditorOpen(false)}
      />

      {/* Modal Raccourcis Clavier */}
      <KeyboardShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />

      {/* Sélecteur de Thème */}
      <ThemeSelector
        isOpen={themeSelectorOpen}
        onClose={() => setThemeSelectorOpen(false)}
      />
      </div>
      </MobileOptimizations>
    </ErrorBoundary>
  );
}

// Composant memoized pour éviter re-renders inutiles
const CmdItem = React.memo(({ label, hint, onClick }: { label: string; hint: string; onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="text-left p-2 sm:p-3 rounded-lg border border-slate-700/30 hover:bg-orange-400/5 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400/50"
      aria-label={`${label}: ${hint}`}
    >
      <p className="text-xs sm:text-sm font-semibold">{label}</p>
      <p className="text-[9px] sm:text-[10px] text-slate-400">{hint}</p>
    </button>
  );
});

CmdItem.displayName = 'CmdItem';
