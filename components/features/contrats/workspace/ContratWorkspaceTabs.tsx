'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useValidationContratsWorkspaceStore, type ContractTab } from '@/lib/stores/validationContratsWorkspaceStore';
import { 
  X, 
  Pin, 
  PinOff, 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal,
  Copy,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Icônes par type d'onglet
const TAB_TYPE_COLORS: Record<string, string> = {
  dashboard: 'text-blue-500',
  inbox: 'text-purple-500',
  contrat: 'text-amber-500',
  comparateur: 'text-emerald-500',
  wizard: 'text-pink-500',
  audit: 'text-slate-500',
  workflow: 'text-indigo-500',
  partenaire: 'text-cyan-500',
  analytics: 'text-rose-500',
};

interface TabContextMenuProps {
  tab: ContractTab;
  position: { x: number; y: number };
  onClose: () => void;
}

function TabContextMenu({ tab, position, onClose }: TabContextMenuProps) {
  const { closeTab, closeOtherTabs, closeAllTabs, duplicateTab, pinTab, unpinTab } = 
    useValidationContratsWorkspaceStore();

  const actions = [
    { id: 'duplicate', label: 'Dupliquer', icon: Copy, onClick: () => duplicateTab(tab.id) },
    { id: 'divider1', divider: true },
    tab.pinned
      ? { id: 'unpin', label: 'Désépingler', icon: PinOff, onClick: () => unpinTab(tab.id) }
      : { id: 'pin', label: 'Épingler', icon: Pin, onClick: () => pinTab(tab.id) },
    { id: 'divider2', divider: true },
    { id: 'close-others', label: 'Fermer les autres', icon: XCircle, onClick: () => closeOtherTabs(tab.id) },
    { id: 'close-all', label: 'Fermer tous', icon: X, onClick: () => closeAllTabs() },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[100]" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed z-[101] min-w-[180px] rounded-xl border border-slate-200/70 bg-white/95 backdrop-blur-xl shadow-xl dark:border-slate-700 dark:bg-slate-900/95 overflow-hidden"
        style={{ left: position.x, top: position.y }}
      >
        {actions.map((action) => {
          if ('divider' in action) {
            return <div key={action.id} className="h-px bg-slate-200/70 dark:bg-slate-700/70 my-1" />;
          }
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => {
                action.onClick();
                onClose();
              }}
            >
              <Icon className="w-4 h-4 text-slate-500" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </motion.div>
    </>
  );
}

export function ContratWorkspaceTabs() {
  const { 
    tabs, 
    activeTabId, 
    setActiveTab, 
    closeTab,
    goBack,
    goForward,
    canGoBack,
    canGoForward,
  } = useValidationContratsWorkspaceStore();

  const [contextMenu, setContextMenu] = useState<{
    tab: ContractTab;
    position: { x: number; y: number };
  } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleMiddleClick = useCallback((e: React.MouseEvent, tabId: string) => {
    if (e.button === 1) {
      e.preventDefault();
      closeTab(tabId);
    }
  }, [closeTab]);

  const handleContextMenu = useCallback((e: React.MouseEvent, tab: ContractTab) => {
    e.preventDefault();
    setContextMenu({
      tab,
      position: { x: e.clientX, y: e.clientY },
    });
  }, []);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  if (tabs.length === 0) return null;

  // Séparer onglets épinglés et normaux
  const pinnedTabs = tabs.filter((t) => t.pinned);
  const normalTabs = tabs.filter((t) => !t.pinned);

  return (
    <div className="flex items-center border-b border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-[#1a1a1a]/70 backdrop-blur-sm">
      {/* Navigation arrière/avant */}
      <div className="flex items-center gap-1 px-2 border-r border-slate-200/50 dark:border-slate-700/50">
        <button
          onClick={() => goBack()}
          disabled={!canGoBack()}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            canGoBack()
              ? 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
              : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
          )}
          title="Précédent (Alt+←)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => goForward()}
          disabled={!canGoForward()}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            canGoForward()
              ? 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
              : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
          )}
          title="Suivant (Alt+→)"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Onglets épinglés */}
      {pinnedTabs.length > 0 && (
        <div className="flex items-center border-r border-slate-200/50 dark:border-slate-700/50">
          {pinnedTabs.map((tab) => (
            <TabItem
              key={tab.id}
              tab={tab}
              isActive={activeTabId === tab.id}
              onActivate={() => setActiveTab(tab.id)}
              onClose={() => closeTab(tab.id)}
              onMiddleClick={(e) => handleMiddleClick(e, tab.id)}
              onContextMenu={(e) => handleContextMenu(e, tab)}
            />
          ))}
        </div>
      )}

      {/* Scroll gauche */}
      <button
        onClick={() => scrollTabs('left')}
        className="flex-none p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg ml-1"
      >
        <ChevronLeft className="w-4 h-4 text-slate-400" />
      </button>

      {/* Onglets normaux (scrollables) */}
      <div
        ref={scrollRef}
        className="flex items-center overflow-x-auto scrollbar-hide flex-1"
      >
        <AnimatePresence mode="popLayout">
          {normalTabs.map((tab) => (
            <motion.div
              key={tab.id}
              layout
              initial={{ opacity: 0, scale: 0.9, width: 0 }}
              animate={{ opacity: 1, scale: 1, width: 'auto' }}
              exit={{ opacity: 0, scale: 0.9, width: 0 }}
              transition={{ duration: 0.15 }}
            >
              <TabItem
                tab={tab}
                isActive={activeTabId === tab.id}
                onActivate={() => setActiveTab(tab.id)}
                onClose={() => closeTab(tab.id)}
                onMiddleClick={(e) => handleMiddleClick(e, tab.id)}
                onContextMenu={(e) => handleContextMenu(e, tab)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Scroll droite */}
      <button
        onClick={() => scrollTabs('right')}
        className="flex-none p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg mr-1"
      >
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </button>

      {/* Context menu */}
      <AnimatePresence>
        {contextMenu && (
          <TabContextMenu
            tab={contextMenu.tab}
            position={contextMenu.position}
            onClose={() => setContextMenu(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface TabItemProps {
  tab: ContractTab;
  isActive: boolean;
  onActivate: () => void;
  onClose: () => void;
  onMiddleClick: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

function TabItem({ tab, isActive, onActivate, onClose, onMiddleClick, onContextMenu }: TabItemProps) {
  const colorClass = TAB_TYPE_COLORS[tab.type] || 'text-slate-500';

  return (
    <div
      className={cn(
        'group relative flex items-center gap-2 px-3 py-2 min-w-[100px] max-w-[180px] cursor-pointer transition-all',
        'border-b-2 hover:bg-slate-50 dark:hover:bg-slate-800/50',
        isActive
          ? 'border-b-purple-500 bg-white dark:bg-[#1f1f1f]'
          : 'border-b-transparent'
      )}
      onClick={onActivate}
      onMouseDown={onMiddleClick}
      onContextMenu={onContextMenu}
      title={tab.title}
    >
      {/* Icône avec couleur */}
      <span className={cn('text-sm flex-none', colorClass)}>{tab.icon}</span>

      {/* Titre */}
      <span className="text-sm truncate flex-1 font-medium">{tab.title}</span>

      {/* Pin indicateur */}
      {tab.pinned && (
        <Pin className="w-3 h-3 text-amber-500 flex-none" />
      )}

      {/* Modified indicateur */}
      {tab.modified && (
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500" />
      )}

      {/* Close button */}
      {!tab.pinned && (
        <button
          className="flex-none p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          title="Fermer (Ctrl+W)"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {/* Active indicator line */}
      {isActive && (
        <motion.div
          layoutId="activeContratTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
    </div>
  );
}

