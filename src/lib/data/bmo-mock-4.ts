// ============================================
// Données mockées BMO - Partie 4
// Projets & Clients - Écosystème vivant
// ============================================

import type {
  Project,
  ExternalMessage,
  Litigation,
  Recovery,
  Decision,
} from '@/lib/types/bmo.types';

// --- Types additionnels pour ce module ---

export interface Client {
  id: string;
  name: string;
  type: 'particulier' | 'entreprise' | 'institution' | 'ong';
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: 'active' | 'litige' | 'termine' | 'prospect';
  since: string;
  totalFactured: string;
  totalPaid: string;
  satisfaction: number; // 1-5
  projects: string[]; // IDs des projets
  lastContact?: string;
  notes?: string;
}

export interface ClientDemand {
  id: string;
  clientId: string;
  clientName: string;
  type: 'devis' | 'reclamation' | 'information' | 'modification' | 'nouveau_projet' | 'facturation';
  subject: string;
  description: string;
  date: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'escalated';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  assignedTo?: string;
  assignedBureau?: string;
  responseTime?: number; // jours
  response?: string;
  project?: string;
  attachments?: number;
}

export interface ProjectTimeline {
  projectId: string;
  events: ProjectTimelineEvent[];
}

export interface ProjectTimelineEvent {
  id: string;
  type: 'decision' | 'litige' | 'recouvrement' | 'message' | 'paiement' | 'contrat' | 'avancement' | 'alerte';
  title: string;
  description: string;
  date: string;
  author?: string;
  bureau?: string;
  linkedId?: string; // ID de l'élément lié (decision, litige, etc.)
  impact?: 'positive' | 'negative' | 'neutral';
  hash?: string;
}

export interface ClientHistory {
  clientId: string;
  events: ClientHistoryEvent[];
}

export interface ClientHistoryEvent {
  id: string;
  type: 'message' | 'demande' | 'paiement' | 'projet' | 'litige' | 'visite';
  title: string;
  description: string;
  date: string;
  status?: string;
  linkedId?: string;
}

