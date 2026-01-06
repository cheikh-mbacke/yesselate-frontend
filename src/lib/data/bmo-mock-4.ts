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
    id: 'CLI-001',
    name: 'M. Ibrahima DIALLO',
    type: 'particulier',
    contact: 'M. Ibrahima DIALLO',
    email: 'i.diallo@gmail.com',
    phone: '+221 77 123 45 67',
    address: 'Dakar, Mermoz',
    status: 'active',
    since: '15/03/2024',
    totalFactured: '36,400,000',
    totalPaid: '24,700,000',
    satisfaction: 4,
    projects: ['PRJ-0018'],
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
  clientId: string;
  clientSatisfaction: number;
  risks: string[];
  nextMilestone: string;
  lastDecision?: string;
  linkedLitiges: string[];
  linkedRecouvrements: string[];
  linkedContracts: string[];
  linkedPayments: string[];
})[] = [
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
  },
  {
    id: 'PRJ-0017',
    name: 'Route Zone B',
    client: 'Mairie Rufisque',
    clientId: 'CLI-002',
    budget: '125M',
    spent: '56.2M',
    progress: 45,
    status: 'active',
    bureau: 'BM',
    team: 15,
    clientSatisfaction: 4,
    risks: ['Dépassement budget +12%', 'Retard délai initial'],
    nextMilestone: 'Fin terrassement - 15/01/2026',
    lastDecision: 'DEC-2025-0087',
    linkedLitiges: [],
    linkedRecouvrements: [],
    linkedContracts: ['CTR-2024-0156'],
    linkedPayments: ['PAY-2025-0098'],
  },
  {
    id: 'PRJ-0016',
    name: 'Immeuble R+4 Almadies',
    client: 'SCI Teranga',
    clientId: 'CLI-003',
    budget: '89M',
    spent: '81.9M',
    progress: 92,
    status: 'active',
    bureau: 'BCT',
    team: 12,
    clientSatisfaction: 5,
    risks: ['Réclamation finitions en cours'],
    nextMilestone: 'Livraison - 15/01/2026',
    linkedLitiges: [],
    linkedRecouvrements: ['REC-2025-0032'],
    linkedContracts: ['CTR-2024-0138'],
    linkedPayments: ['PAY-2025-0096'],
  },
  {
    id: 'PRJ-0015',
    name: 'Rénovation École Pikine',
    client: 'IEF Pikine',
    clientId: 'CLI-004',
    budget: '18M',
    spent: '18M',
    progress: 100,
    status: 'completed',
    bureau: 'BQC',
    team: 6,
    clientSatisfaction: 5,
    risks: [],
    nextMilestone: 'Projet terminé',
    linkedLitiges: ['LIT-2025-0010'],
    linkedRecouvrements: [],
    linkedContracts: [],
    linkedPayments: ['PAY-2025-0095'],
  },
  {
    id: 'PRJ-0014',
    name: 'Extension usine SUNEOR',
    client: 'SUNEOR SA',
    clientId: 'CLI-005',
    budget: '245M',
    spent: '56.4M',
    progress: 23,
    status: 'blocked',
    bureau: 'BJ',
    team: 20,
    clientSatisfaction: 2,
    risks: ['Litige actif - TGI', 'Non-paiement 45M FCFA', 'Arrêt travaux'],
    nextMilestone: 'Audience TGI - 03/01/2026',
    lastDecision: 'DEC-2025-0086',
    linkedLitiges: ['LIT-2025-0012'],
    linkedRecouvrements: ['REC-2025-0034'],
    linkedContracts: [],
    linkedPayments: [],
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
