'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { paymentsN1, employees, projects, facturesRecues } from '@/lib/data';
import type { Payment } from '@/lib/types/bmo.types';

/* =========================================================
   1) Utils robustes (money/date/canonical hashing/query)
   ========================================================= */

const DOUBLE_VALIDATION_THRESHOLD = 5_000_000; // 5M FCFA

type ViewMode = 'all' | '7days' | 'late' | 'critical';
type FactureFilterMode = 'all' | 'pending' | 'validated' | 'corrected';
type SortMode = 'due_asc' | 'due_desc' | 'amount_desc' | 'risk_desc' | 'status' | 'project';

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

/** Money parsing "safe" (FCFA souvent entier, mais on tolère tout) */
const parseMoney = (v: unknown): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;

  const s0 = String(v ?? '').trim();
  if (!s0) return 0;

  // Nettoyage : supprime monnaie/espaces, garde chiffres et séparateurs
  const raw = s0
    .replace(/\s/g, '')
    .replace(/FCFA|XOF|F\s?CFA/gi, '')
    .replace(/[^\d,.-]/g, '');

  // Heuristique :
  // - Si on a à la fois '.' et ',' : le dernier séparateur est le décimal, les autres sont des milliers
  // - Sinon : on retire tous les séparateurs non nécessaires (FCFA => entier)
  const hasDot = raw.includes('.');
  const hasComma = raw.includes(',');

  let normalized = raw;

  if (hasDot && hasComma) {
    const lastDot = raw.lastIndexOf('.');
    const lastComma = raw.lastIndexOf(',');
    const decSep = lastDot > lastComma ? '.' : ',';
    // retire tous les séparateurs milliers, garde decSep en '.'
    normalized = raw
      .split('')
      .filter((ch, idx) => {
        if (ch !== '.' && ch !== ',') return true;
        // conserve uniquement le dernier séparateur décimal
        return idx === (decSep === '.' ? lastDot : lastComma);
      })
      .join('')
      .replace(',', '.');
  } else {
    // FCFA : on considère majoritairement entier => retire ',' et '.'
    normalized = raw.replace(/[,.]/g, '');
  }

  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
};

const formatFCFA = (v: unknown): string => {
  const n = parseMoney(v);
  return `${n.toLocaleString('fr-FR')} FCFA`;
};

const parseFRDate = (d?: string | null): Date | null => {
  if (!d || d === '—') return null;
  const parts = d.split('/');
  if (parts.length !== 3) return null;
  const [dd, mm, yy] = parts.map((x) => Number(x));
  if (!dd || !mm || !yy) return null;
  return new Date(yy, mm - 1, dd, 0, 0, 0, 0);
};

const parseAnyDate = (d?: string | null): Date | null => {
  if (!d || d === '—') return null;
  // dd/mm/yyyy
  const fr = parseFRDate(d);
  if (fr) return fr;
  // ISO or parseable
  const t = Date.parse(d);
  if (!Number.isNaN(t)) return new Date(t);
  const patched = Date.parse(d.replace(' ', 'T'));
  if (!Number.isNaN(patched)) return new Date(patched);
  return null;
};

