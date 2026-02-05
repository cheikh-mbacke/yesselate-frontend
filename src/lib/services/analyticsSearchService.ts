/**
 * Service de Recherche Analytics
 * Gère la recherche dans tous les éléments analytics avec scoring
 */

import { analyticsBTPArchitecture } from '@/lib/config/analyticsBTPArchitecture';
import { searchWithScoring } from '@/application/utils/searchUtils';

export interface SearchableItem {
  id: string;
  type: 'domain' | 'module' | 'submodule' | 'element' | 'kpi' | 'alert';
  label: string;
  description?: string;
  path: string[];
  domainId?: string;
  moduleId?: string;
  subModuleId?: string;
}

export interface SearchResult extends SearchableItem {
  score: number;
  matches: Array<{ field: string; positions: number[] }>;
}

/**
 * Construit l'index de recherche à partir de l'architecture BTP
 */
function buildSearchIndex(): SearchableItem[] {
  const items: SearchableItem[] = [];

  // Parcourir tous les domaines
  analyticsBTPArchitecture.domains.forEach((domain) => {
    // Ajouter le domaine
    items.push({
      id: domain.id,
      type: 'domain',
      label: domain.name,
      description: domain.description,
      path: [domain.name],
      domainId: domain.id,
    });

    // Parcourir les modules du domaine
    domain.modules.forEach((module) => {
      // Ajouter le module
      items.push({
        id: module.id,
        type: 'module',
        label: module.name,
        description: module.description,
        path: [domain.name, module.name],
        domainId: domain.id,
        moduleId: module.id,
      });

      // Parcourir les sous-modules
      module.subModules?.forEach((subModule) => {
        items.push({
          id: subModule.id,
          type: 'submodule',
          label: subModule.name,
          description: subModule.description,
          path: [domain.name, module.name, subModule.name],
          domainId: domain.id,
          moduleId: module.id,
          subModuleId: subModule.id,
        });
      });
    });
  });

  return items;
}

// Cache de l'index de recherche
let searchIndexCache: SearchableItem[] | null = null;

/**
 * Récupère l'index de recherche (avec cache)
 */
function getSearchIndex(): SearchableItem[] {
  if (!searchIndexCache) {
    searchIndexCache = buildSearchIndex();
  }
  return searchIndexCache;
}

/**
 * Recherche dans l'index analytics
 */
export function searchAnalytics(
  query: string,
  options: {
    limit?: number;
    types?: SearchableItem['type'][];
    domainId?: string;
  } = {}
): SearchResult[] {
  const { limit = 10, types, domainId } = options;

  let items = getSearchIndex();

  // Filtrer par type si spécifié
  if (types && types.length > 0) {
    items = items.filter((item) => types.includes(item.type));
  }

  // Filtrer par domaine si spécifié
  if (domainId) {
    items = items.filter((item) => item.domainId === domainId);
  }

  // Effectuer la recherche avec scoring
  const results = searchWithScoring(
    items,
    query,
    ['label', 'description', 'path']
  ) as SearchResult[];

  // Trier par score et limiter
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Recherche rapide (pour autocomplétion)
 */
export function quickSearch(query: string, limit: number = 5): SearchResult[] {
  return searchAnalytics(query, { limit });
}

/**
 * Recherche complète (pour résultats détaillés)
 */
export function fullSearch(
  query: string,
  options: {
    limit?: number;
    types?: SearchableItem['type'][];
    domainId?: string;
  } = {}
): SearchResult[] {
  return searchAnalytics(query, { limit: options.limit || 20, ...options });
}

/**
 * Invalide le cache de l'index
 */
export function invalidateSearchIndex(): void {
  searchIndexCache = null;
}

