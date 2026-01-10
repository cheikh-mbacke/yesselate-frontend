// API Route: POST /api/validation-bc/documents/[id]/reject
// Rejeter un document

import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reason, comment } = body;

    if (!reason) {
      return NextResponse.json(
        { error: 'Reason is required' },
        { status: 400 }
      );
    }

    // Simuler le rejet
    await new Promise((resolve) => setTimeout(resolve, 500));

    const rejectedDocument = {
      id,
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectedBy: {
        id: 'USR-001',
        name: 'A. DIALLO',
        role: 'Directeur BMO',
      },
      reason,
      comment: comment || null,
      hash: `SHA3-256:${Math.random().toString(16).slice(2)}`,
    };

    console.log(`[validation-bc/documents/${id}/reject] Document rejected`, {
      reason,
    });

    return NextResponse.json({
      success: true,
      document: rejectedDocument,
      message: 'Document rejeté avec succès',
    });
  } catch (error) {
    console.error(`[validation-bc/documents/reject] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to reject document' },
      { status: 500 }
    );
  }
}

