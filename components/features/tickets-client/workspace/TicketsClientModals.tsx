'use client';

import React, { useState, useMemo } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { cn } from '@/lib/utils';
import {
  X,
  Download,
  Clock,
  AlertCircle,
  ArrowUpCircle,
  Users,
  Building2,
  BarChart2,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  Filter,
  ChevronRight,
  ChevronDown,
  Settings,
  Bell,
  Zap,
  Target,
  Shield,
  Award,
  Info,
  HelpCircle,
} from 'lucide-react';

// Exporter les nouveaux composants modaux
export { TicketsClientClientsManagerModal } from './TicketsClientClientsManager';
export { TicketsClientChantiersManagerModal } from './TicketsClientChantiersManager';
export { TicketsClientBulkActionsModal } from './TicketsClientBulkActions';
export { TicketsClientSettingsModal } from './TicketsClientSettings';

// ============================================
// STATS MODAL
// ============================================

interface StatsModalProps {
  open: boolean;
  onClose: () => void;
}

export function TicketsClientStatsModal({ open, onClose }: StatsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'sla' | 'categories' | 'trends'>('overview');

  const tabs = [
    { id: 'overview', label: "Vue d'ensemble", icon: BarChart2 },
    { id: 'sla', label: 'Performance SLA', icon: Clock },
    { id: 'categories', label: 'Par catégorie', icon: Target },
    { id: 'trends', label: 'Tendances', icon: TrendingUp },
  ] as const;

  return (
    <FluentModal
      open={open}
      title="Statistiques & Analytics"
      onClose={onClose}
      className="max-w-4xl"
    >
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-slate-200 dark:border-slate-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total tickets', value: 1234, change: '+12%', positive: true },
              { label: 'Temps résolution moy.', value: '4.2h', change: '-18%', positive: true },
              { label: 'Taux satisfaction', value: '92%', change: '+3%', positive: true },
              { label: 'Tickets ouverts', value: 47, change: '+5', positive: false },
            ].map((kpi, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50"
              >
                <div className="text-sm text-slate-500 mb-1">{kpi.label}</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {kpi.value}
                </div>
                <div
                  className={cn(
                    'text-sm flex items-center gap-1 mt-1',
                    kpi.positive ? 'text-emerald-600' : 'text-rose-600'
                  )}
                >
                  {kpi.positive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {kpi.change}
                </div>
              </div>
            ))}
          </div>

          {/* Graphique placeholder */}
          <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
            <div className="h-48 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <BarChart2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Graphique d'évolution des tickets</p>
              </div>
            </div>
          </div>

          {/* Top catégories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="font-medium mb-3">Top catégories</h4>
              <div className="space-y-2">
                {[
                  { name: 'Réclamation qualité', count: 45, pct: 35 },
                  { name: 'Retard livraison', count: 32, pct: 25 },
                  { name: 'Facturation', count: 28, pct: 22 },
                  { name: 'Demande modification', count: 23, pct: 18 },
                ].map((cat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>{cat.name}</span>
                        <span className="text-slate-500">{cat.count}</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full"
                          style={{ width: `${cat.pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="font-medium mb-3">Top chantiers</h4>
              <div className="space-y-2">
                {[
                  { name: 'Résidence Les Jardins', count: 12 },
                  { name: 'Centre Commercial Nord', count: 8 },
                  { name: 'Immeuble Horizon', count: 6 },
                  { name: 'Lotissement Colline', count: 4 },
                ].map((site, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1">
                    <span>{site.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                      {site.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sla' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800">
              <div className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">Dans les délais</div>
              <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">94%</div>
            </div>
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
              <div className="text-sm text-amber-600 dark:text-amber-400 mb-1">Proche limite</div>
              <div className="text-3xl font-bold text-amber-700 dark:text-amber-300">4%</div>
            </div>
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-800">
              <div className="text-sm text-rose-600 dark:text-rose-400 mb-1">Hors délai</div>
              <div className="text-3xl font-bold text-rose-700 dark:text-rose-300">2%</div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <h4 className="font-medium mb-4">Performance SLA par priorité</h4>
            <div className="space-y-4">
              {[
                { priority: 'Critique', sla: '4h', avg: '3.2h', compliance: 98 },
                { priority: 'Haute', sla: '8h', avg: '6.5h', compliance: 95 },
                { priority: 'Normale', sla: '24h', avg: '18h', compliance: 92 },
                { priority: 'Basse', sla: '72h', avg: '48h', compliance: 97 },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium">{item.priority}</div>
                  <div className="flex-1">
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          item.compliance >= 95 ? 'bg-emerald-500' : item.compliance >= 90 ? 'bg-amber-500' : 'bg-rose-500'
                        )}
                        style={{ width: `${item.compliance}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 w-16 text-right">{item.compliance}%</div>
                  <div className="text-sm text-slate-400 w-24 text-right">
                    {item.avg} / {item.sla}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(activeTab === 'categories' || activeTab === 'trends') && (
        <div className="h-64 flex items-center justify-center text-slate-500">
          <div className="text-center">
            <BarChart2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Contenu {activeTab === 'categories' ? 'Catégories' : 'Tendances'}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-6">
        <FluentButton variant="secondary" onClick={onClose}>
          Fermer
        </FluentButton>
        <FluentButton variant="primary">
          <Download className="w-4 h-4 mr-2" />
          Exporter rapport
        </FluentButton>
      </div>
    </FluentModal>
  );
}

// ============================================
// EXPORT MODAL
// ============================================

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  onExport?: (format: string, options: Record<string, any>) => void;
}

export function TicketsClientExportModal({ open, onClose, onExport }: ExportModalProps) {
  const [format, setFormat] = useState<'csv' | 'excel' | 'pdf' | 'json'>('excel');
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('month');
  const [includeResolved, setIncludeResolved] = useState(true);

  return (
    <FluentModal open={open} title="Exporter les tickets" onClose={onClose}>
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
            Format
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['csv', 'excel', 'pdf', 'json'].map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f as any)}
                className={cn(
                  'p-3 rounded-lg border text-center text-sm font-medium transition-all',
                  format === f
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-600'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                )}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
            Période
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-orange-500/30"
          >
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
            <option value="all">Tout</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="includeResolved"
            checked={includeResolved}
            onChange={(e) => setIncludeResolved(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
          />
          <label htmlFor="includeResolved" className="text-sm text-slate-700 dark:text-slate-300">
            Inclure les tickets résolus/clos
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <FluentButton variant="secondary" onClick={onClose}>
          Annuler
        </FluentButton>
        <FluentButton
          variant="primary"
          onClick={() => {
            onExport?.(format, { period, includeResolved });
            onClose();
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Télécharger
        </FluentButton>
      </div>
    </FluentModal>
  );
}

// ============================================
// SLA MANAGER MODAL
// ============================================

interface SLAManagerModalProps {
  open: boolean;
  onClose: () => void;
}

export function TicketsClientSLAManagerModal({ open, onClose }: SLAManagerModalProps) {
  const [activeTab, setActiveTab] = useState<'config' | 'alerts' | 'history'>('config');

  const slaConfigs = [
    { priority: 'Critique', responseTime: '1h', resolutionTime: '4h', escalationTime: '2h' },
    { priority: 'Haute', responseTime: '2h', resolutionTime: '8h', escalationTime: '4h' },
    { priority: 'Normale', responseTime: '4h', resolutionTime: '24h', escalationTime: '12h' },
    { priority: 'Basse', responseTime: '8h', resolutionTime: '72h', escalationTime: '48h' },
  ];

  return (
    <FluentModal
      open={open}
      title="Gestionnaire SLA"
      onClose={onClose}
      className="max-w-3xl"
    >
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'config', label: 'Configuration', icon: Settings },
          { id: 'alerts', label: 'Alertes', icon: Bell },
          { id: 'history', label: 'Historique', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'config' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Info className="w-5 h-5" />
              <span className="font-medium">Configuration des délais SLA par priorité</span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Définissez les temps de réponse, résolution et escalade pour chaque niveau de priorité.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-slate-500 border-b border-slate-200 dark:border-slate-700">
                  <th className="pb-3 font-medium">Priorité</th>
                  <th className="pb-3 font-medium">Temps réponse</th>
                  <th className="pb-3 font-medium">Temps résolution</th>
                  <th className="pb-3 font-medium">Escalade auto</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {slaConfigs.map((config, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3">
                      <span
                        className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          config.priority === 'Critique'
                            ? 'bg-rose-100 text-rose-700'
                            : config.priority === 'Haute'
                            ? 'bg-amber-100 text-amber-700'
                            : config.priority === 'Normale'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        )}
                      >
                        {config.priority}
                      </span>
                    </td>
                    <td className="py-3">
                      <input
                        type="text"
                        defaultValue={config.responseTime}
                        className="w-20 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-sm"
                      />
                    </td>
                    <td className="py-3">
                      <input
                        type="text"
                        defaultValue={config.resolutionTime}
                        className="w-20 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-sm"
                      />
                    </td>
                    <td className="py-3">
                      <input
                        type="text"
                        defaultValue={config.escalationTime}
                        className="w-20 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-sm"
                      />
                    </td>
                    <td className="py-3">
                      <button className="text-slate-400 hover:text-slate-600">
                        <Settings className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {[
            { level: '50%', description: 'Alerte préventive', color: 'amber' },
            { level: '75%', description: 'Alerte critique', color: 'orange' },
            { level: '100%', description: 'Dépassement SLA', color: 'rose' },
          ].map((alert, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    alert.color === 'amber'
                      ? 'bg-amber-100 text-amber-600'
                      : alert.color === 'orange'
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-rose-100 text-rose-600'
                  )}
                >
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium">{alert.level} du temps écoulé</div>
                  <div className="text-sm text-slate-500">{alert.description}</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-2 max-h-80 overflow-auto">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-3">
                <div className={cn('w-2 h-2 rounded-full', i < 2 ? 'bg-rose-500' : 'bg-emerald-500')} />
                <div>
                  <span className="font-mono text-sm text-slate-500">TKT-{1000 + i}</span>
                  <span className="mx-2">•</span>
                  <span className="text-sm">
                    {i < 2 ? 'SLA dépassé' : 'Résolu dans les délais'}
                  </span>
                </div>
              </div>
              <span className="text-xs text-slate-400">Il y a {i + 1}h</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2 mt-6">
        <FluentButton variant="secondary" onClick={onClose}>
          Annuler
        </FluentButton>
        <FluentButton variant="primary">
          Enregistrer
        </FluentButton>
      </div>
    </FluentModal>
  );
}

// ============================================
// ESCALADE CENTER MODAL
// ============================================

interface EscaladeCenterModalProps {
  open: boolean;
  onClose: () => void;
}

export function TicketsClientEscaladeCenterModal({ open, onClose }: EscaladeCenterModalProps) {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const escaladeLevels = [
    {
      level: 1,
      title: 'Responsable équipe',
      responsible: 'Chef d\'équipe chantier',
      delay: '2h après création',
      tickets: 3,
    },
    {
      level: 2,
      title: 'Directeur technique',
      responsible: 'Direction technique',
      delay: '4h sans résolution N1',
      tickets: 1,
    },
    {
      level: 3,
      title: 'Direction générale',
      responsible: 'DG / Comité de direction',
      delay: '8h sans résolution N2',
      tickets: 0,
    },
    {
      level: 4,
      title: 'Comité de crise',
      responsible: 'Cellule de crise',
      delay: 'Critique non résolu 24h',
      tickets: 0,
    },
  ];

  return (
    <FluentModal
      open={open}
      title="Centre d'escalade"
      onClose={onClose}
      className="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Info banner */}
        <div className="p-4 rounded-xl border border-purple-200 bg-purple-50 dark:bg-purple-950/30 dark:border-purple-800">
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <ArrowUpCircle className="w-5 h-5" />
            <span className="font-medium">4 tickets actuellement escaladés</span>
          </div>
          <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
            Les escalades automatiques sont déclenchées selon les règles SLA configurées.
          </p>
        </div>

        {/* Escalade levels */}
        <div className="space-y-3">
          {escaladeLevels.map((level) => (
            <div
              key={level.level}
              className={cn(
                'p-4 rounded-xl border transition-all cursor-pointer',
                selectedLevel === level.level
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              )}
              onClick={() => setSelectedLevel(level.level)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center font-bold',
                      level.level === 1
                        ? 'bg-blue-100 text-blue-600'
                        : level.level === 2
                        ? 'bg-amber-100 text-amber-600'
                        : level.level === 3
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-rose-100 text-rose-600'
                    )}
                  >
                    N{level.level}
                  </div>
                  <div>
                    <div className="font-medium">{level.title}</div>
                    <div className="text-sm text-slate-500">{level.responsible}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-slate-500">{level.delay}</div>
                    {level.tickets > 0 && (
                      <div className="text-sm font-medium text-orange-600">
                        {level.tickets} ticket{level.tickets > 1 ? 's' : ''} en cours
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Matrix d'escalade */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <h4 className="font-medium mb-3">Matrice d'escalade par catégorie</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-700">
                  <th className="pb-2">Catégorie</th>
                  <th className="pb-2">N1</th>
                  <th className="pb-2">N2</th>
                  <th className="pb-2">N3</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cat: 'Sécurité', n1: 'Immédiat', n2: '1h', n3: '2h' },
                  { cat: 'Qualité', n1: '2h', n2: '4h', n3: '8h' },
                  { cat: 'Retard', n1: '4h', n2: '8h', n3: '24h' },
                  { cat: 'Facturation', n1: '8h', n2: '24h', n3: '48h' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-2 font-medium">{row.cat}</td>
                    <td className="py-2">{row.n1}</td>
                    <td className="py-2">{row.n2}</td>
                    <td className="py-2">{row.n3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <FluentButton variant="secondary" onClick={onClose}>
          Fermer
        </FluentButton>
        <FluentButton variant="primary">
          <Settings className="w-4 h-4 mr-2" />
          Configurer
        </FluentButton>
      </div>
    </FluentModal>
  );
}

// ============================================
// HELP MODAL
// ============================================

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export function TicketsClientHelpModal({ open, onClose }: HelpModalProps) {
  const shortcuts = [
    { keys: '⌘ K', action: 'Palette de commandes' },
    { keys: '⌘ N', action: 'Nouveau ticket' },
    { keys: '⌘ 1', action: 'Tickets nouveaux' },
    { keys: '⌘ 2', action: 'Tickets en cours' },
    { keys: '⌘ 3', action: 'Tickets critiques' },
    { keys: '⌘ 4', action: 'Tickets escaladés' },
    { keys: '⌘ 5', action: 'Hors délai SLA' },
    { keys: '⌘ S', action: 'Statistiques' },
    { keys: '⌘ E', action: 'Exporter' },
    { keys: '⌘ R', action: 'Actualiser' },
    { keys: '⌘ ←', action: 'Précédent (historique)' },
    { keys: '⌘ →', action: 'Suivant (historique)' },
    { keys: 'Échap', action: 'Fermer modale/panneau' },
    { keys: '?', action: 'Afficher cette aide' },
  ];

  return (
    <FluentModal open={open} title="Aide & Raccourcis clavier" onClose={onClose}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-slate-600 dark:text-slate-400">{s.action}</span>
              <kbd className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5 text-slate-400" />
            <span className="font-medium">Besoin d'aide ?</span>
          </div>
          <p className="text-sm text-slate-500">
            Consultez la documentation complète ou contactez le support technique pour toute question.
          </p>
          <div className="flex gap-2 mt-3">
            <FluentButton variant="secondary" size="sm">
              Documentation
            </FluentButton>
            <FluentButton variant="secondary" size="sm">
              Support
            </FluentButton>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <FluentButton variant="primary" onClick={onClose}>
          Compris
        </FluentButton>
      </div>
    </FluentModal>
  );
}

