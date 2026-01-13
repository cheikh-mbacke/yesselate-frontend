#!/usr/bin/env node

/**
 * CLI Tool - Générateur de Modales Harmonisées
 * Usage: node scripts/generate-modals.js [MODULE_NAME] [MODULE_COLOR]
 * 
 * Exemple: node scripts/generate-modals.js Delegations purple
 */

const fs = require('fs');
const path = require('path');

// Couleurs pour le terminal
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ERREUR: ${message}`, 'red');
  process.exit(1);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Arguments
const args = process.argv.slice(2);
const moduleName = args[0];
const moduleColor = args[1] || 'blue';

if (!moduleName) {
  error('Nom du module requis!\nUsage: node scripts/generate-modals.js [MODULE_NAME] [MODULE_COLOR]');
}

log(`\n${'='.repeat(60)}`, 'bold');
log(`🚀 GÉNÉRATEUR DE MODALES HARMONISÉES`, 'bold');
log(`${'='.repeat(60)}\n`, 'bold');

info(`Module: ${moduleName}`);
info(`Couleur: ${moduleColor}`);
info(`Date: ${new Date().toLocaleDateString('fr-FR')}\n`);

// Chemins
const templatePath = path.join(__dirname, '..', 'src', 'components', 'shared', 'GenericModalsTemplate.tsx');
const targetDir = path.join(__dirname, '..', 'src', 'components', 'features', 'bmo', moduleName.toLowerCase());
const targetModalsPath = path.join(targetDir, `${moduleName}Modals.tsx`);
const targetNotifPath = path.join(targetDir, `${moduleName}NotificationPanel.tsx`);

// Vérifier que le template existe
if (!fs.existsSync(templatePath)) {
  error(`Template non trouvé: ${templatePath}`);
}

// Créer le dossier si nécessaire
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  success(`Dossier créé: ${targetDir}`);
} else {
  warning(`Dossier existe déjà: ${targetDir}`);
}

// Lire le template
info(`Lecture du template...`);
let modalsContent = fs.readFileSync(templatePath, 'utf8');

// Remplacer les variables
info(`Remplacement des variables...`);
modalsContent = modalsContent.replace(/\{\{MODULE_NAME\}\}/g, moduleName);
modalsContent = modalsContent.replace(/\{\{MODULE_COLOR\}\}/g, moduleColor);

// Écrire le fichier Modals
info(`Création de ${moduleName}Modals.tsx...`);
fs.writeFileSync(targetModalsPath, modalsContent);
success(`Fichier créé: ${targetModalsPath}`);

// Créer le panneau de notifications
info(`Création de ${moduleName}NotificationPanel.tsx...`);
const notifTemplate = `/**
 * ${moduleName} Notification Panel
 * Panneau de notifications pour ${moduleName}
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'urgent' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

interface ${moduleName}NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ${moduleName}NotificationPanel({ isOpen, onClose }: ${moduleName}NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'urgent',
      title: 'Notification urgente',
      message: 'Exemple de notification urgente pour ${moduleName}',
      timestamp: new Date().toISOString(),
      read: false,
      actionLabel: 'Voir',
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'warning': return <Clock className="w-5 h-5 text-amber-400" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'info': default: return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBgColor = (type: Notification['type'], read: boolean) => {
    if (read) return 'bg-slate-800/30';
    switch (type) {
      case 'urgent': return 'bg-red-500/10 border-red-500/20';
      case 'warning': return 'bg-amber-500/10 border-amber-500/20';
      case 'success': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'info': default: return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700/50 shadow-2xl z-50 flex flex-col animate-slideInRight">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-${moduleColor}-400" />
            <h3 className="text-lg font-semibold text-slate-200">Notifications</h3>
            {unreadCount > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                {unreadCount}
              </Badge>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {notifications.length > 0 && (
          <div className="flex gap-2 px-4 py-2 border-b border-slate-800/50">
            <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0} className="text-xs h-7">
              Tout marquer comme lu
            </Button>
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs h-7 text-red-400 hover:text-red-300">
              Tout effacer
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Bell className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Aucune notification</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={cn(
                  'p-4 rounded-xl border transition-all cursor-pointer',
                  getBgColor(notif.type, notif.read),
                  !notif.read && 'border-l-4'
                )}
                onClick={() => !notif.read && markAsRead(notif.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">{getIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={cn('text-sm font-medium', !notif.read ? 'text-slate-100' : 'text-slate-300')}>
                        {notif.title}
                      </h4>
                      {!notif.read && <div className="w-2 h-2 rounded-full bg-${moduleColor}-400 flex-shrink-0 mt-1" />}
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{notif.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {new Date(notif.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {notif.actionLabel && (
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={(e) => { e.stopPropagation(); notif.onAction?.(); }}>
                          <Eye className="w-3 h-3 mr-1" />
                          {notif.actionLabel}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{notifications.length} notification{notifications.length > 1 ? 's' : ''}</span>
            {unreadCount > 0 && (
              <span className="text-${moduleColor}-400">{unreadCount} non lu{unreadCount > 1 ? 'es' : 'e'}</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
`;

fs.writeFileSync(targetNotifPath, notifTemplate);
success(`Fichier créé: ${targetNotifPath}`);

// Créer index.ts
const indexPath = path.join(targetDir, 'index.ts');
info(`Création de index.ts...`);
const indexContent = `// ${moduleName} Components - Auto-generated
export { ${moduleName}Modals } from './${moduleName}Modals';
export type { ${moduleName}ModalType } from './${moduleName}Modals';
export { ${moduleName}NotificationPanel } from './${moduleName}NotificationPanel';
`;

fs.writeFileSync(indexPath, indexContent);
success(`Fichier créé: ${indexPath}`);

// Résumé
log(`\n${'='.repeat(60)}`, 'bold');
log(`✅ GÉNÉRATION TERMINÉE!`, 'green');
log(`${'='.repeat(60)}\n`, 'bold');

success(`3 fichiers créés dans ${targetDir}:`);
console.log(`   1. ${moduleName}Modals.tsx`);
console.log(`   2. ${moduleName}NotificationPanel.tsx`);
console.log(`   3. index.ts\n`);

info(`Prochaines étapes:\n`);
console.log(`   1. Ouvrir les fichiers générés`);
console.log(`   2. Adapter les types et données spécifiques`);
console.log(`   3. Intégrer dans page.tsx (voir GUIDE-HARMONISATION-RAPIDE.md)`);
console.log(`   4. Tester: npm run lint\n`);

info(`Documentation: docs/GUIDE-HARMONISATION-RAPIDE.md\n`);

log(`🎉 Module ${moduleName} prêt à être harmonisé!`, 'bold');
log(`⚡ Temps gagné: ~15 minutes\n`, 'yellow');

