/**
 * Page : Historique & gouvernance > Règles d'alerte
 */

'use client';

import React from 'react';
import { Settings, AlertTriangle, Clock, DollarSign } from 'lucide-react';

export function ReglesAlertesPage() {
  const regles = [
    {
      id: '1',
      nom: 'Seuil paiement bloqué',
      description: 'Alerte si un paiement est bloqué depuis plus de 5 jours',
      typologie: 'CRITIQUE',
      active: true,
    },
    {
      id: '2',
      nom: 'SLA validation BC',
      description: 'Alerte si validation BC dépasse 48h',
      typologie: 'SLA',
      active: true,
    },
    {
      id: '3',
      nom: 'Dépassement budgétaire',
      description: 'Alerte si dépassement budgétaire > 15%',
      typologie: 'CRITIQUE',
      active: true,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-1">Règles d'alerte</h2>
        <p className="text-sm text-slate-400">
          Configuration des règles de déclenchement des alertes
        </p>
      </div>

      <div className="space-y-3">
        {regles.map((regle) => (
          <div
            key={regle.id}
            className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30"
          >
            <div className="flex items-start gap-3">
              <Settings className="h-5 w-5 text-slate-400 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-slate-200">{regle.nom}</h3>
                  <span className={`
                    px-2 py-0.5 rounded text-xs border
                    ${regle.typologie === 'CRITIQUE' 
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }
                  `}>
                    {regle.typologie}
                  </span>
                  {regle.active && (
                    <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Actif
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400 mb-2">{regle.description}</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-slate-700/50 text-slate-300 border border-slate-700/50 hover:bg-slate-700 transition-colors">
                Modifier
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

