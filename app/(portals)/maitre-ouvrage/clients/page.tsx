'use client';

/**
 * Centre de Commandement Clients - Version 2.0
 * Plateforme de gestion du portefeuille clients
 * Architecture cohérente avec les pages Gouvernance et Analytics
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Search,
  Bell,
  ChevronLeft,
  RefreshCw,
  Plus,
  Download,
  Settings,
  MoreHorizontal,
} from 'lucide-react';
import { useClientsWorkspaceStore, subCategoriesMap } from '@/lib/stores/clientsWorkspaceStore';
import { useBMOStore } from '@/lib/stores';
import {
  ClientsCommandSidebar,
  ClientsSubNavigation,
  ClientsKPIBar,
  ClientsContentRouter,
  ClientsFiltersPanel,
  clientsCategories,
} from '@/components/features/bmo/clients/command-center';
import {
  ClientsCommandPalette,
  ClientsStatsModal,
} from '@/components/features/bmo/workspace/clients';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Pattern Modal Overlay
import { GenericDetailModal } from '@/components/ui/GenericDetailModal';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
} from 'lucide-react';

// ================================
// Main Component
// ================================
export default function ClientsPage() {
  const { addToast, currentUser, addActionLog } = useBMOStore();
  const {
    activeCategory,
    activeSubCategory,
    sidebarCollapsed,
    navigationHistory,
    setActiveCategory,
    setActiveSubCategory,
    toggleSidebarCollapsed,
    goBack,
    commandPaletteOpen,
    setCommandPaletteOpen,
    statsModalOpen,
    setStatsModalOpen,
    notificationsPanelOpen,
    setNotificationsPanelOpen,
    filtersPanelOpen,
    setFiltersPanelOpen,
    kpiBarCollapsed,
    setKpiBarCollapsed,
    isFullScreen,
    toggleFullScreen,
  } = useClientsWorkspaceStore();

  // UI state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  
  // Pattern Modal Overlay - Détails client
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // ================================
  // Computed values
  // ================================
  const currentCategoryLabel = useMemo(() => {
    return clientsCategories.find((c) => c.id === activeCategory)?.label || 'Clients';
  }, [activeCategory]);

  const currentSubCategories = useMemo(() => {
    return subCategoriesMap[activeCategory] || [];
  }, [activeCategory]);

  const formatLastUpdate = useCallback(() => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    return `il y a ${Math.floor(diff / 3600)}h`;
  }, [lastUpdate]);

  // ================================
  // Callbacks
  // ================================
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'audit',
      module: 'clients',
      targetId: 'REFRESH',
      targetType: 'system',
      targetLabel: 'Rafraîchissement',
      details: 'Rafraîchissement manuel des données clients',
      bureau: 'BMO',
    });
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdate(new Date());
      addToast('Données clients rafraîchies', 'success');
    }, 1500);
  }, [addToast, addActionLog, currentUser]);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
  }, [setActiveCategory]);

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    setActiveSubCategory(subCategory);
  }, [setActiveSubCategory]);

  const handleApplyFilters = useCallback((filters: Record<string, string[]>) => {
    setActiveFilters(filters);
    const totalFilters = Object.values(filters).reduce((acc, arr) => acc + arr.length, 0);
    if (totalFilters > 0) {
      addToast(`${totalFilters} filtre(s) appliqué(s)`, 'info');
    }
  }, [addToast]);

  const handleExport = useCallback(() => {
    addToast('Export des données clients en cours...', 'info');
    setTimeout(() => addToast('Export généré avec succès', 'success'), 1500);
  }, [addToast]);
  
  // Pattern Modal Overlay Handlers
  const handleViewClient = useCallback((client: any) => {
    setSelectedClient(client);
    setSelectedClientId(client.id);
  }, []);

  const handleEditClient = useCallback((client: any) => {
    console.log('Edit client:', client);
    setSelectedClientId(null);
  }, []);

  const handleDeleteClient = useCallback((id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      console.log('Delete client:', id);
      setSelectedClientId(null);
    }
  }, []);

  // ================================
  // Keyboard shortcuts
  // ================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const isMod = e.metaKey || e.ctrlKey;

      // Ctrl+K : Command Palette
      if (isMod && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // Ctrl+E : Export
      if (isMod && e.key === 'e') {
        e.preventDefault();
        handleExport();
        return;
      }

      // F11 : Fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullScreen();
        return;
      }

      // Alt+Left : Back
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
        return;
      }

      // Ctrl+B : Toggle sidebar
      if (isMod && e.key === 'b') {
        e.preventDefault();
        toggleSidebarCollapsed();
        return;
      }

      // Ctrl+R : Refresh
      if (isMod && e.key === 'r') {
        e.preventDefault();
        handleRefresh();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    setCommandPaletteOpen,
    toggleFullScreen,
    goBack,
    toggleSidebarCollapsed,
    handleRefresh,
    handleExport,
  ]);

  // ================================
  // Render
  // ================================
  return (
    <div
      className={cn(
        'flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden',
        isFullScreen && 'fixed inset-0 z-50'
      )}
    >
      {/* Sidebar Navigation */}
      <ClientsCommandSidebar
        activeCategory={activeCategory}
        collapsed={sidebarCollapsed}
        onCategoryChange={handleCategoryChange}
        onToggleCollapse={toggleSidebarCollapsed}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            {navigationHistory?.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
                title="Retour (Alt+←)"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

            {/* Title */}
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              <h1 className="text-base font-semibold text-slate-200">Gestion Clients</h1>
              <Badge
                variant="default"
                className="text-xs bg-slate-800/50 text-slate-300 border-slate-700/50"
              >
                v2.0
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCommandPaletteOpen(true)}
              className="h-8 px-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            >
              <Search className="h-4 w-4 mr-2" />
              <span className="text-xs hidden sm:inline">Rechercher</span>
              <kbd className="ml-2 text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded hidden sm:inline">
                ⌘K
              </kbd>
            </Button>

            <div className="w-px h-4 bg-slate-700/50 mx-1" />

            {/* New Client Button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="text-xs hidden sm:inline">Nouveau</span>
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationsPanelOpen(!notificationsPanelOpen)}
              className={cn(
                'h-8 w-8 p-0 relative',
                notificationsPanelOpen
                  ? 'text-slate-200 bg-slate-800/50'
                  : 'text-slate-500 hover:text-slate-300'
              )}
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-cyan-500 rounded-full text-xs text-white flex items-center justify-center">
                5
              </span>
            </Button>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleRefresh}>
                  <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
                  Rafraîchir
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltersPanelOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Filtres avancés
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatsModalOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Statistiques
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Sub Navigation */}
        <ClientsSubNavigation
          mainCategory={activeCategory}
          mainCategoryLabel={currentCategoryLabel}
          subCategory={activeSubCategory}
          subCategories={currentSubCategories}
          onSubCategoryChange={handleSubCategoryChange}
        />

        {/* KPI Bar */}
        <ClientsKPIBar
          visible={true}
          collapsed={kpiBarCollapsed}
          onToggleCollapse={() => setKpiBarCollapsed(!kpiBarCollapsed)}
          onRefresh={handleRefresh}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-4">
            <ClientsContentRouter
              category={activeCategory}
              subCategory={activeSubCategory}
              onViewClient={handleViewClient}
              onEditClient={handleEditClient}
              onDeleteClient={handleDeleteClient}
            />
          </div>
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">MàJ: {formatLastUpdate()}</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-600">
              156 clients • 12 prospects • 3 litiges
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  isRefreshing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                )}
              />
              <span className="text-slate-500">
                {isRefreshing ? 'Synchronisation...' : 'Connecté'}
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Command Palette */}
      <ClientsCommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenStats={() => setStatsModalOpen(true)}
        onRefresh={handleRefresh}
      />

      {/* Modals */}
      <ClientsStatsModal open={statsModalOpen} onClose={() => setStatsModalOpen(false)} />

      {/* Notifications Panel */}
      {notificationsPanelOpen && (
        <NotificationsPanel onClose={() => setNotificationsPanelOpen(false)} />
      )}

      {/* Filters Panel */}
      <ClientsFiltersPanel
        isOpen={filtersPanelOpen}
        onClose={() => setFiltersPanelOpen(false)}
        onApplyFilters={handleApplyFilters}
      />

      {/* Pattern Modal Overlay - Détails Client */}
      {selectedClient && (
        <GenericDetailModal
          isOpen={!!selectedClientId}
          onClose={() => {
            setSelectedClientId(null);
            setSelectedClient(null);
          }}
          title={selectedClient.name || 'Détails du client'}
          subtitle={selectedClient.id}
          icon={Users}
          iconClassName="bg-cyan-500/10 text-cyan-400"
          badge={selectedClient.status ? {
            label: selectedClient.status,
            className: cn(
              'text-xs',
              selectedClient.status === 'Actif' && 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
              selectedClient.status === 'Inactif' && 'bg-slate-500/20 text-slate-400 border-slate-500/30',
              selectedClient.status === 'VIP' && 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            )
          } : undefined}
          sections={[
            {
              title: 'Coordonnées',
              icon: Mail,
              fields: [
                { label: 'Email', value: selectedClient.email || 'N/A', icon: Mail },
                { label: 'Téléphone', value: selectedClient.phone || 'N/A', icon: Phone },
                { label: 'Adresse', value: selectedClient.address || 'N/A', icon: MapPin, fullWidth: true },
              ]
            },
            {
              title: 'Informations commerciales',
              icon: Briefcase,
              fields: [
                { label: 'Type', value: selectedClient.type || 'Entreprise', icon: Building2 },
                { label: 'Secteur', value: selectedClient.sector || 'BTP', icon: Briefcase },
                { label: 'Client depuis', value: selectedClient.since ? new Date(selectedClient.since).toLocaleDateString('fr-FR') : 'N/A', icon: Calendar },
                { label: 'Chiffre d\'affaires', value: selectedClient.revenue ? `${(selectedClient.revenue / 1000000).toFixed(1)}M XOF` : 'N/A', icon: DollarSign },
              ]
            },
            {
              title: 'Projets',
              icon: Briefcase,
              fields: [
                { label: 'Projets actifs', value: selectedClient.activeProjects || '0' },
                { label: 'Projets terminés', value: selectedClient.completedProjects || '0' },
                { label: 'Budget total', value: selectedClient.totalBudget ? `${(selectedClient.totalBudget / 1000000).toFixed(1)}M XOF` : 'N/A' },
                { label: 'Satisf action', value: selectedClient.satisfaction ? `${selectedClient.satisfaction}%` : 'N/A' },
              ]
            },
          ]}
          actions={{
            onEdit: () => handleEditClient(selectedClient),
            onDelete: () => handleDeleteClient(selectedClient.id),
            customActions: [
              {
                label: 'Voir les projets',
                icon: Briefcase,
                onClick: () => console.log('View projects'),
              },
            ]
          }}
        />
      )}
    </div>
  );
}

