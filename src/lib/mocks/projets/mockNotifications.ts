/**
 * Mock Data - Notifications
 * Notifications et alertes pour le tableau de bord projets
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type NotificationType = 'critical' | 'warning' | 'info' | 'success';
export type NotificationCategory = 
  | 'project' 
  | 'milestone' 
  | 'budget' 
  | 'team' 
  | 'risk' 
  | 'approval' 
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  projectId?: string;
  projectTitle?: string;
  link?: string;
  createdAt: string;
  read: boolean;
  readAt?: string;
  actionRequired: boolean;
  actionLabel?: string;
  actionLink?: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationGroup {
  date: string;
  label: string;
  notifications: Notification[];
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

export const mockNotifications: Notification[] = [
  // Critiques
  {
    id: 'NOTIF-001',
    type: 'critical',
    category: 'project',
    title: 'Retard critique - Pont de Kaolack',
    message: 'Le projet PRJ-002 accuse un retard de 3 semaines. Plan de rattrapage requis.',
    projectId: 'PRJ-002',
    projectTitle: 'Pont de Kaolack',
    link: '/maitre-ouvrage/projets-en-cours?project=PRJ-002',
    createdAt: '2026-01-10T08:30:00Z',
    read: false,
    actionRequired: true,
    actionLabel: 'Voir le projet',
    actionLink: '/maitre-ouvrage/projets-en-cours?project=PRJ-002',
  },
  {
    id: 'NOTIF-002',
    type: 'critical',
    category: 'budget',
    title: 'Dépassement budget - PRJ-002',
    message: 'Prévision de dépassement de 60M XOF sur le projet Pont de Kaolack.',
    projectId: 'PRJ-002',
    projectTitle: 'Pont de Kaolack',
    createdAt: '2026-01-09T16:00:00Z',
    read: false,
    actionRequired: true,
    actionLabel: 'Réviser le budget',
    actionLink: '/maitre-ouvrage/projets-en-cours?project=PRJ-002&tab=budget',
  },

  // Warnings
  {
    id: 'NOTIF-003',
    type: 'warning',
    category: 'budget',
    title: 'Budget matériaux à 87%',
    message: 'Le budget matériaux du projet RN7 atteint 87% de consommation.',
    projectId: 'PRJ-001',
    projectTitle: 'Route Nationale RN7 - Tronçon Est',
    createdAt: '2026-01-10T06:00:00Z',
    read: false,
    actionRequired: false,
  },
  {
    id: 'NOTIF-004',
    type: 'warning',
    category: 'milestone',
    title: 'Jalon en approche - Tronçon km 20-30',
    message: 'Le jalon "Achèvement tronçon km 20-30" est prévu dans 36 jours.',
    projectId: 'PRJ-001',
    projectTitle: 'Route Nationale RN7 - Tronçon Est',
    createdAt: '2026-01-10T07:00:00Z',
    read: true,
    readAt: '2026-01-10T09:00:00Z',
    actionRequired: false,
  },
  {
    id: 'NOTIF-005',
    type: 'warning',
    category: 'risk',
    title: 'Risque identifié - Approvisionnement',
    message: 'Risque de rupture de stock bitume signalé pour le projet RN7.',
    projectId: 'PRJ-001',
    projectTitle: 'Route Nationale RN7 - Tronçon Est',
    createdAt: '2026-01-09T14:00:00Z',
    read: true,
    readAt: '2026-01-09T15:30:00Z',
    actionRequired: false,
  },
  {
    id: 'NOTIF-006',
    type: 'warning',
    category: 'team',
    title: 'Équipe surchargée',
    message: 'L\'équipe Ouvrages d\'art BM a un taux d\'utilisation de 94%.',
    createdAt: '2026-01-09T10:00:00Z',
    read: true,
    readAt: '2026-01-09T11:00:00Z',
    actionRequired: false,
  },

  // Success
  {
    id: 'NOTIF-007',
    type: 'success',
    category: 'project',
    title: 'Projet terminé - Hôpital Sikasso',
    message: 'Le projet PRJ-006 a été livré avec succès le 28/12/2025.',
    projectId: 'PRJ-006',
    projectTitle: 'Hôpital Régional Sikasso',
    createdAt: '2025-12-28T15:00:00Z',
    read: true,
    readAt: '2025-12-28T16:00:00Z',
    actionRequired: false,
  },
  {
    id: 'NOTIF-008',
    type: 'success',
    category: 'milestone',
    title: 'Jalon complété - Terrassement',
    message: 'Le jalon "Terrassement piste Phase 1" a été complété avec 2 jours d\'avance.',
    projectId: 'PRJ-007',
    projectTitle: 'Aéroport Régional Bobo-Dioulasso',
    createdAt: '2026-01-08T17:00:00Z',
    read: true,
    readAt: '2026-01-09T08:00:00Z',
    actionRequired: false,
  },
  {
    id: 'NOTIF-009',
    type: 'success',
    category: 'milestone',
    title: 'Gros œuvre N2 terminé',
    message: 'Centre Commercial Bamako - Gros œuvre niveau 2 achevé.',
    projectId: 'PRJ-003',
    projectTitle: 'Centre Commercial Bamako',
    createdAt: '2025-12-29T17:00:00Z',
    read: true,
    readAt: '2025-12-30T08:00:00Z',
    actionRequired: false,
  },

  // Info
  {
    id: 'NOTIF-010',
    type: 'info',
    category: 'approval',
    title: 'Révision budgétaire approuvée',
    message: 'La révision budgétaire de +250M XOF pour le projet RN7 a été approuvée.',
    projectId: 'PRJ-001',
    projectTitle: 'Route Nationale RN7 - Tronçon Est',
    createdAt: '2025-12-15T14:00:00Z',
    read: true,
    readAt: '2025-12-15T15:00:00Z',
    actionRequired: false,
  },
  {
    id: 'NOTIF-011',
    type: 'info',
    category: 'project',
    title: 'Nouveau projet en planification',
    message: 'Le projet "Logements Sociaux Dakar" (PRJ-009) est entré en phase de planification.',
    projectId: 'PRJ-009',
    projectTitle: 'Logements Sociaux Dakar',
    createdAt: '2025-12-01T10:00:00Z',
    read: true,
    readAt: '2025-12-01T11:00:00Z',
    actionRequired: false,
  },
  {
    id: 'NOTIF-012',
    type: 'info',
    category: 'system',
    title: 'Mise à jour système',
    message: 'Le système de gestion des projets a été mis à jour vers la version 3.0.',
    createdAt: '2026-01-08T02:00:00Z',
    read: true,
    readAt: '2026-01-08T08:30:00Z',
    actionRequired: false,
  },
  {
    id: 'NOTIF-013',
    type: 'info',
    category: 'team',
    title: 'Nouvelle affectation',
    message: 'Awa Coulibaly a été affectée au projet PRJ-013 (Hôpital Pédiatrique).',
    projectId: 'PRJ-013',
    projectTitle: 'Hôpital Pédiatrique Ouagadougou',
    createdAt: '2026-01-07T09:00:00Z',
    read: true,
    readAt: '2026-01-07T10:00:00Z',
    actionRequired: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

export const getUnreadNotifications = (): Notification[] => {
  return mockNotifications.filter((n) => !n.read);
};

export const getUnreadCount = (): number => {
  return mockNotifications.filter((n) => !n.read).length;
};

export const getCriticalNotifications = (): Notification[] => {
  return mockNotifications.filter((n) => n.type === 'critical' && !n.read);
};

export const getNotificationsByType = (type: NotificationType): Notification[] => {
  return mockNotifications.filter((n) => n.type === type);
};

export const getNotificationsByCategory = (category: NotificationCategory): Notification[] => {
  return mockNotifications.filter((n) => n.category === category);
};

export const getNotificationsByProject = (projectId: string): Notification[] => {
  return mockNotifications.filter((n) => n.projectId === projectId);
};

export const getActionRequiredNotifications = (): Notification[] => {
  return mockNotifications.filter((n) => n.actionRequired && !n.read);
};

export const groupNotificationsByDate = (): NotificationGroup[] => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const groups: Record<string, Notification[]> = {};

  mockNotifications.forEach((n) => {
    const date = n.createdAt.split('T')[0];
    let label: string;

    if (date === today) {
      label = "Aujourd'hui";
    } else if (date === yesterday) {
      label = 'Hier';
    } else {
      label = new Date(date).toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      });
    }

    const key = `${date}|${label}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(n);
  });

  return Object.entries(groups)
    .map(([key, notifications]) => ({
      date: key.split('|')[0],
      label: key.split('|')[1],
      notifications: notifications.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const markAsRead = (id: string): void => {
  const notification = mockNotifications.find((n) => n.id === id);
  if (notification) {
    notification.read = true;
    notification.readAt = new Date().toISOString();
  }
};

export const markAllAsRead = (): void => {
  const now = new Date().toISOString();
  mockNotifications.forEach((n) => {
    if (!n.read) {
      n.read = true;
      n.readAt = now;
    }
  });
};

