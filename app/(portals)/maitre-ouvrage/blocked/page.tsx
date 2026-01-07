'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { blockedDossiers } from '@/lib/data';
import type { BlockedDossier } from '@/lib/types/bmo.types';

type ViewMode = 'all' | 'type' | 'impact' | 'bureau';
type ImpactFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';
type SortMode =
  | 'priority_desc'
  | 'priority_asc'
  | 'delay_desc'
  | 'delay_asc'
  | 'impact'
  | 'amount_desc'
  | 'amount_asc';

const IMPACT_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const IMPACT_WEIGHT: Record<string, number> = { critical: 100, high: 50, medium: 20, low: 5 };

function getImpactBorder(impact: string) {
  switch (impact) {
    case 'critical':
      return 'border-l-red-500';
    case 'high':
      return 'border-l-amber-500';
    case 'medium':
      return 'border-l-blue-500';
    case 'low':
      return 'border-l-slate-500';
    default:
      return 'border-l-slate-500';
  }
}

function getImpactBadgeVariant(impact: string) {
  if (impact === 'critical') return 'urgent';
  if (impact === 'high') return 'warning';
  if (impact === 'medium') return 'info';
  return 'default';
}

function parseAmountFCFA(amount: unknown): number {
  // Supporte "1 200 000 FCFA", "1200000", etc.
  const s = String(amount ?? '').replace(/[^\d]/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function computePriority(d: BlockedDossier): number {
  // Score = (poidsImpact) * (délai+1) * (1 + montant/1_000_000)
  const w = IMPACT_WEIGHT[d.impact] ?? 1;
  const delay = Math.max(0, d.delay ?? 0) + 1;
  const amount = parseAmountFCFA(d.amount);
  const factor = 1 + amount / 1_000_000;
  return Math.round(w * delay * factor);
}

async function sha256Hex(input: string) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

type RegisterEntry = {
  at: string; // ISO
  batchId?: string;
  action: 'substitution' | 'escalation' | 'request_complement' | 'modification' | 'audit';
  actionInternal: 'substitution_open' | 'escalade' | 'complement' | 'resolution' | 'bulk'; // Pour le registre interne
  dossierId: string;
  type: string;
  subject: string;
  bureau: string;
  impact: string;
  delay: number;
  amountRaw: string;
  amount: number;
  priority: number;
  userId: string;
  userName: string;
  userRole: string;
  details: string;
  hash: string; // SHA-256:...
};

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function BlockedPageV2() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog, openSubstitutionModal } = useBMOStore();

  const data = blockedDossiers as unknown as BlockedDossier[];

  const [viewMode, setViewMode] = useState<ViewMode>('impact');
  const [impactFilter, setImpactFilter] = useState<ImpactFilter>('all');

  const [q, setQ] = useState('');
  const [sort, setSort] = useState<SortMode>('priority_desc');

  // Sélection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal résolution (unitaire)
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedDossier = useMemo(
    () => (selectedId ? data.find((d) => d.id === selectedId) ?? null : null),
    [selectedId, data]
  );
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');

  // Modal résolution en masse
  const [showBulkResolve, setShowBulkResolve] = useState(false);
  const [bulkResolveNote, setBulkResolveNote] = useState('');

  // Registre local exportable
  const [register, setRegister] = useState<RegisterEntry[]>([]);
  const [lastDecisionHash, setLastDecisionHash] = useState<string | null>(null);

  const currentUser = useMemo(
    () => ({
      id: 'USR-001',
      name: 'A. DIALLO',
      role: 'Directeur Général',
      bureau: 'BMO',
    }),
    []
  );

  // ESC ferme modals
  useEffect(() => {
    const anyModalOpen = showResolutionModal || showBulkResolve;
    if (!anyModalOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowResolutionModal(false);
        setShowBulkResolve(false);
        setResolutionNote('');
        setBulkResolveNote('');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showResolutionModal, showBulkResolve]);

  const filteredDossiers = useMemo(() => {
    const query = q.trim().toLowerCase();

    const filtered = data.filter((d) => {
      if (impactFilter !== 'all' && d.impact !== impactFilter) return false;
      if (!query) return true;

      const hay = [
        d.id,
        d.type,
        d.subject,
        d.reason,
        d.project,
        d.impact,
        d.bureau,
        d.responsible,
        String(d.amount ?? ''),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return hay.includes(query);
    });

    const sorted = [...filtered].sort((a, b) => {
      const pa = computePriority(a);
      const pb = computePriority(b);

      if (sort === 'priority_desc') return pb - pa;
      if (sort === 'priority_asc') return pa - pb;

      if (sort === 'delay_desc') return (b.delay ?? 0) - (a.delay ?? 0);
      if (sort === 'delay_asc') return (a.delay ?? 0) - (b.delay ?? 0);

      if (sort === 'impact') return (IMPACT_ORDER[a.impact] ?? 99) - (IMPACT_ORDER[b.impact] ?? 99);

      if (sort === 'amount_desc') return parseAmountFCFA(b.amount) - parseAmountFCFA(a.amount);
      if (sort === 'amount_asc') return parseAmountFCFA(a.amount) - parseAmountFCFA(b.amount);

      return 0;
    });

    return sorted;
  }, [data, impactFilter, q, sort]);

  const dossiersByType = useMemo(() => {
    const grouped: Record<string, BlockedDossier[]> = {};
    data.forEach((d) => {
      const key = d.type || 'Autre';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(d);
    });
    return grouped;
  }, [data]);

  const dossiersByImpact = useMemo(
    () => ({
      critical: data.filter((d) => d.impact === 'critical'),
      high: data.filter((d) => d.impact === 'high'),
      medium: data.filter((d) => d.impact === 'medium'),
      low: data.filter((d) => d.impact === 'low'),
    }),
    [data]
  );

  const dossiersByBureau = useMemo(() => {
    const grouped: Record<string, BlockedDossier[]> = {};
    data.forEach((d) => {
      const key = d.bureau || '—';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(d);
    });
    return grouped;
  }, [data]);

  const stats = useMemo(() => {
    const total = data.length;
    const avgDelay = total === 0 ? 0 : Math.round(data.reduce((acc, d) => acc + (d.delay ?? 0), 0) / total);
    const avgPriority = total === 0 ? 0 : Math.round(data.reduce((acc, d) => acc + computePriority(d), 0) / total);

    return {
      total,
      critical: dossiersByImpact.critical.length,
      high: dossiersByImpact.high.length,
      medium: dossiersByImpact.medium.length,
      low: dossiersByImpact.low.length,
      avgDelay,
      avgPriority,
    };
  }, [data, dossiersByImpact]);

  // -------- Sélection helpers --------
  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const selectAllVisible = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredDossiers.forEach((d) => next.add(d.id));
      return next;
    });
  }, [filteredDossiers]);

  const deselectAllVisible = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredDossiers.forEach((d) => next.delete(d.id));
      return next;
    });
  }, [filteredDossiers]);

  const selectedDossiers = useMemo(() => {
    if (selectedIds.size === 0) return [];
    const map = new Map(data.map((d) => [d.id, d]));
    return Array.from(selectedIds)
      .map((id) => map.get(id))
      .filter(Boolean) as BlockedDossier[];
  }, [selectedIds, data]);

  const targets = useMemo(() => {
    // Règle : si sélection non vide => actions sur sélection, sinon sur filtre courant
    return selectedDossiers.length > 0 ? selectedDossiers : filteredDossiers;
  }, [selectedDossiers, filteredDossiers]);

  // -------- Registre / logs --------
  const pushRegisterEntry = useCallback((entry: RegisterEntry) => {
    setRegister((prev) => [entry, ...prev].slice(0, 500)); // garde 500 dernières
    setLastDecisionHash(entry.hash.replace('SHA-256:', ''));
  }, []);

  const logAction = useCallback(
    (payload: {
      action: 'substitution_open' | 'escalade' | 'complement' | 'resolution' | 'bulk';
      dossier: BlockedDossier;
      details: string;
      hash: string;
      batchId?: string;
    }) => {
      // Mapping des actions internes vers ActionLogType
      const actionMap: Record<string, RegisterEntry['action']> = {
        substitution_open: 'substitution',
        escalade: 'escalation',
        complement: 'request_complement',
        resolution: 'modification',
        bulk: 'audit',
      };

      const actionLogType = actionMap[payload.action] || 'audit';

      // Store (BMO)
      addActionLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: actionLogType,
        module: 'blocked',
        targetId: payload.dossier.id,
        targetType: payload.dossier.type,
        targetLabel: payload.dossier.subject,
        details: `${payload.details} • Hash: ${payload.hash}`,
        bureau: payload.dossier.bureau,
      });

      // Registre local exportable
      pushRegisterEntry({
        at: new Date().toISOString(),
        batchId: payload.batchId,
        action: actionLogType,
        actionInternal: payload.action,
        dossierId: payload.dossier.id,
        type: payload.dossier.type,
        subject: payload.dossier.subject,
        bureau: payload.dossier.bureau,
        impact: payload.dossier.impact,
        delay: payload.dossier.delay ?? 0,
        amountRaw: String(payload.dossier.amount ?? ''),
        amount: parseAmountFCFA(payload.dossier.amount),
        priority: computePriority(payload.dossier),
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        details: payload.details,
        hash: payload.hash,
      });
    },
    [addActionLog, currentUser, pushRegisterEntry]
  );

  // -------- Actions unitaires --------
  const handleSubstitute = useCallback(
    (dossier: BlockedDossier) => {
      // Traçabilité "open" (utile en audit)
      const payload = {
        dossierId: dossier.id,
        action: 'substitution_open',
        at: new Date().toISOString(),
      };
      sha256Hex(JSON.stringify(payload)).then((hex) => {
        logAction({
          action: 'substitution_open',
          dossier,
          details: 'Ouverture modal substitution',
          hash: `SHA-256:${hex}`,
        });
      });

      openSubstitutionModal(dossier);
    },
    [openSubstitutionModal, logAction]
  );

  const handleEscalate = useCallback(
    async (dossier: BlockedDossier, batchId?: string) => {
      const payload = {
        batchId,
        dossierId: dossier.id,
        action: 'escalade',
        impact: dossier.impact,
        delay: dossier.delay,
        amount: parseAmountFCFA(dossier.amount),
        at: new Date().toISOString(),
      };
      const hex = await sha256Hex(JSON.stringify(payload));
      logAction({
        action: 'escalade',
        dossier,
        details: `Escalade CODIR • Impact=${dossier.impact} • Délai=J+${dossier.delay}`,
        hash: `SHA-256:${hex}`,
        batchId,
      });
    },
    [logAction]
  );

  const handleRequestDocument = useCallback(
    async (dossier: BlockedDossier, batchId?: string) => {
      const payload = {
        batchId,
        dossierId: dossier.id,
        action: 'complement',
        at: new Date().toISOString(),
      };
      const hex = await sha256Hex(JSON.stringify(payload));
      logAction({
        action: 'complement',
        dossier,
        details: 'Demande de pièce complémentaire',
        hash: `SHA-256:${hex}`,
        batchId,
      });
    },
    [logAction]
  );

  const handleResolve = useCallback(
    async (dossier: BlockedDossier, justification: string, batchId?: string) => {
      const payload = {
        batchId,
        dossierId: dossier.id,
        action: 'resolution',
        justification: justification.trim(),
        at: new Date().toISOString(),
      };
      const hex = await sha256Hex(JSON.stringify(payload));
      logAction({
        action: 'resolution',
        dossier,
        details: `Résolution • Justification: ${justification.trim()}`,
        hash: `SHA-256:${hex}`,
        batchId,
      });
    },
    [logAction]
  );

  // -------- Actions en masse --------
  const runBulk = useCallback(
    async (mode: 'escalade' | 'complement' | 'resolution', note?: string) => {
      if (targets.length === 0) {
        addToast('Aucun dossier cible', 'warning');
        return;
      }

      const batchId = `BATCH-${Date.now()}`;
      const startedAt = new Date().toISOString();

      // Trace le "bulk" comme en-tête (optionnel mais utile)
      const bulkHeader = {
        batchId,
        action: `bulk_${mode}`,
        count: targets.length,
        note: note?.trim() || '',
        startedAt,
        at: startedAt,
      };
      const bulkHash = await sha256Hex(JSON.stringify(bulkHeader));
      setRegister((prev) => [
        {
          at: startedAt,
          batchId,
          action: 'audit',
          actionInternal: 'bulk',
          dossierId: `__BULK__${batchId}`,
          type: 'BulkOperation',
          subject: `Bulk ${mode} (${targets.length})`,
          bureau: currentUser.bureau,
          impact: '—',
          delay: 0,
          amountRaw: '—',
          amount: 0,
          priority: 0,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          details: `Opération en masse: ${mode} • Note: ${note?.trim() || '—'}`,
          hash: `SHA-256:${bulkHash}`,
        },
        ...prev,
      ]);

      for (const dossier of targets) {
        if (mode === 'escalade') await handleEscalate(dossier, batchId);
        if (mode === 'complement') await handleRequestDocument(dossier, batchId);
        if (mode === 'resolution') await handleResolve(dossier, note || 'Résolution en masse', batchId);
      }

      addToast(
        mode === 'escalade'
          ? `⬆️ Escalade en masse: ${targets.length} dossier(s)`
          : mode === 'complement'
          ? `📎 Demande pièce en masse: ${targets.length} dossier(s)`
          : `✓ Résolution en masse: ${targets.length} dossier(s)`,
        mode === 'resolution' ? 'success' : mode === 'escalade' ? 'warning' : 'info'
      );
    },
    [targets, addToast, handleEscalate, handleRequestDocument, handleResolve, currentUser]
  );

  // Export registre
  const exportRegister = useCallback(() => {
    const filename = `registre_decisions_${new Date().toISOString().slice(0, 10)}.json`;
    downloadJson(filename, {
      generatedAt: new Date().toISOString(),
      user: currentUser,
      filters: { viewMode, impactFilter, q, sort },
      selection: Array.from(selectedIds),
      register,
    });
    addToast('📤 Registre exporté (JSON)', 'success');
  }, [register, currentUser, viewMode, impactFilter, q, sort, selectedIds, addToast]);

  const copyLastHash = useCallback(async () => {
    if (!lastDecisionHash) return;
    await navigator.clipboard.writeText(lastDecisionHash);
    addToast('Hash copié', 'success');
  }, [lastDecisionHash, addToast]);

  // Ouvre modal résolution unitaire
  const openResolveModal = useCallback((dossier: BlockedDossier) => {
    setSelectedId(dossier.id);
    setShowResolutionModal(true);
    setResolutionNote('');
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            🚧 Dossiers bloqués
            <Badge variant="urgent">{stats.total}</Badge>
            <Badge variant="info">Priorité moy.: {stats.avgPriority}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Résumé par type et impact • Délai moyen: <span className="text-amber-400 font-bold">{stats.avgDelay}j</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Button size="sm" variant={viewMode === 'impact' ? 'default' : 'secondary'} onClick={() => setViewMode('impact')}>
            Par impact
          </Button>
          <Button size="sm" variant={viewMode === 'type' ? 'default' : 'secondary'} onClick={() => setViewMode('type')}>
            Par type
          </Button>
          <Button size="sm" variant={viewMode === 'bureau' ? 'default' : 'secondary'} onClick={() => setViewMode('bureau')}>
            Par bureau
          </Button>
          <Button size="sm" variant={viewMode === 'all' ? 'default' : 'secondary'} onClick={() => setViewMode('all')}>
            Liste
          </Button>
        </div>
      </div>

      {/* Barre "Commandement" BMO : Recherche + tri + actions en masse */}
      <Card className={cn(darkMode ? 'bg-slate-900/30' : 'bg-white')}>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher (id, sujet, raison, projet, bureau...)"
                className={cn(
                  'h-9 w-96 max-w-full rounded-md border px-3 text-sm outline-none',
                  darkMode ? 'bg-slate-900/40 border-slate-700 text-slate-200' : 'bg-white border-slate-200'
                )}
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortMode)}
                className={cn(
                  'h-9 rounded-md border px-3 text-sm',
                  darkMode ? 'bg-slate-900/40 border-slate-700 text-slate-200' : 'bg-white border-slate-200'
                )}
              >
                <option value="priority_desc">Priorité ↓</option>
                <option value="priority_asc">Priorité ↑</option>
                <option value="delay_desc">Délai ↓</option>
                <option value="delay_asc">Délai ↑</option>
                <option value="impact">Impact (critique→faible)</option>
                <option value="amount_desc">Montant ↓</option>
                <option value="amount_asc">Montant ↑</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              {(['all', 'critical', 'high', 'medium', 'low'] as ImpactFilter[]).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={impactFilter === f ? 'default' : 'secondary'}
                  onClick={() => setImpactFilter(f)}
                >
                  {f === 'all' ? 'Tous' : f}
                </Button>
              ))}
            </div>
          </div>

          {/* Actions en masse */}
          <div className={cn('rounded-lg border p-3', darkMode ? 'border-slate-700 bg-slate-900/20' : 'border-slate-200 bg-slate-50')}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-slate-400">
                Cibles: <span className="text-slate-200 font-bold">{targets.length}</span>{' '}
                <span className="text-slate-400">
                  ({selectedDossiers.length > 0 ? 'sélection' : 'filtre courant'})
                </span>
                <span className="mx-2 text-slate-500">•</span>
                Sélection: <span className="text-slate-200 font-bold">{selectedIds.size}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={selectAllVisible}>
                  Tout sélectionner (filtre)
                </Button>
                <Button size="sm" variant="secondary" onClick={deselectAllVisible}>
                  Désélectionner (filtre)
                </Button>
                <Button size="sm" variant="secondary" onClick={clearSelection}>
                  Vider sélection
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <Button size="sm" variant="info" onClick={() => runBulk('escalade')}>
                ⬆️ Escalader en masse
              </Button>
              <Button size="sm" variant="secondary" onClick={() => runBulk('complement')}>
                📎 Demander pièces en masse
              </Button>
              <Button size="sm" variant="success" onClick={() => setShowBulkResolve(true)}>
                ✓ Résoudre en masse
              </Button>

              <Link
                href={`/maitre-ouvrage/substitution?ids=${encodeURIComponent(
                  (selectedDossiers.length > 0 ? selectedDossiers : filteredDossiers).map((d) => d.id).join(',')
                )}`}
              >
                <Button size="sm" variant="destructive">
                  ⚡ Substitution en masse
                </Button>
              </Link>

              <div className="flex-1" />

              <Button size="sm" variant="default" onClick={exportRegister}>
                📤 Export registre (JSON)
              </Button>
              <Button size="sm" variant="secondary" disabled={!lastDecisionHash} onClick={copyLastHash}>
                🔗 Copier dernier hash
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerte critique */}
      {stats.critical > 0 && (
        <div
          className={cn(
            'rounded-xl p-3 flex items-center gap-3 border animate-pulse',
            darkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
          )}
        >
          <span className="text-2xl">🚨</span>
          <div className="flex-1">
            <p className="font-bold text-sm text-red-400">{stats.critical} dossier(s) critique(s) — action immédiate</p>
            <p className="text-xs text-slate-400">Priorité = Impact × Délai × Montant.</p>
          </div>
          <Link href="/maitre-ouvrage/substitution">
            <Button size="sm" variant="destructive">⚡ Substitution</Button>
          </Link>
        </div>
      )}

      {/* Stats rapides */}
      <div className="grid grid-cols-5 gap-3">
        <Card className={cn('cursor-pointer transition-all', impactFilter === 'all' && 'ring-2 ring-orange-500')} onClick={() => setImpactFilter('all')}>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-[10px] text-slate-400">Total</p>
          </CardContent>
        </Card>

        <Card className={cn('cursor-pointer transition-all border-red-500/30', impactFilter === 'critical' && 'ring-2 ring-red-500')} onClick={() => setImpactFilter('critical')}>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
            <p className="text-[10px] text-slate-400">Critiques</p>
          </CardContent>
        </Card>

        <Card className={cn('cursor-pointer transition-all border-amber-500/30', impactFilter === 'high' && 'ring-2 ring-amber-500')} onClick={() => setImpactFilter('high')}>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{stats.high}</p>
            <p className="text-[10px] text-slate-400">Élevé</p>
          </CardContent>
        </Card>

        <Card className={cn('cursor-pointer transition-all border-blue-500/30', impactFilter === 'medium' && 'ring-2 ring-blue-500')} onClick={() => setImpactFilter('medium')}>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.medium}</p>
            <p className="text-[10px] text-slate-400">Moyen</p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/30">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">{stats.avgDelay}j</p>
            <p className="text-[10px] text-slate-400">Délai moyen</p>
          </CardContent>
        </Card>
      </div>

      {/* Vue par impact */}
      {viewMode === 'impact' && (
        <div className="space-y-4">
          {(['critical', 'high', 'medium', 'low'] as const).map((impact) => {
            const dossiers = dossiersByImpact[impact].filter((d) => (impactFilter === 'all' ? true : d.impact === impactFilter));
            const query = q.trim().toLowerCase();
            const visible = !query
              ? dossiers
              : dossiers.filter((d) =>
                  [d.id, d.type, d.subject, d.reason, d.project, d.bureau, d.responsible, String(d.amount ?? '')]
                    .join(' ')
                    .toLowerCase()
                    .includes(query)
                );
            if (visible.length === 0) return null;

            return (
              <Card key={impact} className={cn('border-l-4', getImpactBorder(impact))}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {impact === 'critical' && '🚨 Impact Critique'}
                    {impact === 'high' && '⚠️ Impact Élevé'}
                    {impact === 'medium' && '📊 Impact Moyen'}
                    {impact === 'low' && '📋 Impact Faible'}
                    <Badge variant={getImpactBadgeVariant(impact)}>{visible.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {visible.map((dossier) => (
                    <DossierCard
                      key={dossier.id}
                      dossier={dossier}
                      darkMode={darkMode}
                      selected={selectedIds.has(dossier.id)}
                      onToggleSelected={() => toggleSelected(dossier.id)}
                      onSubstitute={() => handleSubstitute(dossier)}
                      onEscalate={async () => {
                        await handleEscalate(dossier);
                        addToast(`⬆️ ${dossier.id} escaladé`, 'warning');
                      }}
                      onRequest={async () => {
                        await handleRequestDocument(dossier);
                        addToast(`📎 Pièce demandée pour ${dossier.id}`, 'info');
                      }}
                      onResolve={() => openResolveModal(dossier)}
                    />
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Vue par type */}
      {viewMode === 'type' && (
        <div className="space-y-4">
          {Object.entries(dossiersByType).map(([type, dossiers]) => {
            const visible = dossiers.filter((d) => (impactFilter === 'all' ? true : d.impact === impactFilter));
            if (visible.length === 0) return null;

            return (
              <Card key={type}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {type === 'Paiement' && '💳'}
                    {type === 'Validation' && '✅'}
                    {type === 'Contrat' && '📜'}
                    {type}
                    <Badge variant="info">{visible.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {visible.map((dossier) => (
                    <DossierCard
                      key={dossier.id}
                      dossier={dossier}
                      darkMode={darkMode}
                      selected={selectedIds.has(dossier.id)}
                      onToggleSelected={() => toggleSelected(dossier.id)}
                      onSubstitute={() => handleSubstitute(dossier)}
                      onEscalate={async () => {
                        await handleEscalate(dossier);
                        addToast(`⬆️ ${dossier.id} escaladé`, 'warning');
                      }}
                      onRequest={async () => {
                        await handleRequestDocument(dossier);
                        addToast(`📎 Pièce demandée pour ${dossier.id}`, 'info');
                      }}
                      onResolve={() => openResolveModal(dossier)}
                    />
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Vue par bureau */}
      {viewMode === 'bureau' && (
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(dossiersByBureau).map(([bureau, dossiers]) => {
            const visible = dossiers
              .filter((d) => (impactFilter === 'all' ? true : d.impact === impactFilter))
              .filter((d) => {
                const query = q.trim().toLowerCase();
                if (!query) return true;
                return [d.id, d.subject, d.reason, d.project, d.type].join(' ').toLowerCase().includes(query);
              });
            if (visible.length === 0) return null;

            return (
              <Card key={bureau}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BureauTag bureau={bureau} />
                    <Badge variant="warning">{visible.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {visible.map((dossier) => (
                    <div
                      key={dossier.id}
                      className={cn('p-2 rounded-lg border-l-4', getImpactBorder(dossier.impact), darkMode ? 'bg-slate-700/30' : 'bg-gray-50')}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(dossier.id)}
                            onChange={() => toggleSelected(dossier.id)}
                          />
                          <div>
                            <span className="font-mono text-[10px] text-orange-400">{dossier.id}</span>
                            <p className="text-xs font-semibold">{dossier.subject}</p>
                            <p className="text-[10px] text-slate-400">Priorité: {computePriority(dossier)}</p>
                          </div>
                        </label>

                        <div className="flex items-center gap-1">
                          <Badge variant="urgent">J+{dossier.delay}</Badge>
                          <Button size="xs" variant="warning" onClick={() => handleSubstitute(dossier)}>⚡</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Vue liste */}
      {viewMode === 'all' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">Sel.</th>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">ID</th>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">Type</th>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">Sujet</th>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">Raison</th>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">Projet</th>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">Bureau</th>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">Impact</th>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">Délai</th>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">Priorité</th>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDossiers.map((dossier) => {
                    const prio = computePriority(dossier);
                    return (
                      <tr key={dossier.id} className={cn('border-t hover:bg-orange-500/5', darkMode ? 'border-slate-700/50' : 'border-gray-100')}>
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(dossier.id)}
                            onChange={() => toggleSelected(dossier.id)}
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">{dossier.id}</span>
                        </td>
                        <td className="px-3 py-2.5"><Badge variant="info">{dossier.type}</Badge></td>
                        <td className="px-3 py-2.5 max-w-[160px] truncate">{dossier.subject}</td>
                        <td className="px-3 py-2.5 max-w-[170px] truncate text-slate-400">{dossier.reason}</td>
                        <td className="px-3 py-2.5 text-orange-400">{dossier.project}</td>
                        <td className="px-3 py-2.5"><BureauTag bureau={dossier.bureau} /></td>
                        <td className="px-3 py-2.5">
                          <Badge variant={getImpactBadgeVariant(dossier.impact)} pulse={dossier.impact === 'critical'}>
                            {dossier.impact}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5"><Badge variant="urgent">J+{dossier.delay}</Badge></td>
                        <td className="px-3 py-2.5">
                          <span className={cn('font-mono font-bold', prio > 5000 ? 'text-red-400' : prio > 2000 ? 'text-amber-400' : 'text-blue-400')}>
                            {prio}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-1 flex-wrap">
                            <Button size="xs" variant="warning" onClick={() => handleSubstitute(dossier)}>⚡</Button>
                            <Button size="xs" variant="info" onClick={async () => { await handleEscalate(dossier); addToast(`⬆️ ${dossier.id} escaladé`, 'warning'); }}>⬆️</Button>
                            <Button size="xs" variant="secondary" onClick={async () => { await handleRequestDocument(dossier); addToast(`📎 Pièce demandée pour ${dossier.id}`, 'info'); }}>📎</Button>
                            <Link href={`/maitre-ouvrage/projets-en-cours?id=${dossier.project}`}>
                              <Button size="xs" variant="ghost">📂</Button>
                            </Link>
                            <Button size="xs" variant="success" onClick={() => openResolveModal(dossier)}>✓</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredDossiers.length === 0 && (
                    <tr>
                      <td colSpan={11} className="px-3 py-8 text-center text-slate-400">
                        Aucun dossier ne correspond aux filtres.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal résolution unitaire */}
      {showResolutionModal && selectedDossier && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowResolutionModal(false);
              setResolutionNote('');
            }
          }}
        >
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">✅ Résolution dossier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={cn('p-3 rounded-lg', darkMode ? 'bg-slate-700/50' : 'bg-gray-50')}>
                <span className="font-mono text-xs text-red-400">{selectedDossier.id}</span>
                <p className="font-bold text-sm mt-1">{selectedDossier.subject}</p>
                <p className="text-xs text-slate-400">{selectedDossier.reason}</p>
                <div className="flex items-center gap-2 mt-2">
                  <BureauTag bureau={selectedDossier.bureau} />
                  <Badge variant={getImpactBadgeVariant(selectedDossier.impact)}>Impact {selectedDossier.impact}</Badge>
                  <Badge variant="urgent">J+{selectedDossier.delay}</Badge>
                  <Badge variant="info">Priorité {computePriority(selectedDossier)}</Badge>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold">Justification de la résolution *</p>
                  <p className="text-[10px] text-slate-400">{resolutionNote.trim().length}/400</p>
                </div>
                <textarea
                  placeholder="Décrivez comment le blocage a été résolu…"
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value.slice(0, 400))}
                  rows={4}
                  className={cn(
                    'w-full px-3 py-2 rounded text-xs',
                    darkMode ? 'bg-slate-800 border border-slate-600' : 'bg-white border border-gray-300'
                  )}
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                <Button
                  className="flex-1"
                  disabled={!resolutionNote.trim()}
                  onClick={async () => {
                    await handleResolve(selectedDossier, resolutionNote);
                    addToast(`✓ ${selectedDossier.id} résolu`, 'success');
                    setShowResolutionModal(false);
                    setResolutionNote('');
                    setSelectedId(null);
                  }}
                >
                  ✓ Marquer comme résolu
                </Button>
                <Button variant="secondary" onClick={() => { setShowResolutionModal(false); setResolutionNote(''); }}>
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal résolution en masse */}
      {showBulkResolve && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowBulkResolve(false);
              setBulkResolveNote('');
            }
          }}
        >
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">✅ Résolution en masse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={cn('p-3 rounded-lg', darkMode ? 'bg-slate-700/50' : 'bg-gray-50')}>
                <p className="text-sm font-bold">Cibles: {targets.length}</p>
                <p className="text-xs text-slate-400">
                  {selectedDossiers.length > 0 ? 'Mode sélection' : 'Mode filtre courant'} — La même justification sera appliquée à tous.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold">Justification unique *</p>
                  <p className="text-[10px] text-slate-400">{bulkResolveNote.trim().length}/400</p>
                </div>
                <textarea
                  placeholder="Ex: Blocage levé suite à réception des pièces / arbitrage DG / validation CODIR..."
                  value={bulkResolveNote}
                  onChange={(e) => setBulkResolveNote(e.target.value.slice(0, 400))}
                  rows={4}
                  className={cn(
                    'w-full px-3 py-2 rounded text-xs',
                    darkMode ? 'bg-slate-800 border border-slate-600' : 'bg-white border border-gray-300'
                  )}
                />
              </div>

              <div className={cn('p-2 rounded text-[10px]', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                <p className="text-slate-400">
                  ⚠️ Attention : la résolution en masse est puissante. Utilise-la seulement si la justification est réellement commune.
                </p>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                <Button
                  className="flex-1"
                  disabled={!bulkResolveNote.trim() || targets.length === 0}
                  onClick={async () => {
                    await runBulk('resolution', bulkResolveNote);
                    setShowBulkResolve(false);
                    setBulkResolveNote('');
                  }}
                >
                  ✓ Résoudre {targets.length} dossier(s)
                </Button>
                <Button variant="secondary" onClick={() => { setShowBulkResolve(false); setBulkResolveNote(''); }}>
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Traçabilité */}
      <Card className="border-orange-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔐</span>
            <div className="flex-1">
              <h3 className="font-bold text-sm text-orange-400">Traçabilité + registre exportable</h3>
              <p className="text-xs text-slate-400 mt-1">
                Chaque action produit un hash SHA-256. Les actions en masse ont un batchId commun (audit-friendly).
              </p>

              {lastDecisionHash && (
                <div className={cn('mt-3 p-2 rounded border', darkMode ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200')}>
                  <p className="text-[10px] text-slate-400">Dernier hash</p>
                  <p className="font-mono text-[11px] break-all">{lastDecisionHash}</p>
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px]">
                <Badge variant="info">Entrées registre: {register.length}</Badge>
                <Badge variant="default">Sélection: {selectedIds.size}</Badge>
                <Badge variant="warning">Cibles: {targets.length}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DossierCard({
  dossier,
  darkMode,
  selected,
  onToggleSelected,
  onSubstitute,
  onEscalate,
  onRequest,
  onResolve,
}: {
  dossier: BlockedDossier;
  darkMode: boolean;
  selected: boolean;
  onToggleSelected: () => void;
  onSubstitute: () => void;
  onEscalate: () => void;
  onRequest: () => void;
  onResolve: () => void;
}) {
  const prio = computePriority(dossier);

  return (
    <div className={cn('p-3 rounded-lg border-l-4', getImpactBorder(dossier.impact), darkMode ? 'bg-slate-700/30' : 'bg-gray-50')}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={selected} onChange={onToggleSelected} />
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                {dossier.id}
              </span>
            </label>

            <Badge variant="info">{dossier.type}</Badge>
            <BureauTag bureau={dossier.bureau} />
            <Badge variant={getImpactBadgeVariant(dossier.impact)} pulse={dossier.impact === 'critical'}>
              {dossier.impact}
            </Badge>
            <Badge variant="urgent">J+{dossier.delay}</Badge>
            <Badge variant="default">Priorité {prio}</Badge>
          </div>

          <p className="font-semibold text-sm">{dossier.subject}</p>
          <p className="text-[10px] text-slate-400 mt-1">{dossier.reason}</p>

          <div className="flex items-center gap-2 mt-1 text-[10px] flex-wrap">
            <span className="text-slate-400">Projet:</span>
            <Link href={`/maitre-ouvrage/projets-en-cours?id=${dossier.project}`} className="text-orange-400 hover:underline">
              {dossier.project}
            </Link>
            <span className="text-slate-400">•</span>
            <span className="text-slate-400">Responsable:</span>
            <span>{dossier.responsible}</span>
          </div>
        </div>

        <span className="font-mono font-bold text-amber-400">{String(dossier.amount ?? '')}</span>
      </div>

      <div className="flex gap-1 mt-2 flex-wrap">
        <Button size="xs" variant="warning" onClick={onSubstitute}>⚡ Substituer</Button>
        <Button size="xs" variant="info" onClick={onEscalate}>⬆️ Escalader</Button>
        <Button size="xs" variant="secondary" onClick={onRequest}>📎 Demander pièce</Button>
        <Link href={`/maitre-ouvrage/projets-en-cours?id=${dossier.project}`}>
          <Button size="xs" variant="ghost">📂 Ouvrir projet</Button>
        </Link>
        <Button size="xs" variant="success" onClick={onResolve}>✓ Résoudre</Button>
      </div>
    </div>
  );
}
