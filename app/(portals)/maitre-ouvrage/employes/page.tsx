'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import {
  employees,
  employeesDetails,
  delegations,
  evaluations,
  criticalSkills,
  bureaux,
} from '@/lib/data';
import type { EmployeeStatus } from '@/lib/types/bmo.types';

import { usePageNavigation } from '@/hooks/usePageNavigation';
import { useAutoSyncCounts } from '@/hooks/useAutoSync';

type StatusFilter = 'all' | EmployeeStatus;
type SortMode = 'name' | 'bureau' | 'risk' | 'salary' | 'status';
type ContractFilter = 'all' | 'CDI' | 'CDD';

const normalize = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const parseMoney = (s?: string) => {
  if (!s) return 0;
  const clean = String(s).replace(/[^\d.]/g, '').replace(/,/g, '');
  const n = Number(clean);
  return Number.isFinite(n) ? n : 0;
};

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

const daysUntil = (dateStr?: string) => {
  const ms = parseFRDateToMs(dateStr);
  if (!ms) return null;
  const now = Date.now();
  const diff = ms - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const riskScore = (args: {
  spof?: boolean;
  contractType?: string;
  contractEnd?: string | null;
  congesRestants?: number;
  scoreEvaluation?: number | null;
  absencesNonJustifiees?: number;
  retards?: number;
}) => {
  let s = 0;
  if (args.spof) s += 50;

  if (args.contractType === 'CDD') {
    s += 5;
    const d = daysUntil(args.contractEnd || undefined);
    if (typeof d === 'number') {
      if (d <= 30) s += 25;
      else if (d <= 60) s += 15;
      else if (d <= 90) s += 8;
    }
  }

  if (typeof args.congesRestants === 'number') {
    if (args.congesRestants < 5) s += 10;
    if (args.congesRestants < 2) s += 8;
  }

  if (typeof args.scoreEvaluation === 'number') {
    if (args.scoreEvaluation < 60) s += 18;
    else if (args.scoreEvaluation < 70) s += 10;
  }

  if ((args.absencesNonJustifiees || 0) > 0) s += 20;
  if ((args.retards || 0) > 2) s += 10;
  else if ((args.retards || 0) > 0) s += 5;

  return Math.min(100, s);
};

const riskLabel = (s: number) => {
  if (s >= 70) return { text: 'Risque élevé', variant: 'urgent' as const };
  if (s >= 40) return { text: 'Risque moyen', variant: 'warning' as const };
  if (s >= 15) return { text: 'Risque faible', variant: 'info' as const };
  return { text: 'OK', variant: 'success' as const };
};

export default function EmployesPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();

  const [filter, setFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'delegations' | 'evaluations'>('info');

  // "même travail" : filtres + tri + toggles préventifs + persistance
  const [sortMode, setSortMode] = useState<SortMode>('risk');
  const [contractFilter, setContractFilter] = useState<ContractFilter>('all');
  const [bureauFilter, setBureauFilter] = useState<string>('all');

  const [spofOnly, setSpofOnly] = useState(false);
  const [contractEndingSoonOnly, setContractEndingSoonOnly] = useState(false);
  const [lowLeaveOnly, setLowLeaveOnly] = useState(false);
  const [lowScoreOnly, setLowScoreOnly] = useState(false);

  const { updateFilters, getFilters } = usePageNavigation('employes');

  useEffect(() => {
    try {
      const saved = getFilters?.();
      if (!saved) return;

      if (saved.filter) setFilter(saved.filter);
      if (typeof saved.searchQuery === 'string') setSearchQuery(saved.searchQuery);
      if (typeof saved.selectedEmployee === 'string') setSelectedEmployee(saved.selectedEmployee);
      if (saved.activeTab) setActiveTab(saved.activeTab);

      if (saved.sortMode) setSortMode(saved.sortMode);
      if (saved.contractFilter) setContractFilter(saved.contractFilter);
      if (typeof saved.bureauFilter === 'string') setBureauFilter(saved.bureauFilter);

      if (typeof saved.spofOnly === 'boolean') setSpofOnly(saved.spofOnly);
      if (typeof saved.contractEndingSoonOnly === 'boolean') setContractEndingSoonOnly(saved.contractEndingSoonOnly);
      if (typeof saved.lowLeaveOnly === 'boolean') setLowLeaveOnly(saved.lowLeaveOnly);
      if (typeof saved.lowScoreOnly === 'boolean') setLowScoreOnly(saved.lowScoreOnly);
    } catch {
      // silent
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      updateFilters?.({
        filter,
        searchQuery,
        selectedEmployee,
        activeTab,
        sortMode,
        contractFilter,
        bureauFilter,
        spofOnly,
        contractEndingSoonOnly,
        lowLeaveOnly,
        lowScoreOnly,
      });
    } catch {
      // silent
    }
  }, [
    filter,
    searchQuery,
    selectedEmployee,
    activeTab,
    sortMode,
    contractFilter,
    bureauFilter,
    spofOnly,
    contractEndingSoonOnly,
    lowLeaveOnly,
    lowScoreOnly,
    updateFilters,
  ]);

  // Indexes pour vitesse + cohérence
  const employeeById = useMemo(() => {
    const m: Record<string, (typeof employees)[number]> = {};
    employees.forEach((e) => (m[e.id] = e));
    return m;
  }, []);

  const detailsByEmployeeId = useMemo(() => {
    const m: Record<string, (typeof employeesDetails)[number]> = {};
    employeesDetails.forEach((d) => (m[d.employeeId] = d));
    return m;
  }, []);

  const delegationsByAgent = useMemo(() => {
    const m: Record<string, (typeof delegations)[number][]> = {};
    delegations.forEach((d) => {
      const key = normalize(d.agent);
      if (!m[key]) m[key] = [];
      m[key].push(d);
    });
    return m;
  }, []);

  const evaluationsByEmployeeId = useMemo(() => {
    const m: Record<string, (typeof evaluations)[number][]> = {};
    evaluations.forEach((ev) => {
      const key = ev.employeeId;
      if (!m[key]) m[key] = [];
      m[key].push(ev);
    });
    return m;
  }, []);

  // Risques mono-compétence par bureau (à partir de criticalSkills)
  const risquesParBureau = useMemo(() => {
    const risques: Record<string, number> = {};
    criticalSkills.filter((s) => s.isAtRisk).forEach((skill) => {
      risques[skill.bureau] = (risques[skill.bureau] || 0) + 1;
    });
    return risques;
  }, []);

  // Enrichir employés (risk, salaryNumber, etc.)
  const enrichedEmployees = useMemo(() => {
    return employees.map((e) => {
      const d = detailsByEmployeeId[e.id];
      const salaryNumber = parseMoney(e.salary);
      const score = riskScore({
        spof: e.isSinglePointOfFailure,
        contractType: d?.contractType,
        contractEnd: d?.contractEnd || null,
        congesRestants: d?.congesRestants,
        scoreEvaluation: d?.scoreEvaluation ?? null,
        absencesNonJustifiees: d?.absencesNonJustifiees,
        retards: d?.retards,
      });

      const endInDays = d?.contractEnd ? daysUntil(d.contractEnd) : null;
      const contractEndingSoon = d?.contractType === 'CDD' && typeof endInDays === 'number' && endInDays <= 60;

      return {
        ...e,
        _details: d || null,
        _salaryNumber: salaryNumber,
        _risk: score,
        _contractEndingSoon: Boolean(contractEndingSoon),
      };
    });
  }, [detailsByEmployeeId]);

  // Stats globales
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.status === 'active').length;
    const mission = employees.filter((e) => e.status === 'mission').length;
    const absent = employees.filter((e) => e.status === 'absent' || e.status === 'conge').length;

    const cdi = employeesDetails.filter((d) => d.contractType === 'CDI').length;
    const cdd = employeesDetails.filter((d) => d.contractType === 'CDD').length;

    const risquesMono = employees.filter((e) => e.isSinglePointOfFailure).length;
    const masseSalariale = employees.reduce((a, e) => a + parseMoney(e.salary), 0);

    const contractEndingSoon = enrichedEmployees.filter((e) => e._contractEndingSoon).length;
    const lowLeave = enrichedEmployees.filter((e) => (e._details?.congesRestants ?? 999) < 5).length;
    const lowScore = enrichedEmployees.filter((e) => (e._details?.scoreEvaluation ?? 999) < 60).length;

    return {
      total,
      active,
      mission,
      absent,
      cdi,
      cdd,
      risquesMono,
      masseSalariale,
      contractEndingSoon,
      lowLeave,
      lowScore,
    };
  }, [enrichedEmployees]);

  // Sidebar badge auto-sync : "alertes RH"
  useAutoSyncCounts(
    'employes',
    () => stats.risquesMono + stats.contractEndingSoon + stats.lowLeave + stats.lowScore,
    { interval: 12000, immediate: true }
  );

  // Filtres + recherche + tri
  const filteredEmployees = useMemo(() => {
    const q = normalize(searchQuery);

    let list = enrichedEmployees.filter((e) => {
      const matchesStatus = filter === 'all' || e.status === filter;

      const matchesContract =
        contractFilter === 'all' || (e._details?.contractType || '').toUpperCase() === contractFilter;

      const matchesBureau = bureauFilter === 'all' || e.bureau === bureauFilter;

      const matchesSearch =
        !q ||
        normalize(e.name).includes(q) ||
        normalize(e.role).includes(q) ||
        normalize(e.bureau).includes(q);

      const matchesToggles =
        (!spofOnly || e.isSinglePointOfFailure) &&
        (!contractEndingSoonOnly || e._contractEndingSoon) &&
        (!lowLeaveOnly || (e._details?.congesRestants ?? 999) < 5) &&
        (!lowScoreOnly || (e._details?.scoreEvaluation ?? 999) < 60);

      return matchesStatus && matchesContract && matchesBureau && matchesSearch && matchesToggles;
    });

    list.sort((a, b) => {
      if (sortMode === 'name') return normalize(a.name).localeCompare(normalize(b.name));
      if (sortMode === 'bureau') return normalize(a.bureau).localeCompare(normalize(b.bureau));
      if (sortMode === 'salary') return (b._salaryNumber || 0) - (a._salaryNumber || 0);
      if (sortMode === 'status') return normalize(a.status).localeCompare(normalize(b.status));
      // risk
      return (b._risk || 0) - (a._risk || 0);
    });

    return list;
  }, [
    enrichedEmployees,
    filter,
    contractFilter,
    bureauFilter,
    searchQuery,
    spofOnly,
    contractEndingSoonOnly,
    lowLeaveOnly,
    lowScoreOnly,
    sortMode,
  ]);

  const selectedEmp = selectedEmployee ? employeeById[selectedEmployee] : null;
  const selectedDetails = selectedEmployee ? detailsByEmployeeId[selectedEmployee] : null;

  const selectedDelegations = useMemo(() => {
    if (!selectedEmp) return [];
    return delegationsByAgent[normalize(selectedEmp.name)] || [];
  }, [selectedEmp, delegationsByAgent]);

  const selectedEvaluations = useMemo(() => {
    if (!selectedEmp) return [];
    return evaluationsByEmployeeId[selectedEmp.id] || [];
  }, [selectedEmp, evaluationsByEmployeeId]);

  // Actions (audit)
  const handleViewProfile = useCallback(
    (empId: string) => {
      setSelectedEmployee(empId);
      setActiveTab('info');

      const emp = employeeById[empId];
      addActionLog({
        userId: 'USR-001',
        userName: 'A. DIALLO',
        userRole: 'Directeur Général',
        module: 'employes',
        action: 'view_profile',
        targetId: empId,
        targetType: 'Employee',
        details: `Consultation profil: ${emp?.name || empId}`,
      });
    },
    [addActionLog, employeeById]
  );

  const handleExport = useCallback(() => {
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'employes',
      action: 'export',
      targetId: 'ALL',
      targetType: 'Employee',
      details: `Export liste employés (${employees.length})`,
    });
    addToast('Export employés généré', 'success');
  }, [addActionLog, addToast]);

  const handleMitigationPlan = useCallback(() => {
    const note =
      window.prompt(
        "Plan d'action (trace audit) :",
        "Définir backup(s), documentation, binômage, formation, procédure de substitution."
      ) || '';

    if (!note.trim()) return;

    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'employes',
      action: 'mitigation_plan',
      targetId: 'SPOF',
      targetType: 'Employee',
      details: `Plan mitigation SPOF: ${note}`,
    });
    addToast("Plan d'action enregistré (trace créée)", 'success');
  }, [addActionLog, addToast]);

  const handleEditEmployee = useCallback(() => {
    if (!selectedEmp) return;
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'employes',
      action: 'edit',
      targetId: selectedEmp.id,
      targetType: 'Employee',
      details: `Ouverture édition: ${selectedEmp.name}`,
    });
    addToast('Mode édition (à connecter)', 'info');
  }, [addActionLog, addToast, selectedEmp]);

  const handleEvaluateEmployee = useCallback(() => {
    if (!selectedEmp) return;
    const objective = window.prompt("Objectif de l'évaluation (trace audit) :", 'Évaluation périodique / performance / compétences');
    if (!objective) return;

    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'employes',
      action: 'evaluate',
      targetId: selectedEmp.id,
      targetType: 'Employee',
      details: `Demande évaluation: ${selectedEmp.name} | Objet: ${objective}`,
    });
    addToast('Évaluation déclenchée (trace créée)', 'success');
  }, [addActionLog, addToast, selectedEmp]);

  const resetAll = () => {
    setFilter('all');
    setSearchQuery('');
    setContractFilter('all');
    setBureauFilter('all');
    setSortMode('risk');
    setSpofOnly(false);
    setContractEndingSoonOnly(false);
    setLowLeaveOnly(false);
    setLowScoreOnly(false);
    addToast('Filtres réinitialisés', 'info');
  };

  // Top risques (mini panneau "préventif")
  const topRisks = useMemo(() => {
    return [...enrichedEmployees].sort((a, b) => (b._risk || 0) - (a._risk || 0)).slice(0, 5);
  }, [enrichedEmployees]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            👤 Employés & Agents
            <Badge variant="info">{stats.total}</Badge>
            {(stats.risquesMono + stats.contractEndingSoon) > 0 && (
              <Badge variant="warning">⚠️ {(stats.risquesMono + stats.contractEndingSoon)} alertes</Badge>
            )}
          </h1>
          <p className="text-sm text-slate-400">Gestion proactive du capital humain</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={resetAll}>
            Réinitialiser
          </Button>
          <Button variant="secondary" onClick={handleExport}>
            📥 Export
          </Button>
          <Button onClick={() => addToast('Nouvel employé ajouté', 'success')}>+ Nouvel employé</Button>
        </div>
      </div>

      {/* Alerte risques mono-compétence */}
      {stats.risquesMono > 0 && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h3 className="font-bold text-red-400">Risques mono-compétence détectés</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {stats.risquesMono} employé(s) détiennent des compétences critiques uniques. En cas d'absence, aucun backup disponible.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(risquesParBureau).map(([bureau, count]) => (
                    <Badge key={bureau} variant="urgent">
                      {bureau}: {count} risque{count > 1 ? 's' : ''}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button size="sm" variant="warning" onClick={handleMitigationPlan}>
                📋 Plan d'action
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats employés */}
      <div className="grid grid-cols-4 lg:grid-cols-9 gap-3">
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
            <p className="text-[10px] text-slate-400">Actifs</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.mission}</p>
            <p className="text-[10px] text-slate-400">En mission</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.absent}</p>
            <p className="text-[10px] text-slate-400">Absents</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.cdi}</p>
            <p className="text-[10px] text-slate-400">CDI</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.cdd}</p>
            <p className="text-[10px] text-slate-400">CDD</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-orange-400">{(stats.masseSalariale / 1_000_000).toFixed(1)}M</p>
            <p className="text-[10px] text-slate-400">Masse salariale</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.contractEndingSoon}</p>
            <p className="text-[10px] text-slate-400">CDD bientôt</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-500/10 border-slate-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-slate-300">{stats.lowLeave}</p>
            <p className="text-[10px] text-slate-400">Congés &lt; 5j</p>
          </CardContent>
        </Card>
        <Card className={cn('border-red-500/30', stats.risquesMono > 0 ? 'bg-red-500/20' : 'bg-slate-500/10')}>
          <CardContent className="p-3 text-center">
            <p className={cn('text-2xl font-bold', stats.risquesMono > 0 ? 'text-red-400' : 'text-slate-400')}>
              {stats.risquesMono}
            </p>
            <p className="text-[10px] text-slate-400">Risques mono</p>
          </CardContent>
        </Card>
      </div>

      {/* Effectif par bureau */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="font-bold text-sm">📊 Effectif par bureau</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="info">📎 {stats.total} total</Badge>
              <Badge variant="warning">⚠️ {Object.values(risquesParBureau).reduce((a, b) => a + b, 0)} risques</Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div
              className={cn(
                'px-3 py-2 rounded-lg text-center min-w-[100px] cursor-pointer border',
                bureauFilter === 'all' ? 'bg-blue-500/20 border-blue-500/40' : 'bg-slate-700/30 border-slate-700/30'
              )}
              onClick={() => setBureauFilter('all')}
              role="button"
              tabIndex={0}
            >
              <span className="text-lg">🏢</span>
              <p className="font-bold text-sm">{employees.length}</p>
              <p className="text-[10px] text-slate-400">Tous</p>
            </div>

            {bureaux.map((bureau) => {
              const count = employees.filter((e) => e.bureau === bureau.code).length;
              const hasRisk = (risquesParBureau[bureau.code] || 0) > 0;
              const selected = bureauFilter === bureau.code;

              return (
                <div
                  key={bureau.code}
                  className={cn(
                    'px-3 py-2 rounded-lg text-center min-w-[100px] cursor-pointer border',
                    selected ? 'bg-blue-500/20 border-blue-500/40' : hasRisk ? 'bg-red-500/15 border-red-500/40' : 'bg-slate-700/30 border-slate-700/30'
                  )}
                  onClick={() => setBureauFilter(bureau.code)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="text-lg">{bureau.icon}</span>
                  <p className="font-bold text-sm">{count}</p>
                  <p className="text-[10px] text-slate-400">{bureau.code}</p>
                  {hasRisk && (
                    <Badge variant="urgent" className="mt-1 text-[8px]">
                      ⚠️ {risquesParBureau[bureau.code]}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Mini panneau "top risques" */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="font-bold text-sm">🧭 Priorités RH (top risques)</h3>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant={spofOnly ? 'default' : 'secondary'} onClick={() => setSpofOnly((v) => !v)}>
                ⚠️ SPOF
              </Button>
              <Button
                size="sm"
                variant={contractEndingSoonOnly ? 'default' : 'secondary'}
                onClick={() => setContractEndingSoonOnly((v) => !v)}
              >
                ⏰ CDD bientôt
              </Button>
              <Button size="sm" variant={lowLeaveOnly ? 'default' : 'secondary'} onClick={() => setLowLeaveOnly((v) => !v)}>
                🏖️ Congés &lt; 5
              </Button>
              <Button size="sm" variant={lowScoreOnly ? 'default' : 'secondary'} onClick={() => setLowScoreOnly((v) => !v)}>
                📉 Score &lt; 60
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {topRisks.map((e) => {
              const label = riskLabel(e._risk);
              return (
                <div
                  key={e.id}
                  className={cn('px-3 py-2 rounded-lg border cursor-pointer', darkMode ? 'bg-slate-700/30 border-slate-700/40' : 'bg-white/60 border-gray-200')}
                  onClick={() => handleViewProfile(e.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-bold text-white text-xs">
                      {e.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{e.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={label.variant} className="text-[9px]">
                          {label.text} • {e._risk}/100
                        </Badge>
                        {e._contractEndingSoon && (
                          <Badge variant="warning" className="text-[9px]">
                            ⏰ Fin CDD
                          </Badge>
                        )}
                        {e.isSinglePointOfFailure && (
                          <Badge variant="urgent" className="text-[9px]">
                            ⚠️ SPOF
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recherche + filtres + tri */}
      <div className="flex gap-2 flex-wrap items-center">
        <input
          type="text"
          placeholder="🔍 Rechercher (nom, rôle, bureau)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            'flex-1 min-w-[220px] px-4 py-2 rounded-lg text-sm',
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
          )}
        />

        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant={filter === 'all' ? 'default' : 'secondary'} onClick={() => setFilter('all')}>
            Tous
          </Button>
          <Button size="sm" variant={filter === 'active' ? 'default' : 'secondary'} onClick={() => setFilter('active')}>
            Actifs
          </Button>
          <Button size="sm" variant={filter === 'mission' ? 'default' : 'secondary'} onClick={() => setFilter('mission')}>
            Mission
          </Button>
          <Button size="sm" variant={filter === 'absent' ? 'default' : 'secondary'} onClick={() => setFilter('absent')}>
            Absents
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant={contractFilter === 'all' ? 'default' : 'secondary'} onClick={() => setContractFilter('all')}>
            Contrat: Tous
          </Button>
          <Button size="sm" variant={contractFilter === 'CDI' ? 'default' : 'secondary'} onClick={() => setContractFilter('CDI')}>
            CDI
          </Button>
          <Button size="sm" variant={contractFilter === 'CDD' ? 'default' : 'secondary'} onClick={() => setContractFilter('CDD')}>
            CDD
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant={sortMode === 'risk' ? 'default' : 'secondary'} onClick={() => setSortMode('risk')}>
            ⚠️ Tri: Risque
          </Button>
          <Button size="sm" variant={sortMode === 'name' ? 'default' : 'secondary'} onClick={() => setSortMode('name')}>
            🔤 Nom
          </Button>
          <Button size="sm" variant={sortMode === 'salary' ? 'default' : 'secondary'} onClick={() => setSortMode('salary')}>
            💰 Salaire
          </Button>
          <Button size="sm" variant={sortMode === 'bureau' ? 'default' : 'secondary'} onClick={() => setSortMode('bureau')}>
            🏢 Bureau
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Liste des employés */}
        <div className="lg:col-span-2 grid md:grid-cols-2 gap-4">
          {filteredEmployees.map((employee) => {
            const details = employee._details;
            const isSelected = selectedEmployee === employee.id;

            const label = riskLabel(employee._risk);
            const contractEndSoon = employee._contractEndingSoon;

            return (
              <Card
                key={employee.id}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected ? 'ring-2 ring-orange-500' : 'hover:border-orange-500/50',
                  employee.isSinglePointOfFailure && 'border-l-4 border-l-red-500',
                  contractEndSoon && !employee.isSinglePointOfFailure && 'border-l-4 border-l-amber-500'
                )}
                onClick={() => handleViewProfile(employee.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-bold text-white">
                        {employee.initials}
                      </div>
                      <span
                        className={cn(
                          'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2',
                          darkMode ? 'border-slate-800' : 'border-white',
                          employee.status === 'active'
                            ? 'bg-emerald-500'
                            : employee.status === 'mission'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        )}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm truncate">{employee.name}</h3>
                        {employee.delegated && <Badge variant="gold" className="text-[8px]">🔑</Badge>}
                        {employee.isSinglePointOfFailure && <Badge variant="urgent" className="text-[8px]">⚠️ SPOF</Badge>}
                        {contractEndSoon && <Badge variant="warning" className="text-[8px]">⏰ Fin CDD</Badge>}
                        <Badge variant={label.variant} className="text-[8px]">
                          {employee._risk}/100
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-400 truncate">{employee.role}</p>

                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <BureauTag bureau={employee.bureau} />
                        <Badge
                          variant={
                            employee.status === 'active' ? 'success' : employee.status === 'mission' ? 'warning' : 'urgent'
                          }
                        >
                          {employee.status === 'active' ? 'Actif' : employee.status === 'mission' ? 'Mission' : 'Absent'}
                        </Badge>
                        {details?.contractType && (
                          <Badge variant={details.contractType === 'CDI' ? 'info' : 'warning'}>{details.contractType}</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mini infos */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">💰</span>
                      <span className="font-mono text-emerald-400">{employee.salary}</span>
                    </div>

                    {details && (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">🏖️</span>
                        <span className={cn(details.congesRestants < 5 ? 'text-red-400' : 'text-emerald-400')}>
                          {details.congesRestants}j restants
                        </span>
                      </div>
                    )}

                    {typeof details?.scoreEvaluation === 'number' && (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">📊</span>
                        <span
                          className={cn(
                            details.scoreEvaluation >= 80
                              ? 'text-emerald-400'
                              : details.scoreEvaluation >= 60
                              ? 'text-amber-400'
                              : 'text-red-400'
                          )}
                        >
                          {details.scoreEvaluation}/100
                        </span>
                      </div>
                    )}

                    {employee.nextEvaluation && (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">📅</span>
                        <span className="text-blue-400">{employee.nextEvaluation}</span>
                      </div>
                    )}
                  </div>

                  {/* Compétences critiques */}
                  {employee.criticalSkills && employee.criticalSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {employee.criticalSkills.map((skill: string, si: number) => (
                        <span
                          key={si}
                          className="px-2 py-0.5 rounded text-[9px] bg-red-500/20 text-red-400 border border-red-500/30"
                        >
                          🔒 {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {filteredEmployees.length === 0 && (
            <Card className="md:col-span-2">
              <CardContent className="p-8 text-center">
                <p className="text-slate-400">Aucun employé trouvé avec ces filtres.</p>
                <Button size="sm" variant="outline" onClick={resetAll} className="mt-4">
                  Réinitialiser
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panel détail employé */}
        <div className="lg:col-span-1">
          {selectedEmp && selectedDetails ? (
            <Card className="sticky top-4">
              <CardContent className="p-4">
                {/* Header employé */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-700/50">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-xl font-bold text-white">
                    {selectedEmp.initials}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{selectedEmp.name}</h3>
                    <p className="text-sm text-slate-400">{selectedEmp.role}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      <BureauTag bureau={selectedEmp.bureau} />
                      <Badge variant={selectedDetails.contractType === 'CDI' ? 'info' : 'warning'}>
                        {selectedDetails.contractType}
                      </Badge>
                      {selectedEmp.isSinglePointOfFailure && <Badge variant="urgent">⚠️ SPOF</Badge>}
                      {selectedDetails.contractType === 'CDD' && selectedDetails.contractEnd && (daysUntil(selectedDetails.contractEnd) ?? 999) <= 60 && (
                        <Badge variant="warning">⏰ Fin: {selectedDetails.contractEnd}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-4 flex-wrap">
                  {[
                    { id: 'info', label: '📋 Infos' },
                    { id: 'delegations', label: `🔑 Délégations (${selectedDelegations.length})` },
                    { id: 'evaluations', label: `📊 Évaluations (${selectedEvaluations.length})` },
                  ].map((tab) => (
                    <Button
                      key={tab.id}
                      size="xs"
                      variant={activeTab === tab.id ? 'default' : 'secondary'}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>

                {/* Contenu tabs */}
                {activeTab === 'info' && (
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                        <p className="text-[10px] text-slate-400">Congés restants</p>
                        <p className={cn('font-bold', selectedDetails.congesRestants < 5 ? 'text-red-400' : 'text-emerald-400')}>
                          {selectedDetails.congesRestants} jours
                        </p>
                      </div>
                      <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                        <p className="text-[10px] text-slate-400">Congés pris</p>
                        <p className="font-bold">{selectedDetails.congesPris} jours</p>
                      </div>
                      <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                        <p className="text-[10px] text-slate-400">Retards (mois)</p>
                        <p className={cn('font-bold', selectedDetails.retards > 0 ? 'text-amber-400' : 'text-emerald-400')}>
                          {selectedDetails.retards}
                        </p>
                      </div>
                      <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                        <p className="text-[10px] text-slate-400">Absences NJ</p>
                        <p
                          className={cn(
                            'font-bold',
                            selectedDetails.absencesNonJustifiees > 0 ? 'text-red-400' : 'text-emerald-400'
                          )}
                        >
                          {selectedDetails.absencesNonJustifiees}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-400">📧 Email</span>
                        <span className="text-xs truncate">{selectedEmp.email}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-400">📱 Téléphone</span>
                        <span>{selectedEmp.phone}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-400">💰 Salaire</span>
                        <span className="font-mono text-emerald-400">{selectedEmp.salary} FCFA</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-400">📅 Embauche</span>
                        <span>{selectedDetails.contractStart}</span>
                      </div>
                      {selectedDetails.contractEnd && (
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-400">⏰ Fin contrat</span>
                          <span className="text-amber-400">{selectedDetails.contractEnd}</span>
                        </div>
                      )}
                    </div>

                    {/* Formations */}
                    {selectedDetails.formations && selectedDetails.formations.length > 0 && (
                      <div>
                        <h4 className="font-bold text-xs mb-2">🎓 Formations</h4>
                        <div className="space-y-1">
                          {selectedDetails.formations.map((f: any) => (
                            <div
                              key={f.id}
                              className={cn('p-2 rounded text-xs', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}
                            >
                              <div className="flex justify-between gap-2">
                                <span className="font-medium">{f.title}</span>
                                <Badge
                                  variant={f.status === 'completed' ? 'success' : f.status === 'in_progress' ? 'warning' : 'info'}
                                >
                                  {f.status === 'completed' ? '✓' : f.status === 'in_progress' ? '⏳' : '📅'}
                                </Badge>
                              </div>
                              <p className="text-slate-400">
                                {f.date} - {f.duration}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sanctions */}
                    {selectedDetails.sanctions && selectedDetails.sanctions.length > 0 && (
                      <div>
                        <h4 className="font-bold text-xs mb-2 text-red-400">⚠️ Sanctions</h4>
                        <div className="space-y-1">
                          {selectedDetails.sanctions.map((s: any) => (
                            <div key={s.id} className="p-2 rounded text-xs bg-red-500/10 border border-red-500/30">
                              <div className="flex justify-between gap-2">
                                <span className="font-medium text-red-400">{s.type}</span>
                                <span className="text-slate-400">{s.date}</span>
                              </div>
                              <p className="text-slate-300">{s.motif}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'delegations' && (
                  <div className="space-y-2">
                    {selectedDelegations.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-4">Aucune délégation active</p>
                    ) : (
                      selectedDelegations.map((d: any) => (
                        <div key={d.id} className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className="font-bold text-sm">{d.type}</p>
                              <p className="text-xs text-slate-400">{d.scope}</p>
                            </div>
                            <Badge variant={d.status === 'active' ? 'success' : 'default'}>{d.status}</Badge>
                          </div>
                          <div className="flex justify-between mt-2 text-xs gap-2">
                            <span className="text-slate-400">
                              {d.start} → {d.end}
                            </span>
                            <span className="text-orange-400">{d.usageCount} utilisations</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'evaluations' && (
                  <div className="space-y-2">
                    {selectedEvaluations.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-4">Aucune évaluation enregistrée</p>
                    ) : (
                      selectedEvaluations.map((ev: any) => (
                        <div key={ev.id} className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className="font-bold text-sm">{ev.period}</p>
                              <p className="text-xs text-slate-400">{ev.date}</p>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant={
                                  ev.status === 'completed'
                                    ? ev.scoreGlobal >= 80
                                      ? 'success'
                                      : ev.scoreGlobal >= 60
                                      ? 'warning'
                                      : 'urgent'
                                    : 'info'
                                }
                              >
                                {ev.status === 'completed' ? `${ev.scoreGlobal}/100` : 'Planifiée'}
                              </Badge>
                            </div>
                          </div>

                          {ev.status === 'completed' && ev.recommendations?.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-600/50">
                              <p className="text-[10px] text-slate-400 mb-1">Recommandations:</p>
                              <div className="flex flex-wrap gap-1">
                                {ev.recommendations.map((r: any) => (
                                  <Badge
                                    key={r.id}
                                    variant={r.status === 'implemented' ? 'success' : r.status === 'approved' ? 'info' : 'default'}
                                    className="text-[9px]"
                                  >
                                    {r.type}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700/50">
                  <Button size="sm" variant="info" className="flex-1" onClick={handleEditEmployee}>
                    ✏️ Modifier
                  </Button>
                  <Button size="sm" variant="warning" className="flex-1" onClick={handleEvaluateEmployee}>
                    📊 Évaluer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="p-8 text-center">
                <span className="text-4xl mb-4 block">👤</span>
                <p className="text-slate-400">Sélectionnez un employé pour voir ses détails</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
