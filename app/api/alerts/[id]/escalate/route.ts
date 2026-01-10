/**
 * POST /api/alerts/[id]/escalate
 * Escalader une alerte vers N+1
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
      escalateTo, // 'n1_manager' | 'direction' | 'comite' | 'dsi'
      reason,
      priority = 'high', // 'critical' | 'high' | 'medium'
      userId = 'user-001',
    } = body;

    if (!escalateTo || !reason) {
      return NextResponse.json(
        { error: 'Escalation target and reason are required' },
        { status: 400 }
      );
    }

    // Simuler escalade (en prod, update DB + envoyer notification)
    await new Promise((resolve) => setTimeout(resolve, 500));

    const escalatedAlert = {
      id,
      status: 'escalated',
      escalatedAt: new Date().toISOString(),
      escalatedBy: userId,
      escalation: {
        to: escalateTo,
        reason,
        priority,
        notificationSent: true,
      },
    };

    // En prod, envoyer email/notification au destinataire
    const notificationTarget = {
      n1_manager: 'manager@company.com',
      direction: 'direction@company.com',
      comite: 'comite@company.com',
      dsi: 'dsi@company.com',
    }[escalateTo];

    return NextResponse.json({
      success: true,
      alert: escalatedAlert,
      notification: {
        sent: true,
        recipient: notificationTarget,
      },
      message: `Alerte escaladée vers ${escalateTo}`,
    });
  } catch (error) {
    console.error('Error escalating alert:', error);
    return NextResponse.json(
      { error: 'Failed to escalate alert' },
      { status: 500 }
    );
  }
}
