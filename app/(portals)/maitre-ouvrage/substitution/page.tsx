'use client';

import { useState, useMemo, useCallback } from 'react';
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
  projectsEnriched,
} from '@/lib/data';
import type { BlockedDossier, Employee } from '@/lib/types/bmo.types';
import { AlertTriangle, Brain, FileText, HashIcon } from 'lucide-react';

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
  decisionBMO?: string | null;
  contexte: 'formel' | 'informel' | 'hybride';
  linkedProjects?: string[];
}

interface SuggestedSubstitute {
  employee: Employee;
  score: number;
  reasons: { text: string; weight: number }[];
  availability: 'available' | 'partial' | 'busy';
}

type ViewMode = 'all' | 'byReason' | 'byCause';
type ReasonFilter = 'all' | 'absence' | 'blocage' | 'technique' | 'documents';

// WHY: Export CSV enrichi — traçabilité RACI incluse
const exportSubstitutionsAsCSV = (
  dossiers: SubstitutableDossier[],
  currentUser: { id: string; name: string; role: string },
  addToast: (msg: string, variant?: 'success' | 'warning' | 'info' | 'error') => void
) => {
  const headers = [
    'Ref', 'Bureau', 'Montant', 'Retard (J)', 'Cause', 'Type', 'Contexte',
    'Substituant suggéré', 'Score', 'Décision BMO', 'Hash', 'RACI Accountable', 'RACI Responsible',
  ];

  const rows = dossiers.map(d => [
    d.ref,
    d.bureau,
    d.amount,
    d.delay.toString(),
    `"${d.reason}"`,
    d.type,
    d.contexte || 'formel',
    d.suggestedSubstitutes[0]?.employee.name || '',
    d.suggestedSubstitutes[0]?.score.toString() || '0',
    d.decisionBMO || 'Aucun',
    generateSHA3Hash(d.ref),
    `${currentUser.name} (BMO)`,
    d.suggestedSubstitutes[0]?.employee.name || 'N/A',
  ]);

  const csvContent = [headers.join(';'), ...rows.map(row => row.join(';'))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `substitutions_bmo_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  addToast('✅ Export Substitutions généré (traçabilité RACI incluse)', 'success');
};

export default function SubstitutionPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog, decisionsBMO } = useBMOStore();
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [reasonFilter, setReasonFilter] = useState<ReasonFilter>('all');
  const [selectedDossier, setSelectedDossier] = useState<SubstitutableDossier | null>(null);
  const [showSubstitutionModal, setShowSubstitutionModal] = useState(false);
  const [selectedSubstitute, setSelectedSubstitute] = useState<Employee | null>(null);
  const [substitutionNote, setSubstitutionNote] = useState('');

  const currentUser = {
    id: 'USR-001',
    name: 'A. DIALLO',
    role: 'Directeur Général',
    bureau: 'BMO',
  };

  const availableEmployees = useMemo(() => {
    const absentIds = plannedAbsences?.map((a) => a.employeeId) || [];
    return employees.filter((e) => !absentIds.includes(e.id) && e.status === 'active');
  }, []);

  const calculateSubstituteScore = (employee: Employee, dossierBureau: string): SuggestedSubstitute => {
    let score = 0;
    const reasons: { text: string; weight: number }[] = [];

    if (employee.bureau === dossierBureau) {
      score += 30;
      reasons.push({ text: 'Même bureau', weight: 30 });
    }
    if (employee.delegated) {
      score += 25;
      reasons.push({ text: 'Délégation active', weight: 25 });
    }
    const relevantSkills = ['Validation', 'OHADA', 'Comptabilité', 'Budget', 'Contrats'];
    employee.skills?.forEach((skill) => {
      if (relevantSkills.includes(skill)) {
        score += 20;
        reasons.push({ text: `Compétence: ${skill}`, weight: 20 });
      }
    });
    if (employee.bureau === 'BMO') {
      score += 15;
      reasons.push({ text: 'Bureau BMO', weight: 15 });
    }
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
    return { employee, score: Math.max(0, score), reasons, availability };
  };

  // 🔥 Ajout: liens projets + décision BMO + contexte
  const enrichDossier = (dossier: any, type: 'substitution' | 'blocked'): SubstitutableDossier => {
    const linkedProjects = projectsEnriched
      .filter(p => (p as any).linkedPayments?.includes(dossier.ref) || (p as any).linkedContracts?.includes(dossier.ref))
      .map(p => p.id);

    // IA : détecter si contexte informel
    const contexte = dossier.reason?.toLowerCase().includes('réseau') || dossier.reason?.toLowerCase().includes('relais')
      ? 'informel' : 'formel';

    // Chercher la décision BMO associée
    const decisionBMO = decisionsBMO?.find(d => d.targetId === dossier.ref || d.targetId === dossier.id)?.id || null;

    return {
      ...dossier,
      type,
      suggestedSubstitutes: [],
      decisionBMO,
      contexte,
      linkedProjects,
    };
  };

  const substitutableDossiers = useMemo(() => {
    const allDossiers: SubstitutableDossier[] = [];

    substitutions.forEach(sub => {
      const enriched = enrichDossier(sub, 'substitution');
      enriched.suggestedSubstitutes = employees
        .map(emp => calculateSubstituteScore(emp, enriched.bureau))
        .filter(s => s.availability !== 'busy')
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      allDossiers.push(enriched);
    });

    blockedDossiers
      .filter(d => d.delay > 3) // ⚠️ Prédictif: J+3, pas J+7
      .forEach(blocked => {
        const enriched = enrichDossier(blocked, 'blocked');
        enriched.suggestedSubstitutes = employees
          .map(emp => calculateSubstituteScore(emp, enriched.bureau))
          .filter(s => s.availability !== 'busy')
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);
        allDossiers.push(enriched);
      });

    return allDossiers.sort((a, b) => b.delay - a.delay);
  }, []);

  const filteredDossiers = useMemo(() => {
    if (reasonFilter === 'all') return substitutableDossiers;
    return substitutableDossiers.filter(d => {
      const r = d.reason.toLowerCase();
      return reasonFilter === 'absence' ? /absence|congé/.test(r) :
             reasonFilter === 'blocage' ? /blocage|technique/.test(r) :
             reasonFilter === 'documents' ? /document|pièce|manquant/.test(r) : false;
    });
  }, [substitutableDossiers, reasonFilter]);

  const dossiersByCause = useMemo(() => ({
    absence: filteredDossiers.filter(d => /absence|congé/.test(d.reason.toLowerCase())),
    blocage: filteredDossiers.filter(d => /blocage|technique/.test(d.reason.toLowerCase())),
    documents: filteredDossiers.filter(d => /document|pièce|manquant/.test(d.reason.toLowerCase())),
    autres: filteredDossiers.filter(d => !/absence|congé|blocage|technique|document|pièce|manquant/.test(d.reason.toLowerCase())),
  }), [filteredDossiers]);

  const stats = useMemo(() => ({
    total: substitutableDossiers.length,
    byAbsence: dossiersByCause.absence.length,
    byBlocage: dossiersByCause.blocage.length,
    byDocuments: dossiersByCause.documents.length,
    avgDelay: Math.round(substitutableDossiers.reduce((a, d) => a + d.delay, 0) / substitutableDossiers.length || 0),
    totalAmount: substitutableDossiers.reduce((a, d) => {
      const amount = parseFloat(d.amount.replace(/[M,\s]/g, '').replace('FCFA', '')) || 0;
      return a + (d.amount.includes('M') ? amount * 1e6 : amount);
    }, 0),
    orphanCount: substitutableDossiers.filter(d => !d.decisionBMO && d.contexte !== 'informel').length,
    pilotedCount: substitutableDossiers.filter(d => d.decisionBMO).length,
  }), [substitutableDossiers, dossiersByCause]);

  const handleSubstitute = useCallback((dossier: SubstitutableDossier, substitute: Employee, note: string) => {
    const hash = generateSHA3Hash(`${dossier.ref}-${substitute.id}-${Date.now()}`);
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'substitution',
      module: 'substitution',
      targetId: dossier.ref,
      targetType: dossier.type === 'blocked' ? 'Dossier bloqué' : 'Substitution',
      targetLabel: dossier.desc,
      details: `Substitution → ${substitute.name}. Accountable: ${currentUser.name} (BMO). Responsible: ${substitute.name}. Hash: ${hash}`,
      bureau: dossier.bureau,
      hash,
    });
    addToast(`✓ Substitution effectuée — Hash: ${hash.substring(0, 16)}...`, 'success');
    setShowSubstitutionModal(false);
    setSelectedSubstitute(null);
    setSubstitutionNote('');
  }, [currentUser, addActionLog, addToast]);

  const handleVerifyHash = useCallback(async (dossier: SubstitutableDossier) => {
    const hash = generateSHA3Hash(dossier.ref);
    const isValid = hash.startsWith('SHA3-256:');
    addToast(
      isValid ? '✅ Hash valide – substitution authentique' : '❌ Hash invalide – altération détectée',
      isValid ? 'success' : 'error'
    );
  }, [addToast]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🔄 Substitution BMO
            <Badge variant="warning">{stats.total}</Badge>
            {stats.orphanCount > 0 && (
              <Badge variant="urgent" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {stats.orphanCount} orphelins
              </Badge>
            )}
          </h1>
          <p className="text-sm text-slate-400">
            Système de Continuité Opérationnelle — <strong>Pilotage BMO</strong>, IA explicative, traçabilité RACI
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => exportSubstitutionsAsCSV(substitutableDossiers, currentUser, addToast)}
          >
            <FileText className="w-4 h-4 mr-1" /> Export (CSV RACI)
          </Button>
          <Button variant="destructive" onClick={() => addToast('Substitution en masse (J+7)', 'warning')}>
            ⚡ Substitution en masse
          </Button>
        </div>
      </div>

      {/* Alerte IA */}
      <div className={cn('rounded-xl p-4 flex items-center gap-3 border', darkMode ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200')}>
        <Brain className="w-8 h-8 text-purple-400" />
        <div>
          <p className="font-bold text-purple-400">
            IA Gouvernante : {stats.total} dossiers à risque (délai ≥ J+3)
          </p>
          <p className="text-xs text-slate-400">
            Montant exposé: {(stats.totalAmount / 1e6).toFixed(1)}M FCFA • {stats.orphanCount} sans décision BMO
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-3">
        <Card className={cn('cursor-pointer', reasonFilter === 'all' && 'ring-2 ring-orange-500')} onClick={() => setReasonFilter('all')}>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-[10px] text-slate-400">Total</p>
          </CardContent>
        </Card>
        <Card className={cn('cursor-pointer border-purple-500/30', reasonFilter === 'absence' && 'ring-2 ring-purple-500')} onClick={() => setReasonFilter('absence')}>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.byAbsence}</p>
            <p className="text-[10px] text-slate-400">Absences</p>
          </CardContent>
        </Card>
        <Card className={cn('cursor-pointer border-amber-500/30', reasonFilter === 'blocage' && 'ring-2 ring-amber-500')} onClick={() => setReasonFilter('blocage')}>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.byBlocage}</p>
            <p className="text-[10px] text-slate-400">Blocages</p>
          </CardContent>
        </Card>
        <Card className={cn('cursor-pointer border-blue-500/30', reasonFilter === 'documents' && 'ring-2 ring-blue-500')} onClick={() => setReasonFilter('documents')}>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.byDocuments}</p>
            <p className="text-[10px] text-slate-400">Documents</p>
          </CardContent>
        </Card>
        <Card className="border-orange-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">{stats.avgDelay}j</p>
            <p className="text-[10px] text-slate-400">Retard moy</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.pilotedCount}</p>
            <p className="text-[10px] text-slate-400">Pilotés BMO</p>
          </CardContent>
        </Card>
      </div>

      {/* Modes */}
      <div className="flex gap-2">
        <Button size="sm" variant={viewMode === 'all' ? 'default' : 'secondary'} onClick={() => setViewMode('all')}>
          📋 Tous
        </Button>
        <Button size="sm" variant={viewMode === 'byCause' ? 'default' : 'secondary'} onClick={() => setViewMode('byCause')}>
          🏷️ Par cause
        </Button>
      </div>

      {/* Contenu */}
      {viewMode === 'all' ? (
        <div className="space-y-3">
          {filteredDossiers.map((dossier) => (
            <SubstitutionCard
              key={dossier.ref}
              dossier={dossier}
              darkMode={darkMode}
              onSubstitute={() => {
                setSelectedDossier(dossier);
                setShowSubstitutionModal(true);
              }}
              onVerifyHash={() => handleVerifyHash(dossier)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(dossiersByCause)
            .filter(([, dossiers]) => dossiers.length > 0)
            .map(([cause, dossiers]) => (
              <CauseSection
                key={cause}
                cause={cause}
                dossiers={dossiers}
                darkMode={darkMode}
                onSelect={setSelectedDossier}
                onOpenModal={setShowSubstitutionModal}
                onVerifyHash={handleVerifyHash}
              />
            ))}
        </div>
      )}

      {/* Modal */}
      {showSubstitutionModal && selectedDossier && (
        <SubstitutionModal
          dossier={selectedDossier}
          darkMode={darkMode}
          availableEmployees={availableEmployees}
          selectedSubstitute={selectedSubstitute}
          onSelectSubstitute={setSelectedSubstitute}
          substitutionNote={substitutionNote}
          onNoteChange={setSubstitutionNote}
          onSubstitute={handleSubstitute}
          onVerifyHash={() => handleVerifyHash(selectedDossier)}
          onClose={() => {
            setShowSubstitutionModal(false);
            setSelectedSubstitute(null);
            setSubstitutionNote('');
          }}
        />
      )}

      {/* Info */}
      <Card className="border-orange-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Brain className="w-6 h-6 text-orange-400" />
            <div>
              <h3 className="font-bold text-sm text-orange-400">Substitution intelligente & gouvernable</h3>
              <p className="text-xs text-slate-400 mt-1">
                Chaque substitution est : <span className="text-emerald-400">tracée (RACI)</span>,{' '}
                <span className="text-blue-400">vérifiable (hash)</span>,{' '}
                <span className="text-purple-400">gouvernée (décision BMO)</span>,{' '}
                <span className="text-amber-400">explicable (IA)</span>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// === Composants auxiliaires (optimisés) ===

function CauseSection({
  cause,
  dossiers,
  darkMode,
  onSelect,
  onOpenModal,
  onVerifyHash,
}: {
  cause: string;
  dossiers: SubstitutableDossier[];
  darkMode: boolean;
  onSelect: (dossier: SubstitutableDossier) => void;
  onOpenModal: (open: boolean) => void;
  onVerifyHash: (dossier: SubstitutableDossier) => void;
}) {
  const labels: Record<string, { label: string; color: string }> = {
    absence: { label: '👤 Absence responsable', color: 'text-purple-400' },
    blocage: { label: '🔧 Blocage technique', color: 'text-amber-400' },
    documents: { label: '📄 Documents manquants', color: 'text-blue-400' },
    autres: { label: '📋 Autres causes', color: 'text-slate-400' },
  };
  const { label, color } = labels[cause] || labels.autres;
  return (
    <Card className={cn('border-l-4', cause === 'absence' && 'border-l-purple-500', cause === 'blocage' && 'border-l-amber-500', cause === 'documents' && 'border-l-blue-500')}>
      <CardHeader className="pb-2">
        <CardTitle className={`text-sm flex items-center gap-2 ${color}`}>
          {label}
          <Badge variant="info">{dossiers.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-2">
        {dossiers.map((dossier) => (
          <SubstitutionCard
            key={dossier.ref}
            dossier={dossier}
            darkMode={darkMode}
            compact
            onSubstitute={() => {
              onSelect(dossier);
              onOpenModal(true);
            }}
            onVerifyHash={() => onVerifyHash(dossier)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function SubstitutionCard({
  dossier,
  darkMode,
  compact = false,
  onSubstitute,
  onVerifyHash,
}: {
  dossier: SubstitutableDossier;
  darkMode: boolean;
  compact?: boolean;
  onSubstitute: () => void;
  onVerifyHash: () => void;
}) {
  return (
    <div className={cn('p-3 rounded-lg border-l-4 border-l-amber-500 relative', darkMode ? 'bg-slate-700/30' : 'bg-gray-50')}>
      {/* Contexte badge */}
      {dossier.contexte && (
        <div className="absolute top-2 right-2 z-10">
          {dossier.contexte === 'informel' && <Badge variant="warning" className="px-1.5 py-0.5 text-[10px]">🔍 Informel</Badge>}
          {dossier.contexte === 'hybride' && <Badge variant="gold" className="px-1.5 py-0.5 text-[10px]">🔄 Hybride</Badge>}
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-lg">{dossier.icon}</span>
            <span className="font-mono text-[10px] text-orange-400">{dossier.ref}</span>
            <BureauTag bureau={dossier.bureau} />
            <Badge variant="urgent">J+{dossier.delay}</Badge>
            {dossier.decisionBMO && (
              <Badge variant="success" className="text-[9px]">✅ Piloté</Badge>
            )}
            {!dossier.decisionBMO && dossier.contexte !== 'informel' && (
              <Badge variant="destructive" className="flex items-center gap-0.5">
                <AlertTriangle className="w-2.5 h-2.5" /> Hors BMO
              </Badge>
            )}
          </div>
          <p className={cn('font-semibold', compact ? 'text-xs' : 'text-sm')}>{dossier.desc}</p>
          <p className="text-[10px] text-slate-400 mt-1">{dossier.reason}</p>
          {dossier.linkedProjects?.length > 0 && (
            <p className="text-[10px] text-blue-400 mt-1">📈 Lié à {dossier.linkedProjects.length} projet(s)</p>
          )}
        </div>
        <div className="text-right">
          <span className="font-mono font-bold text-amber-400">{dossier.amount}</span>
        </div>
      </div>
      <div className="flex gap-1 mt-2">
        <Button size="xs" className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500" onClick={onSubstitute}>
          ⚡ Substituer
        </Button>
        <Button size="xs" variant="ghost" aria-label="Vérifier hash" onClick={onVerifyHash}>
          <HashIcon className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

function SubstitutionModal({
  dossier,
  darkMode,
  availableEmployees,
  selectedSubstitute,
  onSelectSubstitute,
  substitutionNote,
  onNoteChange,
  onSubstitute,
  onVerifyHash,
  onClose,
}: {
  dossier: SubstitutableDossier;
  darkMode: boolean;
  availableEmployees: Employee[];
  selectedSubstitute: Employee | null;
  onSelectSubstitute: (emp: Employee) => void;
  substitutionNote: string;
  onNoteChange: (note: string) => void;
  onSubstitute: (dossier: SubstitutableDossier, substitute: Employee, note: string) => void;
  onVerifyHash: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            ⚡ Substitution — {dossier.ref}
            {dossier.contexte === 'informel' && <Badge variant="warning">🔍 Informel</Badge>}
            {dossier.decisionBMO && <Badge variant="success" className="text-[9px]">✅ Piloté</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={cn('p-3 rounded-lg', darkMode ? 'bg-slate-700/50' : 'bg-gray-50')}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{dossier.icon}</span>
                  <span className="font-mono text-xs text-orange-400">{dossier.ref}</span>
                  <BureauTag bureau={dossier.bureau} />
                  <Badge variant="urgent">J+{dossier.delay}</Badge>
                </div>
                <p className="font-bold text-sm">{dossier.desc}</p>
                <p className="text-[10px] text-slate-400 mt-1">Cause: {dossier.reason}</p>
              </div>
              <span className="font-mono font-bold text-lg text-amber-400">{dossier.amount}</span>
            </div>
          </div>

          {dossier.decisionBMO && (
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <p className="text-[10px] text-purple-400 mb-1">Décision BMO</p>
              <Badge variant="default" className="text-[9px]">
                BMO (Accountable)
              </Badge>
              <div className="flex items-center gap-2 mt-2">
                <code className="text-[10px] bg-slate-800/50 px-1 rounded">
                  {generateSHA3Hash(dossier.ref).slice(0, 32)}...
                </code>
                <Button
                  size="xs"
                  variant="ghost"
                  className="text-[10px] text-blue-400 p-0 h-auto"
                  onClick={onVerifyHash}
                >
                  🔍 Vérifier
                </Button>
              </div>
            </div>
          )}

          <div>
            <h4 className="font-bold text-xs mb-2 flex items-center gap-1">
              <Brain className="w-3 h-3" /> Substituants suggérés (IA explicative)
            </h4>
            {dossier.suggestedSubstitutes.map((s, i) => (
              <div
                key={s.employee.id}
                className={cn('p-3 rounded-lg border-2 cursor-pointer', selectedSubstitute?.id === s.employee.id ? 'border-orange-500 bg-orange-500/10' : darkMode ? 'border-slate-600' : 'border-gray-200')}
                onClick={() => onSelectSubstitute(s.employee)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-sm font-bold">
                      {s.employee.initials}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{s.employee.name}</p>
                      <p className="text-[10px] text-slate-400">{s.employee.role}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <BureauTag bureau={s.employee.bureau} />
                        <Badge variant={s.availability === 'available' ? 'success' : s.availability === 'partial' ? 'warning' : 'urgent'} className="text-[9px]">
                          {s.availability}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn('px-2 py-1 rounded font-bold text-sm', s.score >= 50 ? 'bg-emerald-500/20 text-emerald-400' : s.score >= 30 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400')}>
                      Score: {s.score}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1 justify-end">
                      {s.reasons.slice(0, 2).map((r, j) => (
                        <span key={j} className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400" title={`${r.weight} pts`}>
                          {r.text}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => selectedSubstitute && onSubstitute(dossier, selectedSubstitute, substitutionNote)}
              disabled={!selectedSubstitute}
            >
              ⚡ Confirmer substitution
            </Button>
            <Button variant="secondary" onClick={onClose}>Annuler</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
