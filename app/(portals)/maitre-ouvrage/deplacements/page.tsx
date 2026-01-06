'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { demandesRH, employees, plannedAbsences } from '@/lib/data';

export default function DeplacementsPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'validated'>('all');
  const [selectedDemande, setSelectedDemande] = useState<string | null>(null);

  // Filtrer uniquement les déplacements
  const deplacementsDemandes = demandesRH.filter(d => d.type === 'Déplacement');
  const filteredDemandes = deplacementsDemandes.filter(d => filter === 'all' || d.status === filter);

  // Stats
  const stats = useMemo(() => {
    const pending = deplacementsDemandes.filter(d => d.status === 'pending');
    const validated = deplacementsDemandes.filter(d => d.status === 'validated');
    
    // Déplacements à venir
    const aVenir = deplacementsDemandes.filter(d => {
      if (!d.startDate) return false;
      const startDate = new Date(d.startDate.split('/').reverse().join('-'));
      return startDate > new Date();
    });

    // Coûts estimés
    const coutEstime = deplacementsDemandes
      .filter(d => d.amount)
      .reduce((acc, d) => acc + parseFloat((d.amount || '0').replace(/,/g, '')), 0);

    return {
      total: deplacementsDemandes.length,
      pending: pending.length,
      validated: validated.length,
      aVenir: aVenir.length,
      coutEstime,
    };
  }, []);

  const selectedD = selectedDemande ? deplacementsDemandes.find(d => d.id === selectedDemande) : null;

  // Actions
  const handleApprove = (demande: typeof selectedD) => {
    if (!demande) return;
    const hasOrdreMission = demande.documents?.some(d => d.type === 'ordre_mission');
    
    addActionLog({
      module: 'deplacements',
      action: 'approve',
      targetId: demande.id,
      targetType: 'HRRequest',
      details: `Déplacement ${demande.destination} approuvé pour ${demande.agent}`,
      status: 'success',
    });
    
    if (!hasOrdreMission) {
      addToast('Déplacement approuvé - Ordre de mission à générer', 'warning');
    } else {
      addToast('Déplacement approuvé', 'success');
    }
  };

  const handleGenerateOrdreMission = (demande: typeof selectedD) => {
    if (!demande) return;
    addActionLog({
      module: 'deplacements',
      action: 'generate_ordre_mission',
      targetId: demande.id,
      targetType: 'HRRequest',
      details: 'Ordre de mission généré',
      status: 'success',
    });
    addToast('Ordre de mission généré', 'success');
  };

  const handleReject = (demande: typeof selectedD) => {
    if (!demande) return;
    addActionLog({
      module: 'deplacements',
      action: 'reject',
      targetId: demande.id,
      targetType: 'HRRequest',
      details: 'Déplacement refusé',
      status: 'warning',
    });
    addToast('Déplacement refusé', 'error');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            ✈️ Déplacements & Missions
            <Badge variant="warning">{stats.pending} en attente</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Validation et ordres de mission avec traçabilité
          </p>
        </div>
        <Button onClick={() => addToast('Nouveau déplacement créé', 'success')}>
          + Nouveau déplacement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
            <p className="text-[10px] text-slate-400">En attente</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.validated}</p>
            <p className="text-[10px] text-slate-400">Validés</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.aVenir}</p>
            <p className="text-[10px] text-slate-400">À venir</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-purple-400">
              {(stats.coutEstime / 1000).toFixed(0)}K
            </p>
            <p className="text-[10px] text-slate-400">Coûts estimés</p>
          </CardContent>
        </Card>
      </div>

      {/* Déplacements à venir */}
      {stats.aVenir > 0 && (
        <Card className="border-blue-500/50 bg-blue-500/10">
          <CardContent className="p-4">
            <h3 className="font-bold text-sm mb-3 text-blue-400">📅 Prochains déplacements</h3>
            <div className="flex flex-wrap gap-2">
              {deplacementsDemandes
                .filter(d => d.startDate && new Date(d.startDate.split('/').reverse().join('-')) > new Date())
                .slice(0, 5)
                .map(d => (
                  <div 
                    key={d.id}
                    className={cn(
                      "p-2 rounded cursor-pointer hover:bg-blue-500/20",
                      darkMode ? "bg-slate-700/30" : "bg-white/50"
                    )}
                    onClick={() => setSelectedDemande(d.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✈️</span>
                      <div>
                        <p className="font-medium text-sm">{d.agent}</p>
                        <p className="text-xs text-slate-400">{d.destination}</p>
                        <p className="text-[10px] text-blue-400">{d.startDate}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtres */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: 'Tous' },
          { id: 'pending', label: '⏳ En attente' },
          { id: 'validated', label: '✅ Validés' },
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
            const hasOrdreMission = demande.documents?.some(d => d.type === 'ordre_mission');
            const employee = employees.find(e => e.name === demande.agent);
            const hasRisk = employee?.isSinglePointOfFailure;
            
            return (
              <Card
                key={demande.id}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected ? 'ring-2 ring-orange-500' : 'hover:border-orange-500/50',
                  demande.priority === 'urgent' && 'border-l-4 border-l-red-500',
                  hasRisk && 'border-r-4 border-r-amber-500',
                )}
                onClick={() => setSelectedDemande(demande.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white">
                        {demande.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] text-orange-400">{demande.id}</span>
                          <BureauTag bureau={demande.bureau} />
                          {hasRisk && <Badge variant="warning">⚠️ SPOF</Badge>}
                          {!hasOrdreMission && demande.status === 'pending' && (
                            <Badge variant="urgent">📄 OM manquant</Badge>
                          )}
                        </div>
                        <h3 className="font-bold">{demande.agent}</h3>
                        <p className="text-sm text-blue-400 font-medium">
                          📍 {demande.destination}
                        </p>
                        <p className="text-xs text-slate-400">{demande.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        demande.status === 'validated' ? 'success' :
                        demande.priority === 'urgent' ? 'urgent' :
                        demande.priority === 'high' ? 'warning' : 'info'
                      }>
                        {demande.status === 'validated' ? '✅ Validé' : demande.priority}
                      </Badge>
                      <p className="text-[10px] text-slate-500 mt-1">{demande.date}</p>
                    </div>
                  </div>

                  {/* Période et durée */}
                  <div className={cn(
                    "flex justify-between items-center p-2 rounded text-sm mb-2",
                    darkMode ? "bg-slate-700/30" : "bg-gray-100"
                  )}>
                    <span>📅 {demande.startDate} → {demande.endDate}</span>
                    <Badge variant="default">{demande.days} jours</Badge>
                  </div>

                  {/* Documents */}
                  <div className="flex gap-1 mb-2">
                    {demande.documents?.map(doc => (
                      <Badge 
                        key={doc.id} 
                        variant={doc.type === 'ordre_mission' ? 'success' : 'info'}
                        className="text-[9px]"
                      >
                        {doc.type === 'ordre_mission' ? '📄 OM' : '📎'} {doc.name.slice(0, 15)}...
                      </Badge>
                    ))}
                  </div>

                  {/* Validation trace */}
                  {demande.validatedBy && (
                    <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-xs">
                      <p className="text-emerald-400">✅ Validé par {demande.validatedBy}</p>
                      <p className="text-slate-400">{demande.validatedAt}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {demande.status === 'pending' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                      <Button size="sm" variant="success" onClick={(e) => { e.stopPropagation(); handleApprove(demande); }}>
                        ✓ Approuver
                      </Button>
                      {!hasOrdreMission && (
                        <Button size="sm" variant="info" onClick={(e) => { e.stopPropagation(); handleGenerateOrdreMission(demande); }}>
                          📄 Générer OM
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
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white">
                    {selectedD.initials}
                  </div>
                  <div>
                    <h3 className="font-bold">{selectedD.agent}</h3>
                    <p className="text-blue-400 font-medium">📍 {selectedD.destination}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                    <p className="text-xs text-slate-400 mb-1">Période</p>
                    <p className="font-medium">{selectedD.startDate} → {selectedD.endDate}</p>
                    <p className="text-blue-400 font-bold">{selectedD.days} jours</p>
                  </div>

                  <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                    <p className="text-xs text-slate-400 mb-1">Motif</p>
                    <p>{selectedD.reason}</p>
                  </div>

                  {/* Documents / Ordre de mission */}
                  <div>
                    <h4 className="font-bold text-xs mb-2">📄 Documents</h4>
                    {selectedD.documents && selectedD.documents.length > 0 ? (
                      <div className="space-y-1">
                        {selectedD.documents.map(doc => (
                          <div key={doc.id} className={cn(
                            "p-2 rounded flex items-center justify-between",
                            doc.type === 'ordre_mission' ? "bg-emerald-500/10 border border-emerald-500/30" : 
                            darkMode ? "bg-slate-700/30" : "bg-gray-100"
                          )}>
                            <span className="text-xs">{doc.name}</span>
                            <Badge variant={doc.type === 'ordre_mission' ? 'success' : 'default'}>
                              {doc.type === 'ordre_mission' ? '✓ OM' : doc.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400">
                        ⚠️ Ordre de mission non généré
                      </div>
                    )}
                  </div>

                  {/* Substitution si SPOF */}
                  {selectedD.impactSubstitution && (
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30">
                      <p className="text-xs text-amber-400">🔄 Substitution requise</p>
                      <p className="font-mono text-xs">{selectedD.impactSubstitution}</p>
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
                      ✓ Approuver
                    </Button>
                    <Button size="sm" variant="info" className="flex-1" onClick={() => handleGenerateOrdreMission(selectedD)}>
                      📄 OM
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="p-8 text-center">
                <span className="text-4xl mb-4 block">✈️</span>
                <p className="text-slate-400">Sélectionnez un déplacement</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
