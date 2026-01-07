'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { demandesRH } from '@/lib/data';

export default function DepensesPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'validated' | 'rejected'>('all');
  const [selectedDemande, setSelectedDemande] = useState<string | null>(null);

  // Filtrer uniquement les dépenses
  const depensesDemandes = demandesRH.filter(d => d.type === 'Dépense');
  const filteredDemandes = depensesDemandes.filter(d => filter === 'all' || d.status === filter);

  // Stats
  const stats = useMemo(() => {
    const pending = depensesDemandes.filter(d => d.status === 'pending');
    const validated = depensesDemandes.filter(d => d.status === 'validated');
    const totalPending = pending.reduce((acc, d) => {
      const amount = parseFloat((d.amount || '0').replace(/,/g, ''));
      return acc + amount;
    }, 0);
    const totalValidated = validated.reduce((acc, d) => {
      const amount = parseFloat((d.amount || '0').replace(/,/g, ''));
      return acc + amount;
    }, 0);

    // Par catégorie
    const categories: Record<string, number> = {};
    depensesDemandes.forEach(d => {
      categories[d.subtype] = (categories[d.subtype] || 0) + 1;
    });

    return {
      total: depensesDemandes.length,
      pending: pending.length,
      validated: validated.length,
      rejected: depensesDemandes.filter(d => d.status === 'rejected').length,
      totalPending,
      totalValidated,
      categories,
    };
  }, []);

  const selectedD = selectedDemande ? depensesDemandes.find(d => d.id === selectedDemande) : null;

  const subtypeIcons: Record<string, string> = {
    Mission: '🚗',
    Équipement: '🔧',
    Formation: '🎓',
    Fournitures: '📦',
    Transport: '🚌',
    Autre: '📋',
  };

  // Actions
  const handleApprove = (demande: typeof selectedD) => {
    if (!demande) return;
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'depenses',
      action: 'approve',
      targetId: demande.id,
      targetType: 'HRRequest',
      details: `Dépense ${demande.amount} FCFA approuvée pour ${demande.agent}`,
    });
    addToast(`Dépense approuvée - Lien finance créé`, 'success');
  };

  const handleRequestPieces = (demande: typeof selectedD) => {
    if (!demande) return;
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'depenses',
      action: 'request_pieces',
      targetId: demande.id,
      targetType: 'HRRequest',
      details: 'Pièces justificatives demandées',
    });
    addToast('Pièces justificatives demandées', 'warning');
  };

  const handleReject = (demande: typeof selectedD) => {
    if (!demande) return;
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'depenses',
      action: 'reject',
      targetId: demande.id,
      targetType: 'HRRequest',
      details: 'Dépense refusée',
    });
    addToast('Dépense refusée', 'error');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            💸 Demandes Dépenses
            <Badge variant="warning">{stats.pending} en attente</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Validation des dépenses RH avec lien finance
          </p>
        </div>
        <Button onClick={() => addToast('Nouvelle dépense créée', 'success')}>
          + Nouvelle dépense
        </Button>
      </div>

      {/* Résumé financier */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
            <p className="text-[10px] text-slate-400">En attente</p>
            <p className="font-mono text-sm text-amber-300 mt-1">
              {(stats.totalPending / 1000).toFixed(0)}K FCFA
            </p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.validated}</p>
            <p className="text-[10px] text-slate-400">Validées</p>
            <p className="font-mono text-sm text-emerald-300 mt-1">
              {(stats.totalValidated / 1000).toFixed(0)}K FCFA
            </p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
            <p className="text-[10px] text-slate-400">Refusées</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
            <p className="text-[10px] text-slate-400">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par catégorie */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-bold text-sm mb-3">📊 Par catégorie</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.categories).map(([cat, count]) => (
              <Badge key={cat} variant="default" className="text-sm">
                {subtypeIcons[cat] || '📋'} {cat}: {count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

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
            const hasDocuments = demande.documents && demande.documents.length > 0;
            
            return (
              <Card
                key={demande.id}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected ? 'ring-2 ring-orange-500' : 'hover:border-orange-500/50',
                  demande.priority === 'urgent' && demande.status === 'pending' && 'border-l-4 border-l-red-500',
                  demande.status === 'validated' && 'border-l-4 border-l-emerald-500',
                  !hasDocuments && demande.status === 'pending' && 'border-r-4 border-r-amber-500',
                )}
                onClick={() => setSelectedDemande(demande.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center font-bold text-white">
                        {demande.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] text-orange-400">{demande.id}</span>
                          <Badge variant="warning">
                            {subtypeIcons[demande.subtype] || '📋'} {demande.subtype}
                          </Badge>
                          <BureauTag bureau={demande.bureau} />
                          {!hasDocuments && demande.status === 'pending' && (
                            <Badge variant="urgent">⚠️ Pièces manquantes</Badge>
                          )}
                        </div>
                        <h3 className="font-bold">{demande.agent}</h3>
                        <p className="text-xs text-slate-400">{demande.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg font-bold text-amber-400">
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

                  {/* Documents */}
                  {hasDocuments && (
                    <div className="flex gap-1 mb-2">
                      {demande.documents?.map(doc => (
                        <Badge key={doc.id} variant="info" className="text-[9px]">
                          📎 {doc.type}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Traçabilité validation */}
                  {demande.validatedBy && (
                    <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-xs mb-2">
                      <p className="text-emerald-400">✅ Validée par {demande.validatedBy} - {demande.validatedAt}</p>
                      {demande.impactFinance && (
                        <p className="text-slate-400 mt-1">
                          💰 Trace finance: <span className="font-mono">{demande.impactFinance}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  {demande.status === 'pending' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                      <Button size="sm" variant="success" onClick={(e) => { e.stopPropagation(); handleApprove(demande); }}>
                        ✓ Valider & Payer
                      </Button>
                      {!hasDocuments && (
                        <Button size="sm" variant="warning" onClick={(e) => { e.stopPropagation(); handleRequestPieces(demande); }}>
                          📎 Demander pièces
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); handleReject(demande); }}>
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
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center font-bold text-white">
                    {selectedD.initials}
                  </div>
                  <div>
                    <h3 className="font-bold">{selectedD.agent}</h3>
                    <p className="font-mono text-amber-400 font-bold">{selectedD.amount} FCFA</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                    <p className="text-xs text-slate-400 mb-1">Motif</p>
                    <p>{selectedD.reason}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className={cn("p-2 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                      <p className="text-[10px] text-slate-400">Type</p>
                      <Badge variant="warning">{selectedD.subtype}</Badge>
                    </div>
                    <div className={cn("p-2 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                      <p className="text-[10px] text-slate-400">Bureau</p>
                      <BureauTag bureau={selectedD.bureau} />
                    </div>
                  </div>

                  {/* Pièces justificatives */}
                  <div>
                    <h4 className="font-bold text-xs mb-2">📎 Pièces justificatives</h4>
                    {selectedD.documents && selectedD.documents.length > 0 ? (
                      <div className="space-y-1">
                        {selectedD.documents.map(doc => (
                          <div key={doc.id} className={cn(
                            "p-2 rounded flex items-center justify-between",
                            darkMode ? "bg-slate-700/30" : "bg-gray-100"
                          )}>
                            <span className="text-xs">{doc.name}</span>
                            <Badge variant="success">✓</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400">
                        ⚠️ Aucune pièce jointe - Conformité non vérifiable
                      </div>
                    )}
                  </div>

                  {/* Lien finance */}
                  {selectedD.impactFinance && (
                    <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
                      <p className="text-xs text-emerald-400">💰 Trace finance</p>
                      <p className="font-mono text-xs">{selectedD.impactFinance}</p>
                    </div>
                  )}

                  {/* Hash */}
                  {selectedD.hash && (
                    <div className="p-2 rounded bg-slate-700/30">
                      <p className="text-[10px] text-slate-400">🔐 Traçabilité</p>
                      <p className="font-mono text-[10px] truncate">{selectedD.hash}</p>
                    </div>
                  )}
                </div>

                {selectedD.status === 'pending' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700/50">
                    <Button size="sm" variant="success" className="flex-1" onClick={() => handleApprove(selectedD)}>
                      ✓ Valider
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleReject(selectedD)}>
                      ✕ Refuser
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="p-8 text-center">
                <span className="text-4xl mb-4 block">💸</span>
                <p className="text-slate-400">Sélectionnez une dépense</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
