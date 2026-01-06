// ============================================
// Données mockées BMO - Partie 2
// Validations, RH, Échanges, Finance
// ============================================

import type {
  PurchaseOrder,
  Contract,
  Payment,
  Invoice,
  Amendment,
  BlockedDossier,
  HRRequest,
  BureauExchange,
  Arbitration,
  ExternalMessage,
  Recovery,
  Litigation,
  Reminder,
  Note,
  SystemAlert,
} from '@/lib/types/bmo.types';

// --- Bons de commande à valider ---
export const bcToValidate: PurchaseOrder[] = [
  { id: 'BC-2025-0156', project: 'PRJ-0018', subject: 'Ciment Portland 500T', supplier: 'SOCOCIM', amount: '4,250,000', requestedBy: 'A. SECK', bureau: 'BA', date: '22/12/2025', priority: 'urgent', status: 'pending' },
  { id: 'BC-2025-0155', project: 'PRJ-0017', subject: 'Location engins TP', supplier: 'MATFORCE', amount: '8,500,000', requestedBy: 'C. GUEYE', bureau: 'BCT', date: '22/12/2025', priority: 'high', status: 'pending' },
  { id: 'BC-2025-0154', project: 'PRJ-0018', subject: 'Fer à béton 12mm', supplier: 'SENFER', amount: '2,150,000', requestedBy: 'A. SECK', bureau: 'BA', date: '21/12/2025', priority: 'normal', status: 'pending' },
  { id: 'BC-2025-0153', project: 'PRJ-0016', subject: 'Carrelage importé', supplier: 'COMPTOIR CERAM', amount: '3,800,000', requestedBy: 'A. SECK', bureau: 'BA', date: '21/12/2025', priority: 'normal', status: 'pending' },
  { id: 'BC-2025-0152', project: 'PRJ-0017', subject: 'Bitume 60/70', supplier: 'SAR', amount: '12,500,000', requestedBy: 'M. BA', bureau: 'BM', date: '20/12/2025', priority: 'high', status: 'pending' },
  { id: 'BC-2025-0151', project: 'PRJ-0018', subject: 'Menuiserie aluminium', supplier: 'ALSEN', amount: '5,200,000', requestedBy: 'A. SECK', bureau: 'BA', date: '20/12/2025', priority: 'normal', status: 'pending' },
];

// --- Contrats à signer ---
export const contractsToSign: Contract[] = [
  { id: 'CTR-2025-0089', type: 'Marché', subject: 'Contrat cadre fournitures électriques', partner: 'SENELEC DISTRIBUTION', amount: '25,000,000', preparedBy: 'N. FAYE', bureau: 'BJ', date: '22/12/2025', expiry: '31/12/2026', status: 'pending' },
  { id: 'CTR-2025-0088', type: 'Avenant', subject: 'Avenant n°2 - Extension délais PRJ-0017', partner: 'EIFFAGE SENEGAL', amount: '—', preparedBy: 'N. FAYE', bureau: 'BJ', date: '21/12/2025', expiry: '—', status: 'pending' },
  { id: 'CTR-2025-0087', type: 'Sous-traitance', subject: 'ST Plomberie Villa Diamniadio', partner: 'PLOMBERIE MODERNE', amount: '4,500,000', preparedBy: 'M. BA', bureau: 'BM', date: '20/12/2025', expiry: '30/06/2025', status: 'pending' },
];

// --- Paiements N+1 ---
export const paymentsN1: Payment[] = [
  { id: 'PAY-2025-0098', type: 'Situation', ref: 'SIT-04-PRJ0017', beneficiary: 'EIFFAGE SENEGAL', amount: '18,500,000', project: 'PRJ-0017', validatedBy: 'F. DIOP', bureau: 'BF', date: '22/12/2025', dueDate: '30/12/2025', status: 'pending' },
  { id: 'PAY-2025-0097', type: 'Facture', ref: 'FAC-2025-1245', beneficiary: 'SOCOCIM INDUSTRIES', amount: '4,250,000', project: 'PRJ-0018', validatedBy: 'F. DIOP', bureau: 'BF', date: '22/12/2025', dueDate: '28/12/2025', status: 'pending' },
  { id: 'PAY-2025-0096', type: 'Acompte', ref: 'ACP-PRJ0016-03', beneficiary: 'SCI TERANGA', amount: '8,900,000', project: 'PRJ-0016', validatedBy: 'F. DIOP', bureau: 'BF', date: '21/12/2025', dueDate: '27/12/2025', status: 'pending' },
  { id: 'PAY-2025-0095', type: 'Retenue', ref: 'RG-PRJ0015', beneficiary: 'ENTREPRISE GENERALE BTP', amount: '1,800,000', project: 'PRJ-0015', validatedBy: 'F. DIOP', bureau: 'BF', date: '20/12/2025', dueDate: '31/12/2025', status: 'pending' },
  { id: 'PAY-2025-0094', type: 'Facture', ref: 'FAC-2025-1198', beneficiary: 'SENELEC', amount: '850,000', project: 'ADMIN', validatedBy: 'F. DIOP', bureau: 'BF', date: '20/12/2025', dueDate: '25/12/2025', status: 'pending' },
];

