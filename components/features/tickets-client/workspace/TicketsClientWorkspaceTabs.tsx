'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useTicketsClientWorkspaceStore, type TicketTab } from '@/lib/stores/ticketsClientWorkspaceStore';
import { cn } from '@/lib/utils';
import {
  X,
  Pin,
  PinOff,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Ticket,
  Sparkles,
  BarChart2,
  Map,
  Columns3,
  Clock,
  FileText,
} from 'lucide-react';

// ============================================
// HELPERS
// ============================================

const TAB_ICONS: Record<string, React.ReactNode> = {
  inbox: <Inbox className="w-4 h-4" />,
  ticket: <Ticket className="w-4 h-4" />,
  wizard: <Sparkles className="w-4 h-4" />,
  analytics: <BarChart2 className="w-4 h-4" />,
  map: <Map className="w-4 h-4" />,
  kanban: <Columns3 className="w-4 h-4" />,
  timeline: <Clock className="w-4 h-4" />,
  report: <FileText className="w-4 h-4" />,
};

// ============================================
// COMPONENT
// ============================================

export function TicketsClientWorkspaceTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab, pinTab, unpinTab, closeOtherTabs, closeAllTabs } =
    useTicketsClientWorkspaceStore();

  const [contextMenu, setContextMenu] = useState<{ tabId: string; x: number; y: number } | null>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll state
  const checkScroll = useCallback(() => {
    const container = tabsContainerRef.current;
    if (!container) return;
    
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 5);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll, tabs.length]);

  const scrollTabs = useCallback((direction: 'left' | 'right') => {
    const container = tabsContainerRef.current;
    if (!container) return;
    
    const scrollAmount = 200;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    
    setTimeout(checkScroll, 300);
  }, [checkScroll]);

  const handleContextMenu = useCallback((e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({ tabId, x: e.clientX, y: e.clientY });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Close context menu on click outside
  useEffect(() => {
    if (contextMenu) {
      const handler = () => closeContextMenu();
      window.addEventListener('click', handler);
      return () => window.removeEventListener('click', handler);
    }
  }, [contextMenu, closeContextMenu]);

  if (tabs.length === 0) return null;

  // Sort: pinned first
  const sortedTabs = [...tabs].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  return (
    <div className="relative flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-2">
      {/* Scroll Left */}
      {canScrollLeft && (
        <button
          onClick={() => scrollTabs('left')}
          className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-slate-400" />
        </button>
      )}

      {/* Tabs Container */}
      <div
        ref={tabsContainerRef}
        className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide py-2"
        onScroll={checkScroll}
      >
        {sortedTabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const icon = tab.icon ? (
            <span className="text-sm">{tab.icon}</span>
          ) : (
            TAB_ICONS[tab.type] ?? <Ticket className="w-4 h-4" />
          );

          return (
            <div
              key={tab.id}
              className={cn(
                'group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all',
                'min-w-[120px] max-w-[200px]',
                isActive
                  ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                  : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
              )}
              onClick={() => setActiveTab(tab.id)}
              onContextMenu={(e) => handleContextMenu(e, tab.id)}
            >
              {/* Icon */}
              <div
                className={cn(
                  'flex-shrink-0',
                  isActive ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400'
                )}
              >
                {icon}
              </div>

              {/* Title */}
              <span
                className={cn(
                  'flex-1 truncate text-sm',
                  isActive
                    ? 'font-medium text-slate-900 dark:text-slate-100'
                    : 'text-slate-600 dark:text-slate-400'
                )}
              >
                {tab.title}
              </span>

              {/* Badge */}
              {tab.badge && tab.badge > 0 && (
                <span className="flex-shrink-0 px-1.5 py-0.5 text-xs font-medium rounded-full bg-orange-500 text-white">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}

              {/* Pin indicator */}
              {tab.pinned && (
                <Pin className="flex-shrink-0 w-3 h-3 text-amber-500" />
              )}

              {/* Modified indicator */}
              {tab.modified && (
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500" />
              )}

              {/* Close button */}
              {!tab.pinned && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className={cn(
                    'flex-shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity',
                    'hover:bg-slate-200 dark:hover:bg-slate-700'
                  )}
                >
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Scroll Right */}
      {canScrollRight && (
        <button
          onClick={() => scrollTabs('right')}
          className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 min-w-[160px] py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {(() => {
            const tab = tabs.find((t) => t.id === contextMenu.tabId);
            if (!tab) return null;

            return (
              <>
                {tab.pinned ? (
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => {
                      unpinTab(tab.id);
                      closeContextMenu();
                    }}
                  >
                    <PinOff className="w-4 h-4" />
                    Désépingler
                  </button>
                ) : (
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => {
                      pinTab(tab.id);
                      closeContextMenu();
                    }}
                  >
                    <Pin className="w-4 h-4" />
                    Épingler
                  </button>
                )}

                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => {
                    closeOtherTabs(tab.id);
                    closeContextMenu();
                  }}
                >
                  <X className="w-4 h-4" />
                  Fermer les autres
                </button>

                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  onClick={() => {
                    closeAllTabs();
                    closeContextMenu();
                  }}
                >
                  <X className="w-4 h-4" />
                  Tout fermer
                </button>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

