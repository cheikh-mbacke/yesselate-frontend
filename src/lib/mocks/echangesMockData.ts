/**
 * Mock Data - Échanges Inter-Bureaux
 * Données réalistes pour développement et tests
 */

export interface ExchangeDetail {
  id: string;
  ref: string;
  sujet: string;
  message: string;
  status: 'pending' | 'resolved' | 'escalated';
  priority: 'urgent' | 'high' | 'normal';
  bureauFrom: { id: string; name: string; code: string };
  bureauTo: { id: string; name: string; code: string };
  auteur: { id: string; name: string; email: string; avatar?: string };
  dateCreation: string;
  dateDerniereModif?: string;
  dateResolution?: string;
  project?: { id: string; name: string; code: string };
  attachments: Attachment[];
  responses: ExchangeResponse[];
  timeline: TimelineEvent[];
  metadata: {
    type: 'demande' | 'information' | 'validation' | 'escalade';
    tags: string[];
    relatedExchanges?: string[];
  };
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: { id: string; name: string };
}

export interface ExchangeResponse {
  id: string;
  content: string;
  author: { id: string; name: string; email: string; avatar?: string };
  createdAt: string;
  attachments?: Attachment[];
  isInternal: boolean;
}

export interface TimelineEvent {
  id: string;
  type: 'created' | 'updated' | 'responded' | 'escalated' | 'resolved' | 'assigned' | 'attachment_added';
  timestamp: string;
  user: { id: string; name: string };
  description: string;
  metadata?: Record<string, any>;
}

