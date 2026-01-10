/**
 * POST /api/alerts/[id]/acknowledge
 * Acquitter une alerte
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { note, userId = 'user-001' } = body;

    // Simuler acquittement (en prod, update DB)
    await new Promise((resolve) => setTimeout(resolve, 500));

    const acknowledgedAlert = {
      id,
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: userId,
      note: note || null,
      status: 'acknowledged',
    };

    return NextResponse.json({
      success: true,
      alert: acknowledgedAlert,
      message: 'Alerte acquittée avec succès',
    });
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    return NextResponse.json(
      { error: 'Failed to acknowledge alert' },
      { status: 500 }
    );
  }
}
