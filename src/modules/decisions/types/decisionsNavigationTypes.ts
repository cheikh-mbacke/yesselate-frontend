/**
 * Types pour la navigation à 3 niveaux du module Decisions
 */

export type DecisionsMainCategory =
  | 'overview'
  | 'pending'
  | 'critical'
  | 'strategique'
  | 'operationnel'
  | 'approved'
  | 'history'
  | 'analytics'
  | 'types';

export type DecisionsSubCategory =
  | 'all'
  | 'recent'
  | 'urgent'
  | 'normales'
  | 'critiques'
  | 'en-attente'
  | 'approuvees'
  | 'recentes'
  | 'anciennes'
  | 'chronologique'
  | 'par-type'
  | 'traces'
  | 'rapports'
  | 'all';

export type DecisionsSubSubCategory =
  | 'projets'
  | 'budget'
  | 'planning'
  | 'contract'
  | 'resource'
  | 'all';

export interface DecisionsNavItem {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  children?: DecisionsNavItem[];
}

