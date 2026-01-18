/**
 * Configuration de navigation à 3 niveaux pour le module API
 */

import type { APIMainCategory } from '../types/apiNavigationTypes';
import {
  LayoutDashboard,
  Network,
  TrendingUp,
  DollarSign,
  BarChart3,
  AlertCircle,
  FileText,
  Activity,
  GitCompare,
  Building2,
} from 'lucide-react';

export interface NavNode {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  children?: NavNode[];
}

export const apiNavigationConfig: Record<APIMainCategory, NavNode> = {
  overview: {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: LayoutDashboard,
    children: [{ id: 'all', label: 'Tout', children: [{ id: 'summary', label: 'Synthèse' }, { id: 'recent', label: 'Récents', badge: 0, badgeType: 'warning' }] }],
  },
  performance: {
    id: 'performance',
    label: 'Performance',
    icon: TrendingUp,
    children: [{ id: 'all', label: 'Tout', children: [{ id: 'endpoints', label: 'Endpoints' }, { id: 'methods', label: 'Méthodes' }] }],
  },
  financial: {
    id: 'financial',
    label: 'Financier',
    icon: DollarSign,
    children: [{ id: 'all', label: 'Tout', children: [{ id: 'usage', label: 'Utilisation' }, { id: 'costs', label: 'Coûts' }] }],
  },
  trends: {
    id: 'trends',
    label: 'Tendances',
    icon: BarChart3,
    children: [{ id: 'all', label: 'Tout', children: [{ id: 'daily', label: 'Quotidiennes' }, { id: 'weekly', label: 'Hebdomadaires' }] }],
  },
  alerts: {
    id: 'alerts',
    label: 'Alertes',
    icon: AlertCircle,
    badge: 0,
    badgeType: 'warning',
    children: [{ id: 'all', label: 'Toutes', badge: 0, badgeType: 'warning', children: [{ id: 'critical', label: 'Critiques' }, { id: 'high', label: 'Élevées' }] }],
  },
  reports: {
    id: 'reports',
    label: 'Rapports',
    icon: FileText,
    children: [{ id: 'all', label: 'Tous', children: [{ id: 'monthly', label: 'Mensuels' }, { id: 'yearly', label: 'Annuels' }] }],
  },
  kpis: {
    id: 'kpis',
    label: 'KPIs',
    icon: Activity,
    children: [{ id: 'all', label: 'Tous', children: [{ id: 'overview', label: 'Vue d\'ensemble' }, { id: 'detailed', label: 'Détaillés' }] }],
  },
  comparison: {
    id: 'comparison',
    label: 'Comparaison',
    icon: GitCompare,
    children: [{ id: 'all', label: 'Tout', children: [{ id: 'endpoints', label: 'Endpoints' }, { id: 'methods', label: 'Méthodes' }] }],
  },
  bureaux: {
    id: 'bureaux',
    label: 'Bureaux',
    icon: Building2,
    children: [{ id: 'all', label: 'Tous', children: [{ id: 'bmo', label: 'BMO' }, { id: 'bf', label: 'BF' }, { id: 'bj', label: 'BJ' }] }],
  },
};

export function findNavNodeById(mainCategory: APIMainCategory, subCategory?: string, subSubCategory?: string): NavNode | undefined {
  const mainNode = apiNavigationConfig[mainCategory];
  if (!mainNode) return undefined;
  if (!subCategory) return mainNode;
  const subNode = mainNode.children?.find((child) => child.id === subCategory);
  if (!subNode) return undefined;
  if (!subSubCategory) return subNode;
  return subNode.children?.find((child) => child.id === subSubCategory);
}

export function getSubCategories(mainCategory: APIMainCategory): NavNode[] {
  const mainNode = apiNavigationConfig[mainCategory];
  return mainNode?.children || [];
}

export function getSubSubCategories(mainCategory: APIMainCategory, subCategory: string): NavNode[] {
  const mainNode = apiNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

