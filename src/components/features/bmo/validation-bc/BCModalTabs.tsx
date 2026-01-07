'use client';

import React, { useMemo, useState, useEffect, useRef } from "react";
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, FileText, CheckCircle, AlertTriangle, 
  History, Lightbulb, TrendingUp, Download, Eye, Search
} from 'lucide-react';
import type { EnrichedBC } from '@/lib/types/document-validation.types';
import { BCDocumentView } from './BCDocumentView';
import { analyzeBCForBMO, generateBMODecisionRecommendation } from '@/lib/utils/validation-logic';
import type { PurchaseOrder } from '@/lib/types/bmo.types';
import { runBCAudit, isAuditRequiredForValidation } from '@/lib/services/bc-audit.service';
import type { BCAuditReport, BCAuditContext } from '@/lib/types/bc-workflow.types';
import { useBMOStore } from '@/lib/stores';
import { convertEnrichedBCToBonCommande } from '@/lib/utils/bc-converter';
import { useBcAudit } from '@/ui/hooks/useBcAudit';

type TabKey = "analyse" | "details" | "documents" | "historique" | "risques";

type BCLine = { 
  code?: string; 
  qty?: number; 
  designation: string; 
  unitPriceHT?: number; 
  totalHT?: number;
};

type BCDoc = { 
  id: string; 
  name: string; 
  required: boolean; 
  status: "present" | "missing" | "expired"; 
  url?: string;
};

type BCAudit = { 
  id: string; 
  at: string; 
  by: string; 
  action: string; 
  details?: string;
};

type BCRisk = { 
  id: string; 
  label: string; 
  level: "low" | "medium" | "high" | "critical"; 
  status: "detected" | "not_detected"; 
  note?: string;
};

type DecisionPayload =
  | { decision: "approve"; reason?: string; conditions?: string[] }
  | { decision: "reject"; reason: string }
  | { decision: "request_complement"; reason: string; deadline?: string; expectedDocs?: string[] }
  | { decision: "escalate"; reason: string; target: "dg" | "ca" };

interface BCModalTabsProps {
  bc: EnrichedBC;
  onDecision: (payload: DecisionPayload) => Promise<void> | void;
  onAuditComplete?: (bcId: string, report: BCAuditReport) => void; // WHY: Propager le rapport d'audit au parent
}

