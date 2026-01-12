/**
 * AnalyticsCommandPalette.tsx
 * ============================
 * 
 * Palette de commandes avancée pour le workspace Analytics
 * Permet d'ouvrir rapidement n'importe quelle vue et d'exécuter des actions métier
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAnalyticsWorkspaceStore } from '@/lib/stores/analyticsWorkspaceStore';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Badge } from '@/components/ui/badge';
import { 
  Search, BarChart3, TrendingUp, DollarSign, Activity, 
  AlertTriangle, FileText, Download, Calendar, Users,
  PieChart, Bell, Zap, RefreshCw, Settings, Eye,
  Printer, Share2, BookOpen, Lightbulb, Target, Clock,
  Filter, SortAsc, LayoutGrid, List, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchWithScoring, highlightMatch } from '@/application/utils/searchUtils';
import { useDebounce } from '@/application/hooks/useDebounce';
import { FadeIn } from '@/presentation/components/Animations';
import { searchWithScoring, highlightMatch } from '@/application/utils/searchUtils';
import { useDebounce } from '@/application/hooks/useDebounce';
import { FadeIn } from '@/presentation/components/Animations';

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  category: string;
  action: () => void;
  keywords?: string[];
  shortcut?: string;
  badge?: string;
  badgeVariant?: 'default' | 'success' | 'warning' | 'urgent';
}

export function AnalyticsCommandPalette() {
  const { commandPaletteOpen, closeCommandPalette, openTab } = useAnalyticsWorkspaceStore();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Dispatcher des événements personnalisés pour les modals
  const dispatchEvent = useCallback((eventName: string) => {
    window.dispatchEvent(new CustomEvent(eventName));
    closeCommandPalette();
  }, [closeCommandPalette]);

  // Définir toutes les commandes disponibles
  const commands: Command[] = useMemo(() => [
    // === VUES PRINCIPALES ===
    {
      id: 'dashboard:overview',
      label: 'Vue d\'ensemble',
      icon: <BarChart3 className="w-4 h-4 text-orange-500" />,
      category: '📊 Dashboards',
      action: () => openTab({ 
        id: 'dashboard:overview', 
        type: 'dashboard', 
        title: 'Vue d\'ensemble', 
        icon: '📊',
        data: { view: 'overview' }
      }),
      keywords: ['overview', 'général', 'principal', 'accueil'],
      shortcut: '⌘1',
    },
    {
      id: 'inbox:performance',
      label: 'Performance',
      icon: <Activity className="w-4 h-4 text-emerald-500" />,
      category: '📊 Dashboards',
      action: () => openTab({ 
        id: 'inbox:performance', 
        type: 'inbox', 
        title: 'Performance', 
        icon: '⚡',
        data: { queue: 'performance' }
      }),
      keywords: ['performance', 'kpi', 'indicateurs', 'efficacité'],
      shortcut: '⌘2',
    },
    {
      id: 'inbox:financial',
      label: 'Financier',
      icon: <DollarSign className="w-4 h-4 text-amber-500" />,
      category: '📊 Dashboards',
      action: () => openTab({ 
        id: 'inbox:financial', 
        type: 'inbox', 
        title: 'Financier', 
        icon: '💰',
        data: { queue: 'financial' }
      }),
      keywords: ['finance', 'budget', 'dépenses', 'coût', 'argent'],
      shortcut: '⌘3',
    },
    {
      id: 'inbox:trends',
      label: 'Tendances',
      icon: <TrendingUp className="w-4 h-4 text-purple-500" />,
      category: '📊 Dashboards',
      action: () => openTab({ 
        id: 'inbox:trends', 
        type: 'inbox', 
        title: 'Tendances', 
        icon: '📈',
        data: { queue: 'trends' }
      }),
      keywords: ['tendances', 'évolution', 'croissance', 'projection'],
      shortcut: '⌘4',
    },
    {
      id: 'inbox:alerts',
      label: 'Alertes & Risques',
      icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
      category: '📊 Dashboards',
      action: () => openTab({ 
        id: 'inbox:alerts', 
        type: 'inbox', 
        title: 'Alertes', 
        icon: '🚨',
        data: { queue: 'alerts' }
      }),
      keywords: ['alertes', 'problèmes', 'warnings', 'risques', 'critique'],
      shortcut: '⌘5',
      badge: '3',
      badgeVariant: 'urgent',
    },
    {
      id: 'inbox:operations',
      label: 'Opérations',
      icon: <Users className="w-4 h-4 text-blue-500" />,
      category: '📊 Dashboards',
      action: () => openTab({ 
        id: 'inbox:operations', 
        type: 'inbox', 
        title: 'Opérations', 
        icon: '⚙️',
        data: { queue: 'operations' }
      }),
      keywords: ['opérations', 'processus', 'workflow', 'bureaux'],
    },

    // === ACTIONS MÉTIER ===
    {
      id: 'action:stats',
      label: 'Ouvrir statistiques détaillées',
      icon: <PieChart className="w-4 h-4 text-orange-500" />,
      category: '⚡ Actions',
      action: () => dispatchEvent('analytics:open-stats'),
      keywords: ['stats', 'statistiques', 'métriques', 'chiffres'],
      shortcut: '⌘S',
    },
    {
      id: 'action:export',
      label: 'Exporter les données',
      icon: <Download className="w-4 h-4 text-blue-500" />,
      category: '⚡ Actions',
      action: () => dispatchEvent('analytics:open-export'),
      keywords: ['export', 'télécharger', 'excel', 'csv', 'pdf'],
      shortcut: '⌘E',
    },
    {
      id: 'action:report',
      label: 'Générer un rapport',
      icon: <FileText className="w-4 h-4 text-purple-500" />,
      category: '⚡ Actions',
      action: () => dispatchEvent('analytics:open-report'),
      keywords: ['rapport', 'report', 'document', 'synthèse'],
      shortcut: '⌘⇧R',
    },
    {
      id: 'action:alerts',
      label: 'Configurer les alertes',
      icon: <Bell className="w-4 h-4 text-amber-500" />,
      category: '⚡ Actions',
      action: () => dispatchEvent('analytics:open-alerts'),
      keywords: ['alertes', 'notifications', 'configurer', 'seuils'],
    },
    {
      id: 'action:refresh',
      label: 'Actualiser les données',
      icon: <RefreshCw className="w-4 h-4 text-emerald-500" />,
      category: '⚡ Actions',
      action: () => {
        // Trigger refresh
        window.location.reload();
      },
      keywords: ['refresh', 'actualiser', 'recharger', 'màj'],
    },

    // === RAPPORTS ===
    {
      id: 'report:monthly',
      label: 'Rapport mensuel',
      icon: <FileText className="w-4 h-4" />,
      category: '📄 Rapports',
      action: () => openTab({ 
        id: 'report:monthly', 
        type: 'report', 
        title: 'Rapport mensuel', 
        icon: '📄',
        data: { period: 'month' }
      }),
      keywords: ['rapport', 'mensuel', 'mois'],
    },
    {
      id: 'report:quarterly',
      label: 'Rapport trimestriel',
      icon: <FileText className="w-4 h-4" />,
      category: '📄 Rapports',
      action: () => openTab({ 
        id: 'report:quarterly', 
        type: 'report', 
        title: 'Rapport trimestriel', 
        icon: '📊',
        data: { period: 'quarter' }
      }),
      keywords: ['rapport', 'trimestriel', 'trimestre', 'q1', 'q2', 'q3', 'q4'],
    },
    {
      id: 'report:annual',
      label: 'Rapport annuel',
      icon: <FileText className="w-4 h-4" />,
      category: '📄 Rapports',
      action: () => openTab({ 
        id: 'report:annual', 
        type: 'report', 
        title: 'Rapport annuel', 
        icon: '📋',
        data: { period: 'year' }
      }),
      keywords: ['rapport', 'annuel', 'année', 'bilan'],
    },
    {
      id: 'report:executive',
      label: 'Rapport exécutif',
      icon: <BookOpen className="w-4 h-4 text-indigo-500" />,
      category: '📄 Rapports',
      action: () => openTab({ 
        id: 'report:executive', 
        type: 'report', 
        title: 'Rapport exécutif', 
        icon: '📑',
        data: { period: 'month', type: 'executive' }
      }),
      keywords: ['exécutif', 'direction', 'comité', 'synthèse'],
      badge: 'Nouveau',
      badgeVariant: 'success',
    },

    // === COMPARAISONS ===
    {
      id: 'comparison:bureaux',
      label: 'Comparer les bureaux',
      icon: <Users className="w-4 h-4 text-blue-500" />,
      category: '📈 Comparaisons',
      action: () => openTab({ 
        id: 'comparison:bureaux', 
        type: 'comparison', 
        title: 'Comparaison bureaux', 
        icon: '🏢',
        data: { compareBy: 'bureau' }
      }),
      keywords: ['comparer', 'bureaux', 'comparaison', 'benchmark'],
    },
    {
      id: 'comparison:periods',
      label: 'Comparer les périodes',
      icon: <Calendar className="w-4 h-4 text-purple-500" />,
      category: '📈 Comparaisons',
      action: () => openTab({ 
        id: 'comparison:periods', 
        type: 'comparison', 
        title: 'Comparaison périodes', 
        icon: '📅',
        data: { compareBy: 'period' }
      }),
      keywords: ['comparer', 'périodes', 'temps', 'historique'],
    },
    {
      id: 'comparison:kpis',
      label: 'Comparer les KPIs',
      icon: <Target className="w-4 h-4 text-orange-500" />,
      category: '📈 Comparaisons',
      action: () => openTab({ 
        id: 'comparison:kpis', 
        type: 'comparison', 
        title: 'Comparaison KPIs', 
        icon: '🎯',
        data: { compareBy: 'kpi' }
      }),
      keywords: ['comparer', 'kpis', 'indicateurs', 'métriques'],
    },

    // === INSIGHTS & PRÉDICTIONS ===
    {
      id: 'predictive:overview',
      label: 'Insights prédictifs',
      icon: <Zap className="w-4 h-4 text-purple-500" />,
      category: '🔮 Prédictions',
      action: () => openTab({ 
        id: 'predictive:overview', 
        type: 'inbox', 
        title: 'Insights IA', 
        icon: '🔮',
        data: { queue: 'predictive' }
      }),
      keywords: ['prédiction', 'ia', 'intelligence', 'anticipation', 'futur'],
      badge: 'IA',
      badgeVariant: 'default',
    },
    {
      id: 'predictive:recommendations',
      label: 'Recommandations',
      icon: <Lightbulb className="w-4 h-4 text-amber-500" />,
      category: '🔮 Prédictions',
      action: () => openTab({ 
        id: 'predictive:recommendations', 
        type: 'inbox', 
        title: 'Recommandations', 
        icon: '💡',
        data: { queue: 'recommendations' }
      }),
      keywords: ['recommandations', 'suggestions', 'optimisation', 'amélioration'],
    },
    {
      id: 'predictive:anomalies',
      label: 'Détection d\'anomalies',
      icon: <Eye className="w-4 h-4 text-red-500" />,
      category: '🔮 Prédictions',
      action: () => openTab({ 
        id: 'predictive:anomalies', 
        type: 'inbox', 
        title: 'Anomalies', 
        icon: '👁️',
        data: { queue: 'anomalies' }
      }),
      keywords: ['anomalies', 'détection', 'problèmes', 'écarts'],
    },

    // === EXPORT ===
    {
      id: 'export:excel',
      label: 'Exporter vers Excel',
      icon: <Download className="w-4 h-4 text-emerald-500" />,
      category: '📥 Export',
      action: () => {
        dispatchEvent('analytics:open-export');
      },
      keywords: ['export', 'excel', 'xlsx', 'télécharger'],
    },
    {
      id: 'export:pdf',
      label: 'Exporter en PDF',
      icon: <FileText className="w-4 h-4 text-red-500" />,
      category: '📥 Export',
      action: () => {
        dispatchEvent('analytics:open-export');
      },
      keywords: ['export', 'pdf', 'télécharger', 'imprimer'],
    },
    {
      id: 'export:print',
      label: 'Imprimer',
      icon: <Printer className="w-4 h-4 text-slate-500" />,
      category: '📥 Export',
      action: () => {
        window.print();
        closeCommandPalette();
      },
      keywords: ['imprimer', 'print', 'papier'],
    },
    {
      id: 'export:share',
      label: 'Partager le lien',
      icon: <Share2 className="w-4 h-4 text-blue-500" />,
      category: '📥 Export',
      action: () => {
        navigator.clipboard.writeText(window.location.href);
        closeCommandPalette();
      },
      keywords: ['partager', 'share', 'lien', 'copier'],
    },

    // === AFFICHAGE ===
    {
      id: 'view:cards',
      label: 'Vue en cartes',
      icon: <LayoutGrid className="w-4 h-4" />,
      category: '🎨 Affichage',
      action: () => {
        // Changer le mode d'affichage
        closeCommandPalette();
      },
      keywords: ['cartes', 'cards', 'grille', 'vue'],
    },
    {
      id: 'view:list',
      label: 'Vue en liste',
      icon: <List className="w-4 h-4" />,
      category: '🎨 Affichage',
      action: () => {
        // Changer le mode d'affichage
        closeCommandPalette();
      },
      keywords: ['liste', 'list', 'tableau', 'vue'],
    },
    {
      id: 'view:filter',
      label: 'Filtrer les données',
      icon: <Filter className="w-4 h-4" />,
      category: '🎨 Affichage',
      action: () => {
        // Ouvrir le panneau de filtres
        closeCommandPalette();
      },
      keywords: ['filtrer', 'filter', 'rechercher', 'critères'],
    },
    {
      id: 'view:sort',
      label: 'Trier les données',
      icon: <SortAsc className="w-4 h-4" />,
      category: '🎨 Affichage',
      action: () => {
        // Ouvrir le menu de tri
        closeCommandPalette();
      },
      keywords: ['trier', 'sort', 'ordre', 'classement'],
    },
  ], [openTab, closeCommandPalette, dispatchEvent]);

  // Filtrer les commandes selon la recherche
  const filteredCommands = useMemo(() => {
    if (!search) return commands;
    
    const query = search.toLowerCase();
    return commands.filter(cmd => 
      cmd.label.toLowerCase().includes(query) ||
      cmd.category.toLowerCase().includes(query) ||
      cmd.keywords?.some(kw => kw.toLowerCase().includes(query))
    );
  }, [commands, search]);

  // Grouper par catégorie
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Reset search et index quand on ouvre/ferme
  useEffect(() => {
    if (commandPaletteOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

  // Navigation clavier
  useEffect(() => {
    if (!commandPaletteOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = filteredCommands[selectedIndex];
        if (cmd) {
          cmd.action();
          closeCommandPalette();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeCommandPalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, filteredCommands, selectedIndex, closeCommandPalette]);

  const handleCommandClick = (cmd: Command) => {
    cmd.action();
    closeCommandPalette();
  };

  return (
    <FluentModal
      open={commandPaletteOpen}
      title=""
      onClose={closeCommandPalette}
      size="lg"
    >
      <div className="space-y-4">
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une commande, vue ou action..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700/50 bg-slate-800 
                     outline-none focus:ring-2 focus:ring-orange-500/30 
                     text-slate-200 placeholder-slate-500"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            autoFocus
          />
          {search && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
              {filteredCommands.length} résultat(s)
            </span>
          )}
        </div>

        {/* Résultats */}
        <div className="max-h-[400px] overflow-y-auto space-y-4">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Aucune commande trouvée</p>
              <p className="text-xs mt-1">Essayez un autre terme de recherche</p>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category}>
                <div className="text-xs font-semibold text-slate-500 mb-2 px-2">
                  {category}
                </div>
                <div className="space-y-1">
                  {cmds.map((cmd) => {
                    const globalIndex = filteredCommands.indexOf(cmd);
                    const isSelected = globalIndex === selectedIndex;
                    
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => handleCommandClick(cmd)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left',
                          isSelected
                            ? 'bg-orange-500/10 border border-orange-500/30'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                        )}
                      >
                        <div className="flex-shrink-0">{cmd.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">{cmd.label}</span>
                            {cmd.badge && (
                              <Badge 
                                variant={cmd.badgeVariant || 'default'} 
                                className="text-[10px]"
                              >
                                {cmd.badge}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {cmd.shortcut && (
                            <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">
                              {cmd.shortcut}
                            </kbd>
                          )}
                          {isSelected && (
                            <div className="text-xs text-slate-500">↵</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">↓</kbd>
              Naviguer
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">↵</kbd>
              Sélectionner
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">Esc</kbd>
            Fermer
          </span>
        </div>
      </div>
    </FluentModal>
  );
}
