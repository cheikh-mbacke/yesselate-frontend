'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { blockedDossiers, employees, projects, decisions } from '@/lib/data';
import type { BlockedDossier } from '@/lib/types/bmo.types';

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

type ViewMode = 'all' | 'type' | 'impact' | 'bureau';
type ImpactFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';

export default function BlockedPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog, openSubstitutionModal } = useBMOStore();
  const [viewMode, setViewMode] = useState<ViewMode>('impact');
  const [impactFilter, setImpactFilter] = useState<ImpactFilter>('all');
  const [selectedDossier, setSelectedDossier] = useState<BlockedDossier | null>(null);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');

  // Utilisateur actuel (simulé)
  const currentUser = {
    id: 'USR-001',
    name: 'A. DIALLO',
    role: 'Directeur Général',
    bureau: 'BMO',
  };

  // Filtrer par impact
  const filteredDossiers = useMemo(() => {
    if (impactFilter === 'all') return blockedDossiers;
    return blockedDossiers.filter((d) => d.impact === impactFilter);
  }, [impactFilter]);

  // Grouper par type
  const dossiersByType = useMemo(() => {
    const grouped: Record<string, BlockedDossier[]> = {};
    blockedDossiers.forEach((d) => {
      if (!grouped[d.type]) grouped[d.type] = [];
      grouped[d.type].push(d);
    });
    return grouped;
  }, []);

  // Grouper par impact
  const dossiersByImpact = useMemo(() => ({
    critical: blockedDossiers.filter((d) => d.impact === 'critical'),
    high: blockedDossiers.filter((d) => d.impact === 'high'),
    medium: blockedDossiers.filter((d) => d.impact === 'medium'),
    low: blockedDossiers.filter((d) => d.impact === 'low'),
  }), []);

  // Grouper par bureau
  const dossiersByBureau = useMemo(() => {
    const grouped: Record<string, BlockedDossier[]> = {};
    blockedDossiers.forEach((d) => {
      if (!grouped[d.bureau]) grouped[d.bureau] = [];
      grouped[d.bureau].push(d);
    });
    return grouped;
  }, []);

  // Stats
  const stats = useMemo(() => ({
    total: blockedDossiers.length,
    critical: dossiersByImpact.critical.length,
    high: dossiersByImpact.high.length,
    medium: dossiersByImpact.medium.length,
    avgDelay: Math.round(blockedDossiers.reduce((acc, d) => acc + d.delay, 0) / blockedDossiers.length),
  }), [dossiersByImpact]);

  // Actions
  const handleSubstitute = (dossier: BlockedDossier) => {
    openSubstitutionModal(dossier);
  };

  const handleEscalate = (dossier: BlockedDossier) => {
    const hash = generateSHA3Hash(`${dossier.id}-escalate-${Date.now()}`);

    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'escalade',
      module: 'blocked',
      targetId: dossier.id,
      targetType: dossier.type,
      targetLabel: dossier.subject,
      details: `Dossier escaladé - Impact: ${dossier.impact} - Délai: ${dossier.delay}j - Hash: ${hash}`,
      bureau: dossier.bureau,
    });

    addToast(`⬆️ ${dossier.id} escaladé vers comité de direction`, 'warning');
  };

  const handleRequestDocument = (dossier: BlockedDossier) => {
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'complement',
      module: 'blocked',
      targetId: dossier.id,
      targetType: dossier.type,
      targetLabel: dossier.subject,
      details: 'Demande de pièce complémentaire',
      bureau: dossier.bureau,
    });

    addToast(`📎 Pièce demandée pour ${dossier.id}`, 'info');
  };

  const handleResolve = (dossier: BlockedDossier, justification: string) => {
    const hash = generateSHA3Hash(`${dossier.id}-resolve-${Date.now()}`);

    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'resolution',
      module: 'blocked',
      targetId: dossier.id,
      targetType: dossier.type,
      targetLabel: dossier.subject,
      details: `Dossier résolu - Justification: ${justification} - Hash: ${hash}`,
      bureau: dossier.bureau,
    });

    addToast(`✓ ${dossier.id} résolu - Decision enregistrée`, 'success');
    setShowResolutionModal(false);
    setResolutionNote('');
  };

  // Couleur selon impact
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-amber-400 bg-amber-500/20';
      case 'medium': return 'text-blue-400 bg-blue-500/20';
      case 'low': return 'text-slate-400 bg-slate-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getImpactBorder = (impact: string) => {
    switch (impact) {
      case 'critical': return 'border-l-red-500';
      case 'high': return 'border-l-amber-500';
      case 'medium': return 'border-l-blue-500';
      case 'low': return 'border-l-slate-500';
      default: return 'border-l-slate-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🚧 Dossiers bloqués
            <Badge variant="urgent">{stats.total}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Résumé par type et impact • Délai moyen: <span className="text-amber-400 font-bold">{stats.avgDelay}j</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={viewMode === 'impact' ? 'default' : 'secondary'} onClick={() => setViewMode('impact')}>
            Par impact
          </Button>
          <Button size="sm" variant={viewMode === 'type' ? 'default' : 'secondary'} onClick={() => setViewMode('type')}>
            Par type
          </Button>
          <Button size="sm" variant={viewMode === 'bureau' ? 'default' : 'secondary'} onClick={() => setViewMode('bureau')}>
            Par bureau
          </Button>
          <Button size="sm" variant={viewMode === 'all' ? 'default' : 'secondary'} onClick={() => setViewMode('all')}>
            Liste
          </Button>
        </div>
      </div>

      {/* Alerte critique */}
      {stats.critical > 0 && (
        <div className={cn(
          'rounded-xl p-3 flex items-center gap-3 border animate-pulse',
          darkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
        )}>
          <span className="text-2xl">🚨</span>
          <div className="flex-1">
            <p className="font-bold text-sm text-red-400">
              {stats.critical} dossier(s) critique(s) - Action immédiate requise
            </p>
            <p className="text-xs text-slate-400">
              Impact majeur sur les opérations en cours
            </p>
          </div>
          <Link href="/maitre-ouvrage/substitution">
            <Button size="sm" variant="destructive">
              ⚡ Substitution en masse
            </Button>
          </Link>
        </div>
      )}

      {/* Stats par impact */}
      <div className="grid grid-cols-5 gap-3">
        <Card
          className={cn('cursor-pointer transition-all', impactFilter === 'all' && 'ring-2 ring-orange-500')}
          onClick={() => setImpactFilter('all')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-[10px] text-slate-400">Total</p>
          </CardContent>
        </Card>
        <Card
          className={cn('cursor-pointer transition-all border-red-500/30', impactFilter === 'critical' && 'ring-2 ring-red-500')}
          onClick={() => setImpactFilter('critical')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
            <p className="text-[10px] text-slate-400">Critiques</p>
          </CardContent>
        </Card>
        <Card
          className={cn('cursor-pointer transition-all border-amber-500/30', impactFilter === 'high' && 'ring-2 ring-amber-500')}
          onClick={() => setImpactFilter('high')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.high}</p>
            <p className="text-[10px] text-slate-400">Élevé</p>
          </CardContent>
        </Card>
        <Card
          className={cn('cursor-pointer transition-all border-blue-500/30', impactFilter === 'medium' && 'ring-2 ring-blue-500')}
          onClick={() => setImpactFilter('medium')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.medium}</p>
            <p className="text-[10px] text-slate-400">Moyen</p>
          </CardContent>
        </Card>
        <Card className="border-orange-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">{stats.avgDelay}j</p>
            <p className="text-[10px] text-slate-400">Délai moyen</p>
          </CardContent>
        </Card>
      </div>

      {/* Vue par impact */}
      {viewMode === 'impact' && (
        <div className="space-y-4">
          {Object.entries(dossiersByImpact).map(([impact, dossiers]) => dossiers.length > 0 && (
            <Card key={impact} className={cn('border-l-4', getImpactBorder(impact))}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  {impact === 'critical' && '🚨 Impact Critique'}
                  {impact === 'high' && '⚠️ Impact Élevé'}
                  {impact === 'medium' && '📊 Impact Moyen'}
                  {impact === 'low' && '📋 Impact Faible'}
                  <Badge variant={impact === 'critical' ? 'urgent' : impact === 'high' ? 'warning' : 'info'}>
                    {dossiers.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dossiers.map((dossier) => (
                  <DossierCard
                    key={dossier.id}
                    dossier={dossier}
                    darkMode={darkMode}
                    onSubstitute={() => handleSubstitute(dossier)}
                    onEscalate={() => handleEscalate(dossier)}
                    onRequest={() => handleRequestDocument(dossier)}
                    onResolve={() => { setSelectedDossier(dossier); setShowResolutionModal(true); }}
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vue par type */}
      {viewMode === 'type' && (
        <div className="space-y-4">
          {Object.entries(dossiersByType).map(([type, dossiers]) => (
            <Card key={type}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  {type === 'Paiement' && '💳'}
                  {type === 'Validation' && '✅'}
                  {type === 'Contrat' && '📜'}
                  {type}
                  <Badge variant="info">{dossiers.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dossiers.map((dossier) => (
                  <DossierCard
                    key={dossier.id}
                    dossier={dossier}
                    darkMode={darkMode}
                    onSubstitute={() => handleSubstitute(dossier)}
                    onEscalate={() => handleEscalate(dossier)}
                    onRequest={() => handleRequestDocument(dossier)}
                    onResolve={() => { setSelectedDossier(dossier); setShowResolutionModal(true); }}
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vue par bureau */}
      {viewMode === 'bureau' && (
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(dossiersByBureau).map(([bureau, dossiers]) => (
            <Card key={bureau}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BureauTag bureau={bureau} />
                  <Badge variant="warning">{dossiers.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dossiers.map((dossier) => (
                  <div key={dossier.id} className={cn('p-2 rounded-lg border-l-4', getImpactBorder(dossier.impact), darkMode ? 'bg-slate-700/30' : 'bg-gray-50')}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono text-[10px] text-orange-400">{dossier.id}</span>
                        <p className="text-xs font-semibold">{dossier.subject}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="urgent">J+{dossier.delay}</Badge>
                        <Button size="xs" variant="warning" onClick={() => handleSubstitute(dossier)}>⚡</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vue liste */}
      {viewMode === 'all' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">ID</th>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">Type</th>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">Sujet</th>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">Raison</th>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">Projet</th>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">Impact</th>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">Délai</th>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDossiers.map((dossier) => (
                    <tr key={dossier.id} className={cn('border-t hover:bg-orange-500/5', darkMode ? 'border-slate-700/50' : 'border-gray-100')}>
                      <td className="px-3 py-2.5">
                        <span className="font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">{dossier.id}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant="info">{dossier.type}</Badge>
                      </td>
                      <td className="px-3 py-2.5 max-w-[150px] truncate">{dossier.subject}</td>
                      <td className="px-3 py-2.5 max-w-[150px] truncate text-slate-400">{dossier.reason}</td>
                      <td className="px-3 py-2.5 text-orange-400">{dossier.project}</td>
                      <td className="px-3 py-2.5">
                        <Badge variant={dossier.impact === 'critical' ? 'urgent' : dossier.impact === 'high' ? 'warning' : 'default'} pulse={dossier.impact === 'critical'}>
                          {dossier.impact}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant="urgent">J+{dossier.delay}</Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          <Button size="xs" variant="warning" onClick={() => handleSubstitute(dossier)}>⚡</Button>
                          <Button size="xs" variant="info" onClick={() => handleEscalate(dossier)}>⬆️</Button>
                          <Button size="xs" variant="secondary" onClick={() => handleRequestDocument(dossier)}>📎</Button>
                          <Link href={`/maitre-ouvrage/projets-en-cours?id=${dossier.project}`}>
                            <Button size="xs" variant="ghost">📂</Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal résolution */}
      {showResolutionModal && selectedDossier && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                ✅ Résolution dossier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={cn('p-3 rounded-lg', darkMode ? 'bg-slate-700/50' : 'bg-gray-50')}>
                <span className="font-mono text-xs text-red-400">{selectedDossier.id}</span>
                <p className="font-bold text-sm mt-1">{selectedDossier.subject}</p>
                <p className="text-xs text-slate-400">{selectedDossier.reason}</p>
                <div className="flex items-center gap-2 mt-2">
                  <BureauTag bureau={selectedDossier.bureau} />
                  <Badge variant={selectedDossier.impact === 'critical' ? 'urgent' : 'warning'}>
                    Impact {selectedDossier.impact}
                  </Badge>
                  <Badge variant="urgent">J+{selectedDossier.delay}</Badge>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold mb-2">Justification de la résolution *</p>
                <textarea
                  placeholder="Décrivez comment le blocage a été résolu..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  rows={3}
                  className={cn(
                    'w-full px-3 py-2 rounded text-xs',
                    darkMode ? 'bg-slate-800 border border-slate-600' : 'bg-white border border-gray-300'
                  )}
                />
              </div>

              <div className={cn('p-2 rounded text-[10px]', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                <p className="text-slate-400">
                  ⚠️ Cette action créera une entrée dans le registre des décisions avec hash cryptographique et lien vers la preuve.
                </p>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                <Button
                  className="flex-1"
                  disabled={!resolutionNote.trim()}
                  onClick={() => handleResolve(selectedDossier, resolutionNote)}
                >
                  ✓ Marquer comme résolu
                </Button>
                <Button variant="secondary" onClick={() => { setShowResolutionModal(false); setResolutionNote(''); }}>
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info traçabilité */}
      <Card className="border-orange-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔐</span>
            <div>
              <h3 className="font-bold text-sm text-orange-400">Traçabilité des résolutions</h3>
              <p className="text-xs text-slate-400 mt-1">
                Chaque action sur un dossier bloqué génère une entrée traçable :
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-[10px]">
                <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/50' : 'bg-gray-100')}>
                  <span className="text-amber-400 font-bold">⚡ Substitution</span>
                  <p className="text-slate-400">→ Décision + Délégation</p>
                </div>
                <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/50' : 'bg-gray-100')}>
                  <span className="text-blue-400 font-bold">⬆️ Escalade</span>
                  <p className="text-slate-400">→ Décision + Notification</p>
                </div>
                <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/50' : 'bg-gray-100')}>
                  <span className="text-purple-400 font-bold">📎 Demande pièce</span>
                  <p className="text-slate-400">→ Échange inter-bureaux</p>
                </div>
                <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/50' : 'bg-gray-100')}>
                  <span className="text-emerald-400 font-bold">✅ Résolution</span>
                  <p className="text-slate-400">→ Décision + Justification + Hash</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Composant carte dossier
function DossierCard({
  dossier,
  darkMode,
  onSubstitute,
  onEscalate,
  onRequest,
  onResolve,
}: {
  dossier: BlockedDossier;
  darkMode: boolean;
  onSubstitute: () => void;
  onEscalate: () => void;
  onRequest: () => void;
  onResolve: () => void;
}) {
  const getImpactBorder = (impact: string) => {
    switch (impact) {
      case 'critical': return 'border-l-red-500';
      case 'high': return 'border-l-amber-500';
      case 'medium': return 'border-l-blue-500';
      default: return 'border-l-slate-500';
    }
  };

  return (
    <div className={cn('p-3 rounded-lg border-l-4', getImpactBorder(dossier.impact), darkMode ? 'bg-slate-700/30' : 'bg-gray-50')}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">{dossier.id}</span>
            <Badge variant="info">{dossier.type}</Badge>
            <BureauTag bureau={dossier.bureau} />
            <Badge variant="urgent">J+{dossier.delay}</Badge>
          </div>
          <p className="font-semibold text-sm">{dossier.subject}</p>
          <p className="text-[10px] text-slate-400 mt-1">{dossier.reason}</p>
          <div className="flex items-center gap-2 mt-1 text-[10px]">
            <span className="text-slate-400">Projet:</span>
            <Link href={`/maitre-ouvrage/projets-en-cours?id=${dossier.project}`} className="text-orange-400 hover:underline">
              {dossier.project}
            </Link>
            <span className="text-slate-400">•</span>
            <span className="text-slate-400">Responsable:</span>
            <span>{dossier.responsible}</span>
          </div>
        </div>
        <span className="font-mono font-bold text-amber-400">{dossier.amount}</span>
      </div>
      <div className="flex gap-1 mt-2">
        <Button size="xs" variant="warning" onClick={onSubstitute}>⚡ Substituer</Button>
        <Button size="xs" variant="info" onClick={onEscalate}>⬆️ Escalader</Button>
        <Button size="xs" variant="secondary" onClick={onRequest}>📎 Demander pièce</Button>
        <Link href={`/maitre-ouvrage/projets-en-cours?id=${dossier.project}`}>
          <Button size="xs" variant="ghost">📂 Ouvrir projet</Button>
        </Link>
        <Button size="xs" variant="success" onClick={onResolve}>✓</Button>
      </div>
    </div>
  );
}
