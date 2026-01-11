'use client';

/**
 * AlertsDashboardView
 * Vue dashboard pour les alertes analytics avec logs de debug
 */

import { useAlerts } from '@/lib/api/hooks/useAnalytics';

export function AlertsDashboardView() {
  // Utiliser le hook useAlerts existant
  const { data: alertsResponse, isLoading, error } = useAlerts();

  // Debug
  console.log('🔍 Alerts Loading:', isLoading);
  console.log('📦 Alerts Data:', alertsResponse);
  console.log('❌ Alerts Error:', error);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Chargement des alertes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-400 mb-2">Erreur de chargement</p>
          <p className="text-slate-400 text-sm">{error.message || 'Erreur inconnue'}</p>
        </div>
      </div>
    );
  }

  const alerts = alertsResponse?.alerts || [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-200 mb-6">Alertes Analytics</h1>
      
      <div className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
        <p className="text-sm text-slate-400 mb-2">Debug Info:</p>
        <ul className="text-xs text-slate-500 space-y-1">
          <li>Loading: {isLoading ? 'true' : 'false'}</li>
          <li>Alerts count: {alerts.length}</li>
          <li>Has data: {alertsResponse ? 'yes' : 'no'}</li>
          <li>Has error: {error ? 'yes' : 'no'}</li>
        </ul>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400">Aucune alerte disponible</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
            >
              <h3 className="font-semibold text-slate-200 mb-2">{alert.title}</h3>
              <p className="text-sm text-slate-400">{alert.description}</p>
              <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                <span>Severity: {alert.severity}</span>
                <span>Type: {alert.type}</span>
                {alert.triggeredAt && <span>Triggered: {new Date(alert.triggeredAt).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

