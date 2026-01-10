// API Route: POST /api/validation-bc/documents/[id]/validate
// Valider un document

import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { comment, signature } = body;

    // Simuler la validation
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Dans une vraie app, on mettrait à jour la DB
    const validatedDocument = {
      id,
      status: 'validated',
      validatedAt: new Date().toISOString(),
      validatedBy: {
        id: 'USR-001',
        name: 'A. DIALLO',
        role: 'Directeur BMO',
      },
      comment: comment || null,
      signature,
      hash: `SHA3-256:${Math.random().toString(16).slice(2)}`,
    };

    console.log(`[validation-bc/documents/${id}/validate] Document validated`, {
      comment: comment ? 'with comment' : 'no comment',
    });

    return NextResponse.json({
      success: true,
      document: validatedDocument,
      message: 'Document validé avec succès',
    });
  } catch (error) {
    console.error(`[validation-bc/documents/validate] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to validate document' },
      { status: 500 }
    );
  }
}

