/**
 * Configuration de navigation pour le module Arbitrages-Vivants
 */

import type { ArbitragesMainCategory } from '../types/arbitragesTypes';
import {
  LayoutDashboard,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  Grid3x3,
  Building2,
} from 'lucide-react';

export interface NavNode {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
  children?: NavNode[];
}

export const arbitragesNavigationConfig: Record<ArbitragesMainCategory, NavNode> = {
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
          { id: 'summary-active', label: 'Actifs' },
          { id: 'summary-resolved', label: 'Résolus' },
        ],
      },
      {
        id: 'highlights',
        label: 'Points clés',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'highlights-critical', label: 'Critiques' },
          { id: 'highlights-pending', label: 'En attente' },
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
        label: 'Tous',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'all-bureau-finance', label: 'Bureau Finance' },
          { id: 'all-bureau-juridique', label: 'Bureau Juridique' },
          { id: 'all-bureau-travaux', label: 'Bureau Travaux' },
        ],
      },
      {
        id: 'immediate',
        label: 'Immédiats',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'immediate-bureau-finance', label: 'Bureau Finance' },
          { id: 'immediate-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'urgent',
        label: 'Urgents',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'urgent-bureau-finance', label: 'Bureau Finance' },
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
        id: 'all',
        label: 'Tous',
        children: [
          { id: 'all-bureau-finance', label: 'Bureau Finance' },
          { id: 'all-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'this-week',
        label: 'Cette semaine',
        children: [
          { id: 'week-bureau-finance', label: 'Bureau Finance' },
          { id: 'week-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'this-month',
        label: 'Ce mois',
        children: [
          { id: 'month-bureau-finance', label: 'Bureau Finance' },
          { id: 'month-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'archived',
        label: 'Archivés',
        children: [
          { id: 'archived-year', label: 'Cette année' },
          { id: 'archived-old', label: 'Anciennes archives' },
        ],
      },
    ],
  },
  escalated: {
    id: 'escalated',
    label: 'Escaladés',
    icon: TrendingUp,
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
        id: 'dg',
        label: 'Direction Générale',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'dg-pending', label: 'En attente' },
          { id: 'dg-resolved', label: 'Résolus' },
        ],
      },
      {
        id: 'comex',
        label: 'COMEX',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'comex-pending', label: 'En attente' },
          { id: 'comex-resolved', label: 'Résolus' },
        ],
      },
    ],
  },
  categories: {
    id: 'categories',
    label: 'Par catégorie',
    icon: Grid3x3,
    children: [
      {
        id: 'budget',
        label: 'Budgétaire',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'budget-pending', label: 'En attente' },
          { id: 'budget-resolved', label: 'Résolus' },
        ],
      },
      {
        id: 'ressources',
        label: 'Ressources',
        badge: 0,
        children: [
          { id: 'ressources-pending', label: 'En attente' },
          { id: 'ressources-resolved', label: 'Résolus' },
        ],
      },
      {
        id: 'planning',
        label: 'Planning',
        badge: 0,
        children: [
          { id: 'planning-pending', label: 'En attente' },
          { id: 'planning-resolved', label: 'Résolus' },
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
  bureaux: {
    id: 'bureaux',
    label: 'Par bureau',
    icon: Building2,
    children: [
      {
        id: 'all',
        label: 'Tous',
        children: [
          { id: 'all-bureau-finance', label: 'Bureau Finance' },
          { id: 'all-bureau-juridique', label: 'Bureau Juridique' },
          { id: 'all-bureau-travaux', label: 'Bureau Travaux' },
        ],
      },
      {
        id: 'daf',
        label: 'DAF',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'daf-pending', label: 'En attente' },
          { id: 'daf-resolved', label: 'Résolus' },
        ],
      },
      {
        id: 'drh',
        label: 'DRH',
        badge: 0,
        children: [
          { id: 'drh-pending', label: 'En attente' },
          { id: 'drh-resolved', label: 'Résolus' },
        ],
      },
      {
        id: 'dsi',
        label: 'DSI',
        badge: 0,
        children: [
          { id: 'dsi-pending', label: 'En attente' },
          { id: 'dsi-resolved', label: 'Résolus' },
        ],
      },
    ],
  },
};

export function findNavNodeById(id: string, parentChildren?: NavNode[]): NavNode | undefined {
  const searchIn = parentChildren || Object.values(arbitragesNavigationConfig);
  
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

export function getSubCategories(mainCategory: ArbitragesMainCategory): NavNode[] {
  return arbitragesNavigationConfig[mainCategory]?.children || [];
}

export function getSubSubCategories(mainCategory: ArbitragesMainCategory, subCategory: string): NavNode[] {
  const mainNode = arbitragesNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

