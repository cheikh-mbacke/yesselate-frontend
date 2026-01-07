'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import { useAutoSyncCounts } from '@/hooks/useAutoSync';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiEndpoints, apiIntegrations } from '@/lib/data';

type ViewTab = 'endpoints' | 'integrations';

type ApiEndpoint = (typeof apiEndpoints)[number];
type ApiIntegration = (typeof apiIntegrations)[number];

const STATUS_BORDER: Record<string, string> = {
  active: 'border-l-emerald-500',
  connected: 'border-l-emerald-500',
  ok: 'border-l-emerald-500',

  degraded: 'border-l-amber-500',
  warning: 'border-l-amber-500',
  disconnected: 'border-l-amber-500',

  error: 'border-l-red-500',
  failing: 'border-l-red-500',

  maintenance: 'border-l-blue-500',
  disabled: 'border-l-slate-500',
};

const badgeVariantForStatus = (status: string) => {
  const s = (status || '').toLowerCase();
  if (['active', 'connected', 'ok'].includes(s)) return 'success';
  if (['degraded', 'warning', 'disconnected'].includes(s)) return 'warning';
  if (['maintenance'].includes(s)) return 'info';
  if (['error', 'failing'].includes(s)) return 'urgent';
  if (['disabled'].includes(s)) return 'default';
  return 'default';
};

const borderClassForStatus = (status: string) =>
  STATUS_BORDER[(status || '').toLowerCase()] || 'border-l-slate-500';

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    payment: '💳',
    banking: '🏦',
    sms: '📱',
    email: '📧',
    storage: '☁️',
    erp: '🏢',
  };
  return icons[type] || '🔌';
};

const isEndpointIssue = (e: ApiEndpoint) =>
  e.status === 'error' || e.status === 'degraded';

const isIntegrationIssue = (i: ApiIntegration) =>
  i.status === 'error' || i.status === 'degraded' || (i as any)?.status === 'disconnected' || Boolean(i.credentials?.rotationRequired);

const safeCopy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

function CmdItem({
  label,
  hint,
  onClick,
}: {
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left p-3 rounded-lg border border-slate-700/30 hover:bg-blue-500/5 transition-colors"
    >
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-[10px] text-slate-400">{hint}</p>
    </button>
  );
}

