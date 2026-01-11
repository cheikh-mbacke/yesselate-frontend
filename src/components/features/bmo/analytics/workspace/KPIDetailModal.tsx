/**
 * KPIDetailModal.tsx
 * ===================
 * 
 * Modal détaillé pour afficher et gérer un KPI spécifique
 * - Graphique historique 30 jours
 * - Métadonnées complètes (formule, seuils, propriétaire)
 * - Performance par bureau
 * - KPIs corrélés
 * - Actions disponibles
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, TrendingDown, Target, Star, Share2, Download,
  Edit, Bell, Info, Users, Calendar, Activity, AlertTriangle,
  CheckCircle2, XCircle, Minus, Loader2, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { InteractiveChart } from '../charts/InteractiveChart';
import { useKpi } from '@/lib/api/hooks/useAnalytics';
import { ErpModalLayout } from '@/lib/bmo/erp/modalLayout';

interface KPIDetailModalProps {
  open: boolean;
  onClose: () => void;
  kpiId: string | null;
}

export function KPIDetailModal({ open, onClose, kpiId }: KPIDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'bureaux' | 'related'>('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAlertConfig, setShowAlertConfig] = useState(false);

  // Fetch KPI details
  const { data: kpiData, isLoading, error } = useKpi(kpiId || '');

  // Reset tab on open
  useEffect(() => {
    if (open) {
      setActiveTab('overview');
    }
  }, [open]);

  if (!open || !kpiId) return null;

  if (isLoading) {
    return (
      <FluentModal open={open} onClose={onClose} title="Chargement..." maxWidth="xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </FluentModal>
    );
  }

  if (error || !kpiData) {
    return (
      <FluentModal open={open} onClose={onClose} title="Erreur" maxWidth="xl">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            Impossible de charger les détails du KPI
          </p>
        </div>
      </FluentModal>
    );
  }

  const statusIcon = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    critical: <XCircle className="w-5 h-5 text-red-500" />,
    neutral: <Minus className="w-5 h-5 text-gray-500" />,
  }[kpiData.status];

  const trendIcon = kpiData.trend === 'up' 
    ? <TrendingUp className="w-4 h-4 text-green-500" />
    : kpiData.trend === 'down'
    ? <TrendingDown className="w-4 h-4 text-red-500" />
    : <Minus className="w-4 h-4 text-gray-500" />;

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          {statusIcon}
          <div>
            <h2 className="text-lg font-semibold">{kpiData.name}</h2>
            <p className="text-xs text-slate-500">{kpiData.category} • ID: {kpiData.id}</p>
          </div>
        </div>
      }
      maxWidth="xl"
      noPadding
    >
      <ErpModalLayout
        className="h-full"
        header={
          <>
            {/* Actions Header */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4">
                {/* Valeur actuelle */}
                <div>
                  <p className="text-xs text-slate-500">Valeur actuelle</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">
                      {kpiData.current}
                    </span>
                    {kpiData.unit && (
                      <span className="text-sm text-slate-500">{kpiData.unit}</span>
                    )}
                  </div>
                </div>

                {/* Objectif */}
                <div className="pl-4 border-l border-slate-300 dark:border-slate-600">
                  <p className="text-xs text-slate-500">Objectif</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-slate-700 dark:text-slate-300">
                      {kpiData.target}
                    </span>
                    {kpiData.unit && (
                      <span className="text-sm text-slate-500">{kpiData.unit}</span>
                    )}
                  </div>
                </div>

                {/* Tendance */}
                <div className="pl-4 border-l border-slate-300 dark:border-slate-600">
                  <p className="text-xs text-slate-500">Tendance</p>
                  <div className="flex items-center gap-2">
                    {trendIcon}
                    <span className={cn(
                      'text-lg font-semibold',
                      kpiData.changePercent > 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {kpiData.changePercent > 0 ? '+' : ''}{kpiData.changePercent}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <FluentButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Star className={cn('w-4 h-4', isFavorite && 'fill-amber-400 text-amber-400')} />
                </FluentButton>
                <FluentButton variant="secondary" size="sm">
                  <Bell className="w-4 h-4" />
                </FluentButton>
                <FluentButton variant="secondary" size="sm">
                  <Share2 className="w-4 h-4" />
                </FluentButton>
                <FluentButton variant="secondary" size="sm">
                  <Download className="w-4 h-4" />
                </FluentButton>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1f1f1f] px-4">
              {[
                { id: 'overview', label: 'Vue d\'ensemble', icon: Info },
                { id: 'history', label: 'Historique', icon: Calendar },
                { id: 'bureaux', label: 'Par Bureau', icon: Users },
                { id: 'related', label: 'KPIs Liés', icon: Activity },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2',
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </>
        }
        footer={
          <div className="flex items-center justify-between p-4 bg-white dark:bg-[#1f1f1f]">
            <FluentButton variant="secondary" onClick={() => setShowAlertConfig(true)}>
              <Bell className="w-4 h-4" />
              Configurer alerte
            </FluentButton>

            <div className="flex items-center gap-3">
              <FluentButton variant="secondary">
                <Edit className="w-4 h-4" />
                Modifier
              </FluentButton>
              <FluentButton variant="primary" onClick={onClose}>
                Fermer
              </FluentButton>
            </div>
          </div>
        }
      >
        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  Description
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {kpiData.metadata?.description}
                </p>
              </div>

              {/* Métadonnées */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-semibold text-slate-500 mb-3">INFORMATIONS</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Catégorie</span>
                      <Badge variant="default">{kpiData.category}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Propriétaire</span>
                      <span className="font-medium">{kpiData.metadata?.owner}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Fréquence</span>
                      <span className="font-medium">{kpiData.metadata?.updateFrequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Source</span>
                      <span className="font-medium">{kpiData.metadata?.dataSource}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-semibold text-slate-500 mb-3">SEUILS</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Succès</span>
                      <Badge variant="success">≥ {kpiData.metadata?.threshold?.success}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Attention</span>
                      <Badge variant="warning">≥ {kpiData.metadata?.threshold?.warning}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Critique</span>
                      <Badge variant="urgent">≤ {kpiData.metadata?.threshold?.critical}%</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formule */}
              {kpiData.metadata?.formula && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <h4 className="text-xs font-semibold text-slate-500 mb-2">FORMULE DE CALCUL</h4>
                  <code className="text-sm font-mono text-blue-600 dark:text-blue-400">
                    {kpiData.metadata.formula}
                  </code>
                </div>
              )}

              {/* Dernière mise à jour */}
              <div className="text-xs text-slate-500 text-center">
                Dernière mise à jour: {new Date(kpiData.metadata?.lastCalculated || Date.now()).toLocaleString('fr-FR')}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <InteractiveChart
                title="Évolution sur 30 jours"
                data={kpiData.history?.map((h: any) => ({
                  name: new Date(h.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
                  value: h.value,
                  target: kpiData.target,
                })) || []}
                type="area"
                dataKeys={['value', 'target']}
                colors={['#3b82f6', '#f59e0b']}
                showTrend={true}
                enableExport={true}
                height={350}
              />

              {/* Stats période */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Minimum', value: Math.min(...(kpiData.history?.map((h: any) => h.value) || [kpiData.current])) },
                  { label: 'Maximum', value: Math.max(...(kpiData.history?.map((h: any) => h.value) || [kpiData.current])) },
                  { label: 'Moyenne', value: (kpiData.history?.reduce((sum: number, h: any) => sum + h.value, 0) / (kpiData.history?.length || 1)).toFixed(1) },
                  { label: 'Écart-type', value: '2.3' },
                ].map((stat, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                    <p className="text-xs text-slate-500">{stat.label}</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {stat.value}{kpiData.unit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bureaux' && (
            <div className="space-y-4">
              <h3 className="font-semibold">Performance par Bureau</h3>
              {kpiData.affectedBureaux?.map((bureau: any) => (
                <div
                  key={bureau.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{bureau.name}</h4>
                      <p className="text-xs text-slate-500">Code: {bureau.id.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{bureau.value}{kpiData.unit}</p>
                      <Badge variant={
                        bureau.value >= kpiData.metadata?.threshold?.success ? 'success' :
                        bureau.value >= kpiData.metadata?.threshold?.warning ? 'warning' : 'urgent'
                      }>
                        {((bureau.value / kpiData.target) * 100).toFixed(0)}% de l'objectif
                      </Badge>
                    </div>
                  </div>
                  <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'absolute inset-y-0 left-0 rounded-full transition-all',
                        bureau.value >= kpiData.metadata?.threshold?.success
                          ? 'bg-green-500'
                          : bureau.value >= kpiData.metadata?.threshold?.warning
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      )}
                      style={{ width: `${Math.min((bureau.value / kpiData.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )) || (
                <p className="text-center text-slate-500 py-8">Aucune donnée par bureau disponible</p>
              )}
            </div>
          )}

          {activeTab === 'related' && (
            <div className="space-y-4">
              <h3 className="font-semibold">KPIs Corrélés</h3>
              {kpiData.relatedKPIs?.map((related: any) => (
                <div
                  key={related.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center',
                        related.correlation > 0.7 ? 'bg-green-100 dark:bg-green-900/20' :
                        related.correlation > 0.5 ? 'bg-amber-100 dark:bg-amber-900/20' :
                        'bg-slate-100 dark:bg-slate-800'
                      )}>
                        <Activity className={cn(
                          'w-6 h-6',
                          related.correlation > 0.7 ? 'text-green-600' :
                          related.correlation > 0.5 ? 'text-amber-600' :
                          'text-slate-600'
                        )} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{related.name}</h4>
                        <p className="text-xs text-slate-500">
                          Corrélation: {(related.correlation * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              )) || (
                <p className="text-center text-slate-500 py-8">Aucun KPI corrélé trouvé</p>
              )}
            </div>
          )}
        </div>
      </ErpModalLayout>
    </FluentModal>
  );
}