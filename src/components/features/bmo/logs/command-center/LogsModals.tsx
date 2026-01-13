/**
 * Modales du Logs Command Center
 * Router de modals utilisant le store - Pattern Analytics
 */

'use client';

import React from 'react';
import { useLogsCommandCenterStore } from '@/lib/stores/logsCommandCenterStore';
import { LogsStatsModal } from '../../workspace/logs/LogsStatsModal';
import { LogDetailModal } from './LogDetailModal';
import { LogsFiltersPanel } from './LogsFiltersPanel';
import { LogsExportModal } from './LogsExportModal';
import { LogsSettingsModal } from './LogsSettingsModal';

export function LogsModals() {
  const { modal, closeModal } = useLogsCommandCenterStore();

  if (!modal.isOpen || !modal.type) return null;

  // Stats Modal
  if (modal.type === 'stats') {
    return <LogsStatsModal open={true} onClose={closeModal} />;
  }

  // Log Detail Modal
  if (modal.type === 'log-detail') {
    return (
      <LogDetailModal
        open={true}
        onClose={closeModal}
        logId={(modal.data?.logId as string) || null}
      />
    );
  }

  // Export Modal
  if (modal.type === 'export') {
    return <LogsExportModal onClose={closeModal} />;
  }

  // Filters Panel
  if (modal.type === 'filters') {
    return (
      <LogsFiltersPanel
        isOpen={true}
        onClose={closeModal}
        onApplyFilters={(filters) => {
          // Les filtres sont déjà appliqués dans LogsFiltersPanel
          closeModal();
        }}
      />
    );
  }

  // Settings Modal
  if (modal.type === 'settings') {
    return <LogsSettingsModal onClose={closeModal} />;
  }

  // Shortcuts Modal
  if (modal.type === 'shortcuts') {
    return <ShortcutsModal onClose={closeModal} />;
  }

  // Help Modal
  if (modal.type === 'help') {
    return <HelpModal onClose={closeModal} />;
  }

  // Confirm Modal
  if (modal.type === 'confirm') {
    return <ConfirmModal onClose={closeModal} data={modal.data} />;
  }

  return null;
}



// ================================
// Shortcuts Modal
// ================================
function ShortcutsModal({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    { key: '⌘K', label: 'Palette de commandes' },
    { key: '⌘B', label: 'Afficher/Masquer sidebar' },
    { key: '⌘F', label: 'Filtres avancés' },
    { key: '⌘E', label: 'Exporter' },
    { key: '⌘I', label: 'Statistiques' },
    { key: 'F11', label: 'Plein écran' },
    { key: 'Alt+←', label: 'Retour' },
    { key: 'Esc', label: 'Fermer les modales' },
    { key: '?', label: 'Cette aide' },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-700/50 bg-slate-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
            <span className="text-2xl">⌨️</span>
            Raccourcis clavier
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
          >
            ×
          </button>
        </div>
        <div className="space-y-3 text-sm">
          {shortcuts.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-slate-400">{label}</span>
              <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-xs text-slate-300">
                {key}
              </kbd>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-2 rounded-lg bg-slate-800 text-slate-200 font-medium hover:bg-slate-700 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

// ================================
// Help Modal
// ================================
function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-700/50 bg-slate-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-100">Aide - Logs</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
          >
            ×
          </button>
        </div>
        <div className="space-y-4 text-sm text-slate-300">
          <div>
            <h3 className="font-semibold text-slate-200 mb-2">Navigation</h3>
            <p className="text-slate-400">
              Utilisez la sidebar pour naviguer entre les catégories de logs. Les KPIs en haut affichent les statistiques en temps réel.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 mb-2">Détails</h3>
            <p className="text-slate-400">
              Cliquez sur un log ou un KPI pour voir les détails dans le panneau latéral. Utilisez "Voir plus" pour ouvrir la vue complète.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 mb-2">Filtres</h3>
            <p className="text-slate-400">
              Utilisez les filtres avancés (⌘F) pour affiner votre recherche par niveau, source, module ou date.
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-2 rounded-lg bg-slate-800 text-slate-200 font-medium hover:bg-slate-700 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

// ================================
// Confirm Modal
// ================================
function ConfirmModal({ onClose, data }: { onClose: () => void; data?: Record<string, unknown> }) {
  const title = (data?.title as string) || 'Confirmer';
  const message = (data?.message as string) || 'Êtes-vous sûr de vouloir continuer ?';
  const onConfirm = data?.onConfirm as (() => void) | undefined;

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-slate-100 mb-2">{title}</h2>
        <p className="text-slate-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-slate-800 text-slate-200 font-medium hover:bg-slate-700 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

