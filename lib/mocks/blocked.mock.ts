/**
 * Mock Data - Dossiers Bloqués
 * =============================
 * 
 * Données réalistes pour le développement et les tests
 */

export interface BlockedDossier {
  id: string;
  reference: string;
  titre: string;
  description: string;
  type: 'validation' | 'approbation' | 'paiement' | 'document' | 'arbitrage';
  status: 'nouveau' | 'en_cours' | 'escalade' | 'bloque' | 'resolu' | 'annule';
  priorite: 'low' | 'medium' | 'high' | 'urgent' | 'critique';
  bureauId: string;
  bureauNom: string;
  projetId?: string;
  projetNom?: string;
  clientId?: string;
  clientNom?: string;
  responsableId: string;
  responsableNom: string;
  valideurId?: string;
  valideurNom?: string;
  dateCreation: string;
  dateEcheance?: string;
  dateResolution?: string;
  raisonBlocage: string;
  resolution?: string;
  montant?: number;
  devise?: string;
  documents: string[];
  commentaires: number;
  notifications: number;
  assigne: boolean;
  enWatchlist: boolean;
  tags: string[];
  metadata?: Record<string, unknown>;
}

export const mockBlockedDossiers: BlockedDossier[] = [
  {
    id: 'BLK-2026-001',
    reference: 'BLK-2026-001',
    titre: 'Validation paiement facture fournisseur - AGEROUTE',
    description: 'Paiement facture n°FAC-2026-0425 de 25 000 000 FCFA pour travaux route RN7 - Validation requise niveau 2',
    type: 'paiement',
    status: 'en_cours',
    priorite: 'high',
    bureauId: 'BUR-001',
    bureauNom: 'Bureau Dakar',
    projetId: 'PRJ-2026-001',
    projetNom: 'Construction Route Nationale RN7',
    clientId: 'CLI-001',
    clientNom: 'AGEROUTE Sénégal',
    responsableId: 'USR-001',
    responsableNom: 'Amadou DIALLO',
    valideurId: 'USR-050',
    valideurNom: 'Mamadou MBAYE',
    dateCreation: '2026-01-08T10:30:00Z',
    dateEcheance: '2026-01-12T17:00:00Z',
    raisonBlocage: 'Montant supérieur au seuil de validation automatique (20M FCFA). Validation hiérarchique niveau 2 requise.',
    montant: 25000000,
    devise: 'FCFA',
    documents: ['DOC-001', 'DOC-002', 'DOC-003'],
    commentaires: 3,
    notifications: 5,
    assigne: true,
    enWatchlist: false,
    tags: ['paiement', 'urgence', 'validation-niveau-2'],
  },
  {
    id: 'BLK-2026-002',
    reference: 'BLK-2026-002',
    titre: 'Approbation dépassement budget - Pont Sénégal-Gambie',
    description: 'Demande de dépassement budget de 150M FCFA pour pont Sénégal-Gambie. Justification: imprévus géotechniques.',
    type: 'approbation',
    status: 'escalade',
    priorite: 'critique',
    bureauId: 'BUR-002',
    bureauNom: 'Bureau Kaolack',
    projetId: 'PRJ-2026-002',
    projetNom: 'Pont Sénégal-Gambie',
    clientId: 'CLI-002',
    clientNom: 'Ministère des Travaux Publics',
    responsableId: 'USR-002',
    responsableNom: 'Fatou NDIAYE',
    valideurId: 'USR-050',
    valideurNom: 'Mamadou MBAYE',
    dateCreation: '2026-01-05T08:00:00Z',
    dateEcheance: '2026-01-15T17:00:00Z',
    raisonBlocage: 'Dépassement budget > 10%. Approbation direction générale requise. Consultation conseil d\'administration nécessaire.',
    montant: 150000000,
    devise: 'FCFA',
    documents: ['DOC-004', 'DOC-005', 'DOC-006', 'DOC-007'],
    commentaires: 8,
    notifications: 12,
    assigne: true,
    enWatchlist: true,
    tags: ['budget', 'devalidation', 'direction', 'conseil-admin'],
  },
  {
    id: 'BLK-2026-003',
    reference: 'BLK-2026-003',
    titre: 'Validation contrat sous-traitant - Entreprise ABC',
    description: 'Validation nouveau contrat sous-traitant pour travaux spécialisés béton armé. Contrat de 45M FCFA.',
    type: 'validation',
    status: 'nouveau',
    priorite: 'medium',
    bureauId: 'BUR-001',
    bureauNom: 'Bureau Dakar',
    projetId: 'PRJ-2026-003',
    projetNom: 'Autoroute Dakar-Thiès',
    responsableId: 'USR-003',
    responsableNom: 'Ibrahima SALL',
    dateCreation: '2026-01-10T14:20:00Z',
    dateEcheance: '2026-01-17T17:00:00Z',
    raisonBlocage: 'Nouveau sous-traitant. Vérification références et garanties requise avant validation.',
    montant: 45000000,
    devise: 'FCFA',
    documents: ['DOC-008', 'DOC-009'],
    commentaires: 0,
    notifications: 1,
    assigne: false,
    enWatchlist: false,
    tags: ['contrat', 'sous-traitant', 'nouveau-partenaires'],
  },
  {
    id: 'BLK-2026-004',
    reference: 'BLK-2026-004',
    titre: 'Document manquant - Certificat de conformité travaux',
    description: 'Certificat de conformité manquant pour réception travaux route RN7. Blocage paiement solde final.',
    type: 'document',
    status: 'bloque',
    priorite: 'urgent',
    bureauId: 'BUR-001',
    bureauNom: 'Bureau Dakar',
    projetId: 'PRJ-2026-001',
    projetNom: 'Construction Route Nationale RN7',
    clientId: 'CLI-001',
    clientNom: 'AGEROUTE Sénégal',
    responsableId: 'USR-004',
    responsableNom: 'Aissatou FALL',
    dateCreation: '2026-01-07T09:15:00Z',
    dateEcheance: '2026-01-11T17:00:00Z',
    raisonBlocage: 'Document obligatoire manquant. Paiement solde final (125M FCFA) bloqué jusqu\'à réception document.',
    montant: 125000000,
    devise: 'FCFA',
    documents: [],
    commentaires: 5,
    notifications: 7,
    assigne: true,
    enWatchlist: true,
    tags: ['document', 'conformité', 'paiement-bloqué'],
  },
  {
    id: 'BLK-2026-005',
    reference: 'BLK-2026-005',
    titre: 'Litige client - Retard livraison projet école',
    description: 'Litige client concernant retard livraison projet école primaire. Réclamation indemnités retard.',
    type: 'arbitrage',
    status: 'en_cours',
    priorite: 'high',
    bureauId: 'BUR-003',
    bureauNom: 'Bureau Thiès',
    projetId: 'PRJ-2026-004',
    projetNom: 'École Primaire Pikine',
    clientId: 'CLI-003',
    clientNom: 'Ministère de l\'Éducation',
    responsableId: 'USR-005',
    responsableNom: 'Oumar BA',
    dateCreation: '2026-01-09T11:45:00Z',
    dateEcheance: '2026-01-20T17:00:00Z',
    raisonBlocage: 'Litige contractual. Arbitrage direction requise. Analyse causes retard et négociation indemnités.',
    montant: 8000000,
    devise: 'FCFA',
    documents: ['DOC-010', 'DOC-011', 'DOC-012'],
    commentaires: 12,
    notifications: 15,
    assigne: true,
    enWatchlist: true,
    tags: ['litige', 'retard', 'arbitrage', 'négociation'],
  },
  {
    id: 'BLK-2026-006',
    reference: 'BLK-2026-006',
    titre: 'Validation changement planning - Corniche Dakar',
    description: 'Demande modification planning travaux Corniche Dakar. Report de 2 semaines pour travaux connexes.',
    type: 'validation',
    status: 'resolu',
    priorite: 'medium',
    bureauId: 'BUR-001',
    bureauNom: 'Bureau Dakar',
    projetId: 'PRJ-2026-005',
    projetNom: 'Aménagement Corniche Dakar',
    responsableId: 'USR-001',
    responsableNom: 'Amadou DIALLO',
    valideurId: 'USR-050',
    valideurNom: 'Mamadou MBAYE',
    dateCreation: '2026-01-03T08:30:00Z',
    dateEcheance: '2026-01-08T17:00:00Z',
    dateResolution: '2026-01-08T16:45:00Z',
    raisonBlocage: 'Modification planning > 10 jours. Validation client requise.',
    resolution: 'Validation accordée. Report accepté par client. Nouveau planning validé.',
    documents: ['DOC-013', 'DOC-014'],
    commentaires: 4,
    notifications: 6,
    assigne: true,
    enWatchlist: false,
    tags: ['planning', 'modification', 'resolu'],
  },
];

export const mockBlockedStats = {
  total: 6,
  parStatus: {
    nouveau: 1,
    en_cours: 2,
    escalade: 1,
    bloque: 1,
    resolu: 1,
    annule: 0,
  },
  parPriorite: {
    low: 0,
    medium: 2,
    high: 2,
    urgent: 1,
    critique: 1,
  },
  parType: {
    validation: 2,
    approbation: 1,
    paiement: 1,
    document: 1,
    arbitrage: 1,
  },
  enRetard: 2,
  aResoudreAujourdhui: 1,
  aResoudreCetteSemaine: 3,
};

