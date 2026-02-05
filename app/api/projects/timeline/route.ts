import { NextRequest, NextResponse } from 'next/server';

// Simuler une timeline d'événements
const mockEvents = [
  {
    id: 'evt-1',
    projectId: 'PRJ-001',
    action: 'created',
    actor: 'A. DIALLO',
    actorRole: 'Directeur Général',
    details: 'Création du projet',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'evt-2',
    projectId: 'PRJ-001',
    action: 'updated',
    actor: 'B. TRAORE',
    actorRole: 'Chef de projet',
    details: 'Mise à jour du budget planifié',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'evt-3',
    projectId: 'PRJ-002',
    action: 'blocked',
    actor: 'C. KONE',
    actorRole: 'Responsable technique',
    details: 'Projet bloqué en attente validation',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'evt-4',
    projectId: 'PRJ-001',
    action: 'phase_changed',
    actor: 'A. DIALLO',
    actorRole: 'Directeur Général',
    details: 'Passage en phase exécution',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'evt-5',
    projectId: 'PRJ-003',
    action: 'created',
    actor: 'B. TRAORE',
    actorRole: 'Chef de projet',
    details: 'Nouveau projet de fournitures',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// GET /api/projects/timeline - Timeline globale
export async function GET(request: NextRequest) {
  try {
    // En production: récupérer depuis la base de données
    // const events = await db.projectEvents.findMany({ ... });
    
    return NextResponse.json({
      events: mockEvents,
      total: mockEvents.length,
    });
  } catch (error) {
    console.error('Erreur GET /api/projects/timeline:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la timeline' },
      { status: 500 }
    );
  }
}

