/**
 * Types pour la navigation à 3 niveaux du module Echanges Structures
 */

export type EchangesStructuresMainCategory =
  | 'overview'
  | 'ouvert'
  | 'en_traitement'
  | 'escalade'
  | 'resolu'
  | 'critiques'
  | 'en_retard'
  | 'analytics'
  | 'settings';

export type EchangesStructuresSubCategory =
  | 'all'
  | 'demande_info'
  | 'alerte_risque'
  | 'demande_validation'
  | 'signalement_blocage'
  | 'all';

export type EchangesStructuresSubSubCategory =
  | 'urgent'
  | 'normal'
  | 'low'
  | 'all';

export interface EchangesStructuresNavItem {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  children?: EchangesStructuresNavItem[];
}

