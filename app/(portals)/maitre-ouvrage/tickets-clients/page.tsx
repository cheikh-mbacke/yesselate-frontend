'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { WorkspaceShell } from '@/components/features/_shared/WorkspaceShell';
import { cn } from '@/lib/utils';
import { useHotkeys } from 'react-hotkeys-hook';
import {
  Ticket,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowUpCircle,
  Users,
  Building2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  Settings,
  Download,
  MoreHorizontal,
  Bell,
  Zap,
  BarChart2,
  Map as MapIcon,
  Columns3,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Command,
  XCircle,
  Pause,
  UserCheck,
  TrendingUp,
  Target,
  Shield,
} from 'lucide-react';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';

// Import stores et composants workspace
import {
  useTicketsClientWorkspaceStore,
  type TicketTab,
  type TicketStatus,
  type TicketPriority,
} from '@/lib/stores/ticketsClientWorkspaceStore';
import { TicketsClientWorkspaceTabs } from '@/components/features/tickets-client/workspace/TicketsClientWorkspaceTabs';
import { TicketsClientLiveCounters, type TicketCounters } from '@/components/features/tickets-client/workspace/TicketsClientLiveCounters';
import { TicketsClientCommandPalette } from '@/components/features/tickets-client/workspace/TicketsClientCommandPalette';
import { TicketsClientWorkspaceContent } from '@/components/features/tickets-client/workspace/TicketsClientWorkspaceContent';
import {
  TicketsClientStatsModal,
  TicketsClientExportModal,
  TicketsClientSLAManagerModal,
  TicketsClientEscaladeCenterModal,
  TicketsClientHelpModal,
  TicketsClientClientsManagerModal,
  TicketsClientChantiersManagerModal,
  TicketsClientBulkActionsModal,
  TicketsClientSettingsModal,
} from '@/components/features/tickets-client/workspace/TicketsClientModals';

// ============================================
// MOCK DATA
// ============================================

const MOCK_COUNTERS: TicketCounters = {
  total: 156,
  nouveau: 12,
  enCours: 34,
  enAttenteClient: 8,
  enAttenteInterne: 5,
  escalade: 3,
  resolu: 67,
  clos: 24,
  annule: 3,
  horsDelaiSLA: 4,
  critique: 2,
  haute: 7,
};

const MOCK_ALERTS = [
  {
    id: '1',
    type: 'critical' as const,
    message: '2 tickets critiques dépassent leur SLA',
    action: 'Voir les tickets',
  },
  {
    id: '2',
    type: 'warning' as const,
    message: '3 tickets en escalade nécessitent une attention',
    action: 'Traiter',
  },
];

const MOCK_RECENT_TICKETS = [
  {
    id: 'TKT-2024-0156',
    titre: 'Retard livraison béton - Chantier Montpellier',
    client: 'EIFFAGE',
    chantier: 'Résidence Les Oliviers',
    status: 'nouveau' as TicketStatus,
    priority: 'haute' as TicketPriority,
    slaRemaining: '4h',
    assignedTo: 'Jean Dupont',
    createdAt: 'Il y a 2h',
  },
  {
    id: 'TKT-2024-0155',
    titre: 'Réclamation qualité enduit façade',
    client: 'VINCI',
    chantier: 'Tour Horizon',
    status: 'en_cours' as TicketStatus,
    priority: 'normale' as TicketPriority,
    slaRemaining: '12h',
    assignedTo: 'Marie Martin',
    createdAt: 'Il y a 4h',
  },
  {
    id: 'TKT-2024-0154',
    titre: 'Demande modification plans électriques',
    client: 'BOUYGUES',
    chantier: 'Centre Commercial Est',
    status: 'en_attente_client' as TicketStatus,
    priority: 'basse' as TicketPriority,
    slaRemaining: '24h',
    assignedTo: 'Pierre Durand',
    createdAt: 'Hier',
  },
  {
    id: 'TKT-2024-0153',
    titre: 'Incident sécurité - Échafaudage',
    client: 'COLAS',
    chantier: 'Pont Neuf',
    status: 'escalade' as TicketStatus,
    priority: 'critique' as TicketPriority,
    slaRemaining: 'Dépassé',
    assignedTo: 'Direction',
    createdAt: 'Il y a 6h',
  },
  {
    id: 'TKT-2024-0152',
    titre: 'Facturation travaux supplémentaires',
    client: 'SPIE',
    chantier: 'Usine Logistique Nord',
    status: 'resolu' as TicketStatus,
    priority: 'normale' as TicketPriority,
    slaRemaining: '-',
    assignedTo: 'Sophie Lemaire',
    createdAt: 'Hier',
  },
];

