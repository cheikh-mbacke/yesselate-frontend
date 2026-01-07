'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { KPICard } from '@/components/features/bmo/KPICard';
import { DashboardCard } from '@/components/features/bmo/DashboardCard';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import {
  performanceData,
  bureauPieData,
  systemAlerts,
  blockedDossiers,
  paymentsN1,
  contractsToSign,
  decisions,
  bureaux,
} from '@/lib/data';

type Period = 'month' | 'quarter' | 'year';

const STORAGE_KEYS = {
  pinnedBureaux: 'bmo.dashboard.pinnedBureaux',
};

const parseFRDate = (str?: string | null): Date | null => {
  if (!str || str === '—') return null;
  const [dd, mm, yyyy] = str.split('/').map((n) => Number(n));
  if (!dd || !mm || !yyyy) return null;
  const d = new Date(yyyy, mm - 1, dd);
  return Number.isNaN(d.getTime()) ? null : d;
};

const daysUntil = (date: Date | null): number | null => {
  if (!date) return null;
  const today = new Date();
  const a = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const b = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = b.getTime() - a.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export default function DashboardPage() {
  const router = useRouter();
  const { darkMode } = useAppStore();
  const { liveStats, addToast, openSubstitutionModal, openBlocageModal } = useBMOStore();

  const [period, setPeriod] = useState<Period>('year');
  const [query, setQuery] = useState('');
  const [cmdOpen, setCmdOpen] = useState(false);
  const [dismissBanner, setDismissBanner] = useState(false);

  // Snooze (session)
  const [snoozedRiskIds, setSnoozedRiskIds] = useState<Record<string, boolean>>({});
  const [snoozedActionIds, setSnoozedActionIds] = useState<Record<string, boolean>>({});

  // Bureaux épinglés (persisté)
  const [pinnedBureaux, setPinnedBureaux] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.pinnedBureaux);
      if (raw) setPinnedBureaux(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.pinnedBureaux, JSON.stringify(pinnedBureaux));
    } catch {
      // ignore
    }
  }, [pinnedBureaux]);

  const search = query.trim().toLowerCase();

  // --- Période → sous-ensemble performanceData
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

  // --- KPI animation (requestAnimationFrame)
  const [animatedKPIs, setAnimatedKPIs] = useState({
    demandes: 0,
    validations: 0,
    rejets: 0,
    budget: 0,
  });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const start = performance.now();
    const duration = 650; // ms
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
  }, [totals.demandes, totals.validations, totals.rejets, totals.budget]);

  // --- Paiements enrichis (jours avant échéance)
  const enrichedPayments = useMemo(() => {
    return paymentsN1.map((p) => {
      const due = parseFRDate(p.dueDate);
      const d = daysUntil(due);
      return { ...p, _daysToDue: d };
    });
  }, []);

  // --- Contrats enrichis (jours avant expiry si format dd/mm/yyyy)
  const enrichedContracts = useMemo(() => {
    return contractsToSign.map((c) => {
      const exp = parseFRDate(c.expiry);
      const d = daysUntil(exp);
      return { ...c, _daysToExpiry: d };
    });
  }, []);

  // --- Bureau health + tri (pinned en haut)
  const bureauHealth = useMemo(() => {
    const base = bureaux.map((b) => {
      const blockedCount = blockedDossiers.filter((d) => d.bureau === b.code).length;
      const health = blockedCount === 0 ? 'good' : blockedCount <= 1 ? 'warning' : 'critical';
      return { ...b, blockedCount, health };
    });

    const score = (h: (typeof base)[number]) =>
      (h.health === 'critical' ? 2 : h.health === 'warning' ? 1 : 0) * 100 + h.blockedCount;

    return base
      .sort((a, b) => {
        const ap = pinnedBureaux.includes(a.code) ? -1000 : 0;
        const bp = pinnedBureaux.includes(b.code) ? -1000 : 0;
        return ap - bp || score(b) - score(a) || a.code.localeCompare(b.code);
      })
      .filter((b) => {
        if (!search) return true;
        return (
          b.code.toLowerCase().includes(search) ||
          (b.name?.toLowerCase?.().includes(search) ?? false)
        );
      });
  }, [pinnedBureaux, search]);

  // --- Stats rapides (bannières + badges)
  const quickStats = useMemo(() => {
    const blockedCritical = blockedDossiers.filter((d) => d.delay >= 5);
    const latePayments = enrichedPayments.filter((p) => (p as any)._daysToDue !== null && (p as any)._daysToDue! < 0);
    const urgentPayments = enrichedPayments.filter((p) => {
      const d = (p as any)._daysToDue as number | null;
      return d !== null && d >= 0 && d <= 5;
    });
    const pendingContracts = enrichedContracts.filter((c) => c.status === 'pending');
    return {
      blockedCritical: blockedCritical.length,
      blockedMostUrgent: blockedCritical.sort((a, b) => b.delay - a.delay)[0] ?? null,
      latePayments: latePayments.length,
      urgentPayments: urgentPayments.length,
      pendingContracts: pendingContracts.length,
    };
  }, [enrichedPayments, enrichedContracts]);

  // --- Top risques combinés (alertes + blocages) triés
  type RiskItem =
    | { id: string; kind: 'alert'; severity: 'critical' | 'warning'; title: string; action: string; source: string }
    | { id: string; kind: 'blocked'; severity: 'critical' | 'warning'; title: string; action: string; source: string; dossier: (typeof blockedDossiers)[number] };

  const topRisques = useMemo(() => {
    const alerts: RiskItem[] = systemAlerts
      .filter((a) => a.type === 'critical' || a.type === 'warning')
      .map((a) => ({
        id: a.id,
        kind: 'alert',
        severity: a.type,
        title: a.title,
        action: a.action,
        source: 'Système',
      }));

    const blocked: RiskItem[] = blockedDossiers
      .filter((d) => d.delay >= 3) // un poil plus "préventif" que 5
      .map((d) => ({
        id: d.id,
        kind: 'blocked',
        severity: d.impact === 'critical' ? 'critical' : 'warning',
        title: `${d.type} bloqué ${d.delay}j`,
        action: d.subject,
        source: d.bureau,
        dossier: d,
      }));

    const sevScore = (s: 'critical' | 'warning') => (s === 'critical' ? 2 : 1);

    return [...alerts, ...blocked]
      .filter((r) => !snoozedRiskIds[r.id])
      .filter((r) => {
        if (!search) return true;
        return (
          r.title.toLowerCase().includes(search) ||
          r.action.toLowerCase().includes(search) ||
          r.source.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => sevScore(b.severity) - sevScore(a.severity))
      .slice(0, 6);
  }, [search, snoozedRiskIds]);

  // --- Actions prioritaires (actionnables)
  type PriorityAction = {
    id: string;
    type: 'substitution' | 'paiement' | 'contrat' | 'alert';
    title: string;
    subtitle: string;
    amount?: string;
    urgency: 'critical' | 'high' | 'medium';
    icon: string;
    link?: string;
    params?: Record<string, string>;
    dossier?: (typeof blockedDossiers)[number];
  };

  const actions = useMemo(() => {
    const list: PriorityAction[] = [];

    if (quickStats.blockedMostUrgent) {
      const d = quickStats.blockedMostUrgent;
      list.push({
        id: d.id,
        type: 'substitution',
        title: `Débloquer ${d.id}`,
        subtitle: `${d.subject} • bloqué ${d.delay} jours`,
        amount: d.amount,
        urgency: 'critical',
        icon: '🔄',
        link: '/maitre-ouvrage/substitution',
        params: { id: d.id },
        dossier: d,
      });
    }

    if (quickStats.urgentPayments > 0) {
      const p = enrichedPayments
        .filter((x) => {
          const d = (x as any)._daysToDue as number | null;
          return d !== null && d >= 0 && d <= 5;
        })
        .sort((a, b) => ((a as any)._daysToDue ?? 999) - ((b as any)._daysToDue ?? 999))[0];

      if (p) {
        list.push({
          id: p.id,
          type: 'paiement',
          title: `Valider ${quickStats.urgentPayments} paiement(s) urgent(s)`,
          subtitle: `Échéance ≤ 5 jours • ${p.beneficiary}`,
          amount: p.amount,
          urgency: 'high',
          icon: '💳',
          link: '/maitre-ouvrage/validation-paiements',
          params: { urgent: 'true' },
        });
      }
    }

    if (quickStats.pendingContracts > 0) {
      const c = enrichedContracts
        .filter((x) => x.status === 'pending')
        .sort((a, b) => ((a as any)._daysToExpiry ?? 999) - ((b as any)._daysToExpiry ?? 999))[0];

      if (c) {
        list.push({
          id: c.id,
          type: 'contrat',
          title: `Signer ${quickStats.pendingContracts} contrat(s)`,
          subtitle: c.subject,
          amount: c.amount,
          urgency: 'medium',
          icon: '📜',
          link: '/maitre-ouvrage/validation-contrats',
          params: { status: 'pending' },
        });
      }
    }

    // Petit "filet de sécurité" : si alertes critiques
    const critAlerts = systemAlerts.filter((a) => a.type === 'critical');
    if (critAlerts.length > 0) {
      list.push({
        id: critAlerts[0].id,
        type: 'alert',
        title: `Traiter ${critAlerts.length} alerte(s) critique(s)`,
        subtitle: critAlerts[0].title,
        urgency: 'high',
        icon: '🚨',
        link: '/maitre-ouvrage/alerts',
      });
    }

    return list
      .filter((a) => !snoozedActionIds[a.id])
      .filter((a) => {
        if (!search) return true;
        return (
          a.title.toLowerCase().includes(search) ||
          a.subtitle.toLowerCase().includes(search) ||
          (a.amount?.toLowerCase().includes(search) ?? false)
        );
      })
      .slice(0, 3);
  }, [enrichedPayments, enrichedContracts, quickStats, search, snoozedActionIds]);

  const decisionsPreview = useMemo(() => {
    const base = decisions.slice(0, 12);
    const filtered = search
      ? base.filter((d) => {
          const s =
            `${d.id} ${d.type} ${d.subject} ${d.author} ${d.date} ${d.status}`.toLowerCase();
          return s.includes(search);
        })
      : base;

    // pending d'abord
    const score = (s: string) => (s === 'pending' ? 2 : s === 'executed' ? 1 : 0);
    return filtered.sort((a, b) => score(b.status) - score(a.status)).slice(0, 5);
  }, [search]);

  // --- Raccourci Cmd/Ctrl+K + / pour focus recherche
  const searchRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && key === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
      if (!e.metaKey && !e.ctrlKey && key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (key === 'escape') setCmdOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const buildUrl = (base: string, params?: Record<string, string>) => {
    if (!params) return base;
    const sp = new URLSearchParams(params);
    return `${base}?${sp.toString()}`;
  };

  const handleRisqueClick = (r: RiskItem) => {
    if (r.kind === 'blocked') openBlocageModal(r.dossier);
    else router.push('/maitre-ouvrage/alerts');
  };

  const togglePin = (code: string) => {
    setPinnedBureaux((prev) => (prev.includes(code) ? prev.filter((x) => x !== code) : [code, ...prev]));
    addToast(pinnedBureaux.includes(code) ? `📌 ${code} retiré des épingles` : `📌 ${code} épinglé`, 'info');
  };

  const refresh = () => {
    addToast('🔄 Données rafraîchies (simulation)', 'success');
  };

  const validationRate =
    ((animatedKPIs.validations / (animatedKPIs.demandes || 1)) * 100).toFixed(1);
  const rejectRate =
    ((animatedKPIs.rejets / (animatedKPIs.demandes || 1)) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header "exécutif" */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              🧠 Dashboard Maître d'Ouvrage
              <Badge variant="info" className="text-[10px]">
                {period === 'month' ? 'Mois' : period === 'quarter' ? 'Trimestre' : 'Année'}
              </Badge>
            </h1>
            <p className="text-sm text-slate-400">
              Recherche "/" • Palette "Ctrl/⌘+K" • Pilotage risques → actions → décisions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={refresh} aria-label="Rafraîchir">
              🔄 Rafraîchir
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setCmdOpen(true)} aria-label="Ouvrir palette">
              ⌘K
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className={cn('flex-1 min-w-[240px]')}>
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher : risques, actions, bureaux, décisions…"
              className={cn(
                'w-full px-3 py-2 rounded text-sm',
                darkMode ? 'bg-slate-800 border border-slate-600' : 'bg-white border border-gray-300'
              )}
            />
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={period === 'month' ? 'warning' : 'ghost'}
              onClick={() => setPeriod('month')}
            >
              Mois
            </Button>
            <Button
              size="sm"
              variant={period === 'quarter' ? 'warning' : 'ghost'}
              onClick={() => setPeriod('quarter')}
            >
              Trimestre
            </Button>
            <Button
              size="sm"
              variant={period === 'year' ? 'warning' : 'ghost'}
              onClick={() => setPeriod('year')}
            >
              Année
            </Button>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400">
              Blocages 5j+ : {quickStats.blockedCritical}
            </span>
            <span className="px-2 py-1 rounded bg-red-500/10 text-red-400">
              Retards paiements : {quickStats.latePayments}
            </span>
            <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400">
              Paiements urgents : {quickStats.urgentPayments}
            </span>
            <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400">
              Contrats à signer : {quickStats.pendingContracts}
            </span>
          </div>
        </div>
      </div>

      {/* Alerte critique (dismissable) */}
      {!dismissBanner && quickStats.blockedCritical > 0 && (
        <div
          className={cn(
            'rounded-xl p-4 flex items-center gap-3 border',
            darkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
          )}
        >
          <span className="text-2xl animate-pulse">🚨</span>
          <div className="flex-1">
            <p className="font-bold text-sm text-red-400">
              {quickStats.blockedCritical} dossier(s) bloqué(s) depuis plus de 5 jours
            </p>
            <p className="text-xs text-slate-400">
              Substitution recommandée pour relancer la chaîne de validation.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/maitre-ouvrage/substitution">
              <Button size="sm" variant="destructive">
                ⚡ Intervenir
              </Button>
            </Link>
            <Button size="sm" variant="secondary" onClick={() => setDismissBanner(true)}>
              Masquer
            </Button>
          </div>
        </div>
      )}

      {/* SECTION 1: Performance Globale */}
      <section>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span>📊</span>
          <span>Performance Globale</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPICard
            icon="📋"
            label="Demandes"
            value={animatedKPIs.demandes}
            trend={period === 'month' ? 'Mois en cours' : period === 'quarter' ? 'Trimestre' : 'Cumul annuel'}
            color="#3B82F6"
            onClick={() => router.push('/maitre-ouvrage/demandes')}
          />
          <KPICard
            icon="✅"
            label="Validations"
            value={animatedKPIs.validations}
            trend={`${validationRate}% taux`}
            up
            color="#10B981"
            onClick={() => router.push('/maitre-ouvrage/demandes?filter=validated')}
          />
          <KPICard
            icon="❌"
            label="Rejets"
            value={animatedKPIs.rejets}
            trend={`${rejectRate}% taux`}
            up={false}
            color="#EF4444"
            onClick={() => router.push('/maitre-ouvrage/demandes?filter=rejected')}
          />
          <KPICard
            icon="💰"
            label="Budget traité"
            value={`${animatedKPIs.budget}Mds`}
            sub="FCFA"
            trend="Cumul"
            color="#D4AF37"
            onClick={() => router.push('/maitre-ouvrage/finances')}
          />
        </div>
      </section>

      {/* SECTION 2: Actions Prioritaires */}
      <section>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span>⚡</span>
          <span>Actions Prioritaires</span>
        </h2>

        <DashboardCard
          title="3 actions les plus rentables maintenant"
          subtitle="Moins de clics → plus d'impact"
          icon="⚡"
          borderColor="#F97316"
        >
          <div className="grid md:grid-cols-3 gap-3">
            {actions.length === 0 ? (
              <p className="text-xs text-slate-400 col-span-3 text-center py-4">
                ✅ Aucune action urgente détectée
              </p>
            ) : (
              actions.map((a, i) => (
                <button
                  key={a.id}
                  onClick={() => {
                    if (a.type === 'substitution' && a.dossier) {
                      openSubstitutionModal(a.dossier);
                      addToast(`🔄 Substitution ouverte pour ${a.dossier.id}`, 'info');
                      return;
                    }
                    if (a.link) router.push(buildUrl(a.link, a.params));
                  }}
                  className={cn(
                    'text-left p-3 rounded-lg border transition-all hover:scale-[1.02]',
                    a.urgency === 'critical'
                      ? 'border-red-500/50 bg-red-500/10 hover:bg-red-500/20'
                      : a.urgency === 'high'
                      ? 'border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20'
                      : 'border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xl">{a.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold">#{i + 1}</span>
                        <Badge
                          variant={a.urgency === 'critical' ? 'urgent' : a.urgency === 'high' ? 'warning' : 'info'}
                          className="text-[9px]"
                        >
                          {a.urgency}
                        </Badge>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSnoozedActionIds((prev) => ({ ...prev, [a.id]: true }));
                            addToast('🕒 Action masquée pour la session', 'info');
                          }}
                          className="ml-auto text-[10px] text-slate-400 hover:text-slate-200"
                          aria-label="Masquer cette action"
                          title="Masquer pour la session"
                        >
                          Snooze
                        </button>
                      </div>

                      <p className="text-sm font-semibold">{a.title}</p>
                      <p className="text-[10px] text-slate-400">{a.subtitle}</p>

                      {a.amount && a.amount !== '—' && (
                        <p className={cn('text-xs font-mono mt-1', darkMode ? 'text-slate-300' : 'text-gray-700')}>
                          {a.amount} FCFA
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </DashboardCard>
      </section>

      {/* SECTION 3: Risques & Santé Organisationnelle */}
      <section>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span>⚠️</span>
          <span>Risques & Santé Organisationnelle</span>
        </h2>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Santé organisationnelle */}
          <DashboardCard
            title="Santé organisationnelle"
            subtitle="État des bureaux (⭐ épingler)"
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
            <div className="flex gap-4">
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={bureauPieData} cx="50%" cy="50%" innerRadius={25} outerRadius={45} dataKey="value">
                      {bureauPieData.map((entry, idx) => (
                        <Cell key={idx} fill={(entry as any).color ?? '#3B82F6'} />
                      ))}
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
                      'flex items-center gap-2 p-1.5 rounded text-xs transition-colors',
                      darkMode ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-gray-50 hover:bg-gray-100'
                    )}
                  >
                    <button
                      onClick={() => togglePin(b.code)}
                      className={cn(
                        'text-[12px] leading-none',
                        pinnedBureaux.includes(b.code) ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
                      )}
                      aria-label={pinnedBureaux.includes(b.code) ? 'Désépingler' : 'Épingler'}
                      title={pinnedBureaux.includes(b.code) ? 'Désépingler' : 'Épingler'}
                    >
                      {pinnedBureaux.includes(b.code) ? '★' : '☆'}
                    </button>

                    <button
                      onClick={() => router.push(`/maitre-ouvrage/arbitrages-vivants?bureau=${b.code}`)}
                      className="flex items-center gap-2 flex-1"
                    >
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          b.health === 'good'
                            ? 'bg-emerald-500'
                            : b.health === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-red-500 animate-pulse'
                        )}
                      />
                      <span className="font-medium">{b.code}</span>
                      <span className="text-slate-400 text-[10px]">{b.completion}%</span>
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
            title="Top risques"
            subtitle="Critiques + préventifs (≥ 3 jours)"
            icon="⚠️"
            badge={topRisques.length}
            badgeVariant="warning"
            borderColor="#F59E0B"
            footer={
              <Link href="/maitre-ouvrage/alerts">
                <Button size="sm" variant="ghost" className="w-full text-xs">
                  Voir tous les risques →
                </Button>
              </Link>
            }
          >
            <div className="space-y-2">
              {topRisques.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  ✅ Aucun risque critique détecté
                </p>
              ) : (
                topRisques.map((r) => (
                  <div
                    key={r.id}
                    className={cn(
                      'w-full flex items-center gap-2 p-2 rounded-lg border-l-4 transition-colors',
                      r.severity === 'critical'
                        ? 'border-l-red-500 bg-red-500/5 hover:bg-red-500/10'
                        : 'border-l-amber-500 bg-amber-500/5 hover:bg-amber-500/10'
                    )}
                  >
                    <button className="flex items-center gap-2 flex-1 min-w-0" onClick={() => handleRisqueClick(r)}>
                      <span className="text-lg">{r.severity === 'critical' ? '🚨' : '⚠️'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{r.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">{r.action}</p>
                      </div>
                      <BureauTag bureau={r.source} />
                    </button>

                    <button
                      onClick={() => {
                        setSnoozedRiskIds((prev) => ({ ...prev, [r.id]: true }));
                        addToast('🕒 Risque masqué pour la session', 'info');
                      }}
                      className="text-[10px] text-slate-400 hover:text-slate-200"
                      aria-label="Masquer ce risque"
                      title="Masquer pour la session"
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

      {/* SECTION 4: Décisions & Timeline */}
      <section>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
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
            {decisionsPreview.map((d) => (
              <Link
                key={d.id}
                href={`/maitre-ouvrage/decisions?id=${d.id}`}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-lg border-l-4 transition-colors',
                  d.status === 'executed'
                    ? 'border-l-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10'
                    : d.status === 'pending'
                    ? 'border-l-amber-500 bg-amber-500/5 hover:bg-amber-500/10'
                    : 'border-l-slate-500 bg-slate-500/5 hover:bg-slate-500/10',
                  darkMode ? 'bg-slate-700/20' : 'bg-gray-50'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm',
                    d.type === 'Validation N+1'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : d.type === 'Substitution'
                      ? 'bg-orange-500/20 text-orange-400'
                      : d.type === 'Délégation'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-blue-500/20 text-blue-400'
                  )}
                >
                  {d.type === 'Validation N+1' ? '✓' : d.type === 'Substitution' ? '🔄' : d.type === 'Délégation' ? '🔑' : '⚖️'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('font-mono text-[10px]', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                      {d.id}
                    </span>
                    <Badge
                      variant={d.status === 'executed' ? 'success' : d.status === 'pending' ? 'warning' : 'default'}
                      className="text-[9px]"
                    >
                      {d.status}
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold truncate">
                    {d.type}: {d.subject}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Par {d.author} • {d.date}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </DashboardCard>
      </section>

      {/* SECTION 5: Indicateurs Temps Réel */}
      <section>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span>📈</span>
          <span>Indicateurs Temps Réel</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <DashboardCard title="Taux validation" icon="✅" href="/maitre-ouvrage/analytics" borderColor="#10B981">
            <p className="text-2xl font-bold text-emerald-400 text-center">{liveStats.tauxValidation}%</p>
          </DashboardCard>

          <DashboardCard title="Temps moyen réponse" icon="⏱️" href="/maitre-ouvrage/analytics" borderColor="#3B82F6">
            <p className="text-2xl font-bold text-blue-400 text-center">{liveStats.tempsReponse}</p>
          </DashboardCard>

          <DashboardCard
            title="Validations aujourd'hui"
            icon="📊"
            href="/maitre-ouvrage/analytics?period=today"
            borderColor="#3B82F6"
          >
            <p className="text-2xl font-bold text-blue-400 text-center">{liveStats.validationsJour}</p>
          </DashboardCard>

          <DashboardCard title="Montant traité" icon="💰" href="/maitre-ouvrage/finances" borderColor="#3B82F6">
            <p className={cn('text-lg font-bold text-center', darkMode ? 'text-slate-200' : 'text-gray-800')}>
              {liveStats.montantTraite}
            </p>
            <p className="text-[10px] text-slate-400 text-center mt-1">FCFA</p>
          </DashboardCard>
        </div>
      </section>

      {/* Palette de commandes (Ctrl/⌘+K) */}
      {cmdOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-xl">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">⌘K — Commandes rapides</p>
                  <p className="text-xs text-slate-400">Astuce : tape "/" pour focus la recherche</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => setCmdOpen(false)}>
                  Fermer
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-2">
                <CmdItem label="⚡ Substitutions" hint="Blocages & délégations" onClick={() => router.push('/maitre-ouvrage/substitution')} />
                <CmdItem label="💳 Validation paiements" hint="Urgences & retards" onClick={() => router.push('/maitre-ouvrage/validation-paiements')} />
                <CmdItem label="📜 Signature contrats" hint="Double contrôle BJ" onClick={() => router.push('/maitre-ouvrage/validation-contrats')} />
                <CmdItem label="⚠️ Alertes" hint="Risques système" onClick={() => router.push('/maitre-ouvrage/alerts')} />
                <CmdItem label="⚖️ Décisions" hint="Historique & statut" onClick={() => router.push('/maitre-ouvrage/decisions')} />
                <CmdItem label="📈 Analytics" hint="SLA & tendances" onClick={() => router.push('/maitre-ouvrage/analytics')} />
              </div>

              <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400">
                <span>Entrée : recherche globale</span>
                <span>ESC : fermer</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function CmdItem({ label, hint, onClick }: { label: string; hint: string; onClick: () => void }) {
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