// Mock data réaliste
export const mockExchangeDetails: ExchangeDetail[] = [
  {
    id: 'ECH-2026-001',
    ref: 'ECH-2026-001',
    sujet: 'Demande validation budget projet Alpha',
    message: 'Bonjour,\n\nJe sollicite votre validation pour le déblocage du budget alloué au projet Alpha. Les fonds sont nécessaires pour la phase 2 qui démarre le 15 janvier.\n\nMerci de votre retour rapide.\n\nCordialement,\nJean Dupont',
    status: 'pending',
    priority: 'urgent',
    bureauFrom: { id: 'BT', name: 'Bureau Technique', code: 'BT' },
    bureauTo: { id: 'DAF', name: 'Direction Administrative et Financière', code: 'DAF' },
    auteur: {
      id: 'EMP001',
      name: 'Jean Dupont',
      email: 'jean.dupont@example.com',
      avatar: 'JD',
    },
    dateCreation: '2026-01-09T10:30:00Z',
    dateDerniereModif: '2026-01-09T14:20:00Z',
    project: { id: 'PRJ-001', name: 'Projet Alpha', code: 'ALPHA' },
    attachments: [
      {
        id: 'ATT001',
        name: 'Budget_Projet_Alpha_2026.pdf',
        size: 245678,
        type: 'application/pdf',
        url: '/attachments/ATT001.pdf',
        uploadedAt: '2026-01-09T10:30:00Z',
        uploadedBy: { id: 'EMP001', name: 'Jean Dupont' },
      },
      {
        id: 'ATT002',
        name: 'Planning_Phase2.xlsx',
        size: 89123,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        url: '/attachments/ATT002.xlsx',
        uploadedAt: '2026-01-09T10:31:00Z',
        uploadedBy: { id: 'EMP001', name: 'Jean Dupont' },
      },
      {
        id: 'ATT003',
        name: 'Justificatifs_Depenses.pdf',
        size: 456789,
        type: 'application/pdf',
        url: '/attachments/ATT003.pdf',
        uploadedAt: '2026-01-09T10:32:00Z',
        uploadedBy: { id: 'EMP001', name: 'Jean Dupont' },
      },
    ],
    responses: [
      {
        id: 'RESP001',
        content: 'Bonjour,\n\nJ\'ai bien reçu votre demande. Je vais examiner le dossier et vous donner une réponse sous 48h.\n\nCordialement,\nMarie Finance',
        author: {
          id: 'EMP010',
          name: 'Marie Finance',
          email: 'marie.finance@example.com',
          avatar: 'MF',
        },
        createdAt: '2026-01-09T11:15:00Z',
        isInternal: false,
      },
      {
        id: 'RESP002',
        content: 'Merci pour votre retour. En attendant, je prépare les éléments complémentaires que vous pourriez solliciter.',
        author: {
          id: 'EMP001',
          name: 'Jean Dupont',
          email: 'jean.dupont@example.com',
          avatar: 'JD',
        },
        createdAt: '2026-01-09T14:20:00Z',
        isInternal: false,
      },
    ],
    timeline: [
      {
        id: 'TIMELINE001',
        type: 'created',
        timestamp: '2026-01-09T10:30:00Z',
        user: { id: 'EMP001', name: 'Jean Dupont' },
        description: 'Échange créé',
      },
      {
        id: 'TIMELINE002',
        type: 'attachment_added',
        timestamp: '2026-01-09T10:32:00Z',
        user: { id: 'EMP001', name: 'Jean Dupont' },
        description: '3 pièces jointes ajoutées',
        metadata: { count: 3 },
      },
      {
        id: 'TIMELINE003',
        type: 'responded',
        timestamp: '2026-01-09T11:15:00Z',
        user: { id: 'EMP010', name: 'Marie Finance' },
        description: 'Réponse ajoutée',
      },
      {
        id: 'TIMELINE004',
        type: 'updated',
        timestamp: '2026-01-09T14:20:00Z',
        user: { id: 'EMP001', name: 'Jean Dupont' },
        description: 'Échange mis à jour',
      },
      {
        id: 'TIMELINE005',
        type: 'responded',
        timestamp: '2026-01-09T14:20:00Z',
        user: { id: 'EMP001', name: 'Jean Dupont' },
        description: 'Réponse ajoutée',
      },
    ],
    metadata: {
      type: 'validation',
      tags: ['budget', 'projet-alpha', 'urgent'],
      relatedExchanges: ['ECH-2026-002'],
    },
  },
  {
    id: 'ECH-2026-003',
    ref: 'ECH-2026-003',
    sujet: 'Clarification contrat fournisseur',
    message: 'Bonjour,\n\nNous avons besoin de clarifications concernant la clause 5.2 du contrat avec le fournisseur XYZ. Cette clause semble ambiguë et pourrait poser problème.\n\nPourriez-vous nous donner votre avis juridique?\n\nMerci,\nPaul Martin',
    status: 'escalated',
    priority: 'urgent',
    bureauFrom: { id: 'BAP', name: 'Bureau Achats et Partenariats', code: 'BAP' },
    bureauTo: { id: 'BJ', name: 'Bureau Juridique', code: 'BJ' },
    auteur: {
      id: 'EMP003',
      name: 'Paul Martin',
      email: 'paul.martin@example.com',
      avatar: 'PM',
    },
    dateCreation: '2026-01-05T09:00:00Z',
    dateDerniereModif: '2026-01-10T16:45:00Z',
    attachments: [
      {
        id: 'ATT004',
        name: 'Contrat_Fournisseur_XYZ.pdf',
        size: 1234567,
        type: 'application/pdf',
        url: '/attachments/ATT004.pdf',
        uploadedAt: '2026-01-05T09:00:00Z',
        uploadedBy: { id: 'EMP003', name: 'Paul Martin' },
      },
      {
        id: 'ATT005',
        name: 'Analyse_Juridique_Preliminaire.docx',
        size: 34567,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        url: '/attachments/ATT005.docx',
        uploadedAt: '2026-01-08T11:30:00Z',
        uploadedBy: { id: 'EMP020', name: 'Sophie Juridique' },
      },
    ],
    responses: [
      {
        id: 'RESP003',
        content: 'Nous examinons le contrat et vous reviendrons avec une analyse détaillée.',
        author: {
          id: 'EMP020',
          name: 'Sophie Juridique',
          email: 'sophie.juridique@example.com',
          avatar: 'SJ',
        },
        createdAt: '2026-01-06T14:00:00Z',
        isInternal: false,
      },
      {
        id: 'RESP004',
        content: 'Après analyse, nous confirmons que la clause est effectivement problématique. Nous recommandons une renégociation.',
        author: {
          id: 'EMP020',
          name: 'Sophie Juridique',
          email: 'sophie.juridique@example.com',
          avatar: 'SJ',
        },
        createdAt: '2026-01-08T11:30:00Z',
        isInternal: false,
        attachments: [
          {
            id: 'ATT005',
            name: 'Analyse_Juridique_Preliminaire.docx',
            size: 34567,
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            url: '/attachments/ATT005.docx',
            uploadedAt: '2026-01-08T11:30:00Z',
            uploadedBy: { id: 'EMP020', name: 'Sophie Juridique' },
          },
        ],
      },
    ],
    timeline: [
      {
        id: 'TIMELINE006',
        type: 'created',
        timestamp: '2026-01-05T09:00:00Z',
        user: { id: 'EMP003', name: 'Paul Martin' },
        description: 'Échange créé',
      },
      {
        id: 'TIMELINE007',
        type: 'responded',
        timestamp: '2026-01-06T14:00:00Z',
        user: { id: 'EMP020', name: 'Sophie Juridique' },
        description: 'Réponse ajoutée',
      },
      {
        id: 'TIMELINE008',
        type: 'escalated',
        timestamp: '2026-01-08T10:00:00Z',
        user: { id: 'EMP003', name: 'Paul Martin' },
        description: 'Échange escaladé - Priorité élevée',
        metadata: { reason: 'Délai dépassé' },
      },
      {
        id: 'TIMELINE009',
        type: 'responded',
        timestamp: '2026-01-08T11:30:00Z',
        user: { id: 'EMP020', name: 'Sophie Juridique' },
        description: 'Réponse avec pièce jointe',
      },
      {
        id: 'TIMELINE010',
        type: 'updated',
        timestamp: '2026-01-10T16:45:00Z',
        user: { id: 'EMP003', name: 'Paul Martin' },
        description: 'Échange mis à jour',
      },
    ],
    metadata: {
      type: 'escalade',
      tags: ['juridique', 'contrat', 'fournisseur'],
    },
  },
  {
    id: 'ECH-2026-005',
    ref: 'ECH-2026-005',
    sujet: 'Validation technique plans architecturaux',
    message: 'Bonjour,\n\nLes plans architecturaux ont été révisés suite aux remarques du client. Pouvez-vous procéder à la validation technique finale?\n\nLes documents sont en pièce jointe.\n\nCordialement,\nAhmed Koné',
    status: 'pending',
    priority: 'high',
    bureauFrom: { id: 'BT', name: 'Bureau Technique', code: 'BT' },
    bureauTo: { id: 'BMO', name: 'Bureau Maître d\'Ouvrage', code: 'BMO' },
    auteur: {
      id: 'EMP005',
      name: 'Ahmed Koné',
      email: 'ahmed.kone@example.com',
      avatar: 'AK',
    },
    dateCreation: '2026-01-08T08:30:00Z',
    dateDerniereModif: '2026-01-08T08:30:00Z',
    attachments: [
      {
        id: 'ATT006',
        name: 'Plans_Architecturaux_Rev2.pdf',
        size: 5678901,
        type: 'application/pdf',
        url: '/attachments/ATT006.pdf',
        uploadedAt: '2026-01-08T08:30:00Z',
        uploadedBy: { id: 'EMP005', name: 'Ahmed Koné' },
      },
      {
        id: 'ATT007',
        name: 'Coupes_Techniques.pdf',
        size: 2345678,
        type: 'application/pdf',
        url: '/attachments/ATT007.pdf',
        uploadedAt: '2026-01-08T08:30:00Z',
        uploadedBy: { id: 'EMP005', name: 'Ahmed Koné' },
      },
      {
        id: 'ATT008',
        name: 'Liste_Modifications.xlsx',
        size: 45678,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        url: '/attachments/ATT008.xlsx',
        uploadedAt: '2026-01-08T08:30:00Z',
        uploadedBy: { id: 'EMP005', name: 'Ahmed Koné' },
      },
      {
        id: 'ATT009',
        name: 'Remarques_Client.pdf',
        size: 123456,
        type: 'application/pdf',
        url: '/attachments/ATT009.pdf',
        uploadedAt: '2026-01-08T08:30:00Z',
        uploadedBy: { id: 'EMP005', name: 'Ahmed Koné' },
      },
      {
        id: 'ATT010',
        name: 'Fiche_Technique_Rev2.pdf',
        size: 345678,
        type: 'application/pdf',
        url: '/attachments/ATT010.pdf',
        uploadedAt: '2026-01-08T08:30:00Z',
        uploadedBy: { id: 'EMP005', name: 'Ahmed Koné' },
      },
    ],
    responses: [],
    timeline: [
      {
        id: 'TIMELINE011',
        type: 'created',
        timestamp: '2026-01-08T08:30:00Z',
        user: { id: 'EMP005', name: 'Ahmed Koné' },
        description: 'Échange créé',
      },
      {
        id: 'TIMELINE012',
        type: 'attachment_added',
        timestamp: '2026-01-08T08:30:00Z',
        user: { id: 'EMP005', name: 'Ahmed Koné' },
        description: '5 pièces jointes ajoutées',
        metadata: { count: 5 },
      },
    ],
    metadata: {
      type: 'validation',
      tags: ['technique', 'plans', 'architecture'],
    },
  },
];

// Helper pour formater les tailles de fichiers
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Helper pour obtenir un échange par ID
export function getExchangeById(id: string): ExchangeDetail | undefined {
  return mockExchangeDetails.find(e => e.id === id);
}

// Helper pour obtenir tous les échanges
export function getAllExchanges(): ExchangeDetail[] {
  return mockExchangeDetails;
}

