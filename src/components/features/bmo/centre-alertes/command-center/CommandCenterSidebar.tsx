/**
 * Sidebar de navigation principale du Centre d'Alertes
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight,
  Bell,
  Search,
} from 'lucide-react';
import { useCentreAlertesCommandCenterStore } from '@/lib/stores/centreAlertesCommandCenterStore';
import { mainCategories } from './config';

export function CommandCenterSidebar() {
  const { 
    mainCategory,
    sidebarCollapsed, 
    setMainCategory,
    toggleSidebar,
  } = useCentreAlertesCommandCenterStore();

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
            <Bell className="h-5 w-5 text-amber-400" />
            <span className="font-semibold text-slate-200 text-sm">Centre d'Alertes</span>
          </div>
        )}
        {sidebarCollapsed && (
          <Bell className="h-5 w-5 text-amber-400 mx-auto" />
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

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        <div className="space-y-1 px-2">
          {Object.values(mainCategories).map((category) => {
            const isActive = mainCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => setMainCategory(category.id as any)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                  'group relative',
                  isActive
                    ? 'bg-amber-500/10 border border-amber-500/30'
                    : 'hover:bg-slate-700/40 border border-transparent'
                )}
                title={sidebarCollapsed ? category.label : undefined}
              >
                {/* Indicator */}
                <div
                  className={cn(
                    'absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full transition-all',
                    isActive ? 'bg-amber-400' : 'bg-transparent'
                  )}
                />
                
                {/* Icon */}
                <div
                  className={cn(
                    'flex-shrink-0 text-lg',
                    isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                  )}
                >
                  {category.icon}
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
                    
                    {category.count !== undefined && category.count > 0 && (
                      <Badge
                        variant="outline"
                        className={cn(
                          'h-5 min-w-5 px-1.5 text-xs font-medium',
                          category.color === 'red'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : category.color === 'orange'
                            ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                            : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                        )}
                      >
                        {category.count}
                      </Badge>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

