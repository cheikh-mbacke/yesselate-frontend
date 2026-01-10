import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/alerts/[id]/resolve
 * Résoudre une alerte
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { resolutionType, note, proof, userId } = body;

    if (!resolutionType || !note) {
      return NextResponse.json(
        { error: 'Missing required fields: resolutionType, note' },
        { status: 400 }
      );
    }

    // Simuler la résolution
    const alert = {
      id,
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
      resolvedBy: userId,
      resolutionType,
      resolutionNote: note,
      resolutionProof: proof,
      updatedAt: new Date().toISOString(),
    };

    // Créer une entrée timeline
    const timelineEntry = {
      id: `timeline-${Date.now()}`,
      alertId: id,
      type: 'resolved',
      userId,
      timestamp: new Date().toISOString(),
      data: { resolutionType, note, proof },
    };

    return NextResponse.json({
      success: true,
      alert,
      timeline: timelineEntry,
      message: 'Alert resolved successfully',
    });
  } catch (error) {
    console.error('Error resolving alert:', error);
    return NextResponse.json(
      { error: 'Failed to resolve alert', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
