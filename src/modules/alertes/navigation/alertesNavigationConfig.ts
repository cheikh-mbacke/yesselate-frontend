/**
 * Configuration de navigation hiérarchique pour Alertes & Risques
 * Structure à 3 niveaux : Onglets > Sous-onglets > Sous-sous-onglets
 */

import {
  LayoutDashboard,
  BellRing,
  AlertTriangle,
  Clock,
  Shield,
  CheckCircle2,
  XCircle,
  FileText,
  Settings,
  History,
  TrendingUp,
  User,
  Building2,
  DollarSign,
  FileCheck,
  AlertCircle,
  Ban,
  Zap,
  Workflow,
  Activity,
  Calendar,
  Repeat,
  type LucideIcon,
} from 'lucide-react';
import type { AlerteNavigationNode } from '../types/alertesTypes';

export interface AlerteNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  route: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
  children?: AlerteNavItem[];
}

/**
 * Configuration complète de navigation
 */
export const alertesNavigationConfig: AlerteNavItem[] = [
  {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: LayoutDashboard,
    route: '/maitre-ouvrage/alertes/overview',
    children: [
      {
        id: 'indicateurs',
        label: 'Indicateurs en temps réel',
        icon: Activity,
        route: '/maitre-ouvrage/alertes/overview/indicateurs',
      },
      {
        id: 'typologie',
        label: 'Synthèse par typologie',
        icon: FileText,
        route: '/maitre-ouvrage/alertes/overview/typologie',
      },
      {
        id: 'bureaux',
        label: 'Synthèse par bureau',
        icon: Building2,
        route: '/maitre-ouvrage/alertes/overview/bureaux',
      },
    ],
  },
  {
    id: 'en-cours',
    label: 'Alertes en cours',
    icon: BellRing,
    route: '/maitre-ouvrage/alertes/en-cours',
    badge: 0,
    badgeType: 'warning',
    children: [
      {
        id: 'critiques',
        label: 'Critiques',
        icon: AlertTriangle,
        route: '/maitre-ouvrage/alertes/en-cours/critiques',
        badge: 0,
        badgeType: 'critical',
        children: [
          {
            id: 'paiements-bloques',
            label: 'Paiements bloqués',
            icon: DollarSign,
            route: '/maitre-ouvrage/alertes/en-cours/critiques/paiements-bloques',
            badge: 0,
            badgeType: 'critical',
          },
          {
            id: 'validations-bloquees',
            label: 'Validations bloquées',
            icon: FileCheck,
            route: '/maitre-ouvrage/alertes/en-cours/critiques/validations-bloquees',
            badge: 0,
            badgeType: 'critical',
          },
          {
            id: 'justificatifs-manquants',
            label: 'Justificatifs manquants',
            icon: FileText,
            route: '/maitre-ouvrage/alertes/en-cours/critiques/justificatifs-manquants',
            badge: 0,
            badgeType: 'critical',
          },
          {
            id: 'risques-financiers',
            label: 'Risques financiers',
            icon: AlertCircle,
            route: '/maitre-ouvrage/alertes/en-cours/critiques/risques-financiers',
            badge: 0,
            badgeType: 'critical',
          },
        ],
      },
      {
        id: 'avertissements',
        label: 'Avertissements',
        icon: AlertCircle,
        route: '/maitre-ouvrage/alertes/en-cours/avertissements',
        badge: 0,
        badgeType: 'warning',
        children: [
          {
            id: 'delais-approchants',
            label: 'Délais approchants',
            icon: Clock,
            route: '/maitre-ouvrage/alertes/en-cours/avertissements/delais-approchants',
            badge: 0,
            badgeType: 'warning',
          },
          {
            id: 'documents-incomplets',
            label: 'Documents incomplets',
            icon: FileText,
            route: '/maitre-ouvrage/alertes/en-cours/avertissements/documents-incomplets',
            badge: 0,
            badgeType: 'warning',
          },
          {
            id: 'risques-mineurs',
            label: 'Risques mineurs',
            icon: AlertCircle,
            route: '/maitre-ouvrage/alertes/en-cours/avertissements/risques-mineurs',
            badge: 0,
            badgeType: 'warning',
          },
        ],
      },
      {
        id: 'sla-depasses',
        label: 'SLA dépassés',
        icon: Clock,
        route: '/maitre-ouvrage/alertes/en-cours/sla-depasses',
        badge: 0,
        badgeType: 'warning',
        children: [
          {
            id: 'validation-bc',
            label: 'Validation BC',
            icon: FileCheck,
            route: '/maitre-ouvrage/alertes/en-cours/sla-depasses/validation-bc',
            badge: 0,
            badgeType: 'warning',
          },
          {
            id: 'engagement-budgetaire',
            label: 'Engagement budgétaire',
            icon: DollarSign,
            route: '/maitre-ouvrage/alertes/en-cours/sla-depasses/engagement-budgetaire',
            badge: 0,
            badgeType: 'warning',
          },
          {
            id: 'paiement-fournisseur',
            label: 'Paiement fournisseur',
            icon: DollarSign,
            route: '/maitre-ouvrage/alertes/en-cours/sla-depasses/paiement-fournisseur',
            badge: 0,
            badgeType: 'warning',
          },
        ],
      },
      {
        id: 'blocages',
        label: 'Blocages',
        icon: Ban,
        route: '/maitre-ouvrage/alertes/en-cours/blocages',
        badge: 0,
        badgeType: 'warning',
        children: [
          {
            id: 'absence-responsable',
            label: 'Absence de responsable',
            icon: User,
            route: '/maitre-ouvrage/alertes/en-cours/blocages/absence-responsable',
            badge: 0,
            badgeType: 'warning',
          },
          {
            id: 'chaine-validation-interrompue',
            label: 'Chaîne de validation interrompue',
            icon: Workflow,
            route: '/maitre-ouvrage/alertes/en-cours/blocages/chaine-validation-interrompue',
            badge: 0,
            badgeType: 'warning',
          },
          {
            id: 'erreurs-systeme',
            label: 'Erreurs système',
            icon: Zap,
            route: '/maitre-ouvrage/alertes/en-cours/blocages/erreurs-systeme',
            badge: 0,
            badgeType: 'warning',
          },
        ],
      },
    ],
  },
  {
    id: 'traitements',
    label: 'Traitements',
    icon: CheckCircle2,
    route: '/maitre-ouvrage/alertes/traitements',
    children: [
      {
        id: 'acquittees',
        label: 'Acquittées',
        icon: CheckCircle2,
        route: '/maitre-ouvrage/alertes/traitements/acquittees',
        children: [
          {
            id: 'par-responsable',
            label: 'Par responsable',
            icon: User,
            route: '/maitre-ouvrage/alertes/traitements/acquittees/par-responsable',
          },
          {
            id: 'par-bureau',
            label: 'Par bureau',
            icon: Building2,
            route: '/maitre-ouvrage/alertes/traitements/acquittees/par-bureau',
          },
          {
            id: 'par-typologie',
            label: 'Par typologie',
            icon: FileText,
            route: '/maitre-ouvrage/alertes/traitements/acquittees/par-typologie',
          },
        ],
      },
      {
        id: 'resolues',
        label: 'Résolues',
        icon: CheckCircle2,
        route: '/maitre-ouvrage/alertes/traitements/resolues',
        children: [
          {
            id: 'resolution-manuelle',
            label: 'Résolution manuelle',
            icon: User,
            route: '/maitre-ouvrage/alertes/traitements/resolues/resolution-manuelle',
          },
          {
            id: 'resolution-automatique',
            label: 'Résolution automatique',
            icon: Zap,
            route: '/maitre-ouvrage/alertes/traitements/resolues/resolution-automatique',
          },
          {
            id: 'resolution-assistee-ia',
            label: 'Résolution assistée IA',
            icon: TrendingUp,
            route: '/maitre-ouvrage/alertes/traitements/resolues/resolution-assistee-ia',
          },
        ],
      },
    ],
  },
  {
    id: 'governance',
    label: 'Gouvernance & Historique',
    icon: Settings,
    route: '/maitre-ouvrage/alertes/governance',
    children: [
      {
        id: 'regles',
        label: 'Règles d\'alerte',
        icon: Settings,
        route: '/maitre-ouvrage/alertes/governance/regles',
        children: [
          {
            id: 'seuils-financiers',
            label: 'Seuils financiers',
            icon: DollarSign,
            route: '/maitre-ouvrage/alertes/governance/regles/seuils-financiers',
          },
          {
            id: 'delais-sla',
            label: 'Délais SLA',
            icon: Clock,
            route: '/maitre-ouvrage/alertes/governance/regles/delais-sla',
          },
          {
            id: 'typologies-critiques',
            label: 'Typologies critiques',
            icon: AlertTriangle,
            route: '/maitre-ouvrage/alertes/governance/regles/typologies-critiques',
          },
        ],
      },
      {
        id: 'historique',
        label: 'Historique',
        icon: History,
        route: '/maitre-ouvrage/alertes/governance/historique',
        children: [
          {
            id: 'par-mois',
            label: 'Par mois',
            icon: Calendar,
            route: '/maitre-ouvrage/alertes/governance/historique/par-mois',
          },
          {
            id: 'par-projet',
            label: 'Par projet',
            icon: Building2,
            route: '/maitre-ouvrage/alertes/governance/historique/par-projet',
          },
          {
            id: 'par-responsable',
            label: 'Par responsable',
            icon: User,
            route: '/maitre-ouvrage/alertes/governance/historique/par-responsable',
          },
        ],
      },
      {
        id: 'suivis-escalades',
        label: 'Suivis & escalades',
        icon: TrendingUp,
        route: '/maitre-ouvrage/alertes/governance/suivis-escalades',
        children: [
          {
            id: 'alertes-escaladees',
            label: 'Alertes escaladées',
            icon: TrendingUp,
            route: '/maitre-ouvrage/alertes/governance/suivis-escalades/alertes-escaladees',
          },
          {
            id: 'alertes-ignorees',
            label: 'Alertes ignorées',
            icon: XCircle,
            route: '/maitre-ouvrage/alertes/governance/suivis-escalades/alertes-ignorees',
          },
          {
            id: 'alertes-recurrentes',
            label: 'Alertes récurrentes',
            icon: Repeat,
            route: '/maitre-ouvrage/alertes/governance/suivis-escalades/alertes-recurrentes',
          },
        ],
      },
    ],
  },
];

