/**
 * Système de notifications pour la validation BC
 * Multi-canal: Email, Push, In-app, Webhooks
 */

export type ValidationBCNotificationType =
  | 'document_created'
  | 'document_submitted'
  | 'document_validated'
  | 'document_rejected'
  | 'document_complement_requested'
  | 'document_assigned'
  | 'document_sla_warning'
  | 'document_sla_overdue'
  | 'anomaly_detected'
  | 'validation_level_completed'
  | 'urgent_document_pending';

export interface NotificationPayload {
  type: ValidationBCNotificationType;
  documentId: string;
  documentType: 'bc' | 'facture' | 'avenant';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  recipients: string[]; // User IDs
  metadata?: Record<string, any>;
  actionUrl?: string;
}

export interface NotificationChannel {
  email?: boolean;
  push?: boolean;
  inApp?: boolean;
  sms?: boolean;
  webhook?: boolean;
}

/**
 * Envoie une notification
 */
export async function sendNotification(
  payload: NotificationPayload,
  channels: NotificationChannel = { email: true, inApp: true }
): Promise<{ success: boolean; notificationId: string }> {
  const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  try {
    // 1. Notification In-App (toujours activée)
    if (channels.inApp) {
      await sendInAppNotification(notificationId, payload);
    }

    // 2. Email
    if (channels.email) {
      await sendEmailNotification(notificationId, payload);
    }

    // 3. Push notification
    if (channels.push) {
      await sendPushNotification(notificationId, payload);
    }

    // 4. SMS (pour les urgents)
    if (channels.sms && payload.priority === 'critical') {
      await sendSMSNotification(notificationId, payload);
    }

    // 5. Webhooks (pour intégrations externes)
    if (channels.webhook) {
      await triggerWebhooks(notificationId, payload);
    }

    console.log(`[ValidationBCNotifications] Sent ${payload.type} to ${payload.recipients.length} recipients`);

    return {
      success: true,
      notificationId,
    };
  } catch (error) {
    console.error('[ValidationBCNotifications] Error:', error);
    return {
      success: false,
      notificationId,
    };
  }
}

/**
 * Notification In-App
 */
