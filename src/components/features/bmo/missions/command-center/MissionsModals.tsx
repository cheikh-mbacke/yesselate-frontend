/**
 * Modales du Missions Command Center
 * Toutes les modales : stats, export, mission-detail, create-mission, edit-mission, shortcuts, help, confirm
 */

'use client';

import React from 'react';
import { useMissionsCommandCenterStore } from '@/lib/stores/missionsCommandCenterStore';
import { MissionsStatsModal } from '@/components/features/bmo/workspace/missions/MissionsStatsModal';

export function MissionsModals() {
  const { modal, closeModal } = useMissionsCommandCenterStore();

  if (!modal.isOpen || !modal.type) return null;

  // Stats Modal
  if (modal.type === 'stats') {
    return <MissionsStatsModal open={true} onClose={closeModal} />;
  }

  // Export Modal
  if (modal.type === 'export') {
    return <ExportModal onClose={closeModal} />;
  }

  // Mission Detail Modal
  if (modal.type === 'mission-detail') {
    return <MissionDetailModal onClose={closeModal} missionId={modal.data?.missionId as string} />;
  }

  // Create Mission Modal
  if (modal.type === 'create-mission') {
    return <CreateMissionModal onClose={closeModal} />;
  }

  // Edit Mission Modal
  if (modal.type === 'edit-mission') {
    return <EditMissionModal onClose={closeModal} missionId={modal.data?.missionId as string} />;
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
function ExportModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-slate-100 mb-4">Exporter les missions</h2>
        <p className="text-slate-400 mb-6">Fonctionnalité en développement</p>
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
// Mission Detail Modal
// ================================
function MissionDetailModal({ onClose, missionId }: { onClose: () => void; missionId?: string }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-700/50 bg-slate-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-slate-100 mb-4">Détail de la mission</h2>
        <p className="text-slate-400 mb-6">Mission ID: {missionId || 'N/A'}</p>
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
// Create Mission Modal
// ================================
function CreateMissionModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-700/50 bg-slate-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-slate-100 mb-4">Créer une mission</h2>
        <p className="text-slate-400 mb-6">Formulaire en développement</p>
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
// Edit Mission Modal
// ================================
function EditMissionModal({ onClose, missionId }: { onClose: () => void; missionId?: string }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-700/50 bg-slate-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-slate-100 mb-4">Modifier la mission</h2>
        <p className="text-slate-400 mb-6">Mission ID: {missionId || 'N/A'}</p>
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
    { key: '⌘F', label: 'Filtres avancés' },
    { key: '⌘E', label: 'Exporter' },
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
            <span className="text-2xl">❓</span>
            Aide - Missions
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 text-sm">
          <div>
            <h3 className="font-semibold text-slate-200 mb-2">Navigation</h3>
            <p className="text-slate-400">
              Utilisez la sidebar pour naviguer entre les différentes catégories de missions. Les
              sous-onglets permettent d'affiner votre vue.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-200 mb-2">KPIs</h3>
            <p className="text-slate-400">
              La barre de KPIs affiche 8 indicateurs clés en temps réel. Cliquez sur un KPI pour
              voir les détails.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-200 mb-2">Filtres</h3>
            <p className="text-slate-400">
              Utilisez les filtres avancés pour affiner vos analyses par région, statut, priorité,
              etc.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-200 mb-2">Export</h3>
            <p className="text-slate-400">
              Exportez vos données en CSV, JSON, Excel ou PDF pour une analyse approfondie.
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
function ConfirmModal({
  onClose,
  data,
}: {
  onClose: () => void;
  data: Record<string, unknown>;
}) {
  const [loading, setLoading] = React.useState(false);

  const title = (data.title as string) || "Confirmer l'action";
  const message = (data.message as string) || 'Êtes-vous sûr de vouloir continuer ?';
  const confirmText = (data.confirmText as string) || 'Confirmer';
  const cancelText = (data.cancelText as string) || 'Annuler';
  const onConfirm = data.onConfirm as (() => Promise<void> | void) | undefined;
  const variant = ((data.variant as 'danger' | 'warning' | 'default') || 'default') as
    | 'danger'
    | 'warning'
    | 'default';

  const handleConfirm = async () => {
    if (onConfirm) {
      setLoading(true);
      try {
        await onConfirm();
      } finally {
        setLoading(false);
      }
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
        <h2 className="text-lg font-bold text-slate-100 mb-2">{title}</h2>
        <p className="text-slate-400 mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : variant === 'warning'
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Traitement...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
