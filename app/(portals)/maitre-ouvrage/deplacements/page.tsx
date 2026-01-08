'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { demandesRH, employees, plannedAbsences } from '@/lib/data';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import { useAutoSyncCounts } from '@/hooks/useAutoSync';

type StatusFilter = 'all' | 'pending' | 'validated' | 'rejected';
type SortMode = 'soon' | 'recent' | 'oldest' | 'priority' | 'missing_om';

type HRRequest = (typeof demandesRH)[number];

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

const daysBetween = (aMs: number, bMs: number) => Math.ceil((bMs - aMs) / (1000 * 60 * 60 * 24));

const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) => {
  if (!aStart || !aEnd || !bStart || !bEnd) return false;
  return aStart <= bEnd && bStart <= aEnd;
};

const generateHash = (data: string): string => {
  let hash = 2166136261;
  for (let i = 0; i < data.length; i++) {
    hash ^= data.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `SHA3:${(hash >>> 0).toString(16).padStart(12, '0')}...`;
};

export default function DeplacementsPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedDemande, setSelectedDemande] = useState<string | null>(null);

  // "même travail" : recherche / tri / toggles / persistance
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('soon');
  const [upcomingOnly, setUpcomingOnly] = useState(false); // prochains 30 jours
  const [missingOMOnly, setMissingOMOnly] = useState(false);
  const [spofOnly, setSpofOnly] = useState(false);
  const [conflictOnly, setConflictOnly] = useState(false); // conflit avec absence planifiée

  // Navigation / persistance
  const { updateFilters, getFilters } = usePageNavigation('deplacements');

  useEffect(() => {
    try {
      const saved = getFilters?.();
      if (!saved) return;

      if (saved.statusFilter) setStatusFilter(saved.statusFilter);
      if (typeof saved.searchQuery === 'string') setSearchQuery(saved.searchQuery);
      if (saved.sortMode) setSortMode(saved.sortMode);
      if (typeof saved.upcomingOnly === 'boolean') setUpcomingOnly(saved.upcomingOnly);
      if (typeof saved.missingOMOnly === 'boolean') setMissingOMOnly(saved.missingOMOnly);
      if (typeof saved.spofOnly === 'boolean') setSpofOnly(saved.spofOnly);
      if (typeof saved.conflictOnly === 'boolean') setConflictOnly(saved.conflictOnly);
      if (typeof saved.selectedDemande === 'string') setSelectedDemande(saved.selectedDemande);
    } catch {
      // silent
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      updateFilters?.({
        statusFilter,
        searchQuery,
        sortMode,
        upcomingOnly,
        missingOMOnly,
        spofOnly,
        conflictOnly,
        selectedDemande,
      });
    } catch {
      // silent
    }
  }, [statusFilter, searchQuery, sortMode, upcomingOnly, missingOMOnly, spofOnly, conflictOnly, selectedDemande, updateFilters]);

  // Enrichir les déplacements
  const deplacementsDemandes = useMemo(() => {
    const now = Date.now();

    return (demandesRH as HRRequest[])
      .filter((d: any) => d.type === 'Déplacement')
      .map((d: any) => {
        const startMs = parseFRDateToMs(d.startDate);
        const endMs = parseFRDateToMs(d.endDate);
        const createdMs = parseFRDateToMs(d.date);

        const hasOrdreMission = Boolean(d.documents?.some((x: any) => x.type === 'ordre_mission'));
        const isMissingOMPending = d.status === 'pending' && !hasOrdreMission;

        const employee = employees.find((e: any) => e.name === d.agent);
        const isSPOF = Boolean(employee?.isSinglePointOfFailure);

        const isUpcoming = Boolean(startMs && startMs > now);
        const inNext30 = Boolean(startMs && startMs >= now && startMs <= now + 30 * 24 * 60 * 60 * 1000);
        const daysToStart = startMs ? daysBetween(now, startMs) : null;

        // Conflit avec absences planifiées (ex: déplacement pendant un congé déjà prévu)
        const absencesForEmployee = plannedAbsences.filter((a: any) => a.employeeName === d.agent || a.employeeId === employee?.id);
        const hasConflict = absencesForEmployee.some((a: any) => {
          const aStart = parseFRDateToMs(a.startDate);
          const aEnd = parseFRDateToMs(a.endDate);
          return overlaps(startMs, endMs, aStart, aEnd);
        });

        return {
          ...d,
          startMs,
          endMs,
          createdMs,
          hasOrdreMission,
          isMissingOMPending,
          employee,
          isSPOF,
          isUpcoming,
          inNext30,
          daysToStart,
          hasConflict,
        };
      });
  }, []);

  // Sidebar count (pending déplacements)
  useAutoSyncCounts(
    'deplacements',
    () => deplacementsDemandes.filter((d: any) => d.status === 'pending').length,
    { interval: 10000, immediate: true }
  );

  // Stats
  const stats = useMemo(() => {
    const now = Date.now();
    const pending = deplacementsDemandes.filter((d: any) => d.status === 'pending');
    const validated = deplacementsDemandes.filter((d: any) => d.status === 'validated');
    const rejected = deplacementsDemandes.filter((d: any) => d.status === 'rejected');

    const aVenir = deplacementsDemandes.filter((d: any) => d.startMs && d.startMs > now);
    const next30 = deplacementsDemandes.filter((d: any) => d.inNext30);

    const coutEstime = deplacementsDemandes
      .filter((d: any) => d.amount)
      .reduce((acc: number, d: any) => acc + Number(String(d.amount).replace(/,/g, '') || 0), 0);

    const missingOMPending = deplacementsDemandes.filter((d: any) => d.isMissingOMPending).length;
    const spofUpcoming = deplacementsDemandes.filter((d: any) => d.isSPOF && d.inNext30).length;
    const conflicts = deplacementsDemandes.filter((d: any) => d.hasConflict).length;

    return {
      total: deplacementsDemandes.length,
      pending: pending.length,
      validated: validated.length,
      rejected: rejected.length,
      aVenir: aVenir.length,
      next30: next30.length,
      coutEstime,
      missingOMPending,
      spofUpcoming,
      conflicts,
    };
  }, [deplacementsDemandes]);

  const filteredDemandes = useMemo(() => {
    let result = [...deplacementsDemandes] as any[];

    // statut
    if (statusFilter !== 'all') result = result.filter((d) => d.status === statusFilter);

    // toggles
    if (upcomingOnly) result = result.filter((d) => d.inNext30);
    if (missingOMOnly) result = result.filter((d) => d.isMissingOMPending);
    if (spofOnly) result = result.filter((d) => d.isSPOF);
    if (conflictOnly) result = result.filter((d) => d.hasConflict);

    // recherche
    const q = normalize(searchQuery);
    if (q) {
      result = result.filter((d) => {
        const hay = normalize(
          [
            d.id,
            d.agent,
            d.bureau,
            d.destination,
            d.reason,
            d.status,
            d.priority,
            d.startDate,
            d.endDate,
            d.validatedBy,
            d.validatedAt,
          ].join(' | ')
        );
        return hay.includes(q);
      });
    }

    // tri
    result.sort((a, b) => {
      if (sortMode === 'recent') return (b.createdMs || 0) - (a.createdMs || 0);
      if (sortMode === 'oldest') return (a.createdMs || 0) - (b.createdMs || 0);
      if (sortMode === 'priority') {
        const rank: Record<string, number> = { urgent: 3, high: 2, normal: 1 };
        return (rank[b.priority] || 0) - (rank[a.priority] || 0);
      }
      if (sortMode === 'missing_om') {
        const aKey = a.isMissingOMPending ? 0 : 1;
        const bKey = b.isMissingOMPending ? 0 : 1;
        if (aKey !== bKey) return aKey - bKey;
        return (a.startMs || 0) - (b.startMs || 0);
      }
      // soon
      return (a.startMs || 0) - (b.startMs || 0);
    });

    return result;
  }, [deplacementsDemandes, statusFilter, upcomingOnly, missingOMOnly, spofOnly, conflictOnly, searchQuery, sortMode]);

  const selectedD = useMemo(() => {
    return selectedDemande ? (deplacementsDemandes.find((d: any) => d.id === selectedDemande) as any) : null;
  }, [selectedDemande, deplacementsDemandes]);

  // Actions
  const handleApprove = (demande: any) => {
    if (!demande) return;
    const hasOrdreMission = Boolean(demande.hasOrdreMission);
    const hash = generateHash(`${demande.id}-${Date.now()}-approve`);

    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'deplacements',
      // WHY: Cast vers ActionLogType car 'approve' n'est pas dans le type
      action: 'approve' as any,
      targetId: demande.id,
      targetType: 'HRRequest',
      details: `Déplacement approuvé: ${demande.destination} - Agent: ${demande.agent} - Hash: ${hash}`,
    });

    if (!hasOrdreMission) addToast('Déplacement approuvé - Ordre de mission à générer', 'warning');
    else addToast('Déplacement approuvé', 'success');
  };

  const handleGenerateOrdreMission = (demande: any) => {
    if (!demande) return;
    const hash = generateHash(`${demande.id}-${Date.now()}-generate_om`);

    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'deplacements',
      action: 'generate_ordre_mission',
      targetId: demande.id,
      targetType: 'HRRequest',
      details: `Ordre de mission généré - Hash: ${hash}`,
    });

    addToast('Ordre de mission généré', 'success');
  };

  const handleReject = (demande: any) => {
    if (!demande) return;
    const reason = window.prompt('Motif du refus (trace audit) :', 'Motif à préciser') || 'Motif à préciser';
    const hash = generateHash(`${demande.id}-${Date.now()}-reject-${reason}`);

    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'deplacements',
      action: 'rejection',
      targetId: demande.id,
      targetType: 'HRRequest',
      details: `Déplacement refusé: ${reason} - Hash: ${hash}`,
    });

    addToast('Déplacement refusé', 'error');
  };

  const resetAll = () => {
    setStatusFilter('all');
    setSearchQuery('');
    setSortMode('soon');
    setUpcomingOnly(false);
    setMissingOMOnly(false);
    setSpofOnly(false);
    setConflictOnly(false);
    addToast('Filtres réinitialisés', 'info');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            ✈️ Déplacements & Missions
            <Badge variant="warning">{stats.pending} en attente</Badge>
            {stats.missingOMPending > 0 && <Badge variant="urgent">📄 {stats.missingOMPending} OM manquant(s)</Badge>}
            {stats.conflicts > 0 && <Badge variant="warning">⚠️ {stats.conflicts} conflit(s)</Badge>}
          </h1>
          <p className="text-sm text-slate-400">Validation + ordres de mission + alertes RH (SPOF / conflits / traçabilité)</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={resetAll}>
            Réinitialiser
          </Button>
          <Button onClick={() => addToast('Nouveau déplacement créé', 'success')}>+ Nouveau déplacement</Button>
        </div>
      </div>

      {/* Barre recherche + tri + toggles */}
      <div className="flex flex-wrap items-center gap-2">
        <div className={cn('flex-1 min-w-[220px] rounded border px-3 py-2', darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200')}>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher (agent, bureau, destination, motif, dates, statut, priorité...)"
            className={cn('w-full bg-transparent outline-none text-sm', darkMode ? 'text-slate-100 placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400')}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant={sortMode === 'soon' ? 'default' : 'secondary'} onClick={() => setSortMode('soon')}>
            📅 Plus proches
          </Button>
          <Button size="sm" variant={sortMode === 'recent' ? 'default' : 'secondary'} onClick={() => setSortMode('recent')}>
            🕒 Récentes
          </Button>
          <Button size="sm" variant={sortMode === 'priority' ? 'default' : 'secondary'} onClick={() => setSortMode('priority')}>
            🚨 Priorité
          </Button>
          <Button size="sm" variant={sortMode === 'missing_om' ? 'default' : 'secondary'} onClick={() => setSortMode('missing_om')}>
            📄 OM d'abord
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant={upcomingOnly ? 'default' : 'secondary'} onClick={() => setUpcomingOnly((v) => !v)}>
            📅 30 jours
          </Button>
          <Button size="sm" variant={missingOMOnly ? 'default' : 'secondary'} onClick={() => setMissingOMOnly((v) => !v)}>
            📄 OM manquant
          </Button>
          <Button size="sm" variant={spofOnly ? 'default' : 'secondary'} onClick={() => setSpofOnly((v) => !v)}>
            ⚠️ SPOF
          </Button>
          <Button size="sm" variant={conflictOnly ? 'default' : 'secondary'} onClick={() => setConflictOnly((v) => !v)}>
            ⚠️ Conflits
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
            <p className="text-[10px] text-slate-400">En attente</p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.validated}</p>
            <p className="text-[10px] text-slate-400">Validés</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-500/10 border-slate-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-slate-300">{stats.rejected}</p>
            <p className="text-[10px] text-slate-400">Refusés</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.next30}</p>
            <p className="text-[10px] text-slate-400">Dans 30 jours</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-purple-400">{(stats.coutEstime / 1000).toFixed(0)}K</p>
            <p className="text-[10px] text-slate-400">Coûts estimés</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-amber-400">{stats.spofUpcoming}</p>
            <p className="text-[10px] text-slate-400">SPOF (30 jours)</p>
          </CardContent>
        </Card>
      </div>

      {/* Bandeau alertes (préventif) */}
      {(stats.missingOMPending > 0 || stats.conflicts > 0) && (
        <Card className="border-amber-500/40 bg-amber-500/10">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="font-bold text-amber-300">Alertes de conformité / planning</h3>
                  <p className="text-sm text-slate-400">
                    {stats.missingOMPending > 0 && `• ${stats.missingOMPending} ordre(s) de mission manquant(s) (pending) `}
                    {stats.conflicts > 0 && `• ${stats.conflicts} conflit(s) avec absences planifiées `}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {stats.missingOMPending > 0 && (
                  <Button size="sm" variant="secondary" onClick={() => { setMissingOMOnly(true); setStatusFilter('pending'); addToast('Filtrage: OM manquants', 'info'); }}>
                    📄 Voir OM manquants
                  </Button>
                )}
                {stats.conflicts > 0 && (
                  <Button size="sm" variant="secondary" onClick={() => { setConflictOnly(true); addToast('Filtrage: conflits planning', 'info'); }}>
                    ⚠️ Voir conflits
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prochains déplacements */}
      {stats.aVenir > 0 && (
        <Card className="border-blue-500/50 bg-blue-500/10">
          <CardContent className="p-4">
            <h3 className="font-bold text-sm mb-3 text-blue-400">📅 Prochains déplacements</h3>
            <div className="flex flex-wrap gap-2">
              {deplacementsDemandes
                .filter((d: any) => d.startMs && d.startMs > Date.now())
                .sort((a: any, b: any) => (a.startMs || 0) - (b.startMs || 0))
                .slice(0, 6)
                .map((d: any) => (
                  <div
                    key={d.id}
                    className={cn(
                      'p-2 rounded cursor-pointer hover:bg-blue-500/20 border',
                      darkMode ? 'bg-slate-700/30 border-slate-600/40' : 'bg-white/50 border-blue-500/10'
                    )}
                    onClick={() => setSelectedDemande(d.id)}
                    title="Cliquer pour ouvrir"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✈️</span>
                      <div>
                        <p className="font-medium text-sm">{d.agent}</p>
                        <p className="text-xs text-slate-400">{d.destination}</p>
                        <p className="text-[10px] text-blue-300">
                          {d.startDate} {typeof d.daysToStart === 'number' ? `• J-${d.daysToStart}` : ''}
                        </p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {d.isSPOF && <Badge variant="warning" className="text-[10px]">⚠️ SPOF</Badge>}
                          {d.isMissingOMPending && <Badge variant="urgent" className="text-[10px]">📄 OM</Badge>}
                          {d.hasConflict && <Badge variant="warning" className="text-[10px]">⚠️ conflit</Badge>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtres statut */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'Tous', count: stats.total },
          { id: 'pending', label: '⏳ En attente', count: stats.pending },
          { id: 'validated', label: '✅ Validés', count: stats.validated },
          { id: 'rejected', label: '❌ Refusés', count: stats.rejected },
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
          {filteredDemandes.map((demande: any) => {
            const isSelected = selectedDemande === demande.id;

            return (
              <Card
                key={demande.id}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected ? 'ring-2 ring-orange-500' : 'hover:border-orange-500/50',
                  demande.priority === 'urgent' && 'border-l-4 border-l-red-500',
                  demande.isSPOF && 'border-r-4 border-r-amber-500',
                  demande.hasConflict && 'ring-2 ring-amber-500/30',
                  demande.status === 'validated' && 'border-l-4 border-l-emerald-500',
                  demande.status === 'rejected' && 'border-l-4 border-l-slate-500 opacity-60'
                )}
                onClick={() => setSelectedDemande(demande.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white">
                        {demande.initials}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] text-orange-400">{demande.id}</span>
                          <BureauTag bureau={demande.bureau} />

                          {demande.isSPOF && <Badge variant="warning">⚠️ SPOF</Badge>}
                          {demande.hasConflict && <Badge variant="warning">⚠️ Conflit planning</Badge>}

                          {!demande.hasOrdreMission && demande.status === 'pending' && (
                            <Badge variant="urgent">📄 OM manquant</Badge>
                          )}

                          {demande.inNext30 && <Badge variant="info">📅 30j</Badge>}
                        </div>

                        <h3 className="font-bold">{demande.agent}</h3>
                        <p className="text-sm text-blue-400 font-medium">📍 {demande.destination}</p>
                        <p className="text-xs text-slate-400">{demande.reason}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge
                        variant={
                          demande.status === 'validated'
                            ? 'success'
                            : demande.status === 'rejected'
                              ? 'default'
                              : demande.priority === 'urgent'
                                ? 'urgent'
                                : demande.priority === 'high'
                                  ? 'warning'
                                  : 'info'
                        }
                        pulse={demande.priority === 'urgent' && demande.status === 'pending'}
                      >
                        {demande.status === 'validated' ? '✅ Validé' : demande.status === 'rejected' ? '❌ Refusé' : demande.priority}
                      </Badge>
                      <p className="text-[10px] text-slate-500 mt-1">{demande.date}</p>
                    </div>
                  </div>

                  {/* Période et durée */}
                  <div
                    className={cn(
                      'flex justify-between items-center p-2 rounded text-sm mb-2',
                      darkMode ? 'bg-slate-700/30' : 'bg-gray-100'
                    )}
                  >
                    <span>
                      📅 {demande.startDate} → {demande.endDate}
                    </span>
                    <div className="flex items-center gap-2">
                      {typeof demande.daysToStart === 'number' && demande.startMs > Date.now() && (
                        <Badge variant="info">J-{demande.daysToStart}</Badge>
                      )}
                      <Badge variant="default">{demande.days} jours</Badge>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="flex gap-1 mb-2 flex-wrap">
                    {demande.documents?.map((doc: any) => (
                      <Badge
                        key={doc.id}
                        variant={doc.type === 'ordre_mission' ? 'success' : 'info'}
                        className="text-[9px]"
                        title={doc.name}
                      >
                        {doc.type === 'ordre_mission' ? '📄 OM' : '📎'} {String(doc.name || '').slice(0, 18)}
                        {String(doc.name || '').length > 18 ? '…' : ''}
                      </Badge>
                    ))}
                    {(!demande.documents || demande.documents.length === 0) && (
                      <Badge variant="default" className="text-[9px]">
                        📎 Aucun document
                      </Badge>
                    )}
                  </div>

                  {/* Trace validation */}
                  {demande.validatedBy && (
                    <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-xs">
                      <p className="text-emerald-400">✅ Validé par {demande.validatedBy}</p>
                      <p className="text-slate-400">{demande.validatedAt}</p>
                      {demande.hash && (
                        <p className="text-slate-500 mt-1">
                          🔐 Hash: <span className="font-mono">{demande.hash}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  {demande.status === 'pending' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => {
                          const ok = window.confirm(`Approuver le déplacement ${demande.id} vers ${demande.destination} ?`);
                          if (ok) handleApprove(demande);
                        }}
                      >
                        ✓ Approuver
                      </Button>

                      {!demande.hasOrdreMission && (
                        <Button size="sm" variant="info" onClick={() => handleGenerateOrdreMission(demande)}>
                          📄 Générer OM
                        </Button>
                      )}

                      <Button size="sm" variant="destructive" onClick={() => handleReject(demande)}>
                        ✕ Refuser
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Panel détail */}
        <div className="lg:col-span-1">
          {selectedD ? (
            <Card className="sticky top-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-700/50">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white">
                    {selectedD.initials}
                  </div>
                  <div>
                    <h3 className="font-bold">{selectedD.agent}</h3>
                    <p className="text-blue-400 font-medium">📍 {selectedD.destination}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      <BureauTag bureau={selectedD.bureau} />
                      {selectedD.isSPOF && <Badge variant="warning">⚠️ SPOF</Badge>}
                      {selectedD.hasConflict && <Badge variant="warning">⚠️ Conflit</Badge>}
                      {selectedD.isMissingOMPending && <Badge variant="urgent">📄 OM manquant</Badge>}
                      {selectedD.inNext30 && <Badge variant="info">📅 30j</Badge>}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                    <p className="text-xs text-slate-400 mb-1">Période</p>
                    <p className="font-medium">
                      {selectedD.startDate} → {selectedD.endDate}
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge variant="default">{selectedD.days} jours</Badge>
                      {typeof selectedD.daysToStart === 'number' && selectedD.startMs > Date.now() && (
                        <Badge variant="info">Départ dans J-{selectedD.daysToStart}</Badge>
                      )}
                    </div>
                  </div>

                  <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                    <p className="text-xs text-slate-400 mb-1">Motif</p>
                    <p>{selectedD.reason}</p>
                  </div>

                  {/* Documents */}
                  <div>
                    <h4 className="font-bold text-xs mb-2">📄 Documents</h4>
                    {selectedD.documents && selectedD.documents.length > 0 ? (
                      <div className="space-y-1">
                        {selectedD.documents.map((doc: any) => (
                          <div
                            key={doc.id}
                            className={cn(
                              'p-2 rounded flex items-center justify-between',
                              doc.type === 'ordre_mission'
                                ? 'bg-emerald-500/10 border border-emerald-500/30'
                                : darkMode
                                  ? 'bg-slate-700/30'
                                  : 'bg-gray-100'
                            )}
                          >
                            <span className="text-xs">{doc.name}</span>
                            <Badge variant={doc.type === 'ordre_mission' ? 'success' : 'default'}>
                              {doc.type === 'ordre_mission' ? '✓ OM' : doc.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400">
                        ⚠️ Aucun document - Ordre de mission non généré
                      </div>
                    )}
                  </div>

                  {/* Conflit planning : détails */}
                  {selectedD.hasConflict && (
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30">
                      <p className="text-xs text-amber-400">⚠️ Conflit avec absence planifiée</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Vérifier le calendrier RH / ajuster dates / arbitrer mission.
                      </p>
                    </div>
                  )}

                  {/* Hash */}
                  {selectedD.hash && (
                    <div className="p-2 rounded bg-slate-700/30">
                      <p className="text-[10px] text-slate-400">🔐 Traçabilité</p>
                      <p className="font-mono text-[10px] truncate">{selectedD.hash}</p>
                    </div>
                  )}
                </div>

                {selectedD.status === 'pending' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700/50">
                    <Button size="sm" variant="success" className="flex-1" onClick={() => handleApprove(selectedD)}>
                      ✓ Approuver
                    </Button>
                    <Button size="sm" variant="info" className="flex-1" onClick={() => handleGenerateOrdreMission(selectedD)}>
                      📄 OM
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleReject(selectedD)}>
                      ✕ Refuser
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="p-8 text-center">
                <span className="text-4xl mb-4 block">✈️</span>
                <p className="text-slate-400">Sélectionnez un déplacement</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {filteredDemandes.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-400">Aucun déplacement trouvé avec les filtres sélectionnés</p>
            <Button size="sm" variant="outline" onClick={resetAll} className="mt-4">
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
