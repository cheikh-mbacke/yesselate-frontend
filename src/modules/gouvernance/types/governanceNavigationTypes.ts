/**
 * Types pour la navigation à 3 niveaux du module Gouvernance
 */

export type GovernanceMainCategory =
  | 'strategic'
  | 'attention'
  | 'arbitrages'
  | 'instances'
  | 'compliance';

export type GovernanceSubCategory =
  | 'overview'
  | 'tendances'
  | 'synthese'
  | 'depassements'
  | 'retards'
  | 'ressources'
  | 'escalades'
  | 'decisions'
  | 'en-attente'
  | 'historique'
  | 'reunions'
  | 'indicateurs'
  | 'audit'
  | 'engagements'
  | 'all';

export type GovernanceSubSubCategory =
  | 'projets'
  | 'budget'
  | 'jalons'
  | 'risques'
  | 'validations'
  | 'dg'
  | 'moa-moe'
  | 'transverses'
  | 'all';

export interface GovernanceNavItem {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  children?: GovernanceNavItem[];
}

