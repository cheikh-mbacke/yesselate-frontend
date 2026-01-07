'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiEndpoints, apiIntegrations } from '@/lib/data';

export default function ApiPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [viewTab, setViewTab] = useState<'endpoints' | 'integrations'>('endpoints');
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  const stats = useMemo(() => {
    const endpointsActive = apiEndpoints.filter(e => e.status === 'active').length;
    const endpointsError = apiEndpoints.filter(e => e.status === 'error' || e.status === 'degraded').length;
    const integrationsActive = apiIntegrations.filter(i => i.status === 'connected').length;
    const integrationsError = apiIntegrations.filter(i => i.status === 'error').length;
    const rotationRequired = apiIntegrations.filter(i => i.credentials.rotationRequired).length;
    const totalCalls = apiEndpoints.reduce((acc, e) => acc + e.callsToday, 0);
    return { endpointsActive, endpointsError, integrationsActive, integrationsError, rotationRequired, totalCalls };
  }, []);

  const selectedI = selectedIntegration ? apiIntegrations.find(i => i.id === selectedIntegration) : null;

  const handleRotateCredentials = (integration: typeof selectedI) => {
    if (!integration) return;
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'api',
      action: 'modification',
      targetId: integration.id,
      targetType: 'ApiIntegration',
      details: `Rotation credentials ${integration.provider}`,
    });
    addToast('Credentials rotés - Action loguée', 'success');
  };

  const handleTestConnection = (integration: typeof selectedI) => {
    if (!integration) return;
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'api',
      action: 'validation',
      targetId: integration.id,
      targetType: 'ApiIntegration',
      details: `Test connexion ${integration.provider}`,
    });
    addToast(`Test ${integration.provider} en cours...`, 'info');
  };

  const handleDisable = (integration: typeof selectedI) => {
    if (!integration) return;
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'api',
      action: 'modification',
      targetId: integration.id,
      targetType: 'ApiIntegration',
      details: `Désactivation ${integration.provider}`,
    });
    addToast('Intégration désactivée', 'warning');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { active: 'emerald', degraded: 'amber', error: 'red', maintenance: 'blue' };
    return colors[status] || 'slate';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = { payment: '💳', banking: '🏦', sms: '📱', email: '📧', storage: '☁️', erp: '🏢' };
    return icons[type] || '🔌';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🔌 API & Intégrations
            <Badge variant="info">{apiIntegrations.length} intégrations</Badge>
          </h1>
          <p className="text-sm text-slate-400">Monitoring endpoints, intégrations externes et rotation credentials</p>
        </div>
      </div>

      {/* Alertes */}
      {(stats.endpointsError > 0 || stats.integrationsError > 0 || stats.rotationRequired > 0) && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚨</span>
              <div className="flex-1">
                <h3 className="font-bold text-red-400">Alertes système</h3>
                <p className="text-sm text-slate-400">
                  {stats.endpointsError > 0 && `${stats.endpointsError} endpoint(s) en erreur • `}
                  {stats.integrationsError > 0 && `${stats.integrationsError} intégration(s) en erreur • `}
                  {stats.rotationRequired > 0 && `${stats.rotationRequired} rotation(s) requise(s)`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.totalCalls.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400">Appels aujourd'hui</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.endpointsActive}</p>
            <p className="text-[10px] text-slate-400">Endpoints OK</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.endpointsError}</p>
            <p className="text-[10px] text-slate-400">Endpoints KO</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.integrationsActive}</p>
            <p className="text-[10px] text-slate-400">Intégrations OK</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.integrationsError}</p>
            <p className="text-[10px] text-slate-400">Intégrations KO</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.rotationRequired}</p>
            <p className="text-[10px] text-slate-400">Rotations</p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <div className="flex gap-2">
        <Button size="sm" variant={viewTab === 'endpoints' ? 'default' : 'secondary'} onClick={() => setViewTab('endpoints')}>📡 Endpoints ({apiEndpoints.length})</Button>
        <Button size="sm" variant={viewTab === 'integrations' ? 'default' : 'secondary'} onClick={() => setViewTab('integrations')}>🔗 Intégrations ({apiIntegrations.length})</Button>
      </div>

      {viewTab === 'endpoints' ? (
        <div className="grid md:grid-cols-2 gap-4">
          {apiEndpoints.map((endpoint) => {
            const statusColor = getStatusColor(endpoint.status);
            return (
              <Card key={endpoint.id} className={cn(`border-l-4 border-l-${statusColor}-500`)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={endpoint.status === 'active' ? 'success' : endpoint.status === 'degraded' ? 'warning' : 'urgent'}>{endpoint.status}</Badge>
                        <span className="font-mono text-xs text-slate-400">{endpoint.method}</span>
                      </div>
                      <h3 className="font-bold mt-1">{endpoint.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">{endpoint.path}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className={cn("p-2 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                      <p className="text-lg font-bold text-blue-400">{endpoint.callsToday.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400">Appels/jour</p>
                    </div>
                    <div className={cn("p-2 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                      <p className={cn("text-lg font-bold", endpoint.avgResponseTime < 200 ? "text-emerald-400" : endpoint.avgResponseTime < 500 ? "text-amber-400" : "text-red-400")}>
                        {endpoint.avgResponseTime}ms
                      </p>
                      <p className="text-[10px] text-slate-400">Temps moy.</p>
                    </div>
                    <div className={cn("p-2 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                      <p className={cn("text-lg font-bold", endpoint.errorRate < 1 ? "text-emerald-400" : endpoint.errorRate < 5 ? "text-amber-400" : "text-red-400")}>
                        {endpoint.errorRate}%
                      </p>
                      <p className="text-[10px] text-slate-400">Erreurs</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-700/50 text-xs text-slate-400 flex justify-between">
                    <span>Rate limit: {endpoint.rateLimit}/min</span>
                    <span>{endpoint.callsMonth.toLocaleString()} ce mois</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            {apiIntegrations.map((integration) => {
              const isSelected = selectedIntegration === integration.id;
              const statusColor = getStatusColor(integration.status);
              
              return (
                <Card
                  key={integration.id}
                  className={cn(
                    'cursor-pointer transition-all',
                    isSelected ? 'ring-2 ring-blue-500' : 'hover:border-blue-500/50',
                    `border-l-4 border-l-${statusColor}-500`,
                  )}
                  onClick={() => setSelectedIntegration(integration.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getTypeIcon(integration.type)}</span>
                          <Badge variant={integration.status === 'connected' ? 'success' : integration.status === 'error' ? 'urgent' : 'warning'}>{integration.status}</Badge>
                          <Badge variant="default">{integration.type}</Badge>
                          {integration.credentials.rotationRequired && <Badge variant="warning" pulse>Rotation requise</Badge>}
                        </div>
                        <h3 className="font-bold mt-1">{integration.provider}</h3>
                      </div>
                      <div className="text-right text-xs text-slate-400">
                        <p>Dernière sync: {integration.lastSync}</p>
                      </div>
                    </div>

                    {integration.status === 'error' && integration.lastError && (
                      <div className="p-2 rounded bg-red-500/10 border border-red-500/30 mb-3">
                        <p className="text-xs text-red-400">⚠️ {integration.lastError}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" variant="info" onClick={(e) => { e.stopPropagation(); handleTestConnection(integration); }}>🔍 Tester</Button>
                      {integration.credentials.rotationRequired && (
                        <Button size="sm" variant="warning" onClick={(e) => { e.stopPropagation(); handleRotateCredentials(integration); }}>🔑 Rotation</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            {selectedI ? (
              <Card className="sticky top-4">
                <CardContent className="p-4">
                  <div className="mb-4 pb-4 border-b border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getTypeIcon(selectedI.type)}</span>
                      <Badge variant={selectedI.status === 'connected' ? 'success' : 'urgent'}>{selectedI.status}</Badge>
                    </div>
                    <h3 className="font-bold">{selectedI.provider}</h3>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-slate-400">Type</p>
                          <p className="capitalize">{selectedI.type}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Dernière sync</p>
                          <p>{selectedI.lastSync}</p>
                        </div>
                      </div>
                    </div>

                    <div className={cn("p-3 rounded", selectedI.credentials.rotationRequired ? "bg-amber-500/10 border border-amber-500/30" : darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                      <p className="text-xs text-slate-400 mb-2">🔑 Credentials</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Dernière rotation</span>
                          <span className="font-mono">{selectedI.credentials.lastRotation}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expiration</span>
                          <span className={cn("font-mono", selectedI.credentials.rotationRequired ? "text-amber-400" : "text-slate-300")}>{selectedI.credentials.expiresAt}</span>
                        </div>
                      </div>
                    </div>

                    {selectedI.webhooks && selectedI.webhooks.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-400 mb-2">🔔 Webhooks ({selectedI.webhooks.length})</p>
                        <div className="space-y-1">
                          {selectedI.webhooks.map((wh, idx) => (
                            <div key={idx} className={cn("p-2 rounded text-xs flex justify-between items-center", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                              <span>{wh.event}</span>
                              <Badge variant={wh.status === 'active' ? 'success' : wh.status === 'failing' ? 'urgent' : 'default'}>{wh.status}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-700/50">
                    <Button size="sm" variant="info" onClick={() => handleTestConnection(selectedI)}>🔍 Tester connexion</Button>
                    {selectedI.credentials.rotationRequired && (
                      <Button size="sm" variant="warning" onClick={() => handleRotateCredentials(selectedI)}>🔑 Rotation credentials</Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => handleDisable(selectedI)}>⛔ Désactiver</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="sticky top-4"><CardContent className="p-8 text-center"><span className="text-4xl mb-4 block">🔗</span><p className="text-slate-400">Sélectionnez une intégration</p></CardContent></Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
