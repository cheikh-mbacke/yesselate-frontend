'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import {
  projects,
  employees,
  litiges,
  recouvrements,
  contractsToSign,
  paymentsN1,
  messagesExternes,
  decisions,
} from '@/lib/data';
import {
  projectsEnriched,
  projectTimelines,
  clients,
} from '@/lib/data/bmo-mock-4';
import type { Project } from '@/lib/types/bmo.types';

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

type ViewMode = 'all' | 'active' | 'blocked' | 'completed';
type DetailTab = 'timeline' | 'risques' | 'liens' | 'equipe';

export default function ProjectsPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [selectedProject, setSelectedProject] = useState<typeof projectsEnriched[0] | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailTab>('timeline');
  const [searchQuery, setSearchQuery] = useState('');

  // Utilisateur actuel
  const currentUser = {
    id: 'USR-001',
    name: 'A. DIALLO',
    role: 'Directeur Général',
    bureau: 'BMO',
  };

  // Filtrer les projets
  const filteredProjects = useMemo(() => {
    let filtered = projectsEnriched;

    // Filtre par statut
    if (viewMode !== 'all') {
      filtered = filtered.filter((p) => p.status === viewMode);
    }

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query) ||
        p.client.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [viewMode, searchQuery]);

  // Stats
  const stats = useMemo(() => ({
    total: projectsEnriched.length,
    active: projectsEnriched.filter((p) => p.status === 'active').length,
    blocked: projectsEnriched.filter((p) => p.status === 'blocked').length,
    completed: projectsEnriched.filter((p) => p.status === 'completed').length,
    avgProgress: Math.round(projectsEnriched.reduce((acc, p) => acc + p.progress, 0) / projectsEnriched.length),
    totalBudget: projectsEnriched.reduce((acc, p) => {
      const budget = parseFloat(p.budget.replace(/[M,]/g, '')) || 0;
      return acc + budget;
    }, 0),
  }), []);

  // Obtenir timeline d'un projet
  const getProjectTimeline = (projectId: string) => {
    return projectTimelines.find((t) => t.projectId === projectId)?.events || [];
  };

  // Obtenir client d'un projet
  const getProjectClient = (clientId: string) => {
    return clients.find((c) => c.id === clientId);
  };

  // Actions
  const handleOpenRisks = (project: typeof projectsEnriched[0]) => {
    setSelectedProject(project);
    setDetailTab('risques');
    setShowProjectModal(true);
  };

  const handleLinkPayment = (project: typeof projectsEnriched[0]) => {
    setSelectedProject(project);
    setDetailTab('liens');
    setShowProjectModal(true);
    addToast(`Liaisons projet ${project.id}`, 'info');
  };

  const handleOpenExchanges = (project: typeof projectsEnriched[0]) => {
    const timeline = getProjectTimeline(project.id);
    const messages = timeline.filter((e) => e.type === 'message');
    addToast(`${messages.length} échange(s) trouvé(s) pour ${project.id}`, 'info');
    setSelectedProject(project);
    setDetailTab('timeline');
    setShowProjectModal(true);
  };

  // Couleur selon statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400';
      case 'blocked': return 'text-red-400';
      case 'completed': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'active': return 'border-l-emerald-500';
      case 'blocked': return 'border-l-red-500';
      case 'completed': return 'border-l-blue-500';
      default: return 'border-l-slate-500';
    }
  };

  // Icône selon type d'événement
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'decision': return '⚖️';
      case 'litige': return '🚨';
      case 'recouvrement': return '💰';
      case 'message': return '💬';
      case 'paiement': return '💳';
      case 'contrat': return '📜';
      case 'avancement': return '📊';
      case 'alerte': return '⚠️';
      default: return '📋';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            📊 Projets stratégiques
            <Badge variant="warning">{stats.total}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Écosystème vivant • Avancement moyen: <span className="text-emerald-400 font-bold">{stats.avgProgress}%</span> • Budget total: <span className="text-amber-400 font-bold">{stats.totalBudget.toFixed(1)}M FCFA</span>
          </p>
        </div>
        <Button onClick={() => addToast('Nouveau projet', 'info')}>
          + Nouveau projet
        </Button>
      </div>

      {/* Stats par statut */}
      <div className="grid grid-cols-5 gap-3">
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
          className={cn('cursor-pointer transition-all border-emerald-500/30', viewMode === 'active' && 'ring-2 ring-emerald-500')}
          onClick={() => setViewMode('active')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
            <p className="text-[10px] text-slate-400">Actifs</p>
          </CardContent>
        </Card>
        <Card
          className={cn('cursor-pointer transition-all border-red-500/30', viewMode === 'blocked' && 'ring-2 ring-red-500')}
          onClick={() => setViewMode('blocked')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.blocked}</p>
            <p className="text-[10px] text-slate-400">Bloqués</p>
          </CardContent>
        </Card>
        <Card
          className={cn('cursor-pointer transition-all border-blue-500/30', viewMode === 'completed' && 'ring-2 ring-blue-500')}
          onClick={() => setViewMode('completed')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.completed}</p>
            <p className="text-[10px] text-slate-400">Terminés</p>
          </CardContent>
        </Card>
        <Card className="border-orange-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">{stats.avgProgress}%</p>
            <p className="text-[10px] text-slate-400">Avancement moy.</p>
          </CardContent>
        </Card>
      </div>

      {/* Recherche */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="🔍 Rechercher projet, client..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            'flex-1 px-4 py-2 rounded-lg text-sm',
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
          )}
        />
        <Button variant="secondary" onClick={() => { setViewMode('all'); setSearchQuery(''); }}>
          Réinitialiser
        </Button>
      </div>

      {/* Liste des projets */}
      <div className="space-y-3">
        {filteredProjects.map((project) => {
          const client = getProjectClient(project.clientId);
          const timeline = getProjectTimeline(project.id);
          const recentEvents = timeline.slice(0, 3);
          const hasRisks = project.risks.length > 0;
          const hasLitiges = project.linkedLitiges.length > 0;

          return (
            <Card
              key={project.id}
              className={cn(
                'hover:border-orange-500/50 transition-all border-l-4',
                getStatusBorder(project.status)
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-xs text-orange-400">{project.id}</span>
                      <Badge
                        variant={project.status === 'active' ? 'success' : project.status === 'blocked' ? 'urgent' : 'info'}
                      >
                        {project.status === 'active' ? 'Actif' : project.status === 'blocked' ? 'Bloqué' : 'Terminé'}
                      </Badge>
                      <BureauTag bureau={project.bureau} />
                      {hasRisks && (
                        <Badge variant="warning" className="animate-pulse">
                          ⚠️ {project.risks.length} risque(s)
                        </Badge>
                      )}
                      {hasLitiges && (
                        <Badge variant="urgent">
                          🚨 Litige
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-bold text-sm">{project.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="text-slate-400">Client:</span>
                      <Link href={`/maitre-ouvrage/clients?id=${project.clientId}`} className="text-blue-400 hover:underline">
                        {project.client}
                      </Link>
                      {client && (
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">Satisfaction:</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className={star <= client.satisfaction ? 'text-amber-400' : 'text-slate-600'}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-lg text-amber-400">{project.budget}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Dépensé: {project.spent}</p>
                    <p className="text-[10px] text-slate-400">Équipe: {project.team} personnes</p>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">Avancement</span>
                    <span className={cn('font-bold', getStatusColor(project.status))}>{project.progress}%</span>
                  </div>
                  <div className={cn('h-2 rounded-full', darkMode ? 'bg-slate-700' : 'bg-gray-200')}>
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        project.status === 'blocked' ? 'bg-red-500' :
                        project.progress >= 80 ? 'bg-emerald-500' :
                        project.progress >= 50 ? 'bg-amber-500' : 'bg-blue-500'
                      )}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  {project.nextMilestone && (
                    <p className="text-[10px] text-slate-500 mt-1">
                      📍 Prochaine étape: {project.nextMilestone}
                    </p>
                  )}
                </div>

                {/* Événements récents */}
                {recentEvents.length > 0 && (
                  <div className={cn('p-2 rounded-lg mb-3', darkMode ? 'bg-slate-700/30' : 'bg-gray-50')}>
                    <p className="text-[10px] text-slate-400 mb-2">📜 Derniers événements:</p>
                    <div className="space-y-1">
                      {recentEvents.map((event) => (
                        <div key={event.id} className="flex items-center gap-2 text-[10px]">
                          <span>{getEventIcon(event.type)}</span>
                          <span className={cn(
                            event.impact === 'positive' ? 'text-emerald-400' :
                            event.impact === 'negative' ? 'text-red-400' : 'text-slate-300'
                          )}>
                            {event.title}
                          </span>
                          <span className="text-slate-500">- {event.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="xs"
                    variant="warning"
                    onClick={() => handleOpenRisks(project)}
                    disabled={!hasRisks}
                  >
                    ⚠️ Ouvrir risques ({project.risks.length})
                  </Button>
                  <Button
                    size="xs"
                    variant="info"
                    onClick={() => handleLinkPayment(project)}
                  >
                    🔗 Paiements/Contrats
                  </Button>
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => handleOpenExchanges(project)}
                  >
                    💬 Échanges ({timeline.filter((e) => e.type === 'message').length})
                  </Button>
                  <Button
                    size="xs"
                    onClick={() => {
                      setSelectedProject(project);
                      setDetailTab('timeline');
                      setShowProjectModal(true);
                    }}
                  >
                    📊 Timeline complète
                  </Button>
                  {hasLitiges && (
                    <Link href={`/maitre-ouvrage/litiges?projet=${project.id}`}>
                      <Button size="xs" variant="destructive">
                        🚨 Voir litige
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-400">Aucun projet trouvé</p>
          </CardContent>
        </Card>
      )}

      {/* Modal détail projet */}
      {showProjectModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                📊 {selectedProject.name}
                <Badge variant={selectedProject.status === 'active' ? 'success' : selectedProject.status === 'blocked' ? 'urgent' : 'info'}>
                  {selectedProject.status}
                </Badge>
              </CardTitle>
              <Button size="xs" variant="ghost" onClick={() => setShowProjectModal(false)}>✕</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Onglets */}
              <div className="flex gap-2 border-b border-slate-700/50 pb-2">
                <Button size="xs" variant={detailTab === 'timeline' ? 'default' : 'ghost'} onClick={() => setDetailTab('timeline')}>
                  📜 Timeline
                </Button>
                <Button size="xs" variant={detailTab === 'risques' ? 'default' : 'ghost'} onClick={() => setDetailTab('risques')}>
                  ⚠️ Risques ({selectedProject.risks.length})
                </Button>
                <Button size="xs" variant={detailTab === 'liens' ? 'default' : 'ghost'} onClick={() => setDetailTab('liens')}>
                  🔗 Liaisons
                </Button>
                <Button size="xs" variant={detailTab === 'equipe' ? 'default' : 'ghost'} onClick={() => setDetailTab('equipe')}>
                  👥 Équipe
                </Button>
              </div>

              {/* Tab Timeline */}
              {detailTab === 'timeline' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-orange-400">Mémoire du projet</h4>
                  {getProjectTimeline(selectedProject.id).map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        'p-3 rounded-lg border-l-4',
                        event.impact === 'positive' ? 'border-l-emerald-500 bg-emerald-500/10' :
                        event.impact === 'negative' ? 'border-l-red-500 bg-red-500/10' : 'border-l-slate-500 bg-slate-500/10'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getEventIcon(event.type)}</span>
                          <div>
                            <p className="font-bold text-sm">{event.title}</p>
                            <p className="text-xs text-slate-400">{event.description}</p>
                          </div>
                        </div>
                        <div className="text-right text-[10px]">
                          <p className="text-slate-400">{event.date}</p>
                          {event.author && <p className="text-blue-400">{event.author}</p>}
                          {event.bureau && <BureauTag bureau={event.bureau} />}
                        </div>
                      </div>
                      {event.hash && (
                        <div className={cn('mt-2 px-2 py-1 rounded text-[9px] font-mono', darkMode ? 'bg-slate-700' : 'bg-gray-200')}>
                          🔒 {event.hash}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tab Risques */}
              {detailTab === 'risques' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-red-400">Risques identifiés</h4>
                  {selectedProject.risks.length === 0 ? (
                    <p className="text-sm text-slate-400">Aucun risque identifié ✓</p>
                  ) : (
                    selectedProject.risks.map((risk, i) => (
                      <div
                        key={i}
                        className={cn('p-3 rounded-lg flex items-center gap-3', darkMode ? 'bg-red-500/10' : 'bg-red-50')}
                      >
                        <span className="text-xl">⚠️</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{risk}</p>
                        </div>
                        <Button size="xs" variant="warning" onClick={() => addToast(`Escalade risque: ${risk}`, 'warning')}>
                          Escalader
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab Liaisons */}
              {detailTab === 'liens' && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Paiements */}
                  <div>
                    <h4 className="font-bold text-xs text-blue-400 mb-2">💳 Paiements liés</h4>
                    {selectedProject.linkedPayments.length === 0 ? (
                      <p className="text-[10px] text-slate-400">Aucun paiement lié</p>
                    ) : (
                      selectedProject.linkedPayments.map((payId) => {
                        const payment = paymentsN1.find((p) => p.id === payId);
                        return payment ? (
                          <div key={payId} className={cn('p-2 rounded mb-2', darkMode ? 'bg-slate-700/50' : 'bg-gray-100')}>
                            <span className="font-mono text-[10px] text-blue-400">{payment.id}</span>
                            <p className="text-xs">{payment.beneficiary}</p>
                            <p className="text-xs font-bold text-amber-400">{payment.amount} FCFA</p>
                          </div>
                        ) : null;
                      })
                    )}
                  </div>

                  {/* Contrats */}
                  <div>
                    <h4 className="font-bold text-xs text-purple-400 mb-2">📜 Contrats liés</h4>
                    {selectedProject.linkedContracts.length === 0 ? (
                      <p className="text-[10px] text-slate-400">Aucun contrat lié</p>
                    ) : (
                      selectedProject.linkedContracts.map((ctrId) => (
                        <div key={ctrId} className={cn('p-2 rounded mb-2', darkMode ? 'bg-slate-700/50' : 'bg-gray-100')}>
                          <span className="font-mono text-[10px] text-purple-400">{ctrId}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Litiges */}
                  <div>
                    <h4 className="font-bold text-xs text-red-400 mb-2">🚨 Litiges liés</h4>
                    {selectedProject.linkedLitiges.length === 0 ? (
                      <p className="text-[10px] text-slate-400">Aucun litige ✓</p>
                    ) : (
                      selectedProject.linkedLitiges.map((litId) => {
                        const litige = litiges.find((l) => l.id === litId);
                        return litige ? (
                          <div key={litId} className={cn('p-2 rounded mb-2 border-l-2 border-l-red-500', darkMode ? 'bg-slate-700/50' : 'bg-gray-100')}>
                            <span className="font-mono text-[10px] text-red-400">{litige.id}</span>
                            <p className="text-xs">{litige.objet}</p>
                            <p className="text-xs font-bold text-amber-400">{litige.montant} FCFA</p>
                            <Badge variant="urgent" className="mt-1">{litige.status}</Badge>
                          </div>
                        ) : null;
                      })
                    )}
                  </div>

                  {/* Recouvrements */}
                  <div>
                    <h4 className="font-bold text-xs text-amber-400 mb-2">💰 Recouvrements liés</h4>
                    {selectedProject.linkedRecouvrements.length === 0 ? (
                      <p className="text-[10px] text-slate-400">Aucun recouvrement ✓</p>
                    ) : (
                      selectedProject.linkedRecouvrements.map((recId) => {
                        const recouvrement = recouvrements.find((r) => r.id === recId);
                        return recouvrement ? (
                          <div key={recId} className={cn('p-2 rounded mb-2', darkMode ? 'bg-slate-700/50' : 'bg-gray-100')}>
                            <span className="font-mono text-[10px] text-amber-400">{recouvrement.id}</span>
                            <p className="text-xs">{recouvrement.debiteur}</p>
                            <p className="text-xs font-bold text-red-400">{recouvrement.montant} FCFA</p>
                            <Badge variant="warning" className="mt-1">J+{recouvrement.delay}</Badge>
                          </div>
                        ) : null;
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Tab Équipe */}
              {detailTab === 'equipe' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-blue-400">Équipe projet ({selectedProject.team} personnes)</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {employees.slice(0, Math.min(selectedProject.team, 6)).map((emp) => (
                      <div key={emp.id} className={cn('p-2 rounded flex items-center gap-2', darkMode ? 'bg-slate-700/50' : 'bg-gray-100')}>
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-xs font-bold">
                          {emp.initials}
                        </div>
                        <div>
                          <p className="text-xs font-semibold">{emp.name}</p>
                          <p className="text-[10px] text-slate-400">{emp.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                <Link href={`/maitre-ouvrage/clients?id=${selectedProject.clientId}`} className="flex-1">
                  <Button className="w-full" variant="info">
                    👤 Voir client
                  </Button>
                </Link>
                <Button variant="secondary" onClick={() => setShowProjectModal(false)}>
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info */}
      <Card className="border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-bold text-sm text-blue-400">Projets comme entités vivantes</h3>
              <p className="text-xs text-slate-400 mt-1">
                Chaque projet possède une <span className="text-orange-400 font-bold">mémoire</span> (timeline des événements), 
                une <span className="text-emerald-400 font-bold">perception</span> (risques identifiés), 
                un <span className="text-purple-400 font-bold">jugement</span> (satisfaction client) et 
                une <span className="text-blue-400 font-bold">voix</span> (échanges liés).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
