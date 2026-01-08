'use client';

import React, { useCallback, useEffect, useMemo, useState, useDeferredValue } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { bcToValidate, facturesRecues, avenants, financials } from '@/lib/data';
import { calculateBMOTotalImpact } from '@/lib/utils/bmo-stats';

type TabType = 'inbox' | 'bc' | 'factures' | 'avenants' | 'finances' | 'audit';

type DecisionBMO = {
  origin?: string;
  decisionId?: string;
  validatorRole?: 'A' | 'R' | string;
  hash?: string;
  comment?: string;
  decidedAt?: string; // optionnel si tu l'ajoutes plus tard
};

type ItemType = 'BC' | 'FACTURE' | 'AVENANT' | 'GAIN' | 'PERTE';

type ValidationItem = {
  type: ItemType;
  id: string;
  projet: string;
  fournisseur?: string;
  description?: string;
  statut: string; // libre
  montant: number; // signé (+/-)
  montantAbs: number;
  decisionBMO?: DecisionBMO | null;

  // computed
  decisionState: 'BMO' | 'HORS_BMO' | 'EN_ATTENTE';
  riskScore: number; // 0..100
  riskSignals: string[];
  priority: 'NOW' | 'WATCH' | 'OK';
};

const parseMoney = (v: unknown): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const raw = String(v ?? '')
    .replace(/\s/g, '')
    .replace(/FCFA|XOF|F\s?CFA/gi, '')
    .replace(/[^\d,.-]/g, '');
  const normalized = raw.replace(/,/g, '');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
};

const formatMoney = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;

