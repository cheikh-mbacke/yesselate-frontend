/**
 * Vue Alertes SLA & délais
 * Synchronisé avec le Calendrier
 */

'use client';

import React, { useEffect, useState } from 'react';
import { AlertTable } from '../AlertTable';
import { useCentreAlertesCommandCenterStore } from '@/lib/stores/centreAlertesCommandCenterStore';
import { useSLAAlerts } from '@/lib/api/hooks/useCentreAlertes';
import { getSLAAlertsFromCalendar, convertSLAEventsToAlerts } from '@/lib/api/centre-alertes/calendarSync';
import type { Alert } from '@/lib/stores/centreAlertesCommandCenterStore';
import { Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SLADelaysView() {
  const { openModal, filters } = useCentreAlertesCommandCenterStore();
  const { data: alertsData, isLoading, refetch } = useSLAAlerts(filters);
  const [calendarAlerts, setCalendarAlerts] = useState<Alert[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  // Charger les alertes SLA depuis le calendrier
  useEffect(() => {
    const loadCalendarSLA = async () => {
      setLoadingCalendar(true);
      try {
        const slaData = await getSLAAlertsFromCalendar();
        const allSLAEvents = [...slaData.overdue, ...slaData.atRisk, ...slaData.today];
        const convertedAlerts = convertSLAEventsToAlerts(allSLAEvents);
        setCalendarAlerts(convertedAlerts);
      } catch (error) {
        console.error('Erreur lors du chargement des SLA depuis le calendrier:', error);
      } finally {
        setLoadingCalendar(false);
      }
    };

    loadCalendarSLA();
    // Recharger toutes les 60 secondes
    const interval = setInterval(loadCalendarSLA, 60000);
    return () => clearInterval(interval);
  }, []);

  // Combiner les alertes API et calendrier
  const allAlerts: Alert[] = [
    ...(alertsData?.alerts?.map((a) => ({
      ...a,
      source: 'calendar' as const,
      createdAt: new Date(a.createdAt),
      updatedAt: a.updatedAt ? new Date(a.updatedAt) : undefined,
    })) || []),
    ...calendarAlerts,
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-amber-400" />
          <div>
            <h2 className="text-xl font-semibold text-slate-200">Alertes SLA & délais</h2>
            <p className="text-sm text-slate-400">
              Alertes liées aux SLA et délais (synchronisé avec Calendrier)
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetch();
            // Recharger aussi le calendrier
            getSLAAlertsFromCalendar().then((slaData) => {
              const allSLAEvents = [...slaData.overdue, ...slaData.atRisk, ...slaData.today];
              setCalendarAlerts(convertSLAEventsToAlerts(allSLAEvents));
            });
          }}
          disabled={isLoading || loadingCalendar}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${(isLoading || loadingCalendar) ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Statistiques SLA */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">SLA dépassés</div>
          <div className="text-2xl font-semibold text-red-400">
            {calendarAlerts.filter((a) => a.severity === 'critical').length}
          </div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">SLA en risque</div>
          <div className="text-2xl font-semibold text-orange-400">
            {calendarAlerts.filter((a) => a.severity === 'urgent').length}
          </div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">SLA du jour</div>
          <div className="text-2xl font-semibold text-blue-400">
            {calendarAlerts.filter((a) => a.severity === 'info').length}
          </div>
        </div>
      </div>

      <AlertTable
        alerts={allAlerts}
        loading={isLoading || loadingCalendar}
        onAlertClick={(alert) => openModal('alert-detail', { alert })}
        onAction={(action, alert) => {
          if (action === 'open' && alert.modulePath) {
            window.location.href = alert.modulePath;
          } else {
            openModal('alert-detail', { alert });
          }
        }}
      />
    </div>
  );
}

