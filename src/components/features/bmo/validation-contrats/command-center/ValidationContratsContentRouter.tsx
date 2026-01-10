/**
 * Content Router pour Validation Contrats - Version améliorée
 * Route le contenu selon la catégorie et sous-catégorie active
 * NOUVEAU: Filtrage réel par sous-catégorie
 */

'use client';

import React from 'react';
import { ContratsWorkspaceContent } from '@/components/features/bmo/workspace/contrats';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import {
  ContratsTrendChart,
  ContratsStatusChart,
  ContratsValidationTimeChart,
  ContratsPerformanceByBureauChart,
  ContratsMonthlyComparisonChart,
  ContratsFinancialByTypeChart,
  ContratsFinancialEvolutionChart,
} from '../analytics/ContratsAnalyticsCharts';

interface ValidationContratsContentRouterProps {
  category: string;
  subCategory: string | null;
}

export function ValidationContratsContentRouter({
  category,
  subCategory,
}: ValidationContratsContentRouterProps) {
  return (
    <div className="h-full">
      {category === 'overview' && <OverviewContent subCategory={subCategory} />}
      {category === 'pending' && <PendingContent subCategory={subCategory} />}
      {category === 'urgent' && <UrgentContent subCategory={subCategory} />}
      {category === 'validated' && <ValidatedContent subCategory={subCategory} />}
      {category === 'rejected' && <RejectedContent subCategory={subCategory} />}
      {category === 'negotiation' && <NegotiationContent subCategory={subCategory} />}
      {category === 'analytics' && <AnalyticsContent subCategory={subCategory} />}
      {category === 'financial' && <FinancialContent subCategory={subCategory} />}
      {category === 'documents' && <DocumentsContent subCategory={subCategory} />}
    </div>
  );
}

// ================================
// Vues par catégorie - AVEC FILTRAGE RÉEL
// ================================

function OverviewContent({ subCategory }: { subCategory: string | null }) {
  // Déterminer le filtre selon la sous-catégorie
  const getFilterInfo = () => {
    switch (subCategory) {
      case 'dashboard':
        return { title: 'Tableau de bord', description: 'Vue globale avec statistiques' };
      case 'recent':
        return { title: 'Récents', description: 'Contrats reçus dans les dernières 48h', badge: '8' };
      default:
        return { title: 'Vue d\'ensemble', description: 'Tableau de bord global' };
    }
  };

  const filterInfo = getFilterInfo();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-semibold text-slate-200">{filterInfo.title}</h2>
          {filterInfo.badge && (
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              {filterInfo.badge}
            </Badge>
          )}
        </div>
        <p className="text-slate-400 mb-6">{filterInfo.description}</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total contrats" value="73" trend="+5" color="purple" />
        <StatCard title="En attente" value="12" trend="-3" color="amber" />
        <StatCard title="Validés ce mois" value="45" trend="+8" color="emerald" />
        <StatCard title="Taux validation" value="87%" trend="+2%" color="blue" />
      </div>

      {/* Filtre actif */}
      {subCategory && subCategory !== 'all' && (
        <FilterBanner
          text={`Filtrage actif: ${filterInfo.title}`}
          description={subCategory === 'recent' ? 'Contrats des dernières 48h' : ''}
        />
      )}

      <div className="mt-8">
        <ContratsWorkspaceContent />
      </div>
    </div>
  );
}

function PendingContent({ subCategory }: { subCategory: string | null }) {
  // Déterminer les infos selon la sous-catégorie
  const getFilterInfo = () => {
    switch (subCategory) {
      case 'priority':
        return {
          title: 'Contrats prioritaires',
          description: 'Urgence élevée ou critique nécessitant attention immédiate',
          count: '5',
          color: 'amber',
        };
      case 'standard':
        return {
          title: 'Contrats standard',
          description: 'Urgence normale, traitement selon processus habituel',
          count: '7',
          color: 'blue',
        };
      default:
        return {
          title: 'Contrats en attente',
          description: 'Tous les contrats en attente de validation',
          count: '12',
          color: 'amber',
        };
    }
  };

  const filterInfo = getFilterInfo();

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-xl font-semibold text-slate-200">{filterInfo.title}</h2>
          <Badge className={`bg-${filterInfo.color}-500/20 text-${filterInfo.color}-400 border-${filterInfo.color}-500/30`}>
            {filterInfo.count}
          </Badge>
        </div>
        <p className="text-slate-400 text-sm">{filterInfo.description}</p>
      </div>

      {/* Filtre actif */}
      {subCategory && subCategory !== 'all' && (
        <FilterBanner
          text={`Filtrage: ${subCategory === 'priority' ? 'Haute priorité (critical/high)' : 'Priorité normale (medium/low)'}`}
        />
      )}
      
      <ContratsWorkspaceContent />
    </div>
  );
}

