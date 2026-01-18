/**
 * Configuration de navigation pour le module Missions
 */

import type { MissionsMainCategory } from '../types/missionsTypes';
import {
  LayoutDashboard,
  Target,
  PlayCircle,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  AlertCircle,
  TrendingUp,
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

export const missionsNavigationConfig: Record<MissionsMainCategory, NavNode> = {
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
    icon: Target,
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
        id: 'in-progress',
        label: 'En cours',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'in-progress-bureau-finance', label: 'Bureau Finance' },
          { id: 'in-progress-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'at-risk',
        label: 'À risque',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'at-risk-bureau-finance', label: 'Bureau Finance' },
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
        label: 'Récents',
        badge: 0,
        children: [
          { id: 'recent-today', label: "Aujourd'hui" },
          { id: 'recent-week', label: 'Cette semaine' },
        ],
      },
      {
        id: 'old',
        label: 'Anciens',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'old-month', label: 'Ce mois' },
          { id: 'old-archive', label: 'Archives' },
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
  cancelled: {
    id: 'cancelled',
    label: 'Annulées',
    icon: XCircle,
    children: [
      {
        id: 'all',
        label: 'Toutes',
        badge: 0,
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
          { id: 'recent-month', label: 'Ce mois' },
          { id: 'recent-quarter', label: 'Ce trimestre' },
        ],
      },
      {
        id: 'archived',
        label: 'Archivées',
        badge: 0,
        children: [
          { id: 'archived-year', label: 'Cette année' },
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
          { id: 'active-missions', label: 'Missions actives' },
          { id: 'active-completed', label: 'Missions terminées' },
        ],
      },
      {
        id: 'top-performers',
        label: 'Top performers',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'top-active', label: 'Actifs' },
          { id: 'top-completed', label: 'Terminés' },
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
          { id: 'active-in-progress', label: 'En cours' },
          { id: 'active-at-risk', label: 'À risque' },
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
  'by-priority': {
    id: 'by-priority',
    label: 'Par priorité',
    icon: TrendingUp,
    children: [
      {
        id: 'high',
        label: 'Haute',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'high-active', label: 'Actives' },
          { id: 'high-completed', label: 'Terminées' },
        ],
      },
      {
        id: 'medium',
        label: 'Moyenne',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'medium-active', label: 'Actives' },
          { id: 'medium-completed', label: 'Terminées' },
        ],
      },
      {
        id: 'low',
        label: 'Basse',
        badge: 0,
        children: [
          { id: 'low-active', label: 'Actives' },
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
  const searchIn = parentChildren || Object.values(missionsNavigationConfig);
  
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

export function getSubCategories(mainCategory: MissionsMainCategory): NavNode[] {
  return missionsNavigationConfig[mainCategory]?.children || [];
}

export function getSubSubCategories(mainCategory: MissionsMainCategory, subCategory: string): NavNode[] {
  const mainNode = missionsNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

