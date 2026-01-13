import { NextRequest, NextResponse } from 'next/server';
import {
  generateMockAnnotations,
  generateMockAnomalies,
} from '@/lib/mocks/validation-bc-anomalies.mock';

/**
 * GET /api/validation-bc/documents/[id]/annotations
 * Récupère toutes les annotations d'un document
 * 
 * TODO: Remplacer generateMockAnnotations() par une vraie requête à la base de données
 * Exemple: const annotations = await prisma.annotation.findMany({ where: { documentId } });
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;

    // Utiliser les fonctions mock centralisées avec liens vers anomalies
    // TODO: Remplacer par une vraie requête à la base de données
    const anomalies = generateMockAnomalies(documentId, 'bc', {
      count: 5,
      includeResolved: true,
    });
    const anomalyIds = anomalies.map(a => a.id);
    
    const mockAnnotations = generateMockAnnotations(documentId, 'bc', anomalyIds, {
      count: 3,
      includeTypes: ['comment', 'correction', 'approval'],
    });

    return NextResponse.json(mockAnnotations);
  } catch (error) {
    console.error('Error fetching annotations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch annotations' },
      { status: 500 }
    );
  }
}

