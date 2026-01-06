'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { evaluations, employees } from '@/lib/data';
import type { EvaluationStatus } from '@/lib/types/bmo.types';

export default function EvaluationsPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [filter, setFilter] = useState<'all' | EvaluationStatus>('all');
  const [selectedEvaluation, setSelectedEvaluation] = useState<string | null>(null);

  // Filtrage
  const filteredEvaluations = evaluations.filter(e => filter === 'all' || e.status === filter);

  // Stats
  const stats = useMemo(() => {
    const completed = evaluations.filter(e => e.status === 'completed');
    const scheduled = evaluations.filter(e => e.status === 'scheduled');
    const avgScore = completed.length > 0 
      ? Math.round(completed.reduce((acc, e) => acc + e.scoreGlobal, 0) / completed.length)
      : 0;
    const excellent = completed.filter(e => e.scoreGlobal >= 90).length;
    const bon = completed.filter(e => e.scoreGlobal >= 75 && e.scoreGlobal < 90).length;
    const ameliorer = completed.filter(e => e.scoreGlobal < 75).length;
    
    // Prochaines évaluations
    const prochaines = scheduled.sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'));
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    }).slice(0, 3);

    return { 
      total: evaluations.length, 
      completed: completed.length, 
      scheduled: scheduled.length, 
      avgScore,
      excellent,
      bon,
      ameliorer,
      prochaines,
    };
  }, []);

  const selectedEval = selectedEvaluation ? evaluations.find(e => e.id === selectedEvaluation) : null;

  // Actions
  const handleValidateRecommendation = (evalId: string, recId: string) => {
    addActionLog({
      module: 'evaluations',
      action: 'validate_recommendation',
      targetId: evalId,
      targetType: 'Evaluation',
      details: `Recommandation ${recId} validée`,
      status: 'success',
    });
    addToast('Recommandation validée', 'success');
  };

  const handleProgrammerFormation = (evalId: string) => {
    addActionLog({
      module: 'evaluations',
      action: 'schedule_formation',
      targetId: evalId,
      targetType: 'Evaluation',
      details: 'Formation programmée',
      status: 'success',
    });
    addToast('Formation programmée', 'success');
  };

  const statusConfig: Record<EvaluationStatus, { label: string; variant: 'success' | 'warning' | 'info' | 'default' }> = {
    completed: { label: 'Complétée', variant: 'success' },
    in_progress: { label: 'En cours', variant: 'warning' },
    scheduled: { label: 'Planifiée', variant: 'info' },
    cancelled: { label: 'Annulée', variant: 'default' },
  };

  const recommendationTypes: Record<string, { icon: string; color: string }> = {
    formation: { icon: '🎓', color: 'text-blue-400' },
    promotion: { icon: '📈', color: 'text-emerald-400' },
    augmentation: { icon: '💰', color: 'text-amber-400' },
    recadrage: { icon: '⚠️', color: 'text-red-400' },
    mutation: { icon: '🔄', color: 'text-purple-400' },
    autre: { icon: '📋', color: 'text-slate-400' },
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 75) return 'text-blue-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            📊 Évaluations
            <Badge variant="info">{stats.total}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Suivi des performances et recommandations RH
          </p>
        </div>
        <Button onClick={() => addToast('Nouvelle évaluation planifiée', 'success')}>
          + Planifier évaluation
        </Button>
      </div>

      {/* Résumé */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <p className={cn("text-3xl font-bold", getScoreColor(stats.avgScore))}>
              {stats.avgScore}
            </p>
            <p className="text-[10px] text-slate-400">Score moyen</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.excellent}</p>
            <p className="text-[10px] text-slate-400">Excellents (≥90)</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.bon}</p>
            <p className="text-[10px] text-slate-400">Bons (75-89)</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.ameliorer}</p>
            <p className="text-[10px] text-slate-400">À améliorer (&lt;75)</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.scheduled}</p>
            <p className="text-[10px] text-slate-400">À venir</p>
          </CardContent>
        </Card>
      </div>

      {/* Prochaines évaluations */}
      {stats.prochaines.length > 0 && (
        <Card className="border-purple-500/50 bg-purple-500/10">
          <CardContent className="p-4">
            <h3 className="font-bold text-sm mb-3 text-purple-400">📅 Prochaines évaluations</h3>
            <div className="grid sm:grid-cols-3 gap-2">
              {stats.prochaines.map(ev => (
                <div 
                  key={ev.id}
                  className={cn(
                    "p-2 rounded cursor-pointer hover:bg-purple-500/20 transition-colors",
                    darkMode ? "bg-slate-700/30" : "bg-white/50"
                  )}
                  onClick={() => setSelectedEvaluation(ev.id)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-purple-500/30 flex items-center justify-center text-xs font-bold">
                      {ev.employeeName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{ev.employeeName}</p>
                      <p className="text-xs text-slate-400">{ev.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'Toutes' },
          { id: 'completed', label: '✅ Complétées' },
          { id: 'scheduled', label: '📅 Planifiées' },
          { id: 'in_progress', label: '⏳ En cours' },
        ].map((f) => (
          <Button
            key={f.id}
            size="sm"
            variant={filter === f.id ? 'default' : 'secondary'}
            onClick={() => setFilter(f.id as 'all' | EvaluationStatus)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Liste des évaluations */}
        <div className="lg:col-span-2 space-y-3">
          {filteredEvaluations.map((evaluation) => {
            const isSelected = selectedEvaluation === evaluation.id;
            const pendingRecs = evaluation.recommendations.filter(r => r.status === 'pending').length;
            
            return (
              <Card
                key={evaluation.id}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected ? 'ring-2 ring-orange-500' : 'hover:border-orange-500/50',
                  evaluation.status === 'completed' && evaluation.scoreGlobal < 60 && 'border-l-4 border-l-red-500',
                )}
                onClick={() => setSelectedEvaluation(evaluation.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white">
                          {evaluation.employeeName.split(' ').map(n => n[0]).join('')}
                        </div>
                        {evaluation.status === 'completed' && (
                          <div className={cn(
                            "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                            getScoreBg(evaluation.scoreGlobal),
                            "text-white"
                          )}>
                            {evaluation.scoreGlobal}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono text-[10px] text-orange-400">{evaluation.id}</span>
                          <Badge variant={statusConfig[evaluation.status].variant}>
                            {statusConfig[evaluation.status].label}
                          </Badge>
                          <Badge variant="default">{evaluation.period}</Badge>
                        </div>
                        <h3 className="font-bold">{evaluation.employeeName}</h3>
                        <p className="text-xs text-slate-400">{evaluation.employeeRole}</p>
                        <BureauTag bureau={evaluation.bureau} />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">{evaluation.date}</p>
                      <p className="text-xs text-slate-500">Par {evaluation.evaluatorName}</p>
                    </div>
                  </div>

                  {/* Score et critères (si complétée) */}
                  {evaluation.status === 'completed' && (
                    <>
                      <div className="mb-3">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "text-3xl font-bold",
                            getScoreColor(evaluation.scoreGlobal)
                          )}>
                            {evaluation.scoreGlobal}/100
                          </div>
                          <div className="flex-1">
                            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className={cn("h-full transition-all", getScoreBg(evaluation.scoreGlobal))}
                                style={{ width: `${evaluation.scoreGlobal}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Points forts et améliorations */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className={cn(
                          "p-2 rounded text-xs",
                          darkMode ? "bg-emerald-500/10" : "bg-emerald-50"
                        )}>
                          <p className="text-emerald-400 font-medium mb-1">✅ Points forts</p>
                          <ul className="text-slate-400 space-y-0.5">
                            {evaluation.strengths.slice(0, 2).map((s, i) => (
                              <li key={i}>• {s}</li>
                            ))}
                          </ul>
                        </div>
                        <div className={cn(
                          "p-2 rounded text-xs",
                          darkMode ? "bg-amber-500/10" : "bg-amber-50"
                        )}>
                          <p className="text-amber-400 font-medium mb-1">📈 À améliorer</p>
                          <ul className="text-slate-400 space-y-0.5">
                            {evaluation.improvements.slice(0, 2).map((i, idx) => (
                              <li key={idx}>• {i}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Recommandations */}
                      {evaluation.recommendations.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {evaluation.recommendations.map(rec => (
                            <Badge 
                              key={rec.id}
                              variant={
                                rec.status === 'implemented' ? 'success' : 
                                rec.status === 'approved' ? 'info' : 
                                rec.status === 'rejected' ? 'default' : 'warning'
                              }
                            >
                              {recommendationTypes[rec.type]?.icon} {rec.type}
                              {rec.status === 'pending' && ' ⏳'}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                    {evaluation.status === 'completed' && pendingRecs > 0 && (
                      <Button size="sm" variant="success" onClick={(e) => { 
                        e.stopPropagation(); 
                        handleValidateRecommendation(evaluation.id, evaluation.recommendations[0]?.id || '');
                      }}>
                        ✅ Valider reco ({pendingRecs})
                      </Button>
                    )}
                    <Button size="sm" variant="info" onClick={(e) => { 
                      e.stopPropagation(); 
                      handleProgrammerFormation(evaluation.id);
                    }}>
                      🎓 Formation
                    </Button>
                    <Button size="sm" variant="secondary" onClick={(e) => e.stopPropagation()}>
                      📄 CR
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Panel détail évaluation */}
        <div className="lg:col-span-1">
          {selectedEval ? (
            <Card className="sticky top-4">
              <CardContent className="p-4">
                {/* Header */}
                <div className="mb-4 pb-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white">
                      {selectedEval.employeeName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold">{selectedEval.employeeName}</h3>
                      <p className="text-xs text-slate-400">{selectedEval.employeeRole}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={statusConfig[selectedEval.status].variant}>
                      {statusConfig[selectedEval.status].label}
                    </Badge>
                    <Badge variant="default">{selectedEval.period}</Badge>
                    <BureauTag bureau={selectedEval.bureau} />
                  </div>
                </div>

                {/* Score global */}
                {selectedEval.status === 'completed' && (
                  <div className="mb-4 p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-center">
                    <p className={cn("text-4xl font-bold", getScoreColor(selectedEval.scoreGlobal))}>
                      {selectedEval.scoreGlobal}/100
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Score global</p>
                  </div>
                )}

                {/* Critères détaillés */}
                {selectedEval.status === 'completed' && selectedEval.criteria.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-bold text-sm mb-2">📊 Critères</h4>
                    <div className="space-y-2">
                      {selectedEval.criteria.map(crit => (
                        <div key={crit.id} className={cn(
                          "p-2 rounded",
                          darkMode ? "bg-slate-700/30" : "bg-gray-100"
                        )}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">{crit.name}</span>
                            <span className="font-bold">{crit.score}/5</span>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(n => (
                              <div 
                                key={n}
                                className={cn(
                                  "h-1.5 flex-1 rounded",
                                  n <= crit.score ? getScoreBg(crit.score * 20) : "bg-slate-600"
                                )}
                              />
                            ))}
                          </div>
                          {crit.comment && (
                            <p className="text-[10px] text-slate-400 mt-1">{crit.comment}</p>
                          )}
                          <p className="text-[10px] text-slate-500">Poids: {crit.weight}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommandations détaillées */}
                {selectedEval.recommendations.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-bold text-sm mb-2">📋 Recommandations</h4>
                    <div className="space-y-2">
                      {selectedEval.recommendations.map(rec => (
                        <div key={rec.id} className={cn(
                          "p-2 rounded border",
                          rec.status === 'pending' ? "border-amber-500/50 bg-amber-500/10" :
                          rec.status === 'approved' ? "border-blue-500/50 bg-blue-500/10" :
                          rec.status === 'implemented' ? "border-emerald-500/50 bg-emerald-500/10" :
                          "border-slate-500/50 bg-slate-500/10"
                        )}>
                          <div className="flex items-start gap-2">
                            <span className="text-lg">{recommendationTypes[rec.type]?.icon}</span>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{rec.title}</p>
                              <p className="text-xs text-slate-400">{rec.description}</p>
                              <Badge variant={
                                rec.status === 'implemented' ? 'success' : 
                                rec.status === 'approved' ? 'info' : 
                                rec.status === 'rejected' ? 'default' : 'warning'
                              } className="mt-1">
                                {rec.status}
                              </Badge>
                              {rec.implementedAt && (
                                <p className="text-[10px] text-slate-500 mt-1">
                                  Implémenté le {rec.implementedAt}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Commentaire employé */}
                {selectedEval.employeeComment && (
                  <div className="mb-4 p-3 rounded bg-blue-500/10 border border-blue-500/30">
                    <p className="text-xs text-blue-400 font-medium mb-1">💬 Commentaire employé</p>
                    <p className="text-sm italic">"{selectedEval.employeeComment}"</p>
                  </div>
                )}

                {/* Traçabilité */}
                {selectedEval.hash && (
                  <div className="mb-4 p-2 rounded bg-slate-700/30">
                    <p className="text-[10px] text-slate-400">🔐 Traçabilité</p>
                    <p className="font-mono text-[10px] text-slate-500 truncate">{selectedEval.hash}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                  <Button size="sm" variant="info" className="flex-1">
                    📄 Télécharger CR
                  </Button>
                  <Button size="sm" variant="secondary" className="flex-1">
                    ✏️ Modifier
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="p-8 text-center">
                <span className="text-4xl mb-4 block">📊</span>
                <p className="text-slate-400">
                  Sélectionnez une évaluation pour voir ses détails
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
