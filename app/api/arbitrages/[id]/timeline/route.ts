import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/arbitrages/[id]/timeline
 * 
 * Récupère la timeline d'un arbitrage spécifique
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: arbitrageId } = await params;

    // Mock timeline events pour cet arbitrage
    const events = [
      {
        id: `EVT-${arbitrageId}-001`,
        type: 'creation',
        title: 'Arbitrage créé',
        description: 'Arbitrage ouvert suite à un conflit de ressources',
        timestamp: '2026-01-08T09:00:00Z',
        actor: 'Amadou DIOP',
        actorId: 'USER-001',
        actorRole: 'Chef de projet',
      },
      {
        id: `EVT-${arbitrageId}-002`,
        type: 'analyse',
        title: 'Analyse initiale',
        description: 'Évaluation des impacts et des options',
        timestamp: '2026-01-08T14:30:00Z',
        actor: 'Fatou SALL',
        actorId: 'USER-002',
        actorRole: 'Analyste',
      },
      {
        id: `EVT-${arbitrageId}-003`,
        type: 'complement',
        title: 'Documents ajoutés',
        description: 'Ajout des justificatifs budgétaires',
        timestamp: '2026-01-09T10:00:00Z',
        actor: 'Moussa NDIAYE',
        actorId: 'USER-003',
        actorRole: 'Contrôleur financier',
      },
      {
        id: `EVT-${arbitrageId}-004`,
        type: 'escalade',
        title: 'Escalade vers direction',
        description: 'Montant supérieur au seuil de délégation',
        timestamp: '2026-01-09T15:00:00Z',
        actor: 'Système',
        actorId: 'SYSTEM',
        actorRole: 'Automatique',
      },
      {
        id: `EVT-${arbitrageId}-005`,
        type: 'commentaire',
        title: 'Commentaire ajouté',
        description: 'Demande de clarification sur le périmètre',
        timestamp: '2026-01-10T08:00:00Z',
        actor: 'Direction Générale',
        actorId: 'USER-DG',
        actorRole: 'Directeur',
      },
    ];

    return NextResponse.json({
      success: true,
      arbitrageId,
      data: events,
      total: events.length,
    });
  } catch (error) {
    console.error('Erreur récupération timeline arbitrage:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/arbitrages/[id]/timeline
 * 
 * Ajoute un événement à la timeline
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: arbitrageId } = await params;
    const body = await req.json();

    const newEvent = {
      id: `EVT-${arbitrageId}-${Date.now()}`,
      type: body.type || 'commentaire',
      title: body.title || 'Événement',
      description: body.description || '',
      timestamp: new Date().toISOString(),
      actor: body.actor || 'Utilisateur',
      actorId: body.actorId || 'USER-UNKNOWN',
      actorRole: body.actorRole || 'Agent',
    };

    console.log(`Nouvel événement ajouté à l'arbitrage ${arbitrageId}:`, newEvent);

    return NextResponse.json({
      success: true,
      data: newEvent,
    });
  } catch (error) {
    console.error('Erreur ajout événement timeline:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
