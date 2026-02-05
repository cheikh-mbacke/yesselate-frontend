/**
 * Page : Analyse & gouvernance > Règles métier
 */

'use client';

import React from 'react';
import { Settings, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export function ReglesMetierPage() {
  const regles = [
    {
      id: '1',
      nom: 'Validation automatique < 10M FCFA',
      description: 'Les contrats inférieurs à 10M FCFA sont validés automatiquement',
      active: true,
    },
    {
      id: '2',
      nom: 'Double validation > 100M FCFA',
      description: 'Les contrats supérieurs à 100M FCFA nécessitent une double validation',
      active: true,
    },
    {
      id: '3',
      nom: 'Alerte échéance < 7 jours',
      description: 'Alerte automatique pour les contrats avec échéance dans moins de 7 jours',
      active: true,
    },
    {
      id: '4',
      nom: 'Validation juridique obligatoire',
      description: 'Tous les contrats nécessitent une validation juridique',
      active: true,
    },
  ];

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-1">Règles métier</h2>
        <p className="text-sm text-slate-400">Configuration des règles de validation</p>
      </div>

      <div className="grid gap-4">
        {regles.map((regle) => (
          <div
            key={regle.id}
            className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 flex items-start justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Settings className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-medium text-slate-200">{regle.nom}</h3>
                {regle.active ? (
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400" />
                )}
              </div>
              <p className="text-xs text-slate-400">{regle.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