// --- Factures à valider ---
export const facturesToValidate: Invoice[] = [
  { id: 'FAC-2025-0198', fournisseur: 'SOCOCIM Industries', objet: 'Ciment Portland 500T', montant: '4,250,000', projet: 'PRJ-0018', dateFacture: '20/12/2025', dateEcheance: '20/01/2026', status: 'pending', validatedBy: null, bureau: 'BA' },
  { id: 'FAC-2025-0197', fournisseur: 'SENFER SARL', objet: 'Fer à béton HA 12mm - 50T', montant: '2,150,000', projet: 'PRJ-0018', dateFacture: '19/12/2025', dateEcheance: '19/01/2026', status: 'pending', validatedBy: null, bureau: 'BA' },
  { id: 'FAC-2025-0196', fournisseur: 'MATFORCE Location', objet: 'Location grue 15 jours', montant: '12,750,000', projet: 'PRJ-0017', dateFacture: '18/12/2025', dateEcheance: '18/01/2026', status: 'pending', validatedBy: null, bureau: 'BCT' },
  { id: 'FAC-2025-0195', fournisseur: 'Cabinet Me SALL', objet: 'Honoraires contentieux SUNEOR', montant: '2,500,000', projet: 'PRJ-0014', dateFacture: '19/12/2025', dateEcheance: '19/01/2026', status: 'pending', validatedBy: null, bureau: 'BJ' },
];

// --- Avenants à valider ---
export const avenantsToValidate: Amendment[] = [
  { id: 'AVN-2025-0034', contratRef: 'CTR-2024-0156', objet: 'Extension délai PRJ-0017 (+45 jours)', partenaire: 'EIFFAGE SENEGAL', impact: 'Délai', montant: null, justification: 'Retard livraison matériaux', status: 'pending', preparedBy: 'N. FAYE', bureau: 'BJ', date: '21/12/2025' },
  { id: 'AVN-2025-0033', contratRef: 'CTR-2024-0142', objet: 'Travaux supplémentaires PRJ-0018', partenaire: 'ENTREPRISE CSE', impact: 'Financier', montant: '3,500,000', justification: 'Modification client - Extension terrasse', status: 'pending', preparedBy: 'M. BA', bureau: 'BM', date: '20/12/2025' },
  { id: 'AVN-2025-0032', contratRef: 'CTR-2024-0138', objet: 'Révision prix PRJ-0016', partenaire: 'COMPTOIR CERAM', impact: 'Financier', montant: '1,200,000', justification: 'Hausse tarifs 2025 (+8%)', status: 'pending', preparedBy: 'N. FAYE', bureau: 'BJ', date: '19/12/2025' },
];

// --- Dossiers bloqués ---
export const blockedDossiers: BlockedDossier[] = [
  { id: 'PAY-2025-0041', type: 'Paiement', subject: 'Situation n°4 EIFFAGE', amount: '8,750,000', bureau: 'BF', responsible: 'F. DIOP', blockedSince: '15/12/2025', delay: 7, reason: 'Absence responsable - Congés', project: 'PRJ-0017', impact: 'high' },
  { id: 'VAL-2025-0089', type: 'Validation', subject: 'Budget PRJ-INFRA-2025-0012', amount: '15,000,000', bureau: 'BF', responsible: 'F. DIOP', blockedSince: '16/12/2025', delay: 6, reason: 'Blocage technique - Justificatifs manquants', project: 'PRJ-INFRA', impact: 'critical' },
  { id: 'CTR-2025-0034', type: 'Contrat', subject: 'Contrat cadre SOGEA SATOM', amount: '45,000,000', bureau: 'BM', responsible: 'M. BA', blockedSince: '17/12/2025', delay: 5, reason: 'Négociation en cours - Clauses litigieuses', project: 'PRJ-0017', impact: 'medium' },
  { id: 'DEM-2025-0142', type: 'Demande', subject: 'Autorisation travaux Zone C', amount: '—', bureau: 'BCT', responsible: 'C. GUEYE', blockedSince: '17/12/2025', delay: 5, reason: 'Documents manquants - Permis de construire', project: 'PRJ-0018', impact: 'high' },
];

