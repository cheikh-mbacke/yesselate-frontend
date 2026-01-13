/**
 * Barre d'actions batch pour Échanges Inter-Bureaux
 * Affiche les actions disponibles pour les échanges sélectionnés
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  X,
  Archive,
  Download,
  Trash2,
  CheckCircle,
  Mail,
  ArrowUp,
  FileText,
} from 'lucide-react';
import { useEchangesBureauxCommandCenterStore } from '@/lib/stores/echangesBureauxCommandCenterStore';

interface EchangesBatchActionsBarProps {
  onAction?: (actionId: string, ids: string[]) => void;
}

export function EchangesBatchActionsBar({ onAction }: EchangesBatchActionsBarProps) {
  const { selectedItems, clearSelection } = useEchangesBureauxCommandCenterStore();

  if (selectedItems.length === 0) return null;

  const handleAction = (actionId: string) => {
    onAction?.(actionId, selectedItems);
  };

  const actions = [
    {
      id: 'mark-read',
      label: 'Marquer comme lu',
      icon: CheckCircle,
      variant: 'ghost' as const,
    },
    {
      id: 'archive',
      label: 'Archiver',
      icon: Archive,
      variant: 'ghost' as const,
    },
    {
      id: 'escalate',
      label: 'Escalader',
      icon: ArrowUp,
      variant: 'ghost' as const,
    },
    {
      id: 'export',
      label: 'Exporter',
      icon: Download,
      variant: 'ghost' as const,
    },
    {
      id: 'delete',
      label: 'Supprimer',
      icon: Trash2,
      variant: 'ghost' as const,
      destructive: true,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">
                {selectedItems.length} échange{selectedItems.length > 1 ? 's' : ''} sélectionné{selectedItems.length > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-slate-500">Actions disponibles</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant={action.variant}
                size="sm"
                onClick={() => handleAction(action.id)}
                className={cn(
                  'h-8 px-3 text-xs',
                  action.destructive
                    ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                    : 'text-slate-300 hover:text-slate-200 hover:bg-slate-800/50'
                )}
              >
                <Icon className="w-3.5 h-3.5 mr-1.5" />
                {action.label}
              </Button>
            );
          })}

          <div className="w-px h-6 bg-slate-700/50 mx-2" />

          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-300"
            title="Désélectionner tout"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

