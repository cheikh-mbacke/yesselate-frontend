/**
 * Service de Notifications Temps Réel
 * ====================================
 * 
 * Gère les notifications push via WebSocket ou Server-Sent Events
 */

// ============================================
// TYPES
// ============================================

export type NotificationType = 
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'urgent';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  titre: string;
  message: string;
  module: string;
  entityId?: string;
  entityType?: string;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: string;
  readAt?: string;
  userId: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationSubscription {
  userId: string;
  modules: string[];
  types: NotificationType[];
}

// ============================================
// SERVICE
// ============================================

class NotificationService {
  private ws: WebSocket | null = null;
  private eventSource: EventSource | null = null;
  private listeners: Array<(notification: Notification) => void> = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  /**
   * Connecte au service de notifications (WebSocket)
   */
  connectWebSocket(userId: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket déjà connecté');
      return;
    }

    // En production: utiliser l'URL WebSocket réelle
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/notifications/${userId}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ Notifications WebSocket connecté');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const notification: Notification = JSON.parse(event.data);
          this.handleNotification(notification);
        } catch (e) {
          console.error('Erreur parsing notification:', e);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ Erreur WebSocket:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket fermé');
        this.attemptReconnect(userId);
      };
    } catch (error) {
      console.error('Erreur connexion WebSocket:', error);
      this.simulateMockNotifications(userId);
    }
  }

  /**
   * Connecte au service de notifications (Server-Sent Events)
   */
  connectSSE(userId: string): void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    // En production: utiliser l'URL SSE réelle
    const sseUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/notifications/stream/${userId}`;

    try {
      this.eventSource = new EventSource(sseUrl);

      this.eventSource.onopen = () => {
        console.log('✅ Notifications SSE connecté');
      };

      this.eventSource.onmessage = (event) => {
        try {
          const notification: Notification = JSON.parse(event.data);
          this.handleNotification(notification);
        } catch (e) {
          console.error('Erreur parsing notification SSE:', e);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('❌ Erreur SSE:', error);
        this.eventSource?.close();
      };
    } catch (error) {
      console.error('Erreur connexion SSE:', error);
      this.simulateMockNotifications(userId);
    }
  }

  /**
   * Déconnecte du service de notifications
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.listeners = [];
    console.log('Déconnecté du service de notifications');
  }

  /**
   * Ajoute un listener pour les notifications
   */
  subscribe(callback: (notification: Notification) => void): () => void {
    this.listeners.push(callback);

    // Retourne une fonction de désabonnement
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Gère l'arrivée d'une notification
   */
  private handleNotification(notification: Notification): void {
    console.log('📬 Nouvelle notification:', notification);

    // Notifier tous les listeners
    this.listeners.forEach((callback) => {
      try {
        callback(notification);
      } catch (e) {
        console.error('Erreur dans callback notification:', e);
      }
    });

    // Afficher notification navigateur si autorisé
    if ('Notification' in window && Notification.permission === 'granted') {
      this.showBrowserNotification(notification);
    }
  }

  /**
   * Affiche une notification navigateur
   */
  private showBrowserNotification(notification: Notification): void {
    const options: NotificationOptions = {
      body: notification.message,
      icon: '/icon-notification.png',
      badge: '/badge-notification.png',
      tag: notification.id,
      requireInteraction: notification.priority === 'critical',
      data: {
        url: notification.actionUrl,
      },
    };

    const browserNotif = new Notification(notification.titre, options);

    browserNotif.onclick = (event) => {
      event.preventDefault();
      if (notification.actionUrl) {
        window.open(notification.actionUrl, '_blank');
      }
      browserNotif.close();
    };
  }

  /**
   * Demande la permission pour les notifications navigateur
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications navigateur non supportées');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  /**
   * Tente de se reconnecter en cas de déconnexion
   */
  private attemptReconnect(userId: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Nombre max de tentatives de reconnexion atteint');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(`🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts} dans ${delay}ms...`);

    setTimeout(() => {
      this.connectWebSocket(userId);
    }, delay);
  }

  /**
   * Simule des notifications pour développement (mock)
   */
  private simulateMockNotifications(userId: string): void {
    console.log('🔧 Mode simulation - notifications mock');

    // Simulation: envoie une notification toutes les 30 secondes
    const mockNotifications: Notification[] = [
      {
        id: `notif-${Date.now()}-1`,
        type: 'warning',
        priority: 'high',
        titre: 'BC en attente de validation',
        message: 'Le BC #BC-2026-042 attend votre validation depuis 2 heures',
        module: 'validation-bc',
        entityId: 'BC-2026-042',
        entityType: 'bc',
        actionUrl: '/maitre-ouvrage/validation-bc?bc=BC-2026-042',
        actionLabel: 'Voir le BC',
        createdAt: new Date().toISOString(),
        userId,
      },
      {
        id: `notif-${Date.now()}-2`,
        type: 'urgent',
        priority: 'critical',
        titre: 'Projet bloqué',
        message: 'Le projet "Route Nationale RN7" est bloqué depuis 3 jours',
        module: 'projets',
        entityId: 'PRJ-001',
        entityType: 'projet',
        actionUrl: '/maitre-ouvrage/projets-en-cours?projet=PRJ-001',
        actionLabel: 'Débloquer',
        createdAt: new Date().toISOString(),
        userId,
      },
      {
        id: `notif-${Date.now()}-3`,
        type: 'info',
        priority: 'medium',
        titre: 'Nouveau ticket client',
        message: 'Un nouveau ticket (#TCK-245) a été créé',
        module: 'tickets-clients',
        entityId: 'TCK-245',
        entityType: 'ticket',
        actionUrl: '/maitre-ouvrage/tickets-clients?ticket=TCK-245',
        actionLabel: 'Voir le ticket',
        createdAt: new Date().toISOString(),
        userId,
      },
    ];

    let index = 0;
    setInterval(() => {
      const notif = mockNotifications[index % mockNotifications.length];
      this.handleNotification({
        ...notif,
        id: `notif-${Date.now()}-${index}`,
        createdAt: new Date().toISOString(),
      });
      index++;
    }, 30000); // Toutes les 30 secondes
  }

  /**
   * Marque une notification comme lue
   */
  async markAsRead(notificationId: string): Promise<void> {
    // En production: appel API
    await this.delay(200);
  }

  /**
   * Marque toutes les notifications comme lues
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.delay(300);
  }

  /**
   * Récupère l'historique des notifications
   */
  async getNotifications(
    userId: string,
    filters?: {
      unreadOnly?: boolean;
      module?: string;
      limit?: number;
    }
  ): Promise<Notification[]> {
    await this.delay(400);
    // En production: appel API
    return [];
  }

  /**
   * Envoie une notification (côté serveur uniquement)
   */
  async sendNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    await this.delay(200);

    const fullNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    return fullNotification;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const notificationService = new NotificationService();