async function sendInAppNotification(id: string, payload: NotificationPayload): Promise<void> {
  // En production, sauvegarder dans la DB
  console.log(`[InApp] ${payload.type}: ${payload.title}`);

  // Simuler l'envoi
  await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * Email
 */
async function sendEmailNotification(id: string, payload: NotificationPayload): Promise<void> {
  const emailTemplate = getEmailTemplate(payload);

  // En production, utiliser un service comme SendGrid, AWS SES, etc.
  console.log(`[Email] To: ${payload.recipients.join(', ')}`);
  console.log(`[Email] Subject: ${emailTemplate.subject}`);

  await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * Push notification
 */
async function sendPushNotification(id: string, payload: NotificationPayload): Promise<void> {
  // En production, utiliser FCM, APNS, OneSignal, etc.
  console.log(`[Push] ${payload.type}: ${payload.title}`);

  await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * SMS (uniquement pour priorité critique)
 */
async function sendSMSNotification(id: string, payload: NotificationPayload): Promise<void> {
  // En production, utiliser Twilio, AWS SNS, etc.
  console.log(`[SMS] ${payload.type}: ${payload.message}`);

  await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * Webhooks
 */
async function triggerWebhooks(id: string, payload: NotificationPayload): Promise<void> {
  // En production, récupérer les webhooks configurés depuis la DB
  const webhooks = [
    // { url: 'https://example.com/webhook', events: ['document_validated'] }
  ];

  for (const webhook of webhooks) {
    try {
      await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-ID': id,
          'X-Webhook-Type': payload.type,
        },
        body: JSON.stringify({
          id,
          type: payload.type,
          documentId: payload.documentId,
          documentType: payload.documentType,
          title: payload.title,
          message: payload.message,
          priority: payload.priority,
          timestamp: new Date().toISOString(),
          metadata: payload.metadata,
        }),
      });

      console.log(`[Webhook] Triggered: ${webhook.url}`);
    } catch (error) {
      console.error(`[Webhook] Error calling ${webhook.url}:`, error);
    }
  }
}

/**
 * Templates d'email
 */
function getEmailTemplate(payload: NotificationPayload): { subject: string; html: string } {
  const templates: Record<ValidationBCNotificationType, { subject: string; bodyTemplate: string }> = {
    document_created: {
      subject: `📄 Nouveau document ${payload.documentType.toUpperCase()} créé`,
      bodyTemplate: `Un nouveau document a été créé et nécessite votre attention.`,
    },
    document_submitted: {
      subject: `📤 Document soumis pour validation`,
      bodyTemplate: `Le document ${payload.documentId} a été soumis pour validation.`,
    },
    document_validated: {
      subject: `✅ Document validé`,
      bodyTemplate: `Le document ${payload.documentId} a été validé avec succès.`,
    },
    document_rejected: {
      subject: `❌ Document rejeté`,
      bodyTemplate: `Le document ${payload.documentId} a été rejeté.`,
    },
    document_complement_requested: {
      subject: `📝 Complément d'information requis`,
      bodyTemplate: `Un complément d'information est requis pour le document ${payload.documentId}.`,
    },
    document_assigned: {
      subject: `👤 Document assigné`,
      bodyTemplate: `Le document ${payload.documentId} vous a été assigné.`,
    },
    document_sla_warning: {
      subject: `⚠️ Avertissement SLA`,
      bodyTemplate: `Le document ${payload.documentId} approche de son délai limite.`,
    },
    document_sla_overdue: {
      subject: `🚨 SLA dépassé`,
      bodyTemplate: `Le document ${payload.documentId} a dépassé son délai limite.`,
    },
    anomaly_detected: {
      subject: `🔍 Anomalie détectée`,
      bodyTemplate: `Une anomalie a été détectée sur le document ${payload.documentId}.`,
    },
    validation_level_completed: {
      subject: `✨ Niveau de validation complété`,
      bodyTemplate: `Un niveau de validation a été complété pour le document ${payload.documentId}.`,
    },
    urgent_document_pending: {
      subject: `🔥 Document urgent en attente`,
      bodyTemplate: `Un document urgent nécessite une validation immédiate.`,
    },
  };

  const template = templates[payload.type];

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${payload.title}</h1>
    </div>
    <div class="content">
      <p>${template.bodyTemplate}</p>
      <p><strong>Message:</strong> ${payload.message}</p>
      ${payload.actionUrl ? `<a href="${payload.actionUrl}" class="button">Voir le document</a>` : ''}
    </div>
    <div class="footer">
      <p>Yesselate - Système de validation BMO</p>
      <p>Cette notification a été envoyée automatiquement.</p>
    </div>
  </div>
</body>
</html>
  `;

  return {
    subject: template.subject,
    html,
  };
}

/**
 * Helpers pour notifications courantes
 */
export async function notifyDocumentCreated(documentId: string, documentType: 'bc' | 'facture' | 'avenant', createdBy: string) {
  return sendNotification({
    type: 'document_created',
    documentId,
    documentType,
    title: `Nouveau ${documentType.toUpperCase()} créé`,
    message: `Le document ${documentId} a été créé par ${createdBy}`,
    priority: 'medium',
    recipients: ['validator-group'], // En production, déterminer les validateurs
    actionUrl: `/validation-bc?doc=${documentId}`,
  });
}

export async function notifyDocumentValidated(documentId: string, documentType: 'bc' | 'facture' | 'avenant', validatedBy: string) {
  return sendNotification({
    type: 'document_validated',
    documentId,
    documentType,
    title: `Document validé`,
    message: `Le document ${documentId} a été validé par ${validatedBy}`,
    priority: 'low',
    recipients: ['document-creator'], // En production, notifier le créateur
    actionUrl: `/validation-bc?doc=${documentId}`,
  });
}

export async function notifyAnomalyDetected(documentId: string, documentType: 'bc' | 'facture' | 'avenant', anomalies: string[]) {
  return sendNotification(
    {
      type: 'anomaly_detected',
      documentId,
      documentType,
      title: `Anomalie détectée`,
      message: `${anomalies.length} anomalie(s) détectée(s) sur le document ${documentId}`,
      priority: 'high',
      recipients: ['validator-group', 'admin-group'],
      metadata: { anomalies },
      actionUrl: `/validation-bc?doc=${documentId}`,
    },
    { email: true, inApp: true, push: true }
  );
}

export async function notifySLAOverdue(documentId: string, documentType: 'bc' | 'facture' | 'avenant', daysOverdue: number) {
  return sendNotification(
    {
      type: 'document_sla_overdue',
      documentId,
      documentType,
      title: `SLA dépassé`,
      message: `Le document ${documentId} a dépassé son délai de ${daysOverdue} jour(s)`,
      priority: 'critical',
      recipients: ['validator-group', 'manager-group'],
      metadata: { daysOverdue },
      actionUrl: `/validation-bc?doc=${documentId}`,
    },
    { email: true, inApp: true, push: true, sms: true }
  );
}

