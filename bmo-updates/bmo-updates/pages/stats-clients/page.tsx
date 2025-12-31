'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { clientsStats, clientsGlobalStats } from '@/lib/data';

export default function StatsClientsPage() {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'particulier' | 'entreprise' | 'institution'>('all');

  // Filtrer les clients
  const filteredClients = clientsStats.filter(
    (c) => filterType === 'all' || c.clientType === filterType
  );

  // Client sélectionné
  const clientDetails = selectedClient
    ? clientsStats.find((c) => c.clientId === selectedClient)
    : null;

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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            📈 Statistiques Clients
          </h1>
          <p className="text-sm text-slate-400">
            Analyse et suivi de la relation client
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
                    formatter={(value: number, name: string) => [
                      name === 'chiffreAffaires' ? formatMontant(value) + ' FCFA' : value,
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
                onClick={() => setSelectedClient(client.clientId)}
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
              <Badge variant="gray">{filteredClients.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {filteredClients.map((client) => (
              <div
                key={client.clientId}
                className={cn(
                  'p-3 rounded-lg cursor-pointer transition-all border-l-4',
                  selectedClient === client.clientId
                    ? 'border-l-orange-500 bg-orange-500/10'
                    : 'border-l-transparent',
                  darkMode ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-gray-100 hover:bg-gray-200'
                )}
                onClick={() => setSelectedClient(client.clientId)}
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
    </div>
  );
}
