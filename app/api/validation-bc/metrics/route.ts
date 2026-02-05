// API Route: GET /api/validation-bc/metrics
// Métriques avancées et KPIs

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const metrics = {
      // Temps de traitement moyen
      avgProcessingTime: {
        bc: 2.5, // jours
        facture: 1.8,
        avenant: 3.2,
      },
      
      // Taux de validation
      validationRate: {
        overall: 83.4, // %
        byService: {
          achats: 85.2,
          finance: 88.1,
          juridique: 75.3,
        },
      },
      
      // Charge de travail
      workload: {
        current: 45,
        capacity: 100,
        utilizationRate: 45, // %
      },
      
      // Tendances
      trends: {
        volumeChange: -5.2, // % variation vs semaine précédente
        processingTimeChange: +12.3,
        validationRateChange: -2.1,
      },
      
      // Alertes
      alerts: {
        overdue: 8,
        highValue: 3,
        pendingLongTime: 12,
      },
      
      // Performance par utilisateur
      topValidators: [
        { name: 'A. DIALLO', validated: 45, avgTime: 1.2 },
        { name: 'M. KANE', validated: 38, avgTime: 1.8 },
        { name: 'B. SOW', validated: 32, avgTime: 2.1 },
      ],
      
      ts: new Date().toISOString(),
    };

    console.log('[validation-bc/metrics] Loaded metrics');

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('[validation-bc/metrics] Error:', error);
    return NextResponse.json({ error: 'Failed to load metrics' }, { status: 500 });
  }
}

