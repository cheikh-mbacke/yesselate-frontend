/**
 * IAModuleDetailModal - Modal Overlay pour Détails de Module IA
 * 
 * Pattern modal overlay moderne avec navigation prev/next, tabs, et actions contextuelles
 * Préserve le contexte (liste visible en arrière-plan)
 */

'use client';

import React, { useMemo } from 'react';
import { GenericDetailModal, type TabConfig, type ActionButton } from '@/components/ui/GenericDetailModal';
import {
  Brain,
  BarChart3,
  Settings,
  History,
  PlayCircle,
  RefreshCw,
  PowerOff,
  Power,
  Download,
  Edit,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  TrendingUp,
  FileText,
  Hash,
  Info,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AIModule } from '@/lib/types/bmo.types';
import { aiModules, aiHistory } from '@/lib/data';

interface IAModuleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: string | null;
  onRunAnalysis?: (module: AIModule) => void;
  onRetrain?: (module: AIModule) => void;
  onEdit?: (module: AIModule) => void;
  onToggleStatus?: (module: AIModule) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

// ================================
// Helpers
// ================================

const getTypeIcon = (type: string) => {
  const icons: Record<string, React.ReactNode> = {
    analysis: '📊',
    prediction: '🔮',
    anomaly: '🚨',
    report: '📝',
    recommendation: '💡',
  };
  return icons[type] || '🤖';
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'text-emerald-400',
    training: 'text-amber-400',
    disabled: 'text-slate-400',
    error: 'text-red-400',
  };
  return colors[status] || 'text-slate-400';
};

const getStatusBadgeVariant = (status: string): 'default' | 'warning' | 'critical' | 'success' => {
  if (status === 'active') return 'success';
  if (status === 'training') return 'warning';
  if (status === 'error') return 'critical';
  return 'default';
};

// ================================
// Component
// ================================

