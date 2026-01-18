/**
 * Configuration de navigation pour le module Substitution
 */

import type { SubstitutionMainCategory } from '../types/substitutionTypes';
import {
  LayoutDashboard,
  AlertTriangle,
  Clock,
  Calendar,
  UserCheck,
  CheckCircle2,
  History,
  TrendingUp,
  Settings,
} from 'lucide-react';

export interface NavNode {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
  children?: NavNode[];
}

export const substitutionNavigationConfig: Record<SubstitutionMainCategory, NavNode> = {
  overview: {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: LayoutDashboard,
    children: [
      {
        id: 'all',
        label: 'Tout',
        children: [
          { id: 'all-today', label: "Aujourd'hui" },
          { id: 'all-week', label: 'Cette semaine' },
        ],
      },
      {
        id: 'summary',
        label: 'Résumé',
        children: [
          { id: 'summary-active', label: 'Actives' },
          { id: 'summary-pending', label: 'En attente' },
        ],
      },
      {
        id: 'today',
        label: "Aujourd'hui",
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'today-critical', label: 'Critiques' },
          { id: 'today-urgent', label: 'Urgentes' },
        ],
      },
    ],
  },
  critical: {
    id: 'critical',
    label: 'Critiques',
    icon: AlertTriangle,
    children: [
      {
        id: 'all',
        label: 'Toutes',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'all-bureau-finance', label: 'Bureau Finance' },
          { id: 'all-bureau-juridique', label: 'Bureau Juridique' },
          { id: 'all-bureau-travaux', label: 'Bureau Travaux' },
        ],
      },
      {
        id: 'urgent',
        label: 'Urgentes',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'urgent-bureau-finance', label: 'Bureau Finance' },
          { id: 'urgent-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'high',
        label: 'Haute priorité',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'high-bureau-finance', label: 'Bureau Finance' },
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
        id: 'no-substitute',
        label: 'Sans substitut',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'no-substitute-bureau-finance', label: 'Bureau Finance' },
          { id: 'no-substitute-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'validation',
        label: 'En validation',
        badge: 0,
        children: [
          { id: 'validation-bureau-finance', label: 'Bureau Finance' },
        ],
      },
    ],
  },
  absences: {
    id: 'absences',
    label: 'Absences',
    icon: Calendar,
    children: [
      {
        id: 'current',
        label: 'En cours',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'current-bureau-finance', label: 'Bureau Finance' },
          { id: 'current-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'upcoming',
        label: 'À venir',
        badge: 0,
        children: [
          { id: 'upcoming-week', label: 'Cette semaine' },
          { id: 'upcoming-month', label: 'Ce mois' },
        ],
      },
      {
        id: 'planned',
        label: 'Planifiées',
        children: [
          { id: 'planned-approved', label: 'Approuvées' },
          { id: 'planned-pending', label: 'En attente' },
        ],
      },
    ],
  },
  delegations: {
    id: 'delegations',
    label: 'Délégations',
    icon: UserCheck,
    children: [
      {
        id: 'active',
        label: 'Actives',
        badge: 0,
        children: [
          { id: 'active-bureau-finance', label: 'Bureau Finance' },
          { id: 'active-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'temporary',
        label: 'Temporaires',
        badge: 0,
        children: [
          { id: 'temporary-recent', label: 'Récents' },
          { id: 'temporary-upcoming', label: 'À venir' },
        ],
      },
      {
        id: 'permanent',
        label: 'Permanentes',
        badge: 0,
        children: [
          { id: 'permanent-bureau-finance', label: 'Bureau Finance' },
          { id: 'permanent-bureau-juridique', label: 'Bureau Juridique' },
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
        children: [
          { id: 'recent-today', label: "Aujourd'hui" },
          { id: 'recent-week', label: 'Cette semaine' },
        ],
      },
      {
        id: 'week',
        label: 'Cette semaine',
        children: [
          { id: 'week-bureau-finance', label: 'Bureau Finance' },
          { id: 'week-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'month',
        label: 'Ce mois',
        children: [
          { id: 'month-bureau-finance', label: 'Bureau Finance' },
          { id: 'month-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
    ],
  },
  historique: {
    id: 'historique',
    label: 'Historique',
    icon: History,
    children: [
      {
        id: 'all',
        label: 'Tout',
        children: [
          { id: 'all-year', label: 'Cette année' },
          { id: 'all-archive', label: 'Archives' },
        ],
      },
      {
        id: 'by-employee',
        label: 'Par employé',
        children: [
          { id: 'by-employee-active', label: 'Actifs' },
          { id: 'by-employee-inactive', label: 'Inactifs' },
        ],
      },
      {
        id: 'by-bureau',
        label: 'Par bureau',
        children: [
          { id: 'by-bureau-finance', label: 'Bureau Finance' },
          { id: 'by-bureau-juridique', label: 'Bureau Juridique' },
          { id: 'by-bureau-travaux', label: 'Bureau Travaux' },
        ],
      },
    ],
  },
  analytics: {
    id: 'analytics',
    label: 'Analytiques',
    icon: TrendingUp,
    children: [
      { id: 'dashboard', label: 'Tableau de bord' },
      { id: 'statistics', label: 'Statistiques' },
      { id: 'trends', label: 'Tendances' },
    ],
  },
  settings: {
    id: 'settings',
    label: 'Paramètres',
    icon: Settings,
    children: [
      { id: 'general', label: 'Général' },
      { id: 'rules', label: 'Règles' },
      { id: 'notifications', label: 'Notifications' },
    ],
  },
};

export function findNavNodeById(id: string, parentChildren?: NavNode[]): NavNode | undefined {
  const searchIn = parentChildren || Object.values(substitutionNavigationConfig);
  
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

export function getSubCategories(mainCategory: SubstitutionMainCategory): NavNode[] {
  return substitutionNavigationConfig[mainCategory]?.children || [];
}

export function getSubSubCategories(mainCategory: SubstitutionMainCategory, subCategory: string): NavNode[] {
  const mainNode = substitutionNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

