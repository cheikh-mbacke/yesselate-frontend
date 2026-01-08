'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { missions, employees, projects, litiges } from '@/lib/data';
import type { MissionStatus } from '@/lib/types/bmo.types';

// WHY: Export CSV enrichi — traçabilité RACI incluse
const exportMissionsAsCSV = (
  missionsData: typeof missions,
  addToast: (msg: string, variant?: 'success' | 'warning' | 'info' | 'error') => void
) => {
  const headers = [
    'ID',
    'Titre',
    'Statut',
    'Priorité',
    'Progression (%)',
    'Début',
    'Fin',
    'Budget (FCFA)',
    'Impact financier',
    'Impact juridique',
    'Projet lié',
    'Litige lié',
    'Participants',
    'Origine décisionnelle',
    'ID décision',
    'Rôle RACI',
    'Hash traçabilité',
    'Statut BMO',
  ];

  const rows = missionsData.map((m: typeof missions[0]) => [
    m.id,
    `"${m.title}"`,
    m.status,
    m.priority,
    m.progress.toString(),
    m.startDate,
    m.endDate,
    (m.budget || '').toString(),
    m.impactFinancier || '',
    m.impactJuridique || '',
    m.linkedProject || '',
    m.linkedLitigation || '',
    m.participants.map((p: typeof m.participants[0]) => `${p.employeeName}(${p.role})`).join(', '),
    m.decisionBMO?.origin || 'Hors périmètre BMO',
    m.decisionBMO?.decisionId || '',
    m.decisionBMO?.validatorRole || '',
    m.decisionBMO?.hash || '',
    m.decisionBMO ? 'Piloté' : 'Non piloté',
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map((row: string[]) => row.join(';'))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `missions_bmo_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  addToast('✅ Export Missions généré (traçabilité RACI incluse)', 'success');
};

export default function MissionsPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  // Utilisateur actuel (simulé - normalement depuis auth)
  const currentUser = {
    id: 'USR-001',
    name: 'A. DIALLO',
    role: 'Directeur Général',
    bureau: 'BMO',
  };
  const [filter, setFilter] = useState<'all' | MissionStatus>('all');
  const [selectedMission, setSelectedMission] = useState<string | null>(null);

  // Filtrage
  const filteredMissions = missions.filter(m => filter === 'all' || m.status === filter);

  // Stats
  const stats = useMemo(() => {
    const total = missions.length;
    const enRetard = missions.filter(m => m.status === 'late' || (m.status === 'in_progress' && m.progress < 50)).length;
    const terminees = missions.filter(m => m.status === 'completed').length;
    const enCours = missions.filter(m => m.status === 'in_progress').length;
    const planifiees = missions.filter(m => m.status === 'planned').length;
    const tauxCompletion = total > 0 ? Math.round((terminees / total) * 100) : 0;
    const tauxRetard = total > 0 ? Math.round((enRetard / total) * 100) : 0;
    return { total, enRetard, terminees, enCours, planifiees, tauxCompletion, tauxRetard };
  }, []);

  const selectedM = selectedMission ? missions.find(m => m.id === selectedMission) : null;

  // Helper pour récupérer le nom du projet
  const getProjectName = (projectId?: string) => {
    if (!projectId) return null;
    const project = projects.find(p => p.id === projectId);
    return project?.name || projectId;
  };

  // Helper pour récupérer le litige
  const getLitigationInfo = (litigationId?: string) => {
    if (!litigationId) return null;
    const litigation = litiges.find(l => l.id === litigationId);
    return litigation;
  };

  // Actions
  const handleAssign = (missionId: string) => {
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      module: 'missions',
      action: 'delegation', // Mapping vers ActionLogType valide
      targetId: missionId,
      targetType: 'Mission',
      details: 'Participant assigné',
      bureau: 'BMO',
    });
    addToast('👤 Participant assigné à la mission', 'success');
  };

  const handlePlanifier = (missionId: string) => {
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      module: 'missions',
      action: 'modification', // Mapping vers ActionLogType valide
      targetId: missionId,
      targetType: 'Mission',
      details: 'Mission planifiée',
      bureau: 'BMO',
    });
    addToast('📅 Mission planifiée', 'success');
  };

  const handleLinkProject = (missionId: string) => {
    addToast('🔗 Sélectionnez un projet à lier', 'info');
  };

  const statusConfig: Record<MissionStatus, { label: string; color: string; variant: 'success' | 'warning' | 'urgent' | 'info' | 'default' }> = {
    planned: { label: 'Planifiée', color: 'text-blue-400', variant: 'info' },
    in_progress: { label: 'En cours', color: 'text-amber-400', variant: 'warning' },
    completed: { label: 'Terminée', color: 'text-emerald-400', variant: 'success' },
    cancelled: { label: 'Annulée', color: 'text-slate-400', variant: 'default' },
    late: { label: 'En retard', color: 'text-red-400', variant: 'urgent' },
  };

  const proofTypeIcons: Record<string, string> = {
    photo: '📷',
    compte_rendu: '📝',
    document: '📄',
    signature: '✍️',
    autre: '📎',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🎯 Missions Pilotées
            <Badge variant="info">{stats.total}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Suivi <strong>sous contrôle BMO</strong> — Preuves + Traçabilité
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => exportMissionsAsCSV(missions, addToast)}>
            📊 Exporter (CSV RACI)
          </Button>
          <Button onClick={() => addToast('Nouvelle mission créée', 'success')}>
            + Nouvelle mission
          </Button>
        </div>
      </div>

      {/* Résumé — avec indicateur BMO */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Card className={cn(
          stats.tauxRetard > 20 ? "bg-red-500/20 border-red-500/50" : "bg-amber-500/10 border-amber-500/30"
        )}>
          <CardContent className="p-3 text-center">
            <p className={cn(
              "text-2xl font-bold",
              stats.tauxRetard > 20 ? "text-red-400" : "text-amber-400"
            )}>
              {stats.tauxRetard}%
            </p>
            <p className="text-[10px] text-slate-400">En retard</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.tauxCompletion}%</p>
            <p className="text-[10px] text-slate-400">Terminées</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.enCours}</p>
            <p className="text-[10px] text-slate-400">En cours</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.planifiees}</p>
            <p className="text-[10px] text-slate-400">Planifiées</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.terminees}</p>
            <p className="text-[10px] text-slate-400">Complétées</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">
              {missions.filter(m => m.decisionBMO).length}
            </p>
            <p className="text-[10px] text-slate-400">Pilotées par BMO</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'Toutes' },
          { id: 'in_progress', label: '⏳ En cours' },
          { id: 'planned', label: '📅 Planifiées' },
          { id: 'completed', label: '✅ Terminées' },
          { id: 'late', label: '🚨 En retard' },
        ].map((f) => (
          <Button
            key={f.id}
            size="sm"
            variant={filter === f.id ? 'default' : 'secondary'}
            onClick={() => setFilter(f.id as 'all' | MissionStatus)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Liste des missions */}
        <div className="lg:col-span-2 space-y-3">
          {filteredMissions.map((mission) => {
            const isSelected = selectedMission === mission.id;
            const projectName = getProjectName(mission.linkedProject);
            const litigationInfo = getLitigationInfo(mission.linkedLitigation);
            const objectifsCompletes = mission.objectives.filter(o => o.status === 'completed').length;
            
            return (
              <Card
                key={mission.id}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected ? 'ring-2 ring-orange-500' : 'hover:border-orange-500/50',
                  mission.priority === 'urgent' && 'border-l-4 border-l-red-500',
                  mission.status === 'late' && 'border-l-4 border-l-red-500',
                )}
                onClick={() => setSelectedMission(mission.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-[10px] text-orange-400">{mission.id}</span>
                        <Badge variant={statusConfig[mission.status].variant}>
                          {statusConfig[mission.status].label}
                        </Badge>
                        <Badge variant={
                          mission.priority === 'urgent' ? 'urgent' : 
                          mission.priority === 'high' ? 'warning' : 'default'
                        }>
                          {mission.priority}
                        </Badge>
                      </div>
                      <h3 className="font-bold">{mission.title}</h3>
                      <p className="text-sm text-slate-400">{mission.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">{mission.startDate} → {mission.endDate}</p>
                      {mission.decisionBMO && (
                        <Badge variant="success" className="mt-1 text-[9px]">✅ Piloté</Badge>
                      )}
                    </div>
                  </div>

                  {/* Bureaux et participants */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {mission.bureaux.map(b => (
                      <BureauTag key={b} bureau={b} />
                    ))}
                    <span className="text-slate-500">|</span>
                    {mission.participants.map(p => (
                      <Badge key={p.employeeId} variant={p.role === 'responsable' ? 'gold' : 'default'}>
                        {p.employeeName}
                        {p.role === 'responsable' && ' 👑'}
                      </Badge>
                    ))}
                  </div>

                  {/* Progression */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progression</span>
                      <span className={cn(
                        mission.progress >= 80 ? 'text-emerald-400' : 
                        mission.progress >= 50 ? 'text-amber-400' : 'text-red-400'
                      )}>
                        {mission.progress}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all",
                          mission.progress >= 80 ? 'bg-emerald-500' : 
                          mission.progress >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        )}
                        style={{ width: `${mission.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Objectifs résumé */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="info">
                      📋 {objectifsCompletes}/{mission.objectives.length} objectifs
                    </Badge>
                    {mission.proofs.length > 0 && (
                      <Badge variant="success">
                        📎 {mission.proofs.length} preuve(s)
                      </Badge>
                    )}
                    {projectName && (
                      <Badge variant="default">
                        🏗️ {projectName}
                      </Badge>
                    )}
                    {litigationInfo && (
                      <Badge variant="urgent">
                        ⚖️ {litigationInfo.id}
                      </Badge>
                    )}
                  </div>

                  {/* Impact */}
                  {(mission.impactFinancier || mission.impactJuridique) && (
                    <div className={cn(
                      "p-2 rounded text-xs",
                      darkMode ? "bg-slate-700/30" : "bg-gray-100"
                    )}>
                      {mission.impactFinancier && (
                        <p><span className="text-amber-400">💰 Impact financier:</span> {mission.impactFinancier}</p>
                      )}
                      {mission.impactJuridique && (
                        <p><span className="text-purple-400">⚖️ Impact juridique:</span> {mission.impactJuridique}</p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                    <Button size="sm" variant="info" onClick={(e) => { e.stopPropagation(); handleAssign(mission.id); }}>
                      👤 Assigner
                    </Button>
                    <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handlePlanifier(mission.id); }}>
                      📅 Planifier
                    </Button>
                    <Button size="sm" variant="warning" onClick={(e) => { e.stopPropagation(); handleLinkProject(mission.id); }}>
                      🔗 Lier projet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Panel détail mission */}
        <div className="lg:col-span-1">
          {selectedM ? (
            <Card className="sticky top-4">
              <CardContent className="p-4">
                {/* Header */}
                <div className="mb-4 pb-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-xs text-orange-400">{selectedM.id}</span>
                    <Badge variant={statusConfig[selectedM.status].variant}>
                      {statusConfig[selectedM.status].label}
                    </Badge>
                  </div>
                  <h3 className="font-bold">{selectedM.title}</h3>
                  <p className="text-xs text-slate-400">Créée le {selectedM.createdAt} par {selectedM.createdBy}</p>
                </div>

                {/* Décision BMO */}
                {selectedM.decisionBMO && (
                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 mb-4">
                    <p className="text-[10px] text-purple-400 mb-1">Décision BMO</p>
                    <Badge variant="default" className="text-[9px]">
                      {selectedM.decisionBMO.validatorRole === 'A' ? 'BMO (Accountable)' : 'BM (Responsible)'}
                    </Badge>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="text-[10px] bg-slate-800/50 px-1 rounded">
                        {selectedM.decisionBMO.hash.slice(0, 32)}...
                      </code>
                      <Button
                        size="xs"
                        variant="ghost"
                        className="text-[10px] text-blue-400 p-0 h-auto"
                        onClick={async () => {
                          const isValid = selectedM.decisionBMO?.hash.startsWith('SHA3-256:');
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

                {/* Objectifs détaillés */}
                <div className="mb-4">
                  <h4 className="font-bold text-sm mb-2">📋 Objectifs</h4>
                  <div className="space-y-2">
                    {selectedM.objectives.map(obj => (
                      <div key={obj.id} className={cn(
                        "p-2 rounded text-sm flex items-start gap-2",
                        darkMode ? "bg-slate-700/30" : "bg-gray-100"
                      )}>
                        <span className={cn(
                          obj.status === 'completed' ? 'text-emerald-400' :
                          obj.status === 'in_progress' ? 'text-amber-400' :
                          obj.status === 'blocked' ? 'text-red-400' : 'text-slate-400'
                        )}>
                          {obj.status === 'completed' ? '✅' :
                           obj.status === 'in_progress' ? '⏳' :
                           obj.status === 'blocked' ? '🚫' : '⬜'}
                        </span>
                        <div className="flex-1">
                          <p className={cn(
                            obj.status === 'completed' && 'line-through text-slate-500'
                          )}>
                            {obj.title}
                          </p>
                          {obj.completedAt && (
                            <p className="text-[10px] text-slate-400">
                              Complété le {obj.completedAt} par {obj.completedBy}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preuves */}
                <div className="mb-4">
                  <h4 className="font-bold text-sm mb-2">📎 Preuves de réalisation</h4>
                  {selectedM.proofs.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-2">Aucune preuve uploadée</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {selectedM.proofs.map(proof => (
                        <div key={proof.id} className={cn(
                          "p-2 rounded text-xs",
                          darkMode ? "bg-slate-700/30" : "bg-gray-100"
                        )}>
                          <div className="flex items-center gap-1 mb-1">
                            <span>{proofTypeIcons[proof.type]}</span>
                            <span className="font-medium truncate">{proof.title}</span>
                          </div>
                          <p className="text-slate-400">{proof.date}</p>
                          <p className="text-slate-500">{proof.uploadedBy}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button size="sm" variant="secondary" className="w-full mt-2">
                    + Ajouter preuve
                  </Button>
                </div>

                {/* Budget si applicable */}
                {selectedM.budget && (
                  <div className="mb-4 p-3 rounded bg-emerald-500/10 border border-emerald-500/30">
                    <h4 className="font-bold text-sm mb-2 text-emerald-400">💰 Budget</h4>
                    <div className="flex justify-between text-sm">
                      <span>Alloué:</span>
                      <span className="font-mono">{selectedM.budget} FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Utilisé:</span>
                      <span className="font-mono text-amber-400">{selectedM.budgetUsed || '0'} FCFA</span>
                    </div>
                  </div>
                )}

                {/* Participants */}
                <div className="mb-4">
                  <h4 className="font-bold text-sm mb-2">👥 Équipe</h4>
                  <div className="space-y-1">
                    {selectedM.participants.map(p => (
                      <div key={p.employeeId} className="flex items-center justify-between text-sm">
                        <span>{p.employeeName}</span>
                        <Badge variant={p.role === 'responsable' ? 'gold' : 'default'}>
                          {p.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Décisions liées */}
                {selectedM.decisions && selectedM.decisions.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-bold text-sm mb-2">📜 Décisions liées</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedM.decisions.map(d => (
                        <Badge key={d} variant="info">{d}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                  <Button size="sm" variant="success" className="flex-1">
                    ✅ Valider objectif
                  </Button>
                  <Button size="sm" variant="info" className="flex-1">
                    📝 CR
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="p-8 text-center">
                <span className="text-4xl mb-4 block">🎯</span>
                <p className="text-slate-400">
                  Sélectionnez une mission pour voir ses détails
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
