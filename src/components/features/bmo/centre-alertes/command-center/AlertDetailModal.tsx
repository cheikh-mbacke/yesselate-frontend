/**
 * Modale de détail d'alerte
 */

'use client';

import React from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCentreAlertesCommandCenterStore } from '@/lib/stores/centreAlertesCommandCenterStore';
import type { Alert } from '@/lib/stores/centreAlertesCommandCenterStore';
import { alertModules, severityLabels, statusLabels } from './config';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Clock } from 'lucide-react';

export function AlertDetailModal() {
  const { modal, closeModal } = useCentreAlertesCommandCenterStore();
  const alert = modal.data?.alert as Alert | undefined;

  if (!alert) return null;

  const module = alertModules[alert.source];
  const duration = formatDistanceToNow(alert.createdAt, { addSuffix: false });

  return (
    <FluentModal
      isOpen={modal.isOpen && modal.type === 'alert-detail'}
      onClose={closeModal}
      title={`Détail de l'alerte`}
      size="lg"
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-200 mb-2">{alert.title}</h3>
            <p className="text-sm text-slate-400 mb-4">{alert.description}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
              {severityLabels[alert.severity]}
            </Badge>
            <Badge variant="outline" className="bg-slate-500/20 text-slate-400 border-slate-500/30">
              {statusLabels[alert.status]}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
          <div>
            <div className="text-xs text-slate-400 mb-1">Module source</div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{module.icon}</span>
              <span className="text-sm text-slate-200">{module.label}</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Type</div>
            <div className="text-sm text-slate-200">{alert.type}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Créée</div>
            <div className="flex items-center gap-1 text-sm text-slate-200">
              <Clock className="h-3 w-3" />
              Il y a {duration}
            </div>
          </div>
          {alert.assignedTo && (
            <div>
              <div className="text-xs text-slate-400 mb-1">Assignée à</div>
              <div className="text-sm text-slate-200">{alert.assignedTo}</div>
            </div>
          )}
        </div>

        {alert.impact && (
          <div className="pt-4 border-t border-slate-700/50">
            <div className="text-xs text-slate-400 mb-2">Impact</div>
            <div className="space-y-1">
              {alert.impact.financial && (
                <div className="text-sm text-slate-200">
                  Financier : {alert.impact.financial.toLocaleString('fr-FR')} €
                </div>
              )}
              {alert.impact.operational && (
                <div className="text-sm text-slate-200">
                  Opérationnel : {alert.impact.operational}
                </div>
              )}
              {alert.impact.reputation && (
                <div className="text-sm text-slate-200">
                  Réputation : {alert.impact.reputation}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-700/50">
          {alert.modulePath && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.href = alert.modulePath!;
              }}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Ouvrir module source
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={closeModal}
            className="bg-amber-500 hover:bg-amber-600"
          >
            Fermer
          </Button>
        </div>
      </div>
    </FluentModal>
  );
}

