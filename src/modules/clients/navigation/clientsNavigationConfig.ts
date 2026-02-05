/**
 * Configuration de navigation pour le module Clients
 */

import type { ClientsMainCategory } from '../types/clientsTypes';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserX,
  Crown,
  Sparkles,
  FolderOpen,
  Building2,
  MapPin,
  BarChart3,
} from 'lucide-react';

export interface NavNode {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
  children?: NavNode[];
}

export const clientsNavigationConfig: Record<ClientsMainCategory, NavNode> = {
  overview: {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: LayoutDashboard,
    children: [
      { id: 'dashboard', label: 'Tableau de bord' },
      { id: 'summary', label: 'Synthèse' },
      { id: 'highlights', label: 'Points clés', badge: 0, badgeType: 'warning' },
    ],
  },
  all: {
    id: 'all',
    label: 'Tous les clients',
    icon: Users,
    children: [
      {
        id: 'all-active',
        label: 'Actifs',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'active-bureau-finance', label: 'Bureau Finance' },
          { id: 'active-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'all-inactive',
        label: 'Inactifs',
        badge: 0,
        children: [
          { id: 'inactive-recent', label: 'Récents' },
          { id: 'inactive-archived', label: 'Archivés' },
        ],
      },
      {
        id: 'all-vip',
        label: 'VIP',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'vip-platinum', label: 'Platinum' },
          { id: 'vip-gold', label: 'Gold' },
        ],
      },
    ],
  },
  active: {
    id: 'active',
    label: 'Actifs',
    icon: UserCheck,
    children: [
      {
        id: 'all',
        label: 'Tous',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all-bureau-finance', label: 'Bureau Finance' },
          { id: 'all-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'recent',
        label: 'Récents',
        badge: 0,
        children: [
          { id: 'recent-week', label: 'Cette semaine' },
          { id: 'recent-month', label: 'Ce mois' },
        ],
      },
      {
        id: 'high-value',
        label: 'Valeur élevée',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'high-value-bureau-finance', label: 'Bureau Finance' },
        ],
      },
    ],
  },
  inactive: {
    id: 'inactive',
    label: 'Inactifs',
    icon: UserX,
    children: [
      {
        id: 'all',
        label: 'Tous',
        badge: 0,
        children: [
          { id: 'all-bureau-finance', label: 'Bureau Finance' },
          { id: 'all-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'recent',
        label: 'Récents',
        badge: 0,
        children: [
          { id: 'recent-month', label: 'Ce mois' },
          { id: 'recent-quarter', label: 'Ce trimestre' },
        ],
      },
      {
        id: 'archived',
        label: 'Archivés',
        badge: 0,
        children: [
          { id: 'archived-year', label: 'Cette année' },
          { id: 'archived-old', label: 'Anciennes archives' },
        ],
      },
    ],
  },
  vip: {
    id: 'vip',
    label: 'VIP',
    icon: Crown,
    children: [
      {
        id: 'all',
        label: 'Tous',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'all-platinum', label: 'Platinum' },
          { id: 'all-gold', label: 'Gold' },
          { id: 'all-silver', label: 'Silver' },
        ],
      },
      {
        id: 'platinum',
        label: 'Platinum',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'platinum-active', label: 'Actifs' },
          { id: 'platinum-inactive', label: 'Inactifs' },
        ],
      },
      {
        id: 'gold',
        label: 'Gold',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'gold-active', label: 'Actifs' },
          { id: 'gold-inactive', label: 'Inactifs' },
        ],
      },
    ],
  },
  prospects: {
    id: 'prospects',
    label: 'Prospects',
    icon: Sparkles,
    children: [
      {
        id: 'all',
        label: 'Tous',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all-hot', label: 'Chauds' },
          { id: 'all-warm', label: 'Tièdes' },
          { id: 'all-cold', label: 'Froids' },
        ],
      },
      {
        id: 'hot',
        label: 'Chauds',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'hot-today', label: "Aujourd'hui" },
          { id: 'hot-week', label: 'Cette semaine' },
        ],
      },
      {
        id: 'warm',
        label: 'Tièdes',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'warm-week', label: 'Cette semaine' },
          { id: 'warm-month', label: 'Ce mois' },
        ],
      },
    ],
  },
  'by-type': {
    id: 'by-type',
    label: 'Par type',
    icon: FolderOpen,
    children: [
      {
        id: 'entreprise',
        label: 'Entreprise',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'entreprise-active', label: 'Actives' },
          { id: 'entreprise-inactive', label: 'Inactives' },
        ],
      },
      {
        id: 'particulier',
        label: 'Particulier',
        badge: 0,
        children: [
          { id: 'particulier-active', label: 'Actifs' },
          { id: 'particulier-inactive', label: 'Inactifs' },
        ],
      },
      {
        id: 'institution',
        label: 'Institution',
        badge: 0,
        children: [
          { id: 'institution-active', label: 'Actives' },
        ],
      },
    ],
  },
  'by-sector': {
    id: 'by-sector',
    label: 'Par secteur',
    icon: Building2,
    children: [
      {
        id: 'batiment',
        label: 'Bâtiment',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'batiment-active', label: 'Actifs' },
          { id: 'batiment-inactive', label: 'Inactifs' },
        ],
      },
      {
        id: 'infrastructure',
        label: 'Infrastructure',
        badge: 0,
        children: [
          { id: 'infrastructure-active', label: 'Actifs' },
          { id: 'infrastructure-inactive', label: 'Inactifs' },
        ],
      },
      {
        id: 'amenagement',
        label: 'Aménagement',
        badge: 0,
        children: [
          { id: 'amenagement-active', label: 'Actifs' },
        ],
      },
    ],
  },
  'by-region': {
    id: 'by-region',
    label: 'Par région',
    icon: MapPin,
    children: [
      {
        id: 'bamako',
        label: 'Bamako',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'bamako-active', label: 'Actifs' },
          { id: 'bamako-inactive', label: 'Inactifs' },
        ],
      },
      {
        id: 'regions',
        label: 'Régions',
        badge: 0,
        children: [
          { id: 'regions-active', label: 'Actifs' },
          { id: 'regions-inactive', label: 'Inactifs' },
        ],
      },
    ],
  },
  analytics: {
    id: 'analytics',
    label: 'Analytiques',
    icon: BarChart3,
    children: [
      { id: 'dashboard', label: 'Tableau de bord' },
      { id: 'statistics', label: 'Statistiques' },
      { id: 'trends', label: 'Tendances' },
      { id: 'reports', label: 'Rapports' },
    ],
  },
};

export function findNavNodeById(id: string, parentChildren?: NavNode[]): NavNode | undefined {
  const searchIn = parentChildren || Object.values(clientsNavigationConfig);
  
  for (const node of searchIn) {
    if (node.id === id) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const found = findNavNodeById(id, node.children);
      if (found) return found;
    }
  }
  return undefined;
}

export function getSubCategories(mainCategory: ClientsMainCategory): NavNode[] {
  return clientsNavigationConfig[mainCategory]?.children || [];
}

export function getSubSubCategories(mainCategory: ClientsMainCategory, subCategory: string): NavNode[] {
  const mainNode = clientsNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

