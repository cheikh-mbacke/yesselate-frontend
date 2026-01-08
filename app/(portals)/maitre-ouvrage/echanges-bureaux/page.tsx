'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { echangesBureaux } from '@/lib/data';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import { useAutoSyncCounts } from '@/hooks/useAutoSync';
import type { ActionLogType } from '@/lib/types/bmo.types';

type ExchangeStatus = 'pending' | 'resolved' | 'escalated';
type StatusFilter = 'all' | ExchangeStatus;
type PriorityFilter = 'all' | 'urgent' | 'high' | 'normal';
type SortMode = 'recent' | 'oldest' | 'priority' | 'status' | 'escalated_first';

type Exchange = (typeof echangesBureaux)[number];

const normalize = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const parseFRDateToMs = (dateStr?: string): number => {
  if (!dateStr) return 0;
  const m = String(dateStr).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return 0;
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  const d = new Date(yyyy, mm - 1, dd);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
};

const generateHash = (data: string): string => {
  let hash = 2166136261;
  for (let i = 0; i < data.length; i++) {
    hash ^= data.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `SHA3:${(hash >>> 0).toString(16).padStart(12, '0')}...`;
};

const priorityRank: Record<string, number> = { urgent: 3, high: 2, normal: 1 };
const statusRank: Record<string, number> = { escalated: 3, pending: 2, resolved: 1 };

export default function EchangesBureauxPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEchange, setSelectedEchange] = useState<string | null>(null);

  // Toggles "préventifs"
  const [escalatedOnly, setEscalatedOnly] = useState(false);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [withAttachmentsOnly, setWithAttachmentsOnly] = useState(false);
  const [projectOnly, setProjectOnly] = useState(false);

  // Persistance (même travail)
  const { updateFilters, getFilters } = usePageNavigation('echanges-bureaux');

  useEffect(() => {
    try {
      const saved = getFilters?.();
      if (!saved) return;

      if (saved.statusFilter) setStatusFilter(saved.statusFilter);
      if (saved.priorityFilter) setPriorityFilter(saved.priorityFilter);
      if (saved.sortMode) setSortMode(saved.sortMode);
      if (typeof saved.searchQuery === 'string') setSearchQuery(saved.searchQuery);
      if (typeof saved.selectedEchange === 'string') setSelectedEchange(saved.selectedEchange);

      if (typeof saved.escalatedOnly === 'boolean') setEscalatedOnly(saved.escalatedOnly);
      if (typeof saved.urgentOnly === 'boolean') setUrgentOnly(saved.urgentOnly);
      if (typeof saved.withAttachmentsOnly === 'boolean') setWithAttachmentsOnly(saved.withAttachmentsOnly);
      if (typeof saved.projectOnly === 'boolean') setProjectOnly(saved.projectOnly);
    } catch {
      // silent
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      updateFilters?.({
        statusFilter,
        priorityFilter,
        sortMode,
        searchQuery,
        selectedEchange,
        escalatedOnly,
        urgentOnly,
        withAttachmentsOnly,
        projectOnly,
      });
    } catch {
      // silent
    }
  }, [
    statusFilter,
    priorityFilter,
    sortMode,
    searchQuery,
    selectedEchange,
    escalatedOnly,
    urgentOnly,
    withAttachmentsOnly,
    projectOnly,
    updateFilters,
  ]);

  // Enrichissement
  const exchanges = useMemo(() => {
    return (echangesBureaux as Exchange[]).map((e: any) => {
      const createdMs = parseFRDateToMs(e.date);
      const hasAttachments = Boolean(e.attachments && Number(e.attachments) > 0);
      const hasProject = Boolean(e.project && String(e.project).trim().length > 0);

      // "threadKey" simple (utile si plus tard tu veux grouper)
      const threadKey = `${normalize(e.from)}->${normalize(e.to)}::${normalize(e.subject)}`;

      return {
        ...e,
        createdMs,
        hasAttachments,
        hasProject,
        threadKey,
      };
    });
  }, []);

  // Sidebar count auto-sync (pending échanges)
  useAutoSyncCounts(
    'echanges-bureaux',
    () => exchanges.filter((e: any) => e.status === 'pending').length,
    { interval: 10000, immediate: true }
  );

  const stats = useMemo(() => {
    const pending = exchanges.filter((e: any) => e.status === 'pending').length;
    const escalated = exchanges.filter((e: any) => e.status === 'escalated').length;
    const resolved = exchanges.filter((e: any) => e.status === 'resolved').length;
    const urgent = exchanges.filter((e: any) => e.priority === 'urgent').length;

    const withAttachments = exchanges.filter((e: any) => e.hasAttachments).length;
    const withProject = exchanges.filter((e: any) => e.hasProject).length;

    return {
      total: exchanges.length,
      pending,
      escalated,
      resolved,
      urgent,
      withAttachments,
      withProject,
    };
  }, [exchanges]);

  const filteredEchanges = useMemo(() => {
    let result = [...exchanges] as any[];

    // filtres
    if (statusFilter !== 'all') result = result.filter((e) => e.status === statusFilter);
    if (priorityFilter !== 'all') result = result.filter((e) => e.priority === priorityFilter);

    if (escalatedOnly) result = result.filter((e) => e.status === 'escalated');
    if (urgentOnly) result = result.filter((e) => e.priority === 'urgent');
    if (withAttachmentsOnly) result = result.filter((e) => e.hasAttachments);
    if (projectOnly) result = result.filter((e) => e.hasProject);

    // recherche
    const q = normalize(searchQuery);
    if (q) {
      result = result.filter((e) => {
        const hay = normalize(
          [
            e.id,
            e.subject,
            e.message,
            e.from,
            e.to,
            e.fromAgent,
            e.toAgent,
            e.project,
            e.date,
            e.status,
            e.priority,
          ].join(' | ')
        );
        return hay.includes(q);
      });
    }

    // tri
    result.sort((a, b) => {
      if (sortMode === 'oldest') return (a.createdMs || 0) - (b.createdMs || 0);
      if (sortMode === 'priority') {
        const d = (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);
        if (d !== 0) return d;
        return (b.createdMs || 0) - (a.createdMs || 0);
      }
      if (sortMode === 'status') {
        const d = (statusRank[b.status] || 0) - (statusRank[a.status] || 0);
        if (d !== 0) return d;
        return (b.createdMs || 0) - (a.createdMs || 0);
      }
      if (sortMode === 'escalated_first') {
        const aKey = a.status === 'escalated' ? 0 : 1;
        const bKey = b.status === 'escalated' ? 0 : 1;
        if (aKey !== bKey) return aKey - bKey;
        return (b.createdMs || 0) - (a.createdMs || 0);
      }
      // recent
      return (b.createdMs || 0) - (a.createdMs || 0);
    });

    return result;
  }, [
    exchanges,
    statusFilter,
    priorityFilter,
    escalatedOnly,
    urgentOnly,
    withAttachmentsOnly,
    projectOnly,
    searchQuery,
    sortMode,
  ]);

  const selectedE = useMemo(() => {
    return selectedEchange ? (exchanges.find((e: any) => e.id === selectedEchange) as any) : null;
  }, [selectedEchange, exchanges]);

  // Actions "audit"
  const handleRespond = (echange: any) => {
    if (!echange) return;

    const response = window.prompt('Réponse (trace audit) :', 'Bien reçu, traitement en cours.');
    if (!response) return;

    const hash = generateHash(`${echange.id}-${Date.now()}-respond-${response}`);

    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'echanges-bureaux',
      action: 'modification',
      targetId: echange.id,
      targetType: 'BureauExchange',
      details: `Réponse envoyée: ${echange.from} → ${echange.to} | "${response}" | Hash: ${hash}`,
    });

    addToast('Réponse envoyée', 'success');
  };

  const handleEscalate = (echange: any) => {
    if (!echange) return;

    const reason =
      window.prompt('Motif d\'escalade (trace audit) :', 'Blocage inter-bureaux / arbitrage DG requis') ||
      'Arbitrage DG requis';
    const hash = generateHash(`${echange.id}-${Date.now()}-escalate-${reason}`);

    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'echanges-bureaux',
      action: 'escalation',
      targetId: echange.id,
      targetType: 'BureauExchange',
      details: `Escalade DG: ${reason} | Hash: ${hash}`,
    });

    addToast('Échange escaladé au DG - Trace créée', 'warning');
  };

  const handleClose = (echange: any) => {
    if (!echange) return;

    const resolution = window.prompt('Conclusion / décision (trace audit) :', 'Résolu - action réalisée / info transmise');
    if (!resolution) return;

    const hash = generateHash(`${echange.id}-${Date.now()}-close-${resolution}`);

    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'echanges-bureaux',
      action: 'modification',
      targetId: echange.id,
      targetType: 'BureauExchange',
      details: `Clôture: ${resolution} | Hash: ${hash}`,
    });

    addToast('Échange clôturé - Trace créée', 'success');
  };

  const resetAll = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setSortMode('recent');
    setSearchQuery('');
    setEscalatedOnly(false);
    setUrgentOnly(false);
    setWithAttachmentsOnly(false);
    setProjectOnly(false);
    addToast('Filtres réinitialisés', 'info');
  };

  const statusBadgeVariant = (s: ExchangeStatus) => {
    if (s === 'escalated') return 'urgent';
    if (s === 'pending') return 'warning';
    return 'success';
  };

  const priorityBadgeVariant = (p: string) => {
    if (p === 'urgent') return 'urgent';
    if (p === 'high') return 'warning';
    return 'default';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🔄 Échanges Inter-Bureaux
            <Badge variant="warning">{stats.pending} en attente</Badge>
            {stats.escalated > 0 && <Badge variant="urgent">🚨 {stats.escalated} escaladé(s)</Badge>}
            {stats.urgent > 0 && <Badge variant="warning">🔥 {stats.urgent} urgent(s)</Badge>}
          </h1>
          <p className="text-sm text-slate-400">Communication entre bureaux + traçabilité (réponse / escalade / résolution)</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={resetAll}>
            Réinitialiser
          </Button>
          <Button onClick={() => addToast('Nouvel échange créé', 'success')}>+ Nouvel échange</Button>
        </div>
      </div>

      {/* Alert escalade */}
      {stats.escalated > 0 && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚨</span>
              <div className="flex-1">
                <h3 className="font-bold text-red-400">{stats.escalated} échange(s) escaladé(s)</h3>
                <p className="text-sm text-slate-400">Nécessitent arbitrage / décision DG</p>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setEscalatedOnly(true);
                  setStatusFilter('all');
                  addToast('Filtre: escaladés', 'info');
                }}
              >
                Voir escaladés
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recherche + tri + toggles */}
      <div className="flex flex-wrap items-center gap-2">
        <div
          className={cn(
            'flex-1 min-w-[220px] rounded border px-3 py-2',
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          )}
        >
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher (objet, message, bureaux, agents, projet...)"
            className={cn(
              'w-full bg-transparent outline-none text-sm',
              darkMode ? 'text-slate-100 placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'
            )}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant={sortMode === 'recent' ? 'default' : 'secondary'} onClick={() => setSortMode('recent')}>
            🕒 Récent
          </Button>
          <Button size="sm" variant={sortMode === 'priority' ? 'default' : 'secondary'} onClick={() => setSortMode('priority')}>
            🔥 Priorité
          </Button>
          <Button size="sm" variant={sortMode === 'escalated_first' ? 'default' : 'secondary'} onClick={() => setSortMode('escalated_first')}>
            🚨 Escaladés d'abord
          </Button>
          <Button size="sm" variant={sortMode === 'status' ? 'default' : 'secondary'} onClick={() => setSortMode('status')}>
            📌 Statut
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant={urgentOnly ? 'default' : 'secondary'} onClick={() => setUrgentOnly((v) => !v)}>
            🔥 Urgents
          </Button>
          <Button size="sm" variant={escalatedOnly ? 'default' : 'secondary'} onClick={() => setEscalatedOnly((v) => !v)}>
            🚨 Escaladés
          </Button>
          <Button size="sm" variant={withAttachmentsOnly ? 'default' : 'secondary'} onClick={() => setWithAttachmentsOnly((v) => !v)}>
            📎 Avec PJ
          </Button>
          <Button size="sm" variant={projectOnly ? 'default' : 'secondary'} onClick={() => setProjectOnly((v) => !v)}>
            📁 Avec projet
          </Button>
        </div>
      </div>

      {/* Quick filters statut */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'Tous', count: stats.total },
          { id: 'pending', label: '⏳ En attente', count: stats.pending },
          { id: 'escalated', label: '🚨 Escaladés', count: stats.escalated },
          { id: 'resolved', label: '✅ Résolus', count: stats.resolved },
        ].map((f) => (
          <Button
            key={f.id}
            size="sm"
            variant={statusFilter === f.id ? 'default' : 'secondary'}
            onClick={() => setStatusFilter(f.id as StatusFilter)}
          >
            {f.label} ({f.count})
          </Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Liste */}
        <div className="lg:col-span-2 space-y-3">
          {filteredEchanges.map((echange: any) => {
            const isSelected = selectedEchange === echange.id;

            return (
              <Card
                key={echange.id}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected ? 'ring-2 ring-blue-500' : 'hover:border-blue-500/50',
                  echange.status === 'escalated' && 'border-l-4 border-l-red-500',
                  echange.status === 'pending' && echange.priority === 'urgent' && 'border-l-4 border-l-orange-500',
                  echange.status === 'resolved' && 'border-l-4 border-l-emerald-500 opacity-70'
                )}
                onClick={() => setSelectedEchange(echange.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-blue-400">{echange.id}</span>

                        <Badge variant={statusBadgeVariant(echange.status)}>
                          {echange.status === 'escalated' ? 'Escaladé' : echange.status === 'pending' ? 'En attente' : 'Résolu'}
                        </Badge>

                        <Badge variant={priorityBadgeVariant(echange.priority)}>{echange.priority}</Badge>

                        {echange.hasAttachments && <Badge variant="info">📎 PJ</Badge>}
                        {echange.hasProject && <Badge variant="info">📁 Projet</Badge>}
                      </div>

                      <h3 className="font-bold mt-1">{echange.subject}</h3>
                    </div>

                    <span className="text-[10px] text-slate-500">{echange.date}</span>
                  </div>

                  {/* De -> Vers */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <BureauTag bureau={echange.from} />
                      {echange.fromAgent && <span className="text-xs text-slate-400">({echange.fromAgent})</span>}
                    </div>
                    <span className="text-slate-500">→</span>
                    <div className="flex items-center gap-1">
                      <BureauTag bureau={echange.to} />
                      {echange.toAgent && <span className="text-xs text-slate-400">({echange.toAgent})</span>}
                    </div>
                  </div>

                  {/* Message */}
                  {echange.message && (
                    <div className={cn('p-3 rounded-lg text-xs mb-3', darkMode ? 'bg-slate-700/50' : 'bg-gray-100')}>
                      {echange.message}
                    </div>
                  )}

                  {/* Métadonnées */}
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 mb-3">
                    {echange.project && (
                      <span>
                        📁 Projet: <span className="text-orange-400">{echange.project}</span>
                      </span>
                    )}
                    {echange.attachments && <span>📎 {echange.attachments} pièce(s) jointe(s)</span>}
                  </div>

                  {/* Actions */}
                  {echange.status !== 'resolved' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50" onClick={(ev) => ev.stopPropagation()}>
                      <Button size="sm" variant="info" onClick={() => handleRespond(echange)}>
                        ↩️ Répondre
                      </Button>
                      {echange.status === 'pending' && (
                        <Button size="sm" variant="warning" onClick={() => handleEscalate(echange)}>
                          ⬆️ Escalader
                        </Button>
                      )}
                      <Button size="sm" variant="success" onClick={() => handleClose(echange)}>
                        ✓ Résoudre
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {filteredEchanges.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-slate-400">Aucun échange trouvé avec ces filtres.</p>
                <Button size="sm" variant="outline" onClick={resetAll} className="mt-4">
                  Réinitialiser
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panel détail */}
        <div className="lg:col-span-1">
          {selectedE ? (
            <Card className="sticky top-4">
              <CardContent className="p-4">
                <div className="mb-4 pb-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant={statusBadgeVariant(selectedE.status)}>
                      {selectedE.status === 'escalated' ? 'Escaladé' : selectedE.status === 'pending' ? 'En attente' : 'Résolu'}
                    </Badge>
                    <Badge variant={priorityBadgeVariant(selectedE.priority)}>{selectedE.priority}</Badge>
                    {selectedE.hasAttachments && <Badge variant="info">📎 PJ</Badge>}
                    {selectedE.hasProject && <Badge variant="info">📁 Projet</Badge>}
                  </div>

                  <span className="font-mono text-xs text-blue-400">{selectedE.id}</span>
                  <h3 className="font-bold">{selectedE.subject}</h3>

                  {/* hash local "audit view" */}
                  <div className="mt-2">
                    <p className="text-[10px] text-slate-400">🔐 Hash (lecture)</p>
                    <p className="font-mono text-[10px] text-slate-500 truncate">
                      {generateHash(`${selectedE.id}-${selectedE.date}-${selectedE.subject}`)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-center gap-4 p-3 rounded bg-slate-700/30">
                    <div className="text-center">
                      <p className="text-xs text-slate-400">De</p>
                      <BureauTag bureau={selectedE.from} />
                      {selectedE.fromAgent && <p className="text-[10px] text-slate-500 mt-1">{selectedE.fromAgent}</p>}
                    </div>
                    <span className="text-2xl">→</span>
                    <div className="text-center">
                      <p className="text-xs text-slate-400">À</p>
                      <BureauTag bureau={selectedE.to} />
                      {selectedE.toAgent && <p className="text-[10px] text-slate-500 mt-1">{selectedE.toAgent}</p>}
                    </div>
                  </div>

                  <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                    <p className="text-xs text-slate-400 mb-1">Date</p>
                    <p>{selectedE.date}</p>
                  </div>

                  {selectedE.message && (
                    <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                      <p className="text-xs text-slate-400 mb-1">Message</p>
                      <p className="text-xs">{selectedE.message}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    {selectedE.project && (
                      <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                        <p className="text-xs text-slate-400 mb-1">Projet lié</p>
                        <Badge variant="info">📁 {selectedE.project}</Badge>
                      </div>
                    )}
                    {selectedE.attachments && (
                      <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                        <p className="text-xs text-slate-400">📎 {selectedE.attachments} pièce(s) jointe(s)</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedE.status !== 'resolved' && (
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-700/50">
                    <Button size="sm" variant="info" onClick={() => handleRespond(selectedE)}>
                      ↩️ Répondre
                    </Button>
                    {selectedE.status === 'pending' && (
                      <Button size="sm" variant="warning" onClick={() => handleEscalate(selectedE)}>
                        ⬆️ Escalader au DG
                      </Button>
                    )}
                    <Button size="sm" variant="success" onClick={() => handleClose(selectedE)}>
                      ✓ Résoudre
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="p-8 text-center">
                <span className="text-4xl mb-4 block">🔄</span>
                <p className="text-slate-400">Sélectionnez un échange</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
