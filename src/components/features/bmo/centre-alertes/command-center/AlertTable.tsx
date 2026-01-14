/**
 * Tableau d'alertes réutilisable
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal,
  ExternalLink,
  Clock,
} from 'lucide-react';
import type { Alert } from '@/lib/stores/centreAlertesCommandCenterStore';
import { alertModules, severityColors, severityLabels, statusLabels } from './config';
import { formatDistanceToNow } from 'date-fns';

interface AlertTableProps {
  alerts: Alert[];
  onAlertClick?: (alert: Alert) => void;
  onAction?: (action: string, alert: Alert) => void;
  loading?: boolean;
}

export function AlertTable({ alerts, onAlertClick, onAction, loading }: AlertTableProps) {
  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-slate-800/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-4xl mb-4">🔔</div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Aucune alerte</h3>
        <p className="text-sm text-slate-400">Aucune alerte ne correspond aux filtres sélectionnés.</p>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    const color = severityColors[severity] || 'slate';
    return {
      bg: `bg-${color}-500/10`,
      text: `text-${color}-400`,
      border: `border-${color}-500/30`,
    };
  };

  const formatDuration = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: false });
  };

  return (
    <div className="space-y-2">
      {alerts.map((alert) => {
        const module = alertModules[alert.source];
        const severityStyle = getSeverityColor(alert.severity);
        const duration = formatDuration(alert.createdAt);

        // Valeur par défaut si le module n'est pas trouvé
        const moduleIcon = module?.icon || '🔔';
        const moduleLabel = module?.label || alert.source;

        return (
          <div
            key={alert.id}
            className={cn(
              'flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer',
              'hover:bg-slate-800/50',
              severityStyle.border
            )}
            onClick={() => onAlertClick?.(alert)}
          >
            {/* Module Icon */}
            <div className="flex-shrink-0">
              <div className="text-2xl">{moduleIcon}</div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-semibold text-slate-200 truncate">
                  {alert.title}
                </h4>
                <Badge
                  variant="outline"
                  className={cn('h-5 px-1.5 text-xs', severityStyle.bg, severityStyle.text, severityStyle.border)}
                >
                  {severityLabels[alert.severity]}
                </Badge>
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-xs bg-slate-500/20 text-slate-400 border-slate-500/30"
                >
                  {statusLabels[alert.status]}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 truncate mb-2">
                {alert.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Il y a {duration}
                </span>
                {alert.assignedTo && (
                  <span>Assigné à {alert.assignedTo}</span>
                )}
                {alert.impact?.financial && (
                  <span className="text-amber-400">
                    {alert.impact.financial.toLocaleString('fr-FR')} €
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {alert.modulePath && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = alert.modulePath!;
                  }}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
                  title="Ouvrir module source"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAction?.('more', alert);
                }}
                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

