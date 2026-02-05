'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { 
  Search, 
  FolderOpen, 
  Plus, 
  BarChart2, 
  Download, 
  HelpCircle,
  Settings,
  RefreshCw,
  ListChecks,
  FileText,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
  category: 'navigation' | 'actions' | 'tools';
}

export function ProjectCommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Commandes disponibles
  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'open-active',
      label: 'Projets actifs',
      description: 'Voir la liste des projets actifs',
      icon: <FolderOpen className="w-4 h-4" />,
      action: () => {
        window.dispatchEvent(new CustomEvent('project:open-inbox', { detail: { queue: 'active' } }));
        setOpen(false);
      },
      shortcut: 'Ctrl+1',
      category: 'navigation',
    },
    {
      id: 'open-blocked',
      label: 'Projets bloqués',
      description: 'Voir les projets bloqués',
      icon: <ListChecks className="w-4 h-4" />,
      action: () => {
        window.dispatchEvent(new CustomEvent('project:open-inbox', { detail: { queue: 'blocked' } }));
        setOpen(false);
      },
      shortcut: 'Ctrl+2',
      category: 'navigation',
    },
    {
      id: 'open-late',
      label: 'Projets en retard',
      description: 'Voir les projets en retard',
      icon: <Activity className="w-4 h-4" />,
      action: () => {
        window.dispatchEvent(new CustomEvent('project:open-inbox', { detail: { queue: 'late' } }));
        setOpen(false);
      },
      shortcut: 'Ctrl+3',
      category: 'navigation',
    },
    {
      id: 'decision-center',
      label: 'Centre de décision',
      description: 'Projets nécessitant une décision',
      icon: <ListChecks className="w-4 h-4" />,
      action: () => {
        window.dispatchEvent(new CustomEvent('project:open-decision-center'));
        setOpen(false);
      },
      shortcut: 'Ctrl+D',
      category: 'navigation',
    },
    
    // Actions
    {
      id: 'new-project',
      label: 'Nouveau projet',
      description: 'Créer un nouveau projet',
      icon: <Plus className="w-4 h-4" />,
      action: () => {
        window.dispatchEvent(new CustomEvent('project:create-new'));
        setOpen(false);
      },
      shortcut: 'Ctrl+N',
      category: 'actions',
    },
    {
      id: 'refresh',
      label: 'Rafraîchir',
      description: 'Recharger les données',
      icon: <RefreshCw className="w-4 h-4" />,
      action: () => {
        window.dispatchEvent(new CustomEvent('project:refresh'));
        setOpen(false);
      },
      shortcut: 'Ctrl+R',
      category: 'actions',
    },
    
    // Outils
    {
      id: 'stats',
      label: 'Statistiques',
      description: 'Voir les stats du portefeuille',
      icon: <BarChart2 className="w-4 h-4" />,
      action: () => {
        window.dispatchEvent(new CustomEvent('project:open-stats'));
        setOpen(false);
      },
      shortcut: 'Ctrl+S',
      category: 'tools',
    },
    {
      id: 'export',
      label: 'Export',
      description: 'Exporter les données',
      icon: <Download className="w-4 h-4" />,
      action: () => {
        window.dispatchEvent(new CustomEvent('project:open-export'));
        setOpen(false);
      },
      shortcut: 'Ctrl+E',
      category: 'tools',
    },
    {
      id: 'help',
      label: 'Aide',
      description: 'Voir les raccourcis et l\'aide',
      icon: <HelpCircle className="w-4 h-4" />,
      action: () => {
        window.dispatchEvent(new CustomEvent('project:open-help'));
        setOpen(false);
      },
      shortcut: 'Shift+?',
      category: 'tools',
    },
  ];

  // Filtrer les commandes selon la recherche
  const filteredCommands = search.trim()
    ? commands.filter(cmd =>
        cmd.label.toLowerCase().includes(search.toLowerCase()) ||
        cmd.description.toLowerCase().includes(search.toLowerCase())
      )
    : commands;

  // Grouper par catégorie
  const groupedCommands = {
    navigation: filteredCommands.filter(c => c.category === 'navigation'),
    actions: filteredCommands.filter(c => c.category === 'actions'),
    tools: filteredCommands.filter(c => c.category === 'tools'),
  };

  // Ouvrir/fermer avec Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    const customHandler = () => setOpen(true);
    
    window.addEventListener('keydown', handler);
    window.addEventListener('project:open-command-palette', customHandler);
    
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('project:open-command-palette', customHandler);
    };
  }, []);

  // Navigation clavier
  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, filteredCommands, selectedIndex]);

  // Reset selection quand on change la recherche
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  return (
    <FluentModal
      open={open}
      title="Palette de commandes"
      onClose={() => {
        setOpen(false);
        setSearch('');
      }}
    >
      <div className="space-y-4">
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une commande..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200/70 bg-white/90 outline-none focus:ring-2 focus:ring-purple-400/30 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
            autoFocus
          />
        </div>

        {/* Liste des commandes */}
        <div className="max-h-[400px] overflow-y-auto space-y-3">
          {/* Navigation */}
          {groupedCommands.navigation.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 mb-2 px-2">Navigation</h3>
              <div className="space-y-1">
                {groupedCommands.navigation.map((cmd, index) => (
                  <CommandRow
                    key={cmd.id}
                    command={cmd}
                    selected={filteredCommands[selectedIndex]?.id === cmd.id}
                    onClick={() => cmd.action()}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {groupedCommands.actions.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 mb-2 px-2">Actions</h3>
              <div className="space-y-1">
                {groupedCommands.actions.map((cmd) => (
                  <CommandRow
                    key={cmd.id}
                    command={cmd}
                    selected={filteredCommands[selectedIndex]?.id === cmd.id}
                    onClick={() => cmd.action()}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Outils */}
          {groupedCommands.tools.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 mb-2 px-2">Outils</h3>
              <div className="space-y-1">
                {groupedCommands.tools.map((cmd) => (
                  <CommandRow
                    key={cmd.id}
                    command={cmd}
                    selected={filteredCommands[selectedIndex]?.id === cmd.id}
                    onClick={() => cmd.action()}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredCommands.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              Aucune commande trouvée
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 text-center">
          <span>↑↓ Navigation</span>
          <span className="mx-2">•</span>
          <span>↵ Sélectionner</span>
          <span className="mx-2">•</span>
          <span>Esc Fermer</span>
        </div>
      </div>
    </FluentModal>
  );
}

function CommandRow({ 
  command, 
  selected, 
  onClick 
}: { 
  command: CommandItem; 
  selected: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left',
        selected
          ? 'bg-purple-500/20 border border-purple-500/30'
          : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
      )}
      onClick={onClick}
    >
      <div className="flex-none">{command.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{command.label}</div>
        <div className="text-xs text-slate-400">{command.description}</div>
      </div>
      {command.shortcut && (
        <kbd className="flex-none px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs">
          {command.shortcut}
        </kbd>
      )}
    </button>
  );
}

