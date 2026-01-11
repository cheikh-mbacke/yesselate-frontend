/**
 * ContentRouter pour Délégations
 * Router le contenu en fonction de la catégorie et sous-catégorie active
 */

'use client';

import React from 'react';
import { Key, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DelegationWorkspaceContent } from '@/components/features/delegations/workspace/DelegationWorkspaceContent';
import { DelegationInboxView } from '@/components/features/delegations/workspace/views/DelegationInboxView';
import { useDelegationWorkspaceStore } from '@/lib/stores/delegationWorkspaceStore';

interface ContentRouterProps {
  category: string;
  subCategory: string;
}

export const DelegationsContentRouter = React.memo(function DelegationsContentRouter({
  category,
  subCategory,
}: ContentRouterProps) {
  const { openTab } = useDelegationWorkspaceStore();

  // Vue d'ensemble - Dashboard
  if (category === 'overview') {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="h-6 w-6 text-purple-500" />
            <h2 className="text-xl font-semibold text-slate-200">Vue d'ensemble des Délégations</h2>
          </div>
          <p className="text-slate-400 mb-6">
            Gérez les délégations de pouvoirs avec une traçabilité complète. 
            Chaque action génère une décision hashée pour anti-contestation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CategoryCard
              title="Actives"
              description="Délégations en cours"
              icon="✅"
              onClick={() => openTab({ 
                id: 'inbox:active', 
                type: 'inbox', 
                title: 'Actives', 
                icon: '✅', 
                data: { queue: 'active' } 
              })}
            />
            <CategoryCard
              title="Expirant bientôt"
              description="À renouveler rapidement"
              icon="⏰"
              onClick={() => openTab({ 
                id: 'inbox:expiring_soon', 
                type: 'inbox', 
                title: 'Expirent bientôt', 
                icon: '⏰', 
                data: { queue: 'expiring_soon' } 
              })}
            />
            <CategoryCard
              title="Expirées"
              description="Délégations expirées"
              icon="📅"
              onClick={() => openTab({ 
                id: 'inbox:expired', 
                type: 'inbox', 
                title: 'Expirées', 
                icon: '📅', 
                data: { queue: 'expired' } 
              })}
            />
          </div>
        </div>
      </div>
    );
  }

  // Catégories avec vues inbox
  if (['active', 'expired', 'revoked', 'suspended', 'expiring_soon'].includes(category)) {
    const queueMap: Record<string, 'active' | 'expired' | 'revoked' | 'suspended' | 'expiring_soon'> = {
      active: 'active',
      expired: 'expired',
      revoked: 'revoked',
      suspended: 'suspended',
      expiring_soon: 'expiring_soon',
    };

    const queue = queueMap[category] || 'active';
    
    // Créer un onglet temporaire pour la vue
    const tabId = `inbox:${queue}`;
    const tab = {
      id: tabId,
      type: 'inbox' as const,
      title: category === 'active' ? 'Actives' : 
             category === 'expired' ? 'Expirées' :
             category === 'revoked' ? 'Révoquées' :
             category === 'suspended' ? 'Suspendues' :
             'Expirant bientôt',
      icon: category === 'active' ? '✅' : 
            category === 'expired' ? '📅' :
            category === 'revoked' ? '🚫' :
            category === 'suspended' ? '⏸️' :
            '⏰',
      data: { queue },
    };

    return (
      <div className="h-full">
        <DelegationInboxView tab={tab} />
      </div>
    );
  }

  // Historique
  if (category === 'history') {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="h-6 w-6 text-purple-500" />
            <h2 className="text-xl font-semibold text-slate-200">Historique des Délégations</h2>
          </div>
          <p className="text-slate-400">Historique complet des délégations (en développement)</p>
        </div>
      </div>
    );
  }

  // Analytiques
  if (category === 'analytics') {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="h-6 w-6 text-purple-500" />
            <h2 className="text-xl font-semibold text-slate-200">Analytiques des Délégations</h2>
          </div>
          <p className="text-slate-400">Analyses et statistiques détaillées (en développement)</p>
        </div>
      </div>
    );
  }

  // Paramètres
  if (category === 'settings') {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="h-6 w-6 text-purple-500" />
            <h2 className="text-xl font-semibold text-slate-200">Paramètres des Délégations</h2>
          </div>
          <p className="text-slate-400">Configuration et préférences (en développement)</p>
        </div>
      </div>
    );
  }

  // Par défaut, utiliser le composant existant
  return (
    <div className="p-4">
      <DelegationWorkspaceContent />
    </div>
  );
});

// Composant helper pour les cartes de catégorie
const CategoryCard = React.memo(function CategoryCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'p-4 rounded-lg border border-slate-700/50 bg-slate-800/40',
        'hover:bg-slate-800/60 hover:border-purple-500/30',
        'transition-all duration-200 text-left'
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
      </div>
      <p className="text-sm text-slate-400">{description}</p>
    </button>
  );
});
