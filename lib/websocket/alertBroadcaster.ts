/**
 * WebSocket Broadcaster pour les alertes
 * Gère l'envoi des notifications à tous les clients connectés
 */

import type { AlertNotification } from '@/lib/api/websocket/useAlertsWebSocket';

// Store des connexions WebSocket actives
const connections = new Set<WebSocket>();

/**
 * Broadcaster singleton
 */
class AlertBroadcaster {
  private static instance: AlertBroadcaster;

  private constructor() {
    console.log('🔊 AlertBroadcaster initialized');
  }

  public static getInstance(): AlertBroadcaster {
    if (!AlertBroadcaster.instance) {
      AlertBroadcaster.instance = new AlertBroadcaster();
    }
    return AlertBroadcaster.instance;
  }

  /**
   * Ajouter une connexion WebSocket
   */
  public addConnection(ws: WebSocket): void {
    connections.add(ws);
    console.log(`✅ Client connected. Total connections: ${connections.size}`);

    // Handler pour la fermeture
    ws.addEventListener('close', () => {
      connections.delete(ws);
      console.log(`❌ Client disconnected. Total connections: ${connections.size}`);
    });

    // Handler pour les erreurs
    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      connections.delete(ws);
    });
  }

  /**
   * Broadcaster une notification à tous les clients
   */
  public broadcast(notification: AlertNotification): void {
    const message = JSON.stringify(notification);
    let sent = 0;
    let failed = 0;

    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(message);
          sent++;
        } catch (error) {
          console.error('Failed to send message:', error);
          failed++;
          connections.delete(ws);
        }
      } else {
        connections.delete(ws);
        failed++;
      }
    });

    console.log(`📡 Broadcast: ${sent} sent, ${failed} failed`);
  }

  /**
   * Envoyer une notification à un client spécifique
   */
  public sendToClient(ws: WebSocket, notification: AlertNotification): void {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(notification));
      } catch (error) {
        console.error('Failed to send to client:', error);
        connections.delete(ws);
      }
    }
  }

  /**
   * Obtenir le nombre de connexions actives
   */
  public getConnectionCount(): number {
    return connections.size;
  }

  /**
   * Envoyer un heartbeat à tous les clients
   */
  public sendHeartbeat(): void {
    const heartbeat = JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() });
    
    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(heartbeat);
        } catch (error) {
          connections.delete(ws);
        }
      } else {
        connections.delete(ws);
      }
    });
  }
}

// Export singleton
export const alertBroadcaster = AlertBroadcaster.getInstance();

// Heartbeat toutes les 30 secondes
if (typeof window === 'undefined') {
  // Serveur uniquement
  setInterval(() => {
    alertBroadcaster.sendHeartbeat();
  }, 30000);
}

/**
 * Helper pour broadcaster une nouvelle alerte
 */
export function broadcastNewAlert(alert: {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  type: string;
  bureau?: string;
}): void {
  const notification: AlertNotification = {
    type: alert.severity === 'critical' ? 'alert.critical' : 'alert.created',
    alert,
    timestamp: new Date().toISOString(),
  };

  alertBroadcaster.broadcast(notification);
}

/**
 * Helper pour broadcaster une mise à jour d'alerte
 */
export function broadcastAlertUpdate(alert: {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  type: string;
  bureau?: string;
}): void {
  const notification: AlertNotification = {
    type: 'alert.updated',
    alert,
    timestamp: new Date().toISOString(),
  };

  alertBroadcaster.broadcast(notification);
}

/**
 * Helper pour broadcaster une résolution
 */
export function broadcastAlertResolved(alert: {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  type: string;
  bureau?: string;
}): void {
  const notification: AlertNotification = {
    type: 'alert.resolved',
    alert,
    timestamp: new Date().toISOString(),
  };

  alertBroadcaster.broadcast(notification);
}

/**
 * Helper pour broadcaster une escalade
 */
export function broadcastAlertEscalated(alert: {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  type: string;
  bureau?: string;
}): void {
  const notification: AlertNotification = {
    type: 'alert.escalated',
    alert,
    timestamp: new Date().toISOString(),
  };

  alertBroadcaster.broadcast(notification);
}

