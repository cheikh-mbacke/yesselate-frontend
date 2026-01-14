/**
 * Router de contenu pour le module Alertes & Risques
 * Affiche la bonne page selon la navigation
 */

'use client';

import React from 'react';
import { OverviewIndicateurs } from '../pages/OverviewIndicateurs';
import { CritiquesPaiementsBloques } from '../pages/CritiquesPaiementsBloques';
import { useAlertes } from '../hooks';
import { AlerteCard } from './AlerteCard';
import { AlertesKPICard } from './AlertesKPICard';
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle2,
  Ban,
  Activity,
} from 'lucide-react';
import type { AlertesMainCategory } from '@/lib/stores/alertesCommandCenterStore';

interface AlertesContentRouterProps {
  mainCategory: AlertesMainCategory;
  subCategory: string | null;
  subSubCategory: string | null;
}

export function AlertesContentRouter({
  mainCategory,
  subCategory,
  subSubCategory,
}: AlertesContentRouterProps) {
  const { data: alertes, isLoading } = useAlertes();

  // Vue d'ensemble
  if (mainCategory === 'overview') {
    if (subCategory === 'indicateurs' || !subCategory) {
      return <OverviewIndicateurs />;
    }

    if (subCategory === 'typologie') {
      return (
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Synthèse par typologie</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 'paiement-bloque', label: 'Paiements bloqués', count: 5, color: 'critical' as const },
              { id: 'validation-bloquee', label: 'Validations bloquées', count: 3, color: 'critical' as const },
              { id: 'justificatif-manquant', label: 'Justificatifs manquants', count: 2, color: 'warning' as const },
              { id: 'delai-approchant', label: 'Délais approchants', count: 8, color: 'warning' as const },
            ].map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <p className="text-sm font-medium text-slate-300 mb-2">{cat.label}</p>
                <p className="text-2xl font-bold text-slate-200">{cat.count}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (subCategory === 'bureaux') {
      return (
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Synthèse par bureau</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['BTP', 'BJ', 'BS'].map((bureau) => (
              <div
                key={bureau}
                className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30"
              >
                <p className="text-sm font-medium text-slate-300 mb-2">Bureau {bureau}</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400">Critiques</span>
                    <span className="text-sm font-semibold text-red-400">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400">Avertissements</span>
                    <span className="text-sm font-semibold text-amber-400">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400">Résolues</span>
                    <span className="text-sm font-semibold text-emerald-400">12</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
  }

  // Alertes en cours > Critiques
  if (mainCategory === 'en-cours' && subCategory === 'critiques') {
    if (subSubCategory === 'paiements-bloques') {
      return <CritiquesPaiementsBloques />;
    }

    // Vue générale critiques
    return (
      <div className="p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-200 mb-1">Alertes critiques</h2>
          <p className="text-sm text-slate-400">
            {alertes?.filter((a) => a.severite === 'critical').length || 0} alerte(s) critique(s) nécessitant une action immédiate
          </p>
        </div>

        {isLoading ? (
          <div className="text-slate-400">Chargement...</div>
        ) : (
          <div className="grid gap-4">
            {alertes
              ?.filter((a) => a.severite === 'critical')
              .map((alerte) => (
                <AlerteCard key={alerte.id} alerte={alerte} />
              ))}
          </div>
        )}
      </div>
    );
  }

  // Alertes en cours > Avertissements
  if (mainCategory === 'en-cours' && subCategory === 'avertissements') {
    return (
      <div className="p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-200 mb-1">Avertissements</h2>
          <p className="text-sm text-slate-400">
            {alertes?.filter((a) => a.severite === 'warning').length || 0} alerte(s) d'avertissement
          </p>
        </div>

        {isLoading ? (
          <div className="text-slate-400">Chargement...</div>
        ) : (
          <div className="grid gap-4">
            {alertes
              ?.filter((a) => a.severite === 'warning')
              .map((alerte) => (
                <AlerteCard key={alerte.id} alerte={alerte} />
              ))}
          </div>
        )}
      </div>
    );
  }

  // Alertes en cours > SLA dépassés
  if (mainCategory === 'en-cours' && subCategory === 'sla-depasses') {
    return (
      <div className="p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-200 mb-1">SLA dépassés</h2>
          <p className="text-sm text-slate-400">
            {alertes?.filter((a) => a.slaDepasse).length || 0} alerte(s) avec SLA dépassé
          </p>
        </div>

        {isLoading ? (
          <div className="text-slate-400">Chargement...</div>
        ) : (
          <div className="grid gap-4">
            {alertes
              ?.filter((a) => a.slaDepasse)
              .map((alerte) => (
                <AlerteCard key={alerte.id} alerte={alerte} />
              ))}
          </div>
        )}
      </div>
    );
  }

  // Traitements
  if (mainCategory === 'traitements') {
    return (
      <div className="p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-200 mb-1">
            {subCategory === 'acquittees' ? 'Alertes acquittées' : 'Alertes résolues'}
          </h2>
          <p className="text-sm text-slate-400">
            {alertes?.filter((a) =>
              subCategory === 'acquittees' ? a.statut === 'acknowledged' : a.statut === 'resolved'
            ).length || 0}{' '}
            alerte(s)
          </p>
        </div>

        {isLoading ? (
          <div className="text-slate-400">Chargement...</div>
        ) : (
          <div className="grid gap-4">
            {alertes
              ?.filter((a) =>
                subCategory === 'acquittees' ? a.statut === 'acknowledged' : a.statut === 'resolved'
              )
              .map((alerte) => (
                <AlerteCard key={alerte.id} alerte={alerte} />
              ))}
          </div>
        )}
      </div>
    );
  }

  // Gouvernance
  if (mainCategory === 'governance') {
    return (
      <div className="p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-200 mb-1">Gouvernance & Historique</h2>
          <p className="text-sm text-slate-400">Configuration des règles et consultation de l'historique</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <h3 className="text-sm font-medium text-slate-200 mb-2">Règles d'alerte</h3>
            <p className="text-xs text-slate-400">Configuration des seuils et délais</p>
          </div>
          <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <h3 className="text-sm font-medium text-slate-200 mb-2">Historique</h3>
            <p className="text-xs text-slate-400">Consultation des alertes passées</p>
          </div>
          <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <h3 className="text-sm font-medium text-slate-200 mb-2">Suivis & escalades</h3>
            <p className="text-xs text-slate-400">Traçabilité des actions</p>
          </div>
        </div>
      </div>
    );
  }

  // Vue par défaut
  return (
    <div className="p-6">
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-8 text-center">
        <p className="text-slate-400">Sélectionnez une section dans la navigation</p>
      </div>
    </div>
  );
}