export default function ApiPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();

  // Navigation persistée (si votre hook stocke des filtres)
  const { updateFilters, getFilters } = usePageNavigation('api');

  const [viewTab, setViewTab] = useState<ViewTab>('endpoints');

  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(null);
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string | null>(null);

  // UX "pro"
  const [q, setQ] = useState('');
  const search = q.trim().toLowerCase();
  const searchRef = useRef<HTMLInputElement | null>(null);

  const [showOnlyIssues, setShowOnlyIssues] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const [cmdOpen, setCmdOpen] = useState(false);

  // Init depuis URL + store navigation
  useEffect(() => {
    const tab = sp.get('tab') as ViewTab | null;
    const endpoint = sp.get('endpoint');
    const integration = sp.get('integration');

    if (tab === 'endpoints' || tab === 'integrations') setViewTab(tab);
    if (endpoint) setSelectedEndpointId(endpoint);
    if (integration) setSelectedIntegrationId(integration);

    const stored = (getFilters?.() ?? {}) as any;
    if (stored && typeof stored === 'object') {
      setViewTab((prev) => (tab ? prev : stored.viewTab ?? prev));
      setSelectedEndpointId((prev) => (endpoint ? prev : stored.selectedEndpointId ?? prev));
      setSelectedIntegrationId((prev) => (integration ? prev : stored.selectedIntegrationId ?? prev));
      setQ((prev) => (prev ? prev : stored.q ?? ''));
      setShowOnlyIssues((prev) => (prev ? prev : stored.showOnlyIssues ?? false));
      setStatusFilter((prev) => (prev !== 'ALL' ? prev : stored.statusFilter ?? 'ALL'));
      setTypeFilter((prev) => (prev !== 'ALL' ? prev : stored.typeFilter ?? 'ALL'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync URL + store navigation
  useEffect(() => {
    try {
      updateFilters?.({
        viewTab,
        selectedEndpointId,
        selectedIntegrationId,
        q,
        showOnlyIssues,
        statusFilter,
        typeFilter,
      });
    } catch {
      // ignore
    }

    const params = new URLSearchParams();
    params.set('tab', viewTab);
    if (selectedEndpointId && viewTab === 'endpoints') params.set('endpoint', selectedEndpointId);
    if (selectedIntegrationId && viewTab === 'integrations') params.set('integration', selectedIntegrationId);
    router.replace(`?${params.toString()}`, { scroll: false } as any);
  }, [
    viewTab,
    selectedEndpointId,
    selectedIntegrationId,
    q,
    showOnlyIssues,
    statusFilter,
    typeFilter,
    router,
    updateFilters,
  ]);

  // Raccourcis clavier : "/" focus recherche, Ctrl/⌘+K palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === 'k') {
        e.preventDefault();
        setCmdOpen(true);
      }
      if (!e.ctrlKey && !e.metaKey && k === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (k === 'escape') setCmdOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Stats "système"
  const stats = useMemo(() => {
    const endpointsActive = apiEndpoints.filter((e) => e.status === 'active').length;
    const endpointsError = apiEndpoints.filter((e) => e.status === 'error' || e.status === 'degraded').length;

    const integrationsActive = apiIntegrations.filter((i: any) => i.status === 'connected').length;
    const integrationsError = apiIntegrations.filter((i: any) => i.status === 'error' || i.status === 'degraded' || i.status === 'disconnected').length;

    const rotationRequired = apiIntegrations.filter((i) => Boolean(i.credentials?.rotationRequired)).length;
    const totalCalls = apiEndpoints.reduce((acc, e) => acc + Number(e.callsToday ?? 0), 0);

    const avgLatency =
      apiEndpoints.length > 0
        ? Math.round(apiEndpoints.reduce((acc, e) => acc + Number(e.avgResponseTime ?? 0), 0) / apiEndpoints.length)
        : 0;

    const avgErrRate =
      apiEndpoints.length > 0
        ? Number(
            (
              apiEndpoints.reduce((acc, e) => acc + Number(e.errorRate ?? 0), 0) / apiEndpoints.length
            ).toFixed(1)
          )
        : 0;

    const issuesTotal = endpointsError + integrationsError + rotationRequired;

    return {
      endpointsActive,
      endpointsError,
      integrationsActive,
      integrationsError,
      rotationRequired,
      totalCalls,
      avgLatency,
      avgErrRate,
      issuesTotal,
    };
  }, []);

  // Auto-sync sidebar counts (ex: badge "API")
  useAutoSyncCounts(
    'api',
    () => {
      return stats.issuesTotal;
    },
    { interval: 15000, immediate: true }
  );

  // Filtres + recherche
  const filteredEndpoints = useMemo(() => {
    let list = [...apiEndpoints];

    if (showOnlyIssues) list = list.filter((e) => isEndpointIssue(e));
    if (statusFilter !== 'ALL') list = list.filter((e) => (e.status || '').toLowerCase() === statusFilter.toLowerCase());

    if (search) {
      list = list.filter((e) => {
        const hay = `${e.id} ${e.name} ${e.method} ${e.path} ${e.status}`.toLowerCase();
        return hay.includes(search);
      });
    }

    // Tri : problèmes d'abord, puis latence, puis erreurs
    return list.sort((a, b) => {
      const aIssue = isEndpointIssue(a) ? 0 : 1;
      const bIssue = isEndpointIssue(b) ? 0 : 1;
      if (aIssue !== bIssue) return aIssue - bIssue;

      const lat = Number(b.avgResponseTime ?? 0) - Number(a.avgResponseTime ?? 0);
      if (lat !== 0) return lat;

      return Number(b.errorRate ?? 0) - Number(a.errorRate ?? 0);
    });
  }, [showOnlyIssues, statusFilter, search]);

  const filteredIntegrations = useMemo(() => {
    let list = [...apiIntegrations];

    if (showOnlyIssues) list = list.filter((i) => isIntegrationIssue(i));
    if (statusFilter !== 'ALL') list = list.filter((i: any) => (i.status || '').toLowerCase() === statusFilter.toLowerCase());
    if (typeFilter !== 'ALL') list = list.filter((i) => (i.type || '').toLowerCase() === typeFilter.toLowerCase());

    if (search) {
      list = list.filter((i: any) => {
        const hay = `${i.id} ${i.provider} ${i.type} ${i.status} ${i.lastSync} ${i.lastError ?? ''}`.toLowerCase();
        return hay.includes(search);
      });
    }

    // Tri : erreurs/rotation d'abord
    return list.sort((a: any, b: any) => {
      const aRank = (a.status === 'error' ? 0 : a.credentials?.rotationRequired ? 1 : 2);
      const bRank = (b.status === 'error' ? 0 : b.credentials?.rotationRequired ? 1 : 2);
      if (aRank !== bRank) return aRank - bRank;
      return String(b.lastSync ?? '').localeCompare(String(a.lastSync ?? ''));
    });
  }, [showOnlyIssues, statusFilter, typeFilter, search]);

  const selectedEndpoint = selectedEndpointId
    ? apiEndpoints.find((e) => e.id === selectedEndpointId) || null
    : null;

  const selectedIntegration = selectedIntegrationId
    ? apiIntegrations.find((i) => i.id === selectedIntegrationId) || null
    : null;

  // Actions (loguées)
  const handleRotateCredentials = (integration: ApiIntegration) => {
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

  const handleTestConnection = (integration: ApiIntegration) => {
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

  const handleDisable = (integration: ApiIntegration) => {
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

  const handleCopyEndpoint = async (endpoint: ApiEndpoint) => {
    const ok = await safeCopy(`${endpoint.method} ${endpoint.path}`);
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'api',
      action: 'validation',
      targetId: endpoint.id,
      targetType: 'ApiEndpoint',
      details: `Copie endpoint ${endpoint.method} ${endpoint.path}`,
    });
    addToast(ok ? 'Endpoint copié' : 'Impossible de copier (clipboard)', ok ? 'success' : 'warning');
  };

  const handleSimulateCall = (endpoint: ApiEndpoint) => {
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'api',
      action: 'validation',
      targetId: endpoint.id,
      targetType: 'ApiEndpoint',
      details: `Simulation call ${endpoint.method} ${endpoint.path}`,
    });
    addToast(`Simulation ${endpoint.name}…`, 'info');
  };

  const handleExportHealthJson = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      stats,
      endpoints: apiEndpoints,
      integrations: apiIntegrations,
      filters: {
        viewTab,
        showOnlyIssues,
        q,
        statusFilter,
        typeFilter,
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-health-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    addToast('📤 Export Health JSON généré', 'success');
  };

  const rotateAllRequired = () => {
    const targets = apiIntegrations.filter((i) => Boolean(i.credentials?.rotationRequired));
    if (targets.length === 0) return addToast('Aucune rotation requise', 'info');

    targets.forEach((t) => handleRotateCredentials(t));
    addToast(`🔑 Rotations déclenchées: ${targets.length}`, 'success');
  };

  const testAllErrors = () => {
    const targets = apiIntegrations.filter((i: any) => i.status === 'error' || i.status === 'degraded' || i.status === 'disconnected');
    if (targets.length === 0) return addToast('Aucune intégration en erreur', 'info');

    targets.forEach((t) => handleTestConnection(t));
    addToast(`🔍 Tests lancés: ${targets.length}`, 'info');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🔌 API & Intégrations
            <Badge variant="info">{apiIntegrations.length} intégrations</Badge>
            <Badge variant="default">{apiEndpoints.length} endpoints</Badge>
            {stats.issuesTotal > 0 && (
              <Badge variant="warning" className="ml-1">
                {stats.issuesTotal} issues
              </Badge>
            )}
          </h1>
          <p className="text-sm text-slate-400">
            Monitoring endpoints • Intégrations externes • Rotation credentials • "/" recherche • "Ctrl/⌘+K" commandes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={handleExportHealthJson}>
            📤 Health JSON
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setCmdOpen(true)}>
            ⌘K
          </Button>
        </div>
      </div>

      {/* Recherche + filtres rapides */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={searchRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher (provider, path, méthode, status)…"
          className={cn(
            'flex-1 min-w-[240px] px-3 py-2 rounded text-sm',
            darkMode ? 'bg-slate-800 border border-slate-600' : 'bg-white border border-gray-300'
          )}
        />

        <select
          className={cn(
            'px-2 py-2 rounded text-sm',
            darkMode ? 'bg-slate-800 border border-slate-600' : 'bg-white border border-gray-300'
          )}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">Status: Tous</option>
          <option value="active">active</option>
          <option value="degraded">degraded</option>
          <option value="error">error</option>
          <option value="maintenance">maintenance</option>
          <option value="connected">connected</option>
          <option value="disconnected">disconnected</option>
          <option value="disabled">disabled</option>
        </select>

        <select
          className={cn(
            'px-2 py-2 rounded text-sm',
            darkMode ? 'bg-slate-800 border border-slate-600' : 'bg-white border border-gray-300'
          )}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          disabled={viewTab !== 'integrations'}
          title={viewTab !== 'integrations' ? 'Filtre type disponible uniquement sur Intégrations' : ''}
        >
          <option value="ALL">Type: Tous</option>
          <option value="payment">payment</option>
          <option value="banking">banking</option>
          <option value="sms">sms</option>
          <option value="email">email</option>
          <option value="storage">storage</option>
          <option value="erp">erp</option>
        </select>

        <Button size="sm" variant={showOnlyIssues ? 'default' : 'secondary'} onClick={() => setShowOnlyIssues((v) => !v)}>
          🚨 {showOnlyIssues ? 'Issues: ON' : 'Issues: OFF'}
        </Button>

        <Button size="sm" variant="ghost" onClick={() => setQ('')}>
          Effacer
        </Button>
      </div>

      {/* Alertes */}
      {(stats.endpointsError > 0 || stats.integrationsError > 0 || stats.rotationRequired > 0) && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🚨</span>
              <div className="flex-1">
                <h3 className="font-bold text-red-400">Alertes système</h3>
                <p className="text-sm text-slate-400">
                  {stats.endpointsError > 0 && `${stats.endpointsError} endpoint(s) en erreur • `}
                  {stats.integrationsError > 0 && `${stats.integrationsError} intégration(s) en erreur • `}
                  {stats.rotationRequired > 0 && `${stats.rotationRequired} rotation(s) requise(s)`}
                </p>

                <div className="flex flex-wrap gap-2 mt-3">
                  <Button size="sm" variant="warning" onClick={rotateAllRequired}>
                    🔑 Rotation en masse
                  </Button>
                  <Button size="sm" variant="info" onClick={testAllErrors}>
                    🔍 Tester intégrations KO
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setShowOnlyIssues(true)}>
                    👁️ Voir uniquement problèmes
                  </Button>
                </div>
              </div>

              <div className="text-right text-[10px] text-slate-400">
                <p>Latence moy.: <span className="font-mono">{stats.avgLatency}ms</span></p>
                <p>Taux err. moy.: <span className="font-mono">{stats.avgErrRate}%</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-8 gap-3">
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.totalCalls.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400">Appels aujourd&apos;hui</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-500/10 border-slate-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-slate-300">{stats.avgLatency}ms</p>
            <p className="text-[10px] text-slate-400">Latence moy.</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-500/10 border-slate-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-slate-300">{stats.avgErrRate}%</p>
            <p className="text-[10px] text-slate-400">Erreurs moy.</p>
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
      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant={viewTab === 'endpoints' ? 'default' : 'secondary'}
          onClick={() => {
            setViewTab('endpoints');
            setSelectedIntegrationId(null);
          }}
        >
          📡 Endpoints ({apiEndpoints.length})
        </Button>
        <Button
          size="sm"
          variant={viewTab === 'integrations' ? 'default' : 'secondary'}
          onClick={() => {
            setViewTab('integrations');
            setSelectedEndpointId(null);
          }}
        >
          🔗 Intégrations ({apiIntegrations.length})
        </Button>
      </div>

      {/* VUE: Endpoints (liste + panneau détail) */}
      {viewTab === 'endpoints' ? (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            {filteredEndpoints.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-slate-400">
                  Aucun endpoint ne correspond aux filtres.
                </CardContent>
              </Card>
            ) : (
              filteredEndpoints.map((endpoint) => {
                const isSelected = selectedEndpointId === endpoint.id;
                const leftBorder = borderClassForStatus(endpoint.status);

                return (
                  <Card
                    key={endpoint.id}
                    className={cn(
                      'cursor-pointer transition-all border-l-4',
                      leftBorder,
                      isSelected ? 'ring-2 ring-blue-500' : 'hover:border-blue-500/50'
                    )}
                    onClick={() => setSelectedEndpointId(endpoint.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={badgeVariantForStatus(endpoint.status)}>{endpoint.status}</Badge>
                            <span className="font-mono text-xs text-slate-400">{endpoint.method}</span>
                            <span className="font-mono text-[10px] text-slate-500">{endpoint.id}</span>
                          </div>
                          <h3 className="font-bold mt-1">{endpoint.name}</h3>
                          <p className="text-xs text-slate-400 font-mono">{endpoint.path}</p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyEndpoint(endpoint);
                            }}
                          >
                            📋 Copier
                          </Button>
                          <Button
                            size="sm"
                            variant="info"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSimulateCall(endpoint);
                            }}
                          >
                            ▶️ Tester
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                          <p className="text-lg font-bold text-blue-400">
                            {Number(endpoint.callsToday ?? 0).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-slate-400">Appels/jour</p>
                        </div>

                        <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                          <p
                            className={cn(
                              'text-lg font-bold',
                              endpoint.avgResponseTime < 200
                                ? 'text-emerald-400'
                                : endpoint.avgResponseTime < 500
                                ? 'text-amber-400'
                                : 'text-red-400'
                            )}
                          >
                            {endpoint.avgResponseTime}ms
                          </p>
                          <p className="text-[10px] text-slate-400">Temps moy.</p>
                        </div>

                        <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                          <p
                            className={cn(
                              'text-lg font-bold',
                              endpoint.errorRate < 1
                                ? 'text-emerald-400'
                                : endpoint.errorRate < 5
                                ? 'text-amber-400'
                                : 'text-red-400'
                            )}
                          >
                            {endpoint.errorRate}%
                          </p>
                          <p className="text-[10px] text-slate-400">Erreurs</p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-700/50 text-xs text-slate-400 flex justify-between">
                        <span>Rate limit: {endpoint.rateLimit}/min</span>
                        <span>{Number(endpoint.callsMonth ?? 0).toLocaleString()} ce mois</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <div className="lg:col-span-1">
            {selectedEndpoint ? (
              <Card className="sticky top-4">
                <CardContent className="p-4">
                  <div className="mb-4 pb-4 border-b border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={badgeVariantForStatus(selectedEndpoint.status)}>{selectedEndpoint.status}</Badge>
                      <span className="font-mono text-xs text-slate-400">{selectedEndpoint.method}</span>
                    </div>
                    <h3 className="font-bold">{selectedEndpoint.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{selectedEndpoint.path}</p>
                    <p className="text-[10px] text-slate-500 mt-1">ID: {selectedEndpoint.id}</p>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                      <p className="text-xs text-slate-400 mb-2">📊 Santé endpoint</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Appels aujourd&apos;hui</span>
                          <span className="font-mono">{Number(selectedEndpoint.callsToday ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Latence moyenne</span>
                          <span className="font-mono">{selectedEndpoint.avgResponseTime}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taux d&apos;erreur</span>
                          <span className="font-mono">{selectedEndpoint.errorRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rate limit</span>
                          <span className="font-mono">{selectedEndpoint.rateLimit}/min</span>
                        </div>
                      </div>
                    </div>

                    <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                      <p className="text-xs text-slate-400 mb-2">🛡️ Recommandations auto</p>
                      <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                        {selectedEndpoint.errorRate >= 5 && <li>Erreur élevée : vérifier auth, payload et timeouts</li>}
                        {selectedEndpoint.avgResponseTime >= 500 && <li>Latence : activer cache, profiler DB, réduire payload</li>}
                        {selectedEndpoint.status === 'degraded' && <li>Mode dégradé : surveiller quotas et retry/backoff</li>}
                        {selectedEndpoint.status === 'error' && <li>En erreur : basculer sur circuit breaker / fallback</li>}
                        {selectedEndpoint.errorRate < 1 && selectedEndpoint.avgResponseTime < 200 && <li>Tout est propre : RAS ✅</li>}
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-700/50">
                    <Button size="sm" variant="secondary" onClick={() => handleCopyEndpoint(selectedEndpoint)}>
                      📋 Copier méthode + path
                    </Button>
                    <Button size="sm" variant="info" onClick={() => handleSimulateCall(selectedEndpoint)}>
                      ▶️ Tester (simulation)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="sticky top-4">
                <CardContent className="p-8 text-center">
                  <span className="text-4xl mb-4 block">📡</span>
                  <p className="text-slate-400">Sélectionnez un endpoint</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        /* VUE: Integrations (liste + panneau détail) */
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            {filteredIntegrations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-slate-400">
                  Aucune intégration ne correspond aux filtres.
                </CardContent>
              </Card>
            ) : (
              filteredIntegrations.map((integration) => {
                const isSelected = selectedIntegrationId === integration.id;
                const leftBorder = borderClassForStatus((integration as any).status);

                return (
                  <Card
                    key={integration.id}
                    className={cn(
                      'cursor-pointer transition-all border-l-4',
                      leftBorder,
                      isSelected ? 'ring-2 ring-blue-500' : 'hover:border-blue-500/50'
                    )}
                    onClick={() => setSelectedIntegrationId(integration.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xl">{getTypeIcon(integration.type)}</span>
                            <Badge variant={badgeVariantForStatus((integration as any).status)}>
                              {(integration as any).status}
                            </Badge>
                            <Badge variant="default">{integration.type}</Badge>
                            {integration.credentials.rotationRequired && (
                              <Badge variant="warning" pulse>
                                Rotation requise
                              </Badge>
                            )}
                            <span className="font-mono text-[10px] text-slate-500">{integration.id}</span>
                          </div>
                          <h3 className="font-bold mt-1">{integration.provider}</h3>
                        </div>

                        <div className="text-right text-xs text-slate-400">
                          <p>Dernière sync: {(integration as any).lastSync}</p>
                        </div>
                      </div>

                      {(integration as any).status === 'error' && (integration as any).lastError && (
                        <div className="p-2 rounded bg-red-500/10 border border-red-500/30 mb-3">
                          <p className="text-xs text-red-400">⚠️ {(integration as any).lastError}</p>
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="info"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestConnection(integration);
                          }}
                        >
                          🔍 Tester
                        </Button>

                        {integration.credentials.rotationRequired && (
                          <Button
                            size="sm"
                            variant="warning"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRotateCredentials(integration);
                            }}
                          >
                            🔑 Rotation
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <div className="lg:col-span-1">
            {selectedIntegration ? (
              <Card className="sticky top-4">
                <CardContent className="p-4">
                  <div className="mb-4 pb-4 border-b border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getTypeIcon(selectedIntegration.type)}</span>
                      <Badge variant={badgeVariantForStatus((selectedIntegration as any).status)}>
                        {(selectedIntegration as any).status}
                      </Badge>
                    </div>
                    <h3 className="font-bold">{selectedIntegration.provider}</h3>
                    <p className="text-[10px] text-slate-500 mt-1">ID: {selectedIntegration.id}</p>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-slate-400">Type</p>
                          <p className="capitalize">{selectedIntegration.type}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Dernière sync</p>
                          <p>{(selectedIntegration as any).lastSync}</p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={cn(
                        'p-3 rounded',
                        selectedIntegration.credentials.rotationRequired
                          ? 'bg-amber-500/10 border border-amber-500/30'
                          : darkMode
                          ? 'bg-slate-700/30'
                          : 'bg-gray-100'
                      )}
                    >
                      <p className="text-xs text-slate-400 mb-2">🔑 Credentials</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Dernière rotation</span>
                          <span className="font-mono">{selectedIntegration.credentials.lastRotation}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expiration</span>
                          <span
                            className={cn(
                              'font-mono',
                              selectedIntegration.credentials.rotationRequired ? 'text-amber-400' : 'text-slate-300'
                            )}
                          >
                            {selectedIntegration.credentials.expiresAt}
                          </span>
                        </div>
                      </div>
                    </div>

                    {(selectedIntegration as any).webhooks && (selectedIntegration as any).webhooks.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-400 mb-2">
                          🔔 Webhooks ({(selectedIntegration as any).webhooks.length})
                        </p>
                        <div className="space-y-1">
                          {(selectedIntegration as any).webhooks.map((wh: any, idx: number) => (
                            <div
                              key={idx}
                              className={cn(
                                'p-2 rounded text-xs flex justify-between items-center',
                                darkMode ? 'bg-slate-700/30' : 'bg-gray-100'
                              )}
                            >
                              <span>{wh.event}</span>
                              <Badge variant={badgeVariantForStatus(wh.status)}>{wh.status}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(selectedIntegration as any).status === 'error' && (selectedIntegration as any).lastError && (
                      <div className="p-3 rounded bg-red-500/10 border border-red-500/30">
                        <p className="text-xs text-slate-400 mb-1">🧾 Dernière erreur</p>
                        <p className="text-xs text-red-400">⚠️ {(selectedIntegration as any).lastError}</p>
                      </div>
                    )}

                    <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                      <p className="text-xs text-slate-400 mb-2">🛡️ Checklist sécurité</p>
                      <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                        <li>Rotation régulière + alerte J-7 avant expiration</li>
                        <li>Principe du moindre privilège (scopes minimaux)</li>
                        <li>Journalisation actions DG (audit) + horodatage</li>
                        <li>Webhooks : signatures + retry/backoff</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-700/50">
                    <Button size="sm" variant="info" onClick={() => handleTestConnection(selectedIntegration)}>
                      🔍 Tester connexion
                    </Button>
                    {selectedIntegration.credentials.rotationRequired && (
                      <Button size="sm" variant="warning" onClick={() => handleRotateCredentials(selectedIntegration)}>
                        🔑 Rotation credentials
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => handleDisable(selectedIntegration)}>
                      ⛔ Désactiver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="sticky top-4">
                <CardContent className="p-8 text-center">
                  <span className="text-4xl mb-4 block">🔗</span>
                  <p className="text-slate-400">Sélectionnez une intégration</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Command palette */}
      {cmdOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-xl">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">⌘K — Commandes rapides</p>
                  <p className="text-xs text-slate-400">Astuce : "/" pour focus la recherche</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => setCmdOpen(false)}>
                  Fermer
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-2">
                <CmdItem
                  label="📡 Voir Endpoints"
                  hint="Liste + détail endpoint"
                  onClick={() => {
                    setViewTab('endpoints');
                    setCmdOpen(false);
                  }}
                />
                <CmdItem
                  label="🔗 Voir Intégrations"
                  hint="Liste + détail intégration"
                  onClick={() => {
                    setViewTab('integrations');
                    setCmdOpen(false);
                  }}
                />
                <CmdItem
                  label="🚨 Afficher uniquement les issues"
                  hint="Filtre problèmes"
                  onClick={() => {
                    setShowOnlyIssues(true);
                    setCmdOpen(false);
                  }}
                />
                <CmdItem
                  label="🔑 Rotation en masse"
                  hint="Toutes les intégrations "rotationRequired""
                  onClick={() => {
                    rotateAllRequired();
                    setCmdOpen(false);
                  }}
                />
                <CmdItem
                  label="🔍 Tester intégrations KO"
                  hint="Test sur error/degraded/disconnected"
                  onClick={() => {
                    testAllErrors();
                    setCmdOpen(false);
                  }}
                />
                <CmdItem
                  label="📤 Export Health JSON"
                  hint="Stats + endpoints + integrations + filtres"
                  onClick={() => {
                    handleExportHealthJson();
                    setCmdOpen(false);
                  }}
                />
              </div>

              <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400">
                <span>ESC : fermer</span>
                <span>Ctrl/⌘+K : ouvrir</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
