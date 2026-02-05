/**
 * Types pour la navigation à 3 niveaux du module API
 * Note: Utilise le store Analytics pour la navigation
 */

export type APIMainCategory =
  | 'overview'
  | 'performance'
  | 'financial'
  | 'trends'
  | 'alerts'
  | 'reports'
  | 'kpis'
  | 'comparison'
  | 'bureaux';

export type APISubCategory =
  | 'all'
  | 'recent'
  | 'endpoints'
  | 'methods'
  | 'status'
  | 'all';

export type APISubSubCategory =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'all';

export interface APINavItem {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  children?: APINavItem[];
}

