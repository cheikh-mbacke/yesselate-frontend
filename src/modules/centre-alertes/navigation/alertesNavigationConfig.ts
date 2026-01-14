/**
 * Configuration de navigation hiérarchique pour Centre d'Alerte
 * Structure à 3 niveaux : Vue d'ensemble > Sous-sections > Pages
 */

import {
  LayoutDashboard,
  AlertTriangle,
  TimerReset,
  UserCog,
  Construction,
  ScrollText,
  Activity,
  PieChart,
  Building2,
  DollarSign,
  FileCheck,
  FileText,
  AlertCircle,
  Users,
  Clock,
  Ban,
  TrendingUp,
  Settings,
  History,
  type LucideIcon,
} from 'lucide-react';

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
export const alertesNavigation: AlerteNavItem[] = [
  {
    label: "Vue d'ensemble",
    icon: LayoutDashboard,
    id: 'overview',
    route: '/maitre-ouvrage/alerts/overview',
    children: [
      {
        id: 'indicateurs',
        label: 'Indicateurs en temps réel',
        icon: Activity,
        route: '/maitre-ouvrage/alerts/overview/indicateurs',
      },
      {
        id: 'typologie',
        label: 'Synthèse par typologie',
        icon: PieChart,
        route: '/maitre-ouvrage/alerts/overview/typologie',
      },
      {
        id: 'bureau',
        label: 'Synthèse par bureau',
        icon: Building2,
        route: '/maitre-ouvrage/alerts/overview/bureau',
      },
    ],
  },
  {
    label: 'Alertes critiques',
    icon: AlertTriangle,
    id: 'critiques',
    route: '/maitre-ouvrage/alerts/critiques',
    badgeType: 'critical',
    children: [
      {
        id: 'paiements',
        label: 'Paiements bloqués',
        icon: DollarSign,
        route: '/maitre-ouvrage/alerts/critiques/paiements',
        badgeType: 'critical',
      },
      {
        id: 'validations',
        label: 'Validations bloquées',
        icon: FileCheck,
        route: '/maitre-ouvrage/alerts/critiques/validations',
        badgeType: 'critical',
      },
      {
        id: 'justificatifs',
        label: 'Justificatifs manquants',
        icon: FileText,
        route: '/maitre-ouvrage/alerts/critiques/justificatifs',
        badgeType: 'critical',
      },
      {
        id: 'financiers',
        label: 'Risques financiers',
        icon: AlertCircle,
        route: '/maitre-ouvrage/alerts/critiques/financiers',
        badgeType: 'critical',
      },
    ],
  },
  {
    label: 'Alertes SLA',
    icon: TimerReset,
    id: 'sla',
    route: '/maitre-ouvrage/alerts/sla',
    badgeType: 'warning',
    children: [
      {
        id: 'depasse',
        label: 'SLA dépassés',
        icon: Clock,
        route: '/maitre-ouvrage/alerts/sla/depasse',
        badgeType: 'critical',
      },
      {
        id: 'risque',
        label: 'SLA à risque',
        icon: AlertTriangle,
        route: '/maitre-ouvrage/alerts/sla/risque',
        badgeType: 'warning',
      },
      {
        id: 'attente',
        label: 'SLA en attente',
        icon: Clock,
        route: '/maitre-ouvrage/alerts/sla/attente',
        badgeType: 'default',
      },
    ],
  },
  {
    label: 'Alertes RH',
    icon: UserCog,
    id: 'rh',
    route: '/maitre-ouvrage/alerts/rh',
    badgeType: 'warning',
    children: [
      {
        id: 'absences',
        label: 'Absences bloquantes',
        icon: Users,
        route: '/maitre-ouvrage/alerts/rh/absences',
        badgeType: 'warning',
      },
      {
        id: 'surallocation',
        label: 'Sur-allocation ressources',
        icon: TrendingUp,
        route: '/maitre-ouvrage/alerts/rh/surallocation',
        badgeType: 'warning',
      },
      {
        id: 'retards',
        label: 'Retards RH',
        icon: Clock,
        route: '/maitre-ouvrage/alerts/rh/retards',
        badgeType: 'warning',
      },
    ],
  },
  {
    label: 'Alertes projets',
    icon: Construction,
    id: 'projets',
    route: '/maitre-ouvrage/alerts/projets',
    badgeType: 'warning',
    children: [
      {
        id: 'retards',
        label: 'Retards détectés',
        icon: Clock,
        route: '/maitre-ouvrage/alerts/projets/retards',
        badgeType: 'warning',
      },
      {
        id: 'jalons',
        label: 'Jalons non tenus',
        icon: Ban,
        route: '/maitre-ouvrage/alerts/projets/jalons',
        badgeType: 'warning',
      },
      {
        id: 'blocages',
        label: 'Blocages MOA/MOE',
        icon: AlertCircle,
        route: '/maitre-ouvrage/alerts/projets/blocages',
        badgeType: 'critical',
      },
    ],
  },
  {
    label: 'Historique & gouvernance',
    icon: ScrollText,
    id: 'historique',
    route: '/maitre-ouvrage/alerts/historique',
    children: [
      {
        id: 'alertes',
        label: 'Historique des alertes',
        icon: History,
        route: '/maitre-ouvrage/alerts/historique/alertes',
      },
      {
        id: 'regles',
        label: "Règles d'alerte",
        icon: Settings,
        route: '/maitre-ouvrage/alerts/historique/regles',
      },
      {
        id: 'escalades',
        label: 'Escalades & suivis',
        icon: TrendingUp,
        route: '/maitre-ouvrage/alerts/historique/escalades',
      },
    ],
  },
];

// Helper pour trouver un nœud par ID
export function findNavNodeById(
  id: string,
  nodes: AlerteNavItem[] = alertesNavigation
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

// Helper pour trouver un nœud par route
export function findNavNodeByRoute(
  route: string,
  nodes: AlerteNavItem[] = alertesNavigation
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