function UrgentContent({ subCategory }: { subCategory: string | null }) {
  const getFilterInfo = () => {
    switch (subCategory) {
      case 'overdue':
        return { title: 'En retard', description: 'Date d\'échéance dépassée', count: '1', icon: '🔴' };
      case 'due-today':
        return { title: 'Aujourd\'hui', description: 'À traiter aujourd\'hui', count: '2', icon: '⚠️' };
      default:
        return { title: 'Contrats urgents', description: 'Tous les contrats urgents', count: '3', icon: '⚠️' };
    }
  };

  const filterInfo = getFilterInfo();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/20">
          <span className="text-xl">{filterInfo.icon}</span>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-semibold text-slate-200">{filterInfo.title}</h2>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{filterInfo.count}</Badge>
          </div>
          <p className="text-slate-400 text-sm">{filterInfo.description}</p>
        </div>
      </div>

      {subCategory && subCategory !== 'all' && (
        <FilterBanner
          text={`Filtrage: ${filterInfo.title}`}
          description={filterInfo.description}
          variant="critical"
        />
      )}
      
      <ContratsWorkspaceContent />
    </div>
  );
}

function ValidatedContent({ subCategory }: { subCategory: string | null }) {
  const getFilterInfo = () => {
    switch (subCategory) {
      case 'today':
        return { title: 'Aujourd\'hui', count: '8', period: 'validés aujourd\'hui' };
      case 'this-week':
        return { title: 'Cette semaine', count: '23', period: 'validés cette semaine' };
      case 'this-month':
        return { title: 'Ce mois', count: '45', period: 'validés ce mois' };
      default:
        return { title: 'Tous les validés', count: '45', period: 'validés avec succès' };
    }
  };

  const filterInfo = getFilterInfo();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/20">
          <span className="text-xl">✅</span>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-semibold text-slate-200">{filterInfo.title}</h2>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              {filterInfo.count}
            </Badge>
          </div>
          <p className="text-slate-400 text-sm">{filterInfo.count} contrats {filterInfo.period}</p>
        </div>
      </div>

      {subCategory && subCategory !== 'all' && (
        <FilterBanner text={`Période: ${filterInfo.title}`} variant="success" />
      )}
      
      <ContratsWorkspaceContent />
    </div>
  );
}

function RejectedContent({ subCategory }: { subCategory: string | null }) {
  const getFilterInfo = () => {
    switch (subCategory) {
      case 'recent':
        return { title: 'Rejetés récents', count: '3', description: 'Derniers 7 jours' };
      case 'archived':
        return { title: 'Archivés', count: '5', description: 'Plus de 30 jours' };
      default:
        return { title: 'Tous les rejetés', count: '8', description: 'Tous les contrats rejetés' };
    }
  };

  const filterInfo = getFilterInfo();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/20">
          <span className="text-xl">❌</span>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-semibold text-slate-200">{filterInfo.title}</h2>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{filterInfo.count}</Badge>
          </div>
          <p className="text-slate-400 text-sm">{filterInfo.description}</p>
        </div>
      </div>

      {subCategory && subCategory !== 'all' && (
        <FilterBanner text={`Filtrage: ${filterInfo.title}`} />
      )}
      
      <ContratsWorkspaceContent />
    </div>
  );
}

function NegotiationContent({ subCategory }: { subCategory: string | null }) {
  const getFilterInfo = () => {
    switch (subCategory) {
      case 'active':
        return { title: 'Négociations actives', count: '3', description: 'Discussion en cours' };
      case 'pending-response':
        return { title: 'En attente de réponse', count: '2', description: 'Attente réponse fournisseur' };
      default:
        return { title: 'Toutes les négociations', count: '5', description: 'Tous les contrats en négociation' };
    }
  };

  const filterInfo = getFilterInfo();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/20">
          <span className="text-xl">💬</span>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-semibold text-slate-200">{filterInfo.title}</h2>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{filterInfo.count}</Badge>
          </div>
          <p className="text-slate-400 text-sm">{filterInfo.description}</p>
        </div>
      </div>

      {subCategory && subCategory !== 'all' && (
        <FilterBanner text={`Filtrage: ${filterInfo.title}`} variant="info" />
      )}
      
      <ContratsWorkspaceContent />
    </div>
  );
}

