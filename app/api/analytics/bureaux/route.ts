import { NextRequest, NextResponse } from 'next/server';
import { calculateBureauPerformance } from '@/lib/data/analytics';

/**
 * GET /api/analytics/bureaux
 * 
 * Récupère les performances de tous les bureaux
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bureauCode = searchParams.get('bureauCode');
    const period = searchParams.get('period') || 'month';

    // Calculer les performances des bureaux
    const bureaux = calculateBureauPerformance();

    // Filtrer par bureau si spécifié
    const filteredBureaux = bureauCode
      ? bureaux.filter(b => b.bureauCode === bureauCode)
      : bureaux;

    return NextResponse.json({
      bureaux: filteredBureaux,
      total: filteredBureaux.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching bureaux performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bureaux performance' },
      { status: 500 }
    );
  }
}

