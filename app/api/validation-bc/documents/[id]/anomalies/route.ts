import { NextRequest, NextResponse } from 'next/server';
import { generateMockAnomalies } from '@/lib/mocks/validation-bc-anomalies.mock';

/**
 * GET /api/validation-bc/documents/[id]/anomalies
 * Récupère toutes les anomalies d'un document
 * 
 * TODO: Remplacer generateMockAnomalies() par une vraie requête à la base de données
 * Exemple: const anomalies = await prisma.anomaly.findMany({ where: { documentId } });
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;

    // Utiliser les fonctions mock centralisées
    // TODO: Remplacer par une vraie requête à la base de données
    const mockAnomalies = generateMockAnomalies(documentId, 'bc', {
      count: 5,
      includeResolved: true,
    });

    return NextResponse.json(mockAnomalies);
  } catch (error) {
    console.error('Error fetching anomalies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anomalies' },
      { status: 500 }
    );
  }
}

