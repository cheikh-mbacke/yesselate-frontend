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
  CalendarEvent,
  Reminder,
  Note,
  SystemAlert,
  PerformanceData,
  RACIRow,
  AuditItem,
  Consigne,
  NavSection,
  Organigramme,
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

// --- Demandes RH ---
export const demandesRH: HRRequest[] = [
  { id: 'RH-2025-0089', type: 'Congé', subtype: 'Annuel', agent: 'Cheikh GUEYE', initials: 'CG', bureau: 'BCT', startDate: '26/12/2025', endDate: '05/01/2026', days: 10, reason: "Fêtes de fin d'année", status: 'pending', date: '20/12/2025', priority: 'normal' },
  { id: 'RH-2025-0088', type: 'Dépense', subtype: 'Mission', agent: 'Modou DIOP', initials: 'MD', bureau: 'BCT', amount: '125,000', reason: 'Frais déplacement chantier Thiès', status: 'pending', date: '21/12/2025', priority: 'normal' },
  { id: 'RH-2025-0087', type: 'Maladie', subtype: 'Arrêt', agent: 'Rama SY', initials: 'RS', bureau: 'BF', startDate: '22/12/2025', endDate: '27/12/2025', days: 5, reason: 'Certificat médical fourni', status: 'pending', date: '22/12/2025', priority: 'high' },
  { id: 'RH-2025-0086', type: 'Déplacement', subtype: 'Mission', agent: 'Ndèye FAYE', initials: 'NF', bureau: 'BJ', destination: 'Ziguinchor', startDate: '02/01/2026', endDate: '04/01/2026', days: 3, reason: 'Audience tribunal - Litige SUNEOR', status: 'pending', date: '21/12/2025', priority: 'urgent' },
  { id: 'RH-2025-0085', type: 'Dépense', subtype: 'Équipement', agent: 'Pape NDIAYE', initials: 'PN', bureau: 'BA', amount: '85,000', reason: 'Achat EPI chantier (casques, gants)', status: 'pending', date: '20/12/2025', priority: 'normal' },
  { id: 'RH-2025-0084', type: 'Congé', subtype: 'Maternité', agent: 'Coumba FALL', initials: 'CF', bureau: 'BA', startDate: '15/01/2026', endDate: '15/04/2026', days: 90, reason: 'Congé maternité légal', status: 'pending', date: '19/12/2025', priority: 'high' },
  { id: 'RH-2025-0083', type: 'Paie', subtype: 'Avance', agent: 'Samba NIANG', initials: 'SN', bureau: 'BCT', amount: '200,000', reason: 'Avance sur salaire - Urgence familiale', status: 'pending', date: '22/12/2025', priority: 'urgent' },
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

// --- Recouvrements ---
export const recouvrements: Recovery[] = [
  { id: 'REC-2025-0034', type: 'Entreprise', debiteur: 'SUNEOR SA', montant: '45,000,000', dateEcheance: '15/10/2025', delay: 68, status: 'contentieux', relances: 5, projet: 'PRJ-0014' },
  { id: 'REC-2025-0033', type: 'Particulier', debiteur: 'M. Moustapha NDIAYE', montant: '2,800,000', dateEcheance: '01/12/2025', delay: 21, status: 'huissier', relances: 3 },
  { id: 'REC-2025-0032', type: 'Entreprise', debiteur: 'COMPTOIR CERAM', montant: '1,200,000', dateEcheance: '10/12/2025', delay: 12, status: 'relance', relances: 2, projet: 'PRJ-0016' },
  { id: 'REC-2025-0031', type: 'Particulier', debiteur: 'Mme Aïda DIOP', montant: '850,000', dateEcheance: '05/12/2025', delay: 17, status: 'relance', relances: 2 },
];

// --- Litiges ---
export const litiges: Litigation[] = [
  { id: 'LIT-2025-0012', type: 'Commercial', adversaire: 'SUNEOR SA', objet: 'Non-paiement situation travaux', montant: '45,000,000', juridiction: 'TGI Dakar', avocat: 'Me SALL', status: 'Audience 03/01/2026', prochainRdv: '03/01/2026', projet: 'PRJ-0014' },
  { id: 'LIT-2025-0011', type: 'Travail', adversaire: 'Ex-employé A. DIENG', objet: 'Licenciement contesté', montant: '3,500,000', juridiction: 'Tribunal du Travail', avocat: 'Me SALL', status: 'Médiation en cours' },
  { id: 'LIT-2025-0010', type: 'Assurance', adversaire: 'AXA Sénégal', objet: 'Sinistre chantier non couvert', montant: '8,200,000', juridiction: 'TGI Dakar', avocat: 'Me DIOP', status: 'Expertise ordonnée', projet: 'PRJ-0015' },
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
