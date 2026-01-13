'use client';

import React, { useMemo } from 'react';
import { useValidationContratsWorkspaceStore } from '@/lib/stores/validationContratsWorkspaceStore';
import { ContratInboxView } from './views/ContratInboxView';
import { ContratDetailView } from './views/ContratDetailView';
import { ContratComparateurView } from './views/ContratComparateurView';
import { ContratWizardView } from './views/ContratWizardView';
import { ContratAuditView } from './views/ContratAuditView';
import { ContratAnalyticsView } from './views/ContratAnalyticsView';
import { ContratPartenaireView } from './views/ContratPartenaireView';
import { motion, AnimatePresence } from 'framer-motion';

export function ContratWorkspaceContent() {
  const { tabs, activeTabId } = useValidationContratsWorkspaceStore();

  const activeTab = useMemo(() => {
    return tabs.find((t) => t.id === activeTabId) ?? null;
  }, [tabs, activeTabId]);

  if (!activeTab) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-6xl mb-4">📜</div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Aucun onglet ouvert
        </h3>
        <p className="text-sm text-slate-500 max-w-md">
          Utilisez <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-xs font-mono">Ctrl+K</kbd> pour ouvrir la palette de commandes
          et accéder aux contrats.
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.15 }}
        className="h-full"
      >
        <TabContent tab={activeTab} />
      </motion.div>
    </AnimatePresence>
  );
}

interface TabContentProps {
  tab: NonNullable<ReturnType<typeof useValidationContratsWorkspaceStore.getState>['tabs'][0]>;
}

function TabContent({ tab }: TabContentProps) {
  switch (tab.type) {
    case 'inbox':
      return <ContratInboxView queue={tab.data?.queue as string} tabId={tab.id} />;

    case 'contrat':
      return <ContratDetailView contractId={tab.data?.contractId as string} tabId={tab.id} />;

    case 'comparateur':
      return <ContratComparateurView tabId={tab.id} />;

    case 'wizard':
      return <ContratWizardView action={tab.data?.action as string} tabId={tab.id} />;

    case 'audit':
      return <ContratAuditView tabId={tab.id} />;

    case 'analytics':
      return <ContratAnalyticsView tabId={tab.id} />;

    case 'partenaire':
      return <ContratPartenaireView partnerId={tab.data?.partnerId as string} tabId={tab.id} />;

    case 'workflow':
      return <ContratWorkflowView tabId={tab.id} />;

    case 'dashboard':
      return (
        <div className="p-6 text-center text-slate-500">
          Dashboard intégré (vue par défaut dans la page principale)
        </div>
      );

    default:
      return (
        <div className="p-8 text-center">
          <div className="text-4xl mb-4">🔧</div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            Type d'onglet inconnu
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            Type: {tab.type}
          </p>
        </div>
      );
  }
}

// Placeholder pour workflow view
function ContratWorkflowView({ tabId }: { tabId: string }) {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Workflow de validation</h2>
      <p className="text-slate-500">Vue du flux de validation des contrats...</p>
    </div>
  );
}

