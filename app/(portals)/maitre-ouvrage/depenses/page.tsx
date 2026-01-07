'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { demandesRH } from '@/lib/data';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import { useAutoSyncCounts } from '@/hooks/useAutoSync';

type StatusFilter = 'all' | 'pending' | 'validated' | 'rejected';
type SortMode = 'recent' | 'oldest' | 'amount_desc' | 'amount_asc' | 'priority' | 'missing_docs';

type HRRequest = (typeof demandesRH)[number];

const normalize = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const parseFRDateToMs = (dateStr?: string): number => {
  if (!dateStr) return 0;
  const m = String(dateStr).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return 0;
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  const d = new Date(yyyy, mm - 1, dd);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
};

const parseFCFA = (raw?: string): number => {
  if (!raw) return 0;
  const s = String(raw)
    .replace(/\s/g, '')
    .replace(/FCFA|XOF|F\.?CFA|CFA/gi, '')
    .replace(/[^\d,.-]/g, '');

  if (!s) return 0;

  // Cas le plus courant: "1,250,000" => 1250000
  // Cas FR: "1.250.000" => 1250000 (on retire les points si pas de décimales)
  const hasComma = s.includes(',');
  const hasDot = s.includes('.');

  let cleaned = s;

  if (hasComma && hasDot) {
    // on retire les séparateurs de milliers (virgules), garde le point décimal éventuel
    cleaned = cleaned.replace(/,/g, '');
  } else if (hasComma && !hasDot) {
    // virgule = séparateur milliers (on la retire)
    cleaned = cleaned.replace(/,/g, '');
  } else if (hasDot && !hasComma) {
    // si plusieurs points => probablement milliers
    const dots = (cleaned.match(/\./g) || []).length;
    if (dots >= 2) cleaned = cleaned.replace(/\./g, '');
  }

  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
};

const formatFCFA = (n: number) =>
  `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Math.round(n))} FCFA`;

