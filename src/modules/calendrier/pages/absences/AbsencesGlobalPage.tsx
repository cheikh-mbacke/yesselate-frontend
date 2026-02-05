/**
 * Page Absences - Vue globale
 */

'use client';

import React from 'react';
import { CalendarHeader } from '../../components/CalendarHeader';
import { useAbsences } from '../../hooks/useCalendrierData';
import { UserMinus, Calendar } from 'lucide-react';

export function AbsencesGlobalPage() {
  const { absences, loading, error } = useAbsences();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        Chargement...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-400">
        Erreur: {error.message}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <CalendarHeader breadcrumb={['Calendrier', 'Absences & Congés', 'Vue globale']} />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <UserMinus className="h-5 w-5 text-slate-400" />
            <h2 className="text-xl font-semibold text-slate-200">
              Absences & Congés - Vue globale ({absences.length})
            </h2>
          </div>

          {absences.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              Aucune absence enregistrée
            </div>
          ) : (
            <div className="space-y-3">
              {absences.map((absence) => (
                <div
                  key={absence.id}
                  className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
                >
                  <div className="p-2 bg-slate-500/10 rounded">
                    <Calendar className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-200">{absence.employe_nom || `User ${absence.user_id}`}</span>
                      <span className="px-2 py-0.5 bg-slate-500/20 text-slate-400 rounded text-xs">
                        {absence.type || 'ABSENCE'}
                      </span>
                      {absence.statut && (
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            absence.statut === 'VALIDE'
                              ? 'bg-green-500/20 text-green-400'
                              : absence.statut === 'DEMANDE'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {absence.statut}
                        </span>
                      )}
                    </div>
                    {absence.date_debut && absence.date_fin && (
                      <div className="text-sm text-slate-400">
                        {new Date(absence.date_debut).toLocaleDateString()} -{' '}
                        {new Date(absence.date_fin).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

