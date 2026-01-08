'use client';

import React, { useCallback, useEffect, useMemo, useState, useDeferredValue } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { contractsToSign, raciMatrix, employees } from '@/lib/data';
import type { Contract } from '@/lib/types/bmo.types';

/**
 * =========================
 * Utils robustes
 * =========================
 */
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
  // heure neutralisée => pas de décalage J-1 selon fuseau/heure
  return new Date(yy, mm - 1, dd, 0, 0, 0, 0);
};

const getDaysToExpiry = (expiryStr: string): number | null => {
  const expiryDate = parseFRDate(expiryStr);
  if (!expiryDate) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const diffTime = expiryDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// CSV safe
const csvEscape = (v: unknown): string => {
  const s = String(v ?? '');
  if (/[;"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

// SHA-256 via WebCrypto, fallback FNV-1a32 (faible) si indispo.
const toHex = (buf: ArrayBuffer): string =>
  Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');

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

/**
 * =========================
 * RACI (robuste)
 * =========================
 */
type RACIRole = 'R' | 'A' | 'C' | 'I' | '-' | '' | string;

const getRACIRole = (activity: string, bureau: string): RACIRole => {
  const row = (raciMatrix as any[]).find(r => String(r.activity) === activity);
  if (!row) return '-';
  const val = row[bureau];
  return (val ?? '-') as RACIRole;
};

const canBJApprove = (bureau: string) => getRACIRole('Signature contrats', bureau) === 'R';
const canBMOSign = (bureau: string) => getRACIRole('Signature contrats', bureau) === 'A';

/**
 * =========================
 * Modèle workflow + audit
 * =========================
 */
type WorkflowState = 'PENDING_BJ' | 'PENDING_BMO' | 'SIGNED' | 'IGNORED';

type BJApproval = {
  approvedById: string;
  approvedByName: string;
  approvedAtISO: string;
  approvalHash: string; // hash canonical
};

type BMOSignature = {
  signedById: string;
  signedByName: string;
  signedAtISO: string;
  signatureHash: string; // hash canonical
  bjApprovalHashRef: string; // lien fort vers BJ
};

type ContractItem = Contract & {
  daysToExpiry: number | null;
  amountValue: number;
  expiryDate: Date | null;

  // workflow (stocké local)
  workflow: WorkflowState;
  bjApproval?: BJApproval | null;
  bmoSignature?: BMOSignature | null;

  // computed
  riskScore: number;
  riskSignals: string[];
  priority: 'NOW' | 'WATCH' | 'OK';
};

const LS_KEYS = {
  bj: 'bmo_contracts_bj_approvals_v1',
  sign: 'bmo_contracts_bmo_signatures_v1',
  reviewed: 'bmo_contracts_reviewed_v1',
  ignored: 'bmo_contracts_ignored_v1',
};

const loadMap = <T,>(key: string): Record<string, T> => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, T>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const saveMap = (key: string, map: Record<string, any>) => {
  try { localStorage.setItem(key, JSON.stringify(map)); } catch {}
};

/**
 * Risk engine (heuristique robuste)
 */
const computeRisk = (c: {
  daysToExpiry: number | null;
  amountValue: number;
  expiryDate: Date | null;
  subject?: string;
  partner?: string;
  preparedBy?: string;
  type?: string;
  bureau?: string;
  workflow: WorkflowState;
}) => {
  const signals: string[] = [];
  let score = 0;

  // Gouvernance
  if (c.workflow === 'PENDING_BJ') { score += 28; signals.push('Validation BJ manquante'); }
  if (c.workflow === 'PENDING_BMO') { score += 18; signals.push('Signature BMO en attente'); }

  // Échéance
  if (c.daysToExpiry === null) { score += 8; signals.push("Date d'expiration manquante"); }
  else if (c.daysToExpiry < 0) { score += 35; signals.push('Contrat expiré'); }
  else if (c.daysToExpiry <= 3) { score += 25; signals.push('Échéance ≤ 3 jours'); }
  else if (c.daysToExpiry <= 7) { score += 15; signals.push('Échéance ≤ 7 jours'); }
  else if (c.daysToExpiry <= 14) { score += 8; signals.push('Échéance ≤ 14 jours'); }

  // Montant
  const a = Math.abs(c.amountValue);
  if (a >= 50_000_000) { score += 22; signals.push('Montant très élevé'); }
  else if (a >= 10_000_000) { score += 14; signals.push('Montant élevé'); }
  else if (a >= 2_000_000) { score += 7; signals.push('Montant significatif'); }

  // Qualité données
  if (!c.subject?.trim()) { score += 10; signals.push('Objet manquant'); }
  if (!c.partner?.trim()) { score += 10; signals.push('Partenaire manquant'); }
  if (!c.preparedBy?.trim()) { score += 6; signals.push('Préparateur manquant'); }
  if (!c.bureau?.trim()) { score += 6; signals.push('Bureau manquant'); }

  score = clamp(score, 0, 100);
  const priority = score >= 70 ? 'NOW' : score >= 40 ? 'WATCH' : 'OK';
  return { score, signals, priority };
};

type Tab = 'inbox' | 'all' | 'type' | 'audit';

export default function ValidationContratsPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();

  // Simule un user (à remplacer par auth réel)
  const currentUser = useMemo(() => ({
    id: 'USR-001',
    name: 'A. DIALLO',
    role: 'Directeur Général',
    bureau: 'BMO',
  }), []);

  // Chargement états locaux
  const [bjApprovals, setBJApprovals] = useState<Record<string, BJApproval>>({});
  const [bmoSignatures, setBMOSignatures] = useState<Record<string, BMOSignature>>({});
  const [reviewed, setReviewed] = useState<Record<string, true>>({});
  const [ignored, setIgnored] = useState<Record<string, true>>({});

  useEffect(() => {
    setBJApprovals(loadMap<BJApproval>(LS_KEYS.bj));
    setBMOSignatures(loadMap<BMOSignature>(LS_KEYS.sign));
    setReviewed(loadMap<true>(LS_KEYS.reviewed));
    setIgnored(loadMap<true>(LS_KEYS.ignored));
  }, []);

  const persistBJ = useCallback((next: Record<string, BJApproval>) => {
    setBJApprovals(next); saveMap(LS_KEYS.bj, next);
  }, []);
  const persistSign = useCallback((next: Record<string, BMOSignature>) => {
    setBMOSignatures(next); saveMap(LS_KEYS.sign, next);
  }, []);
  const persistReviewed = useCallback((next: Record<string, true>) => {
    setReviewed(next); saveMap(LS_KEYS.reviewed, next);
  }, []);
  const persistIgnored = useCallback((next: Record<string, true>) => {
    setIgnored(next); saveMap(LS_KEYS.ignored, next);
  }, []);

  // UI state
  const [tab, setTab] = useState<Tab>('inbox');
  const [search, setSearch] = useState('');
  const searchDeferred = useDeferredValue(search);

  const [filterType, setFilterType] = useState<'ALL' | 'Marché' | 'Avenant' | 'Sous-traitance'>('ALL');
  const [riskMin, setRiskMin] = useState(0);
  const [sortBy, setSortBy] = useState<'risk' | 'expiry' | 'amount'>('risk');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  const [selected, setSelected] = useState<Record<string, true>>({});
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const bjJurist = useMemo(() => {
    return employees.find((e: any) => e.bureau === 'BJ' && String(e.role || '').toLowerCase().includes('juriste'));
  }, []);

  const items: ContractItem[] = useMemo(() => {
    const arr = (contractsToSign as Contract[]).map((c) => {
      const amountValue = parseMoney((c as any).amount);
      const expiryDate = parseFRDate((c as any).expiry);
      const daysToExpiry = (c as any).expiry ? getDaysToExpiry(String((c as any).expiry)) : null;

      const bjApproval = bjApprovals[c.id] ?? null;
      const bmoSignature = bmoSignatures[c.id] ?? null;
      const isIgnored = !!ignored[c.id];

      const workflow: WorkflowState =
        isIgnored ? 'IGNORED' :
        bmoSignature ? 'SIGNED' :
        bjApproval ? 'PENDING_BMO' :
        'PENDING_BJ';

      const r = computeRisk({
        daysToExpiry,
        amountValue,
        expiryDate,
        subject: c.subject,
        partner: (c as any).partner,
        preparedBy: (c as any).preparedBy,
        type: (c as any).type,
        bureau: (c as any).bureau,
        workflow,
      });

      return {
        ...c,
        amountValue,
        expiryDate,
        daysToExpiry,
        workflow,
        bjApproval,
        bmoSignature,
        riskScore: r.score,
        riskSignals: r.signals,
        priority: r.priority,
      };
    });

    return arr;
  }, [bjApprovals, bmoSignatures, ignored]);

  const stats = useMemo(() => {
    const total = items.filter(i => i.workflow !== 'IGNORED').length;
    const urgent = items.filter(i => i.workflow !== 'IGNORED' && i.daysToExpiry !== null && i.daysToExpiry <= 7 && i.workflow !== 'SIGNED').length;
    const exp = items.filter(i => i.workflow !== 'IGNORED' && i.daysToExpiry !== null && i.daysToExpiry < 0 && i.workflow !== 'SIGNED').length;
    const pendingBJ = items.filter(i => i.workflow === 'PENDING_BJ').length;
    const pendingBMO = items.filter(i => i.workflow === 'PENDING_BMO').length;
    const signed = items.filter(i => i.workflow === 'SIGNED').length;
    const highRisk = items.filter(i => i.workflow !== 'IGNORED' && i.riskScore >= 70 && i.workflow !== 'SIGNED').length;
    return { total, urgent, exp, pendingBJ, pendingBMO, signed, highRisk };
  }, [items]);

  const filtered = useMemo(() => {
    const s = searchDeferred.trim().toLowerCase();

    let arr = items.filter(i => i.workflow !== 'IGNORED');

    if (filterType !== 'ALL') arr = arr.filter(i => (i as any).type === filterType);
    if (riskMin > 0) arr = arr.filter(i => i.riskScore >= riskMin);

    if (s) {
      arr = arr.filter(i => {
        const hay = [
          i.id,
          (i as any).type ?? '',
          i.subject ?? '',
          (i as any).partner ?? '',
          (i as any).preparedBy ?? '',
          (i as any).bureau ?? '',
          String((i as any).expiry ?? ''),
          i.workflow,
          i.bjApproval?.approvalHash ?? '',
          i.bmoSignature?.signatureHash ?? '',
        ].join(' ').toLowerCase();
        return hay.includes(s);
      });
    }

    const dir = sortDir === 'desc' ? -1 : 1;
    arr = [...arr].sort((a, b) => {
      if (sortBy === 'risk') return (a.riskScore - b.riskScore) * dir;
      if (sortBy === 'amount') return (a.amountValue - b.amountValue) * dir;

      // expiry: null => en bas
      const ax = a.daysToExpiry === null ? 999999 : a.daysToExpiry;
      const bx = b.daysToExpiry === null ? 999999 : b.daysToExpiry;
      return (ax - bx) * dir;
    });

    return arr;
  }, [items, searchDeferred, filterType, riskMin, sortBy, sortDir]);

  const inbox = useMemo(() => {
    // Inbox = NOW/WATCH + pas SIGNED + pas reviewed
    return filtered.filter(i =>
      i.workflow !== 'SIGNED' &&
      !reviewed[i.id] &&
      (i.priority === 'NOW' || i.priority === 'WATCH')
    );
  }, [filtered, reviewed]);

  const byType = useMemo(() => {
    const m = {
      marche: filtered.filter(i => (i as any).type === 'Marché'),
      avenant: filtered.filter(i => (i as any).type === 'Avenant'),
      soustraitance: filtered.filter(i => (i as any).type === 'Sous-traitance'),
    };
    return m;
  }, [filtered]);

  const displayed = useMemo(() => {
    if (tab === 'inbox') return inbox;
    if (tab === 'all') return filtered;
    return filtered; // type/audit gérés à part
  }, [tab, inbox, filtered]);

  const toggleSelected = useCallback((id: string) => {
    setSelected(prev => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  }, []);

  const clearSelected = useCallback(() => setSelected({}), []);

  const selectedItems = useMemo(() => {
    const ids = new Set(Object.keys(selected));
    return filtered.filter(i => ids.has(i.id));
  }, [selected, filtered]);

  const setReviewedFor = useCallback((id: string, v: boolean) => {
    persistReviewed(prev => {
      const next = { ...prev };
      if (v) next[id] = true;
      else delete next[id];
      return next;
    });
  }, [persistReviewed]);

  const toggleReviewed = useCallback((id: string) => {
    persistReviewed(prev => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  }, [persistReviewed]);

  const ignoreContract = useCallback((id: string) => {
    persistIgnored(prev => ({ ...prev, [id]: true }));
    addToast(`✂️ ${id} retiré de la liste (ignored)`, 'info');
  }, [persistIgnored, addToast]);

  /**
   * =========================
   * Actions workflow (BJ / BMO)
   * =========================
   */
  const approveBJ = useCallback(async (contract: ContractItem) => {
    // RACI: seul BJ (R) approuve
    if (!canBJApprove(currentUser.bureau)) {
      addToast(`❌ RACI: votre bureau (${currentUser.bureau}) ne peut pas valider BJ (R requis).`, 'error');
      return;
    }

    const ts = new Date().toISOString();
    const canonical = [
      'BJ_APPROVAL',
      contract.id,
      contract.subject,
      (contract as any).partner ?? '',
      String(contract.amountValue),
      String((contract as any).expiry ?? ''),
      currentUser.id,
      currentUser.name,
      currentUser.bureau,
      ts,
    ].join('|');

    const approvalHash = `SHA-256:${await sha256Hex(canonical)}`;

    const approval: BJApproval = {
      approvedById: currentUser.id,
      approvedByName: currentUser.name,
      approvedAtISO: ts,
      approvalHash,
    };

    persistBJ(prev => ({ ...prev, [contract.id]: approval }));

    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'bj-approval',
      module: 'validation-contrats',
      targetId: contract.id,
      targetType: 'Contrat',
      targetLabel: contract.subject,
      details: `BJ APPROVED | ${approvalHash} | at ${ts}`,
      bureau: 'BJ',
    });

    addToast(`✅ BJ validé (${contract.id})`, 'success');
  }, [currentUser, addToast, addActionLog, persistBJ]);

  const signBMO = useCallback(async (contract: ContractItem) => {
    // RACI: seul BMO (A) signe
    if (!canBMOSign(currentUser.bureau)) {
      addToast(`❌ RACI: votre bureau (${currentUser.bureau}) ne peut pas signer (A requis).`, 'error');
      return;
    }

    // 2-man rule : BJ obligatoire
    const bj = bjApprovals[contract.id];
    if (!bj) {
      addToast('⚠️ Double contrôle: BJ doit valider avant signature.', 'warning');
      return;
    }

    const ts = new Date().toISOString();
    const canonical = [
      'BMO_SIGNATURE',
      contract.id,
      contract.subject,
      (contract as any).partner ?? '',
      String(contract.amountValue),
      String((contract as any).expiry ?? ''),
      currentUser.id,
      currentUser.name,
      currentUser.bureau,
      `BJ_REF=${bj.approvalHash}`,
      ts,
    ].join('|');

    const signatureHash = `SHA-256:${await sha256Hex(canonical)}`;

    const sign: BMOSignature = {
      signedById: currentUser.id,
      signedByName: currentUser.name,
      signedAtISO: ts,
      signatureHash,
      bjApprovalHashRef: bj.approvalHash,
    };

    persistSign(prev => ({ ...prev, [contract.id]: sign }));

    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'signature',
      module: 'validation-contrats',
      targetId: contract.id,
      targetType: 'Contrat',
      targetLabel: contract.subject,
      details: `SIGNED | ${signatureHash} | BJ_REF ${bj.approvalHash} | at ${ts}`,
      bureau: contract.bureau,
    });

    addToast(`✍️ Signé (${contract.id}) — ${signatureHash.slice(0, 22)}…`, 'success');
  }, [currentUser, bjApprovals, addToast, addActionLog, persistSign]);

  const sendToBJ = useCallback((contract: ContractItem) => {
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'renvoi',
      module: 'validation-contrats',
      targetId: contract.id,
      targetType: 'Contrat',
      targetLabel: contract.subject,
      details: `RENVOI BJ | demandé par ${currentUser.name}`,
      bureau: 'BJ',
    });
    addToast(`📤 ${contract.id} renvoyé au BJ`, 'info');
  }, [currentUser, addActionLog, addToast]);

  const requestArbitrage = useCallback((contract: ContractItem) => {
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'arbitrage',
      module: 'validation-contrats',
      targetId: contract.id,
      targetType: 'Contrat',
      targetLabel: contract.subject,
      details: `ARBITRAGE demandé`,
      bureau: contract.bureau,
    });
    addToast(`⚖️ Arbitrage demandé (${contract.id})`, 'warning');
  }, [currentUser, addActionLog, addToast]);

  /**
   * =========================
   * Export audit (CSV + manifest chaîné)
   * =========================
   */
  const exportAudited = useCallback(async (scope: 'FILTERED' | 'SELECTED') => {
    const data = scope === 'SELECTED' ? selectedItems : filtered;
    if (!data.length) {
      addToast('⚠️ Rien à exporter', 'warning');
      return;
    }

    const exportedAt = new Date().toISOString();
    const seed = `BMO_CONTRACTS_EXPORT|${exportedAt}|count=${data.length}`;
    let chain = await sha256Hex(seed);

    const header = [
      'ID', 'Type', 'Objet', 'Partenaire', 'Bureau',
      'Montant', 'Date', 'Expiration', 'JoursAvantExp',
      'Workflow',
      'BJ_ApprovedAt', 'BJ_ApprovedBy', 'BJ_Hash',
      'BMO_SignedAt', 'BMO_SignedBy', 'BMO_Hash', 'BMO_BJ_Ref',
      'RiskScore', 'RiskSignals',
      'Reviewed',
      'RowHash(calc)', 'ChainHash(calc)',
    ];

    const lines: string[] = [header.join(';')];
    const manifestRows: Array<{ id: string; rowHash: string; chainHash: string; riskScore: number }> = [];

    for (const c of data) {
      const canonical = [
        c.id,
        (c as any).type ?? '',
        c.subject ?? '',
        (c as any).partner ?? '',
        (c as any).bureau ?? '',
        String(c.amountValue),
        String((c as any).date ?? ''),
        String((c as any).expiry ?? ''),
        String(c.daysToExpiry ?? ''),
        c.workflow,
        c.bjApproval?.approvedAtISO ?? '',
        c.bjApproval?.approvedByName ?? '',
        c.bjApproval?.approvalHash ?? '',
        c.bmoSignature?.signedAtISO ?? '',
        c.bmoSignature?.signedByName ?? '',
        c.bmoSignature?.signatureHash ?? '',
        c.bmoSignature?.bjApprovalHashRef ?? '',
        String(c.riskScore),
        (c.riskSignals ?? []).join('|'),
        reviewed[c.id] ? 'true' : 'false',
      ].join('|');

      const rowHash = await sha256Hex(canonical);
      chain = await sha256Hex(`${chain}|${rowHash}`);

      manifestRows.push({ id: c.id, rowHash, chainHash: chain, riskScore: c.riskScore });

      const row = [
        csvEscape(c.id),
        csvEscape((c as any).type ?? ''),
        csvEscape(c.subject ?? ''),
        csvEscape((c as any).partner ?? ''),
        csvEscape((c as any).bureau ?? ''),
        csvEscape(String(c.amountValue)),
        csvEscape(String((c as any).date ?? '')),
        csvEscape(String((c as any).expiry ?? '')),
        csvEscape(String(c.daysToExpiry ?? '')),
        csvEscape(c.workflow),
        csvEscape(c.bjApproval?.approvedAtISO ?? ''),
        csvEscape(c.bjApproval?.approvedByName ?? ''),
        csvEscape(c.bjApproval?.approvalHash ?? ''),
        csvEscape(c.bmoSignature?.signedAtISO ?? ''),
        csvEscape(c.bmoSignature?.signedByName ?? ''),
        csvEscape(c.bmoSignature?.signatureHash ?? ''),
        csvEscape(c.bmoSignature?.bjApprovalHashRef ?? ''),
        csvEscape(String(c.riskScore)),
        csvEscape((c.riskSignals ?? []).join(' | ')),
        csvEscape(reviewed[c.id] ? 'true' : 'false'),
        csvEscape(rowHash),
        csvEscape(chain),
      ];

      lines.push(row.join(';'));
    }

    // CSV
    const csvContent = lines.join('\n');
    const csvBlob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const csvUrl = URL.createObjectURL(csvBlob);
    const a = document.createElement('a');
    a.href = csvUrl;
    a.download = `contrats_${scope.toLowerCase()}_${exportedAt.slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(csvUrl);

    // Manifest
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
    b.download = `contrats_${scope.toLowerCase()}_${exportedAt.slice(0, 10)}.manifest.json`;
    document.body.appendChild(b);
    b.click();
    document.body.removeChild(b);
    URL.revokeObjectURL(jsonUrl);

    addToast(`✅ Export audité généré (${scope})`, 'success');
  }, [filtered, selectedItems, reviewed, addToast]);

  /**
   * Bulk actions
   */
  const bulkReviewed = useCallback(() => {
    if (!selectedItems.length) { addToast('⚠️ Sélection vide', 'warning'); return; }
    persistReviewed(prev => {
      const next = { ...prev };
      for (const it of selectedItems) next[it.id] = true;
      return next;
    });
    clearSelected();
    addToast(`✅ ${selectedItems.length} contrats marqués reviewed`, 'success');
  }, [selectedItems, persistReviewed, clearSelected, addToast]);

  const bulkExportSelected = useCallback(() => void exportAudited('SELECTED'), [exportAudited]);

  /**
   * Modal contract
   */
  const selectedContract = useMemo(() => {
    if (!selectedContractId) return null;
    return items.find(i => i.id === selectedContractId) ?? null;
  }, [selectedContractId, items]);

  const openContractModal = useCallback((id: string) => {
    setSelectedContractId(id);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedContractId(null);
  }, []);

  /**
   * UI helpers
   */
  const PriorityBadge = ({ p }: { p: ContractItem['priority'] }) => {
    if (p === 'NOW') return <Badge variant="urgent" className="text-[10px]">🔥 NOW</Badge>;
    if (p === 'WATCH') return <Badge variant="warning" className="text-[10px]">👀 WATCH</Badge>;
    return <Badge variant="success" className="text-[10px]">✅ OK</Badge>;
  };

  const WorkflowBadge = ({ w }: { w: WorkflowState }) => {
    if (w === 'SIGNED') return <Badge variant="success" className="text-[10px]">✍️ SIGNED</Badge>;
    if (w === 'PENDING_BMO') return <Badge variant="warning" className="text-[10px]">⏳ BMO</Badge>;
    if (w === 'PENDING_BJ') return <Badge variant="urgent" className="text-[10px]">🔐 BJ</Badge>;
    return <Badge variant="default" className="text-[10px]">✂️ IGNORED</Badge>;
  };

  const RiskBadge = ({ s }: { s: number }) => {
    if (s >= 70) return <Badge variant="urgent" className="text-[10px]">Risque {s}</Badge>;
    if (s >= 40) return <Badge variant="warning" className="text-[10px]">Risque {s}</Badge>;
    return <Badge variant="success" className="text-[10px]">Risque {s}</Badge>;
  };

  /**
   * Render groups
   */
  const listToRender = tab === 'inbox' ? inbox : filtered;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            📜 Contrats — Command Center
            <Badge variant="gold">{stats.total}</Badge>
          </h1>
          <p className="text-sm text-slate-400">
            Workflow BJ→BMO • 2-man rule • Hash SHA-256 • Export audité
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400">RACI:</span>
          <Badge variant="success">BJ = R</Badge>
          <Badge variant="warning">BMO = A</Badge>
        </div>
      </div>

      {/* Alertes */}
      {(stats.exp > 0 || stats.urgent > 0 || stats.highRisk > 0) && (
        <div className={cn(
          'rounded-xl p-3 flex items-center gap-3 border',
          darkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
        )}>
          <span className="text-2xl">🚨</span>
          <div className="flex-1">
            <p className="font-bold text-sm text-red-400">
              {stats.exp} expiré(s) • {stats.urgent} urgent(s) (&lt;= 7j) • {stats.highRisk} high risk (≥70)
            </p>
            <p className="text-xs text-slate-400">
              Inbox priorisée = ce qui doit bouger maintenant, pas "tout voir".
            </p>
          </div>
          <Button size="sm" variant="destructive" onClick={() => setTab('inbox')}>
            Ouvrir Inbox
          </Button>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{stats.pendingBJ}</p><p className="text-[10px] text-slate-400">BJ à faire</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{stats.pendingBMO}</p><p className="text-[10px] text-slate-400">BMO à signer</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-emerald-400">{stats.signed}</p><p className="text-[10px] text-slate-400">Signés</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-red-400">{stats.exp}</p><p className="text-[10px] text-slate-400">Expirés</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-amber-400">{stats.urgent}</p><p className="text-[10px] text-slate-400">Urgents</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-red-400">{stats.highRisk}</p><p className="text-[10px] text-slate-400">High risk</p></CardContent></Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-3 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Rechercher (id, partenaire, objet, hash, bureau...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-96"
            />

            <select
              className={cn(
                'rounded-md border px-2 py-2 text-xs',
                darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
              )}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="ALL">Tous types</option>
              <option value="Marché">Marchés</option>
              <option value="Avenant">Avenants</option>
              <option value="Sous-traitance">Sous-traitance</option>
            </select>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Risque ≥</span>
              <input
                type="number"
                min={0}
                max={100}
                value={riskMin}
                onChange={(e) => setRiskMin(clamp(Number(e.target.value || 0), 0, 100))}
                className={cn(
                  'w-20 rounded-md border px-2 py-2 text-xs',
                  darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
                )}
              />
            </div>

            <select
              className={cn(
                'rounded-md border px-2 py-2 text-xs',
                darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
              )}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="risk">Tri: risque</option>
              <option value="expiry">Tri: échéance</option>
              <option value="amount">Tri: montant</option>
            </select>

            <Button size="sm" variant="secondary" onClick={() => setSortDir(d => (d === 'desc' ? 'asc' : 'desc'))}>
              {sortDir === 'desc' ? '⬇️' : '⬆️'}
            </Button>

            <div className="ml-auto flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => void exportAudited('FILTERED')}>
                📦 Export filtré
              </Button>
              <Button size="sm" variant="secondary" disabled={!selectedItems.length} onClick={bulkExportSelected}>
                🎯 Export sélection ({selectedItems.length})
              </Button>
              <Button size="sm" variant="secondary" disabled={!selectedItems.length} onClick={bulkReviewed}>
                ✅ Reviewed (bulk)
              </Button>
              <Button size="sm" variant="secondary" disabled={!selectedItems.length} onClick={clearSelected}>
                🧹 Vider sélection
              </Button>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            Résultats: <span className="text-slate-200 font-semibold">{filtered.length}</span> • Inbox:{' '}
            <span className="text-slate-200 font-semibold">{inbox.length}</span> • Sélection:{' '}
            <span className="text-slate-200 font-semibold">{selectedItems.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-700/30">
        {([
          { k: 'inbox', label: `Inbox` },
          { k: 'all', label: `Tous` },
          { k: 'type', label: `Par type` },
          { k: 'audit', label: `Audit` },
        ] as const).map(t => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              tab === t.k ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-300'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Par type */}
      {tab === 'type' && (
        <div className="space-y-4">
          {[
            { key: 'marche', title: '📋 Marchés', data: byType.marche },
            { key: 'avenant', title: '📝 Avenants', data: byType.avenant },
            { key: 'soustraitance', title: '🤝 Sous-traitance', data: byType.soustraitance },
          ].map(g => g.data.length ? (
            <Card key={g.key}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  {g.title} <Badge variant="info">{g.data.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {g.data.map(c => (
                  <ContractRow
                    key={c.id}
                    item={c}
                    darkMode={darkMode}
                    reviewed={!!reviewed[c.id]}
                    selected={!!selected[c.id]}
                    onSelect={() => toggleSelected(c.id)}
                    onOpen={() => openContractModal(c.id)}
                    onReviewed={() => toggleReviewed(c.id)}
                    onIgnore={() => ignoreContract(c.id)}
                  />
                ))}
              </CardContent>
            </Card>
          ) : null)}
        </div>
      )}

      {/* Audit */}
      {tab === 'audit' && (
        <Card className="border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-sm">🧾 Audit & intégrité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            <p className="text-slate-400">
              Ici on fait du "prouvable" : un export CSV + un manifest JSON qui contient un hash de ligne et un hash chaîné
              (détection d'altération). La signature BMO référence explicitement le hash BJ.
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
              Prochaine marche "enterprise": signature serveur (clé privée) + horodatage qualifié + stockage append-only.
            </div>
          </CardContent>
        </Card>
      )}

      {/* List / Inbox / All */}
      {(tab === 'inbox' || tab === 'all') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              {tab === 'inbox' ? '📥 Inbox priorisée' : '📚 Tous les contrats'}
              <Badge variant="info">{listToRender.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {listToRender.map(c => (
              <div key={c.id} className={cn(
                'rounded-xl border p-3',
                darkMode ? 'border-slate-700/50' : 'border-gray-200',
                c.priority === 'NOW' ? 'border-red-500/40 bg-red-500/5' :
                c.priority === 'WATCH' ? 'border-amber-500/40 bg-amber-500/5' : ''
              )}>
                <div className="flex flex-wrap justify-between gap-2 items-start">
                  <div className="min-w-[280px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <input type="checkbox" checked={!!selected[c.id]} onChange={() => toggleSelected(c.id)} />
                      <span className="font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold text-xs">
                        {c.id}
                      </span>
                      <Badge variant="gold">{(c as any).type}</Badge>
                      <BureauTag bureau={(c as any).bureau} />
                      <PriorityBadge p={c.priority} />
                      <WorkflowBadge w={c.workflow} />
                      <RiskBadge s={c.riskScore} />
                      {reviewed[c.id] ? <Badge variant="default" className="text-[10px]">✅ reviewed</Badge> : null}
                      {c.daysToExpiry !== null && c.workflow !== 'SIGNED' && (
                        c.daysToExpiry < 0 ? <Badge variant="urgent">EXPIRÉ</Badge> :
                        c.daysToExpiry <= 7 ? <Badge variant="warning">J-{c.daysToExpiry}</Badge> :
                        <Badge variant="info">J-{c.daysToExpiry}</Badge>
                      )}
                    </div>

                    <div className="mt-1">
                      <p className="font-bold text-sm">{c.subject}</p>
                      <p className="text-xs text-slate-400">{(c as any).partner}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-lg text-amber-400">
                      {formatFCFA((c as any).amount)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Exp: {(c as any).expiry || '—'}
                    </div>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-300">
                  {c.riskSignals.slice(0, 3).join(' • ')}
                  {c.riskSignals.length > 3 ? <span className="text-slate-500"> • +{c.riskSignals.length - 3}</span> : null}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500" onClick={() => openContractModal(c.id)}>
                    🧠 Ouvrir / décider
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => toggleReviewed(c.id)}>
                    {reviewed[c.id] ? '↩︎ Unreview' : '✅ Reviewed'}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => ignoreContract(c.id)}>
                    ✕ Ignorer
                  </Button>
                </div>
              </div>
            ))}

            {!listToRender.length ? (
              <div className="py-8 text-center text-sm text-slate-500">Aucun résultat.</div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Modal décision */}
      {showModal && selectedContract && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[85vh] overflow-y-auto overscroll-contain">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                🧾 Dossier contrat — {selectedContract.id}
                <Badge variant="info">{selectedContract.workflow}</Badge>
                <RiskBadge s={selectedContract.riskScore} />
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className={cn('p-3 rounded-lg', darkMode ? 'bg-slate-700/50' : 'bg-gray-50')}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-sm">{selectedContract.subject}</p>
                    <p className="text-xs text-slate-400">{(selectedContract as any).partner}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="gold">{(selectedContract as any).type}</Badge>
                      <BureauTag bureau={(selectedContract as any).bureau} />
                      <PriorityBadge p={selectedContract.priority} />
                      <WorkflowBadge w={selectedContract.workflow} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-amber-400 font-bold text-lg">
                      {formatFCFA((selectedContract as any).amount)}
                    </p>
                    <p className="text-xs text-slate-400">Expiration: {(selectedContract as any).expiry || '—'}</p>
                    <p className="text-xs text-slate-400">Préparé par: {(selectedContract as any).preparedBy || '—'}</p>
                  </div>
                </div>

                <div className="mt-2 text-xs text-slate-300">
                  <span className="text-slate-400">Signaux risque :</span>{' '}
                  {selectedContract.riskSignals.join(' • ') || '—'}
                </div>
              </div>

              {/* Step BJ */}
              <div className={cn(
                'p-3 rounded-lg border-l-4',
                selectedContract.bjApproval ? 'border-l-emerald-500 bg-emerald-500/10' : 'border-l-amber-500 bg-amber-500/10'
              )}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm">1) Validation Bureau Juridique (R)</p>
                    <p className="text-[11px] text-slate-400">
                      Référent: {bjJurist?.name || 'N. FAYE'} — {bjJurist?.role || 'Juriste Senior'}
                    </p>
                    {selectedContract.bjApproval ? (
                      <p className="text-[11px] text-slate-300 mt-1">
                        ✅ Validé par {selectedContract.bjApproval.approvedByName} • {selectedContract.bjApproval.approvedAtISO}<br />
                        <span className="font-mono text-slate-200">{selectedContract.bjApproval.approvalHash}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-1">⏳ En attente de validation BJ</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="warning"
                      disabled={!!selectedContract.bjApproval}
                      onClick={() => void approveBJ(selectedContract)}
                      title="Approuver côté BJ (RACI: BJ=R)"
                    >
                      ✅ Valider BJ
                    </Button>
                    <Button size="sm" variant="info" onClick={() => sendToBJ(selectedContract)}>
                      📤 Renvoyer BJ
                    </Button>
                  </div>
                </div>
              </div>

              {/* Step BMO */}
              <div className={cn(
                'p-3 rounded-lg border-l-4',
                selectedContract.bmoSignature ? 'border-l-emerald-500 bg-emerald-500/10' :
                selectedContract.bjApproval ? 'border-l-amber-500 bg-amber-500/10' :
                'border-l-slate-500 bg-slate-500/10 opacity-80'
              )}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm">2) Signature BMO / DG (A)</p>
                    <p className="text-[11px] text-slate-400">
                      Signataire: {currentUser.name} — {currentUser.role} ({currentUser.bureau})
                    </p>

                    {selectedContract.bmoSignature ? (
                      <p className="text-[11px] text-slate-300 mt-1">
                        ✍️ Signé par {selectedContract.bmoSignature.signedByName} • {selectedContract.bmoSignature.signedAtISO}<br />
                        <span className="font-mono text-slate-200">{selectedContract.bmoSignature.signatureHash}</span><br />
                        <span className="text-slate-400">BJ ref:</span> <span className="font-mono">{selectedContract.bmoSignature.bjApprovalHashRef}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-1">
                        {selectedContract.bjApproval ? '⏳ En attente signature BMO' : '🔒 Verrouillé: BJ requis'}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-pink-500"
                      disabled={!selectedContract.bjApproval || !!selectedContract.bmoSignature}
                      onClick={() => void signBMO(selectedContract)}
                      title="Signer côté BMO (RACI: BMO=A) - nécessite BJ"
                    >
                      ✍️ Signer
                    </Button>
                    <Button size="sm" variant="warning" onClick={() => requestArbitrage(selectedContract)}>
                      ⚖️ Arbitrage
                    </Button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-700/50">
                <Button variant="secondary" onClick={() => toggleReviewed(selectedContract.id)}>
                  {reviewed[selectedContract.id] ? '↩︎ Unreview' : '✅ Reviewed'}
                </Button>
                <Button variant="destructive" onClick={() => ignoreContract(selectedContract.id)}>
                  ✕ Ignorer
                </Button>
                <div className="ml-auto flex gap-2">
                  <Button variant="secondary" onClick={closeModal}>Fermer</Button>
                </div>
              </div>

              <div className="text-xs text-slate-500">
                Note: ici, l'état est stocké localement (simulation). En prod: ces événements doivent être persistés server-side (append-only),
                et idéalement signés côté serveur.
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

/**
 * Ligne compacte (utilisée dans "par type")
 */
function ContractRow(props: {
  item: ContractItem;
  darkMode: boolean;
  reviewed: boolean;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
  onReviewed: () => void;
  onIgnore: () => void;
}) {
  const { item, darkMode, reviewed, selected, onSelect, onOpen, onReviewed, onIgnore } = props;

  return (
    <div className={cn(
      'rounded-xl border p-3 flex flex-wrap items-center justify-between gap-2',
      darkMode ? 'border-slate-700/50' : 'border-gray-200'
    )}>
      <div className="flex items-center gap-2 flex-wrap">
        <input type="checkbox" checked={selected} onChange={onSelect} />
        <span className="font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold text-xs">{item.id}</span>
        <Badge variant="gold">{(item as any).type}</Badge>
        <BureauTag bureau={(item as any).bureau} />
        <Badge variant={item.priority === 'NOW' ? 'urgent' : item.priority === 'WATCH' ? 'warning' : 'success'} className="text-[10px]">
          {item.priority}
        </Badge>
        <Badge variant={item.workflow === 'SIGNED' ? 'success' : item.workflow === 'PENDING_BJ' ? 'urgent' : 'warning'} className="text-[10px]">
          {item.workflow}
        </Badge>
        <Badge variant={item.riskScore >= 70 ? 'urgent' : item.riskScore >= 40 ? 'warning' : 'success'} className="text-[10px]">
          Risque {item.riskScore}
        </Badge>
        {reviewed ? <Badge variant="default" className="text-[10px]">✅ reviewed</Badge> : null}
        {item.daysToExpiry !== null && item.workflow !== 'SIGNED' ? (
          item.daysToExpiry < 0 ? <Badge variant="urgent">EXPIRÉ</Badge> :
          item.daysToExpiry <= 7 ? <Badge variant="warning">J-{item.daysToExpiry}</Badge> :
          <Badge variant="info">J-{item.daysToExpiry}</Badge>
        ) : null}
      </div>

      <div className="flex-1 min-w-[220px]">
        <p className="font-bold text-sm">{item.subject}</p>
        <p className="text-xs text-slate-400">{(item as any).partner}</p>
      </div>

      <div className="text-right">
        <p className="font-mono font-bold text-amber-400">{formatFCFA((item as any).amount)}</p>
        <p className="text-[11px] text-slate-400">Exp: {(item as any).expiry || '—'}</p>
      </div>

      <div className="flex gap-2">
        <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500" onClick={onOpen}>Ouvrir</Button>
        <Button size="sm" variant="secondary" onClick={onReviewed}>{reviewed ? 'Unreview' : 'Reviewed'}</Button>
        <Button size="sm" variant="destructive" onClick={onIgnore}>Ignorer</Button>
      </div>
    </div>
  );
}
