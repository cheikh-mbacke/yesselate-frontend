/**
 * POST /api/dashboard/refresh
 * Rafraîchissement manuel des données du Dashboard
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const scope = body.scope || 'all'; // 'all' | 'kpis' | 'risks' | 'actions' | 'decisions'

    // Simuler un rafraîchissement (en prod, revalider le cache, recalculer stats, etc.)
    await new Promise((resolve) => setTimeout(resolve, 800));

    const timestamp = new Date().toISOString();

    // Données rafraîchies selon le scope
    const refreshedData: Record<string, any> = {
      all: {
        kpis: {
          demandes: 247,
          validations: 89,
          blocages: 5,
          budget: 4.2,
        },
        risks: 3,
        actions: 8,
        decisions: 5,
      },
      kpis: {
        demandes: 247,
        validations: 89,
        blocages: 5,
        budget: 4.2,
        tauxValidation: 89,
        delaiMoyen: 2.4,
        conformiteSLA: 94,
        risquesCritiques: 3,
      },
      risks: {
        total: 5,
        critical: 3,
        warning: 2,
        topRisks: [
          { id: 'RISK-001', score: 92, title: 'BC bloqué depuis 5 jours' },
          { id: 'RISK-002', score: 88, title: 'Paiement en retard 3 jours' },
          { id: 'RISK-003', score: 72, title: 'Contrat expire dans 5 jours' },
        ],
      },
      actions: {
        total: 24,
        urgent: 5,
        blocked: 3,
        pending: 16,
      },
      decisions: {
        total: 12,
        pending: 8,
        executed: 4,
      },
    };

    const data = refreshedData[scope] || refreshedData.all;

    return NextResponse.json({
      success: true,
      scope,
      data,
      timestamp,
      message: `Dashboard ${scope === 'all' ? 'complet' : scope} rafraîchi avec succès`,
    });
  } catch (error) {
    console.error('Error refreshing dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to refresh dashboard' },
      { status: 500 }
    );
  }
}