// CSV safe (gère ; " \n)
const csvEscape = (v: unknown): string => {
  const s = String(v ?? '');
  if (/[;"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

// Hash SHA-256 (audit). Fallback FNV-1a si crypto.subtle indisponible.
const toHex = (buf: ArrayBuffer): string =>
  Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

const fnv1a32 = (str: string): string => {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
};

const sha256Hex = async (input: string): Promise<string> => {
  try {
    if (typeof crypto === 'undefined' || !crypto.subtle) return fnv1a32(input);
    const enc = new TextEncoder();
    const digest = await crypto.subtle.digest('SHA-256', enc.encode(input));
    return toHex(digest);
  } catch {
    return fnv1a32(input);
  }
};

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

const decisionStateOf = (d?: DecisionBMO | null): ValidationItem['decisionState'] => {
  if (!d) return 'EN_ATTENTE';
  if ((d.origin ?? '').toLowerCase().includes('bmo') || d.decisionId) return 'BMO';
  return 'HORS_BMO';
};

// "Risk Engine" heuristique (simple mais efficace) – tu pourras le brancher ensuite sur de l'IA / règles métier server-side.
const computeRisk = (item: Omit<ValidationItem, 'riskScore' | 'riskSignals' | 'priority'>) => {
  const signals: string[] = [];
  let score = 0;

  // 1) Gouvernance / traçabilité
  if (item.decisionState === 'EN_ATTENTE') {
    score += 25;
    signals.push('Décision BMO manquante');
  }
  if (item.decisionState === 'HORS_BMO') {
    score += 35;
    signals.push('Hors circuit BMO');
  }

  // 2) Montant
  const abs = item.montantAbs;
  if (abs >= 50_000_000) {
    score += 25; signals.push('Montant très élevé');
  } else if (abs >= 10_000_000) {
    score += 15; signals.push('Montant élevé');
  } else if (abs >= 2_000_000) {
    score += 8;
  }

  // 3) Nature
  if (item.type === 'PERTE') {
    score += 12;
    signals.push('Flux de perte');
  }
  if (item.type === 'AVENANT' && item.montant < 0) {
    score += 10;
    signals.push('Avenant défavorable');
  }

  // 4) Statuts sensibles
  const st = (item.statut ?? '').toLowerCase();
  if (st.includes('rejet') || st.includes('rejeté') || st.includes('rejetée')) {
    score += 15; signals.push('Statut rejet');
  }
  if (st.includes('urgent') || st.includes('bloqué') || st.includes('critique')) {
    score += 18; signals.push('Statut critique');
  }

  // 5) Qualité données
  if (!item.projet?.trim()) { score += 8; signals.push('Projet non renseigné'); }
  if ((item.type === 'BC' || item.type === 'FACTURE') && !item.fournisseur?.trim()) {
    score += 10; signals.push('Fournisseur manquant');
  }

  score = clamp(score, 0, 100);

  const priority: ValidationItem['priority'] =
    score >= 70 ? 'NOW' : score >= 40 ? 'WATCH' : 'OK';

  return { score, signals, priority };
};

const reviewedKey = 'bmo_validation_reviewed_v1';

const loadReviewed = (): Record<string, true> => {
  try {
    const raw = localStorage.getItem(reviewedKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, true>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const saveReviewed = (m: Record<string, true>) => {
  try { localStorage.setItem(reviewedKey, JSON.stringify(m)); } catch {}
};

export default function ValidationPage() {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();

  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  const [search, setSearch] = useState('');
  const searchDeferred = useDeferredValue(search);

  // Filtres pro
  const [filterType, setFilterType] = useState<'ALL' | ItemType>('ALL');
  const [filterDecision, setFilterDecision] = useState<'ALL' | 'BMO' | 'EN_ATTENTE' | 'HORS_BMO'>('ALL');
  const [riskMin, setRiskMin] = useState(0);
  const [amountMin, setAmountMin] = useState<number | ''>('');
  const [amountMax, setAmountMax] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<'risk' | 'montant' | 'type' | 'statut'>('risk');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  // Reviewed + sélection (triage)
  const [reviewed, setReviewed] = useState<Record<string, true>>({});
  const [selected, setSelected] = useState<Record<string, true>>({});

  useEffect(() => {
    setReviewed(loadReviewed());
  }, []);

  const toggleReviewed = useCallback((id: string) => {
    setReviewed(prev => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      saveReviewed(next);
      return next;
    });
  }, []);

  const toggleSelected = useCallback((id: string) => {
    setSelected(prev => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  }, []);

  const clearSelected = useCallback(() => setSelected({}), []);

  // Normalisation BC / Factures / Avenants / Flux -> ValidationItem
  const items: ValidationItem[] = useMemo(() => {
    const out: ValidationItem[] = [];

    for (const bc of bcToValidate as any[]) {
      const montant = ('amount' in bc && typeof bc.amount === 'string')
        ? parseMoney(bc.amount)
        : ('montantTTC' in bc ? parseMoney(bc.montantTTC) : 0);

      const decisionBMO: DecisionBMO | null | undefined = bc.decisionBMO;
      const decisionState = decisionStateOf(decisionBMO);

      const base = {
        type: 'BC' as const,
        id: String(bc.id ?? ''),
        projet: String(('projetName' in bc ? bc.projetName : '') ?? ''),
        fournisseur: String(('fournisseur' in bc ? bc.fournisseur : '') ?? ''),
        description: '',
        statut: String(('statut' in bc ? bc.statut : '') ?? '—'),
        montant,
        montantAbs: Math.abs(montant),
        decisionBMO: decisionBMO ?? null,
        decisionState,
      };

      const r = computeRisk(base);
      out.push({ ...base, riskScore: r.score, riskSignals: r.signals, priority: r.priority });
    }

    for (const f of facturesRecues as any[]) {
      const montant = parseMoney(f.montantTTC);
      const decisionBMO: DecisionBMO | null | undefined = f.decisionBMO;
      const decisionState = decisionStateOf(decisionBMO);

      const base = {
        type: 'FACTURE' as const,
        id: String(f.id ?? ''),
        projet: String(f.chantier ?? ''),
        fournisseur: String(f.fournisseur ?? ''),
        description: '',
        statut: String(f.statut ?? '—'),
        montant,
        montantAbs: Math.abs(montant),
        decisionBMO: decisionBMO ?? null,
        decisionState,
      };

      const r = computeRisk(base);
      out.push({ ...base, riskScore: r.score, riskSignals: r.signals, priority: r.priority });
    }

    for (const av of avenants as any[]) {
      const montant = Number.isFinite(av.ecart) ? av.ecart : parseMoney(av.ecart);
      const decisionBMO: DecisionBMO | null | undefined = av.decisionBMO;
      const decisionState = decisionStateOf(decisionBMO);

      const base = {
        type: 'AVENANT' as const,
        id: String(av.id ?? ''),
        projet: String(av.chantier ?? ''),
        fournisseur: '',
        description: `BC ref: ${String(av.bcReference ?? '')}`,
        statut: String(av.statut ?? '—'),
        montant,
        montantAbs: Math.abs(montant),
        decisionBMO: decisionBMO ?? null,
        decisionState,
      };

      const r = computeRisk(base);
      out.push({ ...base, riskScore: r.score, riskSignals: r.signals, priority: r.priority });
    }

    // Flux financiers
    for (const g of financials.gains as any[]) {
      const montant = Number.isFinite(g.montant) ? g.montant : parseMoney(g.montant);
      const decisionBMO: DecisionBMO | null | undefined = g.decisionBMO;
      const decisionState = decisionStateOf(decisionBMO);

      const base = {
        type: 'GAIN' as const,
        id: String(g.id ?? ''),
        projet: String(g.chantier ?? ''),
        fournisseur: '',
        description: String(g.description ?? ''),
        statut: '',
        montant: Math.abs(montant),
        montantAbs: Math.abs(montant),
        decisionBMO: decisionBMO ?? null,
        decisionState,
      };

      const r = computeRisk(base);
      out.push({ ...base, riskScore: r.score, riskSignals: r.signals, priority: r.priority });
    }

    for (const p of financials.pertes as any[]) {
      const montant = Number.isFinite(p.montant) ? p.montant : parseMoney(p.montant);
      const decisionBMO: DecisionBMO | null | undefined = p.decisionBMO;
      const decisionState = decisionStateOf(decisionBMO);

      const base = {
        type: 'PERTE' as const,
        id: String(p.id ?? ''),
        projet: String(p.chantier ?? ''),
        fournisseur: '',
        description: String(p.description ?? ''),
        statut: '',
        montant: -Math.abs(montant),
        montantAbs: Math.abs(montant),
        decisionBMO: decisionBMO ?? null,
        decisionState,
      };

      const r = computeRisk(base);
      out.push({ ...base, riskScore: r.score, riskSignals: r.signals, priority: r.priority });
    }

    return out.filter(x => x.id); // sanity
  }, []);

  // KPIs (pilotage)
  const kpis = useMemo(() => {
    const total = items.length;
    const pending = items.filter(i => i.decisionState === 'EN_ATTENTE').length;
    const horsBMO = items.filter(i => i.decisionState === 'HORS_BMO').length;
    const highRisk = items.filter(i => i.riskScore >= 70).length;

    const exposurePending = items
      .filter(i => i.decisionState !== 'BMO')
      .reduce((s, i) => s + i.montantAbs, 0);

    const reviewedCount = Object.keys(reviewed).length;

    return { total, pending, horsBMO, highRisk, exposurePending, reviewedCount };
  }, [items, reviewed]);

  const impactTotal = useMemo(() => {
    return calculateBMOTotalImpact(financials, facturesRecues, avenants);
  }, []);

  // Filtrage / tri "produit"
  const filtered = useMemo(() => {
    const s = searchDeferred.trim().toLowerCase();

    let arr = items;

    if (s) {
      arr = arr.filter(i => {
        const hay = [
          i.id,
          i.type,
          i.projet,
          i.fournisseur ?? '',
          i.description ?? '',
          i.statut ?? '',
          i.decisionBMO?.decisionId ?? '',
          i.decisionBMO?.origin ?? '',
        ].join(' ').toLowerCase();
        return hay.includes(s);
      });
    }

    if (filterType !== 'ALL') arr = arr.filter(i => i.type === filterType);
    if (filterDecision !== 'ALL') arr = arr.filter(i => i.decisionState === filterDecision);
    if (riskMin > 0) arr = arr.filter(i => i.riskScore >= riskMin);

    if (amountMin !== '') arr = arr.filter(i => i.montantAbs >= Number(amountMin));
    if (amountMax !== '') arr = arr.filter(i => i.montantAbs <= Number(amountMax));

    const dir = sortDir === 'desc' ? -1 : 1;
    arr = [...arr].sort((a, b) => {
      if (sortBy === 'risk') return (a.riskScore - b.riskScore) * dir;
      if (sortBy === 'montant') return (a.montantAbs - b.montantAbs) * dir;
      if (sortBy === 'type') return a.type.localeCompare(b.type) * dir;
      return String(a.statut ?? '').localeCompare(String(b.statut ?? '')) * dir;
    });

    return arr;
  }, [items, searchDeferred, filterType, filterDecision, riskMin, amountMin, amountMax, sortBy, sortDir]);

  // Inbox = NOW + WATCH, en excluant "reviewed"
  const inbox = useMemo(() => {
    return filtered.filter(i => !reviewed[i.id] && (i.priority === 'NOW' || i.priority === 'WATCH'));
  }, [filtered, reviewed]);

  const selectedItems = useMemo(() => {
    const ids = new Set(Object.keys(selected));
    return filtered.filter(i => ids.has(i.id));
  }, [selected, filtered]);

  const openDecision = useCallback((decisionId?: string) => {
    if (!decisionId) return;
    window.open(`/maitre-ouvrage/decisions?id=${decisionId}`, '_blank');
  }, []);

  // Export PRO : CSV + manifest JSON (hash ligne + hash chaîné)
  const exportAudited = useCallback(async (scope: 'FILTERED' | 'SELECTED') => {
    const data = scope === 'SELECTED' ? selectedItems : filtered;

    if (!data.length) {
      addToast('⚠️ Rien à exporter', 'warning');
      return;
    }

    const exportedAt = new Date().toISOString();
    const seed = `BMO_VALIDATION_EXPORT|${exportedAt}|count=${data.length}`;
    let chain = await sha256Hex(seed);

    const header = [
      'Type', 'ID', 'Projet', 'Fournisseur', 'Statut', 'Montant(FCFA)',
      'DécisionState', 'DecisionOrigin', 'DecisionId', 'RACI', 'DecisionHash',
      'RiskScore', 'RiskSignals',
      'RowHash(calc)', 'ChainHash(calc)',
      'Comment'
    ];

    const lines: string[] = [];
    lines.push(header.join(';'));

    const manifestRows: Array<{
      id: string;
      type: ItemType;
      rowHash: string;
      chainHash: string;
      riskScore: number;
    }> = [];

    for (const i of data) {
      const canonical = [
        i.type,
        i.id,
        i.projet,
        i.fournisseur ?? '',
        i.statut ?? '',
        String(i.montant),
        i.decisionState,
        i.decisionBMO?.origin ?? '',
        i.decisionBMO?.decisionId ?? '',
        i.decisionBMO?.validatorRole ?? '',
        i.decisionBMO?.hash ?? '',
        String(i.riskScore),
        (i.riskSignals ?? []).join('|'),
        i.decisionBMO?.comment ?? '',
      ].join('|');

      const rowHash = await sha256Hex(canonical);
      chain = await sha256Hex(`${chain}|${rowHash}`);

      manifestRows.push({ id: i.id, type: i.type, rowHash, chainHash: chain, riskScore: i.riskScore });

      const row = [
        csvEscape(i.type),
        csvEscape(i.id),
        csvEscape(i.projet),
        csvEscape(i.fournisseur ?? ''),
        csvEscape(i.statut ?? ''),
        csvEscape(i.montant.toString()),
        csvEscape(i.decisionState),
        csvEscape(i.decisionBMO?.origin ?? ''),
        csvEscape(i.decisionBMO?.decisionId ?? ''),
        csvEscape(i.decisionBMO?.validatorRole ?? ''),
        csvEscape(i.decisionBMO?.hash ?? ''),
        csvEscape(i.riskScore),
        csvEscape((i.riskSignals ?? []).join(' | ')),
        csvEscape(rowHash),
        csvEscape(chain),
        csvEscape(i.decisionBMO?.comment ?? ''),
      ];
      lines.push(row.join(';'));
    }

    // CSV
    const csvContent = lines.join('\n');
    const csvBlob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const csvUrl = URL.createObjectURL(csvBlob);
    const a = document.createElement('a');
    a.href = csvUrl;
    a.download = `validation_bmo_${scope.toLowerCase()}_${exportedAt.slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(csvUrl);

    // Manifest JSON
    const manifest = {
      version: 1,
      exportedAt,
      scope,
      seed,
      finalChainHash: chain,
      count: data.length,
      rows: manifestRows,
    };
    const jsonBlob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json;charset=utf-8;' });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const b = document.createElement('a');
    b.href = jsonUrl;
    b.download = `validation_bmo_${scope.toLowerCase()}_${exportedAt.slice(0, 10)}.manifest.json`;
    document.body.appendChild(b);
    b.click();
    document.body.removeChild(b);
    URL.revokeObjectURL(jsonUrl);

    addToast(`✅ Export audité (${scope === 'SELECTED' ? 'sélection' : 'filtre'}) généré`, 'success');
  }, [filtered, selectedItems, addToast]);

  // Bulk : ouvrir décisions
  const bulkOpenDecisions = useCallback(() => {
    const withDecision = selectedItems.filter(i => i.decisionBMO?.decisionId);
    if (!withDecision.length) {
      addToast('⚠️ Aucune décision à ouvrir dans la sélection', 'warning');
      return;
    }
    for (const it of withDecision) openDecision(it.decisionBMO?.decisionId);
    addToast(`✅ ${withDecision.length} décisions ouvertes`, 'success');
  }, [selectedItems, openDecision, addToast]);

  const bulkMarkReviewed = useCallback(() => {
    if (!selectedItems.length) {
      addToast('⚠️ Sélection vide', 'warning');
      return;
    }
    setReviewed(prev => {
      const next = { ...prev };
      for (const it of selectedItems) next[it.id] = true;
      saveReviewed(next);
      return next;
    });
    clearSelected();
    addToast(`✅ ${selectedItems.length} éléments marqués "reviewed"`, 'success');
  }, [selectedItems, addToast, clearSelected]);

  const PriorityBadge = ({ p }: { p: ValidationItem['priority'] }) => {
    if (p === 'NOW') return <Badge variant="urgent" className="text-[10px]">🔥 NOW</Badge>;
    if (p === 'WATCH') return <Badge variant="warning" className="text-[10px]">👀 WATCH</Badge>;
    return <Badge variant="success" className="text-[10px]">✅ OK</Badge>;
  };

  const DecisionBadge = ({ s }: { s: ValidationItem['decisionState'] }) => {
    if (s === 'BMO') return <Badge variant="success" className="text-[10px]">✅ BMO</Badge>;
    if (s === 'HORS_BMO') return <Badge variant="urgent" className="text-[10px]">⚠️ Hors BMO</Badge>;
    return <Badge variant="warning" className="text-[10px]">⏳ En attente</Badge>;
  };

  const RiskBadge = ({ score }: { score: number }) => {
    if (score >= 70) return <Badge variant="urgent" className="text-[10px]">Risque {score}</Badge>;
    if (score >= 40) return <Badge variant="warning" className="text-[10px]">Risque {score}</Badge>;
    return <Badge variant="success" className="text-[10px]">Risque {score}</Badge>;
  };

  const rowsToRender = useMemo(() => {
    if (activeTab === 'inbox') return inbox;
    if (activeTab === 'bc') return filtered.filter(i => i.type === 'BC');
    if (activeTab === 'factures') return filtered.filter(i => i.type === 'FACTURE');
    if (activeTab === 'avenants') return filtered.filter(i => i.type === 'AVENANT');
    if (activeTab === 'finances') return filtered.filter(i => i.type === 'GAIN' || i.type === 'PERTE');
    return filtered;
  }, [activeTab, inbox, filtered]);

  const Header = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          🧠 Validation BMO — Command Center
          <Badge variant="info">Triage • Risque • Audit</Badge>
        </h1>
        <p className="text-sm text-slate-400">
          Inbox intelligente (priorité), gouvernance BMO, export auditable
        </p>
      </div>

      <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
        <Input
          placeholder="Search (id, projet, fournisseur, décision...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-72"
        />

        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => void exportAudited('FILTERED')}>
            📦 Export filtré
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={!selectedItems.length}
            onClick={() => void exportAudited('SELECTED')}
          >
            🎯 Export sélection ({selectedItems.length})
          </Button>
        </div>
      </div>
    </div>
  );

  const FiltersBar = (
    <Card>
      <CardContent className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
          <div className="md:col-span-2">
            <label className="text-[11px] text-slate-400">Type</label>
            <select
              className={cn(
                'mt-1 w-full rounded-md border px-2 py-2 text-xs',
                darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
              )}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="ALL">Tous</option>
              <option value="BC">BC</option>
              <option value="FACTURE">Factures</option>
              <option value="AVENANT">Avenants</option>
              <option value="GAIN">Gains</option>
              <option value="PERTE">Pertes</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-[11px] text-slate-400">Décision</label>
            <select
              className={cn(
                'mt-1 w-full rounded-md border px-2 py-2 text-xs',
                darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
              )}
              value={filterDecision}
              onChange={(e) => setFilterDecision(e.target.value as any)}
            >
              <option value="ALL">Toutes</option>
              <option value="BMO">BMO</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="HORS_BMO">Hors BMO</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-[11px] text-slate-400">Risque min</label>
            <input
              type="number"
              min={0}
              max={100}
              value={riskMin}
              onChange={(e) => setRiskMin(clamp(Number(e.target.value || 0), 0, 100))}
              className={cn(
                'mt-1 w-full rounded-md border px-2 py-2 text-xs',
                darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
              )}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-[11px] text-slate-400">Montant min</label>
            <input
              type="number"
              value={amountMin}
              onChange={(e) => setAmountMin(e.target.value === '' ? '' : Number(e.target.value))}
              className={cn(
                'mt-1 w-full rounded-md border px-2 py-2 text-xs',
                darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
              )}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-[11px] text-slate-400">Montant max</label>
            <input
              type="number"
              value={amountMax}
              onChange={(e) => setAmountMax(e.target.value === '' ? '' : Number(e.target.value))}
              className={cn(
                'mt-1 w-full rounded-md border px-2 py-2 text-xs',
                darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
              )}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-[11px] text-slate-400">Tri</label>
            <div className="mt-1 flex gap-2">
              <select
                className={cn(
                  'w-full rounded-md border px-2 py-2 text-xs',
                  darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
                )}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="risk">Risque</option>
                <option value="montant">Montant</option>
                <option value="type">Type</option>
                <option value="statut">Statut</option>
              </select>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setSortDir(d => (d === 'desc' ? 'asc' : 'desc'))}
              >
                {sortDir === 'desc' ? '⬇️' : '⬆️'}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-slate-400">
            Résultats : <span className="text-slate-200 font-semibold">{filtered.length}</span> • Inbox :{' '}
            <span className="text-slate-200 font-semibold">{inbox.length}</span> • Sélection :{' '}
            <span className="text-slate-200 font-semibold">{selectedItems.length}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={bulkOpenDecisions} disabled={!selectedItems.length}>
              📄 Ouvrir décisions
            </Button>
            <Button size="sm" variant="secondary" onClick={bulkMarkReviewed} disabled={!selectedItems.length}>
              ✅ Marquer reviewed
            </Button>
            <Button size="sm" variant="secondary" onClick={clearSelected} disabled={!selectedItems.length}>
              🧹 Vider sélection
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const KPIs = (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-slate-400 mb-1">Exposition (hors BMO + attente)</p>
          <p className="text-lg font-bold text-amber-400">{formatMoney(kpis.exposurePending)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-slate-400 mb-1">En attente</p>
          <p className="text-lg font-bold">{kpis.pending}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-slate-400 mb-1">Hors BMO</p>
          <p className="text-lg font-bold text-red-400">{kpis.horsBMO}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-slate-400 mb-1">High risk (≥70)</p>
          <p className="text-lg font-bold text-red-400">{kpis.highRisk}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-slate-400 mb-1">Impact total BMO</p>
          <p className="text-lg font-bold text-blue-400">{formatMoney(impactTotal)}</p>
        </CardContent>
      </Card>
    </div>
  );

  const Tabs = (
    <div className="flex gap-1 border-b border-slate-700/30">
      {([
        { k: 'inbox', label: `Inbox` },
        { k: 'bc', label: `BC` },
        { k: 'factures', label: `Factures` },
        { k: 'avenants', label: `Avenants` },
        { k: 'finances', label: `Flux` },
        { k: 'audit', label: `Audit` },
      ] as const).map(t => (
        <button
          key={t.k}
          onClick={() => setActiveTab(t.k)}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors',
            activeTab === t.k
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-300'
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );

  const Table = (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          {activeTab === 'inbox' ? '📥 Inbox priorisée' : '📚 Portefeuille'}
          <span className="text-xs text-slate-400 font-normal ml-2">
            (les éléments "reviewed" ne sortent plus dans l'Inbox)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Sel</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Priorité</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Risque</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Type</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">ID</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Projet</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Fournisseur</th>
                <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase text-amber-500">Montant</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Statut</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Décision</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Signaux</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rowsToRender.map(i => (
                <tr key={i.id} className={cn('border-t', darkMode ? 'border-slate-700/50' : 'border-gray-100')}>
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={!!selected[i.id]}
                      onChange={() => toggleSelected(i.id)}
                    />
                  </td>

                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <PriorityBadge p={i.priority} />
                      {reviewed[i.id] ? <Badge variant="default" className="text-[10px]">✅ reviewed</Badge> : null}
                    </div>
                  </td>

                  <td className="px-3 py-2.5">
                    <RiskBadge score={i.riskScore} />
                  </td>

                  <td className="px-3 py-2.5">
                    <Badge variant="info" className="text-[10px]">{i.type}</Badge>
                  </td>

                  <td className="px-3 py-2.5 font-mono text-slate-300">{i.id}</td>

                  <td className="px-3 py-2.5">{i.projet || '—'}</td>

                  <td className="px-3 py-2.5">{i.fournisseur || '—'}</td>

                  <td className={cn(
                    "px-3 py-2.5 text-right font-mono",
                    i.montant >= 0 ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {i.montant >= 0 ? '+' : ''}{formatMoney(i.montant)}
                  </td>

                  <td className="px-3 py-2.5">
                    {i.statut ? (
                      <Badge variant={String(i.statut).toLowerCase().includes('rejet') ? 'urgent' : 'default'}>
                        {i.statut}
                      </Badge>
                    ) : <span className="text-slate-500">—</span>}
                  </td>

                  <td className="px-3 py-2.5">
                    <div className="flex flex-col gap-1">
                      <DecisionBadge s={i.decisionState} />
                      {i.decisionBMO?.validatorRole ? (
                        <Badge variant="default" className="text-[10px]">
                          {i.decisionBMO.validatorRole === 'A' ? '✅ RACI: A' : '🔍 RACI: R'}
                        </Badge>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-3 py-2.5">
                    <div className="max-w-[320px] text-[11px] text-slate-300">
                      {i.riskSignals.slice(0, 2).join(' • ')}
                      {i.riskSignals.length > 2 ? (
                        <span className="text-slate-500"> • +{i.riskSignals.length - 2}</span>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-2">
                      {i.decisionBMO?.decisionId ? (
                        <Button
                          size="xs"
                          variant="link"
                          className="p-0 h-auto text-blue-400"
                          onClick={() => openDecision(i.decisionBMO?.decisionId)}
                        >
                          📄 Décision
                        </Button>
                      ) : null}

                      <Button
                        size="xs"
                        variant="link"
                        className="p-0 h-auto text-emerald-400"
                        onClick={() => toggleReviewed(i.id)}
                      >
                        {reviewed[i.id] ? '↩︎ Unreview' : '✅ Review'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {!rowsToRender.length ? (
                <tr>
                  <td colSpan={12} className="px-3 py-6 text-center text-sm text-slate-500">
                    Aucun résultat avec ces filtres.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const AuditPanel = (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">🧾 Audit & intégrité</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-slate-300">
        <p className="text-slate-400">
          Cette page est conçue comme un "journal de pilotage" : tu peux exporter un CSV + un manifest JSON.
          Le manifest contient un hash de ligne et un hash chaîné, permettant de détecter toute altération.
        </p>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => void exportAudited('FILTERED')}>
            Export filtré (CSV + manifest)
          </Button>
          <Button size="sm" variant="secondary" disabled={!selectedItems.length} onClick={() => void exportAudited('SELECTED')}>
            Export sélection (CSV + manifest)
          </Button>
        </div>

        <div className="text-xs text-slate-500">
          Prochaine étape "niveau marché" : brancher ces hashes sur une signature serveur (clé privée) pour une preuve non-répudiable.
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {Header}
      {KPIs}
      {FiltersBar}
      {Tabs}

      {activeTab === 'audit' ? AuditPanel : Table}
    </div>
  );
}