// --- Demandes RH (enrichies avec traçabilité audit) ---
export const demandesRH: HRRequest[] = [
  { 
    id: 'RH-2025-0089', 
    type: 'Congé', 
    subtype: 'Annuel', 
    agent: 'Cheikh GUEYE', 
    agentId: 'EMP-007',
    initials: 'CG', 
    bureau: 'BCT', 
    startDate: '26/12/2025', 
    endDate: '05/01/2026', 
    days: 10, 
    reason: "Fêtes de fin d'année", 
    status: 'pending', 
    date: '20/12/2025', 
    priority: 'normal',
    documents: [
      { id: 'DOC-RH-001', type: 'autre', name: 'Demande manuscrite', date: '20/12/2025' },
    ],
    impactSubstitution: 'SUB-2025-0012', // Créera une substitution si validé
  },
  { 
    id: 'RH-2025-0088', 
    type: 'Dépense', 
    subtype: 'Mission', 
    agent: 'Modou DIOP', 
    agentId: 'EMP-009',
    initials: 'MD', 
    bureau: 'BCT', 
    amount: '125,000', 
    reason: 'Frais déplacement chantier Thiès', 
    status: 'pending', 
    date: '21/12/2025', 
    priority: 'normal',
    documents: [
      { id: 'DOC-RH-002', type: 'facture', name: 'Factures carburant', date: '21/12/2025' },
      { id: 'DOC-RH-003', type: 'ordre_mission', name: 'Ordre de mission', date: '20/12/2025' },
    ],
  },
  { 
    id: 'RH-2025-0087', 
    type: 'Maladie', 
    subtype: 'Arrêt', 
    agent: 'Rama SY', 
    agentId: 'EMP-010',
    initials: 'RS', 
    bureau: 'BF', 
    startDate: '22/12/2025', 
    endDate: '27/12/2025', 
    days: 5, 
    reason: 'Certificat médical fourni', 
    status: 'pending', 
    date: '22/12/2025', 
    priority: 'high',
    documents: [
      { id: 'DOC-RH-004', type: 'certificat_medical', name: 'Certificat Dr. NDIAYE', date: '22/12/2025' },
    ],
    impactSubstitution: 'SUB-2025-0013',
  },
  { 
    id: 'RH-2025-0086', 
    type: 'Déplacement', 
    subtype: 'Mission', 
    agent: 'Ndèye FAYE', 
    agentId: 'EMP-008',
    initials: 'NF', 
    bureau: 'BJ', 
    destination: 'Ziguinchor', 
    startDate: '02/01/2026', 
    endDate: '04/01/2026', 
    days: 3, 
    reason: 'Audience tribunal - Litige SUNEOR', 
    status: 'pending', 
    date: '21/12/2025', 
    priority: 'urgent',
    documents: [
      { id: 'DOC-RH-005', type: 'ordre_mission', name: 'Ordre de mission signé', date: '21/12/2025' },
      { id: 'DOC-RH-006', type: 'justificatif', name: 'Convocation TGI', date: '20/12/2025' },
    ],
    impactSubstitution: 'SUB-2025-0014',
  },
  { 
    id: 'RH-2025-0085', 
    type: 'Dépense', 
    subtype: 'Équipement', 
    agent: 'Pape NDIAYE', 
    agentId: 'EMP-011',
    initials: 'PN', 
    bureau: 'BA', 
    amount: '85,000', 
    reason: 'Achat EPI chantier (casques, gants)', 
    status: 'pending', 
    date: '20/12/2025', 
    priority: 'normal',
    documents: [
      { id: 'DOC-RH-007', type: 'facture', name: 'Devis fournisseur EPI', date: '20/12/2025' },
    ],
  },
  { 
    id: 'RH-2025-0084', 
    type: 'Congé', 
    subtype: 'Maternité', 
    agent: 'Coumba FALL', 
    agentId: 'EMP-012',
    initials: 'CF', 
    bureau: 'BA', 
    startDate: '15/01/2026', 
    endDate: '15/04/2026', 
    days: 90, 
    reason: 'Congé maternité légal', 
    status: 'pending', 
    date: '19/12/2025', 
    priority: 'high',
    documents: [
      { id: 'DOC-RH-008', type: 'certificat_medical', name: 'Certificat grossesse', date: '19/12/2025' },
    ],
    impactSubstitution: 'SUB-2025-0015',
  },
  { 
    id: 'RH-2025-0083', 
    type: 'Paie', 
    subtype: 'Avance', 
    agent: 'Samba NIANG', 
    agentId: 'EMP-013',
    initials: 'SN', 
    bureau: 'BCT', 
    amount: '200,000', 
    reason: 'Avance sur salaire - Urgence familiale', 
    status: 'pending', 
    date: '22/12/2025', 
    priority: 'urgent',
    documents: [
      { id: 'DOC-RH-009', type: 'justificatif', name: 'Demande écrite', date: '22/12/2025' },
    ],
  },
  // Demandes déjà validées (pour historique)
  {
    id: 'RH-2025-0082',
    type: 'Congé',
    subtype: 'Annuel',
    agent: 'Fatou DIOP',
    agentId: 'EMP-004',
    initials: 'FD',
    bureau: 'BF',
    startDate: '23/12/2025',
    endDate: '02/01/2026',
    days: 10,
    reason: 'Congés annuels',
    status: 'validated',
    date: '15/12/2025',
    priority: 'normal',
    validatedBy: 'A. DIALLO',
    validatedAt: '16/12/2025 14:30',
    validationComment: 'Approuvé - Substitution mise en place',
    impactSubstitution: 'SUB-2025-0010',
    hash: 'SHA3-256:a1b2c3d4e5f6...',
  },
  {
    id: 'RH-2025-0081',
    type: 'Dépense',
    subtype: 'Formation',
    agent: 'Ibrahim FALL',
    agentId: 'EMP-001',
    initials: 'IF',
    bureau: 'BMO',
    amount: '350,000',
    reason: 'Frais formation Management Agile',
    status: 'validated',
    date: '10/12/2025',
    priority: 'normal',
    validatedBy: 'A. DIALLO',
    validatedAt: '11/12/2025 10:00',
    validationComment: 'Formation approuvée - Budget formation disponible',
    impactFinance: 'FIN-2025-0234',
    hash: 'SHA3-256:b2c3d4e5f6g7...',
    documents: [
      { id: 'DOC-RH-010', type: 'facture', name: 'Facture organisme formation', date: '10/12/2025' },
    ],
  },
  {
    id: 'RH-2025-0080',
    type: 'Paie',
    subtype: 'Avance',
    agent: 'Aïssatou SECK',
    agentId: 'EMP-006',
    initials: 'AS',
    bureau: 'BA',
    amount: '150,000',
    reason: 'Avance sur salaire',
    status: 'rejected',
    date: '08/12/2025',
    priority: 'normal',
    rejectedBy: 'O. NDIAYE',
    rejectedAt: '09/12/2025 09:15',
    rejectionReason: 'Avance précédente non soldée',
    hash: 'SHA3-256:c3d4e5f6g7h8...',
  },
];

