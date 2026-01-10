'use client';

import { useArbitragesWorkspaceStore } from '@/lib/stores/arbitragesWorkspaceStore';
import { FluentButton } from '@/components/ui/fluent-button';
import { Scale, TrendingUp, AlertTriangle, Target, Building2 } from 'lucide-react';

export function ArbitragesDirectionPanel() {
  const { openTab } = useArbitragesWorkspaceStore();

  return (
    <div className="space-y-4">
      {/* Hero card */}
      <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-red-500/5 to-orange-500/5 p-6 dark:border-slate-800">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Scale className="w-6 h-6 text-red-500" />
              Vue direction — Gouvernance & Décisions
            </h2>
            <p className="text-slate-500 max-w-2xl mb-4">
              Tableau de bord stratégique pour gérer les arbitrages, suivre les indicateurs critiques et 
              surveiller la charge des bureaux de gouvernance.
            </p>
            <div className="flex flex-wrap gap-2">
              <FluentButton
                size="sm"
                variant="secondary"
                onClick={() => openTab({
                  id: 'inbox:critiques',
                  type: 'inbox',
                  title: 'Arbitrages critiques',
                  icon: '🚨',
                  data: { queue: 'critiques', type: 'arbitrages' }
                })}
              >
                <AlertTriangle className="w-4 h-4 text-red-500" /> Arbitrages critiques
              </FluentButton>
              <FluentButton
                size="sm"
                variant="secondary"
                onClick={() => openTab({
                  id: 'inbox:bureaux-surcharge',
                  type: 'inbox',
                  title: 'Bureaux en surcharge',
                  icon: '🔥',
                  data: { queue: 'surcharge', type: 'bureaux' }
                })}
              >
                <Building2 className="w-4 h-4 text-rose-500" /> Bureaux en surcharge
              </FluentButton>
            </div>
          </div>
          <Scale className="w-16 h-16 text-red-500/20" />
        </div>
      </div>

      {/* Quick insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-red-500/10">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold">Risques critiques</h3>
              <p className="text-xs text-slate-500">Arbitrages à trancher en priorité</p>
            </div>
          </div>
          <FluentButton
            size="sm"
            variant="secondary"
            className="w-full"
            onClick={() => openTab({
              id: 'inbox:critiques',
              type: 'inbox',
              title: 'Critiques',
              icon: '🚨',
              data: { queue: 'critiques', type: 'arbitrages' }
            })}
          >
            Voir la file →
          </FluentButton>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <TrendingUp className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold">Exposition financière</h3>
              <p className="text-xs text-slate-500">Impact budgétaire total</p>
            </div>
          </div>
          <FluentButton
            size="sm"
            variant="secondary"
            className="w-full"
            onClick={() => {
              // TODO: Ouvrir un rapport financier
            }}
          >
            Analyser →
          </FluentButton>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-blue-500/10">
              <Target className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold">Performance bureaux</h3>
              <p className="text-xs text-slate-500">Charge & goulots identifiés</p>
            </div>
          </div>
          <FluentButton
            size="sm"
            variant="secondary"
            className="w-full"
            onClick={() => openTab({
              id: 'inbox:bureaux-all',
              type: 'inbox',
              title: 'Tous les bureaux',
              icon: '🏢',
              data: { queue: 'all', type: 'bureaux' }
            })}
          >
            Voir les bureaux →
          </FluentButton>
        </div>
      </div>

      {/* Call to action */}
      <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 dark:border-purple-500/30 dark:bg-purple-500/10">
        <div className="flex items-center gap-3">
          <Scale className="w-6 h-6 text-purple-500 flex-none" />
          <div className="flex-1">
            <h3 className="font-bold text-purple-700 dark:text-purple-300">
              Instance décisionnelle suprême
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Chaque arbitrage tranché génère une décision hashée (SHA3-256) pour garantir l'intégrité 
              et l'anti-contestation. Traçabilité complète des parties, options et délibérations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


