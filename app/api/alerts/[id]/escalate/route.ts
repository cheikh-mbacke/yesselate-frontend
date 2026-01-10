/**
 * API Route: POST /api/alerts/[id]/escalate
 * Escalade une alerte
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { 
      userId, 
      userName, 
      escalateTo,
      escalateToId,
      reason,
      urgency = 'normale',
      requestedAction
    } = body;

    // Validation
    if (!escalateTo || !reason) {
      return NextResponse.json(
        {
          success: false,
          error: 'Paramètres manquants',
          details: 'escalateTo et reason sont obligatoires'
        },
        { status: 400 }
      );
    }

    // Simulate escalation
    const result = {
      id,
      status: 'escalated',
      escalatedAt: new Date().toISOString(),
      escalatedBy: userName || 'Utilisateur',
      escalatedById: userId || 'USER-001',
      
      escalation: {
        to: escalateTo,
        toId: escalateToId || 'TEAM-DIRECTION',
        reason,
        urgency,
        requestedAction: requestedAction || 'Décision',
        
        // Notification sent
        notificationSent: true,
        notificationChannel: 'email',
        notificationTime: new Date().toISOString()
      },
      
      // New SLA (stricter after escalation)
      newSlaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // +24h
      
      // Timeline entry
      timelineEntry: {
        id: `TL-${Date.now()}`,
        type: 'escalate',
        description: `Escaladée vers ${escalateTo}: ${reason}`,
        timestamp: new Date().toISOString(),
        actor: userName || 'Utilisateur',
        actorId: userId || 'USER-001'
      }
    };

    return NextResponse.json({
      success: true,
      message: `Alerte escaladée vers ${escalateTo}`,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const { id } = await params;
    console.error(`Erreur API POST /api/alerts/${id}/escalate:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'escalade',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

