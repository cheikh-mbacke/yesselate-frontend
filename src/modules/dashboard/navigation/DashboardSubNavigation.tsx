/**
 * Navigation secondaire et tertiaire pour le module Dashboard
 * Gère les niveaux 2 (sub-category) et 3 (sub-sub-category)
 * VERSION CORRIGÉE - Boutons niveau 3 fonctionnels
 */

'use client';

import React, { useCallback, memo, useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronRight, Sparkles } from 'lucide-react';
import {
  dashboardNavigationConfig,
  getSubCategories,
  getSubSubCategories,
  type NavNode,
} from './dashboardNavigationConfig';
import type { DashboardMainCategory } from '../types/dashboardNavigationTypes';
import { getValidationStats } from '@/components/features/bmo/dashboard/command-center/data/validationStats';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useLogger } from '@/lib/utils/logger';

interface DashboardSubNavigationProps {
  mainCategory: DashboardMainCategory;
  subCategory?: string;
  subSubCategory?: string;
  onSubCategoryChange: (subCategory: string) => void;
  onSubSubCategoryChange?: (subSubCategory: string, subCategory?: string) => void;
  stats?: {
    overview?: number;
    performance?: number;
    actions?: number;
    risks?: number;
    decisions?: number;
    realtime?: number;
  };
}

