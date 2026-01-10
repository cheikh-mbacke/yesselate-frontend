/**
 * Modales du Dashboard Command Center
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Download,
  Settings,
  Keyboard,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  Check,
} from 'lucide-react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';

export function DashboardModals() {
  const { modal, closeModal } = useDashboardCommandCenterStore();

  if (!modal.isOpen || !modal.type) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={closeModal}
      />

      {/* Modal content based on type */}
      {modal.type === 'kpi-drilldown' && <KPIDrillDownModal />}
      {modal.type === 'risk-detail' && <RiskDetailModal />}
      {modal.type === 'action-detail' && <ActionDetailModal />}
      {modal.type === 'decision-detail' && <DecisionDetailModal />}
      {modal.type === 'export' && <ExportModal />}
      {modal.type === 'settings' && <SettingsModal />}
      {modal.type === 'shortcuts' && <ShortcutsModal />}
    </>
  );
}

// Base modal wrapper
function ModalWrapper({
  title,
  children,
  maxWidth = 'max-w-lg',
}: {
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  const { closeModal } = useDashboardCommandCenterStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={cn(
          'w-full bg-slate-900 rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden',
          maxWidth
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeModal}
            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function KPIDrillDownModal() {
  const { modal } = useDashboardCommandCenterStore();
  const kpiId = modal.data?.kpiId as string;

  return (
    <ModalWrapper title="Détail KPI" maxWidth="max-w-2xl">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <BarChart3 className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-200">{kpiId || 'KPI'}</h3>
            <p className="text-sm text-slate-500">Analyse détaillée</p>
          </div>
        </div>

        <div className="h-48 flex items-center justify-center border border-dashed border-slate-700 rounded-lg">
          <span className="text-sm text-slate-500">
            Graphique d'évolution (à implémenter)
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-1">Période actuelle</p>
            <p className="text-lg font-bold text-slate-200">247</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-1">Période précédente</p>
            <p className="text-lg font-bold text-slate-200">220</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-1">Variation</p>
            <p className="text-lg font-bold text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +12%
            </p>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}

function RiskDetailModal() {
  const { modal, closeModal } = useDashboardCommandCenterStore();
  const risk = modal.data?.risk as any;

  return (
    <ModalWrapper title="Détail du risque" maxWidth="max-w-xl">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant="destructive">Critique</Badge>
          <span className="text-xs text-slate-500">{risk?.id || 'RISK-001'}</span>
        </div>

        <div>
          <h3 className="text-lg font-medium text-slate-200">
            {risk?.title || 'Risque détecté'}
          </h3>
          <p className="text-sm text-slate-400 mt-1">{risk?.detail || 'Description...'}</p>
        </div>

        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
          <p className="text-sm text-slate-300">{risk?.explain || 'Explication...'}</p>
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1 bg-rose-600 hover:bg-rose-700">
            Intervenir
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={closeModal}
            className="flex-1 border-slate-700"
          >
            Fermer
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}

function ActionDetailModal() {
  const { modal, closeModal } = useDashboardCommandCenterStore();
  const action = modal.data?.action as any;

  return (
    <ModalWrapper title="Détail de l'action" maxWidth="max-w-xl">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant="warning">En attente</Badge>
          <span className="text-xs text-slate-500">{action?.id || 'ACTION-001'}</span>
        </div>

        <div>
          <h3 className="text-lg font-medium text-slate-200">
            {action?.title || 'Action à traiter'}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {action?.description || 'Description de l\'action...'}
          </p>
        </div>

        {action?.amount && (
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-1">Montant</p>
            <p className="text-lg font-bold text-slate-200">{action.amount}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
            <Check className="w-4 h-4 mr-2" />
            Valider
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={closeModal}
            className="flex-1 border-slate-700"
          >
            Fermer
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}

function DecisionDetailModal() {
  const { modal, closeModal } = useDashboardCommandCenterStore();
  const decision = modal.data?.decision as any;

  return (
    <ModalWrapper title="Détail de la décision" maxWidth="max-w-xl">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant={decision?.status === 'executed' ? 'success' : 'warning'}>
            {decision?.status === 'executed' ? 'Exécutée' : 'En attente'}
          </Badge>
          <span className="text-xs text-slate-500">{decision?.id || 'DEC-001'}</span>
        </div>

        <div>
          <p className="text-sm text-slate-500">{decision?.type || 'Type'}</p>
          <h3 className="text-lg font-medium text-slate-200 mt-1">
            {decision?.subject || 'Sujet de la décision'}
          </h3>
          <p className="text-sm text-slate-400 mt-2">
            {decision?.description || 'Description...'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-1">Auteur</p>
            <p className="text-sm text-slate-200">{decision?.author || 'N/A'}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-1">Date</p>
            <p className="text-sm text-slate-200">{decision?.date || 'N/A'}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={closeModal} className="flex-1 border-slate-700">
            Fermer
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}

function ExportModal() {
  const { closeModal } = useDashboardCommandCenterStore();
  const [format, setFormat] = React.useState<'pdf' | 'excel' | 'csv'>('pdf');

  return (
    <ModalWrapper title="Exporter les données">
      <div className="space-y-4">
        <p className="text-sm text-slate-400">
          Choisissez le format d'export pour les données du dashboard.
        </p>

        <div className="grid grid-cols-3 gap-2">
          {(['pdf', 'excel', 'csv'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={cn(
                'p-3 rounded-lg border text-center transition-all',
                format === f
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800/70'
              )}
            >
              <FileText className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs uppercase font-medium">{f}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={closeModal}
            className="flex-1 border-slate-700"
          >
            Annuler
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}

function SettingsModal() {
  const { closeModal, kpiConfig, setKPIConfig, displayConfig, setDisplayConfig } =
    useDashboardCommandCenterStore();

  return (
    <ModalWrapper title="Paramètres du Dashboard" maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-200">KPI Bar</h3>
          <label className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Afficher la barre KPI</span>
            <input
              type="checkbox"
              checked={kpiConfig.visible}
              onChange={(e) => setKPIConfig({ visible: e.target.checked })}
              className="rounded border-slate-700"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Auto-refresh</span>
            <input
              type="checkbox"
              checked={kpiConfig.autoRefresh}
              onChange={(e) => setKPIConfig({ autoRefresh: e.target.checked })}
              className="rounded border-slate-700"
            />
          </label>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-200">Affichage</h3>
          <label className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Mode vue</span>
            <select
              value={displayConfig.viewMode}
              onChange={(e) => setDisplayConfig({ viewMode: e.target.value as any })}
              className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-sm text-slate-300"
            >
              <option value="compact">Compact</option>
              <option value="extended">Étendu</option>
            </select>
          </label>
        </div>

        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={closeModal} className="flex-1 border-slate-700">
            Fermer
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}

function ShortcutsModal() {
  const { closeModal } = useDashboardCommandCenterStore();

  const shortcuts = [
    { key: '⌘K', description: 'Ouvrir la palette de commandes' },
    { key: '⌘E', description: 'Exporter les données' },
    { key: 'F11', description: 'Mode plein écran' },
    { key: 'Alt+←', description: 'Retour arrière' },
    { key: '/', description: 'Focus recherche' },
    { key: '?', description: 'Afficher l\'aide' },
    { key: 'Esc', description: 'Fermer le dialogue' },
  ];

  return (
    <ModalWrapper title="Raccourcis clavier" maxWidth="max-w-md">
      <div className="space-y-2">
        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.key}
            className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0"
          >
            <span className="text-sm text-slate-400">{shortcut.description}</span>
            <kbd className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-300 font-mono">
              {shortcut.key}
            </kbd>
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-4">
        <Button size="sm" variant="outline" onClick={closeModal} className="flex-1 border-slate-700">
          Fermer
        </Button>
      </div>
    </ModalWrapper>
  );
}

