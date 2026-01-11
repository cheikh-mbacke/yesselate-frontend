/**
 * Panel de détail latéral pour Échanges Inter-Bureaux
 * Affiche les détails d'un échange sans quitter la vue principale
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  ExternalLink,
  MessageSquare,
  Clock,
  User,
  Building2,
  ArrowRightLeft,
  FileText,
  Paperclip,
  Zap,
  ArrowUp,
  Briefcase,
  Calendar,
} from 'lucide-react';
import { useEchangesBureauxCommandCenterStore } from '@/lib/stores/echangesBureauxCommandCenterStore';
import { getExchangeById } from '@/lib/mocks/echangesMockData';

export function EchangesDetailPanel() {
  const { detailPanel, closeDetailPanel, openModal } = useEchangesBureauxCommandCenterStore();

  if (!detailPanel.isOpen) return null;

  const data = detailPanel.data || {};
  const type = detailPanel.type;
  const entityId = detailPanel.entityId;

  const handleOpenFullModal = () => {
    if (type === 'exchange') {
      openModal('exchange-detail', { exchangeId: entityId });
      closeDetailPanel();
    }
  };

  // Charger les données de l'échange
  const exchange = entityId && type === 'exchange' ? getExchangeById(entityId) : null;

  if (!exchange) {
    return null;
  }

  const priorityColors = {
    urgent: 'text-red-400 bg-red-500/10 border-red-500/30',
    high: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    normal: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  };

  const statusColors = {
    pending: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    resolved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    escalated: 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  const priorityIcons = {
    urgent: Zap,
    high: ArrowUp,
    normal: Clock,
  };

  const PriorityIcon = priorityIcons[exchange.priority];

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
            <MessageSquare className="h-4 w-4 text-violet-400" />
            <h3 className="text-sm font-medium text-slate-200">Détail Échange</h3>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Reference et badges */}
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-xs text-slate-400">{exchange.ref}</span>
              <Badge className={cn('text-xs', priorityColors[exchange.priority])}>
                <PriorityIcon className="w-3 h-3 mr-1" />
                {exchange.priority === 'urgent' ? 'Urgent' : exchange.priority === 'high' ? 'Haute' : 'Normale'}
              </Badge>
              <Badge className={cn('text-xs', statusColors[exchange.status])}>
                {exchange.status === 'pending' ? 'En attente' : exchange.status === 'resolved' ? 'Résolu' : 'Escaladé'}
              </Badge>
            </div>
            <h4 className="text-sm font-semibold text-slate-200 mb-2">{exchange.sujet}</h4>
          </div>

          {/* Bureaux */}
          <div className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500">Bureaux</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-300">{exchange.bureauFrom.name}</p>
                <p className="text-xs text-slate-500">{exchange.bureauFrom.code}</p>
              </div>
              <ArrowRightLeft className="w-4 h-4 text-slate-500" />
              <div className="flex-1 text-right">
                <p className="text-xs font-medium text-slate-300">{exchange.bureauTo.name}</p>
                <p className="text-xs text-slate-500">{exchange.bureauTo.code}</p>
              </div>
            </div>
          </div>

          {/* Auteur */}
          <div className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500">Auteur</span>
            </div>
            <p className="text-xs font-medium text-slate-300">{exchange.auteur.name}</p>
            <p className="text-xs text-slate-500">{exchange.auteur.email}</p>
          </div>

          {/* Date */}
          <div className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500">Date de création</span>
            </div>
            <p className="text-xs font-medium text-slate-300">
              {new Date(exchange.dateCreation).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <p className="text-xs text-slate-500">
              {new Date(exchange.dateCreation).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          {/* Projet */}
          {exchange.project && (
            <div className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/30">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-500">Projet lié</span>
              </div>
              <p className="text-xs font-medium text-slate-300">{exchange.project.name}</p>
              <p className="text-xs text-slate-500">{exchange.project.code}</p>
            </div>
          )}

          {/* Message (prévisualisation) */}
          <div className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500">Message</span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-4">{exchange.message}</p>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/30">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-500">Réponses</span>
              </div>
              <p className="text-lg font-bold text-slate-200">{exchange.responses.length}</p>
            </div>
            <div className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/30">
              <div className="flex items-center gap-2 mb-1">
                <Paperclip className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-500">Documents</span>
              </div>
              <p className="text-lg font-bold text-slate-200">{exchange.attachments.length}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800/50 p-4 space-y-2">
          <Button
            onClick={handleOpenFullModal}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Ouvrir en modal complète
          </Button>
        </div>
      </div>
    </>
  );
}

