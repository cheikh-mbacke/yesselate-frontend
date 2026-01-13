import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/delegations/[id]/timeline
 * 
 * Récupère l'historique complet d'une délégation spécifique
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Ajouter authentification quand le système auth sera configuré
    // const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    // }

    const { id: delegationId } = await params;

    // Simuler des événements (à remplacer par vraies données BDD)
    const events = [
      {
        id: 'evt-1',
        delegationId,
        delegationCode: delegationId,
        eventType: 'created',
        actorId: 'user-1',
        actorName: 'Jean Dupont',
        actorRole: 'Directeur',
        summary: 'Délégation créée',
        details: 'Création initiale de la délégation',
        metadata: {
          bureau: 'BMO',
          type: 'Validation',
        },
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        previousHash: null,
        hash: 'hash-' + Math.random().toString(36).substring(7),
      },
      {
        id: 'evt-2',
        delegationId,
        delegationCode: delegationId,
        eventType: 'updated',
        actorId: 'user-1',
        actorName: 'Jean Dupont',
        actorRole: 'Directeur',
        summary: 'Délégation modifiée',
        details: 'Modification du plafond',
        metadata: {
          oldMaxAmount: 5000000,
          newMaxAmount: 10000000,
        },
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        previousHash: 'hash-prev',
        hash: 'hash-' + Math.random().toString(36).substring(7),
      },
      {
        id: 'evt-3',
        delegationId,
        delegationCode: delegationId,
        eventType: 'used',
        actorId: 'user-2',
        actorName: 'Marie Martin',
        actorRole: 'Agent',
        summary: 'Délégation utilisée',
        details: 'Validation d\'un paiement',
        metadata: {
          action: 'APPROVE_PAYMENT',
          amount: 3000000,
        },
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        previousHash: 'hash-prev2',
        hash: 'hash-' + Math.random().toString(36).substring(7),
      },
    ];

    return NextResponse.json({
      events,
      delegationId,
      ts: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur récupération timeline:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

