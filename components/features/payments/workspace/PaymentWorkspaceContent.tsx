'use client';

import React, { useMemo } from 'react';
import { usePaymentValidationWorkspaceStore, type PaymentTab, type PaymentSubTab } from '@/lib/stores/paymentValidationWorkspaceStore';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  Workflow, 
  Eye, 
  Shield, 
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building2,
  CreditCard,
  FileCheck,
  Download,
  MoreHorizontal,
} from 'lucide-react';

// ================================
// Sub-tab Navigation
// ================================
function SubTabNav({ tab, onSubTabChange }: { tab: PaymentTab; onSubTabChange: (subTab: PaymentSubTab) => void }) {
  const currentSubTab = tab.subTab || 'details';
  
  const subTabs: { id: PaymentSubTab; label: string; icon: React.ReactNode }[] = [
    { id: 'details', label: 'Détails', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'facture', label: 'Facture liée', icon: <FileText className="w-4 h-4" /> },
    { id: 'workflow', label: 'Workflow', icon: <Workflow className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit', icon: <Eye className="w-4 h-4" /> },
    { id: 'evidence', label: 'Preuves', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="flex items-center gap-1 p-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
      {subTabs.map((st) => (
        <button
          key={st.id}
          type="button"
          onClick={() => onSubTabChange(st.id)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            currentSubTab === st.id
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
          )}
        >
          {st.icon}
          {st.label}
        </button>
      ))}
    </div>
  );
}

// ================================
// Inbox View (Liste de paiements)
// ================================
function InboxView({ queue }: { queue: string }) {
  const queueLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    all: { label: 'Tous les paiements', icon: <CreditCard className="w-5 h-5" />, color: 'text-slate-500' },
    pending: { label: 'En attente de validation', icon: <Clock className="w-5 h-5" />, color: 'text-amber-500' },
    '7days': { label: 'Échéances à 7 jours', icon: <Clock className="w-5 h-5" />, color: 'text-blue-500' },
    late: { label: 'Paiements en retard', icon: <AlertTriangle className="w-5 h-5" />, color: 'text-red-500' },
    critical: { label: 'Montants critiques (≥5M FCFA)', icon: <Shield className="w-5 h-5" />, color: 'text-purple-500' },
    bf_pending: { label: 'En attente validation BF', icon: <Building2 className="w-5 h-5" />, color: 'text-orange-500' },
    dg_pending: { label: 'En attente validation DG', icon: <Shield className="w-5 h-5" />, color: 'text-indigo-500' },
    validated: { label: 'Paiements validés', icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-emerald-500' },
    blocked: { label: 'Paiements bloqués', icon: <XCircle className="w-5 h-5" />, color: 'text-red-500' },
    factures: { label: 'Factures reçues', icon: <FileText className="w-5 h-5" />, color: 'text-blue-500' },
    watchlist: { label: 'Watchlist', icon: <Eye className="w-5 h-5" />, color: 'text-amber-500' },
  };

  const queueInfo = queueLabels[queue] || queueLabels.all;

  return (
    <div className="h-full flex flex-col">
      {/* Queue Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-xl bg-slate-100 dark:bg-slate-800', queueInfo.color)}>
            {queueInfo.icon}
          </div>
          <div>
            <h2 className="font-semibold text-lg">{queueInfo.label}</h2>
            <p className="text-sm text-slate-500">0 paiements</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm"
          >
            <FileCheck className="w-4 h-4" />
            Tout sélectionner
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
          <button
            type="button"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className={cn('mx-auto w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4', queueInfo.color)}>
            {queueInfo.icon}
          </div>
          <h3 className="font-semibold text-lg mb-2">Aucun paiement dans cette file</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            Les paiements correspondant aux critères de cette file s'afficheront ici.
          </p>
        </div>
      </div>
    </div>
  );
}

// ================================
// Payment Detail View
// ================================
function PaymentDetailView({ tab }: { tab: PaymentTab }) {
  const { setSubTab } = usePaymentValidationWorkspaceStore();
  const currentSubTab = tab.subTab || 'details';

  return (
    <div className="h-full flex flex-col">
      <SubTabNav tab={tab} onSubTabChange={(st) => setSubTab(tab.id, st)} />
      
      <div className="flex-1 overflow-y-auto p-6">
        {currentSubTab === 'details' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h3 className="font-semibold mb-4">Informations du paiement</h3>
              <p className="text-sm text-slate-500">Chargement des détails...</p>
            </div>
          </div>
        )}
        
        {currentSubTab === 'facture' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h3 className="font-semibold mb-4">Facture liée</h3>
              <p className="text-sm text-slate-500">Matching facture ↔ paiement</p>
            </div>
          </div>
        )}
        
        {currentSubTab === 'workflow' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h3 className="font-semibold mb-4">Workflow de validation</h3>
              <p className="text-sm text-slate-500">Étapes BF → DG</p>
            </div>
          </div>
        )}
        
        {currentSubTab === 'audit' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h3 className="font-semibold mb-4">Journal d'audit</h3>
              <p className="text-sm text-slate-500">Traçabilité des actions</p>
            </div>
          </div>
        )}
        
        {currentSubTab === 'evidence' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h3 className="font-semibold mb-4">Preuves et justificatifs</h3>
              <p className="text-sm text-slate-500">Hash canonique, chainHead, Evidence Pack</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ================================
// Batch View
// ================================
function BatchView({ action }: { action?: string }) {
  return (
    <div className="h-full flex flex-col p-6">
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h3 className="font-semibold mb-4">
          {action === 'validate' ? 'Validation en lot' : 'Action groupée'}
        </h3>
        <p className="text-sm text-slate-500">
          Sélectionnez les paiements à traiter en lot.
        </p>
      </div>
    </div>
  );
}

// ================================
// Audit View
// ================================
function AuditView() {
  return (
    <div className="h-full flex flex-col p-6">
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h3 className="font-semibold mb-4">Journal d'audit global</h3>
        <p className="text-sm text-slate-500">
          Historique complet des actions avec hash et chainHead.
        </p>
      </div>
    </div>
  );
}

// ================================
// Stats View
// ================================
function StatsView() {
  return (
    <div className="h-full flex flex-col p-6">
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h3 className="font-semibold mb-4">Statistiques et Analytics</h3>
        <p className="text-sm text-slate-500">
          Métriques et tableaux de bord.
        </p>
      </div>
    </div>
  );
}

// ================================
// Main Content Component
// ================================
export function PaymentWorkspaceContent() {
  const { tabs, activeTabId } = usePaymentValidationWorkspaceStore();

  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId),
    [tabs, activeTabId]
  );

  if (!activeTab) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Aucun onglet ouvert</h3>
          <p className="text-sm text-slate-500">
            Utilisez <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs">⌘K</kbd> pour naviguer.
          </p>
        </div>
      </div>
    );
  }

  // Route based on tab type
  switch (activeTab.type) {
    case 'inbox':
      return <InboxView queue={(activeTab.data?.queue as string) || 'all'} />;
    
    case 'payment':
      return <PaymentDetailView tab={activeTab} />;
    
    case 'batch':
      return <BatchView action={activeTab.data?.action as string} />;
    
    case 'audit':
      return <AuditView />;
    
    case 'stats':
      return <StatsView />;
    
    default:
      return (
        <div className="h-full flex items-center justify-center p-8">
          <p className="text-slate-500">Type d'onglet non reconnu: {activeTab.type}</p>
        </div>
      );
  }
}

