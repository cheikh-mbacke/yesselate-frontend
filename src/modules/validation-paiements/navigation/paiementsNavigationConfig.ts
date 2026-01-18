/**
 * Configuration de navigation pour le module Validation-Paiements
 */

import type { PaiementsMainCategory } from '../types/paiementsTypes';
import {
  LayoutDashboard,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  DollarSign,
  Users,
  FileSearch,
} from 'lucide-react';

export interface NavNode {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
  children?: NavNode[];
}

export const paiementsNavigationConfig: Record<PaiementsMainCategory, NavNode> = {
  overview: {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: LayoutDashboard,
    children: [
      { id: 'dashboard', label: 'Tableau de bord' },
      { id: 'kpis', label: 'Indicateurs clés' },
      { id: 'alerts', label: 'Alertes', badge: 0, badgeType: 'warning' },
    ],
  },
  pending: {
    id: 'pending',
    label: 'À valider',
    icon: Clock,
    children: [
      {
        id: 'all',
        label: 'Tous',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all-bureau-finance', label: 'Bureau Finance' },
          { id: 'all-direction-generale', label: 'Direction Générale' },
          { id: 'all-urgents', label: 'Urgents' },
        ],
      },
      {
        id: 'bf-pending',
        label: 'Bureau Finance',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'bf-critiques', label: 'Critiques' },
          { id: 'bf-haute-priorite', label: 'Haute priorité' },
          { id: 'bf-standard', label: 'Standard' },
        ],
      },
      {
        id: 'dg-pending',
        label: 'Direction Générale',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'dg-critiques', label: 'Critiques' },
          { id: 'dg-haute-priorite', label: 'Haute priorité' },
          { id: 'dg-standard', label: 'Standard' },
        ],
      },
    ],
  },
  urgent: {
    id: 'urgent',
    label: 'Urgents',
    icon: AlertTriangle,
    children: [
      {
        id: 'critical',
        label: 'Critiques',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'critical-bureau-finance', label: 'Bureau Finance' },
          { id: 'critical-direction-generale', label: 'Direction Générale' },
          { id: 'critical-sla-depasse', label: 'SLA dépassés' },
        ],
      },
      {
        id: 'high',
        label: 'Haute priorité',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'high-bureau-finance', label: 'Bureau Finance' },
          { id: 'high-direction-generale', label: 'Direction Générale' },
        ],
      },
    ],
  },
  validated: {
    id: 'validated',
    label: 'Validés',
    icon: CheckCircle2,
    children: [
      {
        id: 'today',
        label: 'Aujourd\'hui',
        children: [
          { id: 'today-bureau-finance', label: 'Bureau Finance' },
          { id: 'today-direction-generale', label: 'Direction Générale' },
        ],
      },
      {
        id: 'week',
        label: 'Cette semaine',
        children: [
          { id: 'week-bureau-finance', label: 'Bureau Finance' },
          { id: 'week-direction-generale', label: 'Direction Générale' },
        ],
      },
      {
        id: 'month',
        label: 'Ce mois',
        children: [
          { id: 'month-bureau-finance', label: 'Bureau Finance' },
          { id: 'month-direction-generale', label: 'Direction Générale' },
        ],
      },
    ],
  },
  rejected: {
    id: 'rejected',
    label: 'Rejetés',
    icon: XCircle,
    children: [
      { id: 'recent', label: 'Récents' },
      { id: 'archived', label: 'Archivés' },
    ],
  },
  scheduled: {
    id: 'scheduled',
    label: 'Planifiés',
    icon: Calendar,
    children: [
      {
        id: 'upcoming',
        label: 'À venir',
        badge: 0,
        children: [
          { id: 'upcoming-semaine', label: 'Cette semaine' },
          { id: 'upcoming-mois', label: 'Ce mois' },
        ],
      },
      {
        id: 'in-progress',
        label: 'En cours',
        badge: 0,
        children: [
          { id: 'in-progress-semaine', label: 'Cette semaine' },
          { id: 'in-progress-mois', label: 'Ce mois' },
        ],
      },
    ],
  },
  tresorerie: {
    id: 'tresorerie',
    label: 'Trésorerie',
    icon: DollarSign,
    children: [
      { id: 'overview-tresorerie', label: 'Vue d\'ensemble' },
      { id: 'forecast', label: 'Prévisions' },
      { id: 'history', label: 'Historique' },
    ],
  },
  fournisseurs: {
    id: 'fournisseurs',
    label: 'Fournisseurs',
    icon: Users,
    children: [
      {
        id: 'all',
        label: 'Tous',
        children: [
          { id: 'fournisseurs-actifs', label: 'Actifs' },
          { id: 'fournisseurs-inactifs', label: 'Inactifs' },
        ],
      },
      {
        id: 'active',
        label: 'Actifs',
        children: [
          { id: 'active-top', label: 'Top fournisseurs' },
          { id: 'active-recents', label: 'Récents' },
        ],
      },
      {
        id: 'watchlist',
        label: 'Surveillance',
        children: [
          { id: 'watchlist-retards', label: 'Retards' },
          { id: 'watchlist-litiges', label: 'Litiges' },
        ],
      },
    ],
  },
  audit: {
    id: 'audit',
    label: 'Audit',
    icon: FileSearch,
    children: [
      { id: 'trail', label: 'Piste d\'audit' },
      { id: 'reports', label: 'Rapports' },
      { id: 'compliance', label: 'Conformité' },
    ],
  },
};

/**
 * Trouve un nœud de navigation par son ID (recherche récursive)
 */
export function findNavNodeById(id: string, parentChildren?: NavNode[]): NavNode | undefined {
  const searchIn = parentChildren || Object.values(paiementsNavigationConfig);
  
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

/**
 * Récupère les sous-catégories (niveau 2) d'une catégorie principale
 */
export function getSubCategories(mainCategory: PaiementsMainCategory): NavNode[] {
  return paiementsNavigationConfig[mainCategory]?.children || [];
}

/**
 * Récupère les sous-sous-catégories (niveau 3) d'une sous-catégorie
 */
export function getSubSubCategories(mainCategory: PaiementsMainCategory, subCategory: string): NavNode[] {
  const mainNode = paiementsNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