// --- Échanges inter-bureaux ---
export const echangesBureaux: BureauExchange[] = [
  { id: 'ECH-2025-0156', from: 'BCT', to: 'BA', fromAgent: 'C. GUEYE', toAgent: 'A. SECK', subject: 'Demande urgente ciment Portland', message: 'Besoin 50T ciment pour coulage dalle RDC Villa Diamniadio. Stock épuisé sur site.', date: '22/12/2025 14:30', status: 'pending', priority: 'urgent', project: 'PRJ-0018' },
  { id: 'ECH-2025-0155', from: 'BJ', to: 'BM', fromAgent: 'N. FAYE', toAgent: 'M. BA', subject: 'Clause litigieuse contrat SOGEA', message: 'La clause 12.3 sur les pénalités de retard doit être renégociée. Proposition de modification jointe.', date: '22/12/2025 11:15', status: 'pending', priority: 'high', attachments: 1 },
  { id: 'ECH-2025-0154', from: 'BF', to: 'BMO', fromAgent: 'F. DIOP', toAgent: 'I. FALL', subject: 'Alerte dépassement budget INFRA', message: 'Le projet INFRA-2025-0012 a dépassé le budget prévu de 12%. Demande arbitrage DG.', date: '22/12/2025 10:00', status: 'escalated', priority: 'urgent', project: 'PRJ-INFRA' },
  { id: 'ECH-2025-0153', from: 'BA', to: 'BCT', fromAgent: 'A. SECK', toAgent: 'C. GUEYE', subject: 'Livraison fer à béton confirmée', message: 'Livraison prévue le 24/12 à 8h. Merci de prévoir équipe réception sur site.', date: '21/12/2025 16:45', status: 'resolved', priority: 'normal', project: 'PRJ-0018' },
  { id: 'ECH-2025-0152', from: 'BQC', to: 'BCT', fromAgent: 'S. MBAYE', toAgent: 'C. GUEYE', subject: 'Résultats tests béton Lot 3', message: 'Tests de compression OK. Résistance: 32 MPa (norme: 25 MPa). Feu vert pour poursuite.', date: '21/12/2025 14:20', status: 'resolved', priority: 'normal', project: 'PRJ-0018', attachments: 2 },
];

