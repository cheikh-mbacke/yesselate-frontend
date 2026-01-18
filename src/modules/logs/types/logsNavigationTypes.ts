/**
 * Types pour la navigation à 3 niveaux du module Logs
 */

export type LogsMainCategory =
  | 'overview'
  | 'errors'
  | 'warnings'
  | 'system'
  | 'api'
  | 'security'
  | 'audit'
  | 'user-actions'
  | 'analysis';

export type LogsSubCategory =
  | 'all'
  | 'recent'
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'today'
  | 'week'
  | 'month'
  | 'all';

export type LogsSubSubCategory =
  | 'system'
  | 'api'
  | 'database'
  | 'auth'
  | 'business'
  | 'all';

export interface LogsNavItem {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  children?: LogsNavItem[];
}

