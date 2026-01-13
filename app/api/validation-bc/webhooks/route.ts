// API Route: /api/validation-bc/webhooks
// Gestion des webhooks pour intégrations externes

import { NextRequest, NextResponse } from 'next/server';

interface Webhook {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: string[]; // Types d'événements à écouter
  active: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
  failureCount: number;
  metadata?: Record<string, any>;
}

// Mock data
const mockWebhooks: Webhook[] = [];

/**
 * GET - Liste tous les webhooks
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      webhooks: mockWebhooks,
      total: mockWebhooks.length,
    });
  } catch (error) {
    console.error('[validation-bc/webhooks] Error:', error);
    return NextResponse.json({ error: 'Failed to load webhooks' }, { status: 500 });
  }
}

/**
 * POST - Crée un nouveau webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, url, events, metadata } = body;

    if (!name || !url || !events || events.length === 0) {
      return NextResponse.json(
        { error: 'name, url et events requis' },
        { status: 400 }
      );
    }

    // Valider l'URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'URL invalide' }, { status: 400 });
    }

    // Générer un secret
    const secret = `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    const webhook: Webhook = {
      id: `wh-${Date.now()}`,
      name,
      url,
      secret,
      events,
      active: true,
      createdAt: new Date().toISOString(),
      failureCount: 0,
      metadata,
    };

    mockWebhooks.push(webhook);

    console.log(`[validation-bc/webhooks] Created webhook: ${name}`);

    return NextResponse.json({
      success: true,
      webhook,
      message: 'Webhook créé avec succès. Conservez le secret en lieu sûr.',
    });
  } catch (error) {
    console.error('[validation-bc/webhooks] Error:', error);
    return NextResponse.json({ error: 'Failed to create webhook' }, { status: 500 });
  }
}

/**
 * PATCH - Met à jour un webhook
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { webhookId, name, url, events, active } = body;

    if (!webhookId) {
      return NextResponse.json({ error: 'webhookId requis' }, { status: 400 });
    }

    const index = mockWebhooks.findIndex((w) => w.id === webhookId);
    if (index === -1) {
      return NextResponse.json({ error: 'Webhook introuvable' }, { status: 404 });
    }

    if (name) mockWebhooks[index].name = name;
    if (url) mockWebhooks[index].url = url;
    if (events) mockWebhooks[index].events = events;
    if (active !== undefined) mockWebhooks[index].active = active;

    return NextResponse.json({
      success: true,
      webhook: mockWebhooks[index],
      message: 'Webhook mis à jour avec succès',
    });
  } catch (error) {
    console.error('[validation-bc/webhooks] Error:', error);
    return NextResponse.json({ error: 'Failed to update webhook' }, { status: 500 });
  }
}

/**
 * DELETE - Supprime un webhook
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const webhookId = searchParams.get('webhookId');

    if (!webhookId) {
      return NextResponse.json({ error: 'webhookId requis' }, { status: 400 });
    }

    const index = mockWebhooks.findIndex((w) => w.id === webhookId);
    if (index === -1) {
      return NextResponse.json({ error: 'Webhook introuvable' }, { status: 404 });
    }

    mockWebhooks.splice(index, 1);

    return NextResponse.json({
      success: true,
      message: 'Webhook supprimé avec succès',
    });
  } catch (error) {
    console.error('[validation-bc/webhooks] Error:', error);
    return NextResponse.json({ error: 'Failed to delete webhook' }, { status: 500 });
  }
}

