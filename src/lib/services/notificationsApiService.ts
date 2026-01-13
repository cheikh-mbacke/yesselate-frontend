/**
 * API Service pour les notifications - Validation Contrats
 * Gestion CRUD des notifications
 */

export interface Notification {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message?: string;
  time: string;
  read: boolean;
  actionUrl?: string;
  relatedContratId?: string;
  createdAt: Date;
}

// ================================
// Mock Data
// ================================
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'critical',
    title: 'Contrat urgent nécessite validation',
    message: 'Contrat #CT-2024-045 - Échéance dans 2h',
    time: 'Il y a 5 min',
    read: false,
    relatedContratId: 'CT-2024-045',
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: '2',
    type: 'warning',
    title: '3 contrats en attente depuis 7 jours',
    message: 'Action requise pour éviter dépassement de délai',
    time: 'Il y a 2h',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '3',
    type: 'success',
    title: 'Contrat validé avec succès',
    message: 'Contrat #CT-2024-042 validé par la Direction',
    time: 'Il y a 4h',
    read: true,
    relatedContratId: 'CT-2024-042',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: '4',
    type: 'info',
    title: 'Nouveau commentaire ajouté',
    message: 'Jean Dupont a commenté le contrat #CT-2024-038',
    time: 'Hier',
    read: true,
    relatedContratId: 'CT-2024-038',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: '5',
    type: 'warning',
    title: 'Document manquant',
    message: 'Contrat #CT-2024-041 - Annexe 3 non fournie',
    time: 'Hier',
    read: true,
    relatedContratId: 'CT-2024-041',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
  },
];

// ================================
// API Functions (Mocked)
// ================================

/**
 * Récupérer toutes les notifications
 */
export async function getNotifications(): Promise<Notification[]> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  return [...mockNotifications].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

/**
 * Récupérer uniquement les notifications non lues
 */
export async function getUnreadNotifications(): Promise<Notification[]> {
  const all = await getNotifications();
  return all.filter((n) => !n.read);
}

/**
 * Compter les notifications non lues
 */
export async function getUnreadCount(): Promise<number> {
  const unread = await getUnreadNotifications();
  return unread.length;
}

/**
 * Marquer une notification comme lue
 */
export async function markAsRead(notificationId: string): Promise<void> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 200));
  
  const notification = mockNotifications.find((n) => n.id === notificationId);
  if (notification) {
    notification.read = true;
  }
}

/**
 * Marquer toutes les notifications comme lues
 */
export async function markAllAsRead(): Promise<void> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  mockNotifications.forEach((n) => {
    n.read = true;
  });
}

/**
 * Supprimer une notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 200));
  
  const index = mockNotifications.findIndex((n) => n.id === notificationId);
  if (index !== -1) {
    mockNotifications.splice(index, 1);
  }
}

/**
 * Supprimer toutes les notifications lues
 */
export async function deleteAllRead(): Promise<void> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  for (let i = mockNotifications.length - 1; i >= 0; i--) {
    if (mockNotifications[i].read) {
      mockNotifications.splice(i, 1);
    }
  }
}

/**
 * Créer une notification (pour tests)
 */
export async function createNotification(
  notification: Omit<Notification, 'id' | 'createdAt'>
): Promise<Notification> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 200));
  
  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}`,
    createdAt: new Date(),
  };
  
  mockNotifications.unshift(newNotification);
  return newNotification;
}

// ================================
// WebSocket Simulation (Future)
// ================================

/**
 * S'abonner aux notifications en temps réel
 * (Simulé avec polling pour MVP, WebSocket pour production)
 */
export function subscribeToNotifications(
  callback: (notification: Notification) => void
): () => void {
  // Simulate receiving new notifications every 30 seconds
  const interval = setInterval(async () => {
    // Chance de recevoir une nouvelle notification
    if (Math.random() > 0.7) {
      const types: Array<'critical' | 'warning' | 'info' | 'success'> = [
        'critical',
        'warning',
        'info',
        'success',
      ];
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      const newNotif = await createNotification({
        type: randomType,
        title: 'Nouvelle notification de test',
        message: 'Ceci est une notification générée automatiquement',
        time: 'À l\'instant',
        read: false,
      });
      
      callback(newNotif);
    }
  }, 30000); // Check every 30 seconds
  
  // Return cleanup function
  return () => clearInterval(interval);
}

