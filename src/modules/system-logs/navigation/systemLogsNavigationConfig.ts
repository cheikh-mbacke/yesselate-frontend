/**
 * Configuration de navigation à 3 niveaux pour le module System Logs
 */

import type { SystemLogsMainCategory } from '../types/systemLogsNavigationTypes';
import {
  LayoutDashboard,
  AlertTriangle,
  Tag,
  Shield,
  AlertCircle,
  GitBranch,
  FileCheck,
  Download,
  Search,
} from 'lucide-react';

export interface NavNode {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  children?: NavNode[];
}

export const systemLogsNavigationConfig: Record<SystemLogsMainCategory, NavNode> = {
  overview: {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: LayoutDashboard,
    children: [{ id: 'all', label: 'Tout', children: [{ id: 'summary', label: 'Synthèse' }, { id: 'recent', label: 'Récents', badge: 0, badgeType: 'warning' }] }],
  },
  'by-level': {
    id: 'by-level',
    label: 'Par niveau',
    icon: AlertTriangle,
    badge: 0,
    badgeType: 'critical',
    children: [
      { id: 'all', label: 'Tous', badge: 0, badgeType: 'critical', children: [{ id: 'critical', label: 'Critiques' }, { id: 'error', label: 'Erreurs' }, { id: 'warning', label: 'Avertissements' }] },
    ],
  },
  'by-category': {
    id: 'by-category',
    label: 'Par catégorie',
    icon: Tag,
    children: [{ id: 'all', label: 'Toutes', children: [{ id: 'auth', label: 'Authentification' }, { id: 'data', label: 'Données' }, { id: 'system', label: 'Système' }, { id: 'api', label: 'API' }] }],
  },
  security: {
    id: 'security',
    label: 'Sécurité',
    icon: Shield,
    badge: 0,
    badgeType: 'critical',
    children: [{ id: 'all', label: 'Tous', badge: 0, badgeType: 'critical', children: [{ id: 'critical', label: 'Critiques' }, { id: 'high', label: 'Élevées' }] }],
  },
  incidents: {
    id: 'incidents',
    label: 'Incidents',
    icon: AlertCircle,
    badge: 0,
    badgeType: 'critical',
    children: [{ id: 'all', label: 'Tous', badge: 0, badgeType: 'critical', children: [{ id: 'active', label: 'Actifs' }, { id: 'resolved', label: 'Résolus' }] }],
  },
  correlation: {
    id: 'correlation',
    label: 'Corrélation',
    icon: GitBranch,
    children: [{ id: 'all', label: 'Tout', children: [{ id: 'patterns', label: 'Modèles' }, { id: 'anomalies', label: 'Anomalies' }] }],
  },
  integrity: {
    id: 'integrity',
    label: 'Intégrité',
    icon: FileCheck,
    children: [{ id: 'all', label: 'Tout', children: [{ id: 'checks', label: 'Contrôles' }, { id: 'violations', label: 'Violations' }] }],
  },
  exports: {
    id: 'exports',
    label: 'Exports',
    icon: Download,
    children: [{ id: 'all', label: 'Tous', children: [{ id: 'recent', label: 'Récents' }, { id: 'scheduled', label: 'Planifiés' }] }],
  },
  'advanced-search': {
    id: 'advanced-search',
    label: 'Recherche avancée',
    icon: Search,
    children: [{ id: 'all', label: 'Rechercher' }],
  },
};

export function findNavNodeById(mainCategory: SystemLogsMainCategory, subCategory?: string, subSubCategory?: string): NavNode | undefined {
  const mainNode = systemLogsNavigationConfig[mainCategory];
  if (!mainNode) return undefined;
  if (!subCategory) return mainNode;
  const subNode = mainNode.children?.find((child) => child.id === subCategory);
  if (!subNode) return undefined;
  if (!subSubCategory) return subNode;
  return subNode.children?.find((child) => child.id === subSubCategory);
}

export function getSubCategories(mainCategory: SystemLogsMainCategory): NavNode[] {
  const mainNode = systemLogsNavigationConfig[mainCategory];
  return mainNode?.children || [];
}

export function getSubSubCategories(mainCategory: SystemLogsMainCategory, subCategory: string): NavNode[] {
  const mainNode = systemLogsNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

