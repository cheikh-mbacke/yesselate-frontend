/**
 * Configuration de navigation pour le module Blocked
 */

import type { BlockedMainCategory } from '../types/blockedTypes';
import {
  LayoutDashboard,
  List,
  AlertTriangle,
  Grid3x3,
  Building2,
  Clock,
  CheckCircle2,
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

export const blockedNavigationConfig: Record<BlockedMainCategory, NavNode> = {
  overview: {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: LayoutDashboard,
    children: [
      { id: 'summary', label: 'Synthèse' },
      { id: 'kpis', label: 'KPIs' },
      { id: 'trends', label: 'Tendances' },
      { id: 'alerts', label: 'Alertes', badge: 0, badgeType: 'warning' },
    ],
  },
  queue: {
    id: 'queue',
    label: 'Files d\'attente',
    icon: List,
    children: [
      {
        id: 'all',
        label: 'Tous',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'all-critical', label: 'Critiques' },
          { id: 'all-high', label: 'Priorité haute' },
          { id: 'all-medium', label: 'Priorité moyenne' },
          { id: 'all-low', label: 'Priorité basse' },
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
          { id: 'critical-bureau-travaux', label: 'Bureau Travaux' },
        ],
      },
      {
        id: 'high',
        label: 'Priorité haute',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'high-bureau-finance', label: 'Bureau Finance' },
          { id: 'high-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'medium',
        label: 'Priorité moyenne',
        badge: 0,
        children: [
          { id: 'medium-bureau-finance', label: 'Bureau Finance' },
        ],
      },
      {
        id: 'low',
        label: 'Priorité basse',
        badge: 0,
      },
    ],
  },
  critical: {
    id: 'critical',
    label: 'Critiques',
    icon: AlertTriangle,
    children: [
      {
        id: 'urgent',
        label: 'Urgents',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'urgent-bureau-finance', label: 'Bureau Finance' },
          { id: 'urgent-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'sla',
        label: 'SLA dépassés',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'sla-bureau-finance', label: 'Bureau Finance' },
          { id: 'sla-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'escalated',
        label: 'Escaladés',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'escalated-bureau-finance', label: 'Bureau Finance' },
        ],
      },
    ],
  },
  matrix: {
    id: 'matrix',
    label: 'Matrice urgence',
    icon: Grid3x3,
    children: [
      {
        id: 'impact',
        label: 'Par impact',
        children: [
          { id: 'impact-critical', label: 'Critique' },
          { id: 'impact-high', label: 'Élevé' },
          { id: 'impact-medium', label: 'Moyen' },
          { id: 'impact-low', label: 'Faible' },
        ],
      },
      {
        id: 'delay',
        label: 'Par délai',
        children: [
          { id: 'delay-overdue', label: 'En retard' },
          { id: 'delay-today', label: 'Aujourd\'hui' },
          { id: 'delay-week', label: 'Cette semaine' },
        ],
      },
      {
        id: 'amount',
        label: 'Par montant',
        children: [
          { id: 'amount-high', label: 'Montant élevé' },
          { id: 'amount-medium', label: 'Montant moyen' },
          { id: 'amount-low', label: 'Montant faible' },
        ],
      },
      {
        id: 'combined',
        label: 'Combiné',
        children: [
          { id: 'combined-critical', label: 'Critique + Retard' },
          { id: 'combined-high', label: 'Élevé + Retard' },
        ],
      },
    ],
  },
  bureaux: {
    id: 'bureaux',
    label: 'Par bureau',
    icon: Building2,
    children: [
      {
        id: 'all',
        label: 'Tous les bureaux',
        children: [
          { id: 'all-bureau-finance', label: 'Bureau Finance' },
          { id: 'all-bureau-juridique', label: 'Bureau Juridique' },
          { id: 'all-bureau-travaux', label: 'Bureau Travaux' },
        ],
      },
      {
        id: 'most',
        label: 'Plus impactés',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'most-bureau-finance', label: 'Bureau Finance' },
          { id: 'most-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'comparison',
        label: 'Comparaison',
        children: [
          { id: 'comparison-all', label: 'Tous bureaux' },
          { id: 'comparison-trends', label: 'Tendances' },
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
        id: 'recent',
        label: 'Récents',
        children: [
          { id: 'recent-today', label: 'Aujourd\'hui' },
          { id: 'recent-week', label: 'Cette semaine' },
        ],
      },
      {
        id: 'week',
        label: 'Cette semaine',
        children: [
          { id: 'week-resolved', label: 'Résolus' },
          { id: 'week-pending', label: 'En attente' },
        ],
      },
      {
        id: 'month',
        label: 'Ce mois',
        children: [
          { id: 'month-resolved', label: 'Résolus' },
          { id: 'month-pending', label: 'En attente' },
        ],
      },
      {
        id: 'history',
        label: 'Historique',
        children: [
          { id: 'history-all', label: 'Tout l\'historique' },
          { id: 'history-archived', label: 'Archivés' },
        ],
      },
    ],
  },
  decisions: {
    id: 'decisions',
    label: 'Décisions',
    icon: CheckCircle2,
    children: [
      {
        id: 'pending',
        label: 'En attente',
        badge: 0,
        badgeType: 'warning',
        children: [
          { id: 'pending-bureau-finance', label: 'Bureau Finance' },
          { id: 'pending-bureau-juridique', label: 'Bureau Juridique' },
        ],
      },
      {
        id: 'resolved',
        label: 'Résolus',
        badge: 0,
        children: [
          { id: 'resolved-today', label: 'Aujourd\'hui' },
          { id: 'resolved-week', label: 'Cette semaine' },
          { id: 'resolved-month', label: 'Ce mois' },
        ],
      },
      {
        id: 'escalated',
        label: 'Escaladés',
        badge: 0,
        badgeType: 'critical',
        children: [
          { id: 'escalated-bureau-finance', label: 'Bureau Finance' },
        ],
      },
      {
        id: 'substituted',
        label: 'Substitués',
        badge: 0,
        children: [
          { id: 'substituted-recent', label: 'Récents' },
          { id: 'substituted-history', label: 'Historique' },
        ],
      },
    ],
  },
  audit: {
    id: 'audit',
    label: 'Audit',
    icon: FileSearch,
    children: [
      { id: 'trail', label: 'Trace audit' },
      { id: 'chain', label: 'Chaîne de hash' },
      { id: 'reports', label: 'Rapports' },
      { id: 'export', label: 'Export' },
    ],
  },
};

/**
 * Trouve un nœud de navigation par son ID (recherche récursive)
 */
export function findNavNodeById(id: string, parentChildren?: NavNode[]): NavNode | undefined {
  const searchIn = parentChildren || Object.values(blockedNavigationConfig);
  
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
export function getSubCategories(mainCategory: BlockedMainCategory): NavNode[] {
  return blockedNavigationConfig[mainCategory]?.children || [];
}

/**
 * Récupère les sous-sous-catégories (niveau 3) d'une sous-catégorie
 */
export function getSubSubCategories(mainCategory: BlockedMainCategory, subCategory: string): NavNode[] {
  const mainNode = blockedNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

