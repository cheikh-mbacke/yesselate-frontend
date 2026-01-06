'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/features/bmo/KPICard';
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

  // Top risques combinés (systemAlerts critiques + blockedDossiers)
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

  // 3 actions les plus rentables maintenant
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
    }> = [];

    // 1. Dossiers bloqués > 5 jours (priorité max)
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
      });
    }

    // 2. Paiements proches échéance (< 5 jours)
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
      });
    }

    // 3. Contrats à signer
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

  return (
    <div className="space-y-4">
      {/* Alerte critique si dossiers bloqués > 5 jours */}
      {blockedDossiers.filter((d) => d.delay >= 5).length > 0 && (
        <div
          className={cn(
            'rounded-xl p-3 flex items-center gap-3 border animate-pulse',
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

      {/* KPIs globaux (demandes, validations, rejets, budget) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard
          icon="📋"
          label="Demandes"
          value={animatedKPIs.demandes}
          trend="Total annuel"
          color="#3B82F6"
        />
        <KPICard
          icon="✅"
          label="Validations"
          value={animatedKPIs.validations}
          trend={`${((animatedKPIs.validations / (animatedKPIs.demandes || 1)) * 100).toFixed(1)}% taux`}
          up={true}
          color="#10B981"
        />
        <KPICard
          icon="❌"
          label="Rejets"
          value={animatedKPIs.rejets}
          trend={`${((animatedKPIs.rejets / (animatedKPIs.demandes || 1)) * 100).toFixed(1)}% taux`}
          up={false}
          color="#EF4444"
        />
        <KPICard
          icon="💰"
          label="Budget traité"
          value={`${animatedKPIs.budget}Mds`}
          sub="FCFA"
          trend="Cumul annuel"
          color="#D4AF37"
        />
      </div>

      {/* Ligne principale: Santé organisationnelle + Top risques */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Santé organisationnelle (répartition par bureaux) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              🏢 Santé organisationnelle
              <Badge variant="info">{bureaux.length} bureaux</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {/* Pie Chart */}
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
              {/* Liste bureaux avec indicateur santé */}
              <div className="flex-1 grid grid-cols-2 gap-1">
                {bureauHealth.map((bureau) => (
                  <div
                    key={bureau.code}
                    className={cn(
                      'flex items-center gap-2 p-1.5 rounded text-xs',
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
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top risques */}
        <Card className="border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              ⚠️ Top risques
              <Badge variant="warning">{topRisques.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topRisques.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                ✅ Aucun risque critique détecté
              </p>
            ) : (
              topRisques.map((risque, i) => (
                <div
                  key={risque.id}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-lg border-l-4',
                    risque.severity === 'critical'
                      ? 'border-l-red-500 bg-red-500/5'
                      : 'border-l-amber-500 bg-amber-500/5'
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
                  {risque.type === 'blocked' && risque.dossier && (
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => openBlocageModal(risque.dossier!)}
                    >
                      👁️
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3 actions les plus rentables maintenant */}
      <Card className="border-orange-500/30 bg-gradient-to-r from-orange-500/5 to-amber-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            ⚡ 3 actions les plus rentables maintenant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            {actionsRentables.length === 0 ? (
              <p className="text-xs text-slate-400 col-span-3 text-center py-4">
                ✅ Aucune action urgente requise
              </p>
            ) : (
              actionsRentables.map((action, i) => (
                <div
                  key={action.id}
                  className={cn(
                    'p-3 rounded-lg border',
                    action.urgency === 'critical'
                      ? 'border-red-500/50 bg-red-500/10'
                      : action.urgency === 'high'
                      ? 'border-amber-500/50 bg-amber-500/10'
                      : 'border-blue-500/50 bg-blue-500/10'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xl">{action.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">#{i + 1}</span>
                        <Badge
                          variant={
                            action.urgency === 'critical'
                              ? 'urgent'
                              : action.urgency === 'high'
                              ? 'warning'
                              : 'info'
                          }
                        >
                          {action.urgency}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold mt-1">{action.title}</p>
                      <p className="text-[10px] text-slate-400">{action.subtitle}</p>
                      {action.amount && action.amount !== '—' && (
                        <p className="text-xs font-mono text-amber-400 mt-1">
                          {action.amount} FCFA
                        </p>
                      )}
                    </div>
                  </div>
                  <Link href={action.link}>
                    <Button
                      size="sm"
                      variant={action.urgency === 'critical' ? 'destructive' : 'warning'}
                      className="w-full mt-2"
                    >
                      Traiter →
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline des décisions avec preuves */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              ⚖️ Timeline des décisions
              <Badge variant="info">{decisions.length}</Badge>
            </span>
            <Link href="/maitre-ouvrage/decisions">
              <Button size="xs" variant="ghost">
                Voir tout →
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {decisions.slice(0, 5).map((decision, i) => (
            <div
              key={decision.id}
              className={cn(
                'flex items-center gap-3 p-2 rounded-lg border-l-4',
                decision.status === 'executed'
                  ? 'border-l-emerald-500'
                  : decision.status === 'pending'
                  ? 'border-l-amber-500'
                  : 'border-l-slate-500',
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
                    : 'bg-purple-500/20 text-purple-400'
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
                  <span className="font-mono text-[10px] text-orange-400">{decision.id}</span>
                  <Badge
                    variant={
                      decision.status === 'executed'
                        ? 'success'
                        : decision.status === 'pending'
                        ? 'warning'
                        : 'default'
                    }
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
              <div className="text-right">
                {/* Hash de preuve */}
                <div
                  className={cn(
                    'px-2 py-1 rounded text-[9px] font-mono cursor-pointer',
                    darkMode ? 'bg-slate-700/50' : 'bg-gray-100'
                  )}
                  onClick={() => {
                    navigator.clipboard.writeText(decision.hash);
                    addToast('Hash copié dans le presse-papier', 'success');
                  }}
                  title="Cliquer pour copier le hash"
                >
                  🔒 {decision.hash.slice(0, 12)}...
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Stats temps réel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {liveStats.tauxValidation}%
            </p>
            <p className="text-[10px] text-slate-400">Taux validation</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">
              {liveStats.tempsReponse}
            </p>
            <p className="text-[10px] text-slate-400">Temps moyen réponse</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">
              {liveStats.validationsJour}
            </p>
            <p className="text-[10px] text-slate-400">Validations aujourd'hui</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-orange-400">
              {liveStats.montantTraite}
            </p>
            <p className="text-[10px] text-slate-400">Montant traité (FCFA)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
