import { NextRequest, NextResponse } from 'next/server';

// API pour les statistiques RH
export interface RHStats {
  totalDemandes: number;
  pending: number;
  validated: number;
  rejected: number;
  byType: Record<string, number>;
  byBureau: Record<string, number>;
  byPriority: Record<string, number>;
  averageProcessingTime: number; // en heures
  validationRate: number; // en %
  period: {
    start: string;
    end: string;
  };
}

// GET /api/rh/stats
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const bureau = searchParams.get('bureau');

    // Simulation de statistiques (à remplacer par de vraies données)
    const stats: RHStats = {
      totalDemandes: 156,
      pending: 23,
      validated: 118,
      rejected: 15,
      byType: {
        'Congé': 67,
        'Dépense': 45,
        'Maladie': 12,
        'Déplacement': 23,
        'Paie': 9,
      },
      byBureau: {
        'Alger': 78,
        'Oran': 45,
        'Constantine': 23,
        'Annaba': 10,
      },
      byPriority: {
        'urgent': 8,
        'high': 32,
        'normal': 116,
      },
      averageProcessingTime: 28.5,
      validationRate: 88.7,
      period: {
        start: startDate || '2026-01-01',
        end: endDate || '2026-01-10',
      },
    };

    // Filtrer par bureau si demandé
    if (bureau) {
      stats.totalDemandes = stats.byBureau[bureau] || 0;
    }

    return NextResponse.json({
      data: stats,
      success: true,
    });
  } catch (error) {
    console.error('Erreur GET /api/rh/stats:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

// GET /api/rh/stats/trends - Tendances sur la période
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { period, metrics } = body;

    // Simulation de tendances
    const trends = {
      demandes: {
        trend: 'up',
        change: 12.5,
        data: [45, 52, 48, 56, 61, 67, 65, 72, 78, 82],
      },
      validationRate: {
        trend: 'stable',
        change: 0.8,
        data: [87, 88, 86, 89, 88, 88, 87, 89, 88, 89],
      },
      processingTime: {
        trend: 'down',
        change: -8.3,
        data: [32, 31, 30, 28, 27, 28, 26, 25, 27, 26],
      },
    };

    return NextResponse.json({
      data: trends,
      period: period || { start: '2026-01-01', end: '2026-01-10' },
      success: true,
    });
  } catch (error) {
    console.error('Erreur POST /api/rh/stats/trends:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', success: false },
      { status: 500 }
    );
  }
}