const generateHash = (data: string): string => {
  let hash = 2166136261;
  for (let i = 0; i < data.length; i++) {
    hash ^= data.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `SHA3:${(hash >>> 0).toString(16).padStart(12, '0')}...`;
};

const subtypeIcons: Record<string, string> = {
  Mission: '🚗',
  Équipement: '🔧',
  Formation: '🎓',
  Fournitures: '📦',
  Transport: '🚌',
  Autre: '📋',
};

const priorityRank: Record<string, number> = { urgent: 3, high: 2, normal: 1 };

export default function DepensesPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedDemande, setSelectedDemande] = useState<string | null>(null);

  // "même travail" : recherche, tri, filtres intelligents + persistance
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [missingDocsOnly, setMissingDocsOnly] = useState(false);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [largeOnly, setLargeOnly] = useState(false);

  // Navigation / persistance
  const { updateFilters, getFilters } = usePageNavigation('depenses');

  // Restore
  useEffect(() => {
    try {
      const saved = getFilters?.();
      if (!saved) return;

      if (saved.statusFilter) setStatusFilter(saved.statusFilter);
      if (typeof saved.searchQuery === 'string') setSearchQuery(saved.searchQuery);
      if (saved.sortMode) setSortMode(saved.sortMode);
      if (typeof saved.categoryFilter === 'string') setCategoryFilter(saved.categoryFilter);
      if (typeof saved.missingDocsOnly === 'boolean') setMissingDocsOnly(saved.missingDocsOnly);
      if (typeof saved.urgentOnly === 'boolean') setUrgentOnly(saved.urgentOnly);
      if (typeof saved.largeOnly === 'boolean') setLargeOnly(saved.largeOnly);
      if (typeof saved.selectedDemande === 'string') setSelectedDemande(saved.selectedDemande);
    } catch {
      // silent
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist
  useEffect(() => {
    try {
      updateFilters?.({
        statusFilter,
        searchQuery,
        sortMode,
        categoryFilter,
        missingDocsOnly,
        urgentOnly,
        largeOnly,
        selectedDemande,
      });
    } catch {
      // silent
    }
  }, [statusFilter, searchQuery, sortMode, categoryFilter, missingDocsOnly, urgentOnly, largeOnly, selectedDemande, updateFilters]);

  // Base: uniquement les dépenses
  const depensesDemandes = useMemo(() => {
    return (demandesRH as HRRequest[])
      .filter((d: any) => d.type === 'Dépense')
      .map((d: any) => {
        const amountNumber = parseFCFA(d.amount);
        const hasDocuments = Boolean(d.documents && d.documents.length > 0);
        const subtype = d.subtype || 'Autre';
        const dateMs = parseFRDateToMs(d.date);
        const isUrgentPending = d.priority === 'urgent' && d.status === 'pending';
        const isMissingDocsPending = !hasDocuments && d.status === 'pending';
        const isLarge = amountNumber >= 250000; // seuil "préventif" (ajuste si besoin)

        return {
          ...d,
          subtype,
          amountNumber,
          hasDocuments,
          dateMs,
          isUrgentPending,
          isMissingDocsPending,
          isLarge,
        };
      });
  }, []);

  // Auto-sync sidebar count (pending dépenses)
  useAutoSyncCounts(
    'depenses',
    () => depensesDemandes.filter((d: any) => d.status === 'pending').length,
    { interval: 10000, immediate: true }
  );

  // Stats + catégories (comptage + montants)
  const stats = useMemo(() => {
    const pending = depensesDemandes.filter((d: any) => d.status === 'pending');
    const validated = depensesDemandes.filter((d: any) => d.status === 'validated');
    const rejected = depensesDemandes.filter((d: any) => d.status === 'rejected');

    const totalPending = pending.reduce((acc: number, d: any) => acc + (d.amountNumber || 0), 0);
    const totalValidated = validated.reduce((acc: number, d: any) => acc + (d.amountNumber || 0), 0);

    const categories: Record<string, { count: number; pending: number; total: number }> = {};
    depensesDemandes.forEach((d: any) => {
      const key = d.subtype || 'Autre';
      if (!categories[key]) categories[key] = { count: 0, pending: 0, total: 0 };
      categories[key].count += 1;
      categories[key].total += d.amountNumber || 0;
      if (d.status === 'pending') categories[key].pending += 1;
    });

    const missingDocsPending = depensesDemandes.filter((d: any) => d.isMissingDocsPending).length;
    const urgentPending = depensesDemandes.filter((d: any) => d.isUrgentPending).length;
    const largePending = depensesDemandes.filter((d: any) => d.status === 'pending' && d.isLarge).length;

    return {
      total: depensesDemandes.length,
      pending: pending.length,
      validated: validated.length,
      rejected: rejected.length,
      totalPending,
      totalValidated,
      missingDocsPending,
      urgentPending,
      largePending,
      categories,
    };
  }, [depensesDemandes]);

  const filteredDemandes = useMemo(() => {
    let result = [...depensesDemandes] as any[];

    // statut
    if (statusFilter !== 'all') result = result.filter((d) => d.status === statusFilter);

    // catégorie
    if (categoryFilter !== 'all') result = result.filter((d) => (d.subtype || 'Autre') === categoryFilter);

    // toggles intelligents
    if (missingDocsOnly) result = result.filter((d) => d.isMissingDocsPending);
    if (urgentOnly) result = result.filter((d) => d.isUrgentPending);
    if (largeOnly) result = result.filter((d) => d.status === 'pending' && d.isLarge);

    // recherche
    const q = normalize(searchQuery);
    if (q) {
      result = result.filter((d) => {
        const hay = normalize(
          [
            d.id,
            d.agent,
            d.bureau,
            d.subtype,
            d.reason,
            d.amount,
            d.status,
            d.priority,
            d.validatedBy,
            d.impactFinance,
          ].join(' | ')
        );
        return hay.includes(q);
      });
    }

    // tri
    result.sort((a, b) => {
      if (sortMode === 'oldest') return (a.dateMs || 0) - (b.dateMs || 0);
      if (sortMode === 'amount_desc') return (b.amountNumber || 0) - (a.amountNumber || 0);
      if (sortMode === 'amount_asc') return (a.amountNumber || 0) - (b.amountNumber || 0);
      if (sortMode === 'priority') return (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);
      if (sortMode === 'missing_docs') {
        // d'abord pièces manquantes (pending), ensuite le reste par récence
        const aKey = a.isMissingDocsPending ? 0 : 1;
        const bKey = b.isMissingDocsPending ? 0 : 1;
        if (aKey !== bKey) return aKey - bKey;
        return (b.dateMs || 0) - (a.dateMs || 0);
      }
      // recent
      return (b.dateMs || 0) - (a.dateMs || 0);
    });

    return result;
  }, [depensesDemandes, statusFilter, categoryFilter, missingDocsOnly, urgentOnly, largeOnly, searchQuery, sortMode]);

  const selectedD = useMemo(() => {
    return selectedDemande ? (depensesDemandes.find((d: any) => d.id === selectedDemande) as any) : null;
  }, [selectedDemande, depensesDemandes]);

  const resetAll = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setMissingDocsOnly(false);
    setUrgentOnly(false);
    setLargeOnly(false);
    setSearchQuery('');
    setSortMode('recent');
    addToast('Filtres réinitialisés', 'info');
  };

  // Actions
  const handleApprove = (demande: any) => {
    if (!demande) return;
    const hash = generateHash(`${demande.id}-${Date.now()}-approve`);
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'depenses',
      action: 'budget_approval',
      targetId: demande.id,
      targetType: 'HRRequest',
      details: `Dépense approuvée: ${formatFCFA(demande.amountNumber || 0)} - Agent: ${demande.agent} - Hash: ${hash}`,
    });
    addToast(`Dépense approuvée ✓ (trace finance à générer)`, 'success');
  };

  const handleRequestPieces = (demande: any) => {
    if (!demande) return;
    const msg =
      window.prompt('Quelles pièces justificatives demandez-vous ? (trace audit)', 'Facture, devis, bon de commande…') ||
      'Pièces justificatives demandées';
    const hash = generateHash(`${demande.id}-${Date.now()}-request_pieces-${msg}`);
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'depenses',
      action: 'request_complement',
      targetId: demande.id,
      targetType: 'HRRequest',
      details: `${msg} - Hash: ${hash}`,
    });
    addToast('Pièces justificatives demandées', 'warning');
  };

  const handleReject = (demande: any) => {
    if (!demande) return;
    const reason = window.prompt('Motif du refus (trace audit) :', 'Motif à préciser') || 'Motif à préciser';
    const hash = generateHash(`${demande.id}-${Date.now()}-reject-${reason}`);
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'depenses',
      action: 'rejection',
      targetId: demande.id,
      targetType: 'HRRequest',
      details: `Dépense refusée: ${reason} - Hash: ${hash}`,
    });
    addToast('Dépense refusée', 'error');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            💸 Demandes Dépenses
            <Badge variant="warning">{stats.pending} en attente</Badge>
            {stats.missingDocsPending > 0 && <Badge variant="urgent">⚠️ {stats.missingDocsPending} pièces manquantes</Badge>}
            {stats.urgentPending > 0 && <Badge variant="urgent">🚨 {stats.urgentPending} urgentes</Badge>}
          </h1>
          <p className="text-sm text-slate-400">Validation des dépenses RH avec lien finance + traçabilité audit</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={resetAll}>
            Réinitialiser
          </Button>
          <Button onClick={() => addToast('Nouvelle dépense créée', 'success')}>+ Nouvelle dépense</Button>
        </div>
      </div>

      {/* Barre recherche + tri + toggles */}
      <div className="flex flex-wrap items-center gap-2">
        <div className={cn('flex-1 min-w-[220px] rounded border px-3 py-2', darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200')}>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher (agent, bureau, catégorie, motif, ID, montant, trace finance...)"
            className={cn('w-full bg-transparent outline-none text-sm', darkMode ? 'text-slate-100 placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400')}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant={sortMode === 'recent' ? 'default' : 'secondary'} onClick={() => setSortMode('recent')}>
            🕒 Récentes
          </Button>
          <Button size="sm" variant={sortMode === 'amount_desc' ? 'default' : 'secondary'} onClick={() => setSortMode('amount_desc')}>
            💰 Montant ↓
          </Button>
          <Button size="sm" variant={sortMode === 'priority' ? 'default' : 'secondary'} onClick={() => setSortMode('priority')}>
            🚨 Priorité
          </Button>
          <Button size="sm" variant={sortMode === 'missing_docs' ? 'default' : 'secondary'} onClick={() => setSortMode('missing_docs')}>
            📎 Pièces d'abord
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant={missingDocsOnly ? 'default' : 'secondary'} onClick={() => setMissingDocsOnly((v) => !v)}>
            📎 Pièces manquantes
          </Button>
          <Button size="sm" variant={urgentOnly ? 'default' : 'secondary'} onClick={() => setUrgentOnly((v) => !v)}>
            🚨 Urgentes
          </Button>
          <Button size="sm" variant={largeOnly ? 'default' : 'secondary'} onClick={() => setLargeOnly((v) => !v)}>
            💰 Gros montants
          </Button>
        </div>
      </div>

      {/* Résumé financier */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
            <p className="text-[10px] text-slate-400">En attente</p>
            <p className="font-mono text-sm text-amber-300 mt-1">{formatFCFA(stats.totalPending)}</p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.validated}</p>
            <p className="text-[10px] text-slate-400">Validées</p>
            <p className="font-mono text-sm text-emerald-300 mt-1">{formatFCFA(stats.totalValidated)}</p>
          </CardContent>
        </Card>

        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
            <p className="text-[10px] text-slate-400">Refusées</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
            <p className="text-[10px] text-slate-400">Total</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.largePending}</p>
            <p className="text-[10px] text-slate-400">Gros montants (pending)</p>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par catégorie (cliquable) */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="font-bold text-sm">📊 Par catégorie</h3>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant={categoryFilter === 'all' ? 'default' : 'secondary'} onClick={() => setCategoryFilter('all')}>
                Toutes
              </Button>
              {Object.keys(stats.categories).slice(0, 6).map((cat) => (
                <Button
                  key={cat}
                  size="sm"
                  variant={categoryFilter === cat ? 'default' : 'secondary'}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {subtypeIcons[cat] || '📋'} {cat} ({stats.categories[cat].count})
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {Object.entries(stats.categories).map(([cat, v]) => (
              <Badge
                key={cat}
                variant={categoryFilter === cat ? 'warning' : 'default'}
                className="text-sm cursor-pointer"
                onClick={() => setCategoryFilter((cur) => (cur === cat ? 'all' : cat))}
                title="Cliquer pour filtrer"
              >
                {subtypeIcons[cat] || '📋'} {cat}: {v.count} • Pending {v.pending} • {formatFCFA(v.total)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtres statut */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'Toutes', count: stats.total },
          { id: 'pending', label: '⏳ En attente', count: stats.pending },
          { id: 'validated', label: '✅ Validées', count: stats.validated },
          { id: 'rejected', label: '❌ Refusées', count: stats.rejected },
        ].map((f) => (
          <Button
            key={f.id}
            size="sm"
            variant={statusFilter === f.id ? 'default' : 'secondary'}
            onClick={() => setStatusFilter(f.id as StatusFilter)}
          >
            {f.label} ({f.count})
          </Button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Liste */}
        <div className="lg:col-span-2 space-y-3">
          {filteredDemandes.map((demande: any) => {
            const isSelected = selectedDemande === demande.id;

            return (
              <Card
                key={demande.id}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected ? 'ring-2 ring-orange-500' : 'hover:border-orange-500/50',
                  demande.isUrgentPending && 'border-l-4 border-l-red-500',
                  demande.status === 'validated' && 'border-l-4 border-l-emerald-500',
                  demande.status === 'rejected' && 'border-l-4 border-l-slate-500 opacity-60',
                  demande.isMissingDocsPending && 'border-r-4 border-r-amber-500'
                )}
                onClick={() => setSelectedDemande(demande.id)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center font-bold text-white">
                        {demande.initials}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] text-orange-400">{demande.id}</span>

                          <Badge variant="warning">
                            {subtypeIcons[demande.subtype] || '📋'} {demande.subtype}
                          </Badge>

                          <BureauTag bureau={demande.bureau} />

                          {demande.isMissingDocsPending && <Badge variant="urgent">⚠️ Pièces manquantes</Badge>}
                          {demande.isLarge && demande.status === 'pending' && <Badge variant="warning">💰 Gros montant</Badge>}
                        </div>

                        <h3 className="font-bold">{demande.agent}</h3>
                        <p className="text-xs text-slate-400">{demande.reason}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-mono text-lg font-bold text-amber-400">
                        {demande.amountNumber ? formatFCFA(demande.amountNumber) : `${demande.amount || '—'} FCFA`}
                      </p>

                      <Badge
                        variant={
                          demande.status === 'validated'
                            ? 'success'
                            : demande.status === 'rejected'
                              ? 'default'
                              : demande.priority === 'urgent'
                                ? 'urgent'
                                : 'info'
                        }
                        pulse={demande.isUrgentPending}
                      >
                        {demande.status === 'validated' ? '✅ Payée' : demande.status === 'rejected' ? '❌ Refusée' : demande.priority}
                      </Badge>

                      {demande.date && <p className="text-[10px] text-slate-500 mt-1">{demande.date}</p>}
                    </div>
                  </div>

                  {/* Documents */}
                  {demande.hasDocuments && (
                    <div className="flex gap-1 mb-2 flex-wrap">
                      {demande.documents?.map((doc: any) => (
                        <Badge key={doc.id} variant="info" className="text-[9px]">
                          📎 {doc.type}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Traçabilité validation */}
                  {demande.validatedBy && (
                    <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-xs mb-2">
                      <p className="text-emerald-400">
                        ✅ Validée par {demande.validatedBy} {demande.validatedAt ? `- ${demande.validatedAt}` : ''}
                      </p>
                      {demande.impactFinance && (
                        <p className="text-slate-400 mt-1">
                          💰 Trace finance: <span className="font-mono">{demande.impactFinance}</span>
                        </p>
                      )}
                      {demande.hash && (
                        <p className="text-slate-500 mt-1">
                          🔐 Hash: <span className="font-mono">{demande.hash}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  {demande.status === 'pending' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => {
                          const ok = window.confirm(`Valider la dépense ${demande.id} (${demande.amountNumber ? formatFCFA(demande.amountNumber) : demande.amount}) ?`);
                          if (ok) handleApprove(demande);
                        }}
                      >
                        ✓ Valider & Payer
                      </Button>

                      {!demande.hasDocuments && (
                        <Button size="sm" variant="warning" onClick={() => handleRequestPieces(demande)}>
                          📎 Demander pièces
                        </Button>
                      )}

                      <Button size="sm" variant="destructive" onClick={() => handleReject(demande)}>
                        ✕ Refuser
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Panel détail */}
        <div className="lg:col-span-1">
          {selectedD ? (
            <Card className="sticky top-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-700/50">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center font-bold text-white">
                    {selectedD.initials}
                  </div>
                  <div>
                    <h3 className="font-bold">{selectedD.agent}</h3>
                    <p className="font-mono text-amber-400 font-bold">
                      {selectedD.amountNumber ? formatFCFA(selectedD.amountNumber) : `${selectedD.amount || '—'} FCFA`}
                    </p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <Badge variant="warning">
                        {subtypeIcons[selectedD.subtype] || '📋'} {selectedD.subtype}
                      </Badge>
                      <BureauTag bureau={selectedD.bureau} />
                      {selectedD.isMissingDocsPending && <Badge variant="urgent">⚠️ Pièces manquantes</Badge>}
                      {selectedD.isLarge && selectedD.status === 'pending' && <Badge variant="warning">💰 Gros montant</Badge>}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                    <p className="text-xs text-slate-400 mb-1">Motif</p>
                    <p>{selectedD.reason}</p>
                  </div>

                  {/* Pièces justificatives */}
                  <div>
                    <h4 className="font-bold text-xs mb-2">📎 Pièces justificatives</h4>
                    {selectedD.documents && selectedD.documents.length > 0 ? (
                      <div className="space-y-1">
                        {selectedD.documents.map((doc: any) => (
                          <div
                            key={doc.id}
                            className={cn('p-2 rounded flex items-center justify-between', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}
                          >
                            <span className="text-xs">{doc.name}</span>
                            <Badge variant="success">✓</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400">
                        ⚠️ Aucune pièce jointe - conformité non vérifiable
                      </div>
                    )}
                  </div>

                  {/* Lien finance */}
                  {selectedD.impactFinance && (
                    <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
                      <p className="text-xs text-emerald-400">💰 Trace finance</p>
                      <p className="font-mono text-xs">{selectedD.impactFinance}</p>
                    </div>
                  )}

                  {/* Hash */}
                  {selectedD.hash && (
                    <div className="p-2 rounded bg-slate-700/30">
                      <p className="text-[10px] text-slate-400">🔐 Traçabilité</p>
                      <p className="font-mono text-[10px] truncate">{selectedD.hash}</p>
                    </div>
                  )}

                  {/* Rappel statut */}
                  <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                    <p className="text-[10px] text-slate-400">Statut</p>
                    <Badge
                      variant={
                        selectedD.status === 'validated'
                          ? 'success'
                          : selectedD.status === 'rejected'
                            ? 'default'
                            : selectedD.priority === 'urgent'
                              ? 'urgent'
                              : 'info'
                      }
                      pulse={selectedD.isUrgentPending}
                    >
                      {selectedD.status}
                    </Badge>
                    {selectedD.date && <p className="text-[10px] text-slate-500 mt-1">Créée le {selectedD.date}</p>}
                  </div>
                </div>

                {selectedD.status === 'pending' && (
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-700/50">
                    <Button size="sm" variant="success" onClick={() => handleApprove(selectedD)}>
                      ✓ Valider & Payer
                    </Button>
                    {!selectedD.hasDocuments && (
                      <Button size="sm" variant="warning" onClick={() => handleRequestPieces(selectedD)}>
                        📎 Demander les pièces
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => handleReject(selectedD)}>
                      ✕ Refuser
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="p-8 text-center">
                <span className="text-4xl mb-4 block">💸</span>
                <p className="text-slate-400">Sélectionnez une dépense</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {filteredDemandes.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-400">Aucune dépense trouvée avec les filtres sélectionnés</p>
            <Button size="sm" variant="outline" onClick={resetAll} className="mt-4">
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
