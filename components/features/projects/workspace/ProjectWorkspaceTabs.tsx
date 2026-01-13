'use client';

import React from 'react';
import { useProjectWorkspaceStore, type ProjectTab } from '@/lib/stores/projectWorkspaceStore';
import { X, Pin, PinOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProjectWorkspaceTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab, pinTab, unpinTab } = useProjectWorkspaceStore();

  if (tabs.length === 0) return null;

  const handleMiddleClick = (e: React.MouseEvent, tabId: string) => {
    if (e.button === 1) {
      e.preventDefault();
      closeTab(tabId);
    }
  };

  return (
    <div className="flex items-center gap-1 px-2 border-b border-slate-200/70 dark:border-slate-800 bg-white/50 dark:bg-[#1f1f1f]/50 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;
        
        return (
          <div
            key={tab.id}
            className={cn(
              'group relative flex items-center gap-2 px-3 py-2 min-w-[120px] max-w-[200px] cursor-pointer transition-colors',
              'border-b-2 hover:bg-slate-50 dark:hover:bg-slate-800/50',
              isActive
                ? 'border-b-purple-500 bg-white dark:bg-[#1f1f1f]'
                : 'border-b-transparent'
            )}
            onClick={() => setActiveTab(tab.id)}
            onMouseDown={(e) => handleMiddleClick(e, tab.id)}
            title={tab.title}
          >
            {/* Icon */}
            <span className="text-sm flex-none">{tab.icon}</span>
            
            {/* Title */}
            <span className="text-sm truncate flex-1">{tab.title}</span>
            
            {/* Pin button */}
            {tab.pinned && (
              <button
                className="flex-none p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                onClick={(e) => {
                  e.stopPropagation();
                  unpinTab(tab.id);
                }}
                title="Désépingler"
              >
                <Pin className="w-3 h-3" />
              </button>
            )}
            
            {!tab.pinned && (
              <button
                className="flex-none p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  pinTab(tab.id);
                }}
                title="Épingler"
              >
                <PinOff className="w-3 h-3" />
              </button>
            )}
            
            {/* Close button */}
            <button
              className="flex-none p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              title="Fermer (Ctrl+W)"
            >
              <X className="w-3 h-3" />
            </button>
            
            {/* Modified indicator */}
            {tab.modified && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500" />
            )}
          </div>
        );
      })}
    </div>
  );
}

