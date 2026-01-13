'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { usePaymentValidationWorkspaceStore } from '@/lib/stores/paymentValidationWorkspaceStore';
import {
  X,
  Target,
  AlertTriangle,
  Clock,
  Shield,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  BarChart2,
  FileText,
  Users,
  Building2,
  Zap,
  CheckCircle2,
  XCircle,
  Eye,
  Workflow,
  Calendar,
  DollarSign,
} from 'lucide-react';

// ================================
// Types
// ================================
interface DecisionMetric {
  label: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  color: 'emerald' | 'amber' | 'red' | 'blue' | 'purple' | 'slate';
  icon: React.ReactNode;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  count: number;
  queue: string;
  icon: React.ReactNode;
}

// ================================
// Helper Components
// ================================
function MetricCard({ metric }: { metric: DecisionMetric }) {
  const colors = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200/50 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200/50 dark:border-amber-800/30 text-amber-700 dark:text-amber-400',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200/50 dark:border-red-800/30 text-red-700 dark:text-red-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-800/30 text-blue-700 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200/50 dark:border-purple-800/30 text-purple-700 dark:text-purple-400',
    slate: 'bg-slate-50 dark:bg-slate-900/20 border-slate-200/50 dark:border-slate-800/30 text-slate-700 dark:text-slate-400',
  };

  return (
    <div className={cn('p-4 rounded-xl border', colors[metric.color])}>
      <div className="flex items-center justify-between mb-2">
        <div className="w-8 h-8 rounded-lg bg-white/50 dark:bg-black/20 flex items-center justify-center">
          {metric.icon}
        </div>
        {metric.trend && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium',
            metric.trend === 'up' ? 'text-emerald-600' : metric.trend === 'down' ? 'text-red-600' : 'text-slate-500'
          )}>
            {metric.trend === 'up' && <TrendingUp className="w-3 h-3" />}
            {metric.trend === 'down' && <TrendingDown className="w-3 h-3" />}
            {metric.change !== undefined && `${metric.change > 0 ? '+' : ''}${metric.change}%`}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold">{metric.value}</p>
      <p className="text-sm opacity-80">{metric.label}</p>
    </div>
  );
}

