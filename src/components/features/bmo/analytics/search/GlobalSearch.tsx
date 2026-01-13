/**
 * Composant de recherche globale pour Analytics
 * Recherche avancée avec filtres et suggestions
 */

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Filter, Clock, TrendingUp, FileText, AlertTriangle } from 'lucide-react';

export type SearchResultType =
  | 'bureau'
  | 'report'
  | 'alert'
  | 'kpi'
  | 'user'
  | 'document';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  relevanceScore?: number;
  url?: string;
}

export interface GlobalSearchProps {
  /** Placeholder du champ de recherche */
  placeholder?: string;
  /** Résultats récents */
  recentSearches?: string[];
  /** Callback lors de la sélection d'un résultat */
  onSelectResult?: (result: SearchResult) => void;
  /** Callback lors de la recherche */
  onSearch?: (query: string, filters: SearchFilters) => Promise<SearchResult[]>;
  /** Afficher les filtres */
  showFilters?: boolean;
  /** Nombre maximum de résultats */
  maxResults?: number;
}

export interface SearchFilters {
  types?: SearchResultType[];
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  bureauId?: string;
  status?: string[];
}

const RESULT_TYPE_CONFIG: Record<
  SearchResultType,
  { icon: React.ComponentType<any>; label: string; color: string }
> = {
  bureau: { icon: TrendingUp, label: 'Bureau', color: 'text-blue-400' },
  report: { icon: FileText, label: 'Rapport', color: 'text-green-400' },
  alert: { icon: AlertTriangle, label: 'Alerte', color: 'text-red-400' },
  kpi: { icon: TrendingUp, label: 'KPI', color: 'text-purple-400' },
  user: { icon: TrendingUp, label: 'Utilisateur', color: 'text-yellow-400' },
  document: { icon: FileText, label: 'Document', color: 'text-gray-400' },
};

