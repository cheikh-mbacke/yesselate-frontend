'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { echangesBureaux } from '@/lib/data';

export default function EchangesBureauxPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved' | 'escalated'>('all');
  const [selectedEchange, setSelectedEchange] = useState<string | null>(null);

  const filteredEchanges = echangesBureaux.filter(e => filter === 'all' || e.status === filter);

  const stats = useMemo(() => {
    const pending = echangesBureaux.filter(e => e.status === 'pending').length;
    const escalated = echangesBureaux.filter(e => e.status === 'escalated').length;
    const resolved = echangesBureaux.filter(e => e.status === 'resolved').length;
    const urgent = echangesBureaux.filter(e => e.priority === 'urgent').length;
    return { total: echangesBureaux.length, pending, escalated, resolved, urgent };
  }, []);

  const selectedE = selectedEchange ? echangesBureaux.find(e => e.id === selectedEchange) : null;

  const handleRespond = (echange: typeof selectedE) => {
    if (!echange) return;
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'echanges-bureaux',
      action: 'respond',
      targetId: echange.id,
      targetType: 'BureauExchange',
      details: `Réponse échange ${echange.from} → ${echange.to}`,
    });
    addToast('Réponse envoyée', 'success');
  };

  const handleEscalate = (echange: typeof selectedE) => {
    if (!echange) return;
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'echanges-bureaux',
      action: 'escalate',
      targetId: echange.id,
      targetType: 'BureauExchange',
      details: `Escalade échange au DG`,
    });
    addToast('Échange escaladé au DG - Trace créée', 'warning');
  };

  const handleClose = (echange: typeof selectedE) => {
    if (!echange) return;
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'echanges-bureaux',
      action: 'close',
      targetId: echange.id,
      targetType: 'BureauExchange',
      details: `Clôture échange`,
    });
    addToast('Échange clôturé - Trace créée', 'success');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🔄 Échanges Inter-Bureaux
            <Badge variant="warning">{stats.pending} en attente</Badge>
          </h1>
          <p className="text-sm text-slate-400">Communication entre bureaux avec traçabilité des escalades</p>
        </div>
        <Button onClick={() => addToast('Nouvel échange créé', 'success')}>+ Nouvel échange</Button>
      </div>

      {stats.escalated > 0 && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚨</span>
              <div className="flex-1">
                <h3 className="font-bold text-red-400">{stats.escalated} échange(s) escaladé(s)</h3>
                <p className="text-sm text-slate-400">Nécessitent intervention DG</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card 
          className={cn('bg-blue-500/10 border-blue-500/30 cursor-pointer transition-all', filter === 'all' && 'ring-2 ring-orange-500')}
          onClick={() => setFilter('all')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
            <p className="text-[10px] text-slate-400">Total</p>
          </CardContent>
        </Card>
        <Card 
          className={cn('bg-amber-500/10 border-amber-500/30 cursor-pointer transition-all', filter === 'pending' && 'ring-2 ring-amber-500')}
          onClick={() => setFilter('pending')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
            <p className="text-[10px] text-slate-400">En attente</p>
          </CardContent>
        </Card>
        <Card 
          className={cn('bg-red-500/10 border-red-500/30 cursor-pointer transition-all', filter === 'escalated' && 'ring-2 ring-red-500')}
          onClick={() => setFilter('escalated')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.escalated}</p>
            <p className="text-[10px] text-slate-400">Escaladés</p>
          </CardContent>
        </Card>
        <Card 
          className={cn('bg-emerald-500/10 border-emerald-500/30 cursor-pointer transition-all', filter === 'resolved' && 'ring-2 ring-emerald-500')}
          onClick={() => setFilter('resolved')}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.resolved}</p>
            <p className="text-[10px] text-slate-400">Résolus</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/10 border-orange-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">{stats.urgent}</p>
            <p className="text-[10px] text-slate-400">Urgents</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'Tous' },
          { id: 'pending', label: '⏳ En attente' },
          { id: 'escalated', label: '🚨 Escaladés' },
          { id: 'resolved', label: '✅ Résolus' },
        ].map((f) => (
          <Button key={f.id} size="sm" variant={filter === f.id ? 'default' : 'secondary'} onClick={() => setFilter(f.id as typeof filter)}>{f.label}</Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {filteredEchanges.map((echange) => {
            const isSelected = selectedEchange === echange.id;
            
            return (
              <Card
                key={echange.id}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected ? 'ring-2 ring-blue-500' : 'hover:border-blue-500/50',
                  echange.status === 'escalated' && 'border-l-4 border-l-red-500',
                  echange.status === 'pending' && echange.priority === 'urgent' && 'border-l-4 border-l-orange-500',
                  echange.status === 'resolved' && 'border-l-4 border-l-emerald-500 opacity-70',
                )}
                onClick={() => setSelectedEchange(echange.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-blue-400">{echange.id}</span>
                        <Badge variant={echange.status === 'escalated' ? 'urgent' : echange.status === 'pending' ? 'warning' : 'success'}>
                          {echange.status === 'escalated' ? 'Escaladé' : echange.status === 'pending' ? 'En attente' : 'Résolu'}
                        </Badge>
                        <Badge variant={echange.priority === 'urgent' ? 'urgent' : echange.priority === 'high' ? 'warning' : 'default'}>
                          {echange.priority}
                        </Badge>
                      </div>
                      <h3 className="font-bold mt-1">{echange.subject}</h3>
                    </div>
                    <span className="text-[10px] text-slate-500">{echange.date}</span>
                  </div>

                  {/* De -> Vers */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <BureauTag bureau={echange.from} />
                      {echange.fromAgent && <span className="text-xs text-slate-400">({echange.fromAgent})</span>}
                    </div>
                    <span className="text-slate-500">→</span>
                    <div className="flex items-center gap-1">
                      <BureauTag bureau={echange.to} />
                      {echange.toAgent && <span className="text-xs text-slate-400">({echange.toAgent})</span>}
                    </div>
                  </div>

                  {/* Message */}
                  {echange.message && (
                    <div className={cn(
                      'p-3 rounded-lg text-xs mb-3',
                      darkMode ? 'bg-slate-700/50' : 'bg-gray-100'
                    )}>
                      {echange.message}
                    </div>
                  )}

                  {/* Métadonnées */}
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 mb-3">
                    {echange.project && (
                      <span>
                        📁 Projet: <span className="text-orange-400">{echange.project}</span>
                      </span>
                    )}
                    {echange.attachments && (
                      <span>📎 {echange.attachments} pièce(s) jointe(s)</span>
                    )}
                  </div>

                  {echange.status !== 'resolved' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                      <Button size="sm" variant="info" onClick={(e) => { e.stopPropagation(); handleRespond(echange); }}>
                        ↩️ Répondre
                      </Button>
                      {echange.status === 'pending' && (
                        <Button size="sm" variant="warning" onClick={(e) => { e.stopPropagation(); handleEscalate(echange); }}>
                          ⬆️ Escalader
                        </Button>
                      )}
                      <Button size="sm" variant="success" onClick={(e) => { e.stopPropagation(); handleClose(echange); }}>
                        ✓ Résoudre
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          {selectedE ? (
            <Card className="sticky top-4">
              <CardContent className="p-4">
                <div className="mb-4 pb-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={selectedE.status === 'escalated' ? 'urgent' : selectedE.status === 'pending' ? 'warning' : 'success'}>
                      {selectedE.status === 'escalated' ? 'Escaladé' : selectedE.status === 'pending' ? 'En attente' : 'Résolu'}
                    </Badge>
                    <Badge variant={selectedE.priority === 'urgent' ? 'urgent' : selectedE.priority === 'high' ? 'warning' : 'default'}>
                      {selectedE.priority}
                    </Badge>
                  </div>
                  <span className="font-mono text-xs text-blue-400">{selectedE.id}</span>
                  <h3 className="font-bold">{selectedE.subject}</h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-center gap-4 p-3 rounded bg-slate-700/30">
                    <div className="text-center">
                      <p className="text-xs text-slate-400">De</p>
                      <BureauTag bureau={selectedE.from} />
                      {selectedE.fromAgent && <p className="text-[10px] text-slate-500 mt-1">{selectedE.fromAgent}</p>}
                    </div>
                    <span className="text-2xl">→</span>
                    <div className="text-center">
                      <p className="text-xs text-slate-400">À</p>
                      <BureauTag bureau={selectedE.to} />
                      {selectedE.toAgent && <p className="text-[10px] text-slate-500 mt-1">{selectedE.toAgent}</p>}
                    </div>
                  </div>

                  <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                    <p className="text-xs text-slate-400 mb-1">Date</p>
                    <p>{selectedE.date}</p>
                  </div>

                  {/* Message */}
                  {selectedE.message && (
                    <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                      <p className="text-xs text-slate-400 mb-1">Message</p>
                      <p className="text-xs">{selectedE.message}</p>
                    </div>
                  )}

                  {/* Métadonnées */}
                  <div className="space-y-2">
                    {selectedE.project && (
                      <div className={cn("p-2 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                        <p className="text-xs text-slate-400 mb-1">Projet lié</p>
                        <Badge variant="info">📁 {selectedE.project}</Badge>
                      </div>
                    )}
                    {selectedE.attachments && (
                      <div className={cn("p-2 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                        <p className="text-xs text-slate-400">📎 {selectedE.attachments} pièce(s) jointe(s)</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedE.status !== 'resolved' && (
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-700/50">
                    <Button size="sm" variant="info" onClick={() => handleRespond(selectedE)}>↩️ Répondre</Button>
                    {selectedE.status === 'pending' && (
                      <Button size="sm" variant="warning" onClick={() => handleEscalate(selectedE)}>⬆️ Escalader au DG</Button>
                    )}
                    <Button size="sm" variant="success" onClick={() => handleClose(selectedE)}>✓ Résoudre</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4"><CardContent className="p-8 text-center"><span className="text-4xl mb-4 block">🔄</span><p className="text-slate-400">Sélectionnez un échange</p></CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
}
