/**
 * Configuration de navigation pour le module Employes
 */

import type { EmployesMainCategory } from '../types/employesTypes';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserX,
  Building2,
  Briefcase,
  Building,
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

export const employesNavigationConfig: Record<EmployesMainCategory, NavNode> = {
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
  all: {
    id: 'all',
    label: 'Tous les employés',
    icon: Users,
    children: [
      {
        id: 'all-active',
        label: 'Actifs',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'active-bureau-finance', label: 'Bureau Finance' },
          { id: 'active-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'all-inactive',
        label: 'Inactifs',
        badge: 0,
        children: [
          { id: 'inactive-recent', label: 'Récents' },
          { id: 'inactive-archived', label: 'Archivés' },
        ],
      },
      {
        id: 'all-contract',
        label: 'Contrats',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'contract-permanent', label: 'Permanents' },
          { id: 'contract-temporary', label: 'Temporaires' },
        ],
      },
    ],
  },
  active: {
    id: 'active',
    label: 'Actifs',
    icon: UserCheck,
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
          { id: 'recent-week', label: 'Cette semaine' },
          { id: 'recent-month', label: 'Ce mois' },
        ],
      },
      {
        id: 'by-contract',
        label: 'Par contrat',
        badge: 0,
        children: [
          { id: 'contract-cdi', label: 'CDI' },
          { id: 'contract-cdd', label: 'CDD' },
        ],
      },
    ],
  },
  inactive: {
    id: 'inactive',
    label: 'Inactifs',
    icon: UserX,
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
        id: 'recent',
        label: 'Récents',
        badge: 0,
        children: [
          { id: 'recent-month', label: 'Ce mois' },
          { id: 'recent-quarter', label: 'Ce trimestre' },
        ],
      },
      {
        id: 'archived',
        label: 'Archivés',
        badge: 0,
        children: [
          { id: 'archived-year', label: 'Cette année' },
          { id: 'archived-old', label: 'Anciennes archives' },
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
        id: 'finance',
        label: 'Finance',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'finance-active', label: 'Actifs' },
          { id: 'finance-inactive', label: 'Inactifs' },
        ],
      },
      {
        id: 'juridique',
        label: 'Juridique',
        badge: 0,
        children: [
          { id: 'juridique-active', label: 'Actifs' },
          { id: 'juridique-inactive', label: 'Inactifs' },
        ],
      },
      {
        id: 'travaux',
        label: 'Travaux',
        badge: 0,
        children: [
          { id: 'travaux-active', label: 'Actifs' },
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
        id: 'manager',
        label: 'Manager',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'manager-active', label: 'Actifs' },
          { id: 'manager-inactive', label: 'Inactifs' },
        ],
      },
      {
        id: 'employee',
        label: 'Employé',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'employee-active', label: 'Actifs' },
          { id: 'employee-inactive', label: 'Inactifs' },
        ],
      },
      {
        id: 'consultant',
        label: 'Consultant',
        badge: 0,
        children: [
          { id: 'consultant-active', label: 'Actifs' },
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
          { id: 'all-active', label: 'Actifs' },
          { id: 'all-inactive', label: 'Inactifs' },
        ],
      },
      {
        id: 'bureau-finance',
        label: 'Bureau Finance',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'bf-active', label: 'Actifs' },
          { id: 'bf-inactive', label: 'Inactifs' },
        ],
      },
      {
        id: 'bureau-juridique',
        label: 'Bureau Juridique',
        badge: 0,
        children: [
          { id: 'bj-active', label: 'Actifs' },
          { id: 'bj-inactive', label: 'Inactifs' },
        ],
      },
      {
        id: 'bureau-travaux',
        label: 'Bureau Travaux',
        badge: 0,
        children: [
          { id: 'bt-active', label: 'Actifs' },
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
  const searchIn = parentChildren || Object.values(employesNavigationConfig);
  
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

export function getSubCategories(mainCategory: EmployesMainCategory): NavNode[] {
  return employesNavigationConfig[mainCategory]?.children || [];
}

export function getSubSubCategories(mainCategory: EmployesMainCategory, subCategory: string): NavNode[] {
  const mainNode = employesNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

