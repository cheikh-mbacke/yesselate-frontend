import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/alerts/[id]/assign
 * Assigner une alerte à un utilisateur
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, note } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    // Simuler l'assignation
    const alert = {
      id,
      assignedTo: userId,
      assignedAt: new Date().toISOString(),
      assignmentNote: note,
      updatedAt: new Date().toISOString(),
    };

    // Créer une entrée timeline
    const timelineEntry = {
      id: `timeline-${Date.now()}`,
      alertId: id,
      type: 'assigned',
      userId,
      timestamp: new Date().toISOString(),
      data: { assignedTo: userId, note },
    };

    return NextResponse.json({
      success: true,
      alert,
      timeline: timelineEntry,
      message: 'Alert assigned successfully',
    });
  } catch (error) {
    console.error('Error assigning alert:', error);
    return NextResponse.json(
      { error: 'Failed to assign alert', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

