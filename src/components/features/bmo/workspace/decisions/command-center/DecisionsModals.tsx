/**
 * Modales du Decisions Command Center
 * Toutes les modales : stats, export, decision-detail, filters, settings, shortcuts, help, confirm
 */

'use client';

import React from 'react';
import { useDecisionsCommandCenterStore } from '@/lib/stores/decisionsCommandCenterStore';
import { DecisionsStatsModal } from '../DecisionsStatsModal';
import { DecisionDetailModal } from '../DecisionDetailModal';

export function DecisionsModals() {
  const { modal, closeModal } = useDecisionsCommandCenterStore();

  if (!modal.isOpen || !modal.type) return null;

  // Stats Modal
  if (modal.type === 'stats') {
    return <DecisionsStatsModal open={true} onClose={closeModal} />;
  }

  // Export Modal
  if (modal.type === 'export') {
    return <ExportModal onClose={closeModal} data={modal.data} />;
  }

  // Decision Detail Modal
  if (modal.type === 'decision-detail') {
    return (
      <DecisionDetailModal
        isOpen={true}
        onClose={closeModal}
        decisionId={(modal.data?.decisionId as string) || null}
        onNext={modal.data?.onNext as (() => void) | undefined}
        onPrevious={modal.data?.onPrevious as (() => void) | undefined}
        hasNext={modal.data?.hasNext as boolean | undefined}
        hasPrevious={modal.data?.hasPrevious as boolean | undefined}
      />
    );
  }

  // Filters Modal
  if (modal.type === 'filters') {
    return <FiltersModal onClose={closeModal} />;
  }

  // Settings Modal
  if (modal.type === 'settings') {
    return <SettingsModal onClose={closeModal} />;
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
// Export Modal
// ================================
function ExportModal({ onClose, data }: { onClose: () => void; data?: Record<string, unknown> }) {
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
          <h2 className="text-lg font-bold text-slate-100">Exporter les décisions</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
          >
            ×
          </button>
        </div>
        <p className="text-slate-400 mb-4">Fonctionnalité d'export en cours de développement</p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 rounded-lg bg-slate-800 text-slate-200 font-medium hover:bg-slate-700 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}


// ================================
// Filters Modal
// ================================
function FiltersModal({ onClose }: { onClose: () => void }) {
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
          <h2 className="text-lg font-bold text-slate-100">Filtres avancés</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
          >
            ×
          </button>
        </div>
        <p className="text-slate-400 mb-4">Fonctionnalité de filtres en cours de développement</p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 rounded-lg bg-slate-800 text-slate-200 font-medium hover:bg-slate-700 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

// ================================
// Settings Modal
// ================================
function SettingsModal({ onClose }: { onClose: () => void }) {
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
          <h2 className="text-lg font-bold text-slate-100">Paramètres</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
          >
            ×
          </button>
        </div>
        <p className="text-slate-400 mb-4">Fonctionnalité de paramètres en cours de développement</p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 rounded-lg bg-slate-800 text-slate-200 font-medium hover:bg-slate-700 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

// ================================
// Shortcuts Modal
// ================================
function ShortcutsModal({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    { key: '⌘K', label: 'Palette de commandes' },
    { key: '⌘B', label: 'Afficher/Masquer sidebar' },
    { key: '⌘R', label: 'Rafraîchir' },
    { key: '⌘I', label: 'Statistiques' },
    { key: 'F11', label: 'Plein écran' },
    { key: 'Alt+←', label: 'Retour' },
    { key: 'Esc', label: 'Fermer les modales' },
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
        className="w-full max-w-lg rounded-2xl border border-slate-700/50 bg-slate-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-100">Aide</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
          >
            ×
          </button>
        </div>
        <p className="text-slate-400 mb-4">Centre d'aide en cours de développement</p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 rounded-lg bg-slate-800 text-slate-200 font-medium hover:bg-slate-700 transition-colors"
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
  const handleConfirm = () => {
    if (data?.onConfirm) {
      (data.onConfirm as () => void)();
    }
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-100">
            {(data?.title as string) || 'Confirmer'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
          >
            ×
          </button>
        </div>
        <p className="text-slate-400 mb-6">
          {(data?.message as string) || 'Êtes-vous sûr de vouloir continuer ?'}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-slate-800 text-slate-200 font-medium hover:bg-slate-700 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 transition-colors"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

