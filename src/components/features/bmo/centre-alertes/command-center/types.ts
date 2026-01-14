/**
 * Types pour le Centre d'Alertes
 */

import type { Alert, AlertSeverity, AlertStatus, AlertSource } from '@/lib/stores/centreAlertesCommandCenterStore';

export type { Alert, AlertSeverity, AlertStatus, AlertSource };

export interface AlertCategory {
  id: string;
  label: string;
  icon: string;
  count?: number;
  color: string;
}

export interface AlertModule {
  id: AlertSource;
  label: string;
  icon: string;
  color: string;
  path: string;
}

