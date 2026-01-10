/**
 * Sidebar de navigation principale du Centre de Commandement
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight,
  Activity,
  Search,
} from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';
import { mainCategories } from './config';

export function CommandCenterSidebar() {
  const { 
    navigation, 
    sidebarCollapsed, 
    navigate, 
    toggleSidebar,
    toggleCommandPalette,
  } = useGovernanceCommandCenterStore();

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-slate-700/50 bg-slate-900/80 backdrop-blur-xl transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700/50">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            <span className="font-semibold text-slate-200 text-sm">Centre de Commande</span>
          </div>
        )}
        {sidebarCollapsed && (
          <Activity className="h-5 w-5 text-blue-400 mx-auto" />
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Search Trigger */}
      {!sidebarCollapsed && (
        <div className="p-3">
          <Button
            variant="ghost"
            onClick={toggleCommandPalette}
            className="w-full justify-start gap-2 h-9 px-3 text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50"
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">Rechercher...</span>
            <kbd className="ml-auto text-xs bg-slate-700/50 px-1.5 py-0.5 rounded">⌘K</kbd>
          </Button>
        </div>
      )}
      {sidebarCollapsed && (
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCommandPalette}
            className="w-full h-9 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-2">
        <div className="space-y-1 px-2">
          {mainCategories.map((category) => {
            const Icon = category.icon;
            const isActive = navigation.mainCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => navigate(category.id as any)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                  'group relative',
                  isActive
                    ? 'bg-blue-500/10 border border-blue-500/30'
                    : 'hover:bg-slate-700/40 border border-transparent'
                )}
                title={sidebarCollapsed ? category.label : undefined}
              >
                {/* Indicator */}
                <div
                  className={cn(
                    'absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full transition-all',
                    isActive ? 'bg-blue-400' : 'bg-transparent'
                  )}
                />
                
                {/* Icon */}
                <div
                  className={cn(
                    'flex-shrink-0 flex items-center justify-center',
                    isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                
                {/* Label & Badge */}
                {!sidebarCollapsed && (
                  <>
                    <span
                      className={cn(
                        'flex-1 text-left text-sm font-medium truncate',
                        isActive ? 'text-slate-200' : 'text-slate-400 group-hover:text-slate-200'
                      )}
                    >
                      {category.label}
                    </span>
                    
                    {category.badge && (
                      <Badge
                        variant="outline"
                        className={cn(
                          'h-5 min-w-5 px-1.5 text-xs font-medium',
                          category.badgeType === 'critical'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : category.badgeType === 'warning'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                        )}
                      >
                        {category.badge}
                      </Badge>
                    )}
                  </>
                )}
                
                {/* Collapsed Badge */}
                {sidebarCollapsed && category.badge && (
                  <div
                    className={cn(
                      'absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full text-xs flex items-center justify-center font-medium',
                      category.badgeType === 'critical'
                        ? 'bg-red-500 text-white'
                        : category.badgeType === 'warning'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-500 text-white'
                    )}
                  >
                    {category.badge}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700/50 p-3">
        {!sidebarCollapsed && (
          <div className="text-xs text-slate-500 text-center">
            Gouvernance v3.0
          </div>
        )}
      </div>
    </aside>
  );
}

