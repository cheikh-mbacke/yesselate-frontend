/**
 * SYSTÈME DE NOTIFICATIONS EN TEMPS RÉEL
 * 
 * Ce système gère :
 * - Notifications push
 * - Emails automatiques
 * - Webhooks externes
 * - Notifications in-app
 * - Notifications SLA
 */

import { CalendarEvent, CalendarEventAssignee } from '@prisma/client';

// ============================================
// TYPES
// ============================================

export type NotificationType = 
  | 'event_created'
  | 'event_updated'
  | 'event_cancelled'
  | 'event_rescheduled'
  | 'event_completed'
  | 'event_reminder'
  | 'event_conflict'
  | 'sla_warning'
  | 'sla_overdue'
  | 'participant_added'
  | 'participant_removed';

export interface NotificationChannel {
  email?: boolean;
  push?: boolean;
  sms?: boolean;
  webhook?: boolean;
  inApp?: boolean;
}

export interface NotificationPayload {
  type: NotificationType;
  event: any;
  actor?: {
    id: string;
    name: string;
  };
  metadata?: Record<string, any>;
  channels?: NotificationChannel;
  urgency?: 'low' | 'normal' | 'high' | 'critical';
}

// ============================================
// SERVICE PRINCIPAL
// ============================================

export class CalendarNotificationService {
  private static instance: CalendarNotificationService;

  private constructor() {}

  public static getInstance(): CalendarNotificationService {
    if (!this.instance) {
      this.instance = new CalendarNotificationService();
    }
    return this.instance;
  }

  /**
   * Envoi d'une notification
   */
  async send(payload: NotificationPayload): Promise<void> {
    const { type, event, actor, metadata, channels, urgency } = payload;

    // Déterminer les canaux par défaut selon le type
    const defaultChannels = this.getDefaultChannels(type, urgency);
    const finalChannels = { ...defaultChannels, ...channels };

    // Récupérer les destinataires
    const recipients = await this.getRecipients(event, type);

    // Envoyer via chaque canal
    const promises: Promise<void>[] = [];

    if (finalChannels.email) {
      promises.push(this.sendEmailNotifications(recipients, type, event, actor, metadata));
    }

    if (finalChannels.push) {
      promises.push(this.sendPushNotifications(recipients, type, event, actor));
    }

    if (finalChannels.sms && urgency === 'critical') {
      promises.push(this.sendSMSNotifications(recipients, type, event));
    }

    if (finalChannels.webhook) {
      promises.push(this.sendWebhookNotifications(type, event, actor, metadata));
    }

    if (finalChannels.inApp) {
      promises.push(this.createInAppNotifications(recipients, type, event, actor));
    }

    await Promise.allSettled(promises);
  }

  /**
   * Déterminer les canaux par défaut
   */
  private getDefaultChannels(type: NotificationType, urgency?: string): NotificationChannel {
    // Par défaut : email + in-app
    const channels: NotificationChannel = {
      email: true,
      inApp: true,
      push: false,
      sms: false,
      webhook: false,
    };

    // Selon l'urgence
    if (urgency === 'critical') {
      channels.push = true;
      channels.sms = true;
    } else if (urgency === 'high') {
      channels.push = true;
    }

    // Selon le type
    if (type === 'sla_overdue' || type === 'event_conflict') {
      channels.push = true;
    }

    return channels;
  }

  /**
   * Récupérer les destinataires
   */
  private async getRecipients(event: any, type: NotificationType): Promise<any[]> {
    // Par défaut : tous les participants
    let recipients = event.assignees || [];

    // Selon le type, on peut filtrer/ajouter des destinataires
    if (type === 'event_conflict') {
      // Ajouter le créateur de l'événement
      // recipients.push(...);
    }

    if (type === 'sla_overdue') {
      // Ajouter les managers/responsables
      // recipients.push(...);
    }

    return recipients;
  }

