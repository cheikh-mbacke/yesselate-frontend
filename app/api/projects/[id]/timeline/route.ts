import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Mock events pour un projet spécifique
function getMockEventsForProject(projectId: string) {
  return [
    {
      id: `evt-${projectId}-1`,
      projectId,
      action: 'created',
      actor: 'A. DIALLO',
      actorRole: 'Directeur Général',
      details: `Création du projet ${projectId}`,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: `evt-${projectId}-2`,
      projectId,
      action: 'updated',
      actor: 'B. TRAORE',
      actorRole: 'Chef de projet',
      details: 'Mise à jour du planning',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: `evt-${projectId}-3`,
      projectId,
      action: 'phase_changed',
      actor: 'A. DIALLO',
      actorRole: 'Directeur Général',
      details: 'Passage à la phase suivante',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: `evt-${projectId}-4`,
      projectId,
      action: 'budget_updated',
      actor: 'C. KONE',
      actorRole: 'Contrôleur financier',
      details: 'Mise à jour du budget engagé',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: `evt-${projectId}-5`,
      projectId,
      action: 'stakeholder_added',
      actor: 'B. TRAORE',
      actorRole: 'Chef de projet',
      details: 'Ajout d\'une partie prenante',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

// GET /api/projects/[id]/timeline - Timeline d'un projet
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // En production: récupérer depuis la base de données
    // const events = await db.projectEvents.findMany({ where: { projectId: id } });
    
    const events = getMockEventsForProject(id);
    
    return NextResponse.json({
      projectId: id,
      events,
      total: events.length,
    });
  } catch (error) {
    console.error(`Erreur GET /api/projects/timeline:`, error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la timeline' },
      { status: 500 }
    );
  }
}