export function BCModalTabs({ bc, onDecision, onAuditComplete }: BCModalTabsProps) {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [tab, setTab] = useState<TabKey>("analyse");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [auditReport, setAuditReport] = useState<BCAuditReport | null>(bc.auditReport || null);
  
  // Hook pour l'audit BC
  const bcAudit = useBcAudit();
  
  // Reset l'onglet actif et le scroll au changement de BC
  useEffect(() => {
    setTab("analyse"); // Reset vers l'onglet Analyse
    // Reset le scroll
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
    }
    // Reset le rapport d'audit si le BC change
    setAuditReport(bc.auditReport || null);
  }, [bc.id]); // Se déclenche uniquement quand l'ID change

  // Fonction de mapping des statuts (WHY: éviter affichage brut "anomaly_detected")
  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: 'En attente',
      anomaly_detected: 'Anomalie détectée',
      correction_requested: 'Correction demandée',
      correction_in_progress: 'Correction en cours',
      corrected: 'Corrigé',
      validated: 'Validé',
      rejected: 'Refusé',
      draft_ba: 'Brouillon BA',
      pending_bmo: 'En attente BMO',
      audit_required: 'Audit requis',
      in_audit: 'Audit en cours',
      approved_bmo: 'Approuvé BMO',
      rejected_bmo: 'Refusé BMO',
      sent_supplier: 'Envoyé fournisseur',
      needs_complement: 'Complément requis',
    };
    return statusMap[status] || status;
  };

  // Helper pour formater une date de manière sûre (WHY: éviter erreur si date invalide)
  const safeFormatDate = (dateStr: string | undefined | null): string => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleDateString('fr-FR');
    } catch {
      return '—';
    }
  };

  // Helper pour formater un montant de manière sûre (WHY: éviter erreur si montant invalide)
  const safeFormatAmount = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null || isNaN(amount)) return '0';
    return amount.toLocaleString('fr-FR');
  };

  // Header info (pour correspondre au header de la modal parente)
  const headerInfo = useMemo(() => {
    return {
      title: bc.objet || 'BC sans objet',
      id: bc.id,
      date: safeFormatDate(bc.dateEmission),
      amount: safeFormatAmount(bc.montantTTC),
      supplier: bc.fournisseur,
      status: bc.status,
      priority: 'normal' as const,
      bureau: bc.bureauEmetteur,
    };
  }, [bc]);

  // Convertir EnrichedBC en PurchaseOrder pour l'analyse
  const standardBC = useMemo(() => {
    const montantTTC = bc.montantTTC ?? bc.montantHT ?? 0;
    return {
      id: bc.id,
      subject: bc.objet || 'BC sans objet',
      supplier: bc.fournisseur || 'Fournisseur non spécifié',
      project: bc.projet || 'Projet non spécifié',
      amount: montantTTC.toString(),
      priority: 'normal' as const,
      bureau: bc.bureauEmetteur || 'BMO',
      status: bc.status === 'validated' ? 'validated' : bc.status === 'rejected' ? 'rejected' : 'pending',
      requestedBy: bc.demandeur?.nom || 'N/A',
      date: bc.dateEmission || new Date().toISOString().split('T')[0],
      dateLimit: bc.dateLimite || new Date().toISOString().split('T')[0],
    } as PurchaseOrder;
  }, [bc]);

  // Analyse BMO
  const analysis = useMemo(() => {
    return analyzeBCForBMO(standardBC);
  }, [standardBC]);

  const recommendation = useMemo(() => {
    return generateBMODecisionRecommendation('bc', analysis, standardBC);
  }, [analysis, standardBC]);

  // Documents (depuis bc.documents ou générés)
  const documents = useMemo(() => {
    if (bc.documents && bc.documents.length > 0) {
      return bc.documents.map(doc => ({
        id: doc.id,
        name: doc.nom,
        required: true,
        status: doc.url ? ("present" as const) : ("missing" as const),
        url: doc.url,
      }));
    }
    return [];
  }, [bc.documents]);

  // Historique (depuis bc.historique)
  const history = useMemo(() => {
    if (bc.historique && bc.historique.length > 0) {
      return bc.historique.map(hist => ({
        id: hist.id,
        at: hist.date,
        by: hist.auteur,
        action: hist.action,
        details: hist.details,
      }));
    }
    return [];
  }, [bc.historique]);

  // Risques (depuis anomalies converties en risques)
  const risks = useMemo(() => {
    const detectedRisks: BCRisk[] = (bc.anomalies || []).map((anomaly, idx) => ({
      id: anomaly.id || `risk-${idx}`,
      label: anomaly.type,
      level: anomaly.severity === 'critical' ? 'critical' : 
             anomaly.severity === 'error' ? 'high' : 
             anomaly.severity === 'warning' ? 'medium' : 'low',
      status: 'detected' as const,
      note: anomaly.description,
    }));

    // Risques standards non détectés
    const standardRisks: BCRisk[] = [
      { id: 'risk-budget', label: 'Dépassement budget projet', level: 'medium', status: 'not_detected' },
      { id: 'risk-fournisseur', label: 'Fournisseur non référencé', level: 'medium', status: 'not_detected' },
      { id: 'risk-delai', label: 'Délai de livraison non respecté', level: 'low', status: 'not_detected' },
    ].filter(risk => !detectedRisks.some(dr => dr.label === risk.label));

    return [...detectedRisks, ...standardRisks];
  }, [bc.anomalies]);

  const counts = useMemo(() => {
    const docsMissing = documents.filter(d => d.status !== "present").length;
    const histCount = history.length;
    const riskCount = risks.filter(r => r.status === "detected").length;
    return { docsMissing, histCount, riskCount };
  }, [documents, history, risks]);

  // Totaux calculés
  const totals = useMemo(() => {
    const vatRate = (bc.tva || 20) / 100;
    const lines = (bc.lignes || []).map(l => {
      const qty = typeof l.quantite === 'string' ? parseFloat(l.quantite.match(/^(\d+(?:[.,]\d+)?)/)?.[1] || '1') : 1;
      const totalHT = Number.isFinite(l.totalHT)
        ? l.totalHT
        : qty * (l.prixUnitaireHT || 0);
      return {
        code: l.code,
        qty,
        designation: l.designation,
        unitPriceHT: l.prixUnitaireHT,
        totalHT,
      };
    });

    const totalHT = lines.reduce((a, l) => a + (l.totalHT ?? 0), 0);
    const tva = totalHT * vatRate;
    const ttc = totalHT + tva;
    return { lines, totalHT, tva, ttc, vatRate };
  }, [bc]);

  async function runDecision(payload: DecisionPayload) {
    try {
      setBusy(true);
      await onDecision(payload);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("w-full", darkMode ? "text-white" : "text-gray-900")}>
      {/* Tabs bar */}
      <div className={cn(
        "flex gap-6 border-b overflow-x-auto px-6",
        darkMode ? "border-white/10" : "border-gray-200"
      )}>
        <TabButton 
          active={tab === "analyse"} 
          onClick={() => setTab("analyse")}
          icon={Shield}
          darkMode={darkMode}
        >
          Analyse BMO
        </TabButton>
        <TabButton 
          active={tab === "details"} 
          onClick={() => setTab("details")}
          icon={FileText}
          darkMode={darkMode}
        >
          Détails
        </TabButton>
        <TabButton 
          active={tab === "documents"} 
          onClick={() => setTab("documents")}
          icon={FileText}
          darkMode={darkMode}
        >
          Documents {counts.docsMissing > 0 && <CountBadge>{counts.docsMissing}</CountBadge>}
        </TabButton>
        <TabButton 
          active={tab === "historique"} 
          onClick={() => setTab("historique")}
          icon={History}
          darkMode={darkMode}
        >
          Historique {counts.histCount > 0 && <CountBadge>{counts.histCount}</CountBadge>}
        </TabButton>
        <TabButton 
          active={tab === "risques"} 
          onClick={() => setTab("risques")}
          icon={AlertTriangle}
          darkMode={darkMode}
        >
          Risques {counts.riskCount > 0 && <CountBadge>{counts.riskCount}</CountBadge>}
        </TabButton>
        
        {/* Bouton Audit complet (loupe) */}
        <button
          onClick={async () => {
            // Lancer l'audit complet
            const context: BCAuditContext = {
              executedBy: 'BMO-USER',
              executedByRole: 'BMO',
              deepAudit: true,
              checkBudget: true,
              checkSupplier: true,
              checkCompliance: true,
              projectBudget: bc.projetDetails ? {
                total: bc.projetDetails.budgetTotal || 0,
                used: bc.projetDetails.budgetUtilise || 0,
                remaining: bc.projetDetails.budgetRestant || 0,
              } : undefined,
              supplierHistory: bc.fournisseurDetails ? {
                totalOrders: bc.fournisseurDetails.historiqueCommandes || 0,
                reliability: bc.fournisseurDetails.fiabilite || 'moyen',
              } : undefined,
            };
            
            const report = await runBCAudit(bc, context);
            setAuditReport(report);
            setTab("analyse"); // Revenir à l'onglet Analyse pour voir les résultats
            
            addToast(
              report.blocking 
                ? `🔍 Audit terminé : ${report.anomalies.length} anomalie(s) bloquante(s)`
                : `🔍 Audit terminé : Score ${report.score}/100`,
              report.blocking ? 'error' : 'success'
            );
            
            addActionLog({
              userId: 'BMO-USER',
              userName: 'BMO-USER',
              userRole: 'BMO',
              action: 'audit',
              module: 'validation-bc',
              targetId: bc.id,
              targetType: 'Bon de commande',
              targetLabel: bc.objet,
              details: `Audit complet exécuté. Score: ${report.score}/100, Risque: ${report.riskLevel}, Bloquant: ${report.blocking}`,
              bureau: 'BMO',
            });
          }}
          className={cn(
            "ml-auto px-3 py-2 text-xs font-medium flex items-center gap-2 rounded-lg transition-colors",
            darkMode 
              ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" 
              : "bg-blue-100 text-blue-600 hover:bg-blue-200"
          )}
          title="Lancer un audit complet (loupe)"
        >
          <Search className="w-4 h-4" />
          Audit complet
        </button>
      </div>

      {/* Contenu avec ref pour reset scroll */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-5" 
        style={{ scrollbarWidth: 'thin', scrollbarGutter: 'stable' }}
      >
        {tab === "analyse" && (
          <AnalyseTab
            originBureau={bc.bureauEmetteur || "BA"}
            escalationReasons={analysis.escalationReasons}
            evaluatedRules={analysis.bmoChecks.map(check => ({
              id: check.id,
              label: check.label,
              result: check.status === 'passed' ? 'not_triggered' as const : 'triggered' as const,
            }))}
            checks={analysis.bmoChecks}
            recommendation={{
              decision: analysis.automatedDecision || 'approve',
              risk: analysis.riskLevel,
              summary: recommendation.recommendation || 'Aucune recommandation spécifique',
            }}
            auditReport={auditReport}
            darkMode={darkMode}
          />
        )}

        {tab === "details" && (
          <DetailsTab 
            bc={bc} 
            totals={totals} 
            darkMode={darkMode}
          />
        )}

        {tab === "documents" && (
          <DocumentsTab 
            documents={documents} 
            bc={bc}
            darkMode={darkMode}
          />
        )}

        {tab === "historique" && (
          <HistoryTab 
            events={history} 
            darkMode={darkMode}
          />
        )}

        {tab === "risques" && (
          <RisksTab 
            risks={risks} 
            darkMode={darkMode}
          />
        )}
      </div>

      {/* Action bar */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-2 gap-3">
          <Button
            disabled={busy || isAuditRequiredForValidation(bc, auditReport)}
            variant="success"
            className="h-12 font-semibold"
            onClick={() => runDecision({ decision: "approve" })}
            title={
              isAuditRequiredForValidation(bc, auditReport)
                ? auditReport?.blocking
                  ? `Audit bloquant : ${auditReport.blockingReasons?.join(', ') || 'Raisons non spécifiées'}`
                  : "L'audit complet doit être exécuté avant validation"
                : "Valider le bon de commande"
            }
          >
            ✓ Valider
            {isAuditRequiredForValidation(bc, auditReport) && (
              <AlertTriangle className="w-4 h-4 ml-2 text-amber-400" />
            )}
          </Button>

          <Button
            disabled={busy}
            variant="destructive"
            className="h-12 font-semibold"
            onClick={() => runDecision({ decision: "reject", reason: "Motif obligatoire" })}
          >
            ✕ Refuser
          </Button>

          <Button
            disabled={busy}
            variant="warning"
            className="h-12 font-semibold"
            onClick={() => runDecision({ decision: "request_complement", reason: "Complément requis", deadline: "2026-01-10" })}
          >
            Demander complément
          </Button>

          <Button
            disabled={busy}
            variant="secondary"
            className="h-12 font-semibold"
            onClick={() => runDecision({ decision: "escalate", reason: "Décision stratégique", target: "dg" })}
          >
            ⬆️ Escalader
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI petites briques ---------- */

function TabButton({ 
  active, 
  onClick, 
  children, 
  icon: Icon,
  darkMode 
}: { 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  darkMode: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative py-4 px-2 text-sm font-medium flex items-center gap-2 transition-colors",
        active 
          ? darkMode ? "text-cyan-300" : "text-blue-600"
          : darkMode ? "text-white/60 hover:text-white/80" : "text-gray-600 hover:text-gray-900"
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
      {active && (
        <span className={cn(
          "absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full",
          darkMode ? "bg-cyan-400/80" : "bg-blue-600"
        )} />
      )}
    </button>
  );
}

function CountBadge({ children }: { children: React.ReactNode }) {
  return (
    <Badge variant="default" className="ml-2 text-[10px] px-1.5 py-0">
      {children}
    </Badge>
  );
}

/* ---------- Onglets ---------- */

function AnalyseTab({
  originBureau,
  escalationReasons,
  evaluatedRules,
  checks,
  recommendation,
  auditReport,
  darkMode,
}: {
  originBureau: string;
  escalationReasons: string[];
  evaluatedRules: { id: string; label: string; result: "triggered" | "not_triggered" }[];
  checks: any[];
  recommendation: { decision: string; risk: string; summary: string };
  auditReport?: BCAuditReport | null;
  darkMode: boolean;
}) {
  const originLabel = originBureau === 'BA' ? 'Bureau Achat et Approvisionnement (BA)' : 
                     originBureau === 'BF' ? 'Bureau Finance (BF)' :
                     originBureau === 'BJ' ? 'Bureau Juridique (BJ)' : originBureau;

  return (
    <div className="space-y-4">
      {/* Résultats de l'audit complet si disponible */}
      {auditReport && (
        <Card className={auditReport.blocking ? "border-red-500/30 bg-red-500/10" : (auditReport.score ?? 0) >= 80 ? "border-emerald-500/30 bg-emerald-500/10" : "border-orange-500/30 bg-orange-500/10"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-400" />
              Rapport d'Audit Complet
              {auditReport.blocking && (
                <Badge variant="urgent" className="ml-auto">Bloquant</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Score :</span>
                <Badge variant={(auditReport.score ?? 0) >= 80 ? "success" : (auditReport.score ?? 0) >= 60 ? "warning" : "urgent"}>
                  {auditReport.score ?? 0}/100
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Niveau de risque :</span>
                <Badge variant={
                  auditReport.riskLevel === 'low' ? "success" :
                  auditReport.riskLevel === 'medium' ? "warning" :
                  auditReport.riskLevel === 'high' ? "urgent" : "urgent"
                }>
                  {auditReport.riskLevel}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Vérifications :</span>
                <span className="text-sm">
                  {auditReport.checks && auditReport.checks.length > 0 
                    ? `${auditReport.checks.filter(c => c.passed).length}/${auditReport.checks.length} réussies`
                    : 'Aucune vérification'}
                </span>
              </div>
              {auditReport.anomalies && auditReport.anomalies.length > 0 && (
                <div>
                  <span className="text-sm font-semibold">Anomalies détectées :</span>
                  <ul className="mt-2 space-y-1">
                    {auditReport.anomalies.slice(0, 3).map(anomaly => (
                      <li key={anomaly.id} className="text-xs flex items-start gap-2">
                        <AlertTriangle className={cn(
                          "w-3 h-3 mt-0.5 flex-shrink-0",
                          anomaly.severity === 'error' || anomaly.severity === 'critical' ? "text-red-400" :
                          anomaly.severity === 'warning' ? "text-orange-400" : "text-blue-400"
                        )} />
                        <span className={cn(
                          darkMode ? "text-white/80" : "text-gray-700"
                        )}>
                          {anomaly.message}
                        </span>
                      </li>
                    ))}
                    {auditReport.anomalies.length > 3 && (
                      <li className="text-xs text-slate-400 italic">
                        + {auditReport.anomalies.length - 3} autre(s) anomalie(s)
                      </li>
                    )}
                  </ul>
                </div>
              )}
              {auditReport.recommendations && auditReport.recommendations.length > 0 && (
                <div>
                  <span className="text-sm font-semibold">Recommandations :</span>
                  <ul className="mt-2 space-y-1">
                    {auditReport.recommendations.map(rec => (
                      <li key={rec.id} className="text-xs flex items-start gap-2">
                        <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0 text-amber-400" />
                        <span className={cn(darkMode ? "text-white/80" : "text-gray-700")}>
                          <strong>{rec.title}</strong>: {rec.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {auditReport.blocking && auditReport.blockingReasons && auditReport.blockingReasons.length > 0 && (
                <div className={cn("p-3 rounded-lg border", darkMode ? "bg-red-500/20 border-red-500/30" : "bg-red-50 border-red-200")}>
                  <p className="text-xs font-semibold text-red-400 mb-1">⚠️ Validation bloquée</p>
                  <ul className="text-xs space-y-1">
                    {auditReport.blockingReasons.map((reason, idx) => (
                      <li key={idx} className={cn(darkMode ? "text-white/70" : "text-gray-700")}>
                        • {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className={darkMode ? "border-blue-500/30 bg-blue-500/10" : "border-blue-200 bg-blue-50"}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            Analyse BMO - Bon de Commande
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn("text-sm", darkMode ? "text-white/70" : "text-gray-700")}>
            Origine : <span className={darkMode ? "text-white font-semibold" : "text-gray-900 font-semibold"}>{originLabel}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            Pourquoi ce BC arrive au BMO ?
          </CardTitle>
        </CardHeader>
        <CardContent>
          {escalationReasons.length === 0 ? (
            <div className={cn("text-sm", darkMode ? "text-white/60" : "text-gray-600")}>
              Aucune raison d'escalade détectée.
              <div className={cn("mt-3 text-xs", darkMode ? "text-white/50" : "text-gray-500")}>Règles évaluées :</div>
              <ul className="mt-2 space-y-1">
                {evaluatedRules.map(r => (
                  <li key={r.id} className={cn("text-sm flex justify-between", darkMode ? "text-white/70" : "text-gray-700")}>
                    <span>{r.label}</span>
                    <Badge variant={r.result === "triggered" ? "warning" : "success"} className="text-xs">
                      {r.result === "triggered" ? "Déclenchée" : "Non déclenchée"}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ul className="space-y-2 text-sm">
              {escalationReasons.map((x, i) => (
                <li key={i} className={cn(darkMode ? "text-white/80" : "text-gray-700")}>• {x}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Ce que le BMO doit vérifier
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Toujours afficher un tableau de vérifications, même si vide */}
          {checks.length === 0 ? (
            <div className="overflow-hidden rounded-xl border border-slate-700/30">
              <table className="w-full text-sm">
                <thead className={cn(darkMode ? "bg-white/5 text-white/70" : "bg-gray-100 text-gray-700")}>
                  <tr>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Contrôle</th>
                    <th className="text-left p-3">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={cn("border-t", darkMode ? "border-white/10" : "border-gray-200")}>
                    <td colSpan={3} className={cn("p-4 text-center", darkMode ? "text-white/60" : "text-gray-600")}>
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                        <span className="text-sm italic">Toutes les vérifications sont conformes</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-700/30">
              <table className="w-full text-sm">
                <thead className={cn(darkMode ? "bg-white/5 text-white/70" : "bg-gray-100 text-gray-700")}>
                  <tr>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Contrôle</th>
                    <th className="text-left p-3">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {checks.map(c => (
                    <tr key={c.id} className={cn("border-t", darkMode ? "border-white/10" : "border-gray-200")}>
                      <td className={cn("p-3", darkMode ? "text-white/70" : "text-gray-600")}>{c.type || 'N/A'}</td>
                      <td className={cn("p-3", darkMode ? "text-white" : "text-gray-900")}>{c.label}</td>
                      <td className="p-3">
                        <StatusPill status={c.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={darkMode ? "border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10" : "border-purple-200 bg-purple-50"}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            Recommandation de décision BMO
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Badge 
              variant={
                recommendation.risk === 'critical' ? 'urgent' :
                recommendation.risk === 'high' ? 'warning' :
                recommendation.risk === 'medium' ? 'info' : 'success'
              }
              className="text-xs"
            >
              Risque: {recommendation.risk}
            </Badge>
            <Badge variant="info" className="text-xs">
              Décision auto: {recommendation.decision}
            </Badge>
          </div>
          <div className={cn("text-sm", darkMode ? "text-white/80" : "text-gray-700")}>
            {recommendation.summary}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailsTab({
  bc,
  totals,
  darkMode,
}: {
  bc: EnrichedBC;
  totals: { lines: BCLine[]; totalHT: number; tva: number; ttc: number; vatRate: number };
  darkMode: boolean;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Fiche Bon de Commande</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info label="BC" value={bc.id} darkMode={darkMode} />
            <Info label="Date" value={safeFormatDate(bc.dateEmission)} darkMode={darkMode} />
            <Info label="Fournisseur" value={bc.fournisseur} darkMode={darkMode} />
            <Info label="Statut" value={getStatusLabel(bc.status)} darkMode={darkMode} />
            <Info label="Mode de paiement" value={bc.paiement?.mode || "—"} darkMode={darkMode} />
            <Info label="Adresse de livraison" value={bc.livraison?.adresse || "—"} darkMode={darkMode} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Lignes du BC</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-xl border border-slate-700/30">
            <table className="w-full text-sm">
              <thead className={cn(darkMode ? "bg-white/5 text-white/70" : "bg-gray-100 text-gray-700")}>
                <tr>
                  <th className="text-left p-3 w-[14%]">Code</th>
                  <th className="text-right p-3 w-[10%]">Qté</th>
                  <th className="text-left p-3">Désignation</th>
                  <th className="text-right p-3 w-[16%]">PU HT</th>
                  <th className="text-right p-3 w-[16%]">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {totals.lines.map((l, idx) => (
                  <tr key={idx} className={cn("border-t", darkMode ? "border-white/10" : "border-gray-200")}>
                    <td className={cn("p-3", darkMode ? "text-white/70" : "text-gray-600")}>{l.code ?? "—"}</td>
                    <td className={cn("p-3 text-right", darkMode ? "text-white" : "text-gray-900")}>{l.qty ?? "—"}</td>
                    <td className={cn("p-3", darkMode ? "text-white" : "text-gray-900")}>{l.designation}</td>
                    <td className={cn("p-3 text-right", darkMode ? "text-white/80" : "text-gray-700")}>
                      {l.unitPriceHT?.toLocaleString("fr-FR") ?? "—"}
                    </td>
                    <td className={cn("p-3 text-right font-semibold", darkMode ? "text-white" : "text-gray-900")}>
                      {l.totalHT?.toLocaleString("fr-FR") ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Totaux & TVA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Total HT" value={totals.totalHT.toLocaleString("fr-FR")} darkMode={darkMode} />
            <Info 
              label={`TVA ${(totals.vatRate * 100).toLocaleString("fr-FR")}%`} 
              value={totals.tva.toLocaleString("fr-FR")} 
              darkMode={darkMode}
            />
            <Info label="Total TTC" value={totals.ttc.toLocaleString("fr-FR")} darkMode={darkMode} />
          </div>
        </CardContent>
      </Card>

      {bc.projetDetails?.budgetTotal && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Budget (avant / après)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info label="Budget avant" value={bc.projetDetails.budgetTotal.toLocaleString("fr-FR")} darkMode={darkMode} />
              <Info 
                label="Budget après" 
                value={(bc.projetDetails.budgetTotal + totals.ttc).toLocaleString("fr-FR")} 
                darkMode={darkMode}
              />
              <Info 
                label="Reste" 
                value={(bc.projetDetails.budgetRestant || 0).toLocaleString("fr-FR")} 
                darkMode={darkMode}
              />
              <Info 
                label="% utilisé" 
                value={`${(bc.projetDetails.avancement || 0).toFixed(1)}%`} 
                darkMode={darkMode}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DocumentsTab({ 
  documents, 
  bc,
  darkMode 
}: { 
  documents: BCDoc[]; 
  bc: EnrichedBC;
  darkMode: boolean;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Documents du BC</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {documents.length === 0 ? (
              <div className={cn("text-sm", darkMode ? "text-white/60" : "text-gray-600")}>
                Aucun document lié.
              </div>
            ) : (
              documents.map(d => (
                <div 
                  key={d.id} 
                  className={cn(
                    "flex items-center justify-between rounded-xl border p-3",
                    darkMode ? "border-white/10" : "border-gray-200"
                  )}
                >
                  <div className={darkMode ? "text-white" : "text-gray-900"}>
                    <div className="font-semibold">{d.name}</div>
                    <div className={cn("text-xs", darkMode ? "text-white/50" : "text-gray-500")}>
                      {d.required ? "Requis" : "Optionnel"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={d.status === "present" ? "passed" : d.status === "expired" ? "warning" : "failed"} />
                    {d.url && (
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Prévisualiser
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Aperçu Bon de commande (format papier)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "rounded-xl overflow-hidden border",
            darkMode ? "border-white/10 bg-black/20" : "border-gray-200 bg-gray-50"
          )}>
            <BCDocumentView bc={bc} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HistoryTab({ events, darkMode }: { events: BCAudit[]; darkMode: boolean }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Historique & Traçabilité</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className={cn("text-sm", darkMode ? "text-white/60" : "text-gray-600")}>
              Aucun événement enregistré.
            </div>
          ) : (
            <ol className="space-y-3">
              {events.map(e => (
                <li 
                  key={e.id} 
                  className={cn(
                    "rounded-xl border p-3",
                    darkMode ? "border-white/10" : "border-gray-200"
                  )}
                >
                  <div className={cn("flex justify-between text-sm", darkMode ? "text-white" : "text-gray-900")}>
                    <span className="font-semibold">{e.action}</span>
                    <span className={darkMode ? "text-white/50" : "text-gray-500"}>{e.at}</span>
                  </div>
                  <div className={cn("text-sm mt-1", darkMode ? "text-white/70" : "text-gray-700")}>
                    Par : {e.by}
                  </div>
                  {e.details && (
                    <div className={cn("text-sm mt-1", darkMode ? "text-white/60" : "text-gray-600")}>
                      {e.details}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RisksTab({ risks, darkMode }: { risks: BCRisk[]; darkMode: boolean }) {
  const detected = risks.filter(r => r.status === "detected");
  const potentials = risks.filter(r => r.status === "not_detected");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Risques détectés</CardTitle>
        </CardHeader>
        <CardContent>
          {detected.length === 0 ? (
            <div className="text-emerald-200 text-sm">Aucun risque détecté ✅</div>
          ) : (
            <div className="space-y-2">
              {detected.map(r => (
                <div 
                  key={r.id} 
                  className={cn(
                    "rounded-xl border p-3",
                    darkMode ? "border-white/10" : "border-gray-200"
                  )}
                >
                  <div className="flex justify-between">
                    <div className={cn("font-semibold", darkMode ? "text-white" : "text-gray-900")}>
                      {r.label}
                    </div>
                    <Badge 
                      variant={
                        r.level === 'critical' ? 'urgent' :
                        r.level === 'high' ? 'warning' :
                        r.level === 'medium' ? 'info' : 'success'
                      }
                      className="text-xs"
                    >
                      {r.level}
                    </Badge>
                  </div>
                  {r.note && (
                    <div className={cn("text-sm mt-1", darkMode ? "text-white/60" : "text-gray-600")}>
                      {r.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Risques standards (non détectés)</CardTitle>
        </CardHeader>
        <CardContent>
          {potentials.length === 0 ? (
            <div className={cn("text-sm", darkMode ? "text-white/60" : "text-gray-600")}>
              Liste standard non configurée.
            </div>
          ) : (
            <ul className="space-y-2 text-sm">
              {potentials.map(r => (
                <li 
                  key={r.id} 
                  className={cn(
                    "flex justify-between rounded-xl border p-3",
                    darkMode ? "border-white/10" : "border-gray-200"
                  )}
                >
                  <span className={darkMode ? "text-white/80" : "text-gray-700"}>{r.label}</span>
                  <span className="text-emerald-200">Non détecté</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------- Helpers ---------- */

function Info({ label, value, darkMode }: { label: string; value: React.ReactNode; darkMode: boolean }) {
  return (
    <div className={cn(
      "rounded-xl border p-3",
      darkMode ? "border-white/10 bg-black/10" : "border-gray-200 bg-gray-50"
    )}>
      <div className={cn("text-xs", darkMode ? "text-white/50" : "text-gray-500")}>{label}</div>
      <div className={cn("text-sm font-semibold mt-1", darkMode ? "text-white" : "text-gray-900")}>
        {value}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: "passed" | "failed" | "warning" | "pending" }) {
  const variants = {
    passed: { variant: 'success' as const, label: 'OK' },
    failed: { variant: 'urgent' as const, label: 'KO' },
    warning: { variant: 'warning' as const, label: 'Alerte' },
    pending: { variant: 'default' as const, label: 'En attente' },
  };
  const config = variants[status];
  return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
}

