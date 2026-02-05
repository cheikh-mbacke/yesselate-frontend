import { NextRequest, NextResponse } from 'next/server';
import type { DocumentAnnotation } from '@/lib/types/document-validation.types';
import type { CreateAnnotationDto } from '@/lib/services/validation-bc-anomalies.service';

/**
 * POST /api/validation-bc/annotations
 * Crée une nouvelle annotation
 */
export async function POST(req: NextRequest) {
  try {
    const body: CreateAnnotationDto = await req.json();

    // TODO: Remplacer par une vraie création en base de données
    // Mock data pour développement
    const newAnnotation: DocumentAnnotation = {
      id: `ANN-${Date.now()}`,
      documentId: body.documentId,
      documentType: body.documentType,
      field: body.field,
      comment: body.comment,
      anomalyId: body.anomalyId,
      createdBy: body.createdBy,
      createdAt: new Date().toISOString(),
      type: body.type || 'comment',
    };

    return NextResponse.json(newAnnotation, { status: 201 });
  } catch (error) {
    console.error('Error creating annotation:', error);
    return NextResponse.json(
      { error: 'Failed to create annotation' },
      { status: 500 }
    );
  }
}

