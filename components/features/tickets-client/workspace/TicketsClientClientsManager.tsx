'use client';

import React, { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { cn } from '@/lib/utils';
import {
  Building,
  User,
  Building2,
  Landmark,
  Heart,
  Phone,
  Mail,
  MapPin,
  Star,
  Activity,
  DollarSign,
  Search,
  Filter,
  Download,
  ChevronRight,
  Plus,
  BarChart2,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface Client {
  id: string;
  nom: string;
  type: 'particulier' | 'entreprise' | 'institution' | 'ong';
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  responsable?: string;
  nbTickets: number;
  nbTicketsOuverts: number;
  nbChantiers: number;
  chiffreAffaires: number;
  noteSatisfaction: number;
  dateCreation: string;
}

interface ClientsManagerModalProps {
  open: boolean;
  onClose: () => void;
  onSelectClient?: (client: Client) => void;
}

// ============================================
// MOCK DATA
// ============================================

const MOCK_CLIENTS: Client[] = [
  {
    id: 'C001',
    nom: 'SARL Construction Plus',
    type: 'entreprise',
    email: 'contact@construction-plus.sn',
    telephone: '+221 33 824 56 78',
    adresse: 'Avenue Bourguiba, Immeuble Horizon',
    ville: 'Dakar',
    responsable: 'M. Ousmane Diop',
    nbTickets: 24,
    nbTicketsOuverts: 3,
    nbChantiers: 2,
    chiffreAffaires: 850000000,
    noteSatisfaction: 4.5,
    dateCreation: '2023-06-15',
  },
  {
    id: 'C002',
    nom: 'Entreprise Bâtiment Moderne',
    type: 'entreprise',
    email: 'info@ebm-senegal.com',
    telephone: '+221 33 856 12 34',
    adresse: 'Zone Industrielle, Lot 45',
    ville: 'Rufisque',
    responsable: 'Mme Fatou Sow',
    nbTickets: 18,
    nbTicketsOuverts: 2,
    nbChantiers: 1,
    chiffreAffaires: 450000000,
    noteSatisfaction: 4.8,
    dateCreation: '2024-01-20',
  },
  {
    id: 'C003',
    nom: 'Ministère de la Santé',
    type: 'institution',
    email: 'dgi@sante.gouv.sn',
    telephone: '+221 33 889 45 67',
    adresse: 'Fann Résidence',
    ville: 'Dakar',
    responsable: 'Dr. Amadou Ba',
    nbTickets: 42,
    nbTicketsOuverts: 5,
    nbChantiers: 3,
    chiffreAffaires: 1800000000,
    noteSatisfaction: 4.2,
    dateCreation: '2022-03-10',
  },
  {
    id: 'C004',
    nom: 'M. Moussa Ndiaye',
    type: 'particulier',
    email: 'mndiaye@gmail.com',
    telephone: '+221 77 123 45 67',
    adresse: 'Almadies, Villa 12',
    ville: 'Dakar',
    nbTickets: 5,
    nbTicketsOuverts: 1,
    nbChantiers: 1,
    chiffreAffaires: 120000000,
    noteSatisfaction: 5.0,
    dateCreation: '2024-11-05',
  },
  {
    id: 'C005',
    nom: 'ONG Habitat pour Tous',
    type: 'ong',
    email: 'contact@habitat-tous.org',
    telephone: '+221 33 867 89 12',
    adresse: 'Sacré-Coeur 3',
    ville: 'Dakar',
    responsable: 'Mme Aïcha Thiam',
    nbTickets: 12,
    nbTicketsOuverts: 0,
    nbChantiers: 2,
    chiffreAffaires: 280000000,
    noteSatisfaction: 4.9,
    dateCreation: '2023-09-18',
  },
];

// ============================================
// COMPONENT
// ============================================

export function TicketsClientClientsManagerModal({
  open,
  onClose,
  onSelectClient,
}: ClientsManagerModalProps) {
  const [activeTab, setActiveTab] = useState<'liste' | 'stats' | 'nouveau'>('liste');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'particulier' | 'entreprise' | 'institution' | 'ong'>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = MOCK_CLIENTS.filter((client) => {
    const matchSearch =
      searchQuery === '' ||
      client.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.ville.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchType = filterType === 'all' || client.type === filterType;

    return matchSearch && matchType;
  });

  const typeLabels: Record<string, string> = {
    particulier: 'Particulier',
    entreprise: 'Entreprise',
    institution: 'Institution',
    ong: 'ONG',
  };

  const typeIcons: Record<string, any> = {
    particulier: User,
    entreprise: Building,
    institution: Landmark,
    ong: Heart,
  };

  const typeColors: Record<string, string> = {
    particulier: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30',
    entreprise: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30',
    institution: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/30',
    ong: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/30',
  };

  return (
    <FluentModal
      open={open}
      title="Gestion des Clients"
      onClose={onClose}
      className="max-w-6xl"
    >
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'liste', label: 'Liste des clients', icon: Building },
          { id: 'stats', label: 'Statistiques', icon: BarChart2 },
          { id: 'nouveau', label: 'Nouveau client', icon: Plus },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === 'liste' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un client..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-orange-500/30"
            >
              <option value="all">Tous les types</option>
              <option value="particulier">Particulier</option>
              <option value="entreprise">Entreprise</option>
              <option value="institution">Institution</option>
              <option value="ong">ONG</option>
            </select>
            <FluentButton variant="secondary" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Exporter
            </FluentButton>
          </div>

          {/* Clients list */}
          <div className="max-h-[500px] overflow-auto space-y-3">
            {filteredClients.map((client) => {
              const TypeIcon = typeIcons[client.type];
              return (
                <div
                  key={client.id}
                  className={cn(
                    'p-4 rounded-xl border transition-all cursor-pointer',
                    selectedClient?.id === client.id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  )}
                  onClick={() => setSelectedClient(client)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <TypeIcon className="w-5 h-5 text-orange-500" />
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                          {client.nom}
                        </h3>
                        <span className={cn('px-2 py-0.5 text-xs rounded-full', typeColors[client.type])}>
                          {typeLabels[client.type]}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {client.noteSatisfaction.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-3">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Phone className="w-4 h-4 text-blue-500" />
                          {client.telephone}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Mail className="w-4 h-4 text-emerald-500" />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <MapPin className="w-4 h-4 text-rose-500" />
                          {client.ville}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-blue-500" />
                          <span>{client.nbTickets} tickets</span>
                          {client.nbTicketsOuverts > 0 && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                              {client.nbTicketsOuverts} ouverts
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Building2 className="w-4 h-4" />
                          {client.nbChantiers} chantier{client.nbChantiers > 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <DollarSign className="w-4 h-4" />
                          {(client.chiffreAffaires / 1000000).toFixed(1)}M XOF
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectClient?.(client);
                        onClose();
                      }}
                      className="p-2 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/20"
                      title="Sélectionner"
                    >
                      <ChevronRight className="w-4 h-4 text-orange-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <Building className="w-12 h-12 mx-auto mb-4 opacity-50 text-slate-400" />
              <p className="text-slate-500">Aucun client trouvé</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-500 mb-1">Total clients</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {MOCK_CLIENTS.length}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-500 mb-1">Entreprises</div>
              <div className="text-2xl font-bold text-emerald-600">
                {MOCK_CLIENTS.filter((c) => c.type === 'entreprise').length}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-500 mb-1">CA total</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {(MOCK_CLIENTS.reduce((sum, c) => sum + c.chiffreAffaires, 0) / 1000000000).toFixed(1)}Mrd
              </div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-500 mb-1">Satisfaction</div>
              <div className="text-2xl font-bold text-amber-600">
                {(MOCK_CLIENTS.reduce((sum, c) => sum + c.noteSatisfaction, 0) / MOCK_CLIENTS.length).toFixed(1)}/5
              </div>
            </div>
          </div>

          {/* Clients par type */}
          <div>
            <h3 className="font-medium mb-3">Répartition par type</h3>
            <div className="space-y-2">
              {Object.entries(typeLabels).map(([type, label]) => {
                const count = MOCK_CLIENTS.filter((c) => c.type === type).length;
                const percentage = (count / MOCK_CLIENTS.length) * 100;
                return (
                  <div key={type} className="flex items-center gap-3">
                    <div className="w-32 text-sm text-slate-600 dark:text-slate-400">{label}</div>
                    <div className="flex-1">
                      <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                        <div
                          className={cn('h-full flex items-center px-3 text-sm font-medium', typeColors[type])}
                          style={{ width: `${Math.max(percentage, 10)}%` }}
                        >
                          {count}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-500 w-16 text-right">{percentage.toFixed(0)}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'nouveau' && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                Nom
              </label>
              <input
                type="text"
                placeholder="Nom du client"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                Type
              </label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-orange-500/30">
                <option value="particulier">Particulier</option>
                <option value="entreprise">Entreprise</option>
                <option value="institution">Institution</option>
                <option value="ong">ONG</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="email@exemple.com"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-orange-500/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              placeholder="+221 XX XXX XX XX"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-orange-500/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
              Adresse
            </label>
            <textarea
              rows={2}
              placeholder="Adresse complète"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-orange-500/30 resize-none"
            />
          </div>
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Fonctionnalité de création à connecter à l'API backend
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <FluentButton variant="secondary" onClick={onClose}>
          Fermer
        </FluentButton>
        {selectedClient && activeTab === 'liste' && (
          <FluentButton
            variant="primary"
            onClick={() => {
              onSelectClient?.(selectedClient);
              onClose();
            }}
          >
            Sélectionner ce client
          </FluentButton>
        )}
      </div>
    </FluentModal>
  );
}