// --- Arbitrages ---
export const arbitrages: Arbitration[] = [
  { id: 'ARB-2025-0023', subject: 'Conflit priorité ressources BCT/BA', parties: ['BCT', 'BA'], description: "Conflit sur l'allocation du camion-grue entre chantier Diamniadio et livraisons Almadies", requestedBy: 'C. GUEYE', date: '22/12/2025', status: 'pending', impact: 'high', deadline: '24/12/2025' },
  { id: 'ARB-2025-0022', subject: 'Dépassement budget non autorisé', parties: ['BF', 'BCT'], description: 'Dépenses supplémentaires de 2.3M sur PRJ-0017 sans validation préalable', requestedBy: 'F. DIOP', date: '21/12/2025', status: 'pending', impact: 'critical', deadline: '23/12/2025' },
  { id: 'ARB-2025-0021', subject: 'Litige qualité matériaux fournisseur', parties: ['BA', 'BQC'], description: 'Désaccord sur la conformité du lot de carrelage reçu - BA veut accepter, BQC refuse', requestedBy: 'S. MBAYE', date: '20/12/2025', status: 'pending', impact: 'medium', deadline: '26/12/2025' },
  { id: 'ARB-2025-0020', subject: 'Retard paiement sous-traitant', parties: ['BF', 'BM'], description: 'PLOMBERIE MODERNE menace arrêt travaux si paiement non effectué sous 48h', requestedBy: 'M. BA', date: '19/12/2025', status: 'resolved', impact: 'high', resolution: 'Paiement prioritaire autorisé' },
];

// --- Messages externes ---
export const messagesExternes: ExternalMessage[] = [
  { id: 'EXT-2025-0089', type: 'Fournisseur', sender: 'SOCOCIM Industries', contact: 'M. Amadou BA', email: 'a.ba@sococim.sn', phone: '+221 33 849 50 50', subject: 'Révision tarifs 2026', message: "Suite à l'augmentation des coûts énergétiques, nous vous informons d'une hausse de 8% sur nos tarifs à compter du 01/01/2026.", date: '22/12/2025 15:30', status: 'unread', priority: 'high', requiresResponse: true },
  { id: 'EXT-2025-0088', type: 'Client', sender: 'M. Ibrahima DIALLO', contact: 'Propriétaire Villa Diamniadio', email: 'i.diallo@gmail.com', phone: '+221 77 123 45 67', subject: 'Visite chantier demandée', message: "Je souhaite visiter le chantier de ma villa le 26/12 pour constater l'avancement. Merci de confirmer la disponibilité.", date: '22/12/2025 12:00', status: 'unread', priority: 'normal', project: 'PRJ-0018', requiresResponse: true },
  { id: 'EXT-2025-0087', type: 'Avocat', sender: 'Cabinet Me SALL & Associés', contact: 'Me Fatou SALL', email: 'f.sall@sall-avocats.sn', phone: '+221 33 821 45 67', subject: 'Dossier SUNEOR - Convocation audience', message: "L'audience de référé est fixée au 03/01/2026 à 10h au TGI de Dakar. Présence du représentant légal requise.", date: '22/12/2025 10:45', status: 'read', priority: 'urgent', requiresResponse: true },
];

