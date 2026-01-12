/**
 * Service de notifications temps réel pour Analytics
 * Gère les connexions WebSocket/SSE pour les mises à jour en temps réel
 */

export type RealtimeEventType =
  | 'kpi_update'
  | 'alert_new'
  | 'alert_resolved'
  | 'report_completed'
  | 'export_ready'
  | 'data_refresh'
  | 'user_action'
  | 'system_notification';

export interface RealtimeEvent {
  id: string;
  type: RealtimeEventType;
  timestamp: Date;
  data: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  bureauId?: string;
}

export interface RealtimeSubscription {
  id: string;
  eventTypes: RealtimeEventType[];
  callback: (event: RealtimeEvent) => void;
  filters?: {
    bureauId?: string;
    userId?: string;
    priority?: RealtimeEvent['priority'][];
  };
}

class AnalyticsRealtimeService {
  private eventSource: EventSource | null = null;
  private subscriptions: Map<string, RealtimeSubscription> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnected = false;

  /**
   * Initialise la connexion SSE
   */
  connect(url: string = '/api/analytics/realtime'): void {
    if (this.eventSource) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Already connected to realtime service');
      }
      return;
    }

    try {
      this.eventSource = new EventSource(url, { withCredentials: true });

      this.eventSource.onopen = () => {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Connected to Analytics realtime service');
        }
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.eventSource.onmessage = (event) => {
        try {
          const realtimeEvent: RealtimeEvent = JSON.parse(event.data);
          this.handleEvent(realtimeEvent);
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Failed to parse realtime event:', error);
          }
        }
      };

      this.eventSource.onerror = (event: Event) => {
        const eventSource = event.target as EventSource;
        const readyState = eventSource?.readyState ?? EventSource.CLOSED;
        const stateMessage = 
          readyState === EventSource.CONNECTING ? 'CONNECTING' :
          readyState === EventSource.OPEN ? 'OPEN' :
          'CLOSED';
        
        if (process.env.NODE_ENV === 'development') {
          console.error('SSE connection error:', {
            type: event.type,
            readyState: stateMessage,
            url: eventSource?.url || 'unknown',
            timestamp: new Date().toISOString(),
          });
        }
        
        this.isConnected = false;
        this.handleConnectionError();
      };

      // Écouter des événements spécifiques
      this.setupEventListeners();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to connect to realtime service:', error);
      }
    }
  }

  /**
   * Configure les écouteurs d'événements spécifiques
   */
  private setupEventListeners(): void {
    if (!this.eventSource) return;

    const eventTypes: RealtimeEventType[] = [
      'kpi_update',
      'alert_new',
      'alert_resolved',
      'report_completed',
      'export_ready',
      'data_refresh',
      'user_action',
      'system_notification',
    ];

    eventTypes.forEach((type) => {
      this.eventSource!.addEventListener(type, (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          const realtimeEvent: RealtimeEvent = {
            id: data.id || crypto.randomUUID(),
            type,
            timestamp: new Date(data.timestamp || Date.now()),
            data: data.payload || data,
            priority: data.priority || 'medium',
            userId: data.userId,
            bureauId: data.bureauId,
          };
          this.handleEvent(realtimeEvent);
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error(`Failed to parse ${type} event:`, error);
          }
        }
      });
    });
  }

  /**
   * Gère un événement reçu
   */
  private handleEvent(event: RealtimeEvent): void {
    this.subscriptions.forEach((subscription) => {
      // Vérifier si l'abonnement correspond au type d'événement
      if (!subscription.eventTypes.includes(event.type)) {
        return;
      }

      // Appliquer les filtres si présents
      if (subscription.filters) {
        const { bureauId, userId, priority } = subscription.filters;

        if (bureauId && event.bureauId !== bureauId) return;
        if (userId && event.userId !== userId) return;
        if (priority && !priority.includes(event.priority)) return;
      }

      // Exécuter le callback
      try {
        subscription.callback(event);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error in subscription callback:', error);
        }
      }
    });
  }

  /**
   * Gère les erreurs de connexion
   */
  private handleConnectionError(): void {
    this.stopHeartbeat();

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      }
      
      setTimeout(() => {
        this.disconnect();
        this.connect();
      }, delay);
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.error('Max reconnection attempts reached. Please refresh the page.');
      }
    }
  }

  /**
   * Démarre le heartbeat pour maintenir la connexion
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        // Le heartbeat est géré côté serveur via SSE
        // Ici on pourrait faire un ping API si nécessaire
      }
    }, 30000); // 30 secondes
  }

  /**
   * Arrête le heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * S'abonne à des événements spécifiques
   */
  subscribe(
    eventTypes: RealtimeEventType[],
    callback: (event: RealtimeEvent) => void,
    filters?: RealtimeSubscription['filters']
  ): string {
    const subscriptionId = crypto.randomUUID();

    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      eventTypes,
      callback,
      filters,
    };

    this.subscriptions.set(subscriptionId, subscription);

    return subscriptionId;
  }

  /**
   * Se désabonne d'un abonnement
   */
  unsubscribe(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);
  }

  /**
   * Se désabonne de tous les abonnements
   */
  unsubscribeAll(): void {
    this.subscriptions.clear();
  }

  /**
   * Déconnecte du service temps réel
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.stopHeartbeat();
    this.isConnected = false;
    if (process.env.NODE_ENV === 'development') {
      console.log('Disconnected from Analytics realtime service');
    }
  }

  /**
   * Vérifie si connecté
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Obtient le nombre d'abonnements actifs
   */
  getSubscriptionsCount(): number {
    return this.subscriptions.size;
  }
}

// Instance singleton
export const analyticsRealtimeService = new AnalyticsRealtimeService();

// Hook React pour utiliser le service temps réel
export function useAnalyticsRealtime() {
  return {
    connect: (url?: string) => analyticsRealtimeService.connect(url),
    disconnect: () => analyticsRealtimeService.disconnect(),
    subscribe: (
      eventTypes: RealtimeEventType[],
      callback: (event: RealtimeEvent) => void,
      filters?: RealtimeSubscription['filters']
    ) => analyticsRealtimeService.subscribe(eventTypes, callback, filters),
    unsubscribe: (id: string) => analyticsRealtimeService.unsubscribe(id),
    unsubscribeAll: () => analyticsRealtimeService.unsubscribeAll(),
    isConnected: () => analyticsRealtimeService.getConnectionStatus(),
    getSubscriptionsCount: () => analyticsRealtimeService.getSubscriptionsCount(),
  };
}

