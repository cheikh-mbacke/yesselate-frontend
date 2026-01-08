'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { auditEnriched } from '@/lib/data';

type AuditStatus = 'conforme' | 'attention' | 'non-conforme';
type ViewTab = 'findings' | 'actions' | 'docs' | 'trace';

type FindingStatus = 'open' | 'in_progress' | 'resolved';
type FindingSeverity = 'critical' | 'major' | 'minor' | 'observation';

type ActionStatus = 'todo' | 'in_progress' | 'completed' | 'overdue';

type AuditFinding = {
  id: string;
  severity: FindingSeverity;
  status: FindingStatus;
  description: string;
  date: string;
};

type AuditAction = {
  id: string;
  title: string;
  responsible: string;
  deadline: string;
  status: ActionStatus;
};

type AuditItem = {
  id: string;
  status: AuditStatus;
  score: number;
  category: string;
  type: string;
  description: string;
  responsible: string;
  lastCheck: string;
  nextCheck: string;
  findings: AuditFinding[];
  actionPlan: AuditAction[];
  documents: string[];
};

type StatusStyles = {
  borderLeft: string;
  text: string;
  bar: string;
  softBg: string;
};

const STATUS_STYLES: Record<AuditStatus, StatusStyles> = {
  conforme: {
    borderLeft: 'border-l-emerald-500',
    text: 'text-emerald-400',
    bar: 'bg-emerald-500',
    softBg: 'bg-emerald-500/10 border-emerald-500/30',
  },
  attention: {
    borderLeft: 'border-l-amber-500',
    text: 'text-amber-400',
    bar: 'bg-amber-500',
    softBg: 'bg-amber-500/10 border-amber-500/30',
  },
  'non-conforme': {
    borderLeft: 'border-l-red-500',
    text: 'text-red-400',
    bar: 'bg-red-500',
    softBg: 'bg-red-500/10 border-red-500/30',
  },
};

const FINDING_SEVERITY_BADGE: Record<FindingSeverity, 'urgent' | 'warning' | 'info' | 'default'> = {
  critical: 'urgent',
  major: 'warning',
  minor: 'info',
  observation: 'default',
};

const FINDING_STATUS_BADGE: Record<FindingStatus, 'warning' | 'info' | 'success' | 'default'> = {
  open: 'warning',
  in_progress: 'info',
  resolved: 'success',
};

const ACTION_STATUS_BADGE: Record<ActionStatus, 'urgent' | 'info' | 'success' | 'default'> = {
  overdue: 'urgent',
  in_progress: 'info',
  completed: 'success',
  todo: 'default',
};

