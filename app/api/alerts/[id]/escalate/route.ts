import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/alerts/[id]/escalate
 * Escalader une alerte
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { escalateTo, reason, priority, userId } = body;

    if (!escalateTo || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: escalateTo, reason' },
        { status: 400 }
      );
    }

    // Simuler l'escalade
    const alert = {
      id,
      status: 'escalated',
      escalatedAt: new Date().toISOString(),
      escalatedBy: userId,
      escalateTo,
      escalationReason: reason,
      priority: priority || 10,
      updatedAt: new Date().toISOString(),
    };

    // Créer une notification
    const notification = {
      id: `notif-${Date.now()}`,
      type: 'escalation',
      recipientId: escalateTo,
      alertId: id,
      message: `Alert escalated by ${userId}: ${reason}`,
      createdAt: new Date().toISOString(),
      read: false,
    };

    // Créer une entrée timeline
    const timelineEntry = {
      id: `timeline-${Date.now()}`,
      alertId: id,
      type: 'escalated',
      userId,
      timestamp: new Date().toISOString(),
      data: { escalateTo, reason, priority },
    };

    return NextResponse.json({
      success: true,
      alert,
      notification,
      timeline: timelineEntry,
      message: 'Alert escalated successfully',
    });
  } catch (error) {
    console.error('Error escalating alert:', error);
    return NextResponse.json(
      { error: 'Failed to escalate alert', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
