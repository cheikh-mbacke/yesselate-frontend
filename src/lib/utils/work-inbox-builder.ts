/**
 * =========================
 * WorkInbox Builder
 * =========================
 */

import type { WorkItem, WorkKind, RiskLevel, WorkAction } from '@/lib/types/work-inbox.types';
import { bcToValidate, facturesRecues, avenants, contractsToSign, financials, blockedDossiers, paymentsN1 } from '@/lib/data';

// parsing money robuste (reprend ton approche)
export const parseMoney = (v: unknown): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const raw = String(v ?? '')
    .replace(/\s/g, '')
    .replace(/FCFA|XOF|F\s?CFA/gi, '')
    .replace(/[^\d,.-]/g, '');
  const normalized = raw.replace(/,/g, '');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
};

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

const riskWeight = (risk: RiskLevel) => {
  switch (risk) {
    case 'critical': return 45;
    case 'high': return 30;
    case 'medium': return 18;
    case 'low': return 8;
  }
};

const kindWeight = (kind: WorkKind) => {
  switch (kind) {
    case 'paiement': return 35;
    case 'contrat': return 30;
    case 'blocage': return 28;
    case 'facture': return 22;
    case 'bc': return 18;
    case 'avenant': return 16;
    case 'litige': return 25;
  }
};

// Score "marché" : impact + urgence + risque + nature
export const computePriorityScore = (p: {
  kind: WorkKind;
  risk: RiskLevel;
  amountImpactFCFA?: number;
  daysToDue?: number;
  evidenceCount?: number;
}) => {
  const amount = p.amountImpactFCFA ?? 0;
  const days = p.daysToDue;

  // impact: log10 pour éviter qu'un 41Mds écrase tout
  const amountScore = clamp(Math.log10(Math.max(1, amount)) * 6, 0, 30);

  // urgence: plus c'est en retard/proche, plus ça score
  // daysToDue: 0 = aujourd'hui, 7 = dans 7 jours, -3 = 3 jours de retard
  let urgencyScore = 0;
  if (typeof days === 'number') {
    if (days < 0) urgencyScore = clamp(25 + Math.abs(days) * 2, 25, 45);
    else urgencyScore = clamp(20 - days * 2, 0, 20);
  }

  const evidenceScore = clamp((p.evidenceCount ?? 0) * 2, 0, 12);

  return (
    kindWeight(p.kind) +
    riskWeight(p.risk) +
    amountScore +
    urgencyScore +
    evidenceScore
  );
};

// Anti-doublon: signature textuelle stable
const signature = (x: { kind: string; id: string; title: string; actionTypes: string[] }) =>
  `${x.kind}:${x.id}:${x.title}`.toLowerCase().replace(/\s+/g, ' ').trim()
  + `|${x.actionTypes.sort().join(',')}`;

export function dedupeWorkItems(items: WorkItem[]): WorkItem[] {
  const seen = new Set<string>();
  const out: WorkItem[] = [];

  for (const it of items) {
    const sig = signature({
      kind: it.kind,
      id: it.id,
      title: it.title,
      actionTypes: it.recommendedActions.map(a => a.type),
    });

    if (seen.has(sig)) continue;
    seen.add(sig);
    out.push(it);
  }

  // tri par score desc
  return out.sort((a, b) => b.priorityScore - a.priorityScore);
}

type BuildInput = {
  bcToValidate?: any[];
  facturesRecues?: any[];
  avenants?: any[];
  contractsToSign?: any[];
  financials?: any;
  // extensible: paiements, litiges, blocages...
};

