/**
 * GET /api/dashboard/stats
 * Stats globales du Dashboard BMO
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'year';

    // Données de démonstration
    const stats = {
      period,
      timestamp: new Date().toISOString(),
      
      // KPIs principaux
      kpis: {
        demandes: {
          value: 247,
          trend: 12,
          previousValue: 220,
          target: 260,
        },
        validations: {
          value: 89,
          unit: '%',
          trend: 3,
          previousValue: 86,
          target: 92,
        },
        rejets: {
          value: 11,
          unit: '%',
          trend: -3,
          previousValue: 14,
          target: 8,
        },
        budget: {
          value: 4.2,
          unit: 'Mds FCFA',
          trend: 10,
          previousValue: 3.8,
          target: 5.0,
        },
        delaiMoyen: {
          value: 2.4,
          unit: 'jours',
          trend: -14,
          previousValue: 2.8,
          target: 2.0,
        },
        conformiteSLA: {
          value: 94,
          unit: '%',
          trend: 2,
          previousValue: 92,
          target: 95,
        },
      },

      // Compteurs temps réel
      counters: {
        validationsJour: 23,
        blocages: 5,
        risquesCritiques: 3,
        decisionsEnAttente: 8,
        alertesActives: 12,
      },

      // Répartition par bureau
      bureaux: [
        { code: 'BF', name: 'Bureau Finances', score: 94, charge: 72, blocages: 1 },
        { code: 'BCG', name: 'Bureau Comptabilité', score: 87, charge: 85, blocages: 2 },
        { code: 'BJA', name: 'Bureau Juridique', score: 82, charge: 68, blocages: 1 },
        { code: 'BOP', name: 'Bureau Opérations', score: 78, charge: 95, blocages: 4 },
        { code: 'BRH', name: 'Bureau RH', score: 91, charge: 55, blocages: 0 },
      ],

      // Tendances mensuelles
      trends: [
        { month: 'Juil', demandes: 180, validations: 160, rejets: 20 },
        { month: 'Août', demandes: 195, validations: 172, rejets: 23 },
        { month: 'Sept', demandes: 210, validations: 185, rejets: 25 },
        { month: 'Oct', demandes: 225, validations: 198, rejets: 27 },
        { month: 'Nov', demandes: 235, validations: 207, rejets: 28 },
        { month: 'Déc', demandes: 247, validations: 220, rejets: 27 },
      ],
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

