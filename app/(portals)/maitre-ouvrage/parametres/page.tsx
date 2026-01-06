'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { defaultUserSettings } from '@/lib/data';

export default function ParametresPage() {
  const { darkMode, toggleDarkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  
  // État local pour les paramètres (en attendant une vraie API)
  const [settings, setSettings] = useState(defaultUserSettings);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'security'>('profile');

  const handleSave = () => {
    // Log de l'action
    addActionLog({
      userId: settings.userId,
      userName: `${settings.profile.firstName} ${settings.profile.lastName}`,
      userRole: settings.profile.role,
      action: 'modification',
      module: 'parametres',
      targetType: 'Paramètres utilisateur',
      targetLabel: 'Mise à jour des paramètres',
      details: `Modification des paramètres - Onglet: ${activeTab}`,
      bureau: settings.profile.bureau,
    });
    
    addToast('Paramètres sauvegardés avec succès', 'success');
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: '👤' },
    { id: 'preferences', label: 'Préférences', icon: '🎨' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Sécurité', icon: '🔒' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            ⚙️ Paramétrage
          </h1>
          <p className="text-sm text-slate-400">
            Gérez vos informations de compte et préférences
          </p>
        </div>
        <Button onClick={handleSave}>
          💾 Sauvegarder
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              'px-4 py-2 rounded-t-lg text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-orange-500/20 text-orange-400 border-b-2 border-orange-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            )}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu des tabs */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab Profil */}
          {activeTab === 'profile' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Informations personnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-3xl font-bold text-white">
                      {settings.profile.firstName[0]}{settings.profile.lastName[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        {settings.profile.firstName} {settings.profile.lastName}
                      </h3>
                      <p className="text-sm text-orange-400">{settings.profile.role}</p>
                      <Badge variant="info" className="mt-1">{settings.profile.bureau}</Badge>
                    </div>
                    <Button size="sm" variant="secondary" className="ml-auto">
                      📷 Changer photo
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Prénom</label>
                      <Input
                        value={settings.profile.firstName}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: { ...settings.profile, firstName: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Nom</label>
                      <Input
                        value={settings.profile.lastName}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: { ...settings.profile, lastName: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Email</label>
                      <Input
                        type="email"
                        value={settings.profile.email}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: { ...settings.profile, email: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Téléphone</label>
                      <Input
                        value={settings.profile.phone}
                        onChange={(e) => setSettings({
                          ...settings,
                          profile: { ...settings.profile, phone: e.target.value }
                        })}
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
                        darkMode ? 'bg-orange-500' : 'bg-slate-600'
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
                      onClick={() => setSettings({
                        ...settings,
                        preferences: { ...settings.preferences, compactMode: !settings.preferences.compactMode }
                      })}
                      className={cn(
                        'w-12 h-6 rounded-full transition-all relative',
                        settings.preferences.compactMode ? 'bg-orange-500' : 'bg-slate-600'
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
                      onClick={() => setSettings({
                        ...settings,
                        preferences: { ...settings.preferences, sidebarCollapsed: !settings.preferences.sidebarCollapsed }
                      })}
                      className={cn(
                        'w-12 h-6 rounded-full transition-all relative',
                        settings.preferences.sidebarCollapsed ? 'bg-orange-500' : 'bg-slate-600'
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
                        value={settings.preferences.language}
                        onChange={(e) => setSettings({
                          ...settings,
                          preferences: { ...settings.preferences, language: e.target.value as 'fr' | 'en' }
                        })}
                        className="w-full p-2 rounded-lg bg-slate-700 border border-slate-600 text-sm"
                      >
                        <option value="fr">🇫🇷 Français</option>
                        <option value="en">🇬🇧 English</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Fuseau horaire</label>
                      <select
                        value={settings.preferences.timezone}
                        onChange={(e) => setSettings({
                          ...settings,
                          preferences: { ...settings.preferences, timezone: e.target.value }
                        })}
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
                        value={settings.preferences.dateFormat}
                        onChange={(e) => setSettings({
                          ...settings,
                          preferences: { ...settings.preferences, dateFormat: e.target.value as 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' }
                        })}
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
                        value={settings.preferences.currency}
                        onChange={(e) => setSettings({
                          ...settings,
                          preferences: { ...settings.preferences, currency: e.target.value as 'FCFA' | 'EUR' | 'USD' }
                        })}
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
                        onClick={() => setSettings({
                          ...settings,
                          notifications: { 
                            ...settings.notifications, 
                            [item.key]: !settings.notifications[item.key as keyof typeof settings.notifications] 
                          }
                        })}
                        className={cn(
                          'w-12 h-6 rounded-full transition-all relative',
                          settings.notifications[item.key as keyof typeof settings.notifications] ? 'bg-orange-500' : 'bg-slate-600'
                        )}
                      >
                        <div
                          className={cn(
                            'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all',
                            settings.notifications[item.key as keyof typeof settings.notifications] ? 'left-6' : 'left-0.5'
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Catégories de notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { key: 'validations', label: 'Validations', desc: 'BC, factures, contrats' },
                    { key: 'blocages', label: 'Blocages', desc: 'Dossiers bloqués, substitutions' },
                    { key: 'budgets', label: 'Budgets', desc: 'Alertes de dépassement' },
                    { key: 'rh', label: 'RH', desc: 'Demandes RH, congés' },
                    { key: 'litiges', label: 'Litiges', desc: 'Contentieux, recouvrements' },
                  ].map((cat) => (
                    <div key={cat.key} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/30">
                      <div>
                        <p className="text-sm font-medium">{cat.label}</p>
                        <p className="text-[10px] text-slate-400">{cat.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.categories[cat.key as keyof typeof settings.notifications.categories]}
                        onChange={() => setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            categories: {
                              ...settings.notifications.categories,
                              [cat.key]: !settings.notifications.categories[cat.key as keyof typeof settings.notifications.categories]
                            }
                          }
                        })}
                        className="w-5 h-5 rounded accent-orange-500"
                      />
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
                      <p className="text-xs text-slate-400">{settings.security.lastPasswordChange}</p>
                    </div>
                    <Button size="sm" variant="secondary">
                      🔑 Modifier
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Nouveau mot de passe</label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Confirmer</label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Authentification à deux facteurs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                    <div>
                      <p className="font-medium text-sm">2FA activé</p>
                      <p className="text-xs text-slate-400">Protection supplémentaire pour votre compte</p>
                    </div>
                    <button
                      onClick={() => setSettings({
                        ...settings,
                        security: { ...settings.security, twoFactorEnabled: !settings.security.twoFactorEnabled }
                      })}
                      className={cn(
                        'w-12 h-6 rounded-full transition-all relative',
                        settings.security.twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-600'
                      )}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all',
                          settings.security.twoFactorEnabled ? 'left-6' : 'left-0.5'
                        )}
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Appareils de confiance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {settings.security.trustedDevices.map((device, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-700/30">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💻</span>
                        <span className="text-sm">{device}</span>
                      </div>
                      <Button size="xs" variant="destructive">
                        Révoquer
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Session</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">
                      Expiration de session (minutes)
                    </label>
                    <select
                      value={settings.security.sessionTimeout}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                      })}
                      className="w-full p-2 rounded-lg bg-slate-700 border border-slate-600 text-sm"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 heure</option>
                      <option value={120}>2 heures</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-4">
          <Card className="border-orange-500/30">
            <CardHeader>
              <CardTitle className="text-sm">💡 Aide</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-400 space-y-2">
              <p>
                Modifiez vos paramètres pour personnaliser votre expérience sur la plateforme YESSALATE BMO.
              </p>
              <p>
                Les modifications du profil (rôle, bureau) doivent être effectuées par un administrateur.
              </p>
              <Button size="sm" variant="secondary" className="w-full mt-3">
                📖 Documentation
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">📊 Activité du compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Dernière connexion</span>
                <span>Aujourd&apos;hui, 08:30</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Actions ce mois</span>
                <span className="text-orange-400 font-bold">127</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Validations</span>
                <span className="text-emerald-400 font-bold">47</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500/30">
            <CardHeader>
              <CardTitle className="text-sm text-red-400">⚠️ Zone danger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm" variant="secondary" className="w-full">
                🚪 Déconnexion de tous les appareils
              </Button>
              <Button size="sm" variant="destructive" className="w-full">
                🗑️ Supprimer le compte
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
