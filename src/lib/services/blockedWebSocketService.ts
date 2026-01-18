/**
 * WebSocket Service pour Blocked
 * Service de connexion temps réel pour les mises à jour des dossiers bloqués
 * Architecture identique à Analytics WebSocket
 * 
 * @example
 * ```typescript
 * const ws = getBlockedWebSocket();
 * ws.connect();
 * 
 * const unsubscribe = ws.subscribe('blocked:created', (event) => {
 *   console.log('Nouveau dossier:', event.payload);
 * });
 * 
 * // Cleanup
 * unsubscribe();
 * ws.disconnect();
 * ```
 */

export type WSEventType =
  | 'blocked:created'
  | 'blocked:updated'
  | 'blocked:resolved'
  | 'blocked:escalated'
  | 'blocked:commented'
  | 'blocked:deleted'
  | 'stats:updated';

export type WSEvent = {
  type: WSEventType;
  payload: Record<string, unknown>;
  timestamp: string;
};

export type WSSubscriber = (event: WSEvent) => void;

type ConnectionEventType = 'connection' | 'error';
type AllEventTypes = WSEventType | ConnectionEventType | '*';

export class BlockedWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private subscribers = new Map<AllEventTypes, Set<WSSubscriber>>();
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 1000;
  private readonly heartbeatInterval_ms = 30000;
  private isConnecting = false;
  private readonly url: string;

  constructor(url?: string) {
    // Support SSR - vérifier si on est côté client
    if (typeof window === 'undefined') {
      this.url = '';
      return;
    }
    this.url = url || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/blocked';
  }

  /**
   * Connecter au WebSocket
   */
  connect(): void {
    // Guard SSR
    if (typeof window === 'undefined' || !this.url) {
      console.warn('[BlockedWS] WebSocket non disponible (SSR ou URL manquante)');
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[BlockedWS] Connecté');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connection', { status: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WSEvent = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('[BlockedWS] Erreur parsing message:', error);
        }
      };

      this.ws.onerror = (error) => {
        // WebSocket error events don't provide detailed error info
        // Capture additional context for debugging
        const readyState = this.ws?.readyState ?? 'unknown';
        const readyStateLabels: Record<number, string> = {
          0: 'CONNECTING',
          1: 'OPEN',
          2: 'CLOSING',
          3: 'CLOSED',
        };
        
        const errorInfo = {
          type: error?.type || 'error',
          readyState: typeof readyState === 'number' ? readyStateLabels[readyState] || readyState : readyState,
          url: this.ws?.url || this.url || 'unknown',
          timestamp: new Date().toISOString(),
          reconnectAttempts: this.reconnectAttempts,
        };
        
        // Log error with available context
        if (Object.keys(errorInfo).length > 0) {
          console.error('[BlockedWS] Erreur:', errorInfo);
        } else {
          console.error('[BlockedWS] Erreur WebSocket (détails non disponibles)');
        }
        
        this.emit('error', { error: errorInfo });
      };

      this.ws.onclose = () => {
        console.log('[BlockedWS] Déconnecté');
        this.isConnecting = false;
        this.stopHeartbeat();
        this.emit('connection', { status: 'disconnected' });
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('[BlockedWS] Erreur connexion:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Déconnecter proprement
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.stopHeartbeat();

    if (this.ws) {
      // Supprimer les event listeners avant de fermer
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, 'Client disconnect');
      }
      this.ws = null;
    }

    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  /**
   * S'abonner à un type d'événement
   * @returns Fonction de désabonnement
   */
  subscribe(eventType: AllEventTypes, callback: WSSubscriber): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }

    this.subscribers.get(eventType)!.add(callback);

    // Retourner fonction de désabonnement
    return () => {
      this.subscribers.get(eventType)?.delete(callback);
      // Nettoyer si plus d'abonnés
      if (this.subscribers.get(eventType)?.size === 0) {
        this.subscribers.delete(eventType);
      }
    };
  }

  /**
   * Envoyer un message au serveur
   */
  send(type: string, payload: Record<string, unknown> = {}): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type, payload, timestamp: new Date().toISOString() }));
      } catch (error) {
        console.error('[BlockedWS] Erreur lors de l\'envoi:', error);
      }
    } else {
      console.warn('[BlockedWS] WebSocket non connecté, impossible d\'envoyer:', type);
    }
  }

  /**
   * État de connexion
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Nombre d'abonnements
   */
  getSubscriptionsCount(): number {
    let count = 0;
    this.subscribers.forEach((subs) => {
      count += subs.size;
    });
    return count;
  }

  // ================================
  // PRIVATE METHODS
  // ================================

  private handleMessage(event: WSEvent) {
    // Émettre l'événement à tous les abonnés du type spécifique
    this.emit(event.type, event.payload);

    // Émettre aussi aux abonnés génériques
    this.emit('*' as any, event);
  }

  private emit(eventType: AllEventTypes, payload: Record<string, unknown>): void {
    const subscribers = this.subscribers.get(eventType);
    if (subscribers && subscribers.size > 0) {
      const event: WSEvent = { 
        type: eventType as WSEventType, 
        payload, 
        timestamp: new Date().toISOString() 
      };
      
      // Utiliser Array.from pour éviter les problèmes avec Set.forEach
      Array.from(subscribers).forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error('[BlockedWS] Erreur dans subscriber:', error);
        }
      });
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[BlockedWS] Nombre maximum de tentatives de reconnexion atteint');
      this.emit('error', { 
        error: new Error('Max reconnection attempts reached'),
        attempts: this.reconnectAttempts 
      });
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    console.log(`[BlockedWS] Reconnexion dans ${delay}ms... (tentative ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping', { timestamp: Date.now() });
      } else {
        // Si la connexion est morte, arrêter le heartbeat
        this.stopHeartbeat();
      }
    }, this.heartbeatInterval_ms);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Obtenir l'état de la connexion WebSocket
   */
  getReadyState(): number | null {
    return this.ws?.readyState ?? null;
  }

  /**
   * Obtenir les statistiques du service
   */
  getStats(): {
    isConnected: boolean;
    isConnecting: boolean;
    reconnectAttempts: number;
    subscriptionsCount: number;
    subscribersByType: Record<string, number>;
  } {
    const subscribersByType: Record<string, number> = {};
    this.subscribers.forEach((subs, key) => {
      subscribersByType[key] = subs.size;
    });

    return {
      isConnected: this.isConnected(),
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      subscriptionsCount: this.getSubscriptionsCount(),
      subscribersByType,
    };
  }
}

// Instance singleton
let blockedWSInstance: BlockedWebSocketService | null = null;

/**
 * Obtenir l'instance singleton du WebSocket Blocked
 * @param url - URL du serveur WebSocket (optionnel)
 * @returns Instance du service WebSocket
 */
export function getBlockedWebSocket(url?: string): BlockedWebSocketService {
  if (!blockedWSInstance) {
    blockedWSInstance = new BlockedWebSocketService(url);
  }
  return blockedWSInstance;
}

/**
 * Réinitialiser l'instance singleton (utile pour les tests)
 */
export function resetBlockedWebSocket(): void {
  if (blockedWSInstance) {
    blockedWSInstance.disconnect();
    blockedWSInstance = null;
  }
}

