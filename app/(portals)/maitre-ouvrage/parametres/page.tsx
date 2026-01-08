'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { defaultUserSettings } from '@/lib/data';

// =========================
// PERFORMANCE + ÉTAT OPTIMISÉ
// =========================
const useOptimizedSettings = (initial: typeof defaultUserSettings) => {
  const [profile, setProfile] = useState(initial.profile);
  const [preferences, setPreferences] = useState(initial.preferences);
  const [notifications, setNotifications] = useState(initial.notifications);
  const [security, setSecurity] = useState(initial.security);

  return {
    profile, setProfile,
    preferences, setPreferences,
    notifications, setNotifications,
    security, setSecurity,
    all: useMemo(() => ({ 
      userId: initial.userId,
      profile, 
      preferences, 
      notifications, 
      security 
    }), [profile, preferences, notifications, security, initial.userId])
  };
};

// =========================
// INNOVATION : IA PRÉDICTIVE
// =========================
const useAISuggestions = (profile: any, preferences: any, security: any) => {
  return useMemo(() => {
    const suggestions = [];

    // Langue → Si rôle = "BMO", suggère anglais (standards internationaux)
    if (profile.role?.toLowerCase() === 'bmo' && preferences.language === 'fr') {
      suggestions.push({
        type: 'language',
        message: '💡 En tant que BMO, basculez vers l\'anglais pour les rapports DG',
        action: 'switchToEnglish',
        severity: 'info'
      });
    }

    // Devise → Si FCFA mais bureau à l'étranger
    if (preferences.currency === 'FCFA' && profile.bureau === 'PARIS') {
      suggestions.push({
        type: 'currency',
        message: '💡 Bureau Paris détecté — basculer vers EUR ?',
        action: 'switchToEUR',
        severity: 'warning'
      });
    }

    // Sécurité → 2FA non activé pour rôle sensible
    if (!security.twoFactorEnabled && ['bmo', 'dg'].includes(profile.role?.toLowerCase() || '')) {
      suggestions.push({
        type: 'security',
        message: '🔐 Rôle sensible détecté — activez l\'authentification à 2 facteurs',
        action: 'enable2FA',
        severity: 'urgent'
      });
    }

    return suggestions;
  }, [profile, preferences, security.twoFactorEnabled]);
};

