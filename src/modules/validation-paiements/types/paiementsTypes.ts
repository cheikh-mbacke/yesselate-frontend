/**
 * Types TypeScript pour le module Validation-Paiements – Maître d'Ouvrage
 */

export type PaiementsMainCategory = 
  | 'overview'
  | 'pending'
  | 'urgent'
  | 'validated'
  | 'rejected'
  | 'scheduled'
  | 'tresorerie'
  | 'fournisseurs'
  | 'audit';

export type PaiementsSubCategory = 
  | 'dashboard'
  | 'kpis'
  | 'alerts'
  | 'all'
  | 'bf-pending'
  | 'dg-pending'
  | 'critical'
  | 'high'
  | 'today'
  | 'week'
  | 'month'
  | 'recent'
  | 'archived'
  | 'upcoming'
  | 'in-progress'
  | 'overview-tresorerie'
  | 'forecast'
  | 'history'
  | 'active'
  | 'watchlist'
  | 'trail'
  | 'reports'
  | 'compliance';

