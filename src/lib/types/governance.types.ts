/**
 * Types pour la page Governance
 * PHASE 5 : Élimination des types 'any'
 */

import type { Alert } from './alerts.types';
import type { ActionLogType } from './bmo.types';

/**
 * Type pour la fonction de toast
 */
export type ToastFunction = (msg: string, type?: 'success' | 'warning' | 'info' | 'error') => void;

/**
 * Type pour la fonction de log d'action
 */
export interface ActionLogInput {
  userId: string;
  userName: string;
  userRole: string;
  module: string;
  action: ActionLogType;
  targetId?: string;
  targetType?: string;
  details?: string;
}

export type ActionLogFunction = (log: ActionLogInput) => void;

/**
 * Type pour les données de résolution d'alerte
 */
export interface AlertResolveData {
  note?: string;
}

/**
 * Type pour les props d'alerte dans AlertDetailsPanel
 */
export type AlertDetailsPanelAlert = Alert & {
  type: 'system' | 'blocked' | 'payment' | 'contract';
  data?: unknown;
};

