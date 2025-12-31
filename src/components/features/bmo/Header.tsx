'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';

export function BMOHeader() {
  const { darkMode, toggleDarkMode, sidebarOpen } = useAppStore();
  const {
    showSearch,
    setShowSearch,
    showNotifications,
    setShowNotifications,
    notifications,
  } = useBMOStore();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header
      className={cn(
        'sticky top-0 z-30 px-3 h-12 flex items-center justify-between gap-2 border-b',
        darkMode
          ? 'bg-slate-800/95 backdrop-blur border-slate-700'
          : 'bg-white/95 backdrop-blur border-gray-200'
      )}
    >
      {/* Search button */}
      <button
        onClick={() => setShowSearch(true)}
        className={cn(
          'flex-1 max-w-xs flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs',
          darkMode
            ? 'bg-slate-700/50 text-slate-400'
            : 'bg-gray-100 text-gray-500'
        )}
      >
        🔍 Rechercher...
        <kbd className="ml-auto text-[10px] px-1 py-0.5 rounded bg-slate-600 hidden sm:inline">
          ⌘K
        </kbd>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Substitution button */}
        <button className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-semibold">
          🔄 Substitution
        </button>

        {/* Notifications */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-1.5 rounded-lg hover:bg-slate-700"
        >
          <span className="text-sm">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse text-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded-lg hover:bg-slate-700 text-sm"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        {/* Time */}
        <span className="hidden sm:flex items-center gap-1 text-[10px] ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-amber-500">
            {currentTime.toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </span>
      </div>
    </header>
  );
}

// Composant pour la barre d'outils rapide
export function BMOToolbar() {
  const { darkMode } = useAppStore();
  const { activePanel, setActivePanel } = useBMOStore();

  const tools = [
    { id: 'todo', icon: '✔', label: 'Tâches', badge: 5 },
    { id: 'reminders', icon: '🔔', label: 'Rappels', badge: 3 },
    { id: 'notes', icon: '📝', label: 'Notes' },
    { id: 'agenda', icon: '📅', label: 'Agenda' },
    { id: 'alertPanel', icon: '⚠️', label: 'Alertes', badge: 5 },
  ];

  return (
    <div
      className={cn(
        'sticky top-12 z-20 px-3 h-9 flex items-center gap-1 border-b overflow-x-auto',
        darkMode
          ? 'bg-slate-800/50 border-slate-700/50'
          : 'bg-white/50 border-gray-200'
      )}
    >
      {tools.map((t) => (
        <button
          key={t.id}
          onClick={() => setActivePanel(activePanel === t.id ? null : t.id)}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded text-[10px] whitespace-nowrap',
            activePanel === t.id
              ? 'bg-orange-500/20 text-orange-400'
              : darkMode
              ? 'hover:bg-slate-700/50 text-slate-400'
              : 'hover:bg-gray-100'
          )}
        >
          {t.icon} {t.label}
          {t.badge && (
            <Badge variant="gray" className="ml-1">
              {t.badge}
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
}
