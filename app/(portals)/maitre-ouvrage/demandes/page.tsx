'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import {
  PilotageBanner,
  SmartFilters,
  IntelligentSearch,
  DemandDetailsModal,
  RequestComplementModal,
  IntelligentAssignmentModal,
  DemandTimeline,
  DemandHeatmap,
} from '@/components/features/bmo/demandes';
import {
  demands,
  bureaux,
  decisions,
  echangesBureaux,
  employees,
} from '@/lib/data';
import type { Priority, Demand } from '@/lib/types/bmo.types';
import { AlertTriangle, Clock, Eye, UserPlus, Calendar, TrendingUp, FileText, Send, BarChart3 } from 'lucide-react';
import { usePageNavigation, useCrossPageLinks } from '@/hooks/usePageNavigation';
import { useAutoSyncCounts } from '@/hooks/useAutoSync';

// Utilitaire pour générer un hash SHA3-256 simulé
const generateHash = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `SHA3:${Math.abs(hash).toString(16).padStart(12, '0')}...`;
};

// Calculer le délai en jours depuis une date DD/MM/YYYY
const calculateDelay = (dateStr: string): number => {
  const [day, month, year] = dateStr.split('/').map(Number);
  const demandDate = new Date(year, month - 1, day);
  const today = new Date();
  const diffTime = today.getTime() - demandDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

type ViewMode = 'list' | 'bureau' | 'timeline' | 'heatmap';

interface AdvancedFilters {
  bureau?: string[];
  type?: string[];
  priority?: string[];
  status?: string[];
  dateFrom?: string;
  dateTo?: string;
  amountMin?: string;
  amountMax?: string;
  project?: string;
}

export default function DemandesPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [filter, setFilter] = useState<'all' | Priority>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showComplementModal, setShowComplementModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});
  const [heatmapGroupBy, setHeatmapGroupBy] = useState<'bureau' | 'priority' | 'type'>('bureau');

  // Navigation automatique
  const { updateFilters, getFilters } = usePageNavigation('demandes');
  const crossPageLinks = useCrossPageLinks('demandes');

  // Synchronisation automatique des comptages pour la sidebar
  useAutoSyncCounts('demandes', () => {
    return enrichedDemands.filter(d => d.status === 'pending').length;
  }, { interval: 10000, immediate: true });

  // Enrichir les demandes avec le délai calculé
  const enrichedDemands = useMemo(() => {
    return demands.map((d) => ({
      ...d,
      delayDays: calculateDelay(d.date),
      isOverdue: calculateDelay(d.date) > 7 && d.status !== 'validated',
    }));
  }, []);

  // Filtrer les demandes avec tous les filtres
  const filteredDemands = useMemo(() => {
    let result = enrichedDemands;

    // Filtre priorité simple
    if (filter !== 'all') {
      result = result.filter(d => d.priority === filter);
    }

    // Filtre recherche
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.subject.toLowerCase().includes(lowerQuery) ||
        d.id.toLowerCase().includes(lowerQuery) ||
        d.bureau.toLowerCase().includes(lowerQuery) ||
        d.type.toLowerCase().includes(lowerQuery)
      );
    }

    // Filtres avancés
    if (advancedFilters.bureau && advancedFilters.bureau.length > 0) {
      result = result.filter(d => advancedFilters.bureau!.includes(d.bureau));
    }

    if (advancedFilters.type && advancedFilters.type.length > 0) {
      result = result.filter(d => advancedFilters.type!.includes(d.type));
    }

    if (advancedFilters.priority && advancedFilters.priority.length > 0) {
      result = result.filter(d => advancedFilters.priority!.includes(d.priority));
    }

    if (advancedFilters.status && advancedFilters.status.length > 0) {
      result = result.filter(d => {
        const status = d.status || 'pending';
        return advancedFilters.status!.includes(status);
      });
    }

    // Filtres de date
    if (advancedFilters.dateFrom || advancedFilters.dateTo) {
      result = result.filter(d => {
        const [day, month, year] = d.date.split('/').map(Number);
        const demandDate = new Date(year, month - 1, day);
        
        if (advancedFilters.dateFrom) {
          const fromDate = new Date(advancedFilters.dateFrom);
          if (demandDate < fromDate) return false;
        }
        
        if (advancedFilters.dateTo) {
          const toDate = new Date(advancedFilters.dateTo);
          if (demandDate > toDate) return false;
        }
        
        return true;
      });
    }

    // Filtre projet (simulé)
    if (advancedFilters.project) {
      result = result.filter(d => d.subject.toLowerCase().includes(advancedFilters.project!.toLowerCase()));
    }

    return result;
  }, [enrichedDemands, filter, searchQuery, advancedFilters]);

  // Stats globales
  const globalStats = useMemo(() => ({
    total: demands.length,
    urgent: demands.filter((d) => d.priority === 'urgent').length,
    high: demands.filter((d) => d.priority === 'high').length,
    normal: demands.filter((d) => d.priority === 'normal').length,
    avgDelay: Math.round(enrichedDemands.reduce((a, d) => a + d.delayDays, 0) / enrichedDemands.length),
    overdue: enrichedDemands.filter(d => d.isOverdue).length,
  }), [enrichedDemands]);

  // Stats par bureau
  const statsByBureau = useMemo(() => {
    const stats: Record<string, { total: number; urgent: number; avgDelay: number }> = {};
    bureaux.forEach((b) => {
      const bureauDemands = enrichedDemands.filter((d) => d.bureau === b.code);
      stats[b.code] = {
        total: bureauDemands.length,
        urgent: bureauDemands.filter((d) => d.priority === 'urgent').length,
        avgDelay: bureauDemands.length > 0
          ? Math.round(bureauDemands.reduce((a, d) => a + d.delayDays, 0) / bureauDemands.length)
          : 0,
      };
    });
    return stats;
  }, [enrichedDemands]);

  // Preuves liées à une demande
  const getProofsForDemand = (demandId: string) => {
    const relatedDecisions = decisions.filter((d) =>
      d.subject.includes(demandId) || d.subject.includes(demandId.replace('DEM-', ''))
    );
    const relatedExchanges = echangesBureaux.filter((e) =>
      e.subject.toLowerCase().includes(demandId.toLowerCase())
    );
    return { decisions: relatedDecisions, exchanges: relatedExchanges };
  };

  // Actions sur demande
  const handleValidate = (demand: Demand) => {
    const hash = generateHash(`${demand.id}-${Date.now()}-validate`);
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      action: 'validation',
      module: 'demandes',
      targetId: demand.id,
      targetType: 'Demande',
      targetLabel: demand.subject,
      details: `Demande validée - Hash: ${hash}`,
      bureau: demand.bureau,
    });
    addToast(`${demand.id} validée ✓ - Hash: ${hash.slice(0, 20)}...`, 'success');
  };

  const handleReject = (demand: Demand) => {
    const hash = generateHash(`${demand.id}-${Date.now()}-reject`);
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      action: 'rejection',
      module: 'demandes',
      targetId: demand.id,
      targetType: 'Demande',
      targetLabel: demand.subject,
      details: `Demande rejetée - Hash: ${hash}`,
      bureau: demand.bureau,
    });
    addToast(`${demand.id} rejetée`, 'warning');
  };

  const handleRequestComplement = (demand: Demand) => {
    setSelectedDemand(demand);
    setShowComplementModal(true);
    addToast(`Ouverture de la modale de complément pour ${demand.id}`, 'info');
  };

  const handleAssign = (demand: Demand, employeeId?: string) => {
    if (employeeId) {
      const employee = employees.find((e) => e.id === employeeId);
      if (employee) {
        addActionLog({
          userId: 'USR-001',
          userName: 'A. DIALLO',
          userRole: 'Directeur Général',
          action: 'delegation',
          module: 'demandes',
          targetId: demand.id,
          targetType: 'Demande',
          targetLabel: demand.subject,
          details: `Assignée à ${employee.name}`,
          bureau: demand.bureau,
        });
        addToast(`${demand.id} assignée à ${employee.name}`, 'success');
      }
    } else {
      setSelectedDemand(demand);
      setShowAssignmentModal(true);
    }
  };

  const handleAction = (action: 'resolve' | 'assign' | 'escalate' | 'replanify' | 'addNote' | 'addDocument') => {
    if (!selectedDemand) return;

    switch (action) {
      case 'resolve':
        handleValidate(selectedDemand);
        setShowDetailsModal(false);
        break;
      case 'assign':
        setShowDetailsModal(false);
        // Ouvrir la modale d'affectation après un court délai
        setTimeout(() => {
          setShowAssignmentModal(true);
        }, 300);
        break;
      case 'escalate':
        addToast(`Escalade de ${selectedDemand.id} vers le BMO`, 'warning');
        addActionLog({
          userId: 'USR-001',
          userName: 'A. DIALLO',
          userRole: 'Directeur Général',
          action: 'escalation',
          module: 'demandes',
          targetId: selectedDemand.id,
          targetType: 'Demande',
          targetLabel: selectedDemand.subject,
          details: `Escalade vers le BMO`,
          bureau: selectedDemand.bureau,
        });
        break;
      case 'replanify':
        addToast(`Replanification de ${selectedDemand.id}`, 'info');
        addActionLog({
          userId: 'USR-001',
          userName: 'A. DIALLO',
          userRole: 'Directeur Général',
          action: 'modification',
          module: 'demandes',
          targetId: selectedDemand.id,
          targetType: 'Demande',
          targetLabel: selectedDemand.subject,
          details: `Demande replanifiée`,
          bureau: selectedDemand.bureau,
        });
        break;
      case 'addNote':
        addToast('Note ajoutée avec succès', 'success');
        addActionLog({
          userId: 'USR-001',
          userName: 'A. DIALLO',
          userRole: 'Directeur Général',
          action: 'modification',
          module: 'demandes',
          targetId: selectedDemand.id,
          targetType: 'Demande',
          targetLabel: selectedDemand.subject,
          details: `Note ajoutée`,
          bureau: selectedDemand.bureau,
        });
        break;
      case 'addDocument':
        addToast('Document ajouté avec succès', 'success');
        addActionLog({
          userId: 'USR-001',
          userName: 'A. DIALLO',
          userRole: 'Directeur Général',
          action: 'modification',
          module: 'demandes',
          targetId: selectedDemand.id,
          targetType: 'Demande',
          targetLabel: selectedDemand.subject,
          details: `Document ajouté`,
          bureau: selectedDemand.bureau,
        });
        break;
    }
  };

  const handleFilterClick = (filterType: 'urgent' | 'overdue' | 'blocked') => {
    if (filterType === 'urgent') {
      setFilter('urgent');
      addToast('Filtrage des demandes urgentes', 'info');
    } else if (filterType === 'overdue') {
      // Filtrer les demandes en retard
      const overdueDemands = enrichedDemands.filter(d => d.isOverdue);
      if (overdueDemands.length > 0) {
        setAdvancedFilters({ ...advancedFilters });
        setFilter('all');
        addToast(`${overdueDemands.length} demande(s) en retard`, 'warning');
      } else {
        addToast('Aucune demande en retard', 'info');
      }
    } else if (filterType === 'blocked') {
      setAdvancedFilters({ ...advancedFilters, status: ['pending'] });
      setFilter('all');
      const blockedCount = enrichedDemands.filter(d => d.status === 'pending' || !d.status).length;
      addToast(`${blockedCount} demande(s) bloquée(s)`, 'warning');
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header amélioré */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <span className="text-3xl">📋</span>
            Demandes à traiter
            <Badge variant="warning">{globalStats.total}</Badge>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Pilotage intelligent et gestion des demandes multi-bureaux
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SmartFilters
            filters={advancedFilters}
            onFiltersChange={setAdvancedFilters}
          />
        </div>
      </div>

      {/* Bandeau de pilotage */}
      <PilotageBanner
        demands={enrichedDemands}
        onFilterClick={handleFilterClick}
      />

      {/* Recherche et vues */}
      <div className="flex flex-wrap items-center gap-3">
        <IntelligentSearch
          demands={enrichedDemands}
          onSelect={(demandId) => {
            const demand = enrichedDemands.find(d => d.id === demandId);
            if (demand) {
              setSelectedDemand(demand);
              setShowDetailsModal(true);
            }
          }}
          onFilterChange={setSearchQuery}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => {
              setViewMode('list');
              addToast('Affichage en mode liste', 'info');
            }}
          >
            📋 Liste
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'bureau' ? 'default' : 'outline'}
            onClick={() => {
              setViewMode('bureau');
              addToast('Affichage par bureau', 'info');
            }}
          >
            🏢 Bureaux
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            onClick={() => {
              setViewMode('timeline');
              addToast('Affichage en timeline', 'info');
            }}
          >
            ⏱️ Timeline
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'heatmap' ? 'default' : 'outline'}
            onClick={() => {
              setViewMode('heatmap');
              addToast('Affichage en heatmap', 'info');
            }}
          >
            🔥 Heatmap
          </Button>
        </div>
      </div>

      {/* Vue par bureau */}
      {viewMode === 'bureau' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {bureaux.filter((b) => statsByBureau[b.code]?.total > 0).map((bureau) => (
            <Card
              key={bureau.code}
              className="hover:border-orange-500/50 transition-all cursor-pointer"
              onClick={() => {
                setAdvancedFilters({ ...advancedFilters, bureau: [bureau.code] });
                addToast(`Filtrage des demandes du bureau ${bureau.code}`, 'info');
              }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span>{bureau.icon}</span>
                  <span style={{ color: bureau.color }}>{bureau.code}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total:</span>
                  <span className="font-bold">{statsByBureau[bureau.code]?.total || 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Urgentes:</span>
                  <span className="font-bold text-red-400">{statsByBureau[bureau.code]?.urgent || 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Délai moy:</span>
                  <span className="font-bold text-amber-400">{statsByBureau[bureau.code]?.avgDelay || 0}j</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vue Timeline */}
      {viewMode === 'timeline' && (
        <DemandTimeline demands={filteredDemands} />
      )}

      {/* Vue Heatmap */}
      {viewMode === 'heatmap' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Grouper par:</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={heatmapGroupBy === 'bureau' ? 'default' : 'outline'}
                onClick={() => {
                  setHeatmapGroupBy('bureau');
                  addToast('Groupement par bureau', 'info');
                }}
              >
                Bureau
              </Button>
              <Button
                size="sm"
                variant={heatmapGroupBy === 'priority' ? 'default' : 'outline'}
                onClick={() => {
                  setHeatmapGroupBy('priority');
                  addToast('Groupement par priorité', 'info');
                }}
              >
                Priorité
              </Button>
              <Button
                size="sm"
                variant={heatmapGroupBy === 'type' ? 'default' : 'outline'}
                onClick={() => {
                  setHeatmapGroupBy('type');
                  addToast('Groupement par type', 'info');
                }}
              >
                Type
              </Button>
            </div>
          </div>
          <DemandHeatmap
            demands={filteredDemands}
            bureaux={bureaux}
            groupBy={heatmapGroupBy}
          />
        </div>
      )}

      {/* Liste des demandes (vue principale) */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredDemands.map((demand) => {
            const proofs = getProofsForDemand(demand.id);
            const hasProofs = proofs.decisions.length > 0 || proofs.exchanges.length > 0;

            return (
              <Card
                key={demand.id}
                className={cn(
                  'transition-all hover:shadow-lg cursor-pointer',
                  demand.priority === 'urgent' && 'border-l-4 border-l-red-500 bg-red-500/5',
                  demand.priority === 'high' && 'border-l-4 border-l-amber-500 bg-amber-500/5',
                  demand.isOverdue && 'ring-2 ring-orange-500/50',
                )}
                onClick={() => {
                  setSelectedDemand(demand);
                  setShowDetailsModal(true);
                  addToast(`Ouverture des détails de ${demand.id}`, 'info');
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0',
                          darkMode ? 'bg-slate-700' : 'bg-gray-100'
                        )}
                      >
                        {demand.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-mono text-xs text-orange-400 font-bold">{demand.id}</span>
                          <BureauTag bureau={demand.bureau} />
                          <Badge
                            variant={
                              demand.priority === 'urgent' ? 'urgent' :
                              demand.priority === 'high' ? 'warning' : 'default'
                            }
                            pulse={demand.priority === 'urgent'}
                            className="text-[10px]"
                          >
                            {demand.priority}
                          </Badge>
                          {demand.isOverdue && (
                            <Badge variant="urgent" className="text-[10px]">
                              <Clock className="w-3 h-3 mr-1" />
                              Retard ({demand.delayDays}j)
                            </Badge>
                          )}
                          <Badge variant="info" className="text-[10px]">J+{demand.delayDays}</Badge>
                          {hasProofs && (
                            <Badge variant="outline" className="text-[10px]">
                              🔗 {proofs.decisions.length + proofs.exchanges.length} preuves
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-base mb-1">{demand.subject}</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>Type: {demand.type}</span>
                          <span>•</span>
                          <span>Date: {demand.date}</span>
                          {demand.amount !== '—' && demand.amount !== 'N/A' && (
                            <>
                              <span>•</span>
                              <span className="text-amber-400 font-semibold">{demand.amount}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {demand.amount !== '—' && demand.amount !== 'N/A' && (
                        <p className="font-mono font-bold text-lg text-amber-400 mb-1">{demand.amount}</p>
                      )}
                      <p className="text-xs text-slate-400">{demand.date}</p>
                    </div>
                  </div>

                  {/* Actions rapides */}
                  <div
                    className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-700/50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="sm"
                      variant="success"
                      onClick={(e) => {
                        e.stopPropagation();
                        const confirmValidate = window.confirm(`Voulez-vous vraiment valider la demande ${demand.id} ?`);
                        if (confirmValidate) {
                          handleValidate(demand);
                        }
                      }}
                      className="text-xs"
                    >
                      ✓ Valider
                    </Button>
                    <Button
                      size="sm"
                      variant="info"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDemand(demand);
                        setShowDetailsModal(true);
                        addToast(`Ouverture des détails de ${demand.id}`, 'info');
                      }}
                      className="text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Détails
                    </Button>
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRequestComplement(demand);
                      }}
                      className="text-xs"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      Complément
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssign(demand);
                      }}
                      className="text-xs"
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      Affecter
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        const confirmReject = window.confirm(`Voulez-vous vraiment rejeter la demande ${demand.id} ?`);
                        if (confirmReject) {
                          handleReject(demand);
                        }
                      }}
                      className="text-xs"
                    >
                      ✕ Rejeter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filteredDemands.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-400">Aucune demande trouvée avec les filtres sélectionnés</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setFilter('all');
                setSearchQuery('');
                setAdvancedFilters({});
              }}
              className="mt-4"
            >
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modale détails */}
      <DemandDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedDemand(null);
        }}
        demand={selectedDemand}
        onAction={handleAction}
        onRequestComplement={() => {
          setShowDetailsModal(false);
          setShowComplementModal(true);
        }}
      />

      {/* Modale complément */}
      <RequestComplementModal
        isOpen={showComplementModal}
        onClose={() => {
          setShowComplementModal(false);
          setSelectedDemand(null);
        }}
        demand={selectedDemand}
        onSend={(message, attachments) => {
          if (selectedDemand) {
            addActionLog({
              userId: 'USR-001',
              userName: 'A. DIALLO',
              userRole: 'Directeur Général',
              action: 'request_complement',
              module: 'demandes',
              targetId: selectedDemand.id,
              targetType: 'Demande',
              targetLabel: selectedDemand.subject,
              details: `Demande de complément envoyée: ${message.substring(0, 50)}...`,
              bureau: selectedDemand.bureau,
            });
            addToast(`Demande de complément envoyée pour ${selectedDemand.id}`, 'success');
          }
        }}
      />

      {/* Modale affectation */}
      <IntelligentAssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => {
          setShowAssignmentModal(false);
          setSelectedDemand(null);
        }}
        demand={selectedDemand}
        employees={employees}
        bureaux={bureaux}
        onAssign={(employeeId) => {
          if (selectedDemand) {
            handleAssign(selectedDemand, employeeId);
            // La modale se ferme automatiquement dans IntelligentAssignmentModal
          }
        }}
      />
    </div>
  );
}
