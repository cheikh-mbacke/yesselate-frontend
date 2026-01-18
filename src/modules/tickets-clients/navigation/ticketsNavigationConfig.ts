/**
 * Configuration de navigation pour le module Tickets-Clients
 */

import type { TicketsMainCategory } from '../types/ticketsTypes';
import {
  LayoutDashboard,
  Ticket,
  Clock,
  PlayCircle,
  Pause,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertCircle,
  User,
  Timer,
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

export const ticketsNavigationConfig: Record<TicketsMainCategory, NavNode> = {
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
    label: 'Tous les tickets',
    icon: Ticket,
    children: [
      {
        id: 'all-open',
        label: 'Ouverts',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'open-bureau-finance', label: 'Bureau Finance' },
          { id: 'open-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'all-resolved',
        label: 'Résolus',
        badge: 0,
        children: [
          { id: 'resolved-today', label: "Aujourd'hui" },
          { id: 'resolved-week', label: 'Cette semaine' },
        ],
      },
      {
        id: 'all-critical',
        label: 'Critiques',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'critical-bureau-finance', label: 'Bureau Finance' },
        ],
      },
    ],
  },
  open: {
    id: 'open',
    label: 'Ouverts',
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
        id: 'new',
        label: 'Nouveaux',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'new-today', label: "Aujourd'hui" },
          { id: 'new-week', label: 'Cette semaine' },
        ],
      },
      {
        id: 'unassigned',
        label: 'Non assignés',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'unassigned-bureau-finance', label: 'Bureau Finance' },
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
        id: 'recent',
        label: 'Récents',
        badge: 0,
        children: [
          { id: 'recent-today', label: "Aujourd'hui" },
          { id: 'recent-week', label: 'Cette semaine' },
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
  pending: {
    id: 'pending',
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
        id: 'customer-response',
        label: 'Réponse client',
        badge: 0,
        children: [
          { id: 'customer-today', label: "Aujourd'hui" },
          { id: 'customer-week', label: 'Cette semaine' },
        ],
      },
      {
        id: 'internal',
        label: 'Interne',
        badge: 0,
        children: [
          { id: 'internal-bureau-finance', label: 'Bureau Finance' },
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
          { id: 'recent-today', label: "Aujourd'hui" },
          { id: 'recent-week', label: 'Cette semaine' },
          { id: 'recent-month', label: 'Ce mois' },
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
  closed: {
    id: 'closed',
    label: 'Fermés',
    icon: XCircle,
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
        id: 'this-week',
        label: 'Cette semaine',
        badge: 0,
        children: [
          { id: 'week-bureau-finance', label: 'Bureau Finance' },
        ],
      },
      {
        id: 'this-month',
        label: 'Ce mois',
        badge: 0,
        children: [
          { id: 'month-bureau-finance', label: 'Bureau Finance' },
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
        id: 'critical',
        label: 'Critique',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'critical-open', label: 'Ouverts' },
          { id: 'critical-in-progress', label: 'En cours' },
        ],
      },
      {
        id: 'high',
        label: 'Haute',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'high-open', label: 'Ouverts' },
          { id: 'high-in-progress', label: 'En cours' },
        ],
      },
      {
        id: 'medium',
        label: 'Moyenne',
        badge: 0,
        children: [
          { id: 'medium-open', label: 'Ouverts' },
          { id: 'medium-in-progress', label: 'En cours' },
        ],
      },
      {
        id: 'low',
        label: 'Basse',
        badge: 0,
        children: [
          { id: 'low-open', label: 'Ouverts' },
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
        id: 'open',
        label: 'Ouvert',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'open-new', label: 'Nouveaux' },
          { id: 'open-assigned', label: 'Assignés' },
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
  'by-assignee': {
    id: 'by-assignee',
    label: 'Par assigné',
    icon: User,
    children: [
      {
        id: 'unassigned',
        label: 'Non assignés',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'unassigned-new', label: 'Nouveaux' },
          { id: 'unassigned-old', label: 'Anciens' },
        ],
      },
      {
        id: 'team',
        label: 'Par équipe',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'team-finance', label: 'Équipe Finance' },
          { id: 'team-juridique', label: 'Équipe Juridique' },
        ],
      },
      {
        id: 'individual',
        label: 'Individuel',
        badge: 0,
        children: [
          { id: 'individual-active', label: 'Actifs' },
          { id: 'individual-completed', label: 'Terminés' },
        ],
      },
    ],
  },
  sla: {
    id: 'sla',
    label: 'SLA',
    icon: Timer,
    children: [
      {
        id: 'breached',
        label: 'Violés',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'breached-today', label: "Aujourd'hui" },
          { id: 'breached-week', label: 'Cette semaine' },
        ],
      },
      {
        id: 'at-risk',
        label: 'À risque',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'at-risk-today', label: "Aujourd'hui" },
          { id: 'at-risk-week', label: 'Cette semaine' },
        ],
      },
      {
        id: 'on-track',
        label: 'En bonne voie',
        badge: 0,
        children: [
          { id: 'on-track-active', label: 'Actifs' },
          { id: 'on-track-completed', label: 'Terminés' },
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
  const searchIn = parentChildren || Object.values(ticketsNavigationConfig);
  
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

export function getSubCategories(mainCategory: TicketsMainCategory): NavNode[] {
  return ticketsNavigationConfig[mainCategory]?.children || [];
}

export function getSubSubCategories(mainCategory: TicketsMainCategory, subCategory: string): NavNode[] {
  const mainNode = ticketsNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

