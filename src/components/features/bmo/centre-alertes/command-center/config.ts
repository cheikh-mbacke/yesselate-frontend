/**
 * Configuration pour le Centre d'Alertes
 */

import type { MainCategory, AlertSource } from '@/lib/stores/centreAlertesCommandCenterStore';
import type { AlertCategory, AlertModule } from './types';

// Catégories principales (onglets)
export const mainCategories: Record<MainCategory, AlertCategory> = {
  overview: {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: '📊',
    color: 'blue',
  },
  critical: {
    id: 'critical',
    label: 'Alertes critiques',
    icon: '🚨',
    color: 'red',
  },
  operational: {
    id: 'operational',
    label: 'Alertes opérationnelles',
    icon: '⚙️',
    color: 'orange',
  },
  'sla-delays': {
    id: 'sla-delays',
    label: 'Alertes SLA & délais',
    icon: '⏱️',
    color: 'amber',
  },
  financial: {
    id: 'financial',
    label: 'Alertes financières',
    icon: '💰',
    color: 'green',
  },
  'rh-resources': {
    id: 'rh-resources',
    label: 'Alertes RH & ressources',
    icon: '👥',
    color: 'purple',
  },
  'projects-sites': {
    id: 'projects-sites',
    label: 'Alertes projets & chantiers',
    icon: '🏗️',
    color: 'cyan',
  },
  'system-security': {
    id: 'system-security',
    label: 'Alertes système & sécurité',
    icon: '🔒',
    color: 'slate',
  },
  history: {
    id: 'history',
    label: 'Historique & traçabilité',
    icon: '📜',
    color: 'gray',
  },
};

// Modules sources
export const alertModules: Record<AlertSource, AlertModule> = {
  execution: {
    id: 'execution',
    label: 'Exécution',
    icon: '⚙️',
    color: 'blue',
    path: '/maitre-ouvrage/demandes',
  },
  projects: {
    id: 'projects',
    label: 'Projets & Clients',
    icon: '🏗️',
    color: 'cyan',
    path: '/maitre-ouvrage/projets-en-cours',
  },
  rh: {
    id: 'rh',
    label: 'RH & Ressources',
    icon: '👥',
    color: 'purple',
    path: '/maitre-ouvrage/employes',
  },
  finance: {
    id: 'finance',
    label: 'Finance & Contentieux',
    icon: '💰',
    color: 'green',
    path: '/maitre-ouvrage/finances',
  },
  communication: {
    id: 'communication',
    label: 'Communication',
    icon: '💬',
    color: 'indigo',
    path: '/maitre-ouvrage/conferences',
  },
  system: {
    id: 'system',
    label: 'Système',
    icon: '🔒',
    color: 'slate',
    path: '/maitre-ouvrage/audit',
  },
  calendar: {
    id: 'calendar',
    label: 'Calendrier',
    icon: '📅',
    color: 'amber',
    path: '/maitre-ouvrage/calendrier',
  },
};

// Couleurs de criticité
export const severityColors: Record<string, string> = {
  critical: 'red',
  urgent: 'orange',
  warning: 'amber',
  info: 'blue',
};

// Labels de criticité
export const severityLabels: Record<string, string> = {
  critical: 'Critique',
  urgent: 'Urgent',
  warning: 'Avertissement',
  info: 'Information',
};

// Labels de statut
export const statusLabels: Record<string, string> = {
  active: 'Active',
  acknowledged: 'Acquittée',
  resolved: 'Résolue',
  escalated: 'Escaladée',
  archived: 'Archivée',
};

