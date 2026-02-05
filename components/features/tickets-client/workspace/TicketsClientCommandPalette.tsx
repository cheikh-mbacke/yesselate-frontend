'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTicketsClientWorkspaceStore } from '@/lib/stores/ticketsClientWorkspaceStore';
import { cn } from '@/lib/utils';
import {
  Search,
  Command,
  Ticket,
  Plus,
  Inbox,
  BarChart2,
  Map,
  Columns3,
  Clock,
  Download,
  HelpCircle,
  Settings,
  RefreshCw,
  FileText,
  AlertCircle,
  ArrowUpCircle,
  UserCheck,
  CheckCircle2,
  Star,
  Filter,
  Users,
  Building2,
  CalendarDays,
  Zap,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  category: 'navigation' | 'creation' | 'files' | 'actions' | 'settings';
  action: () => void;
}

interface TicketsClientCommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onOpenStats?: () => void;
  onOpenExport?: () => void;
  onOpenSettings?: () => void;
  onOpenSLAManager?: () => void;
  onOpenEscaladeCenter?: () => void;
  onOpenClientManager?: () => void;
  onOpenChantierMap?: () => void;
  onCreateTicket?: () => void;
  onRefresh?: () => void;
}

// ============================================
// COMPONENT
// ============================================

export function TicketsClientCommandPalette({
  open,
  onClose,
  onOpenStats,
  onOpenExport,
  onOpenSettings,
  onOpenSLAManager,
  onOpenEscaladeCenter,
  onOpenClientManager,
  onOpenChantierMap,
  onCreateTicket,
  onRefresh,
}: TicketsClientCommandPaletteProps) {
  const { openTab } = useTicketsClientWorkspaceStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Commands
  const commands = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [
      // Navigation
      {
        id: 'nav-nouveaux',
        label: 'Tickets nouveaux',
        description: 'Ouvrir les tickets non traités',
        icon: <Ticket className="w-4 h-4" />,
        shortcut: '⌘1',
        category: 'navigation',
        action: () => {
          openTab({ id: 'inbox:nouveau', type: 'inbox', title: 'Nouveaux', icon: '🆕', data: { queue: 'nouveau' } });
          onClose();
        },
      },
      {
        id: 'nav-en-cours',
        label: 'Tickets en cours',
        description: 'Ouvrir les tickets en traitement',
        icon: <Clock className="w-4 h-4" />,
        shortcut: '⌘2',
        category: 'navigation',
        action: () => {
          openTab({ id: 'inbox:en_cours', type: 'inbox', title: 'En cours', icon: '🔄', data: { queue: 'en_cours' } });
          onClose();
        },
      },
      {
        id: 'nav-critiques',
        label: 'Tickets critiques',
        description: 'Tickets de priorité critique',
        icon: <AlertCircle className="w-4 h-4 text-rose-500" />,
        shortcut: '⌘3',
        category: 'navigation',
        action: () => {
          openTab({ id: 'inbox:critique', type: 'inbox', title: 'Critiques', icon: '🔴', data: { queue: 'critique' } });
          onClose();
        },
      },
      {
        id: 'nav-escalade',
        label: 'Tickets escaladés',
        description: 'Tickets remontés pour arbitrage',
        icon: <ArrowUpCircle className="w-4 h-4 text-purple-500" />,
        shortcut: '⌘4',
        category: 'navigation',
        action: () => {
          openTab({ id: 'inbox:escalade', type: 'inbox', title: 'Escaladés', icon: '⬆️', data: { queue: 'escalade' } });
          onClose();
        },
      },
      {
        id: 'nav-attente-client',
        label: 'Attente client',
        description: 'En attente de retour client',
        icon: <UserCheck className="w-4 h-4" />,
        category: 'navigation',
        action: () => {
          openTab({ id: 'inbox:en_attente_client', type: 'inbox', title: 'Attente client', icon: '👤', data: { queue: 'en_attente_client' } });
          onClose();
        },
      },
      {
        id: 'nav-resolus',
        label: 'Tickets résolus',
        description: 'Tickets traités avec succès',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
        category: 'navigation',
        action: () => {
          openTab({ id: 'inbox:resolu', type: 'inbox', title: 'Résolus', icon: '✅', data: { queue: 'resolu' } });
          onClose();
        },
      },
      {
        id: 'nav-hors-delai',
        label: 'Hors délai SLA',
        description: 'Tickets dépassant les SLA',
        icon: <Clock className="w-4 h-4 text-amber-500" />,
        shortcut: '⌘5',
        category: 'navigation',
        action: () => {
          openTab({ id: 'inbox:hors_delai', type: 'inbox', title: 'Hors délai', icon: '⏰', data: { queue: 'hors_delai' } });
          onClose();
        },
      },

      // Files (vues)
      {
        id: 'view-kanban',
        label: 'Vue Kanban',
        description: 'Visualiser par colonnes de statut',
        icon: <Columns3 className="w-4 h-4" />,
        shortcut: '⌘K',
        category: 'files',
        action: () => {
          openTab({ id: 'kanban:main', type: 'kanban', title: 'Kanban', icon: '📊', data: {} });
          onClose();
        },
      },
      {
        id: 'view-map',
        label: 'Carte des chantiers',
        description: 'Vue géographique des tickets',
        icon: <Map className="w-4 h-4" />,
        shortcut: '⌘M',
        category: 'files',
        action: () => {
          onOpenChantierMap?.();
          onClose();
        },
      },
      {
        id: 'view-timeline',
        label: 'Timeline',
        description: 'Vue chronologique',
        icon: <CalendarDays className="w-4 h-4" />,
        category: 'files',
        action: () => {
          openTab({ id: 'timeline:main', type: 'timeline', title: 'Timeline', icon: '📅', data: {} });
          onClose();
        },
      },
      {
        id: 'view-analytics',
        label: 'Analytics & Rapports',
        description: 'Tableaux de bord et statistiques',
        icon: <BarChart2 className="w-4 h-4" />,
        shortcut: '⌘S',
        category: 'files',
        action: () => {
          onOpenStats?.();
          onClose();
        },
      },

      // Creation
      {
        id: 'create-ticket',
        label: 'Nouveau ticket',
        description: 'Créer un nouveau ticket client',
        icon: <Plus className="w-4 h-4" />,
        shortcut: '⌘N',
        category: 'creation',
        action: () => {
          onCreateTicket?.();
          onClose();
        },
      },

      // Actions
      {
        id: 'action-refresh',
        label: 'Actualiser les données',
        description: 'Recharger les compteurs et listes',
        icon: <RefreshCw className="w-4 h-4" />,
        shortcut: '⌘R',
        category: 'actions',
        action: () => {
          onRefresh?.();
          onClose();
        },
      },
      {
        id: 'action-export',
        label: 'Exporter',
        description: 'Télécharger les données',
        icon: <Download className="w-4 h-4" />,
        shortcut: '⌘E',
        category: 'actions',
        action: () => {
          onOpenExport?.();
          onClose();
        },
      },
      {
        id: 'action-sla',
        label: 'Gestionnaire SLA',
        description: 'Configurer les délais et alertes',
        icon: <Zap className="w-4 h-4" />,
        category: 'actions',
        action: () => {
          onOpenSLAManager?.();
          onClose();
        },
      },
      {
        id: 'action-escalade',
        label: 'Centre d\'escalade',
        description: 'Gérer les escalades et responsables',
        icon: <ArrowUpCircle className="w-4 h-4" />,
        category: 'actions',
        action: () => {
          onOpenEscaladeCenter?.();
          onClose();
        },
      },
      {
        id: 'action-clients',
        label: 'Gestion clients',
        description: 'Annuaire et historique clients',
        icon: <Users className="w-4 h-4" />,
        category: 'actions',
        action: () => {
          onOpenClientManager?.();
          onClose();
        },
      },

      // Settings
      {
        id: 'settings-prefs',
        label: 'Préférences',
        description: 'Configurer le module',
        icon: <Settings className="w-4 h-4" />,
        shortcut: '⌘,',
        category: 'settings',
        action: () => {
          onOpenSettings?.();
          onClose();
        },
      },
      {
        id: 'settings-help',
        label: 'Aide et raccourcis',
        description: 'Documentation et astuces',
        icon: <HelpCircle className="w-4 h-4" />,
        shortcut: '?',
        category: 'settings',
        action: () => {
          window.dispatchEvent(new CustomEvent('tickets:open-help'));
          onClose();
        },
      },
    ];

    // Filter by query
    if (!query.trim()) return items;

    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
    );
  }, [query, openTab, onClose, onOpenStats, onOpenExport, onOpenSettings, onOpenSLAManager, onOpenEscaladeCenter, onOpenClientManager, onOpenChantierMap, onCreateTicket, onRefresh]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, commands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          commands[selectedIndex]?.action();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, commands, selectedIndex, onClose]);

  // Reset index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!open) return null;

  // Group by category
  const groupedCommands = commands.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  const categoryLabels: Record<string, string> = {
    navigation: 'Navigation',
    creation: 'Création',
    files: 'Vues',
    actions: 'Actions',
    settings: 'Paramètres',
  };

  let globalIndex = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Palette */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Search */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une commande..."
            className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline px-2 py-1 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-auto p-2">
          {commands.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Aucun résultat pour &quot;{query}&quot;</p>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category} className="mb-2">
                <div className="px-3 py-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {categoryLabels[category]}
                </div>
                {items.map((item) => {
                  const currentIndex = globalIndex++;
                  const isSelected = currentIndex === selectedIndex;

                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                        isSelected
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-100'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                    >
                      <div className={cn('flex-shrink-0', isSelected && 'text-orange-600 dark:text-orange-400')}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.label}</div>
                        {item.description && (
                          <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                            {item.description}
                          </div>
                        )}
                      </div>
                      {item.shortcut && (
                        <kbd className="flex-shrink-0 px-2 py-1 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 rounded">
                          {item.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700">↑↓</kbd>
              naviguer
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700">↵</kbd>
              sélectionner
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>
      </div>
    </div>
  );
}

