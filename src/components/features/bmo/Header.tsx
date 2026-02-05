'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { SearchIcon, X } from 'lucide-react';
import { ActivityCenter } from './ActivityCenter';
import { GlobalShortcutsMenu } from './GlobalShortcutsMenu';
import {
  demands,
  projects,
  employees,
  bureaux,
  bcToValidate,
  contractsToSign,
  arbitrages,
} from '@/lib/data';

interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
}

export function BMOHeader() {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useAppStore();
  const {
    showNotifications,
    setShowNotifications,
    notifications,
    searchQuery,
    setSearchQuery,
    addToast,
  } = useBMOStore();

  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Initialiser l'heure uniquement côté client pour éviter les erreurs d'hydratation
  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Index de recherche
  const searchIndex: SearchResult[] = useMemo(() => {
    const items: SearchResult[] = [];

    demands.forEach((d) => {
      items.push({
        type: 'Demande',
        id: d.id,
        title: d.subject,
        subtitle: `${d.bureau} • ${d.amount}`,
        icon: '📋',
        route: '/maitre-ouvrage/demandes',
      });
    });

    projects.forEach((p) => {
      items.push({
        type: 'Projet',
        id: p.id,
        title: p.name,
        subtitle: `${p.client} • ${p.budget}`,
        icon: '🏗️',
        route: '/maitre-ouvrage/projets-en-cours',
      });
    });

    employees.forEach((e) => {
      items.push({
        type: 'Employé',
        id: e.id,
        title: e.name,
        subtitle: `${e.role} • ${e.bureau}`,
        icon: '👤',
        route: '/maitre-ouvrage/employes',
      });
    });

    bureaux.forEach((b) => {
      items.push({
        type: 'Bureau',
        id: b.code,
        title: b.name,
        subtitle: `${b.agents} agents • ${b.head}`,
        icon: b.icon,
        route: '/maitre-ouvrage/dashboard',
      });
    });

    bcToValidate.forEach((bc) => {
      items.push({
        type: 'BC',
        id: bc.id,
        title: bc.subject,
        subtitle: `${bc.supplier} • ${bc.amount}`,
        icon: '📋',
        route: '/maitre-ouvrage/validation-bc',
      });
    });

    contractsToSign.forEach((c) => {
      items.push({
        type: 'Contrat',
        id: c.id,
        title: c.subject,
        subtitle: `${c.partner} • ${c.amount}`,
        icon: '📜',
        route: '/maitre-ouvrage/validation-contrats',
      });
    });

    arbitrages.forEach((a) => {
      items.push({
        type: 'Arbitrage',
        id: a.id,
        title: a.subject,
        subtitle: a.parties.join(' vs '),
        icon: '⚖️',
        route: '/maitre-ouvrage/arbitrages-vivants',
      });
    });

    const pages = [
      { id: 'dashboard', title: 'Tableau de bord', icon: '📊', route: '/maitre-ouvrage/dashboard' },
      { id: 'demandes', title: 'Demandes', icon: '📋', route: '/maitre-ouvrage/demandes' },
      { id: 'projets-en-cours', title: 'Projets en cours', icon: '🏗️', route: '/maitre-ouvrage/projets-en-cours' },
      { id: 'employes', title: 'Employés', icon: '👤', route: '/maitre-ouvrage/employes' },
      { id: 'calendrier', title: 'Calendrier', icon: '📅', route: '/maitre-ouvrage/calendrier' },
      { id: 'validation-bc', title: 'Validation BC', icon: '✅', route: '/maitre-ouvrage/validation-bc' },
      { id: 'validation-contrats', title: 'Contrats', icon: '📜', route: '/maitre-ouvrage/validation-contrats' },
      { id: 'validation-paiements', title: 'Paiements', icon: '💳', route: '/maitre-ouvrage/validation-paiements' },
    ];

    pages.forEach((p) => {
      items.push({
        type: 'Page',
        id: p.id,
        title: p.title,
        subtitle: 'Navigation',
        icon: p.icon,
        route: p.route,
      });
    });

    return items;
  }, []);

  // Résultats de recherche
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !isSearchFocused) return [];
    const query = searchQuery.toLowerCase();
    return searchIndex
      .filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.id.toLowerCase().includes(query) ||
          item.subtitle.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query)
      )
      .slice(0, 8);
  }, [searchQuery, searchIndex, isSearchFocused]);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K pour ouvrir la recherche
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchFocused(true);
      }

      // Escape pour fermer
      if (e.key === 'Escape' && isSearchFocused) {
        setIsSearchFocused(false);
        setSearchQuery('');
        searchInputRef.current?.blur();
      }

      // Navigation dans les résultats
      if (isSearchFocused && searchResults.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, searchResults.length - 1));
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          const selected = searchResults[selectedIndex];
          if (selected) {
            handleSelectResult(selected);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchFocused, searchResults, selectedIndex, searchQuery, setSearchQuery]);

  // Reset index quand résultats changent
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults]);

  // Clic en dehors pour fermer
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };

    if (isSearchFocused) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSearchFocused]);

  const handleSelectResult = (result: SearchResult) => {
    router.push(result.route);
    setIsSearchFocused(false);
    setSearchQuery('');
    searchInputRef.current?.blur();
    addToast(`Navigation vers ${result.title}`, 'info');
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header
      className={cn(
        'sticky top-0 z-40 h-14 flex items-center justify-between gap-4 px-4',
        'backdrop-blur-sm',
        darkMode
          ? 'bg-slate-900/80 border-b border-slate-800/50'
          : 'bg-white/80 border-b border-gray-200/50'
      )}
    >
      {/* Recherche inline */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-md">
        <div
          className={cn(
            'relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
            isSearchFocused
              ? darkMode
                ? 'bg-slate-800 border-2 border-orange-500/50 shadow-lg'
                : 'bg-white border-2 border-orange-500/50 shadow-lg'
              : darkMode
              ? 'bg-slate-800/50 border border-slate-700/50'
              : 'bg-gray-50 border border-gray-200',
            isSearchFocused && 'scale-[1.02]'
      )}
    >
          <SearchIcon
            className={cn(
              'w-4 h-4 flex-shrink-0',
              darkMode ? 'text-slate-400' : 'text-gray-400'
            )}
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            className={cn(
              'flex-1 bg-transparent outline-none text-sm placeholder:text-xs',
              darkMode
                ? 'text-white placeholder:text-slate-500'
                : 'text-gray-900 placeholder:text-gray-400'
            )}
          />
          {searchQuery && (
      <button
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              className={cn(
                'p-0.5 rounded hover:bg-slate-700/50',
                darkMode ? 'text-slate-400' : 'text-gray-400'
              )}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {!isSearchFocused && (
            <kbd
        className={cn(
                'hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium',
          darkMode
                  ? 'bg-slate-700/50 text-slate-400 border border-slate-600'
                  : 'bg-white text-gray-500 border border-gray-300'
        )}
      >
          ⌘K
        </kbd>
          )}
        </div>

        {/* Panneau de résultats */}
        {isSearchFocused && (
          <div
            className={cn(
              'absolute top-full left-0 right-0 mt-1 rounded-lg shadow-xl border overflow-hidden z-50',
              darkMode
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-gray-200'
            )}
          >
            {searchQuery.trim() === '' ? (
              <div className="p-4 text-center">
                <p className="text-xs text-slate-400">
                  Commencez à taper pour rechercher...
                </p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs text-slate-400">
                  Aucun résultat pour "{searchQuery}"
                </p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map((result, i) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelectResult(result)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 text-left transition-colors',
                      selectedIndex === i
                        ? darkMode
                          ? 'bg-orange-500/20'
                          : 'bg-orange-50'
                        : darkMode
                        ? 'hover:bg-slate-700/50'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <span className="text-base flex-shrink-0">{result.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge
                          variant="default"
                          className="text-[9px] px-1.5 py-0 h-4"
                        >
                          {result.type}
                        </Badge>
                        <span
                          className={cn(
                            'font-mono text-[10px] truncate',
                            darkMode ? 'text-orange-400' : 'text-orange-600'
                          )}
                        >
                          {result.id}
                        </span>
                      </div>
                      <p className="text-xs font-medium truncate">{result.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {result.subtitle}
                      </p>
                    </div>
      </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions à droite */}
      <div className="flex items-center gap-2">
        {/* Centre d'activités */}
        <ActivityCenter />

        {/* Bouton Substitution */}
        <button
          className={cn(
            'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            darkMode
              ? 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30'
              : 'bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200'
          )}
        >
          <span>🔄</span>
          <span>Substitution</span>
        </button>

        {/* Raccourcis Clavier */}
        <GlobalShortcutsMenu />

        {/* Notifications */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className={cn(
            'relative p-2 rounded-lg transition-colors',
            darkMode
              ? 'hover:bg-slate-800 text-slate-300'
              : 'hover:bg-gray-100 text-gray-600'
          )}
        >
          <span className="text-base">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-semibold flex items-center justify-center text-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className={cn(
            'p-2 rounded-lg transition-colors text-base',
            darkMode
              ? 'hover:bg-slate-800 text-slate-300'
              : 'hover:bg-gray-100 text-gray-600'
          )}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        {/* Time */}
        <div className="hidden sm:flex items-center gap-1.5 px-2">
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full animate-pulse',
              darkMode ? 'bg-emerald-400' : 'bg-emerald-500'
            )}
          />
          <span
            className={cn(
              'text-xs font-medium tabular-nums',
              darkMode ? 'text-amber-400' : 'text-amber-600'
            )}
          >
            {currentTime
              ? currentTime.toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
                })
              : '--:--'}
        </span>
        </div>
      </div>
    </header>
  );
}
