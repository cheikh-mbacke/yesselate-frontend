/**
 * Types pour la navigation à 3 niveaux du module IA
 */

export type IAMainCategory =
  | 'modules'
  | 'active'
  | 'training'
  | 'disabled'
  | 'error'
  | 'history'
  | 'analysis'
  | 'prediction'
  | 'anomaly'
  | 'reports'
  | 'recommendations'
  | 'settings';

export type IASubCategory =
  | 'all'
  | 'recent'
  | 'active'
  | 'inactive'
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'all';

export type IASubSubCategory =
  | 'today'
  | 'week'
  | 'month'
  | 'all';

export interface IANavItem {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  children?: IANavItem[];
}

