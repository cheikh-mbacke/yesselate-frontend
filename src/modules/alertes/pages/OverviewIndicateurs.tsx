/**
 * Page : Vue d'ensemble > Indicateurs en temps réel
 */

'use client';

import React from 'react';
import { useAlertesStats } from '../hooks';
import { AlertesKPICard } from '../components/AlertesKPICard';
import { AlertTriangle, Clock, CheckCircle2, TrendingUp, AlertCircle, Ban } from 'lucide-react';
import { useAlertesCommandCenterStore } from '@/lib/stores/alertesCommandCenterStore';

export function OverviewIndicateurs() {
  const { data: stats, isLoading } = useAlertesStats();
  const { navigate } = useAlertesCommandCenterStore();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement des indicateurs...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Aucune donnée disponible</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-1">Indicateurs en temps réel</h2>
        <p className="text-sm text-slate-400">
          Vue d'ensemble des alertes actives et des métriques clés
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AlertesKPICard
          icon={AlertTriangle}
          title="Total alertes"
          value={stats.total}
          color="muted"
          onClick={() => navigate('overview', null, null)}
        />
        <AlertesKPICard
          icon={AlertTriangle}
          title="Critiques"
          value={stats.parSeverite.critical}
          color="critical"
          onClick={() => navigate('en-cours', 'critiques', null)}
        />
        <AlertesKPICard
          icon={AlertCircle}
          title="Avertissements"
          value={stats.parSeverite.warning}
          color="warning"
          onClick={() => navigate('en-cours', 'avertissements', null)}
        />
        <AlertesKPICard
          icon={Clock}
          title="SLA dépassés"
          value={stats.slaDepasses}
          color="info"
          onClick={() => navigate('en-cours', 'sla-depasses', null)}
        />
        <AlertesKPICard
          icon={Ban}
          title="Bloqués"
          value={0}
          color="warning"
          onClick={() => navigate('en-cours', 'blocages', null)}
        />
        <AlertesKPICard
          icon={CheckCircle2}
          title="Résolues"
          value={stats.parStatut.resolved}
          color="success"
          onClick={() => navigate('traitements', 'resolues', null)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AlertesKPICard
          icon={Clock}
          title="Temps de réponse moyen"
          value={`${stats.tempsMoyenReponse.toFixed(1)}h`}
          color="info"
          subtitle="Entre création et acquittement"
        />
        <AlertesKPICard
          icon={TrendingUp}
          title="Temps de résolution moyen"
          value={`${stats.tempsMoyenResolution.toFixed(1)}h`}
          color="success"
          subtitle="Entre création et résolution"
        />
      </div>
    </div>
  );
}

