'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { arbitragesVivants, coordinationStats, arbitrages, bureauxGovernance } from '@/lib/data';

export default function ArbitragesVivantsPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const searchParams = useSearchParams();
  const [mainTab, setMainTab] = useState<'arbitrages' | 'bureaux'>('arbitrages');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'bureaux') {
      setMainTab('bureaux');
    }
  }, [searchParams]);
  const [filter, setFilter] = useState<'all' | 'ouverts' | 'tranche' | 'pending' | 'resolved'>('all');
  const [selectedArbitrage, setSelectedArbitrage] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'vivant' | 'simple' | null>(null);
  const [viewTab, setViewTab] = useState<'contexte' | 'options' | 'parties' | 'documents'>('contexte');
  const [selectedBureau, setSelectedBureau] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Combiner les deux sources de données
  const allArbitrages = useMemo(() => {
    const vivants = arbitragesVivants.map(a => ({ ...a, _type: 'vivant' as const }));
    const simples = arbitrages.map(a => ({ ...a, _type: 'simple' as const }));
    return [...vivants, ...simples];
  }, []);

  const filteredArbitrages = allArbitrages.filter(a => {
    if (filter === 'ouverts') return a._type === 'vivant' && ['ouvert', 'en_deliberation', 'decision_requise'].includes(a.status);
    if (filter === 'tranche') return a._type === 'vivant' && a.status === 'tranche';
    if (filter === 'pending') return a._type === 'simple' && a.status === 'pending';
    if (filter === 'resolved') return a._type === 'simple' && a.status === 'resolved';
    return true;
  });

  // Stats combinées
  const stats = useMemo(() => {
    const vivantsStats = coordinationStats.arbitrages;
    const simplesStats = {
      total: arbitrages.length,
      pending: arbitrages.filter(a => a.status === 'pending').length,
      resolved: arbitrages.filter(a => a.status === 'resolved').length,
      urgent: arbitrages.filter(a => a.deadline && new Date(a.deadline.split('/').reverse().join('-')) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)).length,
    };
    return {
      ...vivantsStats,
      simplesTotal: simplesStats.total,
      simplesPending: simplesStats.pending,
      simplesResolved: simplesStats.resolved,
      simplesUrgent: simplesStats.urgent,
    };
  }, []);

  const selected = selectedArbitrage 
    ? (selectedType === 'vivant' 
        ? arbitragesVivants.find(a => a.id === selectedArbitrage)
        : arbitrages.find(a => a.id === selectedArbitrage))
    : null;

  const handleTrancher = (arb: typeof selected, optionId?: string) => {
    if (!arb) return;
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'arbitrages-vivants',
      action: 'validation',
      targetId: arb.id,
      targetType: 'ArbitrageVivant',
      details: `Arbitrage tranché: ${arb.subject}${optionId ? ` - Option ${optionId}` : ''}`,
    });
    addToast('Arbitrage tranché - Décision enregistrée au registre avec hash SHA3-256', 'success');
  };

  const handlePostpone = (arb: any) => {
    if (!arb) return;
    const isVivant = '_type' in arb ? arb._type === 'vivant' : selectedType === 'vivant';
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: isVivant ? 'arbitrages-vivants' : 'arbitrages',
      action: 'modification',
      targetId: arb.id,
      targetType: isVivant ? 'ArbitrageVivant' : 'Arbitration',
      details: `Report arbitrage: ${arb.subject}`,
    });
    addToast('Report enregistré avec justification obligatoire', 'warning');
  };

  const handleRequestComplement = (arb: any) => {
    if (!arb) return;
    const isVivant = '_type' in arb ? arb._type === 'vivant' : selectedType === 'vivant';
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: isVivant ? 'arbitrages-vivants' : 'arbitrages',
      action: 'modification',
      targetId: arb.id,
      targetType: isVivant ? 'ArbitrageVivant' : 'Arbitration',
      details: `Demande complément: ${arb.subject}`,
    });
    addToast('Demande de complément envoyée aux parties', 'info');
  };

  const handleScheduleHearing = (arb: typeof selected) => {
    if (!arb) return;
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

  // Stats bureaux
  const bureauxStats = useMemo(() => {
    const totalAgents = bureauxGovernance.reduce((acc, b) => acc + b.agents, 0);
    const avgCharge = Math.round(bureauxGovernance.reduce((acc, b) => acc + b.charge, 0) / bureauxGovernance.length);
    const avgCompletion = Math.round(bureauxGovernance.reduce((acc, b) => acc + b.completion, 0) / bureauxGovernance.length);
    const bureauxSurcharge = bureauxGovernance.filter(b => b.charge > 85).length;
    const totalGoulots = bureauxGovernance.reduce((acc, b) => acc + b.goulots.length, 0);
    return { totalAgents, avgCharge, avgCompletion, bureauxSurcharge, totalGoulots };
  }, []);

  const selectedB = selectedBureau ? bureauxGovernance.find(b => b.code === selectedBureau) : null;

  const handleAdjustResponsibilities = (bureau: typeof selectedB) => {
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

  const handleReportBottleneck = (bureau: typeof selectedB, goulot: string) => {
    if (!bureau) return;
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

  const getRiskColor = (risk: string) => {
    const colors: Record<string, string> = { faible: 'emerald', modere: 'amber', eleve: 'orange', critique: 'red' };
    return colors[risk] || 'slate';
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🎯 Gouvernance & Décisions
            {mainTab === 'arbitrages' && <Badge variant="urgent">{stats.ouverts} en cours</Badge>}
            {mainTab === 'bureaux' && <Badge variant="info">{bureauxGovernance.length} bureaux</Badge>}
          </h1>
          <p className="text-sm text-slate-400">
            {mainTab === 'arbitrages' ? 'Cellules de crise immersives - Décisions DG avec chronomètre et options IA' : 'Charge, complétion, budget et traçabilité par bureau'}
          </p>
        </div>
      </div>

      {/* Onglets principaux */}
      <div className="flex gap-2 border-b border-slate-700/50 pb-2">
        <Button 
          variant={mainTab === 'arbitrages' ? 'default' : 'ghost'} 
          onClick={() => {
            setMainTab('arbitrages');
            setSelectedArbitrage(null);
            setSelectedBureau(null);
          }}
        >
          ⚔️ Arbitrages
        </Button>
        <Button 
          variant={mainTab === 'bureaux' ? 'default' : 'ghost'} 
          onClick={() => {
            setMainTab('bureaux');
            setSelectedArbitrage(null);
            setSelectedBureau(null);
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
              <h3 className="font-bold text-red-400">Pas une file de tickets - Une scène immersive</h3>
              <p className="text-sm text-slate-400">Contexte complet, parties prenantes RACI, options suggérées par IA, chronomètre décisionnel. Chaque décision → registre + hash SHA3-256.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info décision majeure */}
      <Card className="bg-purple-500/10 border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚖️</span>
            <div className="flex-1">
              <h3 className="font-bold text-purple-400">Décision majeure</h3>
              <p className="text-sm text-slate-400">Chaque arbitrage génère une entrée au registre des décisions + justification hashée</p>
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

      {/* Alerte urgents (arbitrages simples) */}
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
          <Button key={f.id} size="sm" variant={filter === f.id ? 'default' : 'secondary'} onClick={() => setFilter(f.id as typeof filter)}>{f.label}</Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Liste arbitrages */}
        <div className="lg:col-span-2 space-y-3">
          {filteredArbitrages.map((arb) => {
            const isSelected = selectedArbitrage === arb.id;
            const isVivant = arb._type === 'vivant';
            const riskColor = isVivant ? getRiskColor(arb.context.riskLevel) : null;
            const impactColor = !isVivant && 'impact' in arb ? (arb.impact === 'critical' ? 'red' : arb.impact === 'high' ? 'orange' : arb.impact === 'medium' ? 'amber' : 'emerald') : null;
            const isUrgent = !isVivant && 'deadline' in arb && arb.deadline && new Date(arb.deadline.split('/').reverse().join('-')) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
            
            return (
              <Card
                key={arb.id}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected ? 'ring-2 ring-red-500' : 'hover:border-red-500/50',
                  isVivant && arb.context.riskLevel === 'critique' && 'border-l-4 border-l-red-500',
                  isVivant && arb.context.riskLevel === 'eleve' && 'border-l-4 border-l-orange-500',
                  !isVivant && impactColor && `border-l-4 border-l-${impactColor}-500`,
                  arb.status === 'tranche' || (!isVivant && arb.status === 'resolved') && 'border-l-4 border-l-emerald-500 opacity-80',
                )}
                onClick={() => {
                  setSelectedArbitrage(arb.id);
                  setSelectedType(arb._type);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {isVivant && <span className="text-lg">{getTypeIcon(arb.type)}</span>}
                        <span className="font-mono text-xs text-purple-400">{arb.id}</span>
                        {isVivant ? (
                          <>
                            <Badge variant={arb.status === 'decision_requise' ? 'urgent' : arb.status === 'tranche' ? 'success' : 'warning'}>{arb.status.replace('_', ' ')}</Badge>
                            <Badge variant={arb.context.riskLevel === 'critique' ? 'urgent' : arb.context.riskLevel === 'eleve' ? 'warning' : 'default'}>Risque: {arb.context.riskLevel}</Badge>
                          </>
                        ) : (
                          <>
                            <Badge variant={arb.status === 'pending' ? 'warning' : 'success'}>{arb.status}</Badge>
                            {'impact' in arb && <Badge variant={arb.impact === 'critical' ? 'urgent' : arb.impact === 'high' ? 'warning' : 'default'}>Impact: {arb.impact}</Badge>}
                            {isUrgent && arb.status === 'pending' && <Badge variant="urgent" pulse>Urgent</Badge>}
                          </>
                        )}
                      </div>
                      <h3 className="font-bold mt-1">{arb.subject}</h3>
                    </div>
                    {/* Chronomètre (vivants) ou Échéance (simples) */}
                    {isVivant && arb.status !== 'tranche' && (
                      <div className={cn("p-2 rounded text-center", arb.timing.isOverdue ? "bg-red-500/20" : arb.timing.daysRemaining <= 1 ? "bg-amber-500/20" : "bg-slate-700/30")}>
                        <p className={cn("text-2xl font-bold", arb.timing.isOverdue ? "text-red-400" : arb.timing.daysRemaining <= 1 ? "text-amber-400" : "text-slate-300")}>
                          {arb.timing.isOverdue ? '⏰' : arb.timing.daysRemaining}
                        </p>
                        <p className="text-[10px] text-slate-400">{arb.timing.isOverdue ? 'En retard' : 'jour(s)'}</p>
                      </div>
                    )}
                    {!isVivant && 'deadline' in arb && arb.deadline && (
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Échéance</p>
                        <p className={cn("font-mono text-sm", isUrgent ? "text-red-400" : "text-slate-300")}>{arb.deadline}</p>
                      </div>
                    )}
                  </div>

                  {/* Contexte (vivants) ou Résolution (simples) */}
                  {isVivant ? (
                    <>
                      <div className="p-2 rounded bg-slate-700/30 mb-3">
                        <p className="text-xs text-slate-400">🔗 {arb.context.linkedEntity.type}: {arb.context.linkedEntity.label}</p>
                        {arb.context.financialExposure && (
                          <p className="text-sm font-bold text-amber-400 mt-1">💰 Exposition: {formatMoney(arb.context.financialExposure)}</p>
                        )}
                      </div>

                      {/* Parties */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {arb.parties.slice(0, 3).map((p) => (
                          <Badge key={p.employeeId} variant={p.role === 'decideur' ? 'info' : p.role === 'demandeur' ? 'warning' : p.role === 'defendeur' ? 'default' : 'default'}>
                            {p.role}: {p.name}
                          </Badge>
                        ))}
                        {arb.parties.length > 3 && <Badge variant="default">+{arb.parties.length - 3}</Badge>}
                      </div>

                      {/* Options de décision preview */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-slate-400">Options:</span>
                        {arb.decisionOptions.slice(0, 2).map((opt) => (
                          <Badge key={opt.id} variant="default">
                            {opt.suggestedBy === 'ia' && '🤖'} {opt.label.substring(0, 20)}...
                          </Badge>
                        ))}
                        {arb.decisionOptions.length > 2 && <Badge variant="info">+{arb.decisionOptions.length - 2}</Badge>}
                      </div>

                      {/* Décision prise */}
                      {arb.decision && (
                        <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 mb-3">
                          <p className="text-xs text-emerald-400 mb-1">✓ Décision du {new Date(arb.decision.decidedAt).toLocaleDateString('fr-FR')}</p>
                          <p className="text-sm font-medium">{arb.decision.motif}</p>
                          <p className="text-xs text-slate-400 mt-1">Par {arb.decision.decidedBy} → {arb.decision.decisionId}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Résolution (simples) */}
                      {'resolution' in arb && arb.resolution && (
                        <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 mb-3">
                          <p className="text-xs text-emerald-400">✓ Résolution</p>
                          <p className="text-sm">{arb.resolution}</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Actions */}
                  {((isVivant && arb.status !== 'tranche') || (!isVivant && arb.status === 'pending')) && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                      <Button size="sm" variant="success" onClick={(e) => { e.stopPropagation(); handleTrancher(arb); }}>⚖️ Trancher</Button>
                      <Button size="sm" variant="info" onClick={(e) => { e.stopPropagation(); handleRequestComplement(arb); }}>📋 Complément</Button>
                      <Button size="sm" variant="warning" onClick={(e) => { e.stopPropagation(); handlePostpone(arb); }}>📅 Reporter</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Panel détail immersif */}
        <div className="lg:col-span-1">
          {selected ? (
            <Card className="sticky top-4">
              <CardContent className="p-4">
                {selectedType === 'vivant' ? (
                  <>
                    {/* Header immersif (vivants) */}
                    <div className={cn("mb-4 p-4 rounded-lg", `bg-${getRiskColor(selected.context.riskLevel)}-500/10 border border-${getRiskColor(selected.context.riskLevel)}-500/30`)}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getTypeIcon(selected.type)}</span>
                          <Badge variant={selected.status === 'tranche' ? 'success' : 'urgent'}>{selected.status.replace('_', ' ')}</Badge>
                        </div>
                        {selected.status !== 'tranche' && (
                          <div className={cn("text-center px-3 py-1 rounded", selected.timing.isOverdue ? "bg-red-500/30" : "bg-slate-700/50")}>
                            <p className={cn("text-xl font-bold", selected.timing.isOverdue ? "text-red-400" : "text-white")}>
                              {selected.timing.isOverdue ? '⏰ RETARD' : `${selected.timing.daysRemaining}j`}
                            </p>
                          </div>
                        )}
                      </div>
                      <span className="font-mono text-xs">{selected.id}</span>
                      <h3 className="font-bold">{selected.subject}</h3>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Header simple */}
                    <div className="mb-4 pb-4 border-b border-slate-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={selected.status === 'pending' ? 'warning' : 'success'}>{selected.status}</Badge>
                        {'impact' in selected && <Badge variant={selected.impact === 'critical' ? 'urgent' : selected.impact === 'high' ? 'warning' : 'default'}>Impact: {selected.impact}</Badge>}
                      </div>
                      <span className="font-mono text-xs text-purple-400">{selected.id}</span>
                      <h3 className="font-bold">{selected.subject}</h3>
                    </div>
                  </>
                )}

                {selectedType === 'vivant' ? (
                  <>
                    {/* Onglets (vivants) */}
                    <div className="flex gap-1 mb-4 flex-wrap">
                      <Button size="sm" variant={viewTab === 'contexte' ? 'default' : 'secondary'} onClick={() => setViewTab('contexte')}>📋 Contexte</Button>
                      <Button size="sm" variant={viewTab === 'options' ? 'default' : 'secondary'} onClick={() => setViewTab('options')}>💡 Options ({selected.decisionOptions.length})</Button>
                      <Button size="sm" variant={viewTab === 'parties' ? 'default' : 'secondary'} onClick={() => setViewTab('parties')}>👥 Parties ({selected.parties.length})</Button>
                      <Button size="sm" variant={viewTab === 'documents' ? 'default' : 'secondary'} onClick={() => setViewTab('documents')}>📎 Docs ({selected.documents.length})</Button>
                    </div>

                    <div className="space-y-3 max-h-72 overflow-y-auto">
                  {viewTab === 'contexte' && (
                    <>
                      <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                        <p className="text-xs text-slate-400 mb-1">Contexte</p>
                        <p className="text-sm">{selected.context.backgroundSummary}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className={cn("p-2 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                          <p className="text-xs text-slate-400">Risque</p>
                          <Badge variant={selected.context.riskLevel === 'critique' ? 'urgent' : 'warning'}>{selected.context.riskLevel}</Badge>
                        </div>
                        {selected.context.financialExposure && (
                          <div className={cn("p-2 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                            <p className="text-xs text-slate-400">Exposition</p>
                            <p className="text-sm font-bold text-amber-400">{formatMoney(selected.context.financialExposure)}</p>
                          </div>
                        )}
                      </div>
                      {selected.context.previousAttempts && selected.context.previousAttempts.length > 0 && (
                        <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                          <p className="text-xs text-slate-400 mb-1">Tentatives précédentes</p>
                          {selected.context.previousAttempts.map((att, idx) => (
                            <p key={idx} className="text-xs text-red-400">✗ {att}</p>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {viewTab === 'options' && (
                    selected.decisionOptions.map((opt) => (
                      <div key={opt.id} className={cn("p-3 rounded border", darkMode ? "bg-slate-700/30" : "bg-gray-100", opt.suggestedBy === 'ia' && "border-purple-500/30")}>
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
                            {opt.pros.slice(0, 2).map((p, idx) => <p key={idx} className="text-slate-300">• {p}</p>)}
                          </div>
                          <div>
                            <p className="text-red-400">✗ Contre:</p>
                            {opt.cons.slice(0, 2).map((c, idx) => <p key={idx} className="text-slate-300">• {c}</p>)}
                          </div>
                        </div>
                        {selected.status !== 'tranche' && (
                          <Button size="sm" variant="success" className="w-full mt-2" onClick={() => handleTrancher(selected, opt.id)}>
                            Choisir cette option
                          </Button>
                        )}
                      </div>
                    ))
                  )}

                  {viewTab === 'parties' && (
                    selected.parties.map((p) => (
                      <div key={p.employeeId} className={cn("p-2 rounded text-xs", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{p.name}</span>
                          <div className="flex gap-1">
                            <Badge variant={p.role === 'decideur' ? 'info' : p.role === 'demandeur' ? 'warning' : 'default'}>{p.role}</Badge>
                            {p.raciRole && <Badge variant="default">{p.raciRole}</Badge>}
                          </div>
                        </div>
                        <p className="text-slate-400">{p.bureau}</p>
                        {p.position && <p className="text-slate-300 mt-1">"{p.position}"</p>}
                      </div>
                    ))
                  )}

                  {viewTab === 'documents' && (
                    selected.documents.map((doc) => (
                      <div key={doc.id} className={cn("p-2 rounded text-xs flex items-center gap-2", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                        <span>📄</span>
                        <div className="flex-1">
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-slate-400">{doc.type} • {doc.uploadedBy}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                    {/* Décision finale (vivants) */}
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

                    {/* Actions DG (vivants) */}
                    {selected.status !== 'tranche' && (
                      <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-700/50">
                        <Button size="sm" variant="success" onClick={() => handleTrancher(selected)}>⚖️ Trancher (décision libre)</Button>
                        <Button size="sm" variant="info" onClick={() => handleScheduleHearing(selected)}>📹 Planifier audition</Button>
                        <Button size="sm" variant="warning" onClick={() => handlePostpone(selected)}>📅 Reporter avec justification</Button>
                        <Button size="sm" variant="default" onClick={() => handleRequestComplement(selected)}>📋 Demander complément</Button>
                      </div>
                    )}

                    {/* Hash arbitrage (vivants) */}
                    <div className="mt-3 p-2 rounded bg-purple-500/10 border border-purple-500/30">
                      <p className="text-[10px] text-purple-400">🔐 Hash arbitrage</p>
                      <p className="font-mono text-[10px] truncate">{selected.hash}</p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Détails simples */}
                    <div className="space-y-3 text-sm">
                      {'deadline' in selected && selected.deadline && (
                        <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                          <p className="text-xs text-slate-400 mb-1">Échéance</p>
                          <p className="font-mono">{selected.deadline}</p>
                        </div>
                      )}

                      {'description' in selected && (
                        <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                          <p className="text-xs text-slate-400 mb-1">Description</p>
                          <p className="text-sm">{selected.description}</p>
                        </div>
                      )}

                      {'parties' in selected && Array.isArray(selected.parties) && (
                        <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                          <p className="text-xs text-slate-400 mb-1">Parties</p>
                          <div className="flex flex-wrap gap-2">
                            {selected.parties.map((p, idx) => (
                              <Badge key={idx} variant="default">{p}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {'requestedBy' in selected && (
                        <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                          <p className="text-xs text-slate-400 mb-1">Demandé par</p>
                          <p className="text-sm">{selected.requestedBy}</p>
                        </div>
                      )}

                      {'resolution' in selected && selected.resolution && (
                        <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30">
                          <p className="text-xs text-emerald-400 mb-1">Résolution</p>
                          <p className="text-sm">{selected.resolution}</p>
                        </div>
                      )}

                      {/* Workflow (simples) */}
                      <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                        <p className="text-xs text-slate-400 mb-1">Workflow</p>
                        <ol className="space-y-2 text-xs">
                          <li className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs">✓</span>
                            <span>Demande créée</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-white text-xs", selected.status === 'resolved' ? "bg-emerald-500" : "bg-amber-500")}>
                              {selected.status === 'resolved' ? '✓' : '2'}
                            </span>
                            <span>Analyse & délibération</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-white text-xs", selected.status === 'resolved' ? "bg-emerald-500" : "bg-slate-500")}>
                              {selected.status === 'resolved' ? '✓' : '3'}
                            </span>
                            <span>Décision hashée</span>
                          </li>
                        </ol>
                      </div>
                    </div>

                    {/* Actions (simples) */}
                    {selected.status === 'pending' && (
                      <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-700/50">
                        <Button size="sm" variant="success" onClick={() => handleTrancher(selected)}>⚖️ Trancher</Button>
                        <Button size="sm" variant="info" onClick={() => handleRequestComplement(selected)}>📋 Demander complément</Button>
                        <Button size="sm" variant="warning" onClick={() => handlePostpone(selected)}>📅 Reporter</Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4"><CardContent className="p-8 text-center"><span className="text-4xl mb-4 block">⚔️</span><p className="text-slate-400">Sélectionnez un arbitrage</p></CardContent></Card>
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
        <Card className={cn(bureauxStats.avgCharge > 80 ? "bg-red-500/10 border-red-500/30" : "bg-emerald-500/10 border-emerald-500/30")}>
          <CardContent className="p-3 text-center">
            <p className={cn("text-2xl font-bold", bureauxStats.avgCharge > 80 ? "text-red-400" : "text-emerald-400")}>{bureauxStats.avgCharge}%</p>
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
          {bureauxGovernance.map((bureau) => {
            const isSelected = selectedBureau === bureau.code;
            const isOverloaded = bureau.charge > 85;
            const hasGoulots = bureau.goulots.length > 0;
            
            return (
              <Card
                key={bureau.code}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected ? 'ring-2 ring-blue-500' : 'hover:border-blue-500/50',
                  isOverloaded && 'border-l-4 border-l-red-500',
                  hasGoulots && !isOverloaded && 'border-l-4 border-l-amber-500',
                )}
                onClick={() => setSelectedBureau(bureau.code)}
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
                      <p className="text-sm text-slate-400 mt-1">Responsable: <span className="text-slate-300">{bureau.head}</span></p>
                    </div>
                    <p className="text-sm text-slate-400">{bureau.agents} agents</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Charge</span>
                        <span className={cn("font-mono", bureau.charge > 85 ? "text-red-400" : bureau.charge > 70 ? "text-amber-400" : "text-emerald-400")}>{bureau.charge}%</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className={cn("h-full transition-all", bureau.charge > 85 ? "bg-red-500" : bureau.charge > 70 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${bureau.charge}%` }} />
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
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleReportBottleneck(bureau, goulot); }}>Remonter</Button>
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
          })}
        </div>

        <div className="lg:col-span-1">
          {selectedB ? (
            <Card className="sticky top-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700/50">
                  <div>
                    <Badge variant="info" className="mb-2">{selectedB.code}</Badge>
                    <h3 className="font-bold">{selectedB.name}</h3>
                    <p className="text-sm text-slate-400">{selectedB.head}</p>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <Button size="sm" variant={!showHistory ? 'default' : 'secondary'} onClick={() => setShowHistory(false)}>Infos</Button>
                  <Button size="sm" variant={showHistory ? 'default' : 'secondary'} onClick={() => setShowHistory(true)}>Historique ({selectedB.history.length})</Button>
                </div>

                {!showHistory ? (
                  <div className="space-y-3 text-sm">
                    <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                      <div className="grid grid-cols-2 gap-2">
                        <div><p className="text-xs text-slate-400">Agents</p><p className="font-bold">{selectedB.agents}</p></div>
                        <div><p className="text-xs text-slate-400">Charge</p><p className={cn("font-bold", selectedB.charge > 85 ? "text-red-400" : "text-emerald-400")}>{selectedB.charge}%</p></div>
                        <div><p className="text-xs text-slate-400">Complétion</p><p className="font-bold text-blue-400">{selectedB.completion}%</p></div>
                        <div><p className="text-xs text-slate-400">Goulots</p><p className={cn("font-bold", selectedB.goulots.length > 0 ? "text-amber-400" : "text-emerald-400")}>{selectedB.goulots.length}</p></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs mb-2">📐 Activités RACI (R/A)</h4>
                      <div className="flex flex-wrap gap-1">{selectedB.raciActivities.map((act, idx) => <Badge key={idx} variant="default">{act}</Badge>)}</div>
                    </div>
                    <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                      <h4 className="font-bold text-xs mb-2">💰 Budget</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between"><span className="text-slate-400">Alloué</span><span className="font-mono">{selectedB.budget} FCFA</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Utilisé</span><span className="font-mono text-emerald-400">{selectedB.budgetUsed} FCFA</span></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {selectedB.history.length > 0 ? selectedB.history.map((entry) => (
                      <div key={entry.id} className={cn("p-2 rounded text-xs", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={entry.action === 'responsable_change' ? 'warning' : entry.action === 'budget_adjust' ? 'info' : entry.action === 'agent_add' ? 'success' : 'default'}>{entry.action.replace('_', ' ')}</Badge>
                          <span className="text-slate-400">{entry.date}</span>
                        </div>
                        <p>{entry.description}</p>
                        <p className="text-slate-400 mt-1">Par: {entry.author}</p>
                        {entry.previousValue && <p className="text-slate-500">{entry.previousValue} → {entry.newValue}</p>}
                      </div>
                    )) : <p className="text-slate-400 text-center py-4">Aucun historique</p>}
                  </div>
                )}

                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-700/50">
                  <Button size="sm" variant="default" onClick={() => handleAdjustResponsibilities(selectedB)}>⚙️ Ajuster responsabilités</Button>
                  <Button size="sm" variant="info" onClick={() => addToast(`RACI: ${selectedB.raciActivities.length} activités liées`, 'info')}>📐 Voir RACI</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4"><CardContent className="p-8 text-center"><span className="text-4xl mb-4 block">🏢</span><p className="text-slate-400">Sélectionnez un bureau</p></CardContent></Card>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
}
