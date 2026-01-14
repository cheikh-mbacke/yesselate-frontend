/**
 * Panneau d'actions rapides
 * Boutons pour créer événement, ajouter absence, etc.
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Plus,
  CalendarPlus,
  UserMinus,
  Link as LinkIcon,
  Download,
  Bell,
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'primary';
}

export function QuickActionsPanel() {
  const router = useRouter();

  const actions: QuickAction[] = [
    {
      id: 'create-event',
      label: 'Créer événement',
      icon: CalendarPlus,
      onClick: () => {
        // TODO: Ouvrir modal de création d'événement
        console.log('Créer événement');
      },
      variant: 'primary',
    },
    {
      id: 'add-absence',
      label: 'Ajouter absence',
      icon: UserMinus,
      onClick: () => {
        // TODO: Ouvrir modal d'ajout d'absence
        console.log('Ajouter absence');
      },
    },
    {
      id: 'link-chantier',
      label: 'Lier à chantier',
      icon: LinkIcon,
      onClick: () => {
        // TODO: Ouvrir modal de liaison
        console.log('Lier à chantier');
      },
    },
    {
      id: 'export-period',
      label: 'Exporter période',
      icon: Download,
      onClick: () => {
        // TODO: Ouvrir modal d'export
        console.log('Exporter période');
      },
    },
    {
      id: 'activate-alert',
      label: 'Activer alerte',
      icon: Bell,
      onClick: () => {
        // TODO: Ouvrir modal d'alerte
        console.log('Activer alerte');
      },
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-200">Actions rapides</h2>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              variant={action.variant === 'primary' ? 'default' : 'outline'}
              size="sm"
              onClick={action.onClick}
              className={cn(
                'flex items-center gap-2 h-9 text-xs font-medium',
                action.variant === 'primary'
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30'
                  : 'bg-slate-800/50 text-slate-300 border-slate-700/50 hover:bg-slate-700/50'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{action.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