// ============================================
// TYPES
// ============================================

type ActiveSection = 'dashboard' | 'workspace';

// ============================================
// HELPER COMPONENTS
// ============================================

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; icon: React.ReactNode }> = {
  nouveau: { label: 'Nouveau', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: <Ticket className="w-3 h-3" /> },
  en_cours: { label: 'En cours', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: <Clock className="w-3 h-3" /> },
  en_attente_client: { label: 'Attente client', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', icon: <UserCheck className="w-3 h-3" /> },
  en_attente_interne: { label: 'Attente interne', color: 'bg-slate-100 text-slate-700 dark:bg-slate-700/30 dark:text-slate-300', icon: <Pause className="w-3 h-3" /> },
  escalade: { label: 'Escaladé', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300', icon: <ArrowUpCircle className="w-3 h-3" /> },
  resolu: { label: 'Résolu', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', icon: <CheckCircle2 className="w-3 h-3" /> },
  clos: { label: 'Clôturé', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400', icon: <CheckCircle2 className="w-3 h-3" /> },
  annule: { label: 'Annulé', color: 'bg-slate-100 text-slate-500 dark:bg-slate-800/30 dark:text-slate-500', icon: <XCircle className="w-3 h-3" /> },
};

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string }> = {
  critique: { label: 'Critique', color: 'bg-rose-500 text-white' },
  haute: { label: 'Haute', color: 'bg-orange-500 text-white' },
  normale: { label: 'Normale', color: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' },
  basse: { label: 'Basse', color: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500' },
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function TicketsClientsPage() {
  // ===== STATE =====
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [counters, setCounters] = useState<TicketCounters>(MOCK_COUNTERS);
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSLAManager, setShowSLAManager] = useState(false);
  const [showEscaladeCenter, setShowEscaladeCenter] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showClientsManager, setShowClientsManager] = useState(false);
  const [showChantiersManager, setShowChantiersManager] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  // Workspace Store
  const {
    tabs,
    activeTabId,
    openTab,
    goBack,
    goForward,
    canGoBack,
    canGoForward,
  } = useTicketsClientWorkspaceStore();

  // ===== EFFECTS =====
  
  // Initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
      // Simulate counter update
      setCounters((prev) => ({
        ...prev,
        nouveau: prev.nouveau + Math.floor(Math.random() * 2),
      }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // ===== CALLBACKS =====
  
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setLastRefresh(new Date());
      setIsLoading(false);
    }, 500);
  }, []);

  const handleCreateTicket = useCallback(() => {
    openTab({
      id: `wizard-${Date.now()}`,
      type: 'wizard',
      title: 'Nouveau ticket',
      icon: '✨',
    });
    setActiveSection('workspace');
  }, [openTab]);

  const handleOpenTicket = useCallback((ticketId: string, title: string) => {
    openTab({
      id: `ticket-${ticketId}`,
      type: 'ticket',
      title: title || ticketId,
      icon: '🎫',
      data: { ticketId },
    });
    setActiveSection('workspace');
  }, [openTab]);

  const handleOpenQueue = useCallback((queue: string, label: string) => {
    openTab({
      id: `inbox-${queue}`,
      type: 'inbox',
      title: label,
      icon: '📥',
      data: { queue },
    });
    setActiveSection('workspace');
  }, [openTab]);

  const handleDismissAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }, []);

  // ===== HOTKEYS =====
  
  useHotkeys('mod+k', (e) => {
    e.preventDefault();
    setShowCommandPalette(true);
  }, []);

  useHotkeys('mod+n', (e) => {
    e.preventDefault();
    handleCreateTicket();
  }, [handleCreateTicket]);

  useHotkeys('mod+r', (e) => {
    e.preventDefault();
    handleRefresh();
  }, [handleRefresh]);

  useHotkeys('mod+[', (e) => {
    e.preventDefault();
    if (canGoBack()) goBack();
  }, [canGoBack, goBack]);

  useHotkeys('mod+]', (e) => {
    e.preventDefault();
    if (canGoForward()) goForward();
  }, [canGoForward, goForward]);

  // ===== RENDER =====
  
  return (
    <WorkspaceShell
      title="Tickets Clients"
      description="Gestion des tickets et réclamations clients BTP"
      headerActions={
        <div className="flex items-center gap-2">
          {/* Navigation Back/Forward */}
          {activeSection === 'workspace' && (
            <div className="flex items-center gap-1 mr-2">
              <button
                onClick={goBack}
                disabled={!canGoBack()}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  canGoBack()
                    ? 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                )}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goForward}
                disabled={!canGoForward()}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  canGoForward()
                    ? 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                )}
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un ticket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-orange-500/30"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </div>

          {/* Create Ticket */}
          <FluentButton onClick={handleCreateTicket} className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau ticket</span>
          </FluentButton>

          {/* Actions Menu */}
          <div className="relative">
            <FluentButton
              variant="secondary"
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              className="gap-2"
            >
              <MoreHorizontal className="w-4 h-4" />
            </FluentButton>

            {showActionsMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowActionsMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                  <button
                    onClick={() => {
                      setShowActionsMenu(false);
                      setShowStatsModal(true);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <BarChart2 className="w-4 h-4 text-blue-500" />
                    Statistiques
                  </button>
                  <button
                    onClick={() => {
                      setShowActionsMenu(false);
                      setShowExportModal(true);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <Download className="w-4 h-4 text-emerald-500" />
                    Exporter
                  </button>
                  <button
                    onClick={() => {
                      setShowActionsMenu(false);
                      setShowSLAManager(true);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <Clock className="w-4 h-4 text-amber-500" />
                    Gestion SLA
                  </button>
                  <button
                    onClick={() => {
                      setShowActionsMenu(false);
                      setShowEscaladeCenter(true);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <ArrowUpCircle className="w-4 h-4 text-rose-500" />
                    Centre d&apos;escalade
                  </button>
                  <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
                  <button
                    onClick={() => {
                      setShowActionsMenu(false);
                      setShowClientsManager(true);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <Users className="w-4 h-4 text-purple-500" />
                    Gestion clients
                  </button>
                  <button
                    onClick={() => {
                      setShowActionsMenu(false);
                      setShowChantiersManager(true);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <Building2 className="w-4 h-4 text-orange-500" />
                    Carte chantiers
                  </button>
                  <button
                    onClick={() => {
                      setShowActionsMenu(false);
                      setShowBulkActions(true);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <Zap className="w-4 h-4 text-cyan-500" />
                    Actions en masse
                  </button>
                  <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
                  <button
                    onClick={() => {
                      setShowActionsMenu(false);
                      setShowSettingsModal(true);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    Paramètres
                  </button>
                  <button
                    onClick={() => {
                      setShowActionsMenu(false);
                      setShowHelpModal(true);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                    Aide
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Refresh */}
          <FluentButton
            variant="ghost"
            onClick={handleRefresh}
            className={cn(isLoading && 'animate-spin')}
          >
            <RefreshCw className="w-4 h-4" />
          </FluentButton>
        </div>
      }
    >
      {/* Section Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
          <button
            onClick={() => setActiveSection('dashboard')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              activeSection === 'dashboard'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            )}
          >
            Tableau de bord
          </button>
          <button
            onClick={() => setActiveSection('workspace')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2',
              activeSection === 'workspace'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            )}
          >
            Espace de travail
            {tabs.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {tabs.length}
              </Badge>
            )}
          </button>
        </div>

        <div className="text-sm text-slate-500">
          Dernière mise à jour : {lastRefresh.toLocaleTimeString('fr-FR')}
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && activeSection === 'dashboard' && (
        <div className="space-y-2 mb-6">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border',
                alert.type === 'critical'
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/30'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/30'
              )}
            >
              <div className="flex items-center gap-3">
                <AlertCircle
                  className={cn(
                    'w-5 h-5',
                    alert.type === 'critical' ? 'text-rose-500' : 'text-amber-500'
                  )}
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {alert.message}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={cn(
                    'text-sm font-medium px-3 py-1 rounded-md transition-colors',
                    alert.type === 'critical'
                      ? 'text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30'
                      : 'text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                  )}
                >
                  {alert.action}
                </button>
                <button
                  onClick={() => handleDismissAlert(alert.id)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {activeSection === 'dashboard' ? (
        <div className="space-y-6">
          {/* Live Counters */}
          <TicketsClientLiveCounters
            counters={counters}
            onCounterClick={(queue) => handleOpenQueue(queue, `File: ${queue}`)}
          />

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Nouveaux', count: counters.nouveau, queue: 'nouveau', icon: Ticket, color: 'blue' },
              { label: 'Critiques', count: counters.critique, queue: 'critique', icon: AlertCircle, color: 'rose' },
              { label: 'Escaladés', count: counters.escalade, queue: 'escalade', icon: ArrowUpCircle, color: 'orange' },
              { label: 'Hors SLA', count: counters.horsDelaiSLA, queue: 'hors_sla', icon: Clock, color: 'amber' },
            ].map((item) => (
              <button
                key={item.queue}
                onClick={() => handleOpenQueue(item.queue, item.label)}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <item.icon className={cn(
                    'w-5 h-5',
                    item.color === 'blue' && 'text-blue-500',
                    item.color === 'rose' && 'text-rose-500',
                    item.color === 'orange' && 'text-orange-500',
                    item.color === 'amber' && 'text-amber-500',
                  )} />
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {item.count}
                </div>
                <div className="text-sm text-slate-500">{item.label}</div>
              </button>
            ))}
          </div>

          {/* Recent Tickets Table */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Tickets récents
              </h3>
              <button
                onClick={() => handleOpenQueue('all', 'Tous les tickets')}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Voir tout →
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {MOCK_RECENT_TICKETS.map((ticket) => {
                const statusConfig = STATUS_CONFIG[ticket.status];
                const priorityConfig = PRIORITY_CONFIG[ticket.priority];

                return (
                  <button
                    key={ticket.id}
                    onClick={() => handleOpenTicket(ticket.id, ticket.titre)}
                    className="w-full px-6 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-slate-500">{ticket.id}</span>
                        <span className={cn('px-2 py-0.5 text-xs rounded-full', statusConfig.color)}>
                          {statusConfig.label}
                        </span>
                        {(ticket.priority === 'critique' || ticket.priority === 'haute') && (
                          <span className={cn('px-2 py-0.5 text-xs rounded-full', priorityConfig.color)}>
                            {priorityConfig.label}
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {ticket.titre}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {ticket.client}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {ticket.chantier}
                        </span>
                      </div>
                    </div>

                    <div className="text-right text-sm">
                      <div className={cn(
                        'font-medium',
                        ticket.slaRemaining === 'Dépassé' ? 'text-rose-500' : 'text-slate-600 dark:text-slate-400'
                      )}>
                        SLA: {ticket.slaRemaining}
                      </div>
                      <div className="text-slate-400 text-xs mt-1">
                        {ticket.assignedTo}
                      </div>
                      <div className="text-slate-400 text-xs">
                        {ticket.createdAt}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <Target className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Conformité SLA</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">94.2%</div>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94.2%' }} />
              </div>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Temps résolution moy.</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">4.2h</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <TrendingUp className="w-4 h-4" />
                -18% vs mois précédent
              </div>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-slate-500">Satisfaction client</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">92%</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <TrendingUp className="w-4 h-4" />
                +3% vs mois précédent
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Workspace Tabs */}
          <TicketsClientWorkspaceTabs />

          {/* Workspace Content */}
          {activeTabId ? (
            <TicketsClientWorkspaceContent />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Ticket className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Aucun onglet ouvert
              </h3>
              <p className="text-sm text-slate-500 mb-6 max-w-md">
                Ouvrez un ticket depuis le tableau de bord ou créez un nouveau ticket pour commencer.
              </p>
              <div className="flex items-center gap-3">
                <FluentButton onClick={handleCreateTicket}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau ticket
                </FluentButton>
                <FluentButton variant="secondary" onClick={() => setActiveSection('dashboard')}>
                  Retour au tableau de bord
                </FluentButton>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <TicketsClientCommandPalette
        open={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onOpenStats={() => setShowStatsModal(true)}
        onOpenExport={() => setShowExportModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenSLAManager={() => setShowSLAManager(true)}
        onOpenEscaladeCenter={() => setShowEscaladeCenter(true)}
        onOpenClientManager={() => setShowClientsManager(true)}
        onOpenChantierMap={() => setShowChantiersManager(true)}
        onCreateTicket={handleCreateTicket}
        onRefresh={handleRefresh}
      />

      <TicketsClientStatsModal open={showStatsModal} onClose={() => setShowStatsModal(false)} />
      <TicketsClientExportModal open={showExportModal} onClose={() => setShowExportModal(false)} />
      <TicketsClientSLAManagerModal open={showSLAManager} onClose={() => setShowSLAManager(false)} />
      <TicketsClientEscaladeCenterModal open={showEscaladeCenter} onClose={() => setShowEscaladeCenter(false)} />
      <TicketsClientHelpModal open={showHelpModal} onClose={() => setShowHelpModal(false)} />
      <TicketsClientClientsManagerModal open={showClientsManager} onClose={() => setShowClientsManager(false)} />
      <TicketsClientChantiersManagerModal open={showChantiersManager} onClose={() => setShowChantiersManager(false)} />
      <TicketsClientBulkActionsModal open={showBulkActions} onClose={() => setShowBulkActions(false)} />
      <TicketsClientSettingsModal open={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </WorkspaceShell>
  );
}
