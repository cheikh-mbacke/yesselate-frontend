'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { demandesRH } from '@/lib/data';

type RHFilter = 'all' | 'Congé' | 'Dépense' | 'Maladie' | 'Déplacement' | 'Paie';

export default function DemandesRHPage() {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [filter, setFilter] = useState<RHFilter>('all');

  const filteredDemandes = demandesRH.filter(
    (d) => filter === 'all' || d.type === filter
  );

  const stats = {
    total: demandesRH.length,
    conges: demandesRH.filter((d) => d.type === 'Congé').length,
    depenses: demandesRH.filter((d) => d.type === 'Dépense').length,
    maladies: demandesRH.filter((d) => d.type === 'Maladie').length,
    deplacements: demandesRH.filter((d) => d.type === 'Déplacement').length,
    paie: demandesRH.filter((d) => d.type === 'Paie').length,
  };

  const typeIcons: Record<string, string> = {
    Congé: '🏖️',
    Dépense: '💸',
    Maladie: '🏥',
    Déplacement: '✈️',
    Paie: '💰',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            📝 Demandes RH
            <Badge variant="warning">{stats.total}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Congés, dépenses, déplacements et avances
          </p>
        </div>
        <Button onClick={() => addToast('Nouvelle demande RH créée', 'success')}>
          + Nouvelle demande
        </Button>
      </div>

      {/* Stats par type */}
      <div className="grid grid-cols-6 gap-3">
        {[
          { id: 'all', label: 'Total', count: stats.total, icon: '📋' },
          { id: 'Congé', label: 'Congés', count: stats.conges, icon: '🏖️' },
          { id: 'Dépense', label: 'Dépenses', count: stats.depenses, icon: '💸' },
          { id: 'Maladie', label: 'Maladies', count: stats.maladies, icon: '🏥' },
          { id: 'Déplacement', label: 'Déplacements', count: stats.deplacements, icon: '✈️' },
          { id: 'Paie', label: 'Paie/Avances', count: stats.paie, icon: '💰' },
        ].map((s) => (
          <Card
            key={s.id}
            className={cn('cursor-pointer transition-all', filter === s.id && 'ring-2 ring-orange-500')}
            onClick={() => setFilter(s.id as RHFilter)}
          >
            <CardContent className="p-3 text-center">
              <span className="text-xl">{s.icon}</span>
              <p className="text-lg font-bold">{s.count}</p>
              <p className="text-[10px] text-slate-400">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Liste des demandes */}
      <div className="space-y-3">
        {filteredDemandes.map((demande, i) => (
          <Card
            key={i}
            className={cn(
              'hover:border-orange-500/50 transition-all',
              demande.priority === 'urgent' && 'border-l-4 border-l-red-500'
            )}
          >
            <CardContent className="p-4">
              <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-bold text-white text-sm">
                    {demande.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] text-orange-400">
                        {demande.id}
                      </span>
                      <Badge variant="info">
                        {typeIcons[demande.type]} {demande.type}
                      </Badge>
                      <Badge variant="default">{demande.subtype}</Badge>
                      <BureauTag bureau={demande.bureau} />
                    </div>
                    <h3 className="font-bold text-sm">{demande.agent}</h3>
                    <p className="text-xs text-slate-400">{demande.reason}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      demande.priority === 'urgent'
                        ? 'urgent'
                        : demande.priority === 'high'
                        ? 'warning'
                        : 'default'
                    }
                    pulse={demande.priority === 'urgent'}
                  >
                    {demande.priority}
                  </Badge>
                  <p className="text-[10px] text-slate-500 mt-1">{demande.date}</p>
                </div>
              </div>

              {/* Détails spécifiques */}
              <div
                className={cn(
                  'grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 rounded-lg text-xs',
                  darkMode ? 'bg-slate-700/30' : 'bg-gray-100'
                )}
              >
                {demande.startDate && (
                  <div>
                    <span className="text-slate-400">Début: </span>
                    {demande.startDate}
                  </div>
                )}
                {demande.endDate && (
                  <div>
                    <span className="text-slate-400">Fin: </span>
                    {demande.endDate}
                  </div>
                )}
                {demande.days && (
                  <div>
                    <span className="text-slate-400">Durée: </span>
                    {demande.days} jours
                  </div>
                )}
                {demande.amount && (
                  <div>
                    <span className="text-slate-400">Montant: </span>
                    <span className="font-mono text-amber-400">{demande.amount} FCFA</span>
                  </div>
                )}
                {demande.destination && (
                  <div>
                    <span className="text-slate-400">Destination: </span>
                    {demande.destination}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => addToast(`${demande.id} approuvée ✔`, 'success')}
                >
                  ✔ Approuver
                </Button>
                <Button
                  size="sm"
                  variant="info"
                  onClick={() => addToast(`Détails ${demande.id}`, 'info')}
                >
                  📋 Détails
                </Button>
                <Button
                  size="sm"
                  variant="warning"
                  onClick={() => addToast(`${demande.id} en attente d'infos`, 'warning')}
                >
                  ⏳ Infos requises
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => addToast(`${demande.id} refusée`, 'error')}
                >
                  ✕ Refuser
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
