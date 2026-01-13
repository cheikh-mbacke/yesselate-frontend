/**
 * Service de Recherche Globale
 * ==============================
 * 
 * Recherche full-text avec scoring et filtres avancés
 */

// ============================================
// TYPES
// ============================================

export type SearchResultType = 
  | 'projet'
  | 'client'
  | 'ticket'
  | 'bc'
  | 'contrat'
  | 'facture'
  | 'employe'
  | 'mission'
  | 'litige'
  | 'decision';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  titre: string;
  subtitle: string;
  description?: string;
  icon: string;
  module: string;
  url: string;
  score: number; // 0-100, pertinence
  highlights?: string[]; // Extraits de texte surligné
  metadata?: Record<string, unknown>;
  dateCreation?: string;
  dateModification?: string;
}

export interface SearchFilters {
  types?: SearchResultType[];
  modules?: string[];
  dateDebut?: string;
  dateFin?: string;
  status?: string[];
  createdBy?: string;
  tags?: string[];
}

export interface SearchOptions {
  query: string;
  filters?: SearchFilters;
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  hasMore: boolean;
  searchTime: number; // ms
  suggestions?: string[]; // Suggestions de recherche
}

// ============================================
// MOCK DATA
// ============================================

const mockResults: SearchResult[] = [
  {
    id: 'PRJ-001',
    type: 'projet',
    titre: 'Route Nationale RN7 - Tronçon Est',
    subtitle: 'Projet BTP',
    description: 'Construction de 25km de route nationale',
    icon: '🏗️',
    module: 'projets',
    url: '/maitre-ouvrage/projets-en-cours?id=PRJ-001',
    score: 95,
    highlights: ['Route Nationale', 'Construction'],
    dateCreation: '2026-01-10',
  },
  {
    id: 'CLT-001',
    type: 'client',
    titre: 'Ministère des Infrastructures',
    subtitle: 'Client Premium',
    description: 'Administration publique',
    icon: '🏛️',
    module: 'clients',
    url: '/maitre-ouvrage/clients?id=CLT-001',
    score: 88,
    dateCreation: '2024-03-15',
  },
  {
    id: 'BC-2026-042',
    type: 'bc',
    titre: 'BC Fourniture Ciment',
    subtitle: 'En attente validation',
    description: 'Bon de commande pour 500 tonnes de ciment',
    icon: '📋',
    module: 'validation-bc',
    url: '/maitre-ouvrage/validation-bc?id=BC-2026-042',
    score: 82,
    highlights: ['Ciment', 'Validation'],
    dateCreation: '2026-01-09',
  },
];

// ============================================
// SERVICE
// ============================================

class SearchService {
  private baseUrl = '/api/search';
  private searchHistory: string[] = [];
  private maxHistorySize = 20;

