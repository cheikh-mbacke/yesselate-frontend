/**
 * Configuration de navigation pour le module Evaluations
 */

import type { EvaluationsMainCategory } from '../types/evaluationsTypes';
import {
  LayoutDashboard,
  FileCheck,
  Clock,
  PlayCircle,
  CheckCircle2,
  User,
  Calendar,
  FolderOpen,
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

export const evaluationsNavigationConfig: Record<EvaluationsMainCategory, NavNode> = {
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
  'in-progress': {
    id: 'in-progress',
    label: 'En cours',
    icon: PlayCircle,
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
        id: 'active',
        label: 'Actives',
        badge: 0,
        children: [
          { id: 'active-today', label: "Aujourd'hui" },
          { id: 'active-week', label: 'Cette semaine' },
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
          { id: 'all-pending', label: 'En attente' },
          { id: 'all-completed', label: 'Terminées' },
        ],
      },
      {
        id: 'active-employees',
        label: 'Employés actifs',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'active-pending', label: 'En attente' },
          { id: 'active-completed', label: 'Terminées' },
        ],
      },
      {
        id: 'top-performers',
        label: 'Top performers',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'top-pending', label: 'En attente' },
          { id: 'top-completed', label: 'Terminées' },
        ],
      },
    ],
  },
  'by-period': {
    id: 'by-period',
    label: 'Par période',
    icon: Calendar,
    children: [
      {
        id: 'current',
        label: 'En cours',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'current-pending', label: 'En attente' },
          { id: 'current-completed', label: 'Terminées' },
        ],
      },
      {
        id: 'last-quarter',
        label: 'Dernier trimestre',
        badge: 0,
        children: [
          { id: 'lastq-pending', label: 'En attente' },
          { id: 'lastq-completed', label: 'Terminées' },
        ],
      },
      {
        id: 'last-year',
        label: 'Dernière année',
        badge: 0,
        children: [
          { id: 'lasty-pending', label: 'En attente' },
          { id: 'lasty-completed', label: 'Terminées' },
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
        id: 'annual',
        label: 'Annuelle',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'annual-pending', label: 'En attente' },
          { id: 'annual-completed', label: 'Terminées' },
        ],
      },
      {
        id: 'quarterly',
        label: 'Trimestrielle',
        badge: 0,
        children: [
          { id: 'quarterly-pending', label: 'En attente' },
          { id: 'quarterly-completed', label: 'Terminées' },
        ],
      },
      {
        id: 'monthly',
        label: 'Mensuelle',
        badge: 0,
        children: [
          { id: 'monthly-pending', label: 'En attente' },
          { id: 'monthly-completed', label: 'Terminées' },
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
  const searchIn = parentChildren || Object.values(evaluationsNavigationConfig);
  
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

export function getSubCategories(mainCategory: EvaluationsMainCategory): NavNode[] {
  return evaluationsNavigationConfig[mainCategory]?.children || [];
}

export function getSubSubCategories(mainCategory: EvaluationsMainCategory, subCategory: string): NavNode[] {
  const mainNode = evaluationsNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

