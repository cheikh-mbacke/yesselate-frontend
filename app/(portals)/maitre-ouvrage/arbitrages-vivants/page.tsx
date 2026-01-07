'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { arbitragesVivants, coordinationStats, arbitrages, bureauxGovernance } from '@/lib/data';
import { getStatusBadgeConfig } from '@/lib/utils/status-utils';

type MainTab = 'arbitrages' | 'bureaux';
type Filter = 'all' | 'ouverts' | 'tranche' | 'pending' | 'resolved';
type SelectedType = 'vivant' | 'simple' | null;
type ViewTab = 'contexte' | 'options' | 'parties' | 'documents';

type Vivant = (typeof arbitragesVivants)[number] & { _type: 'vivant' };
type Simple = (typeof arbitrages)[number] & { _type: 'simple' };
type AnyArb = Vivant | Simple;

type Bureau = (typeof bureauxGovernance)[number];

const parseFrDate = (d?: string | null) => {
  if (!d) return null;
  // dd/mm/yyyy
  const parts = d.split('/');
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts.map((x) => Number(x));
  if (!dd || !mm || !yyyy) return null;
  const iso = `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isUrgentDeadline = (deadline?: string | null) => {
  const d = parseFrDate(deadline);
  if (!d) return false;
  const in3 = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  return d <= in3;
};

const STATUS_LEFT_BORDER: Record<string, string> = {
  // vivants
  critique: 'border-l-red-500',
  eleve: 'border-l-orange-500',
  modere: 'border-l-amber-500',
  faible: 'border-l-emerald-500',

  // simples (impact)
  critical: 'border-l-red-500',
  high: 'border-l-orange-500',
  medium: 'border-l-amber-500',
  low: 'border-l-emerald-500',

  // fallback
  default: 'border-l-slate-500',
};

const RISK_PANEL: Record<string, string> = {
  critique: 'bg-red-500/10 border border-red-500/30',
  eleve: 'bg-orange-500/10 border border-orange-500/30',
  modere: 'bg-amber-500/10 border border-amber-500/30',
  faible: 'bg-emerald-500/10 border border-emerald-500/30',
  default: 'bg-slate-500/10 border border-slate-500/30',
};

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    conflit_bureaux: '⚔️',
    blocage_projet: '🚫',
    depassement_budget: '💸',
    litige_client: '⚖️',
    urgence_rh: '👥',
    risque_strategique: '🎯',
  };
  return icons[type] || '⚖️';
};

const formatMoney = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';

const safeCopy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
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
      className="text-left p-3 rounded-lg border border-slate-700/30 hover:bg-blue-500/5 transition-colors"
    >
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-[10px] text-slate-400">{hint}</p>
    </button>
  );
}

export default function ArbitragesVivantsPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();

  const router = useRouter();
  const searchParams = useSearchParams();

  const [mainTab, setMainTab] = useState<MainTab>('arbitrages');

  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const search = q.trim().toLowerCase();
  const searchRef = useRef<HTMLInputElement | null>(null);

  const [selectedArbitrageId, setSelectedArbitrageId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<SelectedType>(null);

  const [viewTab, setViewTab] = useState<ViewTab>('contexte');
  const [onlyIssues, setOnlyIssues] = useState(false);

  const [selectedBureau, setSelectedBureau] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [onlyOverloaded, setOnlyOverloaded] = useState(false);

  const [cmdOpen, setCmdOpen] = useState(false);

  // Init depuis URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    const f = searchParams.get('filter') as Filter | null;
    const id = searchParams.get('id');
    const t = searchParams.get('type') as SelectedType | null;
    const query = searchParams.get('q');
    const issues = searchParams.get('issues');
    const bureau = searchParams.get('bureau');

    if (tab === 'bureaux') setMainTab('bureaux');
    if (tab === 'arbitrages') setMainTab('arbitrages');

    if (f && ['all', 'ouverts', 'tranche', 'pending', 'resolved'].includes(f)) setFilter(f);
    if (typeof query === 'string') setQ(query);
    if (issues === '1') setOnlyIssues(true);

    if (id) {
      setSelectedArbitrageId(id);
      setSelectedType(t === 'vivant' || t === 'simple' ? t : null);
    }
    if (bureau) setSelectedBureau(bureau);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync URL (state -> query)
  useEffect(() => {
    const params = new URLSearchParams();

    params.set('tab', mainTab);
    if (mainTab === 'arbitrages') {
      params.set('filter', filter);
      if (q.trim()) params.set('q', q.trim());
      if (onlyIssues) params.set('issues', '1');

      if (selectedArbitrageId) params.set('id', selectedArbitrageId);
      if (selectedType) params.set('type', selectedType);
    }

    if (mainTab === 'bureaux') {
      if (selectedBureau) params.set('bureau', selectedBureau);
      if (q.trim()) params.set('q', q.trim());
      if (onlyOverloaded) params.set('over', '1');
    }

    router.replace(`?${params.toString()}`, { scroll: false } as any);
  }, [mainTab, filter, q, onlyIssues, selectedArbitrageId, selectedType, selectedBureau, onlyOverloaded, router]);

  // Reset viewTab au changement d'arbitrage sélectionné
  useEffect(() => {
    if (selectedArbitrageId) setViewTab('contexte');
  }, [selectedArbitrageId]);

  // Raccourcis clavier
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === 'k') {
        e.preventDefault();
        setCmdOpen(true);
      }
      if (!e.ctrlKey && !e.metaKey && k === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (k === 'escape') setCmdOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Combiner les deux sources (stable)
  const allArbitrages: AnyArb[] = useMemo(() => {
    const vivants = arbitragesVivants.map((a) => ({ ...a, _type: 'vivant' as const }));
    const simples = arbitrages.map((a) => ({ ...a, _type: 'simple' as const }));
    return [...vivants, ...simples];
  }, []);

  const isVivant = (a: AnyArb): a is Vivant => a._type === 'vivant';

  const isArbIssue = (a: AnyArb) => {
    if (isVivant(a)) {
      const open = ['ouvert', 'en_deliberation', 'decision_requise'].includes(a.status);
      const risky = a.context?.riskLevel === 'critique' || a.context?.riskLevel === 'eleve';
      const overdue = Boolean(a.timing?.isOverdue);
      return open && (risky || overdue);
    }
    // simple
    const urgent = a.status === 'pending' && isUrgentDeadline((a as any).deadline);
    const criticalImpact = (a as any).impact === 'critical' || (a as any).impact === 'high';
    return a.status === 'pending' && (urgent || criticalImpact);
  };

  const filteredArbitrages = useMemo(() => {
    let list = [...allArbitrages];

    // filtre "mode"
    list = list.filter((a) => {
      if (filter === 'ouverts') return a._type === 'vivant' && ['ouvert', 'en_deliberation', 'decision_requise'].includes((a as Vivant).status);
      if (filter === 'tranche') return a._type === 'vivant' && (a as Vivant).status === 'tranche';
      if (filter === 'pending') return a._type === 'simple' && (a as Simple).status === 'pending';
      if (filter === 'resolved') return a._type === 'simple' && (a as Simple).status === 'resolved';
      return true;
    });

    if (onlyIssues) list = list.filter((a) => isArbIssue(a));

    if (search) {
      list = list.filter((a) => {
        const hay = isVivant(a)
          ? `${a.id} ${a.subject} ${a.status} ${a.type} ${a.context?.linkedEntity?.type ?? ''} ${a.context?.linkedEntity?.label ?? ''}`.toLowerCase()
          : `${(a as any).id} ${(a as any).subject} ${(a as any).status} ${(a as any).impact ?? ''} ${(a as any).deadline ?? ''} ${(a as any).requestedBy ?? ''} ${Array.isArray((a as any).parties) ? (a as any).parties.join(' ') : ''}`.toLowerCase();
        return hay.includes(search);
      });
    }

    // tri : urgences / critiques d'abord
    return list.sort((a, b) => {
      const aIssue = isArbIssue(a) ? 0 : 1;
      const bIssue = isArbIssue(b) ? 0 : 1;
      if (aIssue !== bIssue) return aIssue - bIssue;

      // vivants : overdue puis jours restants
      if (isVivant(a) && isVivant(b)) {
        const ao = a.timing?.isOverdue ? 0 : 1;
        const bo = b.timing?.isOverdue ? 0 : 1;
        if (ao !== bo) return ao - bo;
        return Number(a.timing?.daysRemaining ?? 999) - Number(b.timing?.daysRemaining ?? 999);
      }

      // simples : deadline plus proche d'abord
      if (!isVivant(a) && !isVivant(b)) {
        const ad = parseFrDate((a as any).deadline)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const bd = parseFrDate((b as any).deadline)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return ad - bd;
      }

      // mixer : vivants ouverts avant simples pending
      return isVivant(a) ? -1 : 1;
    });
  }, [allArbitrages, filter, onlyIssues, search]);

  // Stats combinées
  const stats = useMemo(() => {
    const vivantsStats = coordinationStats.arbitrages;

    const simplesTotal = arbitrages.length;
    const simplesPending = arbitrages.filter((a) => a.status === 'pending').length;
    const simplesResolved = arbitrages.filter((a) => a.status === 'resolved').length;
    const simplesUrgent = arbitrages.filter((a: any) => a.status === 'pending' && isUrgentDeadline(a.deadline)).length;

    return {
      ...vivantsStats,
      simplesTotal,
      simplesPending,
      simplesResolved,
      simplesUrgent,
    };
  }, []);

  const selected: AnyArb | null = useMemo(() => {
    if (!selectedArbitrageId) return null;
    const found = allArbitrages.find((a) => a.id === selectedArbitrageId) ?? null;
    return found;
  }, [selectedArbitrageId, allArbitrages]);

  // Auto-corriger selectedType si besoin
  useEffect(() => {
    if (selected) setSelectedType(selected._type);
  }, [selected]);

  // --- Actions arbitrages ---
  const handleTrancher = (arb: AnyArb | null, optionId?: string) => {
    if (!arb) return;

    const isV = arb._type === 'vivant';
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: isV ? 'arbitrages-vivants' : 'arbitrages',
      action: 'validation',
      targetId: arb.id,
      targetType: isV ? 'ArbitrageVivant' : 'Arbitration',
      details: `Arbitrage tranché: ${(arb as any).subject}${optionId ? ` - Option ${optionId}` : ''}`,
    });

    addToast(
      isV
        ? 'Arbitrage tranché - Décision enregistrée au registre avec hash SHA3-256'
        : 'Arbitrage tranché - Décision enregistrée',
      'success'
    );
  };

  const handlePostpone = (arb: AnyArb | null) => {
    if (!arb) return;

    const isV = arb._type === 'vivant';
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: isV ? 'arbitrages-vivants' : 'arbitrages',
      action: 'modification',
      targetId: arb.id,
      targetType: isV ? 'ArbitrageVivant' : 'Arbitration',
      details: `Report arbitrage: ${(arb as any).subject}`,
    });

    addToast('Report enregistré avec justification obligatoire', 'warning');
  };

  const handleRequestComplement = (arb: AnyArb | null) => {
    if (!arb) return;

    const isV = arb._type === 'vivant';
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: isV ? 'arbitrages-vivants' : 'arbitrages',
      action: 'modification',
      targetId: arb.id,
      targetType: isV ? 'ArbitrageVivant' : 'Arbitration',
      details: `Demande complément: ${(arb as any).subject}`,
    });

    addToast('Demande de complément envoyée aux parties', 'info');
  };

  const handleScheduleHearing = (arb: AnyArb | null) => {
    if (!arb || arb._type !== 'vivant') return;

    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'arbitrages-vivants',
      action: 'creation',
      targetId: arb.id,
      targetType: 'ArbitrageVivant',
      details: `Planification audition: ${arb.subject}`,
    });
    addToast('Planifier une audition/conférence → Création conférence liée', 'info');
  };

  const exportSelectedJson = () => {
    if (!selected) return;

    const payload = {
      exportedAt: new Date().toISOString(),
      type: selected._type,
      data: selected,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arbitrage-${selected.id}.json`;
    a.click();
    URL.revokeObjectURL(url);

    addToast('📤 Export JSON généré', 'success');
  };

  const copySelectedHash = async () => {
    if (!selected) return;

    const hash =
      selected._type === 'vivant'
        ? (selected as Vivant).hash
        : (selected as any).hash ?? (selected as any).decisionHash ?? '';

    if (!hash) return addToast('Aucun hash à copier', 'warning');

    const ok = await safeCopy(hash);
    addToast(ok ? 'Hash copié' : 'Impossible de copier (clipboard)', ok ? 'success' : 'warning');
  };

  // --- Stats bureaux ---
  const bureauxStats = useMemo(() => {
    const totalAgents = bureauxGovernance.reduce((acc, b) => acc + b.agents, 0);
    const avgCharge = Math.round(bureauxGovernance.reduce((acc, b) => acc + b.charge, 0) / bureauxGovernance.length);
    const avgCompletion = Math.round(bureauxGovernance.reduce((acc, b) => acc + b.completion, 0) / bureauxGovernance.length);
    const bureauxSurcharge = bureauxGovernance.filter((b) => b.charge > 85).length;
    const totalGoulots = bureauxGovernance.reduce((acc, b) => acc + b.goulots.length, 0);
    return { totalAgents, avgCharge, avgCompletion, bureauxSurcharge, totalGoulots };
  }, []);

  const selectedB: Bureau | null = useMemo(() => {
    return selectedBureau ? bureauxGovernance.find((b) => b.code === selectedBureau) ?? null : null;
  }, [selectedBureau]);

  const handleAdjustResponsibilities = (bureau: Bureau | null) => {
    if (!bureau) return;
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'bureaux',
      action: 'modification',
      targetId: bureau.code,
      targetType: 'Bureau',
      details: `Ajustement responsabilités ${bureau.name}`,
    });
    addToast('Ajustement des responsabilités initié', 'success');
  };

  const handleReportBottleneck = (bureau: Bureau, goulot: string) => {
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'bureaux',
      action: 'creation',
      targetId: bureau.code,
      targetType: 'Bureau',
      details: `Goulot remonté: ${goulot}`,
    });
    addToast('Goulot remonté au DG', 'warning');
  };

  const filteredBureaux = useMemo(() => {
    let list = [...bureauxGovernance];

    if (onlyOverloaded) list = list.filter((b) => b.charge > 85);

    if (search) {
      list = list.filter((b) => {
        const hay = `${b.code} ${b.name} ${b.head} ${b.modifiedBy} ${(b.goulots || []).join(' ')} ${(b.raciActivities || []).join(' ')}`.toLowerCase();
        return hay.includes(search);
      });
    }

    // tri : surcharge puis goulots puis charge desc
    return list.sort((a, b) => {
      const ao = a.charge > 85 ? 0 : 1;
      const bo = b.charge > 85 ? 0 : 1;
      if (ao !== bo) return ao - bo;

      const ag = (a.goulots?.length ?? 0) > 0 ? 0 : 1;
      const bg = (b.goulots?.length ?? 0) > 0 ? 0 : 1;
      if (ag !== bg) return ag - bg;

      return b.charge - a.charge;
    });
  }, [onlyOverloaded, search]);

  // Helpers class border pour cartes arbitrages (tailwind-safe)
  const leftBorderForArb = (arb: AnyArb) => {
    if (arb._type === 'vivant') {
      const risk = arb.context?.riskLevel || 'default';
      return STATUS_LEFT_BORDER[risk] || STATUS_LEFT_BORDER.default;
    }
    const impact = (arb as any).impact || 'default';
    return STATUS_LEFT_BORDER[impact] || STATUS_LEFT_BORDER.default;
  };

  const isResolved = (arb: AnyArb) =>
    (arb._type === 'vivant' && (arb as Vivant).status === 'tranche') ||
    (arb._type === 'simple' && (arb as Simple).status === 'resolved');

  return (
    <div className="space-y-4">
      {/* Header + actions rapides */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🎯 Gouvernance & Décisions
            {mainTab === 'arbitrages' && <Badge variant="urgent">{stats.ouverts} en cours</Badge>}
            {mainTab === 'bureaux' && <Badge variant="info">{bureauxGovernance.length} bureaux</Badge>}
            {mainTab === 'arbitrages' && (onlyIssues || stats.critiques > 0 || stats.simplesUrgent > 0) && (
              <Badge variant="warning">{(stats.critiques ?? 0) + (stats.simplesUrgent ?? 0)} alertes</Badge>
            )}
          </h1>

          <p className="text-sm text-slate-400">
            {mainTab === 'arbitrages'
              ? 'Cellules de crise immersives • Options IA • Chronomètre décisionnel • Registre + hash'
              : 'Charge • complétion • budget • goulots • traçabilité par bureau'}
            {' • '}
            "/" recherche • "Ctrl/⌘+K" commandes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => setCmdOpen(true)}>
            ⌘K
          </Button>
          {selected && mainTab === 'arbitrages' && (
            <>
              <Button size="sm" variant="ghost" onClick={copySelectedHash}>
                📋 Hash
              </Button>
              <Button size="sm" variant="ghost" onClick={exportSelectedJson}>
                📤 Export
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Recherche (commune) */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={searchRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={mainTab === 'arbitrages' ? 'Rechercher (id, sujet, statut, parties, entité liée)…' : 'Rechercher (code, bureau, responsable, goulots)…'}
          className={cn(
            'flex-1 min-w-[240px] px-3 py-2 rounded text-sm',
            darkMode ? 'bg-slate-800 border border-slate-600' : 'bg-white border border-gray-300'
          )}
        />

        <Button size="sm" variant="ghost" onClick={() => setQ('')}>
          Effacer
        </Button>

        {mainTab === 'arbitrages' ? (
          <Button size="sm" variant={onlyIssues ? 'default' : 'secondary'} onClick={() => setOnlyIssues((v) => !v)}>
            🚨 {onlyIssues ? 'Issues: ON' : 'Issues: OFF'}
          </Button>
        ) : (
          <Button size="sm" variant={onlyOverloaded ? 'default' : 'secondary'} onClick={() => setOnlyOverloaded((v) => !v)}>
            🔥 {onlyOverloaded ? 'Surcharges: ON' : 'Surcharges: OFF'}
          </Button>
        )}
      </div>

      {/* Onglets principaux */}
      <div className="flex gap-2 border-b border-slate-700/50 pb-2">
        <Button
          variant={mainTab === 'arbitrages' ? 'default' : 'ghost'}
          onClick={() => {
            setMainTab('arbitrages');
            setSelectedBureau(null);
            setShowHistory(false);
          }}
        >
          ⚔️ Arbitrages
        </Button>
        <Button
          variant={mainTab === 'bureaux' ? 'default' : 'ghost'}
          onClick={() => {
            setMainTab('bureaux');
            setSelectedArbitrageId(null);
            setSelectedType(null);
          }}
        >
          🏢 Bureaux
        </Button>
      </div>

      {mainTab === 'arbitrages' ? (
        <>
          {/* Principe clé */}
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <div className="flex-1">
                  <h3 className="font-bold text-red-400">Pas une file de tickets — une scène décisionnelle</h3>
                  <p className="text-sm text-slate-400">
                    Contexte complet, parties prenantes RACI, options suggérées par IA, chronomètre. Chaque décision → registre + hash.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alertes critiques */}
          {stats.critiques > 0 && (
            <Card className="border-red-500/50 bg-red-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚨</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-red-400">{stats.critiques} arbitrage(s) critique(s)</h3>
                    <p className="text-sm text-slate-400">
                      Exposition totale: {formatMoney(stats.expositionTotale)}
                      {stats.enRetard > 0 && ` • ${stats.enRetard} en retard`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alerte urgents (simples) */}
          {stats.simplesUrgent > 0 && (
            <Card className="border-red-500/50 bg-red-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⏰</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-red-400">{stats.simplesUrgent} arbitrage(s) urgent(s)</h3>
                    <p className="text-sm text-slate-400">Échéance dans moins de 3 jours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-blue-400">{stats.total + stats.simplesTotal}</p>
                <p className="text-[10px] text-slate-400">Total</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-amber-400">{stats.ouverts + stats.simplesPending}</p>
                <p className="text-[10px] text-slate-400">En cours</p>
              </CardContent>
            </Card>
            <Card className="bg-emerald-500/10 border-emerald-500/30">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-emerald-400">{stats.tranches + stats.simplesResolved}</p>
                <p className="text-[10px] text-slate-400">Tranchés</p>
              </CardContent>
            </Card>
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-red-400">{stats.critiques + stats.simplesUrgent}</p>
                <p className="text-[10px] text-slate-400">Critiques/Urgents</p>
              </CardContent>
            </Card>
            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-purple-400">{formatMoney(stats.expositionTotale)}</p>
                <p className="text-[10px] text-slate-400">Exposition</p>
              </CardContent>
            </Card>
          </div>

          {/* Filtres */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'ouverts', label: '⏳ En cours (Vivants)' },
              { id: 'pending', label: '⏳ En attente (Simples)' },
              { id: 'tranche', label: '✅ Tranchés (Vivants)' },
              { id: 'resolved', label: '✅ Résolus (Simples)' },
            ].map((f) => (
              <Button
                key={f.id}
                size="sm"
                variant={filter === f.id ? 'default' : 'secondary'}
                onClick={() => setFilter(f.id as Filter)}
              >
                {f.label}
              </Button>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            {/* Liste arbitrages */}
            <div className="lg:col-span-2 space-y-3">
              {filteredArbitrages.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-slate-400">
                    Aucun arbitrage ne correspond aux filtres.
                  </CardContent>
                </Card>
              ) : (
                filteredArbitrages.map((arb) => {
                  const selectedNow = selectedArbitrageId === arb.id;
                  const vivant = arb._type === 'vivant';

                  const statusConfig = getStatusBadgeConfig((arb as any).status);
                  const urgentSimple = !vivant && (arb as any).status === 'pending' && isUrgentDeadline((arb as any).deadline);

                  const left = leftBorderForArb(arb);

                  return (
                    <Card
                      key={arb.id}
                      className={cn(
                        'cursor-pointer transition-all border-l-4',
                        left,
                        selectedNow ? 'ring-2 ring-red-500' : 'hover:border-red-500/50',
                        isResolved(arb) && 'opacity-80'
                      )}
                      onClick={() => {
                        setSelectedArbitrageId(arb.id);
                        setSelectedType(arb._type);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {vivant && <span className="text-lg">{getTypeIcon((arb as Vivant).type)}</span>}
                              <span className="font-mono text-xs text-purple-400">{arb.id}</span>

                              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>

                              {vivant ? (
                                <Badge
                                  variant={
                                    (arb as Vivant).context.riskLevel === 'critique'
                                      ? 'urgent'
                                      : (arb as Vivant).context.riskLevel === 'eleve'
                                      ? 'warning'
                                      : 'default'
                                  }
                                >
                                  Risque: {(arb as Vivant).context.riskLevel}
                                </Badge>
                              ) : (
                                <>
                                  {'impact' in (arb as any) && (
                                    <Badge
                                      variant={
                                        (arb as any).impact === 'critical'
                                          ? 'urgent'
                                          : (arb as any).impact === 'high'
                                          ? 'warning'
                                          : 'default'
                                      }
                                    >
                                      Impact: {(arb as any).impact}
                                    </Badge>
                                  )}
                                  {urgentSimple && <Badge variant="urgent" pulse>Urgent</Badge>}
                                </>
                              )}

                              {onlyIssues && isArbIssue(arb) && <Badge variant="warning">Issue</Badge>}
                            </div>

                            <h3 className="font-bold mt-1">{(arb as any).subject}</h3>
                          </div>

                          {/* Chronomètre (vivants) ou Échéance (simples) */}
                          {vivant && (arb as Vivant).status !== 'tranche' && (
                            <div
                              className={cn(
                                'p-2 rounded text-center',
                                (arb as Vivant).timing.isOverdue
                                  ? 'bg-red-500/20'
                                  : (arb as Vivant).timing.daysRemaining <= 1
                                  ? 'bg-amber-500/20'
                                  : 'bg-slate-700/30'
                              )}
                            >
                              <p
                                className={cn(
                                  'text-2xl font-bold',
                                  (arb as Vivant).timing.isOverdue
                                    ? 'text-red-400'
                                    : (arb as Vivant).timing.daysRemaining <= 1
                                    ? 'text-amber-400'
                                    : 'text-slate-300'
                                )}
                              >
                                {(arb as Vivant).timing.isOverdue ? '⏰' : (arb as Vivant).timing.daysRemaining}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {(arb as Vivant).timing.isOverdue ? 'En retard' : 'jour(s)'}
                              </p>
                            </div>
                          )}

                          {!vivant && (arb as any).deadline && (
                            <div className="text-right">
                              <p className="text-xs text-slate-400">Échéance</p>
                              <p className={cn('font-mono text-sm', urgentSimple ? 'text-red-400' : 'text-slate-300')}>
                                {(arb as any).deadline}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Contexte / Résolution preview */}
                        {vivant ? (
                          <>
                            <div className="p-2 rounded bg-slate-700/30 mb-3">
                              <p className="text-xs text-slate-400">
                                🔗 {(arb as Vivant).context.linkedEntity.type}: {(arb as Vivant).context.linkedEntity.label}
                              </p>
                              {(arb as Vivant).context.financialExposure ? (
                                <p className="text-sm font-bold text-amber-400 mt-1">
                                  💰 Exposition: {formatMoney((arb as Vivant).context.financialExposure)}
                                </p>
                              ) : null}
                            </div>

                            {/* Parties (preview) */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {(arb as Vivant).parties.slice(0, 3).map((p) => (
                                <Badge
                                  key={p.employeeId}
                                  variant={
                                    p.role === 'decideur'
                                      ? 'info'
                                      : p.role === 'demandeur'
                                      ? 'warning'
                                      : p.role === 'defendeur'
                                      ? 'default'
                                      : 'default'
                                  }
                                >
                                  {p.role}: {p.name}
                                </Badge>
                              ))}
                              {(arb as Vivant).parties.length > 3 && <Badge variant="default">+{(arb as Vivant).parties.length - 3}</Badge>}
                            </div>

                            {/* Options preview */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs text-slate-400">Options:</span>
                              {(arb as Vivant).decisionOptions.slice(0, 2).map((opt) => (
                                <Badge key={opt.id} variant="default">
                                  {opt.suggestedBy === 'ia' && '🤖'} {opt.label.substring(0, 20)}…
                                </Badge>
                              ))}
                              {(arb as Vivant).decisionOptions.length > 2 && <Badge variant="info">+{(arb as Vivant).decisionOptions.length - 2}</Badge>}
                            </div>

                            {/* Décision prise */}
                            {(arb as Vivant).decision && (
                              <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 mb-3">
                                <p className="text-xs text-emerald-400 mb-1">
                                  ✓ Décision du {new Date((arb as Vivant).decision!.decidedAt).toLocaleDateString('fr-FR')}
                                </p>
                                <p className="text-sm font-medium">{(arb as Vivant).decision!.motif}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                  Par {(arb as Vivant).decision!.decidedBy} → {(arb as Vivant).decision!.decisionId}
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          (arb as any).resolution && (
                            <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 mb-3">
                              <p className="text-xs text-emerald-400">✓ Résolution</p>
                              <p className="text-sm">{(arb as any).resolution}</p>
                            </div>
                          )
                        )}

                        {/* Actions inline */}
                        {((vivant && (arb as Vivant).status !== 'tranche') || (!vivant && (arb as any).status === 'pending')) && (
                          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                            <Button size="sm" variant="success" onClick={(e) => { e.stopPropagation(); handleTrancher(arb); }}>
                              ⚖️ Trancher
                            </Button>
                            <Button size="sm" variant="info" onClick={(e) => { e.stopPropagation(); handleRequestComplement(arb); }}>
                              📋 Complément
                            </Button>
                            <Button size="sm" variant="warning" onClick={(e) => { e.stopPropagation(); handlePostpone(arb); }}>
                              📅 Reporter
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Panel détail */}
            <div className="lg:col-span-1">
              {selected ? (
                <Card className="sticky top-4">
                  <CardContent className="p-4">
                    {selected._type === 'vivant' ? (
                      <>
                        {/* Header immersif vivant (tailwind-safe) */}
                        <div
                          className={cn(
                            'mb-4 p-4 rounded-lg',
                            RISK_PANEL[selected.context.riskLevel] || RISK_PANEL.default
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{getTypeIcon(selected.type)}</span>
                              {(() => {
                                const s = getStatusBadgeConfig(selected.status);
                                return <Badge variant={s.variant}>{s.label}</Badge>;
                              })()}
                            </div>

                            {selected.status !== 'tranche' && (
                              <div
                                className={cn(
                                  'text-center px-3 py-1 rounded',
                                  selected.timing.isOverdue ? 'bg-red-500/30' : 'bg-slate-700/50'
                                )}
                              >
                                <p className={cn('text-xl font-bold', selected.timing.isOverdue ? 'text-red-400' : 'text-white')}>
                                  {selected.timing.isOverdue ? '⏰ RETARD' : `${selected.timing.daysRemaining}j`}
                                </p>
                              </div>
                            )}
                          </div>

                          <span className="font-mono text-xs">{selected.id}</span>
                          <h3 className="font-bold">{selected.subject}</h3>
                        </div>

                        {/* Onglets */}
                        <div className="flex gap-1 mb-4 flex-wrap">
                          <Button size="sm" variant={viewTab === 'contexte' ? 'default' : 'secondary'} onClick={() => setViewTab('contexte')}>
                            📋 Contexte
                          </Button>
                          <Button size="sm" variant={viewTab === 'options' ? 'default' : 'secondary'} onClick={() => setViewTab('options')}>
                            💡 Options ({selected.decisionOptions.length})
                          </Button>
                          <Button size="sm" variant={viewTab === 'parties' ? 'default' : 'secondary'} onClick={() => setViewTab('parties')}>
                            👥 Parties ({selected.parties.length})
                          </Button>
                          <Button size="sm" variant={viewTab === 'documents' ? 'default' : 'secondary'} onClick={() => setViewTab('documents')}>
                            📎 Docs ({selected.documents.length})
                          </Button>
                        </div>

                        <div className="space-y-3 max-h-72 overflow-y-auto">
                          {viewTab === 'contexte' && (
                            <>
                              <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                                <p className="text-xs text-slate-400 mb-1">Contexte</p>
                                <p className="text-sm">{selected.context.backgroundSummary}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                                  <p className="text-xs text-slate-400">Risque</p>
                                  <Badge variant={selected.context.riskLevel === 'critique' ? 'urgent' : selected.context.riskLevel === 'eleve' ? 'warning' : 'default'}>
                                    {selected.context.riskLevel}
                                  </Badge>
                                </div>

                                {selected.context.financialExposure && (
                                  <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                                    <p className="text-xs text-slate-400">Exposition</p>
                                    <p className="text-sm font-bold text-amber-400">{formatMoney(selected.context.financialExposure)}</p>
                                  </div>
                                )}
                              </div>

                              {selected.context.previousAttempts && selected.context.previousAttempts.length > 0 && (
                                <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                                  <p className="text-xs text-slate-400 mb-1">Tentatives précédentes</p>
                                  {selected.context.previousAttempts.map((att, idx) => (
                                    <p key={idx} className="text-xs text-red-400">✗ {att}</p>
                                  ))}
                                </div>
                              )}
                            </>
                          )}

                          {viewTab === 'options' &&
                            selected.decisionOptions.map((opt) => (
                              <div
                                key={opt.id}
                                className={cn(
                                  'p-3 rounded border',
                                  darkMode ? 'bg-slate-700/30' : 'bg-gray-100',
                                  opt.suggestedBy === 'ia' && 'border-purple-500/30'
                                )}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    {opt.suggestedBy === 'ia' && <span title="Suggéré par IA">🤖</span>}
                                    <span className="font-bold text-sm">{opt.label}</span>
                                  </div>
                                  <Badge variant="default">{opt.suggestedBy}</Badge>
                                </div>

                                <p className="text-xs mb-2">{opt.description}</p>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <p className="text-emerald-400">✓ Pour:</p>
                                    {opt.pros.slice(0, 2).map((p, idx) => (
                                      <p key={idx} className="text-slate-300">• {p}</p>
                                    ))}
                                  </div>
                                  <div>
                                    <p className="text-red-400">✗ Contre:</p>
                                    {opt.cons.slice(0, 2).map((c, idx) => (
                                      <p key={idx} className="text-slate-300">• {c}</p>
                                    ))}
                                  </div>
                                </div>

                                {selected.status !== 'tranche' && (
                                  <Button size="sm" variant="success" className="w-full mt-2" onClick={() => handleTrancher(selected, opt.id)}>
                                    Choisir cette option
                                  </Button>
                                )}
                              </div>
                            ))}

                          {viewTab === 'parties' &&
                            selected.parties.map((p) => (
                              <div key={p.employeeId} className={cn('p-2 rounded text-xs', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">{p.name}</span>
                                  <div className="flex gap-1">
                                    <Badge variant={p.role === 'decideur' ? 'info' : p.role === 'demandeur' ? 'warning' : 'default'}>
                                      {p.role}
                                    </Badge>
                                    {p.raciRole && <Badge variant="default">{p.raciRole}</Badge>}
                                  </div>
                                </div>
                                <p className="text-slate-400">{p.bureau}</p>
                                {p.position && <p className="text-slate-300 mt-1">"{p.position}"</p>}
                              </div>
                            ))}

                          {viewTab === 'documents' &&
                            selected.documents.map((doc) => (
                              <div key={doc.id} className={cn('p-2 rounded text-xs flex items-center gap-2', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                                <span>📄</span>
                                <div className="flex-1">
                                  <p className="font-medium">{doc.title}</p>
                                  <p className="text-slate-400">
                                    {doc.type} • {doc.uploadedBy}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>

                        {/* Décision finale */}
                        {selected.decision && (
                          <div className="mt-4 p-3 rounded bg-emerald-500/10 border border-emerald-500/30">
                            <p className="text-xs text-emerald-400 font-bold mb-2">✓ DÉCISION FINALE</p>
                            <p className="text-sm">{selected.decision.motif}</p>
                            <div className="mt-2 text-xs text-slate-400">
                              <p>Par: {selected.decision.decidedBy}</p>
                              <p>Le: {new Date(selected.decision.decidedAt).toLocaleString('fr-FR')}</p>
                              <p className="font-mono">→ {selected.decision.decisionId}</p>
                            </div>
                            <div className="mt-2 p-2 rounded bg-slate-700/30">
                              <p className="text-[10px] text-purple-400">🔐 Hash SHA3-256</p>
                              <p className="font-mono text-[10px] truncate">{selected.decision.hash}</p>
                            </div>
                          </div>
                        )}

                        {/* Actions DG */}
                        {selected.status !== 'tranche' && (
                          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-700/50">
                            <Button size="sm" variant="success" onClick={() => handleTrancher(selected)}>
                              ⚖️ Trancher (décision libre)
                            </Button>
                            <Button size="sm" variant="info" onClick={() => handleScheduleHearing(selected)}>
                              📹 Planifier audition
                            </Button>
                            <Button size="sm" variant="warning" onClick={() => handlePostpone(selected)}>
                              📅 Reporter avec justification
                            </Button>
                            <Button size="sm" variant="default" onClick={() => handleRequestComplement(selected)}>
                              📋 Demander complément
                            </Button>
                          </div>
                        )}

                        {/* Hash arbitrage */}
                        <div className="mt-3 p-2 rounded bg-purple-500/10 border border-purple-500/30">
                          <p className="text-[10px] text-purple-400">🔐 Hash arbitrage</p>
                          <p className="font-mono text-[10px] truncate">{selected.hash}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Header simple */}
                        <div className="mb-4 pb-4 border-b border-slate-700/50">
                          <div className="flex items-center gap-2 mb-2">
                            {(() => {
                              const s = getStatusBadgeConfig(selected.status);
                              return <Badge variant={s.variant}>{s.label}</Badge>;
                            })()}
                            {'impact' in (selected as any) && (
                              <Badge
                                variant={
                                  (selected as any).impact === 'critical'
                                    ? 'urgent'
                                    : (selected as any).impact === 'high'
                                    ? 'warning'
                                    : 'default'
                                }
                              >
                                Impact: {(selected as any).impact}
                              </Badge>
                            )}
                            {(selected as any).deadline && isUrgentDeadline((selected as any).deadline) && selected.status === 'pending' && (
                              <Badge variant="urgent" pulse>Urgent</Badge>
                            )}
                          </div>

                          <span className="font-mono text-xs text-purple-400">{selected.id}</span>
                          <h3 className="font-bold">{(selected as any).subject}</h3>
                        </div>

                        <div className="space-y-3 text-sm">
                          {(selected as any).deadline && (
                            <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                              <p className="text-xs text-slate-400 mb-1">Échéance</p>
                              <p className="font-mono">{(selected as any).deadline}</p>
                            </div>
                          )}

                          {(selected as any).description && (
                            <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                              <p className="text-xs text-slate-400 mb-1">Description</p>
                              <p className="text-sm">{(selected as any).description}</p>
                            </div>
                          )}

                          {Array.isArray((selected as any).parties) && (
                            <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                              <p className="text-xs text-slate-400 mb-1">Parties</p>
                              <div className="flex flex-wrap gap-2">
                                {(selected as any).parties.map((p: string, idx: number) => (
                                  <Badge key={idx} variant="default">{p}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {(selected as any).requestedBy && (
                            <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                              <p className="text-xs text-slate-400 mb-1">Demandé par</p>
                              <p className="text-sm">{(selected as any).requestedBy}</p>
                            </div>
                          )}

                          {(selected as any).resolution && (
                            <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30">
                              <p className="text-xs text-emerald-400 mb-1">Résolution</p>
                              <p className="text-sm">{(selected as any).resolution}</p>
                            </div>
                          )}

                          {/* Workflow simple */}
                          <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                            <p className="text-xs text-slate-400 mb-1">Workflow</p>
                            <ol className="space-y-2 text-xs">
                              <li className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs">✓</span>
                                <span>Demande créée</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    'w-5 h-5 rounded-full flex items-center justify-center text-white text-xs',
                                    selected.status === 'resolved' ? 'bg-emerald-500' : 'bg-amber-500'
                                  )}
                                >
                                  {selected.status === 'resolved' ? '✓' : '2'}
                                </span>
                                <span>Analyse & délibération</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    'w-5 h-5 rounded-full flex items-center justify-center text-white text-xs',
                                    selected.status === 'resolved' ? 'bg-emerald-500' : 'bg-slate-500'
                                  )}
                                >
                                  {selected.status === 'resolved' ? '✓' : '3'}
                                </span>
                                <span>Décision hashée</span>
                              </li>
                            </ol>
                          </div>
                        </div>

                        {/* Actions simples */}
                        {selected.status === 'pending' && (
                          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-700/50">
                            <Button size="sm" variant="success" onClick={() => handleTrancher(selected)}>
                              ⚖️ Trancher
                            </Button>
                            <Button size="sm" variant="info" onClick={() => handleRequestComplement(selected)}>
                              📋 Demander complément
                            </Button>
                            <Button size="sm" variant="warning" onClick={() => handlePostpone(selected)}>
                              📅 Reporter
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="sticky top-4">
                  <CardContent className="p-8 text-center">
                    <span className="text-4xl mb-4 block">⚔️</span>
                    <p className="text-slate-400">Sélectionnez un arbitrage</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Section Bureaux */}
          {bureauxStats.totalGoulots > 0 && (
            <Card className="border-amber-500/50 bg-amber-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-amber-400">{bureauxStats.totalGoulots} goulot(s) identifié(s)</h3>
                    <p className="text-sm text-slate-400">Points de blocage nécessitant attention</p>
                  </div>
                  <Badge variant="warning">{bureauxStats.bureauxSurcharge} bureau(x) en surcharge</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-blue-400">{bureauxStats.totalAgents}</p>
                <p className="text-[10px] text-slate-400">Agents total</p>
              </CardContent>
            </Card>

            <Card className={cn(bureauxStats.avgCharge > 80 ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30')}>
              <CardContent className="p-3 text-center">
                <p className={cn('text-2xl font-bold', bureauxStats.avgCharge > 80 ? 'text-red-400' : 'text-emerald-400')}>
                  {bureauxStats.avgCharge}%
                </p>
                <p className="text-[10px] text-slate-400">Charge moyenne</p>
              </CardContent>
            </Card>

            <Card className="bg-emerald-500/10 border-emerald-500/30">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-emerald-400">{bureauxStats.avgCompletion}%</p>
                <p className="text-[10px] text-slate-400">Complétion moy.</p>
              </CardContent>
            </Card>

            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-amber-400">{bureauxStats.bureauxSurcharge}</p>
                <p className="text-[10px] text-slate-400">En surcharge</p>
              </CardContent>
            </Card>

            <Card className="bg-purple-500/10 border-purple-500/30">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-purple-400">{bureauxStats.totalGoulots}</p>
                <p className="text-[10px] text-slate-400">Goulots</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-3">
              {filteredBureaux.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-slate-400">
                    Aucun bureau ne correspond aux filtres.
                  </CardContent>
                </Card>
              ) : (
                filteredBureaux.map((bureau) => {
                  const isSelected = selectedBureau === bureau.code;
                  const isOverloaded = bureau.charge > 85;
                  const hasGoulots = bureau.goulots.length > 0;

                  return (
                    <Card
                      key={bureau.code}
                      className={cn(
                        'cursor-pointer transition-all',
                        isSelected ? 'ring-2 ring-blue-500' : 'hover:border-blue-500/50',
                        isOverloaded ? 'border-l-4 border-l-red-500' : hasGoulots ? 'border-l-4 border-l-amber-500' : ''
                      )}
                      onClick={() => {
                        setSelectedBureau(bureau.code);
                        setShowHistory(false);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="info">{bureau.code}</Badge>
                              <span className="font-bold">{bureau.name}</span>
                              {isOverloaded && <Badge variant="urgent">Surcharge</Badge>}
                              {hasGoulots && <Badge variant="warning">{bureau.goulots.length} goulot(s)</Badge>}
                            </div>
                            <p className="text-sm text-slate-400 mt-1">
                              Responsable: <span className="text-slate-300">{bureau.head}</span>
                            </p>
                          </div>
                          <p className="text-sm text-slate-400">{bureau.agents} agents</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-400">Charge</span>
                              <span className={cn('font-mono', bureau.charge > 85 ? 'text-red-400' : bureau.charge > 70 ? 'text-amber-400' : 'text-emerald-400')}>
                                {bureau.charge}%
                              </span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={cn('h-full transition-all', bureau.charge > 85 ? 'bg-red-500' : bureau.charge > 70 ? 'bg-amber-500' : 'bg-emerald-500')}
                                style={{ width: `${bureau.charge}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-400">Complétion</span>
                              <span className="font-mono text-blue-400">{bureau.completion}%</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 transition-all" style={{ width: `${bureau.completion}%` }} />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-sm p-2 rounded bg-slate-700/30">
                          <span className="text-slate-400">Budget</span>
                          <div className="text-right">
                            <span className="font-mono text-emerald-400">{bureau.budgetUsed}</span>
                            <span className="text-slate-500"> / </span>
                            <span className="font-mono text-slate-300">{bureau.budget} FCFA</span>
                          </div>
                        </div>

                        {hasGoulots && (
                          <div className="mt-3 space-y-1">
                            {bureau.goulots.map((goulot, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 rounded bg-amber-500/10 border border-amber-500/30">
                                <span className="text-xs text-amber-300">⚠️ {goulot}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReportBottleneck(bureau, goulot);
                                  }}
                                >
                                  Remonter
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-3 pt-3 border-t border-slate-700/50 text-xs text-slate-400">
                          Modifié le {bureau.lastModified} par {bureau.modifiedBy}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            <div className="lg:col-span-1">
              {selectedB ? (
                <Card className="sticky top-4">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700/50">
                      <div>
                        <Badge variant="info" className="mb-2">
                          {selectedB.code}
                        </Badge>
                        <h3 className="font-bold">{selectedB.name}</h3>
                        <p className="text-sm text-slate-400">{selectedB.head}</p>
                      </div>
                      {selectedB.charge > 85 && <Badge variant="urgent">Surcharge</Badge>}
                    </div>

                    <div className="flex gap-2 mb-4">
                      <Button size="sm" variant={!showHistory ? 'default' : 'secondary'} onClick={() => setShowHistory(false)}>
                        Infos
                      </Button>
                      <Button size="sm" variant={showHistory ? 'default' : 'secondary'} onClick={() => setShowHistory(true)}>
                        Historique ({selectedB.history.length})
                      </Button>
                    </div>

                    {!showHistory ? (
                      <div className="space-y-3 text-sm">
                        <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs text-slate-400">Agents</p>
                              <p className="font-bold">{selectedB.agents}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Charge</p>
                              <p className={cn('font-bold', selectedB.charge > 85 ? 'text-red-400' : 'text-emerald-400')}>
                                {selectedB.charge}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Complétion</p>
                              <p className="font-bold text-blue-400">{selectedB.completion}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Goulots</p>
                              <p className={cn('font-bold', selectedB.goulots.length > 0 ? 'text-amber-400' : 'text-emerald-400')}>
                                {selectedB.goulots.length}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-xs mb-2">📐 Activités RACI (R/A)</h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedB.raciActivities.map((act, idx) => (
                              <Badge key={idx} variant="default">{act}</Badge>
                            ))}
                          </div>
                        </div>

                        <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                          <h4 className="font-bold text-xs mb-2">💰 Budget</h4>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Alloué</span>
                              <span className="font-mono">{selectedB.budget} FCFA</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Utilisé</span>
                              <span className="font-mono text-emerald-400">{selectedB.budgetUsed} FCFA</span>
                            </div>
                          </div>
                        </div>

                        {selectedB.goulots.length > 0 && (
                          <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                            <h4 className="font-bold text-xs mb-2">⚠️ Goulots</h4>
                            <div className="space-y-2">
                              {selectedB.goulots.map((g, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 rounded bg-amber-500/10 border border-amber-500/30">
                                  <span className="text-xs text-amber-300">{g}</span>
                                  <Button size="sm" variant="ghost" onClick={() => handleReportBottleneck(selectedB, g)}>
                                    Remonter
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {selectedB.history.length > 0 ? (
                          selectedB.history.map((entry) => (
                            <div key={entry.id} className={cn('p-2 rounded text-xs', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge
                                  variant={
                                    entry.action === 'responsable_change'
                                      ? 'warning'
                                      : entry.action === 'budget_adjust'
                                      ? 'info'
                                      : entry.action === 'agent_add'
                                      ? 'success'
                                      : 'default'
                                  }
                                >
                                  {entry.action.replace('_', ' ')}
                                </Badge>
                                <span className="text-slate-400">{entry.date}</span>
                              </div>
                              <p>{entry.description}</p>
                              <p className="text-slate-400 mt-1">Par: {entry.author}</p>
                              {entry.previousValue && <p className="text-slate-500">{entry.previousValue} → {entry.newValue}</p>}
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-400 text-center py-4">Aucun historique</p>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-700/50">
                      <Button size="sm" variant="default" onClick={() => handleAdjustResponsibilities(selectedB)}>
                        ⚙️ Ajuster responsabilités
                      </Button>
                      <Button size="sm" variant="info" onClick={() => addToast(`RACI: ${selectedB.raciActivities.length} activités liées`, 'info')}>
                        📐 Voir RACI
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="sticky top-4">
                  <CardContent className="p-8 text-center">
                    <span className="text-4xl mb-4 block">🏢</span>
                    <p className="text-slate-400">Sélectionnez un bureau</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}

      {/* Command palette */}
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
                <CmdItem
                  label="⚔️ Aller aux Arbitrages"
                  hint="Vue arbitrages + filtres"
                  onClick={() => {
                    setMainTab('arbitrages');
                    setCmdOpen(false);
                  }}
                />
                <CmdItem
                  label="🏢 Aller aux Bureaux"
                  hint="Charge, goulots, budget"
                  onClick={() => {
                    setMainTab('bureaux');
                    setCmdOpen(false);
                  }}
                />

                <CmdItem
                  label="🚨 Toggle issues (arbitrages)"
                  hint="Filtrer uniquement les problèmes"
                  onClick={() => {
                    setMainTab('arbitrages');
                    setOnlyIssues((v) => !v);
                    setCmdOpen(false);
                  }}
                />
                <CmdItem
                  label="🔥 Toggle surcharge (bureaux)"
                  hint="Afficher uniquement charge > 85%"
                  onClick={() => {
                    setMainTab('bureaux');
                    setOnlyOverloaded((v) => !v);
                    setCmdOpen(false);
                  }}
                />

                <CmdItem
                  label="⏳ Filtrer: Vivants ouverts"
                  hint="ouvert / en_deliberation / decision_requise"
                  onClick={() => {
                    setMainTab('arbitrages');
                    setFilter('ouverts');
                    setCmdOpen(false);
                  }}
                />
                <CmdItem
                  label="⏰ Filtrer: Simples pending"
                  hint="Priorité aux échéances proches"
                  onClick={() => {
                    setMainTab('arbitrages');
                    setFilter('pending');
                    setCmdOpen(false);
                  }}
                />

                <CmdItem
                  label="🧼 Nettoyer filtres"
                  hint="Réinitialiser recherche + toggles"
                  onClick={() => {
                    setQ('');
                    setOnlyIssues(false);
                    setOnlyOverloaded(false);
                    setFilter('all');
                    setCmdOpen(false);
                  }}
                />

                <CmdItem
                  label="📤 Export arbitrage sélectionné"
                  hint="JSON (si sélection)"
                  onClick={() => {
                    if (selected) exportSelectedJson();
                    else addToast('Sélectionnez un arbitrage avant export', 'warning');
                    setCmdOpen(false);
                  }}
                />
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
