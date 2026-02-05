/**
 * Configuration de navigation à 3 niveaux pour le module IA
 */

import type { IAMainCategory } from '../types/iaNavigationTypes';
import {
  Brain,
  PlayCircle,
  GraduationCap,
  PauseCircle,
  AlertTriangle,
  History,
  BarChart3,
  TrendingUp,
  AlertCircle,
  FileText,
  Sparkles,
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

export const iaNavigationConfig: Record<IAMainCategory, NavNode> = {
  modules: {
    id: 'modules',
    label: 'Modules',
    icon: Brain,
    children: [{ id: 'all', label: 'Tous', children: [{ id: 'summary', label: 'Synthèse' }, { id: 'recent', label: 'Récents', badge: 0, badgeType: 'warning' }] }],
  },
  active: {
    id: 'active',
    label: 'Actifs',
    icon: PlayCircle,
    badge: 0,
    badgeType: 'success',
    children: [{ id: 'all', label: 'Tous', badge: 0, badgeType: 'success', children: [{ id: 'recent', label: 'Récents' }, { id: 'all-time', label: 'Tous les temps' }] }],
  },
  training: {
    id: 'training',
    label: 'En formation',
    icon: GraduationCap,
    badge: 0,
    badgeType: 'warning',
    children: [{ id: 'all', label: 'Tous', badge: 0, badgeType: 'warning', children: [{ id: 'progress', label: 'En cours' }, { id: 'pending', label: 'En attente' }] }],
  },
  disabled: {
    id: 'disabled',
    label: 'Désactivés',
    icon: PauseCircle,
    children: [{ id: 'all', label: 'Tous', children: [{ id: 'recent', label: 'Récents' }, { id: 'old', label: 'Anciens' }] }],
  },
  error: {
    id: 'error',
    label: 'Erreurs',
    icon: AlertTriangle,
    badge: 0,
    badgeType: 'critical',
    children: [{ id: 'all', label: 'Toutes', badge: 0, badgeType: 'critical', children: [{ id: 'critical', label: 'Critiques' }, { id: 'high', label: 'Élevées' }] }],
  },
  history: {
    id: 'history',
    label: 'Historique',
    icon: History,
    children: [{ id: 'all', label: 'Tout', children: [{ id: 'recent', label: 'Récent' }, { id: 'old', label: 'Ancien' }] }],
  },
  analysis: {
    id: 'analysis',
    label: 'Analyses',
    icon: BarChart3,
    children: [{ id: 'all', label: 'Toutes', children: [{ id: 'stats', label: 'Statistiques' }, { id: 'trends', label: 'Tendances' }] }],
  },
  prediction: {
    id: 'prediction',
    label: 'Prédictions',
    icon: TrendingUp,
    children: [{ id: 'all', label: 'Toutes', children: [{ id: 'recent', label: 'Récentes' }, { id: 'all-time', label: 'Toutes' }] }],
  },
  anomaly: {
    id: 'anomaly',
    label: 'Anomalies',
    icon: AlertCircle,
    badge: 0,
    badgeType: 'warning',
    children: [{ id: 'all', label: 'Toutes', badge: 0, badgeType: 'warning', children: [{ id: 'critical', label: 'Critiques' }, { id: 'normal', label: 'Normales' }] }],
  },
  reports: {
    id: 'reports',
    label: 'Rapports',
    icon: FileText,
    children: [{ id: 'all', label: 'Tous', children: [{ id: 'monthly', label: 'Mensuels' }, { id: 'yearly', label: 'Annuels' }] }],
  },
  recommendations: {
    id: 'recommendations',
    label: 'Recommandations',
    icon: Sparkles,
    badge: 0,
    badgeType: 'warning',
    children: [{ id: 'all', label: 'Toutes', badge: 0, badgeType: 'warning', children: [{ id: 'pending', label: 'En attente' }, { id: 'applied', label: 'Appliquées' }] }],
  },
  settings: {
    id: 'settings',
    label: 'Paramètres',
    icon: Settings,
    children: [{ id: 'all', label: 'Tous' }],
  },
};

export function findNavNodeById(mainCategory: IAMainCategory, subCategory?: string, subSubCategory?: string): NavNode | undefined {
  const mainNode = iaNavigationConfig[mainCategory];
  if (!mainNode) return undefined;
  if (!subCategory) return mainNode;
  const subNode = mainNode.children?.find((child) => child.id === subCategory);
  if (!subNode) return undefined;
  if (!subSubCategory) return subNode;
  return subNode.children?.find((child) => child.id === subSubCategory);
}

export function getSubCategories(mainCategory: IAMainCategory): NavNode[] {
  const mainNode = iaNavigationConfig[mainCategory];
  return mainNode?.children || [];
}

export function getSubSubCategories(mainCategory: IAMainCategory, subCategory: string): NavNode[] {
  const mainNode = iaNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

