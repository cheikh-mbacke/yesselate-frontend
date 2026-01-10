/**
 * POST /api/alerts/[id]/resolve
 * Résoudre une alerte
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
      resolutionType, // 'fixed' | 'false_positive' | 'workaround' | 'accepted'
      note,
      proof,
      userId = 'user-001',
    } = body;

    if (!resolutionType || !note) {
      return NextResponse.json(
        { error: 'Resolution type and note are required' },
        { status: 400 }
      );
    }

    // Simuler résolution (en prod, update DB)
    await new Promise((resolve) => setTimeout(resolve, 500));

    const resolvedAlert = {
      id,
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
      resolvedBy: userId,
      resolution: {
        type: resolutionType,
        note,
        proof: proof || null,
      },
    };

    return NextResponse.json({
      success: true,
      alert: resolvedAlert,
      message: 'Alerte résolue avec succès',
    });
  } catch (error) {
    console.error('Error resolving alert:', error);
    return NextResponse.json(
      { error: 'Failed to resolve alert' },
      { status: 500 }
    );
  }
}
