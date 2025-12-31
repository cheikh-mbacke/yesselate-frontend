'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { ActionLogType } from '@/lib/types/bmo.types';

export default function LogsPage() {
  const { darkMode } = useAppStore();
  const { actionLogs, addToast } = useBMOStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<ActionLogType | 'all'>('all');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');

  // Filtrer les logs
  const filteredLogs = useMemo(() => {
    let logs = [...actionLogs];

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      logs = logs.filter(
        (log) =>
          log.userName.toLowerCase().includes(query) ||
          log.targetLabel?.toLowerCase().includes(query) ||
          log.details?.toLowerCase().includes(query) ||
          log.targetId?.toLowerCase().includes(query)
      );
    }

    // Filtre par action
    if (filterAction !== 'all') {
      logs = logs.filter((log) => log.action === filterAction);
    }

    // Filtre par module
    if (filterModule !== 'all') {
      logs = logs.filter((log) => log.module === filterModule);
    }

    // Filtre par date
    const now = new Date();
    if (dateRange === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      logs = logs.filter((log) => new Date(log.timestamp) >= today);
    } else if (dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      logs = logs.filter((log) => new Date(log.timestamp) >= weekAgo);
    } else if (dateRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      logs = logs.filter((log) => new Date(log.timestamp) >= monthAgo);
    }

    return logs;
  }, [actionLogs, searchQuery, filterAction, filterModule, dateRange]);

  // Liste des modules uniques
  const modules = useMemo(() => {
    const uniqueModules = new Set(actionLogs.map((log) => log.module));
    return Array.from(uniqueModules);
  }, [actionLogs]);

  // Mapper les types d'action vers des icônes et couleurs
  const actionConfig: Record<ActionLogType, { icon: string; color: string; label: string }> = {
    validation: { icon: '✅', color: 'text-emerald-400', label: 'Validation' },
    rejection: { icon: '❌', color: 'text-red-400', label: 'Rejet' },
    substitution: { icon: '🔄', color: 'text-orange-400', label: 'Substitution' },
    delegation: { icon: '🔑', color: 'text-blue-400', label: 'Délégation' },
    creation: { icon: '➕', color: 'text-green-400', label: 'Création' },
    modification: { icon: '✏️', color: 'text-amber-400', label: 'Modification' },
    suppression: { icon: '🗑️', color: 'text-red-400', label: 'Suppression' },
    connexion: { icon: '🔓', color: 'text-cyan-400', label: 'Connexion' },
    deconnexion: { icon: '🔒', color: 'text-slate-400', label: 'Déconnexion' },
    export: { icon: '📤', color: 'text-purple-400', label: 'Export' },
    import: { icon: '📥', color: 'text-indigo-400', label: 'Import' },
    budget_alert: { icon: '💰', color: 'text-amber-400', label: 'Alerte budget' },
    budget_approval: { icon: '💵', color: 'text-emerald-400', label: 'Approbation budget' },
  };

  // Formater la date
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogs = actionLogs.filter((log) => new Date(log.timestamp) >= today);
    
    return {
      total: actionLogs.length,
      today: todayLogs.length,
      validations: actionLogs.filter((log) => log.action === 'validation').length,
      substitutions: actionLogs.filter((log) => log.action === 'substitution').length,
    };
  }, [actionLogs]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            📜 Journal des actions
          </h1>
          <p className="text-sm text-slate-400">
            Historique horodaté de toutes les actions sur la plateforme
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => addToast('Export du journal en cours...', 'info')}
          >
            📊 Exporter
          </Button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">{stats.total}</p>
            <p className="text-[10px] text-slate-400">Actions total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.today}</p>
            <p className="text-[10px] text-slate-400">Aujourd&apos;hui</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.validations}</p>
            <p className="text-[10px] text-slate-400">Validations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.substitutions}</p>
            <p className="text-[10px] text-slate-400">Substitutions</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-3">
            {/* Recherche */}
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="🔍 Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filtre par action */}
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value as ActionLogType | 'all')}
              className="p-2 rounded-lg bg-slate-700 border border-slate-600 text-sm"
            >
              <option value="all">Toutes les actions</option>
              {Object.entries(actionConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.icon} {config.label}
                </option>
              ))}
            </select>

            {/* Filtre par module */}
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="p-2 rounded-lg bg-slate-700 border border-slate-600 text-sm"
            >
              <option value="all">Tous les modules</option>
              {modules.map((module) => (
                <option key={module} value={module}>
                  {module}
                </option>
              ))}
            </select>

            {/* Filtre par période */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
              className="p-2 rounded-lg bg-slate-700 border border-slate-600 text-sm"
            >
              <option value="all">Toute la période</option>
              <option value="today">Aujourd&apos;hui</option>
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des logs */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>📋 Historique</span>
            <Badge variant="gray">{filteredLogs.length} entrée(s)</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <span className="text-4xl">📭</span>
              <p className="mt-2">Aucune action trouvée</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredLogs.map((log) => {
                const config = actionConfig[log.action];
                return (
                  <div
                    key={log.id}
                    className={cn(
                      'p-3 rounded-lg border-l-4 transition-all hover:bg-slate-700/30',
                      darkMode ? 'bg-slate-800/50' : 'bg-gray-50',
                      log.action === 'validation' && 'border-l-emerald-500',
                      log.action === 'rejection' && 'border-l-red-500',
                      log.action === 'substitution' && 'border-l-orange-500',
                      log.action === 'delegation' && 'border-l-blue-500',
                      log.action === 'creation' && 'border-l-green-500',
                      log.action === 'modification' && 'border-l-amber-500',
                      log.action === 'suppression' && 'border-l-red-500',
                      !['validation', 'rejection', 'substitution', 'delegation', 'creation', 'modification', 'suppression'].includes(log.action) && 'border-l-slate-500'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {/* Icône action */}
                        <div className={cn('text-xl', config.color)}>
                          {config.icon}
                        </div>

                        {/* Contenu */}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{log.userName}</span>
                            <Badge variant="gray" className="text-[9px]">
                              {log.userRole}
                            </Badge>
                            {log.bureau && (
                              <Badge variant="info" className="text-[9px]">
                                {log.bureau}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs mt-1">
                            <span className={cn('font-medium', config.color)}>
                              {config.label}
                            </span>
                            {log.targetLabel && (
                              <span className="text-slate-400"> — {log.targetLabel}</span>
                            )}
                          </p>
                          {log.details && (
                            <p className="text-[11px] text-slate-400 mt-1">{log.details}</p>
                          )}
                          {log.targetId && (
                            <span className="text-[10px] font-mono text-orange-400">
                              {log.targetId}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Timestamp */}
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-slate-400">
                          {formatDate(log.timestamp)}
                        </p>
                        <p className="text-[9px] text-slate-500 mt-1">
                          {log.module}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h3 className="font-bold text-sm text-blue-400">
                À propos du journal
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Ce journal enregistre automatiquement toutes les actions effectuées 
                sur la plateforme (validations, substitutions, modifications, etc.). 
                Les données sont conservées pendant 90 jours pour des raisons de 
                traçabilité et d&apos;audit. Chaque entrée est horodatée et associée 
                à l&apos;utilisateur qui a effectué l&apos;action.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
