/**
 * API Route: POST /api/alerts/[id]/acknowledge
 * Acquitte une alerte
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const { userId, userName, comment } = body;

    // Simulate acknowledgment
    const result = {
      id,
      status: 'acknowledged',
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: userName || 'Utilisateur',
      acknowledgedById: userId || 'USER-001',
      comment: comment || null,
      
      // Next action hints
      nextActions: ['resolve', 'escalate', 'dismiss'],
      
      // Timeline entry created
      timelineEntry: {
        id: `TL-${Date.now()}`,
        type: 'acknowledge',
        description: comment ? `Acquittée: ${comment}` : 'Alerte acquittée',
        timestamp: new Date().toISOString(),
        actor: userName || 'Utilisateur',
        actorId: userId || 'USER-001'
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Alerte acquittée avec succès',
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const { id } = await params;
    console.error(`Erreur API POST /api/alerts/${id}/acknowledge:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'acquittement',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

