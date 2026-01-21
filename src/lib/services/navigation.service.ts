// ============================================
// Service de navigation automatique et interdépendance
// Gère les liens, badges, et synchronisation entre pages
// ============================================

import type { NavItem, NavSection } from '@/lib/types/bmo.types';

// Types pour les données de comptage
export interface PageCounts {
  governance?: number;
  demandes?: number;
  'validation-bc'?: number;
  'validation-contrats'?: number;
  'validation-paiements'?: number;
  blocked?: number;
  substitution?: number;
  'projets-en-cours'?: number;
  recouvrements?: number;
  litiges?: number;
  'demandes-rh'?: number;
  'tickets-clients'?: number;
  [key: string]: number | undefined;
}

// Mapping automatique des routes
export const routeMapping: Record<string, string> = {
  // PILOTAGE (5 pages)
  dashboard: '/maitre-ouvrage/dashboard',
  governance: '/maitre-ouvrage/governance',
  calendrier: '/maitre-ouvrage/calendrier',
  analytics: '/maitre-ouvrage/analytics',
  alerts: '/maitre-ouvrage/alerts',
  
  // EXÉCUTION (7 pages) - inclut arbitrages-vivants déplacé
  demandes: '/maitre-ouvrage/demandes',
  'validation-bc': '/maitre-ouvrage/validation-bc',
  'validation-contrats': '/maitre-ouvrage/validation-contrats',
  'validation-paiements': '/maitre-ouvrage/validation-paiements',
  blocked: '/maitre-ouvrage/blocked',
  substitution: '/maitre-ouvrage/substitution',
  'arbitrages-vivants': '/maitre-ouvrage/arbitrages-vivants',
  
  // PROJETS & CLIENTS (3 pages)
  'projets-en-cours': '/maitre-ouvrage/projets-en-cours',
  clients: '/maitre-ouvrage/clients',
  'tickets-clients': '/maitre-ouvrage/tickets-clients',
  
  // FINANCE & CONTENTIEUX (3 pages)
  finances: '/maitre-ouvrage/finances',
  recouvrements: '/maitre-ouvrage/recouvrements',
  litiges: '/maitre-ouvrage/litiges',
  
  // RH & RESSOURCES (6 pages) - depenses, deplacements, paie-avances fusionnés dans demandes-rh
  employes: '/maitre-ouvrage/employes',
  missions: '/maitre-ouvrage/missions',
  evaluations: '/maitre-ouvrage/evaluations',
  'demandes-rh': '/maitre-ouvrage/demandes-rh',
  delegations: '/maitre-ouvrage/delegations',
  organigramme: '/maitre-ouvrage/organigramme',
  
  // COMMUNICATION (4 pages) - arbitrages-vivants déplacé vers Exécution
  'echanges-structures': '/maitre-ouvrage/echanges-structures',
  conferences: '/maitre-ouvrage/conferences',
  'messages-externes': '/maitre-ouvrage/messages-externes',
  
  // SYSTÈME (7 pages) - renommé de Gouvernance pour clarté
  decisions: '/maitre-ouvrage/decisions',
  audit: '/maitre-ouvrage/audit',
  logs: '/maitre-ouvrage/logs',
  'system-logs': '/maitre-ouvrage/system-logs',
  ia: '/maitre-ouvrage/ia',
  api: '/maitre-ouvrage/analytics', // Redirigé vers analytics (fusion des pages)
  parametres: '/maitre-ouvrage/parametres',
};

// Mapping inverse pour retrouver l'ID depuis la route
export const routeToIdMapping: Record<string, string> = Object.fromEntries(
  Object.entries(routeMapping).map(([id, route]) => [route, id])
);

/**
 * Met à jour automatiquement les badges de navigation basés sur les comptages réels
 */
export function updateNavBadges(
  navSections: NavSection[],
  counts: PageCounts
): NavSection[] {
  return navSections.map(section => ({
    ...section,
    items: section.items.map(item => {
      const count = counts[item.id];
      if (count !== undefined && count > 0) {
        // Déterminer le type de badge selon le contexte
        let badgeType: 'urgent' | 'warning' | 'gray' | 'info' = 'gray';
        
        if (item.id === 'governance' || item.id === 'blocked') {
          badgeType = count > 5 ? 'urgent' : 'warning';
        } else if (item.id === 'demandes' || item.id === 'substitution') {
          badgeType = count > 10 ? 'urgent' : count > 5 ? 'warning' : 'gray';
        } else if (item.id.includes('validation')) {
          badgeType = count > 10 ? 'warning' : 'gray';
        }
        
        return {
          ...item,
          badge: count,
          badgeType,
        };
      }
      return item;
    }),
  }));
}

/**
 * Génère automatiquement les paramètres de navigation pour une page
 */
export function generateNavParams(
  pageId: string,
  filters?: Record<string, string | number | boolean>
): string {
  const baseRoute = routeMapping[pageId] || '/maitre-ouvrage';
  if (!filters || Object.keys(filters).length === 0) {
    return baseRoute;
  }
  
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    params.append(key, String(value));
  });
  
  return `${baseRoute}?${params.toString()}`;
}

/**
 * Parse les paramètres d'URL pour extraire les filtres
 */
export function parseNavParams(searchParams: URLSearchParams): Record<string, string> {
  const filters: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    filters[key] = value;
  });
  return filters;
}

/**
 * Crée un lien automatique entre deux pages avec contexte
 */
export interface CrossPageLink {
  fromPage: string;
  toPage: string;
  context?: Record<string, any>;
  label?: string;
}

export function createCrossPageLink(link: CrossPageLink): string {
  const toRoute = routeMapping[link.toPage] || '/maitre-ouvrage';
  if (!link.context || Object.keys(link.context).length === 0) {
    return toRoute;
  }
  
  const params = new URLSearchParams();
  Object.entries(link.context).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      params.append(key, String(value));
    }
  });
  
  return `${toRoute}?${params.toString()}`;
}

/**
 * Détermine la page active depuis le pathname
 */
export function getActivePageId(pathname: string): string {
  // Correspondance exacte
  if (routeToIdMapping[pathname]) {
    return routeToIdMapping[pathname];
  }
  
  // Correspondance partielle (pour les sous-routes)
  for (const [route, id] of Object.entries(routeToIdMapping)) {
    if (pathname.startsWith(route) && route !== '/maitre-ouvrage') {
      return id;
    }
  }
  
  return 'dashboard';
}

/**
 * Récupère toutes les routes disponibles
 */
export function getAllRoutes(): string[] {
  return Object.values(routeMapping);
}

/**
 * Récupère toutes les pages avec leurs métadonnées
 */
export function getAllPages(): Array<{ id: string; route: string; label: string }> {
  // Cette fonction devrait être enrichie avec les données de navSections
  return Object.entries(routeMapping).map(([id, route]) => ({
    id,
    route,
    label: id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  }));
}

