'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  projectId?: string;
  projectName?: string;
  action?: string;
  createdAt: string;
}

export function ProjectAlertsBanner() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAlerts();
    
    // Recharger toutes les 30s
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      const res = await fetch('/api/projects/alerts', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Erreur chargement alertes:', error);
    }
  };

  const dismissAlert = (id: string) => {
    setDismissed(prev => new Set([...prev, id]));
    // Persister dans localStorage
    const dismissedAlerts = Array.from(dismissed);
    dismissedAlerts.push(id);
    localStorage.setItem('bmo.projects.dismissed-alerts', JSON.stringify(dismissedAlerts.slice(-50)));
  };

  const activeAlerts = alerts.filter(alert => !dismissed.has(alert.id));

  if (activeAlerts.length === 0) return null;

  const criticalAlerts = activeAlerts.filter(a => a.type === 'critical');

  return (
    <div className="space-y-2">
      {criticalAlerts.length > 0 && (
        <div className={cn(
          'rounded-2xl border p-4 flex items-start gap-3',
          'bg-rose-500/10 border-rose-500/30'
        )}>
          <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center flex-none">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-rose-300/90 mb-1">
              {criticalAlerts.length} alerte{criticalAlerts.length > 1 ? 's' : ''} critique{criticalAlerts.length > 1 ? 's' : ''}
            </div>
            <p className="text-sm text-slate-400">
              Des projets nécessitent une attention immédiate
            </p>
            
            <div className="mt-3 space-y-2">
              {criticalAlerts.slice(0, 3).map(alert => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between gap-3 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{alert.message}</p>
                    {alert.projectName && (
                      <p className="text-xs text-slate-400 mt-1">
                        Projet: {alert.projectName}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {alert.action && (
                      <FluentButton
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (alert.projectId) {
                            window.dispatchEvent(new CustomEvent('project:open', { 
                              detail: { projectId: alert.projectId } 
                            }));
                          }
                        }}
                      >
                        {alert.action}
                      </FluentButton>
                    )}
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="p-1 rounded hover:bg-rose-500/20 transition-colors"
                      title="Ignorer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {criticalAlerts.length > 3 && (
              <FluentButton
                size="sm"
                variant="secondary"
                className="mt-2"
                onClick={() => window.dispatchEvent(new CustomEvent('project:open-alerts'))}
              >
                Voir toutes les alertes ({criticalAlerts.length})
              </FluentButton>
            )}
          </div>
        </div>
      )}

      {/* Warnings (moins urgent) */}
      {activeAlerts.filter(a => a.type === 'warning').length > 0 && (
        <div className={cn(
          'rounded-2xl border p-4 flex items-start gap-3',
          'bg-amber-500/10 border-amber-500/30'
        )}>
          <AlertCircle className="w-5 h-5 text-amber-400 flex-none mt-1" />
          
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-amber-300/90 mb-1">
              Avertissements ({activeAlerts.filter(a => a.type === 'warning').length})
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {activeAlerts
                .filter(a => a.type === 'warning')
                .slice(0, 5)
                .map(alert => (
                  <Badge key={alert.id} variant="warning" className="text-xs">
                    {alert.message}
                  </Badge>
                ))}
            </div>
          </div>
          
          <button
            onClick={() => {
              activeAlerts
                .filter(a => a.type === 'warning')
                .forEach(a => dismissAlert(a.id));
            }}
            className="p-1 rounded hover:bg-amber-500/20 transition-colors flex-none"
            title="Tout ignorer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