export const DashboardSubNavigation = memo(function DashboardSubNavigation(props: DashboardSubNavigationProps) {
  const {
    mainCategory: propMainCategory,
    subCategory: propSubCategory,
    subSubCategory: propSubSubCategory,
    onSubCategoryChange,
    onSubSubCategoryChange,
    stats = {},
  } = props;

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [previousCategory, setPreviousCategory] = useState<string | null>(null);

  // ✅ Lire directement depuis le store (source de vérité)
  const mainCategory = useDashboardCommandCenterStore((s) => s.navigation.mainCategory);
  const subCategory = useDashboardCommandCenterStore((s) => s.navigation.subCategory);
  const subSubCategory = useDashboardCommandCenterStore((s) => s.navigation.subSubCategory);
  const navigate = useDashboardCommandCenterStore((s) => s.navigate);

  // Logger avec contexte
  const log = useLogger('DashboardSubNavigation');

  // Utiliser les valeurs du store en priorité, fallback sur props si nécessaire
  const activeMainCategory = mainCategory || propMainCategory;
  const activeSubCategory = subCategory ?? propSubCategory;
  const activeSubSubCategory = subSubCategory ?? propSubSubCategory;

  // Détecter les changements pour les animations
  // Utiliser useRef pour éviter les boucles infinies avec previousCategory
  const previousCategoryRef = useRef<string | null>(null);
  useEffect(() => {
    const currentKey = `${activeMainCategory}-${activeSubCategory}-${activeSubSubCategory}`;
    if (previousCategoryRef.current && previousCategoryRef.current !== currentKey) {
      // Animation de transition détectée
      setHoveredItem(null);
    }
    previousCategoryRef.current = currentKey;
    setPreviousCategory(currentKey);
  }, [activeMainCategory, activeSubCategory, activeSubSubCategory]); // Retirer previousCategory des dépendances

  // Récupérer les sous-catégories (niveau 2)
  const subCategories = getSubCategories(activeMainCategory) || [];

  // Récupérer les sous-sous-catégories (niveau 3)
  const subSubCategories = (activeSubCategory
    ? (getSubSubCategories(activeMainCategory, activeSubCategory) || [])
    : []);

  // Log du state actuel
  useEffect(() => {
    log.debug('Current state', {
      fromStore: { mainCategory, subCategory, subSubCategory },
      fromProps: { propMainCategory, propSubCategory, propSubSubCategory },
      active: { activeMainCategory, activeSubCategory, activeSubSubCategory },
      subSubCategoriesCount: Array.isArray(subSubCategories) ? subSubCategories.length : 0,
      hasCallback: !!onSubSubCategoryChange,
    });
  }, [mainCategory, subCategory, subSubCategory, propMainCategory, propSubCategory, propSubSubCategory, activeMainCategory, activeSubCategory, activeSubSubCategory, subSubCategories, onSubSubCategoryChange, log]);

  // Labels
  const mainLabel = dashboardNavigationConfig[activeMainCategory]?.label || 'Dashboard';
  const activeSubLabel = subCategories.find((s) => s.id === activeSubCategory)?.label;
  const activeSubSubLabel = subSubCategories.find((s) => s.id === activeSubSubCategory)?.label;

  // Stats de validation
  const validationStats = getValidationStats();
  
  const getBadgeForNode = (node: NavNode): number | string | undefined => {
    if (!stats) return node.badge;

    const badgeMap: Record<string, number> = {
      overview: stats.overview || 0,
      performance: stats.performance || 0,
      actions: stats.actions || 0,
      risks: stats.risks || 0,
      decisions: stats.decisions || 0,
      realtime: stats.realtime || 0,
    };

    if (activeMainCategory === 'performance' && activeSubCategory === 'validation') {
      if (node.id === 'en-attente') return validationStats.enAttente;
      if (node.id === 'validees') return validationStats.validees;
      if (node.id === 'rejetees') return validationStats.rejetees;
    }

    if (activeMainCategory === 'performance' && (activeSubCategory === 'delays' || node.id === 'retards')) {
      if (node.id === 'retards' || activeSubCategory === 'delays') return validationStats.retards;
    }

    return badgeMap[node.id] || node.badge;
  };

  const getBadgeTypeForNode = (node: NavNode): 'default' | 'warning' | 'critical' | 'success' => {
    const badge = getBadgeForNode(node);
    if (badge && typeof badge === 'number' && badge > 0) {
      if (node.id === 'risks' || node.id === 'actions' || node.id.includes('critical')) return 'critical';
      if (node.id === 'decisions' || node.id === 'overview') return 'warning';
    }
    return node.badgeType || 'default';
  };

  // ============================================
  // HANDLERS CORRIGÉS
  // ============================================

  // Handler pour niveau 2 (sub-category)
  const handleSubCategoryClick = useCallback((subCatId: string) => {
    log.debug('Clic niveau 2', {
      subCatId,
      activeMainCategory,
    });
    
    // ✅ Déterminer la vue par défaut (premier sous-élément)
    const subSubCategoriesForThisSub = getSubSubCategories(activeMainCategory, subCatId);
    const defaultSubSub = subSubCategoriesForThisSub && subSubCategoriesForThisSub.length > 0 
      ? subSubCategoriesForThisSub[0].id 
      : null;
    
    // ✅ Appeler le callback pour compatibilité
    onSubCategoryChange(subCatId);
    // ✅ Forcer la mise à jour du store directement avec la vue par défaut
    navigate(activeMainCategory, subCatId, defaultSubSub);
  }, [navigate, activeMainCategory, onSubCategoryChange]);

  // Handler pour niveau 3 (sub-sub-category)
  // ✅ CORRIGÉ: Met à jour le store directement
  const handleSubSubCategoryClick = useCallback((subSubCatId: string, currentSubCat: string) => {
    log.debug('Clic niveau 3', {
      subSubCatId,
      currentSubCategory: currentSubCat,
      activeMainCategory,
      hasCallback: !!onSubSubCategoryChange,
    });

    // ✅ Résoudre la subCategory à utiliser (priorité: paramètre, puis store, puis activeSubCategory)
    const resolvedSubCategory = currentSubCat || activeSubCategory || subCategory;
    
    if (!resolvedSubCategory) {
      log.error('Impossible de résoudre subCategory pour niveau 3', undefined, {
        subSubCatId,
        currentSubCat,
        activeSubCategory,
        subCategory,
      });
      // ✅ FALLBACK : Utiliser la première sub-category disponible
      const fallbackSub = subCategories[0]?.id;
      if (fallbackSub) {
        log.warn('Utilisation du fallback subCategory', { fallbackSub, subSubCatId });
        navigate(activeMainCategory, fallbackSub, subSubCatId);
        if (onSubSubCategoryChange) {
          onSubSubCategoryChange(subSubCatId, fallbackSub);
        }
        return;
      }
      log.error('Aucune sub-category disponible en fallback', undefined, { activeMainCategory });
      return;
    }

    // ✅ SI callback existe, l'appeler (pour compatibilité)
    if (onSubSubCategoryChange) {
      try {
        onSubSubCategoryChange(subSubCatId, resolvedSubCategory);
        log.debug('onSubSubCategoryChange appelé', {
          subSubCatId,
          resolvedSubCategory,
        });
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        log.error('Erreur dans onSubSubCategoryChange', err, { subSubCatId, resolvedSubCategory });
      }
    }
    
    // ✅ TOUJOURS mettre à jour le store directement (source de vérité)
    navigate(activeMainCategory, resolvedSubCategory, subSubCatId);
    
    log.navigation(
      `${activeMainCategory}/${resolvedSubCategory}/${activeSubSubCategory || ''}`,
      `${activeMainCategory}/${resolvedSubCategory}/${subSubCatId}`,
      {
        main: activeMainCategory,
        sub: resolvedSubCategory,
        subSub: subSubCatId,
      }
    );
  }, [navigate, activeMainCategory, activeSubCategory, subCategory, activeSubSubCategory, onSubSubCategoryChange, log]);

  return (
    <div className="bg-slate-900/60 border-b border-slate-700/50 backdrop-blur-xl relative overflow-hidden">
      {/* Effet de brillance subtil */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
      
      {/* Breadcrumb amélioré */}
      <div 
        className="px-4 py-2.5 flex items-center gap-2 text-sm border-b border-slate-800/50 relative z-10"
        role="navigation"
        aria-label="Fil d'Ariane"
      >
        <span className="text-slate-500 transition-colors duration-200">Dashboard</span>
        <ChevronRight className="h-3 w-3 text-slate-600 transition-transform duration-200" />
        <span className="text-slate-300 font-medium transition-colors duration-200 hover:text-blue-400">
          {mainLabel}
        </span>
        {activeSubCategory && activeSubLabel && (
          <>
            <ChevronRight className="h-3 w-3 text-slate-600 transition-transform duration-200" />
            <span className="text-slate-400 transition-colors duration-200 hover:text-slate-300">
              {activeSubLabel}
            </span>
          </>
        )}
        {activeSubSubCategory && activeSubSubLabel && (
          <>
            <ChevronRight className="h-3 w-3 text-slate-600 transition-transform duration-200" />
            <span className="text-slate-500 text-xs transition-colors duration-200 hover:text-slate-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {activeSubSubLabel}
            </span>
          </>
        )}
      </div>

      {/* Level 2 Navigation - Sub Categories amélioré */}
      {Array.isArray(subCategories) && subCategories.length > 0 && (
        <div className="px-4 py-2.5 border-b border-slate-800/50 relative z-10">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pb-1">
            {subCategories.map((subCat, idx) => {
              // ✅ Utiliser directement les valeurs du store pour isActive
              const isActive = subCategory === subCat.id;
              const isHovered = hoveredItem === `sub-${subCat.id}`;
              const badge = getBadgeForNode(subCat);
              const badgeType = getBadgeTypeForNode(subCat);

              return (
                <TooltipProvider key={subCat.id} delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSubCategoryClick(subCat.id);
                        }}
                        onMouseEnter={() => setHoveredItem(`sub-${subCat.id}`)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300',
                          'cursor-pointer border relative overflow-hidden group',
                          'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900',
                          isActive
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30 shadow-lg shadow-blue-500/10 scale-105'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent hover:border-slate-700/30 hover:scale-105',
                          isHovered && !isActive && 'bg-slate-800/70'
                        )}
                        style={{
                          animationDelay: `${idx * 50}ms`,
                        }}
                        aria-label={`${subCat.label}${badge ? `, ${badge} éléments` : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {/* Effet de brillance */}
                        <div className={cn(
                          'absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent',
                          '-translate-x-full group-hover:translate-x-full transition-transform duration-700',
                          'pointer-events-none'
                        )} />
                        
                        <span className="relative z-10">{subCat.label}</span>
                        {badge !== undefined && badge !== null && badge !== 0 && (
                          <Badge
                            variant={badgeType === 'critical' ? 'urgent' : badgeType === 'warning' ? 'warning' : 'default'}
                            className="ml-2 h-5 min-w-5 px-1.5 text-xs relative z-10 transition-transform duration-200 group-hover:scale-110"
                          >
                            {badge}
                          </Badge>
                        )}
                      </button>
                    </TooltipTrigger>
                    {badge !== undefined && badge !== null && badge !== 0 && (
                      <TooltipContent>
                        <p>{badge} élément{typeof badge === 'number' && badge > 1 ? 's' : ''} dans {subCat.label}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>
      )}

      {/* Level 3 Navigation - Sub Sub Categories amélioré */}
      {Array.isArray(subSubCategories) && subSubCategories.length > 0 && activeSubCategory && (
        <div className="px-4 py-2.5 bg-slate-800/20 relative z-10">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pb-1">
            {subSubCategories.map((subSubCat, idx) => {
              // ✅ Utiliser directement les valeurs du store pour isActive
              const isActive = subSubCategory === subSubCat.id;
              const isHovered = hoveredItem === `subsub-${subSubCat.id}`;
              const badge = getBadgeForNode(subSubCat);
              const badgeType = getBadgeTypeForNode(subSubCat);

              return (
                <TooltipProvider key={subSubCat.id} delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSubSubCategoryClick(subSubCat.id, activeSubCategory || subCategory || '');
                        }}
                        onMouseEnter={() => setHoveredItem(`subsub-${subSubCat.id}`)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={cn(
                          'px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-300',
                          'cursor-pointer border relative overflow-hidden group',
                          'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900',
                          isActive
                            ? 'bg-blue-500/25 text-blue-300 border-blue-500/30 shadow-md shadow-blue-500/5 scale-105'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 border-transparent hover:border-slate-700/30 hover:scale-105',
                          isHovered && !isActive && 'bg-slate-800/60'
                        )}
                        style={{
                          animationDelay: `${idx * 30}ms`,
                        }}
                        aria-label={`${subSubCat.label}${badge ? `, ${badge} éléments` : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {/* Effet de brillance */}
                        <div className={cn(
                          'absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent',
                          '-translate-x-full group-hover:translate-x-full transition-transform duration-700',
                          'pointer-events-none'
                        )} />
                        
                        <span className="relative z-10">{subSubCat.label}</span>
                        {badge !== undefined && badge !== null && badge !== 0 && (
                          <Badge
                            variant={badgeType === 'critical' ? 'urgent' : badgeType === 'warning' ? 'warning' : 'default'}
                            className="ml-1.5 h-4 min-w-4 px-1 text-xs relative z-10 transition-transform duration-200 group-hover:scale-110"
                          >
                            {badge}
                          </Badge>
                        )}
                      </button>
                    </TooltipTrigger>
                    {badge !== undefined && badge !== null && badge !== 0 && (
                      <TooltipContent>
                        <p>{badge} élément{typeof badge === 'number' && badge > 1 ? 's' : ''} dans {subSubCat.label}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>
      )}

      {/* DEBUG: Afficher s'il y a des sous-catégories vides */}
      {process.env.NODE_ENV === 'development' && activeSubCategory && (!Array.isArray(subSubCategories) || subSubCategories.length === 0) && (
        <div className="px-4 py-2 text-xs text-yellow-400 bg-yellow-900/20 animate-fadeIn">
          ⚠️ Aucune sous-catégorie pour: {activeMainCategory} → {activeSubCategory}
        </div>
      )}
    </div>
  );
});
