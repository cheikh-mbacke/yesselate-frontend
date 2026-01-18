/**
 * Configuration de navigation à 3 niveaux pour le module Audit
 */

import type { AuditMainCategory } from '../types/auditNavigationTypes';
import {
  LayoutDashboard,
  Activity,
  Shield,
  CheckCircle2,
  TrendingUp,
  Terminal,
  History,
  FileText,
  Settings,
} from 'lucide-react';

export interface NavNode {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  children?: NavNode[];
}

export const auditNavigationConfig: Record<AuditMainCategory, NavNode> = {
  overview: {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: LayoutDashboard,
    children: [{ id: 'all', label: 'Tout', children: [{ id: 'summary', label: 'Synthèse' }, { id: 'recent', label: 'Récents', badge: 0, badgeType: 'warning' }] }],
  },
  events: {
    id: 'events',
    label: 'Événements',
    icon: Activity,
    badge: 0,
    badgeType: 'warning',
    children: [{ id: 'all', label: 'Tous', badge: 0, badgeType: 'warning', children: [{ id: 'today', label: 'Aujourd\'hui' }, { id: 'week', label: 'Cette semaine' }] }],
  },
  security: {
    id: 'security',
    label: 'Sécurité',
    icon: Shield,
    badge: 0,
    badgeType: 'critical',
    children: [{ id: 'all', label: 'Tous', badge: 0, badgeType: 'critical', children: [{ id: 'critical', label: 'Critiques' }, { id: 'high', label: 'Élevées' }] }],
  },
  compliance: {
    id: 'compliance',
    label: 'Conformité',
    icon: CheckCircle2,
    children: [{ id: 'all', label: 'Tout', children: [{ id: 'checks', label: 'Contrôles' }, { id: 'violations', label: 'Violations' }] }],
  },
  performance: {
    id: 'performance',
    label: 'Performance',
    icon: TrendingUp,
    children: [{ id: 'all', label: 'Tout', children: [{ id: 'metrics', label: 'Métriques' }, { id: 'alerts', label: 'Alertes' }] }],
  },
  'system-logs': {
    id: 'system-logs',
    label: 'Logs Système',
    icon: Terminal,
    children: [{ id: 'all', label: 'Tous', children: [{ id: 'system', label: 'Système' }, { id: 'user', label: 'Utilisateur' }, { id: 'data', label: 'Données' }] }],
  },
  traceability: {
    id: 'traceability',
    label: 'Traçabilité',
    icon: History,
    children: [{ id: 'all', label: 'Tout', children: [{ id: 'traces', label: 'Traces' }, { id: 'history', label: 'Historique' }] }],
  },
  reports: {
    id: 'reports',
    label: 'Rapports',
    icon: FileText,
    children: [{ id: 'all', label: 'Tous', children: [{ id: 'monthly', label: 'Mensuels' }, { id: 'yearly', label: 'Annuels' }] }],
  },
  settings: {
    id: 'settings',
    label: 'Paramètres',
    icon: Settings,
    children: [{ id: 'all', label: 'Tous' }],
  },
};

export function findNavNodeById(mainCategory: AuditMainCategory, subCategory?: string, subSubCategory?: string): NavNode | undefined {
  const mainNode = auditNavigationConfig[mainCategory];
  if (!mainNode) return undefined;
  if (!subCategory) return mainNode;
  const subNode = mainNode.children?.find((child) => child.id === subCategory);
  if (!subNode) return undefined;
  if (!subSubCategory) return subNode;
  return subNode.children?.find((child) => child.id === subSubCategory);
}

export function getSubCategories(mainCategory: AuditMainCategory): NavNode[] {
  const mainNode = auditNavigationConfig[mainCategory];
  return mainNode?.children || [];
}

export function getSubSubCategories(mainCategory: AuditMainCategory, subCategory: string): NavNode[] {
  const mainNode = auditNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