export function buildWorkInboxItems(input?: BuildInput): WorkItem[] {
  const nowISO = new Date().toISOString();
  const items: WorkItem[] = [];

  // Si input fourni, utiliser celui-ci, sinon utiliser les données par défaut
  const data = input ?? {
    bcToValidate,
    facturesRecues,
    avenants,
    contractsToSign,
    financials,
  };

  const add = (w: Omit<WorkItem, 'priorityScore'>) => {
    const priorityScore = computePriorityScore({
      kind: w.kind,
      risk: w.risk,
      amountImpactFCFA: w.amountImpactFCFA,
      daysToDue: w.daysToDue,
      evidenceCount: w.evidence.length,
    });
    items.push({ ...w, priorityScore });
  };

  // BC en attente
  for (const bc of data.bcToValidate ?? []) {
    const amount = parseMoney(bc.amount ?? bc.montantTTC ?? 0);
    const pending = !bc.decisionBMO;
    if (!pending) continue;

    const evidence: string[] = [
      'BC sans décision BMO (auditabilité incomplète)',
      bc.statut ? `Statut: ${bc.statut}` : 'Statut non renseigné',
      amount > 0 ? `Impact: ${amount.toLocaleString('fr-FR')} FCFA` : 'Montant non normalisé',
    ];

    const actions: WorkAction[] = [
      { type: 'open_module', label: 'Ouvrir validation BC', href: '/maitre-ouvrage/validation?tab=bc' },
      { type: 'validate', label: 'Valider (BMO)', requiresReason: true },
      { type: 'send_to_bj', label: 'Renvoyer BJ', requiresReason: true },
    ];

    add({
      uid: `bc:${bc.id}`,
      id: String(bc.id ?? ''),
      kind: 'bc',
      title: `Valider BC ${bc.id}`,
      project: bc.projetName ?? bc.chantier ?? bc.project,
      partner: bc.fournisseur ?? (bc as any).supplier,
      bureauOwner: bc.bureau ?? 'BMO',
      amountImpactFCFA: amount,
      daysToDue: typeof bc.daysToExpiry === 'number' ? bc.daysToExpiry : undefined,
      risk: 'medium',
      evidence,
      recommendedActions: actions,
      links: bc.decisionBMO?.decisionId ? [{ label: 'Décision', href: `/maitre-ouvrage/decisions?id=${bc.decisionBMO.decisionId}` }] : undefined,
      createdAtISO: (bc as any).createdAtISO ?? nowISO,
    });
  }

  // Factures
  for (const f of data.facturesRecues ?? []) {
    const pending = !f.decisionBMO && (f.statut === 'en attente' || f.statut === 'reçue' || f.statut === 'à valider' || f.statut === 'recue');
    if (!pending) continue;

    const amount = parseMoney(f.montantTTC ?? 0);
    const late = typeof (f as any).daysLate === 'number' ? -Math.abs((f as any).daysLate) : undefined;

    add({
      uid: `facture:${f.id}`,
      id: String(f.id),
      kind: 'facture',
      title: `Valider facture ${f.id}`,
      project: f.chantier,
      partner: f.fournisseur,
      bureauOwner: 'BF',
      amountImpactFCFA: amount,
      daysToDue: late,
      risk: amount > 5_000_000 ? 'high' : 'medium',
      evidence: [
        'Facture sans décision BMO',
        late ? `Retard: ${Math.abs(late)}j` : 'Retard non calculé',
        `Montant TTC: ${amount.toLocaleString('fr-FR')} FCFA`,
      ],
      recommendedActions: [
        { type: 'open_module', label: 'Ouvrir validation Factures', href: '/maitre-ouvrage/validation?tab=factures' },
        { type: 'validate', label: 'Valider paiement', requiresReason: true },
        { type: 'arbitrage', label: 'Demander arbitrage', requiresReason: true },
      ],
      links: f.decisionBMO?.decisionId ? [{ label: 'Décision', href: `/maitre-ouvrage/decisions?id=${f.decisionBMO.decisionId}` }] : undefined,
      createdAtISO: (f as any).createdAtISO ?? nowISO,
    });
  }

  // Avenants
  for (const av of data.avenants ?? []) {
    const pending = !av.decisionBMO && (av.statut === 'proposé' || av.statut === 'en attente' || av.statut === 'à valider' || av.statut === 'propose');
    if (!pending) continue;

    const amount = Math.abs(parseMoney(av.ecart ?? 0));
    const risk: RiskLevel =
      amount >= 10_000_000 ? 'critical' :
      amount >= 3_000_000 ? 'high' :
      'medium';

    add({
      uid: `avenant:${av.id}`,
      id: String(av.id),
      kind: 'avenant',
      title: `Arbitrer avenant ${av.id}`,
      project: av.chantier,
      partner: av.bcReference,
      bureauOwner: av.bureau ?? 'BMO',
      amountImpactFCFA: amount,
      risk,
      evidence: [
        'Avenant sans décision BMO',
        `Écart: ${amount.toLocaleString('fr-FR')} FCFA`,
        av.bcReference ? `BC référence: ${av.bcReference}` : 'BC référence manquant',
      ],
      recommendedActions: [
        { type: 'open_module', label: 'Ouvrir avenants', href: '/maitre-ouvrage/validation?tab=avenants' },
        { type: 'send_to_bj', label: 'Contrôle BJ obligatoire', requiresReason: true },
        { type: 'arbitrage', label: 'Arbitrage DG', requiresReason: true },
      ],
      links: av.decisionBMO?.decisionId ? [{ label: 'Décision', href: `/maitre-ouvrage/decisions?id=${av.decisionBMO.decisionId}` }] : undefined,
      createdAtISO: (av as any).createdAtISO ?? nowISO,
    });
  }

  // Contrats à signer
  for (const c of data.contractsToSign ?? []) {
    const daysToExpiry = typeof (c as any).daysToExpiry === 'number' ? (c as any).daysToExpiry : undefined;
    const urgent = typeof daysToExpiry === 'number' && daysToExpiry <= 7;
    if (!urgent) continue;

    const amount = parseMoney((c as any).amount ?? 0);

    add({
      uid: `contrat:${c.id}`,
      id: String(c.id),
      kind: 'contrat',
      title: `Signer contrat ${c.id}`,
      project: (c as any).project ?? (c as any).chantier ?? c.subject,
      partner: (c as any).partner ?? (c as any).supplier ?? (c as any).client,
      bureauOwner: (c as any).bureau ?? 'BMO',
      amountImpactFCFA: amount,
      daysToDue: daysToExpiry,
      risk: daysToExpiry !== undefined && daysToExpiry < 0 ? 'critical' : 'high',
      evidence: [
        `Échéance: J-${daysToExpiry ?? '?'}`,
        'Double contrôle BJ requis (R) + BMO (A)',
        amount ? `Montant: ${amount.toLocaleString('fr-FR')} FCFA` : 'Montant non normalisé',
      ],
      recommendedActions: [
        { type: 'open_module', label: 'Ouvrir contrats', href: '/maitre-ouvrage/validation-contrats' },
        { type: 'sign', label: 'Signer (après BJ)', requiresReason: true },
        { type: 'send_to_bj', label: 'Renvoyer BJ', requiresReason: true },
      ],
      links: (c as any).decisionBMO?.decisionId ? [{ label: 'Décision', href: `/maitre-ouvrage/decisions?id=${(c as any).decisionBMO.decisionId}` }] : undefined,
      createdAtISO: (c as any).createdAtISO ?? nowISO,
    });
  }

  return dedupeWorkItems(items);
}
