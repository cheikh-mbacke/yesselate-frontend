/**
 * Configuration de navigation pour le module Delegations
 */

import type { DelegationsMainCategory } from '../types/delegationsTypes';
import {
  LayoutDashboard,
  UserCheck,
  Target,
  Clock,
  CheckCircle2,
  User,
  FolderOpen,
  AlertCircle,
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

export const delegationsNavigationConfig: Record<DelegationsMainCategory, NavNode> = {
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
  active: {
    id: 'active',
    label: 'Actives',
    icon: UserCheck,
    children: [
      {
        id: 'all',
        label: 'Toutes',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all-bureau-finance', label: 'Bureau Finance' },
          { id: 'all-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'recent',
        label: 'Récentes',
        badge: 0,
        children: [
          { id: 'recent-today', label: "Aujourd'hui" },
          { id: 'recent-week', label: 'Cette semaine' },
        ],
      },
      {
        id: 'permanent',
        label: 'Permanentes',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'permanent-bureau-finance', label: 'Bureau Finance' },
          { id: 'permanent-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
    ],
  },
  pending: {
    id: 'pending',
    label: 'En attente',
    icon: Clock,
    children: [
      {
        id: 'all',
        label: 'Toutes',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all-bureau-finance', label: 'Bureau Finance' },
          { id: 'all-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'recent',
        label: 'Récentes',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'recent-today', label: "Aujourd'hui" },
          { id: 'recent-week', label: 'Cette semaine' },
        ],
      },
      {
        id: 'overdue',
        label: 'En retard',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'overdue-critical', label: 'Critiques' },
          { id: 'overdue-moderate', label: 'Modérées' },
        ],
      },
    ],
  },
  completed: {
    id: 'completed',
    label: 'Terminées',
    icon: CheckCircle2,
    children: [
      {
        id: 'recent',
        label: 'Récentes',
        badge: 0,
        children: [
          { id: 'recent-today', label: "Aujourd'hui" },
          { id: 'recent-week', label: 'Cette semaine' },
          { id: 'recent-month', label: 'Ce mois' },
        ],
      },
      {
        id: 'this-month',
        label: 'Ce mois',
        badge: 0,
        children: [
          { id: 'month-bureau-finance', label: 'Bureau Finance' },
          { id: 'month-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'archive',
        label: 'Archives',
        badge: 0,
        children: [
          { id: 'archive-year', label: 'Cette année' },
          { id: 'archive-old', label: 'Anciennes archives' },
        ],
      },
    ],
  },
  'by-employee': {
    id: 'by-employee',
    label: 'Par employé',
    icon: User,
    children: [
      {
        id: 'all',
        label: 'Tous',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all-active', label: 'Actives' },
          { id: 'all-completed', label: 'Terminées' },
        ],
      },
      {
        id: 'active-employees',
        label: 'Employés actifs',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'active-delegations', label: 'Délégations actives' },
          { id: 'active-completed', label: 'Délégations terminées' },
        ],
      },
      {
        id: 'managers',
        label: 'Managers',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'managers-active', label: 'Actives' },
          { id: 'managers-completed', label: 'Terminées' },
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
        id: 'temporary',
        label: 'Temporaire',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'temporary-active', label: 'Actives' },
          { id: 'temporary-completed', label: 'Terminées' },
        ],
      },
      {
        id: 'permanent',
        label: 'Permanente',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'permanent-active', label: 'Actives' },
          { id: 'permanent-completed', label: 'Terminées' },
        ],
      },
      {
        id: 'emergency',
        label: 'Urgence',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'emergency-active', label: 'Actives' },
        ],
      },
    ],
  },
  'by-status': {
    id: 'by-status',
    label: 'Par statut',
    icon: AlertCircle,
    children: [
      {
        id: 'active',
        label: 'Active',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'active-recent', label: 'Récentes' },
          { id: 'active-old', label: 'Anciennes' },
        ],
      },
      {
        id: 'pending',
        label: 'En attente',
        badge: 0,
        children: [
          { id: 'pending-new', label: 'Nouvelles' },
          { id: 'pending-assigned', label: 'Assignées' },
        ],
      },
      {
        id: 'completed',
        label: 'Terminée',
        badge: 0,
        children: [
          { id: 'completed-recent', label: 'Récentes' },
          { id: 'completed-archived', label: 'Archivées' },
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
  const searchIn = parentChildren || Object.values(delegationsNavigationConfig);
  
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

export function getSubCategories(mainCategory: DelegationsMainCategory): NavNode[] {
  return delegationsNavigationConfig[mainCategory]?.children || [];
}

export function getSubSubCategories(mainCategory: DelegationsMainCategory, subCategory: string): NavNode[] {
  const mainNode = delegationsNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

