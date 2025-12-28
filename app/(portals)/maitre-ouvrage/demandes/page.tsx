'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { demands } from '@/lib/data';
import type { Priority } from '@/lib/types/bmo.types';

export default function DemandesPage() {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [filter, setFilter] = useState<'all' | Priority>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrer les demandes
  const filteredDemands = demands.filter((d) => {
    const matchesFilter = filter === 'all' || d.priority === filter;
    const matchesSearch =
      searchQuery === '' ||
      d.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Stats
  const stats = {
    total: demands.length,
    urgent: demands.filter((d) => d.priority === 'urgent').length,
    high: demands.filter((d) => d.priority === 'high').length,
    normal: demands.filter((d) => d.priority === 'normal').length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            📋 Demandes
            <Badge variant="warning">{stats.total}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Gestion et suivi des demandes des bureaux
          </p>
        </div>
        <Button onClick={() => addToast('Nouvelle demande créée', 'success')}>
          + Nouvelle demande
        </Button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-4 gap-3">
        <Card
          className={cn(
            'cursor-pointer transition-all',
            filter === 'all' && 'ring-2 ring-orange-500'
          )}
          onClick={() => setFilter('all')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-[10px] text-slate-400">Total</p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            'cursor-pointer transition-all',
            filter === 'urgent' && 'ring-2 ring-red-500'
          )}
          onClick={() => setFilter('urgent')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.urgent}</p>
            <p className="text-[10px] text-slate-400">Urgentes</p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            'cursor-pointer transition-all',
            filter === 'high' && 'ring-2 ring-amber-500'
          )}
          onClick={() => setFilter('high')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.high}</p>
            <p className="text-[10px] text-slate-400">Prioritaires</p>
          </CardContent>
        </Card>
        <Card
          className={cn(
            'cursor-pointer transition-all',
            filter === 'normal' && 'ring-2 ring-blue-500'
          )}
          onClick={() => setFilter('normal')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.normal}</p>
            <p className="text-[10px] text-slate-400">Normales</p>
          </CardContent>
        </Card>
      </div>

      {/* Recherche */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="🔍 Rechercher une demande..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            'flex-1 px-4 py-2 rounded-lg text-sm',
            darkMode
              ? 'bg-slate-800 border border-slate-700'
              : 'bg-white border border-gray-200'
          )}
        />
        <Button variant="secondary" onClick={() => setFilter('all')}>
          Réinitialiser
        </Button>
      </div>

      {/* Liste des demandes */}
      <div className="space-y-3">
        {filteredDemands.map((demand, i) => (
          <Card
            key={i}
            className={cn(
              'hover:border-orange-500/50 transition-all cursor-pointer',
              demand.priority === 'urgent' && 'border-l-4 border-l-red-500'
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center text-xl',
                      darkMode ? 'bg-slate-700' : 'bg-gray-100'
                    )}
                  >
                    {demand.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] text-orange-400">
                        {demand.id}
                      </span>
                      <BureauTag bureau={demand.bureau} />
                      <Badge
                        variant={
                          demand.priority === 'urgent'
                            ? 'urgent'
                            : demand.priority === 'high'
                            ? 'warning'
                            : 'default'
                        }
                        pulse={demand.priority === 'urgent'}
                      >
                        {demand.priority}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm">{demand.subject}</h3>
                    <p className="text-xs text-slate-400">Type: {demand.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-amber-400">
                    {demand.amount}
                  </p>
                  <p className="text-[10px] text-slate-500">{demand.date}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                <Button
                  size="xs"
                  variant="success"
                  onClick={() => addToast(`${demand.id} validée ✓`, 'success')}
                >
                  ✓ Valider
                </Button>
                <Button
                  size="xs"
                  variant="info"
                  onClick={() => addToast(`Détails ${demand.id}`, 'info')}
                >
                  👁 Détails
                </Button>
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => addToast(`${demand.id} transférée`, 'info')}
                >
                  ↗ Transférer
                </Button>
                <Button
                  size="xs"
                  variant="destructive"
                  onClick={() => addToast(`${demand.id} rejetée`, 'warning')}
                >
                  ✕
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDemands.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-400">Aucune demande trouvée</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
