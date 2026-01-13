/**
 * SERVICE DE WEBHOOKS
 * 
 * Envoie des notifications vers des systèmes externes via HTTP POST
 * Support :
 * - Retry automatique avec backoff exponentiel
 * - Signature HMAC pour sécurité
 * - Queue de webhooks
 * - Logs et métriques
 * - Configuration par événement
 */

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// ============================================
// TYPES
// ============================================

export type WebhookEvent =
  | 'calendar.event.created'
  | 'calendar.event.updated'
  | 'calendar.event.deleted'
  | 'calendar.conflict.detected'
  | 'calendar.sla.warning'
  | 'calendar.sla.overdue'
  | 'delegation.created'
  | 'delegation.revoked'
  | 'delegation.expired'
  | 'governance.raci.updated'
  | 'governance.alert.created';

export interface WebhookConfig {
  id: string;
  url: string;
  secret: string;
  events: WebhookEvent[];
  enabled: boolean;
  retryCount?: number;
  timeout?: number; // ms
}

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: any;
  metadata?: {
    source: string;
    version: string;
    requestId: string;
  };
}

export interface WebhookResult {
  success: boolean;
  statusCode?: number;
  responseTime?: number;
  error?: string;
  retries?: number;
}

// ============================================
// SERVICE
// ============================================

export class WebhookService {
  private static instance: WebhookService;
  private queue: Array<{
    webhook: WebhookConfig;
    payload: WebhookPayload;
    attempt: number;
  }> = [];

  private constructor() {
    // Démarrer le worker de queue
    this.startQueueWorker();
  }

  public static getInstance(): WebhookService {
    if (!this.instance) {
      this.instance = new WebhookService();
    }
    return this.instance;
  }

