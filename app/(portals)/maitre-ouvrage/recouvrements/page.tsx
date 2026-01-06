'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { recouvrements } from '@/lib/data';

export default function RecouvrementsPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [selectedRecouvrement, setSelectedRecouvrement] = useState<string | null>(null);

  // Calculs
  const stats = useMemo(() => {
    const total = recouvrements.reduce(
      (a, r) => a + parseFloat(r.montant.replace(/,/g, '')),
      0
    );
    const byStatus = {
      relance: recouvrements.filter((r) => r.status === 'relance').length,
      huissier: recouvrements.filter((r) => r.status === 'huissier').length,
      contentieux: recouvrements.filter((r) => r.status === 'contentieux').length,
    };
    const prochainAction = recouvrements
      .filter((r) => r.nextActionDate)
      .sort((a, b) => {
        const dateA = new Date(a.nextActionDate!.split('/').reverse().join('-'));
        const dateB = new Date(b.nextActionDate!.split('/').reverse().join('-'));
        return dateA.getTime() - dateB.getTime();
      })[0];

    return { total, byStatus, prochainAction };
  }, []);

  const formatMontant = (montant: string) => {
    return montant;
  };

  const statusConfig = {
    relance: { color: 'amber', label: 'Relance', icon: '📧' },
    huissier: { color: 'orange', label: 'Huissier', icon: '⚖️' },
    contentieux: { color: 'red', label: 'Contentieux', icon: '🚨' },
  };

  const actionTypeConfig: Record<string, { icon: string; color: string }> = {
    relance_email: { icon: '📧', color: 'text-blue-400' },
    relance_courrier: { icon: '📮', color: 'text-amber-400' },
    relance_telephone: { icon: '📞', color: 'text-emerald-400' },
    mise_en_demeure: { icon: '⚠️', color: 'text-orange-400' },
    huissier: { icon: '⚖️', color: 'text-red-400' },
    contentieux: { icon: '🚨', color: 'text-red-500' },
    echeancier: { icon: '📅', color: 'text-purple-400' },
    paiement_partiel: { icon: '💰', color: 'text-emerald-500' },
  };

  const handleRelance = (rec: typeof recouvrements[0]) => {
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      action: 'creation',
      module: 'recouvrements',
      targetId: rec.id,
      targetType: 'Recouvrement',
      targetLabel: `Relance ${rec.debiteur}`,
      details: `Nouvelle relance envoyée pour créance de ${rec.montant} FCFA`,
      bureau: 'BF',
    });
    addToast(`Relance envoyée à ${rec.debiteur}`, 'success');
  };

  const handleEscalade = (rec: typeof recouvrements[0], target: 'huissier' | 'contentieux') => {
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      action: 'modification',
      module: 'recouvrements',
      targetId: rec.id,
      targetType: 'Recouvrement',
      targetLabel: `Escalade ${rec.debiteur}`,
      details: `Dossier escaladé vers ${target === 'huissier' ? 'huissier' : 'contentieux'}`,
      bureau: 'BF',
    });
    addToast(`Dossier ${rec.id} escaladé vers ${target}`, 'warning');
  };

  const selectedRecData = selectedRecouvrement
    ? recouvrements.find((r) => r.id === selectedRecouvrement)
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            📜 Recouvrements
            <Badge variant="warning">{recouvrements.length}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Créances à recouvrer et suivi des actions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => addToast('Export en cours...', 'info')}
          >
            📊 Exporter
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={() => addToast('Nouveau recouvrement', 'info')}
          >
            ➕ Nouveau
          </Button>
        </div>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-amber-400">
              {(stats.total / 1000000).toFixed(1)}M
            </p>
            <p className="text-[10px] text-slate-400">Total à recouvrer</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.byStatus.relance}</p>
            <p className="text-[10px] text-slate-400">En relance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">{stats.byStatus.huissier}</p>
            <p className="text-[10px] text-slate-400">Chez huissier</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.byStatus.contentieux}</p>
            <p className="text-[10px] text-slate-400">En contentieux</p>
          </CardContent>
        </Card>
        <Card className="border-purple-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-purple-400">{recouvrements.length}</p>
            <p className="text-[10px] text-slate-400">Dossiers actifs</p>
          </CardContent>
        </Card>
      </div>

      {/* Prochaine action */}
      {stats.prochainAction && (
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⏰</span>
                <div>
                  <p className="text-xs font-bold">Prochaine action requise</p>
                  <p className="text-sm text-orange-400">
                    {stats.prochainAction.nextAction} - {stats.prochainAction.debiteur}
                  </p>
                </div>
              </div>
              <Badge variant="warning">{stats.prochainAction.nextActionDate}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des recouvrements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            💰 Créances à recouvrer
            <Badge variant="warning">{recouvrements.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">ID</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Débiteur</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Montant</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Retard</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Statut</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Dernière action</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Prochaine action</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recouvrements.map((rec) => {
                  const status = statusConfig[rec.status as keyof typeof statusConfig];
                  return (
                    <tr
                      key={rec.id}
                      className={cn(
                        'border-t cursor-pointer',
                        darkMode
                          ? 'border-slate-700/50 hover:bg-orange-500/5'
                          : 'border-gray-100 hover:bg-gray-50',
                        selectedRecouvrement === rec.id && 'bg-orange-500/10'
                      )}
                      onClick={() => setSelectedRecouvrement(rec.id)}
                    >
                      <td className="px-3 py-2.5">
                        <span className="font-mono text-[10px] text-orange-400">{rec.id}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div>
                          <p className="font-semibold">{rec.debiteur}</p>
                          <p className="text-[10px] text-slate-400">{rec.type}</p>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="font-mono font-bold text-amber-400">{formatMontant(rec.montant)} FCFA</p>
                        {rec.montantRecouvre && rec.montantRecouvre !== '0' && (
                          <p className="text-[10px] text-emerald-400">
                            Recouvré: {rec.montantRecouvre} FCFA
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge
                          variant={rec.delay > 60 ? 'urgent' : rec.delay > 30 ? 'warning' : 'default'}
                        >
                          J+{rec.delay}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge
                          variant={
                            rec.status === 'contentieux'
                              ? 'urgent'
                              : rec.status === 'huissier'
                              ? 'warning'
                              : 'info'
                          }
                        >
                          {status?.icon} {status?.label}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        <div>
                          <p className="text-[10px]">{rec.lastAction}</p>
                          <p className="text-[9px] text-slate-500">{rec.lastActionDate}</p>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        {rec.nextAction ? (
                          <div>
                            <p className="text-[10px] text-orange-400">{rec.nextAction}</p>
                            <p className="text-[9px] text-slate-500">{rec.nextActionDate}</p>
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <Button
                            size="xs"
                            variant="info"
                            onClick={() => handleRelance(rec)}
                            title="Relancer"
                          >
                            📧
                          </Button>
                          <Button
                            size="xs"
                            variant="warning"
                            onClick={() => addToast('Générer échéancier', 'info')}
                            title="Échéancier"
                          >
                            📅
                          </Button>
                          {rec.status === 'relance' && (
                            <Button
                              size="xs"
                              variant="urgent"
                              onClick={() => handleEscalade(rec, 'huissier')}
                              title="Escalader huissier"
                            >
                              ⚖️
                            </Button>
                          )}
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

      {/* Détail du recouvrement sélectionné */}
      {selectedRecData && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Informations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span>📋 Détails - {selectedRecData.id}</span>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => setSelectedRecouvrement(null)}
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-slate-400">Débiteur</p>
                  <p className="font-semibold">{selectedRecData.debiteur}</p>
                </div>
                <div>
                  <p className="text-slate-400">Type</p>
                  <p>{selectedRecData.type}</p>
                </div>
                <div>
                  <p className="text-slate-400">Contact</p>
                  <p>{selectedRecData.contact || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Téléphone</p>
                  <p>{selectedRecData.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Email</p>
                  <p className="text-blue-400">{selectedRecData.email || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Échéance initiale</p>
                  <p>{selectedRecData.dateEcheance}</p>
                </div>
              </div>

              {selectedRecData.projetName && (
                <div className="p-2 rounded-lg bg-slate-700/30">
                  <p className="text-slate-400 text-[10px]">Projet lié</p>
                  <p className="font-semibold text-orange-400">
                    {selectedRecData.projet} - {selectedRecData.projetName}
                  </p>
                </div>
              )}

              {selectedRecData.linkedLitigation && (
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-slate-400 text-[10px]">Litige associé</p>
                  <Button
                    size="xs"
                    variant="ghost"
                    className="text-red-400 p-0 h-auto"
                    onClick={() => addToast(`Voir litige ${selectedRecData.linkedLitigation}`, 'info')}
                  >
                    🔗 {selectedRecData.linkedLitigation}
                  </Button>
                </div>
              )}

              {/* Échéancier si présent */}
              {selectedRecData.echeancier && (
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <p className="text-[10px] text-slate-400 mb-2">📅 Échéancier en cours</p>
                  <div className="space-y-1">
                    {selectedRecData.echeancier.echeances.map((ech) => (
                      <div
                        key={ech.numero}
                        className="flex items-center justify-between text-[10px]"
                      >
                        <span>Échéance {ech.numero}</span>
                        <span>{ech.montant} FCFA</span>
                        <span>{ech.dateEcheance}</span>
                        <Badge
                          variant={
                            ech.status === 'paid'
                              ? 'success'
                              : ech.status === 'late'
                              ? 'urgent'
                              : 'default'
                          }
                          className="text-[8px]"
                        >
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
              <CardTitle className="text-sm flex items-center gap-2">
                📜 Historique des relances
                <Badge variant="default">{selectedRecData.history.length}</Badge>
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
                        index === 0 ? 'border-l-orange-500 bg-orange-500/10' : 'border-l-slate-600 bg-slate-700/20'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className={config.color}>{config.icon}</span>
                          <div>
                            <p className="text-[11px] font-semibold">{action.description}</p>
                            <p className="text-[9px] text-slate-500">
                              {action.date} • {action.agent}
                            </p>
                          </div>
                        </div>
                        {action.document && (
                          <Button
                            size="xs"
                            variant="ghost"
                            className="text-[9px] text-blue-400"
                            onClick={() => addToast(`Voir document ${action.document}`, 'info')}
                          >
                            📎
                          </Button>
                        )}
                      </div>
                      {action.result && (
                        <p className="text-[9px] text-amber-400 mt-1 pl-6">→ {action.result}</p>
                      )}
                      {action.montant && (
                        <p className="text-[9px] text-emerald-400 mt-1 pl-6">💰 {action.montant} FCFA</p>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-500 text-center py-4">Aucun historique</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Documents */}
      {selectedRecData && selectedRecData.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              📁 Documents associés
              <Badge variant="default">{selectedRecData.documents.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {selectedRecData.documents.map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    'p-2 rounded-lg border cursor-pointer hover:border-orange-500/50 transition-colors',
                    darkMode ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200'
                  )}
                  onClick={() => addToast(`Ouvrir ${doc.name}`, 'info')}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {doc.type === 'courrier' && '📮'}
                      {doc.type === 'mise_en_demeure' && '⚠️'}
                      {doc.type === 'huissier' && '⚖️'}
                      {doc.type === 'echeancier' && '📅'}
                      {doc.type === 'preuve_paiement' && '💰'}
                      {doc.type === 'autre' && '📋'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium truncate">{doc.name}</p>
                      <p className="text-[9px] text-slate-500">{doc.date}</p>
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