// =========================
// INNOVATION : EXPORT DE TRAÇABILITÉ
// =========================
const exportSettingsAudit = (
  settings: typeof defaultUserSettings,
  addToast: (msg: string, variant?: 'success' | 'warning' | 'info' | 'error') => void
) => {
  const headers = ['Paramètre', 'Ancienne valeur', 'Nouvelle valeur', 'Date', 'Rôle RACI', 'Hash'];
  const rows = [
    ['Langue', 'fr', settings.preferences.language, new Date().toISOString(), 'Responsible', 'SHA3-256:...'],
    ['Devise', 'FCFA', settings.preferences.currency, new Date().toISOString(), 'Responsible', 'SHA3-256:...'],
    ['2FA', 'false', settings.security.twoFactorEnabled.toString(), new Date().toISOString(), 'Accountable', 'SHA3-256:...'],
  ];

  const csv = [headers, ...rows].map(r => r.join(';')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit_parametres_${settings.userId}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  addToast('✅ Audit des paramètres exporté', 'success');
};

// =========================
// COMPOSANT PRINCIPAL
// =========================
export default function ParametresPage() {
  const { darkMode, toggleDarkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  // Utilisateur actuel (simulé - normalement depuis auth)
  const currentUser = {
    id: 'USR-001',
    name: 'A. DIALLO',
    role: 'bmo', // ou 'bm' selon le contexte
    bureau: 'BMO',
  };
  
  const {
    profile, setProfile,
    preferences, setPreferences,
    notifications, setNotifications,
    security, setSecurity,
    all: settings
  } = useOptimizedSettings(defaultUserSettings);

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'security'>('profile');

  // =========================
  // INNOVATION : SUGGESTIONS IA
  // =========================
  const aiSuggestions = useAISuggestions(profile, preferences, security);

  // =========================
  // PERFORMANCE : Éviter les re-rendus
  // =========================
  const handleSave = useCallback(() => {
    // Log avec rôle RACI
    addActionLog({
      userId: settings.userId || currentUser.id,
      userName: `${profile.firstName} ${profile.lastName}`,
      userRole: profile.role,
      action: 'modification',
      module: 'parametres',
      targetType: 'Paramètres utilisateur',
      targetLabel: 'Mise à jour des paramètres',
      details: `Modification - Onglet: ${activeTab}`,
      bureau: profile.bureau,
    });
    
    addToast(`✅ Paramètres sauvegardés — Rôle: ${profile.role?.toLowerCase() === 'bmo' ? 'Accountable' : 'Responsible'}`, 'success');
  }, [profile, activeTab, addActionLog, addToast, currentUser.id]);

  // =========================
  // INNOVATION : SÉCURITÉ PROACTIVE
  // =========================
  useEffect(() => {
    if (security.twoFactorEnabled && profile.role?.toLowerCase() === 'bmo') {
      addActionLog({
        userId: settings.userId || currentUser.id,
        userName: `${profile.firstName} ${profile.lastName}`,
        userRole: profile.role,
        action: 'modification', // Mapping vers ActionLogType valide
        module: 'parametres',
        targetType: 'Sécurité',
        targetLabel: '2FA activé',
        details: 'Protection renforcée pour compte BMO',
        bureau: profile.bureau,
      });
    }
  }, [security.twoFactorEnabled, profile, addActionLog, currentUser.id]);

  const tabs = [
    { id: 'profile', label: 'Profil', icon: '👤' },
    { id: 'preferences', label: 'Préférences', icon: '🎨' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Sécurité', icon: '🔒' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
            ⚙️ Paramétrage
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Gérez vos informations de compte et préférences
          </p>
        </div>
        <Button onClick={handleSave} className="w-full sm:w-auto">
          💾 Sauvegarder
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 sm:gap-2 border-b border-slate-700 pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              'px-3 sm:px-4 py-2 rounded-t-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0',
              activeTab === tab.id
                ? 'bg-amber-500/15 text-amber-300 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            )}
          >
            <span className="mr-1 sm:mr-2">{tab.icon}</span>
            <span className="hidden xs:inline">{tab.label}</span>
            <span className="xs:hidden">{tab.icon}</span>
          </button>
        ))}
      </div>

      {/* Contenu des tabs */}
      <div className="grid lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {/* Tab Profil */}
          {activeTab === 'profile' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Informations personnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-400/80 to-amber-500/60 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white flex-shrink-0">
                      {settings.profile.firstName[0]}{settings.profile.lastName[0]}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-bold text-base sm:text-lg">
                        {settings.profile.firstName} {settings.profile.lastName}
                      </h3>
                      <p className="text-xs sm:text-sm text-amber-300/80">{settings.profile.role}</p>
                      <Badge variant="info" className="mt-1">{settings.profile.bureau}</Badge>
                    </div>
                    <Button size="sm" variant="secondary" className="w-full sm:w-auto">
                      📷 Changer photo
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Prénom</label>
                      <Input
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Nom</label>
                      <Input
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Email</label>
                      <Input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Téléphone</label>
                      <Input
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Informations professionnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Rôle</label>
                      <Input value={settings.profile.role} disabled />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Le rôle est défini par l&apos;administrateur
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Bureau</label>
                      <Input value={settings.profile.bureau} disabled />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Le bureau est défini par l&apos;administrateur
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Tab Préférences */}
          {activeTab === 'preferences' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Affichage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                    <div>
                      <p className="font-medium text-sm">Mode sombre</p>
                      <p className="text-xs text-slate-400">Activer le thème sombre</p>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className={cn(
                        'w-12 h-6 rounded-full transition-all relative',
                        darkMode ? 'bg-amber-400/70' : 'bg-slate-600'
                      )}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all',
                          darkMode ? 'left-6' : 'left-0.5'
                        )}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                    <div>
                      <p className="font-medium text-sm">Mode compact</p>
                      <p className="text-xs text-slate-400">Réduire l&apos;espacement des éléments</p>
                    </div>
                    <button
                      onClick={() => setPreferences({ ...preferences, compactMode: !preferences.compactMode })}
                      className={cn(
                        'w-12 h-6 rounded-full transition-all relative',
                        settings.preferences.compactMode ? 'bg-amber-400/70' : 'bg-slate-600'
                      )}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all',
                          settings.preferences.compactMode ? 'left-6' : 'left-0.5'
                        )}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                    <div>
                      <p className="font-medium text-sm">Sidebar réduite par défaut</p>
                      <p className="text-xs text-slate-400">Afficher la sidebar en mode icônes</p>
                    </div>
                    <button
                      onClick={() => setPreferences({ ...preferences, sidebarCollapsed: !preferences.sidebarCollapsed })}
                      className={cn(
                        'w-12 h-6 rounded-full transition-all relative',
                        settings.preferences.sidebarCollapsed ? 'bg-amber-400/70' : 'bg-slate-600'
                      )}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all',
                          settings.preferences.sidebarCollapsed ? 'left-6' : 'left-0.5'
                        )}
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Formats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Langue</label>
                      <select
                        value={preferences.language}
                        onChange={(e) => setPreferences({ ...preferences, language: e.target.value as 'fr' | 'en' })}
                        className="w-full p-2 rounded-lg bg-slate-700 border border-slate-600 text-sm"
                      >
                        <option value="fr">🇫🇷 Français</option>
                        <option value="en">🇬🇧 English</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Fuseau horaire</label>
                      <select
                        value={preferences.timezone}
                        onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                        className="w-full p-2 rounded-lg bg-slate-700 border border-slate-600 text-sm"
                      >
                        <option value="Africa/Dakar">Africa/Dakar (GMT+0)</option>
                        <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Format de date</label>
                      <select
                        value={preferences.dateFormat}
                        onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value as 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' })}
                        className="w-full p-2 rounded-lg bg-slate-700 border border-slate-600 text-sm"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Devise</label>
                      <select
                        value={preferences.currency}
                        onChange={(e) => setPreferences({ ...preferences, currency: e.target.value as 'FCFA' | 'EUR' | 'USD' })}
                        className="w-full p-2 rounded-lg bg-slate-700 border border-slate-600 text-sm"
                      >
                        <option value="FCFA">FCFA</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Tab Notifications */}
          {activeTab === 'notifications' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Canaux de notification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'email', label: 'Email', desc: 'Recevoir les notifications par email', icon: '📧' },
                    { key: 'push', label: 'Push', desc: 'Notifications push dans le navigateur', icon: '🔔' },
                    { key: 'sms', label: 'SMS', desc: 'Recevoir les alertes urgentes par SMS', icon: '📱' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-slate-400">{item.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setNotifications({
                          ...notifications,
                          [item.key]: !notifications[item.key as keyof typeof notifications]
                        })}
                        className={cn(
                          'w-12 h-6 rounded-full transition-all relative',
                          notifications[item.key as keyof typeof notifications] ? 'bg-orange-500' : 'bg-slate-600'
                        )}
                      >
                        <div
                          className={cn(
                            'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all',
                            notifications[item.key as keyof typeof notifications] ? 'left-6' : 'left-0.5'
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </CardContent>
            </Card>
            </>
          )}

          {/* Tab Sécurité */}
          {activeTab === 'security' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Mot de passe</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-slate-700/30 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Dernière modification</p>
                      <p className="text-xs text-slate-400">{security.lastPasswordChange}</p>
                    </div>
                    <Button size="sm" variant="secondary">
                      🔑 Modifier
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className={cn("transition-all", security.twoFactorEnabled ? "border-emerald-500/30" : "border-amber-500/30")}>
                <CardHeader>
                  <CardTitle className="text-sm">Authentification à deux facteurs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                    <div>
                      <p className="font-medium text-sm">2FA {security.twoFactorEnabled ? 'activé' : 'désactivé'}</p>
                      <p className="text-xs text-slate-400">
                        {security.twoFactorEnabled ? 'Compte protégé' : 'Risque élevé pour rôle BMO'}
                      </p>
                    </div>
                    <button
                      onClick={() => setSecurity({ ...security, twoFactorEnabled: !security.twoFactorEnabled })}
                      className={cn(
                        'w-12 h-6 rounded-full transition-all relative',
                        security.twoFactorEnabled ? 'bg-emerald-500' : 'bg-amber-600'
                      )}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all',
                          security.twoFactorEnabled ? 'left-6' : 'left-0.5'
                        )}
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Colonne latérale — enrichie */}
        <div className="space-y-4">
          <Card className="border-orange-500/30">
            <CardHeader>
              <CardTitle className="text-sm">💡 Aide Contextuelle</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-400 space-y-2">
              <p>Modifications sauvegardées avec <strong>traçabilité RACI</strong>.</p>
              <p><Badge variant="success">BMO = Accountable</Badge> → responsable final</p>
              <p><Badge variant="default">BM = Responsible</Badge> → exécutant</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">📊 Activité du compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Rôle actuel</span>
                <Badge variant={currentUser.role === 'bmo' ? 'success' : 'default'}>
                  {currentUser.role === 'bmo' ? 'BMO (A)' : 'BM (R)'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hash actuel</span>
                <code className="text-[10px]">SHA3-256:...</code>
              </div>
            </CardContent>
          </Card>

          {aiSuggestions.length > 0 && (
            <Card className="border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-sm text-amber-400">🧠 IA Prédictive</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                {aiSuggestions.map((s, i) => (
                  <div key={i} className="p-2 bg-amber-500/10 rounded">
                    <p>{s.message}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
