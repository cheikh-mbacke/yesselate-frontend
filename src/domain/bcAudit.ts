// src/domain/bcAudit.ts
import type { BonCommande } from "./bcTypes";
import { isCompatibleFamily } from "./nomenclature";

export type Severity = "info" | "warning" | "error" | "critical";

export interface AuditAnomaly {
  id: string;
  severity: Severity;
  title: string;
  details: string;
  evidence?: Record<string, unknown>;
}

export interface AuditCheck {
  id: string;
  type: "budget" | "conformity" | "strategy" | "risk" | "traceability" | "nomenclature";
  label: string;
  status: "passed" | "failed" | "warning" | "pending";
  details?: string;
}

export interface AuditReport {
  bcId: string;
  generatedAt: string;
  anomalies: AuditAnomaly[];
  checks: AuditCheck[];
  risk: "low" | "medium" | "high" | "critical";
  recommendation: "approve" | "request_complement" | "escalate" | "reject";
  summary: string;
  inputFingerprint: string; // hash/empreinte (même sans SHA3, au moins stable)
}

export interface AuditContext {
  // paramètres de contrôle (seuils)
  seuilBmo: number;    // ex 5_000_000
  seuilDg: number;     // ex 20_000_000 (si tu gardes DG)
  supplierBlackList?: string[];
  // données externes optionnelles
  budgetRemainingByChantier?: Record<string, number>;
  lastPricesBySupplierItem?: Record<string, { avg: number; max: number; min: number }>;
}

function fingerprint(obj: unknown) {
  // empreinte stable simple (front). Cursor peut remplacer par SHA3-256.
  return JSON.stringify(obj, Object.keys(obj as any).sort());
}

export async function runBCAuditDeep(bc: BonCommande, ctx: AuditContext): Promise<AuditReport> {
  const anomalies: AuditAnomaly[] = [];
  const checks: AuditCheck[] = [];

  // --- Helpers
  const totalHT = bc.totalHT ?? bc.lines.reduce((a, l) => a + l.qty * l.unitPriceHT, 0);
  const vatRate = bc.vatRate ?? 0.2;

  // 1) Nomenclature : BC homogène
  const incompatible = bc.lines.filter(l => !isCompatibleFamily(bc.familyCode, l.familyCode));
  if (incompatible.length > 0) {
    anomalies.push({
      id: "NOM-001",
      severity: "error",
      title: "BC non homogène (nomenclature)",
      details:
        "Des lignes ne correspondent pas à la famille principale du BC. Recommandation : scinder en plusieurs BC par famille homogène.",
      evidence: {
        bcFamily: bc.familyCode,
        incompatibleLines: incompatible.map(l => ({ id: l.id, family: l.familyCode, designation: l.designation })),
      },
    });
    checks.push({ id: "CHK-NOM", type: "nomenclature", label: "Homogénéité nomenclature", status: "failed" });
  } else {
    checks.push({ id: "CHK-NOM", type: "nomenclature", label: "Homogénéité nomenclature", status: "passed" });
  }

  // 2) Contrôle seuils (BMO)
  if (totalHT > ctx.seuilBmo) {
    checks.push({
      id: "CHK-AMT",
      type: "risk",
      label: "Montant vs seuil BMO",
      status: "warning",
      details: `Montant ${totalHT.toLocaleString("fr-FR")} > seuil BMO ${ctx.seuilBmo.toLocaleString("fr-FR")}`,
    });
  } else {
    checks.push({ id: "CHK-AMT", type: "risk", label: "Montant vs seuil BMO", status: "passed" });
  }

  // 3) Fournisseur blacklist / suspect
  if (ctx.supplierBlackList?.includes(bc.supplierId)) {
    anomalies.push({
      id: "SUP-001",
      severity: "critical",
      title: "Fournisseur à risque (blacklist)",
      details: "Le fournisseur est marqué comme non autorisé / à risque. Blocage recommandé.",
      evidence: { supplierId: bc.supplierId, supplierName: bc.supplierName },
    });
    checks.push({ id: "CHK-SUP", type: "risk", label: "Conformité fournisseur", status: "failed" });
  } else {
    checks.push({ id: "CHK-SUP", type: "risk", label: "Conformité fournisseur", status: "passed" });
  }

  // 4) Détection prix aberrants (si référentiel dispo)
  const priceOutliers = bc.lines
    .map(l => {
      const ref = l.supplierItemRef ? ctx.lastPricesBySupplierItem?.[l.supplierItemRef] : undefined;
      if (!ref) return null;
      const current = l.unitPriceHT;
      const outlier = current > ref.max * 1.15 || current < ref.min * 0.85;
      return outlier ? { lineId: l.id, designation: l.designation, current, ref } : null;
    })
    .filter(Boolean) as any[];

  if (priceOutliers.length > 0) {
    anomalies.push({
      id: "PRC-001",
      severity: "warning",
      title: "Prix potentiellement aberrant",
      details: "Certaines lignes sont en dehors des bornes habituelles (référentiel). Vérification conseillée.",
      evidence: { priceOutliers },
    });
    checks.push({ id: "CHK-PRC", type: "conformity", label: "Cohérence prix", status: "warning" });
  } else {
    checks.push({ id: "CHK-PRC", type: "conformity", label: "Cohérence prix", status: "passed" });
  }

  // 5) Budget chantier (si allocations présentes)
  const chantierIssues: any[] = [];
  if (ctx.budgetRemainingByChantier) {
    for (const line of bc.lines) {
      for (const ch of line.chantierRefs ?? []) {
        const remaining = ctx.budgetRemainingByChantier[ch];
        if (remaining != null && remaining < line.qty * line.unitPriceHT) {
          chantierIssues.push({ chantier: ch, remaining, lineId: line.id, amount: line.qty * line.unitPriceHT });
        }
      }
    }
  }
  if (chantierIssues.length > 0) {
    anomalies.push({
      id: "BUD-001",
      severity: "error",
      title: "Dépassement budgétaire chantier",
      details: "Au moins une allocation chantier dépasse le budget restant.",
      evidence: { chantierIssues },
    });
    checks.push({ id: "CHK-BUD", type: "budget", label: "Budget chantier", status: "failed" });
  } else {
    checks.push({ id: "CHK-BUD", type: "budget", label: "Budget chantier", status: "passed" });
  }

  // ---- Calcul risk + recommendation
  const hasCritical = anomalies.some(a => a.severity === "critical");
  const hasError = anomalies.some(a => a.severity === "error");
  const hasWarning = anomalies.some(a => a.severity === "warning");

  const risk: AuditReport["risk"] =
    hasCritical ? "critical" : hasError ? "high" : hasWarning ? "medium" : "low";

  const recommendation: AuditReport["recommendation"] =
    hasCritical ? "reject" : hasError ? "request_complement" : "approve";

  const tva = totalHT * vatRate;
  const ttc = totalHT + tva;

  const summary =
    recommendation === "approve"
      ? `BC conforme après audit complet. Total HT=${totalHT.toLocaleString("fr-FR")}, TVA=${(vatRate * 100)}%, TTC=${ttc.toLocaleString("fr-FR")}.`
      : `Audit complet : anomalies détectées (${anomalies.length}). Action recommandée : ${recommendation}.`;

  return {
    bcId: bc.id,
    generatedAt: new Date().toISOString(),
    anomalies,
    checks,
    risk,
    recommendation,
    summary,
    inputFingerprint: fingerprint({ bc, ctx }),
  };
}

