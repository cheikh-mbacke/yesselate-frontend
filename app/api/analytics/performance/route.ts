import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/analytics/performance
 * 
 * Récupère les données de performance des bureaux
 */
export async function GET(request: NextRequest) {
  try {
    const bureauPerformance = [
      {
        bureauCode: 'BTP',
        bureauName: 'Bureau Technique Péage',
        score: 94,
        totalDemands: 45,
        validated: 42,
        pending: 2,
        rejected: 1,
        overdue: 0,
        validationRate: 93,
        avgDelay: 2.1,
        slaCompliance: 98,
        trend: 'up',
        change: 5,
        strengths: ['Rapidité', 'Qualité', 'Conformité SLA'],
        weaknesses: [],
      },
      {
        bureauCode: 'DG',
        bureauName: 'Direction Générale',
        score: 88,
        totalDemands: 38,
        validated: 33,
        pending: 3,
        rejected: 2,
        overdue: 0,
        validationRate: 87,
        avgDelay: 2.5,
        slaCompliance: 95,
        trend: 'stable',
        change: 0,
        strengths: ['Qualité', 'Conformité SLA'],
        weaknesses: ['Délais'],
      },
      {
        bureauCode: 'DAF',
        bureauName: 'Direction Administrative et Financière',
        score: 85,
        totalDemands: 42,
        validated: 36,
        pending: 4,
        rejected: 2,
        overdue: 1,
        validationRate: 86,
        avgDelay: 2.8,
        slaCompliance: 92,
        trend: 'up',
        change: 3,
        strengths: ['Volume', 'Qualité'],
        weaknesses: ['Délais', 'SLA'],
      },
      {
        bureauCode: 'BJ',
        bureauName: 'Bureau Juridique',
        score: 82,
        totalDemands: 28,
        validated: 23,
        pending: 3,
        rejected: 2,
        overdue: 1,
        validationRate: 82,
        avgDelay: 3.2,
        slaCompliance: 88,
        trend: 'down',
        change: -2,
        strengths: ['Qualité'],
        weaknesses: ['Délais', 'SLA', 'Taux validation'],
      },
      {
        bureauCode: 'DSI',
        bureauName: 'Direction des Systèmes d\'Information',
        score: 78,
        totalDemands: 32,
        validated: 25,
        pending: 5,
        rejected: 2,
        overdue: 2,
        validationRate: 78,
        avgDelay: 3.5,
        slaCompliance: 85,
        trend: 'down',
        change: -5,
        strengths: [],
        weaknesses: ['Délais', 'SLA', 'Taux validation', 'Retards'],
      },
    ];

    const summary = {
      totalBureaux: bureauPerformance.length,
      avgScore: Math.round(bureauPerformance.reduce((sum, b) => sum + b.score, 0) / bureauPerformance.length),
      topBureau: bureauPerformance[0],
      weakestBureau: bureauPerformance[bureauPerformance.length - 1],
      totalDemands: bureauPerformance.reduce((sum, b) => sum + b.totalDemands, 0),
      totalValidated: bureauPerformance.reduce((sum, b) => sum + b.validated, 0),
      totalPending: bureauPerformance.reduce((sum, b) => sum + b.pending, 0),
      totalOverdue: bureauPerformance.reduce((sum, b) => sum + b.overdue, 0),
      globalValidationRate: 0,
      globalSLA: 0,
    };

    summary.globalValidationRate = Math.round((summary.totalValidated / summary.totalDemands) * 100);
    summary.globalSLA = Math.round(((summary.totalDemands - summary.totalOverdue) / summary.totalDemands) * 100);

    return NextResponse.json({
      bureaux: bureauPerformance,
      summary,
      ts: new Date().toISOString(),
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Erreur GET /api/analytics/performance:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des performances' },
      { status: 500 }
    );
  }
}

