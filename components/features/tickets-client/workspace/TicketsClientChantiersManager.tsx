'use client';

import React, { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { cn } from '@/lib/utils';
import {
  Building2,
  MapPin,
  Calendar,
  Users,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Star,
  Search,
  Filter,
  Download,
  ChevronRight,
  Map,
  BarChart2,
  FileText,
  Image as ImageIcon,
  Plus,
  Wrench,
  Package,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface Chantier {
  id: string;
  nom: string;
  type: 'construction' | 'renovation' | 'demolition' | 'amenagement';
  clientId: string;
  clientNom: string;
  adresse: string;
  ville: string;
  coordonnees?: { lat: number; lng: number };
  statut: 'planification' | 'en_cours' | 'suspendu' | 'termine';
  dateDebut: string;
  dateFin: string;
  budget: number;
  avancement: number;
  responsable: string;
  equipe: string[];
  nbTickets: number;
  nbTicketsOuverts: number;
  description: string;
}

interface ChantiersManagerModalProps {
  open: boolean;
  onClose: () => void;
  onSelectChantier?: (chantier: Chantier) => void;
}

// ============================================
// MOCK DATA
// ============================================

const MOCK_CHANTIERS: Chantier[] = [
  {
    id: 'CH001',
    nom: 'Résidence Les Jardins',
    type: 'construction',
    clientId: 'C001',
    clientNom: 'SARL Construction Plus',
    adresse: 'Avenue Bourguiba',
    ville: 'Dakar',
    coordonnees: { lat: 14.6937, lng: -17.4441 },
    statut: 'en_cours',
    dateDebut: '2025-06-15',
    dateFin: '2026-12-31',
    budget: 450000000,
    avancement: 65,
    responsable: 'Ing. Mamadou Diop',
    equipe: ['Chef chantier', '12 ouvriers', '3 techniciens'],
    nbTickets: 12,
    nbTicketsOuverts: 3,
    description: 'Construction de 50 villas standing avec piscine et espaces verts.',
  },
  {
    id: 'CH002',
    nom: 'Centre Commercial Nord',
    type: 'construction',
    clientId: 'C002',
    clientNom: 'Entreprise Bâtiment Moderne',
    adresse: 'Route de Rufisque',
    ville: 'Dakar',
    coordonnees: { lat: 14.7419, lng: -17.4922 },
    statut: 'en_cours',
    dateDebut: '2025-03-01',
    dateFin: '2026-08-31',
    budget: 850000000,
    avancement: 42,
    responsable: 'Ing. Fatou Sow',
    equipe: ['Chef chantier', '25 ouvriers', '5 techniciens', '2 électriciens'],
    nbTickets: 8,
    nbTicketsOuverts: 2,
    description: 'Centre commercial de 5000m² avec parkings sur 3 niveaux.',
  },
  {
    id: 'CH003',
    nom: 'Immeuble Horizon',
    type: 'construction',
    clientId: 'C003',
    clientNom: 'Ministère de la Santé',
    adresse: 'Plateau',
    ville: 'Dakar',
    coordonnees: { lat: 14.6928, lng: -17.4467 },
    statut: 'en_cours',
    dateDebut: '2024-09-01',
    dateFin: '2026-06-30',
    budget: 1200000000,
    avancement: 78,
    responsable: 'Ing. Amadou Ba',
    equipe: ['Chef chantier', '30 ouvriers', '8 techniciens', '4 ingénieurs'],
    nbTickets: 15,
    nbTicketsOuverts: 5,
    description: 'Immeuble R+8 à usage médical avec bloc opératoire moderne.',
  },
  {
    id: 'CH004',
    nom: 'Lotissement Colline',
    type: 'amenagement',
    clientId: 'C001',
    clientNom: 'SARL Construction Plus',
    adresse: 'Mbao',
    ville: 'Pikine',
    coordonnees: { lat: 14.7292, lng: -17.3569 },
    statut: 'planification',
    dateDebut: '2026-03-01',
    dateFin: '2027-12-31',
    budget: 320000000,
    avancement: 15,
    responsable: 'Ing. Pierre Ndiaye',
    equipe: ['Chef projet', '5 techniciens'],
    nbTickets: 4,
    nbTicketsOuverts: 1,
    description: 'Aménagement de 100 parcelles viabilisées avec voiries et réseaux.',
  },
  {
    id: 'CH005',
    nom: 'Rénovation Hôpital Régional',
    type: 'renovation',
    clientId: 'C003',
    clientNom: 'Ministère de la Santé',
    adresse: 'Centre-ville',
    ville: 'Thiès',
    coordonnees: { lat: 14.7886, lng: -16.9286 },
    statut: 'suspendu',
    dateDebut: '2025-01-15',
    dateFin: '2026-04-30',
    budget: 180000000,
    avancement: 35,
    responsable: 'Ing. Aïcha Thiam',
    equipe: ['Chef chantier', '8 ouvriers', '2 techniciens'],
    nbTickets: 7,
    nbTicketsOuverts: 4,
    description: 'Rénovation complète du bâtiment principal avec mise aux normes.',
  },
];

// ============================================
// COMPONENT
// ============================================

export function TicketsClientChantiersManagerModal({
  open,
  onClose,
  onSelectChantier,
}: ChantiersManagerModalProps) {
  const [activeTab, setActiveTab] = useState<'liste' | 'carte' | 'stats'>('liste');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatut, setFilterStatut] = useState<'all' | 'planification' | 'en_cours' | 'suspendu' | 'termine'>('all');
  const [selectedChantier, setSelectedChantier] = useState<Chantier | null>(null);

  const filteredChantiers = MOCK_CHANTIERS.filter((chantier) => {
    const matchSearch =
      searchQuery === '' ||
      chantier.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chantier.ville.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chantier.clientNom.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatut = filterStatut === 'all' || chantier.statut === filterStatut;

    return matchSearch && matchStatut;
  });

  const typeLabels: Record<string, string> = {
    construction: 'Construction',
    renovation: 'Rénovation',
    demolition: 'Démolition',
    amenagement: 'Aménagement',
  };

  const typeIcons: Record<string, any> = {
    construction: Building2,
    renovation: Wrench,
    demolition: AlertCircle,
    amenagement: Package,
  };

  const statutLabels: Record<string, string> = {
    planification: 'Planification',
    en_cours: 'En cours',
    suspendu: 'Suspendu',
    termine: 'Terminé',
  };

  const statutColors: Record<string, string> = {
    planification: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30',
    en_cours: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30',
    suspendu: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30',
    termine: 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-950/30',
  };

  return (
    <FluentModal
      open={open}
      title="Gestion des Chantiers"
      onClose={onClose}
      className="max-w-6xl"
    >
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'liste', label: 'Liste des chantiers', icon: Building2 },
          { id: 'carte', label: 'Carte', icon: Map },
          { id: 'stats', label: 'Statistiques', icon: BarChart2 },
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
                placeholder="Rechercher un chantier..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-orange-500/30"
            >
              <option value="all">Tous les statuts</option>
              <option value="planification">Planification</option>
              <option value="en_cours">En cours</option>
              <option value="suspendu">Suspendu</option>
              <option value="termine">Terminé</option>
            </select>
            <FluentButton variant="secondary" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Exporter
            </FluentButton>
          </div>

          {/* Chantiers list */}
          <div className="max-h-[500px] overflow-auto space-y-3">
            {filteredChantiers.map((chantier) => {
              const TypeIcon = typeIcons[chantier.type];
              return (
                <div
                  key={chantier.id}
                  className={cn(
                    'p-4 rounded-xl border transition-all cursor-pointer',
                    selectedChantier?.id === chantier.id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  )}
                  onClick={() => setSelectedChantier(chantier)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <TypeIcon className="w-5 h-5 text-orange-500" />
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                          {chantier.nom}
                        </h3>
                        <span className={cn('px-2 py-0.5 text-xs rounded-full', statutColors[chantier.statut])}>
                          {statutLabels[chantier.statut]}
                        </span>
                        {chantier.nbTicketsOuverts > 0 && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                            {chantier.nbTicketsOuverts} tickets ouverts
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        {chantier.description}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-3">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Users className="w-4 h-4 text-blue-500" />
                          {chantier.clientNom}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <MapPin className="w-4 h-4 text-rose-500" />
                          {chantier.ville}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Calendar className="w-4 h-4 text-amber-500" />
                          {new Date(chantier.dateDebut).toLocaleDateString('fr-FR')}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-500" />
                          <span className="font-medium">{chantier.avancement}%</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <DollarSign className="w-4 h-4" />
                          {(chantier.budget / 1000000).toFixed(1)}M XOF
                        </div>
                        <div className="text-slate-500">
                          {chantier.nbTickets} tickets
                        </div>
                        <div className="text-slate-500">
                          {chantier.responsable}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              chantier.avancement >= 75
                                ? 'bg-emerald-500'
                                : chantier.avancement >= 50
                                ? 'bg-blue-500'
                                : chantier.avancement >= 25
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            )}
                            style={{ width: `${chantier.avancement}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectChantier?.(chantier);
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

          {filteredChantiers.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50 text-slate-400" />
              <p className="text-slate-500">Aucun chantier trouvé</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'carte' && (
        <div className="h-[500px] flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          <div className="text-center">
            <Map className="w-12 h-12 mx-auto mb-4 opacity-50 text-slate-400" />
            <p className="text-slate-500">Carte géographique des chantiers</p>
            <p className="text-sm text-slate-400 mt-1">Intégration Google Maps / Mapbox à venir</p>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-500 mb-1">Total chantiers</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {MOCK_CHANTIERS.length}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-500 mb-1">En cours</div>
              <div className="text-2xl font-bold text-emerald-600">
                {MOCK_CHANTIERS.filter((c) => c.statut === 'en_cours').length}
              </div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-500 mb-1">Budget total</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {(MOCK_CHANTIERS.reduce((sum, c) => sum + c.budget, 0) / 1000000000).toFixed(1)}Mrd
              </div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-sm text-slate-500 mb-1">Avancement moyen</div>
              <div className="text-2xl font-bold text-blue-600">
                {(MOCK_CHANTIERS.reduce((sum, c) => sum + c.avancement, 0) / MOCK_CHANTIERS.length).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Chantiers par statut */}
          <div>
            <h3 className="font-medium mb-3">Répartition par statut</h3>
            <div className="space-y-2">
              {Object.entries(statutLabels).map(([statut, label]) => {
                const count = MOCK_CHANTIERS.filter((c) => c.statut === statut).length;
                const percentage = (count / MOCK_CHANTIERS.length) * 100;
                return (
                  <div key={statut} className="flex items-center gap-3">
                    <div className="w-32 text-sm text-slate-600 dark:text-slate-400">{label}</div>
                    <div className="flex-1">
                      <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                        <div
                          className={cn('h-full flex items-center px-3 text-sm font-medium', statutColors[statut])}
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

      {/* Footer */}
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <FluentButton variant="secondary" onClick={onClose}>
          Fermer
        </FluentButton>
        {selectedChantier && activeTab === 'liste' && (
          <FluentButton
            variant="primary"
            onClick={() => {
              onSelectChantier?.(selectedChantier);
              onClose();
            }}
          >
            Sélectionner ce chantier
          </FluentButton>
        )}
      </div>
    </FluentModal>
  );
}

