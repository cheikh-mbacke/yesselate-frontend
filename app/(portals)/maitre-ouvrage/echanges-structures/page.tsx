'use client';

import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { echangesStructures, coordinationStats } from '@/lib/data';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import { useAutoSyncCounts } from '@/hooks/useAutoSync';

type StatusFilter = 'all' | 'ouvert' | 'en_traitement' | 'escalade' | 'resolu';
type TypeFilter = 'all' | 'demande_info' | 'alerte_risque' | 'proposition_substitution' | 'demande_validation' | 'signalement_blocage' | 'coordination_urgente';

// WHY: Normalisation pour recherche multi-champs (aligné avec autres pages)
const normalize = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export default function EchangesStructuresPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();

  // État principal
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [selectedEchange, setSelectedEchange] = useState<string | null>(null);

  // Recherche (aligné avec autres pages)
  const [searchQuery, setSearchQuery] = useState('');

  // Persistance navigation
  const { updateFilters, getFilters } = usePageNavigation('echanges-structures');

  // Charger les filtres sauvegardés
  useEffect(() => {
    try {
      const saved = getFilters?.();
      if (!saved) return;
      if (saved.filter) setFilter(saved.filter);
      if (saved.typeFilter) setTypeFilter(saved.typeFilter);
      if (saved.selectedEchange) setSelectedEchange(saved.selectedEchange);
      if (typeof saved.searchQuery === 'string') setSearchQuery(saved.searchQuery);
    } catch {
      // silent
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sauvegarder les filtres
  useEffect(() => {
    try {
      updateFilters?.({
        filter,
        typeFilter,
        selectedEchange,
        searchQuery,
      });
    } catch {
      // silent
    }
  }, [filter, typeFilter, selectedEchange, searchQuery, updateFilters]);

  const stats = coordinationStats.echanges;

  // Auto-sync pour sidebar
  useAutoSyncCounts('echanges-structures', () => stats.ouverts, { interval: 30000, immediate: true });

  // Filtrage aligné avec pattern des autres pages
  const filteredEchanges = useMemo(() => {
    let result = [...echangesStructures];

    // Filtre par statut
    if (filter !== 'all') {
      result = result.filter(e => e.status === filter);
    }

    // Filtre par type
    if (typeFilter !== 'all') {
      result = result.filter(e => e.type === typeFilter);
    }

    // Recherche multi-champs
    if (searchQuery.trim()) {
      const q = normalize(searchQuery);
      result = result.filter(e =>
        normalize(e.id).includes(q) ||
        normalize(e.subject).includes(q) ||
        normalize(e.content).includes(q) ||
        normalize(e.from.bureau).includes(q) ||
        normalize(e.to.bureau).includes(q) ||
        normalize(e.linkedContext.label).includes(q)
      );
    }

    return result;
  }, [filter, typeFilter, searchQuery]);

  const selected = selectedEchange ? echangesStructures.find(e => e.id === selectedEchange) : null;

  const handleRespond = (echange: typeof selected) => {
    if (!echange) return;
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'echanges-structures',
      action: 'respond',
      targetId: echange.id,
      targetType: 'EchangeStructure',
      details: `Réponse à ${echange.subject}`,
    });
    addToast('Interface de réponse ouverte', 'info');
  };

  const handleEscalate = (echange: typeof selected) => {
    if (!echange) return;
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'echanges-structures',
      action: 'escalate',
      targetId: echange.id,
      targetType: 'EchangeStructure',
      details: `Escalade vers arbitrage: ${echange.subject}`,
    });
    addToast('Échange escaladé → Création arbitrage automatique', 'warning');
  };

  const handleClose = (echange: typeof selected, type: 'repondu' | 'sans_suite') => {
    if (!echange) return;
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'echanges-structures',
      action: 'close',
      targetId: echange.id,
      targetType: 'EchangeStructure',
      details: `Clôture ${type}: ${echange.subject}`,
    });
    addToast(`Échange clôturé (${type}) - Justification enregistrée`, 'success');
  };

  const handleCreateEchange = () => {
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'echanges-structures',
      action: 'create',
      targetId: 'NEW',
      targetType: 'EchangeStructure',
      details: 'Création nouvel échange structuré',
    });
    addToast('Sélectionnez le type d\'échange et le contexte lié', 'info');
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      demande_info: '❓',
      alerte_risque: '🚨',
      proposition_substitution: '🔄',
      demande_validation: '✅',
      signalement_blocage: '🚫',
      coordination_urgente: '⚡',
    };
    return icons[type] || '📨';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      demande_info: 'Demande info',
      alerte_risque: 'Alerte risque',
      proposition_substitution: 'Prop. substitution',
      demande_validation: 'Demande validation',
      signalement_blocage: 'Blocage',
      coordination_urgente: 'Urgent',
    };
    return labels[type] || type;
  };

  const getDeadlineStatus = (deadline: string, status: string) => {
    if (status === 'resolu' || status === 'cloture_sans_suite') return null;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const hoursRemaining = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursRemaining < 0) return { label: 'En retard', color: 'red', urgent: true };
    if (hoursRemaining < 24) return { label: `${Math.round(hoursRemaining)}h restantes`, color: 'amber', urgent: true };
    if (hoursRemaining < 48) return { label: `${Math.round(hoursRemaining)}h restantes`, color: 'amber', urgent: false };
    return { label: `${Math.round(hoursRemaining / 24)}j restants`, color: 'emerald', urgent: false };
  };

  return (
    <div className="space-y-4">
      {/* Header aligné avec autres pages */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            📨 Échanges Structurés
            <Badge variant="warning">{stats.ouverts} ouvert(s)</Badge>
            {stats.escalades > 0 && <Badge variant="urgent">{stats.escalades} escaladé(s)</Badge>}
          </h1>
          <p className="text-sm text-slate-400">Échanges inter-bureaux avec intention, délai et auto-escalade</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Input
            placeholder="Rechercher (ID, sujet, bureau...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64"
          />
          <Button onClick={handleCreateEchange}>+ Nouvel échange</Button>
        </div>
      </div>

      {/* Principe clé */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div className="flex-1">
              <h3 className="font-bold text-blue-400">Pas un chat - Chaque échange a une intention</h3>
              <p className="text-sm text-slate-400">Type obligatoire (demande info, alerte risque...). Délai de réponse 48h max. Auto-escalade si non traité.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alertes */}
      {(stats.enRetard > 0 || stats.escalades > 0) && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h3 className="font-bold text-red-400">Attention requise</h3>
                <p className="text-sm text-slate-400">
                  {stats.enRetard > 0 && `${stats.enRetard} échange(s) en retard • `}
                  {stats.escalades > 0 && `${stats.escalades} escalade(s) en cours`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
            <p className="text-[10px] text-slate-400">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.ouverts}</p>
            <p className="text-[10px] text-slate-400">Ouverts</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.escalades}</p>
            <p className="text-[10px] text-slate-400">Escaladés</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.resolus}</p>
            <p className="text-[10px] text-slate-400">Résolus</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">{stats.critiques}</p>
            <p className="text-[10px] text-slate-400">Critiques</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.enRetard}</p>
            <p className="text-[10px] text-slate-400">En retard</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-1 flex-wrap">
          {[
            { id: 'all', label: 'Tous' },
            { id: 'ouvert', label: '📥 Ouverts' },
            { id: 'en_traitement', label: '⏳ En traitement' },
            { id: 'escalade', label: '🚨 Escaladés' },
            { id: 'resolu', label: '✅ Résolus' },
          ].map((f) => (
            <Button key={f.id} size="sm" variant={filter === f.id ? 'default' : 'secondary'} onClick={() => setFilter(f.id as typeof filter)}>{f.label}</Button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          <span className="text-xs text-slate-400 self-center mr-1">Type:</span>
          {[
            { id: 'all', label: 'Tous' },
            { id: 'alerte_risque', label: '🚨' },
            { id: 'demande_info', label: '❓' },
            { id: 'demande_validation', label: '✅' },
            { id: 'signalement_blocage', label: '🚫' },
          ].map((f) => (
            <Button key={f.id} size="sm" variant={typeFilter === f.id ? 'default' : 'secondary'} onClick={() => setTypeFilter(f.id)}>{f.label}</Button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Liste échanges */}
        <div className="lg:col-span-2 space-y-3">
          {filteredEchanges.map((echange) => {
            const isSelected = selectedEchange === echange.id;
            const deadlineStatus = getDeadlineStatus(echange.deadline, echange.status);
            
            return (
              <Card
                key={echange.id}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected ? 'ring-2 ring-blue-500' : 'hover:border-blue-500/50',
                  echange.status === 'escalade' && 'border-l-4 border-l-red-500',
                  echange.autoEscalationWarning && 'border-l-4 border-l-amber-500',
                  echange.status === 'resolu' && 'border-l-4 border-l-emerald-500 opacity-70',
                )}
                onClick={() => setSelectedEchange(echange.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg">{getTypeIcon(echange.type)}</span>
                        <span className="font-mono text-xs text-blue-400">{echange.id}</span>
                        <Badge variant={echange.status === 'escalade' ? 'urgent' : echange.status === 'resolu' ? 'success' : echange.status === 'ouvert' ? 'warning' : 'info'}>{echange.status}</Badge>
                        <Badge variant={echange.priority === 'critique' ? 'urgent' : echange.priority === 'urgente' ? 'warning' : 'default'}>{echange.priority}</Badge>
                      </div>
                      <h3 className="font-bold mt-1">{echange.subject}</h3>
                    </div>
                    {deadlineStatus && (
                      <Badge variant={deadlineStatus.urgent ? 'urgent' : 'default'} pulse={deadlineStatus.urgent}>
                        ⏰ {deadlineStatus.label}
                      </Badge>
                    )}
                  </div>

                  {/* Flux */}
                  <div className="flex items-center gap-3 mb-3 p-2 rounded bg-slate-700/30">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400">De</p>
                      <BureauTag bureau={echange.from.bureau} />
                      <p className="text-xs">{echange.from.employeeName}</p>
                    </div>
                    <span className="text-xl">→</span>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400">À</p>
                      <BureauTag bureau={echange.to.bureau} />
                      {echange.to.employeeName && <p className="text-xs">{echange.to.employeeName}</p>}
                    </div>
                  </div>

                  {/* Contexte lié */}
                  <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30 mb-3">
                    <p className="text-xs text-blue-400">🔗 {echange.linkedContext.type}: {echange.linkedContext.id}</p>
                    <p className="text-sm">{echange.linkedContext.label}</p>
                  </div>

                  {/* Réponse attendue */}
                  <div className="p-2 rounded bg-purple-500/10 border border-purple-500/30 mb-3">
                    <p className="text-xs text-purple-400">📋 Réponse attendue</p>
                    <p className="text-sm">{echange.expectedResponse}</p>
                  </div>

                  {/* Réponses */}
                  {echange.responses.length > 0 && (
                    <div className="mb-3">
                      <Badge variant="info">{echange.responses.length} réponse(s)</Badge>
                      {echange.responses.some(r => r.isResolutive) && <Badge variant="success" className="ml-1">Résolutive</Badge>}
                    </div>
                  )}

                  {/* Alertes */}
                  {echange.autoEscalationWarning && echange.status !== 'resolu' && echange.status !== 'escalade' && (
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 mb-3">
                      <p className="text-xs text-amber-400">⚠️ Non traité depuis 48h+ - Escalade suggérée</p>
                    </div>
                  )}

                  {/* Actions */}
                  {echange.status !== 'resolu' && echange.status !== 'cloture_sans_suite' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                      <Button size="sm" variant="success" onClick={(e) => { e.stopPropagation(); handleRespond(echange); }}>💬 Répondre</Button>
                      {echange.status !== 'escalade' && (
                        <Button size="sm" variant="warning" onClick={(e) => { e.stopPropagation(); handleEscalate(echange); }}>⬆️ Escalader</Button>
                      )}
                      <Button size="sm" variant="default" onClick={(e) => { e.stopPropagation(); handleClose(echange, 'repondu'); }}>✓ Clôturer</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Panel détail */}
        <div className="lg:col-span-1">
          {selected ? (
            <Card className="sticky top-4">
              <CardContent className="p-4">
                <div className="mb-4 pb-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getTypeIcon(selected.type)}</span>
                    <Badge variant={selected.status === 'escalade' ? 'urgent' : selected.status === 'resolu' ? 'success' : 'warning'}>{selected.status}</Badge>
                  </div>
                  <span className="font-mono text-xs text-blue-400">{selected.id}</span>
                  <h3 className="font-bold">{selected.subject}</h3>
                  <Badge variant="default" className="mt-1">{getTypeLabel(selected.type)}</Badge>
                </div>

                <div className="space-y-3 text-sm">
                  {/* Contenu */}
                  <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                    <p className="text-xs text-slate-400 mb-1">Message</p>
                    <p>{selected.content}</p>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className={cn("p-2 rounded text-xs", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                      <p className="text-slate-400">Créé le</p>
                      <p>{new Date(selected.createdAt).toLocaleString('fr-FR')}</p>
                    </div>
                    <div className={cn("p-2 rounded text-xs", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                      <p className="text-slate-400">Deadline</p>
                      <p>{new Date(selected.deadline).toLocaleString('fr-FR')}</p>
                    </div>
                  </div>

                  {/* Réponses */}
                  {selected.responses.length > 0 && (
                    <div>
                      <p className="text-xs font-bold mb-2">💬 Réponses ({selected.responses.length})</p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selected.responses.map((resp) => (
                          <div key={resp.id} className={cn("p-2 rounded text-xs", darkMode ? "bg-slate-700/30" : "bg-gray-100", resp.isResolutive && "border border-emerald-500/50")}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{resp.responderName}</span>
                              {resp.isResolutive && <Badge variant="success">Résolutive</Badge>}
                            </div>
                            <p>{resp.content}</p>
                            <p className="text-slate-400 mt-1">{new Date(resp.timestamp).toLocaleString('fr-FR')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Résolution */}
                  {selected.resolution && (
                    <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30">
                      <p className="text-xs text-emerald-400 mb-1">✓ Clôturé ({selected.resolution.type})</p>
                      <p className="text-sm">{selected.resolution.justification}</p>
                      <p className="text-xs text-slate-400 mt-1">Par {selected.resolution.closedBy} le {new Date(selected.resolution.closedAt).toLocaleString('fr-FR')}</p>
                      {selected.resolution.decisionId && <Badge variant="info" className="mt-1">→ {selected.resolution.decisionId}</Badge>}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {selected.status !== 'resolu' && selected.status !== 'cloture_sans_suite' && (
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-700/50">
                    <Button size="sm" variant="success" onClick={() => handleRespond(selected)}>💬 Répondre</Button>
                    {selected.status !== 'escalade' && (
                      <Button size="sm" variant="warning" onClick={() => handleEscalate(selected)}>⬆️ Escalader vers arbitrage</Button>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="default" onClick={() => handleClose(selected, 'repondu')}>✓ Clôturer</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleClose(selected, 'sans_suite')}>Sans suite</Button>
                    </div>
                  </div>
                )}

                {/* Hash */}
                <div className="mt-3 p-2 rounded bg-purple-500/10 border border-purple-500/30">
                  <p className="text-[10px] text-purple-400">🔐 Hash</p>
                  <p className="font-mono text-[10px] truncate">{selected.hash}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4"><CardContent className="p-8 text-center"><span className="text-4xl mb-4 block">📨</span><p className="text-slate-400">Sélectionnez un échange</p></CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
}