// --- Recouvrements (enrichis avec traçabilité) ---
export const recouvrements: Recovery[] = [
  { 
    id: 'REC-2025-0034', 
    type: 'Entreprise', 
    debiteur: 'SUNEOR SA',
    contact: 'M. Amadou DIALLO',
    email: 'compta@suneor.sn',
    phone: '+221 33 849 12 34',
    montant: '45,000,000',
    montantInitial: '45,000,000',
    montantRecouvre: '0',
    dateEcheance: '15/10/2025', 
    delay: 68, 
    status: 'contentieux', 
    relances: 5, 
    lastAction: 'Mise en demeure',
    lastActionDate: '15/12/2025',
    nextAction: 'Audience TGI',
    nextActionDate: '03/01/2026',
    projet: 'PRJ-0014',
    projetName: 'Extension usine SUNEOR',
    linkedLitigation: 'LIT-2025-0012',
    history: [
      { id: 'ACT-001', date: '20/10/2025', type: 'relance_email', description: 'Premier rappel par email', agent: 'F. DIOP', result: 'Sans réponse' },
      { id: 'ACT-002', date: '01/11/2025', type: 'relance_courrier', description: 'Relance formelle par courrier RAR', agent: 'F. DIOP', document: 'DOC-REC-001' },
      { id: 'ACT-003', date: '15/11/2025', type: 'relance_telephone', description: 'Appel au service comptabilité', agent: 'F. DIOP', result: 'Promesse de paiement sous 15 jours - Non tenue' },
      { id: 'ACT-004', date: '01/12/2025', type: 'mise_en_demeure', description: 'Mise en demeure officielle', agent: 'N. FAYE', document: 'DOC-REC-002' },
      { id: 'ACT-005', date: '15/12/2025', type: 'contentieux', description: 'Transfert au contentieux - Assignation TGI', agent: 'N. FAYE', document: 'DOC-REC-003' },
    ],
    documents: [
      { id: 'DOC-REC-001', type: 'courrier', name: 'Relance RAR n°1 - SUNEOR', date: '01/11/2025' },
      { id: 'DOC-REC-002', type: 'mise_en_demeure', name: 'Mise en demeure SUNEOR', date: '01/12/2025' },
      { id: 'DOC-REC-003', type: 'autre', name: 'Assignation TGI Dakar', date: '15/12/2025' },
    ],
  },
  { 
    id: 'REC-2025-0033', 
    type: 'Particulier', 
    debiteur: 'M. Moustapha NDIAYE',
    contact: 'M. Moustapha NDIAYE',
    email: 'm.ndiaye@gmail.com',
    phone: '+221 77 456 78 90',
    montant: '2,800,000',
    montantInitial: '2,800,000',
    montantRecouvre: '0',
    dateEcheance: '01/12/2025', 
    delay: 21, 
    status: 'huissier', 
    relances: 3,
    lastAction: 'Signification huissier',
    lastActionDate: '18/12/2025',
    nextAction: 'Saisie conservatoire',
    nextActionDate: '28/12/2025',
    history: [
      { id: 'ACT-006', date: '05/12/2025', type: 'relance_email', description: 'Premier rappel amiable', agent: 'F. DIOP' },
      { id: 'ACT-007', date: '10/12/2025', type: 'relance_telephone', description: 'Appel téléphonique - Injoignable', agent: 'F. DIOP', result: 'Numéro injoignable' },
      { id: 'ACT-008', date: '18/12/2025', type: 'huissier', description: 'Transmission dossier à Maître SALL (huissier)', agent: 'N. FAYE', document: 'DOC-REC-004' },
    ],
    documents: [
      { id: 'DOC-REC-004', type: 'huissier', name: 'Commandement de payer - NDIAYE', date: '18/12/2025' },
    ],
  },
  { 
    id: 'REC-2025-0032', 
    type: 'Entreprise', 
    debiteur: 'COMPTOIR CERAM',
    contact: 'Mme Fatou SENE',
    email: 'f.sene@comptoirceram.sn',
    phone: '+221 33 867 45 23',
    montant: '1,200,000',
    montantInitial: '1,200,000',
    montantRecouvre: '0',
    dateEcheance: '10/12/2025', 
    delay: 12, 
    status: 'relance', 
    relances: 2, 
    lastAction: 'Relance téléphonique',
    lastActionDate: '20/12/2025',
    nextAction: 'Mise en demeure',
    nextActionDate: '27/12/2025',
    projet: 'PRJ-0016',
    projetName: 'Immeuble R+4 Almadies',
    history: [
      { id: 'ACT-009', date: '12/12/2025', type: 'relance_email', description: 'Premier rappel', agent: 'F. DIOP' },
      { id: 'ACT-010', date: '20/12/2025', type: 'relance_telephone', description: 'Appel - Demande de délai', agent: 'F. DIOP', result: 'Demande échéancier sur 2 mois' },
    ],
    documents: [],
  },
  { 
    id: 'REC-2025-0031', 
    type: 'Particulier', 
    debiteur: 'Mme Aïda DIOP',
    contact: 'Mme Aïda DIOP',
    email: 'aida.diop@orange.sn',
    phone: '+221 77 234 56 78',
    montant: '850,000',
    montantInitial: '1,200,000',
    montantRecouvre: '350,000',
    dateEcheance: '05/12/2025', 
    delay: 17, 
    status: 'relance', 
    relances: 2,
    lastAction: 'Paiement partiel reçu',
    lastActionDate: '15/12/2025',
    nextAction: 'Relance solde',
    nextActionDate: '26/12/2025',
    history: [
      { id: 'ACT-011', date: '08/12/2025', type: 'relance_email', description: 'Premier rappel amiable', agent: 'F. DIOP' },
      { id: 'ACT-012', date: '15/12/2025', type: 'paiement_partiel', description: 'Réception paiement partiel 350,000 FCFA', agent: 'F. DIOP', montant: '350,000', document: 'DOC-REC-005' },
    ],
    documents: [
      { id: 'DOC-REC-005', type: 'preuve_paiement', name: 'Reçu paiement partiel DIOP', date: '15/12/2025' },
    ],
    echeancier: {
      id: 'ECH-001',
      montantTotal: '850,000',
      nbEcheances: 2,
      echeances: [
        { numero: 1, montant: '425,000', dateEcheance: '31/12/2025', status: 'pending' },
        { numero: 2, montant: '425,000', dateEcheance: '31/01/2026', status: 'pending' },
      ],
    },
  },
];

