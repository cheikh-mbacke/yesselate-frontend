import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/alerts/[id]/acknowledge
 * Acquitter une alerte
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { note, userId } = body;

    // Simuler l'acquittement
    const alert = {
      id,
      status: 'acknowledged',
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: userId,
      acknowledgeNote: note,
      updatedAt: new Date().toISOString(),
    };

    // Créer une entrée timeline
    const timelineEntry = {
      id: `timeline-${Date.now()}`,
      alertId: id,
      type: 'acknowledged',
      userId,
      timestamp: new Date().toISOString(),
      data: { note },
    };

    return NextResponse.json({
      success: true,
      alert,
      timeline: timelineEntry,
      message: 'Alert acknowledged successfully',
    });
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    return NextResponse.json(
      { error: 'Failed to acknowledge alert', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
