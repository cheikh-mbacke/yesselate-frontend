import { NextRequest, NextResponse } from 'next/server';
import { bureauxGovernance } from '@/lib/data';

/**
 * GET /api/bureaux/[code]
 * =======================
 * Récupérer les détails d'un bureau spécifique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const bureau = bureauxGovernance.find((b: any) => b.code === code);

    if (!bureau) {
      return NextResponse.json(
        { error: 'Bureau not found' },
        { status: 404 }
      );
    }

    // Enrichir avec des données supplémentaires
    const enriched = {
      ...bureau,
      projets: {
        actifs: 12,
        enRetard: 3,
        total: 15,
      },
      decisions: {
        prises: 47,
        enAttente: 8,
      },
      kpis: [
        { label: 'Délai moyen', value: 12, unit: ' jours', trend: 'down' as const },
        { label: 'Satisfaction', value: 87, unit: '%', trend: 'up' as const },
        { label: 'Taux validation', value: 92, unit: '%', trend: 'neutral' as const },
      ],
    };

    return NextResponse.json(enriched);
  } catch (error) {
    console.error('Error fetching bureau:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bureau' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/bureaux/[code]
 * =========================
 * Mettre à jour un bureau
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();

    // TODO: Mise à jour réelle dans la base de données
    
    return NextResponse.json({
      code,
      ...body,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating bureau:', error);
    return NextResponse.json(
      { error: 'Failed to update bureau' },
      { status: 500 }
    );
  }
}