// --- Litiges (enrichis avec traçabilité procédurale) ---
export const litiges: Litigation[] = [
  { 
    id: 'LIT-2025-0012', 
    type: 'Commercial', 
    adversaire: 'SUNEOR SA',
    adversaireContact: 'M. Amadou DIALLO - DG',
    adversaireAvocat: 'Me Ibrahima NIANG',
    objet: 'Non-paiement situation travaux', 
    resume: 'SUNEOR SA refuse le paiement de la situation n°3 des travaux d\'extension invoquant des malfaçons non prouvées. Le projet est bloqué depuis 3 mois.',
    montant: '45,000,000',
    exposure: '52,000,000', // Montant + intérêts + frais potentiels
    juridiction: 'TGI Dakar', 
    numeroAffaire: 'RG 2025/4567',
    avocat: 'Me SALL',
    avocatContact: 'f.sall@sall-avocats.sn - +221 33 821 45 67',
    status: 'audience_prevue',
    statusLabel: 'Audience 03/01/2026',
    prochainRdv: '03/01/2026',
    prochainRdvType: 'Audience de référé',
    projet: 'PRJ-0014',
    projetName: 'Extension usine SUNEOR',
    dateOuverture: '15/11/2025',
    linkedRecovery: 'REC-2025-0034',
    journal: [
      { id: 'JRN-001', date: '15/11/2025', type: 'acte', title: 'Ouverture dossier contentieux', description: 'Suite à l\'échec des relances amiables, décision d\'engager une procédure', agent: 'N. FAYE' },
      { id: 'JRN-002', date: '20/11/2025', type: 'acte', title: 'Assignation en référé', description: 'Assignation délivrée par huissier au siège de SUNEOR', agent: 'N. FAYE', document: 'DOC-LIT-001' },
      { id: 'JRN-003', date: '01/12/2025', type: 'autre', title: 'Constitution adverse', description: 'SUNEOR a constitué Me NIANG pour sa défense', agent: 'N. FAYE' },
      { id: 'JRN-004', date: '10/12/2025', type: 'acte', title: 'Conclusions en réponse', description: 'Réception des conclusions adverses contestant la qualité des travaux', document: 'DOC-LIT-002' },
      { id: 'JRN-005', date: '18/12/2025', type: 'acte', title: 'Conclusions en réplique', description: 'Nos conclusions réfutant les allégations avec rapport d\'expertise amiable', agent: 'N. FAYE', document: 'DOC-LIT-003' },
    ],
    deadlines: [
      { id: 'DL-001', title: 'Audience de référé', date: '03/01/2026', type: 'audience', status: 'upcoming', description: 'Audience devant le juge des référés - TGI Dakar' },
      { id: 'DL-002', title: 'Délai conclusions', date: '27/12/2025', type: 'delai_reponse', status: 'urgent', description: 'Dernier délai pour déposer nos dernières conclusions' },
    ],
    documents: [
      { id: 'DOC-LIT-001', type: 'assignation', name: 'Assignation en référé SUNEOR', date: '20/11/2025' },
      { id: 'DOC-LIT-002', type: 'conclusions', name: 'Conclusions SUNEOR (adverse)', date: '10/12/2025' },
      { id: 'DOC-LIT-003', type: 'conclusions', name: 'Conclusions en réplique', date: '18/12/2025' },
      { id: 'DOC-LIT-004', type: 'expertise', name: 'Rapport expertise amiable travaux', date: '15/12/2025' },
    ],
  },
  { 
    id: 'LIT-2025-0011', 
    type: 'Travail', 
    adversaire: 'Ex-employé A. DIENG',
    adversaireAvocat: 'Me Oumar FALL',
    objet: 'Licenciement contesté', 
    resume: 'M. DIENG conteste son licenciement pour faute grave et réclame des dommages et intérêts ainsi que le paiement de préavis.',
    montant: '3,500,000',
    exposure: '5,200,000', // Avec risque maximal
    juridiction: 'Tribunal du Travail', 
    numeroAffaire: 'TT 2025/892',
    avocat: 'Me SALL',
    avocatContact: 'f.sall@sall-avocats.sn',
    status: 'mediation',
    statusLabel: 'Médiation en cours',
    dateOuverture: '01/10/2025',
    journal: [
      { id: 'JRN-006', date: '01/10/2025', type: 'acte', title: 'Réception assignation', description: 'Assignation reçue pour licenciement abusif', document: 'DOC-LIT-005' },
      { id: 'JRN-007', date: '15/10/2025', type: 'autre', title: 'Constitution avocat', description: 'Me SALL constitué pour notre défense' },
      { id: 'JRN-008', date: '05/11/2025', type: 'audience', title: 'Audience de conciliation', description: 'Échec de la conciliation - Renvoi pour médiation', outcome: 'Échec' },
      { id: 'JRN-009', date: '01/12/2025', type: 'mediation', title: 'Début médiation', description: 'Première séance de médiation avec médiateur désigné' },
      { id: 'JRN-010', date: '15/12/2025', type: 'mediation', title: 'Séance médiation n°2', description: 'Discussion sur proposition de transaction - En cours' },
    ],
    deadlines: [
      { id: 'DL-003', title: 'Séance médiation n°3', date: '08/01/2026', type: 'autre', status: 'upcoming', description: 'Prochaine séance pour finaliser proposition' },
    ],
    documents: [
      { id: 'DOC-LIT-005', type: 'assignation', name: 'Assignation prud\'homale DIENG', date: '01/10/2025' },
      { id: 'DOC-LIT-006', type: 'piece', name: 'Dossier disciplinaire DIENG', date: '10/10/2025' },
    ],
  },
  { 
    id: 'LIT-2025-0010', 
    type: 'Assurance', 
    adversaire: 'AXA Sénégal',
    adversaireContact: 'Service Sinistres',
    adversaireAvocat: 'Me Amadou DIAW',
    objet: 'Sinistre chantier non couvert', 
    resume: 'AXA refuse la prise en charge du sinistre survenu sur le chantier école Pikine (effondrement partiel), invoquant une exclusion de garantie.',
    montant: '8,200,000',
    exposure: '8,200,000',
    juridiction: 'TGI Dakar', 
    numeroAffaire: 'RG 2025/3421',
    avocat: 'Me DIOP',
    avocatContact: 'm.diop@cabinet-diop.sn',
    status: 'expertise',
    statusLabel: 'Expertise ordonnée',
    prochainRdv: '15/01/2026',
    prochainRdvType: 'Réunion d\'expertise',
    projet: 'PRJ-0015',
    projetName: 'Rénovation École Pikine',
    dateOuverture: '15/09/2025',
    journal: [
      { id: 'JRN-011', date: '15/09/2025', type: 'acte', title: 'Déclaration de sinistre', description: 'Déclaration faite à AXA suite effondrement partiel', document: 'DOC-LIT-007' },
      { id: 'JRN-012', date: '01/10/2025', type: 'autre', title: 'Refus de garantie', description: 'AXA notifie son refus de prise en charge', document: 'DOC-LIT-008' },
      { id: 'JRN-013', date: '15/10/2025', type: 'acte', title: 'Assignation AXA', description: 'Assignation pour obtenir la garantie', agent: 'Me DIOP' },
      { id: 'JRN-014', date: '20/11/2025', type: 'decision', title: 'Ordonnance expertise', description: 'Le juge ordonne une expertise judiciaire', outcome: 'Expertise ordonnée' },
      { id: 'JRN-015', date: '05/12/2025', type: 'expertise', title: 'Désignation expert', description: 'M. Cheikh BA désigné expert judiciaire' },
    ],
    deadlines: [
      { id: 'DL-004', title: 'Réunion d\'expertise', date: '15/01/2026', type: 'expertise', status: 'upcoming', description: 'Première réunion d\'expertise sur site' },
      { id: 'DL-005', title: 'Dépôt rapport expertise', date: '15/03/2026', type: 'expertise', status: 'upcoming', description: 'Date limite dépôt rapport expert' },
    ],
    documents: [
      { id: 'DOC-LIT-007', type: 'correspondance', name: 'Déclaration sinistre AXA', date: '15/09/2025' },
      { id: 'DOC-LIT-008', type: 'correspondance', name: 'Refus garantie AXA', date: '01/10/2025' },
      { id: 'DOC-LIT-009', type: 'jugement', name: 'Ordonnance expertise', date: '20/11/2025' },
    ],
  },
];

