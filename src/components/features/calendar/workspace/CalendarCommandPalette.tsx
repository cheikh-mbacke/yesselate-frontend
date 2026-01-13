'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useCalendarWorkspaceStore } from '@/lib/stores/calendarWorkspaceStore';
import { FluentModal } from '@/components/ui/fluent-modal';
import { cn } from '@/lib/utils';
import { 
  Search, CalendarIcon, CalendarDays, Clock, AlertTriangle, Activity,
  Download, Sun, Moon, RefreshCw, ChevronRight, Keyboard,
  Plus, GanttChart, Printer, BarChart2, CheckCircle2, Users
} from 'lucide-react';
import { useAppStore } from '@/lib/stores';

type Command = {
  id: string;
  title: string;
  description?: string;
  category: 'navigation' | 'actions' | 'create' | 'settings';
  icon: typeof CalendarIcon;
  shortcut?: string;
  action: () => void;
};

export function CalendarCommandPalette() {
  const { openTab } = useCalendarWorkspaceStore();
  const { darkMode, setDarkMode } = useAppStore();
  
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Commandes disponibles
  const commands = useMemo<Command[]>(() => [
    // Création
    {
      id: 'create:event',
      title: 'Nouvel événement',
      description: 'Créer un nouvel événement au calendrier',
      category: 'create',
      icon: Plus,
      shortcut: 'Ctrl+N',
      action: () => openTab({ 
        id: `wizard:create:${Date.now()}`, 
        type: 'wizard', 
        title: 'Nouvel événement', 
        icon: '➕', 
        data: { action: 'create' } 
      }),
    },
    // Navigation
    {
      id: 'nav:today',
      title: "Événements d'aujourd'hui",
      description: "Voir tous les événements du jour",
      category: 'navigation',
      icon: CalendarDays,
      shortcut: 'Ctrl+1',
      action: () => openTab({ id: 'inbox:today', type: 'inbox', title: "Aujourd'hui", icon: '📅', data: { queue: 'today', view: 'day' } }),
    },
    {
      id: 'nav:week',
      title: 'Cette semaine',
      description: 'Vue hebdomadaire des événements',
      category: 'navigation',
      icon: CalendarIcon,
      shortcut: 'Ctrl+2',
      action: () => openTab({ id: 'inbox:week', type: 'inbox', title: 'Cette semaine', icon: '📆', data: { queue: 'week', view: 'week' } }),
    },
    {
      id: 'nav:overdue',
      title: 'En retard SLA',
      description: 'Événements dépassant leur échéance',
      category: 'navigation',
      icon: Clock,
      shortcut: 'Ctrl+3',
      action: () => openTab({ id: 'inbox:overdue', type: 'inbox', title: 'En retard SLA', icon: '⏰', data: { queue: 'overdue' } }),
    },
    {
      id: 'nav:conflicts',
      title: 'Conflits détectés',
      description: 'Événements en conflit de planification',
      category: 'navigation',
      icon: AlertTriangle,
      shortcut: 'Ctrl+4',
      action: () => openTab({ id: 'inbox:conflicts', type: 'inbox', title: 'Conflits', icon: '⚠️', data: { queue: 'conflicts' } }),
    },
    {
      id: 'nav:completed',
      title: 'Événements terminés',
      description: 'Historique des événements complétés',
      category: 'navigation',
      icon: CheckCircle2,
      shortcut: 'Ctrl+5',
      action: () => openTab({ id: 'inbox:completed', type: 'inbox', title: 'Terminés', icon: '✅', data: { queue: 'completed' } }),
    },
    {
      id: 'nav:gantt',
      title: 'Vue Gantt',
      description: 'Visualisation chronologique',
      category: 'navigation',
      icon: GanttChart,
      shortcut: 'Ctrl+G',
      action: () => openTab({ id: 'inbox:gantt', type: 'inbox', title: 'Vue Gantt', icon: '📊', data: { queue: 'all', view: 'gantt' } }),
    },
    {
      id: 'nav:absences',
      title: 'Absences planifiées',
      description: 'Voir les absences de l\'équipe',
      category: 'navigation',
      icon: Users,
      action: () => openTab({ id: 'inbox:absences', type: 'inbox', title: 'Absences', icon: '🏖️', data: { queue: 'absences' } }),
    },
    {
      id: 'nav:month',
      title: 'Vue Mensuelle',
      description: 'Calendrier classique avec vue mensuelle',
      category: 'navigation',
      icon: CalendarIcon,
      shortcut: 'Ctrl+M',
      action: () => openTab({ id: 'calendar:month', type: 'calendar', title: 'Vue Mensuelle', icon: '📅', data: { view: 'month' } }),
    },
    // Actions
    {
      id: 'act:stats',
      title: 'Statistiques',
      description: 'Voir les statistiques du calendrier',
      category: 'actions',
      icon: BarChart2,
      shortcut: 'Ctrl+S',
      action: () => {
        window.dispatchEvent(new CustomEvent('calendar:open-stats'));
      },
    },
    {
      id: 'act:export',
      title: 'Exporter le calendrier',
      description: 'Télécharger en iCal, CSV ou PDF',
      category: 'actions',
      icon: Download,
      shortcut: 'Ctrl+E',
      action: () => {
        window.dispatchEvent(new CustomEvent('calendar:open-export'));
      },
    },
    {
      id: 'act:print',
      title: 'Imprimer',
      description: 'Imprimer la vue actuelle',
      category: 'actions',
      icon: Printer,
      shortcut: 'Ctrl+P',
      action: () => window.print(),
    },
    {
      id: 'act:refresh',
      title: 'Rafraîchir les données',
      description: 'Recharger les données depuis le serveur',
      category: 'actions',
      icon: RefreshCw,
      action: () => window.location.reload(),
    },
    // Settings
    {
      id: 'set:theme',
      title: darkMode ? 'Activer le mode clair' : 'Activer le mode sombre',
      description: 'Basculer le thème de l\'interface',
      category: 'settings',
      icon: darkMode ? Sun : Moon,
      action: () => setDarkMode(!darkMode),
    },
    {
      id: 'set:shortcuts',
      title: 'Raccourcis clavier',
      description: 'Voir tous les raccourcis disponibles',
      category: 'settings',
      icon: Keyboard,
      shortcut: 'Shift+?',
      action: () => {
        window.dispatchEvent(new CustomEvent('calendar:open-help'));
      },
    },
  ], [darkMode, setDarkMode, openTab]);

  // Filtrage par recherche
  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(c => 
      c.title.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Reset selection when filtered results change
  useEffect(() => {
    setSelected(0);
  }, [filtered.length]);

  // Keyboard handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Open/close with Ctrl+K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setOpen(prev => !prev);
      setQuery('');
      setSelected(0);
      return;
    }

    if (!open) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected(prev => (prev + 1) % filtered.length);
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(prev => (prev - 1 + filtered.length) % filtered.length);
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selected]) {
        filtered[selected].action();
        setOpen(false);
        setQuery('');
      }
    }
  }, [open, filtered, selected]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Listen for custom event to open palette
  useEffect(() => {
    const handleOpenPalette = () => {
      setOpen(true);
      setQuery('');
      setSelected(0);
    };
    
    window.addEventListener('calendar:open-command-palette', handleOpenPalette);
    return () => window.removeEventListener('calendar:open-command-palette', handleOpenPalette);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Categories
  const categories = useMemo(() => {
    const map = new Map<string, Command[]>();
    for (const cmd of filtered) {
      if (!map.has(cmd.category)) map.set(cmd.category, []);
      map.get(cmd.category)!.push(cmd);
    }
    return map;
  }, [filtered]);

  const categoryLabels: Record<string, string> = {
    create: 'Création',
    navigation: 'Navigation',
    actions: 'Actions',
    settings: 'Paramètres',
  };

  return (
    <FluentModal
      open={open}
      onClose={() => setOpen(false)}
      title=""
      hideHeader
      className="max-w-2xl"
    >
      <div className="relative">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent outline-none text-base text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
            placeholder="Rechercher une commande..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-500">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              Aucune commande trouvée
            </div>
          ) : (
            Array.from(categories.entries()).map(([cat, cmds]) => (
              <div key={cat} className="mb-4">
                <div className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase">
                  {categoryLabels[cat] || cat}
                </div>
                {cmds.map((cmd, idx) => {
                  const globalIdx = filtered.indexOf(cmd);
                  const Icon = cmd.icon;
                  const isSelected = globalIdx === selected;

                  return (
                    <button
                      key={cmd.id}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left",
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      )}
                      onClick={() => {
                        cmd.action();
                        setOpen(false);
                        setQuery('');
                      }}
                      onMouseEnter={() => setSelected(globalIdx)}
                    >
                      <Icon className={cn(
                        "w-4 h-4",
                        isSelected ? "text-blue-500" : "text-slate-400"
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          "text-sm font-medium",
                          isSelected ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-200"
                        )}>
                          {cmd.title}
                        </div>
                        {cmd.description && (
                          <div className="text-xs text-slate-500 truncate">
                            {cmd.description}
                          </div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-500">
                          {cmd.shortcut}
                        </kbd>
                      )}
                      {isSelected && (
                        <ChevronRight className="w-4 h-4 text-blue-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3" />
            <span>{filtered.length} commandes</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">↑↓</kbd>
              Naviguer
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">↵</kbd>
              Sélectionner
            </span>
          </div>
        </div>
      </div>
    </FluentModal>
  );
}

