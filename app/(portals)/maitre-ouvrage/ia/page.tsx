'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { aiModules, aiHistory } from '@/lib/data';

export default function IAPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [viewTab, setViewTab] = useState<'modules' | 'history'>('modules');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const stats = useMemo(() => {
    const active = aiModules.filter(m => m.status === 'active').length;
    const training = aiModules.filter(m => m.status === 'training').length;
    const avgAccuracy = Math.round(aiModules.filter(m => m.accuracy).reduce((acc, m) => acc + (m.accuracy || 0), 0) / aiModules.filter(m => m.accuracy).length);
    const analysesCompleted = aiHistory.filter(h => h.status === 'completed').length;
    return { total: aiModules.length, active, training, avgAccuracy, analysesCompleted };
  }, []);

  const selectedM = selectedModule ? aiModules.find(m => m.id === selectedModule) : null;

  const handleRunAnalysis = (module: typeof selectedM) => {
    if (!module) return;
    addActionLog({
      module: 'ia',
      action: 'run_analysis',
      targetId: module.id,
      targetType: 'AIModule',
      details: `Lancement analyse ${module.name}`,
      status: 'info',
    });
    addToast(`Analyse ${module.name} lancée`, 'info');
  };

  const handleRetrain = (module: typeof selectedM) => {
    if (!module) return;
    addActionLog({
      module: 'ia',
      action: 'retrain',
      targetId: module.id,
      targetType: 'AIModule',
      details: `Ré-entraînement ${module.name}`,
      status: 'warning',
    });
    addToast('Ré-entraînement programmé', 'warning');
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🤖 Intelligence IA
            <Badge variant="success">{stats.active} modules actifs</Badge>
          </h1>
          <p className="text-sm text-slate-400">Modules d'analyse, prédiction et recommandations avec traçabilité</p>
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

      {/* Onglets */}
      <div className="flex gap-2">
        <Button size="sm" variant={viewTab === 'modules' ? 'default' : 'secondary'} onClick={() => setViewTab('modules')}>🧠 Modules ({aiModules.length})</Button>
        <Button size="sm" variant={viewTab === 'history' ? 'default' : 'secondary'} onClick={() => setViewTab('history')}>📜 Historique ({aiHistory.length})</Button>
      </div>

      {viewTab === 'modules' ? (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            {aiModules.map((module) => {
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
          {aiHistory.map((analysis) => (
            <Card key={analysis.id} className={cn("border-l-4", analysis.status === 'completed' ? "border-l-emerald-500" : analysis.status === 'running' ? "border-l-blue-500" : "border-l-red-500")}>
              <CardContent className="p-4">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-purple-400">{analysis.id}</span>
                      <Badge variant={analysis.status === 'completed' ? 'success' : analysis.status === 'running' ? 'info' : 'urgent'}>{analysis.status}</Badge>
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
                          <Badge key={idx} variant="default">{f}</Badge>
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
                        <Badge key={idx} variant="default">{input.source}: {input.recordsCount}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.hash && (
                  <div className="p-2 rounded bg-slate-700/30">
                    <p className="text-[10px] text-slate-400">🔐 Hash résultat</p>
                    <p className="font-mono text-[10px] truncate">{analysis.hash}</p>
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
