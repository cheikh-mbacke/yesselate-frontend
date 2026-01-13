/**
 * ====================================================================
 * SERVICE: WebSocket Blocked Dossiers
 * ====================================================================
 * 
 * Gestion des connexions WebSocket pour notifications temps réel.
 * Événements : nouveau blocage, SLA breach, résolution, escalade
 */

import type { BlockedDossier } from '@/lib/types/bmo.types';

export interface SLAAlert {
  dossierId: string;
  dossierSubject: string;
  impact: string;
  daysOverdue: number;
  severity: 'warning' | 'critical';
  timestamp: string;
}

export interface EscalationEvent {
  dossierId: string;
  dossierSubject: string;
  escalatedBy: string;
  escalatedTo: string;
  reason: string;
  timestamp: string;
}

export interface ResolutionEvent {
  dossierId: string;
  dossierSubject: string;
  resolvedBy: string;
  method: 'direct' | 'escalation' | 'substitution';
  timestamp: string;
}

export interface NewBlockingEvent {
  dossier: BlockedDossier;
  createdBy: string;
  timestamp: string;
}

type EventCallback<T> = (data: T) => void;

class BlockedWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isIntentionallyClosed = false;
  
  // Event listeners
  private listeners: {
    newBlocking: EventCallback<NewBlockingEvent>[];
    slaBreach: EventCallback<SLAAlert>[];
    resolution: EventCallback<ResolutionEvent>[];
    escalation: EventCallback<EscalationEvent>[];
    connected: (() => void)[];
    disconnected: (() => void)[];
  } = {
    newBlocking: [],
    slaBreach: [],
    resolution: [],
    escalation: [],
    connected: [],
    disconnected: [],
  };

  constructor() {
    if (typeof window !== 'undefined') {
      // Auto-reconnect on page visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && !this.ws) {
          this.connect();
        }
      });
    }
  }

  /**
   * Établir la connexion WebSocket
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[BlockedWS] Already connected');
      return;
    }

    this.isIntentionallyClosed = false;

    try {
      // En production, remplacer par l'URL réelle
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws/bmo/blocked';
      
      console.log('[BlockedWS] Connecting to', wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[BlockedWS] Connected');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.listeners.connected.forEach(cb => cb());
        
        // Envoyer le token d'authentification si nécessaire
        this.send({
          type: 'auth',
          token: this.getAuthToken(),
          userId: this.getCurrentUserId(),
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('[BlockedWS] Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[BlockedWS] Error:', error);
      };

      this.ws.onclose = () => {
        console.log('[BlockedWS] Disconnected');
        this.stopHeartbeat();
        this.listeners.disconnected.forEach(cb => cb());
        
        if (!this.isIntentionallyClosed) {
          this.attemptReconnect();
        }
      };

    } catch (error) {
      console.error('[BlockedWS] Connection failed:', error);
      this.attemptReconnect();
    }
  }

  /**
   * Fermer la connexion
   */
  disconnect(): void {
    this.isIntentionallyClosed = true;
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Envoyer un message
   */
  private send(data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('[BlockedWS] Cannot send, not connected');
    }
  }

  /**
   * Gérer les messages entrants
   */
  private handleMessage(message: any): void {
    const { type, data } = message;

    switch (type) {
      case 'new_blocking':
        this.listeners.newBlocking.forEach(cb => cb(data as NewBlockingEvent));
        break;
      
      case 'sla_breach':
        this.listeners.slaBreach.forEach(cb => cb(data as SLAAlert));
        break;
      
      case 'resolution':
        this.listeners.resolution.forEach(cb => cb(data as ResolutionEvent));
        break;
      
      case 'escalation':
        this.listeners.escalation.forEach(cb => cb(data as EscalationEvent));
        break;
      
      case 'pong':
        // Heartbeat response
        break;
      
      default:
        console.log('[BlockedWS] Unknown message type:', type);
    }
  }

  /**
   * Heartbeat pour maintenir la connexion
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: 'ping' });
    }, 30000); // Ping toutes les 30 secondes
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Tentative de reconnexion
   */
  private attemptReconnect(): void {
    if (this.isIntentionallyClosed) return;
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;
      
      console.log(`[BlockedWS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('[BlockedWS] Max reconnection attempts reached');
    }
  }

  /**
   * Event listeners
   */
  onNewBlocking(callback: EventCallback<NewBlockingEvent>): () => void {
    this.listeners.newBlocking.push(callback);
    return () => {
      this.listeners.newBlocking = this.listeners.newBlocking.filter(cb => cb !== callback);
    };
  }

  onSLABreach(callback: EventCallback<SLAAlert>): () => void {
    this.listeners.slaBreach.push(callback);
    return () => {
      this.listeners.slaBreach = this.listeners.slaBreach.filter(cb => cb !== callback);
    };
  }

  onResolution(callback: EventCallback<ResolutionEvent>): () => void {
    this.listeners.resolution.push(callback);
    return () => {
      this.listeners.resolution = this.listeners.resolution.filter(cb => cb !== callback);
    };
  }

  onEscalation(callback: EventCallback<EscalationEvent>): () => void {
    this.listeners.escalation.push(callback);
    return () => {
      this.listeners.escalation = this.listeners.escalation.filter(cb => cb !== callback);
    };
  }

  onConnected(callback: () => void): () => void {
    this.listeners.connected.push(callback);
    return () => {
      this.listeners.connected = this.listeners.connected.filter(cb => cb !== callback);
    };
  }

  onDisconnected(callback: () => void): () => void {
    this.listeners.disconnected.push(callback);
    return () => {
      this.listeners.disconnected = this.listeners.disconnected.filter(cb => cb !== callback);
    };
  }

  /**
   * Helpers
   */
  private getAuthToken(): string {
    // Récupérer le token d'authentification
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token') || '';
    }
    return '';
  }

  private getCurrentUserId(): string {
    // Récupérer l'ID utilisateur courant
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('current_user');
      if (user) {
        try {
          return JSON.parse(user).id || '';
        } catch {
          return '';
        }
      }
    }
    return '';
  }

  /**
   * Status
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CONNECTING:
        return 'connecting';
      default:
        return 'disconnected';
    }
  }
}

// Export singleton
export const blockedWebSocket = new BlockedWebSocketService();

// Auto-connect en développement (simulé)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Simuler des événements pour le développement
  setTimeout(() => {
    console.log('[BlockedWS] Dev mode - simulating events');
    
    // Simuler une connexion réussie
    blockedWebSocket['listeners'].connected.forEach(cb => cb());
    
    // Simuler des événements aléatoires
    const simulateEvents = () => {
      const events = ['slaBreach', 'newBlocking', 'resolution', 'escalation'];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      
      const mockData = {
        slaBreach: {
          dossierId: 'BLK-' + Math.floor(Math.random() * 1000),
          dossierSubject: 'Validation BC - Projet Alpha',
          impact: 'critical',
          daysOverdue: Math.floor(Math.random() * 20) + 1,
          severity: Math.random() > 0.5 ? 'critical' : 'warning',
          timestamp: new Date().toISOString(),
        },
        newBlocking: {
          dossier: {
            id: 'BLK-' + Math.floor(Math.random() * 1000),
            subject: 'Nouveau blocage - ' + Date.now(),
            impact: 'high',
            type: 'BC',
            bureau: 'DT',
            delay: 0,
          },
          createdBy: 'John Doe',
          timestamp: new Date().toISOString(),
        },
        resolution: {
          dossierId: 'BLK-' + Math.floor(Math.random() * 1000),
          dossierSubject: 'Contrat fournisseur résolu',
          resolvedBy: 'A. DIALLO',
          method: 'substitution',
          timestamp: new Date().toISOString(),
        },
        escalation: {
          dossierId: 'BLK-' + Math.floor(Math.random() * 1000),
          dossierSubject: 'Escalade au CODIR',
          escalatedBy: 'Manager',
          escalatedTo: 'CODIR',
          reason: 'Dépassement SLA critique',
          timestamp: new Date().toISOString(),
        },
      };

      const data = mockData[randomEvent as keyof typeof mockData];
      blockedWebSocket['listeners'][randomEvent as keyof typeof blockedWebSocket['listeners']].forEach((cb: any) => cb(data));
    };

    // Événement toutes les 30 secondes en dev
    setInterval(simulateEvents, 30000);
  }, 2000);
}