export function IAModuleDetailModal({
  isOpen,
  onClose,
  moduleId,
  onRunAnalysis,
  onRetrain,
  onEdit,
  onToggleStatus,
  onPrevious,
  onNext,
  hasNext = false,
  hasPrevious = false,
}: IAModuleDetailModalProps) {
  const module = useMemo(() => {
    if (!moduleId) return null;
    return aiModules.find(m => m.id === moduleId);
  }, [moduleId]);

  const moduleHistory = useMemo(() => {
    if (!module) return [];
    return aiHistory.filter(h => h.moduleId === module.id).slice(0, 10);
  }, [module]);

  if (!module) return null;

  // ================================
  // Actions
  // ================================

  const actions: ActionButton[] = useMemo(() => {
    const actionList: ActionButton[] = [];

    if (module.status === 'active' && onRunAnalysis) {
      actionList.push({
        id: 'run',
        label: 'Exécuter',
        icon: <PlayCircle className="h-4 w-4" />,
        variant: 'default',
        onClick: () => onRunAnalysis(module),
      });
    }

    if (onRetrain) {
      actionList.push({
        id: 'retrain',
        label: 'Ré-entraîner',
        icon: <RefreshCw className="h-4 w-4" />,
        variant: 'outline',
        onClick: () => onRetrain(module),
      });
    }

    if (onToggleStatus) {
      actionList.push({
        id: 'toggle',
        label: module.status === 'active' ? 'Désactiver' : 'Activer',
        icon: module.status === 'active' ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />,
        variant: 'outline',
        onClick: () => onToggleStatus(module),
      });
    }

    if (onEdit) {
      actionList.push({
        id: 'edit',
        label: 'Modifier',
        icon: <Edit className="h-4 w-4" />,
        variant: 'outline',
        onClick: () => onEdit(module),
      });
    }

    actionList.push({
      id: 'export',
      label: 'Exporter',
      icon: <Download className="h-4 w-4" />,
      variant: 'ghost',
      onClick: () => {
        // TODO: Implémenter export
        console.log('Export', module.id);
      },
    });

    return actionList;
  }, [module, onRunAnalysis, onRetrain, onEdit, onToggleStatus]);

  // ================================
  // Tabs Configuration
  // ================================

  const tabs: TabConfig[] = useMemo(() => [
    {
      id: 'overview',
      label: 'Vue d\'ensemble',
      icon: <Info className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          {/* Informations générales */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Informations générales</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">ID</label>
                <p className="text-sm text-slate-200 font-mono">{module.id}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Type</label>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getTypeIcon(module.type)}</span>
                  <Badge variant="default" className="capitalize">{module.type}</Badge>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Statut</label>
                <Badge variant={getStatusBadgeVariant(module.status)} className="capitalize">
                  {module.status}
                </Badge>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Version</label>
                <p className="text-sm text-slate-200">{module.version}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Description</label>
            <p className="text-sm text-slate-300">{module.description}</p>
          </div>

          {/* Dates */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Planification</h3>
            <div className="grid grid-cols-2 gap-4">
              {module.lastRun && (
                <div>
                  <label className="text-xs text-slate-500 mb-1 block flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Dernière exécution
                  </label>
                  <p className="text-sm text-slate-200">{module.lastRun}</p>
                </div>
              )}
              {module.nextScheduled && (
                <div>
                  <label className="text-xs text-slate-500 mb-1 block flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Prochaine planifiée
                  </label>
                  <p className="text-sm text-slate-200">{module.nextScheduled}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'metrics',
      label: 'Métriques',
      icon: <BarChart3 className="h-4 w-4" />,
      badge: module.accuracy ? `${module.accuracy}%` : undefined,
      content: (
        <div className="space-y-6">
          {/* Précision */}
          {module.accuracy !== undefined && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-300">Précision</h3>
                <span className={cn(
                  'text-2xl font-bold',
                  module.accuracy >= 90 ? 'text-emerald-400' : module.accuracy >= 75 ? 'text-amber-400' : 'text-red-400'
                )}>
                  {module.accuracy}%
                </span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all',
                    module.accuracy >= 90 ? 'bg-emerald-500' : module.accuracy >= 75 ? 'bg-amber-500' : 'bg-red-500'
                  )}
                  style={{ width: `${module.accuracy}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {module.accuracy >= 90
                  ? 'Excellente précision'
                  : module.accuracy >= 75
                  ? 'Bonne précision'
                  : 'Précision à améliorer'}
              </p>
            </div>
          )}

          {/* Statistiques */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Statistiques</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <label className="text-xs text-slate-500 mb-1 block">Sources de données</label>
                <p className="text-2xl font-bold text-slate-200">{module.dataSourcesCount}</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <label className="text-xs text-slate-500 mb-1 block">Exécutions (7j)</label>
                <p className="text-2xl font-bold text-slate-200">
                  {moduleHistory.filter(h => h.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'configuration',
      label: 'Configuration',
      icon: <Settings className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Paramètres du module</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <label className="text-xs text-slate-500 mb-1 block">Version</label>
                <p className="text-sm text-slate-200">{module.version}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <label className="text-xs text-slate-500 mb-1 block flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  Sources de données
                </label>
                <p className="text-sm text-slate-200">{module.dataSourcesCount} source(s) configurée(s)</p>
              </div>
            </div>
          </div>

          {/* Planification */}
          {module.nextScheduled && (
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Planification</h3>
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <label className="text-xs text-slate-500 mb-1 block">Prochaine exécution planifiée</label>
                <p className="text-sm text-slate-200">{module.nextScheduled}</p>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'history',
      label: 'Historique',
      icon: <History className="h-4 w-4" />,
      badge: moduleHistory.length > 0 ? moduleHistory.length : undefined,
      content: (
        <div className="space-y-3">
          {moduleHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune exécution récente</p>
            </div>
          ) : (
            moduleHistory.map((analysis) => (
              <div
                key={analysis.id}
                className={cn(
                  'p-4 rounded-lg border',
                  analysis.status === 'completed'
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : analysis.status === 'processing'
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-mono text-slate-400">{analysis.id}</p>
                    <Badge
                      variant={
                        analysis.status === 'completed'
                          ? 'success'
                          : analysis.status === 'processing'
                          ? 'info'
                          : 'urgent'
                      }
                      className="mt-1"
                    >
                      {analysis.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{analysis.requestedAt}</p>
                </div>
                {analysis.result && (
                  <p className="text-sm text-slate-300 mt-2 line-clamp-2">{analysis.result.summary}</p>
                )}
                {analysis.hash && (
                  <div className="mt-2 p-2 rounded bg-slate-800/50">
                    <p className="text-[10px] text-slate-500 mb-1">Hash</p>
                    <p className="font-mono text-xs text-slate-400 truncate">{analysis.hash}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ),
    },
    {
      id: 'traceability',
      label: 'Traçabilité',
      icon: <Hash className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Traçabilité IA</h3>
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <div className="flex items-start gap-3">
                <Hash className="h-5 w-5 text-purple-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-purple-400 mb-2">Chaque analyse conserve ses inputs comme preuve</p>
                  <p className="text-xs text-slate-400">
                    Les résultats incluent un hash SHA3-256 pour garantir l'intégrité des données.
                    Tous les inputs utilisés pour le calcul sont enregistrés pour traçabilité complète.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dernières analyses avec hash */}
          {moduleHistory.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Dernières analyses avec hash</h3>
              <div className="space-y-2">
                {moduleHistory
                  .filter(h => h.hash)
                  .slice(0, 5)
                  .map((analysis) => (
                    <div key={analysis.id} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-xs font-mono text-slate-400">{analysis.id}</p>
                        <p className="text-xs text-slate-500">{analysis.requestedAt}</p>
                      </div>
                      <p className="text-xs text-slate-500 mb-1">Hash SHA3-256</p>
                      <p className="font-mono text-xs text-slate-400 truncate">{analysis.hash}</p>
                      {analysis.inputs && analysis.inputs.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-slate-500 mb-1">Inputs ({analysis.inputs.length})</p>
                          <div className="flex flex-wrap gap-1">
                            {analysis.inputs.slice(0, 3).map((input, idx) => (
                              <Badge key={idx} variant="default" className="text-xs">
                                {input}
                              </Badge>
                            ))}
                            {analysis.inputs.length > 3 && (
                              <Badge variant="info" className="text-xs">
                                +{analysis.inputs.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
  ], [module, moduleHistory]);

  // ================================
  // Render
  // ================================

  return (
    <GenericDetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={module.name}
      subtitle={module.id}
      statusBadge={{
        label: module.status,
        variant: getStatusBadgeVariant(module.status),
      }}
      tabs={tabs}
      defaultActiveTab="overview"
      actions={actions}
      onPrevious={onPrevious}
      onNext={onNext}
      hasNext={hasNext}
      hasPrevious={hasPrevious}
      size="lg"
    />
  );
}