  /**
   * Effectue une recherche globale
   */
  async search(options: SearchOptions): Promise<SearchResponse> {
    const startTime = Date.now();

    await this.delay(400);

    // Ajouter à l'historique
    if (options.query.trim()) {
      this.addToHistory(options.query);
    }

    // Filtrer les résultats mock
    let results = [...mockResults];

    // Filtrer par type si spécifié
    if (options.filters?.types && options.filters.types.length > 0) {
      results = results.filter((r) => options.filters!.types!.includes(r.type));
    }

    // Filtrer par module si spécifié
    if (options.filters?.modules && options.filters.modules.length > 0) {
      results = results.filter((r) => options.filters!.modules!.includes(r.module));
    }

    // Filtrer par query (recherche simplifiée)
    if (options.query.trim()) {
      const query = options.query.toLowerCase();
      results = results.filter(
        (r) =>
          r.titre.toLowerCase().includes(query) ||
          r.subtitle.toLowerCase().includes(query) ||
          r.description?.toLowerCase().includes(query)
      );

      // Calculer score de pertinence simplifié
      results = results.map((r) => {
        let score = 0;
        if (r.titre.toLowerCase().includes(query)) score += 50;
        if (r.subtitle.toLowerCase().includes(query)) score += 30;
        if (r.description?.toLowerCase().includes(query)) score += 20;
        return { ...r, score: Math.min(100, score) };
      });
    }

    // Trier
    const sortBy = options.sortBy || 'relevance';
    results.sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return b.score - a.score;
        case 'date':
          return (
            new Date(b.dateCreation || 0).getTime() -
            new Date(a.dateCreation || 0).getTime()
          );
        case 'title':
          return a.titre.localeCompare(b.titre);
        default:
          return 0;
      }
    });

    if (options.sortOrder === 'desc' && sortBy !== 'relevance') {
      results.reverse();
    }

    // Pagination
    const limit = options.limit || 20;
    const offset = options.offset || 0;
    const paginatedResults = results.slice(offset, offset + limit);

    const searchTime = Date.now() - startTime;

    return {
      results: paginatedResults,
      total: results.length,
      hasMore: offset + limit < results.length,
      searchTime,
      suggestions: this.generateSuggestions(options.query),
    };
  }

  /**
   * Recherche rapide (autocomplétion)
   */
  async quickSearch(query: string, limit: number = 5): Promise<SearchResult[]> {
    await this.delay(150);

    const results = mockResults.filter(
      (r) =>
        r.titre.toLowerCase().includes(query.toLowerCase()) ||
        r.subtitle.toLowerCase().includes(query.toLowerCase())
    );

    return results.slice(0, limit);
  }

  /**
   * Suggestions de recherche (autocomplétion)
   */
  async getSuggestions(query: string): Promise<string[]> {
    await this.delay(100);
    return this.generateSuggestions(query);
  }

  /**
   * Génère des suggestions basées sur la query
   */
  private generateSuggestions(query: string): string[] {
    if (!query.trim()) return [];

    const suggestions = [
      'route nationale',
      'projet BTP',
      'bon de commande',
      'validation bc',
      'ministère',
      'client premium',
      'ticket support',
      'contrat',
    ];

    return suggestions
      .filter((s) => s.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }

  /**
   * Historique de recherche de l'utilisateur
   */
  getSearchHistory(): string[] {
    return [...this.searchHistory];
  }

  /**
   * Ajoute une recherche à l'historique
   */
  private addToHistory(query: string): void {
    // Retirer si déjà présent
    this.searchHistory = this.searchHistory.filter((q) => q !== query);

    // Ajouter en début
    this.searchHistory.unshift(query);

    // Limiter la taille
    if (this.searchHistory.length > this.maxHistorySize) {
      this.searchHistory = this.searchHistory.slice(0, this.maxHistorySize);
    }

    // Sauvegarder dans localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('search_history', JSON.stringify(this.searchHistory));
    }
  }

  /**
   * Charge l'historique depuis localStorage
   */
  loadHistory(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('search_history');
      if (stored) {
        try {
          this.searchHistory = JSON.parse(stored);
        } catch (e) {
          console.error('Erreur chargement historique recherche:', e);
        }
      }
    }
  }

  /**
   * Efface l'historique de recherche
   */
  clearHistory(): void {
    this.searchHistory = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('search_history');
    }
  }

  /**
   * Recherche par ID exact (recherche directe)
   */
  async searchById(id: string): Promise<SearchResult | null> {
    await this.delay(200);
    return mockResults.find((r) => r.id === id) || null;
  }

  /**
   * Indexe un document pour la recherche (côté serveur)
   */
  async indexDocument(document: {
    id: string;
    type: SearchResultType;
    titre: string;
    content: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await this.delay(300);
    // En production: envoyer au service d'indexation (Elasticsearch, Algolia, etc.)
  }

  /**
   * Supprime un document de l'index
   */
  async removeFromIndex(id: string): Promise<void> {
    await this.delay(200);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const searchService = new SearchService();

// Charger l'historique au démarrage
if (typeof window !== 'undefined') {
  searchService.loadHistory();
}

