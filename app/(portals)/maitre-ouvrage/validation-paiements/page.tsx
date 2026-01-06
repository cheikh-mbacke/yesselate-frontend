'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { paymentsN1, employees, projects } from '@/lib/data';
import type { Payment } from '@/lib/types/bmo.types';

// Utilitaire pour générer un hash SHA3-256 simulé
const generateSHA3Hash = (data: string): string => {
  let hash = 0;
  const timestamp = Date.now();
  const combined = `${data}-${timestamp}`;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hexHash = Math.abs(hash).toString(16).padStart(16, '0');
  return `SHA3-256:${hexHash}${Math.random().toString(16).slice(2, 10)}`;
};

// Calculer les jours avant échéance
const getDaysToDue = (dueDateStr: string): number => {
  const [day, month, year] = dueDateStr.split('/').map(Number);
  const dueDate = new Date(year, month - 1, day);
  const today = new Date();
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Parser le montant string en number
const parseAmount = (amountStr: string): number => {
  return parseFloat(amountStr.replace(/[,\s]/g, '')) || 0;
};

// Seuil critique pour double validation
const DOUBLE_VALIDATION_THRESHOLD = 5000000; // 5M FCFA

type ViewMode = 'all' | '7days' | 'late' | 'critical';

export default function ValidationPaiementsPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [viewMode, setViewMode] = useState<ViewMode>('7days');
  const [selectedPayment, setSelectedPayment] = useState<(Payment & { daysToDue: number; amountNum: number; requiresDoubleValidation: boolean }) | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [bfValidation, setBfValidation] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  // Utilisateur actuel (simulé)
  const currentUser = {
    id: 'USR-001',
    name: 'A. DIALLO',
    role: 'Directeur Général',
    bureau: 'BMO',
  };

  // Responsable BF
  const bfResponsible = employees.find((e) => e.bureau === 'BF' && e.role.includes('Chef'));

  // Enrichir les paiements
  const enrichedPayments = useMemo(() => {
    return paymentsN1.map((p) => ({
      ...p,
      daysToDue: getDaysToDue(p.dueDate),
      amountNum: parseAmount(p.amount),
      requiresDoubleValidation: parseAmount(p.amount) >= DOUBLE_VALIDATION_THRESHOLD,
    }));
  }, []);

  // Filtrer selon le mode
  const filteredPayments = useMemo(() => {
    switch (viewMode) {
      case '7days':
        return enrichedPayments.filter((p) => p.daysToDue >= 0 && p.daysToDue <= 7);
      case 'late':
        return enrichedPayments.filter((p) => p.daysToDue < 0);
      case 'critical':
        return enrichedPayments.filter((p) => p.requiresDoubleValidation);
      default:
        return enrichedPayments;
    }
  }, [enrichedPayments, viewMode]);

  // Stats
  const stats = useMemo(() => ({
    total: paymentsN1.length,
    in7Days: enrichedPayments.filter((p) => p.daysToDue >= 0 && p.daysToDue <= 7).length,
    late: enrichedPayments.filter((p) => p.daysToDue < 0).length,
    critical: enrichedPayments.filter((p) => p.requiresDoubleValidation).length,
    totalAmount: enrichedPayments.reduce((acc, p) => acc + p.amountNum, 0),
  }), [enrichedPayments]);

  // Autoriser un paiement
  const handleAuthorize = (payment: typeof enrichedPayments[0]) => {
    // Double validation pour montants >= 5M
    if (payment.requiresDoubleValidation && !bfValidation) {
      setSelectedPayment(payment);
      setShowValidationModal(true);
      addToast(`⚠️ Double validation requise (>${(DOUBLE_VALIDATION_THRESHOLD / 1000000).toFixed(0)}M FCFA)`, 'warning');
      return;
    }

    const hash = generateSHA3Hash(`${payment.id}-${currentUser.id}-authorize-${Date.now()}`);
    const timestamp = new Date().toISOString();

    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'validation',
      module: 'validation-paiements',
      targetId: payment.id,
      targetType: 'Paiement',
      targetLabel: `${payment.type} - ${payment.beneficiary}`,
      details: `Paiement autorisé - Montant: ${payment.amount} FCFA - Ref: ${payment.ref} - Hash: ${hash} - Timestamp: ${timestamp}${payment.requiresDoubleValidation ? ' - DOUBLE VALIDATION' : ''}`,
      bureau: payment.bureau,
    });

    addToast(`✓ ${payment.id} autorisé - ${payment.amount} FCFA`, 'success');
    setShowValidationModal(false);
    setBfValidation(false);
  };

  // Bloquer un paiement
  const handleBlock = (payment: typeof enrichedPayments[0], reason: string) => {
    const hash = generateSHA3Hash(`${payment.id}-${currentUser.id}-block-${Date.now()}`);

    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'blocage',
      module: 'validation-paiements',
      targetId: payment.id,
      targetType: 'Paiement',
      targetLabel: `${payment.type} - ${payment.beneficiary}`,
      details: `Paiement bloqué - Motif: ${reason} - Hash: ${hash}`,
      bureau: payment.bureau,
    });

    addToast(`🛑 ${payment.id} bloqué - ${reason}`, 'warning');
  };

  // Demander justificatif
  const handleRequestJustificatif = (payment: typeof enrichedPayments[0]) => {
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'complement',
      module: 'validation-paiements',
      targetId: payment.id,
      targetType: 'Paiement',
      targetLabel: `${payment.type} - ${payment.beneficiary}`,
      details: 'Demande de justificatif envoyée',
      bureau: payment.bureau,
    });

    addToast(`📎 Justificatif demandé pour ${payment.id}`, 'info');
  };

  // Validation BF simulée
  const handleBFValidation = () => {
    setBfValidation(true);
    addToast('✓ Validation BF confirmée', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            💳 Validation Paiements N+1
            <Badge variant="warning">{stats.total}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Double validation si &gt;{(DOUBLE_VALIDATION_THRESHOLD / 1000000).toFixed(0)}M FCFA • Traçabilité complète
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Montant total en attente</p>
          <p className="font-mono font-bold text-lg text-amber-400">
            {(stats.totalAmount / 1000000).toFixed(1)}M FCFA
          </p>
        </div>
      </div>

      {/* Alerte paiements en retard */}
      {stats.late > 0 && (
        <div className={cn(
          'rounded-xl p-3 flex items-center gap-3 border',
          darkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
        )}>
          <span className="text-2xl animate-pulse">🚨</span>
          <div className="flex-1">
            <p className="font-bold text-sm text-red-400">
              {stats.late} paiement(s) en retard
            </p>
            <p className="text-xs text-slate-400">
              Échéance dépassée - Risque de pénalités
            </p>
          </div>
          <Button size="sm" variant="destructive" onClick={() => setViewMode('late')}>
            Voir retards
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        <Card
          className={cn('cursor-pointer transition-all', viewMode === 'all' && 'ring-2 ring-orange-500')}
          onClick={() => setViewMode('all')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-[10px] text-slate-400">Total</p>
          </CardContent>
        </Card>
        <Card
          className={cn('cursor-pointer transition-all border-amber-500/30', viewMode === '7days' && 'ring-2 ring-amber-500')}
          onClick={() => setViewMode('7days')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.in7Days}</p>
            <p className="text-[10px] text-slate-400">À 7 jours</p>
          </CardContent>
        </Card>
        <Card
          className={cn('cursor-pointer transition-all border-red-500/30', viewMode === 'late' && 'ring-2 ring-red-500')}
          onClick={() => setViewMode('late')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.late}</p>
            <p className="text-[10px] text-slate-400">En retard</p>
          </CardContent>
        </Card>
        <Card
          className={cn('cursor-pointer transition-all border-purple-500/30', viewMode === 'critical' && 'ring-2 ring-purple-500')}
          onClick={() => setViewMode('critical')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.critical}</p>
            <p className="text-[10px] text-slate-400">&gt;5M (critique)</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-emerald-400">
              {(stats.totalAmount / 1000000).toFixed(1)}M
            </p>
            <p className="text-[10px] text-slate-400">Montant total</p>
          </CardContent>
        </Card>
      </div>

      {/* Table des paiements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            {viewMode === '7days' && '⏰ Paiements à 7 jours'}
            {viewMode === 'late' && '🚨 Paiements en retard'}
            {viewMode === 'critical' && '💰 Paiements critiques (>5M)'}
            {viewMode === 'all' && '📋 Tous les paiements'}
            <Badge variant="info">{filteredPayments.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                  <th className="px-3 py-2.5 text-left font-bold text-amber-500">ID</th>
                  <th className="px-3 py-2.5 text-left font-bold text-amber-500">Type</th>
                  <th className="px-3 py-2.5 text-left font-bold text-amber-500">Référence</th>
                  <th className="px-3 py-2.5 text-left font-bold text-amber-500">Bénéficiaire</th>
                  <th className="px-3 py-2.5 text-left font-bold text-amber-500">Montant</th>
                  <th className="px-3 py-2.5 text-left font-bold text-amber-500">Échéance</th>
                  <th className="px-3 py-2.5 text-left font-bold text-amber-500">Statut</th>
                  <th className="px-3 py-2.5 text-left font-bold text-amber-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const isLate = payment.daysToDue < 0;
                  const isUrgent = payment.daysToDue >= 0 && payment.daysToDue <= 3;

                  return (
                    <tr
                      key={payment.id}
                      className={cn(
                        'border-t transition-all',
                        darkMode ? 'border-slate-700/50' : 'border-gray-100',
                        isLate && 'bg-red-500/5',
                        isUrgent && !isLate && 'bg-amber-500/5',
                        'hover:bg-orange-500/5'
                      )}
                    >
                      <td className="px-3 py-2.5">
                        <span className="font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                          {payment.id}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant={payment.type === 'Situation' ? 'gold' : payment.type === 'Facture' ? 'info' : 'default'}>
                          {payment.type}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[10px]">{payment.ref}</td>
                      <td className="px-3 py-2.5">
                        <div>
                          <p className="font-semibold">{payment.beneficiary}</p>
                          <p className="text-[10px] text-orange-400">{payment.project}</p>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <span className={cn(
                            'font-mono font-bold',
                            payment.requiresDoubleValidation ? 'text-purple-400' : 'text-amber-400'
                          )}>
                            {payment.amount}
                          </span>
                          {payment.requiresDoubleValidation && (
                            <span className="text-[9px] px-1 py-0.5 rounded bg-purple-500/20 text-purple-400">
                              2x
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <span className={cn(
                            isLate ? 'text-red-400 font-bold' : isUrgent ? 'text-amber-400' : ''
                          )}>
                            {payment.dueDate}
                          </span>
                          {isLate && (
                            <Badge variant="urgent" pulse>J{payment.daysToDue}</Badge>
                          )}
                          {isUrgent && !isLate && (
                            <Badge variant="warning">J-{payment.daysToDue}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant={payment.status === 'pending' ? 'warning' : 'success'}>
                          {payment.status === 'pending' ? 'En attente' : 'Validé'}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          <Button size="xs" variant="success" onClick={() => handleAuthorize(payment)}>✓</Button>
                          <Button size="xs" variant="info" onClick={() => { setSelectedPayment(payment); setShowValidationModal(true); }}>👁</Button>
                          <Button size="xs" variant="warning" onClick={() => handleRequestJustificatif(payment)}>📎</Button>
                          <Button size="xs" variant="destructive" onClick={() => handleBlock(payment, 'Justificatif insuffisant')}>🛑</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredPayments.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-400">Aucun paiement dans cette catégorie</p>
          </CardContent>
        </Card>
      )}

      {/* Modal double validation */}
      {showValidationModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                {selectedPayment.requiresDoubleValidation ? '🔐 Double validation requise' : '💳 Détails paiement'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Détails paiement */}
              <div className={cn('p-3 rounded-lg', darkMode ? 'bg-slate-700/50' : 'bg-gray-50')}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-mono text-xs text-blue-400">{selectedPayment.id}</span>
                    <Badge variant="info" className="ml-2">{selectedPayment.type}</Badge>
                  </div>
                  <span className={cn(
                    'font-mono font-bold text-lg',
                    selectedPayment.requiresDoubleValidation ? 'text-purple-400' : 'text-amber-400'
                  )}>
                    {selectedPayment.amount} FCFA
                  </span>
                </div>
                <p className="font-bold text-sm">{selectedPayment.beneficiary}</p>
                <p className="text-xs text-slate-400">Ref: {selectedPayment.ref}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div><span className="text-slate-400">Projet:</span> <span className="text-orange-400">{selectedPayment.project}</span></div>
                  <div><span className="text-slate-400">Échéance:</span> {selectedPayment.dueDate}</div>
                  <div><span className="text-slate-400">Validé par:</span> {selectedPayment.validatedBy}</div>
                  <div><span className="text-slate-400">Bureau:</span> <BureauTag bureau={selectedPayment.bureau} /></div>
                </div>
              </div>

              {/* Double validation pour montants >= 5M */}
              {selectedPayment.requiresDoubleValidation && (
                <>
                  <div className="p-3 rounded-lg border-l-4 border-l-purple-500 bg-purple-500/10">
                    <p className="text-xs text-purple-400 font-bold mb-2">
                      ⚠️ Montant &gt;{(DOUBLE_VALIDATION_THRESHOLD / 1000000).toFixed(0)}M FCFA - Double validation obligatoire
                    </p>
                  </div>

                  {/* Étape 1: Validation BF */}
                  <div className={cn(
                    'p-3 rounded-lg border-l-4',
                    bfValidation ? 'border-l-emerald-500 bg-emerald-500/10' : 'border-l-amber-500 bg-amber-500/10'
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{bfValidation ? '✓' : '1️⃣'}</span>
                        <div>
                          <p className="font-bold text-sm">Validation Bureau Finance</p>
                          <p className="text-[10px] text-slate-400">
                            {bfResponsible?.name || 'F. DIOP'} - Chef Bureau Finance
                          </p>
                        </div>
                      </div>
                      {!bfValidation && (
                        <Button size="sm" variant="warning" onClick={handleBFValidation}>
                          Simuler validation BF
                        </Button>
                      )}
                      {bfValidation && <Badge variant="success">✓ Validé</Badge>}
                    </div>
                  </div>

                  {/* Étape 2: Autorisation DG */}
                  <div className={cn(
                    'p-3 rounded-lg border-l-4',
                    bfValidation ? 'border-l-emerald-500' : 'border-l-slate-500 opacity-50',
                    bfValidation ? 'bg-emerald-500/10' : 'bg-slate-500/10'
                  )}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">2️⃣</span>
                      <div>
                        <p className="font-bold text-sm">Autorisation Directeur Général</p>
                        <p className="text-[10px] text-slate-400">{currentUser.name} - {currentUser.role}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Zone blocage */}
              <div className={cn('p-3 rounded-lg', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                <p className="text-xs font-bold mb-2">Motif de blocage (optionnel)</p>
                <input
                  type="text"
                  placeholder="Ex: Justificatif manquant, montant incorrect..."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className={cn(
                    'w-full px-3 py-2 rounded text-xs',
                    darkMode ? 'bg-slate-800 border border-slate-600' : 'bg-white border border-gray-300'
                  )}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                <Button
                  className="flex-1"
                  disabled={selectedPayment.requiresDoubleValidation && !bfValidation}
                  onClick={() => handleAuthorize(selectedPayment)}
                >
                  ✓ Autoriser le paiement
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleBlock(selectedPayment, blockReason || 'Non spécifié');
                    setShowValidationModal(false);
                  }}
                >
                  🛑 Bloquer
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowValidationModal(false);
                    setBfValidation(false);
                    setBlockReason('');
                  }}
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info traçabilité */}
      <Card className="border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <h3 className="font-bold text-sm text-blue-400">Traçabilité des paiements</h3>
              <p className="text-xs text-slate-400 mt-1">
                Chaque autorisation ou blocage génère une entrée dans le registre des décisions avec :
              </p>
              <div className="flex flex-wrap gap-2 mt-2 text-[10px]">
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">Hash SHA3-256</span>
                <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400">Horodatage ISO</span>
                <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400">Auteur identifié</span>
                <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400">Montant vérifié</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                💡 Seuil critique : Tout paiement ≥ {(DOUBLE_VALIDATION_THRESHOLD / 1000000).toFixed(0)}M FCFA nécessite une double validation (BF + DG)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
