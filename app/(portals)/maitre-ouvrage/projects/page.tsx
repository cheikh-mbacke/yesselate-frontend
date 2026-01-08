'use client';

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { projects } from '@/lib/data';
import { usePageNavigation } from '@/hooks/usePageNavigation';
import { useAutoSyncCounts } from '@/hooks/useAutoSync';

/** =========================
 *  Types "hétérogènes"
 *  ========================= */
type ProjectContext = 'formal' | 'informal' | 'hybrid' | 'unknown';
type ProjectKind = 'travaux' | 'fournitures' | 'services' | 'mixte';
type ProjectPhase =
  | 'idee'
  | 'diagnostic'
  | 'conception'
  | 'consultation'
  | 'execution'
  | 'reception'
  | 'exploitation'
  | 'clos';
type ProjectStatus = 'planned' | 'active' | 'blocked' | 'late' | 'completed' | 'cancelled';

type Raci = {
  accountable: string; // A
  responsible: string; // R
  consulted: string[]; // C
  informed: string[]; // I
};

type Stakeholder = {
  id: string;
  name: string;
  role: string;
  org?: string;
  phone?: string;
  email?: string;
  influence?: 'low' | 'medium' | 'high';
  legitimacy?: 'low' | 'medium' | 'high';
};

type WorkPackage = {
  id: string;
  label: string;
  stream:
    | 'gouvernance'
    | 'juridique'
    | 'finance'
    | 'hse'
    | 'social'
    | 'environnement'
    | 'it'
    | 'conception'
    | 'travaux'
    | 'fournitures'
    | 'services';
  phase?: ProjectPhase;
  status?: 'todo' | 'in_progress' | 'blocked' | 'done';
  ownerBureau?: string;
  budget?: number;
  progress?: number; // 0-100
  dependsOn?: string[];
};

type Indicator = {
  id: string;
  label: string;
  type: 'output' | 'outcome' | 'impact' | 'process' | 'risk';
  baseline?: number;
  target?: number;
  current?: number;
  unit?: string;
  frequency?: 'weekly' | 'monthly' | 'quarterly' | 'ad_hoc';
  dataSource?: string;
  lastUpdate?: string; // ISO
};

type NormalizedProject = {
  id: string;
  name: string;
  kind: ProjectKind;
  sector: string; // libre (multi-secteurs)
  context: ProjectContext;
  phase: ProjectPhase;
  status: ProjectStatus;

  /** Gouvernance */
  leadBureau?: string;
  projectManager?: string;
  decisionBMO?: string | null;
  cirilRef?: string | null;

  /** Planning & finances */
  startDate?: string | null;
  endDate?: string | null;
  budgetPlanned?: number | null;
  budgetCommitted?: number | null;
  budgetSpent?: number | null;

  /** Complexité / risques */
  enjeux: string[];
  leviers: string[];
  stakeholders: Stakeholder[];
  workPackages: WorkPackage[];
  indicators: Indicator[];

  /** Audit */
  updatedAt?: string | null;
  hash?: string | null; // hash "stocké" (si tu l'as en data)
};

/** =========================
 *  Helpers robustes
 *  ========================= */
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

const parseMoney = (v: unknown): number => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v !== 'string') return 0;
  // Supporte "150 000", "150,000", "150.000", "150000", "150 000 FCFA"
  const cleaned = v
    .toLowerCase()
    .replace(/[^\d,.\-]/g, '')
    .replace(/\s/g, '');

  // Heuristique: si virgule et point -> on garde les digits et on considère le dernier séparateur comme décimal
  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');

  let normalized = cleaned;
  if (hasComma && hasDot) {
    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');
    const decIdx = Math.max(lastComma, lastDot);
    const intPart = cleaned.slice(0, decIdx).replace(/[.,]/g, '');
    const decPart = cleaned.slice(decIdx + 1).replace(/[.,]/g, '');
    normalized = `${intPart}.${decPart}`;
  } else if (hasComma && !hasDot) {
    // Si plusieurs virgules -> séparateurs de milliers
    const parts = cleaned.split(',');
    if (parts.length > 2) normalized = parts.join('');
    else normalized = cleaned.replace(',', '.');
  } else if (hasDot && !hasComma) {
    const parts = cleaned.split('.');
    if (parts.length > 2) normalized = parts.join('');
    else normalized = cleaned;
  }

  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
};

const formatMoney = (n: number, currency = 'FCFA') => {
  try {
    // FCFA n'a pas toujours un code ISO "classique" selon environnements,
    // donc on garde un format simple stable.
    return `${Math.round(n).toLocaleString('fr-FR')} ${currency}`;
  } catch {
    return `${Math.round(n)} ${currency}`;
  }
};

const daysBetween = (a?: string | null, b?: string | null) => {
  if (!a || !b) return null;
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  if (!Number.isFinite(da) || !Number.isFinite(db)) return null;
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
};

const isOverdue = (p: NormalizedProject) => {
  if (p.status === 'completed' || p.status === 'cancelled') return false;
  if (!p.endDate) return false;
  return new Date(p.endDate).getTime() < Date.now();
};

const phaseLabel: Record<ProjectPhase, string> = {
  idee: 'Idée',
  diagnostic: 'Diagnostic',
  conception: 'Conception',
  consultation: 'Consultation',
  execution: 'Exécution',
  reception: 'Réception',
  exploitation: 'Exploitation',
  clos: 'Clos',
};

const statusVariant = (s: ProjectStatus) => {
  if (s === 'completed') return 'success';
  if (s === 'blocked') return 'urgent';
  if (s === 'late') return 'warning';
  if (s === 'active') return 'info';
  if (s === 'cancelled') return 'default';
  return 'default';
};

// WHY: Normalisation pour recherche
const normalize = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

/** =========================
 *  Hash SHA-256 (WebCrypto)
 *  ========================= */
