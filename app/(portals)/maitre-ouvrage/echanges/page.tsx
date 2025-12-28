'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { echangesBureaux } from '@/lib/data';
import type { ExchangeStatus } from '@/lib/types/bmo.types';

export default function EchangesPage() {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [filter, setFilter] = useState<'all' | ExchangeStatus>('all');

  const filteredExchanges = echangesBureaux.filter(
    (e) => filter === 'all' || e.status === filter
  );

  const stats = {
    total: echangesBureaux.length,
    pending: echangesBureaux.filter((e) => e.status === 'pending').length,
    escalated: echangesBureaux.filter((e) => e.status === 'escalated').length,
    resolved: echangesBureaux.filter((e) => e.status === 'resolved').length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            💬 Échanges inter-bureaux
            <Badge variant="info">{stats.total}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Communications entre les différents bureaux
          </p>
        </div>
        <Button onClick={() => addToast('Nouveau message envoyé', 'success')}>
          + Nouveau message
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card
          className={cn('cursor-pointer', filter === 'all' && 'ring-2 ring-orange-500')}
          onClick={() => setFilter('all')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-[10px] text-slate-400">Total</p>
          </CardContent>
        </Card>
        <Card
          className={cn('cursor-pointer', filter === 'pending' && 'ring-2 ring-amber-500')}
          onClick={() => setFilter('pending')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
            <p className="text-[10px] text-slate-400">En attente</p>
          </CardContent>
        </Card>
        <Card
          className={cn('cursor-pointer', filter === 'escalated' && 'ring-2 ring-red-500')}
          onClick={() => setFilter('escalated')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.escalated}</p>
            <p className="text-[10px] text-slate-400">Escaladés</p>
          </CardContent>
        </Card>
        <Card
          className={cn('cursor-pointer', filter === 'resolved' && 'ring-2 ring-emerald-500')}
          onClick={() => setFilter('resolved')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.resolved}</p>
            <p className="text-[10px] text-slate-400">Résolus</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des échanges */}
      <div className="space-y-3">
        {filteredExchanges.map((exchange, i) => (
          <Card
            key={i}
            className={cn(
              'hover:border-orange-500/50 transition-all',
              exchange.status === 'escalated' && 'border-l-4 border-l-red-500',
              exchange.status === 'pending' && 'border-l-4 border-l-amber-500',
              exchange.status === 'resolved' && 'border-l-4 border-l-emerald-500'
            )}
          >
            <CardContent className="p-4">
              <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] text-orange-400">
                      {exchange.id}
                    </span>
                    <Badge
                      variant={
                        exchange.status === 'escalated'
                          ? 'urgent'
                          : exchange.status === 'pending'
                          ? 'warning'
                          : 'success'
                      }
                    >
                      {exchange.status === 'escalated'
                        ? 'Escaladé'
                        : exchange.status === 'pending'
                        ? 'En attente'
                        : 'Résolu'}
                    </Badge>
                    <Badge
                      variant={
                        exchange.priority === 'urgent'
                          ? 'urgent'
                          : exchange.priority === 'high'
                          ? 'warning'
                          : 'default'
                      }
                    >
                      {exchange.priority}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-sm">{exchange.subject}</h3>
                </div>
                <span className="text-[10px] text-slate-500">{exchange.date}</span>
              </div>

              {/* De -> Vers */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  <BureauTag bureau={exchange.from} />
                  <span className="text-xs text-slate-400">({exchange.fromAgent})</span>
                </div>
                <span className="text-slate-500">→</span>
                <div className="flex items-center gap-1">
                  <BureauTag bureau={exchange.to} />
                  <span className="text-xs text-slate-400">({exchange.toAgent})</span>
                </div>
              </div>

              {/* Message */}
              <div
                className={cn(
                  'p-3 rounded-lg text-xs',
                  darkMode ? 'bg-slate-700/50' : 'bg-gray-100'
                )}
              >
                {exchange.message}
              </div>

              {/* Métadonnées */}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] text-slate-400">
                {exchange.project && (
                  <span>
                    📁 Projet: <span className="text-orange-400">{exchange.project}</span>
                  </span>
                )}
                {exchange.attachments && (
                  <span>📎 {exchange.attachments} pièce(s) jointe(s)</span>
                )}
              </div>

              {/* Actions */}
              {exchange.status !== 'resolved' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                  <Button
                    size="sm"
                    variant="info"
                    onClick={() => addToast('Réponse envoyée', 'success')}
                  >
                    ↩️ Répondre
                  </Button>
                  {exchange.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => addToast('Message escaladé au DG', 'warning')}
                    >
                      ⬆️ Escalader
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => addToast('Échange marqué comme résolu', 'success')}
                  >
                    ✓ Résoudre
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