// Helper pour trouver un nœud par route
export function findNavNodeByRoute(
  route: string,
  nodes: AlerteNavItem[] = alertesNavigationConfig
): AlerteNavItem | null {
  for (const node of nodes) {
    if (node.route === route) return node;
    if (node.children) {
      const found = findNavNodeByRoute(route, node.children);
      if (found) return found;
    }
  }
  return null;
}

// Helper pour obtenir le chemin complet d'un nœud
export function getNavNodePath(
  route: string,
  nodes: AlerteNavItem[] = alertesNavigationConfig
): AlerteNavItem[] {
  for (const node of nodes) {
    if (node.route === route) return [node];
    if (node.children) {
      const path = getNavNodePath(route, node.children);
      if (path.length > 0) return [node, ...path];
    }
  }
  return [];
}

// Helper pour obtenir tous les nœuds de niveau 1
export function getTopLevelNodes(): AlerteNavItem[] {
  return alertesNavigationConfig;
}

// Helper pour obtenir les enfants d'un nœud
export function getNavNodeChildren(nodeId: string): AlerteNavItem[] {
  const node = findNavNodeById(nodeId);
  return node?.children || [];
}

// Helper pour trouver un nœud par ID
export function findNavNodeById(
  id: string,
  nodes: AlerteNavItem[] = alertesNavigationConfig
): AlerteNavItem | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNavNodeById(id, node.children);
      if (found) return found;
    }
  }
  return null;
}

