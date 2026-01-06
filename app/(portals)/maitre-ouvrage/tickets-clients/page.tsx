'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { employees } from '@/lib/data';
import {
  clientDemands,
  clientDemandStats,
  clients,
} from '@/lib/data/bmo-mock-4';
import type { ClientDemand } from '@/lib/data/bmo-mock-4';

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

type ViewMode = 'all' | 'pending' | 'in_progress' | 'resolved' | 'escalated';
type TypeFilter = 'all' | 'devis' | 'reclamation' | 'information' | 'modification' | 'nouveau_projet' | 'facturation';

export default function DemandesClientsPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [selectedDemand, setSelectedDemand] = useState<ClientDemand | null>(null);
  const [showDemandModal, setShowDemandModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Utilisateur actuel
  const currentUser = {
    id: 'USR-001',
    name: 'A. DIALLO',
    role: 'Directeur Général',
    bureau: 'BMO',
  };

  // Filtrer les demandes
  const filteredDemands = useMemo(() => {
    let filtered = clientDemands;

    // Filtre par statut
    if (viewMode !== 'all') {
      filtered = filtered.filter((d) => d.status === viewMode);
    }

    // Filtre par type
    if (typeFilter !== 'all') {
      filtered = filtered.filter((d) => d.type === typeFilter);
    }

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((d) =>
        d.subject.toLowerCase().includes(query) ||
        d.clientName.toLowerCase().includes(query) ||
        d.id.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [viewMode, typeFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => ({
    total: clientDemands.length,
    pending: clientDemands.filter((d) => d.status === 'pending').length,
    inProgress: clientDemands.filter((d) => d.status === 'in_progress').length,
    resolved: clientDemands.filter((d) => d.status === 'resolved').length,
    escalated: clientDemands.filter((d) => d.status === 'escalated').length,
    avgResponseTime: clientDemandStats.avgResponseTime,
  }), []);

  // Obtenir client
  const getClient = (clientId: string) => {
    return clients.find((c) => c.id === clientId);
  };

  // Icône selon type de demande
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'devis': return '📋';
      case 'reclamation': return '⚠️';
      case 'information': return 'ℹ️';
      case 'modification': return '✏️';
      case 'nouveau_projet': return '🏗️';
      case 'facturation': return '💳';
      default: return '📝';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'devis': return 'Devis';
      case 'reclamation': return 'Réclamation';
      case 'information': return 'Information';
      case 'modification': return 'Modification';
      case 'nouveau_projet': return 'Nouveau projet';
      case 'facturation': return 'Facturation';
      default: return type;
    }
  };

  // Actions
  const handleRespond = (demand: ClientDemand) => {
    setSelectedDemand(demand);
    setResponseText('');
    setShowResponseModal(true);
  };

  const handleSubmitResponse = () => {
    if (!selectedDemand || !responseText.trim()) return;

    const hash = generateSHA3Hash(`${selectedDemand.id}-response-${Date.now()}`);

    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'response',
      module: 'tickets-clients',
      targetId: selectedDemand.id,
      targetType: 'Demande client',
      targetLabel: selectedDemand.subject,
      details: `Réponse: ${responseText.slice(0, 100)}... - Hash: ${hash}`,
      bureau: currentUser.bureau,
    });

    addToast(`✓ Réponse envoyée pour ${selectedDemand.id} - Hash: ${hash.slice(0, 20)}...`, 'success');
    setShowResponseModal(false);
    setResponseText('');
  };

  const handleConvertToProject = (demand: ClientDemand) => {
    const hash = generateSHA3Hash(`${demand.id}-convert-project-${Date.now()}`);
    const newProjectId = `PRJ-${Date.now().toString().slice(-4)}`;

    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'convert_to_project',
      module: 'tickets-clients',
      targetId: demand.id,
      targetType: 'Demande client',
      targetLabel: demand.subject,
      details: `Converti en projet ${newProjectId} - Client: ${demand.clientName} - Hash: ${hash}`,
      bureau: currentUser.bureau,
    });

    addToast(`✓ Demande ${demand.id} convertie en projet ${newProjectId}`, 'success');
  };

  const handleAssign = (demand: ClientDemand) => {
    setSelectedDemand(demand);
    setShowAssignModal(true);
  };

  const handleAssignTo = (employee: typeof employees[0]) => {
    if (!selectedDemand) return;

    const hash = generateSHA3Hash(`${selectedDemand.id}-assign-${employee.id}-${Date.now()}`);

    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'assign',
      module: 'tickets-clients',
      targetId: selectedDemand.id,
      targetType: 'Demande client',
      targetLabel: selectedDemand.subject,
      details: `Assigné à ${employee.name} (${employee.bureau}) - Hash: ${hash}`,
      bureau: currentUser.bureau,
    });

    addToast(`✓ Demande ${selectedDemand.id} assignée à ${employee.name}`, 'success');
    setShowAssignModal(false);
  };

  const handleEscalate = (demand: ClientDemand) => {
    const hash = generateSHA3Hash(`${demand.id}-escalate-${Date.now()}`);

    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'escalate',
      module: 'tickets-clients',
      targetId: demand.id,
      targetType: 'Demande client',
      targetLabel: demand.subject,
      details: `Escaladé au niveau supérieur - Priorité: ${demand.priority} - Hash: ${hash}`,
      bureau: currentUser.bureau,
    });

    addToast(`⬆️ Demande ${demand.id} escaladée`, 'warning');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            📋 Tickets clients
            <Badge variant="warning">{stats.pending}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Total: {stats.total} • Temps de réponse moyen: <span className="text-emerald-400 font-bold">{stats.avgResponseTime}j</span>
          </p>
        </div>
        <Button onClick={() => addToast('Nouvelle demande manuelle', 'info')}>
          + Saisir demande
        </Button>
      </div>

      {/* Stats par statut */}
      <div className="grid grid-cols-6 gap-3">
        <Card
          className={cn('cursor-pointer transition-all', viewMode === 'all' && 'ring-2 ring-orange-500')}
          onClick={() => setViewMode('all')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-[10px] text-slate-400">Total</p>
          </CardContent>
        </Card>
        <Card
          className={cn('cursor-pointer transition-all border-amber-500/30', viewMode === 'pending' && 'ring-2 ring-amber-500')}
          onClick={() => setViewMode('pending')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
            <p className="text-[10px] text-slate-400">En attente</p>
          </CardContent>
        </Card>
        <Card
          className={cn('cursor-pointer transition-all border-blue-500/30', viewMode === 'in_progress' && 'ring-2 ring-blue-500')}
          onClick={() => setViewMode('in_progress')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
            <p className="text-[10px] text-slate-400">En cours</p>
          </CardContent>
        </Card>
        <Card
          className={cn('cursor-pointer transition-all border-emerald-500/30', viewMode === 'resolved' && 'ring-2 ring-emerald-500')}
          onClick={() => setViewMode('resolved')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.resolved}</p>
            <p className="text-[10px] text-slate-400">Résolues</p>
          </CardContent>
        </Card>
        <Card
          className={cn('cursor-pointer transition-all border-red-500/30', viewMode === 'escalated' && 'ring-2 ring-red-500')}
          onClick={() => setViewMode('escalated')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.escalated}</p>
            <p className="text-[10px] text-slate-400">Escaladées</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.avgResponseTime}j</p>
            <p className="text-[10px] text-slate-400">Délai moy.</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres par type */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={typeFilter === 'all' ? 'default' : 'secondary'} onClick={() => setTypeFilter('all')}>
          Tous
        </Button>
        <Button size="sm" variant={typeFilter === 'nouveau_projet' ? 'default' : 'secondary'} onClick={() => setTypeFilter('nouveau_projet')}>
          🏗️ Nouveau projet
        </Button>
        <Button size="sm" variant={typeFilter === 'reclamation' ? 'default' : 'secondary'} onClick={() => setTypeFilter('reclamation')}>
          ⚠️ Réclamation
        </Button>
        <Button size="sm" variant={typeFilter === 'modification' ? 'default' : 'secondary'} onClick={() => setTypeFilter('modification')}>
          ✏️ Modification
        </Button>
        <Button size="sm" variant={typeFilter === 'information' ? 'default' : 'secondary'} onClick={() => setTypeFilter('information')}>
          ℹ️ Information
        </Button>
        <Button size="sm" variant={typeFilter === 'facturation' ? 'default' : 'secondary'} onClick={() => setTypeFilter('facturation')}>
          💳 Facturation
        </Button>
        <Button size="sm" variant={typeFilter === 'devis' ? 'default' : 'secondary'} onClick={() => setTypeFilter('devis')}>
          📋 Devis
        </Button>
      </div>

      {/* Recherche */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="🔍 Rechercher demande, client..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            'flex-1 px-4 py-2 rounded-lg text-sm',
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
          )}
        />
        <Button variant="secondary" onClick={() => { setViewMode('all'); setTypeFilter('all'); setSearchQuery(''); }}>
          Réinitialiser
        </Button>
      </div>

      {/* Table des demandes */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                  <th className="px-3 py-2.5 text-left font-bold text-amber-500">ID</th>
                  <th className="px-3 py-2.5 text-left font-bold text-amber-500">Client</th>
                  <th className="px-3 py-2.5 text-left font-bold text-amber-500">Type</th>
                  <th className="px-3 py-2.5 text-left font-bold text-amber-500">Sujet</th>
                  <th className="px-3 py-2.5 text-left font-bold text-amber-500">Statut</th>
                  <th className="px-3 py-2.5 text-left font-bold text-amber-500">Assigné</th>
                  <th className="px-3 py-2.5 text-left font-bold text-amber-500">Date</th>
                  <th className="px-3 py-2.5 text-left font-bold text-amber-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDemands.map((demand) => {
                  const client = getClient(demand.clientId);

                  return (
                    <tr
                      key={demand.id}
                      className={cn(
                        'border-t transition-all hover:bg-orange-500/5 cursor-pointer',
                        darkMode ? 'border-slate-700/50' : 'border-gray-100',
                        demand.priority === 'urgent' && 'bg-red-500/5',
                        demand.status === 'escalated' && 'bg-amber-500/5'
                      )}
                      onClick={() => {
                        setSelectedDemand(demand);
                        setShowDemandModal(true);
                      }}
                    >
                      <td className="px-3 py-2.5">
                        <span className="font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold text-[10px]">
                          {demand.id}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <Link href={`/maitre-ouvrage/clients?id=${demand.clientId}`} className="text-blue-400 hover:underline font-semibold">
                            {demand.clientName}
                          </Link>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <span>{getTypeIcon(demand.type)}</span>
                          <span className="text-[10px]">{getTypeLabel(demand.type)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div>
                          <p className="font-semibold">{demand.subject}</p>
                          {demand.project && (
                            <Link href={`/maitre-ouvrage/projets-en-cours?id=${demand.project}`} className="text-[10px] text-orange-400 hover:underline">
                              → {demand.project}
                            </Link>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <Badge
                            variant={
                              demand.priority === 'urgent' ? 'urgent' :
                              demand.priority === 'high' ? 'warning' : 'default'
                            }
                            className="text-[9px]"
                          >
                            {demand.priority}
                          </Badge>
                          <Badge
                            variant={
                              demand.status === 'pending' ? 'warning' :
                              demand.status === 'in_progress' ? 'info' :
                              demand.status === 'resolved' ? 'success' : 'urgent'
                            }
                            className="text-[9px]"
                          >
                            {demand.status === 'pending' ? 'Attente' :
                             demand.status === 'in_progress' ? 'En cours' :
                             demand.status === 'resolved' ? 'Résolu' : 'Escaladé'}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        {demand.assignedTo ? (
                          <div className="flex items-center gap-1">
                            <span className="text-blue-400">{demand.assignedTo}</span>
                            {demand.assignedBureau && <BureauTag bureau={demand.assignedBureau} />}
                          </div>
                        ) : (
                          <span className="text-slate-500">Non assigné</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-slate-400">{demand.date}</td>
                      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          {demand.status === 'pending' && (
                            <>
                              <Button size="xs" variant="success" onClick={() => handleRespond(demand)}>
                                ✓
                              </Button>
                              <Button size="xs" variant="info" onClick={() => handleAssign(demand)}>
                                →
                              </Button>
                            </>
                          )}
                          {demand.type === 'nouveau_projet' && demand.status !== 'resolved' && (
                            <Button size="xs" variant="warning" onClick={() => handleConvertToProject(demand)}>
                              🏗️
                            </Button>
                          )}
                          {demand.status !== 'escalated' && demand.status !== 'resolved' && (
                            <Button size="xs" variant="destructive" onClick={() => handleEscalate(demand)}>
                              ⬆️
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

      {filteredDemands.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-400">Aucune demande trouvée</p>
          </CardContent>
        </Card>
      )}

      {/* Modal détail demande */}
      {showDemandModal && selectedDemand && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                {getTypeIcon(selectedDemand.type)} Demande {selectedDemand.id}
              </CardTitle>
              <Button size="xs" variant="ghost" onClick={() => setShowDemandModal(false)}>✕</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Info client */}
              <div className={cn('p-3 rounded-lg', darkMode ? 'bg-slate-700/50' : 'bg-gray-50')}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Client</p>
                    <Link href={`/maitre-ouvrage/clients?id=${selectedDemand.clientId}`} className="font-bold text-blue-400 hover:underline">
                      {selectedDemand.clientName}
                    </Link>
                  </div>
                  <div className="text-right">
                    <div className="flex gap-1">
                      <Badge variant={selectedDemand.priority === 'urgent' ? 'urgent' : selectedDemand.priority === 'high' ? 'warning' : 'default'}>
                        {selectedDemand.priority}
                      </Badge>
                      <Badge variant={selectedDemand.status === 'pending' ? 'warning' : selectedDemand.status === 'resolved' ? 'success' : 'info'}>
                        {selectedDemand.status}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{selectedDemand.date}</p>
                  </div>
                </div>
              </div>

              {/* Contenu */}
              <div>
                <h4 className="font-bold text-sm mb-2">{selectedDemand.subject}</h4>
                <p className="text-xs text-slate-300">{selectedDemand.description}</p>
              </div>

              {/* Pièces jointes */}
              {selectedDemand.attachments && selectedDemand.attachments > 0 && (
                <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                  <p className="text-xs text-slate-400">📎 {selectedDemand.attachments} pièce(s) jointe(s)</p>
                </div>
              )}

              {/* Réponse existante */}
              {selectedDemand.response && (
                <div className={cn('p-3 rounded-lg border-l-4 border-l-emerald-500', darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50')}>
                  <p className="text-xs text-slate-400 mb-1">Réponse (en {selectedDemand.responseTime}j):</p>
                  <p className="text-sm text-emerald-400">{selectedDemand.response}</p>
                </div>
              )}

              {/* Projet lié */}
              {selectedDemand.project && (
                <div className={cn('p-2 rounded flex items-center justify-between', darkMode ? 'bg-orange-500/10' : 'bg-orange-50')}>
                  <p className="text-xs">Projet lié: <span className="font-mono text-orange-400">{selectedDemand.project}</span></p>
                  <Link href={`/maitre-ouvrage/projets-en-cours?id=${selectedDemand.project}`}>
                    <Button size="xs" variant="info">Voir projet</Button>
                  </Link>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-700/50">
                {selectedDemand.status !== 'resolved' && (
                  <>
                    <Button className="flex-1" variant="success" onClick={() => { setShowDemandModal(false); handleRespond(selectedDemand); }}>
                      ✓ Répondre
                    </Button>
                    <Button variant="info" onClick={() => { setShowDemandModal(false); handleAssign(selectedDemand); }}>
                      → Assigner
                    </Button>
                  </>
                )}
                {selectedDemand.type === 'nouveau_projet' && selectedDemand.status !== 'resolved' && (
                  <Button variant="warning" onClick={() => { handleConvertToProject(selectedDemand); setShowDemandModal(false); }}>
                    🏗️ Convertir en projet
                  </Button>
                )}
                {selectedDemand.status !== 'escalated' && selectedDemand.status !== 'resolved' && (
                  <Button variant="destructive" onClick={() => { handleEscalate(selectedDemand); setShowDemandModal(false); }}>
                    ⬆️ Escalader
                  </Button>
                )}
                <Button variant="secondary" onClick={() => setShowDemandModal(false)}>
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal réponse */}
      {showResponseModal && selectedDemand && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-sm">✓ Répondre à {selectedDemand.id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={cn('p-2 rounded text-xs', darkMode ? 'bg-slate-700/50' : 'bg-gray-50')}>
                <p className="text-slate-400">Client: <span className="text-white">{selectedDemand.clientName}</span></p>
                <p className="text-slate-400 mt-1">Sujet: <span className="text-white">{selectedDemand.subject}</span></p>
              </div>

              <div>
                <p className="text-xs font-bold mb-2">Votre réponse *</p>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={4}
                  placeholder="Saisissez votre réponse au client..."
                  className={cn(
                    'w-full px-3 py-2 rounded text-sm',
                    darkMode ? 'bg-slate-800 border border-slate-600' : 'bg-white border border-gray-300'
                  )}
                />
              </div>

              <div className={cn('p-2 rounded text-[10px]', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                <p className="text-slate-400">
                  ⚠️ Cette réponse sera enregistrée dans l'historique avec:
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Hash SHA3-256</span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">Horodatage</span>
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">Décision tracée</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" disabled={!responseText.trim()} onClick={handleSubmitResponse}>
                  ✓ Envoyer la réponse
                </Button>
                <Button variant="secondary" onClick={() => setShowResponseModal(false)}>
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal assignation */}
      {showAssignModal && selectedDemand && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-sm">→ Assigner {selectedDemand.id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={cn('p-2 rounded text-xs', darkMode ? 'bg-slate-700/50' : 'bg-gray-50')}>
                <p className="text-slate-400">Sujet: <span className="text-white">{selectedDemand.subject}</span></p>
              </div>

              <div>
                <p className="text-xs font-bold mb-2">Sélectionner un responsable</p>
                <div className="grid grid-cols-2 gap-2">
                  {employees.map((emp) => (
                    <button
                      key={emp.id}
                      className={cn(
                        'p-2 rounded flex items-center gap-2 text-left transition-all',
                        darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'
                      )}
                      onClick={() => handleAssignTo(emp)}
                    >
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-bold">
                        {emp.initials}
                      </div>
                      <div>
                        <p className="text-xs font-semibold">{emp.name}</p>
                        <p className="text-[10px] text-slate-400">{emp.bureau}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button variant="secondary" className="w-full" onClick={() => setShowAssignModal(false)}>
                Annuler
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info traçabilité */}
      <Card className="border-emerald-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <h3 className="font-bold text-sm text-emerald-400">Traçabilité complète</h3>
              <p className="text-xs text-slate-400 mt-1">
                Chaque action (réponse, assignation, conversion, escalade) génère une entrée dans les <span className="text-orange-400 font-bold">decisions</span> avec hash SHA3-256, horodatage et auteur.
                Les pièces jointes sont liées automatiquement aux décisions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
