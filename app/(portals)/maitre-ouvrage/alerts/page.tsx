'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import { useAutoSyncCounts } from '@/hooks/useAutoSync';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { AlertDetailsPanel } from '@/components/features/bmo/alerts/AlertDetailsPanel';
import { AlertFilters } from '@/components/features/bmo/alerts/AlertFilters';
import { AlertPerformanceIndicators } from '@/components/features/bmo/alerts/AlertPerformanceIndicators';
import { EscalateToBMOModal } from '@/components/features/bmo/alerts/EscalateToBMOModal';
import { ResolveAlertModal } from '@/components/features/bmo/alerts/ResolveAlertModal';
import {
  systemAlerts,
  blockedDossiers,
  paymentsN1,
  contractsToSign,
  agendaEvents,
  plannedAbsences,
  bureaux,
} from '@/lib/data';

type TabType = 'overview' | 'heatmap' | 'journal';

type Severity = 'critical' | 'warning' | 'success' | 'info';
type AlertType = 'system' | 'blocked' | 'payment' | 'contract' | 'agenda';

type CombinedAlert = {
  id: string;
  type: AlertType;
  severity: Severity;
  title: string;
  description: string;
  bureau?: string;
  actionType: 'open' | 'substitute' | 'escalate' | 'validate' | 'resolve' | 'acknowledge';
  actionLabel: string;
  data?: unknown;
  createdAt?: string; // ISO ou dd/mm/yyyy ou autre
};

// --------------------
// Utils dates & triage
// --------------------
const parseFRDate = (str?: string | null): Date | null => {
  if (!str) return null;
  const raw = String(str).trim();
  if (!raw) return null;
  const [dd, mm, yyyy] = raw.split('/').map((n) => Number(n));
  if (!dd || !mm || !yyyy) return null;
  const d = new Date(yyyy, mm - 1, dd);
  return Number.isNaN(d.getTime()) ? null : d;
};

const parseAnyDate = (str?: string | null): Date | null => {
  if (!str) return null;
  const raw = String(str).trim();
  if (!raw) return null;

  // ISO / RFC
  if (raw.includes('T') || raw.includes('-')) {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return d;
  }

  // FR dd/mm/yyyy
  const fr = parseFRDate(raw);
  if (fr) return fr;

  // fallback
  const d2 = new Date(raw);
  return Number.isNaN(d2.getTime()) ? null : d2;
};