// --- Clients ---
export const clients: Client[] = [
  {
    id: 'CLIENT-001',
    name: 'SONATEL',
    type: 'entreprise',
    satisfaction: 4.2,
    projects: ['PRJ-2025-DKR', 'PRJ-2026-THS'],
    // Champs optionnels pour compatibilité
    contact: 'SONATEL',
    email: 'contact@sonatel.sn',
    phone: '+221 33 839 00 00',
    address: 'Dakar, Plateau',
    status: 'active',
    since: '01/01/2020',
    totalFactured: '3,300,000,000',
    totalPaid: '2,422,000,000',
    lastContact: '22/12/2025',
    notes: 'Client stratégique - Multi-projets',
  },
  {
    id: 'CLIENT-002',
    name: 'Copropriété Dakar Nord',
    type: 'particulier',
    satisfaction: 3.8,
    projects: ['PRJ-2025-DKN'],
    // Champs optionnels pour compatibilité
    contact: 'Copropriété Dakar Nord',
    email: 'contact@copropriete-dkn.sn',
    phone: '+221 77 123 45 67',
    address: 'Dakar Nord',
    status: 'active',
    since: '15/03/2024',
    totalFactured: '12,500,000,000',
    totalPaid: '9,800,000,000',
    lastContact: '22/12/2025',
    notes: 'Lotissement 50 villas',
  },
  {
    id: 'CLIENT-003',
    name: 'Ministère de la Santé',
    type: 'institution',
    satisfaction: 4.5,
    projects: ['PRJ-2025-ZGP'],
    // Champs optionnels pour compatibilité
    contact: 'Ministère de la Santé',
    email: 'contact@sante.gouv.sn',
    phone: '+221 33 839 00 00',
    address: 'Dakar, Plateau',
    status: 'active',
    since: '01/06/2024',
    totalFactured: '8,900,000,000',
    totalPaid: '3,720,000,000',
    lastContact: '20/12/2025',
    notes: 'Pôle santé régional Ziguinchor',
  },
  {
    id: 'CLI-001',
    name: 'M. Ibrahima DIALLO',
    type: 'particulier',
    satisfaction: 4,
    projects: ['PRJ-0018'],
    // Champs optionnels pour compatibilité
    contact: 'M. Ibrahima DIALLO',
    email: 'i.diallo@gmail.com',
    phone: '+221 77 123 45 67',
    address: 'Dakar, Mermoz',
    status: 'active',
    since: '15/03/2024',
    totalFactured: '36,400,000',
    totalPaid: '24,700,000',
    lastContact: '22/12/2025',
    notes: 'Client VIP - Projet villa haut de gamme',
  },
  {
    id: 'CLI-002',
    name: 'Mairie de Rufisque',
    type: 'institution',
    contact: 'M. Amadou NDIAYE - DG Services Techniques',
    email: 'services.techniques@mairie-rufisque.sn',
    phone: '+221 33 836 12 34',
    address: 'Rufisque, Hôtel de Ville',
    status: 'active',
    since: '01/06/2024',
    totalFactured: '125,000,000',
    totalPaid: '56,200,000',
    satisfaction: 4,
    projects: ['PRJ-0017'],
    lastContact: '20/12/2025',
    notes: 'Marché public - Paiement sur certification',
  },
  {
    id: 'CLI-003',
    name: 'SCI Teranga Immobilier',
    type: 'entreprise',
    contact: 'Mme Fatou SARR - Gérante',
    email: 'f.sarr@teranga-immo.sn',
    phone: '+221 77 456 78 90',
    address: 'Dakar, Plateau',
    status: 'active',
    since: '10/01/2023',
    totalFactured: '89,000,000',
    totalPaid: '81,900,000',
    satisfaction: 5,
    projects: ['PRJ-0016'],
    lastContact: '19/12/2025',
    notes: 'Client fidèle - 3ème projet ensemble',
  },
  {
    id: 'CLI-004',
    name: 'IEF Pikine',
    type: 'institution',
    contact: 'M. Oumar DIOP - Inspecteur',
    email: 'ief.pikine@education.gouv.sn',
    phone: '+221 33 834 56 78',
    address: 'Pikine, Centre',
    status: 'termine',
    since: '15/09/2024',
    totalFactured: '18,000,000',
    totalPaid: '18,000,000',
    satisfaction: 5,
    projects: ['PRJ-0015'],
    lastContact: '01/12/2025',
    notes: 'Projet terminé avec succès - Potentiel renouvellement',
  },
  {
    id: 'CLI-005',
    name: 'SUNEOR SA',
    type: 'entreprise',
    contact: 'M. Mamadou FALL - Directeur Industriel',
    email: 'm.fall@suneor.sn',
    phone: '+221 33 839 00 00',
    address: 'Dakar, Zone Industrielle',
    status: 'litige',
    since: '01/02/2024',
    totalFactured: '245,000,000',
    totalPaid: '56,400,000',
    satisfaction: 2,
    projects: ['PRJ-0014'],
    lastContact: '22/12/2025',
    notes: 'LITIGE EN COURS - Audience TGI 03/01/2026',
  },
  {
    id: 'CLI-006',
    name: 'M. Moustapha NDIAYE',
    type: 'particulier',
    contact: 'M. Moustapha NDIAYE',
    email: 'm.ndiaye@yahoo.fr',
    phone: '+221 77 234 56 78',
    address: 'Thiès, Mbour 2',
    status: 'litige',
    since: '01/06/2023',
    totalFactured: '12,500,000',
    totalPaid: '9,700,000',
    satisfaction: 2,
    projects: [],
    lastContact: '15/12/2025',
    notes: 'Recouvrement en cours - Huissier mandaté',
  },
  {
    id: 'CLI-007',
    name: 'Mme Aïda DIOP',
    type: 'particulier',
    contact: 'Mme Aïda DIOP',
    email: 'aida.diop@hotmail.com',
    phone: '+221 77 345 67 89',
    address: 'Dakar, Sacré-Cœur',
    status: 'active',
    since: '15/08/2024',
    totalFactured: '8,500,000',
    totalPaid: '7,650,000',
    satisfaction: 3,
    projects: [],
    lastContact: '10/12/2025',
    notes: 'Petit projet rénovation - Retard paiement mineur',
  },
  {
    id: 'CLI-008',
    name: 'ONG Habitat Pour Tous',
    type: 'ong',
    contact: 'M. Jean-Pierre MENDY - Directeur',
    email: 'jp.mendy@habitatpourtous.org',
    phone: '+221 33 842 11 22',
    address: 'Dakar, Grand Yoff',
    status: 'prospect',
    since: '01/12/2025',
    totalFactured: '0',
    totalPaid: '0',
    satisfaction: 0,
    projects: [],
    lastContact: '18/12/2025',
    notes: 'Prospect - Projet logements sociaux en discussion',
  },
];

