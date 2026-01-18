/**
 * Types pour la navigation à 3 niveaux du module Messages Externes
 */

export type MessagesExternesMainCategory =
  | 'overview'
  | 'unread'
  | 'requires_response'
  | 'replied'
  | 'archived'
  | 'by_type'
  | 'by_priority'
  | 'analytics'
  | 'settings';

export type MessagesExternesSubCategory =
  | 'all'
  | 'recent'
  | 'urgent'
  | 'normal'
  | 'low'
  | 'email'
  | 'sms'
  | 'postal'
  | 'all';

export type MessagesExternesSubSubCategory =
  | 'today'
  | 'week'
  | 'month'
  | 'all';

export interface MessagesExternesNavItem {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  children?: MessagesExternesNavItem[];
}

