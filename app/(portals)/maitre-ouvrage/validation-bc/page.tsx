'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Logger } from '@/lib/services/logger';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import {
  PilotageBanner,
  SmartFilters,
  ValidationBCModal,
  RejectBCModal,
  FacturePilotageBanner,
  ValidationFactureModal,
  BCDetailsPanel,
  FactureDetailsPanel,
  AvenantPilotageBanner,
  ValidationAvenantModal,
  AvenantDetailsPanel,
  ValidationHeader,
  IntelligentSearchBar,
  AIAssistantModal,
  EnhancedDocumentDetailsModal,
  EnhancedStatsBanner,
  BCComparisonModal,
  BatchActionsModal,
  type TabType,
} from '@/components/features/bmo/validation-bc';
import { BCRowActions } from '@/components/features/bmo/validation-bc/BCRowActions';
import {
  bcToValidate,
  facturesToValidate,
  avenantsToValidate,
  raciMatrix,
  projects,
  decisions,
  facturesRecues,
  avenants,
  financials,
} from '@/lib/data';
import { enrichedBCs, enrichedFactures, enrichedAvenants } from '@/lib/data/enriched-documents.mock';
import { verifyBC, verifyFacture, verifyAvenant } from '@/lib/services/document-verification.service';
import type { PurchaseOrder, Invoice, Amendment } from '@/lib/types/bmo.types';
import type { 
  EnrichedBC, 
  EnrichedFacture, 
  EnrichedAvenant,
  DocumentSignature,
  DocumentStatus 
} from '@/lib/types/document-validation.types';
import { Eye, CheckCircle, XCircle, FileText, TrendingUp, AlertTriangle, MessageSquare, Clock, Search, GitCompare, Layers } from 'lucide-react';
import { usePageNavigation, useCrossPageLinks } from '@/hooks/usePageNavigation';
import { useAutoSyncCounts } from '@/hooks/useAutoSync';
import { runBCAudit, isAuditRequiredForValidation } from '@/lib/services/bc-audit.service';
import type { BCAuditReport, BCAuditContext } from '@/lib/types/bc-workflow.types';
import { convertEnrichedBCToBonCommande } from '@/lib/utils/bc-converter';
import { useBcAudit } from '@/ui/hooks/useBcAudit';
import { getStatusBadgeConfig } from '@/lib/utils/status-utils';

// =========================
// Utils robustes (money/date)
// =========================
const parseMoney = (v: unknown): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const raw = String(v ?? '')
    .replace(/\s/g, '')
    .replace(/FCFA|XOF|F\s?CFA/gi, '')
    .replace(/[^\d,.-]/g, '');
  // Cas courants: "2,150,000" / "2 150 000" / "2150000"
  const normalized = raw.replace(/,/g, '');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
};

const formatFCFA = (v: unknown): string => {
  const n = parseMoney(v);
  return `${n.toLocaleString('fr-FR')} FCFA`;
};

const parseFRDate = (d?: string | null): Date | null => {
  if (!d) return null;
  const parts = d.split('/');
  if (parts.length !== 3) return null;
  const [dd, mm, yy] = parts.map((x) => Number(x));
  if (!dd || !mm || !yy) return null;
  return new Date(yy, mm - 1, dd);
};

// Utilitaire pour générer un hash SHA3-256 simulé
const generateSHA3Hash = (data: string): string => {
  let hash = 0;
  const timestamp = Date.now();
  const combined = `${data}-${timestamp}`;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hexHash = Math.abs(hash).toString(16).padStart(16, '0');
  return `SHA3-256:${hexHash}${Math.random().toString(16).slice(2, 10)}`;
};

// Vérifier si un bureau a le droit de valider selon RACI
const checkRACIPermission = (bureau: string, activity: string): { allowed: boolean; role: string } => {
  const row = raciMatrix.find((r) => r.activity === activity);
  if (!row) return { allowed: false, role: 'N/A' };
  
  const bureauKey = bureau as keyof typeof row;
  const role = row[bureauKey] as string;
  
  // Seuls R (Responsible) et A (Accountable) peuvent valider
  const allowed = role === 'R' || role === 'A';
  return { allowed, role };
};

type GroupMode = 'list' | 'project' | 'priority';


