/**
 * Configuration de navigation pour le module Demandes-RH
 */

import type { DemandesRhMainCategory } from '../types/demandesRhTypes';
import {
  LayoutDashboard,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  FolderOpen,
  AlertCircle,
  User,
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

export const demandesRhNavigationConfig: Record<DemandesRhMainCategory, NavNode> = {
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
    label: 'Toutes les demandes',
    icon: FileText,
    children: [
      {
        id: 'all-pending',
        label: 'En attente',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'pending-bureau-finance', label: 'Bureau Finance' },
          { id: 'pending-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'all-approved',
        label: 'Approuvées',
        badge: 0,
        children: [
          { id: 'approved-recent', label: 'Récentes' },
          { id: 'approved-week', label: 'Cette semaine' },
        ],
      },
      {
        id: 'all-rejected',
        label: 'Rejetées',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'rejected-recent', label: 'Récentes' },
          { id: 'rejected-week', label: 'Cette semaine' },
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
        label: 'Toutes',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all-bureau-finance', label: 'Bureau Finance' },
          { id: 'all-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'recent',
        label: 'Récentes',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'recent-today', label: "Aujourd'hui" },
          { id: 'recent-week', label: 'Cette semaine' },
        ],
      },
      {
        id: 'overdue',
        label: 'En retard',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'overdue-critical', label: 'Critiques' },
          { id: 'overdue-moderate', label: 'Modérées' },
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
        id: 'recent',
        label: 'Récentes',
        badge: 0,
        children: [
          { id: 'recent-today', label: "Aujourd'hui" },
          { id: 'recent-week', label: 'Cette semaine' },
          { id: 'recent-month', label: 'Ce mois' },
        ],
      },
      {
        id: 'this-month',
        label: 'Ce mois',
        badge: 0,
        children: [
          { id: 'month-bureau-finance', label: 'Bureau Finance' },
          { id: 'month-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'archive',
        label: 'Archives',
        badge: 0,
        children: [
          { id: 'archive-year', label: 'Cette année' },
          { id: 'archive-old', label: 'Anciennes archives' },
        ],
      },
    ],
  },
  rejected: {
    id: 'rejected',
    label: 'Rejetées',
    icon: XCircle,
    children: [
      {
        id: 'recent',
        label: 'Récentes',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'recent-today', label: "Aujourd'hui" },
          { id: 'recent-week', label: 'Cette semaine' },
        ],
      },
      {
        id: 'this-month',
        label: 'Ce mois',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'month-bureau-finance', label: 'Bureau Finance' },
          { id: 'month-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'archive',
        label: 'Archives',
        badge: 0,
        children: [
          { id: 'archive-year', label: 'Cette année' },
          { id: 'archive-old', label: 'Anciennes archives' },
        ],
      },
    ],
  },
  'by-type': {
    id: 'by-type',
    label: 'Par type',
    icon: FolderOpen,
    children: [
      {
        id: 'conges',
        label: 'Congés',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'conges-pending', label: 'En attente' },
          { id: 'conges-approved', label: 'Approuvées' },
        ],
      },
      {
        id: 'formation',
        label: 'Formation',
        badge: 0,
        children: [
          { id: 'formation-pending', label: 'En attente' },
          { id: 'formation-approved', label: 'Approuvées' },
        ],
      },
      {
        id: 'equipement',
        label: 'Équipement',
        badge: 0,
        children: [
          { id: 'equipement-pending', label: 'En attente' },
          { id: 'equipement-approved', label: 'Approuvées' },
        ],
      },
    ],
  },
  'by-status': {
    id: 'by-status',
    label: 'Par statut',
    icon: AlertCircle,
    children: [
      {
        id: 'pending',
        label: 'En attente',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'pending-new', label: 'Nouvelles' },
          { id: 'pending-assigned', label: 'Assignées' },
        ],
      },
      {
        id: 'approved',
        label: 'Approuvée',
        badge: 0,
        children: [
          { id: 'approved-recent', label: 'Récentes' },
          { id: 'approved-archived', label: 'Archivées' },
        ],
      },
      {
        id: 'rejected',
        label: 'Rejetée',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'rejected-recent', label: 'Récentes' },
          { id: 'rejected-archived', label: 'Archivées' },
        ],
      },
    ],
  },
  'by-employee': {
    id: 'by-employee',
    label: 'Par employé',
    icon: User,
    children: [
      {
        id: 'all',
        label: 'Tous',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all-pending', label: 'En attente' },
          { id: 'all-approved', label: 'Approuvées' },
        ],
      },
      {
        id: 'active-employees',
        label: 'Employés actifs',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'active-pending', label: 'En attente' },
          { id: 'active-approved', label: 'Approuvées' },
        ],
      },
      {
        id: 'top-requesters',
        label: 'Top demandeurs',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'top-pending', label: 'En attente' },
          { id: 'top-approved', label: 'Approuvées' },
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
  const searchIn = parentChildren || Object.values(demandesRhNavigationConfig);
  
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

export function getSubCategories(mainCategory: DemandesRhMainCategory): NavNode[] {
  return demandesRhNavigationConfig[mainCategory]?.children || [];
}

export function getSubSubCategories(mainCategory: DemandesRhMainCategory, subCategory: string): NavNode[] {
  const mainNode = demandesRhNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

