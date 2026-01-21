/**
 * Navigation Maître d'Ouvrage
 * Configuration de navigation pour le panneau métier 3 niveaux
 */

import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Scale,
  Calendar,
  AlertTriangle,
  FileText,
  Users,
  DollarSign,
  Building2,
  CheckCircle2,
  Settings,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
  href?: string;
  defaultView?: string;
}

export interface NavDomain {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  defaultOpen?: boolean;
  items: NavItem[];
}

export const navMaitreOuvrage: NavDomain[] = [
  {
    id: 'pilotage',
    label: 'Pilotage',
    icon: BarChart3,
    defaultOpen: true,
    items: [
      { id: 'dashboard', label: 'Tableau de bord', href: '/maitre-ouvrage/dashboard' },
      { id: 'governance', label: 'Gouvernance', href: '/maitre-ouvrage/governance', badge: 7, badgeType: 'warning' },
      { id: 'calendrier', label: 'Calendrier', href: '/maitre-ouvrage/calendrier' },
      { id: 'analytics', label: 'Analytics & Rapports', href: '/maitre-ouvrage/analytics' },
      { id: 'alerts', label: 'Centre d\'alertes', href: '/maitre-ouvrage/alerts', badge: 5, badgeType: 'critical' },
    ],
  },
  {
    id: 'execution',
    label: 'Exécution',
    icon: CheckCircle2,
    items: [
      { id: 'demandes', label: 'Demandes', href: '/maitre-ouvrage/demandes', badge: 14, badgeType: 'critical' },
      { id: 'validation-bc', label: 'Validation BC/Factures', href: '/maitre-ouvrage/validation-bc', badge: 13 },
      { id: 'validation-contrats', label: 'Validation Contrats', href: '/maitre-ouvrage/validation-contrats', badge: 3 },
      { id: 'validation-paiements', label: 'Validation Paiements', href: '/maitre-ouvrage/validation-paiements', badge: 5 },
      { id: 'blocked', label: 'Dossiers bloqués', href: '/maitre-ouvrage/blocked', badge: 4, badgeType: 'critical' },
      { id: 'substitution', label: 'Substitution', href: '/maitre-ouvrage/substitution', badge: 4, badgeType: 'warning' },
      { id: 'arbitrages-vivants', label: 'Arbitrages & Goulots', href: '/maitre-ouvrage/arbitrages-vivants', badge: 3, badgeType: 'warning' },
    ],
  },
  {
    id: 'projets-clients',
    label: 'Projets & Clients',
    icon: Building2,
    items: [
      { id: 'projets-en-cours', label: 'Projets en cours', href: '/maitre-ouvrage/projets-en-cours' },
      { id: 'clients', label: 'Clients', href: '/maitre-ouvrage/clients' },
      { id: 'tickets-clients', label: 'Tickets clients', href: '/maitre-ouvrage/tickets-clients' },
    ],
  },
  {
    id: 'finance',
    label: 'Finance & Contentieux',
    icon: DollarSign,
    items: [
      { id: 'finances', label: 'Finances', href: '/maitre-ouvrage/finances' },
      { id: 'recouvrements', label: 'Recouvrements', href: '/maitre-ouvrage/recouvrements' },
      { id: 'litiges', label: 'Litiges', href: '/maitre-ouvrage/litiges' },
    ],
  },
  {
    id: 'rh-ressources',
    label: 'RH & Ressources',
    icon: Users,
    items: [
      { id: 'employes', label: 'Employés', href: '/maitre-ouvrage/employes' },
      { id: 'missions', label: 'Missions', href: '/maitre-ouvrage/missions' },
      { id: 'evaluations', label: 'Évaluations', href: '/maitre-ouvrage/evaluations' },
      { id: 'demandes-rh', label: 'Demandes RH', href: '/maitre-ouvrage/demandes-rh' },
      { id: 'delegations', label: 'Délégations', href: '/maitre-ouvrage/delegations' },
      { id: 'organigramme', label: 'Organigramme', href: '/maitre-ouvrage/organigramme' },
    ],
  },
  {
    id: 'communication',
    label: 'Communication',
    icon: FileText,
    items: [
      { id: 'echanges-structures', label: 'Échanges structures', href: '/maitre-ouvrage/echanges-structures' },
      { id: 'conferences', label: 'Conférences', href: '/maitre-ouvrage/conferences' },
      { id: 'messages-externes', label: 'Messages externes', href: '/maitre-ouvrage/messages-externes' },
    ],
  },
  {
    id: 'systeme',
    label: 'Système',
    icon: Settings,
    items: [
      { id: 'decisions', label: 'Décisions', href: '/maitre-ouvrage/decisions' },
      { id: 'audit', label: 'Audit', href: '/maitre-ouvrage/audit' },
      { id: 'logs', label: 'Logs', href: '/maitre-ouvrage/logs' },
      { id: 'system-logs', label: 'Logs système', href: '/maitre-ouvrage/system-logs' },
      { id: 'ia', label: 'IA', href: '/maitre-ouvrage/ia' },
    ],
  },
];