// Hash simple côté navigateur (SHA-256 via WebCrypto). Pas SHA3-256 natif.
async function sha256Hex(input: string) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function AuditPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();

  const data = auditEnriched as unknown as AuditItem[];

  const [selectedAudit, setSelectedAudit] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<ViewTab>('findings');

  // Filtres / recherche / tri
  const [statusFilter, setStatusFilter] = useState<'all' | AuditStatus>('all');
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'score_desc' | 'score_asc' | 'nextCheck' | 'lastCheck'>('score_desc');

  // WHY: reset onglet détail quand on change d'audit
  useEffect(() => {
    if (selectedAudit) setViewTab('findings');
  }, [selectedAudit]);

  const selectedA = useMemo(
    () => (selectedAudit ? data.find((a) => a.id === selectedAudit) ?? null : null),
    [selectedAudit, data]
  );

  const stats = useMemo(() => {
    const total = data.length;
    const conforme = data.filter((a) => a.status === 'conforme').length;
    const attention = data.filter((a) => a.status === 'attention').length;
    const nonConforme = data.filter((a) => a.status === 'non-conforme').length;

    const avgScore =
      total === 0 ? 0 : Math.round(data.reduce((acc, a) => acc + (Number.isFinite(a.score) ? a.score : 0), 0) / total);

    const totalFindings = data.reduce((acc, a) => acc + (a.findings?.length ?? 0), 0);
    const openFindings = data.reduce((acc, a) => acc + (a.findings?.filter((f) => f.status === 'open').length ?? 0), 0);
    const overdueActions = data.reduce(
      (acc, a) => acc + (a.actionPlan?.filter((ap) => ap.status === 'overdue').length ?? 0),
      0
    );

    return { total, conforme, attention, nonConforme, avgScore, totalFindings, openFindings, overdueActions };
  }, [data]);

  const filteredAudits = useMemo(() => {
    const query = q.trim().toLowerCase();

    const base = data.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;

      const openCount = a.findings?.filter((f) => f.status === 'open').length ?? 0;
      const overdueCount = a.actionPlan?.filter((ap) => ap.status === 'overdue').length ?? 0;

      if (onlyOpen && openCount === 0) return false;
      if (onlyOverdue && overdueCount === 0) return false;

      if (!query) return true;

      const hay = [
        a.id,
        a.type,
        a.category,
        a.description,
        a.responsible,
        a.status,
        a.lastCheck,
        a.nextCheck,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return hay.includes(query);
    });

    const sorted = [...base].sort((a, b) => {
      if (sort === 'score_desc') return (b.score ?? 0) - (a.score ?? 0);
      if (sort === 'score_asc') return (a.score ?? 0) - (b.score ?? 0);

      // NOTE: on garde simple (strings) car format data inconnu.
      // Si tu veux: on peut parser en date réelle si tu normalises (YYYY-MM-DD).
      if (sort === 'nextCheck') return String(a.nextCheck).localeCompare(String(b.nextCheck));
      return String(a.lastCheck).localeCompare(String(b.lastCheck));
    });

    return sorted;
  }, [data, statusFilter, onlyOpen, onlyOverdue, q, sort]);

  const log = useCallback(
    (payload: { action: string; targetId: string; targetType: string; details: string }) => {
      addActionLog({
        userId: 'USR-001',
        userName: 'A. DIALLO',
        userRole: 'Directeur Général',
        module: 'audit',
        // WHY: Cast vers ActionLogType car payload.action est string mais ActionLogType est plus restrictif
        action: payload.action as any,
        targetId: payload.targetId,
        targetType: payload.targetType,
        details: payload.details,
      });
    },
    [addActionLog]
  );

  const handleCreateAction = useCallback(
    (auditId: string) => {
      log({ action: 'create_action', targetId: auditId, targetType: 'AuditItem', details: 'Création action corrective' });
      addToast('Action corrective créée (traçabilité enregistrée)', 'success');
    },
    [log, addToast]
  );

  const handleMarkResolved = useCallback(
    (findingId: string) => {
      log({
        action: 'resolve_finding',
        targetId: findingId,
        targetType: 'AuditFinding',
        details: `Constat ${findingId} marqué résolu`,
      });
      addToast('Constat marqué comme résolu', 'success');
    },
    [log, addToast]
  );

  const handleStartFinding = useCallback(
    (findingId: string) => {
      log({
        action: 'start_finding',
        targetId: findingId,
        targetType: 'AuditFinding',
        details: `Constat ${findingId} pris en charge`,
      });
      addToast('Constat passé "en cours" (log DG)', 'info');
    },
    [log, addToast]
  );

  const handleMarkAction = useCallback(
    (actionId: string, newStatus: ActionStatus) => {
      log({
        action: 'update_action_status',
        targetId: actionId,
        targetType: 'AuditAction',
        details: `Action ${actionId} → ${newStatus}`,
      });
      addToast(`Action mise à jour → ${newStatus}`, newStatus === 'completed' ? 'success' : 'info');
    },
    [log, addToast]
  );

  const [lastReportHash, setLastReportHash] = useState<string | null>(null);

  const handleGenerateReport = useCallback(async () => {
    if (!selectedA) return;
    const payload = {
      auditId: selectedA.id,
      status: selectedA.status,
      score: selectedA.score,
      findings: selectedA.findings?.map((f) => ({ id: f.id, severity: f.severity, status: f.status })) ?? [],
      actionPlan: selectedA.actionPlan?.map((a) => ({ id: a.id, status: a.status, deadline: a.deadline })) ?? [],
      generatedAt: new Date().toISOString(),
    };

    const hash = await sha256Hex(JSON.stringify(payload));
    setLastReportHash(hash);

    log({
      action: 'generate_report',
      targetId: selectedA.id,
      targetType: 'AuditReport',
      details: `Rapport généré (SHA-256): ${hash}`,
    });

    addToast('Rapport généré + hash enregistré au registre', 'success');
  }, [selectedA, log, addToast]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🔍 Audit & Conformité
            <Badge variant="info">{stats.total} audits</Badge>
          </h1>
          <p className="text-sm text-slate-400">Scores, constats, plans d&apos;actions et conformité OHADA</p>
        </div>
      </div>

      {/* Alertes */}
      {(stats.openFindings > 0 || stats.overdueActions > 0) && (
        <Card className="border-amber-500/50 bg-amber-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h3 className="font-bold text-amber-400">Actions requises</h3>
                <p className="text-sm text-slate-400">
                  {stats.openFindings} constat(s) ouvert(s) • {stats.overdueActions} action(s) en retard
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.avgScore}%</p>
            <p className="text-[10px] text-slate-400">Score moyen</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.conforme}</p>
            <p className="text-[10px] text-slate-400">Conformes</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.attention}</p>
            <p className="text-[10px] text-slate-400">Attention</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.nonConforme}</p>
            <p className="text-[10px] text-slate-400">Non-conformes</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.totalFindings}</p>
            <p className="text-[10px] text-slate-400">Constats</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">{stats.openFindings}</p>
            <p className="text-[10px] text-slate-400">Ouverts</p>
          </CardContent>
        </Card>
      </div>

      {/* Barre filtres */}
      <Card className={cn(darkMode ? 'bg-slate-900/30' : 'bg-white')}>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={statusFilter === 'all' ? 'default' : 'secondary'} onClick={() => setStatusFilter('all')}>
                Tous
              </Button>
              <Button size="sm" variant={statusFilter === 'conforme' ? 'default' : 'secondary'} onClick={() => setStatusFilter('conforme')}>
                ✅ Conforme
              </Button>
              <Button size="sm" variant={statusFilter === 'attention' ? 'default' : 'secondary'} onClick={() => setStatusFilter('attention')}>
                ⚠️ Attention
              </Button>
              <Button size="sm" variant={statusFilter === 'non-conforme' ? 'default' : 'secondary'} onClick={() => setStatusFilter('non-conforme')}>
                🧨 Non-conforme
              </Button>

              <Button size="sm" variant={onlyOpen ? 'default' : 'secondary'} onClick={() => setOnlyOpen((v) => !v)}>
                Constats ouverts
              </Button>
              <Button size="sm" variant={onlyOverdue ? 'default' : 'secondary'} onClick={() => setOnlyOverdue((v) => !v)}>
                Actions en retard
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher (id, type, catégorie, responsable...)"
                className={cn(
                  'h-9 w-72 max-w-full rounded-md border px-3 text-sm outline-none',
                  darkMode ? 'bg-slate-900/40 border-slate-700 text-slate-200' : 'bg-white border-slate-200'
                )}
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className={cn(
                  'h-9 rounded-md border px-3 text-sm',
                  darkMode ? 'bg-slate-900/40 border-slate-700 text-slate-200' : 'bg-white border-slate-200'
                )}
              >
                <option value="score_desc">Score ↓</option>
                <option value="score_asc">Score ↑</option>
                <option value="nextCheck">Prochain contrôle</option>
                <option value="lastCheck">Dernier contrôle</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Liste audits */}
        <div className="lg:col-span-2 space-y-3">
          {filteredAudits.map((audit) => {
            const isSelected = selectedAudit === audit.id;
            const styles = STATUS_STYLES[audit.status] ?? STATUS_STYLES.attention;

            const openCount = audit.findings?.filter((f) => f.status === 'open').length ?? 0;
            const overdueCount = audit.actionPlan?.filter((a) => a.status === 'overdue').length ?? 0;

            return (
              <Card
                key={audit.id}
                className={cn(
                  'cursor-pointer transition-all border-l-4',
                  isSelected ? 'ring-2 ring-blue-500' : 'hover:border-blue-500/50',
                  styles.borderLeft
                )}
                onClick={() => setSelectedAudit(audit.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-blue-400">{audit.id}</span>
                        <Badge variant={audit.status === 'conforme' ? 'success' : audit.status === 'attention' ? 'warning' : 'urgent'}>
                          {audit.status}
                        </Badge>
                        <Badge variant="default">{audit.category}</Badge>
                        {overdueCount > 0 && <Badge variant="urgent">{overdueCount} en retard</Badge>}
                        {openCount > 0 && <Badge variant="warning">{openCount} ouvert(s)</Badge>}
                      </div>
                      <h3 className="font-bold mt-1">{audit.type}</h3>
                      <p className="text-sm text-slate-400">{audit.description}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn('text-3xl font-bold', styles.text)}>{audit.score}%</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-400 mb-3">
                    <span>Responsable: {audit.responsible}</span>
                    <span>Dernier contrôle: {audit.lastCheck}</span>
                    <span>Prochain: {audit.nextCheck}</span>
                  </div>

                  {/* Barre score */}
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                    <div className={cn('h-full transition-all', styles.bar)} style={{ width: `${Math.max(0, Math.min(100, audit.score))}%` }} />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {audit.findings?.length > 0 && (
                      <Badge variant={openCount > 0 ? 'warning' : 'success'}>
                        {audit.findings.length} constat(s) • {openCount} ouvert(s)
                      </Badge>
                    )}
                    {audit.actionPlan?.length > 0 && <Badge variant="info">{audit.actionPlan.length} action(s)</Badge>}
                    {audit.documents?.length > 0 && <Badge variant="default">📎 {audit.documents.length} doc(s)</Badge>}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredAudits.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-slate-400">Aucun audit ne correspond aux filtres.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panel détail */}
        <div className="lg:col-span-1">
          {selectedA ? (
            <Card className="sticky top-4">
              <CardContent className="p-4">
                <div className="mb-4 pb-4 border-b border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={selectedA.status === 'conforme' ? 'success' : selectedA.status === 'attention' ? 'warning' : 'urgent'}>
                      {selectedA.status}
                    </Badge>
                    <p className={cn('text-2xl font-bold', STATUS_STYLES[selectedA.status].text)}>{selectedA.score}%</p>
                  </div>
                  <span className="font-mono text-xs text-blue-400">{selectedA.id}</span>
                  <h3 className="font-bold">{selectedA.type}</h3>
                  <p className="text-sm text-slate-400 mt-1">{selectedA.category} • Resp. {selectedA.responsible}</p>
                </div>

                {/* Onglets */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  <Button size="sm" variant={viewTab === 'findings' ? 'default' : 'secondary'} onClick={() => setViewTab('findings')}>
                    Constats ({selectedA.findings?.length ?? 0})
                  </Button>
                  <Button size="sm" variant={viewTab === 'actions' ? 'default' : 'secondary'} onClick={() => setViewTab('actions')}>
                    Actions ({selectedA.actionPlan?.length ?? 0})
                  </Button>
                  <Button size="sm" variant={viewTab === 'docs' ? 'default' : 'secondary'} onClick={() => setViewTab('docs')}>
                    Docs ({selectedA.documents?.length ?? 0})
                  </Button>
                  <Button size="sm" variant={viewTab === 'trace' ? 'default' : 'secondary'} onClick={() => setViewTab('trace')}>
                    Traçabilité
                  </Button>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {viewTab === 'findings' && (
                    selectedA.findings?.length ? (
                      selectedA.findings.map((finding) => (
                        <div
                          key={finding.id}
                          className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant={FINDING_SEVERITY_BADGE[finding.severity] ?? 'default'}>{finding.severity}</Badge>
                            <Badge variant={FINDING_STATUS_BADGE[finding.status] ?? 'default'}>{finding.status}</Badge>
                          </div>
                          <p className="text-sm">{finding.description}</p>
                          <p className="text-xs text-slate-400 mt-1">{finding.date}</p>

                          {finding.status === 'open' && (
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" variant="info" className="flex-1" onClick={() => handleStartFinding(finding.id)}>
                                ▶ En cours
                              </Button>
                              <Button size="sm" variant="success" className="flex-1" onClick={() => handleMarkResolved(finding.id)}>
                                ✓ Résolu
                              </Button>
                            </div>
                          )}

                          {finding.status === 'in_progress' && (
                            <Button size="sm" variant="success" className="mt-2 w-full" onClick={() => handleMarkResolved(finding.id)}>
                              ✓ Clôturer
                            </Button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-center py-4">Aucun constat</p>
                    )
                  )}

                  {viewTab === 'actions' && (
                    selectedA.actionPlan?.length ? (
                      selectedA.actionPlan.map((action) => (
                        <div
                          key={action.id}
                          className={cn(
                            'p-3 rounded',
                            darkMode ? 'bg-slate-700/30' : 'bg-gray-100',
                            action.status === 'overdue' && 'border border-red-500/50'
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant={ACTION_STATUS_BADGE[action.status] ?? 'default'}>{action.status}</Badge>
                            <span className="font-mono text-xs text-slate-400">{action.id}</span>
                          </div>
                          <p className="text-sm font-medium">{action.title}</p>
                          <p className="text-xs text-slate-400">{action.responsible} • Échéance: {action.deadline}</p>

                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="info" className="flex-1" onClick={() => handleMarkAction(action.id, 'in_progress')}>
                              ▶ En cours
                            </Button>
                            <Button size="sm" variant="success" className="flex-1" onClick={() => handleMarkAction(action.id, 'completed')}>
                              ✓ Terminé
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-center py-4">Aucune action</p>
                    )
                  )}

                  {viewTab === 'docs' && (
                    selectedA.documents?.length ? (
                      selectedA.documents.map((doc, idx) => (
                        <div
                          key={`${doc}-${idx}`}
                          className={cn('p-3 rounded flex items-center gap-2', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}
                        >
                          <span>📄</span>
                          <span className="text-sm">{doc}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-center py-4">Aucun document</p>
                    )
                  )}

                  {viewTab === 'trace' && (
                    <div className="space-y-3">
                      <div className={cn('p-3 rounded border', STATUS_STYLES[selectedA.status].softBg)}>
                        <p className="text-xs text-slate-400 mb-1">📌 Résumé conformité</p>
                        <p className="text-sm">
                          Statut: <span className="font-semibold">{selectedA.status}</span> • Score: <span className="font-semibold">{selectedA.score}%</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          Dernier contrôle: {selectedA.lastCheck} • Prochain: {selectedA.nextCheck}
                        </p>
                      </div>

                      <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                        <p className="text-xs text-slate-400 mb-2">🔐 Registre (hash)</p>
                        {lastReportHash ? (
                          <>
                            <p className="text-xs text-slate-400">Dernier rapport hashé (SHA-256)</p>
                            <p className="font-mono text-[11px] break-all">{lastReportHash}</p>
                          </>
                        ) : (
                          <p className="text-sm text-slate-400">Aucun rapport hashé généré pour cet audit.</p>
                        )}
                      </div>

                      <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                        <p className="text-xs text-slate-400 mb-1">🧾 Traçabilité DG</p>
                        <p className="text-sm text-slate-300">
                          Toutes les actions (création, mise à jour, clôture, rapport) écrivent une entrée dans le registre via <span className="font-mono">addActionLog</span>.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700/50">
                  <Button size="sm" variant="default" className="flex-1" onClick={() => handleCreateAction(selectedA.id)}>
                    + Action
                  </Button>
                  <Button size="sm" variant="info" className="flex-1" onClick={handleGenerateReport}>
                    📄 Rapport (hash)
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="p-8 text-center">
                <span className="text-4xl mb-4 block">🔍</span>
                <p className="text-slate-400">Sélectionnez un audit</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
