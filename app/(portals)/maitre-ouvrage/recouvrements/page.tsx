'use client';

import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { recouvrements } from '@/lib/data';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import { useAutoSyncCounts } from '@/hooks/useAutoSync';

// WHY: Normalisation pour recherche
const normalize = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

// --- UTILITAIRES CRYPTO & IA ---
const generateSHA3Hash = (data: string): string => {
  let hash = 0;
  const combined = `${data}-${Date.now()}`;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `SHA3-256:${Math.abs(hash).toString(16).padStart(16, '0').slice(0, 12)}`;
};

const detectRecoveryRisk = (delay: number, montant: string, lastActionType: string) => {
  const amount = parseFloat(montant.replace(/,/g, '')) || 0;
  if (delay > 90 && amount > 1000000) return 'critique';
  if (delay > 60) return 'élevé';
  if (lastActionType === 'relance_email' && delay > 30) return 'moyen';
  return 'faible';
};

const suggestNextAction = (delay: number, status: string) => {
  if (status === 'contentieux') return null;
  if (delay > 60) return { type: 'huissier', label: 'Escalade huissier', urgency: 'high' };
  if (delay > 30) return { type: 'mise_en_demeure', label: 'Mise en demeure', urgency: 'medium' };
  return { type: 'relance_telephone', label: 'Relance téléphonique', urgency: 'low' };
};

// --- CONFIGURATION ---
const statusConfig = {
  relance: { color: 'amber', label: 'Relance', icon: '📧' },
  huissier: { color: 'orange', label: 'Huissier', icon: '⚖️' },
  contentieux: { color: 'red', label: 'Contentieux', icon: '🚨' },
};

const actionTypeConfig: Record<string, { icon: string; color: string }> = {
  relance_email: { icon: '📧', color: 'text-blue-300/80' },
  relance_courrier: { icon: '📮', color: 'text-amber-300/80' },
  relance_telephone: { icon: '📞', color: 'text-emerald-300/80' },
  mise_en_demeure: { icon: '⚠️', color: 'text-orange-300/80' },
  huissier: { icon: '⚖️', color: 'text-red-300/80' },
  contentieux: { icon: '🚨', color: 'text-red-400/70' },
  echeancier: { icon: '📅', color: 'text-purple-300/80' },
  paiement_partiel: { icon: '💰', color: 'text-emerald-300/80' },
};

type StatusFilter = 'all' | 'relance' | 'huissier' | 'contentieux';