// ================================
// Notifications Panel
// ================================
function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const notifications = [
    {
      id: '1',
      type: 'critical',
      title: 'Nouveau litige client Epsilon SA',
      time: 'il y a 15 min',
      read: false,
    },
    {
      id: '2',
      type: 'warning',
      title: 'Contrat à renouveler - Omega Corp',
      time: 'il y a 1h',
      read: false,
    },
    {
      id: '3',
      type: 'info',
      title: 'Nouveau prospect qualifié',
      time: 'il y a 3h',
      read: true,
    },
    {
      id: '4',
      type: 'warning',
      title: 'Interaction en attente',
      time: 'il y a 5h',
      read: true,
    },
    {
      id: '5',
      type: 'info',
      title: 'Rapport client généré',
      time: 'hier',
      read: true,
    },
  ];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-medium text-slate-200">Notifications</h3>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
              2 nouvelles
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 text-slate-500 hover:text-slate-300"
          >
            ×
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={cn(
                'px-4 py-3 hover:bg-slate-800/30 cursor-pointer transition-colors',
                !notif.read && 'bg-slate-800/20'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                    notif.type === 'critical'
                      ? 'bg-red-500'
                      : notif.type === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-cyan-500'
                  )}
                />
                <div className="min-w-0">
                  <p
                    className={cn(
                      'text-sm',
                      !notif.read ? 'text-slate-200 font-medium' : 'text-slate-400'
                    )}
                  >
                    {notif.title}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">{notif.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800/50">
          <Button variant="outline" size="sm" className="w-full border-slate-700 text-slate-400">
            Voir toutes les notifications
          </Button>
        </div>
      </div>
    </>
  );
}
