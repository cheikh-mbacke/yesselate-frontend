/**
 * Configuration de navigation pour le module Litiges
 */

import type { LitigesMainCategory } from '../types/litigesTypes';
import {
  LayoutDashboard,
  Scale,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  FolderOpen,
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

export const litigesNavigationConfig: Record<LitigesMainCategory, NavNode> = {
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
    label: 'Actifs',
    icon: Scale,
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
        id: 'critical',
        label: 'Critiques',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'critical-bureau-finance', label: 'Bureau Finance' },
          { id: 'critical-bureau-juridique', label: 'Bureau Juridique' },
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
  resolved: {
    id: 'resolved',
    label: 'Résolus',
    icon: CheckCircle2,
    children: [
      {
        id: 'recent',
        label: 'Récents',
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
        label: 'Archivés',
        badge: 0,
        children: [
          { id: 'archive-year', label: 'Cette année' },
          { id: 'archive-old', label: 'Anciennes archives' },
        ],
      },
    ],
  },
  closed: {
    id: 'closed',
    label: 'Fermés',
    icon: XCircle,
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
        id: 'this-week',
        label: 'Cette semaine',
        badge: 0,
        children: [
          { id: 'week-bureau-finance', label: 'Bureau Finance' },
        ],
      },
      {
        id: 'this-month',
        label: 'Ce mois',
        badge: 0,
        children: [
          { id: 'month-bureau-finance', label: 'Bureau Finance' },
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
        id: 'contractuel',
        label: 'Contractuel',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'contractuel-pending', label: 'En attente' },
          { id: 'contractuel-resolved', label: 'Résolus' },
        ],
      },
      {
        id: 'commercial',
        label: 'Commercial',
        badge: 0,
        children: [
          { id: 'commercial-pending', label: 'En attente' },
          { id: 'commercial-resolved', label: 'Résolus' },
        ],
      },
      {
        id: 'technique',
        label: 'Technique',
        badge: 0,
        children: [
          { id: 'technique-pending', label: 'En attente' },
          { id: 'technique-resolved', label: 'Résolus' },
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
        id: 'pending',
        label: 'En attente',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'pending-new', label: 'Nouveaux' },
          { id: 'pending-assigned', label: 'Assignés' },
        ],
      },
      {
        id: 'in-progress',
        label: 'En cours',
        badge: 0,
        children: [
          { id: 'in-progress-active', label: 'Actifs' },
          { id: 'in-progress-pending', label: 'En attente' },
        ],
      },
      {
        id: 'resolved',
        label: 'Résolu',
        badge: 0,
        children: [
          { id: 'resolved-recent', label: 'Récents' },
          { id: 'resolved-archived', label: 'Archivés' },
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
        id: 'critical',
        label: 'Critique',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'critical-active', label: 'Actifs' },
          { id: 'critical-resolved', label: 'Résolus' },
        ],
      },
      {
        id: 'high',
        label: 'Haute',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'high-active', label: 'Actifs' },
          { id: 'high-resolved', label: 'Résolus' },
        ],
      },
      {
        id: 'medium',
        label: 'Moyenne',
        badge: 0,
        children: [
          { id: 'medium-active', label: 'Actifs' },
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
  const searchIn = parentChildren || Object.values(litigesNavigationConfig);
  
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

export function getSubCategories(mainCategory: LitigesMainCategory): NavNode[] {
  return litigesNavigationConfig[mainCategory]?.children || [];
}

export function getSubSubCategories(mainCategory: LitigesMainCategory, subCategory: string): NavNode[] {
  const mainNode = litigesNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

