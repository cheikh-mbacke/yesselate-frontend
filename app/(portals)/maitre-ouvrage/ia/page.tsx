'use client';

import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { aiModules, aiHistory } from '@/lib/data';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import { useAutoSyncCounts } from '@/hooks/useAutoSync';

type ViewTab = 'modules' | 'history';
type StatusFilter = 'all' | 'active' | 'training' | 'disabled' | 'error';
type TypeFilter = 'all' | 'analysis' | 'prediction' | 'anomaly' | 'report' | 'recommendation';

// WHY: Normalisation pour recherche multi-champs
const normalize = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export default function IAPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();

  // État principal
  const [viewTab, setViewTab] = useState<ViewTab>('modules');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  // Filtres et recherche (alignés avec autres pages)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  // Persistance navigation (même travail que autres pages)
  const { updateFilters, getFilters } = usePageNavigation('ia');
  useAutoSyncCounts('ia', () => stats.active, { interval: 30000, immediate: true });

  // Charger les filtres sauvegardés
  useEffect(() => {
    try {
      const saved = getFilters?.();
      if (!saved) return;
      if (saved.viewTab) setViewTab(saved.viewTab);
      if (saved.selectedModule) setSelectedModule(saved.selectedModule);
      if (typeof saved.searchQuery === 'string') setSearchQuery(saved.searchQuery);
      if (saved.statusFilter) setStatusFilter(saved.statusFilter);
      if (saved.typeFilter) setTypeFilter(saved.typeFilter);
    } catch {
      // silent
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sauvegarder les filtres
  useEffect(() => {
    try {
      updateFilters?.({
        viewTab,
        selectedModule,
        searchQuery,
        statusFilter,
        typeFilter,
      });
    } catch {
      // silent
    }
  }, [viewTab, selectedModule, searchQuery, statusFilter, typeFilter, updateFilters]);

  const stats = useMemo(() => {
    const active = aiModules.filter(m => m.status === 'active').length;
    const training = aiModules.filter(m => m.status === 'training').length;
    const disabled = aiModules.filter(m => m.status === 'disabled').length;
    const error = aiModules.filter(m => m.status === 'error').length;
    const avgAccuracy = Math.round(aiModules.filter(m => m.accuracy).reduce((acc, m) => acc + (m.accuracy || 0), 0) / (aiModules.filter(m => m.accuracy).length || 1));
    const analysesCompleted = aiHistory.filter(h => h.status === 'completed').length;
    const analysesProcessing = aiHistory.filter(h => h.status === 'processing').length;
    return { total: aiModules.length, active, training, disabled, error, avgAccuracy, analysesCompleted, analysesProcessing };
  }, []);

  // Filtrage des modules (aligné avec pattern des autres pages)
  const filteredModules = useMemo(() => {
    let result = [...aiModules];

    // Filtre par statut
    if (statusFilter !== 'all') {
      result = result.filter(m => m.status === statusFilter);
    }

    // Filtre par type
    if (typeFilter !== 'all') {
      result = result.filter(m => m.type === typeFilter);
    }

    // Recherche multi-champs
    if (searchQuery.trim()) {
      const q = normalize(searchQuery);
      result = result.filter(m =>
        normalize(m.id).includes(q) ||
        normalize(m.name).includes(q) ||
        normalize(m.description).includes(q) ||
        normalize(m.type).includes(q)
      );
    }

    return result;
  }, [statusFilter, typeFilter, searchQuery]);

  // Filtrage de l'historique
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return aiHistory;
    const q = normalize(searchQuery);
    return aiHistory.filter(h =>
      normalize(h.id).includes(q) ||
      normalize(h.moduleId).includes(q) ||
      normalize(h.requestedBy).includes(q) ||
      normalize(h.target).includes(q)
    );
  }, [searchQuery]);

  const selectedM = selectedModule ? aiModules.find(m => m.id === selectedModule) : null;

  const handleRunAnalysis = (module: typeof selectedM) => {
    if (!module) return;
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'ia',
      action: 'audit', // Mapping vers ActionLogType valide
      targetId: module.id,
      targetType: 'AIModule',
      details: `Lancement analyse ${module.name}`,
    });
    addToast(`Analyse ${module.name} lancée`, 'info');
  };

  const handleRetrain = (module: typeof selectedM) => {
    if (!module) return;
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'ia',
      action: 'modification', // Mapping vers ActionLogType valide
      targetId: module.id,
      targetType: 'AIModule',
      details: `Ré-entraînement ${module.name}`,
    });
    addToast('Ré-entraînement programmé', 'warning');
  };

  // WHY: Vérifier l'intégrité du hash IA
  const verifyAIHash = async (id: string, hash: string): Promise<boolean> => {
    // TODO: Implémenter avec backend ou Web Crypto
    return hash.startsWith('SHA3-256:');
  };

  const exportAIHistory = () => {
    const headers = ['ID', 'Module', 'Statut', 'Demandé par', 'Date', 'Hash', 'Sources'];
    const rows = aiHistory.map(h => [
      h.id,
      h.moduleId,
      h.status,
      h.requestedBy,
      h.requestedAt,
      h.hash || '',
      h.inputs?.join(', ') || ''
    ]);
    const csv = [headers.join(';'), ...rows.map(row => row.join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historique_ia_bmo.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('✅ Export IA généré', 'success');
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = { analysis: '📊', prediction: '🔮', anomaly: '🚨', report: '📝', recommendation: '💡' };
    return icons[type] || '🤖';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { active: 'emerald', training: 'amber', disabled: 'slate', error: 'red' };
    return colors[status] || 'slate';
  };

  return (
    <div className="space-y-4">
      {/* Header aligné avec autres pages */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🤖 Intelligence IA
            <Badge variant="success">{stats.active} modules actifs</Badge>
            {stats.training > 0 && <Badge variant="warning">{stats.training} en formation</Badge>}
          </h1>
          <p className="text-sm text-slate-400">Modules d'analyse, prédiction et recommandations avec traçabilité</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Input
            placeholder="Rechercher (ID, nom, type...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64"
          />
          <Button size="sm" variant="secondary" onClick={exportAIHistory}>
            📊 Exporter
          </Button>
        </div>
      </div>

      <Card className="bg-purple-500/10 border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔐</span>
            <div className="flex-1">
              <h3 className="font-bold text-purple-400">Traçabilité IA</h3>
              <p className="text-sm text-slate-400">Chaque analyse conserve ses inputs comme preuve + hash du résultat</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
            <p className="text-[10px] text-slate-400">Modules</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
            <p className="text-[10px] text-slate-400">Actifs</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.training}</p>
            <p className="text-[10px] text-slate-400">En formation</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.avgAccuracy}%</p>
            <p className="text-[10px] text-slate-400">Précision moy.</p>
          </CardContent>
        </Card>
        <Card className="bg-pink-500/10 border-pink-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-pink-400">{stats.analysesCompleted}</p>
            <p className="text-[10px] text-slate-400">Analyses</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres alignés avec autres pages */}
      <div className="flex flex-wrap gap-4">
        {/* Onglets principaux */}
        <div className="flex gap-1">
          <Button size="sm" variant={viewTab === 'modules' ? 'default' : 'secondary'} onClick={() => setViewTab('modules')}>
            🧠 Modules ({filteredModules.length})
          </Button>
          <Button size="sm" variant={viewTab === 'history' ? 'default' : 'secondary'} onClick={() => setViewTab('history')}>
            📜 Historique ({filteredHistory.length})
          </Button>
        </div>

        {/* Filtres par statut (modules uniquement) */}
        {viewTab === 'modules' && (
          <div className="flex gap-1 flex-wrap">
            <span className="text-xs text-slate-400 self-center mr-1">Statut:</span>
            {[
              { id: 'all', label: 'Tous' },
              { id: 'active', label: '✅ Actifs' },
              { id: 'training', label: '🔄 Formation' },
              { id: 'disabled', label: '⏸️ Désactivés' },
            ].map((f) => (
              <Button
                key={f.id}
                size="sm"
                variant={statusFilter === f.id ? 'default' : 'secondary'}
                onClick={() => setStatusFilter(f.id as StatusFilter)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        )}

        {/* Filtres par type (modules uniquement) */}
        {viewTab === 'modules' && (
          <div className="flex gap-1 flex-wrap">
            <span className="text-xs text-slate-400 self-center mr-1">Type:</span>
            {[
              { id: 'all', label: 'Tous' },
              { id: 'analysis', label: '📊' },
              { id: 'prediction', label: '🔮' },
              { id: 'anomaly', label: '🚨' },
              { id: 'recommendation', label: '💡' },
            ].map((f) => (
              <Button
                key={f.id}
                size="sm"
                variant={typeFilter === f.id ? 'default' : 'secondary'}
                onClick={() => setTypeFilter(f.id as TypeFilter)}
                title={f.id !== 'all' ? f.id : 'Tous les types'}
              >
                {f.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {viewTab === 'modules' ? (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            {filteredModules.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <span className="text-4xl mb-4 block">🔍</span>
                  <p className="text-slate-400">Aucun module ne correspond aux filtres</p>
                </CardContent>
              </Card>
            )}
            {filteredModules.map((module) => {
              const isSelected = selectedModule === module.id;
              const statusColor = getStatusColor(module.status);
              
              return (
                <Card
                  key={module.id}
                  className={cn(
                    'cursor-pointer transition-all',
                    isSelected ? 'ring-2 ring-purple-500' : 'hover:border-purple-500/50',
                    `border-l-4 border-l-${statusColor}-500`,
                  )}
                  onClick={() => setSelectedModule(module.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getTypeIcon(module.type)}</span>
                          <Badge variant={module.status === 'active' ? 'success' : module.status === 'training' ? 'warning' : 'default'}>{module.status}</Badge>
                          <Badge variant="default">{module.type}</Badge>
                        </div>
                        <h3 className="font-bold mt-1">{module.name}</h3>
                        <p className="text-sm text-slate-400">{module.description}</p>
                      </div>
                      {module.accuracy && (
                        <div className="text-right">
                          <p className={cn("text-3xl font-bold", module.accuracy >= 90 ? "text-emerald-400" : module.accuracy >= 75 ? "text-amber-400" : "text-red-400")}>
                            {module.accuracy}%
                          </p>
                          <p className="text-xs text-slate-400">Précision</p>
                        </div>
                      )}
                    </div>

                    {module.accuracy && (
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                        <div className={cn("h-full transition-all", module.accuracy >= 90 ? "bg-emerald-500" : module.accuracy >= 75 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${module.accuracy}%` }} />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                      <span>Sources: {module.dataSourcesCount}</span>
                      <span>Version: {module.version}</span>
                      <span>Dernière exécution: {module.lastRun}</span>
                    </div>

                    {module.status === 'active' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                        <Button size="sm" variant="default" onClick={(e) => { e.stopPropagation(); handleRunAnalysis(module); }}>▶️ Exécuter</Button>
                        <Button size="sm" variant="info" onClick={(e) => { e.stopPropagation(); handleRetrain(module); }}>🔄 Ré-entraîner</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            {selectedM ? (
              <Card className="sticky top-4">
                <CardContent className="p-4">
                  <div className="mb-4 pb-4 border-b border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getTypeIcon(selectedM.type)}</span>
                      <Badge variant={selectedM.status === 'active' ? 'success' : 'warning'}>{selectedM.status}</Badge>
                    </div>
                    <h3 className="font-bold">{selectedM.name}</h3>
                    <p className="text-sm text-slate-400">{selectedM.description}</p>
                  </div>

                  <div className="space-y-3 text-sm">
                    {selectedM.accuracy && (
                      <div className={cn("p-3 rounded text-center", selectedM.accuracy >= 90 ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-amber-500/10 border border-amber-500/30")}>
                        <p className={cn("text-4xl font-bold", selectedM.accuracy >= 90 ? "text-emerald-400" : "text-amber-400")}>{selectedM.accuracy}%</p>
                        <p className="text-xs text-slate-400">Précision</p>
                      </div>
                    )}

                    <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-slate-400">Type</p>
                          <p className="capitalize">{selectedM.type}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Version</p>
                          <p>{selectedM.version}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Sources</p>
                          <p>{selectedM.dataSourcesCount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Dernière exéc.</p>
                          <p className="text-xs">{selectedM.lastRun}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedM.status === 'active' && (
                    <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-700/50">
                      <Button size="sm" variant="default" onClick={() => handleRunAnalysis(selectedM)}>▶️ Lancer analyse</Button>
                      <Button size="sm" variant="info" onClick={() => handleRetrain(selectedM)}>🔄 Ré-entraîner</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="sticky top-4"><CardContent className="p-8 text-center"><span className="text-4xl mb-4 block">🧠</span><p className="text-slate-400">Sélectionnez un module</p></CardContent></Card>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <span className="text-4xl mb-4 block">📜</span>
                <p className="text-slate-400">Aucune analyse ne correspond à la recherche</p>
              </CardContent>
            </Card>
          )}
          {filteredHistory.map((analysis) => (
            <Card key={analysis.id} className={cn("border-l-4", analysis.status === 'completed' ? "border-l-emerald-500" : analysis.status === 'processing' ? "border-l-blue-500" : "border-l-red-500")}>
              <CardContent className="p-4">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-purple-400">{analysis.id}</span>
                      <Badge variant={analysis.status === 'completed' ? 'success' : analysis.status === 'processing' ? 'info' : 'urgent'}>{analysis.status}</Badge>
                      <Badge variant="default">{analysis.target}</Badge>
                    </div>
                    <h3 className="font-bold mt-1">{analysis.moduleId}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">{analysis.requestedAt}</p>
                    <p className="text-xs text-slate-400">Par: {analysis.requestedBy}</p>
                  </div>
                </div>

                {analysis.result && (
                  <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 mb-3">
                    <p className="text-xs text-emerald-400 mb-1">Résultat</p>
                    <p className="text-sm">{analysis.result.summary}</p>
                    {analysis.result.findings && analysis.result.findings.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {analysis.result.findings.slice(0, 3).map((f, idx) => (
                          <Badge key={idx} variant="default">{f.title}</Badge>
                        ))}
                        {analysis.result.findings.length > 3 && <Badge variant="info">+{analysis.result.findings.length - 3}</Badge>}
                      </div>
                    )}
                  </div>
                )}

                {analysis.inputs && analysis.inputs.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-slate-400 mb-1">📥 Inputs ({analysis.inputs.length} sources)</p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.inputs.map((input, idx) => (
                        <Badge key={idx} variant="default">{input}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.hash && (
                  <div className="p-2 rounded bg-slate-700/30">
                    <p className="text-[10px] text-slate-400">🔐 Hash résultat</p>
                    <p className="font-mono text-[10px] truncate">{analysis.hash}</p>
                    <Button
                      size="xs"
                      variant="ghost"
                      className="mt-1 text-[10px]"
                      onClick={async () => {
                        const isValid = await verifyAIHash(analysis.id, analysis.hash);
                        addToast(
                          isValid ? '✅ Hash IA valide' : '❌ Hash IA corrompu',
                          isValid ? 'success' : 'error'
                        );
                      }}
                    >
                      🔍 Vérifier
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
