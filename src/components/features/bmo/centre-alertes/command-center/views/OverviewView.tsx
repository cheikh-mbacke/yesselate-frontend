/**
 * Vue d'ensemble - Centre d'Alertes
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTable } from '../AlertTable';
import { useCentreAlertesCommandCenterStore } from '@/lib/stores/centreAlertesCommandCenterStore';
import type { Alert } from '@/lib/stores/centreAlertesCommandCenterStore';
import { 
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  Filter,
  ArrowUpRight,
} from 'lucide-react';

// Mock data - À remplacer par les vraies données
const mockCriticalAlerts: Alert[] = [];
const mockUrgentAlerts: Alert[] = [];

export function OverviewView() {
  const { openModal, filters } = useCentreAlertesCommandCenterStore();
  const [criticalAlerts, setCriticalAlerts] = useState<Alert[]>(mockCriticalAlerts);
  const [urgentAlerts, setUrgentAlerts] = useState<Alert[]>(mockUrgentAlerts);
  const [alertsByDomain, setAlertsByDomain] = useState<Record<string, number>>({});

  // TODO: Charger les données depuis l'API
  useEffect(() => {
    // Placeholder pour le chargement des données
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Actions rapides */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-200">Vue d'ensemble</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openModal('filters')}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtrer
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => openModal('treat')}
            className="gap-2 bg-amber-500 hover:bg-amber-600"
          >
            Traiter maintenant
          </Button>
        </div>
      </div>

      {/* Bloc Alertes critiques */}
      <div className="bg-slate-800/50 rounded-lg border border-red-500/30 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <h3 className="text-lg font-semibold text-slate-200">Alertes critiques</h3>
            <span className="text-sm text-slate-400">({criticalAlerts.length})</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {/* Navigate to critical tab */}}
            className="gap-2"
          >
            Voir tout
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
        {criticalAlerts.length > 0 ? (
          <AlertTable
            alerts={criticalAlerts.slice(0, 10)}
            onAlertClick={(alert) => openModal('alert-detail', { alert })}
          />
        ) : (
          <p className="text-sm text-slate-400">Aucune alerte critique</p>
        )}
      </div>

      {/* Bloc Alertes urgentes */}
      <div className="bg-slate-800/50 rounded-lg border border-orange-500/30 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-slate-200">Alertes urgentes</h3>
            <span className="text-sm text-slate-400">({urgentAlerts.length})</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {/* Navigate to operational tab */}}
            className="gap-2"
          >
            Voir tout
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
        {urgentAlerts.length > 0 ? (
          <AlertTable
            alerts={urgentAlerts.slice(0, 10)}
            onAlertClick={(alert) => openModal('alert-detail', { alert })}
          />
        ) : (
          <p className="text-sm text-slate-400">Aucune alerte urgente</p>
        )}
      </div>

      {/* Bloc Alertes par domaine */}
      <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-slate-200">Alertes par domaine</h3>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(alertsByDomain).map(([domain, count]) => (
            <div
              key={domain}
              className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 cursor-pointer hover:bg-slate-800/50 transition-colors"
              onClick={() => {/* Filter by domain */}}
            >
              <div className="text-2xl mb-1">{domain}</div>
              <div className="text-2xl font-semibold text-slate-200">{count}</div>
              <div className="text-xs text-slate-400">alertes</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

