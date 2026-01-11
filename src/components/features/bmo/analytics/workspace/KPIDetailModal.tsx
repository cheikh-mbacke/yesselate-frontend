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
  const { data: kpiResponse, isLoading, error } = useKpi(kpiId || '');
  const kpiData = kpiResponse?.kpi;

  // Reset tab on open
  useEffect(() => {
    if (open) {
      setActiveTab('overview');
    }
  }, [open]);

  if (!open || !kpiId) return null;

  if (isLoading) {
    return (
      <FluentModal open={open} onClose={onClose} title="Chargement..." maxWidth="xl" dark>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </FluentModal>
    );
  }

  if (error || !kpiData) {
    return (
      <FluentModal open={open} onClose={onClose} title="Erreur" maxWidth="xl" dark>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-slate-400">
            Impossible de charger les détails du KPI
          </p>
        </div>
      </FluentModal>
    );
  }

  const statusIcon = {
    success: <CheckCircle2 className="w-5 h-5 text-green-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    critical: <XCircle className="w-5 h-5 text-red-400" />,
    neutral: <Minus className="w-5 h-5 text-slate-400" />,
  }[kpiData.status || 'neutral'];

  const trendIcon = kpiData.trend === 'up' 
    ? <TrendingUp className="w-4 h-4 text-emerald-400" />
    : kpiData.trend === 'down'
    ? <TrendingDown className="w-4 h-4 text-red-400" />
    : <Minus className="w-4 h-4 text-slate-400" />;
  
  // Helper pour accéder aux valeurs avec fallbacks
  const currentValue = typeof kpiData.value === 'number' ? kpiData.value : parseFloat(String(kpiData.value)) || 0;
  const targetValue = kpiData.target ? (typeof kpiData.target === 'number' ? kpiData.target : parseFloat(String(kpiData.target)) || 0) : 0;
  const changePercent = kpiData.trendValue || kpiData.change || 0;
  
  // Extensions pour compatibilité avec données enrichies (metadata, history, etc.)
  const kpiExtended = kpiData as any;

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          {statusIcon}
          <div>
            <h2 className="text-lg font-semibold text-slate-100">{kpiData.name}</h2>
            <p className="text-xs text-slate-400">{kpiData.category || 'N/A'} • ID: {kpiData.id}</p>
          </div>
        </div>
      }
      maxWidth="xl"
      noPadding
      dark
    >
      <ErpModalLayout
        className="h-full"
        header={
          <>
            {/* Actions Header */}
            <div className="flex items-center justify-between p-4 bg-slate-800/30 border-b border-slate-700/50">
              <div className="flex items-center gap-4">
                {/* Valeur actuelle */}
                <div>
                  <p className="text-xs text-slate-400">Valeur actuelle</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-100">
                      {currentValue}
                    </span>
                    {kpiData.unit && (
                      <span className="text-sm text-slate-400">{kpiData.unit}</span>
                    )}
                  </div>
                </div>

                {/* Objectif */}
                <div className="pl-4 border-l border-slate-700/50">
                  <p className="text-xs text-slate-400">Objectif</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-slate-300">
                      {targetValue}
                    </span>
                    {kpiData.unit && (
                      <span className="text-sm text-slate-400">{kpiData.unit}</span>
                    )}
                  </div>
                </div>

                {/* Tendance */}
                <div className="pl-4 border-l border-slate-700/50">
                  <p className="text-xs text-slate-400">Tendance</p>
                  <div className="flex items-center gap-2">
                    {trendIcon}
                    <span className={cn(
                      'text-lg font-semibold',
                      changePercent > 0 ? 'text-emerald-400' : changePercent < 0 ? 'text-red-400' : 'text-slate-400'
                    )}>
                      {changePercent > 0 ? '+' : ''}{changePercent}%
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
            <div className="flex gap-2 px-4 bg-slate-900/60">
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
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
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
          <div className="flex items-center justify-between p-4 bg-slate-900/60">
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
              <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-slate-200">
                  <Info className="w-4 h-4 text-blue-400" />
                  Description
                </h3>
                <p className="text-sm text-slate-400">
                  {kpiExtended.metadata?.description || kpiData.description || 'Aucune description disponible'}
                </p>
              </div>

              {/* Métadonnées */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                  <h4 className="text-xs font-semibold text-slate-300 mb-3">INFORMATIONS</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Catégorie</span>
                      <Badge variant="default">{kpiData.category}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Propriétaire</span>
                      <span className="font-medium text-slate-200">{kpiExtended.metadata?.owner || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fréquence</span>
                      <span className="font-medium text-slate-200">{kpiExtended.metadata?.updateFrequency || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Source</span>
                      <span className="font-medium text-slate-200">{kpiExtended.metadata?.dataSource || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                  <h4 className="text-xs font-semibold text-slate-300 mb-3">SEUILS</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Succès</span>
                      <Badge variant="success">≥ {kpiExtended.metadata?.threshold?.success || 90}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Attention</span>
                      <Badge variant="warning">≥ {kpiExtended.metadata?.threshold?.warning || 80}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Critique</span>
                      <Badge variant="urgent">≤ {kpiExtended.metadata?.threshold?.critical || 70}%</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formule */}
              {kpiExtended.metadata?.formula && (
                <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                  <h4 className="text-xs font-semibold text-slate-300 mb-2">FORMULE DE CALCUL</h4>
                  <code className="text-sm font-mono text-blue-400">
                    {kpiExtended.metadata.formula}
                  </code>
                </div>
              )}

              {/* Dernière mise à jour */}
              <div className="text-xs text-slate-400 text-center">
                Dernière mise à jour: {new Date(kpiExtended.metadata?.lastCalculated || kpiData.lastUpdate || Date.now()).toLocaleString('fr-FR')}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <InteractiveChart
                title="Évolution sur 30 jours"
                data={kpiExtended.history?.map((h: any) => ({
                  name: new Date(h.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
                  value: h.value,
                  target: targetValue,
                })) || kpiData.sparkline?.map((val, idx) => ({
                  name: new Date(Date.now() - (30 - idx) * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
                  value: val,
                  target: targetValue,
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
                  { label: 'Minimum', value: kpiExtended.history?.length ? Math.min(...(kpiExtended.history.map((h: any) => h.value))) : (kpiData.sparkline?.length ? Math.min(...kpiData.sparkline) : currentValue) },
                  { label: 'Maximum', value: kpiExtended.history?.length ? Math.max(...(kpiExtended.history.map((h: any) => h.value))) : (kpiData.sparkline?.length ? Math.max(...kpiData.sparkline) : currentValue) },
                  { label: 'Moyenne', value: kpiExtended.history?.length ? (kpiExtended.history.reduce((sum: number, h: any) => sum + h.value, 0) / kpiExtended.history.length).toFixed(1) : (kpiData.sparkline?.length ? (kpiData.sparkline.reduce((a, b) => a + b, 0) / kpiData.sparkline.length).toFixed(1) : currentValue.toFixed(1)) },
                  { label: 'Écart-type', value: '2.3' },
                ].map((stat, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/30 text-center">
                    <p className="text-xs text-slate-400">{stat.label}</p>
                    <p className="text-lg font-bold text-slate-100">
                      {stat.value}{kpiData.unit || ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bureaux' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-200">Performance par Bureau</h3>
              {kpiExtended.affectedBureaux?.map((bureau: any) => (
                <div
                  key={bureau.id}
                  className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-200">{bureau.name}</h4>
                      <p className="text-xs text-slate-400">Code: {bureau.id.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-100">{bureau.value}{kpiData.unit || ''}</p>
                      <Badge variant={
                        bureau.value >= (kpiExtended.metadata?.threshold?.success || 90) ? 'success' :
                        bureau.value >= (kpiExtended.metadata?.threshold?.warning || 80) ? 'warning' : 'urgent'
                      }>
                        {targetValue > 0 ? ((bureau.value / targetValue) * 100).toFixed(0) : '0'}% de l'objectif
                      </Badge>
                    </div>
                  </div>
                  <div className="relative h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'absolute inset-y-0 left-0 rounded-full transition-all',
                        bureau.value >= (kpiExtended.metadata?.threshold?.success || 90)
                          ? 'bg-green-500'
                          : bureau.value >= (kpiExtended.metadata?.threshold?.warning || 80)
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      )}
                      style={{ width: `${Math.min(targetValue > 0 ? (bureau.value / targetValue) * 100 : 0, 100)}%` }}
                    />
                  </div>
                </div>
              )) || (
                <p className="text-center text-slate-400 py-8">Aucune donnée par bureau disponible</p>
              )}
            </div>
          )}

          {activeTab === 'related' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-200">KPIs Corrélés</h3>
              {kpiExtended.relatedKPIs?.map((related: any) => (
                <div
                  key={related.id}
                  className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:border-blue-500 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center',
                        related.correlation > 0.7 ? 'bg-green-900/20' :
                        related.correlation > 0.5 ? 'bg-amber-900/20' :
                        'bg-slate-800'
                      )}>
                        <Activity className={cn(
                          'w-6 h-6',
                          related.correlation > 0.7 ? 'text-green-400' :
                          related.correlation > 0.5 ? 'text-amber-400' :
                          'text-slate-400'
                        )} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-200">{related.name}</h4>
                        <p className="text-xs text-slate-400">
                          Corrélation: {(related.correlation * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              )) || (
                <p className="text-center text-slate-400 py-8">Aucun KPI corrélé trouvé</p>
              )}
            </div>
          )}
        </div>
      </ErpModalLayout>
    </FluentModal>
  );
}