export default function ValidationBCPage() {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [activeTab, setActiveTab] = useState<TabType>('bc');
  const [groupMode, setGroupMode] = useState<GroupMode>('project');
  const [selectedItem, setSelectedItem] = useState<PurchaseOrder | Invoice | Amendment | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedBC, setSelectedBC] = useState<PurchaseOrder | null>(null);
  const [selectedFacture, setSelectedFacture] = useState<Invoice | null>(null);
  type BCFilters = {
    bureau?: string[];
    priority?: string[];
    status?: string[];
    supplier?: string[];
    minAmount?: number;
    maxAmount?: number;
    dateFrom?: string; // YYYY-MM-DD
    dateTo?: string;   // YYYY-MM-DD
  };
  const [filters, setFilters] = useState<BCFilters>({});

  type GenericFilters = {
    bureau?: string[];
    status?: string[];
  };
  const [factureFilters, setFactureFilters] = useState<GenericFilters>({});
  const [showFactureValidationModal, setShowFactureValidationModal] = useState(false);
  const [showBCDetailsPanel, setShowBCDetailsPanel] = useState(false);
  const [showFactureDetailsPanel, setShowFactureDetailsPanel] = useState(false);
  const [selectedAvenant, setSelectedAvenant] = useState<Amendment | null>(null);
  const [showAvenantValidationModal, setShowAvenantValidationModal] = useState(false);
  const [showAvenantDetailsPanel, setShowAvenantDetailsPanel] = useState(false);
  const [avenantFilters, setAvenantFilters] = useState<GenericFilters>({});
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'en_attente' | 'corriges' | 'valides'>('all');
  const [factureStatusFilter, setFactureStatusFilter] = useState<'en_attente' | 'valides' | 'rejetes'>('en_attente');
  const [avenantStatusFilter, setAvenantStatusFilter] = useState<'en_attente' | 'valides' | 'rejetes'>('en_attente');
  
  // États pour l'audit BC (loupe)
  const [auditReports, setAuditReports] = useState<Record<string, { report: any; passed: boolean }>>({});

  // Utilisateur actuel (simulé - normalement depuis auth)
  const currentUser = {
    id: 'USR-001',
    name: 'A. DIALLO',
    role: 'Directeur Général',
    bureau: 'BMO',
  };

  // Fonction pour créer un EnrichedBC à partir d'un PurchaseOrder
  const createEnrichedBCFromPO = useCallback((bc: PurchaseOrder): EnrichedBC => {
    const amount = parseMoney(bc.amount);
    const dEmission = parseFRDate(bc.date);
    const dLimite = parseFRDate(bc.dateLimit);
    return {
      id: bc.id,
      fournisseur: bc.supplier,
      projet: bc.project,
      objet: bc.subject,
      montantHT: amount * 0.8333, // approx HT si TTC (20%)
      tva: 20,
      montantTTC: amount,
      dateEmission: dEmission ? dEmission.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      dateLimite: dLimite ? dLimite.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      bureauEmetteur: bc.bureau,
      status: (bc.status || 'pending') as DocumentStatus,
      demandeur: {
        nom: bc.requestedBy || 'N/A',
        fonction: 'Demandeur',
        bureau: bc.bureau,
      },
    } as EnrichedBC;
  }, []);

  // S'assurer que tous les BCs de bcToValidate ont un EnrichedBC correspondant
  const initialEnrichedBCs = useMemo(() => {
    const enrichedMap = new Map(enrichedBCs.map(bc => [bc.id, bc]));
    
    // Ajouter les BCs manquants depuis bcToValidate
    bcToValidate.forEach(bc => {
      if (!enrichedMap.has(bc.id)) {
        enrichedMap.set(bc.id, createEnrichedBCFromPO(bc));
      }
    });
    
    return Array.from(enrichedMap.values());
  }, [createEnrichedBCFromPO]);

  const [enrichedBCsState, setEnrichedBCsState] = useState<EnrichedBC[]>(initialEnrichedBCs);
  const [enrichedFacturesState, setEnrichedFacturesState] = useState<EnrichedFacture[]>(enrichedFactures);
  const [enrichedAvenantsState, setEnrichedAvenantsState] = useState<EnrichedAvenant[]>(enrichedAvenants);
  const [selectedEnrichedDoc, setSelectedEnrichedDoc] = useState<EnrichedBC | EnrichedFacture | EnrichedAvenant | null>(null);
  const [showEnhancedDetailsModal, setShowEnhancedDetailsModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<'bc' | 'facture' | 'avenant'>('bc');
  // WHY: Sélection multiple pour comparaison BC
  // WHY: Sélection multiple pour comparaison BC et actions en lot
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedBCsForComparison, setSelectedBCsForComparison] = useState<string[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showBatchActionsModal, setShowBatchActionsModal] = useState(false);
  
  // Hook pour l'audit BC
  const bcAudit = useBcAudit();
  
  // Synchronisation automatique des comptages pour la sidebar
  useAutoSyncCounts('validation-bc', () => {
    return enrichedBCsState.filter(bc => bc.status === 'pending').length +
           enrichedFacturesState.filter(f => f.status === 'pending').length +
           enrichedAvenantsState.filter(a => a.status === 'pending').length;
  }, { interval: 10000, immediate: true });

  // Vérification automatique au chargement et après modifications
  useEffect(() => {
    // Vérifier tous les BC
    const verifiedBCs = enrichedBCsState.map(bc => {
      const verification = verifyBC(bc);
      return {
        ...bc,
        verification,
        anomalies: verification.anomalies,
        status: verification.isValid ? bc.status : 'anomaly_detected' as DocumentStatus,
      };
    });
    setEnrichedBCsState(verifiedBCs);

    // Vérifier toutes les factures
    const verifiedFactures = enrichedFacturesState.map(facture => {
      const verification = verifyFacture(facture);
      return {
        ...facture,
        verification,
        anomalies: verification.anomalies,
        status: verification.isValid ? facture.status : 'anomaly_detected' as DocumentStatus,
      };
    });
    setEnrichedFacturesState(verifiedFactures);

    // Vérifier tous les avenants
    const verifiedAvenants = enrichedAvenantsState.map(avenant => {
      const verification = verifyAvenant(avenant);
      return {
        ...avenant,
        verification,
        anomalies: verification.anomalies,
        status: verification.isValid ? avenant.status : 'anomaly_detected' as DocumentStatus,
      };
    });
    setEnrichedAvenantsState(verifiedAvenants);
  }, []); // Exécuté une seule fois au montage

  // Valider un BC avec création de décision et hash
  const handleValidateBC = (bc: PurchaseOrder) => {
    // Vérifier RACI
    const raciCheck = checkRACIPermission(currentUser.bureau, 'Validation BC');
    
    if (!raciCheck.allowed && currentUser.bureau !== 'BMO') {
      addToast(`❌ RACI: Votre bureau (${currentUser.bureau}) n'est pas autorisé à valider. Rôle: ${raciCheck.role}`, 'error');
      return;
    }

    // 4. Vérifier que l'audit "loupe" est requis et passé
    const auditInfo = auditReports[bc.id];
    if (!auditInfo || !auditInfo.passed) {
      addToast('🔒 Audit "loupe" requis avant validation BMO', 'warning');
      return;
    }

    const hash = generateSHA3Hash(`${bc.id}-${currentUser.id}-validate`);
    const decisionId = `DEC-${Date.now().toString().slice(-8)}`;

    // Créer entrée dans decisions
    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'validation',
      module: 'validation-bc',
      targetId: bc.id,
      targetType: 'Bon de commande',
      targetLabel: bc.subject,
      details: `BC validé - Montant: ${bc.amount} FCFA - Decision: ${decisionId} - Hash: ${hash} - Audit: OK`,
      bureau: bc.bureau,
    });

    addToast(
      `✓ ${bc.id} validé - Hash: ${hash.slice(0, 25)}...`,
      'success'
    );
    setShowValidationModal(false);
  };

  // Filtrer les BC
  const filteredBCs = useMemo(() => {
    let filtered = [...bcToValidate];
    
    if (filters.bureau && filters.bureau.length > 0) {
      const bureauFilter = filters.bureau;
      filtered = filtered.filter(bc => bureauFilter.includes(bc.bureau));
    }
    
    if (filters.priority && filters.priority.length > 0) {
      const priorityFilter = filters.priority;
      filtered = filtered.filter(bc => priorityFilter.includes(bc.priority));
    }
    
    if (filters.status && filters.status.length > 0) {
      const statusFilter = filters.status;
      filtered = filtered.filter(bc => statusFilter.includes(bc.status));
    }
    
    if (filters.supplier && filters.supplier.length > 0) {
      const supplierFilter = filters.supplier;
      filtered = filtered.filter(bc => 
        supplierFilter.some((s: string) => bc.supplier.toLowerCase().includes(s.toLowerCase()))
      );
    }
    
    if (filters.minAmount) {
      filtered = filtered.filter(bc => {
        return parseMoney(bc.amount) >= (filters.minAmount ?? 0);
      });
    }
    
    if (filters.maxAmount) {
      filtered = filtered.filter(bc => {
        return parseMoney(bc.amount) <= (filters.maxAmount ?? Infinity);
      });
    }

    // ✅ Application réelle des filtres dateFrom/dateTo (si fournis)
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      filtered = filtered.filter((bc) => {
        const d = parseFRDate(bc.date);
        return d ? d >= from : true;
      });
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      filtered = filtered.filter((bc) => {
        const d = parseFRDate(bc.date);
        return d ? d <= to : true;
      });
    }
    
    return filtered;
  }, [filters]);

  // Rejeter un BC
  const handleRejectBC = (bc: PurchaseOrder, reason: string = 'Non conforme') => {
    const hash = generateSHA3Hash(`${bc.id}-${currentUser.id}-reject`);

    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'rejection',
      module: 'validation-bc',
      targetId: bc.id,
      targetType: 'Bon de commande',
      targetLabel: bc.subject,
      details: `BC rejeté - Motif: ${reason} - Hash: ${hash}`,
      bureau: bc.bureau,
    });

    addToast(`❌ ${bc.id} rejeté - ${reason}`, 'warning');
  };

  // Demander pièce complémentaire
  const handleRequestDocument = (bc: PurchaseOrder) => {
    const message = prompt(`Message à envoyer au bureau ${bc.bureau} pour demander des documents complémentaires:`, 'Veuillez fournir les documents manquants pour le BC ' + bc.id);
    if (message) {
      addActionLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'modification',
        module: 'validation-bc',
        targetId: bc.id,
        targetType: 'Bon de commande',
        targetLabel: bc.subject,
        details: `Demande de pièce complémentaire: ${message}`,
        bureau: bc.bureau,
      });
      addToast(`📎 Demande de pièce envoyée pour ${bc.id}`, 'success');
    }
  };

  // Escalader
  const handleEscalate = (bc: PurchaseOrder) => {
    const confirmEscalate = window.confirm(
      `Voulez-vous escalader le BC ${bc.id} vers le Directeur Général ?\n\nMotif recommandé: Montant élevé ou décision stratégique requise.`
    );
    if (confirmEscalate) {
      addActionLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'modification',
        module: 'validation-bc',
        targetId: bc.id,
        targetType: 'Bon de commande',
        targetLabel: bc.subject,
        details: 'Escalade vers DG pour validation finale',
        bureau: bc.bureau,
      });
      addToast(`⬆️ ${bc.id} escaladé vers le DG - Notification envoyée`, 'warning');
      // Simulation: redirection vers la page de suivi
      setTimeout(() => {
        addToast('Redirection vers la page de suivi des escalades', 'info');
      }, 1500);
    }
  };

  // Handler pour lancer un audit complet (icône loupe)
  const handleRunBCAudit = async (bc: EnrichedBC) => {
    try {
      // Convertir en BonCommande
      const bonCommande = convertEnrichedBCToBonCommande(bc);
      
      // 1. Vérifier que le BC est homogène (toutes les lignes ont le même familyCode que le BC)
      if (bonCommande.lines && bonCommande.lines.length > 0) {
        const isHomogeneous = bonCommande.lines.every(line => line.familyCode === bonCommande.familyCode);
        
        if (!isHomogeneous) {
          addToast('❌ BC non homogène — split requis', 'error');
          addActionLog({
            userId: currentUser.id,
            userName: currentUser.name,
            userRole: currentUser.role,
            action: 'audit',
            module: 'validation-bc',
            targetId: bc.id,
            targetType: 'Bon de commande',
            targetLabel: bc.objet,
            details: 'Tentative d\'audit bloquée : BC non homogène (lignes avec familyCode différents)',
            bureau: 'BMO',
          });
          return;
        }
      }
      
      // Préparer le contexte d'audit
      const auditContext = {
        seuilBmo: 5_000_000,
        seuilDg: 20_000_000,
        supplierBlackList: [], // Peut être enrichi depuis une source de données
        budgetRemainingByChantier: bc.projetDetails ? {
          [bc.projet]: bc.projetDetails.budgetRestant || 0,
        } : undefined,
        lastPricesBySupplierItem: undefined, // Peut être enrichi depuis une source de données
      };
      
      // Exécuter l'audit via le hook
      const domainReport = await bcAudit.run(bonCommande, auditContext);
      
      // Convertir le rapport du domaine vers BCAuditReport pour compatibilité
      const legacyReport = await runBCAudit(bc, {
        executedBy: currentUser.name,
        executedByRole: currentUser.role,
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
      });
      
      // 3. Stocker le rapport et déterminer si l'audit est passé
      const auditPassed = domainReport.recommendation === 'approve';
      setAuditReports(prev => ({
        ...prev,
        [bc.id]: { report: legacyReport, passed: auditPassed },
      }));
      
      // Mettre à jour le BC avec le rapport d'audit (WHY: calculer nextDoc avant setState pour éviter stale closure)
      const nextDoc: EnrichedBC = {
        ...bc,
        auditReport: legacyReport,
        anomalies: legacyReport.anomalies,
        status: legacyReport.blocking ? ('audit_required' as DocumentStatus) : bc.status,
      };
      
      setEnrichedBCsState(prev => prev.map(b => (b.id === bc.id ? nextDoc : b)));
      setSelectedEnrichedDoc(nextDoc);
      setSelectedDocType('bc');
      setShowEnhancedDetailsModal(true);
      
      addToast(
        domainReport.recommendation === 'reject' || domainReport.risk === 'critical'
          ? `🔍 Audit terminé : ${domainReport.anomalies.length} anomalie(s) bloquante(s) détectée(s)`
          : auditPassed
          ? `✅ Audit terminé : Validation autorisée`
          : `🔍 Audit terminé : Risque ${domainReport.risk}, Recommandation: ${domainReport.recommendation}`,
        domainReport.recommendation === 'reject' || domainReport.risk === 'critical' ? 'error' : auditPassed ? 'success' : 'warning'
      );
      
      addActionLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'audit',
        module: 'validation-bc',
        targetId: bc.id,
        targetType: 'Bon de commande',
        targetLabel: bc.objet,
        details: `Audit complet exécuté. Risque: ${domainReport.risk}, Recommandation: ${domainReport.recommendation}, Anomalies: ${domainReport.anomalies.length}, Homogène: oui`,
        bureau: 'BMO',
      });
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      Logger.error('Erreur lors de l\'audit BC', errorObj, { bcId: bc.id });
      addToast('Erreur lors de l\'exécution de l\'audit', 'error');
    }
  };

  // Contester une facture
  const handleContestFacture = (facture: Invoice) => {
    const reason = prompt(
      `Motif de contestation pour la facture ${facture.id}:`,
      'Erreur sur le montant / Produit non livré / Facture en doublon'
    );
    if (reason) {
      addActionLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'modification',
        module: 'validation-factures',
        targetId: facture.id,
        targetType: 'Facture',
        targetLabel: facture.objet,
        details: `Facture contestée - Motif: ${reason}`,
        bureau: facture.bureau,
      });
      addToast(`⚠️ Facture ${facture.id} contestée - Le bureau ${facture.bureau} a été notifié`, 'warning');
    }
  };

  // Rejeter une facture
  const handleRejectFacture = (facture: Invoice) => {
    const reason = prompt(`Motif de rejet pour la facture ${facture.id}:`, 'Non conforme / Erreur / Doublon');
    if (reason) {
      addActionLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'rejection',
        module: 'validation-factures',
        targetId: facture.id,
        targetType: 'Facture',
        targetLabel: facture.objet,
        details: `Facture rejetée - Motif: ${reason}`,
        bureau: facture.bureau,
      });
      addToast(`❌ Facture ${facture.id} rejetée - Notification envoyée`, 'error');
    }
  };

  // Gestion des filtres pour les avenants
  const handleAvenantFilterClick = (filterType: 'financier' | 'delai' | 'technique' | 'all') => {
    if (filterType === 'financier') {
      addToast('Filtrage des avenants financiers', 'info');
      // Logique de filtrage par impact
    } else if (filterType === 'delai') {
      addToast('Filtrage des avenants délai', 'info');
    } else if (filterType === 'technique') {
      addToast('Filtrage des avenants techniques', 'info');
    } else {
      setAvenantFilters({ ...avenantFilters, status: ['pending'] });
      addToast('Filtrage des avenants bloqués', 'warning');
    }
  };

  // Valider un avenant
  const handleValidateAvenant = (avenant: Amendment) => {
    const hash = generateSHA3Hash(`${avenant.id}-${currentUser.id}-validate`);

    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'validation',
      module: 'validation-avenants',
      targetId: avenant.id,
      targetType: 'Avenant',
      targetLabel: avenant.objet,
      details: `Avenant approuvé - Impact: ${avenant.impact} - Hash: ${hash}`,
      bureau: avenant.bureau,
    });

    addToast(`✓ ${avenant.id} approuvé - Hash: ${hash.slice(0, 25)}...`, 'success');
    setShowAvenantValidationModal(false);
  };

  // Rejeter un avenant
  const handleRejectAvenant = (avenant: Amendment) => {
    const reason = prompt(`Motif de rejet pour l'avenant ${avenant.id}:`, 'Justification insuffisante / Impact non acceptable');
    if (reason) {
      addActionLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'rejection',
        module: 'validation-avenants',
        targetId: avenant.id,
        targetType: 'Avenant',
        targetLabel: avenant.objet,
        details: `Avenant rejeté - Motif: ${reason}`,
        bureau: avenant.bureau,
      });
      addToast(`❌ Avenant ${avenant.id} rejeté - Notification envoyée`, 'error');
    }
  };

  // Demander modification d'un avenant
  const handleRequestModification = (avenant: Amendment) => {
    const message = prompt(`Message pour demander une modification à l'avenant ${avenant.id}:`, 'Veuillez préciser la justification / Fournir des documents complémentaires');
    if (message) {
      addActionLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'modification',
        module: 'validation-avenants',
        targetId: avenant.id,
        targetType: 'Avenant',
        targetLabel: avenant.objet,
        details: `Demande de modification: ${message}`,
        bureau: avenant.bureau,
      });
      addToast(`📝 Demande de modification envoyée pour ${avenant.id}`, 'info');
    }
  };

  // Filtrer les avenants
  // Compteurs pour avenants
  const avenantCounts = useMemo(() => {
    const enAttente = avenants.filter(av => !av.decisionBMO).length;
    const valides = avenants.filter(av => av.decisionBMO && (av.statut === 'validé' || av.statut === 'signé')).length;
    const rejetes = avenants.filter(av => av.statut === 'rejeté').length;
    return { enAttente, valides, rejetes };
  }, [avenants]);

  const filteredAvenants = useMemo(() => {
    let filtered = [...avenantsToValidate];
    
    if (avenantFilters.bureau && avenantFilters.bureau.length > 0) {
      const bureauFilter = avenantFilters.bureau;
      filtered = filtered.filter(a => bureauFilter.includes(a.bureau));
    }
    
    if (avenantFilters.status && avenantFilters.status.length > 0) {
      const statusFilter = avenantFilters.status;
      filtered = filtered.filter(a => statusFilter.includes(a.status));
    }

    // Filtre par statut BMO
    if (avenantStatusFilter === 'en_attente') {
      filtered = filtered.filter(av => !av.decisionBMO);
    } else if (avenantStatusFilter === 'valides') {
      filtered = filtered.filter(av => av.decisionBMO && (av.statut === 'validé' || av.statut === 'signé'));
    } else if (avenantStatusFilter === 'rejetes') {
      filtered = filtered.filter(av => av.statut === 'rejeté');
    }
    
    return filtered;
  }, [avenantFilters, avenantStatusFilter]);

  // Gestion des filtres depuis le bandeau de pilotage
  const handleFilterClick = (filterType: 'urgent' | 'overdue' | 'blocked') => {
    if (filterType === 'urgent') {
      setFilters({ ...filters, priority: ['urgent'] });
      addToast('Filtrage des BC urgents', 'info');
    } else if (filterType === 'overdue') {
      addToast('Filtrage des BC en retard', 'warning');
      // Logique pour les retards - on pourrait filtrer par date
      const today = new Date();
      const overdueDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      setFilters({ ...filters, dateFrom: overdueDate.toISOString().split('T')[0] });
    } else if (filterType === 'blocked') {
      setFilters({ ...filters, status: ['pending'] });
      addToast('Filtrage des BC bloqués', 'warning');
    }
  };

  // Gestion des filtres pour les factures
  const handleFactureFilterClick = (filterType: 'urgent' | 'overdue' | 'blocked') => {
    if (filterType === 'urgent') {
      addToast('Filtrage des factures à échéance', 'info');
      // Filtrer par échéance dans 7 jours
    } else if (filterType === 'overdue') {
      addToast('Filtrage des factures échues', 'warning');
      // Filtrer par date échue
    } else if (filterType === 'blocked') {
      setFactureFilters({ ...factureFilters, status: ['pending'] });
      addToast('Filtrage des factures bloquées', 'warning');
    }
  };

  // Valider une facture
  const handleValidateFacture = (facture: Invoice) => {
    const hash = generateSHA3Hash(`${facture.id}-${currentUser.id}-validate`);

    addActionLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'validation',
      module: 'validation-factures',
      targetId: facture.id,
      targetType: 'Facture',
      targetLabel: facture.objet,
      details: `Facture validée - Montant: ${facture.montant} FCFA - Hash: ${hash}`,
      bureau: facture.bureau,
    });

    addToast(`✓ ${facture.id} validée - Hash: ${hash.slice(0, 25)}...`, 'success');
    setShowFactureValidationModal(false);
  };

  // Compteurs pour factures
  const factureCounts = useMemo(() => {
    const enAttente = facturesRecues.filter(f => !f.decisionBMO).length;
    const valides = facturesRecues.filter(f => f.decisionBMO && f.statut === 'conforme' || f.statut === 'payée').length;
    const rejetes = facturesRecues.filter(f => f.statut === 'rejetée').length;
    return { enAttente, valides, rejetes };
  }, [facturesRecues]);

  // Filtrer les factures
  const filteredFactures = useMemo(() => {
    let filtered = [...facturesToValidate];
    
    if (factureFilters.bureau && factureFilters.bureau.length > 0) {
      const bureauFilter = factureFilters.bureau;
      filtered = filtered.filter(f => bureauFilter.includes(f.bureau));
    }
    
    if (factureFilters.status && factureFilters.status.length > 0) {
      const statusFilter = factureFilters.status;
      filtered = filtered.filter(f => statusFilter.includes(f.status));
    }

    // Filtre par statut BMO
    if (factureStatusFilter === 'en_attente') {
      filtered = filtered.filter(f => !f.decisionBMO);
    } else if (factureStatusFilter === 'valides') {
      filtered = filtered.filter(f => f.decisionBMO && (f.statut === 'conforme' || f.statut === 'payée'));
    } else if (factureStatusFilter === 'rejetes') {
      filtered = filtered.filter(f => f.statut === 'rejetée');
    }
    
    return filtered;
  }, [factureFilters, factureStatusFilter]);

  // Handler pour validation automatique IA
  const handleAutoValidate = (ids: string[]) => {
    ids.forEach(id => {
      const bc = bcToValidate.find(b => b.id === id);
      if (bc) {
        handleValidateBC(bc);
      }
      const facture = facturesToValidate.find(f => f.id === id);
      if (facture) {
        handleValidateFacture(facture);
      }
      const avenant = avenantsToValidate.find(a => a.id === id);
      if (avenant) {
        handleValidateAvenant(avenant);
      }
    });
  };

  // Stats pour le header
  const stats = useMemo(() => {
    // Calcul du total en attente (sans décision BMO)
    const totalEnAttente = [
      ...bcToValidate.filter(bc => !bc.decisionBMO),
      ...facturesRecues.filter(f => !f.decisionBMO),
      ...avenants.filter(av => !av.decisionBMO),
    ].reduce((sum, item) => {
      const montant = 
        'montant' in item ? parseMoney(item.montant) :
        'montantTTC' in item ? (item.montantTTC || 0) :
        'ecart' in item ? Math.abs(item.ecart || 0) :
        0;
      return sum + montant;
    }, 0);

    // Calcul de l'impact total (avec décision BMO + gains/pertes)
    const impactTotal = [
      ...bcToValidate.filter(bc => bc.decisionBMO).map(bc => parseMoney(bc.amount)),
      ...facturesRecues.filter(f => f.decisionBMO).map(f => f.montantTTC || 0),
      ...avenants.filter(av => av.decisionBMO).map(av => Math.abs(av.ecart || 0)),
      ...financials.gains.map(g => g.montant),
      ...financials.pertes.map(p => p.montant),
    ].reduce((sum, montant) => sum + (montant || 0), 0);

    return {
      bc: enrichedBCsState.length,
      factures: enrichedFacturesState.length,
      avenants: enrichedAvenantsState.length,
      total: enrichedBCsState.length + enrichedFacturesState.length + enrichedAvenantsState.length,
      urgent: enrichedBCsState.filter((bc) => bc.status === 'pending_bmo' || bc.status === 'audit_required' || bc.status === 'in_audit').length,
      totalEnAttente: totalEnAttente,
      impactTotal: impactTotal,
    };
  }, [enrichedBCsState, enrichedFacturesState, enrichedAvenantsState, bcToValidate, facturesRecues, avenants, financials]);

  // Filtrer les BC selon le statut sélectionné
  const filteredByStatus = useMemo(() => {
    if (statusFilter === 'all') return enrichedBCsState;
    if (statusFilter === 'en_attente') {
      return enrichedBCsState.filter(bc => 
        bc.status === 'pending' || bc.status === 'anomaly_detected' || bc.status === 'correction_requested'
      );
    }
    if (statusFilter === 'corriges') {
      return enrichedBCsState.filter(bc => bc.status === 'corrected');
    }
    if (statusFilter === 'valides') {
      return enrichedBCsState.filter(bc => bc.status === 'validated');
    }
    return enrichedBCsState;
  }, [enrichedBCsState, statusFilter]);

  // Grouper les BC par projet (avec filtre de statut)
  const bcByProject = useMemo(() => {
    const grouped: Record<string, EnrichedBC[]> = {};
    filteredBCs.forEach((bc) => {
      const enrichedBC = filteredByStatus.find(e => e.id === bc.id);
      if (enrichedBC) {
        const projectId = enrichedBC.projet;
        if (!grouped[projectId]) grouped[projectId] = [];
        grouped[projectId].push(enrichedBC);
      }
    });
    return grouped;
  }, [filteredBCs, filteredByStatus]);

  // Grouper par priorité
  const bcByPriority = useMemo(() => ({
    urgent: enrichedBCsState.filter((bc) => bc.status === 'anomaly_detected' || bc.status === 'correction_requested' || bc.status === 'audit_required' || bc.status === 'in_audit'),
    high: enrichedBCsState.filter((bc) => bc.status === 'pending_bmo'),
    normal: enrichedBCsState.filter((bc) => bc.status === 'validated' || bc.status === 'corrected' || bc.status === 'rejected_bmo' || bc.status === 'approved_bmo' || bc.status === 'sent_supplier' || bc.status === 'draft_ba'),
  }), [enrichedBCsState]);

  // Compteurs par statut
  const statusCounts = useMemo(() => {
    const countEnAttente = enrichedBCsState.filter(bc => 
      bc.status === 'pending' || bc.status === 'anomaly_detected' || bc.status === 'correction_requested'
    ).length;
    const countCorriges = enrichedBCsState.filter(bc => 
      bc.status === 'corrected'
    ).length;
    const countValides = enrichedBCsState.filter(bc => 
      bc.status === 'validated'
    ).length;
    return { countEnAttente, countCorriges, countValides };
  }, [enrichedBCsState]);

  // Préparer les flux financiers pour l'export
  const allFlux = useMemo(() => {
    return [
      ...financials.gains.map(g => ({ ...g, type: 'gain' as const })),
      ...financials.pertes.map(p => ({ ...p, type: 'perte' as const })),
    ];
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header fixe */}
      <div className="flex-shrink-0 space-y-4 border-b border-slate-700/30 bg-slate-900/50 backdrop-blur-sm p-4">
        <EnhancedStatsBanner
          bcs={enrichedBCsState}
          factures={enrichedFacturesState}
          avenants={enrichedAvenantsState}
        />
        
        {/* Cartes d'indicateurs BMO */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-orange-400">
                {new Intl.NumberFormat('fr-FR').format(stats.totalEnAttente)} FCFA
              </p>
              <p className="text-[10px] text-slate-400">En attente de décision BMO</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold text-emerald-400">
                {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(stats.impactTotal)} FCFA
              </p>
              <p className="text-[10px] text-slate-400">Impact total piloté</p>
            </CardContent>
          </Card>
        </div>
        
        <ValidationHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          stats={stats}
          onAIAssistantClick={() => setShowAIAssistant(true)}
        />

        {/* Barre de recherche intelligente */}
        <IntelligentSearchBar
        bcs={bcToValidate}
        factures={facturesToValidate}
        avenants={avenantsToValidate}
        activeTab={activeTab}
        onSelectBC={(bc) => {
          setActiveTab('bc');
          // Trouver l'enrichedBC correspondant ou en créer un temporaire
          const enrichedBC = enrichedBCsState.find(e => e.id === bc.id);
          let enrichedBCToShow = enrichedBC;
          
          if (!enrichedBCToShow) {
            const dEmission = parseFRDate(bc.date);
            const dLimite = parseFRDate(bc.dateLimit);
            enrichedBCToShow = {
              id: bc.id,
              fournisseur: bc.supplier,
              projet: bc.project,
              objet: bc.subject,
              montantHT: parseMoney(bc.amount) * 0.83,
              tva: 20,
              montantTTC: parseMoney(bc.amount),
              dateEmission: dEmission ? dEmission.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              dateLimite: dLimite ? dLimite.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              bureauEmetteur: bc.bureau,
              status: 'pending' as DocumentStatus,
            } as EnrichedBC;
          }
          
          setSelectedEnrichedDoc(enrichedBCToShow);
          setSelectedDocType('bc');
          setShowEnhancedDetailsModal(true);
          addToast(`Ouverture des détails de ${bc.id}`, 'info');
        }}
        onSelectFacture={(facture) => {
          setSelectedFacture(facture);
          setActiveTab('factures');
          setShowFactureDetailsPanel(true);
          addToast(`Ouverture des détails de ${facture.id}`, 'info');
        }}
        onSelectAvenant={(avenant) => {
          setSelectedAvenant(avenant);
          setActiveTab('avenants');
          setShowAvenantDetailsPanel(true);
          addToast(`Ouverture des détails de ${avenant.id}`, 'info');
        }}
      />
      </div>

      {/* Zone scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-gutter-stable">
        <div className="p-4 space-y-4">
          {/* Bandeau de pilotage */}
          {activeTab === 'bc' && (
        <PilotageBanner
          bcs={bcToValidate}
          onFilterClick={handleFilterClick}
        />
      )}

      {/* Filtres intelligents */}
      {activeTab === 'bc' && (
        <SmartFilters
          filters={filters}
          onFiltersChange={setFilters}
        />
      )}

      {/* RACI Info */}
      <div className="flex items-center gap-2 justify-end">
        <span className="text-xs text-slate-400">RACI:</span>
        <Badge variant="success">BMO = A</Badge>
        <Badge variant="info">BM = R</Badge>
      </div>

      {/* Options de vue (seulement pour BC) */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        {activeTab === 'bc' && (
          <div className="flex gap-1 items-center">
            <Button size="xs" variant={groupMode === 'project' ? 'default' : 'ghost'} onClick={() => setGroupMode('project')}>
              Par projet
            </Button>
            <Button size="xs" variant={groupMode === 'priority' ? 'default' : 'ghost'} onClick={() => setGroupMode('priority')}>
              Par priorité
            </Button>
            <Button size="xs" variant={groupMode === 'list' ? 'default' : 'ghost'} onClick={() => setGroupMode('list')}>
              Liste
            </Button>
            {/* Mode sélection pour comparaison */}
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-700/30">
              <Button
                size="xs"
                variant={selectionMode ? 'default' : 'ghost'}
                onClick={() => {
                  setSelectionMode(!selectionMode);
                  if (selectionMode) {
                    setSelectedBCsForComparison([]);
                  }
                }}
              >
                <GitCompare className="w-3 h-3 mr-1" />
                Sélection ({selectedBCsForComparison.length})
              </Button>
              {selectedBCsForComparison.length >= 2 && selectedBCsForComparison.length <= 3 && (
                <Button
                  size="xs"
                  variant="info"
                  onClick={() => setShowComparisonModal(true)}
                >
                  <GitCompare className="w-3 h-3 mr-1" />
                  Comparer ({selectedBCsForComparison.length})
                </Button>
              )}
              {selectedBCsForComparison.length >= 1 && (
                <Button
                  size="xs"
                  variant="default"
                  onClick={() => setShowBatchActionsModal(true)}
                >
                  <Layers className="w-3 h-3 mr-1" />
                  Actions en lot ({selectedBCsForComparison.length})
                </Button>
              )}
            </div>
          </div>
        )}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            const rows = [
              // Header
              ['Type', 'ID', 'Projet', 'Montant', 'Statut', 'Origine décisionnelle', 'ID décision', 'Rôle RACI', 'Hash', 'Commentaire'],
              // BC
              ...enrichedBCsState.map(bc => {
                const project = projects.find(p => p.id === bc.projet);
                return [
                  'BC',
                  bc.id,
                  project?.name || bc.projet,
                  bc.montantTTC.toString(),
                  bc.status,
                  bc.decisionBMO?.origin || 'Hors périmètre BMO',
                  bc.decisionBMO?.decisionId || '',
                  bc.decisionBMO?.validatorRole || '',
                  bc.decisionBMO?.hash || '',
                  bc.decisionBMO?.comment || ''
                ];
              }),
              // Factures
              ...facturesRecues.map(f => [
                'Facture',
                f.id,
                f.chantier,
                f.montantTTC.toString(),
                f.statut,
                f.decisionBMO?.origin || 'Hors périmètre BMO',
                f.decisionBMO?.decisionId || '',
                f.decisionBMO?.validatorRole || '',
                f.decisionBMO?.hash || '',
                f.decisionBMO?.comment || ''
              ]),
              // Avenants
              ...avenants.map(av => [
                'Avenant',
                av.id,
                av.chantier,
                av.ecart.toString(),
                av.statut,
                av.decisionBMO?.origin || 'Hors périmètre BMO',
                av.decisionBMO?.decisionId || '',
                av.decisionBMO?.validatorRole || '',
                av.decisionBMO?.hash || '',
                av.decisionBMO?.comment || ''
              ]),
              // Flux
              ...allFlux.map(flux => [
                flux.type === 'gain' ? 'Gain' : 'Perte',
                flux.id,
                flux.projetName || '',
                flux.montant.toString(),
                flux.decisionBMO ? 'Validé' : 'Non piloté',
                flux.decisionBMO?.origin || 'Hors périmètre BMO',
                flux.decisionBMO?.decisionId || '',
                flux.decisionBMO?.validatorRole || '',
                flux.decisionBMO?.hash || '',
                flux.decisionBMO?.comment || ''
              ])
            ];

            const csvContent = rows.map(row => row.join(';')).join('\n');
            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `validation_bmo_unifie_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addToast('✅ Export unifié généré (traçabilité RACI incluse)', 'success');
          }}
        >
          📊 Exporter tout
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            // ---- Code d'export unifié (copier-coller ci-dessous) ----
            const rows = [
              ['Type', 'ID', 'Projet/Chantier', 'Montant (FCFA)', 'Statut', 'Origine décision', 'ID décision', 'Rôle RACI', 'Hash', 'Commentaire BMO'],
              
              // Bons de commande
              ...bcToValidate.map(bc => [
                'BC',
                bc.id,
                bc.project || '',
                bc.amount || '0',
                bc.status || '',
                bc.decisionBMO?.origin || 'Hors BMO',
                bc.decisionBMO?.decisionId || '',
                bc.decisionBMO?.validatorRole || '',
                bc.decisionBMO?.hash || '',
                `"${bc.decisionBMO?.comment || ''}"`,
              ]),
              
              // Factures
              ...facturesRecues.map(f => [
                'Facture',
                f.id,
                f.chantier || '',
                f.montantTTC.toString(),
                f.statut,
                f.decisionBMO?.origin || 'Hors BMO',
                f.decisionBMO?.decisionId || '',
                f.decisionBMO?.validatorRole || '',
                f.decisionBMO?.hash || '',
                `"${f.decisionBMO?.comment || f.commentaire || ''}"`,
              ]),
              
              // Avenants
              ...avenants.map(av => [
                'Avenant',
                av.id,
                av.chantier || '',
                av.ecart.toString(),
                av.statut,
                av.decisionBMO?.origin || 'Hors BMO',
                av.decisionBMO?.decisionId || '',
                av.decisionBMO?.validatorRole || '',
                av.decisionBMO?.hash || '',
                `"${av.decisionBMO?.comment || ''}"`,
              ]),
            ];

            const csvContent = rows.map(row => row.join(';')).join('\n');
            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `validation_bmo_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addToast('✅ Export avec traçabilité RACI généré', 'success');
          }}
        >
          📊 Export BMO (CSV RACI)
        </Button>
      </div>

      {/* Tab BC */}
      {activeTab === 'bc' && (
        <div className="space-y-4">
          {/* Onglets de filtrage par statut */}
          <div className="flex gap-2 p-2 rounded-lg bg-slate-800/50">
            <button 
              onClick={() => setStatusFilter('all')}
              className={cn(
                'px-3 py-1 rounded-md text-xs transition-colors',
                statusFilter === 'all' 
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                  : 'text-slate-400 hover:bg-slate-700/50'
              )}
            >
              📋 Tous ({enrichedBCsState.length})
            </button>
            <button 
              onClick={() => setStatusFilter('en_attente')}
              className={cn(
                'px-3 py-1 rounded-md text-xs transition-colors',
                statusFilter === 'en_attente' 
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                  : 'text-slate-400 hover:bg-slate-700/50'
              )}
            >
              ⏳ En attente ({statusCounts.countEnAttente})
            </button>
            <button 
              onClick={() => setStatusFilter('corriges')}
              className={cn(
                'px-3 py-1 rounded-md text-xs transition-colors',
                statusFilter === 'corriges' 
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                  : 'text-slate-400 hover:bg-slate-700/50'
              )}
            >
              🛠️ Corrigés ({statusCounts.countCorriges})
            </button>
            <button 
              onClick={() => setStatusFilter('valides')}
              className={cn(
                'px-3 py-1 rounded-md text-xs transition-colors',
                statusFilter === 'valides' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'text-slate-400 hover:bg-slate-700/50'
              )}
            >
              ✅ Validés ({statusCounts.countValides})
            </button>
          </div>
          
          {/* Vue groupée par projet */}
          {groupMode === 'project' && (
            <div className="space-y-4">
              {Object.entries(bcByProject).map(([projectId, bcs]) => {
                const project = projects.find((p) => p.id === projectId);
                return (
                  <Card key={projectId}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-orange-400">{projectId}</span>
                          <span>{project?.name || 'Projet inconnu'}</span>
                          <Badge variant="info">{bcs.length} BC</Badge>
                        </div>
                        {project && (
                          <span className="text-xs text-slate-400">
                            Budget: {project.budget} • Avancement: {project.progress}%
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto max-h-[600px] overflow-y-auto overscroll-contain">
                        <table className="w-full text-xs min-w-[800px]">
                          <thead className="sticky top-0 z-10">
                            <tr className={darkMode ? 'bg-slate-700/90 backdrop-blur-sm' : 'bg-gray-100'}>
                              <th className="px-3 py-3 text-left font-bold text-amber-500 sticky left-0 bg-inherit z-10 min-w-[120px]">BC</th>
                              <th className="px-3 py-3 text-left font-bold text-amber-500 min-w-[200px]">Objet</th>
                              <th className="px-3 py-3 text-left font-bold text-amber-500 min-w-[150px]">Fournisseur</th>
                              <th className="px-3 py-3 text-left font-bold text-amber-500 min-w-[120px]">Montant</th>
                              <th className="px-3 py-3 text-left font-bold text-amber-500 min-w-[100px]">Statut</th>
                              <th className="px-3 py-3 text-left font-bold text-amber-500 min-w-[100px]">Anomalies</th>
                              <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Décision BMO</th>
                              <th className="px-3 py-3 text-left font-bold text-amber-500 min-w-[180px]">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(groupMode === 'project' 
                              ? bcs.filter(bc => filteredByStatus.some(e => e.id === bc.id))
                              : filteredBCs.map(bc => {
                                  const enriched = filteredByStatus.find(e => e.id === bc.id);
                                  return enriched || null;
                                }).filter((enriched): enriched is EnrichedBC => enriched !== null)
                            ).map((enrichedBC) => {
                              const bc = bcToValidate.find(b => b.id === enrichedBC.id);
                              const anomaliesCount = enrichedBC?.anomalies?.filter(a => !a.resolved).length || 0;
                              const status = enrichedBC?.status || 'pending';
                              const montant = enrichedBC?.montantTTC ?? 0;
                              return (
                              <tr key={enrichedBC.id} className={cn(
                                'border-t transition-colors hover:bg-slate-700/20',
                                darkMode ? 'border-slate-700/50' : 'border-gray-100',
                                status === 'anomaly_detected' && 'bg-red-500/5',
                                status === 'validated' && 'bg-emerald-500/5'
                              )}>
                                <td className="px-3 py-3 sticky left-0 bg-inherit z-10">
                                  <span className="font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                                    {enrichedBC.id}
                                  </span>
                                </td>
                                <td className="px-3 py-3 max-w-[200px]">
                                  <div className="truncate" title={enrichedBC.objet}>
                                    {enrichedBC.objet}
                                  </div>
                                </td>
                                <td className="px-3 py-3">
                                  <div className="truncate max-w-[150px]" title={enrichedBC.fournisseur}>
                                    {enrichedBC.fournisseur}
                                  </div>
                                </td>
                                <td className="px-3 py-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                                  {formatFCFA(montant)}
                                </td>
                                <td className="px-3 py-3">
                                  {/* WHY: Utiliser mapping centralisé pour cohérence UI */}
                                  {(() => {
                                    const config = getStatusBadgeConfig(status);
                                    return (
                                      <Badge 
                                        variant={config.variant}
                                        className="text-[10px] whitespace-nowrap"
                                      >
                                        {config.label}
                                      </Badge>
                                    );
                                  })()}
                                </td>
                                <td className="px-3 py-3">
                                  {anomaliesCount > 0 ? (
                                    <Badge variant="urgent" className="text-[10px] whitespace-nowrap">
                                      <AlertTriangle className="w-3 h-3 mr-1 inline" />
                                      {anomaliesCount}
                                    </Badge>
                                  ) : enrichedBC?.verification?.isValid ? (
                                    <Badge variant="success" className="text-[10px] whitespace-nowrap">
                                      <CheckCircle className="w-3 h-3 mr-1 inline" />
                                      OK
                                    </Badge>
                                  ) : (
                                    <span className="text-xs text-slate-400">—</span>
                                  )}
                                </td>
                                <td className="px-3 py-2.5 text-xs">
                                  {enrichedBC.decisionBMO ? (
                                    <div className="flex flex-col gap-0.5">
                                      <Badge variant="default" className="text-[9px]">
                                        {enrichedBC.decisionBMO.validatorRole === 'A' ? '✅ BMO (A)' : '🔍 BMO (R)'}
                                      </Badge>
                                      {enrichedBC.decisionBMO.decisionId && (() => {
                                        const decisionId = enrichedBC.decisionBMO.decisionId;
                                        return (
                                          <Button
                                            size="xs"
                                            variant="link"
                                            className="p-0 h-auto text-blue-400"
                                            onClick={() => window.open(`/decisions?id=${decisionId}`, '_blank')}
                                          >
                                            📄 Voir
                                          </Button>
                                        );
                                      })()}
                                    </div>
                                  ) : (
                                    <Badge variant="warning" className="text-[9px]">⏳ En attente</Badge>
                                  )}
                                </td>
                                <td className="px-3 py-3">
                                  {enrichedBC ? (
                                    <BCRowActions
                                      bc={enrichedBC}
                                      auditContext={{
                                        seuilBmo: 5_000_000,
                                        seuilDg: 20_000_000,
                                        supplierBlackList: [],
                                        budgetRemainingByChantier: enrichedBC.projetDetails ? {
                                          [enrichedBC.projet]: enrichedBC.projetDetails.budgetRestant || 0,
                                        } : undefined,
                                        lastPricesBySupplierItem: undefined,
                                      }}
                                      onOpenViewer={(bcId, options) => {
                                        const bcToShow = enrichedBCsState.find(b => b.id === bcId) || enrichedBC;
                                        setSelectedEnrichedDoc({ ...bcToShow, auditReport: options?.audit });
                                        setSelectedDocType('bc');
                                        setShowEnhancedDetailsModal(true);
                                        addToast(`Ouverture des détails de ${bcId}`, 'info');
                                      }}
                                      onValidate={() => {
                                        if (bc) {
                                          handleValidateBC(bc);
                                        }
                                      }}
                                      darkMode={darkMode}
                                    />
                                  ) : (
                                    <div className="flex gap-1 flex-wrap">
                                      <Button 
                                        size="xs" 
                                        variant="info" 
                                        className="shrink-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (bc) {
                                            const enrichedBCToShow = createEnrichedBCFromPO(bc);
                                            setSelectedEnrichedDoc(enrichedBCToShow);
                                            setSelectedDocType('bc');
                                            setShowEnhancedDetailsModal(true);
                                            addToast(`Ouverture des détails de ${bc.id}`, 'info');
                                          }
                                        }}
                                        title="Voir détails"
                                      >
                                        <Eye className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Vue groupée par priorité */}
          {groupMode === 'priority' && (
            <div className="space-y-4">
              {bcByPriority.urgent.length > 0 && (
                <Card className="border-red-500/30">
                  <CardHeader className="pb-2 bg-red-500/10">
                    <CardTitle className="text-sm flex items-center gap-2 text-red-400">
                      🚨 Urgent <Badge variant="urgent">{bcByPriority.urgent.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-2">
                    {bcByPriority.urgent.map((enrichedBC) => {
                      const bc = bcToValidate.find(b => b.id === enrichedBC.id);
                      if (!bc) return null;
                      return (
                        <BCCard key={enrichedBC.id} bc={bc} darkMode={darkMode} onValidate={handleValidateBC} onReject={handleRejectBC} onRequest={handleRequestDocument} onEscalate={handleEscalate} />
                      );
                    })}
                  </CardContent>
                </Card>
              )}
              {bcByPriority.high.length > 0 && (
                <Card className="border-amber-500/30">
                  <CardHeader className="pb-2 bg-amber-500/10">
                    <CardTitle className="text-sm flex items-center gap-2 text-amber-400">
                      ⚠️ Prioritaire <Badge variant="warning">{bcByPriority.high.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-2">
                    {bcByPriority.high.map((enrichedBC) => {
                      const bc = bcToValidate.find(b => b.id === enrichedBC.id);
                      if (!bc) return null;
                      return (
                        <BCCard key={enrichedBC.id} bc={bc} darkMode={darkMode} onValidate={handleValidateBC} onReject={handleRejectBC} onRequest={handleRequestDocument} onEscalate={handleEscalate} />
                      );
                    })}
                  </CardContent>
                </Card>
              )}
              {bcByPriority.normal.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      📋 Normal <Badge variant="default">{bcByPriority.normal.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-2">
                    {bcByPriority.normal.map((enrichedBC) => {
                      const bc = bcToValidate.find(b => b.id === enrichedBC.id);
                      if (!bc) return null;
                      return (
                        <BCCard key={enrichedBC.id} bc={bc} darkMode={darkMode} onValidate={handleValidateBC} onReject={handleRejectBC} onRequest={handleRequestDocument} onEscalate={handleEscalate} />
                      );
                    })}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Vue liste */}
          {groupMode === 'list' && (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto overscroll-contain">
                  <table className="w-full text-xs min-w-[800px]">
                    <thead className="sticky top-0 z-10">
                      <tr className={darkMode ? 'bg-slate-700/90 backdrop-blur-sm' : 'bg-gray-100'}>
                        {selectionMode && (
                          <th className="px-3 py-3 text-center font-bold text-amber-500 sticky left-0 bg-inherit z-10 min-w-[40px]">
                            <input
                              type="checkbox"
                              checked={selectedBCsForComparison.length === filteredBCs.length && filteredBCs.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedBCsForComparison(filteredBCs.map(bc => bc.id));
                                } else {
                                  setSelectedBCsForComparison([]);
                                }
                              }}
                              className="w-4 h-4"
                            />
                          </th>
                        )}
                        <th className="px-3 py-3 text-left font-bold text-amber-500 sticky left-0 bg-inherit z-10 min-w-[120px]" style={{ left: selectionMode ? '40px' : '0' }}>
                          BC
                        </th>
                        <th className="px-3 py-3 text-left font-bold text-amber-500 min-w-[120px]">Projet</th>
                        <th className="px-3 py-3 text-left font-bold text-amber-500 min-w-[200px]">Objet</th>
                        <th className="px-3 py-3 text-left font-bold text-amber-500 min-w-[150px]">Fournisseur</th>
                        <th className="px-3 py-3 text-left font-bold text-amber-500 min-w-[120px]">Montant</th>
                        <th className="px-3 py-3 text-left font-bold text-amber-500 min-w-[100px]">Statut</th>
                        <th className="px-3 py-3 text-left font-bold text-amber-500 min-w-[100px]">Anomalies</th>
                        <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-amber-500">Décision BMO</th>
                        <th className="px-3 py-3 text-left font-bold text-amber-500 min-w-[100px]">Priorité</th>
                        <th className="px-3 py-3 text-left font-bold text-amber-500 min-w-[180px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBCs.map((bc) => {
                        const enrichedBC = enrichedBCsState.find(e => e.id === bc.id);
                        const anomaliesCount = enrichedBC?.anomalies?.filter(a => !a.resolved).length || 0;
                        const status = enrichedBC?.status || 'pending';
                        return (
                        <tr key={bc.id} className={cn(
                          'border-t transition-colors hover:bg-slate-700/20',
                          darkMode ? 'border-slate-700/50' : 'border-gray-100',
                          status === 'anomaly_detected' && 'bg-red-500/5',
                          status === 'validated' && 'bg-emerald-500/5',
                          selectedBCsForComparison.includes(bc.id) && 'bg-blue-500/10 border-blue-500/30'
                        )}>
                          {selectionMode && (
                            <td className="px-3 py-3 text-center sticky left-0 bg-inherit z-10">
                              <input
                                type="checkbox"
                                checked={selectedBCsForComparison.includes(bc.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    if (selectedBCsForComparison.length < 3) {
                                      setSelectedBCsForComparison([...selectedBCsForComparison, bc.id]);
                                    } else {
                                      addToast('Maximum 3 BCs peuvent être comparés simultanément', 'warning');
                                    }
                                  } else {
                                    setSelectedBCsForComparison(selectedBCsForComparison.filter(id => id !== bc.id));
                                  }
                                }}
                                className="w-4 h-4"
                              />
                            </td>
                          )}
                          <td className="px-3 py-3 sticky left-0 bg-inherit z-10" style={{ left: selectionMode ? '40px' : '0' }}>
                            <span className="font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                              {bc.id}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-orange-400 font-mono text-[11px]">{bc.project}</span>
                          </td>
                          <td className="px-3 py-3 max-w-[200px]">
                            <div className="truncate" title={bc.subject}>
                              {bc.subject}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="truncate max-w-[150px]" title={bc.supplier}>
                              {bc.supplier}
                            </div>
                          </td>
                          <td className="px-3 py-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                            {formatFCFA(enrichedBC?.montantTTC ?? bc.amount)}
                          </td>
                          <td className="px-3 py-3">
                            {(() => {
                              // WHY: Utiliser la fonction centralisée pour cohérence UI (remplace mapping manuel)
                              const statusConfig = getStatusBadgeConfig(status);
                              return (
                                <Badge 
                                  variant={statusConfig.variant}
                                  className="text-[10px] whitespace-nowrap"
                                >
                                  {statusConfig.label}
                                </Badge>
                              );
                            })()}
                          </td>
                          <td className="px-3 py-3">
                            {anomaliesCount > 0 ? (
                              <Badge variant="urgent" className="text-[10px] whitespace-nowrap">
                                <AlertTriangle className="w-3 h-3 mr-1 inline" />
                                {anomaliesCount}
                              </Badge>
                            ) : enrichedBC?.verification?.isValid ? (
                              <Badge variant="success" className="text-[10px] whitespace-nowrap">
                                <CheckCircle className="w-3 h-3 mr-1 inline" />
                                OK
                              </Badge>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-xs">
                            {enrichedBC?.decisionBMO ? (
                              <div className="flex flex-col gap-0.5">
                                <Badge variant="default" className="text-[9px]">
                                  {enrichedBC.decisionBMO.validatorRole === 'A' ? '✅ BMO (A)' : '🔍 BMO (R)'}
                                </Badge>
                                {enrichedBC.decisionBMO.decisionId && (() => {
                                  const decisionId = enrichedBC.decisionBMO.decisionId;
                                  return (
                                    <Button
                                      size="xs"
                                      variant="link"
                                      className="p-0 h-auto text-blue-400"
                                      onClick={() => window.open(`/decisions?id=${decisionId}`, '_blank')}
                                    >
                                      📄 Voir
                                    </Button>
                                  );
                                })()}
                              </div>
                            ) : (
                              <Badge variant="warning" className="text-[9px]">⏳ En attente</Badge>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <Badge variant={bc.priority === 'urgent' ? 'urgent' : bc.priority === 'high' ? 'warning' : 'default'} className="text-[10px]" pulse={bc.priority === 'urgent'}>
                              {bc.priority}
                            </Badge>
                          </td>
                          <td className="px-3 py-3">
                            {enrichedBC ? (
                              <BCRowActions
                                bc={enrichedBC}
                                auditContext={{
                                  seuilBmo: 5_000_000,
                                  seuilDg: 20_000_000,
                                  supplierBlackList: [],
                                  budgetRemainingByChantier: enrichedBC.projetDetails ? {
                                    [enrichedBC.projet]: enrichedBC.projetDetails.budgetRestant || 0,
                                  } : undefined,
                                  lastPricesBySupplierItem: undefined,
                                }}
                                onOpenViewer={(bcId, options) => {
                                  const bcToShow = enrichedBCsState.find(b => b.id === bcId) || enrichedBC;
                                  setSelectedEnrichedDoc({ ...bcToShow, auditReport: options?.audit });
                                  setSelectedDocType('bc');
                                  setShowEnhancedDetailsModal(true);
                                  addToast(`Ouverture des détails de ${bcId}`, 'info');
                                }}
                                onValidate={() => {
                                  handleValidateBC(bc);
                                }}
                                darkMode={darkMode}
                              />
                            ) : (
                              <div className="flex gap-1 flex-wrap">
                                <Button 
                                  size="xs" 
                                  variant="info" 
                                  className="shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const enrichedBCToShow = createEnrichedBCFromPO(bc);
                                    setSelectedEnrichedDoc(enrichedBCToShow);
                                    setSelectedDocType('bc');
                                    setShowEnhancedDetailsModal(true);
                                    addToast(`Ouverture des détails de ${bc.id}`, 'info');
                                  }}
                                  title="Voir détails"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tab Factures */}
      {activeTab === 'factures' && (
        <>
          {/* Bandeau de pilotage pour factures */}
          <FacturePilotageBanner
            factures={facturesToValidate}
            onFilterClick={handleFactureFilterClick}
          />

          {/* Filtres intelligents */}
          <SmartFilters
            filters={factureFilters}
            onFiltersChange={setFactureFilters}
          />

          {/* Onglets de filtrage par statut */}
          <div className="flex gap-1 p-1 rounded-lg bg-slate-800/50">
            <button
              onClick={() => setFactureStatusFilter('en_attente')}
              className={cn('px-3 py-1.5 rounded-md text-xs', factureStatusFilter === 'en_attente' ? 'bg-orange-500/20 text-orange-400' : 'text-slate-400')}
            >
              ⏳ En attente ({factureCounts.enAttente})
            </button>
            <button
              onClick={() => setFactureStatusFilter('valides')}
              className={cn('px-3 py-1.5 rounded-md text-xs', factureStatusFilter === 'valides' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400')}
            >
              ✅ Validés ({factureCounts.valides})
            </button>
            <button
              onClick={() => setFactureStatusFilter('rejetes')}
              className={cn('px-3 py-1.5 rounded-md text-xs', factureStatusFilter === 'rejetes' ? 'bg-red-500/20 text-red-400' : 'text-slate-400')}
            >
              🚫 Rejetés ({factureCounts.rejetes})
            </button>
          </div>

          {/* Liste des factures modernisée */}
          <div className="space-y-3">
            {filteredFactures.map((facture) => {
              const dueDate = parseFRDate(facture.dateEcheance) || new Date();
              const isOverdue = dueDate < new Date();
              const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

              return (
                <Card 
                  key={facture.id}
                  className={cn(
                    'transition-all hover:shadow-lg',
                    isOverdue && 'border-l-4 border-l-red-500 bg-red-500/5',
                    !isOverdue && daysUntilDue <= 7 && 'border-l-4 border-l-orange-500 bg-orange-500/5'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-mono px-2 py-1 rounded bg-blue-500/20 text-blue-400 font-bold text-xs">
                            {facture.id}
                          </span>
                          <BureauTag bureau={facture.bureau} />
                          {isOverdue && (
                            <Badge variant="urgent" className="text-[10px]">
                              <Clock className="w-3 h-3 mr-1" />
                              Échue ({Math.abs(daysUntilDue)}j)
                            </Badge>
                          )}
                          {!isOverdue && daysUntilDue <= 7 && (
                            <Badge variant="warning" className="text-[10px]">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Échéance ({daysUntilDue}j)
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-bold text-base mb-1">{facture.objet}</h3>
                        <p className="text-sm text-slate-400 mb-2">{facture.fournisseur}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span>
                            <span className="text-slate-500">Projet: </span>
                            <span className="text-orange-400 font-semibold">{facture.projet}</span>
                          </span>
                          <span>•</span>
                          <span>Date facture: {facture.dateFacture}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-mono font-bold text-xl text-blue-400 mb-1">
                          {formatFCFA(facture.montant)}
                        </p>
                        <p className={cn(
                          'text-xs',
                          isOverdue ? 'text-red-400' : daysUntilDue <= 7 ? 'text-orange-400' : 'text-slate-400'
                        )}>
                          Échéance: {facture.dateEcheance}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-slate-700/50">
                      <Button 
                        size="sm" 
                        variant="success" 
                        className="flex-1" 
                        onClick={() => {
                          setSelectedFacture(facture);
                          setShowFactureValidationModal(true);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Valider facture
                      </Button>
                      <Button 
                        size="sm" 
                        variant="info" 
                        onClick={() => {
                          setSelectedFacture(facture);
                          setShowFactureDetailsPanel(true);
                          addToast(`Ouverture des détails de ${facture.id}`, 'info');
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="warning" 
                        onClick={() => {
                          handleContestFacture(facture);
                          setShowFactureDetailsPanel(false);
                        }}
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => {
                          setSelectedFacture(facture);
                          handleRejectFacture(facture);
                        }}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Tab Avenants */}
      {activeTab === 'avenants' && (
        <>
          {/* Bandeau de pilotage pour avenants */}
          <AvenantPilotageBanner
            avenants={avenantsToValidate}
            onFilterClick={handleAvenantFilterClick}
          />

          {/* Filtres intelligents */}
          <SmartFilters
            filters={avenantFilters}
            onFiltersChange={setAvenantFilters}
          />

          {/* Onglets de filtrage par statut */}
          <div className="flex gap-1 p-1 rounded-lg bg-slate-800/50">
            <button
              onClick={() => setAvenantStatusFilter('en_attente')}
              className={cn('px-3 py-1.5 rounded-md text-xs', avenantStatusFilter === 'en_attente' ? 'bg-orange-500/20 text-orange-400' : 'text-slate-400')}
            >
              ⏳ En attente ({avenantCounts.enAttente})
            </button>
            <button
              onClick={() => setAvenantStatusFilter('valides')}
              className={cn('px-3 py-1.5 rounded-md text-xs', avenantStatusFilter === 'valides' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400')}
            >
              ✅ Validés ({avenantCounts.valides})
            </button>
            <button
              onClick={() => setAvenantStatusFilter('rejetes')}
              className={cn('px-3 py-1.5 rounded-md text-xs', avenantStatusFilter === 'rejetes' ? 'bg-red-500/20 text-red-400' : 'text-slate-400')}
            >
              🚫 Rejetés ({avenantCounts.rejetes})
            </button>
          </div>

          {/* Liste des avenants modernisée */}
          <div className="space-y-3">
            {filteredAvenants.map((avenant) => (
              <Card 
                key={avenant.id} 
                className={cn(
                  'transition-all hover:shadow-lg',
                  avenant.impact === 'Financier' ? 'border-l-4 border-l-amber-500 bg-amber-500/5' :
                  avenant.impact === 'Délai' ? 'border-l-4 border-l-blue-500 bg-blue-500/5' :
                  'border-l-4 border-l-purple-500 bg-purple-500/5'
                )}
              >
                <CardContent className="p-4">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-mono px-2 py-1 rounded bg-purple-500/20 text-purple-400 font-bold text-xs">
                          {avenant.id}
                        </span>
                        <Badge variant={avenant.impact === 'Financier' ? 'warning' : avenant.impact === 'Délai' ? 'info' : 'default'}>
                          {avenant.impact}
                        </Badge>
                        <BureauTag bureau={avenant.bureau} />
                        <Badge variant={avenant.status === 'validated' ? 'success' : avenant.status === 'rejected' ? 'urgent' : 'info'}>
                          {avenant.status || 'En attente'}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-base mb-1">{avenant.objet}</h3>
                      <div className="flex items-center gap-4 text-xs text-slate-400 mb-2">
                        <span>
                          <span className="text-slate-500">Contrat: </span>
                          <span className="text-orange-400 font-semibold">{avenant.contratRef}</span>
                        </span>
                        <span>•</span>
                        <span>{avenant.partenaire}</span>
                      </div>
                      <div className={cn('p-3 rounded-lg text-sm mb-2', darkMode ? 'bg-slate-700/50' : 'bg-gray-100')}>
                        <span className="text-slate-400">Justification: </span>
                        <span className="text-slate-300">{avenant.justification}</span>
                      </div>
                    </div>
                    {avenant.montant && (
                      <div className="text-right flex-shrink-0">
                        <p className="font-mono font-bold text-xl text-amber-400 mb-1">
                          +{formatFCFA(avenant.montant)}
                        </p>
                        <p className="text-xs text-slate-400">Impact financier</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-slate-700/50">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500" 
                      onClick={() => {
                        setSelectedAvenant(avenant);
                        setShowAvenantValidationModal(true);
                        addToast(`Ouverture de l'approbation de ${avenant.id}`, 'info');
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approuver avenant
                    </Button>
                    <Button 
                      size="sm" 
                      variant="info" 
                      onClick={() => {
                        setSelectedAvenant(avenant);
                        setShowAvenantDetailsPanel(true);
                        addToast(`Ouverture des détails de ${avenant.id}`, 'info');
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="warning" 
                      onClick={() => {
                        handleRequestModification(avenant);
                      }}
                      title="Demander modification"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => {
                        setSelectedAvenant(avenant);
                        handleRejectAvenant(avenant);
                      }}
                      title="Refuser"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Info RACI */}
      <Card className="border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔐</span>
            <div>
              <h3 className="font-bold text-sm text-blue-400">Verrou RACI - Validation BC</h3>
              <p className="text-xs text-slate-400 mt-1">
                Seuls les bureaux avec rôle <span className="text-emerald-400 font-bold">R (Responsible)</span> ou <span className="text-amber-400 font-bold">A (Accountable)</span> 
                peuvent valider. Chaque validation génère un hash SHA3-256 horodaté et crée une entrée dans le registre des décisions.
              </p>
              <div className="flex gap-2 mt-2 text-[10px]">
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">BMO = A (Accountable)</span>
                <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400">BM = R (Responsible)</span>
                <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-400">BA = R (Responsible)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modales et Panneaux */}
      {selectedBC && (
        <>
          <ValidationBCModal
            isOpen={showValidationModal}
            onClose={() => {
              setShowValidationModal(false);
              setSelectedBC(null);
            }}
            bc={selectedBC}
            onValidate={handleValidateBC}
          />
          <RejectBCModal
            isOpen={showRejectModal}
            onClose={() => {
              setShowRejectModal(false);
              setSelectedBC(null);
            }}
            bc={selectedBC}
            onReject={handleRejectBC}
          />
          {/* BCDetailsPanel remplacé - conversion automatique vers EnhancedDocumentDetailsModal via useEffect */}
        </>
      )}

      {/* Modale et Panneau facture */}
      {selectedFacture && (
        <>
          <ValidationFactureModal
            isOpen={showFactureValidationModal}
            onClose={() => {
              setShowFactureValidationModal(false);
              setSelectedFacture(null);
            }}
            facture={selectedFacture}
            onValidate={handleValidateFacture}
          />
          <FactureDetailsPanel
            isOpen={showFactureDetailsPanel}
            onClose={() => {
              setShowFactureDetailsPanel(false);
              setSelectedFacture(null);
            }}
            facture={selectedFacture}
            onValidate={() => {
              setShowFactureDetailsPanel(false);
              setShowFactureValidationModal(true);
            }}
            onReject={() => {
              handleRejectFacture(selectedFacture);
              setShowFactureDetailsPanel(false);
            }}
            onContest={() => {
              handleContestFacture(selectedFacture);
              setShowFactureDetailsPanel(false);
            }}
          />
        </>
      )}

      {/* Modale et Panneau avenant */}
      {selectedAvenant && (
        <>
          <ValidationAvenantModal
            isOpen={showAvenantValidationModal}
            onClose={() => {
              setShowAvenantValidationModal(false);
              setSelectedAvenant(null);
            }}
            avenant={selectedAvenant}
            onValidate={handleValidateAvenant}
          />
          <AvenantDetailsPanel
            isOpen={showAvenantDetailsPanel}
            onClose={() => {
              setShowAvenantDetailsPanel(false);
              setSelectedAvenant(null);
            }}
            avenant={selectedAvenant}
            onApprove={() => {
              setShowAvenantDetailsPanel(false);
              setShowAvenantValidationModal(true);
            }}
            onReject={() => {
              handleRejectAvenant(selectedAvenant);
              setShowAvenantDetailsPanel(false);
            }}
            onRequestModification={() => {
              handleRequestModification(selectedAvenant);
              setShowAvenantDetailsPanel(false);
            }}
          />
        </>
      )}

      {/* Assistant IA Modal */}
      <AIAssistantModal
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        bcs={bcToValidate}
        factures={facturesToValidate}
        avenants={avenantsToValidate}
        onAutoValidate={handleAutoValidate}
        onAutoFix={(id, fix) => {
          addToast(`Correction automatique appliquée à ${id}: ${fix}`, 'success');
        }}
      />

      {/* Modal de Comparaison BC */}
      {activeTab === 'bc' && (
        <BCComparisonModal
          isOpen={showComparisonModal}
          onClose={() => {
            setShowComparisonModal(false);
            setSelectionMode(false);
            setSelectedBCsForComparison([]);
          }}
          selectedBCs={(() => {
            // WHY: Récupérer les BCs sélectionnés (enriched ou raw) pour comparaison
            return selectedBCsForComparison.map(id => {
              const enriched = enrichedBCsState.find(bc => bc.id === id);
              if (enriched) return enriched;
              const raw = bcToValidate.find(bc => bc.id === id);
              if (raw) return raw;
              return null;
            }).filter(Boolean) as (EnrichedBC | PurchaseOrder)[];
          })()}
          allBCs={[...bcToValidate, ...enrichedBCsState]}
          onValidateBatch={(bcIds) => {
            bcIds.forEach(id => {
              const bc = bcToValidate.find(b => b.id === id);
              if (bc) handleValidateBC(bc);
            });
            setSelectedBCsForComparison([]);
            setSelectionMode(false);
            setShowComparisonModal(false);
          }}
          onRejectBatch={(bcIds, reason) => {
            bcIds.forEach(id => {
              const bc = bcToValidate.find(b => b.id === id);
              if (bc) handleRejectBC(bc, reason);
            });
            setSelectedBCsForComparison([]);
            setSelectionMode(false);
            setShowComparisonModal(false);
          }}
        />
      )}

      {/* Modale de détails enrichie - key pour forcer reset au changement de BC */}
      {selectedEnrichedDoc && (
        <EnhancedDocumentDetailsModal
          key={selectedEnrichedDoc.id} // Force reset complet au changement de BC
          isOpen={showEnhancedDetailsModal}
          onClose={() => {
            setShowEnhancedDetailsModal(false);
            setSelectedEnrichedDoc(null);
          }}
          document={selectedEnrichedDoc}
          documentType={selectedDocType}
          allBCs={[...bcToValidate, ...enrichedBCsState]} // WHY: Pour recommandations contextuelles
          onAuditComplete={(bcId, report) => {
            // ✅ éviter stale state
            if (selectedDocType === 'bc') {
              setEnrichedBCsState((prev) =>
                prev.map((bc) =>
                  bc.id === bcId
                    ? {
                        ...bc,
                        auditReport: report,
                        anomalies: report.anomalies,
                        status: report.blocking ? ('audit_required' as DocumentStatus) : bc.status,
                      }
                    : bc
                )
              );
              setSelectedEnrichedDoc((prev) =>
                prev && prev.id === bcId
                  ? ({ ...prev, auditReport: report, anomalies: report.anomalies } as any)
                  : prev
              );
            }
          }}
          onValidate={() => {
            // Mettre à jour le statut
            if (selectedDocType === 'bc') {
              setEnrichedBCsState((prev) =>
                prev.map((bc) =>
                  bc.id === selectedEnrichedDoc.id ? { ...bc, status: 'validated' as DocumentStatus } : bc
                )
              );
            } else if (selectedDocType === 'facture') {
              setEnrichedFacturesState((prev) =>
                prev.map((f) =>
                  f.id === selectedEnrichedDoc.id ? { ...f, status: 'validated' as DocumentStatus } : f
                )
              );
            } else {
              setEnrichedAvenantsState((prev) =>
                prev.map((a) =>
                  a.id === selectedEnrichedDoc.id ? { ...a, status: 'validated' as DocumentStatus } : a
                )
              );
            }
            setShowEnhancedDetailsModal(false);
            setSelectedEnrichedDoc(null);
          }}
          onReject={() => {
            if (selectedDocType === 'bc') {
              setEnrichedBCsState((prev) =>
                prev.map((bc) =>
                  bc.id === selectedEnrichedDoc.id ? { ...bc, status: 'rejected' as DocumentStatus } : bc
                )
              );
            }
            setShowEnhancedDetailsModal(false);
            setSelectedEnrichedDoc(null);
          }}
          onSign={(signature) => {
            addToast(`Document signé: ${signature.signatureHash.slice(0, 20)}...`, 'success');
          }}
        />
      )}

      {/* Modal de Batch Actions */}
      {activeTab === 'bc' && (
        <BatchActionsModal
          isOpen={showBatchActionsModal}
          onClose={() => {
            setShowBatchActionsModal(false);
            setSelectionMode(false);
            setSelectedBCsForComparison([]);
          }}
          selectedBCIds={selectedBCsForComparison}
          allBCs={[...bcToValidate, ...enrichedBCsState]}
          onValidate={(ids) => {
            ids.forEach(id => {
              const bc = bcToValidate.find(b => b.id === id);
              if (bc) handleValidateBC(bc);
            });
            setSelectedBCsForComparison([]);
            setSelectionMode(false);
            setShowBatchActionsModal(false);
          }}
          onReject={(ids, reason) => {
            ids.forEach(id => {
              const bc = bcToValidate.find(b => b.id === id);
              if (bc) handleRejectBC(bc, reason);
            });
            setSelectedBCsForComparison([]);
            setSelectionMode(false);
            setShowBatchActionsModal(false);
          }}
          onRequestComplement={(ids, message) => {
            ids.forEach(id => {
              const bc = bcToValidate.find(b => b.id === id);
              if (bc) {
                handleRequestDocument(bc);
                addActionLog({
                  userId: currentUser.id,
                  userName: currentUser.name,
                  userRole: currentUser.role,
                  action: 'modification',
                  module: 'validation-bc',
                  targetId: id,
                  targetType: 'Bon de commande',
                  targetLabel: bc.subject,
                  details: `Demande de complément (lot): ${message}`,
                  bureau: bc.bureau,
                });
              }
            });
            setSelectedBCsForComparison([]);
            setSelectionMode(false);
            setShowBatchActionsModal(false);
          }}
          onExport={(ids, format) => {
            addToast(`Export ${format.toUpperCase()} lancé pour ${ids.length} BC(s)`, 'success');
            // TODO: Implémenter l'export réel
          }}
          onAssign={(ids, assignee) => {
            ids.forEach(id => {
              addActionLog({
                userId: currentUser.id,
                userName: currentUser.name,
                userRole: currentUser.role,
                action: 'modification',
                module: 'validation-bc',
                targetId: id,
                targetType: 'Bon de commande',
                targetLabel: `BC ${id}`,
                details: `Assigné à ${assignee} (action en lot)`,
                bureau: 'BMO',
              });
            });
            addToast(`${ids.length} BC(s) assigné(s) à ${assignee}`, 'success');
            setSelectedBCsForComparison([]);
            setSelectionMode(false);
            setShowBatchActionsModal(false);
          }}
        />
      )}
        </div>
      </div>
    </div>
  );
}

// Composant carte BC réutilisable
function BCCard({
  bc,
  darkMode,
  onValidate,
  onReject,
  onRequest,
  onEscalate,
}: {
  bc: PurchaseOrder;
  darkMode: boolean;
  onValidate: (bc: PurchaseOrder) => void;
  onReject: (bc: PurchaseOrder, reason?: string) => void;
  onRequest: (bc: PurchaseOrder) => void;
  onEscalate: (bc: PurchaseOrder) => void;
}) {
  return (
    <div className={cn('p-3 rounded-lg', darkMode ? 'bg-slate-700/30' : 'bg-gray-50')}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">{bc.id}</span>
            <span className="text-xs text-orange-400">{bc.project}</span>
            <BureauTag bureau={bc.bureau} />
          </div>
          <p className="text-sm font-semibold">{bc.subject}</p>
          <p className="text-[10px] text-slate-400">{bc.supplier}</p>
        </div>
        <span className="font-mono font-bold text-amber-400">{bc.amount}</span>
      </div>
      <div className="flex gap-1 mt-2">
        <Button size="xs" variant="success" onClick={() => onValidate(bc)}>✓ Valider</Button>
        <Button size="xs" variant="warning" onClick={() => onRequest(bc)}>📎 Pièce</Button>
        <Button size="xs" variant="secondary" onClick={() => onEscalate(bc)}>⬆️</Button>
        <Button size="xs" variant="destructive" onClick={() => onReject(bc)}>✕</Button>
      </div>
    </div>
  );
}