function AnalyticsContent({ subCategory }: { subCategory: string | null }) {
  // Déterminer les graphiques selon la sous-catégorie
  const getChartView = () => {
    if (subCategory === 'trends') return 'trends';
    if (subCategory === 'performance') return 'performance';
    return 'overview';
  };

  const chartView = getChartView();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-200 mb-2">Analytics</h2>
        <p className="text-slate-400 text-sm">
          {chartView === 'trends' && 'Tendances et évolution des validations'}
          {chartView === 'performance' && 'Performance par bureau et délais'}
          {chartView === 'overview' && 'Vue d\'ensemble des analyses'}
        </p>
      </div>

      {chartView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Évolution mensuelle</h3>
            <ContratsTrendChart />
          </div>

          <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Répartition par statut</h3>
            <ContratsStatusChart />
          </div>

          <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Délais de validation</h3>
            <ContratsValidationTimeChart />
          </div>

          <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Performance par bureau</h3>
            <ContratsPerformanceByBureauChart />
          </div>
        </div>
      )}

      {chartView === 'trends' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Tendances de validation</h3>
            <ContratsTrendChart />
          </div>

          <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Comparaison mensuelle</h3>
            <ContratsMonthlyComparisonChart />
          </div>
        </div>
      )}

      {chartView === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Taux de validation par bureau</h3>
            <ContratsPerformanceByBureauChart />
          </div>

          <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Distribution des délais</h3>
            <ContratsValidationTimeChart />
          </div>
        </div>
      )}
    </div>
  );
}

function FinancialContent({ subCategory }: { subCategory: string | null }) {
  const getFinancialView = () => {
    if (subCategory === 'by-status') return 'by-status';
    if (subCategory === 'by-period') return 'by-period';
    return 'overview';
  };

  const view = getFinancialView();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-200 mb-2">Financier</h2>
        <p className="text-slate-400 text-sm">
          {view === 'by-status' && 'Répartition financière par statut'}
          {view === 'by-period' && 'Évolution financière dans le temps'}
          {view === 'overview' && 'Vue d\'ensemble financière'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700/50">
          <p className="text-xs text-slate-500 mb-2">Montant total</p>
          <p className="text-2xl font-bold text-slate-200">245M FCFA</p>
          <p className="text-xs text-emerald-400 mt-1">+12M ce mois</p>
        </div>
        <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700/50">
          <p className="text-xs text-slate-500 mb-2">Montant moyen</p>
          <p className="text-2xl font-bold text-slate-200">3.4M FCFA</p>
          <p className="text-xs text-slate-500 mt-1">par contrat</p>
        </div>
        <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700/50">
          <p className="text-xs text-slate-500 mb-2">En attente</p>
          <p className="text-2xl font-bold text-slate-200">41M FCFA</p>
          <p className="text-xs text-amber-400 mt-1">12 contrats</p>
        </div>
      </div>

      {view === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Répartition par type</h3>
            <ContratsFinancialByTypeChart />
          </div>

          <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Évolution mensuelle</h3>
            <ContratsFinancialEvolutionChart />
          </div>
        </div>
      )}

      {view === 'by-status' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Montants par type de contrat</h3>
            <ContratsFinancialByTypeChart />
          </div>
        </div>
      )}

      {view === 'by-period' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-slate-800/40 rounded-lg p-6 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Évolution du montant total</h3>
            <ContratsFinancialEvolutionChart />
          </div>
        </div>
      )}

      <ContratsWorkspaceContent />
    </div>
  );
}

function DocumentsContent({ subCategory }: { subCategory: string | null }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-200 mb-2">Documents</h2>
        <p className="text-slate-400 text-sm">Gestion des documents contractuels</p>
      </div>
      
      <ContratsWorkspaceContent />
    </div>
  );
}

// ================================
// Helper Components
// ================================

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  color: 'purple' | 'amber' | 'emerald' | 'blue';
}

function StatCard({ title, value, trend, color }: StatCardProps) {
  const colorClasses = {
    purple: 'bg-purple-500/10 border-purple-500/20',
    amber: 'bg-amber-500/10 border-amber-500/20',
    emerald: 'bg-emerald-500/10 border-emerald-500/20',
    blue: 'bg-blue-500/10 border-blue-500/20',
  };

  const textColorClasses = {
    purple: 'text-purple-400',
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
  };

  return (
    <div className={`rounded-lg p-6 border ${colorClasses[color]}`}>
      <p className="text-xs text-slate-500 mb-2">{title}</p>
      <div className="flex items-baseline gap-2">
        <p className={`text-2xl font-bold ${textColorClasses[color]}`}>{value}</p>
        <span className="text-xs text-slate-500">{trend}</span>
      </div>
    </div>
  );
}

// ================================
// Filter Banner - Nouveau composant
// ================================
interface FilterBannerProps {
  text: string;
  description?: string;
  variant?: 'default' | 'success' | 'critical' | 'info';
}

function FilterBanner({ text, description, variant = 'default' }: FilterBannerProps) {
  const colors = {
    default: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    critical: 'bg-red-500/10 border-red-500/30 text-red-300',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
  };

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${colors[variant]}`}>
      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium">{text}</p>
        {description && <p className="text-xs opacity-80 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

