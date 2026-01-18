/**
 * Types pour la navigation à 3 niveaux du module System Logs
 */

export type SystemLogsMainCategory =
  | 'overview'
  | 'by-level'
  | 'by-category'
  | 'security'
  | 'incidents'
  | 'correlation'
  | 'integrity'
  | 'exports'
  | 'advanced-search';

export type SystemLogsSubCategory =
  | 'all'
  | 'critical'
  | 'error'
  | 'warning'
  | 'info'
  | 'debug'
  | 'auth'
  | 'data'
  | 'system'
  | 'api'
  | 'all';

export type SystemLogsSubSubCategory =
  | 'today'
  | 'week'
  | 'month'
  | 'all';

export interface SystemLogsNavItem {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  children?: SystemLogsNavItem[];
}

