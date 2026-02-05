'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePaymentValidationWorkspaceStore } from '@/lib/stores/paymentValidationWorkspaceStore';
import { cn } from '@/lib/utils';
import {
  Search,
  CreditCard,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart2,
  Download,
  Settings,
  HelpCircle,
  Keyboard,
  RefreshCw,
  Filter,
  Users,
  Building2,
  Shield,
  FileCheck,
  Zap,
  Target,
  Star,
  Eye,
  Workflow,
} from 'lucide-react';

// ================================
// Types
// ================================
interface Command {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  category: 'navigation' | 'actions' | 'filtres' | 'outils' | 'aide';
  shortcut?: string;
  action: () => void;
}

// ================================
// Component
// ================================
export function PaymentCommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { openTab, setQueue, setViewMode, filters } = usePaymentValidationWorkspaceStore();

  // Open with Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      
      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
        setSearch('');
        setSelectedIndex(0);
      }
      
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    };

    // Custom event listener
    const handleOpen = () => {
      setOpen(true);
      setSearch('');
      setSelectedIndex(0);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('payment:open-command-palette', handleOpen);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('payment:open-command-palette', handleOpen);
    };
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Commands
  const commands: Command[] = useMemo(() => [
    // Navigation
    {
      id: 'nav-dashboard',
      title: 'Tableau de bord',
      description: 'Vue d\'ensemble des paiements',
      icon: <Target className="w-4 h-4" />,
      category: 'navigation',
      shortcut: '⌘1',
      action: () => setViewMode('dashboard'),
    },
    {
      id: 'nav-pending',
      title: 'Paiements en attente',
      description: 'À valider par le BMO',
      icon: <Clock className="w-4 h-4 text-amber-500" />,
      category: 'navigation',
      shortcut: '⌘2',
      action: () => {
        setQueue('pending');
        openTab({ id: 'inbox:pending', type: 'inbox', title: 'En attente', icon: '⏳', data: { queue: 'pending' } });
      },
    },
    {
      id: 'nav-7days',
      title: 'Échéances 7 jours',
      description: 'Paiements à échéance proche',
      icon: <Clock className="w-4 h-4 text-blue-500" />,
      category: 'navigation',
      shortcut: '⌘3',
      action: () => {
        setQueue('7days');
        openTab({ id: 'inbox:7days', type: 'inbox', title: '7 jours', icon: '📅', data: { queue: '7days' } });
      },
    },
    {
      id: 'nav-late',
      title: 'Paiements en retard',
      description: 'Échéance dépassée',
      icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
      category: 'navigation',
      shortcut: '⌘4',
      action: () => {
        setQueue('late');
        openTab({ id: 'inbox:late', type: 'inbox', title: 'En retard', icon: '🚨', data: { queue: 'late' } });
      },
    },
    {
      id: 'nav-critical',
      title: 'Paiements critiques (≥5M)',
      description: 'Double validation BF→DG',
      icon: <Shield className="w-4 h-4 text-purple-500" />,
      category: 'navigation',
      shortcut: '⌘5',
      action: () => {
        setQueue('critical');
        openTab({ id: 'inbox:critical', type: 'inbox', title: 'Critiques', icon: '🔐', data: { queue: 'critical' } });
      },
    },
    {
      id: 'nav-bf-pending',
      title: 'En attente BF',
      description: 'Validation Bureau Finance requise',
      icon: <Building2 className="w-4 h-4 text-orange-500" />,
      category: 'navigation',
      action: () => {
        setQueue('bf_pending');
        openTab({ id: 'inbox:bf_pending', type: 'inbox', title: 'Attente BF', icon: '🏦', data: { queue: 'bf_pending' } });
      },
    },
    {
      id: 'nav-validated',
      title: 'Paiements validés',
      description: 'Historique des validations',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      category: 'navigation',
      action: () => {
        setQueue('validated');
        openTab({ id: 'inbox:validated', type: 'inbox', title: 'Validés', icon: '✅', data: { queue: 'validated' } });
      },
    },
    {
      id: 'nav-blocked',
      title: 'Paiements bloqués',
      description: 'Dossiers refusés ou en attente',
      icon: <XCircle className="w-4 h-4 text-red-500" />,
      category: 'navigation',
      action: () => {
        setQueue('blocked');
        openTab({ id: 'inbox:blocked', type: 'inbox', title: 'Bloqués', icon: '🛑', data: { queue: 'blocked' } });
      },
    },
    {
      id: 'nav-factures',
      title: 'Factures reçues',
      description: 'Matching facture ↔ paiement',
      icon: <FileText className="w-4 h-4 text-blue-500" />,
      category: 'navigation',
      action: () => {
        openTab({ id: 'factures', type: 'inbox', title: 'Factures', icon: '📄', data: { queue: 'factures' } });
      },
    },
    {
      id: 'nav-watchlist',
      title: 'Watchlist',
      description: 'Paiements surveillés',
      icon: <Star className="w-4 h-4 text-amber-500" />,
      category: 'navigation',
      action: () => {
        openTab({ id: 'watchlist', type: 'inbox', title: 'Watchlist', icon: '⭐', data: { queue: 'watchlist' } });
      },
    },

    // Actions
    {
      id: 'action-batch-validate',
      title: 'Validation en lot',
      description: 'Valider plusieurs paiements',
      icon: <Zap className="w-4 h-4 text-emerald-500" />,
      category: 'actions',
      action: () => {
        openTab({ id: 'batch:validate', type: 'batch', title: 'Validation lot', icon: '⚡', data: { action: 'validate' } });
      },
    },
    {
      id: 'action-workflow',
      title: 'Workflow BF→DG',
      description: 'Processus double validation',
      icon: <Workflow className="w-4 h-4 text-purple-500" />,
      category: 'actions',
      action: () => {
        window.dispatchEvent(new CustomEvent('payment:open-workflow-modal'));
      },
    },
    {
      id: 'action-decision-center',
      title: 'Centre de décision',
      description: 'Arbitrages et décisions critiques',
      icon: <Target className="w-4 h-4 text-indigo-500" />,
      category: 'actions',
      shortcut: '⌘D',
      action: () => {
        window.dispatchEvent(new CustomEvent('payment:open-decision-center'));
      },
    },
    {
      id: 'action-request-justif',
      title: 'Demander justificatif',
      description: 'Demande de pièces complémentaires',
      icon: <FileCheck className="w-4 h-4 text-blue-500" />,
      category: 'actions',
      action: () => {
        window.dispatchEvent(new CustomEvent('payment:request-justificatif'));
      },
    },

    // Filtres
    {
      id: 'filter-bureau',
      title: 'Filtrer par bureau',
      description: 'BF, BM, BA, BCT...',
      icon: <Building2 className="w-4 h-4" />,
      category: 'filtres',
      action: () => {
        window.dispatchEvent(new CustomEvent('payment:open-filters', { detail: 'bureau' }));
      },
    },
    {
      id: 'filter-project',
      title: 'Filtrer par projet',
      description: 'Chantiers et projets',
      icon: <Users className="w-4 h-4" />,
      category: 'filtres',
      action: () => {
        window.dispatchEvent(new CustomEvent('payment:open-filters', { detail: 'project' }));
      },
    },
    {
      id: 'filter-risk',
      title: 'Filtrer par risque',
      description: 'Niveau de risque',
      icon: <AlertTriangle className="w-4 h-4" />,
      category: 'filtres',
      action: () => {
        window.dispatchEvent(new CustomEvent('payment:open-filters', { detail: 'risk' }));
      },
    },
    {
      id: 'filter-reset',
      title: 'Réinitialiser filtres',
      description: 'Effacer tous les filtres',
      icon: <Filter className="w-4 h-4" />,
      category: 'filtres',
      action: () => {
        usePaymentValidationWorkspaceStore.getState().resetFilters();
      },
    },

    // Outils
    {
      id: 'tool-stats',
      title: 'Statistiques',
      description: 'Analytics et métriques',
      icon: <BarChart2 className="w-4 h-4" />,
      category: 'outils',
      shortcut: '⌘S',
      action: () => {
        window.dispatchEvent(new CustomEvent('payment:open-stats'));
      },
    },
    {
      id: 'tool-export',
      title: 'Exporter',
      description: 'Export CSV, JSON, Evidence Pack',
      icon: <Download className="w-4 h-4" />,
      category: 'outils',
      shortcut: '⌘E',
      action: () => {
        window.dispatchEvent(new CustomEvent('payment:open-export'));
      },
    },
    {
      id: 'tool-audit',
      title: 'Journal d\'audit',
      description: 'Traçabilité des actions',
      icon: <Eye className="w-4 h-4" />,
      category: 'outils',
      action: () => {
        openTab({ id: 'audit', type: 'audit', title: 'Audit', icon: '🧾', data: {} });
      },
    },
    {
      id: 'tool-refresh',
      title: 'Actualiser',
      description: 'Rafraîchir les données',
      icon: <RefreshCw className="w-4 h-4" />,
      category: 'outils',
      shortcut: '⌘R',
      action: () => {
        window.dispatchEvent(new CustomEvent('payment:refresh'));
      },
    },

    // Aide
    {
      id: 'help-shortcuts',
      title: 'Raccourcis clavier',
      description: 'Liste des raccourcis',
      icon: <Keyboard className="w-4 h-4" />,
      category: 'aide',
      shortcut: '?',
      action: () => {
        window.dispatchEvent(new CustomEvent('payment:open-help'));
      },
    },
    {
      id: 'help-guide',
      title: 'Guide utilisateur',
      description: 'Documentation',
      icon: <HelpCircle className="w-4 h-4" />,
      category: 'aide',
      action: () => {
        window.dispatchEvent(new CustomEvent('payment:open-guide'));
      },
    },
  ], [openTab, setQueue, setViewMode]);

  // Filter commands
  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commands;
    const q = search.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(q) ||
        cmd.description?.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q)
    );
  }, [commands, search]);

  // Group by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    for (const cmd of filteredCommands) {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    }
    return groups;
  }, [filteredCommands]);

  const categoryLabels: Record<string, string> = {
    navigation: 'Navigation',
    actions: 'Actions',
    filtres: 'Filtres',
    outils: 'Outils',
    aide: 'Aide',
  };

  // Flat list for keyboard navigation
  const flatList = useMemo(() => {
    const result: Command[] = [];
    for (const cat of Object.keys(groupedCommands)) {
      result.push(...groupedCommands[cat]);
    }
    return result;
  }, [groupedCommands]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, flatList.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatList[selectedIndex]) {
          flatList[selectedIndex].action();
          setOpen(false);
        }
      }
    },
    [flatList, selectedIndex]
  );

  // Scroll selected into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl mx-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher une commande..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          <kbd className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">
            ESC
          </kbd>
        </div>

        {/* Commands List */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Aucune commande trouvée
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category} className="mb-2">
                <div className="px-3 py-1.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {categoryLabels[category] || category}
                </div>
                {cmds.map((cmd) => {
                  const index = flatList.indexOf(cmd);
                  return (
                    <button
                      key={cmd.id}
                      data-index={index}
                      type="button"
                      onClick={() => {
                        cmd.action();
                        setOpen(false);
                      }}
                      className={cn(
                        'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-colors',
                        index === selectedIndex
                          ? 'bg-amber-50 dark:bg-amber-900/20 text-slate-900 dark:text-slate-100'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      )}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        {cmd.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{cmd.title}</div>
                        {cmd.description && (
                          <div className="text-xs text-slate-500 truncate">
                            {cmd.description}
                          </div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="flex-shrink-0 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">
                          {cmd.shortcut}
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
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">↑↓</kbd>
              naviguer
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">↵</kbd>
              sélectionner
            </span>
          </div>
          <span>⌘K pour ouvrir</span>
        </div>
      </div>
    </div>
  );
}