// --- Tickets clients ---
export const clientDemands: ClientDemand[] = [
  {
    id: 'DCLI-2025-0045',
    clientId: 'CLI-001',
    clientName: 'M. Ibrahima DIALLO',
    type: 'modification',
    subject: 'Modification plan terrasse',
    description: 'Le client souhaite agrandir la terrasse de 15m² et ajouter une pergola. Demande étude de faisabilité et devis modificatif.',
    date: '22/12/2025',
    status: 'pending',
    priority: 'high',
    assignedTo: 'M. BA',
    assignedBureau: 'BM',
    project: 'PRJ-0018',
    attachments: 2,
  },
  {
    id: 'DCLI-2025-0044',
    clientId: 'CLI-002',
    clientName: 'Mairie de Rufisque',
    type: 'information',
    subject: 'Point avancement travaux Zone B',
    description: 'Demande de rapport détaillé sur l\'avancement des travaux pour le conseil municipal du 28/12.',
    date: '22/12/2025',
    status: 'in_progress',
    priority: 'urgent',
    assignedTo: 'C. GUEYE',
    assignedBureau: 'BCT',
    project: 'PRJ-0017',
    responseTime: 1,
  },
  {
    id: 'DCLI-2025-0043',
    clientId: 'CLI-001',
    clientName: 'M. Ibrahima DIALLO',
    type: 'information',
    subject: 'Visite chantier demandée',
    description: 'Le client souhaite visiter le chantier de sa villa le 26/12 pour constater l\'avancement.',
    date: '22/12/2025',
    status: 'pending',
    priority: 'normal',
    project: 'PRJ-0018',
  },
  {
    id: 'DCLI-2025-0042',
    clientId: 'CLI-003',
    clientName: 'SCI Teranga Immobilier',
    type: 'reclamation',
    subject: 'Finitions non conformes niveau 3',
    description: 'Problème signalé sur les finitions peinture du 3ème niveau. Traces et irrégularités visibles.',
    date: '21/12/2025',
    status: 'in_progress',
    priority: 'high',
    assignedTo: 'S. MBAYE',
    assignedBureau: 'BQC',
    project: 'PRJ-0016',
    responseTime: 2,
  },
  {
    id: 'DCLI-2025-0041',
    clientId: 'CLI-005',
    clientName: 'SUNEOR SA',
    type: 'reclamation',
    subject: 'Contestation situation n°3',
    description: 'SUNEOR conteste les quantités facturées sur la situation n°3. Demande révision.',
    date: '20/12/2025',
    status: 'escalated',
    priority: 'urgent',
    assignedTo: 'N. FAYE',
    assignedBureau: 'BJ',
    project: 'PRJ-0014',
    responseTime: 5,
  },
  {
    id: 'DCLI-2025-0040',
    clientId: 'CLI-008',
    clientName: 'ONG Habitat Pour Tous',
    type: 'nouveau_projet',
    subject: 'Demande devis construction 50 logements',
    description: 'Projet de construction de 50 logements sociaux à Keur Massar. Budget estimé: 800M FCFA. Financement AFD.',
    date: '18/12/2025',
    status: 'pending',
    priority: 'high',
    attachments: 5,
  },
  {
    id: 'DCLI-2025-0039',
    clientId: 'CLI-004',
    clientName: 'IEF Pikine',
    type: 'facturation',
    subject: 'Demande facture finale',
    description: 'Demande de facture de solde pour clôture comptable année 2025.',
    date: '17/12/2025',
    status: 'resolved',
    priority: 'normal',
    assignedTo: 'F. DIOP',
    assignedBureau: 'BF',
    responseTime: 1,
    response: 'Facture envoyée par email le 18/12/2025 - Ref: FAC-2025-FINAL-PRJ0015',
  },
  {
    id: 'DCLI-2025-0038',
    clientId: 'CLI-007',
    clientName: 'Mme Aïda DIOP',
    type: 'facturation',
    subject: 'Demande échéancier paiement',
    description: 'La cliente demande un échéancier pour le solde restant de 850,000 FCFA.',
    date: '15/12/2025',
    status: 'resolved',
    priority: 'normal',
    assignedTo: 'F. DIOP',
    assignedBureau: 'BF',
    responseTime: 2,
    response: 'Échéancier accordé: 3 mensualités de 283,333 FCFA à partir du 15/01/2026',
  },
];

