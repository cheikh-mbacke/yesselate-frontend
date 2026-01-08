'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { employees } from '@/lib/data';
import { clientDemands, clientDemandStats, clients } from '@/lib/data/bmo-mock-4';
import type { ClientDemand } from '@/lib/data/bmo-mock-4';

type DemandStatus = ClientDemand['status'];
type DemandType = ClientDemand['type'];
type Priority = ClientDemand['priority'];

type QueueKey =
  | 'inbox'
  | 'sla_breached'
  | 'unassigned'
  | 'urgent'
  | 'escalated'
  | 'in_progress'
  | 'resolved'
  | 'new_project';

type SortKey = 'triage' | 'date_desc' | 'priority_desc' | 'client_az';

type SavedView = {
  id: string;
  name: string;
  queue: QueueKey;
  status: DemandStatus | 'all';
  type: DemandType | 'all';
  search: string;
  sort: SortKey;
  onlySlaBreached: boolean;
};

type Employee = (typeof employees)[number];

function safePreview(s: string, max = 140) {
  return s.replace(/\s+/g, ' ').trim().slice(0, max);
}

function makeId(prefix: string) {
  // randomUUID si dispo sinon fallback
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parseDateSafe(dateStr: string): Date | null {
  const d = new Date(dateStr);
  if (!Number.isNaN(d.getTime())) return d;

  // support "DD/MM/YYYY"
  const m = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    const dd = Number(m[1]);
    const mm = Number(m[2]) - 1;
    const yyyy = Number(m[3]);
    const d2 = new Date(yyyy, mm, dd);
    if (!Number.isNaN(d2.getTime())) return d2;
  }
  return null;
}

