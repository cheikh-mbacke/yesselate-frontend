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
  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h4 className="text-lg font-semibold text-slate-200 mb-1">{data.name as string}</h4>
        <p className="text-sm text-slate-500">{data.category as string}</p>
      </div>

      {/* Value */}
      <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-100">{data.value as string}</span>
          {data.unit && (
            <span className="text-sm text-slate-500">{data.unit as string}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
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
        </div>
      </div>

      {/* Status */}
      {data.status && (
        <div className="flex items-center gap-2">
          <Badge
            variant={
              data.status === 'success'
                ? 'default'
                : data.status === 'warning'
                ? 'warning'
                : 'destructive'
            }
          >
            {data.status === 'success' && 'OK'}
            {data.status === 'warning' && 'Attention'}
            {data.status === 'critical' && 'Critique'}
          </Badge>
        </div>
      )}

      {/* Metadata */}
      <div className="space-y-2 text-sm">
        {data.target && (
          <div className="flex justify-between">
            <span className="text-slate-500">Objectif</span>
            <span className="text-slate-300 font-medium">{data.target as string}</span>
          </div>
        )}
        {data.lastUpdate && (
          <div className="flex justify-between">
            <span className="text-slate-500">Dernière mise à jour</span>
            <span className="text-slate-300">{data.lastUpdate as string}</span>
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

