'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useValidationContratsWorkspaceStore } from '@/lib/stores/validationContratsWorkspaceStore';
import { contractsToSign, employees } from '@/lib/data';
import { cn } from '@/lib/utils';

import {
  Search,
  FileText,
  Users,
  Calendar,
  BarChart2,
  Download,
  Settings,
  HelpCircle,
  ArrowRight,
  Hash,
  Building2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Signature,
  Shield,
  Eye,
  Plus,
  Filter,
  RefreshCw,
  History,
  Star,
  Bookmark,
  GitCompare,
  Workflow,
  Scale,
  FileCheck,
  FileClock,
  FileWarning,
  Inbox,
  Layers,
} from 'lucide-react';

// ================================
// Types
// ================================
interface CommandItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description?: string;
  category: string;
  shortcut?: string;
  action: () => void;
  keywords?: string[];
  badge?: { label: string; color: string };
}

interface CommandGroup {
  id: string;
  title: string;
  items: CommandItem[];
}

// ================================
// Component
// ================================
export function ContratCommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { openTab } = useValidationContratsWorkspaceStore();

  // Hotkey global pour ouvrir (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };

    const handleEvent = () => setOpen(true);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contrats:open-command-palette', handleEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contrats:open-command-palette', handleEvent);
    };
  }, []);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Commandes disponibles
  const commands = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [];

    // === Files de travail ===
    items.push({
      id: 'queue-pending-bj',
      icon: <Shield className="w-4 h-4 text-amber-500" />,
      title: 'En attente BJ',
      description: 'Contrats à valider par le Bureau Juridique',
      category: 'Files',
      action: () => openTab({ id: 'inbox:pending_bj', type: 'inbox', title: 'Validation BJ', icon: '🔐', data: { queue: 'pending_bj' } }),
      keywords: ['validation', 'juridique', 'bj'],
      badge: { label: '5', color: 'amber' },
    });

    items.push({
      id: 'queue-pending-bmo',
      icon: <Signature className="w-4 h-4 text-purple-500" />,
      title: 'En attente BMO',
      description: 'Contrats à signer par la Direction',
      category: 'Files',
      action: () => openTab({ id: 'inbox:pending_bmo', type: 'inbox', title: 'Signature BMO', icon: '✍️', data: { queue: 'pending_bmo' } }),
      keywords: ['signature', 'direction', 'bmo', 'dg'],
      badge: { label: '3', color: 'purple' },
    });

    items.push({
      id: 'queue-urgent',
      icon: <AlertTriangle className="w-4 h-4 text-rose-500" />,
      title: 'Contrats urgents',
      description: 'Échéance dans moins de 7 jours',
      category: 'Files',
      shortcut: 'Ctrl+1',
      action: () => openTab({ id: 'inbox:urgent', type: 'inbox', title: 'Urgents', icon: '🔥', data: { queue: 'urgent' } }),
      keywords: ['urgent', 'deadline', 'expiration'],
      badge: { label: '2', color: 'rose' },
    });

    items.push({
      id: 'queue-expired',
      icon: <FileClock className="w-4 h-4 text-red-500" />,
      title: 'Contrats expirés',
      description: 'Contrats dont la date est dépassée',
      category: 'Files',
      action: () => openTab({ id: 'inbox:expired', type: 'inbox', title: 'Expirés', icon: '⏰', data: { queue: 'expired' } }),
      keywords: ['expired', 'perime', 'depasse'],
    });

    items.push({
      id: 'queue-signed',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      title: 'Contrats signés',
      description: 'Contrats avec signature BMO validée',
      category: 'Files',
      action: () => openTab({ id: 'inbox:signed', type: 'inbox', title: 'Signés', icon: '✅', data: { queue: 'signed' } }),
      keywords: ['signed', 'valide', 'termine'],
    });

    items.push({
      id: 'queue-high-risk',
      icon: <FileWarning className="w-4 h-4 text-orange-500" />,
      title: 'Risque élevé',
      description: 'Score de risque ≥ 70',
      category: 'Files',
      action: () => openTab({ id: 'inbox:high_risk', type: 'inbox', title: 'Risque élevé', icon: '⚠️', data: { queue: 'high_risk' } }),
      keywords: ['risk', 'risque', 'danger'],
    });

    // === Par type ===
    items.push({
      id: 'type-marche',
      icon: <FileText className="w-4 h-4 text-blue-500" />,
      title: 'Marchés',
      description: 'Contrats de marché public/privé',
      category: 'Types',
      action: () => openTab({ id: 'inbox:marche', type: 'inbox', title: 'Marchés', icon: '📋', data: { queue: 'marche' } }),
      keywords: ['marche', 'contrat'],
    });

    items.push({
      id: 'type-avenant',
      icon: <FileCheck className="w-4 h-4 text-indigo-500" />,
      title: 'Avenants',
      description: 'Modifications de contrats existants',
      category: 'Types',
      action: () => openTab({ id: 'inbox:avenant', type: 'inbox', title: 'Avenants', icon: '📝', data: { queue: 'avenant' } }),
      keywords: ['avenant', 'modification'],
    });

    items.push({
      id: 'type-sous-traitance',
      icon: <Users className="w-4 h-4 text-cyan-500" />,
      title: 'Sous-traitance',
      description: 'Contrats de sous-traitance',
      category: 'Types',
      action: () => openTab({ id: 'inbox:sous_traitance', type: 'inbox', title: 'Sous-traitance', icon: '🤝', data: { queue: 'sous_traitance' } }),
      keywords: ['sous-traitance', 'st', 'prestataire'],
    });

    // === Actions ===
    items.push({
      id: 'action-new',
      icon: <Plus className="w-4 h-4 text-green-500" />,
      title: 'Nouveau contrat',
      description: 'Créer un nouveau contrat',
      category: 'Actions',
      shortcut: 'Ctrl+N',
      action: () => openTab({ id: `wizard:create:${Date.now()}`, type: 'wizard', title: 'Nouveau contrat', icon: '➕', data: { action: 'create' } }),
      keywords: ['nouveau', 'creer', 'ajouter'],
    });

    items.push({
      id: 'action-compare',
      icon: <GitCompare className="w-4 h-4 text-violet-500" />,
      title: 'Comparer des contrats',
      description: 'Ouvrir le comparateur de contrats',
      category: 'Actions',
      action: () => openTab({ id: 'comparateur', type: 'comparateur', title: 'Comparateur', icon: '🔍', data: {} }),
      keywords: ['comparer', 'diff', 'comparaison'],
    });

    items.push({
      id: 'action-workflow',
      icon: <Workflow className="w-4 h-4 text-cyan-500" />,
      title: 'Workflow global',
      description: 'Vue du flux de validation',
      category: 'Actions',
      action: () => window.dispatchEvent(new CustomEvent('contrats:open-workflow')),
      keywords: ['workflow', 'flux', 'processus'],
    });

    items.push({
      id: 'action-arbitrage',
      icon: <Scale className="w-4 h-4 text-pink-500" />,
      title: 'Centre de décision',
      description: 'Arbitrages et décisions direction',
      category: 'Actions',
      shortcut: 'Ctrl+D',
      action: () => window.dispatchEvent(new CustomEvent('contrats:open-decision-center')),
      keywords: ['decision', 'arbitrage', 'direction'],
    });

    // === Outils ===
    items.push({
      id: 'tool-stats',
      icon: <BarChart2 className="w-4 h-4 text-blue-500" />,
      title: 'Statistiques',
      description: 'Tableau de bord et KPIs',
      category: 'Outils',
      shortcut: 'Ctrl+S',
      action: () => window.dispatchEvent(new CustomEvent('contrats:open-stats')),
      keywords: ['stats', 'statistiques', 'kpi', 'dashboard'],
    });

    items.push({
      id: 'tool-export',
      icon: <Download className="w-4 h-4 text-slate-500" />,
      title: 'Exporter',
      description: 'Export CSV avec audit trail',
      category: 'Outils',
      shortcut: 'Ctrl+E',
      action: () => window.dispatchEvent(new CustomEvent('contrats:open-export')),
      keywords: ['export', 'csv', 'telecharger'],
    });

    items.push({
      id: 'tool-audit',
      icon: <History className="w-4 h-4 text-slate-500" />,
      title: 'Historique audit',
      description: 'Journal des actions',
      category: 'Outils',
      action: () => openTab({ id: 'audit', type: 'audit', title: 'Audit', icon: '📜', data: {} }),
      keywords: ['audit', 'historique', 'log', 'trace'],
    });

    items.push({
      id: 'tool-refresh',
      icon: <RefreshCw className="w-4 h-4 text-slate-500" />,
      title: 'Actualiser',
      description: 'Recharger les données',
      category: 'Outils',
      action: () => window.dispatchEvent(new CustomEvent('contrats:refresh')),
      keywords: ['refresh', 'actualiser', 'recharger'],
    });

    items.push({
      id: 'tool-help',
      icon: <HelpCircle className="w-4 h-4 text-slate-500" />,
      title: 'Aide',
      description: 'Raccourcis clavier et aide',
      category: 'Outils',
      shortcut: 'Shift+?',
      action: () => window.dispatchEvent(new CustomEvent('contrats:open-help')),
      keywords: ['aide', 'help', 'raccourcis'],
    });

    // === Contrats récents ===
    contractsToSign.slice(0, 5).forEach((c) => {
      items.push({
        id: `contract-${c.id}`,
        icon: <FileText className="w-4 h-4 text-amber-500" />,
        title: c.id,
        description: c.subject,
        category: 'Contrats récents',
        action: () => openTab({ 
          id: `contrat:${c.id}`, 
          type: 'contrat', 
          title: c.id, 
          icon: '📄', 
          data: { contractId: c.id } 
        }),
        keywords: [c.id.toLowerCase(), c.subject?.toLowerCase() || '', (c as any).partner?.toLowerCase() || ''],
      });
    });

    return items;
  }, [openTab]);

  // Filtrage
  const filteredGroups = useMemo<CommandGroup[]>(() => {
    const q = search.toLowerCase().trim();
    
    let filtered = commands;
    if (q) {
      filtered = commands.filter((cmd) => {
        const searchIn = [
          cmd.title.toLowerCase(),
          cmd.description?.toLowerCase() || '',
          ...((cmd.keywords || []).map((k) => k.toLowerCase())),
        ].join(' ');
        return searchIn.includes(q);
      });
    }

    // Grouper par catégorie
    const groups: Record<string, CommandItem[]> = {};
    filtered.forEach((cmd) => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });

    return Object.entries(groups).map(([title, items]) => ({
      id: title.toLowerCase().replace(/\s+/g, '-'),
      title,
      items,
    }));
  }, [commands, search]);

  // Tous les items aplatis pour la navigation
  const flatItems = useMemo(() => {
    return filteredGroups.flatMap((g) => g.items);
  }, [filteredGroups]);

  // Navigation clavier
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = flatItems[selectedIndex];
      if (item) {
        item.action();
        setOpen(false);
      }
    }
  }, [flatItems, selectedIndex]);

  // Scroll to selected
  useEffect(() => {
    if (listRef.current && flatItems.length > 0) {
      const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, flatItems.length]);

  // Reset index on filter change
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000]">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="absolute top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl"
      >
        <div className="mx-4 rounded-2xl border border-slate-200/70 bg-white/95 backdrop-blur-xl shadow-2xl dark:border-slate-700 dark:bg-slate-900/95 overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200/70 dark:border-slate-700">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher une commande, un contrat..."
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400"
            />
            <kbd className="hidden sm:inline px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[60vh] overflow-auto p-2">
            {filteredGroups.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                Aucun résultat pour "{search}"
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.id} className="mb-4">
                  <div className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {group.title}
                  </div>
                  {group.items.map((item) => {
                    const globalIndex = flatItems.indexOf(item);
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <button
                        key={item.id}
                        data-index={globalIndex}
                        className={cn(
                          'flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
                          isSelected
                            ? 'bg-purple-500/10 text-purple-900 dark:text-purple-100'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                        )}
                        onClick={() => {
                          item.action();
                          setOpen(false);
                        }}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <div className="flex-none">{item.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">{item.title}</span>
                            {item.badge && (
                              <span className={cn(
                                'px-1.5 py-0.5 rounded-full text-xs font-semibold',
                                item.badge.color === 'amber' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
                                item.badge.color === 'purple' && 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
                                item.badge.color === 'rose' && 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
                              )}>
                                {item.badge.label}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-slate-500 truncate mt-0.5">{item.description}</p>
                          )}
                        </div>
                        {item.shortcut && (
                          <kbd className="flex-none px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-500">
                            {item.shortcut}
                          </kbd>
                        )}
                        <ArrowRight className={cn(
                          'w-4 h-4 transition-opacity',
                          isSelected ? 'opacity-100 text-purple-500' : 'opacity-0'
                        )} />
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-slate-200/70 dark:border-slate-700 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span>↑↓ naviguer</span>
              <span>↵ sélectionner</span>
              <span>esc fermer</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span>{commands.length} commandes</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