async function sha256Hex(input: string): Promise<string> {
  // navigateur only (client component)
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** =========================
 *  Export CSV
 *  ========================= */
function downloadCSV(filename: string, rows: Record<string, unknown>[]) {
  const headers = Array.from(
    rows.reduce((acc, r) => {
      Object.keys(r).forEach((k) => acc.add(k));
      return acc;
    }, new Set<string>())
  );

  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    const needsQuotes = /[",\n;]/.test(s);
    const safe = s.replace(/"/g, '""');
    return needsQuotes ? `"${safe}"` : safe;
  };

  const csv = [
    headers.join(';'),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(';')),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** =========================
 *  Normalisation "anti-chaos"
 *  ========================= */
function normalizeProject(raw: any): NormalizedProject {
  // On accepte des structures imparfaites.
  const id = String(raw?.id ?? raw?.projectId ?? 'PRJ-UNKNOWN');
  const name = String(raw?.name ?? raw?.title ?? 'Projet sans nom');

  const kind: ProjectKind =
    raw?.kind ??
    raw?.type ??
    (raw?.isTravaux ? 'travaux' : raw?.isFournitures ? 'fournitures' : raw?.isServices ? 'services' : 'mixte');

  const phase: ProjectPhase = raw?.phase ?? raw?.stage ?? 'diagnostic';
  const status: ProjectStatus = raw?.status ?? (raw?.completed ? 'completed' : 'active');

  const stakeholders: Stakeholder[] = Array.isArray(raw?.stakeholders) ? raw.stakeholders : [];
  const workPackages: WorkPackage[] = Array.isArray(raw?.workPackages) ? raw.workPackages : [];
  const indicators: Indicator[] = Array.isArray(raw?.indicators) ? raw.indicators : [];

  const enjeux = Array.isArray(raw?.enjeux) ? raw.enjeux : [];
  const leviers = Array.isArray(raw?.leviers) ? raw.leviers : [];

  return {
    id,
    name,
    kind,
    sector: String(raw?.sector ?? raw?.domain ?? 'Multi-secteurs'),
    context: (raw?.context as ProjectContext) ?? 'unknown',
    phase,
    status,

    leadBureau: raw?.leadBureau ?? raw?.bureau ?? undefined,
    projectManager: raw?.projectManager ?? raw?.pm ?? undefined,
    decisionBMO: raw?.decisionBMO ?? raw?.decisionId ?? null,
    cirilRef: raw?.cirilRef ?? raw?.ciril ?? null,

    startDate: raw?.startDate ?? null,
    endDate: raw?.endDate ?? null,

    budgetPlanned: raw?.budgetPlanned != null ? parseMoney(raw.budgetPlanned) : null,
    budgetCommitted: raw?.budgetCommitted != null ? parseMoney(raw.budgetCommitted) : null,
    budgetSpent: raw?.budgetSpent != null ? parseMoney(raw.budgetSpent) : null,

    enjeux,
    leviers,
    stakeholders,
    workPackages,
    indicators,

    updatedAt: raw?.updatedAt ?? raw?.lastUpdate ?? null,
    hash: raw?.hash ?? null,
  };
}

/** =========================
 *  Moteur "Innovation"
 *  - score complexité
 *  - score risque
 *  - recommandations
 *  ========================= */
function computeComplexityScore(p: NormalizedProject) {
  // Score 0..100 : hétérogénéité + acteurs + lots/paquets + enjeux/leviers + contexte informel
  const actors = p.stakeholders.length;
  const wp = p.workPackages.length;
  const enjeux = p.enjeux.length;
  const leviers = p.leviers.length;

  const budget = p.budgetPlanned ?? 0;
  const budgetScore = clamp(Math.log10(Math.max(1, budget)) * 10, 0, 35); // 0..35

  const contextBoost =
    p.context === 'informal' ? 18 : p.context === 'hybrid' ? 10 : p.context === 'formal' ? 2 : 6;

  const score =
    clamp(actors * 4, 0, 30) +
    clamp(wp * 2, 0, 25) +
    clamp((enjeux + leviers) * 3, 0, 20) +
    budgetScore +
    contextBoost;

  return clamp(Math.round(score), 0, 100);
}

function computeRiskScore(p: NormalizedProject) {
  // Score 0..100 : retard + blocage + dérive budget + doc/indicateurs manquants + informel
  let score = 0;

  if (p.status === 'blocked') score += 30;
  if (p.status === 'late') score += 20;
  if (isOverdue(p)) score += 15;

  const planned = p.budgetPlanned ?? 0;
  const spent = p.budgetSpent ?? 0;
  const committed = p.budgetCommitted ?? 0;

  if (planned > 0) {
    const burn = Math.max(spent, committed) / planned;
    if (burn > 1.05) score += 20;
    else if (burn > 0.9) score += 12;
    else if (burn > 0.75) score += 6;
  } else if ((spent || committed) > 0) {
    score += 10; // dépense sans budget planifié => risque
  }

  // Indicateurs: si rien -> angle mort M&E
  if (p.indicators.length === 0) score += 10;

  // Work packages: si aucun owner bureau sur la moitié -> risque RACI flou
  if (p.workPackages.length > 0) {
    const missingOwner = p.workPackages.filter((w) => !w.ownerBureau).length;
    const ratio = missingOwner / p.workPackages.length;
    if (ratio > 0.5) score += 10;
    else if (ratio > 0.25) score += 6;
  }

  // Contexte informel/hybride
  if (p.context === 'informal') score += 12;
  if (p.context === 'hybrid') score += 6;

  // Décision BMO absente sur phases sensibles (consultation/exécution)
  if (!p.decisionBMO && (p.phase === 'consultation' || p.phase === 'execution' || p.phase === 'reception')) {
    score += 8;
  }

  return clamp(Math.round(score), 0, 100);
}

function computeRACI(p: NormalizedProject): Raci {
  // Heuristique simple & robuste :
  // A = BMO / DG (par défaut)
  // R = chef de bureau pilote ou PM
  // C = bureaux transverses probables selon kind/phase
  // I = parties prenantes majeures
  const accountable = 'BMO / Direction Générale';
  const responsible = p.projectManager ?? (p.leadBureau ? `Bureau ${p.leadBureau}` : 'Chef de projet (à désigner)');

  const consulted = new Set<string>();
  const informed = new Set<string>();

  // C : transversalité selon type
  if (p.kind === 'travaux' || p.kind === 'mixte') {
    consulted.add('Technique/Travaux');
    consulted.add('Juridique');
    consulted.add('Finance');
    consulted.add('HSE');
  }
  if (p.kind === 'fournitures' || p.kind === 'mixte') {
    consulted.add('Achats');
    consulted.add('Logistique');
    consulted.add('Finance');
  }
  if (p.kind === 'services' || p.kind === 'mixte') {
    consulted.add('Métier prescripteur');
    consulted.add('Juridique');
    consulted.add('Finance');
  }

  // C : selon phase
  if (p.phase === 'consultation') consulted.add('Marchés/Commande publique');
  if (p.phase === 'reception') consulted.add('Contrôle/Qualité');

  // I : stakeholders influence high
  p.stakeholders
    .filter((s) => s.influence === 'high')
    .slice(0, 6)
    .forEach((s) => informed.add(s.org ? `${s.name} (${s.org})` : s.name));

  return {
    accountable,
    responsible,
    consulted: Array.from(consulted),
    informed: Array.from(informed),
  };
}

function buildNextBestActions(p: NormalizedProject) {
  // Reco "intelligentes" (règles transparentes => fiable, pas magique)
  const actions: { label: string; severity: 'info' | 'warning' | 'urgent'; why: string }[] = [];

  if (!p.decisionBMO && (p.phase === 'consultation' || p.phase === 'execution')) {
    actions.push({
      label: 'Créer / lier une décision BMO',
      severity: 'warning',
      why: 'Phase sensible sans décision: risque d\'audit et de gouvernance.',
    });
  }

  if (p.indicators.length === 0) {
    actions.push({
      label: 'Définir 3 indicateurs minimum (output/outcome/risk)',
      severity: 'warning',
      why: 'Sans indicateurs: impossible de mesurer et piloter (angle mort M&E).',
    });
  }

  if (p.context === 'informal' || p.context === 'hybrid') {
    actions.push({
      label: 'Activer le plan "sécurisation informel" (preuves + acteurs + paiement)',
      severity: 'urgent',
      why: 'Contexte informel/hybride: risques élevés (preuve, responsabilité, paiement, conformité).',
    });
  }

  if (isOverdue(p) || p.status === 'late') {
    actions.push({
      label: 'Lancer un plan de rattrapage (jalons + ressources + arbitrage)',
      severity: 'urgent',
      why: 'Projet en retard: risque coûts, qualité, contentieux.',
    });
  }

  const planned = p.budgetPlanned ?? 0;
  const spent = p.budgetSpent ?? 0;
  const committed = p.budgetCommitted ?? 0;
  if (planned > 0 && Math.max(spent, committed) / planned > 0.9) {
    actions.push({
      label: 'Contrôle coûts (reste à engager + reste à payer + alerte dépassement)',
      severity: 'warning',
      why: 'Consommation budget élevée: risque de dérive.',
    });
  }

  if (p.workPackages.length > 0) {
    const missingOwner = p.workPackages.filter((w) => !w.ownerBureau).length;
    if (missingOwner / p.workPackages.length > 0.25) {
      actions.push({
        label: 'Clarifier les owners (R) sur les lots / work packages',
        severity: 'warning',
        why: 'Responsabilités floues: risque blocage et "personne ne sait qui fait quoi".',
      });
    }
  }

  if (actions.length === 0) {
    actions.push({
      label: 'Générer un rapport mensuel (snapshot) et archiver',
      severity: 'info',
      why: 'Projet stable: on sécurise par le reporting et l\'audit.',
    });
  }

  return actions.slice(0, 5);
}

async function computeProjectAuditHash(p: NormalizedProject) {
  // Hash "audit" basé sur des champs stables (pas sur le rendu UI)
  const payload = {
    id: p.id,
    name: p.name,
    kind: p.kind,
    sector: p.sector,
    context: p.context,
    phase: p.phase,
    status: p.status,
    leadBureau: p.leadBureau ?? '',
    projectManager: p.projectManager ?? '',
    decisionBMO: p.decisionBMO ?? '',
    cirilRef: p.cirilRef ?? '',
    startDate: p.startDate ?? '',
    endDate: p.endDate ?? '',
    budgetPlanned: p.budgetPlanned ?? 0,
    budgetCommitted: p.budgetCommitted ?? 0,
    budgetSpent: p.budgetSpent ?? 0,
    enjeux: p.enjeux,
    leviers: p.leviers,
    stakeholders: p.stakeholders.map((s) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      org: s.org ?? '',
      influence: s.influence ?? '',
      legitimacy: s.legitimacy ?? '',
    })),
    workPackages: p.workPackages.map((w) => ({
      id: w.id,
      label: w.label,
      stream: w.stream,
      phase: w.phase ?? '',
      status: w.status ?? '',
      ownerBureau: w.ownerBureau ?? '',
      budget: w.budget ?? 0,
      progress: w.progress ?? 0,
      dependsOn: w.dependsOn ?? [],
    })),
    indicators: p.indicators.map((i) => ({
      id: i.id,
      label: i.label,
      type: i.type,
      baseline: i.baseline ?? null,
      target: i.target ?? null,
      current: i.current ?? null,
      unit: i.unit ?? '',
      frequency: i.frequency ?? '',
      dataSource: i.dataSource ?? '',
      lastUpdate: i.lastUpdate ?? '',
    })),
    updatedAt: p.updatedAt ?? '',
  };

  return sha256Hex(JSON.stringify(payload));
}

/** =========================
 *  Page
 *  ========================= */
export default function SuiviEvaluationProjetsPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();

  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'all'>('all');
  const [filterPhase, setFilterPhase] = useState<ProjectPhase | 'all'>('all');
  const [filterKind, setFilterKind] = useState<ProjectKind | 'all'>('all');
  const [filterContext, setFilterContext] = useState<ProjectContext | 'all'>('all');

  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hashCache, setHashCache] = useState<Record<string, string>>({});

  // Persistance navigation
  const { updateFilters, getFilters } = usePageNavigation('projects');

  // Charger les filtres sauvegardés
  useEffect(() => {
    try {
      const saved = getFilters?.();
      if (!saved) return;
      if (saved.selectedId) setSelectedId(saved.selectedId);
      if (saved.filterStatus) setFilterStatus(saved.filterStatus);
      if (saved.filterPhase) setFilterPhase(saved.filterPhase);
      if (saved.filterKind) setFilterKind(saved.filterKind);
      if (saved.filterContext) setFilterContext(saved.filterContext);
      if (typeof saved.search === 'string') setSearch(saved.search);
    } catch {
      // silent
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sauvegarder les filtres
  useEffect(() => {
    try {
      updateFilters?.({
        selectedId,
        filterStatus,
        filterPhase,
        filterKind,
        filterContext,
        search,
      });
    } catch {
      // silent
    }
  }, [selectedId, filterStatus, filterPhase, filterKind, filterContext, search, updateFilters]);

  const normalized = useMemo(() => (projects as any[]).map(normalizeProject), []);
  const selected = useMemo(
    () => (selectedId ? normalized.find((p) => p.id === selectedId) ?? null : null),
    [normalized, selectedId]
  );

  const filtered = useMemo(() => {
    const q = normalize(deferredSearch);
    return normalized.filter((p) => {
      if (filterStatus !== 'all' && p.status !== filterStatus) return false;
      if (filterPhase !== 'all' && p.phase !== filterPhase) return false;
      if (filterKind !== 'all' && p.kind !== filterKind) return false;
      if (filterContext !== 'all' && p.context !== filterContext) return false;

      if (!deferredSearch.trim()) return true;
      const hay = `${p.id} ${p.name} ${p.sector} ${p.kind} ${p.phase} ${p.status} ${p.cirilRef ?? ''} ${p.decisionBMO ?? ''}`.toLowerCase();
      return normalize(hay).includes(q);
    });
  }, [normalized, deferredSearch, filterStatus, filterPhase, filterKind, filterContext]);

  const enriched = useMemo(() => {
    // Pré-calc: scores & RACI (performance)
    return filtered.map((p) => {
      const complexity = computeComplexityScore(p);
      const risk = computeRiskScore(p);
      const raci = computeRACI(p);
      const nbas = buildNextBestActions(p);
      return { p, complexity, risk, raci, nbas };
    });
  }, [filtered]);

  const stats = useMemo(() => {
    const total = normalized.length;
    const active = normalized.filter((p) => p.status === 'active').length;
    const blocked = normalized.filter((p) => p.status === 'blocked').length;
    const late = normalized.filter((p) => p.status === 'late' || isOverdue(p)).length;

    const highRisk = normalized.filter((p) => computeRiskScore(p) >= 60).length;
    const informal = normalized.filter((p) => p.context === 'informal' || p.context === 'hybrid').length;

    return { total, active, blocked, late, highRisk, informal };
  }, [normalized]);

  // Auto-sync sidebar
  useAutoSyncCounts('projects', () => stats.blocked + stats.highRisk, { interval: 30000, immediate: true });

  const topAlerts = useMemo(() => {
    const list = normalized
      .map((p) => ({ p, risk: computeRiskScore(p), complexity: computeComplexityScore(p) }))
      .sort((a, b) => b.risk - a.risk)
      .slice(0, 5);

    return list.map((x) => {
      const actions = buildNextBestActions(x.p);
      const primary = actions[0];
      return {
        id: x.p.id,
        name: x.p.name,
        risk: x.risk,
        complexity: x.complexity,
        primary,
      };
    });
  }, [normalized]);

  const ensureHash = useCallback(
    async (p: NormalizedProject) => {
      const existing = hashCache[p.id] || p.hash;
      if (existing) return existing;

      const h = await computeProjectAuditHash(p);
      setHashCache((prev) => ({ ...prev, [p.id]: h }));
      return h;
    },
    [hashCache]
  );

  const handleVerifyHash = useCallback(
    async (p: NormalizedProject) => {
      const computed = await computeProjectAuditHash(p);
      const stored = p.hash || hashCache[p.id] || null;

      addActionLog({
        userId: 'USR-001',
        userName: 'A. DIALLO',
        userRole: 'Directeur Général',
        module: 'suivi-evaluation',
        action: 'validation',
        targetId: p.id,
        targetType: 'Project',
        details: stored
          ? `Vérification hash: ${stored === computed ? 'OK' : 'ÉCHEC'}`
          : 'Vérification hash: calcul initial (aucun hash stocké)',
      });

      if (!stored) {
        setHashCache((prev) => ({ ...prev, [p.id]: computed }));
        addToast('Hash calculé (aucun hash stocké) — audit initial prêt', 'success');
        return;
      }

      addToast(stored === computed ? 'Hash OK — aucune altération détectée' : 'Hash ÉCHEC — données modifiées', stored === computed ? 'success' : 'error');
    },
    [addActionLog, addToast, hashCache]
  );

  const handleExportPortfolio = useCallback(async () => {
    const rows = await Promise.all(
      enriched.map(async ({ p, complexity, risk, raci, nbas }) => {
        const hash = await ensureHash(p);
        return {
          projectId: p.id,
          name: p.name,
          kind: p.kind,
          sector: p.sector,
          context: p.context,
          phase: p.phase,
          phaseLabel: phaseLabel[p.phase] ?? p.phase,
          status: p.status,
          leadBureau: p.leadBureau ?? '',
          projectManager: p.projectManager ?? '',
          decisionBMO: p.decisionBMO ?? 'Hors BMO',
          cirilRef: p.cirilRef ?? '',
          startDate: p.startDate ?? '',
          endDate: p.endDate ?? '',
          budgetPlanned: p.budgetPlanned ?? 0,
          budgetCommitted: p.budgetCommitted ?? 0,
          budgetSpent: p.budgetSpent ?? 0,
          complexityScore: complexity,
          riskScore: risk,
          raci_A: raci.accountable,
          raci_R: raci.responsible,
          raci_C: raci.consulted.join(' | '),
          raci_I: raci.informed.join(' | '),
          nextBestAction: nbas[0]?.label ?? '',
          nextBestWhy: nbas[0]?.why ?? '',
          hash,
          updatedAt: p.updatedAt ?? '',
        };
      })
    );

    downloadCSV(`portefeuille_projets_${new Date().toISOString().slice(0, 10)}.csv`, rows);

    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'suivi-evaluation',
      action: 'export',
      targetType: 'ProjectPortfolio',
      targetLabel: 'Export portefeuille projets',
      details: `Export CSV enrichi (${rows.length} projets)`,
    });

    addToast('Export portefeuille (CSV) généré', 'success');
  }, [addActionLog, addToast, enriched, ensureHash]);

  const handleCreateSnapshot = useCallback((p: NormalizedProject) => {
    // Ici: on simule un snapshot. En prod: POST /reports/snapshots
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'suivi-evaluation',
      action: 'creation',
      targetId: p.id,
      targetType: 'Project',
      details: 'Snapshot mensuel créé (suivi & évaluation)',
    });
    addToast('Snapshot créé (preuve de suivi archivée)', 'success');
  }, [addActionLog, addToast]);

  const handleProposeDecisionBMO = useCallback((p: NormalizedProject) => {
    // Simule une proposition de décision BMO à lier
    const decision = `BMO-DEC-${new Date().getFullYear()}-${String(p.id).slice(-4)}`;
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      module: 'suivi-evaluation',
      action: 'modification',
      targetId: p.id,
      targetType: 'Project',
      details: `Proposition décision BMO: ${decision}`,
    });
    addToast(`Décision BMO proposée: ${decision}`, 'info');
  }, [addActionLog, addToast]);

  // Option: pré-calc hash du projet sélectionné (UX)
  useEffect(() => {
    if (!selected) return;
    if (selected.hash || hashCache[selected.id]) return;
    void ensureHash(selected);
  }, [selected, hashCache, ensureHash]);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-bold flex flex-wrap items-center gap-2">
            🧭 Suivi & Évaluation des Projets
            <Badge variant="info" className="text-[10px]">{stats.total}</Badge>
            {stats.highRisk > 0 && <Badge variant="urgent" className="text-[10px]">{stats.highRisk} à risque</Badge>}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Portefeuille hétérogène (travaux / services / fournitures) — gouvernance BMO, RACI, audit, recommandations.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="secondary" size="sm" onClick={handleExportPortfolio} className="flex-1 sm:flex-none">
            📤 Export portefeuille
          </Button>
          <Button size="sm" onClick={() => addToast('Nouveau projet (assistant) – à connecter API', 'info')} className="flex-1 sm:flex-none">
            ➕ Nouveau projet
          </Button>
        </div>
      </div>

      {/* Alertes intelligentes (innovation) */}
      {topAlerts.length > 0 && (
        <Card className="border-amber-400/30 bg-amber-400/8">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">🧠</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-amber-300/80 text-sm sm:text-base">Recommandations prioritaires (portfolio)</h3>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
                  Détection proactive: risques, complexité, angles morts (informel, doc, gouvernance).
                </p>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {topAlerts.map((a) => (
                    <div
                      key={a.id}
                      className={cn(
                        'p-3 rounded border',
                        darkMode ? 'bg-slate-800/50 border-slate-700/60' : 'bg-white border-slate-200'
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-[10px] text-orange-300/80">{a.id}</p>
                          <p className="font-semibold text-xs sm:text-sm truncate">{a.name}</p>
                        </div>
                        <div className="flex sm:flex-col gap-1 sm:gap-0 sm:text-right shrink-0">
                          <Badge variant={a.risk >= 60 ? 'urgent' : a.risk >= 40 ? 'warning' : 'info'} className="text-[9px]">
                            ⚠️ {a.risk}
            </Badge>
                          <Badge variant="default" className="text-[9px]">
                            🧩 {a.complexity}
                          </Badge>
                        </div>
                      </div>
                      {a.primary && (
                        <p className="text-[10px] sm:text-xs text-slate-400 mt-2">
                          <span className={cn(a.primary.severity === 'urgent' ? 'text-red-300/80' : a.primary.severity === 'warning' ? 'text-amber-300/80' : 'text-blue-300/80')}>
                            {a.primary.label}
                          </span>
                          <span className="text-slate-500"> — {a.primary.why}</span>
                        </p>
          )}
          <Button
            size="sm"
                        variant="ghost"
                        className="w-full mt-2 text-xs"
                        onClick={() => setSelectedId(a.id)}
          >
                        🔎 Ouvrir
        </Button>
        </div>
                  ))}
      </div>
              </div>
              <Badge variant="warning" className="text-[10px] shrink-0">Préventif</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        <Card className="bg-blue-400/8 border-blue-400/20">
          <CardContent className="p-2 sm:p-3 text-center">
            <p className="text-xl sm:text-2xl font-bold text-blue-300/80">{stats.active}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-400">Actifs</p>
          </CardContent>
        </Card>
        <Card className="bg-red-400/8 border-red-400/20">
          <CardContent className="p-2 sm:p-3 text-center">
            <p className="text-xl sm:text-2xl font-bold text-red-300/80">{stats.blocked}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-400">Bloqués</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-400/8 border-amber-400/20">
          <CardContent className="p-2 sm:p-3 text-center">
            <p className="text-xl sm:text-2xl font-bold text-amber-300/80">{stats.late}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-400">En retard</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-400/8 border-purple-400/20">
          <CardContent className="p-2 sm:p-3 text-center">
            <p className="text-xl sm:text-2xl font-bold text-purple-300/80">{stats.highRisk}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-400">Risque élevé</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-400/8 border-slate-400/20">
          <CardContent className="p-2 sm:p-3 text-center">
            <p className="text-xl sm:text-2xl font-bold text-slate-300/80">{stats.informal}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-400">Informel/Hybride</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-400/8 border-emerald-400/20">
          <CardContent className="p-2 sm:p-3 text-center">
            <p className="text-lg sm:text-xl font-bold text-emerald-300/80">{stats.total}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-400">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres (projet hétérogène => multi-dimensions) responsive */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
            <div className="flex-1 min-w-0 w-full sm:min-w-[200px]">
              <Input 
                placeholder="🔎 Recherche (id, nom, secteur...)" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="p-2 rounded-lg bg-slate-700 border border-slate-600 text-xs sm:text-sm flex-1 sm:flex-none sm:w-auto"
            >
              <option value="all">Tous statuts</option>
              <option value="planned">Planifié</option>
              <option value="active">Actif</option>
              <option value="blocked">Bloqué</option>
              <option value="late">En retard</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>

            <select
              value={filterPhase}
              onChange={(e) => setFilterPhase(e.target.value as any)}
              className="p-2 rounded-lg bg-slate-700 border border-slate-600 text-xs sm:text-sm flex-1 sm:flex-none sm:w-auto"
            >
              <option value="all">Toutes phases</option>
              {Object.entries(phaseLabel).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

            <select
              value={filterKind}
              onChange={(e) => setFilterKind(e.target.value as any)}
              className="p-2 rounded-lg bg-slate-700 border border-slate-600 text-xs sm:text-sm flex-1 sm:flex-none sm:w-auto"
            >
              <option value="all">Tous types</option>
              <option value="travaux">Travaux</option>
              <option value="fournitures">Fournitures</option>
              <option value="services">Services</option>
              <option value="mixte">Mixte</option>
            </select>

            <select
              value={filterContext}
              onChange={(e) => setFilterContext(e.target.value as any)}
              className="p-2 rounded-lg bg-slate-700 border border-slate-600 text-xs sm:text-sm flex-1 sm:flex-none sm:w-auto"
            >
              <option value="all">Tous contextes</option>
              <option value="formal">Formel</option>
              <option value="hybrid">Hybride</option>
              <option value="informal">Informel</option>
              <option value="unknown">Inconnu</option>
            </select>
      </div>
        </CardContent>
      </Card>

      {/* Liste + Panel détail responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="lg:col-span-2 space-y-3">
          {enriched.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center text-slate-400">
                <span className="text-4xl block mb-2">📭</span>
                Aucun projet ne correspond aux filtres.
              </CardContent>
            </Card>
          ) : (
            enriched.map(({ p, complexity, risk, raci, nbas }) => {
              const isSelected = selectedId === p.id;

              return (
            <Card
                  key={p.id}
              className={cn(
                    'cursor-pointer transition-all',
                    isSelected ? 'ring-2 ring-orange-400/60' : 'hover:border-orange-400/30',
                    risk >= 60 && 'border-l-4 border-l-red-400/60',
                    p.context === 'informal' && 'border-r-4 border-r-amber-400/60'
                  )}
                  onClick={() => setSelectedId(p.id)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="font-mono text-[9px] sm:text-[10px] text-orange-300/80">{p.id}</span>
                          <Badge variant={statusVariant(p.status)} className="text-[9px]">{p.status}</Badge>
                          <Badge variant="default" className="text-[9px]">{phaseLabel[p.phase] ?? p.phase}</Badge>
                          <Badge variant="info" className="text-[9px]">{p.kind}</Badge>
                          {p.leadBureau && <BureauTag bureau={p.leadBureau} />}
                          {p.decisionBMO ? (
                            <Badge variant="success" className="text-[9px]">📜 {p.decisionBMO}</Badge>
                          ) : (
                            <Badge variant="warning" className="text-[9px]">Hors BMO</Badge>
                          )}
                          {p.cirilRef && <Badge variant="default" className="text-[9px]">🧾 CIRIL {p.cirilRef}</Badge>}
                    </div>

                        <h3 className="font-bold mt-1 text-sm sm:text-base truncate">{p.name}</h3>
                        <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                          Secteur: {p.sector} · Contexte: {p.context}
                        </p>

                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                          <Badge variant={risk >= 60 ? 'urgent' : risk >= 40 ? 'warning' : 'info'} className="text-[9px]">
                            ⚠️ Risque {risk}/100
                          </Badge>
                          <Badge variant="default" className="text-[9px]">🧩 Complexité {complexity}/100</Badge>
                          <Badge variant="gray" className="text-[8px] sm:text-[9px]">
                            A: {raci.accountable}
                          </Badge>
                          <Badge variant="gray" className="text-[8px] sm:text-[9px]">
                            R: {raci.responsible}
                </Badge>
              </div>

                        {nbas[0] && (
                          <p className="text-[10px] sm:text-xs text-slate-400 mt-2">
                            🎯 Next: <span className={cn(nbas[0].severity === 'urgent' ? 'text-red-300/80' : nbas[0].severity === 'warning' ? 'text-amber-300/80' : 'text-blue-300/80')}>
                              {nbas[0].label}
                            </span>
                </p>
              )}
                </div>

                      <div className="text-right shrink-0 hidden sm:block">
                        {(p.budgetPlanned != null || p.budgetSpent != null || p.budgetCommitted != null) && (
                          <div className={cn('p-2 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                            <p className="text-[10px] text-slate-400">Budget</p>
                            <p className="font-mono text-[10px] sm:text-xs">
                              P: {formatMoney(p.budgetPlanned ?? 0)}
                            </p>
                            <p className="font-mono text-[10px] sm:text-xs text-amber-300/80">
                              C: {formatMoney(p.budgetCommitted ?? 0)}
                            </p>
                            <p className="font-mono text-[10px] sm:text-xs text-emerald-300/80">
                              S: {formatMoney(p.budgetSpent ?? 0)}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>

                    <div className="flex gap-1.5 sm:gap-2 pt-3 border-t border-slate-700/50 flex-wrap">
                  <Button
                        size="sm"
                    variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                          handleCreateSnapshot(p);
                  }}
                        className="text-[10px] sm:text-xs flex-1 sm:flex-none"
                  >
                        🧾 Snapshot
                  </Button>
                  <Button
                        size="sm"
                        variant="info"
                    onClick={(e) => {
                      e.stopPropagation();
                          handleProposeDecisionBMO(p);
                    }}
                        className="text-[10px] sm:text-xs flex-1 sm:flex-none"
                  >
                        🏛️ Décision BMO
                  </Button>
                <Button
                  size="sm"
                        variant="ghost"
                        onClick={async (e) => {
                    e.stopPropagation();
                          await handleVerifyHash(p);
                  }}
                        className="text-[10px] sm:text-xs flex-1 sm:flex-none"
                >
                        🔐 Hash
                        </Button>
                    </div>
            </CardContent>
          </Card>
              );
            })
          )}
                  </div>

        {/* Panel détail */}
        <div className="lg:col-span-1">
          {selected ? (
            <Card className="sticky top-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm flex items-center justify-between">
                  <span>📌 Détail projet</span>
                  <Badge variant={statusVariant(selected.status)} className="text-[9px]">{selected.status}</Badge>
            </CardTitle>
          </CardHeader>
              <CardContent className="p-3 sm:p-4 space-y-3">
                <div className="pb-3 border-b border-slate-700/50">
                  <p className="font-mono text-[10px] sm:text-xs text-orange-300/80">{selected.id}</p>
                  <h3 className="font-bold text-sm sm:text-base">{selected.name}</h3>
                  <p className="text-[10px] sm:text-xs text-slate-400">
                    {selected.kind} · {selected.sector} · {phaseLabel[selected.phase] ?? selected.phase} · Contexte: {selected.context}
                  </p>

                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                    {selected.leadBureau && <BureauTag bureau={selected.leadBureau} />}
                    {selected.decisionBMO ? <Badge variant="success" className="text-[9px]">📜 {selected.decisionBMO}</Badge> : <Badge variant="warning" className="text-[9px]">Hors BMO</Badge>}
                    {selected.cirilRef && <Badge variant="default" className="text-[9px]">🧾 CIRIL {selected.cirilRef}</Badge>}
                  </div>
                  </div>

                {/* Scores */}
                {(() => {
                  const complexity = computeComplexityScore(selected);
                  const risk = computeRiskScore(selected);
                  return (
                    <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Risque</span>
                        <span className={cn('font-mono', risk >= 60 ? 'text-red-300/80' : risk >= 40 ? 'text-amber-300/80' : 'text-emerald-300/80')}>
                          {risk}/100
                        </span>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-slate-400">Complexité</span>
                        <span className="font-mono text-purple-300/80">{complexity}/100</span>
                      </div>
                      {isOverdue(selected) && (
                        <div className="mt-2">
                          <Badge variant="urgent" className="text-[9px]">⏰ Échéance dépassée</Badge>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* RACI */}
                {(() => {
                  const raci = computeRACI(selected);
                  return (
                    <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                      <h4 className="font-bold text-xs mb-2">🧩 RACI (auto)</h4>
                      <p className="text-[10px] sm:text-xs"><span className="text-slate-400">A:</span> {raci.accountable}</p>
                      <p className="text-[10px] sm:text-xs"><span className="text-slate-400">R:</span> {raci.responsible}</p>
                      {raci.consulted.length > 0 && (
                        <p className="text-[10px] sm:text-xs"><span className="text-slate-400">C:</span> {raci.consulted.join(', ')}</p>
                      )}
                      {raci.informed.length > 0 && (
                        <p className="text-[10px] sm:text-xs"><span className="text-slate-400">I:</span> {raci.informed.join(', ')}</p>
                      )}
                    </div>
                  );
                })()}

                {/* Enjeux & leviers */}
                <div className={cn('p-3 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                  <h4 className="font-bold text-xs mb-2">🎯 Enjeux / Leviers</h4>
                  <div className="flex flex-wrap gap-1">
                    {(selected.enjeux.length ? selected.enjeux : ['(enjeux non renseignés)']).slice(0, 8).map((x, i) => (
                      <Badge key={`enj-${i}`} variant="warning" className="text-[9px]">{x}</Badge>
                    ))}
                    {(selected.leviers.length ? selected.leviers : ['(leviers non renseignés)']).slice(0, 8).map((x, i) => (
                      <Badge key={`lev-${i}`} variant="info" className="text-[9px]">{x}</Badge>
                    ))}
                  </div>
                </div>

                {/* Work packages */}
                  <div>
                  <h4 className="font-bold text-xs mb-2">🧱 Work Packages (WBS)</h4>
                  {selected.workPackages.length === 0 ? (
                    <p className="text-[10px] sm:text-xs text-slate-400">Aucun lot / WP renseigné (ajouter au moins "Conception", "Exécution", "Fournitures/Services" selon le cas).</p>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {selected.workPackages.slice(0, 20).map((w) => (
                        <div key={w.id} className={cn('p-2 rounded border', darkMode ? 'border-slate-700/60 bg-slate-800/40' : 'border-slate-200 bg-white')}>
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] sm:text-xs font-medium truncate">{w.label}</p>
                              <p className="text-[9px] text-slate-400">
                                {w.stream} · {w.phase ? phaseLabel[w.phase] : '—'} · Owner: {w.ownerBureau ?? 'à définir'}
                              </p>
                            </div>
                            {typeof w.progress === 'number' && (
                              <Badge variant={w.progress >= 80 ? 'success' : w.progress >= 50 ? 'warning' : 'urgent'} className="text-[8px] sm:text-[9px] shrink-0">
                                {clamp(w.progress, 0, 100)}%
                </Badge>
                            )}
                        </div>
                  </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Indicateurs S&E */}
                <div>
                  <h4 className="font-bold text-xs mb-2">📈 Indicateurs (Suivi & Évaluation)</h4>
                  {selected.indicators.length === 0 ? (
                    <div className="p-3 rounded bg-amber-400/8 border border-amber-400/30">
                      <p className="text-[10px] sm:text-xs text-amber-300/80">
                        Angle mort: aucun indicateur. Recommandé: 1 output, 1 outcome, 1 risk (min).
                      </p>
                </div>
                  ) : (
                    <div className="space-y-2">
                      {selected.indicators.slice(0, 6).map((i) => (
                        <div key={i.id} className={cn('p-2 rounded', darkMode ? 'bg-slate-700/30' : 'bg-gray-100')}>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[10px] sm:text-xs font-medium truncate">{i.label}</p>
                            <Badge variant="default" className="text-[8px] sm:text-[9px] shrink-0">{i.type}</Badge>
                          </div>
                          <p className="text-[9px] sm:text-[10px] text-slate-400 mt-1">
                            {i.baseline != null ? `B: ${i.baseline}${i.unit ?? ''}` : 'B: —'} ·
                            {i.target != null ? ` T: ${i.target}${i.unit ?? ''}` : ' T: —'} ·
                            {i.current != null ? ` C: ${i.current}${i.unit ?? ''}` : ' C: —'}
                            {i.lastUpdate ? ` · MAJ: ${i.lastUpdate}` : ''}
                          </p>
                        </div>
                      ))}
              </div>
            )}
                </div>

                {/* Hash */}
                <div className="p-3 rounded bg-slate-700/30">
                  <p className="text-[10px] text-slate-400">🔐 Hash audit</p>
                  <p className="font-mono text-[9px] sm:text-[10px] truncate">
                    {selected.hash || hashCache[selected.id] || '(calcul en cours / non stocké)'}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="ghost" className="flex-1 text-xs" onClick={() => void handleVerifyHash(selected)}>
                      Vérifier
                    </Button>
              <Button
                size="sm"
                variant="secondary"
                      className="flex-1 text-xs"
                      onClick={async () => {
                        const h = await ensureHash(selected);
                        downloadCSV(`audit_${selected.id}_${new Date().toISOString().slice(0, 10)}.csv`, [
                          {
                            projectId: selected.id,
                            name: selected.name,
                            hash: h,
                            decisionBMO: selected.decisionBMO ?? 'Hors BMO',
                            cirilRef: selected.cirilRef ?? '',
                            updatedAt: selected.updatedAt ?? '',
                            riskScore: computeRiskScore(selected),
                            complexityScore: computeComplexityScore(selected),
                          },
                        ]);
                        addActionLog({
                          userId: 'USR-001',
                          userName: 'A. DIALLO',
                          userRole: 'Directeur Général',
                          module: 'suivi-evaluation',
                          action: 'export',
                          targetId: selected.id,
                          targetType: 'Project',
                          details: 'Export audit projet (hash + scores)',
                        });
                        addToast('Audit projet exporté (CSV)', 'success');
                      }}
                    >
                      📤 Export audit
              </Button>
                  </div>
                </div>

                {/* Next best actions */}
                <div className={cn('p-3 rounded border', darkMode ? 'border-slate-700/60 bg-slate-800/40' : 'border-slate-200 bg-white')}>
                  <h4 className="font-bold text-xs mb-2">🧠 Recommandations (Next best actions)</h4>
                  {buildNextBestActions(selected).map((a, idx) => (
                    <div key={idx} className="mb-2">
                      <p className={cn('text-[10px] sm:text-xs font-medium', a.severity === 'urgent' ? 'text-red-300/80' : a.severity === 'warning' ? 'text-amber-300/80' : 'text-blue-300/80')}>
                        • {a.label}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-slate-400">{a.why}</p>
                    </div>
                  ))}
            </div>
            </CardContent>
          </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="p-8 text-center">
                <span className="text-4xl mb-4 block">🧭</span>
                <p className="text-slate-400 text-xs sm:text-sm">Sélectionnez un projet pour voir son suivi & évaluation</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Aide "logique système" */}
      <Card className="border-blue-400/30 bg-blue-400/8">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl">ℹ️</span>
            <div className="flex-1">
              <h3 className="font-bold text-xs sm:text-sm text-blue-300/80">Comment ce module gère l'hétérogénéité</h3>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
                Le projet est modélisé en <b>WBS/Work Packages</b> (conception, travaux, fournitures, services, transverse)
                + <b>stakeholders</b> + <b>enjeux/leviers</b> + <b>indicateurs S&E</b>. Le moteur calcule:
                <b> complexité</b>, <b>risque</b>, <b>RACI</b> et propose les <b>actions prioritaires</b>.
                L'audit est sécurisé via <b>hash SHA-256</b> et export CSV.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
