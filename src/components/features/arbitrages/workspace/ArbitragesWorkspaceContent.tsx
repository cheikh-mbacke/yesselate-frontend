'use client';

import { useArbitragesWorkspaceStore } from '@/lib/stores/arbitragesWorkspaceStore';
import { FluentButton } from '@/components/ui/fluent-button';
import { Scale, Inbox, Building2, Plus, FileText } from 'lucide-react';
import { ArbitragesInboxView } from './views/ArbitragesInboxView';
import { ArbitrageViewer } from './views/ArbitrageViewer';
import { BureauViewer } from './views/BureauViewer';

/**
 * ArbitragesWorkspaceContent
 * ==========================
 * 
 * Composant central qui route vers la bonne vue selon le type d'onglet.
 * 
 * Types d'onglets supportés :
 * - inbox : file de travail (arbitrages à traiter, en délibération, etc.)
 * - arbitrage : vue détaillée d'un arbitrage (vivant ou simple)
 * - bureau : vue détaillée d'un bureau de gouvernance
 * - wizard : assistant de création/modification
 * - report : rapports et exports
 */

export function ArbitragesWorkspaceContent() {
  const { tabs, activeTabId, openTab } = useArbitragesWorkspaceStore();
  const activeTab = tabs.find(t => t.id === activeTabId);

  // ================================
  // VUE PAR DÉFAUT (pas d'onglet actif)
  // ================================
  if (!activeTab) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 dark:border-slate-800 dark:bg-[#1f1f1f]/70 flex flex-col items-center justify-center text-center min-h-[400px]">
        <Scale className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2">
          Gouvernance & Décisions
        </h2>
        <p className="text-slate-500 mb-6 max-w-md">
          Gérez les arbitrages et décisions stratégiques avec une traçabilité complète. 
          Chaque décision génère un hash SHA3-256 pour anti-contestation.
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          <FluentButton
            variant="secondary"
            onClick={() => openTab({ 
              id: 'inbox:ouverts', 
              type: 'inbox', 
              title: 'Ouverts', 
              icon: '⏳', 
              data: { queue: 'ouverts', type: 'arbitrages' } 
            })}
          >
            <Scale className="w-4 h-4 text-amber-500" /> En cours
          </FluentButton>
          <FluentButton
            variant="secondary"
            onClick={() => openTab({ 
              id: 'inbox:critiques', 
              type: 'inbox', 
              title: 'Critiques', 
              icon: '🚨', 
              data: { queue: 'critiques', type: 'arbitrages' } 
            })}
          >
            <Scale className="w-4 h-4 text-red-500" /> Critiques
          </FluentButton>
          <FluentButton
            variant="secondary"
            onClick={() => openTab({ 
              id: 'inbox:urgents', 
              type: 'inbox', 
              title: 'Urgents', 
              icon: '⏰', 
              data: { queue: 'urgents', type: 'arbitrages' } 
            })}
          >
            <Scale className="w-4 h-4 text-orange-500" /> Urgents
          </FluentButton>
          <FluentButton
            variant="secondary"
            onClick={() => openTab({ 
              id: 'inbox:tranches', 
              type: 'inbox', 
              title: 'Tranchés', 
              icon: '✅', 
              data: { queue: 'tranches', type: 'arbitrages' } 
            })}
          >
            <Inbox className="w-4 h-4 text-emerald-500" /> Tranchés
          </FluentButton>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <FluentButton
            variant="secondary"
            onClick={() => openTab({ 
              id: 'inbox:bureaux-surcharge', 
              type: 'inbox', 
              title: 'Bureaux en surcharge', 
              icon: '🔥', 
              data: { queue: 'surcharge', type: 'bureaux' } 
            })}
          >
            <Building2 className="w-4 h-4 text-rose-500" /> Bureaux en surcharge
          </FluentButton>
          <FluentButton
            variant="secondary"
            onClick={() => openTab({ 
              id: 'inbox:bureaux-goulots', 
              type: 'inbox', 
              title: 'Goulots', 
              icon: '⚠️', 
              data: { queue: 'goulots', type: 'bureaux' } 
            })}
          >
            <Building2 className="w-4 h-4 text-amber-500" /> Goulots
          </FluentButton>
        </div>

        <div className="mt-4">
          <FluentButton
            variant="primary"
            onClick={() => {
              openTab({
                id: `wizard:create:${Date.now()}`,
                type: 'wizard',
                title: 'Nouvel arbitrage',
                icon: '➕',
                data: { action: 'create' },
              });
            }}
          >
            <Plus className="w-4 h-4" /> Créer un arbitrage
          </FluentButton>
        </div>
        
        <p className="text-xs text-slate-400 mt-8">
          Astuce: Utilisez <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-mono">Ctrl+K</kbd> pour 
          ouvrir la palette de commandes ou <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-mono">/</kbd> pour 
          rechercher rapidement.
        </p>
      </div>
    );
  }

  // ================================
  // ROUTING PAR TYPE D'ONGLET
  // ================================

  // Inbox (file de travail)
  if (activeTab.type === 'inbox') {
    return <ArbitragesInboxView tab={activeTab} />;
  }

  // Arbitrage (viewer avec arborescence)
  if (activeTab.type === 'arbitrage') {
    const arbitrageId = activeTab.data?.arbitrageId || activeTab.id.replace('arbitrage:', '');
    return <ArbitrageViewer arbitrageId={arbitrageId} />;
  }

  // Bureau (vue détaillée)
  if (activeTab.type === 'bureau') {
    const bureauCode = activeTab.data?.bureauCode || activeTab.id.replace('bureau:', '');
    return <BureauViewer bureauCode={bureauCode} />;
  }

  // Wizard (création/modification)
  if (activeTab.type === 'wizard') {
    return (
      <div className="p-6 text-center text-slate-500">
        <Plus className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <h3 className="font-semibold text-lg mb-2">{activeTab.title}</h3>
        <p className="text-sm">
          Action : <code className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs">
            {activeTab.data?.action ?? 'inconnu'}
          </code>
        </p>
        <p className="text-xs text-slate-400 mt-4">
          Composant ArbitrageWizard à créer (formulaire de création/modification)
        </p>
      </div>
    );
  }

  // Report
  if (activeTab.type === 'report') {
    return (
      <div className="p-6 text-center text-slate-500">
        <FileText className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
        <h3 className="font-semibold text-lg mb-2">{activeTab.title}</h3>
        <p className="text-sm">
          Rapport : <code className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs">
            {activeTab.data?.reportId ?? 'inconnu'}
          </code>
        </p>
        <p className="text-xs text-slate-400 mt-4">
          Composant ArbitrageReport à créer (rapports et analyses)
        </p>
      </div>
    );
  }

  // Fallback
  return <div className="p-8 text-center text-slate-500">Vue non gérée: {activeTab.type}</div>;
}


