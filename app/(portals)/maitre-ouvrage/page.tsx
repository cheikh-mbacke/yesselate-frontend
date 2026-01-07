'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
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

export default function DashboardPage() {
  const router = useRouter();
  const { darkMode } = useAppStore();
  const { liveStats, addToast, openSubstitutionModal, openBlocageModal } = useBMOStore();

  // Animation des KPIs
  const [animatedKPIs, setAnimatedKPIs] = useState({
    demandes: 0,
    validations: 0,
    rejets: 0,
    budget: 0,
  });

  // Calculs des totaux annuels
  const yearlyTotals = useMemo(() => {
    return performanceData.reduce(
      (acc, month) => ({
        demandes: acc.demandes + month.demandes,
        validations: acc.validations + month.validations,
        rejets: acc.rejets + month.rejets,
        budget: acc.budget + month.budget,
      }),
      { demandes: 0, validations: 0, rejets: 0, budget: 0 }
    );
  }, []);

  useEffect(() => {
    const targets = yearlyTotals;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const p = 1 - Math.pow(1 - step / 30, 3);
      setAnimatedKPIs({
        demandes: Math.round(targets.demandes * p),
        validations: Math.round(targets.validations * p),
        rejets: Math.round(targets.rejets * p),
        budget: parseFloat((targets.budget * p).toFixed(1)),
      });
      if (step >= 30) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, [yearlyTotals]);

  // Top risques combinés
  const topRisques = useMemo(() => {
    const alertsRisks = systemAlerts
      .filter((a) => a.type === 'critical' || a.type === 'warning')
      .map((a) => ({
        id: a.id,
        type: 'alert' as const,
        title: a.title,
        action: a.action,
        severity: a.type,
        source: 'Système',
      }));

    const blockedRisks = blockedDossiers
      .filter((d) => d.delay >= 5)
      .map((d) => ({
        id: d.id,
        type: 'blocked' as const,
        title: `${d.type} bloqué ${d.delay}j`,
        action: d.subject,
        severity: d.impact === 'critical' ? 'critical' : 'warning',
        source: d.bureau,
        dossier: d,
      }));

    return [...alertsRisks, ...blockedRisks].slice(0, 5);
  }, []);

  // Actions rentables
  const actionsRentables = useMemo(() => {
    const actions: Array<{
      id: string;
      type: string;
      title: string;
      subtitle: string;
      amount?: string;
      urgency: 'critical' | 'high' | 'medium';
      link: string;
      icon: string;
      params?: Record<string, string>;
    }> = [];

    const criticalBlocked = blockedDossiers.filter((d) => d.delay >= 5);
    if (criticalBlocked.length > 0) {
      const mostUrgent = criticalBlocked.sort((a, b) => b.delay - a.delay)[0];
      actions.push({
        id: mostUrgent.id,
        type: 'substitution',
        title: `Débloquer ${mostUrgent.id}`,
        subtitle: `${mostUrgent.subject} - Bloqué depuis ${mostUrgent.delay} jours`,
        amount: mostUrgent.amount,
        urgency: 'critical',
        link: '/maitre-ouvrage/substitution',
        icon: '🔄',
        params: { id: mostUrgent.id },
      });
    }

    const urgentPayments = paymentsN1.filter((p) => {
      const dueDate = new Date(p.dueDate.split('/').reverse().join('-'));
      const today = new Date();
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 5 && diffDays >= 0;
    });
    if (urgentPayments.length > 0) {
      actions.push({
        id: urgentPayments[0].id,
        type: 'paiement',
        title: `Valider ${urgentPayments.length} paiement(s) urgent(s)`,
        subtitle: `Échéance < 5 jours - ${urgentPayments[0].beneficiary}`,
        amount: urgentPayments[0].amount,
        urgency: 'high',
        link: '/maitre-ouvrage/validation-paiements',
        icon: '💳',
        params: { urgent: 'true' },
      });
    }

    if (contractsToSign.length > 0) {
      const pendingContracts = contractsToSign.filter((c) => c.status === 'pending');
      if (pendingContracts.length > 0) {
        actions.push({
          id: pendingContracts[0].id,
          type: 'contrat',
          title: `Signer ${pendingContracts.length} contrat(s)`,
          subtitle: pendingContracts[0].subject,
          amount: pendingContracts[0].amount,
          urgency: 'medium',
          link: '/maitre-ouvrage/validation-contrats',
          icon: '📜',
          params: { status: 'pending' },
        });
      }
    }

    return actions.slice(0, 3);
  }, []);

  // Santé organisationnelle par bureau
  const bureauHealth = useMemo(() => {
    return bureaux.map((b) => {
      const blockedCount = blockedDossiers.filter((d) => d.bureau === b.code).length;
      const health = blockedCount === 0 ? 'good' : blockedCount <= 1 ? 'warning' : 'critical';
      return {
        ...b,
        blockedCount,
        health,
      };
    });
  }, []);

  // Handlers pour navigation
  const handleRisqueClick = (risque: typeof topRisques[0]) => {
    if (risque.type === 'blocked' && risque.dossier) {
      openBlocageModal(risque.dossier);
    } else {
      router.push('/maitre-ouvrage/alerts');
    }
  };

  const handleBureauClick = (bureauCode: string) => {
    router.push(`/maitre-ouvrage/arbitrages-vivants?bureau=${bureauCode}`);
  };

  const buildUrl = (base: string, params?: Record<string, string>) => {
    if (!params) return base;
    const searchParams = new URLSearchParams(params);
    return `${base}?${searchParams.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Alerte critique */}
      {blockedDossiers.filter((d) => d.delay >= 5).length > 0 && (
        <div
          className={cn(
            'rounded-xl p-4 flex items-center gap-3 border animate-pulse',
            darkMode
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-red-50 border-red-200'
          )}
        >
          <span className="text-2xl">🚨</span>
          <div className="flex-1">
            <p className="font-bold text-sm text-red-400">
              {blockedDossiers.filter((d) => d.delay >= 5).length} dossier(s) bloqué(s) depuis plus de 5 jours
            </p>
            <p className="text-xs text-slate-400">
              Substitution requise pour débloquer la chaîne de validation
            </p>
          </div>
          <Link href="/maitre-ouvrage/substitution">
            <Button size="sm" variant="destructive">
              ⚡ Intervenir
            </Button>
          </Link>
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
          trend="Total annuel"
          color="#3B82F6"
            onClick={() => router.push('/maitre-ouvrage/demandes')}
        />
        <KPICard
          icon="✅"
          label="Validations"
          value={animatedKPIs.validations}
          trend={`${((animatedKPIs.validations / (animatedKPIs.demandes || 1)) * 100).toFixed(1)}% taux`}
          up={true}
          color="#10B981"
            onClick={() => router.push('/maitre-ouvrage/demandes?filter=validated')}
        />
        <KPICard
          icon="❌"
          label="Rejets"
          value={animatedKPIs.rejets}
          trend={`${((animatedKPIs.rejets / (animatedKPIs.demandes || 1)) * 100).toFixed(1)}% taux`}
          up={false}
          color="#EF4444"
            onClick={() => router.push('/maitre-ouvrage/demandes?filter=rejected')}
        />
        <KPICard
          icon="💰"
          label="Budget traité"
          value={`${animatedKPIs.budget}Mds`}
          sub="FCFA"
          trend="Cumul annuel"
          color="#D4AF37"
            onClick={() => router.push('/maitre-ouvrage/finances')}
        />
      </div>
      </section>

      {/* SECTION 2: Risques & Santé Organisationnelle */}
      <section>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span>⚠️</span>
          <span>Risques & Santé Organisationnelle</span>
        </h2>
      <div className="grid lg:grid-cols-2 gap-4">
          {/* Santé organisationnelle */}
          <DashboardCard
            title="Santé organisationnelle"
            subtitle="État des bureaux"
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
                    <Pie
                      data={bureauPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={45}
                      dataKey="value"
                    >
                      {bureauPieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-1">
                {bureauHealth.map((bureau) => (
                  <button
                    key={bureau.code}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBureauClick(bureau.code);
                    }}
                    className={cn(
                      'flex items-center gap-2 p-1.5 rounded text-xs transition-colors',
                      darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-100',
                      darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                    )}
                  >
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        bureau.health === 'good'
                          ? 'bg-emerald-500'
                          : bureau.health === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-red-500 animate-pulse'
                      )}
                    />
                    <span className="font-medium">{bureau.code}</span>
                    <span className="text-slate-400 text-[10px]">{bureau.completion}%</span>
                    {bureau.blockedCount > 0 && (
                      <Badge variant="urgent" className="ml-auto text-[9px]">
                        {bureau.blockedCount}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </DashboardCard>

        {/* Top risques */}
          <DashboardCard
            title="Top risques"
            subtitle="Risques critiques et dossiers bloqués"
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
                topRisques.map((risque) => (
                  <button
                  key={risque.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRisqueClick(risque);
                    }}
                  className={cn(
                      'w-full flex items-center gap-2 p-2 rounded-lg border-l-4 transition-colors',
                    risque.severity === 'critical'
                        ? 'border-l-red-500 bg-red-500/5 hover:bg-red-500/10'
                        : 'border-l-amber-500 bg-amber-500/5 hover:bg-amber-500/10'
                  )}
                >
                  <span className="text-lg">
                    {risque.severity === 'critical' ? '🚨' : '⚠️'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{risque.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">{risque.action}</p>
                  </div>
                  <BureauTag bureau={risque.source} />
                  </button>
                ))
                  )}
                </div>
          </DashboardCard>
      </div>
      </section>

      {/* SECTION 3: Actions Prioritaires */}
      <section>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span>⚡</span>
          <span>Actions Prioritaires</span>
        </h2>
        <DashboardCard
          title="3 actions les plus rentables maintenant"
          subtitle="Actions recommandées pour optimiser les résultats"
          icon="⚡"
          borderColor="#F97316"
        >
          <div className="grid md:grid-cols-3 gap-3">
            {actionsRentables.length === 0 ? (
              <p className="text-xs text-slate-400 col-span-3 text-center py-4">
                ✅ Aucune action urgente requise
              </p>
            ) : (
              actionsRentables.map((action, i) => (
                <Link
                  key={action.id}
                  href={buildUrl(action.link, action.params)}
                  className={cn(
                    'p-3 rounded-lg border transition-all hover:scale-[1.02]',
                    action.urgency === 'critical'
                      ? 'border-red-500/50 bg-red-500/10 hover:bg-red-500/20'
                      : action.urgency === 'high'
                      ? 'border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20'
                      : 'border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xl">{action.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold">#{i + 1}</span>
                        <Badge
                          variant={
                            action.urgency === 'critical'
                              ? 'urgent'
                              : action.urgency === 'high'
                              ? 'warning'
                              : 'info'
                          }
                          className="text-[9px]"
                        >
                          {action.urgency}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold">{action.title}</p>
                      <p className="text-[10px] text-slate-400">{action.subtitle}</p>
                      {action.amount && action.amount !== '—' && (
                        <p className={cn(
                          'text-xs font-mono mt-1',
                          darkMode ? 'text-slate-300' : 'text-gray-700'
                        )}>
                          {action.amount} FCFA
                        </p>
                      )}
                    </div>
                  </div>
                  </Link>
              ))
            )}
          </div>
        </DashboardCard>
      </section>

      {/* SECTION 4: Décisions & Timeline */}
      <section>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span>⚖️</span>
          <span>Décisions & Timeline</span>
        </h2>
        <DashboardCard
          title="Timeline des décisions"
          subtitle="Historique des décisions récentes"
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
            {decisions.slice(0, 5).map((decision) => (
              <Link
              key={decision.id}
                href={`/maitre-ouvrage/decisions?id=${decision.id}`}
              className={cn(
                  'flex items-center gap-3 p-2 rounded-lg border-l-4 transition-colors',
                decision.status === 'executed'
                    ? 'border-l-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10'
                  : decision.status === 'pending'
                    ? 'border-l-amber-500 bg-amber-500/5 hover:bg-amber-500/10'
                    : 'border-l-slate-500 bg-slate-500/5 hover:bg-slate-500/10',
                darkMode ? 'bg-slate-700/20' : 'bg-gray-50'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm',
                  decision.type === 'Validation N+1'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : decision.type === 'Substitution'
                    ? 'bg-orange-500/20 text-orange-400'
                    : decision.type === 'Délégation'
                    ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-blue-500/20 text-blue-400'
                )}
              >
                {decision.type === 'Validation N+1'
                  ? '✓'
                  : decision.type === 'Substitution'
                  ? '🔄'
                  : decision.type === 'Délégation'
                  ? '🔑'
                  : '⚖️'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className={cn(
                      'font-mono text-[10px]',
                      darkMode ? 'text-slate-400' : 'text-gray-500'
                    )}>
                      {decision.id}
                    </span>
                  <Badge
                    variant={
                      decision.status === 'executed'
                        ? 'success'
                        : decision.status === 'pending'
                        ? 'warning'
                        : 'default'
                    }
                      className="text-[9px]"
                  >
                    {decision.status}
                  </Badge>
                </div>
                <p className="text-xs font-semibold truncate">
                  {decision.type}: {decision.subject}
                </p>
                <p className="text-[10px] text-slate-400">
                  Par {decision.author} • {decision.date}
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
          <DashboardCard
            title="Taux validation"
            icon="✅"
            href="/maitre-ouvrage/analytics"
            borderColor="#10B981"
          >
            <p className="text-2xl font-bold text-emerald-400 text-center">
              {liveStats.tauxValidation}%
            </p>
          </DashboardCard>
          <DashboardCard
            title="Temps moyen réponse"
            icon="⏱️"
            href="/maitre-ouvrage/analytics"
            borderColor="#3B82F6"
          >
            <p className="text-2xl font-bold text-blue-400 text-center">
              {liveStats.tempsReponse}
            </p>
          </DashboardCard>
          <DashboardCard
            title="Validations aujourd'hui"
            icon="📊"
            href="/maitre-ouvrage/analytics?period=today"
            borderColor="#3B82F6"
          >
            <p className="text-2xl font-bold text-blue-400 text-center">
              {liveStats.validationsJour}
            </p>
          </DashboardCard>
          <DashboardCard
            title="Montant traité"
            icon="💰"
            href="/maitre-ouvrage/finances"
            borderColor="#3B82F6"
          >
            <p className={cn(
              'text-lg font-bold text-center',
              darkMode ? 'text-slate-200' : 'text-gray-800'
            )}>
              {liveStats.montantTraite}
            </p>
            <p className="text-[10px] text-slate-400 text-center mt-1">FCFA</p>
          </DashboardCard>
      </div>
      </section>
    </div>
  );
}
