/**
 * Configuration de navigation pour le module Validation-Contrats
 */

import type { ContratsMainCategory } from '../types/contratsTypes';
import {
  LayoutGrid,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MessageSquare,
  TrendingUp,
  DollarSign,
  FileText,
  AlertCircle,
} from 'lucide-react';

export interface NavNode {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
  children?: NavNode[];
}

export const contratsNavigationConfig: Record<ContratsMainCategory, NavNode> = {
  overview: {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: LayoutGrid,
    children: [
      { id: 'indicateurs', label: 'Indicateurs en temps réel' },
      { id: 'stats', label: 'Statistiques' },
      { id: 'trends', label: 'Tendances' },
    ],
  },
  statut: {
    id: 'statut',
    label: 'Par statut',
    icon: Clock,
    children: [
      {
        id: 'en-attente',
        label: 'En attente',
        badge: 12,
        badgeType: 'warning',
        children: [
          { id: 'en-attente-achats', label: 'Achats' },
          { id: 'en-attente-finance', label: 'Finance' },
          { id: 'en-attente-juridique', label: 'Juridique' },
          { id: 'en-attente-travaux', label: 'Travaux' },
        ],
      },
      {
        id: 'urgents',
        label: 'Urgents',
        badge: 3,
        badgeType: 'critical',
        children: [
          { id: 'urgents-achats', label: 'Achats' },
          { id: 'urgents-finance', label: 'Finance' },
          { id: 'urgents-juridique', label: 'Juridique' },
          { id: 'urgents-travaux', label: 'Travaux' },
        ],
      },
      {
        id: 'valides',
        label: 'Validés',
        badge: 45,
        children: [
          { id: 'valides-aujourdhui', label: 'Aujourd\'hui' },
          { id: 'valides-semaine', label: 'Cette semaine' },
          { id: 'valides-mois', label: 'Ce mois' },
          { id: 'valides-achats', label: 'Par service - Achats' },
          { id: 'valides-finance', label: 'Par service - Finance' },
        ],
      },
      {
        id: 'rejetes',
        label: 'Rejetés',
        badge: 8,
        children: [
          { id: 'rejetes-recents', label: 'Récents' },
          { id: 'rejetes-archives', label: 'Archivés' },
        ],
      },
      {
        id: 'negociation',
        label: 'En négociation',
        badge: 5,
        children: [
          { id: 'negociation-actifs', label: 'Actifs' },
          { id: 'negociation-en-attente', label: 'En attente réponse' },
        ],
      },
    ],
  },
  priorite: {
    id: 'priorite',
    label: 'Contrats à valider',
    icon: AlertCircle,
    children: [
      {
        id: 'critiques',
        label: 'Critiques',
        badge: 3,
        badgeType: 'critical',
        children: [
          { id: 'critiques-achats', label: 'Achats' },
          { id: 'critiques-finance', label: 'Finance' },
          { id: 'critiques-juridique', label: 'Juridique' },
        ],
      },
      {
        id: 'moyens',
        label: 'Moyens',
        badge: 5,
        badgeType: 'warning',
        children: [
          { id: 'moyens-achats', label: 'Achats' },
          { id: 'moyens-finance', label: 'Finance' },
        ],
      },
      {
        id: 'faible-priorite',
        label: 'Faible priorité',
        badge: 4,
      },
    ],
  },
  analyse: {
    id: 'analyse',
    label: 'Analyse & gouvernance',
    icon: TrendingUp,
    children: [
      { id: 'analytics', label: 'Analytics' },
      { id: 'vue-financiere', label: 'Vue financière' },
      { id: 'documents', label: 'Documents liés' },
      { id: 'regles-metier', label: 'Règles métier' },
    ],
  },
};

/**
 * Trouve un nœud de navigation par son ID (recherche récursive)
 */
export function findNavNodeById(id: string, parentChildren?: NavNode[]): NavNode | undefined {
  const searchIn = parentChildren || Object.values(contratsNavigationConfig);
  
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
export function getSubCategories(mainCategory: ContratsMainCategory): NavNode[] {
  return contratsNavigationConfig[mainCategory]?.children || [];
}

/**
 * Récupère les sous-sous-catégories (niveau 3) d'une sous-catégorie
 */
export function getSubSubCategories(mainCategory: ContratsMainCategory, subCategory: string): NavNode[] {
  const mainNode = contratsNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