  /**
   * Enregistrer un webhook
   */
  async registerWebhook(config: Omit<WebhookConfig, 'id'>): Promise<string> {
    try {
      const webhookId = `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // TODO: Sauvegarder dans DB
      console.log('[Webhook] Registered:', webhookId, config.url);

      return webhookId;
    } catch (error) {
      console.error('[Webhook] Error registering:', error);
      throw error;
    }
  }

  /**
   * Envoyer un webhook
   */
  async send(event: WebhookEvent, data: any): Promise<void> {
    try {
      // Récupérer webhooks configurés pour cet événement
      const webhooks = await this.getWebhooksForEvent(event);

      if (webhooks.length === 0) {
        console.log(`[Webhook] No webhooks configured for event: ${event}`);
        return;
      }

      // Créer payload
      const payload: WebhookPayload = {
        event,
        timestamp: new Date().toISOString(),
        data,
        metadata: {
          source: 'yesselate-bmo',
          version: '1.0',
          requestId: this.generateRequestId(),
        },
      };

      // Ajouter à la queue pour chaque webhook
      for (const webhook of webhooks) {
        this.queue.push({
          webhook,
          payload,
          attempt: 0,
        });
      }

      console.log(`[Webhook] Queued ${webhooks.length} webhook(s) for event: ${event}`);
    } catch (error) {
      console.error('[Webhook] Error sending:', error);
    }
  }

  /**
   * Exécuter un webhook avec retry
   */
  private async executeWebhook(
    webhook: WebhookConfig,
    payload: WebhookPayload,
    attempt: number = 0
  ): Promise<WebhookResult> {
    const maxRetries = webhook.retryCount || 3;
    const timeout = webhook.timeout || 10000;

    try {
      // Générer signature HMAC
      const signature = this.generateSignature(payload, webhook.secret);

      // Envoyer requête HTTP
      const startTime = Date.now();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': payload.event,
          'X-Webhook-Request-Id': payload.metadata?.requestId || '',
          'User-Agent': 'Yesselate-BMO-Webhooks/1.0',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        console.log(`[Webhook] Success: ${webhook.url} (${responseTime}ms)`);
        
        // Logger succès
        await this.logWebhook(webhook.id, payload, {
          success: true,
          statusCode: response.status,
          responseTime,
        });

        return {
          success: true,
          statusCode: response.status,
          responseTime,
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      console.error(`[Webhook] Error (attempt ${attempt + 1}/${maxRetries}):`, error.message);

      // Retry avec backoff exponentiel
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30s
        console.log(`[Webhook] Retrying in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.executeWebhook(webhook, payload, attempt + 1);
      }

      // Logger échec
      await this.logWebhook(webhook.id, payload, {
        success: false,
        error: error.message,
        retries: attempt,
      });

      return {
        success: false,
        error: error.message,
        retries: attempt,
      };
    }
  }

  /**
   * Worker de queue (traitement asynchrone)
   */
  private startQueueWorker(): void {
    setInterval(async () => {
      if (this.queue.length === 0) return;

      const item = this.queue.shift();
      if (!item) return;

      const { webhook, payload, attempt } = item;

      if (!webhook.enabled) {
        console.log(`[Webhook] Skipping disabled webhook: ${webhook.url}`);
        return;
      }

      await this.executeWebhook(webhook, payload, attempt);
    }, 100); // Traiter toutes les 100ms
  }

  /**
   * Générer signature HMAC SHA-256
   */
  private generateSignature(payload: WebhookPayload, secret: string): string {
    const data = JSON.stringify(payload);
    return crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('hex');
  }

  /**
   * Générer request ID unique
   */
  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Récupérer webhooks pour un événement
   */
  private async getWebhooksForEvent(event: WebhookEvent): Promise<WebhookConfig[]> {
    // TODO: Charger depuis DB
    // Pour l'instant, retourner config hardcodée (exemple)
    return [
      // {
      //   id: 'webhook-1',
      //   url: 'https://example.com/webhooks/calendar',
      //   secret: 'your-secret-key',
      //   events: ['calendar.event.created', 'calendar.event.updated'],
      //   enabled: true,
      //   retryCount: 3,
      //   timeout: 10000,
      // },
    ];
  }

  /**
   * Logger webhook pour analytics
   */
  private async logWebhook(
    webhookId: string,
    payload: WebhookPayload,
    result: WebhookResult
  ): Promise<void> {
    try {
      // TODO: Sauvegarder dans DB pour analytics
      console.log('[Webhook] Logged:', {
        webhookId,
        event: payload.event,
        success: result.success,
        statusCode: result.statusCode,
        responseTime: result.responseTime,
        retries: result.retries,
      });
    } catch (error) {
      console.error('[Webhook] Error logging:', error);
    }
  }

  /**
   * Obtenir statistiques des webhooks
   */
  async getStats(webhookId?: string): Promise<any> {
    // TODO: Récupérer depuis DB
    return {
      total: 0,
      success: 0,
      failed: 0,
      averageResponseTime: 0,
      byEvent: {},
    };
  }

  /**
   * Tester un webhook
   */
  async testWebhook(webhookId: string): Promise<WebhookResult> {
    try {
      const webhook = await this.getWebhookById(webhookId);
      
      if (!webhook) {
        throw new Error('Webhook not found');
      }

      const testPayload: WebhookPayload = {
        event: 'calendar.event.created',
        timestamp: new Date().toISOString(),
        data: {
          test: true,
          message: 'This is a test webhook',
        },
        metadata: {
          source: 'yesselate-bmo',
          version: '1.0',
          requestId: this.generateRequestId(),
        },
      };

      return await this.executeWebhook(webhook, testPayload, 0);
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Récupérer webhook par ID
   */
  private async getWebhookById(id: string): Promise<WebhookConfig | null> {
    // TODO: Charger depuis DB
    return null;
  }

  /**
   * Désactiver un webhook
   */
  async disableWebhook(webhookId: string): Promise<boolean> {
    try {
      // TODO: Mettre à jour dans DB
      console.log('[Webhook] Disabled:', webhookId);
      return true;
    } catch (error) {
      console.error('[Webhook] Error disabling:', error);
      return false;
    }
  }

  /**
   * Supprimer un webhook
   */
  async deleteWebhook(webhookId: string): Promise<boolean> {
    try {
      // TODO: Supprimer de DB
      console.log('[Webhook] Deleted:', webhookId);
      return true;
    } catch (error) {
      console.error('[Webhook] Error deleting:', error);
      return false;
    }
  }
}

// ============================================
// HELPERS POUR UTILISATION FACILE
// ============================================

/**
 * Envoyer webhook pour événement calendrier créé
 */
export async function notifyCalendarEventCreated(event: any): Promise<void> {
  await WebhookService.getInstance().send('calendar.event.created', {
    eventId: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    priority: event.priority,
  });
}

/**
 * Envoyer webhook pour conflit détecté
 */
export async function notifyConflictDetected(conflict: any): Promise<void> {
  await WebhookService.getInstance().send('calendar.conflict.detected', conflict);
}

/**
 * Envoyer webhook pour SLA dépassé
 */
export async function notifySLAOverdue(event: any): Promise<void> {
  await WebhookService.getInstance().send('calendar.sla.overdue', {
    eventId: event.id,
    title: event.title,
    slaDueAt: event.slaDueAt,
    daysOverdue: event.daysOverdue,
  });
}

/**
 * Envoyer webhook pour délégation révoquée
 */
export async function notifyDelegationRevoked(delegation: any): Promise<void> {
  await WebhookService.getInstance().send('delegation.revoked', {
    delegationId: delegation.id,
    title: delegation.title,
    reason: delegation.revokeReason,
  });
}

// Export singleton
export default WebhookService.getInstance();


