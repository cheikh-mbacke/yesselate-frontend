/**
 * Configuration de navigation à 3 niveaux pour le module Messages Externes
 */

import type { MessagesExternesMainCategory } from '../types/messagesExternesNavigationTypes';
import {
  LayoutDashboard,
  Mail,
  MailCheck,
  MailX,
  Archive,
  Tag,
  AlertCircle,
  BarChart3,
  Settings,
} from 'lucide-react';

export interface NavNode {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  children?: NavNode[];
}

export const messagesExternesNavigationConfig: Record<MessagesExternesMainCategory, NavNode> = {
  overview: {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: LayoutDashboard,
    children: [
      { id: 'all', label: 'Tout', children: [{ id: 'summary', label: 'Synthèse' }, { id: 'recent', label: 'Récents', badge: 0, badgeType: 'warning' }] },
    ],
  },
  unread: {
    id: 'unread',
    label: 'Non lus',
    icon: Mail,
    badge: 0,
    badgeType: 'warning',
    children: [
      { id: 'all', label: 'Tous', badge: 0, badgeType: 'warning', children: [{ id: 'today', label: 'Aujourd\'hui' }, { id: 'week', label: 'Cette semaine' }] },
    ],
  },
  requires_response: {
    id: 'requires_response',
    label: 'À répondre',
    icon: MailCheck,
    badge: 0,
    badgeType: 'critical',
    children: [
      { id: 'all', label: 'Tous', badge: 0, badgeType: 'critical', children: [{ id: 'urgent', label: 'Urgents' }, { id: 'normal', label: 'Normaux' }] },
    ],
  },
  replied: {
    id: 'replied',
    label: 'Répondus',
    icon: MailCheck,
    children: [
      { id: 'all', label: 'Tous', children: [{ id: 'recent', label: 'Récents' }, { id: 'old', label: 'Anciens' }] },
    ],
  },
  archived: {
    id: 'archived',
    label: 'Archivés',
    icon: Archive,
    children: [
      { id: 'all', label: 'Tous', children: [{ id: 'month', label: 'Ce mois' }, { id: 'year', label: 'Cette année' }] },
    ],
  },
  by_type: {
    id: 'by_type',
    label: 'Par type',
    icon: Tag,
    children: [
      { id: 'all', label: 'Tous', children: [{ id: 'email', label: 'Email' }, { id: 'sms', label: 'SMS' }, { id: 'postal', label: 'Postal' }] },
    ],
  },
  by_priority: {
    id: 'by_priority',
    label: 'Par priorité',
    icon: AlertCircle,
    children: [
      { id: 'all', label: 'Toutes', children: [{ id: 'urgent', label: 'Urgente' }, { id: 'normal', label: 'Normale' }, { id: 'low', label: 'Basse' }] },
    ],
  },
  analytics: {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    children: [
      { id: 'all', label: 'Tout', children: [{ id: 'stats', label: 'Statistiques' }, { id: 'trends', label: 'Tendances' }, { id: 'reports', label: 'Rapports' }] },
    ],
  },
  settings: {
    id: 'settings',
    label: 'Paramètres',
    icon: Settings,
    children: [{ id: 'all', label: 'Tous' }],
  },
};

export function findNavNodeById(mainCategory: MessagesExternesMainCategory, subCategory?: string, subSubCategory?: string): NavNode | undefined {
  const mainNode = messagesExternesNavigationConfig[mainCategory];
  if (!mainNode) return undefined;
  if (!subCategory) return mainNode;
  const subNode = mainNode.children?.find((child) => child.id === subCategory);
  if (!subNode) return undefined;
  if (!subSubCategory) return subNode;
  return subNode.children?.find((child) => child.id === subSubCategory);
}

export function getSubCategories(mainCategory: MessagesExternesMainCategory): NavNode[] {
  const mainNode = messagesExternesNavigationConfig[mainCategory];
  return mainNode?.children || [];
}

export function getSubSubCategories(mainCategory: MessagesExternesMainCategory, subCategory: string): NavNode[] {
  const mainNode = messagesExternesNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

