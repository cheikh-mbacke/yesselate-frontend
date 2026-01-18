/**
 * Configuration de navigation à 3 niveaux pour le module Logs
 */

import type { LogsMainCategory } from '../types/logsNavigationTypes';
import {
  LayoutDashboard,
  AlertTriangle,
  AlertCircle,
  Terminal,
  Network,
  Shield,
  FileCheck,
  User,
  BarChart3,
} from 'lucide-react';

export interface NavNode {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  children?: NavNode[];
}

export const logsNavigationConfig: Record<LogsMainCategory, NavNode> = {
  overview: {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: LayoutDashboard,
    children: [{ id: 'all', label: 'Tout', children: [{ id: 'summary', label: 'Synthèse' }, { id: 'recent', label: 'Récents', badge: 0, badgeType: 'warning' }] }],
  },
  errors: {
    id: 'errors',
    label: 'Erreurs',
    icon: AlertTriangle,
    badge: 0,
    badgeType: 'critical',
    children: [{ id: 'all', label: 'Toutes', badge: 0, badgeType: 'critical', children: [{ id: 'critical', label: 'Critiques' }, { id: 'high', label: 'Élevées' }] }],
  },
  warnings: {
    id: 'warnings',
    label: 'Avertissements',
    icon: AlertCircle,
    badge: 0,
    badgeType: 'warning',
    children: [{ id: 'all', label: 'Tous', badge: 0, badgeType: 'warning', children: [{ id: 'medium', label: 'Moyens' }, { id: 'low', label: 'Faibles' }] }],
  },
  system: {
    id: 'system',
    label: 'Système',
    icon: Terminal,
    children: [{ id: 'all', label: 'Tous', children: [{ id: 'system', label: 'Système' }, { id: 'api', label: 'API' }, { id: 'database', label: 'Base de données' }] }],
  },
  api: {
    id: 'api',
    label: 'API',
    icon: Network,
    children: [{ id: 'all', label: 'Toutes', children: [{ id: 'requests', label: 'Requêtes' }, { id: 'responses', label: 'Réponses' }] }],
  },
  security: {
    id: 'security',
    label: 'Sécurité',
    icon: Shield,
    badge: 0,
    badgeType: 'critical',
    children: [{ id: 'all', label: 'Tous', badge: 0, badgeType: 'critical', children: [{ id: 'auth', label: 'Authentification' }, { id: 'access', label: 'Accès' }] }],
  },
  audit: {
    id: 'audit',
    label: 'Audit',
    icon: FileCheck,
    children: [{ id: 'all', label: 'Tout', children: [{ id: 'actions', label: 'Actions' }, { id: 'changes', label: 'Modifications' }] }],
  },
  'user-actions': {
    id: 'user-actions',
    label: 'Actions utilisateur',
    icon: User,
    children: [{ id: 'all', label: 'Toutes', children: [{ id: 'today', label: 'Aujourd\'hui' }, { id: 'week', label: 'Cette semaine' }] }],
  },
  analysis: {
    id: 'analysis',
    label: 'Analyse',
    icon: BarChart3,
    children: [{ id: 'all', label: 'Tout', children: [{ id: 'stats', label: 'Statistiques' }, { id: 'trends', label: 'Tendances' }, { id: 'reports', label: 'Rapports' }] }],
  },
};

export function findNavNodeById(mainCategory: LogsMainCategory, subCategory?: string, subSubCategory?: string): NavNode | undefined {
  const mainNode = logsNavigationConfig[mainCategory];
  if (!mainNode) return undefined;
  if (!subCategory) return mainNode;
  const subNode = mainNode.children?.find((child) => child.id === subCategory);
  if (!subNode) return undefined;
  if (!subSubCategory) return subNode;
  return subNode.children?.find((child) => child.id === subSubCategory);
}

export function getSubCategories(mainCategory: LogsMainCategory): NavNode[] {
  const mainNode = logsNavigationConfig[mainCategory];
  return mainNode?.children || [];
}

export function getSubSubCategories(mainCategory: LogsMainCategory, subCategory: string): NavNode[] {
  const mainNode = logsNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

