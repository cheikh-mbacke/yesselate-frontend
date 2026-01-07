'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { delegationsEnriched } from '@/lib/data';
import type { ActionLogType } from '@/lib/types/bmo.types';

type StatusFilter = 'all' | 'active' | 'expired' | 'revoked';
type UsageFilter = 'all' | 'unused' | 'used';
type SortMode = 'latest' | 'oldest' | 'most_used';

type Delegation = (typeof delegationsEnriched)[number] & { bureau?: string };

export default function DelegationsPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();

  const [filter, setFilter] = useState<StatusFilter>('all');
  const [usageFilter, setUsageFilter] = useState<UsageFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDelegation, setSelectedDelegation] = useState<string | null>(null);

  // -----------------------
  // Helpers
  // -----------------------
  const currentUser = {
    id: 'USR-001',
    name: 'A. DIALLO',
    role: 'Directeur Général',
  };

  const log = (payload: {
    action: 'extend' | 'suspend' | 'create' | 'copy_hash' | 'open_linked_decision';
    targetId: string;
    details: string;
  }) => {
    // Mapping des actions internes vers ActionLogType
    const actionMap: Record<string, ActionLogType> = {
      extend: 'modification',
      suspend: 'modification',
      create: 'creation',
      copy_hash: 'audit',
      open_linked_decision: 'audit',
    };

    const actionLogType = actionMap[payload.action] || 'audit';

    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      module: 'delegations',
      action: actionLogType,
      targetId: payload.targetId,
      targetType: 'Delegation',
      details: payload.details,
    });
  };

  const normalized = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  // "dd/mm/yyyy" -> timestamp
  const parseFRDate = (value: string): number => {
    if (!value) return 0;
    const iso = new Date(value);
    if (!Number.isNaN(iso.getTime())) return iso.getTime();

    const m = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (!m) return 0;
    const dd = Number(m[1]);
    const mm = Number(m[2]);
    const yyyy = Number(m[3]);
    const d = new Date(yyyy, mm - 1, dd);
    return Number.isNaN(d.getTime()) ? 0 : d.getTime();
  };

  const isExpiringSoon = (d: Delegation) => {
    if (d.status !== 'active') return false;
    const end = parseFRDate(d.end);
    if (!end) return false;
    const in7Days = Date.now() + 7 * 24 * 60 * 60 * 1000;
    return end <= in7Days;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  // -----------------------
  // Stats
  // -----------------------
  const stats = useMemo(() => {
    const active = delegationsEnriched.filter((d) => d.status === 'active').length;
    const expired = delegationsEnriched.filter((d) => d.status === 'expired').length;
    const revoked = delegationsEnriched.filter((d) => d.status === 'revoked').length;

    const totalUsage = delegationsEnriched.reduce((acc, d) => acc + (d.usageCount || 0), 0);
    const expiringSoon = delegationsEnriched.filter((d) => isExpiringSoon(d)).length;

    return { total: delegationsEnriched.length, active, expired, revoked, totalUsage, expiringSoon };
  }, []);

  // -----------------------
  // Filtering / sorting
  // -----------------------
  const filteredDelegations = useMemo(() => {
    const q = normalized(searchQuery.trim());

    const list = delegationsEnriched
      .filter((d) => filter === 'all' || d.status === filter)
      .filter((d) => usageFilter === 'all' || (usageFilter === 'unused' ? (d.usageCount || 0) === 0 : (d.usageCount || 0) > 0))
      .filter((d) => {
        if (!q) return true;
        const hay = normalized(
          [
            d.id,
            d.status,
            d.type,
            d.agent,
            d.scope,
            (d as Delegation).bureau || '',
            d.start,
            d.end,
            d.createdBy,
            d.createdAt,
            d.decisionId,
            d.hash,
            String(d.usageCount ?? 0),
            d.lastUsed ?? '',
            ...(d.history?.map((h) => `${h.action} ${h.date} ${h.description} ${h.targetDocument ?? ''}`) ?? []),
          ]
            .filter(Boolean)
            .join(' | ')
        );
        return hay.includes(q);
      })
      .sort((a, b) => {
        if (sortMode === 'most_used') return (b.usageCount || 0) - (a.usageCount || 0);

        const ta = parseFRDate(a.createdAt || a.start);
        const tb = parseFRDate(b.createdAt || b.start);
        if (sortMode === 'oldest') return ta - tb;
        return tb - ta; // latest
      });

    return list;
  }, [filter, usageFilter, sortMode, searchQuery]);

  const selectedD = useMemo(() => {
    if (!selectedDelegation) return null;
    return delegationsEnriched.find((d) => d.id === selectedDelegation) ?? null;
  }, [selectedDelegation]);

  // Si la sélection disparaît (filtres/recherche), on désélectionne
  useEffect(() => {
    if (!selectedDelegation) return;
    const ok = filteredDelegations.some((d) => d.id === selectedDelegation);
    if (!ok) setSelectedDelegation(null);
  }, [filteredDelegations, selectedDelegation]);

  // -----------------------
  // Actions
  // -----------------------
  const handleExtend = (delegation: Delegation | null) => {
    if (!delegation) return;

    log({
      action: 'extend',
      targetId: delegation.id,
      details: `Prolongation délégation ${delegation.type} - ${delegation.agent}`,
    });

    addToast('Délégation prolongée - Décision hashée', 'success');
  };

  const handleSuspend = (delegation: Delegation | null) => {
    if (!delegation) return;

    log({
      action: 'suspend',
      targetId: delegation.id,
      details: `Suspension délégation ${delegation.type} - ${delegation.agent}`,
    });

    addToast('Délégation suspendue - Décision hashée', 'warning');
  };

  const handleCreate = () => {
    log({
      action: 'create',
      targetId: 'NEW',
      details: 'Création nouvelle délégation',
    });
    addToast('Formulaire nouvelle délégation ouvert', 'info');
  };

  const handleCopyHash = async (delegation: Delegation | null) => {
    if (!delegation?.hash) {
      addToast('Aucun hash à copier', 'warning');
      return;
    }
    log({ action: 'copy_hash', targetId: delegation.id, details: `Copie hash ${delegation.id}` });
    const ok = await copyToClipboard(delegation.hash);
    addToast(ok ? 'Hash copié ✅' : 'Impossible de copier le hash', ok ? 'success' : 'warning');
  };

  const handleCopyId = async (delegation: Delegation | null) => {
    if (!delegation?.id) return;
    const ok = await copyToClipboard(delegation.id);
    addToast(ok ? 'ID copié ✅' : "Impossible de copier l'ID", ok ? 'success' : 'warning');
  };

  const handleOpenDecision = (delegation: Delegation | null) => {
    if (!delegation?.decisionId) {
      addToast('Aucune décision liée', 'warning');
      return;
    }

    log({
      action: 'open_linked_decision',
      targetId: delegation.id,
      details: `Ouverture décision liée ${delegation.decisionId}`,
    });

    // Placeholder: ici tu peux router vers /bmo/decisions?id=...
    addToast(`Ouverture décision: ${delegation.decisionId}`, 'info');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🔑 Délégations de Pouvoirs
            <Badge variant="success">{stats.active} actives</Badge>
            {stats.expiringSoon > 0 && <Badge variant="warning">⏳ {stats.expiringSoon} expirent bientôt</Badge>}
          </h1>
          <p className="text-sm text-slate-400">Gestion des délégations avec traçabilité complète</p>
        </div>
        <Button onClick={handleCreate}>+ Nouvelle délégation</Button>
      </div>

      {/* Key principle */}
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

      {/* Stats */}
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
            <p className="text-2xl font-bold text-red-400">{stats.revoked}</p>
            <p className="text-[10px] text-slate-400">Révoquées</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.totalUsage}</p>
            <p className="text-[10px] text-slate-400">Utilisations</p>
          </CardContent>
        </Card>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'Toutes' },
          { id: 'active', label: '✅ Actives' },
          { id: 'expired', label: '⏰ Expirées' },
          { id: 'revoked', label: '⛔ Révoquées' },
        ].map((f) => (
          <Button key={f.id} size="sm" variant={filter === f.id ? 'default' : 'secondary'} onClick={() => setFilter(f.id as StatusFilter)}>
            {f.label}
          </Button>
        ))}
      </div>

      {/* Search + advanced controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="🔎 Rechercher (agent, type, bureau, périmètre, décision, hash...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            'flex-1 min-w-[240px] px-3 py-2 rounded-lg text-sm',
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
          )}
        />

        <Button size="sm" variant={usageFilter === 'all' ? 'default' : 'secondary'} onClick={() => setUsageFilter('all')}>
          Usage: Tous
        </Button>
        <Button size="sm" variant={usageFilter === 'unused' ? 'default' : 'secondary'} onClick={() => setUsageFilter('unused')}>
          0 usage
        </Button>
        <Button size="sm" variant={usageFilter === 'used' ? 'default' : 'secondary'} onClick={() => setUsageFilter('used')}>
          Utilisées
        </Button>

        <Button size="sm" variant={sortMode === 'latest' ? 'default' : 'secondary'} onClick={() => setSortMode('latest')}>
          🕒 Récentes
        </Button>
        <Button size="sm" variant={sortMode === 'oldest' ? 'default' : 'secondary'} onClick={() => setSortMode('oldest')}>
          ⏱️ Anciennes
        </Button>
        <Button size="sm" variant={sortMode === 'most_used' ? 'default' : 'secondary'} onClick={() => setSortMode('most_used')}>
          🔥 + utilisées
        </Button>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setSearchQuery('');
            setUsageFilter('all');
            setSortMode('latest');
            setFilter('all');
            addToast('Filtres réinitialisés', 'info');
          }}
        >
          Réinitialiser
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredDelegations.map((delegation) => {
            const isSelected = selectedDelegation === delegation.id;
            const expSoon = isExpiringSoon(delegation);
            const delegationWithBureau = delegation as Delegation;

            return (
              <Card
                key={delegation.id}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected ? 'ring-2 ring-purple-500' : 'hover:border-purple-500/50',
                  delegation.status === 'active' && 'border-l-4 border-l-emerald-500',
                  delegation.status === 'expired' && 'border-l-4 border-l-slate-500 opacity-70',
                  delegation.status === 'revoked' && 'border-l-4 border-l-red-500'
                )}
                onClick={() => setSelectedDelegation(delegation.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-purple-400">{delegation.id}</span>
                        <Badge variant={delegation.status === 'active' ? 'success' : delegation.status === 'expired' ? 'default' : 'urgent'}>
                          {delegation.status}
                        </Badge>
                        {expSoon && (
                          <Badge variant="warning" pulse>
                            Expire bientôt
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-bold mt-1">{delegation.type}</h3>
                      <p className="text-sm text-slate-400">{delegation.agent}</p>
                    </div>
                    <div className="text-right">
                      {delegationWithBureau.bureau && <BureauTag bureau={delegationWithBureau.bureau} />}
                      <p className="text-xs text-slate-400 mt-1">{delegation.usageCount} utilisations</p>
                    </div>
                  </div>

                  <div className={cn('p-2 rounded mb-3', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                    <p className="text-sm">
                      <span className="text-slate-400">Périmètre:</span> {delegation.scope}
                    </p>
                  </div>

                  <div className="flex justify-between text-xs text-slate-400 mb-3">
                    <span>Du {delegation.start}</span>
                    <span>Au {delegation.end}</span>
                  </div>

                  {delegation.lastUsed && <p className="text-xs text-emerald-400 mb-2">✓ Dernière utilisation: {delegation.lastUsed}</p>}

                  <div className="p-2 rounded bg-slate-700/30">
                    <p className="text-[10px] text-slate-400">🔐 Hash traçabilité</p>
                    <p className="font-mono text-[10px] truncate">{delegation.hash}</p>
                  </div>

                  {delegation.status === 'active' && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-700/50" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="info" onClick={() => handleExtend(delegation)}>
                        📅 Prolonger
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleSuspend(delegation)}>
                        ⛔ Suspendre
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleCopyHash(delegation)}>
                        📋 Hash
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {filteredDelegations.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <span className="text-4xl mb-3 block">🫥</span>
                <p className="text-slate-400">Aucune délégation ne correspond à vos filtres.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-1">
          {selectedD ? (
            <Card className="sticky top-4">
              <CardContent className="p-4">
                <div className="mb-4 pb-4 border-b border-slate-700/50">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs text-purple-400">{selectedD.id}</span>
                      <h3 className="font-bold text-lg">{selectedD.type}</h3>
                      <p className="text-slate-400">{selectedD.agent}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant={selectedD.status === 'active' ? 'success' : selectedD.status === 'expired' ? 'default' : 'urgent'}>
                          {selectedD.status}
                        </Badge>
                        {(selectedD as Delegation).bureau && <BureauTag bureau={(selectedD as Delegation).bureau!} />}
                        {isExpiringSoon(selectedD) && (
                          <Badge variant="warning" pulse>
                            Expire bientôt
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Button size="sm" variant="secondary" onClick={() => handleCopyId(selectedD)}>
                        📌 ID
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleCopyHash(selectedD)}>
                        📋 Hash
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                    <p className="text-xs text-slate-400 mb-1">Périmètre</p>
                    <p className="font-medium">{selectedD.scope}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                      <p className="text-xs text-slate-400">Début</p>
                      <p className="font-mono text-xs">{selectedD.start}</p>
                    </div>
                    <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                      <p className="text-xs text-slate-400">Fin</p>
                      <p className="font-mono text-xs">{selectedD.end}</p>
                    </div>
                  </div>

                  <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                    <p className="text-xs text-slate-400 mb-1">Créée par</p>
                    <p>{selectedD.createdBy}</p>
                    <p className="text-xs text-slate-400">{selectedD.createdAt}</p>
                  </div>

                  <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-400">Utilisation</p>
                      <Badge variant="default">{selectedD.usageCount} utilisations</Badge>
                    </div>
                    {selectedD.lastUsed ? (
                      <p className="text-xs text-emerald-400">✓ Dernière utilisation: {selectedD.lastUsed}</p>
                    ) : (
                      <p className="text-xs text-slate-400">Aucune utilisation enregistrée</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-xs mb-2">📜 Historique ({selectedD.history.length})</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedD.history.map((entry) => (
                        <div key={entry.id} className={cn('p-2 rounded text-xs', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={
                                entry.action === 'created'
                                  ? 'info'
                                  : entry.action === 'used'
                                    ? 'success'
                                    : entry.action === 'suspended'
                                      ? 'urgent'
                                      : 'default'
                              }
                            >
                              {entry.action}
                            </Badge>
                            <span className="text-slate-400">{entry.date}</span>
                          </div>
                          <p>{entry.description}</p>
                          {entry.targetDocument && <p className="text-slate-400 mt-1">📄 {entry.targetDocument}</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-2 rounded bg-purple-500/10 border border-purple-500/30">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs text-purple-400">🔗 Décision liée</p>
                        <p className="font-mono text-xs">{selectedD.decisionId}</p>
                      </div>
                      <Button size="sm" variant="secondary" onClick={() => handleOpenDecision(selectedD)}>
                        ↗ Ouvrir
                      </Button>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-slate-700/30">
                    <p className="text-[10px] text-slate-400">🔐 Hash traçabilité</p>
                    <p className="font-mono text-[10px] break-all">{selectedD.hash}</p>
                  </div>
                </div>

                {selectedD.status === 'active' && (
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-700/50">
                    <Button size="sm" variant="info" onClick={() => handleExtend(selectedD)}>
                      📅 Prolonger
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleSuspend(selectedD)}>
                      ⛔ Suspendre
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="p-8 text-center">
                <span className="text-4xl mb-4 block">🔑</span>
                <p className="text-slate-400">Sélectionnez une délégation</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
