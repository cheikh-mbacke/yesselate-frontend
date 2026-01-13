import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/delegations/timeline
 * 
 * Récupère la timeline globale des délégations
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type');

    // Mock timeline events
    const events = [
      {
        id: 'EVT-001',
        type: 'creation',
        title: 'Délégation créée',
        description: 'Nouvelle délégation de validation budget créée',
        delegationId: 'DEL-001',
        delegationTitle: 'Validation budget PROJ-001',
        timestamp: '2026-01-10T09:00:00Z',
        actor: 'Amadou DIOP',
        actorId: 'USER-001'
      },
      {
        id: 'EVT-002',
        type: 'approval',
        title: 'Délégation approuvée',
        description: 'Délégation approuvée par le supérieur hiérarchique',
        delegationId: 'DEL-002',
        delegationTitle: 'Signature contrats',
        timestamp: '2026-01-10T08:30:00Z',
        actor: 'Direction',
        actorId: 'USER-DG'
      },
      {
        id: 'EVT-003',
        type: 'use',
        title: 'Délégation utilisée',
        description: 'La délégation a été utilisée pour valider une dépense',
        delegationId: 'DEL-003',
        delegationTitle: 'Validation dépenses < 500k',
        timestamp: '2026-01-10T07:45:00Z',
        actor: 'Fatou SALL',
        actorId: 'USER-002'
      },
      {
        id: 'EVT-004',
        type: 'revocation',
        title: 'Délégation révoquée',
        description: 'Délégation révoquée suite à changement de poste',
        delegationId: 'DEL-004',
        delegationTitle: 'Validation RH',
        timestamp: '2026-01-09T17:00:00Z',
        actor: 'DRH',
        actorId: 'USER-DRH'
      },
      {
        id: 'EVT-005',
        type: 'extension',
        title: 'Délégation prolongée',
        description: 'Durée de délégation prolongée de 30 jours',
        delegationId: 'DEL-005',
        delegationTitle: 'Signature marchés publics',
        timestamp: '2026-01-09T14:30:00Z',
        actor: 'Direction Générale',
        actorId: 'USER-DG'
      }
    ];

    let filtered = events;
    if (type) {
      filtered = events.filter(e => e.type === type);
    }

    return NextResponse.json({
      success: true,
      data: filtered.slice(0, limit),
      total: filtered.length,
      summary: {
        creations: events.filter(e => e.type === 'creation').length,
        approvals: events.filter(e => e.type === 'approval').length,
        uses: events.filter(e => e.type === 'use').length,
        revocations: events.filter(e => e.type === 'revocation').length,
        extensions: events.filter(e => e.type === 'extension').length
      }
    });
  } catch (error) {
    console.error('Erreur récupération timeline:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
