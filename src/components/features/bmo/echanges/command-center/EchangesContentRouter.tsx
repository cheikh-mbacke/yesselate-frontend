/**
 * ContentRouter pour Échanges Inter-Bureaux
 * Router le contenu en fonction de la catégorie et sous-catégorie active
 */

'use client';

import React from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { EchangesWorkspaceContent, EchangesLiveCounters } from '@/components/features/bmo/workspace/echanges';

interface EchangesContentRouterProps {
  category: string;
  subCategory: string | null;
}

export const EchangesContentRouter = React.memo(function EchangesContentRouter({
  category,
  subCategory,
}: EchangesContentRouterProps) {
  // Vue d'ensemble
  if (category === 'overview') {
    return <OverviewView />;
  }

  // Boîte de réception
  if (category === 'inbox') {
    return <InboxView subCategory={subCategory} />;
  }

  // Urgents
  if (category === 'urgent') {
    return <UrgentView subCategory={subCategory} />;
  }

  // Escaladés
  if (category === 'escalated') {
    return <EscalatedView subCategory={subCategory} />;
  }

  // En attente
  if (category === 'pending') {
    return <PendingView subCategory={subCategory} />;
  }

  // Résolus
  if (category === 'resolved') {
    return <ResolvedView subCategory={subCategory} />;
  }

  // Par bureau
  if (category === 'by-bureau') {
    return <ByBureauView subCategory={subCategory} />;
  }

  // Analytics
  if (category === 'analytics') {
    return <AnalyticsView subCategory={subCategory} />;
  }

  // Historique
  if (category === 'history') {
    return <HistoryView subCategory={subCategory} />;
  }

  // Placeholder par défaut
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          {category} - {subCategory || 'Tous'}
        </h3>
        <p className="text-slate-500">Contenu en cours de développement</p>
      </div>
    </div>
  );
});

// ================================
// Vue d'ensemble
// ================================
const OverviewView = React.memo(function OverviewView() {
  return (
    <div className="p-6 space-y-6">
      <EchangesLiveCounters onOpenQueue={(queue, title, icon) => {
        // TODO: Implémenter l'ouverture de queue
        console.log('Open queue:', queue, title, icon);
      }} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50">
          <h3 className="font-semibold text-slate-200 mb-2">Échanges récents</h3>
          <p className="text-sm text-slate-400">Vue d'ensemble des derniers échanges</p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50">
          <h3 className="font-semibold text-slate-200 mb-2">Statistiques</h3>
          <p className="text-sm text-slate-400">Métriques et indicateurs clés</p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50">
          <h3 className="font-semibold text-slate-200 mb-2">Actions rapides</h3>
          <p className="text-sm text-slate-400">Accès rapide aux fonctionnalités</p>
        </div>
      </div>
    </div>
  );
});

// ================================
// Vue Boîte de réception
// ================================
const InboxView = React.memo(function InboxView({ subCategory }: { subCategory: string | null }) {
  return (
    <div className="p-6">
      <EchangesWorkspaceContent />
    </div>
  );
});

// ================================
// Vue Urgents
// ================================
const UrgentView = React.memo(function UrgentView({ subCategory }: { subCategory: string | null }) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-slate-200 mb-4">Échanges Urgents</h2>
      <EchangesWorkspaceContent />
    </div>
  );
});

// ================================
// Vue Escaladés
// ================================
const EscalatedView = React.memo(function EscalatedView({ subCategory }: { subCategory: string | null }) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-slate-200 mb-4">Échanges Escaladés</h2>
      <EchangesWorkspaceContent />
    </div>
  );
});

// ================================
// Vue En attente
// ================================
const PendingView = React.memo(function PendingView({ subCategory }: { subCategory: string | null }) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-slate-200 mb-4">Échanges En Attente</h2>
      <EchangesWorkspaceContent />
    </div>
  );
});

// ================================
// Vue Résolus
// ================================
const ResolvedView = React.memo(function ResolvedView({ subCategory }: { subCategory: string | null }) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-slate-200 mb-4">Échanges Résolus</h2>
      <EchangesWorkspaceContent />
    </div>
  );
});

// ================================
// Vue Par bureau
// ================================
const ByBureauView = React.memo(function ByBureauView({ subCategory }: { subCategory: string | null }) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-slate-200 mb-4">Échanges par Bureau</h2>
      <p className="text-slate-400">Vue des échanges organisés par bureau</p>
    </div>
  );
});

// ================================
// Vue Analytics
// ================================
const AnalyticsView = React.memo(function AnalyticsView({ subCategory }: { subCategory: string | null }) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-slate-200 mb-4">Analytics</h2>
      <p className="text-slate-400">Analyses et statistiques des échanges</p>
    </div>
  );
});

// ================================
// Vue Historique
// ================================
const HistoryView = React.memo(function HistoryView({ subCategory }: { subCategory: string | null }) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-slate-200 mb-4">Historique</h2>
      <p className="text-slate-400">Historique complet des échanges</p>
    </div>
  );
});

