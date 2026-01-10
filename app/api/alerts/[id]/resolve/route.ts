/**
 * API Route: POST /api/alerts/[id]/resolve
 * Résout une alerte
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
      resolution, 
      rootCause,
      preventionMeasures,
      documentsAttached = []
    } = body;

    // Validation
    if (!resolution) {
      return NextResponse.json(
        {
          success: false,
          error: 'Résolution requise',
          details: 'Une description de la résolution est obligatoire'
        },
        { status: 400 }
      );
    }

    // Calculate resolution metrics
    const createdAt = new Date('2026-01-10T08:30:00Z');
    const resolvedAt = new Date();
    const resolutionTimeMs = resolvedAt.getTime() - createdAt.getTime();
    const resolutionTimeHours = Math.round(resolutionTimeMs / (1000 * 60 * 60) * 10) / 10;

    // Simulate resolution
    const result = {
      id,
      status: 'resolved',
      resolvedAt: resolvedAt.toISOString(),
      resolvedBy: userName || 'Utilisateur',
      resolvedById: userId || 'USER-001',
      
      resolution: {
        description: resolution,
        rootCause: rootCause || null,
        preventionMeasures: preventionMeasures || null,
        documentsAttached,
        
        metrics: {
          resolutionTimeHours,
          slaCompliant: resolutionTimeHours < 48,
          escalationCount: 0
        }
      },
      
      // Timeline entry
      timelineEntry: {
        id: `TL-${Date.now()}`,
        type: 'resolve',
        description: `Résolue: ${resolution}`,
        timestamp: resolvedAt.toISOString(),
        actor: userName || 'Utilisateur',
        actorId: userId || 'USER-001'
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Alerte résolue avec succès',
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const { id } = await params;
    console.error(`Erreur API POST /api/alerts/${id}/resolve:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la résolution',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

