/**
 * Configuration de navigation pour le module Projets-en-Cours
 */

import type { ProjetsMainCategory } from '../types/projetsTypes';
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Pause,
  Building2,
  FolderOpen,
  TrendingUp,
  Clock,
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

export const projetsNavigationConfig: Record<ProjetsMainCategory, NavNode> = {
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
  active: {
    id: 'active',
    label: 'Actifs',
    icon: Briefcase,
    children: [
      {
        id: 'all',
        label: 'Tous',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all-bureau-finance', label: 'Bureau Finance' },
          { id: 'all-bureau-juridique', label: 'Bureau Juridique' },
          { id: 'all-bureau-travaux', label: 'Bureau Travaux' },
        ],
      },
      {
        id: 'in-progress',
        label: 'En cours',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'in-progress-bureau-finance', label: 'Bureau Finance' },
          { id: 'in-progress-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'at-risk',
        label: 'À risque',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'at-risk-budget', label: 'Budget' },
          { id: 'at-risk-delay', label: 'Délai' },
          { id: 'at-risk-resources', label: 'Ressources' },
        ],
      },
    ],
  },
  planning: {
    id: 'planning',
    label: 'En planification',
    icon: Calendar,
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
        id: 'new',
        label: 'Nouveaux',
        badge: 0,
        children: [
          { id: 'new-today', label: "Aujourd'hui" },
          { id: 'new-week', label: 'Cette semaine' },
        ],
      },
      {
        id: 'approved',
        label: 'Approuvés',
        badge: 0,
        children: [
          { id: 'approved-recent', label: 'Récents' },
          { id: 'approved-pending', label: 'En attente' },
        ],
      },
    ],
  },
  delayed: {
    id: 'delayed',
    label: 'En retard',
    icon: AlertTriangle,
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
        id: 'critical',
        label: 'Critiques',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'critical-bureau-finance', label: 'Bureau Finance' },
          { id: 'critical-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'moderate',
        label: 'Modérés',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'moderate-bureau-finance', label: 'Bureau Finance' },
        ],
      },
    ],
  },
  completed: {
    id: 'completed',
    label: 'Terminés',
    icon: CheckCircle2,
    children: [
      {
        id: 'recent',
        label: 'Récents',
        children: [
          { id: 'recent-today', label: "Aujourd'hui" },
          { id: 'recent-week', label: 'Cette semaine' },
          { id: 'recent-month', label: 'Ce mois' },
        ],
      },
      {
        id: 'this-month',
        label: 'Ce mois',
        children: [
          { id: 'month-bureau-finance', label: 'Bureau Finance' },
          { id: 'month-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'archive',
        label: 'Archives',
        children: [
          { id: 'archive-year', label: 'Cette année' },
          { id: 'archive-old', label: 'Anciennes archives' },
        ],
      },
    ],
  },
  'on-hold': {
    id: 'on-hold',
    label: 'En attente',
    icon: Pause,
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
        id: 'awaiting-approval',
        label: 'En attente approbation',
        badge: 0,
        children: [
          { id: 'awaiting-bureau-finance', label: 'Bureau Finance' },
        ],
      },
      {
        id: 'blocked',
        label: 'Bloqués',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'blocked-bureau-finance', label: 'Bureau Finance' },
          { id: 'blocked-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
    ],
  },
  'by-bureau': {
    id: 'by-bureau',
    label: 'Par bureau',
    icon: Building2,
    children: [
      {
        id: 'all',
        label: 'Tous',
        children: [
          { id: 'all-bureau-finance', label: 'Bureau Finance' },
          { id: 'all-bureau-juridique', label: 'Bureau Juridique' },
          { id: 'all-bureau-travaux', label: 'Bureau Travaux' },
          { id: 'all-bureau-ct', label: 'Bureau CT' },
        ],
      },
      {
        id: 'bureau-finance',
        label: 'Bureau Finance',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'bf-active', label: 'Actifs' },
          { id: 'bf-delayed', label: 'En retard' },
          { id: 'bf-completed', label: 'Terminés' },
        ],
      },
      {
        id: 'bureau-juridique',
        label: 'Bureau Juridique',
        badge: 0,
        children: [
          { id: 'bj-active', label: 'Actifs' },
          { id: 'bj-delayed', label: 'En retard' },
        ],
      },
      {
        id: 'bureau-travaux',
        label: 'Bureau Travaux',
        badge: 0,
        children: [
          { id: 'bt-active', label: 'Actifs' },
          { id: 'bt-delayed', label: 'En retard' },
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
        id: 'infrastructure',
        label: 'Infrastructure',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'infrastructure-active', label: 'Actifs' },
          { id: 'infrastructure-delayed', label: 'En retard' },
        ],
      },
      {
        id: 'batiment',
        label: 'Bâtiment',
        badge: 0,
        children: [
          { id: 'batiment-active', label: 'Actifs' },
          { id: 'batiment-delayed', label: 'En retard' },
        ],
      },
      {
        id: 'ouvrage-art',
        label: 'Ouvrage d\'art',
        badge: 0,
        children: [
          { id: 'ouvrage-active', label: 'Actifs' },
          { id: 'ouvrage-delayed', label: 'En retard' },
        ],
      },
      {
        id: 'amenagement',
        label: 'Aménagement',
        badge: 0,
        children: [
          { id: 'amenagement-active', label: 'Actifs' },
        ],
      },
    ],
  },
  'by-priority': {
    id: 'by-priority',
    label: 'Par priorité',
    icon: TrendingUp,
    children: [
      {
        id: 'high',
        label: 'Haute',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'high-active', label: 'Actifs' },
          { id: 'high-delayed', label: 'En retard' },
        ],
      },
      {
        id: 'medium',
        label: 'Moyenne',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'medium-active', label: 'Actifs' },
          { id: 'medium-delayed', label: 'En retard' },
        ],
      },
      {
        id: 'low',
        label: 'Basse',
        badge: 0,
        children: [
          { id: 'low-active', label: 'Actifs' },
        ],
      },
    ],
  },
  timeline: {
    id: 'timeline',
    label: 'Timeline',
    icon: Clock,
    children: [
      {
        id: 'gantt',
        label: 'Gantt',
        children: [
          { id: 'gantt-all', label: 'Tous les projets' },
          { id: 'gantt-active', label: 'Projets actifs' },
        ],
      },
      {
        id: 'calendar',
        label: 'Calendrier',
        children: [
          { id: 'calendar-month', label: 'Mois' },
          { id: 'calendar-week', label: 'Semaine' },
        ],
      },
      {
        id: 'milestones',
        label: 'Jalons',
        children: [
          { id: 'milestones-upcoming', label: 'À venir' },
          { id: 'milestones-overdue', label: 'En retard' },
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
  const searchIn = parentChildren || Object.values(projetsNavigationConfig);
  
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

export function getSubCategories(mainCategory: ProjetsMainCategory): NavNode[] {
  return projetsNavigationConfig[mainCategory]?.children || [];
}

export function getSubSubCategories(mainCategory: ProjetsMainCategory, subCategory: string): NavNode[] {
  const mainNode = projetsNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

