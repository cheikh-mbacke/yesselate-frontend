'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { litiges } from '@/lib/data';

// Type pour les litiges
type LitigeItem = typeof litiges[number];

// WHY: Parsing robuste des montants (FCFA)
const parseMontant = (value: string | number): number => {
  if (typeof value === 'number') return value;
  const cleaned = value.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// WHY: Export CSV enrichi — inclut origine, RACI, hash, statut
const exportLitigesAsCSV = (
  litigesList: LitigeItem[],
  addToast: (message: string, type?: 'success' | 'warning' | 'info' | 'error') => void
) => {
  const headers = [
    'ID',
    'Adversaire',
    'Objet',
    'Montant (FCFA)',
    'Exposition (FCFA)',
    'Statut',
    'Type',
    'Juridiction',
    'Avocat',
    'Prochain RDV',
    'Origine décisionnelle',
    'ID décision',
    'Rôle RACI',
    'Hash traçabilité',
    'Statut BMO',
  ];

  const rows = litigesList.map(l => [
    l.id,
    l.adversaire,
    `"${l.objet}"`,
    l.montant.toString(),
    l.exposure.toString(),
    l.status,
    l.type,
    l.juridiction,
    l.avocat,
    l.prochainRdv || '',
    l.decisionBMO?.origin || 'Hors périmètre BMO',
    l.decisionBMO?.decisionId || '',
    l.decisionBMO?.validatorRole || '',
    l.decisionBMO?.hash || '',
    l.decisionBMO ? 'Piloté' : 'Non piloté',
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `litiges_bmo_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  addToast('✅ Export Litiges généré (traçabilité RACI incluse)', 'success');
};

export default function LitigesPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog, currentUser } = useBMOStore();
  const [selectedLitige, setSelectedLitige] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'journal' | 'deadlines' | 'documents'>('journal');

  // Calculs sécurisés
  const stats = useMemo(() => {
    const totalMontant = litiges.reduce(
      (a, l) => a + parseMontant(l.montant),
      0
    );
    const totalExposition = litiges.reduce(
      (a, l) => a + parseMontant(l.exposure),
      0
    );
    const byType = litiges.reduce((acc, l) => {
      acc[l.type] = (acc[l.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const prochainRdv = litiges
      .filter((l) => l.prochainRdv)
      .sort((a, b) => {
        const dateA = new Date(a.prochainRdv!.split('/').reverse().join('-'));
        const dateB = new Date(b.prochainRdv!.split('/').reverse().join('-'));
        return dateA.getTime() - dateB.getTime();
      })[0];

    const upcomingDeadlines = litiges
      .flatMap((l) => l.deadlines.map((d) => ({ ...d, litigeId: l.id, adversaire: l.adversaire })))
      .filter((d) => d.status === 'upcoming' || d.status === 'urgent')
      .sort((a, b) => {
        const dateA = new Date(a.date.split('/').reverse().join('-'));
        const dateB = new Date(b.date.split('/').reverse().join('-'));
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5);

    return { totalMontant, totalExposition, byType, prochainRdv, upcomingDeadlines };
  }, []);

  const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    en_cours: { label: 'En cours', color: 'info', icon: '⏳' },
    audience_prevue: { label: 'Audience prévue', color: 'warning', icon: '📅' },
    mediation: { label: 'Médiation', color: 'default', icon: '🤝' },
    expertise: { label: 'Expertise', color: 'info', icon: '🔍' },
    appel: { label: 'Appel', color: 'warning', icon: '📜' },
    clos_gagne: { label: 'Clos - Gagné', color: 'success', icon: '✅' },
    clos_perdu: { label: 'Clos - Perdu', color: 'urgent', icon: '❌' },
    transaction: { label: 'Transaction', color: 'default', icon: '🤝' },
  };

  const typeConfig: Record<string, { icon: string; color: string }> = {
    Commercial: { icon: '💼', color: 'text-blue-400' },
    Travail: { icon: '👷', color: 'text-amber-400' },
    Assurance: { icon: '🛡️', color: 'text-emerald-400' },
    Construction: { icon: '🏗️', color: 'text-orange-400' },
    Autre: { icon: '📋', color: 'text-slate-400' },
  };

  const journalTypeConfig: Record<string, { icon: string; color: string }> = {
    acte: { icon: '📄', color: 'text-blue-400' },
    audience: { icon: '⚖️', color: 'text-amber-400' },
    decision: { icon: '📜', color: 'text-emerald-400' },
    signification: { icon: '📮', color: 'text-orange-400' },
    expertise: { icon: '🔍', color: 'text-purple-400' },
    mediation: { icon: '🤝', color: 'text-cyan-400' },
    appel: { icon: '📢', color: 'text-red-400' },
    autre: { icon: '📋', color: 'text-slate-400' },
  };

  const handleOpenDossier = (litige: typeof litiges[0]) => {
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'audit', // Mapping vers ActionLogType valide
      module: 'litiges',
      targetId: litige.id,
      targetType: 'Litige',
      targetLabel: `Consultation dossier ${litige.adversaire}`,
      details: `Ouverture du dossier litige ${litige.id}`,
      bureau: 'BJ',
    });
    setSelectedLitige(litige.id);
  };

  const handleDemanderArbitrage = (litige: typeof litiges[0]) => {
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'creation',
      module: 'arbitrages',
      targetId: litige.id,
      targetType: 'Litige',
      targetLabel: `Demande arbitrage ${litige.adversaire}`,
      details: `Demande d'arbitrage pour litige ${litige.id} - Exposition: ${litige.exposure} FCFA`,
      bureau: 'BMO',
    });
    addToast(`Demande d'arbitrage créée pour ${litige.id}`, 'success');
  };

  const selectedLitigeData = selectedLitige
    ? litiges.find((l) => l.id === selectedLitige)
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            ⚖️ Litiges Pilotés
            <Badge variant="urgent">{litiges.length}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Contentieux <strong>sous contrôle BMO</strong> — Unité : FCFA
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => exportLitigesAsCSV(litiges, addToast)}
          >
            📊 Exporter (CSV RACI)
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={() => addToast('Nouveau litige', 'info')}
          >
            ➕ Nouveau
          </Button>
        </div>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-red-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-red-400">
              {(stats.totalMontant / 1_000_000).toFixed(1)}M
            </p>
            <p className="text-[10px] text-slate-400">Montant en litige</p>
          </CardContent>
        </Card>
        <Card className="border-orange-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-orange-400">
              {(stats.totalExposition / 1_000_000).toFixed(1)}M
            </p>
            <p className="text-[10px] text-slate-400">Exposition estimée</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{litiges.filter(l => l.decisionBMO).length}</p>
            <p className="text-[10px] text-slate-400">Pilotés par BMO</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.upcomingDeadlines.length}</p>
            <p className="text-[10px] text-slate-400">Échéances proches</p>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par type */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(stats.byType).map(([type, count]) => {
          const config = typeConfig[type] || typeConfig.Autre;
          return (
            <Badge key={type} variant="default" className="text-xs">
              <span className={config.color}>{config.icon}</span>
              <span className="ml-1">{type}: {count}</span>
            </Badge>
          );
        })}
      </div>

      {/* Prochaine échéance importante */}
      {stats.prochainRdv && (
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="text-xs font-bold">Prochain RDV juridique</p>
                  <p className="text-sm text-red-400">
                    {stats.prochainRdv.prochainRdvType} - {stats.prochainRdv.adversaire}
                  </p>
                </div>
              </div>
              <Badge variant="urgent">{stats.prochainRdv.prochainRdv}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Échéances à venir */}
      {stats.upcomingDeadlines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              📅 Échéances à surveiller
              <Badge variant="warning">{stats.upcomingDeadlines.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.upcomingDeadlines.map((deadline) => (
              <div
                key={deadline.id}
                className={cn(
                  'p-2 rounded-lg flex items-center justify-between',
                  deadline.status === 'urgent'
                    ? 'bg-red-500/10 border border-red-500/30'
                    : 'bg-slate-700/30'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={deadline.status === 'urgent' ? 'text-red-400' : 'text-amber-400'}>
                    {deadline.status === 'urgent' ? '🚨' : '📅'}
                  </span>
                  <div>
                    <p className="text-xs font-semibold">{deadline.title}</p>
                    <p className="text-[10px] text-slate-400">{deadline.adversaire}</p>
                  </div>
                </div>
                <Badge variant={deadline.status === 'urgent' ? 'urgent' : 'warning'}>
                  {deadline.date}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Liste des litiges */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            ⚖️ Litiges en cours
            <Badge variant="urgent">{litiges.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {litiges.map((litige) => {
            const status = statusConfig[litige.status] || statusConfig.en_cours;
            const type = typeConfig[litige.type] || typeConfig.Autre;
            return (
              <div
                key={litige.id}
                className={cn(
                  'p-3 rounded-lg border-l-4 cursor-pointer transition-all',
                  selectedLitige === litige.id
                    ? 'border-l-orange-500 bg-orange-500/10'
                    : 'border-l-red-500 hover:bg-slate-700/30',
                  darkMode ? 'bg-slate-700/20' : 'bg-gray-100'
                )}
                onClick={() => handleOpenDossier(litige)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] text-orange-400">{litige.id}</span>
                      <Badge variant="default" className="text-[9px]">
                        <span className={type.color}>{type.icon}</span>
                        <span className="ml-1">{litige.type}</span>
                      </Badge>
                      <Badge
                        variant={status.color as 'info' | 'warning' | 'default' | 'success' | 'urgent'}
                        className="text-[9px]"
                      >
                        {status.icon} {status.label}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-sm mt-1">{litige.objet}</h4>
                    <p className="text-xs text-slate-400">vs {litige.adversaire}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-red-400">{litige.montant} FCFA</p>
                    <p className="text-[10px] text-orange-400">
                      Exposition: {litige.exposure} FCFA
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Juridiction: </span>
                    <span>{litige.juridiction}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Avocat: </span>
                    <span className="text-blue-400">{litige.avocat}</span>
                  </div>
                  {litige.numeroAffaire && (
                    <div>
                      <span className="text-slate-400">N° Affaire: </span>
                      <span className="font-mono">{litige.numeroAffaire}</span>
                    </div>
                  )}
                  {litige.prochainRdv && (
                    <div>
                      <span className="text-slate-400">Prochain RDV: </span>
                      <span className="text-red-400 font-semibold">{litige.prochainRdv}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-2 flex justify-between items-center">
                  <div className="flex gap-1">
                    <Button
                      size="xs"
                      variant="info"
                      onClick={(e) => { e.stopPropagation(); handleOpenDossier(litige); }}
                    >
                      📋 Dossier
                    </Button>
                    <Button
                      size="xs"
                      variant="warning"
                      onClick={(e) => { e.stopPropagation(); handleDemanderArbitrage(litige); }}
                    >
                      ⚖️ Arbitrage
                    </Button>
                    {litige.projetName && (
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={(e) => { e.stopPropagation(); addToast(`Voir projet ${litige.projet}`, 'info'); }}
                      >
                        🔗 {litige.projetName}
                      </Button>
                    )}
                  </div>
                  <div className="text-right">
                    {litige.decisionBMO ? (
                      <Badge variant="success" className="text-[9px]">✅ Piloté</Badge>
                    ) : (
                      <Badge variant="warning" className="text-[9px]">⚠️ Hors BMO</Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Détail du litige sélectionné */}
      {selectedLitigeData && (
        <Card className="border-orange-500/30">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                📋 Dossier {selectedLitigeData.id}
                <Badge variant="info">{selectedLitigeData.statusLabel}</Badge>
              </span>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setSelectedLitige(null)}
              >
                ✕
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Résumé */}
            {selectedLitigeData.resume && (
              <div className="p-3 rounded-lg bg-slate-700/30 text-sm">
                <p className="text-slate-400 text-[10px] mb-1">Résumé de l'affaire</p>
                <p>{selectedLitigeData.resume}</p>
              </div>
            )}

            {/* Décision BMO */}
            {selectedLitigeData.decisionBMO && (
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <p className="text-[10px] text-purple-400 mb-1">Décision BMO</p>
                <Badge variant="default" className="text-[9px]">
                  {selectedLitigeData.decisionBMO.validatorRole === 'A' ? 'BMO (Accountable)' : 'BM (Responsible)'}
                </Badge>
                <div className="flex items-center gap-2 mt-2">
                  <code className="text-[10px] bg-slate-800/50 px-1 rounded">
                    {selectedLitigeData.decisionBMO.hash.slice(0, 32)}...
                  </code>
                  <Button
                    size="xs"
                    variant="ghost"
                    className="text-[10px] text-blue-400 p-0 h-auto"
                    onClick={async () => {
                      const isValid = selectedLitigeData.decisionBMO?.hash.startsWith('SHA3-256:');
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

            {/* Informations parties */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2 text-xs">
                <h5 className="font-bold text-amber-400">🏢 Partie adverse</h5>
                <div className="p-2 rounded bg-slate-700/20">
                  <p><span className="text-slate-400">Nom:</span> {selectedLitigeData.adversaire}</p>
                  {selectedLitigeData.adversaireContact && (
                    <p><span className="text-slate-400">Contact:</span> {selectedLitigeData.adversaireContact}</p>
                  )}
                  {selectedLitigeData.adversaireAvocat && (
                    <p><span className="text-slate-400">Avocat:</span> {selectedLitigeData.adversaireAvocat}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <h5 className="font-bold text-blue-400">⚖️ Notre défense</h5>
                <div className="p-2 rounded bg-slate-700/20">
                  <p><span className="text-slate-400">Avocat:</span> {selectedLitigeData.avocat}</p>
                  {selectedLitigeData.avocatContact && (
                    <p><span className="text-slate-400">Contact:</span> {selectedLitigeData.avocatContact}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Onglets */}
            <div className="flex gap-1 p-1 rounded-lg bg-slate-800/50">
              {[
                { id: 'journal' as const, label: 'Journal procédural', icon: '📜', count: selectedLitigeData.journal.length },
                { id: 'deadlines' as const, label: 'Échéances', icon: '📅', count: selectedLitigeData.deadlines.length },
                { id: 'documents' as const, label: 'Documents', icon: '📁', count: selectedLitigeData.documents.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-[10px] font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'text-slate-400 hover:bg-slate-700/50'
                  )}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <Badge variant="default" className="text-[8px] px-1">{tab.count}</Badge>
                </button>
              ))}
            </div>

            {/* Contenu onglets */}
            {activeTab === 'journal' && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedLitigeData.journal.length > 0 ? (
                  selectedLitigeData.journal.map((entry, index) => {
                    const config = journalTypeConfig[entry.type] || journalTypeConfig.autre;
                    return (
                      <div
                        key={entry.id}
                        className={cn(
                          'p-2 rounded-lg border-l-2',
                          index === 0 ? 'border-l-orange-500 bg-orange-500/10' : 'border-l-slate-600 bg-slate-700/20'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-2">
                            <span className={config.color}>{config.icon}</span>
                            <div>
                              <p className="text-[11px] font-semibold">{entry.title}</p>
                              <p className="text-[10px] text-slate-400">{entry.description}</p>
                              <p className="text-[9px] text-slate-500 mt-1">
                                {entry.date} {entry.agent && `• ${entry.agent}`}
                              </p>
                            </div>
                          </div>
                          {entry.document && (
                            <Button
                              size="xs"
                              variant="ghost"
                              className="text-[9px] text-blue-400"
                              onClick={() => addToast(`Voir document ${entry.document}`, 'info')}
                            >
                              📎
                            </Button>
                          )}
                        </div>
                        {entry.outcome && (
                          <p className="text-[9px] text-emerald-400 mt-1 pl-6">→ {entry.outcome}</p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-500 text-center py-4">Aucune entrée</p>
                )}
              </div>
            )}

            {activeTab === 'deadlines' && (
              <div className="space-y-2">
                {selectedLitigeData.deadlines.length > 0 ? (
                  selectedLitigeData.deadlines.map((deadline) => (
                    <div
                      key={deadline.id}
                      className={cn(
                        'p-2 rounded-lg flex items-center justify-between',
                        deadline.status === 'urgent'
                          ? 'bg-red-500/10 border border-red-500/30'
                          : deadline.status === 'completed'
                          ? 'bg-emerald-500/10 border border-emerald-500/30'
                          : 'bg-slate-700/30'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span>
                          {deadline.status === 'urgent' && '🚨'}
                          {deadline.status === 'upcoming' && '📅'}
                          {deadline.status === 'completed' && '✅'}
                          {deadline.status === 'passed' && '⏰'}
                        </span>
                        <div>
                          <p className="text-xs font-semibold">{deadline.title}</p>
                          {deadline.description && (
                            <p className="text-[10px] text-slate-400">{deadline.description}</p>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={
                          deadline.status === 'urgent'
                            ? 'urgent'
                            : deadline.status === 'completed'
                            ? 'success'
                            : 'warning'
                        }
                      >
                        {deadline.date}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-4">Aucune échéance</p>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="grid grid-cols-2 gap-2">
                {selectedLitigeData.documents.length > 0 ? (
                  selectedLitigeData.documents.map((doc) => (
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
                          {doc.type === 'assignation' && '📄'}
                          {doc.type === 'conclusions' && '📝'}
                          {doc.type === 'jugement' && '⚖️'}
                          {doc.type === 'expertise' && '🔍'}
                          {doc.type === 'correspondance' && '📮'}
                          {doc.type === 'piece' && '📎'}
                          {doc.type === 'autre' && '📋'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-medium truncate">{doc.name}</p>
                          <p className="text-[9px] text-slate-500">{doc.date}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-4 col-span-2">Aucun document</p>
                )}
              </div>
            )}

            {/* Lien recouvrement source */}
            {selectedLitigeData.linkedRecovery && (
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <p className="text-[10px] text-slate-400">Recouvrement source</p>
                <Button
                  size="xs"
                  variant="ghost"
                  className="text-amber-400 p-0 h-auto"
                  onClick={() => addToast(`Voir recouvrement ${selectedLitigeData.linkedRecovery}`, 'info')}
                >
                  🔗 {selectedLitigeData.linkedRecovery}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
