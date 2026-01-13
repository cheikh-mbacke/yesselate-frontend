import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/alerts/[id]/timeline
 * Récupérer la timeline d'une alerte spécifique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Générer une timeline mockée
    const timeline = [
      {
        id: 'tl-1',
        alertId: id,
        type: 'created',
        userId: 'system',
        userName: 'Système',
        timestamp: new Date(Date.now() - 7200000).toISOString(), // il y a 2h
        data: { severity: 'critical' },
      },
      {
        id: 'tl-2',
        alertId: id,
        type: 'assigned',
        userId: 'user-001',
        userName: 'Jean Dupont',
        timestamp: new Date(Date.now() - 5400000).toISOString(), // il y a 1h30
        data: { assignedTo: 'user-002', note: 'Assignation pour traitement urgent' },
      },
      {
        id: 'tl-3',
        alertId: id,
        type: 'acknowledged',
        userId: 'user-002',
        userName: 'Marie Martin',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // il y a 1h
        data: { note: 'Prise en compte, analyse en cours' },
      },
      {
        id: 'tl-4',
        alertId: id,
        type: 'commented',
        userId: 'user-002',
        userName: 'Marie Martin',
        timestamp: new Date(Date.now() - 1800000).toISOString(), // il y a 30min
        data: { comment: 'Vérification des données nécessaires' },
      },
    ];

    return NextResponse.json({ timeline });
  } catch (error) {
    console.error('Error fetching alert timeline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeline', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/alerts/[id]/comments
 * Ajouter un commentaire à une alerte
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { comment, userId } = body;

    if (!comment || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: comment, userId' },
        { status: 400 }
      );
    }

    // Créer le commentaire
    const newComment = {
      id: `comment-${Date.now()}`,
      alertId: id,
      userId,
      comment,
      createdAt: new Date().toISOString(),
    };

    // Créer une entrée timeline
    const timelineEntry = {
      id: `timeline-${Date.now()}`,
      alertId: id,
      type: 'commented',
      userId,
      timestamp: new Date().toISOString(),
      data: { comment },
    };

    return NextResponse.json({
      success: true,
      comment: newComment,
      timeline: timelineEntry,
      message: 'Comment added successfully',
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
