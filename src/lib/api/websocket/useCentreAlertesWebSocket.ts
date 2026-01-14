/**
 * Hook WebSocket pour le Centre d'Alertes
 * Utilise le hook existant et l'adapte pour le centre-alertes
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAlertsWebSocket, type AlertNotification } from './useAlertsWebSocket';
import { centreAlertesKeys } from '../hooks/useCentreAlertes';

export function useCentreAlertesWebSocket(options?: {
  enableBrowserNotifications?: boolean;
  enableSound?: boolean;
  criticalOnly?: boolean;
}) {
  const queryClient = useQueryClient();
  const { isConnected, lastNotification } = useAlertsWebSocket(options);

  // Invalider les queries du centre-alertes quand une notification arrive
  useEffect(() => {
    if (lastNotification) {
      queryClient.invalidateQueries({ queryKey: centreAlertesKeys.all });
      queryClient.invalidateQueries({ queryKey: centreAlertesKeys.kpis() });
    }
  }, [lastNotification, queryClient]);

  return {
    isConnected,
    lastNotification,
  };
}

