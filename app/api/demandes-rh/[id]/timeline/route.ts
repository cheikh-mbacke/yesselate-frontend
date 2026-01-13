import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Mock events pour une demande spécifique
function getMockEventsForDemande(demandeId: string) {
  return [
    {
      id: `evt-${demandeId}-1`,
      demandeId,
      action: 'created',
      actor: 'B. TRAORE',
      actorRole: 'Agent',
      details: `Demande ${demandeId} créée`,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: `evt-${demandeId}-2`,
      demandeId,
      action: 'submitted',
      actor: 'B. TRAORE',
      actorRole: 'Agent',
      details: 'Demande soumise pour validation',
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: `evt-${demandeId}-3`,
      demandeId,
      action: 'document_added',
      actor: 'B. TRAORE',
      actorRole: 'Agent',
      details: 'Pièce justificative ajoutée',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: `evt-${demandeId}-4`,
      demandeId,
      action: 'reviewed',
      actor: 'C. KONE',
      actorRole: 'Chef de bureau',
      details: 'Demande examinée',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: `evt-${demandeId}-5`,
      demandeId,
      action: 'validated',
      actor: 'A. DIALLO',
      actorRole: 'Directeur Général',
      details: 'Demande validée',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

// GET /api/demandes-rh/[id]/timeline - Timeline d'une demande
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // En production: récupérer depuis la base de données
    // const events = await db.rhEvents.findMany({ where: { demandeId: id } });
    
    const events = getMockEventsForDemande(id);
    
    return NextResponse.json({
      demandeId: id,
      events,
      total: events.length,
    });
  } catch (error) {
    console.error(`Erreur GET /api/demandes-rh/timeline:`, error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la timeline' },
      { status: 500 }
    );
  }
}

