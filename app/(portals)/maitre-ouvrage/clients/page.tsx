'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import {
  messagesExternes,
  litiges,
  projects,
  clientsGlobalStats,
  clientsStats,
} from '@/lib/data';
import {
  clients,
  clientHistories,
  clientDemands,
  clientStats,
  projectsEnriched,
} from '@/lib/data/bmo-mock-4';
import type { Client, ClientHistoryEvent } from '@/lib/data/bmo-mock-4';
import { getStatusBadgeConfig } from '@/lib/utils/status-utils';

type ViewMode = 'all' | 'active' | 'litige' | 'termine' | 'prospect';
type DetailTab = 'info' | 'historique' | 'projets' | 'demandes';

export default function ClientsPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [detailTab, setDetailTab] = useState<DetailTab>('info');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'particulier' | 'entreprise' | 'institution'>('all');
  const [selectedStatsClient, setSelectedStatsClient] = useState<string | null>(null);

  // Utilisateur actuel
  const currentUser = {
    id: 'USR-001',
    name: 'A. DIALLO',
    role: 'Directeur Général',
    bureau: 'BMO',
  };

  // Filtrer les clients
  const filteredClients = useMemo(() => {
    let filtered = clients;

    // Filtre par statut
    if (viewMode !== 'all') {
      filtered = filtered.filter((c) => c.status === viewMode);
    }

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.phone?.includes(query)
      );
    }

    return filtered;
  }, [viewMode, searchQuery]);

  // Obtenir historique d'un client
  const getClientHistory = (clientId: string): ClientHistoryEvent[] => {
    return clientHistories.find((h) => h.clientId === clientId)?.events || [];
  };

  // Obtenir demandes d'un client
  const getClientDemands = (clientId: string) => {
    return clientDemands.filter((d) => d.clientId === clientId);
  };

  // Obtenir projets d'un client
  const getClientProjects = (projectIds: string[]) => {
    return projectsEnriched.filter((p) => projectIds.includes(p.id));
  };

  // Obtenir litiges d'un client
  const getClientLitiges = (clientName: string) => {
    return litiges.filter((l) => l.adversaire.includes(clientName) || clientName.includes(l.adversaire));
  };

  // Obtenir messages externes d'un client
  const getClientMessages = (clientName: string) => {
    return messagesExternes.filter((m) => m.sender.includes(clientName) || clientName.includes(m.sender));
  };

  // Couleur selon statut client
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400';
      case 'litige': return 'text-red-400';
      case 'termine': return 'text-blue-400';
      case 'prospect': return 'text-purple-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'litige': return 'urgent';
      case 'termine': return 'info';
      case 'prospect': return 'gold';
      default: return 'default';
    }
  };

  // Couleur selon type client
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'particulier': return '👤';
      case 'entreprise': return '🏢';
      case 'institution': return '🏛️';
      case 'ong': return '🤝';
      default: return '📋';
    }
  };

  // Icône selon type d'événement historique
  const getHistoryIcon = (type: string) => {
    switch (type) {
      case 'message': return '💬';
      case 'demande': return '📝';
      case 'paiement': return '💳';
      case 'projet': return '📊';
      case 'litige': return '🚨';
      case 'visite': return '👁';
      default: return '📋';
    }
  };

  // Couleurs pour les graphiques
  const COLORS = ['#F97316', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6'];
  const typeColors = {
    particulier: '#3B82F6',
    entreprise: '#10B981',
    institution: '#8B5CF6',
  };

  // Formater les montants
  const formatMontant = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  // Filtrer les clients pour la section stats
  const filteredStatsClients = clientsStats.filter(
    (c) => filterType === 'all' || c.clientType === filterType
  );

  // Client sélectionné pour la section stats
  const clientDetails = selectedStatsClient
    ? clientsStats.find((c) => c.clientId === selectedStatsClient)
    : null;

  // Actions
  const handleOpenDemands = (client: Client) => {
    setSelectedClient(client);
    setDetailTab('demandes');
    setShowClientModal(true);
  };

  const handleOpenProject = (client: Client) => {
    setSelectedClient(client);
    setDetailTab('projets');
    setShowClientModal(true);
  };

  const handleOpenLitige = (client: Client) => {
    const clientLitiges = getClientLitiges(client.name);
    if (clientLitiges.length > 0) {
      addToast(`${clientLitiges.length} litige(s) trouvé(s) pour ${client.name}`, 'warning');
    } else {
      addToast(`Aucun litige pour ${client.name}`, 'info');
    }
    setSelectedClient(client);
    setDetailTab('historique');
    setShowClientModal(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            👥 Clients et satisfaction
            <Badge variant="warning">{clientStats.total}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Satisfaction moyenne: <span className="text-amber-400 font-bold">{clientStats.avgSatisfaction}/5 ★</span> • 
            Total facturé: <span className="text-emerald-400 font-bold">{(clientStats.totalFactured / 1000000).toFixed(1)}M FCFA</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => addToast('Export des données en cours...', 'info')}
          >
            📊 Exporter
          </Button>
          <Button size="sm" onClick={() => addToast('Rafraîchissement...', 'info')}>
            🔄 Actualiser
          </Button>
          <Button onClick={() => addToast('Nouveau client', 'info')}>
            + Nouveau client
          </Button>
        </div>
      </div>

      {/* KPIs globaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className="border-orange-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">
              {clientsGlobalStats.totalClients}
            </p>
            <p className="text-[10px] text-slate-400">Clients total</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {clientsGlobalStats.clientsActifs}
            </p>
            <p className="text-[10px] text-slate-400">Clients actifs</p>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">
              +{clientsGlobalStats.nouveauxClientsMois}
            </p>
            <p className="text-[10px] text-slate-400">Nouveaux ce mois</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold text-amber-400">
              {formatMontant(clientsGlobalStats.chiffreAffairesTotalAnnee)}
            </p>
            <p className="text-[10px] text-slate-400">CA Année (FCFA)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">
              {clientsGlobalStats.tauxFidelisation}%
            </p>
            <p className="text-[10px] text-slate-400">Fidélisation</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-cyan-400">
              {clientsGlobalStats.scoreSatisfactionMoyen}%
            </p>
            <p className="text-[10px] text-slate-400">Satisfaction moy.</p>
          </CardContent>
        </Card>
      </div>

      {/* Stats par statut - Filtres */}
      <div className="grid grid-cols-6 gap-3">
        <Card
          className={cn('cursor-pointer transition-all', viewMode === 'all' && 'ring-2 ring-orange-500')}
          onClick={() => setViewMode('all')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{clientStats.total}</p>
            <p className="text-[10px] text-slate-400">Total</p>
          </CardContent>
        </Card>
        <Card
          className={cn('cursor-pointer transition-all border-emerald-500/30', viewMode === 'active' && 'ring-2 ring-emerald-500')}
          onClick={() => setViewMode('active')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{clientStats.active}</p>
            <p className="text-[10px] text-slate-400">Actifs</p>
          </CardContent>
        </Card>
        <Card
          className={cn('cursor-pointer transition-all border-red-500/30', viewMode === 'litige' && 'ring-2 ring-red-500')}
          onClick={() => setViewMode('litige')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{clientStats.litige}</p>
            <p className="text-[10px] text-slate-400">En litige</p>
          </CardContent>
        </Card>
        <Card
          className={cn('cursor-pointer transition-all border-blue-500/30', viewMode === 'termine' && 'ring-2 ring-blue-500')}
          onClick={() => setViewMode('termine')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{clientStats.termine}</p>
            <p className="text-[10px] text-slate-400">Terminés</p>
          </CardContent>
        </Card>
        <Card
          className={cn('cursor-pointer transition-all border-purple-500/30', viewMode === 'prospect' && 'ring-2 ring-purple-500')}
          onClick={() => setViewMode('prospect')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{clientStats.prospect}</p>
            <p className="text-[10px] text-slate-400">Prospects</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{clientStats.avgSatisfaction}</p>
            <p className="text-[10px] text-slate-400">★ Satisfaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Évolution mensuelle */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">📊 Évolution mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={clientsGlobalStats.evolutionMensuelle}>
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => formatMontant(v)}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number | undefined, name: string | undefined) => [
                      name === 'chiffreAffaires' ? formatMontant(value ?? 0) + ' FCFA' : (value ?? 0),
                      name === 'chiffreAffaires' ? 'CA' : 'Nouveaux clients'
                    ]}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="nouveaux"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', r: 3 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="chiffreAffaires"
                    stroke="#F97316"
                    strokeWidth={2}
                    dot={{ fill: '#F97316', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                Nouveaux clients
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-orange-500" />
                Chiffre d&apos;affaires
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Répartition par type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">🏢 Répartition par type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clientsGlobalStats.repartitionParType}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={50}
                    dataKey="count"
                    nameKey="type"
                  >
                    {clientsGlobalStats.repartitionParType.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 mt-2">
              {clientsGlobalStats.repartitionParType.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COLORS[i] }}
                    />
                    {item.type}
                  </span>
                  <span className="font-bold">{item.count} ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top clients */}
      <Card className="border-amber-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">🏆 Top Clients (CA Année)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            {clientsGlobalStats.topClients.map((client, i) => (
              <div
                key={client.clientId}
                className={cn(
                  'p-3 rounded-lg cursor-pointer transition-all',
                  darkMode ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-gray-100 hover:bg-gray-200',
                  i === 0 && 'border border-amber-500/50'
                )}
                onClick={() => {
                  const foundClient = clients.find(c => c.id === client.clientId);
                  if (foundClient) {
                    setSelectedClient(foundClient);
                    setDetailTab('info');
                    setShowClientModal(true);
                  }
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                  <p className="font-semibold text-sm truncate">{client.clientName}</p>
                </div>
                <p className="text-lg font-bold text-amber-400">
                  {formatMontant(client.chiffreAffaires)} FCFA
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recherche */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="🔍 Rechercher client, email, téléphone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            'flex-1 px-4 py-2 rounded-lg text-sm',
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
          )}
        />
        <Button variant="secondary" onClick={() => { setViewMode('all'); setSearchQuery(''); }}>
          Réinitialiser
        </Button>
      </div>

      {/* Table des clients */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                  <th className="px-3 py-2.5 text-left font-bold text-amber-500">ID</th>
                  <th className="px-3 py-2.5 text-left font-bold text-amber-500">Client</th>
                  <th className="px-3 py-2.5 text-left font-bold text-amber-500">Type</th>
                  <th className="px-3 py-2.5 text-left font-bold text-amber-500">Contact</th>
                  <th className="px-3 py-2.5 text-left font-bold text-amber-500">Total facturé</th>
                  <th className="px-3 py-2.5 text-left font-bold text-amber-500">Statut</th>
                  <th className="px-3 py-2.5 text-left font-bold text-amber-500">Depuis</th>
                  <th className="px-3 py-2.5 text-left font-bold text-amber-500">Satisfaction</th>
                  <th className="px-3 py-2.5 text-left font-bold text-amber-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => {
                  const clientDemandCount = getClientDemands(client.id).filter((d) => d.status === 'pending').length;
                  const clientLitigeCount = getClientLitiges(client.name).length;

                  return (
                    <tr
                      key={client.id}
                      className={cn(
                        'border-t transition-all hover:bg-orange-500/5 cursor-pointer',
                        darkMode ? 'border-slate-700/50' : 'border-gray-100',
                        client.status === 'litige' && 'bg-red-500/5'
                      )}
                      onClick={() => {
                        setSelectedClient(client);
                        setDetailTab('info');
                        setShowClientModal(true);
                      }}
                    >
                      <td className="px-3 py-2.5">
                        <span className="font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                          {client.id}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getTypeIcon(client.type)}</span>
                          <div>
                            <p className="font-semibold">{client.name}</p>
                            {client.contact && client.contact !== client.name && (
                              <p className="text-[10px] text-slate-400">{client.contact}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant="default">
                          {client.type === 'particulier' ? 'Particulier' :
                           client.type === 'entreprise' ? 'Entreprise' :
                           client.type === 'institution' ? 'Institution' : 'ONG'}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="text-[10px]">
                          {client.phone && <p>{client.phone}</p>}
                          {client.email && <p className="text-blue-400">{client.email}</p>}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div>
                          <p className="font-mono font-bold text-emerald-400">{client.totalFactured} FCFA</p>
                          <p className="text-[10px] text-slate-400">Payé: {client.totalPaid} FCFA</p>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        {(() => {
                          // WHY: Utiliser la fonction centralisée pour cohérence UI (remplace double mapping)
                          const statusConfig = getStatusBadgeConfig(client.status);
                          return (
                            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                          );
                        })()}
                        {clientLitigeCount > 0 && (
                          <Badge variant="urgent" className="ml-1">🚨</Badge>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-slate-400">{client.since}</td>
                      <td className="px-3 py-2.5">
                        {client.satisfaction > 0 ? (
                          <div className="flex items-center gap-1">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className={cn('text-sm', star <= client.satisfaction ? 'text-amber-400' : 'text-slate-600')}>
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-[10px] text-slate-400">({client.satisfaction}/5)</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">N/A</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <Button size="xs" variant="info" onClick={() => handleOpenDemands(client)}>
                            📝 {clientDemandCount > 0 && `(${clientDemandCount})`}
                          </Button>
                          <Button size="xs" variant="secondary" onClick={() => handleOpenProject(client)} disabled={client.projects.length === 0}>
                            📊
                          </Button>
                          <Button size="xs" variant={client.status === 'litige' ? 'destructive' : 'ghost'} onClick={() => handleOpenLitige(client)}>
                            {client.status === 'litige' ? '🚨' : '⚖️'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-400">Aucun client trouvé</p>
          </CardContent>
        </Card>
      )}

      {/* Modal détail client */}
      {showClientModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                {getTypeIcon(selectedClient.type)} {selectedClient.name}
                <Badge variant={getStatusBadge(selectedClient.status) as any}>
                  {selectedClient.status}
                </Badge>
              </CardTitle>
              <Button size="xs" variant="ghost" onClick={() => setShowClientModal(false)}>✕</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Onglets */}
              <div className="flex gap-2 border-b border-slate-700/50 pb-2">
                <Button size="xs" variant={detailTab === 'info' ? 'default' : 'ghost'} onClick={() => setDetailTab('info')}>
                  ℹ️ Info
                </Button>
                <Button size="xs" variant={detailTab === 'historique' ? 'default' : 'ghost'} onClick={() => setDetailTab('historique')}>
                  📜 Historique
                </Button>
                <Button size="xs" variant={detailTab === 'projets' ? 'default' : 'ghost'} onClick={() => setDetailTab('projets')}>
                  📊 Projets ({selectedClient.projects.length})
                </Button>
                <Button size="xs" variant={detailTab === 'demandes' ? 'default' : 'ghost'} onClick={() => setDetailTab('demandes')}>
                  📝 Demandes ({getClientDemands(selectedClient.id).length})
                </Button>
              </div>

              {/* Tab Info */}
              {detailTab === 'info' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className={cn('p-3 rounded-lg', darkMode ? 'bg-slate-700/50' : 'bg-gray-50')}>
                    <h4 className="font-bold text-xs text-blue-400 mb-2">Coordonnées</h4>
                    {selectedClient.contact && (
                      <p className="text-xs mb-1"><span className="text-slate-400">Contact:</span> {selectedClient.contact}</p>
                    )}
                    {selectedClient.email && (
                      <p className="text-xs mb-1"><span className="text-slate-400">Email:</span> <span className="text-blue-400">{selectedClient.email}</span></p>
                    )}
                    {selectedClient.phone && (
                      <p className="text-xs mb-1"><span className="text-slate-400">Tél:</span> {selectedClient.phone}</p>
                    )}
                    {selectedClient.address && (
                      <p className="text-xs"><span className="text-slate-400">Adresse:</span> {selectedClient.address}</p>
                    )}
                  </div>
                  <div className={cn('p-3 rounded-lg', darkMode ? 'bg-slate-700/50' : 'bg-gray-50')}>
                    <h4 className="font-bold text-xs text-emerald-400 mb-2">Financier</h4>
                    <p className="text-xs mb-1">
                      <span className="text-slate-400">Total facturé:</span> 
                      <span className="font-bold text-emerald-400 ml-1">{selectedClient.totalFactured} FCFA</span>
                    </p>
                    <p className="text-xs mb-1">
                      <span className="text-slate-400">Total payé:</span> 
                      <span className="font-bold text-blue-400 ml-1">{selectedClient.totalPaid} FCFA</span>
                    </p>
                    <p className="text-xs">
                      <span className="text-slate-400">Reste à payer:</span> 
                      <span className="font-bold text-amber-400 ml-1">
                        {(parseFloat(selectedClient.totalFactured.replace(/[,\s]/g, '')) - parseFloat(selectedClient.totalPaid.replace(/[,\s]/g, ''))).toLocaleString()} FCFA
                      </span>
                    </p>
                  </div>
                  <div className={cn('p-3 rounded-lg', darkMode ? 'bg-slate-700/50' : 'bg-gray-50')}>
                    <h4 className="font-bold text-xs text-amber-400 mb-2">Satisfaction</h4>
                    <div className="flex items-center gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={cn('text-2xl', star <= selectedClient.satisfaction ? 'text-amber-400' : 'text-slate-600')}>
                          ★
                        </span>
                      ))}
                      <span className="text-sm text-slate-400">({selectedClient.satisfaction}/5)</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Dernier contact: {selectedClient.lastContact || 'N/A'}</p>
                  </div>
                  <div className={cn('p-3 rounded-lg', darkMode ? 'bg-slate-700/50' : 'bg-gray-50')}>
                    <h4 className="font-bold text-xs text-purple-400 mb-2">Notes</h4>
                    <p className="text-xs text-slate-300">{selectedClient.notes || 'Aucune note'}</p>
                  </div>
                </div>
              )}

              {/* Tab Historique */}
              {detailTab === 'historique' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-orange-400">Historique des échanges</h4>
                  {getClientHistory(selectedClient.id).length === 0 ? (
                    <p className="text-sm text-slate-400">Aucun historique enregistré</p>
                  ) : (
                    getClientHistory(selectedClient.id).map((event) => (
                      <div
                        key={event.id}
                        className={cn('p-3 rounded-lg border-l-4 border-l-blue-500', darkMode ? 'bg-slate-700/30' : 'bg-gray-50')}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getHistoryIcon(event.type)}</span>
                            <div>
                              <p className="font-bold text-sm">{event.title}</p>
                              <p className="text-xs text-slate-400">{event.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400">{event.date}</p>
                            {event.status && <Badge variant="info" className="text-[9px]">{event.status}</Badge>}
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Messages externes */}
                  {getClientMessages(selectedClient.name).length > 0 && (
                    <>
                      <h4 className="font-bold text-xs text-blue-400 mt-4">Messages externes</h4>
                      {getClientMessages(selectedClient.name).map((msg) => (
                        <div
                          key={msg.id}
                          className={cn('p-3 rounded-lg', darkMode ? 'bg-blue-500/10' : 'bg-blue-50')}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="info">{msg.type}</Badge>
                            <span className="text-[10px] text-slate-400">{msg.date}</span>
                          </div>
                          <p className="font-bold text-sm">{msg.subject}</p>
                          <p className="text-xs text-slate-400 mt-1">{msg.message.slice(0, 150)}...</p>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* Tab Projets */}
              {detailTab === 'projets' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-emerald-400">Projets du client</h4>
                  {selectedClient.projects.length === 0 ? (
                    <p className="text-sm text-slate-400">Aucun projet associé</p>
                  ) : (
                    getClientProjects(selectedClient.projects).map((project) => (
                      <div
                        key={project.id}
                        className={cn(
                          'p-3 rounded-lg border-l-4',
                          project.status === 'active' ? 'border-l-emerald-500' :
                          project.status === 'blocked' ? 'border-l-red-500' : 'border-l-blue-500',
                          darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs text-orange-400">{project.id}</span>
                              <Badge variant={project.status === 'active' ? 'success' : project.status === 'blocked' ? 'urgent' : 'info'}>
                                {project.status}
                              </Badge>
                              <BureauTag bureau={project.bureau} />
                            </div>
                            <p className="font-bold text-sm">{project.name}</p>
                            <p className="text-[10px] text-slate-400 mt-1">Équipe: {project.team} personnes</p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-bold text-amber-400">{project.budget}</p>
                            <p className="text-[10px] text-slate-400">Avancement: {project.progress}%</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className={cn('h-2 rounded-full', darkMode ? 'bg-slate-700' : 'bg-gray-200')}>
                            <div
                              className={cn(
                                'h-full rounded-full',
                                project.status === 'blocked' ? 'bg-red-500' :
                                project.progress >= 80 ? 'bg-emerald-500' : 'bg-blue-500'
                              )}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Link href={`/maitre-ouvrage/projets-en-cours?id=${project.id}`}>
                            <Button size="xs" variant="info">📊 Voir projet</Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab Demandes */}
              {detailTab === 'demandes' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-purple-400">Demandes du client</h4>
                  {getClientDemands(selectedClient.id).length === 0 ? (
                    <p className="text-sm text-slate-400">Aucune demande</p>
                  ) : (
                    getClientDemands(selectedClient.id).map((demand) => (
                      <div
                        key={demand.id}
                        className={cn(
                          'p-3 rounded-lg border-l-4',
                          demand.status === 'pending' ? 'border-l-amber-500' :
                          demand.status === 'in_progress' ? 'border-l-blue-500' :
                          demand.status === 'resolved' ? 'border-l-emerald-500' : 'border-l-red-500',
                          darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-[10px] text-orange-400">{demand.id}</span>
                              <Badge
                                variant={
                                  demand.priority === 'urgent' ? 'urgent' :
                                  demand.priority === 'high' ? 'warning' : 'default'
                                }
                              >
                                {demand.priority}
                              </Badge>
                              <Badge
                                variant={
                                  demand.status === 'pending' ? 'warning' :
                                  demand.status === 'in_progress' ? 'info' :
                                  demand.status === 'resolved' ? 'success' : 'urgent'
                                }
                              >
                                {demand.status === 'pending' ? 'En attente' :
                                 demand.status === 'in_progress' ? 'En cours' :
                                 demand.status === 'resolved' ? 'Résolu' : 'Escaladé'}
                              </Badge>
                            </div>
                            <p className="font-bold text-sm">{demand.subject}</p>
                            <p className="text-xs text-slate-400 mt-1">{demand.description.slice(0, 100)}...</p>
                          </div>
                          <div className="text-right text-[10px]">
                            <p className="text-slate-400">{demand.date}</p>
                            {demand.assignedTo && (
                              <p className="text-blue-400">→ {demand.assignedTo}</p>
                            )}
                            {demand.responseTime && (
                              <p className="text-emerald-400">Répondu en {demand.responseTime}j</p>
                            )}
                          </div>
                        </div>
                        {demand.response && (
                          <div className={cn('mt-2 p-2 rounded text-xs', darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50')}>
                            <p className="text-emerald-400">✓ {demand.response}</p>
                          </div>
                        )}
                        {demand.status === 'pending' && (
                          <div className="flex gap-2 mt-2">
                            <Button size="xs" variant="success">✓ Répondre</Button>
                            <Button size="xs" variant="info">→ Assigner</Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                <Button className="flex-1" variant="info" onClick={() => addToast('Nouveau message', 'info')}>
                  💬 Contacter
                </Button>
                <Link href={`/maitre-ouvrage/tickets-clients?client=${selectedClient.id}`} className="flex-1">
                  <Button className="w-full">📝 Nouvelle demande</Button>
                </Link>
                <Button variant="secondary" onClick={() => setShowClientModal(false)}>
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres et liste clients */}
      <div className="flex gap-2 mb-4">
        {['all', 'particulier', 'entreprise', 'institution'].map((type) => (
          <Button
            key={type}
            size="sm"
            variant={filterType === type ? 'default' : 'secondary'}
            onClick={() => setFilterType(type as typeof filterType)}
          >
            {type === 'all' ? 'Tous' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
          </Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Liste des clients */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>👥 Liste des clients</span>
              <Badge variant="gray">{filteredStatsClients.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {filteredStatsClients.map((client) => (
              <div
                key={client.clientId}
                className={cn(
                  'p-3 rounded-lg cursor-pointer transition-all border-l-4',
                  selectedStatsClient === client.clientId
                    ? 'border-l-orange-500 bg-orange-500/10'
                    : 'border-l-transparent',
                  darkMode ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-gray-100 hover:bg-gray-200'
                )}
                onClick={() => setSelectedStatsClient(client.clientId)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: typeColors[client.clientType] }}
                    >
                      {client.clientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{client.clientName}</p>
                      <Badge
                        variant={client.clientType === 'entreprise' ? 'success' : client.clientType === 'institution' ? 'info' : 'default'}
                        className="text-[9px]"
                      >
                        {client.clientType}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-amber-400">
                      {formatMontant(client.chiffreAffairesAnnee)}
                    </p>
                    <p className="text-[10px] text-slate-400">CA année</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-sm font-bold">{client.projectsTotal}</p>
                    <p className="text-[9px] text-slate-400">Projets</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-400">{client.scoreQualite}%</p>
                    <p className="text-[9px] text-slate-400">Qualité</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold">{client.anciennete}m</p>
                    <p className="text-[9px] text-slate-400">Ancienneté</p>
                  </div>
                  <div>
                    <p className={cn(
                      'text-sm font-bold',
                      client.montantImpaye > 0 ? 'text-red-400' : 'text-emerald-400'
                    )}>
                      {client.montantImpaye > 0 ? formatMontant(client.montantImpaye) : '0'}
                    </p>
                    <p className="text-[9px] text-slate-400">Impayé</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Détails du client sélectionné */}
        <Card className={cn(!clientDetails && 'opacity-50')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              📋 {clientDetails ? `Détails - ${clientDetails.clientName}` : 'Sélectionnez un client'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clientDetails ? (
              <div className="space-y-4">
                {/* Info client */}
                <div className="p-3 rounded-lg bg-slate-700/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                      style={{ backgroundColor: typeColors[clientDetails.clientType] }}
                    >
                      {clientDetails.clientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold">{clientDetails.clientName}</p>
                      <Badge variant={clientDetails.clientType === 'entreprise' ? 'success' : 'info'}>
                        {clientDetails.clientType}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">Dernier contact:</span>
                      <span className="ml-2 font-medium">{clientDetails.dernierContact}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Ancienneté:</span>
                      <span className="ml-2 font-medium">{clientDetails.anciennete} mois</span>
                    </div>
                  </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-center">
                    <p className="text-lg font-bold text-emerald-400">{clientDetails.scoreQualite}%</p>
                    <p className="text-[10px] text-slate-400">Score qualité</p>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-500/10 text-center">
                    <p className="text-lg font-bold text-blue-400">{clientDetails.projectsTotal}</p>
                    <p className="text-[10px] text-slate-400">Projets total</p>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10 text-center">
                    <p className="text-sm font-bold text-amber-400">
                      {formatMontant(clientDetails.chiffreAffairesTotal)}
                    </p>
                    <p className="text-[10px] text-slate-400">CA Total</p>
                  </div>
                  <div className={cn(
                    'p-2 rounded-lg text-center',
                    clientDetails.montantImpaye > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10'
                  )}>
                    <p className={cn(
                      'text-sm font-bold',
                      clientDetails.montantImpaye > 0 ? 'text-red-400' : 'text-emerald-400'
                    )}>
                      {clientDetails.montantImpaye > 0 ? formatMontant(clientDetails.montantImpaye) : '0'}
                    </p>
                    <p className="text-[10px] text-slate-400">Impayés</p>
                  </div>
                </div>

                {/* Alertes */}
                {(clientDetails.nbReclamations > 0 || clientDetails.nbLitiges > 0) && (
                  <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30">
                    <p className="text-xs font-bold text-red-400 mb-1">⚠️ Alertes</p>
                    <div className="flex gap-4 text-xs">
                      {clientDetails.nbReclamations > 0 && (
                        <span>{clientDetails.nbReclamations} réclamation(s)</span>
                      )}
                      {clientDetails.nbLitiges > 0 && (
                        <span className="text-red-400">{clientDetails.nbLitiges} litige(s)</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Projets */}
                <div>
                  <p className="text-xs font-bold text-slate-400 mb-2">Historique projets</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {clientDetails.projects.map((project) => (
                      <div
                        key={project.projectId}
                        className="p-2 rounded-lg bg-slate-700/30 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-semibold">{project.projectName}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">{project.projectId}</span>
                            <Badge
                              variant={
                                project.status === 'completed' ? 'success' :
                                project.status === 'active' ? 'warning' :
                                project.status === 'blocked' ? 'urgent' : 'gray'
                              }
                              className="text-[9px]"
                            >
                              {project.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-mono font-bold">{formatMontant(project.budget)}</p>
                          {project.remaining > 0 && (
                            <p className="text-[9px] text-amber-400">
                              Reste: {formatMontant(project.remaining)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => addToast('Contact client...', 'info')}>
                    📧 Contacter
                  </Button>
                  <Button size="sm" variant="secondary" className="flex-1">
                    📋 Rapport
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <span className="text-4xl">👆</span>
                <p className="mt-2 text-sm">Cliquez sur un client pour voir ses détails</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info */}
      <Card className="border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-bold text-sm text-purple-400">Clients comme entités vivantes</h3>
              <p className="text-xs text-slate-400 mt-1">
                Chaque client possède une <span className="text-orange-400 font-bold">mémoire</span> (historique des échanges), 
                une <span className="text-emerald-400 font-bold">perception</span> (satisfaction mesurée), 
                un <span className="text-purple-400 font-bold">jugement</span> (statut relationnel) et 
                une <span className="text-blue-400 font-bold">voix</span> (demandes et messages).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
