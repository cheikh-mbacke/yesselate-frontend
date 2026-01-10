import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/arbitrages/timeline
 * 
 * Récupère la timeline globale des arbitrages
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type');
    const arbitrageId = searchParams.get('arbitrageId');

    // Mock timeline events
    const events = [
      {
        id: 'EVT-ARB-001',
        type: 'creation',
        title: 'Arbitrage créé',
        description: 'Nouvel arbitrage ouvert sur le projet INFRA-2026',
        arbitrageId: 'ARB-001',
        arbitrageTitle: 'Conflit ressources PROJ-001',
        timestamp: '2026-01-10T09:00:00Z',
        actor: 'Amadou DIOP',
        actorId: 'USER-001',
        criticite: 'haute',
        montant: 25000000,
      },
      {
        id: 'EVT-ARB-002',
        type: 'escalade',
        title: 'Arbitrage escaladé',
        description: 'Escalade vers le comité de direction',
        arbitrageId: 'ARB-002',
        arbitrageTitle: 'Budget dépassé module B',
        timestamp: '2026-01-10T08:30:00Z',
        actor: 'Direction Générale',
        actorId: 'USER-DG',
        criticite: 'critique',
        montant: 150000000,
      },
      {
        id: 'EVT-ARB-003',
        type: 'decision',
        title: 'Arbitrage tranché',
        description: 'Décision prise: réallocation budget vers phase 2',
        arbitrageId: 'ARB-003',
        arbitrageTitle: 'Priorité livraison Q1',
        timestamp: '2026-01-10T07:45:00Z',
        actor: 'Comité projet',
        actorId: 'USER-COMITE',
        criticite: 'moyenne',
        montant: 45000000,
      },
      {
        id: 'EVT-ARB-004',
        type: 'complement',
        title: 'Complément demandé',
        description: 'Demande de justificatifs supplémentaires',
        arbitrageId: 'ARB-004',
        arbitrageTitle: 'Choix fournisseur IT',
        timestamp: '2026-01-09T17:00:00Z',
        actor: 'Bureau Marchés',
        actorId: 'USER-BM',
        criticite: 'normale',
        montant: 80000000,
      },
      {
        id: 'EVT-ARB-005',
        type: 'report',
        title: 'Arbitrage reporté',
        description: 'Report de la décision au prochain comité',
        arbitrageId: 'ARB-005',
        arbitrageTitle: 'Extension périmètre phase 3',
        timestamp: '2026-01-09T14:30:00Z',
        actor: 'Chef de projet',
        actorId: 'USER-CDP',
        criticite: 'haute',
        montant: 200000000,
      },
    ];

    let filtered = events;
    if (type) {
      filtered = events.filter(e => e.type === type);
    }
    if (arbitrageId) {
      filtered = events.filter(e => e.arbitrageId === arbitrageId);
    }

    return NextResponse.json({
      success: true,
      data: filtered.slice(0, limit),
      total: filtered.length,
      summary: {
        creations: events.filter(e => e.type === 'creation').length,
        escalades: events.filter(e => e.type === 'escalade').length,
        decisions: events.filter(e => e.type === 'decision').length,
        complements: events.filter(e => e.type === 'complement').length,
        reports: events.filter(e => e.type === 'report').length,
      }
    });
  } catch (error) {
    console.error('Erreur récupération timeline arbitrages:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