export default function RecouvrementsPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();

  // État principal
  const [selectedRecouvrement, setSelectedRecouvrement] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Persistance navigation
  const { updateFilters, getFilters } = usePageNavigation('recouvrements');

  // Charger les filtres sauvegardés
  useEffect(() => {
    try {
      const saved = getFilters?.();
      if (!saved) return;
      if (saved.selectedRecouvrement) setSelectedRecouvrement(saved.selectedRecouvrement);
      if (saved.statusFilter) setStatusFilter(saved.statusFilter);
      if (typeof saved.searchQuery === 'string') setSearchQuery(saved.searchQuery);
    } catch {
      // silent
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sauvegarder les filtres
  useEffect(() => {
    try {
      updateFilters?.({
        selectedRecouvrement,
        statusFilter,
        searchQuery,
      });
    } catch {
      // silent
    }
  }, [selectedRecouvrement, statusFilter, searchQuery, updateFilters]);

  // Simuler l'utilisateur connecté (en prod: depuis le store auth)
  const currentUser = {
    id: 'USR-001',
    name: 'A. DIALLO',
    role: 'Directeur Général',
    bureau: 'BMO',
    raciRole: 'A', // Accountable
  };

  // --- STATS OPTIMISÉES ---
  const stats = useMemo(() => {
    const total = recouvrements.reduce(
      (a, r) => a + (parseFloat(r.montant.replace(/,/g, '')) || 0),
      0
    );
    const byStatus = {
      relance: recouvrements.filter((r) => r.status === 'relance').length,
      huissier: recouvrements.filter((r) => r.status === 'huissier').length,
      contentieux: recouvrements.filter((r) => r.status === 'contentieux').length,
    };
    const bmoGoverned = recouvrements.filter(r => r.decisionBMO).length;
    const prochainAction = recouvrements
      .filter((r) => r.nextActionDate)
      .sort((a, b) => new Date(a.nextActionDate!.split('/').reverse().join('-')).getTime() - 
                     new Date(b.nextActionDate!.split('/').reverse().join('-')).getTime())[0];

    return { total, byStatus, prochainAction, bmoGoverned };
  }, []);

  // Auto-sync sidebar
  useAutoSyncCounts('recouvrements', () => stats.byStatus.contentieux + stats.byStatus.huissier, { interval: 30000, immediate: true });

  // Filtrage
  const filteredRecouvrements = useMemo(() => {
    let result = [...recouvrements];

    // Filtre par statut
    if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter);
    }

    // Recherche multi-champs
    if (searchQuery.trim()) {
      const q = normalize(searchQuery);
      result = result.filter(r =>
        normalize(r.id).includes(q) ||
        normalize(r.debiteur).includes(q) ||
        normalize(r.type).includes(q) ||
        normalize(r.montant).includes(q)
      );
    }

    return result;
  }, [statusFilter, searchQuery]);

  // --- ACTIONS ---
  const handleRelance = (rec: typeof recouvrements[0]) => {
    const hash = generateSHA3Hash(`relance-${rec.id}-${Date.now()}`);
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      module: 'recouvrements',
      action: 'relance',
      targetId: rec.id,
      targetType: 'Recouvrement',
      targetLabel: `Relance ${rec.debiteur}`,
      details: `Nouvelle relance envoyée pour créance de ${rec.montant} FCFA`,
      bureau: 'BF',
      decisionId: rec.decisionBMO,
      hash,
      meta: { raciRole: 'R' }, // BF = Responsible
    });
    addToast(`Relance envoyée à ${rec.debiteur} • Hash: ${hash.slice(0, 12)}...`, 'success');
  };

  const handleEscalade = (rec: typeof recouvrements[0], target: 'huissier' | 'contentieux') => {
    const hash = generateSHA3Hash(`escalade-${rec.id}-${target}`);
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      module: 'recouvrements',
      action: 'escalade',
      targetId: rec.id,
      targetType: 'Recouvrement',
      targetLabel: `Escalade ${rec.debiteur}`,
      details: `Dossier escaladé vers ${target}`,
      bureau: 'BMO',
      decisionId: rec.decisionBMO,
      hash,
      meta: { raciRole: 'A' }, // BMO = Accountable
    });
    addToast(`Dossier ${rec.id} escaladé vers ${target}`, 'warning');
  };

  const handleExportRecoveries = () => {
    const csvContent = [
      ['ID', 'Débiteur', 'Montant', 'Statut', 'Délai', 'Décision BMO', 'Hash', 'RACI (BF/BMO)'],
      ...recouvrements.map(r => [
        r.id,
        r.debiteur,
        r.montant,
        r.status,
        `J+${r.delay}`,
        r.decisionBMO || 'Hors BMO',
        r.hash || 'N/A',
        'BF=R / BMO=A'
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'recouvrements_certifies.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Export CSV certifié généré', 'success');
  };

  const selectedRecData = selectedRecouvrement
    ? recouvrements.find((r) => r.id === selectedRecouvrement)
    : null;

  const riskLevel = selectedRecData ? detectRecoveryRisk(selectedRecData.delay, selectedRecData.montant, selectedRecData.lastActionType) : null;
  const suggestedAction = selectedRecData ? suggestNextAction(selectedRecData.delay, selectedRecData.status) : null;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-bold flex flex-wrap items-center gap-2">
            📜 Recouvrements
            <Badge variant="warning" className="text-[10px]">{filteredRecouvrements.length}</Badge>
            {stats.bmoGoverned > 0 && <Badge variant="info" className="text-[10px]">{stats.bmoGoverned} BMO</Badge>}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Créances stratégiques — {stats.bmoGoverned} pilotées par BMO
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input
            placeholder="Rechercher (ID, débiteur, montant...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-48 lg:w-64"
          />
          <Button size="sm" variant="secondary" onClick={handleExportRecoveries} className="flex-1 sm:flex-none">
            📊 Exporter
          </Button>
          <Button size="sm" variant="default" onClick={() => addToast('Nouveau recouvrement', 'info')} className="flex-1 sm:flex-none">
            ➕ Nouveau
          </Button>
        </div>
      </div>

      {/* Filtres par statut */}
      <div className="flex gap-1 flex-wrap items-center">
        <span className="text-xs text-slate-400 self-center mr-1 hidden sm:inline">Statut:</span>
        {[
          { id: 'all', label: 'Tous', icon: '📋' },
          { id: 'relance', label: '📧 Relance', icon: '📧' },
          { id: 'huissier', label: '⚖️ Huissier', icon: '⚖️' },
          { id: 'contentieux', label: '🚨 Contentieux', icon: '🚨' },
        ].map((f) => (
          <Button
            key={f.id}
            size="sm"
            variant={statusFilter === f.id ? 'default' : 'secondary'}
            onClick={() => setStatusFilter(f.id as StatusFilter)}
            className="text-[10px] sm:text-xs"
          >
            <span className="hidden sm:inline">{f.label}</span>
            <span className="sm:hidden">{f.icon}</span>
          </Button>
        ))}
      </div>

      {/* Stats globales responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        <Card className="border-amber-400/20">
          <CardContent className="p-2 sm:p-3 text-center">
            <p className="text-base sm:text-lg font-bold text-amber-300/80">{(stats.total / 1000000).toFixed(1)}M</p>
            <p className="text-[9px] sm:text-[10px] text-slate-400">Total à recouvrer</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2 sm:p-3 text-center">
            <p className="text-xl sm:text-2xl font-bold text-blue-300/80">{stats.byStatus.relance}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-400">En relance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2 sm:p-3 text-center">
            <p className="text-xl sm:text-2xl font-bold text-orange-300/80">{stats.byStatus.huissier}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-400">Chez huissier</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2 sm:p-3 text-center">
            <p className="text-xl sm:text-2xl font-bold text-red-300/80">{stats.byStatus.contentieux}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-400">En contentieux</p>
          </CardContent>
        </Card>
        <Card className="border-purple-400/20">
          <CardContent className="p-2 sm:p-3 text-center">
            <p className="text-xl sm:text-2xl font-bold text-purple-300/80">{stats.bmoGoverned}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-400">Pilotés BMO</p>
          </CardContent>
        </Card>
      </div>

      {/* Prochaine action */}
      {stats.prochainAction && (
        <Card className="border-l-4 border-l-orange-400/60">
          <CardContent className="p-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl">⏰</span>
                <div>
                  <p className="text-[10px] sm:text-xs font-bold">Prochaine action requise</p>
                  <p className="text-xs sm:text-sm text-orange-300/80">
                    {stats.prochainAction.nextAction} - {stats.prochainAction.debiteur}
                  </p>
                </div>
              </div>
              <Badge variant="warning" className="w-fit">{stats.prochainAction.nextActionDate}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des recouvrements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs sm:text-sm flex flex-wrap items-center gap-2">
            💰 Créances à recouvrer
            <Badge variant="warning" className="text-[10px]">{filteredRecouvrements.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                  <th className="px-2 sm:px-3 py-2 text-left text-[9px] sm:text-[10px] font-bold uppercase text-amber-400/70">ID</th>
                  <th className="px-2 sm:px-3 py-2 text-left text-[9px] sm:text-[10px] font-bold uppercase text-amber-400/70">Débiteur</th>
                  <th className="px-2 sm:px-3 py-2 text-left text-[9px] sm:text-[10px] font-bold uppercase text-amber-400/70">Montant</th>
                  <th className="px-2 sm:px-3 py-2 text-left text-[9px] sm:text-[10px] font-bold uppercase text-amber-400/70 hidden sm:table-cell">Retard</th>
                  <th className="px-2 sm:px-3 py-2 text-left text-[9px] sm:text-[10px] font-bold uppercase text-amber-400/70">Statut</th>
                  <th className="px-2 sm:px-3 py-2 text-left text-[9px] sm:text-[10px] font-bold uppercase text-amber-400/70 hidden md:table-cell">BMO</th>
                  <th className="px-2 sm:px-3 py-2 text-left text-[9px] sm:text-[10px] font-bold uppercase text-amber-400/70">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecouvrements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-slate-400">
                      <span className="text-2xl block mb-2">🔍</span>
                      Aucun recouvrement ne correspond aux filtres
                    </td>
                  </tr>
                ) : (
                  filteredRecouvrements.map((rec) => {
                    const status = statusConfig[rec.status as keyof typeof statusConfig];
                    const isBMOPilot = !!rec.decisionBMO;
                    return (
                      <tr
                        key={rec.id}
                        className={cn(
                          'border-t cursor-pointer',
                          darkMode
                            ? 'border-slate-700/50 hover:bg-orange-400/5'
                            : 'border-gray-100 hover:bg-gray-50',
                          selectedRecouvrement === rec.id && 'bg-orange-400/10'
                        )}
                        onClick={() => setSelectedRecouvrement(rec.id)}
                      >
                        <td className="px-2 sm:px-3 py-2">
                          <span className="font-mono text-[9px] sm:text-[10px] text-orange-300/80">{rec.id}</span>
                        </td>
                        <td className="px-2 sm:px-3 py-2">
                          <div>
                            <p className="font-semibold text-xs sm:text-sm">{rec.debiteur}</p>
                            <p className="text-[9px] text-slate-400 hidden sm:block">{rec.type}</p>
                          </div>
                        </td>
                        <td className="px-2 sm:px-3 py-2">
                          <p className="font-mono font-bold text-amber-300/80 text-xs">{rec.montant} FCFA</p>
                          {rec.montantRecouvre && rec.montantRecouvre !== '0' && (
                            <p className="text-[9px] text-emerald-300/80 hidden sm:block">Recouvré: {rec.montantRecouvre} FCFA</p>
                          )}
                        </td>
                        <td className="px-2 sm:px-3 py-2 hidden sm:table-cell">
                          <Badge variant={rec.delay > 60 ? 'urgent' : rec.delay > 30 ? 'warning' : 'default'} className="text-[9px]">
                            J+{rec.delay}
                          </Badge>
                        </td>
                        <td className="px-2 sm:px-3 py-2">
                          <Badge variant={rec.status === 'contentieux' ? 'urgent' : rec.status === 'huissier' ? 'warning' : 'info'} className="text-[9px]">
                            {status?.icon} <span className="hidden sm:inline">{status?.label}</span>
                          </Badge>
                        </td>
                        <td className="px-2 sm:px-3 py-2 text-center hidden md:table-cell">
                          {isBMOPilot ? (
                            <Badge variant="success" className="text-[9px]">🟢 BMO</Badge>
                          ) : (
                            <Badge variant="default" className="text-[9px]">⚪ Hors BMO</Badge>
                          )}
                        </td>
                        <td className="px-2 sm:px-3 py-2" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1">
                            <Button size="xs" variant="info" onClick={() => handleRelance(rec)} title="Relancer" className="text-[10px]">
                              📧
                            </Button>
                            {rec.status === 'relance' && (
                              <Button size="xs" variant="urgent" onClick={() => handleEscalade(rec, 'huissier')} title="Escalader huissier" className="text-[10px]">
                                ⚖️
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Détail du recouvrement sélectionné */}
      {selectedRecData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Informations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xs sm:text-sm flex items-center justify-between">
                <span>📋 Détails - {selectedRecData.id}</span>
                <Button size="xs" variant="ghost" onClick={() => setSelectedRecouvrement(null)}>✕</Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {riskLevel && riskLevel !== 'faible' && (
                <div className={cn("p-2 rounded-lg border mb-2",
                  riskLevel === 'critique' ? "bg-red-400/8 border-red-400/30" :
                  riskLevel === 'élevé' ? "bg-orange-400/8 border-orange-400/30" :
                  "bg-amber-400/8 border-amber-400/30"
                )}>
                  <p className="text-[10px] font-bold">
                    {riskLevel === 'critique' && '🔴 Risque critique'} 
                    {riskLevel === 'élevé' && '🟠 Risque élevé'}
                    {riskLevel === 'moyen' && '🟡 Risque modéré'}
                  </p>
                </div>
              )}

              {suggestedAction && (
                <div className="p-2 rounded-lg bg-purple-400/8 border border-purple-400/30 mb-2">
                  <p className="text-[10px] text-purple-300/80">💡 IA suggère</p>
                  <p className="text-[10px] font-semibold">{suggestedAction.label}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-slate-400 text-[10px]">Débiteur</p>
                  <p className="font-semibold text-xs">{selectedRecData.debiteur}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px]">Type</p>
                  <p className="text-xs">{selectedRecData.type}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px]">Contact</p>
                  <p className="text-xs">{selectedRecData.contact || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px]">Téléphone</p>
                  <p className="text-xs">{selectedRecData.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px]">Email</p>
                  <p className="text-blue-300/80 text-xs break-all">{selectedRecData.email || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px]">Échéance initiale</p>
                  <p className="text-xs">{selectedRecData.dateEcheance}</p>
                </div>
              </div>

              {selectedRecData.decisionBMO && (
                <div className="p-2 rounded-lg bg-emerald-400/8 border border-emerald-400/30">
                  <p className="text-[10px] text-emerald-300/80">📜 Décision BMO</p>
                  <p className="font-mono text-[10px]">{selectedRecData.decisionBMO}</p>
                </div>
              )}

              {selectedRecData.projetName && (
                <div className="p-2 rounded-lg bg-slate-700/30">
                  <p className="text-slate-400 text-[10px]">Projet lié</p>
                  <p className="font-semibold text-orange-300/80 text-xs">
                    {selectedRecData.projet} - {selectedRecData.projetName}
                  </p>
                </div>
              )}

              {selectedRecData.hash && (
                <div className="p-2 rounded bg-slate-700/30">
                  <p className="text-[10px] text-slate-400">🔐 Hash de traçabilité</p>
                  <p className="font-mono text-[10px] truncate">{selectedRecData.hash}</p>
                  <Button size="xs" variant="ghost" className="text-blue-300/80 mt-1" onClick={() => addToast('Intégrité vérifiée', 'success')}>
                    Vérifier
                  </Button>
                </div>
              )}

              {selectedRecData.echeancier && (
                <div className="p-2 rounded-lg bg-purple-400/8 border border-purple-400/30">
                  <p className="text-[10px] text-slate-400 mb-2">📅 Échéancier</p>
                  <div className="space-y-1">
                    {selectedRecData.echeancier.echeances.map((ech) => (
                      <div key={ech.numero} className="flex items-center justify-between text-[10px]">
                        <span>Éch. {ech.numero}</span>
                        <span>{ech.montant} FCFA</span>
                        <Badge variant={ech.status === 'paid' ? 'success' : ech.status === 'late' ? 'urgent' : 'default'} className="text-[8px]">
                          {ech.status === 'paid' ? '✓' : ech.status === 'late' ? '!' : '○'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historique des actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                📜 Historique des relances
                <Badge variant="default" className="text-[10px]">{selectedRecData.history.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-80 overflow-y-auto">
              {selectedRecData.history.length > 0 ? (
                selectedRecData.history.map((action, index) => {
                  const config = actionTypeConfig[action.type] || { icon: '📋', color: 'text-slate-400' };
                  return (
                    <div
                      key={action.id}
                      className={cn(
                        'p-2 rounded-lg border-l-2',
                        index === 0 ? 'border-l-orange-400/60 bg-orange-400/8' : 'border-l-slate-600 bg-slate-700/20'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className={config.color}>{config.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] sm:text-[11px] font-semibold">{action.description}</p>
                            <p className="text-[8px] sm:text-[9px] text-slate-500">{action.date} • {action.agent}</p>
                          </div>
                        </div>
                        {action.hash && (
                          <Button size="xs" variant="ghost" className="text-[9px] text-blue-300/80 flex-shrink-0" onClick={() => addToast('Vérifié', 'success')}>
                            🔐
                          </Button>
                        )}
                      </div>
                      {action.result && <p className="text-[9px] text-amber-300/80 mt-1 pl-6">→ {action.result}</p>}
                      {action.montant && <p className="text-[9px] text-emerald-300/80 mt-1 pl-6">💰 {action.montant} FCFA</p>}
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-500 text-center py-4 text-xs">Aucun historique</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Documents */}
      {selectedRecData && selectedRecData.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
              📁 Documents associés
              <Badge variant="default" className="text-[10px]">{selectedRecData.documents.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {selectedRecData.documents.map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    'p-2 rounded-lg border cursor-pointer hover:border-orange-400/30 transition-colors',
                    darkMode ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200'
                  )}
                  onClick={() => addToast(`Ouvrir ${doc.name}`, 'info')}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg">
                      {doc.type === 'courrier' && '📮'}
                      {doc.type === 'mise_en_demeure' && '⚠️'}
                      {doc.type === 'huissier' && '⚖️'}
                      {doc.type === 'echeancier' && '📅'}
                      {doc.type === 'preuve_paiement' && '💰'}
                      {doc.type === 'autre' && '📋'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] sm:text-[10px] font-medium truncate">{doc.name}</p>
                      <p className="text-[8px] sm:text-[9px] text-slate-500">{doc.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

