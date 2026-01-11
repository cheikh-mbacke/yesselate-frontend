import { NextRequest, NextResponse } from 'next/server';
import type { DocumentAnnotation } from '@/lib/types/document-validation.types';

/**
 * GET /api/validation-bc/documents/[documentId]/annotations
 * Récupère toutes les annotations d'un document
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params;

    // TODO: Remplacer par une vraie requête à la base de données
    // Mock data pour développement
    const mockAnnotations: DocumentAnnotation[] = [
      {
        id: `ANN-${documentId}-001`,
        documentId,
        documentType: 'bc',
        field: 'montant_ttc',
        comment: 'Montant corrigé après vérification avec le fournisseur. Le montant TTC correct est 15 230 €',
        anomalyId: `ANO-${documentId}-001`,
        createdBy: 'Jean Dupont',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        type: 'correction',
      },
      {
        id: `ANN-${documentId}-002`,
        documentId,
        documentType: 'bc',
        field: 'date_limite',
        comment: 'Date limite corrigée. Nouvelle date: 25/01/2024',
        anomalyId: `ANO-${documentId}-002`,
        createdBy: 'Marie Martin',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        type: 'correction',
      },
      {
        id: `ANN-${documentId}-003`,
        documentId,
        documentType: 'bc',
        comment: 'Document validé après correction des anomalies critiques',
        createdBy: 'Jean Dupont',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        type: 'approval',
      },
    ];

    return NextResponse.json(mockAnnotations);
  } catch (error) {
    console.error('Error fetching annotations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch annotations' },
      { status: 500 }
    );
  }
}

