'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import {
  substitutions,
  blockedDossiers,
  employees,
  plannedAbsences,
  delegations,
} from '@/lib/data';
import type { BlockedDossier, Employee } from '@/lib/types/bmo.types';

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

// Interface pour les dossiers substituables enrichis
interface SubstitutableDossier {
  ref: string;
  bureau: string;
  icon: string;
  desc: string;
  amount: string;
  delay: number;
  reason: string;
  type: 'substitution' | 'blocked';
  suggestedSubstitutes: SuggestedSubstitute[];
}

// Interface pour les substituants suggérés
interface SuggestedSubstitute {
  employee: Employee;
  score: number;
  reasons: string[];
  availability: 'available' | 'partial' | 'busy';
}

type ViewMode = 'all' | 'byReason' | 'byCause';
type ReasonFilter = 'all' | 'absence' | 'blocage' | 'technique' | 'documents';

export default function SubstitutionPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [reasonFilter, setReasonFilter] = useState<ReasonFilter>('all');
  const [selectedDossier, setSelectedDossier] = useState<SubstitutableDossier | null>(null);
  const [showSubstitutionModal, setShowSubstitutionModal] = useState(false);
  const [selectedSubstitute, setSelectedSubstitute] = useState<Employee | null>(null);
  const [substitutionNote, setSubstitutionNote] = useState('');

  // Utilisateur actuel (simulé)
  const currentUser = {
    id: 'USR-001',
    name: 'A. DIALLO',
    role: 'Directeur Général',
    bureau: 'BMO',
  };

  // Employés disponibles (non absents)
  const availableEmployees = useMemo(() => {
    const absentIds = plannedAbsences?.map((a) => a.employeeId) || [];
    return employees.filter((e) => 
      !absentIds.includes(e.id) && 
      e.status === 'active'
    );
  }, []);

  // Fonction pour calculer le score de substitution d'un employé
  const calculateSubstituteScore = (employee: Employee, dossierBureau: string, dossierType: string): SuggestedSubstitute => {
    let score = 0;
    const reasons: string[] = [];

    // 1. Même bureau = +30 points
    if (employee.bureau === dossierBureau) {
      score += 30;
      reasons.push('Même bureau');
    }

    // 2. A une délégation active = +25 points
    if (employee.delegated) {
      score += 25;
      reasons.push('Délégation active');
    }

    // 3. Compétences pertinentes = +20 points par skill
    const relevantSkills = ['Validation', 'OHADA', 'Comptabilité', 'Budget', 'Contrats'];
    employee.skills?.forEach((skill) => {
      if (relevantSkills.includes(skill)) {
        score += 20;
        reasons.push(`Compétence: ${skill}`);
      }
    });

    // 4. BMO = toujours capable de substituer = +15 points
    if (employee.bureau === 'BMO') {
      score += 15;
      reasons.push('Bureau BMO');
    }

    // 5. Vérifier disponibilité
    const absence = plannedAbsences?.find((a) => a.employeeId === employee.id);
    let availability: 'available' | 'partial' | 'busy' = 'available';
    if (absence) {
      if (absence.impact === 'high') {
        availability = 'busy';
        score -= 50;
      } else {
        availability = 'partial';
        score -= 20;
      }
    }

    return {
      employee,
      score: Math.max(0, score),
      reasons,
      availability,
    };
  };

  // Combiner substitutions et blockedDossiers en liste unifiée avec suggestions
  const substitutableDossiers = useMemo((): SubstitutableDossier[] => {
    const allDossiers: SubstitutableDossier[] = [];
    const usedRefs = new Set<string>();

    // Ajouter les substitutions
    substitutions.forEach((sub) => {
      const suggestions = employees
        .map((emp) => calculateSubstituteScore(emp, sub.bureau, 'substitution'))
        .filter((s) => s.availability !== 'busy')
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      allDossiers.push({
        ref: sub.ref,
        bureau: sub.bureau,
        icon: sub.icon,
        desc: sub.desc,
        amount: sub.amount,
        delay: sub.delay,
        reason: sub.reason,
        type: 'substitution',
        suggestedSubstitutes: suggestions,
      });
      usedRefs.add(sub.ref);
    });

    // Ajouter les dossiers bloqués (delay > 5) uniquement s'ils ne sont pas déjà dans substitutions
    blockedDossiers
      .filter((d) => d.delay > 5 && !usedRefs.has(d.id))
      .forEach((blocked) => {
        const suggestions = employees
          .map((emp) => calculateSubstituteScore(emp, blocked.bureau, blocked.type))
          .filter((s) => s.availability !== 'busy')
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);

        allDossiers.push({
          ref: blocked.id,
          bureau: blocked.bureau,
          icon: blocked.type === 'Paiement' ? '💳' : blocked.type === 'Validation' ? '✅' : '📋',
          desc: blocked.subject,
          amount: blocked.amount,
          delay: blocked.delay,
          reason: blocked.reason,
          type: 'blocked',
          suggestedSubstitutes: suggestions,
        });
        usedRefs.add(blocked.id);
      });

    return allDossiers.sort((a, b) => b.delay - a.delay);
  }, []);

  // Filtrer par raison
  const filteredDossiers = useMemo(() => {
    if (reasonFilter === 'all') return substitutableDossiers;
    
    return substitutableDossiers.filter((d) => {
      const reasonLower = d.reason.toLowerCase();
      switch (reasonFilter) {
        case 'absence':
          return reasonLower.includes('absence') || reasonLower.includes('congé');
        case 'blocage':
          return reasonLower.includes('blocage');
        case 'technique':
          return reasonLower.includes('technique');
        case 'documents':
          return reasonLower.includes('document') || reasonLower.includes('pièce') || reasonLower.includes('manquant');
        default:
          return true;
      }
    });
  }, [substitutableDossiers, reasonFilter]);

  // Grouper par cause
  const dossiersByCause = useMemo(() => ({
    absence: substitutableDossiers.filter((d) => d.reason.toLowerCase().includes('absence')),
    blocage: substitutableDossiers.filter((d) => d.reason.toLowerCase().includes('blocage')),
    technique: substitutableDossiers.filter((d) => d.reason.toLowerCase().includes('technique')),
    documents: substitutableDossiers.filter((d) => d.reason.toLowerCase().includes('document') || d.reason.toLowerCase().includes('manquant')),
    autres: substitutableDossiers.filter((d) => 
      !d.reason.toLowerCase().includes('absence') &&
      !d.reason.toLowerCase().includes('blocage') &&
      !d.reason.toLowerCase().includes('technique') &&
      !d.reason.toLowerCase().includes('document') &&
      !d.reason.toLowerCase().includes('manquant')
    ),
  }), [substitutableDossiers]);

  // Stats
  const stats = useMemo(() => ({
    total: substitutableDossiers.length,
    byAbsence: dossiersByCause.absence.length,
    byBlocage: dossiersByCause.blocage.length + dossiersByCause.technique.length,
    byDocuments: dossiersByCause.documents.length,
    avgDelay: Math.round(substitutableDossiers.reduce((acc, d) => acc + d.delay, 0) / substitutableDossiers.length || 0),
    totalAmount: substitutableDossiers.reduce((acc, d) => {
      const amount = parseFloat(d.amount.replace(/[M,\s]/g, '').replace('FCFA', '')) || 0;
      return acc + (d.amount.includes('M') ? amount * 1000000 : amount);
    }, 0),
  }), [substitutableDossiers, dossiersByCause]);

  // Exécuter substitution
  const handleSubstitute = (dossier: SubstitutableDossier, substitute: Employee, note: string) => {
    const hash = generateSHA3Hash(`${dossier.ref}-${substitute.id}-${Date.now()}`);
    const delegationId = `DEL-${Date.now().toString().slice(-6)}`;

    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'substitution',
      module: 'substitution',
      targetId: dossier.ref,
      targetType: dossier.type === 'blocked' ? 'Dossier bloqué' : 'Substitution',
      targetLabel: dossier.desc,
      details: `Substitution effectuée - Substituant: ${substitute.name} (${substitute.id}) - Délégation: ${delegationId} - Note: ${note} - Hash: ${hash}`,
      bureau: dossier.bureau,
    });

    addToast(
      `✓ Substitution ${dossier.ref} → ${substitute.name} - Hash: ${hash.slice(0, 20)}...`,
      'success'
    );

    setShowSubstitutionModal(false);
    setSelectedSubstitute(null);
    setSubstitutionNote('');
  };

  // Substitution en masse
  const handleMassSubstitution = () => {
    const criticalDossiers = substitutableDossiers.filter((d) => d.delay >= 7);
    if (criticalDossiers.length === 0) {
      addToast('Aucun dossier critique à substituer', 'info');
      return;
    }

    criticalDossiers.forEach((dossier) => {
      if (dossier.suggestedSubstitutes.length > 0) {
        const bestSubstitute = dossier.suggestedSubstitutes[0].employee;
        handleSubstitute(dossier, bestSubstitute, 'Substitution automatique en masse');
      }
    });

    addToast(`${criticalDossiers.length} substitutions effectuées`, 'success');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🔄 Substitution BMO
            <Badge variant="warning">{stats.total}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Proposition automatique de substituants • Traçabilité complète
          </p>
        </div>
        <Button variant="destructive" onClick={handleMassSubstitution}>
          ⚡ Substitution en masse (J+7)
        </Button>
      </div>

      {/* Alerte critique */}
      <div className={cn(
        'rounded-xl p-4 flex items-center gap-3 border',
        darkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
      )}>
        <span className="text-3xl animate-pulse">🚨</span>
        <div className="flex-1">
          <p className="font-bold text-red-400">
            {stats.total} dossiers substituables - Intervention requise
          </p>
          <p className="text-xs text-slate-400">
            Retard moyen: {stats.avgDelay} jours • Montant total: {(stats.totalAmount / 1000000).toFixed(1)}M FCFA
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        <Card
          className={cn('cursor-pointer transition-all', reasonFilter === 'all' && 'ring-2 ring-orange-500')}
          onClick={() => setReasonFilter('all')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-[10px] text-slate-400">Total</p>
          </CardContent>
        </Card>
        <Card
          className={cn('cursor-pointer transition-all border-purple-500/30', reasonFilter === 'absence' && 'ring-2 ring-purple-500')}
          onClick={() => setReasonFilter('absence')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.byAbsence}</p>
            <p className="text-[10px] text-slate-400">Absences</p>
          </CardContent>
        </Card>
        <Card
          className={cn('cursor-pointer transition-all border-amber-500/30', reasonFilter === 'blocage' && 'ring-2 ring-amber-500')}
          onClick={() => setReasonFilter('blocage')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.byBlocage}</p>
            <p className="text-[10px] text-slate-400">Blocages</p>
          </CardContent>
        </Card>
        <Card
          className={cn('cursor-pointer transition-all border-blue-500/30', reasonFilter === 'documents' && 'ring-2 ring-blue-500')}
          onClick={() => setReasonFilter('documents')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.byDocuments}</p>
            <p className="text-[10px] text-slate-400">Documents</p>
          </CardContent>
        </Card>
        <Card className="border-orange-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">{stats.avgDelay}j</p>
            <p className="text-[10px] text-slate-400">Retard moyen</p>
          </CardContent>
        </Card>
      </div>

      {/* Modes de vue */}
      <div className="flex gap-2">
        <Button size="sm" variant={viewMode === 'all' ? 'default' : 'secondary'} onClick={() => setViewMode('all')}>
          📋 Tous
        </Button>
        <Button size="sm" variant={viewMode === 'byCause' ? 'default' : 'secondary'} onClick={() => setViewMode('byCause')}>
          🏷️ Par cause
        </Button>
      </div>

      {/* Vue liste */}
      {viewMode === 'all' && (
        <div className="space-y-3">
          {filteredDossiers.map((dossier) => (
            <SubstitutionCard
              key={`${dossier.type}-${dossier.ref}`}
              dossier={dossier}
              darkMode={darkMode}
              onSubstitute={() => {
                setSelectedDossier(dossier);
                setShowSubstitutionModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Vue par cause */}
      {viewMode === 'byCause' && (
        <div className="space-y-4">
          {dossiersByCause.absence.length > 0 && (
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2 bg-purple-500/10">
                <CardTitle className="text-sm flex items-center gap-2 text-purple-400">
                  👤 Absence responsable
                  <Badge variant="info">{dossiersByCause.absence.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-2">
                {dossiersByCause.absence.map((dossier) => (
                  <SubstitutionCard
                    key={`${dossier.type}-${dossier.ref}`}
                    dossier={dossier}
                    darkMode={darkMode}
                    compact
                    onSubstitute={() => {
                      setSelectedDossier(dossier);
                      setShowSubstitutionModal(true);
                    }}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {(dossiersByCause.blocage.length > 0 || dossiersByCause.technique.length > 0) && (
            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="pb-2 bg-amber-500/10">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-400">
                  🔧 Blocage technique
                  <Badge variant="warning">{dossiersByCause.blocage.length + dossiersByCause.technique.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-2">
                {[...dossiersByCause.blocage, ...dossiersByCause.technique].map((dossier) => (
                  <SubstitutionCard
                    key={`${dossier.type}-${dossier.ref}`}
                    dossier={dossier}
                    darkMode={darkMode}
                    compact
                    onSubstitute={() => {
                      setSelectedDossier(dossier);
                      setShowSubstitutionModal(true);
                    }}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {dossiersByCause.documents.length > 0 && (
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2 bg-blue-500/10">
                <CardTitle className="text-sm flex items-center gap-2 text-blue-400">
                  📄 Documents manquants
                  <Badge variant="info">{dossiersByCause.documents.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-2">
                {dossiersByCause.documents.map((dossier) => (
                  <SubstitutionCard
                    key={`${dossier.type}-${dossier.ref}`}
                    dossier={dossier}
                    darkMode={darkMode}
                    compact
                    onSubstitute={() => {
                      setSelectedDossier(dossier);
                      setShowSubstitutionModal(true);
                    }}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {dossiersByCause.autres.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  📋 Autres causes
                  <Badge variant="default">{dossiersByCause.autres.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-2">
                {dossiersByCause.autres.map((dossier) => (
                  <SubstitutionCard
                    key={`${dossier.type}-${dossier.ref}`}
                    dossier={dossier}
                    darkMode={darkMode}
                    compact
                    onSubstitute={() => {
                      setSelectedDossier(dossier);
                      setShowSubstitutionModal(true);
                    }}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {filteredDossiers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-400">Aucun dossier à substituer dans cette catégorie</p>
          </CardContent>
        </Card>
      )}

      {/* Modal de substitution */}
      {showSubstitutionModal && selectedDossier && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                ⚡ Substitution - {selectedDossier.ref}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Détails du dossier */}
              <div className={cn('p-3 rounded-lg', darkMode ? 'bg-slate-700/50' : 'bg-gray-50')}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{selectedDossier.icon}</span>
                      <span className="font-mono text-xs text-orange-400">{selectedDossier.ref}</span>
                      <BureauTag bureau={selectedDossier.bureau} />
                      <Badge variant="urgent">J+{selectedDossier.delay}</Badge>
                    </div>
                    <p className="font-bold text-sm">{selectedDossier.desc}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Cause: {selectedDossier.reason}</p>
                  </div>
                  <span className="font-mono font-bold text-lg text-amber-400">{selectedDossier.amount}</span>
                </div>
              </div>

              {/* Substituants suggérés */}
              <div>
                <h4 className="font-bold text-xs mb-2 flex items-center gap-2">
                  👥 Substituants suggérés (algorithme automatique)
                </h4>
                <div className="space-y-2">
                  {selectedDossier.suggestedSubstitutes.map((suggestion, i) => (
                    <div
                      key={suggestion.employee.id}
                      className={cn(
                        'p-3 rounded-lg border-2 cursor-pointer transition-all',
                        selectedSubstitute?.id === suggestion.employee.id
                          ? 'border-orange-500 bg-orange-500/10'
                          : darkMode ? 'border-slate-600 hover:border-slate-500' : 'border-gray-200 hover:border-gray-300'
                      )}
                      onClick={() => setSelectedSubstitute(suggestion.employee)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm',
                              i === 0 ? 'bg-gradient-to-br from-orange-500 to-amber-500' : 'bg-slate-600'
                            )}>
                              {suggestion.employee.initials}
                            </div>
                            {i === 0 && (
                              <span className="absolute -top-1 -right-1 text-xs">🏆</span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{suggestion.employee.name}</p>
                            <p className="text-[10px] text-slate-400">{suggestion.employee.role}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <BureauTag bureau={suggestion.employee.bureau} />
                              <Badge
                                variant={
                                  suggestion.availability === 'available' ? 'success' :
                                  suggestion.availability === 'partial' ? 'warning' : 'urgent'
                                }
                                className="text-[9px]"
                              >
                                {suggestion.availability === 'available' ? 'Disponible' :
                                 suggestion.availability === 'partial' ? 'Partiellement' : 'Occupé'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={cn(
                            'px-2 py-1 rounded font-bold text-sm',
                            suggestion.score >= 50 ? 'bg-emerald-500/20 text-emerald-400' :
                            suggestion.score >= 30 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'
                          )}>
                            Score: {suggestion.score}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1 justify-end">
                            {suggestion.reasons.slice(0, 2).map((reason, j) => (
                              <span key={j} className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Autres employés disponibles */}
              <div>
                <h4 className="font-bold text-xs mb-2">Autres employés disponibles</h4>
                <div className="flex flex-wrap gap-2">
                  {availableEmployees
                    .filter((e) => !selectedDossier.suggestedSubstitutes.find((s) => s.employee.id === e.id))
                    .slice(0, 6)
                    .map((emp) => (
                      <button
                        key={emp.id}
                        className={cn(
                          'px-2 py-1 rounded text-xs flex items-center gap-1 transition-all',
                          selectedSubstitute?.id === emp.id
                            ? 'bg-orange-500 text-white'
                            : darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'
                        )}
                        onClick={() => setSelectedSubstitute(emp)}
                      >
                        <span className="font-bold">{emp.initials}</span>
                        <span>{emp.name}</span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Note de substitution */}
              <div>
                <p className="text-xs font-bold mb-2">Note de substitution (optionnel)</p>
                <textarea
                  placeholder="Justification ou instructions particulières..."
                  value={substitutionNote}
                  onChange={(e) => setSubstitutionNote(e.target.value)}
                  rows={2}
                  className={cn(
                    'w-full px-3 py-2 rounded text-xs',
                    darkMode ? 'bg-slate-800 border border-slate-600' : 'bg-white border border-gray-300'
                  )}
                />
              </div>

              {/* Info traçabilité */}
              <div className={cn('p-2 rounded text-[10px]', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                <p className="text-slate-400">
                  ⚠️ Cette substitution sera enregistrée avec :
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Hash SHA3-256</span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">Nouvelle délégation</span>
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">Décision tracée</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                <Button
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500"
                  disabled={!selectedSubstitute}
                  onClick={() => selectedSubstitute && handleSubstitute(selectedDossier, selectedSubstitute, substitutionNote)}
                >
                  ⚡ Confirmer substitution → {selectedSubstitute?.name || '...'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowSubstitutionModal(false);
                    setSelectedSubstitute(null);
                    setSubstitutionNote('');
                  }}
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info principe substitution */}
      <Card className="border-orange-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h3 className="font-bold text-sm text-orange-400">Principe de substitution automatique</h3>
              <p className="text-xs text-slate-400 mt-1">
                L'algorithme de suggestion croise plusieurs critères pour proposer les meilleurs substituants :
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-[10px]">
                <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/50' : 'bg-gray-100')}>
                  <span className="text-emerald-400 font-bold">+30 pts</span>
                  <p className="text-slate-400">Même bureau</p>
                </div>
                <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/50' : 'bg-gray-100')}>
                  <span className="text-blue-400 font-bold">+25 pts</span>
                  <p className="text-slate-400">Délégation active</p>
                </div>
                <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/50' : 'bg-gray-100')}>
                  <span className="text-purple-400 font-bold">+20 pts</span>
                  <p className="text-slate-400">Par compétence</p>
                </div>
                <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/50' : 'bg-gray-100')}>
                  <span className="text-amber-400 font-bold">+15 pts</span>
                  <p className="text-slate-400">Bureau BMO</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                Les employés en absence planifiée (plannedAbsences) sont automatiquement exclus ou pénalisés selon l'impact.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Composant carte substitution
function SubstitutionCard({
  dossier,
  darkMode,
  compact = false,
  onSubstitute,
}: {
  dossier: SubstitutableDossier;
  darkMode: boolean;
  compact?: boolean;
  onSubstitute: () => void;
}) {
  return (
    <div className={cn(
      'p-3 rounded-lg border-l-4 border-l-amber-500',
      darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-lg">{dossier.icon}</span>
            <span className="font-mono text-[10px] text-orange-400">{dossier.ref}</span>
            <BureauTag bureau={dossier.bureau} />
            <Badge variant="urgent">J+{dossier.delay}</Badge>
            {dossier.type === 'blocked' && (
              <Badge variant="warning">Bloqué</Badge>
            )}
          </div>
          <p className={cn('font-semibold', compact ? 'text-xs' : 'text-sm')}>{dossier.desc}</p>
          <p className="text-[10px] text-slate-400 mt-1">{dossier.reason}</p>

          {/* Mini suggestions */}
          {!compact && dossier.suggestedSubstitutes.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-slate-400">Suggérés:</span>
              <div className="flex -space-x-2">
                {dossier.suggestedSubstitutes.slice(0, 3).map((s, i) => (
                  <div
                    key={s.employee.id}
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2',
                      i === 0 ? 'bg-orange-500 border-orange-300 z-30' :
                      i === 1 ? 'bg-amber-500 border-amber-300 z-20' : 'bg-slate-500 border-slate-300 z-10'
                    )}
                    title={`${s.employee.name} (Score: ${s.score})`}
                  >
                    {s.employee.initials}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="text-right">
          <span className="font-mono font-bold text-amber-400">{dossier.amount}</span>
        </div>
      </div>
      <div className="flex gap-1 mt-2">
        <Button
          size="xs"
          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500"
          onClick={onSubstitute}
        >
          ⚡ Substituer
        </Button>
        <Button size="xs" variant="info">👁</Button>
        <Button size="xs" variant="secondary">📧 Relancer</Button>
      </div>
    </div>
  );
}
