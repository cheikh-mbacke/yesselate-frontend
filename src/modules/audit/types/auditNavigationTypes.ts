/**
 * Types pour la navigation à 3 niveaux du module Audit
 */

export type AuditMainCategory =
  | 'overview'
  | 'events'
  | 'security'
  | 'compliance'
  | 'performance'
  | 'system-logs'
  | 'traceability'
  | 'reports'
  | 'settings';

export type AuditSubCategory =
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

export type AuditSubSubCategory =
  | 'system'
  | 'user'
  | 'data'
  | 'all';

export interface AuditNavItem {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  children?: AuditNavItem[];
}

