/**
 * Modales du Échanges Inter-Bureaux Command Center
 * Orchestrateur pour toutes les modales : stats, export, exchange-detail, filters, settings, shortcuts, help, confirm
 */

'use client';

import React from 'react';
import { useEchangesBureauxCommandCenterStore } from '@/lib/stores/echangesBureauxCommandCenterStore';
import { EchangesStatsModal } from '@/components/features/bmo/workspace/echanges';
import { ExchangeDetailModal } from '@/components/features/bmo/echanges/workspace/ExchangeDetailModal';

export function EchangesModals() {
  const { modal, closeModal } = useEchangesBureauxCommandCenterStore();

  if (!modal.isOpen || !modal.type) return null;

  // Stats Modal
  if (modal.type === 'stats') {
    return <EchangesStatsModal open={true} onClose={closeModal} />;
  }

  // Exchange Detail Modal
  if (modal.type === 'exchange-detail') {
    return (
      <ExchangeDetailModal
        open={true}
        onClose={closeModal}
        exchangeId={(modal.data?.exchangeId as string) || null}
      />
    );
  }

  // Export Modal (placeholder)
  if (modal.type === 'export') {
    return <ExportModal open={true} onClose={closeModal} />;
  }

  // Settings Modal (placeholder)
  if (modal.type === 'settings') {
    return <SettingsModal open={true} onClose={closeModal} />;
  }

  // Shortcuts Modal (placeholder)
  if (modal.type === 'shortcuts') {
    return <ShortcutsModal open={true} onClose={closeModal} />;
  }

  // Help Modal (placeholder)
  if (modal.type === 'help') {
    return <HelpModal open={true} onClose={closeModal} />;
  }

  // Confirm Modal (placeholder)
  if (modal.type === 'confirm') {
    return (
      <ConfirmModal
        open={true}
        onClose={closeModal}
        title={modal.data?.title as string}
        message={modal.data?.message as string}
        onConfirm={modal.data?.onConfirm as (() => void) | undefined}
      />
    );
  }

  return null;
}

// ================================
// Placeholder Modals (à implémenter)
// ================================

function ExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-slate-700/50 bg-slate-900 p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-slate-100 mb-4">Exporter les échanges</h2>
        <p className="text-slate-400 mb-4">Fonctionnalité en cours de développement</p>
        <button onClick={onClose} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white">
          Fermer
        </button>
      </div>
    </div>
  );
}

function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-slate-700/50 bg-slate-900 p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-slate-100 mb-4">Paramètres</h2>
        <p className="text-slate-400 mb-4">Fonctionnalité en cours de développement</p>
        <button onClick={onClose} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white">
          Fermer
        </button>
      </div>
    </div>
  );
}

function ShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  const shortcuts = [
    { key: '⌘K', label: 'Ouvrir la recherche' },
    { key: '⌘B', label: 'Masquer/Afficher la sidebar' },
    { key: 'F11', label: 'Mode plein écran' },
    { key: 'Alt+←', label: 'Retour' },
    { key: '⌘E', label: 'Exporter' },
    { key: '⌘F', label: 'Filtres' },
    { key: '⌘I', label: 'Statistiques' },
    { key: '?', label: 'Aide' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl border border-slate-700/50 bg-slate-900 p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-slate-100 mb-4">Raccourcis clavier</h2>
        <div className="space-y-2">
          {shortcuts.map(shortcut => (
            <div key={shortcut.key} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <span className="text-slate-300">{shortcut.label}</span>
              <kbd className="px-2 py-1 rounded bg-slate-700 text-slate-300 text-sm font-mono">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white">
          Fermer
        </button>
      </div>
    </div>
  );
}

function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl border border-slate-700/50 bg-slate-900 p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-slate-100 mb-4">Aide</h2>
        <div className="space-y-4 text-slate-400">
          <p>
            Cette section vous permet de gérer les échanges inter-bureaux de votre organisation.
          </p>
          <div>
            <h3 className="text-slate-300 font-semibold mb-2">Fonctionnalités principales :</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Consulter et gérer les échanges entre bureaux</li>
              <li>Suivre le statut et la priorité des échanges</li>
              <li>Répondre et échanger avec les autres bureaux</li>
              <li>Consulter l'historique et la timeline</li>
              <li>Gérer les documents et pièces jointes</li>
            </ul>
          </div>
        </div>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white">
          Fermer
        </button>
      </div>
    </div>
  );
}

function ConfirmModal({
  open,
  onClose,
  title,
  message,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  onConfirm?: () => void;
}) {
  if (!open) return null;

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900 p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-slate-100 mb-4">{title || 'Confirmation'}</h2>
        <p className="text-slate-400 mb-6">{message || 'Êtes-vous sûr de vouloir continuer ?'}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800">
            Annuler
          </button>
          <button onClick={handleConfirm} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white">
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