  /**
   * EMAIL
   */
  private async sendEmailNotifications(
    recipients: any[],
    type: NotificationType,
    event: any,
    actor?: any,
    metadata?: any
  ): Promise<void> {
    console.log('[Email] Sending notifications:', {
      to: recipients.map(r => r.userName || r.name),
      type,
      event: event.title,
    });

    // TODO: Implémenter avec un service email (SendGrid, AWS SES, etc.)
    // const emailService = new EmailService();
    
    for (const recipient of recipients) {
      const emailContent = this.generateEmailContent(type, event, actor, metadata);
      
      // await emailService.send({
      //   to: recipient.userEmail,
      //   subject: emailContent.subject,
      //   html: emailContent.html,
      // });
    }
  }

  /**
   * PUSH NOTIFICATIONS
   */
  private async sendPushNotifications(
    recipients: any[],
    type: NotificationType,
    event: any,
    actor?: any
  ): Promise<void> {
    console.log('[Push] Sending notifications:', {
      to: recipients.map(r => r.userName || r.name),
      type,
      event: event.title,
    });

    // TODO: Implémenter avec Firebase Cloud Messaging, OneSignal, etc.
    // const pushService = new PushNotificationService();
    
    for (const recipient of recipients) {
      const pushContent = this.generatePushContent(type, event, actor);
      
      // await pushService.send({
      //   userId: recipient.userId,
      //   title: pushContent.title,
      //   body: pushContent.body,
      //   data: { eventId: event.id, type },
      // });
    }
  }

  /**
   * SMS
   */
  private async sendSMSNotifications(
    recipients: any[],
    type: NotificationType,
    event: any
  ): Promise<void> {
    console.log('[SMS] Sending notifications:', {
      to: recipients.map(r => r.userName || r.name),
      type,
      event: event.title,
    });

    // TODO: Implémenter avec Twilio, AWS SNS, etc.
    // const smsService = new SMSService();
    
    for (const recipient of recipients) {
      const smsContent = this.generateSMSContent(type, event);
      
      // if (recipient.phone) {
      //   await smsService.send({
      //     to: recipient.phone,
      //     message: smsContent,
      //   });
      // }
    }
  }

  /**
   * WEBHOOKS
   */
  private async sendWebhookNotifications(
    type: NotificationType,
    event: any,
    actor?: any,
    metadata?: any
  ): Promise<void> {
    console.log('[Webhook] Sending notification:', {
      type,
      event: event.title,
    });

    // TODO: Récupérer les webhooks configurés depuis la DB ou config
    // const webhooks = await getConfiguredWebhooks();
    
    const payload = {
      type,
      event: {
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        status: event.status,
        priority: event.priority,
      },
      actor,
      metadata,
      timestamp: new Date().toISOString(),
    };

    // for (const webhook of webhooks) {
    //   await fetch(webhook.url, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'X-Webhook-Secret': webhook.secret,
    //     },
    //     body: JSON.stringify(payload),
    //   });
    // }
  }

  /**
   * IN-APP NOTIFICATIONS
   */
  private async createInAppNotifications(
    recipients: any[],
    type: NotificationType,
    event: any,
    actor?: any
  ): Promise<void> {
    console.log('[In-App] Creating notifications:', {
      to: recipients.map(r => r.userName || r.name),
      type,
      event: event.title,
    });

    // TODO: Enregistrer dans une table InAppNotification
    // const notificationService = new InAppNotificationService();
    
    for (const recipient of recipients) {
      const content = this.generateInAppContent(type, event, actor);
      
      // await notificationService.create({
      //   userId: recipient.userId,
      //   type,
      //   title: content.title,
      //   message: content.message,
      //   link: `/calendrier?eventId=${event.id}`,
      //   eventId: event.id,
      //   read: false,
      // });
    }
  }

  // ============================================
  // GÉNÉRATEURS DE CONTENU
  // ============================================

  private generateEmailContent(
    type: NotificationType,
    event: any,
    actor?: any,
    metadata?: any
  ) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const eventUrl = `${baseUrl}/maitre-ouvrage/calendrier?eventId=${event.id}`;

    let subject = '';
    let html = '';

