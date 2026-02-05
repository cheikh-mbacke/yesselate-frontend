/**
 * Mock Data - Timeline / Historique
 * ===================================
 * 
 * Données réalistes pour le développement et les tests
 */

export interface TimelineEvent {
  id: string;
  entityType: string;
  entityId: string;
  type: 'creation' | 'update' | 'status_change' | 'assignment' | 'comment' | 'document' | 'resolution' | 'escalation';
  userId: string;
  userName: string;
  userAvatar?: string;
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: 'EVT-001',
    entityType: 'blocked',
    entityId: 'BLK-2026-001',
    type: 'creation',
    userId: 'USR-001',
    userName: 'Amadou DIALLO',
    userAvatar: '/avatars/amadou-diallo.jpg',
    title: 'Dossier créé',
    description: 'Dossier bloqué créé pour validation paiement facture fournisseur',
    metadata: { montant: 25000000, devise: 'FCFA' },
    createdAt: '2026-01-08T10:30:00Z',
  },
  {
    id: 'EVT-002',
    entityType: 'blocked',
    entityId: 'BLK-2026-001',
    type: 'assignment',
    userId: 'SYSTEM',
    userName: 'Système',
    title: 'Assignation automatique',
    description: 'Dossier assigné à Mamadou MBAYE (Validation niveau 2)',
    metadata: { assigneId: 'USR-050', assigneNom: 'Mamadou MBAYE' },
    createdAt: '2026-01-08T10:31:00Z',
  },
  {
    id: 'EVT-003',
    entityType: 'blocked',
    entityId: 'BLK-2026-001',
    type: 'comment',
    userId: 'USR-001',
    userName: 'Amadou DIALLO',
    userAvatar: '/avatars/amadou-diallo.jpg',
    title: 'Commentaire ajouté',
    description: 'J\'ai vérifié la facture et tous les justificatifs sont conformes',
    metadata: { commentId: 'CMT-001' },
    createdAt: '2026-01-08T11:00:00Z',
  },
  {
    id: 'EVT-004',
    entityType: 'blocked',
    entityId: 'BLK-2026-002',
    type: 'escalation',
    userId: 'USR-050',
    userName: 'Mamadou MBAYE',
    userAvatar: '/avatars/mamadou-mbaye.jpg',
    title: 'Escalade vers direction',
    description: 'Dossier escaladé vers la direction générale pour approbation',
    metadata: { niveau: 'direction-generale', raison: 'Dépassement budget > 10%' },
    createdAt: '2026-01-06T14:00:00Z',
  },
  {
    id: 'EVT-005',
    entityType: 'blocked',
    entityId: 'BLK-2026-006',
    type: 'resolution',
    userId: 'USR-050',
    userName: 'Mamadou MBAYE',
    userAvatar: '/avatars/mamadou-mbaye.jpg',
    title: 'Dossier résolu',
    description: 'Validation accordée. Report accepté par client. Nouveau planning validé.',
    metadata: { resolution: 'approuve', dateResolution: '2026-01-08T16:45:00Z' },
    createdAt: '2026-01-08T16:45:00Z',
  },
  {
    id: 'EVT-006',
    entityType: 'blocked',
    entityId: 'BLK-2026-001',
    type: 'status_change',
    userId: 'SYSTEM',
    userName: 'Système',
    title: 'Changement de statut',
    description: 'Statut changé de "nouveau" à "en_cours"',
    metadata: { ancienStatus: 'nouveau', nouveauStatus: 'en_cours' },
    createdAt: '2026-01-08T10:31:00Z',
  },
  {
    id: 'EVT-007',
    entityType: 'blocked',
    entityId: 'BLK-2026-004',
    type: 'document',
    userId: 'USR-004',
    userName: 'Aissatou FALL',
    userAvatar: '/avatars/aissatou-fall.jpg',
    title: 'Document ajouté',
    description: 'Rapport géotechnique ajouté',
    metadata: { documentId: 'DOC-015', documentNom: 'Rapport géotechnique.pdf' },
    createdAt: '2026-01-09T09:00:00Z',
  },
  {
    id: 'EVT-008',
    entityType: 'projet',
    entityId: 'PRJ-2026-001',
    type: 'update',
    userId: 'USR-001',
    userName: 'Amadou DIALLO',
    userAvatar: '/avatars/amadou-diallo.jpg',
    title: 'Projet mis à jour',
    description: 'Avancement projet mis à jour: 73% (augmentation de 5%)',
    metadata: { champ: 'avancement', ancienneValeur: 68, nouvelleValeur: 73 },
    createdAt: '2026-01-10T08:00:00Z',
  },
];

// Événements organisés par entité
export const mockTimelineByEntity: Record<string, TimelineEvent[]> = {
  'blocked:BLK-2026-001': [
    mockTimelineEvents[0],
    mockTimelineEvents[1],
    mockTimelineEvents[5],
    mockTimelineEvents[2],
  ],
  'blocked:BLK-2026-002': [
    mockTimelineEvents[3],
  ],
  'blocked:BLK-2026-004': [
    mockTimelineEvents[6],
  ],
  'blocked:BLK-2026-006': [
    mockTimelineEvents[4],
  ],
  'projet:PRJ-2026-001': [
    mockTimelineEvents[7],
  ],
};

