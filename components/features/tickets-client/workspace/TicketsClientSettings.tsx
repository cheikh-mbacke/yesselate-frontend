'use client';

import React, { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { useTicketsClientWorkspaceStore } from '@/lib/stores/ticketsClientWorkspaceStore';
import { cn } from '@/lib/utils';
import {
  Settings,
  User,
  Bell,
  Zap,
  Palette,
  Globe,
  Shield,
  HelpCircle,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  Save,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

// ============================================
// COMPONENT
// ============================================

export function TicketsClientSettingsModal({ open, onClose }: SettingsModalProps) {
  const { preferences, setPreference } = useTicketsClientWorkspaceStore();
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'apparence' | 'avance'>(
    'general'
  );

  const handleSave = () => {
    // Sauvegarder les préférences (déjà fait via setPreference)
    onClose();
  };

  return (
    <FluentModal
      open={open}
      title="Paramètres"
      onClose={onClose}
      className="max-w-4xl"
    >
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {[
              { id: 'general', label: 'Général', icon: Settings },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'apparence', label: 'Apparence', icon: Palette },
              { id: 'avance', label: 'Avancé', icon: Zap },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    activeTab === tab.id
                      ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {activeTab === 'general' && (
            <>
              {/* Auto-refresh */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    Auto-refresh
                  </div>
                  <div className="text-sm text-slate-500">
                    Actualiser automatiquement les données toutes les 60 secondes
                  </div>
                </div>
                <button
                  onClick={() => setPreference('autoRefresh', !preferences.autoRefresh)}
                  className={cn(
                    'w-12 h-6 rounded-full transition-colors',
                    preferences.autoRefresh
                      ? 'bg-emerald-500'
                      : 'bg-slate-200 dark:bg-slate-700'
                  )}
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                      preferences.autoRefresh ? 'translate-x-7' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>

              {/* Default view */}
              <div>
                <label className="font-medium text-slate-900 dark:text-slate-100 block mb-2">
                  Vue par défaut
                </label>
                <select
                  value={preferences.defaultView}
                  onChange={(e) =>
                    setPreference('defaultView', e.target.value as any)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-orange-500/30"
                >
                  <option value="list">Liste</option>
                  <option value="kanban">Kanban</option>
                  <option value="map">Carte</option>
                  <option value="timeline">Timeline</option>
                </select>
              </div>

              {/* Compact mode */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    Mode compact
                  </div>
                  <div className="text-sm text-slate-500">
                    Affichage plus dense des informations
                  </div>
                </div>
                <button
                  onClick={() => setPreference('compactMode', !preferences.compactMode)}
                  className={cn(
                    'w-12 h-6 rounded-full transition-colors',
                    preferences.compactMode
                      ? 'bg-emerald-500'
                      : 'bg-slate-200 dark:bg-slate-700'
                  )}
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                      preferences.compactMode ? 'translate-x-7' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>

              {/* Show closed tickets */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    Afficher les tickets clos
                  </div>
                  <div className="text-sm text-slate-500">
                    Inclure les tickets clôturés dans les listes
                  </div>
                </div>
                <button
                  onClick={() =>
                    setPreference('showClosedTickets', !preferences.showClosedTickets)
                  }
                  className={cn(
                    'w-12 h-6 rounded-full transition-colors',
                    preferences.showClosedTickets
                      ? 'bg-emerald-500'
                      : 'bg-slate-200 dark:bg-slate-700'
                  )}
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                      preferences.showClosedTickets ? 'translate-x-7' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
            </>
          )}

          {activeTab === 'notifications' && (
            <>
              {/* Sound */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    Notifications sonores
                  </div>
                  <div className="text-sm text-slate-500">
                    Émettre un son lors de nouvelles notifications
                  </div>
                </div>
                <button
                  onClick={() =>
                    setPreference('notifications', {
                      ...preferences.notifications,
                      sound: !preferences.notifications.sound,
                    })
                  }
                  className={cn(
                    'w-12 h-6 rounded-full transition-colors',
                    preferences.notifications.sound
                      ? 'bg-emerald-500'
                      : 'bg-slate-200 dark:bg-slate-700'
                  )}
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                      preferences.notifications.sound ? 'translate-x-7' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>

              {/* Desktop */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    Notifications bureau
                  </div>
                  <div className="text-sm text-slate-500">
                    Afficher les notifications du système d'exploitation
                  </div>
                </div>
                <button
                  onClick={() =>
                    setPreference('notifications', {
                      ...preferences.notifications,
                      desktop: !preferences.notifications.desktop,
                    })
                  }
                  className={cn(
                    'w-12 h-6 rounded-full transition-colors',
                    preferences.notifications.desktop
                      ? 'bg-emerald-500'
                      : 'bg-slate-200 dark:bg-slate-700'
                  )}
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                      preferences.notifications.desktop ? 'translate-x-7' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    Notifications email
                  </div>
                  <div className="text-sm text-slate-500">
                    Recevoir des emails pour les événements importants
                  </div>
                </div>
                <button
                  onClick={() =>
                    setPreference('notifications', {
                      ...preferences.notifications,
                      email: !preferences.notifications.email,
                    })
                  }
                  className={cn(
                    'w-12 h-6 rounded-full transition-colors',
                    preferences.notifications.email
                      ? 'bg-emerald-500'
                      : 'bg-slate-200 dark:bg-slate-700'
                  )}
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                      preferences.notifications.email ? 'translate-x-7' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
            </>
          )}

          {activeTab === 'apparence' && (
            <>
              {/* Theme */}
              <div>
                <label className="font-medium text-slate-900 dark:text-slate-100 block mb-2">
                  Thème
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'auto', label: 'Automatique' },
                    { value: 'light', label: 'Clair' },
                    { value: 'dark', label: 'Sombre' },
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => setPreference('theme', theme.value as any)}
                      className={cn(
                        'p-4 rounded-lg border text-center transition-all',
                        preferences.theme === theme.value
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      )}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'avance' && (
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-2">
                <HelpCircle className="w-5 h-5" />
                <span className="font-medium">Paramètres avancés</span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Configuration des règles SLA, escalades automatiques, et intégrations
                tierces à venir dans une prochaine version.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <FluentButton variant="secondary" onClick={onClose}>
          Annuler
        </FluentButton>
        <FluentButton variant="primary" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Enregistrer
        </FluentButton>
      </div>
    </FluentModal>
  );
}

