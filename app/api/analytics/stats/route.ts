import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/analytics/stats
 * 
 * Récupère les statistiques complètes du module Analytics
 */
export async function GET(request: NextRequest) {
  try {
    // Simuler des données stats (à remplacer par vraies données BDD)
    const stats = {
      total: 42,
      active: 35,
      expired: 4,
      revoked: 2,
      suspended: 1,
      expiringSoon: 8,
      totalUsage: 127,
      byBureau: [
        { bureau: 'BTP', bureauCode: 'BTP', count: 12, score: 94 },
        { bureau: 'DG', bureauCode: 'DG', count: 10, score: 88 },
        { bureau: 'DAF', bureauCode: 'DAF', count: 8, score: 85 },
        { bureau: 'BJ', bureauCode: 'BJ', count: 7, score: 82 },
        { bureau: 'DSI', bureauCode: 'DSI', count: 5, score: 78 },
      ],
      byType: [
        { type: 'Approbation paiements', count: 18 },
        { type: 'Validation contrats', count: 12 },
        { type: 'Gestion RH', count: 7 },
        { type: 'Achats', count: 5 },
      ],
      recentActivity: [
        {
          id: 'act-1',
          delegationId: 'DEL-001',
          delegationType: 'Paiement',
          agentName: 'Thomas Martin',
          action: 'created',
          actorName: 'Marie Dubois',
          details: 'Nouvelle délégation créée',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'act-2',
          delegationId: 'DEL-002',
          delegationType: 'Contrat',
          agentName: 'Sophie Laurent',
          action: 'used',
          actorName: 'Pierre Bernard',
          details: 'Validation effectuée',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 'act-3',
          delegationId: 'DEL-003',
          delegationType: 'RH',
          agentName: 'Jean Moreau',
          action: 'extended',
          actorName: 'Claire Petit',
          details: 'Prolongation de 30 jours',
          createdAt: new Date(Date.now() - 10800000).toISOString(),
        },
        {
          id: 'act-4',
          delegationId: 'DEL-004',
          delegationType: 'Achats',
          agentName: 'Luc Simon',
          action: 'suspended',
          actorName: 'Anne Rousseau',
          details: 'Suspension temporaire',
          createdAt: new Date(Date.now() - 14400000).toISOString(),
        },
        {
          id: 'act-5',
          delegationId: 'DEL-005',
          delegationType: 'Paiement',
          agentName: 'Marc Vincent',
          action: 'revoked',
          actorName: 'Julie Lambert',
          details: 'Révocation définitive',
          createdAt: new Date(Date.now() - 18000000).toISOString(),
        },
      ],
      ts: new Date().toISOString(),
    };

    return NextResponse.json(stats, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Erreur GET /api/analytics/stats:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}