// --- Timeline par projet ---
export const projectTimelines: ProjectTimeline[] = [
  {
    projectId: 'PRJ-2025-DKR',
    events: [
      {
        id: 'EVT-001',
        type: 'decision',
        title: 'Lancement projet',
        description: 'Approbation DG',
        date: '15/01/2025',
        author: 'A. DIALLO',
        bureau: 'BMO',
        impact: 'positive',
        hash: 'SHA3-256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      },
      {
        id: 'EVT-002',
        type: 'message',
        title: 'Demande livraison acier',
        description: 'Retard de 15j annoncé',
        date: '22/03/2025',
        author: 'Fournisseur ACIER-SEN',
        bureau: 'BA-DAKAR',
        impact: 'negative',
      },
    ],
  },
  {
    projectId: 'PRJ-2025-ZGP',
    events: [
      {
        id: 'EVT-003',
        type: 'decision',
        title: 'Projet validé sous réserve',
        description: 'Blocage juridique à résoudre',
        date: '10/02/2025',
        author: 'A. DIALLO',
        bureau: 'BMO',
        impact: 'neutral',
        hash: 'SHA3-256:b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
      },
      {
        id: 'EVT-004',
        type: 'alerte',
        title: 'Retard administratif',
        description: 'Pénurie matériel signalée',
        date: '15/03/2025',
        bureau: 'BA-ZIGUINCHOR',
        impact: 'negative',
      },
    ],
  },
  {
    projectId: 'PRJ-2025-DKN',
    events: [
      {
        id: 'EVT-005',
        type: 'decision',
        title: 'Lotissement approuvé',
        description: 'Validation par lot autorisée',
        date: '20/01/2025',
        author: 'A. DIALLO',
        bureau: 'BMO',
        impact: 'positive',
        hash: 'SHA3-256:c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
      },
      {
        id: 'EVT-006',
        type: 'avancement',
        title: 'Avancement 78%',
        description: 'Livraison phase 3 en cours',
        date: '22/12/2025',
        bureau: 'BA-DAKAR-NORD',
        impact: 'positive',
      },
    ],
  },
  {
    projectId: 'PRJ-2026-THS',
    events: [
      {
        id: 'EVT-007',
        type: 'decision',
        title: 'Projet terminé',
        description: 'Conformité totale',
        date: '15/12/2025',
        author: 'A. DIALLO',
        bureau: 'BMO',
        impact: 'positive',
        hash: 'SHA3-256:d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
      },
    ],
  },
  {
    projectId: 'PRJ-0018',
    events: [
      { id: 'EVT-001', type: 'avancement', title: 'Avancement 68%', description: 'Gros œuvre terminé. Démarrage second œuvre.', date: '22/12/2025', bureau: 'BCT', impact: 'positive' },
      { id: 'EVT-002', type: 'message', title: 'Visite client demandée', description: 'M. DIALLO souhaite visiter le chantier le 26/12', date: '22/12/2025', linkedId: 'EXT-2025-0088', impact: 'neutral' },
      { id: 'EVT-003', type: 'paiement', title: 'Situation n°3 payée', description: 'Paiement reçu: 8,500,000 FCFA', date: '20/12/2025', bureau: 'BF', impact: 'positive' },
      { id: 'EVT-004', type: 'contrat', title: 'Avenant terrasse signé', description: 'Extension terrasse +15m² - Montant: 3,500,000 FCFA', date: '18/12/2025', linkedId: 'AVN-2025-0033', impact: 'positive' },
      { id: 'EVT-005', type: 'decision', title: 'BC Ciment validé', description: 'BC-2025-0156 approuvé par DG', date: '17/12/2025', author: 'A. DIALLO', hash: 'SHA3:8f4a2b...', impact: 'positive' },
      { id: 'EVT-006', type: 'alerte', title: 'Retard livraison fer', description: 'Retard fournisseur SENFER - Impact planning', date: '15/12/2025', bureau: 'BA', impact: 'negative' },
    ],
  },
  {
    projectId: 'PRJ-0017',
    events: [
      { id: 'EVT-010', type: 'decision', title: 'Avenant délai signé', description: 'Extension +45 jours accordée', date: '21/12/2025', author: 'A. DIALLO', linkedId: 'AVN-2025-0034', hash: 'SHA3:3c7e1d...', impact: 'neutral' },
      { id: 'EVT-011', type: 'message', title: 'Rapport demandé', description: 'Mairie demande rapport pour conseil municipal', date: '22/12/2025', linkedId: 'DCLI-2025-0044', impact: 'neutral' },
      { id: 'EVT-012', type: 'alerte', title: 'Dépassement budget +12%', description: 'Alerte BF - Arbitrage DG requis', date: '22/12/2025', bureau: 'BF', impact: 'negative' },
      { id: 'EVT-013', type: 'paiement', title: 'Situation n°4 en attente', description: '18,500,000 FCFA - Échéance 30/12', date: '22/12/2025', linkedId: 'PAY-2025-0098', impact: 'neutral' },
    ],
  },
  {
    projectId: 'PRJ-0016',
    events: [
      { id: 'EVT-020', type: 'avancement', title: 'Avancement 92%', description: 'Finitions en cours. Livraison prévue 15/01/2026', date: '22/12/2025', bureau: 'BCT', impact: 'positive' },
      { id: 'EVT-021', type: 'message', title: 'Réclamation finitions', description: 'Client signale problème peinture niveau 3', date: '21/12/2025', linkedId: 'DCLI-2025-0042', impact: 'negative' },
      { id: 'EVT-022', type: 'paiement', title: 'Acompte reçu', description: '8,900,000 FCFA - Reste à facturer: 7,100,000 FCFA', date: '19/12/2025', impact: 'positive' },
    ],
  },
  {
    projectId: 'PRJ-0015',
    events: [
      { id: 'EVT-030', type: 'avancement', title: 'Projet terminé ✓', description: 'Réception définitive prononcée', date: '01/12/2025', bureau: 'BQC', impact: 'positive' },
      { id: 'EVT-031', type: 'paiement', title: 'Solde payé', description: 'Paiement final reçu: 1,800,000 FCFA', date: '28/11/2025', bureau: 'BF', impact: 'positive' },
      { id: 'EVT-032', type: 'decision', title: 'PV réception signé', description: 'PV signé par IEF Pikine et DG', date: '25/11/2025', author: 'A. DIALLO', hash: 'SHA3:9a2f5c...', impact: 'positive' },
    ],
  },
  {
    projectId: 'PRJ-0014',
    events: [
      { id: 'EVT-040', type: 'litige', title: 'Audience TGI 03/01/2026', description: 'Référé - Représentant légal requis', date: '22/12/2025', linkedId: 'LIT-2025-0012', impact: 'negative' },
      { id: 'EVT-041', type: 'message', title: 'Réclamation SUNEOR', description: 'Contestation situation n°3', date: '20/12/2025', linkedId: 'DCLI-2025-0041', impact: 'negative' },
      { id: 'EVT-042', type: 'recouvrement', title: 'Recouvrement actif', description: 'Créance: 45,000,000 FCFA - Retard: 68 jours', date: '15/12/2025', linkedId: 'REC-2025-0034', impact: 'negative' },
      { id: 'EVT-043', type: 'alerte', title: 'Projet bloqué', description: 'Arrêt travaux suite non-paiement', date: '15/10/2025', impact: 'negative' },
      { id: 'EVT-044', type: 'decision', title: 'Mise en demeure envoyée', description: 'Lettre RAR envoyée à SUNEOR', date: '01/10/2025', author: 'N. FAYE', bureau: 'BJ', hash: 'SHA3:1b8d4e...', impact: 'neutral' },
    ],
  },
];

// --- Historique par client ---
export const clientHistories: ClientHistory[] = [
  {
    clientId: 'CLI-001',
    events: [
      { id: 'HCLI-001', type: 'message', title: 'Visite chantier demandée', description: 'Demande visite le 26/12/2025', date: '22/12/2025', linkedId: 'EXT-2025-0088' },
      { id: 'HCLI-002', type: 'demande', title: 'Modification terrasse', description: 'Demande extension terrasse +15m²', date: '22/12/2025', linkedId: 'DCLI-2025-0045' },
      { id: 'HCLI-003', type: 'paiement', title: 'Paiement situation n°3', description: '8,500,000 FCFA reçu', date: '20/12/2025', status: 'Validé' },
      { id: 'HCLI-004', type: 'visite', title: 'Visite chantier', description: 'Client satisfait de l\'avancement', date: '15/12/2025', status: 'Effectuée' },
      { id: 'HCLI-005', type: 'projet', title: 'Démarrage Villa Diamniadio', description: 'Signature contrat - Budget: 36.4M FCFA', date: '15/03/2024', linkedId: 'PRJ-0018' },
    ],
  },
  {
    clientId: 'CLI-002',
    events: [
      { id: 'HCLI-010', type: 'demande', title: 'Rapport avancement demandé', description: 'Pour conseil municipal 28/12', date: '22/12/2025', linkedId: 'DCLI-2025-0044' },
      { id: 'HCLI-011', type: 'paiement', title: 'Certification n°3', description: '18,500,000 FCFA en cours', date: '22/12/2025', status: 'En attente' },
      { id: 'HCLI-012', type: 'projet', title: 'Avenant délai signé', description: 'Extension +45 jours', date: '21/12/2025' },
    ],
  },
  {
    clientId: 'CLI-005',
    events: [
      { id: 'HCLI-030', type: 'litige', title: 'Audience référé', description: 'TGI Dakar - 03/01/2026', date: '22/12/2025', linkedId: 'LIT-2025-0012' },
      { id: 'HCLI-031', type: 'demande', title: 'Contestation facture', description: 'SUNEOR conteste situation n°3', date: '20/12/2025', linkedId: 'DCLI-2025-0041', status: 'Escaladé' },
      { id: 'HCLI-032', type: 'message', title: 'Mise en demeure', description: 'Envoi lettre RAR', date: '01/10/2025', status: 'Envoyé' },
    ],
  },
];

// --- Projets enrichis avec données complètes ---
export const projectsEnriched: (Project & {
  clientId?: string; // Conservé pour compatibilité
  clientSatisfaction?: number; // Conservé pour compatibilité
  risks: string[];
  nextMilestone: string;
  nextMilestoneOverdue?: boolean;
  lastDecision?: string;
  linkedLitiges: string[];
  linkedRecouvrements: string[];
  linkedContracts: string[];
  linkedPayments: string[];
})[] = [
  {
    id: 'PRJ-2025-DKR',
    name: 'Construction siège SONATEL Dakar',
    client: 'SONATEL', // Conservé pour compatibilité
    status: 'active',
    progress: 65,
    budget: '2450000000',
    spent: '1580000000',
    clientIds: ['CLIENT-001'],
    buildingIds: ['BLDG-001'],
    bureau: 'BA-DAKAR',
    team: 24,
    risks: ['Retard livraison acier', 'Conflit voisinage'],
    nextMilestone: 'Fin second œuvre',
    nextMilestoneOverdue: false,
    linkedLitiges: [],
    linkedPayments: ['PAY-2025-0012', 'PAY-2025-0015'],
    linkedContracts: ['CTR-2025-0088'],
    linkedRecouvrements: [],
    domains: ['travaux', 'fournitures', 'services'],
    nomenclatureFamilies: ['F10-02', 'F20-01', 'S10-01', 'C10-01'],
    decisionBMO: {
      decisionId: 'DEC-PRJ-2025-DKR',
      origin: 'validation-projet',
      validatorRole: 'A',
      hash: 'SHA3-256:a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
      comment: 'Projet approuvé — budget conforme nomenclature BMO',
    },
  },
  {
    id: 'PRJ-2025-ZGP',
    name: 'Pôle santé régional Ziguinchor',
    client: 'Ministère de la Santé', // Conservé pour compatibilité
    status: 'blocked',
    progress: 42,
    budget: '8900000000',
    spent: '3720000000',
    clientIds: ['CLIENT-003'],
    buildingIds: ['BLDG-002'],
    bureau: 'BA-ZIGUINCHOR',
    team: 41,
    risks: ['Retard administratif', 'Pénurie matériel'],
    nextMilestone: 'Livraison bloc B',
    nextMilestoneOverdue: true,
    linkedLitiges: ['LIT-2025-003'],
    linkedPayments: ['PAY-2025-0022'],
    linkedContracts: ['CTR-2025-0091'],
    linkedRecouvrements: [],
    domains: ['travaux', 'fournitures', 'services', 'logistique'],
    nomenclatureFamilies: ['F10-01', 'F10-02', 'F20-01', 'S20-01', 'S10-01'],
    decisionBMO: {
      decisionId: 'DEC-PRJ-2025-ZGP',
      origin: 'validation-projet',
      validatorRole: 'A',
      hash: 'SHA3-256:b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
      comment: 'Projet validé sous réserve — blocage juridique à résoudre',
    },
  },
  {
    id: 'PRJ-2025-DKN',
    name: 'Lotissement 50 villas Dakar Nord',
    client: 'Copropriété Dakar Nord', // Conservé pour compatibilité
    status: 'active',
    progress: 78,
    budget: '12500000000',
    spent: '9800000000',
    clientIds: ['CLIENT-002'],
    buildingIds: ['BLDG-003', 'BLDG-004'],
    bureau: 'BA-DAKAR-NORD',
    team: 63,
    risks: ['Retard livraison carrelage', 'Conflit sous-traitants'],
    nextMilestone: 'Livraison phase 3',
    nextMilestoneOverdue: false,
    linkedLitiges: [],
    linkedPayments: ['PAY-2025-0031'],
    linkedContracts: ['CTR-2025-0095'],
    linkedRecouvrements: [],
    domains: ['travaux', 'fournitures', 'logistique'],
    nomenclatureFamilies: ['F10-02', 'F20-01', 'S20-01'],
    decisionBMO: {
      decisionId: 'DEC-PRJ-2025-DKN',
      origin: 'validation-projet',
      validatorRole: 'A',
      hash: 'SHA3-256:c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
      comment: 'Lotissement approuvé — validation par lot autorisée',
    },
  },
  {
    id: 'PRJ-2026-THS',
    name: 'Rénovation data center SONATEL Thiès',
    client: 'SONATEL', // Conservé pour compatibilité
    status: 'completed',
    progress: 100,
    budget: '850000000',
    spent: '842000000',
    clientIds: ['CLIENT-001'],
    buildingIds: [],
    bureau: 'BA-THIES',
    team: 8,
    risks: [],
    nextMilestone: 'Clôture administrative',
    nextMilestoneOverdue: false,
    linkedLitiges: [],
    linkedPayments: ['PAY-2026-0005'],
    linkedContracts: ['CTR-2026-0012'],
    linkedRecouvrements: [],
    domains: ['fournitures', 'services'],
    nomenclatureFamilies: ['F30-01', 'S30-01'],
    decisionBMO: {
      decisionId: 'DEC-PRJ-2026-THS',
      origin: 'validation-projet',
      validatorRole: 'A',
      hash: 'SHA3-256:d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
      comment: 'Projet terminé — conformité totale',
    },
  },
  // Projets existants conservés pour compatibilité
  {
    id: 'PRJ-0018',
    name: 'Villa Diamniadio',
    client: 'M. Diallo',
    clientId: 'CLI-001',
    budget: '36.4M',
    spent: '24.7M',
    progress: 68,
    status: 'active',
    bureau: 'BCT',
    team: 8,
    clientSatisfaction: 4,
    risks: ['Retard livraison matériaux', 'Modification client en cours'],
    nextMilestone: 'Fin gros œuvre - 31/12/2025',
    lastDecision: 'DEC-2025-0089',
    linkedLitiges: [],
    linkedRecouvrements: [],
    linkedContracts: ['CTR-2024-0142'],
    linkedPayments: ['PAY-2025-0097'],
    clientIds: ['CLI-001'],
    buildingIds: [],
    domains: ['travaux', 'fournitures'],
    nomenclatureFamilies: ['F10-02'],
  },
];

// --- Stats agrégées clients ---
export const clientStats = {
  total: clients.length,
  active: clients.filter((c) => c.status === 'active').length,
  litige: clients.filter((c) => c.status === 'litige').length,
  termine: clients.filter((c) => c.status === 'termine').length,
  prospect: clients.filter((c) => c.status === 'prospect').length,
  avgSatisfaction: Math.round(
    clients.filter((c) => c.satisfaction > 0).reduce((acc, c) => acc + c.satisfaction, 0) /
    clients.filter((c) => c.satisfaction > 0).length * 10
  ) / 10,
  totalFactured: clients.reduce((acc, c) => {
    const amount = parseFloat(c.totalFactured.replace(/[,\s]/g, '')) || 0;
    return acc + amount;
  }, 0),
  totalPaid: clients.reduce((acc, c) => {
    const amount = parseFloat(c.totalPaid.replace(/[,\s]/g, '')) || 0;
    return acc + amount;
  }, 0),
};

// --- Stats agrégées tickets clients ---
export const clientDemandStats = {
  total: clientDemands.length,
  pending: clientDemands.filter((d) => d.status === 'pending').length,
  inProgress: clientDemands.filter((d) => d.status === 'in_progress').length,
  resolved: clientDemands.filter((d) => d.status === 'resolved').length,
  escalated: clientDemands.filter((d) => d.status === 'escalated').length,
  avgResponseTime: Math.round(
    clientDemands.filter((d) => d.responseTime).reduce((acc, d) => acc + (d.responseTime || 0), 0) /
    clientDemands.filter((d) => d.responseTime).length
  ),
};
