/**
 * Mock Data - Commentaires
 * =========================
 * 
 * Données réalistes pour le développement et les tests
 */

export interface Comment {
  id: string;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  mentions?: string[];
  reactions?: {
    [key: string]: number;
  };
  isEdited: boolean;
  isDeleted: boolean;
  parentId?: string;
  replies?: Comment[];
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

export const mockComments: Comment[] = [
  {
    id: 'CMT-001',
    entityType: 'blocked',
    entityId: 'BLK-2026-001',
    userId: 'USR-001',
    userName: 'Amadou DIALLO',
    userAvatar: '/avatars/amadou-diallo.jpg',
    content: 'J\'ai vérifié la facture et tous les justificatifs sont conformes. Recommandation: validation niveau 2.',
    mentions: [],
    reactions: {
      '👍': 3,
      '👏': 2,
    },
    isEdited: false,
    isDeleted: false,
    createdAt: '2026-01-08T11:00:00Z',
    updatedAt: '2026-01-08T11:00:00Z',
  },
  {
    id: 'CMT-002',
    entityType: 'blocked',
    entityId: 'BLK-2026-001',
    userId: 'USR-002',
    userName: 'Fatou NDIAYE',
    userAvatar: '/avatars/fatou-ndiaye.jpg',
    content: 'Merci @Amadou DIALLO pour la vérification. Je confirme la validation.',
    mentions: ['USR-001'],
    reactions: {
      '👍': 2,
    },
    isEdited: false,
    isDeleted: false,
    parentId: 'CMT-001',
    createdAt: '2026-01-08T11:30:00Z',
    updatedAt: '2026-01-08T11:30:00Z',
  },
  {
    id: 'CMT-003',
    entityType: 'blocked',
    entityId: 'BLK-2026-002',
    userId: 'USR-050',
    userName: 'Mamadou MBAYE',
    userAvatar: '/avatars/mamadou-mbaye.jpg',
    content: 'Le dépassement budget nécessite une justification technique plus détaillée. Merci de fournir le rapport géotechnique complet.',
    mentions: [],
    reactions: {
      '👀': 5,
    },
    isEdited: false,
    isDeleted: false,
    createdAt: '2026-01-05T09:00:00Z',
    updatedAt: '2026-01-05T09:00:00Z',
  },
  {
    id: 'CMT-004',
    entityType: 'projet',
    entityId: 'PRJ-2026-001',
    userId: 'USR-001',
    userName: 'Amadou DIALLO',
    userAvatar: '/avatars/amadou-diallo.jpg',
    content: 'Point d\'avancement projet: 73% complété. Retard de 2 jours sur le planning initial. Pas d\'impact majeur prévu.',
    mentions: [],
    reactions: {
      '✅': 4,
      '👍': 3,
    },
    isEdited: false,
    isDeleted: false,
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'CMT-005',
    entityType: 'blocked',
    entityId: 'BLK-2026-005',
    userId: 'USR-005',
    userName: 'Oumar BA',
    userAvatar: '/avatars/oumar-ba.jpg',
    content: 'Analyse des causes du retard: Conditions météorologiques défavorables (15 jours de pluie consécutifs). Proposition indemnités: 5M FCFA.',
    mentions: ['USR-050'],
    reactions: {
      '📊': 2,
      '💼': 1,
    },
    isEdited: true,
    isDeleted: false,
    createdAt: '2026-01-09T12:00:00Z',
    updatedAt: '2026-01-09T14:30:00Z',
  },
  {
    id: 'CMT-006',
    entityType: 'blocked',
    entityId: 'BLK-2026-004',
    userId: 'USR-004',
    userName: 'Aissatou FALL',
    userAvatar: '/avatars/aissatou-fall.jpg',
    content: 'Certificat de conformité en cours de traitement par le bureau de contrôle. Réception prévue sous 48h.',
    mentions: [],
    reactions: {
      '⏰': 3,
    },
    isEdited: false,
    isDeleted: false,
    createdAt: '2026-01-07T10:00:00Z',
    updatedAt: '2026-01-07T10:00:00Z',
  },
];

// Commentaires organisés par entité
export const mockCommentsByEntity: Record<string, Comment[]> = {
  'blocked:BLK-2026-001': [
    mockComments[0],
    mockComments[1],
  ],
  'blocked:BLK-2026-002': [
    mockComments[2],
  ],
  'blocked:BLK-2026-005': [
    mockComments[4],
  ],
  'blocked:BLK-2026-004': [
    mockComments[5],
  ],
  'projet:PRJ-2026-001': [
    mockComments[3],
  ],
};

