/**
 * Configuration de navigation pour le module Demandes
 */

import type { DemandeMainCategory } from '../types/demandesTypes';
import {
  LayoutGrid,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  CalendarX,
  ShoppingCart,
  Building2,
  Scale,
  MoreHorizontal,
} from 'lucide-react';

export interface NavNode {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
  children?: NavNode[]; // Niveau 2 (sub-category)
  // Les children peuvent avoir leurs propres children pour le niveau 3 (sub-sub-category)
}

export const demandesNavigationConfig: Record<DemandeMainCategory, NavNode> = {
  overview: {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: LayoutGrid,
    children: [
      { id: 'dashboard', label: 'Tableau de bord' },
      { id: 'statistiques', label: 'Statistiques' },
      { id: 'tendances', label: 'Tendances' },
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
        badge: 45,
        badgeType: 'warning',
        children: [
          { id: 'en-attente-achats', label: 'Achats' },
          { id: 'en-attente-finance', label: 'Finance' },
          { id: 'en-attente-juridique', label: 'Juridique' },
        ],
      },
      {
        id: 'urgentes',
        label: 'Urgentes',
        badge: 12,
        badgeType: 'critical',
        children: [
          { id: 'urgentes-achats', label: 'Achats' },
          { id: 'urgentes-finance', label: 'Finance' },
          { id: 'urgentes-juridique', label: 'Juridique' },
        ],
      },
      { id: 'validees', label: 'Validées' },
      { id: 'rejetees', label: 'Rejetées' },
      {
        id: 'en-retard',
        label: 'En retard',
        badge: 8,
        badgeType: 'warning',
        children: [
          { id: 'en-retard-achats', label: 'Achats' },
          { id: 'en-retard-finance', label: 'Finance' },
        ],
      },
    ],
  },
  actions: {
    id: 'actions',
    label: 'Actions prioritaires',
    icon: AlertCircle,
    children: [
      { id: 'achats', label: 'Achats' },
      { id: 'finance', label: 'Finance' },
      { id: 'juridique', label: 'Juridique' },
    ],
  },
  services: {
    id: 'services',
    label: 'Par service',
    icon: Building2,
    children: [
      { id: 'service-achats', label: 'Service Achats' },
      { id: 'service-finance', label: 'Service Finance' },
      { id: 'service-juridique', label: 'Service Juridique' },
      { id: 'autres-services', label: 'Autres services' },
    ],
  },
};

/**
 * Trouve un nœud de navigation par son ID (recherche récursive dans tous les niveaux)
 */
export function findNavNodeById(id: string, parentChildren?: NavNode[]): NavNode | undefined {
  const searchIn = parentChildren || Object.values(demandesNavigationConfig);
  
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
export function getSubCategories(mainCategory: DemandeMainCategory): NavNode[] {
  return demandesNavigationConfig[mainCategory]?.children || [];
}

/**
 * Récupère les sous-sous-catégories (niveau 3) d'une sous-catégorie
 */
export function getSubSubCategories(mainCategory: DemandeMainCategory, subCategory: string): NavNode[] {
  const mainNode = demandesNavigationConfig[mainCategory];
  const subNode = mainNode?.children?.find((child) => child.id === subCategory);
  return subNode?.children || [];
}

