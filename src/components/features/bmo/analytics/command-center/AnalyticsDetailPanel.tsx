/**
 * Panel de détail latéral pour Analytics
 * Affiche les détails d'un KPI, Alerte ou Rapport sans quitter la vue principale
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
  FileText,
  Clock,
  Target,
  Activity,
  ChevronRight,
  Bell,
  Download,
  Share2,
  CheckCircle2,
  XCircle,
  Minus,
  Info,
  Users,
  Zap,
  Link2,
} from 'lucide-react';
import { useAnalyticsCommandCenterStore } from '@/lib/stores/analyticsCommandCenterStore';

export function AnalyticsDetailPanel() {
  const { detailPanel, closeDetailPanel, openModal } = useAnalyticsCommandCenterStore();

  if (!detailPanel.isOpen) return null;

  const data = detailPanel.data || {};
  const type = detailPanel.type;

  const handleOpenFullModal = () => {
    if (type === 'kpi') {
      openModal('kpi-detail', { kpiId: detailPanel.entityId });
    } else if (type === 'alert') {
      openModal('alert-detail', { alertId: detailPanel.entityId });
    } else if (type === 'report') {
      openModal('report', { reportId: detailPanel.entityId });
    }
    closeDetailPanel();
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        onClick={closeDetailPanel}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            {type === 'kpi' && <Target className="h-4 w-4 text-blue-400" />}
            {type === 'alert' && <AlertTriangle className="h-4 w-4 text-amber-400" />}
            {type === 'report' && <FileText className="h-4 w-4 text-purple-400" />}
            <h3 className="text-sm font-medium text-slate-200">
              {type === 'kpi' && 'Détail KPI'}
              {type === 'alert' && 'Détail Alerte'}
              {type === 'report' && 'Détail Rapport'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenFullModal}
              className="h-7 px-2 text-xs text-slate-400 hover:text-slate-200"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Voir plus
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeDetailPanel}
              className="h-7 w-7 p-0 text-slate-500 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {type === 'kpi' && <KPIDetailContent data={data} />}
          {type === 'alert' && <AlertDetailContent data={data} />}
          {type === 'report' && <ReportDetailContent data={data} />}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800/50 p-4 space-y-2">
          <Button
            onClick={handleOpenFullModal}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ouvrir en modal complète
          </Button>
          <Button
            variant="outline"
            onClick={closeDetailPanel}
            className="w-full border-slate-700 text-slate-400 hover:text-slate-200"
            size="sm"
          >
            Fermer
          </Button>
        </div>
      </div>
    </>
  );
}

// ================================
// KPI Detail Content
// ================================
function KPIDetailContent({ data }: { data: Record<string, unknown> }) {
  const statusIcon = {
    success: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-400" />,
    critical: <XCircle className="h-4 w-4 text-red-400" />,
    ok: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  }[data.status as string] || <Minus className="h-4 w-4 text-slate-400" />;

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h4 className="text-lg font-semibold text-slate-200 mb-1">{data.name as string}</h4>
        <p className="text-sm text-slate-500">{data.category as string}</p>
      </div>

      {/* Résumé - Valeur, Delta, Statut */}
      <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold text-slate-100">{data.value as string}</span>
          {data.unit && (
            <span className="text-sm text-slate-500">{data.unit as string}</span>
          )}
        </div>
        <div className="flex items-center gap-3 mb-3">
          {data.trend === 'up' ? (
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          ) : data.trend === 'down' ? (
            <TrendingDown className="h-4 w-4 text-red-400" />
          ) : null}
          {data.trendValue && (
            <span
              className={cn(
                'text-sm font-medium',
                data.trend === 'up'
                  ? 'text-emerald-400'
                  : data.trend === 'down'
                  ? 'text-red-400'
                  : 'text-slate-400'
              )}
            >
              {data.trendValue as string}
            </span>
          )}
          {data.status && (
            <div className="flex items-center gap-1.5 ml-auto">
              {statusIcon}
              <Badge
                variant={
                  data.status === 'success' || data.status === 'ok'
                    ? 'default'
                    : data.status === 'warning'
                    ? 'warning'
                    : 'destructive'
                }
                className="text-xs"
              >
                {data.status === 'success' || data.status === 'ok'
                  ? 'OK'
                  : data.status === 'warning'
                  ? 'Attention'
                  : 'Critique'}
              </Badge>
            </div>
          )}
        </div>
        {data.lastUpdate && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2 border-t border-slate-700/50">
            <Clock className="h-3 w-3" />
            <span>MàJ: {data.lastUpdate as string}</span>
          </div>
        )}
      </div>

      {/* Seuils / Règles */}
      {(data.thresholds || data.metadata?.threshold) && (
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-3.5 w-3.5 text-blue-400" />
            <h5 className="text-xs font-semibold text-slate-400 uppercase">Seuils</h5>
          </div>
          <div className="space-y-1.5 text-xs">
            {data.metadata?.threshold?.success && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Succès</span>
                <Badge variant="default" className="text-xs">
                  ≥ {data.metadata.threshold.success}%
                </Badge>
              </div>
            )}
            {data.metadata?.threshold?.warning && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Attention</span>
                <Badge variant="warning" className="text-xs">
                  ≥ {data.metadata.threshold.warning}%
                </Badge>
              </div>
            )}
            {data.metadata?.threshold?.critical && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Critique</span>
                <Badge variant="destructive" className="text-xs">
                  &lt; {data.metadata.threshold.critical}%
                </Badge>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contexte Métier */}
      {(data.metadata?.owner ||
        data.metadata?.dataSource ||
        data.metadata?.updateFrequency ||
        data.metadata?.formula) && (
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-3.5 w-3.5 text-blue-400" />
            <h5 className="text-xs font-semibold text-slate-400 uppercase">Contexte</h5>
          </div>
          <div className="space-y-1.5 text-xs">
            {data.metadata?.owner && (
              <div className="flex justify-between">
                <span className="text-slate-500">Propriétaire</span>
                <span className="text-slate-300 font-medium">{data.metadata.owner}</span>
              </div>
            )}
            {data.metadata?.dataSource && (
              <div className="flex justify-between">
                <span className="text-slate-500">Source</span>
                <span className="text-slate-300 font-medium">{data.metadata.dataSource}</span>
              </div>
            )}
            {data.metadata?.updateFrequency && (
              <div className="flex justify-between">
                <span className="text-slate-500">Fréquence</span>
                <span className="text-slate-300 font-medium">{data.metadata.updateFrequency}</span>
              </div>
            )}
            {data.metadata?.formula && (
              <div className="pt-1.5 border-t border-slate-700/50">
                <span className="text-slate-500 block mb-1">Formule</span>
                <code className="text-xs font-mono text-blue-400 bg-slate-900/50 px-2 py-1 rounded">
                  {data.metadata.formula}
                </code>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {data.description && (
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-3.5 w-3.5 text-blue-400" />
            <h5 className="text-xs font-semibold text-slate-400 uppercase">Description</h5>
          </div>
          <p className="text-sm text-slate-400">{data.description as string}</p>
        </div>
      )}

      {/* Historique Mini (placeholder) */}
      {data.hasHistory && (
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-blue-400" />
              <h5 className="text-xs font-semibold text-slate-400 uppercase">Historique 7j</h5>
            </div>
            <span className="text-xs text-slate-500">Voir plus →</span>
          </div>
          <div className="h-16 bg-slate-900/50 rounded flex items-center justify-center">
            <span className="text-xs text-slate-600">Sparkline graphique</span>
          </div>
        </div>
      )}

      {/* Liens - KPIs liés, Alertes liées */}
      {(data.relatedKpiIds || data.relatedAlertIds || data.relatedReportIds) && (
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="h-3.5 w-3.5 text-blue-400" />
            <h5 className="text-xs font-semibold text-slate-400 uppercase">Liens</h5>
          </div>
          <div className="space-y-1.5 text-xs">
            {data.relatedKpiIds && Array.isArray(data.relatedKpiIds) && data.relatedKpiIds.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">KPIs liés</span>
                <span className="text-slate-300 font-medium">{data.relatedKpiIds.length}</span>
              </div>
            )}
            {data.relatedAlertIds && Array.isArray(data.relatedAlertIds) && data.relatedAlertIds.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Alertes liées</span>
                <Badge variant="warning" className="text-xs">
                  {data.relatedAlertIds.length}
                </Badge>
              </div>
            )}
            {data.relatedReportIds && Array.isArray(data.relatedReportIds) && data.relatedReportIds.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Rapports liés</span>
                <span className="text-slate-300 font-medium">{data.relatedReportIds.length}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions Rapides */}
      <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-3.5 w-3.5 text-blue-400" />
          <h5 className="text-xs font-semibold text-slate-400 uppercase">Actions rapides</h5>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          >
            <Download className="h-3 w-3 mr-1" />
            Exporter
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          >
            <Bell className="h-3 w-3 mr-1" />
            Alerte
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          >
            <Share2 className="h-3 w-3 mr-1" />
            Partager
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          >
            <Users className="h-3 w-3 mr-1" />
            Assigner
          </Button>
        </div>
      </div>
    </div>
  );
}

// ================================
// Alert Detail Content
// ================================
function AlertDetailContent({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h4 className="text-lg font-semibold text-slate-200 mb-1">{data.title as string}</h4>
        <Badge
          variant={
            data.severity === 'critical'
              ? 'destructive'
              : data.severity === 'high'
              ? 'warning'
              : 'default'
          }
        >
          {data.severity as string}
        </Badge>
      </div>

      {/* Message */}
      {data.message && (
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <p className="text-sm text-slate-300">{data.message as string}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="space-y-2 text-sm">
        {data.category && (
          <div className="flex justify-between">
            <span className="text-slate-500">Catégorie</span>
            <span className="text-slate-300 font-medium">{data.category as string}</span>
          </div>
        )}
        {data.createdAt && (
          <div className="flex justify-between">
            <span className="text-slate-500">Créé le</span>
            <span className="text-slate-300">{data.createdAt as string}</span>
          </div>
        )}
        {data.status && (
          <div className="flex justify-between">
            <span className="text-slate-500">Statut</span>
            <Badge variant={data.status === 'active' ? 'destructive' : 'default'}>
              {data.status === 'active' ? 'Actif' : 'Résolu'}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}

// ================================
// Report Detail Content
// ================================
function ReportDetailContent({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h4 className="text-lg font-semibold text-slate-200 mb-1">{data.title as string}</h4>
        <p className="text-sm text-slate-500">{data.type as string}</p>
      </div>

      {/* Status */}
      {data.status && (
        <Badge
          variant={
            data.status === 'completed'
              ? 'default'
              : data.status === 'generating'
              ? 'warning'
              : 'secondary'
          }
        >
          {data.status as string}
        </Badge>
      )}

      {/* Metadata */}
      <div className="space-y-2 text-sm">
        {data.createdAt && (
          <div className="flex justify-between">
            <span className="text-slate-500">Créé le</span>
            <span className="text-slate-300">{data.createdAt as string}</span>
          </div>
        )}
        {data.period && (
          <div className="flex justify-between">
            <span className="text-slate-500">Période</span>
            <span className="text-slate-300">{data.period as string}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {data.description && (
        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
          <p className="text-sm text-slate-400">{data.description as string}</p>
        </div>
      )}
    </div>
  );
}

