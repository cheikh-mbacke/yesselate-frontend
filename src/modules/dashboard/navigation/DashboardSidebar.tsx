/**
 * Sidebar de navigation pour le module Dashboard
 * Navigation à 3 niveaux - Niveau 1
 */

'use client';

import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, ChevronRight, ChevronLeft, Search, LayoutDashboard, Zap } from 'lucide-react';
import { dashboardNavigationConfig, type NavNode } from './dashboardNavigationConfig';
import type { DashboardMainCategory } from '../types/dashboardNavigationTypes';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useLogger } from '@/lib/utils/logger';

interface DashboardSidebarProps {
  activeCategory: DashboardMainCategory;
  activeSubCategory?: string;
  collapsed?: boolean;
  stats?: {
    overview?: number;
    performance?: number;
    actions?: number;
    risks?: number;
    decisions?: number;
    realtime?: number;
  };
  onCategoryChange: (category: string, subCategory?: string) => void;
  onToggleCollapse?: () => void;
  onOpenCommandPalette?: () => void;
}

export function DashboardSidebar({
  activeCategory,
  activeSubCategory,
  collapsed = false,
  stats = {},
  onCategoryChange,
  onToggleCollapse,
  onOpenCommandPalette,
}: DashboardSidebarProps) {
  // Logger avec contexte
  const log = useLogger('DashboardSidebar');

  // ✅ Lire le store pour garantir les re-renders
  const storeNavigation = useDashboardCommandCenterStore((state) => state.navigation);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['overview']));
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);
  
  // ✅ S'assurer que le nœud actif est toujours expandé
  useEffect(() => {
    if (storeNavigation.mainCategory) {
      setExpandedNodes((prev) => {
        // Éviter les updates inutiles si déjà présent
        if (prev.has(storeNavigation.mainCategory)) {
          return prev;
        }
        const next = new Set(prev);
        // Toujours expander la catégorie principale active
        next.add(storeNavigation.mainCategory);
        return next;
      });
    }
  }, [storeNavigation.mainCategory]); // Retirer subCategory pour éviter les re-renders inutiles

  // ✅ Raccourcis clavier pour la navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer si on tape dans un input
      const target = e.target as HTMLElement;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + / pour focus sur la recherche
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        onOpenCommandPalette?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenCommandPalette]);

  const getBadgeForNode = useCallback((node: NavNode): number | string | undefined => {
    if (!stats) return node.badge;
    const badgeMap: Record<string, number> = {
      overview: stats.overview || 0,
      performance: stats.performance || 0,
      actions: stats.actions || 0,
      risks: stats.risks || 0,
      decisions: stats.decisions || 0,
      realtime: stats.realtime || 0,
    };
    return badgeMap[node.id] || node.badge;
  }, [stats]);

  const getBadgeTypeForNode = useCallback((node: NavNode): 'default' | 'warning' | 'critical' | 'success' => {
    const badge = getBadgeForNode(node);
    if (badge && typeof badge === 'number' && badge > 0) {
      if (node.id === 'risks' || node.id === 'actions' || node.id.includes('critical')) return 'critical';
      if (node.id === 'decisions' || node.id === 'overview') return 'warning';
    }
    return node.badgeType || 'default';
  }, [getBadgeForNode]);

  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  const isNodeActive = useCallback((node: NavNode): boolean => {
    if (node.id === activeCategory) {
      if (node.children && node.children.length > 0) {
        return !activeSubCategory || node.children.some((child) => child.id === activeSubCategory);
      }
      return true;
    }
    return activeSubCategory === node.id;
  }, [activeCategory, activeSubCategory]);

  // CORRECTION: Composant interne optimisé
  const NavNodeComponent = function NavNodeComponent({
    node,
    level = 0,
  }: {
    node: NavNode;
    level?: number;
  }) {
    // ✅ Lire directement depuis le store pour garantir les re-renders
    const storeNavigation = useDashboardCommandCenterStore((state) => state.navigation);
    const storeNavigate = useDashboardCommandCenterStore((state) => state.navigate);
    
    // Utiliser les valeurs du store en priorité, fallback sur props
    const currentActiveCategory = storeNavigation.mainCategory || activeCategory;
    const currentActiveSubCategory = storeNavigation.subCategory || activeSubCategory;
    
    const isActive = useMemo(() => {
      if (node.id === currentActiveCategory) {
        if (node.children && node.children.length > 0) {
          return !currentActiveSubCategory || node.children.some((child) => child.id === currentActiveSubCategory);
        }
        return true;
      }
      return currentActiveSubCategory === node.id;
    }, [node, currentActiveCategory, currentActiveSubCategory]);
    
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const badge = getBadgeForNode(node);
    const badgeType = getBadgeTypeForNode(node);
    const Icon = node.icon;

    // ✅ Handler simplifié - lit toujours les valeurs à jour depuis le store
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      
      // ✅ Lire TOUJOURS les valeurs à jour depuis le store (pas de closure)
      const currentNav = useDashboardCommandCenterStore.getState().navigation;
      const navigateFn = useDashboardCommandCenterStore.getState().navigate;
      
      // Log du clic détecté
      log.debug('Clic détecté', {
        nodeId: node.id,
        nodeLabel: node.label,
        level,
        hasChildren,
        currentStore: currentNav,
        eventType: e.type,
        button: e.button,
      });
      
      if (hasChildren) {
        // ✅ Vérifier si la catégorie est déjà active et expandée
        const isCurrentlyActive = isNodeActive(node);
        const isCurrentlyExpanded = isExpanded;
        
        // ✅ Si niveau 0 (mainCategory) avec enfants
        if (level === 0 && node.children && node.children.length > 0) {
          // Si déjà active ET expandée → Ne pas toggle, juste naviguer vers le premier enfant
          if (isCurrentlyActive && isCurrentlyExpanded) {
            const firstSubCategory = node.children[0];
            if (firstSubCategory.children && firstSubCategory.children.length > 0) {
              const firstSubSubCategory = firstSubCategory.children[0].id;
              log.navigation(
                `${currentNav.mainCategory}/${currentNav.subCategory || ''}/${currentNav.subSubCategory || ''}`,
                `${node.id}/${firstSubCategory.id}/${firstSubSubCategory}`,
                { level: '0→1→2', main: node.id, sub: firstSubCategory.id, subSub: firstSubSubCategory }
              );
              try {
                navigateFn(node.id as DashboardMainCategory, firstSubCategory.id as any, firstSubSubCategory);
                onCategoryChange(node.id as DashboardMainCategory, firstSubCategory.id);
                log.debug('Navigation réussie (déjà active)', { level: '0→1→2' });
              } catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                log.error('Erreur navigation', err, { level: '0→1→2' });
              }
            } else {
              log.navigation(
                `${currentNav.mainCategory}/${currentNav.subCategory || ''}`,
                `${node.id}/${firstSubCategory.id}`,
                { level: '0→1', main: node.id, sub: firstSubCategory.id }
              );
              try {
                navigateFn(node.id as DashboardMainCategory, firstSubCategory.id as any, null);
                onCategoryChange(node.id as DashboardMainCategory, firstSubCategory.id);
                log.debug('Navigation réussie (déjà active)', { level: '0→1' });
              } catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                log.error('Erreur navigation', err, { level: '0→1' });
              }
            }
            return; // Ne pas toggle si déjà active et expandée
          }
          
          // ✅ Sinon, toggle ET naviguer vers la vue par défaut
          toggleNode(node.id);
          const firstSubCategory = node.children[0];
          // Si le premier enfant a aussi des enfants, naviguer vers son premier enfant (niveau 3)
          if (firstSubCategory.children && firstSubCategory.children.length > 0) {
            const firstSubSubCategory = firstSubCategory.children[0].id;
            log.navigation(
              `${currentNav.mainCategory}/${currentNav.subCategory || ''}/${currentNav.subSubCategory || ''}`,
              `${node.id}/${firstSubCategory.id}/${firstSubSubCategory}`,
              { level: '0→1→2', main: node.id, sub: firstSubCategory.id, subSub: firstSubSubCategory }
            );
            try {
              navigateFn(node.id as DashboardMainCategory, firstSubCategory.id as any, firstSubSubCategory);
              onCategoryChange(node.id as DashboardMainCategory, firstSubCategory.id);
              log.debug('Navigation réussie', { level: '0→1→2' });
            } catch (error) {
              const err = error instanceof Error ? error : new Error(String(error));
              log.error('Erreur navigation', err, { level: '0→1→2' });
            }
          } else {
            // Sinon, naviguer vers le premier enfant (niveau 2)
            log.navigation(
              `${currentNav.mainCategory}/${currentNav.subCategory || ''}`,
              `${node.id}/${firstSubCategory.id}`,
              { level: '0→1', main: node.id, sub: firstSubCategory.id }
            );
            try {
              navigateFn(node.id as DashboardMainCategory, firstSubCategory.id as any, null);
              onCategoryChange(node.id as DashboardMainCategory, firstSubCategory.id);
              log.debug('Navigation réussie', { level: '0→1' });
            } catch (error) {
              const err = error instanceof Error ? error : new Error(String(error));
              log.error('Erreur navigation', err, { level: '0→1' });
            }
          }
        } else {
          // Pour les autres niveaux, juste toggle
          toggleNode(node.id);
        }
      } else {
        if (level === 1) {
          // Niveau 2 : subCategory
          const mainCat = currentNav.mainCategory || currentActiveCategory;
          log.navigation(
            `${currentNav.mainCategory}/${currentNav.subCategory || ''}`,
            `${mainCat}/${node.id}`,
            { level: '1', main: mainCat, sub: node.id }
          );
          try {
            navigateFn(mainCat, node.id as any, null);
            onCategoryChange(mainCat, node.id);
            log.debug('Navigation réussie', { level: '1' });
          } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            log.error('Erreur navigation', err, { level: '1' });
          }
        } else if (level === 0) {
          // Niveau 1 : mainCategory (seulement si c'est un DashboardMainCategory valide)
          const validMainCategories: DashboardMainCategory[] = ['overview', 'performance', 'actions', 'risks', 'decisions', 'realtime'];
          if (validMainCategories.includes(node.id as DashboardMainCategory)) {
            log.navigation(
              currentNav.mainCategory || '',
              node.id,
              { level: '0', main: node.id }
            );
            try {
              navigateFn(node.id as DashboardMainCategory, null, null);
              onCategoryChange(node.id as DashboardMainCategory);
              log.debug('Navigation réussie', { level: '0' });
            } catch (error) {
              const err = error instanceof Error ? error : new Error(String(error));
              log.error('Erreur navigation', err, { level: '0' });
            }
          } else {
            log.warn('ID invalide pour mainCategory', { nodeId: node.id });
          }
        } else if (level === 2) {
          // Niveau 3 : subSubCategory - Naviguer vers cette vue
          const mainCat = currentNav.mainCategory || currentActiveCategory;
          const subCat = currentNav.subCategory || currentActiveSubCategory;
          
          // Si subCat est manquant, essayer de le trouver depuis le parent
          let resolvedSubCat = subCat;
          if (!resolvedSubCat && node.id) {
            // Chercher dans la config pour trouver le parent de ce node
            const mainNode = dashboardNavigationConfig[mainCat as DashboardMainCategory];
            if (mainNode?.children) {
              for (const subNode of mainNode.children) {
                if (subNode.children?.some(child => child.id === node.id)) {
                  resolvedSubCat = subNode.id;
                  break;
                }
              }
            }
          }
          
          if (mainCat && resolvedSubCat) {
            log.debug('Clic sur niveau 3 (subSubCategory)', {
              main: mainCat,
              sub: resolvedSubCat,
              subSub: node.id,
              nodeLabel: node.label,
            });
            try {
              navigateFn(mainCat, resolvedSubCat as any, node.id);
              onCategoryChange(mainCat, resolvedSubCat);
              log.debug('Navigation réussie', { level: '3', nodeId: node.id });
            } catch (error) {
              const err = error instanceof Error ? error : new Error(String(error));
              log.error('Erreur navigation', err, { level: '3', nodeId: node.id });
            }
          } else {
            log.warn('Impossible de naviguer niveau 3', {
              mainCat,
              subCat,
              resolvedSubCat,
              nodeId: node.id,
              nodeLabel: node.label,
              level
            });
          }
        }
      }
    };

    // Effet de highlight temporaire
    const isHighlighted = highlightedNode === node.id;
    
    return (
      <div key={node.id} className="relative">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleClick}
                onMouseDown={(e) => {
                  // S'assurer que le clic n'est pas bloqué
                  e.stopPropagation();
                }}
                onMouseEnter={() => setHighlightedNode(node.id)}
                onMouseLeave={() => setHighlightedNode(null)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 text-left',
                  'group relative cursor-pointer border',
                  'hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10',
                  isActive
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-300 shadow-md shadow-blue-500/20'
                    : 'hover:bg-slate-700/40 border-transparent text-slate-300',
                  isHighlighted && !isActive && 'bg-slate-700/60',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900'
                )}
                style={{ 
                  zIndex: 50, 
                  pointerEvents: 'auto',
                  position: 'relative',
                  animationDelay: `${level * 50}ms`,
                }}
                aria-label={`${node.label}${badge ? `, ${badge} éléments` : ''}`}
                aria-current={isActive ? 'page' : undefined}
                role="menuitem"
              >
          {/* Indicator animé */}
          {isActive && (
            <>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-blue-400 shadow-lg shadow-blue-400/50 animate-pulse" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-blue-300/50 blur-sm" />
            </>
          )}
          
          {/* Effet de brillance au hover */}
          <div className={cn(
            'absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300',
            'bg-gradient-to-r from-transparent via-white/5 to-transparent',
            'pointer-events-none'
          )} />

          {/* Icon avec animation */}
          {Icon && (
            <div className="relative">
              <Icon
                className={cn(
                  'h-4 w-4 flex-shrink-0 transition-all duration-300 relative z-10',
                  isActive ? 'text-blue-400 scale-110' : 'text-slate-400 group-hover:text-slate-200 group-hover:scale-105'
                )}
              />
              {isActive && (
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-md animate-pulse" />
              )}
            </div>
          )}

          {/* Label */}
          {!collapsed && (
            <>
              <span
                className={cn(
                  'flex-1 transition-colors duration-200 text-sm pointer-events-none',
                  isActive ? 'text-blue-400' : 'text-slate-300'
                )}
              >
                {node.label}
              </span>

              {/* Badge */}
              {badge !== undefined && badge !== null && badge !== 0 && (
                <Badge
                  variant={badgeType === 'critical' ? 'urgent' : badgeType === 'warning' ? 'warning' : 'default'}
                  className="h-5 min-w-5 px-1.5 text-xs font-medium"
                >
                  {badge}
                </Badge>
              )}

              {/* Expand/Collapse icon */}
              {hasChildren && (
                <span className="text-slate-400">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </span>
              )}
            </>
          )}
        </button>

        {/* Children avec animation */}
        {!collapsed && hasChildren && isExpanded && (
          <div 
            className="mt-1 space-y-1 pl-6 animate-fadeIn"
            style={{ animationDelay: '100ms' }}
          >
            {node.children?.map((child, idx) => (
              <div
                key={child.id}
                style={{ 
                  animationDelay: `${idx * 30}ms`,
                  animation: 'fadeInUp 0.3s ease-out forwards'
                }}
              >
                <NavNodeComponent node={child} level={level + 1} />
              </div>
            ))}
          </div>
        )}
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="ml-2">
                <div className="space-y-1">
                  <div className="font-semibold">{node.label}</div>
                  {badge !== undefined && badge !== null && badge !== 0 && (
                    <div className="text-xs text-slate-400">
                      {badge} élément{typeof badge === 'number' && badge > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-slate-700/50 bg-slate-900/80 backdrop-blur-xl transition-all duration-300',
        'relative z-50 h-full flex-shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700/50">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-blue-400" />
            <span className="font-semibold text-slate-200 text-sm">
              Dashboard
            </span>
          </div>
        )}
        {collapsed && (
          <LayoutDashboard className="h-5 w-5 text-blue-400 mx-auto" />
        )}
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Search amélioré */}
      {!collapsed && (
        <div className="px-3 pb-3 border-b border-slate-700/50">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onOpenCommandPalette}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400',
                    'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50',
                    'transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                    'group relative overflow-hidden'
                  )}
                  aria-label="Rechercher dans le dashboard (Ctrl+/)"
                >
                  {/* Effet de brillance */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  
                  <Search className="w-4 h-4 relative z-10 transition-transform duration-200 group-hover:scale-110" />
                  <span className="flex-1 text-left relative z-10">Rechercher...</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-700/80 text-[10px] font-mono text-slate-400 relative z-10 border border-slate-600/50">
                    ⌘K
                  </kbd>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rechercher dans le dashboard</p>
                <p className="text-xs text-slate-400 mt-1">Raccourci: Ctrl+/</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Navigation avec scrollbar personnalisée */}
      <nav 
        className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent hover:scrollbar-thumb-slate-600"
        role="navigation"
        aria-label="Navigation principale du dashboard"
      >
        <div className="space-y-1 px-2">
          {Object.values(dashboardNavigationConfig).map((node, idx) => (
            <div
              key={node.id}
              style={{
                animationDelay: `${idx * 50}ms`,
              }}
              className="animate-fadeIn"
            >
              <NavNodeComponent node={node} level={0} />
            </div>
          ))}
        </div>
      </nav>

      {/* Footer amélioré */}
      {!collapsed && (
        <div className="border-t border-slate-700/50 p-3 bg-gradient-to-t from-slate-900/50 to-transparent">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <Zap className="h-3 w-3 text-blue-400" />
            <span>Dashboard BMO v3.0</span>
          </div>
        </div>
      )}
      {collapsed && (
        <div className="border-t border-slate-700/50 p-2 flex items-center justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="p-1 rounded hover:bg-slate-800/50 transition-colors"
                  aria-label="Dashboard BMO v3.0"
                >
                  <Zap className="h-4 w-4 text-blue-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Dashboard BMO v3.0</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </aside>
  );
}