export const GlobalSearch = React.memo<GlobalSearchProps>(
  ({
    placeholder = 'Rechercher dans Analytics...',
    recentSearches = [],
    onSelectResult,
    onSearch,
    showFilters = true,
    maxResults = 10,
  }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [filters, setFilters] = useState<SearchFilters>({});

    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fermer lors du clic extérieur
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Recherche avec debounce
    useEffect(() => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      const timer = setTimeout(async () => {
        setIsSearching(true);
        try {
          if (onSearch) {
            const searchResults = await onSearch(query, filters);
            setResults(searchResults.slice(0, maxResults));
          } else {
            // Résultats de démonstration
            setResults(getDemoResults(query).slice(0, maxResults));
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Search error:', error);
          }
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
      
      return () => clearTimeout(timer);

      return () => clearTimeout(timer);
    }, [query, filters, maxResults, onSearch]);

    // Navigation au clavier
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (!isOpen) return;

        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
            break;
          case 'ArrowUp':
            event.preventDefault();
            setSelectedIndex((prev) => Math.max(prev - 1, 0));
            break;
          case 'Enter':
            event.preventDefault();
            if (results[selectedIndex]) {
              handleSelectResult(results[selectedIndex]);
            }
            break;
          case 'Escape':
            setIsOpen(false);
            inputRef.current?.blur();
            break;
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, results, selectedIndex]);

    const handleSelectResult = (result: SearchResult) => {
      if (onSelectResult) {
        onSelectResult(result);
      }
      setIsOpen(false);
      setQuery('');
    };

    const handleClearSearch = () => {
      setQuery('');
      setResults([]);
      inputRef.current?.focus();
    };

    const highlightMatch = (text: string, query: string) => {
      if (!query.trim()) return text;

      const parts = text.split(new RegExp(`(${query})`, 'gi'));
      return parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index} className="bg-yellow-500/30 text-yellow-200">
            {part}
          </mark>
        ) : (
          part
        )
      );
    };

    return (
      <div ref={searchRef} className="relative w-full max-w-2xl">
        {/* Champ de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-20 py-3 bg-slate-800 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {showFilters && (
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={`p-1.5 rounded hover:bg-slate-700/50 transition-colors ${
                  Object.keys(filters).length > 0 ? 'text-blue-400' : 'text-gray-400'
                }`}
                title="Filtres"
              >
                <Filter className="w-4 h-4" />
              </button>
            )}
            {query && (
              <button
                onClick={handleClearSearch}
                className="p-1.5 rounded hover:bg-slate-700/50 transition-colors text-slate-400"
                title="Effacer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Panel de résultats */}
        {isOpen && (
          <div className="absolute top-full mt-2 w-full bg-slate-900 border border-slate-700/50 rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50">
            {isSearching ? (
              <div className="p-4 text-center text-gray-400">
                Recherche en cours...
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => {
                  const config = RESULT_TYPE_CONFIG[result.type];
                  const Icon = config.icon;

                  return (
                    <button
                      key={result.id}
                      onClick={() => handleSelectResult(result)}
                      className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-800/50 transition-colors text-left ${
                        index === selectedIndex ? 'bg-slate-800/50' : ''
                      }`}
                    >
                      <Icon className={`w-5 h-5 mt-0.5 ${config.color} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white">
                            {highlightMatch(result.title, query)}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${config.color} bg-slate-800`}>
                            {config.label}
                          </span>
                        </div>
                        {result.description && (
                          <p className="text-sm text-gray-400 line-clamp-2">
                            {highlightMatch(result.description, query)}
                          </p>
                        )}
                      </div>
                      {result.relevanceScore && (
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {Math.round(result.relevanceScore * 100)}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : query.trim() ? (
              <div className="p-4 text-center text-gray-400">
                Aucun résultat trouvé
              </div>
            ) : recentSearches.length > 0 ? (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Recherches récentes
                </div>
                {recentSearches.slice(0, 5).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(search)}
                    className="w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-800/50 transition-colors text-left"
                  >
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-white">{search}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* Panel de filtres */}
        {showFilterPanel && (
          <div className="absolute top-full mt-2 right-0 w-80 bg-slate-900 border border-slate-700/50 rounded-lg shadow-2xl p-4 z-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Filtres de recherche</h3>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="p-1 hover:bg-slate-800/50 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Types de résultats */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Types de résultats
              </label>
              <div className="space-y-2">
                {Object.entries(RESULT_TYPE_CONFIG).map(([type, config]) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.types?.includes(type as SearchResultType) ?? false}
                      onChange={(e) => {
                        const types = filters.types || [];
                        setFilters({
                          ...filters,
                          types: e.target.checked
                            ? [...types, type as SearchResultType]
                            : types.filter((t) => t !== type),
                        });
                      }}
                      className="rounded border-slate-600 bg-slate-800 text-blue-400"
                    />
                    <span className="text-sm text-gray-300">{config.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilters({})}
                className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm text-slate-200 transition-colors"
              >
                Réinitialiser
              </button>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white transition-colors"
              >
                Appliquer
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

GlobalSearch.displayName = 'GlobalSearch';

// Résultats de démonstration
function getDemoResults(query: string): SearchResult[] {
  const lowerQuery = query.toLowerCase();
  const demoData: SearchResult[] = [
    {
      id: '1',
      type: 'bureau',
      title: 'Bureau de Contrôle Paris',
      description: 'Bureau principal - 45 projets actifs',
      relevanceScore: 0.95,
    },
    {
      id: '2',
      type: 'report',
      title: 'Rapport mensuel Décembre 2025',
      description: 'Synthèse des performances et KPIs',
      relevanceScore: 0.88,
    },
    {
      id: '3',
      type: 'alert',
      title: 'Alerte: Dépassement budget',
      description: 'Projet Alpha - Budget dépassé de 15%',
      relevanceScore: 0.82,
    },
    {
      id: '4',
      type: 'kpi',
      title: 'Taux de conformité',
      description: 'Indicateur de performance clé - 87%',
      relevanceScore: 0.75,
    },
  ];

  return demoData.filter(
    (item) =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description?.toLowerCase().includes(lowerQuery)
  );
}

