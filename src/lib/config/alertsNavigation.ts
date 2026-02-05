/**
 * Alerts Navigation Configuration
 * ================================
 * 
 * Configuration for alerts navigation, shortcuts, and domain tree structure
 */

import type { AlertCategory } from '@/lib/types/alert.types';

export interface AlertShortcut {
  key: AlertCategory;
  label: string;
  badge: boolean;
}

export const shortcuts: AlertShortcut[] = [
  { key: 'overview', label: 'Vue d\'ensemble', badge: false },
  { key: 'critical', label: 'Critiques', badge: true },
  { key: 'warning', label: 'Avertissements', badge: true },
  { key: 'sla', label: 'SLA dépassés', badge: true },
  { key: 'blocked', label: 'Bloqués', badge: true },
  { key: 'ack', label: 'Acquittées', badge: false },
  { key: 'resolved', label: 'Résolues', badge: false },
  { key: 'history', label: 'Historique', badge: false },
  { key: 'watchlist', label: 'Suivis', badge: false },
];

export type NavNode = {
  key: string;
  label: string;
  icon?: string;
  query?: Record<string, string>;
  children?: NavNode[];
};

export const domainTree: NavNode[] = [
  {
    key: 'project',
    label: 'Gestion de Chantiers',
    icon: '🏗️',
    children: [
      {
        key: 'progress',
        label: 'Suivi de Chantiers',
        children: [
          { key: 'dashboard', label: 'Tableau de bord chantiers', query: { domain: 'project', kpi: 'dashboard' } },
          { key: 'profitability', label: 'Analyse de rentabilité par chantier', query: { domain: 'project', kpi: 'profitability' } },
          { key: 'progress_pf', label: 'Avancement physique & financier', query: { domain: 'project', kpi: 'progress' } },
          { key: 'variance', label: 'Écarts budget/réalisé', query: { domain: 'project', kpi: 'variance' } },
          { key: 'performance', label: 'Indicateurs de performance chantier', query: { domain: 'project', kpi: 'performance' } },
          { key: 'risk', label: 'Risques chantier', query: { domain: 'project', kpi: 'risk' } },
          { key: 'history', label: 'Historique & benchmarking', query: { domain: 'project', kpi: 'history' } },
        ],
      },
      { key: 'lots', label: 'Analyse des Lots et Corps d\'État', query: { domain: 'project', entity: 'lot' } },
      { key: 'geo', label: 'Analyse Géographique', query: { domain: 'project', entity: 'geo' } },
      { key: 'time', label: 'Analyse Temporelle', query: { domain: 'project', entity: 'time' } },
    ],
  },
  {
    key: 'finance',
    label: 'Gestion Financière',
    icon: '💰',
    children: [
      { key: 'payments_docs', label: 'Paiements & pièces manquantes', query: { domain: 'finance', flow: 'payment', flag: 'missing-docs' } },
      { key: 'overspend', label: 'Dépassements budgétaires', query: { domain: 'finance', flag: 'overspend' } },
      { key: 'recovery', label: 'Recouvrements & impayés', query: { domain: 'finance', flow: 'recovery' } },
      { key: 'commit', label: 'Engagements & clôtures', query: { domain: 'finance', flow: 'commitment' } },
    ],
  },
  {
    key: 'procurement',
    label: 'Achats & Sous-traitants',
    icon: '🧾',
    children: [
      { key: 'po', label: 'Commandes & livraisons', query: { domain: 'procurement', entity: 'po' } },
      { key: 'nc', label: 'Non‑conformités / litiges', query: { domain: 'procurement', flag: 'nonconformity' } },
      { key: 'assurance', label: 'Assurances / garanties / pénalités', query: { domain: 'procurement', flag: 'guarantee-penalty' } },
    ],
  },
  {
    key: 'hr',
    label: 'Ressources Humaines',
    icon: '👤',
    children: [
      { key: 'absence', label: 'Présences & absences critiques', query: { domain: 'hr', flag: 'absence' } },
      { key: 'cert', label: 'Habilitations / formations / VM', query: { domain: 'hr', flag: 'certification' } },
      { key: 'assign', label: 'Affectations chantier', query: { domain: 'hr', flag: 'assignment' } },
    ],
  },
  {
    key: 'planning',
    label: 'Planification & Ordonnancement',
    icon: '🗓️',
    children: [
      { key: 'milestone', label: 'Jalons / chemins critiques', query: { domain: 'planning', entity: 'milestone' } },
      { key: 'res-conflict', label: 'Conflits de charge / indispo', query: { domain: 'planning', flag: 'resource-conflict' } },
      { key: 'delay', label: 'Retards récurrents', query: { domain: 'planning', flag: 'delay' } },
    ],
  },
  {
    key: 'bid',
    label: 'Commercial & Appels d\'Offres',
    icon: '📑',
    children: [
      { key: 'deadline', label: 'Délais réponses / pièces manquantes', query: { domain: 'bid', flag: 'deadline' } },
      { key: 'approvals', label: 'Validations BC / propositions', query: { domain: 'bid', flag: 'approval' } },
    ],
  },
  {
    key: 'equipment',
    label: 'Matériel & Équipements',
    icon: '🔧',
    children: [
      { key: 'breakdown', label: 'Pannes / indisponibilités critiques', query: { domain: 'equipment', flag: 'breakdown' } },
      { key: 'maintenance-due', label: 'Entretiens / contrôles échus', query: { domain: 'equipment', flag: 'maintenance-due' } },
    ],
  },
  {
    key: 'qse',
    label: 'Qualité, Sécurité, Environnement',
    icon: '🛡️',
    children: [
      { key: 'incident', label: 'Incidents / situations dangereuses', query: { domain: 'qse', flag: 'incident' } },
      { key: 'audit', label: 'Audits / non‑conformités', query: { domain: 'qse', flag: 'audit' } },
      { key: 'snag', label: 'Réserves & levées', query: { domain: 'qse', flag: 'snag' } },
    ],
  },
];

/**
 * Maps alert categories to query parameters
 * Used for filtering alerts by category
 */
export const categoryToQuery: Record<AlertCategory, Record<string, string>> = {
  overview: {},
  critical: { severity: 'critical' },
  warning: { severity: 'warning' },
  sla: { sla: 'breached' },
  blocked: { status: 'blocked' },
  ack: { status: 'ack' },
  resolved: { status: 'resolved' },
  history: { range: 'past' },
  watchlist: { watchlist: 'true' },
};

/**
 * Get query parameters for a given category
 */
export function getCategoryQuery(category: AlertCategory): Record<string, string> {
  return categoryToQuery[category] || {};
}

/**
 * Get shortcut by key
 */
export function getShortcut(key: AlertCategory): AlertShortcut | undefined {
  return shortcuts.find(s => s.key === key);
}

/**
 * Get all shortcuts that should show badges
 */
export function getShortcutsWithBadges(): AlertShortcut[] {
  return shortcuts.filter(s => s.badge);
}

