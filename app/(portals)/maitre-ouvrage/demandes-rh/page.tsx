'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { demandesRH, plannedAbsences, employees, bureaux, criticalSkills } from '@/lib/data';

type RHFilter = 'all' | 'Congé' | 'Dépense' | 'Maladie' | 'Déplacement' | 'Paie';
type StatusFilter = 'all' | 'pending' | 'validated' | 'rejected';

export default function DemandesRHPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [typeFilter, setTypeFilter] = useState<RHFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedDemande, setSelectedDemande] = useState<string | null>(null);

  const filteredDemandes = demandesRH.filter((d) => {
    const matchType = typeFilter === 'all' || d.type === typeFilter;
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchType && matchStatus;
  });

  const stats = useMemo(() => {
    const congesDemandes = demandesRH.filter(d => d.type === 'Congé' || d.type === 'Maladie');
    return {
      total: demandesRH.length,
      pending: demandesRH.filter((d) => d.status === 'pending').length,
      validated: demandesRH.filter((d) => d.status === 'validated').length,
      rejected: demandesRH.filter((d) => d.status === 'rejected').length,
      conges: demandesRH.filter((d) => d.type === 'Congé').length,
      depenses: demandesRH.filter((d) => d.type === 'Dépense').length,
      maladies: demandesRH.filter((d) => d.type === 'Maladie').length,
      deplacements: demandesRH.filter((d) => d.type === 'Déplacement').length,
      paie: demandesRH.filter((d) => d.type === 'Paie').length,
      urgent: demandesRH.filter((d) => d.priority === 'urgent' && d.status === 'pending').length,
      // Stats spécifiques congés
      congesAnnuels: congesDemandes.filter(d => d.subtype === 'Annuel').length,
      maternite: congesDemandes.filter(d => d.subtype === 'Maternité').length,
      joursTotal: congesDemandes.filter(d => d.days).reduce((acc, d) => acc + (d.days || 0), 0),
    };
  }, []);

  // Zones de rupture : croiser absences planifiées avec bureaux et compétences critiques
  const zonesRupture = useMemo(() => {
    const ruptures: { bureau: string; employee: string; dates: string; skill: string; impact: string }[] = [];
    
    plannedAbsences.forEach(absence => {
      const employee = employees.find(e => e.id === absence.employeeId);
      if (employee?.isSinglePointOfFailure) {
        const skills = criticalSkills.filter(s => s.holders.includes(absence.employeeId));
        skills.forEach(skill => {
          if (skill.isAtRisk) {
            ruptures.push({
              bureau: absence.bureau,
              employee: absence.employeeName,
              dates: `${absence.startDate} → ${absence.endDate}`,
              skill: skill.name,
              impact: absence.impact,
            });
          }
        });
      }
    });

    return ruptures;
  }, []);

  // Absences à venir (prochains 30 jours)
  const absencesAVenir = useMemo(() => {
    return plannedAbsences.filter(a => {
      const startDate = new Date(a.startDate.split('/').reverse().join('-'));
      const now = new Date();
      const diff = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 30;
    });
  }, []);

  const selectedD = selectedDemande ? demandesRH.find(d => d.id === selectedDemande) : null;

  const typeIcons: Record<string, string> = {
    Congé: '🏖️',
    Dépense: '💸',
    Maladie: '🏥',
    Déplacement: '✈️',
    Paie: '💰',
  };

  const typeColors: Record<string, string> = {
    Congé: 'bg-emerald-500/20 border-emerald-500/50',
    Dépense: 'bg-amber-500/20 border-amber-500/50',
    Maladie: 'bg-red-500/20 border-red-500/50',
    Déplacement: 'bg-blue-500/20 border-blue-500/50',
    Paie: 'bg-purple-500/20 border-purple-500/50',
  };

  // Actions
  const handleApprove = (demande: typeof selectedD) => {
    if (!demande) return;
    addActionLog({
      module: 'demandes-rh',
      action: 'approve',
      targetId: demande.id,
      targetType: 'HRRequest',
      details: `Demande ${demande.type} approuvée pour ${demande.agent}`,
      status: 'success',
    });
    addToast(`${demande.id} approuvée ✓`, 'success');
  };

  const handleReject = (demande: typeof selectedD, reason: string = 'Motif à préciser') => {
    if (!demande) return;
    addActionLog({
      module: 'demandes-rh',
      action: 'reject',
      targetId: demande.id,
      targetType: 'HRRequest',
      details: `Demande refusée: ${reason}`,
      status: 'warning',
    });
    addToast(`${demande.id} refusée`, 'error');
  };

  const handleRequestInfo = (demande: typeof selectedD) => {
    if (!demande) return;
    addActionLog({
      module: 'demandes-rh',
      action: 'request_info',
      targetId: demande.id,
      targetType: 'HRRequest',
      details: 'Informations complémentaires demandées',
      status: 'info',
    });
    addToast(`Demande d'informations envoyée`, 'warning');
  };

  const handleCreateSubstitution = (demande: typeof selectedD) => {
    if (!demande) return;
    addActionLog({
      module: 'demandes-rh',
      action: 'create_substitution',
      targetId: demande.id,
      targetType: 'HRRequest',
      details: `Substitution créée pour ${demande.agent}`,
      status: 'success',
    });
    addToast('Substitution créée', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            📝 Demandes RH
            <Badge variant="warning">{stats.pending} en attente</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Congés, dépenses, déplacements et avances - Traçabilité audit
          </p>
        </div>
        <Button onClick={() => addToast('Nouvelle demande RH créée', 'success')}>
          + Nouvelle demande
        </Button>
      </div>

      {/* Alertes urgentes */}
      {stats.urgent > 0 && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚨</span>
              <div className="flex-1">
                <h3 className="font-bold text-red-400">{stats.urgent} demande(s) urgente(s) en attente</h3>
                <p className="text-sm text-slate-400">Action immédiate requise</p>
              </div>
              <Button size="sm" variant="urgent" onClick={() => setStatusFilter('pending')}>
                Voir urgences
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerte zones de rupture */}
      {zonesRupture.length > 0 && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🚨</span>
              <div className="flex-1">
                <h3 className="font-bold text-red-400">
                  {zonesRupture.length} Zone(s) de rupture détectée(s)
                </h3>
                <p className="text-sm text-slate-400 mb-3">
                  Des absences planifiées créent un risque sur des compétences critiques sans backup
                </p>
                <div className="space-y-2">
                  {zonesRupture.map((r, i) => (
                    <div key={i} className={cn(
                      "p-2 rounded flex flex-wrap items-center justify-between gap-2",
                      darkMode ? "bg-red-500/20" : "bg-red-50"
                    )}>
                      <div className="flex items-center gap-2">
                        <BureauTag bureau={r.bureau} />
                        <span className="font-medium">{r.employee}</span>
                        <span className="text-xs text-slate-400">{r.dates}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="urgent">🔒 {r.skill}</Badge>
                        <Badge variant={r.impact === 'high' ? 'urgent' : 'warning'}>
                          Impact {r.impact}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button size="sm" variant="warning">
                📋 Plan substitution
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats par type */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        <Card 
          className={cn("cursor-pointer transition-all", typeFilter === 'all' && 'ring-2 ring-orange-500')}
          onClick={() => setTypeFilter('all')}
        >
          <CardContent className="p-3 text-center">
            <span className="text-xl">📋</span>
            <p className="text-lg font-bold">{stats.total}</p>
            <p className="text-[10px] text-slate-400">Total</p>
          </CardContent>
        </Card>
        {[
          { id: 'Congé', label: 'Congés', count: stats.conges, icon: '🏖️' },
          { id: 'Dépense', label: 'Dépenses', count: stats.depenses, icon: '💸' },
          { id: 'Maladie', label: 'Maladies', count: stats.maladies, icon: '🏥' },
          { id: 'Déplacement', label: 'Déplacements', count: stats.deplacements, icon: '✈️' },
          { id: 'Paie', label: 'Paie/Avances', count: stats.paie, icon: '💰' },
        ].map((s) => (
          <Card
            key={s.id}
            className={cn(
              'cursor-pointer transition-all',
              typeFilter === s.id && 'ring-2 ring-orange-500',
              typeColors[s.id]
            )}
            onClick={() => setTypeFilter(s.id as RHFilter)}
          >
            <CardContent className="p-3 text-center">
              <span className="text-xl">{s.icon}</span>
              <p className="text-lg font-bold">{s.count}</p>
              <p className="text-[10px] text-slate-400">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats spécifiques congés (si filtre congés actif) */}
      {(typeFilter === 'Congé' || typeFilter === 'all') && (
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
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
              <p className="text-2xl font-bold text-blue-400">{stats.congesAnnuels}</p>
              <p className="text-[10px] text-slate-400">Annuels</p>
            </CardContent>
          </Card>
          <Card className="bg-pink-500/10 border-pink-500/30">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-pink-400">{stats.maternite}</p>
              <p className="text-[10px] text-slate-400">Maternité</p>
            </CardContent>
          </Card>
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-red-400">{stats.maladie}</p>
              <p className="text-[10px] text-slate-400">Maladie</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-500/10 border-purple-500/30">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-purple-400">{stats.joursTotal}</p>
              <p className="text-[10px] text-slate-400">Jours total</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Absences à venir */}
      {absencesAVenir.length > 0 && (typeFilter === 'Congé' || typeFilter === 'all') && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-sm mb-3">📅 Absences planifiées (30 prochains jours)</h3>
            <div className="flex flex-wrap gap-2">
              {absencesAVenir.map(a => (
                <div 
                  key={a.id}
                  className={cn(
                    "p-2 rounded border",
                    a.impact === 'high' ? "border-red-500/50 bg-red-500/10" : "border-amber-500/50 bg-amber-500/10"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <BureauTag bureau={a.bureau} />
                    <span className="font-medium text-sm">{a.employeeName}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {a.startDate} → {a.endDate}
                  </p>
                  <Badge variant={a.type === 'congé' ? 'info' : 'warning'} className="mt-1">
                    {a.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtres statut */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'Tous', count: stats.total },
          { id: 'pending', label: '⏳ En attente', count: stats.pending },
          { id: 'validated', label: '✅ Validées', count: stats.validated },
          { id: 'rejected', label: '❌ Refusées', count: stats.rejected },
        ].map((f) => (
          <Button
            key={f.id}
            size="sm"
            variant={statusFilter === f.id ? 'default' : 'secondary'}
            onClick={() => setStatusFilter(f.id as StatusFilter)}
          >
            {f.label} ({f.count})
          </Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Liste des demandes */}
        <div className="lg:col-span-2 space-y-3">
          {filteredDemandes.map((demande) => {
            const isSelected = selectedDemande === demande.id;
            const hasRuptureRisk = (demande.type === 'Congé' || demande.type === 'Maladie') && 
              employees.find(e => e.name === demande.agent)?.isSinglePointOfFailure;
            return (
              <Card
                key={demande.id}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected ? 'ring-2 ring-orange-500' : 'hover:border-orange-500/50',
                  demande.priority === 'urgent' && demande.status === 'pending' && 'border-l-4 border-l-red-500',
                  demande.status === 'validated' && 'border-l-4 border-l-emerald-500',
                  demande.status === 'rejected' && 'border-l-4 border-l-slate-500 opacity-60',
                  hasRuptureRisk && demande.status === 'pending' && 'border-l-4 border-l-red-500',
                )}
                onClick={() => setSelectedDemande(demande.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-bold text-white text-sm">
                        {demande.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono text-[10px] text-orange-400">{demande.id}</span>
                          <Badge variant="info" className={typeColors[demande.type]}>
                            {typeIcons[demande.type]} {demande.type}
                          </Badge>
                          <Badge variant="default">{demande.subtype}</Badge>
                          <BureauTag bureau={demande.bureau} />
                          {hasRuptureRisk && (
                            <Badge variant="urgent">⚠️ SPOF</Badge>
                          )}
                        </div>
                        <h3 className="font-bold text-sm">{demande.agent}</h3>
                        <p className="text-xs text-slate-400">{demande.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          demande.status === 'validated' ? 'success' :
                          demande.status === 'rejected' ? 'default' :
                          demande.priority === 'urgent' ? 'urgent' :
                          demande.priority === 'high' ? 'warning' : 'info'
                        }
                        pulse={demande.priority === 'urgent' && demande.status === 'pending'}
                      >
                        {demande.status === 'validated' ? '✅ Validée' :
                         demande.status === 'rejected' ? '❌ Refusée' :
                         demande.priority}
                      </Badge>
                      <p className="text-[10px] text-slate-500 mt-1">{demande.date}</p>
                    </div>
                  </div>

                  {/* Détails spécifiques */}
                  <div className={cn(
                    'grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 rounded-lg text-xs',
                    darkMode ? 'bg-slate-700/30' : 'bg-gray-100'
                  )}>
                    {demande.startDate && (
                      <div>
                        <span className="text-slate-400">Début: </span>
                        {demande.startDate}
                      </div>
                    )}
                    {demande.endDate && (
                      <div>
                        <span className="text-slate-400">Fin: </span>
                        {demande.endDate}
                      </div>
                    )}
                    {demande.days && (
                      <div>
                        <span className="text-slate-400">Durée: </span>
                        {demande.days} jours
                      </div>
                    )}
                    {demande.amount && (
                      <div>
                        <span className="text-slate-400">Montant: </span>
                        <span className="font-mono text-amber-400">{demande.amount} FCFA</span>
                      </div>
                    )}
                    {demande.destination && (
                      <div>
                        <span className="text-slate-400">Destination: </span>
                        {demande.destination}
                      </div>
                    )}
                  </div>

                  {/* Traçabilité validation/refus */}
                  {(demande.validatedBy || demande.rejectedBy) && (
                    <div className={cn(
                      "mt-2 p-2 rounded text-xs",
                      demande.validatedBy ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-red-500/10 border border-red-500/30"
                    )}>
                      {demande.validatedBy && (
                        <>
                          <p className="text-emerald-400">✅ Validée par {demande.validatedBy}</p>
                          <p className="text-slate-400">{demande.validatedAt}</p>
                          {demande.validationComment && (
                            <p className="text-slate-300 mt-1">"{demande.validationComment}"</p>
                          )}
                        </>
                      )}
                      {demande.rejectedBy && (
                        <>
                          <p className="text-red-400">❌ Refusée par {demande.rejectedBy}</p>
                          <p className="text-slate-400">{demande.rejectedAt}</p>
                          {demande.rejectionReason && (
                            <p className="text-slate-300 mt-1">Motif: {demande.rejectionReason}</p>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Documents joints */}
                  {demande.documents && demande.documents.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {demande.documents.map(doc => (
                        <Badge key={doc.id} variant="default" className="text-[9px]">
                          📎 {doc.type}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions si pending */}
                  {demande.status === 'pending' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={(e) => { e.stopPropagation(); handleApprove(demande); }}
                      >
                        ✓ Approuver
                      </Button>
                      {hasRuptureRisk && (demande.type === 'Congé' || demande.type === 'Maladie') && (
                        <Button
                          size="sm"
                          variant="warning"
                          onClick={(e) => { e.stopPropagation(); handleCreateSubstitution(demande); }}
                        >
                          🔄 Créer substitution
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={(e) => { e.stopPropagation(); handleRequestInfo(demande); }}
                      >
                        ⏳ Infos requises
                      </Button>
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
                {/* Header */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-700/50">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-lg font-bold text-white">
                    {selectedD.initials}
                  </div>
                  <div>
                    <h3 className="font-bold">{selectedD.agent}</h3>
                    <p className="text-xs text-slate-400">{selectedD.id}</p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="info" className={typeColors[selectedD.type]}>
                        {typeIcons[selectedD.type]} {selectedD.type}
                      </Badge>
                      <BureauTag bureau={selectedD.bureau} />
                    </div>
                  </div>
                </div>

                {/* Détails complets */}
                <div className="space-y-3 text-sm">
                  <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                    <p className="text-xs text-slate-400 mb-1">Motif</p>
                    <p>{selectedD.reason}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {selectedD.startDate && (
                      <div className={cn("p-2 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                        <p className="text-[10px] text-slate-400">Début</p>
                        <p className="font-medium">{selectedD.startDate}</p>
                      </div>
                    )}
                    {selectedD.endDate && (
                      <div className={cn("p-2 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                        <p className="text-[10px] text-slate-400">Fin</p>
                        <p className="font-medium">{selectedD.endDate}</p>
                      </div>
                    )}
                    {selectedD.days && (
                      <div className={cn("p-2 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                        <p className="text-[10px] text-slate-400">Durée</p>
                        <p className="font-medium">{selectedD.days} jours</p>
                      </div>
                    )}
                    {selectedD.amount && (
                      <div className={cn("p-2 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                        <p className="text-[10px] text-slate-400">Montant</p>
                        <p className="font-mono font-bold text-amber-400">{selectedD.amount} FCFA</p>
                      </div>
                    )}
                    {selectedD.destination && (
                      <div className={cn("p-2 rounded col-span-2", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                        <p className="text-[10px] text-slate-400">Destination</p>
                        <p className="font-medium">{selectedD.destination}</p>
                      </div>
                    )}
                  </div>

                  {/* Documents */}
                  {selectedD.documents && selectedD.documents.length > 0 && (
                    <div>
                      <h4 className="font-bold text-xs mb-2">📎 Documents joints</h4>
                      <div className="space-y-1">
                        {selectedD.documents.map(doc => (
                          <div key={doc.id} className={cn(
                            "p-2 rounded flex items-center justify-between",
                            darkMode ? "bg-slate-700/30" : "bg-gray-100"
                          )}>
                            <div>
                              <p className="text-xs font-medium">{doc.name}</p>
                              <p className="text-[10px] text-slate-400">{doc.date}</p>
                            </div>
                            <Badge variant="default">{doc.type}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Impact substitution */}
                  {selectedD.impactSubstitution && (
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30">
                      <p className="text-xs text-amber-400">🔄 Substitution liée</p>
                      <p className="font-mono text-xs">{selectedD.impactSubstitution}</p>
                    </div>
                  )}

                  {/* Impact finance */}
                  {selectedD.impactFinance && (
                    <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
                      <p className="text-xs text-emerald-400">💰 Trace finance</p>
                      <p className="font-mono text-xs">{selectedD.impactFinance}</p>
                    </div>
                  )}

                  {/* Hash traçabilité */}
                  {selectedD.hash && (
                    <div className="p-2 rounded bg-slate-700/30">
                      <p className="text-[10px] text-slate-400">🔐 Hash traçabilité</p>
                      <p className="font-mono text-[10px] text-slate-500 truncate">{selectedD.hash}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {selectedD.status === 'pending' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700/50">
                    <Button size="sm" variant="success" className="flex-1" onClick={() => handleApprove(selectedD)}>
                      ✓ Approuver
                    </Button>
                    {(selectedD.type === 'Congé' || selectedD.type === 'Maladie') && 
                     employees.find(e => e.name === selectedD.agent)?.isSinglePointOfFailure && (
                      <Button size="sm" variant="warning" className="flex-1" onClick={() => handleCreateSubstitution(selectedD)}>
                        🔄 Substitution
                      </Button>
                    )}
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
                <span className="text-4xl mb-4 block">📝</span>
                <p className="text-slate-400">
                  Sélectionnez une demande pour voir ses détails
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
