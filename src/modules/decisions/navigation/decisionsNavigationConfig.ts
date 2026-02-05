/**
 * Configuration de navigation à 3 niveaux pour le module Decisions
 */

import type { DecisionsMainCategory, DecisionsNavItem } from '../types/decisionsNavigationTypes';
import {
  LayoutDashboard,
  Clock,
  AlertTriangle,
  Target,
  Settings,
  CheckCircle2,
  History,
  BarChart3,
  Tag,
} from 'lucide-react';

export interface NavNode {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  children?: NavNode[];
}

export const decisionsNavigationConfig: Record<DecisionsMainCategory, NavNode> = {
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
          { id: 'highlights', label: 'Points clés', badge: 0, badgeType: 'warning' },
        ],
      },
      {
        id: 'recent',
        label: 'Récentes',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'today', label: 'Aujourd\'hui' },
          { id: 'week', label: 'Cette semaine' },
        ],
      },
    ],
  },
  pending: {
    id: 'pending',
    label: 'En attente',
    icon: Clock,
    badge: 0,
    badgeType: 'critical',
    children: [
      {
        id: 'urgent',
        label: 'Urgentes',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'critiques', label: 'Critiques' },
          { id: 'importantes', label: 'Importantes' },
        ],
      },
      {
        id: 'normales',
        label: 'Normales',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'moyennes', label: 'Moyennes' },
          { id: 'faibles', label: 'Faibles' },
        ],
      },
    ],
  },
  critical: {
    id: 'critical',
    label: 'Critiques',
    icon: AlertTriangle,
    badge: 0,
    badgeType: 'critical',
    children: [
      {
        id: 'all',
        label: 'Toutes',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'projets', label: 'Projets' },
          { id: 'budget', label: 'Budget' },
          { id: 'planning', label: 'Planning' },
        ],
      },
    ],
  },
  strategique: {
    id: 'strategique',
    label: 'Stratégiques',
    icon: Target,
    children: [
      {
        id: 'all',
        label: 'Toutes',
        children: [
          { id: 'projets', label: 'Projets' },
          { id: 'budget', label: 'Budget' },
          { id: 'planning', label: 'Planning' },
        ],
      },
    ],
  },
  operationnel: {
    id: 'operationnel',
    label: 'Opérationnelles',
    icon: Settings,
    children: [
      {
        id: 'all',
        label: 'Toutes',
        children: [
          { id: 'contract', label: 'Contrat' },
          { id: 'resource', label: 'Ressource' },
          { id: 'other', label: 'Autre' },
        ],
      },
    ],
  },
  approved: {
    id: 'approved',
    label: 'Approuvées',
    icon: CheckCircle2,
    children: [
      {
        id: 'recentes',
        label: 'Récentes',
        children: [
          { id: 'today', label: 'Aujourd\'hui' },
          { id: 'week', label: 'Cette semaine' },
        ],
      },
      {
        id: 'anciennes',
        label: 'Anciennes',
        children: [
          { id: 'month', label: 'Ce mois' },
          { id: 'year', label: 'Cette année' },
        ],
      },
    ],
  },
  history: {
    id: 'history',
    label: 'Historique',
    icon: History,
    children: [
      {
        id: 'chronologique',
        label: 'Chronologique',
        children: [
          { id: 'recent', label: 'Récent' },
          { id: 'old', label: 'Ancien' },
        ],
      },
      {
        id: 'par-type',
        label: 'Par type',
        children: [
          { id: 'budget', label: 'Budget' },
          { id: 'planning', label: 'Planning' },
          { id: 'resource', label: 'Ressource' },
        ],
      },
      {
        id: 'traces',
        label: 'Traces',
      },
      {
        id: 'rapports',
        label: 'Rapports',
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
  types: {
    id: 'types',
    label: 'Par type',
    icon: Tag,
    children: [
      {
        id: 'all',
        label: 'Tous',
        children: [
          { id: 'budget', label: 'Budget' },
          { id: 'planning', label: 'Planning' },
          { id: 'contract', label: 'Contrat' },
          { id: 'resource', label: 'Ressource' },
          { id: 'other', label: 'Autre' },
        ],
      },
    ],
  },
};

// Helper functions
export function findNavNodeById(
  mainCategory: DecisionsMainCategory,
  subCategory?: string,
  subSubCategory?: string
): NavNode | undefined {
  const mainNode = decisionsNavigationConfig[mainCategory];
  if (!mainNode) return undefined;

  if (!subCategory) return mainNode;

  const subNode = mainNode.children?.find((child) => child.id === subCategory);
  if (!subNode) return undefined;

  if (!subSubCategory) return subNode;

  return subNode.children?.find((child) => child.id === subSubCategory);
}

export function getSubCategories(
  mainCategory: DecisionsMainCategory
): NavNode[] {
  const mainNode = decisionsNavigationConfig[mainCategory];
  return mainNode?.children || [];
}

export function getSubSubCategories(
  mainCategory: DecisionsMainCategory,
  subCategory: string
): NavNode[] {
  const mainNode = decisionsNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

