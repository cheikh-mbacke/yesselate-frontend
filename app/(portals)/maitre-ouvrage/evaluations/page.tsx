'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { evaluations, employees } from '@/lib/data';
import type { EvaluationStatus } from '@/lib/types/bmo.types';

import { usePageNavigation } from '@/hooks/usePageNavigation';
import { useAutoSyncCounts } from '@/hooks/useAutoSync';

type StatusFilter = 'all' | EvaluationStatus;
type SortMode = 'date_desc' | 'date_asc' | 'score_desc' | 'score_asc' | 'pending_desc' | 'name_asc';
type ScoreBucket = 'all' | 'excellent' | 'bon' | 'moyen' | 'faible';

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

const daysUntil = (dateStr?: string) => {
  const ms = parseFRDateToMs(dateStr);
  if (!ms) return null;
  const now = Date.now();
  return Math.ceil((ms - now) / (1000 * 60 * 60 * 24));
};

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 75) return 'text-blue-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-red-400';
};

const getScoreBg = (score: number) => {
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 75) return 'bg-blue-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
};

export default function EvaluationsPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();

  const [filter, setFilter] = useState<StatusFilter>('all');
  const [selectedEvaluation, setSelectedEvaluation] = useState<string | null>(null);

  // "même travail" : recherche + filtres + tri + toggles préventifs + persistance
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('date_desc');
  const [bureauFilter, setBureauFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [scoreBucket, setScoreBucket] = useState<ScoreBucket>('all');

  const [pendingRecsOnly, setPendingRecsOnly] = useState(false);
  const [dueSoonOnly, setDueSoonOnly] = useState(false);
  const [overdueOnly, setOverdueOnly] = useState(false);

  const { updateFilters, getFilters } = usePageNavigation('evaluations');

  useEffect(() => {
    try {
      const saved = getFilters?.();
      if (!saved) return;

      if (saved.filter) setFilter(saved.filter);
      if (typeof saved.selectedEvaluation === 'string') setSelectedEvaluation(saved.selectedEvaluation);
      if (typeof saved.searchQuery === 'string') setSearchQuery(saved.searchQuery);
      if (saved.sortMode) setSortMode(saved.sortMode);
      if (typeof saved.bureauFilter === 'string') setBureauFilter(saved.bureauFilter);
      if (typeof saved.periodFilter === 'string') setPeriodFilter(saved.periodFilter);
      if (saved.scoreBucket) setScoreBucket(saved.scoreBucket);

      if (typeof saved.pendingRecsOnly === 'boolean') setPendingRecsOnly(saved.pendingRecsOnly);
      if (typeof saved.dueSoonOnly === 'boolean') setDueSoonOnly(saved.dueSoonOnly);
      if (typeof saved.overdueOnly === 'boolean') setOverdueOnly(saved.overdueOnly);
    } catch {
      // silent
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      updateFilters?.({
        filter,
        selectedEvaluation,
        searchQuery,
        sortMode,
        bureauFilter,
        periodFilter,
        scoreBucket,
        pendingRecsOnly,
        dueSoonOnly,
        overdueOnly,
      });
    } catch {
      // silent
    }
  }, [
    filter,
    selectedEvaluation,
    searchQuery,
    sortMode,
    bureauFilter,
    periodFilter,
    scoreBucket,
    pendingRecsOnly,
    dueSoonOnly,
    overdueOnly,
    updateFilters,
  ]);

  const statusConfig: Record<
    EvaluationStatus,
    { label: string; variant: 'success' | 'warning' | 'info' | 'default' }
  > = {
    completed: { label: 'Complétée', variant: 'success' },
    in_progress: { label: 'En cours', variant: 'warning' },
    scheduled: { label: 'Planifiée', variant: 'info' },
    cancelled: { label: 'Annulée', variant: 'default' },
  };

  const recommendationTypes: Record<string, { icon: string; color: string }> = {
    formation: { icon: '🎓', color: 'text-blue-400' },
    promotion: { icon: '📈', color: 'text-emerald-400' },
    augmentation: { icon: '💰', color: 'text-amber-400' },
    recadrage: { icon: '⚠️', color: 'text-red-400' },
    mutation: { icon: '🔄', color: 'text-purple-400' },
    autre: { icon: '📋', color: 'text-slate-400' },
  };

  const bureauxList = useMemo(() => {
    const set = new Set<string>();
    evaluations.forEach((e: any) => e.bureau && set.add(e.bureau));
    return ['all', ...Array.from(set).sort((a, b) => normalize(a).localeCompare(normalize(b)))];
  }, []);

  const periodsList = useMemo(() => {
    const set = new Set<string>();
    evaluations.forEach((e: any) => e.period && set.add(e.period));
    return ['all', ...Array.from(set).sort((a, b) => normalize(a).localeCompare(normalize(b)))];
  }, []);

  // Stats + signaux préventifs
  const stats = useMemo(() => {
    const completed = evaluations.filter((e: any) => e.status === 'completed');
    const scheduled = evaluations.filter((e: any) => e.status === 'scheduled');
    const inProgress = evaluations.filter((e: any) => e.status === 'in_progress');
    const cancelled = evaluations.filter((e: any) => e.status === 'cancelled');

    const avgScore =
      completed.length > 0
        ? Math.round(completed.reduce((acc: number, e: any) => acc + (e.scoreGlobal || 0), 0) / completed.length)
        : 0;

    const excellent = completed.filter((e: any) => (e.scoreGlobal || 0) >= 90).length;
    const bon = completed.filter((e: any) => (e.scoreGlobal || 0) >= 75 && (e.scoreGlobal || 0) < 90).length;
    const ameliorer = completed.filter((e: any) => (e.scoreGlobal || 0) < 75).length;

    const pendingRecsTotal = completed.reduce((acc: number, e: any) => {
      const pending = (e.recommendations || []).filter((r: any) => r.status === 'pending').length;
      return acc + pending;
    }, 0);

    const now = Date.now();
    const overdueScheduled = scheduled.filter((e: any) => {
      const ms = parseFRDateToMs(e.date);
      return ms > 0 && ms < now;
    }).length;

    const dueSoon = scheduled.filter((e: any) => {
      const d = daysUntil(e.date);
      return typeof d === 'number' && d >= 0 && d <= 14;
    }).length;

    // Prochaines évaluations (scheduled + in_progress)
    const prochaines = [...scheduled, ...inProgress]
      .slice()
      .sort((a: any, b: any) => parseFRDateToMs(a.date) - parseFRDateToMs(b.date))
      .slice(0, 3);

    return {
      total: evaluations.length,
      completed: completed.length,
      scheduled: scheduled.length,
      inProgress: inProgress.length,
      cancelled: cancelled.length,
      avgScore,
      excellent,
      bon,
      ameliorer,
      prochaines,
      pendingRecsTotal,
      overdueScheduled,
      dueSoon,
    };
  }, []);

  // Sidebar badge auto-sync : "alertes RH"
  useAutoSyncCounts(
    'evaluations',
    () => stats.pendingRecsTotal + stats.overdueScheduled + stats.dueSoon,
    { interval: 12000, immediate: true }
  );

  const filteredEvaluations = useMemo(() => {
    const q = normalize(searchQuery);

    const list = evaluations
      .filter((e: any) => {
        const matchesStatus = filter === 'all' || e.status === filter;
        const matchesBureau = bureauFilter === 'all' || e.bureau === bureauFilter;
        const matchesPeriod = periodFilter === 'all' || e.period === periodFilter;

        const score = Number(e.scoreGlobal || 0);
        const matchesScore =
          scoreBucket === 'all' ||
          (scoreBucket === 'excellent' && score >= 90) ||
          (scoreBucket === 'bon' && score >= 75 && score < 90) ||
          (scoreBucket === 'moyen' && score >= 60 && score < 75) ||
          (scoreBucket === 'faible' && score < 60);

        const pendingRecs = (e.recommendations || []).filter((r: any) => r.status === 'pending').length;
        const isDueSoon = e.status === 'scheduled' && (() => {
          const d = daysUntil(e.date);
          return typeof d === 'number' && d >= 0 && d <= 14;
        })();

        const isOverdue = e.status === 'scheduled' && (() => {
          const ms = parseFRDateToMs(e.date);
          return ms > 0 && ms < Date.now();
        })();

        const matchesToggles =
          (!pendingRecsOnly || pendingRecs > 0) &&
          (!dueSoonOnly || isDueSoon) &&
          (!overdueOnly || isOverdue);

        const matchesSearch =
          !q ||
          normalize(e.employeeName || '').includes(q) ||
          normalize(e.employeeRole || '').includes(q) ||
          normalize(e.evaluatorName || '').includes(q) ||
          normalize(e.period || '').includes(q) ||
          normalize(e.bureau || '').includes(q) ||
          normalize(e.id || '').includes(q);

        return matchesStatus && matchesBureau && matchesPeriod && matchesScore && matchesToggles && matchesSearch;
      })
      .slice();

    list.sort((a: any, b: any) => {
      if (sortMode === 'name_asc') return normalize(a.employeeName || '').localeCompare(normalize(b.employeeName || ''));
      if (sortMode === 'pending_desc') {
        const pa = (a.recommendations || []).filter((r: any) => r.status === 'pending').length;
        const pb = (b.recommendations || []).filter((r: any) => r.status === 'pending').length;
        return pb - pa;
      }
      if (sortMode === 'score_desc') return (b.scoreGlobal || 0) - (a.scoreGlobal || 0);
      if (sortMode === 'score_asc') return (a.scoreGlobal || 0) - (b.scoreGlobal || 0);
      if (sortMode === 'date_asc') return parseFRDateToMs(a.date) - parseFRDateToMs(b.date);
      // date_desc
      return parseFRDateToMs(b.date) - parseFRDateToMs(a.date);
    });

    return list;
  }, [filter, bureauFilter, periodFilter, scoreBucket, pendingRecsOnly, dueSoonOnly, overdueOnly, searchQuery, sortMode]);

  const selectedEval = useMemo(() => {
    return selectedEvaluation ? evaluations.find((e: any) => e.id === selectedEvaluation) : null;
  }, [selectedEvaluation]);

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedEvaluation(id);
      const ev: any = evaluations.find((x: any) => x.id === id);

      addActionLog({
        userId: 'USR-001',
        userName: 'A. DIALLO',
        userRole: 'Directeur Général',
        module: 'evaluations',
        action: 'view',
        targetId: id,
        targetType: 'Evaluation',
        details: `Consultation évaluation ${id} (${ev?.employeeName || '—'})`,
      });
    },
    [addActionLog]
  );

  const handleValidateRecommendation = useCallback(
    (evalId: string, recId: string) => {
      addActionLog({
        userId: 'USR-001',
        userName: 'A. DIALLO',
        userRole: 'Directeur Général',
        module: 'evaluations',
        action: 'validate_recommendation',
        targetId: evalId,
        targetType: 'Evaluation',
        details: `Recommandation ${recId} validée`,
      });
      addToast('Recommandation validée', 'success');
    },
    [addActionLog, addToast]
  );

  const handleProgrammerFormation = useCallback(
    (evalId: string) => {
      addActionLog({
        userId: 'USR-001',
        userName: 'A. DIALLO',
        userRole: 'Directeur Général',
        module: 'evaluations',
        action: 'schedule_formation',
        targetId: evalId,
        targetType: 'Evaluation',
        details: 'Formation programmée',
      });
      addToast('Formation programmée', 'success');
    },
    [addActionLog, addToast]
  );

  const handleExport = useCallback(() => {
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'evaluations',
      action: 'export',
      targetId: 'ALL',
      targetType: 'Evaluation',
      details: `Export évaluations (${evaluations.length})`,
    });
    addToast('Export évaluations généré', 'success');
  }, [addActionLog, addToast]);

  const handleDownloadCR = useCallback(
    (evalId: string) => {
      addActionLog({
        userId: 'USR-001',
        userName: 'A. DIALLO',
        userRole: 'Directeur Général',
        module: 'evaluations',
        action: 'download_cr',
        targetId: evalId,
        targetType: 'Evaluation',
        details: 'Téléchargement CR (placeholder)',
      });
      addToast('CR généré (à connecter)', 'info');
    },
    [addActionLog, addToast]
  );

  const resetAll = () => {
    setFilter('all');
    setSearchQuery('');
    setSortMode('date_desc');
    setBureauFilter('all');
    setPeriodFilter('all');
    setScoreBucket('all');
    setPendingRecsOnly(false);
    setDueSoonOnly(false);
    setOverdueOnly(false);
    addToast('Filtres réinitialisés', 'info');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            📊 Évaluations
            <Badge variant="info">{stats.total}</Badge>
            {(stats.pendingRecsTotal + stats.overdueScheduled) > 0 && (
              <Badge variant="warning">⚠️ {stats.pendingRecsTotal + stats.overdueScheduled} actions</Badge>
            )}
          </h1>
          <p className="text-sm text-slate-400">Suivi des performances et recommandations RH</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={resetAll}>Réinitialiser</Button>
          <Button variant="secondary" onClick={handleExport}>📥 Export</Button>
          <Button onClick={() => addToast('Nouvelle évaluation planifiée', 'success')}>+ Planifier évaluation</Button>
        </div>
      </div>

      {/* Alertes préventives */}
      {(stats.overdueScheduled > 0 || stats.pendingRecsTotal > 0 || stats.dueSoon > 0) && (
        <Card className="border-amber-500/40 bg-amber-500/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🧭</span>
              <div className="flex-1">
                <h3 className="font-bold text-amber-400">Pilotage RH (priorités)</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {stats.overdueScheduled > 0 && (
                    <Badge variant="urgent">⏰ {stats.overdueScheduled} planifiée(s) en retard</Badge>
                  )}
                  {stats.dueSoon > 0 && <Badge variant="warning">📅 {stats.dueSoon} à venir (≤14j)</Badge>}
                  {stats.pendingRecsTotal > 0 && (
                    <Badge variant="warning">⏳ {stats.pendingRecsTotal} recommandation(s) en attente</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant={overdueOnly ? 'default' : 'secondary'} onClick={() => setOverdueOnly(v => !v)}>
                  ⏰ Retard
                </Button>
                <Button size="sm" variant={pendingRecsOnly ? 'default' : 'secondary'} onClick={() => setPendingRecsOnly(v => !v)}>
                  ⏳ Recos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résumé */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <p className={cn('text-3xl font-bold', getScoreColor(stats.avgScore))}>{stats.avgScore}</p>
            <p className="text-[10px] text-slate-400">Score moyen</p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.excellent}</p>
            <p className="text-[10px] text-slate-400">Excellents (≥90)</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.bon}</p>
            <p className="text-[10px] text-slate-400">Bons (75-89)</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.ameliorer}</p>
            <p className="text-[10px] text-slate-400">À améliorer (&lt;75)</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.scheduled}</p>
            <p className="text-[10px] text-slate-400">Planifiées</p>
          </CardContent>
        </Card>

        <Card className={cn('border-amber-500/30', stats.pendingRecsTotal > 0 ? 'bg-amber-500/15' : 'bg-slate-500/10')}>
          <CardContent className="p-3 text-center">
            <p className={cn('text-2xl font-bold', stats.pendingRecsTotal > 0 ? 'text-amber-400' : 'text-slate-400')}>
              {stats.pendingRecsTotal}
            </p>
            <p className="text-[10px] text-slate-400">Recos en attente</p>
          </CardContent>
        </Card>
      </div>

      {/* Prochaines évaluations */}
      {stats.prochaines.length > 0 && (
        <Card className="border-purple-500/50 bg-purple-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="font-bold text-sm text-purple-400">📅 Prochaines évaluations</h3>
              <Button size="sm" variant={dueSoonOnly ? 'default' : 'secondary'} onClick={() => setDueSoonOnly(v => !v)}>
                ≤ 14 jours
              </Button>
            </div>

            <div className="grid sm:grid-cols-3 gap-2">
              {stats.prochaines.map((ev: any) => {
                const d = daysUntil(ev.date);
                const isOverdue = ev.status === 'scheduled' && (parseFRDateToMs(ev.date) || 0) < Date.now();
                return (
                  <div
                    key={ev.id}
                    className={cn(
                      'p-2 rounded cursor-pointer transition-colors',
                      darkMode ? 'bg-slate-700/30 hover:bg-purple-500/20' : 'bg-white/50 hover:bg-purple-500/10',
                      isOverdue && 'border border-red-500/40'
                    )}
                    onClick={() => handleSelect(ev.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-purple-500/30 flex items-center justify-center text-xs font-bold">
                        {(ev.employeeName || '?')
                          .split(' ')
                          .filter(Boolean)
                          .map((n: string) => n[0])
                          .join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{ev.employeeName}</p>
                        <p className="text-xs text-slate-400">
                          {ev.date}
                          {typeof d === 'number' && d >= 0 && d <= 14 && ` • dans ${d}j`}
                          {isOverdue && ' • en retard'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recherche + filtres */}
      <div className="flex gap-2 flex-wrap items-center">
        <input
          type="text"
          placeholder="🔍 Rechercher (agent, évaluateur, période, bureau, ID)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            'flex-1 min-w-[240px] px-4 py-2 rounded-lg text-sm',
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
          )}
        />

        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'all', label: 'Toutes' },
            { id: 'completed', label: '✅ Complétées' },
            { id: 'scheduled', label: '📅 Planifiées' },
            { id: 'in_progress', label: '⏳ En cours' },
          ].map((f) => (
            <Button
              key={f.id}
              size="sm"
              variant={filter === f.id ? 'default' : 'secondary'}
              onClick={() => setFilter(f.id as StatusFilter)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant={scoreBucket === 'all' ? 'default' : 'secondary'} onClick={() => setScoreBucket('all')}>
            Score: Tous
          </Button>
          <Button size="sm" variant={scoreBucket === 'excellent' ? 'default' : 'secondary'} onClick={() => setScoreBucket('excellent')}>
            ≥90
          </Button>
          <Button size="sm" variant={scoreBucket === 'bon' ? 'default' : 'secondary'} onClick={() => setScoreBucket('bon')}>
            75–89
          </Button>
          <Button size="sm" variant={scoreBucket === 'moyen' ? 'default' : 'secondary'} onClick={() => setScoreBucket('moyen')}>
            60–74
          </Button>
          <Button size="sm" variant={scoreBucket === 'faible' ? 'default' : 'secondary'} onClick={() => setScoreBucket('faible')}>
            &lt;60
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant={sortMode === 'date_desc' ? 'default' : 'secondary'} onClick={() => setSortMode('date_desc')}>
            🗓️ Date ↓
          </Button>
          <Button size="sm" variant={sortMode === 'score_desc' ? 'default' : 'secondary'} onClick={() => setSortMode('score_desc')}>
            📈 Score ↓
          </Button>
          <Button size="sm" variant={sortMode === 'pending_desc' ? 'default' : 'secondary'} onClick={() => setSortMode('pending_desc')}>
            ⏳ Recos ↓
          </Button>
          <Button size="sm" variant={sortMode === 'name_asc' ? 'default' : 'secondary'} onClick={() => setSortMode('name_asc')}>
            🔤 Nom ↑
          </Button>
        </div>
      </div>

      {/* Filtres secondaires (bureau / période) */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="flex gap-2 flex-wrap">
          {bureauxList.slice(0, 8).map((b) => (
            <Button
              key={b}
              size="sm"
              variant={bureauFilter === b ? 'default' : 'secondary'}
              onClick={() => setBureauFilter(b)}
            >
              {b === 'all' ? '🏢 Tous bureaux' : b}
            </Button>
          ))}
          {bureauxList.length > 8 && (
            <Button size="sm" variant="secondary" onClick={() => addToast('Liste bureaux (à étendre)', 'info')}>
              + Bureaux
            </Button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {periodsList.slice(0, 5).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={periodFilter === p ? 'default' : 'secondary'}
              onClick={() => setPeriodFilter(p)}
            >
              {p === 'all' ? '🗂️ Toutes périodes' : p}
            </Button>
          ))}
          {periodsList.length > 5 && (
            <Button size="sm" variant="secondary" onClick={() => addToast('Liste périodes (à étendre)', 'info')}>
              + Périodes
            </Button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant={pendingRecsOnly ? 'default' : 'secondary'} onClick={() => setPendingRecsOnly(v => !v)}>
            ⏳ Recos en attente
          </Button>
          <Button size="sm" variant={dueSoonOnly ? 'default' : 'secondary'} onClick={() => setDueSoonOnly(v => !v)}>
            📅 ≤ 14j
          </Button>
          <Button size="sm" variant={overdueOnly ? 'default' : 'secondary'} onClick={() => setOverdueOnly(v => !v)}>
            ⏰ Retard
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Liste des évaluations */}
        <div className="lg:col-span-2 space-y-3">
          {filteredEvaluations.map((evaluation: any) => {
            const isSelected = selectedEvaluation === evaluation.id;
            const pendingRecs = (evaluation.recommendations || []).filter((r: any) => r.status === 'pending').length;

            const isOverdue = evaluation.status === 'scheduled' && (parseFRDateToMs(evaluation.date) || 0) < Date.now();
            const d = daysUntil(evaluation.date);
            const dueSoon = evaluation.status === 'scheduled' && typeof d === 'number' && d >= 0 && d <= 14;

            return (
              <Card
                key={evaluation.id}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected ? 'ring-2 ring-orange-500' : 'hover:border-orange-500/50',
                  evaluation.status === 'completed' && (evaluation.scoreGlobal || 0) < 60 && 'border-l-4 border-l-red-500',
                  isOverdue && 'border-l-4 border-l-red-500',
                  dueSoon && !isOverdue && 'border-l-4 border-l-amber-500'
                )}
                onClick={() => handleSelect(evaluation.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white">
                          {(evaluation.employeeName || '?')
                            .split(' ')
                            .filter(Boolean)
                            .map((n: string) => n[0])
                            .join('')}
                        </div>

                        {evaluation.status === 'completed' && (
                          <div
                            className={cn(
                              'absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white',
                              getScoreBg(evaluation.scoreGlobal || 0)
                            )}
                          >
                            {evaluation.scoreGlobal}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono text-[10px] text-orange-400">{evaluation.id}</span>
                          <Badge variant={statusConfig[evaluation.status as EvaluationStatus]?.variant || 'default'}>
                            {statusConfig[evaluation.status as EvaluationStatus]?.label || evaluation.status}
                          </Badge>
                          <Badge variant="default">{evaluation.period}</Badge>
                          {pendingRecs > 0 && <Badge variant="warning">⏳ {pendingRecs} reco</Badge>}
                          {isOverdue && <Badge variant="urgent">⏰ en retard</Badge>}
                          {dueSoon && !isOverdue && <Badge variant="warning">📅 ≤14j</Badge>}
                        </div>

                        <h3 className="font-bold">{evaluation.employeeName}</h3>
                        <p className="text-xs text-slate-400">{evaluation.employeeRole}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <BureauTag bureau={evaluation.bureau} />
                          {evaluation.status === 'completed' && (
                            <span className={cn('text-xs font-bold', getScoreColor(evaluation.scoreGlobal || 0))}>
                              {evaluation.scoreGlobal}/100
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-400">{evaluation.date}</p>
                      <p className="text-xs text-slate-500">Par {evaluation.evaluatorName}</p>
                    </div>
                  </div>

                  {/* Score et synthèse (si complétée) */}
                  {evaluation.status === 'completed' && (
                    <>
                      <div className="mb-3">
                        <div className="flex items-center gap-4">
                          <div className={cn('text-3xl font-bold', getScoreColor(evaluation.scoreGlobal || 0))}>
                            {evaluation.scoreGlobal}/100
                          </div>
                          <div className="flex-1">
                            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={cn('h-full transition-all', getScoreBg(evaluation.scoreGlobal || 0))}
                                style={{ width: `${evaluation.scoreGlobal || 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className={cn('p-2 rounded text-xs', darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50')}>
                          <p className="text-emerald-400 font-medium mb-1">✅ Points forts</p>
                          <ul className="text-slate-400 space-y-0.5">
                            {(evaluation.strengths || []).slice(0, 2).map((s: string, i: number) => (
                              <li key={i}>• {s}</li>
                            ))}
                          </ul>
                        </div>
                        <div className={cn('p-2 rounded text-xs', darkMode ? 'bg-amber-500/10' : 'bg-amber-50')}>
                          <p className="text-amber-400 font-medium mb-1">📈 À améliorer</p>
                          <ul className="text-slate-400 space-y-0.5">
                            {(evaluation.improvements || []).slice(0, 2).map((it: string, idx: number) => (
                              <li key={idx}>• {it}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {(evaluation.recommendations || []).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {(evaluation.recommendations || []).map((rec: any) => (
                            <Badge
                              key={rec.id}
                              variant={
                                rec.status === 'implemented'
                                  ? 'success'
                                  : rec.status === 'approved'
                                  ? 'info'
                                  : rec.status === 'rejected'
                                  ? 'default'
                                  : 'warning'
                              }
                            >
                              {recommendationTypes[rec.type]?.icon} {rec.type}
                              {rec.status === 'pending' && ' ⏳'}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50 flex-wrap">
                    {evaluation.status === 'completed' && pendingRecs > 0 && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={(e) => {
                          e.stopPropagation();
                          const firstPending = (evaluation.recommendations || []).find((r: any) => r.status === 'pending');
                          handleValidateRecommendation(evaluation.id, firstPending?.id || '');
                        }}
                      >
                        ✅ Valider reco ({pendingRecs})
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="info"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProgrammerFormation(evaluation.id);
                      }}
                    >
                      🎓 Formation
                    </Button>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadCR(evaluation.id);
                      }}
                    >
                      📄 CR
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredEvaluations.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-slate-400">Aucune évaluation trouvée avec ces filtres.</p>
                <Button size="sm" variant="outline" onClick={resetAll} className="mt-4">
                  Réinitialiser
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panel détail évaluation */}
        <div className="lg:col-span-1">
          {selectedEval ? (
            <Card className="sticky top-4">
              <CardContent className="p-4">
                {/* Header */}
                <div className="mb-4 pb-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white">
                      {(selectedEval.employeeName || '?')
                        .split(' ')
                        .filter(Boolean)
                        .map((n: string) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <h3 className="font-bold">{selectedEval.employeeName}</h3>
                      <p className="text-xs text-slate-400">{selectedEval.employeeRole}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Badge variant={statusConfig[selectedEval.status as EvaluationStatus]?.variant || 'default'}>
                      {statusConfig[selectedEval.status as EvaluationStatus]?.label || selectedEval.status}
                    </Badge>
                    <Badge variant="default">{selectedEval.period}</Badge>
                    <BureauTag bureau={selectedEval.bureau} />
                    {selectedEval.status === 'scheduled' && (() => {
                      const d = daysUntil(selectedEval.date);
                      const overdue = (parseFRDateToMs(selectedEval.date) || 0) < Date.now();
                      if (overdue) return <Badge variant="urgent">⏰ en retard</Badge>;
                      if (typeof d === 'number' && d >= 0 && d <= 14) return <Badge variant="warning">📅 dans {d}j</Badge>;
                      return null;
                    })()}
                  </div>

                  <p className="text-xs text-slate-500 mt-2">
                    Date: <span className="text-slate-300">{selectedEval.date}</span> • Évaluateur: <span className="text-slate-300">{selectedEval.evaluatorName}</span>
                  </p>
                </div>

                {/* Score global */}
                {selectedEval.status === 'completed' && (
                  <div className="mb-4 p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-center">
                    <p className={cn('text-4xl font-bold', getScoreColor(selectedEval.scoreGlobal || 0))}>
                      {selectedEval.scoreGlobal}/100
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Score global</p>
                  </div>
                )}

                {/* Critères détaillés */}
                {selectedEval.status === 'completed' && (selectedEval.criteria || []).length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-bold text-sm mb-2">📊 Critères</h4>
                    <div className="space-y-2">
                      {(selectedEval.criteria || []).map((crit: any) => (
                        <div key={crit.id} className={cn('p-2 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">{crit.name}</span>
                            <span className="font-bold">{crit.score}/5</span>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <div
                                key={n}
                                className={cn('h-1.5 flex-1 rounded', n <= crit.score ? getScoreBg((crit.score || 0) * 20) : 'bg-slate-600')}
                              />
                            ))}
                          </div>
                          {crit.comment && <p className="text-[10px] text-slate-400 mt-1">{crit.comment}</p>}
                          <p className="text-[10px] text-slate-500">Poids: {crit.weight}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommandations détaillées */}
                {(selectedEval.recommendations || []).length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-bold text-sm mb-2">📋 Recommandations</h4>
                    <div className="space-y-2">
                      {(selectedEval.recommendations || []).map((rec: any) => (
                        <div
                          key={rec.id}
                          className={cn(
                            'p-2 rounded border',
                            rec.status === 'pending'
                              ? 'border-amber-500/50 bg-amber-500/10'
                              : rec.status === 'approved'
                              ? 'border-blue-500/50 bg-blue-500/10'
                              : rec.status === 'implemented'
                              ? 'border-emerald-500/50 bg-emerald-500/10'
                              : 'border-slate-500/50 bg-slate-500/10'
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-lg">{recommendationTypes[rec.type]?.icon || '📌'}</span>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{rec.title}</p>
                              <p className="text-xs text-slate-400">{rec.description}</p>
                              <div className="flex gap-2 flex-wrap mt-1">
                                <Badge
                                  variant={
                                    rec.status === 'implemented'
                                      ? 'success'
                                      : rec.status === 'approved'
                                      ? 'info'
                                      : rec.status === 'rejected'
                                      ? 'default'
                                      : 'warning'
                                  }
                                >
                                  {rec.status}
                                </Badge>

                                {rec.status === 'pending' && (
                                  <Button
                                    size="xs"
                                    variant="success"
                                    onClick={() => handleValidateRecommendation(selectedEval.id, rec.id)}
                                  >
                                    ✅ Valider
                                  </Button>
                                )}
                              </div>

                              {rec.implementedAt && (
                                <p className="text-[10px] text-slate-500 mt-1">Implémenté le {rec.implementedAt}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Commentaire employé */}
                {selectedEval.employeeComment && (
                  <div className="mb-4 p-3 rounded bg-blue-500/10 border border-blue-500/30">
                    <p className="text-xs text-blue-400 font-medium mb-1">💬 Commentaire employé</p>
                    <p className="text-sm italic">"{selectedEval.employeeComment}"</p>
                  </div>
                )}

                {/* Traçabilité */}
                {selectedEval.hash && (
                  <div className="mb-4 p-2 rounded bg-slate-700/30">
                    <p className="text-[10px] text-slate-400">🔐 Traçabilité</p>
                    <p className="font-mono text-[10px] text-slate-500 truncate">{selectedEval.hash}</p>
                  </div>
                )}

                {/* Quick link (optionnel) vers employé si on peut matcher */}
                <div className="mb-4">
                  {(() => {
                    const emp = employees.find((x: any) => normalize(x.name) === normalize(selectedEval.employeeName || ''));
                    if (!emp) return null;
                    return (
                      <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                        <p className="text-[10px] text-slate-400 mb-1">🔗 Employé</p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium truncate">{emp.name}</span>
                          <Badge variant="info" className="text-[10px]">ID: {emp.id}</Badge>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                  <Button size="sm" variant="info" className="flex-1" onClick={() => handleDownloadCR(selectedEval.id)}>
                    📄 Télécharger CR
                  </Button>
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => addToast('Édition (à connecter)', 'info')}>
                    ✏️ Modifier
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="p-8 text-center">
                <span className="text-4xl mb-4 block">📊</span>
                <p className="text-slate-400">Sélectionnez une évaluation pour voir ses détails</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