function ActionCard({ 
  action, 
  onAction 
}: { 
  action: ActionItem;
  onAction: (queue: string) => void;
}) {
  const urgencyColors = {
    critical: 'border-l-red-500 bg-red-50 dark:bg-red-900/10',
    high: 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10',
    medium: 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/10',
    low: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10',
  };

  const urgencyLabels = {
    critical: 'Critique',
    high: 'Élevé',
    medium: 'Moyen',
    low: 'Faible',
  };

  return (
    <button
      type="button"
      onClick={() => onAction(action.queue)}
      className={cn(
        'w-full p-4 rounded-xl border-l-4 text-left transition-all',
        'hover:shadow-md hover:scale-[1.01]',
        urgencyColors[action.urgency]
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
            {action.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{action.title}</h4>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                action.urgency === 'critical' ? 'bg-red-200 text-red-800' :
                action.urgency === 'high' ? 'bg-orange-200 text-orange-800' :
                action.urgency === 'medium' ? 'bg-amber-200 text-amber-800' :
                'bg-blue-200 text-blue-800'
              )}>
                {urgencyLabels[action.urgency]}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {action.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {action.count}
          </span>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
      </div>
    </button>
  );
}

// ================================
// Main Component
// ================================
export function PaymentDecisionCenter({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { openTab, setQueue } = usePaymentValidationWorkspaceStore();
  const [activeSection, setActiveSection] = useState<'overview' | 'actions' | 'analytics'>('overview');

  // Mock data - would come from real data
  const metrics: DecisionMetric[] = [
    {
      label: 'En attente',
      value: 23,
      change: -12,
      trend: 'down',
      color: 'amber',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      label: 'Critiques (≥5M)',
      value: 8,
      change: 3,
      trend: 'up',
      color: 'purple',
      icon: <Shield className="w-4 h-4" />,
    },
    {
      label: 'En retard',
      value: 5,
      color: 'red',
      icon: <AlertTriangle className="w-4 h-4" />,
    },
    {
      label: 'Validés (24h)',
      value: 15,
      change: 25,
      trend: 'up',
      color: 'emerald',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    {
      label: 'Montant total',
      value: '47.5M FCFA',
      color: 'blue',
      icon: <DollarSign className="w-4 h-4" />,
    },
    {
      label: 'Taux validation',
      value: '94.2%',
      change: 2.1,
      trend: 'up',
      color: 'emerald',
      icon: <BarChart2 className="w-4 h-4" />,
    },
  ];

  const actions: ActionItem[] = [
    {
      id: 'late',
      title: 'Paiements en retard',
      description: 'Échéance dépassée - Action immédiate requise',
      urgency: 'critical',
      count: 5,
      queue: 'late',
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
    },
    {
      id: 'critical',
      title: 'Montants critiques',
      description: 'Double validation BF → DG requise',
      urgency: 'high',
      count: 8,
      queue: 'critical',
      icon: <Shield className="w-5 h-5 text-purple-500" />,
    },
    {
      id: 'bf_pending',
      title: 'En attente BF',
      description: 'Validation Bureau Finance en cours',
      urgency: 'medium',
      count: 4,
      queue: 'bf_pending',
      icon: <Building2 className="w-5 h-5 text-orange-500" />,
    },
    {
      id: '7days',
      title: 'Échéances 7 jours',
      description: 'Planifier le traitement',
      urgency: 'medium',
      count: 12,
      queue: '7days',
      icon: <Calendar className="w-5 h-5 text-blue-500" />,
    },
    {
      id: 'no_facture',
      title: 'Sans facture associée',
      description: 'Matching documentaire incomplet',
      urgency: 'low',
      count: 6,
      queue: 'no_facture',
      icon: <FileText className="w-5 h-5 text-slate-500" />,
    },
  ];

  const handleAction = (queue: string) => {
    setQueue(queue as any);
    openTab({
      id: `inbox:${queue}`,
      type: 'inbox',
      title: actions.find(a => a.queue === queue)?.title || queue,
      icon: '📋',
      data: { queue },
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-xl">Centre de décision</h2>
              <p className="text-sm text-slate-500">
                Pilotage stratégique des paiements • Vue Direction
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: <Eye className="w-4 h-4" /> },
            { id: 'actions', label: 'Actions requises', icon: <Zap className="w-4 h-4" /> },
            { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id as typeof activeSection)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeSection === tab.id
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* KPIs Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {metrics.map((metric, idx) => (
                  <MetricCard key={idx} metric={metric} />
                ))}
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Actions prioritaires
                </h3>
                <div className="grid gap-3">
                  {actions.slice(0, 3).map((action) => (
                    <ActionCard key={action.id} action={action} onAction={handleAction} />
                  ))}
                </div>
              </div>

              {/* Governance Info */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200/50 dark:border-purple-800/30">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-purple-900 dark:text-purple-200">
                      Gouvernance RACI
                    </h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                      Montants ≥ 5M FCFA : Bureau Finance (R) valide, puis Direction Générale (A) autorise.
                      Chaque action génère un hash SHA-256 pour traçabilité append-only.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'actions' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 mb-4">
                Actions classées par priorité. Cliquez pour ouvrir la file correspondante.
              </p>
              {actions.map((action) => (
                <ActionCard key={action.id} action={action} onAction={handleAction} />
              ))}
            </div>
          )}

          {activeSection === 'analytics' && (
            <div className="space-y-6">
              {/* Performance Chart Placeholder */}
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h4 className="font-semibold mb-4">Performance de validation (30 jours)</h4>
                <div className="h-48 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="text-center">
                    <BarChart2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Graphique de performance</p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h5 className="text-sm font-medium text-slate-500 mb-2">Temps moyen de traitement</h5>
                  <p className="text-2xl font-bold text-emerald-600">2.4 jours</p>
                  <p className="text-xs text-emerald-600 mt-1">-18% vs mois précédent</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h5 className="text-sm font-medium text-slate-500 mb-2">Montant traité (mois)</h5>
                  <p className="text-2xl font-bold text-blue-600">234.5M FCFA</p>
                  <p className="text-xs text-blue-600 mt-1">+12% vs mois précédent</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h5 className="text-sm font-medium text-slate-500 mb-2">Taux de conformité</h5>
                  <p className="text-2xl font-bold text-purple-600">98.7%</p>
                  <p className="text-xs text-purple-600 mt-1">Documents complets</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h5 className="text-sm font-medium text-slate-500 mb-2">Paiements bloqués</h5>
                  <p className="text-2xl font-bold text-red-600">3</p>
                  <p className="text-xs text-red-600 mt-1">Nécessitent révision</p>
                </div>
              </div>

              {/* Bureau Performance */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h4 className="font-semibold mb-4">Performance par bureau</h4>
                <div className="space-y-3">
                  {[
                    { bureau: 'BF', name: 'Bureau Finance', validations: 45, rate: 96 },
                    { bureau: 'BM', name: 'Bureau Marchés', validations: 32, rate: 94 },
                    { bureau: 'BA', name: 'Bureau Achats', validations: 28, rate: 98 },
                    { bureau: 'BCT', name: 'Bureau Contrôle Technique', validations: 18, rate: 100 },
                  ].map((b) => (
                    <div key={b.bureau} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                          {b.bureau}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{b.name}</p>
                          <p className="text-xs text-slate-500">{b.validations} validations</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full" 
                            style={{ width: `${b.rate}%` }} 
                          />
                        </div>
                        <span className="text-sm font-medium text-emerald-600">{b.rate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <p className="text-xs text-slate-500">
            Dernière mise à jour : {new Date().toLocaleString('fr-FR')}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('payment:open-stats'))}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              <BarChart2 className="w-4 h-4" />
              Stats détaillées
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