const getDaysToDue = (dueDateStr: string): number => {
  const dueDate = parseAnyDate(dueDateStr);
  if (!dueDate) return 0;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/** Canonical JSON stringify (clés triées) => stable pour hash */
const stableStringify = (value: any): string => {
  if (value === null) return 'null';
  const t = typeof value;
  if (t === 'string') return JSON.stringify(value);
  if (t === 'number' || t === 'boolean') return String(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (t === 'object') {
    const keys = Object.keys(value).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(String(value));
};

const sha256Hex = async (input: string): Promise<string> => {
  if (typeof crypto === 'undefined' || !crypto.subtle) return 'NO_WEBCRYPTO';
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

const downloadTextFile = (filename: string, content: string, mime = 'application/json') => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const toCsv = (rows: Record<string, any>[]): string => {
  const keys = Array.from(
    rows.reduce((set, r) => {
      Object.keys(r).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );
  const esc = (v: any) => {
    const s = v === null || v === undefined ? '' : String(v);
    if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return [keys.join(','), ...rows.map((r) => keys.map((k) => esc(r[k])).join(','))].join('\n');
};

/* =========================================================
   2) "Query language" simple (champ:valeur, guillemets, -négation)
   ========================================================= */

type QueryToken =
  | { kind: 'term'; value: string; neg?: boolean }
  | { kind: 'phrase'; value: string; neg?: boolean }
  | { kind: 'field'; field: string; value: string; neg?: boolean }
  | { kind: 'or' };

const tokenizeQuery = (q: string): QueryToken[] => {
  const s = (q || '').trim();
  if (!s) return [];

  const tokens: string[] = [];
  let buf = '';
  let inQuote = false;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === '"') {
      inQuote = !inQuote;
      buf += ch;
      continue;
    }
    if (!inQuote && /\s/.test(ch)) {
      if (buf.trim()) tokens.push(buf.trim());
      buf = '';
      continue;
    }
    buf += ch;
  }
  if (buf.trim()) tokens.push(buf.trim());

  const out: QueryToken[] = [];
  for (let raw0 of tokens) {
    if (raw0 === '||' || raw0.toUpperCase() === 'OR') {
      out.push({ kind: 'or' });
      continue;
    }

    let neg = false;
    if (raw0.startsWith('-')) {
      neg = true;
      raw0 = raw0.slice(1);
    }

    const fieldMatch = raw0.match(/^([a-zA-Z_]+):(.*)$/);
    if (fieldMatch) {
      const field = fieldMatch[1].toLowerCase();
      let value = fieldMatch[2] ?? '';
      if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) value = value.slice(1, -1);
      out.push({ kind: 'field', field, value, neg });
      continue;
    }

    if (raw0.startsWith('"') && raw0.endsWith('"') && raw0.length >= 2) {
      out.push({ kind: 'phrase', value: raw0.slice(1, -1), neg });
    } else {
      out.push({ kind: 'term', value: raw0, neg });
    }
  }
  return out;
};

const applyNeg = (ok: boolean, neg?: boolean) => (neg ? !ok : ok);

const matchQuery = (p: any, query: string): boolean => {
  const toks = tokenizeQuery(query);
  if (!toks.length) return true;

  const segments: QueryToken[][] = [];
  let cur: QueryToken[] = [];
  for (const t of toks) {
    if (t.kind === 'or') {
      if (cur.length) segments.push(cur);
      cur = [];
    } else {
      cur.push(t);
    }
  }
  if (cur.length) segments.push(cur);
  if (!segments.length) return true;

  const hay = [
    p.id,
    p.type,
    p.ref,
    p.beneficiary,
    p.project,
    p.bureau,
    p.status,
    p.validatedBy,
    p.dueDate,
    p.matchedFacture?.id ?? '',
    p.matchedFacture?.fournisseur ?? '',
    p.matchedFacture?.referenceBC ?? '',
  ]
    .join(' ')
    .toLowerCase();

  const fieldValue = (field: string) => {
    const f = field.toLowerCase();
    if (f === 'id') return String(p.id ?? '');
    if (f === 'type') return String(p.type ?? '');
    if (f === 'ref') return String(p.ref ?? '');
    if (f === 'beneficiary' || f === 'beneficiaire') return String(p.beneficiary ?? '');
    if (f === 'project' || f === 'chantier') return String(p.project ?? '');
    if (f === 'bureau') return String(p.bureau ?? '');
    if (f === 'status' || f === 'statut') return String(p.status ?? '');
    if (f === 'due' || f === 'duedate' || f === 'echeance') return String(p.dueDate ?? '');
    if (f === 'risk') return String(p.riskScore ?? '');
    if (f === 'amount' || f === 'montant') return String(p.amountNum ?? '');
    if (f === 'facture') return String(p.matchedFacture?.id ?? '');
    return '';
  };

  const tokenOk = (t: QueryToken): boolean => {
    if (t.kind === 'term' || t.kind === 'phrase') {
      const ok = hay.includes(t.value.toLowerCase());
      return applyNeg(ok, t.neg);
    }
    if (t.kind === 'field') {
      const v = fieldValue(t.field).toLowerCase();
      const ok = v.includes((t.value || '').toLowerCase());
      return applyNeg(ok, t.neg);
    }
    return true;
  };

  for (const seg of segments) {
    let ok = true;
    for (const t of seg) {
      if (!tokenOk(t)) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }

  return false;
};

/* =========================================================
   3) Audit "append-only": actionHash + chainHead (localStorage)
   ========================================================= */

const AUDIT_CHAIN_KEY = 'bmo.validationPaiements.chainHead.v1';

const loadChainHead = (): string => {
  try {
    const v = localStorage.getItem(AUDIT_CHAIN_KEY);
    return v || 'GENESIS';
  } catch {
    return 'GENESIS';
  }
};

const saveChainHead = (v: string) => {
  try {
    localStorage.setItem(AUDIT_CHAIN_KEY, v);
  } catch {}
};

const canonicalActionPayload = (p: {
  action: string;
  module: string;
  targetId: string;
  targetType: string;
  actor: { id: string; name: string; role: string; bureau: string };
  details: Record<string, any>;
  prevChainHead: string;
  atIso: string;
}) => ({
  v: 1,
  action: p.action,
  module: p.module,
  targetId: p.targetId,
  targetType: p.targetType,
  actor: p.actor,
  details: p.details,
  prevChainHead: p.prevChainHead,
  atIso: p.atIso,
});

/* =========================================================
   4) Modèle enrichi (risk scoring + matching facture)
   ========================================================= */

type EnrichedPayment = Payment & {
  daysToDue: number;
  amountNum: number;
  requiresDoubleValidation: boolean;
  riskScore: number; // 0..100
  riskLabel: 'low' | 'medium' | 'high' | 'critical';
  matchedFacture: any | null;
  matchQuality: 'none' | 'weak' | 'strong';
};

const computeRisk = (p: { daysToDue: number; amountNum: number; requiresDoubleValidation: boolean; matchedFacture: any | null }) => {
  let score = 0;

  // retard
  if (p.daysToDue < 0) score += 55 + Math.min(25, Math.abs(p.daysToDue) * 2);
  // urgence
  if (p.daysToDue >= 0 && p.daysToDue <= 3) score += 25;
  if (p.daysToDue >= 0 && p.daysToDue <= 7) score += 12;

  // montant
  if (p.amountNum >= DOUBLE_VALIDATION_THRESHOLD) score += 18;
  if (p.amountNum >= 20_000_000) score += 8;

  // contrôle documentaire
  if (!p.matchedFacture) score += 12;

  score = clamp(score, 0, 100);

  const label: EnrichedPayment['riskLabel'] =
    score >= 85 ? 'critical' : score >= 65 ? 'high' : score >= 35 ? 'medium' : 'low';

  return { score, label };
};

const badgeForRisk = (label: EnrichedPayment['riskLabel']) => {
  if (label === 'critical') return { variant: 'urgent' as const, text: 'CRITIQUE' };
  if (label === 'high') return { variant: 'warning' as const, text: 'ÉLEVÉ' };
  if (label === 'medium') return { variant: 'info' as const, text: 'MOYEN' };
  return { variant: 'success' as const, text: 'FAIBLE' };
};

/* =========================================================
   5) Page
   ========================================================= */

export default function ValidationPaiementsPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog, currentUser } = useBMOStore();

  // Modes
  const [viewMode, setViewMode] = useState<ViewMode>('7days');
  const [factureFilter, setFactureFilter] = useState<FactureFilterMode>('all');
  const [sortMode, setSortMode] = useState<SortMode>('risk_desc');

  // Console filters
  const [query, setQuery] = useState<string>('');
  const [onlyPending, setOnlyPending] = useState<boolean>(true);

  // Selection / bulk ops
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modale
  const [selectedPayment, setSelectedPayment] = useState<EnrichedPayment | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

  // Workflow multi-étapes (simulé)
  const [bfValidation, setBfValidation] = useState<{ ok: boolean; at?: string; by?: string; hash?: string }>({ ok: false });
  const [blockReason, setBlockReason] = useState('');

  // Cache hash
  const hashCacheRef = useRef<Map<string, string>>(new Map());

  // Responsable BF
  const bfResponsible = employees.find((e) => e.bureau === 'BF' && String(e.role || '').toLowerCase().includes('chef'));

  const getProjectName = (projectId: string) => projects.find((p) => p.id === projectId)?.name;

  // Matching "facture ↔ paiement" (heuristique) : fournisseur + BC + chantier
  const matchFacture = (p: Payment) => {
    const ref = String(p.ref ?? '').toLowerCase();
    const beneficiary = String(p.beneficiary ?? '').toLowerCase();
    const chantier = String(p.project ?? '').toLowerCase();

    let best: any | null = null;
    let bestScore = 0;

    for (const f of facturesRecues as any[]) {
      const sFourn = String(f.fournisseur ?? '').toLowerCase();
      const sBC = String(f.referenceBC ?? '').toLowerCase();
      const sChantier = String(f.chantier ?? '').toLowerCase();

      let score = 0;
      if (beneficiary && sFourn && (sFourn.includes(beneficiary) || beneficiary.includes(sFourn))) score += 45;
      if (ref && sBC && (sBC.includes(ref) || ref.includes(sBC))) score += 40;
      if (chantier && sChantier && (sChantier.includes(chantier) || chantier.includes(sChantier))) score += 20;

      // bonus si montant "proche" (si dispo)
      const mPay = parseMoney((p as any).amount);
      const mFac = typeof f.montantTTC === 'number' ? f.montantTTC : parseMoney(f.montantTTC);
      if (mPay > 0 && mFac > 0) {
        const ratio = Math.min(mPay, mFac) / Math.max(mPay, mFac);
        if (ratio >= 0.98) score += 10;
        else if (ratio >= 0.90) score += 4;
      }

      if (score > bestScore) {
        bestScore = score;
        best = f;
      }
    }

    const quality: EnrichedPayment['matchQuality'] =
      bestScore >= 75 ? 'strong' : bestScore >= 45 ? 'weak' : 'none';

    return { facture: quality === 'none' ? null : best, quality };
  };

  const computePaymentHash = async (p: EnrichedPayment) => {
    const cached = hashCacheRef.current.get(p.id);
    if (cached) return cached;

    const canonical = stableStringify({
      v: 1,
      id: p.id,
      type: p.type,
      ref: p.ref,
      beneficiary: p.beneficiary,
      amount: p.amountNum,
      dueDate: p.dueDate,
      project: p.project,
      bureau: p.bureau,
      status: p.status,
      validatedBy: (p as any).validatedBy ?? null,
      matchedFactureId: p.matchedFacture?.id ?? null,
    });

    const h = await sha256Hex(canonical);
    hashCacheRef.current.set(p.id, h);
    return h;
  };

  // Enrichir paiements (risk + match + days)
  const enrichedPayments: EnrichedPayment[] = useMemo(() => {
    return (paymentsN1 as Payment[]).map((p) => {
      const amountNum = parseMoney((p as any).amount);
      const daysToDue = getDaysToDue((p as any).dueDate);
      const requiresDoubleValidation = amountNum >= DOUBLE_VALIDATION_THRESHOLD;

      const { facture, quality } = matchFacture(p);
      const { score, label } = computeRisk({ daysToDue, amountNum, requiresDoubleValidation, matchedFacture: facture });

      return {
        ...(p as any),
        amountNum,
        daysToDue,
        requiresDoubleValidation,
        matchedFacture: facture,
        matchQuality: quality,
        riskScore: score,
        riskLabel: label,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtrer selon viewMode + query + pending
  const filteredPayments = useMemo(() => {
    let base = [...enrichedPayments];

    // view mode
    if (viewMode === '7days') base = base.filter((p) => p.daysToDue >= 0 && p.daysToDue <= 7);
    else if (viewMode === 'late') base = base.filter((p) => p.daysToDue < 0);
    else if (viewMode === 'critical') base = base.filter((p) => p.requiresDoubleValidation);

    // pending
    if (onlyPending) base = base.filter((p) => String((p as any).status) === 'pending');

    // query
    if (query.trim()) base = base.filter((p) => matchQuery(p, query));

    // sort
    const byDue = (a: EnrichedPayment, b: EnrichedPayment) => {
      const da = parseAnyDate((a as any).dueDate)?.getTime() ?? 0;
      const db = parseAnyDate((b as any).dueDate)?.getTime() ?? 0;
      return da - db;
    };

    if (sortMode === 'due_asc') base.sort((a, b) => byDue(a, b));
    else if (sortMode === 'due_desc') base.sort((a, b) => byDue(b, a));
    else if (sortMode === 'amount_desc') base.sort((a, b) => b.amountNum - a.amountNum);
    else if (sortMode === 'risk_desc') base.sort((a, b) => b.riskScore - a.riskScore || b.amountNum - a.amountNum);
    else if (sortMode === 'status') base.sort((a, b) => String(a.status).localeCompare(String(b.status)));
    else if (sortMode === 'project') base.sort((a, b) => String(a.project).localeCompare(String(b.project)));

    return base;
  }, [enrichedPayments, viewMode, onlyPending, query, sortMode]);

  // Stats globales
  const stats = useMemo(() => {
    const total = enrichedPayments.length;
    const in7Days = enrichedPayments.filter((p) => p.daysToDue >= 0 && p.daysToDue <= 7).length;
    const late = enrichedPayments.filter((p) => p.daysToDue < 0).length;
    const critical = enrichedPayments.filter((p) => p.requiresDoubleValidation).length;
    const totalAmount = enrichedPayments.reduce((acc, p) => acc + p.amountNum, 0);
    const risky = enrichedPayments.filter((p) => p.riskLabel === 'high' || p.riskLabel === 'critical').length;

    return { total, in7Days, late, critical, totalAmount, risky };
  }, [enrichedPayments]);

  // Filtrer factures
  const filteredFactures = useMemo(() => {
    const arr = facturesRecues as any[];
    if (factureFilter === 'pending') return arr.filter((f) => !f.decisionBMO || f.statut === 'à_vérifier');
    if (factureFilter === 'validated') return arr.filter((f) => f.decisionBMO && (f.statut === 'payée' || f.statut === 'conforme'));
    if (factureFilter === 'corrected') return arr.filter((f) => f.decisionBMO && f.statut === 'non_conforme');
    return arr;
  }, [factureFilter]);

  // Bulk selection helpers
  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const selectAllVisible = () => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      for (const p of filteredPayments) n.add(p.id);
      return n;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const selectedPayments = useMemo(() => {
    if (!selectedIds.size) return [];
    const map = new Map(enrichedPayments.map((p) => [p.id, p]));
    return Array.from(selectedIds).map((id) => map.get(id)).filter(Boolean) as EnrichedPayment[];
  }, [selectedIds, enrichedPayments]);

  /* =========================================================
     6) Audit-log "pro" : hash canonique + chainHead
     ========================================================= */

  const logAction = async (p: {
    action: string;
    targetId: string;
    targetType: string;
    targetLabel: string;
    bureau: string;
    details: Record<string, any>;
  }) => {
    const atIso = new Date().toISOString();
    const prevChainHead = typeof window !== 'undefined' ? loadChainHead() : 'GENESIS';

    const payload = canonicalActionPayload({
      action: p.action,
      module: 'validation-paiements',
      targetId: p.targetId,
      targetType: p.targetType,
      actor: currentUser,
      details: p.details,
      prevChainHead,
      atIso,
    });

    const actionHash = await sha256Hex(stableStringify(payload));
    const newChainHead = await sha256Hex(`${prevChainHead}|${actionHash}`);

    if (typeof window !== 'undefined') saveChainHead(newChainHead);

    // Enregistrer dans ton store BMO (texte humain + preuves)
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: p.action,
      module: 'validation-paiements',
      targetId: p.targetId,
      targetType: p.targetType,
      targetLabel: p.targetLabel,
      details: `${JSON.stringify(
        {
          atIso,
          actionHash,
          prevChainHead,
          chainHead: newChainHead,
          ...p.details,
        },
        null,
        0
      )}`,
      bureau: p.bureau,
    });

    return { atIso, actionHash, prevChainHead, chainHead: newChainHead };
  };

  /* =========================================================
     7) Actions métier (autoriser / bloquer / justificatif / exports)
     ========================================================= */

  const openPaymentModal = (payment: EnrichedPayment) => {
    setSelectedPayment(payment);
    setShowValidationModal(true);
    setBfValidation({ ok: false });
    setBlockReason('');
  };

  const handleAuthorize = async (payment: EnrichedPayment) => {
    // Si double validation requise et BF non validé => imposer workflow
    if (payment.requiresDoubleValidation && !bfValidation.ok) {
      setSelectedPayment(payment);
      setShowValidationModal(true);
      addToast(`⚠️ Double validation requise (≥ ${(DOUBLE_VALIDATION_THRESHOLD / 1_000_000).toFixed(0)}M FCFA)`, 'warning');
      return;
    }

    const paymentHash = await computePaymentHash(payment);

    const proof = await logAction({
      action: 'validation',
      targetId: payment.id,
      targetType: 'Paiement',
      targetLabel: `${payment.type} - ${payment.beneficiary}`,
      bureau: (payment as any).bureau,
      details: {
        decision: {
          type: 'AUTHORIZE',
          requiresDoubleValidation: payment.requiresDoubleValidation,
          bfStep: payment.requiresDoubleValidation ? bfValidation : null,
          dgStep: { ok: true, by: currentUser.name, at: new Date().toISOString() },
        },
        payment: {
          id: payment.id,
          ref: (payment as any).ref,
          type: (payment as any).type,
          beneficiary: (payment as any).beneficiary,
          amount: payment.amountNum,
          dueDate: (payment as any).dueDate,
          project: (payment as any).project,
          bureau: (payment as any).bureau,
          validatedBy: (payment as any).validatedBy ?? null,
          status: (payment as any).status,
        },
        controls: {
          riskScore: payment.riskScore,
          matchedFacture: payment.matchedFacture ? { id: payment.matchedFacture.id, quality: payment.matchQuality } : null,
        },
        integrity: {
          paymentHash, // hash canonique paiement
          algo: 'SHA-256',
        },
      },
    });

    addToast(`✓ ${payment.id} autorisé — ${formatFCFA((payment as any).amount)} • chain=${proof.chainHead.slice(0, 10)}…`, 'success');

    // reset modal
    setShowValidationModal(false);
    setSelectedPayment(null);
    setBfValidation({ ok: false });
    setBlockReason('');
  };

  const handleBlock = async (payment: EnrichedPayment, reason: string) => {
    const paymentHash = await computePaymentHash(payment);

    const proof = await logAction({
      action: 'blocage',
      targetId: payment.id,
      targetType: 'Paiement',
      targetLabel: `${payment.type} - ${payment.beneficiary}`,
      bureau: (payment as any).bureau,
      details: {
        decision: { type: 'BLOCK', reason: reason || 'Non spécifié' },
        payment: {
          id: payment.id,
          ref: (payment as any).ref,
          beneficiary: (payment as any).beneficiary,
          amount: payment.amountNum,
          dueDate: (payment as any).dueDate,
          project: (payment as any).project,
        },
        controls: {
          riskScore: payment.riskScore,
          matchedFacture: payment.matchedFacture ? { id: payment.matchedFacture.id, quality: payment.matchQuality } : null,
        },
        integrity: { paymentHash, algo: 'SHA-256' },
      },
    });

    addToast(`🛑 ${payment.id} bloqué — ${reason || 'Non spécifié'} • chain=${proof.chainHead.slice(0, 10)}…`, 'warning');

    setShowValidationModal(false);
    setSelectedPayment(null);
    setBfValidation({ ok: false });
    setBlockReason('');
  };

  const handleRequestJustificatif = async (payment: EnrichedPayment) => {
    await logAction({
      action: 'complement',
      targetId: payment.id,
      targetType: 'Paiement',
      targetLabel: `${payment.type} - ${payment.beneficiary}`,
      bureau: (payment as any).bureau,
      details: {
        request: 'JUSTIFICATIF',
        note: 'Demande de justificatif envoyée',
        payment: { id: payment.id, ref: (payment as any).ref, beneficiary: (payment as any).beneficiary },
      },
    });

    addToast(`📎 Justificatif demandé — ${payment.id}`, 'info');
  };

  const handleBFValidation = async () => {
    if (!selectedPayment) return;

    const at = new Date().toISOString();
    const by = bfResponsible?.name || 'F. DIOP';
    const payload = stableStringify({
      v: 1,
      step: 'BF_VALIDATE',
      paymentId: selectedPayment.id,
      by,
      at,
      threshold: DOUBLE_VALIDATION_THRESHOLD,
    });

    const hash = await sha256Hex(payload);

    setBfValidation({ ok: true, at, by, hash });

    await logAction({
      action: 'bf_validation',
      targetId: selectedPayment.id,
      targetType: 'Paiement',
      targetLabel: `${selectedPayment.type} - ${selectedPayment.beneficiary}`,
      bureau: (selectedPayment as any).bureau,
      details: {
        step: 'BF_VALIDATE',
        by,
        at,
        stepHash: hash,
      },
    });

    addToast('✓ Validation BF confirmée (traçable)', 'success');
  };

  const exportPayments = async (mode: 'json' | 'csv') => {
    const exportedAt = new Date().toISOString();
    const rows = await Promise.all(
      filteredPayments.map(async (p) => {
        const paymentHash = await computePaymentHash(p);
        return {
          id: p.id,
          type: (p as any).type,
          ref: (p as any).ref,
          beneficiary: (p as any).beneficiary,
          project: (p as any).project,
          projectName: getProjectName((p as any).project) || '',
          bureau: (p as any).bureau,
          status: (p as any).status,
          dueDate: (p as any).dueDate,
          daysToDue: p.daysToDue,
          amount: p.amountNum,
          riskScore: p.riskScore,
          riskLabel: p.riskLabel,
          requiresDoubleValidation: p.requiresDoubleValidation,
          matchedFactureId: p.matchedFacture?.id ?? '',
          matchQuality: p.matchQuality,
          paymentHash,
        };
      })
    );

    const chainHead = typeof window !== 'undefined' ? loadChainHead() : 'GENESIS';

    await logAction({
      action: 'export',
      targetId: 'ALL',
      targetType: 'Paiements',
      targetLabel: `Export ${filteredPayments.length} paiements`,
      bureau: 'BMO',
      details: {
        exportedAt,
        mode,
        filters: { viewMode, onlyPending, sortMode, query },
        count: filteredPayments.length,
        chainHead,
      },
    });

    if (mode === 'csv') {
      downloadTextFile(`paiements_${exportedAt.replace(/[:.]/g, '-')}.csv`, toCsv(rows), 'text/csv');
      addToast('Export CSV généré (audit-grade)', 'success');
    } else {
      const bundle = {
        meta: {
          schema: 'BMO.ValidationPaiements.Export',
          version: 1,
          exportedAt,
          exportedBy: currentUser,
          filters: { viewMode, onlyPending, sortMode, query },
          count: rows.length,
          chainHead,
          algo: 'SHA-256',
        },
        items: rows,
      };
      downloadTextFile(`paiements_${exportedAt.replace(/[:.]/g, '-')}.json`, JSON.stringify(bundle, null, 2), 'application/json');
      addToast('Export JSON généré (audit-grade)', 'success');
    }
  };

  const exportEvidencePack = async (payment: EnrichedPayment) => {
    const exportedAt = new Date().toISOString();
    const paymentHash = await computePaymentHash(payment);
    const chainHead = typeof window !== 'undefined' ? loadChainHead() : 'GENESIS';

    const pack = {
      meta: {
        schema: 'BMO.ValidationPaiements.EvidencePack',
        version: 1,
        exportedAt,
        exportedBy: currentUser,
        algo: 'SHA-256',
        chainHead,
        note: 'Paquet de preuve: payload canonique + hash paiement + lien facture + risque.',
      },
      payment: {
        id: payment.id,
        type: (payment as any).type,
        ref: (payment as any).ref,
        beneficiary: (payment as any).beneficiary,
        amount: payment.amountNum,
        dueDate: (payment as any).dueDate,
        daysToDue: payment.daysToDue,
        project: (payment as any).project,
        bureau: (payment as any).bureau,
        status: (payment as any).status,
        validatedBy: (payment as any).validatedBy ?? null,
      },
      controls: {
        riskScore: payment.riskScore,
        riskLabel: payment.riskLabel,
        requiresDoubleValidation: payment.requiresDoubleValidation,
        match: payment.matchedFacture
          ? { id: payment.matchedFacture.id, quality: payment.matchQuality, fournisseur: payment.matchedFacture.fournisseur, referenceBC: payment.matchedFacture.referenceBC }
          : null,
      },
      integrity: { paymentHash },
    };

    await logAction({
      action: 'export_evidence',
      targetId: payment.id,
      targetType: 'Paiement',
      targetLabel: `${payment.type} - ${payment.beneficiary}`,
      bureau: (payment as any).bureau,
      details: { exportedAt, paymentHash, chainHead },
    });

    downloadTextFile(`evidence_${payment.id}_${exportedAt.replace(/[:.]/g, '-')}.json`, JSON.stringify(pack, null, 2), 'application/json');
    addToast('Evidence pack exporté', 'success');
  };

  // Bulk actions
  const bulkAuthorize = async () => {
    if (!selectedPayments.length) return;
    // Si l'un des paiements exige BF => on ouvre le premier pour workflow propre (évite autorisation "silencieuse")
    const needBF = selectedPayments.find((p) => p.requiresDoubleValidation);
    if (needBF) {
      openPaymentModal(needBF);
      addToast('Sélection contient un paiement critique: validation BF requise (traitement sécurisé)', 'warning');
      return;
    }

    for (const p of selectedPayments) {
      await handleAuthorize(p);
    }
    clearSelection();
  };

  const bulkJustificatif = async () => {
    if (!selectedPayments.length) return;
    for (const p of selectedPayments) await handleRequestJustificatif(p);
    addToast(`📎 Demandes envoyées: ${selectedPayments.length}`, 'info');
    clearSelection();
  };

  const bulkBlock = async () => {
    if (!selectedPayments.length) return;
    for (const p of selectedPayments) await handleBlock(p, 'Blocage batch (revue requise)');
    clearSelection();
  };

  /* =========================================================
     8) UI
     ========================================================= */

  const topAmount = (stats.totalAmount / 1_000_000).toFixed(1);

  return (
    <div className="flex flex-col h-full">
      {/* Header console */}
      <div className="flex-shrink-0 space-y-4 border-b border-slate-700/30 bg-slate-900/40 backdrop-blur-sm p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              💳 Console Validation Paiements N+1
              <Badge variant="warning">{stats.total}</Badge>
              <Badge variant="info">{stats.risky} à risque</Badge>
            </h1>
            <p className="text-sm text-slate-400">
              Workflow BF→DG si ≥ {(DOUBLE_VALIDATION_THRESHOLD / 1_000_000).toFixed(0)}M • Hash canonique + chaînage audit • Matching facture↔paiement
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400">Montant total (dataset)</p>
            <p className="font-mono font-bold text-lg text-amber-400">{topAmount}M FCFA</p>
            <div className="flex gap-2 justify-end mt-2 flex-wrap">
              <Button variant="secondary" onClick={() => exportPayments('json')}>📦 Export JSON</Button>
              <Button variant="secondary" onClick={() => exportPayments('csv')}>📄 CSV</Button>
            </div>
          </div>
        </div>

        {/* Search / filters row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-6">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Recherche… ex: beneficiary:"SEN-ELEC" ref:BC-2025-001 risk:8 || project:CH-02 -pending`}
              className={cn(
                'w-full rounded px-3 py-2 text-sm border',
                darkMode ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
              )}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Champs: <span className="font-mono">id:</span> <span className="font-mono">type:</span> <span className="font-mono">ref:</span>{' '}
              <span className="font-mono">beneficiary:</span> <span className="font-mono">project:</span> <span className="font-mono">bureau:</span>{' '}
              <span className="font-mono">status:</span> <span className="font-mono">due:</span> <span className="font-mono">risk:</span> <span className="font-mono">facture:</span>{' '}
              • négation: <span className="font-mono">-token</span> • OR: <span className="font-mono">||</span>
            </p>
          </div>

          <div className="lg:col-span-2">
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className={cn(
                'w-full rounded px-3 py-2 text-sm border',
                darkMode ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
              )}
            >
              <option value="risk_desc">Tri: risque ↓</option>
              <option value="due_asc">Tri: échéance ↑</option>
              <option value="due_desc">Tri: échéance ↓</option>
              <option value="amount_desc">Tri: montant ↓</option>
              <option value="status">Tri: statut</option>
              <option value="project">Tri: chantier</option>
            </select>
          </div>

          <div className="lg:col-span-2 flex items-center gap-2">
            <Button size="sm" variant={onlyPending ? 'default' : 'secondary'} onClick={() => setOnlyPending((v) => !v)} className="w-full">
              ⏳ Pending {onlyPending ? 'ON' : 'OFF'}
            </Button>
          </div>

          <div className="lg:col-span-2 flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={selectAllVisible} className="w-full">
              ☑️ Tout sélectionner
            </Button>
          </div>
        </div>

        {/* Alerte paiements en retard */}
        {stats.late > 0 && (
          <div className={cn('rounded-xl p-3 flex items-center gap-3 border', darkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200')}>
            <span className="text-2xl animate-pulse">🚨</span>
            <div className="flex-1">
              <p className="font-bold text-sm text-red-400">{stats.late} paiement(s) en retard</p>
              <p className="text-xs text-slate-400">Échéance dépassée — risque de pénalités / tension fournisseur</p>
            </div>
            <Button size="sm" variant="destructive" onClick={() => setViewMode('late')}>
              Voir retards
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3">
          <Card className={cn('cursor-pointer transition-all', viewMode === 'all' && 'ring-2 ring-orange-500')} onClick={() => setViewMode('all')}>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-[10px] text-slate-400">Total</p>
            </CardContent>
          </Card>
          <Card className={cn('cursor-pointer transition-all border-amber-500/30', viewMode === '7days' && 'ring-2 ring-amber-500')} onClick={() => setViewMode('7days')}>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-amber-400">{stats.in7Days}</p>
              <p className="text-[10px] text-slate-400">À 7 jours</p>
            </CardContent>
          </Card>
          <Card className={cn('cursor-pointer transition-all border-red-500/30', viewMode === 'late' && 'ring-2 ring-red-500')} onClick={() => setViewMode('late')}>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-red-400">{stats.late}</p>
              <p className="text-[10px] text-slate-400">En retard</p>
            </CardContent>
          </Card>
          <Card className={cn('cursor-pointer transition-all border-purple-500/30', viewMode === 'critical' && 'ring-2 ring-purple-500')} onClick={() => setViewMode('critical')}>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-purple-400">{stats.critical}</p>
              <p className="text-[10px] text-slate-400">≥5M (BF→DG)</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/30">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-emerald-400">{topAmount}M</p>
              <p className="text-[10px] text-slate-400">Montant total</p>
            </CardContent>
          </Card>
        </div>

        {/* Bulk actions bar */}
        {selectedIds.size > 0 && (
          <div className={cn('rounded-xl p-3 border flex flex-wrap items-center gap-2', darkMode ? 'bg-slate-800/50 border-slate-700/60' : 'bg-gray-50 border-gray-200')}>
            <Badge variant="info">{selectedIds.size} sélectionné(s)</Badge>
            <Button size="sm" variant="success" onClick={bulkAuthorize}>✓ Autoriser (batch)</Button>
            <Button size="sm" variant="warning" onClick={bulkJustificatif}>📎 Justificatif (batch)</Button>
            <Button size="sm" variant="destructive" onClick={bulkBlock}>🛑 Bloquer (batch)</Button>
            <Button size="sm" variant="secondary" onClick={clearSelection} className="ml-auto">Annuler sélection</Button>
          </div>
        )}
      </div>

      {/* Zone scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-gutter-stable p-4 space-y-4">
        {/* Table des paiements */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              {viewMode === '7days' && '⏰ Paiements à 7 jours'}
              {viewMode === 'late' && '🚨 Paiements en retard'}
              {viewMode === 'critical' && '🔐 Paiements critiques (BF→DG)'}
              {viewMode === 'all' && '📋 Tous les paiements'}
              <Badge variant="info">{filteredPayments.length}</Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500 w-[36px]">☑</th>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">ID</th>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">Type</th>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">Référence</th>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">Bénéficiaire / Chantier</th>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">Montant</th>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">Échéance</th>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">Contrôles</th>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">Statut</th>
                    <th className="px-3 py-2.5 text-left font-bold text-amber-500">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPayments.map((payment) => {
                    const isLate = payment.daysToDue < 0;
                    const isUrgent = payment.daysToDue >= 0 && payment.daysToDue <= 3;
                    const projectName = getProjectName((payment as any).project);

                    const risk = badgeForRisk(payment.riskLabel);

                    return (
                      <tr
                        key={payment.id}
                        className={cn(
                          'border-t transition-all',
                          darkMode ? 'border-slate-700/50' : 'border-gray-100',
                          isLate && 'bg-red-500/5',
                          isUrgent && !isLate && 'bg-amber-500/5',
                          'hover:bg-orange-500/5'
                        )}
                      >
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(payment.id)}
                            onChange={() => toggleSelected(payment.id)}
                            className="h-4 w-4 accent-orange-500"
                            aria-label={`Sélectionner ${payment.id}`}
                          />
                        </td>

                        <td className="px-3 py-2.5">
                          <span className="font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                            {payment.id}
                          </span>
                        </td>

                        <td className="px-3 py-2.5">
                          <Badge variant={(payment as any).type === 'Situation' ? 'gold' : (payment as any).type === 'Facture' ? 'info' : 'default'}>
                            {(payment as any).type}
                          </Badge>
                        </td>

                        <td className="px-3 py-2.5 font-mono text-[10px]">{(payment as any).ref}</td>

                        <td className="px-3 py-2.5">
                          <div>
                            <p className="font-semibold">{(payment as any).beneficiary}</p>
                            <p className="text-[10px] text-orange-400" title={projectName || (payment as any).project}>
                              {(payment as any).project}{projectName ? ` • ${projectName}` : ''}
                            </p>
                          </div>
                        </td>

                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1">
                            <span className={cn('font-mono font-bold', payment.requiresDoubleValidation ? 'text-purple-400' : 'text-amber-400')}>
                              {formatFCFA((payment as any).amount)}
                            </span>
                            {payment.requiresDoubleValidation && (
                              <span className="text-[9px] px-1 py-0.5 rounded bg-purple-500/20 text-purple-400">
                                BF→DG
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1">
                            <span className={cn(isLate ? 'text-red-400 font-bold' : isUrgent ? 'text-amber-400' : '')}>
                              {(payment as any).dueDate}
                            </span>
                            {isLate && <Badge variant="urgent" pulse>J+{Math.abs(payment.daysToDue)}</Badge>}
                            {isUrgent && !isLate && <Badge variant="warning">J-{payment.daysToDue}</Badge>}
                          </div>
                        </td>

                        <td className="px-3 py-2.5">
                          <div className="flex flex-wrap gap-1 items-center">
                            <Badge variant={risk.variant}>{risk.text} {payment.riskScore}</Badge>

                            {payment.matchedFacture ? (
                              <Badge variant={payment.matchQuality === 'strong' ? 'success' : 'warning'}>
                                📄 {payment.matchQuality === 'strong' ? 'match' : 'match?'} {payment.matchedFacture.id}
                              </Badge>
                            ) : (
                              <Badge variant="urgent">📄 none</Badge>
                            )}
                          </div>
                        </td>

                        <td className="px-3 py-2.5">
                          <Badge variant={(payment as any).status === 'pending' ? 'warning' : 'success'}>
                            {(payment as any).status === 'pending' ? 'En attente' : 'Validé'}
                          </Badge>
                        </td>

                        <td className="px-3 py-2.5">
                          <div className="flex gap-1">
                            <Button size="xs" variant="success" onClick={() => handleAuthorize(payment)}>✓</Button>
                            <Button size="xs" variant="info" onClick={() => openPaymentModal(payment)} title="Voir détails / workflow">
                              👁
                            </Button>
                            <Button size="xs" variant="warning" onClick={() => handleRequestJustificatif(payment)}>📎</Button>
                            <Button size="xs" variant="secondary" onClick={() => exportEvidencePack(payment)}>🧾</Button>
                            <Button size="xs" variant="destructive" onClick={() => handleBlock(payment, 'Justificatif insuffisant')}>🛑</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {filteredPayments.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-slate-400">Aucun paiement ne correspond aux filtres / recherche</p>
            </CardContent>
          </Card>
        )}

        {/* Table des factures reçues */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <CardTitle className="text-sm flex items-center gap-2">
                📄 Factures reçues
                <Badge variant="info">{filteredFactures.length}</Badge>
              </CardTitle>

              <div className="flex gap-1 flex-wrap">
                {([
                  { k: 'all', label: 'Tous' },
                  { k: 'pending', label: '⏳ En attente (R)' },
                  { k: 'validated', label: '✅ Validé (A)' },
                  { k: 'corrected', label: '🛠️ Corrigés (R)' },
                ] as const).map((x) => (
                  <button
                    key={x.k}
                    onClick={() => setFactureFilter(x.k as FactureFilterMode)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                      factureFilter === x.k
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : 'text-slate-400 hover:bg-slate-700/50'
                    )}
                  >
                    {x.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className={darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">ID Facture</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Fournisseur</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Chantier</th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase text-amber-500">Montant TTC</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Statut BMO</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Décision</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredFactures.map((facture: any) => (
                    <tr
                      key={facture.id}
                      className={cn(
                        'border-t',
                        darkMode ? 'border-slate-700/50 hover:bg-blue-500/5' : 'border-gray-100 hover:bg-gray-50'
                      )}
                    >
                      <td className="px-3 py-2.5">
                        <span className="font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                          {facture.id}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-medium">{facture.fournisseur}</td>
                      <td className="px-3 py-2.5">
                        <div>
                          <p className="font-medium">{facture.chantier}</p>
                          <p className="text-[10px] text-slate-400">BC: {facture.referenceBC}</p>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-amber-400">
                        {Number(facture.montantTTC).toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="px-3 py-2.5">
                        {facture.decisionBMO ? <Badge variant="success">✅ Validé</Badge> : <Badge variant="warning">⏳ En attente</Badge>}
                      </td>
                      <td className="px-3 py-2.5">
                        {facture.decisionBMO?.decisionId ? (
                          <Button
                            size="xs"
                            variant="link"
                            className="p-0 h-auto text-blue-400"
                            onClick={() => window.open(`/decisions?id=${facture.decisionBMO?.decisionId}`, '_blank')}
                          >
                            📄 Voir décision
                          </Button>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {filteredFactures.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-slate-400">Aucune facture dans cette catégorie</p>
            </CardContent>
          </Card>
        )}

        {/* Modal validation / workflow */}
        {showValidationModal && selectedPayment && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-xl max-h-[85vh] overflow-y-auto overscroll-contain">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  {selectedPayment.requiresDoubleValidation ? '🔐 Workflow BF→DG (montant critique)' : '💳 Détails paiement'}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Détails paiement */}
                <div className={cn('p-3 rounded-lg', darkMode ? 'bg-slate-700/50' : 'bg-gray-50')}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-mono text-xs text-blue-400">{selectedPayment.id}</span>
                      <Badge variant="info" className="ml-2">{selectedPayment.type}</Badge>
                      <Badge variant={badgeForRisk(selectedPayment.riskLabel).variant} className="ml-2">
                        Risque {selectedPayment.riskScore}
                      </Badge>
                    </div>

                    <span className={cn('font-mono font-bold text-lg', selectedPayment.requiresDoubleValidation ? 'text-purple-400' : 'text-amber-400')}>
                      {formatFCFA((selectedPayment as any).amount)}
                    </span>
                  </div>

                  <p className="font-bold text-sm">{selectedPayment.beneficiary}</p>
                  <p className="text-xs text-slate-400">Ref: {(selectedPayment as any).ref}</p>

                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    <div>
                      <span className="text-slate-400">Projet:</span>{' '}
                      <span className="text-orange-400" title={getProjectName((selectedPayment as any).project) || (selectedPayment as any).project}>
                        {(selectedPayment as any).project}
                        {getProjectName((selectedPayment as any).project) ? ` • ${getProjectName((selectedPayment as any).project)}` : ''}
                      </span>
                    </div>
                    <div><span className="text-slate-400">Échéance:</span> {(selectedPayment as any).dueDate}</div>
                    <div><span className="text-slate-400">Validé par:</span> {(selectedPayment as any).validatedBy}</div>
                    <div><span className="text-slate-400">Bureau:</span> <BureauTag bureau={(selectedPayment as any).bureau} /></div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 items-center">
                    {selectedPayment.matchedFacture ? (
                      <Badge variant={selectedPayment.matchQuality === 'strong' ? 'success' : 'warning'}>
                        📄 Facture {selectedPayment.matchedFacture.id} ({selectedPayment.matchQuality})
                      </Badge>
                    ) : (
                      <Badge variant="urgent">📄 Aucune facture matchée</Badge>
                    )}
                    <Button size="xs" variant="secondary" onClick={() => exportEvidencePack(selectedPayment)}>🧾 Export preuve</Button>
                  </div>
                </div>

                {/* Workflow BF→DG si critique */}
                {selectedPayment.requiresDoubleValidation && (
                  <>
                    <div className="p-3 rounded-lg border-l-4 border-l-purple-500 bg-purple-500/10">
                      <p className="text-xs text-purple-300 font-bold mb-1">
                        Montant ≥ {(DOUBLE_VALIDATION_THRESHOLD / 1_000_000).toFixed(0)}M FCFA
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Étape 1: BF valide (R) • Étape 2: DG autorise (A) • Journal append-only (hash + chainHead)
                      </p>
                    </div>

                    {/* BF */}
                    <div className={cn(
                      'p-3 rounded-lg border-l-4',
                      bfValidation.ok ? 'border-l-emerald-500 bg-emerald-500/10' : 'border-l-amber-500 bg-amber-500/10'
                    )}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{bfValidation.ok ? '✓' : '1️⃣'}</span>
                          <div>
                            <p className="font-bold text-sm">Validation Bureau Finance (R)</p>
                            <p className="text-[10px] text-slate-400">
                              {bfResponsible?.name || 'F. DIOP'} — Chef Bureau Finance
                            </p>
                            {bfValidation.ok && (
                              <p className="text-[10px] text-emerald-300 mt-1 font-mono">
                                stepHash: {String(bfValidation.hash || '').slice(0, 18)}…
                              </p>
                            )}
                          </div>
                        </div>

                        {!bfValidation.ok ? (
                          <Button size="sm" variant="warning" onClick={handleBFValidation}>
                            Simuler validation BF
                          </Button>
                        ) : (
                          <Badge variant="success">✓ Validé</Badge>
                        )}
                      </div>
                    </div>

                    {/* DG */}
                    <div className={cn(
                      'p-3 rounded-lg border-l-4',
                      bfValidation.ok ? 'border-l-emerald-500 bg-emerald-500/10' : 'border-l-slate-500 bg-slate-500/10 opacity-60'
                    )}>
                      <div className="flex items-start gap-2">
                        <span className="text-lg">2️⃣</span>
                        <div>
                          <p className="font-bold text-sm">Autorisation Directeur Général (A)</p>
                          <p className="text-[10px] text-slate-400">{currentUser.name} — {currentUser.role}</p>
                          {!bfValidation.ok && (
                            <p className="text-[10px] text-slate-400 mt-1">Bloqué tant que BF n'a pas validé.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Blocage */}
                <div className={cn('p-3 rounded-lg', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                  <p className="text-xs font-bold mb-2">Motif de blocage (optionnel)</p>
                  <textarea
                    placeholder="Ex: Justificatif manquant, montant incorrect, incohérence facture/BC..."
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className={cn(
                      'w-full px-3 py-2 rounded text-xs',
                      darkMode ? 'bg-slate-800 border border-slate-600' : 'bg-white border border-gray-300'
                    )}
                    rows={2}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                  <Button
                    className="flex-1"
                    disabled={selectedPayment.requiresDoubleValidation && !bfValidation.ok}
                    onClick={() => handleAuthorize(selectedPayment)}
                  >
                    ✓ Autoriser
                  </Button>

                  <Button variant="destructive" onClick={() => handleBlock(selectedPayment, blockReason || 'Non spécifié')}>
                    🛑 Bloquer
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowValidationModal(false);
                      setSelectedPayment(null);
                      setBfValidation({ ok: false });
                      setBlockReason('');
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Info traçabilité */}
        <Card className="border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🧾</span>
              <div>
                <h3 className="font-bold text-sm text-blue-400">Traçabilité "audit-grade"</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Chaque action génère : payload canonique, hash SHA-256, et chaînage append-only (chainHead) pour détecter toute altération.
                </p>
                <div className="flex flex-wrap gap-2 mt-2 text-[10px]">
                  <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">ActionHash</span>
                  <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400">PrevChainHead</span>
                  <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400">ChainHead</span>
                  <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400">PaymentHash canonique</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">
                  Seuil critique : paiement ≥ {(DOUBLE_VALIDATION_THRESHOLD / 1_000_000).toFixed(0)}M FCFA ⇒ BF (R) puis DG (A).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
