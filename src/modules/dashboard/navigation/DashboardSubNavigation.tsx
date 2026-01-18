/**
 * Navigation secondaire et tertiaire pour le module Dashboard
 * Gère les niveaux 2 (sub-category) et 3 (sub-sub-category)
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import {
  dashboardNavigationConfig,
  getSubCategories,
  getSubSubCategories,
  type NavNode,
} from './dashboardNavigationConfig';
import type { DashboardMainCategory } from '../types/dashboardNavigationTypes';

interface DashboardSubNavigationProps {
  mainCategory: DashboardMainCategory;
  subCategory?: string;
  subSubCategory?: string;
  onSubCategoryChange: (subCategory: string) => void;
  onSubSubCategoryChange?: (subSubCategory: string) => void;
  stats?: {
    overview?: number;
    performance?: number;
    actions?: number;
    risks?: number;
    decisions?: number;
    realtime?: number;
  };
}

export function DashboardSubNavigation({
  mainCategory,
  subCategory,
  subSubCategory,
  onSubCategoryChange,
  onSubSubCategoryChange,
  stats = {},
}: DashboardSubNavigationProps) {
  // Récupérer les sous-catégories (niveau 2) depuis la config
  const subCategories = getSubCategories(mainCategory);

  // Récupérer les sous-sous-catégories (niveau 3) depuis la config si une sub-category est active
  const subSubCategories = subCategory
    ? getSubSubCategories(mainCategory, subCategory)
    : [];

  // Labels pour le breadcrumb
  const mainLabel = dashboardNavigationConfig[mainCategory]?.label || 'Dashboard';
  const activeSubLabel = subCategories.find((s) => s.id === subCategory)?.label;
  const activeSubSubLabel = subSubCategories.find((s) => s.id === subSubCategory)?.label;

  // Calculer les badges dynamiques
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

  return (
    <div className="bg-slate-900/60 border-b border-slate-700/50">
      {/* Breadcrumb */}
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-slate-800/50">
        <span className="text-slate-500">Dashboard</span>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <span className="text-slate-300 font-medium">{mainLabel}</span>
        {subCategory && activeSubLabel && (
          <>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className="text-slate-400">{activeSubLabel}</span>
          </>
        )}
        {subSubCategory && activeSubSubLabel && (
          <>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className="text-slate-500 text-xs">{activeSubSubLabel}</span>
          </>
        )}
      </div>

      {/* Level 2 Navigation - Sub Categories */}
      {subCategories.length > 0 && (
        <div className="px-4 py-2 border-b border-slate-800/50">
          <div className="flex items-center gap-1 overflow-x-auto">
            {subCategories.map((subCat) => {
              const isActive = subCategory === subCat.id;
              const badge = getBadgeForNode(subCat);
              const badgeType = getBadgeTypeForNode(subCat);

              return (
                <button
                  key={subCat.id}
                  onClick={() => onSubCategoryChange(subCat.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                  )}
                >
                  {subCat.label}
                  {badge !== undefined && badge !== null && badge !== 0 && (
                    <Badge
                      variant={badgeType === 'critical' ? 'urgent' : badgeType === 'warning' ? 'warning' : 'default'}
                      className="ml-2 h-5 min-w-5 px-1.5 text-xs"
                    >
                      {badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Level 3 Navigation - Sub Sub Categories */}
      {subSubCategories.length > 0 && subCategory && (
        <div className="px-4 py-2">
          <div className="flex items-center gap-1 overflow-x-auto">
            {subSubCategories.map((subSubCat) => {
              const isActive = subSubCategory === subSubCat.id;
              const badge = getBadgeForNode(subSubCat);
              const badgeType = getBadgeTypeForNode(subSubCat);

              return (
                <button
                  key={subSubCat.id}
                  onClick={() => onSubSubCategoryChange?.(subSubCat.id)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30 border border-transparent'
                  )}
                >
                  {subSubCat.label}
                  {badge !== undefined && badge !== null && badge !== 0 && (
                    <Badge
                      variant={badgeType === 'critical' ? 'urgent' : badgeType === 'warning' ? 'warning' : 'default'}
                      className="ml-1.5 h-4 min-w-4 px-1 text-xs"
                    >
                      {badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

