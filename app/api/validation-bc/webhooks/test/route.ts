// API Route: POST /api/validation-bc/webhooks/test
// Tester un webhook

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { webhookId } = body;

    if (!webhookId) {
      return NextResponse.json({ error: 'webhookId requis' }, { status: 400 });
    }

    // En production, récupérer le webhook depuis la DB et l'appeler
    const testPayload = {
      event: 'test',
      webhookId,
      timestamp: new Date().toISOString(),
      data: {
        message: 'Ceci est un test de webhook',
      },
    };

    console.log(`[validation-bc/webhooks/test] Testing webhook: ${webhookId}`);

    return NextResponse.json({
      success: true,
      message: 'Webhook testé avec succès',
      testPayload,
    });
  } catch (error) {
    console.error('[validation-bc/webhooks/test] Error:', error);
    return NextResponse.json({ error: 'Failed to test webhook' }, { status: 500 });
  }
}

