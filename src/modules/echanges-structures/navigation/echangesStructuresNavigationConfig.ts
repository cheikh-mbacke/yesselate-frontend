/**
 * Configuration de navigation à 3 niveaux pour le module Echanges Structures
 */

import type { EchangesStructuresMainCategory, EchangesStructuresNavItem } from '../types/echangesStructuresNavigationTypes';
import {
  LayoutDashboard,
  Mail,
  Clock,
  ArrowUp,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  BarChart3,
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

export const echangesStructuresNavigationConfig: Record<EchangesStructuresMainCategory, NavNode> = {
  overview: {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: LayoutDashboard,
    children: [
      {
        id: 'all',
        label: 'Tout',
        children: [
          { id: 'summary', label: 'Synthèse' },
          { id: 'recent', label: 'Récents', badge: 0, badgeType: 'warning' },
        ],
      },
    ],
  },
  ouvert: {
    id: 'ouvert',
    label: 'Ouverts',
    icon: Mail,
    badge: 0,
    badgeType: 'warning',
    children: [
      {
        id: 'all',
        label: 'Tous',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'urgent', label: 'Urgents' },
          { id: 'normal', label: 'Normaux' },
          { id: 'low', label: 'Faibles' },
        ],
      },
      {
        id: 'demande_info',
        label: 'Demandes info',
      },
      {
        id: 'alerte_risque',
        label: 'Alertes risque',
        badgeType: 'critical',
      },
      {
        id: 'demande_validation',
        label: 'Demandes validation',
      },
      {
        id: 'signalement_blocage',
        label: 'Blocages',
        badgeType: 'warning',
      },
    ],
  },
  en_traitement: {
    id: 'en_traitement',
    label: 'En traitement',
    icon: Clock,
    badge: 0,
    badgeType: 'warning',
    children: [
      {
        id: 'all',
        label: 'Tous',
        children: [
          { id: 'urgent', label: 'Urgents' },
          { id: 'normal', label: 'Normaux' },
        ],
      },
    ],
  },
  escalade: {
    id: 'escalade',
    label: 'Escaladés',
    icon: ArrowUp,
    badge: 0,
    badgeType: 'critical',
    children: [
      {
        id: 'all',
        label: 'Tous',
        badge: 0,
        badgeType: 'critical',
      },
    ],
  },
  resolu: {
    id: 'resolu',
    label: 'Résolus',
    icon: CheckCircle2,
    children: [
      {
        id: 'all',
        label: 'Tous',
        children: [
          { id: 'recent', label: 'Récents' },
          { id: 'old', label: 'Anciens' },
        ],
      },
    ],
  },
  critiques: {
    id: 'critiques',
    label: 'Critiques',
    icon: AlertTriangle,
    badge: 0,
    badgeType: 'critical',
    children: [
      {
        id: 'all',
        label: 'Tous',
        badge: 0,
        badgeType: 'critical',
      },
    ],
  },
  en_retard: {
    id: 'en_retard',
    label: 'En retard',
    icon: AlertCircle,
    badge: 0,
    badgeType: 'critical',
    children: [
      {
        id: 'all',
        label: 'Tous',
        badge: 0,
        badgeType: 'critical',
      },
    ],
  },
  analytics: {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    children: [
      {
        id: 'all',
        label: 'Tout',
        children: [
          { id: 'stats', label: 'Statistiques' },
          { id: 'trends', label: 'Tendances' },
          { id: 'reports', label: 'Rapports' },
        ],
      },
    ],
  },
  settings: {
    id: 'settings',
    label: 'Paramètres',
    icon: Settings,
    children: [
      {
        id: 'all',
        label: 'Tous',
      },
    ],
  },
};

// Helper functions
export function findNavNodeById(
  mainCategory: EchangesStructuresMainCategory,
  subCategory?: string,
  subSubCategory?: string
): NavNode | undefined {
  const mainNode = echangesStructuresNavigationConfig[mainCategory];
  if (!mainNode) return undefined;
  if (!subCategory) return mainNode;
  const subNode = mainNode.children?.find((child) => child.id === subCategory);
  if (!subNode) return undefined;
  if (!subSubCategory) return subNode;
  return subNode.children?.find((child) => child.id === subSubCategory);
}

export function getSubCategories(
  mainCategory: EchangesStructuresMainCategory
): NavNode[] {
  const mainNode = echangesStructuresNavigationConfig[mainCategory];
  return mainNode?.children || [];
}

export function getSubSubCategories(
  mainCategory: EchangesStructuresMainCategory,
  subCategory: string
): NavNode[] {
  const mainNode = echangesStructuresNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

