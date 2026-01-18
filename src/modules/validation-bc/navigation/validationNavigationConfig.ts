/**
 * Configuration de navigation hiérarchique pour Validation-BC
 * Structure à 3 niveaux : Vue d'ensemble > Sous-sections > Pages
 */

import {
  LayoutDashboard,
  FileCheck,
  ShoppingCart,
  Receipt,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  TrendingUp,
  Users,
  Building2,
  Shield,
  type LucideIcon,
} from 'lucide-react';

export interface ValidationNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  route: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
  children?: ValidationNavItem[];
}

/**
 * Configuration complète de navigation
 */
export const validationNavigation: ValidationNavItem[] = [
  {
    label: "Vue d'ensemble",
    icon: LayoutDashboard,
    id: 'overview',
    route: '/maitre-ouvrage/validation-bc/overview',
    children: [
      {
        id: 'indicateurs',
        label: 'Indicateurs en temps réel',
        icon: LayoutDashboard,
        route: '/maitre-ouvrage/validation-bc/overview/indicateurs',
      },
      {
        id: 'stats',
        label: 'Statistiques',
        icon: TrendingUp,
        route: '/maitre-ouvrage/validation-bc/overview/stats',
      },
      {
        id: 'tendances',
        label: 'Tendances',
        icon: TrendingUp,
        route: '/maitre-ouvrage/validation-bc/overview/tendances',
      },
    ],
  },
  {
    label: 'Par type de document',
    icon: FileCheck,
    id: 'types',
    route: '/maitre-ouvrage/validation-bc/types',
    children: [
      {
        id: 'bc',
        label: 'Bons de Commande',
        icon: ShoppingCart,
        route: '/maitre-ouvrage/validation-bc/types/bc',
        badge: 23,
        badgeType: 'warning',
      },
      {
        id: 'factures',
        label: 'Factures',
        icon: Receipt,
        route: '/maitre-ouvrage/validation-bc/types/factures',
        badge: 15,
        badgeType: 'warning',
      },
      {
        id: 'avenants',
        label: 'Avenants',
        icon: FileText,
        route: '/maitre-ouvrage/validation-bc/types/avenants',
        badge: 8,
        badgeType: 'default',
      },
    ],
  },
  {
    label: 'Par statut',
    icon: Clock,
    id: 'statut',
    route: '/maitre-ouvrage/validation-bc/statut',
    children: [
      {
        id: 'en-attente',
        label: 'En attente',
        icon: Clock,
        route: '/maitre-ouvrage/validation-bc/statut/en-attente',
        badge: 46,
        badgeType: 'warning',
      },
      {
        id: 'valides',
        label: 'Validés',
        icon: CheckCircle2,
        route: '/maitre-ouvrage/validation-bc/statut/valides',
        badge: 87,
        badgeType: 'default',
      },
      {
        id: 'rejetes',
        label: 'Rejetés',
        icon: XCircle,
        route: '/maitre-ouvrage/validation-bc/statut/rejetes',
        badge: 8,
        badgeType: 'default',
      },
      {
        id: 'urgents',
        label: 'Urgents',
        icon: AlertTriangle,
        route: '/maitre-ouvrage/validation-bc/statut/urgents',
        badge: 12,
        badgeType: 'critical',
      },
    ],
  },
  {
    label: 'Historique',
    icon: History,
    id: 'historique',
    route: '/maitre-ouvrage/validation-bc/historique',
    children: [
      {
        id: 'validations',
        label: 'Historique des validations',
        icon: CheckCircle2,
        route: '/maitre-ouvrage/validation-bc/historique/validations',
      },
      {
        id: 'rejets',
        label: 'Historique des rejets',
        icon: XCircle,
        route: '/maitre-ouvrage/validation-bc/historique/rejets',
      },
    ],
  },
  {
    label: 'Analyse & gouvernance',
    icon: TrendingUp,
    id: 'analyse',
    route: '/maitre-ouvrage/validation-bc/analyse',
    children: [
      {
        id: 'tendances',
        label: 'Tendances',
        icon: TrendingUp,
        route: '/maitre-ouvrage/validation-bc/analyse/tendances',
      },
      {
        id: 'validateurs',
        label: 'Validateurs',
        icon: Users,
        route: '/maitre-ouvrage/validation-bc/analyse/validateurs',
      },
      {
        id: 'services',
        label: 'Services',
        icon: Building2,
        route: '/maitre-ouvrage/validation-bc/analyse/services',
      },
      {
        id: 'regles-metier',
        label: 'Règles métier',
        icon: Shield,
        route: '/maitre-ouvrage/validation-bc/analyse/regles-metier',
      },
    ],
  },
];

// Helper pour trouver un nœud par ID
export function findNavNodeById(
  id: string,
  nodes: ValidationNavItem[] = validationNavigation
): ValidationNavItem | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNavNodeById(id, node.children);
      if (found) return found;
    }
  }
  return null;
}

// Helper pour trouver un nœud par route
export function findNavNodeByRoute(
  route: string,
  nodes: ValidationNavItem[] = validationNavigation
): ValidationNavItem | null {
  for (const node of nodes) {
    if (node.route === route) return node;
    if (node.children) {
      const found = findNavNodeByRoute(route, node.children);
      if (found) return found;
    }
  }
  return null;
}

