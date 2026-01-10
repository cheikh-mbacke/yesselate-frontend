'use client';

import React, { useCallback, useRef, useState } from 'react';
import { usePaymentValidationWorkspaceStore } from '@/lib/stores/paymentValidationWorkspaceStore';
import { cn } from '@/lib/utils';
import { X, MoreHorizontal, Copy, XCircle, Pin, PinOff, ChevronLeft, ChevronRight } from 'lucide-react';

// ================================
// Tab Component
// ================================
function Tab({
  tab,
  isActive,
  onActivate,
  onClose,
  onDuplicate,
  onCloseOthers,
  isPinned,
  onTogglePin,
}: {
  tab: { id: string; title: string; icon: string; closable?: boolean };
  isActive: boolean;
  onActivate: () => void;
  onClose: () => void;
  onDuplicate: () => void;
  onCloseOthers: () => void;
  isPinned: boolean;
  onTogglePin: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  React.useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(true);
  };

  return (
    <div className="relative flex-shrink-0" ref={menuRef}>
      <button
        type="button"
        onClick={onActivate}
        onContextMenu={handleContextMenu}
        className={cn(
          'group flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all',
          'hover:bg-slate-50 dark:hover:bg-slate-800/50',
          isActive
            ? 'border-amber-500 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900'
            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
        )}
      >
        <span className="text-base">{tab.icon}</span>
        <span className="max-w-[120px] truncate">{tab.title}</span>
        {isPinned && <Pin className="w-3 h-3 text-amber-500" />}
        
        {tab.closable !== false && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation();
                onClose();
              }
            }}
            className={cn(
              'ml-1 p-0.5 rounded-md transition-colors',
              'opacity-0 group-hover:opacity-100',
              'hover:bg-slate-200 dark:hover:bg-slate-700'
            )}
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {/* Context Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-[180px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg py-1">
          <button
            type="button"
            onClick={() => {
              onDuplicate();
              setMenuOpen(false);
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Copy className="w-4 h-4" />
            Dupliquer l'onglet
          </button>
          <button
            type="button"
            onClick={() => {
              onTogglePin();
              setMenuOpen(false);
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
            {isPinned ? 'Retirer de la watchlist' : 'Ajouter à la watchlist'}
          </button>
          <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
          <button
            type="button"
            onClick={() => {
              onCloseOthers();
              setMenuOpen(false);
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <XCircle className="w-4 h-4" />
            Fermer les autres
          </button>
          {tab.closable !== false && (
            <button
              type="button"
              onClick={() => {
                onClose();
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <X className="w-4 h-4" />
              Fermer
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ================================
// Main Component
// ================================
export function PaymentWorkspaceTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab, duplicateTab, closeOtherTabs, watchlist, addToWatchlist, removeFromWatchlist } = 
    usePaymentValidationWorkspaceStore();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  React.useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll, tabs.length]);

  const scrollBy = (delta: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: delta, behavior: 'smooth' });
    setTimeout(checkScroll, 300);
  };

  if (tabs.length === 0) return null;

  return (
    <div className="relative flex items-center border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
      {/* Scroll Left */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollBy(-200)}
          className="absolute left-0 z-10 flex items-center justify-center w-8 h-full bg-gradient-to-r from-white dark:from-slate-950 to-transparent"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
      )}

      {/* Tabs Container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-center overflow-x-auto scrollbar-hide px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab) => {
          const paymentId = (tab.data?.paymentId as string) || tab.id;
          const isPinned = watchlist.includes(paymentId);
          
          return (
            <Tab
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeTabId}
              onActivate={() => setActiveTab(tab.id)}
              onClose={() => closeTab(tab.id)}
              onDuplicate={() => duplicateTab(tab.id)}
              onCloseOthers={() => closeOtherTabs(tab.id)}
              isPinned={isPinned}
              onTogglePin={() => {
                if (isPinned) {
                  removeFromWatchlist(paymentId);
                } else {
                  addToWatchlist(paymentId);
                }
              }}
            />
          );
        })}
      </div>

      {/* Scroll Right */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollBy(200)}
          className="absolute right-0 z-10 flex items-center justify-center w-8 h-full bg-gradient-to-l from-white dark:from-slate-950 to-transparent"
        >
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      )}

      {/* Tab Actions */}
      {tabs.length > 1 && (
        <div className="flex-shrink-0 px-2 border-l border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => {
              tabs.forEach((t) => closeTab(t.id));
            }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Fermer tous les onglets"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