// --- Alertes système ---
export const systemAlerts: SystemAlert[] = [
  { id: 'a1', title: '4 dossiers bloqués > 5 jours', type: 'critical', action: 'Substitution requise' },
  { id: 'a2', title: 'Budget projet INFRA dépassé', type: 'warning', action: '+12% sur prévision' },
  { id: 'a3', title: '5 demandes urgentes en attente', type: 'warning', action: 'Délai < 24h' },
  { id: 'a4', title: 'Backup automatique OK', type: 'success', action: 'Dernière: 06h00' },
  { id: 'a5', title: '2 contrats expirent bientôt', type: 'warning', action: 'Renouvellement requis' },
];

// --- Rappels ---
export const reminders: Reminder[] = [
  { id: 'r1', title: 'Dossiers bloqués > 5 jours', time: 'Immédiat', urgent: true, icon: '🚨' },
  { id: 'r2', title: 'Réunion coordination bureaux', time: 'Dans 30 min', urgent: false, icon: '📅' },
  { id: 'r3', title: 'Rapport mensuel à soumettre', time: 'Demain 10h', urgent: false, icon: '📝' },
  { id: 'r4', title: 'Entretien annuel - I. Fall', time: 'Mer. 24 Déc', urgent: false, icon: '👥' },
];

// --- Notes ---
export const notes: Note[] = [
  { id: 'n1', content: 'Vérifier budget projet Diamniadio avant validation finale.', color: 'yellow', date: 'Il y a 2h', pinned: true },
  { id: 'n2', content: 'Codes accès nouveau système:\nAdmin: admin@yessalate', color: 'blue', date: 'Hier', pinned: false },
  { id: 'n3', content: '✅ Points validés réunion DG:\n- Extension délégation M. Sarr\n- Recrutement assistant', color: 'green', date: '20 Déc', pinned: false },
];
