/**
 * Configuration de navigation pour le module Recouvrements
 */

import type { RecouvrementsMainCategory } from '../types/recouvrementsTypes';
import {
  LayoutDashboard,
  Clock,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Users,
  AlertCircle,
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

export const recouvrementsNavigationConfig: Record<RecouvrementsMainCategory, NavNode> = {
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
  pending: {
    id: 'pending',
    label: 'En attente',
    icon: Clock,
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
          { id: 'overdue-moderate', label: 'Modérés' },
        ],
      },
    ],
  },
  'in-progress': {
    id: 'in-progress',
    label: 'En cours',
    icon: PlayCircle,
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
        id: 'active',
        label: 'Actifs',
        badge: 0,
        children: [
          { id: 'active-today', label: "Aujourd'hui" },
          { id: 'active-week', label: 'Cette semaine' },
        ],
      },
      {
        id: 'at-risk',
        label: 'À risque',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'at-risk-bureau-finance', label: 'Bureau Finance' },
        ],
      },
    ],
  },
  resolved: {
    id: 'resolved',
    label: 'Résolus',
    icon: CheckCircle2,
    children: [
      {
        id: 'recent',
        label: 'Récents',
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
  failed: {
    id: 'failed',
    label: 'Échoués',
    icon: XCircle,
    children: [
      {
        id: 'all',
        label: 'Tous',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'all-bureau-finance', label: 'Bureau Finance' },
          { id: 'all-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'recent',
        label: 'Récents',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'recent-today', label: "Aujourd'hui" },
          { id: 'recent-week', label: 'Cette semaine' },
        ],
      },
      {
        id: 'archived',
        label: 'Archivés',
        badge: 0,
        children: [
          { id: 'archived-month', label: 'Ce mois' },
          { id: 'archived-old', label: 'Anciennes archives' },
        ],
      },
    ],
  },
  'by-client': {
    id: 'by-client',
    label: 'Par client',
    icon: Users,
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
        id: 'vip',
        label: 'VIP',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'vip-pending', label: 'En attente' },
          { id: 'vip-resolved', label: 'Résolus' },
        ],
      },
      {
        id: 'enterprise',
        label: 'Entreprises',
        badge: 0,
        children: [
          { id: 'enterprise-pending', label: 'En attente' },
          { id: 'enterprise-resolved', label: 'Résolus' },
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
          { id: 'pending-new', label: 'Nouveaux' },
          { id: 'pending-assigned', label: 'Assignés' },
        ],
      },
      {
        id: 'in-progress',
        label: 'En cours',
        badge: 0,
        children: [
          { id: 'in-progress-active', label: 'Actifs' },
          { id: 'in-progress-pending', label: 'En attente' },
        ],
      },
      {
        id: 'resolved',
        label: 'Résolu',
        badge: 0,
        children: [
          { id: 'resolved-recent', label: 'Récents' },
          { id: 'resolved-archived', label: 'Archivés' },
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
  const searchIn = parentChildren || Object.values(recouvrementsNavigationConfig);
  
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

export function getSubCategories(mainCategory: RecouvrementsMainCategory): NavNode[] {
  return recouvrementsNavigationConfig[mainCategory]?.children || [];
}

export function getSubSubCategories(mainCategory: RecouvrementsMainCategory, subCategory: string): NavNode[] {
  const mainNode = recouvrementsNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