    switch (type) {
      case 'event_created':
        subject = `Nouvel événement : ${event.title}`;
        html = `
          <h2>Nouvel événement créé</h2>
          <p><strong>${event.title}</strong></p>
          <p>📅 ${new Date(event.start).toLocaleString('fr-FR')} - ${new Date(event.end).toLocaleString('fr-FR')}</p>
          ${event.location ? `<p>📍 ${event.location}</p>` : ''}
          ${event.description ? `<p>${event.description}</p>` : ''}
          <p><a href="${eventUrl}">Voir les détails</a></p>
        `;
        break;

      case 'event_rescheduled':
        subject = `Événement reprogrammé : ${event.title}`;
        html = `
          <h2>⚠️ Événement reprogrammé</h2>
          <p><strong>${event.title}</strong></p>
          <p>📅 Nouvelle date : ${new Date(event.start).toLocaleString('fr-FR')} - ${new Date(event.end).toLocaleString('fr-FR')}</p>
          ${metadata?.oldStart ? `<p>🗓️ Ancienne date : ${new Date(metadata.oldStart).toLocaleString('fr-FR')}</p>` : ''}
          <p><a href="${eventUrl}">Voir les détails</a></p>
        `;
        break;

      case 'event_cancelled':
        subject = `Événement annulé : ${event.title}`;
        html = `
          <h2>❌ Événement annulé</h2>
          <p><strong>${event.title}</strong></p>
          <p>📅 Était prévu le : ${new Date(event.start).toLocaleString('fr-FR')}</p>
          ${metadata?.reason ? `<p>Raison : ${metadata.reason}</p>` : ''}
        `;
        break;

      case 'sla_warning':
        subject = `⚠️ SLA proche - ${event.title}`;
        html = `
          <h2>⏰ Échéance SLA proche</h2>
          <p><strong>${event.title}</strong></p>
          <p>📅 Échéance : ${event.slaDueAt ? new Date(event.slaDueAt).toLocaleString('fr-FR') : 'N/A'}</p>
          <p style="color: #f59e0b;">Action requise avant l'échéance.</p>
          <p><a href="${eventUrl}">Voir les détails</a></p>
        `;
        break;

      case 'sla_overdue':
        subject = `🔴 SLA DÉPASSÉ - ${event.title}`;
        html = `
          <h2 style="color: #dc2626;">🔴 SLA DÉPASSÉ</h2>
          <p><strong>${event.title}</strong></p>
          <p>📅 Échéance dépassée depuis : ${event.slaDueAt ? new Date(event.slaDueAt).toLocaleString('fr-FR') : 'N/A'}</p>
          <p style="color: #dc2626; font-weight: bold;">ACTION URGENTE REQUISE</p>
          <p><a href="${eventUrl}">Traiter maintenant</a></p>
        `;
        break;

      case 'event_conflict':
        subject = `⚠️ Conflit détecté - ${event.title}`;
        html = `
          <h2>⚠️ Conflit d'événement</h2>
          <p>Un conflit a été détecté pour l'événement <strong>${event.title}</strong></p>
          <p>📅 ${new Date(event.start).toLocaleString('fr-FR')}</p>
          ${metadata?.conflictWith ? `<p>En conflit avec : <strong>${metadata.conflictWith}</strong></p>` : ''}
          <p><a href="${eventUrl}">Résoudre le conflit</a></p>
        `;
        break;

      default:
        subject = `Notification : ${event.title}`;
        html = `<p>${event.title}</p>`;
    }

