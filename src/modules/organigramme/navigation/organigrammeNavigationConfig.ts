/**
 * Configuration de navigation pour le module Organigramme
 */

import type { OrganigrammeMainCategory } from '../types/organigrammeTypes';
import {
  LayoutDashboard,
  Network,
  Building2,
  Building,
  Briefcase,
  Users,
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

export const organigrammeNavigationConfig: Record<OrganigrammeMainCategory, NavNode> = {
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
  structure: {
    id: 'structure',
    label: 'Structure',
    icon: Network,
    children: [
      {
        id: 'full',
        label: 'Complète',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'full-all', label: 'Tout' },
          { id: 'full-active', label: 'Actifs seulement' },
        ],
      },
      {
        id: 'by-level',
        label: 'Par niveau',
        badge: 0,
        children: [
          { id: 'level-executive', label: 'Direction' },
          { id: 'level-management', label: 'Management' },
          { id: 'level-operational', label: 'Opérationnel' },
        ],
      },
      {
        id: 'by-department',
        label: 'Par département',
        badge: 0,
        children: [
          { id: 'dept-finance', label: 'Finance' },
          { id: 'dept-juridique', label: 'Juridique' },
        ],
      },
    ],
  },
  'by-department': {
    id: 'by-department',
    label: 'Par département',
    icon: Building2,
    children: [
      {
        id: 'all',
        label: 'Tous',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all-structure', label: 'Structure' },
          { id: 'all-teams', label: 'Équipes' },
        ],
      },
      {
        id: 'finance',
        label: 'Finance',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'finance-structure', label: 'Structure' },
          { id: 'finance-teams', label: 'Équipes' },
        ],
      },
      {
        id: 'juridique',
        label: 'Juridique',
        badge: 0,
        children: [
          { id: 'juridique-structure', label: 'Structure' },
          { id: 'juridique-teams', label: 'Équipes' },
        ],
      },
      {
        id: 'travaux',
        label: 'Travaux',
        badge: 0,
        children: [
          { id: 'travaux-structure', label: 'Structure' },
        ],
      },
    ],
  },
  'by-bureau': {
    id: 'by-bureau',
    label: 'Par bureau',
    icon: Building,
    children: [
      {
        id: 'all',
        label: 'Tous',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all-structure', label: 'Structure' },
          { id: 'all-teams', label: 'Équipes' },
        ],
      },
      {
        id: 'bureau-finance',
        label: 'Bureau Finance',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'bf-structure', label: 'Structure' },
          { id: 'bf-teams', label: 'Équipes' },
        ],
      },
      {
        id: 'bureau-juridique',
        label: 'Bureau Juridique',
        badge: 0,
        children: [
          { id: 'bj-structure', label: 'Structure' },
          { id: 'bj-teams', label: 'Équipes' },
        ],
      },
      {
        id: 'bureau-travaux',
        label: 'Bureau Travaux',
        badge: 0,
        children: [
          { id: 'bt-structure', label: 'Structure' },
          { id: 'bt-teams', label: 'Équipes' },
        ],
      },
    ],
  },
  'by-role': {
    id: 'by-role',
    label: 'Par rôle',
    icon: Briefcase,
    children: [
      {
        id: 'all',
        label: 'Tous',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all-structure', label: 'Structure' },
          { id: 'all-count', label: 'Effectifs' },
        ],
      },
      {
        id: 'executive',
        label: 'Direction',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'executive-structure', label: 'Structure' },
          { id: 'executive-count', label: 'Effectifs' },
        ],
      },
      {
        id: 'management',
        label: 'Management',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'management-structure', label: 'Structure' },
          { id: 'management-count', label: 'Effectifs' },
        ],
      },
      {
        id: 'operational',
        label: 'Opérationnel',
        badge: 0,
        children: [
          { id: 'operational-structure', label: 'Structure' },
          { id: 'operational-count', label: 'Effectifs' },
        ],
      },
    ],
  },
  hierarchy: {
    id: 'hierarchy',
    label: 'Hiérarchie',
    icon: Network,
    children: [
      {
        id: 'full-tree',
        label: 'Arbre complet',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'tree-all', label: 'Tout' },
          { id: 'tree-active', label: 'Actifs seulement' },
        ],
      },
      {
        id: 'by-level',
        label: 'Par niveau',
        badge: 0,
        children: [
          { id: 'level-1', label: 'Niveau 1' },
          { id: 'level-2', label: 'Niveau 2' },
          { id: 'level-3', label: 'Niveau 3' },
        ],
      },
      {
        id: 'reporting',
        label: 'Reporting',
        badge: 0,
        children: [
          { id: 'reporting-direct', label: 'Direct' },
          { id: 'reporting-indirect', label: 'Indirect' },
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
  const searchIn = parentChildren || Object.values(organigrammeNavigationConfig);
  
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

export function getSubCategories(mainCategory: OrganigrammeMainCategory): NavNode[] {
  return organigrammeNavigationConfig[mainCategory]?.children || [];
}

export function getSubSubCategories(mainCategory: OrganigrammeMainCategory, subCategory: string): NavNode[] {
  const mainNode = organigrammeNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

