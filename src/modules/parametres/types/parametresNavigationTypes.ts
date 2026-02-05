/**
 * Types pour la navigation à 3 niveaux du module Paramètres
 */

export type ParametresMainCategory =
  | 'general'
  | 'security'
  | 'notifications'
  | 'integrations'
  | 'permissions'
  | 'backup';

export type ParametresSubCategory =
  | 'all'
  | 'profile'
  | 'preferences'
  | 'theme'
  | 'language'
  | 'all';

export type ParametresSubSubCategory =
  | 'users'
  | 'roles'
  | 'policies'
  | 'all';

export interface ParametresNavItem {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  children?: ParametresNavItem[];
}

