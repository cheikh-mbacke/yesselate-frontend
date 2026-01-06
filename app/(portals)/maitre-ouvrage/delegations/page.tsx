'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { delegationsEnriched } from '@/lib/data';

export default function DelegationsPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'suspended'>('all');
  const [selectedDelegation, setSelectedDelegation] = useState<string | null>(null);

  const filteredDelegations = delegationsEnriched.filter(d => filter === 'all' || d.status === filter);

  const stats = useMemo(() => {
    const active = delegationsEnriched.filter(d => d.status === 'active').length;
    const expired = delegationsEnriched.filter(d => d.status === 'expired').length;
    const suspended = delegationsEnriched.filter(d => d.status === 'suspended').length;
    const totalUsage = delegationsEnriched.reduce((acc, d) => acc + d.usageCount, 0);
    return { total: delegationsEnriched.length, active, expired, suspended, totalUsage };
  }, []);

  const selectedD = selectedDelegation ? delegationsEnriched.find(d => d.id === selectedDelegation) : null;

  const handleExtend = (delegation: typeof selectedD) => {
    if (!delegation) return;
    addActionLog({
      module: 'delegations',
      action: 'extend',
      targetId: delegation.id,
      targetType: 'Delegation',
      details: `Prolongation délégation ${delegation.type} - ${delegation.agent}`,
      status: 'success',
      hash: `SHA3-256:del_ext_${Date.now().toString(16)}`,
    });
    addToast('Délégation prolongée - Décision hashée', 'success');
  };

  const handleSuspend = (delegation: typeof selectedD) => {
    if (!delegation) return;
    addActionLog({
      module: 'delegations',
      action: 'suspend',
      targetId: delegation.id,
      targetType: 'Delegation',
      details: `Suspension délégation ${delegation.type} - ${delegation.agent}`,
      status: 'warning',
      hash: `SHA3-256:del_sus_${Date.now().toString(16)}`,
    });
    addToast('Délégation suspendue - Décision hashée', 'warning');
  };

  const handleCreate = () => {
    addActionLog({
      module: 'delegations',
      action: 'create',
      targetId: 'NEW',
      targetType: 'Delegation',
      details: 'Création nouvelle délégation',
      status: 'info',
    });
    addToast('Formulaire nouvelle délégation ouvert', 'info');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🔑 Délégations de Pouvoirs
            <Badge variant="success">{stats.active} actives</Badge>
          </h1>
          <p className="text-sm text-slate-400">Gestion des délégations avec traçabilité complète</p>
        </div>
        <Button onClick={handleCreate}>+ Nouvelle délégation</Button>
      </div>

      <Card className="bg-purple-500/10 border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚖️</span>
            <div className="flex-1">
              <h3 className="font-bold text-purple-400">Acte sensible</h3>
              <p className="text-sm text-slate-400">Chaque délégation génère une décision hashée pour anti-contestation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
            <p className="text-[10px] text-slate-400">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
            <p className="text-[10px] text-slate-400">Actives</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-500/10 border-slate-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-slate-400">{stats.expired}</p>
            <p className="text-[10px] text-slate-400">Expirées</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.suspended}</p>
            <p className="text-[10px] text-slate-400">Suspendues</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.totalUsage}</p>
            <p className="text-[10px] text-slate-400">Utilisations</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'Toutes' },
          { id: 'active', label: '✅ Actives' },
          { id: 'expired', label: '⏰ Expirées' },
          { id: 'suspended', label: '⛔ Suspendues' },
        ].map((f) => (
          <Button key={f.id} size="sm" variant={filter === f.id ? 'default' : 'secondary'} onClick={() => setFilter(f.id as typeof filter)}>{f.label}</Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {filteredDelegations.map((delegation) => {
            const isSelected = selectedDelegation === delegation.id;
            const isExpiringSoon = delegation.status === 'active' && new Date(delegation.end.split('/').reverse().join('-')) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            
            return (
              <Card
                key={delegation.id}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected ? 'ring-2 ring-purple-500' : 'hover:border-purple-500/50',
                  delegation.status === 'active' && 'border-l-4 border-l-emerald-500',
                  delegation.status === 'expired' && 'border-l-4 border-l-slate-500 opacity-70',
                  delegation.status === 'suspended' && 'border-l-4 border-l-red-500',
                )}
                onClick={() => setSelectedDelegation(delegation.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-purple-400">{delegation.id}</span>
                        <Badge variant={delegation.status === 'active' ? 'success' : delegation.status === 'expired' ? 'default' : 'urgent'}>{delegation.status}</Badge>
                        {isExpiringSoon && <Badge variant="warning" pulse>Expire bientôt</Badge>}
                      </div>
                      <h3 className="font-bold mt-1">{delegation.type}</h3>
                      <p className="text-sm text-slate-400">{delegation.agent}</p>
                    </div>
                    <div className="text-right">
                      <BureauTag bureau={delegation.bureau} />
                      <p className="text-xs text-slate-400 mt-1">{delegation.usageCount} utilisations</p>
                    </div>
                  </div>

                  <div className={cn("p-2 rounded mb-3", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                    <p className="text-sm"><span className="text-slate-400">Périmètre:</span> {delegation.scope}</p>
                  </div>

                  <div className="flex justify-between text-xs text-slate-400 mb-3">
                    <span>Du {delegation.start}</span>
                    <span>Au {delegation.end}</span>
                  </div>

                  {delegation.lastUsed && (
                    <p className="text-xs text-emerald-400 mb-2">✓ Dernière utilisation: {delegation.lastUsed}</p>
                  )}

                  <div className="p-2 rounded bg-slate-700/30">
                    <p className="text-[10px] text-slate-400">🔐 Hash traçabilité</p>
                    <p className="font-mono text-[10px] truncate">{delegation.hash}</p>
                  </div>

                  {delegation.status === 'active' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                      <Button size="sm" variant="info" onClick={(e) => { e.stopPropagation(); handleExtend(delegation); }}>📅 Prolonger</Button>
                      <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); handleSuspend(delegation); }}>⛔ Suspendre</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          {selectedD ? (
            <Card className="sticky top-4">
              <CardContent className="p-4">
                <div className="mb-4 pb-4 border-b border-slate-700/50">
                  <span className="font-mono text-xs text-purple-400">{selectedD.id}</span>
                  <h3 className="font-bold text-lg">{selectedD.type}</h3>
                  <p className="text-slate-400">{selectedD.agent}</p>
                  <Badge variant={selectedD.status === 'active' ? 'success' : selectedD.status === 'expired' ? 'default' : 'urgent'} className="mt-2">{selectedD.status}</Badge>
                </div>

                <div className="space-y-3 text-sm">
                  <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                    <p className="text-xs text-slate-400 mb-1">Périmètre</p>
                    <p className="font-medium">{selectedD.scope}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className={cn("p-2 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                      <p className="text-xs text-slate-400">Début</p>
                      <p className="font-mono text-xs">{selectedD.start}</p>
                    </div>
                    <div className={cn("p-2 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                      <p className="text-xs text-slate-400">Fin</p>
                      <p className="font-mono text-xs">{selectedD.end}</p>
                    </div>
                  </div>

                  <div className={cn("p-3 rounded", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                    <p className="text-xs text-slate-400 mb-1">Créée par</p>
                    <p>{selectedD.createdBy}</p>
                    <p className="text-xs text-slate-400">{selectedD.createdAt}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs mb-2">📜 Historique ({selectedD.history.length})</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedD.history.map((entry) => (
                        <div key={entry.id} className={cn("p-2 rounded text-xs", darkMode ? "bg-slate-700/30" : "bg-gray-100")}>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={entry.action === 'created' ? 'info' : entry.action === 'used' ? 'success' : entry.action === 'suspended' ? 'urgent' : 'default'}>{entry.action}</Badge>
                            <span className="text-slate-400">{entry.date}</span>
                          </div>
                          <p>{entry.description}</p>
                          {entry.targetDocument && <p className="text-slate-400 mt-1">📄 {entry.targetDocument}</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-2 rounded bg-purple-500/10 border border-purple-500/30">
                    <p className="text-xs text-purple-400">🔗 Décision liée</p>
                    <p className="font-mono text-xs">{selectedD.decisionId}</p>
                  </div>
                </div>

                {selectedD.status === 'active' && (
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-700/50">
                    <Button size="sm" variant="info" onClick={() => handleExtend(selectedD)}>📅 Prolonger</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleSuspend(selectedD)}>⛔ Suspendre</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4"><CardContent className="p-8 text-center"><span className="text-4xl mb-4 block">🔑</span><p className="text-slate-400">Sélectionnez une délégation</p></CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
}
