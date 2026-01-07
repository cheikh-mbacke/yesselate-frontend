'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { usePageNavigation, useCrossPageLinks } from '@/hooks/usePageNavigation';
import { useAutoSyncCounts } from '@/hooks/useAutoSync';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { AlertDetailsPanel } from '@/components/features/bmo/alerts/AlertDetailsPanel';
import { AlertFilters } from '@/components/features/bmo/alerts/AlertFilters';
import { AlertPerformanceIndicators } from '@/components/features/bmo/alerts/AlertPerformanceIndicators';
import { EscalateToBMOModal } from '@/components/features/bmo/alerts/EscalateToBMOModal';
import { ResolveAlertModal } from '@/components/features/bmo/alerts/ResolveAlertModal';
import {
  systemAlerts,
  blockedDossiers,
  paymentsN1,
  contractsToSign,
  agendaEvents,
  plannedAbsences,
  bureaux,
} from '@/lib/data';
import { X } from 'lucide-react';

type TabType = 'overview' | 'heatmap' | 'journal';

export default function AlertsPage() {
  const router = useRouter();
  const { darkMode } = useAppStore();
  const {
    addToast,
    actionLogs,
    addActionLog,
    openSubstitutionModal,
    openBlocageModal,
  } = useBMOStore();

  // Navigation automatique
  const { updateFilters, getFilters } = usePageNavigation('alerts');
  const crossPageLinks = useCrossPageLinks('alerts');

  // Synchronisation automatique des comptages pour la sidebar
  useAutoSyncCounts('alerts', () => {
    // Compter les alertes critiques et importantes
    return systemAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;
  }, { interval: 10000, immediate: true });
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [alertToEscalateId, setAlertToEscalateId] = useState<string | null>(null);
  const [alertToResolveId, setAlertToResolveId] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    severity?: string;
    type?: string;
    bureau?: string;
    period?: string;
  }>({});

  // Compteurs par gravité
  const alertCounts = useMemo(() => {
    const criticalAlerts = systemAlerts.filter((a) => a.type === 'critical').length;
    const blockedCritical = blockedDossiers.filter((d) => d.impact === 'critical' || d.delay >= 7).length;

    const warningAlerts = systemAlerts.filter((a) => a.type === 'warning').length;
    const blockedWarning = blockedDossiers.filter((d) => d.impact === 'high' && d.delay < 7).length;

    const successAlerts = systemAlerts.filter((a) => a.type === 'success').length;

    return {
      critical: criticalAlerts + blockedCritical,
      warning: warningAlerts + blockedWarning,
      success: successAlerts,
      total: systemAlerts.length + blockedDossiers.length,
    };
  }, []);

  // Calcul des indicateurs de performance
  const performanceStats = useMemo(() => {
    // Simulation de stats (à remplacer par données réelles)
    const totalAlerts = systemAlerts.length + blockedDossiers.length;
    const resolvedAlerts = actionLogs.filter((log) => log.action === 'validation').length;
    const escalatedAlerts = actionLogs.filter((log) => log.action === 'modification' && log.details?.includes('escalade')).length;
    const criticalResolved = actionLogs.filter((log) => log.action === 'validation' && log.module === 'blocked').length;

    return {
      avgResolutionTime: '2.4h',
      resolutionRate: totalAlerts > 0 ? Math.round((resolvedAlerts / totalAlerts) * 100) : 0,
      escalationRate: totalAlerts > 0 ? Math.round((escalatedAlerts / totalAlerts) * 100) : 0,
      criticalResolved,
      criticalTotal: alertCounts.critical,
    };
  }, [actionLogs, alertCounts.critical]);

  // Heatmap des risques
  const heatmapData = useMemo(() => {
    return bureaux.map((bureau) => {
      const blocked = blockedDossiers.filter((d) => d.bureau === bureau.code);
      const absences = plannedAbsences.filter((a) => a.bureau === bureau.code);
      
      const upcomingDeadlines = agendaEvents.filter((e) => {
        if (e.type !== 'deadline') return false;
        const eventDate = new Date(e.date);
        const today = new Date();
        const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
      });

      let riskScore = 0;
      riskScore += blocked.length * 20;
      riskScore += blocked.filter((b) => b.delay >= 7).length * 30;
      riskScore += absences.length * 15;
      riskScore += upcomingDeadlines.length * 10;

      const riskLevel =
        riskScore >= 60 ? 'critical' : riskScore >= 30 ? 'warning' : riskScore > 0 ? 'low' : 'none';

      return {
        bureau: bureau.code,
        bureauName: bureau.name,
        color: bureau.color,
        blocked: blocked.length,
        blockedCritical: blocked.filter((b) => b.delay >= 7).length,
        absences: absences.length,
        deadlines: upcomingDeadlines.length,
        riskScore: Math.min(riskScore, 100),
        riskLevel,
        details: {
          blockedItems: blocked,
          absenceItems: absences,
        },
      };
    });
  }, []);

  // Liste combinée de toutes les alertes avec filtres
  const allAlerts = useMemo(() => {
    const alerts: Array<{
      id: string;
      type: 'system' | 'blocked' | 'payment' | 'contract';
      severity: 'critical' | 'warning' | 'success' | 'info';
      title: string;
      description: string;
      bureau?: string;
      actionType: 'open' | 'substitute' | 'escalate' | 'validate';
      actionLabel: string;
      data?: unknown;
      createdAt?: string;
    }> = [];

    // Alertes système
    systemAlerts.forEach((alert) => {
      alerts.push({
        id: alert.id,
        type: 'system',
        severity: alert.type as 'critical' | 'warning' | 'success' | 'info',
        title: alert.title,
        description: alert.action,
        actionType: 'open',
        actionLabel: 'Voir détails',
        createdAt: new Date().toISOString(),
      });
    });

    // Dossiers bloqués
    blockedDossiers.forEach((dossier) => {
      alerts.push({
        id: dossier.id,
        type: 'blocked',
        severity: dossier.delay >= 7 ? 'critical' : 'warning',
        title: `${dossier.type} bloqué depuis ${dossier.delay}j`,
        description: dossier.subject,
        bureau: dossier.bureau,
        actionType: 'substitute',
        actionLabel: 'Substituer',
        data: dossier,
        createdAt: dossier.blockedSince,
      });
    });

    // Paiements urgents
    paymentsN1
      .filter((p) => {
        const dueDate = new Date(p.dueDate.split('/').reverse().join('-'));
        const today = new Date();
        const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 3;
      })
      .forEach((payment) => {
        alerts.push({
          id: payment.id,
          type: 'payment',
          severity: 'warning',
          title: `Paiement urgent: ${payment.beneficiary}`,
          description: `${payment.amount} FCFA - Échéance ${payment.dueDate}`,
          bureau: payment.bureau,
          actionType: 'validate',
          actionLabel: 'Valider',
          data: payment,
          createdAt: payment.date,
        });
      });

    // Appliquer les filtres
    let filtered = alerts;
    
    if (filters.severity) {
      filtered = filtered.filter((a) => a.severity === filters.severity);
    }
    
    if (filters.type) {
      filtered = filtered.filter((a) => a.type === filters.type);
    }
    
    if (filters.bureau) {
      filtered = filtered.filter((a) => a.bureau === filters.bureau);
    }
    
    if (filters.period) {
      const now = new Date();
      const periodDays = filters.period === 'today' ? 1 : filters.period === 'week' ? 7 : 30;
      const cutoffDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
      
      filtered = filtered.filter((a) => {
        if (!a.createdAt) return true;
        const alertDate = new Date(a.createdAt.split('/').reverse().join('-'));
        return alertDate >= cutoffDate;
      });
    }

    // Tri par sévérité puis date
    return filtered.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2, success: 3 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      
      // Si même sévérité, trier par date (plus récent en premier)
      if (a.createdAt && b.createdAt) {
        const dateA = new Date(a.createdAt.split('/').reverse().join('-'));
        const dateB = new Date(b.createdAt.split('/').reverse().join('-'));
        return dateB.getTime() - dateA.getTime();
      }
      return 0;
    });
  }, [filters]);

  // Gérer les actions sur les alertes
  const handleAlertAction = (alert: (typeof allAlerts)[0], action?: string) => {
    const actionType = action || alert.actionType;
    
    switch (actionType) {
      case 'substitute':
        if (alert.data) {
          openSubstitutionModal(alert.data as typeof blockedDossiers[0]);
        }
        break;
      case 'escalate':
        // RÈGLE MÉTIER : Toute escalade doit remonter vers le BMO
        setAlertToEscalateId(alert.id);
        setShowEscalateModal(true);
        break;
      case 'resolve':
        setAlertToResolveId(alert.id);
        setShowResolveModal(true);
        break;
      case 'validate':
        router.push(`/maitre-ouvrage/validation-paiements?id=${alert.id}`);
        break;
      case 'acknowledge':
        handleAcknowledge(alert.id, alert.title);
        break;
      case 'open':
      default:
        setSelectedAlert(alert.id);
        break;
    }
  };
  
  const handleEscalateToBMO = (message: string, attachments?: string[]) => {
    if (alertToEscalateId) {
      const alert = allAlerts.find(a => a.id === alertToEscalateId);
      if (alert) {
        addActionLog({
          userId: 'USR-001',
          userName: 'A. DIALLO',
          userRole: 'Directeur Général',
          action: 'modification',
          module: 'alerts',
          targetId: alert.id,
          targetType: alert.type,
          targetLabel: alert.title,
          details: `Escaladée au BMO: ${message.substring(0, 100)}...`,
        });
        addToast(`Alerte ${alert.id} escaladée au BMO`, 'success');
      }
      setShowEscalateModal(false);
      setAlertToEscalateId(null);
    }
  };
  
  const handleResolveAlert = (action: string, data: any) => {
    if (alertToResolveId) {
      const alert = allAlerts.find(a => a.id === alertToResolveId);
      if (alert) {
        addActionLog({
          userId: 'USR-001',
          userName: 'A. DIALLO',
          userRole: 'Directeur Général',
          action: 'validation',
          module: 'alerts',
          targetId: alert.id,
          targetType: alert.type,
          targetLabel: alert.title,
          details: `Résolu: ${data.note || action}`,
        });
        addToast(`Alerte ${alert.id} résolue`, 'success');
      }
      setShowResolveModal(false);
      setAlertToResolveId(null);
    }
  };

  // Acquitter une alerte
  const handleAcknowledge = (alertId: string, alertTitle: string) => {
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      action: 'validation',
      module: 'alerts',
      targetId: alertId,
      targetType: 'Alerte',
      targetLabel: alertTitle,
      details: 'Alerte acquittée',
    });
    addToast(`Alerte ${alertId} acquittée`, 'success');
  };

  const selectedAlertData = useMemo(() => {
    if (!selectedAlert) return null;
    return allAlerts.find((a) => a.id === selectedAlert) || null;
  }, [selectedAlert, allAlerts]);

  const handleFilterChange = (key: string, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            ⚠️ Alertes & Risques
            <Badge variant="warning">{alertCounts.total}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Surveillance, risques et actions correctives
          </p>
        </div>
      </div>

      {/* Indicateurs de performance */}
      <AlertPerformanceIndicators stats={performanceStats} />

      {/* Compteurs par gravité */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="border-red-500/30 bg-red-500/5 cursor-pointer hover:border-red-500/50 transition-colors" onClick={() => handleFilterChange('severity', filters.severity === 'critical' ? undefined : 'critical')}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">🚨</span>
              <p className="text-3xl font-bold text-red-400">{alertCounts.critical}</p>
            </div>
            <p className="text-xs text-slate-400 mt-1">Critiques</p>
            <p className="text-[10px] text-red-400">Action immédiate</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30 bg-amber-500/5 cursor-pointer hover:border-amber-500/50 transition-colors" onClick={() => handleFilterChange('severity', filters.severity === 'warning' ? undefined : 'warning')}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">⚠️</span>
              <p className="text-3xl font-bold text-amber-400">{alertCounts.warning}</p>
            </div>
            <p className="text-xs text-slate-400 mt-1">Avertissements</p>
            <p className="text-[10px] text-amber-400">Surveillance</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/30 bg-emerald-500/5 cursor-pointer hover:border-emerald-500/50 transition-colors">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">✅</span>
              <p className="text-3xl font-bold text-emerald-400">{alertCounts.success}</p>
            </div>
            <p className="text-xs text-slate-400 mt-1">Succès</p>
            <p className="text-[10px] text-emerald-400">Confirmations</p>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">📊</span>
              <p className="text-3xl font-bold text-blue-400">{alertCounts.total}</p>
            </div>
            <p className="text-xs text-slate-400 mt-1">Total</p>
            <p className="text-[10px] text-blue-400">Toutes alertes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres dynamiques */}
      <AlertFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        alertCounts={alertCounts}
      />

      {/* Onglets */}
      <div className="flex gap-2 border-b border-slate-700/50 pb-2">
        <Button
          size="sm"
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('overview')}
        >
          📋 Vue d'ensemble
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'heatmap' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('heatmap')}
        >
          🔥 Heatmap risques
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'journal' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('journal')}
        >
          📜 Journal actions ({actionLogs.length})
        </Button>
      </div>

      {/* Tab: Vue d'ensemble */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {allAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-sm text-slate-400">
                  Aucune alerte ne correspond aux filtres sélectionnés
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleResetFilters}
                  className="mt-3"
                >
                  Réinitialiser les filtres
                </Button>
              </CardContent>
            </Card>
          ) : (
            allAlerts.map((alert) => {
            const bgColor =
              alert.severity === 'critical'
                ? 'bg-red-500/10 border-red-500/30'
                : alert.severity === 'warning'
                ? 'bg-amber-500/10 border-amber-500/30'
                : alert.severity === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-blue-500/10 border-blue-500/30';

            const icon =
              alert.severity === 'critical'
                ? '🚨'
                : alert.severity === 'warning'
                ? '⚠️'
                : alert.severity === 'success'
                ? '✅'
                : 'ℹ️';

            return (
                <Card
                  key={alert.id}
                  className={cn(bgColor, 'cursor-pointer hover:shadow-lg transition-all')}
                  onClick={() => setSelectedAlert(alert.id)}
                >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={cn(
                            'font-mono text-[10px]',
                            darkMode ? 'text-slate-400' : 'text-gray-500'
                          )}>
                          {alert.id}
                        </span>
                        <Badge
                          variant={
                            alert.severity === 'critical'
                              ? 'urgent'
                              : alert.severity === 'warning'
                              ? 'warning'
                              : alert.severity === 'success'
                              ? 'success'
                              : 'info'
                          }
                            className="text-[9px]"
                        >
                          {alert.severity}
                        </Badge>
                          <Badge variant="default" className="text-[9px]">
                            {alert.type}
                          </Badge>
                        {alert.bureau && <BureauTag bureau={alert.bureau} />}
                      </div>
                        <h3 className="font-bold text-sm mb-1">{alert.title}</h3>
                        <p className="text-xs text-slate-400">{alert.description}</p>
                        {alert.createdAt && (
                          <p className="text-[10px] text-slate-500 mt-1">
                            {alert.createdAt}
                          </p>
                        )}
                    </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                      <Button
                        size="xs"
                        variant={alert.severity === 'critical' ? 'destructive' : 'warning'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAlertAction(alert);
                          }}
                      >
                        {alert.actionLabel}
                      </Button>
                      <Button
                        size="xs"
                        variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAlertAction(alert, 'acknowledge');
                          }}
                      >
                        ✓ Acquitter
                      </Button>
                      {alert.severity === 'critical' && (
                        <Button
                          size="xs"
                          variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAlertAction(alert, 'escalate');
                          }}
                        >
                          ⬆️ Escalader
                        </Button>
                      )}
                        <Button
                          size="xs"
                          variant={alert.severity === 'critical' ? 'destructive' : 'warning'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAlertAction(alert, 'resolve');
                          }}
                        >
                          🔧 Résoudre
                        </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
            })
          )}
        </div>
      )}

      {/* Tab: Heatmap risques */}
      {activeTab === 'heatmap' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                🔥 Carte de chaleur des risques par bureau
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {heatmapData.map((data) => (
                  <div
                    key={data.bureau}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all cursor-pointer hover:scale-105',
                      data.riskLevel === 'critical'
                        ? 'border-red-500 bg-red-500/20'
                        : data.riskLevel === 'warning'
                        ? 'border-amber-500 bg-amber-500/20'
                        : data.riskLevel === 'low'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-600 bg-slate-700/20'
                    )}
                    onClick={() => {
                      if (data.blocked > 0) {
                        handleFilterChange('bureau', data.bureau);
                        setActiveTab('overview');
                        addToast(
                          `Filtre appliqué: ${data.bureau}`,
                          data.riskLevel === 'critical' ? 'error' : 'warning'
                        );
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm" style={{ color: data.color }}>
                        {data.bureau}
                      </span>
                      <span className="text-lg">
                        {data.riskLevel === 'critical'
                          ? '🔴'
                          : data.riskLevel === 'warning'
                          ? '🟠'
                          : data.riskLevel === 'low'
                          ? '🟡'
                          : '🟢'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mb-2">
                      {data.bureauName}
                    </p>
                    
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          data.riskLevel === 'critical'
                            ? 'bg-red-500'
                            : data.riskLevel === 'warning'
                            ? 'bg-amber-500'
                            : data.riskLevel === 'low'
                            ? 'bg-blue-500'
                            : 'bg-emerald-500'
                        )}
                        style={{ width: `${data.riskScore}%` }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
                      <div>
                        <p className="font-bold text-red-400">{data.blocked}</p>
                        <p className="text-slate-500">Bloqués</p>
                      </div>
                      <div>
                        <p className="font-bold text-amber-400">{data.absences}</p>
                        <p className="text-slate-500">Absences</p>
                      </div>
                      <div>
                        <p className="font-bold text-blue-400">{data.deadlines}</p>
                        <p className="text-slate-500">Échéances</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Légende */}
          <div className="flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span>Critique (≥60)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Attention (30-59)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Faible (1-29)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Aucun risque</span>
            </div>
          </div>

          {/* Détails des risques critiques */}
          {heatmapData.filter((d) => d.riskLevel === 'critical').length > 0 && (
            <Card className="border-red-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-red-400">
                  🚨 Bureaux en situation critique
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {heatmapData
                  .filter((d) => d.riskLevel === 'critical')
                  .map((data) => (
                    <div
                      key={data.bureau}
                      className="p-3 rounded-lg bg-red-500/10 border border-red-500/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <BureauTag bureau={data.bureau} />
                          <span className="text-sm font-semibold">{data.bureauName}</span>
                        </div>
                        <Badge variant="urgent">Score: {data.riskScore}</Badge>
                      </div>
                      <div className="space-y-1">
                        {data.details.blockedItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className={cn(
                              'font-mono',
                              darkMode ? 'text-slate-400' : 'text-gray-500'
                            )}>
                              {item.id}
                            </span>
                            <span className="truncate flex-1 mx-2">{item.subject}</span>
                            <Badge variant="urgent">J+{item.delay}</Badge>
                            <Button
                              size="xs"
                              variant="ghost"
                              className="ml-2"
                              onClick={() => openBlocageModal(item)}
                            >
                              👁️
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tab: Journal des actions */}
      {activeTab === 'journal' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>📜 Journal des actions sur alertes</span>
              <Badge variant="info">{actionLogs.length} entrées</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {actionLogs.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                Aucune action enregistrée
              </p>
            ) : (
              <div className="space-y-2">
                {actionLogs
                  .filter((log) => log.module === 'alerts')
                  .slice(0, 20)
                  .map((log) => (
                  <div
                    key={log.id}
                    className={cn(
                        'flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors',
                      darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                    )}
                      onClick={() => {
                        const alert = allAlerts.find((a) => a.id === log.targetId);
                        if (alert) setSelectedAlert(alert.id);
                      }}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                        log.action === 'validation'
                          ? 'bg-emerald-500/20 text-emerald-400'
                            : log.action === 'modification'
                          ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-blue-500/20 text-blue-400'
                      )}
                    >
                      {log.userName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                          <span className={cn(
                            'font-mono text-[10px]',
                            darkMode ? 'text-slate-400' : 'text-gray-500'
                          )}>
                          {log.id}
                        </span>
                        <Badge variant="default">{log.action}</Badge>
                        {log.bureau && <BureauTag bureau={log.bureau} />}
                      </div>
                      <p className="text-xs font-semibold">
                        {log.userName} ({log.userRole})
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {log.targetLabel || log.targetId} • {log.details}
                      </p>
                    </div>
                    <div className="text-right text-[10px] text-slate-500">
                      {new Date(log.timestamp).toLocaleString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {actionLogs.filter((log) => log.module === 'alerts').length > 20 && (
              <div className="text-center mt-4">
                <Link href="/maitre-ouvrage/logs">
                  <Button size="sm" variant="ghost">
                    Voir tout le journal →
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Panneau de détails latéral */}
      {selectedAlertData && (
        <AlertDetailsPanel
          isOpen={selectedAlert !== null}
          onClose={() => setSelectedAlert(null)}
          alert={selectedAlertData}
          onAction={(action, alertId) => {
            const alert = allAlerts.find((a) => a.id === alertId);
            if (alert) {
              handleAlertAction(alert, action);
            }
          }}
        />
      )}

      {/* Modale Escalade BMO */}
      {alertToEscalateId && (() => {
        const alert = allAlerts.find(a => a.id === alertToEscalateId);
        if (!alert) return null;
        return (
          <EscalateToBMOModal
            key={alertToEscalateId}
            isOpen={showEscalateModal}
            onClose={() => {
              setShowEscalateModal(false);
              setAlertToEscalateId(null);
            }}
            onEscalate={handleEscalateToBMO}
            alert={{
              id: alert.id,
              title: alert.title,
              description: alert.description,
              bureau: alert.bureau,
              type: alert.type,
            }}
          />
        );
      })()}

      {/* Modale Résoudre */}
      {alertToResolveId && (() => {
        const alert = allAlerts.find(a => a.id === alertToResolveId);
        if (!alert) return null;
        return (
          <ResolveAlertModal
            key={alertToResolveId}
            isOpen={showResolveModal}
            onClose={() => {
              setShowResolveModal(false);
              setAlertToResolveId(null);
            }}
            onResolve={handleResolveAlert}
            alert={{
              id: alert.id,
              title: alert.title,
              description: alert.description,
              bureau: alert.bureau,
              type: alert.type,
              data: alert.data,
            }}
          />
        );
      })()}
    </div>
  );
}
