'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { usePaymentValidationWorkspaceStore } from '@/lib/stores/paymentValidationWorkspaceStore';
import { AlertTriangle, Clock, Shield, ChevronRight, X, Bell } from 'lucide-react';

// ================================
// Types
// ================================
interface PaymentAlert {
  id: string;
  type: 'late' | 'critical' | 'bf_pending' | 'risk' | 'deadline';
  title: string;
  message: string;
  count: number;
  queue: string;
  severity: 'critical' | 'warning' | 'info';
}

// ================================
// Component
// ================================
export function PaymentAlertsBanner({ 
  alerts,
  onDismiss,
}: { 
  alerts: PaymentAlert[];
  onDismiss?: (id: string) => void;
}) {
  const { openTab, setQueue } = usePaymentValidationWorkspaceStore();

  if (alerts.length === 0) return null;

  const handleAction = (alert: PaymentAlert) => {
    setQueue(alert.queue as any);
    openTab({
      id: `inbox:${alert.queue}`,
      type: 'inbox',
      title: alert.title,
      icon: alert.type === 'late' ? '🚨' : alert.type === 'critical' ? '🔐' : '⚠️',
      data: { queue: alert.queue },
    });
  };

  const getIcon = (type: PaymentAlert['type']) => {
    switch (type) {
      case 'late':
        return <AlertTriangle className="w-5 h-5" />;
      case 'critical':
        return <Shield className="w-5 h-5" />;
      case 'bf_pending':
        return <Clock className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getSeverityStyles = (severity: PaymentAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200/50 dark:border-red-800/30 text-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200/50 dark:border-amber-800/30 text-amber-800 dark:text-amber-200';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-800/30 text-blue-800 dark:text-blue-200';
    }
  };

  const getIconColor = (severity: PaymentAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  // Single critical alert - full width banner
  if (alerts.length === 1 && alerts[0].severity === 'critical') {
    const alert = alerts[0];
    return (
      <div className={cn(
        'rounded-xl border p-4 animate-in fade-in slide-in-from-top-2 duration-300',
        getSeverityStyles(alert.severity)
      )}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg bg-white/50 dark:bg-black/20', getIconColor(alert.severity))}>
              {getIcon(alert.type)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{alert.title}</span>
                <span className="px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20 text-sm font-bold">
                  {alert.count}
                </span>
              </div>
              <p className="text-sm opacity-90 mt-0.5">{alert.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAction(alert)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium shadow-sm hover:shadow transition-shadow"
            >
              Traiter maintenant
              <ChevronRight className="w-4 h-4" />
            </button>
            {onDismiss && (
              <button
                type="button"
                onClick={() => onDismiss(alert.id)}
                className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-black/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Multiple alerts - compact cards
  return (
    <div className="flex flex-wrap gap-3">
      {alerts.map((alert) => (
        <button
          key={alert.id}
          type="button"
          onClick={() => handleAction(alert)}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all',
            'hover:shadow-md hover:scale-[1.02]',
            'animate-in fade-in slide-in-from-top-2 duration-300',
            getSeverityStyles(alert.severity)
          )}
        >
          <div className={cn('flex-shrink-0', getIconColor(alert.severity))}>
            {getIcon(alert.type)}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{alert.title}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/50 dark:bg-black/20 text-xs font-bold">
                {alert.count}
              </span>
            </div>
            <p className="text-xs opacity-75 mt-0.5 max-w-[200px] truncate">
              {alert.message}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-50" />
        </button>
      ))}
    </div>
  );
}

// ================================
// Generate Alerts Helper
// ================================
export function generatePaymentAlerts(stats: {
  late: number;
  critical: number;
  bfPending: number;
  in7Days: number;
  risky: number;
}): PaymentAlert[] {
  const alerts: PaymentAlert[] = [];

  if (stats.late > 0) {
    alerts.push({
      id: 'late',
      type: 'late',
      title: 'Paiements en retard',
      message: `${stats.late} paiement${stats.late > 1 ? 's' : ''} avec échéance dépassée`,
      count: stats.late,
      queue: 'late',
      severity: 'critical',
    });
  }

  if (stats.critical > 0) {
    alerts.push({
      id: 'critical',
      type: 'critical',
      title: 'Montants critiques',
      message: `≥5M FCFA - Double validation requise`,
      count: stats.critical,
      queue: 'critical',
      severity: 'warning',
    });
  }

  if (stats.bfPending > 0) {
    alerts.push({
      id: 'bf_pending',
      type: 'bf_pending',
      title: 'En attente BF',
      message: 'Validation Bureau Finance requise',
      count: stats.bfPending,
      queue: 'bf_pending',
      severity: 'info',
    });
  }

  if (stats.in7Days > 5 && stats.in7Days > stats.late) {
    alerts.push({
      id: 'deadline',
      type: 'deadline',
      title: 'Échéances proches',
      message: 'Paiements à traiter sous 7 jours',
      count: stats.in7Days,
      queue: '7days',
      severity: 'info',
    });
  }

  return alerts;
}

