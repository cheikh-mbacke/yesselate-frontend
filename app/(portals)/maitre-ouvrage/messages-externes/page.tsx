'use client';

/**
 * Centre de Commandement Messages Externes - Version 2.0
 * Architecture cohérente avec Analytics et Gouvernance
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Mail,
  Search,
  Bell,
  ChevronLeft,
  MoreVertical,
  Download,
  RefreshCw,
} from 'lucide-react';
import {
  useMessagesExternesCommandCenterStore,
  type MessagesExternesMainCategory,
} from '@/lib/stores/messagesExternesCommandCenterStore';
import {
  MessagesExternesCommandSidebar,
  MessagesExternesSubNavigation,
  MessagesExternesKPIBar,
  messagesExternesCategories,
} from '@/components/features/bmo/messages-externes/command-center';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { messagesExternes } from '@/lib/data';
import type { ExternalMessage } from '@/lib/types/bmo.types';

// Type pour les messages
type MessageItem = typeof messagesExternes[number];

// Sous-catégories par catégorie principale
interface SubCategory {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
}

const subCategoriesMap: Record<string, SubCategory[]> = {
  overview: [
    { id: 'all', label: 'Tout' },
    { id: 'recent', label: 'Récents' },
    { id: 'priority', label: 'Prioritaires' },
  ],
  unread: [
    { id: 'all', label: 'Tous les non lus' },
    { id: 'urgent', label: 'Urgents', badgeType: 'critical' },
    { id: 'high', label: 'Haute priorité', badgeType: 'warning' },
  ],
  requires_response: [
    { id: 'all', label: 'Tous à répondre' },
    { id: 'overdue', label: 'En retard', badgeType: 'critical' },
    { id: 'due_soon', label: 'Échéance proche', badgeType: 'warning' },
  ],
  replied: [
    { id: 'all', label: 'Tous les répondus' },
    { id: 'today', label: "Aujourd'hui" },
    { id: 'this_week', label: 'Cette semaine' },
  ],
  archived: [
    { id: 'all', label: 'Tous les archivés' },
    { id: 'this_month', label: 'Ce mois' },
    { id: 'older', label: 'Plus anciens' },
  ],
  by_type: [
    { id: 'all', label: 'Tous les types' },
    { id: 'courrier', label: 'Courrier' },
    { id: 'email', label: 'Email' },
    { id: 'fax', label: 'Fax' },
    { id: 'recommande', label: 'Recommandé' },
  ],
  by_priority: [
    { id: 'all', label: 'Toutes priorités' },
    { id: 'urgent', label: 'Urgent', badgeType: 'critical' },
    { id: 'high', label: 'Haute', badgeType: 'warning' },
    { id: 'normal', label: 'Normale' },
    { id: 'low', label: 'Basse' },
  ],
  analytics: [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'trends', label: 'Tendances' },
    { id: 'performance', label: 'Performance' },
  ],
  settings: [
    { id: 'general', label: 'Général' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'export', label: 'Export' },
  ],
};

// WHY: Export CSV enrichi — traçabilité RACI incluse
const exportMessagesAsCSV = (
  messages: MessageItem[],
  addToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void
) => {
  const headers = [
    'ID',
    'Expéditeur',
    'Objet',
    'Type',
    'Statut',
    'Priorité',
    'Réponse requise',
    'Date',
    'Origine décisionnelle',
    'ID décision',
    'Rôle RACI',
    'Hash traçabilité',
    'Statut BMO',
  ];

  const rows = messages.map(m => [
    m.id,
    m.sender,
    `"${m.subject}"`,
    m.type,
    m.status,
    m.priority,
    m.requiresResponse ? 'Oui' : 'Non',
    m.date,
    m.decisionBMO?.origin || 'Hors périmètre BMO',
    m.decisionBMO?.decisionId || '',
    m.decisionBMO?.validatorRole || '',
    m.decisionBMO?.hash || '',
    m.decisionBMO ? 'Piloté' : 'Non piloté',
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `messages_externes_bmo_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  addToast('✅ Export Messages généré (traçabilité RACI incluse)', 'success');
};

export default function MessagesExternesPage() {
  return <MessagesExternesPageContent />;
}

function MessagesExternesPageContent() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog, currentUser } = useBMOStore();
  const {
    navigation,
    fullscreen,
    sidebarCollapsed,
    commandPaletteOpen,
    notificationsPanelOpen,
    kpiConfig,
    navigationHistory,
    toggleFullscreen,
    toggleCommandPalette,
    toggleNotificationsPanel,
    toggleSidebar,
    goBack,
    navigate,
    setKPIConfig,
  } = useMessagesExternesCommandCenterStore();

  // État local
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Navigation state
  const activeCategory = navigation.mainCategory;
  const activeSubCategory = navigation.subCategory || 'all';

  // Calcul des stats
  const stats = useMemo(() => {
    const unread = messagesExternes.filter(m => m.status === 'unread').length;
    const requiresResponse = messagesExternes.filter(m => m.requiresResponse && m.status !== 'replied').length;
    const replied = messagesExternes.filter(m => m.status === 'replied').length;
    const archived = messagesExternes.filter(m => m.status === 'archived').length;
    return {
      total: messagesExternes.length,
      unread,
      requiresResponse,
      replied,
      archived,
    };
  }, []);

  // Filtrage des messages selon la navigation
  const filteredMessages = useMemo(() => {
    let filtered = [...messagesExternes];

    // Filtrage par catégorie principale
    switch (activeCategory) {
      case 'unread':
        filtered = filtered.filter(m => m.status === 'unread');
        break;
      case 'requires_response':
        filtered = filtered.filter(m => m.requiresResponse && m.status !== 'replied');
        break;
      case 'replied':
        filtered = filtered.filter(m => m.status === 'replied');
        break;
      case 'archived':
        filtered = filtered.filter(m => m.status === 'archived');
        break;
      case 'overview':
      default:
        // Pas de filtre
        break;
    }

    return filtered;
  }, [activeCategory]);

  // Computed values
  const currentCategoryLabel = useMemo(() => {
    return messagesExternesCategories.find((c) => c.id === activeCategory)?.label || 'Messages Externes';
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

  // Callbacks
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdate(new Date());
      addToast('✅ Données actualisées', 'success');
    }, 1500);
  }, [addToast]);

  const handleCategoryChange = useCallback((category: string) => {
    navigate(category as MessagesExternesMainCategory, 'all', null);
  }, [navigate]);

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    navigate(activeCategory, subCategory, null);
  }, [activeCategory, navigate]);

  const handleRespond = useCallback((message: MessageItem | null) => {
    if (!message) return;
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      module: 'messages-externes',
      action: 'modification',
      targetId: message.id,
      targetType: 'ExternalMessage',
      details: `Réponse message ${message.sender}`,
      bureau: 'BMO',
    });
    addToast('✅ Réponse envoyée - Preuve archivée', 'success');
  }, [addActionLog, addToast, currentUser]);

  const handleAssign = useCallback((message: MessageItem | null) => {
    if (!message) return;
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      module: 'messages-externes',
      action: 'delegation',
      targetId: message.id,
      targetType: 'ExternalMessage',
      details: `Message assigné pour traitement`,
      bureau: 'BMO',
    });
    addToast('📨 Message assigné', 'info');
  }, [addActionLog, addToast, currentUser]);

  const handleArchive = useCallback((message: MessageItem | null) => {
    if (!message) return;
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      module: 'messages-externes',
      action: 'modification',
      targetId: message.id,
      targetType: 'ExternalMessage',
      details: `Message archivé`,
      bureau: 'BMO',
    });
    addToast('📁 Message archivé', 'success');
  }, [addActionLog, addToast, currentUser]);

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = { courrier: '📬', email: '📧', fax: '📠', recommande: '📮' };
    return icons[type] || '📩';
  };

  const selectedM = selectedMessage ? messagesExternes.find(m => m.id === selectedMessage) : null;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
        return;
      }

      if (isMod && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandPalette, toggleFullscreen, toggleSidebar, goBack]);

  // Render
  return (
    <div
      className={cn(
        'flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden',
        fullscreen && 'fixed inset-0 z-50'
      )}
    >
      {/* Sidebar Navigation */}
      <MessagesExternesCommandSidebar
        activeCategory={activeCategory}
        collapsed={sidebarCollapsed}
        onCategoryChange={handleCategoryChange}
        onToggleCollapse={toggleSidebar}
        onOpenCommandPalette={toggleCommandPalette}
        stats={stats}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            {navigationHistory.length > 0 && (
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
              <Mail className="h-5 w-5 text-blue-400" />
              <h1 className="text-base font-semibold text-slate-200">Messages Externes</h1>
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
            {/* Search */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCommandPalette}
              className="h-8 px-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
            >
              <Search className="h-4 w-4 mr-2" />
              <span className="text-xs hidden sm:inline">Rechercher</span>
              <kbd className="ml-2 text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded hidden sm:inline">
                ⌘K
              </kbd>
            </Button>

            <div className="w-px h-4 bg-slate-700/50 mx-1" />

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleNotificationsPanel}
              className={cn(
                'h-8 w-8 p-0 relative',
                notificationsPanelOpen
                  ? 'text-slate-200 bg-slate-800/50'
                  : 'text-slate-500 hover:text-slate-300'
              )}
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {stats.unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {stats.unread > 9 ? '9+' : stats.unread}
                </span>
              )}
            </Button>

            {/* Export */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => exportMessagesAsCSV(messagesExternes, addToast)}
              className="h-8 px-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
              title="Exporter CSV"
            >
              <Download className="h-4 w-4" />
            </Button>

            {/* Refresh */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
              title="Actualiser"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>

            {/* More Actions */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
              title="Plus d'actions"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Sub Navigation */}
        <MessagesExternesSubNavigation
          mainCategory={activeCategory}
          mainCategoryLabel={currentCategoryLabel}
          subCategory={activeSubCategory}
          subCategories={currentSubCategories}
          onSubCategoryChange={handleSubCategoryChange}
        />

        {/* KPI Bar */}
        {kpiConfig.visible && (
          <MessagesExternesKPIBar
            messages={messagesExternes}
            visible={true}
            collapsed={kpiConfig.collapsed}
            onToggleCollapse={() => setKPIConfig({ collapsed: !kpiConfig.collapsed })}
            onRefresh={handleRefresh}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-4">
            {/* Alert pour messages nécessitant réponse */}
            {stats.requiresResponse > 0 && activeCategory === 'overview' && (
              <Card className="border-amber-500/50 bg-amber-500/10 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-amber-400">{stats.requiresResponse} message(s) nécessitant réponse</h3>
                      <p className="text-sm text-slate-400">Sous responsabilité <strong>BMO (Accountable)</strong></p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Messages List */}
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-3">
                {filteredMessages.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <span className="text-4xl mb-4 block">📨</span>
                      <p className="text-slate-400">Aucun message trouvé</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredMessages.map((message) => {
                    const isSelected = selectedMessage === message.id;
                    
                    return (
                      <Card
                        key={message.id}
                        className={cn(
                          'cursor-pointer transition-all',
                          isSelected ? 'ring-2 ring-blue-500' : 'hover:border-blue-500/50',
                          message.status === 'unread' && 'border-l-4 border-l-red-500',
                          message.requiresResponse && message.status !== 'replied' && 'border-l-4 border-l-amber-500',
                          message.status === 'replied' && 'border-l-4 border-l-emerald-500',
                          message.status === 'archived' && 'opacity-60',
                        )}
                        onClick={() => setSelectedMessage(message.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-lg">{getTypeIcon(message.type)}</span>
                                <span className="font-mono text-xs text-blue-400">{message.id}</span>
                                <Badge variant={message.status === 'unread' ? 'urgent' : message.status === 'replied' ? 'success' : 'default'}>{message.status}</Badge>
                                <Badge variant={message.priority === 'urgent' ? 'urgent' : message.priority === 'high' ? 'warning' : 'default'}>{message.priority}</Badge>
                              </div>
                              <h3 className="font-bold mt-1">{message.subject}</h3>
                              <p className="text-sm text-slate-400">{message.sender}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-400">{message.date}</p>
                              {message.requiresResponse && message.status !== 'replied' && (
                                <Badge variant="warning" className="mt-1">Réponse requise</Badge>
                              )}
                            </div>
                          </div>

                          {message.status !== 'archived' && (
                            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                              {message.requiresResponse && message.status !== 'replied' && (
                                <Button size="sm" variant="success" onClick={(e) => { e.stopPropagation(); handleRespond(message); }}>💬 Répondre</Button>
                              )}
                              <Button size="sm" variant="info" onClick={(e) => { e.stopPropagation(); handleAssign(message); }}>👤 Assigner</Button>
                              <Button size="sm" variant="default" onClick={(e) => { e.stopPropagation(); handleArchive(message); }}>📁 Archiver</Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>

              {/* Detail Panel */}
              <div className="lg:col-span-1">
                {selectedM ? (
                  <Card className="sticky top-4">
                    <CardContent className="p-4">
                      <div className="mb-4 pb-4 border-b border-slate-700/50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getTypeIcon(selectedM.type)}</span>
                          <Badge variant={selectedM.status === 'unread' ? 'urgent' : selectedM.status === 'replied' ? 'success' : 'default'}>{selectedM.status}</Badge>
                        </div>
                        <span className="font-mono text-xs text-blue-400">{selectedM.id}</span>
                        <h3 className="font-bold">{selectedM.subject}</h3>
                        <p className="text-slate-400">{selectedM.sender}</p>
                      </div>

                      {/* Décision BMO */}
                      {selectedM.decisionBMO && (
                        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 mb-3">
                          <p className="text-[10px] text-purple-400 mb-1">Décision BMO</p>
                          <Badge variant="default" className="text-[9px]">
                            {selectedM.decisionBMO.validatorRole === 'A' ? 'BMO (Accountable)' : 'BM (Responsible)'}
                          </Badge>
                          <div className="flex items-center gap-2 mt-2">
                            <code className="text-[10px] bg-slate-800/50 px-1 rounded">
                              {selectedM.decisionBMO.hash.slice(0, 32)}...
                            </code>
                            <Button
                              size="xs"
                              variant="ghost"
                              className="text-[10px] text-blue-400 p-0 h-auto"
                              onClick={async () => {
                                const isValid = selectedM.decisionBMO?.hash.startsWith('SHA3-256:');
                                addToast(
                                  isValid ? '✅ Hash valide' : '❌ Hash invalide',
                                  isValid ? 'success' : 'error'
                                );
                              }}
                            >
                              🔍 Vérifier
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3 text-sm">
                        <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs text-slate-400">Type</p>
                              <p className="capitalize">{selectedM.type}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Date</p>
                              <p>{selectedM.date}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Priorité</p>
                              <Badge variant={selectedM.priority === 'urgent' ? 'urgent' : 'default'}>{selectedM.priority}</Badge>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Réponse</p>
                              <p>{selectedM.requiresResponse ? 'Requise' : 'Non requise'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {selectedM.status !== 'archived' && (
                        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-700/50">
                          {selectedM.requiresResponse && selectedM.status !== 'replied' && (
                            <Button size="sm" variant="success" onClick={() => handleRespond(selectedM)}>💬 Répondre</Button>
                          )}
                          <Button size="sm" variant="info" onClick={() => handleAssign(selectedM)}>👤 Assigner</Button>
                          <Button size="sm" variant="default" onClick={() => handleArchive(selectedM)}>📁 Archiver</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="sticky top-4">
                    <CardContent className="p-8 text-center">
                      <span className="text-4xl mb-4 block">📨</span>
                      <p className="text-slate-400">Sélectionnez un message</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Status Bar */}
        <footer className="flex items-center justify-between px-4 py-1.5 border-t border-slate-800/50 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">MàJ: {formatLastUpdate()}</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-600">
              {stats.total} messages • {stats.unread} non lus • {stats.requiresResponse} à répondre
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
    </div>
  );
}