const daysUntil = (date: Date | null): number | null => {
  if (!date) return null;
  const today = new Date();
  const a = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const b = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = b.getTime() - a.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const severityRank: Record<Severity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
  success: 3,
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const toCsv = (rows: Array<Record<string, any>>) => {
  const cols = Array.from(
    rows.reduce((acc, r) => {
      Object.keys(r).forEach((k) => acc.add(k));
      return acc;
    }, new Set<string>())
  );
  const esc = (v: any) => {
    const s = String(v ?? '');
    const needs = s.includes('"') || s.includes(';') || s.includes('\n');
    const clean = s.replace(/"/g, '""');
    return needs ? `"${clean}"` : clean;
  };
  const header = cols.map(esc).join(';');
  const body = rows.map((r) => cols.map((c) => esc(r[c])).join(';')).join('\n');
  return `${header}\n${body}`;
};

function CmdItem({
  label,
  hint,
  onClick,
}: {
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left p-3 rounded-lg border border-slate-700/30 hover:bg-orange-500/5 transition-colors"
    >
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-[10px] text-slate-400">{hint}</p>
    </button>
  );
}

export default function AlertsPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const { darkMode } = useAppStore();
  const { addToast, actionLogs, addActionLog, openSubstitutionModal, openBlocageModal } =
    useBMOStore();

  // Navigation (query params / sidebar sync)
  const { updateFilters, getFilters } = usePageNavigation('alerts');

  // Sidebar count sync (critique + warning)
  useAutoSyncCounts(
    'alerts',
    () => systemAlerts.filter((a) => a.type === 'critical' || a.type === 'warning').length,
    { interval: 10000, immediate: true }
  );

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);

  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [alertToEscalateId, setAlertToEscalateId] = useState<string | null>(null);
  const [alertToResolveId, setAlertToResolveId] = useState<string | null>(null);

  const [filters, setFilters] = useState<{
    severity?: Severity;
    type?: AlertType;
    bureau?: string;
    period?: 'today' | 'week' | 'month';
  }>({});

  // UX "Inbox" : recherche + snooze (session)
  const [q, setQ] = useState('');
  const search = q.trim().toLowerCase();
  const [snoozed, setSnoozed] = useState<Record<string, boolean>>({});
  const [cmdOpen, setCmdOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);

  // Init depuis URL + (optionnel) usePageNavigation store
  useEffect(() => {
    // 1) URL
    const tab = sp.get('tab') as TabType | null;
    const id = sp.get('id');
    if (tab && ['overview', 'heatmap', 'journal'].includes(tab)) setActiveTab(tab);
    if (id) setSelectedAlert(id);

    // 2) Store (si hook gère une persistance)
    const stored = (getFilters?.() ?? {}) as any;
    if (stored && typeof stored === 'object') {
      // on ne force pas si l'URL impose déjà un état
      setFilters((prev) => ({
        severity: prev.severity ?? stored.severity,
        type: prev.type ?? stored.type,
        bureau: prev.bureau ?? stored.bureau,
        period: prev.period ?? stored.period,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Raccourcis : "/" focus recherche, Ctrl/⌘+K palette, ESC ferme palette / détails
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && key === 'k') {
        e.preventDefault();
        setCmdOpen(true);
      }
      if (!e.metaKey && !e.ctrlKey && key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (key === 'escape') {
        setCmdOpen(false);
        // Ne ferme pas brutalement le panneau si l'utilisateur navigue dans un modal
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Sync filtres vers navigation (sans casser si hook fait autre chose)
  useEffect(() => {
    try {
      updateFilters?.(filters);
    } catch {
      // ignore
    }
  }, [filters, updateFilters]);

  // Reset tab si on ferme le panneau détails
  useEffect(() => {
    if (!selectedAlert) setActiveTab('overview');
  }, [selectedAlert]);

  // ---------
  // Compteurs
  // ---------
  const alertCounts = useMemo(() => {
    const criticalAlerts = systemAlerts.filter((a) => a.type === 'critical').length;
    const blockedCritical = blockedDossiers.filter((d) => d.impact === 'critical' || d.delay >= 7).length;

    const warningAlerts = systemAlerts.filter((a) => a.type === 'warning').length;
    const blockedWarning = blockedDossiers.filter((d) => d.impact === 'high' && d.delay < 7).length;

    const successAlerts = systemAlerts.filter((a) => a.type === 'success').length;

    return {
      critical: criticalAlerts + blockedCritical,
      warning: warningAlerts + blockedWarning,
      success: successAlerts,
      total: systemAlerts.length + blockedDossiers.length,
    };
  }, []);

  // ------------------------
  // Build liste "toutes alertes"
  // ------------------------
  const allAlerts = useMemo<CombinedAlert[]>(() => {
    const alerts: CombinedAlert[] = [];

    // 1) Alertes système
    for (const a of systemAlerts) {
      alerts.push({
        id: a.id,
        type: 'system',
        severity: (a.type as Severity) ?? 'info',
        title: a.title,
        description: a.action,
        actionType: 'open',
        actionLabel: 'Voir détails',
        createdAt: new Date().toISOString(),
      });
    }

    // 2) Dossiers bloqués
    for (const d of blockedDossiers) {
      alerts.push({
        id: d.id,
        type: 'blocked',
        severity: d.delay >= 7 ? 'critical' : 'warning',
        title: `${d.type} bloqué depuis ${d.delay}j`,
        description: d.subject,
        bureau: d.bureau,
        actionType: 'substitute',
        actionLabel: 'Substituer',
        data: d,
        createdAt: d.blockedSince,
      });
    }

    // 3) Paiements : urgents (≤3j) + en retard (critique)
    for (const p of paymentsN1) {
      const due = parseFRDate(p.dueDate);
      const d = daysUntil(due);
      if (d === null) continue;

      const severity: Severity =
        d < 0 ? 'critical' : d <= 3 ? 'warning' : 'info';

      // On ne spam pas : on garde retard + urgent, pas "info"
      if (severity === 'info') continue;

      alerts.push({
        id: p.id,
        type: 'payment',
        severity,
        title: severity === 'critical' ? `Paiement en retard: ${p.beneficiary}` : `Paiement urgent: ${p.beneficiary}`,
        description: `${p.amount} FCFA • Échéance ${p.dueDate}`,
        bureau: p.bureau,
        actionType: 'validate',
        actionLabel: 'Valider',
        data: p,
        createdAt: p.date,
      });
    }

    // 4) Contrats : à signer (pending) + (optionnel) proche expiration si champ présent
    for (const c of contractsToSign) {
      if (c.status !== 'pending') continue;

      const exp = parseAnyDate((c as any).expiry ?? null);
      const d = daysUntil(exp);

      // Heuristique : si expiry existe et est proche => plus grave
      const severity: Severity =
        d !== null && d <= 3 ? 'critical' : d !== null && d <= 7 ? 'warning' : 'info';

      alerts.push({
        id: c.id,
        type: 'contract',
        severity,
        title: `Contrat à signer: ${c.subject}`,
        description: `${c.amount} • Statut: ${c.status}${d !== null ? ` • Exp. J-${d}` : ''}`,
        bureau: (c as any).bureau,
        actionType: 'open',
        actionLabel: 'Voir',
        data: c,
        createdAt: (c as any).createdAt ?? new Date().toISOString(),
      });
    }

    // 5) Agenda : deadlines dans 7 jours (si utile)
    for (const e of agendaEvents) {
      if ((e as any).type !== 'deadline') continue;
      const date = parseAnyDate((e as any).date ?? null);
      const d = daysUntil(date);
      if (d === null || d < 0 || d > 7) continue;

      alerts.push({
        id: (e as any).id ?? `DL-${(e as any).date}`,
        type: 'agenda',
        severity: d <= 2 ? 'warning' : 'info',
        title: `Échéance à J-${d}`,
        description: (e as any).title ?? (e as any).label ?? 'Deadline',
        bureau: (e as any).bureau,
        actionType: 'open',
        actionLabel: 'Voir',
        data: e,
        createdAt: (e as any).date,
      });
    }

    // Appliquer filtres + recherche + snooze
    let filtered = alerts.filter((a) => !snoozed[a.id]);

    if (filters.severity) filtered = filtered.filter((a) => a.severity === filters.severity);
    if (filters.type) filtered = filtered.filter((a) => a.type === filters.type);
    if (filters.bureau) filtered = filtered.filter((a) => a.bureau === filters.bureau);

    if (filters.period) {
      const now = new Date();
      const periodDays = filters.period === 'today' ? 1 : filters.period === 'week' ? 7 : 30;
      const cutoff = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

      filtered = filtered.filter((a) => {
        const d = parseAnyDate(a.createdAt ?? null);
        if (!d) return true;
        return d >= cutoff;
      });
    }

    if (search) {
      filtered = filtered.filter((a) => {
        const hay = `${a.id} ${a.type} ${a.severity} ${a.title} ${a.description} ${a.bureau ?? ''}`.toLowerCase();
        return hay.includes(search);
      });
    }

    // Tri : sévérité puis date (récent d'abord) puis id
    return filtered.sort((a, b) => {
      const s = severityRank[a.severity] - severityRank[b.severity];
      if (s !== 0) return s;

      const da = parseAnyDate(a.createdAt ?? null)?.getTime() ?? 0;
      const db = parseAnyDate(b.createdAt ?? null)?.getTime() ?? 0;
      if (db !== da) return db - da;

      return a.id.localeCompare(b.id);
    });
  }, [filters, search, snoozed]);

  // ------------------------
  // Performance indicators (réels, basés sur logs)
  // ------------------------
  const performanceStats = useMemo(() => {
    const total = allAlerts.length || 1;

    const logs = actionLogs.filter((l) => l.module === 'alerts');
    const resolved = logs.filter((l) => (l.details ?? '').toLowerCase().startsWith('résolu')).length;
    const escalated = logs.filter((l) => (l.details ?? '').toLowerCase().includes('escalad')).length;

    // "Critiques résolues" : logs résolu + alerte critique correspondante
    const resolvedCritical = logs
      .filter((l) => (l.details ?? '').toLowerCase().startsWith('résolu'))
      .filter((l) => {
        const a = allAlerts.find((x) => x.id === l.targetId);
        return a?.severity === 'critical';
      }).length;

    // Simulation si pas de données temps de résolution
    return {
      avgResolutionTime: '2.4h',
      resolutionRate: Math.round((resolved / total) * 100),
      escalationRate: Math.round((escalated / total) * 100),
      criticalResolved: resolvedCritical,
      criticalTotal: alertCounts.critical,
    };
  }, [actionLogs, allAlerts, alertCounts.critical]);

  // ------------------------
  // Heatmap risques par bureau
  // ------------------------
  const heatmapData = useMemo(() => {
    return bureaux.map((bureau) => {
      const blocked = blockedDossiers.filter((d) => d.bureau === bureau.code);
      const absences = plannedAbsences.filter((a) => a.bureau === bureau.code);

      // Deadlines par bureau uniquement si champ bureau existe (sinon 0 pour éviter "faux risque" global)
      const upcomingDeadlines = agendaEvents.filter((e: any) => {
        if (e.type !== 'deadline') return false;
        if (e.bureau && e.bureau !== bureau.code) return false;

        const d = parseAnyDate(e.date ?? null);
        const diffDays = daysUntil(d);
        return diffDays !== null && diffDays >= 0 && diffDays <= 7;
      });

      let riskScore = 0;
      riskScore += blocked.length * 20;
      riskScore += blocked.filter((b) => b.delay >= 7).length * 30;
      riskScore += absences.length * 15;
      riskScore += upcomingDeadlines.length * 10;

      const score = clamp(riskScore, 0, 100);
      const riskLevel = score >= 60 ? 'critical' : score >= 30 ? 'warning' : score > 0 ? 'low' : 'none';

      return {
        bureau: bureau.code,
        bureauName: bureau.name,
        color: bureau.color,
        blocked: blocked.length,
        blockedCritical: blocked.filter((b) => b.delay >= 7).length,
        absences: absences.length,
        deadlines: upcomingDeadlines.length,
        riskScore: score,
        riskLevel,
        details: {
          blockedItems: blocked,
          absenceItems: absences,
          deadlineItems: upcomingDeadlines,
        },
      };
    });
  }, []);

  // ------------------------
  // Sélection & panneau détails
  // ------------------------
  const selectedAlertData = useMemo(() => {
    if (!selectedAlert) return null;
    return allAlerts.find((a) => a.id === selectedAlert) || null;
  }, [selectedAlert, allAlerts]);

  // ------------------------
  // Actions sur alerte
  // ------------------------
  const handleAcknowledge = (alertId: string, alertTitle: string) => {
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      action: 'validation',
      module: 'alerts',
      targetId: alertId,
      targetType: 'Alerte',
      targetLabel: alertTitle,
      details: 'Alerte acquittée',
    });
    addToast(`Alerte ${alertId} acquittée`, 'success');
  };

  const handleAlertAction = (alert: CombinedAlert, action?: CombinedAlert['actionType']) => {
    const actionType = action || alert.actionType;

    switch (actionType) {
      case 'substitute':
        if (alert.data) openSubstitutionModal(alert.data as typeof blockedDossiers[0]);
        return;

      case 'escalate':
        setAlertToEscalateId(alert.id);
        setShowEscalateModal(true);
        return;

      case 'resolve':
        setAlertToResolveId(alert.id);
        setShowResolveModal(true);
        return;

      case 'validate':
        router.push(`/maitre-ouvrage/validation-paiements?id=${alert.id}`);
        return;

      case 'acknowledge':
        handleAcknowledge(alert.id, alert.title);
        return;

      case 'open':
      default:
        setSelectedAlert(alert.id);
        return;
    }
  };

  const handleEscalateToBMO = (message: string, attachments?: string[]) => {
    if (!alertToEscalateId) return;
    const alert = allAlerts.find((a) => a.id === alertToEscalateId);
    if (!alert) return;

    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      action: 'modification',
      module: 'alerts',
      targetId: alert.id,
      targetType: alert.type,
      targetLabel: alert.title,
      details: `Escaladée au BMO: ${message.substring(0, 140)}${message.length > 140 ? '…' : ''}`,
      bureau: alert.bureau,
    });

    addToast(`Alerte ${alert.id} escaladée au BMO`, 'success');
    setShowEscalateModal(false);
    setAlertToEscalateId(null);
  };

  const handleResolveAlert = (action: string, data: any) => {
    if (!alertToResolveId) return;
    const alert = allAlerts.find((a) => a.id === alertToResolveId);
    if (!alert) return;

    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      action: 'validation',
      module: 'alerts',
      targetId: alert.id,
      targetType: alert.type,
      targetLabel: alert.title,
      details: `Résolu: ${data?.note || action || 'OK'}`,
      bureau: alert.bureau,
    });

    addToast(`Alerte ${alert.id} résolue`, 'success');
    setShowResolveModal(false);
    setAlertToResolveId(null);
  };

  const handleFilterChange = (key: string, value: string | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => setFilters({});

  const exportFiltered = () => {
    const rows = allAlerts.slice(0, 500).map((a) => ({
      id: a.id,
      type: a.type,
      severity: a.severity,
      bureau: a.bureau ?? '',
      title: a.title,
      description: a.description,
      createdAt: a.createdAt ?? '',
    }));
    const csv = toCsv(rows);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bmo-alertes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    addToast('📤 Export CSV généré', 'success');
  };

  const snoozeAlert = (id: string) => {
    setSnoozed((prev) => ({ ...prev, [id]: true }));
    addToast('🕒 Alerte masquée pour la session', 'info');
  };

  const bulkAcknowledge = (severity?: Severity) => {
    const targets = allAlerts
      .filter((a) => (severity ? a.severity === severity : true))
      .slice(0, 25); // garde-fou

    if (targets.length === 0) {
      addToast('Aucune alerte à acquitter', 'info');
      return;
    }

    for (const a of targets) {
      handleAcknowledge(a.id, a.title);
    }
    addToast(`✓ ${targets.length} alerte(s) acquittée(s)`, 'success');
  };

  // ------------------------
  // UI helpers
  // ------------------------
  const severityBadgeVariant = (s: Severity) =>
    s === 'critical' ? 'urgent' : s === 'warning' ? 'warning' : s === 'success' ? 'success' : 'info';

  const cardStyle = (s: Severity) =>
    s === 'critical'
      ? 'bg-red-500/10 border-red-500/30'
      : s === 'warning'
      ? 'bg-amber-500/10 border-amber-500/30'
      : s === 'success'
      ? 'bg-emerald-500/10 border-emerald-500/30'
      : 'bg-blue-500/10 border-blue-500/30';

  const icon = (s: Severity) =>
    s === 'critical' ? '🚨' : s === 'warning' ? '⚠️' : s === 'success' ? '✅' : 'ℹ️';

  return (
    <div className="space-y-4">
      {/* Header + outils de triage */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            ⚠️ Alertes & Risques
            <Badge variant="warning">{allAlerts.length}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Triage rapide • "/" recherche • "Ctrl/⌘+K" commandes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => setCmdOpen(true)}>
            ⌘K
          </Button>
          <Button size="sm" variant="ghost" onClick={exportFiltered}>
            📤 Export
          </Button>
        </div>
      </div>

      {/* Barre recherche */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={searchRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher (id, titre, bureau, description)…"
          className={cn(
            'flex-1 min-w-[240px] px-3 py-2 rounded text-sm',
            darkMode ? 'bg-slate-800 border border-slate-600' : 'bg-white border border-gray-300'
          )}
        />
        <Button size="sm" variant="ghost" onClick={() => setQ('')}>
          Effacer
        </Button>

        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => bulkAcknowledge('warning')}>
            ✓ Acquitter warnings
          </Button>
          <Button size="sm" variant="ghost" onClick={() => bulkAcknowledge('critical')}>
            ✓ Acquitter critiques
          </Button>
        </div>
      </div>

      {/* Indicateurs de performance */}
      <AlertPerformanceIndicators stats={performanceStats} />

      {/* Compteurs par gravité */}
      <div className="grid grid-cols-4 gap-3">
        <Card
          className="border-red-500/30 bg-red-500/5 cursor-pointer hover:border-red-500/50 transition-colors"
          onClick={() => handleFilterChange('severity', filters.severity === 'critical' ? undefined : 'critical')}
        >
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">🚨</span>
              <p className="text-3xl font-bold text-red-400">{alertCounts.critical}</p>
            </div>
            <p className="text-xs text-slate-400 mt-1">Critiques</p>
            <p className="text-[10px] text-red-400">Action immédiate</p>
          </CardContent>
        </Card>

        <Card
          className="border-amber-500/30 bg-amber-500/5 cursor-pointer hover:border-amber-500/50 transition-colors"
          onClick={() => handleFilterChange('severity', filters.severity === 'warning' ? undefined : 'warning')}
        >
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">⚠️</span>
              <p className="text-3xl font-bold text-amber-400">{alertCounts.warning}</p>
            </div>
            <p className="text-xs text-slate-400 mt-1">Avertissements</p>
            <p className="text-[10px] text-amber-400">Surveillance</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">✅</span>
              <p className="text-3xl font-bold text-emerald-400">{alertCounts.success}</p>
            </div>
            <p className="text-xs text-slate-400 mt-1">Succès</p>
            <p className="text-[10px] text-emerald-400">Confirmations</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">📊</span>
              <p className="text-3xl font-bold text-blue-400">{allAlerts.length}</p>
            </div>
            <p className="text-xs text-slate-400 mt-1">Total</p>
            <p className="text-[10px] text-blue-400">Liste filtrée</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres dynamiques (composant existant) */}
      <AlertFilters
        filters={filters as any}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        alertCounts={alertCounts as any}
      />

      {/* Onglets */}
      <div className="flex gap-2 border-b border-slate-700/50 pb-2">
        <Button size="sm" variant={activeTab === 'overview' ? 'default' : 'ghost'} onClick={() => setActiveTab('overview')}>
          📋 Vue d'ensemble
        </Button>
        <Button size="sm" variant={activeTab === 'heatmap' ? 'default' : 'ghost'} onClick={() => setActiveTab('heatmap')}>
          🔥 Heatmap risques
        </Button>
        <Button size="sm" variant={activeTab === 'journal' ? 'default' : 'ghost'} onClick={() => setActiveTab('journal')}>
          📜 Journal actions ({actionLogs.filter((l) => l.module === 'alerts').length})
        </Button>
      </div>

      {/* Tab: Vue d'ensemble */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {allAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-sm text-slate-400">Aucune alerte ne correspond aux filtres/recherche.</p>
                <Button size="sm" variant="ghost" onClick={handleResetFilters} className="mt-3">
                  Réinitialiser les filtres
                </Button>
              </CardContent>
            </Card>
          ) : (
            allAlerts.map((a) => (
              <Card
                key={a.id}
                className={cn(cardStyle(a.severity), 'cursor-pointer hover:shadow-lg transition-all')}
                onClick={() => setSelectedAlert(a.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{icon(a.severity)}</span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={cn('font-mono text-[10px]', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                          {a.id}
                        </span>
                        <Badge variant={severityBadgeVariant(a.severity)} className="text-[9px]">
                          {a.severity}
                        </Badge>
                        <Badge variant="default" className="text-[9px]">
                          {a.type}
                        </Badge>
                        {a.bureau && <BureauTag bureau={a.bureau} />}
                      </div>

                      <h3 className="font-bold text-sm mb-1">{a.title}</h3>
                      <p className="text-xs text-slate-400">{a.description}</p>

                      {a.createdAt && (
                        <p className="text-[10px] text-slate-500 mt-1">
                          {parseAnyDate(a.createdAt)?.toLocaleString('fr-FR') ?? a.createdAt}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <Button
                        size="xs"
                        variant={a.severity === 'critical' ? 'destructive' : 'warning'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAlertAction(a);
                        }}
                      >
                        {a.actionLabel}
                      </Button>

                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAlertAction(a, 'acknowledge');
                        }}
                      >
                        ✓ Acquitter
                      </Button>

                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          snoozeAlert(a.id);
                        }}
                        title="Masquer pour la session"
                      >
                        🕒 Snooze
                      </Button>

                      {a.severity === 'critical' && (
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAlertAction(a, 'escalate');
                          }}
                        >
                          ⬆️ Escalader
                        </Button>
                      )}

                      <Button
                        size="xs"
                        variant={a.severity === 'critical' ? 'destructive' : 'warning'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAlertAction(a, 'resolve');
                        }}
                      >
                        🔧 Résoudre
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab: Heatmap risques */}
      {activeTab === 'heatmap' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">🔥 Carte de chaleur des risques par bureau</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {heatmapData.map((d) => (
                  <div
                    key={d.bureau}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all cursor-pointer hover:scale-105',
                      d.riskLevel === 'critical'
                        ? 'border-red-500 bg-red-500/20'
                        : d.riskLevel === 'warning'
                        ? 'border-amber-500 bg-amber-500/20'
                        : d.riskLevel === 'low'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-600 bg-slate-700/20'
                    )}
                    onClick={() => {
                      if (d.blocked > 0) {
                        handleFilterChange('bureau', d.bureau);
                        setActiveTab('overview');
                        addToast(`Filtre appliqué: ${d.bureau}`, d.riskLevel === 'critical' ? 'error' : 'warning');
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm" style={{ color: d.color }}>
                        {d.bureau}
                      </span>
                      <span className="text-lg">
                        {d.riskLevel === 'critical' ? '🔴' : d.riskLevel === 'warning' ? '🟠' : d.riskLevel === 'low' ? '🟡' : '🟢'}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 truncate mb-2">{d.bureauName}</p>

                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          d.riskLevel === 'critical'
                            ? 'bg-red-500'
                            : d.riskLevel === 'warning'
                            ? 'bg-amber-500'
                            : d.riskLevel === 'low'
                            ? 'bg-blue-500'
                            : 'bg-emerald-500'
                        )}
                        style={{ width: `${d.riskScore}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
                      <div>
                        <p className="font-bold text-red-400">{d.blocked}</p>
                        <p className="text-slate-500">Bloqués</p>
                      </div>
                      <div>
                        <p className="font-bold text-amber-400">{d.absences}</p>
                        <p className="text-slate-500">Absences</p>
                      </div>
                      <div>
                        <p className="font-bold text-blue-400">{d.deadlines}</p>
                        <p className="text-slate-500">Échéances</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Légende */}
          <div className="flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span>Critique (≥60)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Attention (30-59)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Faible (1-29)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Aucun risque</span>
            </div>
          </div>

          {/* Détails des risques critiques */}
          {heatmapData.filter((d) => d.riskLevel === 'critical').length > 0 && (
            <Card className="border-red-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-red-400">🚨 Bureaux en situation critique</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {heatmapData
                  .filter((d) => d.riskLevel === 'critical')
                  .map((d) => (
                    <div key={d.bureau} className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <BureauTag bureau={d.bureau} />
                          <span className="text-sm font-semibold">{d.bureauName}</span>
                        </div>
                        <Badge variant="urgent">Score: {d.riskScore}</Badge>
                      </div>

                      <div className="space-y-1">
                        {d.details.blockedItems.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between text-xs">
                            <span className={cn('font-mono', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                              {item.id}
                            </span>
                            <span className="truncate flex-1 mx-2">{item.subject}</span>
                            <Badge variant="urgent">J+{item.delay}</Badge>
                            <Button size="xs" variant="ghost" className="ml-2" onClick={() => openBlocageModal(item)}>
                              👁️
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tab: Journal des actions */}
      {activeTab === 'journal' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>📜 Journal des actions sur alertes</span>
              <Badge variant="info">{actionLogs.filter((l) => l.module === 'alerts').length} entrées</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {actionLogs.filter((l) => l.module === 'alerts').length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Aucune action enregistrée</p>
            ) : (
              <div className="space-y-2">
                {actionLogs
                  .filter((log) => log.module === 'alerts')
                  .slice(0, 20)
                  .map((log) => (
                    <div
                      key={log.id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors',
                        darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                      )}
                      onClick={() => {
                        const a = allAlerts.find((x) => x.id === log.targetId);
                        if (a) setSelectedAlert(a.id);
                      }}
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                          log.action === 'validation'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : log.action === 'modification'
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-blue-500/20 text-blue-400'
                        )}
                      >
                        {log.userName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={cn('font-mono text-[10px]', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                            {log.id}
                          </span>
                          <Badge variant="default">{log.action}</Badge>
                          {log.bureau && <BureauTag bureau={log.bureau} />}
                        </div>
                        <p className="text-xs font-semibold">
                          {log.userName} ({log.userRole})
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {log.targetLabel || log.targetId} • {log.details}
                        </p>
                      </div>

                      <div className="text-right text-[10px] text-slate-500">
                        {new Date(log.timestamp).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {actionLogs.filter((log) => log.module === 'alerts').length > 20 && (
              <div className="text-center mt-4">
                <Link href="/maitre-ouvrage/logs">
                  <Button size="sm" variant="ghost">
                    Voir tout le journal →
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Panneau détails */}
      {selectedAlertData && (
        <AlertDetailsPanel
          isOpen={selectedAlert !== null}
          onClose={() => setSelectedAlert(null)}
          alert={selectedAlertData as any}
          onAction={(action, alertId) => {
            const a = allAlerts.find((x) => x.id === alertId);
            if (a) handleAlertAction(a, action as any);
          }}
        />
      )}

      {/* Modale Escalade */}
      {alertToEscalateId && (() => {
        const a = allAlerts.find((x) => x.id === alertToEscalateId);
        if (!a) return null;
        return (
          <EscalateToBMOModal
            key={alertToEscalateId}
            isOpen={showEscalateModal}
            onClose={() => {
              setShowEscalateModal(false);
              setAlertToEscalateId(null);
            }}
            onEscalate={handleEscalateToBMO}
            alert={{
              id: a.id,
              title: a.title,
              description: a.description,
              bureau: a.bureau,
              type: a.type,
            }}
          />
        );
      })()}

      {/* Modale Résoudre */}
      {alertToResolveId && (() => {
        const a = allAlerts.find((x) => x.id === alertToResolveId);
        if (!a) return null;
        return (
          <ResolveAlertModal
            key={alertToResolveId}
            isOpen={showResolveModal}
            onClose={() => {
              setShowResolveModal(false);
              setAlertToResolveId(null);
            }}
            onResolve={handleResolveAlert}
            alert={{
              id: a.id,
              title: a.title,
              description: a.description,
              bureau: a.bureau,
              type: a.type,
              data: a.data,
            }}
          />
        );
      })()}

      {/* Palette de commandes */}
      {cmdOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-xl">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">⌘K — Commandes rapides</p>
                  <p className="text-xs text-slate-400">Astuce : "/" pour focus la recherche</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => setCmdOpen(false)}>
                  Fermer
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-2">
                <CmdItem label="📋 Vue d'ensemble" hint="Toutes alertes filtrées" onClick={() => { setActiveTab('overview'); setCmdOpen(false); }} />
                <CmdItem label="🔥 Heatmap" hint="Risques par bureau" onClick={() => { setActiveTab('heatmap'); setCmdOpen(false); }} />
                <CmdItem label="📜 Journal" hint="Actions & traçabilité" onClick={() => { setActiveTab('journal'); setCmdOpen(false); }} />
                <CmdItem label="💳 Paiements" hint="Urgents / retards" onClick={() => router.push('/maitre-ouvrage/validation-paiements')} />
                <CmdItem label="🔄 Substitution" hint="Déblocage chaîne" onClick={() => router.push('/maitre-ouvrage/substitution')} />
                <CmdItem label="📤 Export CSV" hint="Liste filtrée (max 500)" onClick={() => { exportFiltered(); setCmdOpen(false); }} />
              </div>

              <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400">
                <span>ESC : fermer</span>
                <span>Ctrl/⌘+K : ouvrir</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
