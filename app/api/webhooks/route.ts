import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/webhooks
 * 
 * Endpoint pour recevoir les webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, source, data, timestamp } = body;

    if (!event || !source) {
      return NextResponse.json(
        { error: 'event et source requis' },
        { status: 400 }
      );
    }

    // Log du webhook reçu
    console.log('Webhook reçu:', {
      event,
      source,
      timestamp: timestamp || new Date().toISOString(),
      dataKeys: Object.keys(data || {}),
    });

    // Traitement selon le type d'événement
    switch (event) {
      case 'calendar.event.created':
      case 'calendar.event.updated':
      case 'calendar.event.deleted':
        // Traiter événement calendrier
        console.log(`Événement calendrier ${event}:`, data);
        break;

      case 'delegation.created':
      case 'delegation.approved':
      case 'delegation.revoked':
        // Traiter événement délégation
        console.log(`Événement délégation ${event}:`, data);
        break;

      case 'analytics.alert.triggered':
        // Traiter alerte analytics
        console.log(`Alerte analytics ${event}:`, data);
        break;

      case 'demande.submitted':
      case 'demande.approved':
      case 'demande.rejected':
        // Traiter événement demande RH
        console.log(`Événement demande ${event}:`, data);
        break;

      default:
        console.log(`Événement non géré: ${event}`);
    }

    return NextResponse.json({
      received: true,
      event,
      source,
      processedAt: new Date().toISOString(),
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur POST /api/webhooks:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors du traitement du webhook' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks
 * 
 * Liste les webhooks enregistrés
 */
export async function GET(request: NextRequest) {
  try {
    const webhooks = [
      {
        id: 'wh-1',
        name: 'Notifications Slack',
        url: 'https://hooks.slack.com/services/XXX',
        events: ['calendar.event.created', 'analytics.alert.triggered'],
        active: true,
        createdAt: '2026-01-01T00:00:00Z',
        lastTriggered: '2026-01-10T12:00:00Z',
      },
      {
        id: 'wh-2',
        name: 'Email Notifications',
        url: 'https://api.sendgrid.com/v3/mail/send',
        events: ['delegation.approved', 'delegation.revoked'],
        active: true,
        createdAt: '2026-01-01T00:00:00Z',
        lastTriggered: '2026-01-09T15:30:00Z',
      },
      {
        id: 'wh-3',
        name: 'SMS Alerts',
        url: 'https://api.twilio.com/2010-04-01/Accounts/XXX/Messages.json',
        events: ['analytics.alert.triggered'],
        active: false,
        createdAt: '2026-01-01T00:00:00Z',
        lastTriggered: null,
      },
    ];

    return NextResponse.json({
      webhooks,
      total: webhooks.length,
      active: webhooks.filter(w => w.active).length,
    }, { status: 200 });
  } catch (error) {
    console.error('Erreur GET /api/webhooks:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des webhooks' },
      { status: 500 }
    );
  }
}

