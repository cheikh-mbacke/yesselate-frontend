/**
 * Modales du Analytics Command Center
 * Toutes les modales : stats, export, report, alert-config, kpi-detail, alert-detail, shortcuts, help, confirm
 */

'use client';

import React from 'react';
import { useAnalyticsCommandCenterStore } from '@/lib/stores/analyticsCommandCenterStore';
import { AnalyticsStatsModal } from '../workspace/AnalyticsStatsModal';
import { AnalyticsExportModal } from '../workspace/AnalyticsExportModal';
import { AnalyticsReportModal } from '../workspace/AnalyticsReportModal';
import { AnalyticsAlertConfigModal } from '../workspace/AnalyticsAlertConfigModal';
import { KPIDetailModal } from '../workspace/KPIDetailModal';
import { AlertDetailModal } from '../workspace/AlertDetailModal';

export function AnalyticsModals() {
  const { modal, closeModal } = useAnalyticsCommandCenterStore();

  if (!modal.isOpen || !modal.type) return null;

  // Stats Modal
  if (modal.type === 'stats') {
    return <AnalyticsStatsModal open={true} onClose={closeModal} />;
  }

  // Export Modal
  if (modal.type === 'export') {
    return <AnalyticsExportModal open={true} onClose={closeModal} />;
  }

  // Report Modal
  if (modal.type === 'report') {
    return <AnalyticsReportModal open={true} onClose={closeModal} />;
  }

  // Alert Config Modal
  if (modal.type === 'alert-config') {
    return <AnalyticsAlertConfigModal open={true} onClose={closeModal} />;
  }

  // KPI Detail Modal
  if (modal.type === 'kpi-detail') {
    return (
      <KPIDetailModal
        open={true}
        onClose={closeModal}
        kpiId={(modal.data?.kpiId as string) || null}
      />
    );
  }

  // Alert Detail Modal
  if (modal.type === 'alert-detail') {
    return (
      <AlertDetailModal
        open={true}
        onClose={closeModal}
        alertId={(modal.data?.alertId as string) || null}
      />
    );
  }

  // Shortcuts Modal
  if (modal.type === 'shortcuts') {
    return <ShortcutsModal onClose={closeModal} />;
  }

  // Help Modal
  if (modal.type === 'help') {
    return <HelpModal onClose={closeModal} />;
  }

  // Settings Modal
  if (modal.type === 'settings') {
    return <SettingsModal onClose={closeModal} />;
  }

  // Comparison Modal
  if (modal.type === 'comparison') {
    return <ComparisonModal onClose={closeModal} data={modal.data} />;
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
            <span className="text-2xl">❓</span>
            Aide - Analytics
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
              Utilisez la sidebar pour naviguer entre les différentes catégories d'analytics. Les
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
              Utilisez les filtres avancés pour affiner vos analyses par catégorie, bureau, période,
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
// Settings Modal
// ================================
function SettingsModal({ onClose }: { onClose: () => void }) {
  const { kpiConfig, setKPIConfig } = useAnalyticsCommandCenterStore();
  const [settings, setSettings] = React.useState({
    autoRefresh: kpiConfig.autoRefresh,
    refreshInterval: kpiConfig.refreshInterval,
    theme: 'dark',
    language: 'fr',
  });

  const handleSave = () => {
    setKPIConfig({
      autoRefresh: settings.autoRefresh,
      refreshInterval: settings.refreshInterval,
      visible: kpiConfig.visible,
      collapsed: kpiConfig.collapsed,
    });
    onClose();
  };

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
            <span className="text-2xl">⚙️</span>
            Paramètres Analytics
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 text-sm">
          {/* Auto Refresh */}
          <div>
            <h3 className="font-semibold text-slate-200 mb-3">Actualisation automatique</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoRefresh}
                  onChange={(e) =>
                    setSettings({ ...settings, autoRefresh: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-slate-300">Activer l'actualisation automatique</span>
              </label>
              {settings.autoRefresh && (
                <div className="ml-7">
                  <label className="block text-slate-400 mb-2">Intervalle (secondes)</label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    step="5"
                    value={settings.refreshInterval}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        refreshInterval: parseInt(e.target.value) || 30,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h3 className="font-semibold text-slate-200 mb-3">Préférences</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-2">Thème</label>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="dark">Sombre</option>
                  <option value="light">Clair</option>
                  <option value="auto">Automatique</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-2">Langue</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

// ================================
// Comparison Modal
// ================================
function ComparisonModal({
  onClose,
  data,
}: {
  onClose: () => void;
  data?: Record<string, unknown>;
}) {
  const comparisonType = (data?.type as 'bureaux' | 'periods') || 'bureaux';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700/50 bg-slate-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
            <span className="text-2xl">📊</span>
            Comparaison
            {comparisonType === 'bureaux' ? ' des Bureaux' : ' des Périodes'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
          >
            ×
          </button>
        </div>

        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            Fonctionnalité de comparaison en développement
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 font-medium hover:bg-slate-700 transition-colors"
          >
            Fermer
          </button>
        </div>
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