    return { subject, html };
  }

  private generatePushContent(type: NotificationType, event: any, actor?: any) {
    let title = '';
    let body = '';

    switch (type) {
      case 'event_created':
        title = 'Nouvel événement';
        body = `${event.title} - ${new Date(event.start).toLocaleDateString('fr-FR')}`;
        break;

      case 'event_rescheduled':
        title = 'Événement reprogrammé';
        body = `${event.title} - Nouvelle date : ${new Date(event.start).toLocaleDateString('fr-FR')}`;
        break;

      case 'sla_overdue':
        title = '🔴 SLA DÉPASSÉ';
        body = `${event.title} - Action urgente requise`;
        break;

      case 'event_conflict':
        title = '⚠️ Conflit détecté';
        body = `${event.title} - Résolution nécessaire`;
        break;

      default:
        title = 'Notification calendrier';
        body = event.title;
    }

    return { title, body };
  }

  private generateSMSContent(type: NotificationType, event: any): string {
    switch (type) {
      case 'sla_overdue':
        return `[BMO] SLA DÉPASSÉ pour "${event.title}". Action urgente requise.`;
      
      case 'event_conflict':
        return `[BMO] Conflit détecté pour "${event.title}". Voir calendrier.`;
      
      default:
        return `[BMO] ${event.title} - ${new Date(event.start).toLocaleDateString('fr-FR')}`;
    }
  }

  private generateInAppContent(type: NotificationType, event: any, actor?: any) {
    let title = '';
    let message = '';
    let icon = '📅';

    switch (type) {
      case 'event_created':
        title = 'Nouvel événement';
        message = `${actor?.name || 'Quelqu\'un'} vous a ajouté à "${event.title}"`;
        icon = '📅';
        break;

      case 'event_rescheduled':
        title = 'Événement reprogrammé';
        message = `"${event.title}" a été reprogrammé`;
        icon = '⏰';
        break;

      case 'sla_overdue':
        title = 'SLA dépassé';
        message = `"${event.title}" nécessite une action urgente`;
        icon = '🔴';
        break;

      case 'event_conflict':
        title = 'Conflit détecté';
        message = `Conflit de planning pour "${event.title}"`;
        icon = '⚠️';
        break;

      default:
        title = 'Notification';
        message = event.title;
        icon = '📅';
    }

    return { title, message, icon };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Envoyer une notification pour un événement créé
 */
export async function notifyEventCreated(event: any, actorId?: string, actorName?: string) {
  const service = CalendarNotificationService.getInstance();
  await service.send({
    type: 'event_created',
    event,
    actor: actorId ? { id: actorId, name: actorName || 'Utilisateur' } : undefined,
  });
}

/**
 * Envoyer une notification pour un événement modifié
 */
export async function notifyEventUpdated(event: any, changes: any, actorId?: string, actorName?: string) {
  const service = CalendarNotificationService.getInstance();
  await service.send({
    type: 'event_updated',
    event,
    actor: actorId ? { id: actorId, name: actorName || 'Utilisateur' } : undefined,
    metadata: { changes },
  });
}

/**
 * Envoyer une notification pour un événement reprogrammé
 */
export async function notifyEventRescheduled(
  event: any,
  oldStart: Date,
  oldEnd: Date,
  actorId?: string,
  actorName?: string
) {
  const service = CalendarNotificationService.getInstance();
  await service.send({
    type: 'event_rescheduled',
    event,
    actor: actorId ? { id: actorId, name: actorName || 'Utilisateur' } : undefined,
    metadata: { oldStart, oldEnd },
    urgency: 'high',
  });
}

/**
 * Envoyer une notification pour un événement annulé
 */
export async function notifyEventCancelled(event: any, reason?: string, actorId?: string, actorName?: string) {
  const service = CalendarNotificationService.getInstance();
  await service.send({
    type: 'event_cancelled',
    event,
    actor: actorId ? { id: actorId, name: actorName || 'Utilisateur' } : undefined,
    metadata: { reason },
    urgency: 'high',
  });
}

/**
 * Envoyer une notification de warning SLA
 */
export async function notifySLAWarning(event: any) {
  const service = CalendarNotificationService.getInstance();
  await service.send({
    type: 'sla_warning',
    event,
    urgency: 'high',
  });
}

/**
 * Envoyer une notification de SLA dépassé
 */
export async function notifySLAOverdue(event: any) {
  const service = CalendarNotificationService.getInstance();
  await service.send({
    type: 'sla_overdue',
    event,
    urgency: 'critical',
  });
}

/**
 * Envoyer une notification de conflit
 */
export async function notifyConflict(event: any, conflictingEvent: any) {
  const service = CalendarNotificationService.getInstance();
  await service.send({
    type: 'event_conflict',
    event,
    metadata: { conflictWith: conflictingEvent.title },
    urgency: 'high',
  });
}

// Export singleton
export default CalendarNotificationService.getInstance();

