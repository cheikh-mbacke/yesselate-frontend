/**
 * Panneau de notifications pour Recouvrements
 * Affiche les notifications liées aux créances (alertes, retards, etc.)
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  X,
  AlertTriangle,
  Clock,
  CheckCircle,
  DollarSign,
  CalendarClock,
  ArrowRight,
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message?: string;
  time: string;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface RecouvrementsNotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RecouvrementsNotificationsPanel({
  isOpen,
  onClose,
}: RecouvrementsNotificationsPanelProps) {
  // Données de démonstration - en production, viendrait d'une API
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'critical',
      title: 'Créance en retard critique',
      message: 'La créance #REC-2024-001 est en retard de 45 jours',
      time: 'il y a 15 min',
      read: false,
      action: {
        label: 'Voir la créance',
        onClick: () => {
          console.log('Open creance REC-2024-001');
          onClose();
        },
      },
    },
    {
      id: '2',
      type: 'warning',
      title: 'Nouvelle créance en attente',
      message: '5 nouvelles créances nécessitent votre attention',
      time: 'il y a 1h',
      read: false,
      action: {
        label: 'Voir les créances',
        onClick: () => {
          console.log('Open pending creances');
          onClose();
        },
      },
    },
    {
      id: '3',
      type: 'info',
      title: 'Paiement reçu',
      message: 'Un paiement de 2.5M FCFA a été reçu pour la créance #REC-2024-015',
      time: 'il y a 3h',
      read: true,
    },
    {
      id: '4',
      type: 'warning',
      title: 'Relance planifiée',
      message: '3 relances automatiques sont programmées pour demain',
      time: 'il y a 5h',
      read: true,
    },
    {
      id: '5',
      type: 'info',
      title: 'Rapport mensuel disponible',
      message: 'Le rapport de recouvrement du mois est disponible',
      time: 'hier',
      read: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-medium text-slate-200">Notifications</h3>
            {unreadCount > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                {unreadCount} nouvelles
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 text-slate-500 hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
          {notifications.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
                <p className="text-sm text-slate-400">Aucune notification</p>
              </div>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/50">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-slate-700 text-slate-400 hover:text-slate-200"
            onClick={() => {
              console.log('Mark all as read');
              onClose();
            }}
          >
            Tout marquer comme lu
          </Button>
        </div>
      </div>
    </>
  );
}

// ================================
// Notification Item
// ================================
function NotificationItem({ notification }: { notification: Notification }) {
  const iconMap = {
    critical: AlertTriangle,
    warning: Clock,
    info: CheckCircle,
  };

  const colorMap = {
    critical: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      dot: 'bg-red-500',
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      dot: 'bg-amber-500',
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      dot: 'bg-blue-500',
    },
  };

  const Icon = iconMap[notification.type];
  const colors = colorMap[notification.type];

  return (
    <div
      className={cn(
        'px-4 py-3 hover:bg-slate-800/30 cursor-pointer transition-colors',
        !notification.read && 'bg-slate-800/20'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'p-2 rounded-lg border',
            colors.bg,
            colors.border
          )}
        >
          <Icon className={cn('w-4 h-4', colors.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'text-sm mb-1',
                  !notification.read ? 'text-slate-200 font-medium' : 'text-slate-400'
                )}
              >
                {notification.title}
              </p>
              {notification.message && (
                <p className="text-xs text-slate-500 mb-2 line-clamp-2">
                  {notification.message}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <p className="text-xs text-slate-600">{notification.time}</p>
                {notification.action && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      notification.action?.onClick();
                    }}
                    className={cn(
                      'text-xs font-medium flex items-center gap-1',
                      colors.text,
                      'hover:underline'
                    )}
                  >
                    {notification.action.label}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            {!notification.read && (
              <div
                className={cn(
                  'w-2 h-2 rounded-full flex-shrink-0 mt-1',
                  colors.dot
                )}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

