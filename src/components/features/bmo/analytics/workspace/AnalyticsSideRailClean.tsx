/**
 * AnalyticsSideRailClean.tsx
 * ===========================
 * 
 * Version épurée du rail latéral Analytics
 * Couleurs métier subtiles, interface minimaliste
 */

'use client';

import { useMemo, useState } from 'react';
import { 
  ChevronDown, ChevronUp, ExternalLink, Clock,
  TrendingUp, TrendingDown, Minus, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalyticsTab } from '@/lib/stores/analyticsWorkspaceStore';
import { calculateKPIs, calculateBureauPerformance, detectAlerts } from '@/lib/data/analytics';

interface Props {
  onOpenView: (tab: AnalyticsTab) => void;
}

export function AnalyticsSideRailClean({ onOpenView }: Props) {
  const [expandedSection, setExpandedSection] = useState<string | null>('kpis');

  // Données calculées
  const kpis = useMemo(() => calculateKPIs(), []);
  const bureaux = useMemo(() => calculateBureauPerformance(), []);
  const alerts = useMemo(() => detectAlerts(), []);

  // KPIs nécessitant attention (warning ou critical)
  const attentionKPIs = useMemo(() => 
    kpis.filter(k => k.status !== 'good').slice(0, 5),
    [kpis]
  );

  // Bureaux avec score faible
  const lowPerformanceBureaux = useMemo(() => 
    bureaux.filter(b => b.score < 70).slice(0, 3),
    [bureaux]
  );

  // Alertes actives
  const activeAlerts = useMemo(() => 
    alerts.filter(a => a.type === 'critical' || a.type === 'warning').slice(0, 4),
    [alerts]
  );

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  return (
    <div className="h-full flex flex-col text-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Aperçu rapide
          </span>
          <span className="text-[10px] text-slate-400">
            {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Section KPIs */}
        <Section
          title="Indicateurs"
          count={attentionKPIs.length}
          expanded={expandedSection === 'kpis'}
          onToggle={() => toggleSection('kpis')}
          countColor={attentionKPIs.some(k => k.status === 'critical') ? 'amber' : 'slate'}
        >
          {attentionKPIs.length === 0 ? (
            <EmptyState text="Tous les indicateurs sont conformes" />
          ) : (
            <div className="space-y-1">
              {attentionKPIs.map((kpi) => (
                <KPIItem 
                  key={kpi.id} 
                  kpi={kpi} 
                  onClick={() => onOpenView({
                    id: 'inbox:performance',
                    type: 'inbox',
                    title: 'Performance',
                    icon: '⚡',
                    data: { queue: 'performance' },
                  })}
                />
              ))}
            </div>
          )}
        </Section>

        {/* Section Bureaux */}
        <Section
          title="Bureaux"
          count={lowPerformanceBureaux.length}
          expanded={expandedSection === 'bureaux'}
          onToggle={() => toggleSection('bureaux')}
          countColor={lowPerformanceBureaux.length > 0 ? 'amber' : 'slate'}
        >
          {lowPerformanceBureaux.length === 0 ? (
            <EmptyState text="Performance satisfaisante" />
          ) : (
            <div className="space-y-1">
              {lowPerformanceBureaux.map((bureau) => (
                <BureauItem 
                  key={bureau.bureauCode} 
                  bureau={bureau}
                  onClick={() => onOpenView({
                    id: 'inbox:trends',
                    type: 'inbox',
                    title: 'Tendances',
                    icon: '📈',
                    data: { queue: 'trends' },
                  })}
                />
              ))}
            </div>
          )}
        </Section>

        {/* Section Alertes */}
        <Section
          title="Alertes"
          count={activeAlerts.length}
          expanded={expandedSection === 'alerts'}
          onToggle={() => toggleSection('alerts')}
          countColor={activeAlerts.some(a => a.type === 'critical') ? 'amber' : 'slate'}
        >
          {activeAlerts.length === 0 ? (
            <EmptyState text="Aucune alerte active" />
          ) : (
            <div className="space-y-1">
              {activeAlerts.map((alert) => (
                <AlertItem 
                  key={alert.id} 
                  alert={alert}
                  onClick={() => onOpenView({
                    id: 'inbox:alerts',
                    type: 'inbox',
                    title: 'Alertes',
                    icon: '⚠️',
                    data: { queue: 'alerts' },
                  })}
                />
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => onOpenView({
            id: 'dashboard:overview',
            type: 'dashboard',
            title: "Vue d'ensemble",
            icon: '📊',
            data: { view: 'overview' },
          })}
          className="w-full text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          Voir le tableau de bord complet →
        </button>
      </div>
    </div>
  );
}

// Section collapsible
function Section({ 
  title, 
  count, 
  expanded, 
  onToggle, 
  children,
  countColor = 'slate'
}: { 
  title: string; 
  count: number; 
  expanded: boolean; 
  onToggle: () => void; 
  children: React.ReactNode;
  countColor?: 'slate' | 'amber';
}) {
  return (
    <div className="border-b border-slate-100 dark:border-slate-800">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</span>
          {count > 0 && (
            <span className={cn(
              'px-1.5 py-0.5 rounded text-[10px] font-medium',
              countColor === 'amber' 
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            )}>
              {count}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {expanded && (
        <div className="px-4 pb-3">
          {children}
        </div>
      )}
    </div>
  );
}

// État vide
function EmptyState({ text }: { text: string }) {
  return (
    <p className="text-xs text-slate-400 py-2">{text}</p>
  );
}

// Item KPI
function KPIItem({ 
  kpi, 
  onClick 
}: { 
  kpi: ReturnType<typeof calculateKPIs>[0]; 
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
    >
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
          {kpi.name}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">
          {kpi.value}{kpi.unit} / {kpi.target}{kpi.unit}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <TrendIndicator trend={kpi.trend} value={kpi.trendValue} />
        <StatusDot status={kpi.status} />
      </div>
    </button>
  );
}

// Item Bureau
function BureauItem({ 
  bureau, 
  onClick 
}: { 
  bureau: ReturnType<typeof calculateBureauPerformance>[0]; 
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
    >
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
          {bureau.bureauName}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">
          {bureau.pending} en attente · {bureau.overdue} retard
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn(
          'text-xs font-medium',
          bureau.score >= 70 ? 'text-slate-600 dark:text-slate-400' :
          bureau.score >= 50 ? 'text-amber-600 dark:text-amber-400' :
          'text-amber-700 dark:text-amber-500'
        )}>
          {bureau.score}
        </span>
      </div>
    </button>
  );
}

// Item Alerte
function AlertItem({ 
  alert, 
  onClick 
}: { 
  alert: ReturnType<typeof detectAlerts>[0]; 
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
    >
      <AlertCircle className={cn(
        'w-3.5 h-3.5 mt-0.5 flex-shrink-0',
        alert.type === 'critical' ? 'text-amber-500' : 'text-slate-400'
      )} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
          {alert.title}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
          {alert.description}
        </div>
      </div>
    </button>
  );
}

// Indicateur de tendance
function TrendIndicator({ trend, value }: { trend: 'up' | 'down' | 'stable'; value: number }) {
  if (trend === 'stable') {
    return <Minus className="w-3 h-3 text-slate-300" />;
  }
  
  const isPositive = trend === 'up';
  const color = isPositive ? 'text-emerald-500' : 'text-amber-500';
  
  return (
    <div className={cn('flex items-center gap-0.5 text-[10px] font-medium', color)}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      <span>{Math.abs(value)}%</span>
    </div>
  );
}

// Point de statut
function StatusDot({ status }: { status: 'good' | 'warning' | 'critical' }) {
  return (
    <div className={cn(
      'w-1.5 h-1.5 rounded-full',
      status === 'good' ? 'bg-emerald-400' :
      status === 'warning' ? 'bg-amber-400' :
      'bg-amber-500'
    )} />
  );
}

