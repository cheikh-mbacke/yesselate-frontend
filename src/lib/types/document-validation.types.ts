// ============================================
// Types pour la validation approfondie des documents
// BC, Factures, Avenants
// ============================================

export type DocumentType = 'bc' | 'facture' | 'avenant';
export type AnomalySeverity = 'info' | 'warning' | 'error' | 'critical';
export type AnomalyType = 
  | 'montant_incoherent'        // HT/TVA/TTC incohérents
  | 'depassement_budget'        // Dépassement budgétaire
  | 'bc_manquant'               // BC associé manquant (facture)
  | 'doublon'                   // Document en doublon
  | 'tva_incorrecte'            // TVA incorrecte
  | 'date_invalide'             // Date invalide ou incohérente
  | 'fournisseur_incorrect'     // Fournisseur non référencé
  | 'projet_incorrect'          // Projet non trouvé
  | 'montant_ht_incorrect'      // Montant HT incorrect
  | 'montant_ttc_incorrect'     // Montant TTC incorrect
  | 'reference_manquante'       // Référence manquante
  | 'contrat_incompatible'      // Incompatibilité avec contrat (avenant)
  | 'quantite_incorrecte'       // Quantité incorrecte
  | 'prix_unitaire_incorrect'   // Prix unitaire incorrect
  | 'autre';                    // Autre anomalie

export type DocumentStatus = 
  | 'pending'                   // En attente de validation
  | 'anomaly_detected'          // Anomalie détectée
  | 'correction_requested'      // Correction demandée
  | 'correction_in_progress'    // Correction en cours
  | 'corrected'                 // Corrigé (en attente de nouvelle validation)
  | 'validated'                 // Validé
  | 'rejected'                  // Refusé
  // Workflow CIRIL
  | 'draft_ba'                  // Brouillon créé par BA
  | 'pending_bmo'               // En attente de validation BMO
  | 'audit_required'            // Audit requis
  | 'in_audit'                  // Audit en cours
  | 'approved_bmo'              // Approuvé par BMO
  | 'rejected_bmo'              // Refusé par BMO
  | 'sent_supplier'             // Envoyé au fournisseur
  | 'needs_complement';         // Nécessite des compléments

export interface DocumentAnomaly {
  id: string;
  field: string;                // Champ concerné (ex: "montant_ttc", "date_limite")
  type: AnomalyType;
  severity: AnomalySeverity;
  message: string;
  detectedAt: string;
  detectedBy?: string;
  resolved?: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface DocumentAnnotation {
  id: string;
  documentId: string;
  documentType: DocumentType;
  field?: string;               // Champ annoté (optionnel)
  comment: string;
  anomalyId?: string;           // Lien vers une anomalie si applicable
  createdBy: string;
  createdAt: string;
  type?: 'comment' | 'correction' | 'approval' | 'rejection';
}

export interface DocumentVerificationResult {
  isValid: boolean;
  severity: AnomalySeverity;
  anomalies: DocumentAnomaly[];
  checks: VerificationCheck[];
  summary: string;
}

export interface VerificationCheck {
  id: string;
  name: string;
  category: 'amount' | 'administrative' | 'contractual' | 'technical';
  passed: boolean;
  message?: string;
  severity?: AnomalySeverity;
}

// Données enrichies pour les documents
// Compatible avec BCLine de bcTypes.ts mais avec format plus flexible pour migration
export interface BCLigne {
  code?: string;
  id?: string;
  designation: string;
  quantite: string;             // Ex: "25 sacs", "1 forfait" - peut être converti en number
  prixUnitaireHT: number;
  totalHT: number;
  familyCode?: string;          // FamilyCode optionnel pour migration
  supplierItemRef?: string;
  chantierRefs?: string[];
  costCenters?: string[];
}

export interface EnrichedBC {
  id: string;
  fournisseur: string;
  projet: string;
  objet: string;
  montantHT: number;
  tva: number;                  // Pourcentage TVA (ex: 20)
  montantTTC: number;
  dateEmission: string;
  dateLimite: string;
  bureauEmetteur: string;
  bcAssocie?: string;           // Si c'est une facture liée à un BC
  status: DocumentStatus;
  anomalies?: DocumentAnomaly[];
  annotations?: DocumentAnnotation[];
  verification?: DocumentVerificationResult;
  auditReport?: any; // BCAuditReport - type défini dans bc-workflow.types.ts
  lignes?: BCLigne[];           // Lignes détaillées du bon de commande
  
