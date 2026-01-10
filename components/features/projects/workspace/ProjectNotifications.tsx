'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X, CheckCircle2 } from 'lucide-react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'critical';
  message: string;
  projectId?: string;
  createdAt: string;
}

export function ProjectNotifications() {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Écouter l'événement d'ouverture
    const handleOpen = () => setOpen(true);
    window.addEventListener('project:open-notifications', handleOpen);
    return () => window.removeEventListener('project:open-notifications', handleOpen);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    
    // Charger les notifications
    loadNotifications();
    
    // Recharger toutes les minutes
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [enabled]);

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/projects/alerts', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const notifs: Notification[] = data.alerts.map((alert: any) => ({
          id: alert.id,
          type: alert.type === 'critical' ? 'critical' : 'warning',
          message: alert.message,
          projectId: alert.projectId,
          createdAt: alert.createdAt,
        }));
        setNotifications(notifs);
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  const dismissNotification = (id: string) => {
    setDismissed(prev => new Set([...prev, id]));
  };

  const activeNotifications = notifications.filter(n => !dismissed.has(n.id));
  const criticalCount = activeNotifications.filter(n => n.type === 'critical').length;

  return (
    <FluentModal
      open={open}
      title="Notifications projets"
      onClose={() => setOpen(false)}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {enabled ? (
              <Bell className="w-5 h-5 text-blue-400" />
            ) : (
              <BellOff className="w-5 h-5 text-slate-400" />
            )}
            <span className="text-sm font-medium">
              {enabled ? 'Notifications activées' : 'Notifications désactivées'}
            </span>
          </div>
          <FluentButton
            size="sm"
            variant={enabled ? 'secondary' : 'primary'}
            onClick={() => setEnabled(!enabled)}
          >
            {enabled ? 'Désactiver' : 'Activer'}
          </FluentButton>
        </div>

        {/* Liste */}
        {activeNotifications.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-300 mb-3" />
            <div className="text-slate-500">Aucune notification</div>
            <div className="text-xs text-slate-400 mt-1">
              Tout est sous contrôle
            </div>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {activeNotifications.map(notif => (
              <div
                key={notif.id}
                className={cn(
                  'p-3 rounded-xl border flex items-start gap-3',
                  notif.type === 'critical' && 'border-rose-300/50 bg-rose-50/50 dark:border-rose-700/30 dark:bg-rose-900/20',
                  notif.type === 'warning' && 'border-amber-300/50 bg-amber-50/50 dark:border-amber-700/30 dark:bg-amber-900/20'
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{notif.message}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {new Date(notif.createdAt).toLocaleString('fr-FR')}
                  </div>
                  {notif.projectId && (
                    <button
                      className="text-xs text-purple-400 hover:underline mt-1"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('project:open', {
                          detail: { projectId: notif.projectId }
                        }));
                        setOpen(false);
                      }}
                    >
                      Voir le projet
                    </button>
                  )}
                </div>
                
                <Badge
                  variant={notif.type === 'critical' ? 'urgent' : 'warning'}
                  className="text-[9px]"
                >
                  {notif.type}
                </Badge>
                
                <button
                  onClick={() => dismissNotification(notif.id)}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Ignorer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {activeNotifications.length > 0 && (
          <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
            <FluentButton
              size="sm"
              variant="secondary"
              onClick={() => {
                activeNotifications.forEach(n => dismissNotification(n.id));
              }}
            >
              Tout ignorer
            </FluentButton>
            <FluentButton size="sm" variant="secondary" onClick={() => setOpen(false)}>
              Fermer
            </FluentButton>
          </div>
        )}
      </div>
    </FluentModal>
  );
}

