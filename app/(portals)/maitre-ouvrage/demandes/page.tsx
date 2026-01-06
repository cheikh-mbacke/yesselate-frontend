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
  demands,
  bureaux,
  decisions,
  echangesBureaux,
  employees,
} from '@/lib/data';
import type { Priority, Demand } from '@/lib/types/bmo.types';

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

type ViewMode = 'list' | 'bureau';

export default function DemandesPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [filter, setFilter] = useState<'all' | Priority>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);
  const [showProofPanel, setShowProofPanel] = useState(false);

  // Enrichir les demandes avec le délai calculé
  const enrichedDemands = useMemo(() => {
    return demands.map((d) => ({
      ...d,
      delayDays: calculateDelay(d.date),
    }));
  }, []);

  // Filtrer les demandes
  const filteredDemands = useMemo(() => {
    return enrichedDemands.filter((d) => {
      const matchesFilter = filter === 'all' || d.priority === filter;
      const matchesSearch =
        searchQuery === '' ||
        d.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [enrichedDemands, filter, searchQuery]);

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

  // Stats globales
  const globalStats = useMemo(() => ({
    total: demands.length,
    urgent: demands.filter((d) => d.priority === 'urgent').length,
    high: demands.filter((d) => d.priority === 'high').length,
    normal: demands.filter((d) => d.priority === 'normal').length,
    avgDelay: Math.round(enrichedDemands.reduce((a, d) => a + d.delayDays, 0) / enrichedDemands.length),
  }), [enrichedDemands]);

  // Preuves liées à une demande (décisions + échanges)
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
      action: 'rejet',
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
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      action: 'complement',
      module: 'demandes',
      targetId: demand.id,
      targetType: 'Demande',
      targetLabel: demand.subject,
      details: 'Demande de complément envoyée',
      bureau: demand.bureau,
    });
    addToast(`Complément demandé pour ${demand.id}`, 'info');
  };

  const handleAssign = (demand: Demand, employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    if (employee) {
      addActionLog({
        userId: 'USR-001',
        userName: 'A. DIALLO',
        userRole: 'Directeur Général',
        action: 'assignation',
        module: 'demandes',
        targetId: demand.id,
        targetType: 'Demande',
        targetLabel: demand.subject,
        details: `Assignée à ${employee.name}`,
        bureau: demand.bureau,
      });
      addToast(`${demand.id} assignée à ${employee.name}`, 'success');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            📋 Demandes à traiter
            <Badge variant="warning">{globalStats.total}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Volume par bureau, délai moyen: <span className="text-amber-400 font-bold">{globalStats.avgDelay}j</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'default' : 'secondary'}
            onClick={() => setViewMode('list')}
          >
            📋 Liste
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'bureau' ? 'default' : 'secondary'}
            onClick={() => setViewMode('bureau')}
          >
            🏢 Par bureau
          </Button>
        </div>
      </div>

      {/* Stats par priorité */}
      <div className="grid grid-cols-5 gap-3">
        <Card
          className={cn('cursor-pointer transition-all', filter === 'all' && 'ring-2 ring-orange-500')}
          onClick={() => setFilter('all')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{globalStats.total}</p>
            <p className="text-[10px] text-slate-400">Total</p>
          </CardContent>
        </Card>
        <Card
          className={cn('cursor-pointer transition-all border-red-500/30', filter === 'urgent' && 'ring-2 ring-red-500')}
          onClick={() => setFilter('urgent')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{globalStats.urgent}</p>
            <p className="text-[10px] text-slate-400">Urgentes</p>
          </CardContent>
        </Card>
        <Card
          className={cn('cursor-pointer transition-all border-amber-500/30', filter === 'high' && 'ring-2 ring-amber-500')}
          onClick={() => setFilter('high')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{globalStats.high}</p>
            <p className="text-[10px] text-slate-400">Prioritaires</p>
          </CardContent>
        </Card>
        <Card
          className={cn('cursor-pointer transition-all border-blue-500/30', filter === 'normal' && 'ring-2 ring-blue-500')}
          onClick={() => setFilter('normal')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{globalStats.normal}</p>
            <p className="text-[10px] text-slate-400">Normales</p>
          </CardContent>
        </Card>
        <Card className="border-orange-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">{globalStats.avgDelay}j</p>
            <p className="text-[10px] text-slate-400">Délai moyen</p>
          </CardContent>
        </Card>
      </div>

      {/* Recherche */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="🔍 Rechercher (ID, sujet)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            'flex-1 px-4 py-2 rounded-lg text-sm',
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
          )}
        />
        <Button variant="secondary" onClick={() => { setFilter('all'); setSearchQuery(''); }}>
          Réinitialiser
        </Button>
      </div>

      {/* Vue par bureau */}
      {viewMode === 'bureau' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {bureaux.filter((b) => statsByBureau[b.code]?.total > 0).map((bureau) => (
            <Card key={bureau.code} className="hover:border-orange-500/50 transition-all">
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

      {/* Liste des demandes */}
      <div className="space-y-3">
        {filteredDemands.map((demand, i) => {
          const proofs = getProofsForDemand(demand.id);
          const hasProofs = proofs.decisions.length > 0 || proofs.exchanges.length > 0;

          return (
            <Card
              key={i}
              className={cn(
                'hover:border-orange-500/50 transition-all',
                demand.priority === 'urgent' && 'border-l-4 border-l-red-500',
                demand.priority === 'high' && 'border-l-4 border-l-amber-500'
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center text-xl',
                        darkMode ? 'bg-slate-700' : 'bg-gray-100'
                      )}
                    >
                      {demand.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-[10px] text-orange-400">{demand.id}</span>
                        <BureauTag bureau={demand.bureau} />
                        <Badge
                          variant={
                            demand.priority === 'urgent' ? 'urgent' :
                            demand.priority === 'high' ? 'warning' : 'default'
                          }
                          pulse={demand.priority === 'urgent'}
                        >
                          {demand.priority}
                        </Badge>
                        <Badge variant="info">J+{demand.delayDays}</Badge>
                        {hasProofs && (
                          <Badge
                            variant="gold"
                            className="cursor-pointer"
                            onClick={() => {
                              setSelectedDemand(demand);
                              setShowProofPanel(true);
                            }}
                          >
                            🔗 {proofs.decisions.length + proofs.exchanges.length} preuves
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm">{demand.subject}</h3>
                      <p className="text-xs text-slate-400">Type: {demand.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-amber-400">{demand.amount}</p>
                    <p className="text-[10px] text-slate-500">{demand.date}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-700/50">
                  <Button size="xs" variant="success" onClick={() => handleValidate(demand)}>
                    ✓ Valider
                  </Button>
                  <Button size="xs" variant="info" onClick={() => {
                    setSelectedDemand(demand);
                    setShowProofPanel(true);
                  }}>
                    👁 Ouvrir
                  </Button>
                  <Button size="xs" variant="warning" onClick={() => handleRequestComplement(demand)}>
                    📎 Demander complément
                  </Button>
                  <div className="relative group">
                    <Button size="xs" variant="secondary">
                      👤 Assigner ▾
                    </Button>
                    <div className={cn(
                      'absolute top-full left-0 mt-1 w-48 rounded-lg shadow-lg z-50 hidden group-hover:block',
                      darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
                    )}>
                      {employees.filter((e) => e.bureau === demand.bureau || e.bureau === 'BMO').slice(0, 5).map((emp) => (
                        <button
                          key={emp.id}
                          className={cn(
                            'w-full px-3 py-2 text-left text-xs hover:bg-orange-500/10 flex items-center gap-2',
                            darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-50'
                          )}
                          onClick={() => handleAssign(demand, emp.id)}
                        >
                          <span className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-[10px] font-bold">
                            {emp.initials}
                          </span>
                          {emp.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button size="xs" variant="destructive" onClick={() => handleReject(demand)}>
                    ✕ Rejeter
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDemands.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-400">Aucune demande trouvée</p>
          </CardContent>
        </Card>
      )}

      {/* Panel Fil de preuves (traçabilité) */}
      {showProofPanel && selectedDemand && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                🔗 Fil de preuves - {selectedDemand.id}
              </CardTitle>
              <Button size="xs" variant="ghost" onClick={() => setShowProofPanel(false)}>
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Détails demande */}
              <div className={cn('p-3 rounded-lg', darkMode ? 'bg-slate-700/50' : 'bg-gray-50')}>
                <h4 className="font-bold text-sm mb-2">{selectedDemand.subject}</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-slate-400">Bureau:</span> <BureauTag bureau={selectedDemand.bureau} /></div>
                  <div><span className="text-slate-400">Type:</span> {selectedDemand.type}</div>
                  <div><span className="text-slate-400">Montant:</span> <span className="text-amber-400">{selectedDemand.amount}</span></div>
                  <div><span className="text-slate-400">Date:</span> {selectedDemand.date}</div>
                </div>
              </div>

              {/* Décisions liées */}
              <div>
                <h4 className="font-bold text-xs mb-2 flex items-center gap-2">
                  ⚖️ Décisions liées
                  <Badge variant="info">{getProofsForDemand(selectedDemand.id).decisions.length}</Badge>
                </h4>
                {getProofsForDemand(selectedDemand.id).decisions.length === 0 ? (
                  <p className="text-xs text-slate-400">Aucune décision liée</p>
                ) : (
                  <div className="space-y-2">
                    {getProofsForDemand(selectedDemand.id).decisions.map((dec) => (
                      <div key={dec.id} className={cn('p-2 rounded border-l-2 border-l-emerald-500', darkMode ? 'bg-slate-700/30' : 'bg-gray-50')}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] text-emerald-400">{dec.id}</span>
                          <Badge variant="success">{dec.status}</Badge>
                        </div>
                        <p className="text-xs">{dec.type}: {dec.subject}</p>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                          <span>Par: {dec.author}</span>
                          <span>{dec.date}</span>
                        </div>
                        <div className={cn('mt-1 px-2 py-1 rounded text-[9px] font-mono', darkMode ? 'bg-slate-600' : 'bg-gray-200')}>
                          🔒 {dec.hash}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Échanges liés */}
              <div>
                <h4 className="font-bold text-xs mb-2 flex items-center gap-2">
                  💬 Échanges inter-bureaux
                  <Badge variant="info">{getProofsForDemand(selectedDemand.id).exchanges.length}</Badge>
                </h4>
                {getProofsForDemand(selectedDemand.id).exchanges.length === 0 ? (
                  <p className="text-xs text-slate-400">Aucun échange lié</p>
                ) : (
                  <div className="space-y-2">
                    {getProofsForDemand(selectedDemand.id).exchanges.map((exch) => (
                      <div key={exch.id} className={cn('p-2 rounded border-l-2 border-l-blue-500', darkMode ? 'bg-slate-700/30' : 'bg-gray-50')}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] text-blue-400">{exch.id}</span>
                          <BureauTag bureau={exch.from} />
                          <span>→</span>
                          <BureauTag bureau={exch.to} />
                        </div>
                        <p className="text-xs font-semibold">{exch.subject}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{exch.message.slice(0, 100)}...</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                <Button className="flex-1" variant="success" onClick={() => {
                  handleValidate(selectedDemand);
                  setShowProofPanel(false);
                }}>
                  ✓ Valider cette demande
                </Button>
                <Button variant="destructive" onClick={() => {
                  handleReject(selectedDemand);
                  setShowProofPanel(false);
                }}>
                  ✕ Rejeter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
