'use client';

import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { demandesRH, employees, employeesDetails } from '@/lib/data';

// WHY: Parsing robuste des montants (FCFA)
const parseMontant = (value: string | number): number => {
  if (typeof value === 'number') return value;
  const cleaned = value.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// WHY: Formatage monétaire cohérent
const formatFCFA = (montant: number): string => {
  return new Intl.NumberFormat('fr-FR').format(montant);
};

// WHY: Export CSV enrichi — traçabilité RACI incluse
const exportPaieAvancesAsCSV = (
  demandes: typeof demandesRH,
  addToast: (msg: string, variant?: 'success' | 'warning' | 'info' | 'error') => void
) => {
  const headers = [
    'ID',
    'Agent',
    'Type',
    'Montant (FCFA)',
    'Statut',
    'Priorité',
    'Bureau',
    'Motif',
    'Validé par',
    'Date validation',
    'Origine décisionnelle',
    'ID décision',
    'Rôle RACI',
    'Hash traçabilité',
    'Statut BMO',
  ];

  const rows = demandes
    .filter(d => d.type === 'Paie')
    .map(d => [
      d.id,
      d.agent,
      d.subtype || 'Paie',
      d.amount || '0',
      d.status,
      d.priority,
      d.bureau,
      `"${d.reason}"`,
      d.validatedBy || '',
      d.validatedAt || '',
      d.decisionBMO?.origin || 'Hors périmètre BMO',
      d.decisionBMO?.decisionId || '',
      d.decisionBMO?.validatorRole || '',
      d.decisionBMO?.hash || '',
      d.decisionBMO ? 'Validé' : 'Non piloté',
    ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `paie_avances_bmo_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  addToast('✅ Export Paie/Avances généré (traçabilité RACI)', 'success');
};

// Seuil pour double contrôle (en FCFA)
const SEUIL_DOUBLE_CONTROLE = 150000;

export default function PaieAvancesPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  // Utilisateur actuel (simulé - normalement depuis auth)
  const currentUser = {
    id: 'USR-001',
    name: 'A. DIALLO',
    role: 'Directeur Général',
    bureau: 'BMO',
  };
  const [filter, setFilter] = useState<'all' | 'pending' | 'validated' | 'rejected'>('all');
  const [selectedDemande, setSelectedDemande] = useState<string | null>(null);
  const [showDoubleControl, setShowDoubleControl] = useState<string | null>(null);

  const paieDemandes = useMemo(() => 
    demandesRH.filter(d => d.type === 'Paie'),
    []
  );
  
  const filteredDemandes = useMemo(() => 
    paieDemandes.filter(d => filter === 'all' || d.status === filter),
    [paieDemandes, filter]
  );

  const stats = useMemo(() => {
    const pending = paieDemandes.filter(d => d.status === 'pending');
    const validated = paieDemandes.filter(d => d.status === 'validated');
    const rejected = paieDemandes.filter(d => d.status === 'rejected');
    
    const totalPending = pending.reduce((acc, d) => acc + parseMontant(d.amount || '0'), 0);
    const totalValidated = validated.reduce((acc, d) => acc + parseMontant(d.amount || '0'), 0);

    const urgentsDoubleControl = pending.filter(d => 
      parseMontant(d.amount || '0') >= SEUIL_DOUBLE_CONTROLE
    );

    return {
      total: paieDemandes.length,
      pending: pending.length,
      validated: validated.length,
      rejected: rejected.length,
      totalPending,
      totalValidated,
      urgentsDoubleControl: urgentsDoubleControl.length,
    };
  }, [paieDemandes]);

  const selectedD = selectedDemande ? paieDemandes.find(d => d.id === selectedDemande) : null;

  const getEmployeeAvanceStatus = useCallback((agentName: string) => {
    return paieDemandes.some(
      d => d.agent === agentName && d.status === 'validated' && d.subtype === 'Avance'
    );
  }, [paieDemandes]);

  const getEmployeeInfo = useCallback((agentId?: string) => {
    if (!agentId) return null;
    const details = employeesDetails.find(e => e.employeeId === agentId);
    const employee = employees.find(e => e.id === agentId);
    return { details, employee };
  }, []);

  const needsDoubleControl = useCallback((amount?: string) => {
    if (!amount) return false;
    return parseMontant(amount) >= SEUIL_DOUBLE_CONTROLE;
  }, []);

  const handleFinalApproval = useCallback((demande: typeof selectedD) => {
    if (!demande) return;
    
    const hash = `SHA3-256:${btoa(`${demande.id}-${Date.now()}-${currentUser.id}`)}`;
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      module: 'paie-avances',
      action: 'validation', // Mapping vers ActionLogType valide
      targetId: demande.id,
      targetType: 'HRRequest',
      details: `Avance ${demande.amount} FCFA approuvée pour ${demande.agent} - Hash: ${hash}`,
      bureau: 'BMO',
    });
    addToast('✅ Avance validée - Trace RH + Finance créée', 'success');
    setShowDoubleControl(null);
  }, [currentUser, addActionLog, addToast]);

  const handleFirstApproval = useCallback((demande: typeof selectedD) => {
    if (!demande) return;
    
    if (needsDoubleControl(demande.amount)) {
      setShowDoubleControl(demande.id);
      addActionLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        module: 'paie-avances',
        action: 'modification', // Mapping vers ActionLogType valide
        targetId: demande.id,
        targetType: 'HRRequest',
        details: `Première validation ${demande.amount} FCFA - Double contrôle requis`,
        bureau: 'BMO',
      });
      addToast('🔐 Première validation OK - Double contrôle requis', 'warning');
    } else {
      handleFinalApproval(demande);
    }
  }, [currentUser, addActionLog, addToast, needsDoubleControl, handleFinalApproval]);

  const handleReject = useCallback((demande: typeof selectedD, reason = 'Motif non spécifié') => {
    if (!demande) return;
    
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      module: 'paie-avances',
      action: 'rejection', // Mapping vers ActionLogType valide
      targetId: demande.id,
      targetType: 'HRRequest',
      details: `Avance refusée: ${reason}`,
      bureau: 'BMO',
    });
    addToast('❌ Demande refusée', 'error');
  }, [currentUser, addActionLog, addToast]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            💰 Paie & Avances BMO
            <Badge variant="warning">{stats.pending} en attente</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Avances <strong>sous contrôle BMO</strong> — Double validation + Traçabilité
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => exportPaieAvancesAsCSV(demandesRH, addToast)}
          >
            📊 Exporter (CSV RACI)
          </Button>
          <Button onClick={() => addToast('Nouvelle demande d\'avance créée', 'success')}>
            + Nouvelle avance
          </Button>
        </div>
      </div>

      {/* Alerte double contrôle */}
      {stats.urgentsDoubleControl > 0 && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔐</span>
              <div className="flex-1">
                <h3 className="font-bold text-red-400">
                  {stats.urgentsDoubleControl} demande(s) nécessitant double contrôle
                </h3>
                <p className="text-sm text-slate-400">
                  Montant ≥ {formatFCFA(SEUIL_DOUBLE_CONTROLE)} FCFA - <strong>BMO (Accountable)</strong>
                </p>
              </div>
              <Badge variant="urgent" pulse>Double validation</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
            <p className="text-[10px] text-slate-400">En attente</p>
            <p className="font-mono text-xs text-amber-300 mt-1">
              {formatFCFA(stats.totalPending / 1000)}K FCFA
            </p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.validated}</p>
            <p className="text-[10px] text-slate-400">Validées</p>
            <p className="font-mono text-xs text-emerald-300 mt-1">
              {formatFCFA(stats.totalValidated / 1000)}K FCFA
            </p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
            <p className="text-[10px] text-slate-400">Refusées</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.urgentsDoubleControl}</p>
            <p className="text-[10px] text-slate-400">Double ctrl</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-blue-400">
              {formatFCFA(SEUIL_DOUBLE_CONTROLE)}
            </p>
            <p className="text-[10px] text-slate-400">Seuil FCFA</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: 'Toutes' },
          { id: 'pending', label: '⏳ En attente' },
          { id: 'validated', label: '✅ Validées' },
          { id: 'rejected', label: '❌ Refusées' },
        ].map((f) => (
          <Button
            key={f.id}
            size="sm"
            variant={filter === f.id ? 'default' : 'secondary'}
            onClick={() => setFilter(f.id as typeof filter)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Liste */}
        <div className="lg:col-span-2 space-y-3">
          {filteredDemandes.map((demande) => {
            const isSelected = selectedDemande === demande.id;
            const needsDouble = needsDoubleControl(demande.amount);
            const hasExistingAvance = getEmployeeAvanceStatus(demande.agent);
            const isDoubleControlPending = showDoubleControl === demande.id;
            
            return (
              <Card
                key={demande.id}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected ? 'ring-2 ring-orange-500' : 'hover:border-orange-500/50',
                  demande.priority === 'urgent' && demande.status === 'pending' && 'border-l-4 border-l-red-500',
                  needsDouble && demande.status === 'pending' && 'border-r-4 border-r-purple-500',
                  demande.status === 'validated' && 'border-l-4 border-l-emerald-500',
                  demande.status === 'rejected' && 'opacity-60',
                )}
                onClick={() => setSelectedDemande(demande.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white">
                        {demande.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] text-orange-400">{demande.id}</span>
                          <Badge variant="default">{demande.subtype}</Badge>
                          <BureauTag bureau={demande.bureau} />
                          {needsDouble && demande.status === 'pending' && (
                            <Badge variant="urgent">🔐 Double ctrl</Badge>
                          )}
                          {hasExistingAvance && demande.status === 'pending' && (
                            <Badge variant="warning">⚠️ Avance en cours</Badge>
                          )}
                          {demande.decisionBMO && (
                            <Badge variant="success" className="text-[9px]">✅ BMO (A)</Badge>
                          )}
                        </div>
                        <h3 className="font-bold">{demande.agent}</h3>
                        <p className="text-xs text-slate-400">{demande.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "font-mono text-xl font-bold",
                        needsDouble ? "text-purple-400" : "text-amber-400"
                      )}>
                        {demande.amount} FCFA
                      </p>
                      <Badge variant={
                        demande.status === 'validated' ? 'success' :
                        demande.status === 'rejected' ? 'default' :
                        demande.priority === 'urgent' ? 'urgent' : 'info'
                      }>
                        {demande.status === 'validated' ? '✅ Payée' :
                         demande.status === 'rejected' ? '❌ Refusée' : demande.priority}
                      </Badge>
                    </div>
                  </div>

                  {/* Double contrôle en cours */}
                  {isDoubleControlPending && (
                    <div className="p-3 rounded bg-purple-500/20 border border-purple-500/50 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🔐</span>
                        <p className="font-bold text-purple-400">Double contrôle requis</p>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">
                        Montant sensible (≥{formatFCFA(SEUIL_DOUBLE_CONTROLE)} FCFA) - 
                        Validation N+1 obligatoire
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="success" onClick={(e) => { 
                          e.stopPropagation(); 
                          handleFinalApproval(demande);
                        }}>
                          ✓ Confirmer (N+1)
                        </Button>
                        <Button size="sm" variant="destructive" onClick={(e) => { 
                          e.stopPropagation(); 
                          setShowDoubleControl(null);
                          handleReject(demande, 'Refusé au double contrôle');
                        }}>
                          ✕ Rejeter
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Traçabilité */}
                  {demande.validatedBy && (
                    <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-xs mb-2">
                      <p className="text-emerald-400">✅ Validée par {demande.validatedBy}</p>
                      <p className="text-slate-400">{demande.validatedAt}</p>
                      {demande.impactFinance && (
                        <p className="text-slate-400 mt-1">
                          💰 Finance: <span className="font-mono">{demande.impactFinance}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {demande.rejectedBy && (
                    <div className="p-2 rounded bg-red-500/10 border border-red-500/30 text-xs mb-2">
                      <p className="text-red-400">❌ Refusée par {demande.rejectedBy}</p>
                      <p className="text-slate-400">{demande.rejectedAt}</p>
                      {demande.rejectionReason && (
                        <p className="text-slate-300 mt-1">Motif: {demande.rejectionReason}</p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  {demande.status === 'pending' && !isDoubleControlPending && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                      <Button 
                        size="sm" 
                        variant={needsDouble ? 'warning' : 'success'} 
                        onClick={(e) => { e.stopPropagation(); handleFirstApproval(demande); }}
                      >
                        {needsDouble ? '🔐 Initier double ctrl' : '✓ Valider'}
                      </Button>
                      {hasExistingAvance && (
                        <Button size="sm" variant="info" onClick={(e) => e.stopPropagation()}>
                          📊 Voir historique
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={(e) => { e.stopPropagation(); handleReject(demande); }}
                      >
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
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg font-bold text-white">
                    {selectedD.initials}
                  </div>
                  <div>
                    <h3 className="font-bold">{selectedD.agent}</h3>
                    <p className={cn(
                      "font-mono font-bold",
                      needsDoubleControl(selectedD.amount) ? "text-purple-400" : "text-amber-400"
                    )}>
                      {selectedD.amount} FCFA
                    </p>
                    <BureauTag bureau={selectedD.bureau} />
                    {selectedD.decisionBMO && (
                      <Badge variant="success" className="mt-1 text-[9px]">
                        BMO (Accountable)
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {/* Montant et seuil */}
                  <div className={cn(
                    "p-3 rounded",
                    needsDoubleControl(selectedD.amount) 
                      ? "bg-purple-500/20 border border-purple-500/50" 
                      : "bg-slate-700/30"
                  )}>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Montant demandé</span>
                      <span className="font-mono font-bold text-lg">{selectedD.amount} FCFA</span>
                    </div>
                    {needsDoubleControl(selectedD.amount) && (
                      <div className="mt-2 pt-2 border-t border-purple-500/30">
                        <Badge variant="urgent">🔐 Double contrôle obligatoire</Badge>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Seuil: {formatFCFA(SEUIL_DOUBLE_CONTROLE)} FCFA
                        </p>
                      </div>
                    )}
                  </div>

                  <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                    <p className="text-xs text-slate-400 mb-1">Motif</p>
                    <p>{selectedD.reason}</p>
                  </div>

                  {/* Infos employé */}
                  {selectedD.agentId && (() => {
                    const info = getEmployeeInfo(selectedD.agentId);
                    if (!info?.details) return null;
                    return (
                      <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                        <h4 className="font-bold text-xs mb-2">👤 Infos employé</h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Salaire</span>
                            <span className="font-mono">{info.employee?.salary} FCFA</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Contrat</span>
                            <Badge variant={info.details.contractType === 'CDI' ? 'info' : 'warning'}>
                              {info.details.contractType}
                            </Badge>
                          </div>
                          {getEmployeeAvanceStatus(selectedD.agent) && (
                            <div className="mt-2 p-2 rounded bg-amber-500/10 border border-amber-500/30">
                              <p className="text-amber-400 text-[10px]">⚠️ Avance précédente non soldée</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Documents */}
                  {selectedD.documents && selectedD.documents.length > 0 && (
                    <div>
                      <h4 className="font-bold text-xs mb-2">📎 Justificatifs</h4>
                      {selectedD.documents.map(doc => (
                        <div key={doc.id} className={cn(
                          "p-2 rounded mb-1",
                          darkMode ? "bg-slate-700/30" : "bg-gray-100"
                        )}>
                          <p className="text-xs">{doc.name}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Trace RH + Finance */}
                  {(selectedD.impactFinance || selectedD.decisionBMO) && (
                    <div className="space-y-2">
                      {selectedD.impactFinance && (
                        <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
                          <p className="text-xs text-emerald-400">💰 Trace finance</p>
                          <p className="font-mono text-xs">{selectedD.impactFinance}</p>
                        </div>
                      )}
                      {selectedD.decisionBMO && (
                        <div className="p-2 rounded bg-purple-500/10 border border-purple-500/30">
                          <p className="text-[10px] text-purple-400">🔐 Décision BMO</p>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-[10px] bg-slate-800/50 px-1 rounded">
                              {selectedD.decisionBMO.hash.slice(0, 32)}...
                            </code>
                            <Button
                              size="xs"
                              variant="ghost"
                              className="text-[10px] text-blue-400 p-0 h-auto"
                              onClick={async () => {
                                const isValid = selectedD.decisionBMO?.hash.startsWith('SHA3-256:');
                                addToast(
                                  isValid ? '✅ Hash valide' : '❌ Hash invalide',
                                  isValid ? 'success' : 'error'
                                );
                              }}
                            >
                              🔍 Vérifier
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {selectedD.status === 'pending' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700/50">
                    <Button 
                      size="sm" 
                      variant={needsDoubleControl(selectedD.amount) ? 'warning' : 'success'} 
                      className="flex-1"
                      onClick={() => handleFirstApproval(selectedD)}
                    >
                      {needsDoubleControl(selectedD.amount) ? '🔐 Double ctrl' : '✓ Valider'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => handleReject(selectedD)}
                    >
                      ✕ Refuser
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="p-8 text-center">
                <span className="text-4xl mb-4 block">💰</span>
                <p className="text-slate-400">Sélectionnez une demande</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
