'use client';

import React, { useMemo } from 'react';
import { useTicketsClientWorkspaceStore, type TicketTab } from '@/lib/stores/ticketsClientWorkspaceStore';
import { cn } from '@/lib/utils';
import {
  Inbox,
  Ticket,
  Sparkles,
  BarChart2,
  Map,
  Columns3,
  Clock,
  FileText,
  Search,
  Filter,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import { FluentButton } from '@/components/ui/fluent-button';

// ============================================
// PLACEHOLDER VIEWS
// ============================================

function InboxView({ queue }: { queue: string }) {
  const queueLabels: Record<string, string> = {
    nouveau: 'Tickets nouveaux',
    en_cours: 'Tickets en cours de traitement',
    critique: 'Tickets de priorité critique',
    escalade: 'Tickets escaladés',
    en_attente_client: 'Tickets en attente du client',
    en_attente_interne: 'Tickets en attente interne',
    resolu: 'Tickets résolus',
    clos: 'Tickets clôturés',
    hors_delai: 'Tickets hors délai SLA',
    haute: 'Tickets haute priorité',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {queueLabels[queue] ?? `File: ${queue}`}
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-orange-500/30"
            />
          </div>
          <FluentButton variant="secondary" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </FluentButton>
        </div>
      </div>

      {/* Liste placeholder */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-orange-300 dark:hover:border-orange-700 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm text-slate-500">TKT-{1000 + i}</span>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                    {['Nouvelle', 'En cours', 'Critique', 'Escaladé', 'Résolu'][i % 5]}
                  </span>
                </div>
                <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                  Ticket exemple #{i + 1} - Réclamation client
                </h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                  Description du ticket avec les détails de la demande client...
                </p>
              </div>
              <div className="text-right text-sm text-slate-400">
                <div>Il y a 2h</div>
                <div className="text-xs">Chantier ABC</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
        <span className="text-sm text-slate-500">Affichage 1-5 sur 42 tickets</span>
        <div className="flex items-center gap-2">
          <FluentButton variant="secondary" size="sm" disabled>
            <ArrowLeft className="w-4 h-4" />
          </FluentButton>
          <FluentButton variant="secondary" size="sm">
            <ArrowRight className="w-4 h-4" />
          </FluentButton>
        </div>
      </div>
    </div>
  );
}

function TicketDetailView({ ticketId }: { ticketId: string }) {
  const { getTabUI, setTabUI, tabs, activeTabId, goBack, goForward, canGoBack, canGoForward } = useTicketsClientWorkspaceStore();
  
  const activeTab = tabs.find(t => t.id === activeTabId);
  const ui = activeTab ? getTabUI(activeTab.id) : undefined;
  const currentSection = ui?.section ?? 'overview';

  const sections = [
    { id: 'overview', label: "Vue d'ensemble", icon: Ticket },
    { id: 'messages', label: 'Messages', icon: FileText },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'historique', label: 'Historique', icon: Clock },
    { id: 'sla', label: 'SLA', icon: Clock },
    { id: 'escalade', label: 'Escalade', icon: Sparkles },
    { id: 'chantier', label: 'Chantier', icon: Map },
    { id: 'facturation', label: 'Facturation', icon: FileText },
    { id: 'resolution', label: 'Résolution', icon: Sparkles },
  ] as const;

  return (
    <div className="flex flex-col h-full">
      {/* Header avec navigation */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50">
        <div className="flex items-center gap-4">
          {/* Navigation arrière/avant */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => goBack()}
              disabled={!canGoBack()}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => goForward()}
              disabled={!canGoForward()}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-slate-500">{ticketId}</span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                En cours
              </span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300">
                Critique
              </span>
            </div>
            <h1 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
              Réclamation qualité - Fissures façade
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FluentButton variant="secondary" size="sm">
            Actions
            <ChevronDown className="w-4 h-4 ml-1" />
          </FluentButton>
          <FluentButton variant="primary" size="sm">
            Traiter
          </FluentButton>
        </div>
      </div>

      {/* Sous-navigation (sections) */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 overflow-x-auto">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = currentSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => {
                if (activeTab) {
                  setTabUI(activeTab.id, { section: section.id as any });
                }
              }}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors',
                isActive
                  ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
              )}
            >
              <Icon className="w-4 h-4" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Contenu de la section */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {currentSection === 'overview' && (
            <div className="space-y-6">
              {/* Infos principales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
                  <div className="text-sm text-slate-500 mb-1">Client</div>
                  <div className="font-medium">SARL Construction Plus</div>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
                  <div className="text-sm text-slate-500 mb-1">Chantier</div>
                  <div className="font-medium">Résidence Les Jardins</div>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
                  <div className="text-sm text-slate-500 mb-1">Date création</div>
                  <div className="font-medium">10 janvier 2026</div>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
                <h3 className="font-medium mb-3">Description</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Le client signale des fissures apparentes sur la façade nord du bâtiment B.
                  Les fissures sont apparues après les dernières intempéries et semblent s'agrandir.
                  Le client demande une intervention rapide et une expertise pour évaluer les dommages.
                </p>
              </div>

              {/* Timeline récente */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
                <h3 className="font-medium mb-3">Activité récente</h3>
                <div className="space-y-3">
                  {[
                    { action: 'Ticket créé', author: 'Système', time: '10:30' },
                    { action: 'Assigné à Jean Dupont', author: 'Marie Martin', time: '10:45' },
                    { action: 'Priorité élevée à Critique', author: 'Jean Dupont', time: '11:00' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-slate-400">{item.time}</span>
                      <span className="flex-1">{item.action}</span>
                      <span className="text-slate-500">{item.author}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentSection !== 'overview' && (
            <div className="flex items-center justify-center h-64 text-slate-500">
              <div className="text-center">
                <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Section {sections.find(s => s.id === currentSection)?.label ?? currentSection}</p>
                <p className="text-sm">Contenu à implémenter</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WizardView({ action }: { action: string }) {
  const [step, setStep] = React.useState(0);
  const steps = [
    'Type de ticket',
    'Informations client',
    'Chantier concerné',
    'Description du problème',
    'Priorité et SLA',
    'Validation',
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Steps indicator */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                    i < step
                      ? 'bg-emerald-500 text-white'
                      : i === step
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  )}
                >
                  {i < step ? '✓' : i + 1}
                </div>
                <span
                  className={cn(
                    'mt-1 text-xs',
                    i === step ? 'text-orange-600 font-medium' : 'text-slate-500'
                  )}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    'w-12 h-0.5 mx-2',
                    i < step ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">{steps[step]}</h2>
          
          {/* Placeholder form */}
          <div className="space-y-4">
            <div className="p-8 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center text-slate-500">
              Formulaire étape {step + 1}
            </div>
          </div>
        </div>
      </div>

      {/* Footer navigation */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <FluentButton
            variant="secondary"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Précédent
          </FluentButton>

          <span className="text-sm text-slate-500">
            Étape {step + 1} sur {steps.length}
          </span>

          {step < steps.length - 1 ? (
            <FluentButton
              variant="primary"
              onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
            >
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </FluentButton>
          ) : (
            <FluentButton variant="primary">
              Créer le ticket
            </FluentButton>
          )}
        </div>
      </div>
    </div>
  );
}

function KanbanView() {
  const columns = [
    { id: 'nouveau', label: 'Nouveaux', color: 'blue', count: 8 },
    { id: 'en_cours', label: 'En cours', color: 'orange', count: 12 },
    { id: 'en_attente', label: 'En attente', color: 'amber', count: 5 },
    { id: 'resolu', label: 'Résolus', color: 'emerald', count: 24 },
  ];

  return (
    <div className="flex gap-4 p-6 h-full overflow-x-auto">
      {columns.map((col) => (
        <div
          key={col.id}
          className="flex-shrink-0 w-80 flex flex-col bg-slate-100 dark:bg-slate-800/50 rounded-xl"
        >
          <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className={cn('w-2 h-2 rounded-full', `bg-${col.color}-500`)} />
              <span className="font-medium">{col.label}</span>
            </div>
            <span className="px-2 py-0.5 text-xs rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
              {col.count}
            </span>
          </div>
          <div className="flex-1 overflow-auto p-3 space-y-2">
            {Array.from({ length: Math.min(col.count, 4) }).map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-slate-400">TKT-{1000 + i}</span>
                  <span className="px-1.5 py-0.5 text-[10px] rounded bg-rose-100 text-rose-700">
                    Critique
                  </span>
                </div>
                <p className="text-sm font-medium line-clamp-2">
                  Ticket exemple {i + 1}
                </p>
                <div className="mt-2 text-xs text-slate-500">
                  SARL Construction
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TimelineView() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Timeline des tickets</h2>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="relative pl-12 pb-6">
            <div className="absolute left-2 w-4 h-4 rounded-full bg-orange-500 border-2 border-white dark:border-slate-900" />
            <div className="text-sm text-slate-500 mb-1">
              {new Date(Date.now() - i * 3600000).toLocaleString('fr-FR')}
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm text-slate-500">TKT-{1000 + i}</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                  Nouveau
                </span>
              </div>
              <p className="font-medium">Action sur le ticket #{i + 1}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function TicketsClientWorkspaceContent() {
  const { tabs, activeTabId, getActiveTab } = useTicketsClientWorkspaceStore();

  const activeTab = getActiveTab();

  if (!activeTab) {
    return null;
  }

  // Render based on tab type
  switch (activeTab.type) {
    case 'inbox':
      return <InboxView queue={activeTab.data?.queue as string ?? 'all'} />;
    case 'ticket':
      return <TicketDetailView ticketId={activeTab.data?.ticketId as string ?? 'TKT-0000'} />;
    case 'wizard':
      return <WizardView action={activeTab.data?.action as string ?? 'create'} />;
    case 'kanban':
      return <KanbanView />;
    case 'timeline':
      return <TimelineView />;
    case 'analytics':
      return (
        <div className="p-6 text-center text-slate-500">
          <BarChart2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Vue Analytics</p>
        </div>
      );
    case 'map':
      return (
        <div className="p-6 text-center text-slate-500">
          <Map className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Vue Carte des chantiers</p>
        </div>
      );
    case 'report':
      return (
        <div className="p-6 text-center text-slate-500">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Rapport généré</p>
        </div>
      );
    default:
      return (
        <div className="p-6 text-center text-slate-500">
          <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Type d'onglet non reconnu</p>
        </div>
      );
  }
}

