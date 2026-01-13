import { NextRequest, NextResponse } from 'next/server';
import type { DocumentAnnotation } from '@/lib/types/document-validation.types';
import type { UpdateAnnotationDto } from '@/lib/services/validation-bc-anomalies.service';

/**
 * PATCH /api/validation-bc/annotations/[id]
 * Met à jour une annotation existante
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body: UpdateAnnotationDto = await req.json();

    // TODO: Remplacer par une vraie mise à jour en base de données
    // Mock data pour développement
    const updatedAnnotation: DocumentAnnotation = {
      id,
      documentId: 'BC-123', // TODO: Récupérer depuis la base
      documentType: 'bc',
      comment: body.comment,
      createdBy: 'Jean Dupont', // TODO: Récupérer depuis la base
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      type: 'comment',
    };

    return NextResponse.json(updatedAnnotation);
  } catch (error) {
    console.error('Error updating annotation:', error);
    return NextResponse.json(
      { error: 'Failed to update annotation' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/validation-bc/annotations/[id]
 * Supprime une annotation
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // TODO: Remplacer par une vraie suppression en base de données
    // Pour l'instant, on retourne juste un succès

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting annotation:', error);
    return NextResponse.json(
      { error: 'Failed to delete annotation' },
      { status: 500 }
    );
  }
}