function daysSince(dateStr: string): number | null {
  const d = parseDateSafe(dateStr);
  if (!d) return null;
  const diff = Date.now() - d.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function getSlaDays(priority: Priority) {
  // règle simple (industrialisation : SLA par client/contrat)
  if (priority === 'urgent') return 1;
  if (priority === 'high') return 2;
  return 4;
}

function priorityScore(p: Priority) {
  if (p === 'urgent') return 3;
  if (p === 'high') return 2;
  return 1;
}

function statusLabel(s: DemandStatus) {
  if (s === 'pending') return 'Attente';
  if (s === 'in_progress') return 'En cours';
  if (s === 'resolved') return 'Résolu';
  if (s === 'escalated') return 'Escaladé';
  return s;
}

function statusVariant(s: DemandStatus): 'warning' | 'info' | 'success' | 'urgent' {
  if (s === 'pending') return 'warning';
  if (s === 'in_progress') return 'info';
  if (s === 'resolved') return 'success';
  return 'urgent';
}

function priorityVariant(p: Priority): 'urgent' | 'warning' | 'default' {
  if (p === 'urgent') return 'urgent';
  if (p === 'high') return 'warning';
  return 'default';
}

function typeIcon(type: DemandType) {
  switch (type) {
    case 'devis':
      return '📋';
    case 'reclamation':
      return '⚠️';
    case 'information':
      return 'ℹ️';
    case 'modification':
      return '✏️';
    case 'nouveau_projet':
      return '🏗️';
    case 'facturation':
      return '💳';
    default:
      return '📝';
  }
}

function typeLabel(type: DemandType) {
  switch (type) {
    case 'devis':
      return 'Devis';
    case 'reclamation':
      return 'Réclamation';
    case 'information':
      return 'Information';
    case 'modification':
      return 'Modification';
    case 'nouveau_projet':
      return 'Nouveau projet';
    case 'facturation':
      return 'Facturation';
    default:
      return type;
  }
}

function triageRank(d: ClientDemand) {
  const age = daysSince(d.date) ?? 0;
  const sla = getSlaDays(d.priority);
  const breached = age > sla && d.status !== 'resolved';

  // triage : SLA+ > urgent > escalated > pending > age
  const base =
    (breached ? 1000 : 0) +
    (d.priority === 'urgent' ? 300 : d.priority === 'high' ? 200 : 100) +
    (d.status === 'escalated' ? 80 : d.status === 'pending' ? 60 : d.status === 'in_progress' ? 40 : 0) +
    Math.min(50, age);

  return base;
}

function suggestBureau(d: ClientDemand): string {
  const s = `${d.subject} ${d.description}`.toLowerCase();
  if (d.type === 'facturation' || s.includes('facture') || s.includes('paiement')) return 'Finance';
  if (d.type === 'devis' || s.includes('devis') || s.includes('prix')) return 'Achats';
  if (d.type === 'reclamation' || s.includes('retard') || s.includes('incident')) return 'Qualité';
  if (d.type === 'modification' || s.includes('plan') || s.includes('changement')) return 'Terrain';
  if (d.type === 'nouveau_projet') return 'BMO';
  return 'BMO';
}

const RESPONSE_TEMPLATES: Array<{ key: string; label: string; text: string }> = [
  {
    key: 'ack',
    label: 'Accusé de réception',
    text: "Bonjour,\n\nNous avons bien reçu votre demande. Elle est en cours de prise en charge. Nous revenons vers vous sous 24h.\n\nCordialement.",
  },
  {
    key: 'need-info',
    label: "Demande d'informations",
    text: "Bonjour,\n\nPour traiter votre demande, pouvez-vous nous préciser :\n- …\n- …\n\nDès réception, nous lançons la prise en charge.\n\nCordialement.",
  },
  {
    key: 'resolved',
    label: 'Clôture / Résolution',
    text: "Bonjour,\n\nVotre demande a été traitée. Pouvez-vous confirmer que tout est conforme de votre côté ?\n\nCordialement.",
  },
];

const DEFAULT_VIEWS: SavedView[] = [
  { id: 'v-inbox', name: 'Inbox', queue: 'inbox', status: 'all', type: 'all', search: '', sort: 'triage', onlySlaBreached: false },
  { id: 'v-now', name: 'À traiter maintenant', queue: 'sla_breached', status: 'all', type: 'all', search: '', sort: 'triage', onlySlaBreached: true },
  { id: 'v-unassigned', name: 'Non assignées', queue: 'unassigned', status: 'all', type: 'all', search: '', sort: 'triage', onlySlaBreached: false },
  { id: 'v-newproj', name: 'Nouveaux projets', queue: 'new_project', status: 'all', type: 'nouveau_projet', search: '', sort: 'triage', onlySlaBreached: false },
];

export default function DemandesClientsPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog, currentUser } = useBMOStore();

  // Données locales (mock) -> prêtes à être branchées sur API.
  const [demands, setDemands] = useState<ClientDemand[]>(clientDemands);

  // Split view : ticket sélectionné (dossier)
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeDemand = useMemo(() => demands.find((d) => d.id === activeId) ?? null, [demands, activeId]);

  // Sélection multiple (bulk)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectedCount = selectedIds.size;

  // Vue / filtres
  const [views, setViews] = useState<SavedView[]>(DEFAULT_VIEWS);
  const [activeViewId, setActiveViewId] = useState<string>(DEFAULT_VIEWS[0].id);

  const activeView = useMemo(() => views.find((v) => v.id === activeViewId) ?? DEFAULT_VIEWS[0], [views, activeViewId]);

  const [statusFilter, setStatusFilter] = useState<DemandStatus | 'all'>(activeView.status);
  const [typeFilter, setTypeFilter] = useState<DemandType | 'all'>(activeView.type);
  const [queue, setQueue] = useState<QueueKey>(activeView.queue);
  const [sort, setSort] = useState<SortKey>(activeView.sort);
  const [onlySlaBreached, setOnlySlaBreached] = useState<boolean>(activeView.onlySlaBreached);
  const [search, setSearch] = useState<string>(activeView.search);

  // Workbench (actions)
  const [showAssign, setShowAssign] = useState(false);
  const [showRespond, setShowRespond] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const searchRef = useRef<HTMLInputElement | null>(null);

  // Persistence vues
  useEffect(() => {
    try {
      const raw = localStorage.getItem('bmo.ticketViews.v10');
      if (raw) {
        const parsed = JSON.parse(raw) as SavedView[];
        if (Array.isArray(parsed) && parsed.length) setViews(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('bmo.ticketViews.v10', JSON.stringify(views));
    } catch {
      // ignore
    }
  }, [views]);

  // Appliquer la vue active aux filtres quand on change de vue
  useEffect(() => {
    setQueue(activeView.queue);
    setStatusFilter(activeView.status);
    setTypeFilter(activeView.type);
    setSearch(activeView.search);
    setSort(activeView.sort);
    setOnlySlaBreached(activeView.onlySlaBreached);
    setSelectedIds(new Set());
  }, [activeViewId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard (pro UX)
  useEffect(() => {
    let seq = '';
    const onKey = (e: KeyboardEvent) => {
      // Focus recherche
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }

      // Fermer dossier / modals
      if (e.key === 'Escape') {
        setShowAssign(false);
        setShowRespond(false);
        setActiveId(null);
        return;
      }

      // "g a / g p / g i / g r" : change queue rapide
      seq = (seq + e.key).slice(-2);
      if (seq === 'ga') setQueue('inbox');
      if (seq === 'gp') setStatusFilter('pending');
      if (seq === 'gi') setStatusFilter('in_progress');
      if (seq === 'gr') setStatusFilter('resolved');
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Stats
  const stats = useMemo(() => {
    const total = demands.length;
    const pending = demands.filter((d) => d.status === 'pending').length;
    const inProgress = demands.filter((d) => d.status === 'in_progress').length;
    const resolved = demands.filter((d) => d.status === 'resolved').length;
    const escalated = demands.filter((d) => d.status === 'escalated').length;

    // SLA breached
    const slaBreached = demands.filter((d) => {
      const age = daysSince(d.date) ?? 0;
      return d.status !== 'resolved' && age > getSlaDays(d.priority);
    }).length;

    return {
      total,
      pending,
      inProgress,
      resolved,
      escalated,
      slaBreached,
      avgResponseTime: clientDemandStats.avgResponseTime,
    };
  }, [demands]);

  // Queues pro (files)
  const queuedDemands = useMemo(() => {
    let list = demands.slice();

    // queue
    if (queue === 'sla_breached') {
      list = list.filter((d) => {
        const age = daysSince(d.date) ?? 0;
        return d.status !== 'resolved' && age > getSlaDays(d.priority);
      });
    } else if (queue === 'unassigned') {
      list = list.filter((d) => !d.assignedTo);
    } else if (queue === 'urgent') {
      list = list.filter((d) => d.priority === 'urgent');
    } else if (queue === 'escalated') {
      list = list.filter((d) => d.status === 'escalated');
    } else if (queue === 'in_progress') {
      list = list.filter((d) => d.status === 'in_progress');
    } else if (queue === 'resolved') {
      list = list.filter((d) => d.status === 'resolved');
    } else if (queue === 'new_project') {
      list = list.filter((d) => d.type === 'nouveau_projet');
    } else {
      // inbox = tout sauf résolu par défaut (comme un vrai tool)
      list = list.filter((d) => d.status !== 'resolved');
    }

    // filters
    if (statusFilter !== 'all') list = list.filter((d) => d.status === statusFilter);
    if (typeFilter !== 'all') list = list.filter((d) => d.type === typeFilter);

    if (onlySlaBreached) {
      list = list.filter((d) => {
        const age = daysSince(d.date) ?? 0;
        return d.status !== 'resolved' && age > getSlaDays(d.priority);
      });
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((d) => {
        const hay = `${d.id} ${d.clientName} ${d.subject} ${d.description}`.toLowerCase();
        return hay.includes(q);
      });
    }

    // sort
    if (sort === 'triage') list.sort((a, b) => triageRank(b) - triageRank(a));
    if (sort === 'date_desc') list.sort((a, b) => (parseDateSafe(b.date)?.getTime() ?? 0) - (parseDateSafe(a.date)?.getTime() ?? 0));
    if (sort === 'priority_desc') list.sort((a, b) => priorityScore(b.priority) - priorityScore(a.priority));
    if (sort === 'client_az') list.sort((a, b) => a.clientName.localeCompare(b.clientName));

    return list;
  }, [demands, queue, statusFilter, typeFilter, onlySlaBreached, search, sort]);

  // --- Actions (audit-ready) --------------------------------------------------

  const log = (action: string, target: ClientDemand, details: string) => {
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      module: 'tickets-clients',
      targetId: target.id,
      targetType: 'Demande client',
      targetLabel: target.subject,
      details,
      bureau: currentUser.bureau,
    });
  };

  const openDemand = (id: string) => {
    setActiveId(id);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelectedIds(new Set(queuedDemands.map((d) => d.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkUpdate = async (mut: (d: ClientDemand) => ClientDemand, label: string) => {
    if (!selectedIds.size) return;
    setIsBusy(true);
    try {
      const ids = new Set(selectedIds);
      setDemands((prev) => prev.map((d) => (ids.has(d.id) ? mut(d) : d)));

      addToast(`✓ Action groupée: ${label} (${ids.size})`, 'success');
      clearSelection();
    } finally {
      setIsBusy(false);
    }
  };

  const assignOne = (demand: ClientDemand, emp: Employee) => {
    const actionId = makeId('ACT');
    const updated = {
      ...demand,
      assignedTo: emp.name,
      assignedBureau: emp.bureau,
      status: demand.status === 'pending' ? ('in_progress' as DemandStatus) : demand.status,
    };

    setDemands((prev) => prev.map((d) => (d.id === demand.id ? updated : d)));
    log('assign', demand, `ActionId:${actionId} | Assigné à ${emp.name} (${emp.bureau})`);
    addToast(`✓ ${demand.id} assignée à ${emp.name}`, 'success');
  };

  const escalateOne = (demand: ClientDemand) => {
    const actionId = makeId('ACT');
    const updated = { ...demand, status: 'escalated' as DemandStatus };
    setDemands((prev) => prev.map((d) => (d.id === demand.id ? updated : d)));
    log('escalate', demand, `ActionId:${actionId} | Escaladé (prio:${demand.priority})`);
    addToast(`⬆️ ${demand.id} escaladée`, 'warning');
  };

  const convertToProject = (demand: ClientDemand) => {
    const actionId = makeId('ACT');
    const projectId = `PRJ-${Date.now().toString().slice(-4)}`;
    const updated = { ...demand, project: projectId };
    setDemands((prev) => prev.map((d) => (d.id === demand.id ? updated : d)));
    log('convert_to_project', demand, `ActionId:${actionId} | Converti en projet ${projectId}`);
    addToast(`✓ Converti en ${projectId}`, 'success');
  };

  const respondOne = async (demand: ClientDemand) => {
    if (!responseText.trim()) return;
    setIsBusy(true);
    try {
      const actionId = makeId('ACT');
      const updated: ClientDemand = {
        ...demand,
        response: responseText.trim(),
        responseTime: Math.max(1, daysSince(demand.date) ?? 1),
        status: 'resolved' as DemandStatus,
      };

      setDemands((prev) => prev.map((d) => (d.id === demand.id ? updated : d)));
      log('response', demand, `ActionId:${actionId} | Réponse:"${safePreview(responseText)}"`);
      addToast(`✓ Réponse envoyée • ${demand.id}`, 'success');

      setShowRespond(false);
      setResponseText('');
    } finally {
      setIsBusy(false);
    }
  };

  const saveCurrentAsView = () => {
    const name = `Vue ${views.length + 1}`;
    const v: SavedView = {
      id: makeId('VIEW'),
      name,
      queue,
      status: statusFilter,
      type: typeFilter,
      search,
      sort,
      onlySlaBreached,
    };
    setViews((prev) => [v, ...prev]);
    setActiveViewId(v.id);
    addToast(`✓ Vue sauvegardée: ${name}`, 'success');
  };

  const resetFiltersToView = () => {
    setQueue(activeView.queue);
    setStatusFilter(activeView.status);
    setTypeFilter(activeView.type);
    setSearch(activeView.search);
    setSort(activeView.sort);
    setOnlySlaBreached(activeView.onlySlaBreached);
    addToast('↩︎ Vue restaurée', 'info');
  };

  // --- UI ---------------------------------------------------------------------

  const leftPane = (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🎛️ Cockpit Tickets
            <Badge variant="warning">{stats.pending}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Total: {stats.total} • SLA+: <span className="text-red-400 font-bold">{stats.slaBreached}</span> • Délai moy.:{' '}
            <span className="text-emerald-400 font-bold">{stats.avgResponseTime}j</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={saveCurrentAsView}>
            💾 Sauver vue
          </Button>
          <Button onClick={() => addToast('Nouvelle demande manuelle', 'info')}>+ Saisir</Button>
        </div>
      </div>

      {/* Queues (files) */}
      <div className="grid grid-cols-7 gap-2">
        <QueueCard label="Inbox" value={stats.total - stats.resolved} active={queue === 'inbox'} onClick={() => setQueue('inbox')} dark={darkMode} />
        <QueueCard label="SLA+" value={stats.slaBreached} active={queue === 'sla_breached'} onClick={() => setQueue('sla_breached')} dark={darkMode} accent="red" />
        <QueueCard label="Non assignées" value={demands.filter((d) => !d.assignedTo).length} active={queue === 'unassigned'} onClick={() => setQueue('unassigned')} dark={darkMode} />
        <QueueCard label="Urgent" value={demands.filter((d) => d.priority === 'urgent').length} active={queue === 'urgent'} onClick={() => setQueue('urgent')} dark={darkMode} accent="amber" />
        <QueueCard label="Escaladées" value={stats.escalated} active={queue === 'escalated'} onClick={() => setQueue('escalated')} dark={darkMode} accent="orange" />
        <QueueCard label="En cours" value={stats.inProgress} active={queue === 'in_progress'} onClick={() => setQueue('in_progress')} dark={darkMode} accent="blue" />
        <QueueCard label="Résolues" value={stats.resolved} active={queue === 'resolved'} onClick={() => setQueue('resolved')} dark={darkMode} accent="emerald" />
      </div>

      {/* Vues sauvegardées + filtres */}
      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">Vue</span>
            <select
              value={activeViewId}
              onChange={(e) => setActiveViewId(e.target.value)}
              className={cn(
                'px-2 py-1 rounded text-xs',
                darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
              )}
            >
              {views.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>

            <Button size="sm" variant="secondary" onClick={resetFiltersToView}>
              ↩︎ Restaurer
            </Button>

            <div className="flex-1" />

            <span className="text-[10px] text-slate-500">Raccourcis: "/" recherche • "Esc" fermer • "g a/p/i/r"</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            <div className="col-span-2">
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔎 Recherche (id, client, sujet, contenu)…"
                className={cn(
                  'w-full px-3 py-2 rounded text-sm',
                  darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
                )}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as DemandStatus | 'all')}
              className={cn('px-2 py-2 rounded text-sm', darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200')}
            >
              <option value="all">Statut: Tous</option>
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="escalated">Escaladé</option>
              <option value="resolved">Résolu</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as DemandType | 'all')}
              className={cn('px-2 py-2 rounded text-sm', darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200')}
            >
              <option value="all">Type: Tous</option>
              <option value="nouveau_projet">🏗️ Nouveau projet</option>
              <option value="reclamation">⚠️ Réclamation</option>
              <option value="modification">✏️ Modification</option>
              <option value="information">ℹ️ Information</option>
              <option value="facturation">💳 Facturation</option>
              <option value="devis">📋 Devis</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className={cn('px-2 py-2 rounded text-sm', darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200')}
            >
              <option value="triage">Tri: Triage</option>
              <option value="date_desc">Tri: Date</option>
              <option value="priority_desc">Tri: Priorité</option>
              <option value="client_az">Tri: Client</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-400">
              <input type="checkbox" checked={onlySlaBreached} onChange={(e) => setOnlySlaBreached(e.target.checked)} />
              SLA dépassé uniquement
            </label>

            <div className="flex-1" />

            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setTypeFilter('all');
                setOnlySlaBreached(false);
              }}
            >
              Réinitialiser filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk bar */}
      {selectedCount > 0 && (
        <Card className="border-amber-500/30">
          <CardContent className="p-3 flex flex-wrap items-center gap-2">
            <Badge variant="warning">{selectedCount} sélectionnées</Badge>

            <Button
              size="sm"
              variant="info"
              disabled={isBusy}
              onClick={() => setShowAssign(true)}
            >
              → Assigner
            </Button>

            <Button
              size="sm"
              variant="destructive"
              disabled={isBusy}
              onClick={() =>
                bulkUpdate(
                  (d) => ({ ...d, status: 'escalated' as DemandStatus }),
                  'Escalader'
                )
              }
            >
              ⬆️ Escalader
            </Button>

            <Button
              size="sm"
              variant="success"
              disabled={isBusy}
              onClick={() =>
                bulkUpdate(
                  (d) => ({ ...d, status: 'resolved' as DemandStatus }),
                  'Marquer résolu'
                )
              }
            >
              ✓ Résolu
            </Button>

            <div className="flex-1" />
            <Button size="sm" variant="secondary" onClick={clearSelection}>
              Annuler sélection
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Liste (case list) */}
      <Card>
        <CardHeader className="py-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              📥 {queueLabel(queue)} • <span className="text-slate-400">{queuedDemands.length} éléments</span>
            </CardTitle>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={selectAllVisible}>
                Tout sélectionner
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="max-h-[62vh] overflow-auto">
            {queuedDemands.map((d) => {
              const age = daysSince(d.date) ?? 0;
              const sla = getSlaDays(d.priority);
              const breached = d.status !== 'resolved' && age > sla;
              const isActive = d.id === activeId;

              return (
                <button
                  key={d.id}
                  onClick={() => openDemand(d.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 border-t flex items-start gap-3 transition-all',
                    darkMode ? 'border-slate-700/50 hover:bg-slate-700/30' : 'border-gray-100 hover:bg-gray-50',
                    isActive && (darkMode ? 'bg-slate-700/40' : 'bg-orange-50'),
                    breached && 'ring-1 ring-red-500/30'
                  )}
                >
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(d.id)}
                      onChange={() => toggleSelect(d.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                          {d.id}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">
                          {d.clientName}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {typeIcon(d.type)} {typeLabel(d.type)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Badge variant={priorityVariant(d.priority)} className="text-[9px]">
                          {d.priority}
                        </Badge>
                        <Badge variant={statusVariant(d.status)} className="text-[9px]">
                          {statusLabel(d.status)}
                        </Badge>
                        {breached && (
                          <span title={`SLA dépassé (${age}j > ${sla}j)`} className="text-[10px] text-red-400 font-bold">
                            SLA+
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-1 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{d.subject}</p>
                        <p className="text-[10px] text-slate-400 truncate">{safePreview(d.description)}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-slate-500">{d.date} • {age}j</p>
                        <p className="text-[10px] text-slate-500">
                          {d.assignedTo ? (
                            <span className="text-blue-400">{d.assignedTo}</span>
                          ) : (
                            <span className="text-slate-500">Non assigné</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {queuedDemands.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-400">Aucun résultat</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const rightPane = (
    <div className={cn('space-y-3', !activeDemand && 'opacity-70')}>
      <Card>
        <CardHeader className="py-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm">
              {activeDemand ? (
                <>
                  {typeIcon(activeDemand.type)} Dossier {activeDemand.id}
                </>
              ) : (
                '📄 Ouvrir un dossier'
              )}
            </CardTitle>

            <div className="flex items-center gap-2">
              {activeDemand && (
                <Button size="sm" variant="ghost" onClick={() => setActiveId(null)}>
                  ✕
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {!activeDemand ? (
            <div className="text-sm text-slate-400">
              Sélectionne une demande à gauche pour afficher le dossier complet.
            </div>
          ) : (
            <>
              {/* Client */}
              <div className={cn('p-3 rounded-lg', darkMode ? 'bg-slate-700/50' : 'bg-gray-50')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">Client</p>
                    <Link
                      href={`/maitre-ouvrage/clients?id=${activeDemand.clientId}`}
                      className="font-bold text-blue-400 hover:underline"
                    >
                      {activeDemand.clientName}
                    </Link>

                    <p className="text-[10px] text-slate-400 mt-1">
                      Suggestion routing: <span className="text-amber-400 font-bold">{suggestBureau(activeDemand)}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex gap-1 justify-end">
                      <Badge variant={priorityVariant(activeDemand.priority)}>{activeDemand.priority}</Badge>
                      <Badge variant={statusVariant(activeDemand.status)}>{statusLabel(activeDemand.status)}</Badge>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{activeDemand.date}</p>
                  </div>
                </div>
              </div>

              {/* Sujet / contenu */}
              <div>
                <h3 className="font-bold text-sm">{activeDemand.subject}</h3>
                <p className="text-xs text-slate-300 mt-1 whitespace-pre-wrap">{activeDemand.description}</p>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                {activeDemand.attachments ? (
                  <span className="px-2 py-1 rounded bg-slate-700/30">📎 {activeDemand.attachments} PJ</span>
                ) : (
                  <span className="px-2 py-1 rounded bg-slate-700/30">📎 0 PJ</span>
                )}
                {activeDemand.project ? (
                  <Link
                    href={`/maitre-ouvrage/projets-en-cours?id=${activeDemand.project}`}
                    className="px-2 py-1 rounded bg-orange-500/10 text-orange-400 hover:underline"
                  >
                    → Projet {activeDemand.project}
                  </Link>
                ) : (
                  <span className="px-2 py-1 rounded bg-slate-700/30">Aucun projet lié</span>
                )}
              </div>

              {/* Assignation */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded border border-slate-700/40">
                <div className="text-xs">
                  <span className="text-slate-400">Assigné :</span>{' '}
                  {activeDemand.assignedTo ? (
                    <>
                      <span className="text-blue-400 font-semibold">{activeDemand.assignedTo}</span>{' '}
                      {activeDemand.assignedBureau && <BureauTag bureau={activeDemand.assignedBureau} />}
                    </>
                  ) : (
                    <span className="text-slate-500">Non assigné</span>
                  )}
                </div>
                <Button size="sm" variant="info" onClick={() => setShowAssign(true)}>
                  → Assigner
                </Button>
              </div>

              {/* Réponse */}
              {activeDemand.response ? (
                <div className={cn('p-3 rounded-lg border-l-4 border-l-emerald-500', darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50')}>
                  <p className="text-xs text-slate-400 mb-1">Réponse (en {activeDemand.responseTime ?? '-'}j)</p>
                  <p className="text-sm text-emerald-400 whitespace-pre-wrap">{activeDemand.response}</p>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <Button className="flex-1" variant="success" onClick={() => setShowRespond(true)}>
                    ✓ Répondre & clôturer
                  </Button>
                  {activeDemand.type === 'nouveau_projet' && (
                    <Button variant="warning" onClick={() => convertToProject(activeDemand)}>
                      🏗️ Convertir
                    </Button>
                  )}
                  {activeDemand.status !== 'escalated' && activeDemand.status !== 'resolved' && (
                    <Button variant="destructive" onClick={() => escalateOne(activeDemand)}>
                      ⬆️ Escalader
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Panel Traçabilité */}
      <Card className="border-emerald-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🧾</span>
            <div>
              <h3 className="font-bold text-sm text-emerald-400">Case timeline (audit)</h3>
              <p className="text-xs text-slate-400 mt-1">
                Chaque action importante doit être un <span className="text-orange-400 font-bold">événement</span> (assign, escalate, response, convert…).
                Là, c'est déjà branché sur ton store (addActionLog). Prochaine étape : event-sourcing côté serveur (ledger immuable).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Assign */}
      {showAssign && activeDemand && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onMouseDown={(e) => e.target === e.currentTarget && setShowAssign(false)}>
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-sm">→ Assigner {activeDemand.id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className={cn('p-2 rounded text-xs', darkMode ? 'bg-slate-700/50' : 'bg-gray-50')}>
                <p className="text-slate-400">
                  Sujet: <span className="text-white">{activeDemand.subject}</span>
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Suggestion: <span className="text-amber-400 font-bold">{suggestBureau(activeDemand)}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {employees.map((emp) => (
                  <button
                    key={emp.id}
                    disabled={isBusy}
                    className={cn(
                      'p-2 rounded flex items-center gap-2 text-left transition-all',
                      darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200',
                      isBusy && 'opacity-60 cursor-not-allowed'
                    )}
                    onClick={() => {
                      // si bulk
                      if (selectedIds.size > 0) {
                        void bulkUpdate(
                          (d) => ({
                            ...d,
                            assignedTo: emp.name,
                            assignedBureau: emp.bureau,
                            status: d.status === 'pending' ? ('in_progress' as DemandStatus) : d.status,
                          }),
                          `Assigner à ${emp.name}`
                        );
                        setShowAssign(false);
                        return;
                      }

                      assignOne(activeDemand, emp);
                      setShowAssign(false);
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-bold">
                      {emp.initials}
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{emp.name}</p>
                      <p className="text-[10px] text-slate-400">{emp.bureau}</p>
                    </div>
                  </button>
                ))}
              </div>

              <Button variant="secondary" className="w-full" onClick={() => setShowAssign(false)}>
                Annuler
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Respond */}
      {showRespond && activeDemand && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onMouseDown={(e) => e.target === e.currentTarget && setShowRespond(false)}>
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle className="text-sm">✓ Répondre & clôturer {activeDemand.id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400">Template :</span>
                <select
                  className={cn('px-2 py-1 rounded text-xs', darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200')}
                  onChange={(e) => {
                    const t = RESPONSE_TEMPLATES.find((x) => x.key === e.target.value);
                    if (t) setResponseText(t.text);
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Choisir…
                  </option>
                  {RESPONSE_TEMPLATES.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </select>

                <div className="flex-1" />
                <Badge variant="info">Clôture automatique</Badge>
              </div>

              <textarea
                rows={7}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Votre réponse au client…"
                className={cn('w-full px-3 py-2 rounded text-sm', darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200')}
              />

              <div className="flex gap-2">
                <Button className="flex-1" disabled={!responseText.trim() || isBusy} onClick={() => void respondOne(activeDemand)}>
                  {isBusy ? 'Envoi…' : '✓ Envoyer & clôturer'}
                </Button>
                <Button variant="secondary" disabled={isBusy} onClick={() => setShowRespond(false)}>
                  Annuler
                </Button>
              </div>

              <p className="text-[10px] text-slate-500">
                Prochaine étape "market-grade" : envoi réel (email/whatsapp), pièces jointes, signature, et ledger serveur immuable.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 xl:col-span-7">{leftPane}</div>
      <div className="col-span-12 xl:col-span-5">{rightPane}</div>
    </div>
  );
}

/* ---- UI helpers ---- */

function queueLabel(q: QueueKey) {
  if (q === 'inbox') return 'Inbox';
  if (q === 'sla_breached') return 'SLA dépassé';
  if (q === 'unassigned') return 'Non assignées';
  if (q === 'urgent') return 'Urgent';
  if (q === 'escalated') return 'Escaladées';
  if (q === 'in_progress') return 'En cours';
  if (q === 'resolved') return 'Résolues';
  if (q === 'new_project') return 'Nouveaux projets';
  return q;
}

function QueueCard(props: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
  dark: boolean;
  accent?: 'red' | 'amber' | 'orange' | 'blue' | 'emerald';
}) {
  const { label, value, active, onClick, dark, accent } = props;
  const accentRing =
    accent === 'red'
      ? 'ring-red-500'
      : accent === 'amber'
      ? 'ring-amber-500'
      : accent === 'orange'
      ? 'ring-orange-500'
      : accent === 'blue'
      ? 'ring-blue-500'
      : accent === 'emerald'
      ? 'ring-emerald-500'
      : 'ring-orange-500';

  const accentText =
    accent === 'red'
      ? 'text-red-400'
      : accent === 'amber'
      ? 'text-amber-400'
      : accent === 'orange'
      ? 'text-orange-400'
      : accent === 'blue'
      ? 'text-blue-400'
      : accent === 'emerald'
      ? 'text-emerald-400'
      : 'text-white';

  return (
    <Card className={cn('cursor-pointer transition-all', active && `ring-2 ${accentRing}`)} onClick={onClick}>
      <CardContent className="p-3 text-center">
        <p className={cn('text-2xl font-bold', accent ? accentText : '')}>{value}</p>
        <p className="text-[10px] text-slate-400">{label}</p>
      </CardContent>
    </Card>
  );
}