  // Informations enrichies
  demandeur?: {
    nom: string;
    fonction: string;
    bureau: string;
    email?: string;
    telephone?: string;
  };
  fournisseurDetails?: {
    nom: string;
    siret?: string;
    adresse?: string;
    ville?: string;
    codePostal?: string;
    pays?: string;
    telephone?: string;
    email?: string;
    contactCommercial?: string;
    historiqueCommandes?: number; // Nombre de commandes précédentes
    fiabilite?: 'excellent' | 'bon' | 'moyen' | 'faible';
  };
  projetDetails?: {
    nom: string;
    responsable?: string;
    budgetTotal?: number;
    budgetUtilise?: number;
    budgetRestant?: number;
    avancement?: number; // Pourcentage
    dateDebut?: string;
    dateFinPrevue?: string;
    statut?: string;
  };
  livraison?: {
    adresse?: string;
    ville?: string;
    codePostal?: string;
    pays?: string;
    contactLivraison?: string;
    telephone?: string;
    dateLivraisonPrevue?: string;
    instructions?: string;
  };
  paiement?: {
    mode?: 'virement' | 'cheque' | 'traite' | 'espece' | 'autre';
    delai?: number; // Jours
    echeance?: string;
    acompte?: number; // Montant ou pourcentage
    conditions?: string;
  };
  documents?: Array<{
    id: string;
    nom: string;
    type: string;
    taille: string;
    dateUpload: string;
    uploadPar: string;
    url?: string;
  }>;
  historique?: Array<{
    id: string;
    date: string;
    action: string;
    auteur: string;
    details?: string;
    type: 'creation' | 'modification' | 'validation' | 'rejet' | 'annotation' | 'escalade' | 'autre';
  }>;
  notes?: Array<{
    id: string;
    contenu: string;
    auteur: string;
    date: string;
    prive?: boolean;
  }>;
  references?: {
    commandeInterne?: string;
    dossierAchat?: string;
    appelOffre?: string;
    contrat?: string;
    bonCommandeClient?: string;
  };
  // Nouveaux champs compatibles avec BonCommande
  familyCode?: string;          // FamilyCode au niveau BC (1 BC = 1 famille principale)
  supplierId?: string;          // ID du fournisseur
  createdBy?: string;           // Créé par
  createdAt?: string;           // Date de création
  paymentMethod?: string;       // Mode de paiement
  deliveryAddress?: string;     // Adresse de livraison
  vatRate?: number;             // Taux de TVA (ex: 0.20)
  decisionBMO?: import('./bmo.types').DecisionBMO; // 🔑 CHAMP CLÉ : DÉCISION BMO (traçabilité RACI)
}

export interface EnrichedFacture {
  id: string;
  fournisseur: string;
  projet: string;
  objet: string;
  montantHT: number;
  tva: number;
  montantTTC: number;
  dateEmission: string;
  dateLimite: string;
  bcAssocie?: string;
  status: DocumentStatus;
  anomalies?: DocumentAnomaly[];
  annotations?: DocumentAnnotation[];
  verification?: DocumentVerificationResult;
  decisionBMO?: import('./bmo.types').DecisionBMO; // 🔑 CHAMP CLÉ : DÉCISION BMO (traçabilité RACI)
}

export interface EnrichedAvenant {
  id: string;
  projet: string;
  objet: string;
  motif: string;
  impactFinancier: number;      // 0 si pas d'impact financier
  impactDelai: number;          // +X jours ou -X jours
  dateEmission: string;
  bureauEmetteur: string;
  contratRef?: string;
  status: DocumentStatus;
  anomalies?: DocumentAnomaly[];
  annotations?: DocumentAnnotation[];
  verification?: DocumentVerificationResult;
  decisionBMO?: import('./bmo.types').DecisionBMO; // 🔑 CHAMP CLÉ : DÉCISION BMO (traçabilité RACI)
}

// Demande de complément
export interface CorrectionRequest {
  id: string;
  documentId: string;
  documentType: DocumentType;
  message: string;
  anomalies: string[];          // IDs des anomalies concernées
  attachments?: string[];       // URLs des pièces jointes
  requestedBy: string;
  requestedAt: string;
  deadline?: string;            // Date limite pour la correction
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  response?: string;
  respondedAt?: string;
}

// Signature
export interface DocumentSignature {
  id: string;
  documentId: string;
  documentType: DocumentType;
  signatoryName: string;
  signatoryFunction: string;    // Ex: "Président", "Directeur Général"
  signedAt: string;
  signatureHash: string;        // Hash SHA3-256 pour traçabilité
  logoUrl?: string;
  stampUrl?: string;
  signatureImageUrl?: string;   // Image de la signature
}

// Profil de signataire
export interface SignatoryProfile {
  id: string;
  name: string;
  function: string;
  authority: 'president' | 'president_adjoint' | 'directeur' | 'directeur_adjoint';
  signatureImageUrl?: string;
  active: boolean;
}